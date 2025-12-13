/**
 * Clients Service
 * Handles all client-related API calls
 * Includes Najiz (Ministry of Justice) integration fields
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  ArabicName,
  NationalAddress,
  NajizIdentityType,
  GCCCountry,
  Gender,
  MaritalStatus,
  Sponsor,
  POBox,
} from '@/types/najiz'

/**
 * Client Interface - matches backend API response with Najiz integration
 */
export interface Client {
  _id: string
  clientNumber?: string
  clientType?: 'individual' | 'company'
  lawyerId?: string

  // ─── Name Fields (Individual) ───
  fullNameArabic?: string
  fullNameEnglish?: string
  firstName?: string
  middleName?: string
  lastName?: string
  preferredName?: string
  salutation?: string
  suffix?: string

  // ─── Arabic Name (الاسم الرباعي) - Najiz ───
  arabicName?: ArabicName
  salutationAr?: string

  // ─── Company Fields ───
  companyName?: string
  companyNameEnglish?: string
  companyNameAr?: string
  crNumber?: string
  unifiedNumber?: string
  vatNumber?: string
  municipalityLicense?: string
  chamberNumber?: string
  legalForm?: string
  legalFormAr?: string
  capital?: number
  capitalCurrency?: string
  establishmentDate?: string
  crExpiryDate?: string

  // ─── Authorized Person (Company) ───
  authorizedPerson?: string
  authorizedPersonAr?: string
  authorizedPersonTitle?: string
  authorizedPersonIdentityType?: NajizIdentityType
  authorizedPersonIdentityNumber?: string

  // ─── Contact Info ───
  email?: string
  phone?: string
  alternatePhone?: string
  whatsapp?: string
  fax?: string
  website?: string

  // ─── Identity Information (Najiz) ───
  identityType?: NajizIdentityType
  nationalId?: string
  iqamaNumber?: string
  gccId?: string
  gccCountry?: GCCCountry
  borderNumber?: string
  visitorId?: string
  passportNumber?: string
  passportCountry?: string
  passportIssueDate?: string
  passportExpiryDate?: string
  passportIssuePlace?: string
  identityIssueDate?: string
  identityExpiryDate?: string
  identityIssuePlace?: string

  // ─── Personal Details (Najiz) ───
  dateOfBirth?: string
  dateOfBirthHijri?: string
  placeOfBirth?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  nationality?: string
  nationalityCode?: string

  // ─── Sponsor (for Iqama holders) ───
  sponsor?: Sponsor

  // ─── National Address (العنوان الوطني) - Najiz ───
  nationalAddress?: NationalAddress
  workAddress?: NationalAddress
  poBox?: POBox
  headquartersAddress?: NationalAddress
  branchAddresses?: NationalAddress[]

  // ─── Legacy Address Fields ───
  address?: string | {
    city?: string
    district?: string
    street?: string
    postalCode?: string
  }
  city?: string
  district?: string
  province?: string
  region?: string
  postalCode?: string
  country?: string

  // ─── Preferences ───
  notes?: string
  generalNotes?: string
  preferredContact?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredLanguage?: string
  language?: string
  bestTimeToContact?: string
  doNotContact?: boolean
  doNotEmail?: boolean
  doNotCall?: boolean
  doNotSMS?: boolean

  // ─── Status & Classification ───
  status?: 'active' | 'inactive' | 'archived' | 'pending'
  priority?: 'low' | 'normal' | 'high' | 'vip'
  vipStatus?: boolean
  tags?: string[]
  practiceAreas?: string[]

  // ─── Risk & Conflict ───
  riskLevel?: 'low' | 'medium' | 'high'
  isBlacklisted?: boolean
  blacklistReason?: string
  conflictCheckStatus?: 'not_checked' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflictNotes?: string
  conflictCheckDate?: string
  conflictCheckedBy?: string

  // ─── Billing & Balance ───
  billing?: {
    creditBalance: number
    currency?: string
  }
  totalPaid?: number
  totalOutstanding?: number
  defaultBillingRate?: number
  billingCurrency?: string
  paymentTerms?: string

  // ─── Conversion Tracking ───
  convertedFromLead?: boolean
  convertedAt?: string
  leadId?: string

  // ─── Verification Status (Wathq/MOJ) ───
  isVerified?: boolean
  verificationSource?: string
  verifiedAt?: string
  verificationData?: any

  // ─── Timestamps ───
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Create Client Data - matches backend API with Najiz integration
 */
export interface CreateClientData {
  clientType?: 'individual' | 'company'

  // Individual fields
  fullNameArabic?: string
  fullNameEnglish?: string
  firstName?: string
  middleName?: string
  lastName?: string
  preferredName?: string
  salutation?: string
  salutationAr?: string
  arabicName?: ArabicName

  // Company fields
  companyName?: string
  companyNameEnglish?: string
  companyNameAr?: string
  crNumber?: string
  unifiedNumber?: string
  vatNumber?: string
  municipalityLicense?: string
  chamberNumber?: string
  legalForm?: string
  legalFormAr?: string
  capital?: number
  capitalCurrency?: string
  establishmentDate?: string
  crExpiryDate?: string
  authorizedPerson?: string
  authorizedPersonAr?: string
  authorizedPersonTitle?: string
  authorizedPersonIdentityType?: NajizIdentityType
  authorizedPersonIdentityNumber?: string

  // Contact
  email?: string
  phone?: string
  alternatePhone?: string
  whatsapp?: string
  fax?: string
  website?: string

  // Identity (Najiz)
  identityType?: NajizIdentityType
  nationalId?: string
  iqamaNumber?: string
  gccId?: string
  gccCountry?: GCCCountry
  borderNumber?: string
  visitorId?: string
  passportNumber?: string
  passportCountry?: string
  passportIssueDate?: string
  passportExpiryDate?: string
  passportIssuePlace?: string
  identityIssueDate?: string
  identityExpiryDate?: string
  identityIssuePlace?: string

  // Personal details
  dateOfBirth?: string
  dateOfBirthHijri?: string
  placeOfBirth?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  nationality?: string
  nationalityCode?: string

  // Sponsor
  sponsor?: Sponsor

  // Addresses (Najiz)
  nationalAddress?: NationalAddress
  workAddress?: NationalAddress
  headquartersAddress?: NationalAddress
  branchAddresses?: NationalAddress[]
  poBox?: POBox

  // Legacy address
  address?: string | {
    city?: string
    district?: string
    street?: string
    postalCode?: string
  }
  city?: string
  district?: string
  province?: string
  region?: string
  postalCode?: string
  country?: string

  // Preferences
  notes?: string
  generalNotes?: string
  preferredContact?: 'email' | 'phone' | 'sms' | 'whatsapp'
  preferredLanguage?: string
  language?: string
  bestTimeToContact?: string
  doNotContact?: boolean
  doNotEmail?: boolean
  doNotCall?: boolean
  doNotSMS?: boolean

  // Status
  status?: 'active' | 'inactive' | 'archived' | 'pending'
  priority?: 'low' | 'normal' | 'high' | 'vip'
  tags?: string[]
  practiceAreas?: string[]
}

/**
 * Client Filters
 */
export interface ClientFilters {
  status?: string
  clientType?: 'individual' | 'company'
  search?: string
  city?: string
  region?: string
  regionCode?: string
  identityType?: NajizIdentityType
  nationality?: string
  country?: string
  priority?: string
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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
      const data = response.data.data || response.data

      // Handle both API response formats:
      // 1. { client: {...}, relatedData: {...}, summary: {...} }
      // 2. Direct client object: { _id: "...", clientNumber: "...", ... }
      if (data.client) {
        return data as ClientDetail
      }

      // Transform direct client response to expected format
      return {
        client: data as Client,
        relatedData: {
          cases: data.cases || [],
          invoices: data.invoices || [],
          payments: data.payments || [],
        },
        summary: {
          totalCases: data.cases?.length || 0,
          totalInvoices: data.invoices?.length || 0,
          totalInvoiced: data.totalInvoiced || 0,
          totalPaid: data.totalPaid || 0,
          outstandingBalance: data.outstandingBalance || data.totalOutstanding || 0,
        },
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create client
   */
  createClient: async (data: CreateClientData): Promise<Client> => {
    console.log('========== CLIENTS SERVICE DEBUG ==========')
    console.log('[ClientsService.createClient] Starting API call')
    console.log('[ClientsService.createClient] Request data:', JSON.stringify(data, null, 2))
    console.log('[ClientsService.createClient] Timestamp:', new Date().toISOString())

    try {
      console.log('[ClientsService.createClient] 📡 Calling POST /clients...')
      const response = await apiClient.post('/clients', data)
      console.log('[ClientsService.createClient] ✅ API Response received!')
      console.log('[ClientsService.createClient] Response status:', response.status)
      console.log('[ClientsService.createClient] Response headers:', response.headers)
      console.log('[ClientsService.createClient] Response data:', JSON.stringify(response.data, null, 2))
      return response.data.client || response.data.data
    } catch (error: any) {
      console.log('[ClientsService.createClient] ❌ API Error caught!')
      console.log('[ClientsService.createClient] Error type:', typeof error)
      console.log('[ClientsService.createClient] Error constructor:', error?.constructor?.name)
      console.log('[ClientsService.createClient] Error message:', error?.message)
      console.log('[ClientsService.createClient] Error status:', error?.status)
      console.log('[ClientsService.createClient] Error response:', error?.response)
      console.log('[ClientsService.createClient] Error response data:', error?.response?.data)
      console.log('[ClientsService.createClient] Error requestId:', error?.requestId)
      console.log('[ClientsService.createClient] Error errors array:', error?.errors)
      console.log('[ClientsService.createClient] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2))

      const errorMessage = handleApiError(error)
      console.log('[ClientsService.createClient] Handled error message:', errorMessage)
      throw new Error(errorMessage)
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
   * Verify identity with Absher/NIC (National ID verification)
   * POST /api/clients/:id/verify/absher
   */
  verifyWithAbsher: async (id: string, data?: { nationalId?: string }): Promise<{ verified: boolean; data?: any }> => {
    try {
      const response = await apiClient.post(`/clients/${id}/verify/absher`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify national address with Saudi Post
   * POST /api/clients/:id/verify/address
   */
  verifyNationalAddress: async (id: string, address?: NationalAddress): Promise<{ verified: boolean; data?: any }> => {
    try {
      const response = await apiClient.post(`/clients/${id}/verify/address`, address)
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

  /**
   * Get Saudi regions with cities
   * GET /api/clients/regions
   */
  getSaudiRegions: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/clients/regions')
      return response.data.data || response.data.regions || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default clientsService
