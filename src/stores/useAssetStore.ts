import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AssetStore, AssetImage, ResolvedFilename, ToastType, CurrentProject, ProjectImageMeta } from '@/types'
import { getPresetById, type PlatformPresetId } from '@/lib/platformPresets'
import { clearSession, markSessionCleared } from '@/lib/idb-session'
import { generateFilename, humanizeFilename, isFilenameComplete, getFileExtension } from '@/lib/filename'
import { MAX_FREE_IMAGES } from '@/lib/constants'
import { getStrategyById, type StrategyId } from '@/lib/descriptorStrategies'
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
      inboxCollapsed: false,
      uploadZoneCollapsed: false,
      selectedImageIds: [],
      lastSelectedId: null,
      toasts: [],
      confirmDialog: null,
      currentProject: null,
      pendingProjectMeta: null,
      activePlatformPreset: 'generic' as PlatformPresetId,
      aiConsentGiven: false,
      aiRequestCount: 0,
      humanReadable: false,

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
            altText: savedMeta?.altText ?? null,
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

  applyDescriptorStrategy: (imageIds: string[], strategyId: StrategyId) => {
    const { images } = get()
    const strategy = getStrategyById(strategyId)
    if (!strategy) return

    // Group target images by their SKU so we can handle each group independently
    const targetImages = images.filter((img) => imageIds.includes(img.id))
    const skuGroups = new Map<string | null, AssetImage[]>()
    for (const img of targetImages) {
      const key = img.sku ?? null
      if (!skuGroups.has(key)) skuGroups.set(key, [])
      skuGroups.get(key)!.push(img)
    }

    // Compute collision-safe descriptor values per group
    const updates = new Map<string, string>() // imageId → customDescriptor value

    for (const [sku, groupImages] of skuGroups) {
      const allGroupImages = images.filter((img) => (img.sku ?? null) === sku)

      // Seed reserved set with descriptors already used by images NOT in this operation
      const reserved = new Set<string>(
        allGroupImages
          .filter((img) => !imageIds.includes(img.id))
          .map((img) => img.customDescriptor)
          .filter((v): v is string => !!v)
      )

      for (const img of groupImages) {
        const idx = allGroupImages.findIndex((gi) => gi.id === img.id)
        let value = strategy.compute(img, idx)

        if (reserved.has(value)) {
          let suffix = 2
          while (reserved.has(`${value}-${suffix}`)) suffix++
          value = `${value}-${suffix}`
        }
        reserved.add(value)
        updates.set(img.id, value)
      }
    }

    set((state) => ({
      images: state.images.map((img) =>
        updates.has(img.id)
          ? { ...img, descriptor: 'custom', customDescriptor: updates.get(img.id)! }
          : img
      ),
    }))
  },

  setImageDescriptor: (imageId: string, descriptor: string) => {
    const { images } = get()
    const normalizedDescriptor = descriptor || null

    // Delegate to applyDescriptorStrategy when a strategy id is selected (e.g. 'num-2', 'datetime')
    const strategy = getStrategyById(normalizedDescriptor ?? '')
    if (strategy) {
      const targetImage = images.find((img) => img.id === imageId)
      if (!targetImage) return
      const groupIds = images
        .filter((img) => (img.sku ?? null) === (targetImage.sku ?? null))
        .map((img) => img.id)
      get().applyDescriptorStrategy(groupIds, strategy.id)
      return
    }

    // Regular named descriptor or custom
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId
          ? {
              ...img,
              descriptor: normalizedDescriptor,
              customDescriptor: normalizedDescriptor === 'custom' ? img.customDescriptor : null,
            }
          : img
      ),
    }))
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

  setImageAltText: (imageId: string, altText: string) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId ? { ...img, altText } : img
      ),
    }))
  },

  setAiConsentGiven: () => {
    set({ aiConsentGiven: true })
  },

  incrementAiRequestCount: () => {
    set((state) => ({ aiRequestCount: state.aiRequestCount + 1 }))
  },

  setActivePlatformPreset: (id: PlatformPresetId) => {
    set({ activePlatformPreset: id })
  },

  restoreSession: (images: AssetImage[], currentProject: CurrentProject | null) => {
    set({ images, currentProject, pendingProjectMeta: null, selectedImageIds: [] })
  },

  renameCurrentSession: (name: string) => {
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, name } : { id: '', name },
    }))
  },

  setHumanReadable: (value: boolean) => set({ humanReadable: value }),

  getResolvedFilenames: (): ResolvedFilename[] => {
    const { images, activePlatformPreset, humanReadable } = get()
    const preset = getPresetById(activePlatformPreset)
    const applyHuman = humanReadable && activePlatformPreset === 'everyday'
    const skuCounters = new Map<string, number>()
    const positionMap = new Map<string, number>()
    images.forEach((img) => {
      if (img.sku) {
        const count = (skuCounters.get(img.sku) ?? 0) + 1
        skuCounters.set(img.sku, count)
        positionMap.set(img.id, count)
      }
    })
    return images.map((img) => {
      const sku = img.sku ?? ''
      const descriptor = img.descriptor === 'custom'
        ? (img.customDescriptor ?? '')
        : (img.descriptor ?? '')

      const position = positionMap.get(img.id) ?? 1
      const raw = generateFilename(sku, descriptor, img.originalName, preset, position)
      const resolved = applyHuman && raw ? humanizeFilename(sku, descriptor, img.originalName) : raw
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

  toggleInboxCollapsed: () => {
    set((state) => ({ inboxCollapsed: !state.inboxCollapsed }))
  },

  collapseAllSkus: () => {
    const allSkus = Array.from(
      new Set(get().images.filter((img) => img.sku).map((img) => img.sku as string))
    )
    set({ collapsedSkus: allSkus, inboxCollapsed: true })
  },

  expandAllSkus: () => {
    set({ collapsedSkus: [], inboxCollapsed: false })
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
    set({ selectedImageIds: [], lastSelectedId: null })
  },

  selectImages: (ids: string[]) => {
    set({ selectedImageIds: ids })
  },

  setLastSelectedId: (id: string | null) => {
    set({ lastSelectedId: id })
  },

  applyDescriptorToGroup: (imageId: string) => {
    const { images } = get()
    const source = images.find((img) => img.id === imageId)
    if (!source?.sku || !source.descriptor) return
    const descriptor    = source.descriptor
    const customText    = source.customDescriptor ?? null
    let appliedCount = 0
    set((state) => ({
      images: state.images.map((img) => {
        if (img.sku !== source.sku || img.id === imageId || img.descriptor) return img
        appliedCount++
        return { ...img, descriptor, customDescriptor: descriptor === 'custom' ? customText : img.customDescriptor }
      }),
    }))
    const { addToast } = get()
    const label = descriptor === 'custom' ? (customText || 'custom') : descriptor
    addToast('success', `Applied "${label}" to ${appliedCount} image${appliedCount !== 1 ? 's' : ''} in ${source.sku}`)
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
        activePlatformPreset: state.activePlatformPreset,
        aiConsentGiven: state.aiConsentGiven,
      }),
    }
  )
)
