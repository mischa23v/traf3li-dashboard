# BFF-Style httpOnly Cookie Authentication - Requirements

## Scale Assessment
**Type**: [x] Enterprise
**Estimated Files**: 0 new, 8 modified
**Risk Level**: High (security-critical auth system)

## Problem Statement
The frontend currently stores tokens in localStorage and reads them from API response bodies. This is vulnerable to XSS attacks. The backend has been updated to:
1. Set tokens as httpOnly cookies (browser can't read them)
2. NOT return tokens in response body anymore

The frontend must be updated to work with this new BFF-style pattern.

## Target Users
- Primary: All authenticated users
- Secondary: Security/compliance team

---

## 🧠 Reasoning (Analysis Done)

### Codebase Research

| Searched For | Found | Decision |
|--------------|-------|----------|
| `localStorage.*[Tt]oken` | 8 source files | Must remove all token storage |
| `withCredentials: true` | Already set in api.ts | Keep, verify all calls use it |
| `response.data.accessToken` | 8 service files | Must handle undefined tokens |
| `storeTokens()` | api.ts:323 | Update to not store refresh token |
| `getRefreshToken()` | api.ts:177 | Deprecate (can't read httpOnly) |

### Files That Must Change

| File | Current Behavior | New Behavior |
|------|------------------|--------------|
| `src/lib/api.ts` | Stores tokens in localStorage | Store only expiresAt in memory |
| `src/services/authService.ts` | Reads tokens from response | Use expiresIn, ignore tokens |
| `src/services/oauthService.ts` | Stores tokens after OAuth | Use expiresIn only |
| `src/services/mfaService.ts` | Stores tokens after MFA verify | Use expiresIn only |
| `src/services/phoneAuthService.ts` | Stores tokens after phone auth | Use expiresIn only |
| `src/services/ldapService.ts` | Stores tokens after LDAP | Use expiresIn only |
| `src/services/anonymousAuthService.ts` | Stores tokens for anon | Use expiresIn only |
| `src/services/firmService.ts` | Stores token on firm switch | Use expiresIn only |

### Architecture Decision
**Chosen approach**: Option A - httpOnly cookies only, expiresAt in memory for refresh scheduling
**Why**:
- Matches Auth0/AWS/Google patterns
- Most secure (no tokens accessible to JS)
- Backend already implemented
**Rejected alternatives**:
- Full BFF proxy (Next.js server actions) - overkill, requires framework migration
- Keep localStorage - insecure, doesn't match new backend

---

## 🏆 Enterprise Standards Compliance

### Security (OWASP Compliant)
- [x] Authentication: httpOnly cookies (XSS-proof)
- [x] Authorization: Existing RBAC unchanged
- [x] Data sensitivity: Tokens never in JS memory
- [x] Audit requirements: Backend logs auth events

### Performance
- [x] Expected load: No change (same request pattern)
- [x] Response time SLA: < 200ms for /auth/refresh
- [x] Caching strategy: expiresAt in memory for refresh scheduling

### Accessibility
- [x] N/A - No UI changes

### Compliance
- [x] OWASP: httpOnly, Secure, SameSite cookies
- [x] PDPL/GDPR: Tokens not stored client-side

---

## User Stories

### 1. Secure Login
As a user, I want my authentication tokens stored securely so that XSS attacks cannot steal my session.

**Acceptance Criteria (EARS Format):**
1. WHEN user logs in successfully THEN the system SHALL receive user data and expiresIn from response body
2. WHEN user logs in successfully THEN the system SHALL NOT receive accessToken or refreshToken in response body
3. WHEN user logs in successfully THEN the system SHALL store expiresAt in memory (not localStorage)
4. WHEN user logs in successfully THEN the system SHALL set isAuthenticated to true
5. WHEN login fails THEN the system SHALL display appropriate error message

**Non-Functional Requirements:**
- Security: Tokens exist only in httpOnly cookies
- Performance: Login completes in < 500ms

### 2. Automatic Token Refresh
As a user, I want my session to refresh automatically so that I stay logged in without interruption.

**Acceptance Criteria (EARS Format):**
1. WHEN access token expires in < 60 seconds THEN the system SHALL call /auth/refresh
2. WHEN /auth/refresh is called THEN the system SHALL send credentials: 'include' (cookie auto-attached)
3. WHEN /auth/refresh is called THEN the system SHALL NOT send token in request body
4. WHEN /auth/refresh succeeds THEN the system SHALL update expiresAt from response.expiresIn
5. WHEN /auth/refresh fails with 401 THEN the system SHALL redirect to login page
6. WHEN multiple 401s occur simultaneously THEN the system SHALL deduplicate refresh requests

**Non-Functional Requirements:**
- Performance: Refresh completes in < 200ms
- Reliability: Exponential backoff on transient failures

### 3. Secure Logout
As a user, I want logout to clear all auth state so that my session is fully terminated.

**Acceptance Criteria (EARS Format):**
1. WHEN user clicks logout THEN the system SHALL call /auth/logout with credentials: 'include'
2. WHEN logout succeeds THEN the system SHALL clear all memory state (expiresAt, user)
3. WHEN logout succeeds THEN the system SHALL clear localStorage (auth-storage, user cache)
4. WHEN logout succeeds THEN the system SHALL redirect to /sign-in
5. WHEN user logs out in Tab A THEN Tab B SHALL detect and sync logout

**Non-Functional Requirements:**
- Security: httpOnly cookies cleared by backend
- UX: Logout completes in < 300ms

### 4. OAuth/SSO Login
As a user, I want to login with Google/SSO so that I can use my existing account.

**Acceptance Criteria (EARS Format):**
1. WHEN OAuth callback returns successfully THEN the system SHALL receive user data and expires_in
2. WHEN OAuth callback returns THEN the system SHALL NOT expect tokens in response body
3. WHEN OAuth succeeds THEN the system SHALL store expiresAt in memory
4. WHEN OAuth fails THEN the system SHALL redirect to /sign-in with error

**Non-Functional Requirements:**
- Security: Tokens in httpOnly cookies only

### 5. MFA/Phone/LDAP Auth
As a user, I want secondary auth methods to work the same way so that security is consistent.

**Acceptance Criteria (EARS Format):**
1. WHEN MFA verify succeeds THEN the system SHALL receive expires_in (no tokens)
2. WHEN phone OTP verify succeeds THEN the system SHALL receive expires_in (no tokens)
3. WHEN LDAP login succeeds THEN the system SHALL receive expires_in (no tokens)
4. WHEN any auth succeeds THEN the system SHALL store expiresAt in memory

---

## Edge Cases & Error Handling

| Scenario | Expected Behavior | Recovery Action |
|----------|-------------------|-----------------|
| Backend returns tokens in body (legacy) | Ignore tokens, use expiresIn only | Log warning, continue |
| expiresIn missing from response | Default to 15 minutes (900s) | Log warning |
| Refresh fails with 401 | Clear state, redirect to login | Show "Session expired" toast |
| Refresh fails with 5xx | Retry with exponential backoff | After 3 retries, show error |
| Cookie not sent (CORS issue) | 401 on all requests | Show "Auth configuration error" |
| Cross-tab logout | Detect via storage event | Clear local state, redirect |

---

## API Contract

### New Response Format (Backend Updated)

| Endpoint | Old Response | New Response |
|----------|--------------|--------------|
| POST /auth/login | `{ accessToken, refreshToken, user }` | `{ expiresIn, user }` |
| POST /auth/refresh | `{ accessToken, expiresIn }` | `{ expiresIn, refreshedAt }` |
| POST /auth/sso/callback | `{ access_token, refresh_token, user }` | `{ expires_in, user }` |
| POST /auth/otp/verify | `{ accessToken, refreshToken, user }` | `{ expires_in, user }` |
| POST /auth/phone/verify-otp | `{ accessToken, refreshToken, user }` | `{ expires_in, user }` |
| POST /auth/ldap/login | `{ accessToken, refreshToken, user }` | `{ expires_in, user }` |

### Cookie Configuration (Set by Backend)

| Cookie | HttpOnly | Secure | SameSite | Path | Max-Age |
|--------|----------|--------|----------|------|---------|
| accessToken | ✅ Yes | ✅ Prod | Lax | / | 15 min |
| refresh_token | ✅ Yes | ✅ Prod | Lax | /api/auth | 7-30 days |

---

## Testing Requirements

### Unit Tests
- [ ] storeTokens() ignores refreshToken parameter
- [ ] performTokenRefresh() sends empty body
- [ ] clearTokens() clears memory state
- [ ] Auth handlers work with undefined tokens

### Integration Tests
- [ ] Login → cookie set → authenticated requests work
- [ ] Refresh → new cookie set → session continues
- [ ] Logout → cookies cleared → requests fail with 401

### E2E Tests
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Automatic token refresh before expiry
- [ ] Manual refresh via debugAuth.refresh()
- [ ] Logout (single tab)
- [ ] Cross-tab logout sync

---

## Out of Scope (Future)
- Full BFF proxy pattern (Next.js migration) - Current approach is secure enough
- WebSocket token attachment - Already uses cookies
- Service worker auth - Not currently used

## Implementation Order

1. **Phase 1**: Update `src/lib/api.ts`
   - Remove localStorage writes for refreshToken
   - Update performTokenRefresh to send empty body
   - Keep expiresAt tracking in memory

2. **Phase 2**: Update auth services
   - authService.ts - login, register
   - oauthService.ts - OAuth callback
   - mfaService.ts - MFA verify
   - phoneAuthService.ts - Phone OTP
   - ldapService.ts - LDAP login
   - anonymousAuthService.ts - Anonymous session

3. **Phase 3**: Update firm switch
   - firmService.ts - Firm switching

4. **Phase 4**: Cleanup
   - Remove deprecated functions
   - Update debugAuth output
   - Verify TypeScript passes

5. **Phase 5**: Test
   - All auth flows work
   - Cross-tab sync works
   - No console errors

---

## Dependencies
- **Backend**: ✅ Already updated (httpOnly cookies, no tokens in body)
- **Frontend**: This migration
- **No new packages required**
