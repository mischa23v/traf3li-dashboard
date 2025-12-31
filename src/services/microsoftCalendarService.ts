/**
 * Microsoft Calendar Service
 * Handles Microsoft/Outlook Calendar OAuth and sync operations
 *
 * خدمة تقويم مايكروسوفت
 * تتعامل مع مصادقة OAuth ومزامنة تقويم مايكروسوفت/أوتلوك
 */

import { apiClientNoVersion as apiClient, handleApiError } from '@/lib/api'

// ==================== Types ====================

export interface MicrosoftCalendar {
  id: string
  name: string
  color?: string
  isDefaultCalendar: boolean
  canEdit: boolean
  owner?: {
    name: string
    address: string
  }
}

export interface MicrosoftEvent {
  id: string
  subject: string
  body?: {
    contentType: 'text' | 'html'
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: {
    displayName: string
    address?: {
      street?: string
      city?: string
      state?: string
      countryOrRegion?: string
      postalCode?: string
    }
  }
  isAllDay: boolean
  isCancelled: boolean
  isOrganizer: boolean
  showAs: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown'
  importance: 'low' | 'normal' | 'high'
  sensitivity: 'normal' | 'personal' | 'private' | 'confidential'
  attendees?: Array<{
    emailAddress: { name: string; address: string }
    type: 'required' | 'optional' | 'resource'
    status: { response: 'none' | 'organizer' | 'tentativelyAccepted' | 'accepted' | 'declined' | 'notResponded' }
  }>
  webLink?: string
  createdDateTime?: string
  lastModifiedDateTime?: string
}

export interface MicrosoftAuthResponse {
  success: boolean
  data: {
    authUrl: string
  }
}

export interface MicrosoftConnectionStatus {
  success: boolean
  data: {
    connected: boolean
    email?: string
    displayName?: string
    expiresAt?: string
    calendars?: MicrosoftCalendar[]
  }
}

export interface MicrosoftCalendarsResponse {
  success: boolean
  data: MicrosoftCalendar[]
}

export interface MicrosoftEventsResponse {
  success: boolean
  data: MicrosoftEvent[]
  nextLink?: string
}

export interface MicrosoftEventResponse {
  success: boolean
  data: MicrosoftEvent
}

export interface CreateMicrosoftEventRequest {
  subject: string
  body?: {
    contentType: 'text' | 'html'
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: {
    displayName: string
  }
  attendees?: Array<{
    emailAddress: { name?: string; address: string }
    type: 'required' | 'optional'
  }>
  isAllDay?: boolean
  showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere'
  importance?: 'low' | 'normal' | 'high'
}

// ==================== Service ====================

const microsoftCalendarService = {
  // ==================== OAuth Flow ====================

  /**
   * Get Microsoft OAuth authorization URL
   * الحصول على رابط مصادقة مايكروسوفت
   */
  getAuthUrl: async (): Promise<MicrosoftAuthResponse> => {
    try {
      const response = await apiClient.get<MicrosoftAuthResponse>('/microsoft-calendar/auth')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to get Microsoft auth URL | فشل في الحصول على رابط مصادقة مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Manually refresh token
   * تحديث الرمز يدوياً
   */
  refreshToken: async (): Promise<{ success: boolean; expiresAt: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; expiresAt: string }>('/microsoft-calendar/refresh-token')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to refresh token | فشل في تحديث الرمز'
      throw new Error(errorMessage)
    }
  },

  /**
   * Disconnect Microsoft Calendar integration
   * فصل تكامل تقويم مايكروسوفت
   */
  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/microsoft-calendar/disconnect')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to disconnect Microsoft Calendar | فشل في فصل تقويم مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get Microsoft Calendar connection status
   * الحصول على حالة اتصال تقويم مايكروسوفت
   */
  getStatus: async (): Promise<MicrosoftConnectionStatus> => {
    try {
      const response = await apiClient.get<MicrosoftConnectionStatus>('/microsoft-calendar/status')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to get Microsoft Calendar status | فشل في الحصول على حالة تقويم مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  // ==================== Calendar Operations ====================

  /**
   * List user's Microsoft calendars
   * عرض قائمة تقويمات مايكروسوفت للمستخدم
   */
  getCalendars: async (): Promise<MicrosoftCalendarsResponse> => {
    try {
      const response = await apiClient.get<MicrosoftCalendarsResponse>('/microsoft-calendar/calendars')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch Microsoft calendars | فشل في جلب تقويمات مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get events from Microsoft calendar
   * الحصول على الأحداث من تقويم مايكروسوفت
   */
  getEvents: async (params?: {
    calendarId?: string
    startDate?: string
    endDate?: string
  }): Promise<MicrosoftEventsResponse> => {
    try {
      const response = await apiClient.get<MicrosoftEventsResponse>('/microsoft-calendar/events', { params })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch Microsoft events | فشل في جلب أحداث مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Create event in Microsoft calendar
   * إنشاء حدث في تقويم مايكروسوفت
   */
  createEvent: async (event: CreateMicrosoftEventRequest): Promise<MicrosoftEventResponse> => {
    try {
      const response = await apiClient.post<MicrosoftEventResponse>('/microsoft-calendar/events', event)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to create Microsoft event | فشل في إنشاء حدث مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update event in Microsoft calendar
   * تحديث حدث في تقويم مايكروسوفت
   */
  updateEvent: async (eventId: string, event: Partial<CreateMicrosoftEventRequest>): Promise<MicrosoftEventResponse> => {
    try {
      const response = await apiClient.put<MicrosoftEventResponse>(`/microsoft-calendar/events/${eventId}`, event)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to update Microsoft event | فشل في تحديث حدث مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Delete event from Microsoft calendar
   * حذف حدث من تقويم مايكروسوفت
   */
  deleteEvent: async (eventId: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/microsoft-calendar/events/${eventId}`)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to delete Microsoft event | فشل في حذف حدث مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  // ==================== Sync Operations ====================

  /**
   * Sync from Microsoft to TRAF3LI
   * المزامنة من مايكروسوفت إلى TRAF3LI
   */
  syncFromMicrosoft: async (): Promise<{ success: boolean; imported: number; errors: number }> => {
    try {
      const response = await apiClient.post<{ success: boolean; imported: number; errors: number }>(
        '/microsoft-calendar/sync/from-microsoft'
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to sync from Microsoft | فشل في المزامنة من مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Sync to Microsoft
   * المزامنة إلى مايكروسوفت
   */
  syncToMicrosoft: async (eventId: string): Promise<{ success: boolean; microsoftEventId: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; microsoftEventId: string }>(
        `/microsoft-calendar/sync/to-microsoft/${eventId}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to sync to Microsoft | فشل في المزامنة إلى مايكروسوفت'
      throw new Error(errorMessage)
    }
  },

  /**
   * Enable auto-sync
   * تفعيل المزامنة التلقائية
   */
  enableAutoSync: async (): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post<{ success: boolean }>('/microsoft-calendar/sync/enable-auto-sync')
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
      const response = await apiClient.post<{ success: boolean }>('/microsoft-calendar/sync/disable-auto-sync')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to disable auto-sync | فشل في تعطيل المزامنة التلقائية'
      throw new Error(errorMessage)
    }
  },
}

export default microsoftCalendarService
