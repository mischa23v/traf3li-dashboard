# Subscriptions Backend Implementation Guide

## Overview

This guide provides comprehensive instructions for implementing the Subscriptions feature backend for the legal practice management system. Based on research from Odoo's subscription module and Dolibarr's membership system, adapted for legal industry requirements.

---

## Table of Contents

1. [Database Schemas](#1-database-schemas)
2. [Enums & Constants](#2-enums--constants)
3. [API Endpoints](#3-api-endpoints)
4. [Validation Rules](#4-validation-rules)
5. [Business Logic](#5-business-logic)
6. [Scheduled Jobs](#6-scheduled-jobs)
7. [Code Examples](#7-code-examples)

---

## 1. Database Schemas

### 1.1 SubscriptionPlan Schema (MongoDB/Mongoose)

```javascript
// models/SubscriptionPlan.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubscriptionPlanSchema = new Schema({
  // Firm reference
  firmId: {
    type: Schema.Types.ObjectId,
    ref: 'Firm',
    required: true,
    index: true
  },

  // Basic Information
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [200, 'Plan name cannot exceed 200 characters']
  },
  nameAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic plan name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  descriptionAr: {
    type: String,
    maxlength: [2000, 'Arabic description cannot exceed 2000 characters']
  },
  planType: {
    type: String,
    required: true,
    enum: ['retainer', 'hourly_package', 'flat_fee', 'hybrid', 'compliance', 'document_review', 'advisory'],
    default: 'retainer'
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Code cannot exceed 50 characters'],
    sparse: true // Allow null but unique when set
  },

  // Pricing
  billingPeriod: {
    type: String,
    required: true,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    enum: ['SAR', 'USD', 'EUR', 'GBP', 'AED'],
    default: 'SAR'
  },
  setupFee: {
    type: Number,
    default: 0,
    min: [0, 'Setup fee cannot be negative']
  },

  // Legal-specific: Hours & Services
  includedHours: {
    type: Number,
    default: 0,
    min: [0, 'Included hours cannot be negative']
  },
  hourlyRateAfter: {
    type: Number,
    default: 0,
    min: [0, 'Hourly rate cannot be negative']
  },
  includedServices: [{
    type: String,
    trim: true
  }],
  serviceCategories: [{
    type: String,
    trim: true
  }],

  // Trial Settings
  trialDays: {
    type: Number,
    default: 0,
    min: [0, 'Trial days cannot be negative'],
    max: [365, 'Trial days cannot exceed 365']
  },
  trialAmount: {
    type: Number,
    default: 0,
    min: [0, 'Trial amount cannot be negative']
  },

  // Automation Settings
  autoRenew: {
    type: Boolean,
    default: true
  },
  autoInvoice: {
    type: Boolean,
    default: true
  },
  invoiceDaysBefore: {
    type: Number,
    default: 7,
    min: [0, 'Invoice days cannot be negative'],
    max: [60, 'Invoice days cannot exceed 60']
  },
  reminderDays: [{
    type: Number,
    min: 0,
    max: 60
  }],
  autoCloseDays: {
    type: Number,
    default: 30,
    min: [0, 'Auto close days cannot be negative']
  },

  // Proration Settings
  prorationBehavior: {
    type: String,
    enum: ['create_prorations', 'none', 'always_invoice'],
    default: 'create_prorations'
  },
  alignToPeriodStart: {
    type: Boolean,
    default: false
  },

  // Limits
  maxClients: {
    type: Number,
    min: [0, 'Max clients cannot be negative']
  },
  maxCases: {
    type: Number,
    min: [0, 'Max cases cannot be negative']
  },

  // Status & Display
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },

  // Audit Fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
SubscriptionPlanSchema.index({ firmId: 1, code: 1 }, { unique: true, sparse: true });
SubscriptionPlanSchema.index({ firmId: 1, isActive: 1, sortOrder: 1 });
SubscriptionPlanSchema.index({ firmId: 1, planType: 1 });
SubscriptionPlanSchema.index({ firmId: 1, '$**': 'text' }); // Text search

// Virtual for subscription count
SubscriptionPlanSchema.virtual('subscriptionCount', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'planId',
  count: true
});

// Pre-save middleware
SubscriptionPlanSchema.pre('save', function(next) {
  // Generate code if not provided
  if (!this.code && this.isNew) {
    const prefix = this.planType.substring(0, 3).toUpperCase();
    this.code = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
```

### 1.2 Subscription Schema (MongoDB/Mongoose)

```javascript
// models/Subscription.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// History entry sub-schema
const HistoryEntrySchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'created', 'activated', 'pause', 'resume', 'cancel', 'renew',
      'upgrade', 'downgrade', 'updated', 'payment_received',
      'hours_consumed', 'generate_invoice', 'expired', 'completed'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  details: String,
  previousStatus: String,
  newStatus: String,
  previousAmount: Number,
  newAmount: Number,
  metadata: Schema.Types.Mixed
}, { _id: true });

const SubscriptionSchema = new Schema({
  // Firm reference
  firmId: {
    type: Schema.Types.ObjectId,
    ref: 'Firm',
    required: true,
    index: true
  },

  // Reference Numbers
  subscriptionNumber: {
    type: String,
    required: true,
    unique: true
  },
  externalRef: {
    type: String,
    trim: true
  },

  // Plan Reference
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: [true, 'Plan is required'],
    index: true
  },
  planSnapshot: {
    type: Schema.Types.Mixed // Stores plan details at subscription time
  },

  // Client/Case Association
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
    index: true
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    index: true
  },

  // Dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date // For fixed-term subscriptions
  },
  nextBillingDate: {
    type: Date,
    required: true,
    index: true
  },
  lastBillingDate: Date,
  trialEndDate: Date,

  // Billing Details
  billingPeriod: {
    type: String,
    required: true,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    enum: ['SAR', 'USD', 'EUR', 'GBP', 'AED'],
    default: 'SAR'
  },
  setupFee: {
    type: Number,
    default: 0
  },
  setupFeeInvoiced: {
    type: Boolean,
    default: false
  },

  // Hours Tracking (Legal-specific)
  includedHours: {
    type: Number,
    default: 0
  },
  usedHours: {
    type: Number,
    default: 0,
    min: 0
  },
  hourlyRateAfter: {
    type: Number,
    default: 0
  },
  totalHoursUsed: {
    type: Number,
    default: 0,
    min: 0
  },

  // Status
  status: {
    type: String,
    required: true,
    enum: ['draft', 'trial', 'active', 'paused', 'past_due', 'cancelled', 'expired', 'completed'],
    default: 'draft',
    index: true
  },
  pausedAt: Date,
  pauseReason: String,
  cancelledAt: Date,
  cancelReason: String,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },

  // Automation
  autoRenew: {
    type: Boolean,
    default: true
  },
  autoInvoice: {
    type: Boolean,
    default: true
  },

  // Financial Metrics
  mrr: {
    type: Number,
    default: 0 // Monthly Recurring Revenue (normalized)
  },

  // Invoice Tracking
  generatedInvoiceIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
  totalInvoiced: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },

  // Notes
  notes: String,
  notesAr: String,
  internalNotes: String,

  // History
  history: [HistoryEntrySchema],

  // Audit
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
SubscriptionSchema.index({ firmId: 1, status: 1, nextBillingDate: 1 });
SubscriptionSchema.index({ firmId: 1, clientId: 1, status: 1 });
SubscriptionSchema.index({ firmId: 1, subscriptionNumber: 1 }, { unique: true });
SubscriptionSchema.index({ status: 1, nextBillingDate: 1 }); // For scheduled jobs
SubscriptionSchema.index({ status: 1, cancelAtPeriodEnd: 1, nextBillingDate: 1 });

// Virtual for remaining hours
SubscriptionSchema.virtual('remainingHours').get(function() {
  return Math.max(0, (this.includedHours || 0) - (this.usedHours || 0));
});

// Virtual for hours usage percentage
SubscriptionSchema.virtual('hoursUsagePercent').get(function() {
  if (!this.includedHours || this.includedHours === 0) return 0;
  return Math.min(100, Math.round((this.usedHours / this.includedHours) * 100));
});

// Pre-save: Generate subscription number
SubscriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.subscriptionNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Subscription').countDocuments({
      firmId: this.firmId,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.subscriptionNumber = `SUB-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Pre-save: Calculate MRR
SubscriptionSchema.pre('save', function(next) {
  // Calculate MRR based on billing period
  const periodMultipliers = {
    weekly: 4.33,
    biweekly: 2.17,
    monthly: 1,
    quarterly: 0.33,
    semi_annually: 0.167,
    annually: 0.083
  };
  this.mrr = Math.round(this.amount * (periodMultipliers[this.billingPeriod] || 1) * 100) / 100;
  next();
});

// Method to add history entry
SubscriptionSchema.methods.addHistory = function(action, userId, userName, details, metadata = {}) {
  const entry = {
    action,
    timestamp: new Date(),
    userId,
    userName,
    details,
    previousStatus: this.status,
    metadata
  };
  this.history.push(entry);
  return entry;
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);
```

---

## 2. Enums & Constants

```javascript
// constants/subscriptionEnums.js

/**
 * Billing period options with display labels and period calculations
 */
const BILLING_PERIODS = {
  weekly: {
    value: 'weekly',
    labelEn: 'Weekly',
    labelAr: 'أسبوعياً',
    days: 7,
    monthlyMultiplier: 4.33
  },
  biweekly: {
    value: 'biweekly',
    labelEn: 'Biweekly',
    labelAr: 'كل أسبوعين',
    days: 14,
    monthlyMultiplier: 2.17
  },
  monthly: {
    value: 'monthly',
    labelEn: 'Monthly',
    labelAr: 'شهرياً',
    days: 30,
    monthlyMultiplier: 1
  },
  quarterly: {
    value: 'quarterly',
    labelEn: 'Quarterly',
    labelAr: 'ربع سنوي',
    days: 90,
    monthlyMultiplier: 0.33
  },
  semi_annually: {
    value: 'semi_annually',
    labelEn: 'Semi-Annually',
    labelAr: 'نصف سنوي',
    days: 180,
    monthlyMultiplier: 0.167
  },
  annually: {
    value: 'annually',
    labelEn: 'Annually',
    labelAr: 'سنوياً',
    days: 365,
    monthlyMultiplier: 0.083
  }
};

/**
 * Subscription status lifecycle
 */
const SUBSCRIPTION_STATUS = {
  draft: {
    value: 'draft',
    labelEn: 'Draft',
    labelAr: 'مسودة',
    color: 'gray',
    allowedTransitions: ['trial', 'active', 'cancelled']
  },
  trial: {
    value: 'trial',
    labelEn: 'Trial',
    labelAr: 'فترة تجريبية',
    color: 'purple',
    allowedTransitions: ['active', 'cancelled', 'expired']
  },
  active: {
    value: 'active',
    labelEn: 'Active',
    labelAr: 'نشط',
    color: 'green',
    allowedTransitions: ['paused', 'past_due', 'cancelled', 'expired', 'completed']
  },
  paused: {
    value: 'paused',
    labelEn: 'Paused',
    labelAr: 'متوقف مؤقتاً',
    color: 'yellow',
    allowedTransitions: ['active', 'cancelled']
  },
  past_due: {
    value: 'past_due',
    labelEn: 'Past Due',
    labelAr: 'متأخر السداد',
    color: 'red',
    allowedTransitions: ['active', 'cancelled', 'expired']
  },
  cancelled: {
    value: 'cancelled',
    labelEn: 'Cancelled',
    labelAr: 'ملغي',
    color: 'red',
    allowedTransitions: [] // Terminal state
  },
  expired: {
    value: 'expired',
    labelEn: 'Expired',
    labelAr: 'منتهي',
    color: 'gray',
    allowedTransitions: ['active'] // Can reactivate
  },
  completed: {
    value: 'completed',
    labelEn: 'Completed',
    labelAr: 'مكتمل',
    color: 'blue',
    allowedTransitions: [] // Terminal state for fixed-term
  }
};

/**
 * Subscription plan types for legal services
 */
const PLAN_TYPES = {
  retainer: {
    value: 'retainer',
    labelEn: 'Monthly Retainer',
    labelAr: 'توكيل شهري',
    description: 'Fixed monthly fee for ongoing legal services',
    color: 'bg-blue-100 text-blue-700'
  },
  hourly_package: {
    value: 'hourly_package',
    labelEn: 'Hourly Package',
    labelAr: 'باقة ساعات',
    description: 'Prepaid hours package at discounted rate',
    color: 'bg-purple-100 text-purple-700'
  },
  flat_fee: {
    value: 'flat_fee',
    labelEn: 'Flat Fee',
    labelAr: 'رسوم ثابتة',
    description: 'Fixed fee for specific services',
    color: 'bg-green-100 text-green-700'
  },
  hybrid: {
    value: 'hybrid',
    labelEn: 'Hybrid',
    labelAr: 'مختلط',
    description: 'Combination of flat fee and hourly billing',
    color: 'bg-amber-100 text-amber-700'
  },
  compliance: {
    value: 'compliance',
    labelEn: 'Compliance',
    labelAr: 'امتثال',
    description: 'Ongoing regulatory compliance monitoring',
    color: 'bg-rose-100 text-rose-700'
  },
  document_review: {
    value: 'document_review',
    labelEn: 'Document Review',
    labelAr: 'مراجعة مستندات',
    description: 'Regular document review and drafting services',
    color: 'bg-indigo-100 text-indigo-700'
  },
  advisory: {
    value: 'advisory',
    labelEn: 'Advisory',
    labelAr: 'استشاري',
    description: 'Strategic legal advisory services',
    color: 'bg-emerald-100 text-emerald-700'
  }
};

/**
 * Proration behavior options
 */
const PRORATION_BEHAVIOR = {
  create_prorations: {
    value: 'create_prorations',
    labelEn: 'Create Prorations',
    labelAr: 'حساب التناسب',
    description: 'Calculate prorated amounts for mid-cycle changes'
  },
  none: {
    value: 'none',
    labelEn: 'No Proration',
    labelAr: 'بدون تناسب',
    description: 'Changes take effect at next billing period'
  },
  always_invoice: {
    value: 'always_invoice',
    labelEn: 'Always Invoice',
    labelAr: 'فوترة فورية',
    description: 'Invoice immediately for any changes'
  }
};

/**
 * Supported currencies
 */
const CURRENCIES = {
  SAR: { value: 'SAR', symbol: 'ر.س', labelEn: 'Saudi Riyal', labelAr: 'ريال سعودي' },
  USD: { value: 'USD', symbol: '$', labelEn: 'US Dollar', labelAr: 'دولار أمريكي' },
  EUR: { value: 'EUR', symbol: '€', labelEn: 'Euro', labelAr: 'يورو' },
  GBP: { value: 'GBP', symbol: '£', labelEn: 'British Pound', labelAr: 'جنيه إسترليني' },
  AED: { value: 'AED', symbol: 'د.إ', labelEn: 'UAE Dirham', labelAr: 'درهم إماراتي' }
};

module.exports = {
  BILLING_PERIODS,
  SUBSCRIPTION_STATUS,
  PLAN_TYPES,
  PRORATION_BEHAVIOR,
  CURRENCIES
};
```

---

## 3. API Endpoints

### 3.1 Subscription Plans API

```javascript
// routes/subscriptionPlans.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const planController = require('../controllers/subscriptionPlanController');
const { validateBody, validateQuery } = require('../middleware/validate');
const { planSchemas } = require('../validators/subscriptionValidators');

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/v1/subscription-plans
 * List all subscription plans with filtering and pagination
 */
router.get('/',
  authorize('subscription_plans:read'),
  validateQuery(planSchemas.listQuery),
  planController.listPlans
);

/**
 * GET /api/v1/subscription-plans/:id
 * Get single subscription plan by ID
 */
router.get('/:id',
  authorize('subscription_plans:read'),
  planController.getPlan
);

/**
 * POST /api/v1/subscription-plans
 * Create new subscription plan
 */
router.post('/',
  authorize('subscription_plans:create'),
  validateBody(planSchemas.create),
  planController.createPlan
);

/**
 * PUT /api/v1/subscription-plans/:id
 * Update subscription plan
 */
router.put('/:id',
  authorize('subscription_plans:update'),
  validateBody(planSchemas.update),
  planController.updatePlan
);

/**
 * DELETE /api/v1/subscription-plans/:id
 * Delete subscription plan (soft delete)
 */
router.delete('/:id',
  authorize('subscription_plans:delete'),
  planController.deletePlan
);

/**
 * POST /api/v1/subscription-plans/:id/duplicate
 * Duplicate a subscription plan
 */
router.post('/:id/duplicate',
  authorize('subscription_plans:create'),
  planController.duplicatePlan
);

/**
 * PATCH /api/v1/subscription-plans/:id/toggle-active
 * Toggle plan active status
 */
router.patch('/:id/toggle-active',
  authorize('subscription_plans:update'),
  planController.toggleActive
);

module.exports = router;
```

### 3.2 Subscription Plans Controller

```javascript
// controllers/subscriptionPlanController.js
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { buildQuery, paginate } = require('../utils/queryBuilder');

/**
 * List subscription plans with filtering and pagination
 */
exports.listPlans = catchAsync(async (req, res) => {
  const {
    search,
    planType,
    billingPeriod,
    isActive,
    sortBy = 'sortOrder',
    sortOrder = 'asc',
    page = 1,
    limit = 20
  } = req.query;

  // Build filter
  const filter = { firmId: req.user.firmId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { nameAr: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (planType) {
    filter.planType = planType;
  }

  if (billingPeriod) {
    filter.billingPeriod = billingPeriod;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  // Build sort
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  // Execute query with pagination
  const [plans, total] = await Promise.all([
    SubscriptionPlan.find(filter)
      .populate('subscriptionCount')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    SubscriptionPlan.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: plans,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get single subscription plan
 */
exports.getPlan = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  }).populate('subscriptionCount');

  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  res.json({
    success: true,
    data: plan
  });
});

/**
 * Create new subscription plan
 */
exports.createPlan = catchAsync(async (req, res) => {
  const plan = new SubscriptionPlan({
    ...req.body,
    firmId: req.user.firmId,
    createdBy: req.user._id
  });

  await plan.save();

  res.status(201).json({
    success: true,
    data: plan,
    message: 'Subscription plan created successfully'
  });
});

/**
 * Update subscription plan
 */
exports.updatePlan = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.findOneAndUpdate(
    { _id: req.params.id, firmId: req.user.firmId },
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  );

  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  res.json({
    success: true,
    data: plan,
    message: 'Subscription plan updated successfully'
  });
});

/**
 * Delete subscription plan
 */
exports.deletePlan = catchAsync(async (req, res) => {
  // Check for active subscriptions
  const activeCount = await Subscription.countDocuments({
    planId: req.params.id,
    status: { $in: ['active', 'trial', 'paused'] }
  });

  if (activeCount > 0) {
    throw new AppError(
      `Cannot delete plan with ${activeCount} active subscription(s). Deactivate them first.`,
      400
    );
  }

  const plan = await SubscriptionPlan.findOneAndDelete({
    _id: req.params.id,
    firmId: req.user.firmId
  });

  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  res.json({
    success: true,
    message: 'Subscription plan deleted successfully'
  });
});

/**
 * Duplicate subscription plan
 */
exports.duplicatePlan = catchAsync(async (req, res) => {
  const original = await SubscriptionPlan.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  });

  if (!original) {
    throw new AppError('Subscription plan not found', 404);
  }

  // Create duplicate
  const duplicateData = original.toObject();
  delete duplicateData._id;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;
  delete duplicateData.code;

  duplicateData.name = `${original.name} (Copy)`;
  if (duplicateData.nameAr) {
    duplicateData.nameAr = `${original.nameAr} (نسخة)`;
  }
  duplicateData.isActive = false; // Start inactive
  duplicateData.createdBy = req.user._id;

  const duplicate = new SubscriptionPlan(duplicateData);
  await duplicate.save();

  res.status(201).json({
    success: true,
    data: duplicate,
    message: 'Subscription plan duplicated successfully'
  });
});

/**
 * Toggle plan active status
 */
exports.toggleActive = catchAsync(async (req, res) => {
  const plan = await SubscriptionPlan.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  });

  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  plan.isActive = !plan.isActive;
  plan.updatedBy = req.user._id;
  await plan.save();

  res.json({
    success: true,
    data: plan,
    message: `Subscription plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`
  });
});
```

### 3.3 Subscriptions API

```javascript
// routes/subscriptions.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const subController = require('../controllers/subscriptionController');
const { validateBody, validateQuery } = require('../middleware/validate');
const { subscriptionSchemas } = require('../validators/subscriptionValidators');

router.use(authenticate);

/**
 * GET /api/v1/subscriptions
 * List subscriptions with filtering and pagination
 */
router.get('/',
  authorize('subscriptions:read'),
  validateQuery(subscriptionSchemas.listQuery),
  subController.listSubscriptions
);

/**
 * GET /api/v1/subscriptions/stats
 * Get subscription statistics/metrics
 */
router.get('/stats',
  authorize('subscriptions:read'),
  subController.getStats
);

/**
 * GET /api/v1/subscriptions/:id
 * Get single subscription with full details
 */
router.get('/:id',
  authorize('subscriptions:read'),
  subController.getSubscription
);

/**
 * POST /api/v1/subscriptions
 * Create new subscription
 */
router.post('/',
  authorize('subscriptions:create'),
  validateBody(subscriptionSchemas.create),
  subController.createSubscription
);

/**
 * PUT /api/v1/subscriptions/:id
 * Update subscription
 */
router.put('/:id',
  authorize('subscriptions:update'),
  validateBody(subscriptionSchemas.update),
  subController.updateSubscription
);

/**
 * DELETE /api/v1/subscriptions/:id
 * Delete subscription (only drafts)
 */
router.delete('/:id',
  authorize('subscriptions:delete'),
  subController.deleteSubscription
);

// === Status Actions ===

/**
 * POST /api/v1/subscriptions/:id/activate
 * Activate a draft/trial subscription
 */
router.post('/:id/activate',
  authorize('subscriptions:update'),
  subController.activateSubscription
);

/**
 * POST /api/v1/subscriptions/:id/pause
 * Pause an active subscription
 */
router.post('/:id/pause',
  authorize('subscriptions:update'),
  validateBody(subscriptionSchemas.pause),
  subController.pauseSubscription
);

/**
 * POST /api/v1/subscriptions/:id/resume
 * Resume a paused subscription
 */
router.post('/:id/resume',
  authorize('subscriptions:update'),
  subController.resumeSubscription
);

/**
 * POST /api/v1/subscriptions/:id/cancel
 * Cancel a subscription
 */
router.post('/:id/cancel',
  authorize('subscriptions:update'),
  validateBody(subscriptionSchemas.cancel),
  subController.cancelSubscription
);

/**
 * POST /api/v1/subscriptions/:id/renew
 * Manually renew a subscription
 */
router.post('/:id/renew',
  authorize('subscriptions:update'),
  subController.renewSubscription
);

// === Billing Actions ===

/**
 * POST /api/v1/subscriptions/:id/generate-invoice
 * Manually generate invoice for current period
 */
router.post('/:id/generate-invoice',
  authorize('subscriptions:update'),
  subController.generateInvoice
);

// === Hours Actions ===

/**
 * POST /api/v1/subscriptions/:id/consume-hours
 * Record hours usage against subscription
 */
router.post('/:id/consume-hours',
  authorize('subscriptions:update'),
  validateBody(subscriptionSchemas.consumeHours),
  subController.consumeHours
);

/**
 * POST /api/v1/subscriptions/:id/reset-hours
 * Reset hours for new billing period
 */
router.post('/:id/reset-hours',
  authorize('subscriptions:update'),
  subController.resetHours
);

module.exports = router;
```

### 3.4 API Request/Response Examples

#### List Plans Request
```http
GET /api/v1/subscription-plans?planType=retainer&isActive=true&page=1&limit=10
Authorization: Bearer <token>
```

#### List Plans Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "6789abc123",
      "name": "Standard Retainer",
      "nameAr": "توكيل قياسي",
      "planType": "retainer",
      "billingPeriod": "monthly",
      "amount": 5000,
      "currency": "SAR",
      "includedHours": 10,
      "hourlyRateAfter": 500,
      "isActive": true,
      "subscriptionCount": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Create Subscription Request
```http
POST /api/v1/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "6789abc123",
  "clientId": "client456",
  "caseId": "case789",
  "startDate": "2025-02-01",
  "billingPeriod": "monthly",
  "amount": 5000,
  "currency": "SAR",
  "includedHours": 10,
  "hourlyRateAfter": 500,
  "autoRenew": true,
  "autoInvoice": true,
  "notes": "Corporate retainer agreement"
}
```

#### Create Subscription Response
```json
{
  "success": true,
  "data": {
    "_id": "sub123xyz",
    "subscriptionNumber": "SUB-2025-0001",
    "planId": "6789abc123",
    "clientId": "client456",
    "status": "draft",
    "startDate": "2025-02-01T00:00:00.000Z",
    "nextBillingDate": "2025-02-01T00:00:00.000Z",
    "billingPeriod": "monthly",
    "amount": 5000,
    "currency": "SAR",
    "includedHours": 10,
    "usedHours": 0,
    "remainingHours": 10,
    "mrr": 5000,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Subscription created successfully"
}
```

#### Cancel Subscription Request
```http
POST /api/v1/subscriptions/sub123xyz/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancelReason": "Client requested cancellation",
  "cancelAtPeriodEnd": true
}
```

#### Consume Hours Request
```http
POST /api/v1/subscriptions/sub123xyz/consume-hours
Authorization: Bearer <token>
Content-Type: application/json

{
  "hours": 2.5,
  "description": "Contract review - Al-Faisal agreement",
  "taskId": "task789",
  "timeEntryId": "time456"
}
```

#### Consume Hours Response
```json
{
  "success": true,
  "data": {
    "subscription": {
      "_id": "sub123xyz",
      "includedHours": 10,
      "usedHours": 7.5,
      "remainingHours": 2.5,
      "hoursUsagePercent": 75
    },
    "hoursConsumed": 2.5,
    "previousUsed": 5,
    "newUsed": 7.5,
    "overageHours": 0,
    "overageCharge": 0
  },
  "message": "Hours consumed successfully"
}
```

#### Get Statistics Response
```json
{
  "success": true,
  "data": {
    "totalSubscriptions": 45,
    "byStatus": {
      "active": 32,
      "trial": 5,
      "paused": 3,
      "past_due": 2,
      "cancelled": 3
    },
    "mrr": 156000,
    "arr": 1872000,
    "averageSubscriptionValue": 4875,
    "churnRate": 6.67,
    "upcomingRenewals": 8,
    "expiringTrials": 3
  }
}
```

---

## 4. Validation Rules

### 4.1 Joi Validation Schemas

```javascript
// validators/subscriptionValidators.js
const Joi = require('joi');

const planSchemas = {
  // Create plan validation
  create: Joi.object({
    name: Joi.string().required().max(200).messages({
      'string.empty': 'Plan name is required',
      'string.max': 'Plan name cannot exceed 200 characters'
    }),
    nameAr: Joi.string().max(200).allow('', null),
    description: Joi.string().max(2000).allow('', null),
    descriptionAr: Joi.string().max(2000).allow('', null),
    planType: Joi.string().valid(
      'retainer', 'hourly_package', 'flat_fee', 'hybrid',
      'compliance', 'document_review', 'advisory'
    ).required(),
    code: Joi.string().max(50).uppercase().allow('', null),

    // Pricing
    billingPeriod: Joi.string().valid(
      'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually'
    ).required(),
    amount: Joi.number().min(0).required().messages({
      'number.min': 'Amount cannot be negative'
    }),
    currency: Joi.string().valid('SAR', 'USD', 'EUR', 'GBP', 'AED').default('SAR'),
    setupFee: Joi.number().min(0).default(0),

    // Hours
    includedHours: Joi.number().min(0).default(0),
    hourlyRateAfter: Joi.number().min(0).default(0),
    includedServices: Joi.array().items(Joi.string().trim()),
    serviceCategories: Joi.array().items(Joi.string().trim()),

    // Trial
    trialDays: Joi.number().integer().min(0).max(365).default(0),
    trialAmount: Joi.number().min(0).default(0),

    // Automation
    autoRenew: Joi.boolean().default(true),
    autoInvoice: Joi.boolean().default(true),
    invoiceDaysBefore: Joi.number().integer().min(0).max(60).default(7),
    reminderDays: Joi.array().items(Joi.number().integer().min(0).max(60)),
    autoCloseDays: Joi.number().integer().min(0).default(30),

    // Proration
    prorationBehavior: Joi.string().valid(
      'create_prorations', 'none', 'always_invoice'
    ).default('create_prorations'),
    alignToPeriodStart: Joi.boolean().default(false),

    // Limits
    maxClients: Joi.number().integer().min(0).allow(null),
    maxCases: Joi.number().integer().min(0).allow(null),

    // Status
    isActive: Joi.boolean().default(true),
    isPublic: Joi.boolean().default(false),
    sortOrder: Joi.number().integer().default(0)
  }),

  // Update plan validation (all fields optional)
  update: Joi.object({
    name: Joi.string().max(200),
    nameAr: Joi.string().max(200).allow('', null),
    description: Joi.string().max(2000).allow('', null),
    descriptionAr: Joi.string().max(2000).allow('', null),
    planType: Joi.string().valid(
      'retainer', 'hourly_package', 'flat_fee', 'hybrid',
      'compliance', 'document_review', 'advisory'
    ),
    code: Joi.string().max(50).uppercase().allow('', null),
    billingPeriod: Joi.string().valid(
      'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually'
    ),
    amount: Joi.number().min(0),
    currency: Joi.string().valid('SAR', 'USD', 'EUR', 'GBP', 'AED'),
    setupFee: Joi.number().min(0),
    includedHours: Joi.number().min(0),
    hourlyRateAfter: Joi.number().min(0),
    includedServices: Joi.array().items(Joi.string().trim()),
    serviceCategories: Joi.array().items(Joi.string().trim()),
    trialDays: Joi.number().integer().min(0).max(365),
    trialAmount: Joi.number().min(0),
    autoRenew: Joi.boolean(),
    autoInvoice: Joi.boolean(),
    invoiceDaysBefore: Joi.number().integer().min(0).max(60),
    reminderDays: Joi.array().items(Joi.number().integer().min(0).max(60)),
    autoCloseDays: Joi.number().integer().min(0),
    prorationBehavior: Joi.string().valid(
      'create_prorations', 'none', 'always_invoice'
    ),
    alignToPeriodStart: Joi.boolean(),
    maxClients: Joi.number().integer().min(0).allow(null),
    maxCases: Joi.number().integer().min(0).allow(null),
    isActive: Joi.boolean(),
    isPublic: Joi.boolean(),
    sortOrder: Joi.number().integer()
  }).min(1), // At least one field required

  // List query validation
  listQuery: Joi.object({
    search: Joi.string().max(100).allow(''),
    planType: Joi.string().valid(
      'retainer', 'hourly_package', 'flat_fee', 'hybrid',
      'compliance', 'document_review', 'advisory'
    ),
    billingPeriod: Joi.string().valid(
      'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually'
    ),
    isActive: Joi.string().valid('true', 'false'),
    sortBy: Joi.string().valid('name', 'amount', 'createdAt', 'sortOrder'),
    sortOrder: Joi.string().valid('asc', 'desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

const subscriptionSchemas = {
  // Create subscription
  create: Joi.object({
    planId: Joi.string().required().messages({
      'string.empty': 'Plan is required'
    }),
    clientId: Joi.string().required().messages({
      'string.empty': 'Client is required'
    }),
    caseId: Joi.string().allow('', null),
    externalRef: Joi.string().max(100).allow('', null),

    // Dates
    startDate: Joi.date().iso().required().messages({
      'date.base': 'Valid start date is required'
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).allow(null),

    // Billing
    billingPeriod: Joi.string().valid(
      'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annually', 'annually'
    ).required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().valid('SAR', 'USD', 'EUR', 'GBP', 'AED').default('SAR'),
    setupFee: Joi.number().min(0).default(0),

    // Hours
    includedHours: Joi.number().min(0).default(0),
    hourlyRateAfter: Joi.number().min(0).default(0),

    // Settings
    autoRenew: Joi.boolean().default(true),
    autoInvoice: Joi.boolean().default(true),

    // Notes
    notes: Joi.string().max(2000).allow('', null),
    notesAr: Joi.string().max(2000).allow('', null),
    internalNotes: Joi.string().max(2000).allow('', null)
  }),

  // Update subscription
  update: Joi.object({
    caseId: Joi.string().allow('', null),
    externalRef: Joi.string().max(100).allow('', null),
    endDate: Joi.date().iso().allow(null),
    amount: Joi.number().min(0),
    includedHours: Joi.number().min(0),
    hourlyRateAfter: Joi.number().min(0),
    autoRenew: Joi.boolean(),
    autoInvoice: Joi.boolean(),
    notes: Joi.string().max(2000).allow('', null),
    notesAr: Joi.string().max(2000).allow('', null),
    internalNotes: Joi.string().max(2000).allow('', null)
  }).min(1),

  // Pause subscription
  pause: Joi.object({
    pauseReason: Joi.string().max(500).allow('', null)
  }),

  // Cancel subscription
  cancel: Joi.object({
    cancelReason: Joi.string().max(500).allow('', null),
    cancelAtPeriodEnd: Joi.boolean().default(false)
  }),

  // Consume hours
  consumeHours: Joi.object({
    hours: Joi.number().positive().required().messages({
      'number.positive': 'Hours must be a positive number'
    }),
    description: Joi.string().max(500).allow('', null),
    taskId: Joi.string().allow('', null),
    timeEntryId: Joi.string().allow('', null)
  }),

  // List query
  listQuery: Joi.object({
    search: Joi.string().max(100).allow(''),
    status: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    clientId: Joi.string(),
    planId: Joi.string(),
    billingPeriod: Joi.string(),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
    sortBy: Joi.string().valid(
      'subscriptionNumber', 'clientId', 'startDate',
      'nextBillingDate', 'amount', 'status', 'createdAt'
    ),
    sortOrder: Joi.string().valid('asc', 'desc'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

module.exports = { planSchemas, subscriptionSchemas };
```

---

## 5. Business Logic

### 5.1 Subscription Service

```javascript
// services/subscriptionService.js
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Invoice = require('../models/Invoice');
const { AppError } = require('../utils/errorHandler');
const { BILLING_PERIODS, SUBSCRIPTION_STATUS } = require('../constants/subscriptionEnums');

class SubscriptionService {
  /**
   * Calculate next billing date based on current date and billing period
   */
  static calculateNextBillingDate(currentDate, billingPeriod) {
    const date = new Date(currentDate);

    switch (billingPeriod) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semi_annually':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'annually':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }

    return date;
  }

  /**
   * Validate status transition
   */
  static validateStatusTransition(currentStatus, newStatus) {
    const statusConfig = SUBSCRIPTION_STATUS[currentStatus];
    if (!statusConfig) {
      throw new AppError(`Invalid current status: ${currentStatus}`, 400);
    }

    if (!statusConfig.allowedTransitions.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }

    return true;
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(data, userId, userName) {
    // Fetch the plan
    const plan = await SubscriptionPlan.findById(data.planId);
    if (!plan) {
      throw new AppError('Subscription plan not found', 404);
    }

    if (!plan.isActive) {
      throw new AppError('Cannot create subscription with inactive plan', 400);
    }

    // Check plan limits
    if (plan.maxClients) {
      const existingCount = await Subscription.countDocuments({
        planId: data.planId,
        status: { $in: ['active', 'trial', 'paused'] }
      });

      if (existingCount >= plan.maxClients) {
        throw new AppError('Plan has reached maximum subscriptions limit', 400);
      }
    }

    // Calculate trial end date if applicable
    let trialEndDate = null;
    let initialStatus = 'draft';

    if (plan.trialDays > 0) {
      trialEndDate = new Date(data.startDate);
      trialEndDate.setDate(trialEndDate.getDate() + plan.trialDays);
      initialStatus = 'trial';
    }

    // Calculate next billing date
    const nextBillingDate = trialEndDate ||
      this.calculateNextBillingDate(data.startDate, data.billingPeriod);

    // Create plan snapshot
    const planSnapshot = {
      planId: plan._id,
      name: plan.name,
      planType: plan.planType,
      amount: data.amount || plan.amount,
      billingPeriod: data.billingPeriod || plan.billingPeriod,
      includedHours: data.includedHours ?? plan.includedHours,
      hourlyRateAfter: data.hourlyRateAfter ?? plan.hourlyRateAfter
    };

    // Create subscription
    const subscription = new Subscription({
      ...data,
      planSnapshot,
      status: initialStatus,
      trialEndDate,
      nextBillingDate,
      includedHours: planSnapshot.includedHours,
      hourlyRateAfter: planSnapshot.hourlyRateAfter,
      usedHours: 0
    });

    // Add creation history
    subscription.addHistory('created', userId, userName, 'Subscription created');

    await subscription.save();

    return subscription;
  }

  /**
   * Activate a subscription
   */
  static async activateSubscription(subscriptionId, userId, userName) {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    this.validateStatusTransition(subscription.status, 'active');

    const previousStatus = subscription.status;
    subscription.status = 'active';

    // If activating from draft, set next billing date from start date
    if (previousStatus === 'draft') {
      subscription.nextBillingDate = this.calculateNextBillingDate(
        subscription.startDate,
        subscription.billingPeriod
      );
    }

    subscription.addHistory(
      'activated',
      userId,
      userName,
      `Subscription activated from ${previousStatus}`,
      { previousStatus, newStatus: 'active' }
    );

    await subscription.save();

    return subscription;
  }

  /**
   * Pause a subscription
   */
  static async pauseSubscription(subscriptionId, reason, userId, userName) {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    this.validateStatusTransition(subscription.status, 'paused');

    subscription.status = 'paused';
    subscription.pausedAt = new Date();
    subscription.pauseReason = reason;

    subscription.addHistory(
      'pause',
      userId,
      userName,
      reason || 'Subscription paused'
    );

    await subscription.save();

    return subscription;
  }

  /**
   * Resume a paused subscription
   */
  static async resumeSubscription(subscriptionId, userId, userName) {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    this.validateStatusTransition(subscription.status, 'active');

    // Calculate pause duration and adjust billing date
    if (subscription.pausedAt) {
      const pauseDuration = Date.now() - subscription.pausedAt.getTime();
      subscription.nextBillingDate = new Date(
        subscription.nextBillingDate.getTime() + pauseDuration
      );
    }

    subscription.status = 'active';
    subscription.pausedAt = null;
    subscription.pauseReason = null;

    subscription.addHistory(
      'resume',
      userId,
      userName,
      'Subscription resumed'
    );

    await subscription.save();

    return subscription;
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId, reason, atPeriodEnd, userId, userName) {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    if (atPeriodEnd) {
      // Schedule cancellation at period end
      subscription.cancelAtPeriodEnd = true;
      subscription.cancelReason = reason;

      subscription.addHistory(
        'cancel',
        userId,
        userName,
        `Scheduled cancellation at period end: ${reason || 'No reason provided'}`
      );
    } else {
      // Immediate cancellation
      this.validateStatusTransition(subscription.status, 'cancelled');

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.cancelReason = reason;

      subscription.addHistory(
        'cancel',
        userId,
        userName,
        reason || 'Subscription cancelled immediately'
      );
    }

    await subscription.save();

    return subscription;
  }

  /**
   * Consume hours from subscription
   */
  static async consumeHours(subscriptionId, hours, description, metadata, userId, userName) {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    if (subscription.status !== 'active') {
      throw new AppError('Can only consume hours on active subscriptions', 400);
    }

    const previousUsed = subscription.usedHours;
    subscription.usedHours += hours;
    subscription.totalHoursUsed += hours;

    // Calculate overage
    let overageHours = 0;
    let overageCharge = 0;

    if (subscription.usedHours > subscription.includedHours) {
      overageHours = subscription.usedHours - subscription.includedHours;
      overageCharge = overageHours * subscription.hourlyRateAfter;
    }

    subscription.addHistory(
      'hours_consumed',
      userId,
      userName,
      description || `${hours} hours consumed`,
      { hours, previousUsed, newUsed: subscription.usedHours, ...metadata }
    );

    await subscription.save();

    return {
      subscription,
      hoursConsumed: hours,
      previousUsed,
      newUsed: subscription.usedHours,
      overageHours,
      overageCharge
    };
  }

  /**
   * Reset hours for new billing period
   */
  static async resetHours(subscriptionId, userId, userName) {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    const previousUsed = subscription.usedHours;
    subscription.usedHours = 0;

    subscription.addHistory(
      'updated',
      userId,
      userName,
      `Hours reset for new billing period (was ${previousUsed})`
    );

    await subscription.save();

    return subscription;
  }
}

module.exports = SubscriptionService;
```

---

## 6. Scheduled Jobs

### 6.1 Subscription Cron Jobs

```javascript
// jobs/subscriptionJobs.js
const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const SubscriptionService = require('../services/subscriptionService');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Process subscription renewals
 * Runs daily at 1:00 AM
 */
const processRenewals = cron.schedule('0 1 * * *', async () => {
  logger.info('Starting subscription renewal processing');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find subscriptions due for renewal
    const subscriptions = await Subscription.find({
      status: 'active',
      autoRenew: true,
      nextBillingDate: { $lte: today }
    }).populate('clientId planId firmId');

    logger.info(`Found ${subscriptions.length} subscriptions to renew`);

    for (const subscription of subscriptions) {
      try {
        // Reset hours for new period
        subscription.usedHours = 0;
        subscription.lastBillingDate = subscription.nextBillingDate;
        subscription.nextBillingDate = SubscriptionService.calculateNextBillingDate(
          subscription.nextBillingDate,
          subscription.billingPeriod
        );

        subscription.addHistory(
          'renew',
          null,
          'System',
          `Auto-renewed for next ${subscription.billingPeriod} period`
        );

        await subscription.save();

        // Generate invoice if auto-invoice enabled
        if (subscription.autoInvoice) {
          await generateSubscriptionInvoice(subscription);
        }

        logger.info(`Renewed subscription ${subscription.subscriptionNumber}`);
      } catch (error) {
        logger.error(`Failed to renew ${subscription.subscriptionNumber}:`, error);
      }
    }
  } catch (error) {
    logger.error('Renewal processing failed:', error);
  }
});

/**
 * Process trial expirations
 * Runs daily at 2:00 AM
 */
const processTrialExpirations = cron.schedule('0 2 * * *', async () => {
  logger.info('Starting trial expiration processing');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find expired trials
    const subscriptions = await Subscription.find({
      status: 'trial',
      trialEndDate: { $lte: today }
    }).populate('clientId firmId');

    logger.info(`Found ${subscriptions.length} expired trials`);

    for (const subscription of subscriptions) {
      try {
        // Transition to active or expired based on autoRenew
        if (subscription.autoRenew) {
          subscription.status = 'active';
          subscription.nextBillingDate = SubscriptionService.calculateNextBillingDate(
            new Date(),
            subscription.billingPeriod
          );

          subscription.addHistory(
            'activated',
            null,
            'System',
            'Trial period ended, subscription activated'
          );

          // Generate first invoice
          if (subscription.autoInvoice) {
            await generateSubscriptionInvoice(subscription);
          }
        } else {
          subscription.status = 'expired';
          subscription.addHistory(
            'expired',
            null,
            'System',
            'Trial period ended without renewal'
          );
        }

        await subscription.save();

        // Send notification email
        await sendEmail({
          to: subscription.clientId.email,
          template: subscription.autoRenew ? 'trial-converted' : 'trial-expired',
          data: { subscription }
        });

        logger.info(`Processed trial expiration for ${subscription.subscriptionNumber}`);
      } catch (error) {
        logger.error(`Failed to process trial ${subscription.subscriptionNumber}:`, error);
      }
    }
  } catch (error) {
    logger.error('Trial expiration processing failed:', error);
  }
});

/**
 * Process scheduled cancellations
 * Runs daily at 3:00 AM
 */
const processScheduledCancellations = cron.schedule('0 3 * * *', async () => {
  logger.info('Starting scheduled cancellation processing');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find subscriptions scheduled for cancellation at period end
    const subscriptions = await Subscription.find({
      cancelAtPeriodEnd: true,
      nextBillingDate: { $lte: today },
      status: { $in: ['active', 'paused'] }
    });

    logger.info(`Found ${subscriptions.length} scheduled cancellations`);

    for (const subscription of subscriptions) {
      try {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancelAtPeriodEnd = false;

        subscription.addHistory(
          'cancel',
          null,
          'System',
          'Subscription cancelled at period end as scheduled'
        );

        await subscription.save();
        logger.info(`Cancelled subscription ${subscription.subscriptionNumber}`);
      } catch (error) {
        logger.error(`Failed to cancel ${subscription.subscriptionNumber}:`, error);
      }
    }
  } catch (error) {
    logger.error('Scheduled cancellation processing failed:', error);
  }
});

/**
 * Send renewal reminders
 * Runs daily at 9:00 AM
 */
const sendRenewalReminders = cron.schedule('0 9 * * *', async () => {
  logger.info('Starting renewal reminder processing');

  try {
    const reminderDays = [7, 3, 1]; // Days before renewal to send reminders

    for (const days of reminderDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const subscriptions = await Subscription.find({
        status: 'active',
        nextBillingDate: { $gte: targetDate, $lt: nextDay }
      }).populate('clientId firmId');

      for (const subscription of subscriptions) {
        try {
          await sendEmail({
            to: subscription.clientId.email,
            template: 'renewal-reminder',
            data: {
              subscription,
              daysUntilRenewal: days
            }
          });

          logger.info(`Sent ${days}-day reminder for ${subscription.subscriptionNumber}`);
        } catch (error) {
          logger.error(`Failed to send reminder for ${subscription.subscriptionNumber}:`, error);
        }
      }
    }
  } catch (error) {
    logger.error('Reminder processing failed:', error);
  }
});

/**
 * Process past due subscriptions
 * Runs daily at 4:00 AM
 */
const processPastDue = cron.schedule('0 4 * * *', async () => {
  logger.info('Starting past due processing');

  try {
    // Find subscriptions with unpaid invoices past grace period
    const gracePeriodDays = 7;
    const graceDate = new Date();
    graceDate.setDate(graceDate.getDate() - gracePeriodDays);

    const subscriptions = await Subscription.find({
      status: 'active',
      balanceDue: { $gt: 0 },
      lastBillingDate: { $lte: graceDate }
    });

    logger.info(`Found ${subscriptions.length} potentially past due subscriptions`);

    for (const subscription of subscriptions) {
      try {
        subscription.status = 'past_due';

        subscription.addHistory(
          'updated',
          null,
          'System',
          'Marked as past due due to unpaid balance'
        );

        await subscription.save();
        logger.info(`Marked ${subscription.subscriptionNumber} as past due`);
      } catch (error) {
        logger.error(`Failed to mark ${subscription.subscriptionNumber} past due:`, error);
      }
    }
  } catch (error) {
    logger.error('Past due processing failed:', error);
  }
});

/**
 * Auto-close expired past due subscriptions
 * Runs daily at 5:00 AM
 */
const autoCloseExpired = cron.schedule('0 5 * * *', async () => {
  logger.info('Starting auto-close processing');

  try {
    // Get plans with auto-close settings
    const subscriptions = await Subscription.find({
      status: 'past_due'
    }).populate('planId');

    for (const subscription of subscriptions) {
      try {
        const autoCloseDays = subscription.planId?.autoCloseDays || 30;
        const closeDate = new Date();
        closeDate.setDate(closeDate.getDate() - autoCloseDays);

        // Check if past due longer than auto-close period
        const pastDueEntry = subscription.history.find(
          h => h.action === 'updated' && h.details?.includes('past due')
        );

        if (pastDueEntry && new Date(pastDueEntry.timestamp) <= closeDate) {
          subscription.status = 'cancelled';
          subscription.cancelledAt = new Date();
          subscription.cancelReason = 'Auto-closed due to non-payment';

          subscription.addHistory(
            'cancel',
            null,
            'System',
            `Auto-cancelled after ${autoCloseDays} days past due`
          );

          await subscription.save();
          logger.info(`Auto-closed ${subscription.subscriptionNumber}`);
        }
      } catch (error) {
        logger.error(`Failed to auto-close ${subscription.subscriptionNumber}:`, error);
      }
    }
  } catch (error) {
    logger.error('Auto-close processing failed:', error);
  }
});

/**
 * Generate invoice for subscription
 */
async function generateSubscriptionInvoice(subscription) {
  const invoice = new Invoice({
    firmId: subscription.firmId,
    clientId: subscription.clientId,
    subscriptionId: subscription._id,
    type: 'subscription',
    status: 'draft',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    items: [{
      description: `${subscription.planSnapshot?.name || 'Subscription'} - ${subscription.billingPeriod}`,
      quantity: 1,
      unitPrice: subscription.amount,
      amount: subscription.amount
    }],
    subtotal: subscription.amount,
    total: subscription.amount,
    currency: subscription.currency
  });

  await invoice.save();

  // Update subscription tracking
  subscription.generatedInvoiceIds.push(invoice._id);
  subscription.totalInvoiced += subscription.amount;
  subscription.balanceDue += subscription.amount;

  subscription.addHistory(
    'generate_invoice',
    null,
    'System',
    `Invoice ${invoice.invoiceNumber} generated`
  );

  await subscription.save();

  return invoice;
}

// Export job starters
module.exports = {
  startAllJobs: () => {
    processRenewals.start();
    processTrialExpirations.start();
    processScheduledCancellations.start();
    sendRenewalReminders.start();
    processPastDue.start();
    autoCloseExpired.start();
    logger.info('All subscription jobs started');
  },
  stopAllJobs: () => {
    processRenewals.stop();
    processTrialExpirations.stop();
    processScheduledCancellations.stop();
    sendRenewalReminders.stop();
    processPastDue.stop();
    autoCloseExpired.stop();
    logger.info('All subscription jobs stopped');
  }
};
```

---

## 7. Code Examples

### 7.1 Subscription Controller (Full Implementation)

```javascript
// controllers/subscriptionController.js
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const SubscriptionService = require('../services/subscriptionService');
const { AppError, catchAsync } = require('../utils/errorHandler');

/**
 * List subscriptions with filtering
 */
exports.listSubscriptions = catchAsync(async (req, res) => {
  const {
    search, status, clientId, planId, billingPeriod,
    dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc',
    page = 1, limit = 20
  } = req.query;

  const filter = { firmId: req.user.firmId };

  if (search) {
    filter.$or = [
      { subscriptionNumber: { $regex: search, $options: 'i' } },
      { externalRef: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    filter.status = Array.isArray(status) ? { $in: status } : status;
  }

  if (clientId) filter.clientId = clientId;
  if (planId) filter.planId = planId;
  if (billingPeriod) filter.billingPeriod = billingPeriod;

  if (dateFrom || dateTo) {
    filter.startDate = {};
    if (dateFrom) filter.startDate.$gte = new Date(dateFrom);
    if (dateTo) filter.startDate.$lte = new Date(dateTo);
  }

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [subscriptions, total] = await Promise.all([
    Subscription.find(filter)
      .populate('clientId', 'name email phone')
      .populate('planId', 'name planType')
      .populate('caseId', 'caseNumber title')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Subscription.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: subscriptions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get subscription statistics
 */
exports.getStats = catchAsync(async (req, res) => {
  const firmId = req.user.firmId;

  const [statusCounts, mrrData, upcomingRenewals, expiringTrials] = await Promise.all([
    // Status breakdown
    Subscription.aggregate([
      { $match: { firmId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    // MRR calculation
    Subscription.aggregate([
      { $match: { firmId, status: 'active' } },
      { $group: { _id: null, totalMrr: { $sum: '$mrr' } } }
    ]),

    // Upcoming renewals (next 7 days)
    Subscription.countDocuments({
      firmId,
      status: 'active',
      nextBillingDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }),

    // Expiring trials (next 7 days)
    Subscription.countDocuments({
      firmId,
      status: 'trial',
      trialEndDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
  ]);

  // Format status counts
  const byStatus = {};
  let totalSubscriptions = 0;
  statusCounts.forEach(s => {
    byStatus[s._id] = s.count;
    totalSubscriptions += s.count;
  });

  const mrr = mrrData[0]?.totalMrr || 0;

  res.json({
    success: true,
    data: {
      totalSubscriptions,
      byStatus,
      mrr,
      arr: mrr * 12,
      averageSubscriptionValue: totalSubscriptions > 0 ? Math.round(mrr / (byStatus.active || 1)) : 0,
      upcomingRenewals,
      expiringTrials
    }
  });
});

/**
 * Get single subscription
 */
exports.getSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  })
    .populate('clientId')
    .populate('planId')
    .populate('caseId')
    .populate('generatedInvoiceIds')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  res.json({ success: true, data: subscription });
});

/**
 * Create subscription
 */
exports.createSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionService.createSubscription(
    { ...req.body, firmId: req.user.firmId, createdBy: req.user._id },
    req.user._id,
    req.user.name
  );

  res.status(201).json({
    success: true,
    data: subscription,
    message: 'Subscription created successfully'
  });
});

/**
 * Update subscription
 */
exports.updateSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  });

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  // Only allow certain fields to be updated based on status
  const allowedUpdates = ['notes', 'notesAr', 'internalNotes', 'externalRef'];

  if (['draft', 'trial'].includes(subscription.status)) {
    allowedUpdates.push('amount', 'includedHours', 'hourlyRateAfter', 'endDate', 'autoRenew', 'autoInvoice');
  }

  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  Object.assign(subscription, updates);
  subscription.updatedBy = req.user._id;

  subscription.addHistory('updated', req.user._id, req.user.name, 'Subscription updated');

  await subscription.save();

  res.json({
    success: true,
    data: subscription,
    message: 'Subscription updated successfully'
  });
});

/**
 * Delete subscription (drafts only)
 */
exports.deleteSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  });

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  if (subscription.status !== 'draft') {
    throw new AppError('Only draft subscriptions can be deleted', 400);
  }

  await subscription.deleteOne();

  res.json({
    success: true,
    message: 'Subscription deleted successfully'
  });
});

/**
 * Activate subscription
 */
exports.activateSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionService.activateSubscription(
    req.params.id,
    req.user._id,
    req.user.name
  );

  res.json({
    success: true,
    data: subscription,
    message: 'Subscription activated successfully'
  });
});

/**
 * Pause subscription
 */
exports.pauseSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionService.pauseSubscription(
    req.params.id,
    req.body.pauseReason,
    req.user._id,
    req.user.name
  );

  res.json({
    success: true,
    data: subscription,
    message: 'Subscription paused successfully'
  });
});

/**
 * Resume subscription
 */
exports.resumeSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionService.resumeSubscription(
    req.params.id,
    req.user._id,
    req.user.name
  );

  res.json({
    success: true,
    data: subscription,
    message: 'Subscription resumed successfully'
  });
});

/**
 * Cancel subscription
 */
exports.cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await SubscriptionService.cancelSubscription(
    req.params.id,
    req.body.cancelReason,
    req.body.cancelAtPeriodEnd,
    req.user._id,
    req.user.name
  );

  res.json({
    success: true,
    data: subscription,
    message: subscription.cancelAtPeriodEnd
      ? 'Subscription scheduled for cancellation at period end'
      : 'Subscription cancelled successfully'
  });
});

/**
 * Renew subscription manually
 */
exports.renewSubscription = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  });

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  if (!['active', 'expired'].includes(subscription.status)) {
    throw new AppError('Only active or expired subscriptions can be renewed', 400);
  }

  subscription.usedHours = 0;
  subscription.lastBillingDate = new Date();
  subscription.nextBillingDate = SubscriptionService.calculateNextBillingDate(
    new Date(),
    subscription.billingPeriod
  );

  if (subscription.status === 'expired') {
    subscription.status = 'active';
  }

  subscription.addHistory('renew', req.user._id, req.user.name, 'Manual renewal');

  await subscription.save();

  res.json({
    success: true,
    data: subscription,
    message: 'Subscription renewed successfully'
  });
});

/**
 * Consume hours
 */
exports.consumeHours = catchAsync(async (req, res) => {
  const result = await SubscriptionService.consumeHours(
    req.params.id,
    req.body.hours,
    req.body.description,
    { taskId: req.body.taskId, timeEntryId: req.body.timeEntryId },
    req.user._id,
    req.user.name
  );

  res.json({
    success: true,
    data: result,
    message: 'Hours consumed successfully'
  });
});

/**
 * Reset hours
 */
exports.resetHours = catchAsync(async (req, res) => {
  const subscription = await SubscriptionService.resetHours(
    req.params.id,
    req.user._id,
    req.user.name
  );

  res.json({
    success: true,
    data: subscription,
    message: 'Hours reset successfully'
  });
});

/**
 * Generate invoice manually
 */
exports.generateInvoice = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    firmId: req.user.firmId
  }).populate('planId');

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  if (subscription.status !== 'active') {
    throw new AppError('Can only generate invoices for active subscriptions', 400);
  }

  // Import invoice generation from jobs
  const { generateSubscriptionInvoice } = require('../jobs/subscriptionJobs');
  const invoice = await generateSubscriptionInvoice(subscription);

  res.json({
    success: true,
    data: { subscription, invoice },
    message: 'Invoice generated successfully'
  });
});
```

---

## 8. Quick Reference

### 8.1 File Structure

```
backend/
├── models/
│   ├── Subscription.js
│   └── SubscriptionPlan.js
├── controllers/
│   ├── subscriptionController.js
│   └── subscriptionPlanController.js
├── routes/
│   ├── subscriptions.js
│   └── subscriptionPlans.js
├── services/
│   └── subscriptionService.js
├── validators/
│   └── subscriptionValidators.js
├── constants/
│   └── subscriptionEnums.js
└── jobs/
    └── subscriptionJobs.js
```

### 8.2 Permission Keys

```javascript
// Add to permissions system
const SUBSCRIPTION_PERMISSIONS = {
  'subscriptions:read': 'View subscriptions',
  'subscriptions:create': 'Create subscriptions',
  'subscriptions:update': 'Update subscriptions',
  'subscriptions:delete': 'Delete subscriptions',
  'subscription_plans:read': 'View subscription plans',
  'subscription_plans:create': 'Create subscription plans',
  'subscription_plans:update': 'Update subscription plans',
  'subscription_plans:delete': 'Delete subscription plans'
};
```

### 8.3 Environment Variables

```env
# Add to .env
SUBSCRIPTION_REMINDER_DAYS=7,3,1
SUBSCRIPTION_GRACE_PERIOD_DAYS=7
SUBSCRIPTION_AUTO_CLOSE_DAYS=30
```

---

## Summary

This guide provides everything needed to implement the Subscriptions backend:

1. **Database Schemas** - MongoDB/Mongoose models with indexes, virtuals, and methods
2. **Enums & Constants** - All status, plan type, and billing period definitions
3. **API Endpoints** - Full REST API for plans and subscriptions
4. **Validation** - Joi schemas for request validation
5. **Business Logic** - Service class with all subscription operations
6. **Scheduled Jobs** - Cron jobs for renewals, reminders, and auto-actions
7. **Code Examples** - Complete controller implementations

The frontend is already built and expects these exact API contracts. Match the response structures exactly for seamless integration.
