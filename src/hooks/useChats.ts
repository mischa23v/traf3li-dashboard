import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import chatsService, {
  SendMessageData,
  CreateConversationData,
} from '@/services/chatsService'
import { toast } from 'sonner'

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatsService.getConversations(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for new messages
  })
}

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: () => chatsService.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for new messages
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageData) => chatsService.sendMessage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({
        queryKey: ['conversations', variables.conversationId],
      })
      // Don't show toast for sending messages - it's too noisy
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الرسالة')
    },
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateConversationData) =>
      chatsService.createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('تم إنشاء المحادثة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المحادثة')
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatsService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('تم حذف المحادثة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المحادثة')
    },
  })
}
