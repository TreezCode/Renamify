# Stripe Webhook Quick Setup Guide

## 🎯 Goal
Get Stripe webhooks working in your local development environment so you can test subscriptions.

---

## ✅ Prerequisites

1. Stripe account created (test mode is fine)
2. Development server ready to run (`npm run dev`)
3. Windows PC (you're on Windows based on your file paths)

---

## 📦 Step 1: Install Stripe CLI

### For Windows:

**Option A: Using Scoop (Recommended)**
```powershell
# If you don't have Scoop, install it first:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Then install Stripe CLI:
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Option B: Direct Download**
1. Go to: https://github.com/stripe/stripe-cli/releases/latest
2. Download `stripe_X.X.X_windows_x86_64.zip`
3. Extract to a folder (e.g., `C:\stripe`)
4. Add to PATH:
   - Open Start → Search "environment variables"
   - Click "Environment Variables"
   - Under "User variables", select "Path" → Edit
   - Click "New" → Add the path where you extracted (e.g., `C:\stripe`)
   - Click OK on all windows

### Verify Installation

Open a **new** PowerShell window and run:
```powershell
stripe --version
```

You should see something like: `stripe version 1.x.x`

---

## 🔑 Step 2: Login to Stripe CLI

In PowerShell, run:
```powershell
stripe login
```

This will:
1. Open your browser
2. Ask you to log in to Stripe Dashboard
3. Ask you to allow access
4. Show "Success! You're authenticated"

**Important:** Make sure you're in **Test Mode** (toggle in top right of Stripe Dashboard)

---

## 🚀 Step 3: Start Your Dev Server

In one PowerShell window, navigate to your project and start the dev server:

```powershell
cd C:\Users\treez\OneDrive\Documents\Development\Renamify
npm run dev
```

Keep this window open. You should see:
```
▲ Next.js 16.2.3
- Local: http://localhost:3000
```

---

## 🔌 Step 4: Start Webhook Forwarding

**Open a SECOND PowerShell window** and run:

```powershell
cd C:\Users\treez\OneDrive\Documents\Development\Renamify
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like this:

```
> Ready! Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz
  (^C to quit)
```

**🎯 COPY THE WEBHOOK SECRET!** It starts with `whsec_`

Example: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

---

## ⚙️ Step 5: Add Webhook Secret to .env.local

1. In your project root, create/edit `.env.local`
2. Add the webhook secret you just copied:

```bash
# Stripe Webhook Secret (from Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

**Your complete `.env.local` should look like:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rgquzykwfixvnokgiizn.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# Stripe Test Keys (from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # ← From Stripe CLI

# Stripe Product IDs (you'll get this in Step 7)
STRIPE_PRICE_ID_PRO=price_xxx

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🔄 Step 6: Restart Dev Server

1. Go back to your first PowerShell window (where dev server is running)
2. Press `Ctrl+C` to stop it
3. Restart:
   ```powershell
   npm run dev
   ```

Now your app can receive webhook events!

---

## 💳 Step 7: Create Test Product in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"Add product"**
3. Fill in:
   - **Name:** Renamify Pro
   - **Description:** Unlimited image renaming with advanced features
   - **Price:** $19.00 USD
   - **Billing period:** Monthly
   - **Recurring:** Yes

4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_`)
6. Add to `.env.local`:
   ```bash
   STRIPE_PRICE_ID_PRO=price_1234567890abcdefghij
   ```

7. Restart dev server again (Ctrl+C, then `npm run dev`)

---

## ✅ Step 8: Test the Webhook

### Method 1: Trigger Test Event from Stripe CLI

In your second PowerShell window (where Stripe CLI is running), open a **THIRD** window and run:

```powershell
stripe trigger customer.subscription.created
```

You should see:
1. In the Stripe CLI window: `Received event` message
2. In your dev server logs: Webhook processing logs
3. No errors!

### Method 2: Create a Test Checkout (More Realistic)

We'll create a simple test page:

**Create file:** `src/app/test-checkout/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { getStripe } from '@/lib/stripe/client'

export default function TestCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError('')

      // Call your checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      const { sessionId, error: apiError } = await response.json()

      if (apiError) {
        setError(apiError)
        return
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        setError('Failed to load Stripe')
        return
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        setError(stripeError.message || 'Checkout failed')
      }
    } catch (err) {
      setError('Something went wrong')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold mb-4">Test Stripe Checkout</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Test Checkout ($19/month)'}
        </button>

        <p className="mt-4 text-sm text-white/60 text-center">
          Use test card: 4242 4242 4242 4242
        </p>
      </div>
    </div>
  )
}
```

Now test it:

1. Make sure dev server is running
2. Make sure Stripe CLI is forwarding webhooks
3. Go to: http://localhost:3000/test-checkout
4. Click **"Test Checkout"**
5. Use test card: **4242 4242 4242 4242**
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
6. Complete checkout

### What Should Happen:

1. **Redirects to success URL** ✅
2. **Stripe CLI shows webhook event** ✅
3. **Check Supabase:**
   - Go to: https://app.supabase.com
   - Select your project
   - Table Editor → `user_profiles`
   - Your user should have `subscription_tier: 'pro'`
4. **Check Stripe Dashboard:**
   - Customers tab should show your customer
   - Subscriptions tab should show active subscription

---

## 🐛 Troubleshooting

### Issue: "stripe: command not found"

**Solution:** Stripe CLI not installed or not in PATH
- Reinstall using one of the methods above
- Restart PowerShell after installation
- Verify with `stripe --version`

### Issue: Webhook secret keeps changing

**Solution:** This is normal! Each time you run `stripe listen`, you get a new secret
- Copy the new secret to `.env.local`
- Restart dev server
- This only happens in development. Production webhooks have permanent secrets.

### Issue: "Webhook signature verification failed"

**Solution:** Secret mismatch
1. Make sure you copied the FULL secret (starts with `whsec_`)
2. No extra spaces in `.env.local`
3. Restart dev server after updating `.env.local`
4. Check Stripe CLI is still running

### Issue: "Failed to create checkout session"

**Solution:** Missing or invalid keys
1. Verify `STRIPE_SECRET_KEY` in `.env.local`
2. Make sure you're using TEST mode keys (start with `pk_test_` and `sk_test_`)
3. Get keys from: https://dashboard.stripe.com/test/apikeys
4. Restart dev server

### Issue: Events not showing in Stripe CLI

**Solution:** Endpoint mismatch
1. Make sure dev server is running on port 3000
2. Check Stripe CLI command: `--forward-to localhost:3000/api/stripe/webhook`
3. Verify webhook route exists: http://localhost:3000/api/stripe/webhook

### Issue: Subscription tier not updating in Supabase

**Solution:** Check webhook handler logs
1. Look at your dev server console for errors
2. Check Supabase RLS policies allow updates
3. Verify `stripe_customer_id` is saved in `user_profiles`
4. Check `subscription_events` table for logged events

---

## 🎯 Verification Checklist

Once everything is working, you should have:

- [ ] Stripe CLI installed and logged in
- [ ] Dev server running (localhost:3000)
- [ ] Stripe CLI forwarding webhooks (second terminal)
- [ ] `.env.local` with all required keys
- [ ] Test product created with Price ID
- [ ] Test checkout completes successfully
- [ ] Webhook events showing in Stripe CLI
- [ ] Subscription tier updates in Supabase
- [ ] No errors in dev server console

---

## 📞 Need More Help?

If you're still stuck, share:
1. Which step you're on
2. Any error messages you're seeing
3. Screenshot of Stripe CLI output (hide any secrets!)
4. Dev server console output

I'll help you debug! 🚀
