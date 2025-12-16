import api from './api'

// ==================== TYPES & ENUMS ====================

// Shift Assignment Status
export type ShiftAssignmentStatus = 'active' | 'inactive' | 'scheduled'

// Shift Request Status
export type ShiftRequestStatus = 'pending' | 'approved' | 'rejected'

// Days of Week
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

// ==================== LABELS ====================

export const SHIFT_ASSIGNMENT_STATUS_LABELS: Record<ShiftAssignmentStatus, { ar: string; en: string; color: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'emerald' },
  inactive: { ar: 'غير نشط', en: 'Inactive', color: 'slate' },
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'blue' },
}

export const SHIFT_REQUEST_STATUS_LABELS: Record<ShiftRequestStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد المراجعة', en: 'Pending', color: 'amber' },
  approved: { ar: 'موافق عليه', en: 'Approved', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
}

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, { ar: string; en: string }> = {
  sunday: { ar: 'الأحد', en: 'Sunday' },
  monday: { ar: 'الاثنين', en: 'Monday' },
  tuesday: { ar: 'الثلاثاء', en: 'Tuesday' },
  wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
  thursday: { ar: 'الخميس', en: 'Thursday' },
  friday: { ar: 'الجمعة', en: 'Friday' },
  saturday: { ar: 'السبت', en: 'Saturday' },
}

// ==================== INTERFACES ====================

// Rotation Pattern
export interface RotationPattern {
  shiftTypeId: string
  shiftName: string
  shiftNameAr?: string
  daysOfWeek: DayOfWeek[]
}

// Shift Assignment
export interface ShiftAssignment {
  _id: string
  assignmentId: string
  assignmentNumber?: string

  // Employee
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string
  nationalId?: string
  departmentId?: string
  departmentName?: string
  departmentNameAr?: string
  jobTitle?: string
  jobTitleAr?: string

  // Shift
  shiftTypeId: string
  shiftTypeName: string
  shiftTypeNameAr?: string

  // Duration
  startDate: string
  endDate?: string // null/undefined for indefinite assignment

  // Status
  status: ShiftAssignmentStatus

  // Rotation Settings
  isRotational: boolean
  rotationPattern?: RotationPattern[]
  rotationWeeks?: number // Number of weeks in rotation cycle
  currentRotationWeek?: number // Current week in the cycle

  // Override Settings
  overrideDefaultShift: boolean
  previousShiftTypeId?: string
  previousShiftTypeName?: string
  overrideReason?: string
  overrideReasonAr?: string

  // Approval
  requiresApproval?: boolean
  approvedBy?: string
  approverName?: string
  approvedOn?: string
  approvalComments?: string

  // Notes
  notes?: {
    assignmentNotes?: string
    assignmentNotesAr?: string
    hrNotes?: string
    managerNotes?: string
  }

  // Audit
  createdAt: string
  updatedAt?: string
  createdBy: string
  createdByName?: string
  lastModifiedBy?: string
  lastModifiedByName?: string
}

// Shift Request
export interface ShiftRequest {
  _id: string
  requestId: string
  requestNumber?: string

  // Employee
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string
  nationalId?: string
  departmentId?: string
  departmentName?: string
  jobTitle?: string

  // Current Shift
  currentShiftTypeId?: string
  currentShiftTypeName?: string
  currentShiftTypeNameAr?: string

  // Requested Shift
  requestedShiftTypeId: string
  requestedShiftTypeName: string
  requestedShiftTypeNameAr?: string

  // Duration
  fromDate: string
  toDate: string
  permanent: boolean // Whether this is a permanent change request

  // Reason
  reason: string
  reasonAr?: string
  reasonCategory?: 'personal' | 'health' | 'family' | 'transportation' | 'education' | 'other'

  // Status
  status: ShiftRequestStatus
  requestedOn: string
  submittedOn?: string

  // Approval
  approverId?: string
  approverName?: string
  approverComments?: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string

  // Impact
  impactAnalysis?: {
    teamCoverage: {
      affectsTeamCoverage: boolean
      currentTeamSize: number
      onShiftCount: number
      coveragePercentage: number
    }
    conflicts?: Array<{
      conflictType: string
      conflictDetails: string
      severity: 'low' | 'medium' | 'high'
    }>
  }

  // Notes
  notes?: {
    employeeNotes?: string
    managerNotes?: string
    hrNotes?: string
  }

  // Audit
  createdAt: string
  updatedAt?: string
  createdBy: string
  createdByName?: string
}

// Employee Current Shift
export interface EmployeeCurrentShift {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  currentDate: string

  // Active Assignment
  hasAssignment: boolean
  assignmentId?: string
  shiftTypeId?: string
  shiftTypeName?: string
  shiftTypeNameAr?: string

  // Shift Details
  shiftDetails?: {
    startTime: string
    endTime: string
    totalHours: number
    breakMinutes: number
    isFlexible: boolean
  }

  // Rotation Info
  isRotational: boolean
  rotationWeek?: number
  nextShiftChange?: string
  nextShiftName?: string
}

// ==================== CREATE/UPDATE INTERFACES ====================

// Create Shift Assignment Data
export interface CreateShiftAssignmentData {
  employeeId: string
  shiftTypeId: string
  startDate: string
  endDate?: string
  status?: ShiftAssignmentStatus
  isRotational?: boolean
  rotationPattern?: RotationPattern[]
  rotationWeeks?: number
  overrideDefaultShift?: boolean
  overrideReason?: string
  overrideReasonAr?: string
  notes?: {
    assignmentNotes?: string
    assignmentNotesAr?: string
    hrNotes?: string
    managerNotes?: string
  }
}

// Update Shift Assignment Data
export interface UpdateShiftAssignmentData extends Partial<CreateShiftAssignmentData> {
  status?: ShiftAssignmentStatus
}

// Bulk Assign Data
export interface BulkAssignShiftData {
  employeeIds: string[]
  shiftTypeId: string
  startDate: string
  endDate?: string
  overrideDefaultShift?: boolean
  overrideReason?: string
  notes?: string
}

// Create Shift Request Data
export interface CreateShiftRequestData {
  employeeId: string
  requestedShiftTypeId: string
  fromDate: string
  toDate: string
  permanent?: boolean
  reason: string
  reasonAr?: string
  reasonCategory?: 'personal' | 'health' | 'family' | 'transportation' | 'education' | 'other'
  notes?: {
    employeeNotes?: string
  }
}

// Update Shift Request Data
export interface UpdateShiftRequestData extends Partial<CreateShiftRequestData> {
  status?: ShiftRequestStatus
}

// ==================== RESPONSE INTERFACES ====================

// Shift Assignments Response
export interface ShiftAssignmentsResponse {
  data: ShiftAssignment[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Shift Requests Response
export interface ShiftRequestsResponse {
  data: ShiftRequest[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Bulk Assignment Result
export interface BulkAssignmentResult {
  success: number
  failed: number
  errors: Array<{
    employeeId: string
    employeeName: string
    error: string
  }>
  assignments: ShiftAssignment[]
}

// ==================== FILTER INTERFACES ====================

// Shift Assignment Filters
export interface ShiftAssignmentFilters {
  employeeId?: string
  departmentId?: string
  shiftTypeId?: string
  status?: ShiftAssignmentStatus
  isRotational?: boolean
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

// Shift Request Filters
export interface ShiftRequestFilters {
  employeeId?: string
  departmentId?: string
  requestedShiftTypeId?: string
  status?: ShiftRequestStatus
  reasonCategory?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// ==================== STATISTICS INTERFACES ====================

// Shift Assignment Statistics
export interface ShiftAssignmentStats {
  totalAssignments: number
  activeAssignments: number
  rotationalAssignments: number
  byShiftType: Record<string, {
    shiftTypeName: string
    count: number
    percentage: number
  }>
  byDepartment: Record<string, {
    departmentName: string
    count: number
  }>
  byStatus: Record<ShiftAssignmentStatus, number>
}

// Shift Request Statistics
export interface ShiftRequestStats {
  totalRequests: number
  pendingRequests: number
  approvedThisMonth: number
  rejectedThisMonth: number
  averageProcessingDays: number
  byReasonCategory: Record<string, number>
  byStatus: Record<ShiftRequestStatus, number>
}

// ==================== API FUNCTIONS ====================

// Get Shift Assignments
export const getShiftAssignments = async (filters?: ShiftAssignmentFilters): Promise<ShiftAssignmentsResponse> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.shiftTypeId) params.append('shiftTypeId', filters.shiftTypeId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.isRotational !== undefined) params.append('isRotational', String(filters.isRotational))
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/shift-assignments?${params.toString()}`)
  return response.data
}

// Get Single Shift Assignment
export const getShiftAssignment = async (assignmentId: string): Promise<ShiftAssignment> => {
  const response = await api.get(`/shift-assignments/${assignmentId}`)
  return response.data
}

// Get Employee's Current Shift
export const getEmployeeShift = async (employeeId: string, date?: string): Promise<EmployeeCurrentShift> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)

  const response = await api.get(`/shift-assignments/employee/${employeeId}/current?${params.toString()}`)
  return response.data
}

// Get Active Assignment for Employee
export const getActiveAssignment = async (employeeId: string): Promise<ShiftAssignment | null> => {
  const response = await api.get(`/shift-assignments/employee/${employeeId}/active`)
  return response.data
}

// Create Shift Assignment
export const assignShift = async (data: CreateShiftAssignmentData): Promise<ShiftAssignment> => {
  const response = await api.post('/shift-assignments', data)
  return response.data
}

// Update Shift Assignment
export const updateAssignment = async (assignmentId: string, data: UpdateShiftAssignmentData): Promise<ShiftAssignment> => {
  const response = await api.put(`/shift-assignments/${assignmentId}`, data)
  return response.data
}

// Delete Shift Assignment
export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  await api.delete(`/shift-assignments/${assignmentId}`)
}

// Bulk Assign Shift
export const bulkAssignShift = async (data: BulkAssignShiftData): Promise<BulkAssignmentResult> => {
  const response = await api.post('/shift-assignments/bulk', data)
  return response.data
}

// Activate Assignment
export const activateAssignment = async (assignmentId: string): Promise<ShiftAssignment> => {
  const response = await api.post(`/shift-assignments/${assignmentId}/activate`)
  return response.data
}

// Deactivate Assignment
export const deactivateAssignment = async (assignmentId: string, reason?: string): Promise<ShiftAssignment> => {
  const response = await api.post(`/shift-assignments/${assignmentId}/deactivate`, { reason })
  return response.data
}

// Get Shift Assignment Statistics
export const getShiftAssignmentStats = async (filters?: {
  departmentId?: string
  startDate?: string
  endDate?: string
}): Promise<ShiftAssignmentStats> => {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)

  const response = await api.get(`/shift-assignments/stats?${params.toString()}`)
  return response.data
}

// ==================== SHIFT REQUEST API FUNCTIONS ====================

// Get Shift Requests
export const getShiftRequests = async (filters?: ShiftRequestFilters): Promise<ShiftRequestsResponse> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.requestedShiftTypeId) params.append('requestedShiftTypeId', filters.requestedShiftTypeId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.reasonCategory) params.append('reasonCategory', filters.reasonCategory)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/shift-requests?${params.toString()}`)
  return response.data
}

// Get Single Shift Request
export const getShiftRequest = async (requestId: string): Promise<ShiftRequest> => {
  const response = await api.get(`/shift-requests/${requestId}`)
  return response.data
}

// Create Shift Request
export const createShiftRequest = async (data: CreateShiftRequestData): Promise<ShiftRequest> => {
  const response = await api.post('/shift-requests', data)
  return response.data
}

// Update Shift Request
export const updateShiftRequest = async (requestId: string, data: UpdateShiftRequestData): Promise<ShiftRequest> => {
  const response = await api.put(`/shift-requests/${requestId}`, data)
  return response.data
}

// Delete Shift Request
export const deleteShiftRequest = async (requestId: string): Promise<void> => {
  await api.delete(`/shift-requests/${requestId}`)
}

// Approve Shift Request
export const approveShiftRequest = async (requestId: string, comments?: string): Promise<ShiftRequest> => {
  const response = await api.post(`/shift-requests/${requestId}/approve`, { comments })
  return response.data
}

// Reject Shift Request
export const rejectShiftRequest = async (requestId: string, reason: string): Promise<ShiftRequest> => {
  const response = await api.post(`/shift-requests/${requestId}/reject`, { reason })
  return response.data
}

// Get Pending Shift Requests (for approvers)
export const getPendingShiftRequests = async (): Promise<ShiftRequest[]> => {
  const response = await api.get('/shift-requests/pending-approvals')
  return response.data
}

// Get Shift Request Statistics
export const getShiftRequestStats = async (filters?: {
  departmentId?: string
  year?: number
}): Promise<ShiftRequestStats> => {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.year) params.append('year', filters.year.toString())

  const response = await api.get(`/shift-requests/stats?${params.toString()}`)
  return response.data
}

// Check for conflicts before creating request
export const checkShiftRequestConflicts = async (data: {
  employeeId: string
  requestedShiftTypeId: string
  fromDate: string
  toDate: string
}): Promise<{
  hasConflicts: boolean
  conflicts: Array<{
    conflictType: string
    conflictDetails: string
    severity: 'low' | 'medium' | 'high'
  }>
  teamImpact: {
    affectsTeamCoverage: boolean
    currentTeamSize: number
    onShiftCount: number
    coveragePercentage: number
  }
}> => {
  const response = await api.post('/shift-requests/check-conflicts', data)
  return response.data
}

// Get Shift Coverage Report
export const getShiftCoverageReport = async (filters?: {
  departmentId?: string
  startDate?: string
  endDate?: string
}): Promise<{
  period: { startDate: string; endDate: string }
  shifts: Array<{
    shiftTypeId: string
    shiftTypeName: string
    shiftTypeNameAr?: string
    assignedEmployees: number
    requiredEmployees: number
    coveragePercentage: number
    status: 'adequate' | 'understaffed' | 'overstaffed'
  }>
  byDepartment: Record<string, {
    departmentName: string
    totalEmployees: number
    assignedEmployees: number
    unassignedEmployees: number
  }>
}> => {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)

  const response = await api.get(`/shift-assignments/coverage-report?${params.toString()}`)
  return response.data
}

// Import shift assignments from CSV/Excel
export const importShiftAssignments = async (assignments: CreateShiftAssignmentData[]): Promise<BulkAssignmentResult> => {
  const response = await api.post('/shift-assignments/import', { assignments })
  return response.data
}

// Export shift assignments to CSV/Excel
export const exportShiftAssignments = async (filters?: ShiftAssignmentFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.shiftTypeId) params.append('shiftTypeId', filters.shiftTypeId)
  if (filters?.status) params.append('status', filters.status)

  const response = await api.get(`/shift-assignments/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}
