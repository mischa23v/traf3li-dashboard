# CRM Backend Implementation Guide

This document provides detailed instructions for implementing the backend APIs to support the Ultimate CRM system.

---

## Table of Contents

1. [Database Schemas](#1-database-schemas)
2. [API Endpoints](#2-api-endpoints)
3. [Services](#3-services)
4. [Validation](#4-validation)
5. [Business Logic](#5-business-logic)

---

## 1. Database Schemas

### 1.1 Enhanced Lead Schema

```javascript
// models/Lead.js
const leadSchema = new mongoose.Schema({
  // Basic Info
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  firstNameAr: String,
  lastName: { type: String, required: true },
  lastNameAr: String,
  email: { type: String, lowercase: true, trim: true },
  phone: String,
  mobile: String,

  // Office Type (NEW)
  officeType: {
    type: String,
    enum: ['solo', 'small', 'medium', 'firm'],
    default: 'solo'
  },

  // Organization Link (NEW)
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  jobTitle: String,
  department: String,

  // Lead Source & Status
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'cold_call',
           'trade_show', 'email_campaign', 'partner', 'direct', 'other'],
    default: 'direct'
  },
  sourceDetails: String, // e.g., "Referred by Ahmed Mohamed"

  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation',
           'won', 'lost', 'nurturing', 'unqualified'],
    default: 'new'
  },

  // Pipeline & Stage
  pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline' },
  stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PipelineStage' },
  stageEnteredAt: { type: Date, default: Date.now }, // For stale detection

  // Lead Scoring (NEW)
  score: { type: Number, default: 0, min: 0, max: 100 },
  scoreBreakdown: {
    demographic: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    firmographics: { type: Number, default: 0 }
  },
  temperature: {
    type: String,
    enum: ['cold', 'warm', 'hot'],
    default: 'cold'
  },

  // Value & Probability (NEW)
  expectedValue: { type: Number, default: 0 },
  probability: { type: Number, default: 0, min: 0, max: 100 },
  weightedValue: { type: Number, default: 0 }, // expectedValue * (probability/100)
  currency: { type: String, default: 'SAR' },

  // Expected Close
  expectedCloseDate: Date,

  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesTeam' },
  territoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Territory' },

  // Communication Preferences (NEW)
  preferredLanguage: { type: String, enum: ['ar', 'en'], default: 'ar' },
  preferredContactMethod: { type: String, enum: ['email', 'phone', 'whatsapp', 'in_person'], default: 'phone' },
  bestTimeToContact: String,
  doNotContact: { type: Boolean, default: false },

  // Social Profiles (NEW)
  socialProfiles: {
    linkedin: String,
    twitter: String,
    facebook: String,
    website: String
  },

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'SA' }
  },

  // Tags & Categories
  tags: [String],
  category: String,

  // Lost Reason (if status is 'lost')
  lostReasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostReason' },
  lostReasonNotes: String,

  // Conversion
  convertedToClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  convertedAt: Date,

  // Campaign Attribution (NEW)
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,

  // Activity Tracking (NEW)
  lastActivityAt: Date,
  lastActivityType: String,
  activityCount: { type: Number, default: 0 },

  // Activity Plan (NEW)
  activeActivityPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivityPlan' },
  activityPlanProgress: {
    currentStepIndex: { type: Number, default: 0 },
    startedAt: Date,
    completedSteps: [String] // Step IDs
  },

  // Duplicate Detection (NEW)
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  duplicateScore: Number,
  duplicateCheckedAt: Date,

  // Custom Fields
  customFields: mongoose.Schema.Types.Mixed,

  // Notes
  notes: String,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for days in stage (for stale detection)
leadSchema.virtual('daysInStage').get(function() {
  if (!this.stageEnteredAt) return 0;
  const now = new Date();
  const diff = now - this.stageEnteredAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Pre-save hook to calculate weighted value
leadSchema.pre('save', function(next) {
  if (this.expectedValue && this.probability) {
    this.weightedValue = this.expectedValue * (this.probability / 100);
  }
  next();
});

// Indexes
leadSchema.index({ lawyerId: 1, status: 1 });
leadSchema.index({ lawyerId: 1, stageId: 1 });
leadSchema.index({ lawyerId: 1, assignedTo: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ lawyerId: 1, createdAt: -1 });
leadSchema.index({ lawyerId: 1, score: -1 });
```

### 1.2 Organization Schema (NEW)

```javascript
// models/Organization.js
const organizationSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Basic Info
  name: { type: String, required: true },
  nameAr: String,
  legalName: String,

  // Type & Classification
  type: {
    type: String,
    enum: ['company', 'government', 'court', 'law_firm', 'nonprofit', 'individual', 'other'],
    default: 'company'
  },
  officeType: {
    type: String,
    enum: ['solo', 'small', 'medium', 'firm']
  },
  industry: String,
  industryCode: String, // ISIC code
  size: {
    type: String,
    enum: ['micro', 'small', 'medium', 'large', 'enterprise']
  },
  employeeCount: Number,

  // Hierarchy (NEW)
  parentOrganizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isHeadquarters: { type: Boolean, default: true },

  // Registration & Tax
  registrationNumber: String, // Commercial Registration (CR)
  registrationDate: Date,
  vatNumber: String,
  taxId: String,

  // Saudi-Specific (NEW)
  crNumber: String, // Commercial Registration Number
  moiNumber: String, // Ministry of Interior Number
  molNumber: String, // Ministry of Labor Number
  gosiNumber: String, // GOSI Number
  municipalityLicense: String,
  chamberOfCommerceMembership: String,

  // Contact Info
  phone: String,
  fax: String,
  email: String,
  website: String,

  // Address
  address: {
    street: String,
    building: String,
    district: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'SA' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // Billing Address (if different)
  billingAddress: {
    street: String,
    building: String,
    district: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'SA' }
  },

  // Financial (NEW)
  annualRevenue: Number,
  currency: { type: String, default: 'SAR' },
  fiscalYearEnd: String, // e.g., "12-31"
  paymentTerms: String,
  creditLimit: Number,

  // Bank Accounts (NEW)
  bankAccounts: [{
    bankName: String,
    accountName: String,
    accountNumber: String,
    iban: String,
    swiftCode: String,
    isPrimary: { type: Boolean, default: false }
  }],

  // Relationships
  linkedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
  linkedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  linkedCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],

  // Social
  socialProfiles: {
    linkedin: String,
    twitter: String,
    facebook: String
  },

  // Tags & Status
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'archived'],
    default: 'active'
  },

  // Notes
  notes: String,
  description: String,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Indexes
organizationSchema.index({ lawyerId: 1, status: 1 });
organizationSchema.index({ lawyerId: 1, type: 1 });
organizationSchema.index({ name: 'text', nameAr: 'text' });
organizationSchema.index({ crNumber: 1 });
organizationSchema.index({ vatNumber: 1 });
```

### 1.3 Activity Plan Schema (NEW)

```javascript
// models/ActivityPlan.js
const activityPlanStepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  activityType: {
    type: String,
    enum: ['email', 'call', 'meeting', 'video_call', 'task', 'sms', 'whatsapp'],
    required: true
  },
  name: { type: String, required: true },
  nameAr: String,
  description: String,
  delayDays: { type: Number, default: 0 }, // Days after previous step
  delayHours: { type: Number, default: 0 },
  isRequired: { type: Boolean, default: false },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
  assignToOwner: { type: Boolean, default: true }, // Assign to lead owner
  specificAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const activityPlanSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Basic Info
  name: { type: String, required: true },
  nameAr: String,
  description: String,

  // Trigger
  triggerOn: {
    type: String,
    enum: ['lead_created', 'stage_changed', 'deal_won', 'deal_lost', 'manual',
           'tag_added', 'score_threshold', 'inactivity'],
    required: true
  },
  triggerConditions: {
    stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PipelineStage' },
    tagName: String,
    scoreThreshold: Number,
    inactivityDays: Number
  },

  // Steps
  steps: [activityPlanStepSchema],

  // Recurrence (NEW)
  isRecurring: { type: Boolean, default: false },
  recurrenceFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },
  recurrenceDayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
  recurrenceDayOfMonth: { type: Number, min: 1, max: 31 },
  recurrenceEndDate: Date,

  // Status
  isActive: { type: Boolean, default: true },

  // Stats
  timesExecuted: { type: Number, default: 0 },
  lastExecutedAt: Date,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Index
activityPlanSchema.index({ lawyerId: 1, isActive: 1 });
activityPlanSchema.index({ lawyerId: 1, triggerOn: 1 });
```

### 1.4 Sales Quota Schema (NEW)

```javascript
// models/SalesQuota.js
const salesQuotaSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Assignment
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Individual quota
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesTeam' }, // Team quota
  isCompanyWide: { type: Boolean, default: false },

  // Period
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Targets
  target: { type: Number, required: true }, // Revenue target
  achieved: { type: Number, default: 0 },
  currency: { type: String, default: 'SAR' },

  // Breakdown by Type (NEW)
  breakdownByType: {
    newBusiness: {
      target: { type: Number, default: 0 },
      achieved: { type: Number, default: 0 }
    },
    renewal: {
      target: { type: Number, default: 0 },
      achieved: { type: Number, default: 0 }
    },
    upsell: {
      target: { type: Number, default: 0 },
      achieved: { type: Number, default: 0 }
    }
  },

  // Additional Metrics (NEW)
  dealsTarget: Number, // Number of deals
  dealsAchieved: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },

  // Notes
  notes: String,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Virtual for progress percentage
salesQuotaSchema.virtual('progressPercentage').get(function() {
  if (!this.target || this.target === 0) return 0;
  return Math.round((this.achieved / this.target) * 100);
});

// Virtual for remaining
salesQuotaSchema.virtual('remaining').get(function() {
  return Math.max(0, this.target - this.achieved);
});

// Indexes
salesQuotaSchema.index({ lawyerId: 1, userId: 1, period: 1 });
salesQuotaSchema.index({ lawyerId: 1, startDate: 1, endDate: 1 });
salesQuotaSchema.index({ lawyerId: 1, status: 1 });
```

### 1.5 Duplicate Detection Settings Schema (NEW)

```javascript
// models/DuplicateDetectionSettings.js
const duplicateRuleSchema = new mongoose.Schema({
  field: {
    type: String,
    enum: ['email', 'phone', 'name', 'organization', 'mobile', 'website'],
    required: true
  },
  matchType: {
    type: String,
    enum: ['exact', 'fuzzy', 'phonetic'],
    required: true
  },
  weight: { type: Number, min: 0, max: 100, required: true },
  isEnabled: { type: Boolean, default: true }
});

const duplicateDetectionSettingsSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Master Toggle
  isEnabled: { type: Boolean, default: true },
  autoDetect: { type: Boolean, default: true },

  // Threshold
  minMatchScore: { type: Number, default: 60, min: 0, max: 100 },

  // Rules
  rules: [duplicateRuleSchema],

  // Entity Types
  entityTypes: {
    leads: { type: Boolean, default: true },
    contacts: { type: Boolean, default: true },
    organizations: { type: Boolean, default: false }
  },

  // Actions
  actions: {
    warnOnCreate: { type: Boolean, default: true },
    blockDuplicates: { type: Boolean, default: false },
    suggestMerge: { type: Boolean, default: true },
    notifyAdmin: { type: Boolean, default: false }
  },

  // Metadata
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});
```

### 1.6 CRM Transaction/Activity Log Schema (NEW)

```javascript
// models/CRMTransaction.js
const crmTransactionSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Transaction Type
  type: {
    type: String,
    enum: [
      'lead_created', 'lead_updated', 'lead_converted', 'lead_lost',
      'contact_created', 'contact_updated',
      'activity_created', 'activity_completed',
      'stage_changed', 'deal_won', 'deal_lost',
      'email_sent', 'call_made', 'meeting_scheduled',
      'note_added', 'document_attached',
      'quote_created', 'quote_sent', 'quote_accepted', 'quote_rejected',
      'duplicate_detected', 'records_merged'
    ],
    required: true
  },

  // Related Entities
  entityType: {
    type: String,
    enum: ['lead', 'contact', 'organization', 'activity', 'quote', 'campaign'],
    required: true
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityName: String, // Denormalized for quick display

  // Details
  description: String,
  descriptionAr: String,

  // Value (for revenue-related transactions)
  value: Number,
  currency: { type: String, default: 'SAR' },

  // Old/New Values (for updates)
  previousValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  changedFields: [String],

  // Related User
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Additional Context
  metadata: mongoose.Schema.Types.Mixed,

  // Timestamp
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: false // Only createdAt needed
});

// Indexes
crmTransactionSchema.index({ lawyerId: 1, createdAt: -1 });
crmTransactionSchema.index({ lawyerId: 1, type: 1, createdAt: -1 });
crmTransactionSchema.index({ lawyerId: 1, entityType: 1, entityId: 1 });
crmTransactionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // TTL: 1 year
```

---

## 2. API Endpoints

### 2.1 Lead Endpoints (Enhanced)

```
GET    /api/leads                    - List leads with filters
GET    /api/leads/:id                - Get lead details
POST   /api/leads                    - Create lead (with duplicate check)
PATCH  /api/leads/:id                - Update lead
DELETE /api/leads/:id                - Delete lead

# New Endpoints
POST   /api/leads/:id/convert        - Convert lead to client
POST   /api/leads/:id/change-stage   - Change pipeline stage
GET    /api/leads/:id/duplicates     - Get potential duplicates
POST   /api/leads/:id/merge          - Merge duplicates
GET    /api/leads/:id/timeline       - Get activity timeline
POST   /api/leads/:id/start-plan     - Start activity plan
GET    /api/leads/stale              - Get stale leads
GET    /api/leads/scoring-breakdown  - Get scoring breakdown
POST   /api/leads/bulk-update        - Bulk update leads
POST   /api/leads/bulk-assign        - Bulk assign leads
```

### 2.2 Organization Endpoints (NEW)

```
GET    /api/organizations            - List organizations
GET    /api/organizations/:id        - Get organization details
POST   /api/organizations            - Create organization
PATCH  /api/organizations/:id        - Update organization
DELETE /api/organizations/:id        - Delete organization

GET    /api/organizations/:id/subsidiaries  - Get subsidiaries
GET    /api/organizations/:id/contacts      - Get linked contacts
GET    /api/organizations/:id/leads         - Get linked leads
POST   /api/organizations/:id/link-contact  - Link contact
POST   /api/organizations/:id/link-lead     - Link lead
GET    /api/organizations/search            - Search organizations
```

### 2.3 Activity Plan Endpoints (NEW)

```
GET    /api/activity-plans           - List activity plans
GET    /api/activity-plans/:id       - Get plan details
POST   /api/activity-plans           - Create plan
PATCH  /api/activity-plans/:id       - Update plan
DELETE /api/activity-plans/:id       - Delete plan

POST   /api/activity-plans/:id/toggle     - Toggle active status
POST   /api/activity-plans/:id/duplicate  - Duplicate plan
GET    /api/activity-plans/:id/stats      - Get execution stats
```

### 2.4 Sales Quota Endpoints (NEW)

```
GET    /api/sales-quotas             - List quotas
GET    /api/sales-quotas/:id         - Get quota details
POST   /api/sales-quotas             - Create quota
PATCH  /api/sales-quotas/:id         - Update quota
DELETE /api/sales-quotas/:id         - Delete quota

GET    /api/sales-quotas/leaderboard      - Get leaderboard
GET    /api/sales-quotas/team-summary     - Get team summary
GET    /api/sales-quotas/period-comparison - Get period comparison
POST   /api/sales-quotas/:id/update-achieved - Update achieved value
```

### 2.5 Duplicate Detection Endpoints (NEW)

```
GET    /api/duplicate-detection/settings     - Get settings
PATCH  /api/duplicate-detection/settings     - Update settings

POST   /api/duplicate-detection/check        - Check for duplicates
POST   /api/duplicate-detection/scan         - Scan all records
GET    /api/duplicate-detection/matches      - Get duplicate matches
POST   /api/duplicate-detection/merge        - Merge records
POST   /api/duplicate-detection/dismiss      - Dismiss match
```

### 2.6 CRM Transactions Endpoints (NEW)

```
GET    /api/crm-transactions          - List transactions with filters
GET    /api/crm-transactions/summary  - Get summary by type
GET    /api/crm-transactions/export   - Export transactions
GET    /api/crm-transactions/entity/:type/:id - Get entity transactions
```

### 2.7 Revenue Forecast Endpoints (NEW)

```
GET    /api/revenue-forecast          - Get forecast data
GET    /api/revenue-forecast/by-stage - Forecast by stage
GET    /api/revenue-forecast/by-period - Forecast by period
GET    /api/revenue-forecast/trends   - Get trend data
```

---

## 3. Services

### 3.1 Duplicate Detection Service

```javascript
// services/duplicateDetectionService.js
const stringSimilarity = require('string-similarity');
const metaphone = require('metaphone');

class DuplicateDetectionService {

  /**
   * Check for duplicates before creating a record
   */
  async checkForDuplicates(lawyerId, entityType, data) {
    const settings = await DuplicateDetectionSettings.findOne({ lawyerId });

    if (!settings?.isEnabled || !settings.entityTypes[entityType]) {
      return { hasDuplicates: false, matches: [] };
    }

    const matches = await this.findMatches(lawyerId, entityType, data, settings);
    const filteredMatches = matches.filter(m => m.score >= settings.minMatchScore);

    return {
      hasDuplicates: filteredMatches.length > 0,
      matches: filteredMatches,
      shouldBlock: settings.actions.blockDuplicates && filteredMatches.some(m => m.score >= 90)
    };
  }

  /**
   * Find matching records
   */
  async findMatches(lawyerId, entityType, data, settings) {
    const Model = this.getModel(entityType);
    const existingRecords = await Model.find({
      lawyerId,
      _id: { $ne: data._id } // Exclude self if updating
    }).lean();

    const matches = [];

    for (const record of existingRecords) {
      const matchResult = this.calculateMatchScore(data, record, settings.rules);

      if (matchResult.score > 0) {
        matches.push({
          leadId: record._id,
          displayName: record.fullName || record.name || `${record.firstName} ${record.lastName}`,
          email: record.email,
          phone: record.phone,
          status: record.status,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calculate match score between two records
   */
  calculateMatchScore(record1, record2, rules) {
    let totalScore = 0;
    const reasons = [];

    for (const rule of rules) {
      if (!rule.isEnabled) continue;

      const value1 = this.getFieldValue(record1, rule.field);
      const value2 = this.getFieldValue(record2, rule.field);

      if (!value1 || !value2) continue;

      let similarity = 0;

      switch (rule.matchType) {
        case 'exact':
          similarity = value1.toLowerCase() === value2.toLowerCase() ? 100 : 0;
          break;
        case 'fuzzy':
          similarity = stringSimilarity.compareTwoStrings(
            value1.toLowerCase(),
            value2.toLowerCase()
          ) * 100;
          break;
        case 'phonetic':
          const m1 = metaphone(value1);
          const m2 = metaphone(value2);
          similarity = m1 === m2 ? 100 : 0;
          break;
      }

      if (similarity >= 50) {
        const weightedScore = (similarity / 100) * rule.weight;
        totalScore += weightedScore;
        reasons.push({
          field: rule.field,
          similarity: Math.round(similarity),
          matchType: rule.matchType
        });
      }
    }

    return {
      score: Math.min(100, Math.round(totalScore)),
      reasons
    };
  }

  /**
   * Merge duplicate records
   */
  async mergeRecords(lawyerId, sourceIds, targetId, entityType) {
    const Model = this.getModel(entityType);
    const target = await Model.findById(targetId);

    if (!target) throw new Error('Target record not found');

    for (const sourceId of sourceIds) {
      const source = await Model.findById(sourceId);
      if (!source) continue;

      // Transfer activities
      await Activity.updateMany(
        { relatedTo: sourceId },
        { relatedTo: targetId }
      );

      // Transfer notes
      await Note.updateMany(
        { entityId: sourceId },
        { entityId: targetId }
      );

      // Transfer documents
      await Document.updateMany(
        { entityId: sourceId },
        { entityId: targetId }
      );

      // Mark as merged (soft delete)
      source.duplicateOf = targetId;
      source.status = 'merged';
      await source.save();

      // Log transaction
      await this.logTransaction(lawyerId, 'records_merged', entityType, targetId, {
        mergedFrom: sourceId,
        mergedBy: lawyerId
      });
    }

    return target;
  }

  getModel(entityType) {
    const models = { lead: Lead, contact: Contact, organization: Organization };
    return models[entityType];
  }

  getFieldValue(record, field) {
    switch (field) {
      case 'name':
        return record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim();
      default:
        return record[field];
    }
  }
}

module.exports = new DuplicateDetectionService();
```

### 3.2 Stale Lead Detection Service

```javascript
// services/staleLeadService.js

class StaleLeadService {

  // Default thresholds (days)
  THRESHOLDS = {
    warning: 7,
    stale: 14,
    dormant: 30
  };

  /**
   * Get stale leads for a lawyer
   */
  async getStaleLeads(lawyerId, options = {}) {
    const { threshold = 'warning', stageId, assignedTo } = options;
    const thresholdDays = this.THRESHOLDS[threshold];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

    const query = {
      lawyerId,
      stageEnteredAt: { $lt: cutoffDate },
      status: { $nin: ['won', 'lost', 'converted'] }
    };

    if (stageId) query.stageId = stageId;
    if (assignedTo) query.assignedTo = assignedTo;

    const leads = await Lead.find(query)
      .populate('stageId', 'name nameAr')
      .populate('assignedTo', 'firstName lastName')
      .sort({ stageEnteredAt: 1 })
      .lean();

    return leads.map(lead => ({
      ...lead,
      daysInStage: this.calculateDaysInStage(lead.stageEnteredAt),
      staleLevel: this.getStaleLevel(lead.stageEnteredAt)
    }));
  }

  /**
   * Get stale leads summary
   */
  async getStaleSummary(lawyerId) {
    const leads = await Lead.find({
      lawyerId,
      status: { $nin: ['won', 'lost', 'converted'] }
    }).lean();

    const now = new Date();
    let fresh = 0, warning = 0, stale = 0, dormant = 0;

    for (const lead of leads) {
      const days = this.calculateDaysInStage(lead.stageEnteredAt);
      if (days >= this.THRESHOLDS.dormant) dormant++;
      else if (days >= this.THRESHOLDS.stale) stale++;
      else if (days >= this.THRESHOLDS.warning) warning++;
      else fresh++;
    }

    return {
      total: leads.length,
      fresh,
      warning,
      stale,
      dormant
    };
  }

  calculateDaysInStage(stageEnteredAt) {
    if (!stageEnteredAt) return 0;
    const now = new Date();
    const diff = now - new Date(stageEnteredAt);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getStaleLevel(stageEnteredAt) {
    const days = this.calculateDaysInStage(stageEnteredAt);
    if (days >= this.THRESHOLDS.dormant) return 'dormant';
    if (days >= this.THRESHOLDS.stale) return 'stale';
    if (days >= this.THRESHOLDS.warning) return 'warning';
    return 'fresh';
  }
}

module.exports = new StaleLeadService();
```

### 3.3 Revenue Forecast Service

```javascript
// services/revenueForecastService.js

class RevenueForecastService {

  /**
   * Get revenue forecast
   */
  async getForecast(lawyerId, options = {}) {
    const { startDate, endDate, groupBy = 'stage' } = options;

    const query = {
      lawyerId,
      status: { $nin: ['lost', 'converted'] },
      expectedValue: { $gt: 0 }
    };

    if (startDate) query.expectedCloseDate = { $gte: new Date(startDate) };
    if (endDate) query.expectedCloseDate = { ...query.expectedCloseDate, $lte: new Date(endDate) };

    const leads = await Lead.find(query)
      .populate('stageId', 'name nameAr probability')
      .lean();

    // Calculate totals
    let totalExpected = 0;
    let totalWeighted = 0;

    const byStage = {};

    for (const lead of leads) {
      const probability = lead.probability || lead.stageId?.probability || 0;
      const weighted = lead.expectedValue * (probability / 100);

      totalExpected += lead.expectedValue;
      totalWeighted += weighted;

      // Group by stage
      const stageKey = lead.stageId?._id?.toString() || 'unassigned';
      if (!byStage[stageKey]) {
        byStage[stageKey] = {
          stageId: stageKey,
          stageName: lead.stageId?.name || 'Unassigned',
          stageNameAr: lead.stageId?.nameAr || 'غير محدد',
          probability: probability,
          count: 0,
          totalExpected: 0,
          totalWeighted: 0
        };
      }
      byStage[stageKey].count++;
      byStage[stageKey].totalExpected += lead.expectedValue;
      byStage[stageKey].totalWeighted += weighted;
    }

    return {
      summary: {
        totalLeads: leads.length,
        totalExpected,
        totalWeighted,
        currency: 'SAR'
      },
      byStage: Object.values(byStage).sort((a, b) => b.totalWeighted - a.totalWeighted),
      leads: leads.map(lead => ({
        id: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        expectedValue: lead.expectedValue,
        probability: lead.probability,
        weightedValue: lead.weightedValue,
        expectedCloseDate: lead.expectedCloseDate,
        stageName: lead.stageId?.name
      }))
    };
  }

  /**
   * Get forecast by time period
   */
  async getForecastByPeriod(lawyerId, options = {}) {
    const { months = 6 } = options;
    const periods = [];

    const now = new Date();

    for (let i = 0; i < months; i++) {
      const startDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);

      const leads = await Lead.find({
        lawyerId,
        status: { $nin: ['lost', 'converted'] },
        expectedCloseDate: { $gte: startDate, $lte: endDate }
      }).lean();

      let expected = 0;
      let weighted = 0;

      for (const lead of leads) {
        expected += lead.expectedValue || 0;
        weighted += lead.weightedValue || 0;
      }

      periods.push({
        period: startDate.toISOString().substring(0, 7), // YYYY-MM
        month: startDate.toLocaleString('default', { month: 'short' }),
        expected,
        weighted,
        count: leads.length
      });
    }

    return periods;
  }
}

module.exports = new RevenueForecastService();
```

### 3.4 Activity Plan Execution Service

```javascript
// services/activityPlanService.js

class ActivityPlanService {

  /**
   * Start activity plan for a lead
   */
  async startPlan(leadId, planId, startedBy) {
    const lead = await Lead.findById(leadId);
    const plan = await ActivityPlan.findById(planId);

    if (!lead || !plan) throw new Error('Lead or Plan not found');
    if (!plan.isActive) throw new Error('Plan is not active');

    lead.activeActivityPlanId = planId;
    lead.activityPlanProgress = {
      currentStepIndex: 0,
      startedAt: new Date(),
      completedSteps: []
    };

    await lead.save();

    // Schedule first step
    await this.scheduleNextStep(lead, plan);

    // Increment execution count
    plan.timesExecuted++;
    plan.lastExecutedAt = new Date();
    await plan.save();

    return lead;
  }

  /**
   * Schedule next step in the plan
   */
  async scheduleNextStep(lead, plan) {
    const progress = lead.activityPlanProgress;
    const step = plan.steps[progress.currentStepIndex];

    if (!step) {
      // Plan completed
      lead.activeActivityPlanId = null;
      await lead.save();
      return;
    }

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + (step.delayDays || 0));
    scheduledDate.setHours(scheduledDate.getHours() + (step.delayHours || 0));

    // Create activity
    const activity = new Activity({
      lawyerId: lead.lawyerId,
      type: step.activityType,
      subject: step.name,
      description: step.description,
      relatedTo: lead._id,
      relatedToType: 'lead',
      scheduledAt: scheduledDate,
      assignedTo: step.assignToOwner ? lead.assignedTo : step.specificAssignee,
      isFromActivityPlan: true,
      activityPlanId: plan._id,
      activityPlanStepId: step._id,
      status: 'scheduled'
    });

    await activity.save();

    // Schedule job for automated activities (e.g., emails)
    if (step.activityType === 'email' && step.templateId) {
      await this.scheduleAutomatedEmail(activity, step);
    }

    return activity;
  }

  /**
   * Mark step as completed and move to next
   */
  async completeStep(leadId, stepId) {
    const lead = await Lead.findById(leadId);
    if (!lead?.activeActivityPlanId) return;

    const plan = await ActivityPlan.findById(lead.activeActivityPlanId);
    if (!plan) return;

    lead.activityPlanProgress.completedSteps.push(stepId);
    lead.activityPlanProgress.currentStepIndex++;
    await lead.save();

    // Schedule next step
    await this.scheduleNextStep(lead, plan);
  }

  /**
   * Process recurring plans
   */
  async processRecurringPlans() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    // Find plans to execute
    const dailyPlans = await ActivityPlan.find({
      isActive: true,
      isRecurring: true,
      recurrenceFrequency: 'daily'
    });

    const weeklyPlans = await ActivityPlan.find({
      isActive: true,
      isRecurring: true,
      recurrenceFrequency: 'weekly',
      recurrenceDayOfWeek: dayOfWeek
    });

    const monthlyPlans = await ActivityPlan.find({
      isActive: true,
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      recurrenceDayOfMonth: dayOfMonth
    });

    const allPlans = [...dailyPlans, ...weeklyPlans, ...monthlyPlans];

    for (const plan of allPlans) {
      await this.executePlanForMatchingLeads(plan);
    }
  }
}

module.exports = new ActivityPlanService();
```

### 3.5 CRM Transaction Service

```javascript
// services/crmTransactionService.js

class CRMTransactionService {

  /**
   * Log a CRM transaction
   */
  async log(data) {
    const transaction = new CRMTransaction({
      lawyerId: data.lawyerId,
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      description: data.description,
      descriptionAr: data.descriptionAr,
      value: data.value,
      currency: data.currency || 'SAR',
      previousValue: data.previousValue,
      newValue: data.newValue,
      changedFields: data.changedFields,
      performedBy: data.performedBy,
      metadata: data.metadata
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Get transactions with filters
   */
  async getTransactions(lawyerId, options = {}) {
    const {
      type,
      entityType,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = options;

    const query = { lawyerId };

    if (type) query.type = type;
    if (entityType) query.entityType = entityType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      CRMTransaction.find(query)
        .populate('performedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CRMTransaction.countDocuments(query)
    ]);

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get transaction summary
   */
  async getSummary(lawyerId, options = {}) {
    const { startDate, endDate } = options;

    const matchQuery = { lawyerId: new mongoose.Types.ObjectId(lawyerId) };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const summary = await CRMTransaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return summary.map(item => ({
      type: item._id,
      count: item.count,
      totalValue: item.totalValue || 0
    }));
  }
}

module.exports = new CRMTransactionService();
```

---

## 4. Validation

### 4.1 Lead Validation

```javascript
// validators/leadValidator.js
const Joi = require('joi');

const leadSchema = Joi.object({
  firstName: Joi.string().required().max(100),
  firstNameAr: Joi.string().max(100),
  lastName: Joi.string().required().max(100),
  lastNameAr: Joi.string().max(100),
  email: Joi.string().email().lowercase(),
  phone: Joi.string().pattern(/^[+]?[0-9\s-()]+$/).max(20),
  mobile: Joi.string().pattern(/^[+]?[0-9\s-()]+$/).max(20),

  officeType: Joi.string().valid('solo', 'small', 'medium', 'firm'),

  organizationId: Joi.string().hex().length(24),
  jobTitle: Joi.string().max(100),
  department: Joi.string().max(100),

  source: Joi.string().valid(
    'website', 'referral', 'social_media', 'advertisement',
    'cold_call', 'trade_show', 'email_campaign', 'partner', 'direct', 'other'
  ),
  sourceDetails: Joi.string().max(500),

  status: Joi.string().valid(
    'new', 'contacted', 'qualified', 'proposal', 'negotiation',
    'won', 'lost', 'nurturing', 'unqualified'
  ),

  pipelineId: Joi.string().hex().length(24),
  stageId: Joi.string().hex().length(24),

  expectedValue: Joi.number().min(0),
  probability: Joi.number().min(0).max(100),
  currency: Joi.string().length(3).default('SAR'),
  expectedCloseDate: Joi.date(),

  assignedTo: Joi.string().hex().length(24),
  teamId: Joi.string().hex().length(24),
  territoryId: Joi.string().hex().length(24),

  preferredLanguage: Joi.string().valid('ar', 'en'),
  preferredContactMethod: Joi.string().valid('email', 'phone', 'whatsapp', 'in_person'),
  bestTimeToContact: Joi.string().max(100),
  doNotContact: Joi.boolean(),

  socialProfiles: Joi.object({
    linkedin: Joi.string().uri(),
    twitter: Joi.string(),
    facebook: Joi.string().uri(),
    website: Joi.string().uri()
  }),

  address: Joi.object({
    street: Joi.string().max(200),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    postalCode: Joi.string().max(20),
    country: Joi.string().length(2).default('SA')
  }),

  tags: Joi.array().items(Joi.string().max(50)),
  category: Joi.string().max(100),

  notes: Joi.string().max(5000),
  customFields: Joi.object()
});

module.exports = { leadSchema };
```

### 4.2 Activity Plan Validation

```javascript
// validators/activityPlanValidator.js
const Joi = require('joi');

const activityPlanStepSchema = Joi.object({
  activityType: Joi.string().valid('email', 'call', 'meeting', 'video_call', 'task', 'sms', 'whatsapp').required(),
  name: Joi.string().required().max(200),
  nameAr: Joi.string().max(200),
  description: Joi.string().max(1000),
  delayDays: Joi.number().min(0).default(0),
  delayHours: Joi.number().min(0).max(23).default(0),
  isRequired: Joi.boolean().default(false),
  templateId: Joi.string().hex().length(24),
  assignToOwner: Joi.boolean().default(true),
  specificAssignee: Joi.string().hex().length(24)
});

const activityPlanSchema = Joi.object({
  name: Joi.string().required().max(200),
  nameAr: Joi.string().max(200),
  description: Joi.string().max(1000),

  triggerOn: Joi.string().valid(
    'lead_created', 'stage_changed', 'deal_won', 'deal_lost',
    'manual', 'tag_added', 'score_threshold', 'inactivity'
  ).required(),

  triggerConditions: Joi.object({
    stageId: Joi.string().hex().length(24),
    tagName: Joi.string().max(50),
    scoreThreshold: Joi.number().min(0).max(100),
    inactivityDays: Joi.number().min(1)
  }),

  steps: Joi.array().items(activityPlanStepSchema).min(1).required(),

  isRecurring: Joi.boolean().default(false),
  recurrenceFrequency: Joi.string().valid('daily', 'weekly', 'monthly'),
  recurrenceDayOfWeek: Joi.number().min(0).max(6),
  recurrenceDayOfMonth: Joi.number().min(1).max(31),
  recurrenceEndDate: Joi.date(),

  isActive: Joi.boolean().default(true)
});

module.exports = { activityPlanSchema, activityPlanStepSchema };
```

---

## 5. Business Logic

### 5.1 Lead Stage Change Logic

```javascript
// When lead stage changes:
async function handleStageChange(lead, newStageId, userId) {
  const oldStageId = lead.stageId;

  // Update stage
  lead.stageId = newStageId;
  lead.stageEnteredAt = new Date();

  // Get new stage for probability
  const newStage = await PipelineStage.findById(newStageId);
  if (newStage?.probability) {
    lead.probability = newStage.probability;
    lead.weightedValue = lead.expectedValue * (newStage.probability / 100);
  }

  await lead.save();

  // Log transaction
  await crmTransactionService.log({
    lawyerId: lead.lawyerId,
    type: 'stage_changed',
    entityType: 'lead',
    entityId: lead._id,
    entityName: lead.fullName,
    previousValue: oldStageId,
    newValue: newStageId,
    performedBy: userId
  });

  // Check for activity plan triggers
  const plans = await ActivityPlan.find({
    lawyerId: lead.lawyerId,
    isActive: true,
    triggerOn: 'stage_changed',
    'triggerConditions.stageId': newStageId
  });

  for (const plan of plans) {
    await activityPlanService.startPlan(lead._id, plan._id, userId);
  }

  // Check if deal won/lost
  if (newStage?.type === 'won') {
    await handleDealWon(lead, userId);
  } else if (newStage?.type === 'lost') {
    await handleDealLost(lead, userId);
  }
}
```

### 5.2 Deal Won Logic

```javascript
async function handleDealWon(lead, userId) {
  lead.status = 'won';
  await lead.save();

  // Update quota
  const quota = await SalesQuota.findOne({
    lawyerId: lead.lawyerId,
    userId: lead.assignedTo,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  if (quota) {
    quota.achieved += lead.expectedValue;
    quota.dealsAchieved++;
    await quota.save();
  }

  // Log transaction
  await crmTransactionService.log({
    lawyerId: lead.lawyerId,
    type: 'deal_won',
    entityType: 'lead',
    entityId: lead._id,
    entityName: lead.fullName,
    value: lead.expectedValue,
    performedBy: userId
  });

  // Trigger activity plans for deal_won
  const plans = await ActivityPlan.find({
    lawyerId: lead.lawyerId,
    isActive: true,
    triggerOn: 'deal_won'
  });

  for (const plan of plans) {
    await activityPlanService.startPlan(lead._id, plan._id, userId);
  }
}
```

### 5.3 Lead Scoring Logic

```javascript
async function calculateLeadScore(lead) {
  let score = 0;
  const breakdown = {
    demographic: 0,
    behavioral: 0,
    engagement: 0,
    firmographics: 0
  };

  // Demographic scoring (max 25)
  if (lead.email) breakdown.demographic += 5;
  if (lead.phone) breakdown.demographic += 5;
  if (lead.jobTitle) breakdown.demographic += 5;
  if (lead.organizationId) breakdown.demographic += 10;

  // Behavioral scoring (max 25)
  const recentActivities = await Activity.countDocuments({
    relatedTo: lead._id,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });
  breakdown.behavioral = Math.min(25, recentActivities * 5);

  // Engagement scoring (max 25)
  if (lead.lastActivityAt) {
    const daysSinceActivity = Math.floor((Date.now() - lead.lastActivityAt) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity < 7) breakdown.engagement = 25;
    else if (daysSinceActivity < 14) breakdown.engagement = 15;
    else if (daysSinceActivity < 30) breakdown.engagement = 5;
  }

  // Firmographics scoring (max 25)
  if (lead.organizationId) {
    const org = await Organization.findById(lead.organizationId);
    if (org) {
      if (org.size === 'enterprise') breakdown.firmographics = 25;
      else if (org.size === 'large') breakdown.firmographics = 20;
      else if (org.size === 'medium') breakdown.firmographics = 15;
      else if (org.size === 'small') breakdown.firmographics = 10;
      else breakdown.firmographics = 5;
    }
  }

  score = breakdown.demographic + breakdown.behavioral +
          breakdown.engagement + breakdown.firmographics;

  // Determine temperature
  let temperature = 'cold';
  if (score >= 70) temperature = 'hot';
  else if (score >= 40) temperature = 'warm';

  lead.score = score;
  lead.scoreBreakdown = breakdown;
  lead.temperature = temperature;

  await lead.save();

  return { score, breakdown, temperature };
}
```

---

## Cron Jobs

```javascript
// jobs/crmJobs.js
const cron = require('node-cron');

// Process recurring activity plans - Daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  await activityPlanService.processRecurringPlans();
});

// Recalculate lead scores - Every 6 hours
cron.schedule('0 */6 * * *', async () => {
  const leads = await Lead.find({ status: { $nin: ['won', 'lost'] } });
  for (const lead of leads) {
    await calculateLeadScore(lead);
  }
});

// Update stale lead flags - Every hour
cron.schedule('0 * * * *', async () => {
  await staleLeadService.updateStaleFlags();
});

// Generate quota period reports - First of month
cron.schedule('0 0 1 * *', async () => {
  await quotaService.generateMonthlyReports();
});
```

---

## Environment Variables

```env
# Duplicate Detection
DUPLICATE_DETECTION_ENABLED=true
DUPLICATE_MIN_SCORE=60

# Stale Lead Thresholds (days)
STALE_WARNING_DAYS=7
STALE_STALE_DAYS=14
STALE_DORMANT_DAYS=30

# Activity Plans
ACTIVITY_PLAN_DEFAULT_TIMEZONE=Asia/Riyadh
```

---

This implementation guide covers all the backend requirements for the Ultimate CRM system. Each schema, endpoint, and service is designed to work with the frontend components already created.
