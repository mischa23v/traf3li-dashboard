/**
 * Exchange Rate Revaluation Service
 * Handles period-end adjustment for multi-currency accounts
 * Base route: /api/exchange-rate-revaluations
 *
 * Use Case: Period-end adjustment for multi-currency accounts
 *
 * BACKEND STATUS: NOT IMPLEMENTED (404 - Route not registered)
 *
 * All endpoints return 404. The backend route is not mounted.
 * This service is frontend-ready, awaiting backend implementation.
 *
 * Expected Routes (NOT YET AVAILABLE):
 * GET    /exchange-rate-revaluations              - List revaluations
 * GET    /exchange-rate-revaluations/:id          - Get single revaluation
 * POST   /exchange-rate-revaluations/preview      - Preview before running
 * POST   /exchange-rate-revaluations/run          - Execute revaluation
 * POST   /exchange-rate-revaluations/:id/post     - Post to General Ledger
 * POST   /exchange-rate-revaluations/:id/reverse  - Reverse revaluation
 * GET    /exchange-rate-revaluations/report       - Period report
 * GET    /exchange-rate-revaluations/accounts     - Get eligible accounts
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type RevaluationStatus = 'draft' | 'posted' | 'reversed'

export interface RevaluationEntry {
  accountId: string
  accountCode: string
  accountName: string
  accountNameAr?: string
  currency: string
  originalBalance: number
  exchangeRate: number
  revaluedBalance: number
  gainLoss: number
  type: 'gain' | 'loss'
}

export interface RevaluationSummary {
  totalGain: number
  totalLoss: number
  netGainLoss: number
  entriesCount: number
  currencies: string[]
}

export interface ExchangeRateRevaluation {
  _id: string
  revaluationId: string
  revaluationNumber: string
  postingDate: string
  periodStart: string
  periodEnd: string
  status: RevaluationStatus
  entries: RevaluationEntry[]
  summary: RevaluationSummary
  exchangeRates: { currency: string; rate: number }[]
  postedAt?: string
  postedBy?: string
  reversedAt?: string
  reversedBy?: string
  journalEntryId?: string
  createdAt: string
  updatedAt: string
}

export interface EligibleAccount {
  _id: string
  accountCode: string
  accountName: string
  accountNameAr?: string
  currency: string
  balance: number
  lastRevaluationDate?: string
}

export interface RevaluationFilters {
  status?: RevaluationStatus
  periodStart?: string
  periodEnd?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface RevaluationPreviewData {
  postingDate: string
  accounts: string[]
  exchangeRates?: { currency: string; rate: number }[]
}

export interface RevaluationRunData extends RevaluationPreviewData {
  autoPost?: boolean
}

export interface RevaluationReportFilters {
  startDate?: string
  endDate?: string
  currency?: string
}

// ==================== SERVICE ====================

const exchangeRateRevaluationService = {
  /**
   * Get all revaluations
   * NOT IMPLEMENTED: Backend returns 404
   * GET /api/exchange-rate-revaluation
   */
  getRevaluations: async (filters?: RevaluationFilters): Promise<{
    revaluations: ExchangeRateRevaluation[]
    total: number
    page: number
    limit: number
  }> => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
          }
        })
      }
      const response = await apiClient.get(`/exchange-rate-revaluation?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch revaluations | فشل جلب إعادة التقييم: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get single revaluation
   * NOT IMPLEMENTED: Backend returns 404
   * GET /api/exchange-rate-revaluation/:id
   */
  getRevaluation: async (id: string): Promise<ExchangeRateRevaluation> => {
    try {
      const response = await apiClient.get(`/exchange-rate-revaluation/${id}`)
      return response.data.revaluation || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch revaluation | فشل جلب إعادة التقييم: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get eligible accounts for revaluation
   * NOT IMPLEMENTED: Backend returns 404
   * GET /api/exchange-rate-revaluation/accounts
   */
  getEligibleAccounts: async (): Promise<EligibleAccount[]> => {
    try {
      const response = await apiClient.get('/exchange-rate-revaluation/accounts')
      return response.data.accounts || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch eligible accounts | فشل جلب الحسابات المؤهلة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Preview revaluation before running
   * NOT IMPLEMENTED: Backend returns 404
   * POST /api/exchange-rate-revaluation/preview
   *
   * Returns preview of gains/losses without executing
   */
  previewRevaluation: async (data: RevaluationPreviewData): Promise<{
    entries: RevaluationEntry[]
    summary: RevaluationSummary
  }> => {
    try {
      const response = await apiClient.post('/exchange-rate-revaluation/preview', data)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to preview revaluation | فشل معاينة إعادة التقييم: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Run revaluation
   * NOT IMPLEMENTED: Backend returns 404
   * POST /api/exchange-rate-revaluation/run
   *
   * Executes the revaluation. Set autoPost=true to immediately post to GL.
   */
  runRevaluation: async (data: RevaluationRunData): Promise<ExchangeRateRevaluation> => {
    try {
      const response = await apiClient.post('/exchange-rate-revaluation/run', data)
      return response.data.revaluation || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to run revaluation | فشل تنفيذ إعادة التقييم: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Post revaluation to General Ledger
   * NOT IMPLEMENTED: Backend returns 404
   * POST /api/exchange-rate-revaluation/:id/post
   */
  postRevaluation: async (id: string): Promise<ExchangeRateRevaluation> => {
    try {
      const response = await apiClient.post(`/exchange-rate-revaluation/${id}/post`)
      return response.data.revaluation || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to post revaluation | فشل ترحيل إعادة التقييم: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Reverse revaluation
   * NOT IMPLEMENTED: Backend returns 404
   * POST /api/exchange-rate-revaluation/:id/reverse
   */
  reverseRevaluation: async (id: string): Promise<ExchangeRateRevaluation> => {
    try {
      const response = await apiClient.post(`/exchange-rate-revaluation/${id}/reverse`)
      return response.data.revaluation || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to reverse revaluation | فشل عكس إعادة التقييم: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get revaluation report for a period
   * NOT IMPLEMENTED: Backend returns 404
   * GET /api/exchange-rate-revaluation/report
   */
  getReport: async (filters: RevaluationReportFilters): Promise<{
    revaluations: ExchangeRateRevaluation[]
    summary: {
      totalGain: number
      totalLoss: number
      netGainLoss: number
      byPeriod: { period: string; gain: number; loss: number }[]
      byCurrency: { currency: string; gain: number; loss: number }[]
    }
  }> => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      const response = await apiClient.get(`/exchange-rate-revaluation/report?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch report | فشل جلب التقرير: ${handleApiError(error)}`
      )
    }
  },
}

export default exchangeRateRevaluationService
