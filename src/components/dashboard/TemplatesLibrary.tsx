'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Loader2,
  Calendar,
  Tag,
  MoreVertical,
  X,
  ChevronUp,
} from 'lucide-react'
import { useTemplates, useDeleteTemplate, useCreateTemplate } from '@/hooks/useTemplates'
import { Button } from '@/components/ui/Button'
import type { Tables } from '@/lib/supabase/database.types'

type Template = Tables<'templates'>

interface TemplatesLibraryProps {
  userId: string
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Unknown date'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getDescriptorCount(descriptors: unknown): number {
  if (!descriptors) return 0
  if (Array.isArray(descriptors)) return descriptors.length
  if (typeof descriptors === 'object') return Object.keys(descriptors as object).length
  return 0
}

function DeleteConfirmModal({
  template,
  onConfirm,
  onCancel,
  loading,
}: {
  template: Template
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-cosmic-gray border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-error" />
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Delete Template</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">&ldquo;{template.name}&rdquo;</span>? This
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-error/10 hover:bg-error/20 border border-error/30 text-error rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function TemplateCard({
  template,
  onDelete,
}: {
  template: Template
  onDelete: (template: Template) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const descriptorCount = getDescriptorCount(template.descriptors)

  const descriptorList: string[] = Array.isArray(template.descriptors)
    ? (template.descriptors as string[])
    : []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-treez-cyan/40 transition-all duration-300"
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-treez-cyan/20 to-treez-pink/20 border border-treez-cyan/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-treez-cyan" />
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-8 z-20 bg-cosmic-gray border border-white/10 rounded-xl shadow-xl min-w-[130px] overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(template)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-white font-semibold mb-1 truncate pr-2">{template.name}</h3>

        {/* SKU pattern if present */}
        {template.sku_pattern && (
          <p className="text-xs text-gray-500 font-mono truncate mb-2">
            SKU: {template.sku_pattern}
          </p>
        )}

        {/* Descriptor tags preview */}
        {descriptorList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {descriptorList.slice(0, expanded ? undefined : 4).map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-treez-cyan/10 border border-treez-cyan/20 text-treez-cyan text-xs rounded-lg"
              >
                <Tag className="w-2.5 h-2.5" />
                {d}
              </span>
            ))}
            {!expanded && descriptorList.length > 4 && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                +{descriptorList.length - 4} more
              </button>
            )}
          </div>
        )}

        {/* Expand toggle */}
        {descriptorList.length > 4 && expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
            Show less
          </button>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Tag className="w-3.5 h-3.5" />
            {descriptorCount} {descriptorCount === 1 ? 'descriptor' : 'descriptors'}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(template.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function CreateTemplateModal({
  userId,
  onCreated,
  onClose,
}: {
  userId: string
  onCreated: () => void
  onClose: () => void
}) {
  const { createTemplate, creating } = useCreateTemplate()
  const [name, setName] = useState('')
  const [skuPattern, setSkuPattern] = useState('')
  const [descriptorInput, setDescriptorInput] = useState('')
  const [descriptors, setDescriptors] = useState<string[]>([])

  function addDescriptor() {
    const val = descriptorInput.trim()
    if (val && !descriptors.includes(val)) {
      setDescriptors([...descriptors, val])
      setDescriptorInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createTemplate({
        user_id: userId,
        name: name.trim(),
        sku_pattern: skuPattern.trim() || null,
        descriptors: descriptors,
      })
      onCreated()
      onClose()
    } catch {
      // error handled in hook
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-cosmic-gray border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">New Template</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Template Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jewelry Product Template"
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-treez-purple/50 focus:bg-white/8 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              SKU Pattern <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={skuPattern}
              onChange={(e) => setSkuPattern(e.target.value)}
              placeholder="e.g. RING-{color}-{size}"
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:border-treez-purple/50 focus:bg-white/8 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Descriptors <span className="text-gray-500">(optional)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={descriptorInput}
                onChange={(e) => setDescriptorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addDescriptor() }
                }}
                placeholder="Add a descriptor and press Enter"
                className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-treez-cyan/50 transition-all"
              />
              <button
                type="button"
                onClick={addDescriptor}
                className="px-3.5 py-2.5 bg-treez-cyan/10 border border-treez-cyan/20 text-treez-cyan rounded-xl text-sm hover:bg-treez-cyan/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {descriptors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {descriptors.map((d, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-treez-cyan/10 border border-treez-cyan/20 text-treez-cyan text-xs rounded-lg"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => setDescriptors(descriptors.filter((_, j) => j !== i))}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={creating || !name.trim()}
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Template
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-treez-cyan/10 to-treez-pink/10 border border-white/10 flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-gray-600" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No templates yet</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        Create reusable naming templates with descriptors and SKU patterns to speed up future
        projects.
      </p>
      <Button variant="primary" size="md" onClick={onCreate}>
        <Plus className="w-4 h-4 mr-2" />
        Create First Template
      </Button>
    </motion.div>
  )
}

export function TemplatesLibrary({ userId }: TemplatesLibraryProps) {
  const { templates, loading, refetch } = useTemplates(userId)
  const { deleteTemplate, deleting } = useDeleteTemplate()

  const [search, setSearch] = useState('')
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete() {
    if (!templateToDelete) return
    try {
      await deleteTemplate(templateToDelete.id)
      setTemplateToDelete(null)
      refetch()
    } catch {
      // error handled in hook
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display bg-linear-to-r from-treez-cyan to-treez-pink bg-clip-text text-transparent">
            Templates
          </h1>
          <p className="text-gray-400 mt-1">
            {loading ? '...' : `${templates.length} saved template${templates.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search */}
      {templates.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-treez-cyan/50 focus:bg-white/8 transition-all"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white/3 border border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState onCreate={() => setShowCreateModal(true)} />
      ) : filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-16"
        >
          No templates match &ldquo;{search}&rdquo;
        </motion.p>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onDelete={setTemplateToDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {templateToDelete && (
          <DeleteConfirmModal
            template={templateToDelete}
            onConfirm={handleDelete}
            onCancel={() => setTemplateToDelete(null)}
            loading={deleting}
          />
        )}
        {showCreateModal && (
          <CreateTemplateModal
            userId={userId}
            onCreated={refetch}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
