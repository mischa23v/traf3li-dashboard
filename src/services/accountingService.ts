/**
 * Accounting Service
 * Handles all accounting-related API calls (accounts, GL entries, journal entries, etc.)
 *
 * PHILOSOPHY: Hide Complexity, Keep Power
 * - User sees: Simple financial tracking (Invoices, Payments, Expenses)
 * - System does: Full double-entry accounting behind the scenes
 * - No scary terms: No "Debit", "Credit", "Journal Entry", "Chart of Accounts"
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== ACCOUNTS (Chart of Accounts) ====================

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export type AccountSubType =
  | 'current_asset' | 'fixed_asset' | 'bank' | 'cash' | 'receivable'
  | 'current_liability' | 'long_term_liability' | 'payable'
  | 'operating_income' | 'other_income'
  | 'operating_expense' | 'administrative' | 'cost_of_sales'

export interface Account {
  _id: string
  code: string
  name: string
  nameAr: string
  type: AccountType
  subType: AccountSubType
  parentAccountId?: string
  description?: string
  isActive: boolean
  isSystemAccount: boolean
  balance: number
  createdAt: string
  updatedAt: string
}

export interface AccountTypesResponse {
  types: AccountType[]
  subTypes: Record<AccountType, AccountSubType[]>
}

export interface AccountFilters {
  type?: AccountType
  subType?: AccountSubType
  isActive?: boolean
  page?: number
  limit?: number
}

// ==================== GENERAL LEDGER ENTRIES ====================

export type GLReferenceModel = 'Invoice' | 'Payment' | 'Expense' | 'Bill' | 'JournalEntry'

export interface GLEntry {
  _id: string
  entryNumber: string
  transactionDate: string
  description: string
  referenceModel: GLReferenceModel
  referenceId: string
  amount: number
  lines: GLEntryLine[]
  status: 'draft' | 'posted' | 'voided'
  caseId?: { _id: string; caseNumber: string }
  clientId?: { _id: string; firstName: string; lastName: string }
  createdAt: string
  updatedAt: string
}

export interface GLEntryLine {
  accountId: string | Account
  debit: number
  credit: number
  description?: string
}

export interface GLEntryFilters {
  startDate?: string
  endDate?: string
  referenceModel?: GLReferenceModel
  caseId?: string
  clientId?: string
  page?: number
  limit?: number
}

// ==================== JOURNAL ENTRIES (Accountant Only) ====================

export interface JournalEntry {
  _id: string
  entryNumber: string
  transactionDate: string
  description: string
  memo?: string
  lines: JournalEntryLine[]
  status: 'draft' | 'pending' | 'posted' | 'voided'
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  glEntryId?: string
  createdBy: string
  postedBy?: string
  postedAt?: string
  createdAt: string
  updatedAt: string
}

export interface JournalEntryLine {
  accountId: string
  debit: number
  credit: number
  description?: string
  caseId?: string
  clientId?: string
}

export interface CreateJournalEntryData {
  transactionDate: string
  description: string
  memo?: string
  lines: Omit<JournalEntryLine, '_id'>[]
}

export interface SimpleJournalEntryData {
  transactionDate: string
  description: string
  debitAccountId: string
  creditAccountId: string
  amount: number
  caseId?: string
  clientId?: string
}

// ==================== FISCAL PERIODS ====================

export type FiscalPeriodStatus = 'future' | 'open' | 'closed' | 'locked'

export interface FiscalPeriod {
  _id: string
  fiscalYear: number
  periodNumber: number
  name: string
  nameAr: string
  startDate: string
  endDate: string
  status: FiscalPeriodStatus
  openedAt?: string
  closedAt?: string
  lockedAt?: string
  openingBalanceEntryId?: string
  closingBalanceEntryId?: string
  createdAt: string
  updatedAt: string
}

export interface FiscalPeriodBalances {
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  isBalanced: boolean
}

export interface FiscalYearSummary {
  fiscalYear: number
  periods: FiscalPeriod[]
  totalPeriods: number
  openPeriods: number
  closedPeriods: number
}

export interface CanPostResponse {
  canPost: boolean
  period?: FiscalPeriod
  reason?: string
}

// ==================== RECURRING TRANSACTIONS ====================

export type RecurringFrequency =
  | 'daily' | 'weekly' | 'bi_weekly'
  | 'monthly' | 'quarterly' | 'semi_annual' | 'annual'

export type RecurringTransactionType = 'invoice' | 'bill' | 'expense'

export type RecurringStatus = 'active' | 'paused' | 'cancelled' | 'completed'

export interface RecurringTransaction {
  _id: string
  name: string
  transactionType: RecurringTransactionType
  frequency: RecurringFrequency
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  monthOfYear?: number // 1-12 for annual
  startDate: string
  endDate?: string
  nextRunDate: string
  lastRunDate?: string
  timesRun: number
  maxRuns?: number
  status: RecurringStatus
  clientId?: string | { _id: string; firstName: string; lastName: string }
  vendorId?: string | { _id: string; name: string }
  caseId?: string | { _id: string; caseNumber: string }
  items?: Array<{
    description: string
    quantity: number
    unitPrice: number
  }>
  amount?: number
  category?: string
  paymentTerms?: number
  autoSend?: boolean
  autoApprove?: boolean
  notes?: string
  generatedTransactionIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateRecurringTransactionData {
  name: string
  transactionType: RecurringTransactionType
  frequency: RecurringFrequency
  dayOfWeek?: number
  dayOfMonth?: number
  monthOfYear?: number
  startDate: string
  endDate?: string
  maxRuns?: number
  clientId?: string
  vendorId?: string
  caseId?: string
  items?: Array<{
    description: string
    quantity: number
    unitPrice: number
  }>
  amount?: number
  category?: string
  paymentTerms?: number
  autoSend?: boolean
  autoApprove?: boolean
  notes?: string
}

export interface UpcomingRecurringTransaction {
  transaction: RecurringTransaction
  nextRunDate: string
  daysUntilDue: number
}

// ==================== PRICE LEVELS ====================

export type PricingType = 'percentage' | 'fixed' | 'rate_table'

export interface PriceLevel {
  _id: string
  code: string
  name: string
  nameAr: string
  description?: string
  pricingType: PricingType
  percentageAdjustment?: number // Positive for markup, negative for discount
  fixedAdjustment?: number
  rateTable?: Array<{
    serviceType: string
    rate: number
  }>
  minimumRevenue?: number // Minimum lifetime revenue to qualify
  minimumCases?: number // Minimum cases to qualify
  priority: number // Higher priority = checked first
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePriceLevelData {
  code: string
  name: string
  nameAr: string
  description?: string
  pricingType: PricingType
  percentageAdjustment?: number
  fixedAdjustment?: number
  rateTable?: Array<{
    serviceType: string
    rate: number
  }>
  minimumRevenue?: number
  minimumCases?: number
  priority?: number
}

export interface ClientRateResponse {
  baseRate: number
  effectiveRate: number
  priceLevel?: {
    code: string
    name: string
    adjustment: string
  }
}

// ==================== BILLS (Vendor Invoices) ====================

export type BillStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'partial' | 'overdue' | 'cancelled'

export interface Bill {
  _id: string
  billNumber: string
  vendorId: string | { _id: string; name: string; nameAr?: string }
  billDate: string
  dueDate: string
  lines: BillLine[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: BillStatus
  notes?: string
  attachments?: string[]
  glEntryId?: string
  isPostedToGL: boolean
  postedAt?: string
  createdAt: string
  updatedAt: string
}

export interface BillLine {
  description: string
  quantity: number
  unitCost: number
  total: number
  accountId?: string
  caseId?: string | { _id: string; caseNumber: string }
}

export interface CreateBillData {
  vendorId: string
  billDate: string
  dueDate: string
  lines: Omit<BillLine, 'total'>[]
  vatRate?: number
  notes?: string
}

export interface BillFilters {
  status?: BillStatus
  vendorId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ==================== VENDORS ====================

export interface Vendor {
  _id: string
  name: string
  nameAr?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  taxNumber?: string
  bankName?: string
  bankAccountNumber?: string
  iban?: string
  category?: string
  notes?: string
  isActive: boolean
  totalBilled: number
  totalPaid: number
  balance: number // What you owe them
  createdAt: string
  updatedAt: string
}

export interface CreateVendorData {
  name: string
  nameAr?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  taxNumber?: string
  bankName?: string
  bankAccountNumber?: string
  iban?: string
  category?: string
  notes?: string
}

export interface VendorFilters {
  category?: string
  isActive?: boolean
  page?: number
  limit?: number
}

// ==================== RETAINERS (Trust Accounting) ====================

export type RetainerStatus = 'active' | 'exhausted' | 'refunded' | 'closed'

export interface Retainer {
  _id: string
  retainerNumber: string
  clientId: string | { _id: string; firstName: string; lastName: string }
  caseId?: string | { _id: string; caseNumber: string }
  initialAmount: number
  currentBalance: number
  totalDeposits: number
  totalConsumptions: number
  status: RetainerStatus
  minimumBalance?: number
  notes?: string
  glAccountId?: string
  createdAt: string
  updatedAt: string
}

export interface RetainerTransaction {
  _id: string
  retainerId: string
  type: 'deposit' | 'consumption' | 'refund' | 'adjustment'
  amount: number
  balanceAfter: number
  description: string
  paymentMethod?: string
  invoiceId?: string
  caseId?: string
  glEntryId?: string
  createdAt: string
}

export interface CreateRetainerData {
  clientId: string
  caseId?: string
  initialAmount: number
  minimumBalance?: number
  notes?: string
}

export interface RetainerDepositData {
  amount: number
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check'
  notes?: string
}

export interface RetainerConsumeData {
  amount: number
  description: string
  caseId?: string
  invoiceId?: string
}

// ==================== REPORTS ====================

export interface ProfitLossReport {
  period: {
    startDate: string
    endDate: string
  }
  income: {
    total: number
    breakdown: Array<{
      account: string
      accountAr?: string
      amount: number
    }>
  }
  expenses: {
    total: number
    breakdown: Array<{
      account: string
      accountAr?: string
      amount: number
    }>
  }
  netIncome: number
}

export interface BalanceSheetReport {
  asOfDate: string
  assets: {
    total: number
    currentAssets: Array<{ account: string; accountAr?: string; balance: number }>
    fixedAssets: Array<{ account: string; accountAr?: string; balance: number }>
  }
  liabilities: {
    total: number
    currentLiabilities: Array<{ account: string; accountAr?: string; balance: number }>
    longTermLiabilities: Array<{ account: string; accountAr?: string; balance: number }>
  }
  equity: {
    total: number
    breakdown: Array<{ account: string; accountAr?: string; balance: number }>
  }
  isBalanced: boolean
}

export interface TrialBalanceReport {
  asOfDate: string
  accounts: Array<{
    code: string
    name: string
    nameAr?: string
    type: AccountType
    debit: number
    credit: number
  }>
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
}

export interface ARAgingReport {
  summary: {
    current: number
    days1to30: number
    days31to60: number
    days61to90: number
    over90: number
    total: number
  }
  invoices: Array<{
    invoiceNumber: string
    clientName: string
    amount: number
    dueDate: string
    daysOverdue: number
    agingBucket: string
  }>
}

export interface CaseProfitabilityReport {
  cases: Array<{
    caseId: string
    caseNumber: string
    clientName: string
    totalIncome: number
    totalExpenses: number
    profit: number
    profitMargin: number
  }>
  summary: {
    totalCases: number
    totalIncome: number
    totalExpenses: number
    totalProfit: number
    averageMargin: number
  }
}

// ==================== LEADS ====================

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social_media' | 'advertisement' | 'cold_call' | 'walk_in' | 'other'

export interface Lead {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  source: LeadSource
  stage: LeadStage
  estimatedValue?: number
  probability?: number
  expectedCloseDate?: string
  caseType?: string
  description?: string
  notes?: string
  assignedTo?: string | { _id: string; firstName: string; lastName: string }
  activities: LeadActivity[]
  convertedToClientId?: string
  convertedToCaseId?: string
  convertedAt?: string
  lostReason?: string
  createdAt: string
  updatedAt: string
}

export interface LeadActivity {
  _id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  description: string
  date: string
  outcome?: string
  createdBy: string
}

export interface CreateLeadData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  source: LeadSource
  estimatedValue?: number
  expectedCloseDate?: string
  caseType?: string
  description?: string
  notes?: string
  assignedTo?: string
}

export interface LeadFilters {
  stage?: LeadStage
  source?: LeadSource
  assignedTo?: string
  page?: number
  limit?: number
}

export interface LeadStats {
  totalLeads: number
  byStage: Record<LeadStage, number>
  bySource: Record<LeadSource, number>
  conversionRate: number
  averageValue: number
  totalEstimatedValue: number
}

export interface ConvertLeadResult {
  lead: Lead
  client: { _id: string; firstName: string; lastName: string }
  case?: { _id: string; caseNumber: string }
}

// ==================== API METHODS ====================

export const accountingService = {
  // ========== ACCOUNTS ==========

  getAccountTypes: async (): Promise<AccountTypesResponse> => {
    const response = await apiClient.get('/accounts/types')
    return response.data.data
  },

  getAccounts: async (filters?: AccountFilters): Promise<{ accounts: Account[]; total: number }> => {
    const response = await apiClient.get('/accounts', { params: filters })
    return response.data.data
  },

  getAccount: async (id: string): Promise<Account> => {
    const response = await apiClient.get(`/accounts/${id}`)
    return response.data.data
  },

  createAccount: async (data: Partial<Account>): Promise<Account> => {
    const response = await apiClient.post('/accounts', data)
    return response.data.data
  },

  updateAccount: async (id: string, data: Partial<Account>): Promise<Account> => {
    const response = await apiClient.patch(`/accounts/${id}`, data)
    return response.data.data
  },

  deleteAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`)
  },

  // ========== GENERAL LEDGER ==========

  getGLEntries: async (filters?: GLEntryFilters): Promise<{ entries: GLEntry[]; total: number }> => {
    const response = await apiClient.get('/general-ledger/entries', { params: filters })
    // Backend returns { success: true, data: [array of entries], total: X }
    return {
      entries: response.data.data || [],
      total: response.data.total || 0
    }
  },

  getGLEntry: async (id: string): Promise<GLEntry> => {
    const response = await apiClient.get(`/general-ledger/${id}`)
    return response.data.data
  },

  voidGLEntry: async (id: string): Promise<GLEntry> => {
    const response = await apiClient.post(`/general-ledger/${id}/void`)
    return response.data.data
  },

  getAccountBalance: async (accountId: string, startDate?: string, endDate?: string): Promise<{ balance: number; debit: number; credit: number }> => {
    const response = await apiClient.get(`/general-ledger/account-balance/${accountId}`, {
      params: { startDate, endDate }
    })
    return response.data.data
  },

  getGLTrialBalance: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await apiClient.get('/general-ledger/trial-balance', {
      params: { startDate, endDate }
    })
    return response.data.data
  },

  getGLProfitLoss: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await apiClient.get('/general-ledger/profit-loss', {
      params: { startDate, endDate }
    })
    return response.data.data
  },

  getGLBalanceSheet: async (asOfDate?: string): Promise<any> => {
    const response = await apiClient.get('/general-ledger/balance-sheet', {
      params: { asOfDate }
    })
    return response.data.data
  },

  getEntriesByReference: async (model: string, id: string): Promise<GLEntry[]> => {
    const response = await apiClient.get(`/general-ledger/reference/${model}/${id}`)
    return response.data.data
  },

  getGLSummary: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await apiClient.get('/general-ledger/summary', {
      params: { startDate, endDate }
    })
    return response.data.data
  },

  getGLStats: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await apiClient.get('/general-ledger/stats', {
      params: { startDate, endDate }
    })
    return response.data.data
  },

  // ========== JOURNAL ENTRIES ==========

  getJournalEntries: async (filters?: { status?: string; page?: number; limit?: number }): Promise<{ entries: JournalEntry[]; total: number }> => {
    const response = await apiClient.get('/journal-entries', { params: filters })
    return response.data.data
  },

  getJournalEntry: async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.get(`/journal-entries/${id}`)
    return response.data.data
  },

  createJournalEntry: async (data: CreateJournalEntryData): Promise<JournalEntry> => {
    const response = await apiClient.post('/journal-entries', data)
    return response.data.data
  },

  createSimpleJournalEntry: async (data: SimpleJournalEntryData): Promise<JournalEntry> => {
    const response = await apiClient.post('/journal-entries/simple', data)
    return response.data.data
  },

  updateJournalEntry: async (id: string, data: Partial<CreateJournalEntryData>): Promise<JournalEntry> => {
    const response = await apiClient.patch(`/journal-entries/${id}`, data)
    return response.data.data
  },

  postJournalEntry: async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.post(`/journal-entries/${id}/post`)
    return response.data.data
  },

  voidJournalEntry: async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.post(`/journal-entries/${id}/void`)
    return response.data.data
  },

  deleteJournalEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/journal-entries/${id}`)
  },

  // ========== FISCAL PERIODS ==========

  getFiscalPeriods: async (): Promise<FiscalPeriod[]> => {
    const response = await apiClient.get('/fiscal-periods')
    return response.data.data
  },

  getCurrentFiscalPeriod: async (): Promise<FiscalPeriod> => {
    const response = await apiClient.get('/fiscal-periods/current')
    return response.data.data
  },

  canPostToDate: async (date: string): Promise<CanPostResponse> => {
    const response = await apiClient.get('/fiscal-periods/can-post', { params: { date } })
    return response.data.data
  },

  getFiscalYearsSummary: async (): Promise<FiscalYearSummary[]> => {
    const response = await apiClient.get('/fiscal-periods/years-summary')
    return response.data.data
  },

  createFiscalYear: async (fiscalYear: number, startMonth: number): Promise<FiscalPeriod[]> => {
    const response = await apiClient.post('/fiscal-periods/create-year', { fiscalYear, startMonth })
    return response.data.data
  },

  getFiscalPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.get(`/fiscal-periods/${id}`)
    return response.data.data
  },

  getFiscalPeriodBalances: async (id: string): Promise<FiscalPeriodBalances> => {
    const response = await apiClient.get(`/fiscal-periods/${id}/balances`)
    return response.data.data
  },

  openFiscalPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/open`)
    return response.data.data
  },

  closeFiscalPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/close`)
    return response.data.data
  },

  reopenFiscalPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/reopen`)
    return response.data.data
  },

  lockFiscalPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/lock`)
    return response.data.data
  },

  yearEndClosing: async (id: string): Promise<{ period: FiscalPeriod; closingEntry: JournalEntry }> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/year-end-closing`)
    return response.data.data
  },

  // ========== RECURRING TRANSACTIONS ==========

  getRecurringTransactions: async (filters?: { status?: RecurringStatus; transactionType?: RecurringTransactionType }): Promise<RecurringTransaction[]> => {
    const response = await apiClient.get('/recurring-transactions', { params: filters })
    return response.data.data
  },

  getUpcomingRecurring: async (): Promise<UpcomingRecurringTransaction[]> => {
    const response = await apiClient.get('/recurring-transactions/upcoming')
    return response.data.data
  },

  getRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    const response = await apiClient.get(`/recurring-transactions/${id}`)
    return response.data.data
  },

  createRecurringTransaction: async (data: CreateRecurringTransactionData): Promise<RecurringTransaction> => {
    const response = await apiClient.post('/recurring-transactions', data)
    return response.data.data
  },

  updateRecurringTransaction: async (id: string, data: Partial<CreateRecurringTransactionData>): Promise<RecurringTransaction> => {
    const response = await apiClient.put(`/recurring-transactions/${id}`, data)
    return response.data.data
  },

  pauseRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    const response = await apiClient.post(`/recurring-transactions/${id}/pause`)
    return response.data.data
  },

  resumeRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    const response = await apiClient.post(`/recurring-transactions/${id}/resume`)
    return response.data.data
  },

  cancelRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    const response = await apiClient.post(`/recurring-transactions/${id}/cancel`)
    return response.data.data
  },

  generateRecurringTransaction: async (id: string): Promise<{ transaction: RecurringTransaction; generatedId: string }> => {
    const response = await apiClient.post(`/recurring-transactions/${id}/generate`)
    return response.data.data
  },

  processDueRecurring: async (): Promise<{ processed: number; errors: number }> => {
    const response = await apiClient.post('/recurring-transactions/process-due')
    return response.data.data
  },

  deleteRecurringTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/recurring-transactions/${id}`)
  },

  // ========== PRICE LEVELS ==========

  getPriceLevels: async (): Promise<PriceLevel[]> => {
    const response = await apiClient.get('/price-levels')
    return response.data.data
  },

  getClientRate: async (clientId: string, baseRate: number, serviceType?: string): Promise<ClientRateResponse> => {
    const response = await apiClient.get('/price-levels/client-rate', {
      params: { clientId, baseRate, serviceType }
    })
    return response.data.data
  },

  getPriceLevel: async (id: string): Promise<PriceLevel> => {
    const response = await apiClient.get(`/price-levels/${id}`)
    return response.data.data
  },

  createPriceLevel: async (data: CreatePriceLevelData): Promise<PriceLevel> => {
    const response = await apiClient.post('/price-levels', data)
    return response.data.data
  },

  updatePriceLevel: async (id: string, data: Partial<CreatePriceLevelData>): Promise<PriceLevel> => {
    const response = await apiClient.put(`/price-levels/${id}`, data)
    return response.data.data
  },

  deletePriceLevel: async (id: string): Promise<void> => {
    await apiClient.delete(`/price-levels/${id}`)
  },

  setDefaultPriceLevel: async (id: string): Promise<PriceLevel> => {
    const response = await apiClient.post(`/price-levels/${id}/set-default`)
    return response.data.data
  },

  // ========== BILLS ==========

  getBills: async (filters?: BillFilters): Promise<{ bills: Bill[]; total: number }> => {
    const response = await apiClient.get('/bills', { params: filters })
    return response.data.data
  },

  getBill: async (id: string): Promise<Bill> => {
    const response = await apiClient.get(`/bills/${id}`)
    return response.data.data
  },

  createBill: async (data: CreateBillData): Promise<Bill> => {
    const response = await apiClient.post('/bills', data)
    return response.data.data
  },

  updateBill: async (id: string, data: Partial<CreateBillData>): Promise<Bill> => {
    const response = await apiClient.put(`/bills/${id}`, data)
    return response.data.data
  },

  approveBill: async (id: string): Promise<Bill> => {
    const response = await apiClient.post(`/bills/${id}/approve`)
    return response.data.data
  },

  payBill: async (id: string, data: { amount: number; paymentMethod: string; notes?: string }): Promise<Bill> => {
    const response = await apiClient.post(`/bills/${id}/pay`, data)
    return response.data.data
  },

  postBillToGL: async (id: string): Promise<Bill> => {
    const response = await apiClient.post(`/bills/${id}/post-to-gl`)
    return response.data.data
  },

  deleteBill: async (id: string): Promise<void> => {
    await apiClient.delete(`/bills/${id}`)
  },

  receiveBill: async (id: string, data?: { receivedDate?: string; notes?: string }): Promise<Bill> => {
    const response = await apiClient.post(`/bills/${id}/receive`, data)
    return response.data.data
  },

  cancelBill: async (id: string, reason?: string): Promise<Bill> => {
    const response = await apiClient.post(`/bills/${id}/cancel`, { reason })
    return response.data.data
  },

  duplicateBill: async (id: string): Promise<Bill> => {
    const response = await apiClient.post(`/bills/${id}/duplicate`)
    return response.data.data
  },

  uploadBillAttachment: async (id: string, file: File): Promise<Bill> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/bills/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  },

  deleteBillAttachment: async (id: string, attachmentId: string): Promise<Bill> => {
    const response = await apiClient.delete(`/bills/${id}/attachments/${attachmentId}`)
    return response.data.data
  },

  getOverdueBills: async (): Promise<Bill[]> => {
    const response = await apiClient.get('/bills/overdue')
    return response.data.data
  },

  getBillsSummary: async (filters?: { startDate?: string; endDate?: string }): Promise<any> => {
    const response = await apiClient.get('/bills/summary', { params: filters })
    return response.data.data
  },

  getRecurringBills: async (): Promise<any[]> => {
    const response = await apiClient.get('/bills/recurring')
    return response.data.data
  },

  stopRecurringBill: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/bills/${id}/stop-recurring`)
    return response.data.data
  },

  generateNextBill: async (id: string): Promise<Bill> => {
    const response = await apiClient.post(`/bills/${id}/generate-next`)
    return response.data.data
  },

  getBillAgingReport: async (): Promise<any> => {
    const response = await apiClient.get('/bills/reports/aging')
    return response.data.data
  },

  exportBills: async (format: 'csv' | 'xlsx', filters?: BillFilters): Promise<Blob> => {
    const response = await apiClient.get('/bills/export', {
      params: { format, ...filters },
      responseType: 'blob'
    })
    return response.data
  },

  // ========== VENDORS ==========

  getVendors: async (filters?: VendorFilters): Promise<{ vendors: Vendor[]; total: number }> => {
    const response = await apiClient.get('/vendors', { params: filters })
    return response.data.data
  },

  getVendor: async (id: string): Promise<Vendor> => {
    const response = await apiClient.get(`/vendors/${id}`)
    return response.data.data
  },

  createVendor: async (data: CreateVendorData): Promise<Vendor> => {
    const response = await apiClient.post('/vendors', data)
    return response.data.data
  },

  updateVendor: async (id: string, data: Partial<CreateVendorData>): Promise<Vendor> => {
    const response = await apiClient.put(`/vendors/${id}`, data)
    return response.data.data
  },

  deleteVendor: async (id: string): Promise<void> => {
    await apiClient.delete(`/vendors/${id}`)
  },

  // ========== RETAINERS ==========

  getRetainers: async (filters?: { clientId?: string; status?: RetainerStatus }): Promise<Retainer[]> => {
    const response = await apiClient.get('/retainers', { params: filters })
    return response.data.data
  },

  getRetainer: async (id: string): Promise<Retainer> => {
    const response = await apiClient.get(`/retainers/${id}`)
    return response.data.data
  },

  createRetainer: async (data: CreateRetainerData): Promise<Retainer> => {
    const response = await apiClient.post('/retainers', data)
    return response.data.data
  },

  depositToRetainer: async (id: string, data: RetainerDepositData): Promise<{ retainer: Retainer; transaction: RetainerTransaction }> => {
    const response = await apiClient.post(`/retainers/${id}/replenish`, data)
    return response.data.data
  },

  consumeFromRetainer: async (id: string, data: RetainerConsumeData): Promise<{ retainer: Retainer; transaction: RetainerTransaction }> => {
    const response = await apiClient.post(`/retainers/${id}/consume`, data)
    return response.data.data
  },

  getRetainerTransactions: async (id: string): Promise<RetainerTransaction[]> => {
    const response = await apiClient.get(`/retainers/${id}/history`)
    return response.data.data
  },

  // ========== REPORTS ==========

  getProfitLossReport: async (startDate: string, endDate: string): Promise<ProfitLossReport> => {
    const response = await apiClient.get('/reports/profit-loss', { params: { startDate, endDate } })
    return response.data.data
  },

  getBalanceSheetReport: async (asOfDate?: string): Promise<BalanceSheetReport> => {
    const response = await apiClient.get('/reports/balance-sheet', { params: { asOfDate } })
    return response.data.data
  },

  getTrialBalanceReport: async (asOfDate?: string): Promise<TrialBalanceReport> => {
    const response = await apiClient.get('/reports/trial-balance', { params: { asOfDate } })
    return response.data.data
  },

  getARAgingReport: async (): Promise<ARAgingReport> => {
    const response = await apiClient.get('/reports/ar-aging')
    return response.data.data
  },

  getCaseProfitabilityReport: async (startDate: string, endDate: string): Promise<CaseProfitabilityReport> => {
    const response = await apiClient.get('/reports/case-profitability', { params: { startDate, endDate } })
    return response.data.data
  },

  // ========== LEADS ==========

  getLeads: async (filters?: LeadFilters): Promise<{ leads: Lead[]; total: number }> => {
    const response = await apiClient.get('/leads', { params: filters })
    return response.data.data
  },

  getLead: async (id: string): Promise<Lead> => {
    const response = await apiClient.get(`/leads/${id}`)
    return response.data.data
  },

  createLead: async (data: CreateLeadData): Promise<Lead> => {
    const response = await apiClient.post('/leads', data)
    return response.data.data
  },

  updateLead: async (id: string, data: Partial<CreateLeadData>): Promise<Lead> => {
    const response = await apiClient.put(`/leads/${id}`, data)
    return response.data.data
  },

  deleteLead: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}`)
  },

  convertLead: async (id: string, data?: { createCase?: boolean; caseType?: string }): Promise<ConvertLeadResult> => {
    const response = await apiClient.post(`/leads/${id}/convert`, data)
    return response.data.data
  },

  updateLeadStage: async (id: string, stage: LeadStage): Promise<Lead> => {
    const response = await apiClient.patch(`/leads/${id}/stage`, { stage })
    return response.data.data
  },

  addLeadActivity: async (id: string, activity: Omit<LeadActivity, '_id' | 'createdBy'>): Promise<Lead> => {
    const response = await apiClient.post(`/leads/${id}/activity`, activity)
    return response.data.data
  },

  getLeadStats: async (): Promise<LeadStats> => {
    const response = await apiClient.get('/leads/stats')
    return response.data.data
  },

  // ========== INVOICE GL INTEGRATION ==========

  postInvoiceToGL: async (invoiceId: string): Promise<{ invoice: any; glEntry: GLEntry }> => {
    const response = await apiClient.post(`/invoices/${invoiceId}/post-to-gl`)
    return response.data.data
  },

  recordPaymentForInvoice: async (invoiceId: string, data: {
    amount: number
    paymentDate: string
    paymentMethod: string
    bankAccountId?: string
  }): Promise<{ invoice: any; payment: any; glEntry: GLEntry }> => {
    const response = await apiClient.post(`/invoices/${invoiceId}/record-payment`, data)
    return response.data.data
  },
}

export default accountingService
