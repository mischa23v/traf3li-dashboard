/**
 * Conversations Service
 * Handles all messaging/chat-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Conversation Interface
 */
export interface Conversation {
  _id: string
  participants: Participant[]
  lastMessage?: Message
  unreadCount: Record<string, number>
  createdAt: string
  updatedAt: string
}

export interface Participant {
  _id: string
  username: string
  email?: string
  image?: string
  role?: string
}

export interface Message {
  _id: string
  conversationId: string
  sender: Participant
  content: string
  attachments?: Attachment[]
  readBy: string[]
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  fileName: string
  fileUrl: string
  fileType: string
}

/**
 * Create Conversation Data
 */
export interface CreateConversationData {
  participants: string[]
}

/**
 * Send Message Data
 */
export interface SendMessageData {
  content: string
  attachments?: Attachment[]
}

/**
 * Conversations Service Object
 */
const conversationsService = {
  /**
   * Get all conversations
   */
  getConversations: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ conversations: Conversation[]; total: number }> => {
    try {
      const response = await apiClient.get('/conversations', { params })
      return {
        conversations: response.data.conversations || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get conversations error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single conversation
   */
  getConversation: async (id: string): Promise<Conversation> => {
    try {
      const response = await apiClient.get(`/conversations/${id}`)
      return response.data.conversation || response.data.data
    } catch (error: any) {
      console.error('Get conversation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create conversation
   */
  createConversation: async (
    data: CreateConversationData
  ): Promise<Conversation> => {
    try {
      const response = await apiClient.post('/conversations', data)
      return response.data.conversation || response.data.data
    } catch (error: any) {
      console.error('Create conversation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ messages: Message[]; total: number }> => {
    try {
      const response = await apiClient.get(
        `/conversations/${conversationId}/messages`,
        { params }
      )
      return {
        messages: response.data.messages || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get messages error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send message
   */
  sendMessage: async (
    conversationId: string,
    data: SendMessageData
  ): Promise<Message> => {
    try {
      const response = await apiClient.post(
        `/conversations/${conversationId}/messages`,
        data
      )
      return response.data.message || response.data.data
    } catch (error: any) {
      console.error('Send message error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      await apiClient.post(`/conversations/${conversationId}/read`)
    } catch (error: any) {
      console.error('Mark as read error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/conversations/${id}`)
    } catch (error: any) {
      console.error('Delete conversation error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default conversationsService
