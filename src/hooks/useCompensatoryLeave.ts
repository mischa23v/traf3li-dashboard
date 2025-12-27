import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getCompensatoryLeaveRequests,
  getCompensatoryLeaveRequest,
  createCompensatoryLeaveRequest,
  updateCompensatoryLeaveRequest,
  deleteCompensatoryLeaveRequest,
  submitCompensatoryLeaveRequest,
  calculateLeaveDays,
  approveCompensatoryLeaveRequest,
  rejectCompensatoryLeaveRequest,
  cancelCompensatoryLeaveRequest,
  getEmployeeCompLeaveBalance,
  expireUnusedCompLeave,
  getHolidayWorkRecords,
  getCompensatoryLeaveStats,
  getPendingCompensatoryLeaveRequests,
  getExpiringCompensatoryLeave,
  uploadCompensatoryLeaveDocument,
  exportCompensatoryLeaveRequests,
  bulkApproveCompensatoryLeaveRequests,
  bulkRejectCompensatoryLeaveRequests,
  getCompensatoryLeavePolicy,
  CompensatoryLeaveFilters,
  CreateCompensatoryLeaveRequestData,
  UpdateCompensatoryLeaveRequestData,
  ApprovalActionData,
  RejectionActionData,
  CalculationMethod,
  WorkReason,
} from '@/services/compensatoryLeaveService'
// ==================== QUERY KEYS ====================
export const compensatoryLeaveKeys = {
  all: ['compensatory-leave-requests'] as const,
  lists: () => [...compensatoryLeaveKeys.all, 'list'] as const,
  list: (filters: CompensatoryLeaveFilters) =>
    [...compensatoryLeaveKeys.lists(), filters] as const,
  details: () => [...compensatoryLeaveKeys.all, 'detail'] as const,
  detail: (id: string) => [...compensatoryLeaveKeys.details(), id] as const,
  balance: (employeeId: string) =>
    [...compensatoryLeaveKeys.all, 'balance', employeeId] as const,
  stats: (filters?: { year?: number; month?: number; departmentId?: string }) =>
    [...compensatoryLeaveKeys.all, 'stats', filters] as const,
  pendingApprovals: () => [...compensatoryLeaveKeys.all, 'pending-approvals'] as const,
  expiring: (daysBeforeExpiry: number) =>
    [...compensatoryLeaveKeys.all, 'expiring', daysBeforeExpiry] as const,
  holidayWorkRecords: (
    employeeId: string,
    filters?: {
      fromDate?: string
      toDate?: string
      includeWeekends?: boolean
      includeHolidays?: boolean
      withoutCompLeave?: boolean
    }
  ) => [...compensatoryLeaveKeys.all, 'holiday-work', employeeId, filters] as const,
  policy: () => [...compensatoryLeaveKeys.all, 'policy'] as const,
}
// ==================== QUERY HOOKS ====================
/**
 * Get all compensatory leave requests with filters
 */
export const useCompensatoryLeaveRequests = (filters?: CompensatoryLeaveFilters) => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.list(filters || {}),
    queryFn: () => getCompensatoryLeaveRequests(filters),
  })
}
/**
 * Get single compensatory leave request
 */
export const useCompensatoryLeaveRequest = (id: string) => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.detail(id),
    queryFn: () => getCompensatoryLeaveRequest(id),
    enabled: !!id,
  })
}
/**
 * Get employee compensatory leave balance
 */
export const useEmployeeCompLeaveBalance = (employeeId: string) => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.balance(employeeId),
    queryFn: () => getEmployeeCompLeaveBalance(employeeId),
    enabled: !!employeeId,
  })
}
/**
 * Get compensatory leave statistics
 */
export const useCompensatoryLeaveStats = (filters?: {
  year?: number
  month?: number
  departmentId?: string
}) => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.stats(filters),
    queryFn: () => getCompensatoryLeaveStats(filters),
  })
}
/**
 * Get pending compensatory leave requests (for approvers)
 */
export const usePendingCompensatoryLeaveRequests = () => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.pendingApprovals(),
    queryFn: getPendingCompensatoryLeaveRequests,
  })
}
/**
 * Get expiring compensatory leave
 */
export const useExpiringCompensatoryLeave = (daysBeforeExpiry: number = 30) => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.expiring(daysBeforeExpiry),
    queryFn: () => getExpiringCompensatoryLeave(daysBeforeExpiry),
  })
}
/**
 * Get holiday/weekend work records from attendance
 */
export const useHolidayWorkRecords = (
  employeeId: string,
  filters?: {
    fromDate?: string
    toDate?: string
    includeWeekends?: boolean
    includeHolidays?: boolean
    withoutCompLeave?: boolean
  }
) => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.holidayWorkRecords(employeeId, filters),
    queryFn: () => getHolidayWorkRecords(employeeId, filters),
    enabled: !!employeeId,
  })
}
/**
 * Get compensatory leave policy/rules
 */
export const useCompensatoryLeavePolicy = () => {
  return useQuery({
    queryKey: compensatoryLeaveKeys.policy(),
    queryFn: getCompensatoryLeavePolicy,
    staleTime: CACHE_TIMES.HOUR, // 1 hour - policy doesn't change often
  })
}
// ==================== MUTATION HOOKS ====================
/**
 * Create compensatory leave request
 */
export const useCreateCompensatoryLeaveRequest = () => {
  return useMutation({
    mutationFn: (data: CreateCompensatoryLeaveRequestData) =>
      createCompensatoryLeaveRequest(data),
    onSuccess: (result, variables) => {
      invalidateCache.compensatoryLeave.lists()
      invalidateCache.compensatoryLeave.stats()
      invalidateCache.compensatoryLeave.balance(variables.employeeId)
      invalidateCache.compensatoryLeave.holidayWorkRecords(variables.employeeId)
    },
  })
}
/**
 * Update compensatory leave request
 */
export const useUpdateCompensatoryLeaveRequest = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateCompensatoryLeaveRequestData
    }) => updateCompensatoryLeaveRequest(id, data),
    onSuccess: (result, { id }) => {
      invalidateCache.compensatoryLeave.detail(id)
      invalidateCache.compensatoryLeave.lists()
      if (result.employeeId) {
        invalidateCache.compensatoryLeave.balance(result.employeeId)
      }
    },
  })
}
/**
 * Delete compensatory leave request
 */
export const useDeleteCompensatoryLeaveRequest = () => {
  return useMutation({
    mutationFn: (id: string) => deleteCompensatoryLeaveRequest(id),
    onSuccess: () => {
      invalidateCache.compensatoryLeave.lists()
      invalidateCache.compensatoryLeave.stats()
    },
  })
}
/**
 * Submit compensatory leave request for approval
 */
export const useSubmitCompensatoryLeaveRequest = () => {
  return useMutation({
    mutationFn: (id: string) => submitCompensatoryLeaveRequest(id),
    onSuccess: (result, id) => {
      invalidateCache.compensatoryLeave.detail(id)
      invalidateCache.compensatoryLeave.lists()
      invalidateCache.compensatoryLeave.pendingApprovals()
      if (result.employeeId) {
        invalidateCache.compensatoryLeave.balance(result.employeeId)
      }
    },
  })
}
/**
 * Calculate leave days earned from hours worked
 */
export const useCalculateLeaveDays = () => {
  return useMutation({
    mutationFn: ({
      hoursWorked,
      method,
      reason,
    }: {
      hoursWorked: number
      method: CalculationMethod
      reason?: WorkReason
    }) => calculateLeaveDays(hoursWorked, method, reason),
  })
}
/**
 * Approve compensatory leave request
 */
export const useApproveCompensatoryLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApprovalActionData }) =>
      approveCompensatoryLeaveRequest(id, data),
    onSuccess: (result, { id }) => {
      invalidateCache.compensatoryLeave.detail(id)
      invalidateCache.compensatoryLeave.lists()
      invalidateCache.compensatoryLeave.pendingApprovals()
      invalidateCache.compensatoryLeave.stats()
      if (result.employeeId) {
        invalidateCache.compensatoryLeave.balance(result.employeeId)
        // Invalidate leave allocations if created
        invalidateCache.leaveAllocation.all()
      }
    },
  })
}
/**
 * Reject compensatory leave request
 */
export const useRejectCompensatoryLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectionActionData }) =>
      rejectCompensatoryLeaveRequest(id, data),
    onSuccess: (result, { id }) => {
      invalidateCache.compensatoryLeave.detail(id)
      invalidateCache.compensatoryLeave.lists()
      invalidateCache.compensatoryLeave.pendingApprovals()
      invalidateCache.compensatoryLeave.stats()
    },
  })
}
/**
 * Cancel compensatory leave request
 */
export const useCancelCompensatoryLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelCompensatoryLeaveRequest(id, reason),
    onSuccess: (result, { id }) => {
      invalidateCache.compensatoryLeave.detail(id)
      invalidateCache.compensatoryLeave.lists()
      invalidateCache.compensatoryLeave.stats()
      if (result.employeeId) {
        invalidateCache.compensatoryLeave.balance(result.employeeId)
      }
    },
  })
}
/**
 * Expire unused compensatory leave
 */
export const useExpireUnusedCompLeave = () => {
  return useMutation({
    mutationFn: (asOfDate?: string) => expireUnusedCompLeave(asOfDate),
    onSuccess: () => {
      invalidateCache.compensatoryLeave.all()
    },
  })
}
/**
 * Upload supporting document
 */
export const useUploadCompensatoryLeaveDocument = () => {
  return useMutation({
    mutationFn: ({
      requestId,
      file,
      documentType,
    }: {
      requestId: string
      file: File
      documentType: 'attendance_report' | 'manager_approval' | 'timesheet' | 'other'
    }) => uploadCompensatoryLeaveDocument(requestId, file, documentType),
    onSuccess: (result, { requestId }) => {
      invalidateCache.compensatoryLeave.detail(requestId)
    },
  })
}
/**
 * Export compensatory leave requests to Excel
 */
export const useExportCompensatoryLeaveRequests = () => {
  return useMutation({
    mutationFn: (filters?: CompensatoryLeaveFilters) =>
      exportCompensatoryLeaveRequests(filters),
  })
}
/**
 * Bulk approve compensatory leave requests
 */
export const useBulkApproveCompensatoryLeaveRequests = () => {
  return useMutation({
    mutationFn: ({
      ids,
      createLeaveAllocation = true,
    }: {
      ids: string[]
      createLeaveAllocation?: boolean
    }) => bulkApproveCompensatoryLeaveRequests(ids, createLeaveAllocation),
    onSuccess: () => {
      invalidateCache.compensatoryLeave.all()
      invalidateCache.leaveAllocation.all()
    },
  })
}
/**
 * Bulk reject compensatory leave requests
 */
export const useBulkRejectCompensatoryLeaveRequests = () => {
  return useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      bulkRejectCompensatoryLeaveRequests(ids, reason),
    onSuccess: () => {
      invalidateCache.compensatoryLeave.all()
    },
  })
}
