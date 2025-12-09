/**
 * WhatsApp Service
 * Handles all WhatsApp-related API calls for messaging and business integration
 * Base route: /api/whatsapp
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * WhatsApp Conversation Interface
 */
export interface WhatsAppConversation {
  _id: string
  firmId: string
  phoneNumber: string
  contactName?: string
  lastMessage?: WhatsAppMessage
  unreadCount: number
  assignedTo?: string
  linkedLeadId?: string
  createdAt: string
  updatedAt: string
}

/**
 * WhatsApp Message Interface
 */
export interface WhatsAppMessage {
  _id: string
  conversationId: string
  from: string
  to: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'template'
  content?: string
  mediaUrl?: string
  location?: {
    latitude: number
    longitude: number
    name?: string
    address?: string
  }
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  createdAt: string
}

/**
 * WhatsApp Template Interface
 */
export interface WhatsAppTemplate {
  _id: string
  firmId: string
  name: string
  category: string
  language: string
  status: 'pending' | 'approved' | 'rejected'
  components: any[]
  createdAt: string
  updatedAt: string
}

/**
 * WhatsApp Analytics Interface
 */
export interface WhatsAppAnalytics {
  totalMessages: number
  sentMessages: number
  receivedMessages: number
  deliveredMessages: number
  readMessages: number
  failedMessages: number
  totalConversations: number
  activeConversations: number
  responseRate: number
  averageResponseTime: number
}

/**
 * WhatsApp Stats Interface
 */
export interface WhatsAppStats {
  today: {
    sent: number
    received: number
    conversations: number
  }
  thisWeek: {
    sent: number
    received: number
    conversations: number
  }
  thisMonth: {
    sent: number
    received: number
    conversations: number
  }
}

/**
 * Send Template Data
 */
export interface SendTemplateData {
  to: string
  templateName: string
  language: string
  components?: any[]
}

/**
 * Send Text Data
 */
export interface SendTextData {
  to: string
  message: string
}

/**
 * Send Media Data
 */
export interface SendMediaData {
  to: string
  mediaType: 'image' | 'video' | 'audio' | 'document'
  mediaUrl: string
  caption?: string
}

/**
 * Send Location Data
 */
export interface SendLocationData {
  to: string
  latitude: number
  longitude: number
  name?: string
  address?: string
}

/**
 * Create Template Data
 */
export interface CreateTemplateData {
  name: string
  category: string
  language: string
  components: any[]
}

/**
 * WhatsApp Service Object
 */
const whatsappService = {
  /**
   * Send template message
   * POST /api/whatsapp/send/template
   */
  sendTemplate: async (data: SendTemplateData): Promise<{ messageId: string; status: string }> => {
    try {
      const response = await apiClient.post('/whatsapp/send/template', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send text message
   * POST /api/whatsapp/send/text
   */
  sendText: async (data: SendTextData): Promise<{ messageId: string; status: string }> => {
    try {
      const response = await apiClient.post('/whatsapp/send/text', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send media message
   * POST /api/whatsapp/send/media
   */
  sendMedia: async (data: SendMediaData): Promise<{ messageId: string; status: string }> => {
    try {
      const response = await apiClient.post('/whatsapp/send/media', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send location message
   * POST /api/whatsapp/send/location
   */
  sendLocation: async (data: SendLocationData): Promise<{ messageId: string; status: string }> => {
    try {
      const response = await apiClient.post('/whatsapp/send/location', data)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all conversations
   * GET /api/whatsapp/conversations
   */
  getConversations: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ conversations: WhatsAppConversation[]; total: number }> => {
    try {
      const response = await apiClient.get('/whatsapp/conversations', { params })
      return {
        conversations: response.data.conversations || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single conversation
   * GET /api/whatsapp/conversations/:id
   */
  getConversation: async (id: string): Promise<WhatsAppConversation> => {
    try {
      const response = await apiClient.get(`/whatsapp/conversations/${id}`)
      return response.data.conversation || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get messages for a conversation
   * GET /api/whatsapp/conversations/:id/messages
   */
  getMessages: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ messages: WhatsAppMessage[]; total: number }> => {
    try {
      const response = await apiClient.get(`/whatsapp/conversations/${id}/messages`, { params })
      return {
        messages: response.data.messages || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark conversation as read
   * POST /api/whatsapp/conversations/:id/read
   */
  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/whatsapp/conversations/${id}/read`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Assign conversation to user
   * PUT /api/whatsapp/conversations/:id/assign
   */
  assignConversation: async (id: string, userId: string): Promise<WhatsAppConversation> => {
    try {
      const response = await apiClient.put(`/whatsapp/conversations/${id}/assign`, { userId })
      return response.data.conversation || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Link conversation to existing lead
   * POST /api/whatsapp/conversations/:id/link-lead
   */
  linkToLead: async (id: string, leadId: string): Promise<WhatsAppConversation> => {
    try {
      const response = await apiClient.post(`/whatsapp/conversations/${id}/link-lead`, { leadId })
      return response.data.conversation || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create lead from conversation
   * POST /api/whatsapp/conversations/:id/create-lead
   */
  createLeadFromConversation: async (
    id: string,
    leadData?: any
  ): Promise<{ lead: any; conversation: WhatsAppConversation }> => {
    try {
      const response = await apiClient.post(`/whatsapp/conversations/${id}/create-lead`, leadData || {})
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all templates
   * GET /api/whatsapp/templates
   */
  getTemplates: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ templates: WhatsAppTemplate[]; total: number }> => {
    try {
      const response = await apiClient.get('/whatsapp/templates', { params })
      return {
        templates: response.data.templates || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new template
   * POST /api/whatsapp/templates
   */
  createTemplate: async (data: CreateTemplateData): Promise<WhatsAppTemplate> => {
    try {
      const response = await apiClient.post('/whatsapp/templates', data)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit template for approval
   * POST /api/whatsapp/templates/:id/submit
   */
  submitTemplate: async (id: string): Promise<WhatsAppTemplate> => {
    try {
      const response = await apiClient.post(`/whatsapp/templates/${id}/submit`)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get WhatsApp analytics
   * GET /api/whatsapp/analytics
   */
  getAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<WhatsAppAnalytics> => {
    try {
      const response = await apiClient.get('/whatsapp/analytics', { params })
      return response.data.analytics || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get WhatsApp stats
   * GET /api/whatsapp/stats
   */
  getStats: async (): Promise<WhatsAppStats> => {
    try {
      const response = await apiClient.get('/whatsapp/stats')
      return response.data.stats || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default whatsappService
