# Supabase Authentication Setup Guide

## 🎯 Overview

Premium authentication is now fully implemented with:
- ✅ Email/Password signup with verification
- ✅ OAuth providers (Google & GitHub)
- ✅ Password reset flow
- ✅ Protected routes middleware
- ✅ Session management
- ✅ Premium UI components aligned with Build With Treez design system

---

## 📋 Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New project"**
3. Choose your organization (or create one)
4. Enter project details:
   - **Name:** `Renamify` (or your preferred name)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

---

## 🔑 Step 2: Get Your API Keys

**Important:** Supabase has upgraded to a new, more secure API key system using **publishable keys**.

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Click the **API Keys** tab
3. If you don't have a publishable key yet, click **Create new API Keys**
4. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Publishable key** (format: `sb_publishable_<random>_<checksum>`)

**Why Publishable Keys?**
- More secure than legacy JWT-based anon keys
- Easier to rotate without invalidating user sessions
- Better separation of client/server concerns
- Modern architecture aligned with industry standards

**Note:** Legacy `anon` keys still work during the transition period, but new projects should use publishable keys.

---

## ⚙️ Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Key Format:**
- Publishable key: `sb_publishable_<22-random-chars>_<8-char-checksum>`
- Example: `sb_publishable_AbCdEfGhIjKlMnOpQrSt_XyZ12345`

**For Vercel Deployment:**
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add the same variables above
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g., `https://renamify.app`)

---

## 📧 Step 4: Configure Email Authentication

### Enable Email Provider

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure settings:
   - ✅ **Enable email provider**
   - ✅ **Confirm email** (recommended for production)
   - ✅ **Secure email change** (recommended)

### Customize Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup** - Welcome email with verification link
   - **Magic Link** - Passwordless login (if using)
   - **Change Email Address** - Confirm email changes
   - **Reset Password** - Password reset instructions

**Brand the emails:**
```html
<h2 style="color: #915eff;">Welcome to Renamify!</h2>
<p>Click the link below to verify your email:</p>
<a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #915eff 0%, #ff6b9d 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
  Verify Email
</a>
```

---

## 🔐 Step 5: Configure OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen (External, add your email)
6. Create OAuth client:
   - **Application type:** Web application
   - **Authorized redirect URIs:**
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
7. Copy **Client ID** and **Client Secret**
8. In Supabase → **Authentication** → **Providers** → **Google**:
   - Paste Client ID and Secret
   - ✅ Enable Google provider

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in details:
   - **Application name:** Renamify
   - **Homepage URL:** `https://renamify.app` (or your domain)
   - **Authorization callback URL:**
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
4. Click **"Register application"**
5. Copy **Client ID** and generate **Client Secret**
6. In Supabase → **Authentication** → **Providers** → **GitHub**:
   - Paste Client ID and Secret
   - ✅ Enable GitHub provider

---

## 🧪 Step 6: Test Authentication

### Local Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`

3. Test each flow:
   - ✅ Email signup → Check email for verification
   - ✅ Email login → Should redirect to dashboard
   - ✅ Google OAuth → Test popup flow
   - ✅ GitHub OAuth → Test popup flow
   - ✅ Password reset → Request reset email
   - ✅ Protected routes → Try accessing `/dashboard` logged out

### Production Testing

1. Deploy to Vercel (if not already deployed)
2. Update OAuth redirect URIs to use production domain
3. Test all flows in production environment

---

## 🚀 Step 7: Configure URL Redirects

### Authentication URLs (Site URL)

In Supabase → **Authentication** → **URL Configuration**:

**Local Development:**
```
Site URL: http://localhost:3000
```

**Production:**
```
Site URL: https://renamify.app
```

### Redirect URLs (Whitelist)

Add these to **Redirect URLs** section:
```
http://localhost:3000/**
https://your-vercel-app.vercel.app/**
https://renamify.app/**
```

---

## 📁 Files Created

### Auth Components
- `src/components/auth/AuthCard.tsx` - Glass morphism card wrapper
- `src/components/auth/AuthInput.tsx` - Premium input with password toggle
- `src/components/auth/AuthButton.tsx` - Gradient buttons with loading states

### Auth Pages
- `src/app/(auth)/signup/page.tsx` - Registration with email verification
- `src/app/(auth)/login/page.tsx` - Login with OAuth options
- `src/app/(auth)/forgot-password/page.tsx` - Password reset request
- `src/app/(auth)/reset-password/page.tsx` - Password reset form
- `src/app/(auth)/layout.tsx` - Auth pages layout (no header/footer)

### Auth Routes
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/app/auth/signout/route.ts` - Sign out handler

### Protected Pages
- `src/app/dashboard/page.tsx` - Protected dashboard example

### Supabase Utilities
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/middleware.ts` - Session management
- `src/middleware.ts` - Route protection

---

## 🎨 Design System Compliance

All auth components follow the Build With Treez Design System:

✅ **Colors:** Purple (#915eff), Cyan (#00d4ff), Pink (#ff6b9d)  
✅ **Glass Morphism:** `backdrop-blur-xl` + `bg-white/5`  
✅ **Gradients:** Purple→Pink for primary actions  
✅ **Typography:** `font-display` for headings  
✅ **Animations:** 300ms transitions, smooth hover effects  
✅ **Spacing:** Consistent padding and gaps  
✅ **Accessibility:** Focus states, ARIA labels, screen reader support  

---

## 🔒 Security Best Practices

✅ **Email Verification:** Users must verify email before full access  
✅ **Password Requirements:** Minimum 8 characters enforced  
✅ **Protected Routes:** Middleware redirects unauthenticated users  
✅ **Secure Cookies:** HTTPOnly, Secure, SameSite cookies  
✅ **CSRF Protection:** Built into Supabase Auth  
✅ **OAuth Scopes:** Minimal permissions requested  

---

## 🐛 Troubleshooting

### "Invalid login credentials"
- Check that email is verified
- Ensure correct password
- Try password reset if forgotten

### OAuth not working
- Verify redirect URIs match exactly
- Check OAuth app is not in development mode
- Ensure client ID and secret are correct

### Email not sending
- Check Supabase email quota (free tier: 3 emails/hour)
- Verify email templates are configured
- Check spam folder
- Consider custom SMTP for production

### Middleware redirect loops
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check that `middleware.ts` matcher excludes static files
- Clear cookies and try again

---

## 📊 Next Steps

1. ✅ **Authentication** - COMPLETE
2. ⏭️ **Database Schema** - Create tables for user data
3. ⏭️ **User Profiles** - Add profile settings page
4. ⏭️ **Payment Integration** - Stripe for premium features
5. ⏭️ **Usage Tracking** - Monitor user activity
6. ⏭️ **Email Notifications** - Custom transactional emails

---

## 💡 Pro Tips

**Custom Domain Emails:**  
For production, set up custom SMTP (e.g., SendGrid, AWS SES) to send emails from `noreply@renamify.app` instead of Supabase default.

**Rate Limiting:**  
Enable rate limiting in Supabase → **Authentication** → **Rate Limits** to prevent abuse.

**Session Duration:**  
Configure session timeout in **Authentication** → **Settings** (default: 7 days).

**Database Triggers:**  
Set up triggers to auto-create user profiles on signup (covered in Phase 4).

---

Need help? Check the [Supabase Docs](https://supabase.com/docs/guides/auth) or reach out! 🚀
