# Stripe Integration Debugging Findings

## 🎯 Test Results Summary

### ✅ What's Working

1. **Signup Flow** - Users can create accounts successfully
2. **Authentication** - Login state persists correctly  
3. **Checkout API** - Creates Stripe checkout sessions when authenticated
4. **Stripe Redirect** - Successfully redirects to Stripe Checkout page
5. **Stripe Customer Creation** - Customer is created and ID is saved to `user_profiles`

### ❌ What's NOT Working

1. **Subscription Updates in Supabase** - The webhook receives events but subscription_tier isn't updating
2. **Database Logging** - Need to check dev server logs to see webhook errors

---

## 🔍 Root Cause Analysis

### Issue: Unauthorized Error on Test Checkout

**Problem:** Initial checkout attempt returned `401 Unauthorized`

**Cause:** User wasn't logged in

**Solution:** ✅ Must sign up/login before testing checkout

### Issue: Subscription Tier Not Updating

**Likely Causes:**

1. **Webhook Not Firing** - Stripe CLI might not be running or configured correctly
2. **Webhook Secret Mismatch** - Wrong secret in `.env.local`
3. **Database RLS Policies** - Supabase policies might be blocking the update
4. **Missing User Metadata** - `supabase_user_id` not in Stripe customer metadata
5. **Webhook Handler Error** - Silent error in the database update code

---

## 🔧 Debugging Steps to Follow

### Step 1: Verify Webhook is Receiving Events

Check your **dev server console** (Terminal 1) after completing checkout. You should see:

```
[Webhook] Received event: customer.subscription.created
Updating user <uuid> to tier: pro
Profile updated successfully: [...]
Subscription event logged: [...]
```

**If you DON'T see these logs:**
- Stripe CLI is not forwarding webhooks
- Webhook secret is incorrect
- Webhook endpoint is not accessible

### Step 2: Check for Database Errors

If you see logs like:

```
[Webhook] Received event: customer.subscription.created
Updating user <uuid> to tier: pro
Failed to update user profile: { ... error details ... }
```

**This means:**
- RLS policies are blocking the update
- User ID doesn't exist in `user_profiles`
- Column doesn't exist (typo)

### Step 3: Verify Stripe Customer Metadata

In Stripe Dashboard → Customers → Click on the test customer

Check **Metadata** section should have:
```
supabase_user_id: <your-user-uuid>
```

**If missing:**
- Checkout API didn't set metadata correctly
- Customer was created before we added metadata

### Step 4: Check Supabase Directly

1. Go to: https://app.supabase.com
2. Select your project
3. Table Editor → `user_profiles`
4. Find your test user (email: `test-stripe@example.com`)
5. Check `subscription_tier` column

**Expected:** Should be `'pro'` after completing checkout

**If still `'free'`:**
- Webhook didn't update it
- Check `subscription_events` table for logged events

---

## 🐛 Common Issues & Solutions

### Issue: "Webhook signature verification failed"

**Solution:**
1. Make sure Stripe CLI is running:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Copy the webhook secret (starts with `whsec_`)
3. Update `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
4. Restart dev server

### Issue: Webhook receives event but no database update

**Check RLS Policies:**

The webhook handler uses a server-side Supabase client that should have service role permissions. However, if it's using the publishable key, it might be blocked by RLS.

**Fix:** Verify `src/lib/supabase/server.ts` creates client with proper credentials:

```typescript
// Should use service role for admin operations
// Or ensure RLS policies allow updates from authenticated context
```

### Issue: "No supabase_user_id in customer metadata"

**Solution:**

The checkout API should set this metadata. Check `src/app/api/stripe/checkout/route.ts`:

```typescript
// When creating customer
const customer = await stripe.customers.create({
  email: user.email,
  metadata: {
    supabase_user_id: user.id,  // ← Make sure this is set
  },
})

// When creating checkout session
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  // ...
  metadata: {
    supabase_user_id: user.id,  // ← Also set here
  },
})
```

---

## ✅ Next Steps to Fix

### 1. Check Dev Server Logs (PRIORITY 1)

After completing a test checkout, check your dev server terminal for the webhook logs. This will tell us exactly what's failing.

**What to look for:**
- `[Webhook] Received event:` - Webhook is firing
- `Updating user <id> to tier: pro` - Update is being attempted
- `Profile updated successfully` - Update worked!
- `Failed to update user profile` - Error details here

### 2. Test Webhook with Stripe CLI (PRIORITY 2)

Instead of going through the full checkout, test the webhook directly:

```bash
# In a third terminal:
stripe trigger customer.subscription.created
```

Check dev server logs for the same messages.

### 3. Manual Database Check (PRIORITY 3)

If webhook logs show success but database doesn't update:

1. Check Supabase Table Editor
2. Manually update a test user to `'pro'`
3. Refresh and verify it persists
4. If manual update works, issue is with webhook authentication

### 4. Test Cancellation Flow (AFTER FIXING UPDATES)

Once subscription creation works:

```bash
# Trigger cancellation
stripe trigger customer.subscription.deleted
```

Should downgrade user back to `'free'` tier.

---

## 📊 Testing Checklist

- [x] User can sign up
- [x] User can log in  
- [x] Checkout page loads
- [x] Checkout redirects to Stripe
- [ ] Webhook receives subscription.created event
- [ ] Database updates subscription_tier to 'pro'
- [ ] subscription_events table logs event
- [ ] User can access pro features
- [ ] User can cancel subscription
- [ ] Database updates subscription_tier to 'free'
- [ ] subscription_events table logs cancellation

---

## 🎯 What to Do Now

1. **Complete a test checkout** while watching dev server logs
2. **Share the dev server console output** - Post the logs from Terminal 1 after checkout completes
3. **Check Supabase dashboard** - Verify if user_profiles.subscription_tier updated
4. **Check subscription_events table** - See if any events were logged

Once we see the actual logs, we'll know exactly what's failing and can fix it!

---

## 💡 Pro Tips

**Always test webhooks with Stripe CLI first** before going through the full checkout flow. It's faster and easier to debug.

```bash
# Test each event type:
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated  
stripe trigger customer.subscription.deleted
```

**Check webhook logs in Stripe Dashboard:**
- Go to: https://dashboard.stripe.com/test/webhooks
- Click on your webhook endpoint
- View recent events and their responses

**Enable Stripe CLI logging:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --print-json
```

This shows the full webhook payload which can help debug metadata issues.

---

**Status: Ready for manual testing with logs** 🚀

Complete a checkout and share the console output!
