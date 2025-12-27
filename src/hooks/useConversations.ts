/**
 * Conversations Hooks
 * TanStack Query hooks for messaging/chat operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import conversationsService, {
  CreateConversationData,
} from '@/services/conversationsService'
import messagesService, { SendMessageData } from '@/services/messagesService'
import { invalidateCache } from '@/lib/cache-invalidation'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== CONVERSATIONS ====================

export const useConversations = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationsService.getConversations(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useSingleConversation = (sellerID: string, buyerID: string) => {
  return useQuery({
    queryKey: ['conversations', 'single', sellerID, buyerID],
    queryFn: () => conversationsService.getSingleConversation(sellerID, buyerID),
    enabled: !!sellerID && !!buyerID,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateConversationData) =>
      conversationsService.createConversation(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('Conversation created successfully | تم إنشاء المحادثة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['conversations'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create conversation | فشل إنشاء المحادثة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.conversations.all()
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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
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
      toast.error(error.message || 'Failed to send message | فشل إرسال الرسالة')
    },
    onSettled: async (_, __, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.conversations.messages(variables.conversationId)
      await invalidateCache.conversations.all()
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
      await invalidateCache.conversations.messages(conversationId)
      await invalidateCache.conversations.all()
    },
  })
}

export const useUpdateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      conversationsService.updateConversation(id, data),
    onSuccess: (data, { id }) => {
      toast.success('Conversation updated successfully | تم تحديث المحادثة بنجاح')

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
      toast.error(error.message || 'Failed to update conversation | فشل تحديث المحادثة')
    },
    onSettled: async (_, __, { id }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.conversations.all()
      await invalidateCache.conversations.single()
    },
  })
}

// ==================== DEPRECATED HOOKS (for backward compatibility) ====================
// These hooks are deprecated and will be removed in a future version.
// Use the new hooks or socket-based approach instead.

/**
 * @deprecated Use useSingleConversation() instead. This hook will be removed in a future version.
 *
 * Migration Guide:
 * - Old: useConversation(sellerID, buyerID)
 * - New: useSingleConversation(sellerID, buyerID)
 *
 * @param sellerID - The seller's ID
 * @param buyerID - The buyer's ID
 * @returns Query result for the conversation
 */
export const useConversation = (sellerID: string, buyerID: string) => {
  console.warn(
    '⚠️  DEPRECATED | تحذير: هذه الدالة قديمة\n' +
    'useConversation() is deprecated and will be removed in a future version.\n' +
    'هذه الدالة قديمة وسيتم إزالتها في إصدار مستقبلي.\n' +
    '\n' +
    'Migration | الترحيل:\n' +
    '- Old | القديم: useConversation(sellerID, buyerID)\n' +
    '- New | الجديد: useSingleConversation(sellerID, buyerID)\n'
  )
  return useSingleConversation(sellerID, buyerID)
}

/**
 * @deprecated Use socket-based approach instead. This hook will be removed in a future version.
 *
 * Migration Guide:
 * Instead of using this REST API-based hook, use the real-time socket approach:
 *
 * 1. Import socketService:
 *    import socketService from '@/services/socketService'
 *
 * 2. Mark messages as read via socket:
 *    socketService.markAsRead({ conversationId, userId })
 *
 * 3. Listen for read receipts:
 *    socketService.onMessageRead((data) => {
 *      // Handle read receipt
 *    })
 *
 * Benefits of socket-based approach:
 * - Real-time updates without polling
 * - Better performance and lower server load
 * - Instant read receipt delivery to all participants
 *
 * @returns Mutation function to mark messages as read
 */
export const useMarkAsRead = () => {
  console.warn(
    '⚠️  DEPRECATED | تحذير: هذه الدالة قديمة\n' +
    'useMarkAsRead() is deprecated and will be removed in a future version.\n' +
    'هذه الدالة قديمة وسيتم إزالتها في إصدار مستقبلي.\n' +
    '\n' +
    'Migration | الترحيل:\n' +
    'Use socket-based approach instead of REST API | استخدم النهج القائم على السوكت بدلاً من REST API\n' +
    '\n' +
    '1. Import socketService | استيراد خدمة السوكت:\n' +
    '   import socketService from \'@/services/socketService\'\n' +
    '\n' +
    '2. Mark as read | تعليم كمقروء:\n' +
    '   socketService.markAsRead({ conversationId, userId })\n' +
    '\n' +
    '3. Listen for read receipts | الاستماع لإشعارات القراءة:\n' +
    '   socketService.onMessageRead((data) => { /* handle */ })\n' +
    '\n' +
    'Benefits | الفوائد:\n' +
    '- Real-time updates | تحديثات فورية\n' +
    '- Better performance | أداء أفضل\n' +
    '- Instant delivery | توصيل فوري\n'
  )
  return useMarkMessagesAsRead()
}
