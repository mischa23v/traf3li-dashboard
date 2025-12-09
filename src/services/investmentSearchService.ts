/**
 * Investment Search Service
 * Handles all investment search and discovery API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Symbol Search Result
 */
export interface SymbolSearchResult {
  symbol: string
  name: string
  type: string
  market: string
  exchange?: string
  currency?: string
  sector?: string
  industry?: string
}

/**
 * Symbol Quote
 */
export interface SymbolQuote {
  symbol: string
  name: string
  price: number
  change?: number
  changePercent?: number
  volume?: number
  marketCap?: number
  high?: number
  low?: number
  open?: number
  previousClose?: number
  timestamp?: string
  currency?: string
}

/**
 * Symbol Details
 */
export interface SymbolDetails {
  symbol: string
  name: string
  type: string
  market: string
  exchange?: string
  currency?: string
  sector?: string
  industry?: string
  description?: string
  website?: string
  ceo?: string
  employees?: number
  address?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  isin?: string
  cusip?: string
}

/**
 * Market Reference
 */
export interface Market {
  code: string
  name: string
  country: string
  timezone?: string
  currency?: string
}

/**
 * Investment Type
 */
export interface InvestmentType {
  code: string
  name: string
  description?: string
}

/**
 * Sector Reference
 */
export interface Sector {
  code: string
  name: string
  market?: string
}

/**
 * Symbol Search Filters
 */
export interface SymbolSearchFilters {
  query?: string
  type?: string
  market?: string
  sector?: string
  limit?: number
}

/**
 * Quote Filters
 */
export interface QuoteFilters {
  symbol: string
}

/**
 * Batch Quotes Request
 */
export interface BatchQuotesRequest {
  symbols: string[]
}

/**
 * Investment Search Service Object
 */
const investmentSearchService = {
  /**
   * Search symbols
   * GET /api/investment-search/symbols
   */
  searchSymbols: async (filters?: SymbolSearchFilters): Promise<SymbolSearchResult[]> => {
    try {
      const response = await apiClient.get('/investment-search/symbols', { params: filters })
      return response.data.data || response.data.symbols || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get quote for a symbol
   * GET /api/investment-search/quote
   */
  getQuote: async (filters: QuoteFilters): Promise<SymbolQuote> => {
    try {
      const response = await apiClient.get('/investment-search/quote', { params: filters })
      return response.data.data || response.data.quote
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get batch quotes
   * POST /api/investment-search/quotes
   */
  getBatchQuotes: async (data: BatchQuotesRequest): Promise<SymbolQuote[]> => {
    try {
      const response = await apiClient.post('/investment-search/quotes', data)
      return response.data.data || response.data.quotes || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all markets
   * GET /api/investment-search/markets
   */
  getMarkets: async (): Promise<Market[]> => {
    try {
      const response = await apiClient.get('/investment-search/markets')
      return response.data.data || response.data.markets || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all investment types
   * GET /api/investment-search/types
   */
  getTypes: async (): Promise<InvestmentType[]> => {
    try {
      const response = await apiClient.get('/investment-search/types')
      return response.data.data || response.data.types || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get sectors (optionally filtered by market)
   * GET /api/investment-search/sectors
   */
  getSectors: async (market?: string): Promise<Sector[]> => {
    try {
      const response = await apiClient.get('/investment-search/sectors', {
        params: market ? { market } : undefined,
      })
      return response.data.data || response.data.sectors || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get symbols by market
   * GET /api/investment-search/market/:market
   */
  getSymbolsByMarket: async (market: string): Promise<SymbolSearchResult[]> => {
    try {
      const response = await apiClient.get(`/investment-search/market/${market}`)
      return response.data.data || response.data.symbols || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get symbols by type
   * GET /api/investment-search/type/:type
   */
  getSymbolsByType: async (type: string): Promise<SymbolSearchResult[]> => {
    try {
      const response = await apiClient.get(`/investment-search/type/${type}`)
      return response.data.data || response.data.symbols || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get symbol details
   * GET /api/investment-search/symbol/:symbol
   */
  getSymbolDetails: async (symbol: string): Promise<SymbolDetails> => {
    try {
      const response = await apiClient.get(`/investment-search/symbol/${symbol}`)
      return response.data.data || response.data.details
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default investmentSearchService
