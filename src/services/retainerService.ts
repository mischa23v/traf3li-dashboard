/**
 * Retainer Service
 * Handles retainer management and transactions
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Retainer Status
 */
export type RetainerStatus = 'active' | 'depleted' | 'expired' | 'cancelled'

/**
 * Transaction Type
 */
export type TransactionType = 'deposit' | 'consumption' | 'replenishment' | 'refund' | 'adjustment'

/**
 * Currency Type
 */
export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED'

/**
 * Retainer
 */
export interface Retainer {
  _id: string
  clientId: string
  caseId?: string
  clientName: string
  caseNumber?: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  initialAmount: number
  currentBalance: number
  currency: Currency
  status: RetainerStatus
  startDate: string
  expiryDate?: string
  minimumBalance?: number
  autoReplenish?: boolean
  replenishAmount?: number
  replenishThreshold?: number
  notes?: string
  transactions: RetainerTransaction[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * Retainer Transaction
 */
export interface RetainerTransaction {
  _id: string
  type: TransactionType
  amount: number
  balance: number
  description: string
  descriptionAr?: string
  reference?: string
  invoiceId?: string
  timeEntryId?: string
  expenseId?: string
  performedBy: string
  performedAt: string
  notes?: string
}

/**
 * Retainer Statistics
 */
export interface RetainerStatistics {
  totalRetainers: number
  activeRetainers: number
  totalBalance: number
  totalDeposited: number
  totalConsumed: number
  averageBalance: number
  lowBalanceCount: number
  expiringCount: number
}

/**
 * Create Retainer Data
 */
export interface CreateRetainerData {
  clientId: string
  caseId?: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  initialAmount: number
  currency: Currency
  startDate: string
  expiryDate?: string
  minimumBalance?: number
  autoReplenish?: boolean
  replenishAmount?: number
  replenishThreshold?: number
  notes?: string
}

/**
 * Update Retainer Data
 */
export interface UpdateRetainerData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  expiryDate?: string
  minimumBalance?: number
  autoReplenish?: boolean
  replenishAmount?: number
  replenishThreshold?: number
  notes?: string
  status?: RetainerStatus
}

/**
 * Consume Retainer Data
 */
export interface ConsumeRetainerData {
  amount: number
  description: string
  descriptionAr?: string
  reference?: string
  invoiceId?: string
  timeEntryId?: string
  expenseId?: string
  notes?: string
}

/**
 * Replenish Retainer Data
 */
export interface ReplenishRetainerData {
  amount: number
  description: string
  descriptionAr?: string
  reference?: string
  notes?: string
}

/**
 * Refund Retainer Data
 */
export interface RefundRetainerData {
  amount: number
  description: string
  descriptionAr?: string
  reference?: string
  reason?: string
  notes?: string
}

/**
 * Retainer Filters
 */
export interface RetainerFilters {
  clientId?: string
  caseId?: string
  status?: RetainerStatus
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// ==================== API RESPONSES ====================

interface RetainersResponse {
  error: boolean
  retainers: Retainer[]
  total?: number
}

interface RetainerResponse {
  error: boolean
  retainer: Retainer
}

interface StatisticsResponse {
  error: boolean
  statistics: RetainerStatistics
}

interface TransactionsResponse {
  error: boolean
  transactions: RetainerTransaction[]
  total?: number
}

// ==================== SERVICE ====================

const retainerService = {
  /**
   * Get all retainers
   * GET /api/retainers
   */
  getRetainers: async (filters?: RetainerFilters): Promise<{ retainers: Retainer[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.caseId) params.append('caseId', filters.caseId)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/retainers?${queryString}` : '/retainers'

      const response = await apiClient.get<RetainersResponse>(url)
      return {
        retainers: response.data.retainers || [],
        total: response.data.total || response.data.retainers?.length || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single retainer by ID
   * GET /api/retainers/:id
   */
  getRetainer: async (id: string): Promise<Retainer> => {
    try {
      const response = await apiClient.get<RetainerResponse>(`/retainers/${id}`)
      return response.data.retainer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new retainer
   * POST /api/retainers
   */
  createRetainer: async (data: CreateRetainerData): Promise<Retainer> => {
    try {
      const response = await apiClient.post<RetainerResponse>('/retainers', data)
      return response.data.retainer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update retainer
   * PUT /api/retainers/:id
   */
  updateRetainer: async (id: string, data: UpdateRetainerData): Promise<Retainer> => {
    try {
      const response = await apiClient.put<RetainerResponse>(`/retainers/${id}`, data)
      return response.data.retainer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Consume retainer (deduct amount)
   * POST /api/retainers/:id/consume
   */
  consumeRetainer: async (id: string, data: ConsumeRetainerData): Promise<Retainer> => {
    try {
      const response = await apiClient.post<RetainerResponse>(`/retainers/${id}/consume`, data)
      return response.data.retainer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Replenish retainer (add amount)
   * POST /api/retainers/:id/replenish
   */
  replenishRetainer: async (id: string, data: ReplenishRetainerData): Promise<Retainer> => {
    try {
      const response = await apiClient.post<RetainerResponse>(`/retainers/${id}/replenish`, data)
      return response.data.retainer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Refund retainer (return amount to client)
   * POST /api/retainers/:id/refund
   */
  refundRetainer: async (id: string, data: RefundRetainerData): Promise<Retainer> => {
    try {
      const response = await apiClient.post<RetainerResponse>(`/retainers/${id}/refund`, data)
      return response.data.retainer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get retainer transaction history
   * GET /api/retainers/:id/history
   */
  getRetainerHistory: async (id: string): Promise<RetainerTransaction[]> => {
    try {
      const response = await apiClient.get<TransactionsResponse>(`/retainers/${id}/history`)
      return response.data.transactions || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get retainer statistics
   * GET /api/retainers/stats
   */
  getRetainerStats: async (): Promise<RetainerStatistics> => {
    try {
      const response = await apiClient.get<StatisticsResponse>('/retainers/stats')
      return response.data.statistics
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get low balance retainers
   * GET /api/retainers/low-balance
   */
  getLowBalanceRetainers: async (): Promise<Retainer[]> => {
    try {
      const response = await apiClient.get<RetainersResponse>('/retainers/low-balance')
      return response.data.retainers || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== UTILITIES ====================

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: Currency): string => {
    const formatters: Record<Currency, Intl.NumberFormat> = {
      SAR: new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
      AED: new Intl.NumberFormat('ar-AE', { style: 'currency', currency: 'AED' }),
    }
    return formatters[currency].format(amount)
  },

  /**
   * Calculate remaining days
   */
  getRemainingDays: (expiryDate: string): number => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  },

  /**
   * Check if retainer is expiring soon
   */
  isExpiringSoon: (expiryDate: string, daysThreshold: number = 30): boolean => {
    const remainingDays = retainerService.getRemainingDays(expiryDate)
    return remainingDays > 0 && remainingDays <= daysThreshold
  },

  /**
   * Check if retainer has low balance
   */
  hasLowBalance: (retainer: Retainer): boolean => {
    if (!retainer.minimumBalance) return false
    return retainer.currentBalance <= retainer.minimumBalance
  },

  /**
   * Check if auto-replenish is needed
   */
  needsAutoReplenish: (retainer: Retainer): boolean => {
    if (!retainer.autoReplenish || !retainer.replenishThreshold) return false
    return retainer.currentBalance <= retainer.replenishThreshold
  },
}

export default retainerService
