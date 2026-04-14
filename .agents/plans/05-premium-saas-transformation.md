# Plan 05: Premium SaaS Transformation

## Overview

Transform AssetFlow from a functional MVP into an enterprise-grade SaaS product with premium tier, authentication, database persistence, payment processing, and full Build With Treez design system compliance including sacred geometry elements.

## Mission Statement

Elevate AssetFlow from a portfolio piece to a revenue-generating SaaS product that seamlessly integrates into the Build With Treez brand ecosystem, providing professional e-commerce sellers with a premium tool for managing large-scale image operations.

---

## PREREQUISITES

- ✅ Plan 01: Project Foundation (Complete)
- ✅ Plan 02: Landing Page (Complete)
- ✅ Plan 03: Core Application (Complete)
- ⚠️ Plan 04: Polish & Deploy (Partial - MVP deployed, missing polish tasks)
- ✅ MVP deployed to Vercel
- ✅ GitHub repository connected
- ✅ Vercel Analytics integrated

---

## SCOPE DEFINITION

### Phase 0: Market Expansion Features (Pre-Premium)
**Estimated Duration**: 2-3 sessions  
**Goal**: Broaden market appeal to photographers and general users before premium transformation

**Rationale**: 
- Validate multi-market appeal before building premium tier
- Gather data on which user segments convert best
- Auto-iteration is table-stakes for batch renamers
- RAW support differentiates from basic tools

**In Scope**:
- ✅ Auto-iteration presets (01/02/03, 001/002/003, A/B/C)
- ✅ Sequential numbering with customizable padding
- ✅ Alphabetic iteration (uppercase/lowercase)
- ✅ RAW file format support (CR2, NEF, ARW, DNG, RAF)
- ✅ Embedded JPEG preview extraction from RAW files
- ✅ Preserve RAW file extensions on export
- ✅ Updated UI to show iteration presets alongside descriptors
- ✅ File type detection and format support messaging

**Technical Implementation**:
- Library: `exifr` (modern, fast EXIF + preview extraction)
- RAW formats: Canon CR2, Nikon NEF, Sony ARW, Adobe DNG, Fujifilm RAF
- Extract embedded preview (most RAW files contain full JPEG preview)
- Display preview as thumbnail (same as regular images)
- Rename file while preserving original RAW extension
- Bundle size impact: ~15-20kb gzipped

**User Positioning**:
- E-commerce: "Use SKU-based naming OR simple numbered sequences"
- Photographers: "Professional sequential naming + RAW file support"
- General users: "Smart numbering for any batch of files"

**Out of Scope** (Reserved for Pro Tier):
- ❌ Full RAW processing/decoding
- ❌ RAW → JPEG conversion
- ❌ Advanced EXIF metadata editing
- ❌ RAW adjustment presets
- ❌ Date/time-based naming from EXIF

---

### Phase 1: Design System Enhancement (Sacred Geometry & Brand Cohesion)
**Estimated Duration**: 2-3 sessions  
**Goal**: Full alignment with Build With Treez design system including sacred geometry accents

**In Scope**:
- ✅ Sacred geometry SVG components (Flower of Life, Metatron's Cube, Sri Yantra)
- ✅ Animated geometric backgrounds
- ✅ Enhanced glass morphism effects
- ✅ Gradient text treatments
- ✅ Micro-interactions and hover states
- ✅ Consistent spacing and typography scales
- ✅ Mobile-first responsive refinements
- ✅ Dark theme enhancements (deeper blacks, richer purples)
- ✅ Loading states and skeleton screens
- ✅ Toast notification system

**Out of Scope**:
- ❌ Light theme variant (dark-first brand)
- ❌ Custom theme builder
- ❌ Animation timeline editor

---

### Phase 2: Complete Plan 04 Audit Tasks
**Estimated Duration**: 1-2 sessions  
**Goal**: Finish all polish and optimization tasks from Plan 04

**Tasks**:
- ✅ Task 1: Responsive audit (all breakpoints)
- ✅ Task 2: Animation consistency (reduced motion support)
- ✅ Task 3: Error handling hardening
- ✅ Task 4: Accessibility audit (WCAG AA)
- ✅ Task 5: Performance optimization
- ✅ Task 6: SEO metadata (OG images, sitemap, robots.txt)
- ✅ Task 7: Cross-browser testing
- ✅ Task 8: Design system compliance check

---

### Phase 3: Authentication & User Management ✅ COMPLETE
**Estimated Duration**: 2-3 sessions  
**Goal**: Supabase Auth integration with email/OAuth providers

**Implementation Complete:**
- ✅ Supabase client/server setup (`@supabase/ssr`)
- ✅ Premium auth UI components (glass morphism, gradients)
  - `AuthCard.tsx` - Branded card wrapper with gradients
  - `AuthInput.tsx` - Input with password toggle, error states
  - `AuthButton.tsx` - Gradient buttons with loading spinners
- ✅ Email/password authentication with verification
- ✅ OAuth providers (Google, GitHub) with branded buttons
- ✅ Password reset flow (request + reset pages)
- ✅ Session management (middleware + cookies)
- ✅ Protected routes middleware (dashboard, account)
- ✅ Auth callback handlers
- ✅ Sign out functionality
- ✅ Email verification flow
- ✅ Dashboard page (protected, shows user info)

**Files Created:**
- Auth components: `src/components/auth/*`
- Auth pages: `src/app/(auth)/{login,signup,forgot-password,reset-password}/page.tsx`
- Auth routes: `src/app/auth/{callback,signout}/route.ts`
- Supabase utils: `src/lib/supabase/{client,server,middleware}.ts`
- Middleware: `src/middleware.ts`
- Dashboard: `src/app/dashboard/page.tsx`
- Setup guide: `SUPABASE_SETUP.md`

**Design System Compliance:**
- ✅ Purple/Cyan/Pink gradients on all CTAs
- ✅ Glass morphism (backdrop-blur-xl, bg-white/5)
- ✅ Consistent spacing and rounded-xl borders
- ✅ Smooth transitions (300ms duration)
- ✅ Accessible focus states and ARIA labels
- ✅ Mobile-responsive layouts
- ✅ Brand consistency across all auth flows

**Pending User Action:**
- 🔧 Create Supabase project at app.supabase.com
- 🔧 Configure OAuth providers (Google, GitHub)
- 🔧 Add environment variables to .env.local
- 🔧 Test auth flows (see SUPABASE_SETUP.md)

**Out of Scope (Post-MVP):**
- ❌ Multi-factor authentication
- ❌ Social profile linking  
- ❌ Team/organization accounts
- ❌ Magic link authentication

---

### Phase 4: Database Schema & RLS Policies ✅ COMPLETE
**Estimated Duration**: 2-3 sessions  
**Goal**: Supabase database for user projects, templates, and usage tracking

**Implementation Complete:**
- ✅ All database tables created with proper schema
- ✅ RLS policies enabled on all tables
- ✅ TypeScript types generated from schema
- ✅ React hooks created for all CRUD operations
- ✅ Security advisors passed (no warnings)
- ✅ Auto-profile creation trigger on user signup
- ✅ Updated_at triggers for all tables
- ✅ Proper indexes for query optimization

**Database Tables**:

```sql
-- Users table (auto-created by Supabase Auth)

-- user_profiles (1:1 with auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects (saved image sets)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  images JSONB NOT NULL, -- Array of image metadata
  groups JSONB NOT NULL, -- Array of product groups
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- templates (saved descriptor/SKU patterns)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  descriptors JSONB NOT NULL,
  sku_pattern TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- usage_tracking (for free tier limits)
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  month TEXT NOT NULL, -- 'YYYY-MM'
  images_processed INTEGER DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscription_events (audit log)
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  event_type TEXT NOT NULL, -- 'subscribed' | 'canceled' | 'renewed'
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies**:
- Users can only read/write their own data
- Public read for templates marked as "public" (future feature)
- Admin role for support queries

**Files Created:**
- Database types: `src/lib/supabase/database.types.ts`
- User profile hooks: `src/hooks/useUserProfile.ts`
- Project hooks: `src/hooks/useProjects.ts`
- Template hooks: `src/hooks/useTemplates.ts`
- Usage tracking hooks: `src/hooks/useUsageTracking.ts`

**Database Structure:**
- `user_profiles` - User info and subscription tier
- `projects` - Saved image sets with groups
- `templates` - Saved descriptor/SKU patterns
- `usage_tracking` - Monthly usage limits
- `subscription_events` - Payment audit log

**Security Features:**
- RLS enabled on all tables
- User-scoped policies (users can only access their own data)
- Secure functions with proper search_path
- Cascading deletes on user removal
- Unique constraints on critical fields

**Out of Scope**:
- ❌ Real-time collaboration
- ❌ Version history/undo
- ❌ Public template marketplace

---

### Phase 5: Stripe Payment Integration ⏳ IN PROGRESS
**Estimated Duration**: 2-3 sessions  
**Goal**: Subscription management with Stripe

**Implementation Progress:**
- ✅ Stripe SDK installed and configured
- ✅ API routes created (checkout, webhook, portal)
- ✅ Webhook handlers for subscription events
- ✅ Customer portal integration ready
- ✅ Subscription sync to Supabase implemented
- ✅ Comprehensive setup documentation (STRIPE_SETUP.md)
- ⏳ Pricing page UI (next session)
- ⏳ Dashboard billing section (next session)
- ⏳ Tier-gated features (next session)

**Pricing Tiers**:

| Feature | Free | Pro ($19/mo) |
|---------|------|--------------|
| Images per session | 20 | Unlimited |
| Auto-iteration naming | ✅ | ✅ |
| RAW file preview | ✅ | ✅ |
| RAW processing & conversion | ❌ | ✅ |
| EXIF metadata editing | ❌ | ✅ |
| Saved projects | 0 | Unlimited |
| Saved templates | 0 | 10 |
| Export history | 0 | 30 days |
| Priority support | ❌ | ✅ |
| Batch operations | ❌ | ✅ |
| AI descriptor suggestions | ❌ | ✅ |

**In Scope**:
- ✅ Stripe account setup
- ✅ Product and price configuration
- ✅ Checkout session creation
- ✅ Webhook handling (subscription.created, subscription.updated, subscription.deleted)
- ✅ Customer portal integration
- ✅ Subscription status sync to Supabase
- ✅ Usage-based metering (future-ready)
- ✅ Invoice email notifications

**Out of Scope**:
- ❌ Annual billing discounts
- ❌ Team plans
- ❌ Pay-per-use pricing

---

### Phase 6: Premium Dashboard
**Estimated Duration**: 3-4 sessions  
**Goal**: User dashboard for managing projects, templates, and subscription

**Pages & Features**:

**`/dashboard`** - Overview
- Welcome message with user name
- Quick stats (projects, templates, usage this month)
- Recent projects (last 5)
- Quick action buttons (New Project, Browse Templates)

**`/dashboard/projects`** - Project Library
- Grid/list view toggle
- Search and filter projects
- Project cards (thumbnail preview, name, date, image count)
- Actions: Open, Rename, Duplicate, Delete
- Pagination (20 per page)
- Empty state for new users

**`/dashboard/templates`** - Template Library
- Saved descriptor sets
- Template cards (name, descriptor count, usage count)
- Actions: Apply to New Project, Edit, Delete
- Create new template modal

**`/dashboard/settings`** - Account Settings
- Profile information (name, email, avatar)
- Subscription status and billing portal link
- Usage statistics (current month)
- Danger zone (delete account)

**`/dashboard/billing`** - Subscription Management
- Current plan display
- Upgrade/downgrade CTA
- Billing history table
- Payment method management (Stripe Customer Portal)

**In Scope**:
- ✅ Dashboard layout with sidebar navigation
- ✅ All pages listed above
- ✅ CRUD operations for projects and templates
- ✅ Optimistic UI updates
- ✅ Loading states and skeletons
- ✅ Error boundaries
- ✅ Empty states for all views

**Out of Scope**:
- ❌ Team workspace features
- ❌ Activity feed
- ❌ Notifications center

---

### Phase 7: Premium Features (Free vs Pro)
**Estimated Duration**: 2-3 sessions  
**Goal**: Implement tier-gated features

**Free Tier Limitations**:
- Max 20 images per session (enforced in upload)
- No project saving
- No template saving
- No export history

**Pro Tier Features**:
- Unlimited images per session
- Save/load projects from database
- Create/manage templates
- Export history (last 30 days stored)
- **Batch operations** (coming in Phase 8)

**In Scope**:
- ✅ Feature flags based on subscription tier
- ✅ Upgrade prompts (modals, banners)
- ✅ Usage tracking and limits
- ✅ Graceful degradation for free users

**Out of Scope**:
- ❌ Trial period management
- ❌ Promo codes

---

### Phase 8: Advanced Premium Features
**Estimated Duration**: 4-5 sessions  
**Goal**: Power-user features for professionals

**Batch Operations** (Pro only):
- Multi-select images
- Bulk descriptor assignment
- Auto-grouping by image similarity (AI-powered)
- Preset workflows (e.g., "Shopify product set")

**Smart Features** (Pro only):
- AI-suggested descriptors based on image content
- Duplicate image detection
- Auto-crop and resize options
- Background removal integration (remove.bg API)

**RAW Processing** (Pro only - NEW):
- Full RAW file decoding and processing
- RAW → JPEG/PNG conversion with quality settings
- RAW → WebP export for web optimization
- EXIF metadata batch editing (copyright, camera settings, etc.)
- Date/time-based auto-naming from EXIF data
- Camera make/model in filename templates
- GPS location data extraction (when available)
- Preserve or strip metadata on export
- RAW histogram preview for exposure validation
- Batch RAW adjustments (exposure, white balance - basic)

**Export Enhancements** (Pro only):
- CSV manifest file with EXIF data
- Multiple export formats (ZIP, folders, cloud upload)
- Dropbox/Google Drive integration
- Custom watermarking
- Output format per SKU group
- Compression quality settings

**In Scope**:
- ✅ Multi-select UI component
- ✅ Bulk action toolbar
- ✅ AI descriptor suggestions (OpenAI Vision API)
- ✅ Export format picker
- ✅ CSV manifest generation
- ✅ RAW decoder (libraw-wasm or alternative)
- ✅ EXIF metadata editor UI
- ✅ RAW conversion settings panel
- ✅ Format-specific export options

**Out of Scope**:
- ❌ Custom AI model training
- ❌ Video file support
- ❌ 3D model support
- ❌ Advanced RAW editing (curves, HSL, etc.) - use Lightroom for that
- ❌ RAW lens correction
- ❌ RAW noise reduction

**Technical Notes**:
- Use `libraw-wasm` for client-side RAW decoding (~800kb bundle impact)
- Cache decoded RAW previews in IndexedDB for performance
- Limit concurrent RAW processing to 2-3 files (memory constraints)
- Show progress indicator for RAW conversion (can take 3-5s per file)
- Consider worker threads for RAW processing to keep UI responsive

---

### Phase 9: Marketing & Growth Features
**Estimated Duration**: 2 sessions  
**Goal**: Convert free users to paid subscribers

**Growth Tactics**:
- Upgrade prompts at key moments (hitting 20 image limit, after 3rd export)
- Email drip campaign (Resend API)
- Referral program (give 1 month free, get 1 month free)
- Social proof (testimonials from beta users)
- Feature comparison table on dashboard

**In Scope**:
- ✅ Email capture on free tier
- ✅ Automated welcome email
- ✅ Upgrade prompt modals
- ✅ Feature comparison component
- ✅ Testimonial section

**Out of Scope**:
- ❌ Affiliate program
- ❌ White-label options

---

### Phase 10: Polish, Testing & Launch Preparation
**Estimated Duration**: 2-3 sessions  
**Goal**: Production-ready premium SaaS

**Tasks**:
- ✅ End-to-end testing (Playwright)
- ✅ Load testing (simulate 100+ concurrent users)
- ✅ Security audit (SQL injection, XSS, CSRF)
- ✅ Privacy policy page
- ✅ Terms of service page
- ✅ GDPR compliance (data export, account deletion)
- ✅ Monitoring setup (Sentry for errors)
- ✅ Uptime monitoring (Vercel + UptimeRobot)
- ✅ Documentation (help center, FAQs)

---

## TECHNICAL ARCHITECTURE

### Tech Stack Additions

**Authentication & Database**:
- Supabase (Auth, Database, RLS)
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs

**Payments**:
- Stripe (subscriptions, customer portal)
- stripe npm package
- @stripe/stripe-js (client-side)

**Email**:
- Resend (transactional emails)
- React Email (email templates)

**AI Features** (Pro):
- OpenAI API (image analysis, descriptor suggestions)

**Monitoring**:
- @vercel/analytics (already added ✅)
- @sentry/nextjs (error tracking)

**Testing**:
- Playwright (E2E tests)
- Vitest (unit tests)

---

## DIRECTORY STRUCTURE (New Additions)

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Overview
│   │   ├── projects/
│   │   │   ├── page.tsx          # Project library
│   │   │   └── [id]/page.tsx    # Project detail
│   │   ├── templates/
│   │   │   └── page.tsx          # Template library
│   │   ├── settings/
│   │   │   └── page.tsx          # Account settings
│   │   └── billing/
│   │       └── page.tsx          # Subscription management
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── signup/
│   │   └── page.tsx              # Signup page
│   ├── pricing/
│   │   └── page.tsx              # Pricing page (public)
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts # OAuth callback
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts # Create checkout session
│   │   │   └── webhook/route.ts  # Handle Stripe events
│   │   └── ai/
│   │       └── suggest-descriptors/route.ts
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── AuthProvider.tsx
│   ├── dashboard/
│   │   ├── DashboardNav.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── TemplateCard.tsx
│   │   ├── UsageStats.tsx
│   │   └── UpgradePrompt.tsx
│   ├── billing/
│   │   ├── PricingTable.tsx
│   │   ├── SubscriptionStatus.tsx
│   │   └── BillingHistory.tsx
│   └── sacred-geometry/
│       ├── FlowerOfLife.tsx      # SVG component
│       ├── MetatronsCube.tsx     # SVG component
│       ├── SriYantra.tsx         # SVG component
│       └── GeometricBackground.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── middleware.ts         # Auth middleware
│   │   └── types.ts              # Generated types
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── webhooks.ts
│   ├── email/
│   │   ├── templates/
│   │   │   ├── welcome.tsx
│   │   │   └── subscription-confirmed.tsx
│   │   └── send.ts
│   └── ai/
│       └── openai.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useSubscription.ts
│   ├── useProjects.ts
│   ├── useTemplates.ts
│   └── useUsageTracking.ts
└── middleware.ts                 # Route protection
```

---

## DESIGN SYSTEM ENHANCEMENTS

### Sacred Geometry Elements

**Flower of Life**:
- Placement: Landing page hero background (subtle, animated)
- Opacity: 5-10% white
- Animation: Slow rotation (60s duration)

**Metatron's Cube**:
- Placement: Dashboard sidebar background
- Opacity: 3% purple (#915eff)
- Animation: Pulsing glow effect

**Sri Yantra**:
- Placement: Pricing page feature comparison
- Opacity: 8% cyan (#00d4ff)
- Animation: Zoom in/out on scroll

**Implementation**:
```tsx
<svg className="absolute inset-0 w-full h-full opacity-5 animate-slow-spin">
  {/* Flower of Life paths */}
</svg>
```

### Gradient Text Treatment

```css
.gradient-text {
  background: linear-gradient(
    135deg,
    #915eff 0%,
    #00d4ff 50%,
    #ff6b9d 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glass Morphism V2 (Enhanced)

```css
.glass-enhanced {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(145, 94, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

---

## MIGRATION STRATEGY

### Data Migration (Free → Pro)
When a free user upgrades:
1. Current session data (images, groups) → saved as first project
2. Prompt to create first template from current descriptors
3. Email welcome to Pro tier

### Downgrade Handling (Pro → Free)
When a Pro user cancels:
1. Grace period: 30 days access after cancellation
2. Export all projects as ZIP before access ends
3. Projects remain in database (read-only)
4. Can reactivate subscription to restore access

---

## SECURITY CONSIDERATIONS

**Authentication**:
- ✅ Supabase Auth (battle-tested)
- ✅ HTTP-only cookies for session
- ✅ CSRF protection
- ✅ Rate limiting on auth endpoints

**Database**:
- ✅ Row-Level Security (RLS) on all tables
- ✅ Prepared statements (SQL injection protection)
- ✅ Input validation and sanitization

**Stripe**:
- ✅ Webhook signature verification
- ✅ Idempotency keys
- ✅ Server-side only (no client-side secrets)

**File Handling**:
- ✅ Client-side only processing (no uploads)
- ✅ Blob size limits
- ✅ MIME type validation

**API Routes**:
- ✅ Authentication middleware
- ✅ Rate limiting (Vercel Edge Config)
- ✅ CORS configuration

---

## ACCEPTANCE CRITERIA (Full Plan)

### Phase 0: Market Expansion ✅ COMPLETE
- [x] Auto-iteration presets available in descriptor dropdown
- [x] 2-digit, 3-digit, 4-digit number padding options
- [x] Alphabetic iteration (A-Z, a-z) working
- [x] RAW files (CR2, NEF, ARW, DNG, RAF) can be uploaded
- [x] JPEG preview extracted from RAW files and displayed
- [x] RAW file extensions preserved on export
- [x] File type badge shows "RAW" for supported formats
- [x] Help text explains RAW preview vs. full processing
- [x] Bundle size increase < 25kb gzipped
- [x] Performance: Preview extraction < 500ms per RAW file

### Phase 1: Design System ✅ COMPLETE
- [x] Sacred geometry components created and integrated
- [x] All landing page sections use sacred geometry backgrounds
- [x] Dashboard has consistent geometric accents
- [x] Gradient text used for key CTAs and headings
- [x] Glass morphism V2 applied to all cards
- [x] Animation timing follows design system (300ms/800ms)
- [x] Responsive at all breakpoints with geometric elements

**Recent Session Updates:**
- [x] Compact QuickSKUInput with single-row design
- [x] SKU groups with subtle left border status indicators
- [x] Real-time progress bars with dynamic gradient colors
- [x] Intelligent export buttons with contextual states
- [x] Clean visual separation with increased spacing
- [x] Bug fixes: descriptor persistence and state reactivity

### Phase 2: Plan 04 Completion ✅ COMPLETE
- [x] All 8 tasks from Plan 04 completed
- [x] Lighthouse scores: 90+ across all categories (verified in production)
- [x] OG images working
- [x] Sitemap and robots.txt deployed

**Validation Results:**
- [x] `npm run build` - PASSED (0 errors)
- [x] `npx tsc --noEmit` - PASSED (0 errors)
- [x] `npm run lint` - PASSED (7 warnings about img tags - acceptable for blob URLs)
- [x] Reduced motion support - IMPLEMENTED
- [x] SEO metadata complete - Title, description, OG images, Schema.org
- [x] Skip-to-content link - IMPLEMENTED
- [x] Semantic HTML throughout - VERIFIED
- [x] Production deployment - renamify.app LIVE

### Phase 3: Authentication ✅ COMPLETE
- [x] User can sign up with email/password
- [x] User can log in with Google
- [x] User can log in with GitHub
- [x] User can reset password
- [x] Protected routes redirect to login
- [x] Session persists across page refreshes
- [x] OAuth providers configured (Google, GitHub)
- [x] CSP updated to allow Supabase connections

### Phase 4: Database ✅ COMPLETE
- [x] All tables created with RLS policies
- [x] TypeScript types generated from schema
- [x] CRUD operations work for projects
- [x] CRUD operations work for templates
- [x] Usage tracking increments correctly
- [x] Security advisors pass with no warnings
- [x] Auto-profile creation trigger functional

### Phase 5: Stripe
- [ ] Checkout creates subscription
- [ ] Webhook updates subscription status
- [ ] Customer portal allows plan management
- [ ] Subscription status syncs to Supabase
- [ ] Free users see upgrade prompts

### Phase 6: Dashboard
- [ ] All dashboard pages render correctly
- [ ] Projects can be saved and loaded
- [ ] Templates can be created and applied
- [ ] Settings page updates profile
- [ ] Billing page shows subscription status

### Phase 7: Premium Features
- [ ] Free tier limited to 20 images
- [ ] Pro tier allows unlimited images
- [ ] Feature flags work correctly
- [ ] Upgrade prompts appear at right moments

### Phase 8: Advanced Features
- [ ] Multi-select images works
- [ ] Bulk descriptor assignment works
- [ ] CSV manifest exports correctly
- [ ] AI descriptor suggestions functional (if enabled)

### Phase 9: Marketing
- [ ] Email capture on landing page
- [ ] Welcome email sends on signup
- [ ] Upgrade prompts strategically placed
- [ ] Pricing page has feature comparison

### Phase 10: Launch
- [ ] E2E tests cover critical paths
- [ ] Security audit passed
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Monitoring dashboards configured
- [ ] Help documentation published

---

## SUCCESS METRICS (Post-Launch)

**User Acquisition**:
- 1,000 free signups in first month
- 5% free → pro conversion rate
- Average session duration: 8+ minutes

**Revenue**:
- MRR target: $1,000 (53 Pro subscribers)
- Churn rate: <5% monthly
- LTV: $228 (12 months average)

**Product Quality**:
- Uptime: 99.9%
- Error rate: <0.1%
- Page load: <2s (p95)
- Lighthouse: 90+ across all categories

**User Satisfaction**:
- NPS score: 50+
- Support response time: <24 hours
- Feature request implementation: 2-3 per month

---

## TIMELINE ESTIMATE

**Total Duration**: 23-29 sessions (11.5-14.5 weeks at 2 sessions/week)

| Phase | Sessions | Weeks |
|-------|----------|-------|
| 0. Market Expansion (Pre-Premium) | 2-3 | 1-1.5 |
| 1. Design System | 2-3 | 1-1.5 |
| 2. Plan 04 Completion | 1-2 | 0.5-1 |
| 3. Authentication | 2-3 | 1-1.5 |
| 4. Database | 2-3 | 1-1.5 |
| 5. Stripe | 2-3 | 1-1.5 |
| 6. Dashboard | 3-4 | 1.5-2 |
| 7. Premium Features | 2-3 | 1-1.5 |
| 8. Advanced Features (inc. RAW) | 4-5 | 2-2.5 |
| 9. Marketing | 2 | 1 |
| 10. Launch Prep | 2-3 | 1-1.5 |

**Launch Target**: 11.5-14.5 weeks from start

**Note**: Phase 0 should be completed FIRST to validate market fit before investing in premium infrastructure.

---

## RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict phase gates, defer features to v2 |
| Stripe integration complexity | Medium | Use Stripe Checkout (pre-built UI) |
| RLS policy bugs | High | Comprehensive test suite, staging environment |
| AI costs exceed budget | Medium | Rate limit, cache results, make optional |
| User confusion (free vs pro) | Medium | Clear upgrade prompts, feature comparison |
| Performance with large projects | High | Pagination, virtualization, lazy loading |

---

## NOTES

- **Phase 0 is CRITICAL** - Complete auto-iteration + RAW preview BEFORE building premium features. This validates multi-market appeal and informs premium feature prioritization.
- **RAW strategy is two-tiered** - Free tier gets preview extraction (simple), Pro tier gets full processing (advanced). This creates clear upgrade path for photographers.
- **This plan assumes Plan 04 is partially complete** - we have MVP deployed but need to finish polish tasks
- **Sacred geometry** is a key brand differentiator - invest time in getting the animations right
- **Stripe webhooks are critical** - test thoroughly in staging before production
- **RLS policies are security-critical** - have them reviewed by security-focused developer
- **Start simple with Pro features** - you can always add more later based on user feedback
- **Email capture early** - build your list even before Pro tier is ready
- **Consider beta pricing** - launch at $9/mo to get early adopters, raise to $19/mo later
- **RAW processing bundle impact** - Phase 0 adds ~20kb, Phase 8 Pro adds ~800kb. Use code splitting to keep free tier lean.
- **User segment tracking** - Track which features each user uses (SKU vs. iteration vs. RAW) to inform marketing and feature development.

**Confidence Score: 8.5/10** — Phase 0 additions reduce risk by validating market fit early. Main variables remain Stripe webhook complexity, RLS policy debugging, and RAW processing performance optimization.

---

## NEXT STEPS

1. **START WITH PHASE 0** - Auto-iteration + RAW preview (2-3 sessions)
   - Install `exifr` library for RAW preview extraction
   - Implement iteration presets in descriptor selector
   - Add RAW file type detection and validation
   - Update UI messaging for broader market appeal
   - Test with real RAW files from multiple camera brands
   
2. **Validate market fit** - Track which features users engage with most
   - Monitor: SKU workflow vs. iteration vs. RAW usage
   - Gather feedback from photographer community
   - Adjust premium feature priorities based on data

3. **Then proceed with premium transformation:**
   - Set up Supabase project - get credentials ready
   - Create Stripe account - configure products and test mode
   - Start Phase 1 - sacred geometry components
   - Commit to 2 sessions/week minimum - maintain momentum

**Ready to expand your market? Let's start with Phase 0!** 🚀
