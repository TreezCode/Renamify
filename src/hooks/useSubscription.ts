'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionTier, getSubscriptionLimits } from '@/lib/subscription'

interface UseSubscriptionReturn {
  tier: SubscriptionTier
  limits: ReturnType<typeof getSubscriptionLimits>
  loading: boolean
  isPro: boolean
  isFree: boolean
}

/**
 * Hook to get current user's subscription tier and limits
 */
export function useSubscription(): UseSubscriptionReturn {
  const [tier, setTier] = useState<SubscriptionTier>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadSubscription() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user ?? null

        if (!user) {
          setTier('free')
          setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        if (profile) {
          setTier((profile.subscription_tier as SubscriptionTier) || 'free')
        }
      } catch (error) {
        console.error('Error loading subscription:', error)
        setTier('free')
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()

    const channelName = `subscription_changes_${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
        },
        (payload) => {
          if (payload.new.subscription_tier) {
            setTier(payload.new.subscription_tier as SubscriptionTier)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const limits = getSubscriptionLimits(tier)

  return {
    tier,
    limits,
    loading,
    isPro: tier === 'pro',
    isFree: tier === 'free',
  }
}
