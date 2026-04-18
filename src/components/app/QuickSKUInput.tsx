'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { sanitizeSkuDisplay } from '@/lib/filename'
import { getPresetById, getVocabulary } from '@/lib/platformPresets'

export function QuickSKUInput() {
  const [sku, setSku] = useState('')
  const images              = useAssetStore((state) => state.images)
  const setBulkSku           = useAssetStore((state) => state.setBulkSku)
  const addToast             = useAssetStore((state) => state.addToast)
  const activePlatformPreset = useAssetStore((state) => state.activePlatformPreset)

  const vocab = getVocabulary(getPresetById(activePlatformPreset))

  const imagesWithoutSku = images.filter((img) => !img.sku)
  const hasImagesWithoutSku = imagesWithoutSku.length > 0

  const handleApply = () => {
    const sanitized = sanitizeSkuDisplay(sku)

    if (!sanitized) {
      addToast('error', `Please enter a valid ${vocab.sku}`)
      return
    }

    if (hasImagesWithoutSku) {
      const idsToUpdate = imagesWithoutSku.map((img) => img.id)
      setBulkSku(idsToUpdate, sanitized)
      addToast('success', `${vocab.sku} "${sanitized}" applied to ${idsToUpdate.length} image(s)`)
    }

    setSku('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApply()
  }

  const targetCount = imagesWithoutSku.length

  return (
    <div
      className="bg-white/5 backdrop-blur-xl border border-white/10
        rounded-xl p-3 sm:p-4
        hover:bg-white/10 hover:border-treez-purple/30
        transition-all duration-300"
    >
      {/* Compact Single Row */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Icon + Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-treez-purple/20 to-treez-cyan/20">
            <Zap className="w-4 h-4 text-treez-cyan" />
          </div>
          <span className="text-sm font-medium text-white hidden sm:inline">
            Quick Assign
          </span>
        </div>

        {/* Input */}
        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`${vocab.sku} (e.g., SHOE-123)`}
          className="flex-1 px-3 py-2 rounded-lg 
            bg-white/5 backdrop-blur-sm border border-white/10
            text-white placeholder-gray-400 text-sm
            focus:outline-none focus:ring-2 focus:ring-treez-purple focus:border-transparent
            transition-all duration-300
            min-w-0"
        />

        {/* Target Count Badge */}
        {targetCount > 0 && (
          <span className="px-2.5 py-1 rounded-full
            bg-linear-to-r from-treez-purple/20 to-treez-cyan/20
            border border-treez-purple/30 backdrop-blur-sm
            text-treez-cyan text-xs font-medium whitespace-nowrap">
            {targetCount} {targetCount === 1 ? 'image' : 'images'}
          </span>
        )}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={!sku.trim() || targetCount === 0 || !hasImagesWithoutSku}
          className="group relative px-4 py-2 rounded-lg
            bg-linear-to-r from-treez-purple to-treez-pink
            text-white text-sm font-semibold
            shadow-lg hover:shadow-treez-purple/50
            hover:scale-105 active:scale-95
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100 disabled:hover:shadow-none
            whitespace-nowrap overflow-hidden"
        >
          <span className="relative z-10">Apply</span>
          <div className="absolute inset-0 
            bg-linear-to-r from-treez-pink to-treez-purple 
            opacity-0 group-hover:opacity-100 
            transition-opacity duration-300" />
        </button>
      </div>
    </div>
  )
}
