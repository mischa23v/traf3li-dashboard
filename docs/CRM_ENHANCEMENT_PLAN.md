# CRM Enhancement Plan - ERPNext Feature Parity

## Executive Summary

This plan outlines the comprehensive enhancement of the Traf3li CRM module to achieve feature parity with ERPNext while maintaining the law firm-specific functionality that makes our system unique.

---

## Current State Analysis

### What We Have (Strong Foundation)

| Component | Status | Notes |
|-----------|--------|-------|
| **Lead Model** | ✅ Comprehensive | 100+ fields, Saudi-specific (NAJIZ, National Address) |
| **Case Model** | ✅ Full-featured | All case types, parties, hearings, documents, pipeline |
| **Quote Service** | ✅ Implemented | Full lifecycle, convert to invoice |
| **Retainer Service** | ✅ Implemented | Engagement fees, transactions |
| **Legal Documents** | ✅ Implemented | Templates, contracts, agreements |
| **Finance Module** | ✅ Complete | Full accounting, invoicing, payments |
| **Finance Setup Wizard** | ✅ Pattern exists | Can replicate for CRM |

### What's Missing (ERPNext Features)

| Component | Priority | Status |
|-----------|----------|--------|
| Lead → Case Link | HIGH | ❌ Missing |
| CRM Settings Page | HIGH | ❌ Missing |
| CRM Setup Wizard | HIGH | ❌ Missing |
| CRM Reports (6 types) | HIGH | ❌ Missing |
| Territory Management | MEDIUM | ❌ Missing |
| Sales Person Hierarchy | MEDIUM | ❌ Missing |
| Appointment Booking | MEDIUM | ❌ Missing |
| Contract Fulfillment | MEDIUM | ❌ Missing |

---

## New CRM Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LEAD PIPELINE                                   │
├──────────┬────────────┬─────────────────┬──────────────────┬───────────────┤
│   New    │  Contacted │  Consultation   │  Consultation    │  Converted/   │
│          │            │  Scheduled      │  Done            │  Disqualified │
└────┬─────┴──────┬─────┴───────┬─────────┴────────┬─────────┴───────┬───────┘
     │            │             │                  │                 │
     │            │             │                  ▼                 │
     │            │             │         ┌───────────────┐          │
     │            │             └────────►│  CREATE CASE  │          │
     │            │                       └───────┬───────┘          │
     │            │                               │                  │
     ▼            ▼                               ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CASE PIPELINE                                   │
├──────────┬────────────┬───────────┬────────────┬────────────┬──────────────┤
│  Intake  │  Conflict  │ Qualified │  Proposal  │ Negotiation│   Won/Lost   │
│          │  Check     │           │  Sent      │            │              │
└────┬─────┴──────┬─────┴─────┬─────┴──────┬─────┴──────┬─────┴───────┬──────┘
     │            │           │            │            │             │
     │            │           │            ▼            │             │
     │            │           │    ┌──────────────┐     │             │
     │            │           └───►│  QUOTATION   │     │             │
     │            │                │  (Existing)  │     │             │
     │            │                └──────┬───────┘     │             │
     │            │                       │             │             │
     │            │                       ▼             │             ▼
     │            │                Sent → Accepted      │      ┌────────────┐
     │            │                       │             └─────►│   CLIENT   │
     │            │                       └────────────────────│  + CASE    │
     │            │                                            └────────────┘
     │            │                                                   │
     │            │                                                   ▼
     │            │                                            ┌────────────┐
     │            │                                            │  INVOICE   │
     │            │                                            │ (Existing) │
     │            │                                            └────────────┘
```

---

## Phase 1: Core Model Updates

### 1.1 Update Lead Model

**File:** `src/types/crm.ts`

Add the following fields to Lead interface:

```typescript
interface Lead {
  // ... existing fields ...

  // NEW: Case linkage
  cases: string[]              // Array of Case IDs created from this lead
  activeCaseId?: string        // Current active case being worked

  // NEW: ERPNext fields we're missing
  noOfEmployees?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'
  annualRevenue?: number
  marketSegment?: string       // Link to Market Segment master
  industry?: string            // Link to Industry master

  // NEW: Qualification tracking (separate from BANT)
  qualificationStatus: 'unqualified' | 'in_process' | 'qualified'
  qualifiedBy?: string         // User ID
  qualifiedOn?: Date

  // NEW: UTM tracking
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string

  // NEW: First response tracking
  firstResponseTime?: number   // Duration in seconds
  firstResponseAt?: Date

  // NEW: Territory & Sales Person
  territoryId?: string         // Link to Territory
  salesPersonId?: string       // Link to Sales Person

  // UPDATED: Simplified status (case-specific moved to Case)
  status: 'new' | 'contacted' | 'consultation_scheduled' | 'consultation_done' | 'converted' | 'disqualified'
}
```

### 1.2 Update Case Model

**File:** `src/services/casesService.ts`

Add the following to Case interface:

```typescript
interface Case {
  // ... existing fields ...

  // NEW: Lead linkage
  leadId?: string              // Source lead

  // NEW: CRM Pipeline (separate from legal pipeline)
  crmStatus: 'intake' | 'conflict_check' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'dormant'
  crmPipelineStageId?: string
  probability: number          // 0-100
  expectedCloseDate?: Date

  // NEW: BANT moved from Lead to Case
  qualification: {
    budget: 'unknown' | 'low' | 'medium' | 'high' | 'premium'
    authority: 'unknown' | 'decision_maker' | 'influencer' | 'researcher'
    need: 'unknown' | 'urgent' | 'planning' | 'exploring'
    timeline: 'unknown' | 'immediate' | 'this_month' | 'this_quarter' | 'this_year'
    score: number
  }

  // NEW: Conflict check (moved from Lead to Case)
  conflictCheckStatus: 'not_checked' | 'pending' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflictCheckNotes?: string
  conflictCheckDate?: Date
  conflictCheckBy?: string
  opposingParties: string[]

  // NEW: Lost tracking
  lostReason?: string
  lostReasonDetails?: string
  competitorId?: string

  // NEW: Quote linkage
  quoteIds: string[]           // Quotes sent for this case
  acceptedQuoteId?: string     // The quote that was accepted

  // NEW: Sales tracking
  salesPersonId?: string
  territoryId?: string

  // NEW: First response
  firstResponseTime?: number
  firstResponseAt?: Date
}
```

### 1.3 Create Client Model Enhancement

**File:** `src/services/clientsService.ts`

```typescript
interface Client {
  // ... existing fields ...

  // NEW: Conversion tracking
  convertedFromLeadId?: string
  convertedFromCaseId?: string
  convertedAt?: Date

  // NEW: All cases for this client
  activeCaseIds: string[]
  closedCaseIds: string[]

  // NEW: Financial summary
  totalBilled: number
  totalPaid: number
  outstandingBalance: number

  // NEW: Territory & Sales Person
  territoryId?: string
  salesPersonId?: string
}
```

---

## Phase 2: New Master Data Models

### 2.1 Territory Model

**New File:** `src/types/territory.ts`

```typescript
interface Territory {
  _id: string
  name: string
  nameAr: string
  parentTerritoryId?: string   // For hierarchy
  isGroup: boolean
  managerId?: string           // Sales Person ID

  // Tree structure
  level: number
  path: string                 // e.g., "saudi-arabia/riyadh/north-riyadh"

  // Targets
  targets?: {
    year: number
    quarter?: number
    targetAmount: number
    achievedAmount: number
  }[]

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2.2 Sales Person Model

**New File:** `src/types/salesPerson.ts`

```typescript
interface SalesPerson {
  _id: string
  name: string
  nameAr: string
  parentSalesPersonId?: string  // For hierarchy
  isGroup: boolean

  // Employee link
  employeeId?: string
  userId?: string

  // Commission
  commissionRate: number        // Percentage

  // Territory assignment
  territoryIds: string[]

  // Targets
  targets?: {
    year: number
    quarter?: number
    month?: number
    targetAmount: number
    achievedAmount: number
    targetLeads?: number
    achievedLeads?: number
    targetCases?: number
    achievedCases?: number
  }[]

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2.3 Lead Source Model

**New File:** `src/types/leadSource.ts`

```typescript
interface LeadSource {
  _id: string
  name: string
  nameAr: string
  slug: string                  // URL-friendly
  description?: string

  // UTM mapping
  utmSource?: string
  utmMedium?: string

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2.4 Sales Stage Model (CRM Pipeline)

**New File:** `src/types/salesStage.ts`

```typescript
interface SalesStage {
  _id: string
  name: string
  nameAr: string
  order: number

  // Default probability at this stage
  defaultProbability: number

  // Stage type
  type: 'open' | 'won' | 'lost'

  // Color for UI
  color: string

  // Actions
  requiresConflictCheck?: boolean
  requiresQualification?: boolean
  autoCreateQuote?: boolean

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// Default stages
const DEFAULT_SALES_STAGES = [
  { name: 'Intake', nameAr: 'الاستقبال', order: 1, defaultProbability: 10, type: 'open' },
  { name: 'Conflict Check', nameAr: 'فحص التعارض', order: 2, defaultProbability: 20, type: 'open', requiresConflictCheck: true },
  { name: 'Qualified', nameAr: 'مؤهل', order: 3, defaultProbability: 40, type: 'open', requiresQualification: true },
  { name: 'Proposal Sent', nameAr: 'تم إرسال العرض', order: 4, defaultProbability: 60, type: 'open' },
  { name: 'Negotiation', nameAr: 'التفاوض', order: 5, defaultProbability: 80, type: 'open' },
  { name: 'Won', nameAr: 'فاز', order: 6, defaultProbability: 100, type: 'won' },
  { name: 'Lost', nameAr: 'خسر', order: 7, defaultProbability: 0, type: 'lost' },
]
```

### 2.5 Lost Reason Model

**New File:** `src/types/lostReason.ts`

```typescript
interface LostReason {
  _id: string
  reason: string
  reasonAr: string
  category: 'price' | 'competitor' | 'timing' | 'scope' | 'relationship' | 'internal' | 'other'

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2.6 Competitor Model

**New File:** `src/types/competitor.ts`

```typescript
interface Competitor {
  _id: string
  name: string
  nameAr: string
  website?: string
  description?: string

  // Tracking
  casesLostTo: number
  casesWonAgainst: number

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2.7 Market Segment Model

**New File:** `src/types/marketSegment.ts`

```typescript
interface MarketSegment {
  _id: string
  name: string
  nameAr: string
  description?: string

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 2.8 Industry Model

**New File:** `src/types/industry.ts`

```typescript
interface Industry {
  _id: string
  name: string
  nameAr: string

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## Phase 3: CRM Settings

### 3.1 CRM Settings Model

**New File:** `src/types/crmSettings.ts`

```typescript
interface CRMSettings {
  _id: string
  officeId: string

  // Lead Settings
  leadSettings: {
    allowDuplicateEmails: boolean
    autoCreateContact: boolean
    defaultLeadSource?: string
    defaultAssignee?: string
    leadScoringEnabled: boolean
    autoAssignmentEnabled: boolean
    autoAssignmentRule?: 'round_robin' | 'load_balance' | 'territory'
  }

  // Case/Opportunity Settings
  caseSettings: {
    autoCloseAfterDays: number          // Auto-close stale cases
    requireConflictCheck: boolean
    conflictCheckBeforeStage?: string   // Stage ID
    defaultPipeline?: string
    defaultSalesStage?: string
  }

  // Quote Settings
  quoteSettings: {
    defaultValidDays: number
    autoSendReminder: boolean
    reminderDaysBefore: number
    requireApproval: boolean
    approvalThreshold?: number
  }

  // Communication Settings
  communicationSettings: {
    carryForwardCommunication: boolean  // Copy emails across pipeline
    updateTimestampOnCommunication: boolean
    autoLogEmails: boolean
    autoLogCalls: boolean
  }

  // Appointment Settings
  appointmentSettings: {
    enabled: boolean
    defaultDuration: number             // Minutes
    advanceBookingDays: number
    bufferBetweenAppointments: number   // Minutes
    workingHours: {
      [day: string]: { start: string, end: string }[]
    }
    holidayListId?: string
    sendReminders: boolean
    reminderHoursBefore: number
  }

  // Naming Settings
  namingSettings: {
    leadPrefix: string                  // e.g., "LEAD-"
    casePrefix: string                  // e.g., "CASE-"
    quotePrefix: string                 // e.g., "QT-"
    campaignNamingBy: 'name' | 'series'
  }

  // Territory Settings
  territorySettings: {
    enabled: boolean
    defaultTerritory?: string
    autoAssignByTerritory: boolean
  }

  // Sales Person Settings
  salesPersonSettings: {
    hierarchyEnabled: boolean
    commissionTrackingEnabled: boolean
    targetTrackingEnabled: boolean
  }

  createdAt: Date
  updatedAt: Date
}
```

### 3.2 CRM Settings Page

**New Route:** `src/routes/_authenticated/dashboard.settings.crm.tsx`

**New Component:** `src/features/settings/components/crm-settings.tsx`

Structure (following finance-settings pattern):
- Lead Management Section
- Case/Opportunity Settings Section
- Quote Settings Section
- Communication Settings Section
- Appointment Settings Section
- Naming/Numbering Section
- Territory Settings Section
- Sales Team Settings Section

---

## Phase 4: CRM Setup Wizard

### 4.1 Wizard Structure

**New Route:** `src/routes/_authenticated/dashboard.crm.setup-wizard.tsx`

**New Component:** `src/features/crm/components/crm-setup-wizard.tsx`

```typescript
interface CRMSetupWizardData {
  // Step 1: Basic Configuration
  crmEnabled: boolean
  industry?: string

  // Step 2: Lead Sources
  leadSources: Array<{
    name: string
    nameAr: string
  }>

  // Step 3: Sales Stages
  salesStages: Array<{
    name: string
    nameAr: string
    probability: number
    color: string
  }>

  // Step 4: Lost Reasons
  lostReasons: Array<{
    reason: string
    reasonAr: string
    category: string
  }>

  // Step 5: Territory Setup
  territoryEnabled: boolean
  territories: Array<{
    name: string
    nameAr: string
    parentId?: string
  }>

  // Step 6: Sales Team
  salesTeamEnabled: boolean
  salesPersons: Array<{
    name: string
    employeeId?: string
    commissionRate: number
    territoryIds: string[]
  }>

  // Step 7: Appointment Settings
  appointmentEnabled: boolean
  appointmentDuration: number
  advanceBookingDays: number
  workingHours: object

  // Step 8: Communication Settings
  autoLogEmails: boolean
  autoLogCalls: boolean
  carryForwardCommunication: boolean

  // Step 9: Naming Convention
  leadPrefix: string
  casePrefix: string
  quotePrefix: string

  // Step 10: Review & Complete
  completed: boolean
}
```

### 4.2 Wizard Steps

| Step | Title | Title (Arabic) | Icon | Description |
|------|-------|----------------|------|-------------|
| 1 | Basic Configuration | الإعدادات الأساسية | Settings | Enable CRM, select industry |
| 2 | Lead Sources | مصادر العملاء المحتملين | Users | Where do your leads come from? |
| 3 | Sales Stages | مراحل المبيعات | GitBranch | Define your sales pipeline |
| 4 | Lost Reasons | أسباب الخسارة | XCircle | Track why you lose deals |
| 5 | Territory Setup | إعداد المناطق | Map | Geographic organization |
| 6 | Sales Team | فريق المبيعات | UserCheck | Team hierarchy & commissions |
| 7 | Appointments | المواعيد | Calendar | Booking settings |
| 8 | Communication | التواصل | Mail | Email & call logging |
| 9 | Naming Convention | تسمية المستندات | Hash | Prefixes and numbering |
| 10 | Review & Complete | المراجعة والإكمال | CheckCircle | Summary and finish |

---

## Phase 5: New Reports

### 5.1 Campaign Efficiency Report

**Purpose:** Track marketing campaign ROI through the funnel

**Metrics:**
- UTM Campaign name
- Lead Count
- Case Count (opportunities)
- Quote Count
- Won Count
- Won Value
- Lead → Case %
- Case → Quote %
- Quote → Won %

**File:** `src/features/crm/components/reports/campaign-efficiency-report.tsx`

### 5.2 Lead Owner Efficiency Report

**Purpose:** Measure individual sales performance

**Metrics:**
- Lead Owner (Sales Person)
- Lead Count
- Case Count
- Quote Count
- Won Count
- Won Value
- Conversion rates at each stage

**File:** `src/features/crm/components/reports/lead-owner-efficiency-report.tsx`

### 5.3 First Response Time Report

**Purpose:** Track response speed

**Metrics:**
- Date
- Average First Response Time
- Median Response Time
- Response by Sales Person

**File:** `src/features/crm/components/reports/first-response-time-report.tsx`

### 5.4 Prospects Engaged Not Converted Report

**Purpose:** Re-engagement targets

**Metrics:**
- Lead name
- Organization
- Last activity type
- Last activity date
- Days since contact
- Engagement count

**Filters:**
- Days since last contact (default: 60)
- Minimum interactions

**File:** `src/features/crm/components/reports/prospects-engaged-report.tsx`

### 5.5 Lead Conversion Time Report

**Purpose:** Measure sales cycle

**Metrics:**
- Client name
- Days to convert
- Number of interactions
- Number of cases
- Total value

**File:** `src/features/crm/components/reports/lead-conversion-time-report.tsx`

### 5.6 Lost Opportunity Analysis Report

**Purpose:** Understand why deals are lost

**Metrics:**
- Case/Opportunity
- Client/Lead name
- Lost reason
- Lost reason detail
- Competitor
- Stage when lost
- Estimated value lost

**File:** `src/features/crm/components/reports/lost-opportunity-report.tsx`

### 5.7 Sales Pipeline Analytics Report

**Purpose:** Pipeline health by stage/owner

**Metrics:**
- Count by stage
- Value by stage
- Count by owner
- Value by owner
- Monthly/Quarterly breakdown

**File:** `src/features/crm/components/reports/sales-pipeline-analytics-report.tsx`

---

## Phase 6: Appointment Booking

### 6.1 Appointment Model

**New File:** `src/types/appointment.ts`

```typescript
interface Appointment {
  _id: string

  // Scheduling
  scheduledTime: Date
  duration: number              // Minutes
  endTime: Date

  // Status
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

  // Customer Info
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerNotes?: string

  // Linkage
  appointmentWith: 'lead' | 'client' | 'contact'
  partyId: string               // Lead ID, Client ID, or Contact ID
  caseId?: string

  // Assignment
  assignedTo: string            // User/Sales Person ID

  // Location
  locationType: 'office' | 'virtual' | 'client_site' | 'other'
  location?: string
  meetingLink?: string

  // Calendar
  calendarEventId?: string      // External calendar sync
  sendReminder: boolean
  reminderSentAt?: Date

  // Outcome
  outcome?: string
  followUpRequired?: boolean
  followUpDate?: Date

  createdAt: Date
  updatedAt: Date
}
```

### 6.2 Appointment Booking Slots

```typescript
interface AppointmentSlot {
  _id: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6  // Sunday = 0
  fromTime: string              // "09:00"
  toTime: string                // "17:00"

  enabled: boolean
}
```

### 6.3 Appointment Components

- `src/features/crm/components/appointments/appointment-list-view.tsx`
- `src/features/crm/components/appointments/appointment-details-view.tsx`
- `src/features/crm/components/appointments/appointment-booking-view.tsx`
- `src/features/crm/components/appointments/appointment-calendar-view.tsx`

### 6.4 Appointment Routes

- `/dashboard/crm/appointments` - List appointments
- `/dashboard/crm/appointments/new` - Book new appointment
- `/dashboard/crm/appointments/{id}` - Appointment details
- `/dashboard/crm/appointments/calendar` - Calendar view
- `/book-appointment` - Public booking page (guest access)

---

## Phase 7: Contract Management Enhancement

### 7.1 Enhance Legal Document Service

Add to existing LegalDocument:

```typescript
interface LegalDocument {
  // ... existing fields ...

  // NEW: Contract-specific fields
  contractType?: 'service_agreement' | 'engagement_letter' | 'retainer_agreement' | 'nda' | 'other'

  // Parties
  partyType?: 'lead' | 'client' | 'vendor'
  partyId?: string
  caseId?: string

  // Status tracking
  contractStatus?: 'draft' | 'sent' | 'viewed' | 'signed' | 'active' | 'expired' | 'terminated'
  sentAt?: Date
  viewedAt?: Date
  signedAt?: Date

  // Signature
  signedBy?: string
  signatureMethod?: 'in_person' | 'digital' | 'email_confirmation'
  signatureIpAddress?: string

  // Fulfillment
  requiresFulfillment?: boolean
  fulfillmentStatus?: 'na' | 'unfulfilled' | 'partial' | 'fulfilled' | 'lapsed'
  fulfillmentDeadline?: Date
  fulfillmentChecklist?: Array<{
    requirement: string
    fulfilled: boolean
    notes?: string
  }>

  // Period
  startDate?: Date
  endDate?: Date
}
```

---

## Phase 8: Backend API Updates

### 8.1 New Endpoints Required

```
# CRM Settings
GET    /api/settings/crm
PUT    /api/settings/crm

# Territory
GET    /api/territories
GET    /api/territories/:id
POST   /api/territories
PUT    /api/territories/:id
DELETE /api/territories/:id
GET    /api/territories/tree          # Get hierarchy

# Sales Person
GET    /api/sales-persons
GET    /api/sales-persons/:id
POST   /api/sales-persons
PUT    /api/sales-persons/:id
DELETE /api/sales-persons/:id
GET    /api/sales-persons/tree        # Get hierarchy
GET    /api/sales-persons/:id/stats   # Performance stats

# Lead Source
GET    /api/lead-sources
POST   /api/lead-sources
PUT    /api/lead-sources/:id
DELETE /api/lead-sources/:id

# Sales Stage
GET    /api/sales-stages
POST   /api/sales-stages
PUT    /api/sales-stages/:id
DELETE /api/sales-stages/:id
PUT    /api/sales-stages/reorder      # Reorder stages

# Lost Reasons
GET    /api/lost-reasons
POST   /api/lost-reasons
PUT    /api/lost-reasons/:id
DELETE /api/lost-reasons/:id

# Competitors
GET    /api/competitors
POST   /api/competitors
PUT    /api/competitors/:id
DELETE /api/competitors/:id

# Appointments
GET    /api/appointments
GET    /api/appointments/:id
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id
GET    /api/appointments/slots        # Available slots
POST   /api/appointments/book         # Public booking

# Reports
GET    /api/reports/crm/campaign-efficiency
GET    /api/reports/crm/lead-owner-efficiency
GET    /api/reports/crm/first-response-time
GET    /api/reports/crm/prospects-engaged
GET    /api/reports/crm/lead-conversion-time
GET    /api/reports/crm/lost-opportunity
GET    /api/reports/crm/sales-pipeline-analytics

# Lead updates
PUT    /api/leads/:id/create-case     # Create case from lead
GET    /api/leads/:id/cases           # Get cases for lead

# Case updates
PUT    /api/cases/:id/crm-stage       # Update CRM stage
PUT    /api/cases/:id/mark-won        # Mark as won (creates client)
PUT    /api/cases/:id/mark-lost       # Mark as lost
GET    /api/cases/:id/quotes          # Get quotes for case
```

---

## Phase 9: UI Components

### 9.1 New Components Required

```
src/features/crm/components/
├── settings/
│   └── crm-settings.tsx
├── setup-wizard/
│   └── crm-setup-wizard.tsx
├── territories/
│   ├── territory-list-view.tsx
│   ├── territory-tree-view.tsx
│   ├── territory-form.tsx
│   └── territory-selector.tsx
├── sales-persons/
│   ├── sales-person-list-view.tsx
│   ├── sales-person-tree-view.tsx
│   ├── sales-person-form.tsx
│   └── sales-person-selector.tsx
├── appointments/
│   ├── appointment-list-view.tsx
│   ├── appointment-details-view.tsx
│   ├── appointment-booking-view.tsx
│   ├── appointment-calendar-view.tsx
│   └── public-booking-page.tsx
├── reports/
│   ├── campaign-efficiency-report.tsx
│   ├── lead-owner-efficiency-report.tsx
│   ├── first-response-time-report.tsx
│   ├── prospects-engaged-report.tsx
│   ├── lead-conversion-time-report.tsx
│   ├── lost-opportunity-report.tsx
│   └── sales-pipeline-analytics-report.tsx
├── masters/
│   ├── lead-sources-view.tsx
│   ├── sales-stages-view.tsx
│   ├── lost-reasons-view.tsx
│   ├── competitors-view.tsx
│   ├── market-segments-view.tsx
│   └── industries-view.tsx
└── conversion/
    ├── lead-to-case-dialog.tsx
    ├── case-to-client-dialog.tsx
    └── case-won-dialog.tsx
```

### 9.2 New Routes Required

```
src/routes/_authenticated/
├── dashboard.settings.crm.tsx
├── dashboard.crm.setup-wizard.tsx
├── dashboard.crm.territories.tsx
├── dashboard.crm.territories.$territoryId.tsx
├── dashboard.crm.sales-persons.tsx
├── dashboard.crm.sales-persons.$salesPersonId.tsx
├── dashboard.crm.appointments.tsx
├── dashboard.crm.appointments.new.tsx
├── dashboard.crm.appointments.$appointmentId.tsx
├── dashboard.crm.appointments.calendar.tsx
├── dashboard.crm.masters.tsx
├── dashboard.crm.masters.lead-sources.tsx
├── dashboard.crm.masters.sales-stages.tsx
├── dashboard.crm.masters.lost-reasons.tsx
├── dashboard.crm.masters.competitors.tsx
├── dashboard.crm.masters.market-segments.tsx
└── dashboard.crm.masters.industries.tsx
```

---

## Phase 10: Implementation Priority

### High Priority (Week 1-2)
1. ✅ Update Lead model with Case linkage
2. ✅ Update Case model with CRM fields
3. ✅ Create CRM Settings page
4. ✅ Create CRM Setup Wizard
5. ✅ Lead to Case conversion flow

### Medium Priority (Week 3-4)
6. ✅ Territory Management
7. ✅ Sales Person Hierarchy
8. ✅ Sales Stage Master
9. ✅ Lost Reason tracking
10. ✅ CRM Reports (all 7)

### Lower Priority (Week 5-6)
11. ✅ Appointment Booking
12. ✅ Contract Enhancement
13. ✅ Competitor tracking
14. ✅ Market Segment & Industry masters
15. ✅ Public booking page

---

## Summary

This plan adds **ERPNext CRM feature parity** while maintaining your law firm-specific features:

| New Feature | ERPNext Equivalent | Status |
|-------------|-------------------|--------|
| Lead → Case flow | Lead → Opportunity | To implement |
| CRM Settings | CRM Settings | To implement |
| CRM Setup Wizard | Module Onboarding | To implement |
| Territory Management | Territory | To implement |
| Sales Person Hierarchy | Sales Person | To implement |
| 7 New Reports | CRM Reports | To implement |
| Appointment Booking | Appointment | To implement |
| Contract Fulfillment | Contract | To enhance |
| Lost Reason tracking | Opportunity Lost Reason | To implement |
| Competitor tracking | Competitor | To implement |

**Total new components:** ~40
**Total new routes:** ~20
**Total new API endpoints:** ~35

Ready to implement when you give the go-ahead!
