/**
 * Leave Hooks
 * React Query hooks for Leave management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leaveService } from '@/services/hrService'
import type { LeaveFilters, CreateLeaveData } from '@/types/hr'

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all leave requests with optional filters
 */
export const useLeaveRequests = (filters?: LeaveFilters) => {
  return useQuery({
    queryKey: ['leaves', filters],
    queryFn: () => leaveService.getLeaves(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single leave request
 */
export const useLeaveRequest = (leaveId: string) => {
  return useQuery({
    queryKey: ['leaves', leaveId],
    queryFn: () => leaveService.getLeave(leaveId),
    enabled: !!leaveId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get leave balance for employee
 */
export const useLeaveBalance = (employeeId: string) => {
  return useQuery({
    queryKey: ['leaves', 'balance', employeeId],
    queryFn: () => leaveService.getLeaveBalance(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get employees on leave today
 */
export const useTodayLeaves = () => {
  return useQuery({
    queryKey: ['leaves', 'today'],
    queryFn: () => leaveService.getTodayLeaves(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get leave statistics
 */
export const useLeaveStats = () => {
  return useQuery({
    queryKey: ['leaves', 'stats'],
    queryFn: () => leaveService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create leave request
 */
export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaveData) => leaveService.createLeave(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      queryClient.invalidateQueries({
        queryKey: ['leaves', 'balance', variables.employeeId],
      })
      toast.success('تم تقديم طلب الإجازة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تقديم طلب الإجازة')
    },
  })
}

/**
 * Update leave request
 */
export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      leaveId,
      data,
    }: {
      leaveId: string
      data: Partial<CreateLeaveData>
    }) => leaveService.updateLeave(leaveId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      queryClient.invalidateQueries({
        queryKey: ['leaves', variables.leaveId],
      })
      toast.success('تم تحديث طلب الإجازة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث طلب الإجازة')
    },
  })
}

/**
 * Delete leave request
 */
export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (leaveId: string) => leaveService.deleteLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('تم حذف طلب الإجازة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف طلب الإجازة')
    },
  })
}

/**
 * Approve leave request
 */
export const useApproveLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (leaveId: string) => leaveService.approveLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('تم اعتماد طلب الإجازة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل اعتماد طلب الإجازة')
    },
  })
}

/**
 * Reject leave request
 */
export const useRejectLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leaveId, reason }: { leaveId: string; reason: string }) =>
      leaveService.rejectLeave(leaveId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('تم رفض طلب الإجازة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض طلب الإجازة')
    },
  })
}

/**
 * Cancel leave request
 */
export const useCancelLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (leaveId: string) => leaveService.cancelLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      toast.success('تم إلغاء طلب الإجازة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء طلب الإجازة')
    },
  })
}

/**
 * Add attachment to leave request
 */
export const useAddLeaveAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      leaveId,
      data,
    }: {
      leaveId: string
      data: { url: string; name: string }
    }) => leaveService.addAttachment(leaveId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['leaves', variables.leaveId],
      })
      toast.success('تم إضافة المرفق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة المرفق')
    },
  })
}
