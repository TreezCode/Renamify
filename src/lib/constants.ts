export const APP_NAME = 'Renamerly'

export const MAX_FREE_IMAGES = 20

export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
} as const

// RAW file formats (preview extraction only)
export const RAW_FILE_EXTENSIONS = [
  '.cr2',  // Canon
  '.cr3',  // Canon (newer)
  '.nef',  // Nikon
  '.arw',  // Sony
  '.dng',  // Adobe Digital Negative
  '.raf',  // Fujifilm
  '.orf',  // Olympus
  '.rw2',  // Panasonic
  '.pef',  // Pentax
  '.srw',  // Samsung
] as const

export const ACCEPTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  ...RAW_FILE_EXTENSIONS
]

export const FILENAME_REGEX = /[^a-z0-9-]/g

export const DEFAULT_DESCRIPTORS = [
  { value: 'front', label: 'Front' },
  { value: 'diag1', label: 'Diagonal 1' },
  { value: 'diag2', label: 'Diagonal 2' },
  { value: 'rear', label: 'Rear' },
  { value: 'zoom1', label: 'Zoom 1' },
  { value: 'zoom2', label: 'Zoom 2' },
  { value: 'folded', label: 'Folded' },
  { value: 'tape', label: 'Tape' },
  { value: 'tag', label: 'Tag' },
  { value: 'thickness', label: 'Thickness' },
  { value: 'topdown', label: 'Top Down' },
  { value: 'custom', label: 'Custom' },
] as const

// Auto-iteration presets for sequential naming
export const ITERATION_PRESETS = [
  { value: 'num-2', label: 'Numbers (01, 02, 03)', format: (n: number) => n.toString().padStart(2, '0') },
  { value: 'num-3', label: 'Numbers (001, 002, 003)', format: (n: number) => n.toString().padStart(3, '0') },
  { value: 'num-4', label: 'Numbers (0001, 0002, 0003)', format: (n: number) => n.toString().padStart(4, '0') },
  { value: 'alpha-lower', label: 'Letters (a, b, c)', format: (n: number) => String.fromCharCode(96 + n) },
] as const

export const THUMBNAIL_MAX_SIZE = 200
