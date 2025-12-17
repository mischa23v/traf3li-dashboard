import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdvances,
  getAdvance,
  createAdvance,
  updateAdvance,
  deleteAdvance,
  getAdvanceStats,
  checkAdvanceEligibility,
  submitAdvanceRequest,
  approveAdvance,
  rejectAdvance,
  disburseAdvance,
  recordAdvanceRecovery,
  processPayrollDeduction,
  processEarlyRecovery,
  waiveAdvance,
  issueClearanceLetter,
  bulkDeleteAdvances,
  getEmployeeAdvances,
  getPendingApprovals,
  getOverdueRecoveries,
  getEmergencyAdvances,
  type AdvanceFilters,
  type CreateAdvanceData,
  type UpdateAdvanceData,
  type RecoveryMethod,
  type DisbursementMethod,
} from '@/services/advancesService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// Query keys
export const advanceKeys = {
  all: ['advances'] as const,
  lists: () => [...advanceKeys.all, 'list'] as const,
  list: (filters?: AdvanceFilters) => [...advanceKeys.lists(), filters] as const,
  details: () => [...advanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...advanceKeys.details(), id] as const,
  stats: () => [...advanceKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...advanceKeys.all, 'employee', employeeId] as const,
  pendingApprovals: () => [...advanceKeys.all, 'pending-approvals'] as const,
  overdueRecoveries: () => [...advanceKeys.all, 'overdue-recoveries'] as const,
  emergency: () => [...advanceKeys.all, 'emergency'] as const,
}

// Get all advances
export const useAdvances = (filters?: AdvanceFilters) => {
  return useQuery({
    queryKey: advanceKeys.list(filters),
    queryFn: () => getAdvances(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single advance
export const useAdvance = (advanceId: string) => {
  return useQuery({
    queryKey: advanceKeys.detail(advanceId),
    queryFn: () => getAdvance(advanceId),
    enabled: !!advanceId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get advance stats
export const useAdvanceStats = () => {
  return useQuery({
    queryKey: advanceKeys.stats(),
    queryFn: getAdvanceStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee advances
export const useEmployeeAdvances = (employeeId: string) => {
  return useQuery({
    queryKey: advanceKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeAdvances(employeeId),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get pending approvals
export const usePendingAdvanceApprovals = () => {
  return useQuery({
    queryKey: advanceKeys.pendingApprovals(),
    queryFn: getPendingApprovals,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get overdue recoveries
export const useOverdueRecoveries = () => {
  return useQuery({
    queryKey: advanceKeys.overdueRecoveries(),
    queryFn: getOverdueRecoveries,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get emergency advances
export const useEmergencyAdvances = () => {
  return useQuery({
    queryKey: advanceKeys.emergency(),
    queryFn: getEmergencyAdvances,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create advance
export const useCreateAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAdvanceData) => createAdvance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Update advance
export const useUpdateAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: { advanceId: string; data: UpdateAdvanceData }) =>
      updateAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
    },
  })
}

// Delete advance
export const useDeleteAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (advanceId: string) => deleteAdvance(advanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Check eligibility
export const useCheckAdvanceEligibility = () => {
  return useMutation({
    mutationFn: ({ employeeId, amount }: { employeeId: string; amount: number }) =>
      checkAdvanceEligibility(employeeId, amount),
  })
}

// Submit advance request
export const useSubmitAdvanceRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (advanceId: string) => submitAdvanceRequest(advanceId),
    onSuccess: (_, advanceId) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.pendingApprovals() })
    },
  })
}

// Approve advance
export const useApproveAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        approvedAmount?: number
        approvedInstallments?: number
        comments?: string
      }
    }) => approveAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Reject advance
export const useRejectAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: { reason: string; comments?: string }
    }) => rejectAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.pendingApprovals() })
    },
  })
}

// Disburse advance
export const useDisburseAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        disbursementMethod: DisbursementMethod
        bankDetails?: {
          bankName: string
          accountNumber: string
          iban: string
        }
        transferReference?: string
        urgentDisbursement?: boolean
      }
    }) => disburseAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Record recovery
export const useRecordAdvanceRecovery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        installmentNumber?: number
        amount: number
        recoveryMethod: RecoveryMethod
        recoveryDate: string
        recoveryReference?: string
        notes?: string
      }
    }) => recordAdvanceRecovery(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.overdueRecoveries() })
    },
  })
}

// Process payroll deduction
export const useProcessPayrollDeduction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        payrollRunId: string
        payrollMonth: string
        payrollYear: number
        deductedAmount: number
      }
    }) => processPayrollDeduction(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
    },
  })
}

// Process early recovery
export const useProcessEarlyRecovery = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        recoveryAmount: number
        recoveryMethod: RecoveryMethod
        recoveryReference?: string
      }
    }) => processEarlyRecovery(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Waive advance
export const useWaiveAdvance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advanceId, data }: {
      advanceId: string
      data: {
        waiveReason: string
        waiveAmount?: number
        comments?: string
      }
    }) => waiveAdvance(advanceId, data),
    onSuccess: (_, { advanceId }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}

// Issue clearance letter
export const useIssueClearanceLetter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (advanceId: string) => issueClearanceLetter(advanceId),
    onSuccess: (_, advanceId) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(advanceId) })
    },
  })
}

// Bulk delete
export const useBulkDeleteAdvances = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAdvances(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: advanceKeys.stats() })
    },
  })
}
