import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getShiftAssignments,
  getShiftAssignment,
  getEmployeeShift,
  getActiveAssignment,
  assignShift,
  updateAssignment,
  deleteAssignment,
  bulkAssignShift,
  activateAssignment,
  deactivateAssignment,
  getShiftAssignmentStats,
  getShiftRequests,
  getShiftRequest,
  createShiftRequest,
  updateShiftRequest,
  deleteShiftRequest,
  approveShiftRequest,
  rejectShiftRequest,
  getPendingShiftRequests,
  getShiftRequestStats,
  checkShiftRequestConflicts,
  getShiftCoverageReport,
  importShiftAssignments,
  exportShiftAssignments,
  type ShiftAssignmentFilters,
  type CreateShiftAssignmentData,
  type UpdateShiftAssignmentData,
  type BulkAssignShiftData,
  type ShiftRequestFilters,
  type CreateShiftRequestData,
  type UpdateShiftRequestData,
} from '@/services/shiftAssignmentService'

// ==================== QUERY KEYS ====================

export const shiftAssignmentKeys = {
  all: ['shift-assignments'] as const,
  lists: () => [...shiftAssignmentKeys.all, 'list'] as const,
  list: (filters?: ShiftAssignmentFilters) => [...shiftAssignmentKeys.lists(), filters] as const,
  details: () => [...shiftAssignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftAssignmentKeys.details(), id] as const,
  employeeShift: (employeeId: string, date?: string) =>
    [...shiftAssignmentKeys.all, 'employee-shift', employeeId, date] as const,
  activeAssignment: (employeeId: string) =>
    [...shiftAssignmentKeys.all, 'active-assignment', employeeId] as const,
  stats: (filters?: { departmentId?: string; startDate?: string; endDate?: string }) =>
    [...shiftAssignmentKeys.all, 'stats', filters] as const,
  coverageReport: (filters?: { departmentId?: string; startDate?: string; endDate?: string }) =>
    [...shiftAssignmentKeys.all, 'coverage-report', filters] as const,
}

export const shiftRequestKeys = {
  all: ['shift-requests'] as const,
  lists: () => [...shiftRequestKeys.all, 'list'] as const,
  list: (filters?: ShiftRequestFilters) => [...shiftRequestKeys.lists(), filters] as const,
  details: () => [...shiftRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftRequestKeys.details(), id] as const,
  pendingApprovals: () => [...shiftRequestKeys.all, 'pending-approvals'] as const,
  stats: (filters?: { departmentId?: string; year?: number }) =>
    [...shiftRequestKeys.all, 'stats', filters] as const,
}

// ==================== SHIFT ASSIGNMENT HOOKS ====================

// Get shift assignments list
export const useShiftAssignments = (filters?: ShiftAssignmentFilters) => {
  return useQuery({
    queryKey: shiftAssignmentKeys.list(filters),
    queryFn: () => getShiftAssignments(filters),
  })
}

// Get single shift assignment
export const useShiftAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: shiftAssignmentKeys.detail(assignmentId),
    queryFn: () => getShiftAssignment(assignmentId),
    enabled: !!assignmentId,
  })
}

// Get employee's current shift
export const useEmployeeShift = (employeeId: string, date?: string) => {
  return useQuery({
    queryKey: shiftAssignmentKeys.employeeShift(employeeId, date),
    queryFn: () => getEmployeeShift(employeeId, date),
    enabled: !!employeeId,
  })
}

// Get active assignment for employee
export const useActiveAssignment = (employeeId: string) => {
  return useQuery({
    queryKey: shiftAssignmentKeys.activeAssignment(employeeId),
    queryFn: () => getActiveAssignment(employeeId),
    enabled: !!employeeId,
  })
}

// Get shift assignment statistics
export const useShiftAssignmentStats = (filters?: {
  departmentId?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: shiftAssignmentKeys.stats(filters),
    queryFn: () => getShiftAssignmentStats(filters),
  })
}

// Get shift coverage report
export const useShiftCoverageReport = (filters?: {
  departmentId?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: shiftAssignmentKeys.coverageReport(filters),
    queryFn: () => getShiftCoverageReport(filters),
  })
}

// Create shift assignment
export const useAssignShift = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateShiftAssignmentData) => assignShift(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.coverageReport() })
      queryClient.invalidateQueries({
        queryKey: shiftAssignmentKeys.employeeShift(variables.employeeId),
      })
      queryClient.invalidateQueries({
        queryKey: shiftAssignmentKeys.activeAssignment(variables.employeeId),
      })
    },
  })
}

// Update shift assignment
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: UpdateShiftAssignmentData }) =>
      updateAssignment(assignmentId, data),
    onSuccess: (result, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      if (result.employeeId) {
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.employeeShift(result.employeeId),
        })
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.activeAssignment(result.employeeId),
        })
      }
    },
  })
}

// Delete shift assignment
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: string) => deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.coverageReport() })
    },
  })
}

// Bulk assign shift
export const useBulkAssignShift = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkAssignShiftData) => bulkAssignShift(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.coverageReport() })
      // Invalidate all employee shifts for the bulk assigned employees
      variables.employeeIds.forEach((employeeId) => {
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.employeeShift(employeeId),
        })
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.activeAssignment(employeeId),
        })
      })
    },
  })
}

// Activate assignment
export const useActivateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentId: string) => activateAssignment(assignmentId),
    onSuccess: (result, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      if (result.employeeId) {
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.employeeShift(result.employeeId),
        })
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.activeAssignment(result.employeeId),
        })
      }
    },
  })
}

// Deactivate assignment
export const useDeactivateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason?: string }) =>
      deactivateAssignment(assignmentId, reason),
    onSuccess: (result, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      if (result.employeeId) {
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.employeeShift(result.employeeId),
        })
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.activeAssignment(result.employeeId),
        })
      }
    },
  })
}

// Import shift assignments
export const useImportShiftAssignments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignments: CreateShiftAssignmentData[]) => importShiftAssignments(assignments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.coverageReport() })
    },
  })
}

// Export shift assignments
export const useExportShiftAssignments = () => {
  return useMutation({
    mutationFn: (filters?: ShiftAssignmentFilters) => exportShiftAssignments(filters),
  })
}

// ==================== SHIFT REQUEST HOOKS ====================

// Get shift requests list
export const useShiftRequests = (filters?: ShiftRequestFilters) => {
  return useQuery({
    queryKey: shiftRequestKeys.list(filters),
    queryFn: () => getShiftRequests(filters),
  })
}

// Get single shift request
export const useShiftRequest = (requestId: string) => {
  return useQuery({
    queryKey: shiftRequestKeys.detail(requestId),
    queryFn: () => getShiftRequest(requestId),
    enabled: !!requestId,
  })
}

// Get pending shift requests
export const usePendingShiftRequests = () => {
  return useQuery({
    queryKey: shiftRequestKeys.pendingApprovals(),
    queryFn: getPendingShiftRequests,
  })
}

// Get shift request statistics
export const useShiftRequestStats = (filters?: { departmentId?: string; year?: number }) => {
  return useQuery({
    queryKey: shiftRequestKeys.stats(filters),
    queryFn: () => getShiftRequestStats(filters),
  })
}

// Create shift request
export const useCreateShiftRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateShiftRequestData) => createShiftRequest(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.pendingApprovals() })
    },
  })
}

// Update shift request
export const useUpdateShiftRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: UpdateShiftRequestData }) =>
      updateShiftRequest(requestId, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.lists() })
    },
  })
}

// Delete shift request
export const useDeleteShiftRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) => deleteShiftRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.stats() })
    },
  })
}

// Approve shift request
export const useApproveShiftRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) =>
      approveShiftRequest(requestId, comments),
    onSuccess: (result, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.stats() })
      // Invalidate shift assignments as approving request may create new assignment
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftAssignmentKeys.stats() })
      if (result.employeeId) {
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.employeeShift(result.employeeId),
        })
        queryClient.invalidateQueries({
          queryKey: shiftAssignmentKeys.activeAssignment(result.employeeId),
        })
      }
    },
  })
}

// Reject shift request
export const useRejectShiftRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectShiftRequest(requestId, reason),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: shiftRequestKeys.stats() })
    },
  })
}

// Check shift request conflicts
export const useCheckShiftRequestConflicts = () => {
  return useMutation({
    mutationFn: (data: {
      employeeId: string
      requestedShiftTypeId: string
      fromDate: string
      toDate: string
    }) => checkShiftRequestConflicts(data),
  })
}
