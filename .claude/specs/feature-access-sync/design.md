# Feature Access Contract Sync - Technical Design

## Overview
Sync the frontend feature access system with the backend contract by adding 24 missing features to the access matrix, handling 2 additional subscription statuses (`paused`, `incomplete`), and documenting tier-specific enterprise features.

## Impact Summary
| Type | Count | Risk |
|------|-------|------|
| New files | 0 | - |
| Modified files | 2 | Low |
| Total tasks | 4 | - |

## Architecture

### No Structural Changes
This is a **data sync** task, not an architectural change. The existing architecture is correct:

```
useFeatureAccess() hook
 Reads user state from auth-store
 Calculates UserState enum (7 states)
 Uses FEATURE_ACCESS matrix for access checks
 Returns canAccess(), isNavGroupBlocked(), getRequiredAction()
```

### Data Flow (unchanged)
```
User Login → Auth Store → useFeatureAccess() → UI Components
     ↓
API 403 → Error Handler → Shows toast with action → Redirect
```

## Data Models

### Updated TypeScript Interfaces

#### FeatureAccessDeniedResponse (update subscription.status)
```typescript
// src/types/featureAccess.ts - line ~59
subscription: {
  status: 'none' | 'trial' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused' | 'incomplete'
  //                                                               ^^^^^^^^   ^^^^^^^^^^^ ADD THESE
  tier: 'free' | 'starter' | 'professional' | 'enterprise'
  requiresSubscription: boolean
}
```

### Updated FEATURE_ACCESS Matrix

#### Group 1: Always Allowed (6 features)
```typescript
// Any authenticated user (all states except ANONYMOUS)
const ALWAYS_ALLOWED_STATES = [
  UserState.UNVERIFIED_FREE,
  UserState.UNVERIFIED_TRIAL,
  UserState.VERIFIED_FREE,
  UserState.VERIFIED_TRIAL,
  UserState.VERIFIED_PAID,
  UserState.PAST_DUE,
]

// Features:
auth: ALWAYS_ALLOWED_STATES,
profile_view: ALWAYS_ALLOWED_STATES,
billing_view: ALWAYS_ALLOWED_STATES,
notifications: ALWAYS_ALLOWED_STATES,
upgrade: ALWAYS_ALLOWED_STATES,      // ADD
health: ALWAYS_ALLOWED_STATES,       // ADD
```

#### Group 2: No Verification Required (6 features)
```typescript
// Allowed without email verification (but not PAST_DUE)
const NO_VERIFICATION_STATES = [
  UserState.UNVERIFIED_FREE,
  UserState.UNVERIFIED_TRIAL,
  UserState.VERIFIED_FREE,
  UserState.VERIFIED_TRIAL,
  UserState.VERIFIED_PAID,
]

// Features (existing - no changes):
tasks, reminders, events, calendar, appointments, gantt
```

#### Group 3: Email Verification Required (34 features)
```typescript
// Requires verified email
const VERIFIED_STATES = [
  UserState.VERIFIED_FREE,
  UserState.VERIFIED_TRIAL,
  UserState.VERIFIED_PAID,
]

// EXISTING (14):
cases, clients, contacts, invoices, documents, templates,
team, integrations, reports, analytics, settings, crm, hr

// ADD (21):
billing_manage, automation, webhooks, api_access, legal_documents,
matters, payments, expenses, retainers, statements, contracts,
leads, territories, sales, payroll, leave, attendance, workflow,
files, storage, dashboard
```

#### Group 4: Paid Subscription Required (4 features)
```typescript
// Requires active paid subscription
const PAID_ONLY_STATES = [UserState.VERIFIED_PAID]

// EXISTING (2):
knowledge_center, knowledge_articles

// ADD (2):
knowledge_categories, knowledge_search
```

#### Group 5: Tier-Specific (5 features - documented, not implemented)
```typescript
/**
 * TIER-SPECIFIC FEATURES (Future Implementation)
 * These features require specific subscription tiers.
 * Documented here for future implementation reference.
 *
 * Enterprise Tier Only:
 * - sso: Single Sign-On integration
 * - saml: SAML authentication
 * - custom_branding: Custom branding/white-label
 * - ip_whitelist: IP whitelist restrictions
 *
 * Professional or Enterprise Tier:
 * - audit_logs: Audit log access
 */
```

## Subscription Status Handling

### useFeatureAccess Hook Updates

```typescript
// src/hooks/useFeatureAccess.ts - userState calculation

// Current handling:
if (subStatus === 'past_due') return UserState.PAST_DUE
if (subStatus === 'active') return UserState.VERIFIED_PAID
if (subStatus === 'trial' || subStatus === 'trialing') return isEmailVerified ? UserState.VERIFIED_TRIAL : UserState.UNVERIFIED_TRIAL

// ADD handling for paused/incomplete:
// These are treated as "no active subscription" - user falls to FREE tier
if (subStatus === 'paused' || subStatus === 'incomplete') {
  // Paused: Admin paused the subscription (still has account)
  // Incomplete: Payment setup not finished
  // Both cases: treat as free tier (can still use basic features)
  return isEmailVerified ? UserState.VERIFIED_FREE : UserState.UNVERIFIED_FREE
}
```

## Files to Modify

### File 1: `src/types/featureAccess.ts`

| Section | Change | Lines |
|---------|--------|-------|
| FeatureAccessDeniedResponse | Add `paused`, `incomplete` to status union | ~59 |
| FEATURE_ACCESS | Add `upgrade`, `health` to always-allowed | After line 105 |
| FEATURE_ACCESS | Add 21 email-verified features | After line 165 |
| FEATURE_ACCESS | Add `knowledge_categories`, `knowledge_search` | After line 168 |
| JSDoc comment | Add tier-specific features documentation | End of file |

### File 2: `src/hooks/useFeatureAccess.ts`

| Section | Change | Lines |
|---------|--------|-------|
| userState useMemo | Add `paused`, `incomplete` handling before free tier fallback | ~123-128 |

## API Endpoints
No API changes required. This is frontend-only sync.

## State Management
No state management changes required. Using existing auth-store.

## Error Handling
No error handling changes. Existing fail-closed pattern is correct.

## RTL/LTR Notes
No UI changes. This is type/logic only.

## Testing Strategy

### Manual Verification
1. Build passes: `npm run build`
2. TypeScript: No errors
3. Dev mode: Unknown features show console warnings

### Feature Access Matrix Verification
| User State | Should Access | Should NOT Access |
|------------|---------------|-------------------|
| ANONYMOUS | Nothing | Everything |
| UNVERIFIED_FREE | tasks, calendar, upgrade | cases, clients, knowledge |
| VERIFIED_FREE | tasks, cases, clients | knowledge_center |
| VERIFIED_PAID | Everything | Nothing (except tier features) |
| PAST_DUE | auth, billing_view, upgrade | tasks (debatable - check requirement) |

**Note**: Requirements say PAST_DUE can access tasks. Verify this is correct business logic.

## Migration Notes
- No database migrations
- No API changes
- Backwards compatible (adding features, not removing)
- No user-facing changes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing feature in matrix | Low | Medium | Fail-closed design denies unknown features |
| Wrong state mapping | Low | Medium | Unit test state calculation |
| Type error from new statuses | Low | Low | TypeScript will catch |

## Implementation Order

1. **Types first**: Update `featureAccess.ts` with all features and types
2. **Hook second**: Update `useFeatureAccess.ts` with status handling
3. **Build verification**: Run `npm run build` to catch any issues
4. **Manual test**: Verify in browser with different user states
