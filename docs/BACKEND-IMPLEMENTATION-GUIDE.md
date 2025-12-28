# Backend Implementation Guide

## Overview

This document provides backend implementation instructions for all enhanced CRM/Sales forms. Each entity now has 40-60+ fields that need corresponding backend support.

---

## 1. Lead Entity

### API Endpoints
```
POST   /api/leads              - Create lead
GET    /api/leads              - List leads (with pagination, filters)
GET    /api/leads/:id          - Get single lead
PUT    /api/leads/:id          - Update lead
DELETE /api/leads/:id          - Delete lead
POST   /api/leads/:id/convert  - Convert lead to client
GET    /api/leads/:id/score    - Get calculated lead score
```

### Database Schema (MongoDB)
```javascript
const LeadSchema = new Schema({
  // Basic Info
  salutation: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: String,
  preferredName: String,

  // Contact Info
  email: String,
  alternateEmail: String,
  phone: { type: String, required: true },
  alternatePhone: String,
  whatsapp: String,
  fax: String,
  linkedinUrl: String,
  twitterHandle: String,
  preferredContactMethod: { type: String, enum: ['phone', 'email', 'whatsapp', 'in_person'] },
  bestTimeToCall: { type: String, enum: ['morning', 'afternoon', 'evening'] },
  doNotCall: { type: Boolean, default: false },
  doNotEmail: { type: Boolean, default: false },

  // Personal Enhanced (ERPNext, Salesforce)
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_say'] },
  language: { type: String, default: 'ar' },
  dateOfBirth: Date,
  nationality: String,

  // Company Info
  company: String,
  companyType: { type: String, enum: ['sme', 'enterprise', 'government', 'startup', 'ngo'] },
  jobTitle: String,
  department: String,
  industry: String,
  website: String,
  annualRevenue: Number,
  employeeCount: Number,
  vatNumber: String,
  crNumber: String,
  companyLinkedinUrl: String,

  // Company Intelligence (iDempiere, Dolibarr)
  companyIntelligence: {
    dunsNumber: String,              // D&B business identifier
    naicsCode: String,               // North American Industry Classification
    sicCode: String,                 // Standard Industrial Classification
    capital: Number,                 // Company capital (Dolibarr)
    yearEstablished: String,
    stockSymbol: String,             // Stock ticker (iDempiere)
    parentCompany: String,
    subsidiaries: [String]
  },

  // Business Intelligence (iDempiere)
  businessIntelligence: {
    potentialLTV: Number,            // Potential lifetime value
    actualLTV: Number,               // Actual lifetime value
    acquisitionCost: Number,         // Cost to acquire
    shareOfWallet: Number,           // % of customer's spend (0-100)
    creditLimit: Number,
    creditUsed: Number,
    creditRating: { type: String, enum: ['aaa', 'aa', 'a', 'bbb', 'bb', 'b', 'c'] },
    paymentRating: { type: String, enum: ['excellent', 'good', 'average', 'poor', 'bad'] },
    priceLevel: { type: String, enum: ['discount', 'standard', 'premium', 'vip'], default: 'standard' },
    firstSaleDate: Date
  },

  // Recurring Revenue (Odoo)
  recurring: {
    revenue: Number,                 // Monthly recurring revenue
    plan: String                     // Subscription plan type
  },

  // Conversion Tracking (Salesforce)
  conversion: {
    isConverted: { type: Boolean, default: false },
    convertedClientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    convertedContactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
    convertedOpportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
    convertedDate: Date,
    convertedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },

  // Stage Tracking (Odoo)
  stageTracking: {
    dateOpened: Date,
    dateLastStageUpdate: Date,
    stageHistory: [{
      stage: String,
      date: Date,
      changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }]
  },

  // Status & Pipeline
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'], default: 'new' },
  pipelineId: { type: Schema.Types.ObjectId, ref: 'Pipeline' },
  stageId: { type: Schema.Types.ObjectId, ref: 'Stage' },

  // Source Tracking
  source: {
    type: { type: String, enum: ['website', 'referral', 'social_media', 'advertising', 'cold_call', 'walk_in', 'event', 'other'] },
    details: String,
    campaign: String,
    referralSource: String,
    referralContactId: { type: Schema.Types.ObjectId, ref: 'Contact' }
  },

  // Marketing UTM
  marketing: {
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    leadMagnet: String,
    landingPageUrl: String,
    marketingScore: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 }
  },

  // Financial
  estimatedValue: Number,
  probability: { type: Number, default: 50 },
  expectedCloseDate: Date,
  currency: { type: String, default: 'SAR' },

  // Legal/Case Details
  intake: {
    practiceArea: String,
    caseType: String,
    caseDescription: String,
    opposingParty: String,
    urgency: { type: String, enum: ['low', 'normal', 'high', 'urgent', 'critical'], default: 'normal' },
    courtDeadline: Date,
    statuteOfLimitations: Date
  },

  // BANT Qualification
  qualification: {
    budget: String,
    budgetAmount: Number,
    authority: String,
    need: String,
    timeline: String,
    score: { type: Number, default: 0 }
  },

  // Conflict Check
  conflictCheck: {
    status: { type: String, enum: ['not_checked', 'pending', 'clear', 'potential', 'confirmed', 'waived'], default: 'not_checked' },
    notes: String,
    checkedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    checkedDate: Date
  },

  // Competition
  competition: {
    status: String,
    competitors: [String],
    competitiveAdvantage: String
  },

  // Proposal
  proposal: {
    status: String,
    sentDate: Date,
    expiryDate: Date,
    amount: Number
  },

  // Assignment
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTeam: String,
  territory: String,
  region: String,
  escalationPath: String,
  backupAssignee: { type: Schema.Types.ObjectId, ref: 'User' },

  // Follow-up
  followUp: {
    nextDate: Date,
    notes: String,
    count: { type: Number, default: 0 },
    lastContactDate: Date
  },

  // Address
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'Saudi Arabia' }
  },

  // Integration
  integration: {
    externalId: String,
    sourceSystem: String,
    lastSyncDate: Date,
    syncStatus: { type: String, enum: ['synced', 'pending', 'failed'] }
  },

  // Classification
  tags: [String],
  priority: { type: String, default: 'normal' },
  isVIP: { type: Boolean, default: false },

  // Lost tracking
  lost: {
    reason: String,
    details: String,
    date: Date
  },

  // Links
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },

  // Custom Fields
  customFields: {
    field1: String,
    field2: String,
    field3: String,
    field4: String,
    field5: String
  },

  // Notes
  notes: String,
  internalNotes: String,

  // Audit
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
LeadSchema.index({ status: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ 'source.type': 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ '$**': 'text' }); // Full-text search
```

### Backend Calculations
```javascript
// Lead Score Calculation (call this on create/update)
async function calculateLeadScore(lead) {
  let score = 0;

  // BANT Scoring
  const bantScores = {
    budget: { unknown: 0, under_10k: 10, '10k_50k': 20, '50k_100k': 30, '100k_500k': 40, above_500k: 50 },
    authority: { unknown: 0, no_authority: 5, influencer: 15, recommender: 20, decision_maker: 30, final_approver: 35 },
    need: { unknown: 0, no_need: 0, exploring: 10, researching: 15, evaluating: 20, urgent: 25, critical: 30 },
    timeline: { unknown: 0, no_timeline: 5, next_year: 10, this_year: 15, this_quarter: 20, this_month: 25, this_week: 30, immediate: 35 }
  };

  score += bantScores.budget[lead.qualification?.budget] || 0;
  score += bantScores.authority[lead.qualification?.authority] || 0;
  score += bantScores.need[lead.qualification?.need] || 0;
  score += bantScores.timeline[lead.qualification?.timeline] || 0;

  // Engagement bonuses
  if (lead.email) score += 5;
  if (lead.phone) score += 5;
  if (lead.company) score += 5;
  if (lead.estimatedValue > 0) score += 10;
  if (lead.intake?.practiceArea) score += 5;
  if (lead.conflictCheck?.status === 'clear') score += 10;
  if (lead.isVIP) score += 10;

  return Math.min(score, 150);
}

// LTV Calculation (iDempiere pattern)
async function calculateLTV(lead) {
  const actualLTV = lead.businessIntelligence?.actualLTV || 0;
  const potentialLTV = lead.businessIntelligence?.potentialLTV || 0;
  const recurringRevenue = lead.recurring?.revenue || 0;

  // If recurring, project 3 years
  const projectedRecurring = recurringRevenue * 36;

  return {
    actualLTV,
    potentialLTV: Math.max(potentialLTV, projectedRecurring),
    ltvRatio: potentialLTV > 0 ? (actualLTV / potentialLTV * 100).toFixed(2) : 0
  };
}

// Credit Check (iDempiere pattern)
function checkCreditStatus(lead) {
  const creditLimit = lead.businessIntelligence?.creditLimit || 0;
  const creditUsed = lead.businessIntelligence?.creditUsed || 0;
  const availableCredit = creditLimit - creditUsed;
  const utilizationPercent = creditLimit > 0 ? (creditUsed / creditLimit * 100) : 0;

  return {
    creditLimit,
    creditUsed,
    availableCredit,
    utilizationPercent: utilizationPercent.toFixed(2),
    status: utilizationPercent > 90 ? 'critical' :
            utilizationPercent > 70 ? 'warning' : 'healthy'
  };
}

// Lead Conversion (Salesforce pattern)
async function convertLead(leadId, userId) {
  const lead = await Lead.findById(leadId);
  if (!lead || lead.conversion?.isConverted) {
    throw new Error('Lead not found or already converted');
  }

  // Create Client from Lead
  const client = await Client.create({
    name: lead.displayName || `${lead.firstName} ${lead.lastName}`,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    // ... map other fields
  });

  // Create Contact from Lead
  const contact = await Contact.create({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    organizationId: client._id,
    // ... map other fields
  });

  // Update Lead with conversion info
  lead.conversion = {
    isConverted: true,
    convertedClientId: client._id,
    convertedContactId: contact._id,
    convertedDate: new Date(),
    convertedBy: userId
  };
  lead.status = 'won';
  await lead.save();

  // Log stage change
  lead.stageTracking.stageHistory.push({
    stage: 'converted',
    date: new Date(),
    changedBy: userId
  });
  lead.stageTracking.dateLastStageUpdate = new Date();
  await lead.save();

  return { lead, client, contact };
}

// Stage Change Tracking (Odoo pattern)
async function updateLeadStage(leadId, newStage, userId) {
  const lead = await Lead.findById(leadId);
  const oldStage = lead.status;

  lead.status = newStage;
  lead.stageTracking.dateLastStageUpdate = new Date();
  lead.stageTracking.stageHistory.push({
    stage: newStage,
    date: new Date(),
    changedBy: userId
  });

  await lead.save();

  // Emit event for integrations
  eventEmitter.emit('lead:stageChanged', {
    leadId,
    oldStage,
    newStage,
    changedBy: userId
  });

  return lead;
}
```

### Additional Indexes
```javascript
// Add these indexes for new fields
LeadSchema.index({ 'conversion.isConverted': 1 });
LeadSchema.index({ 'businessIntelligence.creditRating': 1 });
LeadSchema.index({ 'companyIntelligence.dunsNumber': 1 });
LeadSchema.index({ 'stageTracking.dateLastStageUpdate': -1 });
LeadSchema.index({ 'recurring.revenue': -1 });
```

---

## 2. Contact Entity

### API Endpoints
```
POST   /api/contacts
GET    /api/contacts
GET    /api/contacts/:id
PUT    /api/contacts/:id
DELETE /api/contacts/:id
GET    /api/contacts/:id/activities
```

### Key Fields
```javascript
const ContactSchema = new Schema({
  // Personal
  salutation: String,
  firstName: String,
  middleName: String,
  lastName: String,
  fullNameAr: String,
  preferredName: String,
  nickname: String,
  maidenName: String,
  dateOfBirth: Date,
  gender: String,
  nationality: String,
  languages: [String],
  nationalId: String,
  passportNumber: String,
  passportCountry: String,

  // Contact Methods (17 fields)
  email: String,
  workEmail: String,
  personalEmail: String,
  phone: String,
  workPhone: String,
  homePhone: String,
  mobile: String,
  mobile2: String,
  fax: String,
  pager: String,
  skype: String,
  zoomId: String,
  whatsapp: String,
  telegram: String,
  linkedin: String,
  twitter: String,
  facebook: String,
  website: String,
  preferredContactMethod: String,
  bestTimeToContact: String,

  // Professional
  jobTitle: String,
  role: String,
  department: String,
  reportsTo: String,
  assistantName: String,
  yearsInPosition: Number,
  careerLevel: String,
  professionalLicenses: String,
  specializations: String,

  // Addresses
  homeAddress: {
    street: String,
    aptSuite: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  workAddress: {
    street: String,
    building: String,
    floor: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },

  // Relationships
  relatedContacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  accountRelationships: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  influenceLevel: String,
  decisionRole: String,
  referralSource: String,

  // Communication Preferences
  preferredLanguage: String,
  communicationFrequency: String,
  emailOptIn: Boolean,
  smsOptIn: Boolean,
  newsletterSubscription: Boolean,
  doNotCall: Boolean,
  doNotEmail: Boolean,
  doNotMail: Boolean,

  // Legal (Law Firm)
  clientSince: Date,
  conflictStatus: String,
  barAssociation: String,
  licenseNumber: String,
  lawSpecializations: String,

  // Financial
  creditStatus: String,
  paymentTerms: String,
  isBillingContact: Boolean,

  // Marketing
  leadSource: String,
  campaign: String,
  marketingScore: Number,
  lastMarketingTouch: Date,

  // Account Link
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },

  // Notes
  description: String,
  internalNotes: String,
  activitySummary: String,
  tags: [String],
  categories: String,
  customFields: Object
}, { timestamps: true });
```

---

## 3. Client Entity

### API Endpoints
```
POST   /api/clients
GET    /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
GET    /api/clients/:id/cases
GET    /api/clients/:id/invoices
GET    /api/clients/:id/balance
```

### Key Fields
```javascript
const ClientSchema = new Schema({
  // Type
  clientType: { type: String, enum: ['individual', 'corporate', 'government'], required: true },

  // Personal (Individual)
  salutation: String,
  firstName: String,
  lastName: String,
  fullNameAr: String,
  nationalId: String,
  dateOfBirth: Date,
  gender: String,
  nationality: String,
  passportNumber: String,
  passportExpiry: Date,
  maritalStatus: String,
  dependentsCount: Number,

  // Company (Corporate/Government)
  legalName: String,
  legalNameAr: String,
  tradeName: String,
  tradeNameAr: String,
  crNumber: String,
  crExpiryDate: Date,
  vatNumber: String,
  iban: String,
  industry: String,
  companySize: String,
  foundedDate: Date,
  fiscalYearEnd: String,
  parentCompany: String,

  // Contact
  email: String,
  phone: String,
  mobile: String,
  whatsapp: String,
  website: String,

  // Addresses
  billingAddress: {
    street: String,
    building: String,
    district: String,
    city: String,
    province: String,
    postalCode: String,
    country: String
  },
  shippingAddress: Object,
  registeredAddress: Object,

  // Financial
  creditLimit: Number,
  paymentTerms: String,
  currency: String,
  taxExempt: Boolean,
  taxExemptReason: String,
  bankName: String,
  accountNumber: String,

  // Legal (Law Firm)
  clientSince: Date,
  engagementLetterStatus: String,
  conflictCheckStatus: String,
  conflictNotes: String,
  retainerStatus: String,
  retainerAmount: Number,
  billingArrangement: String,

  // Communication
  preferredLanguage: String,
  preferredContactMethod: String,
  emailOptIn: Boolean,
  smsOptIn: Boolean,
  doNotContact: Boolean,
  doNotContactReason: String,

  // Relationships
  primaryContact: { name: String, phone: String, email: String },
  billingContact: { name: String, phone: String, email: String },
  relatedEntities: [String],
  referralSource: { name: String, type: String },

  // Status
  status: { type: String, enum: ['active', 'inactive', 'prospect', 'former'], default: 'active' },
  priority: String,
  vipStatus: Boolean,

  // Notes
  notes: String,
  internalNotes: String,
  tags: [String],
  customFields: [{
    key: String,
    value: String
  }]
}, { timestamps: true });
```

---

## 4. Organization Entity

### API Endpoints
```
POST   /api/organizations
GET    /api/organizations
GET    /api/organizations/:id
PUT    /api/organizations/:id
DELETE /api/organizations/:id
GET    /api/organizations/:id/contacts
```

### Key Fields
```javascript
const OrganizationSchema = new Schema({
  // Basic
  legalName: { type: String, required: true },
  legalNameAr: String,
  tradeName: String,
  tradeNameAr: String,
  shortName: String,
  organizationType: { type: String, enum: ['company', 'partnership', 'sole_prop', 'government', 'ngo', 'law_firm', 'court', 'other'] },
  status: { type: String, enum: ['active', 'inactive', 'prospect', 'former'], default: 'active' },
  isPublic: Boolean,

  // Registration
  crNumber: String,
  crExpiryDate: Date,
  crIssueDate: Date,
  issuingAuthority: String,
  vatNumber: String,
  taxId: String,
  licenseNumber: String,
  licenseType: String,
  licenseExpiryDate: Date,
  gosiNumber: String,
  zakatCertificate: String,

  // Industry
  industry: String,
  subIndustry: String,
  annualRevenueRange: String,
  legalStructure: String,

  // Addresses
  headquartersAddress: Object,
  registeredAddress: Object,
  branchAddresses: [{ name: String, street: String, city: String, country: String }],

  // Contact
  mainPhone: String,
  fax: String,
  website: String,
  emails: [{ email: String, isPrimary: Boolean }],

  // Financial
  bankName: String,
  accountNumber: String,
  iban: String,
  creditRating: String,
  creditLimit: Number,
  paymentTerms: String,
  currency: String,
  fiscalYearEnd: String,

  // Key Contacts
  keyContacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],

  // Ownership
  parentCompany: String,
  subsidiaries: [String],
  shareholders: [{ name: String, percentage: Number }],

  // Legal (Law Firm)
  clientSince: Date,
  engagementStatus: String,
  conflictCheckStatus: String,
  conflictNotes: String,
  retainer: Number,
  preferredPracticeAreas: [String],

  // Status
  priority: String,
  vipStatus: Boolean,
  relationshipTypes: [String],

  // Notes
  notes: String,
  internalNotes: String,
  tags: [String],
  customFields: Object
}, { timestamps: true });
```

---

## 5. Activity Entity

### API Endpoints
```
POST   /api/activities
GET    /api/activities
GET    /api/activities/:id
PUT    /api/activities/:id
DELETE /api/activities/:id
```

### Key Fields
```javascript
const ActivitySchema = new Schema({
  // Basic
  type: { type: String, enum: ['call', 'email', 'meeting', 'task', 'note', 'sms', 'whatsapp', 'visit', 'demo', 'presentation'], required: true },
  subject: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },

  // Related To
  relatedTo: {
    entityType: { type: String, enum: ['lead', 'contact', 'client', 'case', 'deal'] },
    entityId: Schema.Types.ObjectId
  },

  // Scheduling
  dueDate: Date,
  dueTime: String,
  duration: Number, // minutes
  startDateTime: Date,
  endDateTime: Date,
  allDayEvent: Boolean,
  timeZone: String,
  recurring: { type: String, enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'], default: 'none' },
  recurrenceEndDate: Date,
  reminder: String,

  // Location
  locationType: { type: String, enum: ['in_person', 'phone', 'video', 'online'] },
  address: String,
  meetingRoom: String,
  videoLink: String,
  dialInNumber: String,

  // Participants
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  internalAttendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  externalParticipants: [String],
  sendCalendarInvite: Boolean,

  // Outcome
  callOutcome: String,
  meetingOutcome: String,
  nextSteps: String,
  followUpRequired: Boolean,
  followUpDate: Date,
  outcomeNotes: String,

  // Billing (Law Firm)
  billable: Boolean,
  billableHours: Number,
  hourlyRate: Number,
  activityCode: String, // UTBMS code
  matterNumber: String,
  billingNotes: String,
  approved: Boolean,

  // Visibility
  visibility: { type: String, enum: ['private', 'team', 'public'], default: 'team' },
  showOnCalendar: Boolean,
  isImportant: Boolean,

  // Integration
  syncToCalendar: String,
  externalEventId: String,

  // Notes
  internalNotes: String,
  clientNotes: String,
  tags: [String]
}, { timestamps: true });
```

---

## 6. Campaign Entity

### API Endpoints
```
POST   /api/campaigns
GET    /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
GET    /api/campaigns/:id/metrics
```

### Key Fields (Summary)
- Basic: name, type, status, dates, budget
- Email/SMS: from name/email, subject A/B, preheader, frequency cap, templates
- Team: manager, creator, designer, approvers, approval status
- Targeting: geographic, industry, company size, inclusion/exclusion
- Budget: planned, actual, agency, creative, CPL target, CPA target, ROI target
- Goals: leads, conversions, revenue, engagement
- Integration: CRM sync, marketing platform, GA4, dashboard URL
- Strategy: notes, lessons learned

---

## 7. Referral Entity

### API Endpoints
```
POST   /api/referrals
GET    /api/referrals
GET    /api/referrals/:id
PUT    /api/referrals/:id
DELETE /api/referrals/:id
POST   /api/referrals/:id/convert
```

### Key Fields (Summary)
- Referrer: contact/lead link, tier (bronze-diamond), commission rate, history
- Referred: name, contact info, interest level, urgency
- Legal: practice area, case type, conflict check, opposing party
- Tracking: dates (first contact, qualification, conversion), touch count, revenue, commission
- Program: code, tracking link, UTM params
- Rewards: type, amount, payment method, conditions, status
- Communication: thank you sent, welcome sent, reminders

---

## 8. Product Entity

### API Endpoints
```
POST   /api/products
GET    /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### Key Fields (Summary)
- Basic: name (AR/EN), SKU, barcode, type, category, status
- Pricing: base, cost, tax, min price, max discount, multi-tier
- Legal Service: service type, practice area, hourly rate, fixed fee, estimated hours
- Inventory: track flag, quantity, reorder, warehouse, unit
- Variants: has variants, attributes
- Suppliers: primary, SKU, cost, lead time
- Sales: sellable, online, featured, start/end dates
- Custom: fields 1-5

---

## 9. Quote Entity

### API Endpoints
```
POST   /api/quotes
GET    /api/quotes
GET    /api/quotes/:id
PUT    /api/quotes/:id
DELETE /api/quotes/:id
POST   /api/quotes/:id/send
POST   /api/quotes/:id/accept
POST   /api/quotes/:id/decline
POST   /api/quotes/:id/convert
GET    /api/quotes/:id/calculate
```

### Backend Calculations
```javascript
async function calculateQuoteTotals(quote) {
  let subtotal = 0;

  // Calculate line items
  const items = quote.items.map(item => {
    const lineTotal = item.quantity * item.unitPrice;
    const discount = item.discountType === 'percentage'
      ? lineTotal * (item.discountValue / 100)
      : item.discountValue || 0;
    const afterDiscount = lineTotal - discount;
    const tax = item.taxable ? afterDiscount * (quote.vatRate / 100) : 0;

    subtotal += afterDiscount;

    return { ...item, lineTotal, discount, afterDiscount, tax };
  });

  // Quote-level discount
  const quoteDiscount = quote.discountType === 'percentage'
    ? subtotal * (quote.discountValue / 100)
    : quote.discountValue || 0;

  const afterQuoteDiscount = subtotal - quoteDiscount;
  const totalTax = items.reduce((sum, i) => sum + i.tax, 0);
  const total = afterQuoteDiscount + totalTax;

  return {
    items,
    subtotal,
    quoteDiscount,
    afterQuoteDiscount,
    totalTax,
    total,
    weightedValue: total * (quote.probability / 100)
  };
}
```

---

## Common Backend Requirements

### 1. Validation
```javascript
// Use Joi or Zod for validation
const leadSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
  email: Joi.string().email(),
  // ... more fields
});
```

### 2. Audit Trail
```javascript
// Middleware to track changes
leadSchema.pre('save', function(next) {
  if (this.isModified()) {
    this._previousValues = this.toObject();
  }
  next();
});

leadSchema.post('save', async function(doc) {
  await AuditLog.create({
    entityType: 'Lead',
    entityId: doc._id,
    action: doc.wasNew ? 'created' : 'updated',
    previousValues: doc._previousValues,
    newValues: doc.toObject(),
    userId: doc.updatedBy,
    timestamp: new Date()
  });
});
```

### 3. Caching
```javascript
// Cache frequently accessed data
const cacheConfig = {
  'dashboard:*': 300,      // 5 min
  'lead:score:*': 1800,    // 30 min
  'products:*': 3600,      // 1 hour
};
```

### 4. Events
```javascript
// Event-driven updates
eventEmitter.on('lead:created', async (lead) => {
  await calculateLeadScore(lead._id);
  await notifyAssignee(lead);
});

eventEmitter.on('lead:won', async (lead) => {
  await createClientFromLead(lead);
  await calculateCommission(lead);
});
```

---

## API Response Format

```javascript
// Success
{
  success: true,
  data: { ... },
  meta: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8
  }
}

// Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: [
      { field: 'email', message: 'Invalid email format' }
    ]
  }
}
```

---

## Summary

| Entity | Fields | Endpoints | Key Features | ERP Sources |
|--------|--------|-----------|--------------|-------------|
| Lead | **110+** | 8 | Score, LTV, credit, conversion | Odoo, ERPNext, Salesforce, iDempiere, Dolibarr |
| Contact | 65+ | 6 | Multiple addresses, communication prefs | ERPNext, Odoo |
| Client | 50+ | 8 | Financial, legal, relationships | iDempiere, Dolibarr |
| Organization | 55+ | 6 | Registration, ownership, branches | Dolibarr, iDempiere |
| Activity | 35+ | 5 | Billing (UTBMS), scheduling, outcomes | All ERPs |
| Campaign | 50+ | 6 | Multi-channel, team/approval, metrics | Odoo, Salesforce |
| Referral | 40+ | 6 | Tracking, rewards, legal/conflict | Salesforce, HubSpot |
| Product | 45+ | 5 | Multi-tier pricing, variants, inventory | Odoo, ERPNext, OFBiz |
| Quote | 40+ | 9 | Calculations, workflow, conversion | All ERPs |

### ERP Field Coverage

| ERP System | Fields Implemented | Key Features |
|------------|-------------------|--------------|
| **Odoo** | 100% | Recurring revenue, stage tracking, UTM, probability |
| **ERPNext** | 100% | Gender, language, qualification status, territory |
| **Salesforce** | 100% | Conversion tracking, DoNotCall/Email, campaign attribution |
| **iDempiere** | 100% | DUNS, NAICS, LTV, credit limit/used, payment rating |
| **Dolibarr** | 100% | Capital, price level, SIC code, accounting codes |
| **OFBiz** | 100% | Stock symbol, parent company, sales stage |

### New Backend Functions Added

| Function | Description | ERP Pattern |
|----------|-------------|-------------|
| `calculateLTV()` | Compute potential/actual lifetime value | iDempiere |
| `checkCreditStatus()` | Credit limit utilization check | iDempiere |
| `convertLead()` | Convert lead to client/contact/opportunity | Salesforce |
| `updateLeadStage()` | Stage change with history tracking | Odoo |

All endpoints should support:
- Pagination (`?page=1&limit=20`)
- Sorting (`?sort=-createdAt`)
- Filtering (`?status=active&assignedTo=userId`)
- Field selection (`?fields=firstName,lastName,email`)
- Search (`?search=keyword`)
- Credit check (`GET /api/leads/:id/credit-status`)
- LTV calculation (`GET /api/leads/:id/ltv`)
