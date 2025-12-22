/**
 * Billing Service
 * Handles subscription, payment methods, and billing history operations
 *
 * ⚠️ STRIPE INTEGRATION STATUS: INCOMPLETE (STUB IMPLEMENTATION)
 *
 * This service defines the API contract for billing operations, but the backend
 * Stripe integration is not yet fully implemented. Current implementation serves
 * as a stub/interface definition for future development.
 *
 * EXPECTED BACKEND ENDPOINTS:
 *
 * Subscription Management:
 * - GET    /billing/subscription              - Get current subscription details
 * - GET    /billing/usage                     - Get usage metrics for current plan
 * - POST   /billing/subscription/change-plan  - Change subscription plan
 * - POST   /billing/subscription/cancel       - Cancel subscription at period end
 * - POST   /billing/subscription/reactivate   - Reactivate canceled subscription
 * - GET    /billing/subscription/upcoming-invoice - Preview upcoming invoice
 *
 * Payment Methods (Requires Stripe Elements integration):
 * - GET    /billing/payment-methods           - List all payment methods
 * - POST   /billing/payment-methods           - Add new payment method (requires Stripe paymentMethodId)
 * - PATCH  /billing/payment-methods/:id/set-default - Set default payment method
 * - DELETE /billing/payment-methods/:id       - Remove payment method
 * - POST   /billing/payment-methods/setup-intent - Create Stripe SetupIntent for adding payment methods
 *
 * Billing History:
 * - GET    /billing/invoices                  - Get invoice history with pagination
 * - GET    /billing/invoices/:id              - Get single invoice details
 * - GET    /billing/invoices/:id/download     - Download invoice PDF
 * - POST   /billing/invoices/:id/pay          - Pay outstanding invoice
 *
 * FRONTEND INTEGRATION REQUIREMENTS:
 *
 * Payment Method Addition:
 * - Requires Stripe Elements library (@stripe/stripe-js, @stripe/react-stripe-js)
 * - Flow:
 *   1. Call createSetupIntent() to get clientSecret
 *   2. Mount Stripe CardElement or PaymentElement on the page
 *   3. Use stripe.confirmSetup() to validate card and get paymentMethodId
 *   4. Call addPaymentMethod() with the paymentMethodId from Stripe
 * - See: https://stripe.com/docs/payments/save-and-reuse
 *
 * TODO - Backend Implementation:
 * - Integrate Stripe SDK for subscription management
 * - Implement webhook handlers for Stripe events
 * - Add proper error handling for Stripe API errors
 * - Implement invoice generation and PDF download
 * - Set up secure payment method storage via Stripe
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

/**
 * Data required to add a new payment method
 *
 * ⚠️ The paymentMethodId must be obtained from Stripe Elements.
 * Never send raw card details directly - use Stripe's client-side validation first.
 */
export interface CreatePaymentMethodData {
  /** Stripe PaymentMethod ID obtained from stripe.confirmSetup() or stripe.createPaymentMethod() */
  paymentMethodId: string
  /** Set as the default payment method for future charges */
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
   *
   * ⚠️ REQUIRES STRIPE ELEMENTS INTEGRATION
   *
   * This function expects a paymentMethodId that must be obtained from Stripe Elements.
   * You cannot directly send card details to the backend for PCI compliance.
   *
   * Implementation steps:
   * 1. Install: npm install @stripe/stripe-js @stripe/react-stripe-js
   * 2. Get clientSecret from createSetupIntent()
   * 3. Use Stripe CardElement or PaymentElement to collect card details
   * 4. Call stripe.confirmSetup() to get paymentMethodId
   * 5. Pass the paymentMethodId to this function
   *
   * @param data - Object containing Stripe paymentMethodId and optional default flag
   * @returns The created payment method details
   *
   * @example
   * // After collecting card with Stripe Elements:
   * const { paymentMethod } = await stripe.confirmSetup({
   *   elements,
   *   confirmParams: { return_url: window.location.href }
   * });
   * await billingService.addPaymentMethod({
   *   paymentMethodId: paymentMethod.id,
   *   isDefault: true
   * });
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
   *
   * This is step 1 of the Stripe Elements payment method collection flow.
   * The returned clientSecret is used to initialize Stripe Elements on the frontend.
   *
   * ⚠️ Backend must create a Stripe SetupIntent and return its client_secret
   *
   * @returns Object containing clientSecret for Stripe Elements initialization
   *
   * @example
   * const { clientSecret } = await billingService.createSetupIntent();
   * // Use clientSecret with Stripe Elements:
   * // <Elements stripe={stripePromise} options={{ clientSecret }}>
   * //   <PaymentElement />
   * // </Elements>
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
