# AssetFlow — Master Orchestration Plan

> **Created:** April 10, 2026  
> **Status:** Planning Complete — Ready for Execution  
> **Source of Truth:** `/docs/context.md`, `/docs/BUILD_WITH_TREEZ_DESIGN_SYSTEM.md`, `/docs/PRD.md`

---

## Execution Strategy

AssetFlow is built through **5 sequential plans**, each producing a deployable milestone. Plans MUST be executed in order — each depends on the previous.

```
Plan 1: Project Foundation ──→ Plan 2: Landing Page ──→ Plan 3: Core Application ──→ Plan 4: Polish & Deploy ──→ Plan 5: Premium SaaS
       (scaffold)                  (marketing)              (product)                   (ship MVP)              (enterprise scale)
```

---

## Plan Overview

### Plan 1: Project Foundation
**File:** `.agents/plans/01-project-foundation.md`  
**Complexity:** Medium  
**Estimate:** 1 session  
**Produces:** Runnable Next.js app with design system, layout, routing, types, utilities, and Zustand skeleton

**Key Deliverables:**
- Next.js 15 + TypeScript + Tailwind CSS v4 initialized
- Build With Treez design system integrated (colors, fonts, glass morphism)
- Root layout with metadata, fonts, dark theme
- Header component (logo, nav, CTA button)
- Footer component (brand, links, copyright)
- Route structure: `/` (landing) and `/app` (tool)
- TypeScript interfaces (`/types/index.ts`)
- Filename sanitization utilities (`/lib/filename.ts`)
- Zustand store skeleton (`/stores/useAssetStore.ts`)
- Constants file (`/lib/constants.ts`)

**Why First:** Everything depends on this. No component can be built without the design system, types, and project scaffold.

---

### Plan 2: Landing Page
**File:** `.agents/plans/02-landing-page.md`  
**Complexity:** High  
**Estimate:** 1–2 sessions  
**Produces:** Complete, conversion-optimized marketing page

**Key Deliverables:**
- Hero section (headline, subheadline, before/after demo, primary CTA)
- How It Works section (3-step visual flow with icons)
- Features section (6 capability cards with glass morphism)
- Pricing section (Free vs Pro comparison table)
- Final CTA section (drive to `/app`)
- Framer Motion entrance animations (scroll-triggered)
- Sacred geometry background accent
- Fully responsive (mobile-first)
- SEO metadata

**Why Second:** The landing page is the first thing users see. It validates the value proposition and design quality before we build the tool itself.

---

### Plan 3: Core Application
**File:** `.agents/plans/03-core-application.md`  
**Complexity:** High  
**Estimate:** 1–2 sessions  
**Produces:** Fully functional image renaming tool

**Key Deliverables:**
- DropZone component (drag-and-drop + click fallback)
- Thumbnail generation (Canvas/FileReader)
- Image card component with preview
- Product group management (create, delete, assign images)
- SKU input with real-time sanitization
- Descriptor dropdown with duplicate prevention
- Custom descriptor support
- Live filename preview
- Export validation
- ZIP generation and download (JSZip)
- Free tier limit (20 images) with counter
- Empty/loading/error states

**Why Third:** This is the core product. It requires all foundation types, utilities, and the Zustand store to be in place.

---

### Plan 4: Polish & Deploy
**File:** `.agents/plans/04-polish-and-deploy.md`  
**Complexity:** Medium  
**Estimate:** 1 session  
**Produces:** Production-ready, deployed application

**Key Deliverables:**
- Responsive audit across all breakpoints
- Animation polish and consistency pass
- Error handling and edge case hardening
- Accessibility audit (keyboard nav, ARIA, contrast)
- Performance optimization (lazy loading, re-render prevention)
- OG image and social media metadata
- Cross-browser testing
- Production deployment
- Final design system compliance check

**Why Fourth:** Polish requires the complete application to exist. This is the final pass before shipping the MVP.

---

### Plan 5: Premium SaaS Transformation
**File:** `.agents/plans/05-premium-saas-transformation.md`  
**Complexity:** High  
**Estimate:** 20-25 sessions (10-12 weeks)  
**Produces:** Enterprise-grade SaaS with authentication, database, payments, and premium features

**Key Deliverables:**
- Sacred geometry design system enhancements
- Supabase authentication (email, OAuth, magic link)
- Database schema with RLS policies
- Stripe subscription integration
- Premium dashboard (projects, templates, billing)
- Feature gating (free vs pro tiers)
- Advanced batch operations
- AI-powered features (descriptor suggestions)
- Marketing and growth features
- Production monitoring and testing

**Why Fifth:** This transforms the portfolio MVP into a revenue-generating SaaS product. Requires MVP to be deployed and validated before investing in premium infrastructure.

---

## Dependency Graph

```
Plan 1 (Foundation)
  ├── Types, utilities, constants
  ├── Design system (colors, fonts, glass morphism)
  ├── Layout (Header, Footer)
  └── Zustand store skeleton
       │
       ├──→ Plan 2 (Landing Page)
       │     ├── Uses Header/Footer from Plan 1
       │     ├── Uses design system tokens
       │     └── Independent of Plan 3
       │
       └──→ Plan 3 (Core Application)
             ├── Uses types from Plan 1
             ├── Uses filename utils from Plan 1
             ├── Uses Zustand store from Plan 1
             ├── Uses design system from Plan 1
             └── Independent of Plan 2
                  │
                  └──→ Plan 4 (Polish & Deploy)
                        ├── Requires Plans 1-3 complete
                        └── Final refinement pass
```

**Note:** Plans 2 and 3 are independent of each other and could theoretically be done in parallel, but sequential execution is recommended to maintain focus.

---

## Execution Rules

1. **One plan at a time** — Complete and validate before moving to the next
2. **No scope creep** — Only build what's in the current plan
3. **Validate after each plan** — `npm run build` must pass with zero errors
4. **Commit after each plan** — Clean git history with descriptive commits
5. **Design system compliance** — Every component must follow `/docs/BUILD_WITH_TREEZ_DESIGN_SYSTEM.md`
6. **Source of truth** — `/docs/context.md` defines what we build; `/docs/PRD.md` defines how

---

## Success Criteria

| Milestone | Criteria |
|-----------|----------|
| Plan 1 Complete | App runs locally, routes work, design system renders correctly |
| Plan 2 Complete | Landing page communicates value in 5 seconds, responsive, animated |
| Plan 3 Complete | Full workflow: upload → group → name → export ZIP with correct filenames |
| Plan 4 Complete | Lighthouse 90+, zero console errors, deployed to production |

---

*Execute Plan 1 first. Use `/execute` workflow to begin implementation.*
