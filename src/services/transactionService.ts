/**
 * Transaction Service
 * Handles all financial transaction API calls
 *
 * NOTE: This is a standalone transaction service separate from financeService.ts
 * financeService.ts contains invoice/expense/payment/time tracking
 * This service handles general ledger transactions and account movements
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Transaction Interface
 */
export interface Transaction {
  _id: string
  transactionId: string
  userId: string | { firstName: string; lastName: string; _id: string }
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category: string
  subcategory?: string
  description: string
  paymentMethod?: string
  date: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  reference?: string
  invoiceId?: string
  expenseId?: string
  paymentId?: string
  caseId?: string
  clientId?: string
  bank?: string
  account?: string
  accountNumber?: string
  fromAccount?: string
  toAccount?: string
  attachments?: {
    fileName: string
    fileUrl: string
    fileType: string
  }[]
  notes?: string
  reconciled?: boolean
  reconciledAt?: string
  reconciledBy?: string
  tags?: string[]
  metadata?: any
  history?: {
    action: string
    performedBy: string
    timestamp: string
    details?: any
  }[]
  createdAt: string
  updatedAt: string
}

/**
 * Create Transaction Data
 */
export interface CreateTransactionData {
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category: string
  subcategory?: string
  description: string
  paymentMethod?: string
  date: string
  reference?: string
  invoiceId?: string
  expenseId?: string
  paymentId?: string
  caseId?: string
  clientId?: string
  bank?: string
  account?: string
  accountNumber?: string
  fromAccount?: string
  toAccount?: string
  notes?: string
  tags?: string[]
  metadata?: any
}

/**
 * Transaction Filters
 */
export interface TransactionFilters {
  type?: 'income' | 'expense' | 'transfer'
  category?: string
  status?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  paymentMethod?: string
  clientId?: string
  caseId?: string
  reconciled?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Transaction Balance
 */
export interface TransactionBalance {
  totalIncome: number
  totalExpense: number
  totalTransfers: number
  netBalance: number
  currentBalance: number
  asOfDate: string
}

/**
 * Transaction Summary
 */
export interface TransactionSummary {
  period: {
    startDate: string
    endDate: string
  }
  income: {
    total: number
    count: number
    byCategory: { category: string; amount: number; count: number }[]
  }
  expense: {
    total: number
    count: number
    byCategory: { category: string; amount: number; count: number }[]
  }
  transfers: {
    total: number
    count: number
  }
  netCashFlow: number
}

/**
 * Transactions by Category
 */
export interface TransactionsByCategory {
  category: string
  totalAmount: number
  transactionCount: number
  percentage: number
  transactions: Transaction[]
}

/**
 * Transaction Service Object
 */
const transactionService = {
  /**
   * Get all transactions
   * GET /api/transactions
   */
  getTransactions: async (
    filters?: TransactionFilters
  ): Promise<{ data: Transaction[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/transactions', { params: filters })
      return {
        data: response.data.transactions || response.data.data || [],
        pagination: response.data.pagination || {
          total: response.data.total || 0,
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
        },
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single transaction
   * GET /api/transactions/:id
   */
  getTransaction: async (id: string): Promise<Transaction> => {
    try {
      const response = await apiClient.get(`/transactions/${id}`)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create transaction
   * POST /api/transactions
   */
  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    try {
      const response = await apiClient.post('/transactions', data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update transaction
   * PUT /api/transactions/:id
   */
  updateTransaction: async (
    id: string,
    data: Partial<CreateTransactionData>
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.put(`/transactions/${id}`, data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete transaction
   * DELETE /api/transactions/:id
   */
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/transactions/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get account balance
   * GET /api/transactions/balance
   */
  getBalance: async (upToDate?: string): Promise<TransactionBalance> => {
    try {
      const response = await apiClient.get('/transactions/balance', {
        params: { upToDate },
      })
      return response.data.balance || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transaction summary
   * GET /api/transactions/summary
   */
  getSummary: async (filters?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month' | 'year'
  }): Promise<TransactionSummary> => {
    try {
      const response = await apiClient.get('/transactions/summary', {
        params: filters,
      })
      return response.data.summary || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transactions by category
   * GET /api/transactions/by-category
   */
  getTransactionsByCategory: async (filters?: {
    type?: 'income' | 'expense' | 'transfer'
    startDate?: string
    endDate?: string
  }): Promise<TransactionsByCategory[]> => {
    try {
      const response = await apiClient.get('/transactions/by-category', {
        params: filters,
      })
      return response.data.categories || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel transaction
   * POST /api/transactions/:id/cancel
   */
  cancelTransaction: async (id: string, reason?: string): Promise<Transaction> => {
    try {
      const response = await apiClient.post(`/transactions/${id}/cancel`, { reason })
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete transactions
   * DELETE /api/transactions/bulk
   */
  bulkDeleteTransactions: async (transactionIds: string[]): Promise<{ deleted: number }> => {
    try {
      const response = await apiClient.delete('/transactions/bulk', {
        data: { transactionIds },
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reconcile transaction
   * POST /api/transactions/:id/reconcile
   */
  reconcileTransaction: async (
    id: string,
    data?: { reconciledAt?: string; notes?: string }
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.post(`/transactions/${id}/reconcile`, data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unreconcile transaction
   * POST /api/transactions/:id/unreconcile
   */
  unreconcileTransaction: async (id: string): Promise<Transaction> => {
    try {
      const response = await apiClient.post(`/transactions/${id}/unreconcile`)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload attachment to transaction
   * POST /api/transactions/:id/attachments
   */
  uploadAttachment: async (id: string, file: File): Promise<Transaction> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/transactions/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete attachment from transaction
   * DELETE /api/transactions/:id/attachments/:attachmentId
   */
  deleteAttachment: async (id: string, attachmentId: string): Promise<Transaction> => {
    try {
      const response = await apiClient.delete(`/transactions/${id}/attachments/${attachmentId}`)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transaction categories
   * GET /api/transactions/categories
   */
  getCategories: async (type?: 'income' | 'expense' | 'transfer'): Promise<string[]> => {
    try {
      const response = await apiClient.get('/transactions/categories', {
        params: { type },
      })
      return response.data.categories || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export transactions
   * GET /api/transactions/export
   */
  exportTransactions: async (
    filters?: TransactionFilters,
    format: 'csv' | 'xlsx' | 'pdf' = 'xlsx'
  ): Promise<Blob> => {
    try {
      const response = await apiClient.get('/transactions/export', {
        params: { ...filters, format },
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pending transactions
   * GET /api/transactions/pending
   */
  getPendingTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get('/transactions/pending')
      return response.data.transactions || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get unreconciled transactions
   * GET /api/transactions/unreconciled
   */
  getUnreconciledTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get('/transactions/unreconciled')
      return response.data.transactions || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Search transactions
   * GET /api/transactions/search
   */
  searchTransactions: async (
    query: string,
    filters?: TransactionFilters
  ): Promise<{ data: Transaction[]; count: number }> => {
    try {
      const response = await apiClient.get('/transactions/search', {
        params: { q: query, ...filters },
      })
      return {
        data: response.data.transactions || response.data.data || [],
        count: response.data.count || response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transaction statistics
   * GET /api/transactions/stats
   */
  getStats: async (filters?: {
    startDate?: string
    endDate?: string
  }): Promise<{
    totalTransactions: number
    totalIncome: number
    totalExpense: number
    totalTransfers: number
    averageTransactionAmount: number
    largestTransaction: Transaction
    smallestTransaction: Transaction
    byType: { type: string; count: number; amount: number }[]
    byCategory: { category: string; count: number; amount: number }[]
    byPaymentMethod: { method: string; count: number; amount: number }[]
  }> => {
    try {
      const response = await apiClient.get('/transactions/stats', {
        params: filters,
      })
      return response.data.stats || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default transactionService
