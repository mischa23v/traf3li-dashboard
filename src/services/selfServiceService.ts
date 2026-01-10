import api from './api'

// ==================== TYPES & ENUMS ====================

// Request Type
export type SelfServiceRequestType =
  | 'leave'
  | 'document'
  | 'letter'
  | 'profile_update'
  | 'benefit'
  | 'training'
  | 'expense'
  | 'asset'
  | 'travel'
  | 'overtime'
  | 'loan'
  | 'grievance'
  | 'feedback'
  | 'other'

// Request Status
export type SelfServiceRequestStatus =
  | 'draft'
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'processing'
  | 'completed'
  | 'expired'

// Document Type
export type DocumentType =
  | 'salary_certificate'
  | 'employment_certificate'
  | 'experience_certificate'
  | 'bank_letter'
  | 'visa_letter'
  | 'noc_letter'
  | 'salary_transfer_letter'
  | 'payslip'
  | 'tax_certificate'
  | 'gosi_certificate'
  | 'contract_copy'
  | 'id_copy'
  | 'promotion_letter'
  | 'warning_letter'
  | 'appreciation_letter'
  | 'custom'

// Letter Purpose
export type LetterPurpose =
  | 'embassy'
  | 'bank'
  | 'landlord'
  | 'school'
  | 'hospital'
  | 'government'
  | 'personal'
  | 'other'

// Approval Level
export type ApprovalLevel = 'line_manager' | 'department_head' | 'hr' | 'finance' | 'ceo' | 'auto'

// ==================== LABELS ====================

export const REQUEST_TYPE_LABELS: Record<
  SelfServiceRequestType,
  { ar: string; en: string; icon: string }
> = {
  leave: { ar: 'طلب إجازة', en: 'Leave Request', icon: 'Calendar' },
  document: { ar: 'طلب مستند', en: 'Document Request', icon: 'FileText' },
  letter: { ar: 'طلب خطاب', en: 'Letter Request', icon: 'Mail' },
  profile_update: { ar: 'تحديث الملف الشخصي', en: 'Profile Update', icon: 'User' },
  benefit: { ar: 'طلب مزايا', en: 'Benefit Request', icon: 'Gift' },
  training: { ar: 'طلب تدريب', en: 'Training Request', icon: 'GraduationCap' },
  expense: { ar: 'طلب مصروفات', en: 'Expense Request', icon: 'Receipt' },
  asset: { ar: 'طلب أصول', en: 'Asset Request', icon: 'Package' },
  travel: { ar: 'طلب سفر', en: 'Travel Request', icon: 'Plane' },
  overtime: { ar: 'طلب عمل إضافي', en: 'Overtime Request', icon: 'Clock' },
  loan: { ar: 'طلب قرض', en: 'Loan Request', icon: 'DollarSign' },
  grievance: { ar: 'تظلم', en: 'Grievance', icon: 'AlertCircle' },
  feedback: { ar: 'ملاحظات', en: 'Feedback', icon: 'MessageSquare' },
  other: { ar: 'طلب آخر', en: 'Other Request', icon: 'HelpCircle' },
}

export const REQUEST_STATUS_LABELS: Record<
  SelfServiceRequestStatus,
  { ar: string; en: string; color: string }
> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'yellow' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review', color: 'blue' },
  approved: { ar: 'موافق عليه', en: 'Approved', color: 'green' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'gray' },
  processing: { ar: 'قيد المعالجة', en: 'Processing', color: 'orange' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'teal' },
  expired: { ar: 'منتهي الصلاحية', en: 'Expired', color: 'red' },
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, { ar: string; en: string }> = {
  salary_certificate: { ar: 'شهادة راتب', en: 'Salary Certificate' },
  employment_certificate: { ar: 'شهادة عمل', en: 'Employment Certificate' },
  experience_certificate: { ar: 'شهادة خبرة', en: 'Experience Certificate' },
  bank_letter: { ar: 'خطاب بنكي', en: 'Bank Letter' },
  visa_letter: { ar: 'خطاب تأشيرة', en: 'Visa Letter' },
  noc_letter: { ar: 'خطاب عدم ممانعة', en: 'NOC Letter' },
  salary_transfer_letter: { ar: 'خطاب تحويل راتب', en: 'Salary Transfer Letter' },
  payslip: { ar: 'كشف راتب', en: 'Payslip' },
  tax_certificate: { ar: 'شهادة ضريبية', en: 'Tax Certificate' },
  gosi_certificate: { ar: 'شهادة التأمينات', en: 'GOSI Certificate' },
  contract_copy: { ar: 'نسخة العقد', en: 'Contract Copy' },
  id_copy: { ar: 'نسخة الهوية', en: 'ID Copy' },
  promotion_letter: { ar: 'خطاب ترقية', en: 'Promotion Letter' },
  warning_letter: { ar: 'خطاب إنذار', en: 'Warning Letter' },
  appreciation_letter: { ar: 'خطاب تقدير', en: 'Appreciation Letter' },
  custom: { ar: 'مخصص', en: 'Custom' },
}

export const LETTER_PURPOSE_LABELS: Record<LetterPurpose, { ar: string; en: string }> = {
  embassy: { ar: 'سفارة', en: 'Embassy' },
  bank: { ar: 'بنك', en: 'Bank' },
  landlord: { ar: 'مالك العقار', en: 'Landlord' },
  school: { ar: 'مدرسة', en: 'School' },
  hospital: { ar: 'مستشفى', en: 'Hospital' },
  government: { ar: 'جهة حكومية', en: 'Government' },
  personal: { ar: 'شخصي', en: 'Personal' },
  other: { ar: 'أخرى', en: 'Other' },
}

// ==================== INTERFACES ====================

// Self Service Request
export interface SelfServiceRequest {
  _id: string
  requestId: string
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber: string
  departmentId: string
  departmentName: string
  departmentNameAr?: string

  // Request Details
  requestType: SelfServiceRequestType
  subject: string
  subjectAr?: string
  description?: string
  descriptionAr?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'

  // Status & Workflow
  status: SelfServiceRequestStatus
  currentApprovalLevel?: ApprovalLevel
  approvalChain: Array<{
    level: ApprovalLevel
    approverId?: string
    approverName?: string
    status: 'pending' | 'approved' | 'rejected' | 'skipped'
    comments?: string
    actionDate?: string
  }>

  // Dates
  requestDate: string
  dueDate?: string
  completedDate?: string
  expiryDate?: string

  // Attachments
  attachments?: Array<{
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
    uploadedAt: string
  }>

  // Result
  resultDocument?: {
    fileName: string
    fileUrl: string
    generatedAt: string
  }

  // Audit
  createdAt: string
  updatedAt?: string
}

// Leave Request (specific)
export interface LeaveRequest extends SelfServiceRequest {
  requestType: 'leave'
  leaveDetails: {
    leaveType: string
    startDate: string
    endDate: string
    duration: number
    isHalfDay?: boolean
    halfDayPeriod?: 'morning' | 'afternoon'
    reason?: string
    coveringEmployeeId?: string
    coveringEmployeeName?: string
    medicalCertificate?: string
    balanceBefore: number
    balanceAfter: number
  }
}

// Document Request (specific)
export interface DocumentRequest extends SelfServiceRequest {
  requestType: 'document'
  documentDetails: {
    documentType: DocumentType
    purpose: LetterPurpose
    addressedTo?: string
    additionalInfo?: string
    language: 'ar' | 'en' | 'both'
    copies: number
    urgentDelivery?: boolean
  }
}

// Profile Update Request
export interface ProfileUpdateRequest extends SelfServiceRequest {
  requestType: 'profile_update'
  profileDetails: {
    fieldName: string
    fieldNameAr?: string
    currentValue: string
    newValue: string
    supportingDocument?: string
    verificationRequired: boolean
  }
}

// Expense Request
export interface ExpenseRequest extends SelfServiceRequest {
  requestType: 'expense'
  expenseDetails: {
    expenseCategory: string
    amount: number
    currency: string
    expenseDate: string
    vendor?: string
    description: string
    receipts: string[]
    projectCode?: string
    costCenter?: string
  }
}

// Training Request
export interface TrainingRequest extends SelfServiceRequest {
  requestType: 'training'
  trainingDetails: {
    trainingName: string
    trainingNameAr?: string
    provider: string
    startDate: string
    endDate: string
    duration: number
    durationUnit: 'hours' | 'days' | 'weeks'
    cost: number
    currency: string
    location: 'internal' | 'external' | 'online'
    justification: string
    relevantCompetencies?: string[]
  }
}

// Loan Request
export interface LoanRequest extends SelfServiceRequest {
  requestType: 'loan'
  loanDetails: {
    loanType: 'salary_advance' | 'emergency_loan' | 'housing_loan' | 'education_loan' | 'personal_loan'
    amount: number
    currency: string
    repaymentPeriod: number // months
    monthlyDeduction: number
    reason: string
    existingLoans?: Array<{
      loanId: string
      remainingAmount: number
      monthlyDeduction: number
    }>
  }
}

// My Dashboard
export interface MyDashboard {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeePhoto?: string
  employeeNumber: string
  departmentName: string
  departmentNameAr?: string
  positionTitle: string
  positionTitleAr?: string
  joiningDate: string
  yearsOfService: number

  // Leave Balance
  leaveBalance: {
    annual: { entitled: number; used: number; remaining: number; pending: number }
    sick: { entitled: number; used: number; remaining: number }
    other: { used: number }
  }

  // Quick Stats
  stats: {
    pendingRequests: number
    approvedThisMonth: number
    upcomingLeave?: {
      startDate: string
      endDate: string
      leaveType: string
    }
    nextPayday: string
    totalExpensesClaimed: number
    pendingExpenses: number
  }

  // Recent Activity
  recentActivity: Array<{
    type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'document_ready' | 'policy_update'
    title: string
    titleAr?: string
    date: string
    requestId?: string
  }>

  // Announcements
  announcements: Array<{
    _id: string
    title: string
    titleAr?: string
    content: string
    contentAr?: string
    priority: 'low' | 'medium' | 'high'
    publishedAt: string
    expiresAt?: string
  }>

  // Quick Links
  quickLinks: Array<{
    label: string
    labelAr?: string
    url: string
    icon: string
  }>
}

// My Payslips
export interface MyPayslip {
  _id: string
  payslipId: string
  employeeId: string
  period: string // YYYY-MM
  periodName: string
  periodNameAr?: string
  paymentDate: string

  // Earnings
  earnings: {
    basicSalary: number
    housingAllowance: number
    transportAllowance: number
    otherAllowances: number
    overtime: number
    bonuses: number
    commission: number
    totalEarnings: number
  }

  // Deductions
  deductions: {
    gosi: number
    tax: number
    loanDeductions: number
    otherDeductions: number
    absenceDeductions: number
    totalDeductions: number
  }

  // Net
  netSalary: number
  currency: string

  // Status
  status: 'generated' | 'sent' | 'viewed'
  viewedAt?: string

  // Download
  downloadUrl: string
}

// My Documents
export interface MyDocument {
  _id: string
  documentId: string
  documentType: DocumentType
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number

  // Validity
  issueDate: string
  expiryDate?: string
  isExpired: boolean
  daysUntilExpiry?: number

  // Access
  isDownloadable: boolean
  downloadCount: number
  lastDownloadedAt?: string

  // Audit
  uploadedAt: string
  uploadedBy: string
}

// My Benefits
export interface MyBenefit {
  _id: string
  benefitType: string
  benefitName: string
  benefitNameAr?: string
  description?: string
  descriptionAr?: string

  // Coverage
  provider?: string
  policyNumber?: string
  startDate: string
  endDate?: string
  status: 'active' | 'pending' | 'expired' | 'cancelled'

  // Value
  employerContribution?: number
  employeeContribution?: number
  coverageAmount?: number
  currency?: string

  // Dependents
  dependents?: Array<{
    name: string
    relationship: string
    dateOfBirth?: string
  }>

  // Documents
  policyDocument?: string
  claimForms?: string[]
}

// Policy Document
export interface PolicyDocument {
  _id: string
  policyId: string
  title: string
  titleAr?: string
  category: string
  categoryAr?: string
  description?: string
  descriptionAr?: string
  version: string
  effectiveDate: string
  documentUrl: string
  fileType: string
  fileSize: number

  // Acknowledgment
  requiresAcknowledgment: boolean
  acknowledgedAt?: string
  acknowledgmentRequired: boolean

  // Updates
  lastUpdated: string
  updatedBy: string
  changeLog?: string
}

// Request Filters
export interface SelfServiceRequestFilters {
  requestType?: SelfServiceRequestType
  status?: SelfServiceRequestStatus
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ==================== API FUNCTIONS ====================

/**
 * Get my dashboard
 * GET /hr/self-service/dashboard
 */
export const getMyDashboard = async (): Promise<MyDashboard> => {
  const response = await api.get('/hr/self-service/dashboard')
  return response.data
}

/**
 * Get my requests
 * GET /hr/self-service/requests
 */
export const getMyRequests = async (
  filters?: SelfServiceRequestFilters
): Promise<{
  data: SelfServiceRequest[]
  pagination: { total: number; page: number; limit: number; pages: number }
}> => {
  const params = new URLSearchParams()
  if (filters?.requestType) params.append('requestType', filters.requestType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/hr/self-service/requests?${params.toString()}`)
  return response.data
}

/**
 * Get single request
 * GET /hr/self-service/requests/:id
 */
export const getRequest = async (requestId: string): Promise<SelfServiceRequest> => {
  const response = await api.get(`/hr/self-service/requests/${requestId}`)
  return response.data
}

/**
 * Submit leave request
 * POST /hr/self-service/requests/leave
 */
export const submitLeaveRequest = async (data: {
  leaveType: string
  startDate: string
  endDate: string
  isHalfDay?: boolean
  halfDayPeriod?: 'morning' | 'afternoon'
  reason?: string
  coveringEmployeeId?: string
  attachments?: File[]
}): Promise<LeaveRequest> => {
  const formData = new FormData()
  formData.append('leaveType', data.leaveType)
  formData.append('startDate', data.startDate)
  formData.append('endDate', data.endDate)
  if (data.isHalfDay !== undefined) formData.append('isHalfDay', data.isHalfDay.toString())
  if (data.halfDayPeriod) formData.append('halfDayPeriod', data.halfDayPeriod)
  if (data.reason) formData.append('reason', data.reason)
  if (data.coveringEmployeeId) formData.append('coveringEmployeeId', data.coveringEmployeeId)
  if (data.attachments) {
    data.attachments.forEach((file) => formData.append('attachments', file))
  }

  const response = await api.post('/hr/self-service/requests/leave', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Submit document request
 * POST /hr/self-service/requests/document
 */
export const submitDocumentRequest = async (data: {
  documentType: DocumentType
  purpose: LetterPurpose
  addressedTo?: string
  additionalInfo?: string
  language?: 'ar' | 'en' | 'both'
  copies?: number
  urgentDelivery?: boolean
}): Promise<DocumentRequest> => {
  const response = await api.post('/hr/self-service/requests/document', data)
  return response.data
}

/**
 * Submit profile update request
 * POST /hr/self-service/requests/profile-update
 */
export const submitProfileUpdateRequest = async (data: {
  fieldName: string
  currentValue: string
  newValue: string
  supportingDocument?: File
  reason?: string
}): Promise<ProfileUpdateRequest> => {
  const formData = new FormData()
  formData.append('fieldName', data.fieldName)
  formData.append('currentValue', data.currentValue)
  formData.append('newValue', data.newValue)
  if (data.reason) formData.append('reason', data.reason)
  if (data.supportingDocument) formData.append('supportingDocument', data.supportingDocument)

  const response = await api.post('/hr/self-service/requests/profile-update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Submit expense request
 * POST /hr/self-service/requests/expense
 */
export const submitExpenseRequest = async (data: {
  expenseCategory: string
  amount: number
  currency?: string
  expenseDate: string
  vendor?: string
  description: string
  receipts: File[]
  projectCode?: string
  costCenter?: string
}): Promise<ExpenseRequest> => {
  const formData = new FormData()
  formData.append('expenseCategory', data.expenseCategory)
  formData.append('amount', data.amount.toString())
  if (data.currency) formData.append('currency', data.currency)
  formData.append('expenseDate', data.expenseDate)
  if (data.vendor) formData.append('vendor', data.vendor)
  formData.append('description', data.description)
  if (data.projectCode) formData.append('projectCode', data.projectCode)
  if (data.costCenter) formData.append('costCenter', data.costCenter)
  data.receipts.forEach((file) => formData.append('receipts', file))

  const response = await api.post('/hr/self-service/requests/expense', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Submit training request
 * POST /hr/self-service/requests/training
 */
export const submitTrainingRequest = async (data: {
  trainingName: string
  provider: string
  startDate: string
  endDate: string
  duration: number
  durationUnit: 'hours' | 'days' | 'weeks'
  cost: number
  currency?: string
  location: 'internal' | 'external' | 'online'
  justification: string
  relevantCompetencies?: string[]
}): Promise<TrainingRequest> => {
  const response = await api.post('/hr/self-service/requests/training', data)
  return response.data
}

/**
 * Submit loan request
 * POST /hr/self-service/requests/loan
 */
export const submitLoanRequest = async (data: {
  loanType: 'salary_advance' | 'emergency_loan' | 'housing_loan' | 'education_loan' | 'personal_loan'
  amount: number
  repaymentPeriod: number
  reason: string
}): Promise<LoanRequest> => {
  const response = await api.post('/hr/self-service/requests/loan', data)
  return response.data
}

/**
 * Submit generic request
 * POST /hr/self-service/requests
 */
export const submitGenericRequest = async (data: {
  requestType: SelfServiceRequestType
  subject: string
  description: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  attachments?: File[]
}): Promise<SelfServiceRequest> => {
  const formData = new FormData()
  formData.append('requestType', data.requestType)
  formData.append('subject', data.subject)
  formData.append('description', data.description)
  if (data.priority) formData.append('priority', data.priority)
  if (data.attachments) {
    data.attachments.forEach((file) => formData.append('attachments', file))
  }

  const response = await api.post('/hr/self-service/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Cancel request
 * POST /hr/self-service/requests/:id/cancel
 */
export const cancelRequest = async (
  requestId: string,
  reason?: string
): Promise<SelfServiceRequest> => {
  const response = await api.post(`/hr/self-service/requests/${requestId}/cancel`, { reason })
  return response.data
}

/**
 * Get my payslips
 * GET /hr/self-service/payslips
 */
export const getMyPayslips = async (
  year?: number
): Promise<MyPayslip[]> => {
  const params = year ? `?year=${year}` : ''
  const response = await api.get(`/hr/self-service/payslips${params}`)
  return response.data
}

/**
 * Get single payslip
 * GET /hr/self-service/payslips/:id
 */
export const getPayslip = async (payslipId: string): Promise<MyPayslip> => {
  const response = await api.get(`/hr/self-service/payslips/${payslipId}`)
  return response.data
}

/**
 * Download payslip
 * GET /hr/self-service/payslips/:id/download
 */
export const downloadPayslip = async (payslipId: string): Promise<Blob> => {
  const response = await api.get(`/hr/self-service/payslips/${payslipId}/download`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get my documents
 * GET /hr/self-service/documents
 */
export const getMyDocuments = async (
  documentType?: DocumentType
): Promise<MyDocument[]> => {
  const params = documentType ? `?documentType=${documentType}` : ''
  const response = await api.get(`/hr/self-service/documents${params}`)
  return response.data
}

/**
 * Download document
 * GET /hr/self-service/documents/:id/download
 */
export const downloadDocument = async (documentId: string): Promise<Blob> => {
  const response = await api.get(`/hr/self-service/documents/${documentId}/download`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get my benefits
 * GET /hr/self-service/benefits
 */
export const getMyBenefits = async (): Promise<MyBenefit[]> => {
  const response = await api.get('/hr/self-service/benefits')
  return response.data
}

/**
 * Get benefit details
 * GET /hr/self-service/benefits/:id
 */
export const getBenefitDetails = async (benefitId: string): Promise<MyBenefit> => {
  const response = await api.get(`/hr/self-service/benefits/${benefitId}`)
  return response.data
}

/**
 * Get my leave balance
 * GET /hr/self-service/leave-balance
 */
export const getMyLeaveBalance = async (): Promise<{
  annual: { entitled: number; used: number; remaining: number; pending: number; carryOver: number }
  sick: { entitled: number; used: number; remaining: number }
  emergency: { entitled: number; used: number; remaining: number }
  other: Record<string, { entitled: number; used: number; remaining: number }>
  summary: {
    totalEntitled: number
    totalUsed: number
    totalRemaining: number
    totalPending: number
  }
}> => {
  const response = await api.get('/hr/self-service/leave-balance')
  return response.data
}

/**
 * Get company policies
 * GET /hr/self-service/policies
 */
export const getCompanyPolicies = async (
  category?: string
): Promise<PolicyDocument[]> => {
  const params = category ? `?category=${category}` : ''
  const response = await api.get(`/hr/self-service/policies${params}`)
  return response.data
}

/**
 * Get policy document
 * GET /hr/self-service/policies/:id
 */
export const getPolicyDocument = async (policyId: string): Promise<PolicyDocument> => {
  const response = await api.get(`/hr/self-service/policies/${policyId}`)
  return response.data
}

/**
 * Acknowledge policy
 * POST /hr/self-service/policies/:id/acknowledge
 */
export const acknowledgePolicy = async (policyId: string): Promise<{ acknowledgedAt: string }> => {
  const response = await api.post(`/hr/self-service/policies/${policyId}/acknowledge`)
  return response.data
}

/**
 * Get pending acknowledgments
 * GET /hr/self-service/policies/pending-acknowledgments
 */
export const getPendingAcknowledgments = async (): Promise<PolicyDocument[]> => {
  const response = await api.get('/hr/self-service/policies/pending-acknowledgments')
  return response.data
}

/**
 * Get my profile
 * GET /hr/self-service/profile
 */
export const getMyProfile = async (): Promise<{
  personal: {
    fullName: string
    fullNameAr?: string
    dateOfBirth: string
    gender: string
    nationality: string
    maritalStatus: string
    nationalId: string
    passportNumber?: string
    passportExpiry?: string
  }
  contact: {
    email: string
    phone: string
    emergencyContact: {
      name: string
      relationship: string
      phone: string
    }
    address: {
      street: string
      city: string
      postalCode?: string
      country: string
    }
  }
  employment: {
    employeeNumber: string
    joiningDate: string
    departmentName: string
    departmentNameAr?: string
    positionTitle: string
    positionTitleAr?: string
    grade?: string
    reportsTo?: string
    reportsToName?: string
    contractType: string
    workLocation?: string
  }
  bank: {
    bankName: string
    accountNumber: string
    iban: string
  }
}> => {
  const response = await api.get('/hr/self-service/profile')
  return response.data
}

/**
 * Update my contact info
 * PATCH /hr/self-service/profile/contact
 */
export const updateMyContactInfo = async (data: {
  phone?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  address?: {
    street: string
    city: string
    postalCode?: string
    country: string
  }
}): Promise<{ message: string }> => {
  const response = await api.patch('/hr/self-service/profile/contact', data)
  return response.data
}

/**
 * Update my photo
 * POST /hr/self-service/profile/photo
 */
export const updateMyPhoto = async (photo: File): Promise<{ photoUrl: string }> => {
  const formData = new FormData()
  formData.append('photo', photo)

  const response = await api.post('/hr/self-service/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Get my attendance summary
 * GET /hr/self-service/attendance
 */
export const getMyAttendanceSummary = async (
  month?: string
): Promise<{
  period: string
  summary: {
    totalWorkingDays: number
    daysPresent: number
    daysAbsent: number
    daysLate: number
    daysEarlyLeave: number
    totalHoursWorked: number
    expectedHours: number
    overtimeHours: number
  }
  dailyRecords: Array<{
    date: string
    dayName: string
    checkIn?: string
    checkOut?: string
    hoursWorked?: number
    status: 'present' | 'absent' | 'late' | 'early_leave' | 'leave' | 'holiday' | 'weekend'
    notes?: string
  }>
}> => {
  const params = month ? `?month=${month}` : ''
  const response = await api.get(`/hr/self-service/attendance${params}`)
  return response.data
}

/**
 * Get my team (for managers)
 * GET /hr/self-service/my-team
 */
export const getMyTeam = async (): Promise<
  Array<{
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    employeePhoto?: string
    positionTitle: string
    positionTitleAr?: string
    email: string
    phone?: string
    status: 'active' | 'on_leave' | 'remote'
    currentAbsence?: {
      type: string
      endDate: string
    }
  }>
> => {
  const response = await api.get('/hr/self-service/my-team')
  return response.data
}

/**
 * Get pending approvals (for managers)
 * GET /hr/self-service/pending-approvals
 */
export const getPendingApprovals = async (): Promise<
  Array<{
    _id: string
    requestId: string
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    requestType: SelfServiceRequestType
    subject: string
    subjectAr?: string
    requestDate: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    daysWaiting: number
  }>
> => {
  const response = await api.get('/hr/self-service/pending-approvals')
  return response.data
}

/**
 * Approve request (for managers)
 * POST /hr/self-service/requests/:id/approve
 */
export const approveRequest = async (
  requestId: string,
  comments?: string
): Promise<SelfServiceRequest> => {
  const response = await api.post(`/hr/self-service/requests/${requestId}/approve`, { comments })
  return response.data
}

/**
 * Reject request (for managers)
 * POST /hr/self-service/requests/:id/reject
 */
export const rejectRequest = async (
  requestId: string,
  reason: string
): Promise<SelfServiceRequest> => {
  const response = await api.post(`/hr/self-service/requests/${requestId}/reject`, { reason })
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const selfServiceService = {
  // Dashboard
  getMyDashboard,

  // Requests
  getMyRequests,
  getRequest,
  submitLeaveRequest,
  submitDocumentRequest,
  submitProfileUpdateRequest,
  submitExpenseRequest,
  submitTrainingRequest,
  submitLoanRequest,
  submitGenericRequest,
  cancelRequest,

  // Payslips
  getMyPayslips,
  getPayslip,
  downloadPayslip,

  // Documents
  getMyDocuments,
  downloadDocument,

  // Benefits
  getMyBenefits,
  getBenefitDetails,

  // Leave
  getMyLeaveBalance,

  // Policies
  getCompanyPolicies,
  getPolicyDocument,
  acknowledgePolicy,
  getPendingAcknowledgments,

  // Profile
  getMyProfile,
  updateMyContactInfo,
  updateMyPhoto,

  // Attendance
  getMyAttendanceSummary,

  // Manager Functions
  getMyTeam,
  getPendingApprovals,
  approveRequest,
  rejectRequest,

  // Constants
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  LETTER_PURPOSE_LABELS,
}

export default selfServiceService
