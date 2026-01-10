# Email Verification Feature-Based Blocking - Requirements

## Scale Assessment
**Type**: [x] Enterprise
**Estimated Files**: 8-12 modified, 2-3 new
**Risk Level**: Medium (auth flow changes, critical path)

## Problem Statement

Users with unverified emails can currently login but the system doesn't enforce feature-based restrictions. The backend NOW allows login regardless of email verification status and returns an `emailVerification` object with `allowedFeatures` and `blockedFeatures`. The frontend must:
1. Store this verification state
2. Block access to restricted features
3. Show appropriate UI feedback
4. Allow users to resend verification emails

## Target Users
- **Primary**: New users who registered but haven't verified their email
- **Secondary**: Existing users who changed their email and need to re-verify

---

## 🧠 Reasoning (Analysis Done)

### Codebase Research

| Searched For | Found | Decision |
|--------------|-------|----------|
| Auth store structure | `src/stores/auth-store.ts` - Has `isEmailVerified` selector but NO `emailVerification` state for `allowedFeatures/blockedFeatures` | Need to add `emailVerification` state |
| Sidebar navigation | `src/hooks/use-sidebar-data.ts` - Uses `canViewModule()` for permission filtering | Extend with email verification check |
| Route constants | `src/constants/routes.ts` - Comprehensive route definitions | Use for blocked route list |
| API interceptor | `src/services/authService.ts` - Has axios interceptors | Add 403 EMAIL_VERIFICATION_REQUIRED handling |
| Email verification banner | `src/components/email-verification-banner.tsx` - Already exists | Already integrated in authenticated-layout |
| Auth service | `src/services/authService.ts` - Has `requestVerificationEmail()` | Public endpoint ready |

### Existing Components to Reuse

| Component/File | Location | Purpose |
|----------------|----------|---------|
| `EmailVerificationBanner` | `src/components/email-verification-banner.tsx` | Shows warning banner |
| `useAuthStore` | `src/stores/auth-store.ts` | Auth state management |
| `selectIsEmailVerified` | `src/stores/auth-store.ts` | Check verification status |
| `canViewModule()` | `src/hooks/use-sidebar-data.ts` | Permission checking pattern |
| `ROUTES` | `src/constants/routes.ts` | Route constants |

### What's Missing (Need to Create/Modify)

| Component/File | Purpose | Depends On |
|----------------|---------|------------|
| `emailVerification` state in auth store | Store allowed/blocked features | Login response |
| `useEmailVerificationGuard` hook | Route protection logic | Auth store |
| `EmailVerificationRouteGuard` component | Route-level blocking | Guard hook |
| Navigation filtering for unverified users | Disable blocked nav items | Auth store |
| API interceptor update | Handle 403 EMAIL_VERIFICATION_REQUIRED | Auth store |

### Architecture Decision

**Chosen approach**: Extend existing permission system with email verification layer
- Add `emailVerification` state to auth store (similar pattern to existing `permissions`)
- Create a composable guard hook that checks verification status
- Filter sidebar navigation based on verification status (same pattern as module permissions)

**Why**:
- Follows existing codebase patterns
- Minimal changes to existing components
- Single source of truth in auth store

**Rejected alternatives**:
- Separate store for email verification (fragmentation, duplicate state)
- Middleware-only approach (no UI feedback)
- Component-level checks only (inconsistent, scattered logic)

### Risk Identification

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing auth flow | Low | High | Thorough testing of login/logout |
| Race condition on state update | Medium | Medium | Ensure sequential state updates |
| Sidebar flickering on load | Medium | Low | Skeleton loader during auth check |
| Token refresh not updating store | Low | High | Explicit store update after verify |

---

## 🏆 Enterprise Standards Compliance

### Security
- [x] Authentication: JWT with existing token refresh
- [x] Authorization: Feature-based access control per email verification
- [x] Data sensitivity: No PII exposed in blocked feature messages
- [x] Audit requirements: Log verification status changes

### Performance
- [x] Expected load: Normal user load
- [x] Response time SLA: < 50ms for feature check (local state)
- [x] Caching strategy: State persisted in localStorage via zustand persist

### Accessibility
- [x] WCAG 2.1 AA compliance for banner and blocked UI
- [x] RTL/Arabic support for all new text
- [x] Keyboard navigation for verification banner

### Compliance
- [x] PDPL requirements: Email verification for data protection
- [x] Data retention: Verification status stored with user
- [x] Consent required: User initiates verification

---

## User Stories

### 1. Unverified User Login with Feature Restrictions

As an unverified user, I want to log in and access basic features so that I can start using the application while completing email verification.

**Acceptance Criteria (EARS Format):**

1. WHEN user logs in with valid credentials AND email is not verified THEN the system SHALL allow login AND store `emailVerification` object containing `allowedFeatures` and `blockedFeatures` arrays in auth store

2. WHEN unverified user is logged in THEN the system SHALL display `EmailVerificationBanner` at the top of authenticated layout with options to resend verification

3. WHEN unverified user attempts to navigate to a blocked feature (cases, clients, billing, invoices, documents, integrations, team, reports, analytics, hr, crm-write) THEN the system SHALL redirect to a blocked feature page with message explaining verification requirement

4. WHEN unverified user views sidebar navigation THEN the system SHALL visually disable (gray out with lock icon) all blocked feature navigation items

5. WHEN unverified user clicks on a disabled navigation item THEN the system SHALL show a tooltip explaining "Verify your email to access this feature"

6. IF user is verified (isEmailVerified: true) THEN the system SHALL show all features normally without any restrictions

**Non-Functional Requirements:**
- Performance: Feature check < 50ms (local state lookup)
- Security: No feature data exposed for blocked features
- Accessibility: Screen reader announces blocked status

### 2. Email Verification Banner with Resend Option

As an unverified user, I want to see a prominent banner with a resend option so that I can easily request a new verification email.

**Acceptance Criteria (EARS Format):**

1. WHEN unverified user is on any authenticated page THEN the system SHALL display amber-colored email verification banner below the header

2. WHEN user clicks "Send Verification Link" button THEN the system SHALL call `authService.sendVerificationEmail()` AND show loading state AND disable button during request

3. WHEN verification email is sent successfully THEN the system SHALL update banner to show "Verification link sent! Check your inbox" AND change button to "Resend"

4. WHEN user attempts to resend within rate limit window THEN the system SHALL show cooldown timer (e.g., "Resend in 58s")

5. WHEN user clicks dismiss button THEN the system SHALL hide the banner for current session only (show again on next login)

6. WHEN API returns 429 (rate limited) THEN the system SHALL show remaining wait time from `waitSeconds` in response

**Non-Functional Requirements:**
- Performance: Button responsive within 100ms
- Security: Rate limiting enforced (backend controls)
- Accessibility: Focus returns to banner after action

### 3. Blocked Feature Route Guard

As a system, I want to prevent unverified users from accessing restricted routes so that feature access is enforced consistently.

**Acceptance Criteria (EARS Format):**

1. WHEN unverified user navigates directly to blocked route (via URL) THEN the system SHALL intercept navigation AND redirect to `/email-verification-required` page

2. WHEN unverified user receives 403 with code `EMAIL_VERIFICATION_REQUIRED` from API THEN the system SHALL redirect to blocked feature page with appropriate message

3. WHEN user successfully verifies email (via token in URL) THEN the system SHALL update auth store `emailVerification.isVerified` to true AND clear `blockedFeatures` array

4. WHEN user verifies email while logged in THEN the system SHALL immediately enable all previously blocked features without requiring page refresh

5. WHEN route guard checks feature access THEN the system SHALL compare route path against `blockedFeatures` array from auth store

**Non-Functional Requirements:**
- Performance: Route check < 10ms
- Security: Server-side verification remains authoritative
- Reliability: Graceful fallback if store state unclear

### 4. API Interceptor for Email Verification Errors

As a system, I want to handle 403 EMAIL_VERIFICATION_REQUIRED errors consistently so that users are guided to verify their email.

**Acceptance Criteria (EARS Format):**

1. WHEN any API call returns 403 with error code `EMAIL_VERIFICATION_REQUIRED` THEN the system SHALL redirect user to email verification required page

2. WHEN handling EMAIL_VERIFICATION_REQUIRED error THEN the system SHALL preserve the intended destination URL for post-verification redirect

3. WHEN error includes `blockedFeature` field THEN the system SHALL display which specific feature requires verification

4. WHEN user is on email verification required page THEN the system SHALL show clear message AND resend verification option AND link to go back

**Non-Functional Requirements:**
- Performance: Error handling < 50ms
- Security: No sensitive data in error messages
- UX: Clear, actionable error messages

### 5. Post-Verification Token Refresh

As a verified user, I want my session to immediately reflect my new verification status so that I can access all features without re-logging in.

**Acceptance Criteria (EARS Format):**

1. WHEN user completes email verification via token link THEN the system SHALL call backend to validate token AND update local auth store

2. WHEN verification succeeds THEN the system SHALL set `user.isEmailVerified = true` AND clear `emailVerification.blockedFeatures` AND show success message

3. WHEN verification succeeds AND user was previously blocked from a feature THEN the system SHALL redirect to dashboard (or original intended destination if available)

4. WHEN verification token is expired THEN the system SHALL show "Link expired" message AND offer to resend verification

5. WHEN verification token is invalid THEN the system SHALL show "Invalid link" message AND offer to resend verification

**Non-Functional Requirements:**
- Performance: Token verification < 2s
- Security: Single-use tokens, expire after 24h
- UX: Clear success/failure feedback

---

## Blocked vs Allowed Features Matrix

| Feature | Route Pattern | Unverified Access | Notes |
|---------|---------------|-------------------|-------|
| **ALLOWED** ||||
| Tasks | `/dashboard/tasks/*` | ✅ Yes | Core productivity |
| Reminders | `/dashboard/tasks/reminders/*` | ✅ Yes | Core productivity |
| Events | `/dashboard/tasks/events/*` | ✅ Yes | Core productivity |
| Gantt | `/dashboard/tasks/gantt` | ✅ Yes | Task visualization |
| Calendar | `/dashboard/calendar` | ✅ Yes | Scheduling |
| Notifications | `/dashboard/notifications/*` | ✅ Yes | System alerts |
| Profile (view) | `/dashboard/settings/profile` | ✅ Yes | User settings |
| **BLOCKED** ||||
| Cases | `/dashboard/cases/*` | ❌ No | Legal data |
| Clients | `/dashboard/clients/*` | ❌ No | Client PII |
| Billing | `/dashboard/finance/*` | ❌ No | Financial data |
| Invoices | `/dashboard/finance/invoices/*` | ❌ No | Financial data |
| Documents | `/dashboard/documents/*` | ❌ No | Sensitive docs |
| Integrations | `/dashboard/apps/*` | ❌ No | Third-party access |
| Team/Staff | `/dashboard/staff/*` | ❌ No | Team data |
| Reports | `/dashboard/reports/*` | ❌ No | Analytics |
| Analytics | `/dashboard/finance/reports/*` | ❌ No | Business data |
| HR | `/dashboard/hr/*` | ❌ No | Employee data |
| CRM (write) | POST/PUT/DELETE on CRM endpoints | ❌ No | Data modification |

---

## Edge Cases & Error Handling

| Scenario | Expected Behavior | Recovery Action |
|----------|-------------------|-----------------|
| User verifies email in different browser/tab | Current session checks on next API call OR page refresh | Poll or use websocket for real-time update |
| Network timeout on resend | Show "Failed to send" with retry button | Retry with exponential backoff |
| Verification link clicked while logged out | Show success message with login link | Redirect to login page |
| Rate limit exceeded on resend | Show cooldown timer from backend | Wait for timer, then enable button |
| Invalid/expired token | Show specific error message | Offer resend option |
| Backend returns unexpected blocked feature | Log warning, treat as blocked | Graceful degradation |
| Auth store not loaded yet | Show loading state | Wait for auth check completion |

---

## API Contract

### Login Response (Enhanced)

```json
{
  "success": true,
  "user": {
    "_id": "string",
    "email": "string",
    "isEmailVerified": false,
    "emailVerifiedAt": null,
    "emailVerification": {
      "isVerified": false,
      "requiresVerification": true,
      "allowedFeatures": ["tasks", "reminders", "events", "gantt", "calendar", "notifications"],
      "blockedFeatures": ["cases", "clients", "billing", "invoices", "documents", "integrations", "team", "reports", "analytics", "hr", "crm-write"],
      "verificationSentAt": "2024-01-15T10:30:00Z",
      "canResendAfter": "2024-01-15T10:31:00Z"
    }
  }
}
```

### 403 Email Verification Required Response

```json
{
  "success": false,
  "error": true,
  "code": "EMAIL_VERIFICATION_REQUIRED",
  "message": "يجب تأكيد البريد الإلكتروني للوصول لهذه الميزة",
  "messageEn": "Email verification required to access this feature",
  "blockedFeature": "cases",
  "verificationSentAt": "2024-01-15T10:30:00Z"
}
```

---

## Testing Requirements

### Unit Tests
- [ ] Auth store `emailVerification` state management
- [ ] Route guard logic for blocked/allowed features
- [ ] Sidebar filtering for unverified users
- [ ] Banner component states (default, sent, cooldown, error)

### Integration Tests
- [ ] Login flow with unverified email
- [ ] Route blocking on direct navigation
- [ ] API interceptor handling 403
- [ ] Verification token processing

### E2E Tests
- [ ] Complete flow: Register -> Login unverified -> Blocked features -> Verify -> Access enabled
- [ ] Resend verification with rate limiting
- [ ] Cross-browser: Chrome, Safari, Firefox
- [ ] Mobile responsive testing
- [ ] RTL layout testing

### Accessibility Tests
- [ ] axe-core automated scan on banner
- [ ] Screen reader testing for disabled nav items
- [ ] Keyboard navigation for all interactive elements

---

## Implementation Files

### Files to Modify

| File | Changes |
|------|---------|
| `src/stores/auth-store.ts` | Add `emailVerification` state, selectors, update login action |
| `src/services/authService.ts` | Update login response type, add interceptor for 403 |
| `src/hooks/use-sidebar-data.ts` | Add email verification check to `canViewModule()` |
| `src/components/email-verification-banner.tsx` | Already exists, may need minor updates |
| `src/features/auth/email-verification/index.tsx` | Update to handle token refresh and store update |

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useEmailVerificationGuard.ts` | Hook for feature access checking |
| `src/components/auth/email-verification-route-guard.tsx` | Route guard component |
| `src/constants/email-verification.ts` | Blocked/allowed feature constants |

---

## Out of Scope (Future)
- Real-time verification status updates via WebSocket (can add later)
- Email change requiring re-verification (separate feature)
- Admin override for verification requirement
- Progressive verification levels (phone + email)

## Open Questions
- [x] Backend returns emailVerification object - Confirmed
- [x] Backend allows login with unverified email - Confirmed
- [x] Public resend endpoint available - Confirmed (`/auth/request-verification-email`)

## Dependencies
- **Existing**: Auth store, sidebar hook, email verification banner
- **Backend**: Login response with `emailVerification` object, 403 response with `EMAIL_VERIFICATION_REQUIRED` code
