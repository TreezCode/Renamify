'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Crown, Zap, TrendingUp, Calendar, CreditCard, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  subscription_tier: 'free' | 'pro'
  stripe_customer_id: string | null
}

interface UsageStats {
  images_processed: number
  projects_created: number
}

export default function BillingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const supabase = createClient()

  const loadBillingData = useCallback(async () => {
    try {
      // Get user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get subscription tier
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('subscription_tier, stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          subscription_tier: (profileData.subscription_tier as 'free' | 'pro') || 'free',
          stripe_customer_id: profileData.stripe_customer_id
        })
      }

      // Get current month usage
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('images_processed, projects_created')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single()

      setUsage({
        images_processed: usageData?.images_processed || 0,
        projects_created: usageData?.projects_created || 0
      })
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadBillingData()
  }, [loadBillingData])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error('Failed to create portal session')
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
      alert('Failed to open billing portal. Please try again.')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-treez-purple animate-spin" />
      </div>
    )
  }

  const isPro = profile?.subscription_tier === 'pro'
  const imagesLimit = 20
  const imagesUsed = usage?.images_processed || 0
  const imagesPercentage = isPro ? 0 : Math.min((imagesUsed / imagesLimit) * 100, 100)

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-display">
            <span className="bg-gradient-to-r from-treez-purple to-treez-cyan bg-clip-text text-transparent">
              Billing & Subscription
            </span>
          </h1>
          <p className="text-gray-400">
            Manage your subscription and view usage statistics
          </p>
        </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${
              isPro 
                ? 'bg-gradient-to-br from-treez-purple/20 to-treez-cyan/20 border border-treez-purple/30' 
                : 'bg-white/5 border border-white/10'
            }`}>
              {isPro ? (
                <Crown className="w-8 h-8 text-treez-purple" />
              ) : (
                <Zap className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{isPro ? 'Pro Plan' : 'Free Plan'}</h2>
              <p className="text-gray-400">
                {isPro ? '$19 per month' : 'No credit card required'}
              </p>
            </div>
          </div>

          {isPro ? (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              <span>Manage Subscription</span>
            </button>
          ) : (
            <Link
              href="/api/stripe/checkout"
              className="group relative px-6 py-3 bg-gradient-to-r from-treez-purple to-treez-pink rounded-xl font-semibold text-white shadow-lg hover:shadow-treez-purple/50 transition-all duration-300 hover:scale-105 overflow-hidden flex items-center gap-2"
            >
              <span className="relative z-10">Upgrade to Pro</span>
              <Crown className="w-5 h-5 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-treez-pink to-treez-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          )}
        </div>

        {/* Plan Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Images per Session</div>
            <div className="text-xl font-bold">{isPro ? 'Unlimited' : '20 max'}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Saved Projects</div>
            <div className="text-xl font-bold">{isPro ? 'Unlimited' : '0'}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Saved Templates</div>
            <div className="text-xl font-bold">{isPro ? '10' : '0'}</div>
          </div>
        </div>
      </motion.div>

      {/* Usage This Month */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-treez-cyan" />
          <h2 className="text-2xl font-bold">Usage This Month</h2>
        </div>

        <div className="space-y-6">
          {/* Images Processed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Images Processed</span>
              <span className="font-semibold">
                {imagesUsed} {!isPro && `/ ${imagesLimit}`}
              </span>
            </div>
            {!isPro && (
              <>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      imagesPercentage >= 80
                        ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                        : 'bg-gradient-to-r from-treez-purple to-treez-cyan'
                    }`}
                    style={{ width: `${imagesPercentage}%` }}
                  />
                </div>
                {imagesPercentage >= 80 && (
                  <p className="text-sm text-yellow-500 mt-2">
                    You are approaching your monthly limit. Upgrade to Pro for unlimited images.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Projects Created */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Projects Created</span>
              <span className="font-semibold">
                {usage?.projects_created || 0} {isPro && 'projects'}
              </span>
            </div>
            {!isPro && (
              <p className="text-sm text-gray-500 mt-1">
                Upgrade to Pro to save and manage unlimited projects
              </p>
            )}
          </div>
        </div>

        {!isPro && (
          <Link
            href="/pricing"
            className="mt-6 w-full py-3 border-2 border-treez-cyan rounded-xl font-semibold text-treez-cyan hover:bg-treez-cyan/10 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>View Pricing</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </motion.div>

      {/* Payment History (Pro only) */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-treez-purple" />
            <h2 className="text-2xl font-bold">Payment History</h2>
          </div>

          <p className="text-gray-400 mb-4">
            View your complete billing history and download invoices in the Stripe Customer Portal.
          </p>

          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>View Payment History</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h3 className="font-semibold text-white mb-2">Need Help?</h3>
        <p className="text-gray-400 text-sm">
          If you have questions about billing or need to make changes to your subscription,{' '}
          <a href="mailto:support@renamerly.com" className="text-treez-cyan hover:underline">
            contact our support team
          </a>
          .
        </p>
      </motion.div>
      </div>
    </div>
  )
}
