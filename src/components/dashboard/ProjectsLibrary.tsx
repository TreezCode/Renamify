'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Calendar,
  MoreVertical,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useProjects, useDeleteProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/Button'
import type { Tables } from '@/lib/supabase/database.types'

type Project = Tables<'projects'>

interface ProjectsLibraryProps {
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

function getImageCount(images: unknown): number {
  if (!images) return 0
  if (Array.isArray(images)) return images.length
  return 0
}

function DeleteConfirmModal({
  project,
  onConfirm,
  onCancel,
  loading,
}: {
  project: Project
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
        <h3 className="text-lg font-bold text-white mb-2">Delete Project</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">&ldquo;{project.name}&rdquo;</span>? This action
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

function ProjectCard({
  project,
  onDelete,
}: {
  project: Project
  onDelete: (project: Project) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const imageCount = getImageCount(project.images)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-treez-purple/40 transition-all duration-300"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-treez-purple/20 to-treez-cyan/20 border border-treez-purple/20 flex items-center justify-center shrink-0">
          <FolderOpen className="w-5 h-5 text-treez-purple" />
        </div>

        {/* Actions menu */}
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
                className="absolute right-0 top-8 z-20 bg-cosmic-gray border border-white/10 rounded-xl shadow-xl min-w-[140px] overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  href="/app"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in App
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(project)
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

      {/* Project name */}
      <h3 className="text-white font-semibold mb-1 truncate pr-2">{project.name}</h3>

      {/* Meta */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <ImageIcon className="w-3.5 h-3.5" />
          {imageCount} {imageCount === 1 ? 'image' : 'images'}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(project.created_at)}
        </span>
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-treez-purple/10 to-treez-cyan/10 border border-white/10 flex items-center justify-center mb-6">
        <FolderOpen className="w-10 h-10 text-gray-600" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        Start by renaming your first batch of product images. Your saved sessions will appear here.
      </p>
      <Link href="/app">
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4 mr-2" />
          Start a New Project
        </Button>
      </Link>
    </motion.div>
  )
}

export function ProjectsLibrary({ userId }: ProjectsLibraryProps) {
  const { projects, loading, refetch } = useProjects(userId)
  const { deleteProject, deleting } = useDeleteProject()

  const [search, setSearch] = useState('')
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete() {
    if (!projectToDelete) return
    try {
      await deleteProject(projectToDelete.id)
      setProjectToDelete(null)
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
          <h1 className="text-3xl font-bold font-display bg-linear-to-r from-treez-purple to-treez-cyan bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-gray-400 mt-1">
            {loading ? '...' : `${projects.length} saved project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/app">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-treez-purple/50 focus:bg-white/8 transition-all"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-white/3 border border-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-16"
        >
          No projects match &ldquo;{search}&rdquo;
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={setProjectToDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {projectToDelete && (
          <DeleteConfirmModal
            project={projectToDelete}
            onConfirm={handleDelete}
            onCancel={() => setProjectToDelete(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </>
  )
}
