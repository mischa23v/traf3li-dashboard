/**
 * Advanced CRM Types
 * Type definitions for email marketing, lead scoring, WhatsApp integration
 */

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATE TYPES
// ═══════════════════════════════════════════════════════════════

export interface EmailTemplate {
  _id: string
  firmId: string
  name: string
  subject: string
  preheaderText?: string
  htmlContent: string
  textContent?: string
  category: string
  thumbnail?: string
  variables: string[] // e.g., {{firstName}}, {{companyName}}
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateEmailTemplateData {
  name: string
  subject: string
  preheaderText?: string
  htmlContent: string
  textContent?: string
  category?: string
  variables?: string[]
}

// ═══════════════════════════════════════════════════════════════
// EMAIL CAMPAIGN TYPES
// ═══════════════════════════════════════════════════════════════

export type CampaignType = 'regular' | 'drip' | 'transactional' | 'automated'
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type RecipientType = 'all' | 'segment' | 'list' | 'manual'

export interface CampaignRecipients {
  type: RecipientType
  segmentId?: string
  listId?: string
  subscriberIds?: string[]
  excludeUnsubscribed: boolean
  totalCount?: number
}

export interface CampaignSchedule {
  sendAt: Date
  timezone: string
}

export interface ABTestVariant {
  id: string
  name: string
  subject?: string
  templateId?: string
  weight: number
  sent?: number
  opened?: number
  clicked?: number
}

export interface ABTestConfig {
  enabled: boolean
  variants: ABTestVariant[]
  winnerCriteria: 'open_rate' | 'click_rate' | 'conversion'
  testDuration: number // in hours
  testPercentage: number // % of recipients for test
  winner?: string
  winnerSelectedAt?: Date
}

export interface CampaignAnalytics {
  sent: number
  delivered: number
  opened: number
  uniqueOpens: number
  clicked: number
  uniqueClicks: number
  bounced: number
  softBounced: number
  hardBounced: number
  unsubscribed: number
  complained: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
}

export interface EmailCampaign {
  _id: string
  firmId: string
  name: string
  type: CampaignType
  status: CampaignStatus
  templateId: string
  subject: string
  preheaderText?: string
  fromName: string
  fromEmail: string
  replyTo?: string
  recipients: CampaignRecipients
  schedule?: CampaignSchedule
  abTest?: ABTestConfig
  analytics: CampaignAnalytics
  sentAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCampaignData {
  name: string
  type: CampaignType
  templateId: string
  subject: string
  preheaderText?: string
  fromName: string
  fromEmail: string
  replyTo?: string
  recipients: CampaignRecipients
}

export interface CampaignFilters {
  status?: CampaignStatus
  type?: CampaignType
  startDate?: string
  endDate?: string
  search?: string
}

// ═══════════════════════════════════════════════════════════════
// DRIP CAMPAIGN TYPES
// ═══════════════════════════════════════════════════════════════

export type DripTriggerType = 'signup' | 'tag_added' | 'lead_created' | 'form_submitted' | 'custom'
export type DripStepType = 'email' | 'wait' | 'condition' | 'action' | 'split'
export type DripStatus = 'draft' | 'active' | 'paused' | 'completed'

export interface DripTrigger {
  type: DripTriggerType
  conditions?: Record<string, unknown>
}

export interface DripWaitDuration {
  value: number
  unit: 'minutes' | 'hours' | 'days' | 'weeks'
}

export interface DripCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: unknown
}

export interface DripAction {
  type: 'add_tag' | 'remove_tag' | 'update_field' | 'notify_user' | 'webhook'
  params: Record<string, unknown>
}

export interface DripStep {
  id: string
  order: number
  type: DripStepType
  name: string
  emailId?: string
  emailSubject?: string
  waitDuration?: DripWaitDuration
  condition?: DripCondition
  action?: DripAction
  trueNextStepId?: string
  falseNextStepId?: string
  analytics?: {
    sent: number
    opened: number
    clicked: number
  }
}

export interface DripCampaign {
  _id: string
  firmId: string
  name: string
  description?: string
  status: DripStatus
  trigger: DripTrigger
  steps: DripStep[]
  enrolledCount: number
  completedCount: number
  exitedCount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateDripCampaignData {
  name: string
  description?: string
  trigger: DripTrigger
  steps: Omit<DripStep, 'id' | 'analytics'>[]
}

// ═══════════════════════════════════════════════════════════════
// SUBSCRIBER/SEGMENT TYPES
// ═══════════════════════════════════════════════════════════════

export type SubscriberStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'complained'

export interface EmailSubscriber {
  _id: string
  firmId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  company?: string
  status: SubscriberStatus
  source: string
  tags: string[]
  customFields: Record<string, unknown>
  leadId?: string
  contactId?: string
  subscribedAt: Date
  unsubscribedAt?: Date
  lastEmailAt?: Date
  emailCount: number
  openCount: number
  clickCount: number
}

export interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than' | 'is_set' | 'is_not_set'
  value?: unknown
}

export interface EmailSegment {
  _id: string
  firmId: string
  name: string
  description?: string
  conditions: SegmentCondition[]
  matchAll: boolean
  subscriberCount: number
  isDynamic: boolean
  lastUpdated: Date
  createdAt: Date
}

export interface CreateSegmentData {
  name: string
  description?: string
  conditions: SegmentCondition[]
  matchAll: boolean
  isDynamic: boolean
}

// ═══════════════════════════════════════════════════════════════
// LEAD SCORING TYPES
// ═══════════════════════════════════════════════════════════════

export type LeadGrade = 'A' | 'B' | 'C' | 'D' | 'F'
export type ScoreTrend = 'increasing' | 'stable' | 'decreasing'

export interface ScoreDimension {
  score: number
  maxScore: number
  factors: ScoreFactor[]
}

export interface ScoreFactor {
  name: string
  points: number
  maxPoints: number
  description: string
  source: string
}

export interface LeadScore {
  _id: string
  firmId: string
  leadId: string
  leadName?: string
  totalScore: number
  grade: LeadGrade
  dimensions: {
    demographic: ScoreDimension
    bant: ScoreDimension
    behavioral: ScoreDimension
    engagement: ScoreDimension
  }
  trend: ScoreTrend
  lastActivity?: Date
  history: Array<{
    date: Date
    score: number
    reason: string
  }>
  createdAt: Date
  updatedAt: Date
}

export interface LeadScoreConfig {
  firmId: string
  thresholds: {
    A: number // e.g., 80+
    B: number // e.g., 60+
    C: number // e.g., 40+
    D: number // e.g., 20+
    // F is below D threshold
  }
  weights: {
    demographic: number
    bant: number
    behavioral: number
    engagement: number
  }
  decaySettings: {
    enabled: boolean
    daysUntilDecay: number
    decayPercentage: number
  }
  autoScoring: boolean
}

export interface LeadScoreDistribution {
  grade: LeadGrade
  count: number
  percentage: number
  averageScore: number
}

export interface TrackBehaviorData {
  leadId: string
  behaviorType: 'page_view' | 'form_submit' | 'email_open' | 'email_click' | 'download' | 'meeting' | 'call'
  metadata?: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP TYPES
// ═══════════════════════════════════════════════════════════════

export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'interactive'
export type WhatsAppMessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
export type ConversationStatus = 'active' | 'closed' | 'pending'
export type TemplateStatus = 'pending' | 'approved' | 'rejected'

export interface WhatsAppMessage {
  _id: string
  firmId: string
  conversationId: string
  direction: 'inbound' | 'outbound'
  messageType: WhatsAppMessageType
  content: string
  mediaUrl?: string
  mediaType?: string
  templateName?: string
  templateParams?: string[]
  status: WhatsAppMessageStatus
  sentAt: Date
  deliveredAt?: Date
  readAt?: Date
  failedReason?: string
}

export interface WhatsAppConversation {
  _id: string
  firmId: string
  phoneNumber: string
  contactName?: string
  contactId?: string
  leadId?: string
  status: ConversationStatus
  lastMessageAt: Date
  lastMessagePreview?: string
  unreadCount: number
  assignedTo?: string
  assignedToName?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface WhatsAppTemplate {
  _id: string
  firmId: string
  name: string
  language: string
  category: 'marketing' | 'utility' | 'authentication'
  headerType?: 'text' | 'image' | 'document' | 'video'
  headerContent?: string
  bodyText: string
  footerText?: string
  buttons?: Array<{
    type: 'quick_reply' | 'url' | 'call'
    text: string
    url?: string
    phone?: string
  }>
  variables: string[]
  status: TemplateStatus
  submittedAt?: Date
  approvedAt?: Date
  rejectedReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateTemplateData {
  name: string
  language: string
  category: 'marketing' | 'utility' | 'authentication'
  headerType?: 'text' | 'image' | 'document' | 'video'
  headerContent?: string
  bodyText: string
  footerText?: string
  buttons?: Array<{
    type: 'quick_reply' | 'url' | 'call'
    text: string
    url?: string
    phone?: string
  }>
}

export interface SendMessageData {
  phoneNumber: string
  messageType: WhatsAppMessageType
  content: string
  mediaUrl?: string
}

export interface SendTemplateMessageData {
  phoneNumber: string
  templateName: string
  language: string
  params: string[]
  headerMediaUrl?: string
}

export interface WhatsAppBroadcast {
  _id: string
  firmId: string
  name: string
  templateId: string
  recipients: string[]
  status: 'draft' | 'sending' | 'completed' | 'failed'
  stats: {
    total: number
    sent: number
    delivered: number
    read: number
    failed: number
  }
  scheduledAt?: Date
  startedAt?: Date
  completedAt?: Date
  createdBy: string
  createdAt: Date
}

export interface CreateBroadcastData {
  name: string
  templateId: string
  recipients: string[]
  scheduledAt?: Date
}

export interface ConversationFilters {
  status?: ConversationStatus
  assignedTo?: string
  hasUnread?: boolean
  search?: string
  leadId?: string
  contactId?: string
}
