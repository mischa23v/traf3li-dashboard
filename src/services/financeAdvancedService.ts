/**
 * Advanced Finance Service
 * Handles bank reconciliation, multi-currency, and related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  // Bank Feed types
  BankFeed,
  CreateBankFeedData,
  BankFeedFilters,
  BankTransaction,
  BankTransactionFilters,
  // Matching types
  BankTransactionMatch,
  MatchSuggestion,
  CreateMatchData,
  MatchingRule,
  CreateMatchingRuleData,
  // Report types
  ReconciliationReport,
  ImportResult,
  CSVColumnMapping,
  // Currency types
  ExchangeRate,
  ExchangeRateHistory,
  CurrencyConversion,
  CurrencySettings,
  ConvertCurrencyData,
} from '@/types/finance-advanced'

// ═══════════════════════════════════════════════════════════════
// BANK FEED SERVICE
// ═══════════════════════════════════════════════════════════════
export const bankFeedService = {
  /**
   * Get all bank feeds
   */
  getFeeds: async (
    filters?: BankFeedFilters
  ): Promise<{ data: BankFeed[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/bank-reconciliations/feeds', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single feed
   */
  getFeed: async (id: string): Promise<BankFeed> => {
    try {
      const response = await apiClient.get(`/bank-reconciliations/feeds/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create bank feed
   */
  createFeed: async (data: CreateBankFeedData): Promise<BankFeed> => {
    try {
      const response = await apiClient.post('/bank-reconciliations/feeds', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update bank feed
   */
  updateFeed: async (id: string, data: Partial<CreateBankFeedData>): Promise<BankFeed> => {
    try {
      const response = await apiClient.put(`/bank-reconciliations/feeds/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete bank feed
   */
  deleteFeed: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/bank-reconciliations/feeds/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Fetch transactions from Plaid
   */
  fetchTransactions: async (id: string): Promise<{ imported: number; lastSync: Date }> => {
    try {
      const response = await apiClient.post(`/bank-reconciliations/feeds/${id}/fetch`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import CSV transactions
   */
  importCSV: async (
    id: string,
    file: File,
    columnMapping: CSVColumnMapping,
    dateFormat: string
  ): Promise<ImportResult> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('columnMapping', JSON.stringify(columnMapping))
      formData.append('dateFormat', dateFormat)

      const response = await apiClient.post(
        `/bank-reconciliations/feeds/${id}/import/csv`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import OFX transactions
   */
  importOFX: async (id: string, file: File): Promise<ImportResult> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(
        `/bank-reconciliations/feeds/${id}/import/ofx`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transactions for feed
   */
  getTransactions: async (
    id: string,
    filters?: BankTransactionFilters
  ): Promise<{ data: BankTransaction[]; pagination: any }> => {
    try {
      const response = await apiClient.get(`/bank-reconciliations/feeds/${id}/transactions`, {
        params: filters
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// MATCHING SERVICE
// ═══════════════════════════════════════════════════════════════
export const matchingService = {
  /**
   * Get match suggestions for transaction
   */
  getSuggestions: async (transactionId: string): Promise<MatchSuggestion> => {
    try {
      const response = await apiClient.get(`/bank-reconciliations/suggestions/${transactionId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create manual match
   */
  createMatch: async (data: CreateMatchData): Promise<BankTransactionMatch> => {
    try {
      const response = await apiClient.post('/bank-reconciliations/match', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Auto-match all unmatched transactions
   */
  autoMatchAll: async (bankFeedId?: string): Promise<{
    matched: number
    unmatched: number
    suggestions: number
  }> => {
    try {
      const response = await apiClient.post('/bank-reconciliations/auto-match', {
        bankFeedId
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Confirm suggested match
   */
  confirmMatch: async (matchId: string): Promise<BankTransactionMatch> => {
    try {
      const response = await apiClient.post(`/bank-reconciliations/matches/${matchId}/confirm`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject suggested match
   */
  rejectMatch: async (matchId: string): Promise<void> => {
    try {
      await apiClient.post(`/bank-reconciliations/matches/${matchId}/reject`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unmatch transaction
   */
  unmatch: async (matchId: string): Promise<void> => {
    try {
      await apiClient.delete(`/bank-reconciliations/matches/${matchId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Exclude transaction from reconciliation
   */
  excludeTransaction: async (transactionId: string, reason: string): Promise<void> => {
    try {
      await apiClient.post(`/bank-reconciliations/transactions/${transactionId}/exclude`, {
        reason
      })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// MATCHING RULES SERVICE
// ═══════════════════════════════════════════════════════════════
export const matchingRulesService = {
  /**
   * Get all matching rules
   */
  getRules: async (): Promise<MatchingRule[]> => {
    try {
      const response = await apiClient.get('/bank-reconciliations/rules')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single rule
   */
  getRule: async (id: string): Promise<MatchingRule> => {
    try {
      const response = await apiClient.get(`/bank-reconciliations/rules/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create matching rule
   */
  createRule: async (data: CreateMatchingRuleData): Promise<MatchingRule> => {
    try {
      const response = await apiClient.post('/bank-reconciliations/rules', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update matching rule
   */
  updateRule: async (id: string, data: Partial<CreateMatchingRuleData>): Promise<MatchingRule> => {
    try {
      const response = await apiClient.put(`/bank-reconciliations/rules/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete matching rule
   */
  deleteRule: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/bank-reconciliations/rules/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle rule active status
   */
  toggleRule: async (id: string): Promise<MatchingRule> => {
    try {
      const response = await apiClient.post(`/bank-reconciliations/rules/${id}/toggle`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reorder rules priority
   */
  reorderRules: async (ruleIds: string[]): Promise<void> => {
    try {
      await apiClient.post('/bank-reconciliations/rules/reorder', { ruleIds })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// RECONCILIATION REPORT SERVICE
// ═══════════════════════════════════════════════════════════════
export const reconciliationReportService = {
  /**
   * Get reconciliation report
   */
  getReport: async (bankFeedId: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<ReconciliationReport> => {
    try {
      const response = await apiClient.get(`/bank-reconciliations/report/${bankFeedId}`, {
        params
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export reconciliation report
   */
  exportReport: async (bankFeedId: string, format: 'pdf' | 'xlsx'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/bank-reconciliations/report/${bankFeedId}/export`, {
        params: { format },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// CURRENCY SERVICE
// ═══════════════════════════════════════════════════════════════
export const currencyService = {
  /**
   * Get all exchange rates
   */
  getRates: async (): Promise<ExchangeRate[]> => {
    try {
      const response = await apiClient.get('/currency/rates')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get specific exchange rate
   */
  getRate: async (fromCurrency: string, toCurrency: string): Promise<ExchangeRate> => {
    try {
      const response = await apiClient.get(`/currency/rates/${fromCurrency}/${toCurrency}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rate history
   */
  getRateHistory: async (
    fromCurrency: string,
    toCurrency: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ExchangeRateHistory[]> => {
    try {
      const response = await apiClient.get(`/currency/rates/${fromCurrency}/${toCurrency}/history`, {
        params
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Convert currency
   */
  convert: async (data: ConvertCurrencyData): Promise<CurrencyConversion> => {
    try {
      const response = await apiClient.post('/currency/convert', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Refresh rates from external API
   */
  refreshRates: async (): Promise<{ updated: number; lastUpdate: Date }> => {
    try {
      const response = await apiClient.post('/currency/rates/refresh')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Manually set exchange rate
   */
  setRate: async (
    fromCurrency: string,
    toCurrency: string,
    rate: number
  ): Promise<ExchangeRate> => {
    try {
      const response = await apiClient.post('/currency/rates', {
        fromCurrency,
        toCurrency,
        rate
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get currency settings
   */
  getSettings: async (): Promise<CurrencySettings> => {
    try {
      const response = await apiClient.get('/currency/settings')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update currency settings
   */
  updateSettings: async (data: Partial<CurrencySettings>): Promise<CurrencySettings> => {
    try {
      const response = await apiClient.put('/currency/settings', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}
