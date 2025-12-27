/**
 * Corporate Card Hooks
 * TanStack Query hooks for all corporate card operations
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
import corporateCardService from '@/services/corporateCardService'
import type {
  CorporateCardFilters,
  CardTransactionFilters,
  CreateCorporateCardData,
  UpdateCorporateCardData,
  CreateCardTransactionData,
  ReconcileTransactionData,
} from '@/features/finance/types/corporate-card-types'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== CORPORATE CARDS ====================

export const useCorporateCards = (filters?: CorporateCardFilters) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.list(filters),
    queryFn: () => corporateCardService.getCorporateCards(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCorporateCard = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.detail(id),
    queryFn: () => corporateCardService.getCorporateCard(id),
    enabled: !!id,
  })
}

export const useCreateCorporateCard = () => {
  return useMutation({
    mutationFn: (data: CreateCorporateCardData) =>
      corporateCardService.createCorporateCard(data),
    onSuccess: () => {
      toast.success('تم إنشاء البطاقة بنجاح')
      invalidateCache.corporateCards.all()
    },
    onError: (error: Error) => {
      toast.error(`فشل إنشاء البطاقة: ${error.message}`)
    },
  })
}

export const useUpdateCorporateCard = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCorporateCardData }) =>
      corporateCardService.updateCorporateCard(id, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث البطاقة بنجاح')
      invalidateCache.corporateCards.all()
      invalidateCache.corporateCards.detail(variables.id)
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث البطاقة: ${error.message}`)
    },
  })
}

export const useDeleteCorporateCard = () => {
  return useMutation({
    mutationFn: (id: string) => corporateCardService.deleteCorporateCard(id),
    onSuccess: () => {
      toast.success('تم حذف البطاقة بنجاح')
      invalidateCache.corporateCards.all()
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف البطاقة: ${error.message}`)
    },
  })
}

export const useBlockCorporateCard = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      corporateCardService.blockCorporateCard(id, reason),
    onSuccess: (_, variables) => {
      toast.success('تم حظر البطاقة بنجاح')
      invalidateCache.corporateCards.all()
      invalidateCache.corporateCards.detail(variables.id)
    },
    onError: (error: Error) => {
      toast.error(`فشل حظر البطاقة: ${error.message}`)
    },
  })
}

export const useUnblockCorporateCard = () => {
  return useMutation({
    mutationFn: (id: string) => corporateCardService.unblockCorporateCard(id),
    onSuccess: (_, id) => {
      toast.success('تم إلغاء حظر البطاقة بنجاح')
      invalidateCache.corporateCards.all()
      invalidateCache.corporateCards.detail(id)
    },
    onError: (error: Error) => {
      toast.error(`فشل إلغاء حظر البطاقة: ${error.message}`)
    },
  })
}

// ==================== CARD TRANSACTIONS ====================

export const useCardTransactions = (filters?: CardTransactionFilters) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.transactionList(filters),
    queryFn: () => corporateCardService.getCardTransactions(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCardTransaction = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.transactionDetail(id),
    queryFn: () => corporateCardService.getCardTransaction(id),
    enabled: !!id,
  })
}

export const useCreateCardTransaction = () => {
  return useMutation({
    mutationFn: (data: CreateCardTransactionData) =>
      corporateCardService.createCardTransaction(data),
    onSuccess: () => {
      toast.success('تم إضافة المعاملة بنجاح')
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.statistics()
    },
    onError: (error: Error) => {
      toast.error(`فشل إضافة المعاملة: ${error.message}`)
    },
  })
}

export const useUpdateCardTransaction = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCardTransactionData> }) =>
      corporateCardService.updateCardTransaction(id, data),
    onSuccess: (_, variables) => {
      toast.success('تم تحديث المعاملة بنجاح')
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.transactionDetail(variables.id)
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث المعاملة: ${error.message}`)
    },
  })
}

export const useDeleteCardTransaction = () => {
  return useMutation({
    mutationFn: (id: string) => corporateCardService.deleteCardTransaction(id),
    onSuccess: () => {
      toast.success('تم حذف المعاملة بنجاح')
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.statistics()
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف المعاملة: ${error.message}`)
    },
  })
}

export const useUnreconciledTransactions = (cardId?: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.unreconciledTransactions(cardId),
    queryFn: () => corporateCardService.getUnreconciledTransactions(cardId),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useDisputedTransactions = (cardId?: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.disputedTransactions(cardId),
    queryFn: () => corporateCardService.getDisputedTransactions(cardId),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ==================== RECONCILIATION ====================

export const useReconcileTransaction = () => {
  return useMutation({
    mutationFn: (data: ReconcileTransactionData) =>
      corporateCardService.reconcileTransaction(data),
    onSuccess: () => {
      toast.success('تم تطابق المعاملة بنجاح')
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.statistics()
    },
    onError: (error: Error) => {
      toast.error(`فشل تطابق المعاملة: ${error.message}`)
    },
  })
}

export const useBulkReconcileTransactions = () => {
  return useMutation({
    mutationFn: (reconciliations: ReconcileTransactionData[]) =>
      corporateCardService.bulkReconcileTransactions(reconciliations),
    onSuccess: (result) => {
      toast.success(`تم تطابق ${result.success} معاملة بنجاح`)
      if (result.failed > 0) {
        toast.warning(`فشل تطابق ${result.failed} معاملة`)
      }
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.statistics()
    },
    onError: (error: Error) => {
      toast.error(`فشل التطابق الجماعي: ${error.message}`)
    },
  })
}

export const useMatchTransactionToExpense = () => {
  return useMutation({
    mutationFn: ({ transactionId, expenseClaimId }: { transactionId: string; expenseClaimId: string }) =>
      corporateCardService.matchTransactionToExpense(transactionId, expenseClaimId),
    onSuccess: () => {
      toast.success('تم ربط المعاملة بالمصروف بنجاح')
      invalidateCache.corporateCards.transactions()
    },
    onError: (error: Error) => {
      toast.error(`فشل ربط المعاملة: ${error.message}`)
    },
  })
}

export const usePotentialMatches = (transactionId: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.potentialMatches(transactionId),
    queryFn: () => corporateCardService.findPotentialMatches(transactionId),
    enabled: !!transactionId,
  })
}

export const useDisputeTransaction = () => {
  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      corporateCardService.disputeTransaction(transactionId, reason),
    onSuccess: () => {
      toast.success('تم الاعتراض على المعاملة بنجاح')
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.statistics()
    },
    onError: (error: Error) => {
      toast.error(`فشل الاعتراض على المعاملة: ${error.message}`)
    },
  })
}

export const useResolveDispute = () => {
  return useMutation({
    mutationFn: ({ transactionId, resolution }: { transactionId: string; resolution: string }) =>
      corporateCardService.resolveDispute(transactionId, resolution),
    onSuccess: () => {
      toast.success('تم حل الاعتراض بنجاح')
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.statistics()
    },
    onError: (error: Error) => {
      toast.error(`فشل حل الاعتراض: ${error.message}`)
    },
  })
}

// ==================== CSV IMPORT ====================

export const useImportTransactionsCSV = () => {
  return useMutation({
    mutationFn: ({ cardId, file }: { cardId: string; file: File }) =>
      corporateCardService.importTransactionsCSV(cardId, file),
    onSuccess: (result) => {
      toast.success(`تم استيراد ${result.importedRecords} معاملة بنجاح`)
      if (result.duplicateRecords > 0) {
        toast.info(`تم تجاهل ${result.duplicateRecords} معاملة مكررة`)
      }
      if (result.errorRecords > 0) {
        toast.warning(`فشل استيراد ${result.errorRecords} معاملة`)
      }
      invalidateCache.corporateCards.transactions()
      invalidateCache.corporateCards.statistics()
    },
    onError: (error: Error) => {
      toast.error(`فشل استيراد الملف: ${error.message}`)
    },
  })
}

// ==================== STATISTICS & REPORTS ====================

export const useCardStatistics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.statisticsWithDates(startDate, endDate),
    queryFn: () => corporateCardService.getCardStatistics(startDate, endDate),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useReconciliationReport = (cardId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.reconciliationReport(cardId, startDate, endDate),
    queryFn: () => corporateCardService.getReconciliationReport(cardId, startDate, endDate),
    enabled: !!(startDate && endDate),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useSpendingByCategory = (cardId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.spendingByCategory(cardId, startDate, endDate),
    queryFn: () => corporateCardService.getSpendingByCategory(cardId, startDate, endDate),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useSpendingByCard = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.spendingByCard(startDate, endDate),
    queryFn: () => corporateCardService.getSpendingByCard(startDate, endDate),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useMonthlySpendingTrend = (cardId?: string, months: number = 6) => {
  return useQuery({
    queryKey: QueryKeys.corporateCards.monthlySpendingTrend(cardId, months),
    queryFn: () => corporateCardService.getMonthlySpendingTrend(cardId, months),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useExportReconciliationReport = () => {
  return useMutation({
    mutationFn: ({ cardId, startDate, endDate, format }: { cardId?: string; startDate?: string; endDate?: string; format: 'pdf' | 'excel' }) =>
      corporateCardService.exportReconciliationReport(cardId, startDate, endDate, format),
    onSuccess: (blob, variables) => {
      // Download the file
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reconciliation-report.${variables.format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تصدير التقرير: ${error.message}`)
    },
  })
}

export const useDownloadCSVTemplate = () => {
  return useMutation({
    mutationFn: () => corporateCardService.downloadCSVTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'corporate-card-transactions-template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('تم تحميل القالب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تحميل القالب: ${error.message}`)
    },
  })
}
