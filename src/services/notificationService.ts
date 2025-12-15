/**
 * Notification Service
 * Handles all notification-related API calls
 * Base route: /api/notifications
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
 * Notification Service Object
 */
const notificationService = {
  /**
   * Get all notifications for the user with filters
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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get a single notification by ID
   * GET /api/notifications/:id
   */
  getNotification: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.get(`/notifications/${id}`)
      return response.data.notification || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const response = await apiClient.get('/notifications/unread-count')
      return {
        count: response.data.count || response.data.unreadCount || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark single notification as read
   * PATCH /api/notifications/:id/read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`)
      return response.data.notification || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark multiple notifications as read
   * PATCH /api/notifications/mark-multiple-read
   */
  markMultipleAsRead: async (ids: string[]): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.patch('/notifications/mark-multiple-read', { ids })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<{ success: boolean; message: string; count: number }> => {
    try {
      const response = await apiClient.patch('/notifications/mark-all-read')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete multiple notifications
   * DELETE /api/notifications/bulk-delete
   */
  deleteMultipleNotifications: async (ids: string[]): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.delete('/notifications/bulk-delete', { data: { ids } })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Clear all read notifications
   * DELETE /api/notifications/clear-read
   */
  clearReadNotifications: async (): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.delete('/notifications/clear-read')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get notification settings
   * GET /api/notifications/settings
   */
  getSettings: async (): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.get('/notifications/settings')
      return response.data.settings || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update notification settings
   * PATCH /api/notifications/settings
   */
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    try {
      const response = await apiClient.patch('/notifications/settings', settings)
      return response.data.settings || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create a notification (admin/system use)
   * POST /api/notifications
   */
  createNotification: async (data: CreateNotificationData): Promise<Notification> => {
    try {
      const response = await apiClient.post('/notifications', data)
      return response.data.notification || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get notifications by type
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
      throw new Error(handleApiError(error))
    }
  },
}

export default notificationService
