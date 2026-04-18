import JSZip from 'jszip'
import { AssetImage } from '@/types'

export async function exportAsZip(
  images: AssetImage[],
  getFilename: (image: AssetImage) => string,
  onProgress?: (percent: number) => void,
  manifest?: string,
  zipName?: string
): Promise<void> {
  if (!images || images.length === 0) {
    throw new Error('No images to export')
  }

  try {
    const zip = new JSZip()

    // Bundle manifest CSV alongside the images when provided
    if (manifest) {
      zip.file('renamerly-manifest.csv', manifest)
    }

    // Add files to zip with error handling for each image
    for (const image of images) {
      try {
        const filename = getFilename(image)
        if (!filename || filename.trim() === '') {
          throw new Error(`Invalid filename for image: ${image.originalName}`)
        }
        
        const arrayBuffer = await image.file.arrayBuffer()
        zip.file(filename, arrayBuffer)
      } catch (error) {
        console.error(`Failed to process image ${image.originalName}:`, error)
        throw new Error(`Failed to process "${image.originalName}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Generate zip with progress tracking
    let blob: Blob
    try {
      blob = await zip.generateAsync(
        { type: 'blob' },
        (metadata) => {
          onProgress?.(metadata.percent)
        }
      )
    } catch (error) {
      throw new Error(`Failed to generate ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Download the file
    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = zipName ?? 'renamerly-export.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Failed to download ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } catch (error) {
    // Re-throw with context if it's not already our custom error
    if (error instanceof Error && error.message.startsWith('Failed to')) {
      throw error
    }
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
