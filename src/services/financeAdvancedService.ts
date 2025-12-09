/**
 * Advanced Finance Service
 * Handles bank reconciliation, multi-currency, and related API calls
 */

import { apiClientNoVersionNoVersion, handleApiError } from '@/lib/api'
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
      const response = await apiClientNoVersion.get('/bank-reconciliation/feeds', { params: filters })
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
      const response = await apiClientNoVersion.get(`/bank-reconciliation/feeds/${id}`)
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
      const response = await apiClientNoVersion.post('/bank-reconciliation/feeds', data)
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
      const response = await apiClientNoVersion.put(`/bank-reconciliation/feeds/${id}`, data)
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
      await apiClientNoVersion.delete(`/bank-reconciliation/feeds/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Fetch transactions from Plaid
   */
  fetchTransactions: async (id: string): Promise<{ imported: number; lastSync: Date }> => {
    try {
      const response = await apiClientNoVersion.post(`/bank-reconciliation/feeds/${id}/fetch`)
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

      const response = await apiClientNoVersion.post(
        `/bank-reconciliation/import/csv`,
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

      const response = await apiClientNoVersion.post(
        `/bank-reconciliation/import/ofx`,
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
      const response = await apiClientNoVersion.get(`/bank-reconciliation/feeds/${id}/transactions`, {
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
  getSuggestions: async (accountId: string): Promise<MatchSuggestion> => {
    try {
      const response = await apiClientNoVersion.get(`/bank-reconciliation/suggestions/${accountId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create manual match (split match)
   */
  createMatch: async (data: CreateMatchData): Promise<BankTransactionMatch> => {
    try {
      const response = await apiClientNoVersion.post('/bank-reconciliation/match/split', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Auto-match all unmatched transactions
   */
  autoMatchAll: async (accountId: string): Promise<{
    matched: number
    unmatched: number
    suggestions: number
  }> => {
    try {
      const response = await apiClientNoVersion.post(`/bank-reconciliation/auto-match/${accountId}`)
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
      const response = await apiClientNoVersion.post(`/bank-reconciliation/match/confirm/${matchId}`)
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
      await apiClientNoVersion.post(`/bank-reconciliation/match/reject/${matchId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unmatch transaction
   */
  unmatch: async (matchId: string): Promise<void> => {
    try {
      await apiClientNoVersion.delete(`/bank-reconciliation/match/${matchId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Exclude transaction from reconciliation (not available in backend routes)
   * This endpoint does not exist in the backend
   */
  excludeTransaction: async (transactionId: string, reason: string): Promise<void> => {
    try {
      // Note: This endpoint is not implemented in the backend
      // The backend uses clear/unclear transaction on reconciliation instead
      throw new Error('Endpoint not available - use reconciliation clear/unclear instead')
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
      const response = await apiClientNoVersion.get('/bank-reconciliation/rules')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single rule (not available in backend routes)
   */
  getRule: async (id: string): Promise<MatchingRule> => {
    try {
      // Note: This endpoint is not implemented in the backend
      throw new Error('Endpoint not available - use getRules() to fetch all rules')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create matching rule
   */
  createRule: async (data: CreateMatchingRuleData): Promise<MatchingRule> => {
    try {
      const response = await apiClientNoVersion.post('/bank-reconciliation/rules', data)
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
      const response = await apiClientNoVersion.put(`/bank-reconciliation/rules/${id}`, data)
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
      await apiClientNoVersion.delete(`/bank-reconciliation/rules/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle rule active status (not available in backend routes)
   */
  toggleRule: async (id: string): Promise<MatchingRule> => {
    try {
      // Note: This endpoint is not implemented in the backend
      throw new Error('Endpoint not available - update the rule to change its active status')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reorder rules priority (not available in backend routes)
   */
  reorderRules: async (ruleIds: string[]): Promise<void> => {
    try {
      // Note: This endpoint is not implemented in the backend
      throw new Error('Endpoint not available')
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
   * Get reconciliation report (not available as a specific endpoint)
   * Use getReconciliationStatus or getUnmatchedTransactions instead
   */
  getReport: async (accountId: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<ReconciliationReport> => {
    try {
      // Note: This endpoint is not implemented in the backend
      // Use /bank-reconciliation/status/:accountId instead
      const response = await apiClientNoVersion.get(`/bank-reconciliation/status/${accountId}`, {
        params
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export reconciliation report (not available in backend routes)
   */
  exportReport: async (accountId: string, format: 'pdf' | 'xlsx'): Promise<Blob> => {
    try {
      // Note: This endpoint is not implemented in the backend
      throw new Error('Endpoint not available')
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
      const response = await apiClientNoVersion.get('/currency/rates')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get specific exchange rate (not available as a separate endpoint)
   * Use getRates() and filter the results instead
   */
  getRate: async (fromCurrency: string, toCurrency: string): Promise<ExchangeRate> => {
    try {
      // Note: This endpoint is not implemented in the backend
      // The backend only has /currency/rates (get all)
      const response = await apiClientNoVersion.get('/currency/rates')
      const rates = response.data.data || []
      const rate = rates.find((r: any) =>
        r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
      )
      if (!rate) {
        throw new Error(`Exchange rate for ${fromCurrency} to ${toCurrency} not found`)
      }
      return rate
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rate history (not available in backend routes)
   */
  getRateHistory: async (
    fromCurrency: string,
    toCurrency: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ExchangeRateHistory[]> => {
    try {
      // Note: This endpoint is not implemented in the backend
      throw new Error('Endpoint not available')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Convert currency
   */
  convert: async (data: ConvertCurrencyData): Promise<CurrencyConversion> => {
    try {
      const response = await apiClientNoVersion.post('/currency/convert', data)
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
      const response = await apiClientNoVersion.post('/currency/update')
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
      const response = await apiClientNoVersion.post('/currency/rates', {
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
      const response = await apiClientNoVersion.get('/currency/settings')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update currency settings (not available in backend routes)
   */
  updateSettings: async (data: Partial<CurrencySettings>): Promise<CurrencySettings> => {
    try {
      // Note: This endpoint is not implemented in the backend
      throw new Error('Endpoint not available')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}
