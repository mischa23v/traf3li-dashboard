# TRAF3LI Backend Finance & Billing API Specification

**Version:** 1.0.0
**Last Updated:** November 27, 2025
**Purpose:** Complete backend API specification for production-ready Finance & Billing system

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Data Models](#data-models)
4. [Invoice API](#invoice-api)
5. [Quote API](#quote-api)
6. [Payment API](#payment-api)
7. [Expense API](#expense-api)
8. [Time Tracking API](#time-tracking-api)
9. [Transaction API](#transaction-api)
10. [Statement API](#statement-api)
11. [Activity API](#activity-api)
12. [Billing Settings API](#billing-settings-api)
13. [Company Settings API](#company-settings-api)
14. [Tax API](#tax-api)
15. [Payment Modes API](#payment-modes-api)
16. [PDF Generation](#pdf-generation)
17. [Email Service](#email-service)

---

## Overview

This document provides the complete API specification for the TRAF3LI Finance & Billing module. The frontend is fully implemented and ready - the backend needs to implement these endpoints.

### Base URL
```
Production: https://api.traf3li.com/api
Development: http://localhost:5000/api
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "error": null
}
```

Error Response:
```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

---

## Authentication

All endpoints require authentication via HTTP-only cookies.

### Headers Required
```
Cookie: accessToken=<jwt_token>
Content-Type: application/json
```

### User Context
Every request should have access to:
- `req.user._id` - Current user ID
- `req.user.role` - User role (admin, lawyer, staff)
- `req.user.organizationId` - User's organization

---

## Data Models

### Invoice Model

```javascript
const InvoiceSchema = new Schema({
  // Numbering
  invoiceNumber: { type: String, required: true, unique: true },
  year: { type: Number, default: () => new Date().getFullYear() },

  // Relationships
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Items
  items: [{
    itemName: { type: String, required: true },
    itemNameAr: String,
    description: String,
    descriptionAr: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 }
  }],

  // Amounts
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  taxRate: { type: Number, default: 15 }, // VAT 15%
  taxTotal: { type: Number, required: true },
  total: { type: Number, required: true },
  credit: { type: Number, default: 0 }, // Store credit applied

  // Currency
  currency: { type: String, default: 'SAR' },

  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded', 'on_hold'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partially'],
    default: 'unpaid'
  },

  // Amounts Paid
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number },

  // Dates
  date: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  sentDate: Date,
  paidDate: Date,

  // Flags
  isOverdue: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },

  // Related
  quoteId: { type: Schema.Types.ObjectId, ref: 'Quote' }, // If converted from quote

  // Content
  notes: String,
  notesAr: String,
  terms: String,
  termsAr: String,

  // Files
  attachments: [String],
  pdfFile: String,

}, { timestamps: true });

// Auto-calculate isOverdue
InvoiceSchema.pre('save', function(next) {
  if (this.dueDate && this.paymentStatus !== 'paid') {
    this.isOverdue = new Date() > new Date(this.dueDate);
  }
  this.remainingAmount = this.total - this.paidAmount;
  next();
});
```

### Quote Model

```javascript
const QuoteSchema = new Schema({
  // Numbering
  quoteNumber: { type: String, required: true, unique: true },
  year: { type: Number, default: () => new Date().getFullYear() },

  // Relationships
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Items (same as Invoice)
  items: [{
    itemName: { type: String, required: true },
    itemNameAr: String,
    description: String,
    descriptionAr: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true }
  }],

  // Amounts
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 15 },
  taxTotal: { type: Number, required: true },
  total: { type: Number, required: true },

  // Currency
  currency: { type: String, default: 'SAR' },

  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'sent', 'accepted', 'declined', 'cancelled', 'on_hold', 'expired'],
    default: 'draft'
  },

  // Dates
  date: { type: Date, default: Date.now },
  expiredDate: { type: Date, required: true },
  sentDate: Date,

  // Conversion
  convertedToInvoice: { type: Boolean, default: false },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },

  // Flags
  isExpired: { type: Boolean, default: false },

  // Content
  notes: String,
  notesAr: String,

  // Files
  pdfFile: String,

}, { timestamps: true });

// Auto-check expiration
QuoteSchema.pre('save', function(next) {
  if (this.expiredDate && this.status !== 'accepted' && this.status !== 'declined') {
    this.isExpired = new Date() > new Date(this.expiredDate);
    if (this.isExpired && this.status === 'sent') {
      this.status = 'expired';
    }
  }
  next();
});
```

### Payment Model

```javascript
const PaymentSchema = new Schema({
  // Numbering
  paymentNumber: { type: String, required: true, unique: true },

  // Relationships
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Payment Details
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'SAR' },
  paymentModeId: { type: Schema.Types.ObjectId, ref: 'PaymentMode' },
  paymentMethod: String, // Fallback text if no mode

  // References
  transactionId: String, // External payment reference
  referenceNumber: String,
  checkNumber: String, // If paid by check

  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'completed'
  },

  // Dates
  paymentDate: { type: Date, default: Date.now },

  // Notes
  description: String,
  notes: String,

  // Files
  receiptFile: String,
  attachments: [String],

}, { timestamps: true });

// After payment, update invoice
PaymentSchema.post('save', async function() {
  const Invoice = mongoose.model('Invoice');
  const invoice = await Invoice.findById(this.invoiceId);
  if (invoice) {
    const payments = await mongoose.model('Payment').find({ invoiceId: this.invoiceId, status: 'completed' });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    invoice.paidAmount = totalPaid;
    invoice.remainingAmount = invoice.total - totalPaid;

    if (totalPaid >= invoice.total) {
      invoice.paymentStatus = 'paid';
      invoice.status = 'paid';
      invoice.paidDate = new Date();
    } else if (totalPaid > 0) {
      invoice.paymentStatus = 'partially';
      invoice.status = 'partially_paid';
    }

    await invoice.save();
  }
});
```

### Tax Model

```javascript
const TaxSchema = new Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  value: { type: Number, required: true, min: 0, max: 100 },
  isEnabled: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });
```

### PaymentMode Model

```javascript
const PaymentModeSchema = new Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: String,
  descriptionAr: String,
  ref: String, // Reference code
  icon: { type: String, default: 'credit-card' },
  isDefault: { type: Boolean, default: false },
  isEnabled: { type: Boolean, default: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });
```

### CompanySettings Model

```javascript
const CompanySettingsSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', unique: true },

  // Company Info
  name: String,
  nameAr: String,
  email: String,
  phone: String,
  mobile: String,
  fax: String,
  website: String,

  // Address
  address: String,
  addressAr: String,
  city: String,
  state: String,
  country: { type: String, default: 'SA' },
  postalCode: String,

  // Tax & Registration
  taxNumber: String,
  vatNumber: String,
  crNumber: String, // Commercial Registration

  // Bank Details
  bankName: String,
  bankNameAr: String,
  bankAccountNumber: String,
  iban: String,
  swiftCode: String,

  // Files
  logo: String,
  icon: String,

}, { timestamps: true });
```

### FinanceSettings Model

```javascript
const FinanceSettingsSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', unique: true },

  // Numbering
  invoicePrefix: { type: String, default: 'INV-' },
  quotePrefix: { type: String, default: 'QOT-' },
  paymentPrefix: { type: String, default: 'PAY-' },
  lastInvoiceNumber: { type: Number, default: 0 },
  lastQuoteNumber: { type: Number, default: 0 },
  lastPaymentNumber: { type: Number, default: 0 },
  includeYearInNumber: { type: Boolean, default: true },

  // Currency
  defaultCurrency: { type: String, default: 'SAR' },
  currencySymbolPosition: { type: String, enum: ['before', 'after'], default: 'before' },
  decimalSeparator: { type: String, default: '.' },
  thousandSeparator: { type: String, default: ',' },
  decimalPlaces: { type: Number, default: 2 },

  // Footer Text
  invoiceFooterText: String,
  invoiceFooterTextAr: String,
  quoteFooterText: String,
  quoteFooterTextAr: String,
  invoiceTerms: String,
  invoiceTermsAr: String,

  // Options
  showProductTax: { type: Boolean, default: true },

}, { timestamps: true });
```

---

## Invoice API

### GET /api/invoices
Get all invoices with filters and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| status | string | Filter by status |
| paymentStatus | string | Filter by payment status |
| clientId | string | Filter by client |
| caseId | string | Filter by case |
| startDate | string | Filter from date |
| endDate | string | Filter to date |
| search | string | Search invoice number, client name |
| sortBy | string | Sort field (default: createdAt) |
| sortOrder | string | asc or desc (default: desc) |

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

### GET /api/invoices/:id
Get single invoice with populated fields.

### POST /api/invoices
Create new invoice.

**Request Body:**
```json
{
  "clientId": "ObjectId",
  "caseId": "ObjectId (optional)",
  "items": [
    {
      "itemName": "Legal Consultation",
      "itemNameAr": "استشارة قانونية",
      "description": "1 hour consultation",
      "quantity": 1,
      "price": 500
    }
  ],
  "discount": 0,
  "discountType": "fixed",
  "taxRate": 15,
  "dueDate": "2025-12-31",
  "notes": "Thank you for your business",
  "currency": "SAR"
}
```

**Server Actions:**
1. Generate invoice number using settings (prefix + year + sequence)
2. Calculate totals (subTotal, taxTotal, total)
3. Set status to 'draft'
4. Update lastInvoiceNumber in FinanceSettings

### PATCH /api/invoices/:id
Update invoice (only if status is 'draft' or 'pending').

### DELETE /api/invoices/:id
Delete invoice (only if status is 'draft').

### POST /api/invoices/:id/send
Send invoice to client via email.

**Server Actions:**
1. Generate PDF if not exists
2. Send email with PDF attachment
3. Update status to 'sent'
4. Set sentDate

### GET /api/invoices/overdue
Get all overdue invoices.

### GET /api/invoices/summary
Get invoice summary statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "draft": 5,
    "pending": 10,
    "sent": 15,
    "paid": 15,
    "overdue": 5,
    "totalAmount": 250000,
    "paidAmount": 150000,
    "unpaidAmount": 100000,
    "overdueAmount": 25000
  }
}
```

### POST /api/invoices/:id/payments
Record payment for invoice.

**Request Body:**
```json
{
  "amount": 5000,
  "paymentModeId": "ObjectId",
  "paymentDate": "2025-11-27",
  "referenceNumber": "TRX123456",
  "notes": "Partial payment"
}
```

---

## Quote API

### GET /api/quotes
Get all quotes with filters.

### GET /api/quotes/:id
Get single quote.

### POST /api/quotes
Create new quote.

### PATCH /api/quotes/:id
Update quote.

### DELETE /api/quotes/:id
Delete quote.

### POST /api/quotes/:id/send
Send quote to client.

### POST /api/quotes/:id/accept
Mark quote as accepted.

### POST /api/quotes/:id/decline
Mark quote as declined.

### POST /api/quotes/:id/convert
Convert quote to invoice.

**Server Actions:**
1. Create new Invoice from quote data
2. Set quote.convertedToInvoice = true
3. Set quote.invoiceId = newInvoice._id
4. Return the new invoice

**Response:**
```json
{
  "success": true,
  "data": {
    "quote": { ... },
    "invoice": { ... }
  },
  "message": "Quote converted to invoice successfully"
}
```

### GET /api/quotes/summary
Get quote summary statistics.

---

## Payment API

### GET /api/payments
Get all payments with filters.

### GET /api/payments/:id
Get single payment.

### POST /api/payments
Create payment.

### PATCH /api/payments/:id
Update payment.

### DELETE /api/payments/:id
Delete/void payment.

### POST /api/payments/:id/complete
Mark payment as completed.

### POST /api/payments/:id/refund
Process refund.

### GET /api/payments/summary
Get payment summary statistics.

---

## Expense API

### GET /api/expenses
Get all expenses.

### GET /api/expenses/:id
Get single expense.

### POST /api/expenses
Create expense.

### PATCH /api/expenses/:id
Update expense.

### DELETE /api/expenses/:id
Delete expense.

### POST /api/expenses/:id/receipt
Upload receipt for expense.

**Request:** multipart/form-data with 'file' field

### GET /api/expenses/stats
Get expense statistics.

---

## Time Tracking API

### GET /api/time-entries
Get all time entries.

### GET /api/time-entries/:id
Get single time entry.

### POST /api/time-entries
Create manual time entry.

### PATCH /api/time-entries/:id
Update time entry.

### DELETE /api/time-entries/:id
Delete time entry.

### GET /api/timer/status
Get current timer status for user.

### POST /api/timer/start
Start timer.

**Request Body:**
```json
{
  "caseId": "ObjectId",
  "clientId": "ObjectId",
  "description": "Research case precedents",
  "activityCode": "research"
}
```

### POST /api/timer/pause
Pause running timer.

### POST /api/timer/resume
Resume paused timer.

### POST /api/timer/stop
Stop timer and create time entry.

### GET /api/time-entries/stats
Get time tracking statistics.

---

## Transaction API

### GET /api/transactions
Get all transactions.

### GET /api/transactions/:id
Get single transaction.

### POST /api/transactions
Create transaction.

### GET /api/transactions/balance
Get current account balance.

### GET /api/transactions/summary
Get transaction summary.

---

## Statement API

### GET /api/statements
Get all statements.

### GET /api/statements/:id
Get single statement.

### POST /api/statements
Generate new statement for client.

### POST /api/statements/:id/send
Send statement to client.

### DELETE /api/statements/:id
Delete statement.

---

## Activity API

### GET /api/activities
Get financial activities log.

### GET /api/activities/:id
Get single activity.

### POST /api/activities
Log manual activity.

---

## Billing Settings API

### Billing Rates

#### GET /api/billing/rates
Get all billing rates.

#### GET /api/billing/rates/:id
Get single rate.

#### POST /api/billing/rates
Create billing rate.

#### PATCH /api/billing/rates/:id
Update billing rate.

#### DELETE /api/billing/rates/:id
Delete billing rate.

### Rate Groups

#### GET /api/billing/groups
Get all rate groups.

#### POST /api/billing/groups
Create rate group.

#### PATCH /api/billing/groups/:id
Update rate group.

#### DELETE /api/billing/groups/:id
Delete rate group.

### Rate Cards

#### GET /api/billing/rate-cards
Get all rate cards.

#### POST /api/billing/rate-cards
Create rate card for client/case.

---

## Company Settings API

### GET /api/settings/company
Get company settings.

### PUT /api/settings/company
Update company settings.

### POST /api/settings/company/logo
Upload company logo.

**Request:** multipart/form-data with 'file' field

### DELETE /api/settings/company/logo
Delete company logo.

---

## Finance Settings API

### GET /api/settings/finance
Get finance settings.

### PUT /api/settings/finance
Update finance settings.

### POST /api/settings/finance/next-number
Get and increment next document number.

**Request Body:**
```json
{
  "type": "invoice" // or "quote" or "payment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "number": "INV-2025-0001"
  }
}
```

---

## Tax API

### GET /api/taxes
Get all taxes.

### GET /api/taxes/:id
Get single tax.

### POST /api/taxes
Create tax.

### PATCH /api/taxes/:id
Update tax.

### DELETE /api/taxes/:id
Delete tax (not if default).

### POST /api/taxes/:id/set-default
Set tax as default.

---

## Payment Modes API

### GET /api/payment-modes
Get all payment modes.

### GET /api/payment-modes/:id
Get single payment mode.

### POST /api/payment-modes
Create payment mode.

### PATCH /api/payment-modes/:id
Update payment mode.

### DELETE /api/payment-modes/:id
Delete payment mode (not if default).

### POST /api/payment-modes/:id/set-default
Set payment mode as default.

---

## PDF Generation

### Invoice PDF

**Endpoint:** GET /api/invoices/:id/pdf

**Requirements:**
1. Use company settings (logo, name, address, VAT number)
2. Bilingual support (Arabic/English)
3. Include:
   - Company header with logo
   - Invoice number and date
   - Client details
   - Items table (description, qty, price, total)
   - Subtotal, discount, tax, total
   - Payment terms
   - Bank details
   - Footer text
   - QR code (ZATCA compliance for Saudi)

**Recommended Libraries:**
- `puppeteer` for HTML to PDF
- `pdfkit` for programmatic PDF
- `@react-pdf/renderer` if using React components

### Quote PDF

**Endpoint:** GET /api/quotes/:id/pdf

Similar to invoice but with quote-specific content.

### Payment Receipt PDF

**Endpoint:** GET /api/payments/:id/pdf

---

## Email Service

### Invoice Email

**Endpoint:** POST /api/invoices/:id/send

**Requirements:**
1. Use email template
2. Attach PDF
3. Include:
   - Subject: "Invoice #{{invoiceNumber}} from {{companyName}}"
   - Body: Professional email with amount, due date, payment link
   - Arabic/English support

**Email Template Variables:**
```
{{clientName}}
{{clientNameAr}}
{{invoiceNumber}}
{{invoiceDate}}
{{dueDate}}
{{totalAmount}}
{{currency}}
{{companyName}}
{{companyNameAr}}
{{paymentLink}}
```

### Quote Email

Similar template for quotes with expiration date.

### Payment Receipt Email

Confirmation email after payment received.

---

## Implementation Checklist

### Phase 1: Core Models & CRUD
- [ ] Invoice Model + CRUD endpoints
- [ ] Quote Model + CRUD endpoints
- [ ] Payment Model + CRUD endpoints
- [ ] Expense Model + CRUD endpoints
- [ ] TimeEntry Model + CRUD endpoints
- [ ] Transaction Model + CRUD endpoints
- [ ] Statement Model + CRUD endpoints
- [ ] Activity Model + CRUD endpoints

### Phase 2: Settings
- [ ] Tax Model + CRUD
- [ ] PaymentMode Model + CRUD
- [ ] CompanySettings Model + CRUD
- [ ] FinanceSettings Model + CRUD

### Phase 3: Business Logic
- [ ] Invoice numbering (auto-increment)
- [ ] Quote to Invoice conversion
- [ ] Payment recording (updates invoice)
- [ ] Overdue detection (cron job)
- [ ] Timer functionality

### Phase 4: PDF & Email
- [ ] Invoice PDF generation
- [ ] Quote PDF generation
- [ ] Payment receipt PDF
- [ ] Email templates
- [ ] Email sending (Resend/SendGrid/SES)

### Phase 5: Reporting
- [ ] Invoice summary endpoint
- [ ] Quote summary endpoint
- [ ] Payment summary endpoint
- [ ] Time tracking stats
- [ ] Expense stats

---

## Security Considerations

1. **Authorization**: All endpoints must check user's organization
2. **Rate Limiting**: Implement rate limiting on API endpoints
3. **Input Validation**: Use Joi/Yup for request validation
4. **File Upload**: Validate file types and sizes
5. **PDF Security**: Prevent XSS in PDF generation
6. **Email**: Validate email addresses, prevent spam

---

## Testing Endpoints

Use these curl commands to test:

```bash
# Get invoices
curl -X GET "http://localhost:5000/api/invoices" \
  -H "Cookie: accessToken=YOUR_TOKEN"

# Create invoice
curl -X POST "http://localhost:5000/api/invoices" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "clientId": "CLIENT_ID",
    "items": [{"itemName": "Test", "quantity": 1, "price": 100}],
    "dueDate": "2025-12-31"
  }'

# Record payment
curl -X POST "http://localhost:5000/api/invoices/INVOICE_ID/payments" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{"amount": 100, "paymentDate": "2025-11-27"}'
```

---

## Frontend Integration Notes

The frontend is using:
- **TanStack Query** for data fetching and caching
- **Services** in `/src/services/` for API calls
- **Hooks** in `/src/hooks/` for query management

Frontend expects these response formats - ensure backend matches exactly.

---

**Document End**
