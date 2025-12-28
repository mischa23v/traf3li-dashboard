# Ultimate CRM Implementation Plan
## 100% Feature Parity with World's Top CRM Platforms

---

## Executive Summary

This plan transforms Traf3li's CRM into a world-class system that matches or exceeds:
- Odoo CRM
- ERPNext CRM
- Dolibarr CRM
- OFBiz/iDempiere CRM

While maintaining Traf3li's unique strengths (Saudi localization, legal features, Arabic support).

---

## Implementation Phases

### Phase 1: Core Types & Shared Infrastructure
**Files to Create/Modify:**
- `src/types/crm-ultimate.ts` - All CRM types with 100% fields
- `src/constants/crm-constants.ts` - Office types, statuses, enums
- `src/utils/crm-utils.ts` - Shared utilities

### Phase 2: Organization Entity (NEW)
**Files to Create:**
- `src/types/organization.ts` - Full organization type
- `src/services/organizationService.ts` - API service
- `src/hooks/useOrganizations.ts` - React Query hooks
- `src/features/crm/views/organizations-list-view.tsx` - List page
- `src/features/crm/views/organization-form-view.tsx` - Create/Edit
- `src/features/crm/views/organization-detail-view.tsx` - Detail page
- `src/features/crm/components/organization-card.tsx` - Card component
- Backend: Organization model, routes, controller

### Phase 3: Enhanced Entity Fields
**Files to Modify:**
- Lead types: Add all 50+ missing fields
- Contact types: Multiple emails/phones, roles, birthday alerts
- Client types: Enhanced billing, lifetime value
- Pipeline types: Rotting threshold, requirements

### Phase 4: CRM Reports Page
**Files to Create:**
- `src/features/crm/views/crm-reports-view.tsx` - Main reports dashboard
- `src/features/crm/components/reports/` - Report components
  - `lead-activity-report.tsx`
  - `pipeline-velocity-report.tsx`
  - `revenue-forecast-report.tsx`
  - `duplicate-leads-report.tsx`
  - `stale-leads-report.tsx`
  - `quota-tracking-report.tsx`
  - `lead-aging-report.tsx`
  - `source-roi-report.tsx`

### Phase 5: Duplicate Detection System
**Files to Create:**
- `src/features/crm/components/duplicate-detection/`
  - `duplicate-detector.tsx`
  - `duplicate-merge-dialog.tsx`
  - `duplicate-list-view.tsx`
- `src/services/duplicateDetectionService.ts`
- `src/hooks/useDuplicateDetection.ts`

### Phase 6: Activity Plans & Recurring
**Files to Create:**
- `src/types/activity-plan.ts`
- `src/features/crm/views/activity-plans-view.tsx`
- `src/features/crm/components/activity-plan-builder.tsx`
- `src/features/crm/components/recurring-activity-form.tsx`

### Phase 7: Revenue Forecasting & Quotas
**Files to Create:**
- `src/features/crm/views/forecast-view.tsx`
- `src/features/crm/views/quota-management-view.tsx`
- `src/features/crm/components/forecast-chart.tsx`
- `src/features/crm/components/quota-progress.tsx`

### Phase 8: Sidebar & Navigation
**Files to Modify:**
- `src/hooks/use-sidebar-data.ts` - Reorganize CRM section
- `src/constants/routes.ts` - Add new routes

### Phase 9: Settings Pages
**Files to Create:**
- `src/features/crm/views/settings/duplicate-rules-view.tsx`
- `src/features/crm/views/settings/activity-plans-settings-view.tsx`
- `src/features/crm/views/settings/quota-settings-view.tsx`
- `src/features/crm/views/settings/enrichment-settings-view.tsx`

---

## Detailed Field Additions

### Lead Entity - New Fields
```typescript
// Revenue & Forecasting
recurring_revenue: number
recurring_plan: 'monthly' | 'quarterly' | 'yearly'
prorated_revenue: number // calculated: expectedValue * probability

// Validation
email_state: 'valid' | 'invalid' | 'bounced' | 'unknown'
phone_state: 'valid' | 'invalid' | 'unknown'

// Duplicate Detection
duplicate_lead_ids: string[]
duplicate_count: number
is_duplicate: boolean

// Enrichment
annual_revenue: number
employee_count: string // '1-10', '11-50', etc.
industry_id: string
sector_id: string
first_response_time: number // seconds

// Qualification Enhancement
qualified_by: string
qualified_on: Date

// Stale Detection
days_in_stage: number
is_stale: boolean
stale_since: Date

// Office Type
office_type: 'solo' | 'small' | 'medium' | 'firm'
```

### Contact Entity - New Fields
```typescript
// Multiple Communications
email_addresses: Array<{
  email: string
  type: 'work' | 'personal' | 'other'
  is_primary: boolean
}>

phone_numbers: Array<{
  number: string
  type: 'work' | 'mobile' | 'home' | 'fax'
  is_primary: boolean
}>

// Roles per Organization
organization_roles: Array<{
  organization_id: string
  role: 'billing' | 'technical' | 'decision_maker' | 'influencer'
  is_primary: boolean
}>

// Birthday & Alerts
birthday: Date
birthday_alert: boolean
days_to_birthday: number // calculated

// Sync
google_contact_id: string
sync_with_google: boolean
last_synced_at: Date
```

### Organization Entity (NEW)
```typescript
interface Organization {
  _id: string

  // Identity
  legal_name: string
  legal_name_ar: string
  trade_name: string
  trade_name_ar: string

  // Hierarchy
  parent_organization_id: string
  subsidiary_ids: string[]

  // Classification
  industry_id: string
  sector_id: string
  sic_code: string
  naics_code: string

  // Size
  employee_count: string
  annual_revenue: number
  fiscal_year_end: number // month 1-12

  // Financial
  bank_accounts: Array<{
    bank_name: string
    account_number: string
    iban: string
    is_primary: boolean
  }>

  payment_terms: string
  credit_limit: number
  credit_rating: string

  // Tax
  tax_exempt: boolean
  tax_exempt_reason: string
  vat_number: string

  // Saudi Specific
  cr_number: string
  unified_number: string
  municipality_license: string
  chamber_number: string

  // Office Type
  office_type: 'solo' | 'small' | 'medium' | 'firm'

  // Contacts
  primary_contact_id: string
  contacts: string[]

  // Address
  headquarters_address: NationalAddress
  branch_addresses: NationalAddress[]

  // Communication
  phone: string
  fax: string
  email: string
  website: string
  social_networks: Record<string, string>

  // Status
  status: 'active' | 'inactive' | 'suspended'

  // Meta
  notes: string
  tags: string[]
  created_at: Date
  updated_at: Date
}
```

### Pipeline Stage - New Fields
```typescript
// Stale Detection
rotting_threshold_days: number
is_rotting_enabled: boolean

// Requirements
requirements: string // tooltip/checklist
stage_checklist: Array<{
  item: string
  required: boolean
}>

// Display
fold: boolean // auto-hide empty stages
team_ids: string[] // multiple teams per stage
```

### Activity - New Fields
```typescript
// Recurring
is_recurring: boolean
recurrence_rule: string // RRULE format
recurrence_end_date: Date
parent_activity_id: string // for recurring series

// Chaining
chaining_type: 'suggest' | 'trigger' | 'none'
suggested_activity_ids: string[]
next_activity_template_id: string

// Reminders
reminders: Array<{
  offset_value: number
  offset_unit: 'minutes' | 'hours' | 'days'
  type: 'email' | 'browser' | 'sms'
  sent: boolean
}>

// Feedback
feedback: string // post-completion notes

// Busy Status
transparency: 'available' | 'busy' | 'tentative'
```

---

## New Components to Build

### 1. Office Type Selector
Reusable component for all CRM forms:
```typescript
<OfficeTypeSelector
  value={officeType}
  onChange={setOfficeType}
  showDescriptions={true}
/>
```

### 2. Duplicate Detection Panel
Shows on lead/contact detail pages:
```typescript
<DuplicateDetectionPanel
  entityType="lead"
  entityId={leadId}
  onMerge={handleMerge}
/>
```

### 3. Revenue Forecast Chart
Interactive forecast visualization:
```typescript
<RevenueForecastChart
  data={forecastData}
  view="monthly" | "quarterly"
  showProbability={true}
/>
```

### 4. Stale Lead Indicator
Visual badge for stale leads:
```typescript
<StaleLeadIndicator
  daysInStage={45}
  threshold={30}
  showDays={true}
/>
```

### 5. Activity Plan Builder
Drag-and-drop activity sequence builder:
```typescript
<ActivityPlanBuilder
  plan={activityPlan}
  onChange={setActivityPlan}
/>
```

### 6. Quota Progress Widget
Dashboard widget for quota tracking:
```typescript
<QuotaProgressWidget
  userId={userId}
  period="monthly"
  showTarget={true}
/>
```

---

## API Endpoints to Create

### Organization Endpoints
```
GET    /api/v1/organizations
GET    /api/v1/organizations/:id
POST   /api/v1/organizations
PUT    /api/v1/organizations/:id
DELETE /api/v1/organizations/:id
GET    /api/v1/organizations/:id/contacts
GET    /api/v1/organizations/:id/subsidiaries
POST   /api/v1/organizations/:id/merge
```

### Duplicate Detection Endpoints
```
GET    /api/v1/leads/:id/duplicates
POST   /api/v1/leads/detect-duplicates
POST   /api/v1/leads/merge
GET    /api/v1/contacts/:id/duplicates
POST   /api/v1/contacts/merge
```

### Activity Plans Endpoints
```
GET    /api/v1/activity-plans
GET    /api/v1/activity-plans/:id
POST   /api/v1/activity-plans
PUT    /api/v1/activity-plans/:id
DELETE /api/v1/activity-plans/:id
POST   /api/v1/activity-plans/:id/apply/:entityId
```

### Forecasting Endpoints
```
GET    /api/v1/crm-analytics/forecast
GET    /api/v1/crm-analytics/forecast/by-rep
GET    /api/v1/crm-analytics/forecast/by-stage
GET    /api/v1/quotas
POST   /api/v1/quotas
GET    /api/v1/quotas/:userId/progress
```

### CRM Reports Endpoints
```
GET    /api/v1/crm-reports/lead-aging
GET    /api/v1/crm-reports/stale-leads
GET    /api/v1/crm-reports/duplicate-leads
GET    /api/v1/crm-reports/source-roi
GET    /api/v1/crm-reports/first-response-time
GET    /api/v1/crm-reports/pipeline-velocity
```

---

## Sidebar Reorganization

### New Structure for العملاء والتواصل
```typescript
{
  title: 'العملاء والتواصل',
  icon: Users,
  items: [
    // Overview
    { title: 'لوحة التحكم', url: '/crm/dashboard' },

    // Entities
    { title: 'العملاء المحتملين', url: '/crm/leads' },
    { title: 'العملاء', url: '/clients' },
    { title: 'جهات الاتصال', url: '/contacts' },
    { title: 'المنظمات', url: '/organizations' },  // NEW

    // Pipeline
    { title: 'خط الأنابيب', url: '/crm/pipeline' },

    // Activities
    { title: 'الأنشطة', url: '/crm/activities' },
    { title: 'خطط الأنشطة', url: '/crm/activity-plans' },  // NEW

    // Reports
    { title: 'التقارير', url: '/crm/reports' },  // NEW - Like Transactions

    // Team
    { title: 'فريق العمل', url: '/staff' },

    // Settings
    { title: 'الإعدادات', url: '/crm/settings' },
  ]
}
```

---

## Execution Order

1. **Batch 1 (Foundation)** - Run in parallel:
   - Core types (`crm-ultimate.ts`)
   - Constants (`crm-constants.ts`)
   - Utils (`crm-utils.ts`)
   - Routes update

2. **Batch 2 (Organization Entity)** - Run in parallel:
   - Organization types
   - Organization service
   - Organization hooks
   - Organization views (list, form, detail)

3. **Batch 3 (Enhanced Fields)** - Run in parallel:
   - Lead field enhancements
   - Contact field enhancements
   - Client field enhancements
   - Pipeline stage enhancements

4. **Batch 4 (Reports)** - Run in parallel:
   - CRM Reports main page
   - Individual report components
   - Report hooks and services

5. **Batch 5 (Advanced Features)** - Run in parallel:
   - Duplicate detection
   - Activity plans
   - Recurring activities
   - Stale detection

6. **Batch 6 (Forecasting)** - Run in parallel:
   - Forecast view
   - Quota management
   - Forecast charts
   - Quota progress widgets

7. **Batch 7 (Navigation & Settings)** - Run in parallel:
   - Sidebar update
   - New settings pages
   - Route configuration

---

## Success Metrics

After implementation, Traf3li CRM will have:
- ✅ 100% field parity with Odoo/ERPNext
- ✅ Organization entity with full hierarchy
- ✅ Duplicate detection and merge
- ✅ Stale lead detection
- ✅ Revenue forecasting
- ✅ Activity plans and recurring
- ✅ Quota management
- ✅ CRM Reports dashboard
- ✅ Office type on all forms
- ✅ Enhanced sidebar navigation

---

*Plan created: 2024-12-28*
*Estimated files: 50+ new, 30+ modified*
