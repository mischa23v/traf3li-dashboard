/**
 * Billing Service
 * Handles subscription, payment methods, and billing history operations
 *
 * ⚠️ CRITICAL: MOST ENDPOINTS IN THIS SERVICE DO NOT EXIST IN THE BACKEND ⚠️
 * ⚠️ تحذير: معظم نقاط النهاية في هذه الخدمة غير موجودة في الخادم ⚠️
 *
 * This service is a STUB IMPLEMENTATION defining the API contract for future
 * Stripe-based subscription billing. The backend has NOT implemented these endpoints.
 *
 * ENDPOINTS THAT ACTUALLY EXIST (from /docs/API_ENDPOINTS_ACTUAL.md):
 * ✅ GET    /billing/rates                    - Get billing rates
 * ✅ GET    /billing/groups                   - Get billing groups
 * ✅ GET    /billing/time-entries             - Get time entries
 * ✅ GET    /billing/statistics               - Get billing statistics
 * ✅ POST   /billing/rates                    - Create billing rate
 * ✅ PATCH  /billing/groups/:id               - Update billing group
 *
 * ENDPOINTS THAT DO NOT EXIST (will return 404):
 * ❌ All subscription endpoints (/billing/subscription/*)
 * ❌ All payment method endpoints (/billing/payment-methods/*)
 * ❌ All invoice endpoints (/billing/invoices/*)
 *
 * These non-existent endpoints are documented below for future implementation.
 * All methods include bilingual error messages (English | Arabic) when endpoints
 * return 404 errors.
 *
 * EXPECTED BACKEND ENDPOINTS (NOT YET IMPLEMENTED):
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
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/subscription` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  getSubscription: async (): Promise<Subscription> => {
    try {
      const response = await apiClient.get('/billing/subscription')
      return response.data
    } catch (error: any) {
      // Check if endpoint doesn't exist
      if (error?.status === 404) {
        throw new Error(
          'Subscription endpoint not implemented | نقطة نهاية الاشتراك غير مطبقة\n' +
          'The backend endpoint /billing/subscription has not been implemented yet. | ' +
          'نقطة النهاية /billing/subscription لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get usage metrics for current plan
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/usage` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  getUsageMetrics: async (): Promise<UsageMetrics> => {
    try {
      const response = await apiClient.get('/billing/usage')
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Usage metrics endpoint not implemented | نقطة نهاية مقاييس الاستخدام غير مطبقة\n' +
          'The backend endpoint /billing/usage has not been implemented yet. | ' +
          'نقطة النهاية /billing/usage لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Change subscription plan
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/subscription/change-plan` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  changePlan: async (data: ChangePlanData): Promise<Subscription> => {
    try {
      const response = await apiClient.post('/billing/subscription/change-plan', data)
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Change plan endpoint not implemented | نقطة نهاية تغيير الخطة غير مطبقة\n' +
          'The backend endpoint /billing/subscription/change-plan has not been implemented yet. | ' +
          'نقطة النهاية /billing/subscription/change-plan لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel subscription (at end of current period)
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/subscription/cancel` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  cancelSubscription: async (): Promise<Subscription> => {
    try {
      const response = await apiClient.post('/billing/subscription/cancel')
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Cancel subscription endpoint not implemented | نقطة نهاية إلغاء الاشتراك غير مطبقة\n' +
          'The backend endpoint /billing/subscription/cancel has not been implemented yet. | ' +
          'نقطة النهاية /billing/subscription/cancel لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reactivate canceled subscription
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/subscription/reactivate` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  reactivateSubscription: async (): Promise<Subscription> => {
    try {
      const response = await apiClient.post('/billing/subscription/reactivate')
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Reactivate subscription endpoint not implemented | نقطة نهاية إعادة تفعيل الاشتراك غير مطبقة\n' +
          'The backend endpoint /billing/subscription/reactivate has not been implemented yet. | ' +
          'نقطة النهاية /billing/subscription/reactivate لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get upcoming invoice preview
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/subscription/upcoming-invoice` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  getUpcomingInvoice: async (planId?: PlanId): Promise<UpcomingInvoice> => {
    try {
      const params = planId ? { plan: planId } : {}
      const response = await apiClient.get('/billing/subscription/upcoming-invoice', { params })
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Upcoming invoice endpoint not implemented | نقطة نهاية الفاتورة القادمة غير مطبقة\n' +
          'The backend endpoint /billing/subscription/upcoming-invoice has not been implemented yet. | ' +
          'نقطة النهاية /billing/subscription/upcoming-invoice لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  // ==================== PAYMENT METHODS ====================

  /**
   * Get all payment methods
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/payment-methods` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await apiClient.get('/billing/payment-methods')
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Payment methods endpoint not implemented | نقطة نهاية طرق الدفع غير مطبقة\n' +
          'The backend endpoint /billing/payment-methods has not been implemented yet. | ' +
          'نقطة النهاية /billing/payment-methods لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
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
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Add payment method endpoint not implemented | نقطة نهاية إضافة طريقة الدفع غير مطبقة\n' +
          'The backend endpoint POST /billing/payment-methods has not been implemented yet. | ' +
          'نقطة النهاية POST /billing/payment-methods لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set default payment method
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/payment-methods/:id/set-default` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    try {
      const response = await apiClient.patch(`/billing/payment-methods/${id}/set-default`)
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Set default payment method endpoint not implemented | نقطة نهاية تعيين طريقة الدفع الافتراضية غير مطبقة\n' +
          'The backend endpoint /billing/payment-methods/:id/set-default has not been implemented yet. | ' +
          'نقطة النهاية /billing/payment-methods/:id/set-default لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove payment method
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/payment-methods/:id` (DELETE) does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  removePaymentMethod: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/payment-methods/${id}`)
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Remove payment method endpoint not implemented | نقطة نهاية إزالة طريقة الدفع غير مطبقة\n' +
          'The backend endpoint DELETE /billing/payment-methods/:id has not been implemented yet. | ' +
          'نقطة النهاية DELETE /billing/payment-methods/:id لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
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
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Setup intent endpoint not implemented | نقطة نهاية إعداد النية غير مطبقة\n' +
          'The backend endpoint POST /billing/payment-methods/setup-intent has not been implemented yet. | ' +
          'نقطة النهاية POST /billing/payment-methods/setup-intent لم يتم تطبيقها بعد.\n' +
          'This requires Stripe integration on the backend. | يتطلب ذلك دمج Stripe في الخادم.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  // ==================== BILLING HISTORY ====================

  /**
   * Get billing history with pagination and filters
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/invoices` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  getBillingHistory: async (filters?: BillingHistoryFilters): Promise<BillingHistoryResponse> => {
    try {
      const response = await apiClient.get('/billing/invoices', { params: filters })
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Billing history endpoint not implemented | نقطة نهاية سجل الفواتير غير مطبقة\n' +
          'The backend endpoint /billing/invoices has not been implemented yet. | ' +
          'نقطة النهاية /billing/invoices لم يتم تطبيقها بعد.\n' +
          'Note: This is different from regular invoices. These are subscription billing invoices. | ' +
          'ملاحظة: هذه تختلف عن الفواتير العادية. هذه فواتير الاشتراك.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single invoice by ID
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/invoices/:id` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  getInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.get(`/billing/invoices/${id}`)
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Get invoice endpoint not implemented | نقطة نهاية الحصول على الفاتورة غير مطبقة\n' +
          'The backend endpoint /billing/invoices/:id has not been implemented yet. | ' +
          'نقطة النهاية /billing/invoices/:id لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Download invoice PDF
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/invoices/:id/download` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  downloadInvoice: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/billing/invoices/${id}/download`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Download invoice endpoint not implemented | نقطة نهاية تحميل الفاتورة غير مطبقة\n' +
          'The backend endpoint /billing/invoices/:id/download has not been implemented yet. | ' +
          'نقطة النهاية /billing/invoices/:id/download لم يتم تطبيقها بعد.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pay outstanding invoice
   *
   * ⚠️ ENDPOINT NOT IMPLEMENTED
   * Backend endpoint `/billing/invoices/:id/pay` does not exist.
   * This will return a 404 error until backend implementation is complete.
   */
  payInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/billing/invoices/${id}/pay`)
      return response.data
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error(
          'Pay invoice endpoint not implemented | نقطة نهاية دفع الفاتورة غير مطبقة\n' +
          'The backend endpoint /billing/invoices/:id/pay has not been implemented yet. | ' +
          'نقطة النهاية /billing/invoices/:id/pay لم يتم تطبيقها بعد.\n' +
          'This requires Stripe integration on the backend. | يتطلب ذلك دمج Stripe في الخادم.'
        )
      }
      throw new Error(handleApiError(error))
    }
  },
}

export default billingService
