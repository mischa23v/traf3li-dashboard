# Missing & Mismatched API Endpoints

## Summary

| Category | Missing | Not Mounted | Partial | Total Issues |
|----------|---------|-------------|---------|--------------|
| Authentication | 18 | 0 | 4 | 22 |
| Firms/Organization | 0 | 6 | 0 | 6 |
| Legal Documents | 0 | 6 | 0 | 6 |
| Peer Reviews/Scores | 0 | 6 | 0 | 6 |
| Settings | 75+ | 0 | 0 | 75+ |
| HR Features | Multiple | 0 | 0 | Various |

**Total Critical Issues: 115+**

---

## 1. AUTHENTICATION - NOT IMPLEMENTED

### OTP Endpoints (Frontend expects, Backend missing)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| POST | `/auth/send-otp` | otpService.ts:45 | ❌ NOT IMPLEMENTED |
| POST | `/auth/verify-otp` | otpService.ts:75 | ❌ NOT IMPLEMENTED |
| POST | `/auth/resend-otp` | otpService.ts:110 | ❌ NOT IMPLEMENTED |
| GET | `/auth/otp-status` | otpService.ts:151 | ❌ NOT IMPLEMENTED |

### Password Management (Partially implemented in test only)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| POST | `/auth/forgot-password` | passwordService.ts:61 | ⚠️ TEST ONLY |
| POST | `/auth/reset-password` | passwordService.ts:87 | ⚠️ TEST ONLY |
| POST | `/auth/change-password` | passwordService.ts:111 | ⚠️ TEST ONLY |
| GET | `/auth/password/status` | passwordService.ts:132 | ❌ NOT IMPLEMENTED |
| GET | `/auth/reset-password/validate` | passwordService.ts:181 | ❌ NOT IMPLEMENTED |
| POST | `/auth/password/check-breach` | passwordService.ts:324 | ❌ NOT IMPLEMENTED |

### Session Management

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/auth/sessions` | sessionService.ts:93 | ❌ NOT IMPLEMENTED |
| POST | `/auth/refresh-token` | authService.ts (interceptor) | ⚠️ TEST ONLY |

### MFA (Multi-Factor Authentication)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/auth/mfa/status` | mfaService.ts:59 | ❌ NOT IMPLEMENTED |
| POST | `/auth/mfa/setup` | mfaService.ts:71 | ❌ NOT IMPLEMENTED |
| POST | `/auth/mfa/verify-setup` | mfaService.ts:86 | ❌ NOT IMPLEMENTED |
| POST | `/auth/mfa/verify` | mfaService.ts:100 | ❌ NOT IMPLEMENTED |

### SSO (Single Sign-On)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/auth/sso/providers` | ssoService.ts | ❌ NOT IMPLEMENTED |
| GET | `/auth/sso/:provider/authorize` | ssoService.ts | ❌ NOT IMPLEMENTED |
| GET | `/auth/sso/:provider/callback` | ssoService.ts | ❌ NOT IMPLEMENTED |

### Magic Link

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| POST | `/auth/magic-link/send` | authService.ts:945 | ❌ NOT IMPLEMENTED |
| POST | `/auth/magic-link/verify` | authService.ts:968 | ❌ NOT IMPLEMENTED |

### Other Auth

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| POST | `/auth/check-availability` | authService.ts:814 | ❌ NOT IMPLEMENTED |

---

## 2. NOT MOUNTED IN SERVER.JS

These routes exist as files but are NOT registered in the server.

### Firms API (`/api/firms`)

**File exists:** `routes/firm.route.js`
**Status:** ❌ NOT MOUNTED

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/firms` | Create firm |
| GET | `/firms` | Get all firms |
| GET | `/firms/:_id` | Get single firm |
| PATCH | `/firms/:_id` | Update firm |
| POST | `/firms/lawyer/add` | Add lawyer to firm |
| POST | `/firms/lawyer/remove` | Remove lawyer from firm |

**Impact:** Law firms cannot be managed through the API

### Legal Documents API (`/api/legal-documents`)

**File exists:** `routes/legalDocument.route.js`
**Status:** ❌ NOT MOUNTED

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/legal-documents` | Create document |
| GET | `/legal-documents` | List documents |
| GET | `/legal-documents/:_id` | Get document |
| PATCH | `/legal-documents/:_id` | Update document |
| DELETE | `/legal-documents/:_id` | Delete document |
| POST | `/legal-documents/:_id/download` | Track download |

**Impact:** Legal document repository is inaccessible

### Peer Review API (`/api/peerReview`)

**File exists:** `routes/peerReview.route.js`
**Status:** ❌ NOT MOUNTED

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/peerReview` | Create peer review |
| GET | `/peerReview/:lawyerId` | Get reviews for lawyer |
| PATCH | `/peerReview/verify/:_id` | Verify review (admin) |

**Impact:** Peer review system doesn't work

### Score API (`/api/score`)

**File exists:** `routes/score.route.js`
**Status:** ❌ NOT MOUNTED

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/score/:lawyerId` | Get lawyer score |
| POST | `/score/recalculate/:lawyerId` | Recalculate score |
| GET | `/score/top/lawyers` | Get top lawyers |

**Impact:** Lawyer ranking system doesn't work

---

## 3. SETTINGS - FRONTEND EXPECTS, BACKEND MISSING

### General Settings (`/api/settings`)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/settings` | settingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/account` | settingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/appearance` | settingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/display` | settingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/notifications` | settingsService.ts | ❌ NOT IMPLEMENTED |

### HR Settings (`/api/settings/hr`)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/settings/hr` | hrSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/hr` | hrSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/hr/employee` | hrSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/hr/leave` | hrSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/hr/attendance` | hrSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/hr/payroll` | hrSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/hr/expense` | hrSettingsService.ts | ❌ NOT IMPLEMENTED |

### Email Settings (`/api/settings/email`)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/settings/email/smtp` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| PUT | `/settings/email/smtp` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| POST | `/settings/email/smtp/test-connection` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| POST | `/settings/email/smtp/send-test` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| GET | `/settings/email/signatures` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| POST | `/settings/email/signatures` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| PUT | `/settings/email/signatures/:id` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| DELETE | `/settings/email/signatures/:id` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/email/signatures/:id/default` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| GET | `/settings/email/templates` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| GET | `/settings/email/templates/:id` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| POST | `/settings/email/templates` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| PUT | `/settings/email/templates/:id` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| DELETE | `/settings/email/templates/:id` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/email/templates/:id/toggle` | emailSettingsService.ts | ❌ NOT IMPLEMENTED |

### Billing Settings (`/api/settings/billing`)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/settings/billing` | billingSettingsService.ts | ❌ NOT IMPLEMENTED |
| PATCH | `/settings/billing` | billingSettingsService.ts | ❌ NOT IMPLEMENTED |

### CRM Settings (`/api/crm-settings`)

**25+ endpoints expected by frontend** - All NOT IMPLEMENTED:
- Sales Teams (6 endpoints)
- Territories (7 endpoints)
- Lost Reasons (4 endpoints)
- Tags (4 endpoints)

### Lock Dates (`/api/lock-dates`)

| Method | Endpoint | Frontend Service | Status |
|--------|----------|------------------|--------|
| GET | `/lock-dates` | lockDateService.ts | ❌ NOT IMPLEMENTED |
| POST | `/lock-dates` | lockDateService.ts | ❌ NOT IMPLEMENTED |
| PUT | `/lock-dates/:id` | lockDateService.ts | ❌ NOT IMPLEMENTED |
| DELETE | `/lock-dates/:id` | lockDateService.ts | ❌ NOT IMPLEMENTED |

---

## 4. HR FEATURES - PARTIALLY IMPLEMENTED

### Performance Reviews

**Frontend Service:** `performanceReviewService.ts`
**Status:** ❓ Unknown backend implementation

Expected endpoints (25+):
- CRUD for performance reviews
- Self-assessment
- Manager assessment
- 360-degree feedback
- Development plans
- Calibration
- Templates
- Stats

### Gantt Chart / Project Management

**Frontend Service:** `ganttService.ts`
**Status:** ❓ Unknown backend implementation

Expected endpoints (40+):
- Gantt data management
- Task scheduling
- Dependencies
- Critical path
- Milestones
- Baselines
- Resource management
- Export

### Matter Budgets

**Frontend Service:** `matterBudgetService.ts`
**Status:** ❓ Unknown backend implementation

Expected endpoints (19):
- Budget CRUD
- Phases management
- Entries tracking
- Templates
- Analysis

### Team Management

**Frontend Service:** `teamService.ts`
**Status:** ❓ Unknown backend implementation

Expected endpoints (18):
- Team member CRUD
- Invitations
- Status management
- Permissions

### Documents Service

**Frontend Service:** `documentsService.ts`
**Status:** ❓ Unknown backend implementation

Expected endpoints (16):
- Document CRUD
- Upload/download
- Versions
- Sharing
- Encryption

---

## 5. TEST MODE ENDPOINTS (Should be removed before production)

| Method | Endpoint | Risk |
|--------|----------|------|
| POST | `/orders/create-test-contract/:_id` | ⚠️ Bypasses payment |
| POST | `/orders/create-test-proposal-contract/:_id` | ⚠️ Bypasses payment |

---

## 6. RECOMMENDATIONS

### Critical (Must Fix)

1. **Mount missing routes in server.js:**
   - firms
   - legalDocuments
   - peerReview
   - score

2. **Implement core auth features:**
   - Password reset flow
   - Refresh token

3. **Remove test endpoints before production**

### High Priority

1. **Implement settings routes:**
   - Create `/settings` route
   - Create `/settings/hr` route
   - Create `/settings/email` route

2. **Implement OTP/MFA:**
   - Send OTP
   - Verify OTP
   - MFA setup

### Medium Priority

1. **Implement SSO:**
   - Google OAuth
   - Microsoft OAuth

2. **Implement CRM settings**

3. **Implement lock dates**

### Low Priority

1. **Magic link authentication**
2. **Password breach checking**
3. **Advanced session management**

---

## File Locations

### Backend
- **Routes:** `/traf3li-backend-for testing only different github/src/routes/`
- **Controllers:** `/traf3li-backend-for testing only different github/src/controllers/`
- **Server:** `/traf3li-backend-for testing only different github/src/server.js`

### Frontend Services
- **Auth:** `/src/services/authService.ts`
- **OTP:** `/src/services/otpService.ts`
- **Password:** `/src/services/passwordService.ts`
- **MFA:** `/src/services/mfaService.ts`
- **SSO:** `/src/services/ssoService.ts`
- **Session:** `/src/services/sessionService.ts`
- **Settings:** `/src/services/settingsService.ts`
- **HR Settings:** `/src/services/hrSettingsService.ts`
- **Email Settings:** `/src/services/emailSettingsService.ts`

---

**Document Version:** 1.0
**Scan Date:** December 27, 2025
