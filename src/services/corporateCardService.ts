/**
 * Corporate Card Service
 * Handles all corporate card and transaction-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  CorporateCard,
  CardTransaction,
  CardStatistics,
  CSVImportResult,
  CreateCorporateCardData,
  UpdateCorporateCardData,
  CreateCardTransactionData,
  ReconcileTransactionData,
  CardTransactionFilters,
  CorporateCardFilters,
  ReconciliationMatch,
} from '@/features/finance/types/corporate-card-types'

const corporateCardService = {
  // ==================== CORPORATE CARDS ====================

  /**
   * Get all corporate cards
   */
  getCorporateCards: async (filters?: CorporateCardFilters): Promise<{ cards: CorporateCard[]; total: number }> => {
    try {
      const response = await apiClient.get('/corporate-cards', { params: filters })
      return {
        cards: response.data.cards || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single corporate card
   */
  getCorporateCard: async (id: string): Promise<CorporateCard> => {
    try {
      const response = await apiClient.get(`/corporate-cards/${id}`)
      return response.data.card || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create corporate card
   */
  createCorporateCard: async (data: CreateCorporateCardData): Promise<CorporateCard> => {
    try {
      const response = await apiClient.post('/corporate-cards', data)
      return response.data.card || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update corporate card
   */
  updateCorporateCard: async (id: string, data: UpdateCorporateCardData): Promise<CorporateCard> => {
    try {
      const response = await apiClient.patch(`/corporate-cards/${id}`, data)
      return response.data.card || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete corporate card
   */
  deleteCorporateCard: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/corporate-cards/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Block corporate card
   */
  blockCorporateCard: async (id: string, reason?: string): Promise<CorporateCard> => {
    try {
      const response = await apiClient.post(`/corporate-cards/${id}/block`, { reason })
      return response.data.card || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unblock corporate card
   */
  unblockCorporateCard: async (id: string): Promise<CorporateCard> => {
    try {
      const response = await apiClient.post(`/corporate-cards/${id}/unblock`)
      return response.data.card || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CARD TRANSACTIONS ====================

  /**
   * Get card transactions
   */
  getCardTransactions: async (filters?: CardTransactionFilters): Promise<{ transactions: CardTransaction[]; total: number }> => {
    try {
      const response = await apiClient.get('/corporate-cards/transactions', { params: filters })
      return {
        transactions: response.data.transactions || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single card transaction
   */
  getCardTransaction: async (id: string): Promise<CardTransaction> => {
    try {
      const response = await apiClient.get(`/corporate-cards/transactions/${id}`)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create card transaction
   */
  createCardTransaction: async (data: CreateCardTransactionData): Promise<CardTransaction> => {
    try {
      const response = await apiClient.post('/corporate-cards/transactions', data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update card transaction
   */
  updateCardTransaction: async (id: string, data: Partial<CreateCardTransactionData>): Promise<CardTransaction> => {
    try {
      const response = await apiClient.patch(`/corporate-cards/transactions/${id}`, data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete card transaction
   */
  deleteCardTransaction: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/corporate-cards/transactions/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get unreconciled transactions
   */
  getUnreconciledTransactions: async (cardId?: string): Promise<CardTransaction[]> => {
    try {
      const params = cardId ? { cardId, reconciled: false } : { reconciled: false }
      const response = await apiClient.get('/corporate-cards/transactions', { params })
      return response.data.transactions || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get disputed transactions
   */
  getDisputedTransactions: async (cardId?: string): Promise<CardTransaction[]> => {
    try {
      const params = cardId ? { cardId, status: 'disputed' } : { status: 'disputed' }
      const response = await apiClient.get('/corporate-cards/transactions', { params })
      return response.data.transactions || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RECONCILIATION ====================

  /**
   * Reconcile transaction
   */
  reconcileTransaction: async (data: ReconcileTransactionData): Promise<CardTransaction> => {
    try {
      const response = await apiClient.post(`/corporate-cards/transactions/${data.transactionId}/reconcile`, data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk reconcile transactions
   */
  bulkReconcileTransactions: async (reconciliations: ReconcileTransactionData[]): Promise<{ success: number; failed: number }> => {
    try {
      const response = await apiClient.post('/corporate-cards/transactions/bulk-reconcile', { reconciliations })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Match transaction to expense claim
   */
  matchTransactionToExpense: async (transactionId: string, expenseClaimId: string): Promise<ReconciliationMatch> => {
    try {
      const response = await apiClient.post(`/corporate-cards/transactions/${transactionId}/match`, { expenseClaimId })
      return response.data.match || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Find potential matches for transaction
   */
  findPotentialMatches: async (transactionId: string): Promise<ReconciliationMatch[]> => {
    try {
      const response = await apiClient.get(`/corporate-cards/transactions/${transactionId}/potential-matches`)
      return response.data.matches || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Dispute transaction
   */
  disputeTransaction: async (transactionId: string, reason: string): Promise<CardTransaction> => {
    try {
      const response = await apiClient.post(`/corporate-cards/transactions/${transactionId}/dispute`, { reason })
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resolve dispute
   */
  resolveDispute: async (transactionId: string, resolution: string): Promise<CardTransaction> => {
    try {
      const response = await apiClient.post(`/corporate-cards/transactions/${transactionId}/resolve-dispute`, { resolution })
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CSV IMPORT ====================

  /**
   * Import transactions from CSV
   */
  importTransactionsCSV: async (cardId: string, file: File): Promise<CSVImportResult> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cardId', cardId)

      const response = await apiClient.post('/corporate-cards/transactions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.result || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Download CSV template
   */
  downloadCSVTemplate: async (): Promise<Blob> => {
    try {
      const response = await apiClient.get('/corporate-cards/transactions/csv-template', {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== STATISTICS & REPORTS ====================

  /**
   * Get card statistics
   */
  getCardStatistics: async (startDate?: string, endDate?: string): Promise<CardStatistics> => {
    try {
      const params = { startDate, endDate }
      const response = await apiClient.get('/corporate-cards/statistics', { params })
      return response.data.statistics || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get reconciliation report
   */
  getReconciliationReport: async (cardId?: string, startDate?: string, endDate?: string): Promise<any> => {
    try {
      const params = { cardId, startDate, endDate }
      const response = await apiClient.get('/corporate-cards/reports/reconciliation', { params })
      return response.data.report || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export reconciliation report
   */
  exportReconciliationReport: async (cardId?: string, startDate?: string, endDate?: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> => {
    try {
      const params = { cardId, startDate, endDate, format }
      const response = await apiClient.get('/corporate-cards/reports/reconciliation/export', {
        params,
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get spending by category
   */
  getSpendingByCategory: async (cardId?: string, startDate?: string, endDate?: string): Promise<Array<{ category: string; amount: number; percentage: number }>> => {
    try {
      const params = { cardId, startDate, endDate }
      const response = await apiClient.get('/corporate-cards/analytics/spending-by-category', { params })
      return response.data.categories || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get spending by card
   */
  getSpendingByCard: async (startDate?: string, endDate?: string): Promise<Array<{ cardId: string; cardNumber: string; cardholderName: string; totalSpend: number }>> => {
    try {
      const params = { startDate, endDate }
      const response = await apiClient.get('/corporate-cards/analytics/spending-by-card', { params })
      return response.data.cards || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get monthly spending trend
   */
  getMonthlySpendingTrend: async (cardId?: string, months: number = 6): Promise<Array<{ month: string; amount: number }>> => {
    try {
      const params = { cardId, months }
      const response = await apiClient.get('/corporate-cards/analytics/monthly-trend', { params })
      return response.data.trend || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default corporateCardService
