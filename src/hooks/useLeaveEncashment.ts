import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeaveEncashments,
  getLeaveEncashment,
  createLeaveEncashment,
  updateLeaveEncashment,
  deleteLeaveEncashment,
  submitLeaveEncashment,
  calculateEncashmentAmount,
  getEncashableBalance,
  approveLeaveEncashment,
  rejectLeaveEncashment,
  markAsPaid,
  processEncashment,
  cancelLeaveEncashment,
  getEncashmentStats,
  getPendingEncashments,
  getEmployeeEncashmentHistory,
  bulkApproveEncashments,
  bulkRejectEncashments,
  exportEncashments,
  getEncashmentPolicy,
  LeaveEncashmentFilters,
  CreateLeaveEncashmentData,
  UpdateLeaveEncashmentData,
  ApprovalActionData,
  RejectionActionData,
  MarkAsPaidData,
  ProcessEncashmentData,
} from '@/services/leaveEncashmentService'

// ==================== QUERY KEYS ====================

export const leaveEncashmentKeys = {
  all: ['leave-encashments'] as const,
  lists: () => [...leaveEncashmentKeys.all, 'list'] as const,
  list: (filters: LeaveEncashmentFilters) => [...leaveEncashmentKeys.lists(), filters] as const,
  details: () => [...leaveEncashmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveEncashmentKeys.details(), id] as const,
  stats: (filters?: { year?: number; month?: number; departmentId?: string }) =>
    [...leaveEncashmentKeys.all, 'stats', filters] as const,
  pendingApprovals: () => [...leaveEncashmentKeys.all, 'pending-approvals'] as const,
  employeeHistory: (employeeId: string) => [...leaveEncashmentKeys.all, 'employee', employeeId] as const,
  eligibility: (employeeId: string, leaveType: string) =>
    [...leaveEncashmentKeys.all, 'eligibility', employeeId, leaveType] as const,
  policy: () => [...leaveEncashmentKeys.all, 'policy'] as const,
}

// ==================== QUERY HOOKS ====================

/**
 * Get all leave encashments with filters
 */
export const useLeaveEncashments = (filters?: LeaveEncashmentFilters) => {
  return useQuery({
    queryKey: leaveEncashmentKeys.list(filters || {}),
    queryFn: () => getLeaveEncashments(filters),
  })
}

/**
 * Get single leave encashment
 */
export const useLeaveEncashment = (id: string) => {
  return useQuery({
    queryKey: leaveEncashmentKeys.detail(id),
    queryFn: () => getLeaveEncashment(id),
    enabled: !!id,
  })
}

/**
 * Get leave encashment statistics
 */
export const useEncashmentStats = (filters?: { year?: number; month?: number; departmentId?: string }) => {
  return useQuery({
    queryKey: leaveEncashmentKeys.stats(filters),
    queryFn: () => getEncashmentStats(filters),
  })
}

/**
 * Get pending encashment requests (for approvers)
 */
export const usePendingEncashments = () => {
  return useQuery({
    queryKey: leaveEncashmentKeys.pendingApprovals(),
    queryFn: getPendingEncashments,
  })
}

/**
 * Get employee encashment history
 */
export const useEmployeeEncashmentHistory = (employeeId: string) => {
  return useQuery({
    queryKey: leaveEncashmentKeys.employeeHistory(employeeId),
    queryFn: () => getEmployeeEncashmentHistory(employeeId),
    enabled: !!employeeId,
  })
}

/**
 * Get encashable balance for employee
 */
export const useEncashableBalance = (employeeId: string, leaveType: string) => {
  return useQuery({
    queryKey: leaveEncashmentKeys.eligibility(employeeId, leaveType),
    queryFn: () => getEncashableBalance(employeeId, leaveType),
    enabled: !!employeeId && !!leaveType,
  })
}

/**
 * Get encashment policy details
 */
export const useEncashmentPolicy = () => {
  return useQuery({
    queryKey: leaveEncashmentKeys.policy(),
    queryFn: getEncashmentPolicy,
    staleTime: 1000 * 60 * 60, // 1 hour - policy doesn't change often
  })
}

// ==================== MUTATION HOOKS ====================

/**
 * Create leave encashment request
 */
export const useCreateLeaveEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaveEncashmentData) => createLeaveEncashment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.employeeHistory(variables.employeeId) })
    },
  })
}

/**
 * Update leave encashment
 */
export const useUpdateLeaveEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveEncashmentData }) =>
      updateLeaveEncashment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
    },
  })
}

/**
 * Delete leave encashment
 */
export const useDeleteLeaveEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLeaveEncashment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.stats() })
    },
  })
}

/**
 * Submit leave encashment for approval
 */
export const useSubmitLeaveEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => submitLeaveEncashment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.pendingApprovals() })
    },
  })
}

/**
 * Calculate encashment amount
 */
export const useCalculateEncashmentAmount = () => {
  return useMutation({
    mutationFn: ({ employeeId, leaveType, days }: { employeeId: string; leaveType: string; days: number }) =>
      calculateEncashmentAmount(employeeId, leaveType, days),
  })
}

/**
 * Approve leave encashment
 */
export const useApproveLeaveEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApprovalActionData }) =>
      approveLeaveEncashment(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.stats() })
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.employeeHistory(result.employeeId) })
      }
    },
  })
}

/**
 * Reject leave encashment
 */
export const useRejectLeaveEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectionActionData }) =>
      rejectLeaveEncashment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.stats() })
    },
  })
}

/**
 * Mark as paid
 */
export const useMarkAsPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkAsPaidData }) =>
      markAsPaid(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.stats() })
    },
  })
}

/**
 * Process encashment (update leave allocation)
 */
export const useProcessEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ProcessEncashmentData }) =>
      processEncashment(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.employeeHistory(result.employeeId) })
        queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.eligibility(result.employeeId, result.leaveType) })
      }
    },
  })
}

/**
 * Cancel leave encashment
 */
export const useCancelLeaveEncashment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelLeaveEncashment(id, reason),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.stats() })
      if (result.employeeId) {
        queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.employeeHistory(result.employeeId) })
      }
    },
  })
}

/**
 * Bulk approve encashments
 */
export const useBulkApproveEncashments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => bulkApproveEncashments(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.all })
    },
  })
}

/**
 * Bulk reject encashments
 */
export const useBulkRejectEncashments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      bulkRejectEncashments(ids, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveEncashmentKeys.all })
    },
  })
}

/**
 * Export encashments to Excel
 */
export const useExportEncashments = () => {
  return useMutation({
    mutationFn: (filters?: LeaveEncashmentFilters) => exportEncashments(filters),
  })
}
