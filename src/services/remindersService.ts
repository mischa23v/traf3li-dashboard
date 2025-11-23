/**
 * Reminders Service
 * Handles all reminder-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Reminder Interface
 */
export interface Reminder {
  _id: string
  title: string
  description?: string
  userId: string
  reminderDate: string
  reminderTime: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'task' | 'hearing' | 'deadline' | 'meeting' | 'payment' | 'general'
  relatedCase?: string
  relatedTask?: string
  relatedEvent?: string
  status: 'pending' | 'completed' | 'dismissed'
  notificationSent: boolean
  notificationSentAt?: string
  recurring?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    endDate?: string
  }
  completedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Reminder Data
 */
export interface CreateReminderData {
  title: string
  description?: string
  reminderDate: string
  reminderTime: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  type?: 'task' | 'hearing' | 'deadline' | 'meeting' | 'payment' | 'general'
  relatedCase?: string
  relatedTask?: string
  relatedEvent?: string
  recurring?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    endDate?: string
  }
  notes?: string
}

/**
 * Reminder Filters
 */
export interface ReminderFilters {
  status?: string
  priority?: string
  type?: string
  relatedCase?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

/**
 * Reminders Service Object
 */
const remindersService = {
  /**
   * Get all reminders
   */
  getReminders: async (filters?: ReminderFilters): Promise<{ data: Reminder[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/reminders', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Get reminders error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single reminder
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
   * Create reminder
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

  /**
   * Get upcoming reminders
   */
  getUpcoming: async (days: number = 7): Promise<{ data: Reminder[]; count: number }> => {
    try {
      const response = await apiClient.get('/reminders/upcoming', {
        params: { days },
      })
      return response.data
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
      return response.data
    } catch (error: any) {
      console.error('Get overdue reminders error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark reminder as completed
   */
  completeReminder: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/complete`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      console.error('Complete reminder error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Dismiss reminder
   */
  dismissReminder: async (id: string): Promise<Reminder> => {
    try {
      const response = await apiClient.post(`/reminders/${id}/dismiss`)
      return response.data.reminder || response.data.data
    } catch (error: any) {
      console.error('Dismiss reminder error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete reminders
   */
  bulkDelete: async (reminderIds: string[]): Promise<{ count: number }> => {
    try {
      const response = await apiClient.delete('/reminders/bulk', {
        data: { reminderIds },
      })
      return response.data
    } catch (error: any) {
      console.error('Bulk delete reminders error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default remindersService
