/**
 * Calendar Service
 * Handles all calendar-related API calls including unified calendar view
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Calendar Event Interface
 */
export interface CalendarEvent {
  id: string
  type: 'event' | 'task' | 'reminder'
  title: string
  description?: string
  startDate: string
  endDate?: string
  allDay: boolean
  eventType?: string
  location?: string
  status: string
  color: string
  caseId?: string
  caseName?: string
  caseNumber?: string
  createdBy?: {
    _id: string
    username: string
    image?: string
  }
  attendees?: any[]
  priority?: string
  reminderTime?: string
  reminderType?: string
  notificationSent?: boolean
  isOverdue?: boolean
  assignedTo?: any
}

/**
 * Calendar Response Interface
 */
export interface CalendarResponse {
  success: boolean
  data: {
    events: CalendarEvent[]
    tasks: CalendarEvent[]
    reminders: CalendarEvent[]
    combined?: CalendarEvent[]
    summary: {
      totalItems: number
      eventCount: number
      taskCount: number
      reminderCount: number
    }
  }
  dateRange?: {
    start: string
    end: string
  }
}

/**
 * Calendar Filters
 */
export interface CalendarFilters {
  startDate: string
  endDate: string
  type?: 'event' | 'task' | 'reminder'
  caseId?: string
}

/**
 * Calendar Service Object
 */
const calendarService = {
  /**
   * Get unified calendar view
   */
  getCalendar: async (filters: CalendarFilters): Promise<CalendarResponse> => {
    try {
      const response = await apiClient.get<CalendarResponse>('/calendar', {
        params: filters,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get calendar by specific date
   */
  getCalendarByDate: async (date: string): Promise<CalendarResponse> => {
    try {
      const response = await apiClient.get<CalendarResponse>(
        `/calendar/date/${date}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get calendar by month
   */
  getCalendarByMonth: async (
    year: number,
    month: number
  ): Promise<CalendarResponse> => {
    try {
      const response = await apiClient.get<CalendarResponse>(
        `/calendar/month/${year}/${month}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get upcoming items
   */
  getUpcoming: async (days: number = 7): Promise<CalendarResponse> => {
    try {
      const response = await apiClient.get<CalendarResponse>(
        '/calendar/upcoming',
        {
          params: { days },
        }
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get overdue items
   */
  getOverdue: async (): Promise<CalendarResponse> => {
    try {
      const response = await apiClient.get<CalendarResponse>(
        '/calendar/overdue'
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get calendar statistics
   */
  getStats: async (filters?: {
    startDate?: string
    endDate?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/calendar/stats', {
        params: filters,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default calendarService
