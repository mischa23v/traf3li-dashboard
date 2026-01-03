import { z } from 'zod'

/**
 * ==================== ENUMS ====================
 */

export const taskTypeEnum = z.enum([
  'court_hearing',
  'filing_deadline',
  'appeal_deadline',
  'document_drafting',
  'contract_review',
  'client_meeting',
  'client_call',
  'consultation',
  'najiz_procedure',
  'legal_research',
  'enforcement_followup',
  'notarization',
  'billing_task',
  'administrative',
  'follow_up',
  'other'
])
export type TaskType = z.infer<typeof taskTypeEnum>

export const taskStatusEnum = z.enum([
  'todo',
  'pending',
  'in_progress',
  'done',
  'canceled'
])
export type TaskStatus = z.infer<typeof taskStatusEnum>

export const taskPriorityEnum = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
])
export type TaskPriority = z.infer<typeof taskPriorityEnum>

export const taskLabelEnum = z.enum([
  'bug',
  'feature',
  'documentation',
  'enhancement',
  'question',
  'legal',
  'administrative',
  'urgent'
])
export type TaskLabel = z.infer<typeof taskLabelEnum>

export const deadlineTypeEnum = z.enum([
  'statutory',
  'court_ordered',
  'contractual',
  'internal'
])
export type DeadlineType = z.infer<typeof deadlineTypeEnum>

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
export type CourtType = z.infer<typeof courtTypeEnum>

export const billingTypeEnum = z.enum([
  'hourly',
  'fixed_fee',
  'retainer',
  'pro_bono',
  'not_billable'
])
export type BillingType = z.infer<typeof billingTypeEnum>

export const invoiceStatusEnum = z.enum([
  'not_invoiced',
  'invoiced',
  'paid',
  'written_off'
])
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>

/**
 * ==================== SUB-SCHEMAS ====================
 */

export const subtaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  completed: z.boolean().default(false),
  completedAt: z.string().optional(),
  completedBy: z.string().optional(),
  order: z.number(),
  autoReset: z.boolean().optional()
})
export type Subtask = z.infer<typeof subtaskSchema>

export const checklistItemSchema = z.object({
  _id: z.string().optional(),
  text: z.string(),
  checked: z.boolean().default(false),
  checkedAt: z.string().optional(),
  checkedBy: z.string().optional()
})
export type ChecklistItem = z.infer<typeof checklistItemSchema>

export const checklistSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  items: z.array(checklistItemSchema)
})
export type Checklist = z.infer<typeof checklistSchema>

export const timeSessionSchema = z.object({
  _id: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  duration: z.number().optional(),
  userId: z.string(),
  notes: z.string().optional()
})
export type TimeSession = z.infer<typeof timeSessionSchema>

export const timeTrackingSchema = z.object({
  estimatedMinutes: z.number().optional(),
  actualMinutes: z.number().optional(),
  sessions: z.array(timeSessionSchema).default([])
})
export type TimeTracking = z.infer<typeof timeTrackingSchema>

export const taskBillingSchema = z.object({
  isBillable: z.boolean().default(true),
  billingType: billingTypeEnum.default('hourly'),
  hourlyRate: z.number().optional(),
  fixedAmount: z.number().optional(),
  currency: z.string().default('SAR'),
  billableAmount: z.number().optional(),
  invoiceStatus: invoiceStatusEnum.default('not_invoiced'),
  linkedInvoiceId: z.string().optional()
})
export type TaskBilling = z.infer<typeof taskBillingSchema>

export const statutoryReferenceSchema = z.object({
  lawName: z.string(),
  articleNumber: z.string(),
  daysAllowed: z.number()
})
export type StatutoryReference = z.infer<typeof statutoryReferenceSchema>

export const hijriDateSchema = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
  formatted: z.string()
})
export type HijriDate = z.infer<typeof hijriDateSchema>

export const attachmentSchema = z.object({
  _id: z.string().optional(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.number().optional(),
  uploadedBy: z.string(),
  uploadedAt: z.string(),
  thumbnailUrl: z.string().optional()
})
export type Attachment = z.infer<typeof attachmentSchema>

export const commentSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  userName: z.string().optional(),
  userAvatar: z.string().optional(),
  text: z.string(),
  mentions: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  isEdited: z.boolean().optional()
})
export type Comment = z.infer<typeof commentSchema>

export const historyEntrySchema = z.object({
  _id: z.string().optional(),
  action: z.enum([
    'created',
    'updated',
    'status_changed',
    'assigned',
    'completed',
    'reopened',
    'commented',
    'attachment_added'
  ]),
  userId: z.string(),
  userName: z.string().optional(),
  timestamp: z.string(),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  details: z.string().optional()
})
export type HistoryEntry = z.infer<typeof historyEntrySchema>

export const linkedJudgmentSchema = z.object({
  _id: z.string(),
  caseNumber: z.string(),
  court: z.string(),
  year: z.number(),
  summary: z.string().optional()
})
export type LinkedJudgment = z.infer<typeof linkedJudgmentSchema>

export const linkedLawSchema = z.object({
  _id: z.string(),
  lawName: z.string(),
  articleNumber: z.string(),
  text: z.string().optional()
})
export type LinkedLaw = z.infer<typeof linkedLawSchema>

export const knowledgeLinksSchema = z.object({
  linkedJudgments: z.array(linkedJudgmentSchema).default([]),
  linkedLaws: z.array(linkedLawSchema).default([]),
  researchNotes: z.string().optional()
})
export type KnowledgeLinks = z.infer<typeof knowledgeLinksSchema>

export const relatedDocumentSchema = z.object({
  _id: z.string(),
  title: z.string(),
  documentType: z.string(),
  fileUrl: z.string().optional()
})
export type RelatedDocument = z.infer<typeof relatedDocumentSchema>

export const recurringConfigSchema = z.object({
  enabled: z.boolean().default(false),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']).optional(),
  type: z.enum(['due_date', 'completion_date']).optional(),
  daysOfWeek: z.array(z.number()).optional(),
  dayOfMonth: z.number().optional(),
  weekOfMonth: z.number().optional(),
  interval: z.number().optional(),
  endDate: z.string().optional(),
  maxOccurrences: z.number().optional(),
  occurrencesCompleted: z.number().optional(),
  assigneeStrategy: z.enum(['fixed', 'round_robin', 'random', 'least_assigned']).optional(),
  assigneePool: z.array(z.string()).optional(),
  lastAssigneeIndex: z.number().optional()
})
export type RecurringConfig = z.infer<typeof recurringConfigSchema>

export const taskReminderSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(['notification', 'email', 'sms', 'push']),
  beforeMinutes: z.number(),
  sent: z.boolean().default(false),
  sentAt: z.string().optional()
})
export type TaskReminder = z.infer<typeof taskReminderSchema>

/**
 * ==================== USER REFERENCE ====================
 */

export const userReferenceSchema = z.object({
  _id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  avatar: z.string().optional(),
  role: z.string().optional()
})
export type UserReference = z.infer<typeof userReferenceSchema>

export const caseReferenceSchema = z.object({
  _id: z.string(),
  caseNumber: z.string().optional(),
  title: z.string().optional(),
  court: z.string().optional()
})
export type CaseReference = z.infer<typeof caseReferenceSchema>

export const clientReferenceSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional()
})
export type ClientReference = z.infer<typeof clientReferenceSchema>

/**
 * ==================== MAIN TASK SCHEMA ====================
 */

export const taskSchema = z.object({
  // Core identifiers
  _id: z.string().optional(),
  id: z.string(),

  // Basic info
  title: z.string().optional(),
  description: z.string().optional(),

  // Task Type (Legal-specific)
  taskType: taskTypeEnum.default('other'),

  // Status & Priority
  status: taskStatusEnum.default('todo'),
  priority: taskPriorityEnum.default('medium'),
  label: taskLabelEnum.optional(),
  tags: z.array(z.string()).optional(),

  // Dates
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  startDate: z.string().optional(),
  completedAt: z.string().optional(),

  // Hijri Date
  dueDateHijri: hijriDateSchema.optional(),

  // Deadline Type (Legal-specific)
  deadlineType: deadlineTypeEnum.default('internal'),
  statutoryReference: statutoryReferenceSchema.optional(),
  warningDaysBefore: z.number().default(3),

  // Assignment
  assignedTo: z.union([z.string(), userReferenceSchema]).optional(),
  assignedToMultiple: z.array(z.string()).optional(),
  createdBy: z.union([z.string(), userReferenceSchema]).optional(),

  // Relations
  caseId: z.union([z.string(), caseReferenceSchema]).optional(),
  clientId: z.union([z.string(), clientReferenceSchema]).optional(),
  parentTaskId: z.string().optional(),
  eventId: z.string().optional(),
  linkedEventId: z.string().optional(), // Task ↔ Event sync
  reminderId: z.string().optional(),
  invoiceId: z.string().optional(),

  // Court Info (Legal-specific)
  courtType: courtTypeEnum.optional(),
  courtCaseNumber: z.string().optional(),
  caseYear: z.number().optional(),

  // Billing (Legal-specific)
  billing: taskBillingSchema.optional(),

  // Features
  subtasks: z.array(subtaskSchema).optional(),
  checklists: z.array(checklistSchema).optional(),
  timeTracking: timeTrackingSchema.optional(),
  recurring: recurringConfigSchema.optional(),
  reminders: z.array(taskReminderSchema).optional(),
  attachments: z.array(attachmentSchema).optional(),
  comments: z.array(commentSchema).optional(),
  history: z.array(historyEntrySchema).optional(),
  relatedDocuments: z.array(relatedDocumentSchema).optional(),

  // Knowledge Links (Legal-specific)
  knowledgeLinks: knowledgeLinksSchema.optional(),

  // Template
  isTemplate: z.boolean().default(false),
  templateId: z.string().optional(),
  templateName: z.string().optional(),
  isPublic: z.boolean().default(false),

  // Metadata
  points: z.number().optional(),
  estimatedMinutes: z.number().optional(),
  actualMinutes: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),

  // Timestamps
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export type Task = z.infer<typeof taskSchema>

/**
 * ==================== FORM SCHEMA ====================
 */

export const taskFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  taskType: taskTypeEnum.default('other'),
  status: taskStatusEnum.default('todo'),
  priority: taskPriorityEnum.default('medium'),
  label: taskLabelEnum.optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  startDate: z.string().optional(),
  deadlineType: deadlineTypeEnum.default('internal'),
  warningDaysBefore: z.number().default(3),
  assignedTo: z.string().optional(),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  courtType: courtTypeEnum.optional(),
  courtCaseNumber: z.string().optional(),
  caseYear: z.number().optional(),
  billing: taskBillingSchema.optional(),
  estimatedMinutes: z.number().optional(),
  notes: z.string().max(5000).optional(),
  isTemplate: z.boolean().default(false),
  templateName: z.string().optional()
})

export type TaskFormData = z.infer<typeof taskFormSchema>

/**
 * ==================== FILTER SCHEMA ====================
 */

export const taskFiltersSchema = z.object({
  status: z.union([taskStatusEnum, z.array(taskStatusEnum)]).optional(),
  priority: z.union([taskPriorityEnum, z.array(taskPriorityEnum)]).optional(),
  taskType: z.union([taskTypeEnum, z.array(taskTypeEnum)]).optional(),
  label: taskLabelEnum.optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  courtType: courtTypeEnum.optional(),
  isTemplate: z.boolean().optional(),
  hasSubtasks: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  overdue: z.boolean().optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['dueDate', 'priority', 'createdAt', 'updatedAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional(),
  limit: z.number().optional()
})

export type TaskFilters = z.infer<typeof taskFiltersSchema>
