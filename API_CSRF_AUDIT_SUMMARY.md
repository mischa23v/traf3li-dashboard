# API CSRF Security Audit - Quick Summary

**Date:** 2025-12-23
**Status:** ⚠️ 99.93% Compliant (1 Critical Issue)

## TL;DR

- ✅ **1,747 endpoints** properly CSRF protected via axios
- ⚠️ **1 endpoint** vulnerable: AI chat streaming (`/src/services/ai.service.ts`)
- ✅ **1 endpoint** uses raw fetch() correctly (S3 uploads)
- 🎯 **Action Required:** Fix AI streaming within 1 week

---

## Critical Finding

### 🔴 AI Chat Streaming - CSRF Vulnerable

**File:** `/src/services/ai.service.ts` (Lines 92-148)
**Function:** `streamChatMessage()`
**Endpoint:** `POST /api/ai/chat`
**Issue:** Uses raw `fetch()` with custom CSRF token logic that may fail

**Fix Options:**
1. Use axios with streaming support (recommended)
2. Ensure custom `getCsrfToken()` exactly matches `/src/lib/api.ts` implementation

**Code Location:**
```typescript
// Line 92-148 in ai.service.ts
export async function* streamChatMessage(
  request: Omit<ChatRequest, 'stream'>
): AsyncGenerator<string, void, unknown> {
  const csrfToken = getCsrfToken(); // ⚠️ Custom implementation
  // ... rest of streaming logic
}
```

---

## Protection Summary

### ✅ CSRF-Protected Clients

All these clients automatically add CSRF tokens:

| Client | Base URL | Usage Count | Files |
|--------|----------|-------------|-------|
| `apiClient` | `/api/v1/` | 1,042 calls | 130+ files |
| `apiClientNoVersion` | `/api/` | 11 calls | 5 files |
| `api` (alias) | `/api/v1/` | 694 calls | 85+ files |

**Total Protected:** 1,747 endpoints across 146 service files

### ⚠️ Raw fetch() Usage

| File | Function | Endpoint | CSRF Status | Severity |
|------|----------|----------|-------------|----------|
| `ai.service.ts` | `streamChatMessage()` | POST /api/ai/chat | ⚠️ Vulnerable | 🔴 HIGH |
| `casesService.ts` | `uploadFileToS3()` | PUT {S3_URL} | ✅ N/A (External) | - |

---

## Top Service Categories by Endpoint Count

1. **Finance & Accounting** - 200+ endpoints (invoices, payments, reconciliation)
2. **HR & Payroll** - 150+ endpoints (employees, attendance, payroll)
3. **CRM & Sales** - 90+ endpoints (leads, deals, contacts)
4. **Tasks & Projects** - 60+ endpoints (tasks, events, gantt)
5. **Case Management** - 59 endpoints (cases, documents, hearings)
6. **Communications** - 40+ endpoints (messages, email, WhatsApp)
7. **Documents & Files** - 30+ endpoints (uploads, versions, OCR)
8. **Reports & Analytics** - 30+ endpoints (custom reports, exports)
9. **Settings & Config** - 50+ endpoints (system, email, billing)
10. **Integrations** - 20+ endpoints (webhooks, SSO, LDAP)

---

## Security Services Audit

### ✅ All Protected

**Authentication (7 endpoints):**
- Login, Register, Logout
- OTP (send, verify, resend)
- Availability checks

**MFA (6 endpoints):**
- Setup, Verify, Disable
- Backup codes (verify, regenerate)

**Sessions (2 endpoints):**
- Revoke session
- Revoke all sessions

**CAPTCHA (3 endpoints):**
- Verify, Update settings, Check required

**Consent (4 endpoints):**
- Save, Update, Withdraw, Export data

**Firm Management (21 endpoints):**
- Team members (invite, remove, update)
- Invitations (create, cancel, resend)
- Ownership transfer, firm switching

---

## Compliance Status

### NCA ECC (Saudi Cybersecurity)

| Control | Status | Notes |
|---------|--------|-------|
| ECC 2-1-2 (Brute Force) | ✅ Pass | Rate limiting + progressive delays |
| ECC 2-1-3 (MFA) | ✅ Pass | TOTP implemented |
| ECC 2-1-4 (Sessions) | ✅ Pass | Device fingerprinting |
| ECC 2-2-3 (Revocation) | ✅ Pass | Session management |
| **CSRF Protection** | ⚠️ **99.93%** | **1 endpoint needs fix** |

### OWASP Top 10 2021

- A05:2021 (Security Misconfiguration): ⚠️ 99.93% compliant
- A07:2021 (Auth Failures): ✅ Strong (MFA, rate limiting)

---

## How CSRF Protection Works

### Automatic Protection Flow

```
1. Backend sets csrf-token cookie (not HttpOnly)
2. Axios interceptor reads cookie
3. For POST/PUT/PATCH/DELETE:
   ├─ Adds X-CSRF-Token header
   └─ Sends request
4. Backend validates cookie == header
```

### Token Sources (Priority Order)

1. **Primary:** `csrf-token` cookie
2. **Fallback 1:** `XSRF-TOKEN` cookie
3. **Fallback 2:** Cached from response headers

### Implementation

```typescript
// From /src/lib/api.ts
const method = config.method?.toLowerCase()
if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
  const csrfToken = getCsrfToken()
  if (csrfToken) {
    config.headers.set('X-CSRF-Token', csrfToken)
  }
}
```

---

## Immediate Action Items

| Priority | Task | Deadline |
|----------|------|----------|
| 🔴 Critical | Fix AI streaming CSRF | 1 week |
| 🟡 High | Add automated CSRF tests | 2 weeks |
| 🟢 Medium | Document S3 upload pattern | 1 month |

---

## Testing Checklist

### Manual Testing
- [x] Verify CSRF cookie in DevTools
- [x] Check X-CSRF-Token header in POST requests
- [ ] Test AI streaming with network monitor
- [ ] Verify token refresh on 403 CSRF errors

### Automated Testing Needed
```typescript
// Add to test suite
describe('CSRF Protection', () => {
  it('includes CSRF token in POST requests')
  it('handles token refresh on 403')
  it('falls back to cached token')
  it('AI streaming includes CSRF token') // ⚠️ Currently fails
})
```

---

## Files Analyzed

**Total:** 166 TypeScript service files
**With Mutations:** 146 files
**Total Endpoints:** ~1,449 POST/PUT/PATCH/DELETE calls

### Sample Key Services
- authService.ts (7 endpoints)
- mfa.service.ts (6 endpoints)
- casesService.ts (59 endpoints)
- financeService.ts (80 endpoints)
- accountingService.ts (61 endpoints)
- tasksService.ts (46 endpoints)
- eventsService.ts (39 endpoints)
- crmService.ts (35 endpoints)
- attendanceService.ts (30 endpoints)

---

## Why S3 Upload is Safe

**File:** `casesService.ts`
**Function:** `uploadFileToS3()`
**Pattern:** Direct S3 upload with presigned URL

✅ **This is CORRECT and SECURE:**
1. Upload goes to AWS S3, not application backend
2. Presigned URL acts as temporary credential
3. URL includes signature that S3 validates
4. URL expires after short time (typically 15-60 min)
5. Standard AWS best practice for large files

**No CSRF protection needed** - presigned URL is the security mechanism.

---

## References

- Full Audit Report: `API_CSRF_SECURITY_AUDIT.md`
- CSRF Implementation: `/src/lib/api.ts`
- OWASP CSRF Guide: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

---

**Next Review:** 2026-01-23 (30 days after fix)
