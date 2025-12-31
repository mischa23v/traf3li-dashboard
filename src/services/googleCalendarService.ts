/**
 * Google Calendar Service
 * Handles Google Calendar OAuth and sync operations
 *
 * خدمة تقويم جوجل
 * تتعامل مع مصادقة OAuth ومزامنة تقويم جوجل
 */

import { apiClientNoVersion as apiClient, handleApiError } from '@/lib/api'

// ==================== Types ====================

export interface GoogleCalendar {
  id: string
  summary: string
  description?: string
  primary: boolean
  backgroundColor?: string
  foregroundColor?: string
  accessRole: 'owner' | 'writer' | 'reader'
  selected?: boolean
}

export interface GoogleEvent {
  id: string
  calendarId: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  status: 'confirmed' | 'tentative' | 'cancelled'
  htmlLink?: string
  created?: string
  updated?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>
  }
}

export interface GoogleAuthResponse {
  success: boolean
  data: {
    authUrl: string
  }
}

export interface GoogleConnectionStatus {
  success: boolean
  data: {
    connected: boolean
    email?: string
    expiresAt?: string
    scopes?: string[]
    calendars?: GoogleCalendar[]
  }
}

export interface GoogleCalendarsResponse {
  success: boolean
  data: GoogleCalendar[]
}

export interface GoogleEventsResponse {
  success: boolean
  data: GoogleEvent[]
  nextPageToken?: string
}

export interface GoogleEventResponse {
  success: boolean
  data: GoogleEvent
}

export interface GoogleSyncSettings {
  autoSyncEnabled: boolean
  syncDirection: 'bidirectional' | 'import' | 'export'
  selectedCalendars: string[]
  syncInterval: number // minutes
  lastSyncAt?: string
}

export interface GoogleSyncSettingsResponse {
  success: boolean
  data: GoogleSyncSettings
}

export interface CreateGoogleEventRequest {
  summary: string
  description?: string
  location?: string
  start: { dateTime: string; timeZone?: string }
  end: { dateTime: string; timeZone?: string }
  attendees?: Array<{ email: string }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>
  }
}

// ==================== Service ====================

const googleCalendarService = {
  // ==================== OAuth Flow ====================

  /**
   * Get Google OAuth authorization URL
   * الحصول على رابط مصادقة جوجل
   */
  getAuthUrl: async (): Promise<GoogleAuthResponse> => {
    try {
      const response = await apiClient.get<GoogleAuthResponse>('/google-calendar/auth')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to get Google auth URL | فشل في الحصول على رابط مصادقة جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Disconnect Google Calendar integration
   * فصل تكامل تقويم جوجل
   */
  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/google-calendar/disconnect')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to disconnect Google Calendar | فشل في فصل تقويم جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get Google Calendar connection status
   * الحصول على حالة اتصال تقويم جوجل
   */
  getStatus: async (): Promise<GoogleConnectionStatus> => {
    try {
      const response = await apiClient.get<GoogleConnectionStatus>('/google-calendar/status')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to get Google Calendar status | فشل في الحصول على حالة تقويم جوجل'
      throw new Error(errorMessage)
    }
  },

  // ==================== Calendar Operations ====================

  /**
   * List user's Google calendars
   * عرض قائمة تقويمات جوجل للمستخدم
   */
  getCalendars: async (): Promise<GoogleCalendarsResponse> => {
    try {
      const response = await apiClient.get<GoogleCalendarsResponse>('/google-calendar/calendars')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch Google calendars | فشل في جلب تقويمات جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get events from a Google calendar
   * الحصول على الأحداث من تقويم جوجل
   */
  getEvents: async (calendarId: string, params?: {
    startDate?: string
    endDate?: string
    maxResults?: number
    pageToken?: string
  }): Promise<GoogleEventsResponse> => {
    try {
      const response = await apiClient.get<GoogleEventsResponse>(
        `/google-calendar/calendars/${encodeURIComponent(calendarId)}/events`,
        { params }
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch Google events | فشل في جلب أحداث جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Create event in Google calendar
   * إنشاء حدث في تقويم جوجل
   */
  createEvent: async (calendarId: string, event: CreateGoogleEventRequest): Promise<GoogleEventResponse> => {
    try {
      const response = await apiClient.post<GoogleEventResponse>(
        `/google-calendar/calendars/${encodeURIComponent(calendarId)}/events`,
        event
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to create Google event | فشل في إنشاء حدث جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update event in Google calendar
   * تحديث حدث في تقويم جوجل
   */
  updateEvent: async (calendarId: string, eventId: string, event: Partial<CreateGoogleEventRequest>): Promise<GoogleEventResponse> => {
    try {
      const response = await apiClient.put<GoogleEventResponse>(
        `/google-calendar/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        event
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to update Google event | فشل في تحديث حدث جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Delete event from Google calendar
   * حذف حدث من تقويم جوجل
   */
  deleteEvent: async (calendarId: string, eventId: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/google-calendar/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to delete Google event | فشل في حذف حدث جوجل'
      throw new Error(errorMessage)
    }
  },

  // ==================== Settings & Sync ====================

  /**
   * Update selected calendars for sync
   * تحديث التقويمات المحددة للمزامنة
   */
  updateSelectedCalendars: async (calendarIds: string[]): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.put<{ success: boolean }>(
        '/google-calendar/settings/calendars',
        { calendarIds }
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to update calendar selection | فشل في تحديث اختيار التقويمات'
      throw new Error(errorMessage)
    }
  },

  /**
   * Setup push notifications for calendar
   * إعداد إشعارات الدفع للتقويم
   */
  setupWatch: async (calendarId: string): Promise<{ success: boolean; channelId: string; expiration: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; channelId: string; expiration: string }>(
        `/google-calendar/watch/${encodeURIComponent(calendarId)}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to setup calendar watch | فشل في إعداد مراقبة التقويم'
      throw new Error(errorMessage)
    }
  },

  /**
   * Stop push notifications
   * إيقاف إشعارات الدفع
   */
  stopWatch: async (channelId: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/google-calendar/watch/${channelId}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to stop calendar watch | فشل في إيقاف مراقبة التقويم'
      throw new Error(errorMessage)
    }
  },

  /**
   * Import events from Google to TRAF3LI
   * استيراد الأحداث من جوجل إلى TRAF3LI
   */
  syncImport: async (): Promise<{ success: boolean; imported: number; errors: number }> => {
    try {
      const response = await apiClient.post<{ success: boolean; imported: number; errors: number }>(
        '/google-calendar/sync/import'
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to import from Google | فشل في الاستيراد من جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Export event to Google
   * تصدير حدث إلى جوجل
   */
  syncExport: async (eventId: string): Promise<{ success: boolean; googleEventId: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; googleEventId: string }>(
        `/google-calendar/sync/export/${eventId}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to export to Google | فشل في التصدير إلى جوجل'
      throw new Error(errorMessage)
    }
  },

  /**
   * Enable auto-sync
   * تفعيل المزامنة التلقائية
   */
  enableAutoSync: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post<{ success: boolean }>('/google-calendar/sync/auto/enable')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to enable auto-sync | فشل في تفعيل المزامنة التلقائية'
      throw new Error(errorMessage)
    }
  },

  /**
   * Disable auto-sync
   * تعطيل المزامنة التلقائية
   */
  disableAutoSync: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post<{ success: boolean }>('/google-calendar/sync/auto/disable')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to disable auto-sync | فشل في تعطيل المزامنة التلقائية'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get sync settings
   * الحصول على إعدادات المزامنة
   */
  getSyncSettings: async (): Promise<GoogleSyncSettingsResponse> => {
    try {
      const response = await apiClient.get<GoogleSyncSettingsResponse>('/google-calendar/sync/settings')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to get sync settings | فشل في الحصول على إعدادات المزامنة'
      throw new Error(errorMessage)
    }
  },
}

export default googleCalendarService
