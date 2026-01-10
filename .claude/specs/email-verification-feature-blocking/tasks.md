# Email Verification Feature-Based Blocking - Implementation Tasks

## Overview
Step-by-step implementation plan for centralized email verification access control.

## Impact Reminder
| Type | Count | Risk |
|------|-------|------|
| New files | 2 | Low |
| Modified files | 4 | Low |
| Total tasks | 8 | - |

## Phase Summary

| Phase | Goal | Tasks | Estimated Lines | Status |
|-------|------|-------|-----------------|--------|
| 1 | Data Layer | 2 | ~40 lines | Not Started |
| 2 | Access Control | 2 | ~140 lines | Not Started |
| 3 | Integration | 3 | ~25 lines | Not Started |
| 4 | Verification | 1 | ~0 lines | Not Started |

## Rollback Points
After each phase, code is stable and revertable:
- **Phase 1 complete**: Auth store has emailVerification state, not connected to UI
- **Phase 2 complete**: Hook and guard work, not integrated
- **Phase 3 complete**: Feature works end-to-end
- **Phase 4 complete**: Production ready

---

## Phase 1: Data Layer
**Goal**: Auth store extended with emailVerification state
**Testable**: Can see emailVerification in React DevTools after login
**Rollback**: Revert auth-store.ts changes only

### Task 1.1: Add EmailVerificationState Type
**File**: `src/stores/auth-store.ts` (MODIFY)
**Refs**: Design Data Models
**Details**:
```typescript
// Add interface (at top with other interfaces)
interface EmailVerificationState {
  isVerified: boolean
  requiresVerification: boolean
  verificationSentAt?: string
  allowedFeatures: string[]
  blockedFeatures: string[]
}

// Add to AuthState interface
emailVerification: EmailVerificationState | null

// Add to initialState
emailVerification: null,
```
**Risk**: Low (additive only)
**Status**: [ ] Not Started

### Task 1.2: Add emailVerification Actions and Selectors
**File**: `src/stores/auth-store.ts` (MODIFY)
**Refs**: Design Auth Store Changes
**Details**:
```typescript
// Add action
setEmailVerification: (emailVerification: EmailVerificationState | null) => {
  set({ emailVerification })
},

// Add selector (at bottom with other selectors)
export const selectEmailVerification = (state: AuthState) =>
  state.emailVerification

// Update processLoginResponse or equivalent to store emailVerification
// Look for where user data is set after login
```
**Risk**: Low (additive)
**Verify After**: Login still works, check console for emailVerification in store
**Status**: [ ] Not Started

---

## Phase 2: Access Control Layer
**Goal**: Hook and guard component created
**Testable**: Import and use hook in console/component
**Rollback**: Delete new files

### Task 2.1: Create useEmailVerification Hook
**File**: `src/hooks/useEmailVerification.ts` (NEW)
**Refs**: Design Hook Design, follows usePlanFeatures.tsx pattern
**Details**:
- Import useAuthStore, useMemo, useCallback
- Define blockedNavGroups array (11 groups)
- Define blockedRoutePatterns array
- Implement isNavGroupBlocked function
- Implement isRouteBlocked function
- Return: isVerified, requiresVerification, emailVerification, isNavGroupBlocked, isRouteBlocked, blockedNavGroups, blockedRoutePatterns
**Risk**: Low (new file)
**Status**: [ ] Not Started

### Task 2.2: Create EmailVerificationGuard Component
**File**: `src/components/auth/EmailVerificationGuard.tsx` (NEW)
**Refs**: Design Guard Component, follows PermissionGuard.tsx pattern
**Details**:
- Import useEmailVerification, useNavigate, useLocation, useEffect
- Import ROUTES from @/constants/routes
- Check if route is blocked for unverified user
- Redirect to ROUTES.auth.verifyEmailRequired with returnTo param
- Show fallback while redirecting
- Return children if allowed
**Risk**: Low (new file)
**Status**: [ ] Not Started

---

## Phase 3: Integration
**Goal**: Feature connected and working
**Testable**: Full user flow works
**Rollback**: Revert modified files

### Task 3.1: Integrate with Sidebar
**File**: `src/hooks/use-sidebar-data.ts` (MODIFY)
**Refs**: Design Sidebar Integration
**Details**:
```typescript
// Add import at top
import { useEmailVerification } from '@/hooks/useEmailVerification'

// In useSidebarData function, add:
const { isNavGroupBlocked } = useEmailVerification()

// In filterNavGroups function, add filter AFTER isNavGroupVisible:
.filter((group) => !isNavGroupBlocked(group.title))
```
**Risk**: Low (3 lines added)
**Verify After**: Login with unverified email, check sidebar shows only allowed items
**Status**: [ ] Not Started

### Task 3.2: Add 403 Interceptor
**File**: `src/services/authService.ts` (MODIFY)
**Refs**: Design API Interceptor
**Details**:
- Find existing response interceptor
- Add check for status 403 + code 'EMAIL_VERIFICATION_REQUIRED'
- Redirect to ROUTES.auth.verifyEmailRequired with returnTo param
**Risk**: Low (additive to existing interceptor)
**Verify After**: Blocked API calls redirect correctly
**Status**: [ ] Not Started

### Task 3.3: Update Login to Store emailVerification
**File**: `src/services/authService.ts` (MODIFY)
**Refs**: Backend API response structure
**Details**:
- Find where login response is processed (likely in verifyOtp or similar)
- After successful login, check if response.emailVerification exists
- Call authStore.setEmailVerification(response.emailVerification)
**Risk**: Low (additive)
**Verify After**: After login, emailVerification appears in auth store
**Status**: [ ] Not Started

---

## Phase 4: Verification
**Goal**: Production ready
**Testable**: All acceptance criteria met
**Rollback**: N/A (testing only)

### Task 4.1: End-to-End Testing
**Refs**: All acceptance criteria
**Details**:
- [ ] Login with unverified email works
- [ ] Sidebar shows only: Home, Productivity, Settings (partial)
- [ ] Blocked nav groups hidden: Messages, Clients, Sales, Business, Finance, Operations, Assets, Support, HR, Library, Excellence
- [ ] Direct URL to /dashboard/cases redirects to /verify-email-required
- [ ] Direct URL to /dashboard/tasks works normally
- [ ] Direct URL to /dashboard/finance/* redirects
- [ ] API 403 EMAIL_VERIFICATION_REQUIRED redirects
- [ ] After email verification, all nav groups appear
- [ ] No console errors
- [ ] TypeScript compiles: `npm run build`
**Risk**: N/A
**Status**: [ ] Not Started

---

## Completion Checklist
- [ ] All tasks completed
- [ ] TypeScript compiles (`npm run build`)
- [ ] No console errors
- [ ] Login flow works
- [ ] Unverified user sees limited sidebar
- [ ] Blocked routes redirect correctly
- [ ] 403 API errors redirect correctly
- [ ] Verified user sees full sidebar

## File Summary

### New Files (2)
| File | Lines |
|------|-------|
| `src/hooks/useEmailVerification.ts` | ~80 |
| `src/components/auth/EmailVerificationGuard.tsx` | ~60 |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/stores/auth-store.ts` | +25 lines (type, state, action, selector) |
| `src/hooks/use-sidebar-data.ts` | +4 lines (import, hook call, filter) |
| `src/services/authService.ts` | +20 lines (interceptor, login processing) |

## If Something Breaks
1. **Login broken**: Revert auth-store.ts changes
2. **Sidebar empty**: Check isVerified defaults, revert use-sidebar-data.ts
3. **Infinite redirect**: Check guard logic, revert EmailVerificationGuard.tsx
4. **403 not redirecting**: Check interceptor, revert authService.ts changes
