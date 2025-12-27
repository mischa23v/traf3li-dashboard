# Sales & Finance API Endpoints

## Orders API

### Base URL: `/api/orders`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/orders` | None | Completed orders for user (buyer/seller) | Yes |
| POST | `/orders/create-payment-intent/:_id` | _id (gigId) | `{ error, clientSecret }` | Yes |
| POST | `/orders/create-proposal-payment-intent/:_id` | _id (proposalId) | `{ error, clientSecret }` | Yes |
| PATCH | `/orders` | payment_intent | Success confirmation | Yes |
| POST | `/orders/create-test-contract/:_id` | _id (gigId) | Test order (TEST MODE) | Yes |
| POST | `/orders/create-test-proposal-contract/:_id` | _id (proposalId) | Test order (TEST MODE) | Yes |

---

## Invoices API

### Base URL: `/api/invoices`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/invoices` | caseId, contractId, items[], dueDate | Invoice with generated number | Yes |
| GET | `/invoices` | Query: status | Invoices (filtered by role) | Yes |
| GET | `/invoices/overdue` | None | Overdue invoices | Yes |
| GET | `/invoices/:_id` | _id | Single invoice with populated refs | Yes |
| PATCH | `/invoices/:_id` | Any invoice fields | Updated invoice | Yes |
| POST | `/invoices/:_id/send` | _id | `{ error, message, invoice }` | Yes |
| POST | `/invoices/:_id/payment` | _id | `{ error, clientSecret }` (Stripe) | Yes |
| PATCH | `/invoices/confirm-payment` | paymentIntent | `{ error, message, invoice }` | Yes |

### Invoice Status
- `draft`, `pending`, `sent`, `paid`, `overdue`, `cancelled`

### Invoice Number Format
- `INV-YYYYMM-XXXX`

### VAT
- 15% automatically calculated

---

## Proposals/Quotes API

### Base URL: `/api/proposals`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/proposals` | jobId, proposedAmount, coverLetter, deliveryTime | Proposal object | Yes |
| GET | `/proposals/job/:jobId` | jobId | Proposals for job (job creator only) | Yes |
| GET | `/proposals/my-proposals` | None | User's proposals (lawyer only) | Yes |
| PATCH | `/proposals/accept/:_id` | _id | Accepted proposal | Yes |
| PATCH | `/proposals/reject/:_id` | _id | Rejected proposal | Yes |
| PATCH | `/proposals/withdraw/:_id` | _id | Withdrawn proposal | Yes |

### Proposal Status
- `pending`, `accepted`, `rejected`, `withdrawn`

---

## Payments API

### Base URL: `/api/payments`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/payments` | clientId, invoiceId, amount, paymentMethod, gatewayProvider, transactionId, gatewayResponse, checkNumber, checkDate, bankName, allocations, notes, internalNotes | Payment object | Yes |
| GET | `/payments` | Query: status, paymentMethod, clientId, invoiceId, caseId, startDate, endDate, page, limit | Payments + pagination + summary | Yes |
| GET | `/payments/stats` | Query: startDate, endDate, clientId, groupBy | `{ overall, byMethod, byGateway }` | Yes |
| GET | `/payments/:id` | id | Single payment | Yes |
| PUT | `/payments/:id` | notes, internalNotes, allocations | Updated payment | Yes |
| DELETE | `/payments/:id` | id | Success | Yes |
| POST | `/payments/:id/complete` | id | Completed payment | Yes |
| POST | `/payments/:id/fail` | reason | Failed payment | Yes |
| POST | `/payments/:id/refund` | amount, reason | Refund payment | Yes |
| POST | `/payments/:id/receipt` | email | Receipt sent | Yes |
| DELETE | `/payments/bulk` | paymentIds[] | `{ success, count }` | Yes |

### Payment Methods
- `credit_card`, `debit_card`, `bank_transfer`, `cash`, `check`, `online_gateway`

### Payment Status
- `pending`, `completed`, `failed`, `refunded`, `cancelled`

---

## Retainers API

### Base URL: `/api/retainers`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/retainers` | clientId, caseId, retainerType, initialAmount, minimumBalance, startDate, endDate, autoReplenish, replenishThreshold, replenishAmount, agreementUrl, notes, termsAndConditions | Retainer object | Yes |
| GET | `/retainers` | Query: status, retainerType, clientId, caseId, page, limit | Retainers + summary | Yes |
| GET | `/retainers/stats` | Query: clientId, startDate, endDate | Statistics | Yes |
| GET | `/retainers/low-balance` | None | Low balance retainers | Yes |
| GET | `/retainers/:id` | id | Single retainer | Yes |
| PUT | `/retainers/:id` | Retainer fields | Updated retainer | Yes |
| POST | `/retainers/:id/consume` | amount, invoiceId, description | Updated retainer | Yes |
| POST | `/retainers/:id/replenish` | amount, paymentId | Updated retainer | Yes |
| POST | `/retainers/:id/refund` | reason | Refunded retainer | Yes |
| GET | `/retainers/:id/history` | id | Transaction history | Yes |

### Retainer Types
- `advance`, `evergreen`, `flat_fee`, `security`

### Retainer Status
- `active`, `depleted`, `refunded`, `expired`

---

## Billing Rates API

### Base URL: `/api/billing-rates`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/billing-rates` | rateType, standardHourlyRate, clientId, caseType, activityCode, customRate, effectiveDate, endDate, currency, notes | BillingRate object | Yes |
| GET | `/billing-rates` | Query: rateType, clientId, isActive, page, limit | Rates + pagination | Yes |
| GET | `/billing-rates/stats` | None | `{ byType[], standardRate, hasStandardRate }` | Yes |
| GET | `/billing-rates/applicable` | Query: clientId, caseType, activityCode | `{ hourlyRate, currency }` | Yes |
| GET | `/billing-rates/:id` | id | Single rate | Yes |
| PUT | `/billing-rates/:id` | Rate fields | Updated rate | Yes |
| DELETE | `/billing-rates/:id` | id | Success | Yes |
| POST | `/billing-rates/standard` | standardHourlyRate, currency | Standard rate | Yes |

### Rate Types
- `standard`, `custom_client`, `custom_case_type`, `activity_based`

### Default Currency
- SAR (Saudi Riyal)

---

## Transactions API

### Base URL: `/api/transactions`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/transactions` | type, amount, category, description, paymentMethod, invoiceId, expenseId, caseId, referenceNumber, date, notes | Transaction object | Yes |
| GET | `/transactions` | Query: type, category, status, paymentMethod, startDate, endDate, caseId, invoiceId, minAmount, maxAmount, search, page, limit, sortBy, sortOrder | Transactions + pagination | Yes |
| GET | `/transactions/balance` | Query: upToDate | `{ balance, asOfDate }` | Yes |
| GET | `/transactions/summary` | Query: startDate, endDate, type, category, caseId | Summary data | Yes |
| GET | `/transactions/by-category` | Query: startDate, endDate, type | Aggregated by category | Yes |
| GET | `/transactions/:id` | id | Single transaction | Yes |
| PUT | `/transactions/:id` | Transaction fields | Updated transaction | Yes |
| DELETE | `/transactions/:id` | id | Success | Yes |
| POST | `/transactions/:id/cancel` | reason | Cancelled transaction | Yes |
| DELETE | `/transactions/bulk` | transactionIds[] | `{ success, deletedCount }` | Yes |

### Transaction Types
- `income`, `expense`, `transfer`

---

## Reports API

### Base URL: `/api/reports`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/reports/generate` | reportName, reportType, startDate, endDate, filters, outputFormat, emailRecipients | Report with generated data | Yes |
| GET | `/reports` | Query: reportType, isScheduled, page, limit | Reports + pagination | Yes |
| GET | `/reports/templates` | None | Available report templates | Yes |
| GET | `/reports/:id` | id | Single report | Yes |
| DELETE | `/reports/:id` | id | Success | Yes |
| POST | `/reports/:id/schedule` | scheduleFrequency, emailRecipients | Scheduled report | Yes |
| DELETE | `/reports/:id/schedule` | id | Unscheduled report | Yes |

### Report Types
- `revenue`, `aging`, `realization`, `collections`, `productivity`, `profitability`, `time_utilization`, `tax`, `custom`

### Schedule Frequencies
- `daily`, `weekly`, `monthly`, `quarterly`

---

## Statements API

### Base URL: `/api/statements`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/statements/generate` | periodStart, periodEnd, type, notes | Statement with summary | Yes |
| GET | `/statements` | Query: status, type, startDate, endDate, page, limit | Statements + pagination | Yes |
| GET | `/statements/:id` | id | Single statement | Yes |
| DELETE | `/statements/:id` | id | Success | Yes |
| POST | `/statements/:id/send` | email | Statement with sent status | Yes |

### Statement Status
- `generated`, `sent`

---

## Expenses API

### Base URL: `/api/expenses`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/expenses` | description, amount, category, caseId, date, paymentMethod, vendor, notes, isBillable | Expense object | Yes |
| GET | `/expenses` | Query: status, category, caseId, startDate, endDate, page, limit | Expenses + pagination | Yes |
| GET | `/expenses/stats` | Query: caseId, startDate, endDate | Statistics | Yes |
| GET | `/expenses/by-category` | Query: caseId, startDate, endDate | Grouped by category | Yes |
| GET | `/expenses/:id` | id | Single expense | Yes |
| PUT | `/expenses/:id` | Expense fields | Updated expense | Yes |
| DELETE | `/expenses/:id` | id | Success | Yes |
| POST | `/expenses/:id/reimburse` | id | Reimbursed expense | Yes |
| POST | `/expenses/:id/receipt` | receiptUrl | Expense with receipt | Yes |

### Expense Categories
- `office`, `transport`, `hospitality`, `government`, `court_fees`, `filing_fees`, `expert_witness`, `investigation`, `accommodation`, `meals`, `postage`, `printing`, `consultation`, `documents`, `research`, `software`, `telephone`, `mileage`, `other`

### Expense Status
- `draft`, `pending_approval`, `approved`, `invoiced`, `rejected`

---

## Time Tracking API

### Base URL: `/api/time-tracking`

### Timer Operations
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/time-tracking/timer/start` | caseId, clientId, activityCode, description | Timer object |
| POST | `/time-tracking/timer/pause` | None | Paused timer |
| POST | `/time-tracking/timer/resume` | None | Resumed timer |
| POST | `/time-tracking/timer/stop` | notes, isBillable | Time entry |
| GET | `/time-tracking/timer/status` | None | Timer status |

### Time Entry CRUD
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/time-tracking/entries` | caseId, clientId, date, description, duration, hourlyRate, activityCode, isBillable, notes, attachments | Time entry |
| GET | `/time-tracking/entries` | Query: status, caseId, clientId, startDate, endDate, isBillable, activityCode, page, limit | Entries + pagination + summary |
| GET | `/time-tracking/entries/:id` | id | Single entry |
| PUT | `/time-tracking/entries/:id` | Entry fields | Updated entry |
| DELETE | `/time-tracking/entries/:id` | id | Success |

### Approval Workflow
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/time-tracking/entries/:id/approve` | id | Approved entry |
| POST | `/time-tracking/entries/:id/reject` | reason | Rejected entry |

### Statistics
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/time-tracking/stats` | Query: startDate, endDate, caseId, groupBy | Statistics |

### Bulk Operations
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| DELETE | `/time-tracking/entries/bulk` | entryIds[] | `{ success, count }` |

### Activity Codes
- `court_appearance`, `client_meeting`, `research`, `document_preparation`, `phone_call`, `email`, `travel`, `administrative`, `other`

### Entry Status
- `draft`, `pending_approval`, `approved`, `invoiced`, `rejected`

---

**Total Sales/Finance Endpoints: 90+**
