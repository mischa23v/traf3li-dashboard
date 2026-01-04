/**
 * Reminders Service
 * Production-ready reminder management with advanced features
 * Handles all reminder-related API calls including snooze, recurring, notification channels
 * Enhanced for Saudi Legal Practice Management
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== ENUMS ====================
 */

export type ReminderPriority = 'low' | 'medium' | 'high' | 'critical'

// Legacy Type (for backwards compatibility)
export type ReminderTypeLegacy =
  | 'task_due'
  | 'hearing'
  | 'deadline'
  | 'meeting'
  | 'payment'
  | 'contract_renewal'
  | 'statute_limitation'
  | 'follow_up'
  | 'general'
  | 'task'

// Enhanced Reminder Type (Saudi Legal)
export type ReminderType =
  | 'general'
  | 'court_hearing'
  | 'filing_deadline'
  | 'appeal_deadline'
  | 'client_meeting'
  | 'client_call'
  | 'payment_due'
  | 'document_deadline'
  | 'contract_renewal'
  | 'follow_up'
  | 'statutory_deadline'
  | 'najiz_deadline'
  | 'other'

// Enhanced Status (API valid values)
export type ReminderStatus = 'pending' | 'snoozed' | 'completed' | 'dismissed' | 'delegated'

// Deadline Type (Saudi Legal)
export type DeadlineType = 'statutory' | 'court_ordered' | 'contractual' | 'internal' | 'none'

// Notification Channels
export type NotificationChannel = 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app'

// Recurrence Frequency
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

// Recurrence End Type
export type RecurrenceEndType = 'never' | 'after_occurrences' | 'on_date'

// Acknowledgment Action
export type AcknowledgmentAction = 'completed' | 'dismissed' | 'snoozed' | 'delegated'

/**
 * ==================== INTERFACES ====================
 */

export interface SnoozeConfig {
  snoozedAt?: string
  snoozeUntil?: string
  snoozeCount: number
  snoozeReason?: string
  maxSnoozeCount: number // Default: 5
}

export interface RecurringConfig {
  enabled: boolean
  frequency: RecurrenceFrequency
  // Weekly options
  daysOfWeek?: number[] // 0-6 (Sunday-Saturday)
  // Monthly options
  dayOfMonth?: number
  weekOfMonth?: number // 1-5
  dayOfWeek?: number // 0-6 for "first Monday of month" etc.
  // Custom interval
  interval?: number
  customDays?: number // For "every X days"
  // End conditions
  endType: RecurrenceEndType
  endDate?: string
  maxOccurrences?: number
  occurrencesCompleted?: number
  // Skip weekends/holidays
  skipWeekends?: boolean
  skipHolidays?: boolean
}

export interface AdvanceNotification {
  beforeMinutes: number
  channels: NotificationChannel[]
  sent: boolean
}

export interface EscalationConfig {
  enabled: boolean
  escalateAfterMinutes: number
  escalateTo?: string // User ID
  escalateToMultiple?: string[] // Multiple escalation targets
  escalated: boolean
  escalationLevel: number
}

export interface NotificationConfig {
  channels: NotificationChannel[]
  // Enhanced advance notifications
  advanceNotifications?: AdvanceNotification[]
  // Escalation configuration
  escalation?: EscalationConfig
  // Do not disturb override
  overrideDnd?: boolean
  // Sound/vibration preferences
  soundEnabled?: boolean
  vibrationEnabled?: boolean
  customSound?: string
}

export interface ReminderAcknowledgment {
  acknowledgedAt: string
  acknowledgedBy: string
  action: 'completed' | 'dismissed' | 'snoozed' | 'delegated'
  notes?: string
  delegatedTo?: string
}

export interface ReminderHistory {
  _id?: string
  action: 'created' | 'updated' | 'snoozed' | 'triggered' | 'completed' | 'dismissed' | 'escalated' | 'delegated'
  timestamp: string
  userId: string
  userName?: string
  details?: string
  oldValue?: any
  newValue?: any
}

export interface Attachment {
  _id?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize?: number
  uploadedBy: string
  uploadedAt: string
}

export interface Reminder {
  _id: string
  id?: string // Alternative ID field
  reminderId?: string // Auto-generated: REM-202511-0001
  // Basic info
  title: string
  description?: string
  message?: string
  notes?: string // Max 1000 chars
  // Date/Time
  reminderDateTime?: string // Required - combined date/time
  reminderDate?: string // Legacy
  reminderTime?: string // Legacy "HH:mm"
  dueDate?: string
  time?: string
  timezone?: string
  // Type (Legacy)
  type?: ReminderTypeLegacy
  // Enhanced Reminder Type (Saudi Legal)
  reminderType: ReminderType
  // Status & Priority
  status: ReminderStatus
  priority: ReminderPriority
  tags?: string[]
  // Deadline Info (Saudi Legal)
  deadlineType: DeadlineType
  actualDeadlineDate?: string // The actual deadline date
  daysBeforeDeadline?: number // Remind X days before
  // User assignment
  userId: string | {
    _id: string
    firstName: string
    lastName: string
    email?: string
    avatar?: string
  }
  assignedTo?: string | {
    _id: string
    firstName: string
    lastName: string
    email?: string
    avatar?: string
    role?: string
  }
  createdBy?: string | {
    _id: string
    firstName: string
    lastName: string
  }
  // Relations
  relatedCase?: string | {
    _id: string
    caseNumber?: string
    title?: string
  }
  caseId?: string | {
    _id?: string
    caseNumber?: string
    title?: string
  }
  relatedTask?: string | {
    _id: string
    title?: string
  }
  relatedEvent?: string | {
    _id: string
    title?: string
  }
  relatedInvoice?: string | {
    _id: string
    invoiceNumber?: string
  }
  clientId?: string | {
    _id: string
    name?: string
    fullName?: string
    phone?: string
    email?: string
  }
  relatedClient?: string | {
    _id: string
    name?: string
    fullName?: string
  }
  // Snooze
  snooze?: SnoozeConfig
  // Recurring
  recurring?: RecurringConfig
  isRecurringInstance?: boolean
  parentReminderId?: string
  // Notifications
  notification?: NotificationConfig
  notificationSent?: boolean
  notificationSentAt?: string
  lastNotificationAt?: string
  // Delegation
  delegatedTo?: string | {
    _id: string
    firstName: string
    lastName: string
  }
  delegatedAt?: string
  delegationNote?: string
  // Acknowledgment
  acknowledgedAt?: string
  acknowledgedBy?: string | {
    _id: string
    firstName: string
    lastName: string
  }
  acknowledgmentAction?: AcknowledgmentAction
  acknowledgment?: ReminderAcknowledgment
  // Completion
  completedAt?: string
  completedBy?: string | {
    _id: string
    firstName: string
    lastName: string
  }
  completionNote?: string
  // Attachments
  attachments?: Attachment[]
  // Audit
  history?: ReminderHistory[]
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Create Reminder Data
 */
export interface CreateReminderData {
  title: string
  description?: string
  message?: string
  notes?: string
  // Date/Time
  reminderDateTime?: string // Preferred - combined date/time
  reminderDate?: string // Legacy
  reminderTime?: string // Legacy
  timezone?: string
  // Type
  type?: ReminderTypeLegacy // Legacy
  reminderType?: ReminderType // Enhanced Saudi Legal type
  // Status & Priority
  priority?: ReminderPriority
  status?: ReminderStatus
  tags?: string[]
  // Deadline Info (Saudi Legal)
  deadlineType?: DeadlineType
  actualDeadlineDate?: string
  daysBeforeDeadline?: number
  // Assignment
  assignedTo?: string
  // Relations
  relatedCase?: string
  relatedTask?: string
  relatedEvent?: string
  relatedInvoice?: string
  clientId?: string
  relatedClient?: string
  // Snooze
  maxSnoozeCount?: number
  // Recurring
  recurring?: Partial<RecurringConfig>
  // Notification
  notification?: Partial<NotificationConfig>
}

/**
 * Reminder Filters
 */
export interface ReminderFilters {
  // Status & Priority
  status?: ReminderStatus | ReminderStatus[]
  priority?: ReminderPriority | ReminderPriority[]
  // Type
  type?: ReminderTypeLegacy | ReminderTypeLegacy[] // Legacy
  reminderType?: ReminderType | ReminderType[] // Enhanced Saudi Legal
  // Deadline Type (Saudi Legal)
  deadlineType?: DeadlineType
  // Assignment
  assignedTo?: string
  // Relations
  relatedCase?: string
  relatedTask?: string
  relatedEvent?: string
  clientId?: string
  relatedClient?: string
  // Features
  isRecurring?: boolean
  tags?: string[]
  // Date Filters
  startDate?: string
  endDate?: string
  // Quick Filters
  search?: string
  overdue?: boolean
  today?: boolean
  upcoming?: boolean
  // Sorting & Pagination
  sortBy?: 'reminderDateTime' | 'reminderDate' | 'priority' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Snooze Options
 *
 * MIGRATION GUIDE - Snooze Options Interface
 * ===========================================
 *
 * ✅ MODERN OPTIONS (use these in new code):
 * ------------------------------------------
 * @property snoozeMinutes - Number of minutes to snooze (mutually exclusive with snoozeUntil)
 * @property snoozeUntil - Specific datetime as ISO string (mutually exclusive with snoozeMinutes)
 * @property snoozeReason - Optional reason for snoozing
 *
 * ❌ LEGACY OPTIONS (deprecated, maintained for backward compatibility):
 * -----------------------------------------------------------------------
 * @deprecated minutes - Use snoozeMinutes instead
 * @deprecated hours - Use snoozeMinutes (convert: hours * 60)
 * @deprecated days - Use snoozeMinutes (convert: days * 1440)
 * @deprecated until - Use snoozeUntil instead
 * @deprecated reason - Use snoozeReason instead
 *
 * MIGRATION PATH:
 * ---------------
 * Step 1: Replace legacy options with modern equivalents
 * Step 2: Test thoroughly
 * Step 3: Remove legacy option usage from codebase
 *
 * EXAMPLE USAGE:
 * --------------
 * // ✅ Modern (correct):
 * { snoozeMinutes: 30 }
 * { snoozeMinutes: 120, snoozeReason: 'In a meeting' }
 * { snoozeUntil: '2024-12-31T10:00:00Z' }
 *
 * // ❌ Legacy (deprecated, will show warnings in dev mode):
 * { minutes: 30 }
 * { hours: 2 }
 * { until: '2024-12-31T10:00:00Z', reason: 'Busy' }
 */
export interface SnoozeOptions {
  // ✅ Modern options (preferred)
  snoozeMinutes?: number // Number of minutes to snooze (OR use snoozeUntil)
  snoozeUntil?: string // Specific datetime ISO string (OR use snoozeMinutes)
  snoozeReason?: string // Optional reason for snoozing

  // ❌ Legacy options (deprecated - maintained for backward compatibility)
  /** @deprecated Use snoozeMinutes instead */
  minutes?: number
  /** @deprecated Use snoozeMinutes (convert: hours * 60) */
  hours?: number
  /** @deprecated Use snoozeMinutes (convert: days * 1440) */
  days?: number
  /** @deprecated Use snoozeUntil instead */
  until?: string
  /** @deprecated Use snoozeReason instead */
  reason?: string
}

/**
 * Reminder Statistics
 */
export interface ReminderStats {
  total: number
  byStatus: Partial<Record<ReminderStatus, number>>
  byPriority: Partial<Record<ReminderPriority, number>>
  byType?: Partial<Record<ReminderTypeLegacy, number>> // Legacy
  // Saudi Legal-specific stats
  byReminderType?: Partial<Record<ReminderType, number>>
  byDeadlineType?: Partial<Record<DeadlineType, number>>
  // Quick stats
  pending: number
  snoozed: number
  delegated?: number
  overdue: number
  dueToday: number
  dueThisWeek?: number
  completedThisWeek: number
  completedThisMonth: number
  // Metrics
  averageSnoozeCount?: number
  averageResponseTime?: number // in minutes
}

/**
 * Bulk Operation Result
 */
export interface BulkOperationResult {
  success: number
  failed: number
  errors?: { id: string; error: string }[]
}

/**
 * Reminders Service Object
 */
const remindersService = {
  // ==================== CRUD Operations ====================

  /**
   * Get all reminders with filters and pagination
   */
  getReminders: async (filters?: ReminderFilters): Promise<{ data: Reminder[]; total: number; pagination: any }> => {
    try {
      const response = await apiClient.get('/reminders', { params: filters })
      return {
        data: response.data.data || response.data.reminders || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {}
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single reminder by ID
   */
  getReminder: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.get(`/reminders/${id}`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new reminder
   */
  createReminder: async (data: CreateReminderData): Promise<Reminder> => {
    try {
      const response = await apiClient.post('/reminders', data)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update reminder
   */
  updateReminder: async (id: string, data: Partial<CreateReminderData>): Promise<Reminder> => {
    try {
      const response = await apiClient.put(`/reminders/${id}`, data)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete reminder
   */
  deleteReminder: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/reminders/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Status Operations ====================

  /**
   * Mark reminder as completed
   */
  completeReminder: async (id: string, completionNote?: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/complete`, { completionNote })
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Dismiss reminder
   * Note: API expects empty body for dismiss endpoint
   */
  dismissReminder: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/dismiss`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reopen a completed/dismissed reminder
   */
  reopenReminder: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/reopen`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Snooze Operations ====================

  /**
   * Snooze reminder
   *
   * @param id - Reminder ID
   * @param options - Snooze options
   *
   * MIGRATION GUIDE - Transitioning from Legacy to Modern Snooze Options
   * =====================================================================
   *
   * ✅ MODERN API (use these in new code):
   * --------------------------------------
   *   - snoozeMinutes: number     → Number of minutes to snooze
   *   - snoozeUntil: string       → ISO datetime string for specific time
   *   - snoozeReason: string      → Optional reason for snoozing
   *
   * ❌ LEGACY API (deprecated, avoid in new code):
   * -----------------------------------------------
   *   - minutes: number           → Use snoozeMinutes instead
   *   - hours: number             → Use snoozeMinutes (convert: hours * 60)
   *   - days: number              → Use snoozeMinutes (convert: days * 1440)
   *   - until: string             → Use snoozeUntil instead
   *   - reason: string            → Use snoozeReason instead
   *
   * MIGRATION EXAMPLES:
   * -------------------
   * ❌ Before (Legacy):
   *    snoozeReminder(id, { minutes: 30 })
   *    snoozeReminder(id, { hours: 2 })
   *    snoozeReminder(id, { days: 1 })
   *    snoozeReminder(id, { until: '2024-12-31T10:00:00Z', reason: 'Busy' })
   *
   * ✅ After (Modern):
   *    snoozeReminder(id, { snoozeMinutes: 30 })
   *    snoozeReminder(id, { snoozeMinutes: 120 })
   *    snoozeReminder(id, { snoozeMinutes: 1440 })
   *    snoozeReminder(id, { snoozeUntil: '2024-12-31T10:00:00Z', snoozeReason: 'Busy' })
   *
   * BACKWARD COMPATIBILITY:
   * -----------------------
   * Legacy options are automatically converted to modern format internally.
   * This ensures existing code continues to work during migration period.
   * However, new code should always use modern options.
   *
   * WHY MIGRATE?
   * ------------
   * - Modern options are more explicit and clear
   * - Consistent naming across the API
   * - Better TypeScript type safety
   * - Easier to maintain and debug
   * - Aligns with backend API expectations
   */
  snoozeReminder: async (id: string, options: SnoozeOptions): Promise<Reminder> => {
    try {
      // Validate input
      if (!id) {
        throw new Error('Reminder ID is required | معرف التذكير مطلوب')
      }

      // Convert legacy options to new API format
      // This conversion logic is kept for backward compatibility with existing code
      const payload: { snoozeMinutes?: number; snoozeUntil?: string; snoozeReason?: string } = {}

      // Modern options (preferred) ✅
      if (options.snoozeMinutes) {
        payload.snoozeMinutes = options.snoozeMinutes
      } else if (options.snoozeUntil) {
        payload.snoozeUntil = options.snoozeUntil
      }
      // Legacy options (deprecated - maintained for backward compatibility) ⚠️
      else if (options.minutes) {
        // Legacy 'minutes' → Modern 'snoozeMinutes'
        payload.snoozeMinutes = options.minutes
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [DEPRECATED] Using legacy "minutes" option. Please migrate to "snoozeMinutes".')
        }
      } else if (options.hours) {
        // Legacy 'hours' → Modern 'snoozeMinutes' (converted)
        payload.snoozeMinutes = options.hours * 60
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [DEPRECATED] Using legacy "hours" option. Please migrate to "snoozeMinutes".')
        }
      } else if (options.days) {
        // Legacy 'days' → Modern 'snoozeMinutes' (converted)
        payload.snoozeMinutes = options.days * 24 * 60
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [DEPRECATED] Using legacy "days" option. Please migrate to "snoozeMinutes".')
        }
      } else if (options.until) {
        // Legacy 'until' → Modern 'snoozeUntil'
        payload.snoozeUntil = options.until
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ [DEPRECATED] Using legacy "until" option. Please migrate to "snoozeUntil".')
        }
      } else {
        throw new Error('Snooze duration or datetime is required | مدة التأجيل أو التاريخ مطلوب')
      }

      // Legacy reason field (deprecated - use snoozeReason instead)
      payload.snoozeReason = options.snoozeReason || options.reason
      if (options.reason && !options.snoozeReason && process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [DEPRECATED] Using legacy "reason" option. Please migrate to "snoozeReason".')
      }

      const response = await apiClient.post(`/reminders/${id}/snooze`, payload)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      // Bilingual error message: English | Arabic
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage || 'Failed to snooze reminder | فشل تأجيل التذكير')
    }
  },

  /**
   * Cancel snooze and restore reminder to pending
   */
  cancelSnooze: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/cancel-snooze`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Quick snooze helper functions
   *
   * MIGRATION NOTE: These functions have been updated to use modern snooze options.
   * ================================================================================
   * ✅ Modern API (currently used):
   *   - snoozeMinutes: number of minutes
   *   - snoozeUntil: ISO datetime string
   *   - snoozeReason: optional reason
   *
   * ❌ Legacy API (deprecated, no longer used):
   *   - minutes, hours, days: use snoozeMinutes
   *   - until: use snoozeUntil
   *   - reason: use snoozeReason
   *
   * These helpers are safe to use - they've been migrated to modern options.
   */
  snooze15Minutes: async (id: string): Promise<Reminder> => {
    // ✅ Updated to modern API (snoozeMinutes instead of legacy 'minutes')
    return remindersService.snoozeReminder(id, { snoozeMinutes: 15 })
  },

  snooze1Hour: async (id: string): Promise<Reminder> => {
    // ✅ Updated to modern API (snoozeMinutes instead of legacy 'hours')
    return remindersService.snoozeReminder(id, { snoozeMinutes: 60 })
  },

  snooze1Day: async (id: string): Promise<Reminder> => {
    // ✅ Updated to modern API (snoozeMinutes instead of legacy 'days')
    return remindersService.snoozeReminder(id, { snoozeMinutes: 1440 })
  },

  snoozeUntilTomorrow: async (id: string): Promise<Reminder> => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // 9 AM tomorrow
    // ✅ Updated to modern API (snoozeUntil instead of legacy 'until')
    return remindersService.snoozeReminder(id, { snoozeUntil: tomorrow.toISOString() })
  },

  snoozeUntilNextWeek: async (id: string): Promise<Reminder> => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(9, 0, 0, 0)
    // ✅ Updated to modern API (snoozeUntil instead of legacy 'until')
    return remindersService.snoozeReminder(id, { snoozeUntil: nextWeek.toISOString() })
  },

  // ==================== Delegation ====================

  /**
   * Delegate reminder to another user
   */
  delegateReminder: async (id: string, delegateTo: string, delegationNote?: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/delegate`, { delegateTo, delegationNote })
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Queries ====================

  /**
   * Get upcoming reminders
   */
  getUpcoming: async (days: number = 7): Promise<{ data: Reminder[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/upcoming', { params: { days } })
      return {
        data: response.data.data || response.data.reminders || [],
        count: response.data.count || response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get overdue reminders
   */
  getOverdue: async (): Promise<{ data: Reminder[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/overdue')
      return {
        data: response.data.data || response.data.reminders || [],
        count: response.data.count || response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get today's reminders
   */
  getToday: async (): Promise<{ data: Reminder[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/today')
      return {
        data: response.data.data || response.data.reminders || [],
        count: response.data.count || response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get snoozed reminders
   */
  getSnoozed: async (): Promise<{ data: Reminder[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/snoozed')
      return {
        data: response.data.data || response.data.reminders || [],
        count: response.data.count || response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get snoozed reminders that are now due
   */
  getSnoozedDue: async (): Promise<{ data: Reminder[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/snoozed-due')
      return {
        data: response.data.data || response.data.reminders || [],
        count: response.data.count || response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get delegated reminders
   */
  getDelegated: async (): Promise<{ data: Reminder[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/delegated')
      return {
        data: response.data.data || response.data.reminders || [],
        count: response.data.count || response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get my reminders (assigned to current user)
   */
  getMyReminders: async (filters?: Omit<ReminderFilters, 'assignedTo'>): Promise<{ data: Reminder[]; total: number }> => {
    try {
      const response = await apiClient.get('/reminders/my-reminders', { params: filters })
      return {
        data: response.data.data || response.data.reminders || [],
        total: response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get reminder statistics
   */
  getStats: async (filters?: { assignedTo?: string; dateFrom?: string; dateTo?: string }): Promise<ReminderStats> => {
    try {
      const response = await apiClient.get('/reminders/stats', { params: filters })
      return response.data.stats || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Recurring Reminders ====================

  /**
   * Skip next occurrence of recurring reminder
   */
  skipRecurrence: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/recurring/skip`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Stop recurring reminder
   */
  stopRecurrence: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/recurring/stop`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get recurring reminder history
   */
  getRecurrenceHistory: async (id: string): Promise<{ occurrences: Reminder[] }> => {
    try {
      const response = await apiClient.get(`/reminders/${id}/recurring/history`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Notification Operations ====================

  /**
   * Update notification preferences for a reminder
   */
  updateNotificationConfig: async (id: string, config: NotificationConfig): Promise<Reminder> => {
    try {
      const response = await apiClient.patch(`/reminders/${id}/notification`, config)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send test notification
   */
  sendTestNotification: async (id: string, channel: NotificationChannel): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/notification/test`, { channel })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Acknowledge notification (mark as seen)
   */
  acknowledgeNotification: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/acknowledge`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Bulk Operations ====================

  /**
   * Bulk update reminders
   * Note: API expects { reminderIds, updates: {...} } format
   */
  bulkUpdate: async (reminderIds: string[], data: Partial<CreateReminderData>): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.put('/reminders/bulk', { reminderIds, updates: data })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete reminders
   */
  bulkDelete: async (reminderIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.delete('/reminders/bulk', { data: { reminderIds } })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk complete reminders
   */
  bulkComplete: async (reminderIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/reminders/bulk/complete', { reminderIds })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk snooze reminders
   */
  bulkSnooze: async (reminderIds: string[], options: SnoozeOptions): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/reminders/bulk/snooze', { reminderIds, ...options })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk dismiss reminders
   */
  bulkDismiss: async (reminderIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/reminders/bulk/dismiss', { reminderIds })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Import/Export ====================

  /**
   * Import reminders from CSV/JSON
   */
  importReminders: async (file: File, format: 'csv' | 'json' = 'csv'): Promise<{ imported: number; failed: number; errors: any[] }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('format', format)
      const response = await apiClient.post('/reminders/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export reminders
   */
  exportReminders: async (filters?: ReminderFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    try {
      const response = await apiClient.get('/reminders/export', {
        params: { ...filters, format },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Templates ====================

  /**
   * Get reminder templates
   */
  getTemplates: async (): Promise<{ templates: Partial<CreateReminderData>[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/templates')
      return {
        templates: response.data.templates || response.data.data || [],
        count: response.data.count || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create reminder from template
   */
  createFromTemplate: async (templateId: string, overrides?: Partial<CreateReminderData>): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/templates/${templateId}/create`, overrides)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save reminder as template
   */
  saveAsTemplate: async (id: string, templateName: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/save-as-template`, { name: templateName })
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default remindersService
