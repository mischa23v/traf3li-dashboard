import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getGrievances,
  getGrievance,
  getGrievanceStats,
  getEmployeeGrievances,
  createGrievance,
  updateGrievance,
  deleteGrievance,
  bulkDeleteGrievances,
  startInvestigation,
  completeInvestigation,
  resolveGrievance,
  escalateGrievance,
  withdrawGrievance,
  closeGrievance,
  addTimelineEvent,
  addWitness,
  addEvidence,
  exportGrievances,
  type GrievanceFilters,
  type CreateGrievanceData,
  type UpdateGrievanceData,
  type TimelineEvent,
  type Witness,
  type Evidence,
  type ResolutionMethod,
  type OutcomeType,
} from '@/services/grievancesService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query keys
export const grievanceKeys = {
  all: ['grievances'] as const,
  lists: () => [...grievanceKeys.all, 'list'] as const,
  list: (filters?: GrievanceFilters) => [...grievanceKeys.lists(), filters] as const,
  details: () => [...grievanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...grievanceKeys.details(), id] as const,
  stats: () => [...grievanceKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...grievanceKeys.all, 'employee', employeeId] as const,
}

// Get all grievances
export const useGrievances = (filters?: GrievanceFilters) => {
  return useQuery({
    queryKey: grievanceKeys.list(filters),
    queryFn: () => getGrievances(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single grievance
export const useGrievance = (grievanceId: string) => {
  return useQuery({
    queryKey: grievanceKeys.detail(grievanceId),
    queryFn: () => getGrievance(grievanceId),
    enabled: !!grievanceId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get grievance stats
export const useGrievanceStats = () => {
  return useQuery({
    queryKey: grievanceKeys.stats(),
    queryFn: getGrievanceStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee grievances
export const useEmployeeGrievances = (employeeId: string) => {
  return useQuery({
    queryKey: grievanceKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeGrievances(employeeId),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create grievance
export const useCreateGrievance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGrievanceData) => createGrievance(data),
    onSuccess: () => {
      toast.success('تم تقديم الشكوى بنجاح')
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تقديم الشكوى')
    },
  })
}

// Update grievance
export const useUpdateGrievance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: UpdateGrievanceData }) =>
      updateGrievance(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم تحديث الشكوى بنجاح')
      invalidateCache.grievances.detail(grievanceId)
      invalidateCache.grievances.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الشكوى')
    },
  })
}

// Delete grievance
export const useDeleteGrievance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (grievanceId: string) => deleteGrievance(grievanceId),
    onSuccess: () => {
      toast.success('تم حذف الشكوى بنجاح')
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الشكوى')
    },
  })
}

// Bulk delete grievances
export const useBulkDeleteGrievances = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteGrievances(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} شكوى بنجاح`)
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الشكاوى')
    },
  })
}

// Start investigation
export const useStartInvestigation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: { investigatorName: string; investigatorType: string } }) =>
      startInvestigation(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم بدء التحقيق بنجاح')
      invalidateCache.grievances.detail(grievanceId)
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل بدء التحقيق')
    },
  })
}

// Complete investigation
export const useCompleteInvestigation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: { substantiated: boolean; findingsNarrative: string } }) =>
      completeInvestigation(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم إكمال التحقيق بنجاح')
      invalidateCache.grievances.detail(grievanceId)
      invalidateCache.grievances.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال التحقيق')
    },
  })
}

// Resolve grievance
export const useResolveGrievance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: {
      grievanceId: string
      data: {
        resolutionMethod: ResolutionMethod
        outcome: OutcomeType
        decisionSummary: string
        actionsTaken?: string[]
      }
    }) => resolveGrievance(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم حل الشكوى بنجاح')
      invalidateCache.grievances.detail(grievanceId)
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حل الشكوى')
    },
  })
}

// Escalate grievance
export const useEscalateGrievance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: { reason: string; escalateTo?: string } }) =>
      escalateGrievance(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم تصعيد الشكوى بنجاح')
      invalidateCache.grievances.detail(grievanceId)
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصعيد الشكوى')
    },
  })
}

// Withdraw grievance
export const useWithdrawGrievance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: { reason: string } }) =>
      withdrawGrievance(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم سحب الشكوى بنجاح')
      invalidateCache.grievances.detail(grievanceId)
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل سحب الشكوى')
    },
  })
}

// Close grievance
export const useCloseGrievance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data?: { notes?: string } }) =>
      closeGrievance(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم إغلاق الشكوى بنجاح')
      invalidateCache.grievances.detail(grievanceId)
      invalidateCache.grievances.lists()
      invalidateCache.grievances.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إغلاق الشكوى')
    },
  })
}

// Add timeline event
export const useAddTimelineEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: Omit<TimelineEvent, 'eventId'> }) =>
      addTimelineEvent(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم إضافة الحدث للجدول الزمني')
      invalidateCache.grievances.detail(grievanceId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الحدث')
    },
  })
}

// Add witness
export const useAddWitness = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: Omit<Witness, 'witnessId'> }) =>
      addWitness(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم إضافة الشاهد بنجاح')
      invalidateCache.grievances.detail(grievanceId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الشاهد')
    },
  })
}

// Add evidence
export const useAddEvidence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ grievanceId, data }: { grievanceId: string; data: Omit<Evidence, 'evidenceId'> }) =>
      addEvidence(grievanceId, data),
    onSuccess: (_, { grievanceId }) => {
      toast.success('تم إضافة الدليل بنجاح')
      invalidateCache.grievances.detail(grievanceId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الدليل')
    },
  })
}

// Export grievances
export const useExportGrievances = () => {
  return useMutation({
    mutationFn: (filters?: GrievanceFilters) => exportGrievances(filters),
    onSuccess: () => {
      toast.success('تم تصدير الشكاوى بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير الشكاوى')
    },
  })
}
