# Unified Feature Access System - Frontend Integration Requirements

## Scale Assessment
**Type**: [x] Standard (7-10 files)
**Estimated Files**: 3 new, 6 modified
**Risk Level**: Medium (breaking change to login response handling)

## Problem Statement

The backend has implemented a new Unified Feature Access System that:
1. Removes `allowedFeatures` and `blockedFeatures` arrays from login responses
2. Returns 403 `FEATURE_ACCESS_DENIED` (not `EMAIL_VERIFICATION_REQUIRED`) for feature-blocked requests
3. Includes `requiredAction` object telling frontend exactly what to do
4. Uses user state machine (7 states: ANONYMOUS, UNVERIFIED_FREE, UNVERIFIED_TRIAL, VERIFIED_FREE, VERIFIED_TRIAL, VERIFIED_PAID, PAST_DUE)

The frontend currently:
- Stores `allowedFeatures`/`blockedFeatures` in `auth-store.ts` (line 22-23)
- Reads them in `useEmailVerification.ts` hook
- Uses hardcoded `BLOCKED_ROUTE_PATTERNS` and `BLOCKED_NAV_GROUPS` instead of backend data
- Catches `EMAIL_VERIFICATION_REQUIRED` in API interceptor and redirects

**The frontend must be updated to handle the new `FEATURE_ACCESS_DENIED` error code and `requiredAction` responses.**

---

## Codebase Research

| Searched For | Found | Decision |
|--------------|-------|----------|
| Feature access types | None exist | Create new `types/featureAccess.ts` |
| useEmailVerification hook | `src/hooks/useEmailVerification.ts` | Refactor to `useFeatureAccess` |
| API error handling | `src/lib/api.ts` lines 1278-1304 | Extend for `FEATURE_ACCESS_DENIED` |
| Auth store | `src/stores/auth-store.ts` | Remove `allowedFeatures`/`blockedFeatures` |
| Email verification guard | `src/components/auth/EmailVerificationGuard.tsx` | Rename to `FeatureAccessGuard` |
| Verify email required page | `src/features/auth/email-verification/verify-email-required.tsx` | Update to handle all action types |
| Sidebar filtering | Uses `isNavGroupBlocked()` from hook | Update to use new hook |

---

## Backend API Contract (NEW)

### Error Response: 403 FEATURE_ACCESS_DENIED

```typescript
interface FeatureAccessDeniedResponse {
  success: false
  code: 'FEATURE_ACCESS_DENIED'
  message: string        // English message
  messageAr: string      // Arabic message
  currentState: UserState
  feature: string        // e.g., 'cases', 'knowledge_center'
  requiredAction: {
    type: RequiredActionType
    redirectTo: string
  }
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
```

### User States (Enum)
```typescript
enum UserState {
  ANONYMOUS = 'ANONYMOUS'
  UNVERIFIED_FREE = 'UNVERIFIED_FREE'
  UNVERIFIED_TRIAL = 'UNVERIFIED_TRIAL'
  VERIFIED_FREE = 'VERIFIED_FREE'
  VERIFIED_TRIAL = 'VERIFIED_TRIAL'
  VERIFIED_PAID = 'VERIFIED_PAID'
  PAST_DUE = 'PAST_DUE'
}
```

### Required Action Types (Enum)
```typescript
enum RequiredActionType {
  LOGIN = 'login'
  VERIFY_EMAIL = 'verify_email'
  SUBSCRIBE = 'subscribe'
  UPGRADE_TIER = 'upgrade_tier'
  RETRY_PAYMENT = 'retry_payment'
}
```

---

## User Stories

### Story 1: Handle FEATURE_ACCESS_DENIED API Responses
As a **frontend developer**, I want the API interceptor to catch `FEATURE_ACCESS_DENIED` errors so that users see appropriate modals/redirects based on `requiredAction`.

**Acceptance Criteria (EARS Format):**
1. WHEN API returns 403 with code `FEATURE_ACCESS_DENIED` THEN the system SHALL parse `requiredAction.type`
2. WHEN `requiredAction.type` is `verify_email` THEN the system SHALL show verify email toast with action button
3. WHEN `requiredAction.type` is `subscribe` THEN the system SHALL show subscription toast with action button
4. WHEN `requiredAction.type` is `upgrade_tier` THEN the system SHALL show upgrade toast with action button
5. WHEN `requiredAction.type` is `retry_payment` THEN the system SHALL show payment retry toast with action button
6. WHEN `requiredAction.type` is `login` THEN the system SHALL redirect to login page
7. WHEN toast action button is clicked THEN the system SHALL navigate to `requiredAction.redirectTo`

### Story 2: Update useFeatureAccess Hook
As a **component developer**, I want a `useFeatureAccess` hook that calculates user state from user object so that I can check feature access without API calls.

**Acceptance Criteria (EARS Format):**
1. WHEN hook is called THEN the system SHALL return `userState` based on user's `isEmailVerified` and subscription status
2. WHEN `canAccess(feature)` is called THEN the system SHALL return boolean based on feature access matrix
3. WHEN user is unverified THEN `canAccess('tasks')` SHALL return true (allowed without verification)
4. WHEN user is unverified THEN `canAccess('cases')` SHALL return false (requires verification)
5. WHEN user is not subscribed THEN `canAccess('knowledge_center')` SHALL return false (requires subscription)
6. WHEN user state changes THEN hook SHALL re-calculate all derived values

### Story 3: Remove Stale Login Response Handling
As a **maintainer**, I want to remove `allowedFeatures`/`blockedFeatures` from auth store so that we don't have stale data conflicts.

**Acceptance Criteria (EARS Format):**
1. WHEN login response is received THEN the system SHALL NOT expect `allowedFeatures` array
2. WHEN login response is received THEN the system SHALL NOT expect `blockedFeatures` array
3. WHEN `EmailVerificationState` type is used THEN it SHALL NOT include `allowedFeatures`/`blockedFeatures`
4. WHEN auth store is updated THEN old properties SHALL be removed from interface

### Story 4: Update Sidebar Navigation Filtering
As a **user**, I want sidebar nav groups to be filtered based on my feature access so that I don't see features I can't access.

**Acceptance Criteria (EARS Format):**
1. WHEN user is unverified THEN blocked nav groups SHALL be hidden/disabled
2. WHEN user is not subscribed THEN knowledge center nav item SHALL show lock icon
3. WHEN user clicks locked nav item THEN system SHALL show appropriate toast with action
4. WHEN user becomes verified THEN nav groups SHALL immediately update (no refresh needed)

### Story 5: Feature Access Guard Component
As a **developer**, I want a `FeatureAccessGuard` component that wraps protected content so that access is consistently enforced.

**Acceptance Criteria (EARS Format):**
1. WHEN child requires feature user can't access THEN the system SHALL show fallback UI
2. WHEN `requiredAction.type` is `verify_email` THEN fallback SHALL show "Verify Email Required" with CTA
3. WHEN `requiredAction.type` is `subscribe` THEN fallback SHALL show "Subscription Required" with CTA
4. WHEN user gains access THEN guard SHALL immediately show children (no refresh)

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Backend returns old `EMAIL_VERIFICATION_REQUIRED` | Handle as `verify_email` action (backwards compat) |
| Backend returns unknown `requiredAction.type` | Show generic "Access Denied" with return home button |
| User state is `PAST_DUE` | Show payment retry modal with billing link |
| Multiple 403 errors fire simultaneously | Debounce - only show one toast/modal |
| User on blocked route when state changes | Re-evaluate and redirect if needed |
| Network error during feature check | Allow access (fail-open for UX), backend enforces |

---

## Files to Change

| File | Change | Risk |
|------|--------|------|
| `src/types/featureAccess.ts` | CREATE - Types and enums | Low |
| `src/hooks/useFeatureAccess.ts` | CREATE - Replace useEmailVerification | Medium |
| `src/lib/api.ts` | MODIFY - Add FEATURE_ACCESS_DENIED handler | Medium |
| `src/stores/auth-store.ts` | MODIFY - Remove allowedFeatures/blockedFeatures | Medium |
| `src/hooks/useEmailVerification.ts` | DELETE/DEPRECATE - Replaced by useFeatureAccess | Low |
| `src/components/auth/EmailVerificationGuard.tsx` | MODIFY - Become FeatureAccessGuard | Medium |
| `src/features/auth/email-verification/verify-email-required.tsx` | MODIFY - Handle all action types | Medium |
| `src/components/layout/sidebar.tsx` (or equivalent) | MODIFY - Use useFeatureAccess | Low |
| `src/services/authService.ts` | MODIFY - Update EmailVerificationState type | Low |

---

## Out of Scope

- Modal components (VerifyEmailModal, UpgradeModal) - use existing patterns or simple toasts
- Subscription/billing page changes - handled separately
- Backend changes - already complete
- Mobile app changes - separate PR

---

## Open Questions

None - backend API contract is fully specified in user's message.

---

## Technical Notes

- Use centralized constants (`ROUTES.auth.verifyEmailRequired`, `ROUTES.dashboard.settings.billing`)
- RTL/LTR support required for all new UI elements
- Follow toast patterns from existing codebase (sonner)
- Backwards compatible with `EMAIL_VERIFICATION_REQUIRED` during transition
- Use Zustand selectors for performance (avoid full store re-renders)

---

## Feature Access Matrix (Reference)

| Feature | Unverified | Verified Free | Verified Paid |
|---------|------------|---------------|---------------|
| tasks | Yes | Yes | Yes |
| reminders | Yes | Yes | Yes |
| events | Yes | Yes | Yes |
| calendar | Yes | Yes | Yes |
| appointments | Yes | Yes | Yes |
| gantt | Yes | Yes | Yes |
| cases | No | Yes | Yes |
| clients | No | Yes | Yes |
| documents | No | Yes | Yes |
| knowledge_center | No | No | Yes |

---

## Verification Plan

After implementation, verify:
- [ ] `npm run build` passes with no TypeScript errors
- [ ] Login response without `allowedFeatures`/`blockedFeatures` works
- [ ] 403 `FEATURE_ACCESS_DENIED` shows correct toast
- [ ] Toast action navigates to `requiredAction.redirectTo`
- [ ] Sidebar hides blocked nav groups
- [ ] Guard component shows correct fallback
- [ ] RTL/LTR works for all new UI
- [ ] No console errors
