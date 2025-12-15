/**
 * Payment Terms Service
 * Handles all payment terms related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

export interface PaymentTerms {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  dueDays: number
  discountDays?: number
  discountPercent?: number
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentTermsData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  dueDays: number
  discountDays?: number
  discountPercent?: number
  isDefault?: boolean
  isActive?: boolean
}

export interface UpdatePaymentTermsData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  dueDays?: number
  discountDays?: number
  discountPercent?: number
  isActive?: boolean
}

const paymentTermsService = {
  // Get all payment terms
  getPaymentTerms: async () => {
    try {
      const response = await apiClient.get('/settings/payment-terms')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get single payment term
  getPaymentTerm: async (id: string) => {
    try {
      const response = await apiClient.get(`/settings/payment-terms/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create new payment term
  createPaymentTerms: async (data: CreatePaymentTermsData) => {
    try {
      const response = await apiClient.post('/settings/payment-terms', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update payment term
  updatePaymentTerms: async (id: string, data: UpdatePaymentTermsData) => {
    try {
      const response = await apiClient.put(`/settings/payment-terms/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete payment term
  deletePaymentTerms: async (id: string) => {
    try {
      const response = await apiClient.delete(`/settings/payment-terms/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Set default payment term
  setDefaultPaymentTerms: async (id: string) => {
    try {
      const response = await apiClient.patch(`/settings/payment-terms/${id}/default`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Initialize pre-built templates
  initializeTemplates: async () => {
    try {
      const response = await apiClient.post('/settings/payment-terms/initialize')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default paymentTermsService
