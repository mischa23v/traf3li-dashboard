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

### Complete Flow: Lead → Case → Quotation/Contract → Sales Order → Client

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
     │            │             └────────►│  CREATE CASE  │◄─────────┘
     │            │                       └───────┬───────┘
     │            │                               │
     ▼            ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CASE PIPELINE                                   │
├──────────┬────────────┬───────────┬────────────┬────────────┬──────────────┤
│  Intake  │  Conflict  │ Qualified │  Proposal  │ Negotiation│   Won/Lost   │
│          │  Check     │           │  Sent      │            │              │
└────┬─────┴──────┬─────┴─────┬─────┴──────┬─────┴──────┬─────┴───────┬──────┘
     │            │           │            │            │             │
     │            │           │            ▼            │             │
     │            │           │   ┌────────────────┐    │             │
     │            │           └──►│  QUOTATION/    │    │             │
     │            │               │  CONTRACT      │    │             │
     │            │               └───────┬────────┘    │             │
     │            │                       │             │             │
     │            │                       ▼             │             │
     │            │               ┌────────────────┐    │             │
     │            │               │  SALES ORDER   │    │             │
     │            │               │ (Finance Link) │    │             │
     │            │               └───────┬────────┘    │             │
     │            │                       │             │             ▼
     │            │                       ▼             │      ┌────────────┐
     │            │                   Accepted          └─────►│   CLIENT   │
     │            │                       │                    │ (Created)  │
     │            │                       └───────────────────►│ + CASE     │
     │            │                                            │ + LEAD     │
     │            │                                            └─────┬──────┘
     │            │                                                  │
     │            │                                                  ▼
     │            │                                            ┌────────────┐
     │            │                                            │  INVOICE   │
     │            │                                            │ (Finance)  │
     │            │                                            └────────────┘
```

### Key Conversion Points

1. **Lead → Case**: When consultation is done, create case (opportunity)
2. **Case → Quotation/Contract**: When qualified, send proposal
3. **Quotation → Sales Order**: When accepted, create sales order in finance
4. **Sales Order → Client**: When processed, create client record linked to:
   - Original Lead (person record)
   - Case (matter record)
   - All financial records

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

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAD SETTINGS (ERPNext: CRM Settings > Lead Settings)
  // ═══════════════════════════════════════════════════════════════════════════
  leadSettings: {
    // Allow Lead Duplication - Permit duplicate emails/phones
    allowDuplicateEmails: boolean       // ✅ ERPNext: Allow Lead Duplication
    allowDuplicatePhones: boolean

    // Auto Creation of Contact - Create contact from lead automatically
    autoCreateContact: boolean          // ✅ ERPNext: Auto Creation of Contact

    // Default assignments
    defaultLeadSource?: string
    defaultAssignee?: string

    // Lead scoring
    leadScoringEnabled: boolean

    // Auto-assignment rules
    autoAssignmentEnabled: boolean
    autoAssignmentRule?: 'round_robin' | 'load_balance' | 'territory'

    // First response tracking
    trackFirstResponseTime: boolean
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASE/OPPORTUNITY SETTINGS (ERPNext: CRM Settings > Opportunity Settings)
  // ═══════════════════════════════════════════════════════════════════════════
  caseSettings: {
    // Close Opportunity After Days - Auto-close stale cases
    autoCloseAfterDays: number          // ✅ ERPNext: Close Opportunity After Days
    autoCloseEnabled: boolean

    // Conflict check requirements
    requireConflictCheck: boolean
    conflictCheckBeforeStage?: string

    // Default pipeline settings
    defaultPipeline?: string
    defaultSalesStage?: string

    // Auto-create quote when qualified
    autoCreateQuoteOnQualified: boolean
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUOTE/PROPOSAL SETTINGS (ERPNext: CRM Settings > Quotation Settings)
  // ═══════════════════════════════════════════════════════════════════════════
  quoteSettings: {
    // Default Quotation Valid Till - Default validity period
    defaultValidDays: number            // ✅ ERPNext: Default Quotation Valid Till

    // Reminders
    autoSendReminder: boolean
    reminderDaysBefore: number

    // Approval workflow
    requireApproval: boolean
    approvalThreshold?: number          // Amount above which approval needed
    approvers?: string[]                // User IDs who can approve
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMUNICATION SETTINGS (ERPNext: CRM Settings > Communication)
  // ═══════════════════════════════════════════════════════════════════════════
  communicationSettings: {
    // Carry Forward Communication - Copy emails across pipeline stages
    carryForwardCommunication: boolean  // ✅ ERPNext: Carry Forward Communication

    // Update Timestamp on Communication - Track activity timestamps
    updateTimestampOnCommunication: boolean // ✅ ERPNext: Update Timestamp on Communication

    // Auto-logging
    autoLogEmails: boolean              // Auto-log incoming/outgoing emails
    autoLogCalls: boolean               // Auto-log phone calls
    autoLogWhatsApp: boolean            // Auto-log WhatsApp messages

    // Communication templates
    defaultEmailTemplateId?: string
    defaultSMSTemplateId?: string
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPOINTMENT SETTINGS (ERPNext: CRM Settings > Appointment Booking)
  // ═══════════════════════════════════════════════════════════════════════════
  appointmentSettings: {
    // Enable Scheduling - Toggle appointment booking
    enabled: boolean                    // ✅ ERPNext: Enable Scheduling

    // Appointment Duration - Default slot length in minutes
    defaultDuration: number             // ✅ ERPNext: Appointment Duration (15/30/45/60)
    allowedDurations: number[]          // [15, 30, 45, 60]

    // Advance Booking Days - How far ahead to book
    advanceBookingDays: number          // ✅ ERPNext: Advance Booking Days
    minAdvanceBookingHours: number      // Minimum hours before appointment

    // Agent List - Available staff for appointments
    agentList: string[]                 // ✅ ERPNext: Agent List (User IDs)

    // Holiday List - Block unavailable dates
    holidayListId?: string              // ✅ ERPNext: Holiday List

    // Buffer between appointments
    bufferBetweenAppointments: number   // Minutes between slots

    // Working hours per day
    workingHours: {
      sunday: { enabled: boolean, start: string, end: string }
      monday: { enabled: boolean, start: string, end: string }
      tuesday: { enabled: boolean, start: string, end: string }
      wednesday: { enabled: boolean, start: string, end: string }
      thursday: { enabled: boolean, start: string, end: string }
      friday: { enabled: boolean, start: string, end: string }
      saturday: { enabled: boolean, start: string, end: string }
    }

    // Reminders
    sendReminders: boolean
    reminderHoursBefore: number[]       // [24, 1] = 24hrs and 1hr before

    // Self-service booking
    publicBookingEnabled: boolean       // Allow public booking page
    publicBookingUrl?: string
    requirePhoneVerification: boolean
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAMING/NUMBERING SETTINGS (ERPNext: CRM Settings > Naming)
  // ═══════════════════════════════════════════════════════════════════════════
  namingSettings: {
    // Campaign Naming By - Auto-name campaigns
    campaignNamingBy: 'name' | 'series' // ✅ ERPNext: Campaign Naming By

    // Prefixes for auto-numbering
    leadPrefix: string                  // e.g., "LEAD-"
    casePrefix: string                  // e.g., "CASE-"
    quotePrefix: string                 // e.g., "QT-"
    contractPrefix: string              // e.g., "CTR-"
    appointmentPrefix: string           // e.g., "APT-"

    // Number format
    numberFormat: 'YYYY-####' | 'YYMM-####' | '####'
    resetNumberingYearly: boolean
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TERRITORY SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  territorySettings: {
    enabled: boolean
    defaultTerritory?: string
    autoAssignByTerritory: boolean
    requireTerritoryOnLead: boolean
    requireTerritoryOnCase: boolean
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SALES PERSON SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  salesPersonSettings: {
    hierarchyEnabled: boolean
    commissionTrackingEnabled: boolean
    targetTrackingEnabled: boolean
    requireSalesPersonOnCase: boolean
    defaultCommissionRate: number       // Default percentage
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSION SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  conversionSettings: {
    // Lead → Case conversion
    autoCreateCaseOnConsultation: boolean
    requireBANTBeforeCase: boolean

    // Case → Quote conversion
    autoCreateQuoteOnQualified: boolean

    // Quote → Sales Order conversion
    autoCreateSalesOrderOnAccept: boolean
    linkSalesOrderToFinance: boolean    // Link to Finance module

    // Sales Order → Client conversion
    autoCreateClientOnSalesOrder: boolean
    clientCreationTrigger: 'sales_order' | 'payment_received' | 'manual'

    // Data to copy during conversion
    copyNotesToCase: boolean
    copyActivityHistory: boolean
    copyDocuments: boolean
  }

  createdAt: Date
  updatedAt: Date
}
```

### 3.2 CRM Settings UI Sections

The CRM Settings page should have these tabs/sections:

| Section | Settings Included | Icon |
|---------|------------------|------|
| **Lead Settings** | Duplication, Auto-contact, Assignment | Users |
| **Case/Opportunity** | Auto-close, Conflict check, Pipeline defaults | Briefcase |
| **Quotation** | Validity, Reminders, Approval | FileText |
| **Communication** | Carry forward, Timestamps, Auto-logging | Mail |
| **Appointments** | Scheduling, Duration, Working hours | Calendar |
| **Naming** | Prefixes, Numbering format | Hash |
| **Territory** | Enable, Defaults, Auto-assign | MapPin |
| **Sales Team** | Hierarchy, Commission, Targets | UserCheck |
| **Conversion** | Auto-create rules, Data copying | ArrowRight |

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

### 4.1 Overview

Following ERPNext's modular onboarding system, the CRM Setup Wizard guides users through a complete CRM configuration with these onboarding steps:

**ERPNext CRM Onboarding Steps (Reference):**
1. Create Lead Source - Set up where leads come from
2. Create Sales Stage - Define pipeline stages
3. Create Territory - Set up geographical regions
4. Create Customer Group - Segment customers
5. Create First Lead - Guided lead creation
6. Create First Opportunity - Convert lead to case

### 4.2 Wizard Structure

**New Route:** `src/routes/_authenticated/dashboard.crm.setup-wizard.tsx`

**New Component:** `src/features/crm/components/crm-setup-wizard.tsx`

```typescript
interface CRMSetupWizardData {
  // Step 1: Welcome & Basic Configuration
  crmEnabled: boolean
  industry?: string
  companySize?: '1-10' | '11-50' | '51-200' | '201-500' | '500+'

  // Step 2: Lead Sources (ERPNext: Create Lead Source)
  leadSources: Array<{
    name: string
    nameAr: string
    utmSource?: string
    utmMedium?: string
    enabled: boolean
  }>

  // Step 3: Sales Stages (ERPNext: Create Sales Stage)
  salesStages: Array<{
    name: string
    nameAr: string
    order: number
    probability: number
    color: string
    type: 'open' | 'won' | 'lost'
    requiresConflictCheck?: boolean
    requiresQualification?: boolean
  }>

  // Step 4: Lost Reasons
  lostReasons: Array<{
    reason: string
    reasonAr: string
    category: 'price' | 'competitor' | 'timing' | 'scope' | 'relationship' | 'internal' | 'other'
  }>

  // Step 5: Territory Setup (ERPNext: Create Territory)
  territoryEnabled: boolean
  territories: Array<{
    name: string
    nameAr: string
    parentId?: string
    isGroup: boolean
    level: number
  }>

  // Step 6: Customer Groups (ERPNext: Create Customer Group)
  customerGroups: Array<{
    name: string
    nameAr: string
    parentId?: string
  }>

  // Step 7: Sales Team
  salesTeamEnabled: boolean
  salesPersons: Array<{
    name: string
    employeeId?: string
    userId?: string
    commissionRate: number
    territoryIds: string[]
    parentSalesPersonId?: string
  }>

  // Step 8: Appointment Settings
  appointmentEnabled: boolean
  appointmentDuration: number              // Default duration in minutes
  allowedDurations: number[]               // [15, 30, 45, 60]
  advanceBookingDays: number
  workingHours: {
    [day: string]: { enabled: boolean, start: string, end: string }
  }
  agentList: string[]                       // User IDs available for appointments

  // Step 9: Communication Settings
  autoLogEmails: boolean
  autoLogCalls: boolean
  autoLogWhatsApp: boolean
  carryForwardCommunication: boolean
  updateTimestampOnCommunication: boolean

  // Step 10: Naming Convention
  leadPrefix: string                        // e.g., "LEAD-"
  casePrefix: string                        // e.g., "CASE-"
  quotePrefix: string                       // e.g., "QT-"
  campaignNamingBy: 'name' | 'series'

  // Step 11: Create First Lead (ERPNext: Create First Lead)
  firstLead?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    companyName?: string
    sourceId?: string
  }

  // Step 12: Create First Case (ERPNext: Create First Opportunity)
  firstCase?: {
    leadId: string                          // Link to first lead
    title: string
    caseType: string
    description?: string
    estimatedValue?: number
    salesStageId: string
  }

  // Completion
  completed: boolean
  completedAt?: Date
}
```

### 4.3 Wizard Steps

| Step | Title | Title (Arabic) | Icon | Description | ERPNext Equivalent |
|------|-------|----------------|------|-------------|-------------------|
| 1 | Welcome | مرحباً | Sparkles | Introduction, enable CRM | - |
| 2 | Lead Sources | مصادر العملاء المحتملين | Target | Where do leads come from? | Create Lead Source |
| 3 | Sales Pipeline | مراحل المبيعات | GitBranch | Define pipeline stages | Create Sales Stage |
| 4 | Lost Reasons | أسباب الخسارة | XCircle | Track why deals are lost | - |
| 5 | Territories | المناطق الجغرافية | MapPin | Geographic organization | Create Territory |
| 6 | Customer Groups | مجموعات العملاء | Users | Segment customers | Create Customer Group |
| 7 | Sales Team | فريق المبيعات | UserCheck | Team hierarchy & commissions | - |
| 8 | Appointments | المواعيد | Calendar | Booking settings | - |
| 9 | Communication | التواصل | Mail | Email & call logging | - |
| 10 | Naming | تسمية المستندات | Hash | Prefixes and numbering | - |
| 11 | First Lead | أول عميل محتمل | UserPlus | Create guided first lead | Create First Lead |
| 12 | First Case | أول قضية | Briefcase | Convert lead to case | Create First Opportunity |
| 13 | Review | المراجعة | CheckCircle | Summary and finish | - |

### 4.4 Default Values by Step

**Step 2: Default Lead Sources**
```typescript
const DEFAULT_LEAD_SOURCES = [
  { name: 'Website', nameAr: 'الموقع الإلكتروني', utmSource: 'website' },
  { name: 'Referral', nameAr: 'إحالة', utmSource: 'referral' },
  { name: 'Social Media', nameAr: 'وسائل التواصل الاجتماعي', utmSource: 'social' },
  { name: 'Advertisement', nameAr: 'إعلان', utmSource: 'ads' },
  { name: 'Walk-in', nameAr: 'زيارة مباشرة', utmSource: 'walkin' },
  { name: 'Phone Call', nameAr: 'مكالمة هاتفية', utmSource: 'phone' },
  { name: 'Email Campaign', nameAr: 'حملة بريد إلكتروني', utmSource: 'email' },
  { name: 'Event', nameAr: 'فعالية', utmSource: 'event' },
]
```

**Step 3: Default Sales Stages**
```typescript
const DEFAULT_SALES_STAGES = [
  { name: 'Intake', nameAr: 'الاستقبال', order: 1, probability: 10, color: '#6B7280', type: 'open' },
  { name: 'Conflict Check', nameAr: 'فحص التعارض', order: 2, probability: 20, color: '#F59E0B', type: 'open', requiresConflictCheck: true },
  { name: 'Qualified', nameAr: 'مؤهل', order: 3, probability: 40, color: '#3B82F6', type: 'open', requiresQualification: true },
  { name: 'Proposal Sent', nameAr: 'تم إرسال العرض', order: 4, probability: 60, color: '#8B5CF6', type: 'open' },
  { name: 'Negotiation', nameAr: 'التفاوض', order: 5, probability: 80, color: '#EC4899', type: 'open' },
  { name: 'Won', nameAr: 'تم الفوز', order: 6, probability: 100, color: '#10B981', type: 'won' },
  { name: 'Lost', nameAr: 'خسارة', order: 7, probability: 0, color: '#EF4444', type: 'lost' },
]
```

**Step 4: Default Lost Reasons**
```typescript
const DEFAULT_LOST_REASONS = [
  { reason: 'Price too high', reasonAr: 'السعر مرتفع جداً', category: 'price' },
  { reason: 'Chose competitor', reasonAr: 'اختار منافساً', category: 'competitor' },
  { reason: 'Budget constraints', reasonAr: 'قيود الميزانية', category: 'price' },
  { reason: 'Timing not right', reasonAr: 'التوقيت غير مناسب', category: 'timing' },
  { reason: 'Scope mismatch', reasonAr: 'عدم تطابق النطاق', category: 'scope' },
  { reason: 'No response', reasonAr: 'لا يوجد رد', category: 'relationship' },
  { reason: 'Internal decision', reasonAr: 'قرار داخلي', category: 'internal' },
  { reason: 'Other', reasonAr: 'أخرى', category: 'other' },
]
```

**Step 5: Default Territories (Saudi Arabia)**
```typescript
const DEFAULT_TERRITORIES_SA = [
  { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', isGroup: true, level: 0 },
  { name: 'Riyadh Region', nameAr: 'منطقة الرياض', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Makkah Region', nameAr: 'منطقة مكة المكرمة', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Eastern Region', nameAr: 'المنطقة الشرقية', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Madinah Region', nameAr: 'منطقة المدينة المنورة', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Riyadh City', nameAr: 'مدينة الرياض', isGroup: false, level: 2, parentName: 'Riyadh Region' },
  { name: 'Jeddah', nameAr: 'جدة', isGroup: false, level: 2, parentName: 'Makkah Region' },
  { name: 'Dammam', nameAr: 'الدمام', isGroup: false, level: 2, parentName: 'Eastern Region' },
]
```

**Step 6: Default Customer Groups**
```typescript
const DEFAULT_CUSTOMER_GROUPS = [
  { name: 'Individual', nameAr: 'فرد' },
  { name: 'Commercial', nameAr: 'تجاري' },
  { name: 'Government', nameAr: 'حكومي' },
  { name: 'Non-Profit', nameAr: 'غير ربحي' },
  { name: 'VIP', nameAr: 'كبار العملاء' },
]
```

**Step 8: Default Appointment Settings**
```typescript
const DEFAULT_APPOINTMENT_SETTINGS = {
  enabled: true,
  defaultDuration: 30,
  allowedDurations: [15, 30, 45, 60],
  advanceBookingDays: 30,
  workingHours: {
    sunday: { enabled: true, start: '09:00', end: '17:00' },
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },  // Weekend in KSA
    saturday: { enabled: false, start: '09:00', end: '17:00' }, // Weekend in KSA
  }
}
```

---

## Phase 5: New CRM Reports

### Priority Overview

| Report | Purpose | Priority |
|--------|---------|----------|
| Campaign Efficiency | UTM tracking, funnel conversion | **HIGH** |
| Lead Owner Efficiency | Per-person performance | **HIGH** |
| First Response Time | Response speed analytics | **HIGH** |
| Lost Opportunity Analysis | Loss reasons breakdown | **HIGH** |
| Sales Pipeline Analytics | Pipeline by stage/owner | **HIGH** |
| Prospects Engaged Not Converted | Re-engagement targets | MEDIUM |
| Lead Conversion Time | Days to convert | MEDIUM |

---

### 5.1 Campaign Efficiency Report (HIGH PRIORITY)

**Purpose:** Track marketing campaign ROI through the complete funnel (UTM tracking)

**Route:** `/dashboard/crm/reports/campaign-efficiency`
**API:** `GET /api/reports/crm/campaign-efficiency`

**Columns:**
| Column | Description | Type |
|--------|-------------|------|
| Campaign | UTM Campaign name | string |
| Source | UTM Source | string |
| Medium | UTM Medium | string |
| Lead Count | Total leads from campaign | number |
| Case Count | Leads that became cases | number |
| Quote Count | Cases with quotes sent | number |
| Won Count | Cases won | number |
| Won Value | Total value of won cases | currency |
| Cost | Campaign cost (if tracked) | currency |
| ROI | (Won Value - Cost) / Cost * 100 | percentage |
| Lead → Case % | Conversion rate | percentage |
| Case → Quote % | Conversion rate | percentage |
| Quote → Won % | Conversion rate | percentage |

**Filters:**
- Date range
- Campaign
- Source
- Medium
- Sales Person

**Charts:**
- Funnel visualization
- ROI by campaign bar chart
- Conversion rates trend line

**File:** `src/features/crm/components/reports/campaign-efficiency-report.tsx`

---

### 5.2 Lead Owner Efficiency Report (HIGH PRIORITY)

**Purpose:** Measure individual sales person performance

**Route:** `/dashboard/crm/reports/lead-owner-efficiency`
**API:** `GET /api/reports/crm/lead-owner-efficiency`

**Columns:**
| Column | Description | Type |
|--------|-------------|------|
| Sales Person | Lead owner name | string |
| Lead Count | Total leads assigned | number |
| Case Count | Leads converted to cases | number |
| Quote Count | Cases with quotes | number |
| Won Count | Cases won | number |
| Won Value | Total value won | currency |
| Lost Count | Cases lost | number |
| Lost Value | Total value lost | currency |
| Lead → Case % | Conversion rate | percentage |
| Case → Won % | Win rate | percentage |
| Avg Deal Size | Won Value / Won Count | currency |
| Target Achievement | Actual vs Target | percentage |

**Filters:**
- Date range
- Sales Person
- Territory
- Lead Source

**Charts:**
- Leaderboard ranking
- Conversion funnel per person
- Target vs Actual bar chart
- Performance trend over time

**File:** `src/features/crm/components/reports/lead-owner-efficiency-report.tsx`

---

### 5.3 First Response Time Report (HIGH PRIORITY)

**Purpose:** Track response speed to new leads (critical for conversion)

**Route:** `/dashboard/crm/reports/first-response-time`
**API:** `GET /api/reports/crm/first-response-time`

**Columns:**
| Column | Description | Type |
|--------|-------------|------|
| Date | Day/Week/Month | date |
| Avg First Response | Average time to first contact | duration |
| Median Response | Median time to first contact | duration |
| Min Response | Fastest response | duration |
| Max Response | Slowest response | duration |
| Within 1 Hour | % of leads contacted within 1hr | percentage |
| Within 24 Hours | % contacted within 24hrs | percentage |
| Lead Count | Total leads in period | number |

**By Sales Person View:**
| Column | Description | Type |
|--------|-------------|------|
| Sales Person | Name | string |
| Avg Response Time | Average | duration |
| Leads Assigned | Total leads | number |
| Leads Responded | Leads contacted | number |
| Response Rate | % contacted | percentage |

**Filters:**
- Date range
- Sales Person
- Lead Source
- Territory

**Charts:**
- Response time distribution histogram
- Trend line over time
- Comparison by Sales Person
- Correlation: Response Time vs Conversion Rate

**File:** `src/features/crm/components/reports/first-response-time-report.tsx`

---

### 5.4 Lost Opportunity Analysis Report (HIGH PRIORITY)

**Purpose:** Understand why deals are lost to improve win rate

**Route:** `/dashboard/crm/reports/lost-opportunity`
**API:** `GET /api/reports/crm/lost-opportunity`

**Columns:**
| Column | Description | Type |
|--------|-------------|------|
| Case Number | Case reference | string |
| Lead/Client | Party name | string |
| Case Type | Type of case | string |
| Lost Reason | Primary reason for loss | string |
| Lost Reason Category | price/competitor/timing/etc | string |
| Lost Reason Detail | Additional notes | string |
| Competitor | If lost to competitor | string |
| Stage When Lost | Pipeline stage at loss | string |
| Estimated Value | Value of lost deal | currency |
| Days in Pipeline | Time from intake to loss | number |
| Sales Person | Assigned sales person | string |
| Lost Date | When marked lost | date |

**Summary View:**
| Metric | Description |
|--------|-------------|
| Total Lost | Count of lost opportunities |
| Total Value Lost | Sum of estimated values |
| Top Lost Reason | Most common reason |
| Top Competitor | Most frequent competitor |
| Avg Days to Loss | Average time before losing |

**Charts:**
- Lost reasons pie chart
- Lost value by reason bar chart
- Lost by stage breakdown
- Competitor win/loss comparison
- Monthly lost trend

**File:** `src/features/crm/components/reports/lost-opportunity-report.tsx`

---

### 5.5 Sales Pipeline Analytics Report (HIGH PRIORITY)

**Purpose:** Pipeline health by stage/owner - understand deal flow

**Route:** `/dashboard/crm/reports/sales-pipeline`
**API:** `GET /api/reports/crm/sales-pipeline`

**By Stage View:**
| Column | Description | Type |
|--------|-------------|------|
| Stage | Pipeline stage name | string |
| Count | Number of cases | number |
| Value | Total estimated value | currency |
| Weighted Value | Value × Probability | currency |
| Avg Age | Average days in stage | number |
| Stuck Count | Cases > threshold days | number |

**By Owner View:**
| Column | Description | Type |
|--------|-------------|------|
| Sales Person | Owner name | string |
| Intake | Count in Intake | number |
| Qualified | Count in Qualified | number |
| Proposal | Count in Proposal Sent | number |
| Negotiation | Count in Negotiation | number |
| Total Value | Sum of all values | currency |
| Weighted Pipeline | Sum of weighted values | currency |

**Monthly/Quarterly View:**
| Column | Description | Type |
|--------|-------------|------|
| Period | Month/Quarter | string |
| New Cases | Cases created | number |
| Won Cases | Cases won | number |
| Lost Cases | Cases lost | number |
| Win Rate | Won / (Won + Lost) | percentage |
| New Value | Value of new cases | currency |
| Won Value | Value of won cases | currency |

**Charts:**
- Pipeline funnel visualization
- Stacked bar chart by stage
- Pipeline value trend over time
- Stage conversion waterfall
- Deal age distribution

**File:** `src/features/crm/components/reports/sales-pipeline-analytics-report.tsx`

---

### 5.6 Prospects Engaged Not Converted Report (MEDIUM PRIORITY)

**Purpose:** Identify re-engagement targets - warm leads that went cold

**Route:** `/dashboard/crm/reports/prospects-engaged`
**API:** `GET /api/reports/crm/prospects-engaged`

**Columns:**
| Column | Description | Type |
|--------|-------------|------|
| Lead Name | Lead display name | string |
| Company | Organization name | string |
| Email | Contact email | string |
| Phone | Contact phone | string |
| Lead Source | How they found you | string |
| Last Activity Type | email/call/meeting/etc | string |
| Last Activity Date | When last contacted | date |
| Days Since Contact | Days since last activity | number |
| Total Interactions | Count of all activities | number |
| Lead Score | Current lead score | number |
| Assigned To | Sales Person | string |
| Status | Current lead status | string |

**Filters:**
- Days since last contact (default: 60)
- Minimum interactions (default: 2)
- Lead Source
- Sales Person
- Lead Score range

**Actions:**
- Bulk assign to Sales Person
- Add to campaign
- Schedule follow-up
- Mark as disqualified

**File:** `src/features/crm/components/reports/prospects-engaged-report.tsx`

---

### 5.7 Lead Conversion Time Report (MEDIUM PRIORITY)

**Purpose:** Measure sales cycle length - how long to convert leads

**Route:** `/dashboard/crm/reports/lead-conversion-time`
**API:** `GET /api/reports/crm/lead-conversion-time`

**Columns:**
| Column | Description | Type |
|--------|-------------|------|
| Client Name | Converted client name | string |
| Original Lead | Source lead | string |
| Lead Created | When lead was created | date |
| Case Created | When case was created | date |
| Won Date | When case was won | date |
| Days: Lead → Case | Time to create case | number |
| Days: Case → Won | Time to win case | number |
| Total Days | Lead to Won | number |
| Interactions | Total touchpoints | number |
| Case Type | Type of won case | string |
| Won Value | Value of won case | currency |
| Sales Person | Who won the deal | string |

**Summary View:**
| Metric | Description |
|--------|-------------|
| Avg Lead → Case | Average days |
| Avg Case → Won | Average days |
| Avg Total Cycle | Average total days |
| Fastest Conversion | Minimum days |
| Slowest Conversion | Maximum days |

**Charts:**
- Conversion time distribution
- Trend over time
- By case type comparison
- By Sales Person comparison
- Correlation: Time vs Value

**File:** `src/features/crm/components/reports/lead-conversion-time-report.tsx`

---

### 5.8 Reports Summary

**Total New Reports:** 7

**Frontend Files:**
```
src/features/crm/components/reports/
├── campaign-efficiency-report.tsx
├── lead-owner-efficiency-report.tsx
├── first-response-time-report.tsx
├── lost-opportunity-report.tsx
├── sales-pipeline-analytics-report.tsx
├── prospects-engaged-report.tsx
└── lead-conversion-time-report.tsx
```

**API Endpoints:**
```
GET /api/reports/crm/campaign-efficiency
GET /api/reports/crm/lead-owner-efficiency
GET /api/reports/crm/first-response-time
GET /api/reports/crm/lost-opportunity
GET /api/reports/crm/sales-pipeline
GET /api/reports/crm/prospects-engaged
GET /api/reports/crm/lead-conversion-time
```

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

This plan adds **ERPNext CRM feature parity** while maintaining your law firm-specific features.

### Complete CRM Flow
```
Lead → Case → Quotation/Contract → Sales Order → Client
                                        ↓
                              (Finance Integration)
                                        ↓
                                    Invoice
```

### New Features by Priority

| Feature | ERPNext Equivalent | Priority | Status |
|---------|-------------------|----------|--------|
| Lead → Case → Client flow | Lead → Opportunity → Customer | **HIGH** | To implement |
| CRM Settings Page | CRM Settings | **HIGH** | To implement |
| CRM Setup Wizard (13 steps) | Module Onboarding | **HIGH** | To implement |
| Sales Stage Master | Sales Stage | **HIGH** | To implement |
| Lost Opportunity Analysis Report | Opportunity Lost Reason | **HIGH** | To implement |
| Campaign Efficiency Report | UTM Analytics | **HIGH** | To implement |
| Lead Owner Efficiency Report | Sales Person Performance | **HIGH** | To implement |
| First Response Time Report | Response Analytics | **HIGH** | To implement |
| Sales Pipeline Analytics | Pipeline Reports | **HIGH** | To implement |
| Contract Management | Contract | **HIGH** | To enhance |
| Territory Management | Territory | MEDIUM | To implement |
| Sales Person Hierarchy | Sales Person | MEDIUM | To implement |
| Appointment Booking | Appointment | MEDIUM | To implement |
| Prospects Engaged Report | Re-engagement | MEDIUM | To implement |
| Lead Conversion Time Report | Conversion Analytics | MEDIUM | To implement |
| Competitor tracking | Competitor | MEDIUM | To implement |

### ERPNext Settings Parity

| ERPNext Setting | Our Implementation | Status |
|-----------------|-------------------|--------|
| Allow Lead Duplication | `leadSettings.allowDuplicateEmails` | ✅ Planned |
| Auto Creation of Contact | `leadSettings.autoCreateContact` | ✅ Planned |
| Close Opportunity After Days | `caseSettings.autoCloseAfterDays` | ✅ Planned |
| Default Quotation Valid Till | `quoteSettings.defaultValidDays` | ✅ Planned |
| Carry Forward Communication | `communicationSettings.carryForwardCommunication` | ✅ Planned |
| Update Timestamp on Communication | `communicationSettings.updateTimestampOnCommunication` | ✅ Planned |
| Campaign Naming By | `namingSettings.campaignNamingBy` | ✅ Planned |
| Enable Scheduling | `appointmentSettings.enabled` | ✅ Planned |
| Appointment Duration | `appointmentSettings.defaultDuration` | ✅ Planned |
| Advance Booking Days | `appointmentSettings.advanceBookingDays` | ✅ Planned |
| Agent List | `appointmentSettings.agentList` | ✅ Planned |
| Holiday List | `appointmentSettings.holidayListId` | ✅ Planned |

### Implementation Totals

| Category | Count |
|----------|-------|
| New Models/Types | 10 |
| New Components | ~45 |
| New Routes | ~25 |
| New API Endpoints | ~40 |
| New Reports | 7 |
| CRM Wizard Steps | 13 |
| CRM Settings Sections | 9 |

### Unique Saudi/Law Firm Features (Preserved)

These features make your CRM unique compared to ERPNext:

- NAJIZ Integration
- National ID / Iqama / CR validation
- Arabic Quaternary Name support
- Saudi National Address
- Conflict Check per Case
- BANT Qualification per Case
- VIP Status
- WhatsApp Integration
- Lead Scoring
- Referral System

Ready to implement when you give the go-ahead!
