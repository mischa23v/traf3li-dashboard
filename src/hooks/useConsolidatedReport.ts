/**
 * Consolidated Report Hooks
 * React Query hooks for multi-company consolidated reporting
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
import consolidatedReportService, {
  type ConsolidationFilters,
  type EliminationRule,
  type CurrencyConversion,
} from '@/services/consolidatedReportService'

// ==================== QUERY KEYS ====================

export const consolidatedReportKeys = {
  all: ['consolidated-reports'] as const,
  profitLoss: (filters: ConsolidationFilters) =>
    [...consolidatedReportKeys.all, 'profit-loss', filters] as const,
  balanceSheet: (filters: ConsolidationFilters) =>
    [...consolidatedReportKeys.all, 'balance-sheet', filters] as const,
  interCompanyTransactions: (firmIds: string[], startDate: string, endDate: string) =>
    [...consolidatedReportKeys.all, 'inter-company-transactions', { firmIds, startDate, endDate }] as const,
  comparisons: (firmIds: string[], startDate: string, endDate: string, metrics: string[]) =>
    [...consolidatedReportKeys.all, 'comparisons', { firmIds, startDate, endDate, metrics }] as const,
  summary: (filters: ConsolidationFilters) =>
    [...consolidatedReportKeys.all, 'summary', filters] as const,
  eliminationRules: () => [...consolidatedReportKeys.all, 'elimination-rules'] as const,
  exchangeRates: (currencies: string[], date?: string) =>
    [...consolidatedReportKeys.all, 'exchange-rates', { currencies, date }] as const,
}

// ==================== CONSOLIDATED P&L ====================

export const useConsolidatedProfitLoss = (filters: ConsolidationFilters) => {
  return useQuery({
    queryKey: consolidatedReportKeys.profitLoss(filters),
    queryFn: () => consolidatedReportService.getConsolidatedProfitLoss(filters),
    enabled: filters.firmIds.length > 0 && !!filters.startDate && !!filters.endDate,
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
    retry: 2,
  })
}

// ==================== CONSOLIDATED BALANCE SHEET ====================

export const useConsolidatedBalanceSheet = (filters: ConsolidationFilters) => {
  return useQuery({
    queryKey: consolidatedReportKeys.balanceSheet(filters),
    queryFn: () => consolidatedReportService.getConsolidatedBalanceSheet(filters),
    enabled: filters.firmIds.length > 0 && !!filters.startDate && !!filters.endDate,
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
    retry: 2,
  })
}

// ==================== INTER-COMPANY TRANSACTIONS ====================

export const useInterCompanyTransactions = (
  firmIds: string[],
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: consolidatedReportKeys.interCompanyTransactions(firmIds, startDate, endDate),
    queryFn: () =>
      consolidatedReportService.getInterCompanyTransactions(firmIds, startDate, endDate),
    enabled: firmIds.length > 1 && !!startDate && !!endDate,
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
  })
}

// ==================== COMPANY COMPARISONS ====================

export const useCompanyComparisons = (
  firmIds: string[],
  startDate: string,
  endDate: string,
  metrics: string[]
) => {
  return useQuery({
    queryKey: consolidatedReportKeys.comparisons(firmIds, startDate, endDate, metrics),
    queryFn: () =>
      consolidatedReportService.getCompanyComparisons(firmIds, startDate, endDate, metrics),
    enabled: firmIds.length > 0 && !!startDate && !!endDate && metrics.length > 0,
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
  })
}

// ==================== CONSOLIDATION SUMMARY ====================

export const useConsolidationSummary = (filters: ConsolidationFilters) => {
  return useQuery({
    queryKey: consolidatedReportKeys.summary(filters),
    queryFn: () => consolidatedReportService.getConsolidationSummary(filters),
    enabled: filters.firmIds.length > 0 && !!filters.startDate && !!filters.endDate,
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
  })
}

// ==================== ELIMINATION RULES ====================

export const useEliminationRules = () => {
  return useQuery({
    queryKey: consolidatedReportKeys.eliminationRules(),
    queryFn: () => consolidatedReportService.getEliminationRules(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useCreateEliminationRule = () => {
  return useMutation({
    mutationFn: (rule: Omit<EliminationRule, 'id'>) =>
      consolidatedReportService.createEliminationRule(rule),
    onSuccess: () => {
      toast.success('تم إنشاء قاعدة الإلغاء بنجاح', {
        description: 'تم حفظ قاعدة الإلغاء الجديدة',
      })
    },
    onError: (error: Error) => {
      toast.error('فشل إنشاء قاعدة الإلغاء', {
        description: error.message || 'حدث خطأ أثناء إنشاء القاعدة',
      })
    },
    onSettled: async () => {
      await invalidateCache.consolidatedReport.eliminationRules()
      await invalidateCache.consolidatedReport.all()
    },
  })
}

export const useUpdateEliminationRule = () => {
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<EliminationRule> }) =>
      consolidatedReportService.updateEliminationRule(id, updates),
    onSuccess: () => {
      toast.success('تم تحديث قاعدة الإلغاء بنجاح')
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث قاعدة الإلغاء', {
        description: error.message,
      })
    },
    onSettled: async () => {
      await invalidateCache.consolidatedReport.eliminationRules()
      await invalidateCache.consolidatedReport.all()
    },
  })
}

export const useDeleteEliminationRule = () => {
  return useMutation({
    mutationFn: (id: string) => consolidatedReportService.deleteEliminationRule(id),
    onSuccess: () => {
      toast.success('تم حذف قاعدة الإلغاء بنجاح')
    },
    onError: (error: Error) => {
      toast.error('فشل حذف قاعدة الإلغاء', {
        description: error.message,
      })
    },
    onSettled: async () => {
      await invalidateCache.consolidatedReport.eliminationRules()
      await invalidateCache.consolidatedReport.all()
    },
  })
}

// ==================== EXCHANGE RATES ====================

export const useExchangeRates = (currencies: string[], date?: string) => {
  return useQuery({
    queryKey: consolidatedReportKeys.exchangeRates(currencies, date),
    queryFn: () => consolidatedReportService.getExchangeRates(currencies, date),
    enabled: currencies.length > 0,
    staleTime: CACHE_TIMES.LONG, // 30 minutes (was 10 minutes)
  })
}

export const useSetExchangeRate = () => {
  return useMutation({
    mutationFn: (conversion: Omit<CurrencyConversion, 'source'>) =>
      consolidatedReportService.setExchangeRate(conversion),
    onSuccess: () => {
      toast.success('تم تحديث سعر الصرف بنجاح')
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث سعر الصرف', {
        description: error.message,
      })
    },
    onSettled: async () => {
      await invalidateCache.consolidatedReport.exchangeRates()
      await invalidateCache.consolidatedReport.all()
    },
  })
}

// ==================== EXPORT ====================

export const useExportConsolidatedReport = () => {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: ConsolidationFilters
      format: 'pdf' | 'excel' | 'csv'
    }) => consolidatedReportService.exportConsolidatedReport(filters, format),
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `consolidated-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('تم تصدير التقرير الموحد بنجاح', {
        description: `تم تحميل الملف بصيغة ${format.toUpperCase()}`,
      })
    },
    onError: (error: Error) => {
      toast.error('فشل تصدير التقرير الموحد', {
        description: error.message,
      })
    },
  })
}
