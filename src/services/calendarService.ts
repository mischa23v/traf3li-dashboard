/**
 * Calendar Service
 * Handles all calendar-related API calls including unified calendar view
 */

import { apiClientNoVersion as apiClient, handleApiError } from '@/lib/api'

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

// ==================== New Optimized Types ====================

/**
 * Day summary for calendar grid badges
 */
export interface DaySummary {
  date: string
  total: number
  events: number
  tasks: number
  reminders: number
  caseDocuments: number
  hasHighPriority: boolean
  hasOverdue: boolean
}

/**
 * Grid summary response
 */
export interface GridSummaryResponse {
  success: boolean
  data: {
    days: DaySummary[]
    totalDays: number
    dateRange: { start: string; end: string }
  }
  cached?: boolean
}

/**
 * Minimal calendar item for grid display
 */
export interface GridItem {
  id: string
  type: 'event' | 'task' | 'reminder' | 'case-document' | 'appointment'
  title: string
  startDate: string
  endDate?: string
  allDay: boolean
  eventType?: string
  status: string
  priority?: string
  color: string
  // Appointment-specific fields (when type is 'appointment')
  // Types aligned with contract2/types/integrations.ts
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  startTime?: string
  endTime?: string
  appointmentType?: 'consultation' | 'follow_up' | 'case_review' | 'initial_meeting' | 'court_preparation' | 'document_review'
  appointmentStatus?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  locationType?: 'office' | 'virtual' | 'phone' | 'client'
  location?: string
  notes?: string
  subject?: string
}

/**
 * Grid items response
 */
export interface GridItemsResponse {
  success: boolean
  data: GridItem[]
  count: number
  dateRange: { start: string; end: string }
}

/**
 * List view filters
 */
export interface ListFilters {
  cursor?: string
  limit?: number
  types?: string
  sortOrder?: 'asc' | 'desc'
  priority?: string
  status?: string
  startDate?: string
  endDate?: string
}

/**
 * List view response with cursor pagination
 */
export interface ListResponse {
  success: boolean
  data: GridItem[]
  pagination: {
    cursor: string | null
    hasMore: boolean
    limit: number
    count: number
  }
  filters: {
    types: string[]
    priority?: string
    status?: string
    dateRange?: { start: string; end: string }
  }
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
      const errorMessage = handleApiError(error) || 'Failed to fetch calendar data | فشل في جلب بيانات التقويم'
      throw new Error(errorMessage)
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
      const errorMessage = handleApiError(error) || 'Failed to fetch calendar by date | فشل في جلب التقويم حسب التاريخ'
      throw new Error(errorMessage)
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
      const errorMessage = handleApiError(error) || 'Failed to fetch calendar by month | فشل في جلب التقويم حسب الشهر'
      throw new Error(errorMessage)
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
      const errorMessage = handleApiError(error) || 'Failed to fetch upcoming items | فشل في جلب العناصر القادمة'
      throw new Error(errorMessage)
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
      const errorMessage = handleApiError(error) || 'Failed to fetch overdue items | فشل في جلب العناصر المتأخرة'
      throw new Error(errorMessage)
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
      const errorMessage = handleApiError(error) || 'Failed to fetch calendar statistics | فشل في جلب إحصائيات التقويم'
      throw new Error(errorMessage)
    }
  },

  // ==================== Optimized Endpoints ====================
  // [BACKEND-PENDING] WARNING: These endpoints are NOT yet implemented in the backend
  // [BACKEND-PENDING] تحذير: هذه النقاط النهائية لم يتم تنفيذها بعد في الخادم

  /**
   * [BACKEND-PENDING] Get grid summary - counts per day for calendar badges
   * Much lighter than full data - only counts and flags
   *
   * ⚠️ [BACKEND-PENDING] WARNING: This endpoint (/calendar/grid-summary) does NOT exist in the backend yet!
   * ⚠️ [BACKEND-PENDING] تحذير: هذه النقطة النهائية (/calendar/grid-summary) غير موجودة في الخادم بعد!
   *
   * Required Implementation:
   * - Endpoint: GET /calendar/grid-summary
   * - Query params: startDate, endDate, types (optional)
   * - Returns: { days: DaySummary[], totalDays, dateRange }
   */
  getGridSummary: async (filters: {
    startDate: string
    endDate: string
    types?: string
  }): Promise<GridSummaryResponse> => {
    try {
      const response = await apiClient.get<GridSummaryResponse>('/calendar/grid-summary', {
        params: filters,
      })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || '[BACKEND-PENDING] Failed to fetch grid summary. This endpoint is not implemented yet. Please use the legacy /calendar endpoint. | [BACKEND-PENDING] فشل في جلب ملخص الشبكة. هذه النقطة النهائية غير مطبقة بعد. يرجى استخدام نقطة /calendar القديمة.'
      console.error('[Calendar Service] [BACKEND-PENDING] Grid Summary Error:', errorMessage)
      throw new Error(errorMessage)
    }
  },

  /**
   * [BACKEND-PENDING] Get grid items - minimal event data for calendar display
   * ~150 bytes per item vs 2-5KB for full objects
   *
   * ⚠️ [BACKEND-PENDING] WARNING: This endpoint (/calendar/grid-items) does NOT exist in the backend yet!
   * ⚠️ [BACKEND-PENDING] تحذير: هذه النقطة النهائية (/calendar/grid-items) غير موجودة في الخادم بعد!
   *
   * Required Implementation:
   * - Endpoint: GET /calendar/grid-items
   * - Query params: startDate, endDate, types (optional), caseId (optional)
   * - Returns: { data: GridItem[], count, dateRange }
   */
  getGridItems: async (filters: {
    startDate: string
    endDate: string
    types?: string
    caseId?: string
  }): Promise<GridItemsResponse> => {
    try {
      const response = await apiClient.get<GridItemsResponse>('/calendar/grid-items', {
        params: filters,
      })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || '[BACKEND-PENDING] Failed to fetch grid items. This endpoint is not implemented yet. Please use the legacy /calendar endpoint. | [BACKEND-PENDING] فشل في جلب عناصر الشبكة. هذه النقطة النهائية غير مطبقة بعد. يرجى استخدام نقطة /calendar القديمة.'
      console.error('[Calendar Service] [BACKEND-PENDING] Grid Items Error:', errorMessage)
      throw new Error(errorMessage)
    }
  },

  /**
   * [BACKEND-PENDING] Get full item details - lazy loaded on click
   * Fetches complete object with populated relations
   *
   * ⚠️ [BACKEND-PENDING] WARNING: This endpoint (/calendar/item/:type/:id) does NOT exist in the backend yet!
   * ⚠️ [BACKEND-PENDING] تحذير: هذه النقطة النهائية (/calendar/item/:type/:id) غير موجودة في الخادم بعد!
   *
   * Required Implementation:
   * - Endpoint: GET /calendar/item/:type/:id
   * - Path params: type (event|task|reminder), id
   * - Returns: { success, data: CalendarEvent }
   */
  getItemDetails: async (type: string, id: string): Promise<{ success: boolean; data: CalendarEvent }> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: CalendarEvent }>(
        `/calendar/item/${type}/${id}`
      )
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || '[BACKEND-PENDING] Failed to fetch item details. This endpoint is not implemented yet. Please use the individual endpoints (/events/:id, /tasks/:id, /reminders/:id). | [BACKEND-PENDING] فشل في جلب تفاصيل العنصر. هذه النقطة النهائية غير مطبقة بعد. يرجى استخدام النقاط الفردية (/events/:id, /tasks/:id, /reminders/:id).'
      console.error('[Calendar Service] [BACKEND-PENDING] Item Details Error:', errorMessage)
      throw new Error(errorMessage)
    }
  },

  /**
   * [BACKEND-PENDING] Get list view with cursor pagination - for virtualized infinite scroll
   *
   * ⚠️ [BACKEND-PENDING] WARNING: This endpoint (/calendar/list) does NOT exist in the backend yet!
   * ⚠️ [BACKEND-PENDING] تحذير: هذه النقطة النهائية (/calendar/list) غير موجودة في الخادم بعد!
   *
   * Required Implementation:
   * - Endpoint: GET /calendar/list
   * - Query params: cursor, limit, types, sortOrder, priority, status, startDate, endDate
   * - Returns: { success, data: GridItem[], pagination: { cursor, hasMore, limit, count }, filters }
   */
  getList: async (filters: ListFilters): Promise<ListResponse> => {
    try {
      const response = await apiClient.get<ListResponse>('/calendar/list', {
        params: filters,
      })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || '[BACKEND-PENDING] Failed to fetch list view. This endpoint is not implemented yet. Please use the legacy /calendar endpoint with pagination. | [BACKEND-PENDING] فشل في جلب عرض القائمة. هذه النقطة النهائية غير مطبقة بعد. يرجى استخدام نقطة /calendar القديمة مع التصفح.'
      console.error('[Calendar Service] [BACKEND-PENDING] List View Error:', errorMessage)
      throw new Error(errorMessage)
    }
  },
}

export default calendarService
