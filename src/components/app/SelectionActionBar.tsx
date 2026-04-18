'use client'

import { useState } from 'react'
import { X, Trash2, Tag, XCircle, CheckSquare, Sparkles, Loader2 } from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { sanitizeString } from '@/lib/filename'
import { useSubscription } from '@/hooks/useSubscription'
import { useAiAnalysis } from '@/hooks/useAiAnalysis'
import { AiConsentModal } from '@/components/app/AiConsentModal'

interface SelectionActionBarProps {
  compact?: boolean
}

export function SelectionActionBar({ compact = false }: SelectionActionBarProps) {
  const [showSkuInput, setShowSkuInput] = useState(false)
  const [newSku, setNewSku] = useState('')
  
  const images = useAssetStore((state) => state.images)
  const selectedImageIds = useAssetStore((state) => state.selectedImageIds)
  const clearSelection = useAssetStore((state) => state.clearSelection)
  const selectAllInContext = useAssetStore((state) => state.selectAllInContext)
  const removeImage = useAssetStore((state) => state.removeImage)
  const setImageSku = useAssetStore((state) => state.setImageSku)
  const setBulkSku = useAssetStore((state) => state.setBulkSku)
  const showConfirmDialog = useAssetStore((state) => state.showConfirmDialog)
  const addToast = useAssetStore((state) => state.addToast)

  const aiConsentGiven = useAssetStore((state) => state.aiConsentGiven)
  const setAiConsentGiven = useAssetStore((state) => state.setAiConsentGiven)
  const setImageAltText = useAssetStore((state) => state.setImageAltText)

  const { isPro } = useSubscription()
  const { analyze, isAtLimit, remainingRequests } = useAiAnalysis()

  const [bulkAiLoading, setBulkAiLoading] = useState(false)
  const [showBulkConsentModal, setShowBulkConsentModal] = useState(false)

  const count = selectedImageIds.length

  // Get selected images to determine context
  const selectedImages = images.filter((img) => selectedImageIds.includes(img.id))
  const allHaveSku = selectedImages.every((img) => img.sku)
  const noneHaveSku = selectedImages.every((img) => !img.sku)
  
  // Determine the current selection context (SKU or no-SKU)
  const selectionContext = selectedImages[0]?.sku || null // null means no-SKU section
  
  // Get total images in current context
  const contextImages = selectionContext 
    ? images.filter((img) => img.sku === selectionContext)
    : images.filter((img) => !img.sku)
  const totalInContext = contextImages.length
  const allSelectedInContext = count === totalInContext && totalInContext > 0
  
  // Get existing SKUs for dropdown
  const existingSkus = Array.from(
    new Set(images.filter((img) => img.sku).map((img) => img.sku as string))
  ).sort()

  const handleDelete = () => {
    showConfirmDialog({
      title: 'Delete selected images?',
      description: `${count} image(s) will be permanently removed. This cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: () => {
        selectedImageIds.forEach((id) => removeImage(id))
        addToast('success', `${count} image(s) deleted`)
        clearSelection()
      },
    })
  }

  const handleRemoveSku = () => {
    showConfirmDialog({
      title: 'Remove SKU from selected images?',
      description: `SKU will be removed from ${count} image(s). You can reassign them later.`,
      variant: 'warning',
      confirmLabel: 'Remove SKU',
      onConfirm: () => {
        selectedImageIds.forEach((id) => setImageSku(id, ''))
        addToast('success', `SKU removed from ${count} image(s)`)
        clearSelection()
      },
    })
  }

  const handleAssignSku = (skuValue: string) => {
    const sanitized = sanitizeString(skuValue)
    
    if (!sanitized) {
      addToast('warning', 'Please enter a valid SKU')
      return
    }

    setBulkSku(selectedImageIds, sanitized)
    addToast('success', `SKU "${sanitized}" assigned to ${count} image(s)`)
    setNewSku('')
    setShowSkuInput(false)
    clearSelection()
  }

  const handleQuickAssign = () => {
    handleAssignSku(newSku)
  }

  const eligibleForAi = selectedImages.filter(
    (img) => !img.isRaw && img.sku && img.descriptor && !img.altText
  )

  const runBulkAi = async () => {
    setBulkAiLoading(true)
    let generated = 0
    for (const img of eligibleForAi) {
      if (isAtLimit) break
      const descriptor = img.descriptor === 'custom'
        ? (img.customDescriptor ?? '')
        : (img.descriptor ?? '')
      try {
        const result = await analyze(img.file, { sku: img.sku ?? '', descriptor, mode: 'altText' })
        if (result.altText) {
          setImageAltText(img.id, result.altText.altText)
          generated++
        }
      } catch {
        break
      }
    }
    setBulkAiLoading(false)
    if (generated > 0) addToast('success', `Alt text generated for ${generated} image(s)`)
  }

  const handleBulkAi = () => {
    if (!aiConsentGiven) {
      setShowBulkConsentModal(true)
      return
    }
    runBulkAi()
  }

  return (
    <>
    <div className={compact
      ? showSkuInput
        ? 'px-4 py-2 w-full'
        : 'h-11 flex items-center px-4 w-full'
      : 'bg-treez-purple/95 backdrop-blur-xl border border-treez-purple/50 rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg shadow-treez-purple/20'
    }>

      {showSkuInput ? (
        /* ── SKU INPUT MODE ── two-row layout, works on all screen sizes ── */
        <div className="flex flex-col gap-2">
          {/* Row 1: context label + cancel */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{count}</span>
              </div>
              <span className="text-white font-medium text-sm whitespace-nowrap">
                {noneHaveSku ? 'Assign SKU' : 'Change SKU'} · {count} selected
              </span>
            </div>
            <button
              onClick={() => { setShowSkuInput(false); setNewSku('') }}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10
                transition-colors shrink-0"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2: existing SKU dropdown + new SKU input + Apply */}
          <div className="flex items-center gap-1.5">
            {existingSkus.length > 0 && (
              <>
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) handleAssignSku(e.target.value) }}
                  className="flex-1 min-w-0 px-2 py-2 rounded-lg
                    bg-white/10 border border-white/20
                    text-white text-xs sm:text-sm
                    focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="" disabled className="bg-deep-space">Existing SKU…</option>
                  {existingSkus.map((sku) => (
                    <option key={sku} value={sku} className="bg-deep-space">{sku}</option>
                  ))}
                </select>
                <span className="text-white/40 text-xs shrink-0">or</span>
              </>
            )}
            <input
              type="text"
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAssign()}
              placeholder="New SKU…"
              autoFocus
              className="flex-1 min-w-0 px-2.5 py-2 rounded-lg
                bg-white/10 border border-white/20
                text-white placeholder-white/50 text-xs sm:text-sm
                focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={handleQuickAssign}
              disabled={!newSku.trim()}
              className="shrink-0 px-3 py-2 rounded-lg
                bg-treez-cyan/20 hover:bg-treez-cyan/30 active:bg-treez-cyan/40
                disabled:bg-white/5 disabled:text-white/30
                text-white text-xs sm:text-sm font-medium
                transition-colors duration-200 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      ) : (
        /* ── NORMAL SELECTION MODE ── single row ── */
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: count + select all */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{count}</span>
              </div>
              <span className="text-white font-medium text-sm sm:text-base whitespace-nowrap">
                {count} selected
              </span>
            </div>

            {!allSelectedInContext && totalInContext > 1 && (
              <button
                onClick={() => selectAllInContext(selectionContext || undefined)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md
                  bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs
                  transition-colors duration-200 border border-white/20"
                aria-label={`Select all ${totalInContext} images`}
              >
                <CheckSquare className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Select All ({totalInContext})</span>
                <span className="sm:hidden">({totalInContext})</span>
              </button>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowSkuInput(true)}
              className="inline-flex items-center justify-center gap-1.5
                px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg
                bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs sm:text-sm
                transition-colors duration-200
                min-w-[36px] sm:min-w-0"
              aria-label={noneHaveSku ? 'Assign SKU' : 'Change SKU'}
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">{noneHaveSku ? 'Assign SKU' : 'Change SKU'}</span>
            </button>

            {allHaveSku && (
              <button
                onClick={handleRemoveSku}
                className="inline-flex items-center justify-center gap-1.5
                  px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg
                  bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs sm:text-sm
                  transition-colors duration-200
                  min-w-[36px] sm:min-w-0"
                aria-label="Remove SKU"
              >
                <XCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            )}

            {isPro && eligibleForAi.length > 0 && !isAtLimit && (
              <button
                onClick={handleBulkAi}
                disabled={bulkAiLoading}
                title={`Generate alt text for ${eligibleForAi.length} image(s) · ${remainingRequests} AI requests left`}
                className="inline-flex items-center justify-center gap-1.5
                  px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg
                  bg-treez-purple/30 hover:bg-treez-purple/50 active:bg-treez-purple/60
                  text-white text-xs sm:text-sm
                  transition-colors duration-200
                  min-w-[36px] sm:min-w-0
                  disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`AI: generate alt text for ${eligibleForAi.length} image(s)`}
              >
                {bulkAiLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Sparkles className="w-4 h-4" />}
                <span className="hidden sm:inline">Alt Text ({eligibleForAi.length})</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-1.5
                px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg
                bg-error/20 hover:bg-error/30 active:bg-error/40 text-white text-xs sm:text-sm
                transition-colors duration-200
                min-w-[36px] sm:min-w-0"
              aria-label="Delete selected images"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              onClick={clearSelection}
              className="inline-flex items-center justify-center gap-1.5
                px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg
                bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs sm:text-sm
                transition-colors duration-200
                min-w-[36px] sm:min-w-0"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
    <AiConsentModal
      isOpen={showBulkConsentModal}
      onAccept={() => { setAiConsentGiven(); setShowBulkConsentModal(false); runBulkAi() }}
      onDecline={() => setShowBulkConsentModal(false)}
    />
    </>
  )
}
