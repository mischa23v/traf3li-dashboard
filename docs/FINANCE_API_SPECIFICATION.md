# Finance Module API Specification

**Version:** 2.0
**Last Updated:** 2025-11-27
**Frontend Branch:** claude/explore-financial-system-01XBLE8Hp4nLVUymB17NqBwb

This document provides detailed API specifications for the Finance Module backend implementation, aligned with the frontend forms inspired by miru-web.

---

## Base URL

```
/api/v1
```

## Authentication

All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <token>
```

---

## 1. Invoices API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | Get all invoices |
| GET | `/invoices/:id` | Get single invoice |
| POST | `/invoices` | Create invoice |
| PATCH | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Delete invoice |
| POST | `/invoices/:id/send` | Send invoice to client |
| GET | `/invoices/overdue` | Get overdue invoices |
| POST | `/invoices/:id/payments` | Record payment for invoice |

### Create Invoice Request

```typescript
POST /invoices

{
  // Required fields
  "clientId": "string",              // ObjectId reference to Client
  "items": [                         // Array of line items (min 1)
    {
      "description": "string",       // Item description
      "quantity": "number",          // Quantity (positive integer)
      "unitPrice": "number",         // Unit price in SAR
      "total": "number"              // Auto-calculated: quantity * unitPrice
    }
  ],
  "subtotal": "number",              // Sum of all item totals
  "vatRate": "number",               // VAT percentage (default: 15 for Saudi)
  "vatAmount": "number",             // Calculated: subtotal * (vatRate / 100)
  "totalAmount": "number",           // Calculated: subtotal + vatAmount
  "dueDate": "string",               // ISO date string (YYYY-MM-DD)

  // Optional fields
  "caseId": "string",                // ObjectId reference to Case/Project
  "notes": "string",                 // Additional notes
  "status": "draft"                  // Default status on creation
}
```

### Invoice Response Schema

```typescript
{
  "_id": "string",
  "invoiceNumber": "string",         // Auto-generated: INV-YYYY-XXXX
  "lawyerId": "ObjectId | User",     // User who created the invoice
  "clientId": "ObjectId | Client",
  "caseId": "ObjectId | Case",
  "items": [InvoiceItem],
  "subtotal": "number",
  "vatRate": "number",
  "vatAmount": "number",
  "totalAmount": "number",
  "amountPaid": "number",            // Default: 0
  "balanceDue": "number",            // Calculated: totalAmount - amountPaid
  "status": "draft | pending | sent | paid | partial | overdue | cancelled",
  "issueDate": "string",             // Auto-set on creation
  "dueDate": "string",
  "paidDate": "string | null",
  "notes": "string",
  "pdfUrl": "string | null",
  "history": [InvoiceHistory],
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Invoice Filters (Query Parameters)

```
GET /invoices?status=pending&clientId=xxx&caseId=xxx&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=20
```

---

## 2. Expenses API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | Get all expenses |
| GET | `/expenses/:id` | Get single expense |
| POST | `/expenses` | Create expense |
| PATCH | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |
| POST | `/expenses/:id/receipt` | Upload receipt file |
| GET | `/expenses/stats` | Get expense statistics |

### Create Expense Request

```typescript
POST /expenses

{
  // Required fields
  "description": "string",           // Expense description
  "amount": "number",                // Amount in SAR (positive)
  "category": "string",              // See category enum below
  "date": "string",                  // ISO date (YYYY-MM-DD)
  "paymentMethod": "string",         // See payment method enum below
  "expenseType": "company | personal", // Type of expense

  // Optional fields
  "vendor": "string",                // Vendor/supplier name
  "caseId": "string",                // ObjectId reference to Case
  "clientId": "string",              // ObjectId reference to Client
  "taxAmount": "number",             // Tax amount in SAR
  "receiptNumber": "string",         // Receipt/invoice number
  "isBillable": "boolean",           // Can be billed to client (default: false)
  "isReimbursable": "boolean",       // Employee reimbursement (for personal expenses)
  "notes": "string"                  // Additional notes
}
```

### Expense Categories Enum

```typescript
type ExpenseCategory =
  | 'office_supplies'      // مستلزمات مكتبية
  | 'travel'               // سفر وانتقالات
  | 'transport'            // مواصلات
  | 'meals'                // وجبات وضيافة
  | 'software'             // برمجيات واشتراكات
  | 'equipment'            // معدات وأجهزة
  | 'communication'        // اتصالات
  | 'government_fees'      // رسوم حكومية
  | 'professional_services' // خدمات مهنية
  | 'marketing'            // تسويق وإعلان
  | 'training'             // تدريب وتطوير
  | 'other'                // أخرى
```

### Payment Methods Enum

```typescript
type PaymentMethod =
  | 'cash'        // نقداً
  | 'card'        // بطاقة ائتمان
  | 'debit'       // بطاقة خصم
  | 'transfer'    // تحويل بنكي
  | 'check'       // شيك
  | 'petty_cash'  // صندوق النثريات
```

### Upload Receipt

```typescript
POST /expenses/:id/receipt
Content-Type: multipart/form-data

file: <binary file data>  // Accepts: image/*, application/pdf
```

---

## 3. Time Tracking API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/time-tracking/entries` | Get all time entries |
| GET | `/time-tracking/entries/:id` | Get single time entry |
| POST | `/time-tracking/entries` | Create manual time entry |
| PATCH | `/time-tracking/entries/:id` | Update time entry |
| DELETE | `/time-tracking/entries/:id` | Delete time entry |
| POST | `/time-tracking/timer/start` | Start timer |
| POST | `/time-tracking/timer/pause` | Pause timer |
| POST | `/time-tracking/timer/resume` | Resume timer |
| POST | `/time-tracking/timer/stop` | Stop timer and create entry |
| GET | `/time-tracking/timer/status` | Get current timer status |
| GET | `/time-tracking/stats` | Get time statistics |
| GET | `/time-tracking/weekly` | Get weekly entries for calendar |

### Create Time Entry Request (NEW FIELDS)

```typescript
POST /time-tracking/entries

{
  // Required fields
  "caseId": "string",                // ObjectId reference to Case/Project
  "description": "string",           // Work description
  "date": "string",                  // ISO date (YYYY-MM-DD)
  "duration": "number",              // Duration in MINUTES (not hours!)
  "taskType": "string",              // See task types enum below (NEW!)

  // Optional fields (with defaults)
  "clientId": "string",              // ObjectId reference to Client (NEW! - direct client selection)
  "assigneeId": "string",            // ObjectId reference to User (NEW! - team member assignment)
  "billStatus": "unbilled | billed | non_billable", // (NEW! - replaces simple boolean)
  "hourlyRate": "number",            // Hourly rate in SAR (default: 500)
  "isBillable": "boolean",           // Derived from billStatus (default: true)
  "notes": "string",                 // Additional notes

  // Time reference fields (optional - for audit trail)
  "startTime": "string",             // HH:mm format (if time-based entry)
  "endTime": "string"                // HH:mm format (if time-based entry)
}
```

### Task Types Enum (NEW!)

```typescript
type TaskType =
  | 'consultation'         // استشارة قانونية - Legal Consultation
  | 'research'             // بحث قانوني - Legal Research
  | 'document_review'      // مراجعة مستندات - Document Review
  | 'document_drafting'    // صياغة مستندات - Document Drafting
  | 'court_appearance'     // حضور جلسة - Court Appearance
  | 'meeting'              // اجتماع - Meeting
  | 'phone_call'           // مكالمة هاتفية - Phone Call
  | 'email_correspondence' // مراسلات بريدية - Email Correspondence
  | 'negotiation'          // تفاوض - Negotiation
  | 'contract_review'      // مراجعة عقود - Contract Review
  | 'filing'               // إيداع مستندات - Filing
  | 'travel'               // سفر وانتقال - Travel
  | 'administrative'       // إداري - Administrative
  | 'other'                // أخرى - Other
```

### Bill Status Enum (NEW!)

```typescript
type BillStatus =
  | 'unbilled'       // غير مفوتر - Not yet billed (default)
  | 'billed'         // مفوتر - Already included in invoice
  | 'non_billable'   // غير قابل للفوترة - Cannot be billed to client
```

### Time Entry Response Schema

```typescript
{
  "_id": "string",
  "entryId": "string",               // Auto-generated: TE-YYYY-XXXX
  "caseId": "ObjectId | Case",
  "clientId": "ObjectId | Client",
  "lawyerId": "ObjectId | User",     // User who logged the time
  "assigneeId": "ObjectId | User",   // (NEW!) Assigned team member
  "taskType": "string",              // (NEW!) Task type enum value
  "billStatus": "string",            // (NEW!) Bill status enum value
  "description": "string",
  "date": "string",
  "startTime": "string | null",
  "endTime": "string | null",
  "duration": "number",              // In minutes
  "hours": "number",                 // Calculated: duration / 60
  "hourlyRate": "number",
  "totalAmount": "number",           // Calculated: hours * hourlyRate
  "isBillable": "boolean",
  "isBilled": "boolean",             // Has been included in an invoice
  "invoiceId": "string | null",      // Reference to invoice if billed
  "wasTimerBased": "boolean",        // Whether created via timer
  "notes": "string",
  "status": "string",
  "history": [ActivityHistory],
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Timer Start Request

```typescript
POST /time-tracking/timer/start

{
  "caseId": "string",           // Required
  "clientId": "string",         // Required
  "description": "string",      // Required
  "activityCode": "string",     // Optional - maps to taskType
  "taskType": "string"          // Optional - task type enum
}
```

---

## 4. Transactions API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | Get all transactions |
| GET | `/transactions/:id` | Get single transaction |
| POST | `/transactions` | Create transaction |
| PATCH | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/transactions/balance` | Get account balance |
| GET | `/transactions/summary` | Get transaction summary |

### Create Transaction Request

```typescript
POST /transactions

{
  // Required fields
  "type": "income | expense | transfer",
  "amount": "number",                // Amount in SAR (positive)
  "category": "string",              // See categories by type below
  "description": "string",           // Transaction description
  "date": "string",                  // ISO date (YYYY-MM-DD)

  // Optional fields
  "paymentMethod": "string",         // cash | card | transfer | check
  "notes": "string"                  // Additional notes
}
```

### Transaction Categories by Type

**Income Categories:**
```typescript
| 'legal_fees'     // أتعاب قانونية
| 'consultation'   // استشارات
| 'retainer'       // مقدم أتعاب
| 'court_fees'     // رسوم محكمة
| 'other_income'   // إيرادات أخرى
```

**Expense Categories:**
```typescript
| 'office'         // مستلزمات مكتبية
| 'transport'      // مواصلات
| 'hospitality'    // ضيافة
| 'government'     // رسوم حكومية
| 'subscriptions'  // اشتراكات
| 'rent'           // إيجار
| 'utilities'      // خدمات
| 'other_expense'  // مصروفات أخرى
```

**Transfer Categories:**
```typescript
| 'internal_transfer' // تحويل داخلي
| 'bank_transfer'     // تحويل بنكي
```

---

## 5. Statements API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/statements` | Get all statements |
| GET | `/statements/:id` | Get single statement |
| POST | `/statements` | Create statement |
| PUT | `/statements/:id` | Update statement |
| DELETE | `/statements/:id` | Delete statement |
| POST | `/statements/:id/send` | Send statement to client |
| GET | `/statements/:id/download` | Download statement (PDF/XLSX) |

### Create Statement Request

```typescript
POST /statements

{
  // Required fields
  "clientId": "string",              // ObjectId reference to Client
  "period": "string",                // Period description (e.g., "يناير 2025")
  "startDate": "string",             // ISO date (YYYY-MM-DD)
  "endDate": "string",               // ISO date (YYYY-MM-DD)

  // Optional fields
  "notes": "string",                 // Notes to include in statement
  "status": "draft | sent"           // Default: draft
}
```

### Statement Response Schema

```typescript
{
  "_id": "string",
  "statementNumber": "string",       // Auto-generated: ST-YYYY-XXXX
  "clientId": "ObjectId",
  "clientName": "string",
  "period": "string",
  "startDate": "string",
  "endDate": "string",
  "items": [                         // Auto-populated from invoices/payments
    {
      "_id": "string",
      "type": "invoice | payment | expense | adjustment",
      "reference": "string",         // Invoice/payment number
      "description": "string",
      "date": "string",
      "amount": "number"
    }
  ],
  "totalAmount": "number",           // Calculated balance
  "status": "draft | sent | paid | archived",
  "generatedDate": "string",
  "dueDate": "string | null",
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

---

## 6. Account Activity API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activities` | Get all activities |
| GET | `/activities/:id` | Get single activity |
| POST | `/activities` | Create manual activity entry |
| PATCH | `/activities/:id` | Update activity |
| DELETE | `/activities/:id` | Delete activity |

### Create Activity Request

```typescript
POST /activities

{
  // Required fields
  "type": "string",                  // See activity types enum below
  "title": "string",                 // Activity title
  "description": "string",           // Activity description
  "reference": "string",             // Reference number (e.g., INV-2025-001)
  "amount": "number",                // Amount in SAR

  // Optional fields
  "status": "completed | pending | failed",  // Default: completed
  "metadata": "object"               // Additional metadata as JSON
}
```

### Activity Types Enum

```typescript
type ActivityType =
  | 'payment_received'     // دفعة مستلمة
  | 'payment_sent'         // دفعة مرسلة
  | 'invoice_created'      // فاتورة منشأة
  | 'invoice_sent'         // فاتورة مرسلة
  | 'invoice_paid'         // فاتورة مدفوعة
  | 'expense_created'      // مصروف منشأ
  | 'expense_approved'     // مصروف موافق عليه
  | 'transaction_created'  // معاملة منشأة
```

### Activity Response Schema

```typescript
{
  "_id": "string",
  "activityId": "string",            // Auto-generated: ACT-YYYY-XXXX
  "date": "string",                  // Activity date
  "time": "string",                  // Activity time
  "type": "string",
  "title": "string",
  "description": "string",
  "reference": "string",
  "amount": "number",
  "userId": "ObjectId",              // User who created/triggered activity
  "userName": "string",
  "status": "string",
  "metadata": "object | null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

---

## 7. Reports API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/accounts-aging` | Accounts aging report |
| GET | `/reports/revenue-by-client` | Revenue by client report |
| GET | `/reports/outstanding-invoices` | Outstanding invoices report |
| GET | `/reports/time-entries` | Time entries report |
| GET | `/reports/:reportType/export` | Export report (CSV/PDF) |

### Accounts Aging Report Response

```typescript
{
  "summary": {
    "totalOutstanding": "number",
    "zeroToThirtyDays": "number",
    "thirtyOneToSixtyDays": "number",
    "sixtyOneToNinetyDays": "number",
    "ninetyPlusDays": "number"
  },
  "clients": [
    {
      "clientId": "string",
      "clientName": "string",
      "zeroToThirtyDays": "number",
      "thirtyOneToSixtyDays": "number",
      "sixtyOneToNinetyDays": "number",
      "ninetyPlusDays": "number",
      "total": "number",
      "invoices": [
        {
          "invoiceNumber": "string",
          "amount": "number",
          "dueDate": "string",
          "daysOverdue": "number"
        }
      ]
    }
  ],
  "generatedAt": "string"
}
```

---

## 8. Payments API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | Get all payments |
| GET | `/payments/:id` | Get single payment |
| POST | `/payments` | Create payment |
| POST | `/payments/:id/complete` | Mark payment as complete |
| GET | `/payments/summary` | Get payments summary |

### Create Payment Request

```typescript
POST /payments

{
  // Required fields
  "clientId": "string",              // ObjectId reference to Client
  "amount": "number",                // Amount in SAR
  "paymentMethod": "string",         // cash | card | transfer | check

  // Optional fields
  "invoiceId": "string",             // ObjectId reference to Invoice
  "caseId": "string",                // ObjectId reference to Case
  "currency": "string",              // Default: "SAR"
  "transactionId": "string",         // External transaction reference
  "notes": "string"
}
```

---

## Supporting APIs

### Team Members

```typescript
GET /team-members

// Response
{
  "data": [
    {
      "_id": "string",
      "fullName": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  ]
}
```

### Clients

```typescript
GET /clients

// Response
{
  "data": [
    {
      "_id": "string",
      "fullName": "string",
      "name": "string",
      "email": "string",
      "phone": "string"
    }
  ]
}
```

### Cases

```typescript
GET /cases

// Response
{
  "data": [
    {
      "_id": "string",
      "caseNumber": "string",
      "title": "string",
      "clientId": {
        "_id": "string",
        "name": "string",
        "fullName": "string"
      }
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in the following format:

```typescript
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object | null"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | No permission for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Duplicate record |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Implementation Notes

1. **VAT Calculation**: Saudi Arabia VAT is 15%. Frontend calculates and sends, backend should validate.

2. **Duration Format**: Time entries use MINUTES (not hours). Convert as needed: `hours = duration / 60`

3. **Auto-generated IDs**:
   - Invoices: `INV-YYYY-XXXX`
   - Expenses: `EXP-YYYY-XXXX`
   - Time Entries: `TE-YYYY-XXXX`
   - Statements: `ST-YYYY-XXXX`
   - Activities: `ACT-YYYY-XXXX`

4. **Billable Logic**:
   - If `billStatus === 'non_billable'`, then `isBillable = false`
   - Otherwise `isBillable = true`

5. **Client Resolution**: Time entries can have `clientId` directly set OR derived from the case's client.

6. **Activity Logging**: Auto-create activity entries when:
   - Invoice created/sent/paid
   - Payment received
   - Expense created/approved

7. **Statement Generation**: Auto-populate statement items from:
   - Invoices within date range
   - Payments within date range
   - Expenses (if billable) within date range

---

## Mongoose Schema Updates Needed

### TimeEntry Schema Additions

```javascript
{
  // NEW FIELDS
  taskType: {
    type: String,
    enum: ['consultation', 'research', 'document_review', 'document_drafting',
           'court_appearance', 'meeting', 'phone_call', 'email_correspondence',
           'negotiation', 'contract_review', 'filing', 'travel', 'administrative', 'other'],
    required: true
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  billStatus: {
    type: String,
    enum: ['unbilled', 'billed', 'non_billable'],
    default: 'unbilled'
  }
}
```

### Expense Schema Additions

```javascript
{
  // NEW FIELDS
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null
  },
  expenseType: {
    type: String,
    enum: ['company', 'personal'],
    default: 'company'
  },
  isReimbursable: {
    type: Boolean,
    default: false
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  receiptNumber: {
    type: String,
    default: null
  }
}
```
