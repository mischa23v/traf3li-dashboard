# Unified Feature Access System - Frontend Integration - Implementation Tasks

## Phase Summary

| Phase | Goal | Tasks | Status |
|-------|------|-------|--------|
| 1 | Data Layer | 3 | Not Started |
| 2 | Core Integration | 4 | Not Started |
| 3 | Component Updates | 3 | Not Started |
| 4 | Verification | 2 | Not Started |

**Total**: 12 tasks across 4 phases

---

## Phase 1: Data Layer
**Goal**: Types, enums, and new hook working
**Verify**: Can import types and call hook without errors

### Task 1.1: Create Feature Access Types
**File**: `src/types/featureAccess.ts` (NEW)
**Details**:
- Create `UserState` enum (7 states)
- Create `RequiredActionType` enum
- Create `RequiredAction` interface
- Create `FeatureAccessDeniedResponse` interface
- Create `FEATURE_ACCESS` matrix constant
- Create `BLOCKED_NAV_GROUPS_UNVERIFIED` constant
- Create `BLOCKED_NAV_GROUPS_UNSUBSCRIBED` constant
**Status**: [ ] Not Started

### Task 1.2: Create useFeatureAccess Hook
**File**: `src/hooks/useFeatureAccess.ts` (NEW)
**Details**:
- Import types from featureAccess.ts
- Implement `getUserState()` logic (from user + subscription)
- Implement `canAccess(feature)` function
- Implement `isNavGroupBlocked(navGroupKey)` function
- Implement `getRequiredAction(feature)` function
- Export backwards-compatible properties (`isVerified`, `emailVerification`)
**Status**: [ ] Not Started

### Task 1.3: Update Auth Store Types
**File**: `src/stores/auth-store.ts` (MODIFY)
**Details**:
- Remove `allowedFeatures: string[]` from `EmailVerificationState` interface (line 22)
- Remove `blockedFeatures: string[]` from `EmailVerificationState` interface (line 23)
- Keep `isVerified`, `requiresVerification`, `verificationSentAt`
**Status**: [ ] Not Started

---

## Phase 2: Core Integration
**Goal**: API interceptor handles new error code, services updated
**Verify**: 403 FEATURE_ACCESS_DENIED shows correct toast

### Task 2.1: Update API Interceptor (apiClient)
**File**: `src/lib/api.ts` (MODIFY lines 1278-1305)
**Details**:
- Import types from `@/types/featureAccess`
- Add handler for `FEATURE_ACCESS_DENIED` code
- Keep backwards compat for `EMAIL_VERIFICATION_REQUIRED`
- Implement `handleFeatureAccessDenied()` helper function
- Show toast with action button based on `requiredAction.type`
- Use bilingual messages (`message`/`messageAr`)
**Status**: [ ] Not Started

### Task 2.2: Update API Interceptor (apiClientNoVersion)
**File**: `src/lib/api.ts` (MODIFY lines 1771-1797)
**Details**:
- Same changes as Task 2.1 for the second interceptor
- Share `handleFeatureAccessDenied()` helper between both
**Status**: [ ] Not Started

### Task 2.3: Update AuthService Types
**File**: `src/services/authService.ts` (MODIFY)
**Details**:
- Update `EmailVerificationState` interface to match auth-store.ts
- Remove `allowedFeatures` and `blockedFeatures` properties
**Status**: [ ] Not Started

### Task 2.4: Deprecate useEmailVerification
**File**: `src/hooks/useEmailVerification.ts` (MODIFY)
**Details**:
- Add `@deprecated` JSDoc comment
- Re-export from `useFeatureAccess` for backwards compatibility
- Map old properties to new ones
**Status**: [ ] Not Started

---

## Phase 3: Component Updates
**Goal**: Sidebar and guard use new hook
**Verify**: Nav groups filter correctly, guard redirects work

### Task 3.1: Update Sidebar Data Hook
**File**: `src/hooks/use-sidebar-data.ts` (MODIFY)
**Details**:
- Replace import of `useEmailVerification` with `useFeatureAccess` (line 30)
- Update usage of `isNavGroupBlocked` (line 69)
- No logic changes needed (same function signature)
**Status**: [ ] Not Started

### Task 3.2: Update Email Verification Guard
**File**: `src/components/auth/EmailVerificationGuard.tsx` (MODIFY)
**Details**:
- Replace import of `useEmailVerification` with `useFeatureAccess`
- Update hook usage to use new properties
- Add optional `feature` prop for feature-specific guarding
- Keep existing route-based blocking logic for backwards compat
**Status**: [ ] Not Started

### Task 3.3: Update Verify Email Required Page
**File**: `src/features/auth/email-verification/verify-email-required.tsx` (MODIFY)
**Details**:
- Add support for `action` URL parameter
- Show different UI based on action type (verify_email, subscribe, retry_payment)
- Update bilingual text for each action type
- Add "returnTo" support for post-action navigation
**Status**: [ ] Not Started

---

## Phase 4: Verification
**Goal**: Build passes, feature works end-to-end
**Verify**: No TypeScript errors, RTL/LTR works

### Task 4.1: TypeScript Build Check
**Run**: `npm run build`
**Details**:
- Fix any TypeScript errors
- Ensure all imports resolve
- No unused variables
**Status**: [ ] Not Started

### Task 4.2: Manual Testing & RTL Check
**Details**:
- Test in browser: Login with unverified user
- Test in browser: Access blocked feature (e.g., /dashboard/cases)
- Verify toast shows with correct action button
- Test Arabic language - verify RTL layout
- Test action button navigation
**Status**: [ ] Not Started

---

## Execution Notes

### Order of Operations
1. Phase 1 must complete before Phase 2 (types needed)
2. Phase 2 must complete before Phase 3 (hook needed)
3. Phase 3 can be partially parallel
4. Phase 4 is final verification

### Rollback Plan
If issues arise:
- `useEmailVerification` remains functional (deprecated but working)
- Old `EMAIL_VERIFICATION_REQUIRED` code path maintained
- No database changes to revert

### Success Criteria
- [ ] `npm run build` passes
- [ ] Login without `allowedFeatures`/`blockedFeatures` works
- [ ] 403 `FEATURE_ACCESS_DENIED` shows correct toast
- [ ] Toast action navigates to `requiredAction.redirectTo`
- [ ] Sidebar hides blocked nav groups for unverified users
- [ ] RTL/LTR works for all toast messages
