/**
 * Clients Service
 * Handles all client-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Client Interface
 */
export interface Client {
  _id: string
  clientId: string
  lawyerId: string
  fullName: string
  email?: string
  phone: string
  alternatePhone?: string
  nationalId?: string
  companyName?: string
  companyRegistration?: string
  address?: string
  city?: string
  country: string
  notes?: string
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp'
  language: string
  status: 'active' | 'inactive' | 'archived'
  // Billing & Balance (NEW)
  billing?: {
    creditBalance: number
    currency?: string
  }
  totalPaid?: number
  totalOutstanding?: number
  // Conversion tracking (NEW)
  convertedFromLead?: boolean
  convertedAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Client Data
 */
export interface CreateClientData {
  fullName: string
  email?: string
  phone: string
  alternatePhone?: string
  nationalId?: string
  companyName?: string
  companyRegistration?: string
  address?: string
  city?: string
  country?: string
  notes?: string
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp'
  language?: string
}

/**
 * Client Filters
 */
export interface ClientFilters {
  status?: string
  search?: string
  city?: string
  country?: string
  page?: number
  limit?: number
}

/**
 * Client Detail with Related Data
 */
export interface ClientDetail {
  client: Client
  relatedData: {
    cases: any[]
    invoices: any[]
    payments: any[]
  }
  summary: {
    totalCases: number
    totalInvoices: number
    totalInvoiced: number
    totalPaid: number
    outstandingBalance: number
  }
}

/**
 * Clients Service Object
 */
const clientsService = {
  /**
   * Get all clients
   */
  getClients: async (filters?: ClientFilters): Promise<{ data: Client[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/clients', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single client with related data
   */
  getClient: async (id: string): Promise<ClientDetail> => {
    try {
      const response = await apiClient.get(`/clients/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create client
   */
  createClient: async (data: CreateClientData): Promise<Client> => {
    try {
      const response = await apiClient.post('/clients', data)
      return response.data.client || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update client
   */
  updateClient: async (id: string, data: Partial<CreateClientData>): Promise<Client> => {
    try {
      const response = await apiClient.put(`/clients/${id}`, data)
      return response.data.client || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete client
   */
  deleteClient: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/clients/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Search clients
   */
  searchClients: async (query: string): Promise<{ data: Client[]; count: number }> => {
    try {
      const response = await apiClient.get('/clients/search', {
        params: { q: query },
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get client statistics
   */
  getStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/clients/stats')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get top clients by revenue
   */
  getTopRevenue: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await apiClient.get('/clients/top-revenue', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete clients
   */
  bulkDelete: async (clientIds: string[]): Promise<{ count: number }> => {
    try {
      const response = await apiClient.delete('/clients/bulk', {
        data: { clientIds },
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default clientsService
