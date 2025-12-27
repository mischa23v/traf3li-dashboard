import { useQuery, useMutation } from '@tanstack/react-query'
import type { LeaveType } from '@/services/leaveService'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
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

// =============================================================================
// Queries
// =============================================================================

/**
 * Get leave allocations list with filters
 */
export const useLeaveAllocations = (filters?: LeaveAllocationFilters) => {
  return useQuery({
    queryKey: QueryKeys.leaveAllocation.list(filters || {}),
    queryFn: () => getLeaveAllocations(filters),
  })
}

/**
 * Get single leave allocation
 */
export const useLeaveAllocation = (allocationId: string) => {
  return useQuery({
    queryKey: QueryKeys.leaveAllocation.detail(allocationId),
    queryFn: () => getLeaveAllocation(allocationId),
    enabled: !!allocationId,
  })
}

/**
 * Get employee leave balance for specific leave type
 */
export const useEmployeeLeaveBalance = (employeeId: string, leaveType?: LeaveType) => {
  return useQuery({
    queryKey: QueryKeys.leaveAllocation.employeeBalance(employeeId, leaveType),
    queryFn: () => getEmployeeLeaveBalance(employeeId, leaveType),
    enabled: !!employeeId,
  })
}

/**
 * Get all leave allocations for an employee (all leave types)
 */
export const useEmployeeAllAllocations = (employeeId: string) => {
  return useQuery({
    queryKey: QueryKeys.leaveAllocation.employeeAll(employeeId),
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
    queryKey: QueryKeys.leaveAllocation.summary(leavePeriodId, filters),
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
    queryKey: QueryKeys.leaveAllocation.carryForwardSummary(fromPeriodId, toPeriodId, filters),
    queryFn: () => getCarryForwardSummary(fromPeriodId, toPeriodId, filters),
    enabled: !!fromPeriodId && !!toPeriodId,
  })
}

/**
 * Get employees with low balance
 */
export const useEmployeesWithLowBalance = (leaveType: LeaveType, threshold: number = 5) => {
  return useQuery({
    queryKey: QueryKeys.leaveAllocation.lowBalance(leaveType, threshold),
    queryFn: () => getEmployeesWithLowBalance(leaveType, threshold),
    enabled: !!leaveType,
  })
}

/**
 * Get employees with expiring carry forward
 */
export const useExpiringCarryForward = (daysBeforeExpiry: number = 30) => {
  return useQuery({
    queryKey: QueryKeys.leaveAllocation.expiringCarryForward(daysBeforeExpiry),
    queryFn: () => getExpiringCarryForward(daysBeforeExpiry),
  })
}

/**
 * Get allocation history for an employee
 */
export const useAllocationHistory = (employeeId: string, leaveType?: LeaveType) => {
  return useQuery({
    queryKey: QueryKeys.leaveAllocation.history(employeeId, leaveType),
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
    queryKey: QueryKeys.leaveAllocation.statistics(filters),
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
  return useMutation({
    mutationFn: (data: CreateLeaveAllocationData) => createLeaveAllocation(data),
    onSuccess: (_, variables) => {
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.employeeBalance(variables.employeeId)
      invalidateCache.leaveAllocation.employeeAll(variables.employeeId)
      invalidateCache.leaveAllocation.statistics()
      if (variables.leavePeriodId) {
        invalidateCache.leaveAllocation.summary(variables.leavePeriodId, {})
      }
    },
  })
}

/**
 * Update an existing leave allocation
 */
export const useUpdateLeaveAllocation = () => {
  return useMutation({
    mutationFn: ({
      allocationId,
      data,
    }: {
      allocationId: string
      data: UpdateLeaveAllocationData
    }) => updateLeaveAllocation(allocationId, data),
    onSuccess: (result, { allocationId }) => {
      invalidateCache.leaveAllocation.detail(allocationId)
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.employeeBalance(result.employeeId)
      invalidateCache.leaveAllocation.employeeAll(result.employeeId)
      invalidateCache.leaveAllocation.statistics()
    },
  })
}

/**
 * Delete a leave allocation
 */
export const useDeleteLeaveAllocation = () => {
  return useMutation({
    mutationFn: (allocationId: string) => deleteLeaveAllocation(allocationId),
    onSuccess: () => {
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.statistics()
    },
  })
}

/**
 * Bulk allocate leaves to multiple employees
 */
export const useBulkAllocateLeaves = () => {
  return useMutation({
    mutationFn: (data: BulkAllocationData) => bulkAllocateLeaves(data),
    onSuccess: (_, variables) => {
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.statistics()
      // Invalidate employee balances for all affected employees
      variables.employeeIds.forEach((employeeId) => {
        invalidateCache.leaveAllocation.employeeBalance(employeeId)
        invalidateCache.leaveAllocation.employeeAll(employeeId)
      })
      if (variables.leavePeriodId) {
        invalidateCache.leaveAllocation.summary(variables.leavePeriodId, {})
      }
    },
  })
}

/**
 * Carry forward leaves from one period to another
 */
export const useCarryForwardLeaves = () => {
  return useMutation({
    mutationFn: (data: CarryForwardData) => carryForwardLeaves(data),
    onSuccess: (result, variables) => {
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.employeeBalance(variables.employeeId)
      invalidateCache.leaveAllocation.employeeAll(variables.employeeId)
      invalidateCache.leaveAllocation.carryForwardSummary(
        variables.fromPeriodId,
        variables.toPeriodId,
        {}
      )
    },
  })
}

/**
 * Process carry forward for all eligible employees
 */
export const useProcessCarryForwardForAll = () => {
  return useMutation({
    mutationFn: (data: ProcessAllCarryForwardData) => processCarryForwardForAll(data),
    onSuccess: (_, variables) => {
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.statistics()
      invalidateCache.leaveAllocation.carryForwardSummary(
        variables.fromPeriodId,
        variables.toPeriodId,
        {}
      )
      // Invalidate all employee balances
      invalidateCache.leaveAllocation.all()
    },
  })
}

/**
 * Expire carry forwarded leaves
 */
export const useExpireCarryForwardedLeaves = () => {
  return useMutation({
    mutationFn: (asOfDate?: string) => expireCarryForwardedLeaves(asOfDate),
    onSuccess: () => {
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.statistics()
      invalidateCache.leaveAllocation.all()
    },
  })
}

/**
 * Update leave balance (when leave is approved/used)
 */
export const useUpdateLeaveBalance = () => {
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
      invalidateCache.leaveAllocation.detail(allocationId)
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.employeeBalance(result.employeeId)
      invalidateCache.leaveAllocation.employeeAll(result.employeeId)
    },
  })
}

/**
 * Encash unused leaves
 */
export const useEncashLeaves = () => {
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
      invalidateCache.leaveAllocation.detail(allocationId)
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.employeeBalance(result.employeeId)
      invalidateCache.leaveAllocation.employeeAll(result.employeeId)
      invalidateCache.leaveAllocation.statistics()
    },
  })
}

/**
 * Adjust allocation (for corrections)
 */
export const useAdjustAllocation = () => {
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
      invalidateCache.leaveAllocation.detail(allocationId)
      invalidateCache.leaveAllocation.lists()
      invalidateCache.leaveAllocation.employeeBalance(result.employeeId)
      invalidateCache.leaveAllocation.employeeAll(result.employeeId)
      invalidateCache.leaveAllocation.statistics()
    },
  })
}
