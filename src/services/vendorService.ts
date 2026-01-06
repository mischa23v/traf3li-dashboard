/**
 * Vendor Service
 * Handles all vendor-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Country Code
 */
export type CountryCode = 'SA' | 'AE' | 'US' | 'GB' | string

/**
 * Currency Type
 */
export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED' | string

/**
 * Vendor Interface
 * Matches contract: contract2/types/operations.ts
 */
export interface Vendor {
  _id: string
  name: string
  nameAr?: string
  email?: string
  phone?: string
  taxNumber?: string
  address?: string
  city?: string
  country?: CountryCode
  postalCode?: string
  bankName?: string
  bankAccountNumber?: string
  bankIban?: string
  currency?: Currency
  paymentTerms?: number // Days, 0-365
  defaultCategory?: string
  website?: string
  contactPerson?: string
  notes?: string
  creditLimit?: number
  openingBalance?: number
  openingBalanceDate?: string
  defaultExpenseAccountId?: string
  payableAccountId?: string
  lawyerId?: string
  firmId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Create Vendor Data
 * Matches contract: contract2/types/operations.ts - CreateVendorRequest
 */
export interface CreateVendorData {
  name: string
  nameAr?: string
  email?: string
  phone?: string
  taxNumber?: string
  address?: string
  city?: string
  country?: CountryCode
  postalCode?: string
  bankName?: string
  bankAccountNumber?: string
  bankIban?: string
  currency?: Currency
  paymentTerms?: number
  defaultCategory?: string
  website?: string
  contactPerson?: string
  notes?: string
  creditLimit?: number
  openingBalance?: number
  openingBalanceDate?: string
  defaultExpenseAccountId?: string
  payableAccountId?: string
}

/**
 * Vendor Filters
 * Matches contract: contract2/types/operations.ts - GetVendorsQuery
 */
export interface VendorFilters {
  isActive?: 'true' | 'false'
  country?: CountryCode
  search?: string
  page?: number
  limit?: number
}

/**
 * Vendor Summary
 * Matches contract: contract2/types/operations.ts - VendorSummary
 */
export interface VendorSummary {
  vendor: Vendor
  totalBills: number
  totalAmount: number
  totalPaid: number
  totalDue: number
  overdueBills: number
  overdueAmount: number
  recentBills: Array<{
    _id: string
    billNumber: string
    billDate: string
    dueDate: string
    totalAmount: number
    status: string
  }>
}

/**
 * Vendor Service Object
 */
const vendorService = {
  /**
   * Get all vendors
   * GET /api/vendors
   * Matches contract: contract2/types/operations.ts - GetVendorsResponse
   */
  getVendors: async (filters?: VendorFilters): Promise<{ vendors: Vendor[]; total: number }> => {
    try {
      const response = await apiClient.get('/vendors', { params: filters })
      return {
        vendors: response.data.vendors || response.data.data || [],
        total: response.data.total || response.data.vendors?.length || 0,
      }
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
   * Matches contract: contract2/types/operations.ts - GetVendorSummaryResponse
   */
  getVendorSummary: async (id: string): Promise<VendorSummary> => {
    try {
      const response = await apiClient.get(`/vendors/${id}/summary`)
      return response.data.summary || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default vendorService
