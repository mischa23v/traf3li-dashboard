/**
 * Conversations Hooks
 * TanStack Query hooks for messaging/chat operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import conversationsService, {
  CreateConversationData,
  SendMessageData,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('تم إنشاء المحادثة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المحادثة')
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
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations', conversationId, 'messages'],
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الرسالة')
    },
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations', conversationId],
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => conversationsService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('تم حذف المحادثة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المحادثة')
    },
  })
}
