/**
 * Odoo-style Activity Types
 * Based on Odoo's mail.activity model for scheduling and tracking activities
 */

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type OdooActivityCategory =
  | 'default'
  | 'upload_file'
  | 'phonecall'
  | 'meeting'
  | 'email'
  | 'reminder'
  | 'todo'

export type OdooActivityState = 'scheduled' | 'done' | 'cancelled'

export type OdooActivityDecorationColor = 'warning' | 'danger' | 'success' | 'info'

export type OdooActivityDelayUnit = 'days' | 'weeks' | 'months'

export type OdooActivityChainingType = 'suggest' | 'trigger'

export type OdooActivityResModel =
  | 'Case'
  | 'Client'
  | 'Lead'
  | 'Contact'
  | 'Organization'
  | 'Task'
  | 'Invoice'
  | 'Document'

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPE INTERFACE (Template for activities)
// ═══════════════════════════════════════════════════════════════

export interface OdooActivityType {
  _id: string
  name: string
  nameAr: string
  icon: string // FontAwesome or Lucide icon name
  decoration_type: OdooActivityDecorationColor
  category: OdooActivityCategory
  delay_count: number
  delay_unit: OdooActivityDelayUnit
  chaining_type: OdooActivityChainingType
  triggered_next_type_id?: string
  default_user_id?: string
  res_model_ids?: OdooActivityResModel[]
  summary?: string
  summaryAr?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateOdooActivityTypeData {
  name: string
  nameAr: string
  icon: string
  decoration_type?: OdooActivityDecorationColor
  category?: OdooActivityCategory
  delay_count?: number
  delay_unit?: OdooActivityDelayUnit
  chaining_type?: OdooActivityChainingType
  triggered_next_type_id?: string
  default_user_id?: string
  res_model_ids?: OdooActivityResModel[]
  summary?: string
  summaryAr?: string
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY INTERFACE (Scheduled/Tracked activity instance)
// ═══════════════════════════════════════════════════════════════

export interface OdooActivityUser {
  _id: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string
}

export interface OdooActivity {
  _id: string
  res_model: OdooActivityResModel
  res_id: string
  res_name?: string // Denormalized record name for display
  activity_type_id: OdooActivityType | string
  summary: string
  summaryAr?: string
  note?: string // Rich HTML content
  date_deadline: string // ISO date
  user_id: OdooActivityUser | string // Assigned user
  create_user_id: OdooActivityUser | string // Creator
  state: OdooActivityState
  done_date?: string
  done_by?: OdooActivityUser | string
  feedback?: string
  feedbackAr?: string
  is_overdue: boolean // Virtual field computed from date_deadline
  days_until_deadline?: number // Computed field
  createdAt: string
  updatedAt: string
}

export interface CreateOdooActivityData {
  res_model: OdooActivityResModel
  res_id: string
  res_name?: string
  activity_type_id: string
  summary: string
  summaryAr?: string
  note?: string
  date_deadline: string
  user_id?: string // If not provided, assign to current user
}

export interface UpdateOdooActivityData {
  summary?: string
  summaryAr?: string
  note?: string
  date_deadline?: string
  user_id?: string
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY FILTERS & RESPONSES
// ═══════════════════════════════════════════════════════════════

export interface OdooActivityFilters {
  res_model?: OdooActivityResModel
  res_id?: string
  activity_type_id?: string
  user_id?: string
  state?: OdooActivityState | OdooActivityState[]
  date_from?: string
  date_to?: string
  is_overdue?: boolean
  search?: string
  sortBy?: 'date_deadline' | 'createdAt' | 'state'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface OdooActivityStats {
  overdue_count: number
  today_count: number
  planned_count: number
  done_count: number // Last 7 days
  by_type: {
    _id: string
    name: string
    nameAr: string
    count: number
  }[]
  by_model: {
    _id: OdooActivityResModel
    count: number
  }[]
}

export interface OdooActivityResponse {
  activities: OdooActivity[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY ACTIONS
// ═══════════════════════════════════════════════════════════════

export interface MarkActivityDoneData {
  feedback?: string
  feedbackAr?: string
}

export interface RescheduleActivityData {
  date_deadline: string
  reason?: string
}

export interface ReassignActivityData {
  user_id: string
  reason?: string
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT ACTIVITY TYPES (for seeding)
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_ACTIVITY_TYPES: Omit<OdooActivityType, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Email',
    nameAr: 'بريد إلكتروني',
    icon: 'Mail',
    decoration_type: 'info',
    category: 'email',
    delay_count: 1,
    delay_unit: 'days',
    chaining_type: 'suggest',
    isActive: true,
  },
  {
    name: 'Call',
    nameAr: 'مكالمة',
    icon: 'Phone',
    decoration_type: 'warning',
    category: 'phonecall',
    delay_count: 1,
    delay_unit: 'days',
    chaining_type: 'suggest',
    isActive: true,
  },
  {
    name: 'Meeting',
    nameAr: 'اجتماع',
    icon: 'Users',
    decoration_type: 'success',
    category: 'meeting',
    delay_count: 3,
    delay_unit: 'days',
    chaining_type: 'suggest',
    isActive: true,
  },
  {
    name: 'To-Do',
    nameAr: 'مهمة',
    icon: 'CheckSquare',
    decoration_type: 'info',
    category: 'todo',
    delay_count: 1,
    delay_unit: 'days',
    chaining_type: 'suggest',
    isActive: true,
  },
  {
    name: 'Reminder',
    nameAr: 'تذكير',
    icon: 'Bell',
    decoration_type: 'warning',
    category: 'reminder',
    delay_count: 1,
    delay_unit: 'days',
    chaining_type: 'suggest',
    isActive: true,
  },
  {
    name: 'Upload Document',
    nameAr: 'رفع مستند',
    icon: 'Upload',
    decoration_type: 'info',
    category: 'upload_file',
    delay_count: 2,
    delay_unit: 'days',
    chaining_type: 'suggest',
    isActive: true,
  },
  {
    name: 'Follow-up',
    nameAr: 'متابعة',
    icon: 'RefreshCw',
    decoration_type: 'warning',
    category: 'default',
    delay_count: 7,
    delay_unit: 'days',
    chaining_type: 'suggest',
    isActive: true,
  },
  {
    name: 'Court Date',
    nameAr: 'موعد محكمة',
    icon: 'Gavel',
    decoration_type: 'danger',
    category: 'meeting',
    delay_count: 14,
    delay_unit: 'days',
    chaining_type: 'trigger',
    isActive: true,
  },
]
