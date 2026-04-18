'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check, AlertCircle, Package, Download } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { useAssetStore } from '@/stores/useAssetStore'
import { AssetImage } from '@/types'
import { exportAsZip } from '@/lib/export'
import { generateFilename } from '@/lib/filename'
import { buildCsvManifest } from '@/lib/csv'
import { getPresetById } from '@/lib/platformPresets'

interface WorkspaceGroupHeaderProps {
  sku: string
  images: AssetImage[]
  isPro: boolean
}

export function WorkspaceGroupHeader({ sku, images }: WorkspaceGroupHeaderProps) {
  const collapsedSkus      = useAssetStore((s) => s.collapsedSkus)
  const toggleSkuCollapse  = useAssetStore((s) => s.toggleSkuCollapse)
  const activePlatformPreset = useAssetStore((s) => s.activePlatformPreset)
  const addToast           = useAssetStore((s) => s.addToast)
  const selectedImageIds   = useAssetStore((s) => s.selectedImageIds)
  const selectImages       = useAssetStore((s) => s.selectImages)
  const setLastSelectedId  = useAssetStore((s) => s.setLastSelectedId)

  const [isExporting,    setIsExporting]    = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const preset     = getPresetById(activePlatformPreset)
  const isCollapsed = collapsedSkus.includes(sku)

  const configuredCount = images.filter((img) => {
    if (!img.descriptor) return false
    if (img.descriptor === 'custom') return !!(img.customDescriptor?.trim())
    return true
  }).length
  const allConfigured   = configuredCount === images.length && images.length > 0
  const someConfigured  = configuredCount > 0
  const progressPercent = images.length > 0 ? (configuredCount / images.length) * 100 : 0

  const groupImageIds     = images.map((img) => img.id)
  const allGroupSelected  = groupImageIds.length > 0 && groupImageIds.every((id) => selectedImageIds.includes(id))
  const someGroupSelected = groupImageIds.some((id) => selectedImageIds.includes(id))

  const handleGroupSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (allGroupSelected) {
      selectImages(selectedImageIds.filter((id) => !groupImageIds.includes(id)))
    } else {
      selectImages(Array.from(new Set([...selectedImageIds, ...groupImageIds])))
      setLastSelectedId(groupImageIds[groupImageIds.length - 1])
    }
  }

  const { setNodeRef, isOver } = useDroppable({ id: `sku-${sku}` })

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!allConfigured || isExporting) return
    setIsExporting(true)
    setExportProgress(0)
    try {
      const positionMap = new Map<string, number>()
      images.forEach((img, idx) => positionMap.set(img.id, idx + 1))
      const manifest = buildCsvManifest(images, preset)
      await exportAsZip(
        images,
        (image) => {
          const descriptor = image.descriptor === 'custom'
            ? (image.customDescriptor || '')
            : (image.descriptor || '')
          return generateFilename(sku, descriptor, image.originalName, preset, positionMap.get(image.id) ?? 1)
        },
        (percent) => setExportProgress(Math.round(percent)),
        manifest,
        `${sku}.zip`,
      )
      addToast('success', `${sku} exported successfully!`, 4000)
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Export failed', 6000)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const statusIcon = allConfigured
    ? <Check className="w-3.5 h-3.5 text-success" />
    : someConfigured
      ? <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
      : <Package className="w-3.5 h-3.5 text-gray-400" />

  const borderColor = allConfigured
    ? 'border-l-success/60'
    : someConfigured
      ? 'border-l-yellow-500/60'
      : 'border-l-treez-purple/40'

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 px-3 py-2.5 border-b border-white/8
        border-l-2 ${borderColor}
        bg-white/4 backdrop-blur-sm
        transition-all duration-200 group/header
        ${isOver ? 'bg-treez-cyan/8 border-l-treez-cyan' : ''}
        ${isOver ? 'shadow-inner shadow-treez-cyan/10' : ''}`}
    >
      {/* Group select-all checkbox */}
      <button
        onClick={handleGroupSelect}
        aria-label={allGroupSelected ? `Deselect all in ${sku}` : `Select all in ${sku}`}
        className={`w-4 h-4 shrink-0 rounded border transition-all flex items-center justify-center
          ${allGroupSelected
            ? 'bg-treez-purple border-treez-purple'
            : someGroupSelected
              ? 'bg-treez-purple/40 border-treez-purple/60'
              : 'border-white/20 hover:border-treez-purple/50 bg-transparent'}`}
      >
        {allGroupSelected && <Check className="w-2.5 h-2.5 text-white" />}
        {someGroupSelected && !allGroupSelected && <div className="w-2 h-0.5 bg-white rounded" />}
      </button>

      {/* Status icon */}
      <div className={`p-1 rounded shrink-0 ${
        allConfigured ? 'bg-success/15' : someConfigured ? 'bg-yellow-500/15' : 'bg-treez-purple/15'
      }`}>
        {statusIcon}
      </div>

      {/* SKU name + progress */}
      <button
        onClick={() => toggleSkuCollapse(sku)}
        className="flex-1 min-w-0 flex items-center gap-3 text-left group/btn"
      >
        <span className="text-sm font-semibold text-white truncate">{sku}</span>
        <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 text-[10px] font-medium shrink-0">
          {images.length}
        </span>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2 max-w-[140px]">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%`, transition: 'width 0.3s ease-out' }}
              className={`h-full ${allConfigured
                ? 'bg-linear-to-r from-success to-success/80'
                : 'bg-linear-to-r from-treez-purple to-treez-cyan'}`}
            />
          </div>
          <span className="text-[10px] text-gray-500 shrink-0 tabular-nums">
            {configuredCount}/{images.length}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover/btn:text-treez-cyan transition-colors duration-200" />
        </motion.div>
      </button>

      {/* Drop hint */}
      {isOver && (
        <span className="text-[10px] text-treez-cyan font-medium shrink-0 animate-pulse">
          Drop to assign
        </span>
      )}

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={!allConfigured || isExporting}
        title={allConfigured ? `Export ${sku} as ZIP` : 'Configure all images first'}
        className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium
          transition-all duration-200
          ${allConfigured && !isExporting
            ? 'bg-linear-to-r from-treez-purple to-treez-pink text-white hover:scale-105 hover:shadow-lg hover:shadow-treez-purple/30'
            : 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed'}`}
      >
        {isExporting ? (
          <>
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{exportProgress}%</span>
          </>
        ) : (
          <>
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </>
        )}
      </button>
    </div>
  )
}
