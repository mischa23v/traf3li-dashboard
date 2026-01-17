/**
 * Budget Service
 * Handles budget management API calls
 *
 * API Endpoints: /api/budgets/*
 *
 * Features:
 * - CRUD operations for budgets
 * - Budget line management
 * - Budget vs actual reporting
 * - Budget checking for expense validation
 * - Approval workflow
 * - Monthly distribution
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  Budget,
  BudgetFilters,
  CreateBudgetData,
  UpdateBudgetData,
  UpdateBudgetLineData,
  BudgetCheckRequest,
  BudgetCheckResult,
  BudgetStats,
  BudgetVsActualReport,
  DistributionMethod,
  BudgetListResponse,
  BudgetResponse,
  BudgetStatsResponse,
  BudgetVsActualResponse,
} from '@/types/budget'

// ==================== API RESPONSE TYPES ====================

interface BackendResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ==================== SERVICE FUNCTIONS ====================

/**
 * Get all budgets with filtering
 * API Endpoint: GET /api/budgets
 */
const getAllBudgets = async (filters?: BudgetFilters): Promise<BudgetListResponse> => {
  try {
    const params = new URLSearchParams()
    if (filters?.fiscalYear) params.append('fiscalYear', filters.fiscalYear)
    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      statuses.forEach(s => params.append('status', s))
    }
    if (filters?.costCenterId) params.append('costCenterId', filters.costCenterId)
    if (filters?.departmentId) params.append('departmentId', filters.departmentId)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = queryString ? `/budgets?${queryString}` : '/budgets'

    const response = await apiClient.get<BackendResponse<Budget[]>>(url)
    return {
      budgets: response.data.data || [],
      total: response.data.pagination?.total || response.data.data?.length || 0,
      page: response.data.pagination?.page || filters?.page || 1,
      limit: response.data.pagination?.limit || filters?.limit || 10,
      hasMore: response.data.pagination
        ? response.data.pagination.page < response.data.pagination.pages
        : false,
    }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Get single budget by ID
 * API Endpoint: GET /api/budgets/:id
 */
const getBudgetById = async (id: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.get<BackendResponse<Budget>>(`/budgets/${id}`)
    if (!response.data.data) {
      throw new Error('Budget not found')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Create new budget
 * API Endpoint: POST /api/budgets
 */
const createBudget = async (data: CreateBudgetData): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>('/budgets', data)
    if (!response.data.data) {
      throw new Error('Failed to create budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Update budget
 * API Endpoint: PATCH /api/budgets/:id
 */
const updateBudget = async (id: string, data: UpdateBudgetData): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.patch<BackendResponse<Budget>>(`/budgets/${id}`, data)
    if (!response.data.data) {
      throw new Error('Failed to update budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Delete budget
 * API Endpoint: DELETE /api/budgets/:id
 */
const deleteBudget = async (id: string): Promise<{ success: boolean }> => {
  try {
    await apiClient.delete(`/budgets/${id}`)
    return { success: true }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Submit budget for approval
 * API Endpoint: POST /api/budgets/:id/submit
 */
const submitForApproval = async (id: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>(`/budgets/${id}/submit`)
    if (!response.data.data) {
      throw new Error('Failed to submit budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Approve budget
 * API Endpoint: POST /api/budgets/:id/approve
 */
const approveBudget = async (id: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>(`/budgets/${id}/approve`)
    if (!response.data.data) {
      throw new Error('Failed to approve budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Reject budget
 * API Endpoint: POST /api/budgets/:id/reject
 */
const rejectBudget = async (id: string, reason: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>(`/budgets/${id}/reject`, {
      reason,
    })
    if (!response.data.data) {
      throw new Error('Failed to reject budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Activate budget
 * API Endpoint: POST /api/budgets/:id/activate
 */
const activateBudget = async (id: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>(`/budgets/${id}/activate`)
    if (!response.data.data) {
      throw new Error('Failed to activate budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Close budget
 * API Endpoint: POST /api/budgets/:id/close
 */
const closeBudget = async (id: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>(`/budgets/${id}/close`)
    if (!response.data.data) {
      throw new Error('Failed to close budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Get budget lines
 * API Endpoint: GET /api/budgets/:id/lines
 */
const getBudgetLines = async (budgetId: string) => {
  try {
    const response = await apiClient.get<BackendResponse<Budget['lines']>>(
      `/budgets/${budgetId}/lines`
    )
    return { lines: response.data.data || [] }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Add budget line
 * API Endpoint: POST /api/budgets/:budgetId/lines
 */
const addBudgetLine = async (
  budgetId: string,
  data: Omit<UpdateBudgetLineData, '_id'>
) => {
  try {
    const response = await apiClient.post<BackendResponse<Budget['lines'][0]>>(
      `/budgets/${budgetId}/lines`,
      data
    )
    return { line: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Update budget line
 * API Endpoint: PATCH /api/budgets/:budgetId/lines/:lineId
 */
const updateBudgetLine = async (
  budgetId: string,
  lineId: string,
  data: UpdateBudgetLineData
) => {
  try {
    const response = await apiClient.patch<BackendResponse<Budget['lines'][0]>>(
      `/budgets/${budgetId}/lines/${lineId}`,
      data
    )
    return { line: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Delete budget line
 * API Endpoint: DELETE /api/budgets/:budgetId/lines/:lineId
 */
const deleteBudgetLine = async (budgetId: string, lineId: string) => {
  try {
    await apiClient.delete(`/budgets/${budgetId}/lines/${lineId}`)
    return { success: true }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Get budget statistics
 * API Endpoint: GET /api/budgets/stats
 */
const getBudgetStats = async (fiscalYear?: string): Promise<BudgetStatsResponse> => {
  try {
    const params = fiscalYear ? { fiscalYear } : undefined
    const response = await apiClient.get<BackendResponse<BudgetStats>>('/budgets/stats', {
      params,
    })
    if (!response.data.data) {
      throw new Error('Failed to get budget statistics')
    }
    return { stats: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Get budget vs actual report
 * API Endpoint: GET /api/budgets/:id/vs-actual
 */
const getBudgetVsActual = async (budgetId: string): Promise<BudgetVsActualResponse> => {
  try {
    const response = await apiClient.get<BackendResponse<BudgetVsActualReport>>(
      `/budgets/${budgetId}/vs-actual`
    )
    if (!response.data.data) {
      throw new Error('Failed to get budget vs actual report')
    }
    return { report: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Check if expense is within budget
 * API Endpoint: POST /api/budgets/check
 */
const checkBudget = async (request: BudgetCheckRequest): Promise<BudgetCheckResult> => {
  try {
    const response = await apiClient.post<BackendResponse<BudgetCheckResult>>(
      '/budgets/check',
      request
    )
    if (!response.data.data) {
      // Return a default "no budget" response if no data
      return {
        allowed: true,
        action: 'ignore',
        budgetedAmount: 0,
        usedAmount: 0,
        availableAmount: 0,
        requestedAmount: request.amount,
        message: 'No budget configured for this expense',
        messageAr: 'لا توجد ميزانية محددة لهذا المصروف',
      }
    }
    return response.data.data
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Generate monthly distribution
 * API Endpoint: POST /api/budgets/:id/distribution
 */
const generateMonthlyDistribution = async (
  budgetId: string,
  method: DistributionMethod
): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>(
      `/budgets/${budgetId}/distribution`,
      { method }
    )
    if (!response.data.data) {
      throw new Error('Failed to generate monthly distribution')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Duplicate budget for new fiscal year
 * API Endpoint: POST /api/budgets/:id/duplicate
 */
const duplicateBudget = async (id: string, newFiscalYear: string): Promise<BudgetResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<Budget>>(`/budgets/${id}/duplicate`, {
      fiscalYear: newFiscalYear,
    })
    if (!response.data.data) {
      throw new Error('Failed to duplicate budget')
    }
    return { budget: response.data.data }
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Get budgets by fiscal year
 * API Endpoint: GET /api/budgets?fiscalYear=:year
 */
const getBudgetsByFiscalYear = async (fiscalYear: string): Promise<Budget[]> => {
  try {
    const response = await getAllBudgets({ fiscalYear })
    return response.budgets
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

/**
 * Get active budgets
 * API Endpoint: GET /api/budgets?status=active
 */
const getActiveBudgets = async (): Promise<Budget[]> => {
  try {
    const response = await getAllBudgets({ status: 'active' })
    return response.budgets
  } catch (error: unknown) {
    throw new Error(handleApiError(error))
  }
}

// ==================== EXPORT ====================

const budgetService = {
  // CRUD
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  // Workflow
  submitForApproval,
  approveBudget,
  rejectBudget,
  activateBudget,
  closeBudget,
  // Lines
  getBudgetLines,
  addBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  // Reports & Stats
  getBudgetStats,
  getBudgetVsActual,
  checkBudget,
  // Utilities
  generateMonthlyDistribution,
  duplicateBudget,
  getBudgetsByFiscalYear,
  getActiveBudgets,
}

export default budgetService
