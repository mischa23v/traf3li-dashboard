/**
 * Bank Reconciliation Service
 * Handles all bank reconciliation, matching, and currency API calls
 */

import { apiClientNoVersion as api } from '@/lib/api'

// ==================== TYPES ====================

export interface BankReconciliation {
  _id: string
  accountId: string
  periodStart: string
  periodEnd: string
  bankStatementBalance: number
  bookBalance: number
  status: 'in_progress' | 'completed' | 'cancelled'
  clearedTransactions: string[]
  unclearedTransactions: string[]
  difference: number
  createdAt: string
  updatedAt: string
}

export interface MatchSuggestion {
  bankTransactionId: string
  systemTransactionId: string
  confidence: number
  matchType: 'exact' | 'fuzzy' | 'amount_date'
}

export interface MatchRule {
  _id: string
  name: string
  bankTextContains?: string
  amountEquals?: number
  amountRange?: { min: number; max: number }
  mapToAccount?: string
  mapToCategory?: string
  mapToVendor?: string
  autoApply: boolean
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BankFeed {
  _id: string
  accountId: string
  feedType: 'plaid' | 'manual' | 'csv' | 'ofx'
  isActive: boolean
  lastSync?: string
  syncFrequency?: 'daily' | 'weekly' | 'manual'
  credentials?: any
  createdAt: string
  updatedAt: string
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  date: string
  source: string
}

// ==================== BANK FEEDS ====================

export const bankReconciliationService = {
  // ============ BANK FEEDS ============
  getBankFeeds: async (): Promise<BankFeed[]> => {
    const response = await api.get('/bank-reconciliation/feeds')
    return response.data
  },

  createBankFeed: async (data: Partial<BankFeed>): Promise<BankFeed> => {
    const response = await api.post('/bank-reconciliation/feeds', data)
    return response.data
  },

  updateBankFeed: async (id: string, data: Partial<BankFeed>): Promise<BankFeed> => {
    const response = await api.put(`/bank-reconciliation/feeds/${id}`, data)
    return response.data
  },

  deleteBankFeed: async (id: string): Promise<void> => {
    await api.delete(`/bank-reconciliation/feeds/${id}`)
  },

  // ============ IMPORT ============
  importCSV: async (file: File, accountId: string): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('accountId', accountId)
    const response = await api.post('/bank-reconciliation/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  importOFX: async (file: File, accountId: string): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('accountId', accountId)
    const response = await api.post('/bank-reconciliation/import/ofx', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getCSVTemplate: async (): Promise<Blob> => {
    const response = await api.get('/bank-reconciliation/import/template', {
      responseType: 'blob'
    })
    return response.data
  },

  // ============ MATCHING ============
  getMatchSuggestions: async (accountId: string): Promise<MatchSuggestion[]> => {
    const response = await api.get(`/bank-reconciliation/suggestions/${accountId}`)
    return response.data
  },

  autoMatch: async (accountId: string): Promise<any> => {
    const response = await api.post(`/bank-reconciliation/auto-match/${accountId}`)
    return response.data
  },

  confirmMatch: async (id: string): Promise<any> => {
    const response = await api.post(`/bank-reconciliation/match/confirm/${id}`)
    return response.data
  },

  rejectMatch: async (id: string): Promise<any> => {
    const response = await api.post(`/bank-reconciliation/match/reject/${id}`)
    return response.data
  },

  createSplitMatch: async (data: {
    bankTransactionId: string
    systemTransactionIds: string[]
  }): Promise<any> => {
    const response = await api.post('/bank-reconciliation/match/split', data)
    return response.data
  },

  unmatch: async (id: string): Promise<void> => {
    await api.delete(`/bank-reconciliation/match/${id}`)
  },

  // ============ MATCH RULES ============
  createRule: async (data: Partial<MatchRule>): Promise<MatchRule> => {
    const response = await api.post('/bank-reconciliation/rules', data)
    return response.data
  },

  getRules: async (): Promise<MatchRule[]> => {
    const response = await api.get('/bank-reconciliation/rules')
    return response.data
  },

  updateRule: async (id: string, data: Partial<MatchRule>): Promise<MatchRule> => {
    const response = await api.put(`/bank-reconciliation/rules/${id}`, data)
    return response.data
  },

  deleteRule: async (id: string): Promise<void> => {
    await api.delete(`/bank-reconciliation/rules/${id}`)
  },

  // ============ RECONCILIATION ============
  createReconciliation: async (data: {
    accountId: string
    periodStart: string
    periodEnd: string
    bankStatementBalance: number
  }): Promise<BankReconciliation> => {
    const response = await api.post('/bank-reconciliation', data)
    return response.data
  },

  getReconciliations: async (params?: {
    accountId?: string
    status?: string
  }): Promise<BankReconciliation[]> => {
    const response = await api.get('/bank-reconciliation', { params })
    return response.data
  },

  getReconciliation: async (id: string): Promise<BankReconciliation> => {
    const response = await api.get(`/bank-reconciliation/${id}`)
    return response.data
  },

  clearTransaction: async (id: string, transactionId: string): Promise<BankReconciliation> => {
    const response = await api.post(`/bank-reconciliation/${id}/clear`, { transactionId })
    return response.data
  },

  unclearTransaction: async (id: string, transactionId: string): Promise<BankReconciliation> => {
    const response = await api.post(`/bank-reconciliation/${id}/unclear`, { transactionId })
    return response.data
  },

  completeReconciliation: async (id: string): Promise<BankReconciliation> => {
    const response = await api.post(`/bank-reconciliation/${id}/complete`)
    return response.data
  },

  cancelReconciliation: async (id: string): Promise<BankReconciliation> => {
    const response = await api.post(`/bank-reconciliation/${id}/cancel`)
    return response.data
  },

  // ============ STATUS & REPORTING ============
  getReconciliationStatus: async (accountId: string): Promise<any> => {
    const response = await api.get(`/bank-reconciliation/status/${accountId}`)
    return response.data
  },

  getUnmatchedTransactions: async (accountId: string): Promise<any> => {
    const response = await api.get(`/bank-reconciliation/unmatched/${accountId}`)
    return response.data
  },

  getMatchStatistics: async (): Promise<any> => {
    const response = await api.get('/bank-reconciliation/statistics/matches')
    return response.data
  },

  getRuleStatistics: async (): Promise<any> => {
    const response = await api.get('/bank-reconciliation/statistics/rules')
    return response.data
  },

  // ============ CURRENCY ============
  getExchangeRates: async (): Promise<ExchangeRate[]> => {
    const response = await api.get('/bank-reconciliation/currency/rates')
    return response.data
  },

  convertAmount: async (data: {
    amount: number
    from: string
    to: string
    date?: string
  }): Promise<{ convertedAmount: number; rate: number }> => {
    const response = await api.post('/bank-reconciliation/currency/convert', data)
    return response.data
  },

  setManualRate: async (data: {
    from: string
    to: string
    rate: number
    date?: string
  }): Promise<ExchangeRate> => {
    const response = await api.post('/bank-reconciliation/currency/rates', data)
    return response.data
  },

  getSupportedCurrencies: async (): Promise<string[]> => {
    const response = await api.get('/bank-reconciliation/currency/supported')
    return response.data
  },

  updateRatesFromAPI: async (): Promise<any> => {
    const response = await api.post('/bank-reconciliation/currency/update')
    return response.data
  },
}

export default bankReconciliationService
