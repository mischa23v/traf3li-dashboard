/**
 * Finance Hooks
 * TanStack Query hooks for all finance operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import financeService, {
  InvoiceFilters,
  ExpenseFilters,
  TimeEntryFilters,
  CreateInvoiceData,
  CreateExpenseData,
  CreateTimeEntryData,
  CreatePaymentData,
  CreateTransactionData,
} from '@/services/financeService'

// ==================== INVOICES ====================

export const useInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => financeService.getInvoices(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => financeService.getInvoice(id),
    enabled: !!id,
  })
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInvoiceData) =>
      financeService.createInvoice(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['invoices'] })
      toast.success('تم إنشاء الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الفاتورة')
    },
  })
}

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInvoiceData> }) =>
      financeService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.refetchQueries({ queryKey: ['invoices'] })
      queryClient.refetchQueries({ queryKey: ['invoices', id] })
      toast.success('تم تحديث الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الفاتورة')
    },
  })
}

export const useSendInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.sendInvoice(id),
    onSuccess: (_, id) => {
      queryClient.refetchQueries({ queryKey: ['invoices'] })
      queryClient.refetchQueries({ queryKey: ['invoices', id] })
      toast.success('تم إرسال الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الفاتورة')
    },
  })
}

export const useOverdueInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'overdue'],
    queryFn: () => financeService.getOverdueInvoices(),
    staleTime: 2 * 60 * 1000,
  })
}

// ==================== EXPENSES ====================

export const useExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => financeService.getExpenses(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => financeService.getExpense(id),
    enabled: !!id,
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseData) =>
      financeService.createExpense(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['expenses'] })
      toast.success('تم إنشاء المصروف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المصروف')
    },
  })
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseData> }) =>
      financeService.updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.refetchQueries({ queryKey: ['expenses'] })
      queryClient.refetchQueries({ queryKey: ['expenses', id] })
      toast.success('تم تحديث المصروف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المصروف')
    },
  })
}

export const useUploadReceipt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      financeService.uploadReceipt(id, file),
    onSuccess: (_, { id }) => {
      queryClient.refetchQueries({ queryKey: ['expenses', id] })
      toast.success('تم رفع الإيصال بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع الإيصال')
    },
  })
}

export const useExpenseStats = (filters?: {
  startDate?: string
  endDate?: string
  caseId?: string
}) => {
  return useQuery({
    queryKey: ['expenses', 'stats', filters],
    queryFn: () => financeService.getExpenseStats(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== TIME TRACKING ====================

export const useTimerStatus = () => {
  return useQuery({
    queryKey: ['timer', 'status'],
    queryFn: () => financeService.getTimerStatus(),
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
    staleTime: 5 * 1000, // 5 seconds
  })
}

export const useStartTimer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      caseId: string
      clientId: string
      activityCode?: string
      description: string
    }) => financeService.startTimer(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['timer'] })
      toast.success('تم بدء المؤقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل بدء المؤقت')
    },
  })
}

export const usePauseTimer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => financeService.pauseTimer(),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['timer'] })
      toast.success('تم إيقاف المؤقت مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف المؤقت')
    },
  })
}

export const useResumeTimer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => financeService.resumeTimer(),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['timer'] })
      toast.success('تم استئناف المؤقت')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استئناف المؤقت')
    },
  })
}

export const useStopTimer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { notes?: string; isBillable?: boolean }) =>
      financeService.stopTimer(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['timer'] })
      queryClient.refetchQueries({ queryKey: ['timeEntries'] })
      toast.success('تم إيقاف المؤقت وإنشاء إدخال الوقت')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف المؤقت')
    },
  })
}

export const useTimeEntries = (filters?: TimeEntryFilters) => {
  return useQuery({
    queryKey: ['timeEntries', filters],
    queryFn: () => financeService.getTimeEntries(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTimeEntryData) =>
      financeService.createTimeEntry(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['timeEntries'] })
      toast.success('تم إنشاء إدخال الوقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إدخال الوقت')
    },
  })
}

export const useTimeEntry = (id: string) => {
  return useQuery({
    queryKey: ['timeEntries', id],
    queryFn: () => financeService.getTimeEntry(id),
    enabled: !!id,
  })
}

export const useTimeStats = (filters?: {
  startDate?: string
  endDate?: string
  caseId?: string
}) => {
  return useQuery({
    queryKey: ['timeEntries', 'stats', filters],
    queryFn: () => financeService.getTimeStats(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== PAYMENTS ====================

export const usePayments = (filters?: any) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => financeService.getPayments(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentData) =>
      financeService.createPayment(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['payments'] })
      queryClient.refetchQueries({ queryKey: ['invoices'] })
      toast.success('تم إنشاء الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الدفعة')
    },
  })
}

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => financeService.getPayment(id),
    enabled: !!id,
  })
}

export const useCompletePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.completePayment(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['payments'] })
      queryClient.refetchQueries({ queryKey: ['invoices'] })
      toast.success('تم إكمال الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال الدفعة')
    },
  })
}

export const useRecordPaymentForInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: any }) =>
      financeService.recordPaymentForInvoice(invoiceId, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['payments'] })
      queryClient.refetchQueries({ queryKey: ['invoices'] })
      toast.success('تم تسجيل الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الدفعة')
    },
  })
}

export const usePaymentsSummary = (filters?: any) => {
  return useQuery({
    queryKey: ['payments', 'summary', filters],
    queryFn: () => financeService.getPaymentsSummary(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== TRANSACTIONS ====================

export const useTransactions = (filters?: any) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => financeService.getTransactions(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => financeService.getTransaction(id),
    enabled: !!id,
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionData) =>
      financeService.createTransaction(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['transactions'] })
      toast.success('تم إنشاء المعاملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المعاملة')
    },
  })
}

export const useAccountBalance = (upToDate?: string) => {
  return useQuery({
    queryKey: ['transactions', 'balance', upToDate],
    queryFn: () => financeService.getAccountBalance(upToDate),
    staleTime: 1 * 60 * 1000,
  })
}

export const useTransactionSummary = (filters?: any) => {
  return useQuery({
    queryKey: ['transactions', 'summary', filters],
    queryFn: () => financeService.getTransactionSummary(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== STATEMENTS ====================

export const useStatements = (filters?: any) => {
  return useQuery({
    queryKey: ['statements', filters],
    queryFn: () => financeService.getStatements(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useStatement = (id: string) => {
  return useQuery({
    queryKey: ['statements', id],
    queryFn: () => financeService.getStatement(id),
    enabled: !!id,
  })
}

export const useCreateStatement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => financeService.createStatement(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['statements'] })
      toast.success('تم إنشاء الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الكشف الحسابي')
    },
  })
}

export const useUpdateStatement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      financeService.updateStatement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.refetchQueries({ queryKey: ['statements'] })
      queryClient.refetchQueries({ queryKey: ['statements', id] })
      toast.success('تم تحديث الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الكشف الحسابي')
    },
  })
}

export const useDeleteStatement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteStatement(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['statements'] })
      toast.success('تم حذف الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الكشف الحسابي')
    },
  })
}

export const useSendStatement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.sendStatement(id),
    onSuccess: (_, id) => {
      queryClient.refetchQueries({ queryKey: ['statements'] })
      queryClient.refetchQueries({ queryKey: ['statements', id] })
      toast.success('تم إرسال الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الكشف الحسابي')
    },
  })
}

// ==================== ACTIVITIES ====================

export const useActivities = (filters?: any) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => financeService.getActivities(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => financeService.getActivity(id),
    enabled: !!id,
  })
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => financeService.createActivity(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['activities'] })
      toast.success('تم إنشاء النشاط المالي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء النشاط المالي')
    },
  })
}

// ==================== REPORTS ====================

export const useAccountsAgingReport = (filters?: { clientId?: string }) => {
  return useQuery({
    queryKey: ['reports', 'accounts-aging', filters],
    queryFn: () => financeService.getAccountsAgingReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useRevenueByClientReport = (filters?: { startDate?: string; endDate?: string; clientId?: string }) => {
  return useQuery({
    queryKey: ['reports', 'revenue-by-client', filters],
    queryFn: () => financeService.getRevenueByClientReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useOutstandingInvoicesReport = (filters?: { clientId?: string }) => {
  return useQuery({
    queryKey: ['reports', 'outstanding-invoices', filters],
    queryFn: () => financeService.getOutstandingInvoicesReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTimeEntriesReport = (filters?: { startDate?: string; endDate?: string; clientId?: string; caseId?: string }) => {
  return useQuery({
    queryKey: ['reports', 'time-entries', filters],
    queryFn: () => financeService.getTimeEntriesReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ reportType, format, filters }: { reportType: string; format: 'csv' | 'pdf'; filters?: any }) =>
      financeService.exportReport(reportType, format, filters),
    onSuccess: (blob, { reportType, format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-report.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير التقرير')
    },
  })
}

export const useWeeklyTimeEntries = (weekStartDate: string) => {
  return useQuery({
    queryKey: ['timeEntries', 'weekly', weekStartDate],
    queryFn: () => financeService.getWeeklyTimeEntries(weekStartDate),
    staleTime: 2 * 60 * 1000,
    enabled: !!weekStartDate,
  })
}

// ==================== DELETE MUTATIONS ====================

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['invoices'] })
      toast.success('تم حذف الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الفاتورة')
    },
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteExpense(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['expenses'] })
      toast.success('تم حذف المصروف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المصروف')
    },
  })
}

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTimeEntryData> }) =>
      financeService.updateTimeEntry(id, data),
    onSuccess: (_, { id }) => {
      queryClient.refetchQueries({ queryKey: ['timeEntries'] })
      queryClient.refetchQueries({ queryKey: ['timeEntries', id] })
      toast.success('تم تحديث إدخال الوقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إدخال الوقت')
    },
  })
}

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['timeEntries'] })
      toast.success('تم حذف إدخال الوقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف إدخال الوقت')
    },
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) =>
      financeService.updateTransaction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.refetchQueries({ queryKey: ['transactions'] })
      queryClient.refetchQueries({ queryKey: ['transactions', id] })
      toast.success('تم تحديث المعاملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المعاملة')
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['transactions'] })
      toast.success('تم حذف المعاملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المعاملة')
    },
  })
}

export const useDownloadStatement = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'xlsx' }) =>
      financeService.downloadStatement(id, format),
    onSuccess: (blob, { id, format }) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `statement-${id}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('تم تحميل الكشف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحميل الكشف')
    },
  })
}

// ==================== ACCOUNT ACTIVITY ====================

export const useAccountActivity = (id: string) => {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => financeService.getActivity(id),
    enabled: !!id,
  })
}

export const useUpdateAccountActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      financeService.updateActivity(id, data),
    onSuccess: (_, { id }) => {
      queryClient.refetchQueries({ queryKey: ['activities'] })
      queryClient.refetchQueries({ queryKey: ['activities', id] })
      toast.success('تم تحديث النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث النشاط')
    },
  })
}

export const useDeleteAccountActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteActivity(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['activities'] })
      toast.success('تم حذف النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف النشاط')
    },
  })
}
