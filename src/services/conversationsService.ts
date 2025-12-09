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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single conversation by seller and buyer IDs
   * GET /api/conversations/single/:sellerID/:buyerID
   */
  getSingleConversation: async (
    sellerID: string,
    buyerID: string
  ): Promise<Conversation> => {
    try {
      const response = await apiClient.get(
        `/conversations/single/${sellerID}/${buyerID}`
      )
      return response.data.conversation || response.data.data
    } catch (error: any) {
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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get messages for a conversation
   * GET /api/messages/:conversationID (backend route)
   */
  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ messages: Message[]; total: number }> => {
    try {
      const response = await apiClient.get(
        `/messages/${conversationId}`,
        { params }
      )
      return {
        messages: response.data.messages || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create/Send message with optional file upload
   * POST /api/messages (backend route)
   */
  createMessage: async (
    data: SendMessageData & { conversationId?: string; files?: File[] }
  ): Promise<Message> => {
    try {
      const formData = new FormData()
      formData.append('content', data.content)

      if (data.conversationId) {
        formData.append('conversationId', data.conversationId)
      }

      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => {
          formData.append('files', file)
        })
      }

      const response = await apiClient.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.message || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update conversation
   * PATCH /api/conversations/:conversationID
   */
  updateConversation: async (
    conversationId: string,
    data: Partial<Conversation>
  ): Promise<Conversation> => {
    try {
      const response = await apiClient.patch(
        `/conversations/${conversationId}`,
        data
      )
      return response.data.conversation || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark messages as read
   * PATCH /api/messages/:conversationID/read (backend route)
   */
  markMessagesAsRead: async (conversationId: string): Promise<void> => {
    try {
      await apiClient.patch(`/messages/${conversationId}/read`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

}

export default conversationsService
