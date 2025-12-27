/**
 * Client Service
 * Handles all client-related API calls
 * Includes comprehensive client management, related entities, and financial operations
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'
import type { Client, CreateClientData } from './clientsService'
import type { Case } from './casesService'
import type { Invoice } from './financeService'
import type { Quote } from './quoteService'
import type { Payment } from './financeService'
import type { CrmActivity } from '@/types/crm'

// ═══════════════════════════════════════════════════════════════
// CLIENT SERVICE
// ═══════════════════════════════════════════════════════════════
export const clientService = {
  /**
   * List clients with filtering and pagination
   * GET /api/clients
   */
  async getClients(params?: {
    search?: string
    clientType?: 'individual' | 'company'
    status?: string[]
    accountManagerId?: string
    territoryId?: string
    salesTeamId?: string
    creditStatus?: string
    tags?: string[]
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ data: Client[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiClient.get('/clients', { params })
      // Backend may return different response structures
      // Handle: { data: [...], pagination: {...} } or { data: [...], total: ... }
      const responseData = response.data

      if (responseData.pagination) {
        return {
          data: responseData.data || [],
          total: responseData.pagination.total || 0,
          page: responseData.pagination.page || 1,
          limit: responseData.pagination.limit || 10,
        }
      }

      return {
        data: responseData.data || [],
        total: responseData.total || responseData.data?.length || 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
      }
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single client by ID
   * GET /api/clients/:clientId
   */
  async getClient(clientId: string): Promise<Client> {
    try {
      const response = await apiClient.get(`/clients/${clientId}`)
      // Backend returns: { success, data: { client, relatedData, summary } } or { data: client }
      const data = response.data.data || response.data

      if (data.client) {
        return data.client
      }

      return data as Client
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_NOT_FOUND')
    }
  },

  /**
   * Create new client
   * POST /api/clients
   */
  async createClient(data: CreateClientData): Promise<Client> {
    try {
      const response = await apiClient.post('/clients', data)
      // Backend returns: { success, message, data: client } or { client }
      return response.data.data?.client || response.data.data || response.data.client
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_CREATE_FAILED')
    }
  },

  /**
   * Update client
   * PUT /api/clients/:clientId
   */
  async updateClient(clientId: string, data: Partial<Client>): Promise<Client> {
    try {
      const response = await apiClient.put(`/clients/${clientId}`, data)
      // Backend returns: { success, message, data: client } or { client }
      return response.data.data?.client || response.data.data || response.data.client
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_UPDATE_FAILED')
    }
  },

  /**
   * Delete client
   * DELETE /api/clients/:clientId
   */
  async deleteClient(clientId: string): Promise<void> {
    try {
      await apiClient.delete(`/clients/${clientId}`)
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_DELETE_FAILED')
    }
  },

  /**
   * Get client cases with filtering and pagination
   * GET /api/clients/:clientId/cases
   */
  async getClientCases(
    clientId: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<{ data: Case[]; total: number }> {
    try {
      const response = await apiClient.get(`/clients/${clientId}/cases`, {
        params,
      })
      const data = response.data.data || response.data

      return {
        data: data.cases || data.data || data || [],
        total: data.total || data.cases?.length || data.data?.length || data.length || 0,
      }
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_NOT_FOUND')
    }
  },

  /**
   * Get client invoices with financial summary
   * GET /api/clients/:clientId/invoices
   */
  async getClientInvoices(
    clientId: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<{
    data: Invoice[]
    total: number
    totalInvoiced: number
    totalPaid: number
    totalOutstanding: number
  }> {
    try {
      const response = await apiClient.get(`/clients/${clientId}/invoices`, {
        params,
      })
      const data = response.data.data || response.data

      return {
        data: data.invoices || data.data || data || [],
        total: data.total || data.invoices?.length || data.data?.length || data.length || 0,
        totalInvoiced: data.totalInvoiced || data.summary?.totalInvoiced || 0,
        totalPaid: data.totalPaid || data.summary?.totalPaid || 0,
        totalOutstanding: data.totalOutstanding || data.summary?.totalOutstanding || 0,
      }
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_NOT_FOUND')
    }
  },

  /**
   * Get client quotes with pagination
   * GET /api/clients/:clientId/quotes
   */
  async getClientQuotes(
    clientId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: Quote[]; total: number }> {
    try {
      const response = await apiClient.get(`/clients/${clientId}/quotes`, {
        params,
      })
      const data = response.data.data || response.data

      return {
        data: data.quotes || data.data || data || [],
        total: data.total || data.quotes?.length || data.data?.length || data.length || 0,
      }
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_NOT_FOUND')
    }
  },

  /**
   * Get client activities (CRM timeline)
   * GET /api/clients/:clientId/activities
   */
  async getClientActivities(
    clientId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: CrmActivity[]; total: number }> {
    try {
      const response = await apiClient.get(`/clients/${clientId}/activities`, {
        params,
      })
      const data = response.data.data || response.data

      return {
        data: data.activities || data.data || data || [],
        total: data.total || data.activities?.length || data.data?.length || data.length || 0,
      }
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_NOT_FOUND')
    }
  },

  /**
   * Get client payment history
   * GET /api/clients/:clientId/payments
   */
  async getClientPayments(
    clientId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: Payment[]; total: number }> {
    try {
      const response = await apiClient.get(`/clients/${clientId}/payments`, {
        params,
      })
      const data = response.data.data || response.data

      return {
        data: data.payments || data.data || data || [],
        total: data.total || data.payments?.length || data.data?.length || data.length || 0,
      }
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_NOT_FOUND')
    }
  },

  /**
   * Update client credit status
   * POST /api/clients/:clientId/credit-status
   */
  async updateCreditStatus(
    clientId: string,
    status: string,
    reason?: string
  ): Promise<Client> {
    try {
      const response = await apiClient.post(
        `/clients/${clientId}/credit-status`,
        { status, reason }
      )
      // Backend returns: { success, message, data: client }
      return response.data.data?.client || response.data.data || response.data.client
    } catch (error: any) {
      throwBilingualError(error, 'CLIENT_UPDATE_FAILED')
    }
  },

  /**
   * Convert lead to client
   * POST /api/leads/:leadId/convert
   *
   * Note: This endpoint is in the leads API but returns a client
   */
  async convertFromLead(
    leadId: string,
    additionalData?: Partial<Client>
  ): Promise<Client> {
    try {
      const response = await apiClient.post(`/leads/${leadId}/convert`, {
        additionalData,
      })
      // Backend returns: { success, message, data: { lead, client } }
      const data = response.data.data || response.data
      return data.client || data
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },
}

export default clientService
