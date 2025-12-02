import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  matterBudgetService,
  type MatterBudget,
  type BudgetStatus,
  type BudgetType,
  type BudgetPhase,
  type BudgetCategory,
  type BudgetTask,
} from '@/services/matterBudgetService'

// Query key factory
export const matterBudgetKeys = {
  all: ['matter-budgets'] as const,
  lists: () => [...matterBudgetKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...matterBudgetKeys.lists(), filters] as const,
  details: () => [...matterBudgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...matterBudgetKeys.details(), id] as const,
  matter: (matterId: string) => [...matterBudgetKeys.all, 'matter', matterId] as const,
  entries: (budgetId: string, filters?: Record<string, unknown>) =>
    [...matterBudgetKeys.all, 'entries', budgetId, filters] as const,
  summary: (filters?: Record<string, unknown>) =>
    [...matterBudgetKeys.all, 'summary', filters] as const,
  comparison: (budgetId: string, groupBy?: string) =>
    [...matterBudgetKeys.all, 'comparison', budgetId, groupBy] as const,
  templates: () => [...matterBudgetKeys.all, 'templates'] as const,
}

// Budgets
export function useMatterBudgets(params?: {
  matterId?: string
  clientId?: string
  status?: BudgetStatus
  type?: BudgetType
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: matterBudgetKeys.list(params),
    queryFn: () => matterBudgetService.getBudgets(params),
  })
}

export function useMatterBudget(id: string) {
  return useQuery({
    queryKey: matterBudgetKeys.detail(id),
    queryFn: () => matterBudgetService.getBudget(id),
    enabled: !!id,
  })
}

export function useMatterBudgetByMatter(matterId: string) {
  return useQuery({
    queryKey: matterBudgetKeys.matter(matterId),
    queryFn: () => matterBudgetService.getMatterBudget(matterId),
    enabled: !!matterId,
  })
}

export function useCreateMatterBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<
        MatterBudget,
        | '_id'
        | 'usedAmount'
        | 'remainingAmount'
        | 'percentUsed'
        | 'alerts'
        | 'createdAt'
        | 'updatedAt'
      >
    ) => matterBudgetService.createBudget(data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.matter(variables.matterId),
      })
    },
  })
}

export function useUpdateMatterBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MatterBudget> }) =>
      matterBudgetService.updateBudget(id, data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.detail(variables.id) })
    },
  })
}

export function useDeleteMatterBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => matterBudgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
    },
  })
}

// Budget Status
export function useApproveBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      matterBudgetService.approveBudget(id, notes),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.detail(variables.id) })
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
    },
  })
}

export function useActivateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => matterBudgetService.activateBudget(id),
    onSuccess: (_, id) => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.detail(id) })
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
    },
  })
}

export function useCompleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => matterBudgetService.completeBudget(id),
    onSuccess: (_, id) => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.detail(id) })
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
    },
  })
}

export function useCancelBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      matterBudgetService.cancelBudget(id, reason),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.detail(variables.id) })
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
    },
  })
}

// Budget Phases
export function useAddBudgetPhase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      phase,
    }: {
      budgetId: string
      phase: Omit<BudgetPhase, '_id' | 'usedAmount' | 'remainingAmount' | 'percentUsed'>
    }) => matterBudgetService.addPhase(budgetId, phase),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

export function useUpdateBudgetPhase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      phaseId,
      data,
    }: {
      budgetId: string
      phaseId: string
      data: Partial<BudgetPhase>
    }) => matterBudgetService.updatePhase(budgetId, phaseId, data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

export function useDeleteBudgetPhase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, phaseId }: { budgetId: string; phaseId: string }) =>
      matterBudgetService.deletePhase(budgetId, phaseId),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

// Budget Categories
export function useAddBudgetCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      category,
    }: {
      budgetId: string
      category: Omit<BudgetCategory, '_id' | 'usedAmount' | 'remainingAmount' | 'percentUsed'>
    }) => matterBudgetService.addCategory(budgetId, category),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      categoryId,
      data,
    }: {
      budgetId: string
      categoryId: string
      data: Partial<BudgetCategory>
    }) => matterBudgetService.updateCategory(budgetId, categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, categoryId }: { budgetId: string; categoryId: string }) =>
      matterBudgetService.deleteCategory(budgetId, categoryId),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

// Budget Tasks
export function useAddBudgetTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      phaseId,
      task,
    }: {
      budgetId: string
      phaseId: string
      task: Omit<BudgetTask, '_id' | 'actualHours' | 'actualAmount'>
    }) => matterBudgetService.addTask(budgetId, phaseId, task),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

export function useUpdateBudgetTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      phaseId,
      taskId,
      data,
    }: {
      budgetId: string
      phaseId: string
      taskId: string
      data: Partial<BudgetTask>
    }) => matterBudgetService.updateTask(budgetId, phaseId, taskId, data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

export function useDeleteBudgetTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      phaseId,
      taskId,
    }: {
      budgetId: string
      phaseId: string
      taskId: string
    }) => matterBudgetService.deleteTask(budgetId, phaseId, taskId),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

// Budget Entries
export function useBudgetEntries(
  budgetId: string,
  params?: {
    phaseId?: string
    categoryId?: string
    entryType?: 'time' | 'expense'
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }
) {
  return useQuery({
    queryKey: matterBudgetKeys.entries(budgetId, params),
    queryFn: () => matterBudgetService.getBudgetEntries(budgetId, params),
    enabled: !!budgetId,
  })
}

// Budget Alerts
export function useAcknowledgeBudgetAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, alertId }: { budgetId: string; alertId: string }) =>
      matterBudgetService.acknowledgeAlert(budgetId, alertId),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

export function useUpdateAlertThresholds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      budgetId,
      thresholds,
    }: {
      budgetId: string
      thresholds: { warning: number; critical: number }
    }) => matterBudgetService.updateAlertThresholds(budgetId, thresholds),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.detail(variables.budgetId),
      })
    },
  })
}

// Summary & Reports
export function useBudgetSummary(params?: {
  clientId?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: matterBudgetKeys.summary(params),
    queryFn: () => matterBudgetService.getBudgetSummary(params),
  })
}

export function useBudgetComparison(
  budgetId: string,
  groupBy?: 'month' | 'quarter' | 'phase' | 'category'
) {
  return useQuery({
    queryKey: matterBudgetKeys.comparison(budgetId, groupBy),
    queryFn: () =>
      matterBudgetService.getBudgetComparison(budgetId, groupBy ? { groupBy } : undefined),
    enabled: !!budgetId,
  })
}

export function useExportBudget() {
  return useMutation({
    mutationFn: ({ budgetId, format }: { budgetId: string; format: 'pdf' | 'xlsx' }) =>
      matterBudgetService.exportBudget(budgetId, format),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `budget-${variables.budgetId}.${variables.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
  })
}

// Templates
export function useBudgetTemplates() {
  return useQuery({
    queryKey: matterBudgetKeys.templates(),
    queryFn: () => matterBudgetService.getBudgetTemplates(),
  })
}

export function useCreateBudgetFromTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      matterId,
      totalBudget,
    }: {
      templateId: string
      matterId: string
      totalBudget: number
    }) => matterBudgetService.createFromTemplate(templateId, matterId, totalBudget),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: matterBudgetKeys.lists() })
      queryClient.refetchQueries({
        queryKey: matterBudgetKeys.matter(variables.matterId),
      })
    },
  })
}
