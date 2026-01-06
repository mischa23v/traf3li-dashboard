/**
 * Invoice Service
 * Handles all invoice-related API operations with comprehensive error handling
 * and bilingual error messages (English | Arabic)
 *
 * API Endpoint Reference: /api/v1/invoices/*
 * See: /config/API_ROUTES_REFERENCE.ts for complete endpoint documentation
 */

import apiClient from '@/lib/api'
import type { AxiosError } from 'axios'

// ==================== TYPES ====================

export interface Invoice {
  _id: string
  invoiceNumber: string
  caseId?: string
  contractId?: string
  lawyerId: string | { firstName: string; lastName: string; name?: string }
  clientId: string | { firstName: string; lastName: string; name?: string }
  items: InvoiceItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'void'
  issueDate: string
  dueDate: string
  paidDate?: string
  notes?: string
  pdfUrl?: string
  history?: InvoiceHistory[]
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceHistory {
  action: string
  performedBy: string
  timestamp: string
  details?: any
}

export interface CreateInvoiceData {
  clientId: string
  caseId?: string
  items: InvoiceItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  dueDate: string
  notes?: string
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {}

export interface InvoiceFilters {
  status?: string
  clientId?: string
  caseId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  total: number
  page?: number
  limit?: number
  pages?: number
}

export interface InvoiceStats {
  total: number
  byStatus: Record<string, number>
  totalRevenue: number
  totalOutstanding: number
  averageInvoiceAmount: number
  averageDaysToPayment: number
}

export interface BillableItems {
  timeEntries: any[]
  expenses: any[]
  totals: {
    timeAmount: number
    expenseAmount: number
    totalAmount: number
  }
}

export interface RecordPaymentData {
  amount: number
  paymentDate: string
  paymentMethod: string
  reference?: string
}

// ==================== ERROR HANDLING ====================

/**
 * Enhanced error handler with bilingual messages
 */
function handleError(error: unknown, context: string): never {
  if (!error) {
    throw new Error(
      `Unknown error in ${context} | خطأ غير معروف في ${context}`
    )
  }

  const axiosError = error as AxiosError<{ message?: string; error?: string }>

  // Network/connection errors
  if (axiosError.code === 'ECONNABORTED') {
    throw new Error(
      `Request timeout. Please check your connection | انتهت مهلة الطلب. يرجى التحقق من اتصالك`
    )
  }

  if (axiosError.code === 'ERR_NETWORK') {
    throw new Error(
      `Network error. Please check your internet connection | خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت`
    )
  }

  // HTTP status errors
  const status = axiosError.response?.status
  const serverMessage = axiosError.response?.data?.message || axiosError.response?.data?.error

  switch (status) {
    case 400:
      throw new Error(
        serverMessage ||
        `Invalid request data | بيانات الطلب غير صالحة`
      )
    case 401:
      throw new Error(
        `Unauthorized. Please login again | غير مصرح. يرجى تسجيل الدخول مرة أخرى`
      )
    case 403:
      throw new Error(
        `Access denied. You don't have permission | تم رفض الوصول. ليس لديك إذن`
      )
    case 404:
      throw new Error(
        serverMessage ||
        `Invoice not found. It may have been deleted | الفاتورة غير موجودة. ربما تم حذفها`
      )
    case 409:
      throw new Error(
        serverMessage ||
        `Conflict. This operation conflicts with existing data | تعارض. تتعارض هذه العملية مع البيانات الموجودة`
      )
    case 422:
      throw new Error(
        serverMessage ||
        `Validation failed. Please check your input | فشل التحقق. يرجى التحقق من المدخلات`
      )
    case 500:
      throw new Error(
        `Server error. Please try again later | خطأ في الخادم. يرجى المحاولة لاحقاً`
      )
    case 502:
    case 503:
    case 504:
      throw new Error(
        `Service temporarily unavailable. Please try again | الخدمة غير متوفرة مؤقتاً. يرجى المحاولة مرة أخرى`
      )
    default:
      throw new Error(
        serverMessage ||
        axiosError.message ||
        `Unexpected error in ${context} | خطأ غير متوقع في ${context}`
      )
  }
}

// ==================== SERVICE METHODS ====================

const invoiceService = {
  /**
   * Get all invoices with optional filters
   * GET /api/v1/invoices
   */
  getAll: async (filters?: InvoiceFilters): Promise<InvoiceListResponse> => {
    try {
      const response = await apiClient.get<InvoiceListResponse>('/invoices', {
        params: filters
      })
      return {
        invoices: response.data.invoices || [],
        total: response.data.total || 0,
        page: response.data.page,
        limit: response.data.limit,
        pages: response.data.pages,
      }
    } catch (error) {
      handleError(error, 'getAll invoices | جلب جميع الفواتير')
    }
  },

  /**
   * Get single invoice by ID
   * GET /api/v1/invoices/:id
   */
  getById: async (id: string): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.get<{ invoice?: Invoice; data?: Invoice }>(`/invoices/${id}`)
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Invoice not found | الفاتورة غير موجودة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `get invoice ${id} | جلب الفاتورة ${id}`)
    }
  },

  /**
   * Create new invoice
   * POST /api/v1/invoices
   */
  create: async (data: CreateInvoiceData): Promise<Invoice> => {
    // Validation
    if (!data.clientId) {
      throw new Error(
        'Client ID is required | معرف العميل مطلوب'
      )
    }

    if (!data.items || data.items.length === 0) {
      throw new Error(
        'At least one invoice item is required | عنصر فاتورة واحد على الأقل مطلوب'
      )
    }

    if (!data.dueDate) {
      throw new Error(
        'Due date is required | تاريخ الاستحقاق مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>('/invoices', data)
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to create invoice | فشل إنشاء الفاتورة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, 'create invoice | إنشاء الفاتورة')
    }
  },

  /**
   * Update invoice
   * PATCH /api/v1/invoices/:id
   * Note: Uses PATCH, not PUT per API documentation
   */
  update: async (id: string, data: UpdateInvoiceData): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.patch<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to update invoice | فشل تحديث الفاتورة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `update invoice ${id} | تحديث الفاتورة ${id}`)
    }
  },

  /**
   * Delete invoice
   * DELETE /api/v1/invoices/:id
   */
  delete: async (id: string): Promise<void> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      await apiClient.delete(`/invoices/${id}`)
    } catch (error) {
      handleError(error, `delete invoice ${id} | حذف الفاتورة ${id}`)
    }
  },

  /**
   * Get invoice statistics
   * GET /api/v1/invoices/stats
   */
  getStats: async (): Promise<InvoiceStats> => {
    try {
      const response = await apiClient.get<{ data?: InvoiceStats } | InvoiceStats>('/invoices/stats')
      const stats = 'data' in response.data ? response.data.data : response.data

      if (!stats) {
        throw new Error(
          'Failed to load statistics | فشل تحميل الإحصائيات'
        )
      }

      return stats
    } catch (error) {
      handleError(error, 'get invoice stats | جلب إحصائيات الفواتير')
    }
  },

  /**
   * Get overdue invoices
   * GET /api/v1/invoices/overdue
   */
  getOverdue: async (): Promise<Invoice[]> => {
    try {
      const response = await apiClient.get<{ invoices?: Invoice[]; data?: Invoice[] }>('/invoices/overdue')
      return response.data.invoices || response.data.data || []
    } catch (error) {
      handleError(error, 'get overdue invoices | جلب الفواتير المتأخرة')
    }
  },

  /**
   * Get billable items (unbilled time entries and expenses)
   * GET /api/v1/invoices/billable-items
   */
  getBillableItems: async (params?: { clientId?: string; caseId?: string }): Promise<BillableItems> => {
    try {
      const response = await apiClient.get<{ data?: BillableItems } | BillableItems>(
        '/invoices/billable-items',
        { params }
      )
      const items = 'data' in response.data ? response.data.data : response.data

      if (!items) {
        throw new Error(
          'Failed to load billable items | فشل تحميل العناصر القابلة للفوترة'
        )
      }

      return items
    } catch (error) {
      handleError(error, 'get billable items | جلب العناصر القابلة للفوترة')
    }
  },

  /**
   * Get open invoices for a client
   * GET /api/v1/invoices/open/:clientId
   */
  getOpenByClient: async (clientId: string): Promise<Invoice[]> => {
    if (!clientId) {
      throw new Error(
        'Client ID is required | معرف العميل مطلوب'
      )
    }

    try {
      const response = await apiClient.get<{ invoices?: Invoice[]; data?: Invoice[] }>(
        `/invoices/open/${clientId}`
      )
      return response.data.invoices || response.data.data || []
    } catch (error) {
      handleError(error, `get open invoices for client ${clientId} | جلب الفواتير المفتوحة للعميل ${clientId}`)
    }
  },

  /**
   * Send invoice to client
   * POST /api/v1/invoices/:id/send
   */
  send: async (id: string, data?: { email?: string; message?: string }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/send`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to send invoice | فشل إرسال الفاتورة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `send invoice ${id} | إرسال الفاتورة ${id}`)
    }
  },

  /**
   * Record payment on invoice
   * POST /api/v1/invoices/:id/record-payment
   */
  recordPayment: async (id: string, data: RecordPaymentData): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error(
        'Valid payment amount is required | مبلغ الدفع الصحيح مطلوب'
      )
    }

    if (!data.paymentDate) {
      throw new Error(
        'Payment date is required | تاريخ الدفع مطلوب'
      )
    }

    if (!data.paymentMethod) {
      throw new Error(
        'Payment method is required | طريقة الدفع مطلوبة'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/record-payment`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to record payment | فشل تسجيل الدفع'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `record payment for invoice ${id} | تسجيل الدفع للفاتورة ${id}`)
    }
  },

  /**
   * Void invoice
   * POST /api/v1/invoices/:id/void
   */
  void: async (id: string, reason?: string): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/void`,
        { reason }
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to void invoice | فشل إلغاء الفاتورة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `void invoice ${id} | إلغاء الفاتورة ${id}`)
    }
  },

  /**
   * Duplicate invoice
   * POST /api/v1/invoices/:id/duplicate
   */
  duplicate: async (id: string): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/duplicate`
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to duplicate invoice | فشل تكرار الفاتورة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `duplicate invoice ${id} | تكرار الفاتورة ${id}`)
    }
  },

  /**
   * Send reminder for invoice
   * POST /api/v1/invoices/:id/send-reminder
   */
  sendReminder: async (id: string, data?: { message?: string; sendEmail?: boolean }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/send-reminder`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to send reminder | فشل إرسال التذكير'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `send reminder for invoice ${id} | إرسال تذكير للفاتورة ${id}`)
    }
  },

  /**
   * Convert invoice to credit note
   * POST /api/v1/invoices/:id/convert-to-credit-note
   */
  convertToCreditNote: async (id: string): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/convert-to-credit-note`
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to convert to credit note | فشل التحويل إلى إشعار دائن'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `convert invoice ${id} to credit note | تحويل الفاتورة ${id} إلى إشعار دائن`)
    }
  },

  /**
   * Apply retainer to invoice
   * POST /api/v1/invoices/:id/apply-retainer
   */
  applyRetainer: async (id: string, data: { retainerId: string; amount: number }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    if (!data.retainerId) {
      throw new Error(
        'Retainer ID is required | معرف الأمانة مطلوب'
      )
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error(
        'Valid amount is required | المبلغ الصحيح مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/apply-retainer`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to apply retainer | فشل تطبيق الأمانة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `apply retainer to invoice ${id} | تطبيق الأمانة على الفاتورة ${id}`)
    }
  },

  /**
   * Submit invoice for approval
   * POST /api/v1/invoices/:id/submit-for-approval
   */
  submitForApproval: async (id: string, data?: { comments?: string }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/submit-for-approval`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to submit for approval | فشل تقديم الطلب للموافقة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `submit invoice ${id} for approval | تقديم الفاتورة ${id} للموافقة`)
    }
  },

  /**
   * Approve invoice
   * POST /api/v1/invoices/:id/approve
   */
  approve: async (id: string, data?: { comments?: string }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/approve`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to approve invoice | فشلت الموافقة على الفاتورة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `approve invoice ${id} | الموافقة على الفاتورة ${id}`)
    }
  },

  /**
   * Reject invoice
   * POST /api/v1/invoices/:id/reject
   */
  reject: async (id: string, data: { reason: string }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    if (!data.reason) {
      throw new Error(
        'Rejection reason is required | سبب الرفض مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/reject`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to reject invoice | فشل رفض الفاتورة'
        )
      }

      return invoice
    } catch (error) {
      handleError(error, `reject invoice ${id} | رفض الفاتورة ${id}`)
    }
  },

  /**
   * Submit invoice to ZATCA
   * POST /api/v1/invoices/:id/zatca/submit
   */
  submitToZATCA: async (id: string): Promise<any> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post(`/invoices/${id}/zatca/submit`)
      return response.data
    } catch (error) {
      handleError(error, `submit invoice ${id} to ZATCA | إرسال الفاتورة ${id} إلى هيئة الزكاة`)
    }
  },

  /**
   * Get ZATCA submission status
   * GET /api/v1/invoices/:id/zatca/status
   */
  getZATCAStatus: async (id: string): Promise<any> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.get(`/invoices/${id}/zatca/status`)
      return response.data
    } catch (error) {
      handleError(error, `get ZATCA status for invoice ${id} | الحصول على حالة هيئة الزكاة للفاتورة ${id}`)
    }
  },

  /**
   * Export invoice as PDF
   * GET /api/v1/invoices/:id/pdf
   */
  exportPdf: async (id: string): Promise<Blob> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      handleError(error, `export invoice ${id} as PDF | تصدير الفاتورة ${id} كـ PDF`)
    }
  },

  /**
   * Export invoice as XML (UBL 2.1 format for ZATCA)
   * GET /api/v1/invoices/:id/xml
   */
  exportXml: async (id: string): Promise<Blob> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.get(`/invoices/${id}/xml`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      handleError(error, `export invoice ${id} as XML | تصدير الفاتورة ${id} كـ XML`)
    }
  },

  /**
   * Confirm payment (webhook)
   * PATCH /api/v1/invoices/confirm-payment
   * Note: This is typically called by payment gateway webhooks
   */
  confirmPayment: async (data: { invoiceId: string; paymentIntentId: string }): Promise<any> => {
    if (!data.invoiceId) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    if (!data.paymentIntentId) {
      throw new Error(
        'Payment intent ID is required | معرف نية الدفع مطلوب'
      )
    }

    try {
      const response = await apiClient.post('/invoices/confirm-payment', data)
      return response.data
    } catch (error) {
      handleError(error, 'confirm payment | تأكيد الدفع')
    }
  },

  // ==================== POTENTIAL MISSING ENDPOINTS ====================
  // The following endpoints exist in financeService but are NOT documented
  // in API_ROUTES_REFERENCE.ts - they may not exist in the backend

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Create payment intent (Stripe)
   * POST /api/v1/invoices/:id/payment
   */
  createPaymentIntent: async (id: string, data?: any): Promise<any> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    try {
      const response = await apiClient.post(`/invoices/${id}/payment`, data)
      return response.data
    } catch (error) {
      // If 404, the endpoint doesn't exist
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Payment intent endpoint not available. This feature may not be implemented yet. | نقطة الدفع غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, `create payment intent for invoice ${id} | إنشاء نية دفع للفاتورة ${id}`)
    }
  },

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Get invoices pending approval
   * GET /api/v1/invoices/pending-approval
   */
  getPendingApproval: async (filters?: {
    status?: 'pending' | 'approved' | 'rejected'
    clientId?: string
    minAmount?: number
    maxAmount?: number
    startDate?: string
    endDate?: string
  }): Promise<InvoiceListResponse> => {
    try {
      const response = await apiClient.get<InvoiceListResponse>('/invoices/pending-approval', {
        params: filters
      })
      return {
        invoices: response.data.invoices || [],
        total: response.data.total || 0,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Pending approval endpoint not available. This feature may not be implemented yet. | نقطة الموافقات المعلقة غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, 'get pending approval invoices | جلب الفواتير المعلقة للموافقة')
    }
  },

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Request changes to invoice
   * POST /api/v1/invoices/:id/request-changes
   */
  requestChanges: async (id: string, data: { requestedChanges: string; comments?: string }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    if (!data.requestedChanges) {
      throw new Error(
        'Requested changes description is required | وصف التغييرات المطلوبة مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/request-changes`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to request changes | فشل طلب التغييرات'
        )
      }

      return invoice
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Request changes endpoint not available. This feature may not be implemented yet. | نقطة طلب التغييرات غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, `request changes for invoice ${id} | طلب التغييرات للفاتورة ${id}`)
    }
  },

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Escalate invoice approval
   * POST /api/v1/invoices/:id/escalate
   */
  escalateApproval: async (id: string, data: { reason: string; comments?: string }): Promise<Invoice> => {
    if (!id) {
      throw new Error(
        'Invoice ID is required | معرف الفاتورة مطلوب'
      )
    }

    if (!data.reason) {
      throw new Error(
        'Escalation reason is required | سبب التصعيد مطلوب'
      )
    }

    try {
      const response = await apiClient.post<{ invoice?: Invoice; data?: Invoice }>(
        `/invoices/${id}/escalate`,
        data
      )
      const invoice = response.data.invoice || response.data.data

      if (!invoice) {
        throw new Error(
          'Failed to escalate approval | فشل تصعيد الموافقة'
        )
      }

      return invoice
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Escalate approval endpoint not available. This feature may not be implemented yet. | نقطة تصعيد الموافقة غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, `escalate approval for invoice ${id} | تصعيد الموافقة للفاتورة ${id}`)
    }
  },

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Bulk approve invoices
   * POST /api/v1/invoices/bulk-approve
   */
  bulkApprove: async (data: { invoiceIds: string[]; comments?: string }): Promise<{
    approved: number
    failed: number
    results: any[]
  }> => {
    if (!data.invoiceIds || data.invoiceIds.length === 0) {
      throw new Error(
        'At least one invoice ID is required | معرف فاتورة واحد على الأقل مطلوب'
      )
    }

    try {
      const response = await apiClient.post('/invoices/bulk-approve', data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Bulk approve endpoint not available. This feature may not be implemented yet. | نقطة الموافقة الجماعية غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, 'bulk approve invoices | الموافقة الجماعية على الفواتير')
    }
  },

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Get approval workflow configuration
   * GET /api/v1/invoices/approval-config
   */
  getApprovalConfig: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/invoices/approval-config')
      return response.data.config || response.data.data || response.data
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Approval config endpoint not available. This feature may not be implemented yet. | نقطة إعدادات الموافقة غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, 'get approval workflow config | جلب إعدادات سير عمل الموافقة')
    }
  },

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Update approval workflow configuration
   * PUT /api/v1/invoices/approval-config
   */
  updateApprovalConfig: async (config: any): Promise<any> => {
    try {
      const response = await apiClient.put('/invoices/approval-config', config)
      return response.data.config || response.data.data
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Update approval config endpoint not available. This feature may not be implemented yet. | نقطة تحديث إعدادات الموافقة غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, 'update approval workflow config | تحديث إعدادات سير عمل الموافقة')
    }
  },

  /**
   * ⚠️ WARNING: This endpoint may not exist in the backend
   * Get pending approvals count
   * GET /api/v1/invoices/pending-approvals-count
   */
  getPendingApprovalsCount: async (): Promise<{ count: number }> => {
    try {
      const response = await apiClient.get<{ count: number }>('/invoices/pending-approvals-count')
      return {
        count: response.data.count || 0
      }
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        throw new Error(
          'Pending approvals count endpoint not available. This feature may not be implemented yet. | نقطة عد الموافقات المعلقة غير متاحة. قد لا تكون هذه الميزة منفذة بعد.'
        )
      }
      handleError(error, 'get pending approvals count | جلب عدد الموافقات المعلقة')
    }
  },
}

export default invoiceService
