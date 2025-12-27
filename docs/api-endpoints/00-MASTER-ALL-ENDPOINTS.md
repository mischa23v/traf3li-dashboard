# MASTER API ENDPOINTS LIST

## Complete Backend API Scan Results
**Scan Date:** December 27, 2025
**Total Endpoints Found:** 400+ endpoints

---

## Summary by Category

| Category | Endpoints | Status |
|----------|-----------|--------|
| Authentication | 4 implemented, 18+ missing | ⚠️ Partial |
| Tasks/Reminders/Events | 45+ | ✅ Implemented |
| HR & Employees | 200+ | ✅ Implemented |
| CRM & Clients | 77+ | ✅ Implemented |
| Sales & Finance | 90+ | ✅ Implemented |
| Marketplace | 31+ | ✅ Implemented |
| Documents & Files | 25+ | ✅ Implemented |
| Reference Data | 18 | ✅ Implemented |

---

## Authentication (`/api/auth`)

### Implemented
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Not Implemented (18+)
- OTP endpoints (4)
- Password management (6)
- Session management (2)
- MFA endpoints (4)
- SSO endpoints (3)
- Magic link (2)

---

## Tasks (`/api/tasks`)

- `POST /tasks`
- `GET /tasks`
- `GET /tasks/upcoming`
- `GET /tasks/overdue`
- `GET /tasks/case/:caseId`
- `GET /tasks/:_id`
- `PATCH /tasks/:_id`
- `DELETE /tasks/:_id`
- `POST /tasks/:_id/complete`
- `DELETE /tasks/bulk`

---

## Reminders (`/api/reminders`)

- `POST /reminders`
- `GET /reminders`
- `GET /reminders/upcoming`
- `GET /reminders/overdue`
- `GET /reminders/:id`
- `PUT /reminders/:id`
- `DELETE /reminders/:id`
- `POST /reminders/:id/complete`
- `POST /reminders/:id/dismiss`
- `DELETE /reminders/bulk`

---

## Events (`/api/events`)

- `POST /events`
- `GET /events`
- `GET /events/upcoming`
- `GET /events/month/:year/:month`
- `GET /events/date/:date`
- `GET /events/:id`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `POST /events/:id/complete`

---

## Calendar (`/api/calendar`)

- `GET /calendar`
- `GET /calendar/upcoming`
- `GET /calendar/overdue`
- `GET /calendar/stats`
- `GET /calendar/date/:date`
- `GET /calendar/month/:year/:month`

---

## Notifications (`/api/notifications`)

- `GET /notifications`
- `GET /notifications/unread-count`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/mark-all-read`
- `DELETE /notifications/:id`

---

## Cases (`/api/cases`)

- `POST /cases`
- `GET /cases`
- `GET /cases/:_id`
- `PATCH /cases/:_id`
- `POST /cases/:_id/note`
- `POST /cases/:_id/document`
- `POST /cases/:_id/hearing`
- `PATCH /cases/:_id/status`
- `PATCH /cases/:_id/outcome`

---

## Clients (`/api/clients`)

- `POST /clients`
- `GET /clients`
- `GET /clients/search`
- `GET /clients/stats`
- `GET /clients/top-revenue`
- `GET /clients/:id`
- `PUT /clients/:id`
- `DELETE /clients/:id`
- `DELETE /clients/bulk`

---

## Dashboard (`/api/dashboard`)

- `GET /dashboard/hero-stats`
- `GET /dashboard/stats`
- `GET /dashboard/financial-summary`
- `GET /dashboard/today-events`
- `GET /dashboard/recent-messages`
- `GET /dashboard/activity`

---

## Activities (`/api/activities`)

- `GET /activities`

---

## Invoices (`/api/invoices`)

- `POST /invoices`
- `GET /invoices`
- `GET /invoices/overdue`
- `GET /invoices/:_id`
- `PATCH /invoices/:_id`
- `POST /invoices/:_id/send`
- `POST /invoices/:_id/payment`
- `PATCH /invoices/confirm-payment`

---

## Expenses (`/api/expenses`)

- `POST /expenses`
- `GET /expenses`
- `GET /expenses/stats`
- `GET /expenses/by-category`
- `GET /expenses/:id`
- `PUT /expenses/:id`
- `DELETE /expenses/:id`
- `POST /expenses/:id/reimburse`
- `POST /expenses/:id/receipt`

---

## Time Tracking (`/api/time-tracking`)

- `POST /time-tracking/timer/start`
- `POST /time-tracking/timer/pause`
- `POST /time-tracking/timer/resume`
- `POST /time-tracking/timer/stop`
- `GET /time-tracking/timer/status`
- `POST /time-tracking/entries`
- `GET /time-tracking/entries`
- `GET /time-tracking/entries/:id`
- `PUT /time-tracking/entries/:id`
- `DELETE /time-tracking/entries/:id`
- `POST /time-tracking/entries/:id/approve`
- `POST /time-tracking/entries/:id/reject`
- `GET /time-tracking/stats`
- `DELETE /time-tracking/entries/bulk`

---

## Payments (`/api/payments`)

- `POST /payments`
- `GET /payments`
- `GET /payments/stats`
- `GET /payments/:id`
- `PUT /payments/:id`
- `DELETE /payments/:id`
- `POST /payments/:id/complete`
- `POST /payments/:id/fail`
- `POST /payments/:id/refund`
- `POST /payments/:id/receipt`
- `DELETE /payments/bulk`

---

## Retainers (`/api/retainers`)

- `POST /retainers`
- `GET /retainers`
- `GET /retainers/stats`
- `GET /retainers/low-balance`
- `GET /retainers/:id`
- `PUT /retainers/:id`
- `POST /retainers/:id/consume`
- `POST /retainers/:id/replenish`
- `POST /retainers/:id/refund`
- `GET /retainers/:id/history`

---

## Billing Rates (`/api/billing-rates`)

- `POST /billing-rates`
- `GET /billing-rates`
- `GET /billing-rates/stats`
- `GET /billing-rates/applicable`
- `GET /billing-rates/:id`
- `PUT /billing-rates/:id`
- `DELETE /billing-rates/:id`
- `POST /billing-rates/standard`

---

## Transactions (`/api/transactions`)

- `POST /transactions`
- `GET /transactions`
- `GET /transactions/balance`
- `GET /transactions/summary`
- `GET /transactions/by-category`
- `GET /transactions/:id`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `POST /transactions/:id/cancel`
- `DELETE /transactions/bulk`

---

## Reports (`/api/reports`)

- `POST /reports/generate`
- `GET /reports`
- `GET /reports/templates`
- `GET /reports/:id`
- `DELETE /reports/:id`
- `POST /reports/:id/schedule`
- `DELETE /reports/:id/schedule`

---

## Statements (`/api/statements`)

- `POST /statements/generate`
- `GET /statements`
- `GET /statements/:id`
- `DELETE /statements/:id`
- `POST /statements/:id/send`

---

## Gigs (`/api/gigs`)

- `POST /gigs`
- `GET /gigs`
- `GET /gigs/single/:_id`
- `DELETE /gigs/:_id`

---

## Jobs (`/api/jobs`)

- `POST /jobs`
- `GET /jobs`
- `GET /jobs/my-jobs`
- `GET /jobs/:_id`
- `PATCH /jobs/:_id`
- `DELETE /jobs/:_id`

---

## Proposals (`/api/proposals`)

- `POST /proposals`
- `GET /proposals/job/:jobId`
- `GET /proposals/my-proposals`
- `PATCH /proposals/accept/:_id`
- `PATCH /proposals/reject/:_id`
- `PATCH /proposals/withdraw/:_id`

---

## Orders (`/api/orders`)

- `GET /orders`
- `POST /orders/create-payment-intent/:_id`
- `POST /orders/create-proposal-payment-intent/:_id`
- `PATCH /orders`
- `POST /orders/create-test-contract/:_id` (TEST)
- `POST /orders/create-test-proposal-contract/:_id` (TEST)

---

## Reviews (`/api/reviews`)

- `POST /reviews`
- `GET /reviews/:gigID`
- `DELETE /reviews/:_id`

---

## Questions (`/api/questions`)

- `POST /questions`
- `GET /questions`
- `GET /questions/:_id`
- `PATCH /questions/:_id`
- `DELETE /questions/:_id`

---

## Answers (`/api/answers`)

- `POST /answers`
- `GET /answers/:questionId`
- `PATCH /answers/:_id`
- `DELETE /answers/:_id`
- `POST /answers/like/:_id`
- `PATCH /answers/verify/:_id`

---

## Users (`/api/users`)

- `GET /users/lawyers`
- `GET /users/:_id`
- `GET /users/lawyer/:username`
- `PATCH /users/:_id`
- `DELETE /users/:_id`

---

## Conversations (`/api/conversations`)

- `POST /conversations`
- `GET /conversations`
- `GET /conversations/single/:sellerID/:buyerID`
- `PATCH /conversations/:conversationID`

---

## Messages (`/api/messages`)

- `POST /messages`
- `GET /messages/:conversationID`
- `PATCH /messages/:conversationID/read`

---

## Benefits (`/api/benefits`)

- `POST /benefits`
- `GET /benefits`
- `GET /benefits/stats`
- `GET /benefits/by-type`
- `GET /benefits/export`
- `GET /benefits/employee/:employeeId`
- `POST /benefits/bulk-delete`
- `GET /benefits/:id`
- `PUT /benefits/:id`
- `PATCH /benefits/:id`
- `DELETE /benefits/:id`
- `POST /benefits/:id/activate`
- `POST /benefits/:id/suspend`
- `POST /benefits/:id/terminate`
- `POST /benefits/:id/dependents`
- `DELETE /benefits/:id/dependents/:memberId`
- `POST /benefits/:id/beneficiaries`
- `PATCH /benefits/:id/beneficiaries/:beneficiaryId`
- `DELETE /benefits/:id/beneficiaries/:beneficiaryId`
- `POST /benefits/:id/documents`

---

## PDFMe (`/api/pdfme`)

- `GET /pdfme/templates`
- `POST /pdfme/templates`
- `GET /pdfme/templates/default/:category`
- `GET /pdfme/templates/:id`
- `PUT /pdfme/templates/:id`
- `DELETE /pdfme/templates/:id`
- `POST /pdfme/templates/:id/clone`
- `POST /pdfme/templates/:id/set-default`
- `POST /pdfme/templates/:id/preview`
- `POST /pdfme/generate`
- `POST /pdfme/generate/async`
- `POST /pdfme/generate/invoice`
- `POST /pdfme/generate/contract`
- `POST /pdfme/generate/receipt`
- `GET /pdfme/download/:fileName`

---

## Reference (`/api/reference`)

- `GET /reference/courts`
- `GET /reference/committees`
- `GET /reference/regions`
- `GET /reference/regions-with-cities`
- `GET /reference/regions/:code/cities`
- `GET /reference/categories`
- `GET /reference/categories/:code/sub-categories`
- `GET /reference/categories-full`
- `GET /reference/claim-types`
- `GET /reference/poa-scopes`
- `GET /reference/party-types`
- `GET /reference/document-categories`
- `GET /reference/all`

---

## Health Check

- `GET /health`

---

## NOT MOUNTED (Exist but not registered in server.js)

### Firms (`/api/firms`)
- `POST /firms`
- `GET /firms`
- `GET /firms/:_id`
- `PATCH /firms/:_id`
- `POST /firms/lawyer/add`
- `POST /firms/lawyer/remove`

### Legal Documents (`/api/legal-documents`)
- `POST /legal-documents`
- `GET /legal-documents`
- `GET /legal-documents/:_id`
- `PATCH /legal-documents/:_id`
- `DELETE /legal-documents/:_id`
- `POST /legal-documents/:_id/download`

### Peer Reviews (`/api/peerReview`)
- `POST /peerReview`
- `GET /peerReview/:lawyerId`
- `PATCH /peerReview/verify/:_id`

### Scores (`/api/score`)
- `GET /score/:lawyerId`
- `POST /score/recalculate/:lawyerId`
- `GET /score/top/lawyers`

---

## HR Endpoints (200+ endpoints)

See `03-HR-EMPLOYEES.md` for complete list including:
- Employee management (15)
- Payroll (18)
- Leave management (15)
- Attendance (45+)
- Time tracking (6)
- Offboarding (20)
- Recruitment (55+)
- Settings (12)
- Analytics (12)

---

## Socket.IO Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `user:join` | Client → Server | Join user room |
| `user:online` | Server → Client | User online notification |
| `user:offline` | Server → Client | User offline notification |
| `conversation:join` | Client → Server | Join conversation |
| `typing:start` | Client → Server | Start typing |
| `typing:show` | Server → Client | Show typing indicator |
| `typing:stop` | Client → Server | Stop typing |
| `typing:hide` | Server → Client | Hide typing indicator |
| `message:send` | Client → Server | Send message |
| `message:receive` | Server → Client | Receive message |
| `message:read` | Client → Server | Mark as read |
| `notification:new` | Server → Client | New notification |
| `notification:count` | Server → Client | Unread count |

---

## API Base URLs

- **Production**: `https://api.traf3li.com/api`
- **Development**: `http://localhost:3000/api`
- **Frontend**: `https://dashboard.traf3li.com` / `http://localhost:5173`

---

## Authentication

All endpoints (except reference data and public marketplace) require:
- JWT token in `Cookie: accessToken=xxx` OR
- `Authorization: Bearer xxx` header

---

**Document Version:** 1.0
**Generated By:** Comprehensive API Scan
