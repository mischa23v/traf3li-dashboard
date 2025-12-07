import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  successionPlanningApi,
  SuccessionPlan,
  type SuccessionPlanFilters,
  type CreateSuccessionPlanInput,
  type UpdateSuccessionPlanInput,
  type Successor
} from '@/services/successionPlanningService'
import { toast } from 'sonner'

// Query Keys
export const successionPlanningKeys = {
  all: ['succession-plans'] as const,
  lists: () => [...successionPlanningKeys.all, 'list'] as const,
  list: (filters?: SuccessionPlanFilters) => [...successionPlanningKeys.lists(), filters] as const,
  details: () => [...successionPlanningKeys.all, 'detail'] as const,
  detail: (id: string) => [...successionPlanningKeys.details(), id] as const,
  byPosition: (positionId: string) => [...successionPlanningKeys.all, 'by-position', positionId] as const,
  byIncumbent: (incumbentId: string) => [...successionPlanningKeys.all, 'by-incumbent', incumbentId] as const,
  reviewDue: () => [...successionPlanningKeys.all, 'review-due'] as const,
  highRisk: () => [...successionPlanningKeys.all, 'high-risk'] as const,
  criticalWithoutSuccessors: () => [...successionPlanningKeys.all, 'critical-without-successors'] as const,
  stats: (officeId?: string) => [...successionPlanningKeys.all, 'stats', officeId] as const
}

// ==================== QUERY HOOKS ====================

// Get all succession plans
export function useSuccessionPlans(filters?: SuccessionPlanFilters) {
  return useQuery({
    queryKey: successionPlanningKeys.list(filters),
    queryFn: () => successionPlanningApi.getAll(filters)
  })
}

// Get single succession plan
export function useSuccessionPlan(id: string) {
  return useQuery({
    queryKey: successionPlanningKeys.detail(id),
    queryFn: () => successionPlanningApi.getById(id),
    enabled: !!id
  })
}

// Get succession plans by position
export function useSuccessionPlansByPosition(positionId: string) {
  return useQuery({
    queryKey: successionPlanningKeys.byPosition(positionId),
    queryFn: () => successionPlanningApi.getByPosition(positionId),
    enabled: !!positionId
  })
}

// Get succession plans by incumbent
export function useSuccessionPlansByIncumbent(incumbentId: string) {
  return useQuery({
    queryKey: successionPlanningKeys.byIncumbent(incumbentId),
    queryFn: () => successionPlanningApi.getByIncumbent(incumbentId),
    enabled: !!incumbentId
  })
}

// Get plans requiring review
export function useSuccessionPlansReviewDue() {
  return useQuery({
    queryKey: successionPlanningKeys.reviewDue(),
    queryFn: () => successionPlanningApi.getReviewDue()
  })
}

// Get high-risk plans
export function useHighRiskSuccessionPlans() {
  return useQuery({
    queryKey: successionPlanningKeys.highRisk(),
    queryFn: () => successionPlanningApi.getHighRisk()
  })
}

// Get critical positions without successors
export function useCriticalWithoutSuccessors() {
  return useQuery({
    queryKey: successionPlanningKeys.criticalWithoutSuccessors(),
    queryFn: () => successionPlanningApi.getCriticalWithoutSuccessors()
  })
}

// Get succession planning statistics
export function useSuccessionPlanningStats(officeId?: string) {
  return useQuery({
    queryKey: successionPlanningKeys.stats(officeId),
    queryFn: () => successionPlanningApi.getStats(officeId)
  })
}

// ==================== MUTATION HOOKS ====================

// Create succession plan
export function useCreateSuccessionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSuccessionPlanInput) => successionPlanningApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم إنشاء خطة التعاقب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إنشاء خطة التعاقب: ${error.message}`)
    }
  })
}

// Update succession plan
export function useUpdateSuccessionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSuccessionPlanInput }) =>
      successionPlanningApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.detail(variables.id) })
      toast.success('تم تحديث خطة التعاقب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث خطة التعاقب: ${error.message}`)
    }
  })
}

// Delete succession plan
export function useDeleteSuccessionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => successionPlanningApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم حذف خطة التعاقب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف خطة التعاقب: ${error.message}`)
    }
  })
}

// Bulk delete succession plans
export function useBulkDeleteSuccessionPlans() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => successionPlanningApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم حذف خطط التعاقب المحددة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف خطط التعاقب: ${error.message}`)
    }
  })
}

// ==================== SUCCESSOR MUTATION HOOKS ====================

// Add successor to plan
export function useAddSuccessor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, successor }: { planId: string; successor: Omit<Successor, 'successorId'> }) =>
      successionPlanningApi.addSuccessor(planId, successor),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.detail(variables.planId) })
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم إضافة المرشح للتعاقب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إضافة المرشح: ${error.message}`)
    }
  })
}

// Update successor
export function useUpdateSuccessor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, successorId, data }: { planId: string; successorId: string; data: Partial<Successor> }) =>
      successionPlanningApi.updateSuccessor(planId, successorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.detail(variables.planId) })
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم تحديث بيانات المرشح بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث بيانات المرشح: ${error.message}`)
    }
  })
}

// Remove successor
export function useRemoveSuccessor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, successorId }: { planId: string; successorId: string }) =>
      successionPlanningApi.removeSuccessor(planId, successorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.detail(variables.planId) })
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم إزالة المرشح من خطة التعاقب')
    },
    onError: (error: Error) => {
      toast.error(`فشل إزالة المرشح: ${error.message}`)
    }
  })
}

// ==================== APPROVAL MUTATION HOOKS ====================

// Submit for approval
export function useSubmitForApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => successionPlanningApi.submitForApproval(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم تقديم خطة التعاقب للموافقة')
    },
    onError: (error: Error) => {
      toast.error(`فشل تقديم خطة التعاقب: ${error.message}`)
    }
  })
}

// Approve plan
export function useApproveSuccessionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      successionPlanningApi.approve(id, comments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم اعتماد خطة التعاقب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل اعتماد خطة التعاقب: ${error.message}`)
    }
  })
}

// Reject plan
export function useRejectSuccessionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      successionPlanningApi.reject(id, comments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: successionPlanningKeys.all })
      toast.success('تم رفض خطة التعاقب')
    },
    onError: (error: Error) => {
      toast.error(`فشل رفض خطة التعاقب: ${error.message}`)
    }
  })
}
