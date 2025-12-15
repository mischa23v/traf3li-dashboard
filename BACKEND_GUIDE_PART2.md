# Backend Implementation Guide - Part 2
## Features 8-16: Approvals, Receipts, Templates & Notifications

---

## 8. Time Entry Approvals

### Schema: TimeEntry (extend existing)

```javascript
const timeEntrySchema = new mongoose.Schema({
  // ... existing fields ...

  // Approval fields
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'billed', 'locked'],
    default: 'draft'
  },
  submittedAt: Date,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: Date,
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  lockedAt: Date,
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockReason: String
});
```

### Routes

```javascript
// POST /api/time-entries/:id/submit
router.post('/:id/submit', async (req, res) => {
  const entry = await TimeEntry.findById(req.params.id);
  if (entry.status !== 'draft') {
    return res.status(400).json({ error: 'Only draft entries can be submitted' });
  }
  entry.status = 'submitted';
  entry.submittedAt = new Date();
  entry.submittedBy = req.user._id;
  await entry.save();

  // Create notification for manager
  await Notification.create({
    userId: entry.assignedManager,
    type: 'time_entry_submitted',
    title: 'Time Entry Pending Approval',
    message: `${req.user.name} submitted time entry for approval`,
    entityType: 'time_entry',
    entityId: entry._id
  });

  res.json(entry);
});

// POST /api/time-entries/:id/approve
router.post('/:id/approve', requireRole('manager'), async (req, res) => {
  const entry = await TimeEntry.findById(req.params.id);
  if (entry.status !== 'submitted') {
    return res.status(400).json({ error: 'Only submitted entries can be approved' });
  }
  entry.status = 'approved';
  entry.approvedAt = new Date();
  entry.approvedBy = req.user._id;
  await entry.save();

  await Notification.create({
    userId: entry.userId,
    type: 'time_entry_approved',
    title: 'Time Entry Approved',
    message: 'Your time entry has been approved'
  });

  res.json(entry);
});

// POST /api/time-entries/:id/reject
router.post('/:id/reject', requireRole('manager'), async (req, res) => {
  const { reason } = req.body;
  const entry = await TimeEntry.findById(req.params.id);
  entry.status = 'rejected';
  entry.rejectedAt = new Date();
  entry.rejectedBy = req.user._id;
  entry.rejectionReason = reason;
  await entry.save();

  await Notification.create({
    userId: entry.userId,
    type: 'time_entry_rejected',
    title: 'Time Entry Rejected',
    message: `Reason: ${reason}`
  });

  res.json(entry);
});

// POST /api/time-entries/bulk-approve
router.post('/bulk-approve', requireRole('manager'), async (req, res) => {
  const { ids } = req.body;
  await TimeEntry.updateMany(
    { _id: { $in: ids }, status: 'submitted' },
    {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user._id
    }
  );
  res.json({ success: true, count: ids.length });
});

// POST /api/time-entries/:id/lock
router.post('/:id/lock', requireRole('admin'), async (req, res) => {
  const { reason } = req.body;
  const entry = await TimeEntry.findById(req.params.id);
  entry.status = 'locked';
  entry.lockedAt = new Date();
  entry.lockedBy = req.user._id;
  entry.lockReason = reason;
  await entry.save();
  res.json(entry);
});

// GET /api/time-entries/pending-approval
router.get('/pending-approval', requireRole('manager'), async (req, res) => {
  const entries = await TimeEntry.find({ status: 'submitted' })
    .populate('userId', 'name email')
    .populate('matterId', 'title matterNumber')
    .sort({ submittedAt: -1 });
  res.json(entries);
});
```

---

## 9. Payment Receipts

### Schema

```javascript
const paymentReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },

  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  paymentMethod: String,
  paymentDate: Date,

  // Receipt details
  receivedFrom: String,
  description: String,
  bankAccount: String,
  referenceNumber: String,

  // PDF storage
  pdfUrl: String,
  pdfGeneratedAt: Date,

  // Metadata
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate receipt number
paymentReceiptSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.receiptNumber = `RCP-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});
```

### Routes

```javascript
// POST /api/payments/:id/receipt
router.post('/:id/receipt', async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('clientId')
    .populate('invoiceId');

  const receipt = await PaymentReceipt.create({
    paymentId: payment._id,
    invoiceId: payment.invoiceId,
    clientId: payment.clientId._id,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    receivedFrom: payment.clientId.name,
    description: req.body.description,
    bankAccount: payment.bankAccount,
    referenceNumber: payment.referenceNumber,
    generatedBy: req.user._id
  });

  // Generate PDF
  const pdfUrl = await generateReceiptPDF(receipt, payment);
  receipt.pdfUrl = pdfUrl;
  receipt.pdfGeneratedAt = new Date();
  await receipt.save();

  res.json(receipt);
});

// GET /api/receipts/:id/download
router.get('/:id/download', async (req, res) => {
  const receipt = await PaymentReceipt.findById(req.params.id);
  if (!receipt.pdfUrl) {
    return res.status(404).json({ error: 'PDF not generated' });
  }
  res.redirect(receipt.pdfUrl);
});

// Helper: Generate PDF
async function generateReceiptPDF(receipt, payment) {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  const filename = `receipt-${receipt.receiptNumber}.pdf`;

  // Add receipt content
  doc.fontSize(20).text('PAYMENT RECEIPT', { align: 'center' });
  doc.fontSize(12).text(`Receipt No: ${receipt.receiptNumber}`);
  doc.text(`Date: ${receipt.paymentDate.toLocaleDateString()}`);
  doc.text(`Received From: ${receipt.receivedFrom}`);
  doc.text(`Amount: ${receipt.currency} ${receipt.amount.toFixed(2)}`);
  doc.text(`Payment Method: ${receipt.paymentMethod}`);
  if (receipt.referenceNumber) {
    doc.text(`Reference: ${receipt.referenceNumber}`);
  }

  doc.end();

  // Upload to S3 or save locally
  // Return URL
  return `/uploads/receipts/${filename}`;
}
```

---

## 10. Invoice Approvals

### Schema

```javascript
const invoiceApprovalSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },

  // Workflow
  currentLevel: { type: Number, default: 1 },
  maxLevel: { type: Number, default: 2 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'escalated'],
    default: 'pending'
  },

  // Approvers
  approvers: [{
    level: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    actionAt: Date,
    comments: String
  }],

  // Escalation
  escalatedAt: Date,
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  escalationReason: String,

  // Dates
  submittedAt: { type: Date, default: Date.now },
  completedAt: Date
});

// Extend Invoice schema
const invoiceSchema = {
  // ... existing fields ...
  approvalRequired: { type: Boolean, default: false },
  approvalStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'InvoiceApproval' }
};
```

### Routes

```javascript
// POST /api/invoices/:id/submit-for-approval
router.post('/:id/submit-for-approval', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  // Determine approval levels based on amount
  let maxLevel = 1;
  if (invoice.total >= 50000) maxLevel = 3;
  else if (invoice.total >= 10000) maxLevel = 2;

  // Get approvers
  const approvers = await getApproversForLevels(maxLevel, invoice.organizationId);

  const approval = await InvoiceApproval.create({
    invoiceId: invoice._id,
    maxLevel,
    approvers: approvers.map((u, i) => ({
      level: i + 1,
      userId: u._id,
      status: 'pending'
    }))
  });

  invoice.approvalRequired = true;
  invoice.approvalStatus = 'pending';
  invoice.approvalId = approval._id;
  await invoice.save();

  // Notify first approver
  await Notification.create({
    userId: approvers[0]._id,
    type: 'invoice_approval_required',
    title: 'Invoice Pending Approval',
    message: `Invoice ${invoice.invoiceNumber} requires your approval`,
    entityType: 'invoice',
    entityId: invoice._id
  });

  res.json(approval);
});

// POST /api/invoice-approvals/:id/approve
router.post('/:id/approve', async (req, res) => {
  const { comments } = req.body;
  const approval = await InvoiceApproval.findById(req.params.id);

  // Find current approver
  const approver = approval.approvers.find(
    a => a.level === approval.currentLevel && a.userId.equals(req.user._id)
  );

  if (!approver) {
    return res.status(403).json({ error: 'Not authorized to approve' });
  }

  approver.status = 'approved';
  approver.actionAt = new Date();
  approver.comments = comments;

  // Check if more levels needed
  if (approval.currentLevel < approval.maxLevel) {
    approval.currentLevel += 1;

    // Notify next approver
    const nextApprover = approval.approvers.find(a => a.level === approval.currentLevel);
    await Notification.create({
      userId: nextApprover.userId,
      type: 'invoice_approval_required',
      title: 'Invoice Pending Your Approval'
    });
  } else {
    // Fully approved
    approval.status = 'approved';
    approval.completedAt = new Date();

    await Invoice.findByIdAndUpdate(approval.invoiceId, {
      approvalStatus: 'approved',
      status: 'approved'
    });
  }

  await approval.save();
  res.json(approval);
});

// POST /api/invoice-approvals/:id/reject
router.post('/:id/reject', async (req, res) => {
  const { reason } = req.body;
  const approval = await InvoiceApproval.findById(req.params.id);

  approval.status = 'rejected';
  approval.completedAt = new Date();

  const approver = approval.approvers.find(
    a => a.level === approval.currentLevel && a.userId.equals(req.user._id)
  );
  approver.status = 'rejected';
  approver.actionAt = new Date();
  approver.comments = reason;

  await approval.save();

  await Invoice.findByIdAndUpdate(approval.invoiceId, {
    approvalStatus: 'rejected'
  });

  res.json(approval);
});

// GET /api/invoice-approvals/pending
router.get('/pending', async (req, res) => {
  const approvals = await InvoiceApproval.find({
    status: 'pending',
    'approvers': {
      $elemMatch: {
        userId: req.user._id,
        status: 'pending'
      }
    }
  }).populate('invoiceId');

  res.json(approvals);
});
```

---

## 11. GL/Journal Entries

### Schema

```javascript
const journalEntrySchema = new mongoose.Schema({
  entryNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },

  // Entry type
  entryType: {
    type: String,
    enum: ['standard', 'adjusting', 'closing', 'reversing', 'opening'],
    default: 'standard'
  },

  // Lines (debits and credits)
  lines: [{
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
    description: String,
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    costCenter: String,
    department: String
  }],

  // Totals
  totalDebit: { type: Number, required: true },
  totalCredit: { type: Number, required: true },

  // Reference
  reference: String,
  memo: String,

  // Source document
  sourceType: String, // 'invoice', 'payment', 'expense', 'manual'
  sourceId: mongoose.Schema.Types.ObjectId,

  // Status
  status: {
    type: String,
    enum: ['draft', 'posted', 'reversed'],
    default: 'draft'
  },
  postedAt: Date,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Reversal
  reversedAt: Date,
  reversedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reversalEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' },

  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });

// Validate balanced entry
journalEntrySchema.pre('save', function(next) {
  const totalDebit = this.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = this.lines.reduce((sum, l) => sum + l.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return next(new Error('Journal entry must be balanced'));
  }

  this.totalDebit = totalDebit;
  this.totalCredit = totalCredit;
  next();
});
```

### Routes

```javascript
// POST /api/journal-entries
router.post('/', async (req, res) => {
  const { date, entryType, lines, reference, memo } = req.body;

  // Validate accounts exist
  const accountIds = lines.map(l => l.accountId);
  const accounts = await ChartOfAccount.find({ _id: { $in: accountIds } });
  if (accounts.length !== accountIds.length) {
    return res.status(400).json({ error: 'Invalid account reference' });
  }

  // Generate entry number
  const count = await JournalEntry.countDocuments({ organizationId: req.user.organizationId });
  const year = new Date().getFullYear();
  const entryNumber = `JE-${year}-${String(count + 1).padStart(5, '0')}`;

  const entry = await JournalEntry.create({
    entryNumber,
    date,
    entryType,
    lines,
    reference,
    memo,
    createdBy: req.user._id,
    organizationId: req.user.organizationId
  });

  res.status(201).json(entry);
});

// POST /api/journal-entries/:id/post
router.post('/:id/post', async (req, res) => {
  const entry = await JournalEntry.findById(req.params.id);

  if (entry.status !== 'draft') {
    return res.status(400).json({ error: 'Only draft entries can be posted' });
  }

  // Check fiscal period is open
  const fiscalPeriod = await FiscalPeriod.findOne({
    organizationId: entry.organizationId,
    startDate: { $lte: entry.date },
    endDate: { $gte: entry.date }
  });

  if (!fiscalPeriod || fiscalPeriod.status !== 'open') {
    return res.status(400).json({ error: 'Cannot post to closed fiscal period' });
  }

  // Update account balances
  for (const line of entry.lines) {
    const account = await ChartOfAccount.findById(line.accountId);
    const isDebitAccount = ['asset', 'expense'].includes(account.accountType);

    if (isDebitAccount) {
      account.balance += line.debit - line.credit;
    } else {
      account.balance += line.credit - line.debit;
    }
    await account.save();
  }

  entry.status = 'posted';
  entry.postedAt = new Date();
  entry.postedBy = req.user._id;
  await entry.save();

  res.json(entry);
});

// POST /api/journal-entries/:id/reverse
router.post('/:id/reverse', async (req, res) => {
  const entry = await JournalEntry.findById(req.params.id);

  if (entry.status !== 'posted') {
    return res.status(400).json({ error: 'Only posted entries can be reversed' });
  }

  // Create reversal entry
  const reversalLines = entry.lines.map(l => ({
    accountId: l.accountId,
    description: `Reversal: ${l.description}`,
    debit: l.credit,
    credit: l.debit
  }));

  const count = await JournalEntry.countDocuments({ organizationId: entry.organizationId });
  const year = new Date().getFullYear();

  const reversalEntry = await JournalEntry.create({
    entryNumber: `JE-${year}-${String(count + 1).padStart(5, '0')}`,
    date: new Date(),
    entryType: 'reversing',
    lines: reversalLines,
    reference: `Reversal of ${entry.entryNumber}`,
    memo: req.body.reason,
    sourceType: 'journal_entry',
    sourceId: entry._id,
    status: 'posted',
    postedAt: new Date(),
    postedBy: req.user._id,
    createdBy: req.user._id,
    organizationId: entry.organizationId
  });

  // Update original entry
  entry.status = 'reversed';
  entry.reversedAt = new Date();
  entry.reversedBy = req.user._id;
  entry.reversalEntryId = reversalEntry._id;
  await entry.save();

  // Reverse account balances
  for (const line of entry.lines) {
    const account = await ChartOfAccount.findById(line.accountId);
    const isDebitAccount = ['asset', 'expense'].includes(account.accountType);

    if (isDebitAccount) {
      account.balance -= line.debit - line.credit;
    } else {
      account.balance -= line.credit - line.debit;
    }
    await account.save();
  }

  res.json({ original: entry, reversal: reversalEntry });
});

// GET /api/general-ledger
router.get('/general-ledger', async (req, res) => {
  const { accountId, startDate, endDate } = req.query;

  const query = {
    organizationId: req.user.organizationId,
    status: 'posted',
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  if (accountId) {
    query['lines.accountId'] = accountId;
  }

  const entries = await JournalEntry.find(query)
    .populate('lines.accountId', 'accountNumber accountName')
    .sort({ date: 1 });

  // Calculate running balances
  const ledger = [];
  let runningBalance = 0;

  for (const entry of entries) {
    for (const line of entry.lines) {
      if (!accountId || line.accountId._id.equals(accountId)) {
        runningBalance += line.debit - line.credit;
        ledger.push({
          date: entry.date,
          entryNumber: entry.entryNumber,
          description: line.description,
          debit: line.debit,
          credit: line.credit,
          balance: runningBalance
        });
      }
    }
  }

  res.json(ledger);
});
```

---

## 12. Payment Terms Templates

### Schema

```javascript
const paymentTermsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: String,
  code: { type: String, required: true, unique: true },
  description: String,

  // Terms configuration
  dueDays: { type: Number, required: true }, // Days until due
  discountDays: Number, // Days for early payment discount
  discountPercent: Number, // Early payment discount %

  // Penalty
  latePenaltyPercent: Number,
  gracePeriodDays: { type: Number, default: 0 },

  // Type
  termType: {
    type: String,
    enum: ['net', 'due_on_receipt', 'end_of_month', 'custom'],
    default: 'net'
  },

  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });
```

### Routes

```javascript
// GET /api/payment-terms
router.get('/', async (req, res) => {
  const terms = await PaymentTerms.find({
    organizationId: req.user.organizationId,
    isActive: true
  }).sort({ name: 1 });
  res.json(terms);
});

// POST /api/payment-terms
router.post('/', async (req, res) => {
  const term = await PaymentTerms.create({
    ...req.body,
    organizationId: req.user.organizationId
  });
  res.status(201).json(term);
});

// PUT /api/payment-terms/:id
router.put('/:id', async (req, res) => {
  const term = await PaymentTerms.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(term);
});

// POST /api/payment-terms/:id/set-default
router.post('/:id/set-default', async (req, res) => {
  await PaymentTerms.updateMany(
    { organizationId: req.user.organizationId },
    { isDefault: false }
  );

  const term = await PaymentTerms.findByIdAndUpdate(
    req.params.id,
    { isDefault: true },
    { new: true }
  );
  res.json(term);
});

// Helper: Calculate due date
function calculateDueDate(invoiceDate, paymentTerms) {
  const date = new Date(invoiceDate);

  switch (paymentTerms.termType) {
    case 'due_on_receipt':
      return date;
    case 'end_of_month':
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    case 'net':
    default:
      date.setDate(date.getDate() + paymentTerms.dueDays);
      return date;
  }
}
```

---

## 13. Expense Policies

### Schema

```javascript
const expensePolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: String,
  description: String,

  // Category limits
  categoryLimits: [{
    category: String,
    dailyLimit: Number,
    monthlyLimit: Number,
    perTransactionLimit: Number,
    requiresReceipt: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: true }
  }],

  // Global limits
  dailyLimit: Number,
  monthlyLimit: Number,

  // Approval thresholds
  approvalThresholds: [{
    minAmount: Number,
    maxAmount: Number,
    approverRole: String, // 'manager', 'director', 'cfo'
    approverUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Receipt requirements
  receiptRequiredAbove: { type: Number, default: 50 },

  // Applies to
  appliesTo: {
    type: String,
    enum: ['all', 'department', 'role', 'user'],
    default: 'all'
  },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  roleId: String,
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });
```

### Routes

```javascript
// GET /api/expense-policies
router.get('/', async (req, res) => {
  const policies = await ExpensePolicy.find({
    organizationId: req.user.organizationId,
    isActive: true
  });
  res.json(policies);
});

// POST /api/expense-policies
router.post('/', requireRole('admin'), async (req, res) => {
  const policy = await ExpensePolicy.create({
    ...req.body,
    organizationId: req.user.organizationId
  });
  res.status(201).json(policy);
});

// PUT /api/expense-policies/:id
router.put('/:id', requireRole('admin'), async (req, res) => {
  const policy = await ExpensePolicy.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(policy);
});

// POST /api/expenses/:id/validate-policy
router.post('/:id/validate-policy', async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  const policy = await getApplicablePolicy(req.user);

  const violations = [];

  // Check category limit
  const categoryLimit = policy.categoryLimits.find(
    c => c.category === expense.category
  );

  if (categoryLimit) {
    if (expense.amount > categoryLimit.perTransactionLimit) {
      violations.push({
        type: 'per_transaction_limit',
        message: `Exceeds per-transaction limit of ${categoryLimit.perTransactionLimit}`
      });
    }

    // Check daily total
    const dailyTotal = await Expense.aggregate([
      {
        $match: {
          userId: expense.userId,
          category: expense.category,
          date: {
            $gte: new Date(expense.date.setHours(0,0,0,0)),
            $lte: new Date(expense.date.setHours(23,59,59,999))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    if (dailyTotal[0]?.total > categoryLimit.dailyLimit) {
      violations.push({
        type: 'daily_limit',
        message: `Exceeds daily limit of ${categoryLimit.dailyLimit}`
      });
    }
  }

  // Check receipt requirement
  if (expense.amount > policy.receiptRequiredAbove && !expense.receiptUrl) {
    violations.push({
      type: 'receipt_required',
      message: `Receipt required for expenses over ${policy.receiptRequiredAbove}`
    });
  }

  res.json({
    valid: violations.length === 0,
    violations,
    requiresApproval: expense.amount > categoryLimit?.perTransactionLimit
  });
});

async function getApplicablePolicy(user) {
  // Try user-specific policy
  let policy = await ExpensePolicy.findOne({
    organizationId: user.organizationId,
    appliesTo: 'user',
    userIds: user._id,
    isActive: true
  });

  if (!policy) {
    // Try department policy
    policy = await ExpensePolicy.findOne({
      organizationId: user.organizationId,
      appliesTo: 'department',
      departmentId: user.departmentId,
      isActive: true
    });
  }

  if (!policy) {
    // Fall back to global policy
    policy = await ExpensePolicy.findOne({
      organizationId: user.organizationId,
      appliesTo: 'all',
      isActive: true
    });
  }

  return policy;
}
```

---

## 14. Corporate Card Reconciliation

### Schema

```javascript
const corporateCardSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true }, // Last 4 digits only
  cardName: { type: String, required: true },
  cardType: { type: String, enum: ['visa', 'mastercard', 'amex', 'mada'] },

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: String,

  // Limits
  monthlyLimit: Number,
  transactionLimit: Number,

  // Bank info
  bankName: String,
  bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },

  isActive: { type: Boolean, default: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });

const cardTransactionSchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'CorporateCard', required: true },

  // Transaction details
  transactionDate: { type: Date, required: true },
  postDate: Date,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  merchant: String,
  merchantCategory: String,
  description: String,
  referenceNumber: String,

  // Reconciliation
  status: {
    type: String,
    enum: ['pending', 'matched', 'unmatched', 'disputed'],
    default: 'pending'
  },
  matchedExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  matchedAt: Date,
  matchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Import source
  importBatchId: String,
  importedAt: Date,

  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });
```

### Routes

```javascript
// GET /api/corporate-cards
router.get('/', async (req, res) => {
  const cards = await CorporateCard.find({
    organizationId: req.user.organizationId
  }).populate('assignedTo', 'name email');
  res.json(cards);
});

// POST /api/corporate-cards
router.post('/', requireRole('admin'), async (req, res) => {
  const card = await CorporateCard.create({
    ...req.body,
    organizationId: req.user.organizationId
  });
  res.status(201).json(card);
});

// POST /api/corporate-cards/:id/import-transactions
router.post('/:id/import-transactions', async (req, res) => {
  const { transactions } = req.body; // Array of transactions from CSV
  const batchId = `IMPORT-${Date.now()}`;

  const imported = await CardTransaction.insertMany(
    transactions.map(t => ({
      cardId: req.params.id,
      transactionDate: new Date(t.date),
      amount: parseFloat(t.amount),
      merchant: t.merchant,
      description: t.description,
      referenceNumber: t.reference,
      importBatchId: batchId,
      importedAt: new Date(),
      organizationId: req.user.organizationId
    }))
  );

  res.json({ imported: imported.length, batchId });
});

// GET /api/card-transactions/unmatched
router.get('/unmatched', async (req, res) => {
  const transactions = await CardTransaction.find({
    organizationId: req.user.organizationId,
    status: 'pending'
  })
    .populate('cardId', 'cardNumber cardName')
    .sort({ transactionDate: -1 });
  res.json(transactions);
});

// POST /api/card-transactions/:id/match
router.post('/:id/match', async (req, res) => {
  const { expenseId } = req.body;

  const transaction = await CardTransaction.findById(req.params.id);
  const expense = await Expense.findById(expenseId);

  // Validate amounts match (within tolerance)
  if (Math.abs(transaction.amount - expense.amount) > 0.01) {
    return res.status(400).json({ error: 'Amount mismatch' });
  }

  transaction.status = 'matched';
  transaction.matchedExpenseId = expense._id;
  transaction.matchedAt = new Date();
  transaction.matchedBy = req.user._id;
  await transaction.save();

  expense.cardTransactionId = transaction._id;
  expense.reconciled = true;
  await expense.save();

  res.json(transaction);
});

// POST /api/card-transactions/:id/create-expense
router.post('/:id/create-expense', async (req, res) => {
  const transaction = await CardTransaction.findById(req.params.id)
    .populate('cardId');

  const expense = await Expense.create({
    amount: transaction.amount,
    currency: transaction.currency,
    date: transaction.transactionDate,
    vendor: transaction.merchant,
    description: transaction.description,
    category: req.body.category || 'other',
    paymentMethod: 'corporate_card',
    cardTransactionId: transaction._id,
    userId: transaction.cardId.assignedTo,
    organizationId: transaction.organizationId,
    reconciled: true
  });

  transaction.status = 'matched';
  transaction.matchedExpenseId = expense._id;
  transaction.matchedAt = new Date();
  transaction.matchedBy = req.user._id;
  await transaction.save();

  res.json({ expense, transaction });
});

// POST /api/card-transactions/auto-match
router.post('/auto-match', async (req, res) => {
  const pendingTransactions = await CardTransaction.find({
    organizationId: req.user.organizationId,
    status: 'pending'
  });

  let matched = 0;

  for (const transaction of pendingTransactions) {
    // Find matching expense by amount, date, and card
    const expense = await Expense.findOne({
      organizationId: transaction.organizationId,
      amount: transaction.amount,
      date: {
        $gte: new Date(transaction.transactionDate.getTime() - 3*24*60*60*1000),
        $lte: new Date(transaction.transactionDate.getTime() + 3*24*60*60*1000)
      },
      cardTransactionId: { $exists: false }
    });

    if (expense) {
      transaction.status = 'matched';
      transaction.matchedExpenseId = expense._id;
      transaction.matchedAt = new Date();
      await transaction.save();

      expense.cardTransactionId = transaction._id;
      expense.reconciled = true;
      await expense.save();

      matched++;
    }
  }

  res.json({ matched, total: pendingTransactions.length });
});
```

---

## 15. Time Entry Locking

Already covered in Feature 8. Additional helper:

```javascript
// Cron job to lock entries for closed periods
const cron = require('node-cron');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  // Find closed fiscal periods
  const closedPeriods = await FiscalPeriod.find({ status: 'closed' });

  for (const period of closedPeriods) {
    // Lock all approved entries in this period
    await TimeEntry.updateMany(
      {
        date: { $gte: period.startDate, $lte: period.endDate },
        status: 'approved',
        lockedAt: { $exists: false }
      },
      {
        status: 'locked',
        lockedAt: new Date(),
        lockReason: `Period closed: ${period.name}`
      }
    );
  }
});
```

---

## 16. Notifications System

### Schema

```javascript
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Content
  type: { type: String, required: true },
  title: { type: String, required: true },
  titleAr: String,
  message: { type: String, required: true },
  messageAr: String,

  // Entity reference
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  actionUrl: String,

  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,

  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Delivery
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push']
  }],
  emailSentAt: Date,
  smsSentAt: Date,

  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
}, { timestamps: true });

const notificationSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Channel preferences
  emailEnabled: { type: Boolean, default: true },
  smsEnabled: { type: Boolean, default: false },
  pushEnabled: { type: Boolean, default: true },
  inAppEnabled: { type: Boolean, default: true },

  // Type preferences
  preferences: [{
    type: String,
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
  }]
}, { timestamps: true });
```

### Routes

```javascript
// GET /api/notifications
router.get('/', async (req, res) => {
  const { unreadOnly, limit = 20, offset = 0 } = req.query;

  const query = { userId: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit));

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false
  });

  res.json({ notifications, unreadCount });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  res.json(notification);
});

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  res.json({ success: true });
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// GET /api/notification-settings
router.get('/settings', async (req, res) => {
  let settings = await NotificationSettings.findOne({ userId: req.user._id });
  if (!settings) {
    settings = await NotificationSettings.create({ userId: req.user._id });
  }
  res.json(settings);
});

// PUT /api/notification-settings
router.put('/settings', async (req, res) => {
  const settings = await NotificationSettings.findOneAndUpdate(
    { userId: req.user._id },
    req.body,
    { new: true, upsert: true }
  );
  res.json(settings);
});

// Helper: Create notification with delivery
async function createNotification(data) {
  const notification = await Notification.create(data);

  // Get user settings
  const settings = await NotificationSettings.findOne({ userId: data.userId });

  // Send via enabled channels
  if (settings?.emailEnabled) {
    await sendEmailNotification(notification);
    notification.emailSentAt = new Date();
  }

  if (settings?.smsEnabled && notification.priority === 'urgent') {
    await sendSMSNotification(notification);
    notification.smsSentAt = new Date();
  }

  await notification.save();

  // Emit real-time event (Socket.IO)
  io.to(`user:${data.userId}`).emit('notification', notification);

  return notification;
}
```

---

## Environment Variables

Add to `.env`:

```env
# PDF Generation
PDF_STORAGE_PATH=/uploads/receipts

# Notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=your-password
SMS_API_KEY=your-sms-api-key

# Socket.IO (for real-time notifications)
SOCKET_IO_ENABLED=true

# Cron Jobs
ENABLE_CRON_JOBS=true
```

---

## Quick API Reference

| Feature | Endpoints |
|---------|-----------|
| Time Entry Approvals | POST `/api/time-entries/:id/submit`, `/approve`, `/reject`, `/lock` |
| Payment Receipts | POST `/api/payments/:id/receipt`, GET `/api/receipts/:id/download` |
| Invoice Approvals | POST `/api/invoices/:id/submit-for-approval`, `/api/invoice-approvals/:id/approve` |
| Journal Entries | POST `/api/journal-entries`, `/:id/post`, `/:id/reverse` |
| General Ledger | GET `/api/general-ledger` |
| Payment Terms | GET/POST/PUT `/api/payment-terms` |
| Expense Policies | GET/POST/PUT `/api/expense-policies` |
| Corporate Cards | GET/POST `/api/corporate-cards`, POST `/:id/import-transactions` |
| Card Transactions | GET `/api/card-transactions/unmatched`, POST `/:id/match` |
| Notifications | GET `/api/notifications`, PUT `/:id/read`, `/mark-all-read` |
