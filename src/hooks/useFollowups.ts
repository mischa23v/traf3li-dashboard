import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import followupsService, {
  type FollowupFilters,
  type CreateFollowupData,
  type UpdateFollowupData,
  type FollowupEntityType,
} from '@/services/followupsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

// Query keys
export const followupsKeys = {
  all: ['followups'] as const,
  lists: () => [...followupsKeys.all, 'list'] as const,
  list: (filters: FollowupFilters) => [...followupsKeys.lists(), filters] as const,
  details: () => [...followupsKeys.all, 'detail'] as const,
  detail: (id: string) => [...followupsKeys.details(), id] as const,
  entity: (entityType: string, entityId: string) =>
    [...followupsKeys.all, 'entity', entityType, entityId] as const,
  stats: () => [...followupsKeys.all, 'stats'] as const,
  overdue: () => [...followupsKeys.all, 'overdue'] as const,
  upcoming: (days: number) => [...followupsKeys.all, 'upcoming', days] as const,
  today: () => [...followupsKeys.all, 'today'] as const,
}

// Get all follow-ups
export const useFollowups = (filters?: FollowupFilters) => {
  return useQuery({
    queryKey: followupsKeys.list(filters || {}),
    queryFn: () => followupsService.getFollowups(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get single follow-up
export const useFollowup = (id: string) => {
  return useQuery({
    queryKey: followupsKeys.detail(id),
    queryFn: () => followupsService.getFollowup(id),
    enabled: !!id,
  })
}

// Get follow-ups for entity
export const useFollowupsForEntity = (
  entityType: FollowupEntityType,
  entityId: string
) => {
  return useQuery({
    queryKey: followupsKeys.entity(entityType, entityId),
    queryFn: () => followupsService.getFollowupsForEntity(entityType, entityId),
    enabled: !!entityId,
  })
}

// Get follow-up stats
export const useFollowupStats = () => {
  return useQuery({
    queryKey: followupsKeys.stats(),
    queryFn: () => followupsService.getFollowupStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get overdue follow-ups
export const useOverdueFollowups = () => {
  return useQuery({
    queryKey: followupsKeys.overdue(),
    queryFn: () => followupsService.getOverdueFollowups(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Get upcoming follow-ups
export const useUpcomingFollowups = (days: number = 7) => {
  return useQuery({
    queryKey: followupsKeys.upcoming(days),
    queryFn: () => followupsService.getUpcomingFollowups(days),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get today's follow-ups
export const useTodayFollowups = () => {
  return useQuery({
    queryKey: followupsKeys.today(),
    queryFn: () => followupsService.getTodayFollowups(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Create follow-up
export const useCreateFollowup = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateFollowupData) => followupsService.createFollowup(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast({
        title: t('status.success'),
        description: t('followups.createSuccess'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: followupsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { followups: [...] } structure
        if (old.followups && Array.isArray(old.followups)) {
          return {
            ...old,
            followups: [data, ...old.followups]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: followupsKeys.all, refetchType: 'all' })
      return await queryClient.invalidateQueries({
        queryKey: followupsKeys.entity(variables.entityType, variables.entityId),
        refetchType: 'all'
      })
    },
  })
}

// Update follow-up
export const useUpdateFollowup = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFollowupData }) =>
      followupsService.updateFollowup(id, data),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: followupsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.detail(id) })
    },
  })
}

// Delete follow-up
export const useDeleteFollowup = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => followupsService.deleteFollowup(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: followupsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { followups: [...] } structure
        if (old.followups && Array.isArray(old.followups)) {
          return {
            ...old,
            followups: old.followups.filter((f: any) => f._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((f: any) => f._id !== id)
        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.all, refetchType: 'all' })
    },
  })
}

// Complete follow-up
export const useCompleteFollowup = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      followupsService.completeFollowup(id, notes),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('followups.completeSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: followupsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.detail(id) })
    },
  })
}

// Cancel follow-up
export const useCancelFollowup = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      followupsService.cancelFollowup(id, reason),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('followups.cancelSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: followupsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.detail(id) })
    },
  })
}

// Reschedule follow-up
export const useRescheduleFollowup = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      id,
      newDueDate,
      newDueTime,
      reason,
    }: {
      id: string
      newDueDate: string
      newDueTime?: string
      reason?: string
    }) => followupsService.rescheduleFollowup(id, newDueDate, newDueTime, reason),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('followups.rescheduleSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: followupsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.detail(id) })
    },
  })
}

// Add note to follow-up
export const useAddFollowupNote = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      followupsService.addFollowupNote(id, note),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('followups.noteAdded'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.detail(id) })
    },
  })
}

// Bulk complete follow-ups
export const useBulkCompleteFollowups = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => followupsService.bulkCompleteFollowups(ids),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('followups.bulkCompleteSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.all, refetchType: 'all' })
    },
  })
}

// Bulk delete follow-ups
export const useBulkDeleteFollowups = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => followupsService.bulkDeleteFollowups(ids),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, ids) => {
      toast({
        title: t('status.success'),
        description: t('followups.bulkDeleteSuccess'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: followupsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { followups: [...] } structure
        if (old.followups && Array.isArray(old.followups)) {
          return {
            ...old,
            followups: old.followups.filter((f: any) => !ids.includes(f._id))
          }
        }
        if (Array.isArray(old)) return old.filter((f: any) => !ids.includes(f._id))
        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: followupsKeys.all, refetchType: 'all' })
    },
  })
}
