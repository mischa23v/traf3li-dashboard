# Traf3li Dashboard - Backend Implementation Guide

## Overview

This document provides comprehensive backend implementation details for the Traf3li Legal ERP Dashboard. The frontend is built with React 19, TypeScript, and TanStack Router. The backend should be built with Node.js, Express, and MongoDB.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Database Schemas](#database-schemas)
3. [API Routes](#api-routes)
4. [Controllers](#controllers)
5. [Middleware](#middleware)
6. [Services](#services)
7. [Environment Variables](#environment-variables)
8. [ZATCA Integration](#zatca-integration)

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── redis.js             # Redis for caching
│   │   └── zatca.js             # ZATCA configuration
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Case.js
│   │   ├── Invoice.js
│   │   ├── Payment.js
│   │   ├── Expense.js
│   │   ├── TimeEntry.js
│   │   ├── Task.js
│   │   ├── Reminder.js
│   │   ├── Event.js
│   │   ├── Document.js
│   │   ├── Employee.js
│   │   ├── Vendor.js
│   │   └── BankAccount.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── clients.js
│   │   ├── cases.js
│   │   ├── invoices.js
│   │   ├── payments.js
│   │   ├── expenses.js
│   │   ├── timeEntries.js
│   │   ├── tasks.js
│   │   ├── reminders.js
│   │   ├── events.js
│   │   └── documents.js
│   ├── controllers/
│   │   └── [corresponding controllers]
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Request validation
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── upload.js            # File uploads
│   ├── services/
│   │   ├── zatcaService.js      # ZATCA e-invoicing
│   │   ├── emailService.js      # Email notifications
│   │   ├── pdfService.js        # PDF generation
│   │   └── storageService.js    # File storage
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   └── app.js                   # Express app setup
├── .env
├── .env.example
└── package.json
```

---

## Database Schemas

### 1. User Schema

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true, select: false },
  avatar: String,

  // Role & Permissions
  role: {
    type: String,
    enum: ['admin', 'lawyer', 'paralegal', 'assistant', 'accountant', 'hr'],
    default: 'lawyer'
  },
  permissions: [String],

  // Organization
  departmentId: String,
  locationId: String,
  specialization: String,
  barNumber: String,

  // Billing
  hourlyRate: { type: Number, default: 0 },
  billingTarget: { type: Number, default: 0 },

  // Status
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  lastLogin: Date,

  // Settings
  language: { type: String, default: 'ar' },
  timezone: { type: String, default: 'Asia/Riyadh' },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
```

### 2. Client Schema

```javascript
// models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Basic Info
  clientNumber: { type: String, unique: true, required: true },
  clientType: { type: String, enum: ['individual', 'corporate', 'government'], required: true },

  // Individual fields
  firstName: String,
  lastName: String,
  nationalId: String,

  // Corporate fields
  companyName: String,
  companyNameEn: String,
  commercialRegistration: String,
  vatNumber: String,

  // Contact
  email: { type: String, required: true },
  phone: { type: String, required: true },
  mobile: String,
  fax: String,
  website: String,

  // Address
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: { type: String, default: 'SA' },
    buildingNumber: String,
    additionalNumber: String
  },

  // Billing
  billingArrangement: {
    type: String,
    enum: ['hourly', 'flat_fee', 'contingency', 'blended', 'monthly_retainer'],
    default: 'hourly'
  },
  defaultHourlyRate: Number,
  paymentTerms: { type: String, default: 'net_30' },
  creditLimit: { type: Number, default: 0 },
  creditBalance: { type: Number, default: 0 },

  // Relationships
  responsibleAttorneyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originatingAttorneyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Status
  status: { type: String, enum: ['active', 'inactive', 'prospect', 'archived'], default: 'active' },
  source: String,
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },

  // Notes
  notes: String,
  tags: [String],

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate client number
clientSchema.pre('save', async function(next) {
  if (this.isNew && !this.clientNumber) {
    const count = await this.constructor.countDocuments() + 1;
    this.clientNumber = `CLT-${String(count).padStart(5, '0')}`;
  }
  next();
});

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  if (this.clientType === 'individual') {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.companyName;
});

module.exports = mongoose.model('Client', clientSchema);
```

### 3. Case Schema

```javascript
// models/Case.js
const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  // Basic Info
  caseNumber: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: String,

  // Classification
  caseType: {
    type: String,
    enum: ['litigation', 'consultation', 'contract', 'corporate', 'real_estate', 'labor', 'criminal', 'family', 'arbitration', 'other'],
    required: true
  },
  practiceArea: String,
  subCategory: String,

  // Court Info (for litigation)
  courtName: String,
  courtCaseNumber: String,
  courtBranch: String,
  judge: String,

  // Relationships
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  opposingParty: String,
  opposingCounsel: String,

  // Team
  responsibleAttorneyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Dates
  openDate: { type: Date, default: Date.now },
  closeDate: Date,
  statuteOfLimitations: Date,
  nextHearingDate: Date,

  // Status
  status: {
    type: String,
    enum: ['active', 'pending', 'on_hold', 'closed', 'won', 'lost', 'settled', 'dismissed'],
    default: 'active'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },

  // Billing
  billingArrangement: {
    type: String,
    enum: ['hourly', 'flat_fee', 'contingency', 'blended', 'monthly_retainer'],
    default: 'hourly'
  },
  budget: { type: Number, default: 0 },
  estimatedValue: Number,

  // Organization
  departmentId: String,
  locationId: String,

  // Notes
  notes: String,
  tags: [String],

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate case number
caseSchema.pre('save', async function(next) {
  if (this.isNew && !this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments() + 1;
    this.caseNumber = `CASE-${year}-${String(count).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);
```

### 4. Invoice Schema

```javascript
// models/Invoice.js
const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['time', 'expense', 'flat_fee', 'product', 'discount', 'subtotal', 'comment'] },
  date: Date,
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'] },
  discountValue: { type: Number, default: 0 },
  lineTotal: { type: Number, default: 0 },
  taxable: { type: Boolean, default: true },
  attorneyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activityCode: String,
  timeEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeEntry' },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }
});

const invoiceSchema = new mongoose.Schema({
  // Basic Info
  invoiceNumber: { type: String, unique: true, required: true },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void', 'written_off'],
    default: 'draft'
  },

  // Client & Case
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientType: { type: String, enum: ['individual', 'corporate', 'government'] },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },

  // Dates
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paidAt: Date,
  sentAt: Date,
  viewedAt: Date,

  // Payment Terms
  paymentTerms: {
    type: String,
    enum: ['due_on_receipt', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'eom', 'custom'],
    default: 'net_30'
  },

  // Currency
  currency: { type: String, default: 'SAR' },
  exchangeRate: { type: Number, default: 1 },

  // Organization (for firms)
  departmentId: String,
  locationId: String,
  responsibleAttorneyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  billingArrangement: String,
  customerPONumber: String,
  matterNumber: String,

  // Line Items
  items: [lineItemSchema],

  // Totals
  subtotal: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'] },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxableAmount: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0.15 },
  vatAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },

  // Payments
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  paymentHistory: [{
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: Number,
    date: Date,
    method: String
  }],

  // Retainer
  applyFromRetainer: { type: Number, default: 0 },

  // Payment Plan
  enablePaymentPlan: { type: Boolean, default: false },
  installments: Number,
  installmentFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'] },
  installmentSchedule: [{
    dueDate: Date,
    amount: Number,
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' }
  }],

  // Bank Info
  bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  paymentInstructions: String,
  enableOnlinePayment: { type: Boolean, default: false },
  onlinePaymentUrl: String,

  // ZATCA
  zatcaCompliant: { type: Boolean, default: false },
  invoiceSubtype: { type: String, enum: ['0100000', '0200000'], default: '0200000' },
  zatcaHash: String,
  zatcaQRCode: String,
  zatcaSubmissionId: String,
  zatcaStatus: { type: String, enum: ['pending', 'submitted', 'accepted', 'rejected'] },
  clientVATNumber: String,
  clientCR: String,

  // WIP (for firms)
  wipAmount: { type: Number, default: 0 },
  writeOffAmount: { type: Number, default: 0 },
  writeDownAmount: { type: Number, default: 0 },
  adjustmentReason: String,

  // Approval (for large firms)
  requiresApproval: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,

  // Notes
  customerNotes: String,
  internalNotes: String,
  termsAndConditions: String,

  // Email
  emailTemplate: String,
  emailSubject: String,
  lastSentAt: Date,
  emailHistory: [{
    sentAt: Date,
    to: String,
    subject: String,
    status: String
  }],

  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
invoiceSchema.index({ clientId: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
invoiceSchema.index({ caseId: 1 });

// Pre-save calculations
invoiceSchema.pre('save', function(next) {
  // Calculate line totals
  this.subtotal = this.items.reduce((sum, item) => {
    let lineTotal = item.quantity * item.unitPrice;
    if (item.discountValue) {
      if (item.discountType === 'percentage') {
        lineTotal -= lineTotal * (item.discountValue / 100);
      } else {
        lineTotal -= item.discountValue;
      }
    }
    item.lineTotal = lineTotal;
    return sum + lineTotal;
  }, 0);

  // Calculate invoice discount
  if (this.discountType === 'percentage') {
    this.discountAmount = this.subtotal * (this.discountValue / 100);
  } else {
    this.discountAmount = this.discountValue || 0;
  }

  // Calculate VAT
  this.taxableAmount = this.subtotal - this.discountAmount;
  this.vatAmount = this.taxableAmount * this.vatRate;

  // Calculate total
  this.totalAmount = this.taxableAmount + this.vatAmount;

  // Calculate balance due
  this.balanceDue = this.totalAmount - this.amountPaid - this.applyFromRetainer;

  // Update status based on payments
  if (this.balanceDue <= 0 && this.amountPaid > 0) {
    this.status = 'paid';
    if (!this.paidAt) this.paidAt = new Date();
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  } else if (this.dueDate < new Date() && this.status !== 'void' && this.status !== 'draft') {
    this.status = 'overdue';
  }

  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
```

### 5. Payment Schema

```javascript
// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Basic Info
  paymentNumber: { type: String, required: true, unique: true, index: true },
  paymentType: {
    type: String,
    enum: ['customer_payment', 'vendor_payment', 'refund', 'transfer', 'advance', 'retainer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded', 'reconciled'],
    default: 'pending'
  },
  paymentDate: { type: Date, required: true },
  referenceNumber: String,

  // Amount
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'SAR' },
  exchangeRate: { type: Number, default: 1 },
  amountInBaseCurrency: Number,

  // Customer/Vendor Reference
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },

  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'sarie', 'check', 'credit_card', 'mada', 'tabby', 'tamara', 'stc_pay', 'apple_pay'],
    required: true
  },
  bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },

  // Check Details
  checkDetails: {
    checkNumber: String,
    checkDate: Date,
    checkBank: String,
    checkBranch: String,
    checkStatus: {
      type: String,
      enum: ['received', 'deposited', 'cleared', 'bounced', 'cancelled'],
      default: 'received'
    },
    checkDepositDate: Date,
    bouncedDate: Date,
    bouncedReason: String
  },

  // Card Details
  cardDetails: {
    lastFour: String,
    cardType: { type: String, enum: ['visa', 'mastercard', 'amex', 'mada'] },
    authCode: String,
    transactionId: String,
    terminalId: String
  },

  // Invoice Applications
  invoiceApplications: [{
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true, min: 0 },
    appliedAt: { type: Date, default: Date.now }
  }],

  // Fees
  fees: {
    bankFees: { type: Number, default: 0 },
    processingFees: { type: Number, default: 0 },
    otherFees: { type: Number, default: 0 },
    totalFees: { type: Number, default: 0 },
    paidBy: { type: String, enum: ['office', 'client'], default: 'office' }
  },

  // Overpayment/Underpayment
  overpaymentAction: { type: String, enum: ['credit', 'refund', 'hold'] },
  underpaymentAction: { type: String, enum: ['write_off', 'leave_open', 'credit'] },
  writeOffReason: String,
  unappliedAmount: { type: Number, default: 0 },

  // Refund Details
  refundDetails: {
    originalPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    reason: String,
    method: { type: String, enum: ['original', 'cash', 'bank_transfer'] }
  },

  // Reconciliation
  reconciliation: {
    isReconciled: { type: Boolean, default: false },
    reconciledDate: Date,
    reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bankStatementRef: String
  },

  // Organization
  departmentId: String,
  locationId: String,
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Notes
  customerNotes: String,
  internalNotes: String,
  memo: String,

  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
paymentSchema.index({ customerId: 1, paymentDate: -1 });
paymentSchema.index({ vendorId: 1, paymentDate: -1 });
paymentSchema.index({ status: 1, paymentDate: -1 });
paymentSchema.index({ 'checkDetails.checkStatus': 1 });
paymentSchema.index({ 'reconciliation.isReconciled': 1 });

// Pre-save hook
paymentSchema.pre('save', async function(next) {
  // Generate payment number
  if (this.isNew && !this.paymentNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.paymentNumber = `PAY-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  // Calculate amount in base currency
  this.amountInBaseCurrency = this.amount * (this.exchangeRate || 1);

  // Calculate total fees
  if (this.fees) {
    this.fees.totalFees = (this.fees.bankFees || 0) + (this.fees.processingFees || 0) + (this.fees.otherFees || 0);
  }

  // Calculate unapplied amount
  const appliedTotal = this.invoiceApplications.reduce((sum, app) => sum + app.amount, 0);
  this.unappliedAmount = this.amount - appliedTotal;

  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
```

### 6. TimeEntry Schema

```javascript
// models/TimeEntry.js
const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  // References
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },

  // Time
  date: { type: Date, required: true },
  startTime: Date,
  endTime: Date,
  duration: { type: Number, required: true, min: 0 }, // in hours

  // Description
  description: { type: String, required: true },
  activityCode: String, // UTBMS codes (L110, L120, etc.)

  // Billing
  billable: { type: Boolean, default: true },
  billed: { type: Boolean, default: false },
  hourlyRate: { type: Number, required: true },
  amount: { type: Number, default: 0 },

  // Invoice Reference
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  invoicedAt: Date,

  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'billed'],
    default: 'draft'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,

  // Notes
  internalNotes: String,

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Calculate amount
timeEntrySchema.pre('save', function(next) {
  this.amount = this.duration * this.hourlyRate;
  next();
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
```

---

## API Routes

### Authentication Routes

```javascript
// routes/auth.js
const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
```

### Invoice Routes

```javascript
// routes/invoices.js
const router = require('express').Router();
const invoicesController = require('../controllers/invoicesController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateInvoice } = require('../middleware/validation');

router.use(authenticate);

// CRUD
router.get('/', authorize('invoices:read'), invoicesController.getInvoices);
router.get('/stats', authorize('invoices:read'), invoicesController.getInvoiceStats);
router.get('/:id', authorize('invoices:read'), invoicesController.getInvoice);
router.post('/', authorize('invoices:create'), validateInvoice, invoicesController.createInvoice);
router.put('/:id', authorize('invoices:update'), validateInvoice, invoicesController.updateInvoice);
router.delete('/:id', authorize('invoices:delete'), invoicesController.deleteInvoice);

// Actions
router.post('/:id/send', authorize('invoices:send'), invoicesController.sendInvoice);
router.post('/:id/remind', authorize('invoices:send'), invoicesController.sendReminder);
router.post('/:id/void', authorize('invoices:void'), invoicesController.voidInvoice);
router.post('/:id/duplicate', authorize('invoices:create'), invoicesController.duplicateInvoice);

// PDF
router.get('/:id/pdf', authorize('invoices:read'), invoicesController.generatePDF);

// ZATCA
router.post('/:id/zatca/submit', authorize('invoices:zatca'), invoicesController.submitToZATCA);
router.get('/:id/zatca/status', authorize('invoices:read'), invoicesController.getZATCAStatus);

module.exports = router;
```

### Payment Routes

```javascript
// routes/payments.js
const router = require('express').Router();
const paymentsController = require('../controllers/paymentsController');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');
const upload = require('../middleware/upload');

router.use(authenticate);

// CRUD
router.get('/', authorize('payments:read'), paymentsController.getPayments);
router.get('/stats', authorize('payments:read'), paymentsController.getPaymentStats);
router.get('/pending-checks', authorize('payments:read'), paymentsController.getPendingChecks);
router.get('/unreconciled', authorize('payments:read'), paymentsController.getUnreconciledPayments);
router.get('/:id', authorize('payments:read'), paymentsController.getPayment);
router.post('/', authorize('payments:create'), validatePayment, paymentsController.createPayment);
router.put('/:id', authorize('payments:update'), validatePayment, paymentsController.updatePayment);
router.delete('/:id', authorize('payments:delete'), paymentsController.deletePayment);

// Invoice Application
router.post('/:id/apply', authorize('payments:update'), paymentsController.applyToInvoices);
router.delete('/:id/apply/:applicationId', authorize('payments:update'), paymentsController.removeApplication);

// Check Management
router.patch('/:id/check/status', authorize('payments:update'), paymentsController.updateCheckStatus);
router.post('/:id/check/deposit', authorize('payments:update'), paymentsController.depositCheck);

// Reconciliation
router.post('/:id/reconcile', authorize('payments:reconcile'), paymentsController.reconcilePayment);
router.delete('/:id/reconcile', authorize('payments:reconcile'), paymentsController.unreconcilePayment);

// Refunds
router.post('/:id/refund', authorize('payments:refund'), paymentsController.createRefund);

// Attachments
router.post('/:id/attachments', authorize('payments:update'), upload.array('files', 10), paymentsController.uploadAttachments);
router.delete('/:id/attachments/:attachmentId', authorize('payments:update'), paymentsController.deleteAttachment);

// Receipt
router.get('/:id/receipt', authorize('payments:read'), paymentsController.generateReceipt);
router.post('/:id/receipt/send', authorize('payments:update'), paymentsController.sendReceipt);

module.exports = router;
```

---

## Middleware

### Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...permissions) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next();
    }

    const hasPermission = permissions.some(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
```

### Validation Middleware

```javascript
// middleware/validation.js
const Joi = require('joi');

const validateInvoice = (req, res, next) => {
  const schema = Joi.object({
    clientId: Joi.string().required(),
    caseId: Joi.string().optional(),
    issueDate: Joi.date().required(),
    dueDate: Joi.date().min(Joi.ref('issueDate')).required(),
    paymentTerms: Joi.string().valid('due_on_receipt', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'eom', 'custom'),
    items: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('time', 'expense', 'flat_fee', 'product', 'discount', 'subtotal', 'comment'),
        description: Joi.string().required(),
        quantity: Joi.number().min(0).default(1),
        unitPrice: Joi.number().min(0).default(0),
        taxable: Joi.boolean().default(true)
      })
    ).min(1).required(),
    discountType: Joi.string().valid('percentage', 'fixed'),
    discountValue: Joi.number().min(0).default(0),
    customerNotes: Joi.string().optional(),
    internalNotes: Joi.string().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }

  next();
};

const validatePayment = (req, res, next) => {
  const schema = Joi.object({
    paymentType: Joi.string().valid('customer_payment', 'vendor_payment', 'refund', 'transfer', 'advance', 'retainer').required(),
    paymentDate: Joi.date().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().default('SAR'),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'sarie', 'check', 'credit_card', 'mada', 'tabby', 'tamara', 'stc_pay', 'apple_pay').required(),
    customerId: Joi.when('paymentType', {
      is: 'customer_payment',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    checkDetails: Joi.when('paymentMethod', {
      is: 'check',
      then: Joi.object({
        checkNumber: Joi.string().required(),
        checkDate: Joi.date().required(),
        checkBank: Joi.string().required()
      }),
      otherwise: Joi.object().optional()
    }),
    invoiceApplications: Joi.array().items(
      Joi.object({
        invoiceId: Joi.string().required(),
        amount: Joi.number().positive().required()
      })
    ).optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }

  next();
};

module.exports = { validateInvoice, validatePayment };
```

---

## Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/traf3li

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email (SendGrid / SMTP)
EMAIL_FROM=noreply@traf3li.com
SENDGRID_API_KEY=your-sendgrid-api-key

# File Storage (S3 / Local)
STORAGE_TYPE=local
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=traf3li-uploads
AWS_REGION=me-south-1

# ZATCA E-Invoice
ZATCA_ENV=sandbox
ZATCA_CLIENT_ID=your-zatca-client-id
ZATCA_CLIENT_SECRET=your-zatca-client-secret
ZATCA_CERT_PATH=./certs/zatca.pem
ZATCA_PRIVATE_KEY_PATH=./certs/zatca-key.pem

# Office Info (for invoices)
OFFICE_NAME=مكتب ترافيلي للمحاماة
OFFICE_NAME_EN=Traf3li Law Firm
OFFICE_VAT_NUMBER=300000000000003
OFFICE_CR_NUMBER=1010000000
OFFICE_ADDRESS=الرياض، المملكة العربية السعودية
OFFICE_PHONE=+966 11 000 0000
OFFICE_EMAIL=info@traf3li.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## ZATCA Integration

```javascript
// services/zatcaService.js
const crypto = require('crypto');
const axios = require('axios');
const { XMLBuilder, XMLParser } = require('fast-xml-parser');

class ZATCAService {
  constructor() {
    this.baseUrl = process.env.ZATCA_ENV === 'production'
      ? 'https://fatoora.zatca.gov.sa'
      : 'https://gw-fatoora.zatca.gov.sa';
    this.clientId = process.env.ZATCA_CLIENT_ID;
    this.clientSecret = process.env.ZATCA_CLIENT_SECRET;
  }

  // Generate invoice hash
  generateHash(invoiceXml) {
    return crypto.createHash('sha256').update(invoiceXml).digest('base64');
  }

  // Generate QR code data
  generateQRCode(invoice) {
    const data = [
      { tag: 1, value: process.env.OFFICE_NAME },
      { tag: 2, value: process.env.OFFICE_VAT_NUMBER },
      { tag: 3, value: invoice.issueDate.toISOString() },
      { tag: 4, value: invoice.totalAmount.toFixed(2) },
      { tag: 5, value: invoice.vatAmount.toFixed(2) }
    ];

    let tlvBuffer = Buffer.alloc(0);
    for (const item of data) {
      const tagBuffer = Buffer.from([item.tag]);
      const valueBuffer = Buffer.from(item.value, 'utf8');
      const lengthBuffer = Buffer.from([valueBuffer.length]);
      tlvBuffer = Buffer.concat([tlvBuffer, tagBuffer, lengthBuffer, valueBuffer]);
    }

    return tlvBuffer.toString('base64');
  }

  // Build UBL 2.1 XML
  buildInvoiceXML(invoice, client) {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true
    });

    const invoiceData = {
      Invoice: {
        '@_xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        '@_xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        '@_xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'cbc:ProfileID': 'reporting:1.0',
        'cbc:ID': invoice.invoiceNumber,
        'cbc:UUID': invoice._id.toString(),
        'cbc:IssueDate': invoice.issueDate.toISOString().split('T')[0],
        'cbc:IssueTime': invoice.issueDate.toISOString().split('T')[1].split('.')[0] + 'Z',
        'cbc:InvoiceTypeCode': {
          '@_name': invoice.invoiceSubtype,
          '#text': '388' // Standard invoice
        },
        'cbc:DocumentCurrencyCode': invoice.currency,
        'cbc:TaxCurrencyCode': 'SAR',
        // ... more fields
      }
    };

    return builder.build(invoiceData);
  }

  // Submit to ZATCA
  async submitInvoice(invoice, client) {
    try {
      const xml = this.buildInvoiceXML(invoice, client);
      const hash = this.generateHash(xml);
      const qrCode = this.generateQRCode(invoice);

      const response = await axios.post(
        `${this.baseUrl}/invoices/reporting/single`,
        {
          invoiceHash: hash,
          uuid: invoice._id.toString(),
          invoice: Buffer.from(xml).toString('base64')
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'ar',
            'Accept-Version': 'V2',
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
          }
        }
      );

      return {
        success: true,
        submissionId: response.data.submissionId,
        status: response.data.status,
        hash,
        qrCode
      };
    } catch (error) {
      console.error('ZATCA submission error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new ZATCAService();
```

---

## Quick Start

1. **Install dependencies:**
```bash
npm install express mongoose bcryptjs jsonwebtoken joi axios multer nodemailer fast-xml-parser
npm install -D nodemon
```

2. **Create .env file** from .env.example

3. **Start MongoDB:**
```bash
mongod --dbpath /path/to/data
```

4. **Run the server:**
```bash
npm run dev
```

5. **Test the API:**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@traf3li.com", "password": "password123"}'

# Create Invoice
curl -X POST http://localhost:5000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Unified Data Architecture

### Overview

The Traf3li system uses a **unified data architecture** where data entered once flows automatically throughout the system. Users should NEVER need to re-enter information in different sections.

### Core Principle: Entity Linking

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CLIENT    │────▶│    CASE     │────▶│  TIME/TASK  │
│   Entity    │     │   Entity    │     │   Entity    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                    FINANCE SECTION                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ Invoice │  │ Payment │  │ Expense │  │ Retainer││
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘│
└─────────────────────────────────────────────────────┘
```

### 1. Client Data Flow

When a client is created, their billing information automatically populates in finance forms:

```javascript
// routes/clients.js - Get client with billing data for invoices
router.get('/:id/billing-info', authenticate, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select('clientNumber clientType firstName lastName companyName companyNameEn nationalId commercialRegistration vatNumber email phone address billingArrangement defaultHourlyRate paymentTerms creditLimit creditBalance')
      .lean();

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Return formatted billing info for invoice/payment forms
    res.json({
      clientId: client._id,
      clientNumber: client.clientNumber,
      displayName: client.clientType === 'individual'
        ? `${client.firstName} ${client.lastName}`
        : client.companyName,
      displayNameEn: client.clientType === 'individual'
        ? `${client.firstName} ${client.lastName}`
        : client.companyNameEn,
      clientType: client.clientType,
      vatNumber: client.vatNumber,
      crNumber: client.commercialRegistration,
      nationalId: client.nationalId,
      email: client.email,
      phone: client.phone,
      address: client.address,
      billing: {
        arrangement: client.billingArrangement,
        hourlyRate: client.defaultHourlyRate,
        paymentTerms: client.paymentTerms,
        creditLimit: client.creditLimit,
        creditBalance: client.creditBalance
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Billable Items Flow to Invoices

When creating time entries, tasks, or events marked as "billable", they automatically appear in the invoice creation form:

```javascript
// routes/invoices.js - Get billable items for a client/case
router.get('/billable-items', authenticate, async (req, res) => {
  try {
    const { clientId, caseId, startDate, endDate } = req.query;

    const query = {
      billable: true,
      billed: false,
      status: { $ne: 'rejected' }
    };

    if (clientId) query.clientId = clientId;
    if (caseId) query.caseId = caseId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Get unbilled time entries
    const timeEntries = await TimeEntry.find(query)
      .populate('userId', 'firstName lastName hourlyRate')
      .populate('caseId', 'caseNumber title')
      .sort({ date: -1 })
      .lean();

    // Get unbilled expenses
    const expenses = await Expense.find({
      ...query,
      reimbursable: true,
      reimbursed: false
    })
      .populate('caseId', 'caseNumber title')
      .sort({ date: -1 })
      .lean();

    // Get billable tasks
    const tasks = await Task.find({
      ...query,
      billableAmount: { $gt: 0 }
    })
      .populate('caseId', 'caseNumber title')
      .lean();

    // Get billable events
    const events = await Event.find({
      ...query,
      billableAmount: { $gt: 0 }
    })
      .populate('caseId', 'caseNumber title')
      .lean();

    res.json({
      timeEntries: timeEntries.map(t => ({
        id: t._id,
        type: 'time',
        date: t.date,
        description: t.description,
        attorney: `${t.userId.firstName} ${t.userId.lastName}`,
        hours: t.duration,
        rate: t.hourlyRate,
        amount: t.amount,
        case: t.caseId?.title
      })),
      expenses: expenses.map(e => ({
        id: e._id,
        type: 'expense',
        date: e.date,
        description: e.description,
        amount: e.amount,
        case: e.caseId?.title
      })),
      tasks: tasks.map(t => ({
        id: t._id,
        type: 'task',
        date: t.completedAt || t.dueDate,
        description: t.title,
        amount: t.billableAmount,
        case: t.caseId?.title
      })),
      events: events.map(e => ({
        id: e._id,
        type: 'event',
        date: e.date,
        description: e.title,
        amount: e.billableAmount,
        case: e.caseId?.title
      })),
      totals: {
        timeTotal: timeEntries.reduce((sum, t) => sum + t.amount, 0),
        expenseTotal: expenses.reduce((sum, e) => sum + e.amount, 0),
        taskTotal: tasks.reduce((sum, t) => sum + (t.billableAmount || 0), 0),
        eventTotal: events.reduce((sum, e) => sum + (e.billableAmount || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Invoice → Payment Linking

When creating a payment, fetch open invoices for the selected client:

```javascript
// routes/payments.js - Get open invoices for payment application
router.get('/open-invoices/:clientId', authenticate, async (req, res) => {
  try {
    const invoices = await Invoice.find({
      clientId: req.params.clientId,
      status: { $in: ['sent', 'partial', 'overdue', 'viewed'] },
      balanceDue: { $gt: 0 }
    })
      .select('invoiceNumber issueDate dueDate totalAmount amountPaid balanceDue status caseId')
      .populate('caseId', 'caseNumber title')
      .sort({ dueDate: 1 })
      .lean();

    res.json(invoices.map(inv => ({
      invoiceId: inv._id,
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      total: inv.totalAmount,
      paid: inv.amountPaid,
      balance: inv.balanceDue,
      status: inv.status,
      case: inv.caseId ? {
        caseNumber: inv.caseId.caseNumber,
        title: inv.caseId.title
      } : null,
      isOverdue: new Date(inv.dueDate) < new Date()
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4. Case Data Aggregation

Get complete financial summary for a case:

```javascript
// routes/cases.js - Get case with all linked financial data
router.get('/:id/financial-summary', authenticate, async (req, res) => {
  try {
    const caseId = req.params.id;

    const [caseData, timeEntries, expenses, invoices, payments] = await Promise.all([
      Case.findById(caseId)
        .populate('clientId', 'firstName lastName companyName clientNumber')
        .populate('responsibleAttorneyId', 'firstName lastName')
        .lean(),

      TimeEntry.aggregate([
        { $match: { caseId: mongoose.Types.ObjectId(caseId) } },
        { $group: {
          _id: null,
          totalHours: { $sum: '$duration' },
          totalAmount: { $sum: '$amount' },
          billableHours: { $sum: { $cond: ['$billable', '$duration', 0] } },
          billedAmount: { $sum: { $cond: ['$billed', '$amount', 0] } }
        }}
      ]),

      Expense.aggregate([
        { $match: { caseId: mongoose.Types.ObjectId(caseId) } },
        { $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          reimbursableExpenses: { $sum: { $cond: ['$reimbursable', '$amount', 0] } }
        }}
      ]),

      Invoice.aggregate([
        { $match: { caseId: mongoose.Types.ObjectId(caseId) } },
        { $group: {
          _id: null,
          totalInvoiced: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$balanceDue' },
          invoiceCount: { $sum: 1 }
        }}
      ]),

      Payment.aggregate([
        {
          $match: {
            'invoiceApplications.invoiceId': {
              $in: await Invoice.find({ caseId }).distinct('_id')
            }
          }
        },
        { $group: {
          _id: null,
          totalPayments: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }}
      ])
    ]);

    res.json({
      case: caseData,
      financials: {
        time: timeEntries[0] || { totalHours: 0, totalAmount: 0, billableHours: 0, billedAmount: 0 },
        expenses: expenses[0] || { totalExpenses: 0, reimbursableExpenses: 0 },
        invoices: invoices[0] || { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0, invoiceCount: 0 },
        payments: payments[0] || { totalPayments: 0, paymentCount: 0 },
        budget: caseData?.budget || 0,
        budgetRemaining: (caseData?.budget || 0) - (timeEntries[0]?.totalAmount || 0) - (expenses[0]?.totalExpenses || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 5. Attorney/Employee Selection with Hourly Rates

When selecting an attorney in time entry or invoice, their hourly rate auto-populates:

```javascript
// routes/users.js - Get attorneys with billing rates
router.get('/attorneys', authenticate, async (req, res) => {
  try {
    const attorneys = await User.find({
      role: { $in: ['lawyer', 'paralegal', 'admin'] },
      status: 'active'
    })
      .select('firstName lastName email role hourlyRate barNumber specialization')
      .sort({ lastName: 1 })
      .lean();

    res.json(attorneys.map(a => ({
      id: a._id,
      name: `${a.firstName} ${a.lastName}`,
      email: a.email,
      role: a.role,
      hourlyRate: a.hourlyRate || 0,
      barNumber: a.barNumber,
      specialization: a.specialization
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Saudi Government API Integration

### 1. Yakeen API (National ID Verification)

Verify Saudi National ID and auto-fill citizen information:

```javascript
// services/yakeenService.js
const axios = require('axios');

class YakeenService {
  constructor() {
    this.baseUrl = process.env.YAKEEN_API_URL || 'https://yakeen.mic.gov.sa';
    this.username = process.env.YAKEEN_USERNAME;
    this.password = process.env.YAKEEN_PASSWORD;
    this.chargeCode = process.env.YAKEEN_CHARGE_CODE;
  }

  async verifyNationalId(nationalId, birthDate) {
    try {
      // Hijri date format required
      const hijriBirthDate = this.convertToHijri(birthDate);

      const response = await axios.post(`${this.baseUrl}/Yakeen/CitizenInfo`, {
        NIN: nationalId,
        DateOfBirth: hijriBirthDate,
        ChargeCode: this.chargeCode
      }, {
        auth: {
          username: this.username,
          password: this.password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        return {
          verified: true,
          data: {
            nationalId: nationalId,
            firstNameAr: response.data.firstName,
            fatherNameAr: response.data.fatherName,
            grandfatherNameAr: response.data.grandFatherName,
            lastNameAr: response.data.familyName,
            firstNameEn: response.data.englishFirstName,
            lastNameEn: response.data.englishFamilyName,
            gender: response.data.gender === 'M' ? 'male' : 'female',
            birthDate: response.data.dateOfBirth,
            birthDateHijri: response.data.dateOfBirthH,
            nationality: response.data.nationality || 'SA',
            idExpiryDate: response.data.idExpiryDate,
            idExpiryDateHijri: response.data.idExpiryDateH
          }
        };
      }

      return { verified: false, error: response.data.message };
    } catch (error) {
      console.error('Yakeen verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  convertToHijri(gregorianDate) {
    // Implementation for Gregorian to Hijri conversion
    // Use a library like 'moment-hijri' or 'hijri-converter'
    const moment = require('moment-hijri');
    return moment(gregorianDate).format('iYYYY-iMM-iDD');
  }
}

module.exports = new YakeenService();
```

### 2. Wathq API (Commercial Registry Verification)

Verify company CR number and auto-fill company information.

**Example Wathq Response for CR: 2050012516**
```json
{
  "crNumber": "2050012516",
  "unifiedNumber": "7001862338",
  "crName": "شركة مجموعة ماس الاهلية",
  "crNameEn": "Mas Al Ahliya Group Company",
  "crEntityStatus": "نشط",
  "entityDuration": 0,
  "capital": 8000000.0,
  "phone": "0138174055",
  "issueDate": "1982-06-15",
  "mainActivity": "أعمال الدهانات والطلاء للمباني الداخلية والخارجية - ترميمات المباني السكنية والغير سكنية",
  "website": "",
  "ecommerceLink": "",
  "city": "الدمام",
  "address": "حي الفيصلية",
  "owners": [
    { "name": "محمد أحمد", "share": 50 },
    { "name": "علي محمد", "share": 50 }
  ],
  "managers": [
    { "name": "محمد أحمد", "position": "المدير العام" }
  ]
}
```

**Service Implementation:**

```javascript
// services/wathqService.js
const axios = require('axios');

class WathqService {
  constructor() {
    this.baseUrl = process.env.WATHQ_API_URL || 'https://api.wathq.sa';
    this.apiKey = process.env.WATHQ_API_KEY;
  }

  async verifyCommercialRegistry(crNumber) {
    try {
      const response = await axios.get(`${this.baseUrl}/v5/commercialregistration/info/${crNumber}`, {
        headers: {
          'apiKey': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (response.data) {
        const company = response.data;
        return {
          verified: true,
          data: {
            // Basic Info
            crNumber: company.crNumber,                    // رقم السجل التجاري
            unifiedNumber: company.crEntityNumber,         // الرقم الوطني الموحد للمنشأة
            crName: company.crName,                        // الكيان التجاري (اسم الشركة)
            crNameEn: company.crNameEn || '',              // الاسم بالإنجليزية
            crEntityStatus: company.status?.name || company.crStatus || 'نشط',  // حالة السجل
            entityDuration: company.entityDuration || 0,   // مدة المنشأة

            // Financial
            capital: company.capital || 0,                 // رأس المال

            // Contact
            phone: company.phone || '',                    // هاتف
            website: company.website || '',                // الموقع الإلكتروني
            ecommerceLink: company.ecommerceLink || '',    // رابط المتجر الإلكتروني

            // Location
            city: company.location?.city || company.city || '',       // المدينة
            address: company.location?.address || company.address || '', // العنوان

            // Dates
            issueDate: company.issueDate,                  // تاريخ إصدار السجل
            expiryDate: company.expiryDate,                // تاريخ انتهاء السجل

            // Activity
            mainActivity: company.activities?.find(a => a.isMainActivity)?.name
              || company.mainActivity || '',               // النشاط التجاري
            activities: company.activities?.map(a => ({
              code: a.id,
              name: a.name,
              isMainActivity: a.isMainActivity
            })) || [],

            // Parties
            owners: company.parties?.filter(p => p.relation?.id === 1)?.map(p => ({
              name: p.name,
              nationalId: p.identity,
              nationality: p.nationality?.name,
              share: p.sharePercentage
            })) || [],
            managers: company.parties?.filter(p => p.relation?.id === 2)?.map(p => ({
              name: p.name,
              nationalId: p.identity,
              position: p.relation?.name
            })) || []
          }
        };
      }

      return { verified: false, error: 'Company not found' };
    } catch (error) {
      console.error('Wathq verification error:', error);
      return { verified: false, error: error.message };
    }
  }
}

module.exports = new WathqService();
```

**Field Mapping Reference:**

| Arabic Field | English Key | Description |
|--------------|-------------|-------------|
| رقم السجل التجاري | crNumber | Commercial Registration Number |
| الرقم الوطني الموحد للمنشأة | unifiedNumber | National Entity Number |
| الكيان التجاري | crName | Company Name (Arabic) |
| الاسم بالإنجليزية | crNameEn | Company Name (English) |
| حالة السجل | crEntityStatus | CR Status (نشط/منتهي) |
| مدة المنشأة | entityDuration | Entity Duration (years) |
| رأس المال | capital | Capital (SAR) |
| هاتف | phone | Phone Number |
| تاريخ إصدار السجل | issueDate | Issue Date |
| الموقع الإلكتروني | website | Website URL |
| رابط المتجر الإلكتروني | ecommerceLink | E-commerce Link |
| النشاط التجاري | mainActivity | Business Activity |
| المدينة | city | City |
| العنوان | address | Address |
| الملاك | owners | Owners/Shareholders |
| المديرون | managers | Managers |

### 3. MOJ API (Ministry of Justice - Attorney Verification)

Verify attorney license and power of attorney documents:

```javascript
// services/mojService.js
const axios = require('axios');

class MOJService {
  constructor() {
    this.baseUrl = process.env.MOJ_API_URL || 'https://api.moj.gov.sa';
    this.apiKey = process.env.MOJ_API_KEY;
  }

  async verifyAttorney(licenseNumber) {
    try {
      const response = await axios.get(`${this.baseUrl}/lawyers/verify/${licenseNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.valid) {
        return {
          verified: true,
          data: {
            licenseNumber: response.data.licenseNumber,
            name: response.data.lawyerName,
            nationalId: response.data.nationalId,
            status: response.data.status,
            issueDate: response.data.issueDate,
            expiryDate: response.data.expiryDate,
            specializations: response.data.specializations || [],
            region: response.data.region,
            contact: {
              phone: response.data.phone,
              email: response.data.email
            }
          }
        };
      }

      return { verified: false, error: 'Attorney license not valid' };
    } catch (error) {
      console.error('MOJ verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  async verifyPowerOfAttorney(poaNumber) {
    try {
      const response = await axios.get(`${this.baseUrl}/poa/verify/${poaNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.valid) {
        return {
          verified: true,
          data: {
            poaNumber: response.data.poaNumber,
            issueDate: response.data.issueDate,
            expiryDate: response.data.expiryDate,
            isActive: response.data.isActive,
            principal: {
              name: response.data.principal?.name,
              nationalId: response.data.principal?.nationalId
            },
            attorney: {
              name: response.data.attorney?.name,
              licenseNumber: response.data.attorney?.licenseNumber
            },
            scope: response.data.scope || [],
            restrictions: response.data.restrictions || []
          }
        };
      }

      return { verified: false, error: 'Power of Attorney not found or expired' };
    } catch (error) {
      console.error('MOJ POA verification error:', error);
      return { verified: false, error: error.message };
    }
  }
}

module.exports = new MOJService();
```

### 4. Verification Routes

```javascript
// routes/verify.js
const router = require('express').Router();
const yakeenService = require('../services/yakeenService');
const wathqService = require('../services/wathqService');
const mojService = require('../services/mojService');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Verify National ID via Yakeen
router.post('/yakeen', async (req, res) => {
  try {
    const { nationalId, birthDate } = req.body;

    if (!nationalId || !birthDate) {
      return res.status(400).json({ error: 'National ID and birth date required' });
    }

    const result = await yakeenService.verifyNationalId(nationalId, birthDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Commercial Registry via Wathq
router.get('/wathq/:crNumber', async (req, res) => {
  try {
    const { crNumber } = req.params;

    if (!crNumber) {
      return res.status(400).json({ error: 'CR number required' });
    }

    const result = await wathqService.verifyCommercialRegistry(crNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Attorney License via MOJ
router.get('/moj/attorney/:licenseNumber', async (req, res) => {
  try {
    const { licenseNumber } = req.params;

    if (!licenseNumber) {
      return res.status(400).json({ error: 'License number required' });
    }

    const result = await mojService.verifyAttorney(licenseNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Power of Attorney via MOJ
router.get('/moj/poa/:poaNumber', async (req, res) => {
  try {
    const { poaNumber } = req.params;

    if (!poaNumber) {
      return res.status(400).json({ error: 'POA number required' });
    }

    const result = await mojService.verifyPowerOfAttorney(poaNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## Frontend Integration Examples

### 1. Client Selection in Invoice Form

```typescript
// When client is selected, auto-fill billing info
const handleClientSelect = async (clientId: string) => {
  const response = await fetch(`/api/clients/${clientId}/billing-info`);
  const billingInfo = await response.json();

  // Auto-populate form fields
  setForm({
    ...form,
    clientId,
    clientType: billingInfo.clientType,
    vatNumber: billingInfo.vatNumber,
    crNumber: billingInfo.crNumber,
    billingArrangement: billingInfo.billing.arrangement,
    hourlyRate: billingInfo.billing.hourlyRate,
    paymentTerms: billingInfo.billing.paymentTerms
  });
};
```

### 2. Loading Billable Items

```typescript
// When case is selected, load billable items
const handleCaseSelect = async (caseId: string) => {
  const response = await fetch(`/api/invoices/billable-items?caseId=${caseId}`);
  const { timeEntries, expenses, tasks, events, totals } = await response.json();

  // Populate line items table
  const items = [
    ...timeEntries.map(t => ({
      type: 'time',
      description: t.description,
      quantity: t.hours,
      unitPrice: t.rate,
      amount: t.amount,
      sourceId: t.id
    })),
    ...expenses.map(e => ({
      type: 'expense',
      description: e.description,
      quantity: 1,
      unitPrice: e.amount,
      amount: e.amount,
      sourceId: e.id
    }))
  ];

  setLineItems(items);
  setTotals(totals);
};
```

### 3. Payment with Auto-Apply

```typescript
// When client is selected in payment form
const handleClientSelectForPayment = async (clientId: string) => {
  // Fetch client info
  const clientRes = await fetch(`/api/clients/${clientId}/billing-info`);
  const client = await clientRes.json();

  // Fetch open invoices
  const invoicesRes = await fetch(`/api/payments/open-invoices/${clientId}`);
  const invoices = await invoicesRes.json();

  setClientInfo(client);
  setOpenInvoices(invoices);

  // Calculate suggested payment amount (oldest invoices first)
  const suggestedAmount = invoices
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .reduce((sum, inv) => sum + inv.balance, 0);

  setPaymentAmount(suggestedAmount);
};
```

---

## Environment Variables for Saudi APIs

```bash
# Saudi Government APIs

# Yakeen (National ID Verification)
YAKEEN_API_URL=https://yakeen.mic.gov.sa
YAKEEN_USERNAME=your-yakeen-username
YAKEEN_PASSWORD=your-yakeen-password
YAKEEN_CHARGE_CODE=your-charge-code

# Wathq (Commercial Registry)
WATHQ_API_URL=https://api.wathq.sa
WATHQ_API_KEY=your-wathq-api-key

# MOJ (Ministry of Justice)
MOJ_API_URL=https://api.moj.gov.sa
MOJ_API_KEY=your-moj-api-key
```

---

## Data Validation Rules

### Client Creation/Update
1. Individual clients MUST have national ID verified via Yakeen before save
2. Company clients MUST have CR number verified via Wathq before save
3. Attorney assignments MUST be verified via MOJ

### Invoice Creation
1. Client billing info auto-populates from Client entity
2. VAT number for ZATCA comes from Client.vatNumber
3. Billable items must reference valid TimeEntry/Expense/Task IDs
4. Mark source entities as `billed: true` after invoice creation

### Payment Application
1. Payment amount cannot exceed total of selected invoice balances
2. After payment application, update Invoice.amountPaid and Invoice.balanceDue
3. Check Client.creditBalance for available credit
4. Update Client.creditBalance if payment creates credit

---

## Notes

- All monetary amounts are stored as Numbers (not Decimal128) for simplicity
- Dates are stored in UTC and converted to Saudi timezone (Asia/Riyadh) on display
- Arabic text is fully supported with proper UTF-8 encoding
- All API responses are in JSON format
- Rate limiting is applied to prevent abuse
- File uploads are limited to 10MB per file
- ZATCA integration requires sandbox testing before production
- **Saudi Government APIs require official registration and API keys from respective ministries**
- **Always cache verification results (e.g., 24 hours) to reduce API calls and costs**
