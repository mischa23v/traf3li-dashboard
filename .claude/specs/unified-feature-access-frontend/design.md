# Unified Feature Access System - Frontend Integration - Technical Design

## Overview

Replace the current `EMAIL_VERIFICATION_REQUIRED` handling with the new `FEATURE_ACCESS_DENIED` system that uses a state machine (7 states) and action-based responses. Remove stale `allowedFeatures`/`blockedFeatures` arrays from auth store and implement a new `useFeatureAccess` hook.

## Impact Summary

| Type | Count | Risk |
|------|-------|------|
| New files | 2 | Low |
| Modified files | 7 | Medium |
| Deleted files | 0 (deprecate only) | Low |
| Total tasks | 12 | - |

---

## Architecture

### Component Hierarchy

```
App
 API Interceptor (api.ts)
    handleFeatureAccessDenied() - Shows toast with action
 FeatureAccessGuard (wraps protected content)
    useFeatureAccess() hook
 Sidebar
    use-sidebar-data.ts → useFeatureAccess().isNavGroupBlocked()
 verify-email-required.tsx (handles all action types)
```

### Data Flow

```
API Error (403 FEATURE_ACCESS_DENIED)
    ↓
API Interceptor catches error
    ↓
Parse requiredAction.type
    ↓
Show toast with action button OR redirect
    ↓
User clicks action → Navigate to requiredAction.redirectTo
```

### State Machine

```
User State Machine (calculated from user object):


  No user     → ANONYMOUS                                    
  !verified   → UNVERIFIED_FREE / UNVERIFIED_TRIAL          
  verified    → VERIFIED_FREE / VERIFIED_TRIAL / VERIFIED_PAID
  past_due    → PAST_DUE                                    

```

---

## Data Models

### TypeScript Interfaces (NEW: `src/types/featureAccess.ts`)

```typescript
/**
 * User state enum - matches backend featureAccess.config.js
 */
export enum UserState {
  ANONYMOUS = 'ANONYMOUS',
  UNVERIFIED_FREE = 'UNVERIFIED_FREE',
  UNVERIFIED_TRIAL = 'UNVERIFIED_TRIAL',
  VERIFIED_FREE = 'VERIFIED_FREE',
  VERIFIED_TRIAL = 'VERIFIED_TRIAL',
  VERIFIED_PAID = 'VERIFIED_PAID',
  PAST_DUE = 'PAST_DUE',
}

/**
 * Required action types - what the user needs to do
 */
export enum RequiredActionType {
  LOGIN = 'login',
  VERIFY_EMAIL = 'verify_email',
  SUBSCRIBE = 'subscribe',
  UPGRADE_TIER = 'upgrade_tier',
  RETRY_PAYMENT = 'retry_payment',
}

/**
 * Required action object from backend
 */
export interface RequiredAction {
  type: RequiredActionType
  redirectTo: string
}

/**
 * 403 FEATURE_ACCESS_DENIED response from backend
 */
export interface FeatureAccessDeniedResponse {
  success: false
  code: 'FEATURE_ACCESS_DENIED'
  message: string
  messageAr: string
  currentState: UserState
  feature: string
  requiredAction: RequiredAction
  emailVerification: {
    isVerified: boolean
    requiresVerification: boolean
  }
  subscription: {
    status: 'none' | 'trial' | 'trialing' | 'active' | 'past_due' | 'canceled'
    tier: 'free' | 'starter' | 'professional' | 'enterprise'
    requiresSubscription: boolean
  }
}

/**
 * Feature access matrix - which states can access which features
 * Matches backend featureAccess.config.js FEATURE_ACCESS
 */
export const FEATURE_ACCESS: Record<string, UserState[]> = {
  // Always allowed (any authenticated)
  auth: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID, UserState.PAST_DUE],
  profile_view: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID, UserState.PAST_DUE],
  billing_view: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID, UserState.PAST_DUE],
  notifications: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID, UserState.PAST_DUE],

  // Allowed without email verification
  tasks: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  reminders: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  events: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  calendar: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  appointments: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  gantt: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],

  // Requires email verification (not subscription)
  cases: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  clients: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  contacts: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  invoices: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  documents: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  templates: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  team: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  integrations: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  reports: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  analytics: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  settings: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  crm: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  hr: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],

  // Requires subscription (knowledge center)
  knowledge_center: [UserState.VERIFIED_PAID],
  knowledge_articles: [UserState.VERIFIED_PAID],
}

/**
 * Nav groups that require email verification
 * Maps to sidebar nav group keys
 */
export const BLOCKED_NAV_GROUPS_UNVERIFIED = [
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
] as const

/**
 * Nav groups that require subscription
 */
export const BLOCKED_NAV_GROUPS_UNSUBSCRIBED = [
  'sidebar.nav.libraryGroup', // Knowledge center
] as const
```

---

## API Error Handling

### Modify `src/lib/api.ts`

Replace `EMAIL_VERIFICATION_REQUIRED` handler with unified `FEATURE_ACCESS_DENIED` handler:

```typescript
// Handle 403 FEATURE_ACCESS_DENIED or EMAIL_VERIFICATION_REQUIRED (backwards compat)
if (error.response?.status === 403) {
  const errorCode = error.response?.data?.code

  if (errorCode === 'FEATURE_ACCESS_DENIED' || errorCode === 'EMAIL_VERIFICATION_REQUIRED') {
    const data = error.response?.data as FeatureAccessDeniedResponse
    const requiredAction = data.requiredAction || { type: 'verify_email', redirectTo: ROUTES.auth.verifyEmailRequired }

    // Get current language for bilingual messages
    const lang = localStorage.getItem('i18nextLng') || 'en'
    const message = lang === 'ar' ? (data.messageAr || data.message) : data.message

    // Handle based on action type
    handleFeatureAccessDenied(requiredAction, message, data.feature)

    return Promise.reject({
      status: 403,
      message,
      code: 'FEATURE_ACCESS_DENIED',
      error: true,
      requiredAction,
      feature: data.feature,
    })
  }
}

function handleFeatureAccessDenied(
  requiredAction: RequiredAction,
  message: string,
  feature?: string
) {
  const lang = localStorage.getItem('i18nextLng') || 'en'

  switch (requiredAction.type) {
    case 'login':
      window.location.href = ROUTES.auth.signIn
      break

    case 'verify_email':
      toast.error(message, {
        action: {
          label: lang === 'ar' ? 'تفعيل البريد' : 'Verify Email',
          onClick: () => { window.location.href = requiredAction.redirectTo },
        },
        duration: 8000,
      })
      break

    case 'subscribe':
      toast.error(message, {
        action: {
          label: lang === 'ar' ? 'الاشتراك الآن' : 'Subscribe',
          onClick: () => { window.location.href = requiredAction.redirectTo },
        },
        duration: 8000,
      })
      break

    case 'upgrade_tier':
      toast.error(message, {
        action: {
          label: lang === 'ar' ? 'ترقية الباقة' : 'Upgrade',
          onClick: () => { window.location.href = requiredAction.redirectTo },
        },
        duration: 8000,
      })
      break

    case 'retry_payment':
      toast.error(message, {
        action: {
          label: lang === 'ar' ? 'تحديث الدفع' : 'Update Payment',
          onClick: () => { window.location.href = requiredAction.redirectTo },
        },
        duration: 8000,
      })
      break

    default:
      toast.error(message, {
        action: {
          label: lang === 'ar' ? 'العودة للرئيسية' : 'Go Home',
          onClick: () => { window.location.href = ROUTES.dashboard.home },
        },
        duration: 8000,
      })
  }
}
```

---

## Components

### New Hook: `src/hooks/useFeatureAccess.ts`

```typescript
/**
 * Feature Access Hook
 * Calculates user state and provides feature access checking
 * Replaces useEmailVerification.ts
 */
export function useFeatureAccess() {
  const user = useAuthStore(selectUser)
  const emailVerification = useAuthStore(selectEmailVerification)

  // Calculate user state from user object
  const userState = useMemo(() => {
    if (!user) return UserState.ANONYMOUS

    const isEmailVerified = user.isEmailVerified === true || emailVerification?.isVerified === true
    const subStatus = user.subscription?.status || user.firm?.subscription?.status

    if (subStatus === 'past_due') return UserState.PAST_DUE
    if (subStatus === 'active' && isEmailVerified) return UserState.VERIFIED_PAID
    if ((subStatus === 'trial' || subStatus === 'trialing') && isEmailVerified) return UserState.VERIFIED_TRIAL
    if ((subStatus === 'trial' || subStatus === 'trialing') && !isEmailVerified) return UserState.UNVERIFIED_TRIAL
    if (isEmailVerified) return UserState.VERIFIED_FREE
    return UserState.UNVERIFIED_FREE
  }, [user, emailVerification])

  // Check if user can access a feature
  const canAccess = useCallback((feature: string): boolean => {
    const allowedStates = FEATURE_ACCESS[feature]
    if (!allowedStates) return true // Unknown feature = allow (backend enforces)
    return allowedStates.includes(userState)
  }, [userState])

  // Check if nav group is blocked
  const isNavGroupBlocked = useCallback((navGroupKey: string): boolean => {
    if (userState === UserState.ANONYMOUS) return true

    // Check if blocked for unverified users
    if ([UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL].includes(userState)) {
      return BLOCKED_NAV_GROUPS_UNVERIFIED.includes(navGroupKey as any)
    }

    // Check if blocked for unsubscribed users (knowledge center)
    if ([UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL].includes(userState)) {
      return BLOCKED_NAV_GROUPS_UNSUBSCRIBED.includes(navGroupKey as any)
    }

    return false
  }, [userState])

  // Get required action for a feature
  const getRequiredAction = useCallback((feature: string): RequiredAction | null => {
    if (canAccess(feature)) return null

    // Determine action based on user state
    if ([UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL].includes(userState)) {
      return { type: RequiredActionType.VERIFY_EMAIL, redirectTo: ROUTES.auth.verifyEmailRequired }
    }
    if ([UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL].includes(userState)) {
      return { type: RequiredActionType.SUBSCRIBE, redirectTo: ROUTES.dashboard.settings.billing }
    }
    if (userState === UserState.PAST_DUE) {
      return { type: RequiredActionType.RETRY_PAYMENT, redirectTo: ROUTES.dashboard.settings.billing }
    }
    return { type: RequiredActionType.LOGIN, redirectTo: ROUTES.auth.signIn }
  }, [userState, canAccess])

  return {
    userState,
    isEmailVerified: ![UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.ANONYMOUS].includes(userState),
    isPaid: userState === UserState.VERIFIED_PAID,
    requiresVerification: [UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL].includes(userState),
    requiresSubscription: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL].includes(userState),
    canAccess,
    isNavGroupBlocked,
    getRequiredAction,
    // Backwards compatibility
    isVerified: ![UserState.UNVERIFIED_FREE, UserState.UNVERIFIED_TRIAL, UserState.ANONYMOUS].includes(userState),
    emailVerification,
  }
}
```

### Guard Component Update: `src/components/auth/FeatureAccessGuard.tsx`

Rename from `EmailVerificationGuard` and handle all action types:

```typescript
interface FeatureAccessGuardProps {
  children: React.ReactNode
  feature?: string // Optional feature to check
  fallback?: React.ReactNode // Custom fallback UI
}

export function FeatureAccessGuard({ children, feature, fallback }: FeatureAccessGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { canAccess, getRequiredAction, isNavGroupBlocked, userState } = useFeatureAccess()

  useEffect(() => {
    // If feature specified, check access
    if (feature && !canAccess(feature)) {
      const action = getRequiredAction(feature)
      if (action) {
        navigate({ to: action.redirectTo, search: { returnTo: location.pathname }, replace: true })
      }
      return
    }

    // Otherwise check route-based blocking (backwards compat)
    const currentPath = location.pathname
    // ... existing route blocking logic using isRouteBlocked
  }, [feature, canAccess, getRequiredAction, location.pathname, navigate])

  // If feature specified and no access, show fallback
  if (feature && !canAccess(feature)) {
    if (fallback) return <>{fallback}</>
    return <FeatureBlockedFallback feature={feature} action={getRequiredAction(feature)} />
  }

  return <>{children}</>
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/featureAccess.ts` | CREATE - All types, enums, constants |
| `src/hooks/useFeatureAccess.ts` | CREATE - New hook replacing useEmailVerification |
| `src/lib/api.ts` | MODIFY - Add FEATURE_ACCESS_DENIED handler (lines 1278-1305, 1771-1797) |
| `src/stores/auth-store.ts` | MODIFY - Remove `allowedFeatures`/`blockedFeatures` from EmailVerificationState (lines 22-23) |
| `src/services/authService.ts` | MODIFY - Update EmailVerificationState type |
| `src/hooks/use-sidebar-data.ts` | MODIFY - Use useFeatureAccess instead of useEmailVerification (line 30, 69) |
| `src/components/auth/EmailVerificationGuard.tsx` | MODIFY - Rename to FeatureAccessGuard, use new hook |
| `src/hooks/useEmailVerification.ts` | DEPRECATE - Add deprecation notice, re-export from useFeatureAccess for backwards compat |

---

## Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| 403 FEATURE_ACCESS_DENIED (verify_email) | "Please verify your email" | Toast with "Verify Email" button |
| 403 FEATURE_ACCESS_DENIED (subscribe) | "Subscription required" | Toast with "Subscribe" button |
| 403 FEATURE_ACCESS_DENIED (upgrade_tier) | "Upgrade required" | Toast with "Upgrade" button |
| 403 FEATURE_ACCESS_DENIED (retry_payment) | "Payment failed" | Toast with "Update Payment" button |
| 403 FEATURE_ACCESS_DENIED (login) | "Please log in" | Redirect to login |
| 403 EMAIL_VERIFICATION_REQUIRED | (backwards compat) | Handle as verify_email |
| Unknown action type | "Access denied" | Toast with "Go Home" button |

---

## RTL/LTR Notes

- Toast messages: Use bilingual `message`/`messageAr` from backend response
- Action button labels: Define both languages in handler
- FeatureBlockedFallback: Use `text-start` for text alignment
- Icons: No directional icons needed for this feature

---

## Testing Strategy

1. **API Interceptor**: Mock 403 responses with different `requiredAction.type` values
2. **useFeatureAccess Hook**: Test all 7 user states and feature access combinations
3. **Sidebar**: Verify nav groups hide/show based on user state
4. **Guard Component**: Test redirect behavior for each action type
5. **Backwards Compatibility**: Verify `EMAIL_VERIFICATION_REQUIRED` still works

---

## Migration Notes

- `useEmailVerification` will be deprecated but kept for backwards compatibility
- Components using `useEmailVerification` should migrate to `useFeatureAccess`
- The old `EMAIL_VERIFICATION_REQUIRED` code path is maintained for transition period
- No database migration needed (frontend only)
