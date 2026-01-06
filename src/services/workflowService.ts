/**
 * Workflow Service
 * Handles all workflow API calls matching the backend API contract
 * Based on contract2/types/workflow.ts
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface BaseResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type WorkflowTriggerType = 'manual' | 'event' | 'schedule'
export type WorkflowStageType = 'task' | 'reminder' | 'email' | 'action'
export type WorkflowStatus = 'draft' | 'active' | 'archived'
export type WorkflowInstanceStatus = 'pending' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed'
export type EntityType = 'case' | 'client' | 'invoice' | 'appointment' | 'lead'

// ==================== WORKFLOW TEMPLATE TYPES ====================

export interface WorkflowStage {
  id: string
  name: string
  type: WorkflowStageType
  config: Record<string, any>
  position: number
  dependencies?: string[]
}

export interface WorkflowTemplate {
  _id: string
  name: string
  description?: string
  triggerType: WorkflowTriggerType
  triggerConfig?: Record<string, any>
  stages: WorkflowStage[]
  status: WorkflowStatus
  firmId?: string
  lawyerId?: string
  createdBy: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface ListWorkflowTemplatesQuery {
  page?: number
  limit?: number
  status?: WorkflowStatus
  triggerType?: WorkflowTriggerType
  search?: string
}

export interface CreateWorkflowTemplateRequest {
  name: string
  description?: string
  triggerType: WorkflowTriggerType
  triggerConfig?: Record<string, any>
  stages: Omit<WorkflowStage, 'id'>[]
  isPublic?: boolean
}

export interface UpdateWorkflowTemplateRequest {
  name?: string
  description?: string
  triggerType?: WorkflowTriggerType
  triggerConfig?: Record<string, any>
  stages?: WorkflowStage[]
  status?: WorkflowStatus
  isPublic?: boolean
}

// ==================== WORKFLOW INSTANCE TYPES ====================

export interface WorkflowStageExecution {
  stageId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startedAt?: string
  completedAt?: string
  error?: string
  result?: any
}

export interface WorkflowInstance {
  _id: string
  templateId: string
  entityType: EntityType
  entityId: string
  status: WorkflowInstanceStatus
  currentStageIndex: number
  stageExecutions: WorkflowStageExecution[]
  context: Record<string, any>
  firmId?: string
  lawyerId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
}

export interface ListWorkflowInstancesQuery {
  page?: number
  limit?: number
  status?: WorkflowInstanceStatus
  templateId?: string
  entityType?: EntityType
  entityId?: string
}

export interface CreateWorkflowInstanceRequest {
  templateId: string
  entityType: EntityType
  entityId: string
  context?: Record<string, any>
  autoStart?: boolean
}

export interface AdvanceWorkflowInstanceRequest {
  skipCurrent?: boolean
}

// ==================== LEGACY TYPES (for backward compatibility) ====================

export interface WorkflowStageLegacy {
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

export interface WorkflowLegacy {
  _id?: string
  name: string
  description?: string
  category: 'case' | 'hr' | 'finance' | 'general'
  stages: WorkflowStageLegacy[]
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
  stages: WorkflowStageLegacy[]
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

// ==================== API FUNCTIONS - TEMPLATES ====================

/**
 * Get workflow templates
 * GET /api/workflow/templates
 */
export const getTemplates = async (query?: ListWorkflowTemplatesQuery): Promise<{ templates: WorkflowTemplate[]; pagination: Pagination }> => {
  try {
    const response = await apiClient.get('/workflow/templates', { params: query })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Create a workflow template
 * POST /api/workflow/templates
 */
export const createTemplate = async (data: CreateWorkflowTemplateRequest): Promise<WorkflowTemplate> => {
  try {
    const response = await apiClient.post('/workflow/templates', data)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get a workflow template by ID
 * GET /api/workflow/templates/:id
 */
export const getTemplate = async (id: string): Promise<WorkflowTemplate> => {
  try {
    const response = await apiClient.get(`/workflow/templates/${id}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update a workflow template
 * PUT /api/workflow/templates/:id
 */
export const updateTemplate = async (id: string, data: UpdateWorkflowTemplateRequest): Promise<WorkflowTemplate> => {
  try {
    const response = await apiClient.put(`/workflow/templates/${id}`, data)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Delete a workflow template
 * DELETE /api/workflow/templates/:id
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/workflow/templates/${id}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== API FUNCTIONS - INSTANCES ====================

/**
 * Get workflow instances
 * GET /api/workflow/instances
 */
export const getInstances = async (query?: ListWorkflowInstancesQuery): Promise<{ instances: WorkflowInstance[]; pagination: Pagination }> => {
  try {
    const response = await apiClient.get('/workflow/instances', { params: query })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Create a workflow instance
 * POST /api/workflow/instances
 */
export const createInstance = async (data: CreateWorkflowInstanceRequest): Promise<WorkflowInstance> => {
  try {
    const response = await apiClient.post('/workflow/instances', data)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get a workflow instance by ID
 * GET /api/workflow/instances/:id
 */
export const getInstance = async (id: string): Promise<WorkflowInstance> => {
  try {
    const response = await apiClient.get(`/workflow/instances/${id}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Pause a workflow instance
 * POST /api/workflow/instances/:id/pause
 */
export const pauseInstance = async (id: string): Promise<WorkflowInstance> => {
  try {
    const response = await apiClient.post(`/workflow/instances/${id}/pause`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Resume a workflow instance
 * POST /api/workflow/instances/:id/resume
 */
export const resumeInstance = async (id: string): Promise<WorkflowInstance> => {
  try {
    const response = await apiClient.post(`/workflow/instances/${id}/resume`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Cancel a workflow instance
 * POST /api/workflow/instances/:id/cancel
 */
export const cancelInstance = async (id: string): Promise<WorkflowInstance> => {
  try {
    const response = await apiClient.post(`/workflow/instances/${id}/cancel`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Advance a workflow instance to the next stage
 * POST /api/workflow/instances/:id/advance
 */
export const advanceInstance = async (id: string, data?: AdvanceWorkflowInstanceRequest): Promise<WorkflowInstance> => {
  try {
    const response = await apiClient.post(`/workflow/instances/${id}/advance`, data)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== API FUNCTIONS - ENTITY WORKFLOWS ====================

/**
 * Get workflows for an entity
 * GET /api/workflow/entity/:entityType/:entityId
 */
export const getEntityWorkflows = async (entityType: EntityType, entityId: string): Promise<{ active: WorkflowInstance[]; completed: WorkflowInstance[]; total: number }> => {
  try {
    const response = await apiClient.get(`/workflow/entity/${entityType}/${entityId}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== LEGACY API FUNCTIONS (for backward compatibility) ====================

/**
 * @deprecated Use getTemplates instead
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
 * @deprecated Use createTemplate instead
 * Import a workflow preset
 * POST /api/workflows/presets/:presetType
 */
export const importPreset = async (presetType: string): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.post(`/workflows/presets/${presetType}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated
 * Get workflow statistics
 * GET /api/workflows/stats
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
 * @deprecated Use getTemplates with filter instead
 * Get workflows by category
 * GET /api/workflows/category/:category
 */
export const getWorkflowsByCategory = async (category: string): Promise<WorkflowLegacy[]> => {
  try {
    const response = await apiClient.get(`/workflows/category/${category}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated Use getTemplates instead
 * Get all workflows
 * GET /api/workflows
 */
export const getWorkflows = async (): Promise<WorkflowLegacy[]> => {
  try {
    const response = await apiClient.get('/workflows')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated Use createTemplate instead
 * Create a new workflow
 * POST /api/workflows
 */
export const createWorkflow = async (workflow: Partial<WorkflowLegacy>): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.post('/workflows', workflow)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated Use getTemplate instead
 * Get a single workflow
 * GET /api/workflows/:id
 */
export const getWorkflow = async (id: string): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.get(`/workflows/${id}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated Use updateTemplate instead
 * Update a workflow
 * PATCH /api/workflows/:id
 */
export const updateWorkflow = async (id: string, workflow: Partial<WorkflowLegacy>): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.patch(`/workflows/${id}`, workflow)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated Use deleteTemplate instead
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
 * @deprecated
 * Duplicate a workflow
 * POST /api/workflows/:id/duplicate
 */
export const duplicateWorkflow = async (id: string): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/duplicate`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated
 * Add a stage to a workflow
 * POST /api/workflows/:id/stages
 */
export const addStage = async (id: string, stage: WorkflowStageLegacy): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/stages`, stage)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated
 * Update a stage in a workflow
 * PATCH /api/workflows/:id/stages/:stageId
 */
export const updateStage = async (
  id: string,
  stageId: string,
  stage: Partial<WorkflowStageLegacy>
): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.patch(`/workflows/${id}/stages/${stageId}`, stage)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated
 * Delete a stage from a workflow
 * DELETE /api/workflows/:id/stages/:stageId
 */
export const deleteStage = async (id: string, stageId: string): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.delete(`/workflows/${id}/stages/${stageId}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated
 * Reorder stages in a workflow
 * POST /api/workflows/:id/stages/reorder
 */
export const reorderStages = async (id: string, stageIds: string[]): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/stages/reorder`, { stageIds })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated
 * Add a transition to a workflow
 * POST /api/workflows/:id/transitions
 */
export const addTransition = async (id: string, transition: WorkflowTransition): Promise<WorkflowLegacy> => {
  try {
    const response = await apiClient.post(`/workflows/${id}/transitions`, transition)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * @deprecated Use createInstance instead
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
 * @deprecated Use getEntityWorkflows instead
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
 * @deprecated Use advanceInstance instead
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
 * @deprecated
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
  // New API (templates + instances)
  getTemplates,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  getInstances,
  createInstance,
  getInstance,
  pauseInstance,
  resumeInstance,
  cancelInstance,
  advanceInstance,
  getEntityWorkflows,
  // Legacy API (deprecated)
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
