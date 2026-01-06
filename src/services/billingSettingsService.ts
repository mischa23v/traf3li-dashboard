/**
 * Billing Settings Service
 * Handles all billing settings related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== COMPANY SETTINGS ====================
// NOTE: Company settings are stored in the Firm model
// These interfaces map frontend fields to Firm model structure

export interface CompanySettings {
  _id: string
  // Basic Info
  name: string
  nameArabic?: string
  email?: string
  phone?: string
  mobile?: string
  fax?: string
  website?: string
  // Address (nested in Firm model)
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  // Saudi Legal/Tax
  taxNumber?: string
  crNumber?: string
  vatNumber?: string
  // Bank Details (from billingSettings.bankAccounts)
  bankName?: string
  bankNameAr?: string
  bankAccountNumber?: string
  iban?: string
  swiftCode?: string
  // Branding
  logo?: string
  // Timestamps
  createdAt?: string
  updatedAt?: string
}

export interface UpdateCompanySettingsData {
  name?: string
  nameArabic?: string
  email?: string
  phone?: string
  mobile?: string
  fax?: string
  website?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  taxNumber?: string
  crNumber?: string
  vatNumber?: string
  bankName?: string
  bankNameAr?: string
  bankAccountNumber?: string
  iban?: string
  swiftCode?: string
}

// Helper to transform Firm model to CompanySettings format
function firmToCompanySettings(firm: any): CompanySettings | null {
  if (!firm) return null

  const bankAccount = firm.billingSettings?.bankAccounts?.[0]
  const addressObj = typeof firm.address === 'object' ? firm.address : null

  return {
    _id: firm._id,
    name: firm.name,
    nameArabic: firm.nameArabic,
    // Alias for form compatibility
    nameAr: firm.nameArabic,
    email: firm.email,
    phone: firm.phone,
    mobile: firm.mobile,
    fax: firm.fax,
    website: firm.website,
    address: addressObj?.street || (typeof firm.address === 'string' ? firm.address : ''),
    // Alias for form compatibility (Arabic address not in Firm model, use same)
    addressAr: addressObj?.streetAr || '',
    city: addressObj?.city || '',
    state: addressObj?.state || '',
    country: addressObj?.country || 'SA',
    postalCode: addressObj?.postalCode || '',
    taxNumber: firm.taxNumber,
    crNumber: firm.crNumber,
    vatNumber: firm.vatRegistration?.vatNumber,
    bankName: bankAccount?.bankName,
    bankNameAr: bankAccount?.bankNameAr,
    bankAccountNumber: bankAccount?.accountNumber,
    iban: bankAccount?.iban,
    swiftCode: bankAccount?.swiftCode,
    logo: firm.logo,
    createdAt: firm.createdAt,
    updatedAt: firm.updatedAt,
  } as CompanySettings
}

// Helper to transform CompanySettings update to Firm model format
function companySettingsToFirmUpdate(data: any): any {
  const firmUpdate: any = {}

  // Direct fields
  if (data.name !== undefined) firmUpdate.name = data.name
  // Support both nameArabic and nameAr (form uses nameAr)
  if (data.nameArabic !== undefined) firmUpdate.nameArabic = data.nameArabic
  if (data.nameAr !== undefined) firmUpdate.nameArabic = data.nameAr
  if (data.email !== undefined) firmUpdate.email = data.email
  if (data.phone !== undefined) firmUpdate.phone = data.phone
  if (data.mobile !== undefined) firmUpdate.mobile = data.mobile
  if (data.fax !== undefined) firmUpdate.fax = data.fax
  if (data.website !== undefined) firmUpdate.website = data.website
  if (data.taxNumber !== undefined) firmUpdate.taxNumber = data.taxNumber
  if (data.crNumber !== undefined) firmUpdate.crNumber = data.crNumber

  // Address nested object
  if (data.address || data.addressAr || data.city || data.state || data.country || data.postalCode) {
    firmUpdate.address = {
      street: data.address,
      streetAr: data.addressAr,
      city: data.city,
      state: data.state,
      country: data.country || 'SA',
      postalCode: data.postalCode,
    }
  }

  // VAT Registration
  if (data.vatNumber !== undefined) {
    firmUpdate.vatRegistration = { vatNumber: data.vatNumber }
  }

  // Bank Account (first in array)
  if (data.bankName || data.bankNameAr || data.bankAccountNumber || data.iban || data.swiftCode) {
    firmUpdate['billingSettings.bankAccounts'] = [{
      bankName: data.bankName,
      bankNameAr: data.bankNameAr,
      accountNumber: data.bankAccountNumber,
      iban: data.iban,
      swiftCode: data.swiftCode,
      isDefault: true,
    }]
  }

  return firmUpdate
}

// ==================== TAXES ====================

export interface Tax {
  _id: string
  name: string
  rate: number
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaxData {
  name: string
  rate: number
  isDefault?: boolean
}

// ==================== PAYMENT MODES ====================

export interface PaymentMode {
  _id: string
  name: string
  description?: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentModeData {
  name: string
  description?: string
  isDefault?: boolean
}

// ==================== FINANCE SETTINGS ====================

export interface FinanceSettings {
  _id: string
  defaultCurrency: string
  invoicePrefix: string
  invoiceStartNumber: number
  quotePrefix: string
  quoteStartNumber: number
  paymentTerms: number
  defaultTaxId?: string
  defaultPaymentModeId?: string
  enableLateFees: boolean
  lateFeePercentage: number
  enablePartialPayments: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateFinanceSettingsData {
  defaultCurrency?: string
  invoicePrefix?: string
  invoiceStartNumber?: number
  quotePrefix?: string
  quoteStartNumber?: number
  paymentTerms?: number
  defaultTaxId?: string
  defaultPaymentModeId?: string
  enableLateFees?: boolean
  lateFeePercentage?: number
  enablePartialPayments?: boolean
}

// Store firm ID for updates (set when fetching)
let cachedFirmId: string | null = null

const billingSettingsService = {
  // ==================== COMPANY SETTINGS ====================
  // Using Firm endpoints: GET /firms/my, PUT /firms/:id

  getCompanySettings: async (): Promise<CompanySettings | null> => {
    try {
      const response = await apiClient.get('/firms/my')
      const firm = response.data.data || response.data.firm || response.data

      // Cache firm ID for updates
      if (firm?._id) {
        cachedFirmId = firm._id
      }

      return firmToCompanySettings(firm)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateCompanySettings: async (data: UpdateCompanySettingsData): Promise<CompanySettings | null> => {
    try {
      if (!cachedFirmId) {
        // Fetch firm ID if not cached
        const firmResponse = await apiClient.get('/firms/my')
        const firm = firmResponse.data.data || firmResponse.data.firm || firmResponse.data
        cachedFirmId = firm?._id
      }

      if (!cachedFirmId) {
        throw new Error('Unable to determine firm ID')
      }

      const firmUpdate = companySettingsToFirmUpdate(data)
      const response = await apiClient.put(`/firms/${cachedFirmId}`, firmUpdate)
      const updatedFirm = response.data.data || response.data.firm || response.data

      return firmToCompanySettings(updatedFirm)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateCompanyLogo: async (file: File): Promise<{ logo: string }> => {
    try {
      if (!cachedFirmId) {
        // Fetch firm ID if not cached
        const firmResponse = await apiClient.get('/firms/my')
        const firm = firmResponse.data.data || firmResponse.data.firm || firmResponse.data
        cachedFirmId = firm?._id
      }

      if (!cachedFirmId) {
        throw new Error('Unable to determine firm ID')
      }

      const formData = new FormData()
      formData.append('logo', file)

      // Try /firms/:id/logo endpoint first, fallback to PATCH
      try {
        const response = await apiClient.post(`/firms/${cachedFirmId}/logo`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data.data || response.data
      } catch {
        // Fallback: upload via general update endpoint if logo endpoint doesn't exist
        const response = await apiClient.patch(`/firms/${cachedFirmId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return { logo: response.data.data?.logo || response.data.logo }
      }
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== TAXES ====================

  getTaxes: async () => {
    try {
      const response = await apiClient.get('/settings/taxes')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  createTax: async (data: CreateTaxData) => {
    try {
      const response = await apiClient.post('/settings/taxes', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateTax: async (id: string, data: Partial<CreateTaxData>) => {
    try {
      const response = await apiClient.put(`/settings/taxes/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  deleteTax: async (id: string) => {
    try {
      const response = await apiClient.delete(`/settings/taxes/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  setDefaultTax: async (id: string) => {
    try {
      const response = await apiClient.patch(`/settings/taxes/${id}/default`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== PAYMENT MODES ====================

  getPaymentModes: async () => {
    try {
      const response = await apiClient.get('/settings/payment-modes')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  createPaymentMode: async (data: CreatePaymentModeData) => {
    try {
      const response = await apiClient.post('/settings/payment-modes', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updatePaymentMode: async (id: string, data: Partial<CreatePaymentModeData>) => {
    try {
      const response = await apiClient.put(`/settings/payment-modes/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  deletePaymentMode: async (id: string) => {
    try {
      const response = await apiClient.delete(`/settings/payment-modes/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  setDefaultPaymentMode: async (id: string) => {
    try {
      const response = await apiClient.patch(`/settings/payment-modes/${id}/default`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== FINANCE SETTINGS ====================

  getFinanceSettings: async () => {
    try {
      const response = await apiClient.get('/settings/finance')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateFinanceSettings: async (data: UpdateFinanceSettingsData) => {
    try {
      const response = await apiClient.put('/settings/finance', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default billingSettingsService
