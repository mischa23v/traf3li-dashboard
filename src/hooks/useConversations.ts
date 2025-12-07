/**
 * Conversations Hooks
 * TanStack Query hooks for messaging/chat operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import conversationsService, {
  type CreateConversationData,
  type SendMessageData,
} from '@/services/conversationsService'

// ==================== CONVERSATIONS ====================

export const useConversations = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationsService.getConversations(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useConversation = (id: string) => {
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: () => conversationsService.getConversation(id),
    enabled: !!id,
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
    queryKey: ['conversations', conversationId, 'messages', params],
    queryFn: () => conversationsService.getMessages(conversationId, params),
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string
      data: SendMessageData
    }) => conversationsService.sendMessage(conversationId, data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data, { conversationId }) => {
      // Manually update the cache for messages
      queryClient.setQueriesData({ queryKey: ['conversations', conversationId, 'messages'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [...old, data]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الرسالة')
    },
    onSettled: async (_, __, { conversationId }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: ['conversations', conversationId, 'messages'],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
    },
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.markAsRead(conversationId),
    onSettled: async (_, __, conversationId) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: ['conversations', conversationId],
        refetchType: 'all'
      })
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => conversationsService.deleteConversation(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف المحادثة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['conversations'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return old.filter((c: any) => c._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المحادثة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'all' })
    },
  })
}
