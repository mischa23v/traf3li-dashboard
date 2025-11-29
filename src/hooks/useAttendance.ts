/**
 * Attendance Hooks
 * React Query hooks for Attendance management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { attendanceService } from '@/services/hrService'
import type { AttendanceFilters, CheckInData, CheckOutData, AttendanceRecord } from '@/types/hr'

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all attendance records with optional filters
 */
export const useAttendance = (filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceService.getAttendance(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single attendance record
 */
export const useAttendanceRecord = (attendanceId: string) => {
  return useQuery({
    queryKey: ['attendance', attendanceId],
    queryFn: () => attendanceService.getAttendanceRecord(attendanceId),
    enabled: !!attendanceId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get today's attendance
 */
export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => attendanceService.getTodayAttendance(),
    staleTime: 1 * 60 * 1000, // Refresh more frequently
    refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 minutes
  })
}

/**
 * Get attendance summary
 */
export const useAttendanceSummary = (params?: {
  employeeId?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['attendance', 'summary', params],
    queryFn: () => attendanceService.getSummary(params),
    enabled:
      !!params?.employeeId || (!!params?.startDate && !!params?.endDate),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get late arrivals report
 */
export const useLateReport = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['attendance', 'late-report', params],
    queryFn: () => attendanceService.getLateReport(params),
    staleTime: 5 * 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Check in
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CheckInData) => attendanceService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم تسجيل الحضور بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الحضور')
    },
  })
}

/**
 * Check out
 */
export const useCheckOut = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CheckOutData) => attendanceService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم تسجيل الانصراف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الانصراف')
    },
  })
}

/**
 * Update attendance record
 */
export const useUpdateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      attendanceId,
      data,
    }: {
      attendanceId: string
      data: Partial<AttendanceRecord>
    }) => attendanceService.updateAttendance(attendanceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({
        queryKey: ['attendance', variables.attendanceId],
      })
      toast.success('تم تحديث سجل الحضور بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث سجل الحضور')
    },
  })
}

/**
 * Delete attendance record
 */
export const useDeleteAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attendanceId: string) =>
      attendanceService.deleteAttendance(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم حذف سجل الحضور بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف سجل الحضور')
    },
  })
}

/**
 * Create manual attendance entry
 */
export const useCreateManualAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      employeeId: string
      date: string
      checkInTime?: string
      checkOutTime?: string
      status: string
      notes?: string
    }) => attendanceService.createManualEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم إضافة سجل الحضور بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة سجل الحضور')
    },
  })
}

/**
 * Mark employee as absent
 */
export const useMarkAbsent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeId, date }: { employeeId: string; date: string }) =>
      attendanceService.markAbsent(employeeId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم تسجيل الغياب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الغياب')
    },
  })
}

/**
 * Start break
 */
export const useStartBreak = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attendanceId: string) =>
      attendanceService.startBreak(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم بدء الاستراحة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل بدء الاستراحة')
    },
  })
}

/**
 * End break
 */
export const useEndBreak = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attendanceId: string) =>
      attendanceService.endBreak(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم إنهاء الاستراحة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنهاء الاستراحة')
    },
  })
}

/**
 * Approve overtime
 */
export const useApproveOvertime = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      attendanceId,
      hours,
    }: {
      attendanceId: string
      hours: number
    }) => attendanceService.approveOvertime(attendanceId, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      toast.success('تم اعتماد ساعات العمل الإضافي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل اعتماد ساعات العمل الإضافي')
    },
  })
}
