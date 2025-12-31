/**
 * Odoo-style Activity Hooks
 * React Query hooks for activity scheduling and management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
import odooActivityService from '@/services/odooActivityService'
import type {
  OdooActivity,
  OdooActivityType,
  OdooActivityStats,
  OdooActivityFilters,
  OdooActivityResponse,
  CreateOdooActivityData,
  UpdateOdooActivityData,
  CreateOdooActivityTypeData,
  MarkActivityDoneData,
  RescheduleActivityData,
  ReassignActivityData,
  OdooActivityResModel,
} from '@/types/activity'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes

// ==================== QUERY KEYS ====================

export const odooActivityKeys = {
  all: ['odoo-activities'] as const,
  types: () => [...odooActivityKeys.all, 'types'] as const,
  stats: () => [...odooActivityKeys.all, 'stats'] as const,
  lists: () => [...odooActivityKeys.all, 'list'] as const,
  list: (filters?: OdooActivityFilters) => [...odooActivityKeys.lists(), filters] as const,
  my: (filters?: Pick<OdooActivityFilters, 'state' | 'date_from' | 'date_to'>) =>
    [...odooActivityKeys.all, 'my', filters] as const,
  record: (resModel: OdooActivityResModel, resId: string) =>
    [...odooActivityKeys.all, 'record', resModel, resId] as const,
  detail: (id: string) => [...odooActivityKeys.all, 'detail', id] as const,
}

// ==================== ACTIVITY TYPE QUERIES ====================

/**
 * Get all activity types
 */
export function useActivityTypes(enabled = true) {
  return useQuery({
    queryKey: odooActivityKeys.types(),
    queryFn: odooActivityService.getActivityTypes,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Create activity type mutation
 */
export function useCreateActivityType() {
  

  return useMutation({
    mutationFn: (data: CreateOdooActivityTypeData) =>
      odooActivityService.createActivityType(data),
    onSuccess: () => {
      invalidateCache.odooActivities.types()
    },
  })
}

/**
 * Update activity type mutation
 */
export function useUpdateActivityType() {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOdooActivityTypeData> }) =>
      odooActivityService.updateActivityType(id, data),
    onSuccess: () => {
      invalidateCache.odooActivities.types()
    },
  })
}

/**
 * Delete activity type mutation
 */
export function useDeleteActivityType() {
  

  return useMutation({
    mutationFn: (id: string) => odooActivityService.deleteActivityType(id),
    onSuccess: () => {
      invalidateCache.odooActivities.types()
    },
  })
}

// ==================== ACTIVITY QUERIES ====================

/**
 * Get activities with filters
 */
export function useOdooActivities(filters?: OdooActivityFilters, enabled = true) {
  return useQuery({
    queryKey: odooActivityKeys.list(filters),
    queryFn: () => odooActivityService.getActivities(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get current user's activities
 */
export function useMyActivities(
  filters?: Pick<OdooActivityFilters, 'state' | 'date_from' | 'date_to' | 'page' | 'limit'>,
  enabled = true
) {
  return useQuery({
    queryKey: odooActivityKeys.my(filters),
    queryFn: () => odooActivityService.getMyActivities(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get activity statistics
 */
export function useActivityStats(enabled = true) {
  return useQuery({
    queryKey: odooActivityKeys.stats(),
    queryFn: odooActivityService.getActivityStats,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
    refetchInterval: 60000, // Refresh every minute
  })
}

/**
 * Get activities for a specific record
 */
export function useRecordActivities(
  resModel: OdooActivityResModel,
  resId: string,
  state?: string,
  enabled = true
) {
  return useQuery({
    queryKey: odooActivityKeys.record(resModel, resId),
    queryFn: () => odooActivityService.getRecordActivities(resModel, resId, state),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled: !!resModel && !!resId && enabled,
  })
}

/**
 * Get a single activity by ID
 */
export function useActivityById(id: string, enabled = true) {
  return useQuery({
    queryKey: odooActivityKeys.detail(id),
    queryFn: () => odooActivityService.getActivityById(id),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled: !!id && enabled,
  })
}

// ==================== ACTIVITY MUTATIONS ====================

/**
 * Schedule a new activity
 */
export function useScheduleActivity() {
  

  return useMutation({
    mutationFn: (data: CreateOdooActivityData) => odooActivityService.scheduleActivity(data),
    onSuccess: (newActivity) => {
      // Invalidate all relevant queries
      invalidateCache.odooActivities.lists()
      invalidateCache.odooActivities.stats()
      invalidateCache.odooActivities.my()
      if (newActivity.res_model && newActivity.res_id) {
        invalidateCache.odooActivities.record(
          newActivity.res_model,
          String(newActivity.res_id)
        )
      }
    },
  })
}

/**
 * Update an activity
 */
export function useUpdateOdooActivity() {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOdooActivityData }) =>
      odooActivityService.updateActivity(id, data),
    onSuccess: (updatedActivity, { id }) => {
      invalidateCache.odooActivities.detail(id)
      invalidateCache.odooActivities.lists()
      invalidateCache.odooActivities.my()
      if (updatedActivity.res_model && updatedActivity.res_id) {
        invalidateCache.odooActivities.record(
          queryKey: odooActivityKeys.record(
            updatedActivity.res_model as OdooActivityResModel,
            updatedActivity.res_id
          ),
        })
      }
    },
  })
}

/**
 * Mark activity as done
 */
export function useMarkActivityDone() {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: MarkActivityDoneData }) =>
      odooActivityService.markActivityDone(id, data),
    onSuccess: (doneActivity, { id }) => {
      invalidateCache.odooActivities.detail(id)
      invalidateCache.odooActivities.lists()
      invalidateCache.odooActivities.stats()
      invalidateCache.odooActivities.my()
      if (doneActivity.res_model && doneActivity.res_id) {
        invalidateCache.odooActivities.record(
          queryKey: odooActivityKeys.record(
            doneActivity.res_model as OdooActivityResModel,
            doneActivity.res_id
          ),
        })
      }
    },
  })
}

/**
 * Cancel an activity
 */
export function useCancelActivity() {
  

  return useMutation({
    mutationFn: (id: string) => odooActivityService.cancelActivity(id),
    onSuccess: (cancelledActivity, id) => {
      invalidateCache.odooActivities.detail(id)
      invalidateCache.odooActivities.lists()
      invalidateCache.odooActivities.stats()
      invalidateCache.odooActivities.my()
      if (cancelledActivity.res_model && cancelledActivity.res_id) {
        invalidateCache.odooActivities.record(
          queryKey: odooActivityKeys.record(
            cancelledActivity.res_model as OdooActivityResModel,
            cancelledActivity.res_id
          ),
        })
      }
    },
  })
}

/**
 * Reschedule an activity
 */
export function useRescheduleActivity() {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleActivityData }) =>
      odooActivityService.rescheduleActivity(id, data),
    onSuccess: (rescheduledActivity, { id }) => {
      invalidateCache.odooActivities.detail(id)
      invalidateCache.odooActivities.lists()
      invalidateCache.odooActivities.my()
      if (rescheduledActivity.res_model && rescheduledActivity.res_id) {
        invalidateCache.odooActivities.record(
          queryKey: odooActivityKeys.record(
            rescheduledActivity.res_model as OdooActivityResModel,
            rescheduledActivity.res_id
          ),
        })
      }
    },
  })
}

/**
 * Reassign an activity to another user
 */
export function useReassignActivity() {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReassignActivityData }) =>
      odooActivityService.reassignActivity(id, data),
    onSuccess: (reassignedActivity, { id }) => {
      invalidateCache.odooActivities.detail(id)
      invalidateCache.odooActivities.lists()
      invalidateCache.odooActivities.my()
      if (reassignedActivity.res_model && reassignedActivity.res_id) {
        invalidateCache.odooActivities.record(
          queryKey: odooActivityKeys.record(
            reassignedActivity.res_model as OdooActivityResModel,
            reassignedActivity.res_id
          ),
        })
      }
    },
  })
}

/**
 * Delete an activity
 */
export function useDeleteOdooActivity() {
  

  return useMutation({
    mutationFn: (id: string) => odooActivityService.deleteActivity(id),
    onSuccess: () => {
      invalidateCache.odooActivities.lists()
      invalidateCache.odooActivities.stats()
      invalidateCache.odooActivities.my()
    },
  })
}

// ==================== EXPORTS ====================

export type {
  OdooActivity,
  OdooActivityType,
  OdooActivityStats,
  OdooActivityFilters,
  OdooActivityResponse,
  CreateOdooActivityData,
  UpdateOdooActivityData,
  MarkActivityDoneData,
  RescheduleActivityData,
  ReassignActivityData,
}
