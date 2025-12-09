/**
 * Workflow Service
 * Handles all workflow API calls matching the backend API
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface WorkflowStage {
  _id?: string
  name: string
  order: number
  description?: string
  requirements?: Array<{
    _id?: string
    name: string
    description?: string
    required: boolean
    type?: 'document' | 'approval' | 'action' | 'other'
  }>
  automated?: boolean
  notifyUsers?: string[]
  deadlineDays?: number
}

export interface WorkflowTransition {
  _id?: string
  fromStage: string
  toStage: string
  condition?: string
  automated?: boolean
}

export interface Workflow {
  _id?: string
  name: string
  description?: string
  category: 'case' | 'hr' | 'finance' | 'general'
  stages: WorkflowStage[]
  transitions?: WorkflowTransition[]
  firmId?: string
  isActive?: boolean
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface WorkflowPreset {
  type: string
  name: string
  description: string
  category: string
  stages: WorkflowStage[]
}

export interface CaseProgress {
  caseId: string
  workflowId: string
  currentStage: string
  stages: Array<{
    stageId: string
    name: string
    order: number
    status: 'pending' | 'in_progress' | 'completed'
    completedAt?: string
    requirements: Array<{
      requirementId: string
      name: string
      required: boolean
      completed: boolean
      completedAt?: string
      completedBy?: string
    }>
  }>
  completedStages: number
  totalStages: number
  progress: number
  startedAt?: string
  completedAt?: string
}

export interface WorkflowStatistics {
  totalWorkflows: number
  activeWorkflows: number
  byCategory: Record<string, number>
  recentlyCreated: Array<{
    _id: string
    name: string
    category: string
    createdAt: string
  }>
  recentlyUpdated: Array<{
    _id: string
    name: string
    category: string
    updatedAt: string
  }>
}

// ==================== API FUNCTIONS ====================

/**
 * Get workflow presets
 * GET /api/workflows/presets
 */
export const getPresets = async (): Promise<WorkflowPreset[]> => {
  try {
    const response = await apiClient.get('/workflows/presets')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Import a workflow preset
 * POST /api/workflows/presets/:presetType
 */
export const importPreset = async (presetType: string): Promise<Workflow> => {
  try {
    const response = await apiClient.post(`/workflows/presets/${presetType}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get workflow statistics
 * GET /api/workflows/stats or GET /api/workflows/statistics
 */
export const getWorkflowStatistics = async (): Promise<WorkflowStatistics> => {
  try {
    const response = await apiClient.get('/workflows/stats')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get workflows by category
 * GET /api/workflows/category/:category
 */
export const getWorkflowsByCategory = async (category: string): Promise<Workflow[]> => {
  try {
    const response = await apiClient.get(`/workflows/category/${category}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get all workflows
 * GET /api/workflows
 */
export const getWorkflows = async (): Promise<Workflow[]> => {
  try {
    const response = await apiClient.get('/workflows')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Create a new workflow
 * POST /api/workflows
 */
export const createWorkflow = async (workflow: Partial<Workflow>): Promise<Workflow> => {
  try {
    const response = await apiClient.post('/workflows', workflow)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get a single workflow
 * GET /api/workflows/:id
 */
export const getWorkflow = async (id: string): Promise<Workflow> => {
  try {
    const response = await apiClient.get(`/workflows/${id}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update a workflow
 * PATCH /api/workflows/:id
 */
export const updateWorkflow = async (id: string, workflow: Partial<Workflow>): Promise<Workflow> => {
  try {
    const response = await apiClient.patch(`/workflows/${id}`, workflow)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Delete a workflow
 * DELETE /api/workflows/:id
 */
export const deleteWorkflow = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/workflows/${id}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Duplicate a workflow
 * POST /api/workflows/:id/duplicate
 */
export const duplicateWorkflow = async (id: string): Promise<Workflow> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/duplicate`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Add a stage to a workflow
 * POST /api/workflows/:id/stages
 */
export const addStage = async (id: string, stage: WorkflowStage): Promise<Workflow> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/stages`, stage)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update a stage in a workflow
 * PATCH /api/workflows/:id/stages/:stageId
 */
export const updateStage = async (
  id: string,
  stageId: string,
  stage: Partial<WorkflowStage>
): Promise<Workflow> => {
  try {
    const response = await apiClient.patch(`/workflows/${id}/stages/${stageId}`, stage)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Delete a stage from a workflow
 * DELETE /api/workflows/:id/stages/:stageId
 */
export const deleteStage = async (id: string, stageId: string): Promise<Workflow> => {
  try {
    const response = await apiClient.delete(`/workflows/${id}/stages/${stageId}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Reorder stages in a workflow
 * POST /api/workflows/:id/stages/reorder
 */
export const reorderStages = async (id: string, stageIds: string[]): Promise<Workflow> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/stages/reorder`, { stageIds })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Add a transition to a workflow
 * POST /api/workflows/:id/transitions
 */
export const addTransition = async (id: string, transition: WorkflowTransition): Promise<Workflow> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/transitions`, transition)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Initialize workflow for a case
 * POST /api/workflows/cases/:caseId/initialize
 */
export const initializeWorkflowForCase = async (
  caseId: string,
  workflowId: string
): Promise<CaseProgress> => {
  try {
    const response = await apiClient.post(`/workflows/cases/${caseId}/initialize`, { workflowId })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get case progress
 * GET /api/workflows/cases/:caseId/progress
 */
export const getCaseProgress = async (caseId: string): Promise<CaseProgress> => {
  try {
    const response = await apiClient.get(`/workflows/cases/${caseId}/progress`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Move case to a stage
 * POST /api/workflows/cases/:caseId/move
 */
export const moveCaseToStage = async (caseId: string, stageId: string): Promise<CaseProgress> => {
  try {
    const response = await apiClient.post(`/workflows/cases/${caseId}/move`, { stageId })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Complete a requirement for a case
 * POST /api/workflows/cases/:caseId/requirements/:requirementId/complete
 */
export const completeRequirement = async (
  caseId: string,
  requirementId: string
): Promise<CaseProgress> => {
  try {
    const response = await apiClient.post(
      `/workflows/cases/${caseId}/requirements/${requirementId}/complete`
    )
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== DEFAULT EXPORT ====================

export default {
  getPresets,
  importPreset,
  getWorkflowStatistics,
  getWorkflowsByCategory,
  getWorkflows,
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  addStage,
  updateStage,
  deleteStage,
  reorderStages,
  addTransition,
  initializeWorkflowForCase,
  getCaseProgress,
  moveCaseToStage,
  completeRequirement,
}
