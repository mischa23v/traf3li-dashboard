/**
 * Investments Service
 * Handles all investment portfolio management API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Investment Interface
 */
export interface Investment {
  _id: string
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'real_estate' | 'commodity' | 'other'
  market: string
  quantity: number
  purchasePrice: number
  currentPrice?: number
  purchaseDate: string
  sector?: string
  currency: string
  notes?: string
  lastPriceUpdate?: string
  totalValue?: number
  totalCost?: number
  unrealizedGain?: number
  unrealizedGainPercent?: number
  realizedGain?: number
  dividends?: number
  createdAt: string
  updatedAt: string
}

/**
 * Create Investment Data
 */
export interface CreateInvestmentData {
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'real_estate' | 'commodity' | 'other'
  market: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  sector?: string
  currency: string
  notes?: string
}

/**
 * Update Investment Data
 */
export interface UpdateInvestmentData {
  symbol?: string
  name?: string
  type?: 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'real_estate' | 'commodity' | 'other'
  market?: string
  quantity?: number
  purchasePrice?: number
  currentPrice?: number
  purchaseDate?: string
  sector?: string
  currency?: string
  notes?: string
}

/**
 * Transaction Interface
 */
export interface Transaction {
  _id: string
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'fee'
  date: string
  quantity: number
  price: number
  amount: number
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Transaction Data
 */
export interface CreateTransactionData {
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'fee'
  date: string
  quantity: number
  price: number
  amount?: number
  notes?: string
}

/**
 * Portfolio Summary
 */
export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGain: number
  totalGainPercent: number
  realizedGain: number
  unrealizedGain: number
  totalDividends: number
  assetAllocation: Array<{
    type: string
    value: number
    percentage: number
  }>
  topPerformers: Array<{
    symbol: string
    name: string
    gain: number
    gainPercent: number
  }>
  bottomPerformers: Array<{
    symbol: string
    name: string
    gain: number
    gainPercent: number
  }>
  byMarket: Array<{
    market: string
    value: number
    percentage: number
  }>
  bySector: Array<{
    sector: string
    value: number
    percentage: number
  }>
}

/**
 * Investment Filters
 */
export interface InvestmentFilters {
  type?: string
  market?: string
  sector?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Refresh Price Response
 */
export interface RefreshPriceResponse {
  investment: Investment
  previousPrice?: number
  priceChange?: number
  priceChangePercent?: number
}

/**
 * Investments Service Object
 */
const investmentsService = {
  /**
   * Get portfolio summary
   * GET /api/investments/summary
   */
  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    try {
      const response = await apiClient.get('/investments/summary')
      return response.data.data || response.data.summary
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Refresh all prices
   * POST /api/investments/refresh-all
   */
  refreshAllPrices: async (): Promise<{ updated: number; failed: number; errors?: any[] }> => {
    try {
      const response = await apiClient.post('/investments/refresh-all')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create investment
   * POST /api/investments
   */
  createInvestment: async (data: CreateInvestmentData): Promise<Investment> => {
    try {
      const response = await apiClient.post('/investments', data)
      return response.data.investment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all investments
   * GET /api/investments
   */
  getInvestments: async (filters?: InvestmentFilters): Promise<{ data: Investment[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/investments', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single investment
   * GET /api/investments/:id
   */
  getInvestment: async (id: string): Promise<Investment> => {
    try {
      const response = await apiClient.get(`/investments/${id}`)
      return response.data.data || response.data.investment
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update investment
   * PUT /api/investments/:id
   */
  updateInvestment: async (id: string, data: UpdateInvestmentData): Promise<Investment> => {
    try {
      const response = await apiClient.put(`/investments/${id}`, data)
      return response.data.investment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete investment
   * DELETE /api/investments/:id
   */
  deleteInvestment: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/investments/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Refresh price for single investment
   * POST /api/investments/:id/refresh-price
   */
  refreshPrice: async (id: string): Promise<RefreshPriceResponse> => {
    try {
      const response = await apiClient.post(`/investments/${id}/refresh-price`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add transaction to investment
   * POST /api/investments/:id/transactions
   */
  addTransaction: async (id: string, data: CreateTransactionData): Promise<Transaction> => {
    try {
      const response = await apiClient.post(`/investments/${id}/transactions`, data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transactions for investment
   * GET /api/investments/:id/transactions
   */
  getTransactions: async (id: string): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get(`/investments/${id}/transactions`)
      return response.data.data || response.data.transactions || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete transaction
   * DELETE /api/investments/:id/transactions/:transactionId
   */
  deleteTransaction: async (id: string, transactionId: string): Promise<void> => {
    try {
      await apiClient.delete(`/investments/${id}/transactions/${transactionId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default investmentsService
