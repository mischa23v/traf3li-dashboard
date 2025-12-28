/**
 * Comprehensive CRM Settings Types
 *
 * Complete CRM configuration settings with 10 comprehensive sections
 * Supports bilingual configuration (Arabic/English)
 *
 * @module types/crmSettingsComprehensive
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. GENERAL SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface GeneralCrmSettings {
  defaultCurrency: string
  defaultLanguage: 'en' | 'ar' | 'both'
  timezone: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  fiscalYearStart: number
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. LEAD SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface LeadSource {
  id: string
  name: string
  nameAr: string
  enabled: boolean
  order: number
}

export interface LeadScoringRule {
  id: string
  name: string
  nameAr: string
  field: string
  condition: string
  value: string
  points: number
  enabled: boolean
}

export interface LeadCrmSettings {
  autoAssignEnabled: boolean
  assignmentMethod: 'round_robin' | 'load_balanced' | 'territory' | 'manual'
  leadScoringEnabled: boolean
  scoringRules: LeadScoringRule[]
  sources: LeadSource[]
  duplicateDetectionEnabled: boolean
  duplicateDetectionFields: ('email' | 'phone' | 'company' | 'name')[]
  defaultOwnerId?: string
  staleLeadThresholdDays: number
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. PIPELINE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface PipelineStage {
  id: string
  name: string
  nameAr: string
  probability: number
  order: number
  requiredFields: string[]
  enabled: boolean
}

export interface WinLossReason {
  id: string
  type: 'win' | 'loss'
  reason: string
  reasonAr: string
  enabled: boolean
  order: number
}

export interface PipelineCrmSettings {
  stages: PipelineStage[]
  enforceStageRequirements: boolean
  winLossReasons: WinLossReason[]
  requireWinLossReason: boolean
  defaultPipelineId: string
  enableWeightedValue: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. QUOTE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface QuoteCrmSettings {
  autoNumbering: boolean
  numberPrefix: string
  numberFormat: string
  defaultValidityDays: number
  defaultPaymentTerms: string
  requireApproval: boolean
  approvalThreshold: number
  approvers: string[]
  enableESignature: boolean
  sendExpiryReminder: boolean
  reminderDaysBefore: number
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. ACTIVITY SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface ActivityType {
  id: string
  name: string
  nameAr: string
  icon: string
  color: string
  defaultDuration: number
  enabled: boolean
  order: number
}

export interface ActivityCrmSettings {
  types: ActivityType[]
  defaultReminderMinutes: number
  calendarSyncEnabled: boolean
  calendarProvider: 'google' | 'outlook' | 'apple' | 'none'
  workingHoursStart: string
  workingHoursEnd: string
  workingDays: number[]
  autoCreateFollowUp: boolean
  defaultFollowUpDays: number
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. CAMPAIGN SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface CampaignType {
  id: string
  name: string
  nameAr: string
  enabled: boolean
  order: number
}

export interface CampaignCrmSettings {
  types: CampaignType[]
  defaultBudget: number
  defaultDurationDays: number
  roiCalculation: 'revenue' | 'profit' | 'custom'
  minRoiThreshold: number
  enableAttribution: boolean
  attributionModel: 'first_touch' | 'last_touch' | 'multi_touch' | 'time_decay'
  trackMembers: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. REFERRAL SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface ReferralProgram {
  id: string
  name: string
  nameAr: string
  enabled: boolean
  commissionType: 'percentage' | 'fixed'
  commissionValue: number
  rewardType: 'cash' | 'credit' | 'discount' | 'custom'
  order: number
}

export interface ReferralCrmSettings {
  enabled: boolean
  programs: ReferralProgram[]
  defaultCommissionRate: number
  defaultRewardType: 'cash' | 'credit' | 'discount' | 'custom'
  minDealValue: number
  payoutMethod: 'automatic' | 'manual'
  payoutFrequency: 'immediate' | 'monthly' | 'quarterly'
  requireApproval: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. EMAIL SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface EmailTemplate {
  id: string
  name: string
  nameAr: string
  subject: string
  subjectAr: string
  body: string
  bodyAr: string
  type: 'lead' | 'opportunity' | 'quote' | 'general'
  enabled: boolean
}

export interface EmailCrmSettings {
  templates: EmailTemplate[]
  signature: string
  signatureAr: string
  trackingEnabled: boolean
  trackOpens: boolean
  trackClicks: boolean
  autoResponseEnabled: boolean
  autoResponseTemplateId?: string
  bccAddress?: string
  defaultSenderName: string
  defaultSenderEmail: string
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. NOTIFICATION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface NotificationPreference {
  event: string
  email: boolean
  inApp: boolean
  sms: boolean
}

export interface NotificationCrmSettings {
  emailEnabled: boolean
  inAppEnabled: boolean
  smsEnabled: boolean
  preferences: NotificationPreference[]
  emailFrequency: 'instant' | 'daily' | 'weekly'
  quietHoursStart?: string
  quietHoursEnd?: string
  desktopEnabled: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. INTEGRATION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface WhatsAppIntegration {
  enabled: boolean
  phoneNumber: string
  apiKey?: string
  webhookUrl?: string
}

export interface CalendarIntegration {
  enabled: boolean
  provider: 'google' | 'outlook' | 'apple' | 'none'
  syncDirection: 'one_way' | 'two_way'
  calendarId?: string
}

export interface EmailProviderIntegration {
  enabled: boolean
  provider: 'gmail' | 'outlook' | 'smtp' | 'none'
  smtpHost?: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
  useSsl: boolean
}

export interface IntegrationCrmSettings {
  whatsapp: WhatsAppIntegration
  calendar: CalendarIntegration
  emailProvider: EmailProviderIntegration
  webhooksEnabled: boolean
  webhookEndpoints: string[]
  apiAccessEnabled: boolean
  apiRateLimit: number
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CRM SETTINGS INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface ComprehensiveCrmSettings {
  general: GeneralCrmSettings
  leads: LeadCrmSettings
  pipeline: PipelineCrmSettings
  quotes: QuoteCrmSettings
  activities: ActivityCrmSettings
  campaigns: CampaignCrmSettings
  referrals: ReferralCrmSettings
  email: EmailCrmSettings
  notifications: NotificationCrmSettings
  integrations: IntegrationCrmSettings
}

// ═══════════════════════════════════════════════════════════════════════════
// UI FIELD TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CrmSettingsFieldOption {
  value: string
  label: string
  labelAr: string
}

export interface CrmSettingsField {
  key: string
  label: string
  labelAr: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'currency' | 'percent' | 'time'
  options?: CrmSettingsFieldOption[]
  placeholder?: string
  placeholderAr?: string
  helpText?: string
  helpTextAr?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_COMPREHENSIVE_CRM_SETTINGS: ComprehensiveCrmSettings = {
  general: {
    defaultCurrency: 'SAR',
    defaultLanguage: 'both',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    fiscalYearStart: 1,
  },
  leads: {
    autoAssignEnabled: false,
    assignmentMethod: 'round_robin',
    leadScoringEnabled: false,
    scoringRules: [],
    sources: [
      { id: '1', name: 'Website', nameAr: 'الموقع الإلكتروني', enabled: true, order: 1 },
      { id: '2', name: 'Referral', nameAr: 'إحالة', enabled: true, order: 2 },
      { id: '3', name: 'Social Media', nameAr: 'وسائل التواصل', enabled: true, order: 3 },
      { id: '4', name: 'Email Campaign', nameAr: 'حملة بريد إلكتروني', enabled: true, order: 4 },
      { id: '5', name: 'Phone Call', nameAr: 'مكالمة هاتفية', enabled: true, order: 5 },
    ],
    duplicateDetectionEnabled: true,
    duplicateDetectionFields: ['email', 'phone'],
    staleLeadThresholdDays: 30,
  },
  pipeline: {
    stages: [
      { id: '1', name: 'Qualification', nameAr: 'التأهيل', probability: 10, order: 1, requiredFields: [], enabled: true },
      { id: '2', name: 'Needs Analysis', nameAr: 'تحليل الاحتياجات', probability: 25, order: 2, requiredFields: [], enabled: true },
      { id: '3', name: 'Proposal', nameAr: 'العرض', probability: 50, order: 3, requiredFields: [], enabled: true },
      { id: '4', name: 'Negotiation', nameAr: 'التفاوض', probability: 75, order: 4, requiredFields: [], enabled: true },
      { id: '5', name: 'Closed Won', nameAr: 'مغلقة - فوز', probability: 100, order: 5, requiredFields: [], enabled: true },
      { id: '6', name: 'Closed Lost', nameAr: 'مغلقة - خسارة', probability: 0, order: 6, requiredFields: [], enabled: true },
    ],
    enforceStageRequirements: false,
    winLossReasons: [
      { id: '1', type: 'win', reason: 'Best Price', reasonAr: 'أفضل سعر', enabled: true, order: 1 },
      { id: '2', type: 'win', reason: 'Best Solution', reasonAr: 'أفضل حل', enabled: true, order: 2 },
      { id: '3', type: 'loss', reason: 'Price Too High', reasonAr: 'السعر مرتفع جداً', enabled: true, order: 3 },
      { id: '4', type: 'loss', reason: 'Chose Competitor', reasonAr: 'اختار منافس', enabled: true, order: 4 },
      { id: '5', type: 'loss', reason: 'No Budget', reasonAr: 'لا توجد ميزانية', enabled: true, order: 5 },
    ],
    requireWinLossReason: true,
    defaultPipelineId: '',
    enableWeightedValue: true,
  },
  quotes: {
    autoNumbering: true,
    numberPrefix: 'QT-',
    numberFormat: 'YYYY-####',
    defaultValidityDays: 30,
    defaultPaymentTerms: 'Net 30',
    requireApproval: false,
    approvalThreshold: 100000,
    approvers: [],
    enableESignature: false,
    sendExpiryReminder: true,
    reminderDaysBefore: 7,
  },
  activities: {
    types: [
      { id: '1', name: 'Call', nameAr: 'مكالمة', icon: 'Phone', color: '#3b82f6', defaultDuration: 30, enabled: true, order: 1 },
      { id: '2', name: 'Meeting', nameAr: 'اجتماع', icon: 'Users', color: '#8b5cf6', defaultDuration: 60, enabled: true, order: 2 },
      { id: '3', name: 'Email', nameAr: 'بريد إلكتروني', icon: 'Mail', color: '#06b6d4', defaultDuration: 15, enabled: true, order: 3 },
      { id: '4', name: 'Task', nameAr: 'مهمة', icon: 'CheckSquare', color: '#10b981', defaultDuration: 30, enabled: true, order: 4 },
      { id: '5', name: 'Follow-up', nameAr: 'متابعة', icon: 'Clock', color: '#f59e0b', defaultDuration: 15, enabled: true, order: 5 },
    ],
    defaultReminderMinutes: 15,
    calendarSyncEnabled: false,
    calendarProvider: 'none',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    workingDays: [1, 2, 3, 4, 5],
    autoCreateFollowUp: false,
    defaultFollowUpDays: 7,
  },
  campaigns: {
    types: [
      { id: '1', name: 'Email Marketing', nameAr: 'التسويق عبر البريد الإلكتروني', enabled: true, order: 1 },
      { id: '2', name: 'Social Media', nameAr: 'وسائل التواصل الاجتماعي', enabled: true, order: 2 },
      { id: '3', name: 'Events', nameAr: 'الفعاليات', enabled: true, order: 3 },
      { id: '4', name: 'Webinar', nameAr: 'ندوة عبر الإنترنت', enabled: true, order: 4 },
      { id: '5', name: 'Content Marketing', nameAr: 'تسويق المحتوى', enabled: true, order: 5 },
    ],
    defaultBudget: 10000,
    defaultDurationDays: 90,
    roiCalculation: 'revenue',
    minRoiThreshold: 100,
    enableAttribution: true,
    attributionModel: 'last_touch',
    trackMembers: true,
  },
  referrals: {
    enabled: true,
    programs: [
      { id: '1', name: 'Standard Referral', nameAr: 'إحالة قياسية', enabled: true, commissionType: 'percentage', commissionValue: 10, rewardType: 'cash', order: 1 },
      { id: '2', name: 'VIP Referral', nameAr: 'إحالة VIP', enabled: true, commissionType: 'percentage', commissionValue: 15, rewardType: 'cash', order: 2 },
    ],
    defaultCommissionRate: 10,
    defaultRewardType: 'cash',
    minDealValue: 5000,
    payoutMethod: 'manual',
    payoutFrequency: 'monthly',
    requireApproval: true,
  },
  email: {
    templates: [
      { id: '1', name: 'Welcome Email', nameAr: 'بريد الترحيب', subject: 'Welcome!', subjectAr: 'مرحباً!', body: '', bodyAr: '', type: 'lead', enabled: true },
      { id: '2', name: 'Quote Follow-up', nameAr: 'متابعة العرض', subject: 'Quote Follow-up', subjectAr: 'متابعة العرض', body: '', bodyAr: '', type: 'quote', enabled: true },
    ],
    signature: 'Best regards,\nYour Name\nCompany Name',
    signatureAr: 'مع أطيب التحيات،\nاسمك\nاسم الشركة',
    trackingEnabled: true,
    trackOpens: true,
    trackClicks: true,
    autoResponseEnabled: false,
    defaultSenderName: 'CRM Team',
    defaultSenderEmail: 'crm@company.com',
  },
  notifications: {
    emailEnabled: true,
    inAppEnabled: true,
    smsEnabled: false,
    preferences: [
      { event: 'lead_assigned', email: true, inApp: true, sms: false },
      { event: 'lead_status_changed', email: true, inApp: true, sms: false },
      { event: 'opportunity_won', email: true, inApp: true, sms: false },
      { event: 'opportunity_lost', email: false, inApp: true, sms: false },
      { event: 'quote_sent', email: true, inApp: true, sms: false },
      { event: 'quote_accepted', email: true, inApp: true, sms: true },
      { event: 'task_due', email: true, inApp: true, sms: false },
      { event: 'activity_reminder', email: true, inApp: true, sms: false },
    ],
    emailFrequency: 'instant',
    desktopEnabled: true,
  },
  integrations: {
    whatsapp: {
      enabled: false,
      phoneNumber: '',
    },
    calendar: {
      enabled: false,
      provider: 'none',
      syncDirection: 'two_way',
    },
    emailProvider: {
      enabled: false,
      provider: 'none',
      useSsl: true,
    },
    webhooksEnabled: false,
    webhookEndpoints: [],
    apiAccessEnabled: true,
    apiRateLimit: 1000,
  },
}
