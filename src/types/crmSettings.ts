/**
 * CRM Settings Types
 *
 * Comprehensive CRM configuration settings for the Traf3li law firm dashboard.
 * Based on ERPNext CRM Settings with law firm-specific enhancements.
 *
 * @see docs/CRM_ENHANCEMENT_PLAN.md - Phase 3: CRM Settings
 */

// ═══════════════════════════════════════════════════════════════════════════
// LEAD SETTINGS (ERPNext: CRM Settings > Lead Settings)
// ═══════════════════════════════════════════════════════════════════════════

export interface LeadSettings {
  /**
   * Allow Lead Duplication - Permit duplicate emails
   * @erpnext Allow Lead Duplication
   */
  allowDuplicateEmails: boolean

  /**
   * Allow duplicate phone numbers
   */
  allowDuplicatePhones: boolean

  /**
   * Auto Creation of Contact - Create contact from lead automatically
   * @erpnext Auto Creation of Contact
   */
  autoCreateContact: boolean

  /**
   * Default lead source for new leads
   */
  defaultLeadSource?: string

  /**
   * Default user to assign new leads to
   */
  defaultAssignee?: string

  /**
   * Enable lead scoring functionality
   */
  leadScoringEnabled: boolean

  /**
   * Enable automatic assignment of leads
   */
  autoAssignmentEnabled: boolean

  /**
   * Rule for auto-assignment of leads
   */
  autoAssignmentRule?: 'round_robin' | 'load_balance' | 'territory'

  /**
   * Track first response time for leads
   */
  trackFirstResponseTime: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// CASE/OPPORTUNITY SETTINGS (ERPNext: CRM Settings > Opportunity Settings)
// ═══════════════════════════════════════════════════════════════════════════

export interface CaseSettings {
  /**
   * Close Opportunity After Days - Auto-close stale cases
   * @erpnext Close Opportunity After Days
   */
  autoCloseAfterDays: number

  /**
   * Enable automatic closing of stale cases
   */
  autoCloseEnabled: boolean

  /**
   * Require conflict check before proceeding
   */
  requireConflictCheck: boolean

  /**
   * Stage ID before which conflict check must be completed
   */
  conflictCheckBeforeStage?: string

  /**
   * Default pipeline for new cases
   */
  defaultPipeline?: string

  /**
   * Default sales stage for new cases
   */
  defaultSalesStage?: string

  /**
   * Auto-create quote when case is qualified
   */
  autoCreateQuoteOnQualified: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE/PROPOSAL SETTINGS (ERPNext: CRM Settings > Quotation Settings)
// ═══════════════════════════════════════════════════════════════════════════

export interface QuoteSettings {
  /**
   * Default Quotation Valid Till - Default validity period in days
   * @erpnext Default Quotation Valid Till
   */
  defaultValidDays: number

  /**
   * Automatically send reminder before expiry
   */
  autoSendReminder: boolean

  /**
   * Number of days before expiry to send reminder
   */
  reminderDaysBefore: number

  /**
   * Require approval for quotes
   */
  requireApproval: boolean

  /**
   * Amount threshold above which approval is required
   */
  approvalThreshold?: number

  /**
   * User IDs who can approve quotes
   */
  approvers?: string[]
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNICATION SETTINGS (ERPNext: CRM Settings > Communication)
// ═══════════════════════════════════════════════════════════════════════════

export interface CommunicationSettings {
  /**
   * Carry Forward Communication - Copy emails across pipeline stages
   * @erpnext Carry Forward Communication
   */
  carryForwardCommunication: boolean

  /**
   * Update Timestamp on Communication - Track activity timestamps
   * @erpnext Update Timestamp on Communication
   */
  updateTimestampOnCommunication: boolean

  /**
   * Auto-log incoming/outgoing emails
   */
  autoLogEmails: boolean

  /**
   * Auto-log phone calls
   */
  autoLogCalls: boolean

  /**
   * Auto-log WhatsApp messages
   */
  autoLogWhatsApp: boolean

  /**
   * Default email template ID
   */
  defaultEmailTemplateId?: string

  /**
   * Default SMS template ID
   */
  defaultSMSTemplateId?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// APPOINTMENT SETTINGS (ERPNext: CRM Settings > Appointment Booking)
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkingHours {
  enabled: boolean
  start: string  // HH:mm format e.g., "09:00"
  end: string    // HH:mm format e.g., "17:00"
}

export interface AppointmentSettings {
  /**
   * Enable Scheduling - Toggle appointment booking
   * @erpnext Enable Scheduling
   */
  enabled: boolean

  /**
   * Appointment Duration - Default slot length in minutes
   * @erpnext Appointment Duration (15/30/45/60)
   */
  defaultDuration: number

  /**
   * Allowed duration options in minutes
   */
  allowedDurations: number[]

  /**
   * Advance Booking Days - How far ahead clients can book
   * @erpnext Advance Booking Days
   */
  advanceBookingDays: number

  /**
   * Minimum hours before appointment can be booked
   */
  minAdvanceBookingHours: number

  /**
   * Agent List - Available staff User IDs for appointments
   * @erpnext Agent List
   */
  agentList: string[]

  /**
   * Holiday List - Block unavailable dates
   * @erpnext Holiday List
   */
  holidayListId?: string

  /**
   * Buffer between appointments in minutes
   */
  bufferBetweenAppointments: number

  /**
   * Working hours per day of week
   */
  workingHours: {
    sunday: WorkingHours
    monday: WorkingHours
    tuesday: WorkingHours
    wednesday: WorkingHours
    thursday: WorkingHours
    friday: WorkingHours
    saturday: WorkingHours
  }

  /**
   * Send appointment reminders
   */
  sendReminders: boolean

  /**
   * Hours before appointment to send reminders (e.g., [24, 1] = 24hrs and 1hr before)
   */
  reminderHoursBefore: number[]

  /**
   * Allow public booking page
   */
  publicBookingEnabled: boolean

  /**
   * Public booking page URL
   */
  publicBookingUrl?: string

  /**
   * Require phone verification for public bookings
   */
  requirePhoneVerification: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// NAMING/NUMBERING SETTINGS (ERPNext: CRM Settings > Naming)
// ═══════════════════════════════════════════════════════════════════════════

export type CampaignNamingBy = 'name' | 'series'
export type NumberFormat = 'YYYY-####' | 'YYMM-####' | '####'

export interface NamingSettings {
  /**
   * Campaign Naming By - Auto-name campaigns
   * @erpnext Campaign Naming By
   */
  campaignNamingBy: CampaignNamingBy

  /**
   * Prefix for lead numbers (e.g., "LEAD-")
   */
  leadPrefix: string

  /**
   * Prefix for case numbers (e.g., "CASE-")
   */
  casePrefix: string

  /**
   * Prefix for quote numbers (e.g., "QT-")
   */
  quotePrefix: string

  /**
   * Prefix for contract numbers (e.g., "CTR-")
   */
  contractPrefix: string

  /**
   * Prefix for appointment numbers (e.g., "APT-")
   */
  appointmentPrefix: string

  /**
   * Number format pattern
   */
  numberFormat: NumberFormat

  /**
   * Reset numbering yearly
   */
  resetNumberingYearly: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// TERRITORY SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface TerritorySettings {
  /**
   * Enable territory management
   */
  enabled: boolean

  /**
   * Default territory ID for new leads/cases
   */
  defaultTerritory?: string

  /**
   * Auto-assign leads/cases by territory
   */
  autoAssignByTerritory: boolean

  /**
   * Require territory selection on lead creation
   */
  requireTerritoryOnLead: boolean

  /**
   * Require territory selection on case creation
   */
  requireTerritoryOnCase: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// SALES PERSON SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface SalesPersonSettings {
  /**
   * Enable sales person hierarchy
   */
  hierarchyEnabled: boolean

  /**
   * Enable commission tracking
   */
  commissionTrackingEnabled: boolean

  /**
   * Enable target tracking
   */
  targetTrackingEnabled: boolean

  /**
   * Require sales person on case
   */
  requireSalesPersonOnCase: boolean

  /**
   * Default commission rate percentage
   */
  defaultCommissionRate: number
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export type ClientCreationTrigger = 'sales_order' | 'payment_received' | 'manual'

export interface ConversionSettings {
  /**
   * Auto-create case when consultation is completed
   */
  autoCreateCaseOnConsultation: boolean

  /**
   * Require BANT qualification before creating case
   */
  requireBANTBeforeCase: boolean

  /**
   * Auto-create quote when case is qualified
   */
  autoCreateQuoteOnQualified: boolean

  /**
   * Auto-create sales order when quote is accepted
   */
  autoCreateSalesOrderOnAccept: boolean

  /**
   * Link sales order to Finance module
   */
  linkSalesOrderToFinance: boolean

  /**
   * Auto-create client when sales order is created
   */
  autoCreateClientOnSalesOrder: boolean

  /**
   * Trigger for client creation
   */
  clientCreationTrigger: ClientCreationTrigger

  /**
   * Copy notes during conversion
   */
  copyNotesToCase: boolean

  /**
   * Copy activity history during conversion
   */
  copyActivityHistory: boolean

  /**
   * Copy documents during conversion
   */
  copyDocuments: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CRM SETTINGS INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface CRMSettings {
  _id: string
  officeId: string

  leadSettings: LeadSettings
  caseSettings: CaseSettings
  quoteSettings: QuoteSettings
  communicationSettings: CommunicationSettings
  appointmentSettings: AppointmentSettings
  namingSettings: NamingSettings
  territorySettings: TerritorySettings
  salesPersonSettings: SalesPersonSettings
  conversionSettings: ConversionSettings

  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Default working hours for Saudi Arabia (Sunday-Thursday)
 */
export const DEFAULT_WORKING_HOURS: AppointmentSettings['workingHours'] = {
  sunday: { enabled: true, start: '09:00', end: '17:00' },
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: false, start: '09:00', end: '17:00' },   // Weekend in KSA
  saturday: { enabled: false, start: '09:00', end: '17:00' },  // Weekend in KSA
}

/**
 * Default CRM Settings for new offices
 */
export const DEFAULT_CRM_SETTINGS: Omit<CRMSettings, '_id' | 'officeId' | 'createdAt' | 'updatedAt'> = {
  leadSettings: {
    allowDuplicateEmails: false,
    allowDuplicatePhones: false,
    autoCreateContact: true,
    defaultLeadSource: undefined,
    defaultAssignee: undefined,
    leadScoringEnabled: true,
    autoAssignmentEnabled: false,
    autoAssignmentRule: 'round_robin',
    trackFirstResponseTime: true,
  },

  caseSettings: {
    autoCloseAfterDays: 90,
    autoCloseEnabled: false,
    requireConflictCheck: true,
    conflictCheckBeforeStage: undefined,
    defaultPipeline: undefined,
    defaultSalesStage: undefined,
    autoCreateQuoteOnQualified: false,
  },

  quoteSettings: {
    defaultValidDays: 30,
    autoSendReminder: true,
    reminderDaysBefore: 7,
    requireApproval: false,
    approvalThreshold: undefined,
    approvers: [],
  },

  communicationSettings: {
    carryForwardCommunication: true,
    updateTimestampOnCommunication: true,
    autoLogEmails: true,
    autoLogCalls: true,
    autoLogWhatsApp: true,
    defaultEmailTemplateId: undefined,
    defaultSMSTemplateId: undefined,
  },

  appointmentSettings: {
    enabled: false,
    defaultDuration: 30,
    allowedDurations: [15, 30, 45, 60],
    advanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    agentList: [],
    holidayListId: undefined,
    bufferBetweenAppointments: 0,
    workingHours: DEFAULT_WORKING_HOURS,
    sendReminders: true,
    reminderHoursBefore: [24, 1],
    publicBookingEnabled: false,
    publicBookingUrl: undefined,
    requirePhoneVerification: true,
  },

  namingSettings: {
    campaignNamingBy: 'name',
    leadPrefix: 'LEAD-',
    casePrefix: 'CASE-',
    quotePrefix: 'QT-',
    contractPrefix: 'CTR-',
    appointmentPrefix: 'APT-',
    numberFormat: 'YYYY-####',
    resetNumberingYearly: true,
  },

  territorySettings: {
    enabled: false,
    defaultTerritory: undefined,
    autoAssignByTerritory: false,
    requireTerritoryOnLead: false,
    requireTerritoryOnCase: false,
  },

  salesPersonSettings: {
    hierarchyEnabled: false,
    commissionTrackingEnabled: false,
    targetTrackingEnabled: false,
    requireSalesPersonOnCase: false,
    defaultCommissionRate: 5,
  },

  conversionSettings: {
    autoCreateCaseOnConsultation: false,
    requireBANTBeforeCase: false,
    autoCreateQuoteOnQualified: false,
    autoCreateSalesOrderOnAccept: false,
    linkSalesOrderToFinance: true,
    autoCreateClientOnSalesOrder: false,
    clientCreationTrigger: 'manual',
    copyNotesToCase: true,
    copyActivityHistory: true,
    copyDocuments: true,
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Partial update type for CRM Settings
 */
export type CRMSettingsUpdate = Partial<Omit<CRMSettings, '_id' | 'officeId' | 'createdAt' | 'updatedAt'>>

/**
 * CRM Settings section names
 */
export type CRMSettingsSection =
  | 'leadSettings'
  | 'caseSettings'
  | 'quoteSettings'
  | 'communicationSettings'
  | 'appointmentSettings'
  | 'namingSettings'
  | 'territorySettings'
  | 'salesPersonSettings'
  | 'conversionSettings'
