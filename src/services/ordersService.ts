/**
 * Orders Service
 * Handles all service order-related API calls for marketplace transactions
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Order Status
 */
export type OrderStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'paid'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'disputed'

/**
 * Order Type
 */
export type OrderType = 'gig' | 'proposal' | 'custom'

/**
 * Payment Method
 */
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'test'

/**
 * Order Delivery
 */
export interface OrderDelivery {
  deliveryDate?: string
  deliveredAt?: string
  files?: string[]
  notes?: string
  revisionRequests?: {
    _id?: string
    requestedAt: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    response?: string
  }[]
}

/**
 * Order Payment Details
 */
export interface OrderPayment {
  method?: PaymentMethod
  stripePaymentIntentId?: string
  stripeClientSecret?: string
  amount: number
  currency?: string
  paidAt?: string
  refundedAt?: string
  refundAmount?: number
}

/**
 * Order Interface
 */
export interface Order {
  _id: string

  // Order Type
  orderType: OrderType

  // Related IDs
  gigId?: string
  proposalId?: string
  clientId: string
  lawyerId: string

  // Order Details
  title: string
  description?: string
  requirements?: string

  // Pricing
  price: number
  serviceFee?: number
  totalAmount: number
  currency?: string

  // Status & Timeline
  status: OrderStatus
  createdAt: string
  updatedAt: string

  // Delivery
  deliveryTime?: number // in days
  expectedDeliveryDate?: string
  delivery?: OrderDelivery

  // Payment
  payment: OrderPayment

  // Contract/Agreement
  contractId?: string

  // Metadata
  metadata?: Record<string, any>
}

/**
 * Create Payment Intent Data (for Gigs)
 */
export interface CreatePaymentIntentData {
  gigId: string
  requirements?: string
  metadata?: Record<string, any>
}

/**
 * Create Proposal Payment Intent Data
 */
export interface CreateProposalPaymentIntentData {
  proposalId: string
  requirements?: string
  metadata?: Record<string, any>
}

/**
 * Payment Intent Response
 */
export interface PaymentIntentResponse {
  error: boolean
  message?: string
  clientSecret: string
  orderId: string
  amount: number
  currency: string
}

/**
 * Update Payment Status Data
 */
export interface UpdatePaymentStatusData {
  orderId: string
  paymentIntentId: string
  status: 'succeeded' | 'failed' | 'cancelled'
}

/**
 * Create Test Contract Data (TEST MODE ONLY)
 */
export interface CreateTestContractData {
  gigId: string
  requirements?: string
}

/**
 * Create Test Proposal Contract Data (TEST MODE ONLY)
 */
export interface CreateTestProposalContractData {
  proposalId: string
  requirements?: string
}

/**
 * Get Orders Query Parameters
 */
export interface GetOrdersParams {
  status?: OrderStatus
  orderType?: OrderType
  clientId?: string
  lawyerId?: string
  gigId?: string
  proposalId?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * API Response for Orders List
 */
interface GetOrdersResponse {
  error: boolean
  message?: string
  orders: Order[]
  pagination?: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

/**
 * API Response for Single Order
 */
interface GetOrderResponse {
  error: boolean
  message?: string
  order: Order
}

/**
 * API Response for Order Actions
 */
interface OrderActionResponse {
  error: boolean
  message: string
  order?: Order
}

// ==================== SERVICE ====================

const ordersService = {
  /**
   * Get all orders with optional filters
   * GET /api/order
   */
  getOrders: async (params?: GetOrdersParams): Promise<GetOrdersResponse> => {
    try {
      const response = await apiClient.get<GetOrdersResponse>('/order', { params })

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch orders')
      }

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get orders as a client
   */
  getClientOrders: async (params?: Omit<GetOrdersParams, 'clientId'>): Promise<Order[]> => {
    try {
      const response = await ordersService.getOrders(params)
      return response.orders
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get orders as a lawyer (seller)
   */
  getLawyerOrders: async (params?: Omit<GetOrdersParams, 'lawyerId'>): Promise<Order[]> => {
    try {
      const response = await ordersService.getOrders(params)
      return response.orders
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create payment intent for a gig order
   * POST /api/order/create-payment-intent/:_id
   */
  createPaymentIntent: async (gigId: string, data?: Omit<CreatePaymentIntentData, 'gigId'>): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        `/order/create-payment-intent/${gigId}`,
        data || {}
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to create payment intent')
      }

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create payment intent for a proposal order
   * POST /api/order/create-proposal-payment-intent/:_id
   */
  createProposalPaymentIntent: async (
    proposalId: string,
    data?: Omit<CreateProposalPaymentIntentData, 'proposalId'>
  ): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        `/order/create-proposal-payment-intent/${proposalId}`,
        data || {}
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to create proposal payment intent')
      }

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update payment status after payment confirmation
   * PATCH /api/order
   */
  updatePaymentStatus: async (data: UpdatePaymentStatusData): Promise<Order> => {
    try {
      const response = await apiClient.patch<OrderActionResponse>('/order', data)

      if (response.data.error || !response.data.order) {
        throw new Error(response.data.message || 'Failed to update payment status')
      }

      return response.data.order
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * TEST MODE ONLY: Create test contract for gig (bypasses payment)
   * POST /api/order/create-test-contract/:_id
   * Note: Only available when TEST_MODE=true in backend
   */
  createTestContract: async (gigId: string, data?: Omit<CreateTestContractData, 'gigId'>): Promise<Order> => {
    try {
      const response = await apiClient.post<OrderActionResponse>(
        `/order/create-test-contract/${gigId}`,
        data || {}
      )

      if (response.data.error || !response.data.order) {
        throw new Error(response.data.message || 'Failed to create test contract')
      }

      return response.data.order
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * TEST MODE ONLY: Create test contract for proposal (bypasses payment)
   * POST /api/order/create-test-proposal-contract/:_id
   * Note: Only available when TEST_MODE=true in backend
   */
  createTestProposalContract: async (
    proposalId: string,
    data?: Omit<CreateTestProposalContractData, 'proposalId'>
  ): Promise<Order> => {
    try {
      const response = await apiClient.post<OrderActionResponse>(
        `/order/create-test-proposal-contract/${proposalId}`,
        data || {}
      )

      if (response.data.error || !response.data.order) {
        throw new Error(response.data.message || 'Failed to create test proposal contract')
      }

      return response.data.order
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get orders by gig ID
   */
  getOrdersByGig: async (gigId: string): Promise<Order[]> => {
    try {
      const response = await ordersService.getOrders({ gigId })
      return response.orders
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get orders by proposal ID
   */
  getOrdersByProposal: async (proposalId: string): Promise<Order[]> => {
    try {
      const response = await ordersService.getOrders({ proposalId })
      return response.orders
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default ordersService
