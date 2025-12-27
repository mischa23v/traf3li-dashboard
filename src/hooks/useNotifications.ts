/**
 * Notification Hooks
 * TanStack Query hooks for notification operations
 * Optimized with batched updates and better caching strategies
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
import notificationService, {
  type Notification,
  type NotificationFilters,
  type NotificationSettings,
  type CreateNotificationData,
} from '@/services/notificationService'

// ==================== Cache Configuration ====================
// Optimized cache times for better performance
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists
const UNREAD_COUNT_REFETCH_INTERVAL = CACHE_TIMES.REALTIME.UNREAD_COUNT // 2 minutes (batched updates)

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
  byType: (type: string) => [...notificationKeys.all, 'by-type', type] as const,
}

// ==================== GET NOTIFICATIONS ====================

/**
 * Hook to get all notifications with filters
 * Optimized with proper caching and stale time configuration
 */
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches on window focus
    refetchOnMount: false, // Use cached data if available
  })
}

/**
 * Hook to get a single notification
 */
export const useNotification = (id: string) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getNotification(id),
    enabled: !!id,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Hook to get unread notification count
 * Optimized with batched refetch interval (2 minutes instead of 1)
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    refetchInterval: UNREAD_COUNT_REFETCH_INTERVAL, // Batched updates every 2 minutes
    refetchIntervalInBackground: false, // Don't refetch in background to save resources
    retry: false,
  })
}

/**
 * Hook to get notifications by type
 */
export const useNotificationsByType = (type: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: notificationKeys.byType(type),
    queryFn: () => notificationService.getNotificationsByType(type, params),
    enabled: !!type,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ==================== MARK AS READ ====================

/**
 * Hook to mark a notification as read
 * Optimized with optimistic updates and batched invalidation
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      // Snapshot previous values
      const previousNotifications = queryClient.getQueriesData({ queryKey: notificationKeys.lists() })

      // Optimistically update
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old

        return {
          ...old,
          notifications: old.notifications?.map((n: Notification) =>
            n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          ),
          unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
        }
      })

      // Update unread count
      queryClient.setQueryData(notificationKeys.unreadCount(), (old: any) => ({
        count: Math.max(0, (old?.count || 0) - 1),
      }))

      return { previousNotifications }
    },
    onError: (_error, _id, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([key, value]) => {
          queryClient.setQueryData(key, value)
        })
      }
    },
    onSettled: () => {
      // Batch invalidation - React Query automatically batches these
      invalidateCache.notifications.all()
    },
  })
}

/**
 * Hook to mark multiple notifications as read
 */
export const useMarkMultipleAsRead = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => notificationService.markMultipleAsRead(ids),
    onSuccess: (data) => {
      toast.success(t('notifications.markedAsRead', `${data.count} notifications marked as read`))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('notifications.markAsReadError', 'Failed to mark notifications as read'))
    },
    onSettled: () => {
      invalidateCache.notifications.all()
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      // Snapshot previous values
      const previousNotifications = queryClient.getQueriesData({ queryKey: notificationKeys.lists() })

      // Optimistically update
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old

        return {
          ...old,
          notifications: old.notifications?.map((n: Notification) => ({
            ...n,
            read: true,
            readAt: n.readAt || new Date().toISOString(),
          })),
          unreadCount: 0,
        }
      })

      // Update unread count
      queryClient.setQueryData(notificationKeys.unreadCount(), { count: 0 })

      return { previousNotifications }
    },
    onSuccess: (data) => {
      toast.success(t('notifications.allMarkedAsRead', `${data.count} notifications marked as read`))
    },
    onError: (error: Error, _variables, context) => {
      toast.error(error.message || t('notifications.markAllAsReadError', 'Failed to mark all as read'))

      // Rollback on error
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([key, value]) => {
          queryClient.setQueryData(key, value)
        })
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      invalidateCache.notifications.all()
    },
  })
}

// ==================== DELETE NOTIFICATIONS ====================

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      // Snapshot previous values
      const previousNotifications = queryClient.getQueriesData({ queryKey: notificationKeys.lists() })

      // Optimistically update
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (old: any) => {
        if (!old) return old

        const deletedNotification = old.notifications?.find((n: Notification) => n._id === id)
        const wasUnread = deletedNotification && !deletedNotification.read

        return {
          ...old,
          notifications: old.notifications?.filter((n: Notification) => n._id !== id),
          total: Math.max(0, (old.total || 0) - 1),
          unreadCount: wasUnread ? Math.max(0, (old.unreadCount || 0) - 1) : old.unreadCount,
        }
      })

      return { previousNotifications }
    },
    onSuccess: () => {
      toast.success(t('notifications.deleted', 'Notification deleted'))
    },
    onError: (error: Error, _id, context) => {
      toast.error(error.message || t('notifications.deleteError', 'Failed to delete notification'))

      // Rollback on error
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([key, value]) => {
          queryClient.setQueryData(key, value)
        })
      }
    },
    onSettled: () => {
      invalidateCache.notifications.all()
    },
  })
}

/**
 * Hook to delete multiple notifications
 */
export const useDeleteMultipleNotifications = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => notificationService.deleteMultipleNotifications(ids),
    onSuccess: (data) => {
      toast.success(t('notifications.deletedMultiple', `${data.count} notifications deleted`))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('notifications.deleteMultipleError', 'Failed to delete notifications'))
    },
    onSettled: () => {
      invalidateCache.notifications.all()
    },
  })
}

/**
 * Hook to clear all read notifications
 */
export const useClearReadNotifications = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => notificationService.clearReadNotifications(),
    onSuccess: (data) => {
      toast.success(t('notifications.clearedRead', `${data.count} read notifications cleared`))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('notifications.clearReadError', 'Failed to clear read notifications'))
    },
    onSettled: () => {
      invalidateCache.notifications.all()
    },
  })
}

// ==================== NOTIFICATION SETTINGS ====================

/**
 * Hook to get notification settings
 */
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: () => notificationService.getSettings(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Hook to update notification settings
 */
export const useUpdateNotificationSettings = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) => notificationService.updateSettings(settings),
    onSuccess: () => {
      toast.success(t('notifications.settingsUpdated', 'Notification settings updated'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('notifications.settingsUpdateError', 'Failed to update settings'))
    },
    onSettled: () => {
      invalidateCache.notifications.settings()
    },
  })
}

// ==================== CREATE NOTIFICATION (Admin) ====================

/**
 * Hook to create a notification (for admin/system use)
 */
export const useCreateNotification = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateNotificationData) => notificationService.createNotification(data),
    onSuccess: () => {
      toast.success(t('notifications.created', 'Notification created'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('notifications.createError', 'Failed to create notification'))
    },
    onSettled: () => {
      invalidateCache.notifications.all()
    },
  })
}

// Re-export types for convenience
export type { Notification, NotificationFilters, NotificationSettings }
