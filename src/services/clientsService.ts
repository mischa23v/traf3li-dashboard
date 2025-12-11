/**
 * Clients Service
 * Handles all client-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Client Interface - matches backend API response
 */
export interface Client {
  _id: string
  clientNumber?: string
  clientType?: 'individual' | 'company'
  lawyerId?: string
  // Name fields - individual clients
  fullNameArabic?: string
  fullNameEnglish?: string
  firstName?: string
  lastName?: string
  // Company fields
  companyName?: string
  companyNameEnglish?: string
  crNumber?: string
  // Contact info
  email?: string
  phone?: string
  alternatePhone?: string
  whatsapp?: string
  // Identification
  nationalId?: string
  // Address
  address?: string | {
    city?: string
    district?: string
    street?: string
    postalCode?: string
  }
  city?: string
  country?: string
  // Preferences
  notes?: string
  generalNotes?: string
  preferredContact?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredLanguage?: string
  language?: string
  status?: 'active' | 'inactive' | 'archived' | 'pending'
  // Billing & Balance
  billing?: {
    creditBalance: number
    currency?: string
  }
  totalPaid?: number
  totalOutstanding?: number
  // Conversion tracking
  convertedFromLead?: boolean
  convertedAt?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Create Client Data - matches backend API
 */
export interface CreateClientData {
  clientType?: 'individual' | 'company'
  fullNameArabic?: string
  fullNameEnglish?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  alternatePhone?: string
  nationalId?: string
  companyName?: string
  companyNameEnglish?: string
  crNumber?: string
  address?: string | {
    city?: string
    district?: string
    street?: string
    postalCode?: string
  }
  city?: string
  country?: string
  notes?: string
  generalNotes?: string
  preferredContact?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredLanguage?: string
  language?: string
  status?: 'active' | 'inactive' | 'archived' | 'pending'
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

  /**
   * Get client's cases
   * GET /api/clients/:id/cases
   */
  getClientCases: async (id: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/clients/${id}/cases`)
      return response.data.data || response.data.cases || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get client's invoices
   * GET /api/clients/:id/invoices
   */
  getClientInvoices: async (id: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/clients/${id}/invoices`)
      return response.data.data || response.data.invoices || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get client's payments
   * GET /api/clients/:id/payments
   */
  getClientPayments: async (id: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/clients/${id}/payments`)
      return response.data.data || response.data.payments || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get client's billing information
   * GET /api/clients/:id/billing-info
   */
  getBillingInfo: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/clients/${id}/billing-info`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify company with Wathq API (Saudi CR verification)
   * POST /api/clients/:id/verify/wathq
   */
  verifyWithWathq: async (id: string, data?: any): Promise<{ verified: boolean; data?: any }> => {
    try {
      const response = await apiClient.post(`/clients/${id}/verify/wathq`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get Wathq data for a specific data type
   * GET /api/clients/:id/wathq/:dataType
   */
  getWathqData: async (id: string, dataType: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/clients/${id}/wathq/${dataType}`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload attachments for a client
   * POST /api/clients/:id/attachments
   */
  uploadAttachments: async (id: string, files: File[]): Promise<any> => {
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })
      const response = await apiClient.post(`/clients/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete an attachment
   * DELETE /api/clients/:id/attachments/:attachmentId
   */
  deleteAttachment: async (id: string, attachmentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/clients/${id}/attachments/${attachmentId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Run conflict check for a client
   * POST /api/clients/:id/conflict-check
   */
  runConflictCheck: async (id: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.post(`/clients/${id}/conflict-check`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update client status
   * PATCH /api/clients/:id/status
   */
  updateStatus: async (id: string, status: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/clients/${id}/status`, { status })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update client flags
   * PATCH /api/clients/:id/flags
   */
  updateFlags: async (id: string, flags: any): Promise<any> => {
    try {
      const response = await apiClient.patch(`/clients/${id}/flags`, flags)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default clientsService
