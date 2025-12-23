/**
 * Notification Service
 * Handles all notification-related API calls
 * Base route: /api/notifications
 *
 * ⚠️ IMPORTANT: API ENDPOINT MISMATCHES
 * This service contains methods that call endpoints not implemented in the backend.
 * Each non-existent endpoint has been updated with proper error handling and bilingual messages.
 *
 * Backend Routes (VERIFIED - /traf3li-backend/src/routes/notification.route.js):
 * ✅ GET    /               - getNotifications
 * ✅ GET    /unread-count   - getUnreadCount
 * ✅ PATCH  /:id/read       - markAsRead
 * ✅ PATCH  /mark-all-read  - markAllAsRead
 * ✅ DELETE /:id            - deleteNotification
 *
 * Missing Endpoints (require backend implementation):
 * ❌ GET    /:id                      - getNotification (fallback: client-side filtering)
 * ❌ PATCH  /mark-multiple-read      - markMultipleAsRead (fallback: sequential calls)
 * ❌ DELETE /bulk-delete              - deleteMultipleNotifications (fallback: sequential calls)
 * ❌ DELETE /clear-read               - clearReadNotifications (fallback: filter & delete)
 * ❌ GET    /settings                 - getSettings (fallback: localStorage)
 * ❌ PATCH  /settings                 - updateSettings (fallback: localStorage)
 * ❌ POST   /                         - createNotification (admin-only)
 * ❌ GET    /by-type/:type            - getNotificationsByType (fallback: client-side filtering)
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  Notification,
  NotificationFilters,
  NotificationSettings,
  CreateNotificationData,
} from '@/types/notification'

// Re-export types
export type {
  Notification,
  NotificationFilters,
  NotificationSettings,
  CreateNotificationData,
}

/**
 * Bilingual error messages for API mismatches
 */
const BILINGUAL_ERRORS = {
  ENDPOINT_NOT_IMPLEMENTED:
    'This feature is not yet implemented on the server | هذه الميزة غير مطبقة على الخادم بعد',
  SINGLE_NOTIFICATION_NOT_FOUND:
    'Cannot fetch single notification - endpoint not implemented | لا يمكن جلب الإشعار - النقطة النهائية غير مطبقة',
  BULK_MARK_READ_NOT_AVAILABLE:
    'Bulk mark as read not available - using fallback | وضع علامة قراءة جماعية غير متاحة - استخدام البديل',
  BULK_DELETE_NOT_AVAILABLE:
    'Bulk delete not available - using fallback | الحذف الجماعي غير متاح - استخدام البديل',
  CLEAR_READ_NOT_AVAILABLE:
    'Clear read notifications not available - using fallback | مسح الإشعارات المقروءة غير متاح - استخدام البديل',
  SETTINGS_NOT_AVAILABLE:
    'Notification settings not available on server - using local storage | إعدادات الإشعارات غير متاحة على الخادم - استخدام التخزين المحلي',
  ADMIN_FEATURE_NOT_AVAILABLE:
    'Admin feature not implemented on server | ميزة المسؤول غير مطبقة على الخادم',
  FILTER_BY_TYPE_NOT_AVAILABLE:
    'Filter by type not available - using client-side filtering | التصفية حسب النوع غير متاحة - استخدام التصفية من جانب العميل',
}

/**
 * localStorage key for notification settings fallback
 */
const SETTINGS_STORAGE_KEY = 'traf3li_notification_settings'

/**
 * Notification Service Object
 */
const notificationService = {
  /**
   * Get all notifications for the user with filters
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/notifications
   */
  getNotifications: async (
    filters?: NotificationFilters
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> => {
    try {
      const response = await apiClient.get('/notifications', { params: filters })
      return {
        notifications: response.data.notifications || response.data.data || [],
        total: response.data.total || 0,
        unreadCount: response.data.unreadCount || 0,
      }
    } catch (error: any) {
      throw new Error(
        `Failed to fetch notifications | فشل جلب الإشعارات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get a single notification by ID
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * GET /api/notifications/:id
   *
   * Fallback: Attempts to call backend first, if fails (404), fetches all notifications
   * and filters client-side. This is less efficient but provides functionality.
   */
  getNotification: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.get(`/notifications/${id}`)
      return response.data.notification || response.data.data
    } catch (error: any) {
      // If 404, try fallback: fetch all notifications and filter client-side
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn(
          '[Notification Service] GET /:id not implemented, using client-side fallback',
          BILINGUAL_ERRORS.SINGLE_NOTIFICATION_NOT_FOUND
        )
        try {
          const allNotifications = await notificationService.getNotifications()
          const notification = allNotifications.notifications.find((n) => n._id === id)
          if (notification) {
            return notification
          }
          throw new Error(
            `Notification not found | الإشعار غير موجود (ID: ${id})`
          )
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to fetch notification | فشل جلب الإشعار: ${fallbackError.message || handleApiError(fallbackError)}`
          )
        }
      }
      throw new Error(
        `Failed to fetch notification | فشل جلب الإشعار: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get unread notification count
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/notifications/unread-count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const response = await apiClient.get('/notifications/unread-count')
      return {
        count: response.data.count || response.data.unreadCount || 0,
      }
    } catch (error: any) {
      throw new Error(
        `Failed to get unread count | فشل الحصول على عدد الإشعارات غير المقروءة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Mark single notification as read
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * PATCH /api/notifications/:id/read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`)
      return response.data.notification || response.data.data
    } catch (error: any) {
      throw new Error(
        `Failed to mark notification as read | فشل وضع علامة قراءة على الإشعار: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Mark multiple notifications as read
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * PATCH /api/notifications/mark-multiple-read
   *
   * Fallback: Calls markAsRead sequentially for each ID.
   * This is less efficient but provides functionality until backend implements bulk endpoint.
   */
  markMultipleAsRead: async (ids: string[]): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.patch('/notifications/mark-multiple-read', { ids })
      return response.data
    } catch (error: any) {
      // If 404, use fallback: mark each notification individually
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn(
          '[Notification Service] PATCH /mark-multiple-read not implemented, using sequential fallback',
          BILINGUAL_ERRORS.BULK_MARK_READ_NOT_AVAILABLE
        )
        try {
          let successCount = 0
          const errors: string[] = []

          // Mark each notification individually
          for (const id of ids) {
            try {
              await notificationService.markAsRead(id)
              successCount++
            } catch (err: any) {
              errors.push(`${id}: ${err.message}`)
            }
          }

          if (errors.length > 0) {
            console.warn(`[Notification Service] Some notifications failed to mark as read:`, errors)
          }

          return {
            success: successCount > 0,
            count: successCount,
          }
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to mark notifications as read | فشل وضع علامة قراءة على الإشعارات: ${fallbackError.message || handleApiError(fallbackError)}`
          )
        }
      }
      throw new Error(
        `Failed to mark notifications as read | فشل وضع علامة قراءة على الإشعارات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Mark all notifications as read
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * PATCH /api/notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<{ success: boolean; message: string; count: number }> => {
    try {
      const response = await apiClient.patch('/notifications/mark-all-read')
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to mark all notifications as read | فشل وضع علامة قراءة على جميع الإشعارات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Delete notification
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/notifications/:id
   */
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/${id}`)
    } catch (error: any) {
      throw new Error(
        `Failed to delete notification | فشل حذف الإشعار: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Delete multiple notifications
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * DELETE /api/notifications/bulk-delete
   *
   * Fallback: Calls deleteNotification sequentially for each ID.
   * This is less efficient but provides functionality until backend implements bulk endpoint.
   */
  deleteMultipleNotifications: async (ids: string[]): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.delete('/notifications/bulk-delete', { data: { ids } })
      return response.data
    } catch (error: any) {
      // If 404, use fallback: delete each notification individually
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn(
          '[Notification Service] DELETE /bulk-delete not implemented, using sequential fallback',
          BILINGUAL_ERRORS.BULK_DELETE_NOT_AVAILABLE
        )
        try {
          let successCount = 0
          const errors: string[] = []

          // Delete each notification individually
          for (const id of ids) {
            try {
              await notificationService.deleteNotification(id)
              successCount++
            } catch (err: any) {
              errors.push(`${id}: ${err.message}`)
            }
          }

          if (errors.length > 0) {
            console.warn(`[Notification Service] Some notifications failed to delete:`, errors)
          }

          return {
            success: successCount > 0,
            count: successCount,
          }
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to delete notifications | فشل حذف الإشعارات: ${fallbackError.message || handleApiError(fallbackError)}`
          )
        }
      }
      throw new Error(
        `Failed to delete notifications | فشل حذف الإشعارات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Clear all read notifications
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * DELETE /api/notifications/clear-read
   *
   * Fallback: Fetches all notifications, filters read ones, and deletes them individually.
   * This is less efficient but provides functionality until backend implements this endpoint.
   */
  clearReadNotifications: async (): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.delete('/notifications/clear-read')
      return response.data
    } catch (error: any) {
      // If 404, use fallback: fetch all, filter read, and delete
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn(
          '[Notification Service] DELETE /clear-read not implemented, using client-side fallback',
          BILINGUAL_ERRORS.CLEAR_READ_NOT_AVAILABLE
        )
        try {
          // Fetch all notifications
          const allNotifications = await notificationService.getNotifications()
          const readNotifications = allNotifications.notifications.filter((n) => n.read)

          if (readNotifications.length === 0) {
            return { success: true, count: 0 }
          }

          let successCount = 0
          const errors: string[] = []

          // Delete each read notification
          for (const notification of readNotifications) {
            try {
              await notificationService.deleteNotification(notification._id)
              successCount++
            } catch (err: any) {
              errors.push(`${notification._id}: ${err.message}`)
            }
          }

          if (errors.length > 0) {
            console.warn(`[Notification Service] Some read notifications failed to delete:`, errors)
          }

          return {
            success: successCount > 0,
            count: successCount,
          }
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to clear read notifications | فشل مسح الإشعارات المقروءة: ${fallbackError.message || handleApiError(fallbackError)}`
          )
        }
      }
      throw new Error(
        `Failed to clear read notifications | فشل مسح الإشعارات المقروءة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get notification settings
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * GET /api/notifications/settings
   *
   * Fallback: Uses localStorage to store/retrieve notification settings.
   * Returns default settings if nothing stored.
   */
  getSettings: async (): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.get('/notifications/settings')
      return response.data.settings || response.data.data
    } catch (error: any) {
      // If 404, use fallback: localStorage
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn(
          '[Notification Service] GET /settings not implemented, using localStorage fallback',
          BILINGUAL_ERRORS.SETTINGS_NOT_AVAILABLE
        )
        try {
          const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
          if (stored) {
            return JSON.parse(stored)
          }
          // Return default settings
          const defaultSettings: NotificationSettings = {
            email: true,
            push: true,
            sms: false,
            inApp: true,
            caseUpdates: true,
            payments: true,
            reminders: true,
            marketing: false,
          }
          return defaultSettings
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to get notification settings | فشل الحصول على إعدادات الإشعارات: ${fallbackError.message}`
          )
        }
      }
      throw new Error(
        `Failed to get notification settings | فشل الحصول على إعدادات الإشعارات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Update notification settings
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * PATCH /api/notifications/settings
   *
   * Fallback: Stores settings in localStorage and returns updated settings.
   */
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.patch('/notifications/settings', settings)
      return response.data.settings || response.data.data
    } catch (error: any) {
      // If 404, use fallback: localStorage
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn(
          '[Notification Service] PATCH /settings not implemented, using localStorage fallback',
          BILINGUAL_ERRORS.SETTINGS_NOT_AVAILABLE
        )
        try {
          // Get current settings
          const currentSettings = await notificationService.getSettings()
          // Merge with new settings
          const updatedSettings = { ...currentSettings, ...settings }
          // Store in localStorage
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings))
          return updatedSettings
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to update notification settings | فشل تحديث إعدادات الإشعارات: ${fallbackError.message}`
          )
        }
      }
      throw new Error(
        `Failed to update notification settings | فشل تحديث إعدادات الإشعارات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Create a notification (admin/system use)
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * POST /api/notifications
   *
   * This is an admin-only endpoint. No fallback available - must be implemented in backend.
   */
  createNotification: async (data: CreateNotificationData): Promise<Notification> => {
    try {
      const response = await apiClient.post('/notifications', data)
      return response.data.notification || response.data.data
    } catch (error: any) {
      // If 404, throw clear error - no fallback for admin operations
      if (error?.status === 404 || error?.response?.status === 404) {
        console.error(
          '[Notification Service] POST / not implemented - admin feature requires backend',
          BILINGUAL_ERRORS.ADMIN_FEATURE_NOT_AVAILABLE
        )
        throw new Error(
          `Cannot create notification - admin feature not implemented on server | لا يمكن إنشاء الإشعار - ميزة المسؤول غير مطبقة على الخادم`
        )
      }
      throw new Error(
        `Failed to create notification | فشل إنشاء الإشعار: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get notifications by type
   * ❌ ENDPOINT NOT IMPLEMENTED IN BACKEND
   * GET /api/notifications/by-type/:type
   *
   * Fallback: Fetches all notifications and filters by type client-side.
   */
  getNotificationsByType: async (
    type: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ notifications: Notification[]; total: number }> => {
    try {
      const response = await apiClient.get(`/notifications/by-type/${type}`, { params })
      return {
        notifications: response.data.notifications || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      // If 404, use fallback: fetch all and filter client-side
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn(
          '[Notification Service] GET /by-type/:type not implemented, using client-side filtering',
          BILINGUAL_ERRORS.FILTER_BY_TYPE_NOT_AVAILABLE
        )
        try {
          const allNotifications = await notificationService.getNotifications()
          const filteredNotifications = allNotifications.notifications.filter(
            (n) => n.type === type
          )

          // Apply pagination if params provided
          if (params?.page && params?.limit) {
            const start = (params.page - 1) * params.limit
            const end = start + params.limit
            return {
              notifications: filteredNotifications.slice(start, end),
              total: filteredNotifications.length,
            }
          }

          return {
            notifications: filteredNotifications,
            total: filteredNotifications.length,
          }
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to get notifications by type | فشل الحصول على الإشعارات حسب النوع: ${fallbackError.message || handleApiError(fallbackError)}`
          )
        }
      }
      throw new Error(
        `Failed to get notifications by type | فشل الحصول على الإشعارات حسب النوع: ${handleApiError(error)}`
      )
    }
  },
}

export default notificationService
