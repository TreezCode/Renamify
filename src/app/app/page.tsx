'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssetStore } from '@/stores/useAssetStore'
import { useProject } from '@/hooks/useProjects'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { DragDropProvider } from '@/components/app/DragDropProvider'
import { AppToolbar } from '@/components/app/AppToolbar'
import { UploadZone } from '@/components/app/UploadZone'
import { SelectionActionBar } from '@/components/app/SelectionActionBar'
import { WorkspaceTable } from '@/components/app/WorkspaceTable'
import { ExportControls } from '@/components/app/ExportControls'
import { OnboardingModal } from '@/components/app/OnboardingModal'
import { SessionPersistProvider } from '@/components/app/SessionPersistProvider'
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
  const selectedImageIds = useAssetStore((state) => state.selectedImageIds)
  const uploadZoneCollapsed = useAssetStore((state) => state.uploadZoneCollapsed)
  const setUploadZoneCollapsed = useAssetStore((state) => state.setUploadZoneCollapsed)
  const confirmDialog = useAssetStore((state) => state.confirmDialog)
  const closeConfirmDialog = useAssetStore((state) => state.closeConfirmDialog)

  const hasSelection = selectedImageIds.length > 0

  const hasImages = images.length > 0

  useEffect(() => {
    if (hasImages && !uploadZoneCollapsed) {
      setUploadZoneCollapsed(true)
    }
  }, [hasImages, uploadZoneCollapsed, setUploadZoneCollapsed])

  const [keyboardOffset, setKeyboardOffset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const gap = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardOffset(Math.max(0, gap))
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

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
      
      <main className="min-h-screen pt-6 pb-28 sm:pt-8 sm:pb-28 px-4 sm:px-6 lg:px-8">
        <DragDropProvider>
          <SessionPersistProvider />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-4 sm:space-y-5"
          >
          {/* Toolbar */}
          <AppToolbar />

          {/* Upload Zone - never moves regardless of selection state */}
          <UploadZone />

          {/* Selection Bar — fixed at bottom, slides in/out with selection state */}
          <AnimatePresence initial={false}>
            {hasImages && hasSelection && (
              <motion.div
                key="selection-bar"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="fixed left-4 right-4 lg:left-20 z-40"
                style={{ bottom: `${keyboardOffset + 16}px` }}
              >
                <SelectionActionBar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unified virtual workspace table */}
          {hasImages && <WorkspaceTable />}

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
