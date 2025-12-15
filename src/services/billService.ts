/**
 * Bill Service
 * Handles all bill-related API calls (accounts payable)
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== TYPES ====================
 */

export interface Bill {
  _id: string
  billNumber: string
  vendorId: string | {
    _id: string
    name: string
    email?: string
    phone?: string
  }
  billDate: string
  dueDate: string
  amount: number
  amountPaid: number
  balanceDue: number
  currency: string
  status: 'draft' | 'pending' | 'approved' | 'received' | 'paid' | 'partial' | 'overdue' | 'cancelled'
  items: BillItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  description?: string
  notes?: string
  attachments?: BillAttachment[]
  paymentTerms?: string
  referenceNumber?: string
  purchaseOrderNumber?: string
  accountId?: string
  departmentId?: string
  projectId?: string
  locationId?: string
  isRecurring?: boolean
  recurringSettings?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    interval: number
    startDate: string
    endDate?: string
    nextBillDate?: string
  }
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  receivedAt?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  history?: BillHistory[]
  createdAt: string
  updatedAt: string
}

export interface BillItem {
  _id?: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  accountId?: string
  taxRate?: number
  taxAmount?: number
}

export interface BillAttachment {
  _id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
}

export interface BillHistory {
  action: string
  performedBy: string | {
    _id: string
    firstName: string
    lastName: string
  }
  timestamp: string
  details?: any
}

export interface CreateBillData {
  vendorId: string
  billDate: string
  dueDate: string
  items: BillItem[]
  subtotal: number
  taxAmount?: number
  totalAmount: number
  currency?: string
  description?: string
  notes?: string
  paymentTerms?: string
  referenceNumber?: string
  purchaseOrderNumber?: string
  accountId?: string
  departmentId?: string
  projectId?: string
  locationId?: string
  isRecurring?: boolean
  recurringSettings?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    interval: number
    startDate: string
    endDate?: string
  }
}

export interface BillFilters {
  status?: string
  vendorId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  isRecurring?: boolean
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface BillSummary {
  totalBills: number
  totalAmount: number
  totalPaid: number
  totalOutstanding: number
  byStatus: {
    draft: number
    pending: number
    approved: number
    received: number
    paid: number
    partial: number
    overdue: number
    cancelled: number
  }
}

export interface AgingReport {
  summary: {
    totalOutstanding: number
    current: number
    oneToThirtyDays: number
    thirtyOneToSixtyDays: number
    sixtyOneToNinetyDays: number
    ninetyPlusDays: number
  }
  vendors: Array<{
    vendorId: string
    vendorName: string
    current: number
    oneToThirtyDays: number
    thirtyOneToSixtyDays: number
    sixtyOneToNinetyDays: number
    ninetyPlusDays: number
    total: number
  }>
  generatedAt: string
}

/**
 * ==================== DEBIT NOTE TYPES ====================
 */

export interface DebitNote {
  _id: string
  debitNoteNumber: string
  billId: string | {
    _id: string
    billNumber: string
    vendorId: string | {
      _id: string
      name: string
      nameAr?: string
    }
  }
  vendorId: string | {
    _id: string
    name: string
    nameAr?: string
    email?: string
    phone?: string
  }
  debitNoteDate: string
  reason: string
  reasonType: 'goods_returned' | 'damaged_goods' | 'pricing_error' | 'quality_issue' | 'overcharge' | 'other'
  items: DebitNoteItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: 'draft' | 'pending' | 'approved' | 'applied' | 'cancelled'
  isPartial: boolean
  notes?: string
  attachments?: BillAttachment[]
  appliedAt?: string
  appliedBy?: string
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  history?: BillHistory[]
  createdAt: string
  updatedAt: string
}

export interface DebitNoteItem {
  _id?: string
  billItemId?: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate?: number
  taxAmount?: number
}

export interface CreateDebitNoteData {
  billId: string
  debitNoteDate: string
  reason: string
  reasonType: 'goods_returned' | 'damaged_goods' | 'pricing_error' | 'quality_issue' | 'overcharge' | 'other'
  items: DebitNoteItem[]
  subtotal: number
  taxAmount?: number
  totalAmount: number
  isPartial: boolean
  notes?: string
}

export interface DebitNoteFilters {
  status?: string
  vendorId?: string
  billId?: string
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
 * Bill Service Object
 */
const billService = {
  /**
   * Create bill
   * POST /api/bills
   */
  createBill: async (data: CreateBillData): Promise<Bill> => {
    try {
      const response = await apiClient.post('/bills', data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all bills
   * GET /api/bills
   */
  getBills: async (filters?: BillFilters): Promise<{ bills: Bill[]; total: number }> => {
    try {
      const response = await apiClient.get('/bills', { params: filters })
      return {
        bills: response.data.bills || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single bill
   * GET /api/bills/:id
   */
  getBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.get(`/bills/${id}`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update bill
   * PUT /api/bills/:id
   */
  updateBill: async (id: string, data: Partial<CreateBillData>): Promise<Bill> => {
    try {
      const response = await apiClient.put(`/bills/${id}`, data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete bill
   * DELETE /api/bills/:id
   */
  deleteBill: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/bills/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get overdue bills
   * GET /api/bills/overdue
   */
  getOverdueBills: async (): Promise<Bill[]> => {
    try {
      const response = await apiClient.get('/bills/overdue')
      return response.data.bills || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get bill summary
   * GET /api/bills/summary
   */
  getSummary: async (filters?: { startDate?: string; endDate?: string; vendorId?: string }): Promise<BillSummary> => {
    try {
      const response = await apiClient.get('/bills/summary', { params: filters })
      return response.data.summary || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get recurring bills
   * GET /api/bills/recurring
   */
  getRecurringBills: async (): Promise<Bill[]> => {
    try {
      const response = await apiClient.get('/bills/recurring')
      return response.data.bills || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get aging report
   * GET /api/bills/reports/aging
   */
  getAgingReport: async (filters?: { vendorId?: string }): Promise<AgingReport> => {
    try {
      const response = await apiClient.get('/bills/reports/aging', { params: filters })
      return response.data.report || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export bills
   * GET /api/bills/export
   */
  exportBills: async (filters?: BillFilters & { format?: 'csv' | 'xlsx' | 'pdf' }): Promise<Blob> => {
    try {
      const response = await apiClient.get('/bills/export', {
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Receive bill (mark as received)
   * POST /api/bills/:id/receive
   */
  receiveBill: async (id: string, data?: { receivedDate?: string; notes?: string }): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/receive`, data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel bill
   * POST /api/bills/:id/cancel
   */
  cancelBill: async (id: string, data: { reason: string }): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/cancel`, data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate bill
   * POST /api/bills/:id/duplicate
   */
  duplicateBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/duplicate`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Stop recurring bill
   * POST /api/bills/:id/stop-recurring
   */
  stopRecurring: async (id: string, data?: { stopDate?: string; reason?: string }): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/stop-recurring`, data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate next recurring bill
   * POST /api/bills/:id/generate-next
   */
  generateNextBill: async (id: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/generate-next`)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload attachment
   * POST /api/bills/:id/attachments
   */
  uploadAttachment: async (id: string, file: File): Promise<BillAttachment> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/bills/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.attachment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete attachment
   * DELETE /api/bills/:id/attachments/:attachmentId
   */
  deleteAttachment: async (id: string, attachmentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/bills/${id}/attachments/${attachmentId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve bill
   * POST /api/bills/:id/approve
   */
  approveBill: async (id: string, notes?: string): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/approve`, { notes })
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pay bill
   * POST /api/bills/:id/pay
   */
  payBill: async (id: string, paymentData?: {
    amount?: number
    paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card'
    paymentDate?: string
    reference?: string
    notes?: string
    bankAccountId?: string
  }): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/pay`, paymentData)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Post bill to General Ledger
   * POST /api/bills/:id/post-to-gl
   */
  postToGL: async (id: string, data?: {
    journalDate?: string
    notes?: string
  }): Promise<Bill> => {
    try {
      const response = await apiClient.post(`/bills/${id}/post-to-gl`, data)
      return response.data.bill || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * ==================== DEBIT NOTE METHODS ====================
   */

  /**
   * Create debit note
   * POST /api/debit-notes
   */
  createDebitNote: async (data: CreateDebitNoteData): Promise<DebitNote> => {
    try {
      const response = await apiClient.post('/debit-notes', data)
      return response.data.debitNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all debit notes
   * GET /api/debit-notes
   */
  getDebitNotes: async (filters?: DebitNoteFilters): Promise<{ debitNotes: DebitNote[]; total: number }> => {
    try {
      const response = await apiClient.get('/debit-notes', { params: filters })
      return {
        debitNotes: response.data.debitNotes || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single debit note
   * GET /api/debit-notes/:id
   */
  getDebitNote: async (id: string): Promise<DebitNote> => {
    try {
      const response = await apiClient.get(`/debit-notes/${id}`)
      return response.data.debitNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get debit notes for a specific bill
   * GET /api/bills/:billId/debit-notes
   */
  getBillDebitNotes: async (billId: string): Promise<DebitNote[]> => {
    try {
      const response = await apiClient.get(`/bills/${billId}/debit-notes`)
      return response.data.debitNotes || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update debit note
   * PUT /api/debit-notes/:id
   */
  updateDebitNote: async (id: string, data: Partial<CreateDebitNoteData>): Promise<DebitNote> => {
    try {
      const response = await apiClient.put(`/debit-notes/${id}`, data)
      return response.data.debitNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve debit note
   * POST /api/debit-notes/:id/approve
   */
  approveDebitNote: async (id: string, notes?: string): Promise<DebitNote> => {
    try {
      const response = await apiClient.post(`/debit-notes/${id}/approve`, { notes })
      return response.data.debitNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Apply debit note (update bill and vendor balances)
   * POST /api/debit-notes/:id/apply
   */
  applyDebitNote: async (id: string): Promise<DebitNote> => {
    try {
      const response = await apiClient.post(`/debit-notes/${id}/apply`)
      return response.data.debitNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel debit note
   * POST /api/debit-notes/:id/cancel
   */
  cancelDebitNote: async (id: string, data: { reason: string }): Promise<DebitNote> => {
    try {
      const response = await apiClient.post(`/debit-notes/${id}/cancel`, data)
      return response.data.debitNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete debit note
   * DELETE /api/debit-notes/:id
   */
  deleteDebitNote: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/debit-notes/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export debit notes
   * GET /api/debit-notes/export
   */
  exportDebitNotes: async (filters?: DebitNoteFilters & { format?: 'csv' | 'xlsx' | 'pdf' }): Promise<Blob> => {
    try {
      const response = await apiClient.get('/debit-notes/export', {
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default billService
