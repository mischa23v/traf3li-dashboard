/**
 * Inter-Company Service
 * Handles all inter-company transaction-related API calls
 * Supports multi-currency transactions between companies in the organization
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== INTER-COMPANY TRANSACTIONS ====================
 */

export interface InterCompanyTransaction {
  _id: string
  transactionNumber: string
  sourceFirmId: string | Company
  targetFirmId: string | Company
  transactionType: 'invoice' | 'payment' | 'expense' | 'transfer'
  amount: number
  currency: string
  exchangeRate?: number
  baseAmount: number // Amount in base currency
  description: string
  referenceNumber?: string
  transactionDate: string
  dueDate?: string
  status: 'draft' | 'pending' | 'posted' | 'reconciled' | 'cancelled'
  sourceTransactionId?: string // ID of the invoice/bill created in source company
  targetTransactionId?: string // ID of the corresponding bill/invoice created in target company
  autoCreatedCounterpart: boolean
  reconciliationId?: string
  notes?: string
  attachments?: Attachment[]
  createdBy: string | { firstName: string; lastName: string }
  history?: TransactionHistory[]
  createdAt: string
  updatedAt: string
}

export interface Company {
  _id: string
  name: string
  nameAr: string
  code: string
  currency: string
  isActive: boolean
}

export interface Attachment {
  fileName: string
  fileUrl: string
  fileType: string
  uploadedAt: string
}

export interface TransactionHistory {
  action: string
  performedBy: string
  timestamp: string
  details?: any
}

export interface CreateInterCompanyTransactionData {
  sourceFirmId: string
  targetFirmId: string
  transactionType: 'invoice' | 'payment' | 'expense' | 'transfer'
  amount: number
  currency: string
  exchangeRate?: number
  description: string
  referenceNumber?: string
  transactionDate: string
  dueDate?: string
  autoCreateCounterpart?: boolean
  notes?: string
}

export interface InterCompanyTransactionFilters {
  sourceFirmId?: string
  targetFirmId?: string
  transactionType?: string
  status?: string
  currency?: string
  startDate?: string
  endDate?: string
  reconciliationStatus?: 'reconciled' | 'unreconciled'
  page?: number
  limit?: number
}

/**
 * ==================== INTER-COMPANY BALANCES ====================
 */

export interface InterCompanyBalance {
  sourceFirmId: string
  sourceCompany: Company
  targetFirmId: string
  targetCompany: Company
  receivable: number // Amount source company should receive from target
  payable: number // Amount source company should pay to target
  netBalance: number // receivable - payable (positive = net receivable, negative = net payable)
  currency: string
  lastUpdated: string
  transactionCount: number
}

export interface InterCompanyBalanceMatrix {
  companies: Company[]
  balances: InterCompanyBalance[]
  currencies: string[]
  lastUpdated: string
}

/**
 * ==================== INTER-COMPANY RECONCILIATION ====================
 */

export interface InterCompanyReconciliation {
  _id: string
  reconciliationNumber: string
  sourceFirmId: string | Company
  targetFirmId: string | Company
  reconciliationDate: string
  reconciliationPeriodStart: string
  reconciliationPeriodEnd: string
  currency: string
  matchedTransactions: MatchedTransaction[]
  unmatchedSourceTransactions: string[]
  unmatchedTargetTransactions: string[]
  adjustmentEntries: AdjustmentEntry[]
  totalMatched: number
  totalUnmatched: number
  status: 'draft' | 'in_progress' | 'completed' | 'approved'
  notes?: string
  createdBy: string | { firstName: string; lastName: string }
  approvedBy?: string | { firstName: string; lastName: string }
  approvedAt?: string
  history?: ReconciliationHistory[]
  createdAt: string
  updatedAt: string
}

export interface MatchedTransaction {
  sourceTransactionId: string
  targetTransactionId: string
  amount: number
  currency: string
  matchType: 'automatic' | 'manual'
  matchDate: string
  matchedBy?: string
}

export interface AdjustmentEntry {
  _id?: string
  type: 'source_adjustment' | 'target_adjustment' | 'exchange_rate_adjustment'
  amount: number
  currency: string
  reason: string
  description: string
  journalEntryId?: string
  createdAt?: string
}

export interface ReconciliationHistory {
  action: string
  performedBy: string
  timestamp: string
  details?: any
}

export interface CreateReconciliationData {
  sourceFirmId: string
  targetFirmId: string
  reconciliationPeriodStart: string
  reconciliationPeriodEnd: string
  currency: string
  notes?: string
}

export interface ReconciliationFilters {
  sourceFirmId?: string
  targetFirmId?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/**
 * ==================== API METHODS ====================
 */

/**
 * Inter-Company Service API Client
 *
 * Complete API Documentation:
 * This service provides access to all inter-company transaction management endpoints.
 *
 * ==================== ENDPOINT PATTERNS ====================
 *
 * TRANSACTIONS (15 endpoints total):
 * - GET    /api/inter-company/transactions              - List transactions with filters
 * - GET    /api/inter-company/transactions/:id          - Get single transaction details
 * - POST   /api/inter-company/transactions              - Create new transaction
 * - PUT    /api/inter-company/transactions/:id          - Update transaction
 * - DELETE /api/inter-company/transactions/:id          - Delete transaction
 * - POST   /api/inter-company/transactions/:id/post     - Post transaction to accounting
 * - POST   /api/inter-company/transactions/:id/cancel   - Cancel transaction with reason
 * - GET    /api/inter-company/transactions/between      - Get transactions between two firms
 *
 * BALANCES (2 endpoints total):
 * - GET    /api/inter-company/balances                  - Get balance matrix for all companies
 * - GET    /api/inter-company/balances/between          - Get balance between two specific firms
 *
 * RECONCILIATIONS (9 endpoints total):
 * ⚠️  IMPORTANT: Uses PLURAL form "/reconciliations" (NOT singular "/reconciliation")
 * - GET    /api/inter-company/reconciliations                      - List reconciliations with filters
 * - GET    /api/inter-company/reconciliations/:id                  - Get single reconciliation details
 * - POST   /api/inter-company/reconciliations                      - Create new reconciliation
 * - POST   /api/inter-company/reconciliations/:id/auto-match       - Auto-match transactions
 * - POST   /api/inter-company/reconciliations/:id/manual-match     - Manually match two transactions
 * - POST   /api/inter-company/reconciliations/:id/unmatch          - Unmatch previously matched transactions
 * - POST   /api/inter-company/reconciliations/:id/adjustments      - Create adjustment entry
 * - POST   /api/inter-company/reconciliations/:id/complete         - Complete reconciliation
 * - POST   /api/inter-company/reconciliations/:id/approve          - Approve reconciliation
 *
 * FIRMS/COMPANIES (1 endpoint total):
 * - GET    /api/inter-company/firms                     - Get all active firms/companies
 *
 * EXCHANGE RATES (1 endpoint total):
 * - GET    /api/inter-company/exchange-rate             - Get exchange rate between currencies
 *
 * REPORTS (2 endpoints total):
 * - GET    /api/inter-company/reports/summary           - Get summary report with date range
 * - POST   /api/inter-company/reports/export            - Export report in various formats
 *
 * ==================== TOTAL: 30 ENDPOINTS ====================
 *
 * All endpoints use the firmId parameter (not companyId) per backend team requirements.
 */
class InterCompanyService {
  // ==================== Transactions ====================

  /**
   * Get inter-company transactions with optional filters
   * @param filters - Optional filters including sourceFirmId, targetFirmId, status, date range, etc.
   * @returns Promise with transactions list and pagination info
   * @endpoint GET /api/inter-company/transactions
   */
  async getTransactions(filters?: InterCompanyTransactionFilters) {
    try {
      const response = await apiClient.get('/api/inter-company/transactions', { params: filters })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Get a single inter-company transaction by ID
   * @param id - Transaction ID
   * @returns Promise with transaction details
   * @endpoint GET /api/inter-company/transactions/:id
   */
  async getTransaction(id: string) {
    try {
      const response = await apiClient.get(`/api/inter-company/transactions/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Create a new inter-company transaction
   * @param data - Transaction data including sourceFirmId, targetFirmId, amount, currency, etc.
   * @returns Promise with created transaction
   * @endpoint POST /api/inter-company/transactions
   */
  async createTransaction(data: CreateInterCompanyTransactionData): Promise<InterCompanyTransaction> {
    try {
      const response = await apiClient.post('/api/inter-company/transactions', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Update an existing inter-company transaction
   * @param id - Transaction ID
   * @param data - Partial transaction data to update
   * @returns Promise with updated transaction
   * @endpoint PUT /api/inter-company/transactions/:id
   */
  async updateTransaction(id: string, data: Partial<CreateInterCompanyTransactionData>): Promise<InterCompanyTransaction> {
    try {
      const response = await apiClient.put(`/api/inter-company/transactions/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Delete an inter-company transaction
   * @param id - Transaction ID
   * @returns Promise with deletion confirmation
   * @endpoint DELETE /api/inter-company/transactions/:id
   */
  async deleteTransaction(id: string) {
    try {
      const response = await apiClient.delete(`/api/inter-company/transactions/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Post transaction to accounting system
   * Changes status from 'draft' or 'pending' to 'posted'
   * @param id - Transaction ID
   * @returns Promise with posted transaction
   * @endpoint POST /api/inter-company/transactions/:id/post
   */
  async postTransaction(id: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/transactions/${id}/post`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Cancel an inter-company transaction
   * @param id - Transaction ID
   * @param reason - Reason for cancellation
   * @returns Promise with cancelled transaction
   * @endpoint POST /api/inter-company/transactions/:id/cancel
   */
  async cancelTransaction(id: string, reason: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/transactions/${id}/cancel`, { reason })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Balances ====================

  /**
   * Get inter-company balance matrix for all companies
   * @param currency - Optional currency filter
   * @returns Promise with balance matrix including companies, balances, and currencies
   * @endpoint GET /api/inter-company/balances
   */
  async getBalances(currency?: string): Promise<InterCompanyBalanceMatrix> {
    try {
      const response = await apiClient.get('/api/inter-company/balances', {
        params: { currency }
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Get balance between two specific companies
   * @param sourceFirmId - Source firm ID
   * @param targetFirmId - Target firm ID
   * @param currency - Optional currency filter
   * @returns Promise with balance details (receivable, payable, netBalance)
   * @endpoint GET /api/inter-company/balances/between
   */
  async getBalanceBetweenCompanies(sourceFirmId: string, targetFirmId: string, currency?: string): Promise<InterCompanyBalance> {
    try {
      const response = await apiClient.get('/api/inter-company/balances/between', {
        params: { sourceFirmId, targetFirmId, currency }
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Get transactions between two specific companies
   * @param sourceFirmId - Source firm ID
   * @param targetFirmId - Target firm ID
   * @param filters - Optional additional filters
   * @returns Promise with transactions list
   * @endpoint GET /api/inter-company/transactions/between
   */
  async getTransactionsBetweenCompanies(
    sourceFirmId: string,
    targetFirmId: string,
    filters?: Partial<InterCompanyTransactionFilters>
  ) {
    try {
      const response = await apiClient.get('/api/inter-company/transactions/between', {
        params: { sourceFirmId, targetFirmId, ...filters }
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Reconciliation ====================
  // IMPORTANT: All reconciliation endpoints use PLURAL form "/reconciliations"

  /**
   * Get inter-company reconciliations with optional filters
   * @param filters - Optional filters including sourceFirmId, targetFirmId, status, date range
   * @returns Promise with reconciliations list and pagination info
   * @endpoint GET /api/inter-company/reconciliations (PLURAL)
   */
  async getReconciliations(filters?: ReconciliationFilters) {
    try {
      const response = await apiClient.get('/api/inter-company/reconciliations', { params: filters })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Get a single reconciliation by ID
   * @param id - Reconciliation ID
   * @returns Promise with reconciliation details
   * @endpoint GET /api/inter-company/reconciliations/:id (PLURAL)
   */
  async getReconciliation(id: string): Promise<InterCompanyReconciliation> {
    try {
      const response = await apiClient.get(`/api/inter-company/reconciliations/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Create a new inter-company reconciliation
   * @param data - Reconciliation data including firms, period, currency
   * @returns Promise with created reconciliation
   * @endpoint POST /api/inter-company/reconciliations (PLURAL)
   */
  async createReconciliation(data: CreateReconciliationData): Promise<InterCompanyReconciliation> {
    try {
      const response = await apiClient.post('/api/inter-company/reconciliations', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Automatically match transactions in a reconciliation
   * Uses smart matching algorithm to find corresponding transactions
   * @param reconciliationId - Reconciliation ID
   * @returns Promise with updated reconciliation including matched transactions
   * @endpoint POST /api/inter-company/reconciliations/:id/auto-match (PLURAL)
   */
  async autoMatchTransactions(reconciliationId: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/auto-match`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Manually match two transactions in a reconciliation
   * @param reconciliationId - Reconciliation ID
   * @param sourceTransactionId - Source transaction ID
   * @param targetTransactionId - Target transaction ID
   * @returns Promise with updated reconciliation
   * @endpoint POST /api/inter-company/reconciliations/:id/manual-match (PLURAL)
   */
  async manualMatchTransactions(
    reconciliationId: string,
    sourceTransactionId: string,
    targetTransactionId: string
  ) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/manual-match`, {
        sourceTransactionId,
        targetTransactionId
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Unmatch previously matched transactions
   * @param reconciliationId - Reconciliation ID
   * @param matchId - Match ID to remove
   * @returns Promise with updated reconciliation
   * @endpoint POST /api/inter-company/reconciliations/:id/unmatch (PLURAL)
   */
  async unmatchTransactions(reconciliationId: string, matchId: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/unmatch`, {
        matchId
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Create an adjustment entry for a reconciliation
   * Used for exchange rate adjustments, corrections, or other adjustments
   * @param reconciliationId - Reconciliation ID
   * @param adjustment - Adjustment data (type, amount, currency, reason, description)
   * @returns Promise with updated reconciliation including new adjustment
   * @endpoint POST /api/inter-company/reconciliations/:id/adjustments (PLURAL)
   */
  async createAdjustmentEntry(reconciliationId: string, adjustment: Omit<AdjustmentEntry, '_id' | 'createdAt'>) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/adjustments`, adjustment)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Mark reconciliation as complete
   * Changes status to 'completed' and finalizes all matches and adjustments
   * @param reconciliationId - Reconciliation ID
   * @returns Promise with completed reconciliation
   * @endpoint POST /api/inter-company/reconciliations/:id/complete (PLURAL)
   */
  async completeReconciliation(reconciliationId: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/complete`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Approve a completed reconciliation
   * Changes status to 'approved' and locks the reconciliation
   * @param reconciliationId - Reconciliation ID
   * @returns Promise with approved reconciliation
   * @endpoint POST /api/inter-company/reconciliations/:id/approve (PLURAL)
   */
  async approveReconciliation(reconciliationId: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/approve`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Companies ====================

  /**
   * Get all active companies/firms in the organization
   * @returns Promise with array of companies
   * @endpoint GET /api/inter-company/firms
   */
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get('/api/inter-company/firms')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Exchange Rates ====================

  /**
   * Get exchange rate between two currencies
   * @param fromCurrency - Source currency code (e.g., 'SAR')
   * @param toCurrency - Target currency code (e.g., 'USD')
   * @param date - Optional date for historical rate (defaults to current date)
   * @returns Promise with exchange rate
   * @endpoint GET /api/inter-company/exchange-rate
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string, date?: string): Promise<number> {
    try {
      const response = await apiClient.get('/api/inter-company/exchange-rate', {
        params: { fromCurrency, toCurrency, date }
      })
      return response.data.rate
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Reports ====================

  /**
   * Get inter-company summary report
   * @param params - Report parameters (startDate, endDate, optional firmId, optional currency)
   * @returns Promise with report data including totals, breakdowns, trends
   * @endpoint GET /api/inter-company/reports/summary
   */
  async getInterCompanyReport(params: {
    startDate: string
    endDate: string
    firmId?: string
    currency?: string
  }) {
    try {
      const response = await apiClient.get('/api/inter-company/reports/summary', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Export inter-company report in various formats
   * @param params - Export parameters (reportType, format, optional filters)
   * @returns Promise with blob data for download
   * @endpoint POST /api/inter-company/reports/export
   */
  async exportReport(params: {
    reportType: 'transactions' | 'balances' | 'reconciliation'
    format: 'csv' | 'pdf' | 'excel'
    filters?: any
  }) {
    try {
      const response = await apiClient.post('/api/inter-company/reports/export', params, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

export default new InterCompanyService()
