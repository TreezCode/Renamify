export type PlatformPresetId = 'generic' | 'amazon' | 'dated' | 'shopify' | 'etsy' | 'woocommerce' | 'everyday'

export interface PlatformPresetFormat {
  sku: string
  descriptor: string
  extension: string
  position: number
  date: string
}

export interface PresetVocabulary {
  sku: string
  descriptor: string
  group: string
  changeSku: string
  assignSku: string
  noSku: string
  autoFill: string
}

const DEFAULT_VOCABULARY: PresetVocabulary = {
  sku: 'SKU',
  descriptor: 'Descriptor',
  group: 'SKU Group',
  changeSku: 'Change SKU',
  assignSku: 'Assign SKU',
  noSku: 'Assign to a SKU',
  autoFill: 'Auto-fill Descriptors',
}

export interface PlatformPreset {
  id: PlatformPresetId
  label: string
  description: string
  example: string
  proOnly: boolean
  format: (params: PlatformPresetFormat) => string
  vocabulary?: Partial<PresetVocabulary>
}

export function getVocabulary(preset: PlatformPreset | null | undefined): PresetVocabulary {
  return { ...DEFAULT_VOCABULARY, ...(preset?.vocabulary ?? {}) }
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'everyday',
    label: 'Everyday Photos',
    description: 'Collection · date and time',
    example: 'beach-trip-2024-jul-15-2-43pm.jpg',
    proOnly: false,
    vocabulary: {
      sku: 'Collection',
      descriptor: 'Date & Time',
      group: 'Collection',
      changeSku: 'Change Collection',
      assignSku: 'Assign Collection',
      noSku: 'Assign to a Collection',
      autoFill: 'Fill Date & Time',
    },
    format: ({ sku, descriptor, extension }) =>
      descriptor ? `${sku}-${descriptor}${extension}` : '',
  },
  {
    id: 'generic',
    label: 'Generic',
    description: 'SKU · descriptor (standard)',
    example: 'nike-001-front.jpg',
    proOnly: false,
    format: ({ sku, descriptor, extension }) =>
      descriptor ? `${sku}-${descriptor}${extension}` : '',
  },
  {
    id: 'amazon',
    label: 'Amazon',
    description: 'ASIN_VIEW_POSITION uppercase format',
    example: 'B01N5IB20Q_MAIN_1.jpg',
    proOnly: false,
    format: ({ sku, descriptor, extension, position }) => {
      if (!descriptor) return ''
      const s = sku.replace(/-/g, '_').toUpperCase()
      const d = descriptor.replace(/-/g, '_').toUpperCase()
      return `${s}_${d}_${position}${extension}`
    },
  },
  {
    id: 'dated',
    label: 'Dated',
    description: 'YYYYMMDD date prefix',
    example: '20240116-nike-001-front.jpg',
    proOnly: false,
    format: ({ sku, descriptor, extension, date }) =>
      descriptor ? `${date}-${sku}-${descriptor}${extension}` : '',
  },
  {
    id: 'shopify',
    label: 'Shopify',
    description: 'handle-variant-position format',
    example: 'nike-001-front-1.jpg',
    proOnly: true,
    format: ({ sku, descriptor, extension, position }) =>
      descriptor ? `${sku}-${descriptor}-${position}${extension}` : '',
  },
  {
    id: 'etsy',
    label: 'Etsy',
    description: 'shop-product-descriptor-number format',
    example: 'mytshop-vintage-tee-front-1.jpg',
    proOnly: true,
    format: ({ sku, descriptor, extension, position }) =>
      descriptor ? `${sku}-${descriptor}-${position}${extension}` : '',
  },
  {
    id: 'woocommerce',
    label: 'WooCommerce',
    description: 'product_slug_attribute format',
    example: 'nike_001_front.jpg',
    proOnly: true,
    format: ({ sku, descriptor, extension }) => {
      if (!descriptor) return ''
      const s = sku.replace(/-/g, '_')
      const d = descriptor.replace(/-/g, '_')
      return `${s}_${d}${extension}`
    },
  },
]

export const FREE_PRESET_IDS: PlatformPresetId[] = ['everyday', 'generic', 'amazon', 'dated']
export const PRO_PRESET_IDS: PlatformPresetId[] = ['shopify', 'etsy', 'woocommerce']

export function getPresetById(id: PlatformPresetId): PlatformPreset {
  return PLATFORM_PRESETS.find((p) => p.id === id) ?? PLATFORM_PRESETS[0]
}
