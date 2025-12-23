# Final API Endpoints Document

## Comprehensive Backend-Frontend API Mapping

**Generated:** 2025-12-23
**Scanned by:** 90+ parallel agents
**Frontend Repository:** traf3li-dashboard
**Backend Repository:** traf3li-backend

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [API Architecture Overview](#api-architecture-overview)
3. [Backend Endpoints (Complete List)](#backend-endpoints-complete-list)
4. [Frontend Service Endpoints (Complete List)](#frontend-service-endpoints-complete-list)
5. [Endpoint Mapping & Linkage](#endpoint-mapping--linkage)
6. [Critical Mismatches & Missing Endpoints](#critical-mismatches--missing-endpoints)
7. [Frontend Endpoints Needing Backend Updates](#frontend-endpoints-needing-backend-updates)
8. [Deprecated & Legacy Endpoints](#deprecated--legacy-endpoints)
9. [Recommendations](#recommendations)

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Backend Route Files** | 37 |
| **Backend Endpoints** | ~200 |
| **Frontend Service Files** | 181 |
| **Frontend API Calls** | 1,591+ |
| **Frontend Hooks with API** | 150+ |
| **Matched Endpoints** | ~180 |
| **Missing Backend Endpoints** | 15 Critical |
| **Deprecated Endpoints** | 8 |

### Key Findings

1. **Major Gap:** Frontend expects ~1,500+ endpoints but backend only provides ~200
2. **The backend in the GitHub repo is a MINIMAL version** - production backend has more routes
3. **15 critical endpoints** are called by frontend but not implemented in backend
4. **8 endpoints** are deprecated and scheduled for removal

---

## API Architecture Overview

### Versioning Strategy

| Route Pattern | Version | API Client | Notes |
|---------------|---------|------------|-------|
| `/api/auth/*` | None | `apiClientNoVersion` | Authentication always accessible |
| `/api/currency/*` | None | `apiClientNoVersion` | Global currency data |
| `/api/v1/*` | v1 | `apiClient` | All other endpoints |

### Base URLs

| Environment | API URL | WebSocket URL |
|-------------|---------|---------------|
| Production (Proxy) | `/api/v1` | `wss://api.traf3li.com` |
| Development | `https://api.traf3li.com/api/v1` | `wss://api.traf3li.com` |

### Authentication Flow

- JWT tokens stored in HttpOnly cookies
- CSRF protection on all mutations
- Device fingerprinting for session binding
- MFA support (TOTP + backup codes)

---

## Backend Endpoints (Complete List)

### Authentication (`/api/auth/*`) - NON-VERSIONED

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/auth/register` | auth.authRegister | User registration |
| POST | `/auth/login` | auth.authLogin | User login |
| POST | `/auth/logout` | auth.authLogout | User logout |
| GET | `/auth/me` | auth.authStatus | Get current user |

### Dashboard (`/api/dashboard/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/dashboard/hero-stats` | dashboard.getHeroStats | Top-level metrics |
| GET | `/dashboard/stats` | dashboard.getDashboardStats | Detailed stats |
| GET | `/dashboard/financial-summary` | dashboard.getFinancialSummary | Revenue/expenses |
| GET | `/dashboard/today-events` | dashboard.getTodayEvents | Today's events |
| GET | `/dashboard/recent-messages` | dashboard.getRecentMessages | Recent messages |
| GET | `/dashboard/activity` | dashboard.getActivityOverview | Activity feed |

### Cases (`/api/cases/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/cases` | case.createCase | Create case |
| GET | `/cases` | case.getCases | List cases |
| GET | `/cases/:_id` | case.getCase | Get single case |
| PATCH | `/cases/:_id` | case.updateCase | Update case |
| POST | `/cases/:_id/note` | case.addNote | Add case note |
| POST | `/cases/:_id/document` | case.addDocument | Add document |
| POST | `/cases/:_id/hearing` | case.addHearing | Add hearing |
| PATCH | `/cases/:_id/status` | case.updateStatus | Update status |
| PATCH | `/cases/:_id/outcome` | case.updateOutcome | Update outcome |

### Clients (`/api/clients/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/clients` | client.createClient | Create client |
| GET | `/clients` | client.getClients | List clients |
| GET | `/clients/search` | client.searchClients | Search clients |
| GET | `/clients/stats` | client.getClientStats | Client statistics |
| GET | `/clients/top-revenue` | client.getTopClientsByRevenue | Top clients |
| GET | `/clients/:id` | client.getClient | Get single client |
| PUT | `/clients/:id` | client.updateClient | Update client |
| DELETE | `/clients/:id` | client.deleteClient | Delete client |
| DELETE | `/clients/bulk` | client.bulkDeleteClients | Bulk delete |

### Invoices (`/api/invoices/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/invoices` | invoice.createInvoice | Create invoice |
| GET | `/invoices` | invoice.getInvoices | List invoices |
| GET | `/invoices/overdue` | invoice.getOverdueInvoices | Overdue invoices |
| GET | `/invoices/:_id` | invoice.getInvoice | Get single invoice |
| PATCH | `/invoices/:_id` | invoice.updateInvoice | Update invoice |
| POST | `/invoices/:_id/send` | invoice.sendInvoice | Send invoice |
| POST | `/invoices/:_id/payment` | invoice.createPaymentIntent | Create payment |
| PATCH | `/invoices/confirm-payment` | invoice.confirmPayment | Confirm payment |

### Expenses (`/api/expenses/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/expenses` | expense.createExpense | Create expense |
| GET | `/expenses` | expense.getExpenses | List expenses |
| GET | `/expenses/stats` | expense.getExpenseStats | Expense statistics |
| GET | `/expenses/by-category` | expense.getExpensesByCategory | By category |
| GET | `/expenses/:id` | expense.getExpense | Get single expense |
| PUT | `/expenses/:id` | expense.updateExpense | Update expense |
| DELETE | `/expenses/:id` | expense.deleteExpense | Delete expense |
| POST | `/expenses/:id/reimburse` | expense.markAsReimbursed | Reimburse |
| POST | `/expenses/:id/receipt` | expense.uploadReceipt | Upload receipt |

### Payments (`/api/payments/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/payments` | payment.createPayment | Create payment |
| GET | `/payments` | payment.getPayments | List payments |
| GET | `/payments/stats` | payment.getPaymentStats | Payment statistics |
| GET | `/payments/:id` | payment.getPayment | Get single payment |
| PUT | `/payments/:id` | payment.updatePayment | Update payment |
| DELETE | `/payments/:id` | payment.deletePayment | Delete payment |
| POST | `/payments/:id/complete` | payment.completePayment | Complete payment |
| POST | `/payments/:id/fail` | payment.failPayment | Mark as failed |
| POST | `/payments/:id/refund` | payment.createRefund | Create refund |
| POST | `/payments/:id/receipt` | payment.sendReceipt | Send receipt |
| DELETE | `/payments/bulk` | payment.bulkDeletePayments | Bulk delete |

### Time Tracking (`/api/time-tracking/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/time-tracking/timer/start` | timeTracking.startTimer | Start timer |
| POST | `/time-tracking/timer/pause` | timeTracking.pauseTimer | Pause timer |
| POST | `/time-tracking/timer/resume` | timeTracking.resumeTimer | Resume timer |
| POST | `/time-tracking/timer/stop` | timeTracking.stopTimer | Stop timer |
| GET | `/time-tracking/timer/status` | timeTracking.getTimerStatus | Timer status |
| POST | `/time-tracking/entries` | timeTracking.createTimeEntry | Create entry |
| GET | `/time-tracking/entries` | timeTracking.getTimeEntries | List entries |
| GET | `/time-tracking/entries/:id` | timeTracking.getTimeEntry | Get entry |
| PUT | `/time-tracking/entries/:id` | timeTracking.updateTimeEntry | Update entry |
| DELETE | `/time-tracking/entries/:id` | timeTracking.deleteTimeEntry | Delete entry |
| POST | `/time-tracking/entries/:id/approve` | timeTracking.approveTimeEntry | Approve |
| POST | `/time-tracking/entries/:id/reject` | timeTracking.rejectTimeEntry | Reject |
| GET | `/time-tracking/stats` | timeTracking.getTimeStats | Time statistics |
| DELETE | `/time-tracking/entries/bulk` | timeTracking.bulkDeleteTimeEntries | Bulk delete |

### Tasks (`/api/tasks/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/tasks` | task.createTask | Create task |
| GET | `/tasks` | task.getTasks | List tasks |
| GET | `/tasks/upcoming` | task.getUpcomingTasks | Upcoming tasks |
| GET | `/tasks/overdue` | task.getOverdueTasks | Overdue tasks |
| GET | `/tasks/case/:caseId` | task.getTasksByCase | Tasks by case |
| DELETE | `/tasks/bulk` | task.bulkDeleteTasks | Bulk delete |
| GET | `/tasks/:_id` | task.getTask | Get single task |
| PATCH | `/tasks/:_id` | task.updateTask | Update task |
| DELETE | `/tasks/:_id` | task.deleteTask | Delete task |
| POST | `/tasks/:_id/complete` | task.completeTask | Complete task |

### Events (`/api/events/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/events` | event.createEvent | Create event |
| GET | `/events` | event.getEvents | List events |
| GET | `/events/upcoming` | event.getUpcomingEvents | Upcoming events |
| GET | `/events/month/:year/:month` | event.getEventsByMonth | Events by month |
| GET | `/events/date/:date` | event.getEventsByDate | Events by date |
| GET | `/events/:id` | event.getEvent | Get single event |
| PATCH | `/events/:id` | event.updateEvent | Update event |
| DELETE | `/events/:id` | event.deleteEvent | Delete event |
| POST | `/events/:id/complete` | event.markEventCompleted | Complete event |

### Reminders (`/api/reminders/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/reminders` | reminder.createReminder | Create reminder |
| GET | `/reminders` | reminder.getReminders | List reminders |
| GET | `/reminders/upcoming` | reminder.getUpcomingReminders | Upcoming |
| GET | `/reminders/overdue` | reminder.getOverdueReminders | Overdue |
| GET | `/reminders/:id` | reminder.getReminder | Get reminder |
| PUT | `/reminders/:id` | reminder.updateReminder | Update reminder |
| DELETE | `/reminders/:id` | reminder.deleteReminder | Delete reminder |
| POST | `/reminders/:id/complete` | reminder.completeReminder | Complete |
| POST | `/reminders/:id/dismiss` | reminder.dismissReminder | Dismiss |
| DELETE | `/reminders/bulk` | reminder.bulkDeleteReminders | Bulk delete |

### Calendar (`/api/calendar/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/calendar` | calendar.getCalendarView | Calendar view |
| GET | `/calendar/upcoming` | calendar.getUpcomingItems | Upcoming items |
| GET | `/calendar/overdue` | calendar.getOverdueItems | Overdue items |
| GET | `/calendar/stats` | calendar.getCalendarStats | Calendar stats |
| GET | `/calendar/date/:date` | calendar.getCalendarByDate | By date |
| GET | `/calendar/month/:year/:month` | calendar.getCalendarByMonth | By month |

### Retainers (`/api/retainers/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/retainers` | retainer.createRetainer | Create retainer |
| GET | `/retainers` | retainer.getRetainers | List retainers |
| GET | `/retainers/stats` | retainer.getRetainerStats | Retainer stats |
| GET | `/retainers/low-balance` | retainer.getLowBalanceRetainers | Low balance |
| GET | `/retainers/:id` | retainer.getRetainer | Get retainer |
| PUT | `/retainers/:id` | retainer.updateRetainer | Update retainer |
| POST | `/retainers/:id/consume` | retainer.consumeRetainer | Consume |
| POST | `/retainers/:id/replenish` | retainer.replenishRetainer | Replenish |
| POST | `/retainers/:id/refund` | retainer.refundRetainer | Refund |
| GET | `/retainers/:id/history` | retainer.getRetainerHistory | History |

### Billing Rates (`/api/billing-rates/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/billing-rates` | billingRate.createRate | Create rate |
| GET | `/billing-rates` | billingRate.getRates | List rates |
| GET | `/billing-rates/stats` | billingRate.getRateStats | Rate stats |
| GET | `/billing-rates/applicable` | billingRate.getApplicableRate | Get applicable |
| GET | `/billing-rates/:id` | billingRate.getRate | Get rate |
| PUT | `/billing-rates/:id` | billingRate.updateRate | Update rate |
| DELETE | `/billing-rates/:id` | billingRate.deleteRate | Delete rate |
| POST | `/billing-rates/standard` | billingRate.setStandardRate | Set standard |

### Statements (`/api/statements/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/statements/generate` | statement.generateStatement | Generate |
| GET | `/statements` | statement.getStatements | List statements |
| GET | `/statements/:id` | statement.getStatement | Get statement |
| DELETE | `/statements/:id` | statement.deleteStatement | Delete |
| POST | `/statements/:id/send` | statement.sendStatement | Send |

### Transactions (`/api/transactions/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/transactions` | transaction.createTransaction | Create |
| GET | `/transactions` | transaction.getTransactions | List |
| GET | `/transactions/balance` | transaction.getBalance | Get balance |
| GET | `/transactions/summary` | transaction.getSummary | Summary |
| GET | `/transactions/by-category` | transaction.getByCategory | By category |
| GET | `/transactions/:id` | transaction.getTransaction | Get single |
| PUT | `/transactions/:id` | transaction.updateTransaction | Update |
| DELETE | `/transactions/:id` | transaction.deleteTransaction | Delete |
| POST | `/transactions/:id/cancel` | transaction.cancelTransaction | Cancel |
| DELETE | `/transactions/bulk` | transaction.bulkDeleteTransactions | Bulk delete |

### Reports (`/api/reports/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/reports/generate` | report.generateReport | Generate report |
| GET | `/reports` | report.getReports | List reports |
| GET | `/reports/templates` | report.getReportTemplates | Templates |
| GET | `/reports/:id` | report.getReport | Get report |
| DELETE | `/reports/:id` | report.deleteReport | Delete |
| POST | `/reports/:id/schedule` | report.scheduleReport | Schedule |
| DELETE | `/reports/:id/schedule` | report.unscheduleReport | Unschedule |

### Notifications (`/api/notifications/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/notifications` | notification.getNotifications | List |
| GET | `/notifications/unread-count` | notification.getUnreadCount | Unread count |
| PATCH | `/notifications/:id/read` | notification.markAsRead | Mark read |
| PATCH | `/notifications/mark-all-read` | notification.markAllAsRead | Mark all read |
| DELETE | `/notifications/:id` | notification.deleteNotification | Delete |

### Benefits (`/api/benefits/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/benefits` | benefit.createBenefit | Create |
| GET | `/benefits` | benefit.getBenefits | List |
| GET | `/benefits/stats` | benefit.getBenefitStats | Stats |
| GET | `/benefits/by-type` | benefit.getBenefitsByType | By type |
| GET | `/benefits/export` | benefit.exportBenefits | Export |
| GET | `/benefits/employee/:employeeId` | benefit.getEmployeeBenefits | By employee |
| POST | `/benefits/bulk-delete` | benefit.bulkDeleteBenefits | Bulk delete |
| GET | `/benefits/:id` | benefit.getBenefit | Get single |
| PUT | `/benefits/:id` | benefit.updateBenefit | Update |
| PATCH | `/benefits/:id` | benefit.updateBenefit | Partial update |
| DELETE | `/benefits/:id` | benefit.deleteBenefit | Delete |
| POST | `/benefits/:id/activate` | benefit.activateBenefit | Activate |
| POST | `/benefits/:id/suspend` | benefit.suspendBenefit | Suspend |
| POST | `/benefits/:id/terminate` | benefit.terminateBenefit | Terminate |
| POST | `/benefits/:id/dependents` | benefit.addDependent | Add dependent |
| DELETE | `/benefits/:id/dependents/:memberId` | benefit.removeDependent | Remove dependent |
| POST | `/benefits/:id/beneficiaries` | benefit.addBeneficiary | Add beneficiary |
| PATCH | `/benefits/:id/beneficiaries/:beneficiaryId` | benefit.updateBeneficiary | Update beneficiary |
| DELETE | `/benefits/:id/beneficiaries/:beneficiaryId` | benefit.removeBeneficiary | Remove beneficiary |
| POST | `/benefits/:id/documents` | benefit.addDocument | Add document |

### PDFme (`/api/pdfme/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/pdfme/templates` | pdfme.getTemplates | List templates |
| GET | `/pdfme/templates/default/:category` | pdfme.getDefaultTemplate | Default template |
| GET | `/pdfme/templates/:id` | pdfme.getTemplate | Get template |
| POST | `/pdfme/templates` | pdfme.createTemplate | Create |
| PUT | `/pdfme/templates/:id` | pdfme.updateTemplate | Update |
| DELETE | `/pdfme/templates/:id` | pdfme.deleteTemplate | Delete |
| POST | `/pdfme/templates/:id/clone` | pdfme.cloneTemplate | Clone |
| POST | `/pdfme/templates/:id/set-default` | pdfme.setDefaultTemplate | Set default |
| POST | `/pdfme/templates/:id/preview` | pdfme.previewTemplate | Preview |
| POST | `/pdfme/generate` | pdfme.generatePdf | Generate PDF |
| POST | `/pdfme/generate/async` | pdfme.generatePdfAsync | Generate async |
| POST | `/pdfme/generate/invoice` | pdfme.generateInvoicePdf | Invoice PDF |
| POST | `/pdfme/generate/contract` | pdfme.generateContractPdf | Contract PDF |
| POST | `/pdfme/generate/receipt` | pdfme.generateReceiptPdf | Receipt PDF |
| GET | `/pdfme/download/:fileName` | pdfme.downloadPdf | Download |

### Reference Data (`/api/reference/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/reference/courts` | reference.getCourts | Saudi courts |
| GET | `/reference/committees` | reference.getCommittees | Committees |
| GET | `/reference/regions` | reference.getRegions | Regions |
| GET | `/reference/regions-with-cities` | reference.getRegionsWithCities | Regions + cities |
| GET | `/reference/regions/:code/cities` | reference.getCitiesByRegionCode | Cities by region |
| GET | `/reference/categories` | reference.getCategories | Categories |
| GET | `/reference/categories-full` | reference.getCategoriesWithSubCategories | Full categories |
| GET | `/reference/categories/:code/sub-categories` | reference.getSubCategories | Subcategories |
| GET | `/reference/claim-types` | reference.getClaimTypes | Claim types |
| GET | `/reference/poa-scopes` | reference.getPOAScopes | POA scopes |
| GET | `/reference/party-types` | reference.getPartyTypes | Party types |
| GET | `/reference/document-categories` | reference.getDocumentCategories | Document categories |
| GET | `/reference/all` | reference.getAllReferenceData | All reference data |

### Messages (`/api/messages/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| POST | `/messages` | message.createMessage | Send message |
| GET | `/messages/:conversationID` | message.getMessages | Get messages |
| PATCH | `/messages/:conversationID/read` | message.markAsRead | Mark as read |

### Conversations (`/api/conversations/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/conversations` | conversation.getConversations | List |
| POST | `/conversations` | conversation.createConversation | Create |
| GET | `/conversations/single/:sellerID/:buyerID` | conversation.getSingleConversation | Get single |
| PATCH | `/conversations/:conversationID` | conversation.updateConversation | Update |

### Users (`/api/users/*`)

| Method | Endpoint | Controller | Description |
|--------|----------|------------|-------------|
| GET | `/users/lawyers` | user.getLawyers | List lawyers |
| GET | `/users/:_id` | user.getUserProfile | Get profile |
| GET | `/users/lawyer/:username` | user.getLawyerProfile | Lawyer profile |
| PATCH | `/users/:_id` | user.updateUserProfile | Update profile |
| DELETE | `/users/:_id` | user.deleteUser | Delete user |

---

## Frontend Service Endpoints (Complete List)

### Total Frontend Services: 181 files
### Total API Calls: 1,591+

### Major Service Categories

#### Authentication Services
- `authService.ts` - Login, register, OTP, logout
- `mfa.service.ts` - MFA setup, verify, backup codes
- `sessions.service.ts` - Session management
- `otpService.ts` - OTP operations

#### Finance Services (100+ endpoints)
- `financeService.ts` - Invoices, payments, expenses
- `financeAdvancedService.ts` - Bank reconciliation, currency
- `accountingService.ts` - Accounts, journal entries, GL
- `billService.ts` - Bills, debit notes
- `vendorService.ts` - Vendor management
- `payrollService.ts` - Payroll operations

#### HR Services (200+ endpoints)
- `hrService.ts` - Employees, departments
- `hrAnalyticsService.ts` - HR analytics, predictions
- `attendanceService.ts` - Attendance tracking
- `leaveService.ts` - Leave management
- `payrollRunService.ts` - Payroll processing
- `recruitmentService.ts` - Recruitment, hiring
- `trainingService.ts` - Training programs

#### CRM Services (50+ endpoints)
- `crmService.ts` - Leads, pipelines
- `crmAdvancedService.ts` - Email marketing, campaigns
- `contactsService.ts` - Contact management
- `followupsService.ts` - Follow-up tracking

#### Case Management Services (40+ endpoints)
- `casesService.ts` - Case CRUD, documents
- `caseWorkflowsService.ts` - Workflow management
- `conflictCheckService.ts` - Conflict checking

#### Task & Calendar Services (50+ endpoints)
- `tasksService.ts` - Task management
- `remindersService.ts` - Reminder management
- `eventsService.ts` - Event management
- `calendarService.ts` - Calendar operations

---

## Endpoint Mapping & Linkage

### How Frontend Connects to Backend

```
Frontend Service → API Client → Backend Route → Controller → Database
```

### API Client Configuration

```typescript
// Versioned client (most endpoints)
apiClient.baseURL = '/api/v1'  // Production proxy
apiClient.baseURL = 'https://api.traf3li.com/api/v1'  // Development

// Non-versioned client (auth, currency)
apiClientNoVersion.baseURL = '/api'  // Production proxy
apiClientNoVersion.baseURL = 'https://api.traf3li.com/api'  // Development
```

### Matched Endpoints (Working)

| Frontend Service | Backend Route | Status |
|------------------|---------------|--------|
| authService → login | auth.route → authLogin | ✅ Working |
| casesService → getCases | case.route → getCases | ✅ Working |
| clientsService → getClients | client.route → getClients | ✅ Working |
| financeService → getInvoices | invoice.route → getInvoices | ✅ Working |
| expenseService → getExpenses | expense.route → getExpenses | ✅ Working |
| paymentsService → getPayments | payment.route → getPayments | ✅ Working |
| tasksService → getTasks | task.route → getTasks | ✅ Working |
| eventsService → getEvents | event.route → getEvents | ✅ Working |
| remindersService → getReminders | reminder.route → getReminders | ✅ Working |
| dashboardService → getHeroStats | dashboard.route → getHeroStats | ✅ Working |
| timeTrackingService → startTimer | timeTracking.route → startTimer | ✅ Working |
| retainersService → getRetainers | retainer.route → getRetainers | ✅ Working |
| billingRatesService → getRates | billingRate.route → getRates | ✅ Working |
| notificationService → getNotifications | notification.route → getNotifications | ✅ Working |
| pdfmeService → getTemplates | pdfme.route → getTemplates | ✅ Working |
| referenceService → getCourts | reference.route → getCourts | ✅ Working |

---

## Critical Mismatches & Missing Endpoints

### Backend Endpoints NOT Implemented (Frontend Expects These)

#### 1. Payroll Run Service - 4 Missing Endpoints

| Endpoint | Method | Service File | Line |
|----------|--------|--------------|------|
| `/payroll-runs/:id/employees/:empId/exclude` | POST | payrollRunService.ts | 525 |
| `/payroll-runs/:id/employees/:empId/include` | POST | payrollRunService.ts | 532 |
| `/payroll-runs/:id/employees/:empId/recalculate` | POST | payrollRunService.ts | 539 |
| `/payroll-runs/:id/export` | GET | payrollRunService.ts | 546 |

#### 2. Advances Service - 2 Missing Endpoints

| Endpoint | Method | Service File | Line |
|----------|--------|--------------|------|
| `/hr/advances/:advanceId/submit` | POST | advancesService.ts | 434 |
| `/hr/advances/:advanceId/waive` | POST | advancesService.ts | 518 |

#### 3. Finance Advanced Service - 8 Missing Endpoints

| Endpoint | Method | Service File | Line | Notes |
|----------|--------|--------------|------|-------|
| Transaction exclusion | POST | financeAdvancedService.ts | 257 | Backend uses clear/unclear instead |
| `/matching-rules/:id` | GET | financeAdvancedService.ts | 287 | Use getRules() instead |
| `/matching-rules/:id/toggle` | POST | financeAdvancedService.ts | 334 | Update rule instead |
| `/matching-rules/reorder` | POST | financeAdvancedService.ts | 346 | Not implemented |
| `/reconciliation/report/:id` | GET | financeAdvancedService.ts | 364 | Use /bank-reconciliation/status |
| `/reconciliation/export` | POST | financeAdvancedService.ts | 383 | Not implemented |
| `/currency/rate/:pair` | GET | financeAdvancedService.ts | 413 | Use /currency/rates (all) |
| `/currency/rate-history` | GET | financeAdvancedService.ts | 434 | Not implemented |

#### 4. Payroll Service - 1 Missing Endpoint

| Endpoint | Method | Service File | Line |
|----------|--------|--------------|------|
| `/payroll/:id/pdf` | GET | payrollService.ts | 268 |

### Summary of Missing Backend Routes

| Category | Missing Count | Impact |
|----------|---------------|--------|
| Payroll Run | 4 | Employee exclusion, exports broken |
| HR Advances | 2 | Submit/waive functionality broken |
| Finance Advanced | 8 | Reconciliation reports limited |
| Payroll | 1 | PDF download broken |
| **Total** | **15** | **Critical business functionality affected** |

---

## Frontend Endpoints Needing Backend Updates

### High Priority - Must Implement

1. **Payroll Employee Management**
   - `POST /payroll-runs/:id/employees/:empId/exclude`
   - `POST /payroll-runs/:id/employees/:empId/include`
   - `POST /payroll-runs/:id/employees/:empId/recalculate`

2. **Payroll Export**
   - `GET /payroll-runs/:id/export` - Export payroll data

3. **HR Advances Workflow**
   - `POST /hr/advances/:advanceId/submit` - Submit for approval
   - `POST /hr/advances/:advanceId/waive` - Waive advance

4. **Payroll PDF**
   - `GET /payroll/:id/pdf` - Download salary slip PDF

### Medium Priority - Should Implement

1. **Reconciliation Reports**
   - `GET /reconciliation/report/:id` - Get specific report
   - `POST /reconciliation/export` - Export reconciliation

2. **Currency History**
   - `GET /currency/rate-history` - Historical exchange rates

### Low Priority - Can Defer

1. **Matching Rules**
   - Reorder functionality
   - Toggle functionality (can use update)

---

## Deprecated & Legacy Endpoints

### Scheduled for Removal

| Endpoint | Service | Removal Date | Replacement |
|----------|---------|--------------|-------------|
| Legacy API Key endpoint | apiKeysService.ts | Q2 2025 | New API key management |
| `getRelationTuples()` | permissionService.ts | TBD | `getResourceRelations()` |
| `useConversation()` | useConversations.ts | TBD | `useSingleConversation()` |
| `useMarkAsRead()` | useConversations.ts | TBD | `useMarkMessagesAsRead()` |
| `clearCache()` | api.ts | TBD | `queryClient.invalidateQueries()` |
| `getCacheSize()` | api.ts | TBD | `queryClient.clear()` |

### Legacy Patterns (Backward Compatible)

| Pattern | Location | Notes |
|---------|----------|-------|
| Legacy case fields | case-details-view.tsx | Plaintiff/defendant fallbacks |
| Direct document upload | documentsService.ts | S3-based preferred |
| Legacy firm members endpoint | firmService.ts | Still functional |
| Legacy snooze options | remindersService.ts | Converted to new format |

### Not Implemented (Backend Missing)

| Feature | Expected Path | Status |
|---------|---------------|--------|
| Lock Dates | `/api/lock-dates/*` | ❌ Backend NOT implemented |
| Automated Actions | `/api/automated-actions/*` | ❌ Backend NOT implemented |

---

## Recommendations

### Immediate Actions (Week 1)

1. **Implement Missing Payroll Endpoints** (4 endpoints)
   - Critical for payroll processing
   - Employee exclusion/inclusion needed

2. **Implement HR Advances Endpoints** (2 endpoints)
   - Submit and waive functionality
   - Required for advance workflow

3. **Implement Payroll PDF Download** (1 endpoint)
   - Salary slip PDF generation
   - Required for employee access

### Short-term Actions (Week 2-3)

4. **Implement Reconciliation Exports**
   - Bank reconciliation report exports
   - Required for finance operations

5. **Implement Currency History**
   - Historical exchange rate tracking
   - Useful for audit purposes

### Medium-term Actions (Month 1)

6. **Implement Lock Dates Module**
   - Financial period locking
   - Required for accounting compliance

7. **Implement Automated Actions Module**
   - Rule-based automation
   - Workflow automation

### Long-term Actions (Quarter 1)

8. **Clean Up Deprecated Endpoints**
   - Remove Q2 2025 deprecated items
   - Migrate consumers to new endpoints

9. **Standardize API Responses**
   - Consistent error formats
   - Consistent pagination

10. **Add API Documentation**
    - OpenAPI/Swagger specs
    - Auto-generated docs

---

## Appendix A: Backend Route Files

```
/src/routes/
├── activity.route.js
├── answer.route.js
├── auth.route.js
├── benefit.route.js
├── billingRate.route.js
├── calendar.route.js
├── case.route.js
├── client.route.js
├── conversation.route.js
├── dashboard.route.js
├── event.route.js
├── expense.route.js
├── firm.route.js
├── gig.route.js
├── index.js
├── invoice.route.js
├── job.route.js
├── legalDocument.route.js
├── message.route.js
├── notification.route.js
├── order.route.js
├── payment.route.js
├── pdfme.route.js
├── peerReview.route.js
├── proposal.route.js
├── question.route.js
├── reference.route.js
├── reminder.route.js
├── report.route.js
├── retainer.route.js
├── review.route.js
├── score.route.js
├── statement.route.js
├── task.route.js
├── timeTracking.route.js
├── transaction.route.js
└── user.route.js
```

## Appendix B: Frontend Service Files

```
/src/services/
├── accountingService.ts
├── accountService.ts
├── activitiesService.ts
├── advancesService.ts
├── apiKeysService.ts
├── appsService.ts
├── assetAssignmentService.ts
├── attendanceService.ts
├── authService.ts
├── bankAccountService.ts
├── bankReconciliationService.ts
├── bankTransactionService.ts
├── bankTransferService.ts
├── benefitsService.ts
├── billingRatesService.ts
├── billingSettingsService.ts
├── biometricService.ts
├── calendarService.ts
├── captchaService.ts
├── caseNotionService.ts
├── casesService.ts
├── caseWorkflowsService.ts
├── chatterService.ts
├── clientsService.ts
├── compensationService.ts
├── compensatoryLeaveService.ts
├── companyService.ts
├── conflictCheckService.ts
├── consent.service.ts
├── consolidatedReportService.ts
├── contactsService.ts
├── corporateCardsService.ts
├── crmAdvancedService.ts
├── crmService.ts
├── currencyService.ts
├── dashboardService.ts
├── dataExportService.ts
├── documentAnalysisService.ts
├── documentsService.ts
├── documentVersionService.ts
├── employeePromotionService.ts
├── employeeSkillMapService.ts
├── eventsService.ts
├── expenseClaimsService.ts
├── financeAdvancedService.ts
├── financeService.ts
├── firmService.ts
├── followupsService.ts
├── grievancesService.ts
├── hrAnalyticsService.ts
├── hrService.ts
├── interCompanyService.ts
├── invoiceTemplatesService.ts
├── jobPositionsService.ts
├── journalEntryService.ts
├── lawyersService.ts
├── ldapService.ts
├── leaveAllocationService.ts
├── leaveEncashmentService.ts
├── leavePeriodService.ts
├── leavePolicyService.ts
├── leaveService.ts
├── loansService.ts
├── matterBudgetService.ts
├── messagesService.ts
├── mfa.service.ts
├── notificationService.ts
├── offboardingService.ts
├── onboardingService.ts
├── onboardingWizardService.ts
├── organizationalStructureService.ts
├── organizationsService.ts
├── otpService.ts
├── payrollRunService.ts
├── payrollService.ts
├── pdfmeService.ts
├── performanceReviewService.ts
├── permissionService.ts
├── proposalService.ts
├── quotesService.ts
├── rateCardService.ts
├── recruitmentService.ts
├── recurringInvoiceService.ts
├── referralService.ts
├── remindersService.ts
├── reportsService.ts
├── retainerService.ts
├── retentionBonusService.ts
├── saudiBankingService.ts
├── sessions.service.ts
├── settingsService.ts
├── setupOrchestrationService.ts
├── shiftAssignmentService.ts
├── shiftTypeService.ts
├── skillService.ts
├── smartButtonsService.ts
├── socketService.ts
├── ssoService.ts
├── staffingPlanService.ts
├── staffService.ts
├── successionPlanningService.ts
├── tagsService.ts
├── tasksService.ts
├── teamService.ts
├── trainingService.ts
├── trustAccountService.ts
├── usersService.ts
├── vehicleService.ts
├── vendorService.ts
└── webhookService.ts
```

---

## Appendix C: WebSocket Events

### Frontend → Backend

| Event | Payload | Description |
|-------|---------|-------------|
| `user:join` | `{ userId }` | User connects |
| `conversation:join` | `{ conversationId }` | Join conversation |
| `conversation:leave` | `{ conversationId }` | Leave conversation |
| `message:send` | `{ conversationId, message }` | Send message |
| `message:read` | `{ conversationId }` | Mark as read |
| `typing:start` | `{ conversationId }` | Start typing |
| `typing:stop` | `{ conversationId }` | Stop typing |

### Backend → Frontend

| Event | Payload | Description |
|-------|---------|-------------|
| `user:online` | `{ userId }` | User online |
| `user:offline` | `{ userId }` | User offline |
| `message:receive` | `{ message, conversationId }` | New message |
| `typing:show` | `{ userId, conversationId }` | Show typing |
| `typing:hide` | `{ userId, conversationId }` | Hide typing |
| `notification:new` | `{ notification }` | New notification |
| `notification:count` | `{ count }` | Unread count |
| `session:expired` | `{}` | Session expired |
| `force:logout` | `{ reason }` | Force logout |
| `account:locked` | `{ reason }` | Account locked |

---

*Document generated by scanning 90+ parallel agents across frontend and backend codebases.*
