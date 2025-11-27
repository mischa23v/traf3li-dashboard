/**
 * Tasks Service
 * Production-ready task management with Donetick-inspired features
 * Handles all task-related API calls including subtasks, recurring, time tracking
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== ENUMS ====================
 */

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'critical'
export type TaskLabel = 'bug' | 'feature' | 'documentation' | 'enhancement' | 'question' | 'legal' | 'administrative' | 'urgent'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
export type RecurrenceType = 'due_date' | 'completion_date' // From Donetick: based on due date or completion date
export type AssigneeStrategy = 'fixed' | 'round_robin' | 'random' | 'least_assigned' // From Donetick: assignee rotation

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
}

export interface TimeSession {
  _id?: string
  startedAt: string
  endedAt?: string
  duration?: number // in minutes
  userId: string
  notes?: string
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
}

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
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'completed' | 'reopened' | 'commented' | 'attachment_added'
  userId: string
  userName?: string
  timestamp: string
  oldValue?: any
  newValue?: any
  details?: string
}

export interface Task {
  _id: string
  // Basic info
  title: string
  description?: string
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
  // Assignment
  assignedTo?: string | {
    _id: string
    firstName: string
    lastName: string
    email?: string
    avatar?: string
    role?: string
  }
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
  // Features
  subtasks?: Subtask[]
  checklists?: Checklist[]
  timeTracking?: TimeTracking
  recurring?: RecurringConfig
  reminders?: TaskReminder[]
  attachments?: Attachment[]
  comments?: Comment[]
  history?: TaskHistory[]
  // Metadata
  isTemplate?: boolean
  templateId?: string
  points?: number // Gamification (Donetick feature)
  estimatedMinutes?: number
  actualMinutes?: number
  progress?: number // 0-100 calculated from subtasks
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
  status?: TaskStatus
  priority?: TaskPriority
  label?: TaskLabel
  tags?: string[]
  dueDate?: string
  dueTime?: string
  startDate?: string
  assignedTo?: string
  caseId?: string
  clientId?: string
  parentTaskId?: string
  subtasks?: Omit<Subtask, '_id'>[]
  checklists?: Omit<Checklist, '_id'>[]
  recurring?: RecurringConfig
  reminders?: Omit<TaskReminder, '_id' | 'sent' | 'sentAt'>[]
  estimatedMinutes?: number
  isTemplate?: boolean
  templateId?: string
}

/**
 * Task Filters
 */
export interface TaskFilters {
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  label?: TaskLabel
  assignedTo?: string
  createdBy?: string
  caseId?: string
  clientId?: string
  isTemplate?: boolean
  hasSubtasks?: boolean
  isRecurring?: boolean
  overdue?: boolean
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
  tags?: string[]
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'title'
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
  overdue: number
  dueToday: number
  dueThisWeek: number
  completedThisWeek: number
  completedThisMonth: number
  averageCompletionTime?: number // in minutes
  totalTimeTracked?: number // in minutes
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
      console.error('Get tasks error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Get task error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Create task error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Update task error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete task
   */
  deleteTask: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${id}`)
    } catch (error: any) {
      console.error('Delete task error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Update task status error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark task as complete
   */
  completeTask: async (id: string, completionNotes?: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${id}/complete`, { completionNotes })
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Complete task error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Reopen task error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Add subtask error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Update subtask error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle subtask completion
   */
  toggleSubtask: async (taskId: string, subtaskId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`)
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Toggle subtask error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Delete subtask error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Reorder subtasks error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Time Tracking ====================

  /**
   * Start time tracking session
   */
  startTimeTracking: async (taskId: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/time-tracking/start`)
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Start time tracking error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Stop time tracking session
   */
  stopTimeTracking: async (taskId: string, notes?: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/time-tracking/stop`, { notes })
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Stop time tracking error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add manual time entry
   */
  addTimeEntry: async (taskId: string, data: { minutes: number; date: string; notes?: string }): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/time-tracking/manual`, data)
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Add time entry error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get time tracking summary for task
   */
  getTimeTrackingSummary: async (taskId: string): Promise<{ totalMinutes: number; sessions: TimeSession[] }> => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/time-tracking`)
      return response.data
    } catch (error: any) {
      console.error('Get time tracking summary error:', error)
      throw new Error(handleApiError(error))
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
      console.error('Add comment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update comment
   */
  updateComment: async (taskId: string, commentId: string, text: string): Promise<Task> => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/comments/${commentId}`, { text })
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Update comment error:', error)
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
      console.error('Delete comment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Attachments ====================

  /**
   * Upload attachment
   */
  uploadAttachment: async (taskId: string, file: File): Promise<Attachment> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.attachment || response.data.data
    } catch (error: any) {
      console.error('Upload attachment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete attachment
   */
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
    } catch (error: any) {
      console.error('Delete attachment error:', error)
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
      console.error('Get upcoming tasks error:', error)
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
      console.error('Get overdue tasks error:', error)
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
      console.error('Get due today tasks error:', error)
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
      console.error('Get my tasks error:', error)
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
      console.error('Get task stats error:', error)
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
      console.error('Get templates error:', error)
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
      console.error('Create from template error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save task as template
   */
  saveAsTemplate: async (taskId: string, templateName: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/save-as-template`, { name: templateName })
      return response.data.template || response.data.data
    } catch (error: any) {
      console.error('Save as template error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== Bulk Operations ====================

  /**
   * Bulk update tasks
   */
  bulkUpdate: async (taskIds: string[], data: Partial<CreateTaskData>): Promise<BulkOperationResult> => {
    try {
      const response = await apiClient.patch('/tasks/bulk', { taskIds, ...data })
      return response.data
    } catch (error: any) {
      console.error('Bulk update error:', error)
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
      console.error('Bulk delete error:', error)
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
      console.error('Bulk complete error:', error)
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
      console.error('Bulk assign error:', error)
      throw new Error(handleApiError(error))
    }
  },

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
      console.error('Import tasks error:', error)
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
      console.error('Export tasks error:', error)
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
      console.error('Skip recurrence error:', error)
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
      console.error('Stop recurrence error:', error)
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
      console.error('Get recurrence history error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default tasksService
