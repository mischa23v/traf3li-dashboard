/**
 * Bill Payment Service
 * Handles all bill payment-related API calls (payments for bills/accounts payable)
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== TYPES ====================
 */

export interface BillPayment {
  _id: string
  paymentNumber: string
  billId: string | {
    _id: string
    billNumber: string
    vendorId: string
    amount: number
  }
  vendorId: string | {
    _id: string
    name: string
    email?: string
  }
  paymentDate: string
  amount: number
  currency: string
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'wire_transfer' | 'other'
  paymentAccount?: string
  reference?: string
  checkNumber?: string
  transactionId?: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  notes?: string
  attachments?: PaymentAttachment[]
  createdBy: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentAttachment {
  _id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

export interface CreateBillPaymentData {
  billId: string
  paymentDate: string
  amount: number
  currency?: string
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'wire_transfer' | 'other'
  paymentAccount?: string
  reference?: string
  checkNumber?: string
  transactionId?: string
  notes?: string
}

export interface BillPaymentFilters {
  billId?: string
  vendorId?: string
  status?: string
  paymentMethod?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

/**
 * Bill Payment Service Object
 */
const billPaymentService = {
  /**
   * Create payment
   * POST /api/bill-payments
   */
  createPayment: async (data: CreateBillPaymentData): Promise<BillPayment> => {
    try {
      const response = await apiClient.post('/bill-payments', data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all payments
   * GET /api/bill-payments
   */
  getPayments: async (filters?: BillPaymentFilters): Promise<{ payments: BillPayment[]; total: number }> => {
    try {
      const response = await apiClient.get('/bill-payments', { params: filters })
      return {
        payments: response.data.payments || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single payment
   * GET /api/bill-payments/:id
   */
  getPayment: async (id: string): Promise<BillPayment> => {
    try {
      const response = await apiClient.get(`/bill-payments/${id}`)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel payment
   * POST /api/bill-payments/:id/cancel
   */
  cancelPayment: async (id: string, data: { reason: string }): Promise<BillPayment> => {
    try {
      const response = await apiClient.post(`/bill-payments/${id}/cancel`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default billPaymentService
