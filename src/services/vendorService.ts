/**
 * Vendor Service
 * Handles all vendor-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Vendor Interface
 */
export interface Vendor {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  taxNumber?: string
  accountNumber?: string
  bankName?: string
  contactPerson?: string
  notes?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

/**
 * Create Vendor Data
 */
export interface CreateVendorData {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  taxNumber?: string
  accountNumber?: string
  bankName?: string
  contactPerson?: string
  notes?: string
  status?: 'active' | 'inactive'
}

/**
 * Vendor Filters
 */
export interface VendorFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Vendor Summary
 */
export interface VendorSummary {
  vendor: Vendor
  totalPurchases: number
  totalPaid: number
  outstandingBalance: number
  recentTransactions: any[]
}

/**
 * Vendor Service Object
 */
const vendorService = {
  /**
   * Get all vendors
   * GET /api/vendors
   */
  getVendors: async (filters?: VendorFilters): Promise<{ data: Vendor[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/vendors', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single vendor
   * GET /api/vendors/:id
   */
  getVendor: async (id: string): Promise<Vendor> => {
    try {
      const response = await apiClient.get(`/vendors/${id}`)
      return response.data.data || response.data.vendor
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create vendor
   * POST /api/vendors
   */
  createVendor: async (data: CreateVendorData): Promise<Vendor> => {
    try {
      const response = await apiClient.post('/vendors', data)
      return response.data.vendor || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update vendor
   * PUT /api/vendors/:id
   */
  updateVendor: async (id: string, data: Partial<CreateVendorData>): Promise<Vendor> => {
    try {
      const response = await apiClient.put(`/vendors/${id}`, data)
      return response.data.vendor || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete vendor
   * DELETE /api/vendors/:id
   */
  deleteVendor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/vendors/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get vendor summary
   * GET /api/vendors/:id/summary
   */
  getVendorSummary: async (id: string): Promise<VendorSummary> => {
    try {
      const response = await apiClient.get(`/vendors/${id}/summary`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default vendorService
