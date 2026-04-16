'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FolderOpen, FileText, Image, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useTemplates } from '@/hooks/useTemplates'
import { useUsageTracking } from '@/hooks/useUsageTracking'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'

interface DashboardOverviewProps {
  userId: string
  userName?: string
}

export function DashboardOverview({ userId, userName }: DashboardOverviewProps) {
  const { projects, loading: projectsLoading } = useProjects(userId)
  const { templates, loading: templatesLoading } = useTemplates(userId)
  const { usage, loading: usageLoading } = useUsageTracking(userId)
  const { loading: subscriptionLoading, isPro } = useSubscription()

  const recentProjects = projects.slice(0, 5)

  // Stats
  const stats = [
    {
      label: 'Total Projects',
      value: projectsLoading ? '...' : projects.length,
      icon: FolderOpen,
      color: 'from-treez-purple to-treez-pink',
      href: '/dashboard/projects',
    },
    {
      label: 'Saved Templates',
      value: templatesLoading ? '...' : templates.length,
      icon: FileText,
      color: 'from-treez-cyan to-treez-purple',
      href: '/dashboard/templates',
    },
    {
      label: 'Images This Month',
      value: usageLoading ? '...' : usage?.images_processed || 0,
      icon: Image,
      color: 'from-treez-pink to-treez-cyan',
      href: '/dashboard/billing',
    },
    {
      label: 'Plan',
      value: subscriptionLoading ? '...' : isPro ? 'Pro' : 'Free',
      icon: TrendingUp,
      color: isPro ? 'from-success to-treez-cyan' : 'from-gray-500 to-gray-400',
      href: '/dashboard/billing',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-display">
          <span className="bg-linear-to-r from-treez-purple to-treez-cyan bg-clip-text text-transparent">
            Welcome back{userName ? `, ${userName}` : ''}!
          </span>
        </h1>
        <p className="text-gray-400">Here's what's happening with your projects</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={stat.href}
                className="block group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-treez-purple/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-treez-cyan group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-linear-to-br from-treez-purple/10 to-treez-cyan/10 border border-treez-purple/20 rounded-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 font-display">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/app">
            <Button variant="primary" size="lg" className="w-full justify-center">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </Link>
          <Link href="/dashboard/templates">
            <Button variant="secondary" size="lg" className="w-full justify-center">
              <FileText className="w-5 h-5 mr-2" />
              Browse Templates
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-display">Recent Projects</h2>
          {projects.length > 5 && (
            <Link href="/dashboard/projects" className="text-sm text-treez-cyan hover:text-treez-purple transition-colors">
              View all →
            </Link>
          )}
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Start your first project to organize your images</p>
            <Link href="/app">
              <Button variant="primary" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recentProjects.map((project, index) => {
              const imageCount = Array.isArray(project.images) ? project.images.length : 0
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="block group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-treez-purple/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-treez-cyan transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            {imageCount} {imageCount === 1 ? 'image' : 'images'}
                          </span>
                          <span>
                            {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-treez-cyan group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Upgrade CTA for Free Users */}
      {!isPro && !subscriptionLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-linear-to-r from-treez-purple/20 to-treez-cyan/20 border-2 border-treez-purple/40 rounded-2xl p-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 font-display">
                Unlock Unlimited Power
              </h3>
              <p className="text-gray-300">
                Upgrade to Pro for unlimited images, saved projects, templates, and more
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="primary" size="lg" className="shrink-0">
                Upgrade to Pro →
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
