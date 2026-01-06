/**
 * Expense Service
 * Handles expense management API calls
 * Uses ACTUAL backend endpoints: /api/expenses/*
 *
 * ⚠️ IMPORTANT: This service uses the actual backend endpoints
 * For HR expense claims (not implemented in backend), see expenseClaimsService.ts
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type ExpenseStatus = 'draft' | 'pending_approval' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed'
export type ExpenseCategory =
  | 'travel'
  | 'meals'
  | 'accommodation'
  | 'transportation'
  | 'office_supplies'
  | 'professional_services'
  | 'client_expenses'
  | 'court_fees'
  | 'filing_fees'
  | 'research'
  | 'expert_witness'
  | 'translation'
  | 'courier'
  | 'printing'
  | 'postage'
  | 'telecommunications'
  | 'government_fees'
  | 'marketing'
  | 'training'
  | 'software'
  | 'equipment'
  | 'other'

export type ExpenseType = 'reimbursable' | 'non_reimbursable' | 'billable' | 'non_billable'
export type BillingStatus = 'unbilled' | 'pending' | 'billed' | 'written_off'

export interface Expense {
  _id: string
  expenseId: string
  description: string
  descriptionAr?: string
  amount: number
  taxAmount?: number
  totalAmount?: number
  category: ExpenseCategory
  date: string
  status: ExpenseStatus
  employeeId?: string
  employeeName?: string
  caseId?: string
  clientId?: string
  receiptUrl?: string
  receiptNumber?: string
  currency?: string
  expenseType?: ExpenseType
  markupType?: 'percentage' | 'fixed' | 'none'
  markupValue?: number
  taxRate?: number
  taxReclaimable?: boolean
  vendorTaxNumber?: string
  vendor?: string
  vendorAr?: string
  travelDetails?: {
    origin?: string
    destination?: string
    purpose?: string
    distanceKm?: number
  }
  governmentReference?: string
  departmentId?: string
  locationId?: string
  projectId?: string
  costCenterId?: string
  firmId?: string
  lawyerId?: string
  hasReceipt?: boolean
  internalNotes?: string
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  reimbursementStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  reimbursedAmount?: number
  invoiceId?: string
  billingStatus?: BillingStatus
  updatedBy?: string
  reimbursementDetails?: {
    method: string
    reference?: string
    date?: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseData {
  description: string
  descriptionAr?: string
  amount: number
  category: ExpenseCategory
  date: string
  employeeId?: string
  caseId?: string
  clientId?: string
  notes?: string
}

export interface UpdateExpenseData {
  description?: string
  descriptionAr?: string
  amount?: number
  category?: ExpenseCategory
  date?: string
  caseId?: string
  clientId?: string
  notes?: string
}

export interface ExpenseFilters {
  status?: ExpenseStatus
  category?: ExpenseCategory
  caseId?: string
  clientId?: string
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface ExpenseStats {
  total: number
  byStatus: Array<{ status: ExpenseStatus; count: number; amount: number }>
  byCategory: Array<{ category: ExpenseCategory; count: number; amount: number }>
  totalAmount: number
  approvedAmount: number
  pendingAmount: number
  reimbursedAmount: number
}

// ==================== ERROR MESSAGES (BILINGUAL) ====================

const ERROR_MESSAGES = {
  FETCH_FAILED: {
    en: 'Failed to fetch expenses',
    ar: 'فشل في جلب المصروفات'
  },
  CREATE_FAILED: {
    en: 'Failed to create expense',
    ar: 'فشل في إنشاء المصروف'
  },
  UPDATE_FAILED: {
    en: 'Failed to update expense',
    ar: 'فشل في تحديث المصروف'
  },
  DELETE_FAILED: {
    en: 'Failed to delete expense',
    ar: 'فشل في حذف المصروف'
  },
  REIMBURSE_FAILED: {
    en: 'Failed to mark expense as reimbursed',
    ar: 'فشل في وضع علامة على المصروف كمسدد'
  },
  UPLOAD_RECEIPT_FAILED: {
    en: 'Failed to upload receipt',
    ar: 'فشل في رفع الإيصال'
  },
  STATS_FAILED: {
    en: 'Failed to fetch expense statistics',
    ar: 'فشل في جلب إحصائيات المصروفات'
  },
  NOT_FOUND: {
    en: 'Expense not found',
    ar: 'المصروف غير موجود'
  },
  INVALID_DATA: {
    en: 'Invalid expense data',
    ar: 'بيانات المصروف غير صالحة'
  },
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك'
  },
  UNKNOWN_ERROR: {
    en: 'An unexpected error occurred',
    ar: 'حدث خطأ غير متوقع'
  }
}

/**
 * Format bilingual error message
 */
const formatBilingualError = (errorKey: keyof typeof ERROR_MESSAGES, details?: string): string => {
  const message = ERROR_MESSAGES[errorKey]
  const bilingual = `${message.en} | ${message.ar}`
  return details ? `${bilingual}\n${details}` : bilingual
}

/**
 * Handle API error with bilingual messages
 */
const handleExpenseError = (error: any, errorKey: keyof typeof ERROR_MESSAGES): never => {
  // If error already has a message, use it (API might return bilingual message)
  if (error?.message) {
    throw new Error(error.message)
  }

  // If it's a network error
  if (error?.status === 0 || error?.code === 'CANCELLED' || error?.code === 'NETWORK_ERROR') {
    throw new Error(formatBilingualError('NETWORK_ERROR'))
  }

  // If it's a 404
  if (error?.status === 404) {
    throw new Error(formatBilingualError('NOT_FOUND'))
  }

  // If it's a 400 (validation error)
  if (error?.status === 400) {
    const details = error?.errors?.map((e: any) => `${e.field}: ${e.message}`).join(', ')
    throw new Error(formatBilingualError('INVALID_DATA', details))
  }

  // Default error with backend message if available
  const backendMessage = handleApiError(error)
  throw new Error(`${formatBilingualError(errorKey)}\n${backendMessage}`)
}

// ==================== API FUNCTIONS ====================

const expenseService = {
  /**
   * Get all expenses
   * GET /api/expenses
   */
  getExpenses: async (filters?: ExpenseFilters): Promise<{ expenses: Expense[]; total: number }> => {
    try {
      const response = await apiClient.get('/expenses', { params: filters })
      return {
        expenses: response.data.expenses || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      handleExpenseError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get single expense by ID
   * GET /api/expenses/:id
   */
  getExpense: async (id: string): Promise<Expense> => {
    try {
      const response = await apiClient.get(`/expenses/${id}`)
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Create new expense
   * POST /api/expenses
   */
  createExpense: async (data: CreateExpenseData): Promise<Expense> => {
    try {
      const response = await apiClient.post('/expenses', data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'CREATE_FAILED')
    }
  },

  /**
   * Update expense
   * PUT /api/expenses/:id
   */
  updateExpense: async (id: string, data: UpdateExpenseData): Promise<Expense> => {
    try {
      const response = await apiClient.put(`/expenses/${id}`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Delete expense
   * DELETE /api/expenses/:id
   */
  deleteExpense: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/expenses/${id}`)
    } catch (error: any) {
      handleExpenseError(error, 'DELETE_FAILED')
    }
  },

  /**
   * Mark expense as reimbursed
   * POST /api/expenses/:id/reimburse
   */
  markAsReimbursed: async (
    id: string,
    data?: { paymentMethod?: string; reference?: string }
  ): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/reimburse`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'REIMBURSE_FAILED')
    }
  },

  /**
   * Upload receipt for expense
   * POST /api/expenses/:id/receipt
   */
  uploadReceipt: async (id: string, file: File): Promise<Expense> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(`/expenses/${id}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'UPLOAD_RECEIPT_FAILED')
    }
  },

  /**
   * Get expense statistics
   * GET /api/expenses/stats
   */
  getExpenseStats: async (filters?: {
    startDate?: string
    endDate?: string
    caseId?: string
    employeeId?: string
  }): Promise<ExpenseStats> => {
    try {
      const response = await apiClient.get('/expenses/stats', { params: filters })
      return response.data.stats || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'STATS_FAILED')
    }
  },

  /**
   * Get expenses by category
   * GET /api/expenses/by-category
   */
  getExpensesByCategory: async (filters?: {
    startDate?: string
    endDate?: string
    caseId?: string
  }): Promise<Array<{ category: ExpenseCategory; total: number; count: number }>> => {
    try {
      const response = await apiClient.get('/expenses/by-category', { params: filters })
      return response.data.data || response.data
    } catch (error: any) {
      handleExpenseError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Submit expense for approval
   * POST /api/expenses/:id/submit
   */
  submitForApproval: async (id: string): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/submit`)
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Approve expense
   * POST /api/expenses/:id/approve
   */
  approveExpense: async (id: string, data?: { notes?: string }): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/approve`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Reject expense
   * POST /api/expenses/:id/reject
   */
  rejectExpense: async (id: string, data: { reason: string }): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/reject`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      handleExpenseError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Bulk approve expenses
   * POST /api/expenses/bulk-approve
   */
  bulkApprove: async (ids: string[]): Promise<{ approved: number; failed: number }> => {
    try {
      const response = await apiClient.post('/expenses/bulk-approve', { ids })
      return response.data
    } catch (error: any) {
      handleExpenseError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Bulk delete expenses
   * POST /api/expenses/bulk-delete
   */
  bulkDelete: async (ids: string[]): Promise<{ deletedCount: number }> => {
    try {
      const response = await apiClient.post('/expenses/bulk-delete', { ids })
      return response.data
    } catch (error: any) {
      handleExpenseError(error, 'DELETE_FAILED')
    }
  },

  /**
   * Suggest category using AI
   * POST /api/expenses/suggest-category
   */
  suggestCategory: async (description: string): Promise<{ category: ExpenseCategory; confidence: number }> => {
    try {
      const response = await apiClient.post('/expenses/suggest-category', { description })
      return response.data.data || response.data
    } catch (error: any) {
      handleExpenseError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get expense categories list
   * GET /api/expenses/categories
   */
  getCategories: async (): Promise<ExpenseCategory[]> => {
    try {
      const response = await apiClient.get('/expenses/categories')
      return response.data.categories || response.data.data || response.data
    } catch (error: any) {
      handleExpenseError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get new expense defaults
   * GET /api/expenses/new
   */
  getNewExpenseDefaults: async (): Promise<Partial<Expense>> => {
    try {
      const response = await apiClient.get('/expenses/new')
      return response.data.defaults || response.data.data || response.data
    } catch (error: any) {
      handleExpenseError(error, 'FETCH_FAILED')
    }
  },
}

export default expenseService

// Named exports for convenience
export const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  markAsReimbursed,
  uploadReceipt,
  getExpenseStats,
  getExpensesByCategory,
  submitForApproval,
  approveExpense,
  rejectExpense,
  bulkApprove,
  bulkDelete,
  suggestCategory,
  getCategories,
  getNewExpenseDefaults,
} = expenseService
