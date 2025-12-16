import api from './api'
import type { LeaveType } from './leaveService'

// Earned Leave Frequency
export type EarnedLeaveFrequency = 'monthly' | 'quarterly' | 'yearly'

// Applicability Type
export type ApplicabilityType = 'all' | 'department' | 'designation' | 'grade' | 'employee_type'

// Assignment Status
export type AssignmentStatus = 'active' | 'expired' | 'cancelled'

// Leave Policy Detail (child table equivalent)
export interface LeavePolicyDetail {
  leaveType: LeaveType
  leaveTypeName: string
  leaveTypeNameAr: string
  annualAllocation: number

  // Carry forward settings
  allowCarryForward: boolean
  maxCarryForwardDays: number
  carryForwardExpiryDays: number

  // Encashment settings
  allowEncashment: boolean
  maxEncashableDays: number

  // Earned leave settings
  isEarnedLeave: boolean
  earnedLeaveFrequency?: EarnedLeaveFrequency
}

// Main Leave Policy Interface
export interface LeavePolicy {
  _id: string
  policyId: string
  name: string
  nameAr: string

  description: string
  descriptionAr: string

  // Policy details (child table equivalent)
  leavePolicyDetails: LeavePolicyDetail[]

  // Applicability
  applicableFor: ApplicabilityType
  applicableValue?: string // departmentId, designation name, etc.

  isActive: boolean
  isDefault: boolean

  // Saudi Labor Law compliance
  saudiLaborLawCompliant: boolean

  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

// Leave Allocation for Assignment
export interface LeaveAllocation {
  leaveType: LeaveType
  allocated: number
  carryForward: number
  total: number
  used?: number
  remaining?: number
}

// Leave Policy Assignment
export interface LeavePolicyAssignment {
  _id: string
  assignmentId: string

  employeeId: string
  employeeName: string
  employeeNameAr: string
  employeeNumber?: string
  department?: string

  leavePolicyId: string
  leavePolicyName: string
  leavePolicyNameAr?: string

  leavePeriodId: string
  leavePeriodName: string
  leavePeriodStartDate: string
  leavePeriodEndDate: string

  assignmentDate: string
  effectiveFrom: string
  effectiveTo?: string

  // Calculated allocations based on policy
  allocations: LeaveAllocation[]

  status: AssignmentStatus

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string

  // Cancellation
  cancellationDate?: string
  cancellationReason?: string
  cancelledBy?: string
}

// Create/Update Leave Policy Data
export interface CreateLeavePolicyData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  leavePolicyDetails: Omit<LeavePolicyDetail, 'leaveTypeName' | 'leaveTypeNameAr'>[]
  applicableFor: ApplicabilityType
  applicableValue?: string
  isActive?: boolean
  isDefault?: boolean
  saudiLaborLawCompliant?: boolean
}

export interface UpdateLeavePolicyData extends Partial<CreateLeavePolicyData> {}

// Assign Policy Data
export interface AssignPolicyData {
  employeeId: string
  leavePolicyId: string
  leavePeriodId: string
  effectiveFrom: string
  effectiveTo?: string
}

export interface BulkAssignPolicyData {
  employeeIds: string[]
  leavePolicyId: string
  leavePeriodId: string
  effectiveFrom: string
  effectiveTo?: string
}

// Response types
export interface LeavePoliciesResponse {
  data: LeavePolicy[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface LeavePolicyAssignmentsResponse {
  data: LeavePolicyAssignment[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Filter types
export interface LeavePolicyFilters {
  search?: string
  isActive?: boolean
  isDefault?: boolean
  applicableFor?: ApplicabilityType
  saudiLaborLawCompliant?: boolean
  page?: number
  limit?: number
}

export interface LeavePolicyAssignmentFilters {
  employeeId?: string
  leavePolicyId?: string
  leavePeriodId?: string
  status?: AssignmentStatus
  department?: string
  effectiveFrom?: string
  effectiveTo?: string
  page?: number
  limit?: number
}

// Stats
export interface LeavePolicyStats {
  totalPolicies: number
  activePolicies: number
  inactivePolicies: number
  defaultPolicy?: LeavePolicy
  totalAssignments: number
  activeAssignments: number
  employeesWithoutPolicy: number
  byApplicability: Record<ApplicabilityType, number>
}

// ============================================================================
// API Functions - Leave Policies
// ============================================================================

/**
 * Get all leave policies with optional filters
 */
export const getLeavePolicies = async (filters?: LeavePolicyFilters): Promise<LeavePoliciesResponse> => {
  const params = new URLSearchParams()

  if (filters?.search) params.append('search', filters.search)
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  if (filters?.isDefault !== undefined) params.append('isDefault', filters.isDefault.toString())
  if (filters?.applicableFor) params.append('applicableFor', filters.applicableFor)
  if (filters?.saudiLaborLawCompliant !== undefined) {
    params.append('saudiLaborLawCompliant', filters.saudiLaborLawCompliant.toString())
  }
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/leave-policies?${params.toString()}`)
  return response.data
}

/**
 * Get single leave policy by ID
 */
export const getLeavePolicy = async (policyId: string): Promise<LeavePolicy> => {
  const response = await api.get(`/hr/leave-policies/${policyId}`)
  return response.data
}

/**
 * Create new leave policy
 */
export const createLeavePolicy = async (data: CreateLeavePolicyData): Promise<LeavePolicy> => {
  const response = await api.post('/hr/leave-policies', data)
  return response.data
}

/**
 * Update existing leave policy
 */
export const updateLeavePolicy = async (
  policyId: string,
  data: UpdateLeavePolicyData
): Promise<LeavePolicy> => {
  const response = await api.patch(`/hr/leave-policies/${policyId}`, data)
  return response.data
}

/**
 * Delete leave policy
 */
export const deleteLeavePolicy = async (policyId: string): Promise<void> => {
  await api.delete(`/hr/leave-policies/${policyId}`)
}

/**
 * Set policy as default
 */
export const setDefaultLeavePolicy = async (policyId: string): Promise<LeavePolicy> => {
  const response = await api.post(`/hr/leave-policies/${policyId}/set-default`)
  return response.data
}

/**
 * Activate/Deactivate policy
 */
export const toggleLeavePolicyStatus = async (
  policyId: string,
  isActive: boolean
): Promise<LeavePolicy> => {
  const response = await api.patch(`/hr/leave-policies/${policyId}/status`, { isActive })
  return response.data
}

/**
 * Duplicate policy
 */
export const duplicateLeavePolicy = async (
  policyId: string,
  newName: string,
  newNameAr: string
): Promise<LeavePolicy> => {
  const response = await api.post(`/hr/leave-policies/${policyId}/duplicate`, {
    name: newName,
    nameAr: newNameAr,
  })
  return response.data
}

// ============================================================================
// API Functions - Leave Policy Assignments
// ============================================================================

/**
 * Get all leave policy assignments with optional filters
 */
export const getLeavePolicyAssignments = async (
  filters?: LeavePolicyAssignmentFilters
): Promise<LeavePolicyAssignmentsResponse> => {
  const params = new URLSearchParams()

  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.leavePolicyId) params.append('leavePolicyId', filters.leavePolicyId)
  if (filters?.leavePeriodId) params.append('leavePeriodId', filters.leavePeriodId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.effectiveFrom) params.append('effectiveFrom', filters.effectiveFrom)
  if (filters?.effectiveTo) params.append('effectiveTo', filters.effectiveTo)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/leave-policy-assignments?${params.toString()}`)
  return response.data
}

/**
 * Get single assignment by ID
 */
export const getLeavePolicyAssignment = async (assignmentId: string): Promise<LeavePolicyAssignment> => {
  const response = await api.get(`/hr/leave-policy-assignments/${assignmentId}`)
  return response.data
}

/**
 * Assign policy to single employee
 */
export const assignPolicyToEmployee = async (data: AssignPolicyData): Promise<LeavePolicyAssignment> => {
  const response = await api.post('/hr/leave-policy-assignments', data)
  return response.data
}

/**
 * Bulk assign policy to multiple employees
 */
export const assignPolicyBulk = async (
  data: BulkAssignPolicyData
): Promise<LeavePolicyAssignment[]> => {
  const response = await api.post('/hr/leave-policy-assignments/bulk', data)
  return response.data
}

/**
 * Get employee's current active leave policy
 */
export const getEmployeeLeavePolicy = async (
  employeeId: string
): Promise<LeavePolicyAssignment | null> => {
  const response = await api.get(`/hr/leave-policy-assignments/employee/${employeeId}/current`)
  return response.data
}

/**
 * Get all policy assignments for an employee (history)
 */
export const getEmployeePolicyHistory = async (
  employeeId: string
): Promise<LeavePolicyAssignment[]> => {
  const response = await api.get(`/hr/leave-policy-assignments/employee/${employeeId}/history`)
  return response.data
}

/**
 * Cancel policy assignment
 */
export const cancelPolicyAssignment = async (
  assignmentId: string,
  reason: string
): Promise<LeavePolicyAssignment> => {
  const response = await api.post(`/hr/leave-policy-assignments/${assignmentId}/cancel`, {
    reason,
  })
  return response.data
}

/**
 * Update assignment effective dates
 */
export const updateAssignmentDates = async (
  assignmentId: string,
  effectiveFrom: string,
  effectiveTo?: string
): Promise<LeavePolicyAssignment> => {
  const response = await api.patch(`/hr/leave-policy-assignments/${assignmentId}/dates`, {
    effectiveFrom,
    effectiveTo,
  })
  return response.data
}

// ============================================================================
// API Functions - Statistics & Reports
// ============================================================================

/**
 * Get leave policy statistics
 */
export const getLeavePolicyStats = async (): Promise<LeavePolicyStats> => {
  const response = await api.get('/hr/leave-policies/stats')
  return response.data
}

/**
 * Get employees without any policy assignment
 */
export const getEmployeesWithoutPolicy = async (): Promise<Array<{
  employeeId: string
  employeeName: string
  employeeNameAr: string
  department: string
  joinDate: string
}>> => {
  const response = await api.get('/hr/leave-policy-assignments/unassigned-employees')
  return response.data
}

/**
 * Get policy allocation summary for an employee
 */
export const getEmployeeAllocationSummary = async (
  employeeId: string,
  leavePeriodId?: string
): Promise<{
  employee: {
    employeeId: string
    employeeName: string
    employeeNameAr: string
    department: string
  }
  policy: {
    policyId: string
    policyName: string
    policyNameAr: string
  }
  leavePeriod: {
    periodId: string
    periodName: string
    startDate: string
    endDate: string
  }
  allocations: LeaveAllocation[]
  summary: {
    totalAllocated: number
    totalUsed: number
    totalRemaining: number
  }
}> => {
  const params = new URLSearchParams()
  if (leavePeriodId) params.append('leavePeriodId', leavePeriodId)

  const response = await api.get(
    `/hr/leave-policy-assignments/employee/${employeeId}/allocation-summary?${params.toString()}`
  )
  return response.data
}

/**
 * Preview policy allocations before assignment
 */
export const previewPolicyAllocations = async (
  policyId: string,
  employeeId: string,
  leavePeriodId: string
): Promise<{
  policy: LeavePolicy
  allocations: LeaveAllocation[]
  warnings?: string[]
}> => {
  const response = await api.post('/hr/leave-policy-assignments/preview', {
    policyId,
    employeeId,
    leavePeriodId,
  })
  return response.data
}

/**
 * Get policy comparison for multiple policies
 */
export const comparePolicies = async (policyIds: string[]): Promise<{
  policies: LeavePolicy[]
  comparison: {
    leaveType: LeaveType
    leaveTypeName: string
    leaveTypeNameAr: string
    allocations: Record<string, number> // policyId -> allocation
    allowsCarryForward: Record<string, boolean>
    allowsEncashment: Record<string, boolean>
  }[]
}> => {
  const response = await api.post('/hr/leave-policies/compare', { policyIds })
  return response.data
}
