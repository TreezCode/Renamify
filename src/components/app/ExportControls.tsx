'use client'

import { useState } from 'react'
import { Download, Table2, FileDown, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAssetStore } from '@/stores/useAssetStore'
import { useSubscription } from '@/hooks/useSubscription'
import { exportAsZip } from '@/lib/export'
import { generateFilename } from '@/lib/filename'
import { buildCsvManifest, downloadCsv, getCsvFilename } from '@/lib/csv'
import { getPresetById } from '@/lib/platformPresets'
import { Button } from '@/components/ui/Button'
import { UpgradeModal } from '@/components/ui/UpgradeModal'
import { NamingPreviewTable } from '@/components/app/NamingPreviewTable'

export function ExportControls() {
  const images = useAssetStore((state) => state.images)
  const isExportReady = useAssetStore((state) => state.isExportReady)
  const addToast = useAssetStore((state) => state.addToast)

  const activePlatformPreset = useAssetStore((state) => state.activePlatformPreset)
  const { isPro } = useSubscription()

  const preset = getPresetById(activePlatformPreset)

  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const totalImages = images.length
  const readyImages = images.filter((img) => {
    if (!img.sku) return false
    if (img.descriptor === 'custom') return !!(img.customDescriptor?.trim())
    return !!(img.descriptor)
  })
  const completeImages = readyImages.length
  const allReady = isExportReady()
  const canExport = completeImages > 0

  const handleExport = async () => {
    if (!canExport || isExporting) return

    const skuCounters = new Map<string, number>()
    const positionMap = new Map<string, number>()
    images.forEach((img) => {
      if (img.sku) {
        const count = (skuCounters.get(img.sku) ?? 0) + 1
        skuCounters.set(img.sku, count)
        positionMap.set(img.id, count)
      }
    })

    const filenameMap = new Map<string, number>()
    const duplicates: string[] = []

    // Only check ready images for duplicates
    readyImages.forEach((image) => {
      const sku = image.sku || ''
      const descriptor = image.descriptor === 'custom'
        ? (image.customDescriptor || '')
        : (image.descriptor || '')
      const filename = generateFilename(sku, descriptor, image.originalName, preset, positionMap.get(image.id) ?? 1)

      const count = filenameMap.get(filename) || 0
      filenameMap.set(filename, count + 1)

      if (count === 1) {
        duplicates.push(filename)
      }
    })

    if (duplicates.length > 0) {
      addToast(
        'error',
        `Duplicate filenames detected! ${duplicates.length} filename(s) appear multiple times. Each image needs a unique SKU + descriptor combination.`,
        8000
      )
      return
    }

    setIsExporting(true)
    setProgress(0)
    setShowSuccess(false)

    try {
      const uniqueSkus = Array.from(new Set(readyImages.map((img) => img.sku).filter(Boolean))) as string[]
      const zipName = uniqueSkus.length === 1
        ? `${uniqueSkus[0]}.zip`
        : uniqueSkus.length <= 4
          ? `${uniqueSkus.join('_')}.zip`
          : `renamerly-export.zip`

      const manifest = buildCsvManifest(readyImages, preset)
      await exportAsZip(
        readyImages,
        (image) => {
          const sku = image.sku || ''
          const descriptor = image.descriptor === 'custom'
            ? (image.customDescriptor || '')
            : (image.descriptor || '')
          return generateFilename(sku, descriptor, image.originalName, preset, positionMap.get(image.id) ?? 1)
        },
        (percent) => setProgress(Math.round(percent)),
        manifest,
        zipName
      )

      addToast('success', `${readyImages.length} image(s) exported successfully!`, 4000)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Export failed. Please try again.'
      addToast('error', errorMessage, 6000)
    } finally {
      setIsExporting(false)
      setProgress(0)
    }
  }

  function handleExportCsv() {
    if (!isPro) {
      setShowUpgrade(true)
      return
    }
    const csv = buildCsvManifest(images, preset)
    downloadCsv(csv, getCsvFilename())
    addToast('success', 'Manifest CSV downloaded!', 4000)
  }

  if (totalImages === 0) {
    return null
  }

  return (
    <>
    <div className={`bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden transition-colors duration-500
      ${allReady ? 'border border-success/20' : 'border border-white/10'}`}>

      {/* Main row */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">

        {/* Status indicator */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`shrink-0 w-2 h-2 rounded-full ${
            allReady ? 'bg-success' : completeImages > 0 ? 'bg-yellow-400' : 'bg-gray-600'
          }`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white leading-tight">
              {allReady
                ? 'All images ready'
                : `${completeImages} of ${totalImages} ready`}
            </p>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
              {allReady
                ? 'manifest.csv bundled in ZIP'
                : completeImages > 0
                  ? 'Partial export available'
                  : 'Assign SKUs and descriptors to export'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPreview(true)}
            className="gap-1.5 text-xs px-3 py-1.5 h-8"
          >
            <Table2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          {isPro ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              className="gap-1.5 text-xs px-3 py-1.5 h-8"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUpgrade(true)}
              className="gap-1.5 text-xs px-3 py-1.5 h-8 opacity-50"
            >
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className="gap-1.5 text-xs px-4 py-1.5 h-8"
          >
            {isExporting ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {progress}%
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                {allReady
                  ? <><span className="hidden sm:inline">Export All</span><span className="sm:hidden">Export</span></>
                  : <>Export Ready ({completeImages})</>}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {isExporting && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-0.5 bg-linear-to-r from-treez-purple to-treez-cyan"
        />
      )}

      {/* Success flash */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-2 bg-success/10 border-t border-success/20 text-success text-xs font-medium text-center"
        >
          Export complete! Check your downloads.
        </motion.div>
      )}
    </div>

    <NamingPreviewTable open={showPreview} onClose={() => setShowPreview(false)} />

    {showUpgrade && (
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="csv"
      />
    )}
    </>
  )
}
