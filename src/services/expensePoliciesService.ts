/**
 * Expense Policies Service
 * Handles all expense policy configuration API calls
 *
 * ⚠️ WARNING: Backend Endpoint Mismatch
 *
 * This service uses /hr/expense-policies/* endpoints which DO NOT exist in the backend.
 * These endpoints will fail with 404 errors until backend implements them:
 * - GET /hr/expense-policies
 * - GET /hr/expense-policies/:id
 * - POST /hr/expense-policies
 * - PUT /hr/expense-policies/:id
 * - DELETE /hr/expense-policies/:id
 * - And all other expense policy endpoints
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface ExpensePolicy {
  _id: string
  name: string
  nameAr: string
  isActive: boolean
  isDefault: boolean

  // Daily limits by category
  dailyLimits: {
    meals: number
    transportation: number
    accommodation: number
    other: number
  }

  // Receipt requirements
  receiptRequired: {
    threshold: number  // Amount above which receipt required
    categories: string[]  // Categories always requiring receipt
  }

  // Approval thresholds
  approvalThresholds: {
    level1: number  // Manager approval
    level2: number  // Director approval
    level3: number  // Executive approval
  }

  // Travel policies
  travelPolicies: {
    domesticPerDiem: number
    internationalPerDiem: number
    maxHotelRate: number
    allowedTravelClasses: string[]
    advanceBookingDays: number
  }

  // Mileage rates
  mileageRates: {
    personalCar: number
    companyCar: number
    rental: number
  }

  // Restrictions
  restrictions: {
    maxSingleExpense: number
    maxMonthlyTotal: number
    blockedCategories: string[]
    blockedVendors: string[]
  }

  createdAt: string
  updatedAt: string
}

export interface CreateExpensePolicyData {
  name: string
  nameAr: string
  isActive?: boolean
  isDefault?: boolean
  dailyLimits: {
    meals: number
    transportation: number
    accommodation: number
    other: number
  }
  receiptRequired: {
    threshold: number
    categories: string[]
  }
  approvalThresholds: {
    level1: number
    level2: number
    level3: number
  }
  travelPolicies: {
    domesticPerDiem: number
    internationalPerDiem: number
    maxHotelRate: number
    allowedTravelClasses: string[]
    advanceBookingDays: number
  }
  mileageRates: {
    personalCar: number
    companyCar: number
    rental: number
  }
  restrictions: {
    maxSingleExpense: number
    maxMonthlyTotal: number
    blockedCategories: string[]
    blockedVendors: string[]
  }
}

export interface UpdateExpensePolicyData {
  name?: string
  nameAr?: string
  isActive?: boolean
  isDefault?: boolean
  dailyLimits?: {
    meals?: number
    transportation?: number
    accommodation?: number
    other?: number
  }
  receiptRequired?: {
    threshold?: number
    categories?: string[]
  }
  approvalThresholds?: {
    level1?: number
    level2?: number
    level3?: number
  }
  travelPolicies?: {
    domesticPerDiem?: number
    internationalPerDiem?: number
    maxHotelRate?: number
    allowedTravelClasses?: string[]
    advanceBookingDays?: number
  }
  mileageRates?: {
    personalCar?: number
    companyCar?: number
    rental?: number
  }
  restrictions?: {
    maxSingleExpense?: number
    maxMonthlyTotal?: number
    blockedCategories?: string[]
    blockedVendors?: string[]
  }
}

export interface ExpensePoliciesResponse {
  policies: ExpensePolicy[]
  total: number
}

export interface PolicyComplianceCheck {
  compliant: boolean
  violations: Array<{
    violationType: string
    violationTypeAr: string
    description: string
    descriptionAr: string
    severity: 'warning' | 'violation' | 'exception_required'
    lineItemId?: string
    amount?: number
    limit?: number
  }>
  policyId: string
  policyName: string
}

// ==================== ERROR MESSAGES (BILINGUAL) ====================

const ERROR_MESSAGES = {
  ENDPOINT_NOT_IMPLEMENTED: {
    en: 'Expense policies feature is not yet implemented in the backend',
    ar: 'ميزة سياسات المصروفات غير مطبقة بعد في الخادم'
  },
  FETCH_FAILED: {
    en: 'Failed to fetch expense policies',
    ar: 'فشل في جلب سياسات المصروفات'
  },
  CREATE_FAILED: {
    en: 'Failed to create expense policy',
    ar: 'فشل في إنشاء سياسة المصروف'
  },
  UPDATE_FAILED: {
    en: 'Failed to update expense policy',
    ar: 'فشل في تحديث سياسة المصروف'
  },
  DELETE_FAILED: {
    en: 'Failed to delete expense policy',
    ar: 'فشل في حذف سياسة المصروف'
  },
  COMPLIANCE_CHECK_FAILED: {
    en: 'Failed to check policy compliance',
    ar: 'فشل في التحقق من الامتثال للسياسة'
  },
  NOT_FOUND: {
    en: 'Expense policy not found',
    ar: 'سياسة المصروف غير موجودة'
  },
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك'
  },
  INVALID_DATA: {
    en: 'Invalid expense policy data',
    ar: 'بيانات سياسة المصروف غير صالحة'
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
const handlePolicyError = (error: any, errorKey: keyof typeof ERROR_MESSAGES): never => {
  // If it's a 404, it's likely the endpoint doesn't exist
  if (error?.status === 404) {
    throw new Error(formatBilingualError('ENDPOINT_NOT_IMPLEMENTED'))
  }

  // If error already has a message, use it
  if (error?.message) {
    throw new Error(error.message)
  }

  // If it's a network error
  if (error?.status === 0 || error?.code === 'CANCELLED' || error?.code === 'NETWORK_ERROR') {
    throw new Error(formatBilingualError('NETWORK_ERROR'))
  }

  // If it's a 400 (validation error)
  if (error?.status === 400) {
    const details = error?.errors?.map((e: any) => `${e.field}: ${e.message}`).join(', ')
    throw new Error(formatBilingualError('INVALID_DATA', details))
  }

  // Default error with backend message
  const backendMessage = handleApiError(error)
  throw new Error(`${formatBilingualError(errorKey)}\n${backendMessage}`)
}

// ==================== API FUNCTIONS ====================

const expensePoliciesService = {
  // Get all expense policies
  getExpensePolicies: async (): Promise<ExpensePoliciesResponse> => {
    try {
      const response = await apiClient.get('/hr/expense-policies')
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'FETCH_FAILED')
    }
  },

  // Get single expense policy
  getExpensePolicy: async (id: string): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.get(`/hr/expense-policies/${id}`)
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'FETCH_FAILED')
    }
  },

  // Get default policy
  getDefaultPolicy: async (): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.get('/hr/expense-policies/default')
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'FETCH_FAILED')
    }
  },

  // Create expense policy
  createExpensePolicy: async (data: CreateExpensePolicyData): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.post('/hr/expense-policies', data)
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'CREATE_FAILED')
    }
  },

  // Update expense policy
  updateExpensePolicy: async (id: string, data: UpdateExpensePolicyData): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.put(`/hr/expense-policies/${id}`, data)
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'UPDATE_FAILED')
    }
  },

  // Delete expense policy
  deleteExpensePolicy: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/hr/expense-policies/${id}`)
    } catch (error: any) {
      handlePolicyError(error, 'DELETE_FAILED')
    }
  },

  // Set default policy
  setDefaultPolicy: async (id: string): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.patch(`/hr/expense-policies/${id}/default`)
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'UPDATE_FAILED')
    }
  },

  // Toggle policy status
  togglePolicyStatus: async (id: string): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.patch(`/hr/expense-policies/${id}/toggle-status`)
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'UPDATE_FAILED')
    }
  },

  // Check policy compliance for expense claim
  checkCompliance: async (claimId: string): Promise<PolicyComplianceCheck> => {
    try {
      const response = await apiClient.post(`/hr/expense-claims/${claimId}/check-compliance`)
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'COMPLIANCE_CHECK_FAILED')
    }
  },

  // Duplicate policy
  duplicatePolicy: async (id: string, newName: string, newNameAr: string): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.post(`/hr/expense-policies/${id}/duplicate`, {
        name: newName,
        nameAr: newNameAr
      })
      return response.data
    } catch (error: any) {
      handlePolicyError(error, 'CREATE_FAILED')
    }
  }
}

export default expensePoliciesService
