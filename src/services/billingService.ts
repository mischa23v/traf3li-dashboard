/**
 * Billing Service
 * Handles subscription, payment methods, and billing history operations
 */

import apiClient, { handleApiError } from '@/lib/api'
import type { PlanId } from '@/config/plans'

// ==================== SUBSCRIPTION ====================

export interface Subscription {
  _id: string
  firmId: string
  plan: PlanId
  status: 'active' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  billingCycle: 'monthly' | 'annual'
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface UsageMetrics {
  users: {
    current: number
    limit: number
    percentage: number
  }
  storage: {
    current: number // in MB
    limit: number // in MB
    percentage: number
  }
  cases: {
    current: number
    limit: number
    percentage: number
  }
  clients: {
    current: number
    limit: number
    percentage: number
  }
  documents: {
    current: number
    limit: number
    percentage: number
  }
  apiCalls: {
    current: number
    limit: number
    percentage: number
  }
}

export interface ChangePlanData {
  plan: PlanId
  billingCycle: 'monthly' | 'annual'
}

// ==================== PAYMENT METHODS ====================

export interface PaymentMethod {
  _id: string
  firmId: string
  type: 'card' | 'bank_account'
  isDefault: boolean
  card?: {
    brand: string // visa, mastercard, amex, etc.
    last4: string
    expMonth: number
    expYear: number
    funding: 'credit' | 'debit' | 'prepaid'
  }
  bankAccount?: {
    bankName: string
    last4: string
    accountType: 'checking' | 'savings'
  }
  billingDetails: {
    name: string
    email?: string
    phone?: string
    address?: {
      line1: string
      line2?: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
  }
  createdAt: string
}

export interface CreatePaymentMethodData {
  paymentMethodId: string // Stripe payment method ID
  isDefault?: boolean
}

// ==================== BILLING HISTORY ====================

export interface Invoice {
  _id: string
  firmId: string
  invoiceNumber: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  dueDate: string
  paidAt?: string
  description: string
  plan: PlanId
  billingPeriod: {
    start: string
    end: string
  }
  paymentMethod?: {
    type: string
    last4: string
  }
  downloadUrl?: string
  createdAt: string
  updatedAt: string
}

export interface BillingHistoryFilters {
  page?: number
  limit?: number
  status?: Invoice['status']
  startDate?: string
  endDate?: string
}

export interface BillingHistoryResponse {
  invoices: Invoice[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ==================== UPCOMING INVOICE ====================

export interface UpcomingInvoice {
  amount: number
  currency: string
  dueDate: string
  plan: PlanId
  billingCycle: 'monthly' | 'annual'
  prorationAmount?: number
  description: string
}

const billingService = {
  // ==================== SUBSCRIPTION ====================

  /**
   * Get current subscription details
   */
  getSubscription: async (): Promise<Subscription> => {
    try {
      const response = await apiClient.get('/billing/subscription')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get usage metrics for current plan
   */
  getUsageMetrics: async (): Promise<UsageMetrics> => {
    try {
      const response = await apiClient.get('/billing/usage')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Change subscription plan
   */
  changePlan: async (data: ChangePlanData): Promise<Subscription> => {
    try {
      const response = await apiClient.post('/billing/subscription/change-plan', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Cancel subscription (at end of current period)
   */
  cancelSubscription: async (): Promise<Subscription> => {
    try {
      const response = await apiClient.post('/billing/subscription/cancel')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Reactivate canceled subscription
   */
  reactivateSubscription: async (): Promise<Subscription> => {
    try {
      const response = await apiClient.post('/billing/subscription/reactivate')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get upcoming invoice preview
   */
  getUpcomingInvoice: async (planId?: PlanId): Promise<UpcomingInvoice> => {
    try {
      const params = planId ? { plan: planId } : {}
      const response = await apiClient.get('/billing/subscription/upcoming-invoice', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== PAYMENT METHODS ====================

  /**
   * Get all payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await apiClient.get('/billing/payment-methods')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Add new payment method
   */
  addPaymentMethod: async (data: CreatePaymentMethodData): Promise<PaymentMethod> => {
    try {
      const response = await apiClient.post('/billing/payment-methods', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    try {
      const response = await apiClient.patch(`/billing/payment-methods/${id}/set-default`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Remove payment method
   */
  removePaymentMethod: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/payment-methods/${id}`)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create Stripe setup intent for adding payment method
   */
  createSetupIntent: async (): Promise<{ clientSecret: string }> => {
    try {
      const response = await apiClient.post('/billing/payment-methods/setup-intent')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== BILLING HISTORY ====================

  /**
   * Get billing history with pagination and filters
   */
  getBillingHistory: async (filters?: BillingHistoryFilters): Promise<BillingHistoryResponse> => {
    try {
      const response = await apiClient.get('/billing/invoices', { params: filters })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get single invoice by ID
   */
  getInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.get(`/billing/invoices/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Download invoice PDF
   */
  downloadInvoice: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/billing/invoices/${id}/download`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Pay outstanding invoice
   */
  payInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/billing/invoices/${id}/pay`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default billingService
