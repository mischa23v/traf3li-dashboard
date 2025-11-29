/**
 * Evaluation Hooks
 * React Query hooks for Performance Evaluation management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { evaluationService } from '@/services/hrService'
import type {
  EvaluationFilters,
  CreateEvaluationData,
  Evaluation,
  EvaluationGoal,
  EvaluationCompetency,
} from '@/types/hr'

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all evaluations with optional filters
 */
export const useEvaluations = (filters?: EvaluationFilters) => {
  return useQuery({
    queryKey: ['evaluations', filters],
    queryFn: () => evaluationService.getEvaluations(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single evaluation
 */
export const useEvaluation = (evaluationId: string) => {
  return useQuery({
    queryKey: ['evaluations', evaluationId],
    queryFn: () => evaluationService.getEvaluation(evaluationId),
    enabled: !!evaluationId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get pending evaluations
 */
export const usePendingEvaluations = () => {
  return useQuery({
    queryKey: ['evaluations', 'pending'],
    queryFn: () => evaluationService.getPendingEvaluations(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get evaluation statistics
 */
export const useEvaluationStats = () => {
  return useQuery({
    queryKey: ['evaluations', 'stats'],
    queryFn: () => evaluationService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get employee evaluation history
 */
export const useEmployeeEvaluationHistory = (employeeId: string) => {
  return useQuery({
    queryKey: ['evaluations', 'employee', employeeId, 'history'],
    queryFn: () => evaluationService.getEmployeeHistory(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create evaluation
 */
export const useCreateEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEvaluationData) =>
      evaluationService.createEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      toast.success('تم إنشاء التقييم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء التقييم')
    },
  })
}

/**
 * Update evaluation
 */
export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      evaluationId,
      data,
    }: {
      evaluationId: string
      data: Partial<Evaluation>
    }) => evaluationService.updateEvaluation(evaluationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.evaluationId],
      })
      toast.success('تم تحديث التقييم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التقييم')
    },
  })
}

/**
 * Delete evaluation
 */
export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evaluationId: string) =>
      evaluationService.deleteEvaluation(evaluationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      toast.success('تم حذف التقييم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التقييم')
    },
  })
}

/**
 * Add goal
 */
export const useAddEvaluationGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      evaluationId,
      data,
    }: {
      evaluationId: string
      data: Omit<EvaluationGoal, '_id'>
    }) => evaluationService.addGoal(evaluationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.evaluationId],
      })
      toast.success('تم إضافة الهدف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الهدف')
    },
  })
}

/**
 * Update goal
 */
export const useUpdateEvaluationGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      evaluationId,
      goalId,
      data,
    }: {
      evaluationId: string
      goalId: string
      data: Partial<EvaluationGoal>
    }) => evaluationService.updateGoal(evaluationId, goalId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.evaluationId],
      })
      toast.success('تم تحديث الهدف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الهدف')
    },
  })
}

/**
 * Add competency
 */
export const useAddEvaluationCompetency = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      evaluationId,
      data,
    }: {
      evaluationId: string
      data: Omit<EvaluationCompetency, '_id'>
    }) => evaluationService.addCompetency(evaluationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.evaluationId],
      })
      toast.success('تم إضافة الكفاءة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الكفاءة')
    },
  })
}

/**
 * Add 360 feedback
 */
export const useAddFeedback360 = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      evaluationId,
      data,
    }: {
      evaluationId: string
      data: {
        reviewerId: string
        relationship: string
        ratings: any[]
        overallComments?: string
      }
    }) => evaluationService.addFeedback360(evaluationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.evaluationId],
      })
      toast.success('تم إضافة التقييم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة التقييم')
    },
  })
}

/**
 * Submit self-assessment
 */
export const useSubmitSelfAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      evaluationId,
      data,
    }: {
      evaluationId: string
      data: {
        goalsComments?: string
        competenciesComments?: string
        overallComments?: string
      }
    }) => evaluationService.submitSelfAssessment(evaluationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['evaluations', variables.evaluationId],
      })
      queryClient.invalidateQueries({ queryKey: ['evaluations', 'pending'] })
      toast.success('تم تقديم التقييم الذاتي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تقديم التقييم الذاتي')
    },
  })
}

/**
 * Submit evaluation for review
 */
export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evaluationId: string) =>
      evaluationService.submitEvaluation(evaluationId),
    onSuccess: (_, evaluationId) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({
        queryKey: ['evaluations', evaluationId],
      })
      toast.success('تم تقديم التقييم للمراجعة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تقديم التقييم')
    },
  })
}

/**
 * Complete evaluation
 */
export const useCompleteEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evaluationId: string) =>
      evaluationService.completeEvaluation(evaluationId),
    onSuccess: (_, evaluationId) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({
        queryKey: ['evaluations', evaluationId],
      })
      toast.success('تم إكمال التقييم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال التقييم')
    },
  })
}

/**
 * Acknowledge evaluation
 */
export const useAcknowledgeEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evaluationId: string) =>
      evaluationService.acknowledgeEvaluation(evaluationId),
    onSuccess: (_, evaluationId) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({
        queryKey: ['evaluations', evaluationId],
      })
      toast.success('تم الإقرار بالتقييم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الإقرار بالتقييم')
    },
  })
}
