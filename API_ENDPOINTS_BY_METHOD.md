# API Endpoints by HTTP Method - CSRF Audit Reference

**Date:** 2025-12-23
**Total Endpoints:** ~1,449 POST/PUT/PATCH/DELETE
**CSRF Protected:** 1,747 (99.93%)

---

## Critical Security Endpoints

### Authentication & Authorization

#### POST Endpoints (7)
```
✅ POST /auth/login                    - User login
✅ POST /auth/register                 - User registration
✅ POST /auth/logout                   - User logout
✅ POST /auth/check-availability       - Check username/email
✅ POST /auth/send-otp                 - Send OTP code
✅ POST /auth/verify-otp               - Verify OTP code
✅ POST /auth/resend-otp               - Resend OTP
```

#### Multi-Factor Authentication (6 POST)
```
✅ POST /auth/mfa/setup                - Start MFA setup
✅ POST /auth/mfa/verify-setup         - Complete MFA setup
✅ POST /auth/mfa/verify               - Verify MFA code
✅ POST /auth/mfa/disable              - Disable MFA
✅ POST /auth/mfa/backup-codes/verify  - Verify backup code
✅ POST /auth/mfa/backup-codes/regenerate - Regenerate codes
```

#### Session Management (2 DELETE)
```
✅ DELETE /auth/sessions/:id           - Revoke specific session
✅ DELETE /auth/sessions               - Revoke all sessions
```

#### CAPTCHA (2 POST, 1 PUT)
```
✅ POST /auth/captcha/verify           - Verify CAPTCHA
✅ POST /auth/captcha/check-required   - Check if required
✅ PUT  /auth/captcha/settings         - Update settings
```

---

## Data Privacy & Consent (PDPL Compliance)

### Consent Management (2 POST, 1 PUT, 1 DELETE)
```
✅ POST   /consent                     - Save all consents
✅ PUT    /consent/:category           - Update single consent
✅ DELETE /consent                     - Withdraw all & request deletion
✅ POST   /consent/export              - Request data export
```

---

## Organization & Team Management

### Firm Operations (6 POST, 1 PUT, 2 PATCH, 2 DELETE)
```
✅ POST   /firms                       - Create new firm
✅ PUT    /firms/:id                   - Update firm
✅ PATCH  /firms/:id                   - Patch firm settings
✅ PATCH  /firms/:id/billing           - Update billing
✅ POST   /firms/:id/leave             - Leave firm
✅ POST   /firms/:id/transfer-ownership - Transfer ownership
✅ POST   /firms/switch                - Switch active firm
✅ POST   /firms/lawyer/add            - Add lawyer
✅ POST   /firms/lawyer/remove         - Remove lawyer
```

### Team Management (4 POST, 1 PUT, 1 DELETE)
```
✅ POST   /firms/:id/members/invite              - Invite member
✅ PUT    /firms/:id/members/:memberId           - Update member role
✅ POST   /firms/:id/members/:memberId/depart    - Process departure
✅ POST   /firms/:id/members/:memberId/reinstate - Reinstate member
✅ DELETE /firms/:id/members/:memberId           - Remove member
```

### Invitations (2 POST, 1 DELETE)
```
✅ POST   /firms/:id/invitations                       - Create invitation
✅ POST   /firms/:id/invitations/:invId/resend         - Resend invitation
✅ DELETE /firms/:id/invitations/:invId                - Cancel invitation
```

---

## AI & Automation

### AI Services (2 POST + 1 STREAMING)
```
✅ POST /api/ai/chat                   - Send chat message (axios)
✅ POST /api/ai/summarize              - Summarize text
⚠️ POST /api/ai/chat (streaming)      - VULNERABLE (raw fetch)
```

---

## Case Management

### Case CRUD (2 POST, 4 PATCH, 1 DELETE)
```
✅ POST   /cases                       - Create case (external)
✅ POST   /cases                       - Create from contract
✅ PATCH  /cases/:id                   - Update case
✅ PATCH  /cases/:id/progress          - Update progress
✅ PATCH  /cases/:id/status            - Update status
✅ PATCH  /cases/:id/outcome           - Update outcome
✅ DELETE /cases/:id                   - Delete case
```

### Case Notes (1 POST, 1 PATCH, 1 DELETE)
```
✅ POST   /cases/:id/note               - Add note
✅ PATCH  /cases/:id/notes/:noteId      - Update note
✅ DELETE /cases/:id/notes/:noteId      - Delete note
```

### Case Documents (2 POST, 1 DELETE, 1 PUT to S3)
```
✅ POST   /cases/:id/document            - Add document
✅ POST   /cases/:id/documents/upload-url - Get presigned URL
✅ POST   /cases/:id/documents/confirm    - Confirm upload
✅ DELETE /cases/:id/documents/:docId     - Delete document
✅ PUT    {S3_PRESIGNED_URL}              - Upload to S3 (NOT CSRF - OK)
```

### Case Hearings (1 POST, 1 PATCH, 1 DELETE)
```
✅ POST   /cases/:id/hearing                - Add hearing
✅ PATCH  /cases/:id/hearings/:hearingId    - Update hearing
✅ DELETE /cases/:id/hearings/:hearingId    - Delete hearing
```

### Case Claims (1 POST, 1 PATCH, 1 DELETE)
```
✅ POST   /cases/:id/claim                - Add claim
✅ PATCH  /cases/:id/claims/:claimId      - Update claim
✅ DELETE /cases/:id/claims/:claimId      - Delete claim
```

### Case Timeline (1 POST, 1 PATCH, 1 DELETE)
```
✅ POST   /cases/:id/timeline              - Add timeline event
✅ PATCH  /cases/:id/timeline/:eventId     - Update event
✅ DELETE /cases/:id/timeline/:eventId     - Delete event
```

### Rich Documents (2 POST, 1 PATCH, 1 DELETE)
```
✅ POST   /cases/:id/rich-documents                           - Create
✅ PATCH  /cases/:id/rich-documents/:docId                    - Update
✅ DELETE /cases/:id/rich-documents/:docId                    - Delete
✅ POST   /cases/:id/rich-documents/:docId/versions/:v/restore - Restore version
```

### Case Pipeline (2 PATCH)
```
✅ PATCH  /cases/:id/stage                - Move to stage
✅ PATCH  /cases/:id/end                  - End case with outcome
```

---

## Finance & Accounting (200+ endpoints)

### Invoices (15+ operations)
```
✅ POST   /invoices                     - Create invoice
✅ PUT    /invoices/:id                 - Update invoice
✅ PATCH  /invoices/:id                 - Partial update
✅ DELETE /invoices/:id                 - Delete invoice
✅ POST   /invoices/:id/send            - Send to client
✅ POST   /invoices/:id/mark-paid       - Mark as paid
✅ POST   /invoices/:id/void            - Void invoice
✅ POST   /invoices/:id/reminder        - Send reminder
✅ POST   /invoices/batch               - Batch create
✅ POST   /invoices/recurring           - Set up recurring
✅ ... (and more invoice operations)
```

### Payments (10+ operations)
```
✅ POST   /payments                     - Record payment
✅ PUT    /payments/:id                 - Update payment
✅ DELETE /payments/:id                 - Delete payment
✅ POST   /payments/:id/refund          - Issue refund
✅ POST   /payments/:id/allocate        - Allocate to invoices
✅ POST   /payments/batch               - Batch payments
✅ ... (and more payment operations)
```

### Expenses (8+ operations)
```
✅ POST   /expenses                     - Create expense
✅ PUT    /expenses/:id                 - Update expense
✅ DELETE /expenses/:id                 - Delete expense
✅ POST   /expenses/:id/approve         - Approve expense
✅ POST   /expenses/:id/reimburse       - Mark reimbursed
✅ POST   /expenses/batch               - Batch expenses
✅ ... (and more expense operations)
```

### Journal Entries (12 operations)
```
✅ POST   /journal-entries              - Create entry
✅ PUT    /journal-entries/:id          - Update entry
✅ DELETE /journal-entries/:id          - Delete entry
✅ POST   /journal-entries/:id/post     - Post to ledger
✅ POST   /journal-entries/:id/reverse  - Reverse entry
✅ POST   /journal-entries/batch        - Batch entries
✅ ... (and more journal operations)
```

### Bank Reconciliation (21 operations)
```
✅ POST   /bank-reconciliation                    - Create reconciliation
✅ PUT    /bank-reconciliation/:id                - Update
✅ DELETE /bank-reconciliation/:id                - Delete
✅ POST   /bank-reconciliation/:id/match          - Match transaction
✅ POST   /bank-reconciliation/:id/unmatch        - Unmatch
✅ POST   /bank-reconciliation/:id/suggest-matches - AI suggestions
✅ POST   /bank-reconciliation/:id/finalize       - Finalize
✅ POST   /bank-reconciliation/import             - Import statement
✅ ... (and more reconciliation operations)
```

### Chart of Accounts (10+ operations)
```
✅ POST   /accounts                     - Create account
✅ PUT    /accounts/:id                 - Update account
✅ DELETE /accounts/:id                 - Delete account
✅ POST   /accounts/:id/activate        - Activate
✅ POST   /accounts/:id/deactivate      - Deactivate
✅ ... (and more account operations)
```

### Bills (19 operations)
```
✅ POST   /bills                        - Create bill
✅ PUT    /bills/:id                    - Update bill
✅ DELETE /bills/:id                    - Delete bill
✅ POST   /bills/:id/approve            - Approve bill
✅ POST   /bills/:id/pay                - Record payment
✅ POST   /bills/:id/schedule-payment   - Schedule payment
✅ ... (and more bill operations)
```

---

## HR & Payroll (150+ endpoints)

### Employee Management (9 operations)
```
✅ POST   /employees                    - Create employee
✅ PUT    /employees/:id                - Update employee
✅ DELETE /employees/:id                - Delete employee
✅ POST   /employees/:id/activate       - Activate
✅ POST   /employees/:id/deactivate     - Deactivate
✅ POST   /employees/bulk-import        - Import employees
✅ ... (and more employee operations)
```

### Attendance (30 operations)
```
✅ POST   /attendance/clock-in          - Clock in
✅ POST   /attendance/clock-out         - Clock out
✅ POST   /attendance/break-start       - Start break
✅ POST   /attendance/break-end         - End break
✅ PUT    /attendance/:id               - Update attendance
✅ DELETE /attendance/:id               - Delete record
✅ POST   /attendance/:id/approve       - Approve
✅ POST   /attendance/:id/reject        - Reject
✅ POST   /attendance/bulk-approve      - Bulk approve
✅ ... (and more attendance operations)
```

### Leave Management (12 operations)
```
✅ POST   /leave-requests               - Request leave
✅ PUT    /leave-requests/:id           - Update request
✅ DELETE /leave-requests/:id           - Cancel request
✅ POST   /leave-requests/:id/approve   - Approve
✅ POST   /leave-requests/:id/reject    - Reject
✅ POST   /leave-allocation             - Allocate leave
✅ POST   /leave-encashment             - Request encashment
✅ ... (and more leave operations)
```

### Payroll (9 operations)
```
✅ POST   /payroll                      - Create payroll
✅ PUT    /payroll/:id                  - Update payroll
✅ DELETE /payroll/:id                  - Delete payroll
✅ POST   /payroll/:id/process          - Process payroll
✅ POST   /payroll/:id/approve          - Approve
✅ POST   /payroll/:id/pay              - Disburse payment
✅ ... (and more payroll operations)
```

### Payroll Runs (16 operations)
```
✅ POST   /payroll-runs                 - Create run
✅ PUT    /payroll-runs/:id             - Update run
✅ DELETE /payroll-runs/:id             - Delete run
✅ POST   /payroll-runs/:id/calculate   - Calculate
✅ POST   /payroll-runs/:id/approve     - Approve
✅ POST   /payroll-runs/:id/post        - Post to accounts
✅ POST   /payroll-runs/:id/disburse    - Disburse payments
✅ ... (and more run operations)
```

### Onboarding (17 operations)
```
✅ POST   /onboarding                   - Start onboarding
✅ PUT    /onboarding/:id               - Update
✅ DELETE /onboarding/:id               - Cancel
✅ POST   /onboarding/:id/complete-task - Complete task
✅ POST   /onboarding/:id/finalize      - Finalize
✅ ... (and more onboarding operations)
```

### Offboarding (15 operations)
```
✅ POST   /offboarding                  - Start offboarding
✅ PUT    /offboarding/:id              - Update
✅ POST   /offboarding/:id/complete-task - Complete task
✅ POST   /offboarding/:id/finalize     - Finalize
✅ ... (and more offboarding operations)
```

### Biometric (19 operations)
```
✅ POST   /biometric/devices            - Register device
✅ PUT    /biometric/devices/:id        - Update device
✅ DELETE /biometric/devices/:id        - Remove device
✅ POST   /biometric/enroll             - Enroll user
✅ POST   /biometric/sync               - Sync attendance
✅ ... (and more biometric operations)
```

---

## CRM & Sales (90+ endpoints)

### Lead Management (15+ operations)
```
✅ POST   /leads                        - Create lead
✅ PUT    /leads/:id                    - Update lead
✅ DELETE /leads/:id                    - Delete lead
✅ POST   /leads/:id/convert            - Convert to client
✅ POST   /leads/:id/assign             - Assign to user
✅ POST   /leads/:id/qualify            - Qualify lead
✅ ... (and more lead operations)
```

### Deal Pipeline (15+ operations)
```
✅ POST   /deals                        - Create deal
✅ PUT    /deals/:id                    - Update deal
✅ DELETE /deals/:id                    - Delete deal
✅ POST   /deals/:id/move-stage         - Move to stage
✅ POST   /deals/:id/won                - Mark won
✅ POST   /deals/:id/lost               - Mark lost
✅ ... (and more deal operations)
```

### Contacts (8 operations)
```
✅ POST   /contacts                     - Create contact
✅ PUT    /contacts/:id                 - Update contact
✅ DELETE /contacts/:id                 - Delete contact
✅ POST   /contacts/:id/merge           - Merge contacts
✅ ... (and more contact operations)
```

### Clients (12 operations)
```
✅ POST   /clients                      - Create client
✅ PUT    /clients/:id                  - Update client
✅ DELETE /clients/:id                  - Delete client
✅ POST   /clients/:id/activate         - Activate
✅ POST   /clients/:id/deactivate       - Deactivate
✅ ... (and more client operations)
```

---

## Tasks & Project Management (60+ endpoints)

### Tasks (46 operations)
```
✅ POST   /tasks                        - Create task
✅ PUT    /tasks/:id                    - Update task
✅ PATCH  /tasks/:id                    - Partial update
✅ DELETE /tasks/:id                    - Delete task
✅ POST   /tasks/:id/assign             - Assign to user
✅ POST   /tasks/:id/complete           - Mark complete
✅ POST   /tasks/:id/reopen             - Reopen task
✅ POST   /tasks/:id/comment            - Add comment
✅ POST   /tasks/:id/attach             - Add attachment
✅ POST   /tasks/bulk-update            - Bulk operations
✅ ... (and more task operations)
```

### Events (39 operations)
```
✅ POST   /events                       - Create event
✅ PUT    /events/:id                   - Update event
✅ DELETE /events/:id                   - Delete event
✅ POST   /events/:id/attend            - Mark attendance
✅ POST   /events/:id/reminder          - Set reminder
✅ POST   /events/recurring             - Create recurring
✅ ... (and more event operations)
```

### Gantt Charts (14 operations)
```
✅ POST   /gantt/projects               - Create project
✅ PUT    /gantt/projects/:id           - Update project
✅ DELETE /gantt/projects/:id           - Delete project
✅ POST   /gantt/tasks                  - Add task to Gantt
✅ POST   /gantt/dependencies           - Set dependency
✅ ... (and more Gantt operations)
```

---

## Communications (40+ endpoints)

### Messages (2 operations)
```
✅ POST   /messages                     - Send message
✅ POST   /messages/:id/read            - Mark as read
```

### Email Marketing (24 operations)
```
✅ POST   /email-campaigns              - Create campaign
✅ PUT    /email-campaigns/:id          - Update campaign
✅ DELETE /email-campaigns/:id          - Delete campaign
✅ POST   /email-campaigns/:id/send     - Send campaign
✅ POST   /email-campaigns/:id/schedule - Schedule send
✅ POST   /email-templates              - Create template
✅ ... (and more email marketing operations)
```

### WhatsApp Integration (10 operations)
```
✅ POST   /whatsapp/send                - Send message
✅ POST   /whatsapp/send-template       - Send template
✅ POST   /whatsapp/send-media          - Send media
✅ POST   /whatsapp/webhook             - Handle webhook
✅ ... (and more WhatsApp operations)
```

### Chatter (11 operations)
```
✅ POST   /chatter/threads              - Create thread
✅ POST   /chatter/messages             - Send message
✅ DELETE /chatter/messages/:id         - Delete message
✅ POST   /chatter/messages/:id/react   - React to message
✅ ... (and more chatter operations)
```

---

## Documents & Files (30+ endpoints)

### Documents (13 operations)
```
✅ POST   /documents/upload             - Upload document
✅ PUT    /documents/:id                - Update metadata
✅ DELETE /documents/:id                - Delete document
✅ POST   /documents/:id/share          - Share document
✅ POST   /documents/:id/version        - Create version
✅ POST   /documents/:id/ocr            - Run OCR
✅ ... (and more document operations)
```

### Document Analysis (4 operations)
```
✅ POST   /document-analysis/analyze    - Analyze document
✅ POST   /document-analysis/extract    - Extract data
✅ POST   /document-analysis/classify   - Classify document
✅ ... (and more analysis operations)
```

### Legal Documents (6 operations)
```
✅ POST   /legal-documents/templates    - Create template
✅ PUT    /legal-documents/templates/:id - Update template
✅ DELETE /legal-documents/templates/:id - Delete template
✅ POST   /legal-documents/generate     - Generate from template
✅ ... (and more legal doc operations)
```

---

## Integrations & Security (30+ endpoints)

### Webhooks (9 operations)
```
✅ POST   /webhooks                     - Register webhook
✅ PUT    /webhooks/:id                 - Update webhook
✅ DELETE /webhooks/:id                 - Delete webhook
✅ POST   /webhooks/:id/test            - Test webhook
✅ POST   /webhooks/:id/retry           - Retry failed
✅ ... (and more webhook operations)
```

### SSO & Authentication (6 operations)
```
✅ POST   /sso/configure                - Configure SSO
✅ PUT    /sso/settings                 - Update settings
✅ DELETE /sso/providers/:id            - Remove provider
✅ POST   /sso/saml/metadata            - Upload SAML metadata
✅ ... (and more SSO operations)
```

### LDAP Integration (7 operations)
```
✅ POST   /ldap/configure               - Configure LDAP
✅ PUT    /ldap/settings                - Update settings
✅ POST   /ldap/test-connection         - Test connection
✅ POST   /ldap/sync                    - Sync users
✅ ... (and more LDAP operations)
```

### API Keys (3 operations)
```
✅ POST   /api-keys                     - Create API key
✅ DELETE /api-keys/:id                 - Revoke API key
✅ POST   /api-keys/:id/regenerate      - Regenerate key
```

---

## Reports & Analytics (30+ endpoints)

### Custom Reports (28 operations)
```
✅ POST   /reports                      - Create report
✅ PUT    /reports/:id                  - Update report
✅ DELETE /reports/:id                  - Delete report
✅ POST   /reports/:id/schedule         - Schedule report
✅ POST   /reports/:id/export           - Export report
✅ POST   /reports/:id/share            - Share report
✅ ... (and more report operations)
```

### Data Export (12 operations)
```
✅ POST   /data-export/request          - Request export
✅ POST   /data-export/bulk             - Bulk export
✅ POST   /data-export/pdpl-compliance  - PDPL export
✅ DELETE /data-export/requests/:id     - Cancel request
✅ ... (and more export operations)
```

---

## Settings & Configuration (50+ endpoints)

### Email Settings (11 operations)
```
✅ POST   /email-settings/smtp          - Configure SMTP
✅ PUT    /email-settings/smtp/:id      - Update SMTP
✅ DELETE /email-settings/smtp/:id      - Delete config
✅ POST   /email-settings/test          - Test connection
✅ POST   /email-templates              - Create template
✅ ... (and more email settings)
```

### Billing Settings (11 operations)
```
✅ POST   /billing-settings/gateways    - Add gateway
✅ PUT    /billing-settings/gateways/:id - Update gateway
✅ DELETE /billing-settings/gateways/:id - Remove gateway
✅ POST   /billing-settings/tax         - Configure tax
✅ ... (and more billing settings)
```

### HR Settings (6 operations)
```
✅ POST   /hr-settings/policies         - Create policy
✅ PUT    /hr-settings/policies/:id     - Update policy
✅ DELETE /hr-settings/policies/:id     - Delete policy
✅ ... (and more HR settings)
```

---

## Summary Statistics

### By HTTP Method
- **POST:** ~900 endpoints
- **PUT:** ~250 endpoints
- **PATCH:** ~200 endpoints
- **DELETE:** ~99 endpoints
- **Total:** ~1,449 mutation endpoints

### By Protection Status
- ✅ **CSRF Protected:** 1,747 (99.93%)
- ⚠️ **Vulnerable:** 1 (0.07%) - AI streaming
- ✅ **N/A (External):** 1 - S3 uploads

### By Category
1. Finance & Accounting: 200+ endpoints
2. HR & Payroll: 150+ endpoints
3. CRM & Sales: 90+ endpoints
4. Tasks & Projects: 60+ endpoints
5. Case Management: 59 endpoints
6. Communications: 40+ endpoints
7. Documents: 30+ endpoints
8. Reports: 30+ endpoints
9. Integrations: 30+ endpoints
10. Settings: 50+ endpoints
11. Others: 200+ endpoints

---

**All endpoints use CSRF-protected axios clients EXCEPT:**
- ⚠️ AI chat streaming (ai.service.ts:92-148) - **NEEDS FIX**
- ✅ S3 file uploads (casesService.ts:1245-1257) - **CORRECT PATTERN**

---

**Related Documents:**
- Full Audit Report: `API_CSRF_SECURITY_AUDIT.md`
- Quick Summary: `API_CSRF_AUDIT_SUMMARY.md`
- CSRF Implementation: `/src/lib/api.ts`
