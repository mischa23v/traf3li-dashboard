/**
 * Conversations Hooks
 * TanStack Query hooks for messaging/chat operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import conversationsService, {
  CreateConversationData,
} from '@/services/conversationsService'
import messagesService, { SendMessageData } from '@/services/messagesService'

// ==================== CONVERSATIONS ====================

export const useConversations = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationsService.getConversations(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useSingleConversation = (sellerID: string, buyerID: string) => {
  return useQuery({
    queryKey: ['conversations', 'single', sellerID, buyerID],
    queryFn: () => conversationsService.getSingleConversation(sellerID, buyerID),
    enabled: !!sellerID && !!buyerID,
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateConversationData) =>
      conversationsService.createConversation(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء المحادثة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['conversations'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المحادثة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
    },
  })
}

// ==================== MESSAGES ====================

export const useMessages = (
  conversationId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: () => messagesService.getMessages(conversationId, params),
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageData) => messagesService.createMessage(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data, variables) => {
      // Manually update the cache for messages
      queryClient.setQueriesData({ queryKey: ['messages', variables.conversationId] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [...old, data]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الرسالة')
    },
    onSettled: async (_, __, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversationId],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
    },
  })
}

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagesService.markAsRead(conversationId),
    onSettled: async (_, __, conversationId) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
    },
  })
}

export const useUpdateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      conversationsService.updateConversation(id, data),
    onSuccess: (data, { id }) => {
      toast.success('تم تحديث المحادثة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['conversations'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((c: any) => (c._id === id ? { ...c, ...data } : c))
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المحادثة')
    },
    onSettled: async (_, __, { id }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
      await queryClient.invalidateQueries({
        queryKey: ['conversations', 'single'],
        refetchType: 'all'
      })
    },
  })
}

// ==================== DEPRECATED HOOKS (for backward compatibility) ====================
// These hooks are deprecated and will be removed in a future version.
// Use the new hooks above instead.

/**
 * @deprecated Use useSingleConversation instead
 */
export const useConversation = useSingleConversation

/**
 * @deprecated Use useMarkMessagesAsRead instead
 */
export const useMarkAsRead = useMarkMessagesAsRead
