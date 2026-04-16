'use client'

import { useState } from 'react'
import { Upload, Zap, FolderOpen, Sparkles } from 'lucide-react'
import { useDropzone } from '@/hooks/useDropzone'
import { useAssetStore } from '@/stores/useAssetStore'
import { useSubscription } from '@/hooks/useSubscription'
import { ACCEPTED_EXTENSIONS } from '@/lib/constants'
import { UpgradeModal } from '@/components/ui/UpgradeModal'

export function UploadZone() {
  const images = useAssetStore((state) => state.images)
  const addImages = useAssetStore((state) => state.addImages)
  const currentProject = useAssetStore((state) => state.currentProject)
  const pendingProjectMeta = useAssetStore((state) => state.pendingProjectMeta)
  const { limits, isPro, loading } = useSubscription()

  const isPendingRestore = pendingProjectMeta !== null && images.length === 0

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const maxImages = limits.maxImagesPerSession
  const isAtLimit = !isPro && images.length >= maxImages
  const remainingSlots = isPro ? Infinity : Math.max(0, maxImages - images.length)
  const hasImages = images.length > 0
  const usagePercent = isPro ? 0 : (images.length / maxImages) * 100
  const isNearLimit = !isPro && usagePercent >= 75

  const { isDragOver, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleFileSelect, openFileDialog, inputRef } = useDropzone({
    onFiles: (files) => {
      if (isAtLimit) {
        setShowUpgradeModal(true)
        return
      }
      addImages(files, maxImages)
    },
    maxFiles: isPro ? undefined : remainingSlots,
  })

  const handleClick = () => {
    if (isAtLimit) {
      setShowUpgradeModal(true)
      return
    }
    openFileDialog()
  }

  return (
    <>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
          ${hasImages ? 'p-4' : 'p-12'}
          ${isAtLimit
            ? 'border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/8'
            : isDragOver
              ? 'border-treez-cyan bg-treez-cyan/10 shadow-lg shadow-treez-cyan/30 scale-[1.005]'
              : isNearLimit
                ? 'border-yellow-500/30 hover:border-yellow-500/50 bg-white/5'
                : 'border-white/20 hover:border-treez-purple/30 bg-white/5'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Drop Indicator Overlay */}
        {isDragOver && !isAtLimit && (
          <div className="absolute inset-0 rounded-xl bg-treez-cyan/10 backdrop-blur-md flex items-center justify-center z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-treez-cyan/20 backdrop-blur-sm shadow-lg shadow-treez-cyan/30">
                <Upload className="w-8 h-8 text-treez-cyan" />
              </div>
              <p className="text-lg font-semibold text-white drop-shadow-lg">Drop images here</p>
            </div>
          </div>
        )}

        {hasImages ? (
          <div className={`flex items-center justify-between gap-4 transition-opacity duration-200 ${isDragOver ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <Upload className={`w-5 h-5 ${isAtLimit ? 'text-yellow-400' : isNearLimit ? 'text-yellow-400' : 'text-treez-cyan'}`} />
              <div>
                <p className="text-white font-medium">
                  {isPro ? (
                    <>{images.length} images <span className="text-treez-purple text-sm font-normal ml-1">· Pro — unlimited</span></>
                  ) : (
                    <span className={isAtLimit ? 'text-yellow-400' : isNearLimit ? 'text-yellow-300' : ''}>
                      {images.length} / {maxImages} images
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-400">
                  {isAtLimit ? 'Limit reached — upgrade for unlimited' : 'Click or drag to add more'}
                </p>
              </div>
            </div>
            {isAtLimit && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowUpgradeModal(true) }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-treez-purple/10 hover:bg-treez-purple/20 border border-treez-purple/30 text-treez-purple rounded-lg text-xs font-medium transition-all shrink-0"
              >
                <Zap className="w-3 h-3" />
                Upgrade
              </button>
            )}
          </div>
        ) : isPendingRestore ? (
          <div className={`flex flex-col items-center justify-center text-center transition-opacity duration-200 ${isDragOver ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="w-16 h-16 mb-4 rounded-full bg-linear-to-br from-treez-purple/20 to-treez-cyan/20 border border-treez-purple/20 flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-treez-purple" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Restore &ldquo;{currentProject?.name}&rdquo;
            </h3>
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-treez-cyan" />
              <p className="text-sm text-treez-cyan font-medium">
                {pendingProjectMeta.length} file{pendingProjectMeta.length !== 1 ? 's' : ''} — SKUs &amp; descriptors will be auto-applied
              </p>
            </div>
            <p className="text-gray-400 text-sm mb-1">Drop your original files or click to browse</p>
            <p className="text-xs text-gray-600">
              Files are matched by filename — your naming work is saved
            </p>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center text-center transition-opacity duration-200 ${isDragOver ? 'pointer-events-none opacity-50' : ''}`}>
            <div className="w-16 h-16 mb-4 rounded-full bg-linear-to-br from-treez-purple/20 to-treez-cyan/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-treez-cyan" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Drag & drop images here</h3>
            <p className="text-gray-400 mb-1">or click to browse</p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, WebP, GIF, RAW (CR2, NEF, ARW, DNG, etc.)
            </p>
            {!loading && !isPro && (
              <p className="text-xs text-gray-600 mt-1">Max {maxImages} images · <span className="text-treez-purple cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setShowUpgradeModal(true) }}>Upgrade for unlimited</span></p>
            )}
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="images"
      />
    </>
  )
}
