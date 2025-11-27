/**
 * Billing Settings Service
 * Handles all billing settings related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== COMPANY SETTINGS ====================

export interface CompanySettings {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  logo?: string
  taxNumber?: string
  commercialRegister?: string
  bankName?: string
  bankAccount?: string
  iban?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateCompanySettingsData {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  taxNumber?: string
  commercialRegister?: string
  bankName?: string
  bankAccount?: string
  iban?: string
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

const billingSettingsService = {
  // ==================== COMPANY SETTINGS ====================

  getCompanySettings: async () => {
    try {
      const response = await apiClient.get('/settings/company')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateCompanySettings: async (data: UpdateCompanySettingsData) => {
    try {
      const response = await apiClient.put('/settings/company', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateCompanyLogo: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const response = await apiClient.post('/settings/company/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
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
