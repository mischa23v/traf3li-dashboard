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
   * Delete invoice
   */
  deleteInvoice: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/invoices/${id}`)
    } catch (error: any) {
      console.error('Delete invoice error:', error)
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

  /**
   * Delete expense
   */
  deleteExpense: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/expenses/${id}`)
    } catch (error: any) {
      console.error('Delete expense error:', error)
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
   * Get single time entry
   */
  getTimeEntry: async (id: string): Promise<{ data: TimeEntry }> => {
    try {
      const response = await apiClient.get(`/time-tracking/entries/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Get time entry error:', error)
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

  /**
   * Update time entry
   */
  updateTimeEntry: async (id: string, data: Partial<CreateTimeEntryData>): Promise<TimeEntry> => {
    try {
      const response = await apiClient.patch(`/time-tracking/entries/${id}`, data)
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      console.error('Update time entry error:', error)
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
      console.error('Delete time entry error:', error)
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
   * Get single payment
   */
  getPayment: async (id: string): Promise<{ payment: Payment }> => {
    try {
      const response = await apiClient.get(`/payments/${id}`)
      return { payment: response.data.payment || response.data.data || response.data }
    } catch (error: any) {
      console.error('Get payment error:', error)
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

  /**
   * Record payment for invoice
   */
  recordPaymentForInvoice: async (invoiceId: string, data: CreatePaymentData): Promise<Payment> => {
    try {
      const response = await apiClient.post(`/invoices/${invoiceId}/payments`, data)
      return response.data.payment || response.data.data
    } catch (error: any) {
      console.error('Record payment error:', error)
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
      console.error('Get payments summary error:', error)
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
   * Get single transaction
   */
  getTransaction: async (id: string): Promise<{ data: Transaction }> => {
    try {
      const response = await apiClient.get(`/transactions/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Get transaction error:', error)
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

  /**
   * Update transaction
   */
  updateTransaction: async (id: string, data: Partial<CreateTransactionData>): Promise<Transaction> => {
    try {
      const response = await apiClient.patch(`/transactions/${id}`, data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      console.error('Update transaction error:', error)
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
      console.error('Delete transaction error:', error)
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
      console.error('Get statements error:', error)
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
      console.error('Get statement error:', error)
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
      console.error('Create statement error:', error)
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
      console.error('Update statement error:', error)
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
      console.error('Delete statement error:', error)
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
      console.error('Send statement error:', error)
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
      console.error('Download statement error:', error)
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
      console.error('Get activities error:', error)
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
      console.error('Get activity error:', error)
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
      console.error('Create activity error:', error)
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
      console.error('Update activity error:', error)
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
      console.error('Delete activity error:', error)
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
      console.error('Get accounts aging report error:', error)
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
      console.error('Get revenue by client report error:', error)
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
      console.error('Get outstanding invoices report error:', error)
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
      console.error('Get time entries report error:', error)
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
      console.error('Export report error:', error)
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
      console.error('Get weekly time entries error:', error)
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
