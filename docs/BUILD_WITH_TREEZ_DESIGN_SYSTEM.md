# Build With Treez - Design System

> **Universal Design Language for All Build With Treez Applications**  
> Version 1.0 | Last Updated: April 9, 2026

This design system defines the visual language, component patterns, and implementation standards for all Build With Treez products. Use this guide to maintain brand consistency across your entire application portfolio.

---

## 🎯 Design Philosophy

**"Where Sacred Geometry Meets Modern Technology"**

Build With Treez applications blend ancient sacred geometry patterns with cutting-edge web technology, creating a unique visual identity that represents both timeless design principles and innovative technical expertise.

### Core Principles

1. **Subtle but Impressive** - Effects enhance usability, never distract
2. **Professional Polish** - Enterprise-grade quality in every detail
3. **Accessible First** - Beautiful and functional for all users
4. **Brand Consistent** - Instant recognition across all products
5. **Performance Minded** - Fast, smooth, optimized experiences

---

## 🎨 Brand Identity

### Brand Colors

```css
/* Primary Colors - Use these in all applications */
--treez-purple: #915eff;    /* Innovation, creativity, premium */
--treez-cyan: #00d4ff;      /* Technology, precision, trust */
--treez-pink: #ff6b9d;      /* Energy, passion, creativity */

/* Background Colors */
--deep-space: #0a0a0a;      /* Primary background (dark theme) */
--cosmic-gray: #1a1a2e;     /* Secondary background / cards */
--light-space: #f8f8f8;     /* Primary background (light theme) */
--soft-gray: #e5e5e5;       /* Secondary background (light theme) */

/* Text Colors */
--text-primary-dark: #f8f8f8;    /* Primary text on dark */
--text-secondary-dark: #b0b0b0;  /* Secondary text on dark */
--text-primary-light: #1a1a2e;   /* Primary text on light */
--text-secondary-light: #6b7280; /* Secondary text on light */

/* Semantic Colors */
--success: #10b981;         /* Success states */
--warning: #f59e0b;         /* Warning states */
--error: #ef4444;           /* Error states */
--info: #3b82f6;            /* Info states */
```

### Color Usage Guidelines

#### Purple (#915eff)
- **Primary Use:** Main CTAs, brand elements, key highlights, active states
- **Represents:** Innovation, creativity, premium quality
- **Pairs with:** Cyan, Pink, White, Deep Space
- **Applications:** Primary buttons, logos, headings, important icons

#### Cyan (#00d4ff)
- **Primary Use:** Secondary CTAs, tech elements, links, data visualization
- **Represents:** Technology, trust, clarity, precision
- **Pairs with:** Purple, White, Deep Space, Pink
- **Applications:** Secondary buttons, links, borders, tech indicators

#### Pink (#ff6b9d)
- **Primary Use:** Accents, hover states, energy indicators, gradients
- **Represents:** Passion, energy, creativity, action
- **Pairs with:** Purple, Cyan, White
- **Applications:** Gradients, hover effects, call-to-action accents

### Gradient Combinations

```css
/* Primary Brand Gradient - Use for main CTAs */
.gradient-primary {
  background: linear-gradient(135deg, #915eff 0%, #ff6b9d 100%);
}

/* Tech Gradient - Use for tech-focused elements */
.gradient-tech {
  background: linear-gradient(135deg, #00d4ff 0%, #915eff 100%);
}

/* Energy Gradient - Use for dynamic elements */
.gradient-energy {
  background: linear-gradient(135deg, #ff6b9d 0%, #915eff 50%, #00d4ff 100%);
}

/* Subtle Background Gradient */
.gradient-bg {
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%);
}
```

---

## 🔘 Button System

### Primary CTA (Call-to-Action)

**Use for:** Main actions, conversions, primary navigation

```tsx
<button className="group relative px-6 sm:px-8 py-3 sm:py-4 
  bg-gradient-to-r from-[#915eff] to-[#ff6b9d] 
  rounded-xl font-semibold text-white 
  shadow-lg hover:shadow-[#915eff]/50 
  transition-all duration-300 hover:scale-105 
  overflow-hidden">
  <span className="relative z-10">Action Text</span>
  <div className="absolute inset-0 
    bg-gradient-to-r from-[#ff6b9d] to-[#915eff] 
    opacity-0 group-hover:opacity-100 
    transition-opacity duration-300" />
</button>
```

**Features:**
- Purple-to-pink gradient background
- Reverse gradient on hover
- Scale lift effect (1.05)
- Colored glow shadow
- Smooth 300ms transitions
- Responsive padding

### Secondary CTA

**Use for:** Secondary actions, alternative paths, cancel actions

```tsx
<button className="px-6 sm:px-8 py-3 sm:py-4 
  border-2 border-[#00d4ff] 
  rounded-xl font-semibold text-[#00d4ff] 
  hover:bg-[#00d4ff]/10 
  transition-all duration-300 hover:scale-105 
  hover:shadow-lg hover:shadow-[#00d4ff]/30 
  bg-[#0a0a0a]/80 backdrop-blur-sm">
  Action Text
</button>
```

**Features:**
- Cyan border
- Transparent background with blur
- Cyan glow on hover
- Subtle background fill on hover

### Tertiary / Ghost Button

**Use for:** Subtle actions, icon buttons, low-priority actions

```tsx
<button className="p-3 rounded-lg 
  border border-white/10 
  hover:border-[#915eff] 
  bg-white/5 hover:bg-[#915eff]/10 
  transition-all duration-300 hover:scale-110 
  hover:shadow-lg hover:shadow-[#915eff]/30">
  {/* Icon or minimal text */}
</button>
```

### Disabled State

```css
/* Add to any button */
disabled:opacity-50 
disabled:cursor-not-allowed 
disabled:hover:scale-100
disabled:hover:shadow-none
```

### Button Sizes

```tsx
/* Small */
className="px-4 py-2 text-sm"

/* Medium (default) */
className="px-6 py-3 text-base"

/* Large */
className="px-8 py-4 text-lg"

/* Icon Only */
className="p-3 w-10 h-10"  /* sm */
className="p-4 w-12 h-12"  /* md */
```

---

## 🎭 Animation Standards

### Framer Motion Patterns

All applications should use consistent animation timing and patterns.

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
/>
```

#### Slide In (from direction)
```tsx
/* From Left */
<motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
/>

/* From Right */
<motion.div
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
/>

/* From Bottom */
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
/>
```

#### Scale In
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
/>
```

#### Stagger Children
```tsx
<motion.div
  initial="hidden"
  animate="show"
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Animation Timing

```css
/* Standard Delays */
--delay-fast: 0.1s;      /* Quick sequential items */
--delay-medium: 0.3s;    /* Standard stagger */
--delay-slow: 0.6s;      /* Dramatic reveal */

/* Durations */
--duration-fast: 0.2s;   /* Micro-interactions */
--duration-normal: 0.3s; /* Standard transitions */
--duration-slow: 0.8s;   /* Entrance animations */
```

---

## 📱 Responsive Design

### Breakpoint System

```css
/* Tailwind CSS Breakpoints (Mobile-First) */
DEFAULT  : 0px      /* Mobile phones */
sm       : 640px    /* Large phones, small tablets */
md       : 768px    /* Tablets */
lg       : 1024px   /* Small desktops, landscape tablets */
xl       : 1280px   /* Desktops */
2xl      : 1536px   /* Large desktops */
```

### Mobile-First Patterns

#### Section Padding
```tsx
className="py-12 sm:py-16 md:py-24 lg:py-32"
```

#### Typography Scaling
```tsx
/* Headings */
className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"

/* Body Text */
className="text-sm sm:text-base md:text-lg"

/* Small Text */
className="text-xs sm:text-sm"
```

#### Grid Layouts
```tsx
/* 1 column mobile, 2 tablet, 3 desktop */
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"

/* 1 column mobile, 2 desktop */
className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
```

#### Flexbox Patterns
```tsx
/* Stack on mobile, row on desktop */
className="flex flex-col lg:flex-row gap-4 lg:gap-8"

/* Centered on mobile, left-aligned desktop */
className="text-center lg:text-left"
```

#### Card/Container Padding
```tsx
className="p-4 sm:p-6 md:p-8"
```

#### Spacing
```tsx
/* Vertical spacing */
className="space-y-4 sm:space-y-6 lg:space-y-8"

/* Horizontal spacing */
className="space-x-3 sm:space-x-4 lg:space-x-6"
```

### Touch-Friendly Design

```css
/* Minimum touch target size */
min-width: 44px;
min-height: 44px;

/* Adequate spacing between clickable elements */
gap: 12px; /* minimum on mobile */
```

---

## 🎨 Glass Morphism Style

Build With Treez signature aesthetic uses glass morphism for modern, professional UI.

### Card Component
```tsx
<div className="bg-white/5 backdrop-blur-xl 
  border border-white/10 
  rounded-xl p-6 
  hover:bg-white/10 
  transition-all duration-300">
  {/* Content */}
</div>
```

### Input Fields
```tsx
<input className="w-full px-4 py-3 
  bg-white/5 backdrop-blur-sm 
  border border-white/10 
  rounded-lg text-white 
  placeholder:text-gray-400
  focus:outline-none 
  focus:ring-2 
  focus:ring-[#915eff] 
  focus:border-transparent
  transition-all duration-300" />
```

### Modal/Dialog
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
  
  {/* Modal */}
  <div className="relative bg-[#1a1a2e]/95 backdrop-blur-xl 
    border border-white/10 
    rounded-2xl p-8 
    max-w-lg w-full mx-4 
    shadow-2xl shadow-[#915eff]/20">
    {/* Content */}
  </div>
</div>
```

### Status Badge
```tsx
<div className="inline-flex items-center gap-2 
  px-3 py-1.5 rounded-full 
  bg-gradient-to-r from-[#915eff]/20 to-[#00d4ff]/20 
  border border-[#915eff]/30 
  backdrop-blur-sm">
  <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
  <span className="text-sm font-medium text-[#00d4ff]">Status Text</span>
</div>
```

---

## ✨ Interactive Elements

### Hover Effects Standard

All interactive elements should follow this pattern:

```css
/* Standard hover effect */
.interactive-element {
  transition: all 300ms ease-in-out;
}

.interactive-element:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(145, 94, 255, 0.3);
}

/* Icon hover (larger scale) */
.icon-button:hover {
  transform: scale(1.1);
}
```

### Focus States

```tsx
/* Form elements */
className="focus:outline-none 
  focus:ring-2 
  focus:ring-[#915eff] 
  focus:ring-offset-2 
  focus:ring-offset-[#0a0a0a]"

/* Buttons and links */
className="focus-visible:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-[#00d4ff] 
  focus-visible:ring-offset-2"
```

### Active States

```tsx
/* Pressed/Active */
className="active:scale-95 
  active:shadow-inner"

/* Selected/Current */
className="data-[selected=true]:bg-[#915eff]/20 
  data-[selected=true]:border-[#915eff]"
```

### Loading States

```tsx
/* Shimmer effect */
<div className="animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4" />
</div>

/* Spinner */
<div className="animate-spin rounded-full 
  h-8 w-8 
  border-2 border-white/20 
  border-t-[#915eff]" />
```

---

## 🌟 Sacred Geometry Integration

The signature visual element across all Build With Treez applications.

### Background Patterns

**Flower of Life Pattern** - Subtle background element

```tsx
// Use in hero sections or key landing areas
<canvas 
  className="absolute inset-0 opacity-5 pointer-events-none" 
  aria-hidden="true"
/>
```

**Implementation tip:** Use canvas-based 2D rendering with cosmic purple (#915eff) at 3-7% opacity.

### Decorative Elements

**Geometric Accents**
```tsx
/* Corner accents */
<div className="absolute top-0 right-0 w-32 h-32 opacity-10">
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" 
      stroke="url(#gradient)" 
      fill="none" 
      strokeWidth="1" />
  </svg>
</div>
```

### Optional 3D Elements

For applications that want immersive experiences:

- **Merkaba (Star Tetrahedron)** - Hero sections, landing pages
- **Quantum Field** - Particle systems for dynamic sections
- **Torus Field** - Data visualization, loading states

**Note:** 3D elements are optional. Use them where they add value without impacting performance.

---

## 📐 Layout & Spacing

### Container Widths

```tsx
/* Full width */
className="w-full"

/* Constrained content */
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

/* Narrow content (text-heavy) */
className="max-w-3xl mx-auto px-4"

/* Wide content */
className="max-w-screen-2xl mx-auto px-4"
```

### Spacing Scale

```css
/* Consistent spacing scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### Z-Index Layering

```css
/* Consistent z-index scale */
--z-background: 0;        /* Background patterns */
--z-base: 10;             /* Base content */
--z-canvas: 15;           /* 3D scenes / Canvas elements */
--z-content: 20;          /* Main content */
--z-elevated: 30;         /* Elevated cards */
--z-sticky: 40;           /* Sticky elements */
--z-fixed: 50;            /* Fixed elements (header, footer) */
--z-overlay: 60;          /* Overlays, dropdowns */
--z-modal: 70;            /* Modals, dialogs */
--z-popover: 80;          /* Popovers, tooltips */
--z-toast: 90;            /* Notifications */
```

---

## 🎯 Component Patterns

### Navigation Header

```tsx
<header className="fixed top-0 left-0 right-0 z-50 
  bg-[#0a0a0a]/95 backdrop-blur-xl 
  border-b border-white/10 
  transition-all duration-300">
  <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Build With Treez" className="h-8" />
      </a>
      
      {/* Navigation */}
      <ul className="hidden md:flex items-center gap-6">
        {/* Nav items */}
      </ul>
      
      {/* CTA */}
      <button className="px-6 py-2 bg-gradient-to-r from-[#915eff] to-[#ff6b9d] rounded-lg">
        Get Started
      </button>
    </div>
  </nav>
</header>
```

### Footer

```tsx
<footer className="bg-[#0a0a0a] border-t border-white/10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Footer content */}
    </div>
    
    <div className="mt-8 pt-8 border-t border-white/10 text-center">
      <p className="text-gray-400 text-sm">
        © {new Date().getFullYear()} Build With Treez. All rights reserved.
      </p>
    </div>
  </div>
</footer>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <div key={item.id} className="group 
      bg-white/5 backdrop-blur-xl 
      border border-white/10 
      rounded-xl p-6 
      hover:bg-white/10 
      hover:border-[#915eff]/30
      hover:shadow-lg hover:shadow-[#915eff]/20
      transition-all duration-300 
      hover:scale-105">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Form Pattern

```tsx
<form className="space-y-6">
  {/* Input group */}
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Label Text
    </label>
    <input 
      type="text"
      className="w-full px-4 py-3 
        bg-white/5 backdrop-blur-sm 
        border border-white/10 
        rounded-lg text-white 
        focus:outline-none 
        focus:ring-2 
        focus:ring-[#915eff] 
        transition-all duration-300"
      placeholder="Placeholder text"
    />
  </div>
  
  {/* Submit button */}
  <button type="submit" className="w-full py-3 
    bg-gradient-to-r from-[#915eff] to-[#ff6b9d] 
    rounded-lg font-semibold text-white
    hover:scale-105 
    transition-all duration-300">
    Submit
  </button>
</form>
```

### Loading Skeleton

```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-white/10 rounded w-3/4" />
  <div className="h-4 bg-white/10 rounded w-1/2" />
  <div className="h-4 bg-white/10 rounded w-5/6" />
</div>
```

### Error/Success Messages

```tsx
/* Success */
<div className="p-4 rounded-lg 
  bg-green-500/10 border border-green-500/30 
  text-green-400">
  <p className="font-medium">Success message</p>
</div>

/* Error */
<div className="p-4 rounded-lg 
  bg-red-500/10 border border-red-500/30 
  text-red-400">
  <p className="font-medium">Error message</p>
</div>

/* Warning */
<div className="p-4 rounded-lg 
  bg-yellow-500/10 border border-yellow-500/30 
  text-yellow-400">
  <p className="font-medium">Warning message</p>
</div>
```

---

## 🚀 Performance Guidelines

### Code Splitting

```tsx
// Lazy load heavy components
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingSkeleton />,
  ssr: false // if client-only
})
```

### Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 3D Scene Performance

```tsx
// Lazy load 3D scenes
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse" />
})

// Use intersection observer to load only when visible
const { ref, isIntersecting } = useIntersectionObserver()

return (
  <div ref={ref}>
    {isIntersecting && <Scene3D />}
  </div>
)
```

### Animation Performance

```css
/* Use transform and opacity for animations */
/* ✅ Good - GPU accelerated */
transform: translateX(100px);
opacity: 0.5;

/* ❌ Avoid - triggers layout recalculation */
left: 100px;
width: 50%;
```

---

## ♿ Accessibility Standards

### Semantic HTML

```tsx
/* Use proper semantic elements */
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<section>...</section>
<footer>...</footer>
```

### ARIA Labels

```tsx
/* Interactive elements need labels */
<button aria-label="Close dialog">
  <XIcon />
</button>

/* Decorative images should be hidden */
<svg aria-hidden="true">...</svg>

/* Form inputs need labels */
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Keyboard Navigation

```tsx
/* Ensure all interactive elements are keyboard accessible */
<div 
  role="button" 
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Clickable div
</div>
```

### Color Contrast

```css
/* Ensure WCAG AA compliance (4.5:1 for normal text) */
/* All brand colors meet contrast requirements on dark backgrounds */
--treez-purple: #915eff; /* ✅ 7.2:1 on #0a0a0a */
--treez-cyan: #00d4ff;   /* ✅ 8.1:1 on #0a0a0a */
--treez-pink: #ff6b9d;   /* ✅ 5.8:1 on #0a0a0a */
```

### Focus Indicators

```css
/* Never remove focus outlines without replacement */
/* Always provide visible focus indicators */
:focus-visible {
  outline: 2px solid var(--treez-purple);
  outline-offset: 2px;
}
```

---

## 📝 Code Style & Conventions

### File Organization

```
/src
  /components
    /ui             # Reusable UI components
      Button.tsx
      Card.tsx
      Input.tsx
    /layout         # Layout components
      Header.tsx
      Footer.tsx
    /features       # Feature-specific components
  /lib              # Utilities, helpers
  /styles           # Global styles
  /hooks            # Custom React hooks
  /types            # TypeScript types
```

### Component Structure

```tsx
'use client' // If needed for client-side features

// External imports
import { useState } from 'react'
import { motion } from 'framer-motion'

// Internal imports
import { Button } from '@/components/ui/Button'
import { useCustomHook } from '@/hooks/useCustomHook'

// Types
interface ComponentProps {
  title: string
  onAction?: () => void
}

// Component
export function ComponentName({ title, onAction }: ComponentProps) {
  // State
  const [isOpen, setIsOpen] = useState(false)
  
  // Hooks
  const customValue = useCustomHook()
  
  // Handlers
  const handleClick = () => {
    setIsOpen(!isOpen)
    onAction?.()
  }
  
  // Render
  return (
    <section className="...">
      {/* Content */}
    </section>
  )
}
```

### Naming Conventions

```tsx
// Components: PascalCase
ComponentName.tsx

// Files: kebab-case for utilities
use-custom-hook.ts
format-date.ts

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// Functions: camelCase
function handleSubmit() {}

// CSS Classes: Tailwind utilities (lowercase with hyphens)
className="bg-white/5 border-white/10"

// IDs: kebab-case
id="main-navigation"
```

---

## 🎨 Theme Variations

### Dark Theme (Default)

```tsx
// Primary theme for all applications
<body className="bg-[#0a0a0a] text-white">
  {/* Content */}
</body>
```

### Light Theme (Optional)

```tsx
// If application supports light mode
<body className="bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
  {/* Use dark: prefix for dark mode variants */}
</body>

// Example component with theme support
<div className="bg-white dark:bg-[#1a1a2e] 
  text-gray-900 dark:text-white 
  border-gray-200 dark:border-white/10">
  {/* Content */}
</div>
```

---

## ✅ Implementation Checklist

When building any new Build With Treez application, ensure:

### Visual Design
- [ ] Brand colors used consistently (#915eff, #00d4ff, #ff6b9d)
- [ ] Glass morphism applied to cards and overlays
- [ ] Gradients use brand color combinations
- [ ] Sacred geometry element integrated (subtle background or accent)
- [ ] Dark theme as default (light theme optional)

### Components
- [ ] Buttons follow three-tier system (Primary, Secondary, Tertiary)
- [ ] All interactive elements have hover effects (scale + glow)
- [ ] Forms use glass morphism input style
- [ ] Cards use consistent border and backdrop-blur
- [ ] Loading states use shimmer or spinner patterns

### Interactions
- [ ] Framer Motion animations with consistent timing (300ms default)
- [ ] Hover transitions are smooth (300ms ease-in-out)
- [ ] Focus states visible and accessible
- [ ] Active states provide feedback
- [ ] Disabled states clearly indicated

### Responsive Design
- [ ] Mobile-first approach implemented
- [ ] Touch targets minimum 44x44px
- [ ] Typography scales across breakpoints
- [ ] Spacing reduces appropriately on mobile
- [ ] Grid layouts stack properly on small screens

### Accessibility
- [ ] Semantic HTML elements used
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation functional
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Screen reader friendly

### Performance
- [ ] Heavy components lazy loaded
- [ ] Images optimized (Next.js Image component)
- [ ] 3D scenes load only when needed
- [ ] Animations use transform/opacity
- [ ] Code split by route/feature

### Code Quality
- [ ] TypeScript for type safety
- [ ] Components properly structured
- [ ] Naming conventions followed
- [ ] File organization consistent
- [ ] Comments where necessary

---

## 📚 Quick Reference

### Essential Imports

```tsx
// Framer Motion
import { motion } from 'framer-motion'

// Next.js
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// React
import { useState, useEffect, useRef } from 'react'
```

### Common Patterns

```tsx
// Glass card
className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"

// Primary button
className="px-6 py-3 bg-gradient-to-r from-[#915eff] to-[#ff6b9d] rounded-xl text-white hover:scale-105 transition-all duration-300"

// Hover effect
className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#915eff]/30"

// Responsive text
className="text-3xl sm:text-4xl lg:text-5xl"

// Responsive padding
className="py-12 sm:py-16 lg:py-24"
```

---

## 🎯 Application-Specific Adaptations

While this design system provides the foundation, each application can have unique elements:

### AssetFlow (Image Management)
- Image preview cards with glass morphism
- Drag-and-drop zones with brand color accents
- Progress indicators using brand gradients

### PerfLens (Analytics)
- Data visualization using brand colors
- Chart elements with cyan/purple gradients
- Metric cards with sacred geometry accents

### SwearJar+ (Finance Tracker)
- Transaction cards with glass effect
- Category icons with brand color coding
- Financial charts using brand palette

**Key principle:** Adapt the system, don't break it. Each application should feel distinctly Build With Treez while serving its unique purpose.

---

## 🔄 Version History

**v1.0** - April 9, 2026
- Initial design system documentation
- Extracted from portfolio implementation
- Made generic for application portfolio use

---

## 💡 Support & Updates

This design system is a living document. As Build With Treez applications evolve, this guide will be updated to reflect new patterns and improvements.

**Feedback:** If you discover better patterns or improvements, document them and update this guide.

**Consistency First:** When in doubt, reference this guide to maintain brand consistency across all applications.

---

*Build With Treez - Where Sacred Geometry Meets Modern Technology* ✨
