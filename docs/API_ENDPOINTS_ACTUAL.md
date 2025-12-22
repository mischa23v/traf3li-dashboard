# API Endpoints - Actual Implementation Reference

**Last Updated:** 2025-12-22

This document provides a comprehensive reference of all API endpoints actually implemented and used in the Traf3li dashboard frontend. This is the source of truth for understanding which endpoints exist and how they are structured.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Messages & Chatter](#messages--chatter)
3. [Activities](#activities)
4. [CRM (Leads & Pipelines)](#crm-leads--pipelines)
5. [Setup Orchestration](#setup-orchestration)
6. [Firms & RBAC](#firms--rbac)
7. [Finance & Accounting](#finance--accounting)
8. [Human Resources](#human-resources)
9. [Documents & Files](#documents--files)
10. [Events & Calendar](#events--calendar)
11. [Tasks & Workflows](#tasks--workflows)
12. [NOT IMPLEMENTED](#not-implemented)

---

## Base URL Structure

### API Versioning
- **Production (via proxy):** `/api/v1`
- **Development (direct):** `https://api.traf3li.com/api/v1`
- **Auth endpoints:** `/api/auth/*` (NOT versioned)
- **AI endpoints:** `/api/ai/*` (NOT versioned)

### Configuration
All versioned endpoints automatically prepend `/api/v1` to the path.
See: `src/config/api.ts`

---

## Authentication

**Base Path:** `/api/auth/*` (NOT versioned - uses `/api/auth` directly)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/check-availability` | Check username/email availability |
| POST | `/api/auth/send-otp` | Send OTP for verification |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/resend-otp` | Resend OTP code |
| GET | `/api/auth/otp-status` | Get OTP status |

**Service:** `src/services/authService.ts`

**Important Notes:**
- Auth endpoints use `apiClientNoVersion` (not versioned)
- Cookies are HttpOnly for security
- All requests include credentials

---

## Messages & Chatter

### Messages

**Base Path:** `/api/messages/*`

**IMPORTANT:** All message endpoints use `/api/messages/*` (NOT `/api/thread-messages/*`)

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages/:conversationId` | Get messages for conversation |
| POST | `/messages` | Create/send message |
| PATCH | `/messages/:conversationId/read` | Mark messages as read |

**Service:** `src/services/messagesService.ts`

**Additional Endpoints (documented in types):**
- GET `/messages/:id` - Get single message
- POST `/messages/note` - Create internal note
- PATCH `/messages/:id` - Update message
- POST `/messages/:id/star` - Toggle star on message
- GET `/messages/thread/:resModel/:resId` - Get thread messages
- GET `/messages/search` - Search messages
- GET `/messages/starred` - Get starred messages
- GET `/messages/mentions` - Get mentions

**Types Reference:** `src/types/message.ts`

### Chatter (Followers)

**Base Path:** `/api/chatter/followers/*`

**IMPORTANT:** Uses `/api/chatter/followers/*` (NOT `/api/chatter-followers/*`)

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chatter/followers/:resModel/:resId` | Get followers for record |
| POST | `/chatter/followers` | Add follower |
| DELETE | `/chatter/followers/:followerId` | Remove follower |
| PATCH | `/chatter/followers/:followerId/preferences` | Update notification preferences |
| GET | `/chatter/followers/:resModel/:resId/me` | Check if current user follows |

**Service:** `src/services/chatterService.ts`

---

## Activities

**Base Path:** `/api/activities/*`

**IMPORTANT:** Activities use **query parameters** (res_model, res_id), NOT path parameters

#### Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| POST | `/activities` | Create activity | - |
| GET | `/activities` | Get activities with filters | `entityType`, `entityId`, `type`, `userId`, `fromDate`, `toDate`, `limit`, `page` |
| GET | `/activities/:id` | Get single activity | - |
| GET | `/activities/summary` | Get activity stats | - |
| GET | `/activities/overview` | Get activity overview | - |
| GET | `/activities/entity/:entityType/:entityId` | Get activities for entity | `limit` |

**Service:** `src/services/activityService.ts`

**Query Parameter Format:**
```javascript
GET /activities?entityType=task&entityId=123&limit=50&page=1
```

**NOT like this:**
```javascript
❌ GET /activities/task/123  // WRONG
✅ GET /activities/entity/task/123  // CORRECT (or use query params)
```

---

## CRM (Leads & Pipelines)

### Leads

**Base Path:** `/api/leads/*`

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | Get all leads |
| GET | `/leads/:id` | Get single lead with activities |
| POST | `/leads` | Create lead |
| PUT | `/leads/:id` | Update lead |
| DELETE | `/leads/:id` | Delete lead |
| POST | `/leads/:id/status` | Update lead status |
| POST | `/leads/:id/move` | Move lead to stage |
| GET | `/leads/:id/conversion-preview` | Preview conversion to client |
| POST | `/leads/:id/convert` | Convert lead to client |
| GET | `/leads/stats` | Get lead statistics |
| GET | `/leads/pipeline/:pipelineId?` | Get leads by pipeline (Kanban) |
| GET | `/leads/follow-up` | Get leads needing follow-up |
| GET | `/leads/:id/activities` | Get lead activities |
| POST | `/leads/:id/activities` | Log activity for lead |
| POST | `/leads/:id/follow-up` | Schedule follow-up |
| POST | `/leads/:id/verify/wathq` | Verify company (Saudi CR) |
| POST | `/leads/:id/verify/absher` | Verify individual (Absher) |
| POST | `/leads/:id/verify/address` | Verify national address |
| POST | `/leads/:id/conflict-check` | Check for conflicts |

### Pipelines

**Base Path:** `/api/crm-pipelines/*`

**IMPORTANT:** Pipeline endpoints use `/api/crm-pipelines/*` (NOT `/api/pipelines/*`)

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/crm-pipelines` | List all pipelines |
| GET | `/crm-pipelines/:id` | Get pipeline with stage counts |
| POST | `/crm-pipelines` | Create new pipeline |
| PUT | `/crm-pipelines/:id` | Update pipeline |
| DELETE | `/crm-pipelines/:id` | Delete pipeline |
| POST | `/crm-pipelines/:id/stages` | Add stage to pipeline |
| PUT | `/crm-pipelines/:id/stages/:stageId` | Update stage |
| DELETE | `/crm-pipelines/:id/stages/:stageId` | Remove stage |
| POST | `/crm-pipelines/:id/stages/reorder` | Reorder stages (uses POST, not PUT) |
| GET | `/crm-pipelines/:id/stats` | Get pipeline statistics |
| POST | `/crm-pipelines/:id/default` | Set as default pipeline |
| POST | `/crm-pipelines/:id/duplicate` | Duplicate pipeline |

**Service:** `src/services/crmService.ts`

**Important Notes:**
- Reorder endpoint uses POST, not PUT
- Stage operations are nested under pipeline ID
- Backend expects `firmId` automatically from auth context

---

## Setup Orchestration

**Base Path:** `/api/setup-orchestration/*`

**IMPORTANT:** Uses `/api/setup-orchestration/*` (NOT `/api/setup/*`)

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/setup-orchestration/status` | Get overall setup status for all modules |
| POST | `/setup-orchestration/modules/:module/complete` | Mark module as complete |
| POST | `/setup-orchestration/modules/:module/skip` | Mark module as skipped |
| POST | `/setup-orchestration/modules/:module/progress` | Save module progress |
| GET | `/setup-orchestration/modules/:module/progress` | Get saved progress |
| POST | `/setup-orchestration/reset` | Reset all setup progress (admin only) |

**Service:** `src/services/setupOrchestrationService.ts`

**Module Types:**
- `hr` - Human Resources (critical)
- `crm` - Customer Relationship Management (critical)
- `finance` - Finance & Accounting (critical)
- `inventory` - Inventory Management (non-critical)
- `projects` - Project Management (non-critical)

**Status Response:**
```json
{
  "overallProgress": 45.5,
  "completedModules": 1,
  "totalModules": 3,
  "hasAnySetupPending": true,
  "hasCriticalSetupPending": true,
  "modules": [...]
}
```

---

## Firms & RBAC

**Base Path:** `/api/firms/*`

**Note:** Backend uses "firm" as the entity name; frontend may use "company" in UI

#### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/firms/my/permissions` | Get current user's permissions |
| GET | `/firms/roles` | Get available roles |
| GET | `/firms/:id/team` | Get team members |
| GET | `/firms/:id/departed` | Get departed members |
| POST | `/firms/:id/members/:memberId/depart` | Process member departure |
| POST | `/firms/:id/members/:memberId/reinstate` | Reinstate departed member |

**Service:** `src/services/firmService.ts`

**Types Reference:** `src/types/rbac.ts`

---

## Finance & Accounting

### Accounts

**Base Path:** `/api/accounts/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | Get all accounts |
| GET | `/accounts/:id` | Get account by ID |
| GET | `/accounts/:id/balance` | Get account balance |
| GET | `/accounts/types` | Get account types |
| POST | `/accounts` | Create account |
| PATCH | `/accounts/:id` | Update account |
| DELETE | `/accounts/:id` | Delete account |

### Journal Entries

**Base Path:** `/api/journal-entries/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/journal-entries/simple` | Create simple journal entry |
| GET | `/journal-entries` | Get all journal entries |
| GET | `/journal-entries/:id` | Get journal entry by ID |
| POST | `/journal-entries` | Create journal entry |
| PATCH | `/journal-entries/:id` | Update journal entry |
| POST | `/journal-entries/:id/post` | Post journal entry |
| POST | `/journal-entries/:id/void` | Void journal entry |
| DELETE | `/journal-entries/:id` | Delete journal entry |
| POST | `/journal-entries/:id/attachments` | Add attachment |
| DELETE | `/journal-entries/:id/attachments/:attachmentId` | Remove attachment |
| GET | `/journal-entries/stats` | Get statistics |
| POST | `/journal-entries/validate` | Validate entry |
| GET | `/journal-entries/recent` | Get recent entries |
| POST | `/journal-entries/:id/duplicate` | Duplicate entry |
| GET | `/journal-entries/templates` | Get templates |
| POST | `/journal-entries/from-template/:templateId` | Create from template |

### Billing & Time Tracking

**Base Path:** `/api/billing/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing/rates` | Get billing rates |
| GET | `/billing/rates/:id` | Get rate by ID |
| POST | `/billing/rates` | Create billing rate |
| PUT | `/billing/rates/:id` | Update billing rate |
| DELETE | `/billing/rates/:id` | Delete billing rate |
| GET | `/billing/rates/stats` | Get rate statistics |
| GET | `/billing/rates/applicable` | Get applicable rates |
| POST | `/billing/rates/standard` | Set standard rate |
| GET | `/billing/groups` | Get billing groups |
| GET | `/billing/groups/:id` | Get group by ID |
| GET | `/billing/groups/default` | Get default group |
| POST | `/billing/groups` | Create billing group |
| PATCH | `/billing/groups/:id` | Update billing group |
| DELETE | `/billing/groups/:id` | Delete billing group |
| POST | `/billing/groups/:groupId/rates` | Add rate to group |
| DELETE | `/billing/groups/:groupId/rates/:rateId` | Remove rate from group |
| POST | `/billing/groups/:id/duplicate` | Duplicate group |
| GET | `/billing/time-entries` | Get time entries |
| POST | `/billing/time-entries` | Create time entry |
| PATCH | `/billing/time-entries/:id` | Update time entry |
| DELETE | `/billing/time-entries/:id` | Delete time entry |
| POST | `/billing/time-entries/approve` | Approve time entries |
| GET | `/billing/statistics` | Get billing statistics |

### Rate Cards

**Base Path:** `/api/rate-cards/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rate-cards` | Get all rate cards |
| GET | `/rate-cards/client/:clientId` | Get rate cards for client |
| GET | `/rate-cards/case/:caseId` | Get rate cards for case |
| POST | `/rate-cards` | Create rate card |
| PATCH | `/rate-cards/:id` | Update rate card |
| DELETE | `/rate-cards/:id` | Delete rate card |
| POST | `/rate-cards/calculate` | Calculate billing amount |
| POST | `/rate-cards/:id/rates` | Add rate to card |
| PATCH | `/rate-cards/:id/rates/:rateId` | Update rate on card |
| DELETE | `/rate-cards/:id/rates/:rateId` | Remove rate from card |

**Service:** `src/services/billingRatesService.ts`

---

## Human Resources

### Employees

**Base Path:** `/api/staff/*` or `/api/hr/employees/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff` | Get all staff |
| GET | `/staff/:id` | Get staff by ID |
| POST | `/staff` | Create staff |
| PUT | `/staff/:id` | Update staff |
| PATCH | `/staff/:id` | Partially update staff |
| DELETE | `/staff/:id` | Delete staff |
| GET | `/staff/team` | Get team members |

**Service:** `src/services/staffService.ts`

### HR Settings

**Base Path:** `/api/settings/hr/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/hr` | Get HR settings |
| PATCH | `/settings/hr` | Update HR settings |
| PATCH | `/settings/hr/employee` | Update employee settings |
| PATCH | `/settings/hr/leave` | Update leave settings |
| PATCH | `/settings/hr/attendance` | Update attendance settings |
| PATCH | `/settings/hr/payroll` | Update payroll settings |
| PATCH | `/settings/hr/expense` | Update expense settings |

**Service:** `src/services/hrSettingsService.ts`

---

## Documents & Files

### Legal Documents

**Base Path:** `/api/legal-documents/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/legal-documents` | Get all legal documents |
| GET | `/legal-documents/:id` | Get document by ID |
| POST | `/legal-documents` | Create document |
| PATCH | `/legal-documents/:id` | Update document |
| DELETE | `/legal-documents/:id` | Delete document |
| POST | `/legal-documents/:id/download` | Download document |
| POST | `/legal-documents/:id/upload` | Upload document file |
| GET | `/legal-documents/search` | Search documents |
| GET | `/legal-documents/category/:category` | Get by category |
| GET | `/legal-documents/categories` | Get all categories |
| POST | `/legal-documents/:id/duplicate` | Duplicate document |
| GET | `/legal-documents/:id/export` | Export document |

**Service:** `src/services/legalDocumentService.ts`

---

## Events & Calendar

**Base Path:** `/api/events/*`

### Core Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | Get all events |
| GET | `/events/calendar` | Get calendar view |
| GET | `/events/:id` | Get event by ID |
| POST | `/events` | Create event |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |
| POST | `/events/:id/complete` | Mark event complete |
| POST | `/events/:id/cancel` | Cancel event |
| POST | `/events/:id/postpone` | Postpone event |
| POST | `/events/:id/reschedule` | Reschedule event |
| POST | `/events/:id/start` | Start event |

### Event Attendees

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:eventId/attendees` | Add attendee |
| PATCH | `/events/:eventId/attendees/:attendeeId` | Update attendee |
| DELETE | `/events/:eventId/attendees/:attendeeId` | Remove attendee |
| POST | `/events/:eventId/rsvp` | RSVP to event |
| POST | `/events/:eventId/send-invitations` | Send invitations |
| POST | `/events/:eventId/attendees/:attendeeId/check-in` | Check-in attendee |
| POST | `/events/:eventId/attendees/:attendeeId/check-out` | Check-out attendee |

### Event Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:eventId/agenda` | Add agenda item |
| PUT | `/events/:eventId/agenda/:agendaId` | Update agenda item |
| DELETE | `/events/:eventId/agenda/:agendaId` | Delete agenda item |
| PATCH | `/events/:eventId/notes` | Update meeting notes |
| POST | `/events/:eventId/action-items` | Add action item |
| PUT | `/events/:eventId/action-items/:itemId` | Update action item |
| POST | `/events/:eventId/action-items/:actionItemId/toggle` | Toggle action item |
| POST | `/events/:eventId/attachments` | Add attachment |
| DELETE | `/events/:eventId/attachments/:attachmentId` | Remove attachment |
| POST | `/events/:eventId/comments` | Add comment |
| PATCH | `/events/:eventId/comments/:commentId` | Update comment |
| DELETE | `/events/:eventId/comments/:commentId` | Delete comment |

### Event Queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/upcoming` | Get upcoming events |
| GET | `/events/today` | Get today's events |
| GET | `/events/date/:date` | Get events for date |
| GET | `/events/month/:year/:month` | Get events for month |
| GET | `/events/my-events` | Get current user's events |
| GET | `/events/pending-rsvp` | Get events pending RSVP |
| GET | `/events/stats` | Get event statistics |

### Recurring Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:eventId/recurring/skip` | Skip recurring instance |
| POST | `/events/:eventId/recurring/stop` | Stop recurring series |
| GET | `/events/:eventId/recurring/instances` | Get recurring instances |
| PUT | `/events/:eventId/recurring/instance/:instanceDate` | Update instance |

### Event Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:eventId/calendar-sync` | Sync to external calendar |
| GET | `/events/:eventId/export/ics` | Export as ICS |
| POST | `/events/import/ics` | Import ICS file |
| PUT | `/events/bulk` | Bulk update events |
| DELETE | `/events/bulk` | Bulk delete events |
| POST | `/events/bulk/cancel` | Bulk cancel events |

### Event Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/templates` | Get event templates |
| POST | `/events/templates/:templateId/create` | Create from template |
| POST | `/events/:eventId/save-as-template` | Save as template |

### Availability

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/check-availability` | Check availability |
| POST | `/events/find-slots` | Find available time slots |

**Service:** `src/services/eventsService.ts`

---

## Tasks & Workflows

### Case Workflows

**Base Path:** `/api/case-workflows/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/case-workflows` | Get all workflows |
| GET | `/case-workflows/:id` | Get workflow by ID |
| GET | `/case-workflows/category/:category` | Get workflows by category |
| POST | `/case-workflows` | Create workflow |
| PATCH | `/case-workflows/:id` | Update workflow |
| DELETE | `/case-workflows/:id` | Delete workflow |
| POST | `/case-workflows/:id/duplicate` | Duplicate workflow |
| POST | `/case-workflows/:id/stages` | Add stage |
| PATCH | `/case-workflows/:workflowId/stages/:stageId` | Update stage |
| DELETE | `/case-workflows/:workflowId/stages/:stageId` | Delete stage |
| PATCH | `/case-workflows/:id/stages/reorder` | Reorder stages |
| POST | `/case-workflows/:workflowId/stages/:stageId/requirements` | Add requirement |
| PATCH | `/case-workflows/:workflowId/stages/:stageId/requirements/:reqId` | Update requirement |
| DELETE | `/case-workflows/:workflowId/stages/:stageId/requirements/:reqId` | Delete requirement |
| POST | `/case-workflows/:id/transitions` | Add transition |
| PATCH | `/case-workflows/:workflowId/transitions/:transitionId` | Update transition |
| DELETE | `/case-workflows/:workflowId/transitions/:transitionId` | Delete transition |
| POST | `/case-workflows/cases/:caseId/initialize` | Initialize workflow for case |
| GET | `/case-workflows/cases/:caseId/progress` | Get case progress |
| POST | `/case-workflows/cases/:caseId/move` | Move case to stage |
| POST | `/case-workflows/cases/:caseId/requirements/complete` | Complete requirement |
| GET | `/case-workflows/statistics` | Get workflow statistics |
| GET | `/case-workflows/presets` | Get workflow presets |
| POST | `/case-workflows/presets/:presetId/import` | Import preset |

**Service:** `src/services/caseWorkflowsService.ts`

---

## Email Marketing

**Base Path:** `/api/email-marketing/*`

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/email-marketing/campaigns` | Create campaign |
| GET | `/email-marketing/campaigns` | Get all campaigns |
| GET | `/email-marketing/campaigns/:id` | Get campaign by ID |
| PUT | `/email-marketing/campaigns/:id` | Update campaign |
| DELETE | `/email-marketing/campaigns/:id` | Delete campaign |
| POST | `/email-marketing/campaigns/:id/duplicate` | Duplicate campaign |
| POST | `/email-marketing/campaigns/:id/schedule` | Schedule campaign |
| POST | `/email-marketing/campaigns/:id/send` | Send campaign |
| POST | `/email-marketing/campaigns/:id/pause` | Pause campaign |
| POST | `/email-marketing/campaigns/:id/resume` | Resume campaign |
| POST | `/email-marketing/campaigns/:id/cancel` | Cancel campaign |
| POST | `/email-marketing/campaigns/:id/test` | Send test email |
| GET | `/email-marketing/campaigns/:id/analytics` | Get campaign analytics |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/email-marketing/templates` | Create template |
| GET | `/email-marketing/templates` | Get user's templates |
| GET | `/email-marketing/templates/public` | Get public templates |
| GET | `/email-marketing/templates/:id` | Get template by ID |
| PUT | `/email-marketing/templates/:id` | Update template |
| DELETE | `/email-marketing/templates/:id` | Delete template |
| POST | `/email-marketing/templates/:id/preview` | Preview template |

### Subscribers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/email-marketing/subscribers` | Add subscriber |
| GET | `/email-marketing/subscribers` | Get all subscribers |
| PUT | `/email-marketing/subscribers/:id` | Update subscriber |
| DELETE | `/email-marketing/subscribers/:id` | Delete subscriber |
| POST | `/email-marketing/subscribers/import` | Import subscribers |
| POST | `/email-marketing/subscribers/export` | Export subscribers |

**Service:** `src/services/emailMarketingService.ts`

---

## Quotes

**Base Path:** `/api/quotes/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quotes` | Get all quotes |
| GET | `/quotes/:id` | Get quote by ID |
| POST | `/quotes` | Create quote |
| PUT | `/quotes/:id` | Update quote |
| DELETE | `/quotes/:id` | Delete quote |
| POST | `/quotes/:id/send` | Send quote to client |
| PATCH | `/quotes/:id/status` | Update quote status |
| POST | `/quotes/:id/convert-to-invoice` | Convert to invoice |
| GET | `/quotes/summary` | Get quote summary |
| POST | `/quotes/:id/duplicate` | Duplicate quote |

**Service:** `src/services/quoteService.ts`

---

## Corporate Cards

**Base Path:** `/api/corporate-cards/*`

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/corporate-cards` | Get all cards |
| GET | `/corporate-cards/:id` | Get card by ID |
| POST | `/corporate-cards` | Create card |
| PATCH | `/corporate-cards/:id` | Update card |
| DELETE | `/corporate-cards/:id` | Delete card |
| POST | `/corporate-cards/:id/block` | Block card |
| POST | `/corporate-cards/:id/unblock` | Unblock card |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/corporate-cards/transactions` | Get all transactions |
| GET | `/corporate-cards/transactions/:id` | Get transaction by ID |
| POST | `/corporate-cards/transactions` | Create transaction |
| PATCH | `/corporate-cards/transactions/:id` | Update transaction |
| DELETE | `/corporate-cards/transactions/:id` | Delete transaction |
| POST | `/corporate-cards/transactions/:transactionId/reconcile` | Reconcile transaction |
| POST | `/corporate-cards/transactions/bulk-reconcile` | Bulk reconcile |
| POST | `/corporate-cards/transactions/:transactionId/match` | Match to expense |
| GET | `/corporate-cards/transactions/:transactionId/potential-matches` | Get potential matches |
| POST | `/corporate-cards/transactions/:transactionId/dispute` | Dispute transaction |
| POST | `/corporate-cards/transactions/:transactionId/resolve-dispute` | Resolve dispute |
| POST | `/corporate-cards/transactions/import` | Import transactions |
| GET | `/corporate-cards/transactions/csv-template` | Get CSV template |

### Reports & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/corporate-cards/statistics` | Get statistics |
| GET | `/corporate-cards/reports/reconciliation` | Get reconciliation report |
| GET | `/corporate-cards/reports/reconciliation/export` | Export reconciliation report |
| GET | `/corporate-cards/analytics/spending-by-category` | Spending by category |
| GET | `/corporate-cards/analytics/spending-by-card` | Spending by card |
| GET | `/corporate-cards/analytics/monthly-trend` | Monthly spending trend |

**Service:** `src/services/corporateCardService.ts`

---

## Currency

**Base Path:** `/api/currency/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/currency/settings` | Get currency settings |
| GET | `/currency/rates` | Get exchange rates |
| POST | `/currency/convert` | Convert amount |
| POST | `/currency/rates` | Set custom exchange rate |
| GET | `/currency/supported` | Get supported currencies |
| POST | `/currency/update` | Update exchange rates |

**Reference:** `src/config/API_ROUTES_REFERENCE.ts`

---

## Peer Review

**Base Path:** `/api/peerReview/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/peerReview/:lawyerId` | Get reviews for lawyer |
| POST | `/peerReview` | Submit peer review |
| PATCH | `/peerReview/verify/:id` | Verify review |

**Service:** `src/services/peerReviewService.ts`

---

## AI Endpoints

**Base Path:** `/api/ai/*` (NOT versioned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | AI chat endpoint |
| GET | `/api/ai/models` | Get available AI models |
| POST | `/api/ai/summarize` | Summarize text |

**Functions:**
- `functions/api/ai/chat.ts`
- `functions/api/ai/models.ts`
- `functions/api/ai/summarize.ts`

---

## NOT IMPLEMENTED

The following features have frontend service files but **backend endpoints are NOT implemented**:

### Lock Dates

**Expected Base Path:** `/api/lock-dates/*`

**Status:** ❌ Backend NOT implemented

**Service:** `src/services/lockDateService.ts`

**Expected Endpoints:**
- GET `/lock-dates` - Get lock date configuration
- PATCH `/lock-dates/:lockType` - Update lock date
- DELETE `/lock-dates/:lockType` - Clear lock date
- POST `/lock-dates/check` - Check if date is locked
- POST `/lock-dates/check-range` - Check date range
- POST `/lock-dates/periods/lock` - Lock fiscal period
- POST `/lock-dates/periods/reopen` - Reopen period
- GET `/lock-dates/periods` - Get fiscal periods
- GET `/lock-dates/history` - Get lock date history
- PATCH `/lock-dates/fiscal-year-end` - Update fiscal year end

### Automated Actions

**Expected Base Path:** `/api/automated-actions/*`

**Status:** ❌ Backend NOT implemented

**Service:** `src/services/automatedActionService.ts`

**Expected Endpoints:**
- GET `/automated-actions` - Get all automated actions
- GET `/automated-actions/:id` - Get action by ID
- POST `/automated-actions` - Create automated action
- PATCH `/automated-actions/:id` - Update action
- DELETE `/automated-actions/:id` - Delete action
- POST `/automated-actions/:id/toggle` - Toggle active status
- POST `/automated-actions/:id/test` - Test action
- POST `/automated-actions/:id/duplicate` - Duplicate action
- GET `/automated-actions/:id/logs` - Get execution logs
- GET `/automated-actions/logs` - Get all logs
- GET `/automated-actions/models` - Get available models
- GET `/automated-actions/models/:modelName/fields` - Get model fields
- POST `/automated-actions/bulk/enable` - Bulk enable
- POST `/automated-actions/bulk/disable` - Bulk disable
- POST `/automated-actions/bulk/delete` - Bulk delete

---

## Important Path Corrections

### Summary of Corrections

1. **Messages:** `/api/messages/*` ✅ (NOT `/api/thread-messages/*` ❌)
2. **Followers:** `/api/chatter/followers/*` ✅ (NOT `/api/chatter-followers/*` ❌)
3. **Activities:** Use query params (`?res_model=X&res_id=Y`) ✅ (NOT path params `/activities/:resModel/:resId` ❌)
4. **Pipelines:** `/api/crm-pipelines/*` ✅ (NOT `/api/pipelines/*` ❌)
5. **Setup:** `/api/setup-orchestration/*` ✅ (NOT `/api/setup/*` ❌)
6. **Lock Dates:** ❌ Backend NOT implemented
7. **Automated Actions:** ❌ Backend NOT implemented

---

## Development Notes

### Testing Endpoints

All service files use the centralized API client:
- `src/lib/api.ts` - Main API client
- `src/config/api.ts` - API configuration

### Error Handling

All services use `handleApiError` from `@/lib/api`:
```typescript
import apiClient, { handleApiError } from '@/lib/api'

try {
  const response = await apiClient.get('/endpoint')
  return response.data
} catch (error: any) {
  throw new Error(handleApiError(error))
}
```

### Authentication

Most endpoints require authentication via HttpOnly cookies. The API client automatically includes credentials:
```typescript
withCredentials: true
```

### Timeouts

Different timeout tiers based on operation type:
- AUTH: 5s
- CRITICAL: 5s
- DEFAULT: 10s
- HEAVY: 30s (reports, exports)
- UPLOAD: 2min
- LONG_RUNNING: 5min

See `src/config/api.ts` for details.

---

## Contributing

When adding new endpoints:

1. Add the endpoint to the appropriate service file
2. Update this documentation
3. Add TypeScript types if needed
4. Use the centralized API client
5. Include proper error handling
6. Document query parameters clearly

---

**This document is maintained as the source of truth for actual API endpoints.**
**Last verified:** 2025-12-22
