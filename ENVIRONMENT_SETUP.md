# Environment Variable Setup Guide

## 🎯 Overview

This guide explains how to manage environment variables for **local development**, **preview deployments**, and **production** with different Stripe modes (test vs live).

---

## 📁 Environment File Structure

```
.env.local          # Local development (gitignored) - YOU CREATE THIS
.env.local.example  # Template for .env.local
.env.example        # Legacy template (keep for reference)
```

---

## 🔧 Local Development Setup

### Step 1: Create `.env.local`

Copy the example file:
```bash
cp .env.local.example .env.local
```

### Step 2: Fill in Your Values

Edit `.env.local` with your actual keys:

```bash
# Supabase (same for all environments)
NEXT_PUBLIC_SUPABASE_URL=https://rgquzykwfixvnokgiizn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_actual_key

# Stripe TEST mode (for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_test_key
STRIPE_SECRET_KEY=sk_test_your_actual_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret
STRIPE_PRICE_ID_PRO=price_your_test_price_id
```

### Step 3: Get Stripe CLI Webhook Secret

Start Stripe CLI for local webhooks:
```bash
stripe listen --forward-to https://rgquzykwfixvnokgiizn.supabase.co/functions/v1/stripe-webhook
```

Copy the `whsec_xxx` secret and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

**Also add it to Supabase Edge Function:**
- Go to: Supabase Dashboard → Edge Functions → stripe-webhook → Environment Variables
- Add: `STRIPE_WEBHOOK_SECRET` = `whsec_xxx`

---

## 🚀 Vercel Environment Configuration

Vercel has **three environments**: Development, Preview, and Production.

### Recommended Setup:

| Variable | Development | Preview | Production |
|----------|------------|---------|------------|
| Supabase Keys | ✅ | ✅ | ✅ |
| Stripe Keys | **Test** | **Test** | **Live** |

### How to Configure in Vercel:

1. **Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add Supabase Variables** (all environments):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```
   - Select: ✅ Production ✅ Preview ✅ Development

3. **Add Stripe TEST Variables** (Development & Preview only):
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_xxx
   STRIPE_SECRET_KEY = sk_test_xxx
   STRIPE_WEBHOOK_SECRET = whsec_test_xxx
   STRIPE_PRICE_ID_PRO = price_test_xxx
   ```
   - Select: ❌ Production ✅ Preview ✅ Development

4. **Add Stripe LIVE Variables** (Production only):
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_xxx
   STRIPE_SECRET_KEY = sk_live_xxx
   STRIPE_WEBHOOK_SECRET = whsec_live_xxx
   STRIPE_PRICE_ID_PRO = price_live_xxx
   ```
   - Select: ✅ Production ❌ Preview ❌ Development

---

## 🔄 Switching Between Test and Production Locally

### Option 1: Swap in .env.local (Recommended)

**For Test Mode** (default):
```bash
# Use test keys (already set)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

**For Production Testing**:
```bash
# Comment out test keys, uncomment live keys
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Commented
# STRIPE_SECRET_KEY=sk_test_xxx                    # Commented

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx   # Active
STRIPE_SECRET_KEY=sk_live_xxx                     # Active
```

Restart dev server after changing:
```bash
npm run dev
```

### Option 2: Use Separate Files

**Create `.env.local.test`:**
```bash
# All test keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
STRIPE_PRICE_ID_PRO=price_test_xxx
```

**Create `.env.local.production`:**
```bash
# All live keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxx
STRIPE_PRICE_ID_PRO=price_live_xxx
```

**Switch with copy command:**
```bash
# Use test environment
cp .env.local.test .env.local

# Use production environment  
cp .env.local.production .env.local
```

---

## 🔍 How to Tell Which Mode You're In

### Check Stripe Dashboard:
- **Test Mode**: Toggle in top-right shows "Test mode"
- **Live Mode**: Toggle shows "Live mode"

### Check Your Keys:
- **Test**: `pk_test_xxx`, `sk_test_xxx`, `price_test_xxx`
- **Live**: `pk_live_xxx`, `sk_live_xxx`, `price_live_xxx`

### In Code (Optional):
Add this to your app to show current mode during development:

```typescript
// Only show in development
if (process.env.NODE_ENV === 'development') {
  const isTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test')
  console.log(`🔧 Stripe Mode: ${isTestMode ? 'TEST' : 'LIVE'}`)
}
```

---

## 📋 Environment Variable Checklist

### Local Development (.env.local):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test)
- [ ] `STRIPE_SECRET_KEY` (test)
- [ ] `STRIPE_WEBHOOK_SECRET` (test)
- [ ] `STRIPE_PRICE_ID_PRO` (test)

### Vercel - Preview & Development:
- [ ] Same as local development (test keys)

### Vercel - Production:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live)
- [ ] `STRIPE_SECRET_KEY` (live)
- [ ] `STRIPE_WEBHOOK_SECRET` (live)
- [ ] `STRIPE_PRICE_ID_PRO` (live)

### Supabase Edge Function:
- [ ] `STRIPE_SECRET_KEY` (matches environment - test or live)
- [ ] `STRIPE_WEBHOOK_SECRET` (matches environment)

---

## 🧪 Testing Workflow

### Development Phase (Current):
1. ✅ Use **test mode** in `.env.local`
2. ✅ Stripe CLI forwards test webhooks
3. ✅ Test with card: `4242 4242 4242 4242`
4. ✅ Verify in Stripe test dashboard
5. ✅ Check Supabase database updates

### Pre-Production Testing:
1. Switch to **live keys** in `.env.local`
2. Update Supabase Edge Function to use live keys
3. Test with **real card** (small amount)
4. Verify payment in Stripe live dashboard
5. Confirm database updates
6. **Immediately refund** the test payment
7. Switch back to test mode

### Production Launch:
1. Ensure **live keys** in Vercel Production environment
2. Update Supabase Edge Function to use live keys
3. Deploy to production
4. Test checkout flow with small real payment
5. Verify everything works
6. Monitor webhook logs

---

## 🚨 Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already done)
- Use test keys for development
- Use separate Stripe webhooks for test vs live
- Store production keys only in Vercel
- Rotate keys if exposed

### ❌ DON'T:
- Commit `.env.local` to git
- Use live keys in development
- Share secret keys in chat/email
- Hardcode keys in code
- Use same webhook for test and live

---

## 🔗 Quick Reference

### Where to Find Keys:

**Supabase:**
- Dashboard → Project Settings → API
- Get: URL and Publishable Key

**Stripe Test Keys:**
- Dashboard → Developers → API Keys (Test mode toggle ON)
- Get: Publishable key, Secret key

**Stripe Live Keys:**
- Dashboard → Developers → API Keys (Test mode toggle OFF)  
- Get: Publishable key, Secret key

**Stripe Webhooks:**
- Dashboard → Developers → Webhooks
- Create separate endpoints for test and live

**Stripe Price IDs:**
- Dashboard → Products
- Different IDs for test and live mode

---

## 🆘 Troubleshooting

### "Invalid API key provided"
- Check key format (test vs live)
- Ensure no extra spaces
- Verify key is active in Stripe dashboard

### "Webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` matches
- Update Supabase Edge Function secret
- Restart Stripe CLI

### "Environment variable not found"
- Restart dev server after changing `.env.local`
- Check spelling and format
- Verify file name is exactly `.env.local`

### "Payment works locally but not on Vercel"
- Check Vercel environment variables are set correctly
- Verify environment (Preview vs Production)
- Check Vercel deployment logs

---

## 📞 Support

If you run into issues:
1. Check this guide
2. Verify all keys in `.env.local`
3. Check Vercel environment variables
4. Review Stripe dashboard (test/live mode)
5. Check Supabase Edge Function logs

**Built with ♥ by Build With Treez**
