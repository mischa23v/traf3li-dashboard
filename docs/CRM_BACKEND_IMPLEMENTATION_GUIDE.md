# CRM Backend Implementation Guide

This document provides detailed instructions for implementing the backend APIs required by the CRM Enhancement Plan.

---

## Table of Contents

1. [Database Models](#1-database-models)
2. [API Endpoints](#2-api-endpoints)
3. [CRM Settings API](#3-crm-settings-api)
4. [Territory API](#4-territory-api)
5. [Sales Person API](#5-sales-person-api)
6. [Lead Source API](#6-lead-source-api)
7. [Sales Stage API](#7-sales-stage-api)
8. [Lost Reason API](#8-lost-reason-api)
9. [Competitor API](#9-competitor-api)
10. [Appointment API](#10-appointment-api)
11. [CRM Reports API](#11-crm-reports-api)
12. [Lead & Case Updates](#12-lead--case-updates)
13. [Conversion APIs](#13-conversion-apis)
14. [Validation Rules](#14-validation-rules)
15. [Indexes & Performance](#15-indexes--performance)

---

## 1. Database Models

### 1.1 CRM Settings Collection

```javascript
// Collection: crm_settings
{
  _id: ObjectId,
  officeId: ObjectId, // Reference to office

  leadSettings: {
    allowDuplicateEmails: Boolean,      // default: false
    allowDuplicatePhones: Boolean,      // default: false
    autoCreateContact: Boolean,         // default: true
    defaultLeadSource: String,          // LeadSource ID
    defaultAssignee: String,            // User ID
    leadScoringEnabled: Boolean,        // default: false
    autoAssignmentEnabled: Boolean,     // default: false
    autoAssignmentRule: String,         // 'round_robin' | 'load_balance' | 'territory'
    trackFirstResponseTime: Boolean     // default: true
  },

  caseSettings: {
    autoCloseAfterDays: Number,         // default: 90
    autoCloseEnabled: Boolean,          // default: false
    requireConflictCheck: Boolean,      // default: true
    conflictCheckBeforeStage: String,   // SalesStage ID
    defaultPipeline: String,
    defaultSalesStage: String,          // SalesStage ID
    autoCreateQuoteOnQualified: Boolean // default: false
  },

  quoteSettings: {
    defaultValidDays: Number,           // default: 30
    autoSendReminder: Boolean,          // default: false
    reminderDaysBefore: Number,         // default: 3
    requireApproval: Boolean,           // default: false
    approvalThreshold: Number,          // Amount above which approval needed
    approvers: [String]                 // User IDs
  },

  communicationSettings: {
    carryForwardCommunication: Boolean,        // default: true
    updateTimestampOnCommunication: Boolean,   // default: true
    autoLogEmails: Boolean,                    // default: true
    autoLogCalls: Boolean,                     // default: true
    autoLogWhatsApp: Boolean,                  // default: false
    defaultEmailTemplateId: String,
    defaultSMSTemplateId: String
  },

  appointmentSettings: {
    enabled: Boolean,                   // default: true
    defaultDuration: Number,            // default: 30 (minutes)
    allowedDurations: [Number],         // default: [15, 30, 45, 60]
    advanceBookingDays: Number,         // default: 30
    minAdvanceBookingHours: Number,     // default: 2
    agentList: [String],                // User IDs
    holidayListId: String,
    bufferBetweenAppointments: Number,  // default: 15 (minutes)
    workingHours: {
      sunday: { enabled: Boolean, start: String, end: String },
      monday: { enabled: Boolean, start: String, end: String },
      tuesday: { enabled: Boolean, start: String, end: String },
      wednesday: { enabled: Boolean, start: String, end: String },
      thursday: { enabled: Boolean, start: String, end: String },
      friday: { enabled: Boolean, start: String, end: String },
      saturday: { enabled: Boolean, start: String, end: String }
    },
    sendReminders: Boolean,             // default: true
    reminderHoursBefore: [Number],      // default: [24, 1]
    publicBookingEnabled: Boolean,      // default: false
    publicBookingUrl: String,
    requirePhoneVerification: Boolean   // default: true
  },

  namingSettings: {
    campaignNamingBy: String,           // 'name' | 'series', default: 'series'
    leadPrefix: String,                 // default: 'LEAD-'
    casePrefix: String,                 // default: 'CASE-'
    quotePrefix: String,                // default: 'QT-'
    contractPrefix: String,             // default: 'CTR-'
    appointmentPrefix: String,          // default: 'APT-'
    numberFormat: String,               // 'YYYY-####' | 'YYMM-####' | '####'
    resetNumberingYearly: Boolean       // default: true
  },

  territorySettings: {
    enabled: Boolean,                   // default: false
    defaultTerritory: String,           // Territory ID
    autoAssignByTerritory: Boolean,     // default: false
    requireTerritoryOnLead: Boolean,    // default: false
    requireTerritoryOnCase: Boolean     // default: false
  },

  salesPersonSettings: {
    hierarchyEnabled: Boolean,          // default: false
    commissionTrackingEnabled: Boolean, // default: false
    targetTrackingEnabled: Boolean,     // default: false
    requireSalesPersonOnCase: Boolean,  // default: false
    defaultCommissionRate: Number       // default: 5 (percentage)
  },

  conversionSettings: {
    autoCreateCaseOnConsultation: Boolean,    // default: false
    requireBANTBeforeCase: Boolean,           // default: false
    autoCreateQuoteOnQualified: Boolean,      // default: false
    autoCreateSalesOrderOnAccept: Boolean,    // default: false
    linkSalesOrderToFinance: Boolean,         // default: true
    autoCreateClientOnSalesOrder: Boolean,    // default: false
    clientCreationTrigger: String,            // 'sales_order' | 'payment_received' | 'manual'
    copyNotesToCase: Boolean,                 // default: true
    copyActivityHistory: Boolean,             // default: true
    copyDocuments: Boolean                    // default: true
  },

  createdAt: Date,
  updatedAt: Date
}
```

### 1.2 Territory Collection

```javascript
// Collection: territories
{
  _id: ObjectId,
  officeId: ObjectId,

  name: String,                         // Required
  nameAr: String,                       // Required (Arabic)
  slug: String,                         // URL-friendly, unique per office

  parentTerritoryId: ObjectId,          // For hierarchy, null for root
  isGroup: Boolean,                     // default: false
  level: Number,                        // 0 = root, 1, 2, etc.
  path: String,                         // e.g., "saudi-arabia/riyadh/north"

  managerId: ObjectId,                  // SalesPerson ID

  targets: [{
    year: Number,
    quarter: Number,                    // 1-4, optional
    targetAmount: Number,
    achievedAmount: Number              // Calculated
  }],

  enabled: Boolean,                     // default: true
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.territories.createIndex({ officeId: 1, slug: 1 }, { unique: true })
db.territories.createIndex({ officeId: 1, parentTerritoryId: 1 })
db.territories.createIndex({ officeId: 1, path: 1 })
```

### 1.3 Sales Person Collection

```javascript
// Collection: sales_persons
{
  _id: ObjectId,
  officeId: ObjectId,

  name: String,                         // Required
  nameAr: String,                       // Required (Arabic)

  parentSalesPersonId: ObjectId,        // For hierarchy
  isGroup: Boolean,                     // default: false
  level: Number,
  path: String,

  employeeId: ObjectId,                 // Reference to employee
  userId: ObjectId,                     // Reference to user account

  commissionRate: Number,               // Percentage, default: 5

  territoryIds: [ObjectId],             // Assigned territories

  targets: [{
    year: Number,
    quarter: Number,
    month: Number,
    targetAmount: Number,
    achievedAmount: Number,
    targetLeads: Number,
    achievedLeads: Number,
    targetCases: Number,
    achievedCases: Number
  }],

  enabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.sales_persons.createIndex({ officeId: 1, userId: 1 })
db.sales_persons.createIndex({ officeId: 1, territoryIds: 1 })
```

### 1.4 Lead Source Collection

```javascript
// Collection: lead_sources
{
  _id: ObjectId,
  officeId: ObjectId,

  name: String,                         // Required
  nameAr: String,                       // Required
  slug: String,                         // Unique per office
  description: String,

  utmSource: String,                    // For UTM tracking
  utmMedium: String,

  enabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.lead_sources.createIndex({ officeId: 1, slug: 1 }, { unique: true })
```

### 1.5 Sales Stage Collection

```javascript
// Collection: sales_stages
{
  _id: ObjectId,
  officeId: ObjectId,

  name: String,                         // Required
  nameAr: String,                       // Required
  order: Number,                        // Required, for sorting

  defaultProbability: Number,           // 0-100
  type: String,                         // 'open' | 'won' | 'lost'
  color: String,                        // Hex color, e.g., '#3B82F6'

  requiresConflictCheck: Boolean,       // default: false
  requiresQualification: Boolean,       // default: false
  autoCreateQuote: Boolean,             // default: false

  enabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.sales_stages.createIndex({ officeId: 1, order: 1 })
```

### 1.6 Lost Reason Collection

```javascript
// Collection: lost_reasons
{
  _id: ObjectId,
  officeId: ObjectId,

  reason: String,                       // Required
  reasonAr: String,                     // Required
  category: String,                     // 'price' | 'competitor' | 'timing' | 'scope' | 'relationship' | 'internal' | 'other'

  enabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.lost_reasons.createIndex({ officeId: 1, category: 1 })
```

### 1.7 Competitor Collection

```javascript
// Collection: competitors
{
  _id: ObjectId,
  officeId: ObjectId,

  name: String,                         // Required
  nameAr: String,
  website: String,
  description: String,

  casesLostTo: Number,                  // Calculated
  casesWonAgainst: Number,              // Calculated

  enabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 1.8 Appointment Collection

```javascript
// Collection: appointments
{
  _id: ObjectId,
  officeId: ObjectId,
  appointmentNumber: String,            // Auto-generated, e.g., "APT-2024-00001"

  scheduledTime: Date,                  // Required
  duration: Number,                     // Minutes, required
  endTime: Date,                        // Calculated

  status: String,                       // 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

  customerName: String,                 // Required
  customerEmail: String,                // Required
  customerPhone: String,
  customerNotes: String,

  appointmentWith: String,              // 'lead' | 'client' | 'contact'
  partyId: ObjectId,                    // Lead ID, Client ID, or Contact ID
  caseId: ObjectId,                     // Optional

  assignedTo: ObjectId,                 // User/SalesPerson ID, required

  locationType: String,                 // 'office' | 'virtual' | 'client_site' | 'other'
  location: String,
  meetingLink: String,

  calendarEventId: String,              // For external calendar sync
  sendReminder: Boolean,
  reminderSentAt: Date,

  outcome: String,
  followUpRequired: Boolean,
  followUpDate: Date,

  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId
}

// Indexes
db.appointments.createIndex({ officeId: 1, appointmentNumber: 1 }, { unique: true })
db.appointments.createIndex({ officeId: 1, scheduledTime: 1 })
db.appointments.createIndex({ officeId: 1, assignedTo: 1, scheduledTime: 1 })
db.appointments.createIndex({ officeId: 1, partyId: 1, appointmentWith: 1 })
```

### 1.9 Lead Model Updates

Add these fields to the existing Lead model:

```javascript
// Additional fields for leads collection
{
  // ... existing fields ...

  // NEW: Case linkage
  cases: [ObjectId],                    // Array of Case IDs
  activeCaseId: ObjectId,               // Current active case

  // NEW: Additional fields from ERPNext
  noOfEmployees: String,                // '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'
  annualRevenue: Number,
  marketSegmentId: ObjectId,
  industryId: ObjectId,

  // NEW: Qualification tracking
  qualificationStatus: String,          // 'unqualified' | 'in_process' | 'qualified'
  qualifiedBy: ObjectId,                // User ID
  qualifiedOn: Date,

  // NEW: UTM tracking
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmContent: String,

  // NEW: First response tracking
  firstResponseTime: Number,            // Duration in seconds
  firstResponseAt: Date,

  // NEW: Territory & Sales Person
  territoryId: ObjectId,
  salesPersonId: ObjectId
}

// New Indexes
db.leads.createIndex({ officeId: 1, utmCampaign: 1 })
db.leads.createIndex({ officeId: 1, territoryId: 1 })
db.leads.createIndex({ officeId: 1, salesPersonId: 1 })
db.leads.createIndex({ officeId: 1, firstResponseTime: 1 })
```

### 1.10 Case Model Updates

Add these fields to the existing Case model:

```javascript
// Additional fields for cases collection
{
  // ... existing fields ...

  // NEW: Lead linkage
  leadId: ObjectId,                     // Source lead

  // NEW: CRM Pipeline
  crmStatus: String,                    // 'intake' | 'conflict_check' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'dormant'
  crmPipelineStageId: ObjectId,         // SalesStage ID
  probability: Number,                  // 0-100
  expectedCloseDate: Date,

  // NEW: BANT (moved from Lead)
  qualification: {
    budget: String,                     // 'unknown' | 'low' | 'medium' | 'high' | 'premium'
    authority: String,                  // 'unknown' | 'decision_maker' | 'influencer' | 'researcher'
    need: String,                       // 'unknown' | 'urgent' | 'planning' | 'exploring'
    timeline: String,                   // 'unknown' | 'immediate' | 'this_month' | 'this_quarter' | 'this_year'
    score: Number
  },

  // NEW: Conflict check (per case)
  conflictCheckStatus: String,          // 'not_checked' | 'pending' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflictCheckNotes: String,
  conflictCheckDate: Date,
  conflictCheckBy: ObjectId,
  opposingParties: [String],

  // NEW: Lost tracking
  lostReason: String,
  lostReasonId: ObjectId,               // LostReason ID
  lostReasonDetails: String,
  competitorId: ObjectId,
  lostDate: Date,
  stageWhenLost: String,

  // NEW: Quote linkage
  quoteIds: [ObjectId],
  acceptedQuoteId: ObjectId,

  // NEW: Sales tracking
  salesPersonId: ObjectId,
  territoryId: ObjectId,

  // NEW: First response
  firstResponseTime: Number,
  firstResponseAt: Date
}

// New Indexes
db.cases.createIndex({ officeId: 1, leadId: 1 })
db.cases.createIndex({ officeId: 1, crmStatus: 1 })
db.cases.createIndex({ officeId: 1, crmPipelineStageId: 1 })
db.cases.createIndex({ officeId: 1, salesPersonId: 1 })
db.cases.createIndex({ officeId: 1, lostReasonId: 1 })
```

### 1.11 Client Model Updates

Add these fields to the existing Client model:

```javascript
// Additional fields for clients collection
{
  // ... existing fields ...

  // NEW: Conversion tracking
  convertedFromLeadId: ObjectId,
  convertedFromCaseId: ObjectId,
  convertedAt: Date,

  // NEW: Case tracking
  activeCaseIds: [ObjectId],
  closedCaseIds: [ObjectId],

  // NEW: Financial summary (cached)
  totalBilled: Number,
  totalPaid: Number,
  outstandingBalance: Number,

  // NEW: Territory & Sales Person
  territoryId: ObjectId,
  salesPersonId: ObjectId
}
```

---

## 2. API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **CRM Settings** | | |
| GET | `/api/settings/crm` | Get CRM settings |
| PUT | `/api/settings/crm` | Update CRM settings |
| **Territory** | | |
| GET | `/api/territories` | List territories |
| GET | `/api/territories/tree` | Get territory hierarchy |
| GET | `/api/territories/:id` | Get territory details |
| POST | `/api/territories` | Create territory |
| PUT | `/api/territories/:id` | Update territory |
| DELETE | `/api/territories/:id` | Delete territory |
| **Sales Person** | | |
| GET | `/api/sales-persons` | List sales persons |
| GET | `/api/sales-persons/tree` | Get hierarchy |
| GET | `/api/sales-persons/:id` | Get details |
| GET | `/api/sales-persons/:id/stats` | Get performance stats |
| POST | `/api/sales-persons` | Create sales person |
| PUT | `/api/sales-persons/:id` | Update sales person |
| DELETE | `/api/sales-persons/:id` | Delete sales person |
| **Lead Source** | | |
| GET | `/api/lead-sources` | List lead sources |
| POST | `/api/lead-sources` | Create lead source |
| PUT | `/api/lead-sources/:id` | Update lead source |
| DELETE | `/api/lead-sources/:id` | Delete lead source |
| **Sales Stage** | | |
| GET | `/api/sales-stages` | List sales stages |
| POST | `/api/sales-stages` | Create sales stage |
| PUT | `/api/sales-stages/:id` | Update sales stage |
| DELETE | `/api/sales-stages/:id` | Delete sales stage |
| PUT | `/api/sales-stages/reorder` | Reorder stages |
| **Lost Reason** | | |
| GET | `/api/lost-reasons` | List lost reasons |
| POST | `/api/lost-reasons` | Create lost reason |
| PUT | `/api/lost-reasons/:id` | Update lost reason |
| DELETE | `/api/lost-reasons/:id` | Delete lost reason |
| **Competitor** | | |
| GET | `/api/competitors` | List competitors |
| POST | `/api/competitors` | Create competitor |
| PUT | `/api/competitors/:id` | Update competitor |
| DELETE | `/api/competitors/:id` | Delete competitor |
| **Appointment** | | |
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/:id` | Get appointment |
| GET | `/api/appointments/slots` | Get available slots |
| POST | `/api/appointments` | Create appointment |
| POST | `/api/appointments/book` | Public booking |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |
| **Reports** | | |
| GET | `/api/reports/crm/campaign-efficiency` | Campaign report |
| GET | `/api/reports/crm/lead-owner-efficiency` | Lead owner report |
| GET | `/api/reports/crm/first-response-time` | Response time report |
| GET | `/api/reports/crm/lost-opportunity` | Lost opportunity report |
| GET | `/api/reports/crm/sales-pipeline` | Pipeline report |
| GET | `/api/reports/crm/prospects-engaged` | Prospects report |
| GET | `/api/reports/crm/lead-conversion-time` | Conversion time report |
| **Conversions** | | |
| POST | `/api/leads/:id/create-case` | Create case from lead |
| GET | `/api/leads/:id/cases` | Get lead's cases |
| PUT | `/api/cases/:id/crm-stage` | Update CRM stage |
| PUT | `/api/cases/:id/mark-won` | Mark as won |
| PUT | `/api/cases/:id/mark-lost` | Mark as lost |
| GET | `/api/cases/:id/quotes` | Get case quotes |

---

## 3. CRM Settings API

### GET /api/settings/crm

Returns CRM settings for the current office.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "officeId": "...",
    "leadSettings": { ... },
    "caseSettings": { ... },
    "quoteSettings": { ... },
    "communicationSettings": { ... },
    "appointmentSettings": { ... },
    "namingSettings": { ... },
    "territorySettings": { ... },
    "salesPersonSettings": { ... },
    "conversionSettings": { ... }
  }
}
```

**Implementation Notes:**
- If no settings exist, create with defaults
- Always return complete settings object

### PUT /api/settings/crm

Updates CRM settings (partial update supported).

**Request Body:**
```json
{
  "leadSettings": {
    "allowDuplicateEmails": true
  }
}
```

**Implementation Notes:**
- Use $set with dot notation for nested updates
- Validate all enum values
- Emit event for settings change (for caching)

---

## 4. Territory API

### GET /api/territories

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| enabled | boolean | Filter by enabled status |
| parentId | string | Filter by parent |
| isGroup | boolean | Filter groups only |
| search | string | Search by name |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "territories": [...],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/territories/tree

Returns territories in hierarchical structure.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Saudi Arabia",
      "nameAr": "المملكة العربية السعودية",
      "isGroup": true,
      "level": 0,
      "children": [
        {
          "_id": "...",
          "name": "Riyadh Region",
          "nameAr": "منطقة الرياض",
          "isGroup": true,
          "level": 1,
          "children": [...]
        }
      ]
    }
  ]
}
```

**Implementation:**
```javascript
async function getTerritoryTree(officeId) {
  const territories = await Territory.find({ officeId, enabled: true })
    .sort({ level: 1, name: 1 })
    .lean();

  // Build tree structure
  const map = {};
  const roots = [];

  territories.forEach(t => {
    map[t._id] = { ...t, children: [] };
  });

  territories.forEach(t => {
    if (t.parentTerritoryId && map[t.parentTerritoryId]) {
      map[t.parentTerritoryId].children.push(map[t._id]);
    } else {
      roots.push(map[t._id]);
    }
  });

  return roots;
}
```

### POST /api/territories

**Request Body:**
```json
{
  "name": "North Riyadh",
  "nameAr": "شمال الرياض",
  "parentTerritoryId": "...",
  "isGroup": false,
  "managerId": "..."
}
```

**Implementation Notes:**
- Auto-generate slug from name
- Calculate level from parent
- Build path from parent path
- Validate parent exists if provided

---

## 5. Sales Person API

### GET /api/sales-persons/:id/stats

Returns performance statistics for a sales person.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Period start |
| endDate | date | Period end |

**Response:**
```json
{
  "success": true,
  "data": {
    "salesPersonId": "...",
    "period": { "start": "...", "end": "..." },
    "leads": {
      "total": 50,
      "converted": 25,
      "conversionRate": 50
    },
    "cases": {
      "total": 25,
      "won": 15,
      "lost": 5,
      "open": 5,
      "winRate": 75,
      "totalValue": 500000,
      "wonValue": 350000
    },
    "targets": {
      "amount": { "target": 500000, "achieved": 350000, "percentage": 70 },
      "leads": { "target": 60, "achieved": 50, "percentage": 83 },
      "cases": { "target": 20, "achieved": 15, "percentage": 75 }
    },
    "avgResponseTime": 3600,
    "avgDealSize": 23333
  }
}
```

**Implementation:**
```javascript
async function getSalesPersonStats(salesPersonId, startDate, endDate) {
  const [leadStats, caseStats] = await Promise.all([
    Lead.aggregate([
      { $match: {
        salesPersonId: ObjectId(salesPersonId),
        createdAt: { $gte: startDate, $lte: endDate }
      }},
      { $group: {
        _id: null,
        total: { $sum: 1 },
        converted: { $sum: { $cond: [{ $ne: ['$cases', []] }, 1, 0] } },
        avgResponseTime: { $avg: '$firstResponseTime' }
      }}
    ]),
    Case.aggregate([
      { $match: {
        salesPersonId: ObjectId(salesPersonId),
        createdAt: { $gte: startDate, $lte: endDate }
      }},
      { $group: {
        _id: '$crmStatus',
        count: { $sum: 1 },
        value: { $sum: '$estimatedValue' }
      }}
    ])
  ]);

  // ... calculate and return stats
}
```

---

## 6. Lead Source API

Standard CRUD operations.

### GET /api/lead-sources

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| enabled | boolean | Filter by status |
| search | string | Search by name |

### POST /api/lead-sources

**Validation Rules:**
- name: required, unique per office
- nameAr: required
- utmSource: optional, alphanumeric

---

## 7. Sales Stage API

### PUT /api/sales-stages/reorder

Reorders all stages.

**Request Body:**
```json
{
  "stages": [
    { "_id": "...", "order": 1 },
    { "_id": "...", "order": 2 },
    { "_id": "...", "order": 3 }
  ]
}
```

**Implementation:**
```javascript
async function reorderStages(officeId, stages) {
  const bulkOps = stages.map(({ _id, order }) => ({
    updateOne: {
      filter: { _id: ObjectId(_id), officeId },
      update: { $set: { order, updatedAt: new Date() } }
    }
  }));

  await SalesStage.bulkWrite(bulkOps);
}
```

---

## 8. Lost Reason API

Standard CRUD with category validation.

**Valid Categories:**
- `price`
- `competitor`
- `timing`
- `scope`
- `relationship`
- `internal`
- `other`

---

## 9. Competitor API

### GET /api/competitors

Include win/loss stats.

**Implementation:**
```javascript
async function getCompetitorsWithStats(officeId) {
  return Competitor.aggregate([
    { $match: { officeId } },
    { $lookup: {
      from: 'cases',
      let: { competitorId: '$_id' },
      pipeline: [
        { $match: {
          $expr: { $eq: ['$competitorId', '$$competitorId'] }
        }},
        { $group: {
          _id: '$crmStatus',
          count: { $sum: 1 }
        }}
      ],
      as: 'caseStats'
    }},
    { $addFields: {
      casesLostTo: {
        $reduce: {
          input: { $filter: { input: '$caseStats', cond: { $eq: ['$$this._id', 'lost'] }}},
          initialValue: 0,
          in: { $add: ['$$value', '$$this.count'] }
        }
      }
    }}
  ]);
}
```

---

## 10. Appointment API

### GET /api/appointments/slots

Returns available booking slots.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| date | date | Date to check |
| assignedTo | string | User/Sales Person ID |
| duration | number | Slot duration in minutes |

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "slots": [
      { "start": "09:00", "end": "09:30", "available": true },
      { "start": "09:30", "end": "10:00", "available": false },
      { "start": "10:00", "end": "10:30", "available": true }
    ]
  }
}
```

**Implementation:**
```javascript
async function getAvailableSlots(officeId, date, assignedTo, duration) {
  // 1. Get CRM settings for working hours
  const settings = await CRMSettings.findOne({ officeId });
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const workingHours = settings.appointmentSettings.workingHours[dayOfWeek];

  if (!workingHours.enabled) {
    return { date, slots: [] };
  }

  // 2. Get existing appointments for the day
  const dayStart = new Date(date.setHours(0, 0, 0, 0));
  const dayEnd = new Date(date.setHours(23, 59, 59, 999));

  const appointments = await Appointment.find({
    officeId,
    assignedTo,
    scheduledTime: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ['scheduled', 'confirmed'] }
  });

  // 3. Generate slots
  const slots = [];
  const buffer = settings.appointmentSettings.bufferBetweenAppointments;
  let currentTime = parseTime(workingHours.start);
  const endTime = parseTime(workingHours.end);

  while (currentTime + duration <= endTime) {
    const slotStart = currentTime;
    const slotEnd = currentTime + duration;

    // Check if slot conflicts with existing appointments
    const available = !appointments.some(apt =>
      hasOverlap(slotStart, slotEnd, apt.scheduledTime, apt.endTime)
    );

    slots.push({
      start: formatTime(slotStart),
      end: formatTime(slotEnd),
      available
    });

    currentTime += duration + buffer;
  }

  return { date: date.toISOString().split('T')[0], slots };
}
```

### POST /api/appointments/book

Public booking endpoint (no auth required).

**Request Body:**
```json
{
  "customerName": "Ahmed Al-Rashid",
  "customerEmail": "ahmed@example.com",
  "customerPhone": "+966501234567",
  "scheduledTime": "2024-01-15T10:00:00Z",
  "duration": 30,
  "notes": "Initial consultation about commercial dispute"
}
```

**Implementation Notes:**
- Validate slot is available
- Check phone verification if required
- Send confirmation email
- Create calendar event if integration enabled

---

## 11. CRM Reports API

### GET /api/reports/crm/campaign-efficiency

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Required |
| endDate | date | Required |
| campaign | string | Filter by campaign |
| source | string | Filter by UTM source |
| medium | string | Filter by UTM medium |
| salesPersonId | string | Filter by sales person |

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "campaign": "google-ads-jan-2024",
        "source": "google",
        "medium": "cpc",
        "leadCount": 100,
        "caseCount": 40,
        "quoteCount": 25,
        "wonCount": 15,
        "wonValue": 500000,
        "cost": 50000,
        "roi": 900,
        "leadToCaseRate": 40,
        "caseToQuoteRate": 62.5,
        "quoteToWonRate": 60
      }
    ],
    "summary": {
      "totalLeads": 500,
      "totalCases": 200,
      "totalWon": 75,
      "totalWonValue": 2500000,
      "totalCost": 200000,
      "overallROI": 1150,
      "avgLeadToCaseRate": 40,
      "avgWinRate": 37.5
    }
  }
}
```

**Implementation:**
```javascript
async function getCampaignEfficiencyReport(officeId, filters) {
  const { startDate, endDate, campaign, source, medium, salesPersonId } = filters;

  const matchStage = {
    officeId,
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  if (campaign) matchStage.utmCampaign = campaign;
  if (source) matchStage.utmSource = source;
  if (medium) matchStage.utmMedium = medium;
  if (salesPersonId) matchStage.salesPersonId = ObjectId(salesPersonId);

  const leadData = await Lead.aggregate([
    { $match: matchStage },
    { $group: {
      _id: {
        campaign: '$utmCampaign',
        source: '$utmSource',
        medium: '$utmMedium'
      },
      leadCount: { $sum: 1 },
      leadIds: { $push: '$_id' }
    }}
  ]);

  // For each campaign, get case and won data
  const campaigns = await Promise.all(leadData.map(async (ld) => {
    const cases = await Case.find({
      leadId: { $in: ld.leadIds },
      officeId
    });

    const wonCases = cases.filter(c => c.crmStatus === 'won');
    const casesWithQuotes = cases.filter(c => c.quoteIds?.length > 0);

    return {
      campaign: ld._id.campaign || 'Direct',
      source: ld._id.source || 'Direct',
      medium: ld._id.medium || 'None',
      leadCount: ld.leadCount,
      caseCount: cases.length,
      quoteCount: casesWithQuotes.length,
      wonCount: wonCases.length,
      wonValue: wonCases.reduce((sum, c) => sum + (c.estimatedValue || 0), 0),
      leadToCaseRate: (cases.length / ld.leadCount * 100).toFixed(1),
      caseToQuoteRate: cases.length ? (casesWithQuotes.length / cases.length * 100).toFixed(1) : 0,
      quoteToWonRate: casesWithQuotes.length ? (wonCases.length / casesWithQuotes.length * 100).toFixed(1) : 0
    };
  }));

  return { campaigns, summary: calculateSummary(campaigns) };
}
```

### GET /api/reports/crm/lead-owner-efficiency

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Required |
| endDate | date | Required |
| salesPersonId | string | Filter by sales person |
| territoryId | string | Filter by territory |
| leadSourceId | string | Filter by lead source |

**Response:**
```json
{
  "success": true,
  "data": {
    "owners": [
      {
        "salesPersonId": "...",
        "salesPersonName": "Ahmed Al-Rashid",
        "salesPersonAvatar": "...",
        "leadCount": 50,
        "caseCount": 25,
        "quoteCount": 15,
        "wonCount": 10,
        "wonValue": 350000,
        "lostCount": 5,
        "lostValue": 150000,
        "conversionRate": 50,
        "winRate": 66.7,
        "avgDealSize": 35000,
        "targetAmount": 500000,
        "targetAchievement": 70,
        "rank": 1
      }
    ],
    "summary": { ... }
  }
}
```

### GET /api/reports/crm/first-response-time

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Required |
| endDate | date | Required |
| groupBy | string | 'day' \| 'week' \| 'month' |
| salesPersonId | string | Filter |
| leadSourceId | string | Filter |
| territoryId | string | Filter |

**Response:**
```json
{
  "success": true,
  "data": {
    "byPeriod": [
      {
        "date": "2024-01-15",
        "avgResponseTime": 3600,
        "medianResponseTime": 2400,
        "minResponseTime": 300,
        "maxResponseTime": 86400,
        "within1Hour": 45,
        "within24Hours": 85,
        "leadCount": 20
      }
    ],
    "bySalesPerson": [
      {
        "salesPersonId": "...",
        "salesPersonName": "Ahmed",
        "avgResponseTime": 2800,
        "leadsAssigned": 50,
        "leadsResponded": 48,
        "responseRate": 96
      }
    ],
    "distribution": [
      { "range": "0-15min", "count": 20, "percentage": 10 },
      { "range": "15-30min", "count": 35, "percentage": 17.5 },
      { "range": "30-60min", "count": 40, "percentage": 20 },
      { "range": "1-2h", "count": 30, "percentage": 15 },
      { "range": "2-4h", "count": 25, "percentage": 12.5 },
      { "range": "4-8h", "count": 20, "percentage": 10 },
      { "range": "8-24h", "count": 20, "percentage": 10 },
      { "range": ">24h", "count": 10, "percentage": 5 }
    ]
  }
}
```

**Implementation:**
```javascript
async function getFirstResponseTimeReport(officeId, filters) {
  const { startDate, endDate, groupBy, salesPersonId } = filters;

  const matchStage = {
    officeId,
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    firstResponseTime: { $exists: true, $ne: null }
  };

  if (salesPersonId) matchStage.salesPersonId = ObjectId(salesPersonId);

  const groupByField = getDateGroupField(groupBy); // $dayOfMonth, $week, or $month

  const byPeriod = await Lead.aggregate([
    { $match: matchStage },
    { $group: {
      _id: { [groupBy]: { [groupByField]: '$createdAt' }},
      avgResponseTime: { $avg: '$firstResponseTime' },
      leadCount: { $sum: 1 },
      responseTimes: { $push: '$firstResponseTime' },
      within1Hour: {
        $sum: { $cond: [{ $lte: ['$firstResponseTime', 3600] }, 1, 0] }
      },
      within24Hours: {
        $sum: { $cond: [{ $lte: ['$firstResponseTime', 86400] }, 1, 0] }
      }
    }},
    { $project: {
      date: '$_id',
      avgResponseTime: 1,
      leadCount: 1,
      medianResponseTime: { $arrayElemAt: ['$responseTimes', { $floor: { $divide: [{ $size: '$responseTimes' }, 2] }}]},
      minResponseTime: { $min: '$responseTimes' },
      maxResponseTime: { $max: '$responseTimes' },
      within1Hour: { $multiply: [{ $divide: ['$within1Hour', '$leadCount'] }, 100] },
      within24Hours: { $multiply: [{ $divide: ['$within24Hours', '$leadCount'] }, 100] }
    }},
    { $sort: { date: 1 }}
  ]);

  // Get distribution data
  const distribution = await Lead.aggregate([
    { $match: matchStage },
    { $bucket: {
      groupBy: '$firstResponseTime',
      boundaries: [0, 900, 1800, 3600, 7200, 14400, 28800, 86400, Infinity],
      default: 'other',
      output: { count: { $sum: 1 } }
    }}
  ]);

  return { byPeriod, distribution: formatDistribution(distribution) };
}
```

### GET /api/reports/crm/lost-opportunity

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Required |
| endDate | date | Required |
| lostReasonId | string | Filter |
| competitorId | string | Filter |
| salesPersonId | string | Filter |
| caseTypeId | string | Filter |

**Response:**
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "caseId": "...",
        "caseNumber": "CASE-2024-00123",
        "leadName": "Ahmed Al-Rashid",
        "caseType": "Commercial",
        "lostReason": "Price too high",
        "lostReasonCategory": "price",
        "lostReasonDetails": "Client found cheaper option",
        "competitor": "Al-Saud Law Firm",
        "stageWhenLost": "Proposal Sent",
        "estimatedValue": 50000,
        "daysInPipeline": 15,
        "salesPerson": "Mohammed",
        "lostDate": "2024-01-15"
      }
    ],
    "summary": {
      "totalLost": 25,
      "totalValueLost": 1250000,
      "topLostReason": "Price too high",
      "topCompetitor": "Al-Saud Law Firm",
      "avgDaysToLoss": 18
    },
    "byReason": [
      { "reason": "Price too high", "count": 10, "value": 500000 },
      { "reason": "Competitor", "count": 8, "value": 400000 }
    ],
    "byStage": [
      { "stage": "Proposal Sent", "count": 12, "value": 600000 },
      { "stage": "Negotiation", "count": 8, "value": 400000 }
    ]
  }
}
```

### GET /api/reports/crm/sales-pipeline

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Required |
| endDate | date | Required |
| viewBy | string | 'stage' \| 'owner' \| 'period' |
| salesPersonId | string | Filter |
| territoryId | string | Filter |
| caseTypeId | string | Filter |
| periodType | string | 'month' \| 'quarter' (for period view) |

**Response (viewBy: 'stage'):**
```json
{
  "success": true,
  "data": {
    "byStage": [
      {
        "stageId": "...",
        "stageName": "Intake",
        "stageColor": "#6B7280",
        "count": 20,
        "value": 400000,
        "weightedValue": 40000,
        "probability": 10,
        "avgAge": 5,
        "stuckCount": 3
      }
    ],
    "summary": {
      "totalCount": 100,
      "totalValue": 5000000,
      "weightedValue": 2500000,
      "avgWinRate": 35,
      "avgCycleTime": 25
    }
  }
}
```

### GET /api/reports/crm/prospects-engaged

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| daysSinceContact | number | Min days (default: 60) |
| minInteractions | number | Min interactions (default: 2) |
| leadSourceId | string | Filter |
| salesPersonId | string | Filter |
| page | number | Pagination |
| limit | number | Pagination |

**Response:**
```json
{
  "success": true,
  "data": {
    "prospects": [
      {
        "leadId": "...",
        "leadName": "Ahmed Al-Rashid",
        "company": "Al-Rashid Corp",
        "email": "ahmed@rashid.com",
        "phone": "+966501234567",
        "leadSource": "Website",
        "lastActivityType": "email",
        "lastActivityDate": "2024-01-01",
        "daysSinceContact": 75,
        "totalInteractions": 5,
        "leadScore": 65,
        "assignedTo": "Mohammed",
        "status": "contacted"
      }
    ],
    "summary": {
      "totalProspects": 45,
      "highValueProspects": 15,
      "needsFollowUp": 30,
      "avgInteractions": 4
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

### GET /api/reports/crm/lead-conversion-time

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Required |
| endDate | date | Required |
| caseTypeId | string | Filter |
| salesPersonId | string | Filter |
| territoryId | string | Filter |

**Response:**
```json
{
  "success": true,
  "data": {
    "conversions": [
      {
        "clientId": "...",
        "clientName": "Ahmed Al-Rashid",
        "originalLeadId": "...",
        "leadCreatedAt": "2024-01-01",
        "caseCreatedAt": "2024-01-10",
        "wonDate": "2024-01-25",
        "daysLeadToCase": 9,
        "daysCaseToWon": 15,
        "totalDays": 24,
        "interactions": 8,
        "caseType": "Commercial",
        "wonValue": 50000,
        "salesPerson": "Mohammed",
        "territory": "Riyadh"
      }
    ],
    "summary": {
      "avgLeadToCaseDays": 8,
      "avgCaseToWonDays": 18,
      "avgTotalDays": 26,
      "fastestConversion": 5,
      "slowestConversion": 60,
      "totalConversions": 50,
      "totalValue": 2500000
    },
    "distribution": [
      { "range": "0-30 days", "count": 20, "percentage": 40 },
      { "range": "31-60 days", "count": 15, "percentage": 30 },
      { "range": "61-90 days", "count": 10, "percentage": 20 },
      { "range": ">90 days", "count": 5, "percentage": 10 }
    ]
  }
}
```

---

## 12. Lead & Case Updates

### POST /api/leads/:id/create-case

Creates a case from a lead.

**Request Body:**
```json
{
  "title": "Commercial Dispute - Al-Rashid vs Al-Saud",
  "caseType": "commercial",
  "description": "Dispute over contract breach",
  "estimatedValue": 100000,
  "salesStageId": "...",
  "copyNotes": true,
  "copyDocuments": true
}
```

**Implementation:**
```javascript
async function createCaseFromLead(leadId, data, userId) {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new NotFoundError('Lead not found');

  const settings = await CRMSettings.findOne({ officeId: lead.officeId });

  // Create case
  const caseData = {
    officeId: lead.officeId,
    leadId: lead._id,
    title: data.title,
    type: data.caseType,
    description: data.description,
    estimatedValue: data.estimatedValue,

    // CRM fields
    crmStatus: 'intake',
    crmPipelineStageId: data.salesStageId || settings.caseSettings.defaultSalesStage,
    probability: 10,

    // Copy from lead
    salesPersonId: lead.salesPersonId,
    territoryId: lead.territoryId,

    // Copy qualification from lead if exists
    qualification: lead.bant,
    conflictCheckStatus: 'not_checked',

    createdBy: userId
  };

  // Copy contact info
  if (lead.leadType === 'individual') {
    caseData.clientName = `${lead.firstName} ${lead.lastName}`;
    caseData.clientEmail = lead.email;
    caseData.clientPhone = lead.phone;
  } else {
    caseData.companyName = lead.companyName;
  }

  const newCase = await Case.create(caseData);

  // Update lead with case reference
  await Lead.findByIdAndUpdate(leadId, {
    $push: { cases: newCase._id },
    $set: {
      activeCaseId: newCase._id,
      status: 'converted'
    }
  });

  // Copy notes if requested
  if (data.copyNotes && settings.conversionSettings.copyNotesToCase) {
    const notes = await Note.find({ leadId: lead._id });
    const caseNotes = notes.map(n => ({
      ...n.toObject(),
      _id: undefined,
      leadId: undefined,
      caseId: newCase._id
    }));
    await Note.insertMany(caseNotes);
  }

  // Copy documents if requested
  if (data.copyDocuments && settings.conversionSettings.copyDocuments) {
    // Similar logic for documents
  }

  return newCase;
}
```

### PUT /api/cases/:id/crm-stage

Updates the CRM pipeline stage.

**Request Body:**
```json
{
  "stageId": "...",
  "probability": 60,
  "expectedCloseDate": "2024-02-15"
}
```

**Implementation Notes:**
- Validate stage transition is allowed
- Auto-trigger actions based on stage (conflict check, qualification check)
- Update probability from stage default if not provided
- Log stage change in activity

### PUT /api/cases/:id/mark-won

Marks a case as won and optionally creates a client.

**Request Body:**
```json
{
  "wonValue": 50000,
  "acceptedQuoteId": "...",
  "createClient": true,
  "notes": "Engagement letter signed"
}
```

**Implementation:**
```javascript
async function markCaseAsWon(caseId, data, userId) {
  const caseDoc = await Case.findById(caseId).populate('leadId');
  if (!caseDoc) throw new NotFoundError('Case not found');

  const settings = await CRMSettings.findOne({ officeId: caseDoc.officeId });

  // Update case
  caseDoc.crmStatus = 'won';
  caseDoc.probability = 100;
  caseDoc.wonDate = new Date();
  caseDoc.estimatedValue = data.wonValue || caseDoc.estimatedValue;
  if (data.acceptedQuoteId) {
    caseDoc.acceptedQuoteId = data.acceptedQuoteId;
  }
  await caseDoc.save();

  // Create client if requested
  let client = null;
  if (data.createClient) {
    const lead = caseDoc.leadId;

    client = await Client.create({
      officeId: caseDoc.officeId,

      // Personal info from lead
      clientType: lead.leadType,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,

      // Saudi-specific from lead
      nationalId: lead.nationalId,
      iqamaNumber: lead.iqamaNumber,
      crNumber: lead.crNumber,
      nationalAddress: lead.nationalAddress,

      // Conversion tracking
      convertedFromLeadId: lead._id,
      convertedFromCaseId: caseDoc._id,
      convertedAt: new Date(),

      // Sales tracking
      salesPersonId: caseDoc.salesPersonId,
      territoryId: caseDoc.territoryId,

      // Link cases
      activeCaseIds: [caseDoc._id],

      createdBy: userId
    });

    // Update case with client reference
    caseDoc.clientId = client._id;
    await caseDoc.save();
  }

  // Update sales person targets if tracking enabled
  if (settings.salesPersonSettings.targetTrackingEnabled && caseDoc.salesPersonId) {
    await updateSalesPersonAchievements(caseDoc.salesPersonId, {
      addWonCase: true,
      addWonValue: data.wonValue || caseDoc.estimatedValue
    });
  }

  // Update territory targets
  if (settings.territorySettings.enabled && caseDoc.territoryId) {
    await updateTerritoryAchievements(caseDoc.territoryId, {
      addAchievedAmount: data.wonValue || caseDoc.estimatedValue
    });
  }

  // Update competitor stats if exists
  if (caseDoc.competitorId) {
    await Competitor.findByIdAndUpdate(caseDoc.competitorId, {
      $inc: { casesWonAgainst: 1 }
    });
  }

  return { case: caseDoc, client };
}
```

### PUT /api/cases/:id/mark-lost

Marks a case as lost.

**Request Body:**
```json
{
  "lostReasonId": "...",
  "lostReasonDetails": "Client chose cheaper competitor",
  "competitorId": "..."
}
```

**Implementation:**
```javascript
async function markCaseAsLost(caseId, data, userId) {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new NotFoundError('Case not found');

  // Get the current stage for tracking
  const currentStage = await SalesStage.findById(caseDoc.crmPipelineStageId);

  // Update case
  caseDoc.crmStatus = 'lost';
  caseDoc.probability = 0;
  caseDoc.lostDate = new Date();
  caseDoc.lostReasonId = data.lostReasonId;
  caseDoc.lostReasonDetails = data.lostReasonDetails;
  caseDoc.competitorId = data.competitorId;
  caseDoc.stageWhenLost = currentStage?.name;

  await caseDoc.save();

  // Update competitor stats if provided
  if (data.competitorId) {
    await Competitor.findByIdAndUpdate(data.competitorId, {
      $inc: { casesLostTo: 1 }
    });
  }

  return caseDoc;
}
```

---

## 13. Conversion APIs

### Auto-Create Sales Order

When a quote is accepted, optionally create a sales order.

```javascript
async function onQuoteAccepted(quoteId) {
  const quote = await Quote.findById(quoteId);
  const settings = await CRMSettings.findOne({ officeId: quote.officeId });

  if (settings.conversionSettings.autoCreateSalesOrderOnAccept) {
    // Create sales order in finance module
    const salesOrder = await createSalesOrder({
      quoteId: quote._id,
      caseId: quote.caseId,
      clientId: quote.clientId,
      items: quote.items,
      total: quote.total,
      // ... other fields
    });

    // Link to case
    await Case.findByIdAndUpdate(quote.caseId, {
      $set: { acceptedQuoteId: quote._id },
      $push: { salesOrderIds: salesOrder._id }
    });

    // If configured to auto-create client
    if (settings.conversionSettings.autoCreateClientOnSalesOrder) {
      await markCaseAsWon(quote.caseId, {
        wonValue: quote.total,
        acceptedQuoteId: quote._id,
        createClient: true
      });
    }
  }
}
```

---

## 14. Validation Rules

### Lead Source Validation
```javascript
const leadSourceSchema = Joi.object({
  name: Joi.string().required().max(100),
  nameAr: Joi.string().required().max(100),
  description: Joi.string().max(500),
  utmSource: Joi.string().alphanum().max(50),
  utmMedium: Joi.string().alphanum().max(50),
  enabled: Joi.boolean()
});
```

### Sales Stage Validation
```javascript
const salesStageSchema = Joi.object({
  name: Joi.string().required().max(100),
  nameAr: Joi.string().required().max(100),
  order: Joi.number().integer().min(1).required(),
  defaultProbability: Joi.number().min(0).max(100).required(),
  type: Joi.string().valid('open', 'won', 'lost').required(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
  requiresConflictCheck: Joi.boolean(),
  requiresQualification: Joi.boolean(),
  autoCreateQuote: Joi.boolean()
});
```

### Appointment Validation
```javascript
const appointmentSchema = Joi.object({
  scheduledTime: Joi.date().iso().greater('now').required(),
  duration: Joi.number().valid(15, 30, 45, 60).required(),
  customerName: Joi.string().required().max(200),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.string().pattern(/^\+?[0-9]{10,15}$/),
  customerNotes: Joi.string().max(1000),
  appointmentWith: Joi.string().valid('lead', 'client', 'contact').required(),
  partyId: Joi.string().hex().length(24).required(),
  caseId: Joi.string().hex().length(24),
  assignedTo: Joi.string().hex().length(24).required(),
  locationType: Joi.string().valid('office', 'virtual', 'client_site', 'other'),
  location: Joi.string().max(500),
  meetingLink: Joi.string().uri()
});
```

---

## 15. Indexes & Performance

### Required Indexes

```javascript
// CRM Settings - One per office
db.crm_settings.createIndex({ officeId: 1 }, { unique: true });

// Territories
db.territories.createIndex({ officeId: 1, slug: 1 }, { unique: true });
db.territories.createIndex({ officeId: 1, parentTerritoryId: 1 });
db.territories.createIndex({ officeId: 1, enabled: 1, level: 1 });

// Sales Persons
db.sales_persons.createIndex({ officeId: 1, userId: 1 });
db.sales_persons.createIndex({ officeId: 1, enabled: 1, parentSalesPersonId: 1 });
db.sales_persons.createIndex({ officeId: 1, territoryIds: 1 });

// Lead Sources
db.lead_sources.createIndex({ officeId: 1, slug: 1 }, { unique: true });
db.lead_sources.createIndex({ officeId: 1, enabled: 1 });

// Sales Stages
db.sales_stages.createIndex({ officeId: 1, order: 1 });
db.sales_stages.createIndex({ officeId: 1, type: 1 });

// Lost Reasons
db.lost_reasons.createIndex({ officeId: 1, category: 1 });

// Competitors
db.competitors.createIndex({ officeId: 1, enabled: 1 });

// Appointments
db.appointments.createIndex({ officeId: 1, appointmentNumber: 1 }, { unique: true });
db.appointments.createIndex({ officeId: 1, scheduledTime: 1, status: 1 });
db.appointments.createIndex({ officeId: 1, assignedTo: 1, scheduledTime: 1 });
db.appointments.createIndex({ officeId: 1, partyId: 1, appointmentWith: 1 });

// Leads - New indexes for CRM
db.leads.createIndex({ officeId: 1, utmCampaign: 1, utmSource: 1 });
db.leads.createIndex({ officeId: 1, territoryId: 1 });
db.leads.createIndex({ officeId: 1, salesPersonId: 1 });
db.leads.createIndex({ officeId: 1, firstResponseTime: 1 });
db.leads.createIndex({ officeId: 1, qualificationStatus: 1 });

// Cases - New indexes for CRM
db.cases.createIndex({ officeId: 1, leadId: 1 });
db.cases.createIndex({ officeId: 1, crmStatus: 1 });
db.cases.createIndex({ officeId: 1, crmPipelineStageId: 1 });
db.cases.createIndex({ officeId: 1, salesPersonId: 1 });
db.cases.createIndex({ officeId: 1, lostReasonId: 1 });
db.cases.createIndex({ officeId: 1, competitorId: 1 });
db.cases.createIndex({ officeId: 1, lostDate: 1 });
```

### Caching Strategy

```javascript
// Cache CRM settings per office (5 minute TTL)
const CACHE_KEYS = {
  CRM_SETTINGS: (officeId) => `crm:settings:${officeId}`,
  SALES_STAGES: (officeId) => `crm:stages:${officeId}`,
  LEAD_SOURCES: (officeId) => `crm:sources:${officeId}`,
  TERRITORY_TREE: (officeId) => `crm:territories:tree:${officeId}`,
  SALES_PERSON_TREE: (officeId) => `crm:sales-persons:tree:${officeId}`
};

// Invalidate cache on updates
async function updateCRMSettings(officeId, updates) {
  const settings = await CRMSettings.findOneAndUpdate(
    { officeId },
    { $set: updates },
    { new: true }
  );
  await cache.del(CACHE_KEYS.CRM_SETTINGS(officeId));
  return settings;
}
```

---

## Summary

This guide covers all backend requirements for the CRM Enhancement:

| Component | Collections | Endpoints | Estimated Effort |
|-----------|-------------|-----------|------------------|
| CRM Settings | 1 | 2 | 1 day |
| Territories | 1 | 6 | 2 days |
| Sales Persons | 1 | 7 | 2 days |
| Lead Sources | 1 | 4 | 0.5 day |
| Sales Stages | 1 | 5 | 0.5 day |
| Lost Reasons | 1 | 4 | 0.5 day |
| Competitors | 1 | 4 | 0.5 day |
| Appointments | 1 | 7 | 2 days |
| Reports | 0 | 7 | 3 days |
| Lead/Case Updates | 0 | 6 | 2 days |
| **Total** | **8** | **52** | **14 days** |

**Priority Order:**
1. CRM Settings (foundation for all features)
2. Lead Sources & Sales Stages (required for wizard)
3. Lead/Case model updates & conversion APIs
4. Territories & Sales Persons
5. Reports (can be done in parallel)
6. Appointments (independent feature)
7. Lost Reasons & Competitors
