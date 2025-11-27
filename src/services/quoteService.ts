/**
 * Quote Service
 * Handles all quote-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

export type QuoteStatus = 'draft' | 'pending' | 'sent' | 'accepted' | 'declined' | 'cancelled' | 'on_hold' | 'expired'

export interface Quote {
  _id: string
  quoteNumber: string
  clientId: string | { firstName: string; lastName: string; name?: string; _id: string }
  caseId?: string
  items: QuoteItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  status: QuoteStatus
  issueDate: string
  expiredDate: string
  validUntil?: string
  notes?: string
  terms?: string
  currency: string
  convertedToInvoice?: boolean
  invoiceId?: string
  history?: QuoteHistory[]
  createdAt: string
  updatedAt: string
}

export interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface QuoteHistory {
  action: string
  performedBy: string
  timestamp: string
  details?: any
}

export interface CreateQuoteData {
  clientId: string
  caseId?: string
  items: QuoteItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  totalAmount: number
  expiredDate: string
  notes?: string
  terms?: string
  currency?: string
}

export interface QuoteFilters {
  status?: QuoteStatus
  clientId?: string
  caseId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

const quoteService = {
  // Get all quotes with optional filters
  getQuotes: async (filters?: QuoteFilters) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value))
          }
        })
      }
      const query = params.toString()
      const response = await apiClient.get(`/quotes${query ? `?${query}` : ''}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get single quote by ID
  getQuote: async (id: string) => {
    try {
      const response = await apiClient.get(`/quotes/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new quote
  createQuote: async (data: CreateQuoteData) => {
    try {
      const response = await apiClient.post('/quotes', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update quote
  updateQuote: async (id: string, data: Partial<CreateQuoteData>) => {
    try {
      const response = await apiClient.put(`/quotes/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete quote
  deleteQuote: async (id: string) => {
    try {
      const response = await apiClient.delete(`/quotes/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Send quote to client
  sendQuote: async (id: string) => {
    try {
      const response = await apiClient.post(`/quotes/${id}/send`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update quote status
  updateQuoteStatus: async (id: string, status: QuoteStatus) => {
    try {
      const response = await apiClient.patch(`/quotes/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Convert quote to invoice
  convertToInvoice: async (id: string) => {
    try {
      const response = await apiClient.post(`/quotes/${id}/convert-to-invoice`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get quotes summary/statistics
  getQuotesSummary: async (filters?: QuoteFilters) => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value))
          }
        })
      }
      const query = params.toString()
      const response = await apiClient.get(`/quotes/summary${query ? `?${query}` : ''}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Duplicate quote
  duplicateQuote: async (id: string) => {
    try {
      const response = await apiClient.post(`/quotes/${id}/duplicate`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default quoteService
