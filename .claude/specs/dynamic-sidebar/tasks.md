# Dynamic Sidebar - Implementation Tasks

## Phase Summary
| Phase | Goal | Tasks | Status |
|-------|------|-------|--------|
| 1 | Data Layer | 5 | Not Started |
| 2 | Core Hooks | 3 | Not Started |
| 3 | UI Components | 2 | Not Started |
| 4 | Polish | 2 | Not Started |

**Total**: 12 tasks across 4 phases

---

## Phase 1: Data Layer
**Goal**: Types, constants, services, query keys working
**Verify**: Can call API and see response in console

### Task 1.1: Create Sidebar Types
**File**: `src/types/sidebar.ts` (NEW)
**Details**:
- Define `FirmType = 'solo' | 'small' | 'large'`
- Define `SidebarItem` interface (from API contract)
- Define `SidebarModule` interface
- Define `SidebarConfig` interface
- Define `RecentItem` interface
- Match backend API response structure exactly
**Status**: [x] Complete

### Task 1.2: Add Sidebar Query Keys
**File**: `src/lib/query-keys.ts` (MODIFY)
**Details**:
- Add `sidebar` section to QueryKeys factory
- Add `sidebar.all()` and `sidebar.config()` keys
**Status**: [x] Complete

### Task 1.3: Create Sidebar Service
**File**: `src/services/sidebarService.ts` (NEW)
**Details**:
- Create `getSidebarConfig()` function
- Call `GET /api/sidebar/config`
- Return typed `SidebarConfig` response
- Handle error gracefully (return null, let hook handle fallback)
**Status**: [x] Complete

### Task 1.4: Create Sidebar Defaults
**File**: `src/constants/sidebar-defaults.ts` (NEW)
**Details**:
- Define `MODULE_TIERS` mapping (which modules for which tier)
- Define `SIDEBAR_DEFAULTS` fallback config
- Export `isModuleVisibleForTier()` utility function
- Define Basic items (7): Overview, Calendar, Appointments, Tasks, Cases, Contacts, Reports
- Define Footer items: Settings, Help
**Status**: [x] Complete

### Task 1.5: Create Recents Tracker Utility
**File**: `src/lib/recents-tracker.ts` (NEW)
**Details**:
- Create `RecentsTracker` class with useSyncExternalStore pattern
- Implement `getSnapshot()`, `getServerSnapshot()`, `subscribe()`
- Implement `trackVisit()` with localStorage persistence
- Max 5 items, deduplication by path
- Handle localStorage unavailable gracefully
**Status**: [ ] Not Started

---

## Phase 2: Core Hooks
**Goal**: All hooks working and returning correct data
**Verify**: Console.log shows correct firm type, config, recents

### Task 2.1: Create useSidebarConfig Hook
**File**: `src/hooks/use-sidebar-config.ts` (NEW)
**Details**:
- Use React Query with `QueryKeys.sidebar.config()`
- Set `staleTime: CACHE_TIMES.MEDIUM` (5 min)
- Set `placeholderData: SIDEBAR_DEFAULTS`
- Set `retry: 1` (fail fast to fallback)
- Return query result
**Status**: [ ] Not Started

### Task 2.2: Create useRecents Hook
**File**: `src/hooks/use-recents.ts` (NEW)
**Details**:
- Use `useSyncExternalStore` with `recentsTracker`
- Export `recents` array and `trackVisit` callback
- Memoize `trackVisit` with useCallback
**Status**: [ ] Not Started

### Task 2.3: Update useSidebarData Hook
**File**: `src/hooks/use-sidebar-data.ts` (MODIFY)
**Details**:
- Import and use `useSidebarConfig()`
- Derive `firmType` from user data (inline, no separate hook needed)
- Filter modules based on `firmType` and API config
- Structure return value with sections: basic, recents, modules, footer
- Keep existing permission filtering logic
- Use translated labels from API or existing t() keys
**Status**: [ ] Not Started

---

## Phase 3: UI Components
**Goal**: Sidebar renders with 4 sections correctly
**Verify**: Visual inspection shows Basic/Recents/Modules/Footer layout

### Task 3.1: Update AppSidebar Component
**File**: `src/components/layout/app-sidebar.tsx` (MODIFY)
**Details**:
- Render Basic section (NavGroup without collapse)
- Render Recents section (conditional, only if recents.length > 0)
- Render Modules section (collapsible NavGroups)
- Render Footer section in SidebarFooter (Settings/Help icons)
- Use existing NavGroup component for module groups
- Pass recents to sidebar for tracking
**Status**: [ ] Not Started

### Task 3.2: Add Recents Tracking to Navigation
**File**: `src/components/layout/nav-group.tsx` (MODIFY)
**Details**:
- Import `useRecents` hook
- Call `trackVisit()` when nav item is clicked
- Extract item data (id, title, path, icon) for tracking
- Only track items that are in sidebar (not external links)
**Status**: [ ] Not Started

---

## Phase 4: Polish
**Goal**: Production ready, RTL works, no errors
**Verify**: Build passes, RTL/LTR screenshots look correct

### Task 4.1: Add/Verify Translation Keys
**Files**: `src/locales/en.json`, `src/locales/ar.json` (MODIFY)
**Details**:
- Verify existing `sidebar.nav.*` keys cover Basic items
- Add `sidebar.sections.basic`, `sidebar.sections.recents`, `sidebar.sections.modules`
- Verify module group translation keys exist
- Add any missing Arabic translations
**Status**: [ ] Not Started

### Task 4.2: Build Verification & Testing
**Run**: `npm run build`
**Details**:
- Verify no TypeScript errors
- Self-review with `git diff`
- Manual testing:
  - [ ] Solo user sees correct modules
  - [ ] Recents populate on navigation
  - [ ] Collapse state persists
  - [ ] RTL layout correct
  - [ ] LTR layout correct
  - [ ] No console errors
**Status**: [ ] Not Started

---

## Completion Criteria

### Must Pass
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Sidebar API called on load (check Network tab)
- [ ] Firm type derived correctly from user

### Feature Verification
- [ ] Basic section (7 items) always visible
- [ ] Recents section shows last 5 visited pages
- [ ] Modules filtered by firm type (solo/small/large)
- [ ] Footer shows Settings + Help
- [ ] Collapse state persists in localStorage

### RTL/LTR
- [ ] Arabic sidebar flips correctly
- [ ] Text aligned properly in both directions
- [ ] Icons positioned correctly

---

## Files Checklist

### New Files (6)
- [ ] `src/types/sidebar.ts`
- [ ] `src/services/sidebarService.ts`
- [ ] `src/constants/sidebar-defaults.ts`
- [ ] `src/lib/recents-tracker.ts`
- [ ] `src/hooks/use-sidebar-config.ts`
- [ ] `src/hooks/use-recents.ts`

### Modified Files (4)
- [ ] `src/lib/query-keys.ts`
- [ ] `src/hooks/use-sidebar-data.ts`
- [ ] `src/components/layout/app-sidebar.tsx`
- [ ] `src/components/layout/nav-group.tsx`

### Translation Files (2)
- [ ] `src/locales/en.json` (verify/update)
- [ ] `src/locales/ar.json` (verify/update)
