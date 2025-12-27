import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
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
    staleTime: CACHE_TIMES.HOUR, // 1 hour - policy doesn't change often
  })
}

// ==================== MUTATION HOOKS ====================

/**
 * Create leave encashment request
 */
export const useCreateLeaveEncashment = () => {
  

  return useMutation({
    mutationFn: (data: CreateLeaveEncashmentData) => createLeaveEncashment(data),
    onSuccess: (_, variables) => {
      invalidateCache.leaveEncashment.lists()
      invalidateCache.leaveEncashment.stats()
      invalidateCache.leaveEncashment.employeeHistory(variables.employeeId)
    },
  })
}

/**
 * Update leave encashment
 */
export const useUpdateLeaveEncashment = () => {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveEncashmentData }) =>
      updateLeaveEncashment(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.leaveEncashment.detail(id)
      invalidateCache.leaveEncashment.lists()
    },
  })
}

/**
 * Delete leave encashment
 */
export const useDeleteLeaveEncashment = () => {
  

  return useMutation({
    mutationFn: (id: string) => deleteLeaveEncashment(id),
    onSuccess: () => {
      invalidateCache.leaveEncashment.lists()
      invalidateCache.leaveEncashment.stats()
    },
  })
}

/**
 * Submit leave encashment for approval
 */
export const useSubmitLeaveEncashment = () => {
  

  return useMutation({
    mutationFn: (id: string) => submitLeaveEncashment(id),
    onSuccess: (_, id) => {
      invalidateCache.leaveEncashment.detail(id)
      invalidateCache.leaveEncashment.lists()
      invalidateCache.leaveEncashment.pendingApprovals()
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
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApprovalActionData }) =>
      approveLeaveEncashment(id, data),
    onSuccess: (result, { id }) => {
      invalidateCache.leaveEncashment.detail(id)
      invalidateCache.leaveEncashment.lists()
      invalidateCache.leaveEncashment.pendingApprovals()
      invalidateCache.leaveEncashment.stats()
      if (result.employeeId) {
        invalidateCache.leaveEncashment.employeeHistory(result.employeeId)
      }
    },
  })
}

/**
 * Reject leave encashment
 */
export const useRejectLeaveEncashment = () => {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectionActionData }) =>
      rejectLeaveEncashment(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.leaveEncashment.detail(id)
      invalidateCache.leaveEncashment.lists()
      invalidateCache.leaveEncashment.pendingApprovals()
      invalidateCache.leaveEncashment.stats()
    },
  })
}

/**
 * Mark as paid
 */
export const useMarkAsPaid = () => {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkAsPaidData }) =>
      markAsPaid(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.leaveEncashment.detail(id)
      invalidateCache.leaveEncashment.lists()
      invalidateCache.leaveEncashment.stats()
    },
  })
}

/**
 * Process encashment (update leave allocation)
 */
export const useProcessEncashment = () => {
  

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ProcessEncashmentData }) =>
      processEncashment(id, data),
    onSuccess: (result, { id }) => {
      invalidateCache.leaveEncashment.detail(id)
      invalidateCache.leaveEncashment.lists()
      if (result.employeeId) {
        invalidateCache.leaveEncashment.employeeHistory(result.employeeId)
        invalidateCache.leaveEncashment.eligibility(result.employeeId, result.leaveType)
      }
    },
  })
}

/**
 * Cancel leave encashment
 */
export const useCancelLeaveEncashment = () => {
  

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelLeaveEncashment(id, reason),
    onSuccess: (result, { id }) => {
      invalidateCache.leaveEncashment.detail(id)
      invalidateCache.leaveEncashment.lists()
      invalidateCache.leaveEncashment.stats()
      if (result.employeeId) {
        invalidateCache.leaveEncashment.employeeHistory(result.employeeId)
      }
    },
  })
}

/**
 * Bulk approve encashments
 */
export const useBulkApproveEncashments = () => {
  

  return useMutation({
    mutationFn: (ids: string[]) => bulkApproveEncashments(ids),
    onSuccess: () => {
      invalidateCache.leaveEncashment.all()
    },
  })
}

/**
 * Bulk reject encashments
 */
export const useBulkRejectEncashments = () => {
  

  return useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      bulkRejectEncashments(ids, reason),
    onSuccess: () => {
      invalidateCache.leaveEncashment.all()
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
