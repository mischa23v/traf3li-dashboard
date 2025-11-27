/**
 * Tasks Hooks
 * Production-ready TanStack Query hooks for comprehensive task operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import tasksService, {
  TaskFilters,
  CreateTaskData,
  TaskStatus,
  Subtask,
  Task,
  TaskStats,
  BulkOperationResult,
} from '@/services/tasksService'

// ==================== Query Hooks ====================

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksService.getTasks(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksService.getTask(id),
    enabled: !!id,
  })
}

export const useUpcomingTasks = (days: number = 7) => {
  return useQuery({
    queryKey: ['tasks', 'upcoming', days],
    queryFn: () => tasksService.getUpcoming(days),
    staleTime: 1 * 60 * 1000,
  })
}

export const useOverdueTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: () => tasksService.getOverdue(),
    staleTime: 1 * 60 * 1000,
  })
}

export const useDueTodayTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'due-today'],
    queryFn: () => tasksService.getDueToday(),
    staleTime: 1 * 60 * 1000,
  })
}

export const useMyTasks = (filters?: Omit<TaskFilters, 'assignedTo'>) => {
  return useQuery({
    queryKey: ['tasks', 'my-tasks', filters],
    queryFn: () => tasksService.getMyTasks(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useTaskStats = (filters?: { caseId?: string; assignedTo?: string; dateFrom?: string; dateTo?: string }) => {
  return useQuery<TaskStats>({
    queryKey: ['tasks', 'stats', filters],
    queryFn: () => tasksService.getStats(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTaskTemplates = () => {
  return useQuery({
    queryKey: ['tasks', 'templates'],
    queryFn: () => tasksService.getTemplates(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTimeTrackingSummary = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'time-tracking'],
    queryFn: () => tasksService.getTimeTrackingSummary(taskId),
    enabled: !!taskId,
  })
}

export const useRecurrenceHistory = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'recurrence-history'],
    queryFn: () => tasksService.getRecurrenceHistory(taskId),
    enabled: !!taskId,
  })
}

// ==================== CRUD Mutation Hooks ====================

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskData) => tasksService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إنشاء المهمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المهمة')
    },
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskData> }) =>
      tasksService.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تحديث المهمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المهمة')
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم حذف المهمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المهمة')
    },
  })
}

// ==================== Status Mutation Hooks ====================

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تحديث حالة المهمة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الحالة')
    },
  })
}

export const useCompleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, completionNotes }: { id: string; completionNotes?: string }) =>
      tasksService.completeTask(id, completionNotes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إكمال المهمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال المهمة')
    },
  })
}

export const useReopenTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksService.reopenTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إعادة فتح المهمة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة فتح المهمة')
    },
  })
}

// ==================== Subtask Mutation Hooks ====================

export const useAddSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtask }: { taskId: string; subtask: Omit<Subtask, '_id' | 'order'> }) =>
      tasksService.addSubtask(taskId, subtask),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم إضافة المهمة الفرعية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة المهمة الفرعية')
    },
  })
}

export const useUpdateSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskId, data }: { taskId: string; subtaskId: string; data: Partial<Subtask> }) =>
      tasksService.updateSubtask(taskId, subtaskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المهمة الفرعية')
    },
  })
}

export const useToggleSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      tasksService.toggleSubtask(taskId, subtaskId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المهمة الفرعية')
    },
  })
}

export const useDeleteSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      tasksService.deleteSubtask(taskId, subtaskId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم حذف المهمة الفرعية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المهمة الفرعية')
    },
  })
}

export const useReorderSubtasks = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskIds }: { taskId: string; subtaskIds: string[] }) =>
      tasksService.reorderSubtasks(taskId, subtaskIds),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة ترتيب المهام الفرعية')
    },
  })
}

// ==================== Time Tracking Hooks ====================

export const useStartTimeTracking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksService.startTimeTracking(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'time-tracking'] })
      toast.success('تم بدء تتبع الوقت')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل بدء تتبع الوقت')
    },
  })
}

export const useStopTimeTracking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, notes }: { taskId: string; notes?: string }) =>
      tasksService.stopTimeTracking(taskId, notes),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'time-tracking'] })
      toast.success('تم إيقاف تتبع الوقت')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف تتبع الوقت')
    },
  })
}

export const useAddTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: { minutes: number; date: string; notes?: string } }) =>
      tasksService.addTimeEntry(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'time-tracking'] })
      toast.success('تم إضافة وقت يدوي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الوقت')
    },
  })
}

// ==================== Comment Hooks ====================

export const useAddComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, text, mentions }: { taskId: string; text: string; mentions?: string[] }) =>
      tasksService.addComment(taskId, text, mentions),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم إضافة التعليق')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة التعليق')
    },
  })
}

export const useUpdateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, commentId, text }: { taskId: string; commentId: string; text: string }) =>
      tasksService.updateComment(taskId, commentId, text),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم تحديث التعليق')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التعليق')
    },
  })
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      tasksService.deleteComment(taskId, commentId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم حذف التعليق')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التعليق')
    },
  })
}

// ==================== Attachment Hooks ====================

export const useUploadTaskAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      tasksService.uploadAttachment(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      toast.success('تم رفع المرفق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع المرفق')
    },
  })
}

export const useDeleteTaskAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      tasksService.deleteAttachment(taskId, attachmentId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم حذف المرفق')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المرفق')
    },
  })
}

// ==================== Template Hooks ====================

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, overrides }: { templateId: string; overrides?: Partial<CreateTaskData> }) =>
      tasksService.createFromTemplate(templateId, overrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('تم إنشاء المهمة من القالب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المهمة من القالب')
    },
  })
}

export const useSaveAsTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, templateName }: { taskId: string; templateName: string }) =>
      tasksService.saveAsTemplate(taskId, templateName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'templates'] })
      toast.success('تم حفظ المهمة كقالب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حفظ القالب')
    },
  })
}

// ==================== Bulk Operation Hooks ====================

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient()

  return useMutation<BulkOperationResult, Error, { taskIds: string[]; data: Partial<CreateTaskData> }>({
    mutationFn: ({ taskIds, data }) => tasksService.bulkUpdate(taskIds, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`تم تحديث ${result.success} مهمة`)
      if (result.failed > 0) {
        toast.warning(`فشل تحديث ${result.failed} مهمة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التحديث الجماعي')
    },
  })
}

export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient()

  return useMutation<BulkOperationResult, Error, string[]>({
    mutationFn: (taskIds) => tasksService.bulkDelete(taskIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`تم حذف ${result.success} مهمة`)
      if (result.failed > 0) {
        toast.warning(`فشل حذف ${result.failed} مهمة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الحذف الجماعي')
    },
  })
}

export const useBulkCompleteTasks = () => {
  const queryClient = useQueryClient()

  return useMutation<BulkOperationResult, Error, string[]>({
    mutationFn: (taskIds) => tasksService.bulkComplete(taskIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`تم إكمال ${result.success} مهمة`)
      if (result.failed > 0) {
        toast.warning(`فشل إكمال ${result.failed} مهمة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الإكمال الجماعي')
    },
  })
}

export const useBulkAssignTasks = () => {
  const queryClient = useQueryClient()

  return useMutation<BulkOperationResult, Error, { taskIds: string[]; assignedTo: string }>({
    mutationFn: ({ taskIds, assignedTo }) => tasksService.bulkAssign(taskIds, assignedTo),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`تم تعيين ${result.success} مهمة`)
      if (result.failed > 0) {
        toast.warning(`فشل تعيين ${result.failed} مهمة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التعيين الجماعي')
    },
  })
}

// ==================== Import/Export Hooks ====================

export const useImportTasks = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => tasksService.importTasks(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`تم استيراد ${result.imported} مهمة بنجاح`)
      if (result.failed > 0) {
        toast.warning(`فشل استيراد ${result.failed} مهمة`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استيراد المهام')
    },
  })
}

export const useExportTasks = () => {
  return useMutation({
    mutationFn: (filters?: TaskFilters) => tasksService.exportTasks(filters),
    onSuccess: (blob) => {
      // Download the blob
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('تم تصدير المهام بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير المهام')
    },
  })
}

// ==================== Recurring Task Hooks ====================

export const useSkipRecurrence = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksService.skipRecurrence(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('تم تخطي الموعد التالي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تخطي الموعد')
    },
  })
}

export const useStopRecurrence = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksService.stopRecurrence(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('تم إيقاف التكرار')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف التكرار')
    },
  })
}
