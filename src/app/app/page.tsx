'use client'

import { useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAssetStore } from '@/stores/useAssetStore'
import { useProject } from '@/hooks/useProjects'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { DragDropProvider } from '@/components/app/DragDropProvider'
import { AppToolbar } from '@/components/app/AppToolbar'
import { UploadZone } from '@/components/app/UploadZone'
import { SelectionActionBar } from '@/components/app/SelectionActionBar'
import { QuickSKUInput } from '@/components/app/QuickSKUInput'
import { SKUProductGroup } from '@/components/app/SKUProductGroup'
import { ImagesWithoutSKU } from '@/components/app/ImagesWithoutSKU'
import { ExportControls } from '@/components/app/ExportControls'
import { OnboardingModal } from '@/components/app/OnboardingModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

function ProjectLoader() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project') ?? undefined
  const isNew = searchParams.get('new') === '1'

  const loadProject = useAssetStore((state) => state.loadProject)
  const reset = useAssetStore((state) => state.reset)
  const addToast = useAssetStore((state) => state.addToast)
  const { project } = useProject(projectId)

  // ?new=1 — clear any existing session and start fresh
  useEffect(() => {
    if (isNew) {
      reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew])

  // ?project=ID — reset then load the saved project with its metadata
  useEffect(() => {
    if (!project) return
    const imageMetadata = Array.isArray(project.images) ? project.images as never : []
    reset()
    loadProject({ id: project.id, name: project.name, imageMetadata })
    addToast('success', `"${project.name}" loaded — re-upload your files to restore SKU assignments`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  return null
}

export default function AppPage() {
  const images = useAssetStore((state) => state.images)
  const uploadZoneCollapsed = useAssetStore((state) => state.uploadZoneCollapsed)
  const setUploadZoneCollapsed = useAssetStore((state) => state.setUploadZoneCollapsed)
  const confirmDialog = useAssetStore((state) => state.confirmDialog)
  const closeConfirmDialog = useAssetStore((state) => state.closeConfirmDialog)

  // Auto-group images by SKU
  const groupedBySku = useMemo(() => {
    const groups: Record<string, typeof images> = {}
    images.forEach((img) => {
      if (img.sku) {
        if (!groups[img.sku]) {
          groups[img.sku] = []
        }
        groups[img.sku].push(img)
      }
    })
    return groups
  }, [images])

  const imagesWithoutSku = images.filter((img) => !img.sku)
  const hasImages = images.length > 0
  const skus = Object.keys(groupedBySku).sort()

  useEffect(() => {
    if (hasImages && !uploadZoneCollapsed) {
      setUploadZoneCollapsed(true)
    }
  }, [hasImages, uploadZoneCollapsed, setUploadZoneCollapsed])

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <ProjectLoader />
      </Suspense>
      <OnboardingModal />
      
      {/* Global Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={closeConfirmDialog}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          cancelLabel={confirmDialog.cancelLabel}
          variant={confirmDialog.variant}
        />
      )}
      
      <main className="min-h-screen pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 lg:px-8">
        <DragDropProvider>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-4 sm:space-y-5"
          >
          {/* Toolbar */}
          <AppToolbar />

          {/* Selection Action Bar - Sticky when images are selected */}
          <SelectionActionBar />

          {/* Upload Zone - Compact after upload */}
          <UploadZone />

          {/* Quick SKU Input - Prominent when images exist */}
          {hasImages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <QuickSKUInput />
            </motion.div>
          )}

          {/* Images Without SKU - Inbox/Staging Area at TOP (Enterprise Pattern) */}
          <ImagesWithoutSKU images={imagesWithoutSku} />

          {/* SKU Product Groups - Organized items below inbox (Enterprise Pattern) */}
          {skus.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 sm:space-y-5"
            >
              {skus.map((sku, index) => (
                <motion.div
                  key={sku}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <SKUProductGroup sku={sku} images={groupedBySku[sku]} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Export Controls - Always at Bottom */}
          {hasImages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ExportControls />
            </motion.div>
          )}
          </motion.div>
        </DragDropProvider>
      </main>
    </ErrorBoundary>
  )
}
