/**
 * Activity Service
 * Centralized service for logging and retrieving activity records
 * Activities are created when tasks, events, reminders are created/updated
 */

import apiClient from '@/lib/api'

// ==================== TYPES ====================

export type ActivityType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_reopened'
  | 'task_deleted'
  | 'task_assigned'
  | 'task_status_changed'
  | 'task_priority_changed'
  | 'subtask_added'
  | 'subtask_completed'
  | 'comment_added'
  | 'attachment_added'
  | 'attachment_deleted'
  | 'event_created'
  | 'event_updated'
  | 'event_cancelled'
  | 'event_rescheduled'
  | 'reminder_created'
  | 'reminder_triggered'
  | 'reminder_snoozed'
  | 'reminder_completed'
  | 'reminder_dismissed'
  | 'time_tracking_started'
  | 'time_tracking_stopped'

export type ActivityEntityType = 'task' | 'event' | 'reminder' | 'case' | 'client'

export interface Activity {
  _id: string
  type: ActivityType
  entityType: ActivityEntityType
  entityId: string
  entityTitle?: string
  description: string
  descriptionAr: string
  userId: string
  userName?: string
  userAvatar?: string
  metadata?: Record<string, any>
  oldValue?: any
  newValue?: any
  createdAt: string
}

export interface CreateActivityInput {
  type: ActivityType
  entityType: ActivityEntityType
  entityId: string
  entityTitle?: string
  description: string
  descriptionAr: string
  metadata?: Record<string, any>
  oldValue?: any
  newValue?: any
}

export interface ActivityFilters {
  entityType?: ActivityEntityType
  entityId?: string
  type?: ActivityType | ActivityType[]
  userId?: string
  fromDate?: string
  toDate?: string
  limit?: number
  page?: number
}

export interface ActivityResponse {
  activities: Activity[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ==================== ACTIVITY DESCRIPTIONS ====================

export const ACTIVITY_DESCRIPTIONS: Record<ActivityType, { en: string; ar: string }> = {
  task_created: {
    en: 'Task created',
    ar: 'تم إنشاء المهمة',
  },
  task_updated: {
    en: 'Task updated',
    ar: 'تم تحديث المهمة',
  },
  task_completed: {
    en: 'Task completed',
    ar: 'تم إكمال المهمة',
  },
  task_reopened: {
    en: 'Task reopened',
    ar: 'تم إعادة فتح المهمة',
  },
  task_deleted: {
    en: 'Task deleted',
    ar: 'تم حذف المهمة',
  },
  task_assigned: {
    en: 'Task assigned',
    ar: 'تم تعيين المهمة',
  },
  task_status_changed: {
    en: 'Status changed',
    ar: 'تم تغيير الحالة',
  },
  task_priority_changed: {
    en: 'Priority changed',
    ar: 'تم تغيير الأولوية',
  },
  subtask_added: {
    en: 'Subtask added',
    ar: 'تم إضافة مهمة فرعية',
  },
  subtask_completed: {
    en: 'Subtask completed',
    ar: 'تم إكمال المهمة الفرعية',
  },
  comment_added: {
    en: 'Comment added',
    ar: 'تم إضافة تعليق',
  },
  attachment_added: {
    en: 'Attachment added',
    ar: 'تم إضافة مرفق',
  },
  attachment_deleted: {
    en: 'Attachment deleted',
    ar: 'تم حذف المرفق',
  },
  event_created: {
    en: 'Event created',
    ar: 'تم إنشاء الحدث',
  },
  event_updated: {
    en: 'Event updated',
    ar: 'تم تحديث الحدث',
  },
  event_cancelled: {
    en: 'Event cancelled',
    ar: 'تم إلغاء الحدث',
  },
  event_rescheduled: {
    en: 'Event rescheduled',
    ar: 'تم إعادة جدولة الحدث',
  },
  reminder_created: {
    en: 'Reminder created',
    ar: 'تم إنشاء التذكير',
  },
  reminder_triggered: {
    en: 'Reminder triggered',
    ar: 'تم تفعيل التذكير',
  },
  reminder_snoozed: {
    en: 'Reminder snoozed',
    ar: 'تم تأجيل التذكير',
  },
  reminder_completed: {
    en: 'Reminder completed',
    ar: 'تم إكمال التذكير',
  },
  reminder_dismissed: {
    en: 'Reminder dismissed',
    ar: 'تم رفض التذكير',
  },
  time_tracking_started: {
    en: 'Time tracking started',
    ar: 'تم بدء تتبع الوقت',
  },
  time_tracking_stopped: {
    en: 'Time tracking stopped',
    ar: 'تم إيقاف تتبع الوقت',
  },
}

// ==================== HELPER FUNCTIONS ====================

export function getActivityDescription(type: ActivityType, lang: 'en' | 'ar' = 'ar'): string {
  return ACTIVITY_DESCRIPTIONS[type]?.[lang] || type
}

export function formatActivityMessage(
  activity: Activity,
  lang: 'en' | 'ar' = 'ar'
): string {
  const baseDescription = getActivityDescription(activity.type, lang)

  // Add context based on metadata
  if (activity.metadata) {
    if (activity.type === 'task_assigned' && activity.metadata.assigneeName) {
      return lang === 'ar'
        ? `${baseDescription} إلى ${activity.metadata.assigneeName}`
        : `${baseDescription} to ${activity.metadata.assigneeName}`
    }
    if (activity.type === 'task_status_changed' && activity.oldValue && activity.newValue) {
      return lang === 'ar'
        ? `${baseDescription} من "${activity.oldValue}" إلى "${activity.newValue}"`
        : `${baseDescription} from "${activity.oldValue}" to "${activity.newValue}"`
    }
    if (activity.type === 'task_priority_changed' && activity.oldValue && activity.newValue) {
      return lang === 'ar'
        ? `${baseDescription} من "${activity.oldValue}" إلى "${activity.newValue}"`
        : `${baseDescription} from "${activity.oldValue}" to "${activity.newValue}"`
    }
  }

  return baseDescription
}

// ==================== SERVICE ====================

const activityService = {
  /**
   * Create a new activity record
   */
  create: async (input: CreateActivityInput): Promise<Activity> => {
    try {
      const response = await apiClient.post('/activities', input)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get activities with optional filters
   */
  getAll: async (filters?: ActivityFilters): Promise<ActivityResponse> => {
    try {
      const params = new URLSearchParams()
      if (filters?.entityType) params.append('entityType', filters.entityType)
      if (filters?.entityId) params.append('entityId', filters.entityId)
      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          filters.type.forEach(t => params.append('type', t))
        } else {
          params.append('type', filters.type)
        }
      }
      if (filters?.userId) params.append('userId', filters.userId)
      if (filters?.fromDate) params.append('fromDate', filters.fromDate)
      if (filters?.toDate) params.append('toDate', filters.toDate)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.page) params.append('page', filters.page.toString())

      const response = await apiClient.get(`/activities?${params.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get activities for a specific entity (task, event, reminder)
   */
  getByEntity: async (
    entityType: ActivityEntityType,
    entityId: string,
    limit = 50
  ): Promise<Activity[]> => {
    try {
      const response = await apiClient.get(
        `/activities/${entityType}/${entityId}?limit=${limit}`
      )
      return response.data.activities || response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get recent activities for the current user
   */
  getRecent: async (limit = 20): Promise<Activity[]> => {
    try {
      const response = await apiClient.get(`/activities/recent?limit=${limit}`)
      return response.data.activities || response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Log a task activity
   */
  logTaskActivity: async (
    taskId: string,
    type: ActivityType,
    taskTitle?: string,
    metadata?: Record<string, any>,
    oldValue?: any,
    newValue?: any
  ): Promise<Activity | null> => {
    try {
      const description = ACTIVITY_DESCRIPTIONS[type]
      return await activityService.create({
        type,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        description: description?.en || type,
        descriptionAr: description?.ar || type,
        metadata,
        oldValue,
        newValue,
      })
    } catch {
      // Log error but don't throw - activity logging should not break the main flow
      return null
    }
  },

  /**
   * Log an event activity
   */
  logEventActivity: async (
    eventId: string,
    type: ActivityType,
    eventTitle?: string,
    metadata?: Record<string, any>
  ): Promise<Activity | null> => {
    try {
      const description = ACTIVITY_DESCRIPTIONS[type]
      return await activityService.create({
        type,
        entityType: 'event',
        entityId: eventId,
        entityTitle: eventTitle,
        description: description?.en || type,
        descriptionAr: description?.ar || type,
        metadata,
      })
    } catch {
      return null
    }
  },

  /**
   * Log a reminder activity
   */
  logReminderActivity: async (
    reminderId: string,
    type: ActivityType,
    reminderTitle?: string,
    metadata?: Record<string, any>
  ): Promise<Activity | null> => {
    try {
      const description = ACTIVITY_DESCRIPTIONS[type]
      return await activityService.create({
        type,
        entityType: 'reminder',
        entityId: reminderId,
        entityTitle: reminderTitle,
        description: description?.en || type,
        descriptionAr: description?.ar || type,
        metadata,
      })
    } catch {
      return null
    }
  },
}

export default activityService
