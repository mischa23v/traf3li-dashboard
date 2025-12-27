import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getAttendanceRecords,
  getAttendanceRecord,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  checkIn,
  checkOut,
  addBreak,
  requestCorrection,
  approveCorrection,
  rejectCorrection,
  excuseLateArrival,
  approveEarlyDeparture,
  approveTimesheet,
  rejectTimesheet,
  approveOvertime,
  getDailySummary,
  getEmployeeSummary,
  getAttendanceStats,
  getTodayAttendance,
  getPendingApprovals,
  bulkCheckIn,
  lockForPayroll,
  getViolations,
  confirmViolation,
  dismissViolation,
  getComplianceReport,
  getAllViolations,
  getMonthlyReport,
  getDepartmentStats,
  getCheckInStatus,
  getAttendanceSummaryForEmployee,
  getAttendanceByEmployeeAndDate,
  markAbsences,
  importAttendance,
  startBreak,
  endBreak,
  getBreaks,
  submitCorrection,
  reviewCorrection,
  approveAttendance,
  rejectAttendance,
  addViolation,
  resolveViolation,
  appealViolation,
  approveOvertimeForRecord,
  type AttendanceFilters,
  type CreateAttendanceData,
  type UpdateAttendanceData,
  type BreakRecord,
  type CheckMethod,
  type CheckLocation,
  type CorrectionRequest,
} from '@/services/attendanceService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query Keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (filters?: AttendanceFilters) => [...attendanceKeys.lists(), filters] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  dailySummary: (date: string, department?: string) => [...attendanceKeys.all, 'daily-summary', date, department] as const,
  employeeSummary: (employeeId: string, startDate: string, endDate: string) =>
    [...attendanceKeys.all, 'employee-summary', employeeId, startDate, endDate] as const,
  stats: (filters?: { startDate?: string; endDate?: string; department?: string }) =>
    [...attendanceKeys.all, 'stats', filters] as const,
  today: (department?: string) => [...attendanceKeys.all, 'today', department] as const,
  pendingApprovals: () => [...attendanceKeys.all, 'pending-approvals'] as const,
  violations: (recordId: string) => [...attendanceKeys.all, 'violations', recordId] as const,
  complianceReport: (startDate: string, endDate: string, department?: string) =>
    [...attendanceKeys.all, 'compliance-report', startDate, endDate, department] as const,
}

// Get attendance records
export const useAttendanceRecords = (filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: () => getAttendanceRecords(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single attendance record
export const useAttendanceRecord = (recordId: string) => {
  return useQuery({
    queryKey: attendanceKeys.detail(recordId),
    queryFn: () => getAttendanceRecord(recordId),
    enabled: !!recordId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create attendance record
export const useCreateAttendanceRecord = () => {
  return useMutation({
    mutationFn: (data: CreateAttendanceData) => createAttendanceRecord(data),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Update attendance record
export const useUpdateAttendanceRecord = () => {
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: UpdateAttendanceData }) =>
      updateAttendanceRecord(recordId, data),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Delete attendance record
export const useDeleteAttendanceRecord = () => {
  return useMutation({
    mutationFn: (recordId: string) => deleteAttendanceRecord(recordId),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Check-in
export const useCheckIn = () => {
  return useMutation({
    mutationFn: (data: {
      employeeId: string
      method: CheckMethod
      location?: Partial<CheckLocation>
      notes?: string
    }) => checkIn(data),
    onSuccess: (_, variables) => {
      Promise.all([
        invalidateCache.attendance.all(),
        invalidateCache.attendance.checkInStatus(variables.employeeId)
      ])
    },
  })
}

// Check-out
export const useCheckOut = () => {
  return useMutation({
    mutationFn: (data: {
      employeeId: string
      method: CheckMethod
      location?: Partial<CheckLocation>
      notes?: string
    }) => checkOut(data),
    onSuccess: (_, variables) => {
      Promise.all([
        invalidateCache.attendance.all(),
        invalidateCache.attendance.checkInStatus(variables.employeeId)
      ])
    },
  })
}

// Add break
export const useAddBreak = () => {
  return useMutation({
    mutationFn: ({ recordId, breakData }: { recordId: string; breakData: BreakRecord }) =>
      addBreak(recordId, breakData),
    onSuccess: (_, variables) => {
      invalidateCache.attendance.breaks(variables.recordId)
    },
  })
}

// Request correction
export const useRequestCorrection = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: string
      data: {
        correctionType: CorrectionRequest['correctionType']
        field: string
        requestedValue: string
        reason: string
        evidenceUrl?: string
      }
    }) => requestCorrection(recordId, data),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Approve correction
export const useApproveCorrection = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      correctionId,
      comments,
    }: {
      recordId: string
      correctionId: string
      comments?: string
    }) => approveCorrection(recordId, correctionId, comments),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Reject correction
export const useRejectCorrection = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      correctionId,
      reason,
    }: {
      recordId: string
      correctionId: string
      reason: string
    }) => rejectCorrection(recordId, correctionId, reason),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Excuse late arrival
export const useExcuseLateArrival = () => {
  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      excuseLateArrival(recordId, reason),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Approve early departure
export const useApproveEarlyDeparture = () => {
  return useMutation({
    mutationFn: ({ recordId, comments }: { recordId: string; comments?: string }) =>
      approveEarlyDeparture(recordId, comments),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Approve timesheet
export const useApproveTimesheet = () => {
  return useMutation({
    mutationFn: ({ recordId, comments }: { recordId: string; comments?: string }) =>
      approveTimesheet(recordId, comments),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Reject timesheet
export const useRejectTimesheet = () => {
  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      rejectTimesheet(recordId, reason),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Approve overtime
export const useApproveOvertime = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      approvedHours,
      comments,
    }: {
      recordId: string
      approvedHours: number
      comments?: string
    }) => approveOvertime(recordId, approvedHours, comments),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Get daily summary
export const useDailySummary = (date: string, department?: string) => {
  return useQuery({
    queryKey: attendanceKeys.dailySummary(date, department),
    queryFn: () => getDailySummary(date, department),
    enabled: !!date,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee summary
export const useEmployeeSummary = (employeeId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: attendanceKeys.employeeSummary(employeeId, startDate, endDate),
    queryFn: () => getEmployeeSummary(employeeId, startDate, endDate),
    enabled: !!employeeId && !!startDate && !!endDate,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get attendance stats
export const useAttendanceStats = (filters?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery({
    queryKey: attendanceKeys.stats(filters),
    queryFn: () => getAttendanceStats(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get today's attendance
export const useTodayAttendance = (department?: string) => {
  return useQuery({
    queryKey: attendanceKeys.today(department),
    queryFn: () => getTodayAttendance(department),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    refetchInterval: 60000, // Refresh every minute
    retry: false,
  })
}

// Get pending approvals
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: attendanceKeys.pendingApprovals(),
    queryFn: () => getPendingApprovals(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Bulk check-in
export const useBulkCheckIn = () => {
  return useMutation({
    mutationFn: (records: CreateAttendanceData[]) => bulkCheckIn(records),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Lock for payroll
export const useLockForPayroll = () => {
  return useMutation({
    mutationFn: ({ recordIds, payrollRunId }: { recordIds: string[]; payrollRunId: string }) =>
      lockForPayroll(recordIds, payrollRunId),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Get violations
export const useViolations = (recordId: string) => {
  return useQuery({
    queryKey: attendanceKeys.violations(recordId),
    queryFn: () => getViolations(recordId),
    enabled: !!recordId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Confirm violation
export const useConfirmViolation = () => {
  return useMutation({
    mutationFn: ({ recordId, violationId }: { recordId: string; violationId: string }) =>
      confirmViolation(recordId, violationId),
    onSuccess: () => {
      invalidateCache.attendance.violations()
    },
  })
}

// Dismiss violation
export const useDismissViolation = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      violationId,
      reason,
    }: {
      recordId: string
      violationId: string
      reason: string
    }) => dismissViolation(recordId, violationId, reason),
    onSuccess: () => {
      invalidateCache.attendance.violations()
    },
  })
}

// Get compliance report
export const useComplianceReport = (startDate: string, endDate: string, department?: string) => {
  return useQuery({
    queryKey: attendanceKeys.complianceReport(startDate, endDate, department),
    queryFn: () => getComplianceReport(startDate, endDate, department),
    enabled: !!startDate && !!endDate,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Additional hooks for backend-aligned functions

// Get all violations (global)
export const useAllViolations = () => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'all-violations'],
    queryFn: getAllViolations,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get monthly report
export const useMonthlyReport = (month?: number, year?: number, department?: string) => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'monthly-report', month, year, department],
    queryFn: () => getMonthlyReport(month, year, department),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get department stats
export const useDepartmentStats = (department?: string) => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'department-stats', department],
    queryFn: () => getDepartmentStats(department),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get check-in status
export const useCheckInStatus = (employeeId: string) => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'check-in-status', employeeId],
    queryFn: () => getCheckInStatus(employeeId),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false,
  })
}

// Get attendance summary for employee (alternative to useEmployeeSummary)
export const useAttendanceSummaryForEmployee = (employeeId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'employee-summary-alt', employeeId, startDate, endDate],
    queryFn: () => getAttendanceSummaryForEmployee(employeeId, startDate, endDate),
    enabled: !!employeeId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get attendance by employee and date
export const useAttendanceByEmployeeAndDate = (employeeId: string, date: string) => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'by-employee-date', employeeId, date],
    queryFn: () => getAttendanceByEmployeeAndDate(employeeId, date),
    enabled: !!employeeId && !!date,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Mark absences for a date
export const useMarkAbsences = () => {
  return useMutation({
    mutationFn: ({ date, departmentId }: { date: string; departmentId?: string }) =>
      markAbsences(date, departmentId),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Import attendance records (bulk)
export const useImportAttendance = () => {
  return useMutation({
    mutationFn: (records: CreateAttendanceData[]) => importAttendance(records),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Start break
export const useStartBreak = () => {
  return useMutation({
    mutationFn: ({ recordId, breakData }: { recordId: string; breakData: Partial<BreakRecord> }) =>
      startBreak(recordId, breakData),
    onSuccess: (_, variables) => {
      invalidateCache.attendance.breaks(variables.recordId)
    },
  })
}

// End break
export const useEndBreak = () => {
  return useMutation({
    mutationFn: (recordId: string) => endBreak(recordId),
    onSuccess: (_, recordId) => {
      invalidateCache.attendance.breaks(recordId)
    },
  })
}

// Get breaks for a record
export const useBreaks = (recordId: string) => {
  return useQuery({
    queryKey: [...attendanceKeys.all, 'breaks', recordId],
    queryFn: () => getBreaks(recordId),
    enabled: !!recordId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Submit correction (duplicate but with different function name from requestCorrection)
export const useSubmitCorrection = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: string
      data: {
        correctionType: string
        field: string
        originalValue?: string
        requestedValue: string
        reason: string
        evidenceUrl?: string
      }
    }) => submitCorrection(recordId, data),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Review correction (backend-aligned version)
export const useReviewCorrection = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      correctionId,
      data,
    }: {
      recordId: string
      correctionId: string
      data: {
        status: 'approved' | 'rejected'
        reviewComments?: string
      }
    }) => reviewCorrection(recordId, correctionId, data),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Approve attendance (alternative to approveTimesheet)
export const useApproveAttendance = () => {
  return useMutation({
    mutationFn: ({ recordId, comments }: { recordId: string; comments?: string }) =>
      approveAttendance(recordId, comments),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Reject attendance (alternative to rejectTimesheet)
export const useRejectAttendance = () => {
  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      rejectAttendance(recordId, reason),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}

// Add violation
export const useAddViolation = () => {
  return useMutation({
    mutationFn: ({ recordId, violationData }: { recordId: string; violationData: any }) =>
      addViolation(recordId, violationData),
    onSuccess: () => {
      invalidateCache.attendance.violations()
    },
  })
}

// Resolve violation
export const useResolveViolation = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      violationIndex,
      resolutionData,
    }: {
      recordId: string
      violationIndex: number
      resolutionData: any
    }) => resolveViolation(recordId, violationIndex, resolutionData),
    onSuccess: () => {
      invalidateCache.attendance.violations()
    },
  })
}

// Appeal violation
export const useAppealViolation = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      violationIndex,
      appealData,
    }: {
      recordId: string
      violationIndex: number
      appealData: any
    }) => appealViolation(recordId, violationIndex, appealData),
    onSuccess: () => {
      invalidateCache.attendance.violations()
    },
  })
}

// Approve overtime for record (alternative to approveOvertime)
export const useApproveOvertimeForRecord = () => {
  return useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: string
      data: {
        approvedHours?: number
        comments?: string
      }
    }) => approveOvertimeForRecord(recordId, data),
    onSuccess: () => {
      invalidateCache.attendance.all()
    },
  })
}
