/**
 * Tasks Service
 * Production-ready task management with Donetick-inspired features
 * Handles all task-related API calls including subtasks, recurring, time tracking
 *
 * IMPORTANT: Some endpoints may not be implemented in backend yet.
 * All methods include bilingual error handling (English | Arabic)
 */

import apiClient, { handleApiError } from '@/lib/api'
import {
  parseFileError,
  isMalwareDetectedError,
  MalwareDetectedError,
  ScanFailedError,
} from '@/lib/file-error-handling'
import { FILE_ERROR_MESSAGES } from '@/types/file-storage'
import { documentLogger } from '@/lib/document-debug-logger'

/**
 * Create bilingual error message
 * @param enMsg English message
 * @param arMsg Arabic message
 */
const bilingualError = (enMsg: string, arMsg: string): string => {
  return `${enMsg} | ${arMsg}`
}

/**
 * Handle endpoint not implemented error
 * @param endpoint The endpoint name
 */
const handleNotImplemented = (endpoint: string): never => {
  throw new Error(
    bilingualError(
      `Feature not available: ${endpoint} endpoint is not implemented yet`,
      `الميزة غير متاحة: نقطة النهاية ${endpoint} غير مطبقة بعد`
    )
  )
}

/**
 * ==================== ENUMS ====================
 */

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'critical'
export type TaskLabel = 'bug' | 'feature' | 'documentation' | 'enhancement' | 'question' | 'legal' | 'administrative' | 'urgent'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type RecurrenceType = 'due_date' | 'completion_date' // From Donetick: based on due date or completion date
export type AssigneeStrategy = 'fixed' | 'round_robin' | 'random' | 'least_assigned' // From Donetick: assignee rotation

// Task Types (Backend Contract)
export type TaskType =
  | 'general'
  | 'court_hearing'
  | 'document_review'
  | 'client_meeting'
  | 'filing_deadline'
  | 'appeal_deadline'
  | 'discovery'
  | 'deposition'
  | 'mediation'
  | 'settlement'
  | 'research'
  | 'drafting'
  | 'other'
  // Legacy Saudi Legal Types (for backward compatibility)
  | 'document_drafting'
  | 'contract_review'
  | 'client_call'
  | 'consultation'
  | 'najiz_procedure'
  | 'legal_research'
  | 'enforcement_followup'
  | 'notarization'
  | 'billing_task'
  | 'administrative'
  | 'follow_up'

// Saudi Court Types
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

// Deadline Types
export type DeadlineType = 'statutory' | 'court_ordered' | 'contractual' | 'internal'

// Billing Types
export type BillingType = 'hourly' | 'fixed_fee' | 'retainer' | 'pro_bono' | 'not_billable'
export type InvoiceStatus = 'not_invoiced' | 'invoiced' | 'paid' | 'written_off'

// Marketplace Origin
export type MarketplaceOrigin = 'marketplace_job' | 'marketplace_gig' | 'direct_client' | 'referral' | 'other'

/**
 * ==================== INTERFACES ====================
 */

export interface Subtask {
  _id?: string
  title: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  order: number
  // Auto-reset for recurring tasks (Donetick feature)
  autoReset?: boolean
}

export interface Checklist {
  _id?: string
  title: string
  items: ChecklistItem[]
}

export interface ChecklistItem {
  _id?: string
  text: string
  checked: boolean
  checkedAt?: string
  checkedBy?: string
}

export interface TimeTracking {
  estimatedMinutes?: number
  actualMinutes?: number
  sessions: TimeSession[]
  isTracking?: boolean // Is timer currently running
  currentSessionStart?: string // Start time of current session
}

export interface TimeSession {
  _id?: string
  startedAt: string
  endedAt?: string
  duration?: number // in minutes
  userId?: string
  notes?: string
  isBillable?: boolean
}

export interface RecurringConfig {
  enabled: boolean
  frequency: RecurrenceFrequency
  type: RecurrenceType
  // Weekly options
  daysOfWeek?: number[] // 0-6 (Sunday-Saturday)
  // Monthly options
  dayOfMonth?: number
  weekOfMonth?: number // 1-5
  // Custom interval
  interval?: number
  // End conditions
  endDate?: string
  maxOccurrences?: number
  occurrencesCompleted?: number
  // Assignee rotation (Donetick feature)
  assigneeStrategy?: AssigneeStrategy
  assigneePool?: string[] // User IDs for rotation
  lastAssigneeIndex?: number
}

export interface TaskReminder {
  _id?: string
  type: 'notification' | 'email' | 'sms' | 'push'
  beforeMinutes: number // e.g., 30 = 30 minutes before due date
  sent: boolean
  sentAt?: string
}

export interface Attachment {
  _id?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize?: number
  uploadedBy: string
  uploadedAt: string
  thumbnailUrl?: string
  // S3 storage fields
  fileKey?: string
  storageType?: 'local' | 's3'
  downloadUrl?: string // Presigned URL for S3
}

// Attachment Version (S3 Versioning)
export interface AttachmentVersion {
  versionId: string
  lastModified: string
  size: number
  isLatest: boolean
  etag: string
}

export interface AttachmentVersionsResponse {
  success: boolean
  attachment: {
    _id: string
    fileName: string
    fileKey: string
  }
  versions: AttachmentVersion[]
  message?: string
}

// Voice memo supported types
export const VOICE_MEMO_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a'
] as const

// All supported attachment types
export const ATTACHMENT_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  archives: ['application/zip', 'application/x-rar-compressed'],
  audio: VOICE_MEMO_TYPES
} as const

export interface Comment {
  _id?: string
  userId: string
  userName?: string
  userAvatar?: string
  text: string
  mentions?: string[] // User IDs mentioned
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
}

export interface TaskHistory {
  _id?: string
  action:
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'assigned'
    | 'completed'
    | 'reopened'
    | 'commented'
    | 'attachment_added'
    | 'attachment_removed'
    | 'subtask_added'
    | 'subtask_completed'
    | 'subtask_uncompleted'
    | 'subtask_deleted'
    | 'dependency_added'
    | 'dependency_removed'
    | 'created_from_template'
    | 'archived'
    | 'unarchived'
    | 'cloned'
    | 'reordered'
    | 'rescheduled'
    | 'timer_paused'
    | 'timer_resumed'
    | 'time_reset'
  userId: string
  userName?: string
  timestamp: string
  oldValue?: any
  newValue?: any
  details?: string
}

// Hijri Date Support
export interface HijriDate {
  year: number
  month: number
  day: number
  formatted: string // e.g., "15/06/1446"
}

// Statutory Reference (Saudi Legal)
export interface StatutoryReference {
  lawName: string // e.g., "نظام المرافعات الشرعية"
  articleNumber: string // e.g., "المادة 76"
  daysAllowed: number // e.g., 30
}

// Task Billing
export interface TaskBilling {
  isBillable: boolean
  billingType: BillingType
  hourlyRate?: number
  fixedAmount?: number
  currency: string // Default: 'SAR'
  billableAmount?: number
  invoiceStatus: InvoiceStatus
  linkedInvoiceId?: string
}

// Related Document
export interface RelatedDocument {
  documentId: string
  documentName: string
  documentType: string
}

// Knowledge Links (Future AI Integration)
export interface KnowledgeLinks {
  linkedJudgments?: {
    judgmentId: string
    judgmentNumber: string
    courtType: string
    year: number
    summary: string
  }[]
  linkedLaws?: {
    lawId: string
    lawName: string
    lawNumber: string
    articleNumber: string
  }[]
  researchNotes?: string
}

// Task Dependencies
export interface TaskDependency {
  taskId: string
  taskTitle?: string
  type: 'blocks' | 'blocked_by'
  status?: TaskStatus
  createdAt?: string
}

// Workflow Rule Types
export type WorkflowTrigger = 'status_change' | 'due_date_approaching' | 'priority_change' | 'assignment_change' | 'completion'
export type WorkflowConditionOperator = 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than'
export type WorkflowActionType = 'update_status' | 'update_priority' | 'assign_to' | 'send_notification' | 'create_subtask' | 'add_comment'

export interface WorkflowCondition {
  field: string
  operator: WorkflowConditionOperator
  value: any
}

export interface WorkflowAction {
  type: WorkflowActionType
  params: Record<string, any>
}

export interface WorkflowRule {
  _id?: string
  name: string
  description?: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  isActive: boolean
  priority?: number
  createdAt?: string
  createdBy?: string
}

// Task Outcome
export type OutcomeType = 'won' | 'lost' | 'settled' | 'dismissed' | 'withdrawn' | 'ongoing' | 'not_applicable'

export interface TaskOutcome {
  outcome: OutcomeType
  outcomeDate?: string
  outcomeNotes?: string
  settlementAmount?: number
  currency?: string
}

// Time Budget/Estimate
export interface TimeBudget {
  estimatedMinutes: number
  budgetAmount?: number
  currency?: string
  hourlyRate?: number
}

// Marketplace Tracking
export interface MarketplaceTracking {
  originSource: MarketplaceOrigin
  marketplaceJobId?: string
  marketplaceOrderId?: string
  clientSatisfactionRating?: number // 1-5
}

export interface Task {
  _id: string
  id?: string // Alternative ID field
  // Basic info
  title: string
  description?: string
  // Task Type (Saudi Legal-specific)
  taskType: TaskType
  // Status & Priority
  status: TaskStatus
  priority: TaskPriority
  label?: TaskLabel
  tags?: string[]
  // Dates
  dueDate?: string
  dueTime?: string
  startDate?: string
  completedAt?: string
  // Hijri Date (Saudi Calendar)
  dueDateHijri?: HijriDate
  // Deadline Type (Saudi Legal-specific)
  deadlineType: DeadlineType
  statutoryReference?: StatutoryReference
  warningDaysBefore: number // Default: 3
  // Assignment
  assignedTo?: string | {
    _id: string
    firstName: string
    lastName: string
    email?: string
    avatar?: string
    role?: string
  }
  assignedToMultiple?: string[] // Multiple assignees
  createdBy: string | {
    _id: string
    firstName: string
    lastName: string
  }
  // Relations
  caseId?: string | {
    _id: string
    caseNumber?: string
    title?: string
    court?: string
  }
  clientId?: string | {
    _id: string
    name?: string
    fullName?: string
    phone?: string
    email?: string
  }
  parentTaskId?: string // For sub-task hierarchy
  eventId?: string // Linked calendar event
  linkedEventId?: string // Auto-linked calendar event (created when task has dueDate)
  reminderId?: string // Linked reminder
  invoiceId?: string // Linked invoice
  // Court Info (Saudi Legal-specific)
  courtType?: CourtType
  courtCaseNumber?: string // e.g., "٤٤٠١٢٣٤٥٦"
  caseYear?: number // e.g., 1446
  // Billing (Saudi Legal-specific)
  billing?: TaskBilling
  // Features
  subtasks?: Subtask[]
  checklists?: Checklist[]
  timeTracking?: TimeTracking
  recurring?: RecurringConfig
  reminders?: TaskReminder[]
  attachments?: Attachment[]
  comments?: Comment[]
  history?: TaskHistory[]
  relatedDocuments?: RelatedDocument[]
  // Knowledge Links (Future AI Integration)
  knowledgeLinks?: KnowledgeLinks
  // Marketplace Tracking
  marketplaceTracking?: MarketplaceTracking
  // Task Dependencies
  dependencies?: {
    blockedBy: TaskDependency[]
    blocks: TaskDependency[]
  }
  // Workflow Rules
  workflowRules?: WorkflowRule[]
  // Task Outcome (for court cases)
  outcome?: TaskOutcome
  // Template
  isTemplate?: boolean
  templateId?: string
  templateName?: string
  isPublic?: boolean // Public template
  // Metadata
  points?: number // Gamification (Donetick feature)
  estimatedMinutes?: number
  actualMinutes?: number
  progress?: number // 0-100 calculated from subtasks
  notes?: string // Max 5000 chars
  // Multi-tenancy
  firmId?: string
  lawyerId?: string
  // Archive
  isArchived?: boolean
  archivedAt?: string
  archivedBy?: string
  // Sort Order (for drag & drop)
  sortOrder?: number
  // Location & Location Trigger
  location?: {
    name?: string
    address?: string
    latitude?: number
    longitude?: number
  }
  locationTrigger?: {
    enabled: boolean
    type: 'arrive' | 'leave' | 'nearby'
    radius: number
    triggered: boolean
  }
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Create Task Data
 */
export interface CreateTaskData {
  title: string
  description?: string
  // Task Type (Saudi Legal-specific)
  taskType?: TaskType
  // Status & Priority
  status?: TaskStatus
  priority?: TaskPriority
  label?: TaskLabel
  tags?: string[]
  // Dates
  dueDate?: string
  dueTime?: string
  startDate?: string
  // Deadline Type (Saudi Legal-specific)
  deadlineType?: DeadlineType
  warningDaysBefore?: number
  // Assignment
  assignedTo?: string
  assignedToMultiple?: string[]
  // Relations
  caseId?: string
  clientId?: string
  parentTaskId?: string
  // Court Info (Saudi Legal-specific)
  courtType?: CourtType
  courtCaseNumber?: string
  caseYear?: number
  // Billing (Saudi Legal-specific)
  billing?: Partial<TaskBilling>
  // Features
  subtasks?: Omit<Subtask, '_id'>[]
  checklists?: Omit<Checklist, '_id'>[]
  recurring?: RecurringConfig
  reminders?: Omit<TaskReminder, '_id' | 'sent' | 'sentAt'>[]
  // Metadata
  estimatedMinutes?: number
  notes?: string
  // Template
  isTemplate?: boolean
  templateId?: string
  templateName?: string
  isPublic?: boolean
}

/**
 * Task Filters
 */
export interface TaskFilters {
  // Status & Priority
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  label?: TaskLabel
  // Task Type (Saudi Legal-specific)
  taskType?: TaskType | TaskType[]
  // Deadline Type (Saudi Legal-specific)
  deadlineType?: DeadlineType
  // Court Type (Saudi Legal-specific)
  courtType?: CourtType
  // Assignment
  assignedTo?: string
  createdBy?: string
  // Relations
  caseId?: string
  clientId?: string
  // Billing (Saudi Legal-specific)
  isBillable?: boolean
  invoiceStatus?: InvoiceStatus
  // Template
  isTemplate?: boolean
  // Features
  hasSubtasks?: boolean
  isRecurring?: boolean
  // Date Filters
  overdue?: boolean
  dueDateFrom?: string
  dueDateTo?: string
  // Search
  search?: string
  tags?: string[]
  // Sorting & Pagination
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'title' | 'taskType' | 'deadlineType'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Task Statistics
 */
export interface TaskStats {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  // Saudi Legal-specific stats
  byTaskType?: Partial<Record<TaskType, number>>
  byDeadlineType?: Partial<Record<DeadlineType, number>>
  byCourtType?: Partial<Record<CourtType, number>>
  // Date-based stats
  overdue: number
  dueToday: number
  dueThisWeek: number
  completedThisWeek: number
  completedThisMonth: number
  // Time stats
  averageCompletionTime?: number // in minutes
  totalTimeTracked?: number // in minutes
  // Billing stats (Saudi Legal)
  totalBillableAmount?: number
  totalBilledAmount?: number
  unbilledTasks?: number
}

/**
 * Bulk Operation Result
 */
export interface BulkOperationResult {
  success: number
  failed: number
  errors?: { id: string; error: string }[]
}

/**
 * Tasks Service Object
 */
const tasksService = {
  // ==================== CRUD Operations ====================

  /**
   * Get all tasks with filters and pagination
   */
  getTasks: async (filters?: TaskFilters): Promise<{ tasks: Task[]; total: number; pagination: any }> => {
    try {
      const response = await apiClient.get('/tasks', { params: filters })
      return {
        tasks: response.data.tasks || response.data.data || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {}
      }
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to fetch tasks: ${errorMsg}`,
          `فشل في جلب المهام: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Get single task by ID
   */
  getTask: async (id: string): Promise<Task> => {
    try {
      const response = await apiClient.get(`/tasks/${id}`)
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to fetch task: ${errorMsg}`,
          `فشل في جلب المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Create new task
   */
  createTask: async (data: CreateTaskData): Promise<Task> => {
    try {
      const response = await apiClient.post('/tasks', data)
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to create task: ${errorMsg}`,
          `فشل في إنشاء المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Update task
   */
  updateTask: async (id: string, data: Partial<CreateTaskData>): Promise<Task> => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, data)
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update task: ${errorMsg}`,
          `فشل في تحديث المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Delete task
   */
  deleteTask: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${id}`)
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to delete task: ${errorMsg}`,
          `فشل في حذف المهمة: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Status Operations ====================

  /**
   * Update task status
   */
  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    try {
      const response = await apiClient.patch(`/tasks/${id}/status`, { status })
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update task status: ${errorMsg}`,
          `فشل في تحديث حالة المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Update task progress (0-100)
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   * Setting progress to 100 auto-completes the task
   * Use autoCalculate: true to switch back to automatic calculation from subtasks
   */
  updateProgress: async (id: string, progress?: number, autoCalculate?: boolean): Promise<Task> => {
    try {
      const payload = autoCalculate ? { autoCalculate: true } : { progress }
      const response = await apiClient.patch(`/tasks/${id}/progress`, payload)
      return response.data.task || response.data.data
    } catch (error: any) {
      // This endpoint likely doesn't exist - provide helpful error
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Progress update feature is not available. Progress is automatically calculated from subtasks.',
            'ميزة تحديث التقدم غير متاحة. يتم حساب التقدم تلقائيًا من المهام الفرعية.'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update task progress: ${errorMsg}`,
          `فشل في تحديث تقدم المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Mark task as complete
   */
  completeTask: async (id: string, completionNote?: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${id}/complete`, { completionNote })
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to complete task: ${errorMsg}`,
          `فشل في إكمال المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Reopen completed task
   */
  reopenTask: async (id: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${id}/reopen`)
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to reopen task: ${errorMsg}`,
          `فشل في إعادة فتح المهمة: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Subtasks ====================

  /**
   * Add subtask to task
   */
  addSubtask: async (taskId: string, subtask: Omit<Subtask, '_id' | 'order'>): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/subtasks`, subtask)
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to add subtask: ${errorMsg}`,
          `فشل في إضافة المهمة الفرعية: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Update subtask
   */
  updateSubtask: async (taskId: string, subtaskId: string, data: Partial<Subtask>): Promise<Task> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, data)
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update subtask: ${errorMsg}`,
          `فشل في تحديث المهمة الفرعية: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Toggle subtask completion
   * Note: Backend documentation says POST, but using PATCH. May need adjustment.
   */
  toggleSubtask: async (taskId: string, subtaskId: string): Promise<Task> => {
    try {
      // Try PATCH first (current implementation)
      const response = await apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`)
      return response.data.task || response.data.data
    } catch (error: any) {
      // If PATCH fails with 404/405, try POST (as documented)
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        try {
          const response = await apiClient.post(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`)
          return response.data.task || response.data.data
        } catch (postError: any) {
          const errorMsg = handleApiError(postError)
          throw new Error(
            bilingualError(
              `Failed to toggle subtask: ${errorMsg}`,
              `فشل في تبديل حالة المهمة الفرعية: ${errorMsg}`
            )
          )
        }
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to toggle subtask: ${errorMsg}`,
          `فشل في تبديل حالة المهمة الفرعية: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Delete subtask
   */
  deleteSubtask: async (taskId: string, subtaskId: string): Promise<Task> => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to delete subtask: ${errorMsg}`,
          `فشل في حذف المهمة الفرعية: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Reorder subtasks
   */
  reorderSubtasks: async (taskId: string, subtaskIds: string[]): Promise<Task> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/subtasks/reorder`, { subtaskIds })
      return response.data.task || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to reorder subtasks: ${errorMsg}`,
          `فشل في إعادة ترتيب المهام الفرعية: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Time Tracking ====================

  /**
   * Start time tracking session
   * Note: Backend API uses /time-tracking/start, but trying /timer/start first for compatibility
   * BREAKING CHANGE: Returns 400 if task status is 'done' or 'canceled'
   */
  startTimeTracking: async (taskId: string): Promise<Task> => {
    try {
      // Try /timer/start first (current implementation)
      const response = await apiClient.post(`/tasks/${taskId}/timer/start`)
      return response.data.task || response.data.data
    } catch (error: any) {
      // Handle completed/canceled task error (new backend behavior)
      if (error?.response?.status === 400) {
        throw new Error(
          bilingualError(
            'Cannot start timer on completed or canceled task. Reopen the task first.',
            'لا يمكن بدء المؤقت على مهمة مكتملة أو ملغاة. أعد فتح المهمة أولاً.'
          )
        )
      }
      // If that fails, try the documented endpoint
      if (error?.response?.status === 404) {
        try {
          const response = await apiClient.post(`/tasks/${taskId}/time-tracking/start`)
          return response.data.task || response.data.data
        } catch (fallbackError: any) {
          if (fallbackError?.response?.status === 400) {
            throw new Error(
              bilingualError(
                'Cannot start timer on completed or canceled task. Reopen the task first.',
                'لا يمكن بدء المؤقت على مهمة مكتملة أو ملغاة. أعد فتح المهمة أولاً.'
              )
            )
          }
          const errorMsg = handleApiError(fallbackError)
          throw new Error(
            bilingualError(
              `Failed to start time tracking: ${errorMsg}`,
              `فشل في بدء تتبع الوقت: ${errorMsg}`
            )
          )
        }
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to start time tracking: ${errorMsg}`,
          `فشل في بدء تتبع الوقت: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Stop time tracking session
   * Note: Backend API uses /time-tracking/stop, but trying /timer/stop first for compatibility
   */
  stopTimeTracking: async (taskId: string, notes?: string): Promise<Task> => {
    try {
      // Try /timer/stop first (current implementation)
      const response = await apiClient.post(`/tasks/${taskId}/timer/stop`, { notes })
      return response.data.task || response.data.data
    } catch (error: any) {
      // If that fails, try the documented endpoint
      if (error?.response?.status === 404) {
        try {
          const response = await apiClient.post(`/tasks/${taskId}/time-tracking/stop`, { notes })
          return response.data.task || response.data.data
        } catch (fallbackError: any) {
          const errorMsg = handleApiError(fallbackError)
          throw new Error(
            bilingualError(
              `Failed to stop time tracking: ${errorMsg}`,
              `فشل في إيقاف تتبع الوقت: ${errorMsg}`
            )
          )
        }
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to stop time tracking: ${errorMsg}`,
          `فشل في إيقاف تتبع الوقت: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Add manual time entry
   * Note: Backend API uses /time-tracking/manual, but trying /time first for compatibility
   * BREAKING CHANGE: Returns 400 if task status is 'done' or 'canceled'
   */
  addTimeEntry: async (taskId: string, data: { minutes: number; date: string; notes?: string }): Promise<Task> => {
    try {
      // Try /time first (current implementation)
      const response = await apiClient.post(`/tasks/${taskId}/time`, data)
      return response.data.task || response.data.data
    } catch (error: any) {
      // Handle completed/canceled task error (new backend behavior)
      if (error?.response?.status === 400) {
        throw new Error(
          bilingualError(
            'Cannot add time to completed or canceled task. Reopen the task first.',
            'لا يمكن إضافة وقت إلى مهمة مكتملة أو ملغاة. أعد فتح المهمة أولاً.'
          )
        )
      }
      // If that fails, try the documented endpoint
      if (error?.response?.status === 404) {
        try {
          const response = await apiClient.post(`/tasks/${taskId}/time-tracking/manual`, data)
          return response.data.task || response.data.data
        } catch (fallbackError: any) {
          if (fallbackError?.response?.status === 400) {
            throw new Error(
              bilingualError(
                'Cannot add time to completed or canceled task. Reopen the task first.',
                'لا يمكن إضافة وقت إلى مهمة مكتملة أو ملغاة. أعد فتح المهمة أولاً.'
              )
            )
          }
          const errorMsg = handleApiError(fallbackError)
          throw new Error(
            bilingualError(
              `Failed to add time entry: ${errorMsg}`,
              `فشل في إضافة إدخال الوقت: ${errorMsg}`
            )
          )
        }
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to add time entry: ${errorMsg}`,
          `فشل في إضافة إدخال الوقت: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Get time tracking summary for task
   * Note: Backend API uses /time-tracking, but trying /time-tracking/summary first for compatibility
   */
  getTimeTrackingSummary: async (taskId: string): Promise<{ totalMinutes: number; sessions: TimeSession[] }> => {
    try {
      // Try /time-tracking/summary first (current implementation)
      const response = await apiClient.get(`/tasks/${taskId}/time-tracking/summary`)
      return response.data
    } catch (error: any) {
      // If that fails, try the documented endpoint
      if (error?.response?.status === 404) {
        try {
          const response = await apiClient.get(`/tasks/${taskId}/time-tracking`)
          return response.data
        } catch (fallbackError: any) {
          const errorMsg = handleApiError(fallbackError)
          throw new Error(
            bilingualError(
              `Failed to get time tracking summary: ${errorMsg}`,
              `فشل في الحصول على ملخص تتبع الوقت: ${errorMsg}`
            )
          )
        }
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to get time tracking summary: ${errorMsg}`,
          `فشل في الحصول على ملخص تتبع الوقت: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Reset time tracking for a task
   * DELETE /tasks/:id/time-tracking/reset
   * Clears all sessions, resets actualMinutes to 0
   * Preserves estimatedMinutes
   * Returns 400 if timer is currently running
   */
  resetTimeTracking: async (taskId: string): Promise<Task> => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}/time-tracking/reset`)
      return response.data.task || response.data.data
    } catch (error: any) {
      // Handle running timer error
      if (error?.response?.status === 400) {
        throw new Error(
          bilingualError(
            'Stop the timer first before resetting time tracking',
            'أوقف المؤقت أولاً قبل إعادة تعيين تتبع الوقت'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to reset time tracking: ${errorMsg}`,
          `فشل في إعادة تعيين تتبع الوقت: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Comments ====================

  /**
   * Add comment to task
   */
  addComment: async (taskId: string, text: string, mentions?: string[]): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/comments`, { text, mentions })
      return response.data.task || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update comment
   */
  updateComment: async (taskId: string, commentId: string, text: string): Promise<Task> => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}/comments/${commentId}`, { text })
      return response.data.task || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete comment
   */
  deleteComment: async (taskId: string, commentId: string): Promise<Task> => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
      return response.data.task || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Attachments ====================
  // ✅ All attachment endpoints now support malware scanning (ClamAV)
  // @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md

  /**
   * Upload attachment (supports R2/S3 and local storage)
   * Backend automatically detects storage type
   *
   * ⚠️ MALWARE SCANNING: All uploads are scanned by ClamAV.
   * Throws MalwareDetectedError if malware is found.
   * Throws ScanFailedError if scanner is unavailable.
   *
   * @throws {MalwareDetectedError} If malware is detected
   * @throws {ScanFailedError} If malware scanner fails
   *
   * @example
   * ```ts
   * try {
   *   const attachment = await tasksService.uploadAttachment(taskId, file, setProgress)
   * } catch (error) {
   *   if (isMalwareDetectedError(error)) {
   *     toast.error(error.messageAr) // Arabic malware message
   *   }
   * }
   * ```
   */
  uploadAttachment: async (
    taskId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<Attachment> => {
    const startTime = Date.now()
    documentLogger.uploadStart(file, { taskId, operation: 'task-attachment' })

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            documentLogger.uploadProgress(file.name, percent)
            if (onProgress) {
              onProgress(percent)
            }
          }
        }
      })

      const attachment = response.data.attachment || response.data.data
      const duration = Date.now() - startTime
      documentLogger.uploadSuccess(
        { name: file.name, size: file.size },
        attachment?._id || 'unknown',
        duration
      )

      return attachment
    } catch (error: any) {
      // Handle malware detection errors
      const fileError = parseFileError(error)
      if (fileError instanceof MalwareDetectedError) {
        documentLogger.malwareDetected(file.name, fileError.threatType || 'unknown')
        throw fileError // Re-throw with Arabic message
      }
      if (fileError instanceof ScanFailedError) {
        documentLogger.scanFailed(file.name, fileError.message)
        throw fileError
      }

      documentLogger.uploadError(file.name, error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get fresh download URL for S3 attachment (presigned URL)
   * Use this when the presigned URL expires
   * @param disposition - 'inline' for preview (Content-Disposition: inline), 'attachment' for download
   */
  getAttachmentDownloadUrl: async (
    taskId: string,
    attachmentId: string,
    disposition: 'inline' | 'attachment' = 'attachment'
  ): Promise<string> => {
    const startTime = Date.now()
    documentLogger.downloadStart(attachmentId, { taskId, disposition })

    try {
      const response = await apiClient.get(
        `/tasks/${taskId}/attachments/${attachmentId}/download-url`,
        { params: { disposition } }
      )

      const duration = Date.now() - startTime
      documentLogger.downloadSuccess(attachmentId, duration)

      return response.data.downloadUrl
    } catch (error: any) {
      documentLogger.downloadError(attachmentId, error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get preview URL for S3 attachment with inline disposition
   * Best practice: Use this for previewing files in browser
   */
  getAttachmentPreviewUrl: async (taskId: string, attachmentId: string): Promise<string> => {
    const startTime = Date.now()
    documentLogger.previewStart(attachmentId, { taskId })

    try {
      const response = await apiClient.get(
        `/tasks/${taskId}/attachments/${attachmentId}/download-url`,
        { params: { disposition: 'inline' } }
      )

      const duration = Date.now() - startTime
      documentLogger.previewSuccess(attachmentId, duration)

      return response.data.downloadUrl
    } catch (error: any) {
      documentLogger.previewError(attachmentId, error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete attachment (handles both S3 and local storage)
   */
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    const startTime = Date.now()
    documentLogger.deleteStart(attachmentId, { taskId })

    try {
      await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`)

      const duration = Date.now() - startTime
      documentLogger.deleteSuccess(attachmentId, duration)
    } catch (error: any) {
      documentLogger.deleteError(attachmentId, error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Attachment Versioning ====================

  /**
   * Get all versions of an attachment (S3 versioning)
   */
  getAttachmentVersions: async (
    taskId: string,
    attachmentId: string
  ): Promise<AttachmentVersionsResponse> => {
    try {
      const response = await apiClient.get(
        `/tasks/${taskId}/attachments/${attachmentId}/versions`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get download URL for a specific version of an attachment
   */
  getAttachmentVersionDownloadUrl: async (
    taskId: string,
    attachmentId: string,
    options?: {
      versionId?: string
      disposition?: 'inline' | 'attachment'
    }
  ): Promise<{ downloadUrl: string; versionId: string | null; disposition: string }> => {
    try {
      const params: Record<string, string> = {}
      if (options?.versionId) params.versionId = options.versionId
      if (options?.disposition) params.disposition = options.disposition

      const response = await apiClient.get(
        `/tasks/${taskId}/attachments/${attachmentId}/download-url`,
        { params }
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if file type is a voice memo
   */
  isVoiceMemo: (fileType: string): boolean => {
    return VOICE_MEMO_TYPES.includes(fileType as any)
  },

  /**
   * Get attachment URL (handles S3 presigned URLs and local files)
   */
  getAttachmentUrl: (attachment: Attachment): string => {
    // For S3 storage, use downloadUrl (presigned URL)
    if (attachment.storageType === 's3' && attachment.downloadUrl) {
      return attachment.downloadUrl
    }
    // For local storage or fallback
    return attachment.fileUrl
  },

  // ==================== Dependencies ====================

  /**
   * Add task dependency
   */
  addDependency: async (taskId: string, dependsOn: string, type: 'blocks' | 'blocked_by'): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/dependencies`, {
        dependsOn,
        type
      })
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Task dependencies feature is not available yet',
            'ميزة تبعيات المهام غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to add task dependency: ${errorMsg}`,
          `فشل في إضافة تبعية المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Remove task dependency
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  removeDependency: async (taskId: string, dependencyTaskId: string): Promise<Task> => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}/dependencies/${dependencyTaskId}`)
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Task dependencies feature is not available yet',
            'ميزة تبعيات المهام غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to remove task dependency: ${errorMsg}`,
          `فشل في إزالة تبعية المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Get tasks that can be dependencies (not creating circular refs)
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  getAvailableDependencies: async (taskId: string): Promise<Task[]> => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/available-dependencies`)
      return response.data.tasks || response.data.data || []
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Task dependencies feature is not available yet',
            'ميزة تبعيات المهام غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to get available dependencies: ${errorMsg}`,
          `فشل في الحصول على التبعيات المتاحة: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Workflow Rules ====================

  /**
   * Add workflow rule to task
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  addWorkflowRule: async (taskId: string, rule: Omit<WorkflowRule, '_id' | 'createdAt' | 'createdBy'>): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/workflow-rules`, rule)
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Workflow rules feature is not available yet',
            'ميزة قواعد سير العمل غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to add workflow rule: ${errorMsg}`,
          `فشل في إضافة قاعدة سير العمل: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Update workflow rule
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  updateWorkflowRule: async (taskId: string, ruleId: string, rule: Partial<WorkflowRule>): Promise<Task> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/workflow-rules/${ruleId}`, rule)
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Workflow rules feature is not available yet',
            'ميزة قواعد سير العمل غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update workflow rule: ${errorMsg}`,
          `فشل في تحديث قاعدة سير العمل: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Delete workflow rule
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  deleteWorkflowRule: async (taskId: string, ruleId: string): Promise<Task> => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}/workflow-rules/${ruleId}`)
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Workflow rules feature is not available yet',
            'ميزة قواعد سير العمل غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to delete workflow rule: ${errorMsg}`,
          `فشل في حذف قاعدة سير العمل: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Toggle workflow rule active status
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  toggleWorkflowRule: async (taskId: string, ruleId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/workflow-rules/${ruleId}/toggle`)
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Workflow rules feature is not available yet',
            'ميزة قواعد سير العمل غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to toggle workflow rule: ${errorMsg}`,
          `فشل في تبديل قاعدة سير العمل: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Outcome ====================

  /**
   * Update task outcome (for court cases, deadlines, etc.)
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  updateOutcome: async (taskId: string, outcome: TaskOutcome): Promise<Task> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/outcome`, outcome)
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Task outcome feature is not available yet',
            'ميزة نتيجة المهمة غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update task outcome: ${errorMsg}`,
          `فشل في تحديث نتيجة المهمة: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Time Estimate & Budget ====================

  /**
   * Update time/budget estimate
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  updateEstimate: async (taskId: string, estimate: TimeBudget): Promise<Task> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/estimate`, estimate)
      return response.data.task || response.data.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Time estimate feature is not available yet. Use estimatedMinutes field when creating/updating tasks.',
            'ميزة تقدير الوقت غير متاحة بعد. استخدم حقل estimatedMinutes عند إنشاء/تحديث المهام.'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update time estimate: ${errorMsg}`,
          `فشل في تحديث تقدير الوقت: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Get detailed time tracking summary with budget comparison
   */
  getTimeTrackingDetails: async (taskId: string): Promise<{
    estimated: number
    actual: number
    remaining: number
    percentUsed: number
    budgetAmount?: number
    budgetUsed?: number
    budgetRemaining?: number
    sessions: TimeSession[]
    isOverBudget: boolean
    isOverTime: boolean
  }> => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/time-tracking/summary`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Queries ====================

  /**
   * Get upcoming tasks
   */
  getUpcoming: async (days: number = 7): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks/upcoming', { params: { days } })
      return response.data.tasks || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get overdue tasks
   */
  getOverdue: async (): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks/overdue')
      return response.data.tasks || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get tasks due today
   */
  getDueToday: async (): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks/due-today')
      return response.data.tasks || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get tasks by case
   */
  getTasksByCase: async (caseId: string): Promise<Task[]> => {
    try {
      const response = await apiClient.get(`/tasks/case/${caseId}`)
      return response.data.tasks || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get my tasks (assigned to current user)
   */
  getMyTasks: async (filters?: Omit<TaskFilters, 'assignedTo'>): Promise<{ tasks: Task[]; total: number }> => {
    try {
      const response = await apiClient.get('/tasks/my-tasks', { params: filters })
      return {
        tasks: response.data.tasks || response.data.data || [],
        total: response.data.total || 0
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get task statistics
   */
  getStats: async (filters?: { caseId?: string; assignedTo?: string; dateFrom?: string; dateTo?: string }): Promise<TaskStats> => {
    try {
      const response = await apiClient.get('/tasks/stats', { params: filters })
      return response.data.stats || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Templates ====================

  /**
   * Get task templates
   */
  getTemplates: async (): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks/templates')
      return response.data.templates || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single template by ID
   */
  getTemplate: async (templateId: string): Promise<Task> => {
    try {
      const response = await apiClient.get(`/tasks/templates/${templateId}`)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new template
   */
  createTemplate: async (data: CreateTaskData): Promise<Task> => {
    try {
      const response = await apiClient.post('/tasks/templates', data)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update template
   */
  updateTemplate: async (templateId: string, data: Partial<CreateTaskData>): Promise<Task> => {
    try {
      const response = await apiClient.put(`/tasks/templates/${templateId}`, data)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete template
   */
  deleteTemplate: async (templateId: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/templates/${templateId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create task from template
   */
  createFromTemplate: async (templateId: string, overrides?: Partial<CreateTaskData>): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/templates/${templateId}/create`, overrides)
      return response.data.task || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save task as template
   */
  saveAsTemplate: async (taskId: string, templateName: string, isPublic?: boolean): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/save-as-template`, { templateName, isPublic })
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Bulk Operations ====================

  /**
   * Bulk update tasks
   */
  bulkUpdate: async (taskIds: string[], data: Partial<CreateTaskData>): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.put('/tasks/bulk', { taskIds, updates: data })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk delete tasks
   */
  bulkDelete: async (taskIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.delete('/tasks/bulk', { data: { taskIds } })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk complete tasks
   */
  bulkComplete: async (taskIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/tasks/bulk/complete', { taskIds })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk assign tasks
   */
  bulkAssign: async (taskIds: string[], assignedTo: string): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/tasks/bulk/assign', { taskIds, assignedTo })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * ⚠️ NOTE: bulkReopenTasks does NOT exist in the backend
   * Only single task reopen is available via POST /tasks/:id/reopen
   * If you need to reopen multiple tasks, loop through them individually:
   *
   * for (const taskId of taskIds) {
   *   await tasksService.reopenTask(taskId)
   * }
   */

  // ==================== Import/Export ====================

  /**
   * Import tasks from CSV
   */
  importTasks: async (file: File): Promise<{ imported: number; failed: number; errors: any[] }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post('/tasks/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export tasks to CSV
   */
  exportTasks: async (filters?: TaskFilters): Promise<Blob> => {
    try {
      const response = await apiClient.get('/tasks/export', {
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Recurring Tasks ====================

  /**
   * Skip next occurrence of recurring task
   */
  skipRecurrence: async (taskId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/recurring/skip`)
      return response.data.task || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Stop recurring task
   */
  stopRecurrence: async (taskId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/recurring/stop`)
      return response.data.task || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get recurring task history
   */
  getRecurrenceHistory: async (taskId: string): Promise<{ occurrences: any[] }> => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/recurring/history`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Documents (TipTap Editor) ====================

  /**
   * Create a new document with TipTap content
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  createDocument: async (
    taskId: string,
    title: string,
    content: string,
    contentJson?: any
  ): Promise<{ document: TaskDocument }> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/documents`, {
        title,
        content,
        contentJson,
        contentFormat: 'tiptap-json'
      })
      return response.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Document editor feature is not available yet. Use attachments instead.',
            'ميزة محرر المستندات غير متاحة بعد. استخدم المرفقات بدلاً من ذلك.'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to create document: ${errorMsg}`,
          `فشل في إنشاء المستند: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Get a document
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   * Returns null document if not found (404)
   */
  getDocument: async (taskId: string, documentId: string): Promise<{ document: TaskDocument | null }> => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/documents/${documentId}`)
      return response.data
    } catch (error: any) {
      // Handle 404 gracefully - endpoint not implemented
      if (error?.response?.status === 404) {
        return { document: null }
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to get document: ${errorMsg}`,
          `فشل في الحصول على المستند: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Update a document
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  updateDocument: async (
    taskId: string,
    documentId: string,
    data: { title?: string; content?: string; contentJson?: any }
  ): Promise<{ document: TaskDocument }> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/documents/${documentId}`, {
        ...data,
        contentFormat: 'tiptap-json'
      })
      return response.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Document editor feature is not available yet',
            'ميزة محرر المستندات غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update document: ${errorMsg}`,
          `فشل في تحديث المستند: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Delete a document
   * Note: Uses attachments endpoint as fallback
   */
  deleteDocument: async (taskId: string, documentId: string): Promise<void> => {
    try {
      // Documents are stored as attachments in the backend, so we use the attachments endpoint
      await apiClient.delete(`/tasks/${taskId}/attachments/${documentId}`)
    } catch (error: any) {
      // If 404, it's already deleted, so we can treat it as success
      if (error?.response?.status === 404 || error?.status === 404 || error?.status === '404') {
        return
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to delete document: ${errorMsg}`,
          `فشل في حذف المستند: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Get all documents for a task
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   * Returns empty array if endpoint not implemented (404)
   */
  getDocuments: async (taskId: string): Promise<{ documents: TaskDocument[] }> => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/documents`)
      return response.data
    } catch (error: any) {
      // Handle 404 gracefully - endpoint may not be implemented yet
      if (error?.response?.status === 404) {
        return { documents: [] }
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to get documents: ${errorMsg}`,
          `فشل في الحصول على المستندات: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Voice Memos ====================
  // ✅ Voice memo uploads now support malware scanning (ClamAV)
  // @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md

  /**
   * Upload voice memo
   * ✅ IMPLEMENTED - POST /api/tasks/:taskId/voice-memos
   *
   * ⚠️ MALWARE SCANNING: All uploads are scanned by ClamAV.
   * Throws MalwareDetectedError if malware is found.
   *
   * @throws {MalwareDetectedError} If malware is detected
   * @throws {ScanFailedError} If malware scanner fails
   */
  uploadVoiceMemo: async (
    taskId: string,
    file: Blob,
    duration: number
  ): Promise<{ voiceMemo: any }> => {
    const startTime = Date.now()
    const fileName = `voice-memo-${Date.now()}.webm`
    documentLogger.uploadStart(
      { name: fileName, size: file.size, type: 'audio/webm' } as File,
      { taskId, operation: 'voice-memo', duration }
    )

    try {
      const formData = new FormData()
      formData.append('file', file, fileName)
      formData.append('duration', String(duration))

      const response = await apiClient.post(`/tasks/${taskId}/voice-memos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const uploadDuration = Date.now() - startTime
      documentLogger.uploadSuccess(
        { name: fileName, size: file.size },
        response.data.voiceMemo?._id || 'unknown',
        uploadDuration
      )

      return response.data
    } catch (error: any) {
      // Handle malware detection errors
      const fileError = parseFileError(error)
      if (fileError instanceof MalwareDetectedError) {
        documentLogger.malwareDetected(fileName, fileError.threatType || 'unknown')
        throw fileError // Re-throw with Arabic message
      }
      if (fileError instanceof ScanFailedError) {
        documentLogger.scanFailed(fileName, fileError.message)
        throw fileError
      }

      documentLogger.uploadError(fileName, error)

      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Voice memo feature is not available yet. Use regular attachments instead.',
            'ميزة المذكرات الصوتية غير متاحة بعد. استخدم المرفقات العادية بدلاً من ذلك.'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to upload voice memo: ${errorMsg}`,
          `فشل في تحميل المذكرة الصوتية: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Update voice memo transcription
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  updateVoiceMemoTranscription: async (
    taskId: string,
    memoId: string,
    transcription: string
  ): Promise<{ voiceMemo: any }> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/voice-memos/${memoId}/transcription`, {
        transcription
      })
      return response.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Voice memo transcription feature is not available yet',
            'ميزة نسخ المذكرات الصوتية غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to update voice memo transcription: ${errorMsg}`,
          `فشل في تحديث نسخ المذكرة الصوتية: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Delete voice memo
   * ⚠️ WARNING: This endpoint is NOT documented in backend API
   */
  deleteVoiceMemo: async (taskId: string, memoId: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${taskId}/voice-memos/${memoId}`)
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error(
          bilingualError(
            'Voice memo feature is not available yet',
            'ميزة المذكرات الصوتية غير متاحة بعد'
          )
        )
      }
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to delete voice memo: ${errorMsg}`,
          `فشل في حذف المذكرة الصوتية: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Clone/Duplicate ====================

  /**
   * Clone/duplicate a task
   * POST /tasks/:id/clone
   */
  cloneTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/clone`)
      return response.data.task || response.data.data || response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to clone task: ${errorMsg}`,
          `فشل في نسخ المهمة: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Archive Operations ====================

  /**
   * Archive a single task
   * POST /tasks/:id/archive
   */
  archiveTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/archive`)
      return response.data.task || response.data.data || response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to archive task: ${errorMsg}`,
          `فشل في أرشفة المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Unarchive a single task
   * POST /tasks/:id/unarchive
   */
  unarchiveTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/unarchive`)
      return response.data.task || response.data.data || response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to unarchive task: ${errorMsg}`,
          `فشل في إلغاء أرشفة المهمة: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Bulk archive tasks
   * POST /tasks/bulk/archive
   */
  bulkArchive: async (taskIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/tasks/bulk/archive', { taskIds })
      return response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to archive tasks: ${errorMsg}`,
          `فشل في أرشفة المهام: ${errorMsg}`
        )
      )
    }
  },

  /**
   * Bulk unarchive tasks
   * POST /tasks/bulk/unarchive
   */
  bulkUnarchive: async (taskIds: string[]): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.post('/tasks/bulk/unarchive', { taskIds })
      return response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to unarchive tasks: ${errorMsg}`,
          `فشل في إلغاء أرشفة المهام: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Reschedule ====================

  /**
   * Reschedule a task
   * POST /tasks/:id/reschedule
   */
  rescheduleTask: async (taskId: string, dueDate: string, dueTime?: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/reschedule`, { dueDate, dueTime })
      return response.data.task || response.data.data || response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to reschedule task: ${errorMsg}`,
          `فشل في إعادة جدولة المهمة: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Reorder (Drag & Drop) ====================

  /**
   * Reorder tasks (for drag & drop)
   * POST /tasks/reorder
   */
  reorderTasks: async (taskIds: string[]): Promise<void> => {
    try {
      await apiClient.post('/tasks/reorder', { taskIds })
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to reorder tasks: ${errorMsg}`,
          `فشل في إعادة ترتيب المهام: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Select All (Get All IDs) ====================

  /**
   * Get all task IDs matching filters (for select all)
   * GET /tasks/ids
   */
  getAllTaskIds: async (filters?: TaskFilters): Promise<string[]> => {
    try {
      const response = await apiClient.get('/tasks/ids', { params: filters })
      return response.data.ids || response.data.taskIds || response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to get task IDs: ${errorMsg}`,
          `فشل في الحصول على معرفات المهام: ${errorMsg}`
        )
      )
    }
  },

  // ==================== Export with Format ====================

  /**
   * Export tasks with specific format
   * GET /tasks/export?format=csv|excel|pdf|json
   */
  exportTasksWithFormat: async (
    format: 'csv' | 'excel' | 'pdf' | 'json',
    filters?: TaskFilters
  ): Promise<Blob> => {
    try {
      const response = await apiClient.get('/tasks/export', {
        params: { ...filters, format },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(
        bilingualError(
          `Failed to export tasks: ${errorMsg}`,
          `فشل في تصدير المهام: ${errorMsg}`
        )
      )
    }
  },
}

// Task Document interface
export interface TaskDocument {
  _id: string
  fileName: string
  title?: string
  content?: string
  contentJson?: any
  contentFormat?: 'html' | 'tiptap-json' | 'markdown'
  fileUrl?: string
  fileType?: string
  fileSize?: number
  createdBy?: string
  createdAt: string
  updatedAt?: string
}

export default tasksService
