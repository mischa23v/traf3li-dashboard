/**
 * Automated Action Hooks
 * React Query hooks for workflow automation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import automatedActionService from '@/services/automatedActionService'
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
import { toast } from 'sonner'

// ==================== Cache Configuration ====================
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const LIST_GC_TIME = 30 * 60 * 1000 // 30 minutes
const METADATA_STALE_TIME = 60 * 60 * 1000 // 1 hour

// ==================== QUERY KEYS ====================

export const automatedActionKeys = {
  all: ['automated-actions'] as const,
  lists: () => [...automatedActionKeys.all, 'list'] as const,
  list: (filters?: AutomatedActionFilters) => [...automatedActionKeys.lists(), filters] as const,
  detail: (id: string) => [...automatedActionKeys.all, 'detail', id] as const,
  logs: (actionId: string, filters?: Omit<AutomatedActionLogFilters, 'action_id'>) =>
    [...automatedActionKeys.all, 'logs', actionId, filters] as const,
  allLogs: (filters?: AutomatedActionLogFilters) =>
    [...automatedActionKeys.all, 'all-logs', filters] as const,
  models: () => [...automatedActionKeys.all, 'models'] as const,
  modelFields: (modelName: string) => [...automatedActionKeys.all, 'fields', modelName] as const,
}

// ==================== ACTION QUERIES ====================

/**
 * Get automated actions with filters
 */
export function useAutomatedActions(filters?: AutomatedActionFilters, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.list(filters),
    queryFn: () => automatedActionService.getAutomatedActions(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled,
  })
}

/**
 * Get a single automated action by ID
 */
export function useAutomatedActionById(id: string, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.detail(id),
    queryFn: () => automatedActionService.getAutomatedActionById(id),
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled: !!id && enabled,
  })
}

/**
 * Get execution logs for an automated action
 */
export function useAutomatedActionLogs(
  actionId: string,
  filters?: Omit<AutomatedActionLogFilters, 'action_id'>,
  enabled = true
) {
  return useQuery({
    queryKey: automatedActionKeys.logs(actionId, filters),
    queryFn: () => automatedActionService.getAutomatedActionLogs(actionId, filters),
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled: !!actionId && enabled,
  })
}

/**
 * Get all execution logs (admin view)
 */
export function useAllActionLogs(filters?: AutomatedActionLogFilters, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.allLogs(filters),
    queryFn: () => automatedActionService.getAllActionLogs(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled,
  })
}

/**
 * Get available models for automation
 */
export function useAvailableModels(enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.models(),
    queryFn: automatedActionService.getAvailableModels,
    staleTime: METADATA_STALE_TIME,
    gcTime: METADATA_STALE_TIME * 2,
    enabled,
  })
}

/**
 * Get fields for a specific model
 */
export function useModelFields(modelName: string, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.modelFields(modelName),
    queryFn: () => automatedActionService.getModelFields(modelName),
    staleTime: METADATA_STALE_TIME,
    gcTime: METADATA_STALE_TIME * 2,
    enabled: !!modelName && enabled,
  })
}

// ==================== ACTION MUTATIONS ====================

/**
 * Create a new automated action
 */
export function useCreateAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAutomatedActionData) =>
      automatedActionService.createAutomatedAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم إنشاء الإجراء التلقائي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء الإجراء التلقائي')
    },
  })
}

/**
 * Update an automated action
 */
export function useUpdateAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomatedActionData }) =>
      automatedActionService.updateAutomatedAction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم تحديث الإجراء التلقائي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الإجراء التلقائي')
    },
  })
}

/**
 * Delete an automated action
 */
export function useDeleteAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => automatedActionService.deleteAutomatedAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم حذف الإجراء التلقائي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف الإجراء التلقائي')
    },
  })
}

/**
 * Toggle automated action active status
 */
export function useToggleAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => automatedActionService.toggleAutomatedAction(id),
    onSuccess: (updatedAction, id) => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success(
        updatedAction.isActive
          ? 'تم تفعيل الإجراء التلقائي'
          : 'تم تعطيل الإجراء التلقائي'
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تغيير حالة الإجراء التلقائي')
    },
  })
}

/**
 * Test an automated action against a record
 */
export function useTestAutomatedAction() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestActionData }) =>
      automatedActionService.testAutomatedAction(id, data),
    onSuccess: (result) => {
      if (result.would_execute) {
        toast.success('الإجراء سيتم تنفيذه على هذا السجل')
      } else {
        toast.info(result.reason || 'الإجراء لن يتم تنفيذه - الشروط غير مستوفاة')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في اختبار الإجراء')
    },
  })
}

/**
 * Duplicate an automated action
 */
export function useDuplicateAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => automatedActionService.duplicateAutomatedAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم نسخ الإجراء التلقائي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في نسخ الإجراء التلقائي')
    },
  })
}

// ==================== BULK OPERATION MUTATIONS ====================

/**
 * Enable multiple automated actions
 */
export function useEnableAutomatedActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => automatedActionService.enableAutomatedActions(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم تفعيل الإجراءات المحددة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تفعيل الإجراءات')
    },
  })
}

/**
 * Disable multiple automated actions
 */
export function useDisableAutomatedActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => automatedActionService.disableAutomatedActions(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم تعطيل الإجراءات المحددة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تعطيل الإجراءات')
    },
  })
}

/**
 * Delete multiple automated actions
 */
export function useDeleteAutomatedActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => automatedActionService.deleteAutomatedActions(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم حذف الإجراءات المحددة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حذف الإجراءات')
    },
  })
}

// ==================== EXPORTS ====================

export type {
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
}
