# Feature Access Contract Sync - Requirements

## Scale Assessment
**Type**: [x] Standard
**Estimated Files**: 1 new, 3 modified
**Risk Level**: Medium (breaking changes to redirect URLs if not handled carefully)

## Problem Statement

The frontend feature access implementation has drifted from the backend contract. This causes:
1. **Redirect mismatches**: Frontend uses `/sign-in` and `/verify-email-required`, backend expects `/login` and `/verify-email`
2. **Missing features**: Frontend only defines 14 features requiring email verification, backend has 34
3. **Missing subscription statuses**: Frontend doesn't handle `paused` and `incomplete` statuses
4. **Missing knowledge features**: `knowledge_categories` and `knowledge_search` not defined
5. **Missing always-allowed features**: `upgrade` and `health` features missing

## Codebase Research

| Searched For | Found | Decision |
|--------------|-------|----------|
| Feature access types | `src/types/featureAccess.ts` | Modify to match backend |
| Feature access hook | `src/hooks/useFeatureAccess.ts` | Minor updates for redirects |
| Routes constants | `src/constants/routes.ts` | Already correct (uses `/sign-in`, `/verify-email-required`) |
| Backend contract | Provided in audit report | Use as source of truth |

### Key Finding: Route Mismatch Analysis

**Current Frontend Routes (ROUTES constant):**
- Login: `ROUTES.auth.signIn` = `/sign-in`
- Verify Email: `ROUTES.auth.verifyEmailRequired` = `/verify-email-required`
- Billing: `ROUTES.dashboard.settings.billing` = `/dashboard/settings/billing`

**Backend Contract Expects:**
- Login: `/login`
- Verify Email: `/verify-email`
- Billing: `/settings/billing`

**Decision**: The frontend routes are CORRECT for this application. The backend contract paths are generic API paths. The frontend should **use its own ROUTES constants** (which are correct), NOT the backend contract paths directly. The API interceptor should map backend `redirectTo` values to frontend ROUTES.

## User Stories

### Story 1: Complete Feature Matrix Sync
As a **developer**, I want the frontend feature access matrix to include ALL backend features, so that the UI correctly hides/shows navigation for all modules.

**Acceptance Criteria (EARS Format):**
1. WHEN a user accesses any of the 34 email-verified features, THEN the system SHALL check against the complete FEATURE_ACCESS matrix
2. WHEN a feature is not in the FEATURE_ACCESS matrix, THEN the system SHALL deny access (fail-closed)
3. WHEN the backend adds new features, THEN the frontend matrix SHALL be easily extendable

### Story 2: Subscription Status Completeness
As a **user with paused/incomplete subscription**, I want appropriate handling, so that I understand my access limitations.

**Acceptance Criteria (EARS Format):**
1. WHEN user has `paused` subscription status, THEN the system SHALL treat them as VERIFIED_FREE (no active subscription)
2. WHEN user has `incomplete` subscription status, THEN the system SHALL treat them as VERIFIED_FREE (payment not complete)
3. WHEN backend returns unknown subscription status, THEN the system SHALL default to VERIFIED_FREE (fail-safe)

### Story 3: Knowledge Center Feature Completeness
As a **paid subscriber**, I want access to all knowledge center features, so that I can use the complete knowledge base.

**Acceptance Criteria (EARS Format):**
1. WHEN user is VERIFIED_PAID, THEN the system SHALL allow access to `knowledge_center`, `knowledge_articles`, `knowledge_categories`, and `knowledge_search`
2. WHEN user is not VERIFIED_PAID, THEN the system SHALL block all knowledge center features

### Story 4: Always Allowed Features Completeness
As an **authenticated user**, I want access to basic features regardless of verification/subscription, so that I can upgrade and check system health.

**Acceptance Criteria (EARS Format):**
1. WHEN user is authenticated (any state except ANONYMOUS), THEN the system SHALL allow access to `auth`, `profile_view`, `billing_view`, `notifications`, `upgrade`, and `health`
2. WHEN user accesses upgrade page, THEN the system SHALL show billing options regardless of current state

### Story 5: Tier-Specific Features Documentation
As a **developer**, I want tier-specific features documented, so that future enterprise features are properly gated.

**Acceptance Criteria (EARS Format):**
1. WHEN implementing SSO/SAML, THEN the system SHALL require `enterprise` tier
2. WHEN implementing audit logs, THEN the system SHALL require `professional` or `enterprise` tier
3. WHEN implementing custom branding/IP whitelist, THEN the system SHALL require `enterprise` tier

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unknown feature accessed | Deny access (fail-closed), warn in dev mode |
| `paused` subscription status | Treat as VERIFIED_FREE |
| `incomplete` subscription status | Treat as VERIFIED_FREE |
| Backend returns unmapped `redirectTo` | Use frontend's equivalent ROUTES constant |
| Active subscription + unverified email | Grant VERIFIED_PAID (business rule: don't block paying customers) |
| PAST_DUE + tasks access | Allow (tasks don't require verification) |

## Out of Scope
- Changing frontend route URLs (they are application-specific and correct)
- Creating shared contract package between frontend/backend
- Automated contract verification CI pipeline

## Technical Notes

### Files to Modify

1. **`src/types/featureAccess.ts`**
   - Add 20 missing email-verification features
   - Add 2 missing knowledge features
   - Add 2 missing always-allowed features
   - Add `paused` and `incomplete` to subscription status type
   - Add tier-specific features documentation

2. **`src/hooks/useFeatureAccess.ts`**
   - Handle `paused` and `incomplete` subscription statuses in `userState` calculation

3. **`src/lib/api.ts`** (if needed)
   - Ensure error handler maps backend `redirectTo` to frontend ROUTES

### Features to Add to FEATURE_ACCESS Matrix

**Always Allowed (add):**
- `upgrade`
- `health`

**Email Verification Required (add):**
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

**Paid Subscription Required (add):**
- `knowledge_categories`
- `knowledge_search`

**Tier-Specific (document only):**
- `sso` - enterprise
- `saml` - enterprise
- `audit_logs` - professional, enterprise
- `custom_branding` - enterprise
- `ip_whitelist` - enterprise

### Subscription Status Type Update

```typescript
subscription: {
  status: 'none' | 'trial' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused' | 'incomplete'
  tier: 'free' | 'starter' | 'professional' | 'enterprise'
  requiresSubscription: boolean
}
```

## Open Questions
- None - all decisions documented above

## Verification Checklist
- [ ] All 55 features in correct category
- [ ] Subscription status type includes all 8 values
- [ ] Unknown features are DENIED (fail-closed)
- [ ] Build passes with no TypeScript errors
- [ ] Dev console shows warnings for unknown features in dev mode
