/**
 * Automated Action Service
 *
 * ⚠️ BACKEND STATUS: NOT IMPLEMENTED
 *
 * This service defines the frontend API client for automated actions/workflows.
 * The backend endpoints are NOT YET IMPLEMENTED. This is frontend-ready code
 * awaiting backend development.
 *
 * Expected endpoints:
 * - GET /automated-actions
 * - POST /automated-actions
 * - POST /automated-actions/:id/toggle
 * - POST /automated-actions/:id/test
 * - etc.
 */

import apiClient from '@/lib/api'
import type {
  AutomatedAction,
  AutomatedActionFilters,
  AutomatedActionResponse,
  CreateAutomatedActionData,
  UpdateAutomatedActionData,
  AutomatedActionLog,
  AutomatedActionLogFilters,
  TestActionData,
  TestActionResult,
  AvailableModel,
  ModelField,
} from '@/types/automatedAction'

// ==================== AUTOMATED ACTIONS ====================

/**
 * Get all automated actions
 */
export const getAutomatedActions = async (
  filters?: AutomatedActionFilters
): Promise<AutomatedActionResponse> => {
  const params = new URLSearchParams()

  if (filters?.model_name) params.append('model_name', filters.model_name)
  if (filters?.trigger) params.append('trigger', filters.trigger)
  if (filters?.action_type) params.append('action_type', filters.action_type)
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await apiClient.get(`/automated-actions?${params.toString()}`)
  return response.data
}

/**
 * Get a single automated action by ID
 */
export const getAutomatedActionById = async (id: string): Promise<AutomatedAction> => {
  const response = await apiClient.get(`/automated-actions/${id}`)
  return response.data?.data || response.data
}

/**
 * Create a new automated action
 */
export const createAutomatedAction = async (
  data: CreateAutomatedActionData
): Promise<AutomatedAction> => {
  const response = await apiClient.post('/automated-actions', data)
  return response.data?.data || response.data
}

/**
 * Update an automated action
 */
export const updateAutomatedAction = async (
  id: string,
  data: UpdateAutomatedActionData
): Promise<AutomatedAction> => {
  const response = await apiClient.patch(`/automated-actions/${id}`, data)
  return response.data?.data || response.data
}

/**
 * Delete an automated action
 */
export const deleteAutomatedAction = async (id: string): Promise<void> => {
  await apiClient.delete(`/automated-actions/${id}`)
}

/**
 * Toggle automated action active status
 */
export const toggleAutomatedAction = async (id: string): Promise<AutomatedAction> => {
  const response = await apiClient.post(`/automated-actions/${id}/toggle`)
  return response.data?.data || response.data
}

/**
 * Test an automated action against a record
 */
export const testAutomatedAction = async (
  id: string,
  data: TestActionData
): Promise<TestActionResult> => {
  const response = await apiClient.post(`/automated-actions/${id}/test`, data)
  return response.data?.data || response.data
}

/**
 * Duplicate an automated action
 */
export const duplicateAutomatedAction = async (id: string): Promise<AutomatedAction> => {
  const response = await apiClient.post(`/automated-actions/${id}/duplicate`)
  return response.data?.data || response.data
}

// ==================== EXECUTION LOGS ====================

/**
 * Get execution logs for an automated action
 */
export const getAutomatedActionLogs = async (
  actionId: string,
  filters?: Omit<AutomatedActionLogFilters, 'action_id'>
): Promise<{ logs: AutomatedActionLog[]; total: number; hasMore: boolean }> => {
  const params = new URLSearchParams()
  params.append('action_id', actionId)

  if (filters?.model_name) params.append('model_name', filters.model_name)
  if (filters?.record_id) params.append('record_id', filters.record_id)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await apiClient.get(`/automated-actions/${actionId}/logs?${params.toString()}`)
  return response.data?.data || response.data
}

/**
 * Get all execution logs (admin view)
 */
export const getAllActionLogs = async (
  filters?: AutomatedActionLogFilters
): Promise<{ logs: AutomatedActionLog[]; total: number; hasMore: boolean }> => {
  const params = new URLSearchParams()

  if (filters?.action_id) params.append('action_id', filters.action_id)
  if (filters?.model_name) params.append('model_name', filters.model_name)
  if (filters?.record_id) params.append('record_id', filters.record_id)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.date_from) params.append('date_from', filters.date_from)
  if (filters?.date_to) params.append('date_to', filters.date_to)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const response = await apiClient.get(`/automated-actions/logs?${params.toString()}`)
  return response.data?.data || response.data
}

// ==================== MODEL METADATA ====================

/**
 * Get available models for automation
 */
export const getAvailableModels = async (): Promise<AvailableModel[]> => {
  const response = await apiClient.get('/automated-actions/models')
  return response.data?.data || response.data
}

/**
 * Get fields for a specific model
 */
export const getModelFields = async (modelName: string): Promise<ModelField[]> => {
  const response = await apiClient.get(`/automated-actions/models/${modelName}/fields`)
  return response.data?.data || response.data
}

// ==================== BULK OPERATIONS ====================

/**
 * Enable multiple automated actions
 */
export const enableAutomatedActions = async (ids: string[]): Promise<void> => {
  await apiClient.post('/automated-actions/bulk/enable', { ids })
}

/**
 * Disable multiple automated actions
 */
export const disableAutomatedActions = async (ids: string[]): Promise<void> => {
  await apiClient.post('/automated-actions/bulk/disable', { ids })
}

/**
 * Delete multiple automated actions
 */
export const deleteAutomatedActions = async (ids: string[]): Promise<void> => {
  await apiClient.post('/automated-actions/bulk/delete', { ids })
}

// ==================== SERVICE OBJECT ====================

const automatedActionService = {
  // CRUD
  getAutomatedActions,
  getAutomatedActionById,
  createAutomatedAction,
  updateAutomatedAction,
  deleteAutomatedAction,

  // Status management
  toggleAutomatedAction,
  testAutomatedAction,
  duplicateAutomatedAction,

  // Logs
  getAutomatedActionLogs,
  getAllActionLogs,

  // Metadata
  getAvailableModels,
  getModelFields,

  // Bulk operations
  enableAutomatedActions,
  disableAutomatedActions,
  deleteAutomatedActions,
}

export default automatedActionService
