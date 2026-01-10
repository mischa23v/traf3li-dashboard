import api from './api'

// Leave Types (Saudi Labor Law)
// Matches contract: contract2/types/hr-full.ts - LeaveType
// Extended with additional Saudi Labor Law specific types
export type LeaveType =
  | 'annual'       // إجازة سنوية (المادة 109)
  | 'sick'         // إجازة مرضية (المادة 117)
  | 'hajj'         // إجازة حج (المادة 114)
  | 'marriage'     // إجازة زواج (المادة 113)
  | 'birth'        // إجازة ولادة (المادة 113)
  | 'death'        // إجازة وفاة (المادة 113)
  | 'bereavement'  // إجازة عزاء (alias for death - matches contract)
  | 'eid'          // إجازة عيد (المادة 112)
  | 'maternity'    // إجازة وضع (المادة 151)
  | 'paternity'    // إجازة أبوة
  | 'exam'         // إجازة امتحان (المادة 115)
  | 'unpaid'       // إجازة بدون راتب

export type LeaveStatus = 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled' | 'completed'

export type LeaveCategory = 'paid' | 'unpaid' | 'partial_pay'

// Leave Type Labels
export const LEAVE_TYPE_LABELS: Record<LeaveType, { ar: string; en: string; article?: string; maxDays?: number }> = {
  annual: { ar: 'إجازة سنوية', en: 'Annual Leave', article: 'المادة 109', maxDays: 30 },
  sick: { ar: 'إجازة مرضية', en: 'Sick Leave', article: 'المادة 117', maxDays: 120 },
  hajj: { ar: 'إجازة حج', en: 'Hajj Leave', article: 'المادة 114', maxDays: 15 },
  marriage: { ar: 'إجازة زواج', en: 'Marriage Leave', article: 'المادة 113', maxDays: 3 },
  birth: { ar: 'إجازة ولادة', en: 'Birth Leave', article: 'المادة 113', maxDays: 1 },
  death: { ar: 'إجازة وفاة', en: 'Death Leave', article: 'المادة 113', maxDays: 3 },
  bereavement: { ar: 'إجازة عزاء', en: 'Bereavement Leave', article: 'المادة 113', maxDays: 3 },
  eid: { ar: 'إجازة عيد', en: 'Eid Leave', article: 'المادة 112' },
  maternity: { ar: 'إجازة وضع', en: 'Maternity Leave', article: 'المادة 151', maxDays: 70 },
  paternity: { ar: 'إجازة أبوة', en: 'Paternity Leave', maxDays: 3 },
  exam: { ar: 'إجازة امتحان', en: 'Exam Leave', article: 'المادة 115' },
  unpaid: { ar: 'إجازة بدون راتب', en: 'Unpaid Leave' },
}

// Medical Certificate
export interface MedicalCertificate {
  required: boolean
  provided: boolean
  certificateUrl?: string
  issuingDoctor: string
  doctorLicenseNumber?: string
  issuingClinic: string
  clinicLicenseNumber?: string
  issueDate: string
  certificateNumber?: string
  diagnosis?: string
  diagnosisCode?: string
  recommendedRestPeriod: number
  restrictions?: string
  verified: boolean
  verifiedBy?: string
  verificationDate?: string
}

// Work Handover
export interface WorkHandover {
  required: boolean
  delegateTo?: {
    employeeId: string
    employeeName: string
    jobTitle: string
    department?: string
    notified: boolean
    notificationDate?: string
    accepted: boolean
    acceptanceDate?: string
    rejectionReason?: string
  }
  tasks: Array<{
    taskId: string
    taskName: string
    taskDescription: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    dueDate?: string
    status: 'pending' | 'in_progress' | 'completed'
    handedOver: boolean
    handoverDate?: string
    instructions?: string
  }>
  handoverCompleted: boolean
  handoverCompletionDate?: string
  handoverApprovedByManager: boolean
}

// Approval Workflow Step
export interface ApprovalStep {
  stepNumber: number
  stepName: string
  stepNameAr?: string
  approverRole: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  actionDate?: string
  comments?: string
  notificationSent: boolean
  notificationDate?: string
  remindersSent?: number
  autoApproved?: boolean
  autoApprovalReason?: string
}

// Leave Document
export interface LeaveDocument {
  documentType: 'medical_certificate' | 'marriage_certificate' | 'birth_certificate' |
                'death_certificate' | 'hajj_permit' | 'exam_proof' |
                'handover_document' | 'approval_letter' | 'extension_request' |
                'medical_clearance' | 'other'
  documentName: string
  documentNameAr?: string
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
  uploadedOn: string
  uploadedBy?: string
  required: boolean
  verified: boolean
  verifiedBy?: string
  verificationDate?: string
  expiryDate?: string
}

// Return from Leave
export interface ReturnFromLeave {
  expectedReturnDate: string
  actualReturnDate?: string
  returned: boolean
  returnConfirmedBy?: string
  returnConfirmationDate?: string
  lateReturn: boolean
  lateDays?: number
  lateReason?: string
  extensionRequested: boolean
  extensionDays?: number
  extensionReason?: string
  extensionApproved?: boolean
  extensionApprovedBy?: string
  medicalClearanceRequired: boolean
  medicalClearanceProvided?: boolean
  clearanceDate?: string
}

// Main Leave Request Interface
export interface LeaveRequest {
  _id: string
  requestId: string
  requestNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId: string
  department?: string
  jobTitle?: string

  // Leave Type
  leaveType: LeaveType
  leaveTypeName: string
  leaveTypeNameAr?: string

  // Dates
  dates: {
    startDate: string
    endDate: string
    totalDays: number
    workingDays: number
    halfDay?: boolean
    halfDayPeriod?: 'first_half' | 'second_half'
    returnDate: string
  }

  // Reason
  reason: string
  reasonAr?: string

  // Status
  status: LeaveStatus
  requestedOn: string
  submittedOn?: string

  // Approval
  approvedBy?: string
  approverName?: string
  approvedOn?: string
  approvalComments?: string
  rejectedBy?: string
  rejectorName?: string
  rejectedOn?: string
  rejectionReason?: string

  // Balance Impact
  balanceBefore: number
  balanceAfter: number

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string

  // Advanced Fields
  leaveDetails?: {
    leaveCategory: LeaveCategory
    payPercentage: number
    isEmergency: boolean
    emergencyReason?: string
    emergencyVerified?: boolean
    legalEntitlement: {
      entitled: boolean
      entitlementArticle?: string
      maximumDays?: number
      conditions?: string[]
      requiresDocumentation: boolean
    }
    contactDuringLeave?: {
      available: boolean
      contactNumber?: string
      alternateNumber?: string
      email?: string
      emergencyContact?: {
        name: string
        relationship: string
        phone: string
      }
    }
    // Type-specific details
    annualLeave?: {
      entitlement: number
      serviceYears: number
      balanceBefore: number
      balanceAfter: number
      carriedForward?: number
      isSplitLeave: boolean
    }
    sickLeave?: {
      sickLeaveType: 'full_pay' | 'partial_pay' | 'unpaid'
      payPercentage: number
      ytdFullPayDaysUsed: number
      ytdPartialPayDaysUsed: number
      ytdUnpaidDaysUsed: number
      ytdTotalUsed: number
      ytdRemaining: number
      medicalCertificate?: MedicalCertificate
      hospitalized: boolean
      hospitalName?: string
      medicalClearanceRequired: boolean
    }
    hajjLeave?: {
      eligibility: {
        serviceYears: number
        eligible: boolean
        previouslyTaken: boolean
      }
      hajjDuration: number
      hajjPermit?: {
        required: boolean
        provided: boolean
        permitNumber?: string
        permitUrl?: string
        verified: boolean
      }
    }
    maternityLeave?: {
      totalDuration: number
      preBirthLeave: number
      postBirthLeave: number
      expectedDeliveryDate: string
      actualDeliveryDate?: string
      payPercentage: number
      serviceYears: number
      birthCertificate?: {
        required: boolean
        provided: boolean
        certificateUrl?: string
      }
      nursingBreaksEligible: boolean
    }
    marriageLeave?: {
      duration: number
      marriageDate: string
      marriageCertificate?: {
        required: boolean
        provided: boolean
        certificateUrl?: string
      }
      previouslyUsed: boolean
    }
    deathLeave?: {
      duration: number
      relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'grandparent' | 'other'
      deceasedName: string
      dateOfDeath: string
      deathCertificate?: {
        required: boolean
        provided: boolean
        certificateUrl?: string
      }
    }
    examLeave?: {
      examType: string
      institution: string
      examDate: string
      paid: boolean
      attemptNumber: number
      examProof?: {
        required: boolean
        provided: boolean
        documentUrl?: string
      }
    }
    unpaidLeave?: {
      reason: string
      reasonCategory: 'personal' | 'family' | 'health' | 'education' | 'other'
      detailedReason: string
      impactOnBenefits: {
        affectsSalary: boolean
        affectsGOSI: boolean
        affectsSeniority: boolean
        affectsAnnualLeave: boolean
        affectsEOSB: boolean
      }
    }
  }

  workHandover?: WorkHandover

  approvalWorkflow?: {
    required: boolean
    steps: ApprovalStep[]
    currentStep: number
    totalSteps: number
    finalStatus: 'pending' | 'approved' | 'rejected'
    escalated: boolean
    escalationDate?: string
    escalatedTo?: string
  }

  balanceImpact?: {
    balanceBefore: {
      annualLeave: number
      sickLeave: number
      hajjLeave: boolean
    }
    deducted: {
      annualLeave?: number
      sickLeave?: number
      unpaidLeave?: number
    }
    balanceAfter: {
      annualLeave: number
      sickLeave: number
      hajjLeave: boolean
    }
  }

  payrollImpact?: {
    affectsPayroll: boolean
    paidDays?: number
    paidAmount?: number
    payPercentage?: number
    unpaidDays?: number
    deductionAmount?: number
    processedInPayrollRun?: string
    processedDate?: string
  }

  returnFromLeave?: ReturnFromLeave

  conflicts?: {
    hasConflicts: boolean
    overlappingLeaves?: Array<{
      conflictType: string
      conflictDetails: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      conflictingLeaveId?: string
      conflictingEmployee?: string
    }>
    teamImpact?: {
      teamSize: number
      onLeaveCount: number
      availableCount: number
      coveragePercentage: number
      acceptable: boolean
    }
    blackoutPeriod?: {
      inBlackoutPeriod: boolean
      blackoutPeriodName?: string
      exceptionGranted: boolean
    }
  }

  cancellation?: {
    cancelled: boolean
    cancellationDate: string
    cancelledBy: string
    cancellationReason: string
    balanceRestored: boolean
    restoredAmount?: number
  }

  documents?: LeaveDocument[]

  notes?: {
    employeeNotes?: string
    managerNotes?: string
    hrNotes?: string
    internalNotes?: string
  }

  statistics?: {
    employeeYTDStats: {
      totalLeaveDaysTaken: number
      totalPaidLeaveDays: number
      totalUnpaidLeaveDays: number
      annualLeaveDaysTaken: number
      sickLeaveDaysTaken: number
      leaveRequestsSubmitted: number
      leaveRequestsApproved: number
    }
  }
}

// Create Leave Request Data
export interface CreateLeaveRequestData {
  employeeId: string
  leaveType: LeaveType
  dates: {
    startDate: string
    endDate: string
    halfDay?: boolean
    halfDayPeriod?: 'first_half' | 'second_half'
  }
  reason: string
  reasonAr?: string
  leaveDetails?: {
    isEmergency?: boolean
    emergencyReason?: string
    contactDuringLeave?: {
      available: boolean
      contactNumber?: string
      email?: string
      emergencyContact?: {
        name: string
        relationship: string
        phone: string
      }
    }
    // Type-specific
    sickLeave?: {
      hospitalized?: boolean
      hospitalName?: string
    }
    hajjLeave?: {
      hajjPermitNumber?: string
    }
    maternityLeave?: {
      expectedDeliveryDate?: string
    }
    marriageLeave?: {
      marriageDate?: string
    }
    deathLeave?: {
      relationship?: string
      deceasedName?: string
      dateOfDeath?: string
    }
    examLeave?: {
      examType?: string
      institution?: string
      examDate?: string
    }
    unpaidLeave?: {
      reasonCategory?: string
      detailedReason?: string
    }
  }
  workHandover?: {
    delegateToEmployeeId?: string
    tasks?: Array<{
      taskName: string
      taskDescription: string
      priority: 'low' | 'medium' | 'high' | 'urgent'
      dueDate?: string
      instructions?: string
    }>
  }
  notes?: {
    employeeNotes?: string
  }
}

export interface UpdateLeaveRequestData extends Partial<CreateLeaveRequestData> {
  status?: LeaveStatus
}

export interface LeaveRequestsResponse {
  data: LeaveRequest[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface LeaveRequestFilters {
  employeeId?: string
  leaveType?: LeaveType
  status?: LeaveStatus
  startDate?: string
  endDate?: string
  department?: string
  page?: number
  limit?: number
}

export interface LeaveBalance {
  employeeId: string
  employeeName: string
  yearOfService: number
  annualLeave: {
    entitlement: number
    used: number
    pending: number
    remaining: number
    carriedForward: number
  }
  sickLeave: {
    fullPayUsed: number
    partialPayUsed: number
    unpaidUsed: number
    totalUsed: number
    remaining: number
  }
  hajjLeave: {
    eligible: boolean
    taken: boolean
  }
  otherLeave: {
    marriageUsed: boolean
    deathUsed: number
    birthUsed: number
  }
}

// API Functions
export const getLeaveRequests = async (filters?: LeaveRequestFilters): Promise<LeaveRequestsResponse> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.leaveType) params.append('leaveType', filters.leaveType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/leave-requests?${params.toString()}`)
  return response.data
}

export const getLeaveRequest = async (requestId: string): Promise<LeaveRequest> => {
  const response = await api.get(`/hr/leave-requests/${requestId}`)
  return response.data
}

export const createLeaveRequest = async (data: CreateLeaveRequestData): Promise<LeaveRequest> => {
  const response = await api.post('/hr/leave-requests', data)
  return response.data
}

export const updateLeaveRequest = async (requestId: string, data: UpdateLeaveRequestData): Promise<LeaveRequest> => {
  const response = await api.patch(`/hr/leave-requests/${requestId}`, data)
  return response.data
}

export const deleteLeaveRequest = async (requestId: string): Promise<void> => {
  await api.delete(`/hr/leave-requests/${requestId}`)
}

// Submit for approval
export const submitLeaveRequest = async (requestId: string): Promise<LeaveRequest> => {
  const response = await api.post(`/hr/leave-requests/${requestId}/submit`)
  return response.data
}

// Approve leave request
export const approveLeaveRequest = async (requestId: string, comments?: string): Promise<LeaveRequest> => {
  const response = await api.post(`/hr/leave-requests/${requestId}/approve`, { comments })
  return response.data
}

// Reject leave request
export const rejectLeaveRequest = async (requestId: string, reason: string): Promise<LeaveRequest> => {
  const response = await api.post(`/hr/leave-requests/${requestId}/reject`, { reason })
  return response.data
}

// Cancel leave request
export const cancelLeaveRequest = async (requestId: string, reason: string): Promise<LeaveRequest> => {
  const response = await api.post(`/hr/leave-requests/${requestId}/cancel`, { reason })
  return response.data
}

// Confirm return from leave
export const confirmReturn = async (requestId: string, returnDate: string): Promise<LeaveRequest> => {
  const response = await api.post(`/hr/leave-requests/${requestId}/confirm-return`, { returnDate })
  return response.data
}

// Request extension
export const requestExtension = async (requestId: string, extensionDays: number, reason: string): Promise<LeaveRequest> => {
  const response = await api.post(`/hr/leave-requests/${requestId}/request-extension`, { extensionDays, reason })
  return response.data
}

// Get employee leave balance
export const getLeaveBalance = async (employeeId: string): Promise<LeaveBalance> => {
  const response = await api.get(`/hr/leave-requests/balance/${employeeId}`)
  return response.data
}

// Get leave statistics
export const getLeaveStats = async (filters?: { year?: number; department?: string }): Promise<{
  totalRequests: number
  pendingApproval: number
  approvedThisMonth: number
  onLeaveToday: number
  averageLeaveDays: number
  byType: Record<LeaveType, number>
}> => {
  const params = new URLSearchParams()
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.department) params.append('department', filters.department)

  const response = await api.get(`/hr/leave-requests/stats?${params.toString()}`)
  return response.data
}

// Get team calendar (who's on leave)
export const getTeamCalendar = async (startDate: string, endDate: string, department?: string): Promise<{
  date: string
  employees: Array<{
    employeeId: string
    employeeName: string
    leaveType: LeaveType
    status: LeaveStatus
  }>
}[]> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (department) params.append('department', department)

  const response = await api.get(`/hr/leave-requests/calendar?${params.toString()}`)
  return response.data
}

// Check conflicts before submitting
export const checkConflicts = async (data: {
  employeeId: string
  startDate: string
  endDate: string
}): Promise<{
  hasConflicts: boolean
  conflicts: Array<{
    conflictType: string
    conflictDetails: string
    severity: string
  }>
  teamImpact: {
    onLeaveCount: number
    coveragePercentage: number
    acceptable: boolean
  }
}> => {
  const response = await api.post('/hr/leave-requests/check-conflicts', data)
  return response.data
}

// Upload document
export const uploadLeaveDocument = async (requestId: string, file: File, documentType: string): Promise<LeaveDocument> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', documentType)

  const response = await api.post(`/hr/leave-requests/${requestId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Complete handover
export const completeHandover = async (requestId: string): Promise<LeaveRequest> => {
  const response = await api.post(`/hr/leave-requests/${requestId}/complete-handover`)
  return response.data
}

// Get pending approvals (for managers)
export const getPendingApprovals = async (): Promise<LeaveRequest[]> => {
  const response = await api.get('/hr/leave-requests/pending-approvals')
  return response.data
}

// Get leave types
export const getLeaveTypes = async (): Promise<Array<{
  leaveType: LeaveType
  name: string
  nameAr: string
  maxDays?: number
  article?: string
}>> => {
  const response = await api.get('/hr/leave-types')
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const leaveService = {
  // List & Details
  getLeaveRequests,
  getLeaveRequest,
  getLeaveBalance,
  getLeaveStats,
  getTeamCalendar,
  getLeaveTypes,
  getPendingApprovals,
  // CRUD
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  // Workflow
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  // Return & Extension
  confirmReturn,
  requestExtension,
  // Conflicts & Documents
  checkConflicts,
  uploadLeaveDocument,
  completeHandover,
}

export default leaveService
