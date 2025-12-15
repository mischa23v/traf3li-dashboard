# Backend Implementation Guide: ERPNext Parity Fields

This document provides detailed backend implementation instructions for the new finance fields added to achieve ERPNext parity.

---

## Table of Contents

1. [Invoice Fields](#1-invoice-fields)
2. [Payment Fields](#2-payment-fields)
3. [Expense Fields](#3-expense-fields)
4. [Time Entry Fields](#4-time-entry-fields)
5. [Finance Setup Wizard](#5-finance-setup-wizard)
6. [Database Migrations](#6-database-migrations)
7. [API Endpoints Summary](#7-api-endpoints-summary)

---

## 1. Invoice Fields

### 1.1 Contact Person

**Schema Addition (MongoDB/Mongoose):**
```javascript
// models/Invoice.js
const invoiceSchema = new Schema({
  // ... existing fields ...

  // Contact Person (ERPNext: contact_person, contact_display, contact_email, contact_mobile)
  contactPersonName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
      message: 'Invalid email format'
    }
  },
  contactMobile: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => !v || /^\+?[0-9]{10,15}$/.test(v),
      message: 'Invalid mobile number'
    }
  },
});
```

**Validation Rules:**
- `contactEmail`: Valid email format (optional)
- `contactMobile`: Saudi format (+966 5X XXX XXXX) or international (optional)

---

### 1.2 Shipping Address

**Schema Addition:**
```javascript
// models/Invoice.js
const addressSchema = new Schema({
  line1: { type: String, maxlength: 500 },
  line2: { type: String, maxlength: 500 },
  city: { type: String, maxlength: 100 },
  postalCode: { type: String, maxlength: 20 },
  country: { type: String, default: 'SA', maxlength: 2 }
}, { _id: false });

const invoiceSchema = new Schema({
  // ... existing fields ...

  // Shipping Address (ERPNext: shipping_address_name, shipping_address)
  shippingAddress: {
    type: addressSchema,
    default: null
  },
});
```

**API Behavior:**
- Only included in payload when `useShippingAddress: true` on frontend
- City should be validated against Saudi cities list if country is SA

---

### 1.3 Sales Person & Commission

**Schema Addition:**
```javascript
// models/Invoice.js
const salesTeamSchema = new Schema({
  salesPersonId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commissionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  commissionAmount: {
    type: Number,
    min: 0,
    default: 0
  }
}, { _id: false });

const invoiceSchema = new Schema({
  // ... existing fields ...

  // Sales Team (ERPNext: sales_team child table)
  salesTeam: {
    type: [salesTeamSchema],
    default: []
  },
});
```

**Business Logic:**
```javascript
// services/invoiceService.js
async function calculateSalesCommission(invoice) {
  if (!invoice.salesTeam || invoice.salesTeam.length === 0) return;

  for (const member of invoice.salesTeam) {
    // Commission calculated on invoice total (after discount, before tax)
    member.commissionAmount = invoice.totalAmount * (member.commissionRate / 100);
  }

  return invoice;
}

// Hook: On invoice status change to 'paid'
async function onInvoicePaid(invoice) {
  // Create commission entries for sales team
  for (const member of invoice.salesTeam) {
    await CommissionEntry.create({
      salesPersonId: member.salesPersonId,
      invoiceId: invoice._id,
      amount: member.commissionAmount,
      status: 'pending',
      createdAt: new Date()
    });
  }
}
```

---

### 1.4 Advance Payments

**Schema Addition:**
```javascript
// models/Invoice.js
const advanceAllocationSchema = new Schema({
  advancePaymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  referenceNumber: {
    type: String,
    required: true
  },
  allocatedAmount: {
    type: Number,
    min: 0,
    required: true
  }
}, { _id: false });

const invoiceSchema = new Schema({
  // ... existing fields ...

  // Advance Payments (ERPNext: advances child table)
  advances: {
    type: [advanceAllocationSchema],
    default: []
  },
  totalAdvanceAllocated: {
    type: Number,
    min: 0,
    default: 0
  },
});
```

**API Endpoint - Get Available Advances:**
```javascript
// routes/payments.js
router.get('/advances/available/:clientId', async (req, res) => {
  const { clientId } = req.params;

  // Find advance payments not fully allocated
  const advances = await Payment.find({
    customerId: clientId,
    paymentType: { $in: ['advance', 'retainer'] },
    status: 'completed',
    $expr: { $gt: ['$amount', '$allocatedAmount'] }
  }).select('_id paymentNumber paymentDate amount allocatedAmount');

  const available = advances.map(adv => ({
    id: adv._id,
    referenceNumber: adv.paymentNumber,
    paymentDate: adv.paymentDate,
    amount: adv.amount,
    availableAmount: adv.amount - (adv.allocatedAmount || 0)
  }));

  res.json({ data: available });
});
```

**Business Logic - Apply Advances:**
```javascript
// services/invoiceService.js
async function applyAdvancePayments(invoice) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAllocated = 0;

    for (const advance of invoice.advances) {
      // Update the advance payment's allocated amount
      const payment = await Payment.findById(advance.advancePaymentId).session(session);

      if (!payment) {
        throw new Error(`Advance payment ${advance.advancePaymentId} not found`);
      }

      const newAllocated = (payment.allocatedAmount || 0) + advance.allocatedAmount;

      if (newAllocated > payment.amount) {
        throw new Error(`Cannot allocate more than available (${payment.amount - payment.allocatedAmount})`);
      }

      payment.allocatedAmount = newAllocated;
      await payment.save({ session });

      totalAllocated += advance.allocatedAmount;
    }

    invoice.totalAdvanceAllocated = totalAllocated;
    invoice.balanceDue = invoice.totalAmount - totalAllocated;

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

### 1.5 Credit Note / Return (ERPNext parity)

**Schema Addition:**
```javascript
// models/Invoice.js
const invoiceSchema = new Schema({
  // ... existing fields ...

  // Credit Note / Return (ERPNext: is_return, return_against, is_debit_note)
  isReturn: {
    type: Boolean,
    default: false,
    index: true
  },
  returnAgainst: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    // Reference to original invoice being returned/credited
    validate: {
      validator: async function(v) {
        if (!v) return true;
        const original = await mongoose.model('Invoice').findById(v);
        return !!original;
      },
      message: 'Original invoice not found'
    }
  },
  returnAgainstNumber: {
    type: String,
    // Stored for quick reference without population
  },
  isDebitNote: {
    type: Boolean,
    default: false
    // True when this is a rate adjustment (Debit Note) vs a full return (Credit Note)
  },
  returnReason: {
    type: String,
    maxlength: 1000,
    trim: true
  },
});

// Indexes for credit note queries
invoiceSchema.index({ isReturn: 1, returnAgainst: 1 });
```

**Business Logic:**
```javascript
// services/invoiceService.js

/**
 * Create a credit note against an existing invoice
 */
async function createCreditNote(originalInvoiceId, creditNoteData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get original invoice
    const originalInvoice = await Invoice.findById(originalInvoiceId).session(session);
    if (!originalInvoice) {
      throw new Error('Original invoice not found');
    }

    // 2. Validate credit note amount doesn't exceed original
    const existingCredits = await Invoice.aggregate([
      { $match: { returnAgainst: originalInvoice._id, isReturn: true } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).session(session);

    const totalCredited = existingCredits[0]?.total || 0;
    const remainingCreditable = originalInvoice.totalAmount - totalCredited;

    if (creditNoteData.totalAmount > remainingCreditable) {
      throw new Error(`Credit amount exceeds remaining creditable amount (${remainingCreditable})`);
    }

    // 3. Create credit note with negative amounts
    const creditNote = await Invoice.create([{
      ...creditNoteData,
      isReturn: true,
      returnAgainst: originalInvoice._id,
      returnAgainstNumber: originalInvoice.invoiceNumber,
      invoiceNumber: await generateCreditNoteNumber(), // CN-YYYYMM-XXXX
      // Amounts stored as negative for accounting
      totalAmount: -Math.abs(creditNoteData.totalAmount),
      vatAmount: -Math.abs(creditNoteData.vatAmount || 0),
      items: creditNoteData.items.map(item => ({
        ...item,
        lineTotal: -Math.abs(item.lineTotal),
        quantity: -Math.abs(item.quantity)
      }))
    }], { session });

    // 4. Update original invoice outstanding amount
    originalInvoice.outstandingAmount = (originalInvoice.outstandingAmount || originalInvoice.totalAmount)
      - Math.abs(creditNoteData.totalAmount);
    await originalInvoice.save({ session });

    // 5. Create journal entry for credit note
    await createCreditNoteJournalEntry(creditNote[0], originalInvoice, session);

    await session.commitTransaction();
    return creditNote[0];

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Create journal entry for credit note
 */
async function createCreditNoteJournalEntry(creditNote, originalInvoice, session) {
  const settings = await FinanceSettings.findOne();

  const entries = [
    // Debit: Income account (reverse the original income)
    {
      accountCode: settings.defaultIncomeAccount,
      debit: Math.abs(creditNote.totalAmount - creditNote.vatAmount),
      credit: 0,
      description: `Credit Note ${creditNote.invoiceNumber} against ${originalInvoice.invoiceNumber}`
    },
    // Debit: VAT (if applicable)
    ...(creditNote.vatAmount ? [{
      accountCode: settings.vatPayableAccount,
      debit: Math.abs(creditNote.vatAmount),
      credit: 0,
      description: `VAT reversal for ${creditNote.invoiceNumber}`
    }] : []),
    // Credit: Receivables (reduce customer balance)
    {
      accountCode: settings.defaultReceivablesAccount,
      debit: 0,
      credit: Math.abs(creditNote.totalAmount),
      description: `Credit Note ${creditNote.invoiceNumber}`
    }
  ];

  return JournalEntry.create([{
    entryNumber: await generateJournalNumber(),
    date: creditNote.issueDate,
    reference: creditNote.invoiceNumber,
    referenceType: 'CreditNote',
    referenceId: creditNote._id,
    entries,
    status: 'posted'
  }], { session });
}

/**
 * Generate credit note number
 */
async function generateCreditNoteNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const lastCN = await Invoice.findOne({
    isReturn: true,
    invoiceNumber: { $regex: `^CN-${year}${month}` }
  }).sort({ invoiceNumber: -1 });

  const lastNum = lastCN
    ? parseInt(lastCN.invoiceNumber.split('-')[2]) || 0
    : 0;

  return `CN-${year}${month}-${String(lastNum + 1).padStart(4, '0')}`;
}
```

**API Endpoints:**
```javascript
// routes/invoices.js

// Create credit note
router.post('/credit-note', authenticateToken, async (req, res) => {
  const { originalInvoiceId, ...creditNoteData } = req.body;

  if (!originalInvoiceId) {
    return res.status(400).json({ error: 'Original invoice ID is required' });
  }

  const creditNote = await createCreditNote(originalInvoiceId, creditNoteData);
  res.status(201).json({ data: creditNote });
});

// Get credit notes for an invoice
router.get('/:id/credit-notes', authenticateToken, async (req, res) => {
  const creditNotes = await Invoice.find({
    returnAgainst: req.params.id,
    isReturn: true
  }).sort({ createdAt: -1 });

  res.json({ data: creditNotes });
});

// Get all credit notes
router.get('/credit-notes', authenticateToken, async (req, res) => {
  const { page = 1, limit = 20, clientId } = req.query;

  const query = { isReturn: true };
  if (clientId) query.clientId = clientId;

  const creditNotes = await Invoice.find(query)
    .populate('returnAgainst', 'invoiceNumber totalAmount')
    .populate('clientId', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Invoice.countDocuments(query);

  res.json({
    data: creditNotes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});
```

**ZATCA Compliance (Saudi Arabia):**
```javascript
// For ZATCA Phase 2 compliance, credit notes must:
// 1. Reference the original invoice number
// 2. Include reason for credit
// 3. Have proper invoice type code (381 for Credit Note, 383 for Debit Note)

function getZatcaInvoiceTypeCode(invoice) {
  if (invoice.isReturn) {
    return invoice.isDebitNote ? '383' : '381';
  }
  return '388'; // Standard tax invoice
}
```

---

## 2. Payment Fields

### 2.1 GL Accounts (Paid From/To)

**Schema Addition:**
```javascript
// models/Payment.js
const paymentSchema = new Schema({
  // ... existing fields ...

  // GL Accounts (ERPNext: paid_from, paid_to)
  paidFromAccount: {
    type: String,
    trim: true,
    // Reference to Chart of Accounts
    validate: {
      validator: async function(v) {
        if (!v) return true;
        const account = await Account.findOne({ accountCode: v });
        return !!account;
      },
      message: 'Invalid account code'
    }
  },
  paidToAccount: {
    type: String,
    trim: true
  },

  // Party Type (ERPNext: party_type)
  partyType: {
    type: String,
    enum: ['customer', 'supplier', 'employee'],
    default: 'customer'
  },
});
```

**Auto-Assignment Logic:**
```javascript
// services/paymentService.js
async function assignDefaultAccounts(payment) {
  const settings = await FinanceSettings.findOne();

  switch (payment.paymentType) {
    case 'customer_payment':
      payment.paidFromAccount = payment.paidFromAccount || settings.defaultReceivablesAccount;
      payment.paidToAccount = payment.paidToAccount || settings.defaultBankAccount;
      break;
    case 'vendor_payment':
      payment.paidFromAccount = payment.paidFromAccount || settings.defaultBankAccount;
      payment.paidToAccount = payment.paidToAccount || settings.defaultPayablesAccount;
      break;
    case 'advance':
    case 'retainer':
      payment.paidToAccount = payment.paidToAccount || settings.defaultAdvancesAccount;
      break;
  }

  return payment;
}
```

---

### 2.2 Deductions Table (Tax Withholding)

**Schema Addition:**
```javascript
// models/Payment.js
const deductionSchema = new Schema({
  accountId: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    maxlength: 500
  }
}, { _id: false });

const paymentSchema = new Schema({
  // ... existing fields ...

  // Deductions (ERPNext: deductions child table)
  deductions: {
    type: [deductionSchema],
    default: []
  },
  totalDeductions: {
    type: Number,
    min: 0,
    default: 0
  },
  netAmountAfterDeductions: {
    type: Number,
    min: 0
  },
});
```

**Common Deduction Accounts (Saudi Arabia):**
```javascript
// config/deductionAccounts.js
const DEDUCTION_ACCOUNTS = [
  { code: '2210', name: 'ضريبة الاستقطاع المستحقة', nameEn: 'Withholding Tax Payable', rate: 5 },
  { code: '2220', name: 'ضريبة القيمة المضافة', nameEn: 'VAT Payable', rate: 15 },
  { code: '2230', name: 'التأمينات الاجتماعية', nameEn: 'GOSI Payable', rate: 9.75 },
  { code: '2240', name: 'رسوم إدارية', nameEn: 'Administrative Fees', rate: null },
];

module.exports = DEDUCTION_ACCOUNTS;
```

**Journal Entry Generation:**
```javascript
// services/paymentService.js
async function createPaymentJournalEntry(payment) {
  const entries = [];

  // Main payment entry
  entries.push({
    accountCode: payment.paidFromAccount,
    debit: payment.amount,
    credit: 0,
    description: `Payment ${payment.paymentNumber}`
  });

  // Net amount to receiving account
  entries.push({
    accountCode: payment.paidToAccount,
    debit: 0,
    credit: payment.netAmountAfterDeductions,
    description: `Payment ${payment.paymentNumber}`
  });

  // Deductions entries
  for (const deduction of payment.deductions) {
    entries.push({
      accountCode: deduction.accountId,
      debit: 0,
      credit: deduction.amount,
      description: deduction.description || `Deduction - ${payment.paymentNumber}`
    });
  }

  // Create journal entry
  const journalEntry = await JournalEntry.create({
    entryNumber: await generateJournalNumber(),
    date: payment.paymentDate,
    reference: payment.paymentNumber,
    referenceType: 'Payment',
    referenceId: payment._id,
    entries,
    status: 'posted'
  });

  return journalEntry;
}
```

---

## 3. Expense Fields

### 3.1 Approval Workflow

**Schema Addition:**
```javascript
// models/Expense.js
const expenseSchema = new Schema({
  // ... existing fields ...

  // Approval Workflow (ERPNext: expense_approver, approval_status)
  expenseApproverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  approvalDate: {
    type: Date
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Sanctioned Amount (ERPNext: sanctioned_amount)
  sanctionedAmount: {
    type: Number,
    min: 0
  },

  // Rejection
  rejectionReason: {
    type: String,
    maxlength: 1000
  },
});
```

**Approval API Endpoints:**
```javascript
// routes/expenses.js

// Get expenses pending approval
router.get('/pending-approval', authenticateToken, async (req, res) => {
  const userId = req.user._id;

  const expenses = await Expense.find({
    expenseApproverId: userId,
    approvalStatus: 'pending'
  })
  .populate('employeeId', 'firstName lastName email')
  .sort({ createdAt: -1 });

  res.json({ data: expenses });
});

// Approve expense
router.post('/:id/approve', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { sanctionedAmount } = req.body;

  const expense = await Expense.findById(id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  if (expense.expenseApproverId?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to approve this expense' });
  }

  expense.approvalStatus = 'approved';
  expense.approvalDate = new Date();
  expense.approvedBy = req.user._id;
  expense.sanctionedAmount = sanctionedAmount || expense.amount;

  await expense.save();

  // Trigger notification to employee
  await notificationService.send({
    userId: expense.employeeId,
    type: 'expense_approved',
    title: 'تم اعتماد المصروف',
    message: `تم اعتماد مصروفك بمبلغ ${expense.sanctionedAmount} ر.س`
  });

  res.json({ data: expense });
});

// Reject expense
router.post('/:id/reject', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  const expense = await Expense.findById(id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  expense.approvalStatus = 'rejected';
  expense.approvalDate = new Date();
  expense.approvedBy = req.user._id;
  expense.rejectionReason = rejectionReason;

  await expense.save();

  // Trigger notification
  await notificationService.send({
    userId: expense.employeeId,
    type: 'expense_rejected',
    title: 'تم رفض المصروف',
    message: `تم رفض مصروفك. السبب: ${rejectionReason}`
  });

  res.json({ data: expense });
});
```

---

### 3.2 Payable Account & Journal Entry

**Schema Addition:**
```javascript
// models/Expense.js
const expenseSchema = new Schema({
  // ... existing fields ...

  // Accounting (ERPNext: payable_account)
  payableAccount: {
    type: String,
    trim: true
  },
  journalEntryRef: {
    type: String,
    trim: true
  },
  journalEntryId: {
    type: Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },

  // Payment Status
  isPaid: {
    type: Boolean,
    default: false
  },
  modeOfPayment: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check', 'payroll']
  },
  clearanceDate: {
    type: Date
  },
  paymentReference: {
    type: String
  },
});
```

**Journal Entry Creation on Approval:**
```javascript
// services/expenseService.js
async function createExpenseJournalEntry(expense) {
  // Only create JE for approved expenses
  if (expense.approvalStatus !== 'approved') return null;

  const settings = await FinanceSettings.findOne();
  const expenseAccount = getExpenseAccountByCategory(expense.category);

  const entries = [
    // Debit: Expense account
    {
      accountCode: expenseAccount,
      debit: expense.sanctionedAmount || expense.amount,
      credit: 0,
      description: expense.description
    },
    // Credit: Payable account (or employee payable for reimbursable)
    {
      accountCode: expense.payableAccount ||
        (expense.expenseType === 'reimbursable'
          ? settings.employeePayablesAccount
          : settings.defaultPayablesAccount),
      debit: 0,
      credit: expense.sanctionedAmount || expense.amount,
      description: `Expense: ${expense.description}`
    }
  ];

  // Add VAT entry if applicable
  if (expense.taxAmount && expense.taxReclaimable) {
    entries.push({
      accountCode: settings.vatReceivableAccount,
      debit: expense.taxAmount,
      credit: 0,
      description: `VAT on ${expense.description}`
    });
    // Adjust the payable
    entries[1].credit += expense.taxAmount;
  }

  const journalEntry = await JournalEntry.create({
    entryNumber: await generateJournalNumber(),
    date: expense.date,
    reference: `EXP-${expense._id}`,
    referenceType: 'Expense',
    referenceId: expense._id,
    entries,
    status: 'posted'
  });

  // Update expense with JE reference
  expense.journalEntryRef = journalEntry.entryNumber;
  expense.journalEntryId = journalEntry._id;
  await expense.save();

  return journalEntry;
}

function getExpenseAccountByCategory(category) {
  const mapping = {
    'office_supplies': '5100',
    'software': '5110',
    'travel': '5200',
    'accommodation': '5210',
    'meals': '5220',
    'court_fees': '5300',
    'government_fees': '5310',
    'legal_fees': '5320',
    'professional_services': '5400',
    'rent': '5500',
    'utilities': '5510',
    // ... add more mappings
    'other': '5900'
  };
  return mapping[category] || '5900';
}
```

---

### 3.3 Employee Advance Allocation (ERPNext parity)

**Schema Addition:**
```javascript
// models/Expense.js
const advanceAllocationSchema = new Schema({
  advanceId: {
    type: Schema.Types.ObjectId,
    ref: 'EmployeeAdvance',
    required: true
  },
  advanceRef: {
    type: String,
    required: true
  },
  advanceDate: {
    type: Date
  },
  totalAmount: {
    type: Number,
    min: 0
  },
  unclaimedAmount: {
    type: Number,
    min: 0
  },
  allocatedAmount: {
    type: Number,
    min: 0,
    required: true
  },
  returnAmount: {
    type: Number,
    min: 0,
    default: 0
    // Amount to be returned to company (if advance > expenses)
  }
}, { _id: false });

const expenseSchema = new Schema({
  // ... existing fields ...

  // Employee Advance Allocation (ERPNext: advances child table)
  advances: {
    type: [advanceAllocationSchema],
    default: []
  },
  totalAdvanceAllocated: {
    type: Number,
    min: 0,
    default: 0
  },
  totalReturnAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  netClaimAmount: {
    type: Number,
    // Calculated: totalAmount - totalAdvanceAllocated
  },
});
```

**Employee Advance Schema:**
```javascript
// models/EmployeeAdvance.js
const employeeAdvanceSchema = new Schema({
  advanceNumber: {
    type: String,
    required: true,
    unique: true
    // Format: ADV-YYYY-XXXX
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  advanceDate: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    maxlength: 500
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  allocatedAmount: {
    type: Number,
    default: 0,
    min: 0
    // Total allocated to expense claims
  },
  returnedAmount: {
    type: Number,
    default: 0,
    min: 0
    // Amount returned by employee
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'paid', 'claimed', 'returned', 'cancelled'],
    default: 'draft',
    index: true
  },
  // Payment details
  paidDate: Date,
  paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
  paymentMethod: String,
  paymentReference: String,
  // Approval
  approverId: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedDate: Date,
}, { timestamps: true });

// Virtual for unclaimed amount
employeeAdvanceSchema.virtual('unclaimedAmount').get(function() {
  return this.amount - this.allocatedAmount - this.returnedAmount;
});
```

**API Endpoints:**
```javascript
// routes/employeeAdvances.js

// Get available advances for an employee
router.get('/available/:employeeId', authenticateToken, async (req, res) => {
  const { employeeId } = req.params;

  const advances = await EmployeeAdvance.find({
    employeeId,
    status: 'paid',
    $expr: {
      $gt: [
        '$amount',
        { $add: ['$allocatedAmount', '$returnedAmount'] }
      ]
    }
  }).sort({ advanceDate: -1 });

  const available = advances.map(adv => ({
    id: adv._id,
    advanceId: adv._id,
    advanceRef: adv.advanceNumber,
    advanceDate: adv.advanceDate,
    totalAmount: adv.amount,
    unclaimedAmount: adv.amount - adv.allocatedAmount - adv.returnedAmount,
    allocatedAmount: 0,
    returnAmount: 0
  }));

  res.json({ data: available });
});

// Create employee advance
router.post('/', authenticateToken, async (req, res) => {
  const advanceNumber = await generateAdvanceNumber();

  const advance = await EmployeeAdvance.create({
    ...req.body,
    advanceNumber,
    status: 'pending_approval'
  });

  res.status(201).json({ data: advance });
});

// Approve advance
router.post('/:id/approve', authenticateToken, async (req, res) => {
  const advance = await EmployeeAdvance.findByIdAndUpdate(
    req.params.id,
    {
      status: 'approved',
      approverId: req.user._id,
      approvedDate: new Date()
    },
    { new: true }
  );

  res.json({ data: advance });
});

// Mark advance as paid
router.post('/:id/pay', authenticateToken, async (req, res) => {
  const { paymentMethod, paymentReference } = req.body;

  const advance = await EmployeeAdvance.findByIdAndUpdate(
    req.params.id,
    {
      status: 'paid',
      paidDate: new Date(),
      paidBy: req.user._id,
      paymentMethod,
      paymentReference
    },
    { new: true }
  );

  res.json({ data: advance });
});
```

**Business Logic - Apply Advances to Expense:**
```javascript
// services/expenseService.js

async function applyAdvancesToExpense(expense) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAllocated = 0;
    let totalReturn = 0;

    for (const allocation of expense.advances) {
      // Get the advance
      const advance = await EmployeeAdvance.findById(allocation.advanceId).session(session);

      if (!advance) {
        throw new Error(`Advance ${allocation.advanceRef} not found`);
      }

      // Check available amount
      const available = advance.amount - advance.allocatedAmount - advance.returnedAmount;
      if (allocation.allocatedAmount > available) {
        throw new Error(`Cannot allocate ${allocation.allocatedAmount} from ${allocation.advanceRef}. Only ${available} available.`);
      }

      // Update advance allocated amount
      advance.allocatedAmount += allocation.allocatedAmount;

      // Handle return amount
      if (allocation.returnAmount > 0) {
        advance.returnedAmount += allocation.returnAmount;
      }

      // Update status if fully utilized
      if (advance.unclaimedAmount <= 0) {
        advance.status = 'claimed';
      }

      await advance.save({ session });

      totalAllocated += allocation.allocatedAmount;
      totalReturn += allocation.returnAmount;
    }

    // Update expense totals
    expense.totalAdvanceAllocated = totalAllocated;
    expense.totalReturnAmount = totalReturn;
    expense.netClaimAmount = (expense.amount + (expense.taxAmount || 0)) - totalAllocated;

    await expense.save({ session });

    await session.commitTransaction();
    return expense;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Create journal entry for advance allocation
 */
async function createAdvanceAllocationJournalEntry(expense) {
  if (!expense.advances || expense.advances.length === 0) return null;

  const settings = await FinanceSettings.findOne();

  const entries = [];

  // For each advance allocation
  for (const allocation of expense.advances) {
    if (allocation.allocatedAmount > 0) {
      // Debit: Expense account
      entries.push({
        accountCode: getExpenseAccountByCategory(expense.category),
        debit: allocation.allocatedAmount,
        credit: 0,
        description: `Expense from advance ${allocation.advanceRef}`
      });

      // Credit: Employee Advance account
      entries.push({
        accountCode: settings.employeeAdvanceAccount, // e.g., '1350'
        debit: 0,
        credit: allocation.allocatedAmount,
        description: `Clear advance ${allocation.advanceRef}`
      });
    }

    // Handle return amount
    if (allocation.returnAmount > 0) {
      // Debit: Cash/Bank (employee returns cash)
      entries.push({
        accountCode: settings.defaultCashAccount,
        debit: allocation.returnAmount,
        credit: 0,
        description: `Return from advance ${allocation.advanceRef}`
      });

      // Credit: Employee Advance account
      entries.push({
        accountCode: settings.employeeAdvanceAccount,
        debit: 0,
        credit: allocation.returnAmount,
        description: `Clear advance return ${allocation.advanceRef}`
      });
    }
  }

  if (entries.length === 0) return null;

  return JournalEntry.create({
    entryNumber: await generateJournalNumber(),
    date: expense.date,
    reference: `EXP-${expense._id}`,
    referenceType: 'ExpenseAdvanceAllocation',
    referenceId: expense._id,
    entries,
    status: 'posted'
  });
}
```

---

## 4. Time Entry Fields

### 4.1 Billing Hours Override

**Schema Addition:**
```javascript
// models/TimeEntry.js
const timeEntrySchema = new Schema({
  // ... existing fields ...

  // Actual Time
  actualHours: {
    type: Number,
    min: 0,
    required: true
  },
  actualMinutes: {
    type: Number,
    min: 0,
    max: 59,
    default: 0
  },

  // Billing Hours (ERPNext: billing_hours - may differ from actual)
  billingHours: {
    type: Number,
    min: 0
  },
  billingMinutes: {
    type: Number,
    min: 0,
    max: 59,
    default: 0
  },
  isBillableOverride: {
    type: Boolean,
    default: false
  },

  // Billing Amount
  billingRate: {
    type: Number,
    min: 0,
    required: true
  },
  billingAmount: {
    type: Number,
    min: 0
  },
});
```

**Calculation Logic:**
```javascript
// services/timeEntryService.js
function calculateBillingAmount(entry) {
  // Use billing hours if override is enabled, otherwise use actual
  const billableMinutes = entry.isBillableOverride
    ? (entry.billingHours * 60 + entry.billingMinutes)
    : (entry.actualHours * 60 + entry.actualMinutes);

  const billableHours = billableMinutes / 60;

  entry.billingAmount = Math.round(billableHours * entry.billingRate);

  return entry;
}
```

---

### 4.2 Costing Rate & Amount

**Schema Addition:**
```javascript
// models/TimeEntry.js
const timeEntrySchema = new Schema({
  // ... existing fields ...

  // Costing (ERPNext: costing_rate, costing_amount)
  costingRate: {
    type: Number,
    min: 0,
    default: 0
  },
  costingAmount: {
    type: Number,
    min: 0,
    default: 0
  },
});
```

**Business Logic:**
```javascript
// services/timeEntryService.js
async function calculateCostingAmount(entry) {
  // Get costing rate from employee profile if not provided
  if (!entry.costingRate && entry.attorneyId) {
    const employee = await User.findById(entry.attorneyId);
    entry.costingRate = employee?.costingRate || 0;
  }

  const actualMinutes = entry.actualHours * 60 + entry.actualMinutes;
  const actualHours = actualMinutes / 60;

  entry.costingAmount = Math.round(actualHours * entry.costingRate);

  return entry;
}

// Calculate profitability margin
function calculateMargin(entry) {
  if (!entry.billingAmount || !entry.costingAmount) return null;

  const margin = entry.billingAmount - entry.costingAmount;
  const marginPercentage = (margin / entry.billingAmount) * 100;

  return {
    margin,
    marginPercentage: Math.round(marginPercentage * 100) / 100
  };
}
```

---

### 4.3 Expected Hours

**Schema Addition:**
```javascript
// models/TimeEntry.js
const timeEntrySchema = new Schema({
  // ... existing fields ...

  // Expected Hours (ERPNext: expected_hours)
  expectedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  expectedMinutes: {
    type: Number,
    min: 0,
    max: 59,
    default: 0
  },
});
```

**Progress Calculation:**
```javascript
// services/timeEntryService.js
function calculateProgress(entry) {
  const expectedMinutes = entry.expectedHours * 60 + entry.expectedMinutes;
  const actualMinutes = entry.actualHours * 60 + entry.actualMinutes;

  if (expectedMinutes === 0) return null;

  const progressPercentage = (actualMinutes / expectedMinutes) * 100;
  const isOverBudget = actualMinutes > expectedMinutes;
  const variance = actualMinutes - expectedMinutes;

  return {
    progressPercentage: Math.round(progressPercentage),
    isOverBudget,
    varianceMinutes: variance,
    varianceHours: Math.round(variance / 60 * 10) / 10
  };
}
```

---

### 4.4 Sales Invoice Reference (ERPNext parity)

**Schema Addition:**
```javascript
// models/TimeEntry.js
const timeEntrySchema = new Schema({
  // ... existing fields ...

  // Sales Invoice Reference (ERPNext: sales_invoice)
  salesInvoiceRef: {
    type: String,
    trim: true,
    index: true
    // Stores invoice number for quick reference
  },
  salesInvoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  isBilled: {
    type: Boolean,
    default: false,
    index: true
  },
  billedDate: {
    type: Date
  },
  billedAmount: {
    type: Number,
    min: 0
    // Amount included in invoice (may differ from billingAmount due to discounts)
  },
});

// Compound index for billing queries
timeEntrySchema.index({ isBilled: 1, caseId: 1, date: -1 });
```

**Business Logic:**
```javascript
// services/timeEntryService.js

/**
 * Get unbilled time entries for invoicing
 */
async function getUnbilledTimeEntries(caseId, clientId) {
  const query = {
    isBilled: false,
    isBillable: true,
    billStatus: { $ne: 'written_off' }
  };

  if (caseId) query.caseId = caseId;
  if (clientId) query.clientId = clientId;

  const entries = await TimeEntry.find(query)
    .populate('attorneyId', 'firstName lastName hourlyRate')
    .sort({ date: -1 });

  return entries;
}

/**
 * Mark time entries as billed when invoice is created
 */
async function markTimeEntriesAsBilled(timeEntryIds, invoiceId, invoiceNumber, session) {
  const updateResult = await TimeEntry.updateMany(
    { _id: { $in: timeEntryIds } },
    {
      $set: {
        isBilled: true,
        salesInvoiceId: invoiceId,
        salesInvoiceRef: invoiceNumber,
        billedDate: new Date(),
        billStatus: 'billed'
      }
    },
    { session }
  );

  return updateResult;
}

/**
 * Reverse billing when invoice is cancelled/voided
 */
async function unmarkTimeEntriesBilled(invoiceId, session) {
  await TimeEntry.updateMany(
    { salesInvoiceId: invoiceId },
    {
      $set: {
        isBilled: false,
        billStatus: 'unbilled'
      },
      $unset: {
        salesInvoiceId: '',
        salesInvoiceRef: '',
        billedDate: '',
        billedAmount: ''
      }
    },
    { session }
  );
}
```

**API Endpoints:**
```javascript
// routes/timeEntries.js

// Get unbilled entries for invoice creation
router.get('/unbilled', authenticateToken, async (req, res) => {
  const { caseId, clientId } = req.query;

  const entries = await getUnbilledTimeEntries(caseId, clientId);

  // Group by case for easier selection
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.caseId?.toString() || 'no-case';
    if (!acc[key]) {
      acc[key] = {
        caseId: entry.caseId,
        caseName: entry.caseName,
        entries: [],
        totalAmount: 0,
        totalHours: 0
      };
    }
    acc[key].entries.push(entry);
    acc[key].totalAmount += entry.billingAmount || 0;
    acc[key].totalHours += (entry.actualHours || 0) + (entry.actualMinutes || 0) / 60;
    return acc;
  }, {});

  res.json({ data: Object.values(grouped) });
});

// Get billing history for a time entry
router.get('/:id/billing-history', authenticateToken, async (req, res) => {
  const entry = await TimeEntry.findById(req.params.id)
    .populate('salesInvoiceId', 'invoiceNumber issueDate status totalAmount');

  if (!entry) {
    return res.status(404).json({ error: 'Time entry not found' });
  }

  res.json({
    data: {
      isBilled: entry.isBilled,
      billedDate: entry.billedDate,
      salesInvoiceRef: entry.salesInvoiceRef,
      invoice: entry.salesInvoiceId
    }
  });
});
```

---

### 4.5 Completion Status (ERPNext parity)

**Schema Addition:**
```javascript
// models/TimeEntry.js
const timeEntrySchema = new Schema({
  // ... existing fields ...

  // Completion Status (ERPNext: completed)
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
});
```

**Business Logic:**
```javascript
// services/timeEntryService.js

/**
 * Mark time entry as completed
 */
async function markAsCompleted(timeEntryId, userId) {
  const entry = await TimeEntry.findByIdAndUpdate(
    timeEntryId,
    {
      isCompleted: true,
      completedAt: new Date(),
      completedBy: userId
    },
    { new: true }
  );

  // Update related task progress if linked
  if (entry.taskId) {
    await updateTaskProgress(entry.taskId);
  }

  return entry;
}

/**
 * Bulk mark entries as completed
 */
async function bulkMarkCompleted(timeEntryIds, userId) {
  await TimeEntry.updateMany(
    { _id: { $in: timeEntryIds } },
    {
      $set: {
        isCompleted: true,
        completedAt: new Date(),
        completedBy: userId
      }
    }
  );
}

/**
 * Get completion statistics for a case
 */
async function getCaseCompletionStats(caseId) {
  const stats = await TimeEntry.aggregate([
    { $match: { caseId: mongoose.Types.ObjectId(caseId) } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        completedEntries: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        totalHours: { $sum: { $add: ['$actualHours', { $divide: ['$actualMinutes', 60] }] } },
        completedHours: {
          $sum: {
            $cond: [
              '$isCompleted',
              { $add: ['$actualHours', { $divide: ['$actualMinutes', 60] }] },
              0
            ]
          }
        }
      }
    }
  ]);

  if (!stats.length) return null;

  const result = stats[0];
  return {
    totalEntries: result.totalEntries,
    completedEntries: result.completedEntries,
    completionPercentage: Math.round((result.completedEntries / result.totalEntries) * 100),
    totalHours: Math.round(result.totalHours * 10) / 10,
    completedHours: Math.round(result.completedHours * 10) / 10
  };
}
```

**API Endpoints:**
```javascript
// routes/timeEntries.js

// Mark entry as completed
router.post('/:id/complete', authenticateToken, async (req, res) => {
  const entry = await markAsCompleted(req.params.id, req.user._id);
  res.json({ data: entry });
});

// Mark entry as incomplete
router.post('/:id/incomplete', authenticateToken, async (req, res) => {
  const entry = await TimeEntry.findByIdAndUpdate(
    req.params.id,
    {
      $set: { isCompleted: false },
      $unset: { completedAt: '', completedBy: '' }
    },
    { new: true }
  );
  res.json({ data: entry });
});

// Bulk complete
router.post('/bulk-complete', authenticateToken, async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'ids array is required' });
  }

  await bulkMarkCompleted(ids, req.user._id);
  res.json({ success: true, count: ids.length });
});

// Get case completion stats
router.get('/case/:caseId/completion-stats', authenticateToken, async (req, res) => {
  const stats = await getCaseCompletionStats(req.params.caseId);
  res.json({ data: stats });
});
```

---

## 5. Finance Setup Wizard

### 5.1 Setup Status Schema

**Schema:**
```javascript
// models/FinanceSetup.js
const financeSetupSchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },

  // Wizard Progress
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Step Completion Status
  stepsCompleted: {
    companyInfo: { type: Boolean, default: false },
    fiscalYear: { type: Boolean, default: false },
    chartOfAccounts: { type: Boolean, default: false },
    currency: { type: Boolean, default: false },
    taxSettings: { type: Boolean, default: false },
    bankAccounts: { type: Boolean, default: false },
    openingBalances: { type: Boolean, default: false },
    invoiceSettings: { type: Boolean, default: false },
    paymentMethods: { type: Boolean, default: false },
    review: { type: Boolean, default: false }
  },

  // Wizard Data (stored for resume capability)
  wizardData: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });
```

### 5.2 API Endpoints

```javascript
// routes/financeSetup.js

// Get setup status
router.get('/status', authenticateToken, async (req, res) => {
  const companyId = req.user.companyId;

  let setup = await FinanceSetup.findOne({ companyId });

  if (!setup) {
    setup = await FinanceSetup.create({ companyId });
  }

  res.json({
    data: {
      isComplete: setup.completed,
      currentStep: setup.currentStep,
      stepsCompleted: setup.stepsCompleted
    }
  });
});

// Save wizard progress
router.post('/save-progress', authenticateToken, async (req, res) => {
  const companyId = req.user.companyId;
  const { currentStep, wizardData, stepKey } = req.body;

  const setup = await FinanceSetup.findOneAndUpdate(
    { companyId },
    {
      currentStep,
      wizardData,
      [`stepsCompleted.${stepKey}`]: true
    },
    { upsert: true, new: true }
  );

  res.json({ data: setup });
});

// Complete wizard
router.post('/complete', authenticateToken, async (req, res) => {
  const companyId = req.user.companyId;
  const { wizardData } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Update company info
    await Company.findByIdAndUpdate(companyId, {
      name: wizardData.companyName,
      nameAr: wizardData.companyNameAr,
      crNumber: wizardData.crNumber,
      vatNumber: wizardData.vatNumber
    }, { session });

    // 2. Create fiscal year
    await FiscalYear.create([{
      companyId,
      startDate: wizardData.fiscalYearStart,
      endDate: wizardData.fiscalYearEnd,
      isActive: true
    }], { session });

    // 3. Setup chart of accounts
    if (wizardData.accountTemplate !== 'custom') {
      await setupChartOfAccounts(companyId, wizardData.accountTemplate, session);
    }

    // 4. Create bank account
    if (wizardData.bankName && wizardData.iban) {
      await BankAccount.create([{
        companyId,
        bankName: wizardData.bankName,
        accountNumber: wizardData.accountNumber,
        iban: wizardData.iban,
        isDefault: true
      }], { session });
    }

    // 5. Save finance settings
    await FinanceSettings.findOneAndUpdate(
      { companyId },
      {
        defaultCurrency: wizardData.defaultCurrency,
        vatRate: wizardData.vatRate,
        taxCalculation: wizardData.taxCalculation,
        zatcaCompliance: wizardData.zatcaCompliance,
        invoicePrefix: wizardData.invoicePrefix,
        invoiceStartNumber: wizardData.invoiceStartNumber,
        defaultPaymentTerms: wizardData.paymentTerms,
        enableMultiCurrency: wizardData.enableMultiCurrency,
        paymentMethods: {
          bankTransfer: wizardData.enableBankTransfer,
          cash: wizardData.enableCash,
          creditCard: wizardData.enableCreditCard,
          online: wizardData.enableOnlinePayments
        }
      },
      { upsert: true, session }
    );

    // 6. Mark setup as complete
    await FinanceSetup.findOneAndUpdate(
      { companyId },
      {
        completed: true,
        completedAt: new Date(),
        completedBy: req.user._id,
        currentStep: 10,
        'stepsCompleted.review': true
      },
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Finance setup completed successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
```

---

## 6. Database Migrations

### 6.1 Migration Script

```javascript
// migrations/add-erpnext-parity-fields.js
const mongoose = require('mongoose');

module.exports = {
  async up(db) {
    // Invoice collection updates
    await db.collection('invoices').updateMany(
      {},
      {
        $set: {
          contactPersonName: null,
          contactEmail: null,
          contactMobile: null,
          shippingAddress: null,
          salesTeam: [],
          advances: [],
          totalAdvanceAllocated: 0
        }
      }
    );

    // Payment collection updates
    await db.collection('payments').updateMany(
      {},
      {
        $set: {
          paidFromAccount: null,
          paidToAccount: null,
          partyType: 'customer',
          deductions: [],
          totalDeductions: 0,
          netAmountAfterDeductions: null
        }
      }
    );

    // Expense collection updates
    await db.collection('expenses').updateMany(
      {},
      {
        $set: {
          expenseApproverId: null,
          approvalStatus: 'pending',
          sanctionedAmount: null,
          rejectionReason: null,
          payableAccount: null,
          journalEntryRef: null,
          isPaid: false,
          modeOfPayment: null,
          clearanceDate: null
        }
      }
    );

    // TimeEntry collection updates
    await db.collection('timeentries').updateMany(
      {},
      {
        $set: {
          billingHours: null,
          billingMinutes: 0,
          isBillableOverride: false,
          expectedHours: 0,
          expectedMinutes: 0,
          costingRate: 0,
          costingAmount: 0
        }
      }
    );

    // Create FinanceSetup collection
    await db.createCollection('financesetups');

    console.log('Migration completed: ERPNext parity fields added');
  },

  async down(db) {
    // Rollback logic
    await db.collection('invoices').updateMany(
      {},
      {
        $unset: {
          contactPersonName: '',
          contactEmail: '',
          contactMobile: '',
          shippingAddress: '',
          salesTeam: '',
          advances: '',
          totalAdvanceAllocated: ''
        }
      }
    );

    // ... similar for other collections
  }
};
```

### 6.2 Running Migration

```bash
# Using migrate-mongo
npx migrate-mongo up

# Or with custom script
node scripts/run-migration.js add-erpnext-parity-fields
```

---

## 7. API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Invoices** |
| GET | `/api/payments/advances/available/:clientId` | Get available advance payments |
| POST | `/api/invoices` | Create invoice (with new fields) |
| POST | `/api/invoices/credit-note` | **Create credit note** |
| GET | `/api/invoices/:id/credit-notes` | **Get credit notes for invoice** |
| GET | `/api/invoices/credit-notes` | **List all credit notes** |
| **Payments** |
| GET | `/api/accounts/chart` | Get chart of accounts for GL selection |
| GET | `/api/deduction-accounts` | Get standard deduction accounts |
| POST | `/api/payments` | Create payment (with deductions) |
| **Expenses** |
| GET | `/api/expenses/pending-approval` | Get expenses pending my approval |
| POST | `/api/expenses/:id/approve` | Approve expense |
| POST | `/api/expenses/:id/reject` | Reject expense |
| POST | `/api/expenses/:id/pay` | Mark expense as paid |
| **Employee Advances** |
| GET | `/api/employee-advances/available/:employeeId` | **Get available advances for employee** |
| POST | `/api/employee-advances` | **Create employee advance** |
| POST | `/api/employee-advances/:id/approve` | **Approve advance** |
| POST | `/api/employee-advances/:id/pay` | **Mark advance as paid** |
| **Time Entries** |
| POST | `/api/time-entries` | Create time entry (with new fields) |
| GET | `/api/time-entries/summary` | Get time summary with costing |
| GET | `/api/time-entries/unbilled` | **Get unbilled entries for invoicing** |
| GET | `/api/time-entries/:id/billing-history` | **Get billing history** |
| POST | `/api/time-entries/:id/complete` | **Mark entry as completed** |
| POST | `/api/time-entries/:id/incomplete` | **Mark entry as incomplete** |
| POST | `/api/time-entries/bulk-complete` | **Bulk mark as completed** |
| GET | `/api/time-entries/case/:caseId/completion-stats` | **Get case completion stats** |
| **Finance Setup** |
| GET | `/api/finance/setup/status` | Get wizard completion status |
| POST | `/api/finance/setup/save-progress` | Save wizard progress |
| POST | `/api/finance/setup/complete` | Complete wizard setup |

---

## Validation Summary

| Field | Validation |
|-------|------------|
| `contactEmail` | Valid email format |
| `contactMobile` | Phone format (+966...) |
| `shippingAddress.postalCode` | 5 digits for Saudi |
| `commissionRate` | 0-100% |
| `deductions[].amount` | Positive number |
| `sanctionedAmount` | <= claimed amount |
| `billingHours` | Non-negative |
| `costingRate` | Non-negative |
| `expectedHours` | Non-negative |

---

## Testing Checklist

### Invoice
- [ ] Invoice with contact person creates successfully
- [ ] Shipping address saved when enabled
- [ ] Sales commission calculates correctly
- [ ] Advance payments reduce balance due
- [ ] **Credit note creates with correct negative amounts**
- [ ] **Credit note references original invoice**
- [ ] **Debit note (rate adjustment) creates correctly**
- [ ] **Credit note reduces outstanding on original invoice**
- [ ] **ZATCA type code correct (381/383/388)**

### Payment
- [ ] Payment deductions create proper JE
- [ ] GL accounts auto-assign based on payment type
- [ ] Tax withholding deductions save correctly

### Expense
- [ ] Expense approval workflow functions
- [ ] Sanctioned amount can differ from claimed
- [ ] Journal entries created on expense approval
- [ ] **Employee advance allocation works**
- [ ] **Allocated amount updates advance record**
- [ ] **Return amount creates proper JE**
- [ ] **Net claim amount calculates correctly**

### Time Entry
- [ ] Billing hours override calculates correctly
- [ ] Costing margin shows accurately
- [ ] Expected hours progress indicator works
- [ ] **Sales invoice reference saves correctly**
- [ ] **isBilled flag updates when invoiced**
- [ ] **Unbilled entries API returns correct data**
- [ ] **isCompleted flag saves correctly**
- [ ] **Bulk complete updates all entries**
- [ ] **Case completion stats aggregate correctly**

### Finance Setup
- [ ] Finance wizard redirects first-time users
- [ ] Wizard progress saves and resumes
- [ ] All wizard steps complete successfully

---

## 8. Full Reports Module

The Full Reports module provides professional financial reports with PDF export capability. Reports integrate company branding (logo, name, VAT) and support bilingual output (Arabic RTL / English LTR).

### 8.1 Report Types & Data Requirements

| Report | Description | Data Sources |
|--------|-------------|--------------|
| **Profit & Loss** | Income, expenses, net profit for period | GL entries, income/expense accounts |
| **Balance Sheet** | Assets, liabilities, equity at date | GL entries, all account types |
| **Trial Balance** | All accounts with debit/credit balances | GL entries |
| **Aged Receivables** | Client balances by aging buckets | Invoices, payments |
| **Invoice Summary** | Invoice totals, collection stats | Invoices |
| **Expense Summary** | Expenses by category | Expenses |
| **Timesheet Summary** | Hours, billing, utilization | Time entries |
| **VAT Report** | VAT collected/paid for period | Invoices, expenses |

### 8.2 Profit & Loss Report API

**Endpoint:** `GET /api/reports/profit-loss`

**Query Parameters:**
```
startDate: string (YYYY-MM-DD) - Required
endDate: string (YYYY-MM-DD) - Required
companyId: string - Optional (uses auth user's company)
```

**Response Schema:**
```typescript
interface ProfitLossReport {
  period: {
    startDate: string
    endDate: string
  }
  income: {
    items: Array<{
      accountCode: string
      account: string
      accountAr: string
      amount: number // Amount in halalas (subunit)
    }>
    total: number
  }
  expenses: {
    items: Array<{
      accountCode: string
      account: string
      accountAr: string
      amount: number
    }>
    total: number
  }
  netIncome: number
  generatedAt: string
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getProfitLossReport(startDate, endDate, companyId) {
  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get income accounts (type: 'income', 'revenue')
  const incomeAccounts = await Account.find({
    companyId,
    accountType: { $in: ['income', 'revenue'] },
    isActive: true
  });

  const incomeAccountCodes = incomeAccounts.map(a => a.accountCode);

  // Aggregate income from GL entries
  const incomeEntries = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        accountCode: { $in: incomeAccountCodes },
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        credit: { $sum: '$credit' },
        debit: { $sum: '$debit' }
      }
    }
  ]);

  // Income = Credits - Debits (normal balance is credit)
  const incomeItems = incomeEntries.map(entry => {
    const account = incomeAccounts.find(a => a.accountCode === entry._id);
    return {
      accountCode: entry._id,
      account: account?.accountName || entry._id,
      accountAr: account?.accountNameAr || entry._id,
      amount: entry.credit - entry.debit
    };
  }).filter(item => item.amount !== 0);

  // Get expense accounts
  const expenseAccounts = await Account.find({
    companyId,
    accountType: { $in: ['expense', 'cost_of_goods_sold'] },
    isActive: true
  });

  const expenseAccountCodes = expenseAccounts.map(a => a.accountCode);

  // Aggregate expenses from GL entries
  const expenseEntries = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        accountCode: { $in: expenseAccountCodes },
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        debit: { $sum: '$debit' },
        credit: { $sum: '$credit' }
      }
    }
  ]);

  // Expenses = Debits - Credits (normal balance is debit)
  const expenseItems = expenseEntries.map(entry => {
    const account = expenseAccounts.find(a => a.accountCode === entry._id);
    return {
      accountCode: entry._id,
      account: account?.accountName || entry._id,
      accountAr: account?.accountNameAr || entry._id,
      amount: entry.debit - entry.credit
    };
  }).filter(item => item.amount !== 0);

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    period: { startDate, endDate },
    income: {
      items: incomeItems.sort((a, b) => b.amount - a.amount),
      total: totalIncome
    },
    expenses: {
      items: expenseItems.sort((a, b) => b.amount - a.amount),
      total: totalExpenses
    },
    netIncome: totalIncome - totalExpenses,
    generatedAt: new Date().toISOString()
  };
}
```

**API Route:**
```javascript
// routes/reports.js

router.get('/profit-loss', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const companyId = req.user.companyId;
  const report = await getProfitLossReport(startDate, endDate, companyId);

  res.json({ data: report });
});
```

---

### 8.3 Balance Sheet Report API

**Endpoint:** `GET /api/reports/balance-sheet`

**Query Parameters:**
```
asOfDate: string (YYYY-MM-DD) - Optional (defaults to today)
companyId: string - Optional
```

**Response Schema:**
```typescript
interface BalanceSheetReport {
  asOfDate: string
  assets: {
    currentAssets: AccountBalance[]
    fixedAssets: AccountBalance[]
    total: number
  }
  liabilities: {
    currentLiabilities: AccountBalance[]
    longTermLiabilities: AccountBalance[]
    total: number
  }
  equity: {
    items: AccountBalance[]
    total: number
  }
  generatedAt: string
}

interface AccountBalance {
  accountCode: string
  account: string
  accountAr: string
  balance: number
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getBalanceSheetReport(asOfDate, companyId) {
  const endOfDay = new Date(asOfDate || new Date());
  endOfDay.setHours(23, 59, 59, 999);

  // Get all accounts with their balances
  const accounts = await Account.find({
    companyId,
    isActive: true
  });

  // Calculate cumulative balances from GL
  const balances = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' }
      }
    }
  ]);

  // Create balance map
  const balanceMap = new Map();
  balances.forEach(b => {
    balanceMap.set(b._id, {
      debit: b.totalDebit,
      credit: b.totalCredit
    });
  });

  // Helper to get account balance
  const getBalance = (accountCode, normalBalance) => {
    const bal = balanceMap.get(accountCode) || { debit: 0, credit: 0 };
    return normalBalance === 'debit'
      ? bal.debit - bal.credit
      : bal.credit - bal.debit;
  };

  // Categorize accounts
  const currentAssets = [];
  const fixedAssets = [];
  const currentLiabilities = [];
  const longTermLiabilities = [];
  const equityItems = [];

  for (const account of accounts) {
    const balance = getBalance(account.accountCode, account.normalBalance);
    if (balance === 0) continue;

    const item = {
      accountCode: account.accountCode,
      account: account.accountName,
      accountAr: account.accountNameAr,
      balance
    };

    switch (account.accountType) {
      case 'asset':
        if (account.accountSubType === 'fixed_asset') {
          fixedAssets.push(item);
        } else {
          currentAssets.push(item);
        }
        break;
      case 'liability':
        if (account.accountSubType === 'long_term') {
          longTermLiabilities.push(item);
        } else {
          currentLiabilities.push(item);
        }
        break;
      case 'equity':
        equityItems.push(item);
        break;
    }
  }

  // Calculate retained earnings from income/expense
  const retainedEarnings = await calculateRetainedEarnings(companyId, endOfDay);
  if (retainedEarnings !== 0) {
    equityItems.push({
      accountCode: 'RE',
      account: 'Retained Earnings',
      accountAr: 'الأرباح المحتجزة',
      balance: retainedEarnings
    });
  }

  return {
    asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    assets: {
      currentAssets: currentAssets.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      fixedAssets: fixedAssets.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      total: [...currentAssets, ...fixedAssets].reduce((s, i) => s + i.balance, 0)
    },
    liabilities: {
      currentLiabilities: currentLiabilities.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      longTermLiabilities: longTermLiabilities.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      total: [...currentLiabilities, ...longTermLiabilities].reduce((s, i) => s + i.balance, 0)
    },
    equity: {
      items: equityItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      total: equityItems.reduce((s, i) => s + i.balance, 0)
    },
    generatedAt: new Date().toISOString()
  };
}

async function calculateRetainedEarnings(companyId, asOfDate) {
  // Sum all income and expense entries
  const result = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $lte: asOfDate },
        status: 'posted'
      }
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'accountCode',
        foreignField: 'accountCode',
        as: 'account'
      }
    },
    { $unwind: '$account' },
    {
      $match: {
        'account.accountType': { $in: ['income', 'revenue', 'expense', 'cost_of_goods_sold'] }
      }
    },
    {
      $group: {
        _id: '$account.accountType',
        debit: { $sum: '$debit' },
        credit: { $sum: '$credit' }
      }
    }
  ]);

  let income = 0;
  let expenses = 0;

  result.forEach(r => {
    if (['income', 'revenue'].includes(r._id)) {
      income += r.credit - r.debit;
    } else {
      expenses += r.debit - r.credit;
    }
  });

  return income - expenses;
}
```

---

### 8.4 Trial Balance Report API

**Endpoint:** `GET /api/reports/trial-balance`

**Query Parameters:**
```
asOfDate: string (YYYY-MM-DD) - Optional
companyId: string - Optional
```

**Response Schema:**
```typescript
interface TrialBalanceReport {
  asOfDate: string
  accounts: Array<{
    accountNumber: string
    account: string
    accountAr: string
    debit: number
    credit: number
  }>
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  generatedAt: string
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getTrialBalanceReport(asOfDate, companyId) {
  const endOfDay = new Date(asOfDate || new Date());
  endOfDay.setHours(23, 59, 59, 999);

  // Get all accounts
  const accounts = await Account.find({
    companyId,
    isActive: true
  }).sort({ accountCode: 1 });

  // Aggregate GL balances
  const balances = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' }
      }
    }
  ]);

  const balanceMap = new Map();
  balances.forEach(b => balanceMap.set(b._id, b));

  const accountsData = accounts.map(account => {
    const bal = balanceMap.get(account.accountCode) || { totalDebit: 0, totalCredit: 0 };
    const netBalance = bal.totalDebit - bal.totalCredit;

    return {
      accountNumber: account.accountCode,
      account: account.accountName,
      accountAr: account.accountNameAr,
      // Show balance on correct side based on normal balance
      debit: account.normalBalance === 'debit' && netBalance > 0 ? netBalance :
             account.normalBalance === 'credit' && netBalance < 0 ? Math.abs(netBalance) : 0,
      credit: account.normalBalance === 'credit' && netBalance > 0 ? netBalance :
              account.normalBalance === 'debit' && netBalance < 0 ? Math.abs(netBalance) : 0
    };
  }).filter(a => a.debit !== 0 || a.credit !== 0);

  const totalDebit = accountsData.reduce((s, a) => s + a.debit, 0);
  const totalCredit = accountsData.reduce((s, a) => s + a.credit, 0);

  return {
    asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    accounts: accountsData,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 1, // Allow 1 halala variance
    generatedAt: new Date().toISOString()
  };
}
```

---

### 8.5 Aged Receivables Report API

**Endpoint:** `GET /api/reports/ar-aging`

**Query Parameters:**
```
asOfDate: string (YYYY-MM-DD) - Optional
companyId: string - Optional
```

**Response Schema:**
```typescript
interface AgedReceivablesReport {
  asOfDate: string
  summary: {
    current: number      // Not yet due
    days1to30: number    // 1-30 days overdue
    days31to60: number   // 31-60 days overdue
    days61to90: number   // 61-90 days overdue
    over90: number       // 90+ days overdue
    total: number
  }
  clients: Array<{
    clientId: string
    clientName: string
    current: number
    days1to30: number
    days31to60: number
    days61to90: number
    over90: number
    total: number
  }>
  generatedAt: string
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getAgedReceivablesReport(asOfDate, companyId) {
  const today = new Date(asOfDate || new Date());
  today.setHours(0, 0, 0, 0);

  // Get all unpaid/partially paid invoices
  const invoices = await Invoice.find({
    companyId,
    status: { $in: ['sent', 'partially_paid', 'overdue'] },
    balanceDue: { $gt: 0 }
  }).populate('clientId', 'name nameAr');

  // Calculate aging for each invoice
  const clientAging = new Map();

  for (const invoice of invoices) {
    const dueDate = new Date(invoice.dueDate);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    const balance = invoice.balanceDue;

    const clientKey = invoice.clientId?._id?.toString() || 'unknown';

    if (!clientAging.has(clientKey)) {
      clientAging.set(clientKey, {
        clientId: clientKey,
        clientName: invoice.clientId?.name || 'Unknown Client',
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        over90: 0,
        total: 0
      });
    }

    const client = clientAging.get(clientKey);

    if (daysOverdue <= 0) {
      client.current += balance;
    } else if (daysOverdue <= 30) {
      client.days1to30 += balance;
    } else if (daysOverdue <= 60) {
      client.days31to60 += balance;
    } else if (daysOverdue <= 90) {
      client.days61to90 += balance;
    } else {
      client.over90 += balance;
    }
    client.total += balance;
  }

  const clients = Array.from(clientAging.values())
    .sort((a, b) => b.total - a.total);

  // Calculate summary
  const summary = {
    current: clients.reduce((s, c) => s + c.current, 0),
    days1to30: clients.reduce((s, c) => s + c.days1to30, 0),
    days31to60: clients.reduce((s, c) => s + c.days31to60, 0),
    days61to90: clients.reduce((s, c) => s + c.days61to90, 0),
    over90: clients.reduce((s, c) => s + c.over90, 0),
    total: clients.reduce((s, c) => s + c.total, 0)
  };

  return {
    asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    summary,
    clients,
    generatedAt: new Date().toISOString()
  };
}
```

---

### 8.6 Invoice Summary Report API

**Endpoint:** `GET /api/reports/invoice-summary`

**Query Parameters:**
```
startDate: string (YYYY-MM-DD) - Required
endDate: string (YYYY-MM-DD) - Required
companyId: string - Optional
groupBy: 'client' | 'month' | 'status' - Optional (default: 'status')
```

**Response Schema:**
```typescript
interface InvoiceSummaryReport {
  period: { startDate: string; endDate: string }
  totals: {
    invoiceCount: number
    totalInvoiced: number
    totalPaid: number
    totalOutstanding: number
    averageInvoice: number
    collectionRate: number // percentage
  }
  byStatus: Array<{
    status: string
    count: number
    amount: number
  }>
  byClient?: Array<{
    clientId: string
    clientName: string
    invoiceCount: number
    totalAmount: number
    paidAmount: number
    outstandingAmount: number
  }>
  byMonth?: Array<{
    month: string
    invoiceCount: number
    totalAmount: number
    paidAmount: number
  }>
  generatedAt: string
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getInvoiceSummaryReport(startDate, endDate, companyId, groupBy = 'status') {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Base query
  const invoices = await Invoice.find({
    companyId,
    issueDate: { $gte: start, $lte: end },
    isReturn: { $ne: true }
  }).populate('clientId', 'name');

  // Calculate totals
  const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.totalAmount - (i.balanceDue || 0)), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (i.balanceDue || 0), 0);

  const result = {
    period: { startDate, endDate },
    totals: {
      invoiceCount: invoices.length,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      averageInvoice: invoices.length ? Math.round(totalInvoiced / invoices.length) : 0,
      collectionRate: totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 0
    },
    byStatus: [],
    generatedAt: new Date().toISOString()
  };

  // Group by status
  const statusGroups = {};
  invoices.forEach(inv => {
    const status = inv.status;
    if (!statusGroups[status]) {
      statusGroups[status] = { status, count: 0, amount: 0 };
    }
    statusGroups[status].count++;
    statusGroups[status].amount += inv.totalAmount;
  });
  result.byStatus = Object.values(statusGroups);

  // Optional groupings
  if (groupBy === 'client') {
    const clientGroups = {};
    invoices.forEach(inv => {
      const clientId = inv.clientId?._id?.toString() || 'unknown';
      if (!clientGroups[clientId]) {
        clientGroups[clientId] = {
          clientId,
          clientName: inv.clientId?.name || 'Unknown',
          invoiceCount: 0,
          totalAmount: 0,
          paidAmount: 0,
          outstandingAmount: 0
        };
      }
      clientGroups[clientId].invoiceCount++;
      clientGroups[clientId].totalAmount += inv.totalAmount;
      clientGroups[clientId].paidAmount += (inv.totalAmount - (inv.balanceDue || 0));
      clientGroups[clientId].outstandingAmount += (inv.balanceDue || 0);
    });
    result.byClient = Object.values(clientGroups).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  if (groupBy === 'month') {
    const monthGroups = {};
    invoices.forEach(inv => {
      const month = inv.issueDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthGroups[month]) {
        monthGroups[month] = {
          month,
          invoiceCount: 0,
          totalAmount: 0,
          paidAmount: 0
        };
      }
      monthGroups[month].invoiceCount++;
      monthGroups[month].totalAmount += inv.totalAmount;
      monthGroups[month].paidAmount += (inv.totalAmount - (inv.balanceDue || 0));
    });
    result.byMonth = Object.values(monthGroups).sort((a, b) => a.month.localeCompare(b.month));
  }

  return result;
}
```

---

### 8.7 Expense Summary Report API

**Endpoint:** `GET /api/reports/expense-summary`

**Query Parameters:**
```
startDate: string (YYYY-MM-DD) - Required
endDate: string (YYYY-MM-DD) - Required
companyId: string - Optional
groupBy: 'category' | 'employee' | 'month' - Optional (default: 'category')
```

**Response Schema:**
```typescript
interface ExpenseSummaryReport {
  period: { startDate: string; endDate: string }
  totals: {
    expenseCount: number
    totalAmount: number
    totalApproved: number
    totalPending: number
    totalRejected: number
    averageExpense: number
  }
  byCategory: Array<{
    category: string
    categoryAr: string
    count: number
    amount: number
    percentage: number
  }>
  byEmployee?: Array<{
    employeeId: string
    employeeName: string
    expenseCount: number
    totalAmount: number
    approvedAmount: number
  }>
  byMonth?: Array<{
    month: string
    count: number
    amount: number
  }>
  generatedAt: string
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getExpenseSummaryReport(startDate, endDate, companyId, groupBy = 'category') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const expenses = await Expense.find({
    companyId,
    date: { $gte: start, $lte: end }
  }).populate('employeeId', 'firstName lastName');

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const approved = expenses.filter(e => e.approvalStatus === 'approved');
  const pending = expenses.filter(e => e.approvalStatus === 'pending');
  const rejected = expenses.filter(e => e.approvalStatus === 'rejected');

  const result = {
    period: { startDate, endDate },
    totals: {
      expenseCount: expenses.length,
      totalAmount,
      totalApproved: approved.reduce((s, e) => s + (e.sanctionedAmount || e.amount), 0),
      totalPending: pending.reduce((s, e) => s + e.amount, 0),
      totalRejected: rejected.reduce((s, e) => s + e.amount, 0),
      averageExpense: expenses.length ? Math.round(totalAmount / expenses.length) : 0
    },
    byCategory: [],
    generatedAt: new Date().toISOString()
  };

  // Group by category
  const categoryGroups = {};
  expenses.forEach(exp => {
    const cat = exp.category || 'other';
    if (!categoryGroups[cat]) {
      categoryGroups[cat] = {
        category: cat,
        categoryAr: getCategoryArabicName(cat),
        count: 0,
        amount: 0
      };
    }
    categoryGroups[cat].count++;
    categoryGroups[cat].amount += exp.amount;
  });

  result.byCategory = Object.values(categoryGroups)
    .map(c => ({
      ...c,
      percentage: totalAmount ? Math.round((c.amount / totalAmount) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // Optional groupings
  if (groupBy === 'employee') {
    const empGroups = {};
    expenses.forEach(exp => {
      const empId = exp.employeeId?._id?.toString() || 'unknown';
      if (!empGroups[empId]) {
        empGroups[empId] = {
          employeeId: empId,
          employeeName: exp.employeeId
            ? `${exp.employeeId.firstName} ${exp.employeeId.lastName}`
            : 'Unknown',
          expenseCount: 0,
          totalAmount: 0,
          approvedAmount: 0
        };
      }
      empGroups[empId].expenseCount++;
      empGroups[empId].totalAmount += exp.amount;
      if (exp.approvalStatus === 'approved') {
        empGroups[empId].approvedAmount += (exp.sanctionedAmount || exp.amount);
      }
    });
    result.byEmployee = Object.values(empGroups).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  return result;
}

function getCategoryArabicName(category) {
  const map = {
    'office_supplies': 'مستلزمات مكتبية',
    'travel': 'سفر',
    'accommodation': 'إقامة',
    'meals': 'وجبات',
    'court_fees': 'رسوم محكمة',
    'government_fees': 'رسوم حكومية',
    'professional_services': 'خدمات مهنية',
    'software': 'برمجيات',
    'other': 'أخرى'
  };
  return map[category] || category;
}
```

---

### 8.8 Timesheet Summary Report API

**Endpoint:** `GET /api/reports/timesheet-summary`

**Query Parameters:**
```
startDate: string (YYYY-MM-DD) - Required
endDate: string (YYYY-MM-DD) - Required
companyId: string - Optional
groupBy: 'attorney' | 'client' | 'case' - Optional (default: 'attorney')
```

**Response Schema:**
```typescript
interface TimesheetSummaryReport {
  period: { startDate: string; endDate: string }
  totals: {
    entryCount: number
    totalHours: number
    billableHours: number
    nonBillableHours: number
    billedHours: number
    unbilledHours: number
    totalBillingAmount: number
    totalCostingAmount: number
    profitMargin: number // percentage
    utilizationRate: number // percentage
  }
  byAttorney?: Array<{
    attorneyId: string
    attorneyName: string
    totalHours: number
    billableHours: number
    billingAmount: number
    costingAmount: number
    utilizationRate: number
  }>
  byClient?: Array<{
    clientId: string
    clientName: string
    totalHours: number
    billingAmount: number
    billedAmount: number
    unbilledAmount: number
  }>
  byCase?: Array<{
    caseId: string
    caseName: string
    caseNumber: string
    totalHours: number
    billingAmount: number
    isOverBudget: boolean
  }>
  generatedAt: string
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getTimesheetSummaryReport(startDate, endDate, companyId, groupBy = 'attorney') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await TimeEntry.find({
    companyId,
    date: { $gte: start, $lte: end }
  })
    .populate('attorneyId', 'firstName lastName hourlyRate costingRate')
    .populate('clientId', 'name')
    .populate('caseId', 'caseNumber title');

  // Calculate hours for each entry
  const entriesWithHours = entries.map(e => ({
    ...e.toObject(),
    totalMinutes: (e.actualHours || 0) * 60 + (e.actualMinutes || 0),
    billingMinutes: e.isBillableOverride
      ? (e.billingHours || 0) * 60 + (e.billingMinutes || 0)
      : (e.actualHours || 0) * 60 + (e.actualMinutes || 0)
  }));

  // Calculate totals
  const totalMinutes = entriesWithHours.reduce((s, e) => s + e.totalMinutes, 0);
  const billableMinutes = entriesWithHours
    .filter(e => e.isBillable)
    .reduce((s, e) => s + e.billingMinutes, 0);
  const billedMinutes = entriesWithHours
    .filter(e => e.isBilled)
    .reduce((s, e) => s + e.billingMinutes, 0);
  const totalBillingAmount = entriesWithHours.reduce((s, e) => s + (e.billingAmount || 0), 0);
  const totalCostingAmount = entriesWithHours.reduce((s, e) => s + (e.costingAmount || 0), 0);

  // Standard work hours (assume 8 hours/day, need to calculate working days)
  const workingDays = getWorkingDays(start, end);
  const standardHours = workingDays * 8;

  const result = {
    period: { startDate, endDate },
    totals: {
      entryCount: entries.length,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      billableHours: Math.round(billableMinutes / 60 * 10) / 10,
      nonBillableHours: Math.round((totalMinutes - billableMinutes) / 60 * 10) / 10,
      billedHours: Math.round(billedMinutes / 60 * 10) / 10,
      unbilledHours: Math.round((billableMinutes - billedMinutes) / 60 * 10) / 10,
      totalBillingAmount,
      totalCostingAmount,
      profitMargin: totalBillingAmount
        ? Math.round((totalBillingAmount - totalCostingAmount) / totalBillingAmount * 100)
        : 0,
      utilizationRate: standardHours
        ? Math.round((billableMinutes / 60) / standardHours * 100)
        : 0
    },
    generatedAt: new Date().toISOString()
  };

  // Group by attorney
  if (groupBy === 'attorney') {
    const attorneyGroups = {};
    entriesWithHours.forEach(e => {
      const attId = e.attorneyId?._id?.toString() || 'unknown';
      if (!attorneyGroups[attId]) {
        attorneyGroups[attId] = {
          attorneyId: attId,
          attorneyName: e.attorneyId
            ? `${e.attorneyId.firstName} ${e.attorneyId.lastName}`
            : 'Unknown',
          totalMinutes: 0,
          billableMinutes: 0,
          billingAmount: 0,
          costingAmount: 0
        };
      }
      attorneyGroups[attId].totalMinutes += e.totalMinutes;
      if (e.isBillable) {
        attorneyGroups[attId].billableMinutes += e.billingMinutes;
      }
      attorneyGroups[attId].billingAmount += (e.billingAmount || 0);
      attorneyGroups[attId].costingAmount += (e.costingAmount || 0);
    });

    result.byAttorney = Object.values(attorneyGroups).map(a => ({
      attorneyId: a.attorneyId,
      attorneyName: a.attorneyName,
      totalHours: Math.round(a.totalMinutes / 60 * 10) / 10,
      billableHours: Math.round(a.billableMinutes / 60 * 10) / 10,
      billingAmount: a.billingAmount,
      costingAmount: a.costingAmount,
      utilizationRate: standardHours
        ? Math.round((a.billableMinutes / 60) / (standardHours / Object.keys(attorneyGroups).length) * 100)
        : 0
    })).sort((a, b) => b.totalHours - a.totalHours);
  }

  return result;
}

function getWorkingDays(start, end) {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    // Saudi workweek: Sunday-Thursday (0=Sun, 4=Thu)
    if (day !== 5 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
```

---

### 8.9 VAT Report API

**Endpoint:** `GET /api/reports/vat`

**Query Parameters:**
```
startDate: string (YYYY-MM-DD) - Required
endDate: string (YYYY-MM-DD) - Required
companyId: string - Optional
```

**Response Schema:**
```typescript
interface VATReport {
  period: { startDate: string; endDate: string }
  outputVAT: {
    // VAT collected on sales
    standardRated: {
      taxableAmount: number
      vatAmount: number
    }
    zeroRated: {
      taxableAmount: number
    }
    exempt: {
      amount: number
    }
    totalOutputVAT: number
  }
  inputVAT: {
    // VAT paid on purchases
    reclaimable: {
      taxableAmount: number
      vatAmount: number
    }
    nonReclaimable: {
      amount: number
    }
    totalInputVAT: number
  }
  netVAT: number // outputVAT - inputVAT (amount to pay/refund)
  vatPayable: boolean // true if netVAT > 0
  invoiceCount: number
  expenseCount: number
  generatedAt: string
}
```

**Business Logic:**
```javascript
// services/reportService.js

async function getVATReport(startDate, endDate, companyId) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get invoices for output VAT
  const invoices = await Invoice.find({
    companyId,
    issueDate: { $gte: start, $lte: end },
    isReturn: { $ne: true },
    status: { $nin: ['draft', 'cancelled'] }
  });

  // Calculate output VAT (collected from customers)
  let standardRatedSales = 0;
  let standardRatedVAT = 0;
  let zeroRatedSales = 0;
  let exemptSales = 0;

  invoices.forEach(inv => {
    const vatRate = inv.vatRate || 15;
    if (vatRate === 15) {
      standardRatedSales += inv.subtotal || 0;
      standardRatedVAT += inv.vatAmount || 0;
    } else if (vatRate === 0) {
      zeroRatedSales += inv.subtotal || 0;
    } else {
      exemptSales += inv.totalAmount || 0;
    }
  });

  // Get expenses for input VAT
  const expenses = await Expense.find({
    companyId,
    date: { $gte: start, $lte: end },
    approvalStatus: 'approved'
  });

  // Calculate input VAT (paid on purchases)
  let reclaimablePurchases = 0;
  let reclaimableVAT = 0;
  let nonReclaimablePurchases = 0;

  expenses.forEach(exp => {
    if (exp.taxReclaimable) {
      reclaimablePurchases += (exp.amount - (exp.taxAmount || 0));
      reclaimableVAT += (exp.taxAmount || 0);
    } else {
      nonReclaimablePurchases += exp.amount;
    }
  });

  const totalOutputVAT = standardRatedVAT;
  const totalInputVAT = reclaimableVAT;
  const netVAT = totalOutputVAT - totalInputVAT;

  return {
    period: { startDate, endDate },
    outputVAT: {
      standardRated: {
        taxableAmount: standardRatedSales,
        vatAmount: standardRatedVAT
      },
      zeroRated: {
        taxableAmount: zeroRatedSales
      },
      exempt: {
        amount: exemptSales
      },
      totalOutputVAT
    },
    inputVAT: {
      reclaimable: {
        taxableAmount: reclaimablePurchases,
        vatAmount: reclaimableVAT
      },
      nonReclaimable: {
        amount: nonReclaimablePurchases
      },
      totalInputVAT
    },
    netVAT,
    vatPayable: netVAT > 0,
    invoiceCount: invoices.length,
    expenseCount: expenses.length,
    generatedAt: new Date().toISOString()
  };
}
```

---

### 8.10 Company Settings Integration

Reports must include company branding. The API should return company settings with each report:

**Company Settings Endpoint:** `GET /api/company/settings`

```typescript
interface CompanySettings {
  name: string
  nameAr: string
  logo: string // URL to logo image
  address: string
  addressAr: string
  phone: string
  email: string
  website: string
  vatNumber: string
  crNumber: string // Commercial Registration
  city: string
  country: string
}
```

**Including Company Data in Reports:**
```javascript
// middleware/addCompanyData.js

async function addCompanyData(req, res, next) {
  const companyId = req.user.companyId;

  const company = await Company.findById(companyId)
    .select('name nameAr logo address addressAr phone email vatNumber crNumber');

  req.companyData = company;
  next();
}

// Usage in report routes
router.get('/profit-loss', authenticateToken, addCompanyData, async (req, res) => {
  const report = await getProfitLossReport(/*...*/);

  res.json({
    data: report,
    company: req.companyData
  });
});
```

---

### 8.11 Report Export Formats

The frontend handles PDF generation via browser print. Optionally support server-side export:

**Export Endpoint:** `GET /api/reports/:type/export`

**Query Parameters:**
```
format: 'pdf' | 'xlsx' | 'csv'
startDate: string
endDate: string
```

**PDF Generation (using PDFKit or Puppeteer):**
```javascript
// services/reportExportService.js

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

async function exportReportToPDF(reportType, reportData, company, language = 'ar') {
  const doc = new PDFDocument({
    layout: 'portrait',
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Set RTL for Arabic
  if (language === 'ar') {
    // PDFKit doesn't have native RTL, use external library or reverse strings
  }

  // Add company header
  if (company.logo) {
    doc.image(company.logo, 50, 50, { width: 60 });
  }

  doc.fontSize(16)
     .text(company.name, 120, 50);

  doc.fontSize(10)
     .text(company.address, 120, 70);

  if (company.vatNumber) {
    doc.text(`VAT: ${company.vatNumber}`, 120, 85);
  }

  // Add report title and period
  doc.fontSize(20)
     .text(getReportTitle(reportType, language), 50, 130, { align: 'center' });

  doc.fontSize(12)
     .text(`${reportData.period.startDate} - ${reportData.period.endDate}`, 50, 160, { align: 'center' });

  // Add report content based on type
  switch (reportType) {
    case 'profit-loss':
      addProfitLossContent(doc, reportData, language);
      break;
    case 'balance-sheet':
      addBalanceSheetContent(doc, reportData, language);
      break;
    // ... other report types
  }

  // Add footer
  doc.fontSize(8)
     .text(`Generated: ${new Date().toLocaleString()}`, 50, doc.page.height - 30);

  doc.end();
  return doc;
}

async function exportReportToExcel(reportType, reportData, company) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(getReportTitle(reportType, 'en'));

  // Add header
  sheet.addRow([company.name]);
  sheet.addRow([`Report Period: ${reportData.period.startDate} - ${reportData.period.endDate}`]);
  sheet.addRow([]);

  // Add data based on report type
  switch (reportType) {
    case 'profit-loss':
      addProfitLossToExcel(sheet, reportData);
      break;
    // ... other report types
  }

  return workbook;
}
```

---

### 8.12 API Endpoints Summary - Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/profit-loss` | Profit & Loss statement |
| GET | `/api/reports/balance-sheet` | Balance Sheet |
| GET | `/api/reports/trial-balance` | Trial Balance |
| GET | `/api/reports/ar-aging` | Aged Receivables |
| GET | `/api/reports/invoice-summary` | Invoice Summary |
| GET | `/api/reports/expense-summary` | Expense Summary |
| GET | `/api/reports/timesheet-summary` | Timesheet Summary |
| GET | `/api/reports/vat` | VAT Report |
| GET | `/api/reports/:type/export` | Export report (PDF/Excel/CSV) |
| GET | `/api/company/settings` | Company settings for reports |

---

### 8.13 Testing Checklist - Reports

- [ ] Profit & Loss calculates income and expenses correctly
- [ ] Balance Sheet balances (Assets = Liabilities + Equity)
- [ ] Trial Balance is balanced (Debits = Credits)
- [ ] Aged Receivables shows correct aging buckets
- [ ] Invoice Summary totals match individual invoices
- [ ] Expense Summary groups by category correctly
- [ ] Timesheet Summary calculates utilization rate
- [ ] VAT Report matches ZATCA requirements
- [ ] Company settings appear in all reports
- [ ] PDF export generates correct layout
- [ ] Arabic RTL formatting displays correctly
- [ ] Date filters work for all reports
- [ ] Empty data states handled gracefully
