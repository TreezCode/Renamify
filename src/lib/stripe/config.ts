/**
 * Stripe Configuration
 * 
 * Pricing:
 * - Free: $0/month (20 images/session, no projects, no templates)
 * - Pro: $19/month (unlimited images, unlimited projects, 10 templates)
 */

export const STRIPE_CONFIG = {
  // Pricing
  plans: {
    free: {
      name: 'Free',
      price: 0,
      features: {
        imagesPerSession: 20,
        savedProjects: 0,
        savedTemplates: 0,
        exportHistory: false,
        batchOperations: false,
        aiSuggestions: false,
        rawProcessing: false,
        prioritySupport: false,
      },
    },
    pro: {
      name: 'Pro',
      price: 19,
      priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_placeholder',
      features: {
        imagesPerSession: -1, // unlimited
        savedProjects: -1, // unlimited
        savedTemplates: 10,
        exportHistory: true,
        batchOperations: true,
        aiSuggestions: true,
        rawProcessing: true,
        prioritySupport: true,
      },
    },
  },

  // URLs
  urls: {
    success: '/dashboard?success=true',
    cancel: '/pricing?canceled=true',
    portal: '/dashboard/billing',
  },
} as const

export type SubscriptionTier = 'free' | 'pro'
