# Dynamic Sidebar - Requirements

## Scale Assessment
**Type**: [x] Enterprise
**Estimated Files**: 8 new, 6 modified
**Risk Level**: Medium (touches core navigation, requires API integration)

## Problem Statement
The current sidebar is static and shows all navigation items regardless of the firm type. We need a dynamic sidebar that:
1. Adapts navigation based on firm size (SOLO/SMALL/LARGE)
2. Shows recently visited pages for quick access
3. Organizes items into Basic (always visible), Recents (auto-populated), Modules (collapsible), and Footer (Settings/Help)
4. Fetches configuration from backend API to enable server-side control

## Codebase Research

| Searched For | Found | Decision |
|--------------|-------|----------|
| Sidebar components | `src/components/layout/app-sidebar.tsx`, `src/hooks/use-sidebar-data.ts` | Extend existing |
| Module visibility | `src/stores/module-visibility-store.ts` | Extend with firm size presets |
| Firm type/size | Not found | Create new type |
| Sidebar config API | Not found | Need backend endpoint |
| Recents tracking | Not found | Create new hook |
| Translation keys | `src/locales/en.json`, `src/locales/ar.json` | Add new keys |

### Existing Architecture
```
AppSidebar
   useSidebarData() hook
         useAuthStore (user data)
         usePermissionsStore (RBAC)
         useModuleVisibilityStore (toggle modules)
         allNavGroups (static definition)
```

### Target Architecture
```
AppSidebar
   useSidebarConfig() hook (NEW - API-driven)
         GET /api/sidebar/config
         useRecents() hook (NEW)
         useFirmType() derived from user/org
         Module presets by firm type
```

---

## User Stories

### Story 1: Firm-based Navigation
As a **lawyer**, I want the sidebar to show navigation items appropriate for my firm size, so that I don't see irrelevant enterprise features as a solo practitioner.

**Acceptance Criteria (EARS Format):**
1. WHEN a user with `firmType=solo` logs in THEN the system SHALL display only Solo-tier modules (7 modules: Productivity, Legal Work, Clients, Billing, Documents, Knowledge Center, Market)
2. WHEN a user with `firmType=small` logs in THEN the system SHALL display Small-tier modules (Solo modules + HR)
3. WHEN a user with `firmType=large` logs in THEN the system SHALL display all modules (Small modules + Finance, Saudi Compliance, Operations)
4. WHEN the firm type cannot be determined THEN the system SHALL default to `solo` tier
5. WHEN the API fails to load THEN the system SHALL fall back to cached/default configuration

### Story 2: Basic Navigation (Always Visible)
As a **user**, I want core navigation items always visible without collapsing, so that I can quickly access the most important pages.

**Acceptance Criteria (EARS Format):**
1. WHEN the sidebar renders THEN the system SHALL display Basic section with: Overview, Calendar, Appointments, Tasks, Cases, Contacts, Reports
2. WHEN the user navigates to any page THEN Basic items SHALL remain visible (not collapsed)
3. WHEN in RTL mode (Arabic) THEN Basic items SHALL display Arabic labels correctly
4. WHEN any Basic item is clicked THEN the system SHALL navigate to the correct route

### Story 3: Recents Section
As a **user**, I want to see my recently visited pages, so that I can quickly return to frequently accessed content.

**Acceptance Criteria (EARS Format):**
1. WHEN a user visits any sidebar-linked page THEN the system SHALL track the visit in localStorage
2. WHEN the sidebar renders THEN the system SHALL display up to 5 recent items below Basic section
3. WHEN a recent item is clicked THEN the system SHALL navigate to that page
4. WHEN a user has no recent visits THEN the system SHALL hide the Recents section
5. WHEN the same page is visited multiple times THEN the system SHALL move it to the top (most recent)
6. WHEN localStorage is unavailable THEN the system SHALL gracefully hide Recents without errors

### Story 4: Collapsible Module Groups
As a **user**, I want module groups to be collapsible, so that I can reduce visual clutter and focus on relevant sections.

**Acceptance Criteria (EARS Format):**
1. WHEN a module group header is clicked THEN the system SHALL toggle its expanded/collapsed state
2. WHEN a module group is collapsed THEN the system SHALL persist the state in localStorage
3. WHEN the sidebar reloads THEN the system SHALL restore the previous expanded/collapsed states
4. WHEN a module contains the current active page THEN the system SHALL auto-expand that module
5. WHEN searching/filtering THEN the system SHALL temporarily expand all matching modules

### Story 5: Footer Navigation
As a **user**, I want Settings and Help always accessible in the footer, so that I can find support and configuration regardless of scroll position.

**Acceptance Criteria (EARS Format):**
1. WHEN the sidebar renders THEN the system SHALL display Settings and Help icons in the footer
2. WHEN hovering over footer icons THEN the system SHALL show tooltips with labels
3. WHEN Settings is clicked THEN the system SHALL navigate to `/dashboard/settings`
4. WHEN Help is clicked THEN the system SHALL navigate to `/dashboard/help`

### Story 6: API-Driven Configuration
As a **system administrator**, I want sidebar configuration to come from the backend API, so that navigation can be controlled without frontend deployments.

**Acceptance Criteria (EARS Format):**
1. WHEN the sidebar initializes THEN the system SHALL call `GET /api/sidebar/config`
2. WHEN the API returns successfully THEN the system SHALL use the returned configuration
3. WHEN the API returns 401/403 THEN the system SHALL redirect to login
4. WHEN the API times out (>5s) THEN the system SHALL use cached/default configuration
5. WHEN the API is called THEN the system SHALL cache the response for 5 minutes (staleTime)

---

## Module Visibility by Firm Type

| Module | Solo | Small | Large |
|--------|------|-------|-------|
| Productivity (Reminders, Events, Gantt) |  |  |  |
| Legal Work (Pipeline, Brainstorm, Insights, Deadlines, Conflicts) |  |  |  |
| Clients/Growth (Pipeline, Leads, Activities, Campaigns) |  |  |  |
| Billing (Invoices, Payments, Expenses, Trust, Time Tracking) |  |  |  |
| Documents (All, Templates, E-Signatures) |  |  |  |
| Knowledge Center (Laws, Judgments, Forms) |  |  |  |
| Market (if enabled) |  |  |  |
| HR (People, Attendance, Leave, Payroll, Workloads) |  |  |  |
| Finance (Dashboard, Transactions, Bank Reconciliation, COA, Reports, Budgets) |  |  |  |
| Saudi Compliance (ZATCA, GOSI, WPS, Iqama Tracker) |  |  |  |
| Operations (Assets, Procurement, Vendors, Inventory) |  |  |  |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Network timeout on config API | Use cached config or fallback to solo defaults |
| User has no firm (solo lawyer) | Treat as `firmType=solo` |
| localStorage disabled | Disable recents tracking, use memory state for collapse |
| Module route doesn't exist yet | Hide the item (don't show broken links) |
| Sidebar config cache expired | Refetch in background, show stale data |
| User language changes mid-session | Re-render sidebar with new language labels |
| User's firm type changes (upgrade) | Refetch config on next page load |
| Circular dependency in imports | Use lazy loading for heavy components |

---

## API Contract

### GET /api/sidebar/config

**Request Headers:**
```
Authorization: Bearer {token}
Accept-Language: en | ar
```

**Response (200 OK):**
```typescript
interface SidebarConfigResponse {
  firmType: 'solo' | 'small' | 'large';
  language: 'en' | 'ar';
  sections: {
    basic: {
      label: string;
      labelAr: string;
      items: SidebarItem[];
    };
    recents: {
      id: 'recents';
      label: string;
      labelAr: string;
      icon: string;
      maxItems: number;
    };
    modules: {
      label: string;
      labelAr: string;
      items: SidebarModule[];
    };
    footer: {
      items: SidebarItem[];
    };
  };
}

interface SidebarItem {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  path: string;
  badge?: number | string;
}

interface SidebarModule {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  defaultExpanded?: boolean;
  items: SidebarItem[];
}
```

---

## Out of Scope
- Firm type selection wizard (will be separate feature)
- Drag-and-drop sidebar reordering
- Custom module creation by users
- Sidebar search functionality
- Keyboard navigation (accessibility follow-up)

---

## Open Questions
- [x] Where should firm type be stored? → **Organization/Firm settings from API**
- [x] How should RECENTS work? → **localStorage with API sync capability**
- [ ] Should the Market module visibility be a separate setting? (Currently tied to firm settings)
- [ ] Should we support pinning items to Recents manually?

---

## Technical Notes

### Centralized Constants Required
```typescript
// Routes
import { ROUTES } from '@/constants/routes'

// Query Keys (add new)
QueryKeys.sidebar.config()

// Cache Times
CACHE_TIMES.MEDIUM (5 minutes for sidebar config)
```

### Translation Keys Required
```
sidebar.sections.basic
sidebar.sections.recents
sidebar.sections.modules
sidebar.sections.footer
sidebar.modules.productivity
sidebar.modules.legalWork
sidebar.modules.clients / sidebar.modules.growth
sidebar.modules.billing
sidebar.modules.documents
sidebar.modules.knowledgeCenter
sidebar.modules.market
sidebar.modules.hr
sidebar.modules.finance
sidebar.modules.saudiCompliance
sidebar.modules.operations
```

### RTL/LTR Support
- All sidebar items must support bilingual labels (label + labelAr)
- Sidebar should flip direction based on language
- Icons should not flip (they're universal)
- Chevrons for expand/collapse should flip in RTL

### Performance Considerations
- Sidebar config should be cached (React Query staleTime: 5 min)
- Recents should debounce writes to localStorage (500ms)
- Use memo for expensive navigation tree computations
- Lazy load module icons if bundle size becomes an issue

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/types/sidebar.ts` | Type definitions for sidebar config |
| `src/services/sidebarService.ts` | API service for sidebar config |
| `src/hooks/use-sidebar-config.ts` | React Query hook for config |
| `src/hooks/use-recents.ts` | Recents tracking hook |
| `src/lib/recents-tracker.ts` | localStorage utility for recents |
| `src/constants/sidebar-defaults.ts` | Fallback/default sidebar config |

### Modified Files
| File | Change |
|------|--------|
| `src/hooks/use-sidebar-data.ts` | Refactor to use new config hook |
| `src/components/layout/app-sidebar.tsx` | Add sections (Basic/Recents/Modules/Footer) |
| `src/stores/module-visibility-store.ts` | Add firm type presets |
| `src/lib/query-keys.ts` | Add sidebar query keys |
| `src/locales/en.json` | Add sidebar translation keys |
| `src/locales/ar.json` | Add Arabic sidebar translations |

---

## Verification Checklist
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] Solo firm sees only Solo modules
- [ ] Small firm sees Solo + HR modules
- [ ] Large firm sees all modules
- [ ] Recents updates on navigation
- [ ] Collapse state persists across refresh
- [ ] RTL sidebar renders correctly
- [ ] LTR sidebar renders correctly
- [ ] API failure falls back gracefully
- [ ] No console errors
