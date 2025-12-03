/**
 * Activity Hooks
 * React Query hooks for activity management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import activityService, {
  type Activity,
  type ActivityFilters,
  type ActivityResponse,
  type ActivityEntityType,
  type ActivityType,
  type CreateActivityInput,
} from '@/services/activityService'

// ==================== QUERY KEYS ====================

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: ActivityFilters) => [...activityKeys.lists(), filters] as const,
  entity: (entityType: ActivityEntityType, entityId: string) =>
    [...activityKeys.all, 'entity', entityType, entityId] as const,
  recent: (limit?: number) => [...activityKeys.all, 'recent', limit] as const,
}

// ==================== QUERIES ====================

/**
 * Get activities with optional filters
 */
export function useActivities(filters?: ActivityFilters) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => activityService.getAll(filters),
  })
}

/**
 * Get activities for a specific entity (task, event, reminder)
 */
export function useEntityActivities(
  entityType: ActivityEntityType,
  entityId: string,
  limit = 50
) {
  return useQuery({
    queryKey: activityKeys.entity(entityType, entityId),
    queryFn: () => activityService.getByEntity(entityType, entityId, limit),
    enabled: !!entityId,
  })
}

/**
 * Get recent activities for the current user
 */
export function useRecentActivities(limit = 20) {
  return useQuery({
    queryKey: activityKeys.recent(limit),
    queryFn: () => activityService.getRecent(limit),
  })
}

/**
 * Get task activities
 */
export function useTaskActivities(taskId: string, limit = 50) {
  return useEntityActivities('task', taskId, limit)
}

/**
 * Get event activities
 */
export function useEventActivities(eventId: string, limit = 50) {
  return useEntityActivities('event', eventId, limit)
}

/**
 * Get reminder activities
 */
export function useReminderActivities(reminderId: string, limit = 50) {
  return useEntityActivities('reminder', reminderId, limit)
}

// ==================== MUTATIONS ====================

/**
 * Create a new activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateActivityInput) => activityService.create(input),
    // Update cache on success (Stable & Correct)
    onSuccess: (newActivity) => {
      // Manually update the cache for lists
      queryClient.setQueriesData({ queryKey: activityKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { activities: [...] } structure
        if (old.activities && Array.isArray(old.activities)) {
          return {
            ...old,
            activities: [newActivity, ...old.activities]
          }
        }
        if (Array.isArray(old)) return [newActivity, ...old]
        return old
      })
    },
    onSettled: async (newActivity) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Invalidate relevant queries
      if (newActivity) {
        await queryClient.invalidateQueries({ queryKey: activityKeys.lists(), refetchType: 'all' })
        await queryClient.invalidateQueries({
          queryKey: activityKeys.entity(newActivity.entityType, newActivity.entityId),
          refetchType: 'all'
        })
        return await queryClient.invalidateQueries({ queryKey: activityKeys.recent(), refetchType: 'all' })
      }
    },
  })
}

/**
 * Log a task activity
 */
export function useLogTaskActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      type,
      taskTitle,
      metadata,
      oldValue,
      newValue,
    }: {
      taskId: string
      type: ActivityType
      taskTitle?: string
      metadata?: Record<string, any>
      oldValue?: any
      newValue?: any
    }) =>
      activityService.logTaskActivity(taskId, type, taskTitle, metadata, oldValue, newValue),
    onSettled: async (newActivity, _, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (newActivity) {
        await queryClient.invalidateQueries({
          queryKey: activityKeys.entity('task', variables.taskId),
          refetchType: 'all'
        })
        return await queryClient.invalidateQueries({ queryKey: activityKeys.recent(), refetchType: 'all' })
      }
    },
  })
}

/**
 * Log an event activity
 */
export function useLogEventActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      type,
      eventTitle,
      metadata,
    }: {
      eventId: string
      type: ActivityType
      eventTitle?: string
      metadata?: Record<string, any>
    }) => activityService.logEventActivity(eventId, type, eventTitle, metadata),
    onSettled: async (newActivity, _, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (newActivity) {
        await queryClient.invalidateQueries({
          queryKey: activityKeys.entity('event', variables.eventId),
          refetchType: 'all'
        })
        return await queryClient.invalidateQueries({ queryKey: activityKeys.recent(), refetchType: 'all' })
      }
    },
  })
}

/**
 * Log a reminder activity
 */
export function useLogReminderActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reminderId,
      type,
      reminderTitle,
      metadata,
    }: {
      reminderId: string
      type: ActivityType
      reminderTitle?: string
      metadata?: Record<string, any>
    }) => activityService.logReminderActivity(reminderId, type, reminderTitle, metadata),
    onSettled: async (newActivity, _, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (newActivity) {
        await queryClient.invalidateQueries({
          queryKey: activityKeys.entity('reminder', variables.reminderId),
          refetchType: 'all'
        })
        return await queryClient.invalidateQueries({ queryKey: activityKeys.recent(), refetchType: 'all' })
      }
    },
  })
}

// ==================== EXPORTS ====================

export type {
  Activity,
  ActivityFilters,
  ActivityResponse,
  ActivityEntityType,
  ActivityType,
  CreateActivityInput,
}
