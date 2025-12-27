import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  getTrainingStats,
  submitTrainingRequest,
  approveTraining,
  rejectTraining,
  enrollInTraining,
  startTraining,
  recordAttendance,
  updateProgress,
  submitAssessment,
  completeTraining,
  issueCertificate,
  submitEvaluation,
  recordTrainingPayment,
  cancelTraining,
  bulkDeleteTrainings,
  getEmployeeTrainings,
  getPendingTrainingApprovals,
  getUpcomingTrainings,
  getOverdueComplianceTrainings,
  getCLESummary,
  getTrainingCalendar,
  getTrainingProviders,
  exportTrainings,
  type TrainingFilters,
  type CreateTrainingData,
  type UpdateTrainingData,
  type AssessmentType,
  type CertificateType,
} from '@/services/trainingService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Get all trainings
export const useTrainings = (filters?: TrainingFilters) => {
  return useQuery({
    queryKey: QueryKeys.training.list(filters),
    queryFn: () => getTrainings(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single training
export const useTraining = (trainingId: string) => {
  return useQuery({
    queryKey: QueryKeys.training.detail(trainingId),
    queryFn: () => getTraining(trainingId),
    enabled: !!trainingId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get training stats
export const useTrainingStats = () => {
  return useQuery({
    queryKey: QueryKeys.training.stats(),
    queryFn: getTrainingStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee trainings
export const useEmployeeTrainings = (employeeId: string) => {
  return useQuery({
    queryKey: QueryKeys.training.byEmployee(employeeId),
    queryFn: () => getEmployeeTrainings(employeeId),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get pending approvals
export const usePendingTrainingApprovals = () => {
  return useQuery({
    queryKey: QueryKeys.training.pendingApprovals(),
    queryFn: getPendingTrainingApprovals,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get upcoming trainings
export const useUpcomingTrainings = () => {
  return useQuery({
    queryKey: QueryKeys.training.upcoming(),
    queryFn: getUpcomingTrainings,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get overdue compliance trainings
export const useOverdueComplianceTrainings = () => {
  return useQuery({
    queryKey: QueryKeys.training.overdueCompliance(),
    queryFn: getOverdueComplianceTrainings,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get CLE summary
export const useCLESummary = (employeeId: string) => {
  return useQuery({
    queryKey: QueryKeys.training.cleSummary(employeeId),
    queryFn: () => getCLESummary(employeeId),
    enabled: !!employeeId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get training calendar
export const useTrainingCalendar = (month: number, year: number) => {
  return useQuery({
    queryKey: QueryKeys.training.calendar(month, year),
    queryFn: () => getTrainingCalendar(month, year),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get training providers
export const useTrainingProviders = () => {
  return useQuery({
    queryKey: QueryKeys.training.providers(),
    queryFn: getTrainingProviders,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create training
export const useCreateTraining = () => {
  return useMutation({
    mutationFn: (data: CreateTrainingData) => createTraining(data),
    onSuccess: () => {
      invalidateCache.training.lists()
      invalidateCache.training.stats()
    },
  })
}

// Update training
export const useUpdateTraining = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: { trainingId: string; data: UpdateTrainingData }) =>
      updateTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
    },
  })
}

// Delete training
export const useDeleteTraining = () => {
  return useMutation({
    mutationFn: (trainingId: string) => deleteTraining(trainingId),
    onSuccess: () => {
      invalidateCache.training.lists()
      invalidateCache.training.stats()
    },
  })
}

// Submit training request
export const useSubmitTrainingRequest = () => {
  return useMutation({
    mutationFn: (trainingId: string) => submitTrainingRequest(trainingId),
    onSuccess: (_, trainingId) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
      invalidateCache.training.pendingApprovals()
    },
  })
}

// Approve training
export const useApproveTraining = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { comments?: string; budgetApproved?: boolean; costCenter?: string }
    }) => approveTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
      invalidateCache.training.pendingApprovals()
      invalidateCache.training.stats()
    },
  })
}

// Reject training
export const useRejectTraining = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { reason: string; comments?: string }
    }) => rejectTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
      invalidateCache.training.pendingApprovals()
    },
  })
}

// Enroll in training
export const useEnrollInTraining = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data?: { registrationNumber?: string }
    }) => enrollInTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
    },
  })
}

// Start training
export const useStartTraining = () => {
  return useMutation({
    mutationFn: (trainingId: string) => startTraining(trainingId),
    onSuccess: (_, trainingId) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
      invalidateCache.training.stats()
    },
  })
}

// Record attendance
export const useRecordAttendance = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: {
        sessionNumber: number
        attended: boolean
        checkInTime?: string
        checkOutTime?: string
        notes?: string
      }
    }) => recordAttendance(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
    },
  })
}

// Update progress
export const useUpdateProgress = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { completedModules: number; timeSpent?: number }
    }) => updateProgress(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
    },
  })
}

// Submit assessment
export const useSubmitAssessment = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: {
        assessmentType: AssessmentType
        assessmentTitle: string
        score: number
        maxScore: number
        timeSpent?: number
      }
    }) => submitAssessment(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
    },
  })
}

// Complete training
export const useCompleteTraining = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data?: { passed?: boolean; finalScore?: number; finalGrade?: string }
    }) => completeTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
      invalidateCache.training.stats()
    },
  })
}

// Issue certificate
export const useIssueCertificate = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data?: {
        certificateType?: CertificateType
        validUntil?: string
        cleCredits?: number
        cpdPoints?: number
      }
    }) => issueCertificate(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
    },
  })
}

// Submit evaluation
export const useSubmitEvaluation = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: {
        ratings: {
          overallSatisfaction: number
          contentRelevance?: number
          contentQuality?: number
          instructorKnowledge?: number
          instructorEffectiveness?: number
          materialsQuality?: number
          recommendToOthers?: number
        }
        openEndedFeedback?: {
          whatWasGood?: string
          whatCouldImprove?: string
          additionalComments?: string
        }
      }
    }) => submitEvaluation(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.stats()
    },
  })
}

// Record payment
export const useRecordTrainingPayment = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: {
        amount: number
        paymentMethod: 'bank_transfer' | 'credit_card' | 'check' | 'invoice'
        paymentDate: string
        paymentReference?: string
      }
    }) => recordTrainingPayment(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
    },
  })
}

// Cancel training
export const useCancelTraining = () => {
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { reason: string }
    }) => cancelTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      invalidateCache.training.detail(trainingId)
      invalidateCache.training.lists()
      invalidateCache.training.stats()
    },
  })
}

// Bulk delete
export const useBulkDeleteTrainings = () => {
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteTrainings(ids),
    onSuccess: () => {
      invalidateCache.training.lists()
      invalidateCache.training.stats()
    },
  })
}

// Export trainings
export const useExportTrainings = () => {
  return useMutation({
    mutationFn: (filters?: TrainingFilters) => exportTrainings(filters),
  })
}
