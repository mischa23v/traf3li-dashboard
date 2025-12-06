# Backend Instructions: CRM & Sales API Specification

## Overview

The CRM & Sales module provides comprehensive customer relationship management for Saudi law firms. It includes lead management, contact tracking, organization management, staff profiles, referral tracking, and activity logging.

**Key Features**:
- Lead scoring with BANT qualification
- Conflict of interest checking (critical for law firms)
- Saudi-specific identification (National ID, Iqama, CR, VAT)
- Multi-language support (Arabic/English)
- Pipeline management with Kanban view
- Referral tracking with tiered commissions
- Activity timeline with visual logging

**Currency Note**: All monetary values are stored in **halalas** (SAR × 100). For example, 500 SAR = 50000 halalas.

---

## Data Models

### Contact Model

```typescript
interface Contact {
  _id: string                    // MongoDB ObjectId

  // Basic Info
  salutation?: string            // 'mr' | 'mrs' | 'ms' | 'dr' | 'eng' | 'prof' | 'sheikh' | 'his_excellency'
  firstName: string              // Required
  middleName?: string
  lastName: string               // Required
  preferredName?: string         // Nickname/preferred name
  suffix?: string
  fullNameArabic?: string        // Arabic full name

  // Type & Classification
  type: string                   // 'individual' | 'organization' | 'court' | 'attorney' | 'expert' | 'government' | 'other'
  primaryRole?: string           // 'client_contact' | 'opposing_party' | 'opposing_counsel' | 'witness' | 'expert_witness' | 'judge' | 'court_clerk' | 'mediator' | 'arbitrator' | 'referral_source' | 'vendor' | 'other'
  relationshipTypes?: string[]   // Multiple: 'current_client' | 'former_client' | 'prospect' | 'adverse_party' | 'related_party' | 'referral_source' | 'business_contact' | 'personal_contact'

  // Contact Information
  email?: string                 // Primary email
  phone?: string                 // Primary phone
  emails?: Array<{
    type: string                 // 'work' | 'personal' | 'other'
    email: string
    isPrimary: boolean
    canContact: boolean
  }>
  phones?: Array<{
    type: string                 // 'mobile' | 'work' | 'home' | 'fax' | 'other'
    number: string
    countryCode: string          // Default: '+966'
    isPrimary: boolean
    canSMS: boolean
    canWhatsApp: boolean
  }>

  // Employment/Affiliation
  company?: string               // Company name (text)
  organizationId?: string        // Link to Organization record
  title?: string                 // Job title
  department?: string

  // Saudi-Specific Identification
  nationalId?: string            // 10-digit Saudi National ID
  iqamaNumber?: string           // Resident ID for non-Saudis
  passportNumber?: string
  passportCountry?: string
  dateOfBirth?: string           // ISO date
  nationality?: string           // Default: 'سعودي'

  // Address
  address?: string               // Street address
  buildingNumber?: string
  district?: string              // حي
  city?: string
  province?: string              // منطقة
  postalCode?: string
  country?: string               // Default: 'المملكة العربية السعودية'

  // Communication Preferences
  preferredLanguage?: string     // 'ar' | 'en'
  preferredContactMethod?: string // 'email' | 'phone' | 'sms' | 'whatsapp' | 'in_person'
  bestTimeToContact?: string     // Free text
  doNotContact?: boolean         // Complete contact block
  doNotEmail?: boolean
  doNotCall?: boolean
  doNotSMS?: boolean

  // Conflict Check (CRITICAL for law firms)
  conflictCheckStatus: string    // 'not_checked' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflictNotes?: string
  conflictCheckDate?: string     // ISO date
  conflictCheckedBy?: string     // User ID

  // Status & Priority
  status: string                 // 'active' | 'inactive' | 'archived' | 'deceased'
  priority?: string              // 'low' | 'normal' | 'high' | 'vip'
  vipStatus?: boolean

  // Risk Assessment
  riskLevel?: string             // 'low' | 'medium' | 'high'
  isBlacklisted?: boolean
  blacklistReason?: string

  // Tags & Categories
  tags?: string[]
  practiceAreas?: string[]       // Related legal practice areas

  // Notes
  notes?: string

  // Linked Entities
  linkedCases?: string[]         // Array of Case IDs
  linkedClients?: string[]       // Array of Client IDs

  // Audit
  createdAt: string              // ISO datetime
  updatedAt: string              // ISO datetime
  createdBy?: string             // User ID
  updatedBy?: string             // User ID
}
```

### Organization Model

```typescript
interface Organization {
  _id: string                    // MongoDB ObjectId

  // Legal Names
  legalName: string              // Official legal name (English)
  legalNameAr?: string           // Official legal name (Arabic)
  tradeName?: string             // Trading/Brand name
  tradeNameAr?: string           // Trading name (Arabic)

  // Entity Type
  type: string                   // 'llc' | 'joint_stock' | 'partnership' | 'sole_proprietorship' | 'branch' | 'government' | 'nonprofit' | 'professional' | 'holding' | 'other'
  status: string                 // 'active' | 'inactive' | 'suspended' | 'dissolved' | 'pending'

  // Industry & Classification
  industry?: string              // Industry sector
  subIndustry?: string
  size?: string                  // 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  employeeCount?: number

  // Saudi Registration (CRITICAL)
  commercialRegistration?: string    // رقم السجل التجاري (10 digits)
  crIssueDate?: string              // ISO date
  crExpiryDate?: string             // ISO date
  crIssuingCity?: string
  vatNumber?: string                // الرقم الضريبي (15 digits starting with 3)
  unifiedNumber?: string            // الرقم الموحد (700 number)
  municipalLicense?: string         // رخصة البلدية
  chamberMembership?: string        // عضوية الغرفة التجارية

  // Contact Information
  phone?: string
  fax?: string
  email?: string
  website?: string

  // Address
  address?: string
  buildingNumber?: string
  district?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  nationalAddress?: string       // العنوان الوطني (Saudi National Address)
  poBox?: string

  // Corporate Structure
  parentCompany?: string         // Parent company name or ID
  subsidiaries?: string[]        // Array of subsidiary names/IDs
  foundedDate?: string           // ISO date

  // Financial Information (all in halalas)
  capital?: number               // رأس المال
  annualRevenue?: number
  creditLimit?: number
  paymentTerms?: number          // Days (e.g., 30, 60, 90)

  // Banking Information
  bankName?: string
  iban?: string                  // SA + 22 characters
  accountHolderName?: string
  swiftCode?: string

  // Billing Preferences
  billingType?: string           // 'hourly' | 'fixed' | 'contingency' | 'retainer'
  preferredPaymentMethod?: string // 'bank_transfer' | 'check' | 'cash' | 'credit_card'
  billingCycle?: string          // 'monthly' | 'quarterly' | 'upon_completion'
  billingEmail?: string
  billingContact?: string        // Contact ID for billing

  // Conflict Check
  conflictCheckStatus: string    // 'not_checked' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflictNotes?: string

  // Key Contacts
  keyContacts?: Array<{
    contactId: string            // Contact ID
    role: string                 // e.g., 'CEO', 'Legal Counsel', 'Procurement'
    isPrimary: boolean
  }>

  // Tags & Categories
  tags?: string[]
  practiceAreas?: string[]

  // Notes
  notes?: string
  description?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
```

### Staff Model

```typescript
interface Staff {
  _id: string                    // MongoDB ObjectId

  // Basic Info
  salutation?: string
  firstName: string
  middleName?: string
  lastName: string
  fullName?: string              // Computed
  preferredName?: string

  // Contact
  email: string                  // Login email (required, unique)
  workEmail?: string             // Work email if different
  phone?: string
  mobilePhone?: string
  officePhone?: string
  extension?: string

  // Role & Status
  role: string                   // 'partner' | 'senior_associate' | 'associate' | 'junior_associate' | 'paralegal' | 'legal_secretary' | 'admin' | 'intern' | 'of_counsel'
  status: string                 // 'active' | 'inactive' | 'on_leave' | 'terminated' | 'probation'
  employmentType?: string        // 'full_time' | 'part_time' | 'contract' | 'consultant'

  // Department & Reporting
  department?: string
  reportsTo?: string             // Manager's Staff ID
  officeLocation?: string

  // Dates
  hireDate?: string              // ISO date
  startDate?: string             // ISO date (if different from hire)
  terminationDate?: string       // ISO date

  // Bar Licenses (CRITICAL for attorneys)
  barLicenses?: Array<{
    jurisdiction: string         // e.g., 'المملكة العربية السعودية', 'New York'
    barNumber: string
    status: string               // 'active' | 'inactive' | 'suspended' | 'pending'
    admissionDate?: string       // ISO date
    expiryDate?: string          // ISO date
    isGoodStanding: boolean
  }>

  // Practice Areas
  practiceAreas?: Array<{
    name: string                 // e.g., 'قانون الشركات', 'التقاضي'
    isPrimary: boolean
    yearsExperience?: number
  }>

  // Education
  education?: Array<{
    degree: string               // e.g., 'بكالوريوس قانون', 'ماجستير'
    institution: string
    field?: string
    year?: number
  }>

  // Certifications
  certifications?: Array<{
    name: string
    issuingBody: string
    issueDate?: string           // ISO date
    expiryDate?: string          // ISO date
    credentialId?: string
  }>

  // Languages
  languages?: Array<{
    language: string             // e.g., 'العربية', 'English'
    proficiency: string          // 'native' | 'fluent' | 'professional' | 'conversational' | 'basic'
  }>

  // Billing Rates (all in halalas per hour)
  hourlyRate?: number            // Default rate
  standardRate?: number          // Standard billing rate
  discountedRate?: number        // For certain clients
  premiumRate?: number           // For urgent/specialized work
  costRate?: number              // Internal cost rate

  // Billing Targets
  billableHoursTarget?: number   // Annual target hours
  revenueTarget?: number         // Annual revenue target (halalas)
  utilizationTarget?: number     // Percentage (e.g., 80)

  // Billing Permissions
  canBillTime?: boolean          // Default: true for attorneys
  canApproveTime?: boolean
  canViewRates?: boolean
  canEditRates?: boolean

  // Bio & Notes
  bio?: string                   // Professional bio
  notes?: string

  // Tags
  tags?: string[]

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
```

### Lead Model

```typescript
interface Lead {
  _id: string                    // MongoDB ObjectId

  // Basic Info
  firstName: string
  lastName: string
  displayName?: string           // Computed: firstName + lastName
  email?: string
  phone?: string
  alternatePhone?: string
  whatsapp?: string

  // Company/Organization
  company?: string
  jobTitle?: string

  // Source & Attribution
  source: string                 // 'website' | 'referral' | 'social_media' | 'advertising' | 'cold_call' | 'walk_in' | 'event' | 'other'
  sourceDetails?: string
  referralId?: string            // If source is 'referral', link to Referral
  campaign?: string              // Marketing campaign

  // Status & Stage
  status: string                 // 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'dormant'
  probability?: number           // 0-100 percentage

  // Value & Timeline (in halalas)
  estimatedValue?: number
  expectedCloseDate?: string     // ISO date
  actualCloseDate?: string       // ISO date (when won/lost)

  // Lead Scoring (0-150 points)
  leadScore?: number             // Computed from BANT + other factors
  scoreBreakdown?: {
    budgetScore: number          // 0-30 points
    authorityScore: number       // 0-30 points
    needScore: number            // 0-30 points
    timelineScore: number        // 0-30 points
    engagementScore: number      // 0-15 points
    fitScore: number             // 0-15 points
  }

  // BANT Qualification
  qualification?: {
    budget?: string              // 'premium' | 'high' | 'medium' | 'low' | 'unknown'
    budgetAmount?: number        // Specific amount in halalas
    budgetNotes?: string

    authority?: string           // 'decision_maker' | 'influencer' | 'researcher' | 'unknown'
    authorityNotes?: string

    need?: string                // 'urgent' | 'planning' | 'exploring' | 'unknown'
    needDescription?: string

    timeline?: string            // 'immediate' | 'this_month' | 'this_quarter' | 'this_year' | 'unknown'
    timelineNotes?: string
  }

  // Intake Information
  intake?: {
    caseType?: string            // Type of legal matter
    caseDescription?: string
    urgency?: string             // 'urgent' | 'high' | 'normal' | 'low'
    conflictCheckCompleted?: boolean
    conflictCheckDate?: string
    conflictCheckNotes?: string
    preferredContactMethod?: string
    preferredContactTime?: string
  }

  // Competition Tracking
  competition?: {
    competitorNames?: string[]
    competitorNotes?: string
    ourAdvantages?: string
    theirAdvantages?: string
  }

  // Assignment
  assignedTo?: string            // Staff ID
  assignedAt?: string            // ISO datetime

  // Address
  address?: {
    street?: string
    city?: string
    province?: string
    postalCode?: string
    country?: string
  }

  // Tags & Categories
  tags?: string[]
  practiceArea?: string

  // Notes
  notes?: string

  // Conversion (when lead becomes client)
  convertedToClient?: boolean
  clientId?: string              // Client ID after conversion
  convertedAt?: string           // ISO datetime
  convertedBy?: string           // Staff ID

  // Activity Tracking
  lastContactDate?: string       // ISO datetime
  nextFollowUpDate?: string      // ISO datetime
  activityCount?: number         // Total activities
  daysSinceCreated?: number      // Computed
  daysSinceContact?: number      // Computed

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
```

### Referral Model

```typescript
interface Referral {
  _id: string                    // MongoDB ObjectId

  // Referrer Information
  referrerType: string           // 'individual' | 'organization' | 'employee' | 'client'
  referrerName: string
  referrerContactId?: string     // Contact ID if exists
  referrerOrganizationId?: string // Organization ID if applicable
  referrerEmail?: string
  referrerPhone?: string

  // Referred Lead/Client
  referredLeadId?: string        // Lead ID
  referredClientId?: string      // Client ID (if converted)
  referredName: string
  referredEmail?: string
  referredPhone?: string

  // Referral Details
  referralDate: string           // ISO date
  status: string                 // 'pending' | 'contacted' | 'qualified' | 'converted' | 'rejected' | 'expired'
  source?: string                // How referrer heard about us
  notes?: string

  // Practice Area
  practiceArea?: string
  caseType?: string
  estimatedValue?: number        // In halalas

  // Commission/Fee Structure
  agreementType?: string         // 'percentage' | 'fixed' | 'tiered' | 'none'
  feePercentage?: number         // If percentage (e.g., 10 for 10%)
  fixedFee?: number              // In halalas
  tieredFees?: Array<{
    minValue: number             // Min case value (halalas)
    maxValue: number             // Max case value (halalas)
    percentage: number           // Commission percentage
  }>

  // Payment Tracking
  commissionStatus?: string      // 'pending' | 'approved' | 'paid' | 'void'
  commissionAmount?: number      // Calculated amount (halalas)
  paidAmount?: number            // Amount already paid (halalas)
  paidDate?: string              // ISO date
  paymentMethod?: string
  paymentReference?: string

  // Agreement
  hasAgreement?: boolean
  agreementDate?: string         // ISO date
  agreementExpiryDate?: string   // ISO date
  agreementDocument?: string     // File URL

  // Banking (for commission payment)
  bankName?: string
  iban?: string
  accountHolderName?: string

  // Assignment
  assignedTo?: string            // Staff ID handling this referral

  // Tracking
  followUpDate?: string          // ISO date
  lastContactDate?: string       // ISO datetime

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
```

### Activity Model

```typescript
interface CrmActivity {
  _id: string                    // MongoDB ObjectId

  // Activity Type
  type: string                   // 'call' | 'email' | 'sms' | 'whatsapp' | 'meeting' | 'note' | 'task' | 'document' | 'proposal' | 'status_change' | 'stage_change' | 'lead_created' | 'lead_converted'

  // Related Entity
  entityType: string             // 'lead' | 'client' | 'contact' | 'organization' | 'case'
  entityId: string               // ID of related entity
  entityName?: string            // Display name for quick reference

  // Basic Info
  title: string
  titleAr?: string               // Arabic title
  description?: string
  status?: string                // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

  // Call-specific data
  callData?: {
    direction: 'inbound' | 'outbound'
    phoneNumber?: string
    duration?: number            // In seconds
    outcome?: string             // 'connected' | 'no_answer' | 'busy' | 'voicemail' | 'wrong_number' | 'callback_requested'
    recordingUrl?: string
  }

  // Meeting-specific data
  meetingData?: {
    meetingType?: string         // 'in_person' | 'video' | 'phone' | 'consultation'
    location?: string
    isVirtual?: boolean
    meetingLink?: string
    scheduledStart?: string      // ISO datetime
    scheduledEnd?: string        // ISO datetime
    actualStart?: string         // ISO datetime
    actualEnd?: string           // ISO datetime
    attendees?: string[]         // Array of contact/staff IDs
    agenda?: string
    summary?: string
    outcome?: string
  }

  // Email-specific data
  emailData?: {
    subject?: string
    from?: string
    to?: string[]
    cc?: string[]
    bcc?: string[]
    body?: string                // HTML or plain text
    attachments?: Array<{
      name: string
      url: string
      size: number
    }>
    messageId?: string           // Email Message-ID for threading
    threadId?: string
  }

  // SMS/WhatsApp data
  messageData?: {
    phoneNumber: string
    content: string
    direction: 'inbound' | 'outbound'
    deliveryStatus?: string      // 'sent' | 'delivered' | 'read' | 'failed'
  }

  // Task-specific data
  taskData?: {
    dueDate?: string             // ISO date
    priority?: string            // 'low' | 'normal' | 'high' | 'urgent'
    assignedTo?: string          // Staff ID
    completedAt?: string         // ISO datetime
  }

  // Document-specific data
  documentData?: {
    documentType?: string        // 'contract' | 'proposal' | 'letter' | 'other'
    fileName?: string
    fileUrl?: string
    fileSize?: number
  }

  // Performer
  performedBy?: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }

  // Scheduling
  scheduledAt?: string           // ISO datetime
  completedAt?: string           // ISO datetime

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
```

---

## API Endpoints

### Contacts API

#### 1. GET `/api/contacts`

Fetch contacts with filters and pagination.

**Query Parameters:**
```typescript
{
  // Pagination
  page?: number                  // Default: 1
  limit?: number                 // Default: 20, Max: 100

  // Filters
  type?: string                  // Contact type
  status?: string                // active | inactive | archived
  primaryRole?: string
  search?: string                // Search in name, email, phone
  organizationId?: string        // Filter by organization
  conflictCheckStatus?: string
  vipStatus?: boolean
  tags?: string[]                // Filter by tags

  // Sorting
  sortBy?: string                // 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}
```

**Response:**
```typescript
{
  success: true,
  data: Contact[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### 2. GET `/api/contacts/:id`

Fetch single contact by ID.

**Response:**
```typescript
{
  success: true,
  data: Contact
}
```

#### 3. POST `/api/contacts`

Create new contact.

**Request Body:** See Contact model above.

**Response:**
```typescript
{
  success: true,
  data: Contact
}
```

#### 4. PUT `/api/contacts/:id`

Update contact.

**Request Body:** Partial Contact model.

#### 5. DELETE `/api/contacts/:id`

Delete contact.

#### 6. DELETE `/api/contacts/bulk`

Bulk delete contacts.

**Request Body:**
```typescript
{
  ids: string[]
}
```

#### 7. GET `/api/contacts/search`

Search contacts with autocomplete.

**Query Parameters:**
```typescript
{
  q: string                      // Search query (min 2 chars)
  limit?: number                 // Default: 10
}
```

#### 8. POST `/api/contacts/:id/link-case`

Link contact to a case.

**Request Body:**
```typescript
{
  caseId: string,
  role?: string                  // Contact's role in the case
}
```

#### 9. DELETE `/api/contacts/:id/unlink-case/:caseId`

Unlink contact from case.

---

### Organizations API

#### 1. GET `/api/organizations`

Fetch organizations with filters.

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  type?: string                  // Entity type
  status?: string
  industry?: string
  search?: string                // Search in names, CR, VAT
  conflictCheckStatus?: string
  tags?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

#### 2. GET `/api/organizations/:id`

Fetch single organization.

#### 3. POST `/api/organizations`

Create organization.

**Request Body:** See Organization model.

#### 4. PUT `/api/organizations/:id`

Update organization.

#### 5. DELETE `/api/organizations/:id`

Delete organization.

#### 6. DELETE `/api/organizations/bulk`

Bulk delete organizations.

#### 7. GET `/api/organizations/search`

Search organizations with autocomplete.

---

### Staff API

#### 1. GET `/api/lawyers` (or `/api/staff`)

Fetch staff members.

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  role?: string                  // partner | associate | paralegal | etc.
  status?: string                // active | inactive | on_leave
  department?: string
  search?: string                // Search in name, email
  practiceArea?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

#### 2. GET `/api/lawyers/:id`

Fetch single staff member.

#### 3. POST `/api/lawyers`

Create staff member.

**Request Body:** See Staff model.

#### 4. PUT `/api/lawyers/:id`

Update staff member.

#### 5. DELETE `/api/lawyers/:id`

Delete staff member.

#### 6. GET `/api/lawyers/team`

Get active team members (for dropdowns).

**Response:**
```typescript
{
  success: true,
  data: Array<{
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    avatar?: string
  }>
}
```

---

### Leads API

#### 1. GET `/api/crm/leads`

Fetch leads with filters.

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  status?: string | string[]     // Lead status(es)
  source?: string
  assignedTo?: string            // Staff ID
  practiceArea?: string
  search?: string                // Search in name, email, phone, company
  minValue?: number              // Minimum estimated value (halalas)
  maxValue?: number
  createdAfter?: string          // ISO date
  createdBefore?: string         // ISO date
  tags?: string[]
  sortBy?: string                // 'createdAt' | 'estimatedValue' | 'leadScore' | 'expectedCloseDate'
  sortOrder?: 'asc' | 'desc'
}
```

**Response:**
```typescript
{
  success: true,
  data: Lead[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### 2. GET `/api/crm/leads/:id`

Fetch single lead with activities.

**Response:**
```typescript
{
  success: true,
  lead: Lead,
  activities: CrmActivity[]      // Recent activities for this lead
}
```

#### 3. POST `/api/crm/leads`

Create new lead.

**Request Body:** See Lead model.

**Response:**
```typescript
{
  success: true,
  lead: Lead
}
```

#### 4. PUT `/api/crm/leads/:id`

Update lead.

#### 5. DELETE `/api/crm/leads/:id`

Delete lead.

#### 6. PUT `/api/crm/leads/:id/status`

Update lead status.

**Request Body:**
```typescript
{
  status: string,                // New status
  notes?: string                 // Reason for change
}
```

#### 7. POST `/api/crm/leads/:id/convert`

Convert lead to client.

**Request Body:**
```typescript
{
  createCase?: boolean,          // Also create a case
  caseType?: string,
  assignedTo?: string
}
```

**Response:**
```typescript
{
  success: true,
  client: Client,
  case?: Case                    // If createCase was true
}
```

#### 8. POST `/api/crm/leads/:id/follow-up`

Schedule follow-up for lead.

**Request Body:**
```typescript
{
  date: string,                  // ISO date
  note?: string
}
```

#### 9. GET `/api/crm/leads/stats`

Get lead statistics for dashboard.

**Response:**
```typescript
{
  success: true,
  stats: {
    total: number,
    byStatus: Record<string, number>,
    bySource: Record<string, number>,
    totalValue: number,          // In halalas
    conversionRate: number,      // Percentage
    avgDaysToConvert: number,
    thisMonth: {
      new: number,
      converted: number,
      lost: number
    }
  }
}
```

---

### Pipeline API

#### 1. GET `/api/crm/pipeline`

Get leads grouped by stage for Kanban view.

**Query Parameters:**
```typescript
{
  assignedTo?: string,           // Filter by assignee
  practiceArea?: string,
  minValue?: number,
  maxValue?: number
}
```

**Response:**
```typescript
{
  success: true,
  pipeline: {
    new: Lead[],
    contacted: Lead[],
    qualified: Lead[],
    proposal: Lead[],
    negotiation: Lead[],
    won: Lead[],
    lost: Lead[]
  },
  analytics: {
    totalValue: number,          // In halalas
    weightedValue: number,       // Value × probability
    avgDealSize: number,
    avgTimeInPipeline: number,   // Days
    conversionRate: number       // Percentage
  }
}
```

#### 2. PUT `/api/crm/pipeline/move`

Move lead between stages (for drag-and-drop).

**Request Body:**
```typescript
{
  leadId: string,
  fromStage: string,
  toStage: string,
  position?: number              // Position within the stage
}
```

---

### Referrals API

#### 1. GET `/api/crm/referrals`

Fetch referrals with filters.

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  status?: string
  referrerType?: string
  commissionStatus?: string
  practiceArea?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

#### 2. GET `/api/crm/referrals/:id`

Fetch single referral.

#### 3. POST `/api/crm/referrals`

Create referral.

**Request Body:** See Referral model.

#### 4. PUT `/api/crm/referrals/:id`

Update referral.

#### 5. DELETE `/api/crm/referrals/:id`

Delete referral.

#### 6. PUT `/api/crm/referrals/:id/commission`

Update commission status.

**Request Body:**
```typescript
{
  status: string,                // 'approved' | 'paid' | 'void'
  paidAmount?: number,           // In halalas
  paymentMethod?: string,
  paymentReference?: string,
  notes?: string
}
```

#### 7. GET `/api/crm/referrals/stats`

Get referral statistics.

**Response:**
```typescript
{
  success: true,
  stats: {
    total: number,
    byStatus: Record<string, number>,
    totalCommissions: number,    // In halalas
    paidCommissions: number,
    pendingCommissions: number,
    conversionRate: number,
    topReferrers: Array<{
      name: string,
      count: number,
      totalValue: number
    }>
  }
}
```

---

### Activities API

#### 1. GET `/api/crm/activities`

Fetch activities (activity timeline).

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  entityType?: string            // 'lead' | 'client' | 'contact' | etc.
  entityId?: string
  types?: string[]               // Activity types
  status?: string
  performedBy?: string           // Staff ID
  startDate?: string             // ISO date
  endDate?: string               // ISO date
  sortBy?: string                // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc'     // Default: 'desc'
}
```

**Response:**
```typescript
{
  success: true,
  data: CrmActivity[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### 2. GET `/api/crm/activities/:id`

Fetch single activity.

**Response:**
```typescript
{
  success: true,
  activity: CrmActivity
}
```

#### 3. POST `/api/crm/activities`

Create activity (log an activity).

**Request Body:** See CrmActivity model.

#### 4. PUT `/api/crm/activities/:id`

Update activity.

#### 5. DELETE `/api/crm/activities/:id`

Delete activity.

#### 6. PUT `/api/crm/activities/:id/status`

Update activity status.

**Request Body:**
```typescript
{
  status: string                 // 'completed' | 'cancelled' | etc.
}
```

#### 7. GET `/api/crm/activities/stats`

Get activity statistics.

**Response:**
```typescript
{
  success: true,
  stats: {
    total: number,
    completed: number,
    byType: Array<{
      _id: string,               // Activity type
      count: number
    }>,
    byPerformer: Array<{
      _id: string,
      name: string,
      count: number
    }>,
    thisWeek: number,
    thisMonth: number
  }
}
```

---

## Conflict Checking Integration

Conflict checking is critical for law firms. The backend should implement:

### POST `/api/conflict-check`

Run a conflict check before accepting a new client/case.

**Request Body:**
```typescript
{
  // Entity to check
  entityType: 'contact' | 'organization' | 'lead',
  entityId?: string,             // If checking existing entity

  // Or search terms
  names?: string[],              // Names to check
  email?: string,
  phone?: string,
  nationalId?: string,
  commercialRegistration?: string,

  // Related parties
  relatedParties?: Array<{
    name: string,
    role: string                 // 'client' | 'opposing' | 'witness' | etc.
  }>
}
```

**Response:**
```typescript
{
  success: true,
  checkId: string,
  status: 'clear' | 'potential_conflict' | 'confirmed_conflict',
  matches: Array<{
    entityType: string,
    entityId: string,
    entityName: string,
    matchType: string,           // 'name' | 'email' | 'phone' | 'id' | 'related_party'
    matchScore: number,          // 0-100 confidence
    conflictReason?: string,
    caseNumbers?: string[]       // Related case numbers
  }>,
  checkedAt: string,
  checkedBy: string
}
```

---

## Error Responses

All endpoints should return consistent error responses:

```typescript
{
  success: false,
  error: {
    code: string,                // e.g., 'VALIDATION_ERROR', 'NOT_FOUND', 'CONFLICT'
    message: string,             // Human-readable message
    details?: any                // Additional error details
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid request data (400)
- `UNAUTHORIZED` - Not authenticated (401)
- `FORBIDDEN` - Not authorized (403)
- `NOT_FOUND` - Resource not found (404)
- `CONFLICT` - Resource conflict (409)
- `INTERNAL_ERROR` - Server error (500)

---

## Notes for Implementation

1. **All monetary values** are in halalas (SAR × 100)
2. **All dates** should be ISO 8601 format
3. **All IDs** are MongoDB ObjectId strings
4. **Arabic text** should be stored as-is (UTF-8)
5. **Phone numbers** should be stored with country code (e.g., +966512345678)
6. **Conflict checking** should be automatic when creating contacts/organizations
7. **Audit fields** (createdAt, updatedAt, createdBy, updatedBy) should be auto-populated
8. **Soft delete** is recommended for legal compliance - use `deletedAt` field
9. **Search** should support Arabic text and partial matching
10. **Pagination** should default to 20 items per page
