/**
 * Budget Hooks
 * TanStack Query hooks for budget management
 *
 * Features:
 * - CRUD operations with optimistic updates
 * - Budget approval workflow
 * - Budget checking for expenses
 * - Statistics and reporting
 * - Automatic cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import budgetService from '@/services/budgetService'
import type {
  BudgetFilters,
  CreateBudgetData,
  UpdateBudgetData,
  UpdateBudgetLineData,
  BudgetCheckRequest,
  DistributionMethod,
} from '@/types/budget'

// ==================== CACHE CONFIGURATION ====================

const BUDGET_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes
const BUDGET_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes

// ==================== QUERY KEYS ====================

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (filters?: BudgetFilters) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  lines: (budgetId: string) => [...budgetKeys.detail(budgetId), 'lines'] as const,
  stats: (fiscalYear?: string) => [...budgetKeys.all, 'stats', fiscalYear] as const,
  vsActual: (budgetId: string) => [...budgetKeys.detail(budgetId), 'vs-actual'] as const,
}

// ==================== CACHE INVALIDATION HELPERS ====================

const invalidateBudgetCaches = async (queryClient: any) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: budgetKeys.all }),
    queryClient.invalidateQueries({ queryKey: ['finance-stats'] }), // Also invalidate finance stats
  ])
}

// ==================== QUERIES ====================

/**
 * Get all budgets with filtering
 */
export const useBudgets = (filters?: BudgetFilters) => {
  return useQuery({
    queryKey: budgetKeys.list(filters),
    queryFn: () => budgetService.getAllBudgets(filters),
    staleTime: BUDGET_STALE_TIME,
    gcTime: BUDGET_GC_TIME,
  })
}

/**
 * Get single budget by ID
 */
export const useBudget = (id: string) => {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => budgetService.getBudgetById(id),
    enabled: !!id,
    staleTime: BUDGET_STALE_TIME,
    gcTime: BUDGET_GC_TIME,
  })
}

/**
 * Get budget lines
 */
export const useBudgetLines = (budgetId: string) => {
  return useQuery({
    queryKey: budgetKeys.lines(budgetId),
    queryFn: () => budgetService.getBudgetLines(budgetId),
    enabled: !!budgetId,
    staleTime: BUDGET_STALE_TIME,
    gcTime: BUDGET_GC_TIME,
  })
}

/**
 * Get budget statistics
 */
export const useBudgetStats = (fiscalYear?: string) => {
  return useQuery({
    queryKey: budgetKeys.stats(fiscalYear),
    queryFn: () => budgetService.getBudgetStats(fiscalYear),
    staleTime: STATS_STALE_TIME,
    gcTime: BUDGET_GC_TIME,
  })
}

/**
 * Get budget vs actual report
 */
export const useBudgetVsActual = (budgetId: string) => {
  return useQuery({
    queryKey: budgetKeys.vsActual(budgetId),
    queryFn: () => budgetService.getBudgetVsActual(budgetId),
    enabled: !!budgetId,
    staleTime: BUDGET_STALE_TIME,
    gcTime: BUDGET_GC_TIME,
  })
}

// ==================== MUTATIONS ====================

/**
 * Create new budget
 */
export const useCreateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetData) => budgetService.createBudget(data),
    onSuccess: (response) => {
      toast.success('Budget created successfully | تم إنشاء الميزانية بنجاح')

      // Optimistic update to lists
      queryClient.setQueriesData({ queryKey: budgetKeys.lists() }, (old: any) => {
        if (!old) return old

        if (old.budgets && Array.isArray(old.budgets)) {
          return {
            ...old,
            budgets: [response.budget, ...old.budgets],
            total: (old.total || old.budgets.length) + 1,
          }
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget | فشل إنشاء الميزانية')
    },
    onSettled: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return await invalidateBudgetCaches(queryClient)
    },
  })
}

/**
 * Update budget
 */
export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetData }) =>
      budgetService.updateBudget(id, data),
    onSuccess: (response, variables) => {
      toast.success('Budget updated successfully | تم تحديث الميزانية بنجاح')

      // Update cache for this specific budget
      queryClient.setQueryData(budgetKeys.detail(variables.id), response)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget | فشل تحديث الميزانية')
    },
    onSettled: async (data, error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() }),
      ])
    },
  })
}

/**
 * Delete budget
 */
export const useDeleteBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      toast.success('Budget deleted successfully | تم حذف الميزانية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete budget | فشل حذف الميزانية')
    },
    onSettled: async () => {
      await invalidateBudgetCaches(queryClient)
    },
  })
}

/**
 * Submit budget for approval
 */
export const useSubmitBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetService.submitForApproval(id),
    onSuccess: (response, id) => {
      toast.success('Budget submitted for approval | تم إرسال الميزانية للاعتماد')

      // Update cache
      queryClient.setQueryData(budgetKeys.detail(id), response)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit budget | فشل إرسال الميزانية')
    },
    onSettled: async (data, error, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() }),
      ])
    },
  })
}

/**
 * Approve budget
 */
export const useApproveBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetService.approveBudget(id),
    onSuccess: (response, id) => {
      toast.success('Budget approved successfully | تم اعتماد الميزانية بنجاح')

      // Update cache
      queryClient.setQueryData(budgetKeys.detail(id), response)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve budget | فشل اعتماد الميزانية')
    },
    onSettled: async (data, error, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() }),
      ])
    },
  })
}

/**
 * Reject budget
 */
export const useRejectBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      budgetService.rejectBudget(id, reason),
    onSuccess: (response, variables) => {
      toast.success('Budget rejected | تم رفض الميزانية')

      // Update cache
      queryClient.setQueryData(budgetKeys.detail(variables.id), response)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject budget | فشل رفض الميزانية')
    },
    onSettled: async (data, error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() }),
      ])
    },
  })
}

/**
 * Close budget
 */
export const useCloseBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetService.closeBudget(id),
    onSuccess: (response, id) => {
      toast.success('Budget closed successfully | تم إغلاق الميزانية بنجاح')

      // Update cache
      queryClient.setQueryData(budgetKeys.detail(id), response)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to close budget | فشل إغلاق الميزانية')
    },
    onSettled: async (data, error, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() }),
      ])
    },
  })
}

/**
 * Update budget line
 */
export const useUpdateBudgetLine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      lineId,
      data,
    }: {
      budgetId: string
      lineId: string
      data: UpdateBudgetLineData
    }) => budgetService.updateBudgetLine(budgetId, lineId, data),
    onSuccess: (response, variables) => {
      toast.success('Budget line updated | تم تحديث بند الميزانية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget line | فشل تحديث بند الميزانية')
    },
    onSettled: async (data, error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.budgetId) }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.lines(variables.budgetId) }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.stats() }),
      ])
    },
  })
}

/**
 * Generate monthly distribution
 */
export const useGenerateDistribution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, method }: { budgetId: string; method: DistributionMethod }) =>
      budgetService.generateMonthlyDistribution(budgetId, method),
    onSuccess: (response, variables) => {
      toast.success('Monthly distribution generated | تم إنشاء التوزيع الشهري')

      // Update cache
      queryClient.setQueryData(budgetKeys.detail(variables.budgetId), response)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate distribution | فشل إنشاء التوزيع')
    },
    onSettled: async (data, error, variables) => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.budgetId) })
    },
  })
}

/**
 * Duplicate budget for new fiscal year
 */
export const useDuplicateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newFiscalYear }: { id: string; newFiscalYear: string }) =>
      budgetService.duplicateBudget(id, newFiscalYear),
    onSuccess: (response) => {
      toast.success('Budget duplicated successfully | تم نسخ الميزانية بنجاح')

      // Optimistic update to lists
      queryClient.setQueriesData({ queryKey: budgetKeys.lists() }, (old: any) => {
        if (!old) return old

        if (old.budgets && Array.isArray(old.budgets)) {
          return {
            ...old,
            budgets: [response.budget, ...old.budgets],
            total: (old.total || old.budgets.length) + 1,
          }
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate budget | فشل نسخ الميزانية')
    },
    onSettled: async () => {
      await invalidateBudgetCaches(queryClient)
    },
  })
}

/**
 * Check budget for expense validation
 * This is typically used inline in forms, not as a mutation
 */
export const useCheckBudget = (request: BudgetCheckRequest | null) => {
  return useQuery({
    queryKey: ['budget-check', request],
    queryFn: () => budgetService.checkBudget(request!),
    enabled: !!request && !!request.accountId && !!request.amount,
    staleTime: 0, // Always fresh check
    gcTime: 0, // Don't cache
  })
}

/**
 * Manual budget check (as mutation for programmatic usage)
 */
export const useCheckBudgetMutation = () => {
  return useMutation({
    mutationFn: (request: BudgetCheckRequest) => budgetService.checkBudget(request),
    // No toast on success/error since this is used for validation
  })
}
