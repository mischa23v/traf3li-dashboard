import api from './api'
import type { LeaveType } from './leaveService'

// ==================== ENUMS & TYPES ====================

export type CompensatoryLeaveStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'used'
  | 'cancelled'

export type WorkReason = 'holiday_work' | 'weekend_work' | 'overtime' | 'emergency'

export type CalculationMethod = 'hour_based' | 'day_based' | 'half_day'

export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected'

// ==================== INTERFACES ====================

// Status Configuration
export const COMPENSATORY_STATUS_LABELS: Record<CompensatoryLeaveStatus, { ar: string; en: string }> = {
  draft: { ar: 'مسودة', en: 'Draft' },
  pending_approval: { ar: 'قيد الموافقة', en: 'Pending Approval' },
  approved: { ar: 'موافق عليه', en: 'Approved' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
  expired: { ar: 'منتهي الصلاحية', en: 'Expired' },
  used: { ar: 'مستخدم', en: 'Used' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' },
}

// Work Reason Labels
export const WORK_REASON_LABELS: Record<WorkReason, { ar: string; en: string }> = {
  holiday_work: { ar: 'عمل في عطلة رسمية', en: 'Holiday Work' },
  weekend_work: { ar: 'عمل في عطلة نهاية الأسبوع', en: 'Weekend Work' },
  overtime: { ar: 'عمل إضافي', en: 'Overtime' },
  emergency: { ar: 'عمل طارئ', en: 'Emergency' },
}

// Calculation Method Labels
export const CALCULATION_METHOD_LABELS: Record<CalculationMethod, { ar: string; en: string }> = {
  hour_based: { ar: 'حسب الساعات', en: 'Hour Based' },
  day_based: { ar: 'حسب الأيام', en: 'Day Based' },
  half_day: { ar: 'نصف يوم', en: 'Half Day' },
}

// Approval Workflow Step
export interface ApprovalStep {
  stepNumber: number
  approverRole: string
  approverId?: string
  approverName?: string
  approverNameAr?: string
  status: ApprovalStepStatus
  comments?: string
  commentsAr?: string
  actionDate?: string
}

// Main Compensatory Leave Request Interface
export interface CompensatoryLeaveRequest {
  _id: string
  requestId: string

  // Employee Info
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr: string
  nationalId?: string
  departmentId: string
  departmentName?: string
  departmentNameAr?: string
  jobTitle?: string
  jobTitleAr?: string

  // Work done details
  workFromDate: string
  workEndDate: string

  // Reason for working (holiday/weekend/overtime)
  reason: WorkReason
  reasonDetails: string
  reasonDetailsAr?: string

  // Reference
  holidayName?: string // if worked on holiday
  holidayNameAr?: string
  attendanceId?: string // link to attendance record

  // Hours worked
  hoursWorked: number

  // Leave calculation
  leaveDaysEarned: number // calculated based on hours
  calculationMethod: CalculationMethod

  // Leave type to credit (usually 'compensatory' or 'annual')
  leaveType: string
  leaveTypeName?: string
  leaveTypeNameAr?: string

  // Validity - Saudi Labor Law: Compensatory leave typically expires in 3-6 months
  validFrom: string
  validUntil: string // comp leave usually expires
  expiryDays?: number // days until expiry

  // Status
  status: CompensatoryLeaveStatus

  // Approval Workflow
  approvalWorkflow: ApprovalStep[]
  currentApprovalStep?: number
  totalApprovalSteps?: number

  // Leave allocation link (when approved)
  leaveAllocationId?: string

  // Usage tracking
  daysUsed: number
  daysRemaining: number

  // Supporting Documents
  documents?: {
    documentType: 'attendance_report' | 'manager_approval' | 'timesheet' | 'other'
    documentName: string
    documentNameAr?: string
    fileName: string
    fileUrl: string
    fileSize?: number
    uploadedOn: string
    verified: boolean
  }[]

  // Saudi Labor Law Compliance
  laborLawCompliance?: {
    compliant: boolean
    article?: string // e.g., "Article 107 - Overtime"
    notes?: string
    notesAr?: string
    maxHoursPerDay?: number
    maxHoursPerWeek?: number
    overtimeRate?: number // 1.5x for regular overtime
  }

  // Notes
  notes?: {
    employeeNotes?: string
    employeeNotesAr?: string
    managerNotes?: string
    managerNotesAr?: string
    hrNotes?: string
    hrNotesAr?: string
  }

  // Audit Trail
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName?: string
  lastModifiedBy?: string
  lastModifiedByName?: string

  // Approval/Rejection
  approvedBy?: string
  approvedByName?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedByName?: string
  rejectedAt?: string
  rejectionReason?: string
  rejectionReasonAr?: string

  // Cancellation
  cancelledBy?: string
  cancelledByName?: string
  cancelledAt?: string
  cancellationReason?: string
  cancellationReasonAr?: string
}

// Create Compensatory Leave Request Data
export interface CreateCompensatoryLeaveRequestData {
  employeeId: string
  workFromDate: string
  workEndDate: string
  reason: WorkReason
  reasonDetails: string
  reasonDetailsAr?: string
  holidayName?: string
  holidayNameAr?: string
  attendanceId?: string
  hoursWorked: number
  calculationMethod?: CalculationMethod
  leaveType?: string // defaults to 'compensatory'
  validityMonths?: number // defaults to 3 months
  notes?: {
    employeeNotes?: string
    employeeNotesAr?: string
  }
}

// Update Compensatory Leave Request Data
export interface UpdateCompensatoryLeaveRequestData extends Partial<CreateCompensatoryLeaveRequestData> {
  status?: CompensatoryLeaveStatus
  hrNotes?: string
  hrNotesAr?: string
}

// Compensatory Leave Filters
export interface CompensatoryLeaveFilters {
  employeeId?: string
  employeeName?: string
  departmentId?: string
  status?: CompensatoryLeaveStatus
  reason?: WorkReason
  leaveType?: string
  year?: number
  month?: number
  fromDate?: string
  toDate?: string
  expiringSoon?: boolean // leaves expiring in next 30 days
  expired?: boolean
  search?: string
  sortBy?: 'workFromDate' | 'leaveDaysEarned' | 'validUntil' | 'createdAt' | 'employeeName'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Compensatory Leave Response
export interface CompensatoryLeaveRequestsResponse {
  data: CompensatoryLeaveRequest[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  summary?: {
    totalRequests: number
    totalDaysEarned: number
    totalDaysUsed: number
    totalDaysRemaining: number
    expiringInNext30Days: number
    byReason: Record<WorkReason, {
      count: number
      daysEarned: number
      daysUsed: number
    }>
    byStatus: Record<CompensatoryLeaveStatus, number>
  }
}

// Leave Days Calculation Result
export interface LeaveDaysCalculation {
  hoursWorked: number
  calculationMethod: CalculationMethod
  leaveDaysEarned: number
  calculation: {
    standardWorkingHours: number
    overtimeHours?: number
    overtimeRate?: number
    formula: string
    formulaAr?: string
  }
  compliance: {
    compliant: boolean
    article?: string
    notes?: string
    notesAr?: string
  }
}

// Employee Comp Leave Balance
export interface EmployeeCompLeaveBalance {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  departmentName?: string
  totalDaysEarned: number
  totalDaysUsed: number
  totalDaysRemaining: number
  totalDaysExpired: number
  activeRequests: {
    requestId: string
    reason: WorkReason
    daysEarned: number
    daysUsed: number
    daysRemaining: number
    validFrom: string
    validUntil: string
    status: CompensatoryLeaveStatus
  }[]
  expiringSoon: {
    requestId: string
    daysRemaining: number
    validUntil: string
    daysUntilExpiry: number
  }[]
}

// Holiday Work Record (from attendance)
export interface HolidayWorkRecord {
  attendanceId: string
  employeeId: string
  employeeName: string
  employeeNameAr: string
  date: string
  dayOfWeek: string
  isHoliday: boolean
  holidayName?: string
  holidayNameAr?: string
  isWeekend: boolean
  hoursWorked: number
  checkInTime?: string
  checkOutTime?: string
  hasCompLeaveRequest: boolean
  compLeaveRequestId?: string
}

// Compensatory Leave Statistics
export interface CompensatoryLeaveStats {
  totalRequests: number
  pendingApproval: number
  approved: number
  rejected: number
  expired: number
  used: number
  totalDaysEarned: number
  totalDaysUsed: number
  totalDaysRemaining: number
  totalDaysExpired: number
  expiringInNext30Days: number
  averageDaysPerRequest: number
  utilizationRate: number // percentage of used vs earned
  byReason: Record<WorkReason, {
    count: number
    daysEarned: number
    daysUsed: number
    percentage: number
  }>
  byDepartment: {
    departmentId: string
    departmentName: string
    count: number
    daysEarned: number
    daysUsed: number
  }[]
  byMonth: {
    month: number
    year: number
    count: number
    daysEarned: number
    daysUsed: number
  }[]
  topEmployees: {
    employeeId: string
    employeeName: string
    employeeNameAr: string
    daysEarned: number
    daysUsed: number
    requestsCount: number
  }[]
}

// Approval Action Data
export interface ApprovalActionData {
  comments?: string
  commentsAr?: string
  createLeaveAllocation?: boolean // auto-create leave allocation
}

// Rejection Action Data
export interface RejectionActionData {
  reason: string
  reasonAr?: string
}

// Expire Action Response
export interface ExpireUnusedResponse {
  success: boolean
  expired: number
  totalDaysExpired: number
  affectedEmployees: number
  details: {
    employeeId: string
    employeeName: string
    requestId: string
    daysExpired: number
    validUntil: string
  }[]
}

// ==================== API FUNCTIONS ====================

/**
 * Get all compensatory leave requests with filters
 */
export const getCompensatoryLeaveRequests = async (
  filters?: CompensatoryLeaveFilters
): Promise<CompensatoryLeaveRequestsResponse> => {
  const params = new URLSearchParams()

  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.employeeName) params.append('employeeName', filters.employeeName)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.reason) params.append('reason', filters.reason)
  if (filters?.leaveType) params.append('leaveType', filters.leaveType)
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)
  if (filters?.expiringSoon !== undefined) params.append('expiringSoon', String(filters.expiringSoon))
  if (filters?.expired !== undefined) params.append('expired', String(filters.expired))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/compensatory-leave-requests?${params.toString()}`)
  return response.data
}

/**
 * Get a single compensatory leave request by ID
 */
export const getCompensatoryLeaveRequest = async (
  id: string
): Promise<CompensatoryLeaveRequest> => {
  const response = await api.get(`/compensatory-leave-requests/${id}`)
  return response.data
}

/**
 * Create a new compensatory leave request
 */
export const createCompensatoryLeaveRequest = async (
  data: CreateCompensatoryLeaveRequestData
): Promise<CompensatoryLeaveRequest> => {
  const response = await api.post('/compensatory-leave-requests', data)
  return response.data
}

/**
 * Update an existing compensatory leave request
 */
export const updateCompensatoryLeaveRequest = async (
  id: string,
  data: UpdateCompensatoryLeaveRequestData
): Promise<CompensatoryLeaveRequest> => {
  const response = await api.patch(`/compensatory-leave-requests/${id}`, data)
  return response.data
}

/**
 * Delete a compensatory leave request (only if in draft status)
 */
export const deleteCompensatoryLeaveRequest = async (id: string): Promise<void> => {
  await api.delete(`/compensatory-leave-requests/${id}`)
}

/**
 * Submit compensatory leave request for approval
 */
export const submitCompensatoryLeaveRequest = async (
  id: string
): Promise<CompensatoryLeaveRequest> => {
  const response = await api.post(`/compensatory-leave-requests/${id}/submit`)
  return response.data
}

/**
 * Calculate leave days earned from hours worked
 * Saudi Labor Law:
 * - Standard working day = 8 hours
 * - Overtime = 1.5x for regular, 2x for holidays
 * - Compensatory leave = (overtime hours / 8) * rate
 */
export const calculateLeaveDays = async (
  hoursWorked: number,
  method: CalculationMethod,
  reason?: WorkReason
): Promise<LeaveDaysCalculation> => {
  const response = await api.post('/compensatory-leave-requests/calculate-days', {
    hoursWorked,
    method,
    reason,
  })
  return response.data
}

/**
 * Approve compensatory leave request
 * Optionally creates leave allocation automatically
 */
export const approveCompensatoryLeaveRequest = async (
  id: string,
  data?: ApprovalActionData
): Promise<CompensatoryLeaveRequest> => {
  const response = await api.post(`/compensatory-leave-requests/${id}/approve`, data || {})
  return response.data
}

/**
 * Reject compensatory leave request
 */
export const rejectCompensatoryLeaveRequest = async (
  id: string,
  data: RejectionActionData
): Promise<CompensatoryLeaveRequest> => {
  const response = await api.post(`/compensatory-leave-requests/${id}/reject`, data)
  return response.data
}

/**
 * Cancel compensatory leave request
 */
export const cancelCompensatoryLeaveRequest = async (
  id: string,
  reason: string
): Promise<CompensatoryLeaveRequest> => {
  const response = await api.post(`/compensatory-leave-requests/${id}/cancel`, { reason })
  return response.data
}

/**
 * Get employee compensatory leave balance
 */
export const getEmployeeCompLeaveBalance = async (
  employeeId: string
): Promise<EmployeeCompLeaveBalance> => {
  const response = await api.get(`/compensatory-leave-requests/balance/${employeeId}`)
  return response.data
}

/**
 * Expire unused compensatory leave that has passed validity date
 * Saudi Labor Law: Compensatory leave should be used within specified period
 */
export const expireUnusedCompLeave = async (
  asOfDate?: string
): Promise<ExpireUnusedResponse> => {
  const params = new URLSearchParams()
  if (asOfDate) params.append('asOfDate', asOfDate)

  const response = await api.post(
    `/compensatory-leave-requests/expire-unused?${params.toString()}`
  )
  return response.data
}

/**
 * Get holiday/weekend work records from attendance
 * These can be used to create compensatory leave requests
 */
export const getHolidayWorkRecords = async (
  employeeId: string,
  filters?: {
    fromDate?: string
    toDate?: string
    includeWeekends?: boolean
    includeHolidays?: boolean
    withoutCompLeave?: boolean // only records without comp leave request
  }
): Promise<HolidayWorkRecord[]> => {
  const params = new URLSearchParams()
  params.append('employeeId', employeeId)

  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)
  if (filters?.includeWeekends !== undefined) params.append('includeWeekends', String(filters.includeWeekends))
  if (filters?.includeHolidays !== undefined) params.append('includeHolidays', String(filters.includeHolidays))
  if (filters?.withoutCompLeave !== undefined) params.append('withoutCompLeave', String(filters.withoutCompLeave))

  const response = await api.get(`/compensatory-leave-requests/holiday-work-records?${params.toString()}`)
  return response.data
}

/**
 * Get compensatory leave statistics
 */
export const getCompensatoryLeaveStats = async (
  filters?: {
    year?: number
    month?: number
    departmentId?: string
  }
): Promise<CompensatoryLeaveStats> => {
  const params = new URLSearchParams()
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)

  const response = await api.get(`/compensatory-leave-requests/stats?${params.toString()}`)
  return response.data
}

/**
 * Get pending compensatory leave requests (for approvers)
 */
export const getPendingCompensatoryLeaveRequests = async (): Promise<CompensatoryLeaveRequest[]> => {
  const response = await api.get('/compensatory-leave-requests/pending-approvals')
  return response.data
}

/**
 * Get expiring compensatory leave (within next N days)
 */
export const getExpiringCompensatoryLeave = async (
  daysBeforeExpiry: number = 30
): Promise<{
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  departmentName: string
  requests: {
    requestId: string
    reason: WorkReason
    daysRemaining: number
    validUntil: string
    daysUntilExpiry: number
  }[]
  totalDaysExpiring: number
}[]> => {
  const params = new URLSearchParams()
  params.append('daysBeforeExpiry', daysBeforeExpiry.toString())

  const response = await api.get(`/compensatory-leave-requests/expiring?${params.toString()}`)
  return response.data
}

/**
 * Upload supporting document for compensatory leave request
 */
export const uploadCompensatoryLeaveDocument = async (
  requestId: string,
  file: File,
  documentType: 'attendance_report' | 'manager_approval' | 'timesheet' | 'other'
): Promise<CompensatoryLeaveRequest> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)

  const response = await api.post(
    `/compensatory-leave-requests/${requestId}/documents`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
  return response.data
}

/**
 * Export compensatory leave requests to Excel
 */
export const exportCompensatoryLeaveRequests = async (
  filters?: CompensatoryLeaveFilters
): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
  }

  const response = await api.get(
    `/compensatory-leave-requests/export?${params.toString()}`,
    {
      responseType: 'blob'
    }
  )
  return response.data
}

/**
 * Bulk approve compensatory leave requests
 */
export const bulkApproveCompensatoryLeaveRequests = async (
  ids: string[],
  createLeaveAllocation: boolean = true
): Promise<{ approved: number; failed: number }> => {
  const response = await api.post('/compensatory-leave-requests/bulk-approve', {
    ids,
    createLeaveAllocation,
  })
  return response.data
}

/**
 * Bulk reject compensatory leave requests
 */
export const bulkRejectCompensatoryLeaveRequests = async (
  ids: string[],
  reason: string
): Promise<{ rejected: number; failed: number }> => {
  const response = await api.post('/compensatory-leave-requests/bulk-reject', {
    ids,
    reason,
  })
  return response.data
}

/**
 * Get compensatory leave policy/rules
 */
export const getCompensatoryLeavePolicy = async (): Promise<{
  enabled: boolean
  defaultValidityMonths: number
  maxDaysPerYear: number
  calculationRules: {
    standardWorkingHours: number
    overtimeRateRegular: number // 1.5x
    overtimeRateHoliday: number // 2x
    overtimeRateWeekend: number // 2x
  }
  eligibilityCriteria: string[]
  eligibilityCriteriaAr: string[]
  saudiLaborLawArticles: {
    article: string
    description: string
    descriptionAr: string
  }[]
}> => {
  const response = await api.get('/compensatory-leave-requests/policy')
  return response.data
}

export default {
  getCompensatoryLeaveRequests,
  getCompensatoryLeaveRequest,
  createCompensatoryLeaveRequest,
  updateCompensatoryLeaveRequest,
  deleteCompensatoryLeaveRequest,
  submitCompensatoryLeaveRequest,
  calculateLeaveDays,
  approveCompensatoryLeaveRequest,
  rejectCompensatoryLeaveRequest,
  cancelCompensatoryLeaveRequest,
  getEmployeeCompLeaveBalance,
  expireUnusedCompLeave,
  getHolidayWorkRecords,
  getCompensatoryLeaveStats,
  getPendingCompensatoryLeaveRequests,
  getExpiringCompensatoryLeave,
  uploadCompensatoryLeaveDocument,
  exportCompensatoryLeaveRequests,
  bulkApproveCompensatoryLeaveRequests,
  bulkRejectCompensatoryLeaveRequests,
  getCompensatoryLeavePolicy,
}
