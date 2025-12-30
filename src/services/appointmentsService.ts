/**
 * Appointments Service
 * Handles all appointment-related API calls including availability management and booking
 *
 * خدمة المواعيد
 * تتعامل مع جميع استدعاءات API المتعلقة بالمواعيد بما في ذلك إدارة التوفر والحجز
 */

import { apiClientNoVersion as apiClient, handleApiError } from '@/lib/api'

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
 * Appointment type
 */
export type AppointmentType = 'consultation' | 'follow_up' | 'case_review' | 'initial_meeting' | 'other'

/**
 * Appointment status
 */
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

/**
 * Booking source
 */
export type BookingSource = 'marketplace' | 'manual' | 'client_dashboard' | 'website'

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
  location?: string // For in-person appointments

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
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
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
  lawyerId: string
  startDate: string
  endDate: string
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
    try {
      const response = await apiClient.get<BlockedTimesResponse>('/appointments/blocked-times', { params })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch blocked times | فشل في جلب الأوقات المحجوبة'
      throw new Error(errorMessage)
    }
  },

  /**
   * Create blocked time
   * إنشاء وقت محجوب
   */
  createBlockedTime: async (data: CreateBlockedTimeRequest): Promise<{ success: boolean; data: BlockedTime }> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: BlockedTime }>('/appointments/blocked-times', data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to create blocked time | فشل في إنشاء الوقت المحجوب'
      throw new Error(errorMessage)
    }
  },

  /**
   * Delete blocked time
   * حذف الوقت المحجوب
   */
  deleteBlockedTime: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/appointments/blocked-times/${id}`)
      return response.data
    } catch (error: any) {
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
    try {
      const response = await apiClient.get<AppointmentsResponse>('/appointments', { params })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch appointments | فشل في جلب المواعيد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Get single appointment
   * الحصول على موعد واحد
   */
  getAppointment: async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.get<AppointmentResponse>(`/appointments/${id}`)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to fetch appointment | فشل في جلب الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Book appointment (create)
   * حجز موعد (إنشاء)
   */
  bookAppointment: async (data: BookAppointmentRequest): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.post<AppointmentResponse>('/appointments', data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to book appointment | فشل في حجز الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update appointment
   * تحديث الموعد
   */
  updateAppointment: async (id: string, data: UpdateAppointmentRequest): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.put<AppointmentResponse>(`/appointments/${id}`, data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to update appointment | فشل في تحديث الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Cancel appointment (DELETE with optional reason in body)
   * إلغاء الموعد
   */
  cancelAppointment: async (id: string, reason?: string): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.delete<AppointmentResponse>(`/appointments/${id}`, {
        data: { reason }
      })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to cancel appointment | فشل في إلغاء الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Confirm appointment (PUT)
   * تأكيد الموعد
   */
  confirmAppointment: async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.put<AppointmentResponse>(`/appointments/${id}/confirm`)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to confirm appointment | فشل في تأكيد الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Complete appointment (PUT)
   * إكمال الموعد
   */
  completeAppointment: async (id: string, notes?: string): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.put<AppointmentResponse>(`/appointments/${id}/complete`, { notes })
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to complete appointment | فشل في إكمال الموعد'
      throw new Error(errorMessage)
    }
  },

  /**
   * Mark as no-show (PUT)
   * وضع علامة عدم الحضور
   */
  markNoShow: async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.put<AppointmentResponse>(`/appointments/${id}/no-show`)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to mark as no-show | فشل في وضع علامة عدم الحضور'
      throw new Error(errorMessage)
    }
  },

  /**
   * Reschedule appointment
   * إعادة جدولة الموعد
   */
  rescheduleAppointment: async (id: string, data: { date: string; startTime: string }): Promise<AppointmentResponse> => {
    try {
      const response = await apiClient.post<AppointmentResponse>(`/appointments/${id}/reschedule`, data)
      return response.data
    } catch (error: any) {
      const errorMessage = handleApiError(error) || 'Failed to reschedule appointment | فشل في إعادة جدولة الموعد'
      throw new Error(errorMessage)
    }
  },

  // ==================== Available Slots ====================

  /**
   * Get available time slots for booking
   * الحصول على الفترات الزمنية المتاحة للحجز
   */
  getAvailableSlots: async (params: GetAvailableSlotsRequest): Promise<AvailableSlotsResponse> => {
    try {
      const response = await apiClient.get<AvailableSlotsResponse>('/appointments/available-slots', { params })
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
}

export default appointmentsService
