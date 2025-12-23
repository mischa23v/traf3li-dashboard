import api from './api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'

export interface Contact {
  _id: string
  lawyerId?: string
  // Name fields
  salutation?: string
  firstName?: string
  middleName?: string
  lastName?: string
  preferredName?: string
  suffix?: string
  fullNameArabic?: string
  arabicName?: {
    firstName?: string
    fatherName?: string
    grandfatherName?: string
    familyName?: string
    fullName?: string
  }
  // Contact info
  email?: string
  phone?: string
  alternatePhone?: string
  // Classification
  type?: 'individual' | 'organization' | 'court' | 'attorney' | 'expert' | 'government' | 'other'
  category?: string
  primaryRole?: string
  // Employment
  title?: string
  company?: string
  organizationId?: string
  department?: string
  // Address
  address?: string
  city?: string
  district?: string
  postalCode?: string
  country?: string
  // Identification
  nationalId?: string
  iqamaNumber?: string
  passportNumber?: string
  passportCountry?: string
  dateOfBirth?: string
  nationality?: string
  // Communication preferences
  preferredLanguage?: string
  preferredContactMethod?: string
  // Status & flags
  status?: 'active' | 'inactive' | 'archived' | 'deceased'
  priority?: string
  vipStatus?: boolean
  riskLevel?: string
  isBlacklisted?: boolean
  blacklistReason?: string
  // Conflict check
  conflictCheckStatus?: string
  conflictNotes?: string
  conflictCheckDate?: string
  // Other
  notes?: string
  tags?: string[]
  practiceAreas?: string[]
  linkedCases?: string[]
  linkedClients?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ContactFilters {
  type?: string
  category?: string
  primaryRole?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateContactData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  alternatePhone?: string
  title?: string
  company?: string
  type?: string
  category?: string
  primaryRole?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
  tags?: string[]
  status?: string
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactsResponse {
  data: Contact[]
  total: number
  page: number
  limit: number
}

const contactsService = {
  // Get all contacts with optional filters
  getContacts: async (filters?: ContactFilters): Promise<ContactsResponse> => {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await api.get(`/contacts?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  // Get single contact by ID
  getContact: async (id: string): Promise<Contact> => {
    try {
      const response = await api.get(`/contacts/${id}`)
      // Handle both API response formats:
      // 1. Direct contact object: { _id: "...", firstName: "..." }
      // 2. Wrapped: { data: { _id: "...", firstName: "..." } }
      // 3. Nested: { success: true, data: { _id: "...", firstName: "..." } }
      const data = response.data
      if (data?.data) {
        return data.data as Contact
      }
      return data as Contact
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_NOT_FOUND')
    }
  },

  // Create new contact
  createContact: async (data: CreateContactData): Promise<Contact> => {
    try {
      const response = await api.post('/contacts', data)
      // Handle wrapped response: { data: {...} } or { contact: {...} }
      return response.data?.data || response.data?.contact || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_CREATE_FAILED')
    }
  },

  // Update contact
  updateContact: async (id: string, data: UpdateContactData): Promise<Contact> => {
    try {
      const response = await api.patch(`/contacts/${id}`, data)
      // Handle wrapped response: { data: {...} } or { contact: {...} }
      return response.data?.data || response.data?.contact || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  // Delete contact
  deleteContact: async (id: string): Promise<void> => {
    try {
      await api.delete(`/contacts/${id}`)
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_NOT_FOUND')
    }
  },

  // Bulk delete contacts
  bulkDeleteContacts: async (ids: string[]): Promise<void> => {
    try {
      await api.delete('/contacts/bulk', { data: { ids } })
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  // Search contacts
  searchContacts: async (query: string): Promise<Contact[]> => {
    try {
      const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  // Get contacts by case
  getContactsByCase: async (caseId: string): Promise<Contact[]> => {
    try {
      const response = await api.get(`/contacts/case/${caseId}`)
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  // Get contacts by client
  getContactsByClient: async (clientId: string): Promise<Contact[]> => {
    try {
      const response = await api.get(`/contacts/client/${clientId}`)
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  // Link contact to case
  linkToCase: async (contactId: string, caseId: string): Promise<Contact> => {
    try {
      const response = await api.post(`/contacts/${contactId}/link-case`, { caseId })
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  // Unlink contact from case
  unlinkFromCase: async (contactId: string, caseId: string): Promise<Contact> => {
    try {
      const response = await api.delete(`/contacts/${contactId}/unlink-case/${caseId}`)
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  // Link contact to client
  linkToClient: async (contactId: string, clientId: string): Promise<Contact> => {
    try {
      const response = await api.post(`/contacts/${contactId}/link-client`, { clientId })
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  // Unlink contact from client
  unlinkFromClient: async (contactId: string, clientId: string): Promise<Contact> => {
    try {
      const response = await api.delete(`/contacts/${contactId}/unlink-client/${clientId}`)
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },
}

export default contactsService
