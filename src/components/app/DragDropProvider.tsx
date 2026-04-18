'use client'

import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  closestCenter, PointerSensor, useSensor, useSensors,
  type Modifier,
} from '@dnd-kit/core'
import { useState } from 'react'
import { useAssetStore } from '@/stores/useAssetStore'
import { AssetImage } from '@/types'

const snapToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (draggingNodeRect && activatorEvent && 'clientX' in activatorEvent) {
    const { clientX, clientY } = activatorEvent as PointerEvent
    return {
      ...transform,
      x: transform.x + clientX - draggingNodeRect.left - 16,
      y: transform.y + clientY - draggingNodeRect.top - 20,
    }
  }
  return transform
}

interface DragDropProviderProps {
  children: React.ReactNode
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [activeImage, setActiveImage] = useState<AssetImage | null>(null)

  const images          = useAssetStore((state) => state.images)
  const selectedImageIds = useAssetStore((state) => state.selectedImageIds)
  const setImageSku     = useAssetStore((state) => state.setImageSku)
  const setBulkSku      = useAssetStore((state) => state.setBulkSku)
  const addToast        = useAssetStore((state) => state.addToast)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const image = images.find((img) => img.id === (event.active.id as string))
    if (image) setActiveImage(image)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveImage(null)
    if (!over) return

    const imageId = active.id as string
    const targetId = over.id as string
    const isBulk   = selectedImageIds.includes(imageId) && selectedImageIds.length > 1
    const idsToMove = isBulk ? selectedImageIds : [imageId]

    if (targetId === 'remove-sku') {
      idsToMove.forEach((id) => setImageSku(id, ''))
      addToast('success', isBulk
        ? `SKU removed from ${idsToMove.length} images`
        : 'SKU removed from image')
    } else if (targetId.startsWith('sku-')) {
      const sku = targetId.replace('sku-', '')
      if (isBulk) {
        setBulkSku(idsToMove, sku)
        addToast('success', `${idsToMove.length} images assigned to ${sku}`)
      } else {
        setImageSku(imageId, sku)
        addToast('success', `Image assigned to ${sku}`)
      }
    }
  }

  const handleDragCancel = () => setActiveImage(null)

  const dragCount = activeImage && selectedImageIds.includes(activeImage.id)
    ? selectedImageIds.length
    : 1

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      {/* Drag overlay — compact pill following the cursor */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }} modifiers={[snapToCursor]}>
        {activeImage && (
          <div className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl
            bg-[#1a1a2e]/95 border border-treez-purple/50
            shadow-2xl shadow-black/60 backdrop-blur-xl
            pointer-events-none w-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.thumbnail}
              alt=""
              className="w-8 h-8 object-cover rounded-lg border border-treez-purple/30 shrink-0"
            />
            <span className="text-xs text-white/90 truncate flex-1">
              {activeImage.originalName}
            </span>
            {dragCount > 1 && (
              <span className="px-1.5 py-0.5 rounded-full bg-treez-purple
                text-white text-[10px] font-bold shrink-0">
                {dragCount}
              </span>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
