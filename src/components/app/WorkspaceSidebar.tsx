'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  FileText,
  LayoutDashboard,
  LogIn,
  Zap,
  Save,
  Plus,
  ChevronsLeft,
  Loader2,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { useAssetStore } from '@/stores/useAssetStore'
import { getPresetById, getVocabulary } from '@/lib/platformPresets'
import { useSubscription } from '@/hooks/useSubscription'
import { useTemplates } from '@/hooks/useTemplates'
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects'
import { UpgradeModal } from '@/components/ui/UpgradeModal'

const EASE = [0.4, 0, 0.2, 1] as const

interface WorkspaceSidebarProps {
  user: { id: string; email: string; full_name?: string } | null
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function NavTooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null
  return (
    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none z-50
      opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <div className="bg-cosmic-gray border border-white/15 text-white text-sm font-medium
        rounded-lg px-3 py-1.5 whitespace-nowrap shadow-xl shadow-black/40">
        {label}
      </div>
      <div className="absolute right-full top-1/2 -translate-y-1/2
        border-4 border-transparent border-r-white/15" />
    </div>
  )
}

function SessionNameEditor({
  value,
  onSave,
  onCancel,
  saving,
}: {
  value: string
  onSave: (name: string) => void
  onCancel: () => void
  saving: boolean
}) {
  const [name, setName] = useState(value)
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim()) }}
      className="flex items-center gap-1 mt-1"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name…"
        className="flex-1 min-w-0 bg-white/5 border border-treez-purple/40 rounded-lg px-2 py-1
          text-sm text-white placeholder-gray-600 focus:outline-none focus:border-treez-purple/70
          transition-colors"
      />
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="p-1 rounded text-success hover:bg-success/10 transition-colors disabled:opacity-40"
        aria-label="Save name"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </form>
  )
}

export function WorkspaceSidebar({ user, isCollapsed, onToggleCollapse }: WorkspaceSidebarProps) {
  const images = useAssetStore((state) => state.images)
  const currentProject = useAssetStore((state) => state.currentProject)
  const setCurrentProject = useAssetStore((state) => state.setCurrentProject)
  const addToast = useAssetStore((state) => state.addToast)
  const { isPro, limits } = useSubscription()

  const { templates } = useTemplates(user?.id)
  const { createProject, creating } = useCreateProject()
  const { updateProject, updating } = useUpdateProject()

  const [showSaveForm, setShowSaveForm] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Live session stats
  const imageCount = images.length
  const maxImages = limits.maxImagesPerSession
  const uniqueSkus = new Set(images.filter((img) => img.sku).map((img) => img.sku)).size
  const imagesWithSku = images.filter((img) => img.sku).length
  const activePlatformPreset = useAssetStore((s) => s.activePlatformPreset)
  const vocab = getVocabulary(getPresetById(activePlatformPreset))
  const usagePercent = isPro ? 0 : Math.min(100, (imageCount / maxImages) * 100)

  const sessionName = currentProject?.name ?? 'Untitled Session'
  const isSaving = creating || updating

  async function handleSaveProject(name: string) {
    if (!user) return
    try {
      const imageMetadata = images.map((img) => ({
        id: img.id,
        originalName: img.originalName,
        extension: img.extension,
        isRaw: img.isRaw,
        sku: img.sku,
        descriptor: img.descriptor,
        customDescriptor: img.customDescriptor,
      }))

      if (currentProject?.id) {
        await updateProject(currentProject.id, {
          name,
          images: imageMetadata as never,
          updated_at: new Date().toISOString(),
        })
        setCurrentProject({ id: currentProject.id, name })
      } else {
        const saved = await createProject({
          user_id: user.id,
          name,
          images: imageMetadata as never,
          groups: [],
        })
        setCurrentProject({ id: saved.id, name: saved.name })
      }
      addToast('success', `"${name}" saved`)
      setShowSaveForm(false)
    } catch {
      addToast('error', 'Failed to save project')
    }
  }

  function handleSaveClick() {
    if (!isPro) { setShowUpgradeModal(true); return }
    setShowSaveForm(true)
  }

  return (
    <>
      <div className="flex flex-col flex-1 py-6 overflow-hidden">

        {/* ── Logo (pixel-identical to DashboardLayout) ── */}
        <Link
          href="/"
          className={`mb-8 flex items-center group shrink-0 transition-all duration-300
            ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-6'}`}
        >
          <img src="/brand/logo-icon.webp" alt="Renamerly" className="h-9 w-auto shrink-0" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="overflow-hidden shrink-0"
              >
                <img src="/brand/logo-name.webp" alt="" aria-hidden="true" className="h-5 w-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* ── Section: Session ── */}
        <div className="px-3 mb-5">
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2 px-1">
                  Session
                </p>

                {/* Project name */}
                {showSaveForm ? (
                  <SessionNameEditor
                    value={currentProject?.name ?? ''}
                    onSave={handleSaveProject}
                    onCancel={() => setShowSaveForm(false)}
                    saving={isSaving}
                  />
                ) : (
                  <div className="flex items-center gap-1.5 mb-2">
                    <FolderOpen className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-300 truncate flex-1">{sessionName}</span>
                    {currentProject?.id && (
                      <button
                        onClick={() => setShowSaveForm(true)}
                        className="p-0.5 text-gray-600 hover:text-gray-300 transition-colors shrink-0"
                        aria-label="Rename project"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Save / New Session buttons */}
                <div className="flex gap-2 mt-1">
                  {user ? (
                    <button
                      onClick={handleSaveClick}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-lg
                        bg-treez-purple/10 hover:bg-treez-purple/20 border border-treez-purple/25
                        text-treez-purple text-xs font-medium transition-all disabled:opacity-50"
                    >
                      {isSaving
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : isPro
                          ? <Save className="w-3 h-3" />
                          : <Zap className="w-3 h-3" />
                      }
                      {currentProject?.id ? 'Save' : 'Save Project'}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-lg
                        bg-white/5 hover:bg-white/8 border border-white/10
                        text-gray-400 text-xs font-medium transition-all"
                    >
                      <LogIn className="w-3 h-3" />
                      Sign in to save
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      if (images.length > 0) {
                        if (!confirm('Start a new session? This will clear your current images.')) return
                      }
                      useAssetStore.getState().reset()
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
                      text-gray-500 hover:text-gray-300 transition-all"
                    aria-label="New session"
                    title="New session"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed: just the folder icon */}
          {isCollapsed && (
            <div className="relative group flex justify-center">
              <button
                onClick={handleSaveClick}
                className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Save className="w-5 h-5" />
              </button>
              <NavTooltip label={currentProject?.id ? 'Save Project' : 'Save Session'} show={true} />
            </div>
          )}
        </div>

        {/* ── Section: Templates (authenticated only) ── */}
        {user && (
          <div className="px-3 mb-5">
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2 px-1">
                    Templates
                  </p>
                  {templates.length === 0 ? (
                    <p className="text-xs text-gray-600 px-1 mb-2">No saved templates yet</p>
                  ) : (
                    <div className="space-y-0.5 mb-1">
                      {templates.slice(0, 4).map((t) => (
                        <Link
                          key={t.id}
                          href="/dashboard/templates"
                          className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-gray-400
                            hover:text-white hover:bg-white/5 transition-all text-xs group"
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0 text-gray-600 group-hover:text-treez-cyan transition-colors" />
                          <span className="truncate">{t.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link
                    href="/dashboard/templates"
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-treez-cyan
                      transition-colors px-1 py-0.5"
                  >
                    Browse all templates →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {isCollapsed && (
              <div className="relative group flex justify-center">
                <Link
                  href="/dashboard/templates"
                  className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <FileText className="w-5 h-5" />
                </Link>
                <NavTooltip label="Templates" show={true} />
              </div>
            )}
          </div>
        )}

        {/* ── Section: Session Stats ── */}
        <div className="px-3 flex-1">
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3 px-1">
                  Stats
                </p>
                <div className="space-y-2.5">
                  {/* Image count + progress bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Images</span>
                      <span className={
                        isPro ? 'text-treez-purple' :
                        usagePercent >= 100 ? 'text-error' :
                        usagePercent >= 75 ? 'text-yellow-400' : 'text-gray-300'
                      }>
                        {isPro ? `${imageCount} ∞` : `${imageCount} / ${maxImages}`}
                      </span>
                    </div>
                    {!isPro && (
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            usagePercent >= 100 ? 'bg-error' :
                            usagePercent >= 75 ? 'bg-yellow-400' : 'bg-treez-cyan'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${usagePercent}%` }}
                          transition={{ duration: 0.4, ease: EASE }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{vocab.group}s</span>
                    <span className="text-gray-300">{uniqueSkus}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Configured</span>
                    <span className={imagesWithSku === imageCount && imageCount > 0 ? 'text-success' : 'text-gray-300'}>
                      {imagesWithSku} / {imageCount}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom Actions ── */}
        <div className="mt-6 pt-6 border-t border-white/10 px-3 shrink-0 space-y-1">

          {/* Upgrade CTA (free + authenticated only) */}
          {user && !isPro && (
            <div className="relative group">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className={`flex items-center py-2.5 w-full rounded-xl
                  bg-treez-purple/10 hover:bg-treez-purple/15 border border-treez-purple/20
                  text-treez-purple transition-all duration-200
                  ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      Upgrade to Pro
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <NavTooltip label="Upgrade to Pro" show={isCollapsed} />
            </div>
          )}

          {/* Dashboard link (authenticated) or Sign In (guest) */}
          <div className="relative group">
            {user ? (
              <Link
                href="/dashboard"
                className={`flex items-center py-2.5 w-full rounded-xl text-gray-400
                  hover:text-white hover:bg-white/5 transition-all duration-200
                  ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      Dashboard
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ) : (
              <Link
                href="/login"
                className={`flex items-center py-2.5 w-full rounded-xl text-gray-400
                  hover:text-white hover:bg-white/5 transition-all duration-200
                  ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
              >
                <LogIn className="w-5 h-5 shrink-0" />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      Sign In
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}
            <NavTooltip label={user ? 'Dashboard' : 'Sign In'} show={isCollapsed} />
          </div>

          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className={`flex items-center py-2.5 mt-1 w-full rounded-xl text-gray-600
              hover:text-gray-300 hover:bg-white/5 transition-all duration-200
              ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <ChevronsLeft className="w-4 h-4 shrink-0" />
            </motion.div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="text-xs whitespace-nowrap overflow-hidden"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="projects"
      />
    </>
  )
}
