# AssetFlow — Product Context

## Product Overview

AssetFlow is a web application that enables users to organize, rename, preview, and export product images into clean, standardized filenames.

Primary transformation:
IMG_2045.jpg → 63755-front.jpg

The product is designed for speed, simplicity, and immediate usability.

---

## Core Value Proposition

Stop wasting hours renaming product images.

AssetFlow allows users to convert unstructured image files into clean, store-ready assets in seconds.

---

## Target Users

* Shopify store owners
* Etsy sellers
* small business owners
* freelancers managing product assets
* product photographers

Users prioritize:

* speed
* simplicity
* accuracy
* professional output

---

## Product Goals

1. Deliver value within seconds of first use
2. Require no onboarding or learning curve
3. Provide a clean, professional interface
4. Support a clear free → paid upgrade path
5. Be production-ready and portfolio-quality

---

## Core Workflow

1. User uploads images
2. Images are grouped into products
3. User assigns descriptors
4. User enters SKU per group
5. Filenames are generated in real time
6. User exports files as a ZIP

---

## File Naming Rules

Format:
{sku}-{descriptor}.{extension}

Rules:

* lowercase output
* trim whitespace
* replace spaces with hyphens
* sanitize invalid characters
* preserve original file extension

---

## Descriptor System

### Default Descriptors

* front
* diag1
* diag2
* rear
* zoom1
* zoom2
* folded
* tape
* tag
* thickness
* topdown
* custom

### Rules

* descriptors must be unique within a product group
* used descriptors must be disabled in selection UI
* custom descriptors are allowed

---

## MVP Scope

### Included

* drag-and-drop upload
* image previews
* product grouping
* SKU input
* descriptor assignment
* duplicate descriptor prevention
* live filename preview
* ZIP export (client-side)
* responsive UI
* landing page
* pricing section

### Excluded

* authentication
* database persistence
* billing
* saved templates
* cloud storage
* team features
* AI features
* third-party integrations

---

## SaaS Scope (Post-MVP)

### Authentication

* Supabase Auth
* email/password login
* protected routes

### Database

* Supabase Postgres

Tables:

* profiles
* subscriptions
* saved_templates

### Billing

* Stripe Checkout
* webhook-based subscription syncing

### Pro Features

* unlimited image processing
* saved templates
* persistent user data
* dashboard

---

## Free vs Pro Model

### Free

* no login required
* up to 20 images per session
* full core workflow

### Pro

* requires account
* unlimited images
* saved templates
* subscription billing

---

## UI / UX Principles

* immediate usability
* minimal steps to value
* fast feedback loops
* clear visual hierarchy
* consistent layout
* no unnecessary friction

---

## Design Direction

* dark theme
* modern SaaS aesthetic
* strong spacing
* rounded components
* subtle shadows
* teal/cyan accent color

Avoid:

* visual clutter
* heavy animation
* unnecessary effects

---

## Landing Page Requirements

The landing page must:

* communicate value within 5 seconds
* clearly show problem → solution
* demonstrate transformation (before → after)
* include a simple 3-step explanation
* present pricing clearly
* drive users to try the product

Primary CTA:
Try It Free — No Signup

---

## Technical Stack

### MVP

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS v4
* Zustand
* Framer Motion (minimal usage)
* JSZip

### SaaS Phase

* Supabase Auth
* Supabase Postgres
* Stripe Checkout
* Stripe Webhooks

---

## Architecture Guidelines

* modular components
* clear separation of concerns
* reusable utilities
* typed data models
* minimal dependencies
* client-only logic scoped appropriately

---

## Performance Requirements

* fast initial load
* minimal client-side overhead
* responsive on mobile
* no heavy runtime processing
* avoid unnecessary re-renders

---

## Constraints

* avoid feature creep
* prioritize core workflow over infrastructure
* do not implement SaaS features during MVP phase
* keep implementation simple and extensible

---

## Windsurf Execution Rules

* complete one phase at a time
* do not jump ahead
* do not add features outside scope
* do not modify unrelated code
* keep code clean and modular
* summarize changes after each phase

---

## Success Criteria

* a user understands the product within seconds
* a user can complete the workflow without guidance
* filenames are correct and consistent
* the UI feels polished and professional
* the product works without authentication
* SaaS features can be added cleanly afterward
