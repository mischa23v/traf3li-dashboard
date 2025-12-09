/**
 * Brokers Service
 * Handles all broker-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Broker Interface
 */
export interface Broker {
  _id: string
  name: string
  code?: string
  platform?: string
  accountType?: string
  leverage?: number
  spreadType?: 'fixed' | 'variable'
  commission?: number
  swapFree?: boolean
  minimumDeposit?: number
  currency?: string
  serverAddress?: string
  apiKey?: string
  apiSecret?: string
  websiteUrl?: string
  supportEmail?: string
  supportPhone?: string
  notes?: string
  isDefault?: boolean
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

/**
 * Create Broker Data
 */
export interface CreateBrokerData {
  name: string
  code?: string
  platform?: string
  accountType?: string
  leverage?: number
  spreadType?: 'fixed' | 'variable'
  commission?: number
  swapFree?: boolean
  minimumDeposit?: number
  currency?: string
  serverAddress?: string
  apiKey?: string
  apiSecret?: string
  websiteUrl?: string
  supportEmail?: string
  supportPhone?: string
  notes?: string
  status?: 'active' | 'inactive'
}

/**
 * Broker Filters
 */
export interface BrokerFilters {
  status?: string
  platform?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Brokers Service Object
 */
const brokersService = {
  /**
   * Get all brokers
   * GET /api/brokers
   */
  getBrokers: async (filters?: BrokerFilters): Promise<{ data: Broker[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/brokers', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single broker
   * GET /api/brokers/:id
   */
  getBroker: async (id: string): Promise<Broker> => {
    try {
      const response = await apiClient.get(`/brokers/${id}`)
      return response.data.data || response.data.broker
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create broker
   * POST /api/brokers
   */
  createBroker: async (data: CreateBrokerData): Promise<Broker> => {
    try {
      const response = await apiClient.post('/brokers', data)
      return response.data.broker || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update broker
   * PATCH /api/brokers/:id
   */
  updateBroker: async (id: string, data: Partial<CreateBrokerData>): Promise<Broker> => {
    try {
      const response = await apiClient.patch(`/brokers/${id}`, data)
      return response.data.broker || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete broker
   * DELETE /api/brokers/:id
   */
  deleteBroker: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/brokers/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set broker as default
   * POST /api/brokers/:id/set-default
   */
  setDefaultBroker: async (id: string): Promise<Broker> => {
    try {
      const response = await apiClient.post(`/brokers/${id}/set-default`)
      return response.data.broker || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default brokersService
