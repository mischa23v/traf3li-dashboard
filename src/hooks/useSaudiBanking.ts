import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import api from '@/lib/api'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  EmployeeNationality,
  NitaqatBand,
  MudadSubmissionStatus,
} from '@/constants/saudi-banking'
import type {
  GOSICalculation,
  GOSIContributionBreakdown,
  NitaqatCheck,
  PayrollCalculation,
  ComplianceDeadline,
  ComplianceStatus,
  MudadSubmission,
  WPSFile as ServiceWPSFile,
  WPSEmployee as ServiceWPSEmployee,
  WPSEstablishment as ServiceWPSEstablishment,
  WPSValidationResult,
} from '@/services/saudiBankingService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ============================================
// RE-EXPORT TYPES FROM SERVICE FOR CONVENIENCE
// ============================================
export type {
  GOSICalculation,
  GOSIContributionBreakdown,
  NitaqatCheck,
  PayrollCalculation,
  ComplianceDeadline,
  ComplianceStatus,
  MudadSubmission,
  WPSValidationResult,
}

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

// WPS Types (extended from service types)
export interface WPSEstablishment extends Omit<ServiceWPSEstablishment, 'establishmentId' | 'establishmentName'> {
  molId: string
  name: string
  iban: string
  bankCode: string
}

export interface WPSEmployee {
  name: string
  employeeId?: string
  molId: string
  nationalId: string
  nationality: EmployeeNationality
  iban: string
  bankCode: string
  employeeStartDate?: string
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
  fileId?: string
  filename: string
  establishment: WPSEstablishment
  totalRecords: number
  totalAmount: number
  paymentDate: string
  batchReference: string
  status: 'PENDING' | 'UPLOADED' | 'PROCESSED' | 'FAILED'
  createdAt: string
  downloadUrl?: string
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

// Mudad Types (updated to match API contracts)
export interface MudadEmployee {
  employeeId?: string
  name: string
  nationalId?: string
  nationality: EmployeeNationality | string
  basicSalary: number
  housingAllowance?: number
  transportAllowance?: number
  otherAllowances?: number
  employeeStartDate?: string // For GOSI 2024 reform
}

export interface NitaqatResult {
  totalEmployees: number
  saudiCount: number
  weightedSaudiCount: number
  nonSaudiCount: number
  saudizationPercentage: number
  requiredPercentage: number
  category: NitaqatBand | 'PLATINUM' | 'GREEN_HIGH' | 'GREEN_MID' | 'GREEN_LOW' | 'YELLOW' | 'RED'
  isCompliant: boolean
  shortfall?: number
  points?: {
    fullPoints: number
    halfPoints: number
    zeroPoints: number
    totalPoints: number
  }
}

export interface MinimumWageResult {
  employee: string
  employeeId?: string
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// Create customer
export function useCreateLeanCustomer() {
  return useMutation({
    mutationFn: async (appUserId: string) => {
      const response = await api.post('/saudi-banking/lean/customers', { appUserId })
      return response.data
    },
    onSuccess: () => {
      invalidateCache.lean.customers()
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// Disconnect entity
export function useDisconnectLeanEntity() {
  return useMutation({
    mutationFn: async ({ customerId, entityId }: { customerId: string; entityId: string }) => {
      const response = await api.delete(`/saudi-banking/lean/customers/${customerId}/entities/${entityId}`)
      return response.data
    },
    onSuccess: () => {
      invalidateCache.lean.all()
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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
      invalidateCache.wps.files()
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
      invalidateCache.sadad.payments()
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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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

// Calculate GOSI for single employee (updated for 2024 reform)
export function useCalculateGOSI() {
  return useMutation({
    mutationFn: async ({
      nationality,
      basicSalary,
      housingAllowance,
      employeeStartDate,
    }: {
      nationality: EmployeeNationality | string
      basicSalary: number
      housingAllowance?: number
      employeeStartDate?: string
    }): Promise<GOSICalculation> => {
      const response = await api.post('/saudi-banking/mudad/gosi/calculate', {
        nationality,
        basicSalary,
        housingAllowance,
        employeeStartDate,
      })
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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// ============================================
// COMPLIANCE DEADLINE HOOKS
// ============================================

// Get all compliance deadlines
export function useComplianceDeadlines(params?: {
  month?: string
  types?: Array<'gosi' | 'wps' | 'mudad' | 'nitaqat'>
}) {
  return useQuery<ComplianceDeadline[]>({
    queryKey: ['compliance', 'deadlines', params],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/compliance/deadlines', { params })
      return response.data
    },
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// Get overall compliance status
export function useComplianceStatus() {
  return useQuery<ComplianceStatus>({
    queryKey: ['compliance', 'status'],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/compliance/status')
      return response.data
    },
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// Get upcoming deadlines (next N days)
export function useUpcomingDeadlines(daysAhead: number = 30) {
  return useQuery<ComplianceDeadline[]>({
    queryKey: ['compliance', 'deadlines', 'upcoming', daysAhead],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/compliance/deadlines/upcoming', {
        params: { daysAhead },
      })
      return response.data
    },
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// Get Mudad submission history
export function useMudadSubmissions(params?: {
  page?: number
  pageSize?: number
  fromDate?: string
  toDate?: string
  status?: MudadSubmissionStatus
}) {
  return useQuery<{ submissions: MudadSubmission[]; total: number }>({
    queryKey: ['mudad', 'submissions', params],
    queryFn: async () => {
      const response = await api.get('/saudi-banking/mudad/submissions', { params })
      return response.data
    },
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// Get single submission status
export function useMudadSubmissionStatus(submissionId: string) {
  return useQuery<MudadSubmission>({
    queryKey: ['mudad', 'submissions', submissionId],
    queryFn: async () => {
      const response = await api.get(`/saudi-banking/mudad/submissions/${submissionId}/status`)
      return response.data
    },
    enabled: !!submissionId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}
