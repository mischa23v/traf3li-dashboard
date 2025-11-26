import api from './api'

// Follow-up types
export const followupTypes = [
  'call',
  'email',
  'meeting',
  'court_date',
  'document_deadline',
  'payment_reminder',
  'general',
] as const

export type FollowupType = (typeof followupTypes)[number]

// Follow-up statuses
export const followupStatuses = ['pending', 'completed', 'cancelled', 'rescheduled'] as const

export type FollowupStatus = (typeof followupStatuses)[number]

// Follow-up priority
export const followupPriorities = ['low', 'medium', 'high', 'urgent'] as const

export type FollowupPriority = (typeof followupPriorities)[number]

// Entity types that can have follow-ups
export type FollowupEntityType = 'case' | 'client' | 'contact' | 'organization'

// Follow-up interface
export interface Followup {
  _id: string
  lawyerId: string
  title: string
  description?: string
  type: FollowupType
  status: FollowupStatus
  priority: FollowupPriority
  dueDate: string
  dueTime?: string
  entityType: FollowupEntityType
  entityId: string
  entity?: {
    _id: string
    name?: string
    fullName?: string
    caseNumber?: string
    title?: string
  }
  assignedTo?: string | {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  completedAt?: string
  completedBy?: string | {
    _id: string
    firstName: string
    lastName: string
  }
  completionNotes?: string
  recurring?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
    endDate?: string
  }
  remindBefore?: number // minutes before due date
  history: FollowupHistoryEntry[]
  createdAt: string
  updatedAt: string
}

// Follow-up history entry
export interface FollowupHistoryEntry {
  _id: string
  action: 'created' | 'updated' | 'completed' | 'cancelled' | 'rescheduled' | 'note_added'
  note?: string
  previousDueDate?: string
  newDueDate?: string
  performedBy: string | {
    _id: string
    firstName: string
    lastName: string
  }
  performedAt: string
}

// Filters
export interface FollowupFilters {
  type?: string
  status?: string
  priority?: string
  entityType?: string
  entityId?: string
  assignedTo?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// Create follow-up data
export interface CreateFollowupData {
  title: string
  description?: string
  type: FollowupType
  priority?: FollowupPriority
  dueDate: string
  dueTime?: string
  entityType: FollowupEntityType
  entityId: string
  assignedTo?: string
  recurring?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
    endDate?: string
  }
  remindBefore?: number
}

// Update follow-up data
export interface UpdateFollowupData extends Partial<CreateFollowupData> {
  status?: FollowupStatus
  completionNotes?: string
}

// Response types
export interface FollowupsResponse {
  data: Followup[]
  total: number
  page: number
  limit: number
}

// Stats
export interface FollowupStats {
  total: number
  pending: number
  completed: number
  overdue: number
  dueToday: number
  dueThisWeek: number
  byType: { type: FollowupType; count: number }[]
  byPriority: { priority: FollowupPriority; count: number }[]
}

const followupsService = {
  // Get all follow-ups
  getFollowups: async (filters?: FollowupFilters): Promise<FollowupsResponse> => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.entityType) params.append('entityType', filters.entityType)
    if (filters?.entityId) params.append('entityId', filters.entityId)
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/followups?${params.toString()}`)
    return response.data
  },

  // Get single follow-up
  getFollowup: async (id: string): Promise<Followup> => {
    const response = await api.get(`/followups/${id}`)
    return response.data
  },

  // Create follow-up
  createFollowup: async (data: CreateFollowupData): Promise<Followup> => {
    const response = await api.post('/followups', data)
    return response.data
  },

  // Update follow-up
  updateFollowup: async (id: string, data: UpdateFollowupData): Promise<Followup> => {
    const response = await api.patch(`/followups/${id}`, data)
    return response.data
  },

  // Delete follow-up
  deleteFollowup: async (id: string): Promise<void> => {
    await api.delete(`/followups/${id}`)
  },

  // Get follow-ups for entity
  getFollowupsForEntity: async (
    entityType: FollowupEntityType,
    entityId: string
  ): Promise<Followup[]> => {
    const response = await api.get(`/followups/entity/${entityType}/${entityId}`)
    return response.data
  },

  // Get follow-up stats
  getFollowupStats: async (): Promise<FollowupStats> => {
    const response = await api.get('/followups/stats')
    return response.data
  },

  // Get overdue follow-ups
  getOverdueFollowups: async (): Promise<Followup[]> => {
    const response = await api.get('/followups/overdue')
    return response.data
  },

  // Get upcoming follow-ups
  getUpcomingFollowups: async (days: number = 7): Promise<Followup[]> => {
    const response = await api.get(`/followups/upcoming?days=${days}`)
    return response.data
  },

  // Get today's follow-ups
  getTodayFollowups: async (): Promise<Followup[]> => {
    const response = await api.get('/followups/today')
    return response.data
  },

  // Complete follow-up
  completeFollowup: async (
    id: string,
    notes?: string
  ): Promise<Followup> => {
    const response = await api.post(`/followups/${id}/complete`, { notes })
    return response.data
  },

  // Cancel follow-up
  cancelFollowup: async (
    id: string,
    reason?: string
  ): Promise<Followup> => {
    const response = await api.post(`/followups/${id}/cancel`, { reason })
    return response.data
  },

  // Reschedule follow-up
  rescheduleFollowup: async (
    id: string,
    newDueDate: string,
    newDueTime?: string,
    reason?: string
  ): Promise<Followup> => {
    const response = await api.post(`/followups/${id}/reschedule`, {
      newDueDate,
      newDueTime,
      reason,
    })
    return response.data
  },

  // Add note to follow-up
  addFollowupNote: async (
    id: string,
    note: string
  ): Promise<Followup> => {
    const response = await api.post(`/followups/${id}/notes`, { note })
    return response.data
  },

  // Bulk complete follow-ups
  bulkCompleteFollowups: async (ids: string[]): Promise<void> => {
    await api.post('/followups/bulk-complete', { ids })
  },

  // Bulk delete follow-ups
  bulkDeleteFollowups: async (ids: string[]): Promise<void> => {
    await api.post('/followups/bulk-delete', { ids })
  },
}

export default followupsService
