/**
 * Lock Date Service
 * API service for fiscal period management and date locking
 */

import apiClient from '@/lib/api'
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
 */
export const getLockDates = async (): Promise<LockDateConfig> => {
  const response = await apiClient.get('/lock-dates')
  return response.data?.data || response.data
}

/**
 * Update a specific lock date
 */
export const updateLockDate = async (
  lockType: LockType,
  data: UpdateLockDateData
): Promise<LockDateConfig> => {
  const response = await apiClient.patch(`/lock-dates/${lockType}`, data)
  return response.data?.data || response.data
}

/**
 * Clear a lock date (set to null)
 */
export const clearLockDate = async (lockType: LockType): Promise<LockDateConfig> => {
  const response = await apiClient.delete(`/lock-dates/${lockType}`)
  return response.data?.data || response.data
}

// ==================== PERIOD LOCKING ====================

/**
 * Lock a fiscal period
 */
export const lockPeriod = async (data: LockPeriodData): Promise<LockDateConfig> => {
  const response = await apiClient.post('/lock-dates/periods/lock', data)
  return response.data?.data || response.data
}

/**
 * Reopen a locked period
 */
export const reopenPeriod = async (data: ReopenPeriodData): Promise<LockDateConfig> => {
  const response = await apiClient.post('/lock-dates/periods/reopen', data)
  return response.data?.data || response.data
}

/**
 * Get list of fiscal periods with lock status
 */
export const getFiscalPeriods = async (year?: number): Promise<FiscalPeriod[]> => {
  const params = new URLSearchParams()
  if (year) params.append('year', String(year))

  const response = await apiClient.get(`/lock-dates/periods?${params.toString()}`)
  return response.data?.data || response.data
}

// ==================== LOCK CHECKING ====================

/**
 * Check if a date is locked
 */
export const checkDateLocked = async (
  date: string,
  lockType?: LockType
): Promise<LockCheckResult> => {
  const params = new URLSearchParams()
  params.append('date', date)
  if (lockType) params.append('lock_type', lockType)

  const response = await apiClient.post('/lock-dates/check', { date, lock_type: lockType })
  return response.data?.data || response.data
}

/**
 * Check if a date range has any locked dates
 */
export const checkDateRangeLocked = async (
  startDate: string,
  endDate: string,
  lockType?: LockType
): Promise<LockCheckResult> => {
  const response = await apiClient.post('/lock-dates/check-range', {
    start_date: startDate,
    end_date: endDate,
    lock_type: lockType,
  })
  return response.data?.data || response.data
}

// ==================== HISTORY ====================

/**
 * Get lock date change history
 */
export const getLockDateHistory = async (
  lockType?: LockType,
  page?: number,
  limit?: number
): Promise<LockDateHistory> => {
  const params = new URLSearchParams()
  if (lockType) params.append('lock_type', lockType)
  if (page) params.append('page', String(page))
  if (limit) params.append('limit', String(limit))

  const response = await apiClient.get(`/lock-dates/history?${params.toString()}`)
  return response.data?.data || response.data
}

// ==================== FISCAL YEAR ====================

/**
 * Update fiscal year end date
 */
export const updateFiscalYearEnd = async (
  month: number,
  day: number
): Promise<LockDateConfig> => {
  const response = await apiClient.patch('/lock-dates/fiscal-year-end', {
    fiscalYearEnd: { month, day },
  })
  return response.data?.data || response.data
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
