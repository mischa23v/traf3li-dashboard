# Traf3li Backend API Documentation

This document outlines all the API endpoints required by the Traf3li Dashboard frontend. The backend should implement a RESTful API with the following specifications.

## Configuration

- **Base URL**: `https://api.traf3li.com/api` (configurable via `VITE_API_URL`)
- **Authentication**: HTTP-only cookies for JWT tokens
- **Content-Type**: `application/json`
- **CORS**: Must allow credentials (`withCredentials: true`)

## Response Format

### Success Response
```json
{
  "error": false,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": true,
  "message": "Error description in Arabic",
  "status": 400
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Authentication API

### POST `/auth/login`
Authenticate user and set HTTP-only cookie.

**Request:**
```json
{
  "username": "string (username or email)",
  "password": "string"
}
```

**Response:**
```json
{
  "error": false,
  "message": "تم تسجيل الدخول بنجاح",
  "user": {
    "_id": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "client | lawyer | admin",
    "image": "string (url)",
    "country": "string",
    "phone": "string",
    "description": "string",
    "isSeller": false,
    "lawyerProfile": {
      "specialization": ["string"],
      "licenseNumber": "string",
      "barAssociation": "string",
      "yearsExperience": 5,
      "verified": true,
      "rating": 4.5,
      "totalReviews": 10,
      "casesWon": 50,
      "casesTotal": 60,
      "languages": ["ar", "en"],
      "firmID": "string"
    },
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "country": "string",
  "role": "client | lawyer",
  "isSeller": false,
  "description": "string",
  "image": "string (url)"
}
```

### POST `/auth/logout`
Logout user and clear HTTP-only cookie.

### GET `/auth/me`
Get current authenticated user from token.

**Response:** Same as login response.

---

## Clients API

### GET `/clients`
Get all clients with optional filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `active`, `inactive`, `archived` |
| search | string | Search by name, email, phone |
| city | string | Filter by city |
| country | string | Filter by country |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "clientId": "string (auto-generated)",
      "lawyerId": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "alternatePhone": "string",
      "nationalId": "string",
      "companyName": "string",
      "companyRegistration": "string",
      "address": "string",
      "city": "string",
      "country": "string",
      "notes": "string",
      "preferredContactMethod": "email | phone | sms | whatsapp",
      "language": "string",
      "status": "active | inactive | archived",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "pagination": { ... }
}
```

### GET `/clients/:id`
Get single client with related data.

**Response:**
```json
{
  "data": {
    "client": { ... },
    "relatedData": {
      "cases": [],
      "invoices": [],
      "payments": []
    },
    "summary": {
      "totalCases": 5,
      "totalInvoices": 10,
      "totalInvoiced": 50000,
      "totalPaid": 40000,
      "outstandingBalance": 10000
    }
  }
}
```

### POST `/clients`
Create a new client.

### PUT `/clients/:id`
Update a client.

### DELETE `/clients/:id`
Delete a client.

### GET `/clients/search`
Search clients.

**Query:** `?q=search_term`

### GET `/clients/stats`
Get client statistics.

### GET `/clients/top-revenue`
Get top clients by revenue.

**Query:** `?limit=10`

### DELETE `/clients/bulk`
Bulk delete clients.

**Request:**
```json
{
  "clientIds": ["id1", "id2"]
}
```

---

## Cases API

### GET `/cases`
Get all cases with filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `active`, `closed`, `appeal`, `settlement`, `on-hold`, etc. |
| priority | string | `low`, `medium`, `high`, `critical` |
| category | string | `labor`, `commercial`, `civil`, `criminal`, `family`, `administrative`, `other` |
| clientId | string | Filter by client |
| lawyerId | string | Filter by lawyer |
| startDate | string | Filter by date range |
| endDate | string | Filter by date range |
| search | string | Search term |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "category": "labor | commercial | civil | ...",
      "startDate": "ISO date",
      "endDate": "ISO date",
      "lawyerId": { "_id": "string", "firstName": "string", "lastName": "string" },
      "clientId": { "_id": "string", "firstName": "string", "lastName": "string" },
      "clientName": "string",
      "clientPhone": "string",
      "caseNumber": "string",
      "court": "string",
      "judge": "string",
      "nextHearing": "ISO date",
      "status": "active | closed | ...",
      "outcome": "won | lost | settled | ongoing",
      "progress": 75,
      "priority": "low | medium | high | critical",
      "claimAmount": 50000,
      "expectedWinAmount": 45000,
      "claims": [{ "type": "string", "amount": 10000, "period": "string", "description": "string" }],
      "timeline": [{ "event": "string", "date": "ISO date", "type": "court | filing | deadline | general", "status": "upcoming | completed" }],
      "notes": [{ "text": "string", "date": "ISO date" }],
      "documents": [{ "filename": "string", "url": "string", "type": "string", "size": 1024, "category": "contract | evidence | ...", "bucket": "general | judgments" }],
      "hearings": [{ "date": "ISO date", "location": "string", "notes": "string", "attended": false }],
      "laborCaseDetails": {
        "plaintiff": { "name": "string", "nationalId": "string", "phone": "string", "address": "string", "city": "string" },
        "company": { "name": "string", "registrationNumber": "string", "address": "string", "city": "string" }
      },
      "source": "platform | external",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "pagination": { ... }
}
```

### GET `/cases/:id`
Get single case.

### POST `/cases`
Create a new case.

### PUT `/cases/:id`
Update a case.

### DELETE `/cases/:id`
Delete a case.

### PATCH `/cases/:id/status`
Update case status.

**Request:**
```json
{
  "status": "active | closed | appeal | ..."
}
```

### PATCH `/cases/:id/outcome`
Update case outcome.

**Request:**
```json
{
  "outcome": "won | lost | settled | ongoing"
}
```

### POST `/cases/:id/notes`
Add note to case.

### PUT `/cases/:id/notes/:noteId`
Update case note.

### DELETE `/cases/:id/notes/:noteId`
Delete case note.

### POST `/cases/:id/hearings`
Add hearing to case.

### PUT `/cases/:id/hearings/:hearingId`
Update case hearing.

### DELETE `/cases/:id/hearings/:hearingId`
Delete case hearing.

### POST `/cases/:id/claims`
Add claim to case.

### PUT `/cases/:id/claims/:claimId`
Update case claim.

### DELETE `/cases/:id/claims/:claimId`
Delete case claim.

### POST `/cases/:id/timeline`
Add timeline event.

### PUT `/cases/:id/timeline/:eventId`
Update timeline event.

### DELETE `/cases/:id/timeline/:eventId`
Delete timeline event.

### POST `/cases/:id/documents/upload-url`
Get presigned URL for document upload.

### POST `/cases/:id/documents/confirm`
Confirm document upload.

### GET `/cases/:id/documents/:docId/download`
Download document.

### DELETE `/cases/:id/documents/:docId`
Delete document.

### GET `/cases/:id/audit`
Get case audit history.

---

## Finance API

### Invoices

#### GET `/invoices`
Get all invoices.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `draft`, `pending`, `sent`, `paid`, `partial`, `overdue`, `cancelled` |
| clientId | string | Filter by client |
| caseId | string | Filter by case |
| startDate | string | Issue date range start |
| endDate | string | Issue date range end |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "invoices": [
    {
      "_id": "string",
      "invoiceNumber": "INV-0001",
      "caseId": "string",
      "contractId": "string",
      "lawyerId": { "firstName": "string", "lastName": "string" },
      "clientId": { "firstName": "string", "lastName": "string" },
      "items": [
        { "description": "string", "quantity": 1, "unitPrice": 1000, "total": 1000 }
      ],
      "subtotal": 1000,
      "vatRate": 0.15,
      "vatAmount": 150,
      "totalAmount": 1150,
      "amountPaid": 0,
      "balanceDue": 1150,
      "status": "draft | pending | sent | paid | partial | overdue | cancelled",
      "issueDate": "ISO date",
      "dueDate": "ISO date",
      "paidDate": "ISO date",
      "notes": "string",
      "pdfUrl": "string",
      "history": [{ "action": "string", "performedBy": "string", "timestamp": "ISO date" }],
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "total": 100,
  "pagination": { ... }
}
```

#### GET `/invoices/:id`
Get single invoice.

#### POST `/invoices`
Create invoice.

**Request:**
```json
{
  "clientId": "string",
  "caseId": "string (optional)",
  "items": [{ "description": "string", "quantity": 1, "unitPrice": 1000, "total": 1000 }],
  "subtotal": 1000,
  "vatRate": 0.15,
  "vatAmount": 150,
  "totalAmount": 1150,
  "dueDate": "ISO date",
  "notes": "string"
}
```

#### PUT `/invoices/:id`
Update invoice.

#### DELETE `/invoices/:id`
Delete invoice.

#### POST `/invoices/:id/send`
Send invoice to client.

#### POST `/invoices/:id/mark-paid`
Mark invoice as paid.

#### POST `/invoices/:id/record-payment`
Record partial payment.

**Request:**
```json
{
  "amount": 500,
  "paymentMethod": "bank_transfer",
  "notes": "string"
}
```

#### GET `/invoices/overdue`
Get overdue invoices.

#### GET `/invoices/summary`
Get invoice statistics.

### Quotes

#### GET `/quotes`
Get all quotes.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `draft`, `pending`, `sent`, `accepted`, `declined`, `cancelled`, `expired` |
| clientId | string | Filter by client |
| startDate | string | Issue date range start |
| endDate | string | Issue date range end |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "quotes": [
    {
      "_id": "string",
      "quoteNumber": "QTE-0001",
      "clientId": { "_id": "string", "firstName": "string", "lastName": "string" },
      "caseId": "string",
      "items": [{ "description": "string", "quantity": 1, "unitPrice": 1000, "total": 1000 }],
      "subtotal": 1000,
      "vatRate": 0.15,
      "vatAmount": 150,
      "totalAmount": 1150,
      "status": "draft | pending | sent | accepted | declined | cancelled | on_hold | expired",
      "issueDate": "ISO date",
      "expiredDate": "ISO date",
      "validUntil": "ISO date",
      "notes": "string",
      "terms": "string",
      "currency": "SAR",
      "convertedToInvoice": false,
      "invoiceId": "string",
      "history": [...],
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "total": 50,
  "pagination": { ... }
}
```

#### GET `/quotes/:id`
Get single quote.

#### POST `/quotes`
Create quote.

#### PUT `/quotes/:id`
Update quote.

#### DELETE `/quotes/:id`
Delete quote.

#### POST `/quotes/:id/send`
Send quote to client.

#### PATCH `/quotes/:id/status`
Update quote status.

#### POST `/quotes/:id/convert-to-invoice`
Convert accepted quote to invoice.

#### GET `/quotes/summary`
Get quotes statistics.

#### POST `/quotes/:id/duplicate`
Duplicate a quote.

### Payments

#### GET `/payments`
Get all payments.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `pending`, `completed`, `failed`, `refunded` |
| clientId | string | Filter by client |
| startDate | string | Payment date range start |
| endDate | string | Payment date range end |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "payments": [
    {
      "_id": "string",
      "paymentNumber": "PAY-0001",
      "clientId": { "_id": "string", "firstName": "string", "lastName": "string" },
      "invoiceId": { "_id": "string", "invoiceNumber": "string" },
      "caseId": "string",
      "lawyerId": "string",
      "paymentDate": "ISO date",
      "amount": 5000,
      "currency": "SAR",
      "paymentMethod": "bank_transfer | cash | credit_card | check",
      "transactionId": "string",
      "status": "pending | completed | failed | refunded",
      "notes": "string",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "total": 100,
  "pagination": { ... }
}
```

#### GET `/payments/:id`
Get single payment.

#### POST `/payments`
Create payment.

#### PUT `/payments/:id`
Update payment.

#### DELETE `/payments/:id`
Delete payment.

#### POST `/payments/:id/complete`
Mark payment as completed.

#### GET `/payments/summary`
Get payments statistics.

**Response:**
```json
{
  "totalCompleted": 500000,
  "totalPending": 50000,
  "totalRefunded": 10000,
  "totalThisMonth": 100000
}
```

### Expenses

#### GET `/expenses`
Get all expenses.

#### GET `/expenses/:id`
Get single expense.

#### POST `/expenses`
Create expense.

#### PUT `/expenses/:id`
Update expense.

#### DELETE `/expenses/:id`
Delete expense.

#### POST `/expenses/:id/receipts`
Upload expense receipt.

#### GET `/expenses/summary`
Get expense statistics.

### Time Tracking

#### GET `/time-entries`
Get all time entries.

#### GET `/time-entries/:id`
Get single time entry.

#### POST `/time-entries`
Create time entry.

#### PUT `/time-entries/:id`
Update time entry.

#### DELETE `/time-entries/:id`
Delete time entry.

#### GET `/time-entries/timer`
Get current timer status.

#### POST `/time-entries/timer/start`
Start timer.

#### POST `/time-entries/timer/pause`
Pause timer.

#### POST `/time-entries/timer/resume`
Resume timer.

#### POST `/time-entries/timer/stop`
Stop timer and save entry.

#### POST `/time-entries/bulk-bill`
Bulk bill time entries.

### Transactions

#### GET `/transactions`
Get all transactions.

#### POST `/transactions`
Create transaction.

#### PUT `/transactions/:id`
Update transaction.

#### DELETE `/transactions/:id`
Delete transaction.

### Statements

#### GET `/statements`
Get all client statements.

#### POST `/statements`
Generate statement.

#### POST `/statements/:id/send`
Send statement to client.

### Reports

#### POST `/reports/export`
Export report.

**Request:**
```json
{
  "reportType": "invoices | payments | expenses | time-entries | outstanding-invoices",
  "format": "csv | pdf",
  "filters": { ... }
}
```

---

## Tasks API

### GET `/tasks`
Get all tasks with filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `backlog`, `todo`, `in_progress`, `done`, `canceled` |
| priority | string | `none`, `low`, `medium`, `high`, `critical` |
| label | string | `bug`, `feature`, `documentation`, etc. |
| assignedTo | string | User ID |
| caseId | string | Related case |
| clientId | string | Related client |
| isTemplate | boolean | Template tasks only |
| isRecurring | boolean | Recurring tasks only |
| overdue | boolean | Overdue tasks only |
| dueDateFrom | string | Date range start |
| dueDateTo | string | Date range end |
| search | string | Search term |
| tags | string | Comma-separated tags |
| sortBy | string | `dueDate`, `priority`, `createdAt`, `updatedAt`, `title` |
| sortOrder | string | `asc`, `desc` |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "tasks": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "status": "backlog | todo | in_progress | done | canceled",
      "priority": "none | low | medium | high | critical",
      "label": "bug | feature | ...",
      "tags": ["string"],
      "dueDate": "ISO date",
      "dueTime": "string",
      "startDate": "ISO date",
      "completedAt": "ISO date",
      "assignedTo": { "_id": "string", "firstName": "string", "lastName": "string", "avatar": "string" },
      "createdBy": { "_id": "string", "firstName": "string", "lastName": "string" },
      "caseId": { "_id": "string", "caseNumber": "string", "title": "string" },
      "clientId": { "_id": "string", "name": "string" },
      "parentTaskId": "string",
      "subtasks": [{ "title": "string", "completed": false, "order": 0 }],
      "checklists": [{ "title": "string", "items": [{ "text": "string", "checked": false }] }],
      "timeTracking": { "estimatedMinutes": 60, "actualMinutes": 45, "sessions": [...] },
      "recurring": { "enabled": true, "frequency": "weekly", "daysOfWeek": [1,3,5], ... },
      "reminders": [{ "type": "notification", "beforeMinutes": 30, "sent": false }],
      "attachments": [{ "fileName": "string", "fileUrl": "string", "fileType": "string" }],
      "comments": [{ "userId": "string", "userName": "string", "text": "string", "createdAt": "ISO date" }],
      "history": [{ "action": "created", "userId": "string", "timestamp": "ISO date" }],
      "estimatedMinutes": 60,
      "actualMinutes": 45,
      "progress": 75,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "total": 100,
  "pagination": { ... }
}
```

### GET `/tasks/:id`
Get single task.

### POST `/tasks`
Create task.

### PUT `/tasks/:id`
Update task.

### DELETE `/tasks/:id`
Delete task.

### PATCH `/tasks/:id/status`
Update task status.

### POST `/tasks/:id/complete`
Mark task as complete.

### POST `/tasks/:id/reopen`
Reopen completed task.

### POST `/tasks/:id/subtasks`
Add subtask.

### PATCH `/tasks/:id/subtasks/:subtaskId`
Update subtask.

### POST `/tasks/:id/subtasks/:subtaskId/toggle`
Toggle subtask completion.

### DELETE `/tasks/:id/subtasks/:subtaskId`
Delete subtask.

### PATCH `/tasks/:id/subtasks/reorder`
Reorder subtasks.

### POST `/tasks/:id/time-tracking/start`
Start time tracking.

### POST `/tasks/:id/time-tracking/stop`
Stop time tracking.

### POST `/tasks/:id/time-tracking/manual`
Add manual time entry.

### GET `/tasks/:id/time-tracking`
Get time tracking summary.

### POST `/tasks/:id/comments`
Add comment.

### PATCH `/tasks/:id/comments/:commentId`
Update comment.

### DELETE `/tasks/:id/comments/:commentId`
Delete comment.

### POST `/tasks/:id/attachments`
Upload attachment (multipart/form-data).

### DELETE `/tasks/:id/attachments/:attachmentId`
Delete attachment.

### GET `/tasks/upcoming`
Get upcoming tasks.

### GET `/tasks/overdue`
Get overdue tasks.

### GET `/tasks/due-today`
Get tasks due today.

### GET `/tasks/my-tasks`
Get tasks assigned to current user.

### GET `/tasks/stats`
Get task statistics.

### GET `/tasks/templates`
Get task templates.

### POST `/tasks/templates/:templateId/create`
Create task from template.

### POST `/tasks/:id/save-as-template`
Save task as template.

### PATCH `/tasks/bulk`
Bulk update tasks.

### DELETE `/tasks/bulk`
Bulk delete tasks.

### POST `/tasks/bulk/complete`
Bulk complete tasks.

### POST `/tasks/bulk/assign`
Bulk assign tasks.

### POST `/tasks/import`
Import tasks from CSV.

### GET `/tasks/export`
Export tasks to CSV.

### POST `/tasks/:id/recurring/skip`
Skip next recurrence.

### POST `/tasks/:id/recurring/stop`
Stop recurring task.

### GET `/tasks/:id/recurring/history`
Get recurrence history.

---

## Events API

### GET `/events`
Get all events.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | `hearing`, `meeting`, `deadline`, etc. |
| status | string | `scheduled`, `in_progress`, `completed`, `cancelled`, `postponed` |
| caseId | string | Related case |
| clientId | string | Related client |
| startDate | string | Date range start |
| endDate | string | Date range end |
| search | string | Search term |
| page | number | Page number |
| limit | number | Items per page |

### GET `/events/:id`
Get single event.

### POST `/events`
Create event.

### PUT `/events/:id`
Update event.

### DELETE `/events/:id`
Delete event.

### PATCH `/events/:id/status`
Update event status.

### POST `/events/:id/cancel`
Cancel event.

### POST `/events/:id/reschedule`
Reschedule event.

### POST `/events/:id/complete`
Mark event as completed.

### POST `/events/:id/attendees`
Add attendee.

### DELETE `/events/:id/attendees/:attendeeId`
Remove attendee.

### POST `/events/:id/rsvp`
Update RSVP status.

### GET `/events/upcoming`
Get upcoming events.

### GET `/events/today`
Get today's events.

### GET `/events/calendar`
Get calendar view events.

### POST `/events/sync/google`
Sync with Google Calendar.

### POST `/events/sync/outlook`
Sync with Outlook Calendar.

---

## Reminders API

### GET `/reminders`
Get all reminders.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `pending`, `snoozed`, `triggered`, `completed`, `dismissed`, `expired` |
| priority | string | `low`, `medium`, `high`, `urgent`, `critical` |
| type | string | `task`, `hearing`, `deadline`, `meeting`, etc. |
| assignedTo | string | User ID |
| relatedCase | string | Case ID |
| relatedClient | string | Client ID |
| isRecurring | boolean | Recurring only |
| overdue | boolean | Overdue only |
| startDate | string | Date range start |
| endDate | string | Date range end |
| page | number | Page number |
| limit | number | Items per page |

### GET `/reminders/:id`
Get single reminder.

### POST `/reminders`
Create reminder.

### PUT `/reminders/:id`
Update reminder.

### DELETE `/reminders/:id`
Delete reminder.

### POST `/reminders/:id/snooze`
Snooze reminder.

**Request:**
```json
{
  "snoozeUntil": "ISO date",
  "reason": "string (optional)"
}
```

### POST `/reminders/:id/complete`
Mark reminder as completed.

### POST `/reminders/:id/dismiss`
Dismiss reminder.

### POST `/reminders/:id/delegate`
Delegate reminder to another user.

### GET `/reminders/pending`
Get pending reminders.

### GET `/reminders/upcoming`
Get upcoming reminders.

### GET `/reminders/overdue`
Get overdue reminders.

### GET `/reminders/stats`
Get reminder statistics.

### DELETE `/reminders/bulk`
Bulk delete reminders.

### POST `/reminders/bulk/snooze`
Bulk snooze reminders.

### POST `/reminders/bulk/complete`
Bulk complete reminders.

---

## Settings API

### Company Settings

#### GET `/settings/company`
Get company settings.

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "country": "string",
  "postalCode": "string",
  "logo": "string (url)",
  "taxNumber": "string",
  "commercialRegister": "string",
  "bankName": "string",
  "bankAccount": "string",
  "iban": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

#### PUT `/settings/company`
Update company settings.

#### POST `/settings/company/logo`
Upload company logo (multipart/form-data).

### Tax Settings

#### GET `/settings/taxes`
Get all taxes.

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "name": "ضريبة القيمة المضافة",
      "rate": 15,
      "isDefault": true,
      "isActive": true,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

#### POST `/settings/taxes`
Create tax.

#### PUT `/settings/taxes/:id`
Update tax.

#### DELETE `/settings/taxes/:id`
Delete tax.

#### PATCH `/settings/taxes/:id/default`
Set as default tax.

### Payment Modes

#### GET `/settings/payment-modes`
Get all payment modes.

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "name": "تحويل بنكي",
      "description": "string",
      "isDefault": true,
      "isActive": true,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

#### POST `/settings/payment-modes`
Create payment mode.

#### PUT `/settings/payment-modes/:id`
Update payment mode.

#### DELETE `/settings/payment-modes/:id`
Delete payment mode.

#### PATCH `/settings/payment-modes/:id/default`
Set as default payment mode.

### Finance Settings

#### GET `/settings/finance`
Get finance settings.

**Response:**
```json
{
  "_id": "string",
  "defaultCurrency": "SAR",
  "invoicePrefix": "INV",
  "invoiceStartNumber": 1,
  "quotePrefix": "QTE",
  "quoteStartNumber": 1,
  "paymentTerms": 30,
  "defaultTaxId": "string",
  "defaultPaymentModeId": "string",
  "enableLateFees": false,
  "lateFeePercentage": 2,
  "enablePartialPayments": true,
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

#### PUT `/settings/finance`
Update finance settings.

### User Settings

#### GET `/settings`
Get user settings.

#### PUT `/settings/account`
Update account settings.

#### PUT `/settings/appearance`
Update appearance settings.

#### PUT `/settings/display`
Update display settings.

#### PUT `/settings/notifications`
Update notification settings.

---

## Other APIs

### Lawyers API

- `GET /lawyers` - Get all lawyers
- `GET /lawyers/:id` - Get single lawyer
- `GET /lawyers/team` - Get team members

### Documents API

- `GET /documents` - Get all documents
- `GET /documents/:id` - Get single document
- `POST /documents` - Upload document
- `DELETE /documents/:id` - Delete document
- `GET /documents/:id/download` - Download document
- `GET /documents/:id/preview` - Preview document

### Calendar API

- `GET /calendar/events` - Get calendar events
- `GET /calendar/events/:id` - Get calendar event
- `POST /calendar/events` - Create calendar event
- `PUT /calendar/events/:id` - Update calendar event
- `DELETE /calendar/events/:id` - Delete calendar event
- `POST /calendar/sync/google` - Sync with Google Calendar

### Dashboard API

- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/recent-activity` - Get recent activity
- `GET /dashboard/upcoming` - Get upcoming items

### Reports API

- `GET /reports/revenue` - Revenue report
- `GET /reports/cases` - Cases report
- `GET /reports/time-entries` - Time entries report
- `GET /reports/outstanding-invoices` - Outstanding invoices report
- `GET /reports/accounts-aging` - Accounts aging report
- `GET /reports/revenue-by-client` - Revenue by client report

### Users API

- `GET /users` - Get all users
- `GET /users/:id` - Get single user
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Contacts API

- `GET /contacts` - Get all contacts
- `GET /contacts/:id` - Get single contact
- `POST /contacts` - Create contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

### Organizations API

- `GET /organizations` - Get all organizations
- `GET /organizations/:id` - Get single organization
- `POST /organizations` - Create organization
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

### Tags API

- `GET /tags` - Get all tags
- `POST /tags` - Create tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag

### Follow-ups API

- `GET /followups` - Get all follow-ups
- `GET /followups/:id` - Get single follow-up
- `POST /followups` - Create follow-up
- `PUT /followups/:id` - Update follow-up
- `DELETE /followups/:id` - Delete follow-up
- `POST /followups/:id/complete` - Mark as completed

### Billing Rates API

- `GET /billing-rates` - Get all billing rates
- `POST /billing-rates` - Create billing rate
- `PUT /billing-rates/:id` - Update billing rate
- `DELETE /billing-rates/:id` - Delete billing rate

### Invoice Templates API

- `GET /invoice-templates` - Get all templates
- `GET /invoice-templates/:id` - Get single template
- `POST /invoice-templates` - Create template
- `PUT /invoice-templates/:id` - Update template
- `DELETE /invoice-templates/:id` - Delete template

### Trust Account API

- `GET /trust-account` - Get trust account info
- `GET /trust-account/transactions` - Get trust transactions
- `POST /trust-account/deposit` - Make deposit
- `POST /trust-account/withdraw` - Make withdrawal

### Data Export API

- `POST /data-export` - Export data
- `GET /data-export/history` - Get export history

### Conflict Check API

- `POST /conflict-check` - Run conflict check
- `GET /conflict-check/history` - Get conflict check history

### Case Workflows API

- `GET /case-workflows` - Get all workflows
- `POST /case-workflows` - Create workflow
- `PUT /case-workflows/:id` - Update workflow
- `DELETE /case-workflows/:id` - Delete workflow
- `POST /case-workflows/:id/apply` - Apply workflow to case

### Conversations/Chat API

- `GET /conversations` - Get all conversations
- `GET /conversations/:id` - Get conversation
- `POST /conversations` - Start conversation
- `POST /conversations/:id/messages` - Send message
- `GET /conversations/:id/messages` - Get messages

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Implementation Notes

1. **Authentication**: Use JWT tokens stored in HTTP-only cookies
2. **CORS**: Enable CORS with credentials support
3. **Validation**: Validate all input data server-side
4. **Pagination**: Default 10 items per page, max 100
5. **Dates**: Use ISO 8601 format (e.g., `2024-01-15T10:30:00Z`)
6. **IDs**: Use MongoDB ObjectId format
7. **File Uploads**: Support multipart/form-data for file uploads
8. **Search**: Implement full-text search where applicable
9. **Soft Delete**: Consider soft delete for important resources
10. **Audit Trail**: Log all important operations for compliance
