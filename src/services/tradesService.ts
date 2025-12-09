/**
 * Trades Service
 * Handles all trade-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Trade Interface
 */
export interface Trade {
  _id: string
  tradeId?: string
  accountId: string
  symbol: string
  type: 'buy' | 'sell'
  direction: 'long' | 'short'
  openTime: string
  closeTime?: string
  openPrice: number
  closePrice?: number
  lotSize: number
  stopLoss?: number
  takeProfit?: number
  commission?: number
  swap?: number
  profit?: number
  profitCurrency?: string
  status: 'open' | 'closed' | 'pending'
  strategy?: string
  tags?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Trade Data
 */
export interface CreateTradeData {
  accountId: string
  symbol: string
  type: 'buy' | 'sell'
  direction: 'long' | 'short'
  openTime: string
  openPrice: number
  lotSize: number
  stopLoss?: number
  takeProfit?: number
  commission?: number
  swap?: number
  strategy?: string
  tags?: string[]
  notes?: string
}

/**
 * Close Trade Data
 */
export interface CloseTradeData {
  closeTime: string
  closePrice: number
  commission?: number
  swap?: number
}

/**
 * Trade Filters
 */
export interface TradeFilters {
  status?: string
  accountId?: string
  symbol?: string
  type?: string
  direction?: string
  strategy?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Trade Statistics
 */
export interface TradeStats {
  totalTrades: number
  openTrades: number
  closedTrades: number
  totalProfit: number
  totalLoss: number
  netProfit: number
  winRate: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  largestWin: number
  largestLoss: number
  consecutiveWins: number
  consecutiveLosses: number
}

/**
 * Chart Data Point
 */
export interface ChartDataPoint {
  date: string
  profit: number
  cumulativeProfit: number
  trades: number
}

/**
 * Trades Service Object
 */
const tradesService = {
  /**
   * Get all trades
   * GET /api/trades
   */
  getTrades: async (filters?: TradeFilters): Promise<{ data: Trade[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/trades', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single trade
   * GET /api/trades/:id
   */
  getTrade: async (id: string): Promise<Trade> => {
    try {
      const response = await apiClient.get(`/trades/${id}`)
      return response.data.data || response.data.trade
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create trade
   * POST /api/trades
   */
  createTrade: async (data: CreateTradeData): Promise<Trade> => {
    try {
      const response = await apiClient.post('/trades', data)
      return response.data.trade || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update trade
   * PATCH /api/trades/:id
   */
  updateTrade: async (id: string, data: Partial<CreateTradeData>): Promise<Trade> => {
    try {
      const response = await apiClient.patch(`/trades/${id}`, data)
      return response.data.trade || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete trade
   * DELETE /api/trades/:id
   */
  deleteTrade: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/trades/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Close trade
   * POST /api/trades/:id/close
   */
  closeTrade: async (id: string, data: CloseTradeData): Promise<Trade> => {
    try {
      const response = await apiClient.post(`/trades/${id}/close`, data)
      return response.data.trade || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get trade statistics
   * GET /api/trades/stats
   */
  getTradeStats: async (filters?: { startDate?: string; endDate?: string; accountId?: string }): Promise<TradeStats> => {
    try {
      const response = await apiClient.get('/trades/stats', { params: filters })
      return response.data.data || response.data.stats
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get chart data
   * GET /api/trades/stats/chart
   */
  getChartData: async (filters?: { startDate?: string; endDate?: string; accountId?: string; interval?: string }): Promise<ChartDataPoint[]> => {
    try {
      const response = await apiClient.get('/trades/stats/chart', { params: filters })
      return response.data.data || response.data.chartData || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete trades
   * DELETE /api/trades/bulk
   */
  bulkDeleteTrades: async (tradeIds: string[]): Promise<{ count: number }> => {
    try {
      const response = await apiClient.delete('/trades/bulk', {
        data: { tradeIds },
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import trades from CSV
   * POST /api/trades/import/csv
   */
  importFromCsv: async (file: File, accountId?: string): Promise<{ imported: number; failed: number; errors?: any[] }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (accountId) {
        formData.append('accountId', accountId)
      }
      const response = await apiClient.post('/trades/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default tradesService
