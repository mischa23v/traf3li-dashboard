/**
 * Advanced Finance Hooks
 * React Query hooks for bank reconciliation and multi-currency
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  bankFeedService,
  matchingService,
  matchingRulesService,
  reconciliationReportService,
  currencyService,
} from '@/services/financeAdvancedService'
import type {
  CreateBankFeedData,
  BankFeedFilters,
  BankTransactionFilters,
  CreateMatchData,
  CreateMatchingRuleData,
  CSVColumnMapping,
  ConvertCurrencyData,
  CurrencySettings,
} from '@/types/finance-advanced'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// BANK FEED HOOKS
// ═══════════════════════════════════════════════════════════════

export const useBankFeeds = (filters?: BankFeedFilters) => {
  return useQuery({
    queryKey: ['bank-feeds', filters],
    queryFn: () => bankFeedService.getFeeds(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useBankFeed = (id: string) => {
  return useQuery({
    queryKey: ['bank-feed', id],
    queryFn: () => bankFeedService.getFeed(id),
    enabled: !!id,
  })
}

export const useCreateBankFeed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBankFeedData) => bankFeedService.createFeed(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-feeds'] })
      toast.success('تم إضافة الحساب البنكي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة الحساب')
    },
  })
}

export const useUpdateBankFeed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBankFeedData> }) =>
      bankFeedService.updateFeed(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bank-feeds'] })
      queryClient.invalidateQueries({ queryKey: ['bank-feed', variables.id] })
      toast.success('تم تحديث الحساب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

export const useDeleteBankFeed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bankFeedService.deleteFeed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-feeds'] })
      toast.success('تم حذف الحساب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحذف')
    },
  })
}

export const useFetchTransactions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bankFeedService.fetchTransactions(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bank-feed', id] })
      queryClient.invalidateQueries({ queryKey: ['bank-transactions', id] })
      toast.success(`تم استيراد ${data.imported} معاملة`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في جلب المعاملات')
    },
  })
}

export const useImportCSV = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      file,
      columnMapping,
      dateFormat,
    }: {
      id: string
      file: File
      columnMapping: CSVColumnMapping
      dateFormat: string
    }) => bankFeedService.importCSV(id, file, columnMapping, dateFormat),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions', variables.id] })
      toast.success(`تم استيراد ${data.imported} معاملة بنجاح`)
      if (data.duplicates > 0) {
        toast.info(`تم تخطي ${data.duplicates} معاملة مكررة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في استيراد الملف')
    },
  })
}

export const useImportOFX = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      bankFeedService.importOFX(id, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions', variables.id] })
      toast.success(`تم استيراد ${data.imported} معاملة`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في استيراد الملف')
    },
  })
}

export const useBankTransactions = (id: string, filters?: BankTransactionFilters) => {
  return useQuery({
    queryKey: ['bank-transactions', id, filters],
    queryFn: () => bankFeedService.getTransactions(id, filters),
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// MATCHING HOOKS
// ═══════════════════════════════════════════════════════════════

export const useMatchSuggestions = (accountId: string) => {
  return useQuery({
    queryKey: ['match-suggestions', accountId],
    queryFn: () => matchingService.getSuggestions(accountId),
    enabled: !!accountId,
  })
}

export const useCreateMatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMatchData) => matchingService.createMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('تم المطابقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في المطابقة')
    },
  })
}

export const useAutoMatchAll = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accountId: string) => matchingService.autoMatchAll(accountId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success(`تم مطابقة ${data.matched} معاملة تلقائياً`)
      if (data.suggestions > 0) {
        toast.info(`${data.suggestions} اقتراح للمراجعة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في المطابقة التلقائية')
    },
  })
}

export const useConfirmMatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => matchingService.confirmMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('تم تأكيد المطابقة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التأكيد')
    },
  })
}

export const useRejectMatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => matchingService.rejectMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('تم رفض المطابقة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الرفض')
    },
  })
}

export const useUnmatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => matchingService.unmatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('تم إلغاء المطابقة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإلغاء')
    },
  })
}

export const useExcludeTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      matchingService.excludeTransaction(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('تم استثناء المعاملة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الاستثناء')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// MATCHING RULES HOOKS
// ═══════════════════════════════════════════════════════════════

export const useMatchingRules = () => {
  return useQuery({
    queryKey: ['matching-rules'],
    queryFn: () => matchingRulesService.getRules(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateMatchingRule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMatchingRuleData) => matchingRulesService.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-rules'] })
      toast.success('تم إنشاء القاعدة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء القاعدة')
    },
  })
}

export const useUpdateMatchingRule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMatchingRuleData> }) =>
      matchingRulesService.updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-rules'] })
      toast.success('تم تحديث القاعدة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

export const useDeleteMatchingRule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchingRulesService.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-rules'] })
      toast.success('تم حذف القاعدة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحذف')
    },
  })
}

export const useToggleMatchingRule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchingRulesService.toggleRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-rules'] })
      toast.success('تم تغيير حالة القاعدة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التغيير')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// RECONCILIATION REPORT HOOKS
// ═══════════════════════════════════════════════════════════════

export const useReconciliationReport = (
  accountId: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: ['reconciliation-report', accountId, params],
    queryFn: () => reconciliationReportService.getReport(accountId, params),
    enabled: !!accountId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useExportReconciliationReport = () => {
  return useMutation({
    mutationFn: ({ accountId, format }: { accountId: string; format: 'pdf' | 'xlsx' }) =>
      reconciliationReportService.exportReport(accountId, format),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reconciliation-report.${variables.format}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير التقرير')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التصدير')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// CURRENCY HOOKS
// ═══════════════════════════════════════════════════════════════

export const useExchangeRates = () => {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => currencyService.getRates(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useExchangeRate = (fromCurrency: string, toCurrency: string) => {
  return useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency],
    queryFn: () => currencyService.getRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency,
  })
}

export const useRateHistory = (
  fromCurrency: string,
  toCurrency: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: ['rate-history', fromCurrency, toCurrency, params],
    queryFn: () => currencyService.getRateHistory(fromCurrency, toCurrency, params),
    enabled: !!fromCurrency && !!toCurrency,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useConvertCurrency = () => {
  return useMutation({
    mutationFn: (data: ConvertCurrencyData) => currencyService.convert(data),
  })
}

export const useRefreshRates = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => currencyService.refreshRates(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] })
      toast.success(`تم تحديث ${data.updated} سعر صرف`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الأسعار')
    },
  })
}

export const useSetExchangeRate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      fromCurrency,
      toCurrency,
      rate,
    }: {
      fromCurrency: string
      toCurrency: string
      rate: number
    }) => currencyService.setRate(fromCurrency, toCurrency, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] })
      toast.success('تم تحديث سعر الصرف')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

export const useCurrencySettings = () => {
  return useQuery({
    queryKey: ['currency-settings'],
    queryFn: () => currencyService.getSettings(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useUpdateCurrencySettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CurrencySettings>) => currencyService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-settings'] })
      toast.success('تم تحديث الإعدادات')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}
