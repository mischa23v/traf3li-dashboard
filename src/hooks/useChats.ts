import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import chatsService, {
  SendMessageData,
  CreateConversationData,
} from '@/services/chatsService'
import { toast } from 'sonner'

/**
 * Fetch all conversations for the authenticated user
 */
export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatsService.getConversations(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for new messages
  })
}

/**
 * Fetch a single conversation with all its messages
 */
export const useConversation = (conversationID: string) => {
  return useQuery({
    queryKey: ['conversations', conversationID],
    queryFn: () => chatsService.getConversation(conversationID),
    enabled: !!conversationID,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for new messages
  })
}

/**
 * Fetch messages for a conversation
 */
export const useMessages = (conversationID: string) => {
  return useQuery({
    queryKey: ['messages', conversationID],
    queryFn: () => chatsService.getMessages(conversationID),
    enabled: !!conversationID,
    staleTime: 30 * 1000,
    refetchInterval: 10 * 1000,
  })
}

/**
 * Send a text message mutation
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageData) => chatsService.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      // Invalidate specific conversation and messages
      queryClient.invalidateQueries({
        queryKey: ['conversations', variables.conversationID],
      })
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.conversationID],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الرسالة')
    },
  })
}

/**
 * Send a message with file attachments
 */
export const useSendMessageWithFiles = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationID,
      description,
      files,
    }: {
      conversationID: string
      description: string
      files: File[]
    }) => chatsService.sendMessageWithFiles(conversationID, description, files),
    onSuccess: (data) => {
      const conversationID = data.conversationID
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({
        queryKey: ['conversations', conversationID],
      })
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationID],
      })
      toast.success('تم إرسال الرسالة مع المرفقات')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الرسالة مع المرفقات')
    },
  })
}

/**
 * Create a new conversation
 */
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

/**
 * Mark messages as read in a conversation
 */
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationID: string) =>
      chatsService.markMessagesAsRead(conversationID),
    onSuccess: (_, conversationID) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({
        queryKey: ['conversations', conversationID],
      })
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationID],
      })
    },
    onError: (error: Error) => {
      console.error('Failed to mark messages as read:', error)
    },
  })
}

/**
 * Mark conversation as read
 */
export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationID: string) =>
      chatsService.markConversationAsRead(conversationID),
    onSuccess: (_, conversationID) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({
        queryKey: ['conversations', conversationID],
      })
    },
    onError: (error: Error) => {
      console.error('Failed to mark conversation as read:', error)
    },
  })
}
