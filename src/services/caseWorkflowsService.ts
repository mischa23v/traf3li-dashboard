/**
 * Case Workflows Service
 * Handles workflow templates and stage management for cases
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Stage Requirement Types
 */
export type RequirementType = 'document_upload' | 'approval' | 'payment' | 'signature' | 'review' | 'task_completion'

/**
 * Stage Requirement
 */
export interface StageRequirement {
  _id?: string
  type: RequirementType
  name: string
  description?: string
  isRequired: boolean
  order: number
}

/**
 * Workflow Stage
 */
export interface WorkflowStage {
  _id?: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  color: string
  order: number
  durationDays?: number
  requirements: StageRequirement[]
  autoTransition: boolean
  notifyOnEntry: boolean
  notifyOnExit: boolean
  allowedActions: string[]
  isInitial: boolean
  isFinal: boolean
}

/**
 * Stage Transition
 */
export interface StageTransition {
  _id?: string
  fromStageId: string
  toStageId: string
  name: string
  nameAr: string
  requiresApproval: boolean
  approverRoles?: string[]
  conditions?: string[]
}

/**
 * Workflow Template
 */
export interface WorkflowTemplate {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  caseCategory: string
  stages: WorkflowStage[]
  transitions: StageTransition[]
  isDefault: boolean
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * Case Stage Progress - Tracks a case's progress through workflow
 */
export interface CaseStageProgress {
  _id: string
  caseId: string
  workflowId: string
  currentStageId: string
  stageHistory: StageHistoryEntry[]
  completedRequirements: CompletedRequirement[]
  startedAt: string
  completedAt?: string
}

/**
 * Stage History Entry
 */
export interface StageHistoryEntry {
  _id?: string
  stageId: string
  stageName: string
  enteredAt: string
  exitedAt?: string
  completedBy?: string
  notes?: string
  duration?: number
}

/**
 * Completed Requirement
 */
export interface CompletedRequirement {
  _id?: string
  stageId: string
  requirementId: string
  completedAt: string
  completedBy: string
  metadata?: Record<string, any>
}

/**
 * Create Workflow Data
 */
export interface CreateWorkflowData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  caseCategory: string
  stages?: Omit<WorkflowStage, '_id'>[]
  isDefault?: boolean
}

/**
 * Update Workflow Data
 */
export interface UpdateWorkflowData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  isDefault?: boolean
  isActive?: boolean
}

/**
 * Create Stage Data
 */
export interface CreateStageData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  color: string
  order: number
  durationDays?: number
  requirements?: Omit<StageRequirement, '_id'>[]
  autoTransition?: boolean
  notifyOnEntry?: boolean
  notifyOnExit?: boolean
  allowedActions?: string[]
  isInitial?: boolean
  isFinal?: boolean
}

/**
 * Update Stage Data
 */
export interface UpdateStageData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  color?: string
  order?: number
  durationDays?: number
  autoTransition?: boolean
  notifyOnEntry?: boolean
  notifyOnExit?: boolean
  allowedActions?: string[]
  isInitial?: boolean
  isFinal?: boolean
}

/**
 * Create Transition Data
 */
export interface CreateTransitionData {
  fromStageId: string
  toStageId: string
  name: string
  nameAr: string
  requiresApproval?: boolean
  approverRoles?: string[]
  conditions?: string[]
}

/**
 * Update Transition Data
 */
export interface UpdateTransitionData {
  name?: string
  nameAr?: string
  requiresApproval?: boolean
  approverRoles?: string[]
  conditions?: string[]
}

/**
 * Move Case to Stage Data
 */
export interface MoveCaseToStageData {
  toStageId: string
  notes?: string
}

/**
 * Complete Requirement Data
 */
export interface CompleteRequirementData {
  stageId: string
  requirementId: string
  metadata?: Record<string, any>
}

/**
 * Workflow Filters
 */
export interface WorkflowFilters {
  caseCategory?: string
  isActive?: boolean
  isDefault?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Workflow Statistics
 */
export interface WorkflowStatistics {
  total: number
  active: number
  byCategory: Record<string, number>
  avgStagesPerWorkflow: number
  mostUsedWorkflow?: {
    _id: string
    name: string
    usageCount: number
  }
}

// ==================== API RESPONSES ====================

interface WorkflowsResponse {
  error: boolean
  workflows: WorkflowTemplate[]
  total?: number
}

interface WorkflowResponse {
  error: boolean
  workflow: WorkflowTemplate
}

interface StageResponse {
  error: boolean
  workflow: WorkflowTemplate
  stage: WorkflowStage
}

interface TransitionResponse {
  error: boolean
  workflow: WorkflowTemplate
  transition: StageTransition
}

interface ProgressResponse {
  error: boolean
  progress: CaseStageProgress
}

interface StatisticsResponse {
  error: boolean
  statistics: WorkflowStatistics
}

// ==================== SERVICE ====================

const caseWorkflowsService = {
  /**
   * Get all workflow templates with optional filters
   * GET /api/case-workflows/
   */
  getWorkflows: async (filters?: WorkflowFilters): Promise<{ workflows: WorkflowTemplate[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.caseCategory) params.append('caseCategory', filters.caseCategory)
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters?.isDefault !== undefined) params.append('isDefault', filters.isDefault.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/case-workflows/?${queryString}` : '/case-workflows/'

      const response = await apiClient.get<WorkflowsResponse>(url)
      return {
        workflows: response.data.workflows || [],
        total: response.data.total || response.data.workflows?.length || 0,
      }
    } catch (error: any) {
      console.error('Get workflows error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single workflow by ID
   * GET /api/case-workflows/:id
   */
  getWorkflow: async (id: string): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.get<WorkflowResponse>(`/case-workflows/${id}`)
      return response.data.workflow
    } catch (error: any) {
      console.error('Get workflow error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get workflow by case category
   * GET /api/case-workflows/category/:category
   */
  getWorkflowByCategory: async (category: string): Promise<WorkflowTemplate | null> => {
    try {
      const response = await apiClient.get<WorkflowResponse>(`/case-workflows/category/${category}`)
      return response.data.workflow
    } catch (error: any) {
      if (error.response?.status === 404) return null
      console.error('Get workflow by category error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new workflow template
   * POST /api/case-workflows/
   */
  createWorkflow: async (data: CreateWorkflowData): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.post<WorkflowResponse>('/case-workflows/', data)
      return response.data.workflow
    } catch (error: any) {
      console.error('Create workflow error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update workflow template
   * PATCH /api/case-workflows/:id
   */
  updateWorkflow: async (id: string, data: UpdateWorkflowData): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.patch<WorkflowResponse>(`/case-workflows/${id}`, data)
      return response.data.workflow
    } catch (error: any) {
      console.error('Update workflow error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete workflow template
   * DELETE /api/case-workflows/:id
   */
  deleteWorkflow: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/case-workflows/${id}`)
    } catch (error: any) {
      console.error('Delete workflow error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate workflow template
   * POST /api/case-workflows/:id/duplicate
   */
  duplicateWorkflow: async (id: string, newName: string, newNameAr: string): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.post<WorkflowResponse>(`/case-workflows/${id}/duplicate`, {
        name: newName,
        nameAr: newNameAr,
      })
      return response.data.workflow
    } catch (error: any) {
      console.error('Duplicate workflow error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== STAGES MANAGEMENT ====================

  /**
   * Add stage to workflow
   * POST /api/case-workflows/:id/stages
   */
  addStage: async (workflowId: string, data: CreateStageData): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.post<WorkflowResponse>(`/case-workflows/${workflowId}/stages`, data)
      return response.data.workflow
    } catch (error: any) {
      console.error('Add stage error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update stage in workflow
   * PATCH /api/case-workflows/:workflowId/stages/:stageId
   */
  updateStage: async (workflowId: string, stageId: string, data: UpdateStageData): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.patch<WorkflowResponse>(`/case-workflows/${workflowId}/stages/${stageId}`, data)
      return response.data.workflow
    } catch (error: any) {
      console.error('Update stage error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete stage from workflow
   * DELETE /api/case-workflows/:workflowId/stages/:stageId
   */
  deleteStage: async (workflowId: string, stageId: string): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.delete<WorkflowResponse>(`/case-workflows/${workflowId}/stages/${stageId}`)
      return response.data.workflow
    } catch (error: any) {
      console.error('Delete stage error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reorder stages in workflow
   * PATCH /api/case-workflows/:id/stages/reorder
   */
  reorderStages: async (workflowId: string, stageIds: string[]): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.patch<WorkflowResponse>(`/case-workflows/${workflowId}/stages/reorder`, {
        stageIds,
      })
      return response.data.workflow
    } catch (error: any) {
      console.error('Reorder stages error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== STAGE REQUIREMENTS ====================

  /**
   * Add requirement to stage
   * POST /api/case-workflows/:workflowId/stages/:stageId/requirements
   */
  addRequirement: async (
    workflowId: string,
    stageId: string,
    requirement: Omit<StageRequirement, '_id'>
  ): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.post<WorkflowResponse>(
        `/case-workflows/${workflowId}/stages/${stageId}/requirements`,
        requirement
      )
      return response.data.workflow
    } catch (error: any) {
      console.error('Add requirement error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update requirement in stage
   * PATCH /api/case-workflows/:workflowId/stages/:stageId/requirements/:reqId
   */
  updateRequirement: async (
    workflowId: string,
    stageId: string,
    reqId: string,
    data: Partial<StageRequirement>
  ): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.patch<WorkflowResponse>(
        `/case-workflows/${workflowId}/stages/${stageId}/requirements/${reqId}`,
        data
      )
      return response.data.workflow
    } catch (error: any) {
      console.error('Update requirement error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete requirement from stage
   * DELETE /api/case-workflows/:workflowId/stages/:stageId/requirements/:reqId
   */
  deleteRequirement: async (workflowId: string, stageId: string, reqId: string): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.delete<WorkflowResponse>(
        `/case-workflows/${workflowId}/stages/${stageId}/requirements/${reqId}`
      )
      return response.data.workflow
    } catch (error: any) {
      console.error('Delete requirement error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TRANSITIONS MANAGEMENT ====================

  /**
   * Add transition to workflow
   * POST /api/case-workflows/:id/transitions
   */
  addTransition: async (workflowId: string, data: CreateTransitionData): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.post<WorkflowResponse>(`/case-workflows/${workflowId}/transitions`, data)
      return response.data.workflow
    } catch (error: any) {
      console.error('Add transition error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update transition in workflow
   * PATCH /api/case-workflows/:workflowId/transitions/:transitionId
   */
  updateTransition: async (workflowId: string, transitionId: string, data: UpdateTransitionData): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.patch<WorkflowResponse>(
        `/case-workflows/${workflowId}/transitions/${transitionId}`,
        data
      )
      return response.data.workflow
    } catch (error: any) {
      console.error('Update transition error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete transition from workflow
   * DELETE /api/case-workflows/:workflowId/transitions/:transitionId
   */
  deleteTransition: async (workflowId: string, transitionId: string): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.delete<WorkflowResponse>(`/case-workflows/${workflowId}/transitions/${transitionId}`)
      return response.data.workflow
    } catch (error: any) {
      console.error('Delete transition error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CASE PROGRESS TRACKING ====================

  /**
   * Initialize workflow for a case
   * POST /api/case-workflows/cases/:caseId/initialize
   */
  initializeWorkflow: async (caseId: string, workflowId: string): Promise<CaseStageProgress> => {
    try {
      const response = await apiClient.post<ProgressResponse>(`/case-workflows/cases/${caseId}/initialize`, {
        workflowId,
      })
      return response.data.progress
    } catch (error: any) {
      console.error('Initialize workflow error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get case workflow progress
   * GET /api/case-workflows/cases/:caseId/progress
   */
  getCaseProgress: async (caseId: string): Promise<CaseStageProgress | null> => {
    try {
      const response = await apiClient.get<ProgressResponse>(`/case-workflows/cases/${caseId}/progress`)
      return response.data.progress
    } catch (error: any) {
      if (error.response?.status === 404) return null
      console.error('Get case progress error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Move case to next stage
   * POST /api/case-workflows/cases/:caseId/move
   */
  moveCaseToStage: async (caseId: string, data: MoveCaseToStageData): Promise<CaseStageProgress> => {
    try {
      const response = await apiClient.post<ProgressResponse>(`/case-workflows/cases/${caseId}/move`, data)
      return response.data.progress
    } catch (error: any) {
      console.error('Move case to stage error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete requirement for case
   * POST /api/case-workflows/cases/:caseId/requirements/complete
   */
  completeRequirement: async (caseId: string, data: CompleteRequirementData): Promise<CaseStageProgress> => {
    try {
      const response = await apiClient.post<ProgressResponse>(`/case-workflows/cases/${caseId}/requirements/complete`, data)
      return response.data.progress
    } catch (error: any) {
      console.error('Complete requirement error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== STATISTICS ====================

  /**
   * Get workflow statistics
   * GET /api/case-workflows/statistics
   */
  getStatistics: async (): Promise<WorkflowStatistics> => {
    try {
      const response = await apiClient.get<StatisticsResponse>('/case-workflows/statistics')
      return response.data.statistics
    } catch (error: any) {
      console.error('Get workflow statistics error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== PRESET TEMPLATES ====================

  /**
   * Get preset workflow templates (system defaults)
   * GET /api/case-workflows/presets
   */
  getPresetTemplates: async (): Promise<WorkflowTemplate[]> => {
    try {
      const response = await apiClient.get<WorkflowsResponse>('/case-workflows/presets')
      return response.data.workflows || []
    } catch (error: any) {
      console.error('Get preset templates error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import preset template
   * POST /api/case-workflows/presets/:presetId/import
   */
  importPresetTemplate: async (presetId: string): Promise<WorkflowTemplate> => {
    try {
      const response = await apiClient.post<WorkflowResponse>(`/case-workflows/presets/${presetId}/import`)
      return response.data.workflow
    } catch (error: any) {
      console.error('Import preset template error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default caseWorkflowsService
