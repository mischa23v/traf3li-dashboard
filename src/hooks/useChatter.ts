/**
 * Chatter Hooks
 * React Query hooks for followers, activities, and file attachments
 *
 * ⚠️ IMPLEMENTATION STATUS: [BACKEND-PENDING]
 * These endpoints may not be fully implemented in the backend.
 * Error handling includes bilingual user-facing alerts.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import chatterService, {
  type Follower,
  type ScheduledActivity,
  type FileAttachment,
  type ActivityType,
  type CreateFollowerData,
  type CreateActivityData,
  type UpdateActivityData,
  type FollowersResponse,
  type ActivitiesResponse,
} from '@/services/chatterService'
import type { ThreadResModel } from '@/types/message'
import { toast } from 'sonner'

// ==================== Cache Configuration ====================
const FOLLOWERS_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const ACTIVITIES_STALE_TIME = 2 * 60 * 1000 // 2 minutes
const TYPES_STALE_TIME = 30 * 60 * 1000 // 30 minutes (rarely changes)
const GC_TIME = 30 * 60 * 1000 // 30 minutes

// ==================== QUERY KEYS ====================

export const chatterKeys = {
  all: ['chatter'] as const,
  followers: (resModel: ThreadResModel, resId: string) =>
    [...chatterKeys.all, 'followers', resModel, resId] as const,
  isFollowing: (resModel: ThreadResModel, resId: string) =>
    [...chatterKeys.all, 'isFollowing', resModel, resId] as const,
  activities: (resModel: ThreadResModel, resId: string, state?: string) =>
    [...chatterKeys.all, 'activities', resModel, resId, state] as const,
  myActivities: (state?: string) => [...chatterKeys.all, 'myActivities', state] as const,
  activityTypes: () => [...chatterKeys.all, 'activityTypes'] as const,
  attachments: (resModel: ThreadResModel, resId: string) =>
    [...chatterKeys.all, 'attachments', resModel, resId] as const,
}

// ==================== FOLLOWERS HOOKS ====================

/**
 * Get followers for a record
 */
export function useFollowers(resModel: ThreadResModel, resId: string, enabled = true) {
  return useQuery({
    queryKey: chatterKeys.followers(resModel, resId),
    queryFn: () => chatterService.getFollowers(resModel, resId),
    staleTime: FOLLOWERS_STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!resModel && !!resId && enabled,
  })
}

/**
 * Check if current user is following a record
 */
export function useIsFollowing(resModel: ThreadResModel, resId: string, enabled = true) {
  return useQuery({
    queryKey: chatterKeys.isFollowing(resModel, resId),
    queryFn: () => chatterService.isFollowing(resModel, resId),
    staleTime: FOLLOWERS_STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!resModel && !!resId && enabled,
  })
}

/**
 * Add a follower
 */
export function useAddFollower() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFollowerData) => chatterService.addFollower(data),
    onSuccess: (newFollower, variables) => {
      // Invalidate followers list
      queryClient.invalidateQueries({
        queryKey: chatterKeys.followers(variables.resModel, variables.resId),
      })
      // Invalidate isFollowing if it's the current user
      queryClient.invalidateQueries({
        queryKey: chatterKeys.isFollowing(variables.resModel, variables.resId),
      })
      toast.success('Follower added | تمت إضافة المتابع')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Remove a follower
 */
export function useRemoveFollower() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (followerId: string) => chatterService.removeFollower(followerId),
    onSuccess: () => {
      // Invalidate all follower queries
      queryClient.invalidateQueries({
        queryKey: chatterKeys.all,
      })
      toast.success('Follower removed | تمت إزالة المتابع')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Update follower preferences
 */
export function useUpdateFollowerPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      followerId,
      preferences,
    }: {
      followerId: string
      preferences: { email?: boolean; push?: boolean; sms?: boolean }
    }) => chatterService.updateFollowerPreferences(followerId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.all,
      })
      toast.success('Preferences updated | تم تحديث التفضيلات')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Toggle follow status for current user
 */
export function useToggleFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ resModel, resId }: { resModel: ThreadResModel; resId: string }) =>
      chatterService.toggleFollow(resModel, resId),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.followers(variables.resModel, variables.resId),
      })
      queryClient.invalidateQueries({
        queryKey: chatterKeys.isFollowing(variables.resModel, variables.resId),
      })
      toast.success(
        result.following
          ? 'Now following | تتم المتابعة الآن'
          : 'Unfollowed | تم إلغاء المتابعة'
      )
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

// ==================== ACTIVITIES HOOKS ====================

/**
 * Get activity types
 */
export function useActivityTypes(enabled = true) {
  return useQuery({
    queryKey: chatterKeys.activityTypes(),
    queryFn: () => chatterService.getActivityTypes(),
    staleTime: TYPES_STALE_TIME,
    gcTime: GC_TIME,
    enabled,
  })
}

/**
 * Get scheduled activities for a record
 */
export function useActivities(
  resModel: ThreadResModel,
  resId: string,
  state?: string,
  enabled = true
) {
  return useQuery({
    queryKey: chatterKeys.activities(resModel, resId, state),
    queryFn: () => chatterService.getActivities(resModel, resId, state),
    staleTime: ACTIVITIES_STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!resModel && !!resId && enabled,
  })
}

/**
 * Get activities assigned to current user
 */
export function useMyActivities(state?: string, limit?: number, enabled = true) {
  return useQuery({
    queryKey: chatterKeys.myActivities(state),
    queryFn: () => chatterService.getMyActivities(state, limit),
    staleTime: ACTIVITIES_STALE_TIME,
    gcTime: GC_TIME,
    enabled,
    refetchInterval: 60000, // Refresh every minute
  })
}

/**
 * Schedule a new activity
 */
export function useScheduleActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateActivityData) => chatterService.scheduleActivity(data),
    onSuccess: (newActivity, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.activities(variables.resModel, variables.resId),
      })
      queryClient.invalidateQueries({
        queryKey: chatterKeys.myActivities(),
      })
      toast.success('Activity scheduled | تم جدولة النشاط')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Update an activity
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: string; data: UpdateActivityData }) =>
      chatterService.updateActivity(activityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.all,
      })
      toast.success('Activity updated | تم تحديث النشاط')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Mark activity as done
 */
export function useMarkActivityDone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activityId, feedback }: { activityId: string; feedback?: string }) =>
      chatterService.markActivityDone(activityId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.all,
      })
      toast.success('Activity completed | تم إنجاز النشاط')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Cancel an activity
 */
export function useCancelActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) => chatterService.cancelActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.all,
      })
      toast.success('Activity cancelled | تم إلغاء النشاط')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

// ==================== FILE ATTACHMENTS HOOKS ====================

/**
 * Get attachments for a record
 */
export function useAttachments(resModel: ThreadResModel, resId: string, enabled = true) {
  return useQuery({
    queryKey: chatterKeys.attachments(resModel, resId),
    queryFn: () => chatterService.getAttachments(resModel, resId),
    staleTime: FOLLOWERS_STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!resModel && !!resId && enabled,
  })
}

/**
 * Upload a single attachment
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      resModel,
      resId,
    }: {
      file: File
      resModel: ThreadResModel
      resId: string
    }) => chatterService.uploadAttachment(file, resModel, resId),
    onSuccess: (newAttachment, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.attachments(variables.resModel, variables.resId),
      })
      toast.success('File uploaded | تم رفع الملف')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Upload multiple attachments
 */
export function useUploadAttachments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      files,
      resModel,
      resId,
    }: {
      files: File[]
      resModel: ThreadResModel
      resId: string
    }) => chatterService.uploadAttachments(files, resModel, resId),
    onSuccess: (newAttachments, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.attachments(variables.resModel, variables.resId),
      })
      toast.success(`${newAttachments.length} files uploaded | تم رفع ${newAttachments.length} ملف`)
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

/**
 * Delete an attachment
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: string) => chatterService.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatterKeys.all,
      })
      toast.success('Attachment deleted | تم حذف المرفق')
    },
    onError: () => {
      // Error already handled by service with bilingual message
    },
  })
}

// ==================== EXPORTS ====================

export type {
  Follower,
  ScheduledActivity,
  FileAttachment,
  ActivityType,
  CreateFollowerData,
  CreateActivityData,
  UpdateActivityData,
  FollowersResponse,
  ActivitiesResponse,
}
