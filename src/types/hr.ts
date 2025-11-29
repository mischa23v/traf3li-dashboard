/**
 * HR Module Types
 * Types for Employee, Salary, Payroll, Leave, Attendance, and Evaluation management
 */

// ═══════════════════════════════════════════════════════════════
// COMMON TYPES
// ═══════════════════════════════════════════════════════════════
export type Department =
  | 'legal'
  | 'finance'
  | 'hr'
  | 'admin'
  | 'it'
  | 'marketing'
  | 'operations'
  | 'other'

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'intern'
  | 'probation'

export type EmployeeStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'terminated'
  | 'resigned'

export type Gender = 'male' | 'female'

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

// ═══════════════════════════════════════════════════════════════
// EMPLOYEE TYPES
// ═══════════════════════════════════════════════════════════════
export interface Address {
  street?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface LeaveBalances {
  annual: number
  sick: number
  personal: number
  unpaid: number
  maternity: number
  paternity: number
  hajj: number
  marriage: number
  bereavement: number
}

export interface EmployeeDocument {
  _id: string
  name: string
  type: string
  url: string
  uploadedAt: string
}

export interface Employee {
  _id: string
  employeeId: string
  firstName: string
  lastName: string
  firstNameAr?: string
  lastNameAr?: string
  fullName: string
  email: string
  phone: string
  gender: Gender
  department: Department
  position: string
  employmentType: EmploymentType
  hireDate: string
  status: EmployeeStatus
  nationality?: string
  nationalId?: string
  dateOfBirth?: string
  maritalStatus?: MaritalStatus
  address?: Address
  bankName?: string
  bankAccountNumber?: string
  iban?: string
  emergencyContact?: EmergencyContact
  managerId?: string
  manager?: {
    _id: string
    firstName: string
    lastName: string
    fullName: string
  }
  leaveBalances: LeaveBalances
  documents?: EmployeeDocument[]
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeData {
  firstName: string
  lastName: string
  firstNameAr?: string
  lastNameAr?: string
  email: string
  phone: string
  gender: Gender
  department: Department
  position: string
  hireDate: string
  employmentType?: EmploymentType
  nationality?: string
  nationalId?: string
  dateOfBirth?: string
  maritalStatus?: MaritalStatus
  address?: Address
  bankName?: string
  bankAccountNumber?: string
  iban?: string
  emergencyContact?: EmergencyContact
  managerId?: string
}

export interface EmployeeFilters {
  status?: EmployeeStatus
  department?: Department
  employmentType?: EmploymentType
  search?: string
  page?: number
  limit?: number
}

export interface EmployeeStats {
  total: number
  byStatus: { _id: EmployeeStatus; count: number }[]
  byDepartment: { _id: Department; count: number }[]
  byEmploymentType: { _id: EmploymentType; count: number }[]
  recentHires: Employee[]
}

// ═══════════════════════════════════════════════════════════════
// SALARY TYPES
// ═══════════════════════════════════════════════════════════════
export type AllowanceType =
  | 'housing'
  | 'transportation'
  | 'food'
  | 'phone'
  | 'overtime'
  | 'commission'
  | 'bonus'
  | 'other'

export type DeductionType =
  | 'gosi'
  | 'tax'
  | 'loan'
  | 'advance'
  | 'absence'
  | 'late'
  | 'insurance'
  | 'other'

export interface Allowance {
  _id?: string
  name: string
  nameAr?: string
  type: AllowanceType
  amount: number
}

export interface Deduction {
  _id?: string
  name: string
  nameAr?: string
  type: DeductionType
  amount: number
}

export interface Salary {
  _id: string
  salaryId: string
  employeeId: string
  employee?: Employee
  basicSalary: number
  currency: string
  allowances: Allowance[]
  deductions: Deduction[]
  totalAllowances: number
  totalDeductions: number
  grossSalary: number
  netSalary: number
  gosiEnabled: boolean
  gosiEmployeePercentage?: number
  gosiEmployerPercentage?: number
  gosiEmployeeAmount?: number
  gosiEmployerAmount?: number
  effectiveFrom: string
  effectiveTo?: string
  status: 'active' | 'inactive' | 'superseded'
  paymentFrequency: 'monthly' | 'bi_weekly' | 'weekly'
  createdAt: string
  updatedAt: string
}

export interface CreateSalaryData {
  employeeId: string
  basicSalary: number
  effectiveFrom: string
  currency?: string
  paymentFrequency?: 'monthly' | 'bi_weekly' | 'weekly'
  gosiEnabled?: boolean
  gosiEmployeePercentage?: number
  gosiEmployerPercentage?: number
  allowances?: Omit<Allowance, '_id'>[]
  deductions?: Omit<Deduction, '_id'>[]
}

export interface SalaryFilters {
  employeeId?: string
  status?: string
  page?: number
  limit?: number
}

export interface SalaryStats {
  totalPayroll: number
  avgSalary: number
  totalAllowances: number
  totalDeductions: number
  totalGosiEmployee: number
  totalGosiEmployer: number
  byDepartment: { _id: Department; total: number; count: number }[]
}

// ═══════════════════════════════════════════════════════════════
// LEAVE TYPES
// ═══════════════════════════════════════════════════════════════
export type LeaveType =
  | 'annual'
  | 'sick'
  | 'personal'
  | 'unpaid'
  | 'maternity'
  | 'paternity'
  | 'hajj'
  | 'marriage'
  | 'bereavement'
  | 'emergency'
  | 'study'
  | 'compensatory'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface LeaveRequest {
  _id: string
  leaveId: string
  employeeId: string
  employee?: Employee
  leaveType: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  isHalfDay?: boolean
  substituteId?: string
  substitute?: Employee
  approvedBy?: string
  approver?: Employee
  approvedAt?: string
  rejectionReason?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateLeaveData {
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  isHalfDay?: boolean
  substituteId?: string
}

export interface LeaveFilters {
  employeeId?: string
  leaveType?: LeaveType
  status?: LeaveStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface LeaveBalance {
  employeeId: string
  year: number
  balances: {
    [key in LeaveType]?: {
      total: number
      used: number
      pending: number
      available: number
    }
  }
}

export interface LeaveStats {
  total: number
  byStatus: { _id: LeaveStatus; count: number }[]
  byType: { _id: LeaveType; count: number; totalDays: number }[]
  onLeaveToday: Employee[]
}

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE TYPES
// ═══════════════════════════════════════════════════════════════
export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'early_leave'
  | 'half_day'
  | 'on_leave'
  | 'holiday'
  | 'work_from_home'
  | 'business_trip'

export type CheckMethod = 'manual' | 'biometric' | 'mobile_app' | 'web'

export interface AttendanceLocation {
  latitude: number
  longitude: number
  address?: string
}

export interface AttendanceBreak {
  startTime: string
  endTime?: string
  duration?: number
}

export interface AttendanceRecord {
  _id: string
  attendanceId: string
  employeeId: string
  employee?: Employee
  date: string
  checkInTime?: string
  checkOutTime?: string
  checkInMethod?: CheckMethod
  checkOutMethod?: CheckMethod
  checkInLocation?: AttendanceLocation
  checkOutLocation?: AttendanceLocation
  status: AttendanceStatus
  workingHours?: number
  overtimeHours?: number
  lateMinutes?: number
  earlyLeaveMinutes?: number
  breaks?: AttendanceBreak[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CheckInData {
  employeeId: string
  checkInMethod?: CheckMethod
  checkInLocation?: AttendanceLocation
  checkInNote?: string
}

export interface CheckOutData {
  employeeId: string
  checkOutMethod?: CheckMethod
  checkOutLocation?: AttendanceLocation
  checkOutNote?: string
}

export interface AttendanceFilters {
  employeeId?: string
  status?: AttendanceStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface TodayAttendance {
  attendance: AttendanceRecord[]
  summary: {
    totalEmployees: number
    present: number
    late: number
    absent: number
    onLeave: number
    workFromHome: number
  }
}

export interface AttendanceSummary {
  employeeId: string
  employee?: Employee
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  totalWorkingHours: number
  totalOvertimeHours: number
  attendanceRate: number
}

// ═══════════════════════════════════════════════════════════════
// PAYROLL TYPES
// ═══════════════════════════════════════════════════════════════
export type PayrollStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'cancelled'

export interface PayrollItem {
  _id: string
  employeeId: string
  employee?: Employee
  basicSalary: number
  allowances: number
  allowanceDetails?: Allowance[]
  deductions: number
  deductionDetails?: Deduction[]
  bonuses: number
  penalties: number
  advances: number
  gosiEmployee: number
  gosiEmployer: number
  grossSalary: number
  netSalary: number
  notes?: string
}

export interface Payroll {
  _id: string
  payrollId: string
  periodMonth: number
  periodYear: number
  status: PayrollStatus
  items: PayrollItem[]
  totalGross: number
  totalNet: number
  totalGosiEmployee: number
  totalGosiEmployer: number
  totalBonuses: number
  totalPenalties: number
  totalAdvances: number
  notes?: string
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  processedAt?: string
  paymentMethod?: string
  paymentReference?: string
  createdAt: string
  updatedAt: string
}

export interface GeneratePayrollData {
  periodMonth: number
  periodYear: number
  notes?: string
}

export interface UpdatePayrollItemData {
  bonuses?: number
  penalties?: number
  advances?: number
  notes?: string
}

export interface PayrollFilters {
  status?: PayrollStatus
  year?: number
  page?: number
  limit?: number
}

export interface PayrollSummary {
  year: number
  months: {
    month: number
    totalGross: number
    totalNet: number
    status: PayrollStatus
    payrollId?: string
  }[]
  yearTotal: {
    totalGross: number
    totalNet: number
    totalGosiEmployee: number
    totalGosiEmployer: number
  }
}

// ═══════════════════════════════════════════════════════════════
// EVALUATION TYPES
// ═══════════════════════════════════════════════════════════════
export type EvaluationType =
  | 'annual'
  | 'semi_annual'
  | 'quarterly'
  | 'probation'
  | 'project'
  | 'promotion'
  | 'performance_improvement'
  | 'special'

export type EvaluationStatus =
  | 'draft'
  | 'self_assessment'
  | 'manager_review'
  | 'hr_review'
  | 'completed'
  | 'acknowledged'

export type PerformanceLevel =
  | 'exceptional'
  | 'exceeds'
  | 'meets'
  | 'needs_improvement'
  | 'unsatisfactory'

export type CompetencyCategory =
  | 'technical'
  | 'communication'
  | 'leadership'
  | 'teamwork'
  | 'problem_solving'
  | 'time_management'
  | 'adaptability'
  | 'initiative'
  | 'customer_focus'
  | 'other'

export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface EvaluationGoal {
  _id?: string
  title: string
  description?: string
  weight: number
  targetValue?: string
  achievedValue?: string
  rating?: number
  dueDate?: string
  status?: GoalStatus
  comments?: string
}

export interface EvaluationCompetency {
  _id?: string
  name: string
  nameAr?: string
  category: CompetencyCategory
  rating: number
  weight: number
  comments?: string
}

export interface Feedback360 {
  _id?: string
  reviewerId: string
  reviewer?: Employee
  relationship: 'peer' | 'subordinate' | 'manager' | 'self'
  ratings: {
    category: CompetencyCategory
    rating: number
    comments?: string
  }[]
  overallComments?: string
  submittedAt?: string
}

export interface Evaluation {
  _id: string
  evaluationId: string
  employeeId: string
  employee?: Employee
  evaluatorId: string
  evaluator?: Employee
  evaluationType: EvaluationType
  periodStart: string
  periodEnd: string
  dueDate: string
  status: EvaluationStatus
  goals: EvaluationGoal[]
  competencies: EvaluationCompetency[]
  goalsWeight: number
  competenciesWeight: number
  goalsScore?: number
  competenciesScore?: number
  overallScore?: number
  performanceLevel?: PerformanceLevel
  strengths?: string
  areasForImprovement?: string
  developmentPlan?: string
  managerComments?: string
  employeeComments?: string
  is360Review: boolean
  feedback360?: Feedback360[]
  selfAssessment?: {
    goalsComments?: string
    competenciesComments?: string
    overallComments?: string
    submittedAt?: string
  }
  acknowledgedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEvaluationData {
  employeeId: string
  evaluationType: EvaluationType
  periodStart: string
  periodEnd: string
  dueDate: string
  goalsWeight?: number
  competenciesWeight?: number
  is360Review?: boolean
}

export interface EvaluationFilters {
  employeeId?: string
  evaluatorId?: string
  evaluationType?: EvaluationType
  status?: EvaluationStatus
  year?: number
  page?: number
  limit?: number
}

export interface EvaluationStats {
  total: number
  byStatus: { _id: EvaluationStatus; count: number }[]
  byType: { _id: EvaluationType; count: number }[]
  byPerformanceLevel: { _id: PerformanceLevel; count: number }[]
  avgScore: number
  pending: Evaluation[]
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
