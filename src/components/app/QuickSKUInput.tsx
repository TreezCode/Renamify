'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Check } from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { Button } from '@/components/ui/Button'
import { sanitizeString } from '@/lib/filename'

export function QuickSKUInput() {
  const [sku, setSku] = useState('')
  const images = useAssetStore((state) => state.images)
  const selectedImageIds = useAssetStore((state) => state.selectedImageIds)
  const setBulkSku = useAssetStore((state) => state.setBulkSku)
  const addToast = useAssetStore((state) => state.addToast)

  const imagesWithoutSku = images.filter((img) => !img.sku)
  const hasSelection = selectedImageIds.length > 0
  const hasImagesWithoutSku = imagesWithoutSku.length > 0

  const handleApply = () => {
    const sanitized = sanitizeString(sku)
    
    if (!sanitized) {
      addToast('error', 'Please enter a valid SKU')
      return
    }

    if (hasSelection) {
      setBulkSku(selectedImageIds, sanitized)
      addToast('success', `SKU "${sanitized}" applied to ${selectedImageIds.length} image(s)`)
    } else if (hasImagesWithoutSku) {
      const idsToUpdate = imagesWithoutSku.map((img) => img.id)
      setBulkSku(idsToUpdate, sanitized)
      addToast('success', `SKU "${sanitized}" applied to ${idsToUpdate.length} image(s)`)
    }
    
    setSku('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  // Hide this panel when images are selected - SelectionActionBar handles it
  if (images.length === 0 || hasSelection) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-treez-purple/20">
          <Package className="w-5 h-5 text-treez-purple" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {hasSelection ? 'Set SKU for Selected Images' : 'Quick SKU Assignment'}
          </h3>
          <p className="text-sm text-gray-400">
            {hasSelection 
              ? `${selectedImageIds.length} image(s) selected`
              : hasImagesWithoutSku 
              ? `${imagesWithoutSku.length} image(s) need a SKU`
              : 'All images have SKUs assigned'}
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter SKU (e.g., SHOE-123)"
              className="w-full px-4 py-3 rounded-lg 
                bg-deep-space border border-white/20
                text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-treez-purple focus:border-transparent
                transition-all duration-300"
            />
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            disabled={!sku.trim() || (!hasSelection && !hasImagesWithoutSku)}
            className="gap-2 shrink-0"
          >
            <Check className="w-4 h-4" />
            {hasSelection ? 'Apply to Selected' : 'Apply to All'}
          </Button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-4 p-3 rounded-lg bg-treez-purple/10 border border-treez-purple/20">
        <p className="text-xs text-gray-300">
          <strong className="text-treez-purple">Tip:</strong> SKUs will be used in filenames. 
          Use alphanumeric characters and hyphens only. Example: PRODUCT-ABC-123
        </p>
      </div>
    </motion.div>
  )
}
