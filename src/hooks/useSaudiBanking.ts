import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

// ============================================
// TYPES
// ============================================

// Lean Technologies Types
export interface LeanCustomer {
  _id: string
  customerId: string
  appUserId: string
  createdAt: string
  entities: LeanEntity[]
}

export interface LeanEntity {
  entityId: string
  bankId: string
  bankName: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  accounts: LeanAccount[]
  linkedAt: string
}

export interface LeanAccount {
  accountId: string
  accountNumber: string
  iban: string
  type: 'CURRENT' | 'SAVINGS' | 'CREDIT'
  currency: string
  balance: number
  availableBalance: number
  lastUpdated: string
}

export interface LeanBank {
  bankId: string
  name: string
  nameAr: string
  logo: string
  country: string
  supportedPermissions: string[]
}

export interface LeanTransaction {
  transactionId: string
  accountId: string
  amount: number
  currency: string
  type: 'CREDIT' | 'DEBIT'
  category: string
  description: string
  merchantName?: string
  transactionDate: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
}

// WPS Types
export interface WPSEstablishment {
  molId: string
  name: string
  iban: string
  bankCode: string
}

export interface WPSEmployee {
  name: string
  molId: string
  nationality: string
  iban: string
  salary: {
    basic: number
    housing: number
    otherEarnings: number
    deductions: number
    netSalary: number
  }
}

export interface WPSFile {
  _id: string
  filename: string
  establishment: WPSEstablishment
  totalRecords: number
  totalAmount: number
  paymentDate: string
  batchReference: string
  status: 'PENDING' | 'UPLOADED' | 'PROCESSED' | 'FAILED'
  createdAt: string
}

export interface SARIEBank {
  bankId: string
  bankCode: string
  name: string
  nameAr: string
}

// SADAD Types
export interface SADADBiller {
  billerCode: string
  name: string
  nameAr: string
  category: string
  categoryAr: string
  logo?: string
  isActive: boolean
}

export interface SADADBill {
  billNumber: string
  billerCode: string
  billerName: string
  amount: number
  dueDate: string
  status: 'UNPAID' | 'PAID' | 'PARTIAL' | 'EXPIRED'
  customerName?: string
  serviceDescription?: string
}

export interface SADADPayment {
  _id: string
  billerCode: string
  billerName: string
  billNumber: string
  amount: number
  debitAccount: string
  reference: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  transactionDate: string
  remarks?: string
}

// Mudad Types
export interface MudadEmployee {
  name: string
  nationality: string
  basicSalary: number
  housingAllowance?: number
  transportAllowance?: number
  otherAllowances?: number
}

export interface GOSICalculation {
  employeeContribution: number
  employerContribution: number
  totalContribution: number
  pensionContribution: number
  hazardContribution: number
}

export interface PayrollCalculation {
  employee: MudadEmployee
  grossSalary: number
  gosi: GOSICalculation
  netSalary: number
}

export interface NitaqatResult {
  totalEmployees: number
  saudiCount: number
  nonSaudiCount: number
  saudizationPercentage: number
  requiredPercentage: number
  category: 'PLATINUM' | 'GREEN_HIGH' | 'GREEN_MID' | 'GREEN_LOW' | 'YELLOW' | 'RED'
  isCompliant: boolean
  shortfall?: number
}

export interface MinimumWageResult {
  employee: string
  nationality: string
  salary: number
  minimumRequired: number
  isCompliant: boolean
  shortfall?: number
}

// ============================================
// LEAN TECHNOLOGIES HOOKS
// ============================================

// Get supported banks
export function useLeanBanks() {
  return useQuery({
    queryKey: ['lean', 'banks'],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/lean/banks')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get all customers
export function useLeanCustomers() {
  return useQuery({
    queryKey: ['lean', 'customers'],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/lean/customers')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get customer by ID
export function useLeanCustomer(customerId: string) {
  return useQuery({
    queryKey: ['lean', 'customers', customerId],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/lean/customers/${customerId}`)
      return response.data
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Create customer
export function useCreateLeanCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (appUserId: string) => {
      const response = await api.post('/saudi-banking/lean/customers', { appUserId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lean', 'customers'] })
      toast.success('تم إنشاء العميل بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إنشاء العميل')
    },
  })
}

// Get customer token for LinkSDK
export function useLeanCustomerToken(customerId: string) {
  return useQuery({
    queryKey: ['lean', 'customers', customerId, 'token'],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/lean/customers/${customerId}/token`)
      return response.data
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get customer entities (linked banks)
export function useLeanEntities(customerId: string) {
  return useQuery({
    queryKey: ['lean', 'customers', customerId, 'entities'],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/lean/customers/${customerId}/entities`)
      return response.data
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get account transactions
export function useLeanTransactions(accountId: string, params?: { page?: number; fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: ['lean', 'accounts', accountId, 'transactions', params],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/lean/accounts/${accountId}/transactions`, { params })
      return response.data
    },
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get account balance
export function useLeanBalance(accountId: string) {
  return useQuery({
    queryKey: ['lean', 'accounts', accountId, 'balance'],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/lean/accounts/${accountId}/balance`)
      return response.data
    },
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Disconnect entity
export function useDisconnectLeanEntity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ customerId, entityId }: { customerId: string; entityId: string }) => {
      const response = await api.delete(`/saudi-banking/lean/customers/${customerId}/entities/${entityId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lean'] })
      toast.success('تم إلغاء ربط الحساب البنكي')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إلغاء الربط')
    },
  })
}

// ============================================
// WPS HOOKS
// ============================================

// Get WPS files history
export function useWPSFiles(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['wps', 'files', params],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/wps/files', { params })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get single WPS file
export function useWPSFile(fileId: string) {
  return useQuery({
    queryKey: ['wps', 'files', fileId],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/wps/files/${fileId}`)
      return response.data
    },
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get SARIE bank codes
export function useSARIEBanks() {
  return useQuery({
    queryKey: ['wps', 'sarie-banks'],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/wps/sarie-banks')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Validate WPS data
export function useValidateWPS() {
  return useMutation({
    mutationFn: async (data: { establishment: WPSEstablishment; employees: WPSEmployee[] }) => {
      const response = await api.post('/saudi-banking/wps/validate', data)
      return response.data
    },
  })
}

// Generate WPS file
export function useGenerateWPS() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      establishment: WPSEstablishment
      employees: WPSEmployee[]
      paymentDate?: string
      batchReference?: string
    }) => {
      const response = await api.post('/saudi-banking/wps/generate', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wps', 'files'] })
      toast.success('تم إنشاء ملف WPS بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إنشاء ملف WPS')
    },
  })
}

// Download WPS file
export function useDownloadWPS() {
  return useMutation({
    mutationFn: async (data: { establishment: WPSEstablishment; employees: WPSEmployee[] }) => {
      const response = await api.post('/saudi-banking/wps/download', data, {
        responseType: 'blob',
      })
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `WPS_${data.establishment.molId}_${new Date().toISOString().slice(0, 10)}.txt`
      link.click()
      window.URL.revokeObjectURL(url)
      return response.data
    },
    onSuccess: () => {
      toast.success('تم تحميل ملف WPS')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحميل الملف')
    },
  })
}

// ============================================
// SADAD HOOKS
// ============================================

// Get billers
export function useSADADBillers(category?: string) {
  return useQuery({
    queryKey: ['sadad', 'billers', category],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/sadad/billers', { params: { category } })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Search billers
export function useSearchSADADBillers(query: string) {
  return useQuery({
    queryKey: ['sadad', 'billers', 'search', query],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/sadad/billers/search', { params: { query } })
      return response.data
    },
    enabled: query.length > 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Inquire bill
export function useInquireSADADBill() {
  return useMutation({
    mutationFn: async ({ billerCode, billNumber }: { billerCode: string; billNumber: string }) => {
      const response = await api.post('/saudi-banking/sadad/bills/inquiry', { billerCode, billNumber })
      return response.data
    },
  })
}

// Pay bill
export function usePaySADADBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      billerCode: string
      billNumber: string
      amount: number
      debitAccount: string
      reference?: string
      remarks?: string
    }) => {
      const response = await api.post('/saudi-banking/sadad/bills/pay', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sadad', 'payments'] })
      toast.success('تم دفع الفاتورة بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في دفع الفاتورة')
    },
  })
}

// Get payment history
export function useSADADPayments(params?: { fromDate?: string; toDate?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['sadad', 'payments', params],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/sadad/payments/history', { params })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get single payment
export function useSADADPayment(paymentId: string) {
  return useQuery({
    queryKey: ['sadad', 'payments', paymentId],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/sadad/payments/${paymentId}`)
      return response.data
    },
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// ============================================
// MUDAD HOOKS
// ============================================

// Calculate payroll with GOSI
export function useCalculatePayroll() {
  return useMutation({
    mutationFn: async (employees: MudadEmployee[]) => {
      const response = await api.post('/saudi-banking/mudad/payroll/calculate', { employees })
      return response.data
    },
  })
}

// Calculate GOSI for single employee
export function useCalculateGOSI() {
  return useMutation({
    mutationFn: async ({ nationality, basicSalary }: { nationality: string; basicSalary: number }) => {
      const response = await api.post('/saudi-banking/mudad/gosi/calculate', { nationality, basicSalary })
      return response.data
    },
  })
}

// Check Nitaqat compliance
export function useCheckNitaqat() {
  return useMutation({
    mutationFn: async (employees: MudadEmployee[]) => {
      const response = await api.post('/saudi-banking/mudad/compliance/nitaqat', { employees })
      return response.data
    },
  })
}

// Check minimum wage compliance
export function useCheckMinimumWage() {
  return useMutation({
    mutationFn: async (employees: MudadEmployee[]) => {
      const response = await api.post('/saudi-banking/mudad/compliance/minimum-wage', { employees })
      return response.data
    },
  })
}

// Generate GOSI report
export function useGenerateGOSIReport() {
  return useMutation({
    mutationFn: async ({ employees, month }: { employees: MudadEmployee[]; month: string }) => {
      const response = await api.post('/saudi-banking/mudad/gosi/report', { employees, month })
      return response.data
    },
    onSuccess: () => {
      toast.success('تم إنشاء تقرير التأمينات الاجتماعية')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إنشاء التقرير')
    },
  })
}

// Get payroll history
export function useMudadPayrolls(params?: { page?: number; limit?: number; month?: string }) {
  return useQuery({
    queryKey: ['mudad', 'payrolls', params],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/mudad/payrolls', { params })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Get compliance reports
export function useMudadCompliance() {
  return useQuery({
    queryKey: ['mudad', 'compliance'],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/mudad/compliance')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
