/**
 * Lock Date Hooks
 * React Query hooks for fiscal period management
 *
 * ⚠️ BACKEND STATUS: NOT IMPLEMENTED
 *
 * This hook layer wraps service calls for lock date management.
 * The backend endpoints are NOT YET IMPLEMENTED. All mutations will
 * display deprecation warnings and fail gracefully.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
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
const CONFIG_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const CONFIG_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const HISTORY_STALE_TIME = 2 * CACHE_TIMES.MEDIUM // 10 minutes

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
 *
 * ⚠️ NOT IMPLEMENTED: Backend endpoint does not exist
 * Query will fail but errors are suppressed to prevent UI breaks
 */
export function useLockDates(enabled = true) {
  return useQuery({
    queryKey: lockDateKeys.config(),
    queryFn: lockDateService.getLockDates,
    staleTime: CONFIG_STALE_TIME,
    gcTime: CONFIG_GC_TIME,
    enabled,
    retry: false, // Don't retry - backend doesn't exist
    throwOnError: false, // Suppress errors to prevent UI breaks
  })
}

/**
 * Get list of fiscal periods with lock status
 *
 * ⚠️ NOT IMPLEMENTED: Backend endpoint does not exist
 * Query will fail but errors are suppressed to prevent UI breaks
 */
export function useFiscalPeriods(year?: number, enabled = true) {
  return useQuery({
    queryKey: lockDateKeys.periods(year),
    queryFn: () => lockDateService.getFiscalPeriods(year),
    staleTime: CONFIG_STALE_TIME,
    gcTime: CONFIG_GC_TIME,
    enabled,
    retry: false, // Don't retry - backend doesn't exist
    throwOnError: false, // Suppress errors to prevent UI breaks
  })
}

/**
 * Get lock date change history
 *
 * ⚠️ NOT IMPLEMENTED: Backend endpoint does not exist
 * Query will fail but errors are suppressed to prevent UI breaks
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
    retry: false, // Don't retry - backend doesn't exist
    throwOnError: false, // Suppress errors to prevent UI breaks
  })
}

/**
 * Check if a date is locked
 *
 * ⚠️ NOT IMPLEMENTED: Backend endpoint does not exist
 * Query will fail but errors are suppressed to prevent UI breaks
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
    retry: false, // Don't retry - backend doesn't exist
    throwOnError: false, // Suppress errors to prevent UI breaks
  })
}

// ==================== LOCK DATE MUTATIONS ====================

/**
 * Update a specific lock date
 *
 * ⚠️ DEPRECATED: Backend endpoint not implemented
 * This mutation will always fail until backend support is added
 */
export function useUpdateLockDate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lockType, data }: { lockType: LockType; data: UpdateLockDateData }) => {
      console.warn(
        '[DEPRECATED] useUpdateLockDate: Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
        '[منتهي الصلاحية] useUpdateLockDate: ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
      )
      return lockDateService.updateLockDate(lockType, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.history() })
      toast.success('تم تحديث تاريخ القفل بنجاح | Lock date updated successfully')
    },
    onError: (error: Error) => {
      // Display bilingual error message
      toast.error(error.message || 'فشل في تحديث تاريخ القفل | Failed to update lock date')
    },
  })
}

/**
 * Clear a lock date
 *
 * ⚠️ DEPRECATED: Backend endpoint not implemented
 * This mutation will always fail until backend support is added
 */
export function useClearLockDate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lockType: LockType) => {
      console.warn(
        '[DEPRECATED] useClearLockDate: Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
        '[منتهي الصلاحية] useClearLockDate: ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
      )
      return lockDateService.clearLockDate(lockType)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.history() })
      toast.success('تم مسح تاريخ القفل | Lock date cleared successfully')
    },
    onError: (error: Error) => {
      // Display bilingual error message
      toast.error(error.message || 'فشل في مسح تاريخ القفل | Failed to clear lock date')
    },
  })
}

/**
 * Lock a fiscal period
 *
 * ⚠️ DEPRECATED: Backend endpoint not implemented
 * This mutation will always fail until backend support is added
 */
export function useLockPeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LockPeriodData) => {
      console.warn(
        '[DEPRECATED] useLockPeriod: Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
        '[منتهي الصلاحية] useLockPeriod: ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
      )
      return lockDateService.lockPeriod(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.periods() })
      toast.success('تم قفل الفترة بنجاح | Period locked successfully')
    },
    onError: (error: Error) => {
      // Display bilingual error message
      toast.error(error.message || 'فشل في قفل الفترة | Failed to lock period')
    },
  })
}

/**
 * Reopen a locked period
 *
 * ⚠️ DEPRECATED: Backend endpoint not implemented
 * This mutation will always fail until backend support is added
 */
export function useReopenPeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReopenPeriodData) => {
      console.warn(
        '[DEPRECATED] useReopenPeriod: Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
        '[منتهي الصلاحية] useReopenPeriod: ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
      )
      return lockDateService.reopenPeriod(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.periods() })
      toast.success('تم إعادة فتح الفترة | Period reopened successfully')
    },
    onError: (error: Error) => {
      // Display bilingual error message
      toast.error(error.message || 'فشل في إعادة فتح الفترة | Failed to reopen period')
    },
  })
}

/**
 * Update fiscal year end date
 *
 * ⚠️ DEPRECATED: Backend endpoint not implemented
 * This mutation will always fail until backend support is added
 */
export function useUpdateFiscalYearEnd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ month, day }: { month: number; day: number }) => {
      console.warn(
        '[DEPRECATED] useUpdateFiscalYearEnd: Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
        '[منتهي الصلاحية] useUpdateFiscalYearEnd: ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
      )
      return lockDateService.updateFiscalYearEnd(month, day)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockDateKeys.config() })
      queryClient.invalidateQueries({ queryKey: lockDateKeys.periods() })
      toast.success('تم تحديث نهاية السنة المالية | Fiscal year end updated successfully')
    },
    onError: (error: Error) => {
      // Display bilingual error message
      toast.error(error.message || 'فشل في تحديث نهاية السنة المالية | Failed to update fiscal year end')
    },
  })
}

// ==================== VALIDATION HOOKS ====================

/**
 * Hook to validate dates against lock dates before form submission
 *
 * ⚠️ NOT IMPLEMENTED: Backend endpoint does not exist
 * All validation checks will fail gracefully and allow operations to continue
 */
export function useLockDateValidation(lockType?: LockType) {
  const checkDate = async (date: string): Promise<boolean> => {
    try {
      const result = await lockDateService.checkDateLocked(date, lockType)
      if (result.is_locked) {
        toast.error(result.messageAr || result.message || 'التاريخ مغلق | Date is locked')
        return false
      }
      return true
    } catch {
      // Allow on error - don't block user operations since backend doesn't exist
      console.warn(
        '[DEPRECATED] useLockDateValidation.checkDate: Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
        '[منتهي الصلاحية] useLockDateValidation.checkDate: ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
      )
      return true
    }
  }

  const checkDateRange = async (startDate: string, endDate: string): Promise<boolean> => {
    try {
      const result = await lockDateService.checkDateRangeLocked(startDate, endDate, lockType)
      if (result.is_locked) {
        toast.error(result.messageAr || result.message || 'نطاق التواريخ يحتوي على تواريخ مغلقة | Date range contains locked dates')
        return false
      }
      return true
    } catch {
      // Allow on error - don't block user operations since backend doesn't exist
      console.warn(
        '[DEPRECATED] useLockDateValidation.checkDateRange: Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
        '[منتهي الصلاحية] useLockDateValidation.checkDateRange: ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
      )
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
