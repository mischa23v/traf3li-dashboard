/**
 * Notification Service
 * Handles all notification-related API calls
 * Base route: /api/notifications
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Notification Interface
 */
export interface Notification {
  _id: string
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Notification Service Object
 */
const notificationService = {
  /**
   * Get all notifications for the user
   * GET /api/notifications
   */
  getNotifications: async (params?: {
    page?: number
    limit?: number
    isRead?: boolean
  }): Promise<{ notifications: Notification[]; total: number }> => {
    try {
      const response = await apiClient.get('/notifications', { params })
      return {
        notifications: response.data.notifications || response.data.data || [],
        total: response.data.total || 0,
      }
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
   * Mark all notifications as read
   * PATCH /api/notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
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
}

export default notificationService
