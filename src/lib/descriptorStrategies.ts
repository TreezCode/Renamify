import type { AssetImage } from '@/types'

export type StrategyId =
  | 'datetime'
  | 'date-only'
  | 'num-2'
  | 'num-3'
  | 'num-4'
  | 'alpha-lower'

export interface DescriptorStrategy {
  id: StrategyId
  label: string
  description: string
  example: string
  compute: (image: AssetImage, indexInGroup: number) => string
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

function formatDatetime(ms: number): string {
  const d = new Date(ms)
  const year = d.getFullYear()
  const mon = MONTHS[d.getMonth()]
  const day = d.getDate()
  const h24 = d.getHours()
  const h12 = h24 % 12 || 12
  const min = d.getMinutes().toString().padStart(2, '0')
  const ampm = h24 >= 12 ? 'pm' : 'am'
  return `${year}-${mon}-${day}-${h12}-${min}${ampm}`
}

function formatDateOnly(ms: number): string {
  const d = new Date(ms)
  const year = d.getFullYear()
  const mon = MONTHS[d.getMonth()]
  const day = d.getDate()
  return `${year}-${mon}-${day}`
}

export const DESCRIPTOR_STRATEGIES: DescriptorStrategy[] = [
  {
    id: 'datetime',
    label: 'Date & Time',
    description: 'File date and time — e.g. 2024-jul-15-2-43pm',
    example: '2024-jul-15-2-43pm',
    compute: (image) => formatDatetime(image.file.lastModified),
  },
  {
    id: 'date-only',
    label: 'Date Only',
    description: 'File date without time — e.g. 2024-jul-15',
    example: '2024-jul-15',
    compute: (image) => formatDateOnly(image.file.lastModified),
  },
  {
    id: 'num-2',
    label: 'Numbers (01, 02, 03…)',
    description: 'Sequential 2-digit numbers by position in group',
    example: '01',
    compute: (_, i) => (i + 1).toString().padStart(2, '0'),
  },
  {
    id: 'num-3',
    label: 'Numbers (001, 002, 003…)',
    description: 'Sequential 3-digit numbers by position in group',
    example: '001',
    compute: (_, i) => (i + 1).toString().padStart(3, '0'),
  },
  {
    id: 'num-4',
    label: 'Numbers (0001, 0002, 0003…)',
    description: 'Sequential 4-digit numbers by position in group',
    example: '0001',
    compute: (_, i) => (i + 1).toString().padStart(4, '0'),
  },
  {
    id: 'alpha-lower',
    label: 'Letters (a, b, c…)',
    description: 'Sequential lowercase letters by position in group',
    example: 'a',
    compute: (_, i) => String.fromCharCode(97 + i),
  },
]

export function getStrategyById(id: string): DescriptorStrategy | undefined {
  return DESCRIPTOR_STRATEGIES.find((s) => s.id === id)
}

/**
 * Returns strategies ordered for the active preset.
 * Everyday: date-based first, then numeric.
 * eCommerce: sequential first, then date-based.
 */
export function getStrategiesForPreset(presetId: string): DescriptorStrategy[] {
  const order: StrategyId[] = presetId === 'everyday'
    ? ['datetime', 'date-only', 'num-2', 'num-3', 'num-4', 'alpha-lower']
    : ['num-2', 'num-3', 'num-4', 'alpha-lower', 'datetime', 'date-only']
  return order
    .map((id) => DESCRIPTOR_STRATEGIES.find((s) => s.id === id))
    .filter((s): s is DescriptorStrategy => s !== undefined)
}
