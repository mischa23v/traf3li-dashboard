# Feature Access Contract Sync - Implementation Tasks

## Phase Summary
| Phase | Goal | Tasks | Status |
|-------|------|-------|--------|
| 1 | Types Update | 2 |  Complete |
| 2 | Hook Update | 1 |  Complete |
| 3 | Verification | 1 |  Complete |

**Total**: 4 tasks (simple data sync, no UI changes)

---

## Phase 1: Types Update
**Goal**: Update featureAccess.ts with all missing features and types
**Verify**: TypeScript compiles with no errors

### Task 1.1: Update Subscription Status Type
**File**: `src/types/featureAccess.ts` (MODIFY)
**Details**:
- Add `paused` and `incomplete` to subscription status union type in `FeatureAccessDeniedResponse`
- Location: ~line 59

**Change**:
```typescript
// FROM:
status: 'none' | 'trial' | 'trialing' | 'active' | 'past_due' | 'canceled'

// TO:
status: 'none' | 'trial' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused' | 'incomplete'
```

**Status**: [x] Complete

---

### Task 1.2: Update FEATURE_ACCESS Matrix
**File**: `src/types/featureAccess.ts` (MODIFY)
**Details**:
Add 24 missing features to FEATURE_ACCESS matrix:

**Always Allowed (add 2)**:
- `upgrade`
- `health`

**Email Verification Required (add 21)**:
- `billing_manage`
- `automation`
- `webhooks`
- `api_access`
- `legal_documents`
- `matters`
- `payments`
- `expenses`
- `retainers`
- `statements`
- `contracts`
- `leads`
- `territories`
- `sales`
- `payroll`
- `leave`
- `attendance`
- `workflow`
- `files`
- `storage`
- `dashboard`

**Paid Subscription Required (add 2)**:
- `knowledge_categories`
- `knowledge_search`

**Also add**: JSDoc comment documenting tier-specific features (sso, saml, audit_logs, custom_branding, ip_whitelist) for future reference.

**Status**: [x] Complete

---

## Phase 2: Hook Update
**Goal**: Handle new subscription statuses in userState calculation
**Verify**: Hook correctly maps paused/incomplete to FREE tier

### Task 2.1: Handle paused/incomplete Statuses
**File**: `src/hooks/useFeatureAccess.ts` (MODIFY)
**Details**:
- Add handling for `paused` and `incomplete` subscription statuses
- Location: userState useMemo, before the free tier fallback (~line 123-128)
- Both statuses should map to VERIFIED_FREE or UNVERIFIED_FREE based on email status

**Change**:
```typescript
// Add BEFORE the free tier fallback:
// Handle paused/incomplete as no active subscription
if (subStatus === 'paused' || subStatus === 'incomplete') {
  return isEmailVerified ? UserState.VERIFIED_FREE : UserState.UNVERIFIED_FREE
}
```

**Status**: [x] Complete

---

## Phase 3: Verification
**Goal**: Ensure everything works correctly
**Verify**: Build passes, no console errors

### Task 3.1: Build Verification
**Run**: `npm run build`
**Details**:
- Verify TypeScript compiles with no errors
- Verify no unused imports or variables
- Check dev console for any warnings about unknown features

**Acceptance Criteria**:
- [x] `npm run build` completes successfully
- [x] No TypeScript errors
- [x] Feature count matches: 6 always + 6 no-verification + 35 verification + 4 paid = 51 features

**Status**: [x] Complete

---

## Execution Order

```
Task 1.1 (subscription status type)
    ↓
Task 1.2 (FEATURE_ACCESS matrix)
    ↓
Task 2.1 (hook status handling)
    ↓
Task 3.1 (build verification)
```

## Notes

- **No UI changes**: This is purely type/logic sync
- **No RTL/LTR testing needed**: No UI components affected
- **Backwards compatible**: Only adding features, not removing
- **Fail-closed preserved**: Unknown features still denied by default
