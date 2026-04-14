# AssetFlow — Product Requirements Document

> **Version:** 1.0  
> **Last Updated:** April 10, 2026  
> **Author:** Build With Treez  
> **Status:** MVP Specification — Ready for Implementation

---

## 1. Executive Summary

AssetFlow is a web application that enables e-commerce sellers, product photographers, and small business owners to organize, rename, preview, and export product images into clean, standardized filenames — all from the browser with zero signup required.

The core transformation is simple and powerful:

```
IMG_2045.jpg  →  63755-front.jpg
IMG_2046.jpg  →  63755-rear.jpg
IMG_2047.jpg  →  63755-zoom1.jpg
```

Users drag in their unstructured image files, group them by product, assign SKUs and descriptors, see filenames generated in real time, and export a ready-to-upload ZIP. The entire workflow completes in seconds, not hours.

**MVP Goal:** Deliver a fully functional, client-side image renaming tool with a polished landing page and clear free → paid upgrade path — no authentication, no database, no billing. Ship fast, validate demand, iterate.

---

## 2. Mission

**Product Mission:** Eliminate the tedious, error-prone process of manually renaming product images so sellers can focus on selling.

### Core Principles

1. **Instant Value** — Users understand and benefit from the product within seconds of first use
2. **Zero Friction** — No signup, no onboarding, no learning curve
3. **Professional Output** — Clean, consistent filenames every time
4. **Speed First** — The entire workflow should feel instant
5. **Extensible Foundation** — MVP architecture supports clean SaaS upgrade path

---

## 3. Target Users

### Primary Persona: The E-Commerce Seller

**Who:** Shopify store owners, Etsy sellers, Amazon FBA sellers  
**Pain:** Spends 30–60 minutes per product batch manually renaming images  
**Technical Level:** Low to moderate — comfortable using web tools but not CLI or scripts  
**Key Need:** Fast, reliable, no-setup renaming tool that produces store-ready filenames

### Secondary Persona: The Product Photographer

**Who:** Freelance photographers delivering product shoots to clients  
**Pain:** Needs to deliver organized, consistently named files to multiple clients  
**Technical Level:** Moderate — uses image editing software but wants simple file management  
**Key Need:** Batch processing with descriptors that match client requirements

### Tertiary Persona: The Small Business Owner

**Who:** Managing their own product listings and marketing assets  
**Pain:** Inconsistent filenames across platforms causing SEO and organization issues  
**Technical Level:** Low — needs the simplest possible workflow  
**Key Need:** Drag, name, export — done

### User Priorities (Shared)

- **Speed** — Complete the workflow in under 60 seconds
- **Simplicity** — No instructions needed
- **Accuracy** — Filenames must be correct and consistent
- **Professional Output** — Results they're confident uploading to any platform

---

## 4. MVP Scope

### ✅ In Scope — Core Functionality

- ✅ Drag-and-drop image upload (with click-to-browse fallback)
- ✅ Image thumbnail previews
- ✅ Product grouping (organize images into product groups)
- ✅ SKU input per product group
- ✅ Descriptor assignment per image (front, rear, zoom1, etc.)
- ✅ Duplicate descriptor prevention within a group
- ✅ Custom descriptor support
- ✅ Live filename preview (real-time as user types)
- ✅ Client-side ZIP export (via JSZip)
- ✅ File naming sanitization (lowercase, trim, replace spaces, strip invalid chars)

### ✅ In Scope — UI & Marketing

- ✅ Landing page with clear value proposition
- ✅ Before → After transformation demo
- ✅ 3-step workflow explanation
- ✅ Pricing section (Free vs Pro comparison)
- ✅ Primary CTA: "Try It Free — No Signup"
- ✅ Responsive design (mobile-first)

### ✅ In Scope — Technical

- ✅ Next.js 15 App Router with TypeScript
- ✅ Tailwind CSS v4
- ✅ Zustand for state management
- ✅ Framer Motion (minimal, purposeful)
- ✅ Build With Treez design system compliance
- ✅ Client-only processing (no server uploads)
- ✅ Performance optimized (fast load, minimal re-renders)

### ❌ Out of Scope — Deferred to SaaS Phase

- ❌ User authentication (Supabase Auth)
- ❌ Database persistence (Supabase Postgres)
- ❌ Billing/subscriptions (Stripe)
- ❌ Saved templates
- ❌ Cloud storage
- ❌ Team/collaboration features
- ❌ AI-powered features (auto-categorization, etc.)
- ❌ Third-party integrations (Shopify API, etc.)
- ❌ Image editing/cropping/resizing
- ❌ Watermarking

---

## 5. User Stories

### Primary User Stories

**US-1: Upload Images**  
As a seller, I want to drag and drop my product images into the app, so that I can start organizing them immediately without file pickers or complex imports.

> *Example: User drags 12 images from their desktop into the upload zone. All 12 appear as thumbnails instantly.*

**US-2: Group Images by Product**  
As a seller, I want to group my uploaded images into product sets, so that each group gets its own SKU and the filenames stay organized.

> *Example: User has 24 images for 2 products. They create 2 groups of 12 images each.*

**US-3: Assign SKU**  
As a seller, I want to enter a SKU for each product group, so that every filename in that group starts with the correct identifier.

> *Example: User types "63755" as the SKU. All images in that group immediately show "63755-{descriptor}.jpg" as the preview filename.*

**US-4: Assign Descriptors**  
As a seller, I want to select a descriptor (front, rear, zoom1, etc.) for each image, so that the filename clearly identifies the image angle or content.

> *Example: User selects "front" from a dropdown for the first image. The preview updates to "63755-front.jpg".*

**US-5: Prevent Duplicate Descriptors**  
As a seller, I want the app to prevent me from assigning the same descriptor twice within a product group, so that I don't accidentally create duplicate filenames.

> *Example: After assigning "front" to one image, the "front" option is disabled/grayed out in the dropdown for other images in the same group.*

**US-6: Use Custom Descriptors**  
As a seller, I want to type a custom descriptor when the defaults don't fit my needs, so that I have full flexibility in naming.

> *Example: User selects "custom" and types "lifestyle-1". The preview shows "63755-lifestyle-1.jpg".*

**US-7: See Live Filename Preview**  
As a seller, I want to see the final filename update in real time as I type the SKU and assign descriptors, so that I can verify accuracy before exporting.

> *Example: As the user changes the SKU from "63755" to "63756", all preview filenames in that group update instantly.*

**US-8: Export as ZIP**  
As a seller, I want to export all renamed images as a single ZIP file, so that I can download and upload them to my store in one step.

> *Example: User clicks "Export ZIP". A file named "assetflow-export.zip" downloads containing all renamed images with correct filenames.*

### Marketing User Stories

**US-9: Understand Value Instantly**  
As a visitor, I want to understand what AssetFlow does within 5 seconds of landing on the page, so that I can decide if it solves my problem.

**US-10: See Clear Pricing**  
As a visitor, I want to see the Free vs Pro comparison clearly, so that I understand what I get for free and what requires an upgrade.

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│              Next.js App Router               │
├──────────────┬──────────────────────────────┤
│  Landing Page │         App Page             │
│  (marketing)  │  ┌─────────────────────┐     │
│               │  │   Upload Zone       │     │
│  - Hero       │  │   (drag-and-drop)   │     │
│  - Features   │  ├─────────────────────┤     │
│  - Pricing    │  │   Product Groups    │     │
│  - CTA        │  │   ├── SKU Input     │     │
│               │  │   ├── Image Cards   │     │
│               │  │   └── Descriptors   │     │
│               │  ├─────────────────────┤     │
│               │  │   Export Controls   │     │
│               │  │   (ZIP download)    │     │
│               │  └─────────────────────┘     │
├──────────────┴──────────────────────────────┤
│              Zustand Store                    │
│  ┌──────────┬───────────┬───────────────┐   │
│  │ images[] │ groups[]  │ descriptors[] │   │
│  └──────────┴───────────┴───────────────┘   │
├──────────────────────────────────────────────┤
│            Client-Side Processing             │
│  ┌──────────┬───────────┬───────────────┐   │
│  │ File API │ Canvas    │ JSZip         │   │
│  │ (read)   │ (preview) │ (export)      │   │
│  └──────────┴───────────┴───────────────┘   │
└──────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Landing page
│   └── app/
│       └── page.tsx            # Main application page
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── DropZone.tsx
│   │   └── Badge.tsx
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── landing/                # Landing page sections
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   └── CTA.tsx
│   └── app/                    # Application components
│       ├── UploadZone.tsx
│       ├── ProductGroup.tsx
│       ├── ImageCard.tsx
│       ├── DescriptorSelect.tsx
│       ├── SkuInput.tsx
│       ├── FilenamePreview.tsx
│       └── ExportControls.tsx
├── stores/
│   └── useAssetStore.ts        # Zustand store
├── lib/
│   ├── filename.ts             # Naming logic & sanitization
│   ├── export.ts               # ZIP generation
│   └── constants.ts            # Descriptors, limits, config
├── types/
│   └── index.ts                # TypeScript interfaces
└── hooks/
    ├── useDropzone.ts          # Drag-and-drop logic
    └── useExport.ts            # Export workflow hook
```

### Key Design Patterns

1. **Client-Only Processing** — All image handling happens in the browser via File API and Canvas. No server uploads.
2. **Single Source of Truth** — Zustand store manages all application state (images, groups, descriptors, SKUs).
3. **Derived State** — Filenames are computed from `{sku}-{descriptor}.{extension}`, never stored directly.
4. **Modular Components** — Each component has a single responsibility and clear props interface.
5. **Separation of Concerns** — Business logic (naming rules, sanitization) lives in `/lib`, not in components.

---

## 7. Core Features

### 7.1 Upload Zone

**Purpose:** Accept image files via drag-and-drop or file picker.

**Specifications:**
- Drag-and-drop zone with visual feedback (border highlight, icon change)
- Click-to-browse fallback
- Accept: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Generate thumbnail previews via Canvas/FileReader
- Store file references in Zustand (no upload to server)
- Free tier limit: 20 images per session
- Display count indicator: "5 / 20 images"

**States:**
- Empty (no images uploaded)
- Drag hover (file hovering over zone)
- Processing (generating thumbnails)
- Complete (images loaded, ready to organize)

### 7.2 Product Grouping

**Purpose:** Organize uploaded images into product sets.

**Specifications:**
- Default: All images in a single "Ungrouped" set
- User can create named product groups
- Drag images between groups (or use checkboxes + move button)
- Each group has its own SKU input
- Groups are collapsible for large batches
- Delete group (images return to ungrouped)

### 7.3 SKU Input

**Purpose:** Assign a product identifier to each group.

**Specifications:**
- Text input per product group
- Real-time validation (no empty strings)
- Live filename preview updates as user types
- Sanitization applied: lowercase, trim whitespace, replace spaces with hyphens, strip invalid characters
- Placeholder text: "Enter SKU (e.g., 63755)"

### 7.4 Descriptor Assignment

**Purpose:** Assign image angle/type descriptors to each image.

**Default Descriptors:**
| Descriptor | Use Case |
|------------|----------|
| `front` | Front-facing product shot |
| `diag1` | Diagonal angle 1 |
| `diag2` | Diagonal angle 2 |
| `rear` | Back of product |
| `zoom1` | Close-up detail 1 |
| `zoom2` | Close-up detail 2 |
| `folded` | Folded/packaged view |
| `tape` | Tape/label detail |
| `tag` | Tag/label shot |
| `thickness` | Thickness/depth view |
| `topdown` | Top-down/flat lay |
| `custom` | User-defined descriptor |

**Rules:**
- Descriptors must be unique within a product group
- Used descriptors are visually disabled in the dropdown
- Custom descriptors trigger a text input for user entry
- Custom descriptors follow same sanitization rules

### 7.5 Live Filename Preview

**Purpose:** Show the final filename in real time.

**Format:** `{sku}-{descriptor}.{extension}`

**Specifications:**
- Updates instantly as SKU or descriptor changes
- Displayed beneath each image thumbnail
- Visual indicator for incomplete filenames (missing SKU or descriptor)
- All output: lowercase, trimmed, hyphens for spaces, no invalid chars

**Examples:**
```
Input:  SKU = "63755", Descriptor = "front", File = "IMG_2045.JPG"
Output: 63755-front.jpg

Input:  SKU = "AB 100", Descriptor = "Zoom 1", File = "photo.PNG"  
Output: ab-100-zoom-1.png
```

### 7.6 ZIP Export

**Purpose:** Package all renamed images into a downloadable ZIP.

**Specifications:**
- Client-side ZIP generation via JSZip
- Filename: `assetflow-export.zip` (or `{first-sku}-export.zip`)
- Progress indicator for large batches
- Validation before export: all images must have SKU + descriptor
- Error state if any image is incomplete
- Download triggers automatically via Blob URL

### 7.7 Landing Page

**Purpose:** Convert visitors into users.

**Sections:**
1. **Hero** — Headline, subheadline, primary CTA, before/after demo
2. **How It Works** — 3-step visual: Upload → Organize → Export
3. **Features** — Key capabilities with icons
4. **Pricing** — Free vs Pro comparison table
5. **Final CTA** — "Try It Free — No Signup" button

**Primary CTA:** "Try It Free — No Signup"  
**Secondary CTA:** "See Pricing"

---

## 8. Technology Stack

### MVP Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15 | App Router, SSG for landing, client app |
| Language | TypeScript | 5.x | Type safety throughout |
| Styling | Tailwind CSS | v4 | Utility-first styling |
| State | Zustand | 5.x | Lightweight global state |
| Animation | Framer Motion | 11.x | Minimal, purposeful animations |
| Export | JSZip | 3.x | Client-side ZIP generation |
| Icons | Lucide React | latest | Consistent iconography |

### Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^11.0.0",
    "jszip": "^3.10.0",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0"
  }
}
```

### SaaS Phase (Post-MVP)

| Technology | Purpose |
|-----------|---------|
| Supabase Auth | Email/password authentication |
| Supabase Postgres | User profiles, subscriptions, templates |
| Stripe Checkout | Payment processing |
| Stripe Webhooks | Subscription lifecycle management |

---

## 9. Security & Configuration

### MVP Security Scope

**✅ In Scope:**
- Client-side only processing (no server uploads = no server-side attack surface)
- Input sanitization for SKU and descriptor fields
- File type validation (accept only image MIME types)
- File size limits (prevent browser crashes)
- Content Security Policy headers
- No sensitive data stored or transmitted

**❌ Out of Scope (SaaS Phase):**
- Authentication & authorization
- API rate limiting
- CORS configuration
- Database security (RLS policies)
- Payment data handling (delegated to Stripe)

### Configuration

```env
# .env.local (MVP - minimal)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_FREE_IMAGES=20
NEXT_PUBLIC_APP_NAME=AssetFlow
```

### Deployment Considerations

- **Platform:** Vercel or Netlify (static + edge)
- **CDN:** Automatic via platform
- **SSL:** Automatic via platform
- **No server-side secrets required for MVP**

---

## 10. Data Models

### TypeScript Interfaces

```typescript
// Core image type
interface AssetImage {
  id: string                    // Unique ID (crypto.randomUUID)
  file: File                    // Original File reference
  thumbnail: string             // Base64 data URL for preview
  originalName: string          // Original filename
  extension: string             // Extracted file extension (lowercase)
  groupId: string | null        // Product group assignment
  descriptor: string | null     // Assigned descriptor
  customDescriptor: string | null // Custom descriptor text (when descriptor === 'custom')
}

// Product group
interface ProductGroup {
  id: string                    // Unique ID
  name: string                  // Display name
  sku: string                   // Product SKU
}

// Computed (derived, never stored)
interface ResolvedFilename {
  imageId: string
  original: string              // Original filename
  resolved: string              // Final renamed filename
  isComplete: boolean           // Has SKU + descriptor
}

// Descriptor option
interface DescriptorOption {
  value: string                 // Descriptor slug
  label: string                 // Display label
  disabled: boolean             // Already used in group
}

// Store state
interface AssetStore {
  images: AssetImage[]
  groups: ProductGroup[]
  
  // Actions
  addImages: (files: File[]) => Promise<void>
  removeImage: (id: string) => void
  createGroup: (name: string) => void
  deleteGroup: (id: string) => void
  assignImageToGroup: (imageId: string, groupId: string) => void
  setGroupSku: (groupId: string, sku: string) => void
  setImageDescriptor: (imageId: string, descriptor: string) => void
  setCustomDescriptor: (imageId: string, text: string) => void
  reset: () => void
  
  // Computed
  getResolvedFilenames: () => ResolvedFilename[]
  getGroupImages: (groupId: string) => AssetImage[]
  getUsedDescriptors: (groupId: string) => string[]
  isExportReady: () => boolean
}
```

---

## 11. File Naming Specification

### Format

```
{sku}-{descriptor}.{extension}
```

### Sanitization Rules

Applied to both SKU and descriptor inputs:

| Rule | Input | Output |
|------|-------|--------|
| Lowercase | `ABC-123` | `abc-123` |
| Trim whitespace | `  abc  ` | `abc` |
| Replace spaces | `my product` | `my-product` |
| Strip invalid chars | `abc@#$123` | `abc123` |
| Preserve extension | `photo.PNG` | `.png` |
| Collapse hyphens | `abc--def` | `abc-def` |
| Trim leading/trailing hyphens | `-abc-` | `abc` |

### Allowed Characters

```regex
/[a-z0-9-]/
```

Only lowercase alphanumeric characters and hyphens are permitted in the output.

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty SKU | Filename shows as incomplete, export blocked |
| Empty descriptor | Filename shows as incomplete, export blocked |
| Duplicate descriptor in group | Dropdown option disabled |
| File with no extension | Preserved as-is (rare edge case) |
| Very long SKU | Allow but truncate display |

---

## 12. Success Criteria

### MVP Success Definition

The MVP is successful when a user can complete the full workflow — upload images, group them, assign names, and export a ZIP — without any guidance, confusion, or errors, in under 60 seconds for a typical batch.

### Functional Requirements

- ✅ User can upload images via drag-and-drop
- ✅ User can upload images via file picker (click fallback)
- ✅ Uploaded images display as thumbnails
- ✅ User can create and manage product groups
- ✅ User can enter SKU per group
- ✅ User can assign descriptors from a dropdown
- ✅ Duplicate descriptors are prevented within a group
- ✅ Custom descriptors are supported
- ✅ Filenames preview in real time
- ✅ User can export all renamed files as ZIP
- ✅ ZIP contains correctly renamed files
- ✅ Free tier enforces 20-image limit
- ✅ Landing page clearly communicates value proposition

### Quality Indicators

- **Performance:** Landing page loads in < 2 seconds
- **Responsiveness:** Fully functional on mobile (375px+)
- **Polish:** Matches Build With Treez design system
- **Reliability:** Zero data loss during workflow (client-side state)
- **Accessibility:** WCAG AA compliant

### User Experience Goals

- User understands the product within 5 seconds of landing
- User completes first workflow without any instructions
- Filenames are correct and consistent on every export
- UI feels premium and professional
- Zero friction from landing to export

---

## 13. Implementation Phases

### Phase 1: Project Foundation

**Goal:** Set up the project scaffold, design system integration, and core layout.

**Deliverables:**
- ✅ Next.js 15 project initialization with TypeScript
- ✅ Tailwind CSS v4 configuration
- ✅ Build With Treez design system integration (colors, fonts, glass morphism)
- ✅ Root layout with metadata and fonts
- ✅ Header component (logo, navigation, CTA)
- ✅ Footer component
- ✅ Basic routing (`/` for landing, `/app` for tool)
- ✅ Zustand store skeleton

**Validation:** Project runs locally, routes work, design system visuals match brand.

**Estimate:** 1 session

---

### Phase 2: Landing Page

**Goal:** Build a conversion-optimized landing page that clearly communicates the value proposition.

**Deliverables:**
- ✅ Hero section (headline, subheadline, CTA, before/after demo)
- ✅ How It Works section (3-step visual flow)
- ✅ Features section (key capabilities)
- ✅ Pricing section (Free vs Pro comparison table)
- ✅ Final CTA section
- ✅ Responsive design (mobile-first)
- ✅ Framer Motion entrance animations
- ✅ Sacred geometry background accent (subtle)

**Validation:** Landing page loads fast, communicates value in 5 seconds, CTA links to app.

**Estimate:** 1–2 sessions

---

### Phase 3: Core Application — Upload & Preview

**Goal:** Implement the image upload and thumbnail preview system.

**Deliverables:**
- ✅ DropZone component (drag-and-drop + click-to-browse)
- ✅ File type validation (images only)
- ✅ Thumbnail generation (Canvas/FileReader)
- ✅ Image count tracking (with free tier limit display)
- ✅ Zustand store: image state management
- ✅ Image card component with thumbnail preview
- ✅ Remove image functionality
- ✅ Empty state UI

**Validation:** User can drag images in, see thumbnails, remove images, see count.

**Estimate:** 1 session

---

### Phase 4: Core Application — Grouping, Naming & Export

**Goal:** Implement product grouping, descriptor assignment, live filename preview, and ZIP export.

**Deliverables:**
- ✅ Product group creation and management
- ✅ SKU input per group (with sanitization)
- ✅ Descriptor dropdown (with duplicate prevention)
- ✅ Custom descriptor support
- ✅ Live filename preview component
- ✅ Filename sanitization logic (`/lib/filename.ts`)
- ✅ Export validation (all images must be complete)
- ✅ ZIP generation and download (JSZip)
- ✅ Export progress indicator
- ✅ Success/error states

**Validation:** Full workflow works end-to-end — upload → group → name → export ZIP with correct filenames.

**Estimate:** 1–2 sessions

---

### Phase 5: Polish & Optimization

**Goal:** Refine the UI, improve edge cases, optimize performance, and prepare for deployment.

**Deliverables:**
- ✅ Responsive audit (mobile, tablet, desktop)
- ✅ Animation polish (Framer Motion transitions)
- ✅ Error handling and edge cases
- ✅ Accessibility audit (keyboard nav, ARIA labels, contrast)
- ✅ Performance optimization (lazy loading, minimal re-renders)
- ✅ SEO metadata (OG image, title, description)
- ✅ Final design system compliance check
- ✅ Cross-browser testing

**Validation:** Lighthouse score 90+, pixel-perfect design, zero console errors.

**Estimate:** 1 session

---

## 14. Future Considerations (Post-MVP / SaaS Phase)

### Authentication & Accounts
- Supabase Auth (email/password)
- Protected routes for Pro features
- User profile management

### Database & Persistence
- Supabase Postgres
- Tables: `profiles`, `subscriptions`, `saved_templates`
- Row Level Security (RLS) policies

### Billing
- Stripe Checkout integration
- Webhook-based subscription syncing
- Free → Pro upgrade flow
- Subscription management portal

### Pro Features
- Unlimited image processing (remove 20-image cap)
- Saved naming templates (reusable descriptor sets)
- Persistent user data (session history)
- User dashboard with usage analytics

### Advanced Features (Later)
- Custom descriptor preset templates
- Bulk operations (apply descriptor to multiple images)
- Image reordering within groups
- Filename format customization (`{sku}_{descriptor}`, `{descriptor}-{sku}`, etc.)
- Folder-based export (one folder per group)
- Platform-specific presets (Shopify, Etsy, Amazon naming conventions)
- AI auto-categorization (detect front/back/detail from image content)
- Direct platform upload (Shopify API, etc.)

---

## 15. Risks & Mitigations

### Risk 1: Browser Memory Limits

**Risk:** Large image batches (50+ high-res images) could exhaust browser memory.  
**Mitigation:** Generate thumbnails at reduced resolution. Store File references (not full data URLs) in state. Free tier cap of 20 images naturally limits this. Add a file size warning for images > 10MB.

### Risk 2: Feature Creep

**Risk:** Temptation to add SaaS features (auth, billing) before validating MVP demand.  
**Mitigation:** Strict phase discipline — complete one phase at a time, no jumping ahead. The `context.md` and project rules enforce this boundary.

### Risk 3: ZIP Export Performance

**Risk:** JSZip processing large batches could freeze the UI.  
**Mitigation:** Use Web Workers for ZIP generation if needed. Show progress indicator. Keep free tier limit at 20 images.

### Risk 4: Cross-Browser File API Inconsistencies

**Risk:** Drag-and-drop and File API behavior varies across browsers (especially Safari).  
**Mitigation:** Test across Chrome, Firefox, Safari, Edge. Use well-tested patterns for DataTransfer handling. Provide click-to-browse as universal fallback.

### Risk 5: Low Conversion from Free to Pro

**Risk:** Users may never upgrade if the free tier is sufficient.  
**Mitigation:** 20-image limit is intentionally tight for professional use. Clear "Upgrade" prompts when limit is reached. Pro value proposition (saved templates, unlimited) is compelling for repeat users.

---

## 16. Appendix

### A. Related Documents

| Document | Path | Purpose |
|----------|------|---------|
| Product Context | `/docs/context.md` | Product vision, scope, constraints |
| Design System | `/docs/BUILD_WITH_TREEZ_DESIGN_SYSTEM.md` | Visual language, component patterns |
| Project Rules | `.windsurf/rules/prefix.md` | Execution guidelines |

### B. File Naming Examples

```
Input Files:               →  Output Files:
─────────────────────────────────────────────
IMG_2045.jpg               →  63755-front.jpg
IMG_2046.jpg               →  63755-rear.jpg
IMG_2047.jpg               →  63755-zoom1.jpg
DSC_0001.png               →  ab-100-diag1.png
photo (1).jpeg             →  sneaker-pro-topdown.jpeg
PRODUCT_SHOT_FINAL.webp    →  hoodie-xl-lifestyle-1.webp
```

### C. Descriptor Reference

| Value | Label | Typical Use |
|-------|-------|-------------|
| `front` | Front | Front-facing product shot |
| `diag1` | Diagonal 1 | 45° angle view |
| `diag2` | Diagonal 2 | Opposite 45° angle |
| `rear` | Rear | Back of product |
| `zoom1` | Zoom 1 | Detail close-up |
| `zoom2` | Zoom 2 | Additional detail |
| `folded` | Folded | Folded/packaged state |
| `tape` | Tape | Tape/label detail |
| `tag` | Tag | Product tag/label |
| `thickness` | Thickness | Side/depth view |
| `topdown` | Top Down | Flat lay / bird's eye |
| `custom` | Custom | User-defined |

---

*AssetFlow — Built by Treez* ✨
