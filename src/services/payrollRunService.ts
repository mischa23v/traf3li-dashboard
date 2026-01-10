import api from './api'

// Types
export type PayrollRunStatus = 'draft' | 'calculating' | 'calculated' | 'approved' | 'processing_payment' | 'paid' | 'cancelled'
export type CalendarType = 'hijri' | 'gregorian'
export type EmployeeType = 'full_time' | 'part_time' | 'contract' | 'temporary'
export type EmploymentStatus = 'active' | 'on_leave' | 'suspended'
export type PaymentMethod = 'bank_transfer' | 'cash' | 'check'
export type EmployeePaymentStatus = 'pending' | 'calculating' | 'calculated' | 'approved' | 'paid' | 'failed' | 'on_hold'

export interface PayrollRunEmployee {
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId: string
  department?: string
  location?: string
  jobTitle?: string
  slipId?: string
  slipNumber?: string
  earnings: {
    basicSalary: number
    allowances: number
    overtime: number
    bonus: number
    commission: number
    otherEarnings: number
    grossPay: number
  }
  deductions: {
    gosi: number
    loans: number
    advances: number
    absences: number
    lateDeductions: number
    violations: number
    otherDeductions: number
    totalDeductions: number
  }
  netPay: number
  status: EmployeePaymentStatus
  isNewJoiner: boolean
  joiningDate?: string
  isSeparation: boolean
  separationDate?: string
  isProrated: boolean
  proratedDays?: number
  proratedFactor?: number
  onProbation: boolean
  hasErrors: boolean
  errors?: Array<{ errorCode: string; errorMessage: string; errorField?: string }>
  hasWarnings: boolean
  warnings?: Array<{ warningCode: string; warningMessage: string }>
  onHold: boolean
  onHoldReason?: string
  paymentMethod: PaymentMethod
  bankName?: string
  iban?: string
  paymentStatus?: 'pending' | 'processing' | 'paid' | 'failed'
  paymentReference?: string
  paidOn?: string
  wpsIncluded: boolean
  wpsStatus?: 'pending' | 'submitted' | 'accepted' | 'rejected'
  approvedBy?: string
  approvedOn?: string
}

export interface PayrollRunConfiguration {
  calendarType: CalendarType
  fiscalYear: number
  includedEmployeeTypes: EmployeeType[]
  includedDepartments?: string[]
  includedLocations?: string[]
  includedEmploymentStatuses: EmploymentStatus[]
  excludedEmployees?: Array<{
    employeeId: string
    employeeName: string
    exclusionReason: string
    excludedBy?: string
    excludedOn?: string
  }>
  processNewJoiners: boolean
  processSeparations: boolean
  processSuspensions: boolean
  prorateSalaries: boolean
  prorateMethod: 'calendar_days' | 'working_days'
  includeOvertime: boolean
  overtimeCalculationMethod: 'actual' | 'approved'
  overtimeApprovalRequired: boolean
  includeBonuses: boolean
  includeCommissions: boolean
  includeIncentives: boolean
  processLoans: boolean
  processAdvances: boolean
  processViolations: boolean
  attendanceBasedDeductions: boolean
  lateDeductions: boolean
  absenceDeductions: boolean
  calculateGOSI: boolean
  gosiRate: number
  roundingMethod: 'none' | 'nearest' | 'up' | 'down'
  roundingPrecision: number
}

export interface PayrollRun {
  _id: string
  runId: string
  runNumber: string
  runName: string
  runNameAr?: string
  payPeriod: {
    month: number
    year: number
    calendarType: CalendarType
    periodStart: string
    periodEnd: string
    paymentDate: string
    cutoffDate?: string
  }
  employees: {
    totalEmployees: number
    processedEmployees: number
    pendingEmployees: number
    failedEmployees: number
    onHoldEmployees: number
  }
  financialSummary: {
    totalBasicSalary: number
    totalAllowances: number
    totalGrossPay: number
    totalGOSI: number
    totalDeductions: number
    totalNetPay: number
    totalEmployerGOSI: number
  }
  status: PayrollRunStatus
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string

  // Advanced fields
  configuration?: PayrollRunConfiguration
  employeeList?: PayrollRunEmployee[]
  financialBreakdown?: {
    earnings: {
      totalBasicSalary: number
      allowancesBreakdown: {
        housingAllowance: number
        transportationAllowance: number
        foodAllowance: number
        mobileAllowance: number
        otherAllowances: number
        totalAllowances: number
      }
      variablePayBreakdown: {
        totalOvertime: number
        overtimeHours: number
        averageOvertimeRate: number
        totalBonus: number
        bonusRecipients: number
        totalCommission: number
        commissionRecipients: number
        totalIncentives: number
        totalVariablePay: number
      }
      adjustments: {
        arrears: number
        retroactivePay: number
        reimbursements: number
        otherAdditions: number
        totalAdjustments: number
      }
      grossPay: number
    }
    deductions: {
      statutory: {
        totalEmployeeGOSI: number
        totalEmployerGOSI: number
        totalGOSI: number
        gosiBreakdown: {
          saudiEmployees: number
          saudiEmployeeContribution: number
          saudiEmployerContribution: number
          nonSaudiEmployees: number
          nonSaudiEmployerContribution: number
        }
        totalIncomeTax: number
        totalZakat: number
        totalStatutory: number
      }
      loans: {
        totalLoanRepayments: number
        numberOfLoans: number
        employeesWithLoans: number
      }
      advances: {
        totalAdvanceRecoveries: number
        numberOfAdvances: number
        employeesWithAdvances: number
      }
      attendance: {
        totalAbsenceDeductions: number
        totalLateDeductions: number
        totalAttendanceDeductions: number
        employeesWithAbsenceDeductions: number
        employeesWithLateDeductions: number
        totalAbsentDays: number
        totalLateMinutes: number
      }
      violations: {
        totalViolationDeductions: number
        numberOfViolations: number
        employeesWithViolations: number
      }
      other: {
        totalInsurance: number
        totalUnionDues: number
        totalCharityDonations: number
        totalOtherDeductions: number
      }
      totalDeductions: number
    }
    netPay: number
    costToCompany: {
      totalSalaries: number
      totalEmployerGOSI: number
      totalBenefits: number
      otherCosts: number
      totalCost: number
      averageCostPerEmployee: number
    }
  }
  breakdowns?: {
    byDepartment?: Array<{
      departmentId: string
      departmentName: string
      employeeCount: number
      totalBasicSalary: number
      totalAllowances: number
      totalGrossPay: number
      totalDeductions: number
      totalNetPay: number
      averageSalary: number
      averageNetPay: number
      percentOfTotalPayroll: number
    }>
    byEmployeeType?: Array<{
      employeeType: EmployeeType
      employeeCount: number
      totalGrossPay: number
      totalNetPay: number
      averageGrossPay: number
      averageNetPay: number
    }>
    byPaymentMethod?: Array<{
      paymentMethod: PaymentMethod
      employeeCount: number
      totalAmount: number
      percentOfTotal: number
    }>
  }
  wps?: {
    required: boolean
    sifFile: {
      generated: boolean
      generatedDate?: string
      fileName?: string
      fileUrl?: string
      recordCount?: number
      totalAmount?: number
    }
    submission: {
      submitted: boolean
      submissionDate?: string
      submissionReference?: string
      status: 'pending' | 'accepted' | 'rejected' | 'partially_accepted'
      acceptedCount?: number
      rejectedCount?: number
    }
  }
  paymentProcessing?: {
    bankTransfer: {
      employeeCount: number
      totalAmount: number
      processed: boolean
      processedDate?: string
      successCount?: number
      failedCount?: number
    }
    cash: {
      employeeCount: number
      totalAmount: number
      disbursed: boolean
      disbursedDate?: string
    }
    check: {
      employeeCount: number
      totalAmount: number
      checksIssued: boolean
      issueDate?: string
    }
    paymentStatus: 'not_started' | 'processing' | 'completed' | 'partially_completed'
    paidEmployees: number
    pendingPayments: number
    failedPayments: number
    totalPaid: number
    totalPending: number
    totalFailed: number
    paymentCompletionPercentage: number
  }
  approvalWorkflow?: {
    required: boolean
    steps: Array<{
      stepNumber: number
      stepName: string
      stepNameAr?: string
      approverRole: string
      approverId?: string
      approverName?: string
      status: 'pending' | 'approved' | 'rejected' | 'skipped'
      actionDate?: string
      comments?: string
    }>
    currentStep: number
    totalSteps: number
    finalStatus: 'pending' | 'approved' | 'rejected'
    finalApprover?: string
    finalApprovalDate?: string
  }
  validation?: {
    validated: boolean
    validationDate?: string
    errors: Array<{
      errorId: string
      errorCode: string
      errorType: 'critical' | 'error' | 'warning' | 'info'
      errorMessage: string
      employeeId?: string
      employeeName?: string
      field?: string
      resolved?: boolean
    }>
    criticalErrorCount: number
    errorCount: number
    warningCount: number
    hasBlockingErrors: boolean
    canProceed: boolean
  }
  comparison?: {
    previousRunId?: string
    previousRunName?: string
    employeeCountChange: number
    grossPayChange: number
    grossPayChangePercentage: number
    netPayChange: number
    netPayChangePercentage: number
  }
  notes?: {
    internalNotes?: string
    approverNotes?: string
    employeeMessage?: string
    employeeMessageAr?: string
  }
  statistics?: {
    totalProcessingTime: number
    averageTimePerEmployee: number
    employeesByNationality: {
      saudi: number
      nonSaudi: number
    }
    highestSalary: number
    lowestSalary: number
    averageSalary: number
    medianSalary: number
  }
}

export interface CreatePayrollRunData {
  runName: string
  runNameAr?: string
  payPeriod: {
    month: number
    year: number
    calendarType: CalendarType
    periodStart: string
    periodEnd: string
    paymentDate: string
    cutoffDate?: string
  }
  configuration?: Partial<PayrollRunConfiguration>
  notes?: {
    internalNotes?: string
    employeeMessage?: string
    employeeMessageAr?: string
  }
}

export interface UpdatePayrollRunData extends Partial<CreatePayrollRunData> {
  status?: PayrollRunStatus
}

export interface PayrollRunsResponse {
  data: PayrollRun[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PayrollRunFilters {
  month?: number
  year?: number
  status?: PayrollRunStatus
  page?: number
  limit?: number
}

// API Functions
export const getPayrollRuns = async (filters?: PayrollRunFilters): Promise<PayrollRunsResponse> => {
  const params = new URLSearchParams()
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.status) params.append('status', filters.status)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/runs?${params.toString()}`)
  return response.data
}

export const getPayrollRun = async (runId: string): Promise<PayrollRun> => {
  const response = await api.get(`/hr/payroll/runs/${runId}`)
  return response.data
}

export const createPayrollRun = async (data: CreatePayrollRunData): Promise<PayrollRun> => {
  const response = await api.post('/hr/payroll/runs', data)
  return response.data
}

export const updatePayrollRun = async (runId: string, data: UpdatePayrollRunData): Promise<PayrollRun> => {
  const response = await api.patch(`/hr/payroll/runs/${runId}`, data)
  return response.data
}

export const deletePayrollRun = async (runId: string): Promise<void> => {
  await api.delete(`/hr/payroll/runs/${runId}`)
}

// Calculate payroll for all employees in the run
export const calculatePayrollRun = async (runId: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/calculate`)
  return response.data
}

// Validate payroll run before approval
export const validatePayrollRun = async (runId: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/validate`)
  return response.data
}

// Approve payroll run
export const approvePayrollRun = async (runId: string, comments?: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/approve`, { comments })
  return response.data
}

// Process payments
export const processPayments = async (runId: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/process-payment`)
  return response.data
}

// Generate WPS file
export const generateWPSFile = async (runId: string): Promise<{ fileUrl: string; fileName: string }> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/generate-wps`)
  return response.data
}

// Submit WPS to bank (Note: uses generate-wps endpoint)
export const submitWPS = async (runId: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/generate-wps`)
  return response.data
}

// Cancel payroll run
export const cancelPayrollRun = async (runId: string, reason: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/cancel`, { reason })
  return response.data
}

// Send payslip notifications to employees
export const sendPayslipNotifications = async (runId: string): Promise<{ sent: number; failed: number }> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/send-notifications`)
  return response.data
}

// Get payroll run statistics
export const getPayrollRunStats = async (): Promise<{
  totalRuns: number
  draftRuns: number
  pendingApproval: number
  completedThisMonth: number
  totalPaidThisMonth: number
}> => {
  const response = await api.get('/hr/payroll/runs/stats')
  return response.data
}

// Hold/Unhold employee in payroll run
export const holdEmployee = async (runId: string, empId: string, reason: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/employees/${empId}/hold`, { reason })
  return response.data
}

export const unholdEmployee = async (runId: string, empId: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/employees/${empId}/unhold`)
  return response.data
}

/**
 * Exclude employee from payroll run
 * POST /hr/payroll/runs/:id/employees/:empId/exclude
 */
export const excludeEmployee = async (runId: string, empId: string, reason: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/employees/${empId}/exclude`, { reason })
  return response.data
}

/**
 * Include employee back in payroll run
 * POST /hr/payroll/runs/:id/employees/:empId/include
 */
export const includeEmployee = async (runId: string, empId: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/employees/${empId}/include`)
  return response.data
}

/**
 * Recalculate single employee in payroll run
 * POST /hr/payroll/runs/:id/employees/:empId/recalculate
 */
export const recalculateEmployee = async (runId: string, empId: string): Promise<PayrollRun> => {
  const response = await api.post(`/hr/payroll/runs/${runId}/employees/${empId}/recalculate`)
  return response.data
}

/**
 * Export payroll run report
 * GET /hr/payroll/runs/:id/export
 */
export const exportPayrollRunReport = async (
  runId: string,
  reportType: 'summary' | 'detailed' | 'bank_file' | 'wps_sif' | 'journal_entry',
  format: 'pdf' | 'excel' | 'csv'
): Promise<Blob> => {
  const response = await api.get(`/hr/payroll/runs/${runId}/export`, {
    params: { reportType, format },
    responseType: 'blob',
  })
  return response.data
}
