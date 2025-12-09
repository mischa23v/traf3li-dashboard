/**
 * Saudi Banking Service
 * Handles Lean Technologies, WPS, SADAD, and Mudad integrations
 */

import { api } from '@/lib/api'

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
  status: string
  createdAt: string
}

export interface SarieBank {
  code: string
  name: string
  nameAr: string
}

// ==================== SADAD ====================

export interface SadadBiller {
  billerCode: string
  name: string
  nameAr: string
  category: string
}

export interface SadadBill {
  billNumber: string
  billerCode: string
  billerName: string
  amount: number
  dueDate: string
  status: string
}

export interface SadadPayment {
  transactionId: string
  billerCode: string
  billNumber: string
  amount: number
  paymentDate: string
  status: string
  reference: string
}

// ==================== MUDAD ====================

export interface PayrollCalculation {
  employeeId: string
  employeeName: string
  basicSalary: number
  allowances: number
  deductions: number
  gosiEmployee: number
  gosiEmployer: number
  netSalary: number
}

export interface GOSICalculation {
  employeeContribution: number
  employerContribution: number
  totalContribution: number
  nationality: string
  basicSalary: number
}

export interface NitaqatCheck {
  saudizationRate: number
  requiredRate: number
  status: 'green' | 'yellow' | 'red'
  totalEmployees: number
  saudiEmployees: number
  nonSaudiEmployees: number
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
    establishment: any
    employees: any[]
    paymentDate: string
    batchReference: string
  }): Promise<WPSFile> => {
    const response = await api.post('/saudi-banking/wps/generate', data)
    return response.data
  },

  downloadWPSFile: async (data: {
    establishment: any
    employees: any[]
    paymentDate: string
    batchReference: string
  }): Promise<Blob> => {
    const response = await api.post('/saudi-banking/wps/download', data, {
      responseType: 'blob'
    })
    return response.data
  },

  validateWPSData: async (data: {
    establishment: any
    employees: any[]
  }): Promise<{ valid: boolean; errors: string[] }> => {
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
    employees: any[]
  }): Promise<PayrollCalculation[]> => {
    const response = await api.post('/saudi-banking/mudad/payroll/calculate', data)
    return response.data
  },

  calculateGOSI: async (data: {
    nationality: string
    basicSalary: number
  }): Promise<GOSICalculation> => {
    const response = await api.post('/saudi-banking/mudad/gosi/calculate', data)
    return response.data
  },

  generateMudadWPS: async (data: {
    establishment: any
    employees: any[]
    paymentDate: string
    batchReference: string
  }): Promise<WPSFile> => {
    const response = await api.post('/saudi-banking/mudad/wps/generate', data)
    return response.data
  },

  submitPayroll: async (data: {
    establishment: any
    employees: any[]
    paymentDate: string
  }): Promise<{ submissionId: string; status: string }> => {
    const response = await api.post('/saudi-banking/mudad/payroll/submit', data)
    return response.data
  },

  getSubmissionStatus: async (submissionId: string): Promise<any> => {
    const response = await api.get(`/saudi-banking/mudad/submissions/${submissionId}/status`)
    return response.data
  },

  generateGOSIReport: async (data: {
    employees: any[]
    month: string
  }): Promise<Blob> => {
    const response = await api.post('/saudi-banking/mudad/gosi/report', data, {
      responseType: 'blob'
    })
    return response.data
  },

  checkNitaqat: async (data: {
    employees: any[]
  }): Promise<NitaqatCheck> => {
    const response = await api.post('/saudi-banking/mudad/compliance/nitaqat', data)
    return response.data
  },

  checkMinimumWage: async (data: {
    employees: any[]
  }): Promise<{ compliant: boolean; violations: any[] }> => {
    const response = await api.post('/saudi-banking/mudad/compliance/minimum-wage', data)
    return response.data
  },
}

export default saudiBankingService
