/**
 * Finance Service
 * Handles all finance-related API calls (invoices, expenses, time tracking, payments, etc.)
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== INVOICES ====================
 */

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
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
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

export interface InvoiceFilters {
  status?: string
  clientId?: string
  caseId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/**
 * ==================== CREDIT NOTES ====================
 */

export interface CreditNote {
  _id: string
  creditNoteNumber: string
  originalInvoiceId: string | Invoice
  caseId?: string
  lawyerId: string | { firstName: string; lastName: string; name?: string }
  clientId: string | { firstName: string; lastName: string; name?: string }
  items: CreditNoteItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  creditType: 'full' | 'partial'
  reason: string
  reasonCategory: 'error' | 'discount' | 'return' | 'cancellation' | 'adjustment' | 'other'
  status: 'draft' | 'issued' | 'applied' | 'void'
  issueDate: string
  appliedDate?: string
  notes?: string
  pdfUrl?: string
  zatcaStatus?: 'pending' | 'submitted' | 'approved' | 'rejected'
  zatcaSubmissionDate?: string
  zatcaUUID?: string
  history?: CreditNoteHistory[]
  createdAt: string
  updatedAt: string
}

export interface CreditNoteItem {
  originalItemId?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface CreditNoteHistory {
  action: string
  performedBy: string
  timestamp: string
  details?: any
}

export interface CreateCreditNoteData {
  originalInvoiceId: string
  clientId: string
  caseId?: string
  items: CreditNoteItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  creditType: 'full' | 'partial'
  reason: string
  reasonCategory: 'error' | 'discount' | 'return' | 'cancellation' | 'adjustment' | 'other'
  issueDate?: string
  notes?: string
}

export interface CreditNoteFilters {
  status?: string
  clientId?: string
  originalInvoiceId?: string
  startDate?: string
  endDate?: string
  reasonCategory?: string
  page?: number
  limit?: number
}

/**
 * ==================== EXPENSES ====================
 */

export interface Expense {
  _id: string
  expenseId: string
  description: string
  amount: number
  category: string
  caseId?: string
  userId: string | { firstName: string; lastName: string; name?: string }
  date: string
  paymentMethod: string
  vendor?: string
  isBillable: boolean
  billableAmount?: number
  markupType?: string
  markupValue?: number
  status: string
  reimbursementStatus?: string
  receipts: Receipt[]
  notes?: string
  history?: any[]
  createdAt: string
  updatedAt: string
}

export interface Receipt {
  fileName: string
  fileUrl: string
  fileType: string
  uploadedAt: string
}

export interface CreateExpenseData {
  description: string
  amount: number
  category: string
  caseId?: string
  date: string
  paymentMethod: string
  vendor?: string
  isBillable?: boolean
  markupType?: string
  markupValue?: number
  notes?: string
}

export interface ExpenseFilters {
  status?: string
  category?: string
  caseId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/**
 * ==================== TIME TRACKING ====================
 */

export interface TimeEntry {
  _id: string
  entryId: string
  description: string

  // Assignment
  lawyerId: string | { firstName: string; lastName: string; _id: string }
  assigneeId?: string | { firstName: string; lastName: string; _id: string }
  userId?: string | { firstName: string; lastName: string }

  // Related entities
  clientId: string | { firstName: string; lastName: string; _id: string }
  caseId?: string | { caseNumber: string; title: string; _id: string }

  // Time data
  date: string
  startTime?: string
  endTime?: string
  breakMinutes?: number
  duration: number // in minutes
  hours?: number // computed (duration / 60)

  // Activity & Classification
  activityCode?: string // UTBMS code
  timeType?: 'billable' | 'non_billable' | 'pro_bono' | 'internal'

  // Billing
  hourlyRate: number // in halalas
  totalAmount: number // in halalas
  isBillable: boolean
  isBilled: boolean
  billStatus?: 'draft' | 'unbilled' | 'billed' | 'written_off'
  invoiceId?: string

  // Write-off / Write-down
  writeOff?: boolean
  writeOffReason?: string
  writeDown?: boolean
  writeDownAmount?: number
  writeDownReason?: string

  // Organization
  departmentId?: string | { name: string; _id: string }
  locationId?: string | { name: string; _id: string }
  practiceArea?: string
  phase?: string
  taskId?: string | { title: string; _id: string }

  // Timer
  wasTimerBased: boolean
  timerStartedAt?: string

  // Lock & Security
  isLocked: boolean
  lockedAt?: string
  lockedBy?: string | { firstName: string; lastName: string; _id: string }
  lockReason?: 'approved' | 'billed' | 'period_closed' | 'manual'
  unlockHistory?: Array<{
    unlockedAt: string
    unlockedBy: string
    reason: string
    relockedAt?: string
  }>

  // Status & Audit
  status: string
  notes?: string
  history?: any[]
  createdAt: string
  updatedAt: string
}

export interface CreateTimeEntryData {
  // Required fields
  caseId?: string
  clientId: string
  date: string
  description: string
  duration: number // in minutes
  hourlyRate: number // in halalas

  // Activity & Classification
  activityCode?: string // UTBMS code e.g., 'L110'
  timeType?: 'billable' | 'non_billable' | 'pro_bono' | 'internal'
  isBillable?: boolean

  // Billing adjustments
  billStatus?: 'draft' | 'unbilled' | 'billed' | 'written_off'
  writeOff?: boolean
  writeOffReason?: string
  writeDown?: boolean
  writeDownAmount?: number // in halalas
  writeDownReason?: string

  // Time tracking
  startTime?: string // HH:mm format
  endTime?: string // HH:mm format
  breakMinutes?: number

  // Assignment
  assigneeId?: string // Attorney/User ID

  // Organization
  departmentId?: string
  locationId?: string
  practiceArea?: string
  phase?: string
  taskId?: string

  // Notes
  notes?: string
}

export interface TimeEntryFilters {
  status?: string
  caseId?: string
  clientId?: string
  startDate?: string
  endDate?: string
  isBillable?: boolean
  activityCode?: string
  page?: number
  limit?: number
}

export interface TimerStatus {
  isRunning: boolean
  timer: {
    startedAt: string
    description: string
    caseId: string
    activityCode: string
    hourlyRate: number
    isPaused: boolean
    pausedAt?: string
    elapsedMinutes: number
    pausedDuration: number
  } | null
}

/**
 * ==================== PAYMENTS ====================
 */

export interface Payment {
  _id: string
  paymentNumber: string
  clientId: string
  invoiceId?: string
  caseId?: string
  lawyerId: string
  paymentDate: string
  amount: number
  currency: string
  paymentMethod: string
  transactionId?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentData {
  clientId: string
  invoiceId?: string
  caseId?: string
  amount: number
  currency?: string
  paymentMethod: string
  transactionId?: string
  notes?: string
}

/**
 * ==================== TRANSACTIONS ====================
 */

export interface Transaction {
  _id: string
  transactionId: string
  userId: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category: string
  description: string
  paymentMethod?: string
  date: string
  status: string
  reference?: string
  invoiceId?: string
  expenseId?: string
  bank?: string
  account?: string
  notes?: string
  history?: any[]
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionData {
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category: string
  description: string
  paymentMethod?: string
  date: string
  notes?: string
}

/**
 * ==================== STATEMENTS ====================
 */

export interface Statement {
  _id: string
  statementNumber: string
  clientId: string
  clientName: string
  period: string
  startDate: string
  endDate: string
  items: StatementItem[]
  totalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'archived'
  generatedDate: string
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StatementItem {
  _id: string
  type: 'invoice' | 'payment' | 'expense' | 'adjustment'
  reference: string
  description: string
  date: string
  amount: number
}

export interface CreateStatementData {
  clientId: string
  period: string
  startDate: string
  endDate: string
  items?: StatementItem[]
  notes?: string
  status?: 'draft' | 'sent'
}

/**
 * ==================== FINANCIAL ACTIVITY ====================
 */

export interface FinancialActivity {
  _id: string
  activityId: string
  date: string
  time: string
  type: 'payment_received' | 'payment_sent' | 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'expense_created' | 'expense_approved' | 'transaction_created'
  title: string
  description: string
  reference: string
  amount: number
  userId: string
  userName: string
  status: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface CreateActivityData {
  type: 'payment_received' | 'payment_sent' | 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'expense_created' | 'expense_approved' | 'transaction_created'
  title: string
  description: string
  reference: string
  amount: number
  status?: string
  metadata?: any
}

/**
 * Finance Service Object
 */
const financeService = {
  // ==================== INVOICES ====================

  /**
   * Get all invoices
   */
  getInvoices: async (filters?: InvoiceFilters): Promise<{ invoices: Invoice[]; total: number }> => {
    try {
      const response = await apiClient.get('/invoices', { params: filters })
      return {
        invoices: response.data.invoices || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single invoice
   */
  getInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.get(`/invoices/${id}`)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create invoice
   */
  createInvoice: async (data: CreateInvoiceData): Promise<Invoice> => {
    try {
      const response = await apiClient.post('/invoices', data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update invoice
   */
  updateInvoice: async (id: string, data: Partial<CreateInvoiceData>): Promise<Invoice> => {
    try {
      const response = await apiClient.patch(`/invoices/${id}`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send invoice
   */
  sendInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/send`)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete invoice
   */
  deleteInvoice: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/invoices/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get overdue invoices
   */
  getOverdueInvoices: async (): Promise<Invoice[]> => {
    try {
      const response = await apiClient.get('/invoices/overdue')
      return response.data.invoices || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get invoice statistics
   * GET /api/invoices/stats
   */
  getInvoiceStats: async (): Promise<{
    total: number
    byStatus: Record<string, number>
    totalRevenue: number
    totalOutstanding: number
    averageInvoiceAmount: number
    averageDaysToPayment: number
  }> => {
    try {
      const response = await apiClient.get('/invoices/stats')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get unbilled time entries and expenses
   * GET /api/invoices/billable-items
   */
  getBillableItems: async (params?: { clientId?: string; caseId?: string }): Promise<{
    timeEntries: any[]
    expenses: any[]
    totals: { timeAmount: number; expenseAmount: number; totalAmount: number }
  }> => {
    try {
      const response = await apiClient.get('/invoices/billable-items', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Record payment on invoice
   * POST /api/invoices/:id/record-payment
   */
  recordPayment: async (id: string, data: {
    amount: number
    paymentDate: string
    paymentMethod: string
    reference?: string
  }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/record-payment`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Void invoice
   * POST /api/invoices/:id/void
   */
  voidInvoice: async (id: string, reason?: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/void`, { reason })
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate invoice
   * POST /api/invoices/:id/duplicate
   */
  duplicateInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/duplicate`)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send reminder
   * POST /api/invoices/:id/send-reminder
   */
  sendInvoiceReminder: async (id: string, data?: { message?: string; sendEmail?: boolean }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/send-reminder`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Convert to credit note
   * POST /api/invoices/:id/convert-to-credit-note
   */
  convertToCreditNote: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/convert-to-credit-note`)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Apply retainer to invoice
   * POST /api/invoices/:id/apply-retainer
   */
  applyRetainer: async (id: string, data: { retainerId: string; amount: number }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/apply-retainer`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit invoice for approval
   * POST /api/invoices/:id/submit-for-approval
   */
  submitForApproval: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/submit-for-approval`)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve invoice
   * POST /api/invoices/:id/approve
   */
  approveInvoice: async (id: string, data?: { comments?: string }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/approve`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject invoice
   * POST /api/invoices/:id/reject
   */
  rejectInvoice: async (id: string, data: { reason: string }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/reject`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit invoice to ZATCA
   * POST /api/invoices/:id/zatca/submit
   */
  submitToZATCA: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/zatca/submit`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get ZATCA status
   * GET /api/invoices/:id/zatca/status
   */
  getZATCAStatus: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/invoices/${id}/zatca/status`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get open invoices for a client (for payment allocation)
   * GET /api/invoices/open/:clientId
   */
  getOpenInvoices: async (clientId: string): Promise<Invoice[]> => {
    try {
      const response = await apiClient.get(`/invoices/open/${clientId}`)
      return response.data.invoices || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export invoice to XML (UBL 2.1 format for ZATCA)
   * GET /api/invoices/:id/xml
   */
  exportInvoiceXml: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/invoices/${id}/xml`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create payment intent (Stripe)
   * POST /api/invoices/:id/payment
   */
  createInvoicePaymentIntent: async (id: string, data?: any): Promise<any> => {
    try {
      const response = await apiClient.post(`/invoices/${id}/payment`, data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Confirm payment (Stripe webhook)
   * PATCH /api/invoices/confirm-payment
   */
  confirmInvoicePayment: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.patch('/invoices/confirm-payment', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export invoice to PDF
   * GET /api/invoices/:id/pdf
   */
  exportInvoicePdf: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CREDIT NOTES ====================

  /**
   * Get all credit notes
   * GET /api/credit-notes
   */
  getCreditNotes: async (filters?: CreditNoteFilters): Promise<{ creditNotes: CreditNote[]; total: number }> => {
    try {
      const response = await apiClient.get('/credit-notes', { params: filters })
      return {
        creditNotes: response.data.creditNotes || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single credit note
   * GET /api/credit-notes/:id
   */
  getCreditNote: async (id: string): Promise<CreditNote> => {
    try {
      const response = await apiClient.get(`/credit-notes/${id}`)
      return response.data.creditNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create credit note
   * POST /api/credit-notes
   */
  createCreditNote: async (data: CreateCreditNoteData): Promise<CreditNote> => {
    try {
      const response = await apiClient.post('/credit-notes', data)
      return response.data.creditNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update credit note
   * PATCH /api/credit-notes/:id
   */
  updateCreditNote: async (id: string, data: Partial<CreateCreditNoteData>): Promise<CreditNote> => {
    try {
      const response = await apiClient.patch(`/credit-notes/${id}`, data)
      return response.data.creditNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete credit note
   * DELETE /api/credit-notes/:id
   */
  deleteCreditNote: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/credit-notes/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Issue credit note (change status from draft to issued)
   * POST /api/credit-notes/:id/issue
   */
  issueCreditNote: async (id: string): Promise<CreditNote> => {
    try {
      const response = await apiClient.post(`/credit-notes/${id}/issue`)
      return response.data.creditNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Apply credit note to invoice
   * POST /api/credit-notes/:id/apply
   */
  applyCreditNote: async (id: string): Promise<CreditNote> => {
    try {
      const response = await apiClient.post(`/credit-notes/${id}/apply`)
      return response.data.creditNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Void credit note
   * POST /api/credit-notes/:id/void
   */
  voidCreditNote: async (id: string, reason?: string): Promise<CreditNote> => {
    try {
      const response = await apiClient.post(`/credit-notes/${id}/void`, { reason })
      return response.data.creditNote || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get credit notes for an invoice
   * GET /api/credit-notes/invoice/:invoiceId
   */
  getCreditNotesForInvoice: async (invoiceId: string): Promise<CreditNote[]> => {
    try {
      const response = await apiClient.get(`/credit-notes/invoice/${invoiceId}`)
      return response.data.creditNotes || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit credit note to ZATCA
   * POST /api/credit-notes/:id/zatca/submit
   */
  submitCreditNoteToZATCA: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/credit-notes/${id}/zatca/submit`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get credit note ZATCA status
   * GET /api/credit-notes/:id/zatca/status
   */
  getCreditNoteZATCAStatus: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/credit-notes/${id}/zatca/status`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export credit note to PDF
   * GET /api/credit-notes/:id/pdf
   */
  exportCreditNotePdf: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/credit-notes/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export credit note to XML (UBL 2.1 format for ZATCA)
   * GET /api/credit-notes/:id/xml
   */
  exportCreditNoteXml: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/credit-notes/${id}/xml`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== EXPENSES ====================

  /**
   * Get all expenses
   */
  getExpenses: async (filters?: ExpenseFilters): Promise<{ expenses: Expense[]; total: number }> => {
    try {
      const response = await apiClient.get('/expenses', { params: filters })
      return {
        expenses: response.data.expenses || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single expense
   */
  getExpense: async (id: string): Promise<Expense> => {
    try {
      const response = await apiClient.get(`/expenses/${id}`)
      return response.data.expense || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create expense
   */
  createExpense: async (data: CreateExpenseData): Promise<Expense> => {
    try {
      const response = await apiClient.post('/expenses', data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update expense
   */
  updateExpense: async (id: string, data: Partial<CreateExpenseData>): Promise<Expense> => {
    try {
      const response = await apiClient.put(`/expenses/${id}`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload receipt
   */
  uploadReceipt: async (id: string, file: File): Promise<Receipt> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/expenses/${id}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.receipt || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get expense statistics
   */
  getExpenseStats: async (filters?: { startDate?: string; endDate?: string; caseId?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/expenses/stats', { params: filters })
      return response.data.stats || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete expense
   */
  deleteExpense: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/expenses/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get new expense defaults
   * GET /api/expenses/new
   */
  getNewExpenseDefaults: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/expenses/new')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get expense categories
   * GET /api/expenses/categories
   */
  getExpenseCategories: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/expenses/categories')
      return response.data.categories || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get expenses by category
   * GET /api/expenses/by-category
   */
  getExpensesByCategory: async (filters?: any): Promise<any> => {
    try {
      const response = await apiClient.get('/expenses/by-category', { params: filters })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Suggest category (AI-powered)
   * POST /api/expenses/suggest-category
   */
  suggestExpenseCategory: async (data: { description: string; vendor?: string; amount?: number }): Promise<any> => {
    try {
      const response = await apiClient.post('/expenses/suggest-category', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit expense for approval
   * POST /api/expenses/:id/submit
   */
  submitExpense: async (id: string): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/submit`)
      return response.data.expense || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve expense
   * POST /api/expenses/:id/approve
   */
  approveExpense: async (id: string, data?: { comments?: string }): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/approve`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject expense
   * POST /api/expenses/:id/reject
   */
  rejectExpense: async (id: string, data: { reason: string }): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/reject`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark expense as reimbursed
   * POST /api/expenses/:id/reimburse
   */
  markExpenseAsReimbursed: async (id: string, data?: { paymentMethod?: string; reference?: string }): Promise<Expense> => {
    try {
      const response = await apiClient.post(`/expenses/${id}/reimburse`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk approve expenses
   * POST /api/expenses/bulk-approve
   */
  bulkApproveExpenses: async (data: { expenseIds: string[]; comments?: string }): Promise<any> => {
    try {
      const response = await apiClient.post('/expenses/bulk-approve', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TIME TRACKING ====================

  /**
   * Start timer
   */
  startTimer: async (data: {
    caseId: string
    clientId: string
    activityCode?: string
    description: string
  }): Promise<TimerStatus> => {
    try {
      const response = await apiClient.post('/time-tracking/timer/start', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pause timer
   */
  pauseTimer: async (): Promise<TimerStatus> => {
    try {
      const response = await apiClient.post('/time-tracking/timer/pause')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resume timer
   */
  resumeTimer: async (): Promise<TimerStatus> => {
    try {
      const response = await apiClient.post('/time-tracking/timer/resume')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Stop timer
   */
  stopTimer: async (data: { notes?: string; isBillable?: boolean }): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post('/time-tracking/timer/stop', data)
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get timer status
   */
  getTimerStatus: async (): Promise<TimerStatus> => {
    try {
      const response = await apiClient.get('/time-tracking/timer/status')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create manual time entry
   */
  createTimeEntry: async (data: CreateTimeEntryData): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post('/time-tracking/entries', data)
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get time entries
   */
  getTimeEntries: async (filters?: TimeEntryFilters): Promise<{ data: TimeEntry[]; pagination: any; summary: any }> => {
    try {
      const response = await apiClient.get('/time-tracking/entries', {
        params: filters,
      })
      // Backend returns { success: true, data: { entries: [...], total, page, totalPages, summary } }
      const responseData = response.data.data || response.data
      return {
        data: responseData?.entries || responseData || [],
        pagination: {
          total: responseData?.total || 0,
          page: responseData?.page || 1,
          totalPages: responseData?.totalPages || 1,
        },
        summary: responseData?.summary || null,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single time entry
   */
  getTimeEntry: async (id: string): Promise<{ data: TimeEntry }> => {
    try {
      const response = await apiClient.get(`/time-tracking/entries/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get time statistics
   */
  getTimeStats: async (filters?: { startDate?: string; endDate?: string; caseId?: string }): Promise<any> => {
    try {
      const response = await apiClient.get('/time-tracking/stats', {
        params: filters,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update time entry
   */
  updateTimeEntry: async (id: string, data: Partial<CreateTimeEntryData>): Promise<TimeEntry> => {
    try {
      const response = await apiClient.patch(`/time-tracking/entries/${id}`, data)
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete time entry
   */
  deleteTimeEntry: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/time-tracking/entries/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get unbilled time entries
   */
  getUnbilledEntries: async (filters?: {
    caseId?: string
    clientId?: string
    assigneeId?: string
  }): Promise<{ data: TimeEntry[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/time-tracking/unbilled', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get UTBMS activity codes
   */
  getActivityCodes: async (): Promise<Array<{
    code: string
    description: string
    category: string
  }>> => {
    try {
      const response = await apiClient.get('/time-tracking/activity-codes')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete time entries
   */
  bulkDeleteTimeEntries: async (entryIds: string[]): Promise<{
    deleted: number
    failed: number
  }> => {
    try {
      const response = await apiClient.delete('/time-tracking/entries/bulk', {
        data: { entryIds }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk approve time entries
   */
  bulkApproveTimeEntries: async (entryIds: string[]): Promise<{
    approved: number
    failed: number
  }> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/bulk-approve', {
        entryIds
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Write off a time entry (شطب الوقت)
   */
  writeOffTimeEntry: async (id: string, reason: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/write-off`, {
        reason
      })
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Write down a time entry (تخفيض المبلغ)
   */
  writeDownTimeEntry: async (id: string, data: {
    amount: number
    reason: string
  }): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/write-down`, data)
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve time entry
   */
  approveTimeEntry: async (id: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/approve`)
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject time entry
   */
  rejectTimeEntry: async (id: string, reason: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/reject`, {
        reason
      })
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Lock time entry
   * POST /api/time-tracking/entries/:id/lock
   */
  lockTimeEntry: async (id: string, reason: 'approved' | 'billed' | 'period_closed' | 'manual'): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/lock`, {
        reason
      })
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unlock time entry (admin only)
   * POST /api/time-tracking/entries/:id/unlock
   */
  unlockTimeEntry: async (id: string, reason: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/unlock`, {
        reason
      })
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk lock time entries
   * POST /api/time-tracking/entries/bulk-lock
   */
  bulkLockTimeEntries: async (data: {
    entryIds: string[]
    reason: 'approved' | 'billed' | 'period_closed' | 'manual'
  }): Promise<{ locked: number; failed: number; results: any[] }> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/bulk-lock', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if time entry is locked
   * GET /api/time-tracking/entries/:id/lock-status
   */
  isTimeEntryLocked: async (id: string): Promise<{
    isLocked: boolean
    lockReason?: string
    lockedAt?: string
    lockedBy?: string
  }> => {
    try {
      const response = await apiClient.get(`/time-tracking/entries/${id}/lock-status`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Lock entries by date range (for period close)
   * POST /api/time-tracking/entries/lock-by-date-range
   */
  lockTimeEntriesByDateRange: async (data: {
    startDate: string
    endDate: string
    reason: 'period_closed' | 'manual'
  }): Promise<{ locked: number; failed: number; results: any[] }> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/lock-by-date-range', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== PAYMENTS ====================

  /**
   * Get all payments
   */
  getPayments: async (filters?: any): Promise<{ data: Payment[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/payments', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create payment
   */
  createPayment: async (data: CreatePaymentData): Promise<Payment> => {
    try {
      const response = await apiClient.post('/payments', data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single payment
   */
  getPayment: async (id: string): Promise<{ payment: Payment }> => {
    try {
      const response = await apiClient.get(`/payments/${id}`)
      return { payment: response.data.payment || response.data.data || response.data }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete payment
   */
  completePayment: async (id: string): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/payments/${id}/complete`)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Record payment for invoice
   */
  recordPaymentForInvoice: async (invoiceId: string, data: CreatePaymentData): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/payments`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get payments summary
   */
  getPaymentsSummary: async (filters?: any): Promise<any> => {
    try {
      const response = await apiClient.get('/payments/summary', { params: filters })
      return response.data.summary || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get new payment defaults
   * GET /api/payments/new
   */
  getNewPaymentDefaults: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/payments/new')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get payment statistics
   * GET /api/payments/stats
   */
  getPaymentStats: async (filters?: any): Promise<any> => {
    try {
      const response = await apiClient.get('/payments/stats', { params: filters })
      return response.data.stats || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get unreconciled payments
   * GET /api/payments/unreconciled
   */
  getUnreconciledPayments: async (): Promise<Payment[]> => {
    try {
      const response = await apiClient.get('/payments/unreconciled')
      return response.data.payments || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pending checks
   * GET /api/payments/pending-checks
   */
  getPendingChecks: async (): Promise<Payment[]> => {
    try {
      const response = await apiClient.get('/payments/pending-checks')
      return response.data.payments || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update payment
   * PUT /api/payments/:id
   */
  updatePayment: async (id: string, data: Partial<CreatePaymentData>): Promise<Payment> => {
    try {
      const response = await apiClient.put(`/payments/${id}`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete payment
   * DELETE /api/payments/:id
   */
  deletePayment: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/payments/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete payments
   * DELETE /api/payments/bulk
   */
  bulkDeletePayments: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.delete('/payments/bulk', { data: { ids } })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark payment as failed
   * POST /api/payments/:id/fail
   */
  failPayment: async (id: string): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/payments/${id}/fail`)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create refund for a payment
   * POST /api/payments/:id/refund
   */
  createRefund: async (id: string, data: { amount: number; reason?: string }): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/payments/${id}/refund`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reconcile payment with bank statement
   * POST /api/payments/:id/reconcile
   */
  reconcilePayment: async (id: string, data: { bankStatementId?: string; date?: string }): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/payments/${id}/reconcile`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Apply payment to invoices
   * PUT /api/payments/:id/apply
   */
  applyPaymentToInvoices: async (id: string, data: { invoices: Array<{ invoiceId: string; amount: number }> }): Promise<Payment> => {
    try {
      const response = await apiClient.put(`/payments/${id}/apply`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unapply payment from a specific invoice
   * DELETE /api/payments/:id/unapply/:invoiceId
   */
  unapplyPaymentFromInvoice: async (id: string, invoiceId: string): Promise<Payment> => {
    try {
      const response = await apiClient.delete(`/payments/${id}/unapply/${invoiceId}`)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update check status (deposited, cleared, bounced)
   * PUT /api/payments/:id/check-status
   */
  updateCheckStatus: async (id: string, data: { status: string; date?: string; notes?: string }): Promise<Payment> => {
    try {
      const response = await apiClient.put(`/payments/${id}/check-status`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send/resend receipt email
   * POST /api/payments/:id/send-receipt
   */
  sendPaymentReceipt: async (id: string, data?: { email?: string; message?: string }): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/payments/${id}/send-receipt`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate payment receipt
   * POST /api/payments/:id/generate-receipt
   */
  generateReceipt: async (id: string, options?: { language?: 'ar' | 'en' | 'both' }): Promise<{ receipt: any }> => {
    try {
      const response = await apiClient.post(`/payments/${id}/generate-receipt`, options)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Download payment receipt as PDF
   * GET /api/payments/:id/receipt/download
   */
  downloadReceipt: async (id: string, language: 'ar' | 'en' = 'ar'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/payments/${id}/receipt/download`, {
        params: { language },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get receipt data (for preview)
   * GET /api/payments/:id/receipt
   */
  getReceipt: async (id: string): Promise<{ receipt: any }> => {
    try {
      const response = await apiClient.get(`/payments/${id}/receipt`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send receipt via email
   * POST /api/payments/:id/receipt/send
   */
  sendReceipt: async (id: string, data: {
    email: string
    language?: 'ar' | 'en' | 'both'
    message?: string
  }): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post(`/payments/${id}/receipt/send`, data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TRANSACTIONS ====================

  /**
   * Get all transactions
   */
  getTransactions: async (filters?: any): Promise<{ data: Transaction[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/transactions', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single transaction
   */
  getTransaction: async (id: string): Promise<{ data: Transaction }> => {
    try {
      const response = await apiClient.get(`/transactions/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create transaction
   */
  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    try {
      const response = await apiClient.post('/transactions', data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get account balance
   */
  getAccountBalance: async (upToDate?: string): Promise<{ balance: number; asOfDate: string }> => {
    try {
      const response = await apiClient.get('/transactions/balance', {
        params: { upToDate },
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transaction summary
   */
  getTransactionSummary: async (filters?: any): Promise<any> => {
    try {
      const response = await apiClient.get('/transactions/summary', {
        params: filters,
      })
      return response.data.summary || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update transaction
   */
  updateTransaction: async (id: string, data: Partial<CreateTransactionData>): Promise<Transaction> => {
    try {
      const response = await apiClient.patch(`/transactions/${id}`, data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete transaction
   */
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/transactions/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== STATEMENTS ====================

  /**
   * Get all statements
   */
  getStatements: async (filters?: any): Promise<{ data: Statement[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/statements', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single statement
   */
  getStatement: async (id: string): Promise<{ data: Statement }> => {
    try {
      const response = await apiClient.get(`/statements/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create statement
   */
  createStatement: async (data: CreateStatementData): Promise<Statement> => {
    try {
      const response = await apiClient.post('/statements', data)
      return response.data.statement || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update statement
   */
  updateStatement: async (id: string, data: Partial<CreateStatementData>): Promise<Statement> => {
    try {
      const response = await apiClient.put(`/statements/${id}`, data)
      return response.data.statement || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete statement
   */
  deleteStatement: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/statements/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send statement
   */
  sendStatement: async (id: string): Promise<Statement> => {
    try {
      const response = await apiClient.post(`/statements/${id}/send`)
      return response.data.statement || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Download statement
   */
  downloadStatement: async (id: string, format: 'pdf' | 'xlsx'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/statements/${id}/download`, {
        params: { format },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== ACTIVITY ====================

  /**
   * Get all financial activities
   */
  getActivities: async (filters?: any): Promise<{ data: FinancialActivity[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/activities', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single activity
   */
  getActivity: async (id: string): Promise<{ data: FinancialActivity }> => {
    try {
      const response = await apiClient.get(`/activities/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create activity
   */
  createActivity: async (data: CreateActivityData): Promise<FinancialActivity> => {
    try {
      const response = await apiClient.post('/activities', data)
      return response.data.activity || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update activity
   */
  updateActivity: async (id: string, data: Partial<CreateActivityData>): Promise<FinancialActivity> => {
    try {
      const response = await apiClient.patch(`/activities/${id}`, data)
      return response.data.activity || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete activity
   */
  deleteActivity: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/activities/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== REPORTS ====================

  /**
   * Get accounts aging report
   * Shows invoices grouped by aging buckets (0-30, 31-60, 61-90, 90+ days)
   */
  getAccountsAgingReport: async (filters?: { clientId?: string }): Promise<AccountsAgingReport> => {
    try {
      const response = await apiClient.get('/reports/accounts-aging', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get revenue by client report
   */
  getRevenueByClientReport: async (filters?: { startDate?: string; endDate?: string; clientId?: string }): Promise<RevenueByClientReport> => {
    try {
      const response = await apiClient.get('/reports/revenue-by-client', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get outstanding invoices report
   */
  getOutstandingInvoicesReport: async (filters?: { clientId?: string }): Promise<OutstandingInvoicesReport> => {
    try {
      const response = await apiClient.get('/reports/outstanding-invoices', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get time entries report
   */
  getTimeEntriesReport: async (filters?: { startDate?: string; endDate?: string; clientId?: string; caseId?: string }): Promise<TimeEntriesReport> => {
    try {
      const response = await apiClient.get('/reports/time-entries', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export report to CSV/PDF
   */
  exportReport: async (reportType: string, format: 'csv' | 'pdf', filters?: any): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/reports/${reportType}/export`, {
        params: { format, ...filters },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get weekly time entries for calendar view
   */
  getWeeklyTimeEntries: async (weekStartDate: string): Promise<WeeklyTimeEntriesData> => {
    try {
      const response = await apiClient.get('/time-tracking/weekly', { params: { weekStartDate } })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== INVOICE APPROVAL WORKFLOW ====================

  /**
   * Get invoices pending approval
   * GET /api/invoices/pending-approval
   */
  getInvoicesPendingApproval: async (filters?: {
    status?: 'pending' | 'approved' | 'rejected'
    clientId?: string
    minAmount?: number
    maxAmount?: number
    startDate?: string
    endDate?: string
    approverId?: string
    level?: number
  }): Promise<{ invoices: Invoice[]; total: number }> => {
    try {
      const response = await apiClient.get('/invoices/pending-approval', { params: filters })
      return {
        invoices: response.data.invoices || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit invoice for approval
   * POST /api/invoices/:id/submit-for-approval
   */
  submitInvoiceForApproval: async (invoiceId: string, data?: { comments?: string }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/submit-for-approval`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve invoice
   * POST /api/invoices/:id/approve
   */
  approveInvoice: async (invoiceId: string, data: {
    comments?: string
    approverLevel: number
  }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/approve`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject invoice
   * POST /api/invoices/:id/reject
   */
  rejectInvoice: async (invoiceId: string, data: {
    reason: string
    comments?: string
  }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/reject`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Request changes to invoice
   * POST /api/invoices/:id/request-changes
   */
  requestInvoiceChanges: async (invoiceId: string, data: {
    requestedChanges: string
    comments?: string
  }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/request-changes`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Escalate invoice approval to next level
   * POST /api/invoices/:id/escalate
   */
  escalateInvoiceApproval: async (invoiceId: string, data: {
    reason: string
    comments?: string
  }): Promise<Invoice> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/escalate`, data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk approve invoices
   * POST /api/invoices/bulk-approve
   */
  bulkApproveInvoices: async (data: {
    invoiceIds: string[]
    comments?: string
  }): Promise<{ approved: number; failed: number; results: any[] }> => {
    try {
      const response = await apiClient.post('/invoices/bulk-approve', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get approval workflow configuration
   * GET /api/invoices/approval-config
   */
  getApprovalWorkflowConfig: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/invoices/approval-config')
      return response.data.config || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update approval workflow configuration
   * PUT /api/invoices/approval-config
   */
  updateApprovalWorkflowConfig: async (config: any): Promise<any> => {
    try {
      const response = await apiClient.put('/invoices/approval-config', config)
      return response.data.config || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pending approvals count (for notification badge)
   * GET /api/invoices/pending-approvals-count
   */
  getPendingApprovalsCount: async (): Promise<{ count: number }> => {
    try {
      const response = await apiClient.get('/invoices/pending-approvals-count')
      return {
        count: response.data.count || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

/**
 * ==================== REPORT TYPES ====================
 */

export interface AccountsAgingReport {
  summary: {
    totalOutstanding: number
    zeroToThirtyDays: number
    thirtyOneToSixtyDays: number
    sixtyOneToNinetyDays: number
    ninetyPlusDays: number
  }
  clients: {
    clientId: string
    clientName: string
    zeroToThirtyDays: number
    thirtyOneToSixtyDays: number
    sixtyOneToNinetyDays: number
    ninetyPlusDays: number
    total: number
    invoices: {
      invoiceNumber: string
      amount: number
      dueDate: string
      daysOverdue: number
    }[]
  }[]
  generatedAt: string
}

export interface RevenueByClientReport {
  summary: {
    totalRevenue: number
    totalPaid: number
    totalOutstanding: number
    clientCount: number
  }
  clients: {
    clientId: string
    clientName: string
    totalRevenue: number
    paidAmount: number
    outstandingAmount: number
    invoiceCount: number
    lastPaymentDate?: string
  }[]
  period: {
    startDate: string
    endDate: string
  }
  generatedAt: string
}

export interface OutstandingInvoicesReport {
  summary: {
    totalOutstanding: number
    invoiceCount: number
    averageDaysOutstanding: number
  }
  invoices: {
    invoiceNumber: string
    clientName: string
    amount: number
    balanceDue: number
    issueDate: string
    dueDate: string
    daysOutstanding: number
    status: string
  }[]
  generatedAt: string
}

export interface TimeEntriesReport {
  summary: {
    totalHours: number
    billableHours: number
    nonBillableHours: number
    totalAmount: number
    billableAmount: number
  }
  entries: {
    date: string
    clientName: string
    caseName: string
    description: string
    hours: number
    hourlyRate: number
    amount: number
    isBillable: boolean
    lawyerName: string
  }[]
  period: {
    startDate: string
    endDate: string
  }
  generatedAt: string
}

export interface WeeklyTimeEntriesData {
  weekStartDate: string
  weekEndDate: string
  projects: {
    projectId: string
    projectName: string
    clientName: string
    entries: {
      [date: string]: {
        entryId: string
        duration: number
        description: string
        isBillable: boolean
      }[]
    }
    totalHours: number
  }[]
  dailyTotals: {
    [date: string]: number
  }
  weeklyTotal: number
}

export default financeService
