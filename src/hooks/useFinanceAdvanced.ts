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
      toast.success('Bank account added successfully | تم إضافة الحساب البنكي بنجاح')
    },
    onError: (error: Error) => {
      console.error('[useCreateBankFeed Error]:', error.message)
      toast.error(error.message || 'Failed to add account | فشل في إضافة الحساب')
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
      toast.success('Account updated successfully | تم تحديث الحساب بنجاح')
    },
    onError: (error: Error) => {
      console.error('[useUpdateBankFeed Error]:', error.message)
      toast.error(error.message || 'Failed to update | فشل في التحديث')
    },
  })
}

export const useDeleteBankFeed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bankFeedService.deleteFeed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-feeds'] })
      toast.success('Account deleted successfully | تم حذف الحساب بنجاح')
    },
    onError: (error: Error) => {
      console.error('[useDeleteBankFeed Error]:', error.message)
      toast.error(error.message || 'Failed to delete | فشل في الحذف')
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
      toast.success(`${data.imported} transactions imported | تم استيراد ${data.imported} معاملة`)
    },
    onError: (error: Error) => {
      console.error('[useFetchTransactions Error]:', error.message)
      toast.error(error.message || 'Failed to fetch transactions | فشل في جلب المعاملات')
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
      toast.success(`${data.imported} transactions imported successfully | تم استيراد ${data.imported} معاملة بنجاح`)
      if (data.duplicates > 0) {
        toast.info(`${data.duplicates} duplicate transactions skipped | تم تخطي ${data.duplicates} معاملة مكررة`)
      }
    },
    onError: (error: Error) => {
      console.error('[useImportCSV Error]:', error.message)
      toast.error(error.message || 'Failed to import file | فشل في استيراد الملف')
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
      toast.success(`${data.imported} transactions imported | تم استيراد ${data.imported} معاملة`)
    },
    onError: (error: Error) => {
      console.error('[useImportOFX Error]:', error.message)
      toast.error(error.message || 'Failed to import file | فشل في استيراد الملف')
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
      toast.success('Match created successfully | تم المطابقة بنجاح')
    },
    onError: (error: Error) => {
      console.error('[useCreateMatch Error]:', error.message)
      toast.error(error.message || 'Failed to create match | فشل في المطابقة')
    },
  })
}

export const useAutoMatchAll = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accountId: string) => matchingService.autoMatchAll(accountId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success(`${data.matched} transactions auto-matched | تم مطابقة ${data.matched} معاملة تلقائياً`)
      if (data.suggestions > 0) {
        toast.info(`${data.suggestions} suggestions for review | ${data.suggestions} اقتراح للمراجعة`)
      }
    },
    onError: (error: Error) => {
      console.error('[useAutoMatchAll Error]:', error.message)
      toast.error(error.message || 'Failed to auto-match | فشل في المطابقة التلقائية')
    },
  })
}

export const useConfirmMatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => matchingService.confirmMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('Match confirmed | تم تأكيد المطابقة')
    },
    onError: (error: Error) => {
      console.error('[useConfirmMatch Error]:', error.message)
      toast.error(error.message || 'Failed to confirm | فشل في التأكيد')
    },
  })
}

export const useRejectMatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => matchingService.rejectMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('Match rejected | تم رفض المطابقة')
    },
    onError: (error: Error) => {
      console.error('[useRejectMatch Error]:', error.message)
      toast.error(error.message || 'Failed to reject | فشل في الرفض')
    },
  })
}

export const useUnmatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => matchingService.unmatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('Match removed | تم إلغاء المطابقة')
    },
    onError: (error: Error) => {
      console.error('[useUnmatch Error]:', error.message)
      toast.error(error.message || 'Failed to unmatch | فشل في الإلغاء')
    },
  })
}

export const useExcludeTransaction = () => {
  // DEPRECATED: This endpoint is not implemented in the backend
  console.warn(
    '[DEPRECATED] useExcludeTransaction: This endpoint is not implemented. ' +
    'Use clear/unclear transaction methods instead. | ' +
    '[منتهي الصلاحية] useExcludeTransaction: نقطة النهاية غير متوفرة. ' +
    'استخدم طرق تصفية/عدم تصفية المعاملات بدلاً من ذلك.'
  )

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      matchingService.excludeTransaction(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] })
      toast.success('Transaction excluded | تم استثناء المعاملة')
    },
    onError: (error: Error) => {
      console.error('[useExcludeTransaction Error]:', error.message)
      toast.error(
        error.message ||
        'Failed to exclude transaction. Endpoint not implemented. | فشل في استثناء المعاملة. نقطة النهاية غير متوفرة.'
      )
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
      toast.success('Rule created successfully | تم إنشاء القاعدة بنجاح')
    },
    onError: (error: Error) => {
      console.error('[useCreateMatchingRule Error]:', error.message)
      toast.error(error.message || 'Failed to create rule | فشل في إنشاء القاعدة')
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
      toast.success('Rule updated | تم تحديث القاعدة')
    },
    onError: (error: Error) => {
      console.error('[useUpdateMatchingRule Error]:', error.message)
      toast.error(error.message || 'Failed to update rule | فشل في التحديث')
    },
  })
}

export const useDeleteMatchingRule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchingRulesService.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-rules'] })
      toast.success('Rule deleted | تم حذف القاعدة')
    },
    onError: (error: Error) => {
      console.error('[useDeleteMatchingRule Error]:', error.message)
      toast.error(error.message || 'Failed to delete rule | فشل في الحذف')
    },
  })
}

export const useToggleMatchingRule = () => {
  // DEPRECATED: This endpoint is not implemented in the backend
  console.warn(
    '[DEPRECATED] useToggleMatchingRule: This endpoint is not implemented. ' +
    'Use useUpdateMatchingRule() with { isActive: true/false } instead. | ' +
    '[منتهي الصلاحية] useToggleMatchingRule: نقطة النهاية غير متوفرة. ' +
    'استخدم useUpdateMatchingRule() مع { isActive: true/false } بدلاً من ذلك.'
  )

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchingRulesService.toggleRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matching-rules'] })
      toast.success('Rule status updated | تم تغيير حالة القاعدة')
    },
    onError: (error: Error) => {
      console.error('[useToggleMatchingRule Error]:', error.message)
      toast.error(
        error.message ||
        'Failed to toggle rule. Use updateRule() instead. | فشل في تبديل الحالة. استخدم updateRule() بدلاً من ذلك.'
      )
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
  // NOTE: This uses /bank-reconciliation/status/:accountId endpoint as dedicated report endpoint is not available
  if (accountId) {
    console.warn(
      '[INFO] useReconciliationReport: Using /bank-reconciliation/status/:accountId endpoint. ' +
      'Dedicated report endpoint is not available. | ' +
      '[معلومة] useReconciliationReport: يستخدم نقطة النهاية /bank-reconciliation/status/:accountId. ' +
      'نقطة نهاية التقرير المخصصة غير متوفرة.'
    )
  }

  return useQuery({
    queryKey: ['reconciliation-report', accountId, params],
    queryFn: () => reconciliationReportService.getReport(accountId, params),
    enabled: !!accountId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: 1,
  })
}

export const useExportReconciliationReport = () => {
  // DEPRECATED: This endpoint is not implemented in the backend
  console.warn(
    '[DEPRECATED] useExportReconciliationReport: This endpoint is not implemented. ' +
    'Report export functionality is not available in the backend. | ' +
    '[منتهي الصلاحية] useExportReconciliationReport: نقطة النهاية غير متوفرة. ' +
    'وظيفة تصدير التقارير غير متوفرة في الخادم.'
  )

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
      toast.success('Report exported | تم تصدير التقرير')
    },
    onError: (error: Error) => {
      console.error('[useExportReconciliationReport Error]:', error.message)
      toast.error(
        error.message ||
        'Failed to export report. Endpoint not implemented. | فشل في تصدير التقرير. نقطة النهاية غير متوفرة.'
      )
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
  // NOTE: This uses workaround - fetches all rates and filters
  if (fromCurrency && toCurrency) {
    console.warn(
      '[INFO] useExchangeRate: Using workaround. Fetches all rates and filters by currency pair. ' +
      'Dedicated endpoint not available. Consider using useExchangeRates() instead. | ' +
      '[معلومة] useExchangeRate: يستخدم طريقة بديلة. يجلب جميع الأسعار ويصفي حسب زوج العملات. ' +
      'نقطة النهاية المخصصة غير متوفرة. استخدم useExchangeRates() بدلاً من ذلك.'
    )
  }

  return useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency],
    queryFn: () => currencyService.getRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency,
    retry: 1,
  })
}

export const useRateHistory = (
  fromCurrency: string,
  toCurrency: string,
  params?: { startDate?: string; endDate?: string }
) => {
  // DEPRECATED: This endpoint is not implemented in the backend
  if (fromCurrency && toCurrency) {
    console.warn(
      '[DEPRECATED] useRateHistory: This endpoint is not implemented. ' +
      'Exchange rate history is not available in the backend. | ' +
      '[منتهي الصلاحية] useRateHistory: نقطة النهاية غير متوفرة. ' +
      'سجل أسعار الصرف غير متوفر في الخادم.'
    )
  }

  return useQuery({
    queryKey: ['rate-history', fromCurrency, toCurrency, params],
    queryFn: () => currencyService.getRateHistory(fromCurrency, toCurrency, params),
    enabled: !!fromCurrency && !!toCurrency,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
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
      toast.success(`${data.updated} exchange rates updated | تم تحديث ${data.updated} سعر صرف`)
    },
    onError: (error: Error) => {
      console.error('[useRefreshRates Error]:', error.message)
      toast.error(error.message || 'Failed to update rates | فشل في تحديث الأسعار')
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
      toast.success('Exchange rate updated | تم تحديث سعر الصرف')
    },
    onError: (error: Error) => {
      console.error('[useSetExchangeRate Error]:', error.message)
      toast.error(error.message || 'Failed to update rate | فشل في التحديث')
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
  // DEPRECATED: This endpoint is not implemented in the backend
  console.warn(
    '[DEPRECATED] useUpdateCurrencySettings: This endpoint is not implemented. ' +
    'Currency settings update is not available in the backend. | ' +
    '[منتهي الصلاحية] useUpdateCurrencySettings: نقطة النهاية غير متوفرة. ' +
    'تحديث إعدادات العملات غير متوفر في الخادم.'
  )

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CurrencySettings>) => currencyService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-settings'] })
      toast.success('Settings updated | تم تحديث الإعدادات')
    },
    onError: (error: Error) => {
      console.error('[useUpdateCurrencySettings Error]:', error.message)
      toast.error(
        error.message ||
        'Failed to update settings. Endpoint not implemented. | فشل في تحديث الإعدادات. نقطة النهاية غير متوفرة.'
      )
    },
  })
}
