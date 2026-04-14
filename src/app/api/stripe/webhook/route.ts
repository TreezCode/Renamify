import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import type { Stripe } from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Get Supabase user ID from customer metadata
        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata.supabase_user_id

        if (!userId) {
          console.error('No supabase_user_id in customer metadata')
          break
        }

        // Update user profile with subscription status
        const tier = subscription.status === 'active' ? 'pro' : 'free'
        
        await supabase
          .from('user_profiles')
          .update({ subscription_tier: tier })
          .eq('id', userId)

        // Log subscription event
        await supabase
          .from('subscription_events')
          .insert({
            user_id: userId,
            event_type: event.type === 'customer.subscription.created' 
              ? 'subscribed' 
              : subscription.status === 'active' ? 'renewed' : 'downgraded',
            stripe_subscription_id: subscription.id,
            metadata: {
              status: subscription.status,
            },
          })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata.supabase_user_id

        if (!userId) {
          console.error('No supabase_user_id in customer metadata')
          break
        }

        // Downgrade to free tier
        await supabase
          .from('user_profiles')
          .update({ subscription_tier: 'free' })
          .eq('id', userId)

        // Log subscription event
        await supabase
          .from('subscription_events')
          .insert({
            user_id: userId,
            event_type: 'canceled',
            stripe_subscription_id: subscription.id,
            metadata: {
              canceled_at: subscription.canceled_at,
              ended_at: subscription.ended_at,
            },
          })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as Stripe.Customer).metadata.supabase_user_id

        if (!userId) {
          console.error('No supabase_user_id in customer metadata')
          break
        }

        // Log payment failure (could send email notification here)
        console.warn(`Payment failed for user ${userId}`)
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
