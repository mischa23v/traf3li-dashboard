/**
 * WPS (Wage Protection System) Service
 * Handles WPS file generation and submission per Saudi Ministry of Labor requirements
 * API Base: /api/hr/payroll/wps
 *
 * WPS is mandatory for all private sector establishments in Saudi Arabia
 * SIF (Salary Information File) format is used for bank submission
 */

import api from './api'

// ==================== TYPES ====================

export type WPSSubmissionStatus = 'pending' | 'validating' | 'validated' | 'submitted' | 'accepted' | 'rejected' | 'partially_accepted'
export type WPSFileFormat = 'sif' | 'csv' | 'xlsx'
export type WPSBankCode = 'RJHI' | 'SABB' | 'BSFR' | 'NCBK' | 'BNKJ' | 'BJAZ' | 'INMA' | 'BILD' | 'SAMBA' | 'AAAL' | 'ARNB' | 'GULF' | 'OTHER'

// ==================== INTERFACES ====================

export interface WPSEmployeeRecord {
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId: string
  iqamaNumber?: string  // For non-Saudis
  passportNumber?: string

  // Bank details
  bankCode: WPSBankCode
  bankName: string
  bankNameAr?: string
  iban: string
  accountNumber?: string

  // Payment details
  basicSalary: number
  housingAllowance: number
  otherAllowances: number
  deductions: number
  netSalary: number

  // Status
  included: boolean
  excludedReason?: string
  status: 'pending' | 'validated' | 'submitted' | 'accepted' | 'rejected'
  rejectionReason?: string
  rejectionReasonAr?: string

  // Validation
  validationErrors?: Array<{
    code: string
    message: string
    messageAr: string
    field: string
  }>
}

export interface WPSSubmission {
  _id: string
  submissionId: string
  referenceNumber: string

  // Period
  payrollRunId?: string
  month: number
  year: number
  periodStart: string
  periodEnd: string

  // Employer details
  employer: {
    molId: string          // Ministry of Labor ID
    establishmentName: string
    establishmentNameAr?: string
    commercialRegistration: string
    unifiedNumber?: string
  }

  // Summary
  summary: {
    totalEmployees: number
    includedEmployees: number
    excludedEmployees: number
    totalAmount: number
    totalBasicSalary: number
    totalAllowances: number
    totalDeductions: number
  }

  // Bank breakdown
  bankBreakdown: Array<{
    bankCode: WPSBankCode
    bankName: string
    employeeCount: number
    totalAmount: number
  }>

  // Status
  status: WPSSubmissionStatus

  // Validation
  validation: {
    validated: boolean
    validatedAt?: string
    validatedBy?: string
    errorCount: number
    warningCount: number
    errors?: Array<{
      employeeId?: string
      code: string
      message: string
      messageAr: string
    }>
    warnings?: Array<{
      employeeId?: string
      code: string
      message: string
      messageAr: string
    }>
  }

  // File details
  file?: {
    fileName: string
    fileUrl: string
    fileFormat: WPSFileFormat
    recordCount: number
    generatedAt: string
    generatedBy: string
  }

  // Submission details
  submission?: {
    submittedAt: string
    submittedBy: string
    channel: 'online' | 'bank' | 'manual'
    bankReferenceNumber?: string
    acknowledgementNumber?: string
  }

  // Response from bank/MOL
  response?: {
    receivedAt: string
    status: 'accepted' | 'rejected' | 'partially_accepted'
    acceptedCount: number
    rejectedCount: number
    rejectedEmployees?: Array<{
      employeeId: string
      employeeName: string
      reason: string
      reasonAr: string
    }>
    confirmationNumber?: string
    message?: string
    messageAr?: string
  }

  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface WPSFilters {
  month?: number
  year?: number
  status?: WPSSubmissionStatus
  payrollRunId?: string
  page?: number
  limit?: number
}

export interface GenerateWPSData {
  payrollRunId: string
  fileFormat?: WPSFileFormat
  includeAllowanceBreakdown?: boolean
  excludeEmployeeIds?: string[]
}

export interface WPSValidationResult {
  valid: boolean
  canSubmit: boolean
  summary: {
    totalRecords: number
    validRecords: number
    invalidRecords: number
    warningRecords: number
  }
  errors: Array<{
    employeeId: string
    employeeName: string
    errorCode: string
    errorMessage: string
    errorMessageAr: string
    field?: string
    severity: 'error' | 'warning'
  }>
  bankValidation: {
    allIbansValid: boolean
    invalidIbans: number
    missingBankDetails: number
  }
  molValidation: {
    allIdsValid: boolean
    invalidIds: number
    missingIds: number
  }
}

export interface WPSStats {
  currentMonth: {
    month: number
    year: number
    status: WPSSubmissionStatus
    totalAmount: number
    employeeCount: number
    submittedAt?: string
  }
  yearToDate: {
    totalSubmissions: number
    totalAmount: number
    acceptedAmount: number
    rejectedAmount: number
    averageMonthly: number
  }
  byMonth: Array<{
    month: number
    year: number
    status: WPSSubmissionStatus
    totalAmount: number
    employeeCount: number
  }>
  byBank: Array<{
    bankCode: WPSBankCode
    bankName: string
    employeeCount: number
    totalAmount: number
    percentageOfTotal: number
  }>
  compliance: {
    onTimeSubmissions: number
    lateSubmissions: number
    complianceRate: number
  }
}

// ==================== LABELS ====================

export const WPS_STATUS_LABELS: Record<WPSSubmissionStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'gray' },
  validating: { ar: 'قيد التحقق', en: 'Validating', color: 'blue' },
  validated: { ar: 'تم التحقق', en: 'Validated', color: 'cyan' },
  submitted: { ar: 'مقدم', en: 'Submitted', color: 'amber' },
  accepted: { ar: 'مقبول', en: 'Accepted', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  partially_accepted: { ar: 'مقبول جزئياً', en: 'Partially Accepted', color: 'orange' },
}

export const WPS_BANK_LABELS: Record<WPSBankCode, { ar: string; en: string }> = {
  RJHI: { ar: 'مصرف الراجحي', en: 'Al Rajhi Bank' },
  SABB: { ar: 'البنك السعودي البريطاني', en: 'SABB' },
  BSFR: { ar: 'البنك السعودي الفرنسي', en: 'Banque Saudi Fransi' },
  NCBK: { ar: 'البنك الأهلي السعودي', en: 'SNB (formerly NCB)' },
  BNKJ: { ar: 'بنك الجزيرة', en: 'Bank AlJazira' },
  BJAZ: { ar: 'بنك الجزيرة', en: 'Bank AlJazira' },
  INMA: { ar: 'مصرف الإنماء', en: 'Alinma Bank' },
  BILD: { ar: 'بنك البلاد', en: 'Bank Albilad' },
  SAMBA: { ar: 'سامبا المالية', en: 'Samba Financial Group' },
  AAAL: { ar: 'البنك العربي', en: 'Arab National Bank' },
  ARNB: { ar: 'البنك العربي الوطني', en: 'Arab National Bank' },
  GULF: { ar: 'بنك الخليج الدولي', en: 'Gulf International Bank' },
  OTHER: { ar: 'بنك آخر', en: 'Other Bank' },
}

// ==================== API FUNCTIONS ====================

/**
 * Get WPS submissions list
 * GET /hr/payroll/wps/submissions
 */
export const getWPSSubmissions = async (
  filters?: WPSFilters
): Promise<{
  data: WPSSubmission[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}> => {
  const params = new URLSearchParams()
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.status) params.append('status', filters.status)
  if (filters?.payrollRunId) params.append('payrollRunId', filters.payrollRunId)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/wps/submissions?${params.toString()}`)
  return response.data
}

/**
 * Get single WPS submission
 * GET /hr/payroll/wps/submissions/:id
 */
export const getWPSSubmission = async (submissionId: string): Promise<WPSSubmission> => {
  const response = await api.get(`/hr/payroll/wps/submissions/${submissionId}`)
  return response.data
}

/**
 * Get WPS submission employees
 * GET /hr/payroll/wps/submissions/:id/employees
 */
export const getWPSSubmissionEmployees = async (
  submissionId: string,
  filters?: {
    status?: string
    bankCode?: WPSBankCode
    page?: number
    limit?: number
  }
): Promise<{
  data: WPSEmployeeRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.bankCode) params.append('bankCode', filters.bankCode)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/wps/submissions/${submissionId}/employees?${params.toString()}`)
  return response.data
}

/**
 * Generate WPS file from payroll run
 * POST /hr/payroll/wps/generate
 */
export const generateWPSFile = async (data: GenerateWPSData): Promise<WPSSubmission> => {
  const response = await api.post('/hr/payroll/wps/generate', data)
  return response.data
}

/**
 * Validate WPS data before submission
 * POST /hr/payroll/wps/validate
 */
export const validateWPSData = async (
  submissionId: string
): Promise<WPSValidationResult> => {
  const response = await api.post(`/hr/payroll/wps/submissions/${submissionId}/validate`)
  return response.data
}

/**
 * Submit WPS to bank
 * POST /hr/payroll/wps/submissions/:id/submit
 */
export const submitWPS = async (
  submissionId: string,
  channel: 'online' | 'bank' | 'manual' = 'online'
): Promise<WPSSubmission> => {
  const response = await api.post(`/hr/payroll/wps/submissions/${submissionId}/submit`, { channel })
  return response.data
}

/**
 * Download WPS file
 * GET /hr/payroll/wps/submissions/:id/download
 */
export const downloadWPSFile = async (
  submissionId: string,
  format: WPSFileFormat = 'sif'
): Promise<Blob> => {
  const response = await api.get(`/hr/payroll/wps/submissions/${submissionId}/download`, {
    params: { format },
    responseType: 'blob',
  })
  return response.data
}

/**
 * Update WPS submission response (after bank confirmation)
 * PATCH /hr/payroll/wps/submissions/:id/response
 */
export const updateWPSResponse = async (
  submissionId: string,
  response: {
    status: 'accepted' | 'rejected' | 'partially_accepted'
    confirmationNumber?: string
    acceptedCount?: number
    rejectedCount?: number
    rejectedEmployees?: Array<{
      employeeId: string
      reason: string
    }>
    message?: string
  }
): Promise<WPSSubmission> => {
  const apiResponse = await api.patch(`/hr/payroll/wps/submissions/${submissionId}/response`, response)
  return apiResponse.data
}

/**
 * Get WPS statistics
 * GET /hr/payroll/wps/stats
 */
export const getWPSStats = async (year?: number): Promise<WPSStats> => {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())

  const response = await api.get(`/hr/payroll/wps/stats?${params.toString()}`)
  return response.data
}

/**
 * Exclude employee from WPS submission
 * POST /hr/payroll/wps/submissions/:id/exclude-employee
 */
export const excludeEmployeeFromWPS = async (
  submissionId: string,
  employeeId: string,
  reason: string
): Promise<WPSSubmission> => {
  const response = await api.post(`/hr/payroll/wps/submissions/${submissionId}/exclude-employee`, {
    employeeId,
    reason,
  })
  return response.data
}

/**
 * Include employee in WPS submission
 * POST /hr/payroll/wps/submissions/:id/include-employee
 */
export const includeEmployeeInWPS = async (
  submissionId: string,
  employeeId: string
): Promise<WPSSubmission> => {
  const response = await api.post(`/hr/payroll/wps/submissions/${submissionId}/include-employee`, {
    employeeId,
  })
  return response.data
}

/**
 * Get WPS submission history for a payroll run
 * GET /hr/payroll/wps/history/:payrollRunId
 */
export const getWPSHistory = async (payrollRunId: string): Promise<WPSSubmission[]> => {
  const response = await api.get(`/hr/payroll/wps/history/${payrollRunId}`)
  return response.data
}

/**
 * Cancel WPS submission
 * POST /hr/payroll/wps/submissions/:id/cancel
 */
export const cancelWPSSubmission = async (
  submissionId: string,
  reason: string
): Promise<WPSSubmission> => {
  const response = await api.post(`/hr/payroll/wps/submissions/${submissionId}/cancel`, { reason })
  return response.data
}

/**
 * Regenerate WPS file (after corrections)
 * POST /hr/payroll/wps/submissions/:id/regenerate
 */
export const regenerateWPSFile = async (submissionId: string): Promise<WPSSubmission> => {
  const response = await api.post(`/hr/payroll/wps/submissions/${submissionId}/regenerate`)
  return response.data
}

/**
 * Get bank-specific WPS requirements
 * GET /hr/payroll/wps/bank-requirements/:bankCode
 */
export const getBankWPSRequirements = async (
  bankCode: WPSBankCode
): Promise<{
  bankCode: WPSBankCode
  bankName: string
  bankNameAr: string
  sifVersion: string
  requiredFields: string[]
  fileNamingConvention: string
  submissionDeadline: string
  supportedFormats: WPSFileFormat[]
  notes?: string
  notesAr?: string
}> => {
  const response = await api.get(`/hr/payroll/wps/bank-requirements/${bankCode}`)
  return response.data
}

// Default export
export default {
  getWPSSubmissions,
  getWPSSubmission,
  getWPSSubmissionEmployees,
  generateWPSFile,
  validateWPSData,
  submitWPS,
  downloadWPSFile,
  updateWPSResponse,
  getWPSStats,
  excludeEmployeeFromWPS,
  includeEmployeeInWPS,
  getWPSHistory,
  cancelWPSSubmission,
  regenerateWPSFile,
  getBankWPSRequirements,
  WPS_STATUS_LABELS,
  WPS_BANK_LABELS,
}
