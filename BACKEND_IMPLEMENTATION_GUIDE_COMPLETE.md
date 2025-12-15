# Complete Backend Implementation Guide

This guide provides detailed instructions for implementing all 16 finance features in your Node.js/Express backend with MongoDB.

---

## Table of Contents

1. [Finance Setup Wizard](#1-finance-setup-wizard)
2. [Chart of Accounts](#2-chart-of-accounts)
3. [Opening Balances](#3-opening-balances)
4. [Fiscal Period Management](#4-fiscal-period-management)
5. [Credit Notes](#5-credit-notes)
6. [Debit Notes](#6-debit-notes)
7. [Recurring Invoices](#7-recurring-invoices)
8. [Time Entry Approvals](#8-time-entry-approvals)
9. [Payment Receipts](#9-payment-receipts)
10. [Invoice Approvals](#10-invoice-approvals)
11. [GL/Journal Entries](#11-gljournal-entries)
12. [Payment Terms Templates](#12-payment-terms-templates)
13. [Expense Policies](#13-expense-policies)
14. [Corporate Card Reconciliation](#14-corporate-card-reconciliation)
15. [Time Entry Locking](#15-time-entry-locking)
16. [Notifications System](#16-notifications-system)

---

## 1. Finance Setup Wizard

### Database Schema

```javascript
// models/FinanceSetup.js
const mongoose = require('mongoose');

const financeSetupSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },

  // Step 1: Company Info
  companyInfo: {
    companyName: String,
    companyNameAr: String,
    crNumber: String,
    vatNumber: String,
    logo: String
  },

  // Step 2: Fiscal Year
  fiscalYear: {
    startDate: Date,
    endDate: Date,
    currentPeriod: Number
  },

  // Step 3: Chart of Accounts
  chartOfAccounts: {
    template: { type: String, enum: ['saudi_standard', 'ifrs', 'custom'] },
    customized: { type: Boolean, default: false }
  },

  // Step 4: Currency
  currency: {
    defaultCurrency: { type: String, default: 'SAR' },
    multiCurrencyEnabled: { type: Boolean, default: false },
    additionalCurrencies: [String]
  },

  // Step 5: Tax Settings
  taxSettings: {
    vatRate: { type: Number, default: 15 },
    taxCalculationMethod: { type: String, enum: ['exclusive', 'inclusive'], default: 'exclusive' },
    zatcaCompliance: { type: Boolean, default: true }
  },

  // Step 6: Bank Accounts
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    iban: String,
    isDefault: Boolean
  }],

  // Step 7: Opening Balances
  openingBalances: {
    asOfDate: Date,
    cash: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    receivables: { type: Number, default: 0 },
    payables: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },

  // Step 8: Invoice Settings
  invoiceSettings: {
    prefix: { type: String, default: 'INV-' },
    nextNumber: { type: Number, default: 1 },
    defaultPaymentTerms: { type: Number, default: 30 },
    defaultTemplate: { type: String, default: 'standard' }
  },

  // Step 9: Payment Methods
  paymentMethods: {
    bankTransfer: { type: Boolean, default: true },
    cash: { type: Boolean, default: true },
    creditCard: { type: Boolean, default: false },
    onlinePayment: { type: Boolean, default: false },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      iban: String
    }
  },

  // Setup Status
  setupCompleted: { type: Boolean, default: false },
  completedAt: Date,
  currentStep: { type: Number, default: 1 }

}, { timestamps: true });

module.exports = mongoose.model('FinanceSetup', financeSetupSchema);
```

### API Endpoints

```javascript
// routes/financeSetup.js
const express = require('express');
const router = express.Router();
const FinanceSetup = require('../models/FinanceSetup');
const Account = require('../models/Account');
const FiscalPeriod = require('../models/FiscalPeriod');

// GET - Check setup status
router.get('/status', async (req, res) => {
  try {
    const setup = await FinanceSetup.findOne({ firmId: req.user.firmId });
    res.json({
      setupCompleted: setup?.setupCompleted || false,
      currentStep: setup?.currentStep || 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Get current setup data
router.get('/', async (req, res) => {
  try {
    let setup = await FinanceSetup.findOne({ firmId: req.user.firmId });
    if (!setup) {
      setup = new FinanceSetup({ firmId: req.user.firmId });
      await setup.save();
    }
    res.json(setup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update setup (save progress)
router.put('/', async (req, res) => {
  try {
    const setup = await FinanceSetup.findOneAndUpdate(
      { firmId: req.user.firmId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(setup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Complete setup
router.post('/complete', async (req, res) => {
  try {
    const setup = await FinanceSetup.findOne({ firmId: req.user.firmId });

    // 1. Create Chart of Accounts based on template
    if (setup.chartOfAccounts.template === 'saudi_standard') {
      await createSaudiStandardAccounts(req.user.firmId);
    }

    // 2. Create Fiscal Year and Periods
    await createFiscalYear(req.user.firmId, setup.fiscalYear);

    // 3. Create Opening Balance Journal Entry
    if (setup.openingBalances.asOfDate) {
      await createOpeningBalanceEntry(req.user.firmId, setup.openingBalances);
    }

    // 4. Update company settings
    await updateCompanySettings(req.user.firmId, setup);

    // 5. Mark setup as complete
    setup.setupCompleted = true;
    setup.completedAt = new Date();
    await setup.save();

    res.json({ success: true, message: 'Setup completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to create Saudi Standard Chart of Accounts
async function createSaudiStandardAccounts(firmId) {
  const accounts = [
    // Assets
    { code: '1000', name: 'Assets', nameAr: 'الأصول', type: 'asset', isGroup: true },
    { code: '1100', name: 'Current Assets', nameAr: 'الأصول المتداولة', type: 'asset', subType: 'current_asset', parentCode: '1000', isGroup: true },
    { code: '1110', name: 'Cash in Hand', nameAr: 'النقدية في الصندوق', type: 'asset', subType: 'cash', parentCode: '1100' },
    { code: '1120', name: 'Bank Accounts', nameAr: 'الحسابات البنكية', type: 'asset', subType: 'bank', parentCode: '1100' },
    { code: '1130', name: 'Accounts Receivable', nameAr: 'العملاء - المدينون', type: 'asset', subType: 'receivable', parentCode: '1100' },

    // Liabilities
    { code: '2000', name: 'Liabilities', nameAr: 'الخصوم', type: 'liability', isGroup: true },
    { code: '2100', name: 'Current Liabilities', nameAr: 'الخصوم المتداولة', type: 'liability', subType: 'current_liability', parentCode: '2000', isGroup: true },
    { code: '2110', name: 'Accounts Payable', nameAr: 'الموردون - الدائنون', type: 'liability', subType: 'payable', parentCode: '2100' },
    { code: '2120', name: 'VAT Payable', nameAr: 'ضريبة القيمة المضافة المستحقة', type: 'liability', subType: 'current_liability', parentCode: '2100' },

    // Equity
    { code: '3000', name: 'Equity', nameAr: 'حقوق الملكية', type: 'equity', isGroup: true },
    { code: '3100', name: 'Capital', nameAr: 'رأس المال', type: 'equity', parentCode: '3000' },
    { code: '3200', name: 'Retained Earnings', nameAr: 'الأرباح المحتجزة', type: 'equity', parentCode: '3000' },

    // Income
    { code: '4000', name: 'Income', nameAr: 'الإيرادات', type: 'income', isGroup: true },
    { code: '4100', name: 'Legal Services Revenue', nameAr: 'إيرادات الخدمات القانونية', type: 'income', subType: 'operating_income', parentCode: '4000' },
    { code: '4200', name: 'Consultation Fees', nameAr: 'أتعاب الاستشارات', type: 'income', subType: 'operating_income', parentCode: '4000' },

    // Expenses
    { code: '5000', name: 'Expenses', nameAr: 'المصروفات', type: 'expense', isGroup: true },
    { code: '5100', name: 'Operating Expenses', nameAr: 'المصروفات التشغيلية', type: 'expense', subType: 'operating_expense', parentCode: '5000', isGroup: true },
    { code: '5110', name: 'Salaries & Wages', nameAr: 'الرواتب والأجور', type: 'expense', subType: 'operating_expense', parentCode: '5100' },
    { code: '5120', name: 'Rent', nameAr: 'الإيجار', type: 'expense', subType: 'operating_expense', parentCode: '5100' },
    { code: '5130', name: 'Utilities', nameAr: 'المرافق', type: 'expense', subType: 'operating_expense', parentCode: '5100' },
  ];

  // Create accounts with parent references
  for (const account of accounts) {
    let parentId = null;
    if (account.parentCode) {
      const parent = await Account.findOne({ firmId, code: account.parentCode });
      parentId = parent?._id;
    }

    await Account.create({
      ...account,
      firmId,
      parentAccountId: parentId,
      isSystemAccount: true,
      isActive: true,
      balance: 0
    });
  }
}

module.exports = router;
```

---

## 2. Chart of Accounts

### Database Schema

```javascript
// models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  type: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'income', 'expense'],
    required: true
  },
  subType: {
    type: String,
    enum: [
      'current_asset', 'fixed_asset', 'bank', 'cash', 'receivable',
      'current_liability', 'long_term_liability', 'payable',
      'operating_income', 'other_income',
      'operating_expense', 'administrative', 'cost_of_sales'
    ]
  },
  parentAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  description: String,
  isGroup: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isSystemAccount: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'SAR' }
}, { timestamps: true });

// Compound index for unique code per firm
accountSchema.index({ firmId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Account', accountSchema);
```

### API Endpoints

```javascript
// routes/accounts.js
const express = require('express');
const router = express.Router();
const Account = require('../models/Account');

// GET all accounts (with tree structure option)
router.get('/', async (req, res) => {
  try {
    const { tree, type, subType, includeInactive } = req.query;

    const query = { firmId: req.user.firmId };
    if (type) query.type = type;
    if (subType) query.subType = subType;
    if (!includeInactive) query.isActive = true;

    const accounts = await Account.find(query)
      .populate('parentAccountId', 'code name nameAr')
      .sort('code');

    if (tree === 'true') {
      // Build tree structure
      const accountMap = {};
      const roots = [];

      accounts.forEach(acc => {
        accountMap[acc._id] = { ...acc.toObject(), children: [] };
      });

      accounts.forEach(acc => {
        if (acc.parentAccountId) {
          const parent = accountMap[acc.parentAccountId._id];
          if (parent) {
            parent.children.push(accountMap[acc._id]);
          }
        } else {
          roots.push(accountMap[acc._id]);
        }
      });

      res.json(roots);
    } else {
      res.json(accounts);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET account types
router.get('/types', async (req, res) => {
  const types = [
    { value: 'asset', label: 'Asset', labelAr: 'أصول' },
    { value: 'liability', label: 'Liability', labelAr: 'خصوم' },
    { value: 'equity', label: 'Equity', labelAr: 'حقوق ملكية' },
    { value: 'income', label: 'Income', labelAr: 'إيرادات' },
    { value: 'expense', label: 'Expense', labelAr: 'مصروفات' }
  ];

  const subTypes = {
    asset: [
      { value: 'current_asset', label: 'Current Asset', labelAr: 'أصول متداولة' },
      { value: 'fixed_asset', label: 'Fixed Asset', labelAr: 'أصول ثابتة' },
      { value: 'bank', label: 'Bank', labelAr: 'بنك' },
      { value: 'cash', label: 'Cash', labelAr: 'نقدية' },
      { value: 'receivable', label: 'Receivable', labelAr: 'مدينون' }
    ],
    liability: [
      { value: 'current_liability', label: 'Current Liability', labelAr: 'خصوم متداولة' },
      { value: 'long_term_liability', label: 'Long-term Liability', labelAr: 'خصوم طويلة الأجل' },
      { value: 'payable', label: 'Payable', labelAr: 'دائنون' }
    ],
    equity: [],
    income: [
      { value: 'operating_income', label: 'Operating Income', labelAr: 'إيرادات تشغيلية' },
      { value: 'other_income', label: 'Other Income', labelAr: 'إيرادات أخرى' }
    ],
    expense: [
      { value: 'operating_expense', label: 'Operating Expense', labelAr: 'مصروفات تشغيلية' },
      { value: 'administrative', label: 'Administrative', labelAr: 'مصروفات إدارية' },
      { value: 'cost_of_sales', label: 'Cost of Sales', labelAr: 'تكلفة المبيعات' }
    ]
  };

  res.json({ types, subTypes });
});

// GET single account
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    }).populate('parentAccountId');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET account balance with date range
router.get('/:id/balance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const account = await Account.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Calculate balance from GL entries
    const GLEntry = require('../models/GLEntry');
    const query = {
      firmId: req.user.firmId,
      'lines.accountId': account._id,
      status: 'posted'
    };

    if (startDate) query.transactionDate = { $gte: new Date(startDate) };
    if (endDate) query.transactionDate = { ...query.transactionDate, $lte: new Date(endDate) };

    const entries = await GLEntry.find(query);

    let debitTotal = 0;
    let creditTotal = 0;

    entries.forEach(entry => {
      entry.lines.forEach(line => {
        if (line.accountId.toString() === account._id.toString()) {
          debitTotal += line.debit || 0;
          creditTotal += line.credit || 0;
        }
      });
    });

    // Calculate balance based on account type
    let balance;
    if (['asset', 'expense'].includes(account.type)) {
      balance = debitTotal - creditTotal;
    } else {
      balance = creditTotal - debitTotal;
    }

    res.json({
      accountId: account._id,
      accountName: account.name,
      debitTotal,
      creditTotal,
      balance,
      startDate,
      endDate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create account
router.post('/', async (req, res) => {
  try {
    const { code, name, nameAr, type, subType, parentAccountId, description } = req.body;

    // Check for duplicate code
    const existing = await Account.findOne({ firmId: req.user.firmId, code });
    if (existing) {
      return res.status(400).json({ error: 'Account code already exists' });
    }

    const account = new Account({
      firmId: req.user.firmId,
      code,
      name,
      nameAr,
      type,
      subType,
      parentAccountId,
      description,
      isActive: true,
      isSystemAccount: false,
      balance: 0
    });

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update account
router.put('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Prevent editing system accounts' critical fields
    if (account.isSystemAccount) {
      const { code, type, subType } = req.body;
      if (code !== account.code || type !== account.type) {
        return res.status(400).json({ error: 'Cannot modify system account type or code' });
      }
    }

    Object.assign(account, req.body);
    await account.save();
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE account
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.isSystemAccount) {
      return res.status(400).json({ error: 'Cannot delete system account' });
    }

    // Check if account has transactions
    const GLEntry = require('../models/GLEntry');
    const hasTransactions = await GLEntry.exists({
      firmId: req.user.firmId,
      'lines.accountId': account._id
    });

    if (hasTransactions) {
      return res.status(400).json({ error: 'Cannot delete account with transactions' });
    }

    // Check for child accounts
    const hasChildren = await Account.exists({
      firmId: req.user.firmId,
      parentAccountId: account._id
    });

    if (hasChildren) {
      return res.status(400).json({ error: 'Cannot delete account with child accounts' });
    }

    await account.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 3. Opening Balances

### API Endpoints

```javascript
// routes/openingBalances.js
const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const Account = require('../models/Account');

// POST create opening balance entry
router.post('/', async (req, res) => {
  try {
    const { asOfDate, lines, description } = req.body;

    // Validate: debits must equal credits
    let totalDebit = 0;
    let totalCredit = 0;

    lines.forEach(line => {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        error: 'Entry is not balanced',
        totalDebit,
        totalCredit,
        difference: totalDebit - totalCredit
      });
    }

    // Create journal entry
    const entry = new JournalEntry({
      firmId: req.user.firmId,
      entryNumber: await generateEntryNumber(req.user.firmId, 'OB'),
      transactionDate: new Date(asOfDate),
      description: description || 'Opening Balance Entry',
      referenceModel: 'OpeningBalance',
      lines: lines.map(line => ({
        accountId: line.accountId,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description
      })),
      totalDebit,
      totalCredit,
      isBalanced: true,
      status: 'posted',
      postedAt: new Date(),
      postedBy: req.user._id,
      createdBy: req.user._id
    });

    await entry.save();

    // Update account balances
    for (const line of lines) {
      const account = await Account.findById(line.accountId);
      if (account) {
        if (['asset', 'expense'].includes(account.type)) {
          account.balance += (line.debit || 0) - (line.credit || 0);
        } else {
          account.balance += (line.credit || 0) - (line.debit || 0);
        }
        await account.save();
      }
    }

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET opening balance entries
router.get('/', async (req, res) => {
  try {
    const entries = await JournalEntry.find({
      firmId: req.user.firmId,
      referenceModel: 'OpeningBalance'
    }).populate('lines.accountId', 'code name nameAr type');

    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 4. Fiscal Period Management

### Database Schema

```javascript
// models/FiscalPeriod.js
const mongoose = require('mongoose');

const fiscalPeriodSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  fiscalYear: { type: Number, required: true },
  periodNumber: { type: Number, required: true }, // 1-12
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['future', 'open', 'closed', 'locked'],
    default: 'future'
  },
  openedAt: Date,
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedAt: Date,
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt: Date,
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closingEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }
}, { timestamps: true });

fiscalPeriodSchema.index({ firmId: 1, fiscalYear: 1, periodNumber: 1 }, { unique: true });

module.exports = mongoose.model('FiscalPeriod', fiscalPeriodSchema);
```

### API Endpoints

```javascript
// routes/fiscalPeriods.js
const express = require('express');
const router = express.Router();
const FiscalPeriod = require('../models/FiscalPeriod');

// GET all fiscal periods
router.get('/', async (req, res) => {
  try {
    const { fiscalYear } = req.query;
    const query = { firmId: req.user.firmId };
    if (fiscalYear) query.fiscalYear = parseInt(fiscalYear);

    const periods = await FiscalPeriod.find(query).sort({ fiscalYear: -1, periodNumber: 1 });
    res.json(periods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET current period
router.get('/current', async (req, res) => {
  try {
    const today = new Date();
    const period = await FiscalPeriod.findOne({
      firmId: req.user.firmId,
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'open'
    });
    res.json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET fiscal years summary
router.get('/years', async (req, res) => {
  try {
    const years = await FiscalPeriod.aggregate([
      { $match: { firmId: req.user.firmId } },
      { $group: {
        _id: '$fiscalYear',
        periods: { $sum: 1 },
        openPeriods: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        closedPeriods: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        lockedPeriods: { $sum: { $cond: [{ $eq: ['$status', 'locked'] }, 1, 0] } },
        startDate: { $min: '$startDate' },
        endDate: { $max: '$endDate' }
      }},
      { $sort: { _id: -1 } }
    ]);
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create fiscal year
router.post('/create-year', async (req, res) => {
  try {
    const { year, startMonth = 1 } = req.body;

    // Check if year already exists
    const existing = await FiscalPeriod.findOne({
      firmId: req.user.firmId,
      fiscalYear: year
    });

    if (existing) {
      return res.status(400).json({ error: 'Fiscal year already exists' });
    }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const periods = [];
    for (let i = 0; i < 12; i++) {
      const monthIndex = (startMonth - 1 + i) % 12;
      const periodYear = monthIndex < startMonth - 1 ? year + 1 : year;

      const startDate = new Date(periodYear, monthIndex, 1);
      const endDate = new Date(periodYear, monthIndex + 1, 0);

      periods.push({
        firmId: req.user.firmId,
        fiscalYear: year,
        periodNumber: i + 1,
        name: `${months[monthIndex]} ${periodYear}`,
        nameAr: `${monthsAr[monthIndex]} ${periodYear}`,
        startDate,
        endDate,
        status: 'future'
      });
    }

    await FiscalPeriod.insertMany(periods);
    res.status(201).json({ success: true, periodsCreated: 12 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST open period
router.post('/:id/open', async (req, res) => {
  try {
    const period = await FiscalPeriod.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    if (period.status !== 'future') {
      return res.status(400).json({ error: 'Only future periods can be opened' });
    }

    period.status = 'open';
    period.openedAt = new Date();
    period.openedBy = req.user._id;
    await period.save();

    res.json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST close period
router.post('/:id/close', async (req, res) => {
  try {
    const period = await FiscalPeriod.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    if (period.status !== 'open') {
      return res.status(400).json({ error: 'Only open periods can be closed' });
    }

    // Check for draft entries in this period
    const JournalEntry = require('../models/JournalEntry');
    const draftCount = await JournalEntry.countDocuments({
      firmId: req.user.firmId,
      status: 'draft',
      transactionDate: { $gte: period.startDate, $lte: period.endDate }
    });

    if (draftCount > 0) {
      return res.status(400).json({
        error: 'Cannot close period with draft entries',
        draftCount
      });
    }

    period.status = 'closed';
    period.closedAt = new Date();
    period.closedBy = req.user._id;
    await period.save();

    res.json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST reopen period
router.post('/:id/reopen', async (req, res) => {
  try {
    const period = await FiscalPeriod.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    if (period.status === 'locked') {
      return res.status(400).json({ error: 'Locked periods cannot be reopened' });
    }

    period.status = 'open';
    await period.save();

    res.json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST lock period
router.post('/:id/lock', async (req, res) => {
  try {
    const period = await FiscalPeriod.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    if (period.status !== 'closed') {
      return res.status(400).json({ error: 'Only closed periods can be locked' });
    }

    period.status = 'locked';
    period.lockedAt = new Date();
    period.lockedBy = req.user._id;
    await period.save();

    res.json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST year-end closing
router.post('/:id/year-end-closing', async (req, res) => {
  try {
    const period = await FiscalPeriod.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    });

    if (!period || period.periodNumber !== 12) {
      return res.status(400).json({ error: 'Year-end closing must be done on period 12' });
    }

    // 1. Calculate all income and expense balances
    const Account = require('../models/Account');
    const incomeAccounts = await Account.find({
      firmId: req.user.firmId,
      type: 'income',
      isGroup: false
    });

    const expenseAccounts = await Account.find({
      firmId: req.user.firmId,
      type: 'expense',
      isGroup: false
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const closingLines = [];

    // Close income accounts (debit income, credit retained earnings)
    for (const account of incomeAccounts) {
      if (account.balance !== 0) {
        closingLines.push({
          accountId: account._id,
          debit: account.balance,
          credit: 0,
          description: `Close ${account.name}`
        });
        totalIncome += account.balance;
      }
    }

    // Close expense accounts (credit expense, debit retained earnings)
    for (const account of expenseAccounts) {
      if (account.balance !== 0) {
        closingLines.push({
          accountId: account._id,
          debit: 0,
          credit: account.balance,
          description: `Close ${account.name}`
        });
        totalExpenses += account.balance;
      }
    }

    // Add retained earnings entry
    const retainedEarnings = await Account.findOne({
      firmId: req.user.firmId,
      code: '3200' // Retained Earnings
    });

    const netIncome = totalIncome - totalExpenses;
    if (netIncome > 0) {
      closingLines.push({
        accountId: retainedEarnings._id,
        debit: 0,
        credit: netIncome,
        description: 'Net income to retained earnings'
      });
    } else if (netIncome < 0) {
      closingLines.push({
        accountId: retainedEarnings._id,
        debit: Math.abs(netIncome),
        credit: 0,
        description: 'Net loss to retained earnings'
      });
    }

    // 2. Create closing journal entry
    const JournalEntry = require('../models/JournalEntry');
    const closingEntry = new JournalEntry({
      firmId: req.user.firmId,
      entryNumber: await generateEntryNumber(req.user.firmId, 'CL'),
      transactionDate: period.endDate,
      description: `Year-End Closing Entry - ${period.fiscalYear}`,
      referenceModel: 'YearEndClosing',
      lines: closingLines,
      totalDebit: closingLines.reduce((sum, l) => sum + l.debit, 0),
      totalCredit: closingLines.reduce((sum, l) => sum + l.credit, 0),
      isBalanced: true,
      status: 'posted',
      postedAt: new Date(),
      postedBy: req.user._id,
      createdBy: req.user._id
    });

    await closingEntry.save();

    // 3. Reset income/expense account balances
    await Account.updateMany(
      { firmId: req.user.firmId, type: { $in: ['income', 'expense'] } },
      { $set: { balance: 0 } }
    );

    // 4. Update retained earnings balance
    retainedEarnings.balance += netIncome;
    await retainedEarnings.save();

    // 5. Lock all periods for this year
    await FiscalPeriod.updateMany(
      { firmId: req.user.firmId, fiscalYear: period.fiscalYear },
      { $set: { status: 'locked', lockedAt: new Date(), lockedBy: req.user._id } }
    );

    // 6. Create next fiscal year
    const nextYear = period.fiscalYear + 1;
    // ... (same logic as create-year)

    res.json({
      success: true,
      closingEntryId: closingEntry._id,
      netIncome,
      message: 'Year-end closing completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 5. Credit Notes

### Database Schema

```javascript
// models/CreditNote.js
const mongoose = require('mongoose');

const creditNoteItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  descriptionAr: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  taxRate: { type: Number, default: 15 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  originalInvoiceItemId: mongoose.Schema.Types.ObjectId
});

const creditNoteSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  creditNoteNumber: { type: String, required: true, unique: true },

  // Reference to original invoice
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  invoiceNumber: String,

  // Client info
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientName: String,
  clientNameAr: String,

  // Credit note details
  creditNoteDate: { type: Date, default: Date.now },
  creditType: { type: String, enum: ['full', 'partial'], required: true },

  // Reason
  reasonCategory: {
    type: String,
    enum: ['error', 'discount', 'return', 'cancellation', 'adjustment', 'other'],
    required: true
  },
  reason: String,
  reasonAr: String,

  // Items
  items: [creditNoteItemSchema],

  // Amounts (stored in halalas - 100 halalas = 1 SAR)
  subtotal: { type: Number, required: true },
  vatRate: { type: Number, default: 15 },
  vatAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },

  // Status
  status: {
    type: String,
    enum: ['draft', 'issued', 'applied', 'void'],
    default: 'draft'
  },

  // ZATCA
  zatcaSubmissionStatus: {
    type: String,
    enum: ['not_submitted', 'submitted', 'accepted', 'rejected'],
    default: 'not_submitted'
  },
  zatcaSubmittedAt: Date,
  zatcaResponse: mongoose.Schema.Types.Mixed,

  // Audit
  issuedAt: Date,
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appliedAt: Date,
  appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voidedAt: Date,
  voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voidReason: String,

  notes: String,
  notesAr: String,

  history: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

creditNoteSchema.index({ firmId: 1, creditNoteNumber: 1 }, { unique: true });

module.exports = mongoose.model('CreditNote', creditNoteSchema);
```

### API Endpoints

```javascript
// routes/creditNotes.js
const express = require('express');
const router = express.Router();
const CreditNote = require('../models/CreditNote');
const Invoice = require('../models/Invoice');

// GET all credit notes
router.get('/', async (req, res) => {
  try {
    const { status, clientId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { firmId: req.user.firmId };
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (startDate || endDate) {
      query.creditNoteDate = {};
      if (startDate) query.creditNoteDate.$gte = new Date(startDate);
      if (endDate) query.creditNoteDate.$lte = new Date(endDate);
    }

    const total = await CreditNote.countDocuments(query);
    const creditNotes = await CreditNote.find(query)
      .populate('clientId', 'firstName lastName companyName')
      .populate('invoiceId', 'invoiceNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      creditNotes,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single credit note
router.get('/:id', async (req, res) => {
  try {
    const creditNote = await CreditNote.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    })
      .populate('clientId')
      .populate('invoiceId')
      .populate('createdBy', 'name')
      .populate('issuedBy', 'name')
      .populate('history.performedBy', 'name');

    if (!creditNote) {
      return res.status(404).json({ error: 'Credit note not found' });
    }

    res.json(creditNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET credit notes for invoice
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const creditNotes = await CreditNote.find({
      firmId: req.user.firmId,
      invoiceId: req.params.invoiceId
    }).sort({ createdAt: -1 });

    res.json(creditNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create credit note
router.post('/', async (req, res) => {
  try {
    const { invoiceId, creditType, reasonCategory, reason, items } = req.body;

    // Get original invoice
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      firmId: req.user.firmId
    }).populate('clientId');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const taxAmount = (itemTotal * (item.taxRate || 15)) / 100;
      subtotal += itemTotal;

      return {
        ...item,
        taxAmount,
        total: itemTotal + taxAmount
      };
    });

    const vatAmount = (subtotal * 15) / 100;
    const total = subtotal + vatAmount;

    // Generate credit note number
    const lastCN = await CreditNote.findOne({ firmId: req.user.firmId })
      .sort({ createdAt: -1 });
    const year = new Date().getFullYear();
    const sequence = lastCN ?
      parseInt(lastCN.creditNoteNumber.split('-')[2]) + 1 : 1;
    const creditNoteNumber = `CN-${year}-${String(sequence).padStart(4, '0')}`;

    const creditNote = new CreditNote({
      firmId: req.user.firmId,
      creditNoteNumber,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId._id,
      clientName: invoice.clientId.companyName ||
        `${invoice.clientId.firstName} ${invoice.clientId.lastName}`,
      creditType,
      reasonCategory,
      reason,
      items: processedItems,
      subtotal,
      vatAmount,
      total,
      status: 'draft',
      createdBy: req.user._id,
      history: [{
        action: 'created',
        performedBy: req.user._id,
        details: { reasonCategory, reason }
      }]
    });

    await creditNote.save();
    res.status(201).json(creditNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST issue credit note
router.post('/:id/issue', async (req, res) => {
  try {
    const creditNote = await CreditNote.findOne({
      _id: req.params.id,
      firmId: req.user.firmId,
      status: 'draft'
    });

    if (!creditNote) {
      return res.status(404).json({ error: 'Credit note not found or not in draft status' });
    }

    creditNote.status = 'issued';
    creditNote.issuedAt = new Date();
    creditNote.issuedBy = req.user._id;
    creditNote.history.push({
      action: 'issued',
      performedBy: req.user._id
    });

    await creditNote.save();
    res.json(creditNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST apply credit note
router.post('/:id/apply', async (req, res) => {
  try {
    const creditNote = await CreditNote.findOne({
      _id: req.params.id,
      firmId: req.user.firmId,
      status: 'issued'
    });

    if (!creditNote) {
      return res.status(404).json({ error: 'Credit note not found or not issued' });
    }

    // Update original invoice balance
    const invoice = await Invoice.findById(creditNote.invoiceId);
    invoice.balanceDue -= creditNote.total;
    if (invoice.balanceDue <= 0) {
      invoice.status = 'paid';
      invoice.balanceDue = 0;
    }
    await invoice.save();

    // Update client balance
    const Client = require('../models/Client');
    await Client.findByIdAndUpdate(creditNote.clientId, {
      $inc: { 'billing.creditBalance': creditNote.total }
    });

    // Create GL entries (reverse of invoice)
    await createCreditNoteGLEntries(creditNote, req.user);

    creditNote.status = 'applied';
    creditNote.appliedAt = new Date();
    creditNote.appliedBy = req.user._id;
    creditNote.history.push({
      action: 'applied',
      performedBy: req.user._id,
      details: { invoiceId: creditNote.invoiceId }
    });

    await creditNote.save();
    res.json(creditNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST void credit note
router.post('/:id/void', async (req, res) => {
  try {
    const { reason } = req.body;

    const creditNote = await CreditNote.findOne({
      _id: req.params.id,
      firmId: req.user.firmId,
      status: { $ne: 'applied' }
    });

    if (!creditNote) {
      return res.status(404).json({ error: 'Credit note not found or already applied' });
    }

    creditNote.status = 'void';
    creditNote.voidedAt = new Date();
    creditNote.voidedBy = req.user._id;
    creditNote.voidReason = reason;
    creditNote.history.push({
      action: 'voided',
      performedBy: req.user._id,
      details: { reason }
    });

    await creditNote.save();
    res.json(creditNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 6. Debit Notes

### Database Schema

```javascript
// models/DebitNote.js
const mongoose = require('mongoose');

const debitNoteSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  debitNoteNumber: { type: String, required: true },

  // Reference to original bill
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  billNumber: String,

  // Vendor info
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: String,

  // Debit note details
  debitNoteDate: { type: Date, default: Date.now },
  isPartial: { type: Boolean, default: false },

  // Reason
  reasonType: {
    type: String,
    enum: ['goods_returned', 'damaged_goods', 'pricing_error', 'quality_issue', 'overcharge', 'other'],
    required: true
  },
  reason: String,

  // Items
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    taxAmount: Number,
    total: Number
  }],

  // Amounts
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },

  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'applied', 'cancelled'],
    default: 'draft'
  },

  // Audit
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appliedAt: Date,
  appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('DebitNote', debitNoteSchema);
```

### API Endpoints

```javascript
// routes/debitNotes.js
const express = require('express');
const router = express.Router();
const DebitNote = require('../models/DebitNote');
const Bill = require('../models/Bill');

// GET all debit notes
router.get('/', async (req, res) => {
  try {
    const { status, vendorId, page = 1, limit = 20 } = req.query;

    const query = { firmId: req.user.firmId };
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;

    const total = await DebitNote.countDocuments(query);
    const debitNotes = await DebitNote.find(query)
      .populate('vendorId', 'name')
      .populate('billId', 'billNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ debitNotes, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create debit note
router.post('/', async (req, res) => {
  try {
    const { billId, reasonType, reason, items, isPartial } = req.body;

    const bill = await Bill.findOne({ _id: billId, firmId: req.user.firmId });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      return { ...item, total: itemTotal };
    });

    const taxAmount = (subtotal * 15) / 100;
    const total = subtotal + taxAmount;

    // Generate number
    const year = new Date().getFullYear();
    const count = await DebitNote.countDocuments({ firmId: req.user.firmId });
    const debitNoteNumber = `DN-${year}-${String(count + 1).padStart(4, '0')}`;

    const debitNote = new DebitNote({
      firmId: req.user.firmId,
      debitNoteNumber,
      billId,
      billNumber: bill.billNumber,
      vendorId: bill.vendorId,
      vendorName: bill.vendorName,
      reasonType,
      reason,
      items: processedItems,
      isPartial,
      subtotal,
      taxAmount,
      total,
      status: 'draft',
      createdBy: req.user._id
    });

    await debitNote.save();
    res.status(201).json(debitNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST approve debit note
router.post('/:id/approve', async (req, res) => {
  try {
    const debitNote = await DebitNote.findOneAndUpdate(
      { _id: req.params.id, firmId: req.user.firmId, status: 'pending' },
      {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user._id
      },
      { new: true }
    );

    if (!debitNote) {
      return res.status(404).json({ error: 'Debit note not found or not pending' });
    }

    res.json(debitNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST apply debit note
router.post('/:id/apply', async (req, res) => {
  try {
    const debitNote = await DebitNote.findOne({
      _id: req.params.id,
      firmId: req.user.firmId,
      status: 'approved'
    });

    if (!debitNote) {
      return res.status(404).json({ error: 'Debit note not found or not approved' });
    }

    // Update bill balance
    const bill = await Bill.findById(debitNote.billId);
    bill.balanceDue -= debitNote.total;
    if (bill.balanceDue <= 0) bill.balanceDue = 0;
    await bill.save();

    // Update vendor balance
    const Vendor = require('../models/Vendor');
    await Vendor.findByIdAndUpdate(debitNote.vendorId, {
      $inc: { outstandingBalance: -debitNote.total }
    });

    // Create GL entries
    await createDebitNoteGLEntries(debitNote, req.user);

    debitNote.status = 'applied';
    debitNote.appliedAt = new Date();
    debitNote.appliedBy = req.user._id;
    await debitNote.save();

    res.json(debitNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 7. Recurring Invoices

### Database Schema

```javascript
// models/RecurringInvoice.js
const mongoose = require('mongoose');

const recurringInvoiceSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  name: { type: String, required: true },
  nameAr: String,

  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },

  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'annually'],
    required: true
  },
  dayOfMonth: { type: Number, min: 1, max: 28 }, // For monthly/quarterly/annually
  dayOfWeek: { type: Number, min: 0, max: 6 }, // For weekly/biweekly

  startDate: { type: Date, required: true },
  endDate: Date,
  nextGenerationDate: { type: Date, required: true },
  lastGeneratedDate: Date,

  timesGenerated: { type: Number, default: 0 },
  maxGenerations: Number,

  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },

  // Invoice template
  items: [{
    description: String,
    descriptionAr: String,
    quantity: Number,
    unitPrice: Number,
    taxRate: { type: Number, default: 15 }
  }],

  subtotal: { type: Number, required: true },
  vatRate: { type: Number, default: 15 },
  vatAmount: Number,
  total: { type: Number, required: true },

  paymentTerms: { type: String, default: 'Net 30' },
  notes: String,
  notesAr: String,

  autoSend: { type: Boolean, default: false },
  generatedInvoiceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('RecurringInvoice', recurringInvoiceSchema);
```

### API Endpoints

```javascript
// routes/recurringInvoices.js
const express = require('express');
const router = express.Router();
const RecurringInvoice = require('../models/RecurringInvoice');
const Invoice = require('../models/Invoice');

// GET all recurring invoices
router.get('/', async (req, res) => {
  try {
    const { status, clientId, page = 1, limit = 20 } = req.query;

    const query = { firmId: req.user.firmId };
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;

    const total = await RecurringInvoice.countDocuments(query);
    const recurringInvoices = await RecurringInvoice.find(query)
      .populate('clientId', 'firstName lastName companyName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ recurringInvoices, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await RecurringInvoice.aggregate([
      { $match: { firmId: req.user.firmId } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }}
    ]);

    const activeCount = stats.find(s => s._id === 'active')?.count || 0;
    const pausedCount = stats.find(s => s._id === 'paused')?.count || 0;
    const monthlyRevenue = await RecurringInvoice.aggregate([
      { $match: { firmId: req.user.firmId, status: 'active', frequency: 'monthly' } },
      { $group: { _id: null, total: { $sum: '$total' } }}
    ]);

    res.json({
      total: stats.reduce((sum, s) => sum + s.count, 0),
      active: activeCount,
      paused: pausedCount,
      monthlyRecurringRevenue: monthlyRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create recurring invoice
router.post('/', async (req, res) => {
  try {
    const {
      name, clientId, caseId, frequency, dayOfMonth, dayOfWeek,
      startDate, endDate, maxGenerations, items, paymentTerms,
      notes, autoSend
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.quantity * item.unitPrice;
    });
    const vatAmount = (subtotal * 15) / 100;
    const total = subtotal + vatAmount;

    // Calculate next generation date
    const nextGenerationDate = calculateNextGenerationDate(
      new Date(startDate), frequency, dayOfMonth, dayOfWeek
    );

    const recurringInvoice = new RecurringInvoice({
      firmId: req.user.firmId,
      name,
      clientId,
      caseId,
      frequency,
      dayOfMonth,
      dayOfWeek,
      startDate,
      endDate,
      nextGenerationDate,
      maxGenerations,
      items,
      subtotal,
      vatAmount,
      total,
      paymentTerms,
      notes,
      autoSend,
      createdBy: req.user._id
    });

    await recurringInvoice.save();
    res.status(201).json(recurringInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST pause recurring invoice
router.post('/:id/pause', async (req, res) => {
  try {
    const recurring = await RecurringInvoice.findOneAndUpdate(
      { _id: req.params.id, firmId: req.user.firmId, status: 'active' },
      { status: 'paused' },
      { new: true }
    );

    if (!recurring) {
      return res.status(404).json({ error: 'Recurring invoice not found' });
    }

    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST resume recurring invoice
router.post('/:id/resume', async (req, res) => {
  try {
    const recurring = await RecurringInvoice.findOne({
      _id: req.params.id,
      firmId: req.user.firmId,
      status: 'paused'
    });

    if (!recurring) {
      return res.status(404).json({ error: 'Recurring invoice not found' });
    }

    // Recalculate next generation date
    recurring.nextGenerationDate = calculateNextGenerationDate(
      new Date(), recurring.frequency, recurring.dayOfMonth, recurring.dayOfWeek
    );
    recurring.status = 'active';
    await recurring.save();

    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST generate invoice now
router.post('/:id/generate', async (req, res) => {
  try {
    const recurring = await RecurringInvoice.findOne({
      _id: req.params.id,
      firmId: req.user.firmId
    }).populate('clientId');

    if (!recurring) {
      return res.status(404).json({ error: 'Recurring invoice not found' });
    }

    // Create invoice
    const invoice = await createInvoiceFromRecurring(recurring, req.user);

    // Update recurring invoice
    recurring.lastGeneratedDate = new Date();
    recurring.timesGenerated += 1;
    recurring.generatedInvoiceIds.push(invoice._id);
    recurring.nextGenerationDate = calculateNextGenerationDate(
      new Date(), recurring.frequency, recurring.dayOfMonth, recurring.dayOfWeek
    );

    // Check if completed
    if (recurring.maxGenerations && recurring.timesGenerated >= recurring.maxGenerations) {
      recurring.status = 'completed';
    }
    if (recurring.endDate && new Date() > recurring.endDate) {
      recurring.status = 'completed';
    }

    await recurring.save();

    // Auto-send if enabled
    if (recurring.autoSend) {
      await sendInvoiceEmail(invoice);
    }

    res.json({ recurring, invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function calculateNextGenerationDate(fromDate, frequency, dayOfMonth, dayOfWeek) {
  const date = new Date(fromDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      if (dayOfMonth) date.setDate(Math.min(dayOfMonth, 28));
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      if (dayOfMonth) date.setDate(Math.min(dayOfMonth, 28));
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

async function createInvoiceFromRecurring(recurring, user) {
  const Invoice = require('../models/Invoice');

  // Generate invoice number
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({ firmId: recurring.firmId });
  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

  const invoice = new Invoice({
    firmId: recurring.firmId,
    invoiceNumber,
    clientId: recurring.clientId._id,
    caseId: recurring.caseId,
    items: recurring.items,
    subtotal: recurring.subtotal,
    vatRate: recurring.vatRate,
    vatAmount: recurring.vatAmount,
    total: recurring.total,
    balanceDue: recurring.total,
    issueDate: new Date(),
    dueDate: calculateDueDate(recurring.paymentTerms),
    paymentTerms: recurring.paymentTerms,
    notes: recurring.notes,
    status: 'pending',
    recurringInvoiceId: recurring._id,
    createdBy: user._id
  });

  await invoice.save();
  return invoice;
}

module.exports = router;
```

### Scheduled Job (Cron)

```javascript
// jobs/processRecurringInvoices.js
const cron = require('node-cron');
const RecurringInvoice = require('../models/RecurringInvoice');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Processing recurring invoices...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueRecurring = await RecurringInvoice.find({
      status: 'active',
      nextGenerationDate: { $lte: today }
    });

    for (const recurring of dueRecurring) {
      try {
        // Generate invoice
        const invoice = await createInvoiceFromRecurring(recurring, { _id: 'system' });

        // Update recurring
        recurring.lastGeneratedDate = new Date();
        recurring.timesGenerated += 1;
        recurring.generatedInvoiceIds.push(invoice._id);
        recurring.nextGenerationDate = calculateNextGenerationDate(
          new Date(), recurring.frequency, recurring.dayOfMonth, recurring.dayOfWeek
        );

        if (recurring.maxGenerations && recurring.timesGenerated >= recurring.maxGenerations) {
          recurring.status = 'completed';
        }

        await recurring.save();

        // Auto-send
        if (recurring.autoSend) {
          await sendInvoiceEmail(invoice);
        }

        console.log(`Generated invoice ${invoice.invoiceNumber} from recurring ${recurring.name}`);
      } catch (err) {
        console.error(`Error processing recurring ${recurring._id}:`, err);
      }
    }
  } catch (error) {
    console.error('Error in recurring invoice job:', error);
  }
});
```

---

## 8-16. Continue in Next Section...

Due to length limits, I'll continue with the remaining features. Let me know if you want me to continue with:

8. Time Entry Approvals
9. Payment Receipts
10. Invoice Approvals
11. GL/Journal Entries
12. Payment Terms Templates
13. Expense Policies
14. Corporate Card Reconciliation
15. Time Entry Locking
16. Notifications System

Each section follows the same pattern with:
- Database Schema (Mongoose model)
- API Endpoints (Express routes)
- Helper functions
- Scheduled jobs (where needed)

---

## Quick Reference: All API Endpoints

```
# Finance Setup Wizard
GET    /api/finance-setup/status
GET    /api/finance-setup
PUT    /api/finance-setup
POST   /api/finance-setup/complete

# Chart of Accounts
GET    /api/accounts
GET    /api/accounts/types
GET    /api/accounts/:id
GET    /api/accounts/:id/balance
POST   /api/accounts
PUT    /api/accounts/:id
DELETE /api/accounts/:id

# Opening Balances
GET    /api/opening-balances
POST   /api/opening-balances

# Fiscal Periods
GET    /api/fiscal-periods
GET    /api/fiscal-periods/current
GET    /api/fiscal-periods/years
POST   /api/fiscal-periods/create-year
POST   /api/fiscal-periods/:id/open
POST   /api/fiscal-periods/:id/close
POST   /api/fiscal-periods/:id/reopen
POST   /api/fiscal-periods/:id/lock
POST   /api/fiscal-periods/:id/year-end-closing

# Credit Notes
GET    /api/credit-notes
GET    /api/credit-notes/:id
GET    /api/credit-notes/invoice/:invoiceId
POST   /api/credit-notes
PUT    /api/credit-notes/:id
POST   /api/credit-notes/:id/issue
POST   /api/credit-notes/:id/apply
POST   /api/credit-notes/:id/void
DELETE /api/credit-notes/:id

# Debit Notes
GET    /api/debit-notes
GET    /api/debit-notes/:id
GET    /api/bills/:billId/debit-notes
POST   /api/debit-notes
PUT    /api/debit-notes/:id
POST   /api/debit-notes/:id/approve
POST   /api/debit-notes/:id/apply
POST   /api/debit-notes/:id/cancel
DELETE /api/debit-notes/:id

# Recurring Invoices
GET    /api/recurring-invoices
GET    /api/recurring-invoices/stats
GET    /api/recurring-invoices/:id
GET    /api/recurring-invoices/:id/history
GET    /api/recurring-invoices/:id/preview
POST   /api/recurring-invoices
PUT    /api/recurring-invoices/:id
POST   /api/recurring-invoices/:id/pause
POST   /api/recurring-invoices/:id/resume
POST   /api/recurring-invoices/:id/cancel
POST   /api/recurring-invoices/:id/generate
POST   /api/recurring-invoices/:id/duplicate
DELETE /api/recurring-invoices/:id

# Time Entry Approvals
GET    /api/time-tracking/entries/pending
POST   /api/time-tracking/entries/:id/submit
POST   /api/time-tracking/entries/:id/approve
POST   /api/time-tracking/entries/:id/reject
POST   /api/time-tracking/entries/:id/request-changes
POST   /api/time-tracking/entries/bulk-submit
POST   /api/time-tracking/entries/bulk-approve
POST   /api/time-tracking/entries/bulk-reject

# Time Entry Locking
POST   /api/time-tracking/entries/:id/lock
POST   /api/time-tracking/entries/:id/unlock
POST   /api/time-tracking/entries/bulk-lock
GET    /api/time-tracking/entries/:id/lock-status
POST   /api/time-tracking/entries/lock-by-date-range

# Payment Receipts
POST   /api/payments/:id/generate-receipt
GET    /api/payments/:id/receipt
GET    /api/payments/:id/receipt/download
POST   /api/payments/:id/receipt/send

# Invoice Approvals
GET    /api/invoices/pending-approval
GET    /api/invoices/pending-approvals-count
POST   /api/invoices/:id/submit-for-approval
POST   /api/invoices/:id/approve
POST   /api/invoices/:id/reject
POST   /api/invoices/:id/request-changes
POST   /api/invoices/:id/escalate
POST   /api/invoices/bulk-approve
GET    /api/invoices/approval-config
PUT    /api/invoices/approval-config

# Journal Entries
GET    /api/journal-entries
GET    /api/journal-entries/templates
GET    /api/journal-entries/:id
POST   /api/journal-entries
POST   /api/journal-entries/simple
POST   /api/journal-entries/from-template/:templateId
PUT    /api/journal-entries/:id
POST   /api/journal-entries/:id/post
POST   /api/journal-entries/:id/void
POST   /api/journal-entries/:id/duplicate
DELETE /api/journal-entries/:id

# General Ledger
GET    /api/general-ledger/entries
GET    /api/general-ledger/:id
GET    /api/general-ledger/trial-balance
GET    /api/general-ledger/profit-loss
GET    /api/general-ledger/balance-sheet
GET    /api/general-ledger/account-balance/:accountId
GET    /api/general-ledger/summary
GET    /api/general-ledger/stats

# Payment Terms
GET    /api/payment-terms
GET    /api/payment-terms/:id
POST   /api/payment-terms
PUT    /api/payment-terms/:id
DELETE /api/payment-terms/:id
POST   /api/payment-terms/:id/set-default
POST   /api/payment-terms/initialize-templates

# Expense Policies
GET    /api/expense-policies
GET    /api/expense-policies/:id
GET    /api/expense-policies/default
POST   /api/expense-policies
PUT    /api/expense-policies/:id
DELETE /api/expense-policies/:id
POST   /api/expense-policies/:id/set-default
POST   /api/expense-policies/:id/toggle-status
POST   /api/expense-policies/:id/duplicate
POST   /api/expense-policies/check-compliance/:claimId

# Corporate Cards
GET    /api/corporate-cards
GET    /api/corporate-cards/:id
GET    /api/corporate-cards/summary
POST   /api/corporate-cards
PUT    /api/corporate-cards/:id
DELETE /api/corporate-cards/:id
POST   /api/corporate-cards/:id/block
POST   /api/corporate-cards/:id/unblock
GET    /api/corporate-cards/:id/transactions
POST   /api/corporate-cards/:id/transactions/import
GET    /api/corporate-cards/:id/transactions/unmatched
POST   /api/corporate-cards/transactions/:id/reconcile
POST   /api/corporate-cards/transactions/:id/dispute
GET    /api/corporate-cards/stats/spending
GET    /api/corporate-cards/stats/categories

# Notifications
GET    /api/notifications
GET    /api/notifications/unread-count
GET    /api/notifications/:id
POST   /api/notifications/:id/mark-read
POST   /api/notifications/mark-all-read
POST   /api/notifications/mark-multiple-read
DELETE /api/notifications/:id
DELETE /api/notifications/clear-read
GET    /api/notifications/settings
PUT    /api/notifications/settings
POST   /api/notifications (internal - for creating notifications)
```

---

## Environment Variables Needed

```env
# Database
MONGODB_URI=mongodb://localhost:27017/traf3li

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email (for notifications and receipts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ZATCA (Saudi e-invoicing)
ZATCA_API_URL=https://fatoora.zatca.gov.sa
ZATCA_API_KEY=your-zatca-api-key

# File Storage
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY=your-key
AWS_SECRET_KEY=your-secret
```

---

This guide provides the foundation. Each endpoint needs proper:
1. Authentication middleware
2. Authorization checks (role-based)
3. Input validation (Joi/express-validator)
4. Error handling
5. Logging

Would you like me to continue with the remaining features (8-16) in detail?
