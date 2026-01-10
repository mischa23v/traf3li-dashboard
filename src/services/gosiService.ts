/**
 * GOSI (General Organization for Social Insurance) Service
 * Handles GOSI contribution management per Saudi Labor Law
 * API Base: /api/hr/payroll/gosi
 *
 * GOSI Contribution Rates (as of 2024):
 * - Saudi employees: 9.75% employee + 11.75% employer = 21.5% total
 *   - Pension: 9% employee + 9% employer
 *   - SANED (unemployment): 0.75% employee + 0.75% employer
 *   - Occupational Hazards: 2% employer only
 * - Non-Saudi employees: 2% employer only (Occupational Hazards)
 */

import api from './api'

// ==================== TYPES ====================

export type GOSIEmployeeType = 'saudi' | 'non_saudi'
export type GOSIContributionStatus = 'pending' | 'calculated' | 'submitted' | 'confirmed' | 'rejected'
export type GOSIReportStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'correction_required'

// ==================== INTERFACES ====================

export interface GOSIContributionRates {
  saudiEmployee: {
    pension: number          // 9%
    saned: number            // 0.75%
    total: number            // 9.75%
  }
  saudiEmployer: {
    pension: number          // 9%
    saned: number            // 0.75%
    occupationalHazards: number // 2%
    total: number            // 11.75%
  }
  nonSaudiEmployer: {
    occupationalHazards: number // 2%
    total: number            // 2%
  }
  gosiSalaryCap: number      // Maximum salary for GOSI calculation (45,000 SAR as of 2024)
}

export interface GOSIEmployeeContribution {
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId: string
  gosiNumber?: string

  employeeType: GOSIEmployeeType
  isSaudi: boolean

  // Salary details
  basicSalary: number
  housingAllowance: number
  gosiEligibleSalary: number
  cappedSalary: number       // Capped at gosiSalaryCap

  // Contributions
  employeeContribution: number
  employerContribution: number
  totalContribution: number

  // Breakdown
  breakdown: {
    pension: {
      employee: number
      employer: number
    }
    saned: {
      employee: number
      employer: number
    }
    occupationalHazards: {
      employer: number
    }
  }

  status: GOSIContributionStatus
  month: number
  year: number
}

export interface GOSISummary {
  period: {
    month: number
    year: number
    periodName: string
    periodNameAr: string
  }

  // Employee counts
  employeeCounts: {
    totalEmployees: number
    saudiEmployees: number
    nonSaudiEmployees: number
    excludedEmployees: number
  }

  // Total contributions
  totalContributions: {
    employeeContribution: number
    employerContribution: number
    totalContribution: number
  }

  // Saudi breakdown
  saudiContributions: {
    employeeCount: number
    totalGosiSalary: number
    employeeContribution: number
    employerContribution: number
    pensionTotal: number
    sanedTotal: number
    occupationalHazardsTotal: number
  }

  // Non-Saudi breakdown
  nonSaudiContributions: {
    employeeCount: number
    totalGosiSalary: number
    employerContribution: number
    occupationalHazardsTotal: number
  }

  // Comparison with previous month
  comparison?: {
    previousMonth: number
    previousYear: number
    totalChange: number
    percentageChange: number
    employeeCountChange: number
  }

  status: GOSIContributionStatus
  submissionDeadline: string

  createdAt: string
  updatedAt: string
}

export interface GOSIReport {
  _id: string
  reportId: string

  period: {
    month: number
    year: number
  }

  summary: GOSISummary
  employees: GOSIEmployeeContribution[]

  status: GOSIReportStatus

  // Submission details
  submission?: {
    submittedAt: string
    submittedBy: string
    referenceNumber?: string
    confirmationNumber?: string
    responseDate?: string
    responseMessage?: string
  }

  // Correction details (if rejected)
  correction?: {
    requiredBy: string
    reason: string
    correctedAt?: string
    correctedBy?: string
  }

  // File details
  file?: {
    fileName: string
    fileUrl: string
    generatedAt: string
    generatedBy: string
  }

  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface GOSIFilters {
  month?: number
  year?: number
  status?: GOSIContributionStatus | GOSIReportStatus
  employeeType?: GOSIEmployeeType
  department?: string
  page?: number
  limit?: number
}

export interface GenerateGOSIReportData {
  month: number
  year: number
  includeNewJoiners?: boolean
  includeTerminations?: boolean
  departments?: string[]
}

export interface GOSIValidationResult {
  valid: boolean
  errors: Array<{
    employeeId: string
    employeeName: string
    errorCode: string
    errorMessage: string
    errorMessageAr: string
    field?: string
  }>
  warnings: Array<{
    employeeId: string
    employeeName: string
    warningCode: string
    warningMessage: string
    warningMessageAr: string
  }>
  summary: {
    totalEmployees: number
    validEmployees: number
    invalidEmployees: number
    warningCount: number
  }
}

export interface GOSIStats {
  currentMonth: {
    month: number
    year: number
    totalContribution: number
    employeeContribution: number
    employerContribution: number
    status: GOSIContributionStatus
  }
  yearToDate: {
    totalContribution: number
    employeeContribution: number
    employerContribution: number
    averageMonthly: number
  }
  byMonth: Array<{
    month: number
    year: number
    totalContribution: number
    employeeCount: number
    status: GOSIContributionStatus
  }>
  trends: {
    contributionGrowth: number
    employeeGrowth: number
  }
}

// ==================== LABELS ====================

export const GOSI_STATUS_LABELS: Record<GOSIContributionStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'gray' },
  calculated: { ar: 'محسوب', en: 'Calculated', color: 'blue' },
  submitted: { ar: 'مقدم', en: 'Submitted', color: 'amber' },
  confirmed: { ar: 'مؤكد', en: 'Confirmed', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
}

export const GOSI_REPORT_STATUS_LABELS: Record<GOSIReportStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  submitted: { ar: 'مقدم', en: 'Submitted', color: 'amber' },
  accepted: { ar: 'مقبول', en: 'Accepted', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  correction_required: { ar: 'يتطلب تصحيح', en: 'Correction Required', color: 'orange' },
}

// Current GOSI rates (2024)
export const GOSI_RATES: GOSIContributionRates = {
  saudiEmployee: {
    pension: 0.09,
    saned: 0.0075,
    total: 0.0975,
  },
  saudiEmployer: {
    pension: 0.09,
    saned: 0.0075,
    occupationalHazards: 0.02,
    total: 0.1175,
  },
  nonSaudiEmployer: {
    occupationalHazards: 0.02,
    total: 0.02,
  },
  gosiSalaryCap: 45000,
}

// ==================== API FUNCTIONS ====================

/**
 * Get GOSI summary for a specific period
 * GET /hr/payroll/gosi/summary
 */
export const getGOSISummary = async (month: number, year: number): Promise<GOSISummary> => {
  const response = await api.get('/hr/payroll/gosi/summary', {
    params: { month, year },
  })
  return response.data
}

/**
 * Get GOSI employee contributions list
 * GET /hr/payroll/gosi/contributions
 */
export const getGOSIContributions = async (
  filters?: GOSIFilters
): Promise<{
  data: GOSIEmployeeContribution[]
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
  if (filters?.employeeType) params.append('employeeType', filters.employeeType)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/gosi/contributions?${params.toString()}`)
  return response.data
}

/**
 * Get single employee GOSI contribution
 * GET /hr/payroll/gosi/contributions/:employeeId
 */
export const getEmployeeGOSIContribution = async (
  employeeId: string,
  month: number,
  year: number
): Promise<GOSIEmployeeContribution> => {
  const response = await api.get(`/hr/payroll/gosi/contributions/${employeeId}`, {
    params: { month, year },
  })
  return response.data
}

/**
 * Calculate GOSI contributions for a period
 * POST /hr/payroll/gosi/calculate
 */
export const calculateGOSI = async (
  month: number,
  year: number,
  options?: {
    payrollRunId?: string
    recalculate?: boolean
  }
): Promise<GOSISummary> => {
  const response = await api.post('/hr/payroll/gosi/calculate', {
    month,
    year,
    ...options,
  })
  return response.data
}

/**
 * Generate GOSI report for submission
 * POST /hr/payroll/gosi/generate-report
 */
export const generateGOSIReport = async (data: GenerateGOSIReportData): Promise<GOSIReport> => {
  const response = await api.post('/hr/payroll/gosi/generate-report', data)
  return response.data
}

/**
 * Get GOSI reports list
 * GET /hr/payroll/gosi/reports
 */
export const getGOSIReports = async (
  filters?: GOSIFilters
): Promise<{
  data: GOSIReport[]
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
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/gosi/reports?${params.toString()}`)
  return response.data
}

/**
 * Get single GOSI report
 * GET /hr/payroll/gosi/reports/:id
 */
export const getGOSIReport = async (reportId: string): Promise<GOSIReport> => {
  const response = await api.get(`/hr/payroll/gosi/reports/${reportId}`)
  return response.data
}

/**
 * Validate GOSI data before submission
 * POST /hr/payroll/gosi/validate
 */
export const validateGOSIData = async (
  month: number,
  year: number
): Promise<GOSIValidationResult> => {
  const response = await api.post('/hr/payroll/gosi/validate', { month, year })
  return response.data
}

/**
 * Submit GOSI report
 * POST /hr/payroll/gosi/reports/:id/submit
 */
export const submitGOSIReport = async (reportId: string): Promise<GOSIReport> => {
  const response = await api.post(`/hr/payroll/gosi/reports/${reportId}/submit`)
  return response.data
}

/**
 * Download GOSI report file
 * GET /hr/payroll/gosi/reports/:id/download
 */
export const downloadGOSIReport = async (
  reportId: string,
  format: 'xlsx' | 'csv' | 'pdf' = 'xlsx'
): Promise<Blob> => {
  const response = await api.get(`/hr/payroll/gosi/reports/${reportId}/download`, {
    params: { format },
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get GOSI statistics
 * GET /hr/payroll/gosi/stats
 */
export const getGOSIStats = async (year?: number): Promise<GOSIStats> => {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())

  const response = await api.get(`/hr/payroll/gosi/stats?${params.toString()}`)
  return response.data
}

/**
 * Get employee GOSI history
 * GET /hr/payroll/gosi/employee/:employeeId/history
 */
export const getEmployeeGOSIHistory = async (
  employeeId: string,
  year?: number
): Promise<GOSIEmployeeContribution[]> => {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())

  const response = await api.get(`/hr/payroll/gosi/employee/${employeeId}/history?${params.toString()}`)
  return response.data
}

/**
 * Update employee GOSI number
 * PATCH /hr/payroll/gosi/employee/:employeeId/gosi-number
 */
export const updateEmployeeGOSINumber = async (
  employeeId: string,
  gosiNumber: string
): Promise<{ success: boolean; employeeId: string; gosiNumber: string }> => {
  const response = await api.patch(`/hr/payroll/gosi/employee/${employeeId}/gosi-number`, {
    gosiNumber,
  })
  return response.data
}

/**
 * Get current GOSI rates
 * GET /hr/payroll/gosi/rates
 */
export const getCurrentGOSIRates = async (): Promise<GOSIContributionRates> => {
  const response = await api.get('/hr/payroll/gosi/rates')
  return response.data
}

/**
 * Calculate GOSI for a single employee (preview)
 * POST /hr/payroll/gosi/calculate-employee
 */
export const calculateEmployeeGOSI = async (
  employeeId: string,
  basicSalary: number,
  housingAllowance: number,
  isSaudi: boolean
): Promise<GOSIEmployeeContribution> => {
  const response = await api.post('/hr/payroll/gosi/calculate-employee', {
    employeeId,
    basicSalary,
    housingAllowance,
    isSaudi,
  })
  return response.data
}

// Default export
export default {
  getGOSISummary,
  getGOSIContributions,
  getEmployeeGOSIContribution,
  calculateGOSI,
  generateGOSIReport,
  getGOSIReports,
  getGOSIReport,
  validateGOSIData,
  submitGOSIReport,
  downloadGOSIReport,
  getGOSIStats,
  getEmployeeGOSIHistory,
  updateEmployeeGOSINumber,
  getCurrentGOSIRates,
  calculateEmployeeGOSI,
  GOSI_RATES,
  GOSI_STATUS_LABELS,
  GOSI_REPORT_STATUS_LABELS,
}
