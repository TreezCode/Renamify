'use client'

import { useRef, useMemo, useCallback, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { Images, ChevronDown, Check } from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { useSubscription } from '@/hooks/useSubscription'
import { AssetImage } from '@/types'
import { WorkspaceGroupHeader } from './WorkspaceGroupHeader'
import { WorkspaceTableRow } from './WorkspaceTableRow'
import { WorkspaceContextMenu } from './WorkspaceContextMenu'
import { SelectionActionBar } from './SelectionActionBar'

type VirtualRow =
  | { kind: 'inbox-header' }
  | { kind: 'group-header'; sku: string; images: AssetImage[] }
  | { kind: 'image-row'; image: AssetImage; sku: string | null; position: number; usedDescriptors: string[] }

const HEADER_H = 48
const ROW_H    = 44

function InboxHeader({ count, isCollapsed, onToggle, imageIds }: {
  count: number
  isCollapsed: boolean
  onToggle: () => void
  imageIds: string[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'remove-sku' })
  const selectedImageIds  = useAssetStore((s) => s.selectedImageIds)
  const selectImages      = useAssetStore((s) => s.selectImages)
  const setLastSelectedId = useAssetStore((s) => s.setLastSelectedId)
  const allSelected  = imageIds.length > 0 && imageIds.every((id) => selectedImageIds.includes(id))
  const someSelected = imageIds.some((id) => selectedImageIds.includes(id))
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (allSelected) {
      selectImages(selectedImageIds.filter((id) => !imageIds.includes(id)))
    } else {
      selectImages(Array.from(new Set([...selectedImageIds, ...imageIds])))
      setLastSelectedId(imageIds[imageIds.length - 1])
    }
  }
  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 px-3 py-2.5 border-b border-white/8
        border-l-2 border-l-yellow-500/40
        bg-white/4 transition-all duration-200 group/inbox
        ${isOver ? 'bg-treez-cyan/8 border-l-treez-cyan' : ''}`}
    >
      {/* Inbox select-all checkbox */}
      <button
        onClick={handleSelect}
        aria-label={allSelected ? 'Deselect all inbox images' : 'Select all inbox images'}
        className={`w-4 h-4 shrink-0 rounded border transition-all flex items-center justify-center
          ${allSelected
            ? 'bg-treez-purple border-treez-purple'
            : someSelected
              ? 'bg-treez-purple/40 border-treez-purple/60'
              : 'border-white/20 hover:border-treez-purple/50 bg-transparent'}`}
      >
        {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
        {someSelected && !allSelected && <div className="w-2 h-0.5 bg-white rounded" />}
      </button>
      <div className="p-1 rounded bg-yellow-500/15 shrink-0">
        <Images className="w-3.5 h-3.5 text-yellow-400" />
      </div>

      <button
        onClick={onToggle}
        className="flex-1 min-w-0 flex items-center gap-3 text-left group/btn"
      >
        <span className="text-sm font-semibold text-white">Ready to Organize</span>
        <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/25 text-yellow-400 text-[10px] font-medium shrink-0">
          {count}
        </span>
        {isOver && (
          <span className="text-[10px] text-treez-cyan font-medium animate-pulse">Drop to unassign SKU</span>
        )}
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.25 }}
          className="ml-auto shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover/btn:text-treez-cyan transition-colors duration-200" />
        </motion.div>
      </button>
    </div>
  )
}

export function WorkspaceTable() {
  const images               = useAssetStore((s) => s.images)
  const collapsedSkus        = useAssetStore((s) => s.collapsedSkus)
  const inboxCollapsed       = useAssetStore((s) => s.inboxCollapsed)
  const toggleInboxCollapsed = useAssetStore((s) => s.toggleInboxCollapsed)
  const selectedImageIds     = useAssetStore((s) => s.selectedImageIds)
  const lastSelectedId       = useAssetStore((s) => s.lastSelectedId)
  const toggleImageSelection = useAssetStore((s) => s.toggleImageSelection)
  const selectImages         = useAssetStore((s) => s.selectImages)
  const clearSelection       = useAssetStore((s) => s.clearSelection)
  const setLastSelectedId    = useAssetStore((s) => s.setLastSelectedId)
  const { isPro }            = useSubscription()

  const parentRef = useRef<HTMLDivElement>(null)

  const { inboxImages, skuGroups } = useMemo(() => {
    const inbox: AssetImage[] = []
    const groupMap = new Map<string, AssetImage[]>()
    images.forEach((img) => {
      if (!img.sku) {
        inbox.push(img)
      } else {
        if (!groupMap.has(img.sku)) groupMap.set(img.sku, [])
        groupMap.get(img.sku)!.push(img)
      }
    })
    const sortedSkus = Array.from(groupMap.keys()).sort()
    return {
      inboxImages: inbox,
      skuGroups: sortedSkus.map((sku) => ({ sku, images: groupMap.get(sku)! })),
    }
  }, [images])

  const flatRows = useMemo<VirtualRow[]>(() => {
    const rows: VirtualRow[] = []

    if (inboxImages.length > 0) {
      rows.push({ kind: 'inbox-header' })
      if (!inboxCollapsed) {
        inboxImages.forEach((img, i) =>
          rows.push({ kind: 'image-row', image: img, sku: null, position: i + 1, usedDescriptors: [] })
        )
      }
    }

    skuGroups.forEach(({ sku, images: groupImages }) => {
      const usedDescs = Array.from(
        new Set(
          groupImages
            .filter((img) => img.descriptor && img.descriptor !== 'custom')
            .map((img) => img.descriptor as string)
        )
      )
      rows.push({ kind: 'group-header', sku, images: groupImages })
      if (!collapsedSkus.includes(sku)) {
        groupImages.forEach((img, i) =>
          rows.push({
            kind: 'image-row',
            image: img,
            sku,
            position: i + 1,
            usedDescriptors: usedDescs.filter((d) => d !== img.descriptor),
          })
        )
      }
    })

    return rows
  }, [inboxImages, skuGroups, collapsedSkus, inboxCollapsed])

  const orderedImageIds = useMemo(
    () => flatRows.filter((r) => r.kind === 'image-row').map((r) => (r as { image: AssetImage; kind: 'image-row' }).image.id),
    [flatRows]
  )

  const handleRowClick = useCallback((imageId: string, shiftKey: boolean) => {
    if (shiftKey && lastSelectedId && lastSelectedId !== imageId) {
      const fromIdx = orderedImageIds.indexOf(lastSelectedId)
      const toIdx   = orderedImageIds.indexOf(imageId)
      if (fromIdx !== -1 && toIdx !== -1) {
        const [start, end] = fromIdx < toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx]
        selectImages(orderedImageIds.slice(start, end + 1))
        return
      }
    }
    toggleImageSelection(imageId)
    setLastSelectedId(imageId)
  }, [lastSelectedId, orderedImageIds, selectImages, toggleImageSelection, setLastSelectedId])

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; image: AssetImage; sku: string | null
  } | null>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent, image: AssetImage, sku: string | null) => {
    setContextMenu({ x: e.clientX, y: e.clientY, image, sku })
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      if (selectedImageIds.length === orderedImageIds.length && orderedImageIds.length > 0) {
        clearSelection()
      } else {
        selectImages(orderedImageIds)
        if (orderedImageIds.length > 0) setLastSelectedId(orderedImageIds[orderedImageIds.length - 1])
      }
    } else if (e.key === 'Escape') {
      clearSelection()
    }
  }, [selectedImageIds, orderedImageIds, selectImages, clearSelection, setLastSelectedId])

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (flatRows[i].kind === 'image-row' ? ROW_H : HEADER_H),
    measureElement: (el) => el?.getBoundingClientRect().height ?? ROW_H,
    overscan: 10,
  })

  if (images.length === 0) return null

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col"
      style={{ maxHeight: 'calc(100vh - 260px)', minHeight: '200px' }}
    >
      {/* ── Column headers / Selection action bar ── */}
      <AnimatePresence mode="wait" initial={false}>
        {selectedImageIds.length > 0 ? (
          <motion.div
            key="action-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-none bg-treez-purple/20 border-b border-treez-purple/40"
          >
            <SelectionActionBar compact />
          </motion.div>
        ) : (
          <motion.div
            key="col-headers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-none flex items-center gap-0 pl-4 h-11 bg-white/3 border-b border-white/10
              text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
          >
            <div className="w-8 shrink-0" />
            <div className="w-9 shrink-0" />
            <div className="flex-1 min-w-0 px-2">File</div>
            <div className="w-44 shrink-0 px-2">Descriptor</div>
            <div className="w-44 shrink-0 px-2 hidden md:block">New Name</div>
            <div className="w-24 shrink-0 px-2 hidden lg:block">SEO</div>
            <div className="w-10 shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Virtual scroll container ── */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto scrollbar-treez outline-none select-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const row = flatRows[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${virtualItem.start}px)`,
                  width: '100%',
                }}
              >
                {row.kind === 'inbox-header' && (
                  <InboxHeader
                    count={inboxImages.length}
                    isCollapsed={inboxCollapsed}
                    onToggle={toggleInboxCollapsed}
                    imageIds={inboxImages.map((img) => img.id)}
                  />
                )}
                {row.kind === 'group-header' && (
                  <WorkspaceGroupHeader sku={row.sku} images={row.images} isPro={isPro} />
                )}
                {row.kind === 'image-row' && (
                  <WorkspaceTableRow
                    image={row.image}
                    sku={row.sku}
                    position={row.position}
                    usedDescriptors={row.usedDescriptors}
                    isPro={isPro}
                    onRowClick={handleRowClick}
                    onContextMenu={handleContextMenu}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>

    {contextMenu && (
      <WorkspaceContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        image={contextMenu.image}
        sku={contextMenu.sku}
        onClose={() => setContextMenu(null)}
        onAiAnalyze={() => setContextMenu(null)}
      />
    )}
  </>
  )
}
