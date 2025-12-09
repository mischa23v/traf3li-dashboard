/**
 * General Ledger Service
 * Handles GL entries, account balances, and financial reports API calls
 */

import apiClient from '@/lib/api'

// ==================== TYPES ====================

export type GLReferenceModel = 'Invoice' | 'Payment' | 'Expense' | 'Bill' | 'JournalEntry'
export type GLEntryStatus = 'draft' | 'posted' | 'voided'

export interface GLEntry {
  _id: string
  entryNumber: string
  transactionDate: string
  description: string
  referenceModel: GLReferenceModel
  referenceId: string
  amount: number
  lines: GLEntryLine[]
  status: GLEntryStatus
  caseId?: { _id: string; caseNumber: string }
  clientId?: { _id: string; firstName: string; lastName: string }
  firmId: string
  createdBy: string
  voidedAt?: string
  voidedBy?: string
  voidReason?: string
  createdAt: string
  updatedAt: string
}

export interface GLEntryLine {
  _id?: string
  accountId: string | {
    _id: string
    code: string
    name: string
    nameAr?: string
    type: string
  }
  debit: number
  credit: number
  description?: string
}

export interface GLEntryFilters {
  accountId?: string
  startDate?: string
  endDate?: string
  caseId?: string
  clientId?: string
  lawyerId?: string
  status?: GLEntryStatus
  referenceModel?: GLReferenceModel
  page?: number
  limit?: number
  sort?: string
}

export interface AccountBalance {
  accountId: string
  balance: number
  debit: number
  credit: number
  startDate?: string
  endDate?: string
}

export interface TrialBalance {
  asOfDate: string
  accounts: Array<{
    accountId: string
    code: string
    name: string
    nameAr?: string
    type: string
    debit: number
    credit: number
    balance: number
  }>
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
}

export interface ProfitLossStatement {
  startDate: string
  endDate: string
  income: {
    total: number
    accounts: Array<{
      accountId: string
      code: string
      name: string
      nameAr?: string
      amount: number
    }>
  }
  expenses: {
    total: number
    accounts: Array<{
      accountId: string
      code: string
      name: string
      nameAr?: string
      amount: number
    }>
  }
  netIncome: number
}

export interface BalanceSheet {
  asOfDate: string
  assets: {
    total: number
    currentAssets: {
      total: number
      accounts: Array<{
        accountId: string
        code: string
        name: string
        nameAr?: string
        balance: number
      }>
    }
    fixedAssets: {
      total: number
      accounts: Array<{
        accountId: string
        code: string
        name: string
        nameAr?: string
        balance: number
      }>
    }
  }
  liabilities: {
    total: number
    currentLiabilities: {
      total: number
      accounts: Array<{
        accountId: string
        code: string
        name: string
        nameAr?: string
        balance: number
      }>
    }
    longTermLiabilities: {
      total: number
      accounts: Array<{
        accountId: string
        code: string
        name: string
        nameAr?: string
        balance: number
      }>
    }
  }
  equity: {
    total: number
    accounts: Array<{
      accountId: string
      code: string
      name: string
      nameAr?: string
      balance: number
    }>
  }
  isBalanced: boolean
}

export interface GLSummary {
  byAccountType: {
    asset: { debit: number; credit: number; balance: number }
    liability: { debit: number; credit: number; balance: number }
    equity: { debit: number; credit: number; balance: number }
    income: { debit: number; credit: number; balance: number }
    expense: { debit: number; credit: number; balance: number }
  }
  totalEntries: number
  totalPosted: number
  totalVoided: number
  dateRange?: {
    startDate: string
    endDate: string
  }
}

export interface GLStats {
  totalEntries: number
  entriesByStatus: {
    draft: number
    posted: number
    voided: number
  }
  entriesByModel: {
    [key: string]: number
  }
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  dateRange?: {
    startDate: string
    endDate: string
  }
}

// ==================== SERVICE ====================

const generalLedgerService = {
  /**
   * Get GL statistics
   * GET /api/general-ledger/stats
   */
  getStats: async (filters?: { startDate?: string; endDate?: string }): Promise<GLStats> => {
    const response = await apiClient.get('/general-ledger/stats', { params: filters })
    return response.data.data
  },

  /**
   * Get GL summary by account type
   * GET /api/general-ledger/summary
   */
  getSummary: async (filters?: { startDate?: string; endDate?: string }): Promise<GLSummary> => {
    const response = await apiClient.get('/general-ledger/summary', { params: filters })
    return response.data.data
  },

  /**
   * Get trial balance
   * GET /api/general-ledger/trial-balance
   */
  getTrialBalance: async (filters?: { startDate?: string; endDate?: string; asOfDate?: string }): Promise<TrialBalance> => {
    const response = await apiClient.get('/general-ledger/trial-balance', { params: filters })
    return response.data.data
  },

  /**
   * Get profit & loss statement
   * GET /api/general-ledger/profit-loss
   */
  getProfitLoss: async (filters?: { startDate?: string; endDate?: string }): Promise<ProfitLossStatement> => {
    const response = await apiClient.get('/general-ledger/profit-loss', { params: filters })
    return response.data.data
  },

  /**
   * Get balance sheet
   * GET /api/general-ledger/balance-sheet
   */
  getBalanceSheet: async (filters?: { asOfDate?: string }): Promise<BalanceSheet> => {
    const response = await apiClient.get('/general-ledger/balance-sheet', { params: filters })
    return response.data.data
  },

  /**
   * Get account balance for a specific account
   * GET /api/general-ledger/account-balance/:accountId
   */
  getAccountBalance: async (
    accountId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<AccountBalance> => {
    const response = await apiClient.get(`/general-ledger/account-balance/${accountId}`, { params: filters })
    return response.data.data
  },

  /**
   * Get GL entries by reference (invoice, payment, etc.)
   * GET /api/general-ledger/reference/:model/:id
   */
  getEntriesByReference: async (model: string, id: string): Promise<GLEntry[]> => {
    const response = await apiClient.get(`/general-ledger/reference/${model}/${id}`)
    return response.data.data
  },

  /**
   * Get all GL entries with filters
   * GET /api/general-ledger/entries
   */
  getEntries: async (filters?: GLEntryFilters): Promise<{ entries: GLEntry[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get('/general-ledger/entries', { params: filters })
    return {
      entries: response.data.data || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1,
    }
  },

  /**
   * Get single GL entry
   * GET /api/general-ledger/:id
   */
  getEntry: async (id: string): Promise<GLEntry> => {
    const response = await apiClient.get(`/general-ledger/${id}`)
    return response.data.data
  },

  /**
   * Void a GL entry (creates reversing entry)
   * POST /api/general-ledger/:id/void
   */
  voidEntry: async (id: string, reason?: string): Promise<{
    originalEntry: GLEntry
    reversingEntry: GLEntry
  }> => {
    const response = await apiClient.post(`/general-ledger/${id}/void`, { reason })
    return response.data.data
  },

  /**
   * Legacy: Get all entries (redirect to /entries)
   * GET /api/general-ledger/
   */
  getAllEntries: async (filters?: GLEntryFilters): Promise<{ entries: GLEntry[]; total: number }> => {
    const response = await apiClient.get('/general-ledger', { params: filters })
    return {
      entries: response.data.data || [],
      total: response.data.total || 0,
    }
  },

  /**
   * Legacy: Void entry with different URL pattern
   * POST /api/general-ledger/void/:id
   */
  voidEntryLegacy: async (id: string, reason?: string): Promise<{
    originalEntry: GLEntry
    reversingEntry: GLEntry
  }> => {
    const response = await apiClient.post(`/general-ledger/void/${id}`, { reason })
    return response.data.data
  },
}

export default generalLedgerService
