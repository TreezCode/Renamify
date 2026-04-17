'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Images, Upload, ChevronDown } from 'lucide-react'
import { useDropzone } from '@/hooks/useDropzone'
import { useAssetStore } from '@/stores/useAssetStore'
import { SelectableImageTile } from './SelectableImageTile'
import { AssetImage } from '@/types'

const THUMB_PREVIEW_COUNT = 6

interface ImagesWithoutSKUProps {
  images: AssetImage[]
}

export function ImagesWithoutSKU({ images }: ImagesWithoutSKUProps) {
  const addImages = useAssetStore((state) => state.addImages)
  const inboxCollapsed = useAssetStore((state) => state.inboxCollapsed)
  const toggleInboxCollapsed = useAssetStore((state) => state.toggleInboxCollapsed)

  const {
    isDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useDropzone({ onFiles: addImages })

  if (images.length === 0) return null

  const overflowCount = images.length - THUMB_PREVIEW_COUNT

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative bg-white/5 backdrop-blur-xl rounded-xl
        border-2 border-dashed transition-all duration-300
        ${isDragOver
          ? 'border-treez-cyan bg-treez-cyan/10 shadow-lg shadow-treez-cyan/30 scale-[1.005]'
          : 'border-white/10 hover:border-treez-purple/30'
        }`}
    >
      {/* Drop overlay */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-xl bg-treez-cyan/10 backdrop-blur-md
            flex items-center justify-center z-20 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-treez-cyan/20 shadow-lg shadow-treez-cyan/30">
              <Upload className="w-8 h-8 text-treez-cyan" />
            </div>
            <p className="text-lg font-semibold text-white drop-shadow-lg">Drop images here</p>
          </div>
        </motion.div>
      )}

      {/* ── Header row — always visible ── */}
      <button
        onClick={toggleInboxCollapsed}
        className="w-full flex items-center gap-3 px-4 py-3 group
          hover:bg-white/5 transition-all duration-200"
      >
        <div className="p-1.5 rounded-lg bg-yellow-500/20 shrink-0">
          <Images className="w-4 h-4 text-yellow-400" />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <span className="text-sm font-semibold text-white">Ready to Organize</span>
          {!inboxCollapsed && (
            <span className="ml-2 text-xs text-gray-500">Select images to assign a SKU</span>
          )}
        </div>

        {/* Collapsed: mini thumbnail strip */}
        {inboxCollapsed && (
          <div className="flex items-center gap-1.5 shrink-0">
            {images.slice(0, THUMB_PREVIEW_COUNT).map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={img.thumbnail}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-white/15 shrink-0"
              />
            ))}
            {overflowCount > 0 && (
              <span className="text-[11px] text-gray-400 font-medium shrink-0">
                +{overflowCount}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/25
            text-yellow-400 text-xs font-medium">
            {images.length}
          </span>
          <motion.div
            animate={{ rotate: inboxCollapsed ? 0 : 180 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-treez-cyan transition-colors duration-200" />
          </motion.div>
        </div>
      </button>

      {/* Separator — opacity-transitions with content to avoid snap-flash */}
      <div
        className={`h-px bg-white/8 transition-opacity duration-200
          ${inboxCollapsed ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* ── Expandable content ── */}
      <AnimatePresence initial={false}>
        {!inboxCollapsed && (
          <motion.div
            key="inbox-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className={`p-4 sm:p-5 transition-opacity duration-200 ${
              isDragOver ? 'pointer-events-none opacity-40' : ''
            }`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {images.map((image) => (
                  <SelectableImageTile key={image.id} image={image} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
