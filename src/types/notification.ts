/**
 * Notification Types
 * Type definitions for the notification system
 */

export type NotificationType =
  | 'invoice_approval'
  | 'time_entry_approval'
  | 'expense_approval'
  | 'payment_received'
  | 'invoice_overdue'
  | 'budget_alert'
  | 'system'
  | 'task_reminder'
  | 'hearing_reminder'
  | 'case_update'
  | 'message'
  | 'general'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  titleAr: string
  message: string
  messageAr: string
  priority: NotificationPriority
  read: boolean
  readAt?: string
  actionUrl?: string
  actionLabel?: string
  actionLabelAr?: string
  relatedId?: string
  relatedType?: string
  metadata?: Record<string, any>
  createdAt: string
  expiresAt?: string
}

export interface NotificationFilters {
  type?: NotificationType | NotificationType[]
  priority?: NotificationPriority
  read?: boolean
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

export interface NotificationSettings {
  _id?: string
  userId: string
  emailNotifications: {
    invoiceApproval: boolean
    timeEntryApproval: boolean
    expenseApproval: boolean
    paymentReceived: boolean
    invoiceOverdue: boolean
    budgetAlert: boolean
  }
  pushNotifications: {
    invoiceApproval: boolean
    timeEntryApproval: boolean
    expenseApproval: boolean
    paymentReceived: boolean
    invoiceOverdue: boolean
    budgetAlert: boolean
  }
  inAppNotifications: {
    invoiceApproval: boolean
    timeEntryApproval: boolean
    expenseApproval: boolean
    paymentReceived: boolean
    invoiceOverdue: boolean
    budgetAlert: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}

export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  titleAr: string
  message: string
  messageAr: string
  priority?: NotificationPriority
  actionUrl?: string
  actionLabel?: string
  actionLabelAr?: string
  relatedId?: string
  relatedType?: string
  metadata?: Record<string, any>
  expiresAt?: string
}
