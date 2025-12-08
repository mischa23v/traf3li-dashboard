/**
 * Advanced Finance Types
 * Type definitions for bank reconciliation, multi-currency, and related features
 */

// ═══════════════════════════════════════════════════════════════
// BANK FEED TYPES
// ═══════════════════════════════════════════════════════════════

export type BankFeedProvider = 'plaid' | 'yodlee' | 'manual'
export type BankFeedStatus = 'active' | 'error' | 'disconnected' | 'pending'
export type SyncFrequency = 'realtime' | 'daily' | 'weekly' | 'manual'

export interface BankFeed {
  _id: string
  firmId: string
  bankAccountId: string
  accountName: string
  accountNumber: string
  bankName: string
  provider: BankFeedProvider
  credentials?: {
    accessToken: string
    itemId: string
  }
  status: BankFeedStatus
  lastSync?: Date
  syncFrequency: SyncFrequency
  balance?: number
  currency: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateBankFeedData {
  bankAccountId?: string
  accountName: string
  accountNumber: string
  bankName: string
  provider: BankFeedProvider
  syncFrequency: SyncFrequency
  currency: string
  plaidAccessToken?: string
  plaidItemId?: string
}

export interface BankFeedFilters {
  status?: BankFeedStatus
  provider?: BankFeedProvider
  bankName?: string
}

// ═══════════════════════════════════════════════════════════════
// BANK TRANSACTION TYPES
// ═══════════════════════════════════════════════════════════════

export type TransactionType = 'credit' | 'debit'
export type MatchStatus = 'unmatched' | 'suggested' | 'matched' | 'excluded'

export interface BankTransaction {
  _id: string
  firmId: string
  bankFeedId: string
  externalId?: string
  date: Date
  description: string
  amount: number
  type: TransactionType
  reference?: string
  category?: string
  matchStatus: MatchStatus
  matchedTo?: {
    type: 'invoice' | 'expense' | 'payment' | 'transfer' | 'journal_entry'
    id: string
    confidence?: number
  }
  importedAt: Date
}

export interface BankTransactionFilters {
  bankFeedId?: string
  matchStatus?: MatchStatus
  type?: TransactionType
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  search?: string
}

// ═══════════════════════════════════════════════════════════════
// MATCHING TYPES
// ═══════════════════════════════════════════════════════════════

export type MatchMethod = 'auto' | 'rule' | 'manual' | 'ai'
export type MatchedEntityType = 'invoice' | 'expense' | 'payment' | 'transfer' | 'journal_entry'

export interface BankTransactionMatch {
  _id: string
  firmId: string
  bankTransactionId: string
  matchedType: MatchedEntityType
  matchedId: string
  matchedDescription?: string
  matchMethod: MatchMethod
  confidence: number
  status: 'suggested' | 'confirmed' | 'rejected'
  matchedBy?: string
  matchedAt: Date
}

export interface MatchSuggestion {
  transactionId: string
  suggestions: Array<{
    type: MatchedEntityType
    id: string
    description: string
    amount: number
    date: Date
    confidence: number
    reason: string
  }>
}

export interface CreateMatchData {
  bankTransactionId: string
  matchedType: MatchedEntityType
  matchedId: string
}

// ═══════════════════════════════════════════════════════════════
// MATCHING RULE TYPES
// ═══════════════════════════════════════════════════════════════

export type RuleConditionField = 'description' | 'amount' | 'reference' | 'category'
export type RuleConditionOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between'
export type RuleActionType = 'match_to_account' | 'categorize' | 'exclude' | 'create_expense'

export interface RuleCondition {
  field: RuleConditionField
  operator: RuleConditionOperator
  value: string | number
  value2?: number // For 'between' operator
}

export interface RuleAction {
  type: RuleActionType
  accountId?: string
  category?: string
  expenseCategory?: string
}

export interface MatchingRule {
  _id: string
  firmId: string
  name: string
  description?: string
  conditions: RuleCondition[]
  matchAll: boolean // AND vs OR
  action: RuleAction
  priority: number
  isActive: boolean
  matchCount: number
  lastMatchedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateMatchingRuleData {
  name: string
  description?: string
  conditions: RuleCondition[]
  matchAll: boolean
  action: RuleAction
  priority?: number
}

// ═══════════════════════════════════════════════════════════════
// RECONCILIATION REPORT TYPES
// ═══════════════════════════════════════════════════════════════

export interface ReconciliationReport {
  bankFeedId: string
  bankName: string
  accountName: string
  period: {
    start: Date
    end: Date
  }
  bankBalance: {
    opening: number
    closing: number
  }
  bookBalance: {
    opening: number
    closing: number
  }
  reconciliationStatus: {
    matched: number
    unmatched: number
    excluded: number
    variance: number
  }
  unmatchedTransactions: BankTransaction[]
  outstandingItems: Array<{
    type: 'check' | 'deposit' | 'payment'
    description: string
    amount: number
    date: Date
  }>
}

// ═══════════════════════════════════════════════════════════════
// IMPORT TYPES
// ═══════════════════════════════════════════════════════════════

export interface CSVColumnMapping {
  dateColumn: string
  descriptionColumn: string
  amountColumn: string
  referenceColumn?: string
  typeColumn?: string
}

export interface ImportResult {
  success: boolean
  imported: number
  duplicates: number
  errors: number
  errorDetails?: string[]
}

// ═══════════════════════════════════════════════════════════════
// MULTI-CURRENCY TYPES
// ═══════════════════════════════════════════════════════════════

export type RateSource = 'manual' | 'api' | 'ecb' | 'openexchange'

export interface ExchangeRate {
  _id: string
  firmId: string
  fromCurrency: string
  toCurrency: string
  rate: number
  inverseRate: number
  source: RateSource
  effectiveDate: Date
  createdAt: Date
}

export interface ExchangeRateHistory {
  date: Date
  rate: number
  source: RateSource
}

export interface CurrencyConversion {
  fromAmount: number
  fromCurrency: string
  toAmount: number
  toCurrency: string
  rate: number
  rateDate: Date
}

export interface CurrencySettings {
  firmId: string
  baseCurrency: string
  supportedCurrencies: string[]
  autoUpdateRates: boolean
  updateFrequency: 'hourly' | 'daily' | 'weekly'
  rateSource: RateSource
  updatedAt: Date
}

export interface ConvertCurrencyData {
  amount: number
  fromCurrency: string
  toCurrency: string
  date?: string // For historical rate
}

// Common currency codes
export const CURRENCY_CODES = [
  'SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'BHD', 'OMR',
  'EGP', 'JOD', 'LBP', 'INR', 'PKR', 'PHP', 'BDT', 'CNY', 'JPY'
] as const

export type CurrencyCode = typeof CURRENCY_CODES[number]
