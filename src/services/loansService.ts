import api from './api'

// ==================== TYPES & ENUMS ====================

// Loan Type
export type LoanType = 'personal' | 'housing' | 'vehicle' | 'education' | 'emergency' |
  'marriage' | 'medical' | 'hajj' | 'furniture' | 'computer' | 'travel' | 'other'

// Loan Status
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted' | 'cancelled'

// Application Status
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled'

// Installment Status
export type InstallmentStatus = 'pending' | 'paid' | 'partial' | 'missed' | 'waived'

// Payment Method
export type PaymentMethod = 'payroll_deduction' | 'bank_transfer' | 'cash' | 'check'

// Disbursement Method
export type DisbursementMethod = 'bank_transfer' | 'cash' | 'check' | 'third_party_payment'

// ==================== LABELS ====================

export const LOAN_TYPE_LABELS: Record<LoanType, { ar: string; en: string; color: string }> = {
  personal: { ar: 'شخصي', en: 'Personal', color: 'blue' },
  housing: { ar: 'سكني', en: 'Housing', color: 'emerald' },
  vehicle: { ar: 'سيارة', en: 'Vehicle', color: 'purple' },
  education: { ar: 'تعليمي', en: 'Education', color: 'amber' },
  emergency: { ar: 'طوارئ', en: 'Emergency', color: 'red' },
  marriage: { ar: 'زواج', en: 'Marriage', color: 'pink' },
  medical: { ar: 'طبي', en: 'Medical', color: 'orange' },
  hajj: { ar: 'حج/عمرة', en: 'Hajj/Umrah', color: 'teal' },
  furniture: { ar: 'أثاث', en: 'Furniture', color: 'indigo' },
  computer: { ar: 'حاسب', en: 'Computer', color: 'cyan' },
  travel: { ar: 'سفر', en: 'Travel', color: 'lime' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray' },
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  approved: { ar: 'معتمد', en: 'Approved', color: 'blue' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  active: { ar: 'نشط', en: 'Active', color: 'emerald' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'green' },
  defaulted: { ar: 'متعثر', en: 'Defaulted', color: 'orange' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'gray' },
}

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'emerald' },
  partial: { ar: 'جزئي', en: 'Partial', color: 'amber' },
  missed: { ar: 'متأخر', en: 'Missed', color: 'red' },
  waived: { ar: 'معفى', en: 'Waived', color: 'purple' },
}

// ==================== INTERFACES ====================

// Repayment Schedule
export interface RepaymentSchedule {
  installments: number
  installmentAmount: number
  installmentFrequency: 'monthly' | 'bi_weekly' | 'quarterly'
  firstInstallmentDate: string
  lastInstallmentDate: string
  paymentDay?: number
  deductionMethod: PaymentMethod
}

// Installment
export interface Installment {
  installmentNumber: number
  dueDate: string
  principalAmount: number
  interestAmount?: number
  installmentAmount: number
  status: InstallmentStatus
  paidAmount?: number
  paidDate?: string
  paymentMethod?: PaymentMethod
  paymentReference?: string
  remainingBalance: number
  lateFee?: number
  lateDays?: number
  notes?: string
}

// Balance
export interface LoanBalance {
  originalAmount: number
  paidAmount: number
  remainingBalance: number
  completionPercentage: number
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
  decision?: 'approve' | 'reject' | 'request_changes' | 'escalate'
  approvedAmount?: number
  approvedInstallments?: number
  comments?: string
  conditions?: string[]
}

// Payment History Entry
export interface PaymentHistoryEntry {
  paymentId: string
  paymentDate: string
  installmentNumber?: number
  principalPaid: number
  interestPaid?: number
  feesPaid?: number
  lateFeesPaid?: number
  totalPaid: number
  paymentMethod: PaymentMethod
  paymentReference?: string
  remainingBalance: number
  receiptNumber?: string
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
  disbursed: boolean
  disbursementDate?: string
  actualDisbursedAmount: number
  netDisbursedAmount: number
}

// Main Loan Record
export interface LoanRecord {
  _id: string
  loanId: string
  loanNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string

  // Loan Details
  loanType: LoanType
  loanAmount: number
  currency: string
  purpose?: string
  purposeAr?: string

  // Repayment
  repayment: RepaymentSchedule

  // Balance
  balance: LoanBalance

  // Status
  status: LoanStatus
  applicationStatus: ApplicationStatus

  // Dates
  applicationDate: string
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

  // Installments
  installments?: Installment[]

  // Payment History
  paymentHistory?: PaymentHistoryEntry[]

  // Payment Performance
  paymentPerformance?: {
    onTimePayments: number
    latePayments: number
    missedPayments: number
    onTimePercentage: number
    totalLateFees: number
    paymentRating?: 'excellent' | 'good' | 'fair' | 'poor'
  }

  // Notes
  notes?: {
    employeeNotes?: string
    hrNotes?: string
    financeNotes?: string
    internalNotes?: string
  }

  // Completion
  completion?: {
    loanCompleted: boolean
    completionDate?: string
    completionMethod?: 'full_repayment' | 'early_settlement' | 'write_off' | 'exit_settlement'
    clearanceLetterIssued: boolean
    clearanceLetterUrl?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Loan Data
export interface CreateLoanData {
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string
  loanType: LoanType
  loanAmount: number
  currency?: string
  purpose?: string
  purposeAr?: string
  installments: number
  installmentAmount?: number
  firstInstallmentDate: string
  deductionMethod?: PaymentMethod
  notes?: {
    employeeNotes?: string
    hrNotes?: string
  }
}

// Update Loan Data
export interface UpdateLoanData {
  loanType?: LoanType
  loanAmount?: number
  purpose?: string
  purposeAr?: string
  repayment?: Partial<RepaymentSchedule>
  status?: LoanStatus
  notes?: {
    employeeNotes?: string
    hrNotes?: string
    financeNotes?: string
    internalNotes?: string
  }
}

// Filters
export interface LoanFilters {
  status?: LoanStatus
  loanType?: LoanType
  department?: string
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Response
export interface LoanResponse {
  data: LoanRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface LoanStats {
  totalLoans: number
  byStatus: Array<{ status: LoanStatus; count: number }>
  byType: Array<{ loanType: LoanType; count: number }>
  totalDisbursed: number
  totalOutstanding: number
  totalRepaid: number
  activeLoans: number
  defaultedLoans: number
  thisMonth: {
    applications: number
    approvals: number
    disbursements: number
    completions: number
  }
  averageRepaymentRate: number
}

// ==================== API FUNCTIONS ====================

// Get all loans
export const getLoans = async (filters?: LoanFilters): Promise<LoanResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.loanType) params.append('loanType', filters.loanType)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/employee-loans?${params.toString()}`)
  return response.data
}

// Get single loan
export const getLoan = async (loanId: string): Promise<LoanRecord> => {
  const response = await api.get(`/hr/employee-loans/${loanId}`)
  return response.data
}

// Create loan
export const createLoan = async (data: CreateLoanData): Promise<LoanRecord> => {
  const response = await api.post('/hr/employee-loans', data)
  return response.data
}

// Update loan
export const updateLoan = async (loanId: string, data: UpdateLoanData): Promise<LoanRecord> => {
  const response = await api.patch(`/hr/employee-loans/${loanId}`, data)
  return response.data
}

// Delete loan
export const deleteLoan = async (loanId: string): Promise<void> => {
  await api.delete(`/hr/employee-loans/${loanId}`)
}

// Get loan stats
export const getLoanStats = async (): Promise<LoanStats> => {
  const response = await api.get('/hr/employee-loans/stats')
  return response.data
}

// Check eligibility
export const checkLoanEligibility = async (employeeId: string, amount: number): Promise<{
  eligible: boolean
  eligibilityChecks: EligibilityCheck[]
  creditLimit: number
  availableCredit: number
  ineligibilityReasons?: string[]
}> => {
  const response = await api.post('/hr/employee-loans/check-eligibility', { employeeId, amount })
  return response.data
}

// Submit application
export const submitLoanApplication = async (loanId: string): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/submit`)
  return response.data
}

// Approve loan
export const approveLoan = async (loanId: string, data: {
  approvedAmount?: number
  approvedInstallments?: number
  comments?: string
  conditions?: string[]
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/approve`, data)
  return response.data
}

// Reject loan
export const rejectLoan = async (loanId: string, data: {
  reason: string
  comments?: string
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/reject`, data)
  return response.data
}

// Disburse loan
export const disburseLoan = async (loanId: string, data: {
  disbursementMethod: DisbursementMethod
  bankDetails?: {
    bankName: string
    accountNumber: string
    iban: string
  }
  transferReference?: string
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/disburse`, data)
  return response.data
}

// Record payment
export const recordLoanPayment = async (loanId: string, data: {
  installmentNumber?: number
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: string
  paymentReference?: string
  notes?: string
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/payments`, data)
  return response.data
}

// Process payroll deduction
export const processPayrollDeduction = async (loanId: string, data: {
  payrollRunId: string
  payrollMonth: string
  payrollYear: number
  deductedAmount: number
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/payroll-deduction`, data)
  return response.data
}

// Early settlement
export const calculateEarlySettlement = async (loanId: string): Promise<{
  remainingPrincipal: number
  remainingInterest: number
  interestWaiver: number
  earlySettlementPenalty: number
  totalSettlementAmount: number
  savings: number
}> => {
  const response = await api.get(`/hr/employee-loans/${loanId}/early-settlement-calculation`)
  return response.data
}

// Process early settlement
export const processEarlySettlement = async (loanId: string, data: {
  settlementAmount: number
  paymentMethod: PaymentMethod
  paymentReference?: string
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/early-settlement`, data)
  return response.data
}

// Mark as defaulted
export const markLoanDefaulted = async (loanId: string, data: {
  defaultReason: string
  notes?: string
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/default`, data)
  return response.data
}

// Restructure loan
export const restructureLoan = async (loanId: string, data: {
  newInstallmentAmount: number
  newInstallments: number
  reason: string
}): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/restructure`, data)
  return response.data
}

// Issue clearance letter
export const issueClearanceLetter = async (loanId: string): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/issue-clearance`)
  return response.data
}

// Upload document
export const uploadLoanDocument = async (loanId: string, file: File): Promise<LoanRecord> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/hr/employee-loans/${loanId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Add communication
export const addCommunication = async (loanId: string, data: any): Promise<LoanRecord> => {
  const response = await api.post(`/hr/employee-loans/${loanId}/communications`, data)
  return response.data
}

// Bulk delete
export const bulkDeleteLoans = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/employee-loans/bulk-delete', { ids })
  return response.data
}

// Get employee loans
export const getEmployeeLoans = async (employeeId: string): Promise<LoanRecord[]> => {
  const response = await api.get(`/hr/employee-loans/by-employee/${employeeId}`)
  return response.data
}

// Get pending approvals
export const getPendingApprovals = async (): Promise<Array<{
  loanId: string
  employeeName: string
  loanType: LoanType
  amount: number
  applicationDate: string
}>> => {
  const response = await api.get('/hr/employee-loans/pending-approvals')
  return response.data
}

// Get overdue installments
export const getOverdueInstallments = async (): Promise<Array<{
  loanId: string
  employeeName: string
  installmentNumber: number
  dueDate: string
  amount: number
  daysOverdue: number
}>> => {
  const response = await api.get('/hr/employee-loans/overdue-installments')
  return response.data
}
