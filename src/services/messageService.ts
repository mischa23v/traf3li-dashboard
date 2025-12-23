/**
 * Message/Chatter Service
 * API service for threaded messages and discussions (based on Odoo mail.message)
 *
 * ⚠️ IMPLEMENTATION STATUS: [BACKEND-PENDING]
 * These endpoints are documented but their implementation status is UNCONFIRMED.
 * The backend may not have fully implemented all thread-based messaging endpoints.
 *
 * EXPECTED API ENDPOINTS (all prefixed with /api):
 * - POST   /api/messages                      - [BACKEND-PENDING] Create a message/comment
 * - POST   /api/messages/note                 - [BACKEND-PENDING] Create an internal note
 * - GET    /api/messages                      - [BACKEND-PENDING] Get messages with filters
 * - GET    /api/messages/thread/:model/:id    - [BACKEND-PENDING] Get full thread for a record
 * - GET    /api/messages/mentions             - [BACKEND-PENDING] Get mentions for current user
 * - GET    /api/messages/starred              - [BACKEND-PENDING] Get starred messages
 * - GET    /api/messages/search               - [BACKEND-PENDING] Search messages
 * - GET    /api/messages/:id                  - [BACKEND-PENDING] Get single message by ID
 * - POST   /api/messages/:id/star             - [BACKEND-PENDING] Toggle star on message
 * - PATCH  /api/messages/:id                  - [BACKEND-PENDING] Update message
 * - DELETE /api/messages/:id                  - [BACKEND-PENDING] Delete message
 *
 * ⚠️ NOTE: Some endpoints may conflict with conversation-based messaging endpoints.
 * If you encounter 404 or unexpected errors, the backend implementation may be incomplete.
 */

import apiClient, { handleApiError } from '@/lib/api'
import { toast } from 'sonner'
import type {
  ThreadMessage,
  RecordThread,
  MessageFilters,
  MessageResponse,
  CreateMessageData,
  CreateNoteData,
  MentionSearchResult,
  ThreadResModel,
} from '@/types/message'

// ==================== MESSAGES ====================

/**
 * Post a new message/comment
 *
 * Endpoint: POST /api/messages
 * ⚠️ [BACKEND-PENDING] - May conflict with conversation messaging endpoint
 * @param data - Message creation data
 * @returns Created message
 */
export const createMessage = async (data: CreateMessageData): Promise<ThreadMessage> => {
  try {
    const response = await apiClient.post('/messages', data)
    toast.success('Message posted | تم نشر الرسالة')
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Thread messaging not implemented | المراسلة الموضوعية غير متاحة'
      )
    } else {
      toast.error('Failed to post message | فشل نشر الرسالة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Post an internal note
 *
 * Endpoint: POST /api/messages/note
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param data - Note creation data
 * @returns Created note (marked as internal)
 */
export const createNote = async (data: CreateNoteData): Promise<ThreadMessage> => {
  try {
    const response = await apiClient.post('/messages/note', {
      ...data,
      is_internal: true,
    })
    toast.success('Internal note added | تمت إضافة ملاحظة داخلية')
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Internal notes not implemented | الملاحظات الداخلية غير متاحة'
      )
    } else {
      toast.error('Failed to add note | فشل إضافة الملاحظة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Get messages with filters
 *
 * Endpoint: GET /api/messages?[query params]
 * ⚠️ [BACKEND-PENDING] - May conflict with conversation messaging endpoint
 * @param filters - Optional filters for messages
 * @returns Paginated message response
 */
export const getMessages = async (filters?: MessageFilters): Promise<MessageResponse> => {
  try {
    const params = new URLSearchParams()

    if (filters?.res_model) params.append('res_model', filters.res_model)
    if (filters?.res_id) params.append('res_id', filters.res_id)
    if (filters?.message_type) {
      if (Array.isArray(filters.message_type)) {
        filters.message_type.forEach((t) => params.append('message_type', t))
      } else {
        params.append('message_type', filters.message_type)
      }
    }
    if (filters?.author_id) params.append('author_id', filters.author_id)
    if (filters?.is_internal !== undefined)
      params.append('is_internal', String(filters.is_internal))
    if (filters?.is_starred !== undefined)
      params.append('is_starred', String(filters.is_starred))
    if (filters?.search) params.append('search', filters.search)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const response = await apiClient.get(`/messages?${params.toString()}`)
    return response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Thread messaging filters not implemented | تصفية الرسائل غير متاحة'
      )
    } else {
      toast.error('Failed to load messages | فشل تحميل الرسائل')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Get full thread for a record (grouped by type)
 *
 * Endpoint: GET /api/messages/thread/:resModel/:resId
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param resModel - Model type (Case, Client, Lead, etc.)
 * @param resId - Record ID
 * @returns Thread with messages grouped by type (comments, notes, notifications, etc.)
 */
export const getRecordThread = async (
  resModel: ThreadResModel,
  resId: string
): Promise<RecordThread> => {
  try {
    const response = await apiClient.get(`/messages/thread/${resModel}/${resId}`)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Thread view not implemented | عرض المحادثة غير متاح'
      )
    } else {
      toast.error('Failed to load thread | فشل تحميل المحادثة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Get messages mentioning current user
 *
 * Endpoint: GET /api/messages/mentions?[query params]
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @returns Mention search results with unread count
 */
export const getMyMentions = async (
  page?: number,
  limit?: number
): Promise<MentionSearchResult> => {
  try {
    const params = new URLSearchParams()
    if (page) params.append('page', String(page))
    if (limit) params.append('limit', String(limit))

    const response = await apiClient.get(`/messages/mentions?${params.toString()}`)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Mentions not implemented | الإشارات غير متاحة')
    } else {
      toast.error('Failed to load mentions | فشل تحميل الإشارات')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Get starred messages for current user
 *
 * Endpoint: GET /api/messages/starred?[query params]
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @returns Paginated starred messages
 */
export const getStarredMessages = async (
  page?: number,
  limit?: number
): Promise<MessageResponse> => {
  try {
    const params = new URLSearchParams()
    if (page) params.append('page', String(page))
    if (limit) params.append('limit', String(limit))

    const response = await apiClient.get(`/messages/starred?${params.toString()}`)
    return response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Starred messages not implemented | الرسائل المميزة غير متاحة'
      )
    } else {
      toast.error('Failed to load starred messages | فشل تحميل الرسائل المميزة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Search messages
 *
 * Endpoint: GET /api/messages/search?[query params]
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param query - Search query string
 * @param resModel - Optional model filter
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @returns Paginated search results
 */
export const searchMessages = async (
  query: string,
  resModel?: ThreadResModel,
  page?: number,
  limit?: number
): Promise<MessageResponse> => {
  try {
    const params = new URLSearchParams()
    params.append('q', query)
    if (resModel) params.append('res_model', resModel)
    if (page) params.append('page', String(page))
    if (limit) params.append('limit', String(limit))

    const response = await apiClient.get(`/messages/search?${params.toString()}`)
    return response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Message search not implemented | البحث في الرسائل غير متاح'
      )
    } else {
      toast.error('Failed to search messages | فشل البحث في الرسائل')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Get a single message by ID
 *
 * Endpoint: GET /api/messages/:id
 * ⚠️ [BACKEND-PENDING] - May conflict with conversation messaging endpoint
 * @param id - Message ID
 * @returns Single message
 */
export const getMessageById = async (id: string): Promise<ThreadMessage> => {
  try {
    const response = await apiClient.get(`/messages/${id}`)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Get message by ID not implemented | الرسالة غير متاحة')
    } else {
      toast.error('Failed to load message | فشل تحميل الرسالة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Toggle star on a message
 *
 * Endpoint: POST /api/messages/:id/star
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param id - Message ID
 * @returns Updated message with toggled star status
 */
export const toggleMessageStar = async (id: string): Promise<ThreadMessage> => {
  try {
    const response = await apiClient.post(`/messages/${id}/star`)
    toast.success('Star toggled | تم تحديث التمييز')
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Star feature not implemented | التمييز غير متاح')
    } else {
      toast.error('Failed to toggle star | فشل تحديث التمييز')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Delete a message
 *
 * Endpoint: DELETE /api/messages/:id
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param id - Message ID
 */
export const deleteMessage = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/messages/${id}`)
    toast.success('Message deleted | تم حذف الرسالة')
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Delete message not implemented | حذف الرسالة غير متاح')
    } else {
      toast.error('Failed to delete message | فشل حذف الرسالة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Update a message (only for own messages, within time limit)
 *
 * Endpoint: PATCH /api/messages/:id
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @param id - Message ID
 * @param body - New message body content
 * @returns Updated message
 */
export const updateMessage = async (
  id: string,
  body: string
): Promise<ThreadMessage> => {
  try {
    const response = await apiClient.patch(`/messages/${id}`, { body })
    toast.success('Message updated | تم تحديث الرسالة')
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Update message not implemented | تحديث الرسالة غير متاح')
    } else {
      toast.error('Failed to update message | فشل تحديث الرسالة')
    }
    throw new Error(errorMsg)
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Post a quick comment to a record
 *
 * This is a convenience wrapper around createMessage()
 * Endpoint: POST /api/messages
 *
 * @param resModel - Model type (Case, Client, Lead, etc.)
 * @param resId - Record ID
 * @param body - Comment body (HTML)
 * @param attachmentIds - Optional attachment IDs
 * @returns Created comment message
 */
export const postComment = async (
  resModel: ThreadResModel,
  resId: string,
  body: string,
  attachmentIds?: string[]
): Promise<ThreadMessage> => {
  return createMessage({
    res_model: resModel,
    res_id: resId,
    body,
    is_internal: false,
    attachment_ids: attachmentIds,
  })
}

/**
 * Post a quick internal note to a record
 *
 * This is a convenience wrapper around createNote()
 * Endpoint: POST /api/messages/note
 *
 * @param resModel - Model type (Case, Client, Lead, etc.)
 * @param resId - Record ID
 * @param body - Note body (HTML)
 * @param partnerIds - Optional partner IDs to mention/notify
 * @returns Created internal note
 */
export const postInternalNote = async (
  resModel: ThreadResModel,
  resId: string,
  body: string,
  partnerIds?: string[]
): Promise<ThreadMessage> => {
  return createNote({
    res_model: resModel,
    res_id: resId,
    body,
    partner_ids: partnerIds,
  })
}

// ==================== SERVICE OBJECT ====================

const messageService = {
  // Core operations
  createMessage,
  createNote,
  getMessages,
  getRecordThread,
  getMessageById,
  updateMessage,
  deleteMessage,

  // User-specific
  getMyMentions,
  getStarredMessages,
  toggleMessageStar,

  // Search
  searchMessages,

  // Helpers
  postComment,
  postInternalNote,
}

export default messageService
