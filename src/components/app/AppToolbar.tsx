'use client'

import { useState } from 'react'
import { RefreshCw, Zap, Infinity as InfinityIcon } from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { UpgradeModal } from '@/components/ui/UpgradeModal'

export function AppToolbar() {
  const images = useAssetStore((state) => state.images)
  const reset = useAssetStore((state) => state.reset)
  const showConfirmDialog = useAssetStore((state) => state.showConfirmDialog)
  const addToast = useAssetStore((state) => state.addToast)
  const { limits, isPro } = useSubscription()

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const imageCount = images.length
  const uniqueSkus = new Set(images.filter((img) => img.sku).map((img) => img.sku)).size
  const imagesWithSku = images.filter((img) => img.sku).length
  const maxImages = limits.maxImagesPerSession
  const usagePercent = isPro ? 0 : (imageCount / maxImages) * 100
  const isAtLimit = !isPro && imageCount >= maxImages

  const handleReset = () => {
    if (imageCount === 0) return
    showConfirmDialog({
      title: 'Start over?',
      description: 'This will clear all images and SKUs. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Clear Everything',
      onConfirm: () => {
        reset()
        addToast('success', 'Session cleared')
      },
    })
  }

  const getCountColor = () => {
    if (isPro) return 'text-treez-purple'
    if (usagePercent >= 100) return 'text-error'
    if (usagePercent >= 75) return 'text-yellow-400'
    return 'text-success'
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Images:</span>
              <span className={`font-semibold ${getCountColor()}`}>
                {isPro ? (
                  <span className="flex items-center gap-1">
                    {imageCount}
                    <InfinityIcon className="w-3.5 h-3.5 opacity-60" />
                  </span>
                ) : (
                  `${imageCount} / ${maxImages}`
                )}
              </span>
            </div>

            {uniqueSkus > 0 && (
              <>
                <div>
                  <span className="text-gray-400 text-sm mr-2">Products:</span>
                  <span className="font-semibold text-treez-purple">{uniqueSkus}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm mr-2">Configured:</span>
                  <span className="font-semibold text-treez-cyan">
                    {imagesWithSku} / {imageCount}
                  </span>
                </div>
              </>
            )}

            {isAtLimit && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-treez-purple/10 hover:bg-treez-purple/20 border border-treez-purple/30 text-treez-purple rounded-lg text-xs font-medium transition-all"
              >
                <Zap className="w-3 h-3" />
                Upgrade for unlimited
              </button>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={imageCount === 0}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Start Over
          </Button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="images"
      />
    </>
  )
}
