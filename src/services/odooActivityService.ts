/**
 * Odoo-style Activity Service
 * API service for scheduling and managing activities (based on Odoo mail.activity)
 */

import apiClient from '@/lib/api'
import type {
  OdooActivity,
  OdooActivityType,
  OdooActivityStats,
  OdooActivityFilters,
  OdooActivityResponse,
  CreateOdooActivityData,
  UpdateOdooActivityData,
  CreateOdooActivityTypeData,
  MarkActivityDoneData,
  RescheduleActivityData,
  ReassignActivityData,
  OdooActivityResModel,
} from '@/types/activity'

// ==================== ACTIVITY TYPES ====================

/**
 * Get all activity types
 */
export const getActivityTypes = async (): Promise<OdooActivityType[]> => {
  const response = await apiClient.get('/activities/types')
  return response.data?.data || response.data
}

/**
 * Create a new activity type
 */
export const createActivityType = async (
  data: CreateOdooActivityTypeData
): Promise<OdooActivityType> => {
  const response = await apiClient.post('/activities/types', data)
  return response.data?.data || response.data
}

/**
 * Update an activity type
 */
export const updateActivityType = async (
  id: string,
  data: Partial<CreateOdooActivityTypeData>
): Promise<OdooActivityType> => {
  const response = await apiClient.patch(`/activities/types/${id}`, data)
  return response.data?.data || response.data
}

/**
 * Delete an activity type
 */
export const deleteActivityType = async (id: string): Promise<void> => {
  await apiClient.delete(`/activities/types/${id}`)
}

// ==================== ACTIVITIES ====================

/**
 * Schedule a new activity
 */
export const scheduleActivity = async (
  data: CreateOdooActivityData
): Promise<OdooActivity> => {
  const response = await apiClient.post('/activities', data)
  return response.data?.data || response.data
}

/**
 * Get activities with filters
 */
export const getActivities = async (
  filters?: OdooActivityFilters
): Promise<OdooActivityResponse> => {
  const params = new URLSearchParams()

  if (filters?.res_model) params.append('res_model', filters.res_model)
  if (filters?.res_id) params.append('res_id', filters.res_id)
  if (filters?.activity_type_id) params.append('activity_type_id', filters.activity_type_id)
  if (filters?.user_id) params.append('user_id', filters.user_id)
  if (filters?.state) {
    if (Array.isArray(filters.state)) {
      filters.state.forEach((s) => params.append('state', s))
    } else {
      params.append('state', filters.state)
    }
  }
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.is_overdue !== undefined) params.append('is_overdue', String(filters.is_overdue))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await apiClient.get(`/activities?${params.toString()}`)
  return response.data
}

/**
 * Get current user's activities
 */
export const getMyActivities = async (
  filters?: Pick<OdooActivityFilters, 'state' | 'date_from' | 'date_to' | 'page' | 'limit'>
): Promise<OdooActivityResponse> => {
  const params = new URLSearchParams()

  if (filters?.state) {
    if (Array.isArray(filters.state)) {
      params.append('state', filters.state.join(','))
    } else {
      params.append('state', filters.state)
    }
  }
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await apiClient.get(`/activities/my?${params.toString()}`)
  return response.data
}

/**
 * Get activity statistics
 */
export const getActivityStats = async (): Promise<OdooActivityStats> => {
  const response = await apiClient.get('/activities/stats')
  return response.data?.data || response.data
}

/**
 * Get a single activity by ID
 */
export const getActivityById = async (id: string): Promise<OdooActivity> => {
  const response = await apiClient.get(`/activities/${id}`)
  return response.data?.data || response.data
}

/**
 * Get activities for a specific record
 */
export const getRecordActivities = async (
  resModel: OdooActivityResModel,
  resId: string,
  state?: string
): Promise<OdooActivity[]> => {
  const params = new URLSearchParams()
  params.append('res_model', resModel)
  params.append('res_id', resId)
  if (state) params.append('state', state)

  const response = await apiClient.get(`/activities?${params.toString()}`)
  return response.data?.activities || response.data?.data || []
}

/**
 * Update an activity
 */
export const updateActivity = async (
  id: string,
  data: UpdateOdooActivityData
): Promise<OdooActivity> => {
  const response = await apiClient.patch(`/activities/${id}`, data)
  return response.data?.data || response.data
}

/**
 * Mark activity as done
 */
export const markActivityDone = async (
  id: string,
  data?: MarkActivityDoneData
): Promise<OdooActivity> => {
  const response = await apiClient.post(`/activities/${id}/done`, data || {})
  return response.data?.data || response.data
}

/**
 * Cancel an activity
 */
export const cancelActivity = async (id: string): Promise<OdooActivity> => {
  const response = await apiClient.post(`/activities/${id}/cancel`)
  return response.data?.data || response.data
}

/**
 * Reschedule an activity
 */
export const rescheduleActivity = async (
  id: string,
  data: RescheduleActivityData
): Promise<OdooActivity> => {
  const response = await apiClient.patch(`/activities/${id}/reschedule`, data)
  return response.data?.data || response.data
}

/**
 * Reassign an activity to another user
 */
export const reassignActivity = async (
  id: string,
  data: ReassignActivityData
): Promise<OdooActivity> => {
  const response = await apiClient.patch(`/activities/${id}/reassign`, data)
  return response.data?.data || response.data
}

/**
 * Delete an activity
 */
export const deleteActivity = async (id: string): Promise<void> => {
  await apiClient.delete(`/activities/${id}`)
}

// ==================== SERVICE OBJECT ====================

const odooActivityService = {
  // Activity Types
  getActivityTypes,
  createActivityType,
  updateActivityType,
  deleteActivityType,

  // Activities
  scheduleActivity,
  getActivities,
  getMyActivities,
  getActivityStats,
  getActivityById,
  getRecordActivities,
  updateActivity,
  markActivityDone,
  cancelActivity,
  rescheduleActivity,
  reassignActivity,
  deleteActivity,
}

export default odooActivityService
