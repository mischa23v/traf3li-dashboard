/**
 * HR Module Types
 * Production-ready type definitions for Human Resources management
 */

// ==================== ENUMS ====================

// Updated per API contract
export type EmployeeStatus = 'active' | 'on_leave' | 'suspended' | 'terminated' | 'resigned'
export type EmployeeType = 'full_time' | 'part_time' | 'contract' | 'temporary'
export type Gender = 'male' | 'female'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export type LeaveStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'

// Updated per API contract - HR Part 3 Section 1 (Leave Types)
// Per Saudi Labor Law Articles: 109, 113, 114, 115, 117, 151, 160
export type LeaveType =
  | 'annual'        // إجازة سنوية (المادة 109) - 21-30 days
  | 'sick'          // إجازة مرضية (المادة 117) - 120 days
  | 'hajj'          // إجازة حج (المادة 114) - 10-15 days
  | 'marriage'      // إجازة زواج (المادة 113) - 5 days
  | 'birth'         // إجازة ولادة (المادة 113) - 3 days
  | 'death'         // إجازة وفاة (المادة 113) - 5 days
  | 'bereavement'   // إجازة عزاء (alias for death)
  | 'eid'           // إجازة عيد (المادة 112)
  | 'maternity'     // إجازة وضع (المادة 151) - 84 days (10 weeks pre + 4 weeks post)
  | 'paternity'     // إجازة أبوة - 3 days
  | 'exam'          // إجازة امتحان (المادة 115)
  | 'unpaid'        // إجازة بدون راتب
  | 'emergency'     // إجازة طارئة
  | 'study'         // إجازة دراسية
  | 'iddah'         // إجازة عدة (المادة 160) - 130 days (death) / 15 days (divorce)
  | 'compensatory'  // إجازة تعويضية
  | 'compassionate' // إجازة رحمة - Extended family events
  | 'other'

export type LeaveCategory = 'paid' | 'unpaid' | 'partial_pay'

// Updated per API contract - Section Attendance Records
export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'on_leave'
  | 'holiday'
  | 'weekend'
  | 'work_from_home'
  | 'field_work'
  | 'training'
  | 'incomplete'
  | 'pending'

export type SalaryStatus = 'draft' | 'approved' | 'paid' | 'cancelled'
export type PaymentMethod = 'bank_transfer' | 'cash' | 'cheque'

export type PayrollStatus = 'draft' | 'processing' | 'completed' | 'cancelled'

export type EvaluationStatus = 'draft' | 'pending_review' | 'completed' | 'archived'
export type PerformanceRating = 1 | 2 | 3 | 4 | 5

// ==================== INTERFACES ====================

/**
 * Employee Interface
 */
export interface Employee {
  id: string
  employeeId: string // Employee Number (e.g., EMP001)
  firstName: string
  lastName: string
  firstNameEn?: string
  lastNameEn?: string
  email: string
  phone?: string
  mobile?: string
  avatar?: string

  // Personal Info
  nationalId?: string
  dateOfBirth?: string
  gender?: Gender
  maritalStatus?: MaritalStatus
  nationality?: string
  address?: string
  city?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }

  // Employment Info
  department: string
  departmentId?: string
  position: string
  positionId?: string
  employeeType: EmployeeType
  status: EmployeeStatus
  hireDate: string
  endDate?: string
  probationEndDate?: string
  manager?: string
  managerId?: string

  // Salary Info
  baseSalary: number
  housingAllowance?: number
  transportAllowance?: number
  otherAllowances?: number
  currency?: string
  bankName?: string
  bankAccount?: string
  iban?: string

  // Leave Balances
  annualLeaveBalance?: number
  sickLeaveBalance?: number

  // Documents
  documents?: EmployeeDocument[]

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface EmployeeDocument {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
  expiryDate?: string
}

/**
 * Leave Request Interface
 */
export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName?: string
  employeeAvatar?: string
  department?: string

  leaveType: LeaveType
  status: LeaveStatus

  startDate: string
  endDate: string
  days: number
  halfDay?: boolean

  reason: string
  notes?: string

  // Attachments (medical certificates, etc.)
  attachments?: string[]

  // Approval
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  rejectionReason?: string

  // Audit
  createdAt: string
  updatedAt: string
}

/**
 * Attendance Record Interface
 */
export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName?: string
  employeeAvatar?: string
  department?: string

  date: string
  status: AttendanceStatus

  checkIn: string | null
  checkOut: string | null

  breakStart?: string | null
  breakEnd?: string | null

  workHours: number | null
  overtime?: number | null

  location?: string
  notes?: string

  // Audit
  createdAt: string
  updatedAt: string
}

/**
 * Salary Record Interface
 */
export interface SalaryRecord {
  id: string
  employeeId: string
  employeeName?: string
  employeeAvatar?: string
  department?: string
  position?: string

  month: number // 1-12
  year: number
  status: SalaryStatus

  // Earnings
  baseSalary: number
  housingAllowance: number
  transportAllowance: number
  otherAllowances: number
  overtime?: number
  bonus?: number
  commission?: number

  // Deductions
  socialInsurance?: number
  tax?: number
  loanDeduction?: number
  otherDeductions?: number
  absenceDeduction?: number

  // Totals
  grossSalary: number
  totalDeductions: number
  netSalary: number

  // Payment
  paymentDate?: string
  paymentMethod?: PaymentMethod
  paymentReference?: string

  notes?: string

  // Audit
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
}

/**
 * Payroll Interface
 */
export interface Payroll {
  id: string
  title: string
  month: number
  year: number
  status: PayrollStatus

  // Summary
  totalEmployees: number
  totalGrossSalary: number
  totalDeductions: number
  totalNetSalary: number

  // Period
  periodStart: string
  periodEnd: string
  paymentDate?: string

  // Details
  salaryRecords?: SalaryRecord[]

  notes?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
  processedBy?: string
  processedAt?: string
}

/**
 * Performance Evaluation Interface
 */
export interface PerformanceEvaluation {
  id: string
  employeeId: string
  employeeName?: string
  employeeAvatar?: string
  department?: string
  position?: string

  evaluatorId: string
  evaluatorName?: string

  period: string // e.g., "2024-Q1", "2024-H1", "2024"
  periodType: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
  status: EvaluationStatus

  // Ratings (1-5)
  overallRating: PerformanceRating
  criteria: EvaluationCriterion[]

  // Goals
  goals?: EvaluationGoal[]

  // Comments
  strengths?: string
  areasForImprovement?: string
  developmentPlan?: string
  employeeComments?: string
  managerComments?: string

  // Signatures
  employeeSignedAt?: string
  managerSignedAt?: string

  // Audit
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface EvaluationCriterion {
  id: string
  name: string
  nameEn?: string
  description?: string
  weight: number // percentage
  rating: PerformanceRating
  comments?: string
}

export interface EvaluationGoal {
  id: string
  title: string
  description?: string
  targetDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'not_achieved'
  progress?: number // 0-100
  comments?: string
}

// ==================== CREATE/UPDATE TYPES ====================

export type CreateEmployeeData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'documents'>
export type UpdateEmployeeData = Partial<CreateEmployeeData>

export type CreateLeaveRequestData = Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt' | 'rejectionReason'>
export type UpdateLeaveRequestData = Partial<CreateLeaveRequestData>

export type CreateAttendanceData = Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateAttendanceData = Partial<CreateAttendanceData>

export type CreateSalaryData = Omit<SalaryRecord, 'id' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt'>
export type UpdateSalaryData = Partial<CreateSalaryData>

export type CreatePayrollData = Omit<Payroll, 'id' | 'createdAt' | 'updatedAt' | 'processedBy' | 'processedAt' | 'salaryRecords'>
export type UpdatePayrollData = Partial<CreatePayrollData>

export type CreateEvaluationData = Omit<PerformanceEvaluation, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'employeeSignedAt' | 'managerSignedAt'>
export type UpdateEvaluationData = Partial<CreateEvaluationData>

// ==================== FILTER TYPES ====================

export interface EmployeeFilters {
  search?: string
  department?: string
  status?: EmployeeStatus
  employeeType?: EmployeeType
  manager?: string
}

export interface LeaveFilters {
  employeeId?: string
  leaveType?: LeaveType
  status?: LeaveStatus
  startDate?: string
  endDate?: string
}

export interface AttendanceFilters {
  employeeId?: string
  date?: string
  startDate?: string
  endDate?: string
  status?: AttendanceStatus
}

export interface SalaryFilters {
  employeeId?: string
  month?: number
  year?: number
  status?: SalaryStatus
}

export interface PayrollFilters {
  month?: number
  year?: number
  status?: PayrollStatus
}

export interface EvaluationFilters {
  employeeId?: string
  evaluatorId?: string
  period?: string
  status?: EvaluationStatus
}

// ==================== HR PART 2: ATTENDANCE & TIME TRACKING ====================

// Biometric Method Types (per API contract)
export type BiometricMethod = 'fingerprint' | 'facial' | 'card' | 'pin' | 'mobile' | 'manual' | 'qr_code'

// Check-in Source Types
export type CheckInSource = 'web' | 'mobile_app' | 'biometric' | 'manual_entry' | 'import' | 'api'

// Device Type
export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'biometric_terminal' | 'other'

// Break Type per API contract
export type BreakType = 'prayer' | 'lunch' | 'personal' | 'medical' | 'other'

// Break Status
export type BreakStatus = 'ongoing' | 'completed' | 'exceeded'

// Shift Type per API contract
export type ShiftTypeEnum = 'regular' | 'morning' | 'evening' | 'night' | 'flexible' | 'split' | 'custom'

// Day of Week
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

// Overtime Type
export type OvertimeType = 'regular' | 'weekend' | 'holiday'

// Overtime Status per API contract
export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'paid'

// Overtime Compensation Type
export type OvertimeCompensationType = 'payment' | 'time_off' | 'both'

// Correction Field Types
export type CorrectionField = 'checkIn' | 'checkOut' | 'breaks' | 'overtime' | 'status'

// Correction Status
export type CorrectionStatus = 'pending' | 'approved' | 'rejected'

// Geofence Type per API contract
export type GeofenceType = 'office' | 'branch' | 'warehouse' | 'client_site' | 'project_site' | 'custom'

/**
 * Location Details for Check-in/Check-out
 */
export interface CheckLocation {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
  address?: string
  isWithinGeofence: boolean
  geofenceId?: string
  distanceFromOffice?: number
  accuracy?: number
}

/**
 * Biometric Verification Details
 */
export interface BiometricVerification {
  method: BiometricMethod
  deviceId?: string
  verified: boolean
  verificationScore?: number
}

/**
 * Check-in/Check-out Details per API contract
 */
export interface CheckDetails {
  time: string
  location?: CheckLocation
  biometric?: BiometricVerification
  source: CheckInSource
  deviceType: DeviceType
  ipAddress?: string
  userAgent?: string
  notes?: string
  photo?: string
}

/**
 * Break Record per API contract
 */
export interface Break {
  type: BreakType
  typeAr?: string
  startTime: string
  endTime?: string
  duration?: number
  isPaid: boolean
  isScheduled: boolean
  status: BreakStatus
  exceededBy?: number
}

/**
 * Break Summary
 */
export interface BreakSummary {
  totalBreaks: number
  totalDuration: number
  paidBreakMinutes: number
  unpaidBreakMinutes: number
  exceededBreaks: number
}

/**
 * Late Arrival Details per API contract
 */
export interface LateArrival {
  isLate: boolean
  lateMinutes?: number
  graceMinutes?: number
  excused?: boolean
  excusedBy?: string
  deductionAmount?: number
}

/**
 * Early Departure Details
 */
export interface EarlyDeparture {
  isEarly: boolean
  earlyMinutes?: number
  permissionObtained?: boolean
  approvedBy?: string
  deductionAmount?: number
}

/**
 * Overtime Details per API contract
 */
export interface OvertimeDetailsRecord {
  hasOvertime: boolean
  regularOvertime: {
    hours: number
    minutes: number
    rate: number // e.g., 1.5
  }
  weekendOvertime: {
    hours: number
    minutes: number
    rate: number // e.g., 2.0
  }
  totalOvertimeMinutes: number
  preApproved: boolean
}

/**
 * Shift Details embedded in Attendance Record
 */
export interface ShiftDetails {
  shiftId?: string
  name: string
  nameAr?: string
  type: ShiftTypeEnum
  scheduledStart: string
  scheduledEnd: string
  scheduledHours: number
  breakDuration: number
  graceMinutes: number
}

/**
 * Hours Worked Summary per API contract
 */
export interface HoursWorked {
  scheduled: number
  worked: number
  regular: number
  overtime: number
  undertime: number
  break: number
  net: number
  paid: number
  unpaid: number
}

/**
 * Attendance Status Details per API contract
 */
export interface AttendanceStatusDetails {
  isPresent: boolean
  isAbsent: boolean
  isLate: boolean
  isEarlyDeparture: boolean
  isHalfDay: boolean
  isOvertime: boolean
  isOnLeave: boolean
  isRemote: boolean
  hasViolation: boolean
}

/**
 * Compliance Check per API contract (Saudi Labor Law)
 */
export interface ComplianceCheck {
  dailyHoursCompliant: boolean
  weeklyHoursCompliant: boolean
  maxDailyHours: number
  actualDailyHours?: number
  fridayRestCompliant: boolean
  workedOnFriday?: boolean
  restPeriodCompliant: boolean
  restPeriodMinutes?: number
  requiredRestMinutes: number
  ramadanHoursApplied?: boolean
  ramadanMaxHours?: number
  overtimeCompliant: boolean
  monthlyOvertimeHours?: number
  maxMonthlyOvertime?: number
  isFullyCompliant: boolean
  violations: string[]
  checkedAt?: string
}

/**
 * Payroll Integration for Attendance
 */
export interface AttendancePayroll {
  processed: boolean
  processedAt?: string
  payrollRunId?: string
  regularPayHours: number
  overtimePayHours: number
  deductions?: {
    lateDeduction: number
    absenceDeduction: number
    totalDeduction: number
  }
  additions?: {
    overtimeAddition: number
    totalAddition: number
  }
}

/**
 * Comprehensive Attendance Record per API contract
 * This extends the basic AttendanceRecord with full API contract fields
 */
export interface AttendanceRecordFull {
  _id: string
  attendanceId: string // ATT-YYYYMMDD-XXXX

  // Employee Info
  employeeId: string
  employeeName?: string
  employeeNameAr?: string
  employeeNumber?: string
  department?: string
  departmentAr?: string
  position?: string
  positionAr?: string

  // Date Info
  date: string
  dayOfWeek: DayOfWeek
  dayOfWeekAr?: string
  weekNumber?: number
  month: number
  year: number
  isWeekend: boolean
  isHoliday: boolean
  holidayName?: string
  isRamadan: boolean

  // Shift Info
  shift: ShiftDetails

  // Check-in/out
  checkIn?: CheckDetails
  checkOut?: CheckDetails

  // Hours
  hours: HoursWorked

  // Status
  status: AttendanceStatus
  statusAr?: string
  statusDetails: AttendanceStatusDetails

  // Late/Early
  lateArrival?: LateArrival
  earlyDeparture?: EarlyDeparture

  // Overtime
  overtime?: OvertimeDetailsRecord

  // Breaks
  breaks: Break[]
  breakSummary: BreakSummary

  // Compliance (Saudi Labor Law)
  compliance: ComplianceCheck

  // Payroll
  payroll: AttendancePayroll

  // Audit
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// ==================== SHIFT TYPE INTERFACES (API CONTRACT) ====================

/**
 * Shift Type Timing Configuration
 */
export interface ShiftTiming {
  startTime: string // "08:00"
  endTime: string // "17:00"
  coreStartTime?: string // For flexible shifts
  coreEndTime?: string
  duration: number // hours
  workingHours: number
  breakDuration: number // minutes
  flexibleWindow?: number // minutes
  crossesMidnight?: boolean
}

/**
 * Shift Type Settings
 */
export interface ShiftSettings {
  graceMinutes: number
  earlyCheckInAllowed: boolean
  earlyCheckInMinutes: number
  lateCheckOutAllowed: boolean
  autoCheckOut: boolean
  autoCheckOutTime?: string
  requiresLocation: boolean
  requiresBiometric: boolean
  allowRemoteCheckIn: boolean
}

/**
 * Shift Overtime Configuration
 */
export interface ShiftOvertimeConfig {
  allowed: boolean
  requiresApproval: boolean
  maxDailyOvertime: number
  overtimeRate: number // e.g., 1.5
  weekendRate: number // e.g., 2.0
  holidayRate: number // e.g., 2.0
}

/**
 * Shift Deduction Configuration
 */
export interface ShiftDeductionConfig {
  lateDeduction: {
    enabled: boolean
    graceMinutes: number
    deductionType: 'percentage' | 'fixed' | 'day'
    deductionValue: number
  }
  absenceDeduction: {
    enabled: boolean
    deductionType: 'day' | 'fixed'
    deductionValue: number
  }
}

/**
 * Shift Type per API contract (Section 4)
 */
export interface ShiftTypeFull {
  _id: string
  code: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: ShiftTypeEnum
  timing: ShiftTiming
  settings: ShiftSettings
  overtime: ShiftOvertimeConfig
  deductions: ShiftDeductionConfig
  applicableDays: DayOfWeek[]
  color: string
  isActive: boolean
  isDefault: boolean
  compliance?: {
    laborLawArticle?: string
    maxHoursForMuslims?: number
  }
  createdAt: string
  updatedAt?: string
}

/**
 * Create Shift Type Data
 */
export interface CreateShiftTypeData {
  code: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: ShiftTypeEnum
  timing: ShiftTiming
  settings?: Partial<ShiftSettings>
  overtime?: Partial<ShiftOvertimeConfig>
  deductions?: Partial<ShiftDeductionConfig>
  applicableDays: DayOfWeek[]
  color?: string
  isActive?: boolean
  isDefault?: boolean
}

// ==================== SHIFT ASSIGNMENT INTERFACES (API CONTRACT) ====================

/**
 * Shift Assignment Status per API contract
 */
export type ShiftAssignmentStatus = 'active' | 'upcoming' | 'completed'

/**
 * Shift Assignment per API contract (Section 5)
 */
export interface ShiftAssignmentFull {
  _id: string
  employeeId: string
  employeeName: string
  employeeNumber: string
  shiftTypeId: string
  shiftName: string
  shiftNameAr?: string
  startDate: string
  endDate?: string // null for permanent
  isPermanent: boolean
  isRotating: boolean
  status: ShiftAssignmentStatus
  createdBy: string
  createdAt: string
}

/**
 * Create Shift Assignment Data per API contract
 */
export interface CreateShiftAssignmentData {
  employeeId: string
  shiftTypeId: string
  startDate: string
  endDate?: string
  isPermanent: boolean
  notes?: string
}

/**
 * Bulk Shift Assignment Data
 */
export interface BulkShiftAssignmentData {
  shiftTypeId: string
  employeeIds: string[]
  startDate: string
  isPermanent: boolean
}

/**
 * Shift Swap Request per API contract
 */
export interface ShiftSwapRequest {
  requesterId: string
  targetEmployeeId: string
  requesterDate: string
  targetDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// ==================== OVERTIME MANAGEMENT (API CONTRACT) ====================

/**
 * Overtime Record per API contract (Section 6)
 */
export interface OvertimeRecord {
  _id: string
  attendanceRecordId: string
  employeeId: string
  employeeName: string
  date: string
  overtimeType: OvertimeType
  hours: number
  minutes: number
  rate: number // e.g., 1.5, 2.0
  baseHourlyRate: number
  amount: number
  reason: string
  taskDescription?: string
  status: OvertimeStatus
  approvedBy?: string
  approverName?: string
  approvedAt?: string
  rejectionReason?: string
  compensation: {
    type: OvertimeCompensationType
    calculatedAmount: number
  }
}

/**
 * Overtime Request Data per API contract
 */
export interface OvertimeRequestData {
  employeeId: string
  date: string
  estimatedHours: number
  reason: string
  taskDescription?: string
  compensationType: OvertimeCompensationType
}

/**
 * Overtime Summary per API contract
 */
export interface OvertimeSummary {
  totalHours: number
  totalAmount: number
  pendingApproval: number
  approved: number
  rejected: number
}

/**
 * Overtime Filters
 */
export interface OvertimeFilters {
  employeeId?: string
  status?: OvertimeStatus
  month?: number
  year?: number
  page?: number
  limit?: number
}

// ==================== ATTENDANCE CORRECTIONS (API CONTRACT) ====================

/**
 * Correction Request per API contract (Section 7)
 */
export interface CorrectionRequest {
  _id: string
  requestId: string // COR-YYYY-XXXXX
  attendanceRecordId: string
  employeeId: string
  employeeName: string
  date: string
  field: CorrectionField
  originalValue: Record<string, any>
  requestedValue: Record<string, any>
  reason: string
  supportingDocument?: string
  status: CorrectionStatus
  requestedBy: string
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

/**
 * Create Correction Request Data
 */
export interface CreateCorrectionData {
  field: CorrectionField
  requestedValue: Record<string, any>
  reason: string
  supportingDocument?: string
}

/**
 * Correction Approval Data
 */
export interface CorrectionApprovalData {
  reviewNotes?: string
}

// ==================== GEOFENCING (API CONTRACT) ====================

/**
 * Geofence Location per API contract (Section 8)
 */
export interface Geofence {
  _id: string
  name: string
  nameAr: string
  type: GeofenceType
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  radius: number // meters
  address?: string
  addressAr?: string
  isActive: boolean
  checkInRequired: boolean
  checkOutRequired: boolean
  allowedDevices?: DeviceType[]
  validFrom?: string
  validTo?: string
  createdAt: string
  updatedAt?: string
}

/**
 * Create Geofence Data per API contract
 */
export interface CreateGeofenceData {
  name: string
  nameAr: string
  type: GeofenceType
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  radius: number
  address?: string
  addressAr?: string
  checkInRequired?: boolean
  checkOutRequired?: boolean
  allowedDevices?: DeviceType[]
  validFrom?: string
  validTo?: string
}

/**
 * Location Verification Response
 */
export interface LocationVerificationResponse {
  isWithinGeofence: boolean
  matchedGeofence?: {
    _id: string
    name: string
    type: GeofenceType
    distance: number
  }
}

/**
 * Geofence Filters
 */
export interface GeofenceFilters {
  type?: GeofenceType
  isActive?: boolean
  search?: string
}

// ==================== ATTENDANCE REPORTS (API CONTRACT) ====================

/**
 * Attendance Summary Report per API contract (Section 9)
 */
export interface AttendanceSummaryReport {
  period: {
    month: number
    year: number
    workingDays: number
    holidays: number
  }
  summary: {
    totalEmployees: number
    totalRecords: number
    presentDays: number
    absentDays: number
    lateDays: number
    halfDays: number
    leaveDays: number
    averageAttendance: number
    averageLateness: number
    totalWorkedHours: number
    totalOvertimeHours: number
    averageWorkedHoursPerDay: number
  }
  byDepartment: Array<{
    department: string
    employeeCount: number
    presentDays: number
    absentDays: number
    lateDays: number
    attendanceRate: number
    overtimeHours: number
  }>
  byDay: Array<{
    date: string
    dayOfWeek: DayOfWeek
    present: number
    absent: number
    late: number
    onLeave: number
  }>
  trends: {
    attendanceByWeek: number[]
    latenessbyWeek: number[]
    comparison: {
      previousMonth: {
        attendanceRate: number
        change: string
      }
    }
  }
}

/**
 * Employee Attendance Report per API contract
 */
export interface EmployeeAttendanceReport {
  employee: {
    _id: string
    employeeId: string
    name: string
    department: string
  }
  period: {
    month: number
    year: number
  }
  summary: {
    scheduledDays: number
    presentDays: number
    absentDays: number
    lateDays: number
    leaveDays: number
    attendanceRate: number
    punctualityRate: number
    totalWorkedHours: number
    averageCheckIn: string
    averageCheckOut: string
    overtimeHours: number
    undertimeHours: number
  }
  dailyRecords: AttendanceRecordFull[]
  violations: string[]
  complianceStatus: {
    dailyHoursCompliant: boolean
    weeklyHoursCompliant: boolean
    restPeriodCompliant: boolean
  }
}

/**
 * Today's Attendance Response per API contract
 */
export interface TodayAttendanceResponse {
  date: string
  summary: {
    totalEmployees: number
    present: number
    absent: number
    late: number
    onLeave: number
    notCheckedIn: number
  }
  records: AttendanceRecordFull[]
}

/**
 * Employee Attendance History per API contract
 */
export interface EmployeeAttendanceHistory {
  employee: {
    _id: string
    employeeId: string
    name: string
  }
  summary: {
    totalDays: number
    presentDays: number
    absentDays: number
    lateDays: number
    halfDays: number
    leaveDays: number
    weekends: number
    holidays: number
    workFromHome: number
    totalWorkedHours: number
    totalOvertimeHours: number
    totalUndertimeHours: number
    averageCheckIn: string
    averageCheckOut: string
    violations: number
  }
  records: AttendanceRecordFull[]
}

// ==================== STATS TYPES ====================

export interface EmployeeStats {
  total: number
  active: number
  onLeave: number
  inactive: number
  newThisMonth: number
  byDepartment: { department: string; count: number }[]
}

export interface LeaveStats {
  pending: number
  approved: number
  rejected: number
  byType: { type: LeaveType; count: number }[]
}

export interface AttendanceStats {
  present: number
  absent: number
  late: number
  avgWorkHours: number
}

export interface PayrollStats {
  totalSalaries: number
  totalDeductions: number
  totalNet: number
  avgSalary: number
}

// ==================== HR PART 3: LEAVE MANAGEMENT (API CONTRACT) ====================

/**
 * Leave Type Configuration per API contract (Section 1)
 * Saudi Labor Law compliant leave type definitions
 */
export interface LeaveTypeConfig {
  _id: string
  code: LeaveType
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string

  // Entitlement Settings
  category: LeaveCategory
  maxDaysPerYear?: number
  maxConsecutiveDays?: number
  minNoticeDays?: number

  // Pay Settings
  payPercentage: number // 0-100
  sickLeavePayStructure?: {
    // Saudi Labor Law Article 117
    fullPayDays: number // First 30 days
    partialPayDays: number // Next 60 days at 75%
    partialPayPercentage: number // 75%
    unpaidDays: number // Last 30 days
  }

  // Documentation Requirements
  requiresDocumentation: boolean
  documentTypes?: string[]

  // Eligibility
  eligibility: {
    minServiceMonths?: number
    maxUsagePerYear?: number
    genderRestriction?: Gender
    religionRestriction?: string // e.g., 'muslim' for hajj leave
    onceInServicePeriod?: boolean // e.g., hajj leave
    previousUsageCheck?: boolean
  }

  // Approval Settings
  requiresApproval: boolean
  approvalLevels?: number
  autoApproveAfterDays?: number

  // Carry Forward & Encashment
  carryForward: {
    allowed: boolean
    maxDays?: number
    expiryMonths?: number
  }
  encashment: {
    allowed: boolean
    maxDays?: number
    minBalanceRequired?: number
  }

  // Saudi Labor Law Reference
  laborLawArticle?: string
  laborLawNotes?: string
  laborLawNotesAr?: string

  // Status
  isActive: boolean
  isSystem: boolean // System types cannot be deleted

  // Audit
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

/**
 * Create Leave Type Configuration Data
 */
export interface CreateLeaveTypeConfigData {
  code: LeaveType
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  category: LeaveCategory
  maxDaysPerYear?: number
  maxConsecutiveDays?: number
  minNoticeDays?: number
  payPercentage: number
  sickLeavePayStructure?: LeaveTypeConfig['sickLeavePayStructure']
  requiresDocumentation?: boolean
  documentTypes?: string[]
  eligibility?: Partial<LeaveTypeConfig['eligibility']>
  requiresApproval?: boolean
  approvalLevels?: number
  autoApproveAfterDays?: number
  carryForward?: Partial<LeaveTypeConfig['carryForward']>
  encashment?: Partial<LeaveTypeConfig['encashment']>
  laborLawArticle?: string
  laborLawNotes?: string
  laborLawNotesAr?: string
  isActive?: boolean
}

/**
 * Leave Type Configuration Filters
 */
export interface LeaveTypeConfigFilters {
  category?: LeaveCategory
  isActive?: boolean
  isSystem?: boolean
  search?: string
  page?: number
  limit?: number
}

// ==================== WHO'S OUT CALENDAR (API CONTRACT - Section 8) ====================

/**
 * Who's Out Calendar Entry per API contract
 */
export interface WhosOutEntry {
  _id: string

  // Employee Info
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber?: string
  employeeAvatar?: string
  department?: string
  departmentAr?: string
  position?: string
  positionAr?: string

  // Leave Info
  leaveRequestId: string
  leaveType: LeaveType
  leaveTypeName: string
  leaveTypeNameAr?: string

  // Dates
  startDate: string
  endDate: string
  totalDays: number

  // Status
  status: LeaveStatus

  // Additional Info
  isHalfDay?: boolean
  halfDayPeriod?: 'first_half' | 'second_half'
  isEmergency?: boolean
  hasDelegate?: boolean
  delegateName?: string
}

/**
 * Who's Out Calendar Response per API contract
 */
export interface WhosOutCalendarResponse {
  period: {
    startDate: string
    endDate: string
    totalDays: number
    workingDays: number
    weekends: number
    holidays: number
  }

  summary: {
    totalEmployees: number
    totalOnLeave: number
    totalApprovedLeaves: number
    totalPendingLeaves: number
    coveragePercentage: number
    byLeaveType: Record<LeaveType, number>
    byDepartment: Record<string, number>
  }

  // Daily breakdown
  calendar: Array<{
    date: string
    dayOfWeek: DayOfWeek
    dayOfWeekAr?: string
    isWeekend: boolean
    isHoliday: boolean
    holidayName?: string
    holidayNameAr?: string

    onLeave: WhosOutEntry[]
    totalOnLeave: number

    coverage: {
      totalEmployees: number
      available: number
      onLeave: number
      coveragePercentage: number
    }
  }>

  // Employees currently out
  currentlyOut: WhosOutEntry[]

  // Upcoming leaves (next 7 days)
  upcoming: WhosOutEntry[]
}

/**
 * Who's Out Calendar Filters
 */
export interface WhosOutCalendarFilters {
  startDate: string
  endDate: string
  department?: string
  leaveType?: LeaveType
  status?: LeaveStatus
  employeeId?: string
  groupBy?: 'day' | 'week' | 'month'
}

/**
 * Team Coverage Response per API contract
 */
export interface TeamCoverageResponse {
  period: {
    startDate: string
    endDate: string
  }

  team: {
    department: string
    departmentAr?: string
    totalEmployees: number
    manager?: {
      employeeId: string
      name: string
      nameAr?: string
    }
  }

  coverage: Array<{
    date: string
    dayOfWeek: DayOfWeek
    available: number
    onLeave: number
    coveragePercentage: number
    belowMinimum: boolean
    minimumRequired?: number
    employees: {
      available: Array<{
        employeeId: string
        name: string
        nameAr?: string
        position?: string
      }>
      onLeave: Array<{
        employeeId: string
        name: string
        nameAr?: string
        leaveType: LeaveType
      }>
    }
  }>

  conflicts: Array<{
    date: string
    type: 'low_coverage' | 'critical_role_absent' | 'manager_absent' | 'blackout_period'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    messageAr?: string
    affectedEmployees?: string[]
  }>

  recommendations: Array<{
    type: 'reschedule' | 'delegate' | 'approve_with_caution' | 'deny'
    message: string
    messageAr?: string
    affectedLeaveRequestIds?: string[]
  }>
}

/**
 * Blackout Period per API contract
 */
export interface BlackoutPeriod {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string

  startDate: string
  endDate: string

  // Scope
  appliesToAll: boolean
  departments?: string[]
  positions?: string[]

  // Leave Types affected
  affectedLeaveTypes: LeaveType[] // Empty = all types

  // Exceptions
  allowEmergency: boolean
  allowMedical: boolean

  // Status
  isActive: boolean

  // Audit
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

/**
 * Create Blackout Period Data
 */
export interface CreateBlackoutPeriodData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  startDate: string
  endDate: string
  appliesToAll?: boolean
  departments?: string[]
  positions?: string[]
  affectedLeaveTypes?: LeaveType[]
  allowEmergency?: boolean
  allowMedical?: boolean
  isActive?: boolean
}

/**
 * Holiday Definition per API contract
 */
export interface Holiday {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string

  date: string
  endDate?: string // For multi-day holidays
  totalDays: number

  // Type
  type: 'national' | 'religious' | 'company' | 'regional'

  // Scope
  appliesToAll: boolean
  departments?: string[]
  regions?: string[]

  // Recurring
  isRecurring: boolean
  recurrence?: {
    type: 'yearly' | 'hijri_yearly'
    hijriMonth?: number
    hijriDay?: number
  }

  // Status
  isActive: boolean

  // Audit
  year: number
  createdAt: string
  updatedAt?: string
}

/**
 * Create Holiday Data
 */
export interface CreateHolidayData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  date: string
  endDate?: string
  type: Holiday['type']
  appliesToAll?: boolean
  departments?: string[]
  regions?: string[]
  isRecurring?: boolean
  recurrence?: Holiday['recurrence']
  isActive?: boolean
}

/**
 * Holiday Filters
 */
export interface HolidayFilters {
  year?: number
  type?: Holiday['type']
  isActive?: boolean
  isRecurring?: boolean
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
