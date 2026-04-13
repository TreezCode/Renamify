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
 * RAW files contain embedded JPEGs - this scans for JPEG markers and extracts them
 * Based on proven legacy implementation that manually parses binary data
 */
export async function extractRawPreview(file: File): Promise<string | null> {
  try {
    // Read file as binary data
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    
    // Find all embedded JPEGs by scanning for JPEG markers
    const jpegs: { start: number; end: number; size: number }[] = []
    
    for (let i = 0; i < bytes.length - 1; i++) {
      // JPEG start marker: 0xFFD8
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xD8) {
        const startIndex = i
        
        // Find corresponding end marker: 0xFFD9
        for (let j = startIndex + 2; j < bytes.length - 1; j++) {
          if (bytes[j] === 0xFF && bytes[j + 1] === 0xD9) {
            const endIndex = j + 2
            jpegs.push({
              start: startIndex,
              end: endIndex,
              size: endIndex - startIndex,
            })
            i = endIndex // Skip past this JPEG to find the next one
            break
          }
        }
      }
    }
    
    if (jpegs.length === 0) {
      return null
    }
    
    // Smart JPEG selection strategy:
    // 1. Filter out tiny thumbnails (< 10KB)
    // 2. Prefer medium-sized preview JPEGs (100KB - 800KB) - these are usually the preview
    // 3. Avoid huge full-size JPEGs (> 1MB) - these are often the full camera JPEG
    // 4. If no medium-sized found, fall back to largest available
    
    const MIN_PREVIEW_SIZE = 10 * 1024 // 10KB
    const IDEAL_PREVIEW_MIN = 100 * 1024 // 100KB
    const IDEAL_PREVIEW_MAX = 800 * 1024 // 800KB
    
    const validJpegs = jpegs.filter((j) => j.size >= MIN_PREVIEW_SIZE)
    
    if (validJpegs.length === 0) {
      return null
    }
    
    // Try to find ideal preview size first
    const idealPreviews = validJpegs.filter(
      (j) => j.size >= IDEAL_PREVIEW_MIN && j.size <= IDEAL_PREVIEW_MAX
    )
    
    // Prioritize ideal preview size, otherwise use largest available
    const sortedJpegs = idealPreviews.length > 0
      ? idealPreviews.sort((a, b) => b.size - a.size) // Largest ideal preview
      : validJpegs.sort((a, b) => b.size - a.size) // Fallback to largest overall
    
    // Recursively try each JPEG until we find one that loads successfully
    const tryJpeg = async (index: number): Promise<string> => {
      if (index >= sortedJpegs.length) {
        throw new Error('No valid embedded JPEGs found')
      }
      
      const jpeg = sortedJpegs[index]
      const jpegBytes = bytes.slice(jpeg.start, jpeg.end)
      const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
      const blobUrl = URL.createObjectURL(blob)
      
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        
        img.onload = () => {
          const width = img.naturalWidth
          const height = img.naturalHeight
          
          // Validate dimensions - reject tiny thumbnails or suspiciously large images
          const MIN_DIMENSION = 200 // Reject images smaller than 200px
          const MAX_DIMENSION = 4000 // Reject images larger than 4000px (likely full-size)
          
          if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
            URL.revokeObjectURL(blobUrl)
            tryJpeg(index + 1)
              .then(resolve)
              .catch(reject)
            return
          }
          
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            URL.revokeObjectURL(blobUrl)
            tryJpeg(index + 1)
              .then(resolve)
              .catch(reject)
            return
          }
          
          resolve(blobUrl)
          // Note: We don't revoke the URL here because it's used for display
        }
        
        img.onerror = async () => {
          URL.revokeObjectURL(blobUrl)
          
          // This JPEG failed, try the next one
          try {
            const result = await tryJpeg(index + 1)
            resolve(result)
          } catch (err) {
            reject(err)
          }
        }
        
        img.src = blobUrl
      })
    }
    
    return await tryJpeg(0)
  } catch {
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
