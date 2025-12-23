/**
 * Automated Action Hooks
 * React Query hooks for workflow automation
 *
 * ⚠️⚠️⚠️ CRITICAL WARNING - BACKEND NOT IMPLEMENTED ⚠️⚠️⚠️
 *
 * This module is FRONTEND-ONLY scaffolding. All mutations will fail because
 * the backend API endpoints DO NOT EXIST yet.
 *
 * Status: AWAITING BACKEND DEVELOPMENT
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

// ==================== DEPRECATION HELPER ====================

/**
 * Logs deprecation warning for unimplemented backend mutations
 */
const logBackendNotImplemented = (operation: string): void => {
  console.warn(
    `⚠️ BACKEND NOT IMPLEMENTED | الخلفية غير مطبقة\n\n` +
    `Operation: ${operation}\n` +
    `EN: This operation will fail because the automated actions backend API is not yet implemented.\n` +
    `AR: ستفشل هذه العملية لأن واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.`
  )
}

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
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useAutomatedActions(filters?: AutomatedActionFilters, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.list(filters),
    queryFn: () => {
      console.warn(
        '⚠️ BACKEND NOT IMPLEMENTED | الخلفية غير مطبقة\n' +
        'Query: getAutomatedActions\n' +
        'EN: This query will fail because the automated actions backend API is not yet implemented.\n' +
        'AR: سيفشل هذا الاستعلام لأن واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.'
      )
      return automatedActionService.getAutomatedActions(filters)
    },
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled,
    retry: false, // Don't retry since backend doesn't exist
  })
}

/**
 * Get a single automated action by ID
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useAutomatedActionById(id: string, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.detail(id),
    queryFn: () => {
      console.warn(
        '⚠️ BACKEND NOT IMPLEMENTED | الخلفية غير مطبقة\n' +
        'Query: getAutomatedActionById\n' +
        'EN: This query will fail because the automated actions backend API is not yet implemented.\n' +
        'AR: سيفشل هذا الاستعلام لأن واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.'
      )
      return automatedActionService.getAutomatedActionById(id)
    },
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled: !!id && enabled,
    retry: false, // Don't retry since backend doesn't exist
  })
}

/**
 * Get execution logs for an automated action
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useAutomatedActionLogs(
  actionId: string,
  filters?: Omit<AutomatedActionLogFilters, 'action_id'>,
  enabled = true
) {
  return useQuery({
    queryKey: automatedActionKeys.logs(actionId, filters),
    queryFn: () => {
      console.warn(
        '⚠️ BACKEND NOT IMPLEMENTED | الخلفية غير مطبقة\n' +
        'Query: getAutomatedActionLogs\n' +
        'EN: This query will fail because the automated actions backend API is not yet implemented.\n' +
        'AR: سيفشل هذا الاستعلام لأن واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.'
      )
      return automatedActionService.getAutomatedActionLogs(actionId, filters)
    },
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled: !!actionId && enabled,
    retry: false, // Don't retry since backend doesn't exist
  })
}

/**
 * Get all execution logs (admin view)
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useAllActionLogs(filters?: AutomatedActionLogFilters, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.allLogs(filters),
    queryFn: () => {
      console.warn(
        '⚠️ BACKEND NOT IMPLEMENTED | الخلفية غير مطبقة\n' +
        'Query: getAllActionLogs\n' +
        'EN: This query will fail because the automated actions backend API is not yet implemented.\n' +
        'AR: سيفشل هذا الاستعلام لأن واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.'
      )
      return automatedActionService.getAllActionLogs(filters)
    },
    staleTime: LIST_STALE_TIME,
    gcTime: LIST_GC_TIME,
    enabled,
    retry: false, // Don't retry since backend doesn't exist
  })
}

/**
 * Get available models for automation
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useAvailableModels(enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.models(),
    queryFn: () => {
      console.warn(
        '⚠️ BACKEND NOT IMPLEMENTED | الخلفية غير مطبقة\n' +
        'Query: getAvailableModels\n' +
        'EN: This query will fail because the automated actions backend API is not yet implemented.\n' +
        'AR: سيفشل هذا الاستعلام لأن واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.'
      )
      return automatedActionService.getAvailableModels()
    },
    staleTime: METADATA_STALE_TIME,
    gcTime: METADATA_STALE_TIME * 2,
    enabled,
    retry: false, // Don't retry since backend doesn't exist
  })
}

/**
 * Get fields for a specific model
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useModelFields(modelName: string, enabled = true) {
  return useQuery({
    queryKey: automatedActionKeys.modelFields(modelName),
    queryFn: () => {
      console.warn(
        '⚠️ BACKEND NOT IMPLEMENTED | الخلفية غير مطبقة\n' +
        'Query: getModelFields\n' +
        'EN: This query will fail because the automated actions backend API is not yet implemented.\n' +
        'AR: سيفشل هذا الاستعلام لأن واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.'
      )
      return automatedActionService.getModelFields(modelName)
    },
    staleTime: METADATA_STALE_TIME,
    gcTime: METADATA_STALE_TIME * 2,
    enabled: !!modelName && enabled,
    retry: false, // Don't retry since backend doesn't exist
  })
}

// ==================== ACTION MUTATIONS ====================

/**
 * Create a new automated action
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useCreateAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAutomatedActionData) => {
      logBackendNotImplemented('createAutomatedAction')
      return automatedActionService.createAutomatedAction(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم إنشاء الإجراء التلقائي بنجاح | Action created successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في إنشاء الإجراء التلقائي | Failed to create automated action'
      )
    },
  })
}

/**
 * Update an automated action
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useUpdateAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAutomatedActionData }) => {
      logBackendNotImplemented('updateAutomatedAction')
      return automatedActionService.updateAutomatedAction(id, data)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم تحديث الإجراء التلقائي | Action updated successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في تحديث الإجراء التلقائي | Failed to update automated action'
      )
    },
  })
}

/**
 * Delete an automated action
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useDeleteAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      logBackendNotImplemented('deleteAutomatedAction')
      return automatedActionService.deleteAutomatedAction(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم حذف الإجراء التلقائي | Action deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في حذف الإجراء التلقائي | Failed to delete automated action'
      )
    },
  })
}

/**
 * Toggle automated action active status
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useToggleAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      logBackendNotImplemented('toggleAutomatedAction')
      return automatedActionService.toggleAutomatedAction(id)
    },
    onSuccess: (updatedAction, id) => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success(
        updatedAction.isActive
          ? 'تم تفعيل الإجراء التلقائي | Action enabled successfully'
          : 'تم تعطيل الإجراء التلقائي | Action disabled successfully'
      )
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في تغيير حالة الإجراء التلقائي | Failed to toggle action status'
      )
    },
  })
}

/**
 * Test an automated action against a record
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useTestAutomatedAction() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestActionData }) => {
      logBackendNotImplemented('testAutomatedAction')
      return automatedActionService.testAutomatedAction(id, data)
    },
    onSuccess: (result) => {
      if (result.would_execute) {
        toast.success('الإجراء سيتم تنفيذه على هذا السجل | Action will execute on this record')
      } else {
        toast.info(
          result.reason ||
          'الإجراء لن يتم تنفيذه - الشروط غير مستوفاة | Action will not execute - conditions not met'
        )
      }
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في اختبار الإجراء | Failed to test action'
      )
    },
  })
}

/**
 * Duplicate an automated action
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useDuplicateAutomatedAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      logBackendNotImplemented('duplicateAutomatedAction')
      return automatedActionService.duplicateAutomatedAction(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم نسخ الإجراء التلقائي | Action duplicated successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في نسخ الإجراء التلقائي | Failed to duplicate action'
      )
    },
  })
}

// ==================== BULK OPERATION MUTATIONS ====================

/**
 * Enable multiple automated actions
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useEnableAutomatedActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => {
      logBackendNotImplemented('enableAutomatedActions')
      return automatedActionService.enableAutomatedActions(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم تفعيل الإجراءات المحددة | Selected actions enabled successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في تفعيل الإجراءات | Failed to enable actions'
      )
    },
  })
}

/**
 * Disable multiple automated actions
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useDisableAutomatedActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => {
      logBackendNotImplemented('disableAutomatedActions')
      return automatedActionService.disableAutomatedActions(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم تعطيل الإجراءات المحددة | Selected actions disabled successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في تعطيل الإجراءات | Failed to disable actions'
      )
    },
  })
}

/**
 * Delete multiple automated actions
 * ⚠️ WILL FAIL - Backend not implemented
 */
export function useDeleteAutomatedActions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => {
      logBackendNotImplemented('deleteAutomatedActions')
      return automatedActionService.deleteAutomatedActions(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automatedActionKeys.lists() })
      toast.success('تم حذف الإجراءات المحددة | Selected actions deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل في حذف الإجراءات | Failed to delete actions'
      )
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
