import { FILENAME_REGEX } from '@/lib/constants'
import type { PlatformPreset } from '@/lib/platformPresets'

const MAX_FILENAME_LENGTH = 100

/**
 * Sanitises a value for use directly in a filename (lowercases everything).
 * Use for descriptors and the filename-generation step.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return ''

  let sanitized = input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(FILENAME_REGEX, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (sanitized.length > MAX_FILENAME_LENGTH) {
    sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH).replace(/-+$/, '')
  }

  return sanitized
}

/**
 * Sanitises a SKU/collection name for storage and display.
 * Preserves the original casing — generateFilename lowercases when building the filename.
 */
export function sanitizeSkuDisplay(input: string): string {
  if (!input || typeof input !== 'string') return ''

  let sanitized = input
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (sanitized.length > MAX_FILENAME_LENGTH) {
    sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH).replace(/-+$/, '')
  }

  return sanitized
}

function humanizeDescriptor(descriptor: string): string {
  const dtMatch = descriptor.match(/^(\d{4})-([a-z]{3})-(\d{1,2})-(\d{1,2})-(\d{2})(am|pm)$/)
  if (dtMatch) {
    const [, year, mon, day, hour, min, ampm] = dtMatch
    return `${mon[0].toUpperCase() + mon.slice(1)} ${parseInt(day)} ${year} ${hour}:${min}${ampm}`
  }
  const dMatch = descriptor.match(/^(\d{4})-([a-z]{3})-(\d{1,2})$/)
  if (dMatch) {
    const [, year, mon, day] = dMatch
    return `${mon[0].toUpperCase() + mon.slice(1)} ${parseInt(day)} ${year}`
  }
  return descriptor.replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase())
}

/**
 * Converts a SKU + descriptor pair into a structured human-readable filename.
 * e.g. "beach-trip" + "2024-jul-15-2-43pm" -> "Beach Trip - Jul 15 2024 2:43pm.jpg"
 * Signature takes parts separately so datetime parsing has access to the raw descriptor.
 */
export function humanizeFilename(sku: string, descriptor: string, originalFilename: string): string {
  const extension = getFileExtension(originalFilename)
  const skuReadable = sku
    .replace(/-/g, ' ')
    .replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase())
  if (!descriptor) return skuReadable + extension
  return `${skuReadable} - ${humanizeDescriptor(descriptor)}${extension}`
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === filename.length - 1) return ''
  return filename.slice(lastDot).toLowerCase()
}

export function generateFilename(
  sku: string,
  descriptor: string,
  originalFilename: string,
  preset?: PlatformPreset | null,
  position = 1
): string {
  const sanitizedSku = sanitizeString(sku)
  const sanitizedDescriptor = sanitizeString(descriptor)
  const extension = getFileExtension(originalFilename)

  if (!sanitizedSku) return ''

  if (preset && preset.id !== 'generic') {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return preset.format({ sku: sanitizedSku, descriptor: sanitizedDescriptor, extension, position, date })
  }

  if (!sanitizedDescriptor) return ''
  return `${sanitizedSku}-${sanitizedDescriptor}${extension}`
}

export function isFilenameComplete(sku: string, descriptor: string): boolean {
  return sanitizeString(sku).length > 0 && sanitizeString(descriptor).length > 0
}
