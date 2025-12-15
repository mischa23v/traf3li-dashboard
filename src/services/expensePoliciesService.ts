/**
 * Expense Policies Service
 * Handles all expense policy configuration API calls
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

// ==================== API FUNCTIONS ====================

const expensePoliciesService = {
  // Get all expense policies
  getExpensePolicies: async (): Promise<ExpensePoliciesResponse> => {
    try {
      const response = await apiClient.get('/hr/expense-policies')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get single expense policy
  getExpensePolicy: async (id: string): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.get(`/hr/expense-policies/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get default policy
  getDefaultPolicy: async (): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.get('/hr/expense-policies/default')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create expense policy
  createExpensePolicy: async (data: CreateExpensePolicyData): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.post('/hr/expense-policies', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update expense policy
  updateExpensePolicy: async (id: string, data: UpdateExpensePolicyData): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.put(`/hr/expense-policies/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete expense policy
  deleteExpensePolicy: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/hr/expense-policies/${id}`)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Set default policy
  setDefaultPolicy: async (id: string): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.patch(`/hr/expense-policies/${id}/default`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Toggle policy status
  togglePolicyStatus: async (id: string): Promise<ExpensePolicy> => {
    try {
      const response = await apiClient.patch(`/hr/expense-policies/${id}/toggle-status`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Check policy compliance for expense claim
  checkCompliance: async (claimId: string): Promise<PolicyComplianceCheck> => {
    try {
      const response = await apiClient.post(`/hr/expense-claims/${claimId}/check-compliance`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
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
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

export default expensePoliciesService
