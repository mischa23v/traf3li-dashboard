/**
 * Contact Service
 * Handles all contact-related API calls
 * Follows the same pattern as crmService.ts
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'
import type { CrmActivity } from '@/types/crm'
import type { ContactConflictCheck, Stakeholder } from '@/types/crm-extended'

// ═══════════════════════════════════════════════════════════════
// CONTACT TYPES
// ═══════════════════════════════════════════════════════════════

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
  salutation?: string
  middleName?: string
  preferredName?: string
  suffix?: string
  fullNameArabic?: string
  arabicName?: Contact['arabicName']
  organizationId?: string
  department?: string
  district?: string
  nationalId?: string
  iqamaNumber?: string
  passportNumber?: string
  passportCountry?: string
  dateOfBirth?: string
  nationality?: string
  preferredLanguage?: string
  preferredContactMethod?: string
  priority?: string
  vipStatus?: boolean
  riskLevel?: string
  practiceAreas?: string[]
}

// Case type (simplified - full type is in casesService.ts)
export interface Case {
  _id: string
  title: string
  category: string
  status: string
  clientId?: string
  clientName?: string
  createdAt: string
  updatedAt: string
  [key: string]: any // Allow additional properties
}

// ═══════════════════════════════════════════════════════════════
// CONTACT SERVICE
// ═══════════════════════════════════════════════════════════════

export const contactService = {
  /**
   * Get all contacts with optional filters
   */
  getContacts: async (params?: {
    search?: string
    type?: string
    role?: string
    status?: string
    conflictStatus?: string
    isVIP?: boolean
    tags?: string[]
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ data: Contact[]; total: number; page: number; limit: number }> => {
    try {
      const response = await apiClient.get('/contacts', { params })
      // Backend returns: { data: Contact[], total, page, limit }
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single contact
   */
  getContact: async (contactId: string): Promise<Contact> => {
    try {
      const response = await apiClient.get(`/contacts/${contactId}`)
      // Handle both API response formats:
      // 1. Direct contact object: { _id: "...", firstName: "..." }
      // 2. Wrapped: { data: { _id: "...", firstName: "..." } }
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_NOT_FOUND')
    }
  },

  /**
   * Create contact
   */
  createContact: async (data: CreateContactData): Promise<Contact> => {
    try {
      const response = await apiClient.post('/contacts', data)
      // Backend returns: { success, message, data: contact }
      return response.data.data || response.data.contact || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_CREATE_FAILED')
    }
  },

  /**
   * Update contact
   */
  updateContact: async (
    contactId: string,
    data: Partial<Contact>
  ): Promise<Contact> => {
    try {
      const response = await apiClient.put(`/contacts/${contactId}`, data)
      // Backend returns: { success, message, data: contact }
      return response.data.data || response.data.contact || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  /**
   * Delete contact
   */
  deleteContact: async (contactId: string): Promise<void> => {
    try {
      await apiClient.delete(`/contacts/${contactId}`)
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_DELETE_FAILED')
    }
  },

  /**
   * Get contact cases
   */
  getContactCases: async (
    contactId: string
  ): Promise<{ data: Case[]; total: number }> => {
    try {
      const response = await apiClient.get(`/contacts/${contactId}/cases`)
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_NOT_FOUND')
    }
  },

  /**
   * Get contact activities
   */
  getContactActivities: async (
    contactId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: CrmActivity[]; total: number }> => {
    try {
      const response = await apiClient.get(
        `/contacts/${contactId}/activities`,
        { params }
      )
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_NOT_FOUND')
    }
  },

  /**
   * Run conflict check
   */
  runConflictCheck: async (
    contactId: string
  ): Promise<ContactConflictCheck> => {
    try {
      const response = await apiClient.post(
        `/contacts/${contactId}/conflict-check`
      )
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  /**
   * Update conflict status
   */
  updateConflictStatus: async (
    contactId: string,
    data: { status: string; notes?: string }
  ): Promise<Contact> => {
    try {
      const response = await apiClient.post(
        `/contacts/${contactId}/conflict-status`,
        data
      )
      // Backend returns: { success, message, data: contact }
      return response.data.data || response.data.contact || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  /**
   * Link contact to case
   */
  linkToCase: async (
    contactId: string,
    caseId: string,
    role: string
  ): Promise<void> => {
    try {
      await apiClient.post(`/contacts/${contactId}/link-case`, {
        caseId,
        role,
      })
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  /**
   * Unlink contact from case
   */
  unlinkFromCase: async (contactId: string, caseId: string): Promise<void> => {
    try {
      await apiClient.delete(`/contacts/${contactId}/unlink-case/${caseId}`)
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  /**
   * Merge contacts
   */
  mergeContacts: async (
    primaryId: string,
    secondaryIds: string[]
  ): Promise<Contact> => {
    try {
      const response = await apiClient.post(`/contacts/${primaryId}/merge`, {
        secondaryIds,
      })
      // Backend returns: { success, message, data: contact }
      return response.data.data || response.data.contact || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_UPDATE_FAILED')
    }
  },

  /**
   * Get contact stakeholder info (for leads)
   */
  getAsStakeholder: async (
    contactId: string,
    leadId: string
  ): Promise<Stakeholder> => {
    try {
      const response = await apiClient.get(
        `/contacts/${contactId}/stakeholder/${leadId}`
      )
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error, 'CONTACT_NOT_FOUND')
    }
  },
}

export default contactService
