/**
 * Income Tax Slabs Service
 * Handles progressive tax calculations for payroll
 * Base route: /api/income-tax-slabs
 *
 * Use Case: Progressive tax calculations for payroll
 *
 * Backend Routes (IMPLEMENTED):
 * ✅ GET    /income-tax-slabs                       - List tax slabs
 * ✅ GET    /income-tax-slabs/:id                   - Get single
 * ✅ POST   /income-tax-slabs                       - Create
 * ✅ PUT    /income-tax-slabs/:id                   - Update
 * ✅ DELETE /income-tax-slabs/:id                   - Delete
 * ✅ POST   /income-tax-slabs/:id/calculate         - Calculate tax for income
 * ✅ POST   /income-tax-slabs/:id/clone             - Clone for new year
 * ✅ GET    /income-tax-slabs/countries             - Supported countries
 * ✅ POST   /income-tax-slabs/initialize-defaults   - Initialize defaults
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface TaxBracket {
  fromAmount: number
  toAmount: number | null // null means unlimited
  rate: number // as percentage (e.g., 15 for 15%)
  fixedAmount?: number // fixed amount to add
}

export interface IncomeTaxSlab {
  _id: string
  slabId: string
  name: string
  nameAr?: string
  country: string
  fiscalYear: number
  effectiveFrom: string
  effectiveTo?: string
  isActive: boolean
  brackets: TaxBracket[]
  standardDeduction?: number
  exemptions?: {
    spouseExemption?: number
    dependentExemption?: number
    disabilityExemption?: number
  }
  notes?: string
  notesAr?: string
  createdAt: string
  updatedAt: string
}

export interface TaxCalculationOptions {
  applyStandardDeduction?: boolean
  spouseExemption?: boolean
  dependentCount?: number
  disabilityExemption?: boolean
}

export interface TaxCalculationResult {
  grossIncome: number
  deductions: {
    standardDeduction: number
    spouseExemption: number
    dependentExemption: number
    disabilityExemption: number
    totalDeductions: number
  }
  taxableIncome: number
  totalTax: number
  effectiveRate: number
  marginalRate: number
  brackets: {
    fromAmount: number
    toAmount: number | null
    rate: number
    taxableAtBracket: number
    taxAtBracket: number
  }[]
}

export interface TaxSlabFilters {
  country?: string
  fiscalYear?: number
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateTaxSlabData {
  name: string
  nameAr?: string
  country: string
  fiscalYear: number
  effectiveFrom: string
  effectiveTo?: string
  isActive?: boolean
  brackets: TaxBracket[]
  standardDeduction?: number
  exemptions?: {
    spouseExemption?: number
    dependentExemption?: number
    disabilityExemption?: number
  }
  notes?: string
  notesAr?: string
}

export interface SupportedCountry {
  code: string
  name: string
  nameAr?: string
  currency: string
  hasDefaultSlabs: boolean
}

// ==================== SERVICE ====================

const incomeTaxSlabsService = {
  /**
   * Get all tax slabs
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/income-tax-slabs
   */
  getTaxSlabs: async (filters?: TaxSlabFilters): Promise<{
    taxSlabs: IncomeTaxSlab[]
    total: number
    page: number
    limit: number
  }> => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
          }
        })
      }
      const response = await apiClient.get(`/income-tax-slabs?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch tax slabs | فشل جلب شرائح الضريبة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get single tax slab
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/income-tax-slabs/:id
   */
  getTaxSlab: async (id: string): Promise<IncomeTaxSlab> => {
    try {
      const response = await apiClient.get(`/income-tax-slabs/${id}`)
      return response.data.taxSlab || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch tax slab | فشل جلب شريحة الضريبة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Create a new tax slab
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/income-tax-slabs
   */
  createTaxSlab: async (data: CreateTaxSlabData): Promise<IncomeTaxSlab> => {
    try {
      const response = await apiClient.post('/income-tax-slabs', data)
      return response.data.taxSlab || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to create tax slab | فشل إنشاء شريحة الضريبة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Update a tax slab
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * PUT /api/income-tax-slabs/:id
   */
  updateTaxSlab: async (id: string, data: Partial<CreateTaxSlabData>): Promise<IncomeTaxSlab> => {
    try {
      const response = await apiClient.put(`/income-tax-slabs/${id}`, data)
      return response.data.taxSlab || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to update tax slab | فشل تحديث شريحة الضريبة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Delete a tax slab
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/income-tax-slabs/:id
   */
  deleteTaxSlab: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/income-tax-slabs/${id}`)
    } catch (error: any) {
      throw new Error(
        `Failed to delete tax slab | فشل حذف شريحة الضريبة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Calculate tax for a given income
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/income-tax-slabs/:id/calculate
   */
  calculateTax: async (
    slabId: string,
    grossIncome: number,
    options?: TaxCalculationOptions
  ): Promise<TaxCalculationResult> => {
    try {
      const response = await apiClient.post(`/income-tax-slabs/${slabId}/calculate`, {
        grossIncome,
        options,
      })
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to calculate tax | فشل حساب الضريبة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Clone a tax slab for a new year
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/income-tax-slabs/:id/clone
   */
  cloneTaxSlab: async (
    id: string,
    newFiscalYear: number,
    adjustments?: {
      rateAdjustment?: number // e.g., 0.01 to increase all rates by 1%
      bracketAdjustment?: number // e.g., 1.05 to increase brackets by 5%
    }
  ): Promise<IncomeTaxSlab> => {
    try {
      const response = await apiClient.post(`/income-tax-slabs/${id}/clone`, {
        fiscalYear: newFiscalYear,
        adjustments,
      })
      return response.data.taxSlab || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to clone tax slab | فشل نسخ شريحة الضريبة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get supported countries
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/income-tax-slabs/countries
   */
  getSupportedCountries: async (): Promise<SupportedCountry[]> => {
    try {
      const response = await apiClient.get('/income-tax-slabs/countries')
      return response.data.countries || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch countries | فشل جلب الدول: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Initialize default tax slabs for a country
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/income-tax-slabs/initialize-defaults
   */
  initializeDefaults: async (
    country: string,
    fiscalYear: number
  ): Promise<IncomeTaxSlab[]> => {
    try {
      const response = await apiClient.post('/income-tax-slabs/initialize-defaults', {
        country,
        fiscalYear,
      })
      return response.data.taxSlabs || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to initialize defaults | فشل تهيئة الإعدادات الافتراضية: ${handleApiError(error)}`
      )
    }
  },
}

export default incomeTaxSlabsService
