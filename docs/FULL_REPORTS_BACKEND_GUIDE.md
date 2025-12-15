# Full Reports Module - Backend Implementation Guide

This document provides detailed backend implementation instructions for the Full Reports feature.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Report Types](#2-report-types)
3. [Database Models](#3-database-models)
4. [API Endpoints](#4-api-endpoints)
5. [Business Logic](#5-business-logic)
6. [Company Settings Integration](#6-company-settings-integration)
7. [Export Services](#7-export-services)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. Overview

The Full Reports module provides professional financial reports with:
- PDF export capability via browser print
- Company branding integration (logo, name, VAT number, CR number)
- Bilingual output (Arabic RTL / English LTR)
- Date period filtering (month, quarter, year, custom)

### Frontend Location
- Page: `/dashboard/finance/full-reports`
- Component: `src/features/finance/components/full-reports-view.tsx`

---

## 2. Report Types

| Report | Category | Description | Data Sources |
|--------|----------|-------------|--------------|
| **Profit & Loss** | Core | Income, expenses, net profit for period | GL entries, income/expense accounts |
| **Balance Sheet** | Core | Assets, liabilities, equity at date | GL entries, all account types |
| **Trial Balance** | Core | All accounts with debit/credit balances | GL entries |
| **Budget Variance** | Analytics | Budget vs actual comparison | Budgets, GL entries |
| **Gross Profit** | Analytics | Revenue vs COGS by item/project | Invoices, expenses, COGS accounts |
| **Cost Center** | Analytics | P&L breakdown by cost center | GL entries with cost center tags |
| **Aged Receivables** | Invoices | Client balances by aging buckets | Invoices, payments |
| **Client Statement** | Invoices | Transaction history per client | Invoices, payments, credit notes |
| **Invoice Summary** | Invoices | Invoice totals, collection stats | Invoices |
| **AP Aging** | Payables | Vendor balances by aging buckets | Expenses, bills, payments |
| **Vendor Ledger** | Payables | Transaction history per vendor | Expenses, bills, payments |
| **Expense Summary** | Expenses | Expenses by category | Expenses |
| **Timesheet Summary** | Time | Hours, billing, utilization | Time entries |
| **VAT Report** | Tax | VAT collected/paid for period | Invoices, expenses |

---

## 3. Database Models

### 3.1 Account Model (Chart of Accounts)

```javascript
// models/Account.js
const accountSchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  accountCode: {
    type: String,
    required: true,
    trim: true
    // e.g., '1100', '4100', '5200'
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  accountNameAr: {
    type: String,
    trim: true
    // Arabic name for bilingual reports
  },
  accountType: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'income', 'revenue', 'expense', 'cost_of_goods_sold'],
    required: true,
    index: true
  },
  accountSubType: {
    type: String,
    enum: ['current_asset', 'fixed_asset', 'current_liability', 'long_term', 'retained_earnings', 'capital'],
    // Used for Balance Sheet categorization
  },
  normalBalance: {
    type: String,
    enum: ['debit', 'credit'],
    required: true
    // Assets/Expenses = debit, Liabilities/Equity/Income = credit
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentAccountCode: {
    type: String
    // For hierarchical chart of accounts
  }
}, { timestamps: true });

// Compound index for unique account codes per company
accountSchema.index({ companyId: 1, accountCode: 1 }, { unique: true });
```

### 3.2 GL Entry Model (General Ledger)

```javascript
// models/GLEntry.js
const glEntrySchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  journalEntryId: {
    type: Schema.Types.ObjectId,
    ref: 'JournalEntry'
  },
  accountCode: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  reference: {
    type: String
    // e.g., 'INV-2024-0001', 'EXP-123'
  },
  referenceType: {
    type: String,
    enum: ['Invoice', 'Payment', 'Expense', 'JournalEntry', 'CreditNote']
  },
  referenceId: {
    type: Schema.Types.ObjectId
  },
  status: {
    type: String,
    enum: ['draft', 'posted', 'reversed'],
    default: 'posted',
    index: true
  }
}, { timestamps: true });

// Indexes for report queries
glEntrySchema.index({ companyId: 1, date: 1, status: 1 });
glEntrySchema.index({ companyId: 1, accountCode: 1, date: 1 });
```

---

## 4. API Endpoints

### 4.1 Profit & Loss Report

**Endpoint:** `GET /api/reports/profit-loss`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |

**Response:**
```typescript
{
  data: {
    period: {
      startDate: string
      endDate: string
    }
    income: {
      items: Array<{
        accountCode: string
        account: string      // English name
        accountAr: string    // Arabic name
        amount: number       // In halalas (subunit)
      }>
      total: number
    }
    expenses: {
      items: Array<{
        accountCode: string
        account: string
        accountAr: string
        amount: number
      }>
      total: number
    }
    netIncome: number
    generatedAt: string
  }
  company: CompanySettings
}
```

**Route Implementation:**
```javascript
// routes/reports.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { addCompanyData } = require('../middleware/company');
const reportService = require('../services/reportService');

router.get('/profit-loss', authenticateToken, addCompanyData, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required'
      });
    }

    const companyId = req.user.companyId;
    const report = await reportService.getProfitLossReport(startDate, endDate, companyId);

    res.json({
      data: report,
      company: req.companyData
    });
  } catch (error) {
    console.error('Profit & Loss Report Error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});
```

---

### 4.2 Balance Sheet Report

**Endpoint:** `GET /api/reports/balance-sheet`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| asOfDate | string | No | As of date (YYYY-MM-DD), defaults to today |

**Response:**
```typescript
{
  data: {
    asOfDate: string
    assets: {
      currentAssets: AccountBalance[]
      fixedAssets: AccountBalance[]
      total: number
    }
    liabilities: {
      currentLiabilities: AccountBalance[]
      longTermLiabilities: AccountBalance[]
      total: number
    }
    equity: {
      items: AccountBalance[]
      total: number
    }
    generatedAt: string
  }
  company: CompanySettings
}

interface AccountBalance {
  accountCode: string
  account: string
  accountAr: string
  balance: number
}
```

---

### 4.3 Trial Balance Report

**Endpoint:** `GET /api/reports/trial-balance`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| asOfDate | string | No | As of date (YYYY-MM-DD), defaults to today |

**Response:**
```typescript
{
  data: {
    asOfDate: string
    accounts: Array<{
      accountNumber: string
      account: string
      accountAr: string
      debit: number
      credit: number
    }>
    totalDebit: number
    totalCredit: number
    isBalanced: boolean  // true if totalDebit === totalCredit
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.4 Aged Receivables Report

**Endpoint:** `GET /api/reports/ar-aging`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| asOfDate | string | No | As of date (YYYY-MM-DD), defaults to today |

**Response:**
```typescript
{
  data: {
    asOfDate: string
    summary: {
      current: number      // Not yet due
      days1to30: number    // 1-30 days overdue
      days31to60: number   // 31-60 days overdue
      days61to90: number   // 61-90 days overdue
      over90: number       // 90+ days overdue
      total: number
    }
    clients: Array<{
      clientId: string
      clientName: string
      current: number
      days1to30: number
      days31to60: number
      days61to90: number
      over90: number
      total: number
    }>
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.5 Invoice Summary Report

**Endpoint:** `GET /api/reports/invoice-summary`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| groupBy | string | No | 'status' (default), 'client', or 'month' |

**Response:**
```typescript
{
  data: {
    period: { startDate: string; endDate: string }
    totals: {
      invoiceCount: number
      totalInvoiced: number
      totalPaid: number
      totalOutstanding: number
      averageInvoice: number
      collectionRate: number  // percentage
    }
    byStatus: Array<{
      status: string
      count: number
      amount: number
    }>
    byClient?: Array<{...}>   // if groupBy === 'client'
    byMonth?: Array<{...}>    // if groupBy === 'month'
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.6 Expense Summary Report

**Endpoint:** `GET /api/reports/expense-summary`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| groupBy | string | No | 'category' (default), 'employee', or 'month' |

**Response:**
```typescript
{
  data: {
    period: { startDate: string; endDate: string }
    totals: {
      expenseCount: number
      totalAmount: number
      totalApproved: number
      totalPending: number
      totalRejected: number
      averageExpense: number
    }
    byCategory: Array<{
      category: string
      categoryAr: string
      count: number
      amount: number
      percentage: number
    }>
    byEmployee?: Array<{...}>  // if groupBy === 'employee'
    byMonth?: Array<{...}>     // if groupBy === 'month'
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.7 Timesheet Summary Report

**Endpoint:** `GET /api/reports/timesheet-summary`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| groupBy | string | No | 'attorney' (default), 'client', or 'case' |

**Response:**
```typescript
{
  data: {
    period: { startDate: string; endDate: string }
    totals: {
      entryCount: number
      totalHours: number
      billableHours: number
      nonBillableHours: number
      billedHours: number
      unbilledHours: number
      totalBillingAmount: number
      totalCostingAmount: number
      profitMargin: number       // percentage
      utilizationRate: number    // percentage
    }
    byAttorney?: Array<{
      attorneyId: string
      attorneyName: string
      totalHours: number
      billableHours: number
      billingAmount: number
      costingAmount: number
      utilizationRate: number
    }>
    byClient?: Array<{...}>
    byCase?: Array<{...}>
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.8 VAT Report

**Endpoint:** `GET /api/reports/vat`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |

**Response:**
```typescript
{
  data: {
    period: { startDate: string; endDate: string }
    outputVAT: {
      standardRated: {
        taxableAmount: number
        vatAmount: number
      }
      zeroRated: {
        taxableAmount: number
      }
      exempt: {
        amount: number
      }
      totalOutputVAT: number
    }
    inputVAT: {
      reclaimable: {
        taxableAmount: number
        vatAmount: number
      }
      nonReclaimable: {
        amount: number
      }
      totalInputVAT: number
    }
    netVAT: number           // outputVAT - inputVAT
    vatPayable: boolean      // true if netVAT > 0
    invoiceCount: number
    expenseCount: number
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.9 Budget Variance Report

**Endpoint:** `GET /api/reports/budget-variance`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| budgetId | string | No | Specific budget ID to compare against |

**Response:**
```typescript
{
  data: {
    period: { startDate: string; endDate: string }
    budgetName: string
    summary: {
      totalBudget: number
      totalActual: number
      variance: number           // budget - actual
      variancePercent: number    // (variance / budget) * 100
    }
    categories: Array<{
      category: string
      categoryAr: string
      accountCode: string
      budget: number
      actual: number
      variance: number
      variancePercent: number
      status: 'under' | 'over' | 'on-track'  // over = exceeded budget
    }>
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.10 AP Aging Report (Accounts Payable Aging)

**Endpoint:** `GET /api/reports/ap-aging`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| asOfDate | string | No | As of date (YYYY-MM-DD), defaults to today |

**Response:**
```typescript
{
  data: {
    asOfDate: string
    summary: {
      current: number      // Not yet due
      days1to30: number    // 1-30 days overdue
      days31to60: number   // 31-60 days overdue
      days61to90: number   // 61-90 days overdue
      over90: number       // 90+ days overdue
      total: number
    }
    vendors: Array<{
      vendorId: string
      vendorName: string
      vendorNameAr: string
      current: number
      days1to30: number
      days31to60: number
      days61to90: number
      over90: number
      total: number
    }>
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.11 Client Statement Report

**Endpoint:** `GET /api/reports/client-statement`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clientId | string | Yes | Client ID |
| startDate | string | No | Start date (YYYY-MM-DD) |
| endDate | string | No | End date (YYYY-MM-DD) |

**Response:**
```typescript
{
  data: {
    client: {
      id: string
      name: string
      nameAr: string
      email: string
      phone: string
      address: string
    }
    period: {
      startDate: string
      endDate: string
    }
    openingBalance: number
    transactions: Array<{
      date: string
      type: 'invoice' | 'payment' | 'credit_note' | 'adjustment'
      reference: string        // e.g., 'INV-2024-0001'
      description: string
      descriptionAr: string
      debit: number           // Charges (invoices)
      credit: number          // Credits (payments, credit notes)
      balance: number         // Running balance
    }>
    closingBalance: number
    totalDebits: number
    totalCredits: number
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.12 Vendor Ledger Report

**Endpoint:** `GET /api/reports/vendor-ledger`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| vendorId | string | Yes | Vendor ID |
| startDate | string | No | Start date (YYYY-MM-DD) |
| endDate | string | No | End date (YYYY-MM-DD) |

**Response:**
```typescript
{
  data: {
    vendor: {
      id: string
      name: string
      nameAr: string
      email: string
      phone: string
      vatNumber: string
    }
    period: {
      startDate: string
      endDate: string
    }
    openingBalance: number
    transactions: Array<{
      date: string
      type: 'bill' | 'expense' | 'payment' | 'debit_note' | 'adjustment'
      reference: string        // e.g., 'BILL-2024-0001'
      description: string
      descriptionAr: string
      debit: number           // Credits to vendor (payments)
      credit: number          // Debits (bills, expenses)
      balance: number         // Running balance (amount owed)
    }>
    closingBalance: number
    totalDebits: number
    totalCredits: number
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.13 Gross Profit Report

**Endpoint:** `GET /api/reports/gross-profit`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| groupBy | string | No | 'item', 'project', 'client' (default: 'item') |

**Response:**
```typescript
{
  data: {
    period: { startDate: string; endDate: string }
    summary: {
      totalRevenue: number
      totalCOGS: number
      grossProfit: number
      grossMargin: number      // (grossProfit / totalRevenue) * 100
    }
    items: Array<{
      id: string
      name: string
      nameAr: string
      revenue: number
      cogs: number             // Cost of Goods Sold
      grossProfit: number
      grossMargin: number
      quantity: number         // Units sold (if applicable)
    }>
    byProject?: Array<{
      projectId: string
      projectName: string
      revenue: number
      cogs: number
      grossProfit: number
      grossMargin: number
    }>
    byClient?: Array<{
      clientId: string
      clientName: string
      revenue: number
      cogs: number
      grossProfit: number
      grossMargin: number
    }>
    generatedAt: string
  }
  company: CompanySettings
}
```

---

### 4.14 Cost Center Report

**Endpoint:** `GET /api/reports/cost-center`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |
| costCenterId | string | No | Filter by specific cost center |

**Response:**
```typescript
{
  data: {
    period: { startDate: string; endDate: string }
    summary: {
      totalIncome: number
      totalExpenses: number
      netIncome: number
    }
    costCenters: Array<{
      id: string
      name: string
      nameAr: string
      parentId: string | null
      level: number              // Hierarchy level (0 = root)
      income: {
        items: Array<{
          accountCode: string
          account: string
          accountAr: string
          amount: number
        }>
        total: number
      }
      expenses: {
        items: Array<{
          accountCode: string
          account: string
          accountAr: string
          amount: number
        }>
        total: number
      }
      netIncome: number
      percentage: number        // % of company total
    }>
    generatedAt: string
  }
  company: CompanySettings
}
```

---

## 5. Business Logic

### 5.1 Profit & Loss Report Service

```javascript
// services/reportService.js

const mongoose = require('mongoose');
const Account = require('../models/Account');
const GLEntry = require('../models/GLEntry');

async function getProfitLossReport(startDate, endDate, companyId) {
  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get income accounts (type: 'income', 'revenue')
  const incomeAccounts = await Account.find({
    companyId,
    accountType: { $in: ['income', 'revenue'] },
    isActive: true
  });

  const incomeAccountCodes = incomeAccounts.map(a => a.accountCode);

  // Aggregate income from GL entries
  const incomeEntries = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        accountCode: { $in: incomeAccountCodes },
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        credit: { $sum: '$credit' },
        debit: { $sum: '$debit' }
      }
    }
  ]);

  // Income = Credits - Debits (normal balance is credit)
  const incomeItems = incomeEntries.map(entry => {
    const account = incomeAccounts.find(a => a.accountCode === entry._id);
    return {
      accountCode: entry._id,
      account: account?.accountName || entry._id,
      accountAr: account?.accountNameAr || entry._id,
      amount: entry.credit - entry.debit
    };
  }).filter(item => item.amount !== 0);

  // Get expense accounts
  const expenseAccounts = await Account.find({
    companyId,
    accountType: { $in: ['expense', 'cost_of_goods_sold'] },
    isActive: true
  });

  const expenseAccountCodes = expenseAccounts.map(a => a.accountCode);

  // Aggregate expenses from GL entries
  const expenseEntries = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        accountCode: { $in: expenseAccountCodes },
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        debit: { $sum: '$debit' },
        credit: { $sum: '$credit' }
      }
    }
  ]);

  // Expenses = Debits - Credits (normal balance is debit)
  const expenseItems = expenseEntries.map(entry => {
    const account = expenseAccounts.find(a => a.accountCode === entry._id);
    return {
      accountCode: entry._id,
      account: account?.accountName || entry._id,
      accountAr: account?.accountNameAr || entry._id,
      amount: entry.debit - entry.credit
    };
  }).filter(item => item.amount !== 0);

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    period: { startDate, endDate },
    income: {
      items: incomeItems.sort((a, b) => b.amount - a.amount),
      total: totalIncome
    },
    expenses: {
      items: expenseItems.sort((a, b) => b.amount - a.amount),
      total: totalExpenses
    },
    netIncome: totalIncome - totalExpenses,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { getProfitLossReport };
```

---

### 5.2 Balance Sheet Report Service

```javascript
// services/reportService.js

async function getBalanceSheetReport(asOfDate, companyId) {
  const endOfDay = new Date(asOfDate || new Date());
  endOfDay.setHours(23, 59, 59, 999);

  // Get all accounts with their balances
  const accounts = await Account.find({
    companyId,
    isActive: true
  });

  // Calculate cumulative balances from GL
  const balances = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' }
      }
    }
  ]);

  // Create balance map
  const balanceMap = new Map();
  balances.forEach(b => {
    balanceMap.set(b._id, {
      debit: b.totalDebit,
      credit: b.totalCredit
    });
  });

  // Helper to get account balance
  const getBalance = (accountCode, normalBalance) => {
    const bal = balanceMap.get(accountCode) || { debit: 0, credit: 0 };
    return normalBalance === 'debit'
      ? bal.debit - bal.credit
      : bal.credit - bal.debit;
  };

  // Categorize accounts
  const currentAssets = [];
  const fixedAssets = [];
  const currentLiabilities = [];
  const longTermLiabilities = [];
  const equityItems = [];

  for (const account of accounts) {
    const balance = getBalance(account.accountCode, account.normalBalance);
    if (balance === 0) continue;

    const item = {
      accountCode: account.accountCode,
      account: account.accountName,
      accountAr: account.accountNameAr,
      balance
    };

    switch (account.accountType) {
      case 'asset':
        if (account.accountSubType === 'fixed_asset') {
          fixedAssets.push(item);
        } else {
          currentAssets.push(item);
        }
        break;
      case 'liability':
        if (account.accountSubType === 'long_term') {
          longTermLiabilities.push(item);
        } else {
          currentLiabilities.push(item);
        }
        break;
      case 'equity':
        equityItems.push(item);
        break;
    }
  }

  // Calculate retained earnings from income/expense
  const retainedEarnings = await calculateRetainedEarnings(companyId, endOfDay);
  if (retainedEarnings !== 0) {
    equityItems.push({
      accountCode: 'RE',
      account: 'Retained Earnings',
      accountAr: 'الأرباح المحتجزة',
      balance: retainedEarnings
    });
  }

  return {
    asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    assets: {
      currentAssets: currentAssets.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      fixedAssets: fixedAssets.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      total: [...currentAssets, ...fixedAssets].reduce((s, i) => s + i.balance, 0)
    },
    liabilities: {
      currentLiabilities: currentLiabilities.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      longTermLiabilities: longTermLiabilities.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      total: [...currentLiabilities, ...longTermLiabilities].reduce((s, i) => s + i.balance, 0)
    },
    equity: {
      items: equityItems.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      total: equityItems.reduce((s, i) => s + i.balance, 0)
    },
    generatedAt: new Date().toISOString()
  };
}

async function calculateRetainedEarnings(companyId, asOfDate) {
  const result = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $lte: asOfDate },
        status: 'posted'
      }
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'accountCode',
        foreignField: 'accountCode',
        as: 'account'
      }
    },
    { $unwind: '$account' },
    {
      $match: {
        'account.accountType': { $in: ['income', 'revenue', 'expense', 'cost_of_goods_sold'] }
      }
    },
    {
      $group: {
        _id: '$account.accountType',
        debit: { $sum: '$debit' },
        credit: { $sum: '$credit' }
      }
    }
  ]);

  let income = 0;
  let expenses = 0;

  result.forEach(r => {
    if (['income', 'revenue'].includes(r._id)) {
      income += r.credit - r.debit;
    } else {
      expenses += r.debit - r.credit;
    }
  });

  return income - expenses;
}
```

---

### 5.3 Trial Balance Report Service

```javascript
// services/reportService.js

async function getTrialBalanceReport(asOfDate, companyId) {
  const endOfDay = new Date(asOfDate || new Date());
  endOfDay.setHours(23, 59, 59, 999);

  // Get all accounts
  const accounts = await Account.find({
    companyId,
    isActive: true
  }).sort({ accountCode: 1 });

  // Aggregate GL balances
  const balances = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $lte: endOfDay },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' }
      }
    }
  ]);

  const balanceMap = new Map();
  balances.forEach(b => balanceMap.set(b._id, b));

  const accountsData = accounts.map(account => {
    const bal = balanceMap.get(account.accountCode) || { totalDebit: 0, totalCredit: 0 };
    const netBalance = bal.totalDebit - bal.totalCredit;

    return {
      accountNumber: account.accountCode,
      account: account.accountName,
      accountAr: account.accountNameAr,
      // Show balance on correct side based on normal balance
      debit: account.normalBalance === 'debit' && netBalance > 0 ? netBalance :
             account.normalBalance === 'credit' && netBalance < 0 ? Math.abs(netBalance) : 0,
      credit: account.normalBalance === 'credit' && netBalance > 0 ? netBalance :
              account.normalBalance === 'debit' && netBalance < 0 ? Math.abs(netBalance) : 0
    };
  }).filter(a => a.debit !== 0 || a.credit !== 0);

  const totalDebit = accountsData.reduce((s, a) => s + a.debit, 0);
  const totalCredit = accountsData.reduce((s, a) => s + a.credit, 0);

  return {
    asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    accounts: accountsData,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 1, // Allow 1 halala variance
    generatedAt: new Date().toISOString()
  };
}
```

---

### 5.4 Aged Receivables Report Service

```javascript
// services/reportService.js

async function getAgedReceivablesReport(asOfDate, companyId) {
  const today = new Date(asOfDate || new Date());
  today.setHours(0, 0, 0, 0);

  // Get all unpaid/partially paid invoices
  const invoices = await Invoice.find({
    companyId,
    status: { $in: ['sent', 'partially_paid', 'overdue'] },
    balanceDue: { $gt: 0 }
  }).populate('clientId', 'name nameAr');

  // Calculate aging for each invoice
  const clientAging = new Map();

  for (const invoice of invoices) {
    const dueDate = new Date(invoice.dueDate);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    const balance = invoice.balanceDue;

    const clientKey = invoice.clientId?._id?.toString() || 'unknown';

    if (!clientAging.has(clientKey)) {
      clientAging.set(clientKey, {
        clientId: clientKey,
        clientName: invoice.clientId?.name || 'Unknown Client',
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        over90: 0,
        total: 0
      });
    }

    const client = clientAging.get(clientKey);

    if (daysOverdue <= 0) {
      client.current += balance;
    } else if (daysOverdue <= 30) {
      client.days1to30 += balance;
    } else if (daysOverdue <= 60) {
      client.days31to60 += balance;
    } else if (daysOverdue <= 90) {
      client.days61to90 += balance;
    } else {
      client.over90 += balance;
    }
    client.total += balance;
  }

  const clients = Array.from(clientAging.values())
    .sort((a, b) => b.total - a.total);

  // Calculate summary
  const summary = {
    current: clients.reduce((s, c) => s + c.current, 0),
    days1to30: clients.reduce((s, c) => s + c.days1to30, 0),
    days31to60: clients.reduce((s, c) => s + c.days31to60, 0),
    days61to90: clients.reduce((s, c) => s + c.days61to90, 0),
    over90: clients.reduce((s, c) => s + c.over90, 0),
    total: clients.reduce((s, c) => s + c.total, 0)
  };

  return {
    asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    summary,
    clients,
    generatedAt: new Date().toISOString()
  };
}
```

---

### 5.5 VAT Report Service

```javascript
// services/reportService.js

async function getVATReport(startDate, endDate, companyId) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get invoices for output VAT
  const invoices = await Invoice.find({
    companyId,
    issueDate: { $gte: start, $lte: end },
    isReturn: { $ne: true },
    status: { $nin: ['draft', 'cancelled'] }
  });

  // Calculate output VAT (collected from customers)
  let standardRatedSales = 0;
  let standardRatedVAT = 0;
  let zeroRatedSales = 0;
  let exemptSales = 0;

  invoices.forEach(inv => {
    const vatRate = inv.vatRate || 15;
    if (vatRate === 15) {
      standardRatedSales += inv.subtotal || 0;
      standardRatedVAT += inv.vatAmount || 0;
    } else if (vatRate === 0) {
      zeroRatedSales += inv.subtotal || 0;
    } else {
      exemptSales += inv.totalAmount || 0;
    }
  });

  // Get expenses for input VAT
  const expenses = await Expense.find({
    companyId,
    date: { $gte: start, $lte: end },
    approvalStatus: 'approved'
  });

  // Calculate input VAT (paid on purchases)
  let reclaimablePurchases = 0;
  let reclaimableVAT = 0;
  let nonReclaimablePurchases = 0;

  expenses.forEach(exp => {
    if (exp.taxReclaimable) {
      reclaimablePurchases += (exp.amount - (exp.taxAmount || 0));
      reclaimableVAT += (exp.taxAmount || 0);
    } else {
      nonReclaimablePurchases += exp.amount;
    }
  });

  const totalOutputVAT = standardRatedVAT;
  const totalInputVAT = reclaimableVAT;
  const netVAT = totalOutputVAT - totalInputVAT;

  return {
    period: { startDate, endDate },
    outputVAT: {
      standardRated: {
        taxableAmount: standardRatedSales,
        vatAmount: standardRatedVAT
      },
      zeroRated: {
        taxableAmount: zeroRatedSales
      },
      exempt: {
        amount: exemptSales
      },
      totalOutputVAT
    },
    inputVAT: {
      reclaimable: {
        taxableAmount: reclaimablePurchases,
        vatAmount: reclaimableVAT
      },
      nonReclaimable: {
        amount: nonReclaimablePurchases
      },
      totalInputVAT
    },
    netVAT,
    vatPayable: netVAT > 0,
    invoiceCount: invoices.length,
    expenseCount: expenses.length,
    generatedAt: new Date().toISOString()
  };
}
```

---

### 5.6 Timesheet Summary Service

```javascript
// services/reportService.js

async function getTimesheetSummaryReport(startDate, endDate, companyId, groupBy = 'attorney') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const entries = await TimeEntry.find({
    companyId,
    date: { $gte: start, $lte: end }
  })
    .populate('attorneyId', 'firstName lastName hourlyRate costingRate')
    .populate('clientId', 'name')
    .populate('caseId', 'caseNumber title');

  // Calculate hours for each entry
  const entriesWithHours = entries.map(e => ({
    ...e.toObject(),
    totalMinutes: (e.actualHours || 0) * 60 + (e.actualMinutes || 0),
    billingMinutes: e.isBillableOverride
      ? (e.billingHours || 0) * 60 + (e.billingMinutes || 0)
      : (e.actualHours || 0) * 60 + (e.actualMinutes || 0)
  }));

  // Calculate totals
  const totalMinutes = entriesWithHours.reduce((s, e) => s + e.totalMinutes, 0);
  const billableMinutes = entriesWithHours
    .filter(e => e.isBillable)
    .reduce((s, e) => s + e.billingMinutes, 0);
  const billedMinutes = entriesWithHours
    .filter(e => e.isBilled)
    .reduce((s, e) => s + e.billingMinutes, 0);
  const totalBillingAmount = entriesWithHours.reduce((s, e) => s + (e.billingAmount || 0), 0);
  const totalCostingAmount = entriesWithHours.reduce((s, e) => s + (e.costingAmount || 0), 0);

  // Standard work hours (Saudi workweek: Sunday-Thursday)
  const workingDays = getWorkingDays(start, end);
  const standardHours = workingDays * 8;

  const result = {
    period: { startDate, endDate },
    totals: {
      entryCount: entries.length,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      billableHours: Math.round(billableMinutes / 60 * 10) / 10,
      nonBillableHours: Math.round((totalMinutes - billableMinutes) / 60 * 10) / 10,
      billedHours: Math.round(billedMinutes / 60 * 10) / 10,
      unbilledHours: Math.round((billableMinutes - billedMinutes) / 60 * 10) / 10,
      totalBillingAmount,
      totalCostingAmount,
      profitMargin: totalBillingAmount
        ? Math.round((totalBillingAmount - totalCostingAmount) / totalBillingAmount * 100)
        : 0,
      utilizationRate: standardHours
        ? Math.round((billableMinutes / 60) / standardHours * 100)
        : 0
    },
    generatedAt: new Date().toISOString()
  };

  // Group by attorney if requested
  if (groupBy === 'attorney') {
    result.byAttorney = groupEntriesByAttorney(entriesWithHours, standardHours);
  }

  return result;
}

function getWorkingDays(start, end) {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    // Saudi workweek: Sunday-Thursday (0=Sun, 4=Thu)
    if (day !== 5 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function groupEntriesByAttorney(entries, standardHours) {
  const attorneyGroups = {};

  entries.forEach(e => {
    const attId = e.attorneyId?._id?.toString() || 'unknown';
    if (!attorneyGroups[attId]) {
      attorneyGroups[attId] = {
        attorneyId: attId,
        attorneyName: e.attorneyId
          ? `${e.attorneyId.firstName} ${e.attorneyId.lastName}`
          : 'Unknown',
        totalMinutes: 0,
        billableMinutes: 0,
        billingAmount: 0,
        costingAmount: 0
      };
    }
    attorneyGroups[attId].totalMinutes += e.totalMinutes;
    if (e.isBillable) {
      attorneyGroups[attId].billableMinutes += e.billingMinutes;
    }
    attorneyGroups[attId].billingAmount += (e.billingAmount || 0);
    attorneyGroups[attId].costingAmount += (e.costingAmount || 0);
  });

  const attorneyCount = Object.keys(attorneyGroups).length;

  return Object.values(attorneyGroups).map(a => ({
    attorneyId: a.attorneyId,
    attorneyName: a.attorneyName,
    totalHours: Math.round(a.totalMinutes / 60 * 10) / 10,
    billableHours: Math.round(a.billableMinutes / 60 * 10) / 10,
    billingAmount: a.billingAmount,
    costingAmount: a.costingAmount,
    utilizationRate: standardHours && attorneyCount
      ? Math.round((a.billableMinutes / 60) / (standardHours / attorneyCount) * 100)
      : 0
  })).sort((a, b) => b.totalHours - a.totalHours);
}
```

---

### 5.7 Budget Variance Report Service

```javascript
// services/reportService.js

const Budget = require('../models/Budget');

async function getBudgetVarianceReport(startDate, endDate, companyId, budgetId = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get budget (active budget for period or specific one)
  const budgetQuery = {
    companyId,
    isActive: true,
    startDate: { $lte: end },
    endDate: { $gte: start }
  };

  if (budgetId) {
    budgetQuery._id = mongoose.Types.ObjectId(budgetId);
  }

  const budget = await Budget.findOne(budgetQuery);

  if (!budget) {
    return {
      period: { startDate, endDate },
      budgetName: 'No Active Budget',
      summary: { totalBudget: 0, totalActual: 0, variance: 0, variancePercent: 0 },
      categories: [],
      generatedAt: new Date().toISOString()
    };
  }

  // Get actual amounts from GL entries for budget categories
  const actualsByAccount = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $gte: start, $lte: end },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$accountCode',
        debit: { $sum: '$debit' },
        credit: { $sum: '$credit' }
      }
    }
  ]);

  const actualsMap = new Map();
  actualsByAccount.forEach(a => actualsMap.set(a._id, a));

  // Compare budget vs actual for each category
  const categories = [];
  let totalBudget = 0;
  let totalActual = 0;

  for (const item of budget.lineItems) {
    const actual = actualsMap.get(item.accountCode);
    // Expenses: debit - credit, Income: credit - debit
    const actualAmount = actual
      ? (item.type === 'expense' ? actual.debit - actual.credit : actual.credit - actual.debit)
      : 0;

    const variance = item.amount - actualAmount;
    const variancePercent = item.amount > 0 ? (variance / item.amount) * 100 : 0;

    categories.push({
      category: item.name,
      categoryAr: item.nameAr,
      accountCode: item.accountCode,
      budget: item.amount,
      actual: actualAmount,
      variance,
      variancePercent: Math.round(variancePercent * 10) / 10,
      status: variancePercent < -5 ? 'over' : variancePercent > 5 ? 'under' : 'on-track'
    });

    totalBudget += item.amount;
    totalActual += actualAmount;
  }

  const totalVariance = totalBudget - totalActual;

  return {
    period: { startDate, endDate },
    budgetName: budget.name,
    summary: {
      totalBudget,
      totalActual,
      variance: totalVariance,
      variancePercent: totalBudget > 0 ? Math.round((totalVariance / totalBudget) * 1000) / 10 : 0
    },
    categories: categories.sort((a, b) => a.variancePercent - b.variancePercent),
    generatedAt: new Date().toISOString()
  };
}
```

---

### 5.8 AP Aging Report Service

```javascript
// services/reportService.js

const Expense = require('../models/Expense');
const Vendor = require('../models/Vendor');

async function getAPAgingReport(asOfDate, companyId) {
  const today = new Date(asOfDate || new Date());
  today.setHours(0, 0, 0, 0);

  // Get all unpaid expenses/bills
  const expenses = await Expense.find({
    companyId,
    paymentStatus: { $in: ['unpaid', 'partial'] },
    approvalStatus: 'approved'
  }).populate('vendorId', 'name nameAr');

  // Calculate aging for each expense
  const vendorAging = new Map();

  for (const expense of expenses) {
    const dueDate = new Date(expense.dueDate || expense.date);
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    const balance = expense.amount - (expense.paidAmount || 0);

    const vendorKey = expense.vendorId?._id?.toString() || 'unknown';

    if (!vendorAging.has(vendorKey)) {
      vendorAging.set(vendorKey, {
        vendorId: vendorKey,
        vendorName: expense.vendorId?.name || expense.vendor || 'Unknown Vendor',
        vendorNameAr: expense.vendorId?.nameAr || '',
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        over90: 0,
        total: 0
      });
    }

    const vendor = vendorAging.get(vendorKey);

    if (daysOverdue <= 0) {
      vendor.current += balance;
    } else if (daysOverdue <= 30) {
      vendor.days1to30 += balance;
    } else if (daysOverdue <= 60) {
      vendor.days31to60 += balance;
    } else if (daysOverdue <= 90) {
      vendor.days61to90 += balance;
    } else {
      vendor.over90 += balance;
    }
    vendor.total += balance;
  }

  const vendors = Array.from(vendorAging.values())
    .sort((a, b) => b.total - a.total);

  const summary = {
    current: vendors.reduce((s, v) => s + v.current, 0),
    days1to30: vendors.reduce((s, v) => s + v.days1to30, 0),
    days31to60: vendors.reduce((s, v) => s + v.days31to60, 0),
    days61to90: vendors.reduce((s, v) => s + v.days61to90, 0),
    over90: vendors.reduce((s, v) => s + v.over90, 0),
    total: vendors.reduce((s, v) => s + v.total, 0)
  };

  return {
    asOfDate: asOfDate || new Date().toISOString().split('T')[0],
    summary,
    vendors,
    generatedAt: new Date().toISOString()
  };
}
```

---

### 5.9 Client Statement Report Service

```javascript
// services/reportService.js

const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const CreditNote = require('../models/CreditNote');

async function getClientStatementReport(clientId, startDate, endDate, companyId) {
  const client = await Client.findOne({ _id: clientId, companyId });

  if (!client) {
    throw new Error('Client not found');
  }

  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  // Calculate opening balance (transactions before start date)
  const openingBalance = await calculateClientBalance(clientId, companyId, start);

  // Get all transactions in period
  const transactions = [];

  // Get invoices
  const invoices = await Invoice.find({
    clientId,
    companyId,
    issueDate: { $gte: start, $lte: end },
    status: { $nin: ['draft', 'cancelled'] }
  }).sort({ issueDate: 1 });

  invoices.forEach(inv => {
    transactions.push({
      date: inv.issueDate.toISOString().split('T')[0],
      type: 'invoice',
      reference: inv.invoiceNumber,
      description: `Invoice ${inv.invoiceNumber}`,
      descriptionAr: `فاتورة ${inv.invoiceNumber}`,
      debit: inv.totalAmount,
      credit: 0,
      sortDate: inv.issueDate
    });
  });

  // Get payments
  const payments = await Payment.find({
    clientId,
    companyId,
    paymentDate: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' }
  }).sort({ paymentDate: 1 });

  payments.forEach(pmt => {
    transactions.push({
      date: pmt.paymentDate.toISOString().split('T')[0],
      type: 'payment',
      reference: pmt.paymentNumber || pmt.reference,
      description: `Payment received - ${pmt.paymentMethod}`,
      descriptionAr: `دفعة مستلمة - ${pmt.paymentMethod}`,
      debit: 0,
      credit: pmt.amount,
      sortDate: pmt.paymentDate
    });
  });

  // Get credit notes
  const creditNotes = await CreditNote.find({
    clientId,
    companyId,
    issueDate: { $gte: start, $lte: end },
    status: { $nin: ['draft', 'cancelled'] }
  }).sort({ issueDate: 1 });

  creditNotes.forEach(cn => {
    transactions.push({
      date: cn.issueDate.toISOString().split('T')[0],
      type: 'credit_note',
      reference: cn.creditNoteNumber,
      description: `Credit Note ${cn.creditNoteNumber}`,
      descriptionAr: `إشعار دائن ${cn.creditNoteNumber}`,
      debit: 0,
      credit: cn.totalAmount,
      sortDate: cn.issueDate
    });
  });

  // Sort by date and calculate running balance
  transactions.sort((a, b) => a.sortDate - b.sortDate);

  let runningBalance = openingBalance;
  const transactionsWithBalance = transactions.map(t => {
    runningBalance += t.debit - t.credit;
    return {
      date: t.date,
      type: t.type,
      reference: t.reference,
      description: t.description,
      descriptionAr: t.descriptionAr,
      debit: t.debit,
      credit: t.credit,
      balance: runningBalance
    };
  });

  const totalDebits = transactions.reduce((s, t) => s + t.debit, 0);
  const totalCredits = transactions.reduce((s, t) => s + t.credit, 0);

  return {
    client: {
      id: client._id.toString(),
      name: client.name,
      nameAr: client.nameAr,
      email: client.email,
      phone: client.phone,
      address: client.address
    },
    period: {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    },
    openingBalance,
    transactions: transactionsWithBalance,
    closingBalance: runningBalance,
    totalDebits,
    totalCredits,
    generatedAt: new Date().toISOString()
  };
}

async function calculateClientBalance(clientId, companyId, beforeDate) {
  const invoiceTotal = await Invoice.aggregate([
    {
      $match: {
        clientId: mongoose.Types.ObjectId(clientId),
        companyId: mongoose.Types.ObjectId(companyId),
        issueDate: { $lt: beforeDate },
        status: { $nin: ['draft', 'cancelled'] }
      }
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const paymentTotal = await Payment.aggregate([
    {
      $match: {
        clientId: mongoose.Types.ObjectId(clientId),
        companyId: mongoose.Types.ObjectId(companyId),
        paymentDate: { $lt: beforeDate },
        status: { $ne: 'cancelled' }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const creditNoteTotal = await CreditNote.aggregate([
    {
      $match: {
        clientId: mongoose.Types.ObjectId(clientId),
        companyId: mongoose.Types.ObjectId(companyId),
        issueDate: { $lt: beforeDate },
        status: { $nin: ['draft', 'cancelled'] }
      }
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const invoices = invoiceTotal[0]?.total || 0;
  const payments = paymentTotal[0]?.total || 0;
  const credits = creditNoteTotal[0]?.total || 0;

  return invoices - payments - credits;
}
```

---

### 5.10 Vendor Ledger Report Service

```javascript
// services/reportService.js

async function getVendorLedgerReport(vendorId, startDate, endDate, companyId) {
  const vendor = await Vendor.findOne({ _id: vendorId, companyId });

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  // Calculate opening balance (transactions before start date)
  const openingBalance = await calculateVendorBalance(vendorId, companyId, start);

  const transactions = [];

  // Get expenses/bills
  const expenses = await Expense.find({
    vendorId,
    companyId,
    date: { $gte: start, $lte: end },
    approvalStatus: 'approved'
  }).sort({ date: 1 });

  expenses.forEach(exp => {
    transactions.push({
      date: exp.date.toISOString().split('T')[0],
      type: exp.billNumber ? 'bill' : 'expense',
      reference: exp.billNumber || exp.expenseNumber || exp.reference,
      description: exp.description || exp.category,
      descriptionAr: exp.descriptionAr || exp.categoryAr || '',
      debit: 0,
      credit: exp.amount,
      sortDate: exp.date
    });
  });

  // Get payments to vendor
  const vendorPayments = await VendorPayment.find({
    vendorId,
    companyId,
    paymentDate: { $gte: start, $lte: end },
    status: { $ne: 'cancelled' }
  }).sort({ paymentDate: 1 });

  vendorPayments.forEach(pmt => {
    transactions.push({
      date: pmt.paymentDate.toISOString().split('T')[0],
      type: 'payment',
      reference: pmt.paymentNumber || pmt.reference,
      description: `Payment to vendor - ${pmt.paymentMethod}`,
      descriptionAr: `دفعة للمورد - ${pmt.paymentMethod}`,
      debit: pmt.amount,
      credit: 0,
      sortDate: pmt.paymentDate
    });
  });

  // Sort by date and calculate running balance
  transactions.sort((a, b) => a.sortDate - b.sortDate);

  let runningBalance = openingBalance;
  const transactionsWithBalance = transactions.map(t => {
    runningBalance += t.credit - t.debit;  // Credit increases what we owe
    return {
      date: t.date,
      type: t.type,
      reference: t.reference,
      description: t.description,
      descriptionAr: t.descriptionAr,
      debit: t.debit,
      credit: t.credit,
      balance: runningBalance
    };
  });

  const totalDebits = transactions.reduce((s, t) => s + t.debit, 0);
  const totalCredits = transactions.reduce((s, t) => s + t.credit, 0);

  return {
    vendor: {
      id: vendor._id.toString(),
      name: vendor.name,
      nameAr: vendor.nameAr,
      email: vendor.email,
      phone: vendor.phone,
      vatNumber: vendor.vatNumber
    },
    period: {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    },
    openingBalance,
    transactions: transactionsWithBalance,
    closingBalance: runningBalance,
    totalDebits,
    totalCredits,
    generatedAt: new Date().toISOString()
  };
}

async function calculateVendorBalance(vendorId, companyId, beforeDate) {
  const expenseTotal = await Expense.aggregate([
    {
      $match: {
        vendorId: mongoose.Types.ObjectId(vendorId),
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $lt: beforeDate },
        approvalStatus: 'approved'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const paymentTotal = await VendorPayment.aggregate([
    {
      $match: {
        vendorId: mongoose.Types.ObjectId(vendorId),
        companyId: mongoose.Types.ObjectId(companyId),
        paymentDate: { $lt: beforeDate },
        status: { $ne: 'cancelled' }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const expenses = expenseTotal[0]?.total || 0;
  const payments = paymentTotal[0]?.total || 0;

  return expenses - payments;  // What we owe
}
```

---

### 5.11 Gross Profit Report Service

```javascript
// services/reportService.js

async function getGrossProfitReport(startDate, endDate, companyId, groupBy = 'item') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get invoices with line items
  const invoices = await Invoice.find({
    companyId,
    issueDate: { $gte: start, $lte: end },
    status: { $nin: ['draft', 'cancelled'] },
    isReturn: { $ne: true }
  });

  // Get COGS entries from GL
  const cogsAccounts = await Account.find({
    companyId,
    accountType: 'cost_of_goods_sold',
    isActive: true
  });
  const cogsAccountCodes = cogsAccounts.map(a => a.accountCode);

  const cogsEntries = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        accountCode: { $in: cogsAccountCodes },
        date: { $gte: start, $lte: end },
        status: 'posted'
      }
    },
    {
      $group: {
        _id: '$reference',
        cogs: { $sum: { $subtract: ['$debit', '$credit'] } }
      }
    }
  ]);

  const cogsMap = new Map();
  cogsEntries.forEach(e => cogsMap.set(e._id, e.cogs));

  // Aggregate by groupBy parameter
  const itemMap = new Map();

  invoices.forEach(inv => {
    const invCogs = cogsMap.get(inv.invoiceNumber) || 0;
    const cogsPerItem = inv.lineItems?.length ? invCogs / inv.lineItems.length : invCogs;

    if (inv.lineItems && inv.lineItems.length > 0) {
      inv.lineItems.forEach(item => {
        let key, name, nameAr;

        if (groupBy === 'client') {
          key = inv.clientId?.toString() || 'unknown';
          name = inv.clientName || 'Unknown Client';
          nameAr = inv.clientNameAr || '';
        } else if (groupBy === 'project') {
          key = item.projectId?.toString() || inv.projectId?.toString() || 'no-project';
          name = item.projectName || inv.projectName || 'No Project';
          nameAr = item.projectNameAr || inv.projectNameAr || '';
        } else {
          key = item.itemCode || item.description?.slice(0, 50) || 'unknown';
          name = item.description || 'Unknown Item';
          nameAr = item.descriptionAr || '';
        }

        if (!itemMap.has(key)) {
          itemMap.set(key, {
            id: key,
            name,
            nameAr,
            revenue: 0,
            cogs: 0,
            quantity: 0
          });
        }

        const entry = itemMap.get(key);
        entry.revenue += item.amount || 0;
        entry.cogs += cogsPerItem;
        entry.quantity += item.quantity || 1;
      });
    } else {
      // Invoice without line items
      const key = groupBy === 'client'
        ? (inv.clientId?.toString() || 'unknown')
        : (inv.projectId?.toString() || 'no-project');

      if (!itemMap.has(key)) {
        itemMap.set(key, {
          id: key,
          name: inv.clientName || inv.projectName || 'Unknown',
          nameAr: inv.clientNameAr || inv.projectNameAr || '',
          revenue: 0,
          cogs: 0,
          quantity: 0
        });
      }

      const entry = itemMap.get(key);
      entry.revenue += inv.subtotal || inv.totalAmount || 0;
      entry.cogs += invCogs;
      entry.quantity += 1;
    }
  });

  // Calculate gross profit for each item
  const items = Array.from(itemMap.values()).map(item => ({
    ...item,
    grossProfit: item.revenue - item.cogs,
    grossMargin: item.revenue > 0
      ? Math.round((item.revenue - item.cogs) / item.revenue * 1000) / 10
      : 0
  })).sort((a, b) => b.grossProfit - a.grossProfit);

  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const totalCOGS = items.reduce((s, i) => s + i.cogs, 0);
  const grossProfit = totalRevenue - totalCOGS;

  return {
    period: { startDate, endDate },
    summary: {
      totalRevenue,
      totalCOGS,
      grossProfit,
      grossMargin: totalRevenue > 0
        ? Math.round(grossProfit / totalRevenue * 1000) / 10
        : 0
    },
    items,
    generatedAt: new Date().toISOString()
  };
}
```

---

### 5.12 Cost Center Report Service

```javascript
// services/reportService.js

const CostCenter = require('../models/CostCenter');

async function getCostCenterReport(startDate, endDate, companyId, costCenterId = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get all cost centers (or specific one)
  const costCenterQuery = { companyId, isActive: true };
  if (costCenterId) {
    costCenterQuery._id = mongoose.Types.ObjectId(costCenterId);
  }

  const costCenters = await CostCenter.find(costCenterQuery).sort({ code: 1 });

  // Get GL entries grouped by cost center
  const glEntries = await GLEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        date: { $gte: start, $lte: end },
        status: 'posted',
        costCenterId: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          costCenterId: '$costCenterId',
          accountCode: '$accountCode'
        },
        debit: { $sum: '$debit' },
        credit: { $sum: '$credit' }
      }
    }
  ]);

  // Get accounts for name lookup
  const accounts = await Account.find({ companyId, isActive: true });
  const accountMap = new Map();
  accounts.forEach(a => accountMap.set(a.accountCode, a));

  // Build entries map by cost center
  const entriesByCC = new Map();
  glEntries.forEach(e => {
    const ccId = e._id.costCenterId.toString();
    if (!entriesByCC.has(ccId)) {
      entriesByCC.set(ccId, []);
    }
    entriesByCC.get(ccId).push({
      accountCode: e._id.accountCode,
      debit: e.debit,
      credit: e.credit
    });
  });

  // Calculate P&L for each cost center
  let totalIncome = 0;
  let totalExpenses = 0;

  const costCenterData = costCenters.map(cc => {
    const entries = entriesByCC.get(cc._id.toString()) || [];

    const incomeItems = [];
    const expenseItems = [];
    let ccIncome = 0;
    let ccExpenses = 0;

    entries.forEach(e => {
      const account = accountMap.get(e.accountCode);
      if (!account) return;

      const item = {
        accountCode: e.accountCode,
        account: account.accountName,
        accountAr: account.accountNameAr || ''
      };

      if (['income', 'revenue'].includes(account.accountType)) {
        item.amount = e.credit - e.debit;
        incomeItems.push(item);
        ccIncome += item.amount;
      } else if (['expense', 'cost_of_goods_sold'].includes(account.accountType)) {
        item.amount = e.debit - e.credit;
        expenseItems.push(item);
        ccExpenses += item.amount;
      }
    });

    totalIncome += ccIncome;
    totalExpenses += ccExpenses;

    return {
      id: cc._id.toString(),
      name: cc.name,
      nameAr: cc.nameAr || '',
      parentId: cc.parentId?.toString() || null,
      level: cc.level || 0,
      income: {
        items: incomeItems.sort((a, b) => b.amount - a.amount),
        total: ccIncome
      },
      expenses: {
        items: expenseItems.sort((a, b) => b.amount - a.amount),
        total: ccExpenses
      },
      netIncome: ccIncome - ccExpenses
    };
  });

  const companyNetIncome = totalIncome - totalExpenses;

  // Add percentage of company total
  const costCentersWithPercent = costCenterData.map(cc => ({
    ...cc,
    percentage: companyNetIncome !== 0
      ? Math.round(cc.netIncome / companyNetIncome * 1000) / 10
      : 0
  }));

  return {
    period: { startDate, endDate },
    summary: {
      totalIncome,
      totalExpenses,
      netIncome: companyNetIncome
    },
    costCenters: costCentersWithPercent,
    generatedAt: new Date().toISOString()
  };
}
```

---

## 6. Company Settings Integration

### 6.1 Company Settings Endpoint

**Endpoint:** `GET /api/company/settings`

```javascript
// routes/company.js

router.get('/settings', authenticateToken, async (req, res) => {
  const company = await Company.findById(req.user.companyId)
    .select('name nameAr logo address addressAr phone email website vatNumber crNumber city country');

  res.json({ data: company });
});
```

### 6.2 Company Settings Schema

```typescript
interface CompanySettings {
  name: string        // English company name
  nameAr: string      // Arabic company name
  logo: string        // URL to logo image
  address: string     // English address
  addressAr: string   // Arabic address
  phone: string       // Phone number
  email: string       // Contact email
  website: string     // Website URL
  vatNumber: string   // VAT registration number (15 digits for Saudi)
  crNumber: string    // Commercial Registration number
  city: string        // City
  country: string     // Country code (e.g., 'SA')
}
```

### 6.3 Middleware for Adding Company Data

```javascript
// middleware/company.js

const Company = require('../models/Company');

async function addCompanyData(req, res, next) {
  try {
    const companyId = req.user.companyId;

    const company = await Company.findById(companyId)
      .select('name nameAr logo address addressAr phone email vatNumber crNumber');

    req.companyData = company;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { addCompanyData };
```

---

## 7. Export Services

### 7.1 PDF Export (Server-side)

```javascript
// services/reportExportService.js

const PDFDocument = require('pdfkit');

async function exportReportToPDF(reportType, reportData, company, language = 'ar') {
  const doc = new PDFDocument({
    layout: 'portrait',
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Add company header
  if (company.logo) {
    doc.image(company.logo, 50, 50, { width: 60 });
  }

  doc.fontSize(16).text(company.name, 120, 50);
  doc.fontSize(10).text(company.address, 120, 70);

  if (company.vatNumber) {
    doc.text(`VAT: ${company.vatNumber}`, 120, 85);
  }

  // Add report title
  const title = getReportTitle(reportType, language);
  doc.fontSize(20).text(title, 50, 130, { align: 'center' });

  // Add period
  if (reportData.period) {
    doc.fontSize(12).text(
      `${reportData.period.startDate} - ${reportData.period.endDate}`,
      50, 160, { align: 'center' }
    );
  }

  // Add content based on report type
  // ... (implementation depends on report type)

  // Add footer
  doc.fontSize(8).text(
    `Generated: ${new Date().toLocaleString()}`,
    50, doc.page.height - 30
  );

  doc.end();
  return doc;
}

function getReportTitle(reportType, language) {
  const titles = {
    'profit-loss': { ar: 'قائمة الدخل', en: 'Profit & Loss Statement' },
    'balance-sheet': { ar: 'الميزانية العمومية', en: 'Balance Sheet' },
    'trial-balance': { ar: 'ميزان المراجعة', en: 'Trial Balance' },
    'ar-aging': { ar: 'تقادم الذمم المدينة', en: 'Aged Receivables' },
    'invoice-summary': { ar: 'ملخص الفواتير', en: 'Invoice Summary' },
    'expense-summary': { ar: 'ملخص المصروفات', en: 'Expense Summary' },
    'timesheet-summary': { ar: 'ملخص الوقت', en: 'Timesheet Summary' },
    'vat': { ar: 'تقرير ضريبة القيمة المضافة', en: 'VAT Report' }
  };

  return titles[reportType]?.[language] || reportType;
}

module.exports = { exportReportToPDF };
```

### 7.2 Excel Export

```javascript
// services/reportExportService.js

const ExcelJS = require('exceljs');

async function exportReportToExcel(reportType, reportData, company) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(getReportTitle(reportType, 'en'));

  // Add company header
  sheet.addRow([company.name]);
  sheet.addRow([company.address]);
  if (company.vatNumber) {
    sheet.addRow([`VAT: ${company.vatNumber}`]);
  }
  sheet.addRow([]);

  // Add report period if available
  if (reportData.period) {
    sheet.addRow([`Period: ${reportData.period.startDate} - ${reportData.period.endDate}`]);
    sheet.addRow([]);
  }

  // Add data based on report type
  switch (reportType) {
    case 'profit-loss':
      addProfitLossToExcel(sheet, reportData);
      break;
    case 'balance-sheet':
      addBalanceSheetToExcel(sheet, reportData);
      break;
    // ... other report types
  }

  return workbook;
}

function addProfitLossToExcel(sheet, data) {
  // Income section
  sheet.addRow(['INCOME']);
  sheet.addRow(['Account', 'Amount']);

  data.income.items.forEach(item => {
    sheet.addRow([item.account, item.amount / 100]); // Convert halalas to SAR
  });

  sheet.addRow(['Total Income', data.income.total / 100]);
  sheet.addRow([]);

  // Expenses section
  sheet.addRow(['EXPENSES']);
  sheet.addRow(['Account', 'Amount']);

  data.expenses.items.forEach(item => {
    sheet.addRow([item.account, item.amount / 100]);
  });

  sheet.addRow(['Total Expenses', data.expenses.total / 100]);
  sheet.addRow([]);

  // Net Income
  sheet.addRow(['NET INCOME', data.netIncome / 100]);
}

module.exports = { exportReportToExcel };
```

### 7.3 Export Route

```javascript
// routes/reports.js

router.get('/:type/export', authenticateToken, addCompanyData, async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'pdf', startDate, endDate, asOfDate } = req.query;
    const companyId = req.user.companyId;

    // Get report data
    let reportData;
    switch (type) {
      case 'profit-loss':
        reportData = await reportService.getProfitLossReport(startDate, endDate, companyId);
        break;
      case 'balance-sheet':
        reportData = await reportService.getBalanceSheetReport(asOfDate, companyId);
        break;
      // ... other report types
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // Export based on format
    if (format === 'pdf') {
      const doc = await exportReportToPDF(type, reportData, req.companyData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
      doc.pipe(res);
    } else if (format === 'xlsx') {
      const workbook = await exportReportToExcel(type, reportData, req.companyData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
      await workbook.xlsx.write(res);
    } else {
      return res.status(400).json({ error: 'Invalid format. Use pdf or xlsx' });
    }
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});
```

---

## 8. Testing Checklist

### 8.1 Profit & Loss Report
- [ ] Income accounts correctly aggregated
- [ ] Expense accounts correctly aggregated
- [ ] Net income = Total Income - Total Expenses
- [ ] Date range filtering works correctly
- [ ] Empty data returns zero totals

### 8.2 Balance Sheet Report
- [ ] Assets = Liabilities + Equity (accounting equation)
- [ ] Current vs fixed assets categorized correctly
- [ ] Retained earnings calculated from income/expense
- [ ] As-of-date filtering works correctly

### 8.3 Trial Balance Report
- [ ] Total Debits = Total Credits (balanced)
- [ ] Accounts shown on correct side based on normal balance
- [ ] isBalanced flag accurate

### 8.4 Aged Receivables Report
- [ ] Aging buckets calculated correctly from due date
- [ ] Only unpaid invoices included
- [ ] Client grouping works
- [ ] Summary totals match client totals

### 8.5 Invoice Summary Report
- [ ] Invoice count matches actual invoices
- [ ] Collection rate calculated correctly
- [ ] groupBy parameter works (status/client/month)

### 8.6 Expense Summary Report
- [ ] Category grouping works
- [ ] Percentages add up to 100%
- [ ] Approved/pending/rejected totals correct

### 8.7 Timesheet Summary Report
- [ ] Billable vs non-billable hours calculated
- [ ] Utilization rate uses Saudi workweek (Sun-Thu)
- [ ] Profit margin = (Billing - Costing) / Billing

### 8.8 VAT Report
- [ ] Output VAT from invoices correct
- [ ] Input VAT from reclaimable expenses correct
- [ ] Net VAT = Output - Input
- [ ] ZATCA compliance requirements met

### 8.9 Budget Variance Report
- [ ] Budget amounts loaded correctly
- [ ] Actual amounts from GL aggregated correctly
- [ ] Variance calculated as budget - actual
- [ ] Variance percentage calculated correctly
- [ ] Status flags (under/over/on-track) accurate
- [ ] Empty budget returns appropriate response

### 8.10 AP Aging Report
- [ ] Only unpaid/partial expenses included
- [ ] Aging buckets calculated from due date
- [ ] Vendor grouping works correctly
- [ ] Summary totals match vendor totals
- [ ] Arabic vendor names populated

### 8.11 Client Statement Report
- [ ] Opening balance calculated correctly (pre-period)
- [ ] Invoices, payments, credit notes all included
- [ ] Transactions sorted by date
- [ ] Running balance calculated correctly
- [ ] Closing balance = Opening + Debits - Credits
- [ ] Client details included in response

### 8.12 Vendor Ledger Report
- [ ] Opening balance calculated correctly
- [ ] Bills, expenses, payments all included
- [ ] Transactions sorted by date
- [ ] Running balance shows amount owed
- [ ] Closing balance accurate
- [ ] Vendor details included in response

### 8.13 Gross Profit Report
- [ ] Revenue from invoices aggregated correctly
- [ ] COGS from GL entries aggregated correctly
- [ ] Gross profit = Revenue - COGS
- [ ] Gross margin percentage calculated correctly
- [ ] groupBy parameter works (item/project/client)
- [ ] Items sorted by gross profit descending

### 8.14 Cost Center Report
- [ ] Income and expenses grouped by cost center
- [ ] Net income per cost center calculated
- [ ] Percentage of company total accurate
- [ ] Hierarchical cost centers handled correctly
- [ ] costCenterId filter works
- [ ] Only entries with cost center tags included

### 8.15 General
- [ ] Company settings included in all responses
- [ ] Arabic names (accountAr) populated
- [ ] PDF export generates correctly
- [ ] Excel export generates correctly
- [ ] Empty data states handled gracefully
- [ ] Error handling for invalid date ranges
