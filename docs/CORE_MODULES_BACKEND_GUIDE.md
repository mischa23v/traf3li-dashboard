# Core Legal ERP Modules - Backend Implementation Guide

**Last Updated:** December 25, 2025
**Status:** Verified against frontend code through deep scan

This guide covers the core legal ERP modules in the Traf3li Dashboard. All information has been verified against the actual frontend types, services, and hooks.

---

## Quick Reference

| Module | Base Route | Collections |
|--------|-----------|-------------|
| Auth | `/api/auth` (non-versioned) | users, sessions, tokens |
| Users | `/api/v1/users` | users |
| Clients | `/api/clients` | clients |
| Cases | `/api/cases` | cases |
| Invoices | `/api/v1/invoices` | invoices |
| HR | `/api/hr` | employees, leaves, attendance, payroll |
| CRM | `/api/crm` | leads, pipelines, referrals, activities |

---

## 1. Authentication Module

### Frontend Source Files
- Service: `src/services/authService.ts`
- Store: `src/stores/auth-store.ts` (Zustand)
- Types: Defined in authService.ts

### Important Notes
- **Auth routes are NOT versioned** - use `/api/auth/*`, NOT `/api/v1/auth/*`
- Supports dual token authentication (access + refresh tokens)
- Also sets HttpOnly cookie for backward compatibility

### API Endpoints (Required)

```
# Core Authentication
POST   /api/auth/login                       # Password-based login
POST   /api/auth/register                    # New user registration
POST   /api/auth/logout                      # Logout (clears tokens/cookies)
GET    /api/auth/me                          # Get current authenticated user
POST   /api/auth/refresh                     # Refresh access token

# OTP Authentication
POST   /api/auth/send-otp                    # Send OTP to email
POST   /api/auth/verify-otp                  # Verify OTP and login
POST   /api/auth/resend-otp                  # Resend OTP
GET    /api/auth/otp-status                  # Check OTP rate limit status

# Magic Link Authentication
POST   /api/auth/magic-link/send             # Send magic link email
POST   /api/auth/magic-link/verify           # Verify magic link token

# Email Verification
POST   /api/auth/email/send-verification     # Send verification email
POST   /api/auth/email/verify                # Verify email token
POST   /api/auth/email/resend-verification   # Resend verification email

# Availability Check
POST   /api/auth/check-availability          # Check email/username/phone availability
```

### User Schema

```typescript
interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  firstNameAr?: string
  lastNameAr?: string
  email: string
  role: 'client' | 'lawyer' | 'admin'
  image?: string
  country: string
  phone: string
  description?: string
  isSeller: boolean

  // Solo Lawyer Support
  isSoloLawyer?: boolean
  lawyerWorkMode?: 'solo' | 'firm_owner' | 'firm_member' | null

  // Firm-related (RBAC)
  firmId?: string
  firm?: {
    id: string
    name: string
    nameEn?: string
    status: 'active' | 'suspended' | 'inactive'
  } | null
  firmRole?: 'owner' | 'admin' | 'partner' | 'lawyer' | 'paralegal' | 'secretary' | 'accountant' | 'departed'
  firmStatus?: 'active' | 'departed' | 'suspended' | 'pending' | null

  // Multi-tenant
  tenant?: {
    id: string
    name: string
    nameEn?: string
    status: string
    subscription?: { plan: string; status: string }
  } | null

  // Permissions (for solo lawyers)
  permissions?: {
    modules?: Record<string, string>  // e.g., { clients: 'full', cases: 'read' }
    special?: Record<string, boolean> // e.g., { canApproveInvoices: true }
  } | null

  // Plan/Subscription
  plan?: 'free' | 'starter' | 'professional' | 'enterprise'
  planExpiresAt?: string | null
  trialEndsAt?: string | null
  maxUsers?: number
  features?: string[]

  // Lawyer Profile
  lawyerProfile?: {
    specialization: string[]
    licenseNumber?: string
    barAssociation?: string
    yearsExperience: number
    verified: boolean
    rating: number
    totalReviews: number
    casesWon: number
    casesTotal: number
    languages: string[]
    firmID?: string
  }

  // MFA
  mfaEnabled?: boolean
  mfaMethod?: 'totp' | 'sms' | 'email' | null
  mfaRequired?: boolean
  mfaPending?: boolean

  // Email Verification
  isEmailVerified?: boolean
  emailVerifiedAt?: string | null

  // Timestamps
  createdAt: string
  updatedAt: string
}
```

### Login Response Format

```typescript
interface LoginResponse {
  error: boolean
  message: string
  user?: User
  accessToken?: string   // JWT access token
  refreshToken?: string  // JWT refresh token
}
```

### Dual Token Authentication

The frontend expects:
1. **Access Token**: Short-lived (e.g., 15 minutes), stored in memory
2. **Refresh Token**: Long-lived (e.g., 7 days), stored in localStorage
3. **HttpOnly Cookie**: For backward compatibility

Token refresh flow:
- When access token expires (401 response), automatically call `/api/auth/refresh`
- If refresh succeeds, retry the original request
- If refresh fails, redirect to login

---

## 2. Clients Module

### Frontend Source Files
- Service: `src/services/clientsService.ts`
- Hooks: `src/hooks/use-clients.ts`
- Types: Defined in clientsService.ts + `src/types/najiz.ts`

### API Endpoints (Required)

```
# Core CRUD
GET    /api/clients                          # Query: status, clientType, search, page, limit, sortBy, sortOrder
GET    /api/clients/:id                      # Returns client with relatedData and summary
POST   /api/clients                          # Create client
PUT    /api/clients/:id                      # Update client
DELETE /api/clients/:id                      # Delete client

# Search & Stats
GET    /api/clients/search                   # Query: q (search term)
GET    /api/clients/stats                    # Client statistics
GET    /api/clients/top-revenue              # Query: limit (default 10)
DELETE /api/clients/bulk                     # Body: { clientIds: string[] }

# Related Data
GET    /api/clients/:id/cases                # Client's cases
GET    /api/clients/:id/invoices             # Client's invoices
GET    /api/clients/:id/payments             # Client's payments
GET    /api/clients/:id/billing-info         # Client billing info

# Verification (Saudi-specific)
POST   /api/clients/:id/verify/wathq         # Verify company via Wathq (CR verification)
GET    /api/clients/:id/wathq/:dataType      # Get Wathq data by type
POST   /api/clients/:id/verify/absher        # Verify identity via Absher/NIC
POST   /api/clients/:id/verify/address       # Verify national address via Saudi Post

# Attachments
POST   /api/clients/:id/attachments          # Upload files (multipart/form-data)
DELETE /api/clients/:id/attachments/:attachmentId

# Conflict Check
POST   /api/clients/:id/conflict-check       # Run conflict check

# Status Updates
PATCH  /api/clients/:id/status               # Body: { status: string }
PATCH  /api/clients/:id/flags                # Body: flag updates

# Reference Data
GET    /api/clients/regions                  # Saudi regions with cities
```

### Client Schema

```typescript
interface Client {
  _id: string
  clientNumber?: string
  clientType?: 'individual' | 'company'
  lawyerId?: string

  // ─── Name Fields (Individual) ───
  fullNameArabic?: string
  fullNameEnglish?: string
  firstName?: string
  middleName?: string
  lastName?: string
  preferredName?: string
  salutation?: string
  suffix?: string

  // ─── Arabic Name (الاسم الرباعي) - Najiz ───
  arabicName?: ArabicName  // See Najiz types below
  salutationAr?: string

  // ─── Company Fields ───
  companyName?: string
  companyNameEnglish?: string
  companyNameAr?: string
  crNumber?: string           // Commercial Registration (10 digits)
  unifiedNumber?: string      // 700 number
  vatNumber?: string          // VAT number (15 digits, starts with 3)
  municipalityLicense?: string
  chamberNumber?: string
  legalForm?: string
  legalFormAr?: string
  capital?: number
  capitalCurrency?: string
  establishmentDate?: string
  crExpiryDate?: string

  // ─── Authorized Person (Company) ───
  authorizedPerson?: string
  authorizedPersonAr?: string
  authorizedPersonTitle?: string
  authorizedPersonIdentityType?: NajizIdentityType
  authorizedPersonIdentityNumber?: string

  // ─── Contact Info ───
  email?: string
  phone?: string
  alternatePhone?: string
  whatsapp?: string
  fax?: string
  website?: string

  // ─── Identity Information (Najiz) ───
  identityType?: NajizIdentityType  // 'national_id' | 'iqama' | 'gcc_id' | 'passport' | 'border_number' | 'visitor_id'
  nationalId?: string        // Saudi ID (10 digits, starts with 1)
  iqamaNumber?: string       // Iqama (10 digits, starts with 2)
  gccId?: string
  gccCountry?: 'SA' | 'AE' | 'KW' | 'BH' | 'OM' | 'QA'
  borderNumber?: string
  visitorId?: string
  passportNumber?: string
  passportCountry?: string
  passportIssueDate?: string
  passportExpiryDate?: string
  passportIssuePlace?: string
  identityIssueDate?: string
  identityExpiryDate?: string
  identityIssuePlace?: string

  // ─── Personal Details (Najiz) ───
  dateOfBirth?: string
  dateOfBirthHijri?: string  // Format: YYYY/MM/DD
  placeOfBirth?: string
  gender?: 'male' | 'female'
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
  nationality?: string
  nationalityCode?: string   // ISO 3166-1 alpha-3

  // ─── Sponsor (for Iqama holders) ───
  sponsor?: {
    name?: string
    nameAr?: string
    identityNumber?: string
    relationship?: string
  }

  // ─── National Address (العنوان الوطني) ───
  nationalAddress?: NationalAddress  // See Najiz types below
  workAddress?: NationalAddress
  poBox?: { number?: string; city?: string; postalCode?: string }
  headquartersAddress?: NationalAddress
  branchAddresses?: NationalAddress[]

  // ─── Legacy Address Fields ───
  address?: string | { city?: string; district?: string; street?: string; postalCode?: string }
  city?: string
  district?: string
  province?: string
  region?: string
  postalCode?: string
  country?: string

  // ─── Preferences ───
  notes?: string
  generalNotes?: string
  preferredContact?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredLanguage?: string
  language?: string
  bestTimeToContact?: string
  doNotContact?: boolean
  doNotEmail?: boolean
  doNotCall?: boolean
  doNotSMS?: boolean

  // ─── Status & Classification ───
  status?: 'active' | 'inactive' | 'archived' | 'pending'
  priority?: 'low' | 'normal' | 'high' | 'vip'
  vipStatus?: boolean
  tags?: string[]
  practiceAreas?: string[]

  // ─── Risk & Conflict ───
  riskLevel?: 'low' | 'medium' | 'high'
  isBlacklisted?: boolean
  blacklistReason?: string
  conflictCheckStatus?: 'not_checked' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflictNotes?: string
  conflictCheckDate?: string
  conflictCheckedBy?: string

  // ─── Billing & Balance ───
  billing?: { creditBalance: number; currency?: string }
  totalPaid?: number
  totalOutstanding?: number
  defaultBillingRate?: number
  billingCurrency?: string
  paymentTerms?: string

  // ─── Conversion Tracking ───
  convertedFromLead?: boolean
  convertedAt?: string
  leadId?: string

  // ─── Verification Status (Wathq/MOJ) ───
  isVerified?: boolean
  verificationSource?: string
  verifiedAt?: string
  verificationData?: any

  // ─── Timestamps ───
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}
```

### Najiz Types (Shared)

```typescript
// 4-Part Arabic Name Structure
interface ArabicName {
  firstName?: string       // الاسم الأول
  fatherName?: string      // اسم الأب
  grandfatherName?: string // اسم الجد
  familyName?: string      // اسم العائلة
  fullName?: string        // Auto-generated
}

// Saudi National Address Structure
interface NationalAddress {
  buildingNumber?: string    // 4 digits
  streetName?: string
  streetNameAr?: string
  district?: string
  districtAr?: string
  city?: string
  cityAr?: string
  region?: string
  regionAr?: string
  regionCode?: string        // 01-13
  postalCode?: string        // 5 digits
  additionalNumber?: string  // 4 digits
  unitNumber?: string
  shortAddress?: string      // XXXX9999 format
  latitude?: number
  longitude?: number
  isVerified?: boolean
  verifiedAt?: string
}

type NajizIdentityType =
  | 'national_id'   // Saudi National ID
  | 'iqama'         // Resident ID
  | 'gcc_id'        // GCC citizen ID
  | 'passport'
  | 'border_number'
  | 'visitor_id'
  | 'temporary_id'
  | 'diplomatic_id'
```

### Client Detail Response

```typescript
interface ClientDetail {
  client: Client
  relatedData: {
    cases: any[]
    invoices: any[]
    payments: any[]
  }
  summary: {
    totalCases: number
    totalInvoices: number
    totalInvoiced: number
    totalPaid: number
    outstandingBalance: number
  }
}
```

---

## 3. Cases Module

### Frontend Source Files
- Service: `src/services/casesService.ts`
- Hooks: `src/hooks/use-cases.ts`
- Types: Defined in casesService.ts

### API Endpoints

```
# Core CRUD - ✅ IMPLEMENTED
GET    /api/cases                            # Query: status, outcome, category, priority, lawyerId, clientId, dateFrom, dateTo, search, page, limit, sortBy, sortOrder
GET    /api/cases/:id                        # Get single case
POST   /api/cases                            # Create case
PATCH  /api/cases/:id                        # Update case

# Status Updates - ✅ IMPLEMENTED
PATCH  /api/cases/:id/status                 # Body: { status: CaseStatus }
PATCH  /api/cases/:id/outcome                # Body: { outcome: CaseOutcome }

# Notes - ✅ IMPLEMENTED (Add only)
POST   /api/cases/:id/note                   # Body: { text: string }

# Documents - ✅ IMPLEMENTED (Add only)
POST   /api/cases/:id/document               # Body: AddDocumentData

# Hearings - ✅ IMPLEMENTED (Add only)
POST   /api/cases/:id/hearing                # Body: AddHearingData

# ❌ NOT IMPLEMENTED - Use updateCase() instead
DELETE /api/cases/:id                        # Delete case
POST   /api/cases/:id/claim                  # Add claim
PATCH  /api/cases/:id/progress               # Update progress
PATCH  /api/cases/:id/notes/:noteId          # Update note
DELETE /api/cases/:id/notes/:noteId          # Delete note
PATCH  /api/cases/:id/hearings/:hearingId    # Update hearing
DELETE /api/cases/:id/hearings/:hearingId    # Delete hearing
PATCH  /api/cases/:id/claims/:claimId        # Update claim
DELETE /api/cases/:id/claims/:claimId        # Delete claim
POST   /api/cases/:id/timeline               # Add timeline event
PATCH  /api/cases/:id/timeline/:eventId      # Update timeline event
DELETE /api/cases/:id/timeline/:eventId      # Delete timeline event
GET    /api/cases/:id/audit                  # Audit history
GET    /api/cases/statistics                 # Global statistics

# Rich Documents (CKEditor) - ❌ NOT IMPLEMENTED
POST   /api/cases/:id/rich-documents
GET    /api/cases/:id/rich-documents
GET    /api/cases/:id/rich-documents/:docId
PATCH  /api/cases/:id/rich-documents/:docId
DELETE /api/cases/:id/rich-documents/:docId
GET    /api/cases/:id/rich-documents/:docId/versions
POST   /api/cases/:id/rich-documents/:docId/versions/:versionNumber/restore
GET    /api/cases/:id/rich-documents/:docId/export/pdf
GET    /api/cases/:id/rich-documents/:docId/export/latex
GET    /api/cases/:id/rich-documents/:docId/export/markdown

# Pipeline - ❌ NOT IMPLEMENTED
GET    /api/cases/pipeline
GET    /api/cases/pipeline/statistics
GET    /api/cases/pipeline/stages/:category
PATCH  /api/cases/:id/stage
PATCH  /api/cases/:id/end
```

### Case Schema

```typescript
type CaseStatus = 'active' | 'closed' | 'appeal' | 'settlement' | 'on-hold' | 'completed' | 'won' | 'lost' | 'settled'
type CaseOutcome = 'won' | 'lost' | 'settled' | 'ongoing'
type CasePriority = 'low' | 'medium' | 'high' | 'critical'
type CaseCategory = 'labor' | 'commercial' | 'civil' | 'criminal' | 'family' | 'administrative' | 'other'
type PartyType = 'individual' | 'company' | 'government'
type EntityType = 'court' | 'committee' | 'arbitration'

interface Case {
  _id: string

  // Basic Info
  title: string
  description?: string
  category: CaseCategory
  subCategory?: string
  startDate?: string
  endDate?: string
  filingDate?: string
  internalReference?: string

  // Parties
  lawyerId: LawyerRef | string
  clientId?: ClientRef | string
  clientName?: string
  clientPhone?: string
  contractId?: string

  // Plaintiff Details
  plaintiff?: IndividualParty | CompanyParty | GovernmentParty
  plaintiffType?: PartyType
  plaintiffUnifiedNumber?: string  // الرقم الوطني الموحد للمنشأة

  // Defendant Details
  defendant?: IndividualParty | CompanyParty | GovernmentParty
  defendantType?: PartyType
  defendantUnifiedNumber?: string

  // Case-Specific Details
  laborCaseDetails?: LaborCaseDetails
  laborCaseSpecific?: LaborCaseSpecificDetails
  personalStatusDetails?: PersonalStatusCaseDetails
  commercialDetails?: CommercialCaseDetails

  // Court/Committee Info
  courtDetails?: {
    entityType?: EntityType
    court?: string
    committee?: string
    arbitrationCenter?: string  // مركز التحكيم
    region?: string
    city?: string
    circuitNumber?: string
    judgeName?: string
  }
  caseNumber?: string
  court?: string
  judge?: string
  nextHearing?: string

  // Power of Attorney
  powerOfAttorney?: {
    poaNumber?: string
    poaDate?: string
    poaExpiry?: string
    poaScope?: 'general' | 'specific' | 'litigation'
    poaIssuer?: string  // كاتب العدل
  }

  // Team Assignment
  team?: {
    assignedLawyer?: string
    assistants?: string[]
  }

  // Case Subject & Legal Basis
  caseSubject?: string
  legalBasis?: string

  // Status & Progress
  status: CaseStatus
  outcome: CaseOutcome
  progress: number  // 0-100
  priority: CasePriority

  // Financial
  claimAmount: number
  expectedWinAmount: number

  // Arrays
  claims: Claim[]
  timeline: TimelineEvent[]
  notes: CaseNote[]
  documents: CaseDocument[]
  hearings: CaseHearing[]

  // Metadata
  source: 'platform' | 'external'
  createdAt: string
  updatedAt: string
}

interface Claim {
  _id?: string
  type: string
  amount: number
  period?: string
  description?: string
}

interface TimelineEvent {
  _id?: string
  event: string
  date: string
  type: 'court' | 'filing' | 'deadline' | 'general'
  status: 'upcoming' | 'completed'
}

interface CaseNote {
  _id?: string
  text: string
  date: string
}

interface CaseDocument {
  _id?: string
  filename: string
  url?: string
  fileKey?: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
  category: 'contract' | 'evidence' | 'correspondence' | 'judgment' | 'pleading' | 'other'
  bucket: 'general' | 'judgments'
  description?: string
}

interface CaseHearing {
  _id?: string
  date: string
  location: string
  notes?: string
  attended: boolean
}
```

### Party Types

```typescript
interface IndividualParty {
  type: 'individual'
  name?: string
  nationalId?: string  // Saudi ID (starts with 1) or Iqama (starts with 2)
  phone?: string
  email?: string
  address?: string
  city?: string
}

interface CompanyParty {
  type: 'company'
  companyName?: string
  crNumber?: string  // Commercial Registration (10 digits)
  address?: string
  city?: string
  representativeName?: string
  representativePosition?: string
}

interface GovernmentParty {
  type: 'government'
  entityName?: string
  representative?: string
}
```

---

## 4. Invoices Module

### Frontend Source Files
- Service: `src/services/invoiceService.ts`
- Hooks: `src/hooks/useFinance.ts`
- Types: Defined in invoiceService.ts + `src/types/finance-advanced.ts`

### API Endpoints

```
# Core CRUD - ✅ IMPLEMENTED
GET    /api/v1/invoices                      # Query: status, clientId, caseId, startDate, endDate, page, limit
GET    /api/v1/invoices/:id                  # Get single invoice
POST   /api/v1/invoices                      # Create invoice
PATCH  /api/v1/invoices/:id                  # Update invoice (uses PATCH, not PUT)
DELETE /api/v1/invoices/:id                  # Delete invoice

# Stats & Reports - ✅ IMPLEMENTED
GET    /api/v1/invoices/stats                # Invoice statistics
GET    /api/v1/invoices/overdue              # Overdue invoices
GET    /api/v1/invoices/billable-items       # Query: clientId, caseId
GET    /api/v1/invoices/open/:clientId       # Open invoices for client

# Actions - ✅ IMPLEMENTED
POST   /api/v1/invoices/:id/send             # Send to client (email)
POST   /api/v1/invoices/:id/record-payment   # Record payment
POST   /api/v1/invoices/:id/void             # Void invoice
POST   /api/v1/invoices/:id/duplicate        # Duplicate invoice
POST   /api/v1/invoices/:id/send-reminder    # Send payment reminder
POST   /api/v1/invoices/:id/convert-to-credit-note
POST   /api/v1/invoices/:id/apply-retainer   # Apply retainer balance

# Approval Workflow - ✅ IMPLEMENTED
POST   /api/v1/invoices/:id/submit-for-approval
POST   /api/v1/invoices/:id/approve
POST   /api/v1/invoices/:id/reject           # Body: { reason: string }

# ZATCA Integration (Saudi e-invoicing) - ✅ IMPLEMENTED
POST   /api/v1/invoices/:id/zatca/submit     # Submit to ZATCA
GET    /api/v1/invoices/:id/zatca/status     # Get submission status

# Export - ✅ IMPLEMENTED
GET    /api/v1/invoices/:id/pdf              # Export as PDF (Blob)
GET    /api/v1/invoices/:id/xml              # Export as XML/UBL 2.1 (Blob)

# Payment Confirmation (Webhook)
PATCH  /api/v1/invoices/confirm-payment      # Body: { invoiceId, paymentIntentId }

# ⚠️ MAY NOT EXIST - Check backend
GET    /api/v1/invoices/pending-approval
POST   /api/v1/invoices/:id/request-changes
POST   /api/v1/invoices/:id/escalate
POST   /api/v1/invoices/bulk-approve
GET    /api/v1/invoices/approval-config
PUT    /api/v1/invoices/approval-config
GET    /api/v1/invoices/pending-approvals-count
POST   /api/v1/invoices/:id/payment          # Create payment intent (Stripe)
```

### Invoice Schema

```typescript
type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'

interface Invoice {
  _id: string
  invoiceNumber: string
  caseId?: string
  contractId?: string
  lawyerId: string | { firstName: string; lastName: string; name?: string }
  clientId: string | { firstName: string; lastName: string; name?: string }
  items: InvoiceItem[]
  subtotal: number
  vatRate: number           // Usually 15 for Saudi VAT
  vatAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  notes?: string
  pdfUrl?: string
  history?: InvoiceHistory[]
  createdAt: string
  updatedAt: string
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceHistory {
  action: string
  performedBy: string
  timestamp: string
  details?: any
}
```

### Create Invoice Data

```typescript
interface CreateInvoiceData {
  clientId: string           // Required
  caseId?: string
  items: InvoiceItem[]       // Required, at least 1 item
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  dueDate: string            // Required
  notes?: string
}
```

### Record Payment Data

```typescript
interface RecordPaymentData {
  amount: number             // Required, must be > 0
  paymentDate: string        // Required
  paymentMethod: string      // Required: 'bank_transfer' | 'cash' | 'check' | 'card' | 'mada' | 'stc_pay' | 'apple_pay'
  reference?: string
}
```

### Invoice Stats Response

```typescript
interface InvoiceStats {
  total: number
  byStatus: Record<string, number>
  totalRevenue: number
  totalOutstanding: number
  averageInvoiceAmount: number
  averageDaysToPayment: number
}
```

---

## 5. HR Module

### Frontend Source Files
- Service: `src/services/hrService.ts`
- Hooks: `src/hooks/use-hr.ts`
- Types: `src/types/hr.ts` + hrService.ts

### API Endpoints

```
# Employees - ✅ IMPLEMENTED
GET    /api/hr/employees                     # Query: search, department, status, employeeType, manager
GET    /api/hr/employees/:id                 # Get single employee
POST   /api/hr/employees                     # Create employee
PUT    /api/hr/employees/:id                 # Update employee
DELETE /api/hr/employees/:id                 # Delete employee
GET    /api/hr/employees/stats               # Employee statistics
POST   /api/hr/employees/bulk-delete         # Body: { ids: string[] }
GET    /api/hr/options                       # Form options (departments, positions, etc.)

# Allowances - ✅ IMPLEMENTED
POST   /api/hr/employees/:id/allowances      # Add allowance
DELETE /api/hr/employees/:id/allowances/:allowanceId

# Documents - ✅ IMPLEMENTED
GET    /api/hr/employees/:id/documents       # List documents
POST   /api/hr/employees/:id/documents       # Upload document
DELETE /api/hr/employees/:id/documents/:docId
POST   /api/hr/employees/:id/documents/:docId/verify

# Leave Management
GET    /api/hr/leave-requests                # Query: employeeId, leaveType, status, startDate, endDate
GET    /api/hr/leave-requests/:id
POST   /api/hr/leave-requests
PUT    /api/hr/leave-requests/:id
DELETE /api/hr/leave-requests/:id
POST   /api/hr/leave-requests/:id/approve
POST   /api/hr/leave-requests/:id/reject     # Body: { reason: string }

# Attendance
GET    /api/hr/attendance                    # Query: employeeId, date, startDate, endDate, status
GET    /api/hr/attendance/:id
POST   /api/hr/attendance
PUT    /api/hr/attendance/:id
POST   /api/hr/attendance/bulk-check-in      # Body: { employeeIds: string[], time: string }
POST   /api/hr/attendance/bulk-check-out

# Payroll
GET    /api/hr/payroll                       # Query: month, year, status
GET    /api/hr/payroll/:id
POST   /api/hr/payroll                       # Create payroll run
POST   /api/hr/payroll/:id/process           # Process payroll
POST   /api/hr/payroll/:id/approve
POST   /api/hr/payroll/:id/submit-wps        # Submit to WPS (Wage Protection System)
GET    /api/hr/salary-records                # Query: employeeId, month, year, status

# Performance Evaluations
GET    /api/hr/evaluations                   # Query: employeeId, evaluatorId, period, status
GET    /api/hr/evaluations/:id
POST   /api/hr/evaluations
PUT    /api/hr/evaluations/:id
POST   /api/hr/evaluations/:id/submit
POST   /api/hr/evaluations/:id/complete
```

### Employee Schema

```typescript
type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated' | 'probation'
type EmployeeType = 'full_time' | 'part_time' | 'contractor' | 'intern'
type Gender = 'male' | 'female'
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

interface Employee {
  id: string
  employeeId: string         // e.g., EMP001
  firstName: string
  lastName: string
  firstNameEn?: string
  lastNameEn?: string
  email: string
  phone?: string
  mobile?: string
  avatar?: string

  // Personal Info
  nationalId?: string
  dateOfBirth?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  nationality?: string
  address?: string
  city?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }

  // Employment Info
  department: string
  departmentId?: string
  position: string
  positionId?: string
  employeeType: EmployeeType
  status: EmployeeStatus
  hireDate: string
  endDate?: string
  probationEndDate?: string
  manager?: string
  managerId?: string

  // Salary Info
  baseSalary: number
  housingAllowance?: number
  transportAllowance?: number
  otherAllowances?: number
  currency?: string
  bankName?: string
  bankAccount?: string
  iban?: string

  // Leave Balances
  annualLeaveBalance?: number
  sickLeaveBalance?: number

  // Documents
  documents?: EmployeeDocument[]

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}
```

### Leave Types (Saudi-specific)

```typescript
type LeaveType =
  | 'annual'      // 21-30 days based on tenure
  | 'sick'        // 120 days (30 full, 60 3/4, 30 unpaid)
  | 'maternity'   // 70 days for women
  | 'paternity'   // 3 days for men
  | 'unpaid'
  | 'emergency'
  | 'hajj'        // 10-15 days once per employment
  | 'bereavement' // 3-5 days
  | 'study'
  | 'other'
```

### WPS (Wage Protection System)

```typescript
interface WPS {
  registered: boolean
  wpsMolId?: string           // Ministry of Labor ID
  wpsEstablishmentId?: string // Establishment ID
}
```

---

## 6. CRM Module

### Frontend Source Files
- Service: `src/services/crmService.ts` + `src/services/leadService.ts`
- Hooks: `src/hooks/use-crm.ts` + `src/hooks/use-leads.ts`
- Types: `src/types/crm.ts` + `src/types/crm-advanced.ts`

### API Endpoints

```
# Leads
GET    /api/crm/leads                        # Query: status, type, source, assignedTo, pipelineId, search, page, limit
GET    /api/crm/leads/:id
POST   /api/crm/leads
PUT    /api/crm/leads/:id
DELETE /api/crm/leads/:id
POST   /api/crm/leads/:id/convert            # Convert to client
PATCH  /api/crm/leads/:id/status             # Update status
PATCH  /api/crm/leads/:id/stage              # Move to pipeline stage
GET    /api/crm/leads/stats                  # Lead statistics

# Pipelines
GET    /api/crm/pipelines                    # Query: type, isActive
GET    /api/crm/pipelines/:id
POST   /api/crm/pipelines
PUT    /api/crm/pipelines/:id
DELETE /api/crm/pipelines/:id
POST   /api/crm/pipelines/:id/stages         # Add stage
PUT    /api/crm/pipelines/:id/stages/:stageId
DELETE /api/crm/pipelines/:id/stages/:stageId
PUT    /api/crm/pipelines/:id/stages/reorder # Body: { stageIds: string[] }

# Referrals
GET    /api/crm/referrals                    # Query: type, status, hasFeeAgreement, search
GET    /api/crm/referrals/:id
POST   /api/crm/referrals
PUT    /api/crm/referrals/:id
DELETE /api/crm/referrals/:id
POST   /api/crm/referrals/:id/record-payment # Record fee payment
GET    /api/crm/referrals/stats

# Activities
GET    /api/crm/activities                   # Query: entityType, entityId, type, status, performedBy
GET    /api/crm/activities/:id
POST   /api/crm/activities
PUT    /api/crm/activities/:id
DELETE /api/crm/activities/:id
POST   /api/crm/activities/:id/complete

# Quick Logging
POST   /api/crm/log/call                     # Log phone call
POST   /api/crm/log/email                    # Log email
POST   /api/crm/log/meeting                  # Log meeting
POST   /api/crm/log/note                     # Add note

# Email Marketing (Advanced CRM)
GET    /api/crm/email/campaigns
POST   /api/crm/email/campaigns
POST   /api/crm/email/campaigns/:id/send
GET    /api/crm/email/templates
POST   /api/crm/email/templates

# WhatsApp Integration (Advanced CRM)
POST   /api/crm/whatsapp/send
GET    /api/crm/whatsapp/templates
POST   /api/crm/whatsapp/broadcasts
```

### Lead Schema

```typescript
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'dormant'
type LeadType = 'individual' | 'company'

interface Lead {
  _id: string
  leadId: string
  lawyerId: string
  type: LeadType

  // Individual Name Fields
  firstName?: string
  middleName?: string
  lastName?: string
  preferredName?: string
  salutation?: string
  suffix?: string
  fullNameArabic?: string
  fullNameEnglish?: string
  arabicName?: ArabicName
  salutationAr?: string

  // Company Fields (same as Client)
  companyName?: string
  companyNameAr?: string
  companyNameEnglish?: string
  contactPerson?: string
  crNumber?: string
  unifiedNumber?: string
  vatNumber?: string
  // ... (same Najiz fields as Client)

  // Contact Info
  email?: string
  phone: string
  alternatePhone?: string
  whatsapp?: string
  fax?: string
  website?: string

  // Identity (Najiz) - same fields as Client
  identityType?: NajizIdentityType
  nationalId?: string
  iqamaNumber?: string
  // ... etc

  // Pipeline
  status: LeadStatus
  pipelineId?: string
  pipelineStageId?: string
  probability: number        // 0-100
  expectedCloseDate?: string

  // Source
  source?: {
    type: 'website' | 'referral' | 'ads' | 'social' | 'walkin' | 'cold_call' | 'event' | 'social_media' | 'advertising' | 'walk_in' | 'other'
    referralId?: string
    referralName?: string
    campaign?: string
  }

  // Intake
  intake?: {
    caseType?: string
    caseDescription?: string
    urgency?: 'low' | 'normal' | 'high' | 'urgent'
    estimatedValue?: number
    conflictCheckCompleted?: boolean
  }

  // Qualification (BANT)
  qualification?: {
    budget?: 'unknown' | 'low' | 'medium' | 'high' | 'premium'
    authority?: 'unknown' | 'decision_maker' | 'influencer' | 'researcher'
    need?: 'unknown' | 'urgent' | 'planning' | 'exploring'
    timeline?: 'unknown' | 'immediate' | 'this_month' | 'this_quarter' | 'this_year' | 'no_timeline'
    score?: number  // Calculated BANT score
  }

  // Value
  estimatedValue: number
  currency: string

  // Assignment
  assignedTo?: string

  // Activity Tracking
  lastContactedAt?: string
  lastActivityAt?: string
  nextFollowUpDate?: string
  nextFollowUpNote?: string
  activityCount: number

  // Conversion
  convertedToClient: boolean
  clientId?: string
  convertedAt?: string

  // Communication Preferences
  preferredLanguage?: 'ar' | 'en'
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp'
  bestTimeToContact?: string
  doNotContact?: boolean
  doNotEmail?: boolean
  doNotCall?: boolean
  doNotSMS?: boolean

  // Risk & Conflict
  riskLevel?: 'low' | 'medium' | 'high'
  isBlacklisted?: boolean
  blacklistReason?: string
  conflictCheckStatus?: 'not_checked' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflictNotes?: string
  conflictCheckDate?: string

  // Verification (Wathq/MOJ)
  isVerified?: boolean
  verificationSource?: string
  verifiedAt?: string
  verificationData?: any

  // Meta
  tags?: string[]
  notes?: string
  priority?: 'low' | 'normal' | 'high' | 'vip'
  vipStatus?: boolean
  displayName: string        // Computed
  daysSinceCreated: number   // Computed
  daysSinceContact?: number  // Computed
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}
```

### Pipeline Schema

```typescript
interface Pipeline {
  _id: string
  pipelineId: string
  lawyerId: string
  name: string
  nameAr?: string
  description?: string
  type: 'lead' | 'case' | 'deal' | 'custom'
  category?: string
  icon: string
  color: string
  stages: PipelineStage[]
  isDefault: boolean
  isActive: boolean
  stats?: {
    totalLeads: number
    activeLeads: number
    wonLeads: number
    lostLeads: number
    conversionRate: number
  }
  createdAt: string
  updatedAt: string
}

interface PipelineStage {
  stageId: string
  name: string
  nameAr?: string
  color: string
  order: number
  probability: number        // 0-100
  isWonStage?: boolean
  isLostStage?: boolean
  autoActions?: PipelineAutoAction[]
}

interface PipelineAutoAction {
  trigger: 'enter' | 'exit' | 'stay'
  action: 'send_email' | 'create_task' | 'notify_user' | 'update_field' | 'webhook'
  config: {
    to?: 'lead_owner' | 'lead_email' | string
    subject?: string
    message?: string
    templateId?: string
    title?: string
    assignedTo?: 'lead_owner' | string
    dueInDays?: number
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    userId?: 'lead_owner' | string
    field?: string
    value?: string | string[]
    operation?: 'set' | 'append' | 'remove'
    url?: string
    method?: 'GET' | 'POST'
  }
}
```

### Referral Schema

```typescript
type ReferralType = 'client' | 'lawyer' | 'law_firm' | 'contact' | 'employee' | 'partner' | 'organization' | 'other'
type ReferralStatus = 'active' | 'inactive' | 'archived'
type FeeType = 'percentage' | 'fixed' | 'tiered' | 'none'

interface Referral {
  _id: string
  referralId: string
  lawyerId: string
  type: ReferralType
  name: string
  nameAr?: string
  status: ReferralStatus

  // External source info
  externalSource?: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }

  // Linked entities
  clientId?: string
  contactId?: string
  organizationId?: string
  staffId?: string

  // Fee agreement
  hasFeeAgreement: boolean
  feeType: FeeType
  feePercentage?: number
  feeFixedAmount?: number
  feeTiers?: {
    minValue: number
    maxValue?: number
    percentage: number
  }[]

  // Statistics (computed)
  totalReferrals: number
  successfulReferrals: number
  totalFeesOwed: number
  totalFeesPaid: number
  conversionRate: string
  outstandingFees: number

  // Referred leads
  referredLeads?: {
    leadId: string
    status: 'pending' | 'converted' | 'lost'
    caseValue?: number
    feeAmount?: number
    convertedAt?: string
    clientId?: string
  }[]

  // Fee payments
  feePayments?: {
    amount: number
    date: string
    method?: string
    reference?: string
    notes?: string
  }[]

  // Meta
  tags?: string[]
  notes?: string
  rating?: number
  priority: 'low' | 'normal' | 'high' | 'vip'
  createdAt: string
  updatedAt: string
}
```

### Activity Schema

```typescript
type ActivityType = 'call' | 'email' | 'sms' | 'whatsapp' | 'meeting' | 'note' | 'task' | 'document' | 'proposal' | 'status_change' | 'stage_change' | 'lead_created' | 'lead_converted'
type ActivityEntityType = 'lead' | 'client' | 'contact' | 'case' | 'organization'
type ActivityStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

interface CrmActivity {
  _id: string
  activityId: string
  lawyerId: string
  type: ActivityType
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  title: string
  titleAr?: string
  description?: string

  // Type-specific data
  callData?: {
    direction: 'inbound' | 'outbound'
    phoneNumber?: string
    duration?: number
    outcome?: string
  }
  emailData?: {
    subject?: string
    from?: string
    to?: string[]
    isIncoming?: boolean
  }
  meetingData?: {
    meetingType?: 'in_person' | 'video' | 'phone' | 'court' | 'consultation'
    location?: string
    scheduledStart?: string
    scheduledEnd?: string
    agenda?: string
    summary?: string
    nextSteps?: string
    outcome?: string
    attendees?: string[]
  }
  taskData?: {
    dueDate?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  }

  // Performer
  performedBy: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }

  // Status
  status: ActivityStatus
  scheduledAt?: string
  completedAt?: string
  outcomeNotes?: string

  // Meta
  tags?: string[]
  isPrivate?: boolean
  createdAt: string
  updatedAt: string
}
```

---

## Response Formats

### Standard Success Response

```typescript
interface ApiSuccessResponse<T> {
  error: false
  message?: string
  data: T
  meta?: {
    requestId?: string
    timestamp?: string
    pagination?: PaginationMeta
  }
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}
```

### Standard Error Response

```typescript
interface ApiErrorResponse {
  error: true
  message: string      // Arabic message
  messageEn?: string   // English message
  code?: string        // Error code

  // Rate limiting
  retryAfter?: number
  attemptsRemaining?: number

  // Account lockout
  remainingTime?: number
  lockedUntil?: string

  // Session
  reason?: 'idle_timeout' | 'absolute_timeout' | string
  loggedOut?: boolean

  // Validation
  errors?: Record<string, string> | Array<{ field: string; message: string }>

  // Request tracking
  requestId?: string
}
```

---

## Common Patterns

### ID Auto-Generation

```
Users:     No prefix, MongoDB ObjectId
Clients:   "CLT-YYYYMMDD-XXXX"
Cases:     MongoDB ObjectId (caseNumber is separate)
Invoices:  "INV-YYYYMMDD-XXXX"
Employees: "EMP001", "EMP002", etc.
Leads:     "LD-YYYYMMDD-XXXX"
```

### Soft Delete

All entities use soft delete with:
```typescript
{
  isDeleted?: boolean
  deletedAt?: string
  deletedBy?: string
}
```

### Bilingual Support

All error messages should be bilingual:
```typescript
throw new Error(`Failed to create client | فشل في إنشاء العميل`)
```

### Saudi-Specific Validations

```typescript
// National ID (Saudi): 10 digits, starts with 1
/^1\d{9}$/

// Iqama (Resident ID): 10 digits, starts with 2
/^2\d{9}$/

// VAT Number: 15 digits, starts with 3
/^3\d{14}$/

// Commercial Registration: 10 digits
/^\d{10}$/

// Postal Code: 5 digits
/^\d{5}$/

// Region Code: 01-13
/^(0[1-9]|1[0-3])$/

// Hijri Date: YYYY/MM/DD (e.g., 1445/06/15)
/^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|30)$/
```

---

## Integration Notes

### ZATCA (Saudi e-Invoicing)

For invoice e-invoicing compliance:
- Use UBL 2.1 XML format
- Include QR code with cryptographic stamp
- Submit to ZATCA for clearance (B2B) or reporting (B2C)
- Store ZATCA submission status and response

### Najiz (Ministry of Justice)

For case management:
- Verify party identities via Najiz
- Sync case status with Najiz portal
- Import hearing schedules

### Wathq (Commercial Registration)

For company verification:
- Verify CR number authenticity
- Get company details (name, capital, activities)
- Check CR expiry status

### WPS (Wage Protection System)

For payroll:
- Register establishment with MOL
- Submit monthly salary file
- Track payment confirmations
