import { useQuery, useMutation } from '@tanstack/react-query'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
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

// ==================== SHIFT ASSIGNMENT HOOKS ====================

// Get shift assignments list
export const useShiftAssignments = (filters?: ShiftAssignmentFilters) => {
  return useQuery({
    queryKey: QueryKeys.shiftAssignments.list(filters),
    queryFn: () => getShiftAssignments(filters),
  })
}

// Get single shift assignment
export const useShiftAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: QueryKeys.shiftAssignments.detail(assignmentId),
    queryFn: () => getShiftAssignment(assignmentId),
    enabled: !!assignmentId,
  })
}

// Get employee's current shift
export const useEmployeeShift = (employeeId: string, date?: string) => {
  return useQuery({
    queryKey: QueryKeys.shiftAssignments.employeeShift(employeeId, date),
    queryFn: () => getEmployeeShift(employeeId, date),
    enabled: !!employeeId,
  })
}

// Get active assignment for employee
export const useActiveAssignment = (employeeId: string) => {
  return useQuery({
    queryKey: QueryKeys.shiftAssignments.activeAssignment(employeeId),
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
    queryKey: QueryKeys.shiftAssignments.stats(filters),
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
    queryKey: QueryKeys.shiftAssignments.coverageReport(filters),
    queryFn: () => getShiftCoverageReport(filters),
  })
}

// Create shift assignment
export const useAssignShift = () => {
  return useMutation({
    mutationFn: (data: CreateShiftAssignmentData) => assignShift(data),
    onSuccess: (_, variables) => {
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      invalidateCache.shiftAssignments.coverageReport()
      invalidateCache.shiftAssignments.employeeShift(variables.employeeId)
      invalidateCache.shiftAssignments.activeAssignment(variables.employeeId)
    },
  })
}

// Update shift assignment
export const useUpdateAssignment = () => {
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: UpdateShiftAssignmentData }) =>
      updateAssignment(assignmentId, data),
    onSuccess: (result, { assignmentId }) => {
      invalidateCache.shiftAssignments.detail(assignmentId)
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      if (result.employeeId) {
        invalidateCache.shiftAssignments.employeeShift(result.employeeId)
        invalidateCache.shiftAssignments.activeAssignment(result.employeeId)
      }
    },
  })
}

// Delete shift assignment
export const useDeleteAssignment = () => {
  return useMutation({
    mutationFn: (assignmentId: string) => deleteAssignment(assignmentId),
    onSuccess: () => {
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      invalidateCache.shiftAssignments.coverageReport()
    },
  })
}

// Bulk assign shift
export const useBulkAssignShift = () => {
  return useMutation({
    mutationFn: (data: BulkAssignShiftData) => bulkAssignShift(data),
    onSuccess: (_, variables) => {
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      invalidateCache.shiftAssignments.coverageReport()
      // Invalidate all employee shifts for the bulk assigned employees
      variables.employeeIds.forEach((employeeId) => {
        invalidateCache.shiftAssignments.employeeShift(employeeId)
        invalidateCache.shiftAssignments.activeAssignment(employeeId)
      })
    },
  })
}

// Activate assignment
export const useActivateAssignment = () => {
  return useMutation({
    mutationFn: (assignmentId: string) => activateAssignment(assignmentId),
    onSuccess: (result, assignmentId) => {
      invalidateCache.shiftAssignments.detail(assignmentId)
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      if (result.employeeId) {
        invalidateCache.shiftAssignments.employeeShift(result.employeeId)
        invalidateCache.shiftAssignments.activeAssignment(result.employeeId)
      }
    },
  })
}

// Deactivate assignment
export const useDeactivateAssignment = () => {
  return useMutation({
    mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason?: string }) =>
      deactivateAssignment(assignmentId, reason),
    onSuccess: (result, { assignmentId }) => {
      invalidateCache.shiftAssignments.detail(assignmentId)
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      if (result.employeeId) {
        invalidateCache.shiftAssignments.employeeShift(result.employeeId)
        invalidateCache.shiftAssignments.activeAssignment(result.employeeId)
      }
    },
  })
}

// Import shift assignments
export const useImportShiftAssignments = () => {
  return useMutation({
    mutationFn: (assignments: CreateShiftAssignmentData[]) => importShiftAssignments(assignments),
    onSuccess: () => {
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      invalidateCache.shiftAssignments.coverageReport()
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
    queryKey: QueryKeys.shiftRequests.list(filters),
    queryFn: () => getShiftRequests(filters),
  })
}

// Get single shift request
export const useShiftRequest = (requestId: string) => {
  return useQuery({
    queryKey: QueryKeys.shiftRequests.detail(requestId),
    queryFn: () => getShiftRequest(requestId),
    enabled: !!requestId,
  })
}

// Get pending shift requests
export const usePendingShiftRequests = () => {
  return useQuery({
    queryKey: QueryKeys.shiftRequests.pendingApprovals(),
    queryFn: getPendingShiftRequests,
  })
}

// Get shift request statistics
export const useShiftRequestStats = (filters?: { departmentId?: string; year?: number }) => {
  return useQuery({
    queryKey: QueryKeys.shiftRequests.stats(filters),
    queryFn: () => getShiftRequestStats(filters),
  })
}

// Create shift request
export const useCreateShiftRequest = () => {
  return useMutation({
    mutationFn: (data: CreateShiftRequestData) => createShiftRequest(data),
    onSuccess: () => {
      invalidateCache.shiftRequests.lists()
      invalidateCache.shiftRequests.stats()
      invalidateCache.shiftRequests.pendingApprovals()
    },
  })
}

// Update shift request
export const useUpdateShiftRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: UpdateShiftRequestData }) =>
      updateShiftRequest(requestId, data),
    onSuccess: (_, { requestId }) => {
      invalidateCache.shiftRequests.detail(requestId)
      invalidateCache.shiftRequests.lists()
    },
  })
}

// Delete shift request
export const useDeleteShiftRequest = () => {
  return useMutation({
    mutationFn: (requestId: string) => deleteShiftRequest(requestId),
    onSuccess: () => {
      invalidateCache.shiftRequests.lists()
      invalidateCache.shiftRequests.stats()
    },
  })
}

// Approve shift request
export const useApproveShiftRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) =>
      approveShiftRequest(requestId, comments),
    onSuccess: (result, { requestId }) => {
      invalidateCache.shiftRequests.detail(requestId)
      invalidateCache.shiftRequests.lists()
      invalidateCache.shiftRequests.pendingApprovals()
      invalidateCache.shiftRequests.stats()
      // Invalidate shift assignments as approving request may create new assignment
      invalidateCache.shiftAssignments.lists()
      invalidateCache.shiftAssignments.stats()
      if (result.employeeId) {
        invalidateCache.shiftAssignments.employeeShift(result.employeeId)
        invalidateCache.shiftAssignments.activeAssignment(result.employeeId)
      }
    },
  })
}

// Reject shift request
export const useRejectShiftRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectShiftRequest(requestId, reason),
    onSuccess: (_, { requestId }) => {
      invalidateCache.shiftRequests.detail(requestId)
      invalidateCache.shiftRequests.lists()
      invalidateCache.shiftRequests.pendingApprovals()
      invalidateCache.shiftRequests.stats()
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
