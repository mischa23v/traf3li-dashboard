# Backend API Requirements for Finance Module

## Overview

This document provides comprehensive documentation for backend developers to implement the required API endpoints for the Finance module. The frontend uses TanStack Query for data fetching with REST APIs.

## Base URL Structure
```
/api/v1/
```

## Authentication
All endpoints require JWT authentication via Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. INVOICES API

### Endpoints

#### GET /invoices
Get all invoices with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: `draft`, `pending`, `sent`, `paid`, `partial`, `overdue`, `cancelled` |
| clientId | string | Filter by client ID |
| caseId | string | Filter by case ID |
| startDate | string | Filter by issue date (ISO 8601) |
| endDate | string | Filter by issue date (ISO 8601) |
| page | number | Pagination page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Response:**
```json
{
  "invoices": [
    {
      "_id": "string",
      "invoiceNumber": "INV-001",
      "caseId": "string",
      "contractId": "string",
      "lawyerId": { "firstName": "string", "lastName": "string" },
      "clientId": { "firstName": "string", "lastName": "string" },
      "items": [
        {
          "description": "string",
          "quantity": 1,
          "unitPrice": 1000,
          "total": 1000
        }
      ],
      "subtotal": 1000,
      "vatRate": 15,
      "vatAmount": 150,
      "totalAmount": 1150,
      "amountPaid": 0,
      "balanceDue": 1150,
      "status": "draft",
      "issueDate": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-02-01T00:00:00.000Z",
      "notes": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### GET /invoices/:id
Get single invoice by ID.

**Response:**
```json
{
  "invoice": { /* Invoice object */ }
}
```

#### POST /invoices
Create new invoice.

**Request Body:**
```json
{
  "clientId": "string (required)",
  "caseId": "string (optional)",
  "items": [
    {
      "description": "string",
      "quantity": 1,
      "unitPrice": 1000,
      "total": 1000
    }
  ],
  "subtotal": 1000,
  "vatRate": 15,
  "vatAmount": 150,
  "totalAmount": 1150,
  "dueDate": "2024-02-01",
  "notes": "string (optional)",
  "discountType": "percentage | fixed (optional)",
  "discountValue": 0
}
```

**Response:** Created invoice object

#### PATCH /invoices/:id
Update invoice.

**Request Body:** Partial invoice object

**Response:** Updated invoice object

#### DELETE /invoices/:id
Delete invoice.

**Response:**
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

#### POST /invoices/:id/send
Send invoice to client via email.

**Response:** Updated invoice object with status changed to `sent`

#### GET /invoices/overdue
Get all overdue invoices.

**Response:**
```json
{
  "invoices": [ /* Invoice objects */ ]
}
```

---

## 2. EXPENSES API

### Endpoints

#### GET /expenses
Get all expenses with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| category | string | Filter by category |
| caseId | string | Filter by case ID |
| startDate | string | Filter by date (ISO 8601) |
| endDate | string | Filter by date (ISO 8601) |
| page | number | Pagination page number |
| limit | number | Items per page |

**Response:**
```json
{
  "expenses": [
    {
      "_id": "string",
      "expenseId": "EXP-001",
      "description": "string",
      "amount": 500,
      "category": "travel | meals | supplies | communication | software | professional_fees | court_fees | filing_fees | other",
      "caseId": "string",
      "userId": { "firstName": "string", "lastName": "string" },
      "date": "2024-01-01",
      "paymentMethod": "cash | bank_transfer | credit_card | check | online",
      "vendor": "string",
      "isBillable": true,
      "billableAmount": 500,
      "status": "pending | approved | rejected | reimbursed",
      "receipts": [
        {
          "fileName": "receipt.pdf",
          "fileUrl": "https://...",
          "fileType": "application/pdf",
          "uploadedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "notes": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50
}
```

#### GET /expenses/:id
Get single expense by ID.

#### POST /expenses
Create new expense.

**Request Body:**
```json
{
  "description": "string (required)",
  "amount": 500,
  "category": "string (required)",
  "caseId": "string (optional)",
  "date": "2024-01-01",
  "paymentMethod": "string",
  "vendor": "string (optional)",
  "isBillable": true,
  "notes": "string (optional)"
}
```

#### PATCH /expenses/:id
Update expense.

#### DELETE /expenses/:id
Delete expense.

#### POST /expenses/:id/receipt
Upload receipt attachment.

**Request:** multipart/form-data with file field

**Response:**
```json
{
  "receipt": {
    "fileName": "receipt.pdf",
    "fileUrl": "https://...",
    "fileType": "application/pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /expenses/stats
Get expense statistics.

**Query Parameters:** startDate, endDate, caseId

**Response:**
```json
{
  "stats": {
    "totalExpenses": 10000,
    "billableExpenses": 7500,
    "nonBillableExpenses": 2500,
    "byCategory": {
      "travel": 3000,
      "meals": 1500,
      "supplies": 500
    },
    "byMonth": [
      { "month": "2024-01", "amount": 5000 },
      { "month": "2024-02", "amount": 5000 }
    ]
  }
}
```

---

## 3. TIME TRACKING API

### Timer Endpoints

#### GET /time-tracking/timer/status
Get current timer status.

**Response:**
```json
{
  "isRunning": true,
  "timer": {
    "startedAt": "2024-01-01T09:00:00.000Z",
    "description": "string",
    "caseId": "string",
    "activityCode": "string",
    "hourlyRate": 500,
    "isPaused": false,
    "pausedAt": null,
    "elapsedMinutes": 120,
    "pausedDuration": 0
  }
}
```

#### POST /time-tracking/timer/start
Start a new timer.

**Request Body:**
```json
{
  "caseId": "string (required)",
  "clientId": "string (required)",
  "activityCode": "string (optional)",
  "description": "string (required)"
}
```

#### POST /time-tracking/timer/pause
Pause the running timer.

#### POST /time-tracking/timer/resume
Resume a paused timer.

#### POST /time-tracking/timer/stop
Stop the timer and create a time entry.

**Request Body:**
```json
{
  "notes": "string (optional)",
  "isBillable": true
}
```

**Response:** Created TimeEntry object

### Time Entry Endpoints

#### GET /time-tracking/entries
Get all time entries.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| caseId | string | Filter by case ID |
| clientId | string | Filter by client ID |
| startDate | string | Filter by date |
| endDate | string | Filter by date |
| isBillable | boolean | Filter billable entries |
| activityCode | string | Filter by activity |
| page | number | Pagination |
| limit | number | Items per page |

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "entryId": "TE-001",
      "description": "string",
      "lawyerId": { "firstName": "string", "lastName": "string", "_id": "string" },
      "clientId": "string",
      "caseId": "string",
      "date": "2024-01-01",
      "startTime": "09:00",
      "endTime": "11:00",
      "duration": 120,
      "hourlyRate": 500,
      "totalAmount": 1000,
      "isBillable": true,
      "isBilled": false,
      "activityCode": "research",
      "status": "unbilled | billed | approved",
      "invoiceId": null,
      "wasTimerBased": true,
      "notes": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "summary": {
    "totalHours": 250,
    "billableHours": 200,
    "totalAmount": 125000
  }
}
```

#### GET /time-tracking/entries/:id
Get single time entry.

#### POST /time-tracking/entries
Create manual time entry.

**Request Body:**
```json
{
  "caseId": "string (required)",
  "clientId": "string (required)",
  "date": "2024-01-01",
  "description": "string (required)",
  "duration": 120,
  "hourlyRate": 500,
  "activityCode": "string (optional)",
  "isBillable": true,
  "notes": "string (optional)"
}
```

#### PATCH /time-tracking/entries/:id
Update time entry.

#### DELETE /time-tracking/entries/:id
Delete time entry.

#### GET /time-tracking/weekly
Get weekly time entries for calendar view.

**Query Parameters:** weekStartDate (ISO 8601)

**Response:**
```json
{
  "data": {
    "weekStartDate": "2024-01-01",
    "weekEndDate": "2024-01-07",
    "projects": [
      {
        "projectId": "string",
        "projectName": "string",
        "clientName": "string",
        "entries": {
          "2024-01-01": [
            {
              "entryId": "string",
              "duration": 120,
              "description": "string",
              "isBillable": true
            }
          ]
        },
        "totalHours": 10
      }
    ],
    "dailyTotals": {
      "2024-01-01": 480,
      "2024-01-02": 360
    },
    "weeklyTotal": 2400
  }
}
```

#### GET /time-tracking/stats
Get time tracking statistics.

---

## 4. PAYMENTS API

### Endpoints

#### GET /payments
Get all payments.

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "paymentNumber": "PAY-001",
      "clientId": "string",
      "invoiceId": "string",
      "caseId": "string",
      "lawyerId": "string",
      "paymentDate": "2024-01-01",
      "amount": 5000,
      "currency": "SAR",
      "paymentMethod": "bank_transfer | cash | credit_card | check | online",
      "transactionId": "string",
      "status": "pending | completed | failed | refunded",
      "notes": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

#### GET /payments/:id
Get single payment.

#### POST /payments
Create new payment.

**Request Body:**
```json
{
  "clientId": "string (required)",
  "invoiceId": "string (optional)",
  "caseId": "string (optional)",
  "amount": 5000,
  "currency": "SAR",
  "paymentMethod": "string",
  "transactionId": "string (optional)",
  "notes": "string (optional)"
}
```

#### POST /payments/:id/complete
Mark payment as completed.

#### POST /invoices/:invoiceId/payments
Record payment for specific invoice.

#### GET /payments/summary
Get payments summary.

**Response:**
```json
{
  "summary": {
    "totalReceived": 100000,
    "thisMonth": 25000,
    "pending": 15000,
    "byMethod": {
      "bank_transfer": 50000,
      "cash": 30000,
      "credit_card": 20000
    }
  }
}
```

---

## 5. TRANSACTIONS API

### Endpoints

#### GET /transactions
Get all transactions.

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "transactionId": "TXN-001",
      "userId": "string",
      "type": "income | expense | transfer",
      "amount": 5000,
      "category": "string",
      "description": "string",
      "paymentMethod": "string",
      "date": "2024-01-01",
      "status": "pending | completed | cancelled",
      "reference": "string",
      "invoiceId": "string",
      "expenseId": "string",
      "notes": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

#### GET /transactions/:id
Get single transaction.

#### POST /transactions
Create new transaction.

**Request Body:**
```json
{
  "type": "income | expense | transfer (required)",
  "amount": 5000,
  "category": "string (required)",
  "description": "string (required)",
  "paymentMethod": "string (optional)",
  "date": "2024-01-01",
  "notes": "string (optional)"
}
```

#### PATCH /transactions/:id
Update transaction.

#### DELETE /transactions/:id
Delete transaction.

#### GET /transactions/balance
Get account balance.

**Query Parameters:** upToDate (ISO 8601)

**Response:**
```json
{
  "balance": 150000,
  "asOfDate": "2024-01-01"
}
```

#### GET /transactions/summary
Get transaction summary.

---

## 6. STATEMENTS API

### Endpoints

#### GET /statements
Get all statements.

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "statementNumber": "STM-001",
      "clientId": "string",
      "clientName": "string",
      "period": "monthly | quarterly | annually | custom",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "items": [
        {
          "_id": "string",
          "type": "invoice | payment | expense | adjustment",
          "reference": "INV-001",
          "description": "string",
          "date": "2024-01-15",
          "amount": 5000
        }
      ],
      "totalAmount": 25000,
      "status": "draft | sent | paid | archived",
      "generatedDate": "2024-02-01",
      "dueDate": "2024-02-15",
      "notes": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

#### GET /statements/:id
Get single statement.

#### POST /statements
Create new statement.

**Request Body:**
```json
{
  "clientId": "string (required)",
  "period": "monthly | quarterly | annually | custom",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "items": [ /* ... */ ],
  "notes": "string (optional)",
  "status": "draft | sent"
}
```

#### PUT /statements/:id
Update statement.

#### DELETE /statements/:id
Delete statement.

#### POST /statements/:id/send
Send statement to client.

#### GET /statements/:id/download
Download statement as PDF or Excel.

**Query Parameters:** format (`pdf` | `xlsx`)

**Response:** File blob

---

## 7. ACTIVITIES API

### Endpoints

#### GET /activities
Get all financial activities.

**Response:**
```json
{
  "data": [
    {
      "_id": "string",
      "activityId": "ACT-001",
      "date": "2024-01-01",
      "time": "14:30",
      "type": "payment_received | payment_sent | invoice_created | invoice_sent | invoice_paid | expense_created | expense_approved | transaction_created",
      "title": "string",
      "description": "string",
      "reference": "INV-001",
      "amount": 5000,
      "userId": "string",
      "userName": "string",
      "status": "completed | pending",
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

#### GET /activities/:id
Get single activity.

#### POST /activities
Create new activity.

#### PATCH /activities/:id
Update activity.

#### DELETE /activities/:id
Delete activity.

---

## 8. REPORTS API

### GET /reports/accounts-aging
Get accounts aging report.

**Query Parameters:** clientId (optional)

**Response:**
```json
{
  "report": {
    "summary": {
      "totalOutstanding": 250000,
      "zeroToThirtyDays": 100000,
      "thirtyOneToSixtyDays": 75000,
      "sixtyOneToNinetyDays": 50000,
      "ninetyPlusDays": 25000
    },
    "clients": [
      {
        "clientId": "string",
        "clientName": "string",
        "zeroToThirtyDays": 50000,
        "thirtyOneToSixtyDays": 25000,
        "sixtyOneToNinetyDays": 15000,
        "ninetyPlusDays": 10000,
        "total": 100000,
        "invoices": [
          {
            "invoiceNumber": "INV-001",
            "amount": 25000,
            "dueDate": "2024-01-15",
            "daysOverdue": 45
          }
        ]
      }
    ],
    "generatedAt": "2024-02-01T00:00:00.000Z"
  }
}
```

### GET /reports/revenue-by-client
Get revenue by client report.

**Query Parameters:** startDate, endDate, clientId

**Response:**
```json
{
  "report": {
    "summary": {
      "totalRevenue": 500000,
      "totalPaid": 400000,
      "totalOutstanding": 100000,
      "clientCount": 15
    },
    "clients": [
      {
        "clientId": "string",
        "clientName": "string",
        "totalRevenue": 100000,
        "paidAmount": 80000,
        "outstandingAmount": 20000,
        "invoiceCount": 5,
        "lastPaymentDate": "2024-01-20"
      }
    ],
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "generatedAt": "2024-02-01T00:00:00.000Z"
  }
}
```

### GET /reports/outstanding-invoices
Get outstanding invoices report.

**Query Parameters:** clientId, minDaysOverdue, startDate, endDate

**Response:**
```json
{
  "report": {
    "summary": {
      "totalOutstanding": 250000,
      "totalOverdue": 150000,
      "totalDueSoon": 75000,
      "invoiceCount": 25,
      "overdueCount": 15
    },
    "invoices": [
      {
        "id": "string",
        "invoiceNumber": "INV-001",
        "clientName": "string",
        "amount": 25000,
        "dueDate": "2024-01-15",
        "daysOverdue": 30,
        "status": "overdue | due_soon | sent | draft"
      }
    ],
    "generatedAt": "2024-02-01T00:00:00.000Z"
  }
}
```

### GET /reports/time-entries
Get time entries report.

**Query Parameters:** startDate, endDate, clientId, caseId, userId, billable, groupBy

**Response:**
```json
{
  "report": {
    "summary": {
      "totalHours": 245.5,
      "billableHours": 198.5,
      "nonBillableHours": 47,
      "totalAmount": 198500,
      "billableAmount": 198500,
      "averageRate": 1000
    },
    "byClient": [
      {
        "clientName": "string",
        "hours": 85.5,
        "billableHours": 72,
        "amount": 72000,
        "cases": 3
      }
    ],
    "byUser": [
      {
        "userName": "string",
        "hours": 95,
        "billableHours": 85,
        "amount": 85000
      }
    ],
    "entries": [
      {
        "id": "string",
        "date": "2024-01-15",
        "user": "string",
        "client": "string",
        "case": "string",
        "description": "string",
        "duration": 180,
        "billable": true,
        "rate": 1000
      }
    ],
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "generatedAt": "2024-02-01T00:00:00.000Z"
  }
}
```

### GET /reports/:reportType/export
Export any report to CSV or PDF.

**Query Parameters:** format (`csv` | `pdf`), plus any report-specific filters

**Response:** File blob (application/pdf or text/csv)

---

## Error Handling

All endpoints should return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error message",
    "details": {
      "field": "Specific field error"
    }
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Validation Rules

### Invoice
- `clientId` - Required, valid ObjectId
- `items` - Required, array with at least 1 item
- `items[].description` - Required, string
- `items[].quantity` - Required, positive number
- `items[].unitPrice` - Required, positive number
- `dueDate` - Required, valid date, must be >= issueDate
- `vatRate` - Default 15 for Saudi Arabia

### Expense
- `description` - Required, string (3-500 chars)
- `amount` - Required, positive number
- `category` - Required, enum value
- `date` - Required, valid date
- `paymentMethod` - Required, enum value

### Time Entry
- `caseId` - Required, valid ObjectId
- `clientId` - Required, valid ObjectId
- `date` - Required, valid date
- `description` - Required, string
- `duration` - Required, positive integer (minutes)
- `hourlyRate` - Required, positive number

### Statement
- `clientId` - Required, valid ObjectId
- `period` - Required, enum value
- `startDate` - Required, valid date
- `endDate` - Required, valid date, must be > startDate

---

## Business Rules

### VAT Calculation
Saudi Arabia VAT rate is 15%. Calculate as:
```
vatAmount = subtotal * 0.15
totalAmount = subtotal + vatAmount
```

### Discount Application
Apply discount BEFORE VAT:
```
discountedSubtotal = subtotal - discount
vatAmount = discountedSubtotal * 0.15
totalAmount = discountedSubtotal + vatAmount
```

### Invoice Status Flow
```
draft -> sent -> partial (if partial payment) -> paid
draft -> sent -> overdue (if past due date)
Any state -> cancelled
```

### Time Entry Billing
- Track both `duration` (minutes) and `totalAmount`
- `totalAmount = (duration / 60) * hourlyRate`
- `isBilled` should be set to true when added to an invoice

### Account Aging Buckets
- 0-30 days: Current
- 31-60 days: 30+ days overdue
- 61-90 days: 60+ days overdue
- 90+ days: 90+ days overdue

---

## Currency

The system uses Saudi Riyal (SAR) as the default currency. All monetary values should:
- Be stored as numbers (not strings)
- Use 2 decimal places
- Be formatted with Arabic locale on frontend: `toLocaleString('ar-SA')`

---

## Date/Time Handling

- Store all dates in ISO 8601 format (UTC)
- Frontend will handle timezone conversion
- Return dates as strings: `"2024-01-15T00:00:00.000Z"`
- Accept dates as: `"2024-01-15"` or ISO 8601 format

---

## Pagination

All list endpoints should support pagination:

**Request:**
```
GET /endpoint?page=1&limit=10
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## File Uploads

For receipt/attachment uploads:
- Accept `multipart/form-data`
- Support formats: PDF, JPEG, PNG, DOC, DOCX
- Max file size: 10MB
- Store in secure cloud storage (S3, etc.)
- Return signed URLs for access

---

## Contact

For questions about this API specification, contact the frontend development team.
