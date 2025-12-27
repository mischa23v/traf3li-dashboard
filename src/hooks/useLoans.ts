import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  getLoanStats,
  checkLoanEligibility,
  submitLoanApplication,
  approveLoan,
  rejectLoan,
  disburseLoan,
  recordLoanPayment,
  processPayrollDeduction,
  calculateEarlySettlement,
  processEarlySettlement,
  markLoanDefaulted,
  restructureLoan,
  issueClearanceLetter,
  bulkDeleteLoans,
  getEmployeeLoans,
  getPendingApprovals,
  getOverdueInstallments,
  type LoanFilters,
  type CreateLoanData,
  type UpdateLoanData,
  type LoanStatus,
  type PaymentMethod,
  type DisbursementMethod,
} from '@/services/loansService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query Keys
export const loanKeys = {
  all: ['loans'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (filters?: LoanFilters) => [...loanKeys.lists(), filters] as const,
  details: () => [...loanKeys.all, 'detail'] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
  stats: () => [...loanKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...loanKeys.all, 'by-employee', employeeId] as const,
  pendingApprovals: () => [...loanKeys.all, 'pending-approvals'] as const,
  overdueInstallments: () => [...loanKeys.all, 'overdue-installments'] as const,
  eligibility: (employeeId: string, amount: number) => [...loanKeys.all, 'eligibility', employeeId, amount] as const,
  earlySettlement: (loanId: string) => [...loanKeys.all, 'early-settlement', loanId] as const,
}

// Get loans
export const useLoans = (filters?: LoanFilters) => {
  return useQuery({
    queryKey: loanKeys.list(filters),
    queryFn: () => getLoans(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single loan
export const useLoan = (loanId: string) => {
  return useQuery({
    queryKey: loanKeys.detail(loanId),
    queryFn: () => getLoan(loanId),
    enabled: !!loanId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get loan stats
export const useLoanStats = () => {
  return useQuery({
    queryKey: loanKeys.stats(),
    queryFn: () => getLoanStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee loans
export const useEmployeeLoans = (employeeId: string) => {
  return useQuery({
    queryKey: loanKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeLoans(employeeId),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get pending approvals
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: loanKeys.pendingApprovals(),
    queryFn: () => getPendingApprovals(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get overdue installments
export const useOverdueInstallments = () => {
  return useQuery({
    queryKey: loanKeys.overdueInstallments(),
    queryFn: () => getOverdueInstallments(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Check eligibility
export const useCheckEligibility = (employeeId: string, amount: number) => {
  return useQuery({
    queryKey: loanKeys.eligibility(employeeId, amount),
    queryFn: () => checkLoanEligibility(employeeId, amount),
    enabled: !!employeeId && amount > 0,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Calculate early settlement
export const useEarlySettlementCalculation = (loanId: string) => {
  return useQuery({
    queryKey: loanKeys.earlySettlement(loanId),
    queryFn: () => calculateEarlySettlement(loanId),
    enabled: !!loanId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create loan
export const useCreateLoan = () => {
  return useMutation({
    mutationFn: (data: CreateLoanData) => createLoan(data),
    onSuccess: () => {
      toast.success('تم إنشاء طلب القرض بنجاح')
      invalidateCache.loans.lists()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء طلب القرض')
    },
  })
}

// Update loan
export const useUpdateLoan = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: string; data: UpdateLoanData }) =>
      updateLoan(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث القرض بنجاح')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث القرض')
    },
  })
}

// Delete loan
export const useDeleteLoan = () => {
  return useMutation({
    mutationFn: (loanId: string) => deleteLoan(loanId),
    onSuccess: () => {
      toast.success('تم حذف القرض بنجاح')
      invalidateCache.loans.lists()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف القرض')
    },
  })
}

// Bulk delete
export const useBulkDeleteLoans = () => {
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteLoans(ids),
    onSuccess: (data) => {
      toast.success(`تم حذف ${data.deleted} قرض بنجاح`)
      invalidateCache.loans.lists()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف القروض')
    },
  })
}

// Submit application
export const useSubmitLoanApplication = () => {
  return useMutation({
    mutationFn: (loanId: string) => submitLoanApplication(loanId),
    onSuccess: (_, loanId) => {
      toast.success('تم تقديم طلب القرض بنجاح')
      invalidateCache.loans.detail(loanId)
      invalidateCache.loans.lists()
      invalidateCache.loans.pendingApprovals()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تقديم الطلب')
    },
  })
}

// Approve loan
export const useApproveLoan = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: {
        approvedAmount?: number
        approvedInstallments?: number
        comments?: string
        conditions?: string[]
      }
    }) => approveLoan(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم اعتماد القرض بنجاح')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
      invalidateCache.loans.pendingApprovals()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في اعتماد القرض')
    },
  })
}

// Reject loan
export const useRejectLoan = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: { reason: string; comments?: string }
    }) => rejectLoan(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم رفض القرض')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
      invalidateCache.loans.pendingApprovals()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في رفض القرض')
    },
  })
}

// Disburse loan
export const useDisburseLoan = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: {
        disbursementMethod: DisbursementMethod
        bankDetails?: {
          bankName: string
          accountNumber: string
          iban: string
        }
        transferReference?: string
      }
    }) => disburseLoan(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم صرف القرض بنجاح')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في صرف القرض')
    },
  })
}

// Record payment
export const useRecordPayment = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: {
        installmentNumber?: number
        amount: number
        paymentMethod: PaymentMethod
        paymentDate: string
        paymentReference?: string
        notes?: string
      }
    }) => recordLoanPayment(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تسجيل السداد بنجاح')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
      invalidateCache.loans.overdueInstallments()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تسجيل السداد')
    },
  })
}

// Process payroll deduction
export const useProcessPayrollDeduction = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: {
        payrollRunId: string
        payrollMonth: string
        payrollYear: number
        deductedAmount: number
      }
    }) => processPayrollDeduction(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم خصم القسط من الراتب بنجاح')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في خصم القسط')
    },
  })
}

// Process early settlement
export const useProcessEarlySettlement = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: {
        settlementAmount: number
        paymentMethod: PaymentMethod
        paymentReference?: string
      }
    }) => processEarlySettlement(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم السداد المبكر بنجاح')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في السداد المبكر')
    },
  })
}

// Mark as defaulted
export const useMarkLoanDefaulted = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: { defaultReason: string; notes?: string }
    }) => markLoanDefaulted(loanId, data),
    onSuccess: (_, variables) => {
      toast.warning('تم تصنيف القرض كمتعثر')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
      invalidateCache.loans.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تصنيف القرض')
    },
  })
}

// Restructure loan
export const useRestructureLoan = () => {
  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: {
        newInstallmentAmount: number
        newInstallments: number
        reason: string
      }
    }) => restructureLoan(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم إعادة هيكلة القرض بنجاح')
      invalidateCache.loans.detail(variables.loanId)
      invalidateCache.loans.lists()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إعادة هيكلة القرض')
    },
  })
}

// Issue clearance letter
export const useIssueClearanceLetter = () => {
  return useMutation({
    mutationFn: (loanId: string) => issueClearanceLetter(loanId),
    onSuccess: (_, loanId) => {
      toast.success('تم إصدار خطاب إخلاء الطرف بنجاح')
      invalidateCache.loans.detail(loanId)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إصدار خطاب إخلاء الطرف')
    },
  })
}
