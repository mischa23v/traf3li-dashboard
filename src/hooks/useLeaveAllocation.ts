import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LeaveType } from '@/services/leaveService'
import {
  getLeaveAllocations,
  getLeaveAllocation,
  createLeaveAllocation,
  updateLeaveAllocation,
  deleteLeaveAllocation,
  getEmployeeLeaveBalance,
  getEmployeeAllAllocations,
  bulkAllocateLeaves,
  carryForwardLeaves,
  processCarryForwardForAll,
  expireCarryForwardedLeaves,
  updateLeaveBalance,
  encashLeaves,
  getAllocationSummary,
  getCarryForwardSummary,
  getEmployeesWithLowBalance,
  getExpiringCarryForward,
  adjustAllocation,
  getAllocationHistory,
  getAllocationStatistics,
  type LeaveAllocationFilters,
  type CreateLeaveAllocationData,
  type UpdateLeaveAllocationData,
  type BulkAllocationData,
  type CarryForwardData,
  type ProcessAllCarryForwardData,
} from '@/services/leaveAllocationService'

// Query keys
export const leaveAllocationKeys = {
  all: ['leave-allocations'] as const,
  lists: () => [...leaveAllocationKeys.all, 'list'] as const,
  list: (filters: LeaveAllocationFilters) => [...leaveAllocationKeys.lists(), filters] as const,
  details: () => [...leaveAllocationKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveAllocationKeys.details(), id] as const,
  employeeBalance: (employeeId: string, leaveType?: LeaveType) =>
    [...leaveAllocationKeys.all, 'employee-balance', employeeId, leaveType] as const,
  employeeAll: (employeeId: string) =>
    [...leaveAllocationKeys.all, 'employee-all', employeeId] as const,
  summary: (periodId: string, filters?: { departmentId?: string; leaveType?: LeaveType }) =>
    [...leaveAllocationKeys.all, 'summary', periodId, filters] as const,
  carryForwardSummary: (
    fromPeriodId: string,
    toPeriodId: string,
    filters?: { departmentId?: string; leaveType?: LeaveType }
  ) => [...leaveAllocationKeys.all, 'carry-forward-summary', fromPeriodId, toPeriodId, filters] as const,
  lowBalance: (leaveType: LeaveType, threshold: number) =>
    [...leaveAllocationKeys.all, 'low-balance', leaveType, threshold] as const,
  expiringCarryForward: (daysBeforeExpiry: number) =>
    [...leaveAllocationKeys.all, 'expiring-carry-forward', daysBeforeExpiry] as const,
  history: (employeeId: string, leaveType?: LeaveType) =>
    [...leaveAllocationKeys.all, 'history', employeeId, leaveType] as const,
  statistics: (filters?: { year?: number; departmentId?: string; leaveType?: LeaveType }) =>
    [...leaveAllocationKeys.all, 'statistics', filters] as const,
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Get leave allocations list with filters
 */
export const useLeaveAllocations = (filters?: LeaveAllocationFilters) => {
  return useQuery({
    queryKey: leaveAllocationKeys.list(filters || {}),
    queryFn: () => getLeaveAllocations(filters),
  })
}

/**
 * Get single leave allocation
 */
export const useLeaveAllocation = (allocationId: string) => {
  return useQuery({
    queryKey: leaveAllocationKeys.detail(allocationId),
    queryFn: () => getLeaveAllocation(allocationId),
    enabled: !!allocationId,
  })
}

/**
 * Get employee leave balance for specific leave type
 */
export const useEmployeeLeaveBalance = (employeeId: string, leaveType?: LeaveType) => {
  return useQuery({
    queryKey: leaveAllocationKeys.employeeBalance(employeeId, leaveType),
    queryFn: () => getEmployeeLeaveBalance(employeeId, leaveType),
    enabled: !!employeeId,
  })
}

/**
 * Get all leave allocations for an employee (all leave types)
 */
export const useEmployeeAllAllocations = (employeeId: string) => {
  return useQuery({
    queryKey: leaveAllocationKeys.employeeAll(employeeId),
    queryFn: () => getEmployeeAllAllocations(employeeId),
    enabled: !!employeeId,
  })
}

/**
 * Get allocation summary for a period
 */
export const useAllocationSummary = (
  leavePeriodId: string,
  filters?: { departmentId?: string; leaveType?: LeaveType }
) => {
  return useQuery({
    queryKey: leaveAllocationKeys.summary(leavePeriodId, filters),
    queryFn: () => getAllocationSummary(leavePeriodId, filters),
    enabled: !!leavePeriodId,
  })
}

/**
 * Get carry forward summary
 */
export const useCarryForwardSummary = (
  fromPeriodId: string,
  toPeriodId: string,
  filters?: { departmentId?: string; leaveType?: LeaveType }
) => {
  return useQuery({
    queryKey: leaveAllocationKeys.carryForwardSummary(fromPeriodId, toPeriodId, filters),
    queryFn: () => getCarryForwardSummary(fromPeriodId, toPeriodId, filters),
    enabled: !!fromPeriodId && !!toPeriodId,
  })
}

/**
 * Get employees with low balance
 */
export const useEmployeesWithLowBalance = (leaveType: LeaveType, threshold: number = 5) => {
  return useQuery({
    queryKey: leaveAllocationKeys.lowBalance(leaveType, threshold),
    queryFn: () => getEmployeesWithLowBalance(leaveType, threshold),
    enabled: !!leaveType,
  })
}

/**
 * Get employees with expiring carry forward
 */
export const useExpiringCarryForward = (daysBeforeExpiry: number = 30) => {
  return useQuery({
    queryKey: leaveAllocationKeys.expiringCarryForward(daysBeforeExpiry),
    queryFn: () => getExpiringCarryForward(daysBeforeExpiry),
  })
}

/**
 * Get allocation history for an employee
 */
export const useAllocationHistory = (employeeId: string, leaveType?: LeaveType) => {
  return useQuery({
    queryKey: leaveAllocationKeys.history(employeeId, leaveType),
    queryFn: () => getAllocationHistory(employeeId, leaveType),
    enabled: !!employeeId,
  })
}

/**
 * Get allocation statistics
 */
export const useAllocationStatistics = (filters?: {
  year?: number
  departmentId?: string
  leaveType?: LeaveType
}) => {
  return useQuery({
    queryKey: leaveAllocationKeys.statistics(filters),
    queryFn: () => getAllocationStatistics(filters),
  })
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new leave allocation
 */
export const useCreateLeaveAllocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaveAllocationData) => createLeaveAllocation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeBalance(variables.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeAll(variables.employeeId),
      })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
      if (variables.leavePeriodId) {
        queryClient.invalidateQueries({
          queryKey: leaveAllocationKeys.summary(variables.leavePeriodId),
        })
      }
    },
  })
}

/**
 * Update an existing leave allocation
 */
export const useUpdateLeaveAllocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      allocationId,
      data,
    }: {
      allocationId: string
      data: UpdateLeaveAllocationData
    }) => updateLeaveAllocation(allocationId, data),
    onSuccess: (result, { allocationId }) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.detail(allocationId) })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeBalance(result.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeAll(result.employeeId),
      })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
    },
  })
}

/**
 * Delete a leave allocation
 */
export const useDeleteLeaveAllocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (allocationId: string) => deleteLeaveAllocation(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
    },
  })
}

/**
 * Bulk allocate leaves to multiple employees
 */
export const useBulkAllocateLeaves = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkAllocationData) => bulkAllocateLeaves(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
      // Invalidate employee balances for all affected employees
      variables.employeeIds.forEach((employeeId) => {
        queryClient.invalidateQueries({
          queryKey: leaveAllocationKeys.employeeBalance(employeeId),
        })
        queryClient.invalidateQueries({
          queryKey: leaveAllocationKeys.employeeAll(employeeId),
        })
      })
      if (variables.leavePeriodId) {
        queryClient.invalidateQueries({
          queryKey: leaveAllocationKeys.summary(variables.leavePeriodId),
        })
      }
    },
  })
}

/**
 * Carry forward leaves from one period to another
 */
export const useCarryForwardLeaves = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CarryForwardData) => carryForwardLeaves(data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeBalance(variables.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeAll(variables.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.carryForwardSummary(
          variables.fromPeriodId,
          variables.toPeriodId
        ),
      })
    },
  })
}

/**
 * Process carry forward for all eligible employees
 */
export const useProcessCarryForwardForAll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProcessAllCarryForwardData) => processCarryForwardForAll(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.carryForwardSummary(
          variables.fromPeriodId,
          variables.toPeriodId
        ),
      })
      // Invalidate all employee balances
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.all })
    },
  })
}

/**
 * Expire carry forwarded leaves
 */
export const useExpireCarryForwardedLeaves = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (asOfDate?: string) => expireCarryForwardedLeaves(asOfDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.all })
    },
  })
}

/**
 * Update leave balance (when leave is approved/used)
 */
export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      allocationId,
      usedDays,
      pendingDays,
    }: {
      allocationId: string
      usedDays: number
      pendingDays?: number
    }) => updateLeaveBalance(allocationId, usedDays, pendingDays),
    onSuccess: (result, { allocationId }) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.detail(allocationId) })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeBalance(result.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeAll(result.employeeId),
      })
    },
  })
}

/**
 * Encash unused leaves
 */
export const useEncashLeaves = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      allocationId,
      daysToEncash,
      reason,
    }: {
      allocationId: string
      daysToEncash: number
      reason?: string
    }) => encashLeaves(allocationId, daysToEncash, reason),
    onSuccess: (result, { allocationId }) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.detail(allocationId) })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeBalance(result.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeAll(result.employeeId),
      })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
    },
  })
}

/**
 * Adjust allocation (for corrections)
 */
export const useAdjustAllocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      allocationId,
      adjustment,
    }: {
      allocationId: string
      adjustment: {
        reason: string
        adjustmentType: 'add' | 'deduct'
        days: number
        affectField: 'newLeavesAllocated' | 'carryForwardedLeaves' | 'leavesUsed'
      }
    }) => adjustAllocation(allocationId, adjustment),
    onSuccess: (result, { allocationId }) => {
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.detail(allocationId) })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeBalance(result.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: leaveAllocationKeys.employeeAll(result.employeeId),
      })
      queryClient.invalidateQueries({ queryKey: leaveAllocationKeys.statistics() })
    },
  })
}
