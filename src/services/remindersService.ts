/**
 * Reminders Service
 * Production-ready reminder management with advanced features
 * Handles all reminder-related API calls including snooze, recurring, notification channels
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== ENUMS ====================
 */

export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'
export type ReminderType = 'task' | 'hearing' | 'deadline' | 'meeting' | 'payment' | 'general' | 'follow_up' | 'court_date' | 'document_submission' | 'client_call'
export type ReminderStatus = 'pending' | 'snoozed' | 'triggered' | 'completed' | 'dismissed' | 'expired'
export type NotificationChannel = 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type RecurrenceEndType = 'never' | 'after_occurrences' | 'on_date'

/**
 * ==================== INTERFACES ====================
 */

export interface SnoozeConfig {
  snoozedAt: string
  snoozeUntil: string
  snoozeCount: number
  reason?: string
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

export interface NotificationConfig {
  channels: NotificationChannel[]
  // Advance notification times (in minutes before reminder)
  advanceNotifications?: number[]
  // Escalation if not acknowledged
  escalationEnabled?: boolean
  escalationDelayMinutes?: number
  escalationTo?: string[] // User IDs
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

export interface Reminder {
  _id: string
  // Basic info
  title: string
  description?: string
  message?: string
  notes?: string
  // User assignment
  userId: string
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
  // Timing
  reminderDate: string
  reminderTime: string
  dueDate?: string
  time?: string
  timezone?: string
  // Classification
  priority: ReminderPriority
  type: ReminderType
  status: ReminderStatus
  tags?: string[]
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
  relatedTask?: string
  relatedEvent?: string
  relatedClient?: string | {
    _id: string
    name?: string
    fullName?: string
  }
  // Snooze
  snooze?: SnoozeConfig
  maxSnoozeCount?: number
  // Recurring
  recurring?: RecurringConfig
  isRecurringInstance?: boolean
  parentReminderId?: string
  // Notifications
  notification?: NotificationConfig
  notificationSent: boolean
  notificationSentAt?: string
  lastNotificationAt?: string
  // Acknowledgment
  acknowledgment?: ReminderAcknowledgment
  completedAt?: string
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
  reminderDate: string
  reminderTime: string
  timezone?: string
  priority?: ReminderPriority
  type?: ReminderType
  tags?: string[]
  assignedTo?: string
  relatedCase?: string
  relatedTask?: string
  relatedEvent?: string
  relatedClient?: string
  maxSnoozeCount?: number
  recurring?: RecurringConfig
  notification?: NotificationConfig
}

/**
 * Reminder Filters
 */
export interface ReminderFilters {
  status?: ReminderStatus | ReminderStatus[]
  priority?: ReminderPriority | ReminderPriority[]
  type?: ReminderType | ReminderType[]
  assignedTo?: string
  relatedCase?: string
  relatedClient?: string
  isRecurring?: boolean
  tags?: string[]
  startDate?: string
  endDate?: string
  search?: string
  overdue?: boolean
  today?: boolean
  upcoming?: boolean
  sortBy?: 'reminderDate' | 'priority' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Snooze Options
 */
export interface SnoozeOptions {
  minutes?: number
  hours?: number
  days?: number
  until?: string // Specific datetime
  reason?: string
}

/**
 * Reminder Statistics
 */
export interface ReminderStats {
  total: number
  byStatus: Record<ReminderStatus, number>
  byPriority: Record<ReminderPriority, number>
  byType: Record<ReminderType, number>
  pending: number
  snoozed: number
  overdue: number
  dueToday: number
  completedThisWeek: number
  completedThisMonth: number
  averageSnoozeCount?: number
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
      console.error('Get reminders error:', error)
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
      console.error('Get reminder error:', error)
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
      console.error('Create reminder error:', error)
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
      console.error('Update reminder error:', error)
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
      console.error('Delete reminder error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Status Operations ====================

  /**
   * Mark reminder as completed
   */
  completeReminder: async (id: string, notes?: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/complete`, { notes })
      return response.data.reminder || response.data.data
    } catch (error: any) {
      console.error('Complete reminder error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Dismiss reminder
   */
  dismissReminder: async (id: string, reason?: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/dismiss`, { reason })
      return response.data.reminder || response.data.data
    } catch (error: any) {
      console.error('Dismiss reminder error:', error)
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
      console.error('Reopen reminder error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Snooze Operations ====================

  /**
   * Snooze reminder
   */
  snoozeReminder: async (id: string, options: SnoozeOptions): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/snooze`, options)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      console.error('Snooze reminder error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Cancel snooze error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Quick snooze options
   */
  snooze15Minutes: async (id: string): Promise<Reminder> => {
    return remindersService.snoozeReminder(id, { minutes: 15 })
  },

  snooze1Hour: async (id: string): Promise<Reminder> => {
    return remindersService.snoozeReminder(id, { hours: 1 })
  },

  snooze1Day: async (id: string): Promise<Reminder> => {
    return remindersService.snoozeReminder(id, { days: 1 })
  },

  snoozeUntilTomorrow: async (id: string): Promise<Reminder> => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // 9 AM tomorrow
    return remindersService.snoozeReminder(id, { until: tomorrow.toISOString() })
  },

  snoozeUntilNextWeek: async (id: string): Promise<Reminder> => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(9, 0, 0, 0)
    return remindersService.snoozeReminder(id, { until: nextWeek.toISOString() })
  },

  // ==================== Delegation ====================

  /**
   * Delegate reminder to another user
   */
  delegateReminder: async (id: string, toUserId: string, message?: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/delegate`, { toUserId, message })
      return response.data.reminder || response.data.data
    } catch (error: any) {
      console.error('Delegate reminder error:', error)
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
      console.error('Get upcoming reminders error:', error)
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
      console.error('Get overdue reminders error:', error)
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
      console.error('Get today reminders error:', error)
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
      console.error('Get snoozed reminders error:', error)
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
      console.error('Get my reminders error:', error)
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
      console.error('Get reminder stats error:', error)
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
      console.error('Skip recurrence error:', error)
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
      console.error('Stop recurrence error:', error)
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
      console.error('Get recurrence history error:', error)
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
      console.error('Update notification config error:', error)
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
      console.error('Send test notification error:', error)
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
      console.error('Acknowledge notification error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Bulk Operations ====================

  /**
   * Bulk update reminders
   */
  bulkUpdate: async (reminderIds: string[], data: Partial<CreateReminderData>): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.patch('/reminders/bulk', { reminderIds, ...data })
      return response.data
    } catch (error: any) {
      console.error('Bulk update error:', error)
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
      console.error('Bulk delete reminders error:', error)
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
      console.error('Bulk complete error:', error)
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
      console.error('Bulk snooze error:', error)
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
      console.error('Bulk dismiss error:', error)
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
      console.error('Import reminders error:', error)
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
      console.error('Export reminders error:', error)
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
      console.error('Get templates error:', error)
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
      console.error('Create from template error:', error)
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
      console.error('Save as template error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default remindersService
