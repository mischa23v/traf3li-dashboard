# ERP Cleanup & Legal Features Enhancement - Requirements

## Scale Assessment
**Type**: [ ] Quick Fix  [ ] Standard  [x] Enterprise
**Estimated Files**: 55 removed, 40+ modified, 30+ new
**Risk Level**: High (major architectural changes)

---

## Problem Statement

The current dashboard includes manufacturing ERP modules (BOM, work orders, quality inspections, subcontracting) that are irrelevant to a law firm. These need to be removed while adding legal-specific features (conflict check UI, client portal, contract management, automated workflows).

**Goals:**
1. Remove irrelevant manufacturing/factory modules
2. Simplify overly complex modules (biometric, buying, inventory)
3. Add legal-specific features that lawyers actually need
4. Fix sidebar inconsistencies (mixed translations)
5. Keep system scalable from solo lawyer to enterprise firm

---

## Target Users

- **Primary**: Saudi lawyers (solo practitioners, small firms, enterprise firms)
- **Secondary**: Paralegals, legal assistants, office managers, firm administrators

---

## 🧠 Reasoning (Analysis Done)

### Codebase Research

| Searched For | Found | Decision |
|--------------|-------|----------|
| Manufacturing files | 20 files (hooks, services, routes, types, features) | **REMOVE ALL** |
| Subcontracting files | 13 files | **REMOVE ALL** |
| Quality files | 16 files | **REMOVE ALL** |
| Biometric files | 8 files + useBiometric.ts (400+ lines) | **SIMPLIFY** - keep attendance, remove fingerprint/facial |
| Buying files | 18 files | **SIMPLIFY** - keep vendors, remove RFQs/material requests |
| Inventory files | 18 files | **SIMPLIFY** - remove warehouses/stock ledger, keep basic items |
| Conflict check | `conflictCheckService.ts` (194 lines) - **already exists!** | Extend with UI |
| Workflows | `workflowService.ts` + 12 component files | Extend for automation |
| Approvals | 9 files (hooks, views, services) | Already exists - extend |
| Budgets | 5 files (service, types, components) | Already exists - extend for matters |

### What Already Exists (Reuse These)

| Component/File | Location | Can Reuse For |
|----------------|----------|---------------|
| `conflictCheckService.ts` | `src/services/` | Conflict check - just needs UI |
| `workflowService.ts` | `src/services/` | Automated workflows |
| `approvalService.ts` | `src/services/` | Approval workflows |
| `budgetService.ts` | `src/services/` | Matter budgeting |
| Case workflows components | `src/features/case-workflows/` | Workflow UI patterns |
| Finance approval views | `src/features/finance/components/` | Approval UI patterns |

### What's Missing (Need to Create)

| Component/File | Purpose | Priority |
|----------------|---------|----------|
| Conflict Check UI | List/details/run check pages | HIGH |
| Contract Management | Full CLM module | HIGH |
| Client Portal Backend | Separate portal for clients | MEDIUM |
| Automated Rules Engine | WHEN/THEN workflow automation | MEDIUM |
| E-Signature Integration | DocuSign/similar | MEDIUM |
| Practice Area Profitability | Reporting | LOW |
| Compliance Tracker | License/insurance renewal | LOW |

### Architecture Decision

**Chosen approach**:
1. Remove modules entirely (not feature-flag hide) - reduces bundle size and maintenance
2. Create new legal-specific modules following existing patterns
3. Extend existing services (conflict, workflow, budget) rather than rebuild

**Why**:
- Cleaner codebase
- Smaller bundle
- Less confusion for developers
- Existing patterns are good

**Rejected alternatives**:
- Feature-flag hide (keeps dead code, increases bundle)
- Complete rewrite (too risky, loses working code)

### Risks Identified

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking sidebar references | High | Medium | Update sidebar-data.ts after removals |
| Breaking route imports | High | High | Search for all imports before deleting |
| Translation key orphans | Medium | Low | Clean up translation files |
| Query key collisions (new features) | Low | High | Use existing QueryKeys pattern |

---

## 🏆 Enterprise Standards Compliance

### Security
- [x] Authentication: JWT with refresh tokens (existing)
- [x] Authorization: RBAC (existing) - add permissions for new features
- [x] Data sensitivity: Conflict check results are confidential
- [x] Audit requirements: Log all conflict checks, contract changes, approvals

### Performance
- [x] Expected load: Standard dashboard load
- [x] Response time SLA: < 200ms for API calls
- [x] Caching strategy: Use existing React Query patterns

### Accessibility
- [x] WCAG 2.1 AA compliance required
- [x] RTL/Arabic support required
- [x] Keyboard navigation required

### Compliance
- [x] PDPL requirements: Client data privacy, conflict check confidentiality
- [x] Data retention: Per Saudi regulations
- [x] Consent required: Client consent for conflict waivers

---

# PART 1: MODULES TO REMOVE

## 1.1 Manufacturing Module - REMOVE ENTIRELY

**Files to Delete (20 files):**

```
src/hooks/use-manufacturing.ts
src/services/manufacturingService.ts
src/types/manufacturing.ts
src/features/manufacturing/components/manufacturing-list-view.tsx
src/features/manufacturing/components/manufacturing-settings-view.tsx
src/features/manufacturing/components/manufacturing-sidebar.tsx
src/features/manufacturing/components/index.ts
src/routes/_authenticated/dashboard.manufacturing.$workOrderId.tsx
src/routes/_authenticated/dashboard.manufacturing.bom.$bomId.tsx
src/routes/_authenticated/dashboard.manufacturing.bom.create.tsx
src/routes/_authenticated/dashboard.manufacturing.bom.index.tsx
src/routes/_authenticated/dashboard.manufacturing.bom.tsx
src/routes/_authenticated/dashboard.manufacturing.create.tsx
src/routes/_authenticated/dashboard.manufacturing.index.tsx
src/routes/_authenticated/dashboard.manufacturing.job-cards.$jobCardId.tsx
src/routes/_authenticated/dashboard.manufacturing.job-cards.index.tsx
src/routes/_authenticated/dashboard.manufacturing.settings.tsx
src/routes/_authenticated/dashboard.manufacturing.work-orders.create.tsx
src/routes/_authenticated/dashboard.manufacturing.workstations.create.tsx
src/routes/_authenticated/dashboard.manufacturing.workstations.index.tsx
src/routes/_authenticated/dashboard.manufacturing.workstations.tsx
```

**Routes to Remove from `routes.ts`:**
- `ROUTES.dashboard.manufacturing.*` (entire section)

**Sidebar Items to Remove:**
- Manufacturing group
- Work Orders, BOMs, Workstations, Job Cards, Production Plans

**Translations to Remove:**
- `sidebar.manufacturingGroup`
- `sidebar.manufacturing`
- `sidebar.workOrders`
- `sidebar.boms`
- `sidebar.workstations`
- `sidebar.jobCards`
- `sidebar.productionPlans`

---

## 1.2 Subcontracting Module - REMOVE ENTIRELY

**Files to Delete (13 files):**

```
src/hooks/use-subcontracting.ts
src/services/subcontractingService.ts
src/types/subcontracting.ts
src/features/subcontracting/components/subcontracting-list-view.tsx
src/features/subcontracting/components/subcontracting-settings-view.tsx
src/features/subcontracting/components/subcontracting-sidebar.tsx
src/features/subcontracting/components/index.ts
src/routes/_authenticated/dashboard.subcontracting.$orderId.tsx
src/routes/_authenticated/dashboard.subcontracting.create.tsx
src/routes/_authenticated/dashboard.subcontracting.index.tsx
src/routes/_authenticated/dashboard.subcontracting.receipts.create.tsx
src/routes/_authenticated/dashboard.subcontracting.receipts.index.tsx
src/routes/_authenticated/dashboard.subcontracting.receipts.tsx
src/routes/_authenticated/dashboard.subcontracting.settings.tsx
```

**Routes to Remove from `routes.ts`:**
- `ROUTES.dashboard.subcontracting.*` (entire section)

**Sidebar Items to Remove:**
- Subcontracting group
- Subcontract Orders, Receipts, BOMs

**Translations to Remove:**
- `sidebar.subcontractingGroup`
- `sidebar.subcontracting`
- `sidebar.subcontractOrders`
- `sidebar.subcontractReceipts`
- `sidebar.subcontractBoms`

---

## 1.3 Quality Module - REMOVE ENTIRELY

**Files to Delete (16 files):**

```
src/hooks/use-quality.ts
src/services/qualityService.ts
src/types/quality.ts
src/features/quality/components/quality-list-view.tsx
src/features/quality/components/quality-settings-view.tsx
src/features/quality/components/quality-sidebar.tsx
src/features/quality/components/index.ts
src/routes/_authenticated/dashboard.quality.$inspectionId.tsx
src/routes/_authenticated/dashboard.quality.actions.create.tsx
src/routes/_authenticated/dashboard.quality.actions.index.tsx
src/routes/_authenticated/dashboard.quality.actions.tsx
src/routes/_authenticated/dashboard.quality.create.tsx
src/routes/_authenticated/dashboard.quality.index.tsx
src/routes/_authenticated/dashboard.quality.settings.tsx
src/routes/_authenticated/dashboard.quality.templates.create.tsx
src/routes/_authenticated/dashboard.quality.templates.index.tsx
src/routes/_authenticated/dashboard.quality.templates.tsx
```

**Routes to Remove from `routes.ts`:**
- `ROUTES.dashboard.quality.*` (entire section)

**Sidebar Items to Remove:**
- Quality group
- Quality Inspections, Templates, Actions, NCRs

**Translations to Remove:**
- `sidebar.qualityGroup`
- `sidebar.quality`
- `sidebar.qualityInspections`
- `sidebar.qualityTemplates`
- `sidebar.qualityActions`
- `sidebar.ncrs`

---

# PART 2: MODULES TO SIMPLIFY

## 2.1 Biometric Module - SIMPLIFY

**Current State**: Full biometric suite (fingerprint, facial recognition, geofencing, device management)

**Target State**: Basic attendance tracking only

**Files to Modify:**

| File | Action |
|------|--------|
| `src/hooks/useBiometric.ts` | Remove fingerprint/facial hooks, keep attendance |
| `src/types/biometric.ts` | Simplify types |
| `src/services/biometricService.ts` | Remove device management |
| `src/features/hr/components/biometric-*` | Simplify to attendance only |

**Features to KEEP:**
- Basic clock-in/clock-out
- Attendance records list
- Manual attendance entry

**Features to REMOVE:**
- Fingerprint enrollment (`useAddFingerprint`)
- Facial recognition (`useAddFacial`)
- Device management (`useDevices`, `useCreateDevice`, etc.)
- Geofencing zones (`useGeofences`, `useCreateGeofence`, etc.)
- Card assignment (`useAssignCard`)
- Device health monitoring (`useDeviceHealth`)
- Live feed (`useLiveFeed`)

**Routes to Keep:**
- `dashboard.hr.attendance.*` (rename from biometric)

**Routes to Remove:**
- `dashboard.hr.biometric.new` (device creation)
- `dashboard.hr.geofencing.*`

---

## 2.2 Buying Module - SIMPLIFY

**Current State**: Full procurement (suppliers, POs, RFQs, material requests, receipts)

**Target State**: Simple vendor management for office supplies

**Files to Modify:**

| File | Action |
|------|--------|
| `src/hooks/use-buying.ts` | Keep supplier hooks only |
| `src/types/buying.ts` | Simplify to vendors only |
| `src/services/buyingService.ts` | Remove PO/RFQ methods |

**Features to KEEP:**
- Vendor/Supplier list
- Vendor details
- Vendor create/edit

**Features to REMOVE:**
- Purchase Orders (`usePurchaseOrders`, etc.)
- Material Requests (`useMaterialRequests`, etc.)
- RFQs (`useRfqs`, etc.)
- Purchase Receipts (`usePurchaseReceipts`)
- Purchase Invoices (`usePurchaseInvoices`)

**Rename**: "Buying" → "Vendors" (more appropriate for law firm)

**Routes to Keep:**
- `dashboard.finance.vendors.*` (move from buying)

**Routes to Remove:**
- `dashboard.buying.purchase-orders.*`
- `dashboard.buying.material-requests.*`
- `dashboard.buying.rfq.*`
- `dashboard.buying.purchase-receipts.*`

---

## 2.3 Inventory Module - SIMPLIFY

**Current State**: Full warehouse management (items, warehouses, stock entries, stock ledger)

**Target State**: Simple office supplies tracking

**Files to Modify:**

| File | Action |
|------|--------|
| `src/hooks/use-inventory.ts` | Keep basic item hooks only |
| `src/types/inventory.ts` | Simplify to office items |
| `src/services/inventoryService.ts` | Remove warehouse methods |

**Features to KEEP:**
- Office supplies list (items)
- Item details
- Item create/edit
- Basic quantity tracking

**Features to REMOVE:**
- Warehouses (`useWarehouses`, etc.)
- Stock Entries (`useStockEntries`)
- Stock Ledger
- Bin locations
- Multiple warehouse transfers

**Rename**: "Inventory" → "Office Supplies" (more appropriate)

**Routes to Keep:**
- `dashboard.assets.office-supplies.*` (merge with assets)

**Routes to Remove:**
- `dashboard.inventory.warehouses.*`
- `dashboard.inventory.stock-entries.*`
- `dashboard.inventory.stock-ledger`

---

# PART 3: SIDEBAR CLEANUP

## 3.1 Fix Translation Inconsistencies

**Current Problem**: Mix of hardcoded English and translation keys

```typescript
// ❌ WRONG - Inconsistent
{ title: 'Dashboard', ... }     // Hardcoded
{ title: 'Tasks', ... }         // Hardcoded
{ title: 'sidebar.cases', ... } // Translation key
```

**Solution**: All sidebar items must use translation keys

```typescript
// ✅ CORRECT - Consistent
{ title: 'sidebar.dashboard', ... }
{ title: 'sidebar.tasks', ... }
{ title: 'sidebar.cases', ... }
```

**Items to Fix:**
| Current (Hardcoded) | New (Translation Key) |
|---------------------|----------------------|
| `'Dashboard'` | `'sidebar.dashboard'` |
| `'Tasks'` | `'sidebar.tasks'` |
| `'Task Details'` | `'sidebar.taskDetails'` |
| `'Apps'` | `'sidebar.apps'` |
| `'Account Statements'` | `'sidebar.accountStatements'` |
| `'Account Activity'` | `'sidebar.accountActivity'` |
| `'Time Entries'` | `'sidebar.timeEntries'` |
| `'Generate Statement'` | `'sidebar.generateStatement'` |
| `'Statements History'` | `'sidebar.statementsHistory'` |
| `'Chats'` | `'sidebar.chats'` |
| `'Users'` | `'sidebar.users'` |
| `'Secured by Clerk'` | `'sidebar.clerk'` |
| All Settings items | `'sidebar.settings.*'` |
| All Auth items | `'sidebar.auth.*'` |
| All Error items | `'sidebar.errors.*'` |

---

## 3.2 Remove Clerk Auth Section

The "Secured by Clerk" section in sidebar is for demo purposes and not relevant for a production law firm dashboard.

**Remove from sidebar-data.ts:**
```typescript
{
  title: 'Secured by Clerk',
  icon: ClerkLogo,
  items: [...]
}
```

---

## 3.3 Reorganize Sidebar Structure

**Proposed New Structure:**

```
Home
├── Dashboard
├── Calendar
├── Notifications

Cases & Matters
├── All Cases
├── Case Pipeline (Kanban)
├── Conflict Check ← NEW
├── Contract Management ← NEW

Clients
├── Clients
├── Contacts
├── Organizations
├── Client Portal ← NEW (admin view)

Tasks & Productivity
├── Tasks
├── Events
├── Reminders
├── Workflows

Finance
├── Overview
├── Invoices
├── Payments
├── Expenses
├── Time Tracking
├── Subscriptions
├── Retainers
├── Vendors (simplified from Buying)

Human Resources (toggleable)
├── Employees
├── Attendance (simplified from Biometric)
├── Leave
├── Payroll
├── [other HR items...]

CRM & Sales (toggleable)
├── Leads
├── Pipeline
├── Referrals
├── Campaigns

Assets (toggleable)
├── Office Equipment
├── Office Supplies (simplified from Inventory)
├── Maintenance

Knowledge Base
├── Laws
├── Judgments
├── Forms
├── Document Templates ← NEW

Settings
├── Profile
├── Security
├── Company
├── Preferences
├── Modules (toggle features)
```

---

# PART 4: NEW FEATURES TO ADD

## 4.1 Conflict Check UI (HIGH PRIORITY)

**Backend Already Exists**: `src/services/conflictCheckService.ts`

**Need to Create UI:**

### 4.1.1 Conflict Check List Page

**Route**: `/dashboard/conflicts`

**User Story**: As a lawyer, I want to see a history of all conflict checks so that I can review past decisions.

**Acceptance Criteria (EARS Format):**
1. WHEN user navigates to conflict check list THEN the system SHALL display all conflict checks with status, date, entity, and match count
2. WHEN user clicks on a conflict check row THEN the system SHALL navigate to the detail page
3. WHEN user clicks "New Check" THEN the system SHALL open the conflict check dialog
4. IF user has no permission THEN the system SHALL show unauthorized message

**Components Needed:**
- `src/features/conflicts/components/conflict-list-view.tsx`
- `src/features/conflicts/components/conflict-columns.tsx`
- `src/features/conflicts/components/conflict-table.tsx`

---

### 4.1.2 Conflict Check Detail Page

**Route**: `/dashboard/conflicts/:checkId`

**User Story**: As a lawyer, I want to review conflict check results and resolve matches so that I can make informed decisions about new clients.

**Acceptance Criteria (EARS Format):**
1. WHEN user views conflict detail THEN the system SHALL display all matched entities with severity and match type
2. WHEN user clicks "Resolve" on a match THEN the system SHALL show resolution dialog (clear/flag/waive)
3. WHEN user clears all matches THEN the system SHALL update overall status to "Cleared"
4. WHEN user flags any match THEN the system SHALL update overall status to "Flagged"
5. IF conflict requires waiver THEN the system SHALL require waiver reason and optional client consent

**Components Needed:**
- `src/features/conflicts/components/conflict-detail-view.tsx`
- `src/features/conflicts/components/conflict-match-card.tsx`
- `src/features/conflicts/components/conflict-resolution-dialog.tsx`
- `src/features/conflicts/components/conflict-waiver-dialog.tsx`

---

### 4.1.3 Run Conflict Check Dialog

**Trigger**: New client creation, new case creation, manual run

**User Story**: As a lawyer, I want to run a conflict check before taking a new client so that I avoid ethical violations.

**Acceptance Criteria (EARS Format):**
1. WHEN user opens conflict check dialog THEN the system SHALL allow entering party names and aliases
2. WHEN user clicks "Run Check" THEN the system SHALL search across all clients, contacts, and case parties
3. WHEN matches are found THEN the system SHALL display results with severity indicators
4. WHEN no matches found THEN the system SHALL show "No conflicts found" with green indicator
5. WHEN creating new client AND conflicts exist THEN the system SHALL require resolution before proceeding

**Components Needed:**
- `src/features/conflicts/components/run-conflict-check-dialog.tsx`
- `src/features/conflicts/components/conflict-party-input.tsx`
- `src/features/conflicts/components/conflict-results-preview.tsx`

---

### 4.1.4 Conflict Check Integration Points

**Integrate with existing flows:**
1. **Client Creation**: Before saving new client, prompt for conflict check
2. **Case Creation**: Before saving new case, run conflict check on all parties
3. **Contact Creation**: Optional quick check

**Files to Modify:**
- `src/features/clients/components/client-form.tsx` - Add conflict check step
- `src/features/cases/components/case-form.tsx` - Add conflict check step

---

## 4.2 Contract Lifecycle Management (HIGH PRIORITY)

**New Module - Need to Create Everything**

### 4.2.1 Contract Types

```typescript
// src/types/contract.ts

export type ContractStatus =
  | 'draft'
  | 'review'
  | 'negotiation'
  | 'pending_signature'
  | 'signed'
  | 'active'
  | 'expired'
  | 'terminated'
  | 'renewed'

export type ContractType =
  | 'engagement_letter'
  | 'retainer_agreement'
  | 'nda'
  | 'service_agreement'
  | 'employment'
  | 'lease'
  | 'settlement'
  | 'power_of_attorney'
  | 'other'

export interface Contract {
  _id: string
  contractNumber: string
  title: string
  type: ContractType
  status: ContractStatus

  // Parties
  parties: ContractParty[]

  // Dates
  effectiveDate: string
  expiryDate?: string
  renewalDate?: string
  noticePeriodDays?: number

  // Financials
  value?: number
  currency?: string
  paymentTerms?: string

  // Related
  clientId?: string
  caseId?: string

  // Obligations
  obligations: ContractObligation[]

  // Amendments
  amendments: ContractAmendment[]

  // Documents
  documentIds: string[]

  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ContractParty {
  name: string
  type: 'individual' | 'organization'
  role: 'party_a' | 'party_b' | 'guarantor' | 'witness'
  contactId?: string
  organizationId?: string
  signedAt?: string
  signatureMethod?: 'wet' | 'electronic' | 'pending'
}

export interface ContractObligation {
  _id: string
  description: string
  responsibleParty: 'us' | 'them' | 'both'
  dueDate?: string
  status: 'pending' | 'completed' | 'overdue' | 'waived'
  completedAt?: string
  notes?: string
}

export interface ContractAmendment {
  _id: string
  amendmentNumber: string
  description: string
  effectiveDate: string
  documentId?: string
  createdBy: string
  createdAt: string
}
```

---

### 4.2.2 Contract List Page

**Route**: `/dashboard/contracts`

**User Story**: As a lawyer, I want to see all contracts with their status and key dates so that I can manage renewals and obligations.

**Acceptance Criteria (EARS Format):**
1. WHEN user views contract list THEN the system SHALL display contracts with status, type, parties, and key dates
2. WHEN contract expiry is within 60 days THEN the system SHALL show warning indicator
3. WHEN contract has overdue obligations THEN the system SHALL show alert badge
4. WHEN user filters by status/type/client THEN the system SHALL filter results accordingly
5. WHEN user clicks "New Contract" THEN the system SHALL navigate to create page

**Components Needed:**
- `src/features/contracts/components/contract-list-view.tsx`
- `src/features/contracts/components/contract-columns.tsx`
- `src/features/contracts/components/contract-table.tsx`
- `src/features/contracts/components/contract-status-badge.tsx`
- `src/features/contracts/components/contract-expiry-warning.tsx`

---

### 4.2.3 Contract Detail Page

**Route**: `/dashboard/contracts/:contractId`

**User Story**: As a lawyer, I want to view full contract details including obligations, amendments, and documents so that I can manage the contract lifecycle.

**Acceptance Criteria (EARS Format):**
1. WHEN user views contract detail THEN the system SHALL display all contract information in organized sections
2. WHEN user clicks "Add Obligation" THEN the system SHALL open obligation dialog
3. WHEN obligation due date passes THEN the system SHALL mark it as overdue
4. WHEN user marks obligation complete THEN the system SHALL record completion date and user
5. WHEN user clicks "Amend" THEN the system SHALL open amendment dialog
6. WHEN user clicks "Renew" THEN the system SHALL create new contract linked to original
7. WHEN user clicks "Terminate" THEN the system SHALL require termination reason

**Components Needed:**
- `src/features/contracts/components/contract-detail-view.tsx`
- `src/features/contracts/components/contract-header.tsx`
- `src/features/contracts/components/contract-parties-section.tsx`
- `src/features/contracts/components/contract-obligations-section.tsx`
- `src/features/contracts/components/contract-amendments-section.tsx`
- `src/features/contracts/components/contract-documents-section.tsx`
- `src/features/contracts/components/contract-timeline.tsx`
- `src/features/contracts/components/add-obligation-dialog.tsx`
- `src/features/contracts/components/add-amendment-dialog.tsx`
- `src/features/contracts/components/terminate-contract-dialog.tsx`
- `src/features/contracts/components/renew-contract-dialog.tsx`

---

### 4.2.4 Contract Create/Edit Page

**Route**: `/dashboard/contracts/new`, `/dashboard/contracts/:contractId/edit`

**User Story**: As a lawyer, I want to create contracts with all relevant details so that I can track the full lifecycle.

**Acceptance Criteria (EARS Format):**
1. WHEN user creates contract THEN the system SHALL generate unique contract number
2. WHEN user selects client THEN the system SHALL auto-populate client as party
3. WHEN user sets expiry date THEN the system SHALL calculate renewal reminder date
4. WHEN user saves draft THEN the system SHALL allow saving incomplete data
5. WHEN user uploads document THEN the system SHALL link to document management

**Components Needed:**
- `src/features/contracts/components/contract-form.tsx`
- `src/features/contracts/components/contract-party-form.tsx`
- `src/features/contracts/components/contract-dates-form.tsx`

---

## 4.3 Matter Budgeting (MEDIUM PRIORITY)

**Extend Existing**: `src/types/budget.ts`, `src/services/budgetService.ts`

### 4.3.1 Link Budget to Cases

**User Story**: As a lawyer, I want to set a budget for each case so that I can track profitability and alert clients when approaching limits.

**Acceptance Criteria (EARS Format):**
1. WHEN creating/editing case THEN the system SHALL allow setting budget type (fixed/capped/hourly/estimate)
2. WHEN case has fixed fee THEN the system SHALL track against total budget
3. WHEN case is hourly THEN the system SHALL show estimated vs actual hours
4. WHEN time entry is added THEN the system SHALL update case budget consumed
5. WHEN budget consumed > 75% THEN the system SHALL show warning in case view
6. WHEN budget consumed > 90% THEN the system SHALL alert assigned attorney
7. WHEN budget exceeded THEN the system SHALL require approval for additional time

**Files to Modify:**
- `src/features/cases/components/case-form.tsx` - Add budget section
- `src/features/cases/components/case-detail-view.tsx` - Add budget card
- `src/types/case.ts` - Add budget fields

**Components Needed:**
- `src/features/cases/components/case-budget-card.tsx`
- `src/features/cases/components/budget-progress-bar.tsx`
- `src/features/cases/components/budget-alert-dialog.tsx`

---

## 4.4 Automated Workflows / Rules Engine (MEDIUM PRIORITY)

**Extend Existing**: `src/services/workflowService.ts`

### 4.4.1 Workflow Rules Types

```typescript
// src/types/workflow-rules.ts

export type TriggerType =
  | 'case_created'
  | 'case_status_changed'
  | 'hearing_scheduled'
  | 'deadline_approaching'
  | 'invoice_overdue'
  | 'retainer_low'
  | 'contract_expiring'
  | 'task_completed'
  | 'document_uploaded'
  | 'client_created'

export type ActionType =
  | 'create_task'
  | 'create_tasks_from_template'
  | 'send_email'
  | 'send_notification'
  | 'update_field'
  | 'assign_to'
  | 'create_calendar_event'
  | 'run_conflict_check'

export interface WorkflowRule {
  _id: string
  name: string
  description?: string
  isActive: boolean

  trigger: {
    type: TriggerType
    conditions: WorkflowCondition[]
  }

  actions: WorkflowAction[]

  createdBy: string
  createdAt: string
  updatedAt: string
  lastTriggeredAt?: string
  triggerCount: number
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

export interface WorkflowAction {
  type: ActionType
  config: Record<string, any>
  delay?: {
    value: number
    unit: 'minutes' | 'hours' | 'days'
  }
}
```

---

### 4.4.2 Workflow Rules List Page

**Route**: `/dashboard/settings/workflow-rules`

**User Story**: As a firm administrator, I want to define automated rules so that routine tasks happen automatically.

**Acceptance Criteria (EARS Format):**
1. WHEN user views rules list THEN the system SHALL display all rules with status and trigger count
2. WHEN user toggles rule active/inactive THEN the system SHALL update immediately
3. WHEN user clicks "New Rule" THEN the system SHALL open rule builder
4. WHEN rule triggers THEN the system SHALL log execution and increment counter

**Components Needed:**
- `src/features/settings/components/workflow-rules-list.tsx`
- `src/features/settings/components/workflow-rule-row.tsx`

---

### 4.4.3 Workflow Rule Builder

**User Story**: As a firm administrator, I want to build rules using a visual interface so that I don't need technical knowledge.

**Acceptance Criteria (EARS Format):**
1. WHEN user selects trigger THEN the system SHALL show relevant condition fields
2. WHEN user adds action THEN the system SHALL show action configuration form
3. WHEN user saves rule THEN the system SHALL validate all required fields
4. WHEN user tests rule THEN the system SHALL simulate execution and show results

**Components Needed:**
- `src/features/settings/components/workflow-rule-builder.tsx`
- `src/features/settings/components/trigger-selector.tsx`
- `src/features/settings/components/condition-builder.tsx`
- `src/features/settings/components/action-configurator.tsx`
- `src/features/settings/components/rule-test-dialog.tsx`

---

### 4.4.4 Pre-built Rule Templates

Provide templates for common law firm automations:

| Template Name | Trigger | Actions |
|---------------|---------|---------|
| New Case Checklist | Case Created | Create tasks from case type template |
| Hearing Prep Reminder | Hearing in 7 days | Create prep tasks, notify attorney |
| Invoice Follow-up | Invoice overdue 30 days | Send reminder email, create task |
| Retainer Alert | Retainer balance < 20% | Notify client and attorney |
| Contract Renewal | Contract expires in 60 days | Create task, notify responsible party |
| Welcome Client | Client created | Send welcome email, create onboarding tasks |

---

## 4.5 Client Portal (MEDIUM PRIORITY)

**Separate Application / Subdomain**

### 4.5.1 Portal Scope

This is a separate frontend application that clients access to:
- View their case status
- Download shared documents
- Upload requested documents
- Pay invoices online
- Message their attorney
- Sign documents (e-signature)
- View retainer balance

**Note**: Full portal is a separate project. For now, focus on:
1. Portal admin settings in main dashboard
2. Document sharing controls
3. Payment link generation

### 4.5.2 Portal Admin Settings

**Route**: `/dashboard/settings/client-portal`

**User Story**: As a firm administrator, I want to configure client portal settings so that I control what clients can see and do.

**Acceptance Criteria (EARS Format):**
1. WHEN admin enables portal THEN the system SHALL generate client access links
2. WHEN admin configures sharing THEN the system SHALL apply to all client views
3. WHEN admin sets payment integration THEN the system SHALL enable online payments

**Components Needed:**
- `src/features/settings/components/client-portal-settings.tsx`
- `src/features/settings/components/portal-access-controls.tsx`
- `src/features/settings/components/portal-payment-settings.tsx`

---

## 4.6 Compliance & License Tracking (LOW PRIORITY)

### 4.6.1 Compliance Items Types

```typescript
// src/types/compliance.ts

export type ComplianceType =
  | 'bar_license'
  | 'professional_insurance'
  | 'firm_registration'
  | 'cle_credits'
  | 'tax_registration'
  | 'other'

export interface ComplianceItem {
  _id: string
  type: ComplianceType
  name: string
  description?: string

  // Holder
  holderType: 'firm' | 'employee'
  holderId?: string // employee ID if applicable
  holderName: string

  // Dates
  issueDate?: string
  expiryDate: string
  renewalReminderDays: number

  // Status
  status: 'active' | 'expiring_soon' | 'expired' | 'renewed'

  // Documents
  documentIds: string[]

  // Renewal tracking
  renewalHistory: {
    renewedAt: string
    previousExpiry: string
    newExpiry: string
    renewedBy: string
    notes?: string
  }[]

  createdAt: string
  updatedAt: string
}
```

---

### 4.6.2 Compliance Dashboard

**Route**: `/dashboard/compliance`

**User Story**: As a firm administrator, I want to see all licenses and compliance items with their expiry dates so that I never miss a renewal.

**Acceptance Criteria (EARS Format):**
1. WHEN user views compliance dashboard THEN the system SHALL show all items grouped by status
2. WHEN item expires within reminder period THEN the system SHALL show in "Expiring Soon" section
3. WHEN item is expired THEN the system SHALL show prominent alert
4. WHEN user clicks "Renew" THEN the system SHALL open renewal dialog
5. WHEN renewal is recorded THEN the system SHALL update expiry and status

**Components Needed:**
- `src/features/compliance/components/compliance-dashboard.tsx`
- `src/features/compliance/components/compliance-item-card.tsx`
- `src/features/compliance/components/compliance-list-view.tsx`
- `src/features/compliance/components/renewal-dialog.tsx`
- `src/features/compliance/components/add-compliance-item-dialog.tsx`

---

# PART 5: ROUTES & QUERY KEYS

## 5.1 New Routes to Add

```typescript
// Add to src/constants/routes.ts

// Conflicts
conflicts: {
  list: '/dashboard/conflicts',
  detail: (checkId: string) => `/dashboard/conflicts/${checkId}`,
},

// Contracts
contracts: {
  list: '/dashboard/contracts',
  new: '/dashboard/contracts/new',
  detail: (contractId: string) => `/dashboard/contracts/${contractId}`,
  edit: (contractId: string) => `/dashboard/contracts/${contractId}/edit`,
},

// Compliance
compliance: {
  list: '/dashboard/compliance',
  new: '/dashboard/compliance/new',
  detail: (itemId: string) => `/dashboard/compliance/${itemId}`,
},

// Workflow Rules
workflowRules: {
  list: '/dashboard/settings/workflow-rules',
  new: '/dashboard/settings/workflow-rules/new',
  detail: (ruleId: string) => `/dashboard/settings/workflow-rules/${ruleId}`,
},

// Client Portal Settings
clientPortal: {
  settings: '/dashboard/settings/client-portal',
},
```

---

## 5.2 New Query Keys to Add

```typescript
// Add to src/lib/query-keys.ts

conflicts: {
  all: ['conflicts'] as const,
  lists: () => [...QueryKeys.conflicts.all, 'list'] as const,
  list: (filters?: any) => [...QueryKeys.conflicts.lists(), filters] as const,
  details: () => [...QueryKeys.conflicts.all, 'detail'] as const,
  detail: (id: string) => [...QueryKeys.conflicts.details(), id] as const,
  stats: () => [...QueryKeys.conflicts.all, 'stats'] as const,
},

contracts: {
  all: ['contracts'] as const,
  lists: () => [...QueryKeys.contracts.all, 'list'] as const,
  list: (filters?: any) => [...QueryKeys.contracts.lists(), filters] as const,
  details: () => [...QueryKeys.contracts.all, 'detail'] as const,
  detail: (id: string) => [...QueryKeys.contracts.details(), id] as const,
  expiring: () => [...QueryKeys.contracts.all, 'expiring'] as const,
  obligations: (id: string) => [...QueryKeys.contracts.detail(id), 'obligations'] as const,
},

compliance: {
  all: ['compliance'] as const,
  lists: () => [...QueryKeys.compliance.all, 'list'] as const,
  list: (filters?: any) => [...QueryKeys.compliance.lists(), filters] as const,
  details: () => [...QueryKeys.compliance.all, 'detail'] as const,
  detail: (id: string) => [...QueryKeys.compliance.details(), id] as const,
  expiring: () => [...QueryKeys.compliance.all, 'expiring'] as const,
},

workflowRules: {
  all: ['workflowRules'] as const,
  lists: () => [...QueryKeys.workflowRules.all, 'list'] as const,
  list: (filters?: any) => [...QueryKeys.workflowRules.lists(), filters] as const,
  details: () => [...QueryKeys.workflowRules.all, 'detail'] as const,
  detail: (id: string) => [...QueryKeys.workflowRules.details(), id] as const,
},
```

---

# PART 6: IMPLEMENTATION SUMMARY

## Files to Create (New Features)

### Conflict Check UI
| File | Type | Priority |
|------|------|----------|
| `src/features/conflicts/components/conflict-list-view.tsx` | Component | HIGH |
| `src/features/conflicts/components/conflict-detail-view.tsx` | Component | HIGH |
| `src/features/conflicts/components/conflict-columns.tsx` | Component | HIGH |
| `src/features/conflicts/components/conflict-table.tsx` | Component | HIGH |
| `src/features/conflicts/components/run-conflict-check-dialog.tsx` | Component | HIGH |
| `src/features/conflicts/components/conflict-resolution-dialog.tsx` | Component | HIGH |
| `src/features/conflicts/components/conflict-match-card.tsx` | Component | HIGH |
| `src/hooks/useConflictCheck.ts` | Hook | HIGH |
| `src/routes/_authenticated/dashboard.conflicts.index.tsx` | Route | HIGH |
| `src/routes/_authenticated/dashboard.conflicts.$checkId.tsx` | Route | HIGH |

### Contract Management
| File | Type | Priority |
|------|------|----------|
| `src/types/contract.ts` | Type | HIGH |
| `src/services/contractService.ts` | Service | HIGH |
| `src/hooks/useContracts.ts` | Hook | HIGH |
| `src/features/contracts/components/contract-list-view.tsx` | Component | HIGH |
| `src/features/contracts/components/contract-detail-view.tsx` | Component | HIGH |
| `src/features/contracts/components/contract-form.tsx` | Component | HIGH |
| `src/features/contracts/components/contract-columns.tsx` | Component | HIGH |
| `src/features/contracts/components/contract-obligations-section.tsx` | Component | HIGH |
| `src/routes/_authenticated/dashboard.contracts.index.tsx` | Route | HIGH |
| `src/routes/_authenticated/dashboard.contracts.new.tsx` | Route | HIGH |
| `src/routes/_authenticated/dashboard.contracts.$contractId.tsx` | Route | HIGH |

### Matter Budgeting
| File | Type | Priority |
|------|------|----------|
| `src/features/cases/components/case-budget-card.tsx` | Component | MEDIUM |
| `src/features/cases/components/budget-progress-bar.tsx` | Component | MEDIUM |
| `src/features/cases/components/budget-alert-dialog.tsx` | Component | MEDIUM |

### Workflow Rules
| File | Type | Priority |
|------|------|----------|
| `src/types/workflow-rules.ts` | Type | MEDIUM |
| `src/services/workflowRulesService.ts` | Service | MEDIUM |
| `src/hooks/useWorkflowRules.ts` | Hook | MEDIUM |
| `src/features/settings/components/workflow-rules-list.tsx` | Component | MEDIUM |
| `src/features/settings/components/workflow-rule-builder.tsx` | Component | MEDIUM |
| `src/routes/_authenticated/dashboard.settings.workflow-rules.tsx` | Route | MEDIUM |

### Compliance
| File | Type | Priority |
|------|------|----------|
| `src/types/compliance.ts` | Type | LOW |
| `src/services/complianceService.ts` | Service | LOW |
| `src/hooks/useCompliance.ts` | Hook | LOW |
| `src/features/compliance/components/compliance-dashboard.tsx` | Component | LOW |
| `src/features/compliance/components/compliance-list-view.tsx` | Component | LOW |
| `src/routes/_authenticated/dashboard.compliance.index.tsx` | Route | LOW |

---

## Files to Delete (Removal)

**Total: ~55 files**

### Manufacturing (20 files)
- All files in `src/features/manufacturing/`
- `src/hooks/use-manufacturing.ts`
- `src/services/manufacturingService.ts`
- `src/types/manufacturing.ts`
- All `src/routes/_authenticated/dashboard.manufacturing.*`

### Subcontracting (13 files)
- All files in `src/features/subcontracting/`
- `src/hooks/use-subcontracting.ts`
- `src/services/subcontractingService.ts`
- `src/types/subcontracting.ts`
- All `src/routes/_authenticated/dashboard.subcontracting.*`

### Quality (16 files)
- All files in `src/features/quality/`
- `src/hooks/use-quality.ts`
- `src/services/qualityService.ts`
- `src/types/quality.ts`
- All `src/routes/_authenticated/dashboard.quality.*`

---

## Files to Modify (Simplification & Fixes)

| File | Modification |
|------|--------------|
| `src/hooks/useBiometric.ts` | Remove fingerprint/facial/geofence hooks |
| `src/hooks/use-buying.ts` | Remove PO/RFQ/receipt hooks |
| `src/hooks/use-inventory.ts` | Remove warehouse/stock ledger hooks |
| `src/components/layout/data/sidebar-data.ts` | Fix translations, remove ERP modules |
| `src/constants/routes.ts` | Remove ERP routes, add new feature routes |
| `src/lib/query-keys.ts` | Remove ERP keys, add new feature keys |
| `src/locales/en/translation.json` | Add missing sidebar translations |
| `src/locales/ar/translation.json` | Add missing sidebar translations |

---

# PART 7: TESTING REQUIREMENTS

## Unit Tests
- [ ] Conflict check service methods
- [ ] Contract service methods
- [ ] Workflow rule validation
- [ ] Budget calculations

## Integration Tests
- [ ] Conflict check flow (create → review → resolve)
- [ ] Contract lifecycle (draft → sign → active → expire)
- [ ] Workflow rule execution

## E2E Tests
- [ ] Run conflict check before client creation
- [ ] Create and manage contract
- [ ] Set case budget and track time
- [ ] Build workflow rule

## Accessibility Tests
- [ ] All new forms keyboard navigable
- [ ] All dialogs have proper ARIA labels
- [ ] RTL layout works correctly

---

# PART 8: OUT OF SCOPE (FUTURE)

| Feature | Why It Can Wait |
|---------|-----------------|
| Full Client Portal App | Separate project, requires significant backend |
| E-Signature Integration | Requires third-party API (DocuSign) |
| Practice Area Profitability | Nice to have reporting |
| Advanced BI Dashboard | Nice to have analytics |
| Mobile App | Separate project |

---

# PART 9: OPEN QUESTIONS

- [ ] **Backend for Contracts**: Does backend API exist for contracts, or is this frontend-only for now?
- [ ] **Workflow Rules Backend**: Need backend support for trigger events and action execution
- [ ] **Compliance Backend**: Need API endpoints for compliance items
- [ ] **Translation Priority**: Should we fix all sidebar translations now or in separate PR?

---

# PART 10: DEPENDENCIES

## Existing (Reuse)
- `conflictCheckService.ts` - Already exists, comprehensive
- `workflowService.ts` - Already exists for case workflows
- `budgetService.ts` - Already exists for finance budgets
- `approvalService.ts` - Already exists for invoice/time approvals
- React Query patterns from existing features
- Table components from existing list views
- Form patterns from existing forms

## New (Need to Create)
- Contract service and types
- Compliance service and types
- Workflow rules service and types
- UI components for all new features

## Backend (Need to Confirm)
- Contract CRUD API
- Compliance CRUD API
- Workflow rules execution engine

---

**Approval Required Before Proceeding**

Please review this requirements document and confirm:
1. Agree with modules to remove (Manufacturing, Subcontracting, Quality)?
2. Agree with simplification approach (Biometric, Buying, Inventory)?
3. Priority of new features correct?
4. Any open questions to answer before implementation?

Type "approved" or provide feedback for revisions.
