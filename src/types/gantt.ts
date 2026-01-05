/**
 * Gantt Chart Types
 * Type definitions for Gantt chart view, dependencies, and real-time collaboration
 */

// ═══════════════════════════════════════════════════════════════
// GANTT TASK TYPES
// ═══════════════════════════════════════════════════════════════

export type GanttTaskType = 'task' | 'project' | 'milestone'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'
export type DependencyType = '0' | '1' | '2' | '3' // 0=FS, 1=SS, 2=FF, 3=SF
export type SourceType = 'task' | 'reminder' | 'event'

// DHTMLX Gantt compatible format
export interface GanttTask {
  id: string
  text: string
  start_date: string // 'YYYY-MM-DD HH:mm' format
  end_date?: string
  duration: number // in days
  progress: number // 0-1
  parent?: string // '0' for root tasks
  type: GanttTaskType
  assignee?: string
  assigneeName?: string
  assigneeAvatar?: string
  priority?: TaskPriority
  isCritical?: boolean
  color?: string
  open?: boolean // expanded state
  readonly?: boolean
  // Custom fields
  caseId?: string
  caseName?: string
  originalTaskId?: string
  status?: string
  notes?: string
  // Productivity endpoint fields
  sourceType?: SourceType
  sourceId?: string
}

export interface GanttLink {
  id: number | string
  source: string
  target: string
  type: DependencyType
  lag?: number // days of lag/lead time
  color?: string
}

// Full Gantt data structure (DHTMLX compatible)
export interface GanttData {
  data: GanttTask[]
  links: GanttLink[]
}

// ═══════════════════════════════════════════════════════════════
// MILESTONE TYPES
// ═══════════════════════════════════════════════════════════════

export interface Milestone {
  _id: string
  firmId: string
  caseId: string
  name: string
  date: Date
  description?: string
  status: 'pending' | 'completed' | 'missed'
  linkedTaskIds: string[]
  color?: string
  icon?: string
  notifyBefore?: number // days before to notify
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMilestoneData {
  title: string
  dueDate: Date | string
  caseId?: string
  projectId?: string
  description?: string
  priority?: TaskPriority
  status?: 'pending' | 'completed' | 'missed'
  tags?: string[]
  color?: string
}

// ═══════════════════════════════════════════════════════════════
// BASELINE TYPES
// ═══════════════════════════════════════════════════════════════

export interface Baseline {
  _id: string
  firmId: string
  caseId: string
  name: string
  description?: string
  savedAt: Date
  savedBy: string
  tasks: Array<{
    taskId: string
    startDate: Date
    endDate: Date
    duration: number
  }>
}

export interface CreateBaselineData {
  caseId: string
  name: string
  description?: string
}

// ═══════════════════════════════════════════════════════════════
// CRITICAL PATH TYPES
// ═══════════════════════════════════════════════════════════════

export interface CriticalPathResult {
  criticalTasks: string[] // Task IDs on critical path
  totalDuration: number // Total project duration in days
  projectEndDate: Date
  slack: Array<{
    taskId: string
    taskName: string
    totalSlack: number // days
    freeSlack: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// RESOURCE LOADING TYPES
// ═══════════════════════════════════════════════════════════════

export interface ResourceLoading {
  resourceId: string // Employee ID
  resourceName: string
  avatar?: string
  allocations: Array<{
    taskId: string
    taskName: string
    startDate: Date
    endDate: Date
    hoursPerDay: number
    totalHours: number
  }>
  summary: {
    totalHours: number
    availableHours: number
    utilizationRate: number
    overallocatedDays: number
  }
}

export interface ResourceWorkload {
  date: string
  allocatedHours: number
  availableHours: number
  tasks: Array<{
    taskId: string
    taskName: string
    hours: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE TYPES
// ═══════════════════════════════════════════════════════════════

export interface UpdateScheduleData {
  startDate?: Date
  endDate?: Date
  duration?: number
  progress?: number
}

export interface AddDependencyData {
  targetTaskId: string
  type: DependencyType
  lag?: number
}

export interface AutoScheduleOptions {
  startDate?: Date | string
}

export interface AutoScheduleResult {
  success: boolean
  tasksUpdated: number
  newEndDate: Date
  changes: Array<{
    taskId: string
    oldStartDate: Date
    newStartDate: Date
    oldEndDate: Date
    newEndDate: Date
    reason: string
  }>
}

// ═══════════════════════════════════════════════════════════════
// GANTT VIEW OPTIONS
// ═══════════════════════════════════════════════════════════════

export type TimeScale = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface GanttViewOptions {
  timeScale: TimeScale
  showCriticalPath: boolean
  showBaseline: boolean
  showProgress: boolean
  showDependencies: boolean
  showMilestones: boolean
  showResources: boolean
  groupBy?: 'none' | 'assignee' | 'priority' | 'status'
  filterAssignee?: string[]
  filterStatus?: string[]
  filterPriority?: TaskPriority[]
}

// ═══════════════════════════════════════════════════════════════
// REAL-TIME COLLABORATION TYPES
// ═══════════════════════════════════════════════════════════════

export interface ActiveUser {
  id: string
  name: string
  avatar?: string
  color: string
  joinedAt: Date
}

export interface CursorPosition {
  userId: string
  userName: string
  color: string
  x: number
  y: number
  element?: string // Element being hovered
}

export interface EntityLock {
  entityType: 'task' | 'case' | 'document'
  entityId: string
  field?: string
  lockedBy: {
    id: string
    name: string
    avatar?: string
  }
  lockedAt: Date
  expiresAt: Date
}

// Socket.io event payloads
export interface JoinEntityPayload {
  entityType: string
  entityId: string
}

export interface PresenceJoinPayload {
  entityType: string
  entityId: string
  user: {
    id: string
    name: string
    avatar?: string
  }
}

export interface CursorMovePayload {
  entityType: string
  entityId: string
  position: { x: number; y: number }
  element?: string
}

export interface LockAcquirePayload {
  entityType: string
  entityId: string
  field?: string
}

export interface GanttTaskUpdatePayload {
  taskId: string
  changes: Partial<GanttTask>
}

export interface GanttLinkAddPayload {
  link: GanttLink
}

export interface GanttLinkRemovePayload {
  linkId: string
}

// Socket event types
export type SocketEvent =
  | 'join:entity'
  | 'leave:entity'
  | 'presence:join'
  | 'presence:leave'
  | 'presence:users'
  | 'cursor:move'
  | 'cursor:update'
  | 'lock:acquire'
  | 'lock:release'
  | 'lock:status'
  | 'lock:denied'
  | 'entity:updated'
  | 'gantt:task:updated'
  | 'gantt:task:added'
  | 'gantt:task:deleted'
  | 'gantt:link:added'
  | 'gantt:link:removed'

// ═══════════════════════════════════════════════════════════════
// PRODUCTIVITY GANTT TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProductivitySummary {
  totalItems: number
  tasks: {
    total: number
    completed: number
    inProgress: number
    overdue: number
  }
  reminders: {
    total: number
    pending: number
    completed: number
  }
  events: {
    total: number
    upcoming: number
    completed: number
  }
}

export interface ProductivityCollections {
  priorities: string[]
  types: string[]
  statuses: Record<string, string[]>
}

export interface ProductivityResponse {
  success: boolean
  data: GanttTask[]
  links: GanttLink[]
  collections: ProductivityCollections
  summary: ProductivitySummary
}

export interface ProductivityFilters {
  startDate?: string
  endDate?: string
}
