'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, Square, Tag, X, Sparkles, Trash2, Users,
} from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { useSubscription } from '@/hooks/useSubscription'
import { AssetImage } from '@/types'
import { getPresetById, getVocabulary } from '@/lib/platformPresets'

interface WorkspaceContextMenuProps {
  x: number
  y: number
  image: AssetImage
  sku: string | null
  onClose: () => void
  onAiAnalyze: () => void
}

const ITEM = `flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-left
  text-gray-300 hover:text-white hover:bg-white/8 rounded-lg transition-colors duration-150 cursor-pointer`

const ITEM_DANGER = `flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-left
  text-error/80 hover:text-error hover:bg-error/10 rounded-lg transition-colors duration-150 cursor-pointer`

const SEPARATOR = <div className="my-1 h-px bg-white/8" />

export function WorkspaceContextMenu({
  x, y, image, sku, onClose, onAiAnalyze,
}: WorkspaceContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  const images               = useAssetStore((s) => s.images)
  const selectedImageIds     = useAssetStore((s) => s.selectedImageIds)
  const toggleImageSelection = useAssetStore((s) => s.toggleImageSelection)
  const setLastSelectedId    = useAssetStore((s) => s.setLastSelectedId)
  const setImageSku          = useAssetStore((s) => s.setImageSku)
  const setBulkSku           = useAssetStore((s) => s.setBulkSku)
  const showConfirmDialog    = useAssetStore((s) => s.showConfirmDialog)
  const addToast             = useAssetStore((s) => s.addToast)
  const activePlatformPreset = useAssetStore((s) => s.activePlatformPreset)
  const { isPro }            = useSubscription()

  const vocab = getVocabulary(getPresetById(activePlatformPreset))

  const isSelected  = selectedImageIds.includes(image.id)
  const isBulk      = isSelected && selectedImageIds.length > 1
  const bulkCount   = selectedImageIds.length
  const canAiAnalyze = isPro && !!sku && !image.isRaw

  const allSkus = Array.from(
    new Set(images.filter((img) => img.sku).map((img) => img.sku as string))
  ).sort()
  const otherSkus = sku
    ? allSkus.filter((s) => s !== sku)
    : allSkus

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const safeX = Math.min(x, window.innerWidth  - 224)
  const safeY = Math.min(y, window.innerHeight - 320)

  const run = (fn: () => void) => { fn(); onClose() }

  const handleSelect = () => run(() => {
    toggleImageSelection(image.id)
    setLastSelectedId(image.id)
  })

  const handleAssignSku = (newSku: string) => run(() => {
    if (isBulk) {
      setBulkSku(selectedImageIds, newSku)
      addToast('success', `${bulkCount} images assigned to ${newSku}`)
    } else {
      setImageSku(image.id, newSku)
      addToast('success', `Assigned to ${newSku}`)
    }
  })

  const handleRemoveSku = () => run(() => {
    if (isBulk) {
      setBulkSku(selectedImageIds, '')
      addToast('success', `${vocab.sku} removed from ${bulkCount} images`)
    } else {
      setImageSku(image.id, '')
      addToast('success', `${vocab.sku} removed`)
    }
  })

  const handleAi = () => run(onAiAnalyze)

  const handleRemove = () => run(() => {
    showConfirmDialog({
      title: 'Remove image?',
      description: `Remove "${image.originalName}" from the workspace?`,
      variant: 'warning',
      confirmLabel: 'Remove',
      onConfirm: () => setImageSku(image.id, ''),
    })
  })

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        key="ctx"
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{    opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.12 }}
        style={{ position: 'fixed', top: safeY, left: safeX, zIndex: 9999, width: 208 }}
        className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/12 rounded-xl shadow-2xl
          shadow-black/60 p-1.5 select-none"
      >
        {/* Image label */}
        <div className="px-3 py-1.5 mb-1 border-b border-white/8">
          <p className="text-[10px] font-medium text-gray-500 truncate">{image.originalName}</p>
          {sku && <p className="text-[10px] text-treez-purple truncate">{sku}</p>}
        </div>

        {/* Select */}
        <button className={ITEM} onClick={handleSelect}>
          {isSelected
            ? <><CheckSquare className="w-3.5 h-3.5 text-treez-purple shrink-0" /><span>Deselect</span></>
            : <><Square       className="w-3.5 h-3.5 text-gray-500  shrink-0" /><span>Select</span></>}
        </button>

        {SEPARATOR}

        {/* Move to group — single or bulk */}
        {otherSkus.length > 0 && (
          <div>
            <p className="px-3 pt-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-600">
              {isBulk ? `Move ${bulkCount} selected to ${vocab.group}` : `Move to ${vocab.group}`}
            </p>
            {otherSkus.map((s) => (
              <button key={s} className={ITEM} onClick={() => handleAssignSku(s)}>
                {isBulk
                  ? <Users className="w-3.5 h-3.5 text-treez-cyan shrink-0" />
                  : <Tag   className="w-3.5 h-3.5 text-gray-500  shrink-0" />}
                <span className="truncate font-medium">{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Remove from group — single or bulk */}
        {sku && (
          <button className={ITEM} onClick={handleRemoveSku}>
            <X className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>{isBulk ? `Remove ${bulkCount} from ${vocab.group}` : `Remove from ${vocab.group}`}</span>
          </button>
        )}

        {SEPARATOR}

        {/* AI Analyze */}
        {canAiAnalyze && (
          <button className={ITEM} onClick={handleAi}>
            <Sparkles className="w-3.5 h-3.5 text-treez-purple shrink-0" />
            <span>AI Suggest {vocab.descriptor}</span>
          </button>
        )}

        {/* Remove from workspace */}
        <button className={ITEM_DANGER} onClick={handleRemove}>
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span>Remove from workspace</span>
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
