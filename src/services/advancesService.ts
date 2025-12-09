import api from './api'

// ==================== TYPES & ENUMS ====================

// Advance Type
export type AdvanceType = 'salary' | 'emergency' | 'travel' | 'relocation' | 'medical' |
  'education' | 'housing' | 'end_of_year' | 'other'

// Advance Category
export type AdvanceCategory = 'regular' | 'emergency' | 'special'

// Advance Status
export type AdvanceStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' |
  'recovering' | 'completed' | 'cancelled'

// Request Status
export type RequestStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled'

// Urgency Level
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'

// Recovery Status
export type RecoveryStatus = 'pending' | 'paid' | 'partial' | 'missed' | 'waived'

// Recovery Method
export type RecoveryMethod = 'payroll_deduction' | 'bank_transfer' | 'cash' |
  'final_settlement' | 'lump_sum'

// Disbursement Method
export type DisbursementMethod = 'bank_transfer' | 'cash' | 'check' | 'payroll_addition'

// ==================== LABELS ====================

export const ADVANCE_TYPE_LABELS: Record<AdvanceType, { ar: string; en: string; color: string }> = {
  salary: { ar: 'سلفة راتب', en: 'Salary Advance', color: 'blue' },
  emergency: { ar: 'طوارئ', en: 'Emergency', color: 'red' },
  travel: { ar: 'سفر', en: 'Travel', color: 'purple' },
  relocation: { ar: 'انتقال', en: 'Relocation', color: 'amber' },
  medical: { ar: 'طبي', en: 'Medical', color: 'orange' },
  education: { ar: 'تعليم', en: 'Education', color: 'teal' },
  housing: { ar: 'سكن', en: 'Housing', color: 'emerald' },
  end_of_year: { ar: 'نهاية العام', en: 'End of Year', color: 'pink' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray' },
}

export const ADVANCE_STATUS_LABELS: Record<AdvanceStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  approved: { ar: 'معتمد', en: 'Approved', color: 'blue' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  disbursed: { ar: 'مصروف', en: 'Disbursed', color: 'purple' },
  recovering: { ar: 'قيد الاسترداد', en: 'Recovering', color: 'amber' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'emerald' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'gray' },
}

export const URGENCY_LABELS: Record<UrgencyLevel, { ar: string; en: string; color: string }> = {
  low: { ar: 'منخفضة', en: 'Low', color: 'slate' },
  medium: { ar: 'متوسطة', en: 'Medium', color: 'blue' },
  high: { ar: 'عالية', en: 'High', color: 'amber' },
  critical: { ar: 'حرجة', en: 'Critical', color: 'red' },
}

export const RECOVERY_STATUS_LABELS: Record<RecoveryStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'emerald' },
  partial: { ar: 'جزئي', en: 'Partial', color: 'amber' },
  missed: { ar: 'متأخر', en: 'Missed', color: 'red' },
  waived: { ar: 'معفى', en: 'Waived', color: 'purple' },
}

// ==================== INTERFACES ====================

// Repayment Schedule Item
export interface RepaymentInstallment {
  installmentNumber: number
  dueDate: string
  installmentAmount: number
  status: RecoveryStatus
  paidAmount?: number
  paidDate?: string
  paymentMethod?: RecoveryMethod
  paymentReference?: string
  remainingBalance?: number
  daysMissed?: number
  notes?: string
}

// Recovery History Entry
export interface RecoveryHistoryEntry {
  recoveryId: string
  recoveryDate: string
  installmentNumber?: number
  recoveredAmount: number
  recoveryMethod: RecoveryMethod
  recoveryReference?: string
  processedBy?: string
  remainingBalance: number
  receiptNumber?: string
  notes?: string
}

// Approval Step
export interface ApprovalStep {
  stepNumber: number
  stepName: string
  stepNameAr?: string
  approverRole: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  actionDate?: string
  decision?: 'approve' | 'reject' | 'reduce_amount'
  approvedAmount?: number
  approvedInstallments?: number
  comments?: string
  notificationSent: boolean
}

// Eligibility Check
export interface EligibilityCheck {
  checkType: string
  checkName: string
  checkNameAr?: string
  passed: boolean
  requirement?: string
  actualValue?: string
  notes?: string
}

// Disbursement
export interface Disbursement {
  disbursementMethod: DisbursementMethod
  bankTransfer?: {
    bankName: string
    accountNumber: string
    iban: string
    transferDate?: string
    transferReference?: string
    transferStatus: 'pending' | 'processed' | 'completed' | 'failed'
  }
  cash?: {
    disbursedOn: string
    disbursedBy: string
    receiptNumber: string
  }
  disbursed: boolean
  disbursementDate?: string
  actualDisbursedAmount: number
  netDisbursedAmount: number
  urgentDisbursement: boolean
}

// Balance
export interface AdvanceBalance {
  originalAmount: number
  recoveredAmount: number
  remainingBalance: number
  completionPercentage: number
}

// Main Advance Record
export interface AdvanceRecord {
  _id: string
  advanceId: string
  advanceNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string

  // Advance Details
  advanceType: AdvanceType
  advanceCategory: AdvanceCategory
  advanceAmount: number
  approvedAmount?: number
  currency: string
  reason?: string
  reasonAr?: string
  urgency: UrgencyLevel
  isEmergency: boolean

  // Repayment
  repayment: {
    installments: number
    installmentAmount: number
    startDate: string
    endDate?: string
  }

  // Balance
  balance: AdvanceBalance

  // Status
  status: AdvanceStatus
  requestStatus: RequestStatus

  // Dates
  requestDate: string
  approvalDate?: string
  disbursementDate?: string

  // Eligibility
  eligibility?: {
    eligible: boolean
    eligibilityChecks: EligibilityCheck[]
    ineligibilityReasons?: string[]
  }

  // Approval Workflow
  approvalWorkflow?: {
    required: boolean
    fastTrack: boolean
    workflowSteps: ApprovalStep[]
    currentStep: number
    totalSteps: number
    finalStatus: 'pending' | 'approved' | 'rejected'
    finalApprover?: string
    finalApprovalDate?: string
    rejectionReason?: string
  }

  // Disbursement
  disbursement?: Disbursement

  // Repayment Schedule
  repaymentSchedule?: {
    installments: RepaymentInstallment[]
    summary: {
      totalInstallments: number
      paidInstallments: number
      pendingInstallments: number
      missedInstallments: number
      totalPayable: number
      amountPaid: number
      remainingAmount: number
    }
  }

  // Recovery History
  recoveryHistory?: RecoveryHistoryEntry[]

  // Recovery Performance
  recoveryPerformance?: {
    onTimeRecoveries: number
    delayedRecoveries: number
    missedRecoveries: number
    onTimePercentage: number
    performanceRating?: 'excellent' | 'good' | 'fair' | 'poor'
  }

  // Notes
  notes?: {
    employeeNotes?: string
    managerNotes?: string
    hrNotes?: string
    financeNotes?: string
    internalNotes?: string
  }

  // Completion
  completion?: {
    advanceCompleted: boolean
    completionDate?: string
    completionMethod?: 'full_recovery' | 'early_recovery' | 'exit_settlement' | 'write_off' | 'waived'
    clearanceLetterIssued: boolean
    clearanceLetterUrl?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Advance Data
export interface CreateAdvanceData {
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string
  advanceType: AdvanceType
  advanceCategory?: AdvanceCategory
  advanceAmount: number
  currency?: string
  reason?: string
  reasonAr?: string
  urgency?: UrgencyLevel
  isEmergency?: boolean
  installments: number
  startDate: string
  notes?: {
    employeeNotes?: string
    hrNotes?: string
  }
}

// Update Advance Data
export interface UpdateAdvanceData {
  advanceType?: AdvanceType
  advanceAmount?: number
  reason?: string
  reasonAr?: string
  urgency?: UrgencyLevel
  repayment?: {
    installments?: number
    startDate?: string
  }
  notes?: {
    employeeNotes?: string
    hrNotes?: string
    financeNotes?: string
    internalNotes?: string
  }
}

// Filters
export interface AdvanceFilters {
  status?: AdvanceStatus
  advanceType?: AdvanceType
  department?: string
  employeeId?: string
  urgency?: UrgencyLevel
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Response
export interface AdvanceResponse {
  data: AdvanceRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface AdvanceStats {
  totalAdvances: number
  byStatus: Array<{ status: AdvanceStatus; count: number }>
  byType: Array<{ advanceType: AdvanceType; count: number }>
  totalDisbursed: number
  totalOutstanding: number
  totalRecovered: number
  activeAdvances: number
  pendingApproval: number
  thisMonth: {
    requests: number
    approvals: number
    disbursements: number
    recoveries: number
  }
  averageRecoveryRate: number
}

// ==================== API FUNCTIONS ====================

// Get all advances
export const getAdvances = async (filters?: AdvanceFilters): Promise<AdvanceResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.advanceType) params.append('advanceType', filters.advanceType)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.urgency) params.append('urgency', filters.urgency)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/advances?${params.toString()}`)
  return response.data
}

// Get single advance
export const getAdvance = async (advanceId: string): Promise<AdvanceRecord> => {
  const response = await api.get(`/hr/advances/${advanceId}`)
  return response.data
}

// Create advance
export const createAdvance = async (data: CreateAdvanceData): Promise<AdvanceRecord> => {
  const response = await api.post('/hr/advances', data)
  return response.data
}

// Update advance
export const updateAdvance = async (advanceId: string, data: UpdateAdvanceData): Promise<AdvanceRecord> => {
  const response = await api.patch(`/hr/advances/${advanceId}`, data)
  return response.data
}

// Delete advance
export const deleteAdvance = async (advanceId: string): Promise<void> => {
  await api.delete(`/hr/advances/${advanceId}`)
}

// Get advance stats
export const getAdvanceStats = async (): Promise<AdvanceStats> => {
  const response = await api.get('/hr/advances/stats')
  return response.data
}

// Check eligibility
export const checkAdvanceEligibility = async (employeeId: string, amount: number): Promise<{
  eligible: boolean
  eligibilityChecks: EligibilityCheck[]
  maxAdvanceLimit: number
  availableLimit: number
  ineligibilityReasons?: string[]
}> => {
  const response = await api.post('/hr/advances/check-eligibility', { employeeId, amount })
  return response.data
}

// Cancel advance request
export const cancelAdvanceRequest = async (advanceId: string): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/cancel`)
  return response.data
}

// Submit advance request for approval (TODO: Backend endpoint not implemented)
export const submitAdvanceRequest = async (advanceId: string): Promise<AdvanceRecord> => {
  // TODO: Backend needs to implement POST /hr/advances/:advanceId/submit
  const response = await api.post(`/hr/advances/${advanceId}/submit`)
  return response.data
}

// Approve advance
export const approveAdvance = async (advanceId: string, data: {
  approvedAmount?: number
  approvedInstallments?: number
  comments?: string
}): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/approve`, data)
  return response.data
}

// Reject advance
export const rejectAdvance = async (advanceId: string, data: {
  reason: string
  comments?: string
}): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/reject`, data)
  return response.data
}

// Disburse advance
export const disburseAdvance = async (advanceId: string, data: {
  disbursementMethod: DisbursementMethod
  bankDetails?: {
    bankName: string
    accountNumber: string
    iban: string
  }
  transferReference?: string
  urgentDisbursement?: boolean
}): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/disburse`, data)
  return response.data
}

// Record recovery
export const recordAdvanceRecovery = async (advanceId: string, data: {
  installmentNumber?: number
  amount: number
  recoveryMethod: RecoveryMethod
  recoveryDate: string
  recoveryReference?: string
  notes?: string
}): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/recover`, data)
  return response.data
}

// Process payroll deduction
export const processPayrollDeduction = async (advanceId: string, data: {
  payrollRunId: string
  payrollMonth: string
  payrollYear: number
  deductedAmount: number
}): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/payroll-deduction`, data)
  return response.data
}

// Early recovery
export const processEarlyRecovery = async (advanceId: string, data: {
  recoveryAmount: number
  recoveryMethod: RecoveryMethod
  recoveryReference?: string
}): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/early-recovery`, data)
  return response.data
}

// Write off advance
export const writeOffAdvance = async (advanceId: string, data: {
  writeOffReason: string
  comments?: string
}): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/write-off`, data)
  return response.data
}

// Waive advance (partial or full) (TODO: Backend endpoint not implemented)
export const waiveAdvance = async (advanceId: string, data: {
  waiveReason: string
  waiveAmount?: number
  comments?: string
}): Promise<AdvanceRecord> => {
  // TODO: Backend needs to implement POST /hr/advances/:advanceId/waive
  const response = await api.post(`/hr/advances/${advanceId}/waive`, data)
  return response.data
}

// Issue clearance letter
export const issueClearanceLetter = async (advanceId: string): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/issue-clearance`)
  return response.data
}

// Upload document
export const uploadAdvanceDocument = async (advanceId: string, file: File): Promise<AdvanceRecord> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/hr/advances/${advanceId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Add communication
export const addCommunication = async (advanceId: string, data: any): Promise<AdvanceRecord> => {
  const response = await api.post(`/hr/advances/${advanceId}/communications`, data)
  return response.data
}

// Bulk delete
export const bulkDeleteAdvances = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/advances/bulk-delete', { ids })
  return response.data
}

// Get employee advances
export const getEmployeeAdvances = async (employeeId: string): Promise<AdvanceRecord[]> => {
  const response = await api.get(`/hr/advances/by-employee/${employeeId}`)
  return response.data
}

// Get pending approvals
export const getPendingApprovals = async (): Promise<Array<{
  advanceId: string
  employeeName: string
  advanceType: AdvanceType
  amount: number
  urgency: UrgencyLevel
  requestDate: string
}>> => {
  const response = await api.get('/hr/advances/pending-approvals')
  return response.data
}

// Get overdue recoveries
export const getOverdueRecoveries = async (): Promise<Array<{
  advanceId: string
  employeeName: string
  installmentNumber: number
  dueDate: string
  amount: number
  daysOverdue: number
}>> => {
  const response = await api.get('/hr/advances/overdue-recoveries')
  return response.data
}

// Get emergency advances
export const getEmergencyAdvances = async (): Promise<AdvanceRecord[]> => {
  const response = await api.get('/hr/advances/emergency')
  return response.data
}
