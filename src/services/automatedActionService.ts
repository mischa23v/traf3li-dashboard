/**
 * Automated Action Service
 * Handles all automated action API calls
 * Base route: /api/automated-actions
 *
 * Backend Routes (IMPLEMENTED):
 * ✅ GET    /automated-actions                    - List all actions
 * ✅ GET    /automated-actions/:id                - Get single action
 * ✅ POST   /automated-actions                    - Create action
 * ✅ PUT    /automated-actions/:id                - Update action
 * ✅ DELETE /automated-actions/:id                - Delete action
 * ✅ POST   /automated-actions/:id/toggle         - Toggle active status
 * ✅ POST   /automated-actions/:id/test           - Test action
 * ✅ POST   /automated-actions/:id/duplicate      - Duplicate action
 * ✅ GET    /automated-actions/logs               - Get all execution logs
 * ✅ GET    /automated-actions/:id/logs           - Get action's logs
 * ✅ GET    /automated-actions/models             - Get available models
 * ✅ GET    /automated-actions/models/:name/fields - Get model fields
 * ✅ POST   /automated-actions/bulk/enable        - Bulk enable
 * ✅ POST   /automated-actions/bulk/disable       - Bulk disable
 * ✅ DELETE /automated-actions/bulk               - Bulk delete
 */

import { apiClient } from '@/lib/api'
import { handleApiError } from '@/lib/api'
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
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * GET /api/automated-actions
 */
export const getAutomatedActions = async (
  filters?: AutomatedActionFilters
): Promise<AutomatedActionResponse> => {
  try {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }
    const response = await apiClient.get(`/automated-actions?${params.toString()}`)
    return response.data
  } catch (error: any) {
    throw new Error(
      `Failed to fetch automated actions | فشل جلب الإجراءات التلقائية: ${handleApiError(error)}`
    )
  }
}

/**
 * Get a single automated action by ID
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * GET /api/automated-actions/:id
 */
export const getAutomatedActionById = async (id: string): Promise<AutomatedAction> => {
  try {
    const response = await apiClient.get(`/automated-actions/${id}`)
    return response.data.action || response.data
  } catch (error: any) {
    throw new Error(
      `Failed to fetch automated action | فشل جلب الإجراء التلقائي: ${handleApiError(error)}`
    )
  }
}

/**
 * Create a new automated action
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * POST /api/automated-actions
 */
export const createAutomatedAction = async (
  data: CreateAutomatedActionData
): Promise<AutomatedAction> => {
  try {
    const response = await apiClient.post('/automated-actions', data)
    return response.data.action || response.data
  } catch (error: any) {
    throw new Error(
      `Failed to create automated action | فشل إنشاء الإجراء التلقائي: ${handleApiError(error)}`
    )
  }
}

/**
 * Update an automated action
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * PUT /api/automated-actions/:id
 */
export const updateAutomatedAction = async (
  id: string,
  data: UpdateAutomatedActionData
): Promise<AutomatedAction> => {
  try {
    const response = await apiClient.put(`/automated-actions/${id}`, data)
    return response.data.action || response.data
  } catch (error: any) {
    throw new Error(
      `Failed to update automated action | فشل تحديث الإجراء التلقائي: ${handleApiError(error)}`
    )
  }
}

/**
 * Delete an automated action
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * DELETE /api/automated-actions/:id
 */
export const deleteAutomatedAction = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/automated-actions/${id}`)
  } catch (error: any) {
    throw new Error(
      `Failed to delete automated action | فشل حذف الإجراء التلقائي: ${handleApiError(error)}`
    )
  }
}

/**
 * Toggle automated action active status
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * POST /api/automated-actions/:id/toggle
 */
export const toggleAutomatedAction = async (id: string): Promise<AutomatedAction> => {
  try {
    const response = await apiClient.post(`/automated-actions/${id}/toggle`)
    return response.data.action || response.data
  } catch (error: any) {
    throw new Error(
      `Failed to toggle automated action | فشل تبديل الإجراء التلقائي: ${handleApiError(error)}`
    )
  }
}

/**
 * Test an automated action against a record
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * POST /api/automated-actions/:id/test
 */
export const testAutomatedAction = async (
  id: string,
  data: TestActionData
): Promise<TestActionResult> => {
  try {
    const response = await apiClient.post(`/automated-actions/${id}/test`, data)
    return response.data
  } catch (error: any) {
    throw new Error(
      `Failed to test automated action | فشل اختبار الإجراء التلقائي: ${handleApiError(error)}`
    )
  }
}

/**
 * Duplicate an automated action
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * POST /api/automated-actions/:id/duplicate
 */
export const duplicateAutomatedAction = async (id: string): Promise<AutomatedAction> => {
  try {
    const response = await apiClient.post(`/automated-actions/${id}/duplicate`)
    return response.data.action || response.data
  } catch (error: any) {
    throw new Error(
      `Failed to duplicate automated action | فشل نسخ الإجراء التلقائي: ${handleApiError(error)}`
    )
  }
}

// ==================== EXECUTION LOGS ====================

/**
 * Get execution logs for an automated action
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * GET /api/automated-actions/:id/logs
 */
export const getAutomatedActionLogs = async (
  actionId: string,
  filters?: Omit<AutomatedActionLogFilters, 'action_id'>
): Promise<{ logs: AutomatedActionLog[]; total: number; hasMore: boolean }> => {
  try {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const response = await apiClient.get(`/automated-actions/${actionId}/logs?${params.toString()}`)
    return response.data
  } catch (error: any) {
    throw new Error(
      `Failed to fetch action logs | فشل جلب سجلات الإجراء: ${handleApiError(error)}`
    )
  }
}

/**
 * Get all execution logs (admin view)
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * GET /api/automated-actions/logs
 */
export const getAllActionLogs = async (
  filters?: AutomatedActionLogFilters
): Promise<{ logs: AutomatedActionLog[]; total: number; hasMore: boolean }> => {
  try {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const response = await apiClient.get(`/automated-actions/logs?${params.toString()}`)
    return response.data
  } catch (error: any) {
    throw new Error(
      `Failed to fetch all action logs | فشل جلب جميع سجلات الإجراءات: ${handleApiError(error)}`
    )
  }
}

// ==================== MODEL METADATA ====================

/**
 * Get available models for automation
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * GET /api/automated-actions/models
 */
export const getAvailableModels = async (): Promise<AvailableModel[]> => {
  try {
    const response = await apiClient.get('/automated-actions/models')
    return response.data.models || response.data
  } catch (error: any) {
    throw new Error(
      `Failed to fetch available models | فشل جلب النماذج المتاحة: ${handleApiError(error)}`
    )
  }
}

/**
 * Get fields for a specific model
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * GET /api/automated-actions/models/:name/fields
 */
export const getModelFields = async (modelName: string): Promise<ModelField[]> => {
  try {
    const response = await apiClient.get(`/automated-actions/models/${modelName}/fields`)
    return response.data.fields || response.data
  } catch (error: any) {
    throw new Error(
      `Failed to fetch model fields | فشل جلب حقول النموذج: ${handleApiError(error)}`
    )
  }
}

// ==================== BULK OPERATIONS ====================

/**
 * Enable multiple automated actions
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * POST /api/automated-actions/bulk/enable
 */
export const enableAutomatedActions = async (ids: string[]): Promise<{ success: boolean; enabled: number }> => {
  try {
    const response = await apiClient.post('/automated-actions/bulk/enable', { ids })
    return response.data
  } catch (error: any) {
    throw new Error(
      `Failed to enable automated actions | فشل تفعيل الإجراءات التلقائية: ${handleApiError(error)}`
    )
  }
}

/**
 * Disable multiple automated actions
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * POST /api/automated-actions/bulk/disable
 */
export const disableAutomatedActions = async (ids: string[]): Promise<{ success: boolean; disabled: number }> => {
  try {
    const response = await apiClient.post('/automated-actions/bulk/disable', { ids })
    return response.data
  } catch (error: any) {
    throw new Error(
      `Failed to disable automated actions | فشل تعطيل الإجراءات التلقائية: ${handleApiError(error)}`
    )
  }
}

/**
 * Delete multiple automated actions
 * ✅ ENDPOINT IMPLEMENTED IN BACKEND
 * DELETE /api/automated-actions/bulk
 */
export const deleteAutomatedActions = async (ids: string[]): Promise<{ success: boolean; deleted: number }> => {
  try {
    const response = await apiClient.delete('/automated-actions/bulk', { data: { ids } })
    return response.data
  } catch (error: any) {
    throw new Error(
      `Failed to delete automated actions | فشل حذف الإجراءات التلقائية: ${handleApiError(error)}`
    )
  }
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
