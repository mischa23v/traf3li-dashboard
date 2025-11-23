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
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
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
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
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
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
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
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
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
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses', id] })
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
      queryClient.invalidateQueries({ queryKey: ['expenses', id] })
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
      queryClient.invalidateQueries({ queryKey: ['timer'] })
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
      queryClient.invalidateQueries({ queryKey: ['timer'] })
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
      queryClient.invalidateQueries({ queryKey: ['timer'] })
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
      queryClient.invalidateQueries({ queryKey: ['timer'] })
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
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
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
      toast.success('تم إنشاء إدخال الوقت بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء إدخال الوقت')
    },
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
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('تم إنشاء الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الدفعة')
    },
  })
}

export const useCompletePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => financeService.completePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('تم إكمال الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال الدفعة')
    },
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

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionData) =>
      financeService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
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
