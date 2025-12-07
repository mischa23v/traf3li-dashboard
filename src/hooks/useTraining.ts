import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

// Query keys
export const trainingKeys = {
  all: ['trainings'] as const,
  lists: () => [...trainingKeys.all, 'list'] as const,
  list: (filters?: TrainingFilters) => [...trainingKeys.lists(), filters] as const,
  details: () => [...trainingKeys.all, 'detail'] as const,
  detail: (id: string) => [...trainingKeys.details(), id] as const,
  stats: () => [...trainingKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...trainingKeys.all, 'employee', employeeId] as const,
  pendingApprovals: () => [...trainingKeys.all, 'pending-approvals'] as const,
  upcoming: () => [...trainingKeys.all, 'upcoming'] as const,
  overdueCompliance: () => [...trainingKeys.all, 'overdue-compliance'] as const,
  cleSummary: (employeeId: string) => [...trainingKeys.all, 'cle-summary', employeeId] as const,
  calendar: (month: number, year: number) => [...trainingKeys.all, 'calendar', month, year] as const,
  providers: () => [...trainingKeys.all, 'providers'] as const,
}

// Get all trainings
export const useTrainings = (filters?: TrainingFilters) => {
  return useQuery({
    queryKey: trainingKeys.list(filters),
    queryFn: () => getTrainings(filters),
  })
}

// Get single training
export const useTraining = (trainingId: string) => {
  return useQuery({
    queryKey: trainingKeys.detail(trainingId),
    queryFn: () => getTraining(trainingId),
    enabled: !!trainingId,
  })
}

// Get training stats
export const useTrainingStats = () => {
  return useQuery({
    queryKey: trainingKeys.stats(),
    queryFn: getTrainingStats,
  })
}

// Get employee trainings
export const useEmployeeTrainings = (employeeId: string) => {
  return useQuery({
    queryKey: trainingKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeTrainings(employeeId),
    enabled: !!employeeId,
  })
}

// Get pending approvals
export const usePendingTrainingApprovals = () => {
  return useQuery({
    queryKey: trainingKeys.pendingApprovals(),
    queryFn: getPendingTrainingApprovals,
  })
}

// Get upcoming trainings
export const useUpcomingTrainings = () => {
  return useQuery({
    queryKey: trainingKeys.upcoming(),
    queryFn: getUpcomingTrainings,
  })
}

// Get overdue compliance trainings
export const useOverdueComplianceTrainings = () => {
  return useQuery({
    queryKey: trainingKeys.overdueCompliance(),
    queryFn: getOverdueComplianceTrainings,
  })
}

// Get CLE summary
export const useCLESummary = (employeeId: string) => {
  return useQuery({
    queryKey: trainingKeys.cleSummary(employeeId),
    queryFn: () => getCLESummary(employeeId),
    enabled: !!employeeId,
  })
}

// Get training calendar
export const useTrainingCalendar = (month: number, year: number) => {
  return useQuery({
    queryKey: trainingKeys.calendar(month, year),
    queryFn: () => getTrainingCalendar(month, year),
  })
}

// Get training providers
export const useTrainingProviders = () => {
  return useQuery({
    queryKey: trainingKeys.providers(),
    queryFn: getTrainingProviders,
  })
}

// Create training
export const useCreateTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTrainingData) => createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Update training
export const useUpdateTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trainingId, data }: { trainingId: string; data: UpdateTrainingData }) =>
      updateTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
    },
  })
}

// Delete training
export const useDeleteTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (trainingId: string) => deleteTraining(trainingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Submit training request
export const useSubmitTrainingRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (trainingId: string) => submitTrainingRequest(trainingId),
    onSuccess: (_, trainingId) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.pendingApprovals() })
    },
  })
}

// Approve training
export const useApproveTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { comments?: string; budgetApproved?: boolean; costCenter?: string }
    }) => approveTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Reject training
export const useRejectTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { reason: string; comments?: string }
    }) => rejectTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.pendingApprovals() })
    },
  })
}

// Enroll in training
export const useEnrollInTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data?: { registrationNumber?: string }
    }) => enrollInTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
    },
  })
}

// Start training
export const useStartTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (trainingId: string) => startTraining(trainingId),
    onSuccess: (_, trainingId) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Record attendance
export const useRecordAttendance = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
    },
  })
}

// Update progress
export const useUpdateProgress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { completedModules: number; timeSpent?: number }
    }) => updateProgress(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
    },
  })
}

// Submit assessment
export const useSubmitAssessment = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
    },
  })
}

// Complete training
export const useCompleteTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data?: { passed?: boolean; finalScore?: number; finalGrade?: string }
    }) => completeTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Issue certificate
export const useIssueCertificate = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
    },
  })
}

// Submit evaluation
export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Record payment
export const useRecordTrainingPayment = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
    },
  })
}

// Cancel training
export const useCancelTraining = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ trainingId, data }: {
      trainingId: string
      data: { reason: string }
    }) => cancelTraining(trainingId, data),
    onSuccess: (_, { trainingId }) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(trainingId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Bulk delete
export const useBulkDeleteTrainings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteTrainings(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingKeys.stats() })
    },
  })
}

// Export trainings
export const useExportTrainings = () => {
  return useMutation({
    mutationFn: (filters?: TrainingFilters) => exportTrainings(filters),
  })
}
