# Plan 10: Everyday Mode + Auto-Descriptor Strategies

**Status:** 📋 PLANNED  
**Phase:** Sprint 5 continuation of Plan 08  
**Created:** April 18, 2026  
**Goal:** Expand Renamerly's audience beyond e-commerce professionals to event photographers, parents, and everyday users — while preserving the niche, professional feel for e-commerce users. Simultaneously solve the bulk descriptor efficiency problem so 1000 images can be fully configured in minutes.

---

## Problem Statement

### Audience Gap
The current UI speaks exclusively to e-commerce professionals. Labels like "SKU", "Descriptor", and groupings like "SKU Group" are meaningful to a Shopify seller but alienating to:
- Event / wedding photographers organizing shoots by event name
- Parents archiving family photos by occasion
- Real estate photographers grouping shots by property
- Anyone digitizing a physical photo collection

These users need the exact same core feature (group → name → export) but with vocabulary and defaults that make sense for their context.

### Bulk Efficiency Gap
Currently:
- SKU assignment → can be bulk-applied to N selected images in one action ✅
- Descriptor assignment → must be set image-by-image because of the uniqueness constraint ❌

The uniqueness constraint (every image in a group needs a distinct descriptor) makes bulk assignment of a *single value* impossible. The solution is bulk assignment of a **strategy** that auto-generates unique values — but this UX doesn't exist yet.

---

## Architecture Decisions (Locked)

| Decision | Choice | Rationale |
|---|---|---|
| Mode implementation | **Everyday as a platform preset**, not a separate app mode | Data model stays identical; only labels and defaults change. Zero data migration risk. |
| Label system | **`vocabulary` property on `PlatformPreset`** | Components read from active preset's vocabulary. Isolated — no conditional props through the whole tree. |
| Datetime source | **`File.lastModified`** (no EXIF library) | Zero dependency. Works for all uploaded files. Human-readable formatting applied at use-time. |
| Datetime format | **`jul-15-2024-2-43pm`** | Valid filename characters, legible, meaningful, typically unique within a session |
| Strategy engine | **New `lib/descriptorStrategies.ts`** | Extracts and generalises existing iteration logic. Single source of truth. |
| Collision handling | **Append `-2`, `-3` suffix** on collision | Silent, automatic, never fails |
| Free vs Pro | **Everyday preset: Free** | Lowers barrier to entry for new audience segment. Drives top-of-funnel growth. |

---

## The Everyday Preset

### What It Is
A new platform preset (`id: 'everyday'`) aimed at non-eCommerce users. Internally uses the same `sku` + `descriptor` fields but:
- Renames "SKU" → **"Collection"** throughout the UI
- Renames "Descriptor" → **"Date & Time"** (label only; field still called `descriptor` internally)
- Default auto-fill strategy: **Datetime** (instead of manual selection)
- Format produces clean, human-readable filenames

### Filename Format
```
{collection}-{datetime}{extension}
```

**Examples:**
```
beach-trip-2024-jul-15-2-43pm.jpg
lake-house-2024-aug-03-11-05am.jpg
birthday-party-2024-dec-25-6-30pm.jpg
```

**Rationale for `2024-jul-15` ordering:** ISO-ish ordering (year first) means files sort chronologically in any file explorer. Month abbreviation stays human-readable. Time in 12h format with am/pm is more natural than 24h for non-technical users.

### Vocabulary Map
```ts
vocabulary: {
  sku:         'Collection',
  descriptor:  'Date & Time',
  group:       'Collection',
  groupHeader: 'Collection Group',
  changeSku:   'Change Collection',
  assignSku:   'Assign Collection',
  noSku:       'Assign to a Collection',
}
```

These strings replace corresponding UI copy when the Everyday preset is active.

### Preset Tier
**Free** — lower entry barrier for new audience segment.

---

## Descriptor Strategy Engine

### New File: `src/lib/descriptorStrategies.ts`

Replaces the inline `ITERATION_PRESETS` constant with a full strategy system.

```ts
export type StrategyId =
  | 'num-2' | 'num-3' | 'num-4'          // sequential numbers (migrated from ITERATION_PRESETS)
  | 'alpha-upper' | 'alpha-lower'          // sequential letters (migrated)
  | 'datetime'                             // NEW: jul-15-2024-2-43pm from file.lastModified
  | 'date-only'                            // NEW: jul-15-2024 (less precise, simpler)

export interface DescriptorStrategy {
  id: StrategyId
  label: string
  description: string
  applicableTo: 'ecommerce' | 'everyday' | 'both'  // controls which presets show which strategies
  compute: (image: AssetImage, indexInGroup: number) => string
}
```

### Datetime Formatting Logic
```
File.lastModified  →  epoch ms
new Date(ms)       →  Date object

Format: {year}-{mon}-{day}-{h}-{mm}{ampm}
  year  = 4-digit year
  mon   = 3-letter month lowercase (jan, feb … dec)
  day   = day without leading zero
  h     = hour without leading zero (12h)
  mm    = minutes with leading zero
  ampm  = 'am' | 'pm'

Example: 2024-jul-15-2-43pm
```
All characters are `[a-z0-9-]` → passes `sanitizeString` unchanged.

### Collision Handling
When `applyDescriptorStrategy` is called, after computing all values for the group, detect duplicates and append `-2`, `-3` etc. before writing to store.

---

## New Store Action

### `applyDescriptorStrategy(imageIds: string[], strategy: StrategyId)`

```
For each unique SKU group represented in imageIds:
  1. Get ALL images in that group (for position index in sequential strategies)
  2. Filter to only imageIds within that group
  3. Compute descriptor for each using strategy.compute(image, indexInGroup)
  4. Detect collisions within the group (including images NOT in selection)
  5. Resolve collisions by appending -2, -3
  6. Write to store: descriptor = 'custom', customDescriptor = computed value
```

**Why include images outside the selection for collision detection?**
If an image already has `customDescriptor: 'jul-15-2024-2-43pm'`, and a newly processed image would get the same value, we must detect that and suffix the new one.

---

## UI Changes

### Phase 1 — Vocabulary System in `platformPresets.ts`

Add `vocabulary` field to `PlatformPreset` interface. eCommerce presets omit it (defaults apply). Everyday preset populates it fully.

Add helper:
```ts
export function getVocabulary(preset: PlatformPreset | null): PresetVocabulary
```
Returns preset vocabulary or defaults (`SKU`, `Descriptor`, etc.).

---

### Phase 2 — "Everyday Photos" Preset in `platformPresets.ts`

New entry in `PLATFORM_PRESETS`:
```ts
{
  id: 'everyday',
  label: 'Everyday Photos',
  description: 'Collection · date and time',
  example: 'beach-trip-2024-jul-15-2-43pm.jpg',
  proOnly: false,
  vocabulary: { ... },
  format: ({ sku, descriptor, extension }) =>
    descriptor ? `${sku}-${descriptor}${extension}` : '',
}
```

The format function is identical to Generic — the uniqueness comes from the datetime descriptor value, not a special format template.

Update `FREE_PRESET_IDS` to include `'everyday'`.
Update `PlatformPresetId` union type.

---

### Phase 3 — Descriptor Strategy Engine (`lib/descriptorStrategies.ts`)

- Define all strategies (sequential migrated, datetime new)
- Export `DESCRIPTOR_STRATEGIES` array
- Export `getStrategiesForPreset(preset)` — filters to `applicableTo` match
- Export `computeDescriptor(strategy, image, index)` utility

---

### Phase 4 — Store Action (`useAssetStore.ts`)

- Add `applyDescriptorStrategy(imageIds: string[], strategy: StrategyId): void`
- Remove inline `ITERATION_PRESETS` logic from `setImageDescriptor` (migrate to use `applyDescriptorStrategy`)

---

### Phase 5 — Group Header Auto-fill Button (`WorkspaceGroupHeader.tsx`)

New button: **"Auto-fill"** (or "Fill Descriptors") next to Export.

```
[123-Beach-Trip]  6 ▸  ━━━━━  2/6   [Auto-fill ▾]  [Export]
```

- Dropdown lists strategies filtered by `getStrategiesForPreset(activePreset)`
- For eCommerce presets: Numbers (01 02), Numbers (001 002), Letters (A B), Letters (a b)
- For Everyday preset: **Date & Time** (top, default), Date Only, Numbers
- Clicking a strategy calls `applyDescriptorStrategy(allImageIdsInGroup, strategy)`
- Only fills UNASSIGNED images (has no `descriptor` set) by default
- A secondary option: "Re-fill all" (overwrites existing) — shown as a toggle or separate item

**Copy adapts to vocabulary:**
- eCommerce: "Auto-fill Descriptors"
- Everyday: "Fill Date & Time"

---

### Phase 6 — SelectionActionBar Bulk Descriptor Action

New button in the action bar: **"Descriptors"** (icon: `Tag` or `Hash`).

- Opens a strategy picker (bottom sheet on mobile, dropdown on desktop)
- Applies `applyDescriptorStrategy(selectedImageIds, chosenStrategy)`
- Respects per-group uniqueness (the store action handles this)
- Shows toast: "Descriptors applied to 12 images"

---

### Phase 7 — Vocabulary-Aware Copy in Components

Components that display "SKU" or "Descriptor" copy need to read from `getVocabulary(activePreset)`:

| Component | Text to update |
|---|---|
| `WorkspaceGroupHeader` | Group label, "assign SKU" placeholder |
| `WorkspaceTableRow` | "needs SKU" hint, descriptor column label |
| `SelectionActionBar` | "Assign SKU" / "Change SKU" button label |
| `WorkspaceTable` | Column header: "Descriptor" |
| Platform preset picker (wherever it lives) | Description copy under each preset |

This does NOT change internal field names, store keys, or URL params — only display strings.

---

### Phase 8 — Platform Preset Picker Copy Refresh

Reorganise the preset picker (wherever it lives) into two groups:

```
─── For Everyday Use ────────────────────
  📷 Everyday Photos      Free
     collection-date-time

─── For E-Commerce ──────────────────────
  🏷  Generic             Free     ← rename description: "SKU · descriptor"
  📦  Amazon              Free
  🛒  Shopify             Pro
  🏪  Etsy                Pro
  🛍  WooCommerce         Pro
  📅  Dated               Free
```

This is a copy/grouping change only — no functional change.

---

## Sprint Task List

### Phase 1 — Foundation (1 session)
- [ ] Add `vocabulary` to `PlatformPreset` interface + `PresetVocabulary` type + `getVocabulary()` helper
- [ ] Add `everyday` to `PlatformPresetId` union + `PLATFORM_PRESETS` array + `FREE_PRESET_IDS`
- [ ] Create `src/lib/descriptorStrategies.ts` with all strategies (sequential migrated + datetime new)
- [ ] Add `applyDescriptorStrategy` to `useAssetStore.ts`
- [ ] Migrate `setImageDescriptor`'s iteration preset branch to use `applyDescriptorStrategy`

### Phase 2 — Group Header Auto-fill (1 session)
- [ ] Add "Auto-fill" button + strategy dropdown to `WorkspaceGroupHeader`
- [ ] Wire to `applyDescriptorStrategy` for entire group's unassigned images
- [ ] Adapt button copy to active preset vocabulary

### Phase 3 — SelectionActionBar Descriptor Action (0.5 session)
- [ ] Add "Descriptors" button to `SelectionActionBar` normal mode
- [ ] Open strategy picker (reuse same dropdown component from Phase 2)
- [ ] Wire to `applyDescriptorStrategy` for selected images

### Phase 4 — Vocabulary-Aware Copy (0.5 session)
- [ ] Thread `getVocabulary(activePreset)` into `WorkspaceGroupHeader`, `WorkspaceTableRow`, `SelectionActionBar`, `WorkspaceTable` column header
- [ ] Update platform preset picker grouping and copy

### Phase 5 — QA & Edge Cases (0.5 session)
- [ ] Test collision handling (two images with identical lastModified — rare but possible in batch imports)
- [ ] Test "Re-fill all" overwrites correctly
- [ ] Test cross-group selection (images from multiple groups in one bulk action)
- [ ] Verify `getStrategiesForPreset` returns correct subset per preset

---

## File Map

| File | Change Type | Notes |
|---|---|---|
| `src/lib/platformPresets.ts` | **Modify** | Add `vocabulary`, `everyday` preset, `getVocabulary()` |
| `src/lib/descriptorStrategies.ts` | **New** | Full strategy engine |
| `src/lib/constants.ts` | **Modify** | Remove `ITERATION_PRESETS` (migrated to descriptorStrategies) |
| `src/stores/useAssetStore.ts` | **Modify** | Add `applyDescriptorStrategy`, update `setImageDescriptor` |
| `src/components/app/WorkspaceGroupHeader.tsx` | **Modify** | Auto-fill button + vocabulary copy |
| `src/components/app/SelectionActionBar.tsx` | **Modify** | Descriptor action button |
| `src/components/app/WorkspaceTableRow.tsx` | **Modify** | Vocabulary-aware copy |
| `src/components/app/WorkspaceTable.tsx` | **Modify** | Column header vocab |

---

## What This Unlocks

### For E-Commerce Users (unchanged workflow)
Everything works identically. The only visible change: their platform preset picker has a new section at the top they can ignore.

### For Everyday Users (new workflow)
1. Drop 500 vacation photos
2. Type "beach-trip-2024" as the Collection name
3. Click **"Fill Date & Time"** in the group header
4. Every photo gets `beach-trip-2024-{unique-datetime}.jpg` automatically
5. Download ZIP

**Time to complete 500 photos: ~60 seconds.** (Upload + type name + one click + download)

### Future Extensions (out of scope for now)
- EXIF metadata parsing for actual capture time (more accurate than `lastModified`)
- AI bulk descriptor strategy (semantic labels per image — already partially built)
- "Everyday" mode remembers last used strategy per collection
