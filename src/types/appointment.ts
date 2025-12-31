/**
 * Appointment Types
 * Types for appointment booking, scheduling, and management
 * Supports both internal and public booking workflows
 */

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT STATUS TYPES
// ═══════════════════════════════════════════════════════════════

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'no_show'
  // Note: 'cancelled' status removed - appointments are now hard-deleted instead

export type AppointmentWith = 'lead' | 'client' | 'contact'

export type LocationType = 'office' | 'virtual' | 'client_site' | 'other'

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Appointment {
  _id: string

  // ─── Scheduling ───
  scheduledTime: Date
  duration: number // Minutes
  endTime: Date

  // ─── Status ───
  status: AppointmentStatus

  // ─── Customer Info ───
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerNotes?: string

  // ─── Linkage to CRM Records ───
  appointmentWith: AppointmentWith
  partyId: string // Lead ID, Client ID, or Contact ID
  caseId?: string // Optional link to Case/Opportunity

  // ─── Assignment ───
  assignedTo: string // User/Sales Person ID

  // ─── Location ───
  locationType: LocationType
  location?: string // Physical location address or description
  meetingLink?: string // Virtual meeting link (Zoom, Teams, etc.)

  // ─── Calendar Integration ───
  calendarEventId?: string // External calendar sync (Google Calendar, Outlook, etc.)
  sendReminder: boolean
  reminderSentAt?: Date

  // ─── Outcome Tracking ───
  outcome?: string // Notes about what happened during appointment
  followUpRequired?: boolean
  followUpDate?: Date

  // ─── Metadata ───
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT SLOT INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface AppointmentSlot {
  _id: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sunday = 0
  fromTime: string // "09:00"
  toTime: string // "17:00"
  enabled: boolean
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT AVAILABILITY TYPES
// ═══════════════════════════════════════════════════════════════

export interface AvailableSlot {
  startTime: Date
  endTime: Date
  duration: number // Minutes
  assignedTo: string // User/Sales Person ID
}

export interface WorkingHours {
  sunday: DaySchedule
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
}

export interface DaySchedule {
  enabled: boolean
  start: string // "09:00"
  end: string // "17:00"
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT BOOKING REQUEST (Public Booking)
// ═══════════════════════════════════════════════════════════════

export interface AppointmentBookingRequest {
  // Customer Information
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerNotes?: string

  // Appointment Details
  scheduledTime: Date
  duration: number
  assignedTo: string

  // Location Preference
  locationType: LocationType
  location?: string

  // Optional Lead/Case Creation
  createLead?: boolean
  leadSource?: string

  // Phone Verification (if enabled in settings)
  verificationCode?: string
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT REMINDER TYPES
// ═══════════════════════════════════════════════════════════════

export interface AppointmentReminder {
  appointmentId: string
  recipientEmail: string
  recipientPhone?: string
  scheduledTime: Date
  reminderType: 'email' | 'sms' | 'whatsapp'
  hoursBefore: number // 24, 1, etc.
  sent: boolean
  sentAt?: Date
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT FILTERS
// ═══════════════════════════════════════════════════════════════

export interface AppointmentFilters {
  status?: AppointmentStatus | AppointmentStatus[]
  assignedTo?: string | string[]
  appointmentWith?: AppointmentWith
  partyId?: string
  caseId?: string
  locationType?: LocationType
  dateFrom?: Date
  dateTo?: Date
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT STATS
// ═══════════════════════════════════════════════════════════════

export interface AppointmentStats {
  total: number
  scheduled: number
  confirmed: number
  completed: number
  // cancelled removed - appointments are now hard-deleted
  noShow: number
  upcomingToday: number
  upcomingThisWeek: number
  completionRate: number // Percentage
  noShowRate: number // Percentage
}
