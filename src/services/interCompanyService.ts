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

class InterCompanyService {
  // ==================== Transactions ====================

  async getTransactions(filters?: InterCompanyTransactionFilters) {
    try {
      const response = await apiClient.get('/api/inter-company/transactions', { params: filters })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async getTransaction(id: string) {
    try {
      const response = await apiClient.get(`/api/inter-company/transactions/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async createTransaction(data: CreateInterCompanyTransactionData): Promise<InterCompanyTransaction> {
    try {
      const response = await apiClient.post('/api/inter-company/transactions', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async updateTransaction(id: string, data: Partial<CreateInterCompanyTransactionData>): Promise<InterCompanyTransaction> {
    try {
      const response = await apiClient.put(`/api/inter-company/transactions/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async deleteTransaction(id: string) {
    try {
      const response = await apiClient.delete(`/api/inter-company/transactions/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async postTransaction(id: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/transactions/${id}/post`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async cancelTransaction(id: string, reason: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/transactions/${id}/cancel`, { reason })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Balances ====================

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

  async getReconciliations(filters?: ReconciliationFilters) {
    try {
      const response = await apiClient.get('/api/inter-company/reconciliations', { params: filters })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async getReconciliation(id: string): Promise<InterCompanyReconciliation> {
    try {
      const response = await apiClient.get(`/api/inter-company/reconciliations/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async createReconciliation(data: CreateReconciliationData): Promise<InterCompanyReconciliation> {
    try {
      const response = await apiClient.post('/api/inter-company/reconciliations', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async autoMatchTransactions(reconciliationId: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/auto-match`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

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

  async createAdjustmentEntry(reconciliationId: string, adjustment: Omit<AdjustmentEntry, '_id' | 'createdAt'>) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/adjustments`, adjustment)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async completeReconciliation(reconciliationId: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/complete`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async approveReconciliation(reconciliationId: string) {
    try {
      const response = await apiClient.post(`/api/inter-company/reconciliations/${reconciliationId}/approve`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Companies ====================

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get('/api/inter-company/firms')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  // ==================== Exchange Rates ====================

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
