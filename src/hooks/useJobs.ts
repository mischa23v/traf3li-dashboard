/**
 * Jobs Hooks
 * TanStack Query hooks for jobs/services operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import jobsService, {
  Job,
  CreateJobData,
  UpdateJobData,
  JobFilters,
} from '@/services/jobsService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// ==================== QUERIES ====================

/**
 * Fetch all jobs (for browsing)
 */
export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsService.getJobs(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Fetch my jobs (jobs created by current user)
 */
export const useMyJobs = () => {
  return useQuery({
    queryKey: ['jobs', 'my-jobs'],
    queryFn: () => jobsService.getMyJobs(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Fetch single job by ID
 */
export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsService.getJob(id),
    enabled: !!id,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ==================== MUTATIONS ====================

/**
 * Create new job mutation
 */
export const useCreateJob = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateJobData) => jobsService.createJob(data),
    onSuccess: (data) => {
      toast.success(t('jobs.createSuccess', 'تم إنشاء الوظيفة بنجاح'))

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['jobs'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })

      // Update my-jobs cache
      queryClient.setQueriesData({ queryKey: ['jobs', 'my-jobs'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('jobs.createError', 'فشل إنشاء الوظيفة'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await queryClient.invalidateQueries({ queryKey: ['jobs'], refetchType: 'all' })
    },
  })
}

/**
 * Update job mutation
 */
export const useUpdateJob = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobData }) =>
      jobsService.updateJob(id, data),
    onSuccess: () => {
      toast.success(t('jobs.updateSuccess', 'تم تحديث الوظيفة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('jobs.updateError', 'فشل تحديث الوظيفة'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      await queryClient.invalidateQueries({ queryKey: ['jobs', 'my-jobs'] })
      return await queryClient.invalidateQueries({ queryKey: ['jobs', id] })
    },
  })
}

/**
 * Delete job mutation
 */
export const useDeleteJob = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => jobsService.deleteJob(id),
    onSuccess: (_, id) => {
      toast.success(t('jobs.deleteSuccess', 'تم حذف الوظيفة بنجاح'))

      // Manually update the caches
      queryClient.setQueriesData({ queryKey: ['jobs'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return old.filter((item: Job) => item._id !== id)
        return old
      })

      queryClient.setQueriesData({ queryKey: ['jobs', 'my-jobs'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return old.filter((item: Job) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('jobs.deleteError', 'فشل حذف الوظيفة'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await queryClient.invalidateQueries({ queryKey: ['jobs'], refetchType: 'all' })
    },
  })
}

/**
 * Calculate job statistics
 */
export const useJobStatistics = (jobs: Job[] | undefined) => {
  if (!jobs || !Array.isArray(jobs)) {
    return {
      total: 0,
      open: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      totalViews: 0,
      totalProposals: 0,
      avgRating: 0,
    }
  }

  return {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
    totalViews: jobs.reduce((sum, j) => sum + (j.views || 0), 0),
    totalProposals: jobs.reduce((sum, j) => sum + (j.proposalsCount || 0), 0),
    avgRating: 0, // Calculate when rating system is implemented
  }
}
