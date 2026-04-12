import exifr from 'exifr'
import { RAW_FILE_EXTENSIONS } from './constants'

/**
 * Check if a file is a RAW image format
 */
export function isRawFile(filename: string): boolean {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0]
  return ext ? (RAW_FILE_EXTENSIONS as readonly string[]).includes(ext) : false
}

/**
 * Extract embedded JPEG preview from RAW file
 * Most RAW files contain a full-size JPEG preview that we can use
 */
export async function extractRawPreview(file: File): Promise<string | null> {
  try {
    // Try method 1: Use exifr.thumbnail() to extract the thumbnail directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thumbnailBuffer = await (exifr as any).thumbnail(file)
    
    if (thumbnailBuffer && thumbnailBuffer instanceof Uint8Array) {
      // Convert buffer to Blob then to URL
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Uint8Array.buffer works at runtime despite type mismatch
      const blob = new Blob([thumbnailBuffer.buffer], { type: 'image/jpeg' })
      const blobUrl = URL.createObjectURL(blob)
      return blobUrl
    }
    
    // Method 2: Try thumbnailUrl() as fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thumbnailUrl = await (exifr as any).thumbnailUrl(file)
    if (thumbnailUrl) {
      return thumbnailUrl
    }
    
    console.warn('No thumbnail found in RAW file:', file.name)
    return null
  } catch (error) {
    console.warn('Failed to extract RAW preview from', file.name, ':', error)
    // Return null to indicate preview extraction failed - will fall back to placeholder
    return null
  }
}

/**
 * Generate a placeholder thumbnail for RAW files when extraction fails
 */
export function generateRawPlaceholder(filename: string): string {
  // Create a simple SVG placeholder with camera icon
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#1a1a2e"/>
      <g transform="translate(200, 200)">
        <path d="M-60,-40 L-60,60 L60,60 L60,-40 Z M-40,-60 L-20,-80 L20,-80 L40,-60 Z M0,-20 A30,30 0 1,1 0,40 A30,30 0 1,1 0,-20 Z" 
          fill="none" stroke="#915eff" stroke-width="3"/>
        <circle cx="0" cy="10" r="20" fill="none" stroke="#00d4ff" stroke-width="2"/>
        <circle cx="30" cy="-30" r="5" fill="#915eff"/>
      </g>
      <text x="200" y="330" text-anchor="middle" fill="#00d4ff" font-family="system-ui" font-size="14" font-weight="600">
        RAW FILE
      </text>
      <text x="200" y="350" text-anchor="middle" fill="#915eff" font-family="system-ui" font-size="12">
        ${filename.length > 30 ? filename.substring(0, 27) + '...' : filename}
      </text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Get file extension including the dot
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/)
  return match ? match[0] : ''
}
