import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AssetStore, AssetImage, ResolvedFilename, ToastType, CurrentProject, ProjectImageMeta } from '@/types'
import { clearSession, markSessionCleared } from '@/lib/idb-session'
import { generateFilename, isFilenameComplete, getFileExtension } from '@/lib/filename'
import { MAX_FREE_IMAGES, ITERATION_PRESETS } from '@/lib/constants'
import { validateImageFile, getTotalFileSize } from '@/lib/file-validation'
import { cleanupThumbnails } from '@/lib/memory-monitor'

/**
 * Create preview URL for image display
 * Simply uses the original file - CSS object-cover handles sizing perfectly
 */
function generateThumbnail(file: File): Promise<string> {
  // Use the original file directly - no compression, no quality loss
  // CSS object-cover handles all sizing and aspect ratios
  return Promise.resolve(URL.createObjectURL(file))
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      images: [],
      hasSeenOnboarding: false,
      collapsedSkus: [],
      uploadZoneCollapsed: false,
      selectedImageIds: [],
      toasts: [],
      confirmDialog: null,
      currentProject: null,
      pendingProjectMeta: null,

  addImages: async (files: File[], limit: number = MAX_FREE_IMAGES) => {
    const { images } = get()
    const remaining = limit === Infinity ? files.length : Math.max(0, limit - images.length)
    const filesToAdd = files.slice(0, remaining)

    const currentTotalSize = getTotalFileSize(images.map((img) => img.file))
    const validatedFiles: File[] = []
    const errors: string[] = []
    const duplicates: string[] = []

    for (const file of filesToAdd) {
      const isDuplicate = images.some(
        (img) => img.file.name === file.name && img.file.size === file.size
      )
      
      if (isDuplicate) {
        duplicates.push(file.name)
        continue
      }

      const validation = await validateImageFile(file, currentTotalSize)
      if (validation.isValid) {
        validatedFiles.push(file)
      } else {
        errors.push(validation.error || `Failed to validate ${file.name}`)
      }
    }

    if (duplicates.length > 0) {
      const duplicateMessage = duplicates.length === 1
        ? `"${duplicates[0]}" has already been uploaded`
        : `${duplicates.length} duplicate file(s) skipped`
      
      get().addToast('warning', duplicateMessage, 4000)
    }

    if (errors.length > 0) {
      const errorMessage = errors.length === 1
        ? errors[0]
        : `${errors.length} file(s) failed validation`
      
      get().addToast('error', errorMessage, 6000)
    }

    if (validatedFiles.length === 0) {
      return
    }

    try {
      const { isRawFile, extractRawPreview, generateRawPlaceholder } = await import('@/lib/rawProcessor')
      
      const { pendingProjectMeta } = get()

      const newImages: AssetImage[] = await Promise.all(
        validatedFiles.map(async (file) => {
          const isRaw = isRawFile(file.name)
          let thumbnail: string
          
          if (isRaw) {
            // Try to extract embedded JPEG preview from RAW file
            const rawPreview = await extractRawPreview(file)
            // If extraction fails, use a styled placeholder instead of trying to generate from RAW
            // (browsers can't render RAW files directly)
            thumbnail = rawPreview || generateRawPlaceholder(file.name)
          } else {
            thumbnail = await generateThumbnail(file)
          }

          // Reconcile with saved project metadata by original filename
          const savedMeta = pendingProjectMeta?.find(
            (m) => m.originalName === file.name
          ) ?? null
          
          return {
            id: crypto.randomUUID(),
            file,
            thumbnail,
            originalName: file.name,
            extension: getFileExtension(file.name),
            isRaw,
            sku: savedMeta?.sku ?? null,
            descriptor: savedMeta?.descriptor ?? null,
            customDescriptor: savedMeta?.customDescriptor ?? null,
          }
        })
      )

      set((state) => ({ images: [...state.images, ...newImages] }))

      if (validatedFiles.length > 0 && errors.length > 0) {
        setTimeout(() => {
          alert(`✅ ${validatedFiles.length} file(s) uploaded successfully\n\n${errors.length} file(s) were rejected due to validation errors.`)
        }, 100)
      }
    } catch (error) {
      console.error('Failed to process images:', error)
      alert('❌ Failed to process images. Please try again.')
    }
  },

  removeImage: (id: string) => {
    const { images } = get()
    const imageToRemove = images.find((img) => img.id === id)
    if (imageToRemove) {
      cleanupThumbnails([imageToRemove])
    }
    set((state) => ({ 
      images: state.images.filter((img) => img.id !== id),
      // Also remove from selection to keep UI in sync
      selectedImageIds: state.selectedImageIds.filter((selectedId) => selectedId !== id)
    }))
  },

  setImageSku: (imageId: string, sku: string) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId
          ? { ...img, sku: sku || null, descriptor: null, customDescriptor: null }
          : img
      ),
    }))
  },

  setBulkSku: (imageIds: string[], sku: string) => {
    set((state) => ({
      images: state.images.map((img) =>
        imageIds.includes(img.id)
          ? { ...img, sku: sku || null, descriptor: null, customDescriptor: null }
          : img
      ),
      selectedImageIds: [], // Clear selection after bulk operation
    }))
  },

  setImageDescriptor: (imageId: string, descriptor: string) => {
    const { images } = get()
    const targetImage = images.find(img => img.id === imageId)
    
    // Normalize empty string to null
    const normalizedDescriptor = descriptor || null
    
    // Check if this is an iteration preset
    const iterationPreset = ITERATION_PRESETS.find(p => p.value === normalizedDescriptor)
    
    if (iterationPreset && targetImage) {
      // Auto-apply iteration to all images in same SKU (or no-SKU if no SKU assigned)
      const targetSku = targetImage.sku
      const skuImages = images.filter(img => img.sku === targetSku)
      
      set((state) => ({
        images: state.images.map((img) => {
          if (img.sku === targetSku) {
            // Find index within SKU group
            const index = skuImages.findIndex(si => si.id === img.id)
            const iteratedValue = iterationPreset.format(index + 1)
            
            return {
              ...img,
              descriptor: 'custom', // Store as custom so it displays the formatted value
              customDescriptor: iteratedValue
            }
          }
          return img
        }),
      }))
    } else {
      // Regular descriptor assignment
      set((state) => ({
        images: state.images.map((img) =>
          img.id === imageId
            ? { 
                ...img, 
                descriptor: normalizedDescriptor, 
                customDescriptor: normalizedDescriptor === 'custom' ? img.customDescriptor : null 
              }
            : img
        ),
      }))
    }
  },

  setCustomDescriptor: (imageId: string, text: string) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId ? { ...img, customDescriptor: text } : img
      ),
    }))
  },

  reset: () => {
    const { images } = get()
    cleanupThumbnails(images)
    markSessionCleared()  // synchronous — sets localStorage timestamp before any async work
    clearSession()        // async — actually deletes IDB entries (belt-and-suspenders)
    set({ images: [], selectedImageIds: [], currentProject: null, pendingProjectMeta: null })
  },

  setCurrentProject: (project: CurrentProject | null) => {
    set({ currentProject: project })
  },

  loadProject: (project: { id: string; name: string; imageMetadata?: ProjectImageMeta[] }) => {
    set({
      currentProject: { id: project.id, name: project.name },
      pendingProjectMeta: project.imageMetadata ?? null,
    })
  },

  clearPendingProjectMeta: () => {
    set({ pendingProjectMeta: null })
  },

  restoreSession: (images: AssetImage[], currentProject: CurrentProject | null) => {
    set({ images, currentProject, pendingProjectMeta: null, selectedImageIds: [] })
  },

  renameCurrentSession: (name: string) => {
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, name } : { id: '', name },
    }))
  },

  getResolvedFilenames: (): ResolvedFilename[] => {
    const { images } = get()
    return images.map((img) => {
      const sku = img.sku ?? ''
      const descriptor = img.descriptor === 'custom'
        ? (img.customDescriptor ?? '')
        : (img.descriptor ?? '')

      const resolved = generateFilename(sku, descriptor, img.originalName)
      const isComplete = isFilenameComplete(sku, descriptor)

      return {
        imageId: img.id,
        original: img.originalName,
        resolved: resolved || img.originalName,
        isComplete,
      }
    })
  },

  getImagesBySku: (sku: string): AssetImage[] => {
    const { images } = get()
    return images.filter((img) => img.sku === sku)
  },

  getUsedDescriptors: (sku: string): string[] => {
    const { images } = get()
    return images
      .filter((img) => img.sku === sku && img.descriptor !== null)
      .map((img) => {
        if (img.descriptor === 'custom') return img.customDescriptor ?? ''
        return img.descriptor ?? ''
      })
      .filter(Boolean)
  },

  setOnboardingComplete: () => {
    set({ hasSeenOnboarding: true })
  },

  toggleSkuCollapse: (sku: string) => {
    set((state) => ({
      collapsedSkus: state.collapsedSkus.includes(sku)
        ? state.collapsedSkus.filter((s) => s !== sku)
        : [...state.collapsedSkus, sku],
    }))
  },

  setUploadZoneCollapsed: (collapsed: boolean) => {
    set({ uploadZoneCollapsed: collapsed })
  },

  toggleImageSelection: (imageId: string) => {
    const { images, selectedImageIds } = get()
    const clickedImage = images.find((img) => img.id === imageId)
    if (!clickedImage) return

    // If this is the first selection, just add it
    if (selectedImageIds.length === 0) {
      set({ selectedImageIds: [imageId] })
      return
    }

    // Check if we're switching contexts (SKU group vs no-SKU)
    const firstSelectedImage = images.find((img) => img.id === selectedImageIds[0])
    const clickedContext = clickedImage.sku || 'no-sku'
    const selectedContext = firstSelectedImage?.sku || 'no-sku'

    // If switching contexts, clear old selection and start fresh
    if (clickedContext !== selectedContext) {
      set({ selectedImageIds: [imageId] })
      return
    }

    // Same context - toggle normally
    set((state) => ({
      selectedImageIds: state.selectedImageIds.includes(imageId)
        ? state.selectedImageIds.filter((id) => id !== imageId)
        : [...state.selectedImageIds, imageId],
    }))
  },

  selectAllImages: () => {
    const { images } = get()
    set({ selectedImageIds: images.map((img) => img.id) })
  },

  selectAllInContext: (sku?: string) => {
    const { images } = get()
    // If sku is undefined or null, select all images without SKU
    // Otherwise, select all images with that specific SKU
    const contextImages = sku 
      ? images.filter((img) => img.sku === sku)
      : images.filter((img) => !img.sku)
    set({ selectedImageIds: contextImages.map((img) => img.id) })
  },

  clearSelection: () => {
    set({ selectedImageIds: [] })
  },

  addToast: (type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }))
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  showConfirmDialog: (config) => {
    set({ confirmDialog: { ...config, open: true } })
  },

  closeConfirmDialog: () => {
    set({ confirmDialog: null })
  },

  isExportReady: (): boolean => {
    const { images } = get()
    if (images.length === 0) return false
    return images.every((img) => {
      if (!img.sku) return false
      const descriptor = img.descriptor === 'custom'
        ? (img.customDescriptor ?? '')
        : (img.descriptor ?? '')
      return isFilenameComplete(img.sku, descriptor)
    })
  },
    }),
    {
      name: 'renamerly-ui-state',
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    }
  )
)
