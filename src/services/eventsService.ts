/**
 * Events Service
 * Handles all event-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Event Interface
 */
export interface Event {
  _id: string
  title: string
  type: 'hearing' | 'meeting' | 'deadline' | 'task' | 'other'
  description?: string
  startDate: string
  endDate?: string
  allDay: boolean
  location?: string
  caseId?: string | { _id?: string; caseNumber?: string; title?: string }
  taskId?: string
  attendees?: string[]
  reminders?: EventReminder[]
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  color: string
  createdBy: string
  recurrence?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    endDate?: string
  }
  createdAt: string
  date?: string
  time?: string
  history?: any[]
  updatedAt: string
}

export interface EventReminder {
  type: 'notification' | 'email' | 'sms'
  time: string
  sent: boolean
}

/**
 * Create Event Data
 */
export interface CreateEventData {
  title: string
  type: 'hearing' | 'meeting' | 'deadline' | 'task' | 'other'
  description?: string
  startDate: string
  endDate?: string
  allDay?: boolean
  location?: string
  caseId?: string
  taskId?: string
  attendees?: string[]
  reminders?: EventReminder[]
  color?: string
  recurrence?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    endDate?: string
  }
}

/**
 * Event Filters
 */
export interface EventFilters {
  startDate?: string
  endDate?: string
  type?: string
  caseId?: string
  status?: string
}

/**
 * Events Service Object
 */
const eventsService = {
  /**
   * Get all events
   */
  getEvents: async (filters?: EventFilters): Promise<{ events: Event[]; tasks: any[] }> => {
    try {
      const response = await apiClient.get('/events', { params: filters })
      return {
        events: response.data.events || [],
        tasks: response.data.tasks || [],
      }
    } catch (error: any) {
      console.error('Get events error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single event
   */
  getEvent: async (id: string): Promise<Event> => {
    try {
      const response = await apiClient.get(`/events/${id}`)
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      console.error('Get event error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create event
   */
  createEvent: async (data: CreateEventData): Promise<Event> => {
    try {
      const response = await apiClient.post('/events', data)
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      console.error('Create event error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update event
   */
  updateEvent: async (id: string, data: Partial<CreateEventData>): Promise<Event> => {
    try {
      const response = await apiClient.put(`/events/${id}`, data)
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      console.error('Update event error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete event
   */
  deleteEvent: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/events/${id}`)
    } catch (error: any) {
      console.error('Delete event error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark event as completed
   */
  completeEvent: async (id: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/complete`)
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      console.error('Complete event error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default eventsService
