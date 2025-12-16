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
9. [Unified Data Architecture](#unified-data-architecture)
10. [Saudi Government API Integration](#saudi-government-api-integration)
11. [Lead Management & Conversion](#lead-management--conversion)
12. [Complete Unified Data Flow](#complete-unified-data-flow)
13. [Complete System Integration](#complete-system-integration)
14. [Additional Schemas](#additional-schemas)
15. [API Endpoints Summary](#api-endpoints-summary)

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
│   │   ├── Lead.js              # Lead management
│   │   ├── Client.js
│   │   ├── Contact.js           # Client contacts
│   │   ├── Organization.js      # External organizations
│   │   ├── Case.js
│   │   ├── Invoice.js
│   │   ├── Payment.js
│   │   ├── Expense.js
│   │   ├── TimeEntry.js
│   │   ├── Task.js
│   │   ├── Reminder.js
│   │   ├── Event.js
│   │   ├── Message.js           # Internal/External messages
│   │   ├── Document.js
│   │   ├── Service.js           # Legal services catalog
│   │   ├── Referral.js          # Referral tracking
│   │   ├── ActivityLog.js       # Activity history
│   │   ├── Transaction.js       # Financial transactions
│   │   ├── Employee.js
│   │   ├── Payroll.js           # Monthly payroll
│   │   ├── Leave.js             # Leave requests
│   │   ├── Attendance.js        # Daily attendance
│   │   ├── Evaluation.js        # Employee evaluations
│   │   ├── Vendor.js
│   │   └── BankAccount.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── leads.js             # Lead CRUD + conversion
│   │   ├── clients.js
│   │   ├── contacts.js          # Client contacts
│   │   ├── organizations.js     # External organizations
│   │   ├── cases.js
│   │   ├── invoices.js
│   │   ├── payments.js
│   │   ├── expenses.js
│   │   ├── transactions.js      # Financial transactions
│   │   ├── timeEntries.js
│   │   ├── tasks.js
│   │   ├── reminders.js
│   │   ├── events.js
│   │   ├── messages.js          # Internal/External messages
│   │   ├── documents.js
│   │   ├── services.js          # Legal services catalog
│   │   ├── referrals.js         # Referral tracking
│   │   ├── activityLog.js       # Activity history
│   │   ├── employees.js         # HR - Employees
│   │   ├── payroll.js           # HR - Payroll
│   │   ├── leaves.js            # HR - Leave requests
│   │   ├── attendance.js        # HR - Attendance
│   │   ├── evaluations.js       # HR - Evaluations
│   │   └── verify.js            # Saudi API verification
│   ├── controllers/
│   │   └── [corresponding controllers]
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Request validation
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── upload.js            # File uploads
│   ├── services/
│   │   ├── zatcaService.js      # ZATCA e-invoicing
│   │   ├── yakeenService.js     # National ID verification
│   │   ├── wathqService.js      # Commercial Registry verification
│   │   ├── mojService.js        # Attorney/POA verification
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

### 1. Wathq Commercial Registration Verification

```typescript
// Verify CR number and auto-populate client data
const verifyCommercialRegistration = async (clientId: string, crNumber: string) => {
  const response = await fetch(`/api/clients/${clientId}/verify/wathq`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      crNumber: crNumber,    // 10-digit CR number
      fullInfo: true         // true = full details, false = basic info
    })
  });
  return response.json();
  // Returns: { success, message, data: { companyName, status, capital, activities, parties, ... } }
};
```

### 2. Get Additional Wathq Data

```typescript
// Get managers/board of directors
const getManagers = async (clientId: string) => {
  const res = await fetch(`/api/clients/${clientId}/wathq/managers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
  // Returns: { success, data: [{ name, typeName, nationalId, nationality, positions }] }
};

// Get owners/partners with shares
const getOwners = async (clientId: string) => {
  const res = await fetch(`/api/clients/${clientId}/wathq/owners`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
  // Returns: { success, data: [{ name, nationalId, nationality, share, shareType }] }
};

// Get capital information
const getCapital = async (clientId: string) => {
  const res = await fetch(`/api/clients/${clientId}/wathq/capital`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
  // Returns: { success, data: { currency, capital, contributionCapital, stockCapital } }
};

// Get company branches
const getBranches = async (clientId: string) => {
  const res = await fetch(`/api/clients/${clientId}/wathq/branches`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
  // Returns: { success, data: [{ crNumber, name, isMain, entityType }] }
};

// Get CR status
const getStatus = async (clientId: string) => {
  const res = await fetch(`/api/clients/${clientId}/wathq/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
  // Returns: { success, data: { crNumber, statusName, isActive } }
};
```

### 3. Wathq Verification React Component

```tsx
import { useState } from 'react';

interface ClientVerificationProps {
  clientId: string;
  token: string;
}

const ClientVerification = ({ clientId, token }: ClientVerificationProps) => {
  const [crNumber, setCrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/verify/wathq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ crNumber, fullInfo: true })
      });
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>التحقق من السجل التجاري</h3>
      <input
        type="text"
        value={crNumber}
        onChange={(e) => setCrNumber(e.target.value)}
        placeholder="رقم السجل التجاري (10 أرقام)"
        maxLength={10}
        dir="ltr"
      />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'جاري التحقق...' : 'تحقق'}
      </button>

      {result && (
        <div className={result.success ? 'success' : 'error'}>
          {result.success ? (
            <div>
              <p>اسم الشركة: {result.data.companyName}</p>
              <p>الحالة: {result.data.status?.name}</p>
              <p>رأس المال: {result.data.capital} ريال</p>
            </div>
          ) : (
            <p>{result.message}</p>
          )}
        </div>
      )}
    </div>
  );
};
```

### 4. Wathq Error Handling

```typescript
const verifyClient = async (clientId: string, crNumber: string) => {
  try {
    const res = await fetch(`/api/clients/${clientId}/verify/wathq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ crNumber })
    });

    const data = await res.json();

    if (res.status === 503) {
      // Service not configured
      alert('خدمة واثق غير مفعلة');
    } else if (res.status === 400) {
      // Missing CR number
      alert('رقم السجل التجاري مطلوب');
    } else if (!data.success) {
      // API error
      alert(data.message || 'حدث خطأ في التحقق');
    } else {
      // Success
      return data.data;
    }
  } catch (error) {
    alert('خطأ في الاتصال');
  }
};
```

### Wathq API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clients/:id/verify/wathq` | POST | Verify CR and get company info |
| `/api/clients/:id/wathq/managers` | GET | Get managers/board of directors |
| `/api/clients/:id/wathq/owners` | GET | Get owners/partners with shares |
| `/api/clients/:id/wathq/capital` | GET | Get capital information |
| `/api/clients/:id/wathq/branches` | GET | Get company branches |
| `/api/clients/:id/wathq/status` | GET | Get CR status |

### API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Missing required field (CR number, POA number, etc.) |
| 403 | Not authorized to access this client |
| 404 | Client not found |
| 503 | Service not configured (missing API keys) |

---

### 5. Client Selection in Invoice Form

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

### 6. Loading Billable Items

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

### 8. MOJ Verification - Power of Attorney (الوكالة)

```typescript
// POST /api/clients/:clientId/verify/moj
const verifyPowerOfAttorney = async (clientId: string, poaNumber: string, idNumber?: string) => {
  const response = await fetch(`/api/clients/${clientId}/verify/moj`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      poaNumber,      // Required: رقم الوكالة (e.g., "1234567890")
      idNumber        // Optional: رقم الهوية - uses client's nationalId if not provided
    })
  });

  return response.json();
};

// Example usage
const result = await verifyPowerOfAttorney('clientId123', '4412345678');

// Success response
{
  "success": true,
  "message": "تم التحقق من الوكالة بنجاح",
  "data": {
    "poaNumber": "4412345678",
    "status": "سارية",
    "isActive": true,
    "isValid": true,
    "isExpired": false,
    "daysUntilExpiry": 180,
    "principal": {
      "name": "محمد أحمد",
      "idNumber": "1098765432"
    },
    "attorney": {
      "name": "عبدالله محمد",
      "idNumber": "1087654321",
      "type": "خاص"
    },
    "issueDate": "2024-01-15",
    "expiryDate": "2025-01-15",
    "notaryNumber": "123456",
    "powers": ["البيع", "الشراء", "التوقيع"],
    "verified": true,
    "verifiedAt": "2024-12-05T10:30:00.000Z",
    "source": "MOJ Portal"
  },
  "fromCache": false
}

// Error response
{
  "success": false,
  "message": "لم يتم العثور على بيانات الوكالة",
  "data": null
}
```

### 9. MOJ Verification - Attorney License (رخصة المحامي)

```typescript
// POST /api/clients/:clientId/verify/attorney
const verifyAttorney = async (clientId: string, attorneyId: string) => {
  const response = await fetch(`/api/clients/${clientId}/verify/attorney`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      attorneyId   // Required: رقم هوية المحامي
    })
  });

  return response.json();
};

// Example usage
const result = await verifyAttorney('clientId123', '1098765432');

// Success response
{
  "success": true,
  "message": "تم التحقق من المحامي بنجاح",
  "data": {
    "attorneyId": "1098765432",
    "name": "عبدالله محمد الشمري",
    "licenseNumber": "12345",
    "licenseStatus": "نشط",
    "isActive": true,
    "isValid": true,
    "isExpired": false,
    "daysUntilExpiry": 365,
    "specializations": ["قانون تجاري", "قانون عمل"],
    "region": "الرياض",
    "issueDate": "2020-01-01",
    "expiryDate": "2025-12-31",
    "verified": true,
    "verifiedAt": "2024-12-05T10:30:00.000Z",
    "source": "MOJ Portal"
  },
  "fromCache": false
}
```

### 10. POA Verification React Component

```tsx
// components/POAVerification.tsx
import { useState } from 'react';

interface POAVerificationProps {
  clientId: string;
  clientNationalId?: string;
}

export function POAVerification({ clientId, clientNationalId }: POAVerificationProps) {
  const [poaNumber, setPoaNumber] = useState('');
  const [idNumber, setIdNumber] = useState(clientNationalId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!poaNumber) {
      setError('رقم الوكالة مطلوب');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/clients/${clientId}/verify/moj`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ poaNumber, idNumber: idNumber || undefined })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="poa-verification">
      <h3>التحقق من الوكالة</h3>

      <div className="form-group">
        <label>رقم الوكالة *</label>
        <input
          type="text"
          value={poaNumber}
          onChange={(e) => setPoaNumber(e.target.value)}
          placeholder="أدخل رقم الوكالة"
          dir="ltr"
        />
      </div>

      <div className="form-group">
        <label>رقم الهوية</label>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="رقم هوية الموكل أو الوكيل"
          dir="ltr"
        />
        <small>اختياري - سيتم استخدام رقم هوية العميل إذا لم يتم إدخاله</small>
      </div>

      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'جاري التحقق...' : 'تحقق من الوكالة'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <div className={`status ${result.isValid ? 'valid' : 'invalid'}`}>
            {result.isValid ? '✅ الوكالة سارية' : '❌ الوكالة غير سارية'}
          </div>

          <table>
            <tbody>
              <tr><td>رقم الوكالة:</td><td>{result.poaNumber}</td></tr>
              <tr><td>الموكل:</td><td>{result.principal?.name}</td></tr>
              <tr><td>الوكيل:</td><td>{result.attorney?.name}</td></tr>
              <tr><td>تاريخ الإصدار:</td><td>{result.issueDate}</td></tr>
              <tr><td>تاريخ الانتهاء:</td><td>{result.expiryDate}</td></tr>
              {result.daysUntilExpiry && (
                <tr><td>أيام حتى الانتهاء:</td><td>{result.daysUntilExpiry} يوم</td></tr>
              )}
              <tr><td>الصلاحيات:</td><td>{result.powers?.join('، ')}</td></tr>
            </tbody>
          </table>

          {result.fromCache && (
            <small>* البيانات من الذاكرة المؤقتة (صالحة لمدة 24 ساعة)</small>
          )}
        </div>
      )}
    </div>
  );
}
```

### 11. Validation Utilities

```typescript
// utils/validation.ts

// Validate Saudi National ID (10 digits, starts with 1 or 2)
export const validateNationalId = (id: string): boolean => {
  const regex = /^[12]\d{9}$/;
  return regex.test(id);
};

// Validate POA Number format (10+ digits)
export const validatePOANumber = (poa: string): boolean => {
  const regex = /^\d{10,}$/;
  return regex.test(poa);
};

// Validate Attorney License Number
export const validateAttorneyLicense = (license: string): boolean => {
  const regex = /^\d{4,}$/;
  return regex.test(license);
};
```

### MOJ API Endpoints Summary

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/api/clients/:id/verify/moj` | POST | `{ poaNumber, idNumber? }` | Verify Power of Attorney (الوكالة) |
| `/api/clients/:id/verify/attorney` | POST | `{ attorneyId }` | Verify Attorney License (رخصة المحامي) |

**Notes:**
- **Caching**: Results are cached for 24 hours. The `fromCache: true` flag indicates cached data.
- **Auto-save**: When POA verification succeeds, the client record is automatically updated with the POA details.
- **Error Handling**: Always check `success` field in response before using data.
- **Rate Limiting**: Be mindful of request frequency - the service respects the public portal's capacity.

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

## Lead Management & Conversion

### Lead Schema

```javascript
// models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Basic Info
  leadNumber: { type: String, unique: true, required: true },
  leadType: { type: String, enum: ['individual', 'corporate', 'government'], required: true },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertising', 'cold_call', 'event', 'other'],
    default: 'website'
  },
  referredBy: String,

  // Individual fields
  firstName: String,
  lastName: String,
  nationalId: String,
  birthDate: Date,

  // Corporate fields
  companyName: String,
  companyNameEn: String,
  commercialRegistration: String,
  unifiedNumber: String,
  vatNumber: String,
  capital: Number,
  mainActivity: String,

  // Contact
  email: { type: String, required: true },
  phone: { type: String, required: true },
  mobile: String,
  website: String,
  ecommerceLink: String,

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

  // Legal Matter Interest
  interestedServices: [{
    type: String,
    enum: ['litigation', 'consultation', 'contract', 'corporate', 'real_estate', 'labor', 'criminal', 'family', 'arbitration', 'other']
  }],
  caseDescription: String,
  estimatedBudget: Number,
  urgency: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },

  // Verification Status (from Saudi APIs)
  verification: {
    nationalIdVerified: { type: Boolean, default: false },
    nationalIdVerifiedAt: Date,
    crVerified: { type: Boolean, default: false },
    crVerifiedAt: Date,
    verificationData: mongoose.Schema.Types.Mixed  // Store full API response
  },

  // Lead Status
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'converted', 'lost', 'archived'],
    default: 'new'
  },
  lostReason: String,

  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Follow-up
  nextFollowUp: Date,
  followUpHistory: [{
    date: Date,
    type: { type: String, enum: ['call', 'email', 'meeting', 'note'] },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Conversion
  convertedToClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  convertedAt: Date,
  convertedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Notes
  notes: String,
  tags: [String],

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate lead number
leadSchema.pre('save', async function(next) {
  if (this.isNew && !this.leadNumber) {
    const count = await this.constructor.countDocuments() + 1;
    this.leadNumber = `LEAD-${String(count).padStart(5, '0')}`;
  }
  next();
});

// Virtual for display name
leadSchema.virtual('displayName').get(function() {
  if (this.leadType === 'individual') {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.companyName;
});

module.exports = mongoose.model('Lead', leadSchema);
```

### Lead Routes

```javascript
// routes/leads.js
const router = require('express').Router();
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Case = require('../models/Case');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// CRUD
router.get('/', authorize('leads:read'), async (req, res) => {
  try {
    const { status, source, assignedTo, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;

    const leads = await Lead.find(query)
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Lead.countDocuments(query);

    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authorize('leads:read'), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName')
      .populate('convertedToClientId', 'clientNumber firstName lastName companyName')
      .lean();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authorize('leads:create'), async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      createdBy: req.user._id
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authorize('leads:update'), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// LEAD → CLIENT CONVERSION
// ============================================
router.post('/:id/convert', authorize('leads:convert'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { createCase, caseDetails } = req.body;

    // 1. Get the lead
    const lead = await Lead.findById(req.params.id).session(session);
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.status === 'converted') {
      throw new Error('Lead already converted');
    }

    // 2. Create Client with ALL lead data (unified data transfer)
    const clientData = {
      // Transfer client type
      clientType: lead.leadType,

      // Individual fields (auto-transferred)
      firstName: lead.firstName,
      lastName: lead.lastName,
      nationalId: lead.nationalId,

      // Corporate fields (auto-transferred)
      companyName: lead.companyName,
      companyNameEn: lead.companyNameEn,
      commercialRegistration: lead.commercialRegistration,
      vatNumber: lead.vatNumber,

      // Contact (auto-transferred)
      email: lead.email,
      phone: lead.phone,
      mobile: lead.mobile,
      website: lead.website,

      // Address (auto-transferred completely)
      address: lead.address,

      // Source tracking
      source: lead.source,
      referredBy: lead.referredBy,

      // Notes (auto-transferred)
      notes: lead.notes,
      tags: lead.tags,

      // Initial status
      status: 'active',

      // Metadata
      createdBy: req.user._id,

      // Store verification data from lead
      verificationData: lead.verification?.verificationData
    };

    const client = new Client(clientData);
    await client.save({ session });

    // 3. Optionally create initial case
    let newCase = null;
    if (createCase && caseDetails) {
      newCase = new Case({
        title: caseDetails.title || `قضية ${lead.displayName}`,
        description: lead.caseDescription,
        caseType: lead.interestedServices?.[0] || caseDetails.caseType || 'consultation',
        clientId: client._id,
        responsibleAttorneyId: lead.assignedTo || caseDetails.responsibleAttorneyId,
        teamMembers: caseDetails.teamMembers || [],
        budget: lead.estimatedBudget || caseDetails.budget,
        priority: lead.urgency,
        status: 'active',
        createdBy: req.user._id
      });
      await newCase.save({ session });
    }

    // 4. Update lead status
    lead.status = 'converted';
    lead.convertedToClientId = client._id;
    lead.convertedAt = new Date();
    lead.convertedBy = req.user._id;
    await lead.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Lead converted successfully',
      client: {
        id: client._id,
        clientNumber: client.clientNumber,
        displayName: client.clientType === 'individual'
          ? `${client.firstName} ${client.lastName}`
          : client.companyName
      },
      case: newCase ? {
        id: newCase._id,
        caseNumber: newCase.caseNumber,
        title: newCase.title
      } : null
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// Get conversion preview (shows what data will be transferred)
router.get('/:id/conversion-preview', authorize('leads:read'), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).lean();

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Show user exactly what fields will transfer
    const preview = {
      lead: {
        leadNumber: lead.leadNumber,
        displayName: lead.leadType === 'individual'
          ? `${lead.firstName} ${lead.lastName}`
          : lead.companyName
      },
      willTransfer: {
        basicInfo: {
          clientType: lead.leadType,
          firstName: lead.firstName,
          lastName: lead.lastName,
          companyName: lead.companyName,
          companyNameEn: lead.companyNameEn
        },
        identification: {
          nationalId: lead.nationalId,
          commercialRegistration: lead.commercialRegistration,
          vatNumber: lead.vatNumber,
          verified: lead.verification?.nationalIdVerified || lead.verification?.crVerified
        },
        contact: {
          email: lead.email,
          phone: lead.phone,
          mobile: lead.mobile,
          website: lead.website
        },
        address: lead.address,
        metadata: {
          source: lead.source,
          referredBy: lead.referredBy,
          notes: lead.notes,
          tags: lead.tags
        }
      },
      suggestedCase: lead.interestedServices?.length ? {
        caseType: lead.interestedServices[0],
        description: lead.caseDescription,
        budget: lead.estimatedBudget,
        priority: lead.urgency
      } : null
    };

    res.json(preview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## Complete Unified Data Flow

### Overview

The system ensures **NO duplicate data entry**. Data entered once flows automatically throughout all sections.

### Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA ENTRY POINTS                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│   │  Lead   │───▶│ Client  │───▶│  Case   │───▶│ Task/   │───▶│ Invoice │   │
│   │  Form   │    │  Form   │    │  Form   │    │ Time    │    │  Form   │   │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│        │              │              │              │              │         │
│        │              │              │              │              │         │
│        ▼              ▼              ▼              ▼              ▼         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     UNIFIED DATABASE                                 │   │
│   │                                                                      │   │
│   │  ┌──────┐    ┌────────┐    ┌──────┐    ┌──────────┐    ┌─────────┐  │   │
│   │  │ Lead │───▶│ Client │◀───│ Case │───▶│TimeEntry │───▶│ Invoice │  │   │
│   │  └──────┘    └────────┘    └──────┘    │  Task    │    │ Payment │  │   │
│   │                  │              │       └──────────┘    └─────────┘  │   │
│   │                  │              │              │              │       │   │
│   │                  └──────────────┴──────────────┴──────────────┘      │   │
│   │                            Entity Linking                            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1. Lead → Client Conversion (Full Data Transfer)

When converting a lead to client, ALL matching fields transfer automatically:

```javascript
// Field mapping: Lead → Client
const fieldMapping = {
  // Lead Field         → Client Field
  'leadType':           'clientType',
  'firstName':          'firstName',
  'lastName':           'lastName',
  'nationalId':         'nationalId',
  'companyName':        'companyName',
  'companyNameEn':      'companyNameEn',
  'commercialRegistration': 'commercialRegistration',
  'vatNumber':          'vatNumber',
  'email':              'email',
  'phone':              'phone',
  'mobile':             'mobile',
  'website':            'website',
  'address':            'address',        // Full nested object
  'source':             'source',
  'referredBy':         'referredBy',
  'notes':              'notes',
  'tags':               'tags',
  'verification':       'verificationData'
};
```

### 2. Client → Invoice Auto-Fill

When selecting client in invoice form, these fields auto-populate:

```javascript
// Auto-fill from Client to Invoice
const invoiceAutoFill = {
  clientId: client._id,
  clientType: client.clientType,

  // For ZATCA compliance
  clientVATNumber: client.vatNumber,
  clientCR: client.commercialRegistration,

  // Billing settings
  paymentTerms: client.paymentTerms,
  billingArrangement: client.billingArrangement,

  // For display
  clientName: client.clientType === 'individual'
    ? `${client.firstName} ${client.lastName}`
    : client.companyName,
  clientAddress: client.address,
  clientEmail: client.email,
  clientPhone: client.phone
};
```

### 3. Case → Invoice Auto-Fill

When selecting case in invoice form:

```javascript
// Auto-fill from Case to Invoice
const caseAutoFill = {
  caseId: case._id,

  // Inherit from case
  responsibleAttorneyId: case.responsibleAttorneyId,
  billingArrangement: case.billingArrangement,
  departmentId: case.departmentId,
  locationId: case.locationId,

  // Reference
  matterNumber: case.caseNumber
};
```

### 4. Time Entry → Invoice Line Item

Billable time entries automatically appear in invoice form:

```javascript
// Time Entry to Invoice Line Item transformation
const timeToLineItem = (timeEntry) => ({
  type: 'time',
  date: timeEntry.date,
  description: timeEntry.description,
  quantity: timeEntry.duration,          // Hours
  unitPrice: timeEntry.hourlyRate,
  lineTotal: timeEntry.amount,
  taxable: true,
  attorneyId: timeEntry.userId,
  activityCode: timeEntry.activityCode,
  timeEntryId: timeEntry._id            // Link back to source
});
```

### 5. Payment → Invoice Update

When payment is applied to invoice:

```javascript
// After payment application
const updateInvoice = async (invoiceId, paymentAmount, paymentId) => {
  const invoice = await Invoice.findById(invoiceId);

  // Add to payment history
  invoice.paymentHistory.push({
    paymentId,
    amount: paymentAmount,
    date: new Date(),
    method: payment.paymentMethod
  });

  // Update amounts
  invoice.amountPaid += paymentAmount;
  invoice.balanceDue = invoice.totalAmount - invoice.amountPaid;

  // Auto-update status
  if (invoice.balanceDue <= 0) {
    invoice.status = 'paid';
    invoice.paidAt = new Date();
  } else if (invoice.amountPaid > 0) {
    invoice.status = 'partial';
  }

  await invoice.save();
};
```

### 6. Complete Example: Lead to Payment Flow

```javascript
// 1. Create Lead (user enters data ONCE)
const lead = await Lead.create({
  leadType: 'corporate',
  companyName: 'شركة مجموعة ماس الاهلية',
  companyNameEn: 'Mas Al Ahliya Group',
  commercialRegistration: '2050012516',
  vatNumber: '300000000000003',
  email: 'info@masgroup.sa',
  phone: '0138174055',
  address: { city: 'الدمام', district: 'حي الفيصلية' },
  interestedServices: ['corporate', 'contract']
});

// 2. Convert Lead to Client (data transfers automatically)
const { client, case: newCase } = await convertLeadToClient(lead._id, {
  createCase: true,
  caseDetails: { title: 'استشارة تجارية' }
});
// Client now has: companyName, CR, VAT, email, phone, address - ALL auto-filled

// 3. Create Time Entry (links to client & case)
const timeEntry = await TimeEntry.create({
  clientId: client._id,           // Already linked
  caseId: newCase._id,            // Already linked
  userId: attorneyId,
  date: new Date(),
  duration: 2,
  description: 'مراجعة العقود',
  billable: true,
  hourlyRate: attorney.hourlyRate  // Auto-filled from attorney
});

// 4. Create Invoice (everything auto-populates)
const invoice = await Invoice.create({
  clientId: client._id,
  caseId: newCase._id,
  // These auto-fill from client:
  clientType: client.clientType,
  clientVATNumber: client.vatNumber,
  clientCR: client.commercialRegistration,
  paymentTerms: client.paymentTerms,
  // Line items auto-populate from billable time:
  items: [timeToLineItem(timeEntry)]
});

// 5. Receive Payment (auto-applies to invoice)
const payment = await Payment.create({
  customerId: client._id,
  amount: invoice.totalAmount,
  paymentMethod: 'bank_transfer',
  invoiceApplications: [{
    invoiceId: invoice._id,
    amount: invoice.totalAmount
  }]
});
// Invoice status automatically updates to 'paid'
```

### Frontend Auto-Fill Implementation

```typescript
// React hook for unified data loading
const useUnifiedData = () => {
  const [clientData, setClientData] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [billableItems, setBillableItems] = useState([]);

  // When client is selected anywhere
  const selectClient = async (clientId: string) => {
    const res = await fetch(`/api/clients/${clientId}/billing-info`);
    const data = await res.json();
    setClientData(data);

    // Auto-load cases for this client
    const casesRes = await fetch(`/api/cases?clientId=${clientId}`);
    const cases = await casesRes.json();
    return { client: data, cases };
  };

  // When case is selected
  const selectCase = async (caseId: string) => {
    const res = await fetch(`/api/cases/${caseId}`);
    const data = await res.json();
    setCaseData(data);

    // Auto-load billable items
    const billableRes = await fetch(`/api/invoices/billable-items?caseId=${caseId}`);
    const billable = await billableRes.json();
    setBillableItems(billable);

    return { case: data, billableItems: billable };
  };

  return { clientData, caseData, billableItems, selectClient, selectCase };
};
```

---

## Complete System Integration

### Full Entity Relationship Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    TRAF3LI UNIFIED SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                              المبيعات (SALES)                                           ││
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                          ││
│  │  │  Lead    │───▶│ Pipeline │───▶│ Referral │    │ Activity │                          ││
│  │  │ المحتمل  │    │  المسار  │    │ الإحالة  │    │  السجل   │                          ││
│  │  └────┬─────┘    └──────────┘    └────┬─────┘    └──────────┘                          ││
│  └───────┼───────────────────────────────┼─────────────────────────────────────────────────┘│
│          │ Convert                       │ Source                                            │
│          ▼                               ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                         العملاء والتواصل (CLIENTS & COMMUNICATION)                      ││
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                          ││
│  │  │  Client  │◀──▶│ Contact  │◀──▶│   Org    │    │   Team   │                          ││
│  │  │  العميل  │    │جهة الاتصال│    │ المنظمة  │    │  الفريق  │                          ││
│  │  └────┬─────┘    └──────────┘    └────┬─────┘    └────┬─────┘                          ││
│  └───────┼───────────────────────────────┼───────────────┼─────────────────────────────────┘│
│          │                               │               │                                   │
│          ▼                               ▼               ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                              الأعمال (BUSINESS)                                         ││
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                          ││
│  │  │   Case   │───▶│ Document │    │ Service  │    │   Job    │                          ││
│  │  │  القضية  │    │ المستند  │    │  الخدمة  │    │ الوظيفة  │                          ││
│  │  └────┬─────┘    └──────────┘    └──────────┘    └──────────┘                          ││
│  └───────┼─────────────────────────────────────────────────────────────────────────────────┘│
│          │                                                                                   │
│          ▼                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                             الإنتاجية (PRODUCTIVITY)                                    ││
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                          ││
│  │  │   Task   │    │ Reminder │    │  Event   │    │ Message  │                          ││
│  │  │  المهمة  │    │ التذكير  │    │  الحدث   │    │ الرسالة  │                          ││
│  │  └────┬─────┘    └──────────┘    └────┬─────┘    └──────────┘                          ││
│  └───────┼───────────────────────────────┼─────────────────────────────────────────────────┘│
│          │ Billable                      │ Billable                                          │
│          ▼                               ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                               المالية (FINANCE)                                         ││
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         ││
│  │  │TimeEntry │───▶│ Invoice  │◀───│ Payment  │    │ Expense  │    │Transaction│         ││
│  │  │تتبع الوقت│    │ الفاتورة │    │ الدفعة   │    │ المصروف  │    │ المعاملة  │         ││
│  │  └──────────┘    └────┬─────┘    └──────────┘    └──────────┘    └──────────┘         ││
│  └────────────────────────┼────────────────────────────────────────────────────────────────┘│
│                           │ Salary Payment                                                   │
│                           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                           الموارد البشرية (HR)                                          ││
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐         ││
│  │  │ Employee │───▶│  Salary  │───▶│ Payroll  │    │  Leave   │    │Attendance│         ││
│  │  │ الموظف   │    │  الراتب  │    │ المسير   │    │ الإجازة  │    │ الحضور   │         ││
│  │  └────┬─────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘         ││
│  │       │          ┌──────────┐                                                           ││
│  │       └─────────▶│Evaluation│                                                           ││
│  │                  │ التقييم  │                                                           ││
│  │                  └──────────┘                                                           ││
│  └─────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Cross-Section Data Flows

#### 1. Sales → Clients Flow
```javascript
// When Lead converts to Client
Lead (المحتمل) → Client (العميل)
├── All contact info transfers
├── Verification data transfers
├── Source/Referral tracking maintained
└── Optional: Create initial Case

// Referral tracking
Referral (الإحالة) → Client.referredBy
                   → Lead.source = 'referral'
```

#### 2. Clients → Business Flow
```javascript
// Client creates Case
Client → Case (القضية)
├── Client info auto-fills
├── Contact persons available
├── Organization links if corporate
└── Team assignment from Client.responsibleAttorney

// Case creates Documents
Case → Document (المستند)
├── Case reference auto-links
├── Client info available
└── Access permissions from Case.teamMembers
```

#### 3. Business → Productivity Flow
```javascript
// Case creates Tasks
Case → Task (المهمة)
├── Case.clientId auto-links
├── Case.teamMembers available for assignment
├── Due dates link to Case deadlines
└── Billable flag for finance

// Case creates Events (hearings, meetings)
Case → Event (الحدث)
├── Client auto-linked
├── Shows in Calendar
├── Reminder auto-created
└── Billable if client meeting

// Task creates Reminders
Task → Reminder (التذكير)
├── Due date based reminder
├── Assignee notification
└── Escalation rules
```

#### 4. Productivity → Finance Flow
```javascript
// Billable Task → Invoice
Task (billable: true) → Invoice Line Item
├── Task.description → lineItem.description
├── Task.billableAmount → lineItem.amount
├── Task.caseId → invoice.caseId
└── Task.billed = true after invoicing

// Billable Event → Invoice
Event (billable: true) → Invoice Line Item
├── Event.title → lineItem.description
├── Event.billableAmount → lineItem.amount
└── Event.billed = true after invoicing

// Time Entry → Invoice
TimeEntry → Invoice Line Item
├── TimeEntry.description → lineItem.description
├── TimeEntry.duration × hourlyRate → lineItem.amount
├── TimeEntry.userId → lineItem.attorneyId
└── TimeEntry.billed = true after invoicing
```

#### 5. HR → Finance Flow
```javascript
// Employee Salary → Payroll → Transaction
Employee → Salary (الراتب)
├── Employee.basicSalary
├── Employee.allowances
├── Employee.deductions
└── Employee.bankAccount

Salary → Payroll (مسير الرواتب)
├── Monthly aggregation
├── Attendance adjustments
├── Leave deductions
└── Generates Transactions

Payroll → Transaction (المعاملة)
├── Type: 'salary_payment'
├── Amount: netSalary
├── employeeId reference
└── Updates BankAccount balance

// Leave affects Salary
Leave (الإجازة) → Salary Calculation
├── Unpaid leave deduction
├── Sick leave rules
└── Annual leave tracking

// Attendance affects Salary
Attendance (الحضور) → Salary Calculation
├── Overtime calculation
├── Late deductions
├── Absence tracking
```

#### 6. Team/Employee Integration
```javascript
// Employee is also a User (Team member)
Employee ←→ User (فريق العمل)
├── Same person, different contexts
├── User: login, permissions, case assignment
├── Employee: HR data, salary, attendance

// Team assignment flows
User → Case.teamMembers
User → Task.assignedTo
User → TimeEntry.userId
User → Event.attendees
```

---

## Additional Schemas

### Contact Schema
```javascript
// models/Contact.js
const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  mobile: String,
  jobTitle: String,
  department: String,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  contactType: { type: String, enum: ['primary', 'billing', 'legal', 'technical', 'other'], default: 'primary' },
  isPrimary: { type: Boolean, default: false },
  address: { street: String, city: String, district: String, postalCode: String, country: { type: String, default: 'SA' } },
  notes: String,
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Organization Schema
```javascript
// models/Organization.js
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: String,
  type: { type: String, enum: ['company', 'government', 'ngo', 'court', 'law_firm', 'other'], required: true },
  commercialRegistration: String,
  unifiedNumber: String,
  vatNumber: String,
  email: String,
  phone: String,
  website: String,
  address: { street: String, city: String, district: String, postalCode: String, country: { type: String, default: 'SA' } },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Task Schema
```javascript
// models/Task.js
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  completedAt: Date,
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  billable: { type: Boolean, default: false },
  billableAmount: { type: Number, default: 0 },
  billed: { type: Boolean, default: false },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: { frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] }, interval: Number, endDate: Date },
  notes: String,
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Event Schema
```javascript
// models/Event.js
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  eventType: { type: String, enum: ['hearing', 'meeting', 'deadline', 'appointment', 'reminder', 'other'], required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  startDate: { type: Date, required: true },
  endDate: Date,
  allDay: { type: Boolean, default: false },
  location: String,
  isVirtual: { type: Boolean, default: false },
  virtualMeetingUrl: String,
  attendees: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' } }],
  externalAttendees: [{ name: String, email: String }],
  billable: { type: Boolean, default: false },
  billableAmount: { type: Number, default: 0 },
  billed: { type: Boolean, default: false },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  reminders: [{ type: { type: String, enum: ['email', 'push', 'sms'] }, minutesBefore: Number }],
  isRecurring: { type: Boolean, default: false },
  recurrenceRule: String,
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'postponed'], default: 'scheduled' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Reminder Schema
```javascript
// models/Reminder.js
const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  reminderDate: { type: Date, required: true },
  channels: [{ type: String, enum: ['email', 'push', 'sms', 'in_app'] }],
  status: { type: String, enum: ['pending', 'sent', 'snoozed', 'dismissed'], default: 'pending' },
  sentAt: Date,
  snoozeUntil: Date,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Message Schema
```javascript
// models/Message.js
const messageSchema = new mongoose.Schema({
  subject: String,
  body: { type: String, required: true },
  messageType: { type: String, enum: ['internal', 'client_email', 'sms', 'whatsapp'], default: 'internal' },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: [{ type: { type: String, enum: ['user', 'client', 'contact', 'external'] }, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' }, contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }, externalEmail: String }],
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  attachments: [{ filename: String, originalName: String, mimeType: String, size: Number, url: String }],
  status: { type: String, enum: ['draft', 'sent', 'delivered', 'read', 'failed'], default: 'draft' },
  sentAt: Date,
  readAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Referral Schema
```javascript
// models/Referral.js
const referralSchema = new mongoose.Schema({
  referrerType: { type: String, enum: ['client', 'contact', 'employee', 'external'], required: true },
  referrerClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  referrerContactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  referrerEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  referrerName: String,
  referrerEmail: String,
  referrerPhone: String,
  referredLeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  referredClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  referralDate: { type: Date, default: Date.now },
  notes: String,
  status: { type: String, enum: ['pending', 'contacted', 'converted', 'lost'], default: 'pending' },
  convertedAt: Date,
  rewardType: { type: String, enum: ['none', 'discount', 'commission', 'gift'] },
  rewardValue: Number,
  rewardPaid: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Activity Log Schema
```javascript
// models/ActivityLog.js
const activityLogSchema = new mongoose.Schema({
  action: { type: String, enum: ['created', 'updated', 'deleted', 'viewed', 'sent', 'received', 'converted', 'assigned', 'completed', 'comment'], required: true },
  description: String,
  entityType: { type: String, enum: ['lead', 'client', 'case', 'task', 'event', 'invoice', 'payment', 'document', 'message'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changes: { before: mongoose.Schema.Types.Mixed, after: mongoose.Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });
```

### Document Schema
```javascript
// models/Document.js
const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  filename: { type: String, required: true },
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  documentType: { type: String, enum: ['contract', 'court_document', 'evidence', 'correspondence', 'identification', 'financial', 'other'], default: 'other' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  version: { type: Number, default: 1 },
  parentDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  accessLevel: { type: String, enum: ['private', 'team', 'client', 'public'], default: 'team' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['draft', 'review', 'approved', 'archived'], default: 'draft' },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Service Schema
```javascript
// models/Service.js
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: String,
  description: String,
  category: { type: String, enum: ['litigation', 'consultation', 'contract', 'corporate', 'real_estate', 'labor', 'criminal', 'family', 'arbitration', 'notary', 'other'], required: true },
  pricingType: { type: String, enum: ['fixed', 'hourly', 'percentage', 'custom'], required: true },
  basePrice: Number,
  hourlyRate: Number,
  percentageRate: Number,
  estimatedDuration: String,
  isActive: { type: Boolean, default: true },
  requiredDocuments: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Employee Schema
```javascript
// models/Employee.js
const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  employeeNumber: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nationalId: { type: String, required: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female'] },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  nationality: { type: String, default: 'SA' },
  email: { type: String, required: true },
  phone: String,
  mobile: String,
  address: { street: String, city: String, district: String, postalCode: String },
  emergencyContact: { name: String, relationship: String, phone: String },
  department: String,
  position: String,
  employmentType: { type: String, enum: ['full_time', 'part_time', 'contract', 'intern'], default: 'full_time' },
  joinDate: { type: Date, required: true },
  endDate: Date,
  status: { type: String, enum: ['active', 'on_leave', 'terminated', 'resigned'], default: 'active' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  salary: { basic: { type: Number, required: true }, housing: { type: Number, default: 0 }, transportation: { type: Number, default: 0 }, other: { type: Number, default: 0 } },
  bankAccount: { bankName: String, accountNumber: String, iban: String },
  leaveBalance: { annual: { type: Number, default: 21 }, sick: { type: Number, default: 30 }, used: { annual: { type: Number, default: 0 }, sick: { type: Number, default: 0 } } },
  documents: [{ type: { type: String, enum: ['id_copy', 'contract', 'certificate', 'other'] }, filename: String, url: String, uploadedAt: Date }],
  gosiNumber: String,
  insuranceNumber: String,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Payroll Schema
```javascript
// models/Payroll.js
const payrollSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'processing', 'approved', 'paid', 'cancelled'], default: 'draft' },
  entries: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    basicSalary: Number,
    housing: Number,
    transportation: Number,
    otherAllowances: Number,
    overtime: Number,
    bonus: Number,
    totalEarnings: Number,
    gosiEmployee: Number,
    absenceDeduction: Number,
    lateDeduction: Number,
    loanDeduction: Number,
    otherDeductions: Number,
    totalDeductions: Number,
    netSalary: Number,
    paymentMethod: { type: String, enum: ['bank_transfer', 'check', 'cash'] },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: Date,
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
  }],
  totals: { totalEarnings: Number, totalDeductions: Number, totalNet: Number, employeeCount: Number },
  gosiEmployer: Number,
  gosiTotal: Number,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Leave Schema
```javascript
// models/Leave.js
const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: String, enum: ['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'hajj', 'death', 'marriage', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  attachments: [{ filename: String, url: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Attendance Schema
```javascript
// models/Attendance.js
const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  workHours: Number,
  overtime: Number,
  lateMinutes: Number,
  earlyLeaveMinutes: Number,
  status: { type: String, enum: ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday', 'weekend'], default: 'present' },
  leaveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Leave' },
  notes: String,
  checkInLocation: { latitude: Number, longitude: Number },
  checkOutLocation: { latitude: Number, longitude: Number }
}, { timestamps: true });
```

### Evaluation Schema
```javascript
// models/Evaluation.js
const evaluationSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  evaluationPeriod: { type: String, enum: ['monthly', 'quarterly', 'semi_annual', 'annual'], required: true },
  periodStart: Date,
  periodEnd: Date,
  scores: { performance: { type: Number, min: 1, max: 5 }, quality: { type: Number, min: 1, max: 5 }, punctuality: { type: Number, min: 1, max: 5 }, teamwork: { type: Number, min: 1, max: 5 }, communication: { type: Number, min: 1, max: 5 }, initiative: { type: Number, min: 1, max: 5 } },
  overallScore: Number,
  strengths: String,
  areasForImprovement: String,
  goals: String,
  evaluatorComments: String,
  employeeComments: String,
  status: { type: String, enum: ['draft', 'submitted', 'acknowledged', 'final'], default: 'draft' },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Transaction Schema
```javascript
// models/Transaction.js
const transactionSchema = new mongoose.Schema({
  transactionNumber: { type: String, unique: true, required: true },
  transactionType: { type: String, enum: ['income', 'expense', 'transfer', 'salary_payment', 'client_payment', 'vendor_payment', 'refund', 'adjustment'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  transactionDate: { type: Date, required: true },
  fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  payrollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  description: String,
  reference: String,
  isReconciled: { type: Boolean, default: false },
  reconciledAt: Date,
  reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'completed' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Expense Schema
```javascript
// models/Expense.js
const expenseSchema = new mongoose.Schema({
  expenseNumber: { type: String, unique: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['office', 'travel', 'meals', 'supplies', 'professional', 'court_fees', 'filing_fees', 'other'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  vatAmount: { type: Number, default: 0 },
  date: { type: Date, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'credit_card', 'petty_cash'], default: 'cash' },
  bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reimbursable: { type: Boolean, default: false },
  reimbursed: { type: Boolean, default: false },
  reimbursedAt: Date,
  billable: { type: Boolean, default: false },
  billed: { type: Boolean, default: false },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'rejected', 'paid'], default: 'draft' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  receipt: { filename: String, url: String },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

---

## API Endpoints Summary

### Sales (المبيعات)
```
GET/POST   /leads                    - List/Create leads
GET/PUT    /leads/:id                - Get/Update lead
POST       /leads/:id/convert        - Convert to client
GET        /leads/:id/conversion-preview
GET/POST   /referrals                - List/Create referrals
GET        /pipeline                 - Sales pipeline view
GET        /activity-log             - Activity history
```

### Clients & Communication (العملاء والتواصل)
```
GET/POST   /clients                  - List/Create clients
GET/PUT    /clients/:id              - Get/Update client
GET        /clients/:id/billing-info - Billing info for invoices
GET/POST   /contacts                 - List/Create contacts
GET/POST   /organizations            - List/Create organizations
GET        /team                     - Team members (Users)
```

### Business (الأعمال)
```
GET/POST   /cases                    - List/Create cases
GET/PUT    /cases/:id                - Get/Update case
GET        /cases/:id/financial-summary
GET/POST   /documents                - List/Create documents
GET/POST   /services                 - List/Create services
```

### Productivity (الإنتاجية)
```
GET/POST   /tasks                    - List/Create tasks
GET/PUT    /tasks/:id                - Get/Update task
GET/POST   /events                   - List/Create events
GET/PUT    /events/:id               - Get/Update event
GET/POST   /reminders                - List/Create reminders
GET/POST   /messages                 - List/Create messages
GET        /calendar                 - Calendar view
```

### Finance (المالية)
```
GET/POST   /invoices                 - List/Create invoices
GET        /invoices/billable-items  - Get unbilled items
GET/PUT    /invoices/:id             - Get/Update invoice
GET/POST   /payments                 - List/Create payments
GET        /payments/open-invoices/:clientId
POST       /payments/:id/apply       - Apply to invoices
GET/POST   /expenses                 - List/Create expenses
GET/POST   /time-entries             - List/Create time entries
GET/POST   /transactions             - List/Create transactions
GET        /accounts/dashboard       - Financial overview
```

### HR (الموارد البشرية)
```
GET/POST   /employees                - List/Create employees
GET/PUT    /employees/:id            - Get/Update employee
GET/POST   /payroll                  - List/Create payroll
POST       /payroll/:id/process      - Process payroll
GET/POST   /leaves                   - List/Create leave requests
PUT        /leaves/:id/approve       - Approve leave
GET/POST   /attendance               - List/Create attendance
GET/POST   /evaluations              - List/Create evaluations
```

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

---

## New HR Module Features (ERPNext HRMS Parity)

The following sections document the 18 new HR features added to achieve feature parity with ERPNext HRMS (Frappe HR). All features are Saudi Labor Law compliant.

### 1. Shift Types

**Model:** `ShiftType`

```javascript
const shiftTypeSchema = new mongoose.Schema({
  shiftTypeId: { type: String, unique: true }, // ST-XXXX
  name: { type: String, required: true },
  nameAr: { type: String, required: true },

  // Timing
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true }, // "17:00"

  // Auto attendance
  enableAutoAttendance: { type: Boolean, default: false },
  processAttendanceAfter: { type: Number, default: 30 },

  // Grace periods (Saudi-specific)
  beginCheckInBeforeShiftStart: { type: Number, default: 60 },
  allowCheckOutAfterShiftEnd: { type: Number, default: 60 },
  lateEntryGracePeriod: { type: Number, default: 15 },
  earlyExitGracePeriod: { type: Number, default: 15 },

  // Thresholds
  workingHoursThresholdForHalfDay: { type: Number, default: 4 },
  workingHoursThresholdForAbsent: { type: Number, default: 2 },

  // Break
  breakDuration: { type: Number, default: 60 },
  breakType: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },

  // Overtime (Saudi Labor Law Article 107: 1.5x rate)
  allowOvertime: { type: Boolean, default: true },
  maxOvertimeHours: { type: Number, default: 2 },
  overtimeMultiplier: { type: Number, default: 1.5 },

  // Ramadan (reduced hours)
  isRamadanShift: { type: Boolean, default: false },
  ramadanStartTime: String,
  ramadanEndTime: String,

  applicableDays: [{ type: String, enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] }],

  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/shift-types              - List shift types
POST   /hr/shift-types              - Create shift type
GET    /hr/shift-types/:id          - Get shift type
PATCH  /hr/shift-types/:id          - Update shift type
DELETE /hr/shift-types/:id          - Delete shift type
POST   /hr/shift-types/:id/set-default
POST   /hr/shift-types/:id/clone
GET    /hr/shift-types/stats
GET    /hr/shift-types/ramadan
```

### 2. Shift Assignments

**Model:** `ShiftAssignment`

```javascript
const shiftAssignmentSchema = new mongoose.Schema({
  assignmentId: { type: String, unique: true }, // SA-XXXX
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  shiftTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShiftType', required: true },

  startDate: { type: Date, required: true },
  endDate: Date, // null for permanent

  status: { type: String, enum: ['active', 'inactive', 'completed', 'cancelled'], default: 'active' },

  isRotational: { type: Boolean, default: false },
  rotationPattern: [{
    shiftTypeId: mongoose.Schema.Types.ObjectId,
    days: [String]
  }]
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/shift-assignments                    - List assignments
POST   /hr/shift-assignments                    - Create assignment
POST   /hr/shift-assignments/bulk               - Bulk assign
GET    /hr/shift-assignments/employee/:id       - Get employee shifts
GET    /hr/shift-assignments/employee/:id/current
```

### 3. Leave Periods

**Model:** `LeavePeriod`

```javascript
const leavePeriodSchema = new mongoose.Schema({
  periodId: { type: String, unique: true }, // LP-XXXX
  name: { type: String, required: true },
  nameAr: String,

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  allowCarryForward: { type: Boolean, default: true },
  carryForwardExpiryDate: Date,
  maxCarryForwardDays: { type: Number, default: 10 },

  isActive: { type: Boolean, default: true },
  isCurrent: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/leave-periods          - List periods
POST   /hr/leave-periods          - Create period
GET    /hr/leave-periods/current  - Get current period
POST   /hr/leave-periods/:id/close
```

### 4. Leave Policies

**Model:** `LeavePolicy`

```javascript
const leavePolicySchema = new mongoose.Schema({
  policyId: { type: String, unique: true }, // LPO-XXXX
  name: { type: String, required: true },
  nameAr: String,

  leavePolicyDetails: [{
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
    annualAllocation: { type: Number, required: true },
    allowCarryForward: { type: Boolean, default: true },
    maxCarryForwardDays: { type: Number, default: 10 },
    allowEncashment: { type: Boolean, default: false },
    maxEncashableDays: Number,
    isEarnedLeave: { type: Boolean, default: false },
    earnedLeaveFrequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'] }
  }],

  applicableFor: { type: String, enum: ['all', 'department', 'designation', 'grade'], default: 'all' },
  applicableValue: String,

  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  saudiLaborLawCompliant: { type: Boolean, default: true }
}, { timestamps: true });
```

**Saudi Labor Law Compliance:**
- Article 109: Minimum 21 days annual leave (30 after 5 years)
- Article 111: Leave encashment on termination

**Routes:**
```
GET    /hr/leave-policies              - List policies
POST   /hr/leave-policies              - Create policy
POST   /hr/leave-policies/:id/set-default
POST   /hr/leave-policies/compare      - Compare multiple policies
```

### 5. Leave Allocations

**Model:** `LeaveAllocation`

```javascript
const leaveAllocationSchema = new mongoose.Schema({
  allocationId: { type: String, unique: true }, // LA-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  leavePeriodId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeavePeriod', required: true },

  newLeavesAllocated: { type: Number, required: true },
  carryForwardedLeaves: { type: Number, default: 0 },
  totalLeavesAllocated: Number,
  leavesUsed: { type: Number, default: 0 },
  leavesBalance: Number,

  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },

  status: { type: String, enum: ['draft', 'submitted', 'approved', 'cancelled'], default: 'draft' }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/leave-allocations                  - List allocations
POST   /hr/leave-allocations                  - Create allocation
POST   /hr/leave-allocations/bulk             - Bulk allocate
POST   /hr/leave-allocations/carry-forward    - Process carry forward
GET    /hr/leave-allocations/employee/:id/balance
```

### 6. Leave Encashments

**Model:** `LeaveEncashment`

Saudi Labor Law Article 111: Employees are entitled to payment for unused leave upon termination.

```javascript
const leaveEncashmentSchema = new mongoose.Schema({
  encashmentId: { type: String, unique: true }, // LE-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  leavePeriodId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeavePeriod' },

  encashmentDays: { type: Number, required: true },
  dailyRate: { type: Number, required: true }, // (Basic + Housing) / 30
  encashmentAmount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },

  leaveBalance: Number,
  newLeaveBalance: Number,

  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'paid', 'rejected', 'cancelled'], default: 'draft' },

  requestedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  approvedBy: mongoose.Schema.Types.ObjectId,
  paidAt: Date,
  rejectionReason: String
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/leave-encashments                  - List encashments
POST   /hr/leave-encashments                  - Create encashment
POST   /hr/leave-encashments/:id/approve
POST   /hr/leave-encashments/:id/reject
POST   /hr/leave-encashments/:id/pay
POST   /hr/leave-encashments/bulk-approve
GET    /hr/leave-encashments/calculate        - Calculate amount
GET    /hr/leave-encashments/stats
```

### 7. Compensatory Leave

**Model:** `CompensatoryLeave`

```javascript
const compensatoryLeaveSchema = new mongoose.Schema({
  requestId: { type: String, unique: true }, // CL-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

  workFromDate: { type: Date, required: true },
  workEndDate: { type: Date, required: true },
  totalHoursWorked: { type: Number, required: true },

  leaveDaysAllocated: { type: Number, required: true },

  reason: { type: String, enum: ['overtime', 'weekend_work', 'holiday_work', 'emergency', 'other'], required: true },

  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'rejected', 'used', 'expired'], default: 'draft' },

  expiryDate: { type: Date, required: true }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/compensatory-leave              - List requests
POST   /hr/compensatory-leave              - Create request
POST   /hr/compensatory-leave/:id/approve
POST   /hr/compensatory-leave/:id/reject
```

### 8. Salary Components

**Model:** `SalaryComponent`

```javascript
const salaryComponentSchema = new mongoose.Schema({
  componentId: { type: String, unique: true }, // SC-XXXX
  name: { type: String, required: true },
  nameAr: String,
  abbr: { type: String, required: true }, // BASIC, HRA, TRANS

  type: { type: String, enum: ['earning', 'deduction'], required: true },

  amountBasedOnFormula: { type: Boolean, default: false },
  formula: String, // e.g., "base * 0.25"
  defaultAmount: Number,

  // Saudi-specific
  isGOSIApplicable: { type: Boolean, default: false }, // GOSI contribution
  includeInWPS: { type: Boolean, default: true }, // Wage Protection System

  isTaxApplicable: { type: Boolean, default: false },
  dependsOnPaymentDays: { type: Boolean, default: true },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

**Saudi Salary Components:**
- Basic Salary (min 60% for GOSI)
- Housing Allowance (25% of basic)
- Transportation Allowance (10% of basic)
- GOSI Deduction (9.75% employee, 11.75% employer)

**Routes:**
```
GET    /hr/salary-components              - List components
POST   /hr/salary-components              - Create component
GET    /hr/salary-components/by-type/:type
GET    /hr/salary-components/gosi-applicable
```

### 9. Employee Promotions

**Model:** `EmployeePromotion`

```javascript
const employeePromotionSchema = new mongoose.Schema({
  promotionId: { type: String, unique: true }, // EP-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  promotionDate: { type: Date, required: true },

  // Current
  currentDepartment: mongoose.Schema.Types.ObjectId,
  currentDesignation: String,
  currentGrade: String,
  currentSalary: Number,

  // New
  newDepartment: mongoose.Schema.Types.ObjectId,
  newDesignation: String,
  newGrade: String,
  revisedSalary: Number,
  salaryChangePercentage: Number,

  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'rejected', 'cancelled'], default: 'draft' }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/promotions              - List promotions
POST   /hr/promotions              - Create promotion
POST   /hr/promotions/:id/approve
POST   /hr/promotions/:id/reject
GET    /hr/promotions/employee/:id
```

### 10. Employee Transfers

**Model:** `EmployeeTransfer`

```javascript
const employeeTransferSchema = new mongoose.Schema({
  transferId: { type: String, unique: true }, // ET-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  transferDate: { type: Date, required: true },

  // Current
  currentDepartment: mongoose.Schema.Types.ObjectId,
  currentBranch: String,
  currentLocation: String,

  // New
  newDepartment: mongoose.Schema.Types.ObjectId,
  newBranch: String,
  newLocation: String,

  transferType: { type: String, enum: ['internal', 'inter_branch', 'inter_company'], default: 'internal' },

  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'rejected', 'completed', 'cancelled'], default: 'draft' },

  handoverCompleted: { type: Boolean, default: false }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/employee-transfers              - List transfers
POST   /hr/employee-transfers              - Create transfer
POST   /hr/employee-transfers/:id/approve
POST   /hr/employee-transfers/:id/complete
```

### 11. Staffing Plans

**Model:** `StaffingPlan`

```javascript
const staffingPlanSchema = new mongoose.Schema({
  planId: { type: String, unique: true }, // SP-XXXX
  name: { type: String, required: true },
  nameAr: String,

  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },

  totalEstimatedBudget: Number,
  currency: { type: String, default: 'SAR' },

  staffingDetails: [{
    department: mongoose.Schema.Types.ObjectId,
    designation: String,
    vacancies: Number,
    currentCount: Number,
    totalEstimatedCost: Number
  }],

  status: { type: String, enum: ['draft', 'submitted', 'approved', 'active', 'completed'], default: 'draft' }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/staffing-plans              - List plans
POST   /hr/staffing-plans              - Create plan
POST   /hr/staffing-plans/:id/approve
POST   /hr/staffing-plans/:id/activate
```

### 12. Retention Bonuses

**Model:** `RetentionBonus`

```javascript
const retentionBonusSchema = new mongoose.Schema({
  bonusId: { type: String, unique: true }, // RB-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

  bonusAmount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },

  bonusPaymentDate: { type: Date, required: true },
  retentionPeriodStartDate: { type: Date, required: true },
  retentionPeriodEndDate: { type: Date, required: true },

  vestingSchedule: [{
    date: Date,
    percentage: Number,
    amount: Number,
    status: { type: String, enum: ['pending', 'vested', 'forfeited'] }
  }],

  clawbackApplicable: { type: Boolean, default: true },
  clawbackPercentage: Number,

  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'active', 'paid', 'forfeited', 'cancelled'], default: 'draft' }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/retention-bonuses              - List bonuses
POST   /hr/retention-bonuses              - Create bonus
POST   /hr/retention-bonuses/:id/approve
POST   /hr/retention-bonuses/:id/pay
POST   /hr/retention-bonuses/:id/forfeit
```

### 13. Employee Incentives

**Model:** `EmployeeIncentive`

```javascript
const employeeIncentiveSchema = new mongoose.Schema({
  incentiveId: { type: String, unique: true }, // EI-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

  incentiveType: { type: String, enum: ['performance', 'spot', 'referral', 'sales', 'project', 'other'], required: true },
  incentiveAmount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },

  payrollDate: { type: Date, required: true },

  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'paid', 'rejected', 'cancelled'], default: 'draft' },

  reason: String
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/employee-incentives              - List incentives
POST   /hr/employee-incentives              - Create incentive
POST   /hr/employee-incentives/bulk         - Bulk create
POST   /hr/employee-incentives/:id/approve
POST   /hr/employee-incentives/bulk-approve
```

### 14. Vehicles

**Model:** `Vehicle`

```javascript
const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, unique: true }, // VH-XXXX

  // Saudi format: أ ب ج 1234
  licensePlate: { type: String, required: true, unique: true },
  make: String,
  model: String,
  year: Number,

  // Saudi registration
  registrationNumber: String,
  registrationExpiry: Date,
  istimaraNumber: String, // Saudi vehicle registration card
  istimaraExpiry: Date,

  // Insurance (required in KSA)
  insuranceProvider: String,
  insurancePolicyNumber: String,
  insuranceExpiry: Date,

  // Ownership
  ownershipType: { type: String, enum: ['company', 'leased', 'employee'], default: 'company' },

  // Assignment
  currentEmployeeId: mongoose.Schema.Types.ObjectId,
  assignedSince: Date,

  // Details
  fuelType: { type: String, enum: ['petrol', 'diesel', 'hybrid', 'electric'] },
  mileage: Number,

  // GPS
  gpsEnabled: { type: Boolean, default: false },

  status: { type: String, enum: ['available', 'assigned', 'maintenance', 'retired'], default: 'available' }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/vehicles              - List vehicles
POST   /hr/vehicles              - Create vehicle
POST   /hr/vehicles/:id/assign   - Assign to employee
POST   /hr/vehicles/:id/unassign
GET    /hr/vehicles/:id/logs
POST   /hr/vehicles/:id/logs     - Add log entry
GET    /hr/vehicles/maintenance-due
GET    /hr/vehicles/expiring-documents
```

### 15. Skills

**Model:** `Skill`

```javascript
const skillSchema = new mongoose.Schema({
  skillId: { type: String, unique: true }, // SK-XXXX
  name: { type: String, required: true },
  nameAr: String,

  category: { type: String, required: true }, // Technical, Soft Skills, Language
  categoryAr: String,

  proficiencyLevels: [{
    level: Number, // 1-5
    name: String,
    nameAr: String,
    description: String
  }],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/skills              - List skills
POST   /hr/skills              - Create skill
GET    /hr/skills/by-category/:category
GET    /hr/skills/categories
```

### 16. Employee Skill Map

**Model:** `EmployeeSkillMap`

```javascript
const employeeSkillMapSchema = new mongoose.Schema({
  mapId: { type: String, unique: true }, // ESM-XXXX

  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },

  proficiencyLevel: { type: Number, min: 1, max: 5, required: true },

  evaluationType: { type: String, enum: ['self', 'manager', 'peer', 'assessment', '360'] },
  evaluatedBy: mongoose.Schema.Types.ObjectId,
  evaluationDate: Date,

  // Certification
  certificationName: String,
  certificationDate: Date,
  certificationExpiry: Date,

  // Gap analysis
  requiredLevel: Number,
  gapScore: Number
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/employee-skill-maps              - List mappings
POST   /hr/employee-skill-maps              - Create mapping
POST   /hr/employee-skill-maps/bulk         - Bulk create
GET    /hr/employee-skill-maps/employee/:id
GET    /hr/employee-skill-maps/skill/:id
GET    /hr/employee-skill-maps/gap-analysis
GET    /hr/employee-skill-maps/matrix
```

### 17. HR Settings

**Model:** `HRSettings`

```javascript
const hrSettingsSchema = new mongoose.Schema({
  // Employee numbering
  employeeNumberSeries: { type: String, default: 'EMP-' },
  employeeNumberDigits: { type: Number, default: 5 },

  // Working hours (Saudi standard)
  standardWorkingHoursPerDay: { type: Number, default: 8 },
  standardWorkingDaysPerWeek: { type: Number, default: 5 },
  weekStartDay: { type: String, default: 'sunday' },

  // Leave
  leaveApprovalRequired: { type: Boolean, default: true },

  // Payroll
  payrollCutoffDay: { type: Number, default: 25 },
  paymentDay: { type: Number, default: 1 },
  currency: { type: String, default: 'SAR' },

  // GOSI (Saudi)
  gosiEnabled: { type: Boolean, default: true },
  gosiEmployeeContribution: { type: Number, default: 9.75 },
  gosiEmployerContribution: { type: Number, default: 11.75 },

  // WPS (Wage Protection System)
  wpsEnabled: { type: Boolean, default: true },
  wpsEmployerId: String,

  // End of Service (Saudi Labor Law Articles 84-87)
  eosCalculationMethod: { type: String, default: 'saudi_labor_law' },
  eosFirstFiveYearsRate: { type: Number, default: 0.5 }, // half month
  eosAfterFiveYearsRate: { type: Number, default: 1 }, // full month

  // Probation
  defaultProbationDays: { type: Number, default: 90 },

  // Document alerts
  iqamaExpiryAlertDays: { type: Number, default: 30 }
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/settings              - Get settings
PATCH  /hr/settings              - Update settings
GET    /hr/settings/gosi
PATCH  /hr/settings/gosi
GET    /hr/settings/wps
PATCH  /hr/settings/wps
```

### 18. HR Setup Wizard

**Model:** `HRSetupWizardState`

```javascript
const hrSetupWizardStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  currentStep: { type: Number, default: 1 },
  completedSteps: [Number],

  // Step completion flags
  companyInfoCompleted: { type: Boolean, default: false },
  departmentsCompleted: { type: Boolean, default: false },
  designationsCompleted: { type: Boolean, default: false },
  leaveTypesCompleted: { type: Boolean, default: false },
  shiftTypesCompleted: { type: Boolean, default: false },
  salaryComponentsCompleted: { type: Boolean, default: false },
  leavePolicyCompleted: { type: Boolean, default: false },
  holidayCalendarCompleted: { type: Boolean, default: false },
  hrSettingsCompleted: { type: Boolean, default: false },
  firstEmployeeCompleted: { type: Boolean, default: false },

  wizardCompleted: { type: Boolean, default: false },
  completedAt: Date
}, { timestamps: true });
```

**Routes:**
```
GET    /hr/setup-wizard              - Get state
POST   /hr/setup-wizard/start        - Start wizard
PATCH  /hr/setup-wizard/step/:step   - Update step
POST   /hr/setup-wizard/complete-step/:step
POST   /hr/setup-wizard/complete
POST   /hr/setup-wizard/reset
GET    /hr/setup-wizard/templates    - Get templates
POST   /hr/setup-wizard/apply-template/:id
```

---

## Saudi Compliance Summary

### GOSI (General Organization for Social Insurance)

| Contribution | Employee | Employer |
|--------------|----------|----------|
| Retirement | 9.75% | 9.75% |
| Hazard | 0% | 2% |
| **Total** | **9.75%** | **11.75%** |

### WPS (Wage Protection System)

All companies must register salaries through WPS. Include employee bank details, monthly salary, and allowances.

### Key Labor Law Articles

| Article | Topic | Implementation |
|---------|-------|----------------|
| 53 | Working Hours | Max 8 hrs/day, 48 hrs/week |
| 84-87 | End of Service | EOS calculation |
| 107 | Overtime | 1.5x rate |
| 109 | Annual Leave | 21 days (30 after 5 years) |
| 111 | Leave Encashment | Payment for unused leave |
| 113 | Sick Leave | 120 days total |

---

## Database Indexes for New Features

```javascript
// Shift Types
db.shiftTypes.createIndex({ shiftTypeId: 1 }, { unique: true });
db.shiftTypes.createIndex({ isActive: 1, isDefault: 1 });

// Shift Assignments
db.shiftAssignments.createIndex({ assignmentId: 1 }, { unique: true });
db.shiftAssignments.createIndex({ employeeId: 1, status: 1 });

// Leave Periods
db.leavePeriods.createIndex({ periodId: 1 }, { unique: true });
db.leavePeriods.createIndex({ isCurrent: 1 });

// Leave Policies
db.leavePolicies.createIndex({ policyId: 1 }, { unique: true });

// Leave Allocations
db.leaveAllocations.createIndex({ allocationId: 1 }, { unique: true });
db.leaveAllocations.createIndex({ employeeId: 1, leavePeriodId: 1 });

// Leave Encashments
db.leaveEncashments.createIndex({ encashmentId: 1 }, { unique: true });
db.leaveEncashments.createIndex({ employeeId: 1, status: 1 });

// Salary Components
db.salaryComponents.createIndex({ componentId: 1 }, { unique: true });
db.salaryComponents.createIndex({ type: 1, isActive: 1 });

// Vehicles
db.vehicles.createIndex({ vehicleId: 1 }, { unique: true });
db.vehicles.createIndex({ licensePlate: 1 }, { unique: true });

// Skills
db.skills.createIndex({ skillId: 1 }, { unique: true });
db.skills.createIndex({ category: 1 });

// Employee Skill Maps
db.employeeSkillMaps.createIndex({ employeeId: 1, skillId: 1 }, { unique: true });
```

---

## Implementation Priority

**Phase 1 (Critical):**
1. Shift Types & Assignments
2. Leave Policies & Allocations
3. Salary Components
4. HR Settings

**Phase 2 (Important):**
5. Leave Encashments
6. Employee Promotions & Transfers
7. Retention Bonuses & Incentives

**Phase 3 (Enhancement):**
8. Compensatory Leave
9. Staffing Plans
10. Vehicles
11. Skills & Skill Map
12. HR Setup Wizard
