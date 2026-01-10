# Email Verification Feature-Based Blocking - Technical Design

## Overview
Implement centralized email verification access control that blocks unverified users from accessing sensitive features while allowing core productivity features (tasks, reminders, events, calendar).

## Impact Summary
- **New files**: 2
- **Modified files**: 4
- **Risk level**: Low (follows existing patterns, additive changes)
- **Estimated tasks**: 8

---

## 📋 Impact Analysis

### Files to CREATE (New)
| File | Purpose | Lines Est. |
|------|---------|------------|
| `src/hooks/useEmailVerification.ts` | Centralized email verification hook (follows usePlanFeatures pattern) | ~80 |
| `src/components/auth/EmailVerificationGuard.tsx` | Route/component guard (follows PermissionGuard pattern) | ~60 |

**Total New Files**: 2
**Total New Lines**: ~140

### Files to MODIFY (Existing)
| File | Current Lines | What Changes | Lines Changed | Risk |
|------|---------------|--------------|---------------|------|
| `src/stores/auth-store.ts` | ~380 | Add emailVerification state, update login action, add selectors | +25 | Low |
| `src/hooks/use-sidebar-data.ts` | ~870 | Add email verification filter (1 import, 3 lines in filterNavGroups) | +4 | Low |
| `src/services/authService.ts` | ~1500 | Add 403 interceptor, update LoginResponse type | +20 | Low |
| `src/types/auth.ts` or inline | ~100 | Add EmailVerificationState interface | +15 | Low |

**Total Modified Files**: 4
**Total Lines Changed**: ~64

### Files NOT Touched (Confirming Safety)
| File | Why Safe |
|------|----------|
| `src/hooks/usePlanFeatures.tsx` | Reference pattern only, not modifying |
| `src/components/permissions/PermissionGuard.tsx` | Reference pattern only, not modifying |
| `src/stores/module-visibility-store.ts` | Separate concern, email verification is additive layer |
| `src/lib/permissions.ts` | Role-based permissions, separate from email verification |
| Existing route files | Guard wraps at layout level, not individual routes |

### Dependency Graph
```
requirements.md (approved)
    ↓
design.md
    ↓
tasks.md
    ↓
Phase 1: Types → Auth Store (data layer)
    ↓
Phase 2: Hook → Guard Component (access control)
    ↓
Phase 3: Sidebar Integration → API Interceptor (integration)
    ↓
Phase 4: Testing (verification)
```

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking login flow | Low | High | Test login immediately after auth store changes |
| Sidebar disappearing entirely | Low | Medium | Check isVerified defaults to true when no emailVerification state |
| Infinite redirect loop | Low | High | Guard checks route before redirecting |
| Breaking existing permissions | Very Low | High | Email verification is additive layer, doesn't modify permission logic |

### Rollback Strategy
If implementation fails:
1. All new files can be deleted safely
2. Auth store: revert emailVerification state (git checkout)
3. Sidebar: remove 1 filter line (git checkout)
4. Each phase is independently revertable

---

## Technical Resources
- Existing Pattern: `src/hooks/usePlanFeatures.tsx` - Hook pattern to follow
- Existing Pattern: `src/components/permissions/PermissionGuard.tsx` - Guard pattern to follow
- Auth Store: `src/stores/auth-store.ts` - Extend with emailVerification state
- Sidebar: `src/hooks/use-sidebar-data.ts` - Add filter layer

## Project Constants (from CLAUDE.md)
| Type | Import From |
|------|-------------|
| Routes | `@/constants/routes` |
| Auth Store | `@/stores/auth-store` |

---

## Architecture

### Access Control Chain
```
User Request
    ↓
Auth Check (existing)
    ↓
Email Verification ← NEW LAYER
    ↓
Permissions (existing)
    ↓
Plan Features (existing)
    ↓
Module Visibility (existing)
    ↓
Render
```

### Component Hierarchy
```
AuthenticatedLayout
├── EmailVerificationBanner (existing - shows warning)
├── AppSidebar
│   └── useSidebarData() ← Add isNavGroupBlocked filter
└── Main Content
    └── EmailVerificationGuard (NEW - wraps protected routes)
```

### Data Flow
```
Login Response
    ↓
authStore.setEmailVerification(data.emailVerification)
    ↓
useEmailVerification() hook reads from store
    ↓
Components use hook: { isVerified, isNavGroupBlocked, isRouteBlocked }
    ↓
Sidebar filters blocked nav groups
Guard redirects if route blocked
```

---

## Data Models

### TypeScript Interfaces

```typescript
/**
 * Email verification state from backend
 * Returned in login response and /auth/me
 */
interface EmailVerificationState {
  isVerified: boolean
  requiresVerification: boolean
  verificationSentAt?: string
  allowedFeatures: string[]  // ['tasks', 'reminders', 'events', ...]
  blockedFeatures: string[]  // ['cases', 'clients', 'billing', ...]
}

/**
 * Extended login response (add to existing)
 */
interface LoginResponse {
  // ... existing fields
  emailVerification?: EmailVerificationState
}

/**
 * 403 error response for blocked features
 */
interface EmailVerificationErrorResponse {
  error: true
  code: 'EMAIL_VERIFICATION_REQUIRED'
  message: string
  messageEn: string
  redirectTo: string
  emailVerification: {
    isVerified: boolean
    requiresVerification: boolean
    allowedFeatures: string[]
    blockedFeature: string  // The specific feature that was blocked
  }
}
```

---

## API Integration

### Endpoints Returning emailVerification
| Endpoint | Method | Returns emailVerification |
|----------|--------|---------------------------|
| `/auth/verify-otp` | POST | Yes (login) |
| `/auth/google/one-tap` | POST | Yes (SSO login) |
| `/auth/me` | GET | Yes |
| `/auth/verify-email` | POST | Yes (after verification) |

### 403 Error Handling
When backend returns 403 with `code: 'EMAIL_VERIFICATION_REQUIRED'`:
1. Interceptor catches the error
2. Redirects to `/verify-email-required`
3. Preserves intended destination for post-verification redirect

---

## Hook Design: useEmailVerification

Following `usePlanFeatures.tsx` pattern exactly:

```typescript
// src/hooks/useEmailVerification.ts

interface UseEmailVerificationReturn {
  // State
  isVerified: boolean
  requiresVerification: boolean
  emailVerification: EmailVerificationState | null

  // Nav group blocking (for sidebar)
  isNavGroupBlocked: (navGroupKey: string) => boolean
  blockedNavGroups: string[]

  // Route blocking (for guard)
  isRouteBlocked: (routePath: string) => boolean
  blockedRoutePatterns: string[]
}

export function useEmailVerification(): UseEmailVerificationReturn {
  const user = useAuthStore((state) => state.user)
  const emailVerification = useAuthStore((state) => state.emailVerification)

  const isVerified = useMemo(() =>
    user?.isEmailVerified === true, [user])

  // Nav groups to block when unverified
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

  // Route patterns to block when unverified
  const blockedRoutePatterns = useMemo(() => [
    '/dashboard/messages',
    '/dashboard/clients',
    '/dashboard/contacts',
    '/dashboard/organizations',
    '/dashboard/crm',
    '/dashboard/cases',
    '/dashboard/documents',
    '/dashboard/finance',
    '/dashboard/inventory',
    '/dashboard/buying',
    '/dashboard/assets',
    '/dashboard/support',
    '/dashboard/hr',
    '/dashboard/knowledge',
    '/dashboard/reputation',
    '/dashboard/staff',
    '/dashboard/jobs',
    '/dashboard/apps',
    '/dashboard/data-export',
  ], [])

  const isNavGroupBlocked = useCallback((navGroupKey: string) => {
    if (isVerified) return false
    return blockedNavGroups.includes(navGroupKey)
  }, [isVerified, blockedNavGroups])

  const isRouteBlocked = useCallback((routePath: string) => {
    if (isVerified) return false
    return blockedRoutePatterns.some(pattern =>
      routePath.startsWith(pattern))
  }, [isVerified, blockedRoutePatterns])

  return {
    isVerified,
    requiresVerification: !isVerified,
    emailVerification,
    isNavGroupBlocked,
    blockedNavGroups,
    isRouteBlocked,
    blockedRoutePatterns,
  }
}
```

---

## Guard Component Design: EmailVerificationGuard

Following `PermissionGuard.tsx` pattern:

```typescript
// src/components/auth/EmailVerificationGuard.tsx

interface EmailVerificationGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function EmailVerificationGuard({
  children,
  fallback = null,
}: EmailVerificationGuardProps) {
  const { isVerified, isRouteBlocked } = useEmailVerification()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isVerified && isRouteBlocked(location.pathname)) {
      navigate({
        to: ROUTES.auth.verifyEmailRequired,
        search: { returnTo: location.pathname }
      })
    }
  }, [isVerified, location.pathname, isRouteBlocked, navigate])

  // Show fallback while redirecting
  if (!isVerified && isRouteBlocked(location.pathname)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

---

## Sidebar Integration

Add single filter to existing `filterNavGroups` function:

```typescript
// src/hooks/use-sidebar-data.ts

import { useEmailVerification } from '@/hooks/useEmailVerification'

export function useSidebarData(): SidebarData {
  const { isNavGroupBlocked } = useEmailVerification()

  const filterNavGroups = (groups: NavGroup[]): NavGroup[] => {
    return groups
      // Module visibility (existing)
      .filter((group) => isNavGroupVisible(group.title))
      // Email verification (NEW - add this line)
      .filter((group) => !isNavGroupBlocked(group.title))
      // Permission filter (existing)
      .map((group) => ({
        ...group,
        items: filterNavItems(group.items),
      }))
      .filter((group) => group.items.length > 0)
  }

  // ... rest unchanged
}
```

---

## Auth Store Changes

```typescript
// src/stores/auth-store.ts

// Add to state interface
interface AuthState {
  // ... existing
  emailVerification: EmailVerificationState | null
}

// Add to initial state
const initialState = {
  // ... existing
  emailVerification: null,
}

// Add action
setEmailVerification: (emailVerification: EmailVerificationState | null) => {
  set({ emailVerification })
},

// Update login action to store emailVerification
login: async (credentials) => {
  // ... existing login logic
  const response = await authService.login(credentials)

  // Store emailVerification if present
  if (response.emailVerification) {
    set({ emailVerification: response.emailVerification })
  }

  // ... rest of login
}

// Add selector
export const selectEmailVerification = (state: AuthState) =>
  state.emailVerification
```

---

## API Interceptor

```typescript
// src/services/authService.ts - add to existing interceptor

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // ... existing error handling

    // Handle email verification required
    if (error.response?.status === 403) {
      const code = error.response?.data?.code
      if (code === 'EMAIL_VERIFICATION_REQUIRED') {
        // Store the blocked feature info if present
        const blockedFeature = error.response?.data?.emailVerification?.blockedFeature

        // Redirect to verification page with context
        const currentPath = window.location.pathname
        const params = new URLSearchParams({
          returnTo: currentPath,
          ...(blockedFeature && { blockedFeature })
        })

        window.location.href = `${ROUTES.auth.verifyEmailRequired}?${params}`
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)
```

---

## Error Handling

| Error Code | Condition | Action |
|------------|-----------|--------|
| 403 + EMAIL_VERIFICATION_REQUIRED | Unverified user accesses blocked API | Redirect to /verify-email-required |
| Route blocked | Direct URL navigation to blocked route | Guard redirects to /verify-email-required |
| No emailVerification state | First load, state not yet populated | Default to NOT blocking (safe fallback) |

---

## RTL/LTR Considerations
- No new UI components with text (hook + guard only)
- Existing EmailVerificationBanner already handles RTL
- Sidebar uses existing RTL-aware components

---

## Testing Strategy

### Manual Testing
1. Login with unverified email
2. Verify only allowed nav groups visible
3. Try direct URL to blocked route
4. Verify redirect works
5. Complete verification
6. Verify all features unlock

### Verification Checklist
- [ ] Login flow still works
- [ ] Sidebar shows correct items for unverified user
- [ ] Blocked routes redirect to verification page
- [ ] API 403 triggers redirect
- [ ] After verification, all features accessible
- [ ] No console errors
