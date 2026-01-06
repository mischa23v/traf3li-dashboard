/**
 * Appointments Service
 * Handles all appointment-related API calls including availability management and booking
 *
 * خدمة المواعيد
 * تتعامل مع جميع استدعاءات API المتعلقة بالمواعيد بما في ذلك إدارة التوفر والحجز
 */

import { apiClientNoVersion as apiClient, handleApiError } from '@/lib/api'
import axios from 'axios'

// ==================== Debug Helper ====================

const DEBUG_PREFIX = '[APPOINTMENTS-SVC]'

/**
 * Debug logger for appointments service
 * Logs request/response details to help diagnose API issues
 */
const debugLog = {
  request: (method: string, endpoint: string, data?: unknown, params?: unknown) => {
    console.group(`${DEBUG_PREFIX} 📤 ${method} ${endpoint}`)
    console.log('⏰ Time:', new Date().toISOString())
    if (data) console.log('📦 Request Body:', JSON.stringify(data, null, 2))
    if (params) console.log('🔍 Query Params:', JSON.stringify(params, null, 2))
    console.groupEnd()
  },

  response: (method: string, endpoint: string, response: unknown) => {
    console.group(`${DEBUG_PREFIX} 📥 ${method} ${endpoint} - SUCCESS`)
    console.log('⏰ Time:', new Date().toISOString())
    console.log('✅ Response:', JSON.stringify(response, null, 2))
    console.groupEnd()
  },

  error: (method: string, endpoint: string, error: any, requestData?: unknown) => {
    console.group(`${DEBUG_PREFIX} 🔴 ${method} ${endpoint} - ERROR`)
    console.log('⏰ Time:', new Date().toISOString())
    if (requestData) console.log('📦 Request Body:', JSON.stringify(requestData, null, 2))

    // Check if it's a formatted error from axios interceptor
    // The interceptor transforms errors to: { status, message, code, error: true, errors, requestId }
    if (error?.error === true && typeof error?.status === 'number') {
      console.log('🔍 Error Type: Formatted API Error (from interceptor)')
      console.log('🔢 Status:', error.status)
      console.log('💬 Message:', error.message)
      if (error.code) console.log('🏷️ Code:', error.code)
      if (error.requestId) console.log('🆔 Request ID:', error.requestId)
      if (error.errors) {
        console.log('⚠️ Validation Errors:')
        error.errors.forEach((err: any, i: number) => {
          console.log(`   ${i + 1}. [${err.field || err.path || 'unknown'}]: ${err.message || JSON.stringify(err)}`)
        })
      }
      if (error.retryAfter) console.log('⏳ Retry After:', error.retryAfter, 'seconds')
    }
    // Check if it's an Axios error (before interceptor)
    else if (axios.isAxiosError(error)) {
      console.log('🔍 Error Type: Raw Axios Error')
      console.log('🔢 Status:', error.response?.status || 'No response')
      console.log('📄 Status Text:', error.response?.statusText || 'N/A')
      console.log('🔧 Response Data:', JSON.stringify(error.response?.data, null, 2))
      console.log('🌐 Request URL:', error.config?.url)

      if (error.response?.data) {
        const data = error.response.data
        if (data.message) console.log('💬 Backend Message:', data.message)
        if (data.error) console.log('❗ Backend Error:', JSON.stringify(data.error, null, 2))
        if (data.errors) console.log('⚠️ Validation Errors:', JSON.stringify(data.errors, null, 2))
        if (data.stack) console.log('🔥 Backend Stack:', data.stack)
      }
    }
    // Unknown error type
    else {
      console.log('🔍 Error Type:', error?.constructor?.name || typeof error)
      console.log('❌ Error Message:', error?.message || String(error))
      console.log('📋 Full Error Object:', JSON.stringify(error, null, 2))
    }

    console.groupEnd()
  },
}

// ==================== Types ====================

/**
 * Day of week (0 = Sunday, 6 = Saturday)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Appointment duration in minutes
 */
export type AppointmentDuration = 15 | 30 | 45 | 60 | 90 | 120

/**
 * Appointment type - matches contract integrations.ts AppointmentType
 */
export type AppointmentType =
  | 'consultation'      // Contract: Consultation
  | 'follow_up'         // Contract: FollowUp
  | 'case_review'       // Contract: CaseReview
  | 'initial_meeting'   // Contract: InitialMeeting
  | 'court_preparation' // Contract: CourtPreparation
  | 'document_review'   // Contract: DocumentReview

/**
 * Appointment status - matches contract integrations.ts AppointmentStatus
 */
export type AppointmentStatus =
  | 'scheduled'   // Contract: Scheduled
  | 'confirmed'   // Contract: Confirmed
  | 'completed'   // Contract: Completed
  | 'cancelled'   // Contract: Cancelled
  | 'no_show'     // Contract: NoShow

/**
 * Booking source - matches contract integrations.ts AppointmentSource
 */
export type BookingSource =
  | 'manual'  // Contract: Manual
  | 'public'  // Contract: Public
  | 'import'  // Contract: Import
  | 'api'     // Contract: API

/**
 * Availability Slot - Recurring weekly schedule
 * فترة التوفر - الجدول الأسبوعي المتكرر
 */
export interface AvailabilitySlot {
  id: string
  lawyerId: string
  dayOfWeek: DayOfWeek
  startTime: string // "09:00" format (24-hour)
  endTime: string // "17:00" format (24-hour)
  isActive: boolean
  slotDuration: AppointmentDuration // Duration of each appointment slot
  breakBetweenSlots: number // Minutes between appointments (buffer time)
  maxAppointmentsPerSlot?: number // For group consultations (default: 1)
  createdAt: string
  updatedAt: string
}

/**
 * Blocked Time - Specific date/time blocks (vacation, busy, etc.)
 * الوقت المحجوب - فترات محددة (إجازة، مشغول، إلخ)
 */
export interface BlockedTime {
  id: string
  lawyerId: string
  startDateTime: string // ISO string
  endDateTime: string // ISO string
  reason?: string
  isAllDay: boolean
  isRecurring: boolean
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Appointment
 * الموعد
 */
export interface Appointment {
  id: string
  lawyerId: string
  clientId?: string // Optional for manual bookings

  // Client info (for manual bookings or marketplace)
  clientName: string
  clientEmail: string
  clientPhone: string

  // Appointment details
  date: string // ISO date string (YYYY-MM-DD)
  startTime: string // "09:00" format
  endTime: string // "09:30" format
  duration: AppointmentDuration

  type: AppointmentType
  status: AppointmentStatus
  source: BookingSource

  // Optional fields
  notes?: string
  caseId?: string
  caseName?: string
  meetingLink?: string // For virtual appointments
  location?: string // For in-person appointments (address)
  locationType?: LocationType // Meeting type: video, in-person, or phone

  // Pricing (optional)
  price?: number
  currency?: string
  isPaid?: boolean
  paymentId?: string

  // Reminders
  reminderSent?: boolean
  reminderSentAt?: string

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    type: 'lawyer' | 'client' | 'system'
  }

  // Cancellation info
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
}

/**
 * Available time slot for booking
 * فترة زمنية متاحة للحجز
 */
export interface AvailableTimeSlot {
  start: string           // Time string "09:00"
  end: string             // Time string "09:30"
  startTime?: Date        // Full Date object (optional)
  endTime?: Date          // Full Date object (optional)
  available: boolean      // Is slot available
  conflictReason?: 'booked' | 'blocked' | 'outside_hours' | 'past'
}

/**
 * Lawyer's appointment settings
 * إعدادات المواعيد للمحامي
 */
export interface AppointmentSettings {
  lawyerId: string
  defaultDuration: AppointmentDuration
  defaultBreakTime: number
  allowOnlineBooking: boolean
  requireApproval: boolean // If true, appointments need lawyer confirmation
  advanceBookingDays: number // How many days in advance can clients book
  minNoticeHours: number // Minimum hours before appointment can be booked
  cancellationPolicyHours: number // Hours before appointment when cancellation is free
  autoConfirm: boolean
  sendReminders: boolean
  reminderHoursBefore: number[]
  allowRescheduling: boolean
  maxReschedulesPerAppointment: number
  timezone: string // Default: 'Asia/Riyadh'

  // Pricing settings
  enablePricing: boolean
  defaultPrice?: number
  currency: string
  requirePaymentUpfront: boolean

  // Appointment types enabled
  enabledTypes: AppointmentType[]

  createdAt: string
  updatedAt: string
}

// ==================== Request/Response Types ====================

export interface CreateAvailabilityRequest {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  slotDuration?: AppointmentDuration
  breakBetweenSlots?: number
  isActive?: boolean
  targetLawyerId?: string // For firm admins to manage another lawyer's availability
}

export interface UpdateAvailabilityRequest {
  startTime?: string
  endTime?: string
  slotDuration?: AppointmentDuration
  breakBetweenSlots?: number
  isActive?: boolean
}

export interface CreateBlockedTimeRequest {
  startDateTime: string
  endDateTime: string
  reason?: string
  isAllDay?: boolean
  isRecurring?: boolean
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
  targetLawyerId?: string // For firm admins to block time for another lawyer
}

/**
 * Location type for appointments - matches contract integrations.ts AppointmentLocationType
 * نوع الموقع للمواعيد
 *
 * Contract types: 'office' | 'virtual' | 'phone' | 'client'
 * Frontend aliases: 'video' → 'virtual', 'in-person' → 'office', 'client_site' → 'client'
 */
export type LocationType =
  | 'office'   // Contract: Office
  | 'virtual'  // Contract: Virtual
  | 'phone'    // Contract: Phone
  | 'client'   // Contract: Client
  // Legacy aliases for backwards compatibility
  | 'video'       // Maps to 'virtual'
  | 'in-person'   // Maps to 'office'
  | 'client_site' // Maps to 'client'
  | 'other'

export interface BookAppointmentRequest {
  date: string
  startTime: string
  duration?: AppointmentDuration
  type: AppointmentType
  clientName: string
  clientEmail: string
  clientPhone: string
  clientId?: string
  notes?: string
  caseId?: string
  source?: BookingSource
  meetingLink?: string
  location?: string
  locationType?: LocationType // Meeting type: video, in-person, or phone
  lawyerId?: string // Lawyer ID to assign appointment to (normalized to assignedTo by backend)
  assignedTo?: string // For firm admins to assign appointment to another lawyer
}

export interface UpdateAppointmentRequest {
  date?: string
  startTime?: string
  duration?: AppointmentDuration
  type?: AppointmentType
  status?: AppointmentStatus
  notes?: string
  meetingLink?: string
  location?: string
}

export interface GetAvailableSlotsRequest {
  lawyerId?: string
  date: string           // Single date: "2026-01-20"
  duration?: AppointmentDuration
}

export interface UpdateSettingsRequest {
  defaultDuration?: AppointmentDuration
  defaultBreakTime?: number
  allowOnlineBooking?: boolean
  requireApproval?: boolean
  advanceBookingDays?: number
  minNoticeHours?: number
  cancellationPolicyHours?: number
  autoConfirm?: boolean
  sendReminders?: boolean
  reminderHoursBefore?: number[]
  allowRescheduling?: boolean
  maxReschedulesPerAppointment?: number
  timezone?: string
  enablePricing?: boolean
  defaultPrice?: number
  currency?: string
  requirePaymentUpfront?: boolean
  enabledTypes?: AppointmentType[]
}

/**
 * Public booking request (no authentication required)
 * طلب الحجز العام (لا يتطلب مصادقة)
 */
export interface PublicBookingRequest {
  customerName: string
  customerEmail: string
  customerPhone?: string
  scheduledTime: string
  duration: number
  notes?: string
}

// ==================== Response Types ====================

export interface AvailabilityResponse {
  success: boolean
  data: AvailabilitySlot[]
}

export interface BlockedTimesResponse {
  success: boolean
  data: BlockedTime[]
}

export interface AppointmentsResponse {
  success: boolean
  data: {
    appointments: Appointment[]
    total: number
    page: number
    limit: number
  }
}

export interface AppointmentResponse {
  success: boolean
  data: Appointment
}

/**
 * Response from /appointments/slots endpoint (uses CRMSettings working hours)
 * استجابة نقطة النهاية /appointments/slots (تستخدم ساعات العمل من إعدادات CRM)
 */
export interface SlotsResponse {
  success: boolean
  data: {
    date: string              // ISO date string
    dayOfWeek: string         // e.g., "wednesday"
    working: boolean          // Is this a working day
    workingHours: {
      enabled: boolean
      start: string           // "09:00"
      end: string             // "17:00"
    }
    slots: AvailableTimeSlot[]
  }
}

/**
 * Response from /appointments/available-slots endpoint (uses AvailabilitySlot model)
 * استجابة نقطة النهاية /appointments/available-slots (تستخدم نموذج AvailabilitySlot)
 */
export interface AvailableSlotsResponse {
  success: boolean
  data: {
    slots: AvailableTimeSlot[]
    dateRange: {
      start: string
      end: string
    }
  }
}

export interface SettingsResponse {
  success: boolean
  data: AppointmentSettings
}

export interface AppointmentStatsResponse {
  success: boolean
  data: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    noShow: number
    todayCount: number
    weekCount: number
    monthCount: number
    revenueTotal?: number
    revenuePending?: number
  }
}

/**
 * Calendar status response
 * استجابة حالة التقويم
 *
 * Matches backend: GET /api/v1/appointments/calendar-status
 */
export interface CalendarStatusResponse {
  success: boolean
  data: {
    connections: {
      google: {
        connected: boolean
        email?: string
        autoSyncEnabled?: boolean
      }
      microsoft: {
        connected: boolean
        email?: string
        autoSyncEnabled?: boolean
      }
    }
    message: {
      en: string
      ar: string
    }
  }
}

/**
 * Calendar links response
 * استجابة روابط التقويم
 *
 * Matches backend: GET /api/v1/appointments/:id/calendar-links
 */
export interface CalendarLinksResponse {
  success: boolean
  data: {
    appointmentId: string
    appointmentNumber: string
    scheduledTime: string
    links: {
      google: string
      outlook: string
      office365: string
      yahoo: string
      apple: string // ICS download URL
    }
    labels: {
      google: string
      outlook: string
      office365: string
      yahoo: string
      apple: string
    }
  }
}

/**
 * Calendar sync response
 * استجابة مزامنة التقويم
 *
 * Matches backend: POST /api/v1/appointments/:id/sync-calendar
 */
export interface CalendarSyncResponse {
  success: boolean
  data: {
    syncResult: {
      google?: { success: boolean; eventId?: string; action?: string; error?: string }
      microsoft?: { success: boolean; eventId?: string; error?: string }
    }
    message?: {
      en: string
      ar: string
    }
  }
}

// ==================== Service ====================

const appointmentsService = {
  // ==================== Availability ====================

  /**
   * Get lawyer's availability schedule
   * الحصول على جدول توفر المحامي
   */
  getAvailability: async (lawyerId?: string): Promise<AvailabilityResponse> => {
    try {
      const params = lawyerId ? { lawyerId } : {}
      const response = await apiClient.get<AvailabilityResponse>('/appointments/availability', { params })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch availability | فشل في جلب التوفر'
      throw new Error(errorMessage)
    }
  },

  /**
   * Create availability slot
   * إنشاء فترة توفر
   */
  createAvailability: async (data: CreateAvailabilityRequest): Promise<{ success: boolean; data: AvailabilitySlot }> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: AvailabilitySlot }>('/appointments/availability', data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to create availability | فشل في إنشاء التوفر'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update availability slot
   * تحديث فترة التوفر
   */
  updateAvailability: async (id: string, data: UpdateAvailabilityRequest): Promise<{ success: boolean; data: AvailabilitySlot }> => {
    try {
      const response = await apiClient.put<{ success: boolean; data: AvailabilitySlot }>(`/appointments/availability/${id}`, data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to update availability | فشل في تحديث التوفر'
      throw new Error(errorMessage)
    }
  },

  /**
   * Delete availability slot
   * حذف فترة التوفر
   */
  deleteAvailability: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/appointments/availability/${id}`)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to delete availability | فشل في حذف التوفر'
      throw new Error(errorMessage)
    }
  },

  /**
   * Bulk update availability (set full week schedule)
   * تحديث التوفر بالجملة (تعيين جدول الأسبوع الكامل)
   */
  bulkUpdateAvailability: async (slots: CreateAvailabilityRequest[]): Promise<AvailabilityResponse> => {
    try {
      const response = await apiClient.post<AvailabilityResponse>('/appointments/availability/bulk', { slots })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to update availability | فشل في تحديث التوفر'
      throw new Error(errorMessage)
    }
  },

  // ==================== Blocked Times ====================

  /**
   * Get blocked times
   * الحصول على الأوقات المحجوبة
   */
  getBlockedTimes: async (params?: { startDate?: string; endDate?: string; targetLawyerId?: string }): Promise<BlockedTimesResponse> => {
    const endpoint = '/appointments/blocked-times'
    debugLog.request('GET', endpoint, undefined, params)
    try {
      const response = await apiClient.get<BlockedTimesResponse>(endpoint, { params })
      debugLog.response('GET', endpoint, { count: response.data?.data?.length })
      return response.data
    } catch (error: any) {
      debugLog.error('GET', endpoint, error)
      const errorMessage = handleApiError(error) || 'Failed to fetch blocked times | فشل في جلب الأوقات المحجوبة'
      throw new Error(errorMessage)
    }
  },

  /**
   * Create blocked time
   * إنشاء وقت محجوب
   */
  createBlockedTime: async (data: CreateBlockedTimeRequest): Promise<{ success: boolean; data: BlockedTime }> => {
    const startTime = performance.now()
    const endpoint = '/appointments/blocked-times'

    console.log('[BLOCK-TIME-SVC] ========== CREATE BLOCKED TIME SERVICE START ==========')
    console.log('[BLOCK-TIME-SVC] Endpoint:', 'POST', endpoint)
    console.log('[BLOCK-TIME-SVC] Full URL:', apiClient.defaults.baseURL + endpoint)
    console.log('[BLOCK-TIME-SVC] Request payload:', JSON.stringify(data, null, 2))
    console.log('[BLOCK-TIME-SVC] startDateTime:', data.startDateTime)
    console.log('[BLOCK-TIME-SVC] endDateTime:', data.endDateTime)
    console.log('[BLOCK-TIME-SVC] reason:', data.reason)
    console.log('[BLOCK-TIME-SVC] isAllDay:', data.isAllDay)
    console.log('[BLOCK-TIME-SVC] isRecurring:', data.isRecurring)
    console.log('[BLOCK-TIME-SVC] targetLawyerId:', (data as any).targetLawyerId || '(not set - will use current user)')
    console.log('[BLOCK-TIME-SVC] Auth header present?:', !!apiClient.defaults.headers.common['Authorization'])

    debugLog.request('POST', endpoint, data)
    try {
      const response = await apiClient.post<{ success: boolean; data: BlockedTime }>(endpoint, data)
      const endTime = performance.now()

      console.log('[BLOCK-TIME-SVC] ✅ Success')
      console.log('[BLOCK-TIME-SVC] Duration:', ((endTime - startTime) / 1000).toFixed(2), 'seconds')
      console.log('[BLOCK-TIME-SVC] Response status:', response.status)
      console.log('[BLOCK-TIME-SVC] Response data:', JSON.stringify(response.data, null, 2))
      console.log('[BLOCK-TIME-SVC] Created blocked time ID:', response.data?.data?.id)
      console.log('[BLOCK-TIME-SVC] ========== CREATE BLOCKED TIME SERVICE END ==========')

      debugLog.response('POST', endpoint, response.data)
      return response.data
    } catch (error: any) {
      const endTime = performance.now()

      console.error('[BLOCK-TIME-SVC] ❌ ERROR in createBlockedTime service')
      console.error('[BLOCK-TIME-SVC] Duration until error:', ((endTime - startTime) / 1000).toFixed(2), 'seconds')
      console.error('[BLOCK-TIME-SVC] Request payload that failed:', JSON.stringify(data, null, 2))
      console.error('[BLOCK-TIME-SVC] Error name:', error?.name)
      console.error('[BLOCK-TIME-SVC] Error message:', error?.message)
      console.error('[BLOCK-TIME-SVC] Error code:', error?.code)
      console.error('[BLOCK-TIME-SVC] Response status:', error?.response?.status)
      console.error('[BLOCK-TIME-SVC] Response statusText:', error?.response?.statusText)
      console.error('[BLOCK-TIME-SVC] Response data:', JSON.stringify(error?.response?.data, null, 2))
      console.error('[BLOCK-TIME-SVC] Response headers:', JSON.stringify(error?.response?.headers, null, 2))
      console.error('[BLOCK-TIME-SVC] Request URL:', error?.config?.url)
      console.error('[BLOCK-TIME-SVC] Request method:', error?.config?.method)
      console.error('[BLOCK-TIME-SVC] Request data sent:', error?.config?.data)
      console.error('[BLOCK-TIME-SVC] Is network error?:', error?.message === 'Network Error')
      console.error('[BLOCK-TIME-SVC] ========== CREATE BLOCKED TIME SERVICE ERROR END ==========')

      debugLog.error('POST', endpoint, error, data)
      const errorMessage = handleApiError(error) || 'Failed to create blocked time | فشل في إنشاء الوقت المحجوب'
      throw new Error(errorMessage)
    }
  },

  /**
   * Delete blocked time
   * حذف الوقت المحجوب
   */
  deleteBlockedTime: async (id: string): Promise<{ success: boolean }> => {
    const endpoint = `/appointments/blocked-times/${id}`
    debugLog.request('DELETE', endpoint)
    try {
      const response = await apiClient.delete<{ success: boolean }>(endpoint)
      debugLog.response('DELETE', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('DELETE', endpoint, error)
      const errorMessage = handleApiError(error) || 'Failed to delete blocked time | فشل في حذف الوقت المحجوب'
      throw new Error(errorMessage)
    }
  },

  // ==================== Appointments ====================

  /**
   * Get appointments
   * الحصول على المواعيد
   */
  getAppointments: async (params?: {
    status?: AppointmentStatus
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
    clientId?: string
    caseId?: string
  }): Promise<AppointmentsResponse> => {
    const endpoint = '/appointments'
    debugLog.request('GET', endpoint, undefined, params)
    try {
      const response = await apiClient.get<AppointmentsResponse>(endpoint, { params })
      debugLog.response('GET', endpoint, { total: response.data?.data?.total, count: response.data?.data?.appointments?.length })
      return response.data
    } catch (error: any) {
      debugLog.error('GET', endpoint, error)
      const errorMessage = handleApiError(error) || 'Failed to fetch appointments | فشل في جلب المواعيد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get single appointment
   * الحصول على موعد واحد
   */
  getAppointment: async (id: string): Promise<AppointmentResponse> => {
    const endpoint = `/appointments/${id}`
    debugLog.request('GET', endpoint)
    try {
      const response = await apiClient.get<AppointmentResponse>(endpoint)
      debugLog.response('GET', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('GET', endpoint, error)
      const errorMessage = handleApiError(error) || 'Failed to fetch appointment | فشل في جلب الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Book appointment (create)
   * حجز موعد (إنشاء)
   */
  bookAppointment: async (data: BookAppointmentRequest): Promise<AppointmentResponse> => {
    debugLog.request('POST', '/appointments', data)
    try {
      const response = await apiClient.post<AppointmentResponse>('/appointments', data)
      debugLog.response('POST', '/appointments', response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('POST', '/appointments', error, data)
      const errorMessage = handleApiError(error) || 'Failed to book appointment | فشل في حجز الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update appointment
   * تحديث الموعد
   */
  updateAppointment: async (id: string, data: UpdateAppointmentRequest): Promise<AppointmentResponse> => {
    const endpoint = `/appointments/${id}`
    debugLog.request('PUT', endpoint, data)
    try {
      const response = await apiClient.put<AppointmentResponse>(endpoint, data)
      debugLog.response('PUT', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('PUT', endpoint, error, data)
      const errorMessage = handleApiError(error) || 'Failed to update appointment | فشل في تحديث الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Cancel appointment (DELETE with optional reason in body)
   * إلغاء الموعد
   */
  cancelAppointment: async (id: string, reason?: string): Promise<AppointmentResponse> => {
    const startTime = performance.now()
    const endpoint = `/appointments/${id}`
    const data = { reason }

    console.log('[CANCEL-APT-SVC] ========== CANCEL APPOINTMENT SERVICE START ==========')
    console.log('[CANCEL-APT-SVC] Endpoint:', 'DELETE', endpoint)
    console.log('[CANCEL-APT-SVC] Full URL:', apiClient.defaults.baseURL + endpoint)
    console.log('[CANCEL-APT-SVC] Appointment ID:', id)
    console.log('[CANCEL-APT-SVC] ID format valid ObjectId?:', /^[a-f\d]{24}$/i.test(id))
    console.log('[CANCEL-APT-SVC] Reason:', reason)
    console.log('[CANCEL-APT-SVC] Request body:', JSON.stringify(data, null, 2))
    console.log('[CANCEL-APT-SVC] Auth header present?:', !!apiClient.defaults.headers.common['Authorization'])

    debugLog.request('DELETE', endpoint, data)
    try {
      const response = await apiClient.delete<AppointmentResponse>(endpoint, { data })
      const endTime = performance.now()

      console.log('[CANCEL-APT-SVC] ✅ Success')
      console.log('[CANCEL-APT-SVC] Duration:', ((endTime - startTime) / 1000).toFixed(2), 'seconds')
      console.log('[CANCEL-APT-SVC] Response status:', response.status)
      console.log('[CANCEL-APT-SVC] Response data:', JSON.stringify(response.data, null, 2))
      console.log('[CANCEL-APT-SVC] ========== CANCEL APPOINTMENT SERVICE END ==========')

      debugLog.response('DELETE', endpoint, response.data)
      return response.data
    } catch (error: any) {
      const endTime = performance.now()

      console.error('[CANCEL-APT-SVC] ❌ ERROR in cancelAppointment service')
      console.error('[CANCEL-APT-SVC] Duration until error:', ((endTime - startTime) / 1000).toFixed(2), 'seconds')
      console.error('[CANCEL-APT-SVC] Appointment ID:', id)
      console.error('[CANCEL-APT-SVC] Error name:', error?.name)
      console.error('[CANCEL-APT-SVC] Error message:', error?.message)
      console.error('[CANCEL-APT-SVC] Error code:', error?.code)
      console.error('[CANCEL-APT-SVC] Response status:', error?.response?.status)
      console.error('[CANCEL-APT-SVC] Response statusText:', error?.response?.statusText)
      console.error('[CANCEL-APT-SVC] Response data:', JSON.stringify(error?.response?.data, null, 2))
      console.error('[CANCEL-APT-SVC] Response headers:', JSON.stringify(error?.response?.headers, null, 2))
      console.error('[CANCEL-APT-SVC] Request URL:', error?.config?.url)
      console.error('[CANCEL-APT-SVC] Request method:', error?.config?.method)
      console.error('[CANCEL-APT-SVC] Request data:', error?.config?.data)
      console.error('[CANCEL-APT-SVC] Is network error?:', error?.message === 'Network Error')
      console.error('[CANCEL-APT-SVC] ========== CANCEL APPOINTMENT SERVICE ERROR END ==========')

      debugLog.error('DELETE', endpoint, error, data)
      const errorMessage = handleApiError(error) || 'Failed to cancel appointment | فشل في إلغاء الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Confirm appointment (PUT)
   * تأكيد الموعد
   */
  confirmAppointment: async (id: string): Promise<AppointmentResponse> => {
    const endpoint = `/appointments/${id}/confirm`
    debugLog.request('PUT', endpoint)
    try {
      const response = await apiClient.put<AppointmentResponse>(endpoint)
      debugLog.response('PUT', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('PUT', endpoint, error)
      const errorMessage = handleApiError(error) || 'Failed to confirm appointment | فشل في تأكيد الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Complete appointment (PUT)
   * إكمال الموعد
   */
  completeAppointment: async (id: string, notes?: string): Promise<AppointmentResponse> => {
    const endpoint = `/appointments/${id}/complete`
    const data = { notes }
    debugLog.request('PUT', endpoint, data)
    try {
      const response = await apiClient.put<AppointmentResponse>(endpoint, data)
      debugLog.response('PUT', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('PUT', endpoint, error, data)
      const errorMessage = handleApiError(error) || 'Failed to complete appointment | فشل في إكمال الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Mark as no-show (PUT)
   * وضع علامة عدم الحضور
   */
  markNoShow: async (id: string): Promise<AppointmentResponse> => {
    const endpoint = `/appointments/${id}/no-show`
    debugLog.request('PUT', endpoint)
    try {
      const response = await apiClient.put<AppointmentResponse>(endpoint)
      debugLog.response('PUT', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('PUT', endpoint, error)
      const errorMessage = handleApiError(error) || 'Failed to mark as no-show | فشل في وضع علامة عدم الحضور'
      throw new Error(errorMessage)
    }
  },

  /**
   * Reschedule appointment
   * إعادة جدولة الموعد
   */
  rescheduleAppointment: async (id: string, data: { date: string; startTime: string }): Promise<AppointmentResponse> => {
    const endpoint = `/appointments/${id}/reschedule`
    debugLog.request('POST', endpoint, data)
    try {
      const response = await apiClient.post<AppointmentResponse>(endpoint, data)
      debugLog.response('POST', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('POST', endpoint, error, data)
      const errorMessage = handleApiError(error) || 'Failed to reschedule appointment | فشل في إعادة جدولة الموعد'
      throw new Error(errorMessage)
    }
  },

  // ==================== Available Slots ====================

  /**
   * Get available time slots for booking using /slots endpoint
   * الحصول على الفترات الزمنية المتاحة للحجز باستخدام نقطة النهاية /slots
   *
   * Uses /appointments/slots which reads from CRMSettings.workingHours
   * This returns actual slots based on configured working hours
   *
   * API: GET /appointments/slots?date=YYYY-MM-DD&assignedTo=lawyerId&duration=30
   */
  getAvailableSlots: async (params: GetAvailableSlotsRequest): Promise<SlotsResponse> => {
    const endpoint = '/appointments/slots'
    // Transform lawyerId to assignedTo as required by /slots endpoint
    const { lawyerId, date, duration } = params
    const apiParams: Record<string, string | number | undefined> = {
      date,
      duration,
    }
    // /slots endpoint uses 'assignedTo' instead of 'lawyerId'
    if (lawyerId) {
      apiParams.assignedTo = lawyerId
    }
    debugLog.request('GET', endpoint, undefined, apiParams)
    try {
      const response = await apiClient.get<SlotsResponse>(endpoint, { params: apiParams })
      debugLog.response('GET', endpoint, response.data)
      return response.data
    } catch (error: any) {
      debugLog.error('GET', endpoint, error)
      const errorMessage = handleApiError(error) || 'Failed to fetch available slots | فشل في جلب الفترات المتاحة'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get available slots using the enhanced endpoint (AvailabilitySlot model)
   * الحصول على الفترات المتاحة باستخدام نقطة النهاية المحسنة (نموذج AvailabilitySlot)
   *
   * Uses /appointments/available-slots which reads from AvailabilitySlot model
   * This requires AvailabilitySlot records to exist for the lawyer
   *
   * API: GET /appointments/available-slots?lawyerId=XXX&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&duration=30
   */
  getAvailableSlotsEnhanced: async (params: GetAvailableSlotsRequest): Promise<AvailableSlotsResponse> => {
    try {
      const { date, ...rest } = params
      const apiParams = {
        ...rest,
        startDate: date,
        endDate: date,
      }
      const response = await apiClient.get<AvailableSlotsResponse>('/appointments/available-slots', { params: apiParams })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch available slots | فشل في جلب الفترات المتاحة'
      throw new Error(errorMessage)
    }
  },

  // ==================== Settings ====================

  /**
   * Get appointment settings
   * الحصول على إعدادات المواعيد
   */
  getSettings: async (): Promise<SettingsResponse> => {
    try {
      const response = await apiClient.get<SettingsResponse>('/appointments/settings')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch settings | فشل في جلب الإعدادات'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update appointment settings
   * تحديث إعدادات المواعيد
   */
  updateSettings: async (data: UpdateSettingsRequest): Promise<SettingsResponse> => {
    try {
      const response = await apiClient.put<SettingsResponse>('/appointments/settings', data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to update settings | فشل في تحديث الإعدادات'
      throw new Error(errorMessage)
    }
  },

  // ==================== Stats ====================

  /**
   * Get appointment statistics
   * الحصول على إحصائيات المواعيد
   */
  getStats: async (params?: { startDate?: string; endDate?: string }): Promise<AppointmentStatsResponse> => {
    try {
      const response = await apiClient.get<AppointmentStatsResponse>('/appointments/stats', { params })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch stats | فشل في جلب الإحصائيات'
      throw new Error(errorMessage)
    }
  },

  // ==================== Public Booking ====================

  /**
   * Public appointment booking (no authentication required)
   * حجز موعد عام (لا يتطلب مصادقة)
   *
   * @param firmId - The firm ID for public booking | معرف المكتب للحجز العام
   * @param data - Public booking request data | بيانات طلب الحجز العام
   * @returns Appointment response | استجابة الموعد
   */
  publicBookAppointment: async (firmId: string, data: PublicBookingRequest): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.post<AppointmentResponse>(`/appointments/book/${firmId}`, data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to book appointment | فشل في حجز الموعد'
      throw new Error(errorMessage)
    }
  },

  // ==================== Calendar Integration ====================

  /**
   * Get appointment as ICS calendar file
   * الحصول على الموعد كملف تقويم ICS
   *
   * @param id - Appointment ID | معرف الموعد
   * @returns ICS file blob | ملف ICS
   */
  getCalendarICS: async (id: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/appointments/${id}/calendar.ics`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to download calendar file | فشل في تحميل ملف التقويم'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get calendar connection status
   * الحصول على حالة اتصال التقويم
   *
   * @returns Calendar connection status | حالة اتصال التقويم
   */
  getCalendarStatus: async (): Promise<CalendarStatusResponse> => {
    try {
      const response = await apiClient.get<CalendarStatusResponse>('/appointments/calendar-status')
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch calendar status | فشل في جلب حالة التقويم'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get calendar links for an appointment
   * الحصول على روابط التقويم للموعد
   *
   * @param id - Appointment ID | معرف الموعد
   * @returns Calendar links (Google, Outlook, Yahoo, ICS) | روابط التقويم (جوجل، أوتلوك، ياهو، ICS)
   */
  getCalendarLinks: async (id: string): Promise<CalendarLinksResponse> => {
    try {
      const response = await apiClient.get<CalendarLinksResponse>(`/appointments/${id}/calendar-links`)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch calendar links | فشل في جلب روابط التقويم'
      throw new Error(errorMessage)
    }
  },

  /**
   * Sync appointment to connected calendars
   * مزامنة الموعد مع التقاويم المتصلة
   *
   * @param id - Appointment ID | معرف الموعد
   * @returns Sync result for Google and Microsoft calendars | نتيجة المزامنة لتقاويم جوجل ومايكروسوفت
   */
  syncToCalendar: async (id: string): Promise<CalendarSyncResponse> => {
    try {
      const response = await apiClient.post<CalendarSyncResponse>(`/appointments/${id}/sync-calendar`)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to sync to calendar | فشل في المزامنة مع التقويم'
      throw new Error(errorMessage)
    }
  },
}

export default appointmentsService
