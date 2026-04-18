# Light Mode Implementation Guide

## Overview

Renamerly now has a **modular color system** using CSS custom properties (CSS variables) that makes implementing a light mode toggle straightforward.

---

## 🎨 Color System Architecture

### **CSS Variables (globals.css)**

We use semantic color names that automatically adapt based on the `data-theme` attribute:

```css
/* Dark Mode (default) */
:root {
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a2e;
  --color-text-primary: #f8f8f8;
  /* ... etc */
}

/* Light Mode */
:root[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text-primary: #1a1a1a;
  /* ... etc */
}
```

###  **Semantic Color Categories**

**1. Brand Colors** (static - never change):
- `--brand-purple`: #915eff
- `--brand-cyan`: #00d4ff
- `--brand-pink`: #ff6b9d

**2. Background Colors** (theme-adaptive):
- `--color-bg-primary` - Main background
- `--color-bg-secondary` - Cards, elevated surfaces
- `--color-bg-tertiary` - Hover states, inputs

**3. Surface Colors** (transparency-based):
- `--color-surface-glass` - Glass morphism effect
- `--color-surface-glass-hover` - Hover state

**4. Border Colors** (theme-adaptive):
- `--color-border-subtle` - Subtle borders
- `--color-border-medium` - Standard borders
- `--color-border-strong` - Emphasized borders

**5. Text Colors** (theme-adaptive):
- `--color-text-primary` - Headings, important text
- `--color-text-secondary` - Body text, descriptions
- `--color-text-tertiary` - Placeholders, disabled

**6. Status Colors** (static):
- `--color-success`: #10b981
- `--color-warning`: #f59e0b
- `--color-error`: #ef4444
- `--color-info`: #3b82f6

---

## 🔄 How to Implement Light Mode Toggle

### **Step 1: Create Theme Context**

```tsx
// src/contexts/ThemeContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Check localStorage on mount
    const storedTheme = localStorage.getItem('theme') as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
      document.documentElement.setAttribute('data-theme', storedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

### **Step 2: Wrap App with ThemeProvider**

```tsx
// src/app/layout.tsx
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/* ... rest of app */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### **Step 3: Create Theme Toggle Button**

```tsx
// src/components/ui/ThemeToggle.tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-400" />
      )}
    </button>
  )
}
```

### **Step 4: Add Toggle to Header/Dashboard**

```tsx
// In Header or DashboardLayout
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Add in navigation or settings area
<ThemeToggle />
```

---

## 🎯 Where to Place the Toggle

**Recommended Locations:**

1. **Dashboard Sidebar** - Next to user profile at bottom
2. **Header** - Next to Login/Signup buttons
3. **Settings Page** - In appearance section
4. **Mobile Menu** - At top or bottom of slide-out menu

---

## ✅ Best Practices

### **DO:**
- ✅ Use semantic variable names (`--color-bg-primary` not `--dark-bg`)
- ✅ Test in both themes before committing
- ✅ Maintain brand colors consistently
- ✅ Respect user preference (`prefers-color-scheme`)
- ✅ Save preference to localStorage
- ✅ Smooth transition animations

### **DON'T:**
- ❌ Hardcode color values (use variables)
- ❌ Change brand colors between themes
- ❌ Force theme without user control
- ❌ Forget about focus/hover states

---

## 🔍 Testing Checklist

**Light Mode:**
- [ ] All text is readable (sufficient contrast)
- [ ] Glass morphism still visible
- [ ] Borders are subtle but visible
- [ ] Hover states work correctly
- [ ] Focus indicators are clear
- [ ] Images/icons have appropriate contrast

**Dark Mode:**
- [ ] Text is not too bright (avoid pure white)
- [ ] Shadows work appropriately
- [ ] Glass morphism maintains depth
- [ ] Gradients remain vibrant

---

## 📐 Current Color Values

### **Dark Mode (Default)**
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg-primary` | `#0a0a0a` | Main background |
| `--color-bg-secondary` | `#1a1a2e` | Cards, panels |
| `--color-text-primary` | `#f8f8f8` | Headings |
| `--color-text-secondary` | `#a0a0a0` | Body text |

### **Light Mode**
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg-primary` | `#ffffff` | Main background |
| `--color-bg-secondary` | `#f9fafb` | Cards, panels |
| `--color-text-primary` | `#1a1a1a` | Headings |
| `--color-text-secondary` | `#4b5563` | Body text |

---

## 🚀 Future Enhancements

1. **System Preference Detection**
   ```tsx
   useEffect(() => {
     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
     setTheme(prefersDark ? 'dark' : 'light')
   }, [])
   ```

2. **Multiple Themes**
   - Add `data-theme="midnight"` for ultra-dark mode
   - Add `data-theme="high-contrast"` for accessibility

3. **Smooth Transitions**
   ```css
   * {
     transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
   }
   ```

---

## 📝 Notes

- Brand colors (`purple`, `cyan`, `pink`) remain **static** across all themes
- Glass morphism adapts by using `rgba()` with theme-appropriate opacity
- All new components should use CSS variables, not hardcoded colors
- Tailwind classes like `bg-deep-space` now reference CSS variables automatically

---

## 🎨 Example Component Update

**Before (hardcoded):**
```tsx
<div className="bg-[#0a0a0a] text-white border-white/10">
```

**After (theme-adaptive):**
```tsx
<div className="bg-deep-space text-text-primary border-border-subtle">
```

The CSS variables handle the theme switching automatically!
