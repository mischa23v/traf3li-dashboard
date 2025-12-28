# Backend Implementation Guide - Part 2: Finance Module

This guide continues from Part 1 and provides complete backend API specifications for Finance module features.

---

## Table of Contents - Part 2

1. [Budget Management](#1-budget-management)
2. [Financial Statements](#2-financial-statements)
3. [Dunning Management](#3-dunning-management)
4. [Customer Credit Management](#4-customer-credit-management)
5. [Enhanced Product Management](#5-enhanced-product-management)
6. [Financial Reports](#6-financial-reports)
7. [Finance Settings](#7-finance-settings)
8. [Integration Events](#8-integration-events)

---

## 1. Budget Management

### Database Schema

```javascript
// MongoDB Schema: Budget
const BudgetSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  description: String,
  descriptionAr: String,

  // Type
  type: {
    type: String,
    enum: ['expense', 'revenue', 'capital', 'project', 'department'],
    default: 'expense'
  },

  // Period
  fiscalYear: { type: Number, required: true },
  periodType: {
    type: String,
    enum: ['annual', 'quarterly', 'monthly'],
    default: 'annual'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'active', 'closed', 'cancelled'],
    default: 'draft'
  },

  // Ownership
  departmentId: Schema.Types.ObjectId,
  departmentName: String,
  departmentNameAr: String,
  projectId: Schema.Types.ObjectId,
  projectName: String,
  costCenterId: Schema.Types.ObjectId,
  costCenterName: String,
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  ownerName: String,

  // Amounts
  currency: { type: String, default: 'SAR' },
  totalBudget: { type: Number, required: true },
  allocatedAmount: { type: Number, default: 0 },
  spentAmount: { type: Number, default: 0 },
  committedAmount: { type: Number, default: 0 },
  availableAmount: Number,
  utilizationPercent: Number,

  // Line items
  lineItems: [{
    _id: Schema.Types.ObjectId,
    accountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    accountCode: String,
    accountName: String,
    accountNameAr: String,
    categoryId: Schema.Types.ObjectId,
    categoryName: String,
    description: String,
    descriptionAr: String,
    budgetedAmount: { type: Number, required: true },
    allocatedAmount: { type: Number, default: 0 },
    spentAmount: { type: Number, default: 0 },
    committedAmount: { type: Number, default: 0 },
    availableAmount: Number,
    notes: String,
    // Monthly breakdown
    monthlyAllocations: [{
      month: Number,
      year: Number,
      amount: Number,
      spentAmount: { type: Number, default: 0 }
    }]
  }],

  // Controls
  controlType: {
    type: String,
    enum: ['advisory', 'warning', 'strict'],
    default: 'warning'
  },
  warningThreshold: { type: Number, default: 80 },
  blockingThreshold: { type: Number, default: 100 },
  allowOverBudget: { type: Boolean, default: false },
  overBudgetApprovers: [Schema.Types.ObjectId],

  // Revisions
  revisions: [{
    version: Number,
    revisionDate: Date,
    revisedBy: Schema.Types.ObjectId,
    revisedByName: String,
    previousTotal: Number,
    newTotal: Number,
    changeAmount: Number,
    reason: String,
    approvedBy: Schema.Types.ObjectId,
    approvedDate: Date
  }],
  currentVersion: { type: Number, default: 1 },

  // Approval workflow
  approvalRequired: { type: Boolean, default: true },
  approvers: [{
    userId: Schema.Types.ObjectId,
    userName: String,
    level: Number,
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    approvedDate: Date,
    comments: String
  }],
  submittedAt: Date,
  submittedBy: Schema.Types.ObjectId,
  approvedAt: Date,
  approvedBy: Schema.Types.ObjectId,

  // Parent budget (for hierarchical budgets)
  parentBudgetId: Schema.Types.ObjectId,
  childBudgetIds: [Schema.Types.ObjectId],

  // Notes
  notes: String,
  notesAr: String,
  internalNotes: String,

  // Metadata
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: Schema.Types.ObjectId
}, { timestamps: true });

// Indexes
BudgetSchema.index({ firmId: 1, code: 1 }, { unique: true });
BudgetSchema.index({ firmId: 1, fiscalYear: 1, type: 1 });
BudgetSchema.index({ firmId: 1, status: 1 });
BudgetSchema.index({ firmId: 1, departmentId: 1 });
BudgetSchema.index({ firmId: 1, projectId: 1 });

// MongoDB Schema: BudgetTransaction
const BudgetTransactionSchema = new Schema({
  budgetId: { type: Schema.Types.ObjectId, ref: 'Budget', required: true },
  budgetLineItemId: Schema.Types.ObjectId,
  budgetCode: String,
  budgetName: String,

  // Transaction type
  transactionType: {
    type: String,
    enum: ['allocation', 'commitment', 'expense', 'release', 'transfer', 'adjustment'],
    required: true
  },

  // Source document
  sourceType: {
    type: String,
    enum: ['purchase_order', 'expense', 'invoice', 'journal_entry', 'manual', 'transfer']
  },
  sourceId: Schema.Types.ObjectId,
  sourceNumber: String,
  sourceDate: Date,

  // Amount
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  previousBalance: Number,
  newBalance: Number,

  // Account
  accountId: Schema.Types.ObjectId,
  accountCode: String,
  accountName: String,

  // Description
  description: String,
  descriptionAr: String,

  // For transfers
  transferToBudgetId: Schema.Types.ObjectId,
  transferToBudgetCode: String,
  transferFromBudgetId: Schema.Types.ObjectId,
  transferFromBudgetCode: String,

  // Status
  status: {
    type: String,
    enum: ['pending', 'posted', 'reversed'],
    default: 'pending'
  },

  // Reversal
  reversalOf: Schema.Types.ObjectId,
  reversedBy: Schema.Types.ObjectId,
  reversedAt: Date,
  reversalReason: String,

  // Period
  periodMonth: Number,
  periodYear: Number,

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
BudgetTransactionSchema.index({ budgetId: 1, transactionType: 1 });
BudgetTransactionSchema.index({ firmId: 1, sourceType: 1, sourceId: 1 });
BudgetTransactionSchema.index({ firmId: 1, periodYear: 1, periodMonth: 1 });
```

### API Endpoints

```
Base URL: /api/v1/budgets
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all budgets |
| GET | `/:id` | Get budget by ID |
| POST | `/` | Create budget |
| PUT | `/:id` | Update budget |
| DELETE | `/:id` | Delete budget (draft only) |
| POST | `/:id/submit` | Submit for approval |
| POST | `/:id/approve` | Approve budget |
| POST | `/:id/reject` | Reject budget |
| POST | `/:id/activate` | Activate budget |
| POST | `/:id/close` | Close budget |
| POST | `/:id/revise` | Create revision |
| POST | `/:id/duplicate` | Duplicate budget |
| GET | `/:id/transactions` | Get budget transactions |
| POST | `/:id/transactions` | Create transaction |
| POST | `/:id/transactions/:txnId/reverse` | Reverse transaction |
| POST | `/:id/transfer` | Transfer between budgets |
| POST | `/check` | Check budget availability |
| GET | `/stats` | Get budget statistics |
| GET | `/utilization-report` | Get utilization report |
| POST | `/bulk-import` | Bulk import budgets |
| GET | `/export` | Export budgets |

### Request/Response Examples

#### POST /api/v1/budgets/check

Check if expense is within budget before processing.

**Request:**
```json
{
  "budgetId": "64budget123...",
  "lineItemId": "64line456...",
  "accountId": "64acc789...",
  "amount": 5000,
  "transactionType": "commitment",
  "sourceType": "purchase_order",
  "sourceId": "64po123...",
  "sourceNumber": "PO-2024-0001"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "budgetId": "64budget123...",
    "budgetName": "Marketing 2024",
    "lineItemId": "64line456...",
    "accountName": "Advertising Expenses",
    "requestedAmount": 5000,
    "budgetedAmount": 50000,
    "spentAmount": 30000,
    "committedAmount": 10000,
    "availableAmount": 10000,
    "utilizationPercent": 80,
    "afterTransactionAvailable": 5000,
    "afterTransactionUtilization": 90,
    "warningThreshold": 80,
    "blockingThreshold": 100,
    "warnings": [
      "Budget utilization will exceed 80% warning threshold"
    ]
  },
  "message": "Budget check passed",
  "messageAr": "تم التحقق من الميزانية بنجاح"
}
```

**Response (Blocked):**
```json
{
  "success": false,
  "data": {
    "allowed": false,
    "budgetId": "64budget123...",
    "budgetName": "Marketing 2024",
    "requestedAmount": 15000,
    "availableAmount": 10000,
    "shortfall": 5000,
    "utilizationPercent": 80,
    "controlType": "strict",
    "requiresOverride": true,
    "overrideApprovers": [
      { "userId": "64user123...", "userName": "Finance Manager" }
    ]
  },
  "error": "Insufficient budget",
  "errorAr": "الميزانية غير كافية",
  "message": "Requested amount exceeds available budget by 5,000 SAR",
  "messageAr": "المبلغ المطلوب يتجاوز الميزانية المتاحة بـ 5,000 ريال"
}
```

#### POST /api/v1/budgets/:id/transfer

**Request:**
```json
{
  "fromLineItemId": "64line123...",
  "toBudgetId": "64budget456...",
  "toLineItemId": "64line789...",
  "amount": 10000,
  "reason": "Reallocation for Q4 campaign",
  "reasonAr": "إعادة تخصيص لحملة الربع الرابع"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transferId": "64transfer123...",
    "fromBudget": {
      "budgetId": "64budget123...",
      "newAvailable": 15000
    },
    "toBudget": {
      "budgetId": "64budget456...",
      "newAvailable": 30000
    },
    "amount": 10000,
    "transactions": [
      { "id": "64txn1...", "type": "release" },
      { "id": "64txn2...", "type": "allocation" }
    ]
  },
  "message": "Budget transfer completed",
  "messageAr": "تم نقل الميزانية بنجاح"
}
```

---

## 2. Financial Statements

### Database Schema

```javascript
// MongoDB Schema: FinancialStatement
const FinancialStatementSchema = new Schema({
  type: {
    type: String,
    enum: ['balance_sheet', 'income_statement', 'cash_flow', 'trial_balance',
           'general_ledger', 'profit_loss', 'equity_statement'],
    required: true
  },

  name: { type: String, required: true },
  nameAr: String,

  // Period
  periodType: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'ytd', 'custom'],
    required: true
  },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  fiscalYear: Number,
  fiscalQuarter: Number,
  fiscalMonth: Number,

  // Comparison
  comparisonType: {
    type: String,
    enum: ['none', 'previous_period', 'previous_year', 'budget', 'custom'],
    default: 'none'
  },
  comparisonPeriodStart: Date,
  comparisonPeriodEnd: Date,

  // Status
  status: {
    type: String,
    enum: ['draft', 'generated', 'reviewed', 'approved', 'published'],
    default: 'draft'
  },

  // Data
  currency: { type: String, default: 'SAR' },

  // Balance Sheet specific
  balanceSheetData: {
    assets: {
      currentAssets: [{
        accountId: Schema.Types.ObjectId,
        accountCode: String,
        accountName: String,
        accountNameAr: String,
        balance: Number,
        previousBalance: Number,
        budgetAmount: Number,
        variance: Number,
        variancePercent: Number
      }],
      totalCurrentAssets: Number,
      fixedAssets: [{
        accountId: Schema.Types.ObjectId,
        accountCode: String,
        accountName: String,
        accountNameAr: String,
        balance: Number,
        previousBalance: Number
      }],
      totalFixedAssets: Number,
      otherAssets: [{
        accountId: Schema.Types.ObjectId,
        accountCode: String,
        accountName: String,
        accountNameAr: String,
        balance: Number
      }],
      totalOtherAssets: Number,
      totalAssets: Number
    },
    liabilities: {
      currentLiabilities: [{
        accountId: Schema.Types.ObjectId,
        accountCode: String,
        accountName: String,
        accountNameAr: String,
        balance: Number,
        previousBalance: Number
      }],
      totalCurrentLiabilities: Number,
      longTermLiabilities: [{
        accountId: Schema.Types.ObjectId,
        accountCode: String,
        accountName: String,
        accountNameAr: String,
        balance: Number
      }],
      totalLongTermLiabilities: Number,
      totalLiabilities: Number
    },
    equity: {
      items: [{
        accountId: Schema.Types.ObjectId,
        accountCode: String,
        accountName: String,
        accountNameAr: String,
        balance: Number
      }],
      retainedEarnings: Number,
      currentYearProfit: Number,
      totalEquity: Number
    },
    totalLiabilitiesAndEquity: Number,
    isBalanced: Boolean
  },

  // Income Statement specific
  incomeStatementData: {
    revenue: [{
      accountId: Schema.Types.ObjectId,
      accountCode: String,
      accountName: String,
      accountNameAr: String,
      amount: Number,
      previousAmount: Number,
      budgetAmount: Number,
      variance: Number,
      variancePercent: Number
    }],
    totalRevenue: Number,
    costOfGoodsSold: [{
      accountId: Schema.Types.ObjectId,
      accountCode: String,
      accountName: String,
      accountNameAr: String,
      amount: Number
    }],
    totalCOGS: Number,
    grossProfit: Number,
    grossMarginPercent: Number,
    operatingExpenses: [{
      category: String,
      categoryAr: String,
      items: [{
        accountId: Schema.Types.ObjectId,
        accountCode: String,
        accountName: String,
        accountNameAr: String,
        amount: Number,
        previousAmount: Number,
        budgetAmount: Number
      }],
      subtotal: Number
    }],
    totalOperatingExpenses: Number,
    operatingIncome: Number,
    operatingMarginPercent: Number,
    otherIncome: [{
      accountId: Schema.Types.ObjectId,
      accountName: String,
      amount: Number
    }],
    totalOtherIncome: Number,
    otherExpenses: [{
      accountId: Schema.Types.ObjectId,
      accountName: String,
      amount: Number
    }],
    totalOtherExpenses: Number,
    incomeBeforeTax: Number,
    taxExpense: Number,
    netIncome: Number,
    netMarginPercent: Number,
    earningsPerShare: Number
  },

  // Cash Flow specific
  cashFlowData: {
    operatingActivities: {
      netIncome: Number,
      adjustments: [{
        description: String,
        descriptionAr: String,
        amount: Number
      }],
      changesInWorkingCapital: [{
        description: String,
        descriptionAr: String,
        amount: Number
      }],
      netCashFromOperating: Number
    },
    investingActivities: {
      items: [{
        description: String,
        descriptionAr: String,
        amount: Number
      }],
      netCashFromInvesting: Number
    },
    financingActivities: {
      items: [{
        description: String,
        descriptionAr: String,
        amount: Number
      }],
      netCashFromFinancing: Number
    },
    netChangeInCash: Number,
    beginningCashBalance: Number,
    endingCashBalance: Number
  },

  // Trial Balance specific
  trialBalanceData: {
    accounts: [{
      accountId: Schema.Types.ObjectId,
      accountCode: String,
      accountName: String,
      accountNameAr: String,
      accountType: String,
      debitBalance: Number,
      creditBalance: Number,
      netBalance: Number
    }],
    totalDebits: Number,
    totalCredits: Number,
    isBalanced: Boolean,
    difference: Number
  },

  // Generation info
  generatedAt: Date,
  generatedBy: Schema.Types.ObjectId,
  generationDuration: Number,

  // Review & Approval
  reviewedAt: Date,
  reviewedBy: Schema.Types.ObjectId,
  reviewNotes: String,
  approvedAt: Date,
  approvedBy: Schema.Types.ObjectId,
  approvalNotes: String,

  // Publishing
  publishedAt: Date,
  publishedBy: Schema.Types.ObjectId,
  publishedVersion: Number,

  // Notes
  notes: String,
  notesAr: String,

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
FinancialStatementSchema.index({ firmId: 1, type: 1, periodEnd: -1 });
FinancialStatementSchema.index({ firmId: 1, status: 1 });
```

### API Endpoints

```
Base URL: /api/v1/financial-statements
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all statements |
| GET | `/:id` | Get statement by ID |
| POST | `/generate` | Generate statement |
| PUT | `/:id` | Update statement |
| DELETE | `/:id` | Delete statement |
| POST | `/:id/regenerate` | Regenerate statement |
| POST | `/:id/review` | Mark as reviewed |
| POST | `/:id/approve` | Approve statement |
| POST | `/:id/publish` | Publish statement |
| GET | `/:id/pdf` | Generate PDF |
| GET | `/:id/excel` | Export to Excel |
| GET | `/balance-sheet` | Quick balance sheet |
| GET | `/income-statement` | Quick income statement |
| GET | `/cash-flow` | Quick cash flow |
| GET | `/trial-balance` | Quick trial balance |
| POST | `/compare` | Compare periods |

### Request/Response Examples

#### POST /api/v1/financial-statements/generate

**Request:**
```json
{
  "type": "income_statement",
  "periodType": "monthly",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "comparisonType": "previous_period",
  "includeBudget": true,
  "includePercentages": true,
  "groupByCategory": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "statement": {
      "_id": "64stmt123...",
      "type": "income_statement",
      "name": "Income Statement - January 2024",
      "nameAr": "قائمة الدخل - يناير 2024",
      "periodStart": "2024-01-01",
      "periodEnd": "2024-01-31",
      "status": "generated",
      "incomeStatementData": {
        "totalRevenue": 500000,
        "totalCOGS": 200000,
        "grossProfit": 300000,
        "grossMarginPercent": 60,
        "totalOperatingExpenses": 150000,
        "operatingIncome": 150000,
        "operatingMarginPercent": 30,
        "netIncome": 127500,
        "netMarginPercent": 25.5,
        "revenue": [...],
        "operatingExpenses": [...]
      },
      "generatedAt": "2024-02-01T10:30:00Z"
    }
  },
  "message": "Financial statement generated",
  "messageAr": "تم إنشاء القائمة المالية"
}
```

---

## 3. Dunning Management

### Database Schema

```javascript
// MongoDB Schema: DunningLevel
const DunningLevelSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  level: { type: Number, required: true },

  // Trigger
  daysOverdue: { type: Number, required: true },
  minAmount: Number,

  // Action
  actions: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'letter', 'phone_call', 'block_orders',
             'block_shipments', 'stop_credit', 'send_to_collection']
    },
    enabled: { type: Boolean, default: true },
    templateId: Schema.Types.ObjectId,
    templateName: String
  }],

  // Fees
  lateFeeType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  lateFeeValue: Number,
  maxLateFee: Number,

  // Interest
  interestRate: Number,
  interestCalculation: { type: String, enum: ['simple', 'compound'], default: 'simple' },

  // Escalation
  escalateToPerson: Schema.Types.ObjectId,
  escalateToRole: String,
  escalationEmailTemplate: Schema.Types.ObjectId,

  // Communication
  reminderSubject: String,
  reminderSubjectAr: String,
  reminderBody: String,
  reminderBodyAr: String,

  isActive: { type: Boolean, default: true },
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// MongoDB Schema: DunningRun
const DunningRunSchema = new Schema({
  runNumber: { type: String, required: true, unique: true },
  runDate: { type: Date, required: true, default: Date.now },

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'scheduled'
  },

  // Scope
  scope: {
    type: String,
    enum: ['all', 'customer_group', 'specific_customers', 'specific_invoices'],
    default: 'all'
  },
  customerGroupIds: [Schema.Types.ObjectId],
  customerIds: [Schema.Types.ObjectId],
  invoiceIds: [Schema.Types.ObjectId],

  // Parameters
  asOfDate: { type: Date, required: true },
  minOverdueDays: Number,
  minOverdueAmount: Number,

  // Results
  totalCustomersProcessed: { type: Number, default: 0 },
  totalInvoicesProcessed: { type: Number, default: 0 },
  totalAmountDunned: { type: Number, default: 0 },

  // Breakdown by level
  levelBreakdown: [{
    levelId: Schema.Types.ObjectId,
    levelName: String,
    level: Number,
    customerCount: Number,
    invoiceCount: Number,
    totalAmount: Number,
    emailsSent: Number,
    smsSent: Number,
    lettersPrinted: Number
  }],

  // Actions taken
  actions: [{
    _id: Schema.Types.ObjectId,
    customerId: Schema.Types.ObjectId,
    customerName: String,
    invoiceId: Schema.Types.ObjectId,
    invoiceNumber: String,
    levelId: Schema.Types.ObjectId,
    levelNumber: Number,
    actionType: String,
    actionStatus: { type: String, enum: ['pending', 'completed', 'failed'] },
    actionResult: String,
    actionError: String,
    sentAt: Date,
    lateFeeApplied: Number,
    interestApplied: Number
  }],

  // Errors
  errors: [{
    customerId: Schema.Types.ObjectId,
    customerName: String,
    invoiceId: Schema.Types.ObjectId,
    errorMessage: String,
    errorAt: Date
  }],

  // Timing
  startedAt: Date,
  completedAt: Date,
  durationMs: Number,

  // Scheduling
  isScheduled: { type: Boolean, default: false },
  scheduleId: String,
  nextRunDate: Date,

  notes: String,
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// MongoDB Schema: CustomerDunningStatus
const CustomerDunningStatusSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  customerName: String,
  customerNameAr: String,

  // Current status
  currentDunningLevel: { type: Number, default: 0 },
  currentDunningLevelId: Schema.Types.ObjectId,
  currentDunningLevelName: String,

  // Summary
  totalOverdueInvoices: { type: Number, default: 0 },
  totalOverdueAmount: { type: Number, default: 0 },
  oldestOverdueDays: { type: Number, default: 0 },
  lastDunningDate: Date,
  lastDunningRunId: Schema.Types.ObjectId,

  // Restrictions applied
  ordersBlocked: { type: Boolean, default: false },
  shipmentsBlocked: { type: Boolean, default: false },
  creditStopped: { type: Boolean, default: false },
  sentToCollection: { type: Boolean, default: false },
  collectionAgencyId: Schema.Types.ObjectId,
  sentToCollectionDate: Date,

  // Late fees and interest
  totalLateFees: { type: Number, default: 0 },
  totalInterest: { type: Number, default: 0 },

  // History
  history: [{
    date: Date,
    runId: Schema.Types.ObjectId,
    level: Number,
    action: String,
    invoiceIds: [Schema.Types.ObjectId],
    amount: Number,
    notes: String
  }],

  // Exclusion
  excludeFromDunning: { type: Boolean, default: false },
  exclusionReason: String,
  exclusionExpiryDate: Date,
  excludedBy: Schema.Types.ObjectId,

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/dunning
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/levels` | Get all dunning levels |
| GET | `/levels/:id` | Get level by ID |
| POST | `/levels` | Create dunning level |
| PUT | `/levels/:id` | Update level |
| DELETE | `/levels/:id` | Delete level |
| GET | `/runs` | Get all dunning runs |
| GET | `/runs/:id` | Get run by ID |
| POST | `/runs` | Create/execute dunning run |
| POST | `/runs/:id/execute` | Execute scheduled run |
| POST | `/runs/:id/cancel` | Cancel run |
| GET | `/runs/:id/report` | Get run report |
| GET | `/customer-status` | Get customer statuses |
| GET | `/customer-status/:customerId` | Get customer status |
| PUT | `/customer-status/:customerId/exclude` | Exclude from dunning |
| PUT | `/customer-status/:customerId/include` | Include in dunning |
| POST | `/customer-status/:customerId/reset` | Reset status |
| POST | `/customer-status/:customerId/release` | Release restrictions |
| GET | `/stats` | Get dunning statistics |
| GET | `/schedule` | Get scheduled runs |
| POST | `/schedule` | Create schedule |
| DELETE | `/schedule/:id` | Delete schedule |

### Request/Response Examples

#### POST /api/v1/dunning/runs

**Request:**
```json
{
  "asOfDate": "2024-01-31",
  "scope": "all",
  "minOverdueDays": 1,
  "minOverdueAmount": 100,
  "executeImmediately": true,
  "sendNotifications": true,
  "applyFees": true,
  "notes": "Monthly dunning run"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "run": {
      "_id": "64run123...",
      "runNumber": "DUN-2024-0012",
      "runDate": "2024-01-31T10:00:00Z",
      "status": "completed",
      "totalCustomersProcessed": 45,
      "totalInvoicesProcessed": 78,
      "totalAmountDunned": 250000,
      "levelBreakdown": [
        {
          "levelName": "First Reminder",
          "level": 1,
          "customerCount": 25,
          "invoiceCount": 40,
          "totalAmount": 100000,
          "emailsSent": 25
        },
        {
          "levelName": "Second Notice",
          "level": 2,
          "customerCount": 15,
          "invoiceCount": 28,
          "totalAmount": 100000,
          "emailsSent": 15
        },
        {
          "levelName": "Final Warning",
          "level": 3,
          "customerCount": 5,
          "invoiceCount": 10,
          "totalAmount": 50000,
          "emailsSent": 5,
          "lettersPrinted": 5
        }
      ],
      "completedAt": "2024-01-31T10:05:00Z",
      "durationMs": 300000
    }
  },
  "message": "Dunning run completed",
  "messageAr": "تم تنفيذ جولة التحصيل"
}
```

---

## 4. Customer Credit Management

### Database Schema

```javascript
// MongoDB Schema: CustomerCredit
const CustomerCreditSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, unique: true },
  customerName: String,
  customerNameAr: String,
  customerCode: String,

  // Credit Limit
  creditLimit: { type: Number, default: 0 },
  creditLimitCurrency: { type: String, default: 'SAR' },
  temporaryCreditLimit: Number,
  temporaryCreditLimitExpiry: Date,
  effectiveCreditLimit: Number,

  // Current Status
  currentBalance: { type: Number, default: 0 },
  availableCredit: { type: Number, default: 0 },
  utilizationPercent: { type: Number, default: 0 },

  // Breakdown
  outstandingInvoices: { type: Number, default: 0 },
  overdueAmount: { type: Number, default: 0 },
  pendingOrders: { type: Number, default: 0 },
  unappliedPayments: { type: Number, default: 0 },

  // Credit Score
  creditScore: Number,
  creditRating: { type: String, enum: ['excellent', 'good', 'fair', 'poor', 'risky'] },
  lastCreditReviewDate: Date,
  nextCreditReviewDate: Date,

  // Payment behavior
  averagePaymentDays: Number,
  onTimePaymentPercent: Number,
  latePaymentCount: { type: Number, default: 0 },
  totalInvoices: { type: Number, default: 0 },

  // Terms
  paymentTerms: String,
  paymentTermsDays: Number,
  earlyPaymentDiscount: Number,
  earlyPaymentDays: Number,

  // Controls
  creditHold: { type: Boolean, default: false },
  creditHoldReason: String,
  creditHoldDate: Date,
  creditHoldBy: Schema.Types.ObjectId,
  orderBlock: { type: Boolean, default: false },
  shipmentBlock: { type: Boolean, default: false },

  // Insurance
  creditInsured: { type: Boolean, default: false },
  insuranceProvider: String,
  insurancePolicyNumber: String,
  insuredAmount: Number,
  insuranceExpiry: Date,

  // Bank guarantee
  bankGuarantee: { type: Boolean, default: false },
  guaranteeBank: String,
  guaranteeAmount: Number,
  guaranteeExpiry: Date,
  guaranteeDocumentUrl: String,

  // History
  creditLimitHistory: [{
    previousLimit: Number,
    newLimit: Number,
    changeDate: Date,
    changedBy: Schema.Types.ObjectId,
    reason: String
  }],

  // Approval
  lastApprovalDate: Date,
  approvedBy: Schema.Types.ObjectId,
  approvalNotes: String,

  notes: String,
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true }
}, { timestamps: true });

// MongoDB Schema: CreditApplication
const CreditApplicationSchema = new Schema({
  applicationNumber: { type: String, required: true, unique: true },

  customerId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  customerName: String,
  customerNameAr: String,

  // Request
  requestedCreditLimit: { type: Number, required: true },
  requestedPaymentTerms: String,
  requestReason: String,
  requestReasonAr: String,

  // Current
  currentCreditLimit: Number,
  currentBalance: Number,

  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'partially_approved',
           'rejected', 'cancelled'],
    default: 'draft'
  },

  // Supporting documents
  documents: [{
    name: String,
    type: { type: String, enum: ['financial_statement', 'bank_reference',
            'trade_reference', 'cr_report', 'other'] },
    url: String,
    uploadedAt: Date
  }],

  // Analysis
  financialAnalysis: {
    annualRevenue: Number,
    netProfit: Number,
    debtToEquityRatio: Number,
    currentRatio: Number,
    quickRatio: Number,
    cashFlowPositive: Boolean,
    notes: String
  },

  // References
  tradeReferences: [{
    companyName: String,
    contactName: String,
    contactPhone: String,
    contactEmail: String,
    creditLimit: Number,
    paymentHistory: String,
    verified: Boolean,
    verifiedDate: Date,
    verifiedBy: Schema.Types.ObjectId
  }],
  bankReferences: [{
    bankName: String,
    accountNumber: String,
    contactName: String,
    contactPhone: String,
    verified: Boolean,
    verifiedDate: Date
  }],

  // Scoring
  creditScore: Number,
  riskAssessment: {
    level: { type: String, enum: ['low', 'medium', 'high'] },
    factors: [String],
    notes: String
  },

  // Decision
  approvedCreditLimit: Number,
  approvedPaymentTerms: String,
  decisionDate: Date,
  decisionBy: Schema.Types.ObjectId,
  decisionNotes: String,
  rejectionReason: String,

  // Validity
  validFrom: Date,
  validTo: Date,
  reviewDate: Date,

  // Workflow
  reviewers: [{
    userId: Schema.Types.ObjectId,
    userName: String,
    role: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    reviewDate: Date,
    comments: String
  }],

  submittedAt: Date,
  submittedBy: Schema.Types.ObjectId,

  notes: String,
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/customer-credit
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all customer credits |
| GET | `/:customerId` | Get customer credit |
| PUT | `/:customerId` | Update credit settings |
| PUT | `/:customerId/limit` | Update credit limit |
| PUT | `/:customerId/temporary-limit` | Set temporary limit |
| POST | `/:customerId/hold` | Put on credit hold |
| POST | `/:customerId/release` | Release credit hold |
| GET | `/:customerId/history` | Get credit history |
| POST | `/check` | Check credit availability |
| GET | `/at-risk` | Get at-risk customers |
| GET | `/over-limit` | Get over-limit customers |
| GET | `/stats` | Get credit statistics |

```
Base URL: /api/v1/credit-applications
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all applications |
| GET | `/:id` | Get application by ID |
| POST | `/` | Create application |
| PUT | `/:id` | Update application |
| DELETE | `/:id` | Delete (draft only) |
| POST | `/:id/submit` | Submit for review |
| POST | `/:id/review` | Add review |
| POST | `/:id/approve` | Approve application |
| POST | `/:id/reject` | Reject application |
| GET | `/:id/pdf` | Generate PDF report |

---

## 5. Enhanced Product Management

### Database Schema

```javascript
// MongoDB Schema: Product (Enhanced)
const ProductEnhancedSchema = new Schema({
  // Basic info (existing)
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  description: String,
  descriptionAr: String,

  // Product type
  productType: {
    type: String,
    enum: ['stockable', 'service', 'consumable', 'bundle', 'variant_template'],
    default: 'stockable'
  },

  // Variants
  hasVariants: { type: Boolean, default: false },
  variantTemplateId: Schema.Types.ObjectId,
  variantAttributes: [{
    attributeId: Schema.Types.ObjectId,
    attributeName: String,
    attributeNameAr: String,
    value: String,
    valueAr: String
  }],

  // Multiple barcodes
  barcodes: [{
    _id: Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['ean13', 'ean8', 'upc', 'code128', 'code39', 'qr', 'internal'],
      default: 'ean13'
    },
    code: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    description: String,
    packagingType: String,
    unitsPerPackage: { type: Number, default: 1 }
  }],
  primaryBarcode: String,

  // Multiple units of measure
  baseUnitId: { type: Schema.Types.ObjectId, ref: 'UnitOfMeasure', required: true },
  baseUnitName: String,
  baseUnitNameAr: String,
  alternateUnits: [{
    _id: Schema.Types.ObjectId,
    unitId: { type: Schema.Types.ObjectId, ref: 'UnitOfMeasure' },
    unitName: String,
    unitNameAr: String,
    conversionFactor: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
    barcode: String,
    purchaseDefault: Boolean,
    salesDefault: Boolean
  }],

  // Multiple suppliers
  suppliers: [{
    _id: Schema.Types.ObjectId,
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: String,
    supplierNameAr: String,
    supplierCode: String,
    supplierProductCode: String,
    supplierProductName: String,
    isPrimary: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    unitId: Schema.Types.ObjectId,
    unitName: String,
    price: Number,
    currency: { type: String, default: 'SAR' },
    minOrderQuantity: Number,
    leadTimeDays: Number,
    lastPurchaseDate: Date,
    lastPurchasePrice: Number,
    notes: String
  }],
  primarySupplierId: Schema.Types.ObjectId,

  // Pricing
  costPrice: { type: Number, default: 0 },
  costPriceMethod: {
    type: String,
    enum: ['manual', 'fifo', 'lifo', 'average', 'last_purchase'],
    default: 'average'
  },
  sellingPrice: { type: Number, default: 0 },
  minimumSellingPrice: Number,
  wholesalePrice: Number,
  retailPrice: Number,
  currency: { type: String, default: 'SAR' },

  // Categorization
  categoryId: Schema.Types.ObjectId,
  categoryName: String,
  subCategoryId: Schema.Types.ObjectId,
  brandId: Schema.Types.ObjectId,
  brandName: String,
  brandNameAr: String,
  tags: [String],

  // Stock settings
  trackStock: { type: Boolean, default: true },
  reorderLevel: Number,
  reorderQuantity: Number,
  minStockLevel: Number,
  maxStockLevel: Number,
  defaultWarehouseId: Schema.Types.ObjectId,
  shelfLife: Number,
  shelfLifeUnit: { type: String, enum: ['days', 'months', 'years'], default: 'days' },

  // Physical attributes
  weight: Number,
  weightUnit: { type: String, default: 'kg' },
  length: Number,
  width: Number,
  height: Number,
  dimensionUnit: { type: String, default: 'cm' },
  volume: Number,
  volumeUnit: { type: String, default: 'l' },

  // Images
  images: [{
    url: String,
    isPrimary: Boolean,
    alt: String,
    altAr: String,
    sortOrder: Number
  }],
  primaryImage: String,

  // Status
  isActive: { type: Boolean, default: true },
  isSellable: { type: Boolean, default: true },
  isPurchasable: { type: Boolean, default: true },

  // Tax
  taxable: { type: Boolean, default: true },
  taxRate: { type: Number, default: 15 },
  taxCategoryId: Schema.Types.ObjectId,
  hsCode: String,

  // Custom fields
  customFields: Schema.Types.Mixed,

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
ProductEnhancedSchema.index({ firmId: 1, code: 1 }, { unique: true });
ProductEnhancedSchema.index({ firmId: 1, 'barcodes.code': 1 });
ProductEnhancedSchema.index({ firmId: 1, primaryBarcode: 1 });
ProductEnhancedSchema.index({ firmId: 1, categoryId: 1 });
ProductEnhancedSchema.index({ firmId: 1, brandId: 1 });
ProductEnhancedSchema.index({ firmId: 1, 'suppliers.supplierId': 1 });

// MongoDB Schema: ProductVariantAttribute
const ProductVariantAttributeSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,

  values: [{
    _id: Schema.Types.ObjectId,
    value: { type: String, required: true },
    valueAr: String,
    sortOrder: Number,
    colorCode: String,
    imageUrl: String
  }],

  displayType: {
    type: String,
    enum: ['dropdown', 'radio', 'color_swatch', 'image_swatch'],
    default: 'dropdown'
  },
  sortOrder: Number,
  isActive: { type: Boolean, default: true },

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// MongoDB Schema: UnitOfMeasure
const UnitOfMeasureSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  symbol: String,
  symbolAr: String,

  category: {
    type: String,
    enum: ['quantity', 'weight', 'volume', 'length', 'area', 'time'],
    default: 'quantity'
  },

  isBaseUnit: { type: Boolean, default: false },
  baseUnitId: Schema.Types.ObjectId,
  conversionToBase: Number,

  decimalPlaces: { type: Number, default: 0 },
  allowFractions: { type: Boolean, default: false },

  isActive: { type: Boolean, default: true },
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// MongoDB Schema: Brand
const BrandSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  description: String,
  descriptionAr: String,

  logoUrl: String,
  websiteUrl: String,

  isActive: { type: Boolean, default: true },

  // Statistics (cached)
  productCount: { type: Number, default: 0 },

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/products-enhanced
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all products |
| GET | `/:id` | Get product by ID |
| POST | `/` | Create product |
| PUT | `/:id` | Update product |
| DELETE | `/:id` | Delete product |
| GET | `/by-barcode/:barcode` | Get by barcode |
| POST | `/:id/barcodes` | Add barcode |
| DELETE | `/:id/barcodes/:barcodeId` | Remove barcode |
| POST | `/:id/suppliers` | Add supplier |
| PUT | `/:id/suppliers/:supplierId` | Update supplier |
| DELETE | `/:id/suppliers/:supplierId` | Remove supplier |
| POST | `/:id/units` | Add alternate unit |
| PUT | `/:id/units/:unitId` | Update unit |
| DELETE | `/:id/units/:unitId` | Remove unit |
| POST | `/:id/variants/generate` | Generate variants |
| GET | `/:id/variants` | Get variants |
| POST | `/bulk-import` | Bulk import |
| GET | `/export` | Export products |

```
Base URL: /api/v1/variant-attributes
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all attributes |
| GET | `/:id` | Get attribute |
| POST | `/` | Create attribute |
| PUT | `/:id` | Update attribute |
| DELETE | `/:id` | Delete attribute |

```
Base URL: /api/v1/units-of-measure
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all units |
| GET | `/:id` | Get unit |
| POST | `/` | Create unit |
| PUT | `/:id` | Update unit |
| DELETE | `/:id` | Delete unit |
| GET | `/by-category/:category` | Get by category |
| POST | `/convert` | Convert between units |

```
Base URL: /api/v1/brands
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all brands |
| GET | `/:id` | Get brand |
| POST | `/` | Create brand |
| PUT | `/:id` | Update brand |
| DELETE | `/:id` | Delete brand |
| GET | `/:id/products` | Get brand products |

---

## 6. Financial Reports

### API Endpoints

```
Base URL: /api/v1/reports/finance
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/aging-report` | Accounts receivable aging |
| GET | `/payables-aging` | Accounts payable aging |
| GET | `/cash-flow-forecast` | Cash flow forecast |
| GET | `/revenue-by-customer` | Revenue by customer |
| GET | `/revenue-by-product` | Revenue by product |
| GET | `/revenue-by-salesperson` | Revenue by salesperson |
| GET | `/expense-by-category` | Expense breakdown |
| GET | `/profit-by-product` | Product profitability |
| GET | `/profit-by-customer` | Customer profitability |
| GET | `/budget-vs-actual` | Budget variance report |
| GET | `/tax-summary` | Tax summary report |
| GET | `/vat-return` | VAT return data |
| GET | `/general-ledger` | General ledger report |
| GET | `/journal-entries` | Journal entries report |
| GET | `/bank-reconciliation` | Bank reconciliation |
| GET | `/audit-trail` | Financial audit trail |

### Request/Response Examples

#### GET /api/v1/reports/finance/aging-report

**Query Parameters:**
```
?asOfDate=2024-01-31
&groupBy=customer
&includeDetails=true
&agingBuckets=0,30,60,90,120
&excludeCustomerIds=64cust123,64cust456
&minAmount=1000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2024-01-31",
    "currency": "SAR",
    "summary": {
      "totalReceivables": 500000,
      "current": 200000,
      "overdue1_30": 150000,
      "overdue31_60": 80000,
      "overdue61_90": 50000,
      "overdue91Plus": 20000,
      "averageDaysOutstanding": 35
    },
    "buckets": [
      { "name": "Current", "nameAr": "الحالي", "min": 0, "max": 0, "amount": 200000, "percent": 40 },
      { "name": "1-30 Days", "nameAr": "1-30 يوم", "min": 1, "max": 30, "amount": 150000, "percent": 30 },
      { "name": "31-60 Days", "nameAr": "31-60 يوم", "min": 31, "max": 60, "amount": 80000, "percent": 16 },
      { "name": "61-90 Days", "nameAr": "61-90 يوم", "min": 61, "max": 90, "amount": 50000, "percent": 10 },
      { "name": "Over 90 Days", "nameAr": "أكثر من 90 يوم", "min": 91, "max": null, "amount": 20000, "percent": 4 }
    ],
    "details": [
      {
        "customerId": "64cust789...",
        "customerName": "ABC Company",
        "customerNameAr": "شركة أ ب ج",
        "creditLimit": 100000,
        "totalOutstanding": 75000,
        "current": 30000,
        "overdue1_30": 25000,
        "overdue31_60": 15000,
        "overdue61_90": 5000,
        "overdue91Plus": 0,
        "invoices": [
          {
            "invoiceId": "64inv123...",
            "invoiceNumber": "INV-2024-0001",
            "invoiceDate": "2024-01-01",
            "dueDate": "2024-01-31",
            "amount": 30000,
            "balance": 30000,
            "daysOverdue": 0,
            "bucket": "current"
          }
        ]
      }
    ]
  }
}
```

---

## 7. Finance Settings

### Database Schema

```javascript
// MongoDB Schema: FinanceSettings
const FinanceSettingsSchema = new Schema({
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true, unique: true },

  general: {
    fiscalYearStart: { type: Number, default: 1 },
    fiscalYearStartMonth: { type: Number, default: 1 },
    currency: { type: String, default: 'SAR' },
    secondaryCurrency: String,
    exchangeRateSource: { type: String, enum: ['manual', 'api'], default: 'manual' },
    decimalPlaces: { type: Number, default: 2 },
    thousandsSeparator: { type: String, default: ',' },
    decimalSeparator: { type: String, default: '.' },
    negativeFormat: { type: String, enum: ['minus', 'parentheses'], default: 'minus' }
  },

  accounting: {
    chartOfAccountsType: { type: String, default: 'standard' },
    accountingMethod: { type: String, enum: ['accrual', 'cash'], default: 'accrual' },
    defaultReceivableAccount: Schema.Types.ObjectId,
    defaultPayableAccount: Schema.Types.ObjectId,
    defaultRevenueAccount: Schema.Types.ObjectId,
    defaultExpenseAccount: Schema.Types.ObjectId,
    defaultBankAccount: Schema.Types.ObjectId,
    defaultCashAccount: Schema.Types.ObjectId,
    retainedEarningsAccount: Schema.Types.ObjectId,
    suspenseAccount: Schema.Types.ObjectId,
    roundingAccount: Schema.Types.ObjectId,
    discountGivenAccount: Schema.Types.ObjectId,
    discountReceivedAccount: Schema.Types.ObjectId
  },

  invoicing: {
    autoNumbering: { type: Boolean, default: true },
    invoicePrefix: { type: String, default: 'INV-' },
    invoiceNumberFormat: { type: String, default: 'YYYY-NNNN' },
    creditNotePrefix: { type: String, default: 'CN-' },
    debitNotePrefix: { type: String, default: 'DN-' },
    defaultPaymentTerms: { type: String, default: 'net_30' },
    defaultPaymentTermsDays: { type: Number, default: 30 },
    showTaxBreakdown: { type: Boolean, default: true },
    enablePartialPayments: { type: Boolean, default: true },
    requireApprovalAbove: Number,
    approvers: [Schema.Types.ObjectId]
  },

  tax: {
    defaultTaxRate: { type: Number, default: 15 },
    taxRegistrationNumber: String,
    enableTaxRounding: { type: Boolean, default: true },
    taxRoundingPrecision: { type: Number, default: 2 },
    includeTaxInPrice: { type: Boolean, default: false },
    enableWithholdingTax: { type: Boolean, default: false },
    withholdingTaxRate: Number,
    vatReportingPeriod: { type: String, enum: ['monthly', 'quarterly'], default: 'quarterly' }
  },

  budgeting: {
    enabled: { type: Boolean, default: true },
    defaultControlType: { type: String, enum: ['advisory', 'warning', 'strict'], default: 'warning' },
    defaultWarningThreshold: { type: Number, default: 80 },
    defaultBlockingThreshold: { type: Number, default: 100 },
    requireApprovalForBudgets: { type: Boolean, default: true },
    budgetApprovers: [Schema.Types.ObjectId],
    allowBudgetTransfers: { type: Boolean, default: true },
    transferApprovers: [Schema.Types.ObjectId]
  },

  dunning: {
    enabled: { type: Boolean, default: true },
    autoRunEnabled: { type: Boolean, default: false },
    autoRunFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    autoRunDay: Number,
    defaultGracePeriodDays: { type: Number, default: 3 },
    enableLateFees: { type: Boolean, default: false },
    defaultLateFeePercent: Number,
    enableInterest: { type: Boolean, default: false },
    defaultInterestRate: Number,
    sendEmailNotifications: { type: Boolean, default: true },
    sendSmsNotifications: { type: Boolean, default: false }
  },

  credit: {
    enabled: { type: Boolean, default: true },
    defaultCreditLimit: { type: Number, default: 0 },
    defaultPaymentTerms: String,
    autoCheckCredit: { type: Boolean, default: true },
    blockOrdersOnCreditHold: { type: Boolean, default: true },
    blockShipmentsOnCreditHold: { type: Boolean, default: true },
    creditApprovalRequired: { type: Boolean, default: true },
    creditApprovers: [Schema.Types.ObjectId],
    creditReviewFrequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'quarterly' }
  },

  reports: {
    defaultDateRange: { type: String, enum: ['current_month', 'current_quarter', 'current_year', 'last_30_days'], default: 'current_month' },
    defaultAgingBuckets: { type: [Number], default: [0, 30, 60, 90, 120] },
    enableAutoReports: { type: Boolean, default: false },
    autoReportRecipients: [String],
    autoReportFrequency: String,
    reportLogo: String,
    reportFooter: String,
    reportFooterAr: String
  },

  sequences: {
    invoiceSequence: {
      prefix: { type: String, default: 'INV-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' },
      includeYear: { type: Boolean, default: true }
    },
    creditNoteSequence: {
      prefix: { type: String, default: 'CN-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' }
    },
    paymentSequence: {
      prefix: { type: String, default: 'PAY-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' }
    },
    journalSequence: {
      prefix: { type: String, default: 'JE-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' }
    },
    budgetSequence: {
      prefix: { type: String, default: 'BUD-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 }
    }
  }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/settings/finance
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all finance settings |
| PUT | `/` | Update all settings |
| PUT | `/:section` | Update specific section |
| PUT | `/reset/:section` | Reset section to defaults |
| GET | `/history` | Get settings change history |
| POST | `/export` | Export settings |
| POST | `/import` | Import settings |
| POST | `/validate` | Validate settings |

---

## 8. Integration Events

For integration with external systems, use webhooks and events:

### Event Types

```javascript
const EventTypes = {
  // Sales
  SALES_ORDER_CREATED: 'sales_order.created',
  SALES_ORDER_CONFIRMED: 'sales_order.confirmed',
  SALES_ORDER_SHIPPED: 'sales_order.shipped',
  SALES_ORDER_CANCELLED: 'sales_order.cancelled',

  DELIVERY_NOTE_CREATED: 'delivery_note.created',
  DELIVERY_NOTE_SHIPPED: 'delivery_note.shipped',
  DELIVERY_NOTE_DELIVERED: 'delivery_note.delivered',

  // Finance
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',

  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_APPLIED: 'payment.applied',
  PAYMENT_REFUNDED: 'payment.refunded',

  CREDIT_NOTE_CREATED: 'credit_note.created',

  // Budget
  BUDGET_APPROVED: 'budget.approved',
  BUDGET_THRESHOLD_WARNING: 'budget.threshold_warning',
  BUDGET_EXCEEDED: 'budget.exceeded',

  // Dunning
  DUNNING_LEVEL_CHANGED: 'dunning.level_changed',
  DUNNING_REMINDER_SENT: 'dunning.reminder_sent',

  // Credit
  CREDIT_HOLD_APPLIED: 'credit.hold_applied',
  CREDIT_HOLD_RELEASED: 'credit.hold_released',
  CREDIT_LIMIT_CHANGED: 'credit.limit_changed',

  // Returns
  RETURN_REQUESTED: 'return.requested',
  RETURN_APPROVED: 'return.approved',
  RETURN_COMPLETED: 'return.completed'
};
```

### Webhook Schema

```javascript
const WebhookSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  events: [{ type: String, enum: Object.values(EventTypes) }],
  isActive: { type: Boolean, default: true },
  secretKey: String,
  headers: Schema.Types.Mixed,
  retryCount: { type: Number, default: 3 },
  retryDelayMs: { type: Number, default: 1000 },
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### Webhook API Endpoints

```
Base URL: /api/v1/webhooks
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all webhooks |
| GET | `/:id` | Get webhook |
| POST | `/` | Create webhook |
| PUT | `/:id` | Update webhook |
| DELETE | `/:id` | Delete webhook |
| POST | `/:id/test` | Test webhook |
| GET | `/:id/logs` | Get delivery logs |

---

## Summary

This implementation guide covers all backend specifications for the Sales & Finance modules. Key highlights:

### Sales Module (Part 1)
- Sales Orders with full lifecycle
- Delivery Notes with tracking
- Price Lists with inheritance
- Pricing Rules for promotions
- Down Payments management
- Returns/RMA processing
- Commission Management
- Comprehensive Sales Settings

### Finance Module (Part 2)
- Budget Management with controls
- Financial Statements generation
- Dunning Management automation
- Customer Credit Management
- Enhanced Product Management
- Financial Reports suite
- Comprehensive Finance Settings
- Integration Events/Webhooks

### Common Features
- Bilingual support (English/Arabic)
- Multi-tenant architecture (firmId)
- Audit trails and history
- Approval workflows
- Document numbering sequences
- PDF generation
- Excel exports

### Implementation Priority
1. **Phase 1**: Core entities (Sales Orders, Delivery Notes, Basic Budgets)
2. **Phase 2**: Pricing (Price Lists, Pricing Rules)
3. **Phase 3**: Finance (Financial Statements, Dunning)
4. **Phase 4**: Advanced (Credit Management, Returns, Commission)

For questions or clarifications, refer to the frontend implementation or contact the development team.
