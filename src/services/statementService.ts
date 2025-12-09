/**
 * Statement Service
 * Handles client/account statement generation and management
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== INTERFACES ====================
 */

/**
 * Statement data structure
 */
export interface Statement {
  _id: string
  statementNumber: string
  clientId: string | { firstName: string; lastName: string; _id: string }
  caseId?: string | { caseNumber: string; title: string; _id: string }
  accountId?: string

  // Period
  startDate: string
  endDate: string
  generatedDate: string

  // Financial summary
  openingBalance: number
  closingBalance: number
  totalDebits: number
  totalCredits: number
  totalInvoiced?: number
  totalPaid?: number
  balanceDue?: number

  // Transactions included
  transactions: StatementTransaction[]
  invoices?: string[]
  payments?: string[]

  // Status
  status: 'draft' | 'generated' | 'sent' | 'viewed'

  // Delivery
  sentDate?: string
  sentTo?: string[]
  viewedDate?: string

  // Files
  pdfUrl?: string
  pdfPath?: string

  // Metadata
  notes?: string
  tags?: string[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

/**
 * Statement transaction
 */
export interface StatementTransaction {
  _id: string
  date: string
  description: string
  type: 'invoice' | 'payment' | 'credit' | 'debit' | 'adjustment'
  reference?: string
  debit?: number
  credit?: number
  balance: number
}

/**
 * Generate statement data
 */
export interface GenerateStatementData {
  clientId: string
  caseId?: string
  accountId?: string
  startDate: string
  endDate: string
  includeInvoices?: boolean
  includePayments?: boolean
  includeExpenses?: boolean
  notes?: string
  tags?: string[]
}

/**
 * Statement filters
 */
export interface StatementFilters {
  status?: string
  clientId?: string
  caseId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/**
 * Send statement data
 */
export interface SendStatementData {
  to: string[]
  cc?: string[]
  subject?: string
  message?: string
}

/**
 * Generic API Response
 */
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/**
 * Paginated API Response
 */
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * ==================== STATEMENT SERVICE ====================
 */

const statementService = {
  /**
   * Generate new statement
   * POST /api/statements
   */
  generateStatement: async (data: GenerateStatementData): Promise<Statement> => {
    try {
      const response = await apiClient.post<ApiResponse<Statement>>(
        '/statements',
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all statements (with filters)
   * GET /api/statements
   */
  getStatements: async (
    filters?: StatementFilters
  ): Promise<{ statements: Statement[]; pagination?: any }> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Statement>>(
        '/statements',
        { params: filters }
      )
      return {
        statements: response.data.data,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single statement
   * GET /api/statements/:id
   */
  getStatement: async (id: string): Promise<Statement> => {
    try {
      const response = await apiClient.get<ApiResponse<Statement>>(
        `/statements/${id}`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete statement
   * DELETE /api/statements/:id
   */
  deleteStatement: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/statements/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Download statement PDF
   * GET /api/statements/:id/download
   */
  downloadStatement: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/statements/${id}/download`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send statement via email
   * POST /api/statements/:id/send
   */
  sendStatement: async (id: string, data: SendStatementData): Promise<void> => {
    try {
      await apiClient.post(`/statements/${id}/send`, data)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Legacy: Generate statement (backward compatibility)
   * POST /api/statements/generate
   */
  generateStatementLegacy: async (
    data: GenerateStatementData
  ): Promise<Statement> => {
    try {
      const response = await apiClient.post<ApiResponse<Statement>>(
        '/statements/generate',
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default statementService
