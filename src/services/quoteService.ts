/**
 * Quote Service
 * Handles all quote-related API calls
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'

// ═══════════════════════════════════════════════════════════════
// QUOTE TYPES
// ═══════════════════════════════════════════════════════════════

export type QuoteStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'on_hold'
  | 'expired'

export type QuoteValidStatus = 'valid' | 'expiring_soon' | 'expired'
export type QuoteCustomerType = 'lead' | 'client'

export interface QuoteItem {
  _id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxRate?: number
  discount?: number
}

export interface QuoteHistoryItem {
  _id?: string
  action: string
  performedBy: string | { _id: string; firstName: string; lastName: string }
  timestamp: string | Date
  details?: any
  notes?: string
}

export interface Quote {
  _id: string
  quoteNumber: string
  clientId: string | { _id: string; firstName: string; lastName: string; name?: string }
  leadId?: string | { _id: string; firstName: string; lastName: string; email?: string }
  customerType: QuoteCustomerType
  caseId?: string | { _id: string; caseNumber: string; title?: string }
  items: QuoteItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  discount?: number
  discountAmount?: number
  totalAmount: number
  status: QuoteStatus
  issueDate: string | Date
  expiryDate: string | Date
  validUntil?: string | Date
  notes?: string
  terms?: string
  termsAr?: string
  currency: string
  convertedToInvoice?: boolean
  invoiceId?: string | { _id: string; invoiceNumber: string }
  viewedAt?: string | Date
  viewCount?: number
  sentAt?: string | Date
  acceptedAt?: string | Date
  rejectedAt?: string | Date
  rejectionReason?: string
  signature?: string
  history?: QuoteHistoryItem[]
  createdBy?: string | { _id: string; firstName: string; lastName: string }
  updatedBy?: string | { _id: string; firstName: string; lastName: string }
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateQuoteData {
  clientId?: string
  leadId?: string
  customerType: QuoteCustomerType
  caseId?: string
  items: QuoteItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  discount?: number
  discountAmount?: number
  totalAmount: number
  expiryDate: string | Date
  notes?: string
  terms?: string
  termsAr?: string
  currency?: string
  status?: QuoteStatus
}

export interface QuoteFilters {
  search?: string
  status?: string | string[]
  customerType?: QuoteCustomerType
  clientId?: string
  leadId?: string
  caseId?: string
  createdBy?: string
  validStatus?: QuoteValidStatus
  createdAfter?: string
  createdBefore?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ═══════════════════════════════════════════════════════════════
// QUOTE SERVICE
// ═══════════════════════════════════════════════════════════════

export const quoteService = {
  /**
   * Get all quotes with optional filters
   */
  getQuotes: async (
    params?: QuoteFilters
  ): Promise<{ data: Quote[]; total: number; page: number; limit: number }> => {
    try {
      // Handle status as array
      const queryParams = { ...params }
      if (params?.status && Array.isArray(params.status)) {
        queryParams.status = params.status.join(',')
      }

      const response = await apiClient.get('/quotes', { params: queryParams })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single quote by ID
   */
  getQuote: async (quoteId: string): Promise<Quote> => {
    try {
      const response = await apiClient.get(`/quotes/${quoteId}`)
      return response.data.data || response.data.quote || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_NOT_FOUND')
    }
  },

  /**
   * Create new quote
   */
  createQuote: async (data: CreateQuoteData): Promise<Quote> => {
    try {
      const response = await apiClient.post('/quotes', data)
      // Backend returns: { success, message, data: quote }
      return response.data.data || response.data.quote || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_CREATE_FAILED')
    }
  },

  /**
   * Update quote
   */
  updateQuote: async (quoteId: string, data: Partial<Quote>): Promise<Quote> => {
    try {
      const response = await apiClient.put(`/quotes/${quoteId}`, data)
      // Backend returns: { success, message, data: quote }
      return response.data.data || response.data.quote || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_UPDATE_FAILED')
    }
  },

  /**
   * Delete quote
   */
  deleteQuote: async (quoteId: string): Promise<void> => {
    try {
      await apiClient.delete(`/quotes/${quoteId}`)
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_DELETE_FAILED')
    }
  },

  /**
   * Duplicate quote
   */
  duplicateQuote: async (quoteId: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/duplicate`)
      // Backend returns: { success, message, data: quote }
      return response.data.data || response.data.quote || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_CREATE_FAILED')
    }
  },

  /**
   * Send quote to customer
   */
  sendQuote: async (
    quoteId: string,
    data?: { email?: string; message?: string }
  ): Promise<void> => {
    try {
      await apiClient.post(`/quotes/${quoteId}/send`, data || {})
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_SEND_FAILED')
    }
  },

  /**
   * Mark quote as viewed (for tracking)
   */
  markViewed: async (quoteId: string): Promise<void> => {
    try {
      await apiClient.post(`/quotes/${quoteId}/view`)
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_UPDATE_FAILED')
    }
  },

  /**
   * Accept quote
   */
  acceptQuote: async (quoteId: string, signature?: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/accept`, {
        signature,
      })
      // Backend returns: { success, message, data: quote }
      return response.data.data || response.data.quote || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_UPDATE_FAILED')
    }
  },

  /**
   * Reject quote
   */
  rejectQuote: async (quoteId: string, reason?: string): Promise<Quote> => {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/reject`, {
        reason,
      })
      // Backend returns: { success, message, data: quote }
      return response.data.data || response.data.quote || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_UPDATE_FAILED')
    }
  },

  /**
   * Convert quote to invoice
   */
  convertToInvoice: async (
    quoteId: string
  ): Promise<{ invoiceId: string; invoice?: any }> => {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/convert-to-invoice`)
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_CONVERT_FAILED')
    }
  },

  /**
   * Get quote PDF
   */
  getQuotePdf: async (
    quoteId: string,
    language?: 'ar' | 'en'
  ): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/quotes/${quoteId}/pdf`, {
        params: { language },
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_PDF_FAILED')
    }
  },

  /**
   * Get quote history/timeline
   */
  getQuoteHistory: async (quoteId: string): Promise<QuoteHistoryItem[]> => {
    try {
      const response = await apiClient.get(`/quotes/${quoteId}/history`)
      return response.data.data || response.data.history || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_NOT_FOUND')
    }
  },

  /**
   * Update quote status
   * @deprecated Use specific methods like acceptQuote, rejectQuote instead
   */
  updateQuoteStatus: async (
    quoteId: string,
    status: QuoteStatus
  ): Promise<Quote> => {
    try {
      const response = await apiClient.patch(`/quotes/${quoteId}/status`, {
        status,
      })
      // Backend returns: { success, message, data: quote }
      return response.data.data || response.data.quote || response.data
    } catch (error: any) {
      throwBilingualError(error, 'QUOTE_UPDATE_FAILED')
    }
  },

  /**
   * Get quotes summary/statistics
   */
  getQuotesSummary: async (params?: QuoteFilters): Promise<{
    total: number
    byStatus: Record<QuoteStatus, number>
    totalValue: number
    averageValue: number
    conversionRate: number
  }> => {
    try {
      const response = await apiClient.get('/quotes/summary', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

export default quoteService
