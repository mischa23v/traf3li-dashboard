/**
 * Inter-Company Hooks
 * TanStack Query hooks for all inter-company operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import interCompanyService, {
  InterCompanyTransaction,
  InterCompanyTransactionFilters,
  CreateInterCompanyTransactionData,
  CreateReconciliationData,
  ReconciliationFilters,
  AdjustmentEntry,
} from '@/services/interCompanyService'

// ==================== Cache Configuration ====================
const CACHE_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const CACHE_GC_TIME = 30 * 60 * 1000 // 30 minutes

// ==================== TRANSACTIONS ====================

export const useInterCompanyTransactions = (filters?: InterCompanyTransactionFilters) => {
  return useQuery({
    queryKey: ['inter-company-transactions', filters],
    queryFn: () => interCompanyService.getTransactions(filters),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  })
}

export const useInterCompanyTransaction = (id: string) => {
  return useQuery({
    queryKey: ['inter-company-transactions', id],
    queryFn: () => interCompanyService.getTransaction(id),
    enabled: !!id,
  })
}

export const useCreateInterCompanyTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInterCompanyTransactionData) =>
      interCompanyService.createTransaction(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء المعاملة بين الشركات بنجاح', {
        description: data.autoCreatedCounterpart
          ? 'تم إنشاء المعاملة المقابلة تلقائياً'
          : undefined
      })
      queryClient.invalidateQueries({ queryKey: ['inter-company-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inter-company-balances'] })
    },
    onError: (error: Error) => {
      toast.error('فشل إنشاء المعاملة بين الشركات', {
        description: error.message
      })
    },
  })
}

export const useUpdateInterCompanyTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInterCompanyTransactionData> }) =>
      interCompanyService.updateTransaction(id, data),
    onSuccess: (data) => {
      toast.success('تم تحديث المعاملة بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inter-company-balances'] })
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث المعاملة', {
        description: error.message
      })
    },
  })
}

export const useDeleteInterCompanyTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => interCompanyService.deleteTransaction(id),
    onSuccess: () => {
      toast.success('تم حذف المعاملة بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inter-company-balances'] })
    },
    onError: (error: Error) => {
      toast.error('فشل حذف المعاملة', {
        description: error.message
      })
    },
  })
}

export const usePostInterCompanyTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => interCompanyService.postTransaction(id),
    onSuccess: () => {
      toast.success('تم ترحيل المعاملة بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inter-company-balances'] })
    },
    onError: (error: Error) => {
      toast.error('فشل ترحيل المعاملة', {
        description: error.message
      })
    },
  })
}

export const useCancelInterCompanyTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      interCompanyService.cancelTransaction(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء المعاملة بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inter-company-balances'] })
    },
    onError: (error: Error) => {
      toast.error('فشل إلغاء المعاملة', {
        description: error.message
      })
    },
  })
}

// ==================== BALANCES ====================

export const useInterCompanyBalances = (currency?: string) => {
  return useQuery({
    queryKey: ['inter-company-balances', currency],
    queryFn: () => interCompanyService.getBalances(currency),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  })
}

export const useInterCompanyBalanceBetween = (
  sourceFirmId: string,
  targetFirmId: string,
  currency?: string
) => {
  return useQuery({
    queryKey: ['inter-company-balance', sourceFirmId, targetFirmId, currency],
    queryFn: () => interCompanyService.getBalanceBetweenCompanies(sourceFirmId, targetFirmId, currency),
    enabled: !!sourceFirmId && !!targetFirmId,
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  })
}

export const useInterCompanyTransactionsBetween = (
  sourceFirmId: string,
  targetFirmId: string,
  filters?: Partial<InterCompanyTransactionFilters>
) => {
  return useQuery({
    queryKey: ['inter-company-transactions-between', sourceFirmId, targetFirmId, filters],
    queryFn: () => interCompanyService.getTransactionsBetweenCompanies(sourceFirmId, targetFirmId, filters),
    enabled: !!sourceFirmId && !!targetFirmId,
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  })
}

// ==================== RECONCILIATION ====================

export const useInterCompanyReconciliations = (filters?: ReconciliationFilters) => {
  return useQuery({
    queryKey: ['inter-company-reconciliations', filters],
    queryFn: () => interCompanyService.getReconciliations(filters),
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  })
}

export const useInterCompanyReconciliation = (id: string) => {
  return useQuery({
    queryKey: ['inter-company-reconciliations', id],
    queryFn: () => interCompanyService.getReconciliation(id),
    enabled: !!id,
  })
}

export const useCreateInterCompanyReconciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReconciliationData) =>
      interCompanyService.createReconciliation(data),
    onSuccess: () => {
      toast.success('تم إنشاء التسوية بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] })
    },
    onError: (error: Error) => {
      toast.error('فشل إنشاء التسوية', {
        description: error.message
      })
    },
  })
}

export const useAutoMatchTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reconciliationId: string) =>
      interCompanyService.autoMatchTransactions(reconciliationId),
    onSuccess: (data) => {
      toast.success('تم المطابقة التلقائية بنجاح', {
        description: `تم مطابقة ${data.matchedCount || 0} معاملة`
      })
      queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] })
    },
    onError: (error: Error) => {
      toast.error('فشلت المطابقة التلقائية', {
        description: error.message
      })
    },
  })
}

export const useManualMatchTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reconciliationId,
      sourceTransactionId,
      targetTransactionId
    }: {
      reconciliationId: string
      sourceTransactionId: string
      targetTransactionId: string
    }) =>
      interCompanyService.manualMatchTransactions(reconciliationId, sourceTransactionId, targetTransactionId),
    onSuccess: () => {
      toast.success('تم مطابقة المعاملات بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] })
    },
    onError: (error: Error) => {
      toast.error('فشلت المطابقة', {
        description: error.message
      })
    },
  })
}

export const useUnmatchTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reconciliationId, matchId }: { reconciliationId: string; matchId: string }) =>
      interCompanyService.unmatchTransactions(reconciliationId, matchId),
    onSuccess: () => {
      toast.success('تم إلغاء المطابقة بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] })
    },
    onError: (error: Error) => {
      toast.error('فشل إلغاء المطابقة', {
        description: error.message
      })
    },
  })
}

export const useCreateAdjustmentEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reconciliationId,
      adjustment
    }: {
      reconciliationId: string
      adjustment: Omit<AdjustmentEntry, '_id' | 'createdAt'>
    }) =>
      interCompanyService.createAdjustmentEntry(reconciliationId, adjustment),
    onSuccess: () => {
      toast.success('تم إنشاء قيد التسوية بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] })
    },
    onError: (error: Error) => {
      toast.error('فشل إنشاء قيد التسوية', {
        description: error.message
      })
    },
  })
}

export const useCompleteReconciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reconciliationId: string) =>
      interCompanyService.completeReconciliation(reconciliationId),
    onSuccess: () => {
      toast.success('تم إكمال التسوية بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] })
      queryClient.invalidateQueries({ queryKey: ['inter-company-balances'] })
    },
    onError: (error: Error) => {
      toast.error('فشل إكمال التسوية', {
        description: error.message
      })
    },
  })
}

export const useApproveReconciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reconciliationId: string) =>
      interCompanyService.approveReconciliation(reconciliationId),
    onSuccess: () => {
      toast.success('تم اعتماد التسوية بنجاح')
      queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] })
    },
    onError: (error: Error) => {
      toast.error('فشل اعتماد التسوية', {
        description: error.message
      })
    },
  })
}

// ==================== COMPANIES ====================

export const useInterCompanyCompanies = () => {
  return useQuery({
    queryKey: ['inter-company-firms'],
    queryFn: () => interCompanyService.getCompanies(),
    staleTime: 30 * 60 * 1000, // 30 minutes - companies don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// ==================== EXCHANGE RATES ====================

export const useExchangeRate = (fromCurrency: string, toCurrency: string, date?: string) => {
  return useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency, date],
    queryFn: () => interCompanyService.getExchangeRate(fromCurrency, toCurrency, date),
    enabled: !!fromCurrency && !!toCurrency && fromCurrency !== toCurrency,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

// ==================== REPORTS ====================

export const useInterCompanyReport = (params: {
  startDate: string
  endDate: string
  firmId?: string
  currency?: string
}) => {
  return useQuery({
    queryKey: ['inter-company-report', params],
    queryFn: () => interCompanyService.getInterCompanyReport(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: CACHE_STALE_TIME,
    gcTime: CACHE_GC_TIME,
  })
}

export const useExportInterCompanyReport = () => {
  return useMutation({
    mutationFn: (params: {
      reportType: 'transactions' | 'balances' | 'reconciliation'
      format: 'csv' | 'pdf' | 'excel'
      filters?: any
    }) => interCompanyService.exportReport(params),
    onSuccess: (data, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `inter-company-${variables.reportType}.${variables.format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('تم تصدير التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error('فشل تصدير التقرير', {
        description: error.message
      })
    },
  })
}
