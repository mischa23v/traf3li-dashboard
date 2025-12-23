# Backend Implementation Requirements

> **Generated:** 2025-12-23
> **Purpose:** Complete list of all API endpoints and features that need backend implementation
> **Priority Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Missing Endpoints](#critical-missing-endpoints)
3. [Module-Specific Requirements](#module-specific-requirements)
4. [Deprecated Endpoints to Remove](#deprecated-endpoints-to-remove)
5. [API Response Standards](#api-response-standards)
6. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

The frontend audit identified **150+ API endpoints** that are either:
- ❌ **Not implemented** in the backend
- ⚠️ **Partially implemented** (missing features)
- 🔄 **Need migration** (deprecated patterns)

### Quick Stats

| Category | Count | Priority |
|----------|-------|----------|
| Critical Missing Endpoints | 45 | 🔴 |
| High Priority Endpoints | 38 | 🟠 |
| Medium Priority Endpoints | 42 | 🟡 |
| Low Priority / Future | 25+ | 🟢 |

---

## Critical Missing Endpoints

### 1. 🔴 HR Module (All Endpoints Missing)

The entire HR module has **zero backend implementation**. Frontend scaffolding exists but all API calls will fail.

```
Base Path: /api/hr/*
```

#### Employee Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hr/employees` | List all employees with filters |
| GET | `/hr/employees/:id` | Get single employee details |
| POST | `/hr/employees` | Create new employee |
| PATCH | `/hr/employees/:id` | Update employee |
| DELETE | `/hr/employees/:id` | Delete employee |
| GET | `/hr/employees/stats` | Get employee statistics |
| DELETE | `/hr/employees/bulk` | Bulk delete employees |

#### Employee Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/hr/employees/:id/documents` | Upload employee document |
| DELETE | `/hr/employees/:id/documents/:docId` | Delete employee document |
| POST | `/hr/employees/:id/documents/:docId/verify` | Verify document |

#### Allowances
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/hr/employees/:id/allowances` | Add allowance |
| DELETE | `/hr/employees/:id/allowances/:allowanceId` | Remove allowance |

#### Form Options
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hr/form-options` | Get dropdown options (departments, positions, etc.) |

---

### 2. 🔴 Lock Dates Module (All Endpoints Missing)

Feature for locking financial periods to prevent changes.

```
Base Path: /api/lock-dates/*
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/lock-dates` | Get all lock dates |
| GET | `/lock-dates/:id` | Get single lock date |
| POST | `/lock-dates` | Create lock date |
| PATCH | `/lock-dates/:id` | Update lock date |
| DELETE | `/lock-dates/:id` | Delete/clear lock date |
| GET | `/lock-dates/fiscal-periods` | Get fiscal periods |
| POST | `/lock-dates/lock-period` | Lock a period |
| POST | `/lock-dates/reopen-period` | Reopen a period |
| GET | `/lock-dates/check` | Check if date is locked |
| GET | `/lock-dates/history` | Get lock date history |

---

### 3. 🔴 Automated Actions Module (All Endpoints Missing)

Workflow automation feature (like Zapier triggers).

```
Base Path: /api/automated-actions/*
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/automated-actions` | List all automated actions |
| GET | `/automated-actions/:id` | Get single action details |
| POST | `/automated-actions` | Create automated action |
| PATCH | `/automated-actions/:id` | Update automated action |
| DELETE | `/automated-actions/:id` | Delete automated action |
| POST | `/automated-actions/:id/toggle` | Enable/disable action |
| POST | `/automated-actions/:id/test` | Test action execution |
| POST | `/automated-actions/:id/duplicate` | Duplicate action |
| GET | `/automated-actions/:id/logs` | Get execution logs |
| GET | `/automated-actions/logs` | Get all logs |
| GET | `/automated-actions/models` | Get available models |
| GET | `/automated-actions/models/:model/fields` | Get model fields |
| POST | `/automated-actions/bulk/enable` | Bulk enable |
| POST | `/automated-actions/bulk/disable` | Bulk disable |
| DELETE | `/automated-actions/bulk` | Bulk delete |

---

### 4. 🔴 Payroll Run Endpoints (4 Critical)

```
Base Path: /api/payroll-runs/*
```

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| POST | `/payroll-runs/:id/employees/:empId/exclude` | Exclude employee from run | Critical for payroll processing |
| POST | `/payroll-runs/:id/employees/:empId/include` | Re-include employee | Critical for payroll processing |
| POST | `/payroll-runs/:id/employees/:empId/recalculate` | Recalculate single employee | Alternative: recalculate entire run |
| GET | `/payroll-runs/:id/export` | Export payroll report | Multiple formats: PDF, Excel, CSV |

---

### 5. 🔴 HR Advances Endpoints (2 Critical)

```
Base Path: /api/hr/advances/*
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/hr/advances` | Submit advance request |
| POST | `/hr/advances/:id/waive` | Waive advance (forgive debt) |

---

### 6. 🔴 Expense Claims Module (All Endpoints Missing)

```
Base Path: /api/hr/expense-claims/*
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hr/expense-claims` | List expense claims |
| GET | `/hr/expense-claims/:id` | Get single claim |
| POST | `/hr/expense-claims` | Create expense claim |
| PATCH | `/hr/expense-claims/:id` | Update claim |
| DELETE | `/hr/expense-claims/:id` | Delete claim |
| POST | `/hr/expense-claims/:id/submit` | Submit for approval |
| POST | `/hr/expense-claims/:id/approve` | Approve claim |
| POST | `/hr/expense-claims/:id/reject` | Reject claim |
| POST | `/hr/expense-claims/:id/process-payment` | Process payment |
| GET | `/hr/expense-claims/stats` | Get statistics |

---

### 7. 🔴 Expense Policies Module (All Endpoints Missing)

```
Base Path: /api/hr/expense-policies/*
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hr/expense-policies` | List policies |
| GET | `/hr/expense-policies/:id` | Get single policy |
| POST | `/hr/expense-policies` | Create policy |
| PATCH | `/hr/expense-policies/:id` | Update policy |
| DELETE | `/hr/expense-policies/:id` | Delete policy |
| POST | `/hr/expense-policies/:id/toggle` | Enable/disable policy |

---

## Module-Specific Requirements

### 8. 🟠 Cases Module (Partial Implementation)

**Implemented:** Basic CRUD, notes, documents, hearings (create only), status updates

**Missing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| DELETE | `/cases/:id` | Delete case | 🟠 High |
| PATCH | `/cases/:id/notes/:noteId` | Update note | 🟠 High |
| DELETE | `/cases/:id/notes/:noteId` | Delete note | 🟠 High |
| PATCH | `/cases/:id/hearings/:hearingId` | Update hearing | 🟠 High |
| DELETE | `/cases/:id/hearings/:hearingId` | Delete hearing | 🟠 High |
| POST | `/cases/:id/claims` | Add claim | 🟡 Medium |
| PATCH | `/cases/:id/claims/:claimId` | Update claim | 🟡 Medium |
| DELETE | `/cases/:id/claims/:claimId` | Delete claim | 🟡 Medium |
| POST | `/cases/:id/timeline` | Add timeline event | 🟡 Medium |
| PATCH | `/cases/:id/timeline/:eventId` | Update timeline event | 🟡 Medium |
| DELETE | `/cases/:id/timeline/:eventId` | Delete timeline event | 🟡 Medium |
| GET | `/cases/:id/audit` | Get audit history | 🟢 Low |
| GET | `/cases/statistics` | Get case statistics | 🟢 Low |
| GET | `/cases/pipeline` | Get pipeline view | 🟢 Low |
| PATCH | `/cases/:id/stage` | Move case to stage | 🟢 Low |
| POST | `/cases/:id/end` | End/close case | 🟢 Low |

---

### 9. 🟠 Tasks Module (Partial Implementation)

**Implemented:** Basic CRUD, status, subtasks, comments, attachments

**Missing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| PATCH | `/tasks/:id/progress` | Update progress percentage | 🟠 High |
| GET | `/tasks/:id/dependencies` | Get task dependencies | 🟡 Medium |
| POST | `/tasks/:id/dependencies` | Add dependency | 🟡 Medium |
| DELETE | `/tasks/:id/dependencies/:depId` | Remove dependency | 🟡 Medium |
| POST | `/tasks/from-template/:templateId` | Create from template | 🟡 Medium |
| GET | `/tasks/templates` | List task templates | 🟡 Medium |
| POST | `/tasks/:id/save-as-template` | Save as template | 🟡 Medium |
| GET | `/tasks/:id/workflow-rules` | Get workflow rules | 🟢 Low |
| POST | `/tasks/:id/workflow-rules` | Add workflow rule | 🟢 Low |
| PATCH | `/tasks/:id/workflow-rules/:ruleId` | Update rule | 🟢 Low |
| DELETE | `/tasks/:id/workflow-rules/:ruleId` | Delete rule | 🟢 Low |

---

### 10. 🟠 Time Tracking (Partial Implementation)

**Implemented:** Timer, CRUD, basic stats

**Missing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/time-tracking/entries/pending-approval` | Get entries pending approval | 🔴 Critical |
| POST | `/time-tracking/entries/bulk-approve` | Bulk approve entries | 🔴 Critical |
| POST | `/time-tracking/entries/bulk-reject` | Bulk reject entries | 🔴 Critical |
| POST | `/time-tracking/entries/:id/request-changes` | Request changes | 🟠 High |
| POST | `/time-tracking/entries/:id/submit` | Submit for approval | 🟠 High |
| POST | `/time-tracking/entries/bulk-submit` | Bulk submit | 🟠 High |
| POST | `/time-tracking/entries/:id/write-off` | Write off entry | 🟡 Medium |
| POST | `/time-tracking/entries/:id/write-down` | Write down entry | 🟡 Medium |
| GET | `/time-tracking/entries/unbilled` | Get unbilled entries | 🟡 Medium |
| GET | `/time-tracking/activity-codes` | Get UTBMS activity codes | 🟢 Low |

---

### 11. 🟠 Dashboard Endpoints (Partial Implementation)

**Implemented:** `/dashboard/hero-stats`, `/dashboard/stats`, `/dashboard/financial-summary`, `/dashboard/today-events`, `/dashboard/recent-messages`, `/dashboard/activity`

**Missing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/dashboard/summary` | Aggregated dashboard data | 🟠 High |
| GET | `/dashboard/crm-stats` | CRM statistics | 🟠 High |
| GET | `/dashboard/hr-stats` | HR statistics | 🟠 High |
| GET | `/dashboard/finance-stats` | Finance statistics | 🟠 High |
| GET | `/messages/stats` | Message statistics | 🟡 Medium |
| GET | `/reports/cases-chart` | Cases chart data | 🟡 Medium |
| GET | `/reports/revenue-chart` | Revenue chart data | 🟡 Medium |
| GET | `/reports/tasks-chart` | Tasks chart data | 🟡 Medium |
| GET | `/dashboard/hearings/upcoming` | Upcoming hearings | 🟡 Medium |
| GET | `/dashboard/deadlines/upcoming` | Upcoming deadlines | 🟡 Medium |
| GET | `/dashboard/time-entries/summary` | Time entry summary | 🟢 Low |
| GET | `/dashboard/documents/pending` | Pending documents | 🟢 Low |

---

### 12. 🟠 Calendar Endpoints (Partial Implementation)

**Implemented:** `/calendar`, `/calendar/date/:date`, `/calendar/month/:year/:month`, `/calendar/upcoming`, `/calendar/overdue`, `/calendar/stats`

**Missing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/calendar/grid-summary` | Badge counts per day | 🟠 High |
| GET | `/calendar/grid-items` | Minimal event data | 🟠 High |
| GET | `/calendar/item/:type/:id` | Full item details | 🟡 Medium |
| GET | `/calendar/list` | Cursor-based pagination | 🟡 Medium |
| GET | `/calendar/sidebar-data` | Sidebar summary | 🟢 Low |

---

### 13. 🟠 Notification Endpoints (Partial Implementation)

**Implemented:** GET `/notifications`, GET `/notifications/unread-count`, PATCH `/:id/read`, PATCH `/mark-all-read`, DELETE `/:id`

**Missing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/notifications/:id` | Get single notification | 🟡 Medium |
| PATCH | `/notifications/mark-multiple-read` | Bulk mark as read | 🟠 High |
| DELETE | `/notifications/bulk-delete` | Bulk delete | 🟠 High |
| DELETE | `/notifications/clear-read` | Clear all read | 🟡 Medium |
| GET | `/notifications/settings` | Get notification settings | 🟡 Medium |
| PATCH | `/notifications/settings` | Update settings | 🟡 Medium |
| GET | `/notifications/by-type/:type` | Filter by type | 🟢 Low |
| POST | `/notifications` | Create notification (admin) | 🟢 Low |

---

### 14. 🟠 Finance Advanced Endpoints

**Missing from bank reconciliation:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| POST | `/bank-reconciliation/transactions/:id/exclude` | Exclude transaction | 🟡 Medium |
| GET | `/bank-reconciliation/rules/:id` | Get single rule | 🟡 Medium |
| POST | `/bank-reconciliation/rules/:id/toggle` | Toggle rule | 🟡 Medium |
| PUT | `/bank-reconciliation/rules/reorder` | Reorder rules | 🟢 Low |

**Missing from currency:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/currency/rates/:code` | Get single rate | 🟡 Medium |
| GET | `/currency/rates/:code/history` | Rate history | 🟢 Low |

**Missing from reports:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/bank-reconciliation/report/:accountId` | Reconciliation report | 🟡 Medium |
| GET | `/bank-reconciliation/export/:accountId` | Export report | 🟡 Medium |

---

### 15. 🟠 Payment Receipt Endpoints

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| POST | `/payments/:id/generate-receipt` | Generate receipt | 🟠 High |
| GET | `/payments/:id/receipt/download` | Download receipt | 🟠 High |
| POST | `/payments/:id/receipt/send` | Email receipt | 🟡 Medium |

---

### 16. 🟠 Client Verification Endpoints

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/clients/:id/payments` | Get client payments | 🟡 Medium |
| GET | `/clients/:id/billing-info` | Get billing info | 🟡 Medium |
| POST | `/clients/:id/verify/wathq` | Verify with Wathq (Saudi CR) | 🟡 Medium |
| GET | `/clients/:id/wathq/:dataType` | Get Wathq data | 🟡 Medium |
| POST | `/clients/:id/attachments` | Upload attachments | 🟡 Medium |
| DELETE | `/clients/:id/attachments/:attachmentId` | Delete attachment | 🟡 Medium |
| POST | `/clients/:id/conflict-check` | Run conflict check | 🟢 Low |
| PATCH | `/clients/:id/status` | Update status | 🟢 Low |
| PATCH | `/clients/:id/flags` | Update flags | 🟢 Low |

---

### 17. 🟡 Users Endpoints (Partial)

**Missing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/users/team` | Get team members | 🟠 High |
| GET | `/users/vapid-public-key` | Push notification key | 🟡 Medium |
| GET | `/users/push-subscription` | Get push status | 🟡 Medium |
| POST | `/users/push-subscription` | Save push subscription | 🟡 Medium |
| DELETE | `/users/push-subscription` | Delete subscription | 🟡 Medium |
| GET | `/users/notification-preferences` | Get preferences | 🟡 Medium |
| PUT | `/users/notification-preferences` | Update preferences | 🟡 Medium |
| POST | `/users/convert-to-firm` | Convert to firm owner | 🟢 Low |

---

### 18. 🟡 Settings Endpoints

**Possibly not implemented:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/settings` | Get all settings | 🟠 High |
| PATCH | `/settings/account` | Update account settings | 🟠 High |
| PATCH | `/settings/appearance` | Update appearance | 🟡 Medium |
| PATCH | `/settings/display` | Update display settings | 🟡 Medium |
| PATCH | `/settings/notifications` | Update notification settings | 🟡 Medium |
| GET | `/settings/crm` | Get CRM settings | 🟡 Medium |
| PUT | `/settings/crm` | Update CRM settings | 🟡 Medium |

---

### 19. 🟡 Integrations Endpoints

**Possibly not implemented:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/integrations` | List integrations | 🟡 Medium |
| GET | `/integrations/:id` | Get integration details | 🟡 Medium |
| POST | `/integrations/:id/connect` | Connect integration | 🟡 Medium |
| POST | `/integrations/:id/disconnect` | Disconnect | 🟡 Medium |
| PATCH | `/integrations/:id` | Update settings | 🟡 Medium |
| POST | `/integrations/:id/test` | Test connection | 🟡 Medium |
| POST | `/integrations/:id/sync` | Trigger sync | 🟡 Medium |
| GET | `/integrations/:id/logs` | Get sync logs | 🟢 Low |

---

### 20. 🟡 Billing/Subscription Endpoints

**All likely not implemented:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/billing/subscription` | Get subscription | 🟡 Medium |
| GET | `/billing/usage-metrics` | Get usage | 🟡 Medium |
| POST | `/billing/change-plan` | Change plan | 🟡 Medium |
| POST | `/billing/cancel` | Cancel subscription | 🟡 Medium |
| POST | `/billing/reactivate` | Reactivate | 🟡 Medium |
| GET | `/billing/payment-methods` | List payment methods | 🟡 Medium |
| POST | `/billing/payment-methods` | Add payment method | 🟡 Medium |
| DELETE | `/billing/payment-methods/:id` | Remove payment method | 🟡 Medium |
| GET | `/billing/history` | Billing history | 🟢 Low |
| GET | `/billing/invoices/:id` | Get invoice | 🟢 Low |

---

### 21. 🟡 Chatter/Social Endpoints

**All likely not implemented:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/:model/:id/followers` | Get followers | 🟡 Medium |
| POST | `/:model/:id/follow` | Follow record | 🟡 Medium |
| DELETE | `/:model/:id/unfollow` | Unfollow record | 🟡 Medium |
| GET | `/:model/:id/activities` | Get activities | 🟡 Medium |
| POST | `/:model/:id/activities` | Create activity | 🟡 Medium |
| GET | `/:model/:id/attachments` | Get attachments | 🟡 Medium |
| POST | `/:model/:id/attachments` | Upload attachment | 🟡 Medium |

---

### 22. 🟡 Thread Messaging Endpoints

**All likely not implemented (separate from conversations):**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/messages` | List message threads | 🟡 Medium |
| GET | `/messages/:id` | Get thread | 🟡 Medium |
| POST | `/messages` | Create thread | 🟡 Medium |
| POST | `/messages/:id/reply` | Reply to thread | 🟡 Medium |
| DELETE | `/messages/:id` | Delete thread | 🟡 Medium |
| POST | `/messages/:id/archive` | Archive thread | 🟢 Low |
| POST | `/messages/:id/star` | Star thread | 🟢 Low |
| POST | `/messages/bulk-archive` | Bulk archive | 🟢 Low |
| POST | `/messages/bulk-delete` | Bulk delete | 🟢 Low |
| GET | `/messages/stats` | Message stats | 🟢 Low |
| GET | `/messages/search` | Search messages | 🟢 Low |

---

### 23. 🟡 Email Marketing Segments

**Missing from email marketing:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/email-marketing/segments` | List segments | 🟡 Medium |
| GET | `/email-marketing/segments/:id` | Get segment | 🟡 Medium |
| POST | `/email-marketing/segments` | Create segment | 🟡 Medium |
| PATCH | `/email-marketing/segments/:id` | Update segment | 🟡 Medium |
| DELETE | `/email-marketing/segments/:id` | Delete segment | 🟡 Medium |
| GET | `/email-marketing/segments/:id/subscribers` | Get subscribers | 🟡 Medium |
| POST | `/email-marketing/segments/:id/refresh` | Refresh segment | 🟢 Low |
| GET | `/email-marketing/analytics/overview` | Analytics overview | 🟢 Low |
| GET | `/email-marketing/analytics/trends` | Analytics trends | 🟢 Low |

---

### 24. 🟡 CRM Appointments

**All likely not implemented:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/crm/appointments` | List appointments | 🟡 Medium |
| GET | `/crm/appointments/:id` | Get appointment | 🟡 Medium |
| POST | `/crm/appointments` | Create appointment | 🟡 Medium |
| PUT | `/crm/appointments/:id` | Update appointment | 🟡 Medium |
| PATCH | `/crm/appointments/:id/status` | Update status | 🟡 Medium |
| DELETE | `/crm/appointments/:id` | Delete appointment | 🟡 Medium |
| POST | `/crm/appointments/:id/reschedule` | Reschedule | 🟡 Medium |
| GET | `/crm/appointments/stats` | Appointment stats | 🟢 Low |

---

### 25. 🟢 Document Encryption (Optional)

**S3-level encryption preferred:**

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| POST | `/documents/:id/encrypt` | Encrypt document | 🟢 Low |
| POST | `/documents/:id/decrypt` | Decrypt document | 🟢 Low |

---

## Deprecated Endpoints to Remove

These endpoints exist in frontend but should be migrated:

| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `POST /invoices/:id/mark-paid` | `POST /invoices/:id/record-payment` | Use payment recording flow |
| `GET /invoices/:id/download` | `GET /invoices/:id/pdf` | Use PDF export |
| `firmService.getMembers()` | `firmService.getTeamMembers()` | Returns richer data |
| `documentsService.uploadDocument()` | S3 presigned URL flow | Better performance |
| `clearCache()` / `getCacheSize()` | TanStack Query methods | `queryClient.invalidateQueries()` |
| `useConversation()` | `useSingleConversation()` | Different hook |
| `useMarkAsRead()` | Socket-based approach | Real-time updates |
| `apiKeysService.updateApiKey()` | Delete & recreate | Scheduled Q2 2025 removal |
| `smartButtonsService.*` | `useSmartButtonCounts` hook | Entity-specific counts |
| `permissionService.getRelationTuples()` | `getResourceRelations()` | Different API |

---

## API Response Standards

### Bilingual Error Messages

All API error responses should include bilingual messages:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found | المورد غير موجود",
    "details": {
      "en": "The requested resource could not be found.",
      "ar": "لم يتم العثور على المورد المطلوب."
    }
  }
}
```

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful | تمت العملية بنجاح",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Unprocessable entity |
| 500 | Server error |

---

## Implementation Checklist

### Phase 1: Critical (Week 1-2)
- [ ] HR Module - Employee CRUD
- [ ] Payroll Run - Exclude/Include/Recalculate
- [ ] HR Advances - Submit/Waive
- [ ] Time Tracking - Approval workflow
- [ ] Lock Dates - Basic CRUD

### Phase 2: High Priority (Week 3-4)
- [ ] Automated Actions Module
- [ ] Cases - Notes/Hearings update/delete
- [ ] Dashboard - Stats endpoints
- [ ] Calendar - Grid endpoints
- [ ] Notifications - Bulk operations

### Phase 3: Medium Priority (Week 5-6)
- [ ] Expense Claims Module
- [ ] Expense Policies Module
- [ ] Client Verification (Wathq, Absher)
- [ ] Payment Receipts
- [ ] Settings endpoints
- [ ] User preferences

### Phase 4: Low Priority (Week 7+)
- [ ] Integrations Module
- [ ] Billing/Subscription
- [ ] Chatter/Social features
- [ ] Thread Messaging
- [ ] Email Marketing Segments
- [ ] CRM Appointments

---

## Testing Commands

After implementing each endpoint, verify with:

```bash
# Test endpoint exists
curl -X GET http://localhost:3000/api/[endpoint] -H "Authorization: Bearer $TOKEN"

# Check response format
curl -X GET http://localhost:3000/api/[endpoint] | jq '.success, .data, .message'

# Verify bilingual error
curl -X GET http://localhost:3000/api/nonexistent | jq '.error.message'
```

---

## Contact

For questions about frontend requirements:
- Check `[BACKEND-PENDING]` tags in frontend code
- Review documentation in `/docs/` folder
- Search for `console.warn('[BACKEND-PENDING]')` in codebase

---

*Last updated: 2025-12-23*
*Generated by: 80+ parallel agents scanning frontend codebase*
