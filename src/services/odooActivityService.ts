/**
 * Odoo-style Activity Service
 * API service for scheduling and managing activities (based on Odoo mail.activity)
 *
 * @important API Design Patterns:
 * - This service uses QUERY PARAMETERS for filtering, NOT path parameters
 * - Example: GET /activities?res_model=crm.lead&res_id=123 (NOT /activities/crm.lead/123)
 * - Overdue activities: Use GET /activities?is_overdue=true (NOT /activities/overdue)
 *
 * @endpoints
 * - GET /activities - List activities with query parameter filters
 * - GET /activities/my - Current user's activities
 * - GET /activities/stats - Activity statistics
 * - GET /activities/:id - Single activity by ID
 * - POST /activities - Create new activity
 * - PATCH /activities/:id - Update activity
 * - POST /activities/:id/done - Mark as done
 * - POST /activities/:id/cancel - Cancel activity
 * - PATCH /activities/:id/reschedule - Reschedule activity
 * - PATCH /activities/:id/reassign - Reassign to another user
 * - DELETE /activities/:id - Delete activity
 *
 * - GET /activities/types - List activity types
 * - POST /activities/types - Create activity type
 * - PATCH /activities/types/:id - Update activity type
 * - DELETE /activities/types/:id - Delete activity type
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
 *
 * @endpoint GET /activities/types
 * @returns Array of activity types
 */
export const getActivityTypes = async (): Promise<OdooActivityType[]> => {
  const response = await apiClient.get('/activities/types')
  return response.data?.data || response.data
}

/**
 * Create a new activity type
 *
 * @endpoint POST /activities/types
 * @param data - Activity type data
 * @returns Created activity type
 */
export const createActivityType = async (
  data: CreateOdooActivityTypeData
): Promise<OdooActivityType> => {
  const response = await apiClient.post('/activities/types', data)
  return response.data?.data || response.data
}

/**
 * Update an activity type
 *
 * @endpoint PATCH /activities/types/:id
 * @param id - Activity type ID
 * @param data - Partial activity type data to update
 * @returns Updated activity type
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
 *
 * @endpoint DELETE /activities/types/:id
 * @param id - Activity type ID
 */
export const deleteActivityType = async (id: string): Promise<void> => {
  await apiClient.delete(`/activities/types/${id}`)
}

// ==================== ACTIVITIES ====================

/**
 * Schedule a new activity
 *
 * @endpoint POST /activities
 * @param data - Activity data (summary, res_model, res_id, activity_type_id, etc.)
 * @returns Created activity
 */
export const scheduleActivity = async (
  data: CreateOdooActivityData
): Promise<OdooActivity> => {
  const response = await apiClient.post('/activities', data)
  return response.data?.data || response.data
}

/**
 * Get activities with filters
 *
 * @endpoint GET /activities
 * @important Uses QUERY PARAMETERS for filtering, NOT path parameters
 *
 * @param filters - Optional filter object
 * @param filters.res_model - Filter by resource model (e.g., 'crm.lead', 'hr.employee')
 * @param filters.res_id - Filter by resource ID
 * @param filters.activity_type_id - Filter by activity type
 * @param filters.user_id - Filter by assigned user
 * @param filters.state - Filter by state(s): 'overdue', 'today', 'planned', 'done'
 * @param filters.date_from - Filter by date range start
 * @param filters.date_to - Filter by date range end
 * @param filters.is_overdue - Filter overdue activities (use this instead of /activities/overdue)
 * @param filters.search - Search text in summary/notes
 * @param filters.sortBy - Sort field
 * @param filters.sortOrder - Sort direction ('asc' or 'desc')
 * @param filters.page - Page number for pagination
 * @param filters.limit - Items per page
 *
 * @returns Paginated activity response
 *
 * @example
 * // Get activities for a specific lead
 * getActivities({ res_model: 'crm.lead', res_id: '123' })
 *
 * @example
 * // Get overdue activities (NOTE: Use is_overdue filter, NOT /activities/overdue endpoint)
 * getActivities({ is_overdue: true })
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
 *
 * @endpoint GET /activities/my
 * @param filters - Optional filters (state, date_from, date_to, page, limit)
 * @returns Paginated activity response for current user
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
 *
 * @endpoint GET /activities/stats
 * @returns Activity statistics (count by state, overdue count, etc.)
 */
export const getActivityStats = async (): Promise<OdooActivityStats> => {
  const response = await apiClient.get('/activities/stats')
  return response.data?.data || response.data
}

/**
 * Get a single activity by ID
 *
 * @endpoint GET /activities/:id
 * @param id - Activity ID
 * @returns Single activity
 */
export const getActivityById = async (id: string): Promise<OdooActivity> => {
  const response = await apiClient.get(`/activities/${id}`)
  return response.data?.data || response.data
}

/**
 * Get activities for a specific record
 *
 * @endpoint GET /activities
 * @important Uses QUERY PARAMETERS: /activities?res_model=X&res_id=Y
 * @important NOT path parameters like /activities/:resModel/:resId
 *
 * @param resModel - Resource model (e.g., 'crm.lead', 'hr.employee')
 * @param resId - Resource ID
 * @param state - Optional state filter
 * @returns Array of activities for the record
 *
 * @example
 * // Get all activities for lead with ID 123
 * getRecordActivities('crm.lead', '123')
 *
 * @example
 * // Get only planned activities for an employee
 * getRecordActivities('hr.employee', '456', 'planned')
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
 *
 * @endpoint PATCH /activities/:id
 * @param id - Activity ID
 * @param data - Activity data to update
 * @returns Updated activity
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
 *
 * @endpoint POST /activities/:id/done
 * @param id - Activity ID
 * @param data - Optional feedback/notes when marking done
 * @returns Updated activity
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
 *
 * @endpoint POST /activities/:id/cancel
 * @param id - Activity ID
 * @returns Cancelled activity
 */
export const cancelActivity = async (id: string): Promise<OdooActivity> => {
  const response = await apiClient.post(`/activities/${id}/cancel`)
  return response.data?.data || response.data
}

/**
 * Reschedule an activity
 *
 * @endpoint PATCH /activities/:id/reschedule
 * @param id - Activity ID
 * @param data - New date_deadline and optional note
 * @returns Rescheduled activity
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
 *
 * @endpoint PATCH /activities/:id/reassign
 * @param id - Activity ID
 * @param data - New user_id and optional note
 * @returns Reassigned activity
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
 *
 * @endpoint DELETE /activities/:id
 * @param id - Activity ID
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
