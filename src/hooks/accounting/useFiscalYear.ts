/**
 * Fiscal Year & Period Hooks
 * TanStack Query hooks for fiscal year and period management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  FiscalPeriod,
  FiscalPeriodBalances,
} from '@/services/accountingService'
import { journalEntryKeys } from './useJournalEntries'

// ==================== QUERY KEYS ====================

export const fiscalYearKeys = {
  all: ['accounting'] as const,
  fiscalPeriods: () => [...fiscalYearKeys.all, 'fiscal-periods'] as const,
  fiscalPeriodsList: () => [...fiscalYearKeys.fiscalPeriods(), 'list'] as const,
  fiscalPeriod: (id: string) => [...fiscalYearKeys.fiscalPeriods(), id] as const,
  fiscalPeriodBalances: (id: string) => [...fiscalYearKeys.fiscalPeriods(), id, 'balances'] as const,
  currentFiscalPeriod: () => [...fiscalYearKeys.fiscalPeriods(), 'current'] as const,
  fiscalYearsSummary: () => [...fiscalYearKeys.fiscalPeriods(), 'years-summary'] as const,
  canPost: (date: string) => [...fiscalYearKeys.fiscalPeriods(), 'can-post', date] as const,
}

// ==================== FISCAL PERIOD QUERY HOOKS ====================

/**
 * Fetch all fiscal periods
 * @returns Query result with fiscal periods data
 */
export const useFiscalPeriods = () => {
  return useQuery({
    queryKey: fiscalYearKeys.fiscalPeriodsList(),
    queryFn: accountingService.getFiscalPeriods,
  })
}

/**
 * Fetch the current active fiscal period
 * @returns Query result with current fiscal period data
 */
export const useCurrentFiscalPeriod = () => {
  return useQuery({
    queryKey: fiscalYearKeys.currentFiscalPeriod(),
    queryFn: accountingService.getCurrentFiscalPeriod,
  })
}

/**
 * Check if posting is allowed for a specific date
 * @param date - Date to check (ISO format)
 * @returns Query result indicating if posting is allowed
 */
export const useCanPostToDate = (date: string) => {
  return useQuery({
    queryKey: fiscalYearKeys.canPost(date),
    queryFn: () => accountingService.canPostToDate(date),
    enabled: !!date,
  })
}

/**
 * Fetch fiscal years summary
 * @returns Query result with fiscal years summary data
 */
export const useFiscalYearsSummary = () => {
  return useQuery({
    queryKey: fiscalYearKeys.fiscalYearsSummary(),
    queryFn: accountingService.getFiscalYearsSummary,
  })
}

/**
 * Fetch a single fiscal period by ID
 * @param id - Fiscal Period ID
 * @returns Query result with fiscal period data
 */
export const useFiscalPeriod = (id: string) => {
  return useQuery({
    queryKey: fiscalYearKeys.fiscalPeriod(id),
    queryFn: () => accountingService.getFiscalPeriod(id),
    enabled: !!id,
  })
}

/**
 * Fetch balances for a specific fiscal period
 * @param id - Fiscal Period ID
 * @returns Query result with fiscal period balances
 */
export const useFiscalPeriodBalances = (id: string) => {
  return useQuery({
    queryKey: fiscalYearKeys.fiscalPeriodBalances(id),
    queryFn: () => accountingService.getFiscalPeriodBalances(id),
    enabled: !!id,
  })
}

// ==================== FISCAL YEAR MUTATION HOOKS ====================

/**
 * Create a new fiscal year with periods
 * @returns Mutation for creating a fiscal year
 */
export const useCreateFiscalYear = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fiscalYear, startMonth }: { fiscalYear: number; startMonth: number }) =>
      accountingService.createFiscalYear(fiscalYear, startMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalYearKeys.fiscalPeriods() })
      toast.success('تم إنشاء السنة المالية بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء السنة المالية')
    },
  })
}

/**
 * Open a fiscal period for posting
 * @returns Mutation for opening a fiscal period
 */
export const useOpenFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.openFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalYearKeys.fiscalPeriods() })
      toast.success('تم فتح الفترة المالية')
    },
    onError: () => {
      toast.error('فشل في فتح الفترة المالية')
    },
  })
}

/**
 * Close a fiscal period
 * @returns Mutation for closing a fiscal period
 */
export const useCloseFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.closeFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalYearKeys.fiscalPeriods() })
      toast.success('تم إغلاق الفترة المالية')
    },
    onError: () => {
      toast.error('فشل في إغلاق الفترة المالية')
    },
  })
}

/**
 * Reopen a closed fiscal period
 * @returns Mutation for reopening a fiscal period
 */
export const useReopenFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.reopenFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalYearKeys.fiscalPeriods() })
      toast.success('تم إعادة فتح الفترة المالية')
    },
    onError: () => {
      toast.error('فشل في إعادة فتح الفترة المالية')
    },
  })
}

/**
 * Lock a fiscal period (permanent close)
 * @returns Mutation for locking a fiscal period
 */
export const useLockFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.lockFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalYearKeys.fiscalPeriods() })
      toast.success('تم قفل الفترة المالية نهائياً')
    },
    onError: () => {
      toast.error('فشل في قفل الفترة المالية')
    },
  })
}

/**
 * Perform year-end closing process
 * @returns Mutation for year-end closing
 */
export const useYearEndClosing = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.yearEndClosing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fiscalYearKeys.fiscalPeriods() })
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.journalEntries() })
      toast.success('تم إغلاق نهاية السنة بنجاح')
    },
    onError: () => {
      toast.error('فشل في إغلاق نهاية السنة')
    },
  })
}
