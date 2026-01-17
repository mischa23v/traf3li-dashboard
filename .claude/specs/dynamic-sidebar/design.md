# Dynamic Sidebar - Technical Design

## Overview
Transform the static sidebar into a dynamic, API-driven navigation system with four sections: **Basic** (always visible core items), **Recents** (auto-tracked), **Modules** (collapsible, firm-tier filtered), and **Footer** (Settings/Help). Configuration comes from backend API with local fallback.

## Impact Summary

| Type | Count | Risk |
|------|-------|------|
| New files | 5 | Low |
| Modified files | 5 | Medium |
| Total tasks | 10 | - |

---

## Architecture

### Component Hierarchy
```
AppSidebar (modified)
 SidebarHeader
    TeamSwitcher
 SidebarContent
    SidebarBasicNav (new section)
       NavItem × 7 (Overview, Calendar, Appointments, Tasks, Cases, Contacts, Reports)
    SidebarRecents (new section)
       RecentItem × 5 (dynamic from localStorage)
    SidebarModules (new section)
        CollapsibleNavGroup × N (filtered by firmType)
 SidebarFooter
    FooterNav (Settings, Help icons)
 SidebarRail
```

### Data Flow
```
User Login
    ↓
useAuthStore (firmId, isSoloLawyer)
    ↓
useSidebarConfig() → GET /api/sidebar/config
    ↓                         ↓ (fallback)
[API Response]          [Default Config]
    ↓
useFirmType() → Derives: 'solo' | 'small' | 'large'
    ↓
useSidebarData() → Filters modules by firmType
    ↓
useRecents() → Reads/writes localStorage
    ↓
AppSidebar renders 4 sections
```

### Firm Type Derivation Logic
```typescript
function deriveFirmType(user: User): FirmSize {
  // Solo lawyer (no firm)
  if (user.isSoloLawyer || !user.firmId) {
    return 'solo'
  }

  // Check firm plan from tenant/subscription
  const plan = user.tenant?.subscription?.plan || user.plan

  if (plan === 'enterprise') return 'large'
  if (plan === 'professional') return 'small'

  // Default based on employee count (if available from API)
  // For now, default to 'small' for any firm
  return 'small'
}
```

---

## Data Models

### TypeScript Interfaces

```typescript
// src/types/sidebar.ts

/**
 * Firm size tiers for sidebar filtering
 */
export type FirmSize = 'solo' | 'small' | 'large'

/**
 * Sidebar item (leaf node)
 */
export interface SidebarNavItem {
  id: string
  title: string           // Translation key
  url: string
  icon?: string           // Lucide icon name
  badge?: string | number
  module?: ModuleKey      // For permission checking
}

/**
 * Sidebar module (collapsible group)
 */
export interface SidebarModule {
  id: string
  title: string           // Translation key
  icon: string
  firmTiers: FirmSize[]   // Which tiers can see this module
  defaultExpanded?: boolean
  items: SidebarNavItem[]
}

/**
 * Recent page item
 */
export interface RecentItem {
  id: string
  title: string           // Display title (translated)
  path: string
  icon: string
  visitedAt: number       // Timestamp
}

/**
 * Sidebar configuration from API
 */
export interface SidebarConfig {
  firmType: FirmSize
  sections: {
    basic: SidebarNavItem[]
    modules: SidebarModule[]
    footer: SidebarNavItem[]
  }
}

/**
 * API Response wrapper
 */
export interface SidebarConfigResponse {
  success: boolean
  data: SidebarConfig
}
```

---

## API Endpoints

| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/api/sidebar/config` | Get sidebar config for user | 5 min |

### API Contract

**Request:**
```http
GET /api/sidebar/config
Authorization: Bearer {token}
Accept-Language: en | ar
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "firmType": "small",
    "sections": {
      "basic": [...],
      "modules": [...],
      "footer": [...]
    }
  }
}
```

**Fallback Strategy:**
If API fails, use local defaults from `src/constants/sidebar-defaults.ts`

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SidebarBasicNav` | `src/components/layout/sidebar-basic-nav.tsx` | Always-visible core nav items |
| `SidebarRecents` | `src/components/layout/sidebar-recents.tsx` | Recently visited pages |
| `SidebarModules` | `src/components/layout/sidebar-modules.tsx` | Collapsible module groups |
| `SidebarFooterNav` | `src/components/layout/sidebar-footer-nav.tsx` | Settings/Help in footer |

### Existing Components to Modify

| Component | File | Changes |
|-----------|------|---------|
| `AppSidebar` | `src/components/layout/app-sidebar.tsx` | Add 4-section layout |
| `NavGroup` | `src/components/layout/nav-group.tsx` | Add collapse persistence |

---

## Hooks

| Hook | File | Purpose | Dependencies |
|------|------|---------|--------------|
| `useSidebarConfig` | `src/hooks/use-sidebar-config.ts` | Fetch config from API | React Query |
| `useRecents` | `src/hooks/use-recents.ts` | Track recent pages | localStorage |
| `useFirmType` | `src/hooks/use-firm-type.ts` | Derive firm size | useAuthStore |
| `useSidebarData` | `src/hooks/use-sidebar-data.ts` | Combine all (modified) | All above |

### Hook Implementations

#### useSidebarConfig
```typescript
// src/hooks/use-sidebar-config.ts
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/lib/query-keys'
import { CACHE_TIMES } from '@/config/cache'
import { getSidebarConfig } from '@/services/sidebarService'
import { SIDEBAR_DEFAULTS } from '@/constants/sidebar-defaults'

export function useSidebarConfig() {
  return useQuery({
    queryKey: QueryKeys.sidebar.config(),
    queryFn: getSidebarConfig,
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.GC_MEDIUM,
    placeholderData: SIDEBAR_DEFAULTS,
    retry: 1,
  })
}
```

#### useRecents
```typescript
// src/hooks/use-recents.ts
import { useCallback, useSyncExternalStore } from 'react'
import { recentsTracker } from '@/lib/recents-tracker'

export function useRecents() {
  const recents = useSyncExternalStore(
    recentsTracker.subscribe,
    recentsTracker.getSnapshot,
    recentsTracker.getServerSnapshot
  )

  const trackVisit = useCallback((item: { id: string; title: string; path: string; icon: string }) => {
    recentsTracker.trackVisit(item)
  }, [])

  return { recents, trackVisit }
}
```

#### useFirmType
```typescript
// src/hooks/use-firm-type.ts
import { useAuthStore } from '@/stores/auth-store'
import type { FirmSize } from '@/types/sidebar'

export function useFirmType(): FirmSize {
  const user = useAuthStore((state) => state.user)

  if (!user || user.isSoloLawyer || !user.firmId) {
    return 'solo'
  }

  const plan = user.tenant?.subscription?.plan || user.plan

  if (plan === 'enterprise') return 'large'
  if (plan === 'professional') return 'small'

  return 'small' // Default for firms
}
```

---

## State Management

### localStorage Keys (via STORAGE_KEYS)

| Key | Purpose | Type |
|-----|---------|------|
| `sidebar-recents` | Recent pages | `RecentItem[]` |
| `sidebar-collapsed` | Collapsed module IDs | `string[]` |

### Recents Tracker Utility

```typescript
// src/lib/recents-tracker.ts
const STORAGE_KEY = 'sidebar-recents'
const MAX_RECENTS = 5

class RecentsTracker {
  private listeners = new Set<() => void>()
  private cache: RecentItem[] | null = null

  getSnapshot = (): RecentItem[] => {
    if (this.cache) return this.cache
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      this.cache = stored ? JSON.parse(stored) : []
    } catch {
      this.cache = []
    }
    return this.cache
  }

  getServerSnapshot = (): RecentItem[] => []

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  trackVisit = (item: Omit<RecentItem, 'visitedAt'>): void => {
    const recents = this.getSnapshot().filter(r => r.path !== item.path)
    const updated = [{ ...item, visitedAt: Date.now() }, ...recents].slice(0, MAX_RECENTS)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch { /* localStorage unavailable */ }

    this.cache = updated
    this.listeners.forEach(l => l())
  }
}

export const recentsTracker = new RecentsTracker()
```

---

## Module Visibility Configuration

### Default Module Tiers

```typescript
// src/constants/sidebar-defaults.ts
export const MODULE_TIERS: Record<string, FirmSize[]> = {
  productivity:      ['solo', 'small', 'large'],
  legalWork:         ['solo', 'small', 'large'],
  clients:           ['solo', 'small', 'large'],  // "Growth" for small/large
  billing:           ['solo', 'small', 'large'],
  documents:         ['solo', 'small', 'large'],
  knowledgeCenter:   ['solo', 'small', 'large'],
  market:            ['solo', 'small', 'large'],  // Conditional on settings
  hr:                ['small', 'large'],
  finance:           ['large'],
  saudiCompliance:   ['large'],
  operations:        ['large'],
}

export function isModuleVisibleForTier(moduleId: string, firmType: FirmSize): boolean {
  const tiers = MODULE_TIERS[moduleId]
  return tiers ? tiers.includes(firmType) : false
}
```

---

## Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| API 401/403 | (silent) | Redirect to login |
| API timeout | (silent) | Use cached/default config |
| API 500 | (silent) | Use cached/default config |
| localStorage disabled | (silent) | Disable recents, use memory |

---

## RTL/LTR Notes

- **Text alignment**: Use `text-start` / `text-end` instead of left/right
- **Flex direction**: `flex-row` auto-reverses with `dir="rtl"`
- **Collapse chevron**: Use `ChevronRight` (mirrors automatically with CSS)
- **Sidebar position**: Already handled by layout component
- **Icon placement**: Icons stay on the leading edge (no mirroring needed)

---

## Query Keys Addition

```typescript
// Add to src/lib/query-keys.ts
sidebar: {
  all: () => ['sidebar'] as const,
  config: () => [...QueryKeys.sidebar.all(), 'config'] as const,
},
```

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/types/sidebar.ts` | Type definitions |
| `src/hooks/use-sidebar-config.ts` | API fetch hook |
| `src/hooks/use-recents.ts` | Recents tracking hook |
| `src/hooks/use-firm-type.ts` | Firm type derivation |
| `src/lib/recents-tracker.ts` | localStorage utility |
| `src/constants/sidebar-defaults.ts` | Fallback configuration |
| `src/services/sidebarService.ts` | API service |

### Modified Files

| File | Changes |
|------|---------|
| `src/hooks/use-sidebar-data.ts` | Integrate new hooks, 4-section structure |
| `src/components/layout/app-sidebar.tsx` | Render 4 sections |
| `src/lib/query-keys.ts` | Add sidebar keys |
| `src/locales/en.json` | Add translation keys |
| `src/locales/ar.json` | Add Arabic translations |

---

## Testing Strategy

### Unit Tests
- `useFirmType` returns correct tier for each user type
- `recentsTracker` correctly manages localStorage
- Module visibility filtering works for all tiers

### Integration Tests
- Sidebar renders correct modules for solo user
- Sidebar renders correct modules for small firm
- Sidebar renders correct modules for large firm
- Recents updates on navigation
- Collapse state persists

### Manual Testing
- [ ] Solo lawyer sees 7 modules (no HR/Finance/Compliance/Operations)
- [ ] Small firm sees 8 modules (adds HR)
- [ ] Large firm sees 11 modules (all)
- [ ] Recents shows last 5 visited pages
- [ ] Collapse state survives page refresh
- [ ] RTL layout renders correctly
- [ ] LTR layout renders correctly
- [ ] API failure falls back gracefully

---

## Performance Considerations

1. **Sidebar config cached for 5 minutes** - Prevents excessive API calls
2. **Recents use `useSyncExternalStore`** - Optimal React 18 pattern
3. **Module filtering memoized** - Expensive computation cached
4. **Lazy icon loading** - Not needed initially (icons are tree-shaken)
5. **No context providers added** - Uses existing stores to avoid re-renders
