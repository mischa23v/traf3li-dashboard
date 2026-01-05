/**
 * Events Service
 * Production-ready event management with advanced features
 * Handles all event-related API calls including attendees, RSVP, calendar sync
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== ENUMS ====================
 */

// Backend Event Types: hearing | court_date | meeting | client_meeting | deposition | mediation | arbitration | deadline | filing_deadline | conference_call | internal_meeting | training | webinar | consultation | task | other
export type EventType = 'hearing' | 'court_date' | 'meeting' | 'client_meeting' | 'deposition' | 'mediation' | 'arbitration' | 'deadline' | 'filing_deadline' | 'conference_call' | 'internal_meeting' | 'training' | 'webinar' | 'consultation' | 'task' | 'other'
// Backend Event Status: scheduled | confirmed | tentative | canceled | cancelled | postponed | completed | in_progress | rescheduled
export type EventStatus = 'scheduled' | 'confirmed' | 'tentative' | 'canceled' | 'cancelled' | 'postponed' | 'completed' | 'in_progress' | 'rescheduled'
export type EventPriority = 'low' | 'medium' | 'high' | 'critical'
export type RSVPStatus = 'pending' | 'accepted' | 'declined' | 'tentative'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type ReminderType = 'notification' | 'email' | 'sms' | 'push' | 'whatsapp'
export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'ics'

/**
 * ==================== INTERFACES ====================
 */

export interface EventAttendee {
  _id?: string
  userId?: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    role?: string
  }
  email?: string
  name?: string
  role: 'organizer' | 'required' | 'optional' | 'resource'
  rsvpStatus: RSVPStatus
  rsvpResponseAt?: string
  rsvpNote?: string
  notificationSent: boolean
  notificationSentAt?: string
  // Attendance tracking
  checkInTime?: string
  checkOutTime?: string
  attended?: boolean
  // External attendee
  isExternal?: boolean
  organization?: string
  phone?: string
}

export interface EventLocation {
  type: 'physical' | 'virtual' | 'hybrid'
  // Physical location
  address?: string
  city?: string
  country?: string
  room?: string
  building?: string
  floor?: string
  coordinates?: {
    lat: number
    lng: number
  }
  // Virtual location - matches backend: ['zoom', 'teams', 'google_meet', 'webex', 'other']
  platform?: 'zoom' | 'teams' | 'google_meet' | 'webex' | 'other'
  meetingUrl?: string
  meetingId?: string
  password?: string
  dialInNumbers?: { country: string; number: string }[]
  // Directions
  parkingInfo?: string
  directions?: string
}

export interface EventReminder {
  _id?: string
  type: ReminderType
  beforeMinutes: number // e.g., 30 = 30 minutes before
  sent: boolean
  sentAt?: string
  failed?: boolean
  failureReason?: string
}

export interface RecurrenceConfig {
  enabled: boolean
  frequency: RecurrenceFrequency
  // Weekly options
  daysOfWeek?: number[] // 0-6 (Sunday-Saturday)
  // Monthly options
  dayOfMonth?: number
  weekOfMonth?: number // 1-5
  dayOfWeek?: number // 0-6
  // Custom interval
  interval?: number
  // End conditions
  endDate?: string
  maxOccurrences?: number
  occurrencesCompleted?: number
  // Exceptions
  excludedDates?: string[]
  // Skip options
  skipWeekends?: boolean
  skipHolidays?: boolean
}

export interface EventAttachment {
  _id?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize?: number
  uploadedBy: string
  uploadedAt: string
  description?: string
}

export interface EventComment {
  _id?: string
  userId: string
  userName?: string
  userAvatar?: string
  text: string
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
}

export interface EventHistory {
  _id?: string
  action: 'created' | 'updated' | 'rescheduled' | 'cancelled' | 'completed' | 'attendee_added' | 'attendee_removed' | 'rsvp_updated'
  userId: string
  userName?: string
  timestamp: string
  details?: string
  oldValue?: any
  newValue?: any
}

export interface CalendarSync {
  provider: CalendarProvider
  externalId?: string
  lastSyncedAt?: string
  syncEnabled: boolean
  syncError?: string
}

export interface Event {
  _id: string
  // Basic info
  title: string
  description?: string
  notes?: string
  // Type & Status
  type: EventType
  status: EventStatus
  priority?: EventPriority
  color: string
  tags?: string[]
  // Timing
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  allDay: boolean
  timezone?: string
  date?: string
  time?: string
  duration?: number // in minutes
  // Location
  location?: string | EventLocation
  // Relations
  caseId?: string | {
    _id?: string
    caseNumber?: string
    title?: string
    client?: { _id: string; name: string }
  }
  taskId?: string | {
    _id: string
    title: string
  }
  clientId?: string | {
    _id: string
    name?: string
    fullName?: string
  }
  // Attendees
  attendees?: EventAttendee[]
  organizer?: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  createdBy: string | {
    _id: string
    firstName: string
    lastName: string
  }
  // Reminders
  reminders?: EventReminder[]
  // Recurrence
  recurrence?: RecurrenceConfig
  isRecurringInstance?: boolean
  parentEventId?: string
  instanceDate?: string
  // Attachments & Comments
  attachments?: EventAttachment[]
  comments?: EventComment[]
  // Calendar sync
  calendarSync?: CalendarSync[]
  // Agenda
  agenda?: {
    _id?: string
    order: number
    title: string
    duration?: number // minutes
    presenter?: string
    notes?: string
    completed?: boolean
  }[]
  // Meeting notes
  meetingNotes?: string
  actionItems?: {
    _id?: string
    description: string
    assignedTo?: string
    dueDate?: string
    completed: boolean
  }[]
  // Billing
  billable?: boolean
  billedHours?: number
  billingRate?: number
  // Audit
  history?: EventHistory[]
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Create Event Data
 */
export interface CreateEventData {
  title: string
  description?: string
  notes?: string
  type: EventType
  status?: EventStatus
  priority?: EventPriority
  color?: string
  tags?: string[]
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  allDay?: boolean
  timezone?: string
  duration?: number
  location?: string | EventLocation
  caseId?: string
  taskId?: string
  clientId?: string
  attendees?: Omit<EventAttendee, '_id' | 'notificationSent' | 'notificationSentAt'>[]
  reminders?: Omit<EventReminder, '_id' | 'sent' | 'sentAt'>[]
  recurrence?: RecurrenceConfig
  attachments?: { fileName: string; fileUrl: string; fileType: string }[]
  agenda?: { title: string; duration?: number; presenter?: string; notes?: string }[]
  billable?: boolean
  billingRate?: number
}

/**
 * Event Filters
 */
export interface EventFilters {
  startDate?: string
  endDate?: string
  type?: EventType | EventType[]
  status?: EventStatus | EventStatus[]
  priority?: EventPriority | EventPriority[]
  caseId?: string
  clientId?: string
  attendeeId?: string
  organizerId?: string
  isRecurring?: boolean
  isAllDay?: boolean
  tags?: string[]
  search?: string
  view?: 'day' | 'week' | 'month' | 'year' | 'agenda'
  sortBy?: 'startDate' | 'priority' | 'createdAt' | 'title'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Calendar View Data
 */
export interface CalendarViewData {
  events: Event[]
  tasks: any[]
  reminders?: any[]
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalEvents: number
    byType: Record<EventType, number>
    byStatus: Record<EventStatus, number>
  }
}

/**
 * Event Statistics
 */
export interface EventStats {
  total: number
  byType: Record<EventType, number>
  byStatus: Record<EventStatus, number>
  upcoming: number
  completedThisWeek: number
  completedThisMonth: number
  cancelledThisMonth: number
  averageDuration?: number
  attendanceRate?: number
  billableHours?: number
}

/**
 * RSVP Response
 */
export interface RSVPResponse {
  status: RSVPStatus
  note?: string
  proposedTime?: string // If declining, can propose alternative
}

/**
 * Bulk Operation Result
 */
export interface BulkOperationResult {
  success: number
  failed: number
  errors?: { id: string; error: string }[]
}

/**
 * Events Service Object
 */
const eventsService = {
  // ==================== CRUD Operations ====================

  /**
   * Get all events with filters and pagination
   */
  getEvents: async (filters?: EventFilters): Promise<{ events: Event[]; tasks: any[]; total: number; pagination: any }> => {
    try {
      const response = await apiClient.get('/events', { params: filters })
      return {
        events: response.data.events || response.data.data || [],
        tasks: response.data.tasks || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {}
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get calendar view data
   */
  getCalendarView: async (view: 'day' | 'week' | 'month' | 'year', date: string): Promise<CalendarViewData> => {
    try {
      const response = await apiClient.get('/events/calendar', { params: { view, date } })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single event by ID
   */
  getEvent: async (id: string): Promise<Event> => {
    try {
      const response = await apiClient.get(`/events/${id}`)
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new event
   */
  createEvent: async (data: CreateEventData): Promise<Event> => {
    try {
      const response = await apiClient.post('/events', data)
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
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
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Status Operations ====================

  /**
   * Mark event as completed
   */
  completeEvent: async (id: string, minutesNotes?: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/complete`, { minutesNotes })
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel event
   */
  cancelEvent: async (id: string, reason?: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/cancel`, { reason })
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Postpone event to a new date/time
   */
  postponeEvent: async (id: string, newDateTime: string, reason?: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/postpone`, { newDateTime, reason })
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reschedule event
   */
  rescheduleEvent: async (id: string, newStartDate: string, newEndDate?: string, reason?: string, notifyAttendees: boolean = true): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/reschedule`, {
        newStartDate,
        newEndDate,
        reason,
        notifyAttendees
      })
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Start event (mark as in_progress)
   */
  startEvent: async (id: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/start`)
      return response.data.event || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Attendee Operations ====================

  /**
   * Add attendee to event
   */
  addAttendee: async (eventId: string, attendee: Omit<EventAttendee, '_id' | 'notificationSent' | 'notificationSentAt'>): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/attendees`, attendee)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update attendee
   */
  updateAttendee: async (eventId: string, attendeeId: string, data: Partial<EventAttendee>): Promise<Event> => {
    try {
      const response = await apiClient.patch(`/events/${eventId}/attendees/${attendeeId}`, data)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove attendee from event
   */
  removeAttendee: async (eventId: string, attendeeId: string, notifyAttendee: boolean = true): Promise<Event> => {
    try {
      const response = await apiClient.delete(`/events/${eventId}/attendees/${attendeeId}`, {
        params: { notifyAttendee }
      })
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * RSVP to event
   */
  rsvpToEvent: async (eventId: string, response: RSVPResponse): Promise<Event> => {
    try {
      const res = await apiClient.post(`/events/${eventId}/rsvp`, response)
      return res.data.event || res.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send invitations to all attendees
   */
  sendInvitations: async (eventId: string): Promise<{ sent: number; failed: number }> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/send-invitations`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check in attendee (for in-person events)
   */
  checkInAttendee: async (eventId: string, attendeeId: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/attendees/${attendeeId}/check-in`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check out attendee
   */
  checkOutAttendee: async (eventId: string, attendeeId: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/attendees/${attendeeId}/check-out`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Agenda & Notes ====================

  /**
   * Add agenda item
   */
  addAgendaItem: async (eventId: string, agendaItem: { title: string; duration?: number; presenter?: string; notes?: string }): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/agenda`, agendaItem)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update agenda item
   */
  updateAgendaItem: async (eventId: string, agendaId: string, agendaItem: { title?: string; duration?: number; presenter?: string; notes?: string }): Promise<Event> => {
    try {
      const response = await apiClient.put(`/events/${eventId}/agenda/${agendaId}`, agendaItem)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete agenda item
   */
  deleteAgendaItem: async (eventId: string, agendaId: string): Promise<Event> => {
    try {
      const response = await apiClient.delete(`/events/${eventId}/agenda/${agendaId}`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update meeting notes
   */
  updateMeetingNotes: async (eventId: string, notes: string): Promise<Event> => {
    try {
      const response = await apiClient.patch(`/events/${eventId}/notes`, { meetingNotes: notes })
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add action item
   */
  addActionItem: async (eventId: string, actionItem: { description: string; assignedTo?: string; dueDate?: string }): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/action-items`, actionItem)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update action item
   */
  updateActionItem: async (eventId: string, itemId: string, actionItem: { description?: string; assignedTo?: string; dueDate?: string; completed?: boolean }): Promise<Event> => {
    try {
      const response = await apiClient.put(`/events/${eventId}/action-items/${itemId}`, actionItem)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle action item completion
   */
  toggleActionItem: async (eventId: string, actionItemId: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/action-items/${actionItemId}/toggle`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Attachments ====================

  /**
   * Upload attachment
   */
  uploadAttachment: async (eventId: string, file: File, description?: string): Promise<EventAttachment> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (description) formData.append('description', description)
      const response = await apiClient.post(`/events/${eventId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.attachment || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete attachment
   */
  deleteAttachment: async (eventId: string, attachmentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/events/${eventId}/attachments/${attachmentId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Comments ====================

  /**
   * Add comment to event
   */
  addComment: async (eventId: string, text: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/comments`, { text })
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update comment
   */
  updateComment: async (eventId: string, commentId: string, text: string): Promise<Event> => {
    try {
      const response = await apiClient.patch(`/events/${eventId}/comments/${commentId}`, { text })
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete comment
   */
  deleteComment: async (eventId: string, commentId: string): Promise<Event> => {
    try {
      const response = await apiClient.delete(`/events/${eventId}/comments/${commentId}`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Queries ====================

  /**
   * Get upcoming events
   */
  getUpcoming: async (days: number = 7): Promise<Event[]> => {
    try {
      const response = await apiClient.get('/events/upcoming', { params: { days } })
      return response.data.events || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get today's events
   */
  getToday: async (): Promise<Event[]> => {
    try {
      const response = await apiClient.get('/events/today')
      return response.data.events || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get events by specific date
   */
  getEventsByDate: async (date: string): Promise<Event[]> => {
    try {
      const response = await apiClient.get(`/events/date/${date}`)
      return response.data.events || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get events by month
   */
  getEventsByMonth: async (year: number, month: number): Promise<Event[]> => {
    try {
      const response = await apiClient.get(`/events/month/${year}/${month}`)
      return response.data.events || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get my events (where I'm an attendee or organizer)
   */
  getMyEvents: async (filters?: Omit<EventFilters, 'attendeeId' | 'organizerId'>): Promise<{ events: Event[]; total: number }> => {
    try {
      const response = await apiClient.get('/events/my-events', { params: filters })
      return {
        events: response.data.events || response.data.data || [],
        total: response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get events I need to RSVP to
   */
  getPendingRSVP: async (): Promise<Event[]> => {
    try {
      const response = await apiClient.get('/events/pending-rsvp')
      return response.data.events || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get event statistics
   */
  getStats: async (filters?: { dateFrom?: string; dateTo?: string; caseId?: string }): Promise<EventStats> => {
    try {
      const response = await apiClient.get('/events/stats', { params: filters })
      return response.data.stats || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Recurring Events ====================

  /**
   * Skip next occurrence of recurring event
   */
  skipRecurrence: async (eventId: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/recurring/skip`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Stop recurring event
   */
  stopRecurrence: async (eventId: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/recurring/stop`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get recurring event instances
   */
  getRecurrenceInstances: async (eventId: string, startDate?: string, endDate?: string): Promise<Event[]> => {
    try {
      const response = await apiClient.get(`/events/${eventId}/recurring/instances`, {
        params: { startDate, endDate }
      })
      return response.data.instances || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update single instance of recurring event
   */
  updateInstance: async (eventId: string, instanceDate: string, data: Partial<CreateEventData>): Promise<Event> => {
    try {
      const response = await apiClient.put(`/events/${eventId}/recurring/instance/${instanceDate}`, data)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Calendar Sync ====================

  /**
   * Sync with external calendar
   */
  syncCalendar: async (eventId: string, provider: CalendarProvider): Promise<CalendarSync> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/calendar-sync`, { provider })
      return response.data.sync || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export to ICS format
   */
  exportToICS: async (eventId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/events/${eventId}/export/ics`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import from ICS
   */
  importFromICS: async (file: File): Promise<{ imported: number; failed: number; events: Event[] }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post('/events/import/ics', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Bulk Operations ====================

  /**
   * Bulk update events
   */
  bulkUpdate: async (eventIds: string[], data: Partial<CreateEventData>): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.put('/events/bulk', { eventIds, ...data })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete events
   */
  bulkDelete: async (eventIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.delete('/events/bulk', { data: { eventIds } })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk cancel events
   */
  bulkCancel: async (eventIds: string[], reason?: string): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/events/bulk/cancel', { eventIds, reason })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk complete events
   */
  bulkComplete: async (eventIds: string[], completionNote?: string): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/events/bulk/complete', { eventIds, completionNote })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk archive events
   */
  bulkArchive: async (eventIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/events/bulk/archive', { eventIds })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk unarchive events
   */
  bulkUnarchive: async (eventIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/events/bulk/unarchive', { eventIds })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Archive single event
   */
  archiveEvent: async (id: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/archive`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unarchive single event
   */
  unarchiveEvent: async (id: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${id}/unarchive`)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get archived events
   */
  getArchived: async (filters?: EventFilters): Promise<{ events: Event[]; total: number }> => {
    try {
      const response = await apiClient.get('/events/archived', { params: filters })
      return {
        events: response.data.events || response.data.data || [],
        total: response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all event IDs (for select all functionality)
   */
  getAllIds: async (filters?: EventFilters): Promise<string[]> => {
    try {
      const response = await apiClient.get('/events/ids', { params: filters })
      return response.data.ids || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Templates ====================

  /**
   * Get event templates
   */
  getTemplates: async (): Promise<Event[]> => {
    try {
      const response = await apiClient.get('/events/templates')
      return response.data.templates || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create event from template
   */
  createFromTemplate: async (templateId: string, overrides?: Partial<CreateEventData>): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/templates/${templateId}/create`, overrides)
      return response.data.event || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save event as template
   */
  saveAsTemplate: async (eventId: string, templateName: string): Promise<Event> => {
    try {
      const response = await apiClient.post(`/events/${eventId}/save-as-template`, { name: templateName })
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Availability ====================

  /**
   * Check availability for attendees
   */
  checkAvailability: async (attendeeIds: string[], startDate: string, endDate: string): Promise<{
    available: boolean
    conflicts: { userId: string; events: Event[] }[]
    suggestedSlots?: { start: string; end: string }[]
  }> => {
    try {
      const response = await apiClient.post('/events/check-availability', {
        attendeeIds,
        startDate,
        endDate
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Find available slots
   */
  findAvailableSlots: async (attendeeIds: string[], duration: number, dateRange: { start: string; end: string }): Promise<{
    slots: { start: string; end: string }[]
  }> => {
    try {
      const response = await apiClient.post('/events/find-slots', {
        attendeeIds,
        duration,
        dateRange
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default eventsService
