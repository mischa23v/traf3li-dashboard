import { z } from 'zod'

/**
 * ==================== ENUMS ====================
 */

export type EventStatus =
  | 'scheduled'
  | 'confirmed'
  | 'tentative'
  | 'canceled'
  | 'postponed'
  | 'completed'

export type EventType =
  | 'hearing'
  | 'court_date'
  | 'client_meeting'
  | 'consultation'
  | 'deadline'
  | 'deposition'
  | 'mediation'
  | 'arbitration'
  | 'settlement_conference'
  | 'filing'
  | 'internal_meeting'
  | 'training'
  | 'other'

export type CourtType =
  | 'general_court'
  | 'criminal_court'
  | 'family_court'
  | 'commercial_court'
  | 'labor_court'
  | 'appeal_court'
  | 'supreme_court'
  | 'administrative_court'
  | 'enforcement_court'

export type MeetingPlatform = 'zoom' | 'teams' | 'google_meet' | 'webex' | 'other'

export type LocationType = 'physical' | 'virtual' | 'hybrid'

export type AttendeeRole = 'organizer' | 'required' | 'optional'

export type AttendeeResponseStatus = 'pending' | 'accepted' | 'declined' | 'tentative'

export type BillingType = 'hourly' | 'fixed_fee' | 'retainer' | 'pro_bono' | 'not_billable'

export type InvoiceStatus = 'not_invoiced' | 'invoiced' | 'paid'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

export type RecurrenceEndType = 'never' | 'after_occurrences' | 'on_date'

/**
 * ==================== ZOD ENUMS ====================
 */

export const eventStatusEnum = z.enum([
  'scheduled',
  'confirmed',
  'tentative',
  'canceled',
  'postponed',
  'completed'
])

export const eventTypeEnum = z.enum([
  'hearing',
  'court_date',
  'client_meeting',
  'consultation',
  'deadline',
  'deposition',
  'mediation',
  'arbitration',
  'settlement_conference',
  'filing',
  'internal_meeting',
  'training',
  'other'
])

export const courtTypeEnum = z.enum([
  'general_court',
  'criminal_court',
  'family_court',
  'commercial_court',
  'labor_court',
  'appeal_court',
  'supreme_court',
  'administrative_court',
  'enforcement_court'
])

export const meetingPlatformEnum = z.enum(['zoom', 'teams', 'google_meet', 'webex', 'other'])

export const locationTypeEnum = z.enum(['physical', 'virtual', 'hybrid'])

export const attendeeRoleEnum = z.enum(['organizer', 'required', 'optional'])

export const attendeeResponseStatusEnum = z.enum(['pending', 'accepted', 'declined', 'tentative'])

export const billingTypeEnum = z.enum(['hourly', 'fixed_fee', 'retainer', 'pro_bono', 'not_billable'])

export const invoiceStatusEnum = z.enum(['not_invoiced', 'invoiced', 'paid'])

export const recurrenceFrequencyEnum = z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])

export const recurrenceEndTypeEnum = z.enum(['never', 'after_occurrences', 'on_date'])

/**
 * ==================== SUB-INTERFACES ====================
 */

export interface EventCourtDetails {
  courtType?: CourtType
  courtCaseNumber?: string
  caseYear?: number
  najizCaseNumber?: string
}

export interface EventVirtualMeeting {
  platform?: MeetingPlatform
  meetingUrl?: string
  meetingId?: string
  meetingPassword?: string
}

export interface EventAttendee {
  name: string
  email?: string
  phone?: string
  isRequired: boolean
  role: AttendeeRole
  responseStatus: AttendeeResponseStatus
  respondedAt?: Date
}

export interface EventBilling {
  isBillable: boolean
  billingType?: BillingType
  hourlyRate?: number
  fixedAmount?: number
  currency: string
  billableAmount?: number
  invoiceStatus: InvoiceStatus
  linkedInvoiceId?: string
}

export interface EventRecurrence {
  enabled: boolean
  frequency?: RecurrenceFrequency
  daysOfWeek?: number[]
  dayOfMonth?: number
  interval?: number
  endType?: RecurrenceEndType
  endDate?: Date
  maxOccurrences?: number
  occurrencesCompleted?: number
}

export interface EventLocation {
  type: LocationType
  address?: string
  city?: string
  room?: string
  buildingName?: string
  floor?: string
  notes?: string
}

/**
 * ==================== ZOD SUB-SCHEMAS ====================
 */

export const eventCourtDetailsSchema = z.object({
  courtType: courtTypeEnum.optional(),
  courtCaseNumber: z.string().optional(),
  caseYear: z.number().optional(),
  najizCaseNumber: z.string().optional()
})

export const eventVirtualMeetingSchema = z.object({
  platform: meetingPlatformEnum.optional(),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional()
})

export const eventAttendeeSchema = z.object({
  name: z.string().min(1, 'Attendee name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  isRequired: z.boolean().default(true),
  role: attendeeRoleEnum.default('required'),
  responseStatus: attendeeResponseStatusEnum.default('pending'),
  respondedAt: z.date().optional()
})

export const eventBillingSchema = z.object({
  isBillable: z.boolean().default(true),
  billingType: billingTypeEnum.optional(),
  hourlyRate: z.number().positive().optional(),
  fixedAmount: z.number().positive().optional(),
  currency: z.string().default('SAR'),
  billableAmount: z.number().optional(),
  invoiceStatus: invoiceStatusEnum.default('not_invoiced'),
  linkedInvoiceId: z.string().optional()
})

export const eventRecurrenceSchema = z.object({
  enabled: z.boolean().default(false),
  frequency: recurrenceFrequencyEnum.optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  interval: z.number().positive().optional(),
  endType: recurrenceEndTypeEnum.optional(),
  endDate: z.date().optional(),
  maxOccurrences: z.number().positive().optional(),
  occurrencesCompleted: z.number().default(0).optional()
})

export const eventLocationSchema = z.object({
  type: locationTypeEnum.default('physical'),
  address: z.string().optional(),
  city: z.string().optional(),
  room: z.string().optional(),
  buildingName: z.string().optional(),
  floor: z.string().optional(),
  notes: z.string().optional()
})

/**
 * ==================== MAIN EVENT INTERFACE ====================
 */

export interface Event {
  // Core identifiers
  _id?: string
  id: string

  // Basic info
  title: string
  description?: string
  type: EventType
  status: EventStatus

  // Date & Time
  startDateTime: Date
  endDateTime: Date
  allDay?: boolean
  timezone?: string

  // Location
  location?: EventLocation

  // Relations
  caseId?: string
  clientId?: string
  taskId?: string
  reminderId?: string
  invoiceId?: string

  // Court Details (for hearings/court dates)
  courtDetails?: EventCourtDetails

  // Virtual Meeting
  virtualMeeting?: EventVirtualMeeting

  // Attendees
  attendees?: EventAttendee[]

  // Recurrence
  recurrence?: EventRecurrence
  isRecurringInstance?: boolean
  parentEventId?: string

  // Billing
  billing?: EventBilling

  // Completion & Follow-up
  completedAt?: Date
  outcome?: string
  followUpRequired?: boolean
  followUpTaskId?: string
  followUpNotes?: string

  // Metadata
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
  tags?: string[]
  color?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
}

/**
 * ==================== MAIN EVENT SCHEMA ====================
 */

export const eventSchema = z.object({
  // Core identifiers
  _id: z.string().optional(),
  id: z.string(),

  // Basic info
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  type: eventTypeEnum.default('other'),
  status: eventStatusEnum.default('scheduled'),

  // Date & Time
  startDateTime: z.date(),
  endDateTime: z.date(),
  allDay: z.boolean().default(false),
  timezone: z.string().optional(),

  // Location
  location: eventLocationSchema.optional(),

  // Relations
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  taskId: z.string().optional(),
  reminderId: z.string().optional(),
  invoiceId: z.string().optional(),

  // Court Details
  courtDetails: eventCourtDetailsSchema.optional(),

  // Virtual Meeting
  virtualMeeting: eventVirtualMeetingSchema.optional(),

  // Attendees
  attendees: z.array(eventAttendeeSchema).optional(),

  // Recurrence
  recurrence: eventRecurrenceSchema.optional(),
  isRecurringInstance: z.boolean().default(false),
  parentEventId: z.string().optional(),

  // Billing
  billing: eventBillingSchema.optional(),

  // Completion & Follow-up
  completedAt: z.date().optional(),
  outcome: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpTaskId: z.string().optional(),
  followUpNotes: z.string().optional(),

  // Metadata
  createdBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional()
})

/**
 * ==================== FORM SCHEMA ====================
 */

export const eventFormSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  type: eventTypeEnum.default('other'),
  status: eventStatusEnum.default('scheduled'),

  // Date & Time (as strings for form inputs)
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean().default(false),

  // Location
  locationType: locationTypeEnum.default('physical'),
  locationAddress: z.string().optional(),
  locationCity: z.string().optional(),
  locationRoom: z.string().optional(),
  locationBuildingName: z.string().optional(),
  locationFloor: z.string().optional(),
  locationNotes: z.string().optional(),

  // Relations
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  taskId: z.string().optional(),
  reminderId: z.string().optional(),
  invoiceId: z.string().optional(),

  // Court Details
  courtType: courtTypeEnum.optional(),
  courtCaseNumber: z.string().optional(),
  caseYear: z.number().optional(),
  najizCaseNumber: z.string().optional(),

  // Virtual Meeting
  meetingPlatform: meetingPlatformEnum.optional(),
  meetingUrl: z.string().optional(),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional(),

  // Billing
  isBillable: z.boolean().default(true),
  billingType: billingTypeEnum.optional(),
  hourlyRate: z.number().optional(),
  fixedAmount: z.number().optional(),
  currency: z.string().default('SAR'),

  // Recurrence
  recurringEnabled: z.boolean().default(false),
  recurringFrequency: recurrenceFrequencyEnum.optional(),
  recurringEndType: recurrenceEndTypeEnum.optional(),
  recurringEndDate: z.string().optional(),
  recurringMaxOccurrences: z.number().optional(),

  // Completion
  outcome: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpNotes: z.string().optional(),

  // Metadata
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

export type EventFormData = z.infer<typeof eventFormSchema>
