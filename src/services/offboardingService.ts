import api from './api'

// ==================== TYPES & ENUMS ====================

// Exit Type
export type ExitType = 'resignation' | 'termination' | 'contract_end' | 'retirement' |
  'death' | 'mutual_agreement' | 'medical' | 'other'

// Offboarding Status
export type OffboardingStatus = 'initiated' | 'in_progress' | 'clearance_pending' | 'completed' | 'cancelled'

// Clearance Status
export type ClearanceStatus = 'pending' | 'in_progress' | 'cleared' | 'blocked'

// Payment Status
export type PaymentStatus = 'pending' | 'processed' | 'paid' | 'failed'

// Rehire Eligibility
export type RehireEligibility = 'eligible' | 'not_eligible' | 'conditional' | 'blacklisted'

// National ID Type
export type NationalIdType = 'saudi_id' | 'iqama' | 'passport'

// Employment Type
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary'

// Contract Type
export type ContractType = 'indefinite' | 'fixed_term'

// ==================== LABELS ====================

export const EXIT_TYPE_LABELS: Record<ExitType, { ar: string; en: string; color: string }> = {
  resignation: { ar: 'استقالة', en: 'Resignation', color: 'blue' },
  termination: { ar: 'إنهاء خدمة', en: 'Termination', color: 'red' },
  contract_end: { ar: 'انتهاء العقد', en: 'Contract End', color: 'amber' },
  retirement: { ar: 'تقاعد', en: 'Retirement', color: 'emerald' },
  death: { ar: 'وفاة', en: 'Death', color: 'slate' },
  mutual_agreement: { ar: 'اتفاق متبادل', en: 'Mutual Agreement', color: 'purple' },
  medical: { ar: 'أسباب طبية', en: 'Medical', color: 'orange' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray' },
}

export const OFFBOARDING_STATUS_LABELS: Record<OffboardingStatus, { ar: string; en: string; color: string }> = {
  initiated: { ar: 'تم البدء', en: 'Initiated', color: 'slate' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'blue' },
  clearance_pending: { ar: 'في انتظار الإخلاء', en: 'Clearance Pending', color: 'amber' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'emerald' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'red' },
}

export const CLEARANCE_STATUS_LABELS: Record<ClearanceStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'blue' },
  cleared: { ar: 'تم الإخلاء', en: 'Cleared', color: 'emerald' },
  blocked: { ar: 'محظور', en: 'Blocked', color: 'red' },
}

export const REHIRE_ELIGIBILITY_LABELS: Record<RehireEligibility, { ar: string; en: string; color: string }> = {
  eligible: { ar: 'مؤهل', en: 'Eligible', color: 'emerald' },
  not_eligible: { ar: 'غير مؤهل', en: 'Not Eligible', color: 'red' },
  conditional: { ar: 'مشروط', en: 'Conditional', color: 'amber' },
  blacklisted: { ar: 'محظور', en: 'Blacklisted', color: 'slate' },
}

// ==================== INTERFACES ====================

// Service Duration
export interface ServiceDuration {
  years: number
  months: number
  days: number
  totalMonths: number
  totalDays: number
}

// Notice Period
export interface NoticePeriod {
  requiredDays: number
  noticeDaysServed: number
  buyoutApplied: boolean
  buyoutAmount?: number
}

// Clearance Item
export interface ClearanceItem {
  itemId: string
  itemType: 'id_badge' | 'laptop' | 'mobile' | 'tablet' | 'keys' | 'access_card' |
    'vehicle' | 'parking_card' | 'uniform' | 'equipment' | 'documents' | 'credit_card' | 'other'
  itemDescription: string
  itemDescriptionAr?: string
  serialNumber?: string
  assetId?: string
  condition?: 'good' | 'fair' | 'damaged' | 'lost'
  returned: boolean
  returnedDate?: string
  returnedTo?: string
  damageNotes?: string
  damageCharge?: number
  notReturnedReason?: string
  replacementCost?: number
}

// Clearance Task
export interface ClearanceTask {
  taskId: string
  task: string
  taskName: string
  completed: boolean
  completedDate?: string
  completedBy?: string
  notes?: string
  outstandingAmount?: number
}

// Clearance Section
export interface ClearanceSection {
  required: boolean
  tasks: ClearanceTask[]
  cleared: boolean
  clearedBy?: string
  clearanceDate?: string
}

// EOSB Calculation (End of Service Benefit - Articles 84-87)
export interface EOSBCalculation {
  applicable: boolean
  calculation: {
    years1to5: {
      years: number
      months: number
      rate: number
      amount: number
    }
    yearsOver5: {
      years: number
      months: number
      rate: number
      amount: number
    }
    totalEOSB: number
  }
  resignationAdjustment?: {
    exitType: 'resignation'
    serviceYears: number
    entitlementPercentage: number
    fullEOSB: number
    adjustedEOSB: number
  }
  finalEOSB: number
  calculationFormula: string
}

// Final Settlement
export interface FinalSettlement {
  calculated: boolean
  calculationDate?: string
  calculatedBy?: string
  calculationBase: {
    lastBasicSalary: number
    lastGrossSalary: number
    dailyWage: number
    serviceYears: number
    serviceMonths: number
    serviceDays: number
    totalServiceMonths: number
  }
  earnings: {
    outstandingSalary: {
      applicable: boolean
      workingDaysInLastMonth: number
      paidDaysInLastMonth: number
      unpaidDays: number
      amount: number
    }
    unusedAnnualLeave: {
      applicable: boolean
      totalEntitlement: number
      daysUsed: number
      daysRemaining: number
      carriedForwardDays?: number
      totalUnusedDays: number
      dailyRate: number
      amount: number
    }
    eosb: EOSBCalculation
    unpaidOvertime?: {
      applicable: boolean
      overtimeHours: number
      hourlyRate: number
      overtimeRate: number
      amount: number
    }
    unpaidBonuses?: {
      applicable: boolean
      bonusType: string
      amount: number
    }
    totalEarnings: number
  }
  deductions: {
    outstandingLoans: {
      applicable: boolean
      loans: Array<{
        loanId: string
        loanType: string
        originalAmount: number
        remainingBalance: number
        deductFromSettlement: boolean
      }>
      totalLoansDeduction: number
    }
    outstandingAdvances: {
      applicable: boolean
      advances: Array<{
        advanceId: string
        advanceType: string
        originalAmount: number
        remainingBalance: number
        deductFromSettlement: boolean
      }>
      totalAdvancesDeduction: number
    }
    noticeShortfall?: {
      applicable: boolean
      requiredNoticeDays: number
      servedNoticeDays: number
      shortfallDays: number
      dailyWage: number
      deductionAmount: number
    }
    totalDeductions: number
  }
  netSettlement: {
    grossAmount: number
    totalDeductions: number
    netPayable: number
    netPayableInWords?: string
    netPayableInWordsAr?: string
  }
  payment: {
    paymentMethod: 'bank_transfer' | 'check' | 'cash'
    bankDetails?: {
      bankName: string
      iban: string
      accountNumber: string
    }
    paymentStatus: PaymentStatus
    paymentDate?: string
    paymentReference?: string
  }
  finalApproved: boolean
  finalApprovalDate?: string
}

// Exit Interview Response
export interface ExitInterviewResponse {
  primaryReason: string
  primaryReasonCategory: 'compensation' | 'career_growth' | 'management' |
    'work_environment' | 'work_life_balance' | 'relocation' |
    'personal' | 'health' | 'better_opportunity' | 'other'
  detailedReason?: string
  ratings?: {
    overallSatisfaction: number
    jobRole: number
    compensation: number
    benefits: number
    workLifeBalance: number
    careerDevelopment: number
    training: number
    management: number
    teamwork: number
    workEnvironment: number
  }
  whatYouLikedMost?: string
  whatCouldBeImproved?: string
  wouldRecommendCompany: boolean
  wouldConsiderReturning: boolean
  additionalComments?: string
}

// Exit Interview
export interface ExitInterview {
  required: boolean
  scheduled: boolean
  scheduledDate?: string
  conducted: boolean
  conductedDate?: string
  interviewedBy: string
  interviewerRole?: string
  interviewMethod: 'in_person' | 'video' | 'phone' | 'online_form'
  responses?: ExitInterviewResponse
  interviewerNotes?: string
  keyInsights?: string[]
  completed: boolean
  completionDate?: string
}

// Clearance
export interface Clearance {
  required: boolean
  itemsToReturn: ClearanceItem[]
  allItemsReturned: boolean
  itClearance: ClearanceSection & {
    dataBackup?: {
      required: boolean
      completed: boolean
      backupLocation?: string
      backupDate?: string
    }
    filesTransferred?: {
      required: boolean
      completed: boolean
      transferredTo?: string
      transferDate?: string
    }
    emailDeactivationDate?: string
  }
  financeClearance: ClearanceSection & {
    outstandingLoans: number
    outstandingAdvances: number
    outstandingExpenses: number
    totalOutstanding: number
  }
  hrClearance: ClearanceSection
  departmentClearance: ClearanceSection
  managerClearance: ClearanceSection
  allClearancesObtained: boolean
  finalClearanceDate?: string
  clearanceCertificate?: {
    issued: boolean
    issueDate?: string
    certificateUrl?: string
  }
}

// Final Documents
export interface FinalDocuments {
  experienceCertificate: {
    required: boolean
    requested: boolean
    requestDate?: string
    prepared: boolean
    preparedDate?: string
    preparedBy?: string
    issued: boolean
    issueDate?: string
    certificateNumber?: string
    arabicVersionUrl?: string
    englishVersionUrl?: string
    delivered: boolean
    deliveryDate?: string
    deliveryMethod?: 'hand' | 'email' | 'mail' | 'courier'
  }
  referenceLetter?: {
    requested: boolean
    approved: boolean
    approvedBy?: string
    prepared: boolean
    letterUrl?: string
    issued: boolean
    issueDate?: string
    delivered: boolean
  }
  salaryCertificate?: {
    requested: boolean
    prepared: boolean
    certificateUrl?: string
    issued: boolean
    issueDate?: string
  }
  noc?: {
    requested: boolean
    approved: boolean
    approvedBy?: string
    issued: boolean
    issueDate?: string
    certificateUrl?: string
  }
  gosiClearance?: {
    required: boolean
    finalMonthSubmitted: boolean
    submissionDate?: string
    clearanceCertificateIssued: boolean
    certificateUrl?: string
  }
}

// Timeline Event
export interface TimelineEvent {
  eventId: string
  eventType: 'resignation_submitted' | 'termination_issued' | 'notice_started' |
    'exit_interview' | 'last_working_day' | 'clearance_started' |
    'clearance_completed' | 'settlement_calculated' | 'settlement_paid' |
    'documents_issued' | 'offboarding_completed'
  eventDate: string
  description: string
  descriptionAr?: string
  performedBy?: string
  status: 'scheduled' | 'completed' | 'pending' | 'overdue'
  notes?: string
}

// Main Offboarding Record
export interface OffboardingRecord {
  _id: string
  offboardingId: string
  offboardingNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId: string
  department?: string
  jobTitle: string
  jobTitleAr?: string

  // Manager
  managerId?: string
  managerName?: string

  // Exit Type
  exitType: ExitType

  // Dates
  dates: {
    noticeDate?: string
    lastWorkingDay: string
    exitEffectiveDate: string
  }

  // Notice Period (Article 75)
  noticePeriod: NoticePeriod

  // Status
  status: OffboardingStatus

  // Service Duration
  serviceDuration?: ServiceDuration

  // Exit Interview
  exitInterview?: ExitInterview

  // Clearance
  clearance?: Clearance

  // Final Settlement
  finalSettlement?: FinalSettlement

  // Final Documents
  finalDocuments?: FinalDocuments

  // Rehire Eligibility
  rehireEligibility?: {
    eligible: boolean
    eligibilityCategory: RehireEligibility
    eligibilityReason?: string
    conditions?: string[]
    notes?: string
    evaluatedBy?: string
    evaluationDate?: string
  }

  // Timeline
  timeline?: TimelineEvent[]

  // Notes
  notes?: {
    hrNotes?: string
    managerNotes?: string
    financeNotes?: string
    internalNotes?: string
  }

  // Completion
  completion: {
    exitInterviewCompleted: boolean
    clearanceCompleted: boolean
    knowledgeTransferCompleted: boolean
    finalSettlementCompleted: boolean
    documentsIssued: boolean
    allTasksCompleted: boolean
    offboardingCompleted: boolean
    completionDate?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Offboarding Data
export interface CreateOffboardingData {
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string
  nationalId: string
  department?: string
  jobTitle: string
  jobTitleAr?: string
  managerId?: string
  managerName?: string
  exitType: ExitType
  noticeDate?: string
  lastWorkingDay: string
  exitEffectiveDate?: string
  noticePeriodDays?: number
  notes?: {
    hrNotes?: string
    managerNotes?: string
  }
}

// Update Offboarding Data
export interface UpdateOffboardingData {
  employeeName?: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string
  jobTitleAr?: string
  managerId?: string
  managerName?: string
  exitType?: ExitType
  dates?: {
    noticeDate?: string
    lastWorkingDay?: string
    exitEffectiveDate?: string
  }
  noticePeriod?: Partial<NoticePeriod>
  status?: OffboardingStatus
  notes?: {
    hrNotes?: string
    managerNotes?: string
    financeNotes?: string
    internalNotes?: string
  }
}

// Filters
export interface OffboardingFilters {
  status?: OffboardingStatus
  exitType?: ExitType
  department?: string
  exitDateFrom?: string
  exitDateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Response
export interface OffboardingResponse {
  data: OffboardingRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface OffboardingStats {
  totalOffboardings: number
  byStatus: Array<{ status: OffboardingStatus; count: number }>
  byExitType: Array<{ exitType: ExitType; count: number }>
  pendingClearances: number
  pendingSettlements: number
  thisMonth: {
    initiated: number
    completed: number
    cancelled: number
  }
  averageProcessingDays: number
}

// ==================== API FUNCTIONS ====================

// Get all offboarding records
export const getOffboardings = async (filters?: OffboardingFilters): Promise<OffboardingResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.exitType) params.append('exitType', filters.exitType)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.exitDateFrom) params.append('exitDateFrom', filters.exitDateFrom)
  if (filters?.exitDateTo) params.append('exitDateTo', filters.exitDateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/offboarding?${params.toString()}`)
  return response.data
}

// Get single offboarding record
export const getOffboarding = async (offboardingId: string): Promise<OffboardingRecord> => {
  const response = await api.get(`/hr/offboarding/${offboardingId}`)
  return response.data
}

// Create offboarding record
export const createOffboarding = async (data: CreateOffboardingData): Promise<OffboardingRecord> => {
  const response = await api.post('/hr/offboarding', data)
  return response.data
}

// Update offboarding record
export const updateOffboarding = async (offboardingId: string, data: UpdateOffboardingData): Promise<OffboardingRecord> => {
  const response = await api.patch(`/hr/offboarding/${offboardingId}`, data)
  return response.data
}

// Delete offboarding record
export const deleteOffboarding = async (offboardingId: string): Promise<void> => {
  await api.delete(`/hr/offboarding/${offboardingId}`)
}

// Get offboarding stats
export const getOffboardingStats = async (): Promise<OffboardingStats> => {
  const response = await api.get('/hr/offboarding/stats')
  return response.data
}

// Update offboarding status
export const updateOffboardingStatus = async (offboardingId: string, status: OffboardingStatus): Promise<OffboardingRecord> => {
  const response = await api.patch(`/hr/offboarding/${offboardingId}/status`, { status })
  return response.data
}

// Complete exit interview
export const completeExitInterview = async (offboardingId: string, data: Partial<ExitInterview>): Promise<OffboardingRecord> => {
  const response = await api.post(`/hr/offboarding/${offboardingId}/exit-interview`, data)
  return response.data
}

// Update clearance item
export const updateClearanceItem = async (offboardingId: string, itemId: string, data: Partial<ClearanceItem>): Promise<OffboardingRecord> => {
  const response = await api.patch(`/hr/offboarding/${offboardingId}/clearance/items/${itemId}`, data)
  return response.data
}

// Complete clearance section
export const completeClearanceSection = async (
  offboardingId: string,
  section: 'it' | 'finance' | 'hr' | 'department' | 'manager'
): Promise<OffboardingRecord> => {
  const response = await api.post(`/hr/offboarding/${offboardingId}/clearance/${section}/complete`)
  return response.data
}

// Calculate final settlement
export const calculateFinalSettlement = async (offboardingId: string): Promise<OffboardingRecord> => {
  const response = await api.post(`/hr/offboarding/${offboardingId}/calculate-settlement`)
  return response.data
}

// Approve final settlement
export const approveFinalSettlement = async (offboardingId: string): Promise<OffboardingRecord> => {
  const response = await api.post(`/hr/offboarding/${offboardingId}/approve-settlement`)
  return response.data
}

// Process settlement payment
export const processSettlementPayment = async (offboardingId: string, paymentData: {
  paymentMethod: 'bank_transfer' | 'check' | 'cash'
  paymentReference?: string
  bankDetails?: {
    bankName: string
    iban: string
    accountNumber: string
  }
}): Promise<OffboardingRecord> => {
  const response = await api.post(`/hr/offboarding/${offboardingId}/process-payment`, paymentData)
  return response.data
}

// Issue experience certificate
export const issueExperienceCertificate = async (offboardingId: string): Promise<OffboardingRecord> => {
  const response = await api.post(`/hr/offboarding/${offboardingId}/issue-experience-certificate`)
  return response.data
}

// Complete offboarding
export const completeOffboarding = async (offboardingId: string): Promise<OffboardingRecord> => {
  const response = await api.post(`/hr/offboarding/${offboardingId}/complete`)
  return response.data
}

// Bulk delete
export const bulkDeleteOffboardings = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/offboarding/bulk-delete', { ids })
  return response.data
}

// Get offboarding by employee
export const getOffboardingByEmployee = async (employeeId: string): Promise<OffboardingRecord | null> => {
  const response = await api.get(`/hr/offboarding/by-employee/${employeeId}`)
  return response.data
}

// Get pending clearances
export const getPendingClearances = async (): Promise<Array<{
  offboardingId: string
  employeeName: string
  section: string
  daysOverdue: number
}>> => {
  const response = await api.get('/hr/offboarding/pending-clearances')
  return response.data
}

// Get pending settlements
export const getPendingSettlements = async (): Promise<Array<{
  offboardingId: string
  employeeName: string
  amount: number
  dueDate: string
}>> => {
  const response = await api.get('/hr/offboarding/pending-settlements')
  return response.data
}

// Update rehire eligibility
export const updateRehireEligibility = async (offboardingId: string, data: {
  eligibilityCategory: RehireEligibility
  eligibilityReason?: string
  conditions?: string[]
  notes?: string
}): Promise<OffboardingRecord> => {
  const response = await api.patch(`/hr/offboarding/${offboardingId}/rehire-eligibility`, data)
  return response.data
}
