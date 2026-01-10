/**
 * EOSB (End of Service Benefits) Service
 * Handles EOSB calculation and processing per Saudi Labor Law Articles 84-85
 * API Base: /api/hr/payroll/eosb
 *
 * Saudi Labor Law EOSB Calculation Rules:
 *
 * For TERMINATION BY EMPLOYER:
 * - First 5 years: Half month salary per year
 * - After 5 years: Full month salary per year
 *
 * For RESIGNATION BY EMPLOYEE:
 * - Less than 2 years: No EOSB
 * - 2-5 years: 1/3 of entitlement
 * - 5-10 years: 2/3 of entitlement
 * - More than 10 years: Full entitlement
 *
 * EOSB Salary Base:
 * - Basic salary + housing allowance + transportation allowance
 * - Or last drawn salary (whichever interpretation applies)
 */

import api from './api'

// ==================== TYPES ====================

export type TerminationType = 'employer_termination' | 'resignation' | 'retirement' | 'contract_expiry' | 'death' | 'disability' | 'mutual_agreement'
export type EOSBStatus = 'draft' | 'calculating' | 'calculated' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'cancelled'
export type SalaryComponent = 'basic_only' | 'basic_plus_housing' | 'basic_plus_all_allowances' | 'full_package'

// ==================== INTERFACES ====================

export interface EOSBCalculationRules {
  // Saudi Labor Law Article 84-85 rules
  employerTermination: {
    firstFiveYearsRate: number      // 0.5 (half month per year)
    afterFiveYearsRate: number      // 1.0 (full month per year)
  }
  resignation: {
    lessThanTwoYears: number        // 0 (no entitlement)
    twoToFiveYears: number          // 0.333 (1/3 of entitlement)
    fiveToTenYears: number          // 0.667 (2/3 of entitlement)
    moreThanTenYears: number        // 1.0 (full entitlement)
  }
  retirement: {
    rate: number                    // 1.0 (full entitlement)
    minimumAge: number              // 60 for men, 55 for women
  }
  contractExpiry: {
    rate: number                    // 1.0 (full entitlement)
  }
  death: {
    rate: number                    // 1.0 (full entitlement, paid to heirs)
  }
  disability: {
    rate: number                    // 1.0 (full entitlement)
  }
  mutualAgreement: {
    minimumRate: number             // Negotiable but minimum 0.5
  }
}

export interface EOSBSalaryDetails {
  basicSalary: number
  housingAllowance: number
  transportationAllowance: number
  otherAllowances: number
  totalEligibleSalary: number
  salaryComponent: SalaryComponent
}

export interface EOSBServicePeriod {
  startDate: string
  endDate: string
  totalYears: number
  totalMonths: number
  totalDays: number
  // Breakdown
  yearsFirst5: number
  yearsAfter5: number
  partialMonths: number
  // Unpaid leave deduction
  unpaidLeaveDays: number
  deductedDays: number
  adjustedServicePeriod: {
    years: number
    months: number
    days: number
  }
}

export interface EOSBCalculationBreakdown {
  // Service period breakdown
  servicePeriod: EOSBServicePeriod

  // Salary details
  salary: EOSBSalaryDetails

  // Calculation
  calculation: {
    // First 5 years
    first5YearsMonths: number
    first5YearsRate: number
    first5YearsAmount: number

    // After 5 years
    after5YearsMonths: number
    after5YearsRate: number
    after5YearsAmount: number

    // Partial months
    partialMonthsAmount: number

    // Subtotal before adjustments
    subtotal: number

    // Resignation adjustment (if applicable)
    resignationMultiplier?: number
    resignationAdjustmentAmount?: number

    // Other adjustments
    unpaidLeaveDeduction?: number
    loanDeduction?: number
    advanceDeduction?: number
    otherDeductions?: number

    // Final amounts
    grossEOSB: number
    totalDeductions: number
    netEOSB: number
  }

  // Legal reference
  legalBasis: {
    article: string
    clause: string
    description: string
    descriptionAr: string
  }
}

export interface EOSBRecord {
  _id: string
  eosbId: string
  referenceNumber: string

  // Employee details
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId: string
  department?: string
  jobTitle?: string
  joiningDate: string

  // Termination details
  terminationType: TerminationType
  terminationDate: string
  lastWorkingDate: string
  terminationReason?: string
  terminationReasonAr?: string

  // Calculation
  calculationDate: string
  calculatedBy: string
  salaryComponent: SalaryComponent
  breakdown: EOSBCalculationBreakdown

  // Amounts
  grossAmount: number
  deductions: {
    loans: number
    advances: number
    violations: number
    other: number
    totalDeductions: number
  }
  netAmount: number

  // Status & workflow
  status: EOSBStatus
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string

  // Payment
  paymentMethod?: 'bank_transfer' | 'check' | 'cash'
  paymentReference?: string
  paidAt?: string
  paidBy?: string

  // Documents
  documents?: Array<{
    documentType: 'resignation_letter' | 'termination_letter' | 'calculation_sheet' | 'clearance_form' | 'other'
    fileName: string
    fileUrl: string
    uploadedAt: string
    uploadedBy: string
  }>

  // Notes
  notes?: string
  notesAr?: string

  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

export interface CalculateEOSBData {
  employeeId: string
  terminationType: TerminationType
  terminationDate: string
  lastWorkingDate: string
  terminationReason?: string
  terminationReasonAr?: string
  salaryComponent?: SalaryComponent
  // Override salary if needed (for what-if scenarios)
  overrideSalary?: EOSBSalaryDetails
  // Additional deductions
  loanDeduction?: number
  advanceDeduction?: number
  otherDeductions?: number
}

export interface EOSBFilters {
  employeeId?: string
  terminationType?: TerminationType
  status?: EOSBStatus
  department?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
}

export interface EOSBStats {
  currentYear: {
    year: number
    totalCases: number
    totalAmount: number
    averageAmount: number
    averageServiceYears: number
    byTerminationType: Record<TerminationType, { count: number; amount: number }>
    byStatus: Record<EOSBStatus, { count: number; amount: number }>
  }
  comparison: {
    previousYear: number
    casesChange: number
    amountChange: number
    amountChangePercentage: number
  }
  byMonth: Array<{
    month: number
    year: number
    cases: number
    totalAmount: number
  }>
  byDepartment: Array<{
    department: string
    cases: number
    totalAmount: number
    averageServiceYears: number
  }>
  liability: {
    totalActiveEmployees: number
    estimatedTotalLiability: number
    averageLiabilityPerEmployee: number
    byServiceYears: Array<{
      range: string
      employeeCount: number
      estimatedLiability: number
    }>
  }
}

export interface EOSBSimulation {
  employeeId: string
  employeeName: string
  currentServiceYears: number
  currentSalary: EOSBSalaryDetails
  scenarios: Array<{
    terminationType: TerminationType
    terminationDate: string
    serviceYears: number
    grossEOSB: number
    netEOSB: number
    breakdown: EOSBCalculationBreakdown
  }>
}

// ==================== LABELS ====================

export const TERMINATION_TYPE_LABELS: Record<TerminationType, { ar: string; en: string; color: string }> = {
  employer_termination: { ar: 'إنهاء من صاحب العمل', en: 'Employer Termination', color: 'red' },
  resignation: { ar: 'استقالة', en: 'Resignation', color: 'amber' },
  retirement: { ar: 'تقاعد', en: 'Retirement', color: 'blue' },
  contract_expiry: { ar: 'انتهاء العقد', en: 'Contract Expiry', color: 'purple' },
  death: { ar: 'وفاة', en: 'Death', color: 'gray' },
  disability: { ar: 'إعاقة', en: 'Disability', color: 'orange' },
  mutual_agreement: { ar: 'اتفاق متبادل', en: 'Mutual Agreement', color: 'teal' },
}

export const EOSB_STATUS_LABELS: Record<EOSBStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  calculating: { ar: 'قيد الحساب', en: 'Calculating', color: 'blue' },
  calculated: { ar: 'محسوب', en: 'Calculated', color: 'cyan' },
  pending_approval: { ar: 'بانتظار الموافقة', en: 'Pending Approval', color: 'amber' },
  approved: { ar: 'معتمد', en: 'Approved', color: 'emerald' },
  processing: { ar: 'قيد المعالجة', en: 'Processing', color: 'purple' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'green' },
  cancelled: { ar: 'ملغى', en: 'Cancelled', color: 'red' },
}

export const SALARY_COMPONENT_LABELS: Record<SalaryComponent, { ar: string; en: string }> = {
  basic_only: { ar: 'الراتب الأساسي فقط', en: 'Basic Salary Only' },
  basic_plus_housing: { ar: 'الأساسي + بدل السكن', en: 'Basic + Housing' },
  basic_plus_all_allowances: { ar: 'الأساسي + جميع البدلات', en: 'Basic + All Allowances' },
  full_package: { ar: 'الراتب الإجمالي', en: 'Full Package' },
}

// Saudi Labor Law EOSB Rates
export const EOSB_CALCULATION_RULES: EOSBCalculationRules = {
  employerTermination: {
    firstFiveYearsRate: 0.5,
    afterFiveYearsRate: 1.0,
  },
  resignation: {
    lessThanTwoYears: 0,
    twoToFiveYears: 0.333,
    fiveToTenYears: 0.667,
    moreThanTenYears: 1.0,
  },
  retirement: {
    rate: 1.0,
    minimumAge: 60,
  },
  contractExpiry: {
    rate: 1.0,
  },
  death: {
    rate: 1.0,
  },
  disability: {
    rate: 1.0,
  },
  mutualAgreement: {
    minimumRate: 0.5,
  },
}

// ==================== API FUNCTIONS ====================

/**
 * Calculate EOSB for an employee
 * POST /hr/payroll/eosb/calculate/:employeeId
 */
export const calculateEOSB = async (data: CalculateEOSBData): Promise<EOSBRecord> => {
  const response = await api.post(`/hr/payroll/eosb/calculate/${data.employeeId}`, data)
  return response.data
}

/**
 * Get EOSB preview/simulation without creating record
 * POST /hr/payroll/eosb/preview
 */
export const previewEOSB = async (data: CalculateEOSBData): Promise<EOSBCalculationBreakdown> => {
  const response = await api.post('/hr/payroll/eosb/preview', data)
  return response.data
}

/**
 * Get EOSB records list
 * GET /hr/payroll/eosb
 */
export const getEOSBRecords = async (
  filters?: EOSBFilters
): Promise<{
  data: EOSBRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.terminationType) params.append('terminationType', filters.terminationType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString())
  if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString())
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/eosb?${params.toString()}`)
  return response.data
}

/**
 * Get single EOSB record
 * GET /hr/payroll/eosb/:id
 */
export const getEOSBRecord = async (eosbId: string): Promise<EOSBRecord> => {
  const response = await api.get(`/hr/payroll/eosb/${eosbId}`)
  return response.data
}

/**
 * Update EOSB record
 * PATCH /hr/payroll/eosb/:id
 */
export const updateEOSBRecord = async (
  eosbId: string,
  data: Partial<CalculateEOSBData>
): Promise<EOSBRecord> => {
  const response = await api.patch(`/hr/payroll/eosb/${eosbId}`, data)
  return response.data
}

/**
 * Recalculate EOSB
 * POST /hr/payroll/eosb/:id/recalculate
 */
export const recalculateEOSB = async (eosbId: string): Promise<EOSBRecord> => {
  const response = await api.post(`/hr/payroll/eosb/${eosbId}/recalculate`)
  return response.data
}

/**
 * Submit EOSB for approval
 * POST /hr/payroll/eosb/:id/submit
 */
export const submitEOSBForApproval = async (eosbId: string): Promise<EOSBRecord> => {
  const response = await api.post(`/hr/payroll/eosb/${eosbId}/submit`)
  return response.data
}

/**
 * Approve EOSB
 * POST /hr/payroll/eosb/:id/approve
 */
export const approveEOSB = async (
  eosbId: string,
  comments?: string
): Promise<EOSBRecord> => {
  const response = await api.post(`/hr/payroll/eosb/${eosbId}/approve`, { comments })
  return response.data
}

/**
 * Reject EOSB
 * POST /hr/payroll/eosb/:id/reject
 */
export const rejectEOSB = async (
  eosbId: string,
  reason: string
): Promise<EOSBRecord> => {
  const response = await api.post(`/hr/payroll/eosb/${eosbId}/reject`, { reason })
  return response.data
}

/**
 * Process EOSB payment
 * POST /hr/payroll/eosb/:id/process
 */
export const processEOSBPayment = async (
  eosbId: string,
  paymentDetails: {
    paymentMethod: 'bank_transfer' | 'check' | 'cash'
    paymentReference?: string
  }
): Promise<EOSBRecord> => {
  const response = await api.post(`/hr/payroll/eosb/${eosbId}/process`, paymentDetails)
  return response.data
}

/**
 * Cancel EOSB
 * POST /hr/payroll/eosb/:id/cancel
 */
export const cancelEOSB = async (
  eosbId: string,
  reason: string
): Promise<EOSBRecord> => {
  const response = await api.post(`/hr/payroll/eosb/${eosbId}/cancel`, { reason })
  return response.data
}

/**
 * Get EOSB statistics
 * GET /hr/payroll/eosb/stats
 */
export const getEOSBStats = async (year?: number): Promise<EOSBStats> => {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())

  const response = await api.get(`/hr/payroll/eosb/stats?${params.toString()}`)
  return response.data
}

/**
 * Get employee EOSB simulation (what-if scenarios)
 * GET /hr/payroll/eosb/simulate/:employeeId
 */
export const simulateEOSB = async (
  employeeId: string,
  futureDate?: string
): Promise<EOSBSimulation> => {
  const params = new URLSearchParams()
  if (futureDate) params.append('futureDate', futureDate)

  const response = await api.get(`/hr/payroll/eosb/simulate/${employeeId}?${params.toString()}`)
  return response.data
}

/**
 * Get company EOSB liability report
 * GET /hr/payroll/eosb/liability-report
 */
export const getEOSBLiabilityReport = async (
  asOfDate?: string
): Promise<{
  asOfDate: string
  summary: {
    totalEmployees: number
    totalLiability: number
    averageLiability: number
    averageServiceYears: number
  }
  byDepartment: Array<{
    department: string
    employeeCount: number
    liability: number
    averageServiceYears: number
  }>
  byServiceYearRange: Array<{
    range: string
    minYears: number
    maxYears: number
    employeeCount: number
    liability: number
  }>
  highRiskEmployees: Array<{
    employeeId: string
    employeeName: string
    department: string
    serviceYears: number
    estimatedEOSB: number
  }>
}> => {
  const params = new URLSearchParams()
  if (asOfDate) params.append('asOfDate', asOfDate)

  const response = await api.get(`/hr/payroll/eosb/liability-report?${params.toString()}`)
  return response.data
}

/**
 * Upload EOSB document
 * POST /hr/payroll/eosb/:id/documents
 */
export const uploadEOSBDocument = async (
  eosbId: string,
  document: {
    documentType: 'resignation_letter' | 'termination_letter' | 'calculation_sheet' | 'clearance_form' | 'other'
    file: File
  }
): Promise<EOSBRecord> => {
  const formData = new FormData()
  formData.append('documentType', document.documentType)
  formData.append('file', document.file)

  const response = await api.post(`/hr/payroll/eosb/${eosbId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Download EOSB calculation sheet
 * GET /hr/payroll/eosb/:id/download
 */
export const downloadEOSBCalculationSheet = async (
  eosbId: string,
  format: 'pdf' | 'xlsx' = 'pdf'
): Promise<Blob> => {
  const response = await api.get(`/hr/payroll/eosb/${eosbId}/download`, {
    params: { format },
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get EOSB calculation rules (configurable company rules)
 * GET /hr/payroll/eosb/rules
 */
export const getEOSBRules = async (): Promise<EOSBCalculationRules> => {
  const response = await api.get('/hr/payroll/eosb/rules')
  return response.data
}

/**
 * Get pending EOSB approvals
 * GET /hr/payroll/eosb/pending-approvals
 */
export const getPendingEOSBApprovals = async (): Promise<EOSBRecord[]> => {
  const response = await api.get('/hr/payroll/eosb/pending-approvals')
  return response.data
}

/**
 * Export EOSB report
 * GET /hr/payroll/eosb/export
 */
export const exportEOSBReport = async (
  filters?: EOSBFilters,
  format: 'xlsx' | 'csv' | 'pdf' = 'xlsx'
): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.terminationType) params.append('terminationType', filters.terminationType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  params.append('format', format)

  const response = await api.get(`/hr/payroll/eosb/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

// Default export
export default {
  calculateEOSB,
  previewEOSB,
  getEOSBRecords,
  getEOSBRecord,
  updateEOSBRecord,
  recalculateEOSB,
  submitEOSBForApproval,
  approveEOSB,
  rejectEOSB,
  processEOSBPayment,
  cancelEOSB,
  getEOSBStats,
  simulateEOSB,
  getEOSBLiabilityReport,
  uploadEOSBDocument,
  downloadEOSBCalculationSheet,
  getEOSBRules,
  getPendingEOSBApprovals,
  exportEOSBReport,
  TERMINATION_TYPE_LABELS,
  EOSB_STATUS_LABELS,
  SALARY_COMPONENT_LABELS,
  EOSB_CALCULATION_RULES,
}
