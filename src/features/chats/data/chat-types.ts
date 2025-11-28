/**
 * Chat Types
 * Re-exports types from the useChat hook for use in chat components
 */

import type { Conversation, Message } from '@/hooks/useChat'

// Re-export types from useChat
export type { Conversation, Message }

// User type extracted from conversation participants
export type ChatUser = Conversation['sellerID'] | Conversation['buyerID']

// Helper type for the other participant in a conversation
export interface ChatParticipant {
  _id: string
  username: string
  image?: string
  email?: string
}
