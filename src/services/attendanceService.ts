import api from './api'

// Check-in Method Types
export type CheckMethod = 'biometric' | 'mobile' | 'manual' | 'web' | 'card_swipe'

// Attendance Status
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_departure' |
  'on_leave' | 'weekend' | 'holiday' | 'half_day'

// Location Type
export type LocationType = 'office' | 'remote' | 'client_site' | 'court' | 'field' | 'other'

// Shift Type
export type ShiftType = 'regular' | 'morning' | 'evening' | 'night' | 'rotating'

// Late Category
export type LateCategory = 'minor' | 'moderate' | 'severe'

// Absence Reason
export type AbsenceReason = 'sick' | 'family_emergency' | 'personal' | 'unknown' | 'other'

// Violation Severity
export type ViolationSeverity = 'minor' | 'moderate' | 'severe'

// Status Labels
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, { ar: string; en: string; color: string }> = {
  present: { ar: 'حاضر', en: 'Present', color: 'emerald' },
  absent: { ar: 'غائب', en: 'Absent', color: 'red' },
  late: { ar: 'متأخر', en: 'Late', color: 'amber' },
  early_departure: { ar: 'انصراف مبكر', en: 'Early Departure', color: 'orange' },
  on_leave: { ar: 'في إجازة', en: 'On Leave', color: 'purple' },
  weekend: { ar: 'عطلة نهاية الأسبوع', en: 'Weekend', color: 'slate' },
  holiday: { ar: 'عطلة رسمية', en: 'Holiday', color: 'blue' },
  half_day: { ar: 'نصف يوم', en: 'Half Day', color: 'cyan' },
}

// Check Method Labels
export const CHECK_METHOD_LABELS: Record<CheckMethod, { ar: string; en: string }> = {
  biometric: { ar: 'بصمة', en: 'Biometric' },
  mobile: { ar: 'تطبيق الجوال', en: 'Mobile App' },
  manual: { ar: 'يدوي', en: 'Manual' },
  web: { ar: 'الويب', en: 'Web' },
  card_swipe: { ar: 'بطاقة', en: 'Card Swipe' },
}

// Day of Week Labels
export const DAY_OF_WEEK_LABELS: Record<string, { ar: string; en: string }> = {
  sunday: { ar: 'الأحد', en: 'Sunday' },
  monday: { ar: 'الاثنين', en: 'Monday' },
  tuesday: { ar: 'الثلاثاء', en: 'Tuesday' },
  wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
  thursday: { ar: 'الخميس', en: 'Thursday' },
  friday: { ar: 'الجمعة', en: 'Friday' },
  saturday: { ar: 'السبت', en: 'Saturday' },
}

// Location Interface
export interface CheckLocation {
  type: LocationType
  locationName?: string
  latitude?: number
  longitude?: number
  accuracy?: number
  ipAddress?: string
  deviceId?: string
  deviceType?: string
}

// Biometric Interface
export interface BiometricVerification {
  type: 'fingerprint' | 'face_recognition' | 'iris' | 'card'
  verified: boolean
  confidence?: number
  deviceId?: string
}

// Check-in/out Details
export interface CheckDetails {
  time?: string
  method?: CheckMethod
  location?: CheckLocation
  biometric?: BiometricVerification
  photoUrl?: string
  notes?: string
}

// Break Interface
export interface BreakRecord {
  breakType: 'lunch' | 'prayer' | 'rest' | 'smoke' | 'personal' | 'meeting' | 'other'
  breakName?: string
  breakNameAr?: string
  startTime?: string
  endTime?: string
  duration: number
  paid: boolean
  authorized: boolean
}

// Late Arrival Interface
export interface LateArrival {
  isLate: boolean
  lateMinutes: number
  lateCategory: LateCategory
  gracePeriodMinutes: number
  withinGracePeriod: boolean
  actualLateMinutes: number
  reasonProvided: boolean
  reason?: string
  reasonCategory?: 'traffic' | 'health' | 'family_emergency' | 'vehicle_breakdown' |
                   'public_transport' | 'weather' | 'other'
  evidenceProvided?: boolean
  evidenceUrl?: string
  excused: boolean
  excusedBy?: string
  excuseDate?: string
  deductionApplicable: boolean
  deductionMinutes?: number
  deductionAmount?: number
}

// Early Departure Interface
export interface EarlyDeparture {
  isEarlyDeparture: boolean
  earlyMinutes: number
  earlyCategory: LateCategory
  permissionObtained: boolean
  permissionFrom?: string
  permissionDate?: string
  reason?: string
  reasonCategory?: 'health' | 'family_emergency' | 'personal' | 'appointment' | 'other'
  evidenceProvided?: boolean
  approved: boolean
  approvedBy?: string
  deductionApplicable: boolean
  deductionMinutes?: number
  deductionAmount?: number
}

// Absence Interface
export interface AbsenceRecord {
  isAbsent: boolean
  absenceType: 'full_day' | 'half_day' | 'partial'
  absentHours?: number
  notificationProvided: boolean
  notificationDate?: string
  notificationMethod?: 'call' | 'email' | 'whatsapp' | 'sms'
  notifiedTo?: string
  reason?: string
  reasonCategory: AbsenceReason
  documentationProvided?: boolean
  documentationUrl?: string
  authorized: boolean
  authorizedBy?: string
  authorizationType?: 'approved_leave' | 'emergency_approval' | 'retroactive_approval'
  leaveRequestId?: string
  deductionApplicable: boolean
  deductionDays?: number
  deductionAmount?: number
}

// Overtime Details
export interface OvertimeDetails {
  overtimeRate: number
  overtimeBreakdown: Array<{
    periodStart: string
    periodEnd: string
    hours: number
    rate: number
    authorized: boolean
    authorizedBy?: string
    authorizationDate?: string
    reason?: string
  }>
  preApproved: boolean
  preApprovalId?: string
  approved: boolean
  approvedBy?: string
  approvedOn?: string
  rejectionReason?: string
}

// Violation Interface
export interface AttendanceViolation {
  violationId: string
  violationCode: string
  violationType: string
  violationDescription: string
  violationDescriptionAr?: string
  autoDetected: boolean
  detectionDate: string
  detectionRule: string
  severity: ViolationSeverity
  offenseCount: number
  details: {
    lateMinutes?: number
    absentDays?: number
    earlyMinutes?: number
    scheduledTime?: string
    actualTime?: string
  }
  penalty: {
    penaltyType: 'warning' | 'percentage' | 'days_suspension'
    penaltyPercentage?: number
    penaltyDays?: number
    deductionAmount?: number
    additionalDeduction?: number
    totalDeduction?: number
  }
  status: 'detected' | 'pending_review' | 'confirmed' | 'dismissed' | 'appealed'
  reviewedBy?: string
  reviewDate?: string
  reviewNotes?: string
  confirmed: boolean
  confirmedBy?: string
  confirmationDate?: string
  employeeNotified: boolean
  notificationDate?: string
  appealable: boolean
  appealed?: boolean
  appealDeadline?: string
  appealDate?: string
  appealDecision?: 'upheld' | 'overturned' | 'modified'
  formalViolationId?: string
}

// Compliance Check Interface
export interface ComplianceCheck {
  checkType: string
  checkTypeAr: string
  required: boolean
  actual: number
  limit: number
  compliant: boolean
  note?: string
}

// Correction Request
export interface CorrectionRequest {
  correctionId: string
  requestDate: string
  requestedBy: string
  correctionType: 'missed_checkin' | 'missed_checkout' | 'wrong_time' | 'wrong_location' | 'other'
  field: string
  originalValue?: string
  requestedValue: string
  reason: string
  evidenceProvided?: boolean
  evidenceUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewDate?: string
  reviewComments?: string
  approved: boolean
  approvedBy?: string
  approvalDate?: string
  appliedOn?: string
}

// Main Attendance Record Interface
export interface AttendanceRecord {
  _id: string
  recordId: string
  recordNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId?: string
  department?: string
  jobTitle?: string
  shift?: string

  // Date Info
  dateInfo: {
    workDate: string
    dayOfWeek: string
    dayOfWeekAr: string
    weekNumber: number
    monthNumber: number
    year: number
    isWeekend: boolean
    weekendDay?: string
    isPublicHoliday: boolean
    holidayName?: string
    holidayNameAr?: string
    holidayType?: 'national' | 'religious' | 'other'
    isRamadan: boolean
    ramadanDay?: number
    calendarType: 'hijri' | 'gregorian'
    hijriDate?: string
    gregorianDate: string
  }

  // Scheduled Time
  scheduledTime: {
    scheduledCheckIn: string
    scheduledCheckOut: string
    scheduledHours: number
    shiftId?: string
    shiftName?: string
    shiftType?: ShiftType
    scheduleSource: 'default' | 'roster' | 'custom' | 'shift_swap'
    flexibleSchedule: boolean
    coreHoursStart?: string
    coreHoursEnd?: string
    ramadanSchedule: boolean
    ramadanScheduledHours?: number
  }

  // Actual Time
  checkIn: CheckDetails
  checkOut: CheckDetails

  // Hours
  hoursWorked: number
  regularHours: number
  overtimeHours: number

  // Status
  status: AttendanceStatus

  // Late/Early
  lateArrival?: LateArrival
  earlyDeparture?: EarlyDeparture

  // Absence
  absence?: AbsenceRecord

  // Breaks
  breaks?: {
    lunchBreak?: BreakRecord
    prayerBreaks?: BreakRecord[]
    otherBreaks?: BreakRecord[]
    totalBreakTime: number
    totalPaidBreaks: number
    totalUnpaidBreaks: number
  }

  // Overtime
  overtimeDetails?: OvertimeDetails

  // Violations
  violations?: {
    hasViolations: boolean
    violationCount: number
    detectedViolations: AttendanceViolation[]
  }

  // Compliance
  complianceChecks?: {
    dailyHoursCheck: ComplianceCheck
    breakRequirementCheck: ComplianceCheck
    overtimeLimitsCheck: ComplianceCheck
    restBetweenShiftsCheck?: ComplianceCheck
    weeklyRestCheck?: ComplianceCheck
    ramadanHoursCheck?: ComplianceCheck
    overallCompliance: 'compliant' | 'warning' | 'violation'
    complianceNotes?: string
  }

  // Location
  workLocation?: LocationType
  locationDetails?: {
    officeName?: string
    officeAddress?: string
    clientName?: string
    siteName?: string
  }

  // Corrections
  corrections?: {
    hasCorrections: boolean
    correctionCount: number
    correctionRequests: CorrectionRequest[]
  }

  // Payroll Integration
  payrollIntegration: {
    processedInPayroll: boolean
    payrollRunId?: string
    payrollProcessDate?: string
    payrollHours: {
      regularHours: number
      overtimeHours: number
      paidBreakHours: number
      unpaidBreakHours: number
      totalPayableHours: number
    }
    payrollDeductions: {
      lateDeduction: number
      absenceDeduction: number
      earlyDepartureDeduction: number
      violationDeductions: number
      totalDeductions: number
    }
    overtimePay?: {
      overtimeHours: number
      hourlyRate: number
      overtimeRate: number
      overtimeAmount: number
    }
    locked: boolean
    lockedDate?: string
    lockedBy?: string
  }

  // Notes
  notes?: {
    employeeNotes?: string
    managerNotes?: string
    systemNotes?: string
    flagged: boolean
    flagReason?: string
    flaggedBy?: string
    flaggedDate?: string
  }

  // Approvals
  approvals?: {
    requiresApproval: boolean
    timesheetApproval: {
      required: boolean
      status: 'pending' | 'approved' | 'rejected'
      approvedBy?: string
      approverName?: string
      approvalDate?: string
      approvalComments?: string
      rejectedBy?: string
      rejectionDate?: string
      rejectionReason?: string
    }
    overtimeApproval?: {
      required: boolean
      status: 'pending' | 'approved' | 'rejected'
      requestedHours: number
      approvedHours?: number
      approvedBy?: string
      approvalDate?: string
      rejectionReason?: string
    }
  }

  // Audit
  createdOn: string
  createdBy: string
  creationMethod: 'auto' | 'manual' | 'import'
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Attendance Record Data
export interface CreateAttendanceData {
  employeeId: string
  workDate: string
  checkIn?: {
    time?: string
    method?: CheckMethod
    location?: Partial<CheckLocation>
    notes?: string
  }
  checkOut?: {
    time?: string
    method?: CheckMethod
    location?: Partial<CheckLocation>
    notes?: string
  }
  status?: AttendanceStatus
  notes?: {
    employeeNotes?: string
    managerNotes?: string
  }
}

// Update Attendance Data
export interface UpdateAttendanceData extends Partial<CreateAttendanceData> {
  breaks?: BreakRecord[]
  lateArrival?: Partial<LateArrival>
  earlyDeparture?: Partial<EarlyDeparture>
  absence?: Partial<AbsenceRecord>
}

// Attendance Records Response
export interface AttendanceRecordsResponse {
  data: AttendanceRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Attendance Filters
export interface AttendanceFilters {
  employeeId?: string
  department?: string
  status?: AttendanceStatus
  startDate?: string
  endDate?: string
  workLocation?: LocationType
  hasViolations?: boolean
  page?: number
  limit?: number
}

// Daily Summary
export interface DailySummary {
  date: string
  totalEmployees: number
  present: number
  absent: number
  late: number
  earlyDeparture: number
  onLeave: number
  weekend: number
  holiday: number
  presentPercentage: number
  totalWorkHours: number
  totalOvertimeHours: number
}

// Employee Summary
export interface EmployeeSummary {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  period: {
    startDate: string
    endDate: string
  }
  workDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  earlyDepartureDays: number
  leaveDays: number
  totalWorkHours: number
  totalOvertimeHours: number
  averageWorkHours: number
  attendanceRate: number
  punctualityRate: number
  violationCount: number
  totalDeductions: number
}

// API Functions
export const getAttendanceRecords = async (filters?: AttendanceFilters): Promise<AttendanceRecordsResponse> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.workLocation) params.append('workLocation', filters.workLocation)
  if (filters?.hasViolations !== undefined) params.append('hasViolations', String(filters.hasViolations))
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/attendance?${params.toString()}`)
  return response.data
}

export const getAttendanceRecord = async (recordId: string): Promise<AttendanceRecord> => {
  const response = await api.get(`/attendance/${recordId}`)
  return response.data
}

export const createAttendanceRecord = async (data: CreateAttendanceData): Promise<AttendanceRecord> => {
  const response = await api.post('/attendance', data)
  return response.data
}

export const updateAttendanceRecord = async (recordId: string, data: UpdateAttendanceData): Promise<AttendanceRecord> => {
  const response = await api.patch(`/attendance/${recordId}`, data)
  return response.data
}

export const deleteAttendanceRecord = async (recordId: string): Promise<void> => {
  await api.delete(`/attendance/${recordId}`)
}

// Check-in
export const checkIn = async (data: {
  employeeId: string
  method: CheckMethod
  location?: Partial<CheckLocation>
  notes?: string
}): Promise<AttendanceRecord> => {
  const response = await api.post('/attendance/check-in', data)
  return response.data
}

// Check-out
export const checkOut = async (data: {
  employeeId: string
  method: CheckMethod
  location?: Partial<CheckLocation>
  notes?: string
}): Promise<AttendanceRecord> => {
  const response = await api.post('/attendance/check-out', data)
  return response.data
}

// Add break
export const addBreak = async (recordId: string, breakData: BreakRecord): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/breaks`, breakData)
  return response.data
}

// Request correction
export const requestCorrection = async (recordId: string, data: {
  correctionType: CorrectionRequest['correctionType']
  field: string
  requestedValue: string
  reason: string
  evidenceUrl?: string
}): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/corrections`, data)
  return response.data
}

// Approve correction
export const approveCorrection = async (recordId: string, correctionId: string, comments?: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/corrections/${correctionId}/approve`, { comments })
  return response.data
}

// Reject correction
export const rejectCorrection = async (recordId: string, correctionId: string, reason: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/corrections/${correctionId}/reject`, { reason })
  return response.data
}

// Excuse late arrival
export const excuseLateArrival = async (recordId: string, reason: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/excuse-late`, { reason })
  return response.data
}

// Approve early departure
export const approveEarlyDeparture = async (recordId: string, comments?: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/approve-early-departure`, { comments })
  return response.data
}

// Approve timesheet
export const approveTimesheet = async (recordId: string, comments?: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/approve-timesheet`, { comments })
  return response.data
}

// Reject timesheet
export const rejectTimesheet = async (recordId: string, reason: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/reject-timesheet`, { reason })
  return response.data
}

// Approve overtime
export const approveOvertime = async (recordId: string, approvedHours: number, comments?: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/attendance/${recordId}/approve-overtime`, { approvedHours, comments })
  return response.data
}

// Get daily summary
export const getDailySummary = async (date: string, department?: string): Promise<DailySummary> => {
  const params = new URLSearchParams()
  params.append('date', date)
  if (department) params.append('department', department)

  const response = await api.get(`/attendance/daily-summary?${params.toString()}`)
  return response.data
}

// Get employee summary
export const getEmployeeSummary = async (employeeId: string, startDate: string, endDate: string): Promise<EmployeeSummary> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)

  const response = await api.get(`/attendance/employee-summary/${employeeId}?${params.toString()}`)
  return response.data
}

// Get attendance stats
export const getAttendanceStats = async (filters?: {
  startDate?: string
  endDate?: string
  department?: string
}): Promise<{
  totalRecords: number
  presentCount: number
  absentCount: number
  lateCount: number
  earlyDepartureCount: number
  averageWorkHours: number
  totalOvertimeHours: number
  attendanceRate: number
  punctualityRate: number
  violationCount: number
  byDepartment: Record<string, { present: number; absent: number; late: number }>
  byDay: Array<{ date: string; present: number; absent: number; late: number }>
}> => {
  const params = new URLSearchParams()
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.department) params.append('department', filters.department)

  const response = await api.get(`/attendance/stats?${params.toString()}`)
  return response.data
}

// Get today's attendance
export const getTodayAttendance = async (department?: string): Promise<{
  date: string
  summary: DailySummary
  records: AttendanceRecord[]
}> => {
  const params = new URLSearchParams()
  if (department) params.append('department', department)

  const response = await api.get(`/attendance/today?${params.toString()}`)
  return response.data
}

// Get pending approvals
export const getPendingApprovals = async (): Promise<{
  timesheets: AttendanceRecord[]
  corrections: AttendanceRecord[]
  overtime: AttendanceRecord[]
}> => {
  const response = await api.get('/attendance/pending-approvals')
  return response.data
}

// Bulk check-in (for import)
export const bulkCheckIn = async (records: CreateAttendanceData[]): Promise<{
  success: number
  failed: number
  errors: Array<{ index: number; error: string }>
}> => {
  const response = await api.post('/attendance/bulk', { records })
  return response.data
}

// Lock records for payroll
export const lockForPayroll = async (recordIds: string[], payrollRunId: string): Promise<void> => {
  await api.post('/attendance/lock-for-payroll', { recordIds, payrollRunId })
}

// Get violations
export const getViolations = async (recordId: string): Promise<AttendanceViolation[]> => {
  const response = await api.get(`/attendance/${recordId}/violations`)
  return response.data
}

// Confirm violation
export const confirmViolation = async (recordId: string, violationId: string): Promise<AttendanceViolation> => {
  const response = await api.post(`/attendance/${recordId}/violations/${violationId}/confirm`)
  return response.data
}

// Dismiss violation
export const dismissViolation = async (recordId: string, violationId: string, reason: string): Promise<AttendanceViolation> => {
  const response = await api.post(`/attendance/${recordId}/violations/${violationId}/dismiss`, { reason })
  return response.data
}

// Get compliance report
export const getComplianceReport = async (startDate: string, endDate: string, department?: string): Promise<{
  period: { startDate: string; endDate: string }
  overallCompliance: number
  violations: {
    total: number
    byType: Record<string, number>
    bySeverity: Record<ViolationSeverity, number>
  }
  checks: {
    dailyHours: { compliant: number; violations: number }
    breaks: { compliant: number; violations: number }
    overtime: { compliant: number; violations: number }
  }
  recommendations: string[]
}> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (department) params.append('department', department)

  const response = await api.get(`/attendance/compliance-report?${params.toString()}`)
  return response.data
}
