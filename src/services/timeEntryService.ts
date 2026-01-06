/**
 * Time Entry Service
 *
 * Handles all time tracking and time entry operations with proper error handling
 * and bilingual error messages (English | Arabic)
 *
 * ⚠️ IMPORTANT: Some endpoints called by this service may not exist in the backend.
 * See documentation below for endpoint status.
 *
 * Created: 2025-12-23
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPE DEFINITIONS ====================

export interface TimeEntry {
  _id: string
  id: string
  lawyerId: string
  caseId?: string
  clientId?: string
  activityCode: string
  description: string
  notes?: string
  date: string
  hours: number
  minutes: number
  rate: number
  amount: number
  isBillable: boolean
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'billed' | 'invoiced'
  billStatus?: 'draft' | 'unbilled' | 'billed' | 'invoiced'
  wasTimerBased: boolean
  timerStartedAt?: string
  isLocked?: boolean
  lockReason?: string
  lockedAt?: string
  lockedBy?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTimeEntryData {
  caseId?: string
  clientId?: string
  activityCode: string
  description: string
  notes?: string
  date: string
  hours: number
  minutes: number
  isBillable?: boolean
  rate?: number
}

export interface TimeEntryFilters {
  caseId?: string
  clientId?: string
  lawyerId?: string
  startDate?: string
  endDate?: string
  status?: string
  isBillable?: boolean
  page?: number
  limit?: number
}

export interface TimerStatus {
  isActive: boolean
  timer: {
    startedAt?: string
    pausedAt?: string
    elapsedMinutes?: number
    hourlyRate?: number
    description?: string
    caseId?: string
    activityCode?: string
    isPaused?: boolean
  }
}

// ==================== ERROR MESSAGES ====================

const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection. | خطأ في الشبكة. يرجى التحقق من اتصالك.',
  TIMEOUT: 'Request timeout. Please try again. | انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',

  // General errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again. | حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  SERVER_ERROR: 'Server error. Please try again later. | خطأ في الخادم. يرجى المحاولة لاحقاً.',

  // Time entry errors
  ENTRY_NOT_FOUND: 'Time entry not found. | إدخال الوقت غير موجود.',
  ENTRY_LOCKED: 'Time entry is locked and cannot be modified. | إدخال الوقت مقفل ولا يمكن تعديله.',
  ENTRY_ALREADY_BILLED: 'Time entry has already been billed. | تم فوترة إدخال الوقت بالفعل.',

  // Timer errors
  TIMER_ALREADY_RUNNING: 'A timer is already running. Please stop it first. | يوجد مؤقت قيد التشغيل بالفعل. يرجى إيقافه أولاً.',
  NO_ACTIVE_TIMER: 'No active timer found. | لا يوجد مؤقت نشط.',
  TIMER_ALREADY_PAUSED: 'Timer is already paused. | المؤقت متوقف مؤقتاً بالفعل.',

  // Validation errors
  MISSING_REQUIRED_FIELDS: 'Required fields are missing. | الحقول المطلوبة مفقودة.',
  INVALID_DATE: 'Invalid date format. | تنسيق تاريخ غير صالح.',
  INVALID_HOURS: 'Hours must be between 0 and 24. | يجب أن تكون الساعات بين 0 و 24.',

  // Permission errors
  UNAUTHORIZED: 'You are not authorized to perform this action. | غير مصرح لك بتنفيذ هذا الإجراء.',
  FORBIDDEN: 'Access forbidden. | الوصول ممنوع.',

  // Endpoint not implemented errors
  ENDPOINT_NOT_IMPLEMENTED: 'This feature is not yet available on the backend. | هذه الميزة غير متاحة بعد في الخادم.',
  UNBILLED_ENTRIES_NOT_AVAILABLE: 'Unbilled entries endpoint not available. Use filters instead. | نقطة النهاية للقيود غير المفوترة غير متاحة. استخدم الفلاتر بدلاً من ذلك.',
  ACTIVITY_CODES_NOT_AVAILABLE: 'Activity codes endpoint not available. | نقطة النهاية لرموز النشاط غير متاحة.',
  BULK_APPROVE_NOT_AVAILABLE: 'Bulk approve endpoint not available. Approve individually instead. | نقطة النهاية للموافقة الجماعية غير متاحة. وافق بشكل فردي بدلاً من ذلك.',
  WRITE_OFF_NOT_AVAILABLE: 'Write-off endpoint not available. | نقطة النهاية للشطب غير متاحة.',
  WRITE_DOWN_NOT_AVAILABLE: 'Write-down endpoint not available. | نقطة النهاية للتخفيض غير متاحة.',
  LOCK_NOT_AVAILABLE: 'Lock/unlock endpoints not available. | نقطة النهاية للقفل/فتح القفل غير متاحة.',
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Enhanced error handler with bilingual messages
 */
const handleTimeEntryError = (error: any, fallbackMessage?: string): string => {
  // Handle abort errors silently
  if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
    return 'Request was cancelled. | تم إلغاء الطلب.'
  }

  // Handle network errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  // Handle HTTP status codes
  const status = error?.response?.status
  if (status === 401) {
    return ERROR_MESSAGES.UNAUTHORIZED
  }
  if (status === 403) {
    return ERROR_MESSAGES.FORBIDDEN
  }
  if (status === 404) {
    return ERROR_MESSAGES.ENTRY_NOT_FOUND
  }
  if (status === 409) {
    return ERROR_MESSAGES.TIMER_ALREADY_RUNNING
  }
  if (status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR
  }

  // Handle specific error messages from backend
  const backendMessage = error?.response?.data?.message || error?.message

  // Match Arabic error messages from backend
  if (backendMessage?.includes('غير موجود')) {
    return ERROR_MESSAGES.ENTRY_NOT_FOUND
  }
  if (backendMessage?.includes('مؤقت قيد التشغيل')) {
    return ERROR_MESSAGES.TIMER_ALREADY_RUNNING
  }
  if (backendMessage?.includes('لا يوجد مؤقت نشط')) {
    return ERROR_MESSAGES.NO_ACTIVE_TIMER
  }
  if (backendMessage?.includes('متوقف مؤقتاً بالفعل')) {
    return ERROR_MESSAGES.TIMER_ALREADY_PAUSED
  }

  // Return backend message if available, otherwise use fallback
  if (backendMessage) {
    return backendMessage
  }

  return fallbackMessage || ERROR_MESSAGES.UNKNOWN_ERROR
}

// ==================== TIMER OPERATIONS ====================
// ✅ Backend Status: IMPLEMENTED

/**
 * Start a new timer for time tracking
 *
 * Backend endpoint: POST /api/time-tracking/timer/start
 * ✅ Status: IMPLEMENTED
 */
export const startTimer = async (data: {
  caseId?: string
  clientId?: string
  activityCode: string
  description?: string
}): Promise<TimerStatus> => {
  try {
    const response = await apiClient.post('/time-tracking/timer/start', data)
    return response.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Pause the active timer
 *
 * Backend endpoint: POST /api/time-tracking/timer/pause
 * ✅ Status: IMPLEMENTED
 */
export const pauseTimer = async (): Promise<TimerStatus> => {
  try {
    const response = await apiClient.post('/time-tracking/timer/pause')
    return response.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Resume a paused timer
 *
 * Backend endpoint: POST /api/time-tracking/timer/resume
 * ✅ Status: IMPLEMENTED
 */
export const resumeTimer = async (): Promise<TimerStatus> => {
  try {
    const response = await apiClient.post('/time-tracking/timer/resume')
    return response.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Stop the active timer and create a time entry
 *
 * Backend endpoint: POST /api/time-tracking/timer/stop
 * ✅ Status: IMPLEMENTED
 */
export const stopTimer = async (data: {
  notes?: string
  isBillable?: boolean
}): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post('/time-tracking/timer/stop', data)
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Get current timer status
 *
 * Backend endpoint: GET /api/time-tracking/timer/status
 * ✅ Status: IMPLEMENTED
 */
export const getTimerStatus = async (): Promise<TimerStatus> => {
  try {
    const response = await apiClient.get('/time-tracking/timer/status')
    return response.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

// ==================== TIME ENTRY CRUD ====================
// ✅ Backend Status: IMPLEMENTED

/**
 * Create a new time entry
 *
 * Backend endpoint: POST /api/time-tracking/entries
 * ✅ Status: IMPLEMENTED
 */
export const createTimeEntry = async (data: CreateTimeEntryData): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post('/time-tracking/entries', data)
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Get time entries with optional filters
 *
 * Backend endpoint: GET /api/time-tracking/entries
 * ✅ Status: IMPLEMENTED
 */
export const getTimeEntries = async (
  filters?: TimeEntryFilters
): Promise<{ data: TimeEntry[]; pagination: any; summary: any }> => {
  try {
    const response = await apiClient.get('/time-tracking/entries', {
      params: filters,
    })

    const responseData = response.data.data || response.data
    return {
      data: responseData?.entries || responseData || [],
      pagination: {
        total: responseData?.total || 0,
        page: responseData?.page || 1,
        totalPages: responseData?.totalPages || 1,
      },
      summary: responseData?.summary || null,
    }
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Get a single time entry by ID
 *
 * Backend endpoint: GET /api/time-tracking/entries/:id
 * ✅ Status: IMPLEMENTED
 */
export const getTimeEntry = async (id: string): Promise<{ data: TimeEntry }> => {
  try {
    const response = await apiClient.get(`/time-tracking/entries/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Update a time entry
 *
 * Backend endpoint: PUT /api/time-tracking/entries/:id
 * ✅ Status: IMPLEMENTED
 *
 * ⚠️ NOTE: Backend uses PUT, not PATCH
 */
export const updateTimeEntry = async (
  id: string,
  data: Partial<CreateTimeEntryData>
): Promise<TimeEntry> => {
  try {
    // Backend uses PUT, not PATCH
    const response = await apiClient.put(`/time-tracking/entries/${id}`, data)
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Delete a time entry
 *
 * Backend endpoint: DELETE /api/time-tracking/entries/:id
 * ✅ Status: IMPLEMENTED
 */
export const deleteTimeEntry = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/time-tracking/entries/${id}`)
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

// ==================== APPROVAL WORKFLOW ====================
// ✅ Backend Status: IMPLEMENTED

/**
 * Approve a time entry
 *
 * Backend endpoint: POST /api/time-tracking/entries/:id/approve
 * ✅ Status: IMPLEMENTED
 */
export const approveTimeEntry = async (id: string): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post(`/time-tracking/entries/${id}/approve`)
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Reject a time entry
 *
 * Backend endpoint: POST /api/time-tracking/entries/:id/reject
 * ✅ Status: IMPLEMENTED
 */
export const rejectTimeEntry = async (id: string, reason: string): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post(`/time-tracking/entries/${id}/reject`, {
      reason
    })
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

// ==================== ANALYTICS ====================
// ✅ Backend Status: IMPLEMENTED

/**
 * Get time entry statistics
 *
 * Backend endpoint: GET /api/time-tracking/stats
 * ✅ Status: IMPLEMENTED
 */
export const getTimeStats = async (filters?: {
  startDate?: string
  endDate?: string
  caseId?: string
}): Promise<any> => {
  try {
    const response = await apiClient.get('/time-tracking/stats', {
      params: filters,
    })
    return response.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

// ==================== BULK OPERATIONS ====================
// ⚠️ Backend Status: PARTIALLY IMPLEMENTED

/**
 * Bulk delete time entries
 *
 * Backend endpoint: DELETE /api/time-tracking/entries/bulk
 * ✅ Status: IMPLEMENTED
 */
export const bulkDeleteTimeEntries = async (entryIds: string[]): Promise<{
  deleted: number
  failed: number
}> => {
  try {
    const response = await apiClient.delete('/time-tracking/entries/bulk', {
      data: { entryIds }
    })
    return response.data.data
  } catch (error: any) {
    throw new Error(handleTimeEntryError(error))
  }
}

/**
 * Bulk approve time entries
 *
 * Backend endpoint: POST /api/time-tracking/entries/bulk-approve
 * ❌ Status: NOT IMPLEMENTED
 *
 * Fallback: Approve entries individually
 */
export const bulkApproveTimeEntries = async (entryIds: string[]): Promise<{
  approved: number
  failed: number
}> => {
  try {
    const response = await apiClient.post('/time-tracking/entries/bulk-approve', {
      entryIds
    })
    return response.data.data
  } catch (error: any) {
    // If endpoint doesn't exist (404), fall back to individual approvals
    if (error?.response?.status === 404) {
      console.warn('Bulk approve endpoint not available, falling back to individual approvals')

      let approved = 0
      let failed = 0

      for (const entryId of entryIds) {
        try {
          await approveTimeEntry(entryId)
          approved++
        } catch {
          failed++
        }
      }

      return { approved, failed }
    }

    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.BULK_APPROVE_NOT_AVAILABLE))
  }
}

// ==================== NOT IMPLEMENTED ENDPOINTS ====================
// ❌ Backend Status: NOT IMPLEMENTED
// These endpoints are called by the frontend but don't exist in the backend

/**
 * Get unbilled time entries
 *
 * Backend endpoint: GET /api/time-tracking/unbilled
 * ❌ Status: NOT IMPLEMENTED
 *
 * Fallback: Use getTimeEntries with status filter
 */
export const getUnbilledEntries = async (filters?: {
  caseId?: string
  clientId?: string
  assigneeId?: string
}): Promise<{ data: TimeEntry[]; pagination: any }> => {
  try {
    const response = await apiClient.get('/time-tracking/unbilled', { params: filters })
    return response.data
  } catch (error: any) {
    // If endpoint doesn't exist (404), fall back to regular entries with filter
    if (error?.response?.status === 404) {
      console.warn('Unbilled entries endpoint not available, using filtered entries instead')

      const result = await getTimeEntries({
        ...filters,
        status: 'approved', // Unbilled entries are typically approved but not billed
      })

      return {
        data: result.data,
        pagination: result.pagination,
      }
    }

    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.UNBILLED_ENTRIES_NOT_AVAILABLE))
  }
}

/**
 * Get UTBMS activity codes
 *
 * Backend endpoint: GET /api/time-tracking/activity-codes
 * ❌ Status: NOT IMPLEMENTED
 *
 * Fallback: Return empty array with warning
 */
export const getActivityCodes = async (): Promise<Array<{
  code: string
  description: string
  category: string
}>> => {
  try {
    const response = await apiClient.get('/time-tracking/activity-codes')
    return response.data.data || response.data
  } catch (error: any) {
    // If endpoint doesn't exist (404), return empty array
    if (error?.response?.status === 404) {
      console.warn('Activity codes endpoint not available')
      return []
    }

    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.ACTIVITY_CODES_NOT_AVAILABLE))
  }
}

/**
 * Write off a time entry (شطب الوقت)
 *
 * Backend endpoint: POST /api/time-tracking/entries/:id/write-off
 * ❌ Status: NOT IMPLEMENTED
 */
export const writeOffTimeEntry = async (id: string, reason: string): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post(`/time-tracking/entries/${id}/write-off`, {
      reason
    })
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(ERROR_MESSAGES.WRITE_OFF_NOT_AVAILABLE)
    }
    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.WRITE_OFF_NOT_AVAILABLE))
  }
}

/**
 * Write down a time entry (تخفيض المبلغ)
 *
 * Backend endpoint: POST /api/time-tracking/entries/:id/write-down
 * ❌ Status: NOT IMPLEMENTED
 */
export const writeDownTimeEntry = async (id: string, data: {
  amount: number
  reason: string
}): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post(`/time-tracking/entries/${id}/write-down`, data)
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(ERROR_MESSAGES.WRITE_DOWN_NOT_AVAILABLE)
    }
    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.WRITE_DOWN_NOT_AVAILABLE))
  }
}

/**
 * Lock a time entry
 *
 * Backend endpoint: POST /api/time-tracking/entries/:id/lock
 * ❌ Status: NOT IMPLEMENTED
 */
export const lockTimeEntry = async (
  id: string,
  reason: 'approved' | 'billed' | 'period_closed' | 'manual'
): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post(`/time-tracking/entries/${id}/lock`, {
      reason
    })
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(ERROR_MESSAGES.LOCK_NOT_AVAILABLE)
    }
    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.LOCK_NOT_AVAILABLE))
  }
}

/**
 * Unlock a time entry (admin only)
 *
 * Backend endpoint: POST /api/time-tracking/entries/:id/unlock
 * ❌ Status: NOT IMPLEMENTED
 */
export const unlockTimeEntry = async (id: string, reason: string): Promise<TimeEntry> => {
  try {
    const response = await apiClient.post(`/time-tracking/entries/${id}/unlock`, {
      reason
    })
    return response.data.timeEntry || response.data.data
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(ERROR_MESSAGES.LOCK_NOT_AVAILABLE)
    }
    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.LOCK_NOT_AVAILABLE))
  }
}

/**
 * Bulk lock time entries
 *
 * Backend endpoint: POST /api/time-tracking/entries/bulk-lock
 * ❌ Status: NOT IMPLEMENTED
 */
export const bulkLockTimeEntries = async (data: {
  entryIds: string[]
  reason: 'approved' | 'billed' | 'period_closed' | 'manual'
}): Promise<{ locked: number; failed: number; results: any[] }> => {
  try {
    const response = await apiClient.post('/time-tracking/entries/bulk-lock', data)
    return response.data
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(ERROR_MESSAGES.LOCK_NOT_AVAILABLE)
    }
    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.LOCK_NOT_AVAILABLE))
  }
}

/**
 * Check if time entry is locked
 *
 * Backend endpoint: GET /api/time-tracking/entries/:id/lock-status
 * ❌ Status: NOT IMPLEMENTED
 */
export const isTimeEntryLocked = async (id: string): Promise<{
  isLocked: boolean
  lockReason?: string
  lockedAt?: string
  lockedBy?: string
}> => {
  try {
    const response = await apiClient.get(`/time-tracking/entries/${id}/lock-status`)
    return response.data
  } catch (error: any) {
    // If endpoint doesn't exist (404), return not locked
    if (error?.response?.status === 404) {
      console.warn('Lock status endpoint not available, assuming entry is not locked')
      return {
        isLocked: false,
      }
    }
    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.LOCK_NOT_AVAILABLE))
  }
}

/**
 * Lock entries by date range (for period close)
 *
 * Backend endpoint: POST /api/time-tracking/entries/lock-by-date-range
 * ❌ Status: NOT IMPLEMENTED
 */
export const lockTimeEntriesByDateRange = async (data: {
  startDate: string
  endDate: string
  reason: 'period_closed' | 'manual'
}): Promise<{ locked: number; failed: number; results: any[] }> => {
  try {
    const response = await apiClient.post('/time-tracking/entries/lock-by-date-range', data)
    return response.data
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(ERROR_MESSAGES.LOCK_NOT_AVAILABLE)
    }
    throw new Error(handleTimeEntryError(error, ERROR_MESSAGES.LOCK_NOT_AVAILABLE))
  }
}

// ==================== EXPORT ALL ====================

export const timeEntryService = {
  // Timer operations (✅ Implemented)
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  getTimerStatus,

  // CRUD operations (✅ Implemented)
  createTimeEntry,
  getTimeEntries,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,

  // Approval workflow (✅ Implemented)
  approveTimeEntry,
  rejectTimeEntry,

  // Analytics (✅ Implemented)
  getTimeStats,

  // Bulk operations (⚠️ Partially Implemented)
  bulkDeleteTimeEntries, // ✅ Implemented
  bulkApproveTimeEntries, // ❌ Not implemented (falls back to individual approvals)

  // Not implemented (❌)
  getUnbilledEntries, // ❌ Falls back to filtered entries
  getActivityCodes, // ❌ Returns empty array
  writeOffTimeEntry, // ❌ Throws error
  writeDownTimeEntry, // ❌ Throws error
  lockTimeEntry, // ❌ Throws error
  unlockTimeEntry, // ❌ Throws error
  bulkLockTimeEntries, // ❌ Throws error
  isTimeEntryLocked, // ❌ Returns false
  lockTimeEntriesByDateRange, // ❌ Throws error
}

export default timeEntryService
