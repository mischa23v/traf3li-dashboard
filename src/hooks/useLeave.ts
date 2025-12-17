import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaveRequestData) => createLeaveRequest(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.stats() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance(variables.employeeId) })
    },
  })
}

// Update leave request
export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: UpdateLeaveRequestData }) =>
      updateLeaveRequest(requestId, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
    },
  })
}

// Delete leave request
export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) => deleteLeaveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.stats() })
    },
  })
}

// Submit leave request for approval
export const useSubmitLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) => submitLeaveRequest(requestId),
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.pendingApprovals() })
    },
  })
}

// Approve leave request
export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, comments }: { requestId: string; comments?: string }) =>
      approveLeaveRequest(requestId, comments),
    onSuccess: (data, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.stats() })
      if (data.employeeId) {
        queryClient.invalidateQueries({ queryKey: leaveKeys.balance(data.employeeId) })
      }
    },
  })
}

// Reject leave request
export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectLeaveRequest(requestId, reason),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.pendingApprovals() })
    },
  })
}

// Cancel leave request
export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      cancelLeaveRequest(requestId, reason),
    onSuccess: (data, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaveKeys.stats() })
      if (data.employeeId) {
        queryClient.invalidateQueries({ queryKey: leaveKeys.balance(data.employeeId) })
      }
    },
  })
}

// Confirm return from leave
export const useConfirmReturn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, returnDate }: { requestId: string; returnDate: string }) =>
      confirmReturn(requestId, returnDate),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
    },
  })
}

// Request extension
export const useRequestExtension = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, extensionDays, reason }: { requestId: string; extensionDays: number; reason: string }) =>
      requestExtension(requestId, extensionDays, reason),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, file, documentType }: { requestId: string; file: File; documentType: string }) =>
      uploadLeaveDocument(requestId, file, documentType),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
    },
  })
}

// Complete handover
export const useCompleteHandover = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) => completeHandover(requestId),
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(requestId) })
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
