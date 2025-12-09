/**
 * Price Level Service
 * Handles all client price tier/level API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Price Level Interface
 */
export interface PriceLevel {
  _id: string
  name: string
  description?: string
  type: 'hourly' | 'flat_rate' | 'custom'
  isDefault: boolean
  rates: {
    consultation?: number
    hourlyRate?: number
    minimumCharge?: number
    incrementMinutes?: number
    roundingRule?: 'up' | 'down' | 'nearest'
  }
  discounts?: {
    percentage?: number
    fixedAmount?: number
    conditions?: string[]
  }
  services?: {
    serviceType: string
    rate: number
    unit: 'hour' | 'case' | 'document' | 'flat'
  }[]
  currency: string
  effectiveDate?: string
  expiryDate?: string
  clientCount?: number
  status: 'active' | 'inactive' | 'archived'
  createdBy: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Price Level Data
 */
export interface CreatePriceLevelData {
  name: string
  description?: string
  type: 'hourly' | 'flat_rate' | 'custom'
  isDefault?: boolean
  rates: {
    consultation?: number
    hourlyRate?: number
    minimumCharge?: number
    incrementMinutes?: number
    roundingRule?: 'up' | 'down' | 'nearest'
  }
  discounts?: {
    percentage?: number
    fixedAmount?: number
    conditions?: string[]
  }
  services?: {
    serviceType: string
    rate: number
    unit: 'hour' | 'case' | 'document' | 'flat'
  }[]
  currency?: string
  effectiveDate?: string
  expiryDate?: string
  status?: 'active' | 'inactive' | 'archived'
}

/**
 * Price Level Filters
 */
export interface PriceLevelFilters {
  status?: string
  type?: string
  isDefault?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Client Rate Response
 */
export interface ClientRate {
  clientId: string
  priceLevel: PriceLevel
  effectiveRate: number
  appliedDiscounts?: any[]
}

/**
 * Price Level Service Object
 */
const priceLevelService = {
  /**
   * Get all price levels
   * GET /api/price-levels
   */
  getPriceLevels: async (filters?: PriceLevelFilters): Promise<{ data: PriceLevel[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/price-levels', { params: filters })
      return {
        data: response.data.priceLevels || response.data.data || [],
        pagination: response.data.pagination || {
          total: response.data.total || 0,
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
        },
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single price level
   * GET /api/price-levels/:id
   */
  getPriceLevel: async (id: string): Promise<PriceLevel> => {
    try {
      const response = await apiClient.get(`/price-levels/${id}`)
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create price level
   * POST /api/price-levels
   */
  createPriceLevel: async (data: CreatePriceLevelData): Promise<PriceLevel> => {
    try {
      const response = await apiClient.post('/price-levels', data)
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update price level
   * PUT /api/price-levels/:id
   */
  updatePriceLevel: async (id: string, data: Partial<CreatePriceLevelData>): Promise<PriceLevel> => {
    try {
      const response = await apiClient.put(`/price-levels/${id}`, data)
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete price level
   * DELETE /api/price-levels/:id
   */
  deletePriceLevel: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/price-levels/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get client rate (gets the price level for a specific client)
   * GET /api/price-levels/client-rate
   */
  getClientRate: async (clientId?: string): Promise<ClientRate> => {
    try {
      const response = await apiClient.get('/price-levels/client-rate', {
        params: { clientId },
      })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set default price level
   * POST /api/price-levels/:id/set-default
   */
  setDefault: async (id: string): Promise<PriceLevel> => {
    try {
      const response = await apiClient.post(`/price-levels/${id}/set-default`)
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get default price level
   * GET /api/price-levels/default
   */
  getDefaultPriceLevel: async (): Promise<PriceLevel> => {
    try {
      const response = await apiClient.get('/price-levels/default')
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate rate for service
   * POST /api/price-levels/:id/calculate
   */
  calculateRate: async (
    id: string,
    data: {
      serviceType: string
      duration?: number
      quantity?: number
    }
  ): Promise<{ calculatedRate: number; breakdown: any }> => {
    try {
      const response = await apiClient.post(`/price-levels/${id}/calculate`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Assign price level to client
   * POST /api/price-levels/:id/assign
   */
  assignToClient: async (id: string, clientId: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/price-levels/${id}/assign`, { clientId })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get clients using this price level
   * GET /api/price-levels/:id/clients
   */
  getClientsUsingPriceLevel: async (id: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/price-levels/${id}/clients`)
      return response.data.clients || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate price level
   * POST /api/price-levels/:id/duplicate
   */
  duplicatePriceLevel: async (id: string, newName?: string): Promise<PriceLevel> => {
    try {
      const response = await apiClient.post(`/price-levels/${id}/duplicate`, { name: newName })
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Archive price level
   * POST /api/price-levels/:id/archive
   */
  archivePriceLevel: async (id: string): Promise<PriceLevel> => {
    try {
      const response = await apiClient.post(`/price-levels/${id}/archive`)
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Restore archived price level
   * POST /api/price-levels/:id/restore
   */
  restorePriceLevel: async (id: string): Promise<PriceLevel> => {
    try {
      const response = await apiClient.post(`/price-levels/${id}/restore`)
      return response.data.priceLevel || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default priceLevelService
