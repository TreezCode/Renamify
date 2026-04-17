'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { RefreshCw, Zap, Infinity as InfinityIcon, ChevronDown, Lock, Check, Tag, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { useSubscription } from '@/hooks/useSubscription'
import { PLATFORM_PRESETS } from '@/lib/platformPresets'
import { Button } from '@/components/ui/Button'
import { UpgradeModal } from '@/components/ui/UpgradeModal'

export function AppToolbar() {
  const images = useAssetStore((state) => state.images)
  const reset = useAssetStore((state) => state.reset)
  const showConfirmDialog = useAssetStore((state) => state.showConfirmDialog)
  const addToast = useAssetStore((state) => state.addToast)
  const activePlatformPreset = useAssetStore((state) => state.activePlatformPreset)
  const setActivePlatformPreset = useAssetStore((state) => state.setActivePlatformPreset)
  const collapsedSkus = useAssetStore((state) => state.collapsedSkus)
  const inboxCollapsed = useAssetStore((state) => state.inboxCollapsed)
  const collapseAllSkus = useAssetStore((state) => state.collapseAllSkus)
  const expandAllSkus = useAssetStore((state) => state.expandAllSkus)
  const { limits, isPro } = useSubscription()

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showPresetMenu, setShowPresetMenu] = useState(false)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const activePreset = PLATFORM_PRESETS.find((p) => p.id === activePlatformPreset) ?? PLATFORM_PRESETS[0]
  const isNonGeneric = activePlatformPreset !== 'generic'

  const handleToggleMenu = () => {
    if (!showPresetMenu && triggerRef.current) {
      setMenuRect(triggerRef.current.getBoundingClientRect())
    }
    setShowPresetMenu((o) => !o)
  }

  const imageCount = images.length
  const skuList = Array.from(new Set(images.filter((img) => img.sku).map((img) => img.sku as string)))
  const uniqueSkus = skuList.length
  const imagesWithSku = images.filter((img) => img.sku).length
  const imagesWithoutSku = images.filter((img) => !img.sku).length

  const allGroupsCollapsed = uniqueSkus === 0 || skuList.every((s) => collapsedSkus.includes(s))
  const everythingCollapsed = allGroupsCollapsed && (imagesWithoutSku === 0 || inboxCollapsed)
  const hasCollapsible = imageCount > 0 && (uniqueSkus > 0 || imagesWithoutSku > 0)
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
          <div className="flex flex-wrap items-center gap-3">
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

          <div className="flex items-center gap-2">
            {/* Platform Preset Selector */}
            <button
              ref={triggerRef}
              onClick={handleToggleMenu}
              title="Choose naming format for exported files"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                ${
                  isNonGeneric
                    ? 'bg-treez-purple/10 border-treez-purple/30 text-treez-purple hover:bg-treez-purple/20'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-treez-purple/30 hover:text-white'
                }`}
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>{activePreset.label}</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${showPresetMenu ? 'rotate-180' : ''}`} />
            </button>

            {hasCollapsible && (
              <button
                onClick={everythingCollapsed ? expandAllSkus : collapseAllSkus}
                title={everythingCollapsed ? 'Expand all groups' : 'Collapse all groups'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                  bg-white/5 border border-white/10 text-gray-300
                  hover:border-treez-purple/40 hover:text-white hover:bg-white/8
                  transition-all duration-200"
              >
                {everythingCollapsed
                  ? <ChevronsUpDown className="w-3.5 h-3.5 shrink-0" />
                  : <ChevronsDownUp className="w-3.5 h-3.5 shrink-0" />}
                <span className="hidden sm:inline">
                  {everythingCollapsed ? 'Expand All' : 'Collapse All'}
                </span>
              </button>
            )}

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
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="images"
      />

      {/* Dropdown rendered via portal to escape backdrop-blur stacking context */}
      {showPresetMenu && menuRect && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-9998"
            onClick={() => setShowPresetMenu(false)}
          />
          <div
            style={{ top: menuRect.bottom + 6, left: menuRect.left }}
            className="fixed z-9999 w-72 bg-[#0d0d1a] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-treez-purple shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Naming Format</p>
                <p className="text-[11px] text-gray-500">Applied to all filenames this session</p>
              </div>
            </div>
            {PLATFORM_PRESETS.map((preset) => {
              const isLocked = preset.proOnly && !isPro
              const isActive = preset.id === activePlatformPreset
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (isLocked) { setShowPresetMenu(false); setShowUpgradeModal(true); return }
                    setActivePlatformPreset(preset.id)
                    setShowPresetMenu(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 transition-colors border-b border-white/4 last:border-0
                    ${isActive ? 'bg-treez-purple/12' : isLocked ? 'opacity-50 hover:opacity-60' : 'hover:bg-white/5'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-medium ${isActive ? 'text-treez-purple' : isLocked ? 'text-gray-500' : 'text-white'}`}>
                        {preset.label}
                      </span>
                      {isLocked && <Lock className="w-3 h-3 text-gray-600" />}
                      {isActive && <Check className="w-3 h-3 text-treez-purple" />}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{preset.description}</p>
                    <code className={`text-[10px] font-mono mt-1 block ${isActive ? 'text-treez-cyan' : 'text-gray-600'}`}>
                      {preset.example}
                    </code>
                  </div>
                </button>
              )
            })}
          </div>
        </>,
        document.body
      )}
    </>
  )
}
