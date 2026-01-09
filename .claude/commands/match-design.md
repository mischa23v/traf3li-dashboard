---
name: match-design
description: Update any module to match gold standard design from Tasks (planform.md)
arguments:
  - name: module
    description: Module to update (e.g., clients, hr, finance, crm)
    required: true
---

# Match Module to Gold Standard Design

**Module:** `$ARGUMENTS.module`

---

## STEP 1: Load Gold Standard

Read the complete design specifications:
- `.claude/commands/planform.md` (ALL sections)
- `src/hooks/useKeyboardShortcuts.ts` (centralized shortcuts)

---

## STEP 2: Scan Current Module Implementation

Find and read ALL files for `$ARGUMENTS.module`:

```
src/features/$ARGUMENTS.module/
├── components/
│   ├── {module}-sidebar.tsx       → Compare to Section 4 (Quick Actions)
│   ├── {module}-list-view.tsx     → Compare to PAGE LAYOUT + Section 2
│   ├── {module}-details-view.tsx  → Compare to Section 15 (Detail View)
│   └── create-{module}-view.tsx   → Compare to Section 12 (Create Form)
├── pages/
└── hooks/
```

Also check:
- `src/constants/routes.ts` → Module routes exist?
- `src/lib/query-keys.ts` → Query keys defined?

---

## STEP 3: Generate Comparison Report

Create a checklist showing CURRENT vs GOLD STANDARD:

### Page Layout
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| Grid layout | ? | `grid-cols-1 lg:grid-cols-3 gap-8` | ✅/❌ |
| Main bg | ? | `bg-[#f8f9fa] rounded-tr-3xl` | ✅/❌ |
| Content col | ? | `lg:col-span-2 space-y-6` | ✅/❌ |
| Sidebar col | ? | `lg:col-span-1 space-y-8` | ✅/❌ |

### Filter Card (Section 1)
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| Border radius | ? | `rounded-[2rem]` | ✅/❌ |
| Search input height | ? | `h-14` | ✅/❌ |
| Filter button height | ? | `h-14` | ✅/❌ |
| GosiSelect height | ? | `h-14` | ✅/❌ |

### List Item Card (Section 2)
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| Border radius | ? | `rounded-[2rem]` | ✅/❌ |
| Padding | ? | `p-5` | ✅/❌ |
| Hover state | ? | `hover:shadow-lg hover:shadow-emerald-100` | ✅/❌ |
| Status badge | ? | Correct colors per status | ✅/❌ |

### Quick Actions Sidebar (Section 4)
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| List view tabs | ? | Main (أساسي) + Bulk (جماعي) | ✅/❌ |
| Detail view | ? | Complete, Edit, Delete, View All (NO tabs) | ✅/❌ |
| Create view | ? | Create, Clear, Cancel, Save (NO tabs) | ✅/❌ |
| Widget bg | ? | `bg-gradient-to-br from-emerald-900 to-slate-900` | ✅/❌ |

### Keyboard Shortcuts (Section 13)
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| Uses centralized hook | ? | `useKeyboardShortcuts` from `@/hooks` | ✅/❌ |
| List shortcuts | ? | N, S, D, A, C, L, V | ✅/❌ |
| Detail shortcuts | ? | C, E, D, V | ✅/❌ |
| Create shortcuts | ? | N, C, D, S | ✅/❌ |

### Hero Card (Section 11)
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| Uses ProductivityHero | ? | Yes with module-specific stats | ✅/❌ |
| 4 stat cards | ? | Total, Completed, Pending, Overdue | ✅/❌ |

### Detail View (Section 15)
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| Tabs | ? | Overview, Comments, Files, History | ✅/❌ |
| Description card | ? | `rounded-[2rem] p-6` | ✅/❌ |
| Compact info row | ? | 4-column grid | ✅/❌ |
| Section cards | ? | Consistent styling | ✅/❌ |
| Delete dialog | ? | AlertDialog with confirmation | ✅/❌ |

### Create/Edit Form (Section 12)
| Check | Current | Gold Standard | Status |
|-------|---------|---------------|--------|
| Mode toggle | ? | Basic/Advanced tabs | ✅/❌ |
| Two-column layout | ? | `grid-cols-1 md:grid-cols-2 gap-6` | ✅/❌ |
| Field heights | ? | `h-14` for inputs | ✅/❌ |
| Submit button | ? | Full width, `h-14` | ✅/❌ |

---

## STEP 4: List Required Changes

Based on the comparison, list ALL changes needed:

### Files to Modify:
1. `src/features/$ARGUMENTS.module/components/{module}-sidebar.tsx`
   - [ ] Change: ...

2. `src/features/$ARGUMENTS.module/components/{module}-list-view.tsx`
   - [ ] Change: ...

3. ... (continue for all files)

### New Files Needed:
- [ ] ...

### Imports to Add:
```tsx
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS, KBD_COLORS } from '@/hooks/useKeyboardShortcuts'
```

---

## STEP 5: Apply Changes

After user confirms, apply all changes:

1. Update sidebar to use `useKeyboardShortcuts` hook
2. Update Quick Actions buttons per view mode
3. Fix all spacing/sizing to match gold standard
4. Add missing components (tabs, dialogs, etc.)
5. Ensure RTL compatibility

---

## STEP 6: Verify

After applying changes:

```bash
# Build check
npm run build

# Visual verification
# Navigate to /$ARGUMENTS.module pages and check:
# - List view
# - Detail view
# - Create/Edit view
# - Test Arabic (RTL)
# - Test English (LTR)
# - Test keyboard shortcuts
```

Run `/design-review` for comprehensive UI audit.

---

## Quick Reference: Key Files

| Gold Standard | Location |
|---------------|----------|
| Design Specs | `.claude/commands/planform.md` |
| Keyboard Hook | `src/hooks/useKeyboardShortcuts.ts` |
| Routes | `src/constants/routes.ts` |
| Query Keys | `src/lib/query-keys.ts` |
| Tasks Reference | `src/features/tasks/` |
