# Stripe Setup Guide for Renamify

## Overview

This guide will walk you through setting up Stripe for subscription payments in Renamify.

**Pricing:**
- **Free:** $0/month (20 images/session, no saved projects)
- **Pro:** $19/month (unlimited images, unlimited projects, advanced features)

---

## 📋 Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a free account
3. Complete the verification process (for production)
4. For development, you can start with **Test Mode** immediately

---

## 🔑 Step 2: Get API Keys

1. Go to [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys)
2. Enable **Test mode** toggle (top right)
3. Copy the following keys:

**For .env.local:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

⚠️ **Never** commit your secret key to Git!

---

## 💰 Step 3: Create Pro Product

### Create Product

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products)
2. Click **"Add product"**
3. Fill in details:
   - **Name:** Renamify Pro
   - **Description:** Unlimited image renaming with advanced features
   - **Pricing model:** Standard pricing
   - **Price:** $19.00 USD
   - **Billing period:** Monthly
   - **Recurring:** Yes

4. Click **"Save product"**

### Get Price ID

1. After creating, click on the product
2. In the **Pricing** section, copy the **Price ID** (format: `price_xxxxx`)
3. Add to `.env.local`:

```bash
STRIPE_PRICE_ID_PRO=price_xxxxx
```

---

## 🔔 Step 4: Configure Webhooks

Webhooks notify your app when subscription events occur (payment success, cancellation, etc.).

### For Local Development (using Stripe CLI)

1. Install Stripe CLI:
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # Mac
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`):
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### For Production (Vercel Deployment)

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your production URL:
   ```
   https://your-app.vercel.app/api/stripe/webhook
   ```

4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

5. Click **"Add endpoint"**
6. Click **"Reveal"** next to **Signing secret**
7. Add to Vercel environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

---

## 🔒 Step 5: Configure Customer Portal

The customer portal allows users to manage their subscriptions, update payment methods, and view invoices.

1. Go to [Stripe Dashboard → Settings → Billing → Customer portal](https://dashboard.stripe.com/test/settings/billing/portal)
2. Click **"Activate test link"**
3. Configure settings:
   - ✅ **Allow customers to update subscription:** Enable
   - ✅ **Allow customers to cancel subscription:** Enable (optional)
   - ✅ **Allow customers to update payment method:** Enable
   - ✅ **Allow customers to view invoice history:** Enable

4. Set **Subscription cancellation** behavior:
   - Recommended: Cancel at period end (allows grace period)
   - Alternative: Cancel immediately

5. Click **"Save changes"**

---

## 🌐 Step 6: Configure Environment Variables

### Development (.env.local)

Create `.env.local` in your project root:

```bash
# Supabase (from SUPABASE_SETUP.md)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Products
STRIPE_PRICE_ID_PRO=price_xxx

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from above (use **production** Stripe keys!)
3. Select **Production** environment
4. Click **"Save"**

---

## 🧪 Step 7: Test Payment Flow

### Test Cards

Stripe provides test cards for development:

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Payment Requires Authentication (3D Secure):**
```
Card: 4000 0025 0000 3155
```

**Card Declined:**
```
Card: 4000 0000 0000 9995
```

[Full list of test cards](https://stripe.com/docs/testing)

### Test the Flow

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. In another terminal, start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Navigate to pricing page (create one or test checkout directly)
4. Click **"Upgrade to Pro"**
5. Use test card `4242 4242 4242 4242`
6. Complete checkout
7. Verify:
   - User redirected to dashboard with success message
   - Supabase `user_profiles` table shows `subscription_tier: 'pro'`
   - Supabase `subscription_events` table has new record
   - Stripe Dashboard shows successful subscription

### Test Subscription Cancellation

1. Click **"Manage Subscription"** in dashboard
2. Opens Stripe Customer Portal
3. Click **"Cancel plan"**
4. Confirm cancellation
5. Verify:
   - Supabase `user_profiles` shows `subscription_tier: 'free'` (if immediate)
   - OR subscription continues until period end (if configured)
   - `subscription_events` table has cancellation record

---

## 🔐 Security Checklist

- [ ] Never commit `.env.local` to Git (already in `.gitignore`)
- [ ] Use environment variables for all API keys
- [ ] Verify webhook signatures in production
- [ ] Use HTTPS for webhook endpoints in production
- [ ] Keep secret keys secure (rotate if exposed)
- [ ] Use test mode for development
- [ ] Switch to live mode only when ready for production

---

## 🚀 Going Live

When ready for real payments:

1. **Complete Stripe verification:**
   - Business information
   - Bank account for payouts
   - Tax information

2. **Switch to live mode:**
   - Toggle **Live mode** in Stripe Dashboard
   - Get new API keys (starts with `pk_live_` and `sk_live_`)
   - Update production environment variables

3. **Create live products:**
   - Create Renamify Pro product in live mode
   - Get live Price ID
   - Update `STRIPE_PRICE_ID_PRO` in production

4. **Configure live webhooks:**
   - Add production webhook endpoint
   - Get live webhook secret
   - Update `STRIPE_WEBHOOK_SECRET` in production

5. **Test with real card:**
   - Use a real credit card (will charge $19)
   - Verify complete flow works
   - Immediately cancel/refund test subscription

6. **Monitor:**
   - Check Stripe Dashboard regularly
   - Set up email notifications for failed payments
   - Review subscription metrics

---

## 📊 Monitoring & Analytics

### Stripe Dashboard

Monitor key metrics:
- **MRR (Monthly Recurring Revenue)**
- **Active subscriptions**
- **Churn rate**
- **Failed payments**

### Useful Stripe Reports

1. Go to [Stripe Dashboard → Reports](https://dashboard.stripe.com/test/reports)
2. Key reports:
   - **Balance:** See your available funds
   - **Payouts:** Track when money hits your bank
   - **Subscriptions:** Growth and churn metrics

---

## 🆘 Troubleshooting

### Webhook not receiving events

**Solution:**
- Check Stripe CLI is running: `stripe listen`
- Verify webhook secret matches `.env.local`
- Check webhook endpoint is accessible
- Review Stripe Dashboard → Webhooks → Logs

### Payment fails immediately

**Solution:**
- Verify API keys are correct
- Check test mode is enabled in dashboard
- Use proper test card numbers
- Review browser console for errors

### Subscription not updating in Supabase

**Solution:**
- Check webhook handler logs
- Verify customer metadata has `supabase_user_id`
- Check Supabase RLS policies allow updates
- Review subscription_events table for errors

### Customer portal not working

**Solution:**
- Verify portal is activated in Stripe Settings
- Check customer has valid Stripe customer ID
- Ensure portal session API endpoint works
- Review browser network tab for errors

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/customer-portal)

---

## 💡 Pro Tips

1. **Test extensively in test mode** - It's free and safe!
2. **Set up email notifications** - Know when payments fail
3. **Use webhook retries** - Stripe retries failed webhooks automatically
4. **Monitor failed payments** - Reach out to customers proactively
5. **Offer grace period** - Don't downgrade immediately on payment failure
6. **Send payment receipts** - Stripe handles this automatically
7. **Add tax handling** - Use Stripe Tax for automatic calculation
8. **Consider annual billing** - Offer discount for annual subscribers

---

## 🎯 Next Steps

1. ✅ Complete Stripe setup (this guide)
2. ⏭️ Build pricing page UI
3. ⏭️ Add checkout button to pricing page
4. ⏭️ Build dashboard billing section
5. ⏭️ Implement tier-gated features
6. ⏭️ Test complete user journey
7. ⏭️ Go live!

**Ready to accept payments!** 💰
