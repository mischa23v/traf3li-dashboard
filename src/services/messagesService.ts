/**
 * Messages Service
 * Handles all message-related API calls
 * Base route: /api/messages
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Message Interface
 */
export interface Message {
  _id: string
  conversationId: string
  sender: {
    _id: string
    username: string
    email?: string
    image?: string
    role?: string
  }
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
 * Send Message Data
 */
export interface SendMessageData {
  content: string
  conversationId: string
  files?: File[]
}

/**
 * Messages Service Object
 */
const messagesService = {
  /**
   * Get all messages of one conversation
   * GET /api/messages/:conversationID
   */
  getMessages: async (
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ messages: Message[]; total: number }> => {
    try {
      const response = await apiClient.get(`/messages/${conversationId}`, {
        params,
      })
      return {
        messages: response.data.messages || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create/Send message with optional file upload (up to 5 files)
   * POST /api/messages
   */
  createMessage: async (data: SendMessageData): Promise<Message> => {
    try {
      const formData = new FormData()
      formData.append('content', data.content)
      formData.append('conversationId', data.conversationId)

      if (data.files && data.files.length > 0) {
        // Backend accepts up to 5 files
        const filesToUpload = data.files.slice(0, 5)
        filesToUpload.forEach((file) => {
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
   * Mark messages as read
   * PATCH /api/messages/:conversationID/read
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      await apiClient.patch(`/messages/${conversationId}/read`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default messagesService
