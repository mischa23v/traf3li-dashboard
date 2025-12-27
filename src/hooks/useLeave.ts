import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getLeaveRequests,
  getLeaveRequest,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  confirmReturn,
  requestExtension,
  getLeaveBalance,
  getLeaveStats,
  getTeamCalendar,
  checkConflicts,
  uploadLeaveDocument,
  completeHandover,
  getPendingApprovals,
  getLeaveTypes,
  LeaveRequestFilters,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
} from '@/services/leaveService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query keys
export const leaveKeys = {
  all: ['leave-requests'] as const,
  lists: () => [...leaveKeys.all, 'list'] as const,
  list: (filters: LeaveRequestFilters) => [...leaveKeys.lists(), filters] as const,
  details: () => [...leaveKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveKeys.details(), id] as const,
  balance: (employeeId: string) => [...leaveKeys.all, 'balance', employeeId] as const,
  stats: (filters?: { year?: number; department?: string }) => [...leaveKeys.all, 'stats', filters] as const,
  calendar: (startDate: string, endDate: string, department?: string) => [...leaveKeys.all, 'calendar', startDate, endDate, department] as const,
  pendingApprovals: () => [...leaveKeys.all, 'pending-approvals'] as const,
  types: () => [...leaveKeys.all, 'types'] as const,
}

// Get leave requests list
export const useLeaveRequests = (filters?: LeaveRequestFilters) => {
  return useQuery({
    queryKey: leaveKeys.list(filters || {}),
    queryFn: () => getLeaveRequests(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single leave request
export const useLeaveRequest = (requestId: string) => {
  return useQuery({
    queryKey: leaveKeys.detail(requestId),
    queryFn: () => getLeaveRequest(requestId),
    enabled: !!requestId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get leave balance for employee
export const useLeaveBalance = (employeeId: string) => {
  return useQuery({
    queryKey: leaveKeys.balance(employeeId),
    queryFn: () => getLeaveBalance(employeeId),
    enabled: !!employeeId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get leave stats
export const useLeaveStats = (filters?: { year?: number; department?: string }) => {
  return useQuery({
    queryKey: leaveKeys.stats(filters),
    queryFn: () => getLeaveStats(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get team calendar
export const useTeamCalendar = (startDate: string, endDate: string, department?: string) => {
  return useQuery({
    queryKey: leaveKeys.calendar(startDate, endDate, department),
    queryFn: () => getTeamCalendar(startDate, endDate, department),
    enabled: !!startDate && !!endDate,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get pending approvals
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: leaveKeys.pendingApprovals(),
    queryFn: getPendingApprovals,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create leave request
export const useCreateLeaveRequest = () => {
  return useMutation({
    mutationFn: (data: CreateLeaveRequestData) => createLeaveRequest(data),
    onSuccess: () => {
      invalidateCache.leaves.all()
    },
  })
}

// Update leave request
export const useUpdateLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: UpdateLeaveRequestData }) =>
      updateLeaveRequest(requestId, data),
    onSuccess: (_, { requestId }) => {
      Promise.all([
        invalidateCache.leaves.detail(requestId),
        invalidateCache.leaves.all()
      ])
    },
  })
}

// Delete leave request
export const useDeleteLeaveRequest = () => {
  return useMutation({
    mutationFn: (requestId: string) => deleteLeaveRequest(requestId),
    onSuccess: () => {
      invalidateCache.leaves.all()
    },
  })
}

// Submit leave request for approval
export const useSubmitLeaveRequest = () => {
  return useMutation({
    mutationFn: (requestId: string) => submitLeaveRequest(requestId),
    onSuccess: (_, requestId) => {
      Promise.all([
        invalidateCache.leaves.detail(requestId),
        invalidateCache.leaves.all()
      ])
    },
  })
}

// Approve leave request
export const useApproveLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) =>
      approveLeaveRequest(requestId, comments),
    onSuccess: (data, { requestId }) => {
      Promise.all([
        invalidateCache.leaves.detail(requestId),
        invalidateCache.leaves.all()
      ])
    },
  })
}

// Reject leave request
export const useRejectLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectLeaveRequest(requestId, reason),
    onSuccess: (_, { requestId }) => {
      Promise.all([
        invalidateCache.leaves.detail(requestId),
        invalidateCache.leaves.all()
      ])
    },
  })
}

// Cancel leave request
export const useCancelLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      cancelLeaveRequest(requestId, reason),
    onSuccess: (data, { requestId }) => {
      Promise.all([
        invalidateCache.leaves.detail(requestId),
        invalidateCache.leaves.all()
      ])
    },
  })
}

// Confirm return from leave
export const useConfirmReturn = () => {
  return useMutation({
    mutationFn: ({ requestId, returnDate }: { requestId: string; returnDate: string }) =>
      confirmReturn(requestId, returnDate),
    onSuccess: (_, { requestId }) => {
      Promise.all([
        invalidateCache.leaves.detail(requestId),
        invalidateCache.leaves.all()
      ])
    },
  })
}

// Request extension
export const useRequestExtension = () => {
  return useMutation({
    mutationFn: ({ requestId, extensionDays, reason }: { requestId: string; extensionDays: number; reason: string }) =>
      requestExtension(requestId, extensionDays, reason),
    onSuccess: (_, { requestId }) => {
      Promise.all([
        invalidateCache.leaves.detail(requestId),
        invalidateCache.leaves.all()
      ])
    },
  })
}

// Check conflicts
export const useCheckConflicts = () => {
  return useMutation({
    mutationFn: (data: { employeeId: string; startDate: string; endDate: string }) =>
      checkConflicts(data),
  })
}

// Upload document
export const useUploadLeaveDocument = () => {
  return useMutation({
    mutationFn: ({ requestId, file, documentType }: { requestId: string; file: File; documentType: string }) =>
      uploadLeaveDocument(requestId, file, documentType),
    onSuccess: (_, { requestId }) => {
      invalidateCache.leaves.detail(requestId)
    },
  })
}

// Complete handover
export const useCompleteHandover = () => {
  return useMutation({
    mutationFn: (requestId: string) => completeHandover(requestId),
    onSuccess: (_, requestId) => {
      invalidateCache.leaves.detail(requestId)
    },
  })
}

// Get leave types
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: getLeaveTypes,
    staleTime: STATS_GC_TIME, // 1 hour - leave types don't change often
    gcTime: STATS_GC_TIME,
  })
}
