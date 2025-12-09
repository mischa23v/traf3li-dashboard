/**
 * Recurring Transaction Service
 * Handles recurring billing and payment transactions
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== INTERFACES ====================
 */

/**
 * Recurring Transaction data structure
 */
export interface RecurringTransaction {
  _id: string
  transactionId: string
  type: 'income' | 'expense'
  clientId?: string | { firstName: string; lastName: string; _id: string }
  vendorId?: string
  caseId?: string | { caseNumber: string; title: string; _id: string }

  // Financial details
  amount: number
  currency?: string
  description: string
  category?: string

  // Recurrence settings
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate?: string
  nextRunDate: string
  lastRunDate?: string

  // Status
  status: 'active' | 'paused' | 'cancelled' | 'completed'

  // Execution details
  totalOccurrences?: number
  currentOccurrence: number
  maxOccurrences?: number

  // Generated transactions
  generatedTransactions?: string[]

  // Metadata
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Create recurring transaction data
 */
export interface CreateRecurringTransactionData {
  type: 'income' | 'expense'
  clientId?: string
  vendorId?: string
  caseId?: string
  amount: number
  currency?: string
  description: string
  category?: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate?: string
  maxOccurrences?: number
  notes?: string
  tags?: string[]
}

/**
 * Update recurring transaction data
 */
export interface UpdateRecurringTransactionData {
  amount?: number
  description?: string
  category?: string
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  endDate?: string
  maxOccurrences?: number
  notes?: string
  tags?: string[]
}

/**
 * Recurring transaction filters
 */
export interface RecurringTransactionFilters {
  status?: string
  type?: string
  clientId?: string
  caseId?: string
  frequency?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/**
 * Upcoming transaction
 */
export interface UpcomingTransaction {
  recurringTransactionId: string
  scheduledDate: string
  amount: number
  description: string
  type: 'income' | 'expense'
}

/**
 * Generic API Response
 */
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/**
 * Paginated API Response
 */
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * ==================== RECURRING TRANSACTION SERVICE ====================
 */

const recurringTransactionService = {
  /**
   * Get all recurring transactions (with filters)
   * GET /api/recurring-transactions
   */
  getRecurringTransactions: async (
    filters?: RecurringTransactionFilters
  ): Promise<{ transactions: RecurringTransaction[]; pagination?: any }> => {
    try {
      const response = await apiClient.get<PaginatedResponse<RecurringTransaction>>(
        '/recurring-transactions',
        { params: filters }
      )
      return {
        transactions: response.data.data,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get upcoming transactions
   * GET /api/recurring-transactions/upcoming
   */
  getUpcomingTransactions: async (
    params?: { days?: number }
  ): Promise<UpcomingTransaction[]> => {
    try {
      const response = await apiClient.get<ApiResponse<UpcomingTransaction[]>>(
        '/recurring-transactions/upcoming',
        { params }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Process due transactions (manual trigger)
   * POST /api/recurring-transactions/process-due
   */
  processDueTransactions: async (): Promise<any> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/recurring-transactions/process-due'
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single recurring transaction
   * GET /api/recurring-transactions/:id
   */
  getRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    try {
      const response = await apiClient.get<ApiResponse<RecurringTransaction>>(
        `/recurring-transactions/${id}`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create recurring transaction
   * POST /api/recurring-transactions
   */
  createRecurringTransaction: async (
    data: CreateRecurringTransactionData
  ): Promise<RecurringTransaction> => {
    try {
      const response = await apiClient.post<ApiResponse<RecurringTransaction>>(
        '/recurring-transactions',
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update recurring transaction
   * PUT /api/recurring-transactions/:id
   */
  updateRecurringTransaction: async (
    id: string,
    data: UpdateRecurringTransactionData
  ): Promise<RecurringTransaction> => {
    try {
      const response = await apiClient.put<ApiResponse<RecurringTransaction>>(
        `/recurring-transactions/${id}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pause recurring transaction
   * POST /api/recurring-transactions/:id/pause
   */
  pauseRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    try {
      const response = await apiClient.post<ApiResponse<RecurringTransaction>>(
        `/recurring-transactions/${id}/pause`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resume recurring transaction
   * POST /api/recurring-transactions/:id/resume
   */
  resumeRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    try {
      const response = await apiClient.post<ApiResponse<RecurringTransaction>>(
        `/recurring-transactions/${id}/resume`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel recurring transaction
   * POST /api/recurring-transactions/:id/cancel
   */
  cancelRecurringTransaction: async (id: string): Promise<RecurringTransaction> => {
    try {
      const response = await apiClient.post<ApiResponse<RecurringTransaction>>(
        `/recurring-transactions/${id}/cancel`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate transaction manually (skip schedule)
   * POST /api/recurring-transactions/:id/generate
   */
  generateTransaction: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/recurring-transactions/${id}/generate`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default recurringTransactionService
