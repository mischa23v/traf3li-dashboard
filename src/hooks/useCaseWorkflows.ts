/**
 * Case Workflows React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import caseWorkflowsService, {
  type WorkflowTemplate,
  type WorkflowFilters,
  type CreateWorkflowData,
  type UpdateWorkflowData,
  type CreateStageData,
  type UpdateStageData,
  type CreateTransitionData,
  type UpdateTransitionData,
  type StageRequirement,
  type MoveCaseToStageData,
  type CompleteRequirementData,
} from '@/services/caseWorkflowsService'

// ==================== QUERY KEYS ====================

export const caseWorkflowKeys = {
  all: ['case-workflows'] as const,
  lists: () => [...caseWorkflowKeys.all, 'list'] as const,
  list: (filters?: WorkflowFilters) => [...caseWorkflowKeys.lists(), filters] as const,
  details: () => [...caseWorkflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...caseWorkflowKeys.details(), id] as const,
  byCategory: (category: string) => [...caseWorkflowKeys.all, 'category', category] as const,
  presets: () => [...caseWorkflowKeys.all, 'presets'] as const,
  statistics: () => [...caseWorkflowKeys.all, 'statistics'] as const,
  caseProgress: (caseId: string) => [...caseWorkflowKeys.all, 'case-progress', caseId] as const,
}

// ==================== QUERIES ====================

/**
 * Get all workflow templates
 */
export function useWorkflows(filters?: WorkflowFilters) {
  return useQuery({
    queryKey: caseWorkflowKeys.list(filters),
    queryFn: () => caseWorkflowsService.getWorkflows(filters),
  })
}

/**
 * Get single workflow by ID
 */
export function useWorkflow(id: string) {
  return useQuery({
    queryKey: caseWorkflowKeys.detail(id),
    queryFn: () => caseWorkflowsService.getWorkflow(id),
    enabled: !!id,
  })
}

/**
 * Get workflow by case category
 */
export function useWorkflowByCategory(category: string) {
  return useQuery({
    queryKey: caseWorkflowKeys.byCategory(category),
    queryFn: () => caseWorkflowsService.getWorkflowByCategory(category),
    enabled: !!category,
  })
}

/**
 * Get preset workflow templates
 */
export function usePresetTemplates() {
  return useQuery({
    queryKey: caseWorkflowKeys.presets(),
    queryFn: () => caseWorkflowsService.getPresetTemplates(),
  })
}

/**
 * Get workflow statistics
 */
export function useWorkflowStatistics() {
  return useQuery({
    queryKey: caseWorkflowKeys.statistics(),
    queryFn: () => caseWorkflowsService.getStatistics(),
  })
}

/**
 * Get case workflow progress
 */
export function useCaseProgress(caseId: string) {
  return useQuery({
    queryKey: caseWorkflowKeys.caseProgress(caseId),
    queryFn: () => caseWorkflowsService.getCaseProgress(caseId),
    enabled: !!caseId,
  })
}

// ==================== MUTATIONS ====================

/**
 * Create workflow template
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkflowData) => caseWorkflowsService.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.statistics() })
    },
  })
}

/**
 * Update workflow template
 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowData }) =>
      caseWorkflowsService.updateWorkflow(id, data),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Delete workflow template
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => caseWorkflowsService.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.statistics() })
    },
  })
}

/**
 * Duplicate workflow template
 */
export function useDuplicateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name, nameAr }: { id: string; name: string; nameAr: string }) =>
      caseWorkflowsService.duplicateWorkflow(id, name, nameAr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.statistics() })
    },
  })
}

// ==================== STAGES MUTATIONS ====================

/**
 * Add stage to workflow
 */
export function useAddStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: CreateStageData }) =>
      caseWorkflowsService.addStage(workflowId, data),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Update stage in workflow
 */
export function useUpdateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, stageId, data }: { workflowId: string; stageId: string; data: UpdateStageData }) =>
      caseWorkflowsService.updateStage(workflowId, stageId, data),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Delete stage from workflow
 */
export function useDeleteStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, stageId }: { workflowId: string; stageId: string }) =>
      caseWorkflowsService.deleteStage(workflowId, stageId),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Reorder stages in workflow
 */
export function useReorderStages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, stageIds }: { workflowId: string; stageIds: string[] }) =>
      caseWorkflowsService.reorderStages(workflowId, stageIds),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

// ==================== REQUIREMENTS MUTATIONS ====================

/**
 * Add requirement to stage
 */
export function useAddRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      requirement,
    }: {
      workflowId: string
      stageId: string
      requirement: Omit<StageRequirement, '_id'>
    }) => caseWorkflowsService.addRequirement(workflowId, stageId, requirement),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Update requirement in stage
 */
export function useUpdateRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workflowId,
      stageId,
      reqId,
      data,
    }: {
      workflowId: string
      stageId: string
      reqId: string
      data: Partial<StageRequirement>
    }) => caseWorkflowsService.updateRequirement(workflowId, stageId, reqId, data),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Delete requirement from stage
 */
export function useDeleteRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, stageId, reqId }: { workflowId: string; stageId: string; reqId: string }) =>
      caseWorkflowsService.deleteRequirement(workflowId, stageId, reqId),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

// ==================== TRANSITIONS MUTATIONS ====================

/**
 * Add transition to workflow
 */
export function useAddTransition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: CreateTransitionData }) =>
      caseWorkflowsService.addTransition(workflowId, data),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Update transition in workflow
 */
export function useUpdateTransition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workflowId,
      transitionId,
      data,
    }: {
      workflowId: string
      transitionId: string
      data: UpdateTransitionData
    }) => caseWorkflowsService.updateTransition(workflowId, transitionId, data),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

/**
 * Delete transition from workflow
 */
export function useDeleteTransition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, transitionId }: { workflowId: string; transitionId: string }) =>
      caseWorkflowsService.deleteTransition(workflowId, transitionId),
    onSuccess: (workflow) => {
      queryClient.setQueryData(caseWorkflowKeys.detail(workflow._id), workflow)
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
    },
  })
}

// ==================== CASE PROGRESS MUTATIONS ====================

/**
 * Initialize workflow for a case
 */
export function useInitializeWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, workflowId }: { caseId: string; workflowId: string }) =>
      caseWorkflowsService.initializeWorkflow(caseId, workflowId),
    onSuccess: (progress) => {
      queryClient.setQueryData(caseWorkflowKeys.caseProgress(progress.caseId), progress)
    },
  })
}

/**
 * Move case to stage
 */
export function useMoveCaseToStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: MoveCaseToStageData }) =>
      caseWorkflowsService.moveCaseToStage(caseId, data),
    onSuccess: (progress) => {
      queryClient.setQueryData(caseWorkflowKeys.caseProgress(progress.caseId), progress)
    },
  })
}

/**
 * Complete requirement for case
 */
export function useCompleteRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: CompleteRequirementData }) =>
      caseWorkflowsService.completeRequirement(caseId, data),
    onSuccess: (progress) => {
      queryClient.setQueryData(caseWorkflowKeys.caseProgress(progress.caseId), progress)
    },
  })
}

/**
 * Import preset template
 */
export function useImportPresetTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (presetId: string) => caseWorkflowsService.importPresetTemplate(presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.lists() })
      queryClient.invalidateQueries({ queryKey: caseWorkflowKeys.statistics() })
    },
  })
}
