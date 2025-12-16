import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeavePolicies,
  getLeavePolicy,
  createLeavePolicy,
  updateLeavePolicy,
  deleteLeavePolicy,
  setDefaultLeavePolicy,
  toggleLeavePolicyStatus,
  duplicateLeavePolicy,
  getLeavePolicyAssignments,
  getLeavePolicyAssignment,
  assignPolicyToEmployee,
  assignPolicyBulk,
  getEmployeeLeavePolicy,
  getEmployeePolicyHistory,
  cancelPolicyAssignment,
  updateAssignmentDates,
  getLeavePolicyStats,
  getEmployeesWithoutPolicy,
  getEmployeeAllocationSummary,
  previewPolicyAllocations,
  comparePolicies,
  LeavePolicyFilters,
  LeavePolicyAssignmentFilters,
  CreateLeavePolicyData,
  UpdateLeavePolicyData,
  AssignPolicyData,
  BulkAssignPolicyData,
} from '@/services/leavePolicyService'

// ============================================================================
// Query Keys
// ============================================================================

export const leavePolicyKeys = {
  all: ['leave-policies'] as const,
  lists: () => [...leavePolicyKeys.all, 'list'] as const,
  list: (filters: LeavePolicyFilters) => [...leavePolicyKeys.lists(), filters] as const,
  details: () => [...leavePolicyKeys.all, 'detail'] as const,
  detail: (id: string) => [...leavePolicyKeys.details(), id] as const,
  stats: () => [...leavePolicyKeys.all, 'stats'] as const,
  comparison: (ids: string[]) => [...leavePolicyKeys.all, 'comparison', ids] as const,

  // Assignments
  assignments: () => [...leavePolicyKeys.all, 'assignments'] as const,
  assignmentsList: (filters: LeavePolicyAssignmentFilters) =>
    [...leavePolicyKeys.assignments(), 'list', filters] as const,
  assignmentDetail: (id: string) => [...leavePolicyKeys.assignments(), 'detail', id] as const,
  employeePolicy: (employeeId: string) =>
    [...leavePolicyKeys.assignments(), 'employee', employeeId] as const,
  employeePolicyHistory: (employeeId: string) =>
    [...leavePolicyKeys.assignments(), 'employee', employeeId, 'history'] as const,
  employeeAllocation: (employeeId: string, periodId?: string) =>
    [...leavePolicyKeys.assignments(), 'employee', employeeId, 'allocation', periodId] as const,
  unassignedEmployees: () => [...leavePolicyKeys.assignments(), 'unassigned'] as const,
  preview: (policyId: string, employeeId: string, periodId: string) =>
    [...leavePolicyKeys.assignments(), 'preview', policyId, employeeId, periodId] as const,
}

// ============================================================================
// Leave Policy Queries
// ============================================================================

/**
 * Get all leave policies with filters
 */
export const useLeavePolicies = (filters?: LeavePolicyFilters) => {
  return useQuery({
    queryKey: leavePolicyKeys.list(filters || {}),
    queryFn: () => getLeavePolicies(filters),
  })
}

/**
 * Get single leave policy by ID
 */
export const useLeavePolicy = (policyId: string) => {
  return useQuery({
    queryKey: leavePolicyKeys.detail(policyId),
    queryFn: () => getLeavePolicy(policyId),
    enabled: !!policyId,
  })
}

/**
 * Get leave policy statistics
 */
export const useLeavePolicyStats = () => {
  return useQuery({
    queryKey: leavePolicyKeys.stats(),
    queryFn: getLeavePolicyStats,
  })
}

/**
 * Compare multiple policies
 */
export const useComparePolicies = (policyIds: string[]) => {
  return useQuery({
    queryKey: leavePolicyKeys.comparison(policyIds),
    queryFn: () => comparePolicies(policyIds),
    enabled: policyIds.length > 0,
  })
}

// ============================================================================
// Leave Policy Mutations
// ============================================================================

/**
 * Create new leave policy
 */
export const useCreateLeavePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeavePolicyData) => createLeavePolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Update leave policy
 */
export const useUpdateLeavePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, data }: { policyId: string; data: UpdateLeavePolicyData }) =>
      updateLeavePolicy(policyId, data),
    onSuccess: (_, { policyId }) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.detail(policyId) })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Delete leave policy
 */
export const useDeleteLeavePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (policyId: string) => deleteLeavePolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Set policy as default
 */
export const useSetDefaultLeavePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (policyId: string) => setDefaultLeavePolicy(policyId),
    onSuccess: (_, policyId) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.detail(policyId) })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Toggle policy active status
 */
export const useToggleLeavePolicyStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, isActive }: { policyId: string; isActive: boolean }) =>
      toggleLeavePolicyStatus(policyId, isActive),
    onSuccess: (_, { policyId }) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.detail(policyId) })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Duplicate policy
 */
export const useDuplicateLeavePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      policyId,
      newName,
      newNameAr,
    }: {
      policyId: string
      newName: string
      newNameAr: string
    }) => duplicateLeavePolicy(policyId, newName, newNameAr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

// ============================================================================
// Leave Policy Assignment Queries
// ============================================================================

/**
 * Get all policy assignments with filters
 */
export const useLeavePolicyAssignments = (filters?: LeavePolicyAssignmentFilters) => {
  return useQuery({
    queryKey: leavePolicyKeys.assignmentsList(filters || {}),
    queryFn: () => getLeavePolicyAssignments(filters),
  })
}

/**
 * Get single assignment by ID
 */
export const useLeavePolicyAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: leavePolicyKeys.assignmentDetail(assignmentId),
    queryFn: () => getLeavePolicyAssignment(assignmentId),
    enabled: !!assignmentId,
  })
}

/**
 * Get employee's current active policy
 */
export const useEmployeeLeavePolicy = (employeeId: string) => {
  return useQuery({
    queryKey: leavePolicyKeys.employeePolicy(employeeId),
    queryFn: () => getEmployeeLeavePolicy(employeeId),
    enabled: !!employeeId,
  })
}

/**
 * Get employee's policy assignment history
 */
export const useEmployeePolicyHistory = (employeeId: string) => {
  return useQuery({
    queryKey: leavePolicyKeys.employeePolicyHistory(employeeId),
    queryFn: () => getEmployeePolicyHistory(employeeId),
    enabled: !!employeeId,
  })
}

/**
 * Get employees without policy
 */
export const useEmployeesWithoutPolicy = () => {
  return useQuery({
    queryKey: leavePolicyKeys.unassignedEmployees(),
    queryFn: getEmployeesWithoutPolicy,
  })
}

/**
 * Get employee allocation summary
 */
export const useEmployeeAllocationSummary = (employeeId: string, leavePeriodId?: string) => {
  return useQuery({
    queryKey: leavePolicyKeys.employeeAllocation(employeeId, leavePeriodId),
    queryFn: () => getEmployeeAllocationSummary(employeeId, leavePeriodId),
    enabled: !!employeeId,
  })
}

/**
 * Preview policy allocations before assignment
 */
export const usePreviewPolicyAllocations = (
  policyId: string,
  employeeId: string,
  leavePeriodId: string
) => {
  return useQuery({
    queryKey: leavePolicyKeys.preview(policyId, employeeId, leavePeriodId),
    queryFn: () => previewPolicyAllocations(policyId, employeeId, leavePeriodId),
    enabled: !!policyId && !!employeeId && !!leavePeriodId,
  })
}

// ============================================================================
// Leave Policy Assignment Mutations
// ============================================================================

/**
 * Assign policy to single employee
 */
export const useAssignPolicyToEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AssignPolicyData) => assignPolicyToEmployee(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.assignments() })
      queryClient.invalidateQueries({
        queryKey: leavePolicyKeys.employeePolicy(variables.employeeId),
      })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.unassignedEmployees() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Bulk assign policy to multiple employees
 */
export const useAssignPolicyBulk = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkAssignPolicyData) => assignPolicyBulk(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.assignments() })
      // Invalidate each employee's policy
      variables.employeeIds.forEach((employeeId) => {
        queryClient.invalidateQueries({ queryKey: leavePolicyKeys.employeePolicy(employeeId) })
      })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.unassignedEmployees() })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Cancel policy assignment
 */
export const useCancelPolicyAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) =>
      cancelPolicyAssignment(assignmentId, reason),
    onSuccess: (data, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.assignmentDetail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.assignments() })
      queryClient.invalidateQueries({
        queryKey: leavePolicyKeys.employeePolicy(data.employeeId),
      })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.stats() })
    },
  })
}

/**
 * Update assignment dates
 */
export const useUpdateAssignmentDates = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      assignmentId,
      effectiveFrom,
      effectiveTo,
    }: {
      assignmentId: string
      effectiveFrom: string
      effectiveTo?: string
    }) => updateAssignmentDates(assignmentId, effectiveFrom, effectiveTo),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.assignmentDetail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: leavePolicyKeys.assignments() })
    },
  })
}
