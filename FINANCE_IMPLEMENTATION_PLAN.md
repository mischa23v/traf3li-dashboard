# Enterprise Finance Module Implementation Plan

**Target Grade: A+ (Enterprise Ready)**
**Based on: Odoo 17, ERPNext 15, iDempiere Best Practices**
**Compliance: ZATCA Phase 2, Saudi PDPL, IFRS**

---

## TABLE OF CONTENTS

1. [Part 1: Core Foundation - Types & Enums](#part-1-core-foundation)
2. [Part 2: Invoice System](#part-2-invoice-system)
3. [Part 3: Payment System](#part-3-payment-system)
4. [Part 4: General Ledger & Journal Entries](#part-4-general-ledger)
5. [Part 5: Multi-Currency Support](#part-5-multi-currency)
6. [Part 6: Tax & ZATCA Compliance](#part-6-tax-zatca)
7. [Part 7: Expense Management](#part-7-expenses)
8. [Part 8: Reporting & Analytics](#part-8-reporting)
9. [Part 9: Audit Trail & Security](#part-9-audit-security)
10. [Part 10: Frontend Implementation Guide](#part-10-frontend)

---

# PART 1: CORE FOUNDATION - TYPES & ENUMS {#part-1-core-foundation}

## 1.1 Money & Currency Types

### Why This Matters
**Problem from Audit:** JavaScript floating-point arithmetic causes rounding errors (0.1 + 0.2 = 0.30000000000000004). Enterprise ERPs use decimal libraries or integer-based money storage.

### Backend Schema

```typescript
// backend/src/types/money.types.ts

/**
 * CRITICAL: All monetary values stored as integers (smallest currency unit)
 * SAR: stored as halalas (1 SAR = 100 halalas)
 * USD: stored as cents (1 USD = 100 cents)
 * This prevents ALL floating-point errors
 */

// Currency configuration
export interface CurrencyConfig {
  code: string;              // ISO 4217: 'SAR', 'USD', 'EUR'
  name: string;              // 'Saudi Riyal'
  nameAr: string;            // 'ريال سعودي'
  symbol: string;            // '﷼' or 'SR'
  decimalPlaces: number;     // 2 for SAR, 0 for JPY, 3 for KWD
  smallestUnit: number;      // 100 for SAR (halalas), 1000 for KWD (fils)
  roundingMode: RoundingMode;
  isActive: boolean;
}

export enum RoundingMode {
  HALF_UP = 'half_up',           // 2.5 -> 3, -2.5 -> -3 (most common)
  HALF_DOWN = 'half_down',       // 2.5 -> 2, -2.5 -> -2
  HALF_EVEN = 'half_even',       // Banker's rounding: 2.5 -> 2, 3.5 -> 4
  CEILING = 'ceiling',           // Always round up
  FLOOR = 'floor',               // Always round down
  ZATCA = 'zatca'                // ZATCA-specific: round to nearest 0.01
}

// Money value object - IMMUTABLE
export interface MoneyValue {
  amount: number;              // Integer in smallest unit (halalas)
  currency: string;            // ISO code
  // Computed on read, not stored:
  // displayAmount: string;    // "1,234.56"
  // rawAmount: number;        // 1234.56 (for calculations only)
}

// Exchange rate entry
export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;                // Stored as decimal with 6 precision
  inverseRate: number;         // Pre-calculated for performance
  rateType: ExchangeRateType;
  effectiveDate: Date;
  expiryDate?: Date;
  source: ExchangeRateSource;
  createdAt: Date;
  createdBy: string;
}

export enum ExchangeRateType {
  SPOT = 'spot',               // Current market rate
  BUY = 'buy',                 // Bank buying rate
  SELL = 'sell',               // Bank selling rate
  AVERAGE = 'average',         // Period average (for P&L)
  CLOSING = 'closing',         // Month-end rate (for Balance Sheet)
  CUSTOM = 'custom'            // User-defined rate
}

export enum ExchangeRateSource {
  MANUAL = 'manual',
  SAMA = 'sama',               // Saudi Central Bank
  OPENEXCHANGE = 'openexchange',
  XE = 'xe',
  CUSTOM_API = 'custom_api'
}
```

### API Contract: Currency Management

```typescript
// GET /api/v1/currencies
// Returns all active currencies with their configurations

interface GetCurrenciesResponse {
  success: true;
  data: {
    currencies: CurrencyConfig[];
    baseCurrency: string;        // Company's functional currency (SAR)
  };
}

// GET /api/v1/exchange-rates?from=USD&to=SAR&date=2026-01-07
// Returns exchange rate for specific date

interface GetExchangeRateRequest {
  from: string;                  // Required: source currency
  to: string;                    // Required: target currency
  date?: string;                 // Optional: defaults to today (ISO format)
  type?: ExchangeRateType;       // Optional: defaults to 'spot'
}

interface GetExchangeRateResponse {
  success: true;
  data: {
    rate: ExchangeRate;
    convertedAmount?: MoneyValue; // If amount was provided in query
  };
}

// POST /api/v1/exchange-rates
// Create/update exchange rate (admin only)

interface CreateExchangeRateRequest {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateType: ExchangeRateType;
  effectiveDate: string;         // ISO date
  expiryDate?: string;
}
```

---

## 1.2 Document Sequence Types

### Why This Matters
**Problem from Audit:** Random invoice numbers cause duplicates and audit failures. Enterprise ERPs use database-backed sequences.

### Backend Schema

```typescript
// backend/src/types/sequence.types.ts

export interface DocumentSequence {
  id: string;
  code: string;                  // 'INV', 'PAY', 'EXP', 'JE'
  name: string;                  // 'Invoice Sequence'
  documentType: DocumentType;

  // Format pattern
  prefix: string;                // 'INV-'
  suffix?: string;               // '-SA' (optional)
  padding: number;               // 5 = 00001
  separator: string;             // '-'

  // Numbering rules
  currentNumber: number;         // Last used number (atomic)
  startNumber: number;           // Starting point
  incrementBy: number;           // Usually 1

  // Reset rules
  resetPeriod: ResetPeriod;      // yearly, monthly, never
  lastResetDate?: Date;

  // Fiscal year in format
  includeFiscalYear: boolean;    // INV-2026-00001
  includeMonth: boolean;         // INV-202601-00001

  // Multi-entity support
  companyId?: string;
  branchId?: string;

  // Audit
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  INVOICE = 'invoice',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  PAYMENT = 'payment',
  RECEIPT = 'receipt',
  EXPENSE = 'expense',
  JOURNAL_ENTRY = 'journal_entry',
  PURCHASE_ORDER = 'purchase_order',
  QUOTATION = 'quotation'
}

export enum ResetPeriod {
  NEVER = 'never',               // Continuous numbering
  YEARLY = 'yearly',             // Reset on fiscal year start
  MONTHLY = 'monthly',           // Reset each month
  QUARTERLY = 'quarterly'        // Reset each quarter
}

// Sequence generation result
export interface GeneratedSequence {
  number: string;                // 'INV-2026-00001'
  numericPart: number;           // 1
  fiscalYear?: number;           // 2026
  fiscalMonth?: number;          // 1
}
```

### API Contract: Sequence Management

```typescript
// POST /api/v1/sequences/next
// Atomically get next sequence number (used internally)

interface GetNextSequenceRequest {
  documentType: DocumentType;
  companyId?: string;
  branchId?: string;
  transactionDate?: string;      // For fiscal year determination
}

interface GetNextSequenceResponse {
  success: true;
  data: GeneratedSequence;
}

// GET /api/v1/sequences
// List all sequences (admin)

// POST /api/v1/sequences
// Create sequence (admin)

// PUT /api/v1/sequences/:id
// Update sequence config (admin) - cannot change current number
```

---

## 1.3 Core Financial Enums

```typescript
// backend/src/types/finance.enums.ts

// ============================================
// INVOICE ENUMS
// ============================================

export enum InvoiceType {
  STANDARD = 'standard',           // Regular sales invoice
  SIMPLIFIED = 'simplified',       // B2C under 1000 SAR (ZATCA)
  CREDIT_NOTE = 'credit_note',     // Refund/return
  DEBIT_NOTE = 'debit_note',       // Additional charge
  PROFORMA = 'proforma',           // Quote/estimate
  ADVANCE = 'advance'              // Advance payment invoice
}

export enum InvoiceStatus {
  DRAFT = 'draft',                 // Can edit freely
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',           // Approved, not yet sent
  SENT = 'sent',                   // Sent to customer
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',                   // Fully paid
  OVERDUE = 'overdue',             // Past due date
  DISPUTED = 'disputed',           // Customer dispute
  CANCELLED = 'cancelled',         // Voided
  WRITTEN_OFF = 'written_off'      // Bad debt
}

export enum InvoiceLineType {
  PRODUCT = 'product',             // Physical goods
  SERVICE = 'service',             // Service line
  EXPENSE = 'expense',             // Reimbursable expense
  DISCOUNT = 'discount',           // Discount line
  SUBTOTAL = 'subtotal',           // Section subtotal (display)
  NOTE = 'note'                    // Text-only line (display)
}

// ============================================
// PAYMENT ENUMS
// ============================================

export enum PaymentType {
  RECEIVE = 'receive',             // Customer payment (AR)
  PAY = 'pay',                     // Vendor payment (AP)
  TRANSFER = 'transfer',           // Internal transfer
  REFUND = 'refund'                // Customer refund
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MADA = 'mada',                   // Saudi debit network
  SADAD = 'sadad',                 // Saudi bill payment
  APPLE_PAY = 'apple_pay',
  STC_PAY = 'stc_pay',
  WIRE = 'wire',
  PROMISSORY_NOTE = 'promissory_note'
}

export enum PaymentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',             // Awaiting clearance
  CLEARED = 'cleared',             // Check cleared
  COMPLETED = 'completed',         // Fully processed
  BOUNCED = 'bounced',             // Check bounced
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum CheckStatus {
  RECEIVED = 'received',           // Check in hand
  DEPOSITED = 'deposited',         // Submitted to bank
  CLEARED = 'cleared',             // Funds available
  BOUNCED = 'bounced',             // NSF or other
  RETURNED = 'returned',           // Returned to customer
  CANCELLED = 'cancelled'
}

export enum AllocationMethod {
  FIFO = 'fifo',                   // First In First Out (oldest first)
  LIFO = 'lifo',                   // Last In First Out
  MANUAL = 'manual',               // User specifies
  SMALLEST_FIRST = 'smallest_first',
  LARGEST_FIRST = 'largest_first'
}

// ============================================
// EXPENSE ENUMS
// ============================================

export enum ExpenseStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',       // Being processed for payment
  PAID = 'paid',                   // Reimbursed
  CANCELLED = 'cancelled'
}

export enum ExpenseCategory {
  TRAVEL = 'travel',
  MEALS = 'meals',
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',
  OFFICE_SUPPLIES = 'office_supplies',
  SOFTWARE = 'software',
  PROFESSIONAL_FEES = 'professional_fees',
  COURT_FEES = 'court_fees',
  REGISTRATION_FEES = 'registration_fees',
  COMMUNICATION = 'communication',
  MARKETING = 'marketing',
  ENTERTAINMENT = 'entertainment',
  TRAINING = 'training',
  MISCELLANEOUS = 'miscellaneous'
}

export enum BillableStatus {
  NOT_BILLABLE = 'not_billable',
  BILLABLE = 'billable',
  BILLED = 'billed',               // Already invoiced to client
  WRITTEN_OFF = 'written_off'      // Billable but not charged
}

// ============================================
// ACCOUNTING ENUMS
// ============================================

export enum AccountType {
  // Balance Sheet - Assets
  ASSET = 'asset',
  CURRENT_ASSET = 'current_asset',
  FIXED_ASSET = 'fixed_asset',
  BANK = 'bank',
  CASH = 'cash',
  RECEIVABLE = 'receivable',
  INVENTORY = 'inventory',
  PREPAID = 'prepaid',

  // Balance Sheet - Liabilities
  LIABILITY = 'liability',
  CURRENT_LIABILITY = 'current_liability',
  LONG_TERM_LIABILITY = 'long_term_liability',
  PAYABLE = 'payable',
  CREDIT_CARD = 'credit_card_liability',
  TAX_PAYABLE = 'tax_payable',
  UNEARNED_REVENUE = 'unearned_revenue',

  // Balance Sheet - Equity
  EQUITY = 'equity',
  RETAINED_EARNINGS = 'retained_earnings',
  OWNER_EQUITY = 'owner_equity',

  // Income Statement
  REVENUE = 'revenue',
  OTHER_INCOME = 'other_income',
  EXPENSE = 'expense',
  COST_OF_GOODS = 'cost_of_goods',
  OPERATING_EXPENSE = 'operating_expense',
  OTHER_EXPENSE = 'other_expense'
}

export enum JournalEntryType {
  GENERAL = 'general',             // Manual entry
  SALES = 'sales',                 // From invoice
  PURCHASE = 'purchase',           // From bill
  PAYMENT = 'payment',             // From payment
  RECEIPT = 'receipt',             // From receipt
  ADJUSTMENT = 'adjustment',       // Period adjustment
  CLOSING = 'closing',             // Year-end closing
  OPENING = 'opening',             // Opening balance
  REVERSING = 'reversing',         // Auto-reverse
  DEPRECIATION = 'depreciation',   // Asset depreciation
  REVALUATION = 'revaluation',     // Currency revaluation
  ACCRUAL = 'accrual',             // Accrued expense/revenue
  DEFERRAL = 'deferral'            // Deferred expense/revenue
}

export enum JournalEntryStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  POSTED = 'posted',               // Finalized, affects GL
  REVERSED = 'reversed',           // Has been reversed
  CANCELLED = 'cancelled'
}

export enum FiscalPeriodStatus {
  OPEN = 'open',                   // Normal operations
  SOFT_CLOSE = 'soft_close',       // Warning on entries
  HARD_CLOSE = 'hard_close',       // No entries allowed
  ARCHIVED = 'archived'            // Historical, read-only
}

// ============================================
// TAX ENUMS
// ============================================

export enum TaxType {
  VAT = 'vat',                     // Value Added Tax
  SALES_TAX = 'sales_tax',
  WITHHOLDING = 'withholding',     // WHT
  EXCISE = 'excise',
  CUSTOMS = 'customs',
  ZAKAT = 'zakat'                  // Islamic wealth tax
}

export enum TaxBehavior {
  EXCLUSIVE = 'exclusive',         // Tax added on top of price
  INCLUSIVE = 'inclusive'          // Tax included in price
}

export enum TaxScope {
  DOMESTIC = 'domestic',           // Within Saudi
  GCC = 'gcc',                     // GCC countries
  EXPORT = 'export',               // Outside GCC (zero-rated)
  EXEMPT = 'exempt',               // No tax applies
  OUT_OF_SCOPE = 'out_of_scope'    // Not subject to tax
}

export enum ZATCAInvoiceType {
  STANDARD = '388',                // B2B standard invoice
  SIMPLIFIED = '381',              // B2C simplified
  CREDIT_NOTE = '383',
  DEBIT_NOTE = '384',
  PREPAYMENT = '386'
}

export enum ZATCAStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  CLEARED = 'cleared',             // Phase 1
  REPORTED = 'reported',           // Phase 2
  REJECTED = 'rejected',
  WARNING = 'warning'              // Accepted with warnings
}

// ============================================
// RECONCILIATION ENUMS
// ============================================

export enum ReconciliationStatus {
  UNRECONCILED = 'unreconciled',
  PARTIALLY_RECONCILED = 'partially_reconciled',
  RECONCILED = 'reconciled',
  DISPUTED = 'disputed'
}

export enum MatchType {
  EXACT = 'exact',                 // Amount matches exactly
  PARTIAL = 'partial',             // Partial match
  COMBINED = 'combined',           // Multiple items match one
  MANUAL = 'manual'                // User-forced match
}
```

---

## 1.4 Validation & Error Types

```typescript
// backend/src/types/finance.errors.ts

export enum FinanceErrorCode {
  // Invoice errors (INV-xxx)
  INV_001 = 'INV_001',  // Invoice not found
  INV_002 = 'INV_002',  // Cannot modify posted invoice
  INV_003 = 'INV_003',  // Invalid line items
  INV_004 = 'INV_004',  // Balance calculation error
  INV_005 = 'INV_005',  // Duplicate invoice number
  INV_006 = 'INV_006',  // Invalid status transition
  INV_007 = 'INV_007',  // Tax calculation error
  INV_008 = 'INV_008',  // Rounding error exceeds tolerance
  INV_009 = 'INV_009',  // Credit note exceeds original
  INV_010 = 'INV_010',  // Cannot delete with payments

  // Payment errors (PAY-xxx)
  PAY_001 = 'PAY_001',  // Payment not found
  PAY_002 = 'PAY_002',  // Insufficient amount
  PAY_003 = 'PAY_003',  // Overpayment not allowed
  PAY_004 = 'PAY_004',  // Invalid allocation
  PAY_005 = 'PAY_005',  // Currency mismatch
  PAY_006 = 'PAY_006',  // Check already processed
  PAY_007 = 'PAY_007',  // Bank account not found
  PAY_008 = 'PAY_008',  // Reconciliation mismatch

  // Accounting errors (ACC-xxx)
  ACC_001 = 'ACC_001',  // Debit/credit imbalance
  ACC_002 = 'ACC_002',  // Invalid account type
  ACC_003 = 'ACC_003',  // Period closed
  ACC_004 = 'ACC_004',  // Account inactive
  ACC_005 = 'ACC_005',  // Missing required account
  ACC_006 = 'ACC_006',  // Duplicate entry
  ACC_007 = 'ACC_007',  // Invalid journal type

  // Tax errors (TAX-xxx)
  TAX_001 = 'TAX_001',  // Invalid VAT number
  TAX_002 = 'TAX_002',  // Tax rate not found
  TAX_003 = 'TAX_003',  // ZATCA submission failed
  TAX_004 = 'TAX_004',  // Invalid tax scope
  TAX_005 = 'TAX_005',  // Withholding calculation error

  // Currency errors (CUR-xxx)
  CUR_001 = 'CUR_001',  // Exchange rate not found
  CUR_002 = 'CUR_002',  // Invalid currency code
  CUR_003 = 'CUR_003',  // Currency conversion error
  CUR_004 = 'CUR_004',  // Rate expired
}

export interface FinanceError {
  code: FinanceErrorCode;
  message: string;
  messageAr: string;
  field?: string;
  details?: Record<string, unknown>;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: FinanceError[];
  warnings: FinanceError[];
}
```

---

## 1.5 Base Response Types

```typescript
// backend/src/types/api.types.ts

// Standard success response
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

// Standard error response
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    messageAr: string;
    field?: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Audit fields (added to all financial documents)
export interface AuditFields {
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  updatedAt: Date;
  updatedBy: string;
  updatedByName: string;
  version: number;              // Optimistic locking
}

// Soft delete fields
export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
}
```

---

## 1.6 Money Calculation Utilities

### Backend Implementation

```typescript
// backend/src/utils/money.utils.ts

import Decimal from 'decimal.js';

// Configure decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9,
  toExpPos: 9,
});

export class Money {
  private amount: Decimal;
  private currency: string;
  private decimalPlaces: number;

  constructor(amount: number | string | Decimal, currency: string, decimalPlaces = 2) {
    this.amount = new Decimal(amount);
    this.currency = currency;
    this.decimalPlaces = decimalPlaces;
  }

  // Factory methods
  static fromCents(cents: number, currency: string): Money {
    return new Money(new Decimal(cents).dividedBy(100), currency);
  }

  static fromHalalas(halalas: number): Money {
    return new Money(new Decimal(halalas).dividedBy(100), 'SAR');
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  // Arithmetic operations (immutable - return new Money)
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount.plus(other.amount), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount.minus(other.amount), this.currency);
  }

  multiply(factor: number | Decimal): Money {
    return new Money(this.amount.times(factor), this.currency);
  }

  divide(divisor: number | Decimal): Money {
    if (new Decimal(divisor).isZero()) {
      throw new Error('Division by zero');
    }
    return new Money(this.amount.dividedBy(divisor), this.currency);
  }

  percentage(percent: number): Money {
    return this.multiply(new Decimal(percent).dividedBy(100));
  }

  // Rounding
  round(mode: RoundingMode = RoundingMode.HALF_UP): Money {
    let rounded: Decimal;

    switch (mode) {
      case RoundingMode.HALF_UP:
        rounded = this.amount.toDecimalPlaces(this.decimalPlaces, Decimal.ROUND_HALF_UP);
        break;
      case RoundingMode.HALF_DOWN:
        rounded = this.amount.toDecimalPlaces(this.decimalPlaces, Decimal.ROUND_HALF_DOWN);
        break;
      case RoundingMode.HALF_EVEN:
        rounded = this.amount.toDecimalPlaces(this.decimalPlaces, Decimal.ROUND_HALF_EVEN);
        break;
      case RoundingMode.CEILING:
        rounded = this.amount.toDecimalPlaces(this.decimalPlaces, Decimal.ROUND_CEIL);
        break;
      case RoundingMode.FLOOR:
        rounded = this.amount.toDecimalPlaces(this.decimalPlaces, Decimal.ROUND_FLOOR);
        break;
      case RoundingMode.ZATCA:
        // ZATCA requires rounding to nearest 0.01 with HALF_UP
        rounded = this.amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        break;
      default:
        rounded = this.amount.toDecimalPlaces(this.decimalPlaces, Decimal.ROUND_HALF_UP);
    }

    return new Money(rounded, this.currency);
  }

  // Comparison
  equals(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount.equals(other.amount);
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount.greaterThan(other.amount);
  }

  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount.lessThan(other.amount);
  }

  isZero(): boolean {
    return this.amount.isZero();
  }

  isNegative(): boolean {
    return this.amount.isNegative();
  }

  isPositive(): boolean {
    return this.amount.isPositive();
  }

  // Conversion
  toCents(): number {
    return this.amount.times(100).toNumber();
  }

  toHalalas(): number {
    return this.amount.times(100).toNumber();
  }

  toNumber(): number {
    return this.amount.toNumber();
  }

  toString(): string {
    return this.amount.toFixed(this.decimalPlaces);
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.toNumber(),
      currency: this.currency,
    };
  }

  // Formatting
  format(locale = 'en-SA'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: this.decimalPlaces,
      maximumFractionDigits: this.decimalPlaces,
    }).format(this.toNumber());
  }

  // Currency conversion
  convert(targetCurrency: string, rate: number): Money {
    const converted = this.amount.times(rate);
    return new Money(converted, targetCurrency);
  }

  // Allocation (for splitting amounts without losing cents)
  allocate(ratios: number[]): Money[] {
    const total = ratios.reduce((sum, r) => sum + r, 0);
    const amounts: Money[] = [];
    let remaining = this.toCents();

    for (let i = 0; i < ratios.length; i++) {
      const share = Math.floor((this.toCents() * ratios[i]) / total);
      amounts.push(Money.fromCents(share, this.currency));
      remaining -= share;
    }

    // Distribute remainder cent by cent
    for (let i = 0; remaining > 0; i++) {
      amounts[i] = amounts[i].add(Money.fromCents(1, this.currency));
      remaining--;
    }

    return amounts;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}

// Helper functions for common operations
export function sumMoney(amounts: Money[]): Money {
  if (amounts.length === 0) {
    throw new Error('Cannot sum empty array');
  }
  return amounts.reduce((sum, m) => sum.add(m), Money.zero(amounts[0].currency));
}

export function calculateTax(base: Money, rate: number, inclusive: boolean): { tax: Money; net: Money } {
  if (inclusive) {
    // Tax is included in the price
    // net = base / (1 + rate)
    // tax = base - net
    const divisor = new Decimal(1).plus(rate);
    const net = base.divide(divisor).round();
    const tax = base.subtract(net);
    return { tax, net };
  } else {
    // Tax is added on top
    const tax = base.percentage(rate * 100).round();
    return { tax, net: base };
  }
}
```

---

## Next: Part 2 - Invoice System

Part 2 will cover:
- Complete Invoice schema with all fields
- Invoice line items with discount/tax handling
- Invoice calculation engine
- Credit note handling
- API contracts for all invoice operations
- Frontend TypeScript types

---

# PART 2: INVOICE SYSTEM {#part-2-invoice-system}

## 2.1 Invoice Schema (Complete)

### Why This Matters
**Problems from Audit:**
- No discount handling at line or document level
- Hardcoded 15% VAT - no flexibility
- Random invoice numbers (race condition)
- No credit note linking to original invoice
- Balance due can go negative (overpayment not handled)

### Backend Schema

```typescript
// backend/src/models/invoice.model.ts

import { Schema, model, Document } from 'mongoose';

// ============================================
// INVOICE LINE ITEM
// ============================================

export interface IInvoiceLineItem {
  lineNumber: number;              // Sequential, for ordering
  lineType: InvoiceLineType;       // product, service, discount, note

  // Item details
  itemId?: string;                 // Reference to service/product catalog
  itemCode?: string;               // SKU or service code
  description: string;             // Line description
  descriptionAr?: string;          // Arabic description

  // Quantity & pricing
  quantity: number;                // Can be decimal (e.g., 2.5 hours)
  unitOfMeasure: string;           // 'hour', 'unit', 'day', etc.
  unitPrice: number;               // Price per unit (in currency smallest unit)

  // Discounts (line level)
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;          // Percentage (15) or fixed amount
  discountAmount: number;          // Calculated discount amount
  discountReason?: string;         // Audit trail

  // Tax
  taxCodeId?: string;              // Reference to tax code
  taxRate: number;                 // Decimal (0.15 for 15%)
  taxAmount: number;               // Calculated tax
  taxBehavior: TaxBehavior;        // inclusive or exclusive

  // Calculated totals (stored for performance, validated on save)
  grossAmount: number;             // quantity * unitPrice
  netAmount: number;               // grossAmount - discountAmount
  totalAmount: number;             // netAmount + taxAmount (if exclusive)

  // Linking
  caseId?: string;                 // Associated case/matter
  projectId?: string;              // Project reference
  costCenterId?: string;           // Cost center

  // Time/expense source
  sourceType?: 'manual' | 'timeEntry' | 'expense';
  sourceId?: string;               // Original time entry or expense ID

  // Display
  displayOrder: number;
  isVisible: boolean;              // Can hide lines for internal use
}

// ============================================
// INVOICE DISCOUNT (DOCUMENT LEVEL)
// ============================================

export interface IInvoiceDiscount {
  id: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;                  // Calculated amount
  reason: string;
  appliedBy: string;
  appliedAt: Date;

  // Tax handling
  applyBeforeTax: boolean;         // true = discount reduces taxable amount
}

// ============================================
// PAYMENT TERMS
// ============================================

export interface IPaymentTerms {
  templateId?: string;             // Reference to payment term template
  termName: string;                // "Net 30", "2/10 Net 30"
  termNameAr?: string;

  // Due date calculation
  dueDays: number;                 // Days from invoice date
  dueType: 'days' | 'eom' | 'fixed'; // End of month, fixed date

  // Early payment discount
  earlyPaymentDiscount?: {
    discountPercent: number;       // e.g., 2 for 2%
    discountDays: number;          // e.g., 10 for "2/10 Net 30"
    discountAmount: number;        // Calculated max discount
  };

  // Installments (optional)
  installments?: Array<{
    dueDate: Date;
    percentage: number;            // Percentage of total
    amount: number;                // Calculated amount
    status: 'pending' | 'paid' | 'overdue';
  }>;
}

// ============================================
// ZATCA FIELDS (Saudi E-Invoicing)
// ============================================

export interface IZATCAData {
  invoiceTypeCode: ZATCAInvoiceType;
  invoiceSubType: string;          // '0100000' for standard B2B

  // Cryptographic
  uuid: string;                    // Unique ID per ZATCA spec
  invoiceHash: string;             // SHA-256 hash
  previousInvoiceHash?: string;    // Chain linking
  digitalSignature?: string;       // CSID signature

  // QR Code
  qrCode: string;                  // Base64 TLV encoded
  qrCodeData: {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    invoiceTotal: string;
    vatTotal: string;
  };

  // Submission
  submissionStatus: ZATCAStatus;
  submissionDate?: Date;
  clearanceDate?: Date;
  reportingDate?: Date;
  zatcaResponse?: {
    requestId: string;
    status: string;
    warnings?: string[];
    errors?: string[];
  };

  // XML
  xmlDocument?: string;            // Full ZATCA XML
  xmlHash?: string;
}

// ============================================
// MAIN INVOICE INTERFACE
// ============================================

export interface IInvoice extends Document {
  // Identification
  invoiceNumber: string;           // System generated, sequential
  invoiceType: InvoiceType;        // standard, simplified, credit_note, etc.
  status: InvoiceStatus;

  // Dates
  invoiceDate: Date;               // Issue date
  dueDate: Date;                   // Payment due date
  deliveryDate?: Date;             // For goods
  serviceStartDate?: Date;         // Service period start
  serviceEndDate?: Date;           // Service period end

  // Currency
  currency: string;                // ISO 4217
  exchangeRate: number;            // To base currency (SAR)
  baseCurrency: string;            // Company currency (SAR)

  // Customer
  customerId: string;              // Reference to customer
  customerName: string;            // Denormalized for performance
  customerNameAr?: string;
  customerVatNumber?: string;      // For B2B invoices
  customerAddress: {
    street: string;
    streetAr?: string;
    city: string;
    cityAr?: string;
    state?: string;
    postalCode: string;
    country: string;
    countryCode: string;           // ISO 3166
  };
  customerEmail?: string;
  customerPhone?: string;

  // Billing vs shipping (if different)
  billingAddress?: typeof this.customerAddress;
  shippingAddress?: typeof this.customerAddress;

  // Line items
  lineItems: IInvoiceLineItem[];

  // Discounts (document level)
  discounts: IInvoiceDiscount[];

  // Payment terms
  paymentTerms: IPaymentTerms;

  // ============================================
  // CALCULATED AMOUNTS (All in smallest currency unit)
  // ============================================

  // Subtotals
  grossTotal: number;              // Sum of line grossAmounts
  lineDiscountTotal: number;       // Sum of line discounts
  subtotal: number;                // grossTotal - lineDiscountTotal

  // Document discounts
  documentDiscountTotal: number;   // Sum of document-level discounts

  // Tax calculations
  taxableAmount: number;           // Amount subject to tax
  exemptAmount: number;            // Amount exempt from tax
  zeroRatedAmount: number;         // Zero-rated amount (export, etc.)

  taxBreakdown: Array<{
    taxCodeId: string;
    taxCode: string;               // e.g., 'VAT-15'
    taxName: string;
    taxRate: number;
    taxableBase: number;
    taxAmount: number;
  }>;

  totalTax: number;                // Sum of all taxes

  // Withholding (if applicable)
  withholdingTaxRate?: number;
  withholdingTaxAmount?: number;

  // Final totals
  totalBeforeTax: number;          // subtotal - documentDiscountTotal
  totalAmount: number;             // totalBeforeTax + totalTax
  totalInBaseCurrency: number;     // Converted to SAR

  // Rounding
  roundingAmount: number;          // Adjustment for cash rounding
  grandTotal: number;              // totalAmount + roundingAmount

  // Payment tracking
  paidAmount: number;              // Total payments received
  creditApplied: number;           // Credit notes/memos applied
  writeOffAmount: number;          // Bad debt written off
  balanceDue: number;              // grandTotal - paidAmount - creditApplied - writeOffAmount

  // ============================================
  // REFERENCES & LINKING
  // ============================================

  // Credit note / Debit note reference
  originalInvoiceId?: string;      // For credit/debit notes
  originalInvoiceNumber?: string;  // Denormalized
  creditNoteReason?: string;       // Why credit was issued

  // Related documents
  quotationId?: string;            // Source quotation
  purchaseOrderNumber?: string;    // Customer PO
  contractId?: string;             // Service contract

  // Case/matter linking (legal)
  caseId?: string;
  caseName?: string;
  caseNumber?: string;

  // ============================================
  // ZATCA E-INVOICING
  // ============================================

  zatca: IZATCAData;

  // ============================================
  // WORKFLOW & APPROVAL
  // ============================================

  approvalWorkflow?: {
    requiredApprovals: number;
    currentApprovals: number;
    approvers: Array<{
      userId: string;
      userName: string;
      status: 'pending' | 'approved' | 'rejected';
      date?: Date;
      comments?: string;
    }>;
  };

  // ============================================
  // COMMUNICATION
  // ============================================

  sentHistory: Array<{
    sentAt: Date;
    sentBy: string;
    sentTo: string[];
    method: 'email' | 'whatsapp' | 'print' | 'portal';
    status: 'sent' | 'delivered' | 'opened' | 'failed';
  }>;

  lastSentDate?: Date;
  viewedByCustomer?: boolean;
  viewedAt?: Date;

  // ============================================
  // NOTES & ATTACHMENTS
  // ============================================

  internalNotes?: string;          // Not shown to customer
  customerNotes?: string;          // Shown on invoice
  termsAndConditions?: string;

  attachments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;

  // ============================================
  // AUDIT TRAIL
  // ============================================

  history: Array<{
    action: string;
    timestamp: Date;
    userId: string;
    userName: string;
    ipAddress?: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
  }>;

  // Standard audit fields
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  version: number;

  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;

  // Lock after posting
  isLocked: boolean;
  lockedAt?: Date;
  lockedBy?: string;
}
```

---

## 2.2 Invoice Calculation Engine

### Why This Matters
This is the **most critical** code in the finance module. Wrong calculations = wrong numbers = lost clients.

```typescript
// backend/src/services/invoice-calculator.service.ts

import { Money, calculateTax, sumMoney } from '../utils/money.utils';
import { IInvoice, IInvoiceLineItem, IInvoiceDiscount } from '../models/invoice.model';
import { TaxBehavior, RoundingMode } from '../types/finance.enums';

export interface CalculationResult {
  lineItems: IInvoiceLineItem[];
  totals: {
    grossTotal: number;
    lineDiscountTotal: number;
    subtotal: number;
    documentDiscountTotal: number;
    taxableAmount: number;
    exemptAmount: number;
    zeroRatedAmount: number;
    taxBreakdown: Array<{
      taxCodeId: string;
      taxCode: string;
      taxName: string;
      taxRate: number;
      taxableBase: number;
      taxAmount: number;
    }>;
    totalTax: number;
    totalBeforeTax: number;
    totalAmount: number;
    roundingAmount: number;
    grandTotal: number;
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export class InvoiceCalculator {
  private currency: string;
  private roundingMode: RoundingMode;
  private taxRounding: 'line' | 'document'; // Round tax per line or at document level

  constructor(
    currency: string,
    roundingMode: RoundingMode = RoundingMode.ZATCA,
    taxRounding: 'line' | 'document' = 'line'
  ) {
    this.currency = currency;
    this.roundingMode = roundingMode;
    this.taxRounding = taxRounding;
  }

  /**
   * Main calculation method
   * Follows enterprise ERP pattern: calculate line by line, then aggregate
   */
  calculate(
    lineItems: Partial<IInvoiceLineItem>[],
    documentDiscounts: IInvoiceDiscount[] = []
  ): CalculationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Step 1: Calculate each line item
    const calculatedLines = lineItems.map((line, index) =>
      this.calculateLineItem(line, index + 1, errors)
    );

    // Step 2: Calculate line-level totals
    const grossTotal = this.sumField(calculatedLines, 'grossAmount');
    const lineDiscountTotal = this.sumField(calculatedLines, 'discountAmount');
    const subtotal = grossTotal.subtract(lineDiscountTotal);

    // Step 3: Apply document-level discounts
    const {
      documentDiscountTotal,
      adjustedLines
    } = this.applyDocumentDiscounts(calculatedLines, documentDiscounts, subtotal);

    // Step 4: Calculate tax
    const {
      taxableAmount,
      exemptAmount,
      zeroRatedAmount,
      taxBreakdown,
      totalTax,
      linesWithTax
    } = this.calculateTaxes(adjustedLines);

    // Step 5: Calculate final totals
    const totalBeforeTax = subtotal.subtract(documentDiscountTotal);
    const totalAmount = totalBeforeTax.add(totalTax);

    // Step 6: Apply rounding (ZATCA requirement)
    const roundingAmount = this.calculateRounding(totalAmount);
    const grandTotal = totalAmount.add(roundingAmount);

    // Step 7: Validate
    this.validateCalculation(
      grossTotal, lineDiscountTotal, subtotal,
      documentDiscountTotal, totalTax, grandTotal,
      errors, warnings
    );

    return {
      lineItems: linesWithTax,
      totals: {
        grossTotal: grossTotal.toHalalas(),
        lineDiscountTotal: lineDiscountTotal.toHalalas(),
        subtotal: subtotal.toHalalas(),
        documentDiscountTotal: documentDiscountTotal.toHalalas(),
        taxableAmount: taxableAmount.toHalalas(),
        exemptAmount: exemptAmount.toHalalas(),
        zeroRatedAmount: zeroRatedAmount.toHalalas(),
        taxBreakdown,
        totalTax: totalTax.toHalalas(),
        totalBeforeTax: totalBeforeTax.toHalalas(),
        totalAmount: totalAmount.toHalalas(),
        roundingAmount: roundingAmount.toHalalas(),
        grandTotal: grandTotal.toHalalas(),
      },
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings,
      },
    };
  }

  /**
   * Calculate single line item with proper rounding
   */
  private calculateLineItem(
    line: Partial<IInvoiceLineItem>,
    lineNumber: number,
    errors: string[]
  ): IInvoiceLineItem {
    // Validate required fields
    if (!line.quantity || line.quantity <= 0) {
      errors.push(`Line ${lineNumber}: Invalid quantity`);
    }
    if (!line.unitPrice || line.unitPrice < 0) {
      errors.push(`Line ${lineNumber}: Invalid unit price`);
    }

    const quantity = new Money(line.quantity || 0, this.currency);
    const unitPrice = Money.fromHalalas(line.unitPrice || 0);

    // Gross = Quantity × Unit Price
    const grossAmount = unitPrice.multiply(quantity.toNumber()).round(this.roundingMode);

    // Calculate line discount
    let discountAmount = Money.zero(this.currency);
    if (line.discountValue && line.discountValue > 0) {
      if (line.discountType === 'percentage') {
        discountAmount = grossAmount.percentage(line.discountValue).round(this.roundingMode);
      } else {
        discountAmount = Money.fromHalalas(line.discountValue);
      }

      // Discount cannot exceed gross
      if (discountAmount.greaterThan(grossAmount)) {
        errors.push(`Line ${lineNumber}: Discount exceeds line amount`);
        discountAmount = grossAmount;
      }
    }

    // Net = Gross - Discount
    const netAmount = grossAmount.subtract(discountAmount);

    // Tax calculation depends on behavior (inclusive vs exclusive)
    let taxAmount = Money.zero(this.currency);
    let totalAmount = netAmount;
    const taxRate = line.taxRate || 0;
    const taxBehavior = line.taxBehavior || TaxBehavior.EXCLUSIVE;

    if (taxRate > 0) {
      if (taxBehavior === TaxBehavior.INCLUSIVE) {
        // Price includes tax - extract it
        const { tax } = calculateTax(netAmount, taxRate, true);
        taxAmount = tax;
        // totalAmount stays the same (tax is included)
      } else {
        // Add tax on top
        taxAmount = netAmount.percentage(taxRate * 100).round(this.roundingMode);
        totalAmount = netAmount.add(taxAmount);
      }
    }

    return {
      ...line,
      lineNumber,
      lineType: line.lineType || 'service',
      description: line.description || '',
      quantity: line.quantity || 0,
      unitOfMeasure: line.unitOfMeasure || 'unit',
      unitPrice: line.unitPrice || 0,
      discountType: line.discountType,
      discountValue: line.discountValue,
      discountAmount: discountAmount.toHalalas(),
      discountReason: line.discountReason,
      taxCodeId: line.taxCodeId,
      taxRate,
      taxAmount: taxAmount.toHalalas(),
      taxBehavior,
      grossAmount: grossAmount.toHalalas(),
      netAmount: netAmount.toHalalas(),
      totalAmount: totalAmount.toHalalas(),
      displayOrder: line.displayOrder || lineNumber,
      isVisible: line.isVisible !== false,
    } as IInvoiceLineItem;
  }

  /**
   * Apply document-level discounts proportionally across lines
   * This is how Odoo and ERPNext handle it
   */
  private applyDocumentDiscounts(
    lines: IInvoiceLineItem[],
    discounts: IInvoiceDiscount[],
    subtotal: Money
  ): { documentDiscountTotal: Money; adjustedLines: IInvoiceLineItem[] } {
    if (discounts.length === 0) {
      return {
        documentDiscountTotal: Money.zero(this.currency),
        adjustedLines: lines
      };
    }

    // Calculate total document discount
    let totalDiscount = Money.zero(this.currency);
    for (const discount of discounts) {
      if (discount.type === 'percentage') {
        const amount = subtotal.percentage(discount.value).round(this.roundingMode);
        discount.amount = amount.toHalalas();
        totalDiscount = totalDiscount.add(amount);
      } else {
        const amount = Money.fromHalalas(discount.value);
        discount.amount = amount.toHalalas();
        totalDiscount = totalDiscount.add(amount);
      }
    }

    // Cap at subtotal
    if (totalDiscount.greaterThan(subtotal)) {
      totalDiscount = subtotal;
    }

    // Distribute proportionally to lines for GL posting
    const adjustedLines = lines.map(line => {
      const lineNetMoney = Money.fromHalalas(line.netAmount);
      const proportion = subtotal.isZero()
        ? 0
        : lineNetMoney.toNumber() / subtotal.toNumber();

      const lineDocDiscount = totalDiscount.multiply(proportion).round(this.roundingMode);

      return {
        ...line,
        documentDiscountShare: lineDocDiscount.toHalalas(),
      };
    });

    return { documentDiscountTotal: totalDiscount, adjustedLines };
  }

  /**
   * Calculate taxes with proper breakdown by tax code
   */
  private calculateTaxes(lines: IInvoiceLineItem[]): {
    taxableAmount: Money;
    exemptAmount: Money;
    zeroRatedAmount: Money;
    taxBreakdown: Array<{
      taxCodeId: string;
      taxCode: string;
      taxName: string;
      taxRate: number;
      taxableBase: number;
      taxAmount: number;
    }>;
    totalTax: Money;
    linesWithTax: IInvoiceLineItem[];
  } {
    let taxableAmount = Money.zero(this.currency);
    let exemptAmount = Money.zero(this.currency);
    let zeroRatedAmount = Money.zero(this.currency);
    const taxMap = new Map<string, {
      taxCodeId: string;
      taxCode: string;
      taxName: string;
      taxRate: number;
      taxableBase: Money;
      taxAmount: Money;
    }>();

    const linesWithTax = lines.map(line => {
      const netAmount = Money.fromHalalas(line.netAmount);
      const docDiscountShare = Money.fromHalalas((line as any).documentDiscountShare || 0);
      const adjustedNet = netAmount.subtract(docDiscountShare);

      if (line.taxRate === 0) {
        // Could be exempt or zero-rated - check tax code
        if (line.taxCodeId?.includes('exempt')) {
          exemptAmount = exemptAmount.add(adjustedNet);
        } else {
          zeroRatedAmount = zeroRatedAmount.add(adjustedNet);
        }
      } else {
        taxableAmount = taxableAmount.add(adjustedNet);

        // Recalculate tax on adjusted amount if document discount applied
        let taxAmount: Money;
        if (line.taxBehavior === TaxBehavior.INCLUSIVE) {
          const { tax } = calculateTax(adjustedNet, line.taxRate, true);
          taxAmount = tax;
        } else {
          taxAmount = adjustedNet.percentage(line.taxRate * 100).round(this.roundingMode);
        }

        // Update line tax
        line.taxAmount = taxAmount.toHalalas();

        // Aggregate by tax code
        const key = `${line.taxRate}-${line.taxCodeId || 'default'}`;
        const existing = taxMap.get(key);
        if (existing) {
          existing.taxableBase = existing.taxableBase.add(adjustedNet);
          existing.taxAmount = existing.taxAmount.add(taxAmount);
        } else {
          taxMap.set(key, {
            taxCodeId: line.taxCodeId || 'VAT-15',
            taxCode: `VAT-${line.taxRate * 100}`,
            taxName: `VAT ${line.taxRate * 100}%`,
            taxRate: line.taxRate,
            taxableBase: adjustedNet,
            taxAmount: taxAmount,
          });
        }
      }

      return line;
    });

    // Convert tax breakdown to array
    const taxBreakdown = Array.from(taxMap.values()).map(item => ({
      taxCodeId: item.taxCodeId,
      taxCode: item.taxCode,
      taxName: item.taxName,
      taxRate: item.taxRate,
      taxableBase: item.taxableBase.toHalalas(),
      taxAmount: item.taxAmount.toHalalas(),
    }));

    // Total tax (document level rounding if configured)
    let totalTax: Money;
    if (this.taxRounding === 'document') {
      // Sum unrounded, then round once
      const unroundedTotal = taxBreakdown.reduce(
        (sum, item) => sum + item.taxAmount, 0
      );
      totalTax = Money.fromHalalas(unroundedTotal).round(this.roundingMode);
    } else {
      // Already rounded per line
      totalTax = Money.fromHalalas(
        taxBreakdown.reduce((sum, item) => sum + item.taxAmount, 0)
      );
    }

    return {
      taxableAmount,
      exemptAmount,
      zeroRatedAmount,
      taxBreakdown,
      totalTax,
      linesWithTax,
    };
  }

  /**
   * ZATCA cash rounding - round to nearest 0.05 SAR
   */
  private calculateRounding(total: Money): Money {
    const cents = total.toHalalas();
    const remainder = cents % 5;

    if (remainder === 0) {
      return Money.zero(this.currency);
    }

    // Round to nearest 5 halalas
    const adjustment = remainder <= 2 ? -remainder : (5 - remainder);
    return Money.fromHalalas(adjustment);
  }

  /**
   * Validate calculation integrity
   */
  private validateCalculation(
    grossTotal: Money,
    lineDiscountTotal: Money,
    subtotal: Money,
    documentDiscountTotal: Money,
    totalTax: Money,
    grandTotal: Money,
    errors: string[],
    warnings: string[]
  ): void {
    // Verify subtotal calculation
    const expectedSubtotal = grossTotal.subtract(lineDiscountTotal);
    if (!subtotal.equals(expectedSubtotal)) {
      errors.push('Subtotal calculation mismatch');
    }

    // Check for excessive discounts
    const totalDiscounts = lineDiscountTotal.add(documentDiscountTotal);
    if (totalDiscounts.greaterThan(grossTotal)) {
      errors.push('Total discounts exceed gross amount');
    }

    // Warn on zero tax for large amounts
    if (totalTax.isZero() && grossTotal.toNumber() > 1000) {
      warnings.push('No tax calculated on invoice > 1000 SAR');
    }

    // Warn on negative balance
    if (grandTotal.isNegative()) {
      warnings.push('Invoice total is negative');
    }
  }

  private sumField(lines: IInvoiceLineItem[], field: keyof IInvoiceLineItem): Money {
    return lines.reduce(
      (sum, line) => sum.add(Money.fromHalalas(line[field] as number || 0)),
      Money.zero(this.currency)
    );
  }
}
```

---

## 2.3 Invoice API Contracts

```typescript
// API: POST /api/v1/invoices
// Create new invoice

interface CreateInvoiceRequest {
  invoiceType: InvoiceType;
  customerId: string;

  // Optional dates (defaults to today)
  invoiceDate?: string;            // ISO date
  serviceStartDate?: string;
  serviceEndDate?: string;

  // Currency (defaults to SAR)
  currency?: string;
  exchangeRate?: number;           // Required if currency != SAR

  // Line items (required)
  lineItems: Array<{
    itemId?: string;
    description: string;
    descriptionAr?: string;
    quantity: number;
    unitPrice: number;             // In halalas
    unitOfMeasure?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    discountReason?: string;
    taxCodeId?: string;            // Defaults to standard VAT
    taxBehavior?: TaxBehavior;
    caseId?: string;
    costCenterId?: string;
  }>;

  // Document discounts (optional)
  discounts?: Array<{
    type: 'percentage' | 'fixed';
    value: number;
    reason: string;
    applyBeforeTax?: boolean;
  }>;

  // Payment terms
  paymentTermsId?: string;         // Use template
  dueDays?: number;                // Or specify directly

  // Credit note specific
  originalInvoiceId?: string;      // Required for credit notes
  creditNoteReason?: string;

  // References
  quotationId?: string;
  purchaseOrderNumber?: string;
  caseId?: string;

  // Notes
  customerNotes?: string;
  internalNotes?: string;
}

interface CreateInvoiceResponse {
  success: true;
  data: {
    invoice: IInvoice;
    calculation: CalculationResult;
  };
}

// ============================================
// GET /api/v1/invoices
// List invoices with filtering
// ============================================

interface ListInvoicesRequest {
  // Pagination
  page?: number;                   // Default 1
  pageSize?: number;               // Default 20, max 100

  // Sorting
  sortBy?: 'invoiceDate' | 'dueDate' | 'grandTotal' | 'createdAt';
  sortOrder?: 'asc' | 'desc';

  // Filters
  status?: InvoiceStatus | InvoiceStatus[];
  invoiceType?: InvoiceType | InvoiceType[];
  customerId?: string;
  caseId?: string;

  // Date range
  dateFrom?: string;               // ISO date
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;

  // Amount range
  minAmount?: number;
  maxAmount?: number;

  // Payment status
  isPaid?: boolean;
  isOverdue?: boolean;

  // Search
  search?: string;                 // Searches number, customer name

  // Include
  include?: ('customer' | 'case' | 'payments')[];
}

interface ListInvoicesResponse {
  success: true;
  data: {
    invoices: IInvoice[];
    summary: {
      totalCount: number;
      totalAmount: number;
      totalPaid: number;
      totalOutstanding: number;
      overdueCount: number;
      overdueAmount: number;
    };
  };
  meta: {
    pagination: PaginationMeta;
  };
}

// ============================================
// PUT /api/v1/invoices/:id
// Update draft invoice
// ============================================

interface UpdateInvoiceRequest {
  // Can only update draft invoices
  // Same fields as create, all optional
  lineItems?: CreateInvoiceRequest['lineItems'];
  discounts?: CreateInvoiceRequest['discounts'];
  customerNotes?: string;
  internalNotes?: string;
  // ... etc
}

// ============================================
// POST /api/v1/invoices/:id/actions/:action
// Invoice actions
// ============================================

type InvoiceAction =
  | 'submit'           // Draft → Pending Approval
  | 'approve'          // Pending → Approved
  | 'reject'           // Pending → Draft (with reason)
  | 'send'             // Approved → Sent
  | 'cancel'           // Any → Cancelled (with reason)
  | 'write-off'        // Overdue → Written Off
  | 'duplicate'        // Create copy as draft
  | 'create-credit-note'; // Create linked credit note

interface InvoiceActionRequest {
  action: InvoiceAction;
  reason?: string;                 // Required for reject, cancel, write-off

  // For send action
  sendTo?: string[];               // Email addresses
  sendMethod?: 'email' | 'whatsapp' | 'portal';
  message?: string;

  // For create-credit-note
  creditAmount?: number;           // Partial credit
  creditReason?: string;
}

interface InvoiceActionResponse {
  success: true;
  data: {
    invoice: IInvoice;
    action: InvoiceAction;
    result: string;
    newInvoiceId?: string;         // For duplicate/credit-note
  };
}
```

---

## 2.4 Credit Note Handling

```typescript
// backend/src/services/credit-note.service.ts

export class CreditNoteService {
  /**
   * Create credit note linked to original invoice
   * Follows ERPNext pattern
   */
  async createCreditNote(
    originalInvoiceId: string,
    reason: string,
    lineItems?: Partial<IInvoiceLineItem>[],
    partialAmount?: number
  ): Promise<IInvoice> {
    // 1. Get original invoice
    const original = await Invoice.findById(originalInvoiceId);
    if (!original) {
      throw new FinanceError(FinanceErrorCode.INV_001, 'Original invoice not found');
    }

    // 2. Validate can credit
    if (original.status === InvoiceStatus.CANCELLED) {
      throw new FinanceError(FinanceErrorCode.INV_006, 'Cannot credit cancelled invoice');
    }

    // 3. Calculate max creditable
    const maxCreditable = original.grandTotal - original.creditApplied;

    // 4. Determine credit amount
    let creditLines: IInvoiceLineItem[];
    let creditTotal: number;

    if (lineItems && lineItems.length > 0) {
      // Specific lines being credited
      creditLines = lineItems.map(line => ({
        ...line,
        quantity: Math.abs(line.quantity || 0) * -1, // Negative for credit
      })) as IInvoiceLineItem[];

      const calc = new InvoiceCalculator(original.currency);
      const result = calc.calculate(creditLines);
      creditTotal = Math.abs(result.totals.grandTotal);
    } else if (partialAmount) {
      // Partial credit - proportional
      creditTotal = partialAmount;
      creditLines = this.createProportionalCreditLines(original, partialAmount);
    } else {
      // Full credit
      creditTotal = maxCreditable;
      creditLines = original.lineItems.map(line => ({
        ...line,
        quantity: line.quantity * -1,
      }));
    }

    // 5. Validate credit amount
    if (creditTotal > maxCreditable) {
      throw new FinanceError(
        FinanceErrorCode.INV_009,
        `Credit (${creditTotal}) exceeds available (${maxCreditable})`
      );
    }

    // 6. Create credit note
    const creditNote = new Invoice({
      invoiceType: InvoiceType.CREDIT_NOTE,
      status: InvoiceStatus.DRAFT,

      // Copy from original
      customerId: original.customerId,
      customerName: original.customerName,
      customerVatNumber: original.customerVatNumber,
      customerAddress: original.customerAddress,
      currency: original.currency,
      exchangeRate: original.exchangeRate,

      // Link to original
      originalInvoiceId: original._id,
      originalInvoiceNumber: original.invoiceNumber,
      creditNoteReason: reason,

      // Credit lines (negative amounts)
      lineItems: creditLines,

      // Dates
      invoiceDate: new Date(),
      dueDate: new Date(), // Credit notes typically due immediately
    });

    // 7. Calculate
    const calc = new InvoiceCalculator(original.currency);
    const calcResult = calc.calculate(creditNote.lineItems);

    // Apply calculated values
    Object.assign(creditNote, {
      grossTotal: calcResult.totals.grossTotal,
      totalTax: calcResult.totals.totalTax,
      grandTotal: calcResult.totals.grandTotal,
      // ... other totals
    });

    // 8. Save
    await creditNote.save();

    // 9. Update original invoice credit applied
    original.creditApplied += Math.abs(creditNote.grandTotal);
    original.balanceDue = original.grandTotal - original.paidAmount - original.creditApplied;

    if (original.balanceDue <= 0) {
      original.status = InvoiceStatus.PAID;
    }

    await original.save();

    return creditNote;
  }

  private createProportionalCreditLines(
    original: IInvoice,
    creditAmount: number
  ): IInvoiceLineItem[] {
    const ratio = creditAmount / original.grandTotal;

    return original.lineItems.map(line => ({
      ...line,
      quantity: -(line.quantity * ratio),
      grossAmount: -(line.grossAmount * ratio),
      netAmount: -(line.netAmount * ratio),
      taxAmount: -(line.taxAmount * ratio),
      totalAmount: -(line.totalAmount * ratio),
    }));
  }
}
```

---

# PART 3: PAYMENT SYSTEM {#part-3-payment-system}

## 3.1 Payment Schema

### Why This Matters
**Problems from Audit:**
- No overpayment handling (creates negative balance)
- No payment allocation algorithm (FIFO, etc.)
- Check lifecycle not tracked (bounced checks break GL)
- No write-off/discount tracking at allocation time
- No exchange rate at payment date

```typescript
// backend/src/models/payment.model.ts

export interface IPaymentAllocation {
  id: string;
  invoiceId: string;
  invoiceNumber: string;              // Denormalized

  // Allocation amounts
  allocatedAmount: number;            // Amount applied to invoice
  allocatedAmountBase: number;        // In base currency (SAR)

  // Discount taken at payment time
  discountTaken: number;              // Early payment discount
  discountType?: 'early_payment' | 'negotiated' | 'write_off';

  // Write-off (small balance)
  writeOffAmount: number;
  writeOffReason?: string;

  // Exchange rate at allocation (for multi-currency)
  exchangeRate: number;
  exchangeGainLoss: number;           // Realized gain/loss

  // Allocation date (may differ from payment date)
  allocationDate: Date;
  allocatedBy: string;

  // Status
  status: 'active' | 'reversed';
  reversedAt?: Date;
  reversedBy?: string;
  reversalReason?: string;
}

export interface ICheckDetails {
  checkNumber: string;
  bankName: string;
  bankBranch?: string;
  checkDate: Date;                    // Date on check
  depositDate?: Date;                 // When deposited
  clearanceDate?: Date;               // When cleared

  status: CheckStatus;

  // Bounce handling
  bouncedDate?: Date;
  bounceReason?: string;
  bounceFee?: number;
  bounceFeePaid?: boolean;

  // PDC (Post-dated check)
  isPostDated: boolean;
  maturityDate?: Date;

  // Image
  checkImageUrl?: string;
}

export interface IPayment extends Document {
  // Identification
  paymentNumber: string;              // System generated
  paymentType: PaymentType;           // receive, pay, transfer, refund
  status: PaymentStatus;

  // Dates
  paymentDate: Date;                  // Transaction date
  valueDate?: Date;                   // Bank value date
  createdDate: Date;

  // Party
  partyType: 'customer' | 'vendor' | 'employee';
  partyId: string;
  partyName: string;
  partyNameAr?: string;

  // Payment method
  paymentMethod: PaymentMethod;
  paymentMethodDetails?: string;      // e.g., "Visa ending 4242"

  // Bank details
  bankAccountId?: string;             // Our bank account
  bankAccountName?: string;
  counterpartyBankAccount?: string;   // Their bank account
  transactionReference?: string;      // Bank reference number

  // Check specific
  checkDetails?: ICheckDetails;

  // Currency & amounts
  currency: string;
  exchangeRate: number;               // At payment date
  baseCurrency: string;               // SAR

  // Amounts
  amount: number;                     // In payment currency
  amountBase: number;                 // In base currency

  // Fees
  bankCharges: number;
  otherFees: number;
  netAmount: number;                  // amount - bankCharges - otherFees

  // Allocations
  allocations: IPaymentAllocation[];
  totalAllocated: number;             // Sum of allocations
  unallocatedAmount: number;          // amount - totalAllocated

  // For overpayments
  isAdvancePayment: boolean;          // True if unallocated > 0 intentionally
  advancePaymentNote?: string;

  // Deductions (for vendor payments)
  deductions?: Array<{
    type: 'withholding_tax' | 'penalty' | 'advance_recovery' | 'other';
    description: string;
    amount: number;
    taxCodeId?: string;
  }>;
  totalDeductions: number;

  // Reconciliation
  reconciliationStatus: ReconciliationStatus;
  bankStatementId?: string;
  bankStatementLineId?: string;
  reconciledAt?: Date;
  reconciledBy?: string;

  // References
  caseId?: string;
  expenseId?: string;
  invoiceIds: string[];               // For quick lookup

  // Notes
  memo?: string;
  internalNotes?: string;

  // Attachments
  attachments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Approval (for large payments)
  approvalRequired: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  approvalComments?: string;

  // Audit
  history: Array<{
    action: string;
    timestamp: Date;
    userId: string;
    userName: string;
    details?: Record<string, unknown>;
  }>;

  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  version: number;

  // Soft delete
  isVoided: boolean;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;

  // GL posting reference
  journalEntryId?: string;
}
```

---

## 3.2 Payment Allocation Service

```typescript
// backend/src/services/payment-allocation.service.ts

export interface AllocationRequest {
  paymentId: string;
  allocations: Array<{
    invoiceId: string;
    amount: number;
    discountTaken?: number;
    writeOffAmount?: number;
    writeOffReason?: string;
  }>;
}

export interface AllocationResult {
  payment: IPayment;
  allocatedInvoices: Array<{
    invoice: IInvoice;
    allocatedAmount: number;
    previousBalance: number;
    newBalance: number;
  }>;
  unallocatedAmount: number;
  exchangeGainLoss: number;
}

export class PaymentAllocationService {
  /**
   * Auto-allocate payment using specified method
   * Implements FIFO, LIFO, smallest-first, etc.
   */
  async autoAllocate(
    paymentId: string,
    method: AllocationMethod = AllocationMethod.FIFO
  ): Promise<AllocationResult> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new FinanceError(FinanceErrorCode.PAY_001, 'Payment not found');
    }

    // Get outstanding invoices for this customer
    const invoices = await Invoice.find({
      customerId: payment.partyId,
      status: { $in: ['sent', 'partially_paid', 'overdue'] },
      balanceDue: { $gt: 0 },
      isDeleted: false,
    }).sort(this.getSortOrder(method));

    // Calculate available amount
    let availableAmount = payment.amount - payment.totalAllocated;
    const allocations: AllocationRequest['allocations'] = [];

    for (const invoice of invoices) {
      if (availableAmount <= 0) break;

      // Check currency match
      if (invoice.currency !== payment.currency) {
        // Skip mismatched currencies in auto-allocation
        continue;
      }

      const allocateAmount = Math.min(availableAmount, invoice.balanceDue);
      allocations.push({
        invoiceId: invoice._id.toString(),
        amount: allocateAmount,
      });

      availableAmount -= allocateAmount;
    }

    if (allocations.length === 0) {
      throw new FinanceError(
        FinanceErrorCode.PAY_004,
        'No invoices available for allocation'
      );
    }

    return this.allocate({ paymentId, allocations });
  }

  /**
   * Manual allocation with validation
   */
  async allocate(request: AllocationRequest): Promise<AllocationResult> {
    const payment = await Payment.findById(request.paymentId);
    if (!payment) {
      throw new FinanceError(FinanceErrorCode.PAY_001, 'Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED &&
        payment.status !== PaymentStatus.CLEARED) {
      throw new FinanceError(
        FinanceErrorCode.PAY_002,
        'Can only allocate completed/cleared payments'
      );
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const results: AllocationResult['allocatedInvoices'] = [];
      let totalAllocating = 0;
      let totalExchangeGainLoss = 0;

      for (const alloc of request.allocations) {
        const invoice = await Invoice.findById(alloc.invoiceId).session(session);
        if (!invoice) {
          throw new FinanceError(FinanceErrorCode.INV_001, `Invoice ${alloc.invoiceId} not found`);
        }

        // Validate amount
        const totalAllocationAmount = alloc.amount +
          (alloc.discountTaken || 0) +
          (alloc.writeOffAmount || 0);

        if (totalAllocationAmount > invoice.balanceDue) {
          throw new FinanceError(
            FinanceErrorCode.PAY_003,
            `Allocation (${totalAllocationAmount}) exceeds balance due (${invoice.balanceDue})`
          );
        }

        // Calculate exchange gain/loss for multi-currency
        let exchangeGainLoss = 0;
        if (payment.currency !== payment.baseCurrency) {
          const invoiceRateAmount = alloc.amount * invoice.exchangeRate;
          const paymentRateAmount = alloc.amount * payment.exchangeRate;
          exchangeGainLoss = paymentRateAmount - invoiceRateAmount;
          totalExchangeGainLoss += exchangeGainLoss;
        }

        // Create allocation record
        const allocation: IPaymentAllocation = {
          id: new mongoose.Types.ObjectId().toString(),
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
          allocatedAmount: alloc.amount,
          allocatedAmountBase: alloc.amount * payment.exchangeRate,
          discountTaken: alloc.discountTaken || 0,
          discountType: alloc.discountTaken ? 'early_payment' : undefined,
          writeOffAmount: alloc.writeOffAmount || 0,
          writeOffReason: alloc.writeOffReason,
          exchangeRate: payment.exchangeRate,
          exchangeGainLoss,
          allocationDate: new Date(),
          allocatedBy: payment.updatedBy,
          status: 'active',
        };

        payment.allocations.push(allocation);
        totalAllocating += alloc.amount;

        // Update invoice
        const previousBalance = invoice.balanceDue;
        invoice.paidAmount += alloc.amount;
        if (alloc.discountTaken) {
          invoice.writeOffAmount += alloc.discountTaken; // Track as write-off
        }
        if (alloc.writeOffAmount) {
          invoice.writeOffAmount += alloc.writeOffAmount;
        }
        invoice.balanceDue = invoice.grandTotal -
          invoice.paidAmount -
          invoice.creditApplied -
          invoice.writeOffAmount;

        // Update invoice status
        if (invoice.balanceDue <= 0) {
          invoice.status = InvoiceStatus.PAID;
        } else if (invoice.paidAmount > 0) {
          invoice.status = InvoiceStatus.PARTIALLY_PAID;
        }

        // Add to payment history
        invoice.history.push({
          action: 'payment_received',
          timestamp: new Date(),
          userId: payment.updatedBy,
          userName: 'System',
          changes: {
            payment: {
              from: null,
              to: {
                paymentId: payment._id,
                paymentNumber: payment.paymentNumber,
                amount: alloc.amount,
              }
            }
          }
        });

        await invoice.save({ session });

        results.push({
          invoice,
          allocatedAmount: alloc.amount,
          previousBalance,
          newBalance: invoice.balanceDue,
        });
      }

      // Update payment
      payment.totalAllocated += totalAllocating;
      payment.unallocatedAmount = payment.amount - payment.totalAllocated;
      payment.invoiceIds = [
        ...new Set([
          ...payment.invoiceIds,
          ...request.allocations.map(a => a.invoiceId)
        ])
      ];

      if (payment.unallocatedAmount > 0) {
        payment.isAdvancePayment = true;
      }

      await payment.save({ session });

      // Create GL entries for allocation
      await this.createAllocationGLEntries(payment, request.allocations, session);

      await session.commitTransaction();

      return {
        payment,
        allocatedInvoices: results,
        unallocatedAmount: payment.unallocatedAmount,
        exchangeGainLoss: totalExchangeGainLoss,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Deallocate (reverse) a specific allocation
   */
  async deallocate(
    paymentId: string,
    allocationId: string,
    reason: string,
    userId: string
  ): Promise<void> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new FinanceError(FinanceErrorCode.PAY_001, 'Payment not found');
    }

    const allocation = payment.allocations.find(a => a.id === allocationId);
    if (!allocation) {
      throw new FinanceError(FinanceErrorCode.PAY_004, 'Allocation not found');
    }

    if (allocation.status === 'reversed') {
      throw new FinanceError(FinanceErrorCode.PAY_004, 'Allocation already reversed');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Reverse invoice updates
      const invoice = await Invoice.findById(allocation.invoiceId).session(session);
      if (invoice) {
        invoice.paidAmount -= allocation.allocatedAmount;
        invoice.writeOffAmount -= (allocation.discountTaken + allocation.writeOffAmount);
        invoice.balanceDue = invoice.grandTotal -
          invoice.paidAmount -
          invoice.creditApplied -
          invoice.writeOffAmount;

        // Update status
        if (invoice.paidAmount === 0) {
          invoice.status = new Date() > invoice.dueDate
            ? InvoiceStatus.OVERDUE
            : InvoiceStatus.SENT;
        } else {
          invoice.status = InvoiceStatus.PARTIALLY_PAID;
        }

        invoice.history.push({
          action: 'payment_reversed',
          timestamp: new Date(),
          userId,
          userName: 'System',
          changes: { reason: { from: null, to: reason } }
        });

        await invoice.save({ session });
      }

      // Mark allocation as reversed
      allocation.status = 'reversed';
      allocation.reversedAt = new Date();
      allocation.reversedBy = userId;
      allocation.reversalReason = reason;

      // Update payment totals
      payment.totalAllocated -= allocation.allocatedAmount;
      payment.unallocatedAmount = payment.amount - payment.totalAllocated;

      await payment.save({ session });

      // Create reversal GL entries
      await this.createReversalGLEntries(payment, allocation, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private getSortOrder(method: AllocationMethod) {
    switch (method) {
      case AllocationMethod.FIFO:
        return { invoiceDate: 1 };       // Oldest first
      case AllocationMethod.LIFO:
        return { invoiceDate: -1 };      // Newest first
      case AllocationMethod.SMALLEST_FIRST:
        return { balanceDue: 1 };
      case AllocationMethod.LARGEST_FIRST:
        return { balanceDue: -1 };
      default:
        return { invoiceDate: 1 };
    }
  }

  private async createAllocationGLEntries(
    payment: IPayment,
    allocations: AllocationRequest['allocations'],
    session: mongoose.ClientSession
  ): Promise<void> {
    // Implementation creates proper double-entry:
    // DR: Accounts Receivable (decrease)
    // CR: Unallocated Receipts (decrease)
    // DR/CR: Exchange Gain/Loss (if applicable)
    // DR: Discount Expense (if discount taken)
    // CR: Bad Debt Expense (if write-off)
  }

  private async createReversalGLEntries(
    payment: IPayment,
    allocation: IPaymentAllocation,
    session: mongoose.ClientSession
  ): Promise<void> {
    // Reverse the original GL entries
  }
}
```

---

## 3.3 Check Lifecycle Management

```typescript
// backend/src/services/check.service.ts

export class CheckService {
  /**
   * Receive check from customer
   */
  async receiveCheck(data: {
    paymentId: string;
    checkNumber: string;
    bankName: string;
    checkDate: Date;
    amount: number;
    isPostDated: boolean;
  }): Promise<IPayment> {
    const payment = await Payment.findById(data.paymentId);
    if (!payment) {
      throw new FinanceError(FinanceErrorCode.PAY_001, 'Payment not found');
    }

    payment.checkDetails = {
      checkNumber: data.checkNumber,
      bankName: data.bankName,
      checkDate: data.checkDate,
      status: data.isPostDated ? CheckStatus.RECEIVED : CheckStatus.RECEIVED,
      isPostDated: data.isPostDated,
      maturityDate: data.isPostDated ? data.checkDate : undefined,
    };

    payment.status = data.isPostDated
      ? PaymentStatus.PENDING  // PDC - wait for maturity
      : PaymentStatus.PENDING; // Regular check - pending deposit

    await payment.save();
    return payment;
  }

  /**
   * Deposit check to bank
   */
  async depositCheck(paymentId: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment?.checkDetails) {
      throw new FinanceError(FinanceErrorCode.PAY_006, 'Check not found');
    }

    if (payment.checkDetails.status !== CheckStatus.RECEIVED) {
      throw new FinanceError(
        FinanceErrorCode.PAY_006,
        `Cannot deposit check in status: ${payment.checkDetails.status}`
      );
    }

    // For PDC, validate maturity date
    if (payment.checkDetails.isPostDated &&
        payment.checkDetails.maturityDate &&
        payment.checkDetails.maturityDate > new Date()) {
      throw new FinanceError(
        FinanceErrorCode.PAY_006,
        'Post-dated check not yet mature'
      );
    }

    payment.checkDetails.status = CheckStatus.DEPOSITED;
    payment.checkDetails.depositDate = new Date();

    await payment.save();
    return payment;
  }

  /**
   * Mark check as cleared
   */
  async clearCheck(paymentId: string, clearanceDate?: Date): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment?.checkDetails) {
      throw new FinanceError(FinanceErrorCode.PAY_006, 'Check not found');
    }

    if (payment.checkDetails.status !== CheckStatus.DEPOSITED) {
      throw new FinanceError(
        FinanceErrorCode.PAY_006,
        'Check must be deposited before clearing'
      );
    }

    payment.checkDetails.status = CheckStatus.CLEARED;
    payment.checkDetails.clearanceDate = clearanceDate || new Date();
    payment.status = PaymentStatus.CLEARED;

    await payment.save();
    return payment;
  }

  /**
   * Handle bounced check - CRITICAL for GL integrity
   */
  async bounceCheck(
    paymentId: string,
    bounceReason: string,
    bounceFee?: number
  ): Promise<{ payment: IPayment; reversalEntries: IJournalEntry }> {
    const payment = await Payment.findById(paymentId);
    if (!payment?.checkDetails) {
      throw new FinanceError(FinanceErrorCode.PAY_006, 'Check not found');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Update check status
      payment.checkDetails.status = CheckStatus.BOUNCED;
      payment.checkDetails.bouncedDate = new Date();
      payment.checkDetails.bounceReason = bounceReason;
      payment.checkDetails.bounceFee = bounceFee;
      payment.status = PaymentStatus.BOUNCED;

      // 2. Reverse all allocations
      for (const allocation of payment.allocations) {
        if (allocation.status === 'active') {
          const invoice = await Invoice.findById(allocation.invoiceId).session(session);
          if (invoice) {
            // Reverse payment from invoice
            invoice.paidAmount -= allocation.allocatedAmount;
            invoice.writeOffAmount -= (allocation.discountTaken + allocation.writeOffAmount);
            invoice.balanceDue = invoice.grandTotal -
              invoice.paidAmount -
              invoice.creditApplied -
              invoice.writeOffAmount;

            // Restore previous status
            if (invoice.paidAmount === 0) {
              invoice.status = new Date() > invoice.dueDate
                ? InvoiceStatus.OVERDUE
                : InvoiceStatus.SENT;
            } else {
              invoice.status = InvoiceStatus.PARTIALLY_PAID;
            }

            invoice.history.push({
              action: 'payment_bounced',
              timestamp: new Date(),
              userId: payment.updatedBy,
              userName: 'System',
              changes: {
                checkNumber: { from: null, to: payment.checkDetails.checkNumber },
                bounceReason: { from: null, to: bounceReason },
              }
            });

            await invoice.save({ session });
          }

          allocation.status = 'reversed';
          allocation.reversedAt = new Date();
          allocation.reversalReason = `Check bounced: ${bounceReason}`;
        }
      }

      payment.totalAllocated = 0;
      payment.unallocatedAmount = 0; // Bounced = no value

      await payment.save({ session });

      // 3. Create reversal journal entry
      const reversalEntry = await this.createBounceReversalEntry(
        payment,
        bounceFee,
        session
      );

      await session.commitTransaction();

      return { payment, reversalEntries: reversalEntry };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async createBounceReversalEntry(
    payment: IPayment,
    bounceFee: number | undefined,
    session: mongoose.ClientSession
  ): Promise<IJournalEntry> {
    // Create journal entry to reverse the original receipt:
    // DR: Cash/Bank (decrease - money returned)
    // CR: Accounts Receivable (increase - debt restored)
    // If bounce fee:
    // DR: Accounts Receivable (charge to customer)
    // CR: Other Income (bounce fee income)

    const lines: IJournalEntryLine[] = [
      {
        accountId: await this.getAccountId('accounts_receivable'),
        accountCode: '1200',
        accountName: 'Accounts Receivable',
        debit: 0,
        credit: payment.amount,
        partyType: 'customer',
        partyId: payment.partyId,
        memo: `Bounced check ${payment.checkDetails?.checkNumber}`,
      },
      {
        accountId: await this.getAccountId('bank', payment.bankAccountId),
        accountCode: '1100',
        accountName: 'Bank Account',
        debit: payment.amount,
        credit: 0,
        memo: `Bounced check reversal`,
      },
    ];

    if (bounceFee && bounceFee > 0) {
      lines.push(
        {
          accountId: await this.getAccountId('accounts_receivable'),
          accountCode: '1200',
          accountName: 'Accounts Receivable',
          debit: bounceFee,
          credit: 0,
          partyType: 'customer',
          partyId: payment.partyId,
          memo: 'Bounced check fee',
        },
        {
          accountId: await this.getAccountId('bounce_fee_income'),
          accountCode: '4900',
          accountName: 'Bounce Fee Income',
          debit: 0,
          credit: bounceFee,
          memo: 'Bounced check fee charged',
        }
      );
    }

    return JournalEntryService.create({
      entryType: JournalEntryType.ADJUSTMENT,
      entryDate: new Date(),
      reference: `BOUNCE-${payment.paymentNumber}`,
      memo: `Bounced check: ${payment.checkDetails?.checkNumber} - ${payment.checkDetails?.bounceReason}`,
      lines,
      sourceDocument: {
        type: 'payment',
        id: payment._id.toString(),
      },
    }, session);
  }
}
```

---

## 3.4 Payment API Contracts

```typescript
// POST /api/v1/payments
interface CreatePaymentRequest {
  paymentType: PaymentType;
  partyType: 'customer' | 'vendor' | 'employee';
  partyId: string;

  paymentDate: string;               // ISO date
  valueDate?: string;

  paymentMethod: PaymentMethod;
  bankAccountId?: string;            // Required for bank/transfer
  transactionReference?: string;

  // Check details
  checkDetails?: {
    checkNumber: string;
    bankName: string;
    checkDate: string;
    isPostDated?: boolean;
  };

  // Amount
  currency: string;
  amount: number;                    // In smallest currency unit
  exchangeRate?: number;             // Required if currency != SAR

  // Fees
  bankCharges?: number;
  otherFees?: number;

  // Deductions (vendor payments)
  deductions?: Array<{
    type: 'withholding_tax' | 'penalty' | 'other';
    description: string;
    amount: number;
  }>;

  // Auto-allocate
  autoAllocate?: boolean;
  allocationMethod?: AllocationMethod;

  // Or manual allocation
  allocations?: Array<{
    invoiceId: string;
    amount: number;
    discountTaken?: number;
    writeOffAmount?: number;
  }>;

  memo?: string;
  internalNotes?: string;
}

// POST /api/v1/payments/:id/allocate
interface AllocatePaymentRequest {
  allocations: Array<{
    invoiceId: string;
    amount: number;
    discountTaken?: number;
    discountType?: 'early_payment' | 'negotiated';
    writeOffAmount?: number;
    writeOffReason?: string;
  }>;
}

// POST /api/v1/payments/:id/check-actions/:action
type CheckAction = 'deposit' | 'clear' | 'bounce' | 'return';

interface CheckActionRequest {
  action: CheckAction;
  // For bounce
  bounceReason?: string;
  bounceFee?: number;
  // For clear
  clearanceDate?: string;
}

// GET /api/v1/payments/unallocated
// Returns payments with unallocated amounts
interface UnallocatedPaymentsResponse {
  success: true;
  data: {
    payments: Array<{
      payment: IPayment;
      unallocatedAmount: number;
      availableInvoices: Array<{
        invoiceId: string;
        invoiceNumber: string;
        balanceDue: number;
        currency: string;
      }>;
    }>;
  };
}

// GET /api/v1/customers/:id/balance
// Customer balance including advances
interface CustomerBalanceResponse {
  success: true;
  data: {
    customerId: string;
    customerName: string;
    currency: string;
    outstanding: number;            // Total unpaid invoices
    advances: number;               // Unallocated payments
    netBalance: number;             // outstanding - advances
    invoicesSummary: {
      total: number;
      paid: number;
      partiallyPaid: number;
      overdue: number;
    };
  };
}
```

---

# PART 4: GENERAL LEDGER & JOURNAL ENTRIES {#part-4-general-ledger}

## 4.1 Chart of Accounts Schema

### Why This Matters
**Problems from Audit:**
- No proper account hierarchy
- No account types for proper financial statements
- Missing system accounts (AR, AP, etc.)
- No multi-company support

```typescript
// backend/src/models/account.model.ts

export interface IAccount extends Document {
  // Identification
  accountCode: string;             // e.g., '1100', '4000'
  accountName: string;
  accountNameAr: string;

  // Classification
  accountType: AccountType;        // asset, liability, equity, revenue, expense
  accountSubType?: string;         // More specific classification

  // Hierarchy
  parentAccountId?: string;        // For account groups
  level: number;                   // 0 = top level
  path: string;                    // '/1000/1100/1110' for fast queries
  isGroup: boolean;                // true = has children, can't post to

  // Currency
  currency: string;                // Default currency
  allowMultiCurrency: boolean;     // Can post in multiple currencies

  // Behavior
  normalBalance: 'debit' | 'credit';
  isReconcilable: boolean;         // For bank accounts
  isControlAccount: boolean;       // AR, AP - linked to subledger

  // Party tracking
  requiresParty: boolean;          // Must specify customer/vendor
  partyType?: 'customer' | 'vendor' | 'employee';

  // Budget
  isBudgetable: boolean;
  budgetControlType?: 'warning' | 'block';

  // Tax
  defaultTaxCodeId?: string;

  // System
  isSystemAccount: boolean;        // Cannot delete
  systemAccountType?: SystemAccountType;

  // Status
  isActive: boolean;
  isPostable: boolean;             // false = summary account only

  // Company
  companyId: string;

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export enum SystemAccountType {
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  ACCOUNTS_PAYABLE = 'accounts_payable',
  CASH = 'cash',
  BANK = 'bank',
  UNEARNED_REVENUE = 'unearned_revenue',
  SALES_REVENUE = 'sales_revenue',
  VAT_OUTPUT = 'vat_output',
  VAT_INPUT = 'vat_input',
  WITHHOLDING_TAX = 'withholding_tax',
  RETAINED_EARNINGS = 'retained_earnings',
  EXCHANGE_GAIN_LOSS = 'exchange_gain_loss',
  ROUNDING = 'rounding',
  SUSPENSE = 'suspense',
  DISCOUNT_GIVEN = 'discount_given',
  DISCOUNT_RECEIVED = 'discount_received',
  BAD_DEBT = 'bad_debt',
}

// Standard Chart of Accounts template for Saudi legal firm
export const STANDARD_CHART_OF_ACCOUNTS = [
  // Assets (1xxx)
  { code: '1000', name: 'Assets', nameAr: 'الأصول', type: AccountType.ASSET, isGroup: true },
  { code: '1100', name: 'Cash & Bank', nameAr: 'النقد والبنوك', type: AccountType.CURRENT_ASSET, isGroup: true, parent: '1000' },
  { code: '1110', name: 'Cash on Hand', nameAr: 'النقد في الصندوق', type: AccountType.CASH, isGroup: false, parent: '1100', system: SystemAccountType.CASH },
  { code: '1120', name: 'Bank Accounts', nameAr: 'الحسابات البنكية', type: AccountType.BANK, isGroup: true, parent: '1100' },
  { code: '1200', name: 'Accounts Receivable', nameAr: 'ذمم العملاء', type: AccountType.RECEIVABLE, isGroup: false, parent: '1000', system: SystemAccountType.ACCOUNTS_RECEIVABLE, requiresParty: true, partyType: 'customer' },
  { code: '1300', name: 'Prepaid Expenses', nameAr: 'مصروفات مدفوعة مقدماً', type: AccountType.PREPAID, isGroup: true, parent: '1000' },
  { code: '1400', name: 'Fixed Assets', nameAr: 'الأصول الثابتة', type: AccountType.FIXED_ASSET, isGroup: true, parent: '1000' },

  // Liabilities (2xxx)
  { code: '2000', name: 'Liabilities', nameAr: 'الالتزامات', type: AccountType.LIABILITY, isGroup: true },
  { code: '2100', name: 'Accounts Payable', nameAr: 'ذمم الموردين', type: AccountType.PAYABLE, isGroup: false, parent: '2000', system: SystemAccountType.ACCOUNTS_PAYABLE, requiresParty: true, partyType: 'vendor' },
  { code: '2200', name: 'Unearned Revenue', nameAr: 'إيرادات غير مكتسبة', type: AccountType.UNEARNED_REVENUE, isGroup: false, parent: '2000', system: SystemAccountType.UNEARNED_REVENUE },
  { code: '2300', name: 'VAT Payable', nameAr: 'ضريبة القيمة المضافة المستحقة', type: AccountType.TAX_PAYABLE, isGroup: true, parent: '2000' },
  { code: '2310', name: 'Output VAT', nameAr: 'ضريبة المخرجات', type: AccountType.TAX_PAYABLE, isGroup: false, parent: '2300', system: SystemAccountType.VAT_OUTPUT },
  { code: '2320', name: 'Input VAT', nameAr: 'ضريبة المدخلات', type: AccountType.CURRENT_ASSET, isGroup: false, parent: '1000', system: SystemAccountType.VAT_INPUT },
  { code: '2400', name: 'Withholding Tax Payable', nameAr: 'ضريبة الاستقطاع', type: AccountType.TAX_PAYABLE, isGroup: false, parent: '2000', system: SystemAccountType.WITHHOLDING_TAX },

  // Equity (3xxx)
  { code: '3000', name: 'Equity', nameAr: 'حقوق الملكية', type: AccountType.EQUITY, isGroup: true },
  { code: '3100', name: 'Partner Capital', nameAr: 'رأس مال الشركاء', type: AccountType.OWNER_EQUITY, isGroup: true, parent: '3000' },
  { code: '3200', name: 'Retained Earnings', nameAr: 'الأرباح المحتجزة', type: AccountType.RETAINED_EARNINGS, isGroup: false, parent: '3000', system: SystemAccountType.RETAINED_EARNINGS },

  // Revenue (4xxx)
  { code: '4000', name: 'Revenue', nameAr: 'الإيرادات', type: AccountType.REVENUE, isGroup: true },
  { code: '4100', name: 'Legal Services Revenue', nameAr: 'إيرادات الخدمات القانونية', type: AccountType.REVENUE, isGroup: false, parent: '4000', system: SystemAccountType.SALES_REVENUE },
  { code: '4200', name: 'Consultation Revenue', nameAr: 'إيرادات الاستشارات', type: AccountType.REVENUE, isGroup: false, parent: '4000' },
  { code: '4900', name: 'Other Income', nameAr: 'إيرادات أخرى', type: AccountType.OTHER_INCOME, isGroup: true, parent: '4000' },

  // Expenses (5xxx)
  { code: '5000', name: 'Expenses', nameAr: 'المصروفات', type: AccountType.EXPENSE, isGroup: true },
  { code: '5100', name: 'Salary Expense', nameAr: 'مصروفات الرواتب', type: AccountType.OPERATING_EXPENSE, isGroup: false, parent: '5000' },
  { code: '5200', name: 'Rent Expense', nameAr: 'مصروفات الإيجار', type: AccountType.OPERATING_EXPENSE, isGroup: false, parent: '5000' },
  { code: '5300', name: 'Utilities', nameAr: 'المرافق', type: AccountType.OPERATING_EXPENSE, isGroup: false, parent: '5000' },
  { code: '5900', name: 'Other Expenses', nameAr: 'مصروفات أخرى', type: AccountType.OTHER_EXPENSE, isGroup: true, parent: '5000' },
  { code: '5910', name: 'Bank Charges', nameAr: 'رسوم بنكية', type: AccountType.OTHER_EXPENSE, isGroup: false, parent: '5900' },
  { code: '5920', name: 'Exchange Gain/Loss', nameAr: 'أرباح/خسائر العملة', type: AccountType.OTHER_EXPENSE, isGroup: false, parent: '5900', system: SystemAccountType.EXCHANGE_GAIN_LOSS },
  { code: '5930', name: 'Bad Debt Expense', nameAr: 'مصروف الديون المعدومة', type: AccountType.OTHER_EXPENSE, isGroup: false, parent: '5900', system: SystemAccountType.BAD_DEBT },
];
```

---

## 4.2 Journal Entry Schema

```typescript
// backend/src/models/journal-entry.model.ts

export interface IJournalEntryLine {
  lineNumber: number;

  // Account
  accountId: string;
  accountCode: string;
  accountName: string;

  // Amounts (in entry currency)
  debit: number;
  credit: number;

  // Base currency amounts (SAR)
  debitBase: number;
  creditBase: number;

  // Party (for AR/AP)
  partyType?: 'customer' | 'vendor' | 'employee';
  partyId?: string;
  partyName?: string;

  // Dimensions
  costCenterId?: string;
  projectId?: string;
  caseId?: string;
  departmentId?: string;

  // Memo
  memo?: string;

  // Tax
  taxCodeId?: string;
  taxAmount?: number;

  // Reconciliation (for bank accounts)
  reconciliationStatus?: ReconciliationStatus;
  reconciledDate?: Date;
  bankStatementLineId?: string;
}

export interface IJournalEntry extends Document {
  // Identification
  entryNumber: string;             // System generated
  entryType: JournalEntryType;
  status: JournalEntryStatus;

  // Dates
  entryDate: Date;                 // Transaction date
  postingDate?: Date;              // When posted to GL
  period: string;                  // Fiscal period (YYYY-MM)

  // Currency
  currency: string;
  exchangeRate: number;
  baseCurrency: string;

  // Description
  reference: string;               // User reference
  memo: string;                    // Description

  // Lines
  lines: IJournalEntryLine[];

  // Totals
  totalDebit: number;
  totalCredit: number;
  totalDebitBase: number;
  totalCreditBase: number;

  // Source document
  sourceDocument?: {
    type: 'invoice' | 'payment' | 'expense' | 'manual' | 'system';
    id: string;
    number: string;
  };

  // Reversal
  isReversing: boolean;            // This is a reversing entry
  originalEntryId?: string;        // Entry being reversed
  reversedEntryId?: string;        // Entry that reverses this
  reversalDate?: Date;

  // Auto-reversal (for accruals)
  autoReverse: boolean;
  autoReverseDate?: Date;
  autoReversed: boolean;

  // Recurring
  isRecurring: boolean;
  recurringScheduleId?: string;

  // Approval
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;

  // Company
  companyId: string;

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  postedBy?: string;
  version: number;

  // Lock
  isLocked: boolean;
}
```

---

## 4.3 Journal Entry Service (Double-Entry Enforcement)

```typescript
// backend/src/services/journal-entry.service.ts

export interface CreateJournalEntryRequest {
  entryType: JournalEntryType;
  entryDate: Date;
  reference: string;
  memo: string;
  currency?: string;
  exchangeRate?: number;
  lines: Array<{
    accountId: string;
    debit?: number;
    credit?: number;
    partyType?: string;
    partyId?: string;
    costCenterId?: string;
    projectId?: string;
    caseId?: string;
    memo?: string;
  }>;
  autoReverse?: boolean;
  autoReverseDate?: Date;
  sourceDocument?: {
    type: string;
    id: string;
    number?: string;
  };
}

export class JournalEntryService {
  /**
   * Create and validate journal entry
   * CRITICAL: Enforces double-entry bookkeeping
   */
  static async create(
    request: CreateJournalEntryRequest,
    session?: mongoose.ClientSession
  ): Promise<IJournalEntry> {
    // 1. Validate fiscal period is open
    const period = await this.validatePeriod(request.entryDate);

    // 2. Validate and enrich lines
    const enrichedLines = await this.enrichLines(request.lines);

    // 3. Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of enrichedLines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }

    // 4. CRITICAL: Validate debit = credit
    const difference = Math.abs(totalDebit - totalCredit);
    const tolerance = 0.01; // 1 halala tolerance for rounding

    if (difference > tolerance) {
      throw new FinanceError(
        FinanceErrorCode.ACC_001,
        `Entry does not balance. Debit: ${totalDebit}, Credit: ${totalCredit}, Difference: ${difference}`
      );
    }

    // 5. Apply rounding adjustment if within tolerance
    if (difference > 0 && difference <= tolerance) {
      const roundingAccount = await this.getSystemAccount(SystemAccountType.ROUNDING);
      if (totalDebit > totalCredit) {
        enrichedLines.push({
          lineNumber: enrichedLines.length + 1,
          accountId: roundingAccount._id.toString(),
          accountCode: roundingAccount.accountCode,
          accountName: roundingAccount.accountName,
          debit: 0,
          credit: difference,
          debitBase: 0,
          creditBase: difference,
          memo: 'Rounding adjustment',
        });
        totalCredit += difference;
      } else {
        enrichedLines.push({
          lineNumber: enrichedLines.length + 1,
          accountId: roundingAccount._id.toString(),
          accountCode: roundingAccount.accountCode,
          accountName: roundingAccount.accountName,
          debit: difference,
          credit: 0,
          debitBase: difference,
          creditBase: 0,
          memo: 'Rounding adjustment',
        });
        totalDebit += difference;
      }
    }

    // 6. Get next sequence number
    const entryNumber = await DocumentSequenceService.getNext(DocumentType.JOURNAL_ENTRY);

    // 7. Create entry
    const entry = new JournalEntry({
      entryNumber: entryNumber.number,
      entryType: request.entryType,
      status: JournalEntryStatus.DRAFT,
      entryDate: request.entryDate,
      period: period.code,
      currency: request.currency || 'SAR',
      exchangeRate: request.exchangeRate || 1,
      baseCurrency: 'SAR',
      reference: request.reference,
      memo: request.memo,
      lines: enrichedLines,
      totalDebit,
      totalCredit,
      totalDebitBase: totalDebit * (request.exchangeRate || 1),
      totalCreditBase: totalCredit * (request.exchangeRate || 1),
      sourceDocument: request.sourceDocument,
      autoReverse: request.autoReverse || false,
      autoReverseDate: request.autoReverseDate,
      isRecurring: false,
      requiresApproval: await this.checkApprovalRequired(totalDebit, request.entryType),
    });

    if (session) {
      await entry.save({ session });
    } else {
      await entry.save();
    }

    return entry;
  }

  /**
   * Post entry to GL (finalize)
   */
  static async post(
    entryId: string,
    userId: string
  ): Promise<IJournalEntry> {
    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      throw new FinanceError(FinanceErrorCode.ACC_006, 'Entry not found');
    }

    if (entry.status !== JournalEntryStatus.DRAFT &&
        entry.status !== JournalEntryStatus.PENDING_APPROVAL) {
      throw new FinanceError(
        FinanceErrorCode.ACC_006,
        `Cannot post entry in status: ${entry.status}`
      );
    }

    // Validate period still open
    await this.validatePeriod(entry.entryDate);

    // Re-validate balance (paranoid check)
    const diff = Math.abs(entry.totalDebit - entry.totalCredit);
    if (diff > 0.01) {
      throw new FinanceError(FinanceErrorCode.ACC_001, 'Entry does not balance');
    }

    // Update account balances
    await this.updateAccountBalances(entry, 'add');

    entry.status = JournalEntryStatus.POSTED;
    entry.postingDate = new Date();
    entry.postedBy = userId;
    entry.isLocked = true;

    await entry.save();

    // Create auto-reversal if configured
    if (entry.autoReverse && entry.autoReverseDate) {
      await this.scheduleAutoReversal(entry);
    }

    return entry;
  }

  /**
   * Reverse a posted entry
   */
  static async reverse(
    entryId: string,
    reversalDate: Date,
    reason: string,
    userId: string
  ): Promise<IJournalEntry> {
    const original = await JournalEntry.findById(entryId);
    if (!original) {
      throw new FinanceError(FinanceErrorCode.ACC_006, 'Entry not found');
    }

    if (original.status !== JournalEntryStatus.POSTED) {
      throw new FinanceError(
        FinanceErrorCode.ACC_006,
        'Can only reverse posted entries'
      );
    }

    if (original.reversedEntryId) {
      throw new FinanceError(
        FinanceErrorCode.ACC_006,
        'Entry already reversed'
      );
    }

    // Validate reversal period
    await this.validatePeriod(reversalDate);

    // Create reversal entry (swap debits and credits)
    const reversalLines = original.lines.map((line, index) => ({
      lineNumber: index + 1,
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountName: line.accountName,
      debit: line.credit,           // Swap
      credit: line.debit,           // Swap
      debitBase: line.creditBase,
      creditBase: line.debitBase,
      partyType: line.partyType,
      partyId: line.partyId,
      partyName: line.partyName,
      costCenterId: line.costCenterId,
      projectId: line.projectId,
      caseId: line.caseId,
      memo: `Reversal: ${line.memo || ''}`,
    }));

    const reversalEntry = await this.create({
      entryType: JournalEntryType.REVERSING,
      entryDate: reversalDate,
      reference: `REV-${original.entryNumber}`,
      memo: `Reversal of ${original.entryNumber}: ${reason}`,
      currency: original.currency,
      exchangeRate: original.exchangeRate,
      lines: reversalLines,
      sourceDocument: {
        type: 'journal_entry',
        id: original._id.toString(),
        number: original.entryNumber,
      },
    });

    // Link entries
    reversalEntry.isReversing = true;
    reversalEntry.originalEntryId = original._id.toString();
    await reversalEntry.save();

    original.status = JournalEntryStatus.REVERSED;
    original.reversedEntryId = reversalEntry._id.toString();
    original.reversalDate = reversalDate;
    await original.save();

    // Post the reversal
    await this.post(reversalEntry._id.toString(), userId);

    return reversalEntry;
  }

  /**
   * Update account running balances
   */
  private static async updateAccountBalances(
    entry: IJournalEntry,
    operation: 'add' | 'subtract'
  ): Promise<void> {
    const multiplier = operation === 'add' ? 1 : -1;

    for (const line of entry.lines) {
      const account = await Account.findById(line.accountId);
      if (!account) continue;

      // For debit-normal accounts: debits increase, credits decrease
      // For credit-normal accounts: credits increase, debits decrease
      let balanceChange: number;
      if (account.normalBalance === 'debit') {
        balanceChange = (line.debitBase - line.creditBase) * multiplier;
      } else {
        balanceChange = (line.creditBase - line.debitBase) * multiplier;
      }

      // Update period balance
      await AccountBalance.findOneAndUpdate(
        {
          accountId: line.accountId,
          period: entry.period,
          partyId: line.partyId || null,
        },
        {
          $inc: {
            debit: line.debitBase * multiplier,
            credit: line.creditBase * multiplier,
            balance: balanceChange,
          },
        },
        { upsert: true }
      );
    }
  }

  private static async enrichLines(
    lines: CreateJournalEntryRequest['lines']
  ): Promise<IJournalEntryLine[]> {
    return Promise.all(
      lines.map(async (line, index) => {
        const account = await Account.findById(line.accountId);
        if (!account) {
          throw new FinanceError(
            FinanceErrorCode.ACC_004,
            `Account ${line.accountId} not found`
          );
        }

        if (!account.isActive) {
          throw new FinanceError(
            FinanceErrorCode.ACC_004,
            `Account ${account.accountCode} is inactive`
          );
        }

        if (account.isGroup) {
          throw new FinanceError(
            FinanceErrorCode.ACC_002,
            `Cannot post to group account ${account.accountCode}`
          );
        }

        // Validate party required
        if (account.requiresParty && !line.partyId) {
          throw new FinanceError(
            FinanceErrorCode.ACC_005,
            `Account ${account.accountCode} requires a party`
          );
        }

        return {
          lineNumber: index + 1,
          accountId: line.accountId,
          accountCode: account.accountCode,
          accountName: account.accountName,
          debit: line.debit || 0,
          credit: line.credit || 0,
          debitBase: line.debit || 0, // Will be multiplied by exchange rate
          creditBase: line.credit || 0,
          partyType: line.partyType as any,
          partyId: line.partyId,
          costCenterId: line.costCenterId,
          projectId: line.projectId,
          caseId: line.caseId,
          memo: line.memo,
        };
      })
    );
  }

  private static async validatePeriod(date: Date): Promise<IFiscalPeriod> {
    const periodCode = format(date, 'yyyy-MM');
    const period = await FiscalPeriod.findOne({ code: periodCode });

    if (!period) {
      throw new FinanceError(
        FinanceErrorCode.ACC_003,
        `Fiscal period ${periodCode} not found`
      );
    }

    if (period.status === FiscalPeriodStatus.HARD_CLOSE ||
        period.status === FiscalPeriodStatus.ARCHIVED) {
      throw new FinanceError(
        FinanceErrorCode.ACC_003,
        `Fiscal period ${periodCode} is closed`
      );
    }

    return period;
  }

  private static async getSystemAccount(type: SystemAccountType): Promise<IAccount> {
    const account = await Account.findOne({ systemAccountType: type, isActive: true });
    if (!account) {
      throw new FinanceError(
        FinanceErrorCode.ACC_005,
        `System account ${type} not configured`
      );
    }
    return account;
  }

  private static async checkApprovalRequired(
    amount: number,
    entryType: JournalEntryType
  ): Promise<boolean> {
    // Manual entries over threshold require approval
    if (entryType === JournalEntryType.GENERAL && amount > 10000) {
      return true;
    }
    // Adjusting entries always require approval
    if (entryType === JournalEntryType.ADJUSTMENT) {
      return true;
    }
    return false;
  }
}
```

---

## 4.4 Automatic GL Posting from Documents

```typescript
// backend/src/services/gl-posting.service.ts

export class GLPostingService {
  /**
   * Create GL entries for invoice
   */
  static async postInvoice(invoice: IInvoice): Promise<IJournalEntry> {
    const lines: CreateJournalEntryRequest['lines'] = [];

    // 1. Debit: Accounts Receivable
    const arAccount = await this.getSystemAccount(SystemAccountType.ACCOUNTS_RECEIVABLE);
    lines.push({
      accountId: arAccount._id.toString(),
      debit: invoice.grandTotal,
      partyType: 'customer',
      partyId: invoice.customerId,
      memo: `Invoice ${invoice.invoiceNumber}`,
    });

    // 2. Credit: Revenue (per line item, grouped by account)
    const revenueByAccount = new Map<string, number>();
    for (const line of invoice.lineItems) {
      const accountId = line.revenueAccountId || (await this.getSystemAccount(SystemAccountType.SALES_REVENUE))._id.toString();
      revenueByAccount.set(
        accountId,
        (revenueByAccount.get(accountId) || 0) + line.netAmount
      );
    }

    for (const [accountId, amount] of revenueByAccount) {
      lines.push({
        accountId,
        credit: amount,
        memo: `Revenue - Invoice ${invoice.invoiceNumber}`,
      });
    }

    // 3. Credit: VAT Output (per tax code)
    for (const taxLine of invoice.taxBreakdown) {
      const vatAccount = await this.getSystemAccount(SystemAccountType.VAT_OUTPUT);
      lines.push({
        accountId: vatAccount._id.toString(),
        credit: taxLine.taxAmount,
        memo: `VAT ${taxLine.taxRate * 100}% - Invoice ${invoice.invoiceNumber}`,
      });
    }

    // 4. Handle discounts if any
    if (invoice.documentDiscountTotal > 0) {
      const discountAccount = await this.getSystemAccount(SystemAccountType.DISCOUNT_GIVEN);
      lines.push({
        accountId: discountAccount._id.toString(),
        debit: invoice.documentDiscountTotal,
        memo: `Discount - Invoice ${invoice.invoiceNumber}`,
      });
      // Reduce AR by discount
      lines[0].debit! -= invoice.documentDiscountTotal;
    }

    return JournalEntryService.create({
      entryType: JournalEntryType.SALES,
      entryDate: invoice.invoiceDate,
      reference: invoice.invoiceNumber,
      memo: `Sales Invoice to ${invoice.customerName}`,
      currency: invoice.currency,
      exchangeRate: invoice.exchangeRate,
      lines,
      sourceDocument: {
        type: 'invoice',
        id: invoice._id.toString(),
        number: invoice.invoiceNumber,
      },
    });
  }

  /**
   * Create GL entries for payment receipt
   */
  static async postPaymentReceipt(payment: IPayment): Promise<IJournalEntry> {
    const lines: CreateJournalEntryRequest['lines'] = [];

    // 1. Debit: Bank/Cash
    const bankAccount = payment.bankAccountId
      ? await Account.findById(payment.bankAccountId)
      : await this.getSystemAccount(SystemAccountType.CASH);

    lines.push({
      accountId: bankAccount!._id.toString(),
      debit: payment.netAmount,
      memo: `Payment ${payment.paymentNumber}`,
    });

    // 2. Debit: Bank Charges (if any)
    if (payment.bankCharges > 0) {
      const bankChargesAccount = await Account.findOne({ accountCode: '5910' });
      lines.push({
        accountId: bankChargesAccount!._id.toString(),
        debit: payment.bankCharges,
        memo: 'Bank charges',
      });
    }

    // 3. Credit: Accounts Receivable (for allocated amounts)
    if (payment.totalAllocated > 0) {
      const arAccount = await this.getSystemAccount(SystemAccountType.ACCOUNTS_RECEIVABLE);
      lines.push({
        accountId: arAccount._id.toString(),
        credit: payment.totalAllocated,
        partyType: 'customer',
        partyId: payment.partyId,
        memo: `Payment allocation ${payment.paymentNumber}`,
      });
    }

    // 4. Credit: Unearned Revenue (for unallocated/advance)
    if (payment.unallocatedAmount > 0) {
      const unearnedAccount = await this.getSystemAccount(SystemAccountType.UNEARNED_REVENUE);
      lines.push({
        accountId: unearnedAccount._id.toString(),
        credit: payment.unallocatedAmount,
        partyType: 'customer',
        partyId: payment.partyId,
        memo: `Advance payment ${payment.paymentNumber}`,
      });
    }

    // 5. Exchange Gain/Loss (if multi-currency)
    const totalExchangeGainLoss = payment.allocations.reduce(
      (sum, a) => sum + (a.exchangeGainLoss || 0), 0
    );
    if (totalExchangeGainLoss !== 0) {
      const fxAccount = await this.getSystemAccount(SystemAccountType.EXCHANGE_GAIN_LOSS);
      if (totalExchangeGainLoss > 0) {
        lines.push({
          accountId: fxAccount._id.toString(),
          credit: totalExchangeGainLoss,
          memo: 'Exchange gain',
        });
      } else {
        lines.push({
          accountId: fxAccount._id.toString(),
          debit: Math.abs(totalExchangeGainLoss),
          memo: 'Exchange loss',
        });
      }
    }

    return JournalEntryService.create({
      entryType: JournalEntryType.RECEIPT,
      entryDate: payment.paymentDate,
      reference: payment.paymentNumber,
      memo: `Payment from ${payment.partyName}`,
      currency: payment.currency,
      exchangeRate: payment.exchangeRate,
      lines,
      sourceDocument: {
        type: 'payment',
        id: payment._id.toString(),
        number: payment.paymentNumber,
      },
    });
  }

  private static async getSystemAccount(type: SystemAccountType): Promise<IAccount> {
    const account = await Account.findOne({ systemAccountType: type, isActive: true });
    if (!account) {
      throw new FinanceError(FinanceErrorCode.ACC_005, `System account ${type} not configured`);
    }
    return account;
  }
}
```

---

## 4.5 Journal Entry API Contracts

```typescript
// POST /api/v1/journal-entries
interface CreateJournalEntryApiRequest {
  entryType: JournalEntryType;
  entryDate: string;               // ISO date
  reference: string;
  memo: string;
  currency?: string;
  exchangeRate?: number;

  lines: Array<{
    accountId: string;
    debit?: number;                // In smallest currency unit
    credit?: number;
    partyType?: 'customer' | 'vendor' | 'employee';
    partyId?: string;
    costCenterId?: string;
    projectId?: string;
    caseId?: string;
    memo?: string;
  }>;

  autoReverse?: boolean;
  autoReverseDate?: string;
}

// POST /api/v1/journal-entries/:id/post
interface PostJournalEntryResponse {
  success: true;
  data: {
    entry: IJournalEntry;
    accountBalances: Array<{
      accountCode: string;
      accountName: string;
      previousBalance: number;
      newBalance: number;
    }>;
  };
}

// POST /api/v1/journal-entries/:id/reverse
interface ReverseJournalEntryRequest {
  reversalDate: string;
  reason: string;
}

// GET /api/v1/accounts/:id/ledger
interface AccountLedgerRequest {
  accountId: string;
  dateFrom?: string;
  dateTo?: string;
  partyId?: string;
}

interface AccountLedgerResponse {
  success: true;
  data: {
    account: IAccount;
    openingBalance: number;
    entries: Array<{
      date: Date;
      entryNumber: string;
      reference: string;
      memo: string;
      debit: number;
      credit: number;
      balance: number;
      partyName?: string;
    }>;
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
  };
}
```

---

# PART 5: MULTI-CURRENCY SUPPORT {#part-5-multi-currency}

## 5.1 Currency Management Schema

### Why This Matters
**Problems from Audit:**
- No exchange rate table
- No realized vs unrealized gain/loss
- Payment in different currency than invoice not handled
- No currency revaluation for period-end

```typescript
// backend/src/models/currency.model.ts

export interface ICurrency extends Document {
  code: string;                    // ISO 4217: 'USD', 'EUR', 'GBP'
  name: string;                    // 'US Dollar'
  nameAr: string;                  // 'دولار أمريكي'
  symbol: string;                  // '$'
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;           // 2 for most, 0 for JPY, 3 for KWD
  decimalSeparator: string;        // '.'
  thousandsSeparator: string;      // ','

  // Rounding
  roundingMode: RoundingMode;
  smallestUnit: number;            // 0.01 for SAR, 0.001 for KWD

  // Status
  isActive: boolean;
  isBaseCurrency: boolean;         // Only one can be true (SAR)

  // Exchange rate defaults
  defaultRateType: ExchangeRateType;

  createdAt: Date;
  updatedAt: Date;
}

export interface IExchangeRate extends Document {
  // Currency pair
  fromCurrency: string;            // 'USD'
  toCurrency: string;              // 'SAR'

  // Rate
  rate: number;                    // e.g., 3.75 (1 USD = 3.75 SAR)
  inverseRate: number;             // e.g., 0.2667 (1 SAR = 0.2667 USD)

  // Type
  rateType: ExchangeRateType;      // spot, buy, sell, average

  // Validity
  effectiveDate: Date;             // Start date
  expiryDate?: Date;               // End date (null = current)

  // Source
  source: ExchangeRateSource;
  sourceReference?: string;        // External reference

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

// Pre-seeded currencies for Saudi market
export const DEFAULT_CURRENCIES = [
  { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: '﷼', decimalPlaces: 2, isBaseCurrency: true },
  { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', nameAr: 'يورو', symbol: '€', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£', decimalPlaces: 2 },
  { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', decimalPlaces: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'د.ك', decimalPlaces: 3 },
  { code: 'BHD', name: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'د.ب', decimalPlaces: 3 },
  { code: 'QAR', name: 'Qatari Riyal', nameAr: 'ريال قطري', symbol: 'ر.ق', decimalPlaces: 2 },
  { code: 'OMR', name: 'Omani Rial', nameAr: 'ريال عماني', symbol: 'ر.ع', decimalPlaces: 3 },
  { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م', decimalPlaces: 2 },
  { code: 'JOD', name: 'Jordanian Dinar', nameAr: 'دينار أردني', symbol: 'د.أ', decimalPlaces: 3 },
];
```

---

## 5.2 Exchange Rate Service

```typescript
// backend/src/services/exchange-rate.service.ts

export class ExchangeRateService {
  /**
   * Get exchange rate for a specific date
   * Falls back to most recent rate if exact date not found
   */
  static async getRate(
    fromCurrency: string,
    toCurrency: string,
    date: Date = new Date(),
    rateType: ExchangeRateType = ExchangeRateType.SPOT
  ): Promise<IExchangeRate> {
    // Same currency - rate is 1
    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        rate: 1,
        inverseRate: 1,
        rateType,
        effectiveDate: date,
      } as IExchangeRate;
    }

    // Try direct rate first
    let rate = await ExchangeRate.findOne({
      fromCurrency,
      toCurrency,
      rateType,
      effectiveDate: { $lte: date },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: date } },
      ],
    }).sort({ effectiveDate: -1 });

    if (rate) return rate;

    // Try inverse rate
    rate = await ExchangeRate.findOne({
      fromCurrency: toCurrency,
      toCurrency: fromCurrency,
      rateType,
      effectiveDate: { $lte: date },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: date } },
      ],
    }).sort({ effectiveDate: -1 });

    if (rate) {
      // Return inverted
      return {
        fromCurrency,
        toCurrency,
        rate: rate.inverseRate,
        inverseRate: rate.rate,
        rateType,
        effectiveDate: rate.effectiveDate,
      } as IExchangeRate;
    }

    // Try triangulation through base currency (SAR)
    if (fromCurrency !== 'SAR' && toCurrency !== 'SAR') {
      const fromToBase = await this.getRate(fromCurrency, 'SAR', date, rateType);
      const baseToTarget = await this.getRate('SAR', toCurrency, date, rateType);

      if (fromToBase && baseToTarget) {
        const triangulatedRate = fromToBase.rate * baseToTarget.rate;
        return {
          fromCurrency,
          toCurrency,
          rate: triangulatedRate,
          inverseRate: 1 / triangulatedRate,
          rateType,
          effectiveDate: date,
          source: ExchangeRateSource.MANUAL,
        } as IExchangeRate;
      }
    }

    throw new FinanceError(
      FinanceErrorCode.CUR_001,
      `Exchange rate not found for ${fromCurrency}/${toCurrency} on ${date.toISOString().split('T')[0]}`
    );
  }

  /**
   * Convert amount between currencies
   */
  static async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: Date = new Date(),
    rateType: ExchangeRateType = ExchangeRateType.SPOT
  ): Promise<{ amount: number; rate: number; rateDate: Date }> {
    const exchangeRate = await this.getRate(fromCurrency, toCurrency, date, rateType);

    const toCurrencyConfig = await Currency.findOne({ code: toCurrency });
    const decimalPlaces = toCurrencyConfig?.decimalPlaces || 2;

    const convertedAmount = new Decimal(amount)
      .times(exchangeRate.rate)
      .toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
      .toNumber();

    return {
      amount: convertedAmount,
      rate: exchangeRate.rate,
      rateDate: exchangeRate.effectiveDate,
    };
  }

  /**
   * Create or update exchange rate
   */
  static async setRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    rateType: ExchangeRateType,
    effectiveDate: Date,
    source: ExchangeRateSource = ExchangeRateSource.MANUAL,
    userId: string
  ): Promise<IExchangeRate> {
    // Validate currencies exist
    const [from, to] = await Promise.all([
      Currency.findOne({ code: fromCurrency, isActive: true }),
      Currency.findOne({ code: toCurrency, isActive: true }),
    ]);

    if (!from) throw new FinanceError(FinanceErrorCode.CUR_002, `Invalid currency: ${fromCurrency}`);
    if (!to) throw new FinanceError(FinanceErrorCode.CUR_002, `Invalid currency: ${toCurrency}`);

    // Expire previous rate
    await ExchangeRate.updateMany(
      {
        fromCurrency,
        toCurrency,
        rateType,
        expiryDate: null,
      },
      {
        expiryDate: new Date(effectiveDate.getTime() - 1),
      }
    );

    // Create new rate
    const exchangeRate = new ExchangeRate({
      fromCurrency,
      toCurrency,
      rate,
      inverseRate: 1 / rate,
      rateType,
      effectiveDate,
      source,
      createdBy: userId,
    });

    await exchangeRate.save();
    return exchangeRate;
  }
}
```

---

## 5.3 Realized vs Unrealized Gain/Loss

```typescript
// backend/src/services/exchange-gain-loss.service.ts

export interface ExchangeGainLossResult {
  transactionId: string;
  transactionType: 'payment' | 'revaluation';
  originalCurrency: string;
  originalAmount: number;
  originalRate: number;
  settlementRate: number;
  gainLossAmount: number;          // In base currency (SAR)
  isGain: boolean;
  journalEntryId?: string;
}

export class ExchangeGainLossService {
  /**
   * Calculate realized gain/loss when payment settles invoice
   */
  static calculateRealizedGainLoss(
    invoiceAmount: number,           // Amount in foreign currency
    invoiceRate: number,             // Rate at invoice date
    paymentRate: number              // Rate at payment date
  ): number {
    const invoiceBase = new Decimal(invoiceAmount).times(invoiceRate);
    const paymentBase = new Decimal(invoiceAmount).times(paymentRate);
    return paymentBase.minus(invoiceBase).toNumber();
  }

  /**
   * Period-end revaluation of open foreign currency balances
   */
  static async revalueOpenBalances(
    periodEndDate: Date,
    userId: string
  ): Promise<ExchangeGainLossResult[]> {
    const results: ExchangeGainLossResult[] = [];
    const foreignBalances = await this.getForeignCurrencyBalances(periodEndDate);

    for (const balance of foreignBalances) {
      if (balance.currency === 'SAR') continue;

      const periodEndRate = await ExchangeRateService.getRate(
        balance.currency,
        'SAR',
        periodEndDate,
        ExchangeRateType.CLOSING
      );

      const currentBaseValue = new Decimal(balance.amount).times(periodEndRate.rate);
      const bookedBaseValue = new Decimal(balance.amountBase);
      const unrealizedGainLoss = currentBaseValue.minus(bookedBaseValue).toNumber();

      if (Math.abs(unrealizedGainLoss) < 0.01) continue;

      const entry = await this.createRevaluationEntry(
        balance,
        unrealizedGainLoss,
        periodEndDate,
        periodEndRate.rate,
        userId
      );

      results.push({
        transactionId: balance.accountId,
        transactionType: 'revaluation',
        originalCurrency: balance.currency,
        originalAmount: balance.amount,
        originalRate: balance.amountBase / balance.amount,
        settlementRate: periodEndRate.rate,
        gainLossAmount: unrealizedGainLoss,
        isGain: unrealizedGainLoss > 0,
        journalEntryId: entry._id.toString(),
      });
    }

    return results;
  }

  private static async getForeignCurrencyBalances(asOfDate: Date) {
    return JournalEntryLine.aggregate([
      {
        $lookup: {
          from: 'journalentries',
          localField: 'journalEntryId',
          foreignField: '_id',
          as: 'entry',
        },
      },
      { $unwind: '$entry' },
      {
        $match: {
          'entry.status': 'posted',
          'entry.entryDate': { $lte: asOfDate },
          'entry.currency': { $ne: 'SAR' },
        },
      },
      {
        $group: {
          _id: { accountId: '$accountId', currency: '$entry.currency' },
          amount: { $sum: { $subtract: ['$debit', '$credit'] } },
          amountBase: { $sum: { $subtract: ['$debitBase', '$creditBase'] } },
        },
      },
      { $match: { amount: { $ne: 0 } } },
    ]);
  }

  private static async createRevaluationEntry(
    balance: any,
    gainLossAmount: number,
    date: Date,
    newRate: number,
    userId: string
  ): Promise<IJournalEntry> {
    const fxAccount = await Account.findOne({
      systemAccountType: SystemAccountType.EXCHANGE_GAIN_LOSS,
    });

    const lines: any[] = gainLossAmount > 0
      ? [
          { accountId: balance.accountId, debit: gainLossAmount, memo: 'FX Revaluation' },
          { accountId: fxAccount!._id.toString(), credit: gainLossAmount, memo: 'Unrealized FX Gain' }
        ]
      : [
          { accountId: balance.accountId, credit: Math.abs(gainLossAmount), memo: 'FX Revaluation' },
          { accountId: fxAccount!._id.toString(), debit: Math.abs(gainLossAmount), memo: 'Unrealized FX Loss' }
        ];

    return JournalEntryService.create({
      entryType: JournalEntryType.REVALUATION,
      entryDate: date,
      reference: `REVAL-${date.toISOString().split('T')[0]}`,
      memo: `Currency revaluation for ${balance.currency} balance`,
      lines,
      autoReverse: true,
      autoReverseDate: new Date(date.getTime() + 86400000),
    });
  }
}
```

---

## 5.4 Multi-Currency API Contracts

```typescript
// GET /api/v1/currencies
interface ListCurrenciesResponse {
  success: true;
  data: {
    currencies: ICurrency[];
    baseCurrency: ICurrency;
  };
}

// POST /api/v1/exchange-rates
interface CreateExchangeRateRequest {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateType: ExchangeRateType;
  effectiveDate: string;
}

// GET /api/v1/exchange-rates/convert
interface ConvertCurrencyRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  date?: string;
  rateType?: ExchangeRateType;
}

interface ConvertCurrencyResponse {
  success: true;
  data: {
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    targetCurrency: string;
    rate: number;
    rateDate: string;
  };
}

// POST /api/v1/exchange-rates/revalue
interface RevaluationRequest {
  periodEndDate: string;
  preview?: boolean;
}

interface RevaluationResponse {
  success: true;
  data: {
    results: ExchangeGainLossResult[];
    summary: {
      totalGain: number;
      totalLoss: number;
      netGainLoss: number;
      accountsRevalued: number;
    };
  };
}
```

---

*Part 5 Complete. Continue to Part 6 (Tax & ZATCA)?*
