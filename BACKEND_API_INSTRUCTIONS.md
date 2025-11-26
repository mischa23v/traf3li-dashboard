# Backend API Instructions

This document contains all API endpoints and MongoDB schemas required to support the frontend features. All endpoints require JWT authentication via Bearer token.

---

## Table of Contents

1. [Tags Service](#1-tags-service)
2. [Contacts Service](#2-contacts-service)
3. [Organizations Service](#3-organizations-service)
4. [Documents Service](#4-documents-service)
5. [Follow-ups Service](#5-follow-ups-service)
6. [Case Workflows Service](#6-case-workflows-service)
7. [Billing Rates Service](#7-billing-rates-service)
8. [Invoice Templates Service](#8-invoice-templates-service)
9. [Data Export/Import Service](#9-data-exportimport-service)
10. [Reports Service](#10-reports-service)
11. [Conflict Check Service](#11-conflict-check-service)
12. [Trust Account Service](#12-trust-account-service)
13. [Matter Budget Service](#13-matter-budget-service)

---

## 1. Tags Service

### MongoDB Schema: `Tag`

```javascript
const TagSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String },
  color: { type: String, required: true }, // Hex color
  description: { type: String },
  entityType: {
    type: String,
    enum: ['case', 'client', 'contact', 'document', 'all'],
    default: 'all'
  },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for faster lookups
TagSchema.index({ lawyerId: 1, name: 1 });
TagSchema.index({ lawyerId: 1, entityType: 1 });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | Get all tags with filters |
| GET | `/api/tags/:id` | Get single tag |
| POST | `/api/tags` | Create new tag |
| PATCH | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Delete tag |
| GET | `/api/tags/search?q=query` | Search tags |
| GET | `/api/tags/popular` | Get most used tags |
| POST | `/api/tags/:id/attach` | Attach tag to entity |
| POST | `/api/tags/:id/detach` | Detach tag from entity |
| GET | `/api/tags/entity/:entityType/:entityId` | Get tags for entity |

### Query Parameters for GET `/api/tags`
- `entityType`: Filter by entity type
- `search`: Search by name
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

---

## 2. Contacts Service

### MongoDB Schema: `Contact`

```javascript
const ContactSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  alternatePhone: { type: String },
  title: { type: String },
  company: { type: String },
  type: {
    type: String,
    enum: ['individual', 'organization', 'court', 'attorney', 'expert', 'government', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['client_contact', 'opposing_party', 'witness', 'expert_witness', 'judge', 'court_clerk', 'other']
  },
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  country: { type: String },
  notes: { type: String },
  tags: [{ type: String }],
  linkedCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  linkedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | Get all contacts with filters |
| GET | `/api/contacts/:id` | Get single contact |
| POST | `/api/contacts` | Create contact |
| PATCH | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| POST | `/api/contacts/bulk-delete` | Bulk delete |
| GET | `/api/contacts/search?q=query` | Search contacts |
| GET | `/api/contacts/case/:caseId` | Get contacts by case |
| GET | `/api/contacts/client/:clientId` | Get contacts by client |
| POST | `/api/contacts/:id/link-case` | Link to case |
| POST | `/api/contacts/:id/unlink-case` | Unlink from case |
| POST | `/api/contacts/:id/link-client` | Link to client |
| POST | `/api/contacts/:id/unlink-client` | Unlink from client |

---

## 3. Organizations Service

### MongoDB Schema: `Organization`

```javascript
const OrganizationSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String },
  type: {
    type: String,
    enum: ['company', 'government', 'court', 'law_firm', 'nonprofit', 'other'],
    required: true
  },
  registrationNumber: { type: String }, // Commercial Registration
  vatNumber: { type: String },
  phone: { type: String },
  fax: { type: String },
  email: { type: String },
  website: { type: String },
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  country: { type: String },
  industry: { type: String },
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'enterprise']
  },
  notes: { type: String },
  linkedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
  linkedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  linkedCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | Get all organizations |
| GET | `/api/organizations/:id` | Get single organization |
| POST | `/api/organizations` | Create organization |
| PATCH | `/api/organizations/:id` | Update organization |
| DELETE | `/api/organizations/:id` | Delete organization |
| POST | `/api/organizations/bulk-delete` | Bulk delete |
| GET | `/api/organizations/search?q=query` | Search organizations |
| GET | `/api/organizations/client/:clientId` | Get by client |

---

## 4. Documents Service

### MongoDB Schema: `Document`

```javascript
const DocumentSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  url: { type: String, required: true }, // S3 URL
  category: {
    type: String,
    enum: ['contract', 'judgment', 'evidence', 'correspondence', 'pleading', 'other'],
    required: true
  },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  description: { type: String },
  tags: [{ type: String }],
  isConfidential: { type: Boolean, default: false },
  isEncrypted: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, default: 1 },
  parentDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  shareToken: { type: String },
  shareExpiresAt: { type: Date },
  accessCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    pageCount: Number
  }
}, { timestamps: true });

// Document Version Schema (embedded or separate collection)
const DocumentVersionSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  version: { type: Number, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changeNote: { type: String }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | Get all documents with filters |
| GET | `/api/documents/:id` | Get single document |
| POST | `/api/documents/upload` | Upload new document (multipart/form-data) |
| PATCH | `/api/documents/:id` | Update document metadata |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/documents/case/:caseId` | Get documents by case |
| GET | `/api/documents/client/:clientId` | Get documents by client |
| GET | `/api/documents/stats` | Get document statistics |
| GET | `/api/documents/:id/download` | Download document (returns blob) |
| POST | `/api/documents/:id/share` | Generate shareable link |
| DELETE | `/api/documents/:id/share` | Revoke shareable link |
| POST | `/api/documents/:id/version` | Upload new version |
| GET | `/api/documents/:id/versions` | Get version history |
| POST | `/api/documents/:id/versions/:versionId/restore` | Restore version |
| POST | `/api/documents/:id/encrypt` | Encrypt document |
| POST | `/api/documents/:id/decrypt` | Decrypt document |
| GET | `/api/documents/search?q=query` | Search documents |
| GET | `/api/documents/recent` | Get recent documents |
| POST | `/api/documents/bulk-delete` | Bulk delete |
| PATCH | `/api/documents/:id/move` | Move to case |

### S3 Integration Notes
- Use AWS S3 for file storage
- Generate pre-signed URLs for downloads
- Store file in: `documents/{lawyerId}/{year}/{month}/{filename}`
- Implement virus scanning before storing

---

## 5. Follow-ups Service

### MongoDB Schema: `Followup`

```javascript
const FollowupSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'court_date', 'document_deadline', 'payment_reminder', 'general'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: { type: Date, required: true },
  dueTime: { type: String },
  entityType: {
    type: String,
    enum: ['case', 'client', 'contact', 'organization'],
    required: true
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionNotes: { type: String },
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']
    },
    endDate: { type: Date }
  },
  remindBefore: { type: Number }, // minutes
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'completed', 'cancelled', 'rescheduled', 'note_added']
    },
    note: String,
    previousDueDate: Date,
    newDueDate: Date,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/followups` | Get all follow-ups with filters |
| GET | `/api/followups/:id` | Get single follow-up |
| POST | `/api/followups` | Create follow-up |
| PATCH | `/api/followups/:id` | Update follow-up |
| DELETE | `/api/followups/:id` | Delete follow-up |
| GET | `/api/followups/entity/:entityType/:entityId` | Get by entity |
| GET | `/api/followups/stats` | Get statistics |
| GET | `/api/followups/overdue` | Get overdue follow-ups |
| GET | `/api/followups/upcoming?days=7` | Get upcoming |
| GET | `/api/followups/today` | Get today's follow-ups |
| POST | `/api/followups/:id/complete` | Complete follow-up |
| POST | `/api/followups/:id/cancel` | Cancel follow-up |
| POST | `/api/followups/:id/reschedule` | Reschedule follow-up |
| POST | `/api/followups/:id/notes` | Add note |
| POST | `/api/followups/bulk-complete` | Bulk complete |
| POST | `/api/followups/bulk-delete` | Bulk delete |

---

## 6. Case Workflows Service

### MongoDB Schema: `WorkflowTemplate`

```javascript
const StageRequirementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['document_upload', 'approval', 'payment', 'signature', 'review', 'task_completion'],
    required: true
  },
  name: { type: String, required: true },
  description: { type: String },
  isRequired: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

const WorkflowStageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String },
  descriptionAr: { type: String },
  color: { type: String, required: true },
  order: { type: Number, required: true },
  durationDays: { type: Number },
  requirements: [StageRequirementSchema],
  autoTransition: { type: Boolean, default: false },
  notifyOnEntry: { type: Boolean, default: true },
  notifyOnExit: { type: Boolean, default: false },
  allowedActions: [{ type: String }],
  isInitial: { type: Boolean, default: false },
  isFinal: { type: Boolean, default: false }
});

const StageTransitionSchema = new mongoose.Schema({
  fromStageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  toStageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  requiresApproval: { type: Boolean, default: false },
  approverRoles: [{ type: String }],
  conditions: [{ type: String }]
});

const WorkflowTemplateSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String },
  descriptionAr: { type: String },
  caseCategory: { type: String, required: true },
  stages: [WorkflowStageSchema],
  transitions: [StageTransitionSchema],
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Case Stage Progress Schema
const CaseStageProgressSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowTemplate', required: true },
  currentStageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  stageHistory: [{
    stageId: mongoose.Schema.Types.ObjectId,
    stageName: String,
    enteredAt: Date,
    exitedAt: Date,
    completedBy: mongoose.Schema.Types.ObjectId,
    notes: String,
    duration: Number
  }],
  completedRequirements: [{
    stageId: mongoose.Schema.Types.ObjectId,
    requirementId: mongoose.Schema.Types.ObjectId,
    completedAt: Date,
    completedBy: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed
  }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/case-workflows` | Get all workflow templates |
| GET | `/api/case-workflows/:id` | Get single workflow |
| GET | `/api/case-workflows/category/:category` | Get by case category |
| POST | `/api/case-workflows` | Create workflow |
| PATCH | `/api/case-workflows/:id` | Update workflow |
| DELETE | `/api/case-workflows/:id` | Delete workflow |
| POST | `/api/case-workflows/:id/duplicate` | Duplicate workflow |
| POST | `/api/case-workflows/:id/stages` | Add stage |
| PATCH | `/api/case-workflows/:id/stages/:stageId` | Update stage |
| DELETE | `/api/case-workflows/:id/stages/:stageId` | Delete stage |
| PATCH | `/api/case-workflows/:id/stages/reorder` | Reorder stages |
| POST | `/api/case-workflows/:id/stages/:stageId/requirements` | Add requirement |
| PATCH | `/api/case-workflows/:id/stages/:stageId/requirements/:reqId` | Update requirement |
| DELETE | `/api/case-workflows/:id/stages/:stageId/requirements/:reqId` | Delete requirement |
| POST | `/api/case-workflows/:id/transitions` | Add transition |
| PATCH | `/api/case-workflows/:id/transitions/:transitionId` | Update transition |
| DELETE | `/api/case-workflows/:id/transitions/:transitionId` | Delete transition |
| POST | `/api/case-workflows/cases/:caseId/initialize` | Initialize workflow for case |
| GET | `/api/case-workflows/cases/:caseId/progress` | Get case progress |
| POST | `/api/case-workflows/cases/:caseId/move` | Move case to stage |
| POST | `/api/case-workflows/cases/:caseId/requirements/complete` | Complete requirement |
| GET | `/api/case-workflows/statistics` | Get statistics |
| GET | `/api/case-workflows/presets` | Get preset templates |
| POST | `/api/case-workflows/presets/:presetId/import` | Import preset |

---

## 7. Billing Rates Service

### MongoDB Schema: `BillingRate` and `RateGroup`

```javascript
const BillingRateSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String },
  descriptionAr: { type: String },
  type: {
    type: String,
    enum: ['hourly', 'flat', 'contingency', 'retainer', 'task_based', 'milestone'],
    required: true
  },
  category: {
    type: String,
    enum: ['consultation', 'court_appearance', 'document_preparation', 'research', 'meeting', 'travel', 'administrative', 'other'],
    required: true
  },
  amount: { type: Number, required: true },
  currency: {
    type: String,
    enum: ['SAR', 'USD', 'EUR', 'GBP', 'AED'],
    default: 'SAR'
  },
  unit: { type: String }, // 'hour', 'day', 'document', etc.
  minimumCharge: { type: Number },
  roundingIncrement: { type: Number }, // minutes (e.g., 15)
  isActive: { type: Boolean, default: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'RateGroup' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const RateGroupSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String },
  descriptionAr: { type: String },
  color: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  discount: { type: Number, default: 0 }, // percentage
  applicableTo: [{
    type: String,
    enum: ['clients', 'cases', 'services']
  }]
}, { timestamps: true });

const RateCardSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String },
  descriptionAr: { type: String },
  entityType: {
    type: String,
    enum: ['client', 'case', 'contract'],
    required: true
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entries: [{
    rateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingRate', required: true },
    customAmount: Number,
    customCurrency: String,
    notes: String
  }],
  effectiveFrom: { type: Date, required: true },
  effectiveTo: { type: Date },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const TimeEntrySchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  rateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BillingRate', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // minutes
  startTime: { type: Date },
  endTime: { type: Date },
  date: { type: Date, required: true },
  isBillable: { type: Boolean, default: true },
  billedAmount: { type: Number },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  status: {
    type: String,
    enum: ['draft', 'approved', 'billed', 'paid'],
    default: 'draft'
  },
  notes: { type: String }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing/rates` | Get all rates |
| GET | `/api/billing/rates/:id` | Get single rate |
| POST | `/api/billing/rates` | Create rate |
| PATCH | `/api/billing/rates/:id` | Update rate |
| DELETE | `/api/billing/rates/:id` | Delete rate |
| GET | `/api/billing/groups` | Get all rate groups |
| GET | `/api/billing/groups/:id` | Get single group |
| POST | `/api/billing/groups` | Create group |
| PATCH | `/api/billing/groups/:id` | Update group |
| DELETE | `/api/billing/groups/:id` | Delete group |
| POST | `/api/billing/groups/:groupId/rates/:rateId` | Add rate to group |
| DELETE | `/api/billing/groups/:groupId/rates/:rateId` | Remove rate from group |
| GET | `/api/billing/rate-cards` | Get all rate cards |
| GET | `/api/billing/rate-cards/:entityType/:entityId` | Get rate card for entity |
| POST | `/api/billing/rate-cards` | Create rate card |
| PATCH | `/api/billing/rate-cards/:id` | Update rate card |
| DELETE | `/api/billing/rate-cards/:id` | Delete rate card |
| GET | `/api/billing/time-entries` | Get time entries |
| POST | `/api/billing/time-entries` | Create time entry |
| PATCH | `/api/billing/time-entries/:id` | Update time entry |
| DELETE | `/api/billing/time-entries/:id` | Delete time entry |
| POST | `/api/billing/time-entries/approve` | Bulk approve entries |
| GET | `/api/billing/statistics` | Get billing statistics |

---

## 8. Invoice Templates Service

### MongoDB Schema: `InvoiceTemplate`

```javascript
const InvoiceTemplateSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: { type: String },
  descriptionAr: { type: String },
  type: {
    type: String,
    enum: ['standard', 'detailed', 'summary', 'retainer', 'pro_bono', 'custom'],
    default: 'standard'
  },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  header: {
    showLogo: { type: Boolean, default: true },
    logoPosition: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    showCompanyInfo: { type: Boolean, default: true },
    showInvoiceNumber: { type: Boolean, default: true },
    showDate: { type: Boolean, default: true },
    showDueDate: { type: Boolean, default: true },
    customHeader: String,
    customHeaderAr: String
  },
  clientSection: {
    showClientName: { type: Boolean, default: true },
    showClientAddress: { type: Boolean, default: true },
    showClientPhone: { type: Boolean, default: true },
    showClientEmail: { type: Boolean, default: true },
    showClientVat: { type: Boolean, default: true }
  },
  itemsSection: {
    showDescription: { type: Boolean, default: true },
    showQuantity: { type: Boolean, default: true },
    showUnitPrice: { type: Boolean, default: true },
    showDiscount: { type: Boolean, default: true },
    showTax: { type: Boolean, default: true },
    showLineTotal: { type: Boolean, default: true },
    groupByCategory: { type: Boolean, default: false },
    showTimeEntries: { type: Boolean, default: true },
    showExpenses: { type: Boolean, default: true }
  },
  footer: {
    showSubtotal: { type: Boolean, default: true },
    showDiscount: { type: Boolean, default: true },
    showTax: { type: Boolean, default: true },
    showTotal: { type: Boolean, default: true },
    showPaymentTerms: { type: Boolean, default: true },
    showBankDetails: { type: Boolean, default: true },
    showNotes: { type: Boolean, default: true },
    showSignature: { type: Boolean, default: false },
    customFooter: String,
    customFooterAr: String,
    paymentTerms: String,
    paymentTermsAr: String,
    bankDetails: String,
    bankDetailsAr: String
  },
  styling: {
    primaryColor: { type: String, default: '#1E40AF' },
    accentColor: { type: String, default: '#3B82F6' },
    fontFamily: { type: String, enum: ['cairo', 'tajawal', 'arial', 'times'], default: 'cairo' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    tableStyle: { type: String, enum: ['striped', 'bordered', 'minimal'], default: 'striped' },
    pageSize: { type: String, enum: ['a4', 'letter'], default: 'a4' },
    orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' }
  },
  numberingFormat: {
    prefix: { type: String, default: 'INV-' },
    suffix: { type: String, default: '' },
    digits: { type: Number, default: 5 },
    startFrom: { type: Number, default: 1 },
    includeYear: { type: Boolean, default: true },
    includeMonth: { type: Boolean, default: false },
    separator: { type: String, default: '-' }
  },
  taxSettings: {
    vatRate: { type: Number, default: 15 },
    includeVatNumber: { type: Boolean, default: true },
    vatDisplayMode: { type: String, enum: ['inclusive', 'exclusive', 'none'], default: 'exclusive' }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoice-templates` | Get all templates |
| GET | `/api/invoice-templates/:id` | Get single template |
| GET | `/api/invoice-templates/default` | Get default template |
| POST | `/api/invoice-templates` | Create template |
| PATCH | `/api/invoice-templates/:id` | Update template |
| DELETE | `/api/invoice-templates/:id` | Delete template |
| POST | `/api/invoice-templates/:id/duplicate` | Duplicate template |
| POST | `/api/invoice-templates/:id/set-default` | Set as default |
| GET | `/api/invoice-templates/:id/preview` | Preview template |
| GET | `/api/invoice-templates/:id/export` | Export as JSON |
| POST | `/api/invoice-templates/import` | Import from JSON |

---

## 9. Data Export/Import Service

### MongoDB Schema: `ExportJob` and `ImportJob`

```javascript
const ExportJobSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: {
    type: String,
    enum: ['clients', 'cases', 'contacts', 'organizations', 'staff', 'invoices', 'time_entries', 'documents', 'followups', 'tags'],
    required: true
  },
  format: {
    type: String,
    enum: ['xlsx', 'csv', 'pdf', 'json'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: { type: Number, default: 0 },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  totalRecords: { type: Number },
  error: { type: String },
  filters: { type: mongoose.Schema.Types.Mixed },
  columns: [{ type: String }],
  completedAt: { type: Date },
  expiresAt: { type: Date } // Auto-delete file after expiration
}, { timestamps: true });

const ImportJobSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: {
    type: String,
    enum: ['clients', 'cases', 'contacts', 'organizations', 'staff', 'invoices', 'time_entries', 'documents', 'followups', 'tags'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'partial'],
    default: 'pending'
  },
  progress: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  errors: [{
    row: Number,
    field: String,
    message: String
  }],
  mapping: { type: mongoose.Schema.Types.Mixed },
  options: {
    skipDuplicates: Boolean,
    updateExisting: Boolean,
    dryRun: Boolean
  },
  completedAt: { type: Date }
}, { timestamps: true });

const ExportTemplateSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameAr: { type: String },
  entityType: { type: String, required: true },
  format: { type: String, required: true },
  columns: [{ type: String }],
  filters: { type: mongoose.Schema.Types.Mixed },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exports` | Start export job |
| GET | `/api/exports/:id` | Get export status |
| GET | `/api/exports` | Get export history |
| GET | `/api/exports/:id/download` | Download export file |
| DELETE | `/api/exports/:id` | Cancel export |
| POST | `/api/imports/preview` | Preview import file |
| POST | `/api/imports` | Start import job |
| GET | `/api/imports/:id` | Get import status |
| GET | `/api/imports` | Get import history |
| DELETE | `/api/imports/:id` | Cancel import |
| GET | `/api/imports/:id/errors` | Download error report |
| GET | `/api/export-templates` | Get export templates |
| POST | `/api/export-templates` | Create export template |
| PATCH | `/api/export-templates/:id` | Update export template |
| DELETE | `/api/export-templates/:id` | Delete export template |
| GET | `/api/exports/columns/:entityType` | Get available columns |
| GET | `/api/imports/template/:entityType` | Download sample template |

### Implementation Notes

- Use background job processing (Bull, Agenda, or similar)
- Stream large exports to S3
- Send email notification when job completes
- Auto-delete export files after 24 hours
- Validate imported data against schemas
- Support rollback on partial import failure

---

## 10. Reports Service

### MongoDB Schema: `SavedReport`

```javascript
const ReportConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['revenue', 'cases', 'clients', 'staff', 'time-tracking', 'billing', 'collections', 'custom'],
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    default: 'monthly'
  },
  startDate: { type: Date },
  endDate: { type: Date },
  filters: {
    clientIds: [mongoose.Schema.Types.ObjectId],
    caseIds: [mongoose.Schema.Types.ObjectId],
    staffIds: [mongoose.Schema.Types.ObjectId],
    caseTypes: [String],
    caseStatuses: [String],
    practiceAreas: [String],
    dateRange: {
      start: Date,
      end: Date
    },
    minAmount: Number,
    maxAmount: Number,
    tags: [String]
  },
  columns: [{ type: String }],
  groupBy: [{ type: String }],
  sortBy: { type: String },
  sortOrder: { type: String, enum: ['asc', 'desc'], default: 'asc' },
  format: {
    type: String,
    enum: ['table', 'chart', 'summary', 'detailed'],
    default: 'table'
  },
  chartType: {
    type: String,
    enum: ['bar', 'line', 'pie', 'area', 'donut']
  },
  isScheduled: { type: Boolean, default: false },
  scheduleFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },
  recipients: [{ type: String }] // email addresses
});

const SavedReportSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true },
  config: ReportConfigSchema,
  lastRun: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const DashboardWidgetSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['metric', 'chart', 'table', 'list'], required: true },
  title: { type: String, required: true },
  reportType: { type: String, required: true },
  config: { type: mongoose.Schema.Types.Mixed },
  size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  refreshInterval: { type: Number } // minutes
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Get saved reports |
| GET | `/api/reports/:id` | Get saved report |
| POST | `/api/reports` | Create saved report |
| PUT | `/api/reports/:id` | Update saved report |
| DELETE | `/api/reports/:id` | Delete saved report |
| POST | `/api/reports/revenue` | Generate revenue report |
| POST | `/api/reports/cases` | Generate case report |
| POST | `/api/reports/clients` | Generate client report |
| POST | `/api/reports/staff` | Generate staff report |
| POST | `/api/reports/time-tracking` | Generate time tracking report |
| POST | `/api/reports/billing` | Generate billing report |
| POST | `/api/reports/collections` | Generate collections report |
| POST | `/api/reports/:reportType/export` | Export report |
| POST | `/api/reports/schedule` | Schedule report |
| GET | `/api/reports/dashboard/widgets` | Get dashboard widgets |
| PUT | `/api/reports/dashboard/widgets` | Update dashboard widgets |
| GET | `/api/reports/summary` | Get report summary |

### Report Response Examples

#### Revenue Report Response
```json
{
  "data": {
    "totalRevenue": 150000,
    "totalBilled": 180000,
    "totalCollected": 150000,
    "outstandingAmount": 30000,
    "writeOffs": 5000,
    "revenueByPeriod": [
      { "period": "Jan 2025", "billed": 50000, "collected": 45000, "outstanding": 5000 }
    ],
    "revenueByClient": [],
    "revenueByPracticeArea": [],
    "revenueByStaff": []
  },
  "generatedAt": "2025-01-15T10:00:00Z",
  "period": { "start": "2025-01-01", "end": "2025-01-31" }
}
```

---

## 11. Conflict Check Service

### MongoDB Schema: `ConflictCheck`

```javascript
const ConflictMatchSchema = new mongoose.Schema({
  partySearched: { type: String, required: true },
  matchedEntity: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['client', 'contact', 'organization', 'case_party'], required: true },
    entityType: { type: String }
  },
  matchScore: { type: Number, required: true }, // 0-100
  matchType: {
    type: String,
    enum: ['client', 'adverse_party', 'related_party', 'witness', 'previous_representation', 'business_relationship', 'family_relationship'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  details: { type: String },
  relatedCases: [{
    caseId: mongoose.Schema.Types.ObjectId,
    caseNumber: String,
    caseName: String,
    role: String,
    status: String
  }],
  relatedMatters: [{
    matterId: mongoose.Schema.Types.ObjectId,
    matterNumber: String,
    description: String
  }],
  notes: { type: String },
  resolution: {
    status: { type: String, enum: ['cleared', 'flagged', 'waived'] },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    notes: { type: String }
  }
});

const ConflictCheckSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: { type: String, enum: ['client', 'case', 'matter'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  parties: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['individual', 'organization'] },
    aliases: [String],
    identifiers: [{
      type: String,
      value: String
    }],
    relatedParties: [String]
  }],
  searchScope: {
    activeClients: { type: Boolean, default: true },
    formerClients: { type: Boolean, default: true },
    adverseParties: { type: Boolean, default: true },
    relatedParties: { type: Boolean, default: true },
    contacts: { type: Boolean, default: true },
    organizations: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['pending', 'cleared', 'flagged', 'waived'],
    default: 'pending'
  },
  totalMatches: { type: Number, default: 0 },
  matches: [ConflictMatchSchema],
  clearanceNotes: { type: String },
  waiverDetails: {
    waivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    waivedAt: { type: Date },
    reason: { type: String },
    clientConsent: { type: Boolean },
    consentDetails: { type: String },
    expiresAt: { type: Date },
    attachments: [{ type: String }]
  },
  checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/conflict-checks` | Run conflict check |
| GET | `/api/conflict-checks/:id` | Get conflict check result |
| GET | `/api/conflict-checks` | Get conflict check history |
| PUT | `/api/conflict-checks/:id/matches/:matchId/resolve` | Resolve conflict match |
| POST | `/api/conflict-checks/:id/waiver` | Add conflict waiver |
| PUT | `/api/conflict-checks/:id/clear` | Clear conflict check |
| GET | `/api/conflict-checks/quick-search` | Quick conflict search |
| GET | `/api/conflict-checks/entity/:entityType/:entityId` | Get entity conflict checks |
| GET | `/api/conflict-checks/:id/export` | Export conflict report |

### Implementation Notes

- Use fuzzy matching algorithms (Levenshtein distance, soundex)
- Check against: clients, contacts, organizations, case parties
- Score matches based on similarity percentage
- Log all conflict checks for compliance
- Send alerts for high-severity matches

---

## 12. Trust Account Service

### MongoDB Schema: `TrustAccount`

```javascript
const TrustAccountSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  type: {
    type: String,
    enum: ['iolta', 'client_trust', 'escrow', 'retainer'],
    required: true
  },
  bankName: { type: String, required: true },
  bankAccountNumber: { type: String, required: true },
  routingNumber: { type: String },
  swiftCode: { type: String },
  currency: { type: String, default: 'SAR' },
  balance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  interestBearing: { type: Boolean, default: false },
  interestRate: { type: Number },
  lastReconciled: { type: Date },
  reconciledBalance: { type: Number },
  notes: { type: String }
}, { timestamps: true });

const ClientTrustBalanceSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrustAccount', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  balance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  lastTransaction: { type: Date },
  lastTransactionType: { type: String },
  lastTransactionAmount: { type: Number }
}, { timestamps: true });

const TrustTransactionSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrustAccount', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  transactionDate: { type: Date, required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'fee_disbursement', 'expense_disbursement', 'interest_credit', 'adjustment'],
    required: true
  },
  amount: { type: Number, required: true },
  runningBalance: { type: Number, required: true },
  reference: { type: String, required: true },
  description: { type: String, required: true },
  payee: { type: String },
  payor: { type: String },
  checkNumber: { type: String },
  status: {
    type: String,
    enum: ['pending', 'cleared', 'reconciled', 'void'],
    default: 'pending'
  },
  clearedDate: { type: Date },
  reconciledDate: { type: Date },
  relatedInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  relatedExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  notes: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const TrustReconciliationSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrustAccount', required: true },
  reconciliationDate: { type: Date, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  openingBalance: { type: Number, required: true },
  closingBalance: { type: Number, required: true },
  bankStatementBalance: { type: Number, required: true },
  clearedDeposits: { type: Number, default: 0 },
  clearedWithdrawals: { type: Number, default: 0 },
  outstandingDeposits: { type: Number, default: 0 },
  outstandingWithdrawals: { type: Number, default: 0 },
  difference: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'exception'],
    default: 'in_progress'
  },
  reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reconciledAt: { type: Date },
  notes: { type: String },
  adjustments: [{
    description: String,
    amount: Number,
    type: { type: String, enum: ['bank_adjustment', 'book_adjustment'] },
    reference: String
  }],
  attachments: [{ type: String }]
}, { timestamps: true });

const ThreeWayReconciliationSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrustAccount', required: true },
  reconciliationDate: { type: Date, required: true },
  bankBalance: { type: Number, required: true },
  bookBalance: { type: Number, required: true },
  clientLedgerBalance: { type: Number, required: true },
  isBalanced: { type: Boolean, required: true },
  discrepancies: {
    bankToBook: Number,
    bookToLedger: Number,
    bankToLedger: Number
  },
  details: [{
    clientId: mongoose.Schema.Types.ObjectId,
    clientName: String,
    ledgerBalance: Number,
    bookBalance: Number,
    difference: Number
  }],
  status: {
    type: String,
    enum: ['balanced', 'unbalanced', 'exception'],
    required: true
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trust-accounts` | Get all trust accounts |
| GET | `/api/trust-accounts/:id` | Get single account |
| POST | `/api/trust-accounts` | Create trust account |
| PUT | `/api/trust-accounts/:id` | Update trust account |
| PUT | `/api/trust-accounts/:id/close` | Close trust account |
| GET | `/api/trust-accounts/client-balances` | Get client trust balances |
| GET | `/api/trust-accounts/:accountId/clients/:clientId` | Get client balance |
| GET | `/api/trust-transactions` | Get transactions |
| GET | `/api/trust-transactions/:id` | Get single transaction |
| POST | `/api/trust-transactions/deposit` | Create deposit |
| POST | `/api/trust-transactions/withdrawal` | Create withdrawal |
| POST | `/api/trust-transactions/transfer` | Create transfer |
| PUT | `/api/trust-transactions/:id/void` | Void transaction |
| PUT | `/api/trust-transactions/:id/clear` | Mark transaction cleared |
| GET | `/api/trust-reconciliations` | Get reconciliations |
| GET | `/api/trust-reconciliations/:id` | Get single reconciliation |
| POST | `/api/trust-reconciliations` | Start reconciliation |
| PUT | `/api/trust-reconciliations/:id` | Update reconciliation |
| PUT | `/api/trust-reconciliations/:id/complete` | Complete reconciliation |
| POST | `/api/trust-reconciliations/:id/adjustments` | Add adjustment |
| POST | `/api/trust-accounts/:id/three-way-reconciliation` | Run three-way reconciliation |
| GET | `/api/trust-accounts/:id/three-way-reconciliation/history` | Get three-way history |
| GET | `/api/trust-accounts/:accountId/clients/:clientId/ledger` | Get client ledger |
| GET | `/api/trust-accounts/:id/export` | Export trust report |

### Implementation Notes

- Maintain running balances on all transactions
- Enforce double-entry bookkeeping
- Never allow negative client balances
- Log all transactions with audit trail
- Implement bank reconciliation workflow
- Three-way reconciliation: Bank = Books = Client Ledgers

---

## 13. Matter Budget Service

### MongoDB Schema: `MatterBudget`

```javascript
const BudgetTaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  estimatedAmount: { type: Number, default: 0 },
  actualAmount: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  }
});

const BudgetPhaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  budgetAmount: { type: Number, required: true },
  usedAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number },
  percentUsed: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  tasks: [BudgetTaskSchema]
});

const BudgetCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String }, // LEDES/UTBMS code
  budgetAmount: { type: Number, required: true },
  usedAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number },
  percentUsed: { type: Number, default: 0 },
  subcategories: [{
    name: String,
    budgetAmount: Number,
    usedAmount: Number
  }]
});

const BudgetAlertSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    required: true
  },
  message: { type: String, required: true },
  threshold: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  triggeredAt: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: { type: Date }
});

const MatterBudgetSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  matterNumber: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['fixed', 'time_based', 'phased', 'contingency', 'hybrid'],
    required: true
  },
  currency: { type: String, default: 'SAR' },
  totalBudget: { type: Number, required: true },
  usedAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number },
  percentUsed: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'approved', 'active', 'over_budget', 'completed', 'cancelled'],
    default: 'draft'
  },
  phases: [BudgetPhaseSchema],
  categories: [BudgetCategorySchema],
  alerts: [BudgetAlertSchema],
  alertThresholds: {
    warning: { type: Number, default: 80 }, // percentage
    critical: { type: Number, default: 95 }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  notes: { type: String },
  attachments: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const BudgetEntrySchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatterBudget', required: true },
  phaseId: { type: mongoose.Schema.Types.ObjectId },
  categoryId: { type: mongoose.Schema.Types.ObjectId },
  entryType: {
    type: String,
    enum: ['time', 'expense'],
    required: true
  },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sourceType: {
    type: String,
    enum: ['time_entry', 'expense', 'invoice_line'],
    required: true
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staffName: { type: String }
}, { timestamps: true });

// Budget templates for quick creation
const BudgetTemplateSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  phases: [{
    name: String,
    budgetPercent: Number
  }],
  categories: [{
    name: String,
    code: String,
    budgetPercent: Number
  }]
}, { timestamps: true });
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matter-budgets` | Get all budgets |
| GET | `/api/matter-budgets/:id` | Get single budget |
| GET | `/api/matters/:matterId/budget` | Get budget by matter |
| POST | `/api/matter-budgets` | Create budget |
| PUT | `/api/matter-budgets/:id` | Update budget |
| DELETE | `/api/matter-budgets/:id` | Delete budget |
| PUT | `/api/matter-budgets/:id/approve` | Approve budget |
| PUT | `/api/matter-budgets/:id/activate` | Activate budget |
| PUT | `/api/matter-budgets/:id/complete` | Complete budget |
| PUT | `/api/matter-budgets/:id/cancel` | Cancel budget |
| POST | `/api/matter-budgets/:id/phases` | Add phase |
| PUT | `/api/matter-budgets/:id/phases/:phaseId` | Update phase |
| DELETE | `/api/matter-budgets/:id/phases/:phaseId` | Delete phase |
| POST | `/api/matter-budgets/:id/categories` | Add category |
| PUT | `/api/matter-budgets/:id/categories/:categoryId` | Update category |
| DELETE | `/api/matter-budgets/:id/categories/:categoryId` | Delete category |
| POST | `/api/matter-budgets/:id/phases/:phaseId/tasks` | Add task |
| PUT | `/api/matter-budgets/:id/phases/:phaseId/tasks/:taskId` | Update task |
| DELETE | `/api/matter-budgets/:id/phases/:phaseId/tasks/:taskId` | Delete task |
| GET | `/api/matter-budgets/:id/entries` | Get budget entries |
| PUT | `/api/matter-budgets/:id/alerts/:alertId/acknowledge` | Acknowledge alert |
| PUT | `/api/matter-budgets/:id/thresholds` | Update alert thresholds |
| GET | `/api/matter-budgets/summary` | Get budget summary |
| GET | `/api/matter-budgets/:id/comparison` | Get budget comparison |
| GET | `/api/matter-budgets/:id/export` | Export budget |
| GET | `/api/matter-budgets/templates` | Get budget templates |
| POST | `/api/matter-budgets/from-template` | Create from template |

### Implementation Notes

- Auto-calculate usedAmount, remainingAmount, percentUsed
- Trigger alerts when thresholds are reached
- Link time entries and expenses to budget automatically
- Support LEDES/UTBMS billing codes
- Track budget vs actual variance
- Generate budget reports for clients

---

## General Implementation Notes

### Authentication
All endpoints require JWT Bearer token authentication. Include:
```
Authorization: Bearer <token>
```

### Multi-tenancy
Filter all queries by `lawyerId` from JWT token to ensure data isolation.

### Pagination
Standard pagination parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response format:
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

### Error Handling
Return standard error format:
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Timestamps
All schemas include `{ timestamps: true }` for `createdAt` and `updatedAt`.

### File Storage
Use AWS S3 for file storage:
- Documents: `documents/{lawyerId}/{year}/{month}/{filename}`
- Exports: `exports/{lawyerId}/{jobId}/{filename}`
- Imports: `imports/{lawyerId}/{jobId}/{filename}`

### Background Jobs
Use Bull or Agenda for:
- Export jobs
- Import jobs
- Email notifications
- Scheduled reports
- File cleanup (expired exports)

### WebSocket Events
Consider implementing real-time updates for:
- Follow-up reminders
- Budget alerts
- Import/Export progress
- Document sharing notifications
