/**
 * Chats Service
 * Handles all chat and messaging API calls
 * Updated to match backend API structure
 */

import apiClient, { handleApiError } from '@/lib/api'

// Backend response types matching actual API
export interface User {
  _id: string
  username: string
  email: string
  image?: string
}

export interface Attachment {
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  type: string
}

export interface ReadReceipt {
  userId: string
  readAt: string
}

export interface BackendMessage {
  _id: string
  conversationID: string
  userID: User | string
  description: string
  attachments: Attachment[]
  readBy: ReadReceipt[]
  isEdited: boolean
  createdAt: string
  updatedAt: string
}

export interface BackendConversation {
  _id: string
  conversationID: string
  sellerID: User | string
  buyerID: User | string
  readBySeller: boolean
  readByBuyer: boolean
  lastMessage?: string
  createdAt: string
  updatedAt: string
}

// Frontend display types (for UI compatibility)
export interface Message {
  id: string
  sender: string
  message: string
  timestamp: string
  attachments?: Attachment[]
  isEdited?: boolean
}

export interface Conversation {
  id: string
  conversationID: string
  profile: string
  username: string
  fullName: string
  title: string
  messages: Message[]
  lastMessage?: string
  updatedAt: string
}

export interface SendMessageData {
  conversationID: string
  description: string
  files?: File[]
}

export interface CreateConversationData {
  to: string // User ID to start conversation with
}

/**
 * Transform backend conversation to frontend format
 */
const transformConversation = (
  conv: BackendConversation,
  currentUserId?: string
): Conversation => {
  // Determine the other user (not yourself)
  const otherUser =
    typeof conv.sellerID === 'object' ? conv.sellerID :
    typeof conv.buyerID === 'object' ? conv.buyerID : null

  const username = otherUser?.username || 'User'
  const email = otherUser?.email || ''
  const image = otherUser?.image || ''

  return {
    id: conv.conversationID,
    conversationID: conv.conversationID,
    profile: image,
    username: username,
    fullName: username,
    title: email,
    messages: [],
    lastMessage: conv.lastMessage,
    updatedAt: conv.updatedAt,
  }
}

/**
 * Transform backend message to frontend format
 */
const transformMessage = (msg: BackendMessage): Message => {
  const user = typeof msg.userID === 'object' ? msg.userID : null

  return {
    id: msg._id,
    sender: user?.username || 'User',
    message: msg.description,
    timestamp: msg.createdAt,
    attachments: msg.attachments,
    isEdited: msg.isEdited,
  }
}

/**
 * Get all conversations for authenticated user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get<BackendConversation[]>('/conversations')
    const conversations = Array.isArray(response.data) ? response.data : []
    return conversations.map(conv => transformConversation(conv))
  } catch (error) {
    console.error('Get conversations error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Get single conversation with messages
 */
export const getConversation = async (
  conversationID: string
): Promise<Conversation> => {
  try {
    // Get conversation details
    const convResponse = await apiClient.get<BackendConversation>(
      `/conversations/${conversationID}`
    )

    // Get messages for this conversation
    const messagesResponse = await apiClient.get<BackendMessage[]>(
      `/messages/${conversationID}`
    )

    const conversation = transformConversation(convResponse.data)
    const messages = Array.isArray(messagesResponse.data)
      ? messagesResponse.data.map(transformMessage)
      : []

    return {
      ...conversation,
      messages,
    }
  } catch (error) {
    console.error('Get conversation error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationID: string
): Promise<Message[]> => {
  try {
    const response = await apiClient.get<BackendMessage[]>(
      `/messages/${conversationID}`
    )
    const messages = Array.isArray(response.data) ? response.data : []
    return messages.map(transformMessage)
  } catch (error) {
    console.error('Get messages error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Send a text message
 */
export const sendMessage = async (
  data: SendMessageData
): Promise<BackendMessage> => {
  try {
    const response = await apiClient.post<BackendMessage>('/messages', {
      conversationID: data.conversationID,
      description: data.description,
    })
    return response.data
  } catch (error) {
    console.error('Send message error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Send a message with file attachments
 */
export const sendMessageWithFiles = async (
  conversationID: string,
  description: string,
  files: File[]
): Promise<BackendMessage> => {
  try {
    const formData = new FormData()
    formData.append('conversationID', conversationID)

    if (description) {
      formData.append('description', description)
    }

    // Add up to 5 files
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      formData.append('files', files[i])
    }

    const response = await apiClient.post<BackendMessage>('/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Send message with files error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Create a new conversation with another user
 */
export const createConversation = async (
  data: CreateConversationData
): Promise<BackendConversation> => {
  try {
    const response = await apiClient.post<BackendConversation>('/conversations', {
      to: data.to,
    })
    return response.data
  } catch (error) {
    console.error('Create conversation error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Mark messages as read in a conversation
 */
export const markMessagesAsRead = async (
  conversationID: string
): Promise<void> => {
  try {
    await apiClient.patch(`/messages/${conversationID}/read`)
  } catch (error) {
    console.error('Mark messages as read error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (
  conversationID: string
): Promise<void> => {
  try {
    await apiClient.patch(`/conversations/${conversationID}`)
  } catch (error) {
    console.error('Mark conversation as read error:', error)
    throw new Error(handleApiError(error))
  }
}

/**
 * Get single conversation between two users
 */
export const getSingleConversation = async (
  sellerID: string,
  buyerID: string
): Promise<BackendConversation> => {
  try {
    const response = await apiClient.get<BackendConversation>(
      `/conversations/single/${sellerID}/${buyerID}`
    )
    return response.data
  } catch (error) {
    console.error('Get single conversation error:', error)
    throw new Error(handleApiError(error))
  }
}

const chatsService = {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  sendMessageWithFiles,
  createConversation,
  markMessagesAsRead,
  markConversationAsRead,
  getSingleConversation,
}

export default chatsService
