/**
 * Email Settings Service
 * Handles all email and SMTP settings related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== SMTP CONFIGURATION ====================

export interface SmtpConfig {
  _id: string
  host: string
  port: number
  secure: 'TLS' | 'SSL' | 'NONE'
  username: string
  password?: string
  senderName: string
  senderEmail: string
  replyToEmail?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateSmtpConfigData {
  host?: string
  port?: number
  secure?: 'TLS' | 'SSL' | 'NONE'
  username?: string
  password?: string
  senderName?: string
  senderEmail?: string
  replyToEmail?: string
  isActive?: boolean
}

export interface TestSmtpConnectionData {
  host: string
  port: number
  secure: 'TLS' | 'SSL' | 'NONE'
  username: string
  password: string
}

export interface TestEmailData {
  recipientEmail: string
  subject: string
  body: string
}

// ==================== EMAIL SIGNATURE ====================

export interface EmailSignature {
  _id: string
  nameEn: string
  nameAr: string
  contentEn: string
  contentAr: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmailSignatureData {
  nameEn: string
  nameAr: string
  contentEn: string
  contentAr: string
  isDefault?: boolean
}

// ==================== EMAIL TEMPLATES ====================

export interface EmailTemplate {
  _id: string
  name: string
  nameAr: string
  category: 'invoice' | 'notification' | 'welcome' | 'reminder' | 'custom'
  subjectEn: string
  subjectAr: string
  bodyEn: string
  bodyAr: string
  variables: string[]
  isActive: boolean
  lastModified: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmailTemplateData {
  name: string
  nameAr: string
  category: 'invoice' | 'notification' | 'welcome' | 'reminder' | 'custom'
  subjectEn: string
  subjectAr: string
  bodyEn: string
  bodyAr: string
  variables?: string[]
}

export interface UpdateEmailTemplateData {
  name?: string
  nameAr?: string
  category?: 'invoice' | 'notification' | 'welcome' | 'reminder' | 'custom'
  subjectEn?: string
  subjectAr?: string
  bodyEn?: string
  bodyAr?: string
  variables?: string[]
  isActive?: boolean
}

const emailSettingsService = {
  // ==================== SMTP CONFIGURATION ====================

  getSmtpConfig: async () => {
    try {
      const response = await apiClient.get('/settings/email/smtp')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateSmtpConfig: async (data: UpdateSmtpConfigData) => {
    try {
      const response = await apiClient.put('/settings/email/smtp', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  testSmtpConnection: async (data: TestSmtpConnectionData) => {
    try {
      const response = await apiClient.post('/settings/email/smtp/test-connection', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  sendTestEmail: async (data: TestEmailData) => {
    try {
      const response = await apiClient.post('/settings/email/smtp/send-test', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== EMAIL SIGNATURE ====================

  getEmailSignatures: async () => {
    try {
      const response = await apiClient.get('/settings/email/signatures')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  createEmailSignature: async (data: CreateEmailSignatureData) => {
    try {
      const response = await apiClient.post('/settings/email/signatures', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateEmailSignature: async (id: string, data: Partial<CreateEmailSignatureData>) => {
    try {
      const response = await apiClient.put(`/settings/email/signatures/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  deleteEmailSignature: async (id: string) => {
    try {
      const response = await apiClient.delete(`/settings/email/signatures/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  setDefaultEmailSignature: async (id: string) => {
    try {
      const response = await apiClient.patch(`/settings/email/signatures/${id}/default`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== EMAIL TEMPLATES ====================

  getEmailTemplates: async () => {
    try {
      const response = await apiClient.get('/settings/email/templates')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  getEmailTemplate: async (id: string) => {
    try {
      const response = await apiClient.get(`/settings/email/templates/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  createEmailTemplate: async (data: CreateEmailTemplateData) => {
    try {
      const response = await apiClient.post('/settings/email/templates', data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateEmailTemplate: async (id: string, data: UpdateEmailTemplateData) => {
    try {
      const response = await apiClient.put(`/settings/email/templates/${id}`, data)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  deleteEmailTemplate: async (id: string) => {
    try {
      const response = await apiClient.delete(`/settings/email/templates/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  toggleEmailTemplateStatus: async (id: string) => {
    try {
      const response = await apiClient.patch(`/settings/email/templates/${id}/toggle`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default emailSettingsService
