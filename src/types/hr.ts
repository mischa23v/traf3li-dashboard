/**
 * HR Module Types
 * Production-ready type definitions for Human Resources management
 */

// ==================== ENUMS ====================

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated' | 'probation'
export type EmployeeType = 'full_time' | 'part_time' | 'contractor' | 'intern'
export type Gender = 'male' | 'female'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

export type LeaveStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
export type LeaveType = 'annual' | 'sick' | 'hajj' | 'marriage' | 'birth' | 'death' | 'eid' | 'maternity' | 'paternity' | 'exam' | 'unpaid' | 'emergency' | 'bereavement' | 'study' | 'other'
export type LeaveCategory = 'paid' | 'unpaid' | 'partial_pay'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'half_day' | 'remote' | 'on_leave' | 'weekend' | 'holiday' | 'work_from_home' | 'early_departure'

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
