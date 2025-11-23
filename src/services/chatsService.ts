/**
 * Chats Service
 * Handles all chat and messaging API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

export interface Message {
  id?: string
  sender: string
  message: string
  timestamp: string
}

export interface Conversation {
  id: string
  profile: string
  username: string
  fullName: string
  title: string
  messages: Message[]
}

export interface SendMessageData {
  conversationId: string
  message: string
}

export interface CreateConversationData {
  userId: string
  message?: string
}

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get('/chats/conversations')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const getConversation = async (conversationId: string): Promise<Conversation> => {
  try {
    const response = await apiClient.get(`/chats/conversations/${conversationId}`)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  try {
    const response = await apiClient.post(
      `/chats/conversations/${data.conversationId}/messages`,
      { message: data.message }
    )
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const createConversation = async (
  data: CreateConversationData
): Promise<Conversation> => {
  try {
    const response = await apiClient.post('/chats/conversations', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/chats/conversations/${conversationId}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

const chatsService = {
  getConversations,
  getConversation,
  sendMessage,
  createConversation,
  deleteConversation,
}

export default chatsService
