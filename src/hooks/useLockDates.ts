/**
 * Lock Date Hooks
 * React Query hooks for fiscal period management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import lockDateService from '@/services/lockDateService'
import type {
  LockDateConfig,
  LockType,
  UpdateLockDateData,
  LockPeriodData,
  ReopenPeriodData,
  LockCheckResult,
  LockDateHistory,
  FiscalPeriod,
} from '@/types/lockDate'
import { toast } from 'sonner'

// ==================== Cache Configuration ====================
const CONFIG_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const CONFIG_GC_TIME = 60 * 60 * 1000 // 1 hour
const HISTORY_STALE_TIME = 10 * 60 * 1000 // 10 minutes

// ==================== QUERY KEYS ====================

export const lockDateKeys = {
  all: ['lock-dates'] as const,
  config: () => [...lockDateKeys.all, 'config'] as const,
  periods: (year?: number) => [...lockDateKeys.all, 'periods', year] as const,
  history: (lockType?: LockType, page?: number, limit?: number) => [...lockDateKeys.all, 'history', lockType, page, limit] as const,
  check: (date: string, lockType?: LockType) =>
    [...lockDateKeys.all, 'check', date, lockType] as const,
}

// ==================== LOCK DATE QUERIES ====================

/**
 * Get current lock date configuration
 */
export function useLockDates(enabled = true) {
  return useQuery({
    queryKey: lockDateKeys.config(),
    queryFn: lockDateService.getLockDates,
    staleTime: CONFIG_STALE_TIME,
    gcTime: CONFIG_GC_TIME,
    enabled,
  })
}

/**
 * Get list of fiscal periods with lock status
 */
export function useFiscalPeriods(year?: number, enabled = true) {
  return useQuery({
    queryKey: lockDateKeys.periods(year),
    queryFn: () => lockDateService.getFiscalPeriods(year),
    staleTime: CONFIG_STALE_TIME,
    gcTime: CONFIG_GC_TIME,
    enabled,
  })
}

/**
 * Get lock date change history
 */
export function useLockDateHistory(
  lockType?: LockType,
  page?: number,
  limit?: number,
  enabled = true
) {
  return useQuery({
    queryKey: lockDateKeys.history(lockType, page, limit),
    queryFn: () => lockDateService.getLockDateHistory(lockType, page, limit),
    staleTime: HISTORY_STALE_TIME,
    gcTime: CONFIG_GC_TIME,
    enabled,
  })
}

/**
 * Check if a date is locked
 */
export function useDateLockCheck(
  date: string,
  lockType?: LockType,
  enabled = true
) {
  return useQuery({
    queryKey: lockDateKeys.check(date, lockType),
    queryFn: () => lockDateService.checkDateLocked(date, lockType),
    staleTime: CONFIG_STALE_TIME,
    gcTime: CONFIG_GC_TIME,
    enabled: !!date && enabled,
  })
}

// ==================== LOCK DATE MUTATIONS ====================

/**
 * Update a specific lock date
 */
export function useUpdateLockDate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lockType, data }: { lockType: LockType; data: UpdateLockDateData }) =>
      lockDateService.updateLockDate(lockType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.history() })
      toast.success('تم تحديث تاريخ القفل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث تاريخ القفل')
    },
  })
}

/**
 * Clear a lock date
 */
export function useClearLockDate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lockType: LockType) => lockDateService.clearLockDate(lockType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.history() })
      toast.success('تم مسح تاريخ القفل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في مسح تاريخ القفل')
    },
  })
}

/**
 * Lock a fiscal period
 */
export function useLockPeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LockPeriodData) => lockDateService.lockPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.periods() })
      toast.success('تم قفل الفترة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في قفل الفترة')
    },
  })
}

/**
 * Reopen a locked period
 */
export function useReopenPeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReopenPeriodData) => lockDateService.reopenPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.periods() })
      toast.success('تم إعادة فتح الفترة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إعادة فتح الفترة')
    },
  })
}

/**
 * Update fiscal year end date
 */
export function useUpdateFiscalYearEnd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ month, day }: { month: number; day: number }) =>
      lockDateService.updateFiscalYearEnd(month, day),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.periods() })
      toast.success('تم تحديث نهاية السنة المالية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث نهاية السنة المالية')
    },
  })
}

// ==================== VALIDATION HOOKS ====================

/**
 * Hook to validate dates against lock dates before form submission
 */
export function useLockDateValidation(lockType?: LockType) {
  const checkDate = async (date: string): Promise<boolean> => {
    try {
      const result = await lockDateService.checkDateLocked(date, lockType)
      if (result.is_locked) {
        toast.error(result.messageAr || result.message || 'التاريخ مغلق')
        return false
      }
      return true
    } catch {
      // Allow on error - don't block user operations
      return true
    }
  }

  const checkDateRange = async (startDate: string, endDate: string): Promise<boolean> => {
    try {
      const result = await lockDateService.checkDateRangeLocked(startDate, endDate, lockType)
      if (result.is_locked) {
        toast.error(result.messageAr || result.message || 'نطاق التواريخ يحتوي على تواريخ مغلقة')
        return false
      }
      return true
    } catch {
      return true
    }
  }

  return { checkDate, checkDateRange }
}

// ==================== EXPORTS ====================

export type {
  LockDateConfig,
  LockType,
  UpdateLockDateData,
  LockPeriodData,
  ReopenPeriodData,
  LockCheckResult,
  LockDateHistory,
  FiscalPeriod,
}
