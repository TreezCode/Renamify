# Plan 09: Enterprise Workspace Table
**Status:** 🔄 IN PROGRESS — Phase 1 ✅ Phase 2 ✅  
**Depends on:** `08a-workspace-ui-bridge.md` (complete)  
**Goal:** Transform the workspace image table into an enterprise-grade, scalable UI capable of handling 1,000+ images across 10+ product groups without performance degradation or UX friction.

---

## Problem Statement

The current workspace has a fundamental **density and scale problem**. With 20–30 images the user already has to scroll past the inbox just to reach the first configured group. At 1,000 images across 10 product listings, the current architecture becomes completely unusable:

- **ImagesWithoutSKU** renders large grid thumbnails (200px+ cards) — 6 images fill the entire viewport
- **Each SKUProductGroup** is a separate accordion component with its own table instance — 10 groups × 10 rows = 100 DOM nodes just for table rows, plus animation trees, border-collapse, etc.
- **Table rows** are ~52–60px tall — 1,000 rows = 52,000–60,000px of scrollable height
- **No virtualization** — all rows render to the DOM regardless of scroll position
- **No keyboard navigation** — every field requires mouse interaction
- **Primitive selection** — no shift-click range, no keyboard shortcuts

**Reference targets:**
| Product | What we borrow |
|---|---|
| **Google Drive list view** | Compact rows, shift-click range select, drag select, sticky group headers, list/grid toggle |
| **Figma** | Single unified scroll container, collapsible section headers |
| **Capture One** | Professional image management density, status indicators |
| **AiseeFox competitor** | Compact table rows, status column, single-table layout |

---

## Architecture Plan — 4 Phases

### Phase 1 — Density & Compact Mode ✅ COMPLETE
**Goal:** Quick wins that dramatically improve vertical space efficiency without architectural changes.

**Changes:**
- [x] **Collapsible inbox** — `ImagesWithoutSKU` gains a compact collapsed state: single row showing count + 5 mini thumbnails + overflow badge. Drop zone still active when collapsed.
- [x] **Collapse All / Expand All** — `AppToolbar` gets a toggle button that collapses/expands all SKU groups and the inbox simultaneously.
- [ ] **Auto-collapse configured groups** — groups that are 100% configured start collapsed by default (prevents finished work from consuming viewport space).

**Store additions:**
- `inboxCollapsed: boolean`
- `toggleInboxCollapsed()`
- `collapseAllSkus()` — collapses all groups + inbox
- `expandAllSkus()` — expands all groups + inbox

**Design tokens (from Treez Design System):**
- Collapsed header: `bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl`
- Thumbnail strip: 5 × 24px circles, `object-cover rounded-full border border-white/10`
- Toggle button: tertiary ghost style per design system

---

### Phase 2 — Unified Virtual Table ✅ COMPLETE
**Goal:** Replace per-SKU component architecture with a single unified table with virtual scrolling. This is the non-negotiable foundation for 1,000+ image scale.

**Architecture change:**

Current:
```
ImagesWithoutSKU (component, grid layout)
SKUProductGroup × N (each with own table, accordion, animation tree)
```

Target:
```
WorkspaceTable (single virtualized list — @tanstack/react-virtual)
  ├── InboxGroupHeader (sticky)
  ├── ImageRow × M (32px compact)
  ├── SKUGroupHeader (sticky, collapsible)
  ├── ImageRow × N
  └── ...
```

**Key features:**
- Single `<div>` scroll container with `@tanstack/react-virtual` — only ~30 rows in DOM at any time
- Sticky group section headers as rows (not separate components)
- Column layout: [ ☐ ] [ thumb ] [ filename ] [ descriptor ] [ new name ] [ seo ] [ actions ]
- Row height: 36px standard (reduced from ~55px)
- Thumbnail: 28px inline

**New files:**
- `src/components/app/WorkspaceTable.tsx` — virtualizer, flat row model, column headers
- `src/components/app/WorkspaceGroupHeader.tsx` — collapsible group header row with export + DnD drop zone
- `src/components/app/WorkspaceTableRow.tsx` — compact 44px image row with all descriptor/AI/SEO/selection functionality

**Modified:** `src/app/app/page.tsx` — removed ImagesWithoutSKU + SKUProductGroup loop, added single `<WorkspaceTable />`

**Package added:** `@tanstack/react-virtual` v3

**Post-delivery micro-fixes (same session):**
- Row `pl-4` indent + matching column header alignment
- SEO column widened `w-14` → `w-24` to prevent badge/button overlap
- Remove `×` button `opacity-100 sm:opacity-0` — always visible on mobile (touch-safe)
- `.scrollbar-treez` branded 4px scrollbar (purple thumb, transparent track) in `globals.css`; applied to scroll container and `body`

---

### Phase 3 — Enhanced Selection UX ✅ COMPLETE
**Goal:** Google Drive-level selection interactions.

**Features:**
- **Shift+click** range select (most important)
- **Cmd/Ctrl+A** — select all, press again to clear
- **Escape** — clear selection

**Store additions:**
- `lastSelectedId: string | null` (shift-click anchor)
- `setLastSelectedId(id: string | null)`
- `selectImages(ids: string[])` — replaces selection with exact set

**Implementation location:**
- Range logic lives in `WorkspaceTable.tsx` (only place with flat row order)
- `WorkspaceTableRow` receives `onRowClick(id, shiftKey)` callback
- `WorkspaceTable` scroll container gets `tabIndex={0}` + `onKeyDown` for Ctrl+A / Escape

**Post-delivery bug fixes (same session):**
- `WorkspaceGroupHeader.tsx` `configuredCount` — now checks `customDescriptor?.trim()` before counting custom as configured
- `ExportControls.tsx` `readyImages` — same guard, aligns with store `isFilenameComplete` logic
- `Button.tsx` disabled state — replaced `hover:scale-100 hover:shadow-none` with `pointer-events-none`; hover animations fully dead when disabled

---

### Phase 4 — Batch Workflow Shortcuts 🔄 IN PROGRESS
**Goal:** Power user productivity layer.

**Features:**
- **Right-click context menu** — Select/Deselect, Apply descriptor to group, Assign SKU, Remove SKU, AI Analyze, Remove
- **"Apply descriptor to group"** — fills all unset images in the SKU group with the right-clicked image's descriptor
- **Assign to SKU submenu** — shows existing SKUs inline in the context menu

**New file:** `src/components/app/WorkspaceContextMenu.tsx` — portal-rendered, cursor-positioned menu

**Store additions:**
- `applyDescriptorToGroup(imageId: string)` — fills unset images in same SKU group

**Wire-up:**
- `WorkspaceTableRow` receives `onContextMenu(e, image, sku)` prop
- `WorkspaceTable` owns context menu state `{ x, y, image, sku } | null` and renders `<WorkspaceContextMenu>`

---

## Design Compliance (Treez Design System)

All components in this plan must follow `BUILD_WITH_TREEZ_DESIGN_SYSTEM.md`:

| Element | Spec |
|---|---|
| Group headers | `bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl` |
| Row hover | `hover:bg-white/5 transition-all duration-300` |
| Selected row | `bg-treez-purple/10 border-l-2 border-l-treez-purple` |
| Thumbnail | `object-cover rounded-md border border-white/10` |
| Status indicator | Green dot `bg-success`, Yellow `bg-yellow-400`, Gray `bg-gray-500` |
| Compact buttons | Tertiary ghost: `p-1.5 rounded-lg border border-white/10 hover:border-treez-purple` |
| Sticky header | `bg-deep-space/95 backdrop-blur-xl z-sticky` (z-40) |

---

## Success Criteria

| Criteria | Pass Condition |
|---|---|
| 100 images | No scroll lag, all groups visible within 2 scrolls |
| 1,000 images | Dev tools show <100 DOM rows rendered at any time (Phase 2) |
| Inbox collapsed | Viewport shows first SKU group without scrolling |
| Collapse All | One click puts all groups and inbox into summary rows |
| Shift-click | Clicking row 1 then shift+row 15 selects 15 rows (Phase 3) |
| Mobile | Compact rows still functional at 375px width |

---

## Out of Scope

- ❌ Column sorting / filtering (Phase future)
- ❌ Collaborative / multi-user cursors
- ❌ Inline image editing (crop, resize)
- ❌ Custom column visibility toggle
