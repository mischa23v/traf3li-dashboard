# Email Verification Feature-Based Blocking - Requirements (v2)

## Scale Assessment
**Type**: [x] Enterprise
**Estimated Files**: 6-8 modified, 1-2 new
**Risk Level**: Medium (auth flow changes, critical path)

---

## 🔍 CLAUDE.md Rule 1 Compliance - Investigation Results

### ✅ EXISTS (Reuse These)

| System | Location | Reuse Strategy |
|--------|----------|----------------|
| **Plan/Subscription Blocking** | `src/hooks/usePlanFeatures.tsx` | **FOLLOW THIS PATTERN** - `canAccess(feature)` |
| **Permission Guards** | `src/components/permissions/PermissionGuard.tsx` | Add `EmailVerificationGuard` following same pattern |
| **Permission System** | `src/lib/permissions.ts` | Add `isEmailBlocked()` function |
| **Module Visibility Store** | `src/stores/module-visibility-store.ts` | Reference for nav group keys |
| **Sidebar Data Hook** | `src/hooks/use-sidebar-data.ts` | Add email verification layer to `filterNavGroups()` |
| **Auth Error Codes** | `src/utils/authErrors.ts` | `EMAIL_NOT_VERIFIED` already exists |
| **Email Verification Selectors** | `src/stores/auth-store.ts` | Extend with `emailVerification` state |

### ❌ MISSING (Create These)

| Component | Pattern to Follow | Purpose |
|-----------|-------------------|---------|
| `useEmailVerification` hook | Follow `usePlanFeatures.tsx` pattern | Centralized email verification access control |
| `EmailVerificationGuard` | Follow `PermissionGuard.tsx` pattern | Route/component-level blocking |
| `emailVerification` state in auth store | Extend existing auth store | Store `allowedFeatures`/`blockedFeatures` |

---

## 🏆 Gold Standard Architecture

### Centralized Access Control Chain (Existing + New)

```
User Request → Auth Check → Email Verification → Permissions → Plan Features → Module Visibility → Render
                              ↑                    ↑              ↑
                              NEW (add here)       EXISTS         EXISTS
```

### Hook Pattern (Follow `usePlanFeatures`)

```typescript
// Existing: usePlanFeatures
const { canAccess } = usePlanFeatures()
if (!canAccess('audit_logs')) { /* show upgrade */ }

// NEW: useEmailVerification (same pattern!)
const { isBlocked, blockedFeatures } = useEmailVerification()
if (isBlocked('cases')) { /* show verify email prompt */ }
```

### Guard Pattern (Follow `PermissionGuard`)

```typescript
// Existing: ModuleGuard
<ModuleGuard module="cases" level="view">
  <CasesPage />
</ModuleGuard>

// NEW: EmailVerificationGuard (same pattern!)
<EmailVerificationGuard feature="cases">
  <CasesPage />
</EmailVerificationGuard>
```

---

## 📋 Complete Feature Blocking Matrix

### Based on `use-sidebar-data.ts` Navigation Groups

| Nav Group Key | Features Included | Unverified Access | Reason |
|---------------|-------------------|-------------------|--------|
| `sidebar.nav.homeGroup` | Overview, Calendar, Appointments | ✅ **ALLOW** | Core access |
| `sidebar.nav.productivityGroup` | Tasks, Reminders, Events, Gantt | ✅ **ALLOW** | Core productivity |
| `sidebar.nav.messagesGroup` | Chat | ❌ **BLOCK** | Communication feature |
| `sidebar.nav.clientsGroup` | Clients, Contacts, Organizations, Leads, CRM Dashboard, CRM Transactions, Staff | ❌ **BLOCK** | Client PII |
| `sidebar.nav.salesGroup` | Pipeline, Products, Quotes, Campaigns, Referrals, Activities, Email Marketing, WhatsApp | ❌ **BLOCK** | Sales data |
| `sidebar.nav.businessGroup` | Cases, Case Notion, Case Pipeline, Documents, My Services, Browse Jobs | ❌ **BLOCK** | Legal/business data |
| `sidebar.nav.financeGroup` | ALL finance items | ❌ **BLOCK** | Financial data |
| `sidebar.nav.operationsGroup` | Items, Warehouses, Suppliers, Purchase Orders | ❌ **BLOCK** | Inventory/purchasing |
| `sidebar.nav.assetsGroup` | Assets, Categories, Depreciation, Maintenance, Movements | ❌ **BLOCK** | Asset management |
| `sidebar.nav.supportGroup` | Tickets, SLAs | ❌ **BLOCK** | Support system |
| `sidebar.nav.hrGroup` | ALL HR items (employees, payroll, leave, recruitment, etc.) | ❌ **BLOCK** | Employee data |
| `sidebar.nav.libraryGroup` | Laws, Judgments, Forms (Knowledge Center) | ❌ **BLOCK** | Legal knowledge |
| `sidebar.nav.excellenceGroup` | Reputation Overview, Badges | ❌ **BLOCK** | Reputation system |
| `sidebar.nav.settingsGroup` | Profile, Security, Preferences, Help Center | ✅ **ALLOW** | User settings |
| `sidebar.nav.settingsGroup` | Apps, Import/Export, CRM Settings | ❌ **BLOCK** | Advanced settings |

### Summary

**ALLOWED** (5 total):
- Home (Overview, Calendar, Appointments)
- Productivity (Tasks, Reminders, Events, Gantt)
- Notifications
- Settings (Profile, Security, Preferences, Help Center only)

**BLOCKED** (11 nav groups):
- Messages, Clients, Sales, Business, Finance, Operations, Assets, Support, HR, Library, Excellence

---

## 🔧 Implementation Plan

### Phase 1: Core Infrastructure (Centralized)

#### 1.1 Create `src/hooks/useEmailVerification.ts`

Follow `usePlanFeatures.tsx` pattern exactly:

```typescript
// src/hooks/useEmailVerification.ts
export function useEmailVerification() {
  const user = useAuthStore((state) => state.user)
  const emailVerification = useAuthStore((state) => state.emailVerification)

  const isVerified = useMemo(() =>
    user?.isEmailVerified === true, [user])

  const blockedNavGroups = useMemo(() => [
    'sidebar.nav.messagesGroup',
    'sidebar.nav.clientsGroup',
    'sidebar.nav.salesGroup',
    'sidebar.nav.businessGroup',
    'sidebar.nav.financeGroup',
    'sidebar.nav.operationsGroup',
    'sidebar.nav.assetsGroup',
    'sidebar.nav.supportGroup',
    'sidebar.nav.hrGroup',
    'sidebar.nav.libraryGroup',
    'sidebar.nav.excellenceGroup',
  ], [])

  const isNavGroupBlocked = useCallback((navGroupKey: string) => {
    if (isVerified) return false
    return blockedNavGroups.includes(navGroupKey)
  }, [isVerified, blockedNavGroups])

  const isRouteBlocked = useCallback((routePath: string) => {
    if (isVerified) return false
    // Check route against blocked patterns
    return BLOCKED_ROUTE_PATTERNS.some(pattern =>
      routePath.startsWith(pattern))
  }, [isVerified])

  return {
    isVerified,
    isNavGroupBlocked,
    isRouteBlocked,
    blockedNavGroups,
    requiresVerification: !isVerified,
  }
}
```

#### 1.2 Update `src/stores/auth-store.ts`

Add `emailVerification` state from login response:

```typescript
interface EmailVerificationState {
  isVerified: boolean
  requiresVerification: boolean
  allowedFeatures: string[]
  blockedFeatures: string[]
  verificationSentAt?: string
  canResendAfter?: string
}

interface AuthState {
  // ... existing
  emailVerification: EmailVerificationState | null
}
```

#### 1.3 Update `src/hooks/use-sidebar-data.ts`

Add email verification layer to existing filtering:

```typescript
import { useEmailVerification } from '@/hooks/useEmailVerification'

export function useSidebarData(): SidebarData {
  const { isNavGroupBlocked } = useEmailVerification()

  // Existing filters
  const filterNavGroups = (groups: NavGroup[]): NavGroup[] => {
    return groups
      // Module visibility (existing)
      .filter((group) => isNavGroupVisible(group.title))
      // Email verification (NEW)
      .filter((group) => !isNavGroupBlocked(group.title))
      // Permission filter (existing)
      .map((group) => ({
        ...group,
        items: filterNavItems(group.items),
      }))
      .filter((group) => group.items.length > 0)
  }
}
```

### Phase 2: Route Protection

#### 2.1 Create `src/components/auth/EmailVerificationGuard.tsx`

Follow `PermissionGuard.tsx` pattern:

```typescript
export function EmailVerificationGuard({
  feature,
  children,
  fallback = null,
  redirectTo = ROUTES.auth.verifyEmailRequired,
}: {
  feature?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}) {
  const { isVerified, isRouteBlocked } = useEmailVerification()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isVerified && isRouteBlocked(location.pathname)) {
      navigate(redirectTo, {
        search: { returnTo: location.pathname }
      })
    }
  }, [isVerified, location.pathname])

  if (!isVerified && isRouteBlocked(location.pathname)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

### Phase 3: API Interceptor

#### 3.1 Update `src/services/authService.ts`

Handle 403 `EMAIL_VERIFICATION_REQUIRED`:

```typescript
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const code = error.response?.data?.code
      if (code === 'EMAIL_VERIFICATION_REQUIRED') {
        // Redirect to verification page
        window.location.href = ROUTES.auth.verifyEmailRequired
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)
```

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `src/stores/auth-store.ts` | Add `emailVerification` state, update login action |
| `src/hooks/use-sidebar-data.ts` | Add `isNavGroupBlocked()` filter (3 lines) |
| `src/services/authService.ts` | Add 403 interceptor, update login response type |
| `src/components/layout/authenticated-layout.tsx` | Wrap with `EmailVerificationGuard` |

## 📁 Files to Create

| File | Pattern |
|------|---------|
| `src/hooks/useEmailVerification.ts` | Follow `usePlanFeatures.tsx` |
| `src/components/auth/EmailVerificationGuard.tsx` | Follow `PermissionGuard.tsx` |

---

## ✅ Acceptance Criteria

1. **Unverified user logs in** → Can access Tasks, Reminders, Events, Gantt, Calendar, Settings (Profile/Security/Preferences/Help)
2. **Sidebar shows only allowed items** → All blocked nav groups hidden (not grayed, hidden)
3. **Direct URL to blocked route** → Redirects to `/verify-email-required`
4. **API 403 EMAIL_VERIFICATION_REQUIRED** → Redirects to verification page
5. **User verifies email** → All features unlock immediately (store update)
6. **Centralized logic** → Single `useEmailVerification` hook, reusable everywhere

---

## 🧪 Testing Requirements

- [ ] Login with unverified email → Only allowed nav groups visible
- [ ] Navigate to `/dashboard/cases` directly → Redirect to verify page
- [ ] Navigate to `/dashboard/tasks` → Works normally
- [ ] API returns 403 EMAIL_VERIFICATION_REQUIRED → Redirect
- [ ] Verify email → All nav groups appear, no page refresh needed
- [ ] RTL/Arabic layout correct
- [ ] LTR/English layout correct

---

## ⚠️ Out of Scope

- Graying out nav items with lock icons (hiding instead - simpler, cleaner)
- Tooltips on disabled items (items are hidden)
- WebSocket real-time verification updates (can add later)
