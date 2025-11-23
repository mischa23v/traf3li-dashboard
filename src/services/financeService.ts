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
  lawyerId: string
  clientId: string
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
 * ==================== EXPENSES ====================
 */

export interface Expense {
  _id: string
  expenseId: string
  description: string
  amount: number
  category: string
  caseId?: string
  userId: string
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
  lawyerId: string
  clientId: string
  caseId: string
  date: string
  startTime?: string
  endTime?: string
  duration: number
  hourlyRate: number
  totalAmount: number
  isBillable: boolean
  isBilled: boolean
  activityCode?: string
  status: string
  invoiceId?: string
  wasTimerBased: boolean
  timerStartedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTimeEntryData {
  caseId: string
  clientId: string
  date: string
  description: string
  duration: number
  hourlyRate: number
  activityCode?: string
  isBillable?: boolean
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
  notes?: string
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
      console.error('Get invoices error:', error)
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
      console.error('Get invoice error:', error)
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
      console.error('Create invoice error:', error)
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
      console.error('Update invoice error:', error)
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
      console.error('Send invoice error:', error)
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
      console.error('Get overdue invoices error:', error)
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
      console.error('Get expenses error:', error)
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
      console.error('Get expense error:', error)
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
      console.error('Create expense error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update expense
   */
  updateExpense: async (id: string, data: Partial<CreateExpenseData>): Promise<Expense> => {
    try {
      const response = await apiClient.patch(`/expenses/${id}`, data)
      return response.data.expense || response.data.data
    } catch (error: any) {
      console.error('Update expense error:', error)
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
      console.error('Upload receipt error:', error)
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
      console.error('Get expense stats error:', error)
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
      console.error('Start timer error:', error)
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
      console.error('Pause timer error:', error)
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
      console.error('Resume timer error:', error)
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
      console.error('Stop timer error:', error)
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
      console.error('Get timer status error:', error)
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
      console.error('Create time entry error:', error)
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
      return response.data
    } catch (error: any) {
      console.error('Get time entries error:', error)
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
      console.error('Get time stats error:', error)
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
      console.error('Get payments error:', error)
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
      console.error('Create payment error:', error)
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
      console.error('Complete payment error:', error)
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
      console.error('Get transactions error:', error)
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
      console.error('Create transaction error:', error)
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
      console.error('Get account balance error:', error)
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
      console.error('Get transaction summary error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default financeService
