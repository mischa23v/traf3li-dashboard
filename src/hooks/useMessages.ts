/**
 * Message/Chatter Hooks
 * React Query hooks for threaded discussions and messaging
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import messageService from '@/services/messageService'
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

// ==================== Cache Configuration ====================
const THREAD_STALE_TIME = 2 * 60 * 1000 // 2 minutes
const THREAD_GC_TIME = 30 * 60 * 1000 // 30 minutes
const MENTION_STALE_TIME = 5 * 60 * 1000 // 5 minutes

// ==================== QUERY KEYS ====================

export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (filters?: MessageFilters) => [...messageKeys.lists(), filters] as const,
  thread: (resModel: ThreadResModel, resId: string) =>
    [...messageKeys.all, 'thread', resModel, resId] as const,
  mentions: () => [...messageKeys.all, 'mentions'] as const,
  starred: () => [...messageKeys.all, 'starred'] as const,
  search: (query: string, resModel?: ThreadResModel) =>
    [...messageKeys.all, 'search', query, resModel] as const,
  detail: (id: string) => [...messageKeys.all, 'detail', id] as const,
}

// ==================== MESSAGE QUERIES ====================

/**
 * Get messages with filters
 */
export function useMessages(filters?: MessageFilters, enabled = true) {
  return useQuery({
    queryKey: messageKeys.list(filters),
    queryFn: () => messageService.getMessages(filters),
    staleTime: THREAD_STALE_TIME,
    gcTime: THREAD_GC_TIME,
    enabled,
  })
}

/**
 * Get full thread for a record (grouped by type)
 */
export function useRecordThread(
  resModel: ThreadResModel,
  resId: string,
  enabled = true
) {
  return useQuery({
    queryKey: messageKeys.thread(resModel, resId),
    queryFn: () => messageService.getRecordThread(resModel, resId),
    staleTime: THREAD_STALE_TIME,
    gcTime: THREAD_GC_TIME,
    enabled: !!resModel && !!resId && enabled,
  })
}

/**
 * Get messages mentioning current user
 */
export function useMyMentions(page?: number, limit?: number, enabled = true) {
  return useQuery({
    queryKey: messageKeys.mentions(),
    queryFn: () => messageService.getMyMentions(page, limit),
    staleTime: MENTION_STALE_TIME,
    gcTime: THREAD_GC_TIME,
    enabled,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

/**
 * Get starred messages for current user
 */
export function useStarredMessages(page?: number, limit?: number, enabled = true) {
  return useQuery({
    queryKey: messageKeys.starred(),
    queryFn: () => messageService.getStarredMessages(page, limit),
    staleTime: THREAD_STALE_TIME,
    gcTime: THREAD_GC_TIME,
    enabled,
  })
}

/**
 * Search messages
 */
export function useSearchMessages(
  query: string,
  resModel?: ThreadResModel,
  page?: number,
  limit?: number,
  enabled = true
) {
  return useQuery({
    queryKey: messageKeys.search(query, resModel),
    queryFn: () => messageService.searchMessages(query, resModel, page, limit),
    staleTime: THREAD_STALE_TIME,
    gcTime: THREAD_GC_TIME,
    enabled: !!query && enabled,
  })
}

/**
 * Get a single message by ID
 */
export function useMessageById(id: string, enabled = true) {
  return useQuery({
    queryKey: messageKeys.detail(id),
    queryFn: () => messageService.getMessageById(id),
    staleTime: THREAD_STALE_TIME,
    gcTime: THREAD_GC_TIME,
    enabled: !!id && enabled,
  })
}

// ==================== MESSAGE MUTATIONS ====================

/**
 * Post a new message/comment
 */
export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMessageData) => messageService.createMessage(data),
    onSuccess: (newMessage) => {
      // Invalidate the thread for this record
      if (newMessage.res_model && newMessage.res_id) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.thread(
            newMessage.res_model as ThreadResModel,
            newMessage.res_id
          ),
        })
      }
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() })
    },
  })
}

/**
 * Post an internal note
 */
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNoteData) => messageService.createNote(data),
    onSuccess: (newNote) => {
      // Invalidate the thread for this record
      if (newNote.res_model && newNote.res_id) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.thread(
            newNote.res_model as ThreadResModel,
            newNote.res_id
          ),
        })
      }
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() })
    },
  })
}

/**
 * Update a message
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      messageService.updateMessage(id, body),
    onSuccess: (updatedMessage, { id }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.detail(id) })
      if (updatedMessage.res_model && updatedMessage.res_id) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.thread(
            updatedMessage.res_model as ThreadResModel,
            updatedMessage.res_id
          ),
        })
      }
    },
  })
}

/**
 * Toggle star on a message
 */
export function useToggleMessageStar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => messageService.toggleMessageStar(id),
    onSuccess: (updatedMessage, id) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: messageKeys.starred() })
      if (updatedMessage.res_model && updatedMessage.res_id) {
        queryClient.invalidateQueries({
          queryKey: messageKeys.thread(
            updatedMessage.res_model as ThreadResModel,
            updatedMessage.res_id
          ),
        })
      }
    },
  })
}

/**
 * Delete a message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => messageService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() })
      queryClient.invalidateQueries({ queryKey: messageKeys.starred() })
    },
  })
}

// ==================== CONVENIENCE HOOKS ====================

/**
 * Post a quick comment (convenience wrapper)
 */
export function usePostComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      resModel,
      resId,
      body,
      attachmentIds,
    }: {
      resModel: ThreadResModel
      resId: string
      body: string
      attachmentIds?: string[]
    }) => messageService.postComment(resModel, resId, body, attachmentIds),
    onSuccess: (_, { resModel, resId }) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.thread(resModel, resId),
      })
    },
  })
}

/**
 * Post a quick internal note (convenience wrapper)
 */
export function usePostInternalNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      resModel,
      resId,
      body,
      partnerIds,
    }: {
      resModel: ThreadResModel
      resId: string
      body: string
      partnerIds?: string[]
    }) => messageService.postInternalNote(resModel, resId, body, partnerIds),
    onSuccess: (_, { resModel, resId }) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.thread(resModel, resId),
      })
    },
  })
}

// ==================== EXPORTS ====================

export type {
  ThreadMessage,
  RecordThread,
  MessageFilters,
  MessageResponse,
  CreateMessageData,
  CreateNoteData,
  MentionSearchResult,
  ThreadResModel,
}
