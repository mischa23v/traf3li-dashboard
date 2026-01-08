/**
 * Saudi Banking Service
 * Handles Lean Technologies, WPS, SADAD, and Mudad integrations
 */

import { api } from '@/lib/api'
import {
  EmployeeNationality,
  NitaqatBand,
  GosiRegistrationStatus,
  WpsPaymentStatus,
  SadadPaymentStatus,
  MudadSubmissionStatus,
} from '@/constants/saudi-banking'

// ==================== LEAN TECHNOLOGIES ====================

export interface LeanBank {
  id: string
  name: string
  nameAr: string
  logo: string
  isSupported: boolean
}

export interface LeanCustomer {
  customerId: string
  appUserId: string
  status: string
  createdAt: string
}

export interface LeanEntity {
  entityId: string
  customerId: string
  bankName: string
  status: string
  createdAt: string
}

export interface LeanAccount {
  accountId: string
  entityId: string
  accountNumber: string
  accountType: string
  currency: string
  balance: number
}

export interface LeanTransaction {
  transactionId: string
  accountId: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance: number
}

export interface LeanIdentity {
  fullName: string
  nationalId: string
  dateOfBirth: string
  address?: string
}

// ==================== WPS ====================

export interface WPSFile {
  fileId: string
  fileName: string
  batchReference: string
  totalEmployees: number
  totalAmount: number
  paymentDate: string
  status: WpsPaymentStatus
  createdAt: string
  downloadUrl?: string
  submittedAt?: string
  processedAt?: string
}

export interface WPSEmployee {
  employeeId: string
  nationalId: string
  iban: string
  bankCode: string
  basicSalary: number
  housingAllowance: number
  otherAllowances?: number
  deductions?: number
  netSalary: number
  nationality: EmployeeNationality
}

export interface WPSEstablishment {
  establishmentId: string
  establishmentName: string
  molId: string // Ministry of Labor ID
  bankCode: string
  bankAccountNumber: string
  iban: string
}

export interface SarieBank {
  code: string
  name: string
  nameAr: string
}

export interface WPSValidationResult {
  valid: boolean
  errors: WPSValidationError[]
  warnings: string[]
}

export interface WPSValidationError {
  employeeId?: string
  field: string
  message: string
  code: string
}

// ==================== SADAD ====================

export interface SadadBiller {
  billerCode: string
  name: string
  nameAr: string
  category: string
  logoUrl?: string
}

export interface SadadBill {
  billNumber: string
  billerCode: string
  billerName: string
  amount: number
  dueDate: string
  status: SadadPaymentStatus
  minimumAmount?: number
  maximumAmount?: number
  currency: string
}

export interface SadadPayment {
  transactionId: string
  billerCode: string
  billNumber: string
  amount: number
  paymentDate: string
  status: SadadPaymentStatus
  reference: string
  receiptNumber?: string
  debitAccount: string
}

// ==================== MUDAD ====================

export interface PayrollCalculation {
  employeeId: string
  employeeName: string
  nationalId: string
  nationality: EmployeeNationality
  basicSalary: number
  housingAllowance: number
  otherAllowances: number
  totalAllowances: number
  deductions: number
  gosiEmployee: number
  gosiEmployer: number
  sanedEmployee: number
  sanedEmployer: number
  netSalary: number
  grossSalary: number
  isReformEmployee: boolean
}

export interface GOSICalculation {
  /** Capped base salary used for calculation */
  baseSalary: number
  /** Original basic salary before capping */
  basicSalary: number
  /** Housing allowance */
  housingAllowance: number
  /** Employee nationality */
  nationality: EmployeeNationality
  /** Employee hire date */
  employeeStartDate?: string
  /** Whether 2024 reform rates apply */
  isReformEmployee: boolean
  /** Detailed contribution breakdown */
  breakdown: GOSIContributionBreakdown
  /** Total employee contribution (pension + SANED) */
  employeeContribution: number
  /** Total employer contribution (pension + OHI + SANED) */
  employerContribution: number
  /** Grand total contribution */
  totalContribution: number
}

export interface GOSIContributionBreakdown {
  /** Employee pension contribution */
  employeePension: number
  /** Employer pension contribution */
  employerPension: number
  /** Employer OHI (Occupational Hazard Insurance) */
  employerOHI: number
  /** SANED employee contribution */
  sanedEmployee: number
  /** SANED employer contribution */
  sanedEmployer: number
}

export interface NitaqatCheck {
  /** Current saudization percentage */
  saudizationRate: number
  /** Required rate for current band */
  requiredRate: number
  /** Current Nitaqat band/color */
  band: NitaqatBand
  /** Legacy status field for backwards compatibility */
  status: 'green' | 'yellow' | 'red' | 'platinum'
  /** Total headcount */
  totalEmployees: number
  /** Saudi employee count (raw) */
  saudiEmployees: number
  /** Saudi employee count (weighted by salary) */
  weightedSaudiCount: number
  /** Non-Saudi employee count */
  nonSaudiEmployees: number
  /** Activity type */
  activityType?: string
  /** Company size bracket */
  sizeBracket?: 'small' | 'medium' | 'large' | 'giant'
  /** Points breakdown */
  points?: NitaqatPointsBreakdown
}

export interface NitaqatPointsBreakdown {
  /** Full points (SAR 4000+ salary) */
  fullPoints: number
  /** Half points (SAR 3000-3999 salary) */
  halfPoints: number
  /** No points (below SAR 3000) */
  zeroPoints: number
  /** Total weighted points */
  totalPoints: number
}

export interface MudadSubmission {
  submissionId: string
  establishmentId: string
  payrollPeriod: string
  status: MudadSubmissionStatus
  submittedAt: string
  processedAt?: string
  totalEmployees: number
  totalAmount: number
  errors?: MudadSubmissionError[]
}

export interface MudadSubmissionError {
  employeeId?: string
  field: string
  message: string
  code: string
}

export interface ComplianceDeadline {
  type: 'gosi' | 'wps' | 'mudad' | 'nitaqat'
  deadline: string
  period: string
  status: 'upcoming' | 'due' | 'overdue' | 'completed'
  daysRemaining: number
  description: string
}

export interface ComplianceStatus {
  gosi: {
    status: GosiRegistrationStatus
    lastPaymentDate?: string
    nextDueDate: string
    amountDue: number
  }
  wps: {
    lastSubmissionDate?: string
    nextDueDate: string
    status: 'compliant' | 'pending' | 'overdue'
  }
  nitaqat: {
    band: NitaqatBand
    saudizationRate: number
    targetRate: number
  }
  mudad: {
    registrationStatus: 'active' | 'pending' | 'suspended'
    lastSubmission?: string
  }
}

// ==================== SERVICE ====================

export const saudiBankingService = {
  // ============ LEAN TECHNOLOGIES ============
  getBanks: async (): Promise<LeanBank[]> => {
    const response = await api.get('/saudi-banking/lean/banks')
    return response.data
  },

  getLeanCustomers: async (): Promise<LeanCustomer[]> => {
    const response = await api.get('/saudi-banking/lean/customers')
    return response.data
  },

  createLeanCustomer: async (data: { appUserId: string }): Promise<LeanCustomer> => {
    const response = await api.post('/saudi-banking/lean/customers', data)
    return response.data
  },

  getCustomerToken: async (customerId: string): Promise<{ token: string }> => {
    const response = await api.get(`/saudi-banking/lean/customers/${customerId}/token`)
    return response.data
  },

  getEntities: async (customerId: string): Promise<LeanEntity[]> => {
    const response = await api.get(`/saudi-banking/lean/customers/${customerId}/entities`)
    return response.data
  },

  getAccounts: async (entityId: string): Promise<LeanAccount[]> => {
    const response = await api.get(`/saudi-banking/lean/entities/${entityId}/accounts`)
    return response.data
  },

  getBalance: async (accountId: string): Promise<{ balance: number; currency: string }> => {
    const response = await api.get(`/saudi-banking/lean/accounts/${accountId}/balance`)
    return response.data
  },

  getTransactions: async (accountId: string, params?: {
    page?: number
    pageSize?: number
    fromDate?: string
    toDate?: string
  }): Promise<{ transactions: LeanTransaction[]; total: number }> => {
    const response = await api.get(`/saudi-banking/lean/accounts/${accountId}/transactions`, { params })
    return response.data
  },

  getIdentity: async (entityId: string): Promise<LeanIdentity> => {
    const response = await api.get(`/saudi-banking/lean/entities/${entityId}/identity`)
    return response.data
  },

  initiatePayment: async (data: {
    amount: number
    currency: string
    paymentSourceId: string
    paymentDestinationId: string
    description: string
  }): Promise<any> => {
    const response = await api.post('/saudi-banking/lean/payments', data)
    return response.data
  },

  disconnectEntity: async (entityId: string): Promise<void> => {
    await api.delete(`/saudi-banking/lean/entities/${entityId}`)
  },

  // ============ WPS - Wage Protection System ============
  generateWPSFile: async (data: {
    establishment: WPSEstablishment
    employees: WPSEmployee[]
    paymentDate: string
    batchReference: string
  }): Promise<WPSFile> => {
    const response = await api.post('/saudi-banking/wps/generate', data)
    return response.data
  },

  downloadWPSFile: async (data: {
    establishment: WPSEstablishment
    employees: WPSEmployee[]
    paymentDate: string
    batchReference: string
  }): Promise<Blob> => {
    const response = await api.post('/saudi-banking/wps/download', data, {
      responseType: 'blob'
    })
    return response.data
  },

  validateWPSData: async (data: {
    establishment: WPSEstablishment
    employees: WPSEmployee[]
  }): Promise<WPSValidationResult> => {
    const response = await api.post('/saudi-banking/wps/validate', data)
    return response.data
  },

  getWPSFiles: async (params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<{ files: WPSFile[]; total: number }> => {
    const response = await api.get('/saudi-banking/wps/files', { params })
    return response.data
  },

  getSarieBankIds: async (): Promise<SarieBank[]> => {
    const response = await api.get('/saudi-banking/wps/sarie-banks')
    return response.data
  },

  // ============ SADAD - Bill Payments ============
  getSadadBillers: async (params?: { category?: string }): Promise<SadadBiller[]> => {
    const response = await api.get('/saudi-banking/sadad/billers', { params })
    return response.data
  },

  searchBillers: async (query: string): Promise<SadadBiller[]> => {
    const response = await api.get('/saudi-banking/sadad/billers/search', {
      params: { query }
    })
    return response.data
  },

  inquireBill: async (data: {
    billerCode: string
    billNumber: string
  }): Promise<SadadBill> => {
    const response = await api.post('/saudi-banking/sadad/bills/inquiry', data)
    return response.data
  },

  payBill: async (data: {
    billerCode: string
    billNumber: string
    amount: number
    debitAccount: string
    reference?: string
    remarks?: string
  }): Promise<SadadPayment> => {
    const response = await api.post('/saudi-banking/sadad/bills/pay', data)
    return response.data
  },

  getSadadPaymentStatus: async (transactionId: string): Promise<SadadPayment> => {
    const response = await api.get(`/saudi-banking/sadad/payments/${transactionId}/status`)
    return response.data
  },

  getSadadPaymentHistory: async (params?: {
    fromDate?: string
    toDate?: string
    billerCode?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<{ payments: SadadPayment[]; total: number }> => {
    const response = await api.get('/saudi-banking/sadad/payments/history', { params })
    return response.data
  },

  // ============ MUDAD - Payroll Compliance ============
  calculatePayroll: async (data: {
    employees: Array<{
      employeeId: string
      nationalId: string
      nationality: EmployeeNationality
      basicSalary: number
      housingAllowance?: number
      otherAllowances?: number
      deductions?: number
      employeeStartDate?: string
    }>
  }): Promise<PayrollCalculation[]> => {
    const response = await api.post('/saudi-banking/mudad/payroll/calculate', data)
    return response.data
  },

  calculateGOSI: async (data: {
    nationality: EmployeeNationality
    basicSalary: number
    housingAllowance?: number
    employeeStartDate?: string
  }): Promise<GOSICalculation> => {
    const response = await api.post('/saudi-banking/mudad/gosi/calculate', data)
    return response.data
  },

  generateMudadWPS: async (data: {
    establishment: WPSEstablishment
    employees: WPSEmployee[]
    paymentDate: string
    batchReference: string
  }): Promise<WPSFile> => {
    const response = await api.post('/saudi-banking/mudad/wps/generate', data)
    return response.data
  },

  submitPayroll: async (data: {
    establishment: WPSEstablishment
    employees: WPSEmployee[]
    paymentDate: string
  }): Promise<MudadSubmission> => {
    const response = await api.post('/saudi-banking/mudad/payroll/submit', data)
    return response.data
  },

  getSubmissionStatus: async (submissionId: string): Promise<MudadSubmission> => {
    const response = await api.get(`/saudi-banking/mudad/submissions/${submissionId}/status`)
    return response.data
  },

  getSubmissionHistory: async (params?: {
    page?: number
    pageSize?: number
    fromDate?: string
    toDate?: string
    status?: MudadSubmissionStatus
  }): Promise<{ submissions: MudadSubmission[]; total: number }> => {
    const response = await api.get('/saudi-banking/mudad/submissions', { params })
    return response.data
  },

  generateGOSIReport: async (data: {
    employees: Array<{
      employeeId: string
      nationalId: string
      nationality: EmployeeNationality
      basicSalary: number
      housingAllowance?: number
      employeeStartDate?: string
    }>
    month: string
  }): Promise<Blob> => {
    const response = await api.post('/saudi-banking/mudad/gosi/report', data, {
      responseType: 'blob'
    })
    return response.data
  },

  checkNitaqat: async (data: {
    employees: Array<{
      employeeId: string
      nationality: EmployeeNationality
      salary: number
    }>
    activityType?: string
  }): Promise<NitaqatCheck> => {
    const response = await api.post('/saudi-banking/mudad/compliance/nitaqat', data)
    return response.data
  },

  checkMinimumWage: async (data: {
    employees: Array<{
      employeeId: string
      nationality: EmployeeNationality
      salary: number
    }>
  }): Promise<{
    compliant: boolean
    violations: Array<{
      employeeId: string
      currentSalary: number
      minimumRequired: number
      deficit: number
    }>
  }> => {
    const response = await api.post('/saudi-banking/mudad/compliance/minimum-wage', data)
    return response.data
  },

  // ============ COMPLIANCE DEADLINES ============
  getComplianceDeadlines: async (params?: {
    month?: string
    types?: Array<'gosi' | 'wps' | 'mudad' | 'nitaqat'>
  }): Promise<ComplianceDeadline[]> => {
    const response = await api.get('/saudi-banking/compliance/deadlines', { params })
    return response.data
  },

  getComplianceStatus: async (): Promise<ComplianceStatus> => {
    const response = await api.get('/saudi-banking/compliance/status')
    return response.data
  },

  getUpcomingDeadlines: async (daysAhead?: number): Promise<ComplianceDeadline[]> => {
    const response = await api.get('/saudi-banking/compliance/deadlines/upcoming', {
      params: { daysAhead: daysAhead ?? 30 }
    })
    return response.data
  },
}

export default saudiBankingService
