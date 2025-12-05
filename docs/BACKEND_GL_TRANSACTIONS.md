# Backend Instructions: General Ledger Transactions API

## Overview

The frontend Transactions page has been completely redesigned to be a **READ-ONLY view** of General Ledger (GL) entries. These entries are automatically created by the system when documents (invoices, payments, expenses, bills) are posted.

**Key Change**: Users can no longer manually create, edit, or delete transactions. The frontend now uses the GL Entries API (`/api/general-ledger/entries`) instead of the old Transactions API.

---

## API Endpoints Required

### Primary Endpoint: GET `/api/general-ledger/entries`

The frontend calls this endpoint to fetch GL entries with the following query parameters:

```typescript
interface GLEntryFilters {
  // Date filters
  startDate?: string       // ISO date: "2025-01-01"
  endDate?: string         // ISO date: "2025-01-31"

  // Filter by source document type
  referenceModel?: 'Invoice' | 'Payment' | 'Expense' | 'Bill' | 'JournalEntry'

  // Filter by related entities
  caseId?: string          // MongoDB ObjectId
  clientId?: string        // MongoDB ObjectId

  // Pagination
  page?: number            // Default: 1
  limit?: number           // Default: 25, options: 25, 50, 100, 200
}
```

**Expected Response:**

```typescript
{
  success: true,
  data: {
    entries: GLEntry[],
    total: number,
    page: number,
    totalPages: number
  }
}
```

### GLEntry Schema

```typescript
interface GLEntry {
  _id: string

  // Entry identification
  entryNumber: string           // Format: "GL-YYYY-NNNN" (e.g., "GL-2025-0001")

  // Dates
  transactionDate: string       // ISO date - when the transaction occurred
  postingDate?: string          // ISO date - when posted to GL (may differ for adjustments)

  // Description
  description: string           // Auto-generated from source document

  // Reference to source document
  referenceModel: 'Invoice' | 'Payment' | 'Expense' | 'Bill' | 'JournalEntry'
  referenceId: string           // ObjectId of the source document
  referenceNumber?: string      // Display number (INV-2025-001, PAY-2025-001, etc.)

  // Total amount (for display - sum of debits or credits)
  amount: number                // In halalas (SAR * 100)

  // Journal entry lines (double-entry accounting)
  lines: GLEntryLine[]

  // Status
  status: 'draft' | 'posted' | 'voided'

  // Related entities (populated)
  caseId?: {
    _id: string
    caseNumber: string
  }
  clientId?: {
    _id: string
    firstName: string
    lastName: string
  }
  vendorId?: {
    _id: string
    name: string
  }

  // Fiscal period
  fiscalPeriodId?: string
  fiscalYear?: number
  fiscalMonth?: number

  // Voiding information (if voided)
  voidedBy?: string             // User ID who voided
  voidedAt?: string             // ISO date
  voidReason?: string

  // Audit fields
  createdBy: string             // User ID
  createdAt: string             // ISO date
  updatedAt: string             // ISO date
}

interface GLEntryLine {
  accountId: string | Account   // Can be populated with Account object
  debit: number                 // Amount in halalas (0 if credit entry)
  credit: number                // Amount in halalas (0 if debit entry)
  description?: string          // Line-level description
}

interface Account {
  _id: string
  code: string                  // e.g., "1100" for Cash
  name: string                  // e.g., "النقدية" / "Cash"
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
}
```

---

## How GL Entries are Created

GL entries should be **automatically generated** by the backend when documents are posted. Here's the flow:

### 1. Invoice Posting

When an invoice is marked as `posted`:

```
Debit:  Accounts Receivable (1200)     SAR X,XXX
Credit: Revenue - Legal Services (4100) SAR X,XXX
Credit: VAT Payable (2300)              SAR XXX (if applicable)
```

### 2. Payment Receipt

When a payment is recorded:

```
Debit:  Cash/Bank (1100/1110)          SAR X,XXX
Credit: Accounts Receivable (1200)      SAR X,XXX
```

### 3. Expense Recording

When an expense is posted:

```
Debit:  Expense Category (5XXX)        SAR X,XXX
Debit:  VAT Receivable (1400)          SAR XXX (if applicable)
Credit: Cash/Bank/Accounts Payable     SAR X,XXX
```

### 4. Bill from Vendor

When a vendor bill is recorded:

```
Debit:  Expense/Asset Category         SAR X,XXX
Debit:  VAT Receivable (1400)          SAR XXX (if applicable)
Credit: Accounts Payable (2100)        SAR X,XXX
```

### 5. Manual Journal Entry (Accountant Only)

Direct GL entry by authorized accountant users.

---

## Backend Implementation Checklist

### 1. GL Entry Model

Create/update the MongoDB schema:

```javascript
const GLEntrySchema = new mongoose.Schema({
  firmId: { type: ObjectId, ref: 'Firm', required: true, index: true },
  entryNumber: { type: String, required: true, unique: true },
  transactionDate: { type: Date, required: true, index: true },
  postingDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  referenceModel: {
    type: String,
    enum: ['Invoice', 'Payment', 'Expense', 'Bill', 'JournalEntry'],
    required: true,
    index: true
  },
  referenceId: { type: ObjectId, refPath: 'referenceModel', required: true },
  referenceNumber: String,
  amount: { type: Number, required: true }, // In halalas
  lines: [{
    accountId: { type: ObjectId, ref: 'Account', required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    description: String
  }],
  status: {
    type: String,
    enum: ['draft', 'posted', 'voided'],
    default: 'posted',
    index: true
  },
  caseId: { type: ObjectId, ref: 'Case', index: true },
  clientId: { type: ObjectId, ref: 'Client', index: true },
  vendorId: { type: ObjectId, ref: 'Vendor', index: true },
  fiscalPeriodId: { type: ObjectId, ref: 'FiscalPeriod' },
  fiscalYear: Number,
  fiscalMonth: Number,
  voidedBy: { type: ObjectId, ref: 'User' },
  voidedAt: Date,
  voidReason: String,
  createdBy: { type: ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Indexes for common queries
GLEntrySchema.index({ firmId: 1, transactionDate: -1 });
GLEntrySchema.index({ firmId: 1, referenceModel: 1, transactionDate: -1 });
GLEntrySchema.index({ firmId: 1, status: 1, transactionDate: -1 });
```

### 2. Auto-Generation on Document Posting

Add post-save hooks or service methods to create GL entries:

```javascript
// In invoice.service.js
async postInvoice(invoiceId, userId) {
  const invoice = await Invoice.findById(invoiceId);

  // Update invoice status
  invoice.status = 'posted';
  await invoice.save();

  // Create GL entry
  await glEntryService.createFromInvoice(invoice, userId);
}

// In glEntry.service.js
async createFromInvoice(invoice, userId) {
  const entryNumber = await this.generateEntryNumber(invoice.firmId);

  const entry = new GLEntry({
    firmId: invoice.firmId,
    entryNumber,
    transactionDate: invoice.invoiceDate,
    description: `فاتورة رقم ${invoice.invoiceNumber} - ${invoice.client?.name}`,
    referenceModel: 'Invoice',
    referenceId: invoice._id,
    referenceNumber: invoice.invoiceNumber,
    amount: invoice.totalAmount,
    lines: [
      {
        accountId: ACCOUNTS.RECEIVABLES, // 1200
        debit: invoice.totalAmount,
        credit: 0,
        description: 'ذمم مدينة - عملاء'
      },
      {
        accountId: ACCOUNTS.REVENUE,     // 4100
        debit: 0,
        credit: invoice.subtotal,
        description: 'إيرادات الخدمات القانونية'
      },
      // Add VAT line if applicable
    ],
    caseId: invoice.caseId,
    clientId: invoice.clientId,
    status: 'posted',
    createdBy: userId
  });

  await entry.save();
  return entry;
}
```

### 3. Entry Number Generation

```javascript
async generateEntryNumber(firmId) {
  const year = new Date().getFullYear();
  const lastEntry = await GLEntry.findOne({
    firmId,
    entryNumber: new RegExp(`^GL-${year}-`)
  }).sort({ entryNumber: -1 });

  let sequence = 1;
  if (lastEntry) {
    const lastNum = parseInt(lastEntry.entryNumber.split('-')[2]);
    sequence = lastNum + 1;
  }

  return `GL-${year}-${String(sequence).padStart(4, '0')}`;
}
```

### 4. Query Endpoint Implementation

```javascript
// GET /api/general-ledger/entries
async getGLEntries(req, res) {
  const { firmId } = req.user;
  const {
    startDate,
    endDate,
    referenceModel,
    caseId,
    clientId,
    page = 1,
    limit = 25
  } = req.query;

  const query = { firmId };

  // Date filter
  if (startDate || endDate) {
    query.transactionDate = {};
    if (startDate) query.transactionDate.$gte = new Date(startDate);
    if (endDate) query.transactionDate.$lte = new Date(endDate);
  }

  // Reference type filter
  if (referenceModel) {
    query.referenceModel = referenceModel;
  }

  // Entity filters
  if (caseId) query.caseId = caseId;
  if (clientId) query.clientId = clientId;

  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    GLEntry.find(query)
      .populate('caseId', 'caseNumber')
      .populate('clientId', 'firstName lastName')
      .populate('lines.accountId', 'code name')
      .sort({ transactionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    GLEntry.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      entries,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    }
  });
}
```

---

## Voiding Entries (Accountant Permission)

When an entry needs to be voided (reversed):

1. Mark original entry as `voided`
2. Create a reversing entry with opposite debits/credits
3. Link them together

```javascript
async voidEntry(entryId, userId, reason) {
  const entry = await GLEntry.findById(entryId);

  // Mark original as voided
  entry.status = 'voided';
  entry.voidedBy = userId;
  entry.voidedAt = new Date();
  entry.voidReason = reason;
  await entry.save();

  // Create reversing entry
  const reversingEntry = new GLEntry({
    ...entry.toObject(),
    _id: undefined,
    entryNumber: await this.generateEntryNumber(entry.firmId),
    description: `إلغاء: ${entry.description}`,
    lines: entry.lines.map(line => ({
      ...line,
      debit: line.credit,
      credit: line.debit
    })),
    status: 'posted',
    createdBy: userId
  });

  await reversingEntry.save();
  return { voidedEntry: entry, reversingEntry };
}
```

---

## Currency Handling

**Important**: All amounts are stored in **halalas** (SAR * 100) to avoid floating-point issues.

- Frontend: Displays using `formatSAR(halalasToSAR(amount))`
- Backend: Store as integers (1 SAR = 100 halalas)

Example:
- SAR 1,500.50 = 150050 halalas stored in DB
- Frontend converts: `halalasToSAR(150050)` = 1500.50

---

## Permissions (RBAC)

| Role | View GL Entries | Void Entries | View Accounting Detail |
|------|----------------|--------------|----------------------|
| Owner | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes |
| Partner | Yes | No | Yes |
| Lawyer | Yes (own cases) | No | No |
| Paralegal | Yes (assigned cases) | No | No |
| Secretary | No | No | No |
| Accountant | Yes | Yes | Yes |

---

## Testing Checklist

1. [ ] Create invoice → Verify GL entry is created
2. [ ] Record payment → Verify GL entry is created
3. [ ] Post expense → Verify GL entry is created
4. [ ] Filter by date range → Returns correct entries
5. [ ] Filter by reference type → Returns correct entries
6. [ ] Filter by case → Returns correct entries
7. [ ] Filter by client → Returns correct entries
8. [ ] Pagination works correctly
9. [ ] Entry amounts are balanced (total debits = total credits)
10. [ ] Voiding creates reversing entry
11. [ ] Permissions are enforced

---

## Migration Notes

If migrating from the old transactions system:

1. Keep existing transaction records for historical data
2. Set up auto-generation for new documents going forward
3. Consider running a migration script to create GL entries for existing posted documents

```javascript
// Migration script example
async function migrateInvoicesToGL() {
  const postedInvoices = await Invoice.find({ status: 'posted' });

  for (const invoice of postedInvoices) {
    const existingEntry = await GLEntry.findOne({
      referenceModel: 'Invoice',
      referenceId: invoice._id
    });

    if (!existingEntry) {
      await glEntryService.createFromInvoice(invoice, 'SYSTEM_MIGRATION');
    }
  }
}
```

---

## Questions?

Contact the frontend team if you need clarification on:
- Expected response formats
- Filter parameter handling
- Error response formats
- WebSocket updates (if real-time needed)
