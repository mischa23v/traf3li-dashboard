import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  })
}

// Get single loan
export const useLoan = (loanId: string) => {
  return useQuery({
    queryKey: loanKeys.detail(loanId),
    queryFn: () => getLoan(loanId),
    enabled: !!loanId,
  })
}

// Get loan stats
export const useLoanStats = () => {
  return useQuery({
    queryKey: loanKeys.stats(),
    queryFn: () => getLoanStats(),
  })
}

// Get employee loans
export const useEmployeeLoans = (employeeId: string) => {
  return useQuery({
    queryKey: loanKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeLoans(employeeId),
    enabled: !!employeeId,
  })
}

// Get pending approvals
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: loanKeys.pendingApprovals(),
    queryFn: () => getPendingApprovals(),
  })
}

// Get overdue installments
export const useOverdueInstallments = () => {
  return useQuery({
    queryKey: loanKeys.overdueInstallments(),
    queryFn: () => getOverdueInstallments(),
  })
}

// Check eligibility
export const useCheckEligibility = (employeeId: string, amount: number) => {
  return useQuery({
    queryKey: loanKeys.eligibility(employeeId, amount),
    queryFn: () => checkLoanEligibility(employeeId, amount),
    enabled: !!employeeId && amount > 0,
  })
}

// Calculate early settlement
export const useEarlySettlementCalculation = (loanId: string) => {
  return useQuery({
    queryKey: loanKeys.earlySettlement(loanId),
    queryFn: () => calculateEarlySettlement(loanId),
    enabled: !!loanId,
  })
}

// Create loan
export const useCreateLoan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLoanData) => createLoan(data),
    onSuccess: () => {
      toast.success('تم إنشاء طلب القرض بنجاح')
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء طلب القرض')
    },
  })
}

// Update loan
export const useUpdateLoan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: string; data: UpdateLoanData }) =>
      updateLoan(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث القرض بنجاح')
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث القرض')
    },
  })
}

// Delete loan
export const useDeleteLoan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (loanId: string) => deleteLoan(loanId),
    onSuccess: () => {
      toast.success('تم حذف القرض بنجاح')
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف القرض')
    },
  })
}

// Bulk delete
export const useBulkDeleteLoans = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteLoans(ids),
    onSuccess: (data) => {
      toast.success(`تم حذف ${data.deleted} قرض بنجاح`)
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف القروض')
    },
  })
}

// Submit application
export const useSubmitLoanApplication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (loanId: string) => submitLoanApplication(loanId),
    onSuccess: (_, loanId) => {
      toast.success('تم تقديم طلب القرض بنجاح')
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.pendingApprovals() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تقديم الطلب')
    },
  })
}

// Approve loan
export const useApproveLoan = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في اعتماد القرض')
    },
  })
}

// Reject loan
export const useRejectLoan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: { reason: string; comments?: string }
    }) => rejectLoan(loanId, data),
    onSuccess: (_, variables) => {
      toast.success('تم رفض القرض')
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.pendingApprovals() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في رفض القرض')
    },
  })
}

// Disburse loan
export const useDisburseLoan = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في صرف القرض')
    },
  })
}

// Record payment
export const useRecordPayment = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.overdueInstallments() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تسجيل السداد')
    },
  })
}

// Process payroll deduction
export const useProcessPayrollDeduction = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في خصم القسط')
    },
  })
}

// Process early settlement
export const useProcessEarlySettlement = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في السداد المبكر')
    },
  })
}

// Mark as defaulted
export const useMarkLoanDefaulted = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ loanId, data }: {
      loanId: string
      data: { defaultReason: string; notes?: string }
    }) => markLoanDefaulted(loanId, data),
    onSuccess: (_, variables) => {
      toast.warning('تم تصنيف القرض كمتعثر')
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
      queryClient.invalidateQueries({ queryKey: loanKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تصنيف القرض')
    },
  })
}

// Restructure loan
export const useRestructureLoan = () => {
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) })
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إعادة هيكلة القرض')
    },
  })
}

// Issue clearance letter
export const useIssueClearanceLetter = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (loanId: string) => issueClearanceLetter(loanId),
    onSuccess: (_, loanId) => {
      toast.success('تم إصدار خطاب إخلاء الطرف بنجاح')
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(loanId) })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إصدار خطاب إخلاء الطرف')
    },
  })
}
