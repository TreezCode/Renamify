'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertCircle, Camera, Check, Sparkles, Loader2 } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { useAssetStore } from '@/stores/useAssetStore'
import { AssetImage } from '@/types'
import { DEFAULT_DESCRIPTORS, ITERATION_PRESETS } from '@/lib/constants'
import { sanitizeString, generateFilename, humanizeFilename } from '@/lib/filename'
import { scoreSeoFilename, type SeoGrade } from '@/lib/seo'
import { getPresetById, getVocabulary } from '@/lib/platformPresets'
import { getStrategiesForPreset } from '@/lib/descriptorStrategies'
import { useAiAnalysis, type AiDescriptorResult } from '@/hooks/useAiAnalysis'
import { AiConsentModal } from '@/components/app/AiConsentModal'

const SEO_BADGE: Record<SeoGrade, string> = {
  good:    'text-success bg-success/10 border-success/20',
  improve: 'text-warning bg-warning/10 border-warning/20',
  poor:    'text-error bg-error/10 border-error/20',
}

const SEO_DOT: Record<SeoGrade, string> = {
  good:    'bg-success',
  improve: 'bg-warning',
  poor:    'bg-error',
}

interface WorkspaceTableRowProps {
  image: AssetImage
  sku: string | null
  position: number
  usedDescriptors: string[]
  isPro: boolean
  onRowClick: (id: string, shiftKey: boolean) => void
  onContextMenu: (e: React.MouseEvent, image: AssetImage, sku: string | null) => void
}

export function WorkspaceTableRow({ image, sku, position, usedDescriptors, isPro, onRowClick, onContextMenu }: WorkspaceTableRowProps) {
  const setImageDescriptor  = useAssetStore((s) => s.setImageDescriptor)
  const setCustomDescriptor = useAssetStore((s) => s.setCustomDescriptor)
  const setImageSku         = useAssetStore((s) => s.setImageSku)
  const setImageAltText     = useAssetStore((s) => s.setImageAltText)
  const showConfirmDialog   = useAssetStore((s) => s.showConfirmDialog)
  const addToast            = useAssetStore((s) => s.addToast)
  const selectedImageIds    = useAssetStore((s) => s.selectedImageIds)
  const activePlatformPreset = useAssetStore((s) => s.activePlatformPreset)
  const humanReadable       = useAssetStore((s) => s.humanReadable)
  const aiConsentGiven      = useAssetStore((s) => s.aiConsentGiven)
  const setAiConsentGiven   = useAssetStore((s) => s.setAiConsentGiven)

  const { analyze, isAtLimit } = useAiAnalysis()

  const [aiDescLoading,   setAiDescLoading]   = useState(false)
  const [aiAltLoading,    setAiAltLoading]    = useState(false)
  const [descSuggestion,  setDescSuggestion]  = useState<AiDescriptorResult | null>(null)
  const [showConsent,     setShowConsent]     = useState(false)
  const [pendingAction,   setPendingAction]   = useState<(() => void) | null>(null)

  const preset       = getPresetById(activePlatformPreset)
  const vocab         = getVocabulary(preset)
  const isEveryday    = activePlatformPreset === 'everyday'
  const dateStrategies = getStrategiesForPreset(activePlatformPreset)
    .filter((s) => s.id === 'datetime' || s.id === 'date-only')
  const isSelected = selectedImageIds.includes(image.id)
  const canUseAi   = isPro && !!sku && !image.isRaw && !isAtLimit

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: image.id,
    disabled: !isSelected,
  })

  const resolvedDescriptor =
    image.descriptor === 'custom' ? (image.customDescriptor ?? '') : (image.descriptor ?? '')

  const rawName = sku && resolvedDescriptor
    ? generateFilename(sku, resolvedDescriptor, image.originalName, preset, position)
    : ''
  const newName = humanReadable && activePlatformPreset === 'everyday' && sku && resolvedDescriptor
    ? humanizeFilename(sku, resolvedDescriptor, image.originalName)
    : rawName

  const seoResult = newName ? scoreSeoFilename(newName) : null

  function withConsent(action: () => void) {
    if (!aiConsentGiven) {
      setPendingAction(() => action)
      setShowConsent(true)
      return
    }
    action()
  }

  const handleAiDescriptor = () => {
    withConsent(async () => {
      setAiDescLoading(true)
      try {
        const result = await analyze(image.file, { sku: sku!, mode: 'descriptor' })
        if (result.descriptor) setDescSuggestion(result.descriptor)
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'AI analysis failed')
      } finally {
        setAiDescLoading(false)
      }
    })
  }

  const handleAiAltText = () => {
    withConsent(async () => {
      setAiAltLoading(true)
      try {
        const result = await analyze(image.file, { sku: sku!, descriptor: resolvedDescriptor, mode: 'altText' })
        if (result.altText) {
          setImageAltText(image.id, result.altText.altText)
          addToast('success', 'Alt text generated')
        }
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'AI analysis failed')
      } finally {
        setAiAltLoading(false)
      }
    })
  }

  const handleConsentAccept = () => {
    setAiConsentGiven()
    setShowConsent(false)
    if (pendingAction) { pendingAction(); setPendingAction(null) }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    const isInbox = !sku
    showConfirmDialog({
      title: isInbox ? 'Remove image?' : `Remove ${vocab.sku}?`,
      description: isInbox
        ? `Remove "${image.originalName}" from the workspace?`
        : `Remove ${vocab.sku} from "${image.originalName}"? You can reassign it later.`,
      variant: 'warning',
      confirmLabel: isInbox ? 'Remove' : `Remove ${vocab.sku}`,
      onConfirm: () => {
        setImageSku(image.id, '')
        addToast('success', isInbox ? 'Image removed' : `${vocab.sku} removed from image`)
      },
    })
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ opacity: isDragging ? 0.35 : 1 }}
        className={`group flex items-center w-full border-b border-white/5 transition-colors pl-4
          ${isSelected ? 'bg-treez-purple/10 cursor-grab active:cursor-grabbing' : 'hover:bg-white/3 cursor-default'}`}
        onClick={(e) => {
          const t = e.target as HTMLElement
          if (t.closest('button, select, input, textarea, a')) return
          onRowClick(image.id, e.shiftKey)
        }}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, image, sku) }}
        {...listeners}
        {...attributes}
      >
        {/* Checkbox */}
        <div className="w-8 shrink-0 flex items-center justify-center py-3">
          <button
            onClick={(e) => { e.stopPropagation(); onRowClick(image.id, e.shiftKey) }}
            className={`w-4 h-4 rounded border transition-all flex items-center justify-center
              ${isSelected
                ? 'bg-treez-purple border-treez-purple'
                : 'border-white/20 hover:border-treez-purple/50 bg-transparent'}`}
            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${image.originalName}`}
          >
            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
          </button>
        </div>

        {/* Thumbnail */}
        <div className="w-9 shrink-0 flex items-center py-2">
          <div className="relative w-7 h-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.thumbnail}
              alt={image.originalName}
              className={`w-7 h-7 object-cover rounded border transition-all
                ${isSelected ? 'border-treez-purple' : 'border-white/10'}`}
            />
            {image.isRaw && (
              <span className="absolute -bottom-0.5 -right-0.5 px-0.5 rounded bg-amber-500/90 flex items-center">
                <Camera className="w-1.5 h-1.5 text-white" />
              </span>
            )}
          </div>
        </div>

        {/* Filename */}
        <div className="flex-1 min-w-0 px-2 py-3">
          <p className="text-xs text-gray-400 truncate leading-none" title={image.originalName}>
            {image.originalName}
          </p>
          {!sku && (
            <p className="text-[10px] text-gray-600 mt-0.5">Select &amp; {vocab.assignSku.toLowerCase()}</p>
          )}
        </div>

        {/* Descriptor */}
        <div className="w-44 shrink-0 px-2 py-1.5 space-y-1">
          {sku ? (
            <>
              <div className="flex items-center gap-1">
                <select
                  value={image.descriptor ?? ''}
                  onChange={(e) => setImageDescriptor(image.id, e.target.value)}
                  className="flex-1 min-w-0 px-1.5 py-1 text-xs
                    bg-white/5 border border-white/10 rounded-md text-white
                    focus:outline-none focus:ring-1 focus:ring-treez-purple focus:border-treez-purple
                    hover:border-white/20 transition-all"
                >
                  <option value="" className="bg-deep-space">Select…</option>
                  <optgroup label="── Auto-Fill ──" className="bg-deep-space">
                    {ITERATION_PRESETS.map((p) => (
                      <option key={p.value} value={p.value} className="bg-deep-space text-white">
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={`── ${vocab.descriptor}s ──`} className="bg-deep-space">
                    {isEveryday ? (
                      <>
                        {dateStrategies.map((s) => (
                          <option key={s.id} value={s.id} className="bg-deep-space text-white">
                            {s.label}
                          </option>
                        ))}
                        <option value="custom" className="bg-deep-space text-white">Custom</option>
                      </>
                    ) : DEFAULT_DESCRIPTORS.map((d) => {
                      const isUsed = d.value !== 'custom' && usedDescriptors.includes(d.value)
                      return (
                        <option
                          key={d.value}
                          value={d.value}
                          disabled={isUsed}
                          className="bg-deep-space text-white disabled:text-gray-600"
                        >
                          {d.label}{isUsed ? ' (used)' : ''}
                        </option>
                      )
                    })}
                  </optgroup>
                </select>
                {canUseAi && (
                  <button
                    onClick={handleAiDescriptor}
                    disabled={aiDescLoading}
                    title="AI: suggest descriptor"
                    className="shrink-0 p-0.5 rounded text-gray-500
                      hover:text-treez-purple hover:bg-treez-purple/10
                      disabled:opacity-40 transition-colors"
                  >
                    {aiDescLoading
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Sparkles className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* AI suggestion banner — same width as the select element */}
              {descSuggestion && (
                <div className="flex items-center gap-1">
                  <div className="flex-1 min-w-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md
                    bg-treez-purple/10 border border-treez-purple/20 text-[10px]">
                    <Sparkles className="w-2.5 h-2.5 text-treez-purple shrink-0" />
                    <span className="text-treez-purple font-medium truncate">{descSuggestion.descriptor}</span>
                    <span className="text-gray-500 shrink-0">{Math.round(descSuggestion.confidence * 100)}%</span>
                    <button
                      onClick={() => { setImageDescriptor(image.id, descSuggestion.descriptor); setDescSuggestion(null) }}
                      className="ml-auto px-1 py-0.5 rounded bg-treez-purple/20 text-treez-purple hover:bg-treez-purple/30 font-medium transition-colors shrink-0"
                    >Apply</button>
                    <button onClick={() => setDescSuggestion(null)} className="text-gray-600 hover:text-white transition-colors shrink-0">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  {canUseAi && <div className="shrink-0 w-4" />}
                </div>
              )}

              {/* Custom descriptor input */}
              {image.descriptor === 'custom' && (
                <div className="flex items-start gap-1">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={image.customDescriptor ?? ''}
                      onChange={(e) => setCustomDescriptor(image.id, e.target.value)}
                      placeholder="Enter custom…"
                      className="w-full px-1.5 py-0.5 text-xs bg-white/5 border border-white/10 rounded-md
                        text-white placeholder:text-gray-600
                        focus:outline-none focus:ring-1 focus:ring-treez-purple transition-all"
                    />
                    {image.customDescriptor && image.customDescriptor !== sanitizeString(image.customDescriptor) && (
                      <div className="flex items-center gap-1 text-[9px] text-yellow-400 mt-0.5">
                        <AlertCircle className="w-2 h-2 shrink-0" />
                        <code className="text-treez-cyan">{sanitizeString(image.customDescriptor)}</code>
                      </div>
                    )}
                  </div>
                  {canUseAi && <div className="shrink-0 w-4" />}
                </div>
              )}
            </>
          ) : (
            <span className="text-[10px] text-gray-600 italic">— needs {vocab.sku} —</span>
          )}
        </div>

        {/* New filename + alt text */}
        <div className="w-44 shrink-0 px-2 py-2 hidden md:flex flex-col justify-center gap-0.5">
          {newName ? (
            <code className="text-[11px] text-treez-cyan font-mono truncate block" title={newName}>
              {newName}
            </code>
          ) : (
            <span className="text-[10px] text-gray-600 italic">—</span>
          )}
          {image.altText ? (
            <div className="flex items-start gap-1">
              <textarea
                value={image.altText}
                onChange={(e) => setImageAltText(image.id, e.target.value)}
                rows={1}
                title="Click to edit alt text"
                className="flex-1 text-[9px] text-gray-500 leading-tight bg-transparent
                  border border-transparent hover:border-white/10 rounded p-0.5
                  focus:outline-none focus:border-white/20 focus:text-white
                  resize-none transition-colors"
              />
              <div className="flex gap-0.5 shrink-0">
                {canUseAi && (
                  <button
                    onClick={handleAiAltText}
                    disabled={aiAltLoading}
                    className="p-0.5 rounded text-gray-600 hover:text-treez-purple hover:bg-treez-purple/10 disabled:opacity-40 transition-colors"
                  >
                    {aiAltLoading ? <Loader2 className="w-2 h-2 animate-spin" /> : <Sparkles className="w-2 h-2" />}
                  </button>
                )}
                <button
                  onClick={() => setImageAltText(image.id, '')}
                  className="p-0.5 rounded text-gray-700 hover:text-error hover:bg-error/10 transition-colors"
                >
                  <X className="w-2 h-2" />
                </button>
              </div>
            </div>
          ) : canUseAi && newName && (
            <button
              onClick={handleAiAltText}
              disabled={aiAltLoading}
              className="flex items-center gap-0.5 text-[9px] text-gray-600 hover:text-treez-purple transition-colors disabled:opacity-40"
            >
              {aiAltLoading ? <Loader2 className="w-2 h-2 animate-spin" /> : <Sparkles className="w-2 h-2" />}
              <span>Alt text</span>
            </button>
          )}
        </div>

        {/* SEO badge */}
        <div className="w-24 shrink-0 px-2 py-3 hidden lg:flex items-center">
          {seoResult ? (
            <span
              className={`inline-flex items-center gap-1 text-[9px] px-1 py-0.5
                rounded-full border font-medium whitespace-nowrap ${SEO_BADGE[seoResult.grade]}`}
              title={seoResult.tips.join(' · ') || 'Great SEO!'}
            >
              <span className={`w-1 h-1 rounded-full shrink-0 ${SEO_DOT[seoResult.grade]}`} />
              {seoResult.label}
            </span>
          ) : (
            <span className="text-[10px] text-gray-700">—</span>
          )}
        </div>

        {/* Remove */}
        <div className="w-10 shrink-0 flex items-center justify-center py-3">
          <button
            onClick={handleRemove}
            aria-label={`Remove ${image.originalName}`}
            className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 rounded-md
              text-gray-600 hover:text-error hover:bg-error/10 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showConsent && typeof document !== 'undefined' && createPortal(
        <AiConsentModal
          isOpen={showConsent}
          onAccept={handleConsentAccept}
          onDecline={() => { setShowConsent(false); setPendingAction(null) }}
        />,
        document.body
      )}
    </>
  )
}
