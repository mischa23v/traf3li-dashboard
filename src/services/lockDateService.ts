/**
 * Lock Date Service
 *
 * Backend Status:
 * - GET /lock-dates - WORKING (200)
 * - GET /lock-dates/history - BACKEND BUG (500)
 * - GET /lock-dates/periods - BACKEND BUG (500)
 * - Other endpoints - NOT IMPLEMENTED
 *
 * This service defines the frontend API client for lock date management.
 *
 * API service for fiscal period management and date locking
 */

import { apiClient, handleApiError } from '@/lib/api'
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

// ==================== LOCK DATE CONFIGURATION ====================

/**
 * Get current lock date configuration
 * WORKING: Backend returns 200
 * GET /api/lock-dates
 */
export const getLockDates = async (): Promise<LockDateConfig> => {
  try {
    const response = await apiClient.get('/lock-dates')
    return response.data.data || response.data
  } catch (error: unknown) {
    throw new Error(
      `Failed to fetch lock dates | فشل جلب تواريخ القفل: ${handleApiError(error)}`
    )
  }
}

/**
 * Update a specific lock date
 *
 *  NOT IMPLEMENTED: Backend endpoint does not exist
 */
export const updateLockDate = async (
  lockType: LockType,
  data: UpdateLockDateData
): Promise<LockDateConfig> => {
  throw new Error(
    'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
    'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
  )
}

/**
 * Clear a lock date (set to null)
 *
 *  NOT IMPLEMENTED: Backend endpoint does not exist
 */
export const clearLockDate = async (lockType: LockType): Promise<LockDateConfig> => {
  throw new Error(
    'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
    'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
  )
}

// ==================== PERIOD LOCKING ====================

/**
 * Lock a fiscal period
 *
 *  NOT IMPLEMENTED: Backend endpoint does not exist
 */
export const lockPeriod = async (data: LockPeriodData): Promise<LockDateConfig> => {
  throw new Error(
    'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
    'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
  )
}

/**
 * Reopen a locked period
 *
 *  NOT IMPLEMENTED: Backend endpoint does not exist
 */
export const reopenPeriod = async (data: ReopenPeriodData): Promise<LockDateConfig> => {
  throw new Error(
    'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
    'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
  )
}

/**
 * Get list of fiscal periods with lock status
 * BACKEND BUG: Returns 500 Internal Error
 * GET /api/lock-dates/periods
 */
export const getFiscalPeriods = async (year?: number): Promise<FiscalPeriod[]> => {
  try {
    const params = year ? `?year=${year}` : ''
    const response = await apiClient.get(`/lock-dates/periods${params}`)
    return response.data.data || response.data
  } catch (error: unknown) {
    throw new Error(
      `Failed to fetch fiscal periods (backend bug) | فشل جلب الفترات المالية (خطأ في الخادم): ${handleApiError(error)}`
    )
  }
}

// ==================== LOCK CHECKING ====================

/**
 * Check if a date is locked
 *
 *  NOT IMPLEMENTED: Backend endpoint does not exist
 */
export const checkDateLocked = async (
  date: string,
  lockType?: LockType
): Promise<LockCheckResult> => {
  throw new Error(
    'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
    'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
  )
}

/**
 * Check if a date range has any locked dates
 *
 *  NOT IMPLEMENTED: Backend endpoint does not exist
 */
export const checkDateRangeLocked = async (
  startDate: string,
  endDate: string,
  lockType?: LockType
): Promise<LockCheckResult> => {
  throw new Error(
    'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
    'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
  )
}

// ==================== HISTORY ====================

/**
 * Get lock date change history
 * BACKEND BUG: Returns 500 Internal Error
 * GET /api/lock-dates/history
 */
export const getLockDateHistory = async (
  lockType?: LockType,
  page?: number,
  limit?: number
): Promise<LockDateHistory> => {
  try {
    const params = new URLSearchParams()
    if (lockType) params.append('lockType', lockType)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())
    const queryString = params.toString()
    const url = queryString ? `/lock-dates/history?${queryString}` : '/lock-dates/history'
    const response = await apiClient.get(url)
    return response.data.data || response.data
  } catch (error: unknown) {
    throw new Error(
      `Failed to fetch lock date history (backend bug) | فشل جلب سجل تواريخ القفل (خطأ في الخادم): ${handleApiError(error)}`
    )
  }
}

// ==================== FISCAL YEAR ====================

/**
 * Update fiscal year end date
 *
 *  NOT IMPLEMENTED: Backend endpoint does not exist
 */
export const updateFiscalYearEnd = async (
  month: number,
  day: number
): Promise<LockDateConfig> => {
  throw new Error(
    'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
    'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
  )
}

// ==================== SERVICE OBJECT ====================

const lockDateService = {
  // Configuration
  getLockDates,
  updateLockDate,
  clearLockDate,
  updateFiscalYearEnd,

  // Period management
  lockPeriod,
  reopenPeriod,
  getFiscalPeriods,

  // Lock checking
  checkDateLocked,
  checkDateRangeLocked,

  // History
  getLockDateHistory,
}

export default lockDateService
