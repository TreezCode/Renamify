'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Save, Loader2, AlertTriangle, LogOut, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser({ id: user.id, email: user.email || '' })

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) setFullName(profile.full_name)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('user_profiles')
      .update({ full_name: fullName.trim() || null })
      .eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-treez-purple animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display bg-linear-to-r from-treez-purple to-treez-pink bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Manage your account preferences</p>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-treez-purple/20 to-treez-cyan/20 flex items-center justify-center">
              <User className="w-4 h-4 text-treez-purple" />
            </div>
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-treez-purple/50 focus:bg-white/8 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white/3 border border-white/5 rounded-xl">
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400">{user?.email}</span>
                <span className="ml-auto text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">Read-only</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-success"
                >
                  ✓ Saved
                </motion.span>
              )}
            </div>
          </form>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-treez-cyan/20 to-treez-purple/20 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-treez-cyan" />
            </div>
            <h2 className="text-lg font-semibold text-white">Account</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-white">Subscription Plan</p>
                <p className="text-xs text-gray-500 mt-0.5">Manage billing and plan details</p>
              </div>
              <Link href="/dashboard/billing">
                <Button variant="secondary" size="sm">
                  View Billing
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-white">Sign Out</p>
                <p className="text-xs text-gray-500 mt-0.5">Sign out of your account on this device</p>
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-error/5 border border-error/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-error" />
            </div>
            <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-error bg-error/10 border border-error/30 rounded-xl hover:bg-error/20 transition-all"
            onClick={() => alert('Account deletion is not yet available. Contact support.')}
          >
            <AlertTriangle className="w-4 h-4" />
            Delete Account
          </button>
        </motion.div>
      </div>
    </div>
  )
}
