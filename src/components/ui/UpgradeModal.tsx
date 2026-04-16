'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type UpgradeFeature = 'images' | 'projects' | 'templates' | 'raw' | 'ai' | 'history'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: UpgradeFeature
}

const FEATURE_COPY: Record<UpgradeFeature, { title: string; description: string }> = {
  images: {
    title: 'Image Limit Reached',
    description: "You've hit the 20-image limit on the free plan. Upgrade to Pro for unlimited images per session.",
  },
  projects: {
    title: 'Save Projects — Pro Only',
    description: 'Save and reload your sessions at any time. Never lose your work again.',
  },
  templates: {
    title: 'Save Templates — Pro Only',
    description: 'Create reusable naming templates with descriptors and SKU patterns to speed up every project.',
  },
  raw: {
    title: 'RAW Processing — Pro Only',
    description: 'Process, preview, and convert RAW files from all major camera brands.',
  },
  ai: {
    title: 'AI Suggestions — Pro Only',
    description: 'Let AI analyze your images and suggest accurate descriptors automatically.',
  },
  history: {
    title: 'Export History — Pro Only',
    description: 'Access your last 30 days of exports. Review, re-download, and track everything.',
  },
}

const PRO_FEATURES = [
  'Unlimited images per session',
  'Save & load unlimited projects',
  'Create up to 10 naming templates',
  'RAW file processing (CR2, NEF, ARW…)',
  '30-day export history',
  'Priority support',
]

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const copy = FEATURE_COPY[feature]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-deep-space border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-linear-to-br from-treez-purple/10 via-transparent to-treez-pink/10 pointer-events-none" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-treez-purple/20 to-treez-pink/20 border border-treez-purple/30 flex items-center justify-center mb-5">
              <Zap className="w-7 h-7 text-treez-purple" />
            </div>

            {/* Copy */}
            <h2 className="text-2xl font-bold text-white mb-2 font-display">{copy.title}</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{copy.description}</p>

            {/* Pro features */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-2.5">
              <p className="text-xs font-semibold text-treez-purple uppercase tracking-widest mb-3">
                Everything in Pro
              </p>
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-success/10 border border-success/30 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-success" />
                  </div>
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Link href="/pricing" onClick={onClose} className="w-full">
                <Button variant="primary" size="lg" className="w-full justify-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
