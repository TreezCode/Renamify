export interface AssetImage {
  id: string
  file: File
  thumbnail: string
  originalName: string
  extension: string
  isRaw: boolean
  sku: string | null
  descriptor: string | null
  customDescriptor: string | null
}

export interface ResolvedFilename {
  imageId: string
  original: string
  resolved: string
  isComplete: boolean
}

export interface DescriptorOption {
  value: string
  label: string
  disabled: boolean
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

export interface CurrentProject {
  id: string
  name: string
}

export interface ProjectImageMeta {
  id: string
  originalName: string
  extension: string
  isRaw: boolean
  sku: string | null
  descriptor: string | null
  customDescriptor: string | null
}

export interface AssetStore {
  images: AssetImage[]
  hasSeenOnboarding: boolean
  collapsedSkus: string[]
  uploadZoneCollapsed: boolean
  selectedImageIds: string[]
  toasts: Toast[]
  confirmDialog: ConfirmDialogState | null
  currentProject: CurrentProject | null
  pendingProjectMeta: ProjectImageMeta[] | null

  addImages: (files: File[], limit?: number) => Promise<void>
  removeImage: (id: string) => void
  setImageSku: (imageId: string, sku: string) => void
  setBulkSku: (imageIds: string[], sku: string) => void
  setImageDescriptor: (imageId: string, descriptor: string) => void
  setCustomDescriptor: (imageId: string, text: string) => void
  reset: () => void

  setCurrentProject: (project: CurrentProject | null) => void
  loadProject: (project: { id: string; name: string; imageMetadata?: ProjectImageMeta[] }) => void
  renameCurrentSession: (name: string) => void
  clearPendingProjectMeta: () => void

  setOnboardingComplete: () => void
  toggleSkuCollapse: (sku: string) => void
  setUploadZoneCollapsed: (collapsed: boolean) => void
  toggleImageSelection: (imageId: string) => void
  selectAllImages: () => void
  selectAllInContext: (sku?: string) => void
  clearSelection: () => void

  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void

  showConfirmDialog: (config: Omit<ConfirmDialogState, 'open'>) => void
  closeConfirmDialog: () => void

  getResolvedFilenames: () => ResolvedFilename[]
  getImagesBySku: (sku: string) => AssetImage[]
  getUsedDescriptors: (sku: string) => string[]
  isExportReady: () => boolean
}
