/**
 * Finance Hooks
 * TanStack Query hooks for all finance operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Analytics } from '@/lib/analytics'
import financeService, {
  InvoiceFilters,
  ExpenseFilters,
  TimeEntryFilters,
  CreateInvoiceData,
  CreateExpenseData,
  CreateTimeEntryData,
  CreatePaymentData,
  CreateTransactionData,
  CreateTransactionPayload,
  CreditNoteFilters,
  CreateCreditNoteData,
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

      // Track analytics event
      Analytics.invoiceCreated(data.total || data.amount || 0, data.currency || 'SAR')

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
    onSuccess: (data) => {
      toast.success('تم إرسال الفاتورة بنجاح')

      // Track analytics event
      Analytics.invoiceSent(data?.total || data?.amount || 0)
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

// ==================== CREDIT NOTES ====================

export const useCreditNotes = (filters?: CreditNoteFilters) => {
  return useQuery({
    queryKey: ['creditNotes', filters],
    queryFn: () => financeService.getCreditNotes(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreditNote = (id: string) => {
  return useQuery({
    queryKey: ['creditNotes', id],
    queryFn: () => financeService.getCreditNote(id),
    enabled: !!id,
  })
}

export const useCreateCreditNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCreditNoteData) =>
      financeService.createCreditNote(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء إشعار الدائن بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['creditNotes'] }, (old: any) => {
        if (!old) return old

        // Handle { creditNotes: [...] } structure
        if (old.creditNotes && Array.isArray(old.creditNotes)) {
          return {
            ...old,
            creditNotes: [data, ...old.creditNotes],
            total: (old.total || old.creditNotes.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إشعار الدائن')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['creditNotes'], refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: ['invoices'], refetchType: 'all' })
    },
  })
}

export const useUpdateCreditNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCreditNoteData> }) =>
      financeService.updateCreditNote(id, data),
    onSuccess: () => {
      toast.success('تم تحديث إشعار الدائن بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إشعار الدائن')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['creditNotes'] })
      return await queryClient.invalidateQueries({ queryKey: ['creditNotes', id] })
    },
  })
}

export const useDeleteCreditNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.deleteCreditNote(id),
    onSuccess: (_, id) => {
      toast.success('تم حذف إشعار الدائن بنجاح')

      queryClient.setQueriesData({ queryKey: ['creditNotes'] }, (old: any) => {
        if (!old) return old

        if (old.creditNotes && Array.isArray(old.creditNotes)) {
          return {
            ...old,
            creditNotes: old.creditNotes.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.creditNotes.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف إشعار الدائن')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['creditNotes'], refetchType: 'all' })
    },
  })
}

export const useIssueCreditNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.issueCreditNote(id),
    onSuccess: () => {
      toast.success('تم إصدار إشعار الدائن بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إصدار إشعار الدائن')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['creditNotes'] })
      return await queryClient.invalidateQueries({ queryKey: ['creditNotes', id] })
    },
  })
}

export const useApplyCreditNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.applyCreditNote(id),
    onSuccess: () => {
      toast.success('تم تطبيق إشعار الدائن بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تطبيق إشعار الدائن')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['creditNotes'] })
      await queryClient.invalidateQueries({ queryKey: ['creditNotes', id] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export const useVoidCreditNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      financeService.voidCreditNote(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء إشعار الدائن بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء إشعار الدائن')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['creditNotes'] })
      return await queryClient.invalidateQueries({ queryKey: ['creditNotes', id] })
    },
  })
}

export const useCreditNotesForInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['creditNotes', 'invoice', invoiceId],
    queryFn: () => financeService.getCreditNotesForInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useSubmitCreditNoteToZATCA = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.submitCreditNoteToZATCA(id),
    onSuccess: () => {
      toast.success('تم إرسال إشعار الدائن إلى هيئة الزكاة والضريبة والجمارك')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال إشعار الدائن إلى هيئة الزكاة والضريبة والجمارك')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['creditNotes'] })
      return await queryClient.invalidateQueries({ queryKey: ['creditNotes', id] })
    },
  })
}

export const useExportCreditNotePdf = () => {
  return useMutation({
    mutationFn: (id: string) => financeService.exportCreditNotePdf(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `credit-note-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('تم تحميل إشعار الدائن بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحميل إشعار الدائن')
    },
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

// ==================== TIME ENTRY LOCKING ====================

export const useLockTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: 'approved' | 'billed' | 'period_closed' | 'manual' }) =>
      financeService.lockTimeEntry(id, reason),
    onSuccess: () => {
      toast.success('تم قفل سجل الوقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل قفل سجل الوقت')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries', id] })
    },
  })
}

export const useUnlockTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financeService.unlockTimeEntry(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء قفل سجل الوقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء قفل سجل الوقت')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries', id] })
    },
  })
}

export const useBulkLockTimeEntries = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      entryIds: string[]
      reason: 'approved' | 'billed' | 'period_closed' | 'manual'
    }) => financeService.bulkLockTimeEntries(data),
    onSuccess: (result) => {
      if (result.locked > 0) {
        toast.success(`تم قفل ${result.locked} سجل بنجاح`)
      }
      if (result.failed > 0) {
        toast.error(`فشل قفل ${result.failed} سجل`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل عملية القفل الجماعية')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
    },
  })
}

export const useCheckTimeEntryLock = (id: string) => {
  return useQuery({
    queryKey: ['timeEntries', id, 'lockStatus'],
    queryFn: () => financeService.isTimeEntryLocked(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useLockTimeEntriesByDateRange = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      startDate: string
      endDate: string
      reason: 'period_closed' | 'manual'
    }) => financeService.lockTimeEntriesByDateRange(data),
    onSuccess: (result) => {
      if (result.locked > 0) {
        toast.success(`تم قفل ${result.locked} سجل للفترة المحددة`)
      }
      if (result.failed > 0) {
        toast.error(`فشل قفل ${result.failed} سجل`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل قفل السجلات حسب الفترة')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
    },
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
    onSuccess: (result, data) => {
      toast.success('تم إنشاء الدفعة بنجاح')

      // Track analytics event
      Analytics.paymentReceived(data.amount || result?.amount || 0, data.method || 'bank_transfer')
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

// ==================== INVOICE APPROVAL WORKFLOW ====================

export const useInvoicesPendingApproval = (filters?: {
  status?: 'pending' | 'approved' | 'rejected'
  clientId?: string
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  approverId?: string
  level?: number
}) => {
  return useQuery({
    queryKey: ['invoices', 'pending-approval', filters],
    queryFn: () => financeService.getInvoicesPendingApproval(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useSubmitInvoiceForApproval = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, comments }: { invoiceId: string; comments?: string }) =>
      financeService.submitInvoiceForApproval(invoiceId, { comments }),
    onSuccess: () => {
      toast.success('تم إرسال الفاتورة للموافقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الفاتورة للموافقة')
    },
    onSettled: async (_, __, { invoiceId }) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approval'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export const useApproveInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, comments, approverLevel }: { invoiceId: string; comments?: string; approverLevel: number }) =>
      financeService.approveInvoice(invoiceId, { comments, approverLevel }),
    onSuccess: () => {
      toast.success('تم اعتماد الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل اعتماد الفاتورة')
    },
    onSettled: async (_, __, { invoiceId }) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approval'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approvals-count'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export const useRejectInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, reason, comments }: { invoiceId: string; reason: string; comments?: string }) =>
      financeService.rejectInvoice(invoiceId, { reason, comments }),
    onSuccess: () => {
      toast.success('تم رفض الفاتورة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض الفاتورة')
    },
    onSettled: async (_, __, { invoiceId }) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approval'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approvals-count'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export const useRequestInvoiceChanges = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, requestedChanges, comments }: { invoiceId: string; requestedChanges: string; comments?: string }) =>
      financeService.requestInvoiceChanges(invoiceId, { requestedChanges, comments }),
    onSuccess: () => {
      toast.success('تم إرسال طلب التعديلات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال طلب التعديلات')
    },
    onSettled: async (_, __, { invoiceId }) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approval'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export const useEscalateInvoiceApproval = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, reason, comments }: { invoiceId: string; reason: string; comments?: string }) =>
      financeService.escalateInvoiceApproval(invoiceId, { reason, comments }),
    onSuccess: () => {
      toast.success('تم رفع الفاتورة للمستوى التالي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع الفاتورة')
    },
    onSettled: async (_, __, { invoiceId }) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approval'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] })
    },
  })
}

export const useBulkApproveInvoices = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceIds, comments }: { invoiceIds: string[]; comments?: string }) =>
      financeService.bulkApproveInvoices({ invoiceIds, comments }),
    onSuccess: (data) => {
      toast.success(`تم اعتماد ${data.approved} فاتورة بنجاح`)
      if (data.failed > 0) {
        toast.error(`فشل اعتماد ${data.failed} فاتورة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل اعتماد الفواتير')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approval'] })
      return await queryClient.invalidateQueries({ queryKey: ['invoices', 'pending-approvals-count'] })
    },
  })
}

export const useApprovalWorkflowConfig = () => {
  return useQuery({
    queryKey: ['invoices', 'approval-config'],
    queryFn: () => financeService.getApprovalWorkflowConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateApprovalWorkflowConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: any) => financeService.updateApprovalWorkflowConfig(config),
    onSuccess: () => {
      toast.success('تم تحديث إعدادات الموافقات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إعدادات الموافقات')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['invoices', 'approval-config'] })
    },
  })
}

export const usePendingApprovalsCount = () => {
  return useQuery({
    queryKey: ['invoices', 'pending-approvals-count'],
    queryFn: () => financeService.getPendingApprovalsCount(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  })
}

// ==================== RECURRING INVOICES ====================

import recurringInvoiceService, {
  RecurringInvoiceFilters,
  CreateRecurringInvoiceData,
  UpdateRecurringInvoiceData,
} from '@/services/recurringInvoiceService'

export const useRecurringInvoices = (filters?: RecurringInvoiceFilters) => {
  return useQuery({
    queryKey: ['recurringInvoices', filters],
    queryFn: () => recurringInvoiceService.getAll(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useRecurringInvoice = (id: string) => {
  return useQuery({
    queryKey: ['recurringInvoices', id],
    queryFn: () => recurringInvoiceService.getById(id),
    enabled: !!id,
  })
}

export const useCreateRecurringInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecurringInvoiceData) =>
      recurringInvoiceService.create(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء الفاتورة المتكررة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['recurringInvoices'] }, (old: any) => {
        if (!old) return old

        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الفاتورة المتكررة')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'], refetchType: 'all' })
    },
  })
}

export const useUpdateRecurringInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringInvoiceData }) =>
      recurringInvoiceService.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الفاتورة المتكررة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الفاتورة المتكررة')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'] })
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices', id] })
    },
  })
}

export const useDeleteRecurringInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringInvoiceService.delete(id),
    onSuccess: (_, id) => {
      toast.success('تم حذف الفاتورة المتكررة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['recurringInvoices'] }, (old: any) => {
        if (!old) return old

        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.data.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الفاتورة المتكررة')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'], refetchType: 'all' })
    },
  })
}

export const usePauseRecurringInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringInvoiceService.pause(id),
    onSuccess: () => {
      toast.success('تم إيقاف الفاتورة المتكررة مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف الفاتورة المتكررة')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'] })
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices', id] })
    },
  })
}

export const useResumeRecurringInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringInvoiceService.resume(id),
    onSuccess: () => {
      toast.success('تم استئناف الفاتورة المتكررة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استئناف الفاتورة المتكررة')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'] })
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices', id] })
    },
  })
}

export const useCancelRecurringInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringInvoiceService.cancel(id),
    onSuccess: () => {
      toast.success('تم إلغاء الفاتورة المتكررة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الفاتورة المتكررة')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'] })
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices', id] })
    },
  })
}

export const useGenerateFromRecurring = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringInvoiceService.generateNext(id),
    onSuccess: () => {
      toast.success('تم إنشاء الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الفاتورة')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'] })
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices', id] })
    },
  })
}

export const useRecurringInvoiceStats = () => {
  return useQuery({
    queryKey: ['recurringInvoices', 'stats'],
    queryFn: () => recurringInvoiceService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useRecurringInvoiceHistory = (id: string) => {
  return useQuery({
    queryKey: ['recurringInvoices', id, 'history'],
    queryFn: () => recurringInvoiceService.getHistory(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export const usePreviewNextInvoice = (id: string) => {
  return useQuery({
    queryKey: ['recurringInvoices', id, 'preview'],
    queryFn: () => recurringInvoiceService.previewNext(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  })
}

export const useDuplicateRecurringInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name, nameAr }: { id: string; name: string; nameAr?: string }) =>
      recurringInvoiceService.duplicate(id, name, nameAr),
    onSuccess: () => {
      toast.success('تم نسخ الفاتورة المتكررة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ الفاتورة المتكررة')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['recurringInvoices'], refetchType: 'all' })
    },
  })
}
