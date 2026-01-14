---
name: match-design
description: Update any module to match gold standard design from Tasks (planform.md)
argument-hint: Module to update (e.g., clients, hr, finance, crm)
version: 1.1.0
risk: B
reviewer: design_systems
last_updated: 2026-01-14
---

# Match Module to Gold Standard Design

**Module:** `$ARGUMENTS.module`

---

## PHASE 1: VERIFY REQUIRED FILES EXIST

### Required Pages (3 minimum)
Search for these files in `src/features/$ARGUMENTS.module/`:

| Page Type | Expected File Pattern | Design Section |
|-----------|----------------------|----------------|
| **List Page** | `*-list-view.tsx` OR `*-list.tsx` | PAGE LAYOUT + Section 1-3 |
| **Detail Page** | `*-detail*.tsx` OR `*-details*.tsx` | Section 15: DETAIL VIEW |
| **Create/Edit Page** | `create-*.tsx` OR `*-form.tsx` OR `*-new.tsx` | Section 12: CREATE FORM |

### Required Components
| Component | Expected File | Design Section |
|-----------|---------------|----------------|
| **Sidebar** | `*-sidebar.tsx` | Section 4: QUICK ACTIONS |
| **Card/Item** | `*-card.tsx` OR `*-item.tsx` | Section 2: LIST ITEM CARD |
| **Hero** | Uses `ProductivityHero` | Section 11: HERO CARD |

### Report Missing Files
```
 FOUND: [filename]
 MISSING: [expected file] - MUST CREATE
```

---

## PHASE 2: VERIFY ROUTES & QUERY KEYS

### Check `src/constants/routes.ts`
```tsx
// Must have these routes for $ARGUMENTS.module:
ROUTES.dashboard.$ARGUMENTS.module.list      // List page
ROUTES.dashboard.$ARGUMENTS.module.detail(id) // Detail page
ROUTES.dashboard.$ARGUMENTS.module.new       // Create page
```

### Check `src/lib/query-keys.ts`
```tsx
// Must have these query keys:
QueryKeys.$ARGUMENTS.module.all
QueryKeys.$ARGUMENTS.module.list(params)
QueryKeys.$ARGUMENTS.module.detail(id)
```

### Report Status
```
 Routes defined: [list which exist]
 Routes missing: [list which need adding]
 Query keys defined: [list which exist]
 Query keys missing: [list which need adding]
```

---

## PHASE 3: VERIFY HOOKS

### Required Hooks in Module
| Hook | Purpose | Check |
|------|---------|-------|
| `use{Module}` or `use{Module}s` | Data fetching (list, detail, mutations) | / |
| `useKeyboardShortcuts` | Centralized keyboard shortcuts | / |

### Check Hook Implementation
Read the main hook file and verify:
- [ ] Uses `@tanstack/react-query`
- [ ] Uses `QueryKeys` from `@/lib/query-keys`
- [ ] Has `useList` / `useDetail` / `useCreate` / `useUpdate` / `useDelete`
- [ ] Uses `CACHE_TIMES` from `@/config/cache`

### Check Keyboard Shortcuts Integration
In sidebar file, verify:
```tsx
// MUST import and use centralized hook:
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

useKeyboardShortcuts({
    mode: 'list' | 'detail' | 'create',
    links: { create: ROUTES.dashboard.$ARGUMENTS.module.new, viewAll: ROUTES.dashboard.$ARGUMENTS.module.list },
    // ... callbacks
})
```

---

## PHASE 4: PAGE-BY-PAGE DESIGN MATCH

### 4A: LIST PAGE → Sections 1-3, 11 of planform.md

**File:** `{module}-list-view.tsx`

| Component | Gold Standard | Check |
|-----------|---------------|-------|
| Page layout | `grid-cols-1 lg:grid-cols-3 gap-8` | / |
| Hero card | `<ProductivityHero>` with 4 stats | / |
| Filter card | `rounded-[2rem]`, inputs `h-14` | / |
| Search input | `h-14`, icon `end-4`, loading spinner | / |
| Filter dropdowns | `GosiSelect`, `h-14`, `min-w-[220px]` | / |
| List items | `rounded-[2rem]`, `p-5`, hover states | / |
| Status badges | Correct colors per status | / |
| Empty state | Icon + message + CTA button | / |
| Load more | `GosiButton` full width | / |
| Sidebar present | `<{Module}Sidebar mode="list">` | / |

---

### 4B: DETAIL PAGE → Section 15 of planform.md

**File:** `{module}-detail-view.tsx` or `{module}-details-view.tsx`

| Component | Gold Standard | Check |
|-----------|---------------|-------|
| Page layout | Same 3-column grid | / |
| Back button | `← Back to list` link | / |
| Title + status badge | Header with entity name | / |
| Tabs | `Overview, Comments, Files, History` | / |
| Description card | `rounded-[2rem] p-6` | / |
| Compact info row | 4-column grid with icons | / |
| Section cards | Consistent `rounded-[2rem]` | / |
| Subtasks/related | Checkbox list if applicable | / |
| Comments section | Add comment form + list | / |
| Files section | Upload + file list | / |
| Delete dialog | `AlertDialog` with confirmation | / |
| Loading skeleton | Matches layout structure | / |
| Error state | Alert with retry button | / |
| Sidebar present | `<{Module}Sidebar mode="details" entityId={id}>` | / |

---

### 4C: CREATE/EDIT PAGE → Section 12 of planform.md

**File:** `create-{module}-view.tsx` or `{module}-form.tsx`

| Component | Gold Standard | Check |
|-----------|---------------|-------|
| Page layout | Same 3-column grid | / |
| Form container | `rounded-[2rem]` card | / |
| Mode toggle | Basic/Advanced tabs | / |
| Two-column fields | `grid-cols-1 md:grid-cols-2 gap-6` | / |
| Input heights | All inputs `h-14` | / |
| Labels | `text-sm font-medium text-slate-700` | / |
| Required indicator | Red asterisk | / |
| Textarea | `min-h-[120px]` | / |
| Date pickers | `GosiDatePicker` | / |
| Submit button | Full width, `h-14`, emerald | / |
| Form validation | Error messages below fields | / |
| Edit mode | Pre-fills data, changes button text | / |
| Sidebar present | `<{Module}Sidebar mode="create" onClearForm onSaveForm>` | / |

---

### 4D: SIDEBAR → Section 4 + 13 of planform.md

**File:** `{module}-sidebar.tsx`

#### Quick Actions Widget Structure
| Check | Gold Standard | Status |
|-------|---------------|--------|
| **Uses `useKeyboardShortcuts` hook** | MANDATORY - not custom implementation | / |
| Receives `mode` prop | `'list' \| 'create' \| 'details'` | / |
| Receives `entityId` prop | For detail view | / |
| **List view has tabs** | Main (أساسي) + Bulk (جماعي) | / |
| List Main buttons | View (V), Select (S), Delete (D), Archive (A) | / |
| List Bulk buttons | Select All (L), Complete (C), Delete (D), Archive (A) | / |
| **Detail view NO tabs** | 4 buttons directly | / |
| Detail buttons | Complete, Edit, Delete, View All | / |
| **Create view NO tabs** | 4 buttons directly | / |
| Create buttons | Create, Clear, Cancel, Save | / |

#### Quick Actions Styling (CRITICAL)
| Check | Gold Standard | Status |
|-------|---------------|--------|
| Container | `bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950` | / |
| Container border | `ring-1 ring-white/10` | / |
| Container radius | `rounded-[2rem]` | / |
| Container padding | `p-5` | / |
| Tab buttons container | `bg-white/5 rounded-2xl p-1.5` | / |
| Active tab | `bg-emerald-500 text-white` | / |
| Inactive tab | `text-slate-400 hover:text-white` | / |
| Action buttons layout | `grid grid-cols-2 gap-3 mt-5` | / |
| Action button | `rounded-3xl py-6 border-0` | / |
| Keyboard badge | `kbd` style with `bg-white/20 text-white/90 px-2 py-0.5 rounded-md text-xs font-mono` | / |

#### Calendar & Notifications Widget (Below Quick Actions)
| Check | Gold Standard | Status |
|-------|---------------|--------|
| Widget container | `bg-white rounded-[2rem] ring-1 ring-black/5 shadow-sm p-5 mt-6` | / |
| Tab buttons | التقويم (Calendar) + التنبيهات (Notifications) | / |
| Tab container | `bg-slate-100 rounded-xl p-1` | / |
| Active calendar tab | `bg-white shadow-sm text-emerald-700` | / |
| Day strip | Horizontal scroll with 5 days visible | / |
| Current day highlight | `bg-emerald-500 text-white` | / |
| Uses `useCalendar` hook | For date selection state | / |
| Uses `useUpcomingReminders` hook | For notifications data | / |
| Empty state icon | Calendar or Bell icon with message | / |

#### Keyboard Shortcuts Reference
| Shortcut | Action | View |
|----------|--------|------|
| V | View/Navigate to list | List Main |
| S | Toggle selection mode | List Main |
| D | Delete selected | List Main/Bulk |
| A | Archive selected | List Main/Bulk |
| L | Select all | List Bulk |
| C | Complete selected | List Bulk |

---

## PHASE 5: GENERATE CHANGE LIST

Based on all checks above, create prioritized TODO list:

### Critical (Must Fix)
- [ ] Missing pages that need to be created
- [ ] Keyboard shortcuts not using centralized hook
- [ ] Wrong Quick Actions buttons for view mode

### High Priority
- [ ] Layout doesn't match grid structure
- [ ] Missing sidebar in pages
- [ ] Wrong component styling

### Medium Priority
- [ ] Spacing/sizing differences
- [ ] Missing states (loading, error, empty)
- [ ] Missing features (tabs, dialogs)

### Low Priority
- [ ] Minor styling tweaks
- [ ] Animation differences

---

## PHASE 6: APPLY CHANGES

After user confirms, apply changes in this order:

1. **Create missing files** (copy structure from Tasks)
2. **Add routes and query keys** if missing
3. **Update sidebar** to use `useKeyboardShortcuts`
4. **Fix Quick Actions** per view mode
5. **Update page layouts** to match grid
6. **Fix component styling** to match specs
7. **Add missing states** (loading, error, empty)

---

## PHASE 7: VERIFY

```bash
# 1. Build check
npm run build

# 2. Navigate to each page and verify:
# - /$ARGUMENTS.module (list)
# - /$ARGUMENTS.module/:id (detail)
# - /$ARGUMENTS.module/new (create)

# 3. Test keyboard shortcuts on each page
# 4. Test Arabic (RTL)
# 5. Test English (LTR)
# 6. Check console for errors
```

Run `/design-review` for full UI audit.

---

## REFERENCE: Page → Design Section Mapping

| Page Type | planform.md Sections |
|-----------|---------------------|
| List Page | PAGE LAYOUT, 1 (Filter), 2 (Card), 3 (States), 11 (Hero) |
| Detail Page | PAGE LAYOUT, 15 (Detail View) |
| Create Page | PAGE LAYOUT, 12 (Create Form) |
| Sidebar | 4 (Quick Actions), 13 (Keyboard Shortcuts) |
| All Pages | 4 (Sidebar), 5 (Calendar Widget) |
