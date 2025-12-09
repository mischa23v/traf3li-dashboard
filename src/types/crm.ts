/**
 * CRM Types
 * Types for Lead, Pipeline, Referral, and Activity management
 */

// ═══════════════════════════════════════════════════════════════
// LEAD TYPES
// ═══════════════════════════════════════════════════════════════
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'dormant'

export type LeadType = 'individual' | 'company'

export interface Lead {
  _id: string
  leadId: string
  lawyerId: string
  type: LeadType

  // Individual
  firstName?: string
  lastName?: string

  // Company
  companyName?: string
  companyNameAr?: string
  contactPerson?: string

  // Contact
  email?: string
  phone: string
  alternatePhone?: string
  whatsapp?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country: string
  }

  // Pipeline
  status: LeadStatus
  pipelineId?: string
  pipelineStageId?: string
  probability: number
  expectedCloseDate?: string

  // Source
  // Backend values: website | referral | ads | social | walkin | cold_call | event
  // Frontend also supports: social_media, advertising, walk_in, other (mapped to backend equivalents)
  source?: {
    type:
      | 'website'
      | 'referral'
      | 'ads'
      | 'social'
      | 'walkin'
      | 'cold_call'
      | 'event'
      // Frontend aliases (map to backend equivalents)
      | 'social_media'  // maps to 'social'
      | 'advertising'   // maps to 'ads'
      | 'walk_in'       // maps to 'walkin'
      | 'other'
    referralId?: string
    referralName?: string
    campaign?: string
  }

  // Intake
  intake?: {
    caseType?: string
    caseDescription?: string
    urgency?: 'low' | 'normal' | 'high' | 'urgent'
    estimatedValue?: number
    conflictCheckCompleted?: boolean
  }

  // Qualification
  qualification?: {
    budget?: 'unknown' | 'low' | 'medium' | 'high' | 'premium'
    authority?: 'unknown' | 'decision_maker' | 'influencer' | 'researcher'
    need?: 'unknown' | 'urgent' | 'planning' | 'exploring'
    timeline?:
      | 'unknown'
      | 'immediate'
      | 'this_month'
      | 'this_quarter'
      | 'this_year'
      | 'no_timeline'
    score?: number
  }

  // Value
  estimatedValue: number
  currency: string

  // Assignment
  assignedTo?: string

  // Organization/Contact Links (NEW)
  organizationId?: string | {
    _id: string
    legalName: string
    email?: string
  }
  contactId?: string | {
    _id: string
    firstName: string
    lastName?: string
    title?: string
  }

  // Activity
  lastContactedAt?: string
  lastActivityAt?: string
  nextFollowUpDate?: string
  nextFollowUpNote?: string
  activityCount: number

  // Conversion
  convertedToClient: boolean
  clientId?: string
  convertedAt?: string

  // Meta
  tags?: string[]
  notes?: string
  displayName: string
  daysSinceCreated: number
  daysSinceContact?: number
  createdAt: string
  updatedAt: string
}

export interface CreateLeadData {
  type: LeadType
  firstName?: string
  lastName?: string
  companyName?: string
  phone: string
  email?: string
  source?: Lead['source']
  intake?: Lead['intake']
  estimatedValue?: number
  pipelineId?: string
  assignedTo?: string
  organizationId?: string
  contactId?: string
  tags?: string[]
  notes?: string
}

export interface LeadFilters {
  status?: LeadStatus
  source?: string
  assignedTo?: string
  pipelineId?: string
  search?: string
  convertedToClient?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface LeadStats {
  stats: {
    byStatus: { _id: LeadStatus; count: number; totalValue: number }[]
    total: number
    converted: number
    conversionRate: string
  }
  needsFollowUp: Lead[]
  recentLeads: Lead[]
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE TYPES
// ═══════════════════════════════════════════════════════════════

// Pipeline Automation Types (NEW)
export type AutoActionTrigger = 'enter' | 'exit' | 'stay'
export type AutoActionType = 'send_email' | 'create_task' | 'notify_user' | 'update_field' | 'webhook'

export interface AutoActionConfig {
  // For send_email
  to?: 'lead_owner' | 'lead_email' | string
  subject?: string
  message?: string
  templateId?: string
  // For create_task
  title?: string
  assignedTo?: 'lead_owner' | string
  dueInDays?: number
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  // For notify_user
  userId?: 'lead_owner' | string
  // For update_field
  field?: string
  value?: string | string[]
  operation?: 'set' | 'append' | 'remove'
  // For webhook
  url?: string
  method?: 'GET' | 'POST'
}

export interface PipelineAutoAction {
  trigger: AutoActionTrigger
  action: AutoActionType
  config: AutoActionConfig
}

export interface PipelineStage {
  stageId: string
  name: string
  nameAr?: string
  color: string
  order: number
  probability: number
  isWonStage?: boolean
  isLostStage?: boolean
  autoActions?: PipelineAutoAction[]
}

export interface Pipeline {
  _id: string
  pipelineId: string
  lawyerId: string
  name: string
  nameAr?: string
  description?: string
  type: 'lead' | 'case' | 'deal' | 'custom'
  category?: string
  icon: string
  color: string
  stages: PipelineStage[]
  isDefault: boolean
  isActive: boolean
  stats?: {
    totalLeads: number
    activeLeads: number
    wonLeads: number
    lostLeads: number
    conversionRate: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreatePipelineData {
  name: string
  nameAr?: string
  description?: string
  type: 'lead' | 'case' | 'deal' | 'custom'
  category?: string
  icon?: string
  color?: string
  stages?: Omit<PipelineStage, 'stageId'>[]
}

export interface CreateStageData {
  name: string
  nameAr?: string
  color?: string
  probability?: number
  isWonStage?: boolean
  isLostStage?: boolean
}

export interface PipelineFilters {
  type?: string
  isActive?: boolean
}

export interface PipelineView {
  pipeline: Pipeline
  leadsByStage: Record<string, Lead[]>
}

export interface PipelineStats {
  totalLeads: number
  activeLeads: number
  wonLeads: number
  lostLeads: number
  conversionRate: number
  avgTimeToClose: number
  valueByStage: Record<string, number>
}

// ═══════════════════════════════════════════════════════════════
// REFERRAL TYPES
// ═══════════════════════════════════════════════════════════════
export type ReferralType =
  | 'client'
  | 'lawyer'
  | 'law_firm'
  | 'contact'
  | 'employee'
  | 'partner'
  | 'organization'
  | 'other'

export type ReferralStatus = 'active' | 'inactive' | 'archived'

export type FeeType = 'percentage' | 'fixed' | 'tiered' | 'none'

export interface ReferredLead {
  leadId: string
  status: 'pending' | 'converted' | 'lost'
  caseValue?: number
  feeAmount?: number
  convertedAt?: string
  clientId?: string
}

export interface FeePayment {
  amount: number
  date: string
  method?: string
  reference?: string
  notes?: string
}

export interface Referral {
  _id: string
  referralId: string
  lawyerId: string
  type: ReferralType
  name: string
  nameAr?: string
  status: ReferralStatus

  // External source info
  externalSource?: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }

  // Linked entities
  clientId?: string
  contactId?: string
  organizationId?: string
  staffId?: string

  // Fee agreement
  hasFeeAgreement: boolean
  feeType: FeeType
  feePercentage?: number
  feeFixedAmount?: number
  feeTiers?: {
    minValue: number
    maxValue?: number
    percentage: number
  }[]

  // Statistics (computed)
  totalReferrals: number
  successfulReferrals: number
  totalFeesOwed: number
  totalFeesPaid: number
  conversionRate: string
  outstandingFees: number

  // Referred leads
  referredLeads?: ReferredLead[]

  // Fee payments
  feePayments?: FeePayment[]

  // Meta
  tags?: string[]
  notes?: string
  rating?: number
  priority: 'low' | 'normal' | 'high' | 'vip'
  createdAt: string
  updatedAt: string
}

export interface CreateReferralData {
  type: ReferralType
  name: string
  nameAr?: string
  clientId?: string
  contactId?: string
  organizationId?: string
  staffId?: string
  externalSource?: Referral['externalSource']
  hasFeeAgreement?: boolean
  feeType?: FeeType
  feePercentage?: number
  feeFixedAmount?: number
  tags?: string[]
  notes?: string
  priority?: 'low' | 'normal' | 'high' | 'vip'
}

export interface ReferralFilters {
  type?: ReferralType
  status?: ReferralStatus
  hasFeeAgreement?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ReferralStats {
  stats: {
    totalReferrers: number
    activeReferrers: number
    totalReferrals: number
    successfulReferrals: number
    totalFeesOwed: number
    totalFeesPaid: number
    avgConversionRate: string
  }
  topReferrers: Referral[]
  recentReferrals: Referral[]
}

export interface FeePaymentData {
  amount: number
  date?: string
  method?: string
  reference?: string
  notes?: string
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPES
// ═══════════════════════════════════════════════════════════════
export type ActivityType =
  | 'call'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'meeting'
  | 'note'
  | 'task'
  | 'document'
  | 'proposal'
  | 'status_change'
  | 'stage_change'
  | 'lead_created'
  | 'lead_converted'

export type ActivityEntityType =
  | 'lead'
  | 'client'
  | 'contact'
  | 'case'
  | 'organization'

export type ActivityStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface CrmActivity {
  _id: string
  activityId: string
  lawyerId: string
  type: ActivityType
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  title: string
  titleAr?: string
  description?: string

  // Type-specific data
  callData?: {
    direction: 'inbound' | 'outbound'
    phoneNumber?: string
    duration?: number
    outcome?: string
  }
  emailData?: {
    subject?: string
    from?: string
    to?: string[]
    isIncoming?: boolean
  }
  meetingData?: {
    meetingType?: 'in_person' | 'video' | 'phone' | 'court' | 'consultation'
    location?: string
    scheduledStart?: string
    scheduledEnd?: string
    agenda?: string
    summary?: string
    nextSteps?: string
    outcome?: string
    attendees?: string[]
  }
  taskData?: {
    dueDate?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  }

  // Performer
  performedBy: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }

  // Status
  status: ActivityStatus
  scheduledAt?: string
  completedAt?: string
  outcomeNotes?: string

  // Meta
  tags?: string[]
  isPrivate?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateActivityData {
  type: ActivityType
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  title?: string
  description?: string
  callData?: CrmActivity['callData']
  emailData?: CrmActivity['emailData']
  meetingData?: CrmActivity['meetingData']
  taskData?: CrmActivity['taskData']
  scheduledAt?: string
  tags?: string[]
  isPrivate?: boolean
}

export interface ActivityFilters {
  entityType?: ActivityEntityType
  entityId?: string
  type?: ActivityType
  status?: ActivityStatus
  performedBy?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface ActivityStats {
  stats: {
    byType: { _id: ActivityType; count: number }[]
    total: number
    completed: number
    pending: number
  }
  recentActivities: CrmActivity[]
}

// Quick logger DTOs
export interface LogCallData {
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  direction: 'inbound' | 'outbound'
  phoneNumber?: string
  duration?: number
  outcome?: string
  notes?: string
}

export interface LogEmailData {
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  subject?: string
  from?: string
  to?: string[]
  isIncoming?: boolean
  notes?: string
}

export interface LogMeetingData {
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  meetingType?: 'in_person' | 'video' | 'phone' | 'court' | 'consultation'
  location?: string
  scheduledStart?: string
  scheduledEnd?: string
  agenda?: string
  summary?: string
  nextSteps?: string
  outcome?: string
  attendees?: string[]
}

export interface AddNoteData {
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  title?: string
  content: string
  isPrivate?: boolean
  tags?: string[]
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
