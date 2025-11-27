/**
 * Bills Service
 * Akaunting-inspired vendor bills/payables management
 * Features: bills, bill payments, vendor management, recurring bills
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== TYPES ====================
 */

export type BillStatus = 'draft' | 'received' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

/**
 * Vendor Interface
 */
export interface Vendor {
  _id: string
  vendorId: string
  name: string
  nameAr?: string
  email?: string
  phone?: string
  taxNumber?: string
  // Address
  address?: string
  city?: string
  country: string
  postalCode?: string
  // Banking
  bankName?: string
  bankAccountNumber?: string
  bankIban?: string
  // Settings
  currency: string
  paymentTerms?: number // days
  defaultCategory?: string
  // Metadata
  notes?: string
  isActive: boolean
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Bill Interface
 */
export interface Bill {
  _id: string
  billNumber: string
  vendorId: string
  vendor?: Vendor
  // Amounts
  items: BillItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountType?: 'fixed' | 'percentage'
  discountValue?: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  currency: string
  exchangeRate?: number
  // Dates
  billDate: string
  dueDate: string
  paidDate?: string
  // Status
  status: BillStatus
  // Relations
  caseId?: string
  categoryId?: string
  // Documents
  attachments: BillAttachment[]
  // Recurring
  isRecurring: boolean
  recurringConfig?: RecurringConfig
  parentBillId?: string
  // Metadata
  notes?: string
  internalNotes?: string
  reference?: string
  // History
  history?: BillHistory[]
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Bill Item Interface
 */
export interface BillItem {
  _id?: string
  description: string
  descriptionAr?: string
  quantity: number
  unitPrice: number
  taxRate?: number
  taxAmount?: number
  discount?: number
  total: number
  categoryId?: string
}

/**
 * Bill Attachment Interface
 */
export interface BillAttachment {
  _id?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize?: number
  uploadedAt: string
}

/**
 * Recurring Config Interface
 */
export interface RecurringConfig {
  frequency: RecurringFrequency
  interval: number
  startDate: string
  endDate?: string
  nextBillDate?: string
  autoGenerate: boolean
  autoSend: boolean
}

/**
 * Bill History Interface
 */
export interface BillHistory {
  action: string
  performedBy: string
  performedAt: string
  details?: any
}

/**
 * Bill Payment Interface
 */
export interface BillPayment {
  _id: string
  paymentNumber: string
  billId: string
  bill?: Bill
  vendorId: string
  vendor?: Vendor
  amount: number
  currency: string
  paymentDate: string
  paymentMethod: string
  bankAccountId?: string
  reference?: string
  notes?: string
  // Status
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Create Vendor Data
 */
export interface CreateVendorData {
  name: string
  nameAr?: string
  email?: string
  phone?: string
  taxNumber?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  bankName?: string
  bankAccountNumber?: string
  bankIban?: string
  currency?: string
  paymentTerms?: number
  defaultCategory?: string
  notes?: string
}

/**
 * Create Bill Data
 */
export interface CreateBillData {
  vendorId: string
  items: Omit<BillItem, '_id'>[]
  billDate: string
  dueDate: string
  taxRate?: number
  discountType?: 'fixed' | 'percentage'
  discountValue?: number
  caseId?: string
  categoryId?: string
  notes?: string
  internalNotes?: string
  reference?: string
  isRecurring?: boolean
  recurringConfig?: RecurringConfig
}

/**
 * Create Bill Payment Data
 */
export interface CreateBillPaymentData {
  billId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  bankAccountId?: string
  reference?: string
  notes?: string
}

/**
 * Bill Filters
 */
export interface BillFilters {
  status?: BillStatus
  vendorId?: string
  caseId?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  overdue?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Vendor Filters
 */
export interface VendorFilters {
  search?: string
  isActive?: boolean
  country?: string
  page?: number
  limit?: number
}

/**
 * ==================== SERVICE ====================
 */

const billsService = {
  // ==================== VENDORS ====================

  /**
   * Get all vendors
   */
  getVendors: async (filters?: VendorFilters): Promise<{ vendors: Vendor[]; total: number }> => {
    try {
      const response = await apiClient.get('/vendors', { params: filters })
      return {
        vendors: response.data.vendors || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get vendors error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single vendor
   */
  getVendor: async (id: string): Promise<Vendor> => {
    try {
      const response = await apiClient.get(`/vendors/${id}`)
      return response.data.vendor || response.data.data
    } catch (error: any) {
      console.error('Get vendor error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create vendor
   */
  createVendor: async (data: CreateVendorData): Promise<Vendor> => {
    try {
      const response = await apiClient.post('/vendors', data)
      return response.data.vendor || response.data.data
    } catch (error: any) {
      console.error('Create vendor error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update vendor
   */
  updateVendor: async (id: string, data: Partial<CreateVendorData>): Promise<Vendor> => {
    try {
      const response = await apiClient.put(`/vendors/${id}`, data)
      return response.data.vendor || response.data.data
    } catch (error: any) {
      console.error('Update vendor error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete vendor
   */
  deleteVendor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/vendors/${id}`)
    } catch (error: any) {
      console.error('Delete vendor error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get vendor bills summary
   */
  getVendorSummary: async (id: string): Promise<{
    totalBills: number
    totalAmount: number
    totalPaid: number
    totalOutstanding: number
    bills: Bill[]
  }> => {
    try {
      const response = await apiClient.get(`/vendors/${id}/summary`)
      return response.data.summary || response.data.data || response.data
    } catch (error: any) {
      console.error('Get vendor summary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== BILLS ====================

  /**
   * Get all bills
   */
  getBills: async (filters?: BillFilters): Promise<{ bills: Bill[]; total: number }> => {
    try {
      const response = await apiClient.get('/bills', { params: filters })
      return {
        bills: response.data.bills || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get bills error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single bill
   */
  getBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.get(`/bills/${id}`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Get bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create bill
   */
  createBill: async (data: CreateBillData): Promise<Bill> => {
    try {
      const response = await apiClient.post('/bills', data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Create bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update bill
   */
  updateBill: async (id: string, data: Partial<CreateBillData>): Promise<Bill> => {
    try {
      const response = await apiClient.put(`/bills/${id}`, data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Update bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete bill
   */
  deleteBill: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/bills/${id}`)
    } catch (error: any) {
      console.error('Delete bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark bill as received
   */
  receiveBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/receive`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Receive bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel bill
   */
  cancelBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/cancel`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Cancel bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload attachment
   */
  uploadAttachment: async (id: string, file: File): Promise<BillAttachment> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/bills/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.attachment || response.data.data
    } catch (error: any) {
      console.error('Upload attachment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete attachment
   */
  deleteAttachment: async (billId: string, attachmentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/bills/${billId}/attachments/${attachmentId}`)
    } catch (error: any) {
      console.error('Delete attachment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate bill
   */
  duplicateBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/duplicate`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Duplicate bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get overdue bills
   */
  getOverdueBills: async (): Promise<Bill[]> => {
    try {
      const response = await apiClient.get('/bills/overdue')
      return response.data.bills || response.data.data || []
    } catch (error: any) {
      console.error('Get overdue bills error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get bills summary
   */
  getBillsSummary: async (filters?: {
    startDate?: string
    endDate?: string
    vendorId?: string
  }): Promise<{
    totalBills: number
    totalAmount: number
    totalPaid: number
    totalOutstanding: number
    totalOverdue: number
    byStatus: { status: BillStatus; count: number; amount: number }[]
    byCategory: { categoryId: string; categoryName: string; amount: number }[]
  }> => {
    try {
      const response = await apiClient.get('/bills/summary', { params: filters })
      return response.data.summary || response.data.data || response.data
    } catch (error: any) {
      console.error('Get bills summary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== BILL PAYMENTS ====================

  /**
   * Get bill payments
   */
  getPayments: async (filters?: {
    billId?: string
    vendorId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ payments: BillPayment[]; total: number }> => {
    try {
      const response = await apiClient.get('/bill-payments', { params: filters })
      return {
        payments: response.data.payments || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get bill payments error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single payment
   */
  getPayment: async (id: string): Promise<BillPayment> => {
    try {
      const response = await apiClient.get(`/bill-payments/${id}`)
      return response.data.payment || response.data.data
    } catch (error: any) {
      console.error('Get bill payment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Record payment for bill
   */
  recordPayment: async (data: CreateBillPaymentData): Promise<BillPayment> => {
    try {
      const response = await apiClient.post('/bill-payments', data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      console.error('Record bill payment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel payment
   */
  cancelPayment: async (id: string): Promise<BillPayment> => {
    try {
      const response = await apiClient.post(`/bill-payments/${id}/cancel`)
      return response.data.payment || response.data.data
    } catch (error: any) {
      console.error('Cancel bill payment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RECURRING BILLS ====================

  /**
   * Get recurring bills
   */
  getRecurringBills: async (): Promise<Bill[]> => {
    try {
      const response = await apiClient.get('/bills/recurring')
      return response.data.bills || response.data.data || []
    } catch (error: any) {
      console.error('Get recurring bills error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Stop recurring bill
   */
  stopRecurring: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/stop-recurring`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Stop recurring bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate next recurring bill manually
   */
  generateNextBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/generate-next`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      console.error('Generate next bill error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== REPORTS ====================

  /**
   * Get payables aging report
   */
  getAgingReport: async (filters?: { vendorId?: string }): Promise<{
    summary: {
      total: number
      current: number
      days1to30: number
      days31to60: number
      days61to90: number
      days90plus: number
    }
    vendors: {
      vendorId: string
      vendorName: string
      current: number
      days1to30: number
      days31to60: number
      days61to90: number
      days90plus: number
      total: number
    }[]
    generatedAt: string
  }> => {
    try {
      const response = await apiClient.get('/bills/reports/aging', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      console.error('Get aging report error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export bills
   */
  exportBills: async (filters?: BillFilters, format: 'csv' | 'pdf' | 'xlsx' = 'csv'): Promise<Blob> => {
    try {
      const response = await apiClient.get('/bills/export', {
        params: { ...filters, format },
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      console.error('Export bills error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default billsService
