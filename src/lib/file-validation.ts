const FILE_SIGNATURES = {
  jpeg: [
    [0xff, 0xd8, 0xff, 0xe0],
    [0xff, 0xd8, 0xff, 0xe1],
    [0xff, 0xd8, 0xff, 0xe2],
    [0xff, 0xd8, 0xff, 0xe3],
    [0xff, 0xd8, 0xff, 0xe8],
  ],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  webp: [[0x52, 0x49, 0x46, 0x46]],
  // RAW formats - use TIFF-based signatures (most RAW files are TIFF variants)
  tiff: [
    [0x49, 0x49, 0x2a, 0x00], // Little-endian TIFF (used by CR2, NEF, ARW, DNG, etc.)
    [0x4d, 0x4d, 0x00, 0x2a], // Big-endian TIFF
  ],
} as const

// File size limits - increased for professional RAW file support
// RAW file sizes: Entry-level (20-30MB), Professional (30-60MB), High-end (60-100MB), Medium format (100-150MB+)
export const MAX_FILE_SIZE = 150 * 1024 * 1024      // 150MB - supports high-end and medium format cameras
export const MAX_TOTAL_SIZE = 1024 * 1024 * 1024    // 1GB - allows ~6-7 professional RAW files per session
export const MIN_FILE_SIZE = 100

export interface FileValidationResult {
  isValid: boolean
  error?: string
  fileType?: string
}

async function readFileHeader(file: File, bytes: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      resolve(new Uint8Array(arrayBuffer))
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file.slice(0, bytes))
  })
}

function matchesSignature(header: Uint8Array, signature: readonly number[]): boolean {
  if (header.length < signature.length) return false
  return signature.every((byte, index) => header[index] === byte)
}

async function validateFileSignature(file: File): Promise<string | null> {
  try {
    const header = await readFileHeader(file, 8)

    for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
      for (const signature of signatures) {
        if (matchesSignature(header, signature)) {
          if (type === 'webp') {
            const webpHeader = await readFileHeader(file, 12)
            const webpSignature = [0x57, 0x45, 0x42, 0x50]
            if (matchesSignature(webpHeader.slice(8), webpSignature)) {
              return 'webp'
            }
          } else {
            return type
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error('File signature validation error:', error)
    return null
  }
}

export async function validateImageFile(
  file: File,
  currentTotalSize: number = 0
): Promise<FileValidationResult> {
  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is too small (minimum ${MIN_FILE_SIZE} bytes)`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
    return {
      isValid: false,
      error: `Adding "${file.name}" would exceed total size limit of ${MAX_TOTAL_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check if it's a RAW file by extension
  const { isRawFile } = await import('./rawProcessor')
  const isRaw = isRawFile(file.name)
  
  if (isRaw) {
    // RAW files are valid - signature check is less reliable for RAW
    return {
      isValid: true,
      fileType: 'raw',
    }
  }

  const detectedType = await validateFileSignature(file)

  if (!detectedType) {
    return {
      isValid: false,
      error: `File "${file.name}" is not a valid image (JPEG, PNG, GIF, WebP, or RAW)`,
    }
  }

  const expectedTypes: Record<string, string[]> = {
    'image/jpeg': ['jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
  }

  const expected = expectedTypes[file.type]
  if (expected && !expected.includes(detectedType)) {
    return {
      isValid: false,
      error: `File "${file.name}" has mismatched extension (claims ${file.type}, but is ${detectedType})`,
    }
  }

  return {
    isValid: true,
    fileType: detectedType,
  }
}

export function getTotalFileSize(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
