import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  type AttendanceFilters,
  type CreateAttendanceData,
  type UpdateAttendanceData,
  type BreakRecord,
  type CheckMethod,
  type CheckLocation,
  type CorrectionRequest,
} from '@/services/attendanceService'

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
  })
}

// Get single attendance record
export const useAttendanceRecord = (recordId: string) => {
  return useQuery({
    queryKey: attendanceKeys.detail(recordId),
    queryFn: () => getAttendanceRecord(recordId),
    enabled: !!recordId,
  })
}

// Create attendance record
export const useCreateAttendanceRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAttendanceData) => createAttendanceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() })
    },
  })
}

// Update attendance record
export const useUpdateAttendanceRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: UpdateAttendanceData }) =>
      updateAttendanceRecord(recordId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

// Delete attendance record
export const useDeleteAttendanceRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recordId: string) => deleteAttendanceRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

// Check-in
export const useCheckIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      employeeId: string
      method: CheckMethod
      location?: Partial<CheckLocation>
      notes?: string
    }) => checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() })
    },
  })
}

// Check-out
export const useCheckOut = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      employeeId: string
      method: CheckMethod
      location?: Partial<CheckLocation>
      notes?: string
    }) => checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() })
    },
  })
}

// Add break
export const useAddBreak = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, breakData }: { recordId: string; breakData: BreakRecord }) =>
      addBreak(recordId, breakData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
    },
  })
}

// Request correction
export const useRequestCorrection = () => {
  const queryClient = useQueryClient()

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() })
    },
  })
}

// Approve correction
export const useApproveCorrection = () => {
  const queryClient = useQueryClient()

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() })
    },
  })
}

// Reject correction
export const useRejectCorrection = () => {
  const queryClient = useQueryClient()

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() })
    },
  })
}

// Excuse late arrival
export const useExcuseLateArrival = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      excuseLateArrival(recordId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

// Approve early departure
export const useApproveEarlyDeparture = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, comments }: { recordId: string; comments?: string }) =>
      approveEarlyDeparture(recordId, comments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

// Approve timesheet
export const useApproveTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, comments }: { recordId: string; comments?: string }) =>
      approveTimesheet(recordId, comments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() })
    },
  })
}

// Reject timesheet
export const useRejectTimesheet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      rejectTimesheet(recordId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() })
    },
  })
}

// Approve overtime
export const useApproveOvertime = () => {
  const queryClient = useQueryClient()

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.pendingApprovals() })
    },
  })
}

// Get daily summary
export const useDailySummary = (date: string, department?: string) => {
  return useQuery({
    queryKey: attendanceKeys.dailySummary(date, department),
    queryFn: () => getDailySummary(date, department),
    enabled: !!date,
  })
}

// Get employee summary
export const useEmployeeSummary = (employeeId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: attendanceKeys.employeeSummary(employeeId, startDate, endDate),
    queryFn: () => getEmployeeSummary(employeeId, startDate, endDate),
    enabled: !!employeeId && !!startDate && !!endDate,
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
  })
}

// Get today's attendance
export const useTodayAttendance = (department?: string) => {
  return useQuery({
    queryKey: attendanceKeys.today(department),
    queryFn: () => getTodayAttendance(department),
    refetchInterval: 60000, // Refresh every minute
  })
}

// Get pending approvals
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: attendanceKeys.pendingApprovals(),
    queryFn: () => getPendingApprovals(),
  })
}

// Bulk check-in
export const useBulkCheckIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (records: CreateAttendanceData[]) => bulkCheckIn(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() })
    },
  })
}

// Lock for payroll
export const useLockForPayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordIds, payrollRunId }: { recordIds: string[]; payrollRunId: string }) =>
      lockForPayroll(recordIds, payrollRunId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() })
    },
  })
}

// Get violations
export const useViolations = (recordId: string) => {
  return useQuery({
    queryKey: attendanceKeys.violations(recordId),
    queryFn: () => getViolations(recordId),
    enabled: !!recordId,
  })
}

// Confirm violation
export const useConfirmViolation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, violationId }: { recordId: string; violationId: string }) =>
      confirmViolation(recordId, violationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.violations(variables.recordId) })
    },
  })
}

// Dismiss violation
export const useDismissViolation = () => {
  const queryClient = useQueryClient()

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.recordId) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.violations(variables.recordId) })
    },
  })
}

// Get compliance report
export const useComplianceReport = (startDate: string, endDate: string, department?: string) => {
  return useQuery({
    queryKey: attendanceKeys.complianceReport(startDate, endDate, department),
    queryFn: () => getComplianceReport(startDate, endDate, department),
    enabled: !!startDate && !!endDate,
  })
}
