import api from './api'

// ==================== ENUMS & TYPES ====================

export type EncashmentStatus = 'draft' | 'pending_approval' | 'approved' | 'paid' | 'rejected' | 'cancelled'

export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected'

// ==================== INTERFACES ====================

// Approval Workflow Step
export interface ApprovalStep {
  stepNumber: number
  approverRole: string
  approverId?: string
  approverName?: string
  status: ApprovalStepStatus
  comments?: string
  actionDate?: string
}

// Main Leave Encashment Interface
export interface LeaveEncashment {
  _id: string
  encashmentId: string

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

  // Leave Type Info
  leaveType: string // usually 'annual'
  leaveTypeName: string
  leaveTypeNameAr?: string

  // Leave Period & Allocation
  leavePeriodId?: string
  leavePeriodYear?: number
  leaveAllocationId?: string

  // Balance Information
  leaveBalance: number // total available leave balance
  encashableDays: number // days allowed to encash based on policy
  maxEncashableDays?: number // policy maximum
  minBalanceRequired?: number // minimum balance to maintain after encashment

  // Encashment Request Details
  encashmentDays: number // days employee wants to encash
  remainingBalanceAfter: number // balance after encashment

  // Financial Calculation (Saudi Labor Law - daily rate = basic salary / 30)
  basicSalary: number
  dailyRate: number // calculated: basicSalary / 30
  encashmentAmount: number // calculated: encashmentDays * dailyRate

  // Currency
  currency: string

  // Status & Workflow
  status: EncashmentStatus

  // Approval Workflow
  approvalWorkflow: ApprovalStep[]
  currentApprovalStep?: number
  finalApprover?: string
  finalApproverName?: string

  // Payment Details
  paymentDate?: string
  paymentReference?: string
  paymentMethod?: 'bank_transfer' | 'cash' | 'check'
  payrollEntryId?: string // link to payroll if paid through payroll
  payrollMonth?: number
  payrollYear?: number

  // Dates & Audit Trail
  requestedAt: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  paidAt?: string
  cancelledAt?: string

  // User Actions
  createdBy: string
  createdByName?: string
  approvedBy?: string
  approvedByName?: string
  rejectedBy?: string
  rejectedByName?: string
  rejectionReason?: string
  cancelledBy?: string
  cancellationReason?: string

  // Additional Info
  notes?: string
  employeeNotes?: string
  hrNotes?: string

  // Metadata
  createdAt: string
  updatedAt: string

  // Policy Compliance
  policyCompliance?: {
    eligible: boolean
    eligibilityReason?: string
    policyRules: {
      rule: string
      ruleAr?: string
      satisfied: boolean
      details?: string
    }[]
  }
}

// Create Leave Encashment Data
export interface CreateLeaveEncashmentData {
  employeeId: string
  leaveType: string
  encashmentDays: number
  leavePeriodId?: string
  notes?: string
  employeeNotes?: string
}

// Update Leave Encashment Data
export interface UpdateLeaveEncashmentData extends Partial<CreateLeaveEncashmentData> {
  status?: EncashmentStatus
  hrNotes?: string
}

// Leave Encashment Filters
export interface LeaveEncashmentFilters {
  employeeId?: string
  employeeName?: string
  departmentId?: string
  leaveType?: string
  status?: EncashmentStatus
  year?: number
  month?: number
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Leave Encashment Response
export interface LeaveEncashmentsResponse {
  data: LeaveEncashment[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Encashment Eligibility Check
export interface EncashmentEligibility {
  eligible: boolean
  reason?: string
  reasonAr?: string
  leaveBalance: number
  encashableDays: number
  maxEncashableDays: number
  minBalanceRequired: number
  basicSalary: number
  dailyRate: number
  estimatedAmount: number
  policyRules: {
    rule: string
    ruleAr?: string
    satisfied: boolean
    details?: string
  }[]
}

// Encashment Calculation Result
export interface EncashmentCalculation {
  employeeId: string
  employeeName: string
  leaveType: string
  encashmentDays: number
  basicSalary: number
  dailyRate: number
  encashmentAmount: number
  currency: string
  grossAmount: number
  deductions?: {
    tax?: number
    gosi?: number
    other?: number
  }
  netAmount: number
}

// Encashment Statistics
export interface EncashmentStats {
  totalRequests: number
  pendingApproval: number
  approved: number
  paid: number
  rejected: number
  cancelled: number
  totalAmount: number
  totalDaysEncashed: number
  averageDaysPerRequest: number
  averageAmountPerRequest: number
  byDepartment: {
    departmentId: string
    departmentName: string
    count: number
    totalAmount: number
  }[]
  byMonth: {
    month: number
    year: number
    count: number
    totalAmount: number
  }[]
}

// Approval Action Data
export interface ApprovalActionData {
  comments?: string
}

// Rejection Action Data
export interface RejectionActionData {
  reason: string
}

// Mark as Paid Data
export interface MarkAsPaidData {
  paymentReference: string
  paymentMethod?: 'bank_transfer' | 'cash' | 'check'
  paymentDate?: string
  payrollEntryId?: string
}

// Process Encashment Data (updates leave allocation)
export interface ProcessEncashmentData {
  updateLeaveAllocation: boolean
  notifyEmployee?: boolean
}

// ==================== API FUNCTIONS ====================

/**
 * Get all leave encashments with optional filters
 */
export const getLeaveEncashments = async (filters?: LeaveEncashmentFilters): Promise<LeaveEncashmentsResponse> => {
  const params = new URLSearchParams()

  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.employeeName) params.append('employeeName', filters.employeeName)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.leaveType) params.append('leaveType', filters.leaveType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/leave-encashments?${params.toString()}`)
  return response.data
}

/**
 * Get a single leave encashment by ID
 */
export const getLeaveEncashment = async (id: string): Promise<LeaveEncashment> => {
  const response = await api.get(`/hr/leave-encashments/${id}`)
  return response.data
}

/**
 * Create a new leave encashment request
 */
export const createLeaveEncashment = async (data: CreateLeaveEncashmentData): Promise<LeaveEncashment> => {
  const response = await api.post('/hr/leave-encashments', data)
  return response.data
}

/**
 * Update an existing leave encashment
 */
export const updateLeaveEncashment = async (id: string, data: UpdateLeaveEncashmentData): Promise<LeaveEncashment> => {
  const response = await api.patch(`/hr/leave-encashments/${id}`, data)
  return response.data
}

/**
 * Delete a leave encashment (only if in draft status)
 */
export const deleteLeaveEncashment = async (id: string): Promise<void> => {
  await api.delete(`/hr/leave-encashments/${id}`)
}

/**
 * Submit leave encashment for approval
 */
export const submitLeaveEncashment = async (id: string): Promise<LeaveEncashment> => {
  const response = await api.post(`/hr/leave-encashments/${id}/submit`)
  return response.data
}

/**
 * Calculate encashment amount for given parameters
 */
export const calculateEncashmentAmount = async (
  employeeId: string,
  leaveType: string,
  days: number
): Promise<EncashmentCalculation> => {
  const response = await api.post('/hr/leave-encashments/calculate', {
    employeeId,
    leaveType,
    days
  })
  return response.data
}

/**
 * Get encashable balance for an employee
 */
export const getEncashableBalance = async (
  employeeId: string,
  leaveType: string
): Promise<EncashmentEligibility> => {
  const response = await api.get(`/hr/leave-encashments/eligibility/${employeeId}`, {
    params: { leaveType }
  })
  return response.data
}

/**
 * Approve leave encashment
 */
export const approveLeaveEncashment = async (
  id: string,
  data?: ApprovalActionData
): Promise<LeaveEncashment> => {
  const response = await api.post(`/hr/leave-encashments/${id}/approve`, data || {})
  return response.data
}

/**
 * Reject leave encashment
 */
export const rejectLeaveEncashment = async (
  id: string,
  data: RejectionActionData
): Promise<LeaveEncashment> => {
  const response = await api.post(`/hr/leave-encashments/${id}/reject`, data)
  return response.data
}

/**
 * Mark leave encashment as paid
 */
export const markAsPaid = async (
  id: string,
  data: MarkAsPaidData
): Promise<LeaveEncashment> => {
  const response = await api.post(`/hr/leave-encashments/${id}/mark-paid`, data)
  return response.data
}

/**
 * Process encashment (update leave allocation)
 */
export const processEncashment = async (
  id: string,
  data?: ProcessEncashmentData
): Promise<LeaveEncashment> => {
  const response = await api.post(`/hr/leave-encashments/${id}/process`, data || { updateLeaveAllocation: true })
  return response.data
}

/**
 * Cancel leave encashment
 */
export const cancelLeaveEncashment = async (
  id: string,
  reason: string
): Promise<LeaveEncashment> => {
  const response = await api.post(`/hr/leave-encashments/${id}/cancel`, { reason })
  return response.data
}

/**
 * Get leave encashment statistics
 */
export const getEncashmentStats = async (filters?: {
  year?: number
  month?: number
  departmentId?: string
}): Promise<EncashmentStats> => {
  const params = new URLSearchParams()
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)

  const response = await api.get(`/hr/leave-encashments/stats?${params.toString()}`)
  return response.data
}

/**
 * Get pending encashment requests (for approvers)
 */
export const getPendingEncashments = async (): Promise<LeaveEncashment[]> => {
  const response = await api.get('/hr/leave-encashments/pending-approvals')
  return response.data
}

/**
 * Get employee encashment history
 */
export const getEmployeeEncashmentHistory = async (employeeId: string): Promise<LeaveEncashment[]> => {
  const response = await api.get(`/hr/leave-encashments/employee/${employeeId}`)
  return response.data
}

/**
 * Bulk approve encashments
 */
export const bulkApproveEncashments = async (ids: string[]): Promise<{ approved: number }> => {
  const response = await api.post('/hr/leave-encashments/bulk-approve', { ids })
  return response.data
}

/**
 * Bulk reject encashments
 */
export const bulkRejectEncashments = async (ids: string[], reason: string): Promise<{ rejected: number }> => {
  const response = await api.post('/hr/leave-encashments/bulk-reject', { ids, reason })
  return response.data
}

/**
 * Export encashments to Excel
 */
export const exportEncashments = async (filters?: LeaveEncashmentFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
  }

  const response = await api.get(`/hr/leave-encashments/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Get encashment policy details
 */
export const getEncashmentPolicy = async (): Promise<{
  maxEncashmentPercentage: number
  minBalanceRequired: number
  maxEncashableDaysPerYear: number
  allowedLeaveTypes: string[]
  eligibilityCriteria: string[]
  eligibilityCriteriaAr: string[]
}> => {
  const response = await api.get('/hr/leave-encashments/policy')
  return response.data
}

export default {
  getLeaveEncashments,
  getLeaveEncashment,
  createLeaveEncashment,
  updateLeaveEncashment,
  deleteLeaveEncashment,
  submitLeaveEncashment,
  calculateEncashmentAmount,
  getEncashableBalance,
  approveLeaveEncashment,
  rejectLeaveEncashment,
  markAsPaid,
  processEncashment,
  cancelLeaveEncashment,
  getEncashmentStats,
  getPendingEncashments,
  getEmployeeEncashmentHistory,
  bulkApproveEncashments,
  bulkRejectEncashments,
  exportEncashments,
  getEncashmentPolicy,
}
