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
  InvestmentFilters,
  CreateInvestmentData,
  CreateTransactionPayload,
  Investment,
  InvestmentsResponse,
  InvestmentTransaction,
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء الفاتورة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['invoices'] }, (old: any) => {
        if (!old) return old

        // Handle { invoices: [...] } structure
        if (old.invoices && Array.isArray(old.invoices)) {
          return {
            ...old,
            invoices: [data, ...old.invoices],
            total: (old.total || old.invoices.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الفاتورة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['invoices'], refetchType: 'all' })
    },
  })
}

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInvoiceData> }) =>
      financeService.updateInvoice(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الفاتورة')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', id] })
    },
  })
}

export const useSendInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.sendInvoice(id),
    onSuccess: () => {
      toast.success('تم إرسال الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الفاتورة')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', id] })
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء المصروف بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['expenses'] }, (old: any) => {
        if (!old) return old

        // Handle { expenses: [...] } structure
        if (old.expenses && Array.isArray(old.expenses)) {
          return {
            ...old,
            expenses: [data, ...old.expenses],
            total: (old.total || old.expenses.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المصروف')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['expenses'], refetchType: 'all' })
    },
  })
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseData> }) =>
      financeService.updateExpense(id, data),
    onSuccess: () => {
      toast.success('تم تحديث المصروف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المصروف')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['expenses'] })
      return await queryClient.invalidateQueries({ queryKey: ['expenses', id] })
    },
  })
}

export const useUploadReceipt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      financeService.uploadReceipt(id, file),
    onSuccess: () => {
      toast.success('تم رفع الإيصال بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع الإيصال')
    },
    onSettled: async (_, __, { id }) => {
      return await queryClient.invalidateQueries({ queryKey: ['expenses', id] })
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
      toast.success('تم بدء المؤقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل بدء المؤقت')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['timer'] })
    },
  })
}

export const usePauseTimer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => financeService.pauseTimer(),
    onSuccess: () => {
      toast.success('تم إيقاف المؤقت مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف المؤقت')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['timer'] })
    },
  })
}

export const useResumeTimer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => financeService.resumeTimer(),
    onSuccess: () => {
      toast.success('تم استئناف المؤقت')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استئناف المؤقت')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['timer'] })
    },
  })
}

export const useStopTimer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { notes?: string; isBillable?: boolean }) =>
      financeService.stopTimer(data),
    onSuccess: () => {
      toast.success('تم إيقاف المؤقت وإنشاء إدخال الوقت')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف المؤقت')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['timer'] })
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء إدخال الوقت بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['timeEntries'] }, (old: any) => {
        if (!old) return old

        // Handle { timeEntries: [...] } structure
        if (old.timeEntries && Array.isArray(old.timeEntries)) {
          return {
            ...old,
            timeEntries: [data, ...old.timeEntries],
            total: (old.total || old.timeEntries.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إدخال الوقت')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries'], refetchType: 'all' })
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
      toast.success('تم إنشاء الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الدفعة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payments'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices'] })
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
      toast.success('تم إكمال الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال الدفعة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payments'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export const useRecordPaymentForInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: any }) =>
      financeService.recordPaymentForInvoice(invoiceId, data),
    onSuccess: () => {
      toast.success('تم تسجيل الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الدفعة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payments'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices'] })
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء المعاملة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: any) => {
        if (!old) return old

        // Handle { transactions: [...] } structure
        if (old.transactions && Array.isArray(old.transactions)) {
          return {
            ...old,
            transactions: [data, ...old.transactions],
            total: (old.total || old.transactions.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المعاملة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['transactions'], refetchType: 'all' })
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
      toast.success('تم إنشاء الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الكشف الحسابي')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['statements'] })
    },
  })
}

export const useUpdateStatement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      financeService.updateStatement(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الكشف الحسابي')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['statements'] })
      return await queryClient.invalidateQueries({ queryKey: ['statements', id] })
    },
  })
}

export const useDeleteStatement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteStatement(id),
    onSuccess: () => {
      toast.success('تم حذف الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الكشف الحسابي')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['statements'] })
    },
  })
}

export const useSendStatement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.sendStatement(id),
    onSuccess: () => {
      toast.success('تم إرسال الكشف الحسابي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الكشف الحسابي')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['statements'] })
      return await queryClient.invalidateQueries({ queryKey: ['statements', id] })
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
      toast.success('تم إنشاء النشاط المالي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء النشاط المالي')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['activities'] })
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
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف الفاتورة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['invoices'] }, (old: any) => {
        if (!old) return old

        // Handle { invoices: [...] } structure
        if (old.invoices && Array.isArray(old.invoices)) {
          return {
            ...old,
            invoices: old.invoices.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.invoices.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الفاتورة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['invoices'], refetchType: 'all' })
    },
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteExpense(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف المصروف بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['expenses'] }, (old: any) => {
        if (!old) return old

        // Handle { expenses: [...] } structure
        if (old.expenses && Array.isArray(old.expenses)) {
          return {
            ...old,
            expenses: old.expenses.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.expenses.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المصروف')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['expenses'], refetchType: 'all' })
    },
  })
}

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTimeEntryData> }) =>
      financeService.updateTimeEntry(id, data),
    onSuccess: () => {
      toast.success('تم تحديث إدخال الوقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إدخال الوقت')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries', id] })
    },
  })
}

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteTimeEntry(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف إدخال الوقت بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['timeEntries'] }, (old: any) => {
        if (!old) return old

        // Handle { timeEntries: [...] } structure
        if (old.timeEntries && Array.isArray(old.timeEntries)) {
          return {
            ...old,
            timeEntries: old.timeEntries.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.timeEntries.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف إدخال الوقت')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries'], refetchType: 'all' })
    },
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) =>
      financeService.updateTransaction(id, data),
    onSuccess: () => {
      toast.success('تم تحديث المعاملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المعاملة')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      return await queryClient.invalidateQueries({ queryKey: ['transactions', id] })
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteTransaction(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف المعاملة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: any) => {
        if (!old) return old

        // Handle { transactions: [...] } structure
        if (old.transactions && Array.isArray(old.transactions)) {
          return {
            ...old,
            transactions: old.transactions.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.transactions.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المعاملة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['transactions'], refetchType: 'all' })
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
    onSuccess: () => {
      toast.success('تم تحديث النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث النشاط')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activities', id] })
    },
  })
}

export const useDeleteAccountActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteActivity(id),
    onSuccess: () => {
      toast.success('تم حذف النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف النشاط')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

// ==================== INVESTMENTS ====================

/**
 * Fetch all investments with portfolio summary
 */
export const useInvestments = (filters?: InvestmentFilters) => {
  return useQuery({
    queryKey: ['investments', filters],
    queryFn: () => financeService.getInvestments(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Fetch single investment by ID
 */
export const useInvestment = (id: string) => {
  return useQuery({
    queryKey: ['investments', id],
    queryFn: () => financeService.getInvestment(id),
    enabled: !!id,
  })
}

/**
 * Create new investment
 */
export const useCreateInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInvestmentData) =>
      financeService.createInvestment(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء الاستثمار بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['investments'] }, (old: any) => {
        if (!old) return old

        if (old.investments && Array.isArray(old.investments)) {
          return {
            ...old,
            investments: [data, ...old.investments],
          }
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الاستثمار')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['investments'], refetchType: 'all' })
    },
  })
}

/**
 * Update investment
 */
export const useUpdateInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInvestmentData> }) =>
      financeService.updateInvestment(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الاستثمار بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الاستثمار')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['investments'] })
      return await queryClient.invalidateQueries({ queryKey: ['investments', id] })
    },
  })
}

/**
 * Delete investment
 */
export const useDeleteInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteInvestment(id),
    onSuccess: () => {
      toast.success('تم حذف الاستثمار بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الاستثمار')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}

/**
 * Fetch portfolio summary
 */
export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: ['investments', 'summary'],
    queryFn: () => financeService.getPortfolioSummary(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Fetch investment transactions
 */
export const useInvestmentTransactions = (investmentId: string) => {
  return useQuery({
    queryKey: ['investments', investmentId, 'transactions'],
    queryFn: () => financeService.getInvestmentTransactions(investmentId),
    enabled: !!investmentId,
  })
}

/**
 * Add transaction to investment (dividend, purchase, or sale)
 */
export const useAddInvestmentTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ investmentId, data }: { investmentId: string; data: CreateTransactionPayload }) =>
      financeService.addInvestmentTransaction(investmentId, data),
    onSuccess: (_, { data }) => {
      const messages: Record<string, string> = {
        dividend: 'تم تسجيل التوزيعات بنجاح',
        purchase: 'تم تسجيل عملية الشراء بنجاح',
        sale: 'تم تسجيل عملية البيع بنجاح',
      }
      toast.success(messages[data.type] || 'تم تسجيل العملية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل العملية')
    },
    onSettled: async (_, __, { investmentId }) => {
      await queryClient.invalidateQueries({ queryKey: ['investments'] })
      await queryClient.invalidateQueries({ queryKey: ['investments', investmentId] })
      return await queryClient.invalidateQueries({ queryKey: ['investments', investmentId, 'transactions'] })
    },
  })
}

/**
 * Refresh single investment price from market
 */
export const useRefreshInvestmentPrice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (investmentId: string) =>
      financeService.refreshInvestmentPrice(investmentId),
    onSuccess: () => {
      toast.success('تم تحديث السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث السعر')
    },
    onSettled: async (_, __, investmentId) => {
      await queryClient.invalidateQueries({ queryKey: ['investments'] })
      return await queryClient.invalidateQueries({ queryKey: ['investments', investmentId] })
    },
  })
}

/**
 * Refresh all investment prices
 */
export const useRefreshAllPrices = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => financeService.refreshAllPrices(),
    onSuccess: (result) => {
      toast.success(`تم تحديث ${result.updated} سعر بنجاح`)
      if (result.errors > 0) {
        toast.warning(`فشل تحديث ${result.errors} سعر`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الأسعار')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}

/**
 * Search for stock symbols
 */
export const useSearchSymbols = (query: string) => {
  return useQuery({
    queryKey: ['symbols', 'search', query],
    queryFn: () => financeService.searchSymbols(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get stock quote
 */
export const useStockQuote = (symbol: string) => {
  return useQuery({
    queryKey: ['symbols', 'quote', symbol],
    queryFn: () => financeService.getQuote(symbol),
    enabled: !!symbol,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Sell investment (full or partial)
 */
export const useSellInvestment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ investmentId, data }: { investmentId: string; data: { quantity: number; salePrice: number; saleDate: string; fees?: number } }) =>
      financeService.sellInvestment(investmentId, data),
    onSuccess: () => {
      toast.success('تم بيع الاستثمار بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل بيع الاستثمار')
    },
    onSettled: async (_, __, { investmentId }) => {
      await queryClient.invalidateQueries({ queryKey: ['investments'] })
      await queryClient.invalidateQueries({ queryKey: ['investments', investmentId] })
      return await queryClient.invalidateQueries({ queryKey: ['investments', investmentId, 'transactions'] })
    },
  })
}
