/**
 * Automated Action Types
 * Based on Odoo's base.automation model for workflow automation
 */

// ═══════════════════════════════════════════════════════════════
// TRIGGER TYPES
// ═══════════════════════════════════════════════════════════════

export type AutomatedActionTrigger =
  | 'on_create' // When record is created
  | 'on_write' // When record is updated
  | 'on_unlink' // When record is deleted
  | 'on_time' // Time-based trigger
  | 'on_stage_change' // When pipeline stage changes

export type AutomatedActionType =
  | 'update_record' // Update field values
  | 'create_activity' // Schedule an activity
  | 'send_email' // Send email notification
  | 'send_notification' // Send in-app notification
  | 'webhook' // Call external webhook

export type TriggerDateRangeType = 'minutes' | 'hours' | 'days' | 'weeks' | 'months'

// ═══════════════════════════════════════════════════════════════
// MODEL FIELD TYPES (for domain builder)
// ═══════════════════════════════════════════════════════════════

export type ModelFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'selection'
  | 'many2one'
  | 'many2many'

export interface ModelField {
  name: string
  nameAr: string
  field: string // Database field name
  type: ModelFieldType
  required?: boolean
  readonly?: boolean
  options?: { value: string; label: string; labelAr: string }[]
  relation?: string // For many2one/many2many
}

export interface AvailableModel {
  name: string
  nameAr: string
  model: string // e.g., 'Case', 'Lead'
  fields: ModelField[]
  hasStages?: boolean
  stageField?: string
}

// ═══════════════════════════════════════════════════════════════
// FILTER DOMAIN (MongoDB-style query)
// ═══════════════════════════════════════════════════════════════

export type DomainOperator =
  | '$eq' // Equal
  | '$ne' // Not equal
  | '$gt' // Greater than
  | '$gte' // Greater than or equal
  | '$lt' // Less than
  | '$lte' // Less than or equal
  | '$in' // In array
  | '$nin' // Not in array
  | '$regex' // Contains/matches regex
  | '$exists' // Field exists

export interface DomainCondition {
  field: string
  operator: DomainOperator
  value: unknown
}

export type FilterDomain = Record<string, unknown>

// ═══════════════════════════════════════════════════════════════
// ACTION CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════

export interface UpdateRecordConfig {
  updates: {
    field: string
    value: unknown
    operation?: 'set' | 'append' | 'remove' | 'increment'
  }[]
}

export interface CreateActivityConfig {
  activity_type_id: string
  summary: string
  summaryAr?: string
  note?: string
  delay_count?: number
  delay_unit?: TriggerDateRangeType
  user_id?: string | 'record_owner' | 'trigger_user'
}

export interface SendEmailConfig {
  template_id?: string
  to: 'record_owner' | 'record_email' | string // user ID or email
  subject: string
  subjectAr?: string
  body: string
  bodyAr?: string
  cc?: string[]
  bcc?: string[]
}

export interface SendNotificationConfig {
  user_id: 'record_owner' | 'trigger_user' | string
  title: string
  titleAr?: string
  message: string
  messageAr?: string
  type?: 'info' | 'warning' | 'success' | 'error'
  link?: string
}

export interface WebhookConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  include_record_data?: boolean
  custom_payload?: Record<string, unknown>
}

export type ActionConfig =
  | UpdateRecordConfig
  | CreateActivityConfig
  | SendEmailConfig
  | SendNotificationConfig
  | WebhookConfig

// ═══════════════════════════════════════════════════════════════
// AUTOMATED ACTION INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface AutomatedActionUser {
  _id: string
  firstName: string
  lastName: string
}

export interface AutomatedAction {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  model_name: string // e.g., 'Case', 'Lead'
  trigger: AutomatedActionTrigger
  trigger_field_ids?: string[] // Fields to watch for on_write
  filter_pre_domain?: FilterDomain // Condition before change
  filter_domain?: FilterDomain // Condition after change
  // Time-based trigger config
  trg_date_id?: string // Date field to base timing on
  trg_date_range?: number
  trg_date_range_type?: TriggerDateRangeType
  // Action config
  action_type: AutomatedActionType
  action_config: ActionConfig
  // For legacy compatibility with simple actions
  update_values?: Record<string, unknown>
  activity_type_id?: string
  activity_summary?: string
  email_template_id?: string
  webhook_url?: string
  // Status
  isActive: boolean
  priority?: number // Execution order
  last_run?: string
  run_count: number
  error_count: number
  last_error?: string
  created_by: AutomatedActionUser | string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// CREATE/UPDATE DATA
// ═══════════════════════════════════════════════════════════════

export interface CreateAutomatedActionData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  model_name: string
  trigger: AutomatedActionTrigger
  trigger_field_ids?: string[]
  filter_pre_domain?: FilterDomain
  filter_domain?: FilterDomain
  trg_date_id?: string
  trg_date_range?: number
  trg_date_range_type?: TriggerDateRangeType
  action_type: AutomatedActionType
  action_config: ActionConfig
  isActive?: boolean
  priority?: number
}

export interface UpdateAutomatedActionData extends Partial<CreateAutomatedActionData> {}

// ═══════════════════════════════════════════════════════════════
// FILTERS & RESPONSES
// ═══════════════════════════════════════════════════════════════

export interface AutomatedActionFilters {
  model_name?: string
  trigger?: AutomatedActionTrigger
  action_type?: AutomatedActionType
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface AutomatedActionResponse {
  actions: AutomatedAction[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ═══════════════════════════════════════════════════════════════
// EXECUTION LOG
// ═══════════════════════════════════════════════════════════════

export interface AutomatedActionLog {
  _id: string
  action_id: string
  action_name: string
  model_name: string
  record_id: string
  record_name?: string
  trigger: AutomatedActionTrigger
  action_type: AutomatedActionType
  status: 'success' | 'failed' | 'skipped'
  error_message?: string
  execution_time_ms: number
  executed_at: string
  triggered_by?: AutomatedActionUser | string
}

export interface AutomatedActionLogFilters {
  action_id?: string
  model_name?: string
  record_id?: string
  status?: 'success' | 'failed' | 'skipped'
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// TEST ACTION
// ═══════════════════════════════════════════════════════════════

export interface TestActionData {
  record_id: string
  dry_run?: boolean
}

export interface TestActionResult {
  would_execute: boolean
  reason?: string
  matched_conditions: boolean
  preview?: {
    action_type: AutomatedActionType
    description: string
    descriptionAr: string
  }
}

// ═══════════════════════════════════════════════════════════════
// AVAILABLE MODELS FOR AUTOMATION
// ═══════════════════════════════════════════════════════════════

export const AUTOMATABLE_MODELS: AvailableModel[] = [
  {
    name: 'Case',
    nameAr: 'القضية',
    model: 'Case',
    hasStages: true,
    stageField: 'status',
    fields: [
      { name: 'Status', nameAr: 'الحالة', field: 'status', type: 'selection' },
      { name: 'Priority', nameAr: 'الأولوية', field: 'priority', type: 'selection' },
      { name: 'Assigned To', nameAr: 'مسند إلى', field: 'assignedTo', type: 'many2one' },
      { name: 'Due Date', nameAr: 'تاريخ الاستحقاق', field: 'dueDate', type: 'date' },
      { name: 'Created', nameAr: 'تاريخ الإنشاء', field: 'createdAt', type: 'datetime' },
    ],
  },
  {
    name: 'Lead',
    nameAr: 'العميل المحتمل',
    model: 'Lead',
    hasStages: true,
    stageField: 'pipelineStageId',
    fields: [
      { name: 'Status', nameAr: 'الحالة', field: 'status', type: 'selection' },
      { name: 'Pipeline Stage', nameAr: 'مرحلة القمع', field: 'pipelineStageId', type: 'many2one' },
      { name: 'Assigned To', nameAr: 'مسند إلى', field: 'assignedTo', type: 'many2one' },
      { name: 'Estimated Value', nameAr: 'القيمة المتوقعة', field: 'estimatedValue', type: 'number' },
      { name: 'Created', nameAr: 'تاريخ الإنشاء', field: 'createdAt', type: 'datetime' },
    ],
  },
  {
    name: 'Client',
    nameAr: 'العميل',
    model: 'Client',
    hasStages: false,
    fields: [
      { name: 'Status', nameAr: 'الحالة', field: 'status', type: 'selection' },
      { name: 'Type', nameAr: 'النوع', field: 'type', type: 'selection' },
      { name: 'Created', nameAr: 'تاريخ الإنشاء', field: 'createdAt', type: 'datetime' },
    ],
  },
  {
    name: 'Task',
    nameAr: 'المهمة',
    model: 'Task',
    hasStages: true,
    stageField: 'status',
    fields: [
      { name: 'Status', nameAr: 'الحالة', field: 'status', type: 'selection' },
      { name: 'Priority', nameAr: 'الأولوية', field: 'priority', type: 'selection' },
      { name: 'Assigned To', nameAr: 'مسند إلى', field: 'assignedTo', type: 'many2one' },
      { name: 'Due Date', nameAr: 'تاريخ الاستحقاق', field: 'dueDate', type: 'date' },
      { name: 'Created', nameAr: 'تاريخ الإنشاء', field: 'createdAt', type: 'datetime' },
    ],
  },
  {
    name: 'Invoice',
    nameAr: 'الفاتورة',
    model: 'Invoice',
    hasStages: true,
    stageField: 'status',
    fields: [
      { name: 'Status', nameAr: 'الحالة', field: 'status', type: 'selection' },
      { name: 'Amount', nameAr: 'المبلغ', field: 'amount', type: 'number' },
      { name: 'Due Date', nameAr: 'تاريخ الاستحقاق', field: 'dueDate', type: 'date' },
      { name: 'Created', nameAr: 'تاريخ الإنشاء', field: 'createdAt', type: 'datetime' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// TRIGGER DISPLAY CONFIG
// ═══════════════════════════════════════════════════════════════

export interface TriggerConfig {
  value: AutomatedActionTrigger
  label: string
  labelAr: string
  icon: string
  description: string
  descriptionAr: string
}

export const TRIGGER_CONFIGS: TriggerConfig[] = [
  {
    value: 'on_create',
    label: 'On Creation',
    labelAr: 'عند الإنشاء',
    icon: 'Plus',
    description: 'Triggered when a new record is created',
    descriptionAr: 'يتم التفعيل عند إنشاء سجل جديد',
  },
  {
    value: 'on_write',
    label: 'On Update',
    labelAr: 'عند التعديل',
    icon: 'Edit',
    description: 'Triggered when specific fields are modified',
    descriptionAr: 'يتم التفعيل عند تعديل حقول محددة',
  },
  {
    value: 'on_unlink',
    label: 'On Deletion',
    labelAr: 'عند الحذف',
    icon: 'Trash2',
    description: 'Triggered when a record is deleted',
    descriptionAr: 'يتم التفعيل عند حذف سجل',
  },
  {
    value: 'on_time',
    label: 'Based on Time',
    labelAr: 'بناءً على الوقت',
    icon: 'Clock',
    description: 'Triggered based on a date field value',
    descriptionAr: 'يتم التفعيل بناءً على قيمة حقل تاريخ',
  },
  {
    value: 'on_stage_change',
    label: 'On Stage Change',
    labelAr: 'عند تغيير المرحلة',
    icon: 'ArrowRightLeft',
    description: 'Triggered when pipeline stage changes',
    descriptionAr: 'يتم التفعيل عند تغيير مرحلة القمع',
  },
]

export interface ActionTypeConfig {
  value: AutomatedActionType
  label: string
  labelAr: string
  icon: string
  description: string
  descriptionAr: string
}

export const ACTION_TYPE_CONFIGS: ActionTypeConfig[] = [
  {
    value: 'update_record',
    label: 'Update Record',
    labelAr: 'تحديث السجل',
    icon: 'Save',
    description: 'Update field values on the record',
    descriptionAr: 'تحديث قيم الحقول في السجل',
  },
  {
    value: 'create_activity',
    label: 'Create Activity',
    labelAr: 'إنشاء نشاط',
    icon: 'CalendarPlus',
    description: 'Schedule a new activity on the record',
    descriptionAr: 'جدولة نشاط جديد على السجل',
  },
  {
    value: 'send_email',
    label: 'Send Email',
    labelAr: 'إرسال بريد إلكتروني',
    icon: 'Mail',
    description: 'Send an email notification',
    descriptionAr: 'إرسال إشعار بالبريد الإلكتروني',
  },
  {
    value: 'send_notification',
    label: 'Send Notification',
    labelAr: 'إرسال إشعار',
    icon: 'Bell',
    description: 'Send an in-app notification',
    descriptionAr: 'إرسال إشعار داخل التطبيق',
  },
  {
    value: 'webhook',
    label: 'Call Webhook',
    labelAr: 'استدعاء Webhook',
    icon: 'Webhook',
    description: 'Call an external webhook URL',
    descriptionAr: 'استدعاء عنوان URL خارجي',
  },
]
