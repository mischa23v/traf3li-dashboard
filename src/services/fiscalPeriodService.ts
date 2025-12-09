/**
 * Fiscal Period Service
 * Handles fiscal year and period management API calls
 */

import apiClient from '@/lib/api'

// ==================== TYPES ====================

export type FiscalPeriodStatus = 'future' | 'open' | 'closed' | 'locked'

export interface FiscalPeriod {
  _id: string
  fiscalYear: number
  periodNumber: number
  name: string
  nameAr: string
  startDate: string
  endDate: string
  status: FiscalPeriodStatus
  openedAt?: string
  closedAt?: string
  lockedAt?: string
  openingBalanceEntryId?: string
  closingBalanceEntryId?: string
  createdAt: string
  updatedAt: string
}

export interface FiscalPeriodBalances {
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  totalIncome: number
  totalExpenses: number
  netIncome: number
  isBalanced: boolean
}

export interface FiscalYearSummary {
  fiscalYear: number
  periods: FiscalPeriod[]
  totalPeriods: number
  openPeriods: number
  closedPeriods: number
}

export interface CanPostResponse {
  canPost: boolean
  period?: FiscalPeriod
  reason?: string
}

export interface CreateFiscalYearData {
  fiscalYear: number
  startMonth: number // 1-12
}

// ==================== SERVICE ====================

const fiscalPeriodService = {
  /**
   * Get all fiscal periods
   * GET /api/fiscal-periods
   */
  getFiscalPeriods: async (): Promise<FiscalPeriod[]> => {
    const response = await apiClient.get('/fiscal-periods')
    return response.data.data
  },

  /**
   * Get current fiscal period
   * GET /api/fiscal-periods/current
   */
  getCurrentPeriod: async (): Promise<FiscalPeriod> => {
    const response = await apiClient.get('/fiscal-periods/current')
    return response.data.data
  },

  /**
   * Check if can post to a specific date
   * GET /api/fiscal-periods/can-post?date=YYYY-MM-DD
   */
  canPostToDate: async (date: string): Promise<CanPostResponse> => {
    const response = await apiClient.get('/fiscal-periods/can-post', { params: { date } })
    return response.data.data
  },

  /**
   * Get fiscal years summary
   * GET /api/fiscal-periods/years-summary
   */
  getFiscalYearsSummary: async (): Promise<FiscalYearSummary[]> => {
    const response = await apiClient.get('/fiscal-periods/years-summary')
    return response.data.data
  },

  /**
   * Create a new fiscal year with all periods
   * POST /api/fiscal-periods/create-year
   */
  createFiscalYear: async (data: CreateFiscalYearData): Promise<FiscalPeriod[]> => {
    const response = await apiClient.post('/fiscal-periods/create-year', data)
    return response.data.data
  },

  /**
   * Get a single fiscal period by ID
   * GET /api/fiscal-periods/:id
   */
  getFiscalPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.get(`/fiscal-periods/${id}`)
    return response.data.data
  },

  /**
   * Calculate balances for a fiscal period
   * GET /api/fiscal-periods/:id/balances
   */
  calculateBalances: async (id: string): Promise<FiscalPeriodBalances> => {
    const response = await apiClient.get(`/fiscal-periods/${id}/balances`)
    return response.data.data
  },

  /**
   * Open a fiscal period
   * POST /api/fiscal-periods/:id/open
   */
  openPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/open`)
    return response.data.data
  },

  /**
   * Close a fiscal period
   * POST /api/fiscal-periods/:id/close
   */
  closePeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/close`)
    return response.data.data
  },

  /**
   * Reopen a fiscal period
   * POST /api/fiscal-periods/:id/reopen
   */
  reopenPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/reopen`)
    return response.data.data
  },

  /**
   * Lock a fiscal period (prevents any modifications)
   * POST /api/fiscal-periods/:id/lock
   */
  lockPeriod: async (id: string): Promise<FiscalPeriod> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/lock`)
    return response.data.data
  },

  /**
   * Perform year-end closing
   * Creates closing entries and carries forward balances
   * POST /api/fiscal-periods/:id/year-end-closing
   */
  yearEndClosing: async (id: string): Promise<{
    period: FiscalPeriod
    closingEntry: any
  }> => {
    const response = await apiClient.post(`/fiscal-periods/${id}/year-end-closing`)
    return response.data.data
  },
}

export default fiscalPeriodService
