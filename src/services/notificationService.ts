/**
 * Notification Service
 * Handles all notification-related API calls
 * Base route: /api/notifications
 *
 * Backend Routes (IMPLEMENTED):
 * ✅ GET    /                        - getNotifications
 * ✅ GET    /:id                     - getNotification
 * ✅ GET    /unread-count            - getUnreadCount
 * ✅ PATCH  /:id/read                - markAsRead
 * ✅ PATCH  /mark-multiple-read      - markMultipleAsRead (bulk mark as read)
 * ✅ PATCH  /mark-all-read           - markAllAsRead
 * ✅ DELETE /:id                     - deleteNotification
 * ✅ DELETE /bulk-delete             - deleteMultipleNotifications (bulk delete)
 * ✅ DELETE /clear-read              - clearReadNotifications
 * ✅ GET    /by-type/:type           - getNotificationsByType
 * ✅ POST   /                        - createNotification (admin-only)
 *
 * Settings endpoints (localStorage fallback):
 * ⚠️ GET    /settings                - getSettings (fallback: localStorage)
 * ⚠️ PATCH  /settings                - updateSettings (fallback: localStorage)
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
 * Bilingual error messages
 */
const BILINGUAL_ERRORS = {
  SETTINGS_NOT_AVAILABLE:
    'Notification settings not available on server - using local storage | إعدادات الإشعارات غير متاحة على الخادم - استخدام التخزين المحلي',
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
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/notifications/:id
   */
  getNotification: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.get(`/notifications/${id}`)
      return response.data.notification || response.data.data
    } catch (error: any) {
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
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * PATCH /api/notifications/mark-multiple-read
   */
  markMultipleAsRead: async (ids: string[]): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.patch('/notifications/mark-multiple-read', { ids })
      return response.data
    } catch (error: any) {
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
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/notifications/bulk-delete
   */
  deleteMultipleNotifications: async (ids: string[]): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.delete('/notifications/bulk-delete', { data: { ids } })
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to delete notifications | فشل حذف الإشعارات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Clear all read notifications
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/notifications/clear-read
   */
  clearReadNotifications: async (): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.delete('/notifications/clear-read')
      return response.data
    } catch (error: any) {
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
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/notifications
   */
  createNotification: async (data: CreateNotificationData): Promise<Notification> => {
    try {
      const response = await apiClient.post('/notifications', data)
      return response.data.notification || response.data.data
    } catch (error: any) {
      throw new Error(
        `Failed to create notification | فشل إنشاء الإشعار: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get notifications by type
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/notifications/by-type/:type
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
      throw new Error(
        `Failed to get notifications by type | فشل الحصول على الإشعارات حسب النوع: ${handleApiError(error)}`
      )
    }
  },
}

export default notificationService
