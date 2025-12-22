/**
 * Message/Chatter Service
 * API service for threaded messages and discussions (based on Odoo mail.message)
 */

import apiClient from '@/lib/api'
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
 */
export const createMessage = async (data: CreateMessageData): Promise<ThreadMessage> => {
  const response = await apiClient.post('/messages', data)
  return response.data?.data || response.data
}

/**
 * Post an internal note
 */
export const createNote = async (data: CreateNoteData): Promise<ThreadMessage> => {
  const response = await apiClient.post('/messages/note', {
    ...data,
    is_internal: true,
  })
  return response.data?.data || response.data
}

/**
 * Get messages with filters
 */
export const getMessages = async (filters?: MessageFilters): Promise<MessageResponse> => {
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
  if (filters?.is_internal !== undefined) params.append('is_internal', String(filters.is_internal))
  if (filters?.is_starred !== undefined) params.append('is_starred', String(filters.is_starred))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await apiClient.get(`/messages?${params.toString()}`)
  return response.data
}

/**
 * Get full thread for a record (grouped by type)
 */
export const getRecordThread = async (
  resModel: ThreadResModel,
  resId: string
): Promise<RecordThread> => {
  const response = await apiClient.get(`/messages/thread/${resModel}/${resId}`)
  return response.data?.data || response.data
}

/**
 * Get messages mentioning current user
 */
export const getMyMentions = async (
  page?: number,
  limit?: number
): Promise<MentionSearchResult> => {
  const params = new URLSearchParams()
  if (page) params.append('page', String(page))
  if (limit) params.append('limit', String(limit))

  const response = await apiClient.get(`/messages/mentions?${params.toString()}`)
  return response.data?.data || response.data
}

/**
 * Get starred messages for current user
 */
export const getStarredMessages = async (
  page?: number,
  limit?: number
): Promise<MessageResponse> => {
  const params = new URLSearchParams()
  if (page) params.append('page', String(page))
  if (limit) params.append('limit', String(limit))

  const response = await apiClient.get(`/messages/starred?${params.toString()}`)
  return response.data
}

/**
 * Search messages
 */
export const searchMessages = async (
  query: string,
  resModel?: ThreadResModel,
  page?: number,
  limit?: number
): Promise<MessageResponse> => {
  const params = new URLSearchParams()
  params.append('q', query)
  if (resModel) params.append('res_model', resModel)
  if (page) params.append('page', String(page))
  if (limit) params.append('limit', String(limit))

  const response = await apiClient.get(`/messages/search?${params.toString()}`)
  return response.data
}

/**
 * Get a single message by ID
 */
export const getMessageById = async (id: string): Promise<ThreadMessage> => {
  const response = await apiClient.get(`/messages/${id}`)
  return response.data?.data || response.data
}

/**
 * Toggle star on a message
 */
export const toggleMessageStar = async (id: string): Promise<ThreadMessage> => {
  const response = await apiClient.post(`/messages/${id}/star`)
  return response.data?.data || response.data
}

/**
 * Delete a message
 */
export const deleteMessage = async (id: string): Promise<void> => {
  await apiClient.delete(`/messages/${id}`)
}

/**
 * Update a message (only for own messages, within time limit)
 */
export const updateMessage = async (
  id: string,
  body: string
): Promise<ThreadMessage> => {
  const response = await apiClient.patch(`/messages/${id}`, { body })
  return response.data?.data || response.data
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Post a quick comment to a record
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
