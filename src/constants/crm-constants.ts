/**
 * CRM Constants
 * Comprehensive constants for the Ultimate CRM system
 * Supports Arabic/English, Office Types, and all CRM configurations
 */

import {
  User,
  Users,
  Building,
  Building2,
  Phone,
  Mail,
  MessageSquare,
  Video,
  Calendar,
  FileText,
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Crown,
  Shield,
  Target,
  Zap,
  Globe,
  Megaphone,
  UserPlus,
  Briefcase,
  Scale,
  Gavel,
  type LucideIcon,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// OFFICE TYPES (نوع المكتب)
// ═══════════════════════════════════════════════════════════════

export type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

export interface OfficeTypeConfig {
  id: OfficeType
  labelAr: string
  labelEn: string
  descriptionAr: string
  descriptionEn: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  employeeRange: string
  features: string[]
}

export const OFFICE_TYPES: OfficeTypeConfig[] = [
  {
    id: 'solo',
    labelAr: 'محامي فردي',
    labelEn: 'Solo Lawyer',
    descriptionAr: 'محامي مستقل يعمل بشكل فردي',
    descriptionEn: 'Independent solo practitioner',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    employeeRange: '1',
    features: ['basic_crm', 'simple_pipeline', 'personal_calendar'],
  },
  {
    id: 'small',
    labelAr: 'مكتب صغير',
    labelEn: 'Small Office',
    descriptionAr: '٢-١٠ موظفين',
    descriptionEn: '2-10 employees',
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    employeeRange: '2-10',
    features: ['team_management', 'shared_calendar', 'basic_reports'],
  },
  {
    id: 'medium',
    labelAr: 'مكتب متوسط',
    labelEn: 'Medium Office',
    descriptionAr: '١١-٥٠ موظف',
    descriptionEn: '11-50 employees',
    icon: Building,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    employeeRange: '11-50',
    features: ['departments', 'advanced_pipeline', 'territory_management', 'quotas'],
  },
  {
    id: 'firm',
    labelAr: 'شركة محاماة',
    labelEn: 'Law Firm',
    descriptionAr: 'أكثر من ٥٠ موظف',
    descriptionEn: '50+ employees',
    icon: Building2,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    employeeRange: '50+',
    features: ['multi_branch', 'enterprise_reports', 'forecasting', 'ml_scoring', 'api_access'],
  },
]

export const getOfficeTypeConfig = (type: OfficeType): OfficeTypeConfig => {
  return OFFICE_TYPES.find((t) => t.id === type) || OFFICE_TYPES[0]
}

// ═══════════════════════════════════════════════════════════════
// LEAD STATUS
// ═══════════════════════════════════════════════════════════════

export type LeadStatusType =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'dormant'

export interface LeadStatusConfig {
  value: LeadStatusType
  labelAr: string
  labelEn: string
  color: string
  bgColor: string
  icon: LucideIcon
  isActive: boolean
  isClosed: boolean
}

export const LEAD_STATUSES: LeadStatusConfig[] = [
  {
    value: 'new',
    labelAr: 'جديد',
    labelEn: 'New',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Star,
    isActive: true,
    isClosed: false,
  },
  {
    value: 'contacted',
    labelAr: 'تم التواصل',
    labelEn: 'Contacted',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    icon: Phone,
    isActive: true,
    isClosed: false,
  },
  {
    value: 'qualified',
    labelAr: 'مؤهل',
    labelEn: 'Qualified',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckSquare,
    isActive: true,
    isClosed: false,
  },
  {
    value: 'proposal',
    labelAr: 'عرض سعر',
    labelEn: 'Proposal',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: FileText,
    isActive: true,
    isClosed: false,
  },
  {
    value: 'negotiation',
    labelAr: 'مفاوضة',
    labelEn: 'Negotiation',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: Scale,
    isActive: true,
    isClosed: false,
  },
  {
    value: 'won',
    labelAr: 'مكتسب',
    labelEn: 'Won',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: Crown,
    isActive: false,
    isClosed: true,
  },
  {
    value: 'lost',
    labelAr: 'خسارة',
    labelEn: 'Lost',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: AlertCircle,
    isActive: false,
    isClosed: true,
  },
  {
    value: 'dormant',
    labelAr: 'خامل',
    labelEn: 'Dormant',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: Clock,
    isActive: false,
    isClosed: false,
  },
]

// ═══════════════════════════════════════════════════════════════
// LEAD SOURCES
// ═══════════════════════════════════════════════════════════════

export type LeadSourceType =
  | 'website'
  | 'referral'
  | 'social_media'
  | 'advertising'
  | 'walk_in'
  | 'cold_call'
  | 'event'
  | 'email_campaign'
  | 'partner'
  | 'existing_client'
  | 'court'
  | 'other'

export interface LeadSourceConfig {
  value: LeadSourceType
  labelAr: string
  labelEn: string
  icon: LucideIcon
  color: string
}

export const LEAD_SOURCES: LeadSourceConfig[] = [
  { value: 'website', labelAr: 'الموقع الإلكتروني', labelEn: 'Website', icon: Globe, color: 'text-blue-600' },
  { value: 'referral', labelAr: 'إحالة', labelEn: 'Referral', icon: UserPlus, color: 'text-green-600' },
  { value: 'social_media', labelAr: 'وسائل التواصل', labelEn: 'Social Media', icon: MessageSquare, color: 'text-pink-600' },
  { value: 'advertising', labelAr: 'إعلانات', labelEn: 'Advertising', icon: Megaphone, color: 'text-orange-600' },
  { value: 'walk_in', labelAr: 'زيارة مباشرة', labelEn: 'Walk-in', icon: Building, color: 'text-purple-600' },
  { value: 'cold_call', labelAr: 'اتصال بارد', labelEn: 'Cold Call', icon: Phone, color: 'text-cyan-600' },
  { value: 'event', labelAr: 'فعالية', labelEn: 'Event', icon: Calendar, color: 'text-amber-600' },
  { value: 'email_campaign', labelAr: 'حملة بريدية', labelEn: 'Email Campaign', icon: Mail, color: 'text-indigo-600' },
  { value: 'partner', labelAr: 'شريك', labelEn: 'Partner', icon: Briefcase, color: 'text-teal-600' },
  { value: 'existing_client', labelAr: 'عميل حالي', labelEn: 'Existing Client', icon: Users, color: 'text-emerald-600' },
  { value: 'court', labelAr: 'المحكمة', labelEn: 'Court', icon: Gavel, color: 'text-slate-600' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other', icon: Star, color: 'text-gray-600' },
]

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPES
// ═══════════════════════════════════════════════════════════════

export type ActivityTypeValue =
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

export interface ActivityTypeConfig {
  value: ActivityTypeValue
  labelAr: string
  labelEn: string
  icon: LucideIcon
  color: string
  bgColor: string
  canSchedule: boolean
  canRecur: boolean
}

export const ACTIVITY_TYPES: ActivityTypeConfig[] = [
  {
    value: 'call',
    labelAr: 'مكالمة',
    labelEn: 'Call',
    icon: Phone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    canSchedule: true,
    canRecur: true,
  },
  {
    value: 'email',
    labelAr: 'بريد إلكتروني',
    labelEn: 'Email',
    icon: Mail,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    canSchedule: true,
    canRecur: true,
  },
  {
    value: 'sms',
    labelAr: 'رسالة نصية',
    labelEn: 'SMS',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    canSchedule: true,
    canRecur: false,
  },
  {
    value: 'whatsapp',
    labelAr: 'واتساب',
    labelEn: 'WhatsApp',
    icon: MessageSquare,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    canSchedule: true,
    canRecur: false,
  },
  {
    value: 'meeting',
    labelAr: 'اجتماع',
    labelEn: 'Meeting',
    icon: Video,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    canSchedule: true,
    canRecur: true,
  },
  {
    value: 'note',
    labelAr: 'ملاحظة',
    labelEn: 'Note',
    icon: FileText,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    canSchedule: false,
    canRecur: false,
  },
  {
    value: 'task',
    labelAr: 'مهمة',
    labelEn: 'Task',
    icon: CheckSquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    canSchedule: true,
    canRecur: true,
  },
  {
    value: 'document',
    labelAr: 'مستند',
    labelEn: 'Document',
    icon: FileText,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    canSchedule: false,
    canRecur: false,
  },
  {
    value: 'proposal',
    labelAr: 'عرض',
    labelEn: 'Proposal',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    canSchedule: false,
    canRecur: false,
  },
]

// ═══════════════════════════════════════════════════════════════
// PRIORITY LEVELS
// ═══════════════════════════════════════════════════════════════

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent' | 'vip'

export interface PriorityConfig {
  value: PriorityLevel
  labelAr: string
  labelEn: string
  color: string
  bgColor: string
  icon: LucideIcon
  order: number
}

export const PRIORITY_LEVELS: PriorityConfig[] = [
  { value: 'low', labelAr: 'منخفض', labelEn: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Minus, order: 1 },
  { value: 'normal', labelAr: 'عادي', labelEn: 'Normal', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Minus, order: 2 },
  { value: 'high', labelAr: 'مرتفع', labelEn: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: TrendingUp, order: 3 },
  { value: 'urgent', labelAr: 'عاجل', labelEn: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50', icon: Zap, order: 4 },
  { value: 'vip', labelAr: 'VIP', labelEn: 'VIP', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Crown, order: 5 },
]

// ═══════════════════════════════════════════════════════════════
// EMPLOYEE COUNT RANGES
// ═══════════════════════════════════════════════════════════════

export const EMPLOYEE_COUNT_RANGES = [
  { value: '1', labelAr: 'موظف واحد', labelEn: '1 employee' },
  { value: '2-10', labelAr: '٢-١٠ موظفين', labelEn: '2-10 employees' },
  { value: '11-50', labelAr: '١١-٥٠ موظف', labelEn: '11-50 employees' },
  { value: '51-200', labelAr: '٥١-٢٠٠ موظف', labelEn: '51-200 employees' },
  { value: '201-500', labelAr: '٢٠١-٥٠٠ موظف', labelEn: '201-500 employees' },
  { value: '500+', labelAr: 'أكثر من ٥٠٠', labelEn: '500+ employees' },
]

// ═══════════════════════════════════════════════════════════════
// ANNUAL REVENUE RANGES
// ═══════════════════════════════════════════════════════════════

export const ANNUAL_REVENUE_RANGES = [
  { value: 'under_100k', labelAr: 'أقل من ١٠٠ ألف', labelEn: 'Under 100K SAR' },
  { value: '100k_500k', labelAr: '١٠٠ - ٥٠٠ ألف', labelEn: '100K - 500K SAR' },
  { value: '500k_1m', labelAr: '٥٠٠ ألف - ١ مليون', labelEn: '500K - 1M SAR' },
  { value: '1m_5m', labelAr: '١ - ٥ مليون', labelEn: '1M - 5M SAR' },
  { value: '5m_10m', labelAr: '٥ - ١٠ مليون', labelEn: '5M - 10M SAR' },
  { value: '10m_50m', labelAr: '١٠ - ٥٠ مليون', labelEn: '10M - 50M SAR' },
  { value: 'over_50m', labelAr: 'أكثر من ٥٠ مليون', labelEn: 'Over 50M SAR' },
]

// ═══════════════════════════════════════════════════════════════
// INDUSTRY SECTORS
// ═══════════════════════════════════════════════════════════════

export const INDUSTRY_SECTORS = [
  { value: 'legal', labelAr: 'القانون', labelEn: 'Legal' },
  { value: 'real_estate', labelAr: 'العقارات', labelEn: 'Real Estate' },
  { value: 'construction', labelAr: 'البناء والتشييد', labelEn: 'Construction' },
  { value: 'healthcare', labelAr: 'الرعاية الصحية', labelEn: 'Healthcare' },
  { value: 'education', labelAr: 'التعليم', labelEn: 'Education' },
  { value: 'technology', labelAr: 'التقنية', labelEn: 'Technology' },
  { value: 'finance', labelAr: 'المالية والبنوك', labelEn: 'Finance & Banking' },
  { value: 'retail', labelAr: 'التجزئة', labelEn: 'Retail' },
  { value: 'manufacturing', labelAr: 'التصنيع', labelEn: 'Manufacturing' },
  { value: 'oil_gas', labelAr: 'النفط والغاز', labelEn: 'Oil & Gas' },
  { value: 'hospitality', labelAr: 'الضيافة', labelEn: 'Hospitality' },
  { value: 'transportation', labelAr: 'النقل', labelEn: 'Transportation' },
  { value: 'government', labelAr: 'الحكومة', labelEn: 'Government' },
  { value: 'non_profit', labelAr: 'غير ربحي', labelEn: 'Non-Profit' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
]

// ═══════════════════════════════════════════════════════════════
// COMMERCIAL STATUS (PROSPECT LEVELS)
// ═══════════════════════════════════════════════════════════════

export type CommercialStatus = 'cold' | 'warm' | 'hot' | 'customer' | 'inactive'

export const COMMERCIAL_STATUSES: { value: CommercialStatus; labelAr: string; labelEn: string; color: string }[] = [
  { value: 'cold', labelAr: 'بارد', labelEn: 'Cold', color: 'text-blue-600' },
  { value: 'warm', labelAr: 'دافئ', labelEn: 'Warm', color: 'text-amber-600' },
  { value: 'hot', labelAr: 'ساخن', labelEn: 'Hot', color: 'text-red-600' },
  { value: 'customer', labelAr: 'عميل', labelEn: 'Customer', color: 'text-green-600' },
  { value: 'inactive', labelAr: 'غير نشط', labelEn: 'Inactive', color: 'text-gray-600' },
]

// ═══════════════════════════════════════════════════════════════
// PROSPECT LEVELS (DOLIBARR STYLE)
// ═══════════════════════════════════════════════════════════════

export type ProspectLevel = 'PL_NONE' | 'PL_LOW' | 'PL_MEDIUM' | 'PL_HIGH' | 'PL_EXCELLENT'

export const PROSPECT_LEVELS: { value: ProspectLevel; labelAr: string; labelEn: string; score: number }[] = [
  { value: 'PL_NONE', labelAr: 'غير محدد', labelEn: 'Not Set', score: 0 },
  { value: 'PL_LOW', labelAr: 'منخفض', labelEn: 'Low', score: 25 },
  { value: 'PL_MEDIUM', labelAr: 'متوسط', labelEn: 'Medium', score: 50 },
  { value: 'PL_HIGH', labelAr: 'مرتفع', labelEn: 'High', score: 75 },
  { value: 'PL_EXCELLENT', labelAr: 'ممتاز', labelEn: 'Excellent', score: 100 },
]

// ═══════════════════════════════════════════════════════════════
// EMAIL/PHONE VALIDATION STATES
// ═══════════════════════════════════════════════════════════════

export type ValidationState = 'unknown' | 'valid' | 'invalid' | 'bounced'

export const VALIDATION_STATES: { value: ValidationState; labelAr: string; labelEn: string; color: string }[] = [
  { value: 'unknown', labelAr: 'غير معروف', labelEn: 'Unknown', color: 'text-gray-600' },
  { value: 'valid', labelAr: 'صالح', labelEn: 'Valid', color: 'text-green-600' },
  { value: 'invalid', labelAr: 'غير صالح', labelEn: 'Invalid', color: 'text-red-600' },
  { value: 'bounced', labelAr: 'مرتد', labelEn: 'Bounced', color: 'text-orange-600' },
]

// ═══════════════════════════════════════════════════════════════
// STALE LEAD THRESHOLDS
// ═══════════════════════════════════════════════════════════════

export const STALE_THRESHOLDS = {
  warning: 14, // Days before warning
  stale: 30, // Days before marked stale
  dormant: 60, // Days before marked dormant
}

// ═══════════════════════════════════════════════════════════════
// RECURRING ACTIVITY INTERVALS
// ═══════════════════════════════════════════════════════════════

export const RECURRENCE_INTERVALS = [
  { value: 'daily', labelAr: 'يومي', labelEn: 'Daily' },
  { value: 'weekly', labelAr: 'أسبوعي', labelEn: 'Weekly' },
  { value: 'biweekly', labelAr: 'كل أسبوعين', labelEn: 'Bi-weekly' },
  { value: 'monthly', labelAr: 'شهري', labelEn: 'Monthly' },
  { value: 'quarterly', labelAr: 'ربع سنوي', labelEn: 'Quarterly' },
  { value: 'yearly', labelAr: 'سنوي', labelEn: 'Yearly' },
]

// ═══════════════════════════════════════════════════════════════
// REMINDER TYPES
// ═══════════════════════════════════════════════════════════════

export const REMINDER_TYPES = [
  { value: 'email', labelAr: 'بريد إلكتروني', labelEn: 'Email' },
  { value: 'browser', labelAr: 'إشعار المتصفح', labelEn: 'Browser Notification' },
  { value: 'sms', labelAr: 'رسالة نصية', labelEn: 'SMS' },
  { value: 'whatsapp', labelAr: 'واتساب', labelEn: 'WhatsApp' },
]

// ═══════════════════════════════════════════════════════════════
// CONTACT ROLES
// ═══════════════════════════════════════════════════════════════

export const CONTACT_ROLES = [
  { value: 'decision_maker', labelAr: 'صانع القرار', labelEn: 'Decision Maker' },
  { value: 'influencer', labelAr: 'مؤثر', labelEn: 'Influencer' },
  { value: 'technical', labelAr: 'تقني', labelEn: 'Technical' },
  { value: 'billing', labelAr: 'الفواتير', labelEn: 'Billing' },
  { value: 'legal', labelAr: 'قانوني', labelEn: 'Legal' },
  { value: 'executive', labelAr: 'تنفيذي', labelEn: 'Executive' },
  { value: 'primary', labelAr: 'أساسي', labelEn: 'Primary' },
  { value: 'secondary', labelAr: 'ثانوي', labelEn: 'Secondary' },
]

// ═══════════════════════════════════════════════════════════════
// QUICK PERIOD FILTERS
// ═══════════════════════════════════════════════════════════════

export const QUICK_PERIODS = [
  { value: 'today', labelAr: 'اليوم', labelEn: 'Today' },
  { value: 'yesterday', labelAr: 'أمس', labelEn: 'Yesterday' },
  { value: 'this-week', labelAr: 'هذا الأسبوع', labelEn: 'This Week' },
  { value: 'last-week', labelAr: 'الأسبوع الماضي', labelEn: 'Last Week' },
  { value: 'this-month', labelAr: 'هذا الشهر', labelEn: 'This Month' },
  { value: 'last-month', labelAr: 'الشهر الماضي', labelEn: 'Last Month' },
  { value: 'this-quarter', labelAr: 'هذا الربع', labelEn: 'This Quarter' },
  { value: 'last-quarter', labelAr: 'الربع الماضي', labelEn: 'Last Quarter' },
  { value: 'this-year', labelAr: 'هذه السنة', labelEn: 'This Year' },
  { value: 'last-year', labelAr: 'السنة الماضية', labelEn: 'Last Year' },
  { value: 'all', labelAr: 'جميع الفترات', labelEn: 'All Time' },
]

// ═══════════════════════════════════════════════════════════════
// CRM REPORT TYPES
// ═══════════════════════════════════════════════════════════════

export const CRM_REPORT_TYPES = [
  { value: 'lead_activity', labelAr: 'أنشطة العملاء المحتملين', labelEn: 'Lead Activity' },
  { value: 'pipeline_velocity', labelAr: 'سرعة المسار', labelEn: 'Pipeline Velocity' },
  { value: 'revenue_forecast', labelAr: 'توقعات الإيرادات', labelEn: 'Revenue Forecast' },
  { value: 'duplicate_leads', labelAr: 'العملاء المكررين', labelEn: 'Duplicate Leads' },
  { value: 'stale_leads', labelAr: 'العملاء الخاملين', labelEn: 'Stale Leads' },
  { value: 'quota_tracking', labelAr: 'تتبع الحصص', labelEn: 'Quota Tracking' },
  { value: 'lead_aging', labelAr: 'عمر العملاء', labelEn: 'Lead Aging' },
  { value: 'source_roi', labelAr: 'عائد المصادر', labelEn: 'Source ROI' },
  { value: 'conversion_funnel', labelAr: 'قمع التحويل', labelEn: 'Conversion Funnel' },
  { value: 'team_performance', labelAr: 'أداء الفريق', labelEn: 'Team Performance' },
  { value: 'first_response', labelAr: 'وقت الاستجابة الأول', labelEn: 'First Response Time' },
  { value: 'win_loss', labelAr: 'تحليل الربح/الخسارة', labelEn: 'Win/Loss Analysis' },
]

// ═══════════════════════════════════════════════════════════════
// SCORE GRADES (FOR LEAD SCORING)
// ═══════════════════════════════════════════════════════════════

export const SCORE_GRADES = [
  { grade: 'A', minScore: 80, color: 'text-green-600', bgColor: 'bg-green-100', labelAr: 'ممتاز', labelEn: 'Excellent' },
  { grade: 'B', minScore: 60, color: 'text-blue-600', bgColor: 'bg-blue-100', labelAr: 'جيد جداً', labelEn: 'Very Good' },
  { grade: 'C', minScore: 40, color: 'text-amber-600', bgColor: 'bg-amber-100', labelAr: 'جيد', labelEn: 'Good' },
  { grade: 'D', minScore: 20, color: 'text-orange-600', bgColor: 'bg-orange-100', labelAr: 'مقبول', labelEn: 'Fair' },
  { grade: 'F', minScore: 0, color: 'text-red-600', bgColor: 'bg-red-100', labelAr: 'ضعيف', labelEn: 'Poor' },
]

export const getScoreGrade = (score: number) => {
  return SCORE_GRADES.find((g) => score >= g.minScore) || SCORE_GRADES[SCORE_GRADES.length - 1]
}
