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
  WorkflowRule,
  TaskOutcome,
  TimeBudget,
  Comment,
  TaskDocument,
  Attachment,
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

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, progress, autoCalculate }: { id: string; progress?: number; autoCalculate?: boolean }) =>
      tasksService.updateProgress(id, progress, autoCalculate),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تحديث تقدم المهمة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التقدم')
    },
  })
}

// ==================== Subtask Mutation Hooks ====================

export const useAddSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtask }: { taskId: string; subtask: Omit<Subtask, '_id' | 'order'> }) =>
      tasksService.addSubtask(taskId, subtask),
    // Optimistic update - add subtask to UI immediately
    onMutate: async ({ taskId, subtask }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      if (previousTask) {
        const tempId = `temp-${Date.now()}`
        const newSubtask: Subtask = {
          _id: tempId,
          ...subtask,
          order: (previousTask.subtasks?.length || 0) + 1
        }
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          subtasks: [...(previousTask.subtasks || []), newSubtask]
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل إضافة المهمة الفرعية')
    },
    onSuccess: () => {
      toast.success('تم إضافة المهمة الفرعية')
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

export const useUpdateSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskId, data }: { taskId: string; subtaskId: string; data: Partial<Subtask> }) =>
      tasksService.updateSubtask(taskId, subtaskId, data),
    onMutate: async ({ taskId, subtaskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          subtasks: previousTask.subtasks?.map(s =>
            s._id === subtaskId ? { ...s, ...data } : s
          ) || []
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل تحديث المهمة الفرعية')
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

export const useToggleSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      tasksService.toggleSubtask(taskId, subtaskId),
    // Optimistic update - toggle immediately
    onMutate: async ({ taskId, subtaskId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          subtasks: previousTask.subtasks?.map(s =>
            s._id === subtaskId ? { ...s, completed: !s.completed } : s
          ) || []
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل تحديث المهمة الفرعية')
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

export const useDeleteSubtask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      tasksService.deleteSubtask(taskId, subtaskId),
    // Optimistic update - remove immediately
    onMutate: async ({ taskId, subtaskId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          subtasks: previousTask.subtasks?.filter(s => s._id !== subtaskId) || []
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل حذف المهمة الفرعية')
    },
    onSuccess: () => {
      toast.success('تم حذف المهمة الفرعية')
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
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
    // Optimistic update - add comment immediately
    onMutate: async ({ taskId, text, mentions }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      if (previousTask) {
        const newComment: Comment = {
          _id: `temp-${Date.now()}`,
          userId: 'current-user',
          text,
          mentions,
          createdAt: new Date().toISOString()
        }
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          comments: [...(previousTask.comments || []), newComment]
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل إضافة التعليق')
    },
    onSuccess: () => {
      toast.success('تم إضافة التعليق')
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

export const useUpdateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, commentId, text }: { taskId: string; commentId: string; text: string }) =>
      tasksService.updateComment(taskId, commentId, text),
    onMutate: async ({ taskId, commentId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          comments: previousTask.comments?.map(c =>
            c._id === commentId ? { ...c, text, isEdited: true, updatedAt: new Date().toISOString() } : c
          ) || []
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل تحديث التعليق')
    },
    onSuccess: () => {
      toast.success('تم تحديث التعليق')
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      tasksService.deleteComment(taskId, commentId),
    // Optimistic update - remove comment immediately
    onMutate: async ({ taskId, commentId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          comments: previousTask.comments?.filter(c => c._id !== commentId) || []
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل حذف التعليق')
    },
    onSuccess: () => {
      toast.success('تم حذف التعليق')
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

// ==================== Attachment Hooks ====================

export const useUploadTaskAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file, onProgress }: { id: string; file: File; onProgress?: (percent: number) => void }) =>
      tasksService.uploadAttachment(id, file, onProgress),
    // Optimistic update - show file immediately with "uploading" state
    onMutate: async ({ id, file }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', id] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', id])

      if (previousTask) {
        const tempAttachment: Attachment = {
          _id: `temp-${Date.now()}`,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file), // Temporary local URL
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: 'current-user',
          uploadedAt: new Date().toISOString(),
          storageType: 'local'
        }
        queryClient.setQueryData<Task>(['tasks', id], {
          ...previousTask,
          attachments: [...(previousTask.attachments || []), tempAttachment]
        })
      }

      return { previousTask }
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', id], context.previousTask)
      }
      toast.error(error.message || 'فشل رفع المرفق')
    },
    onSuccess: () => {
      toast.success('تم رفع المرفق بنجاح')
    },
    // Use onSettled with await to replace temp file with real one from server
    onSettled: async (_, __, { id }) => {
      return await queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })
}

export const useDeleteTaskAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      tasksService.deleteAttachment(taskId, attachmentId),
    // Optimistic update - immediately remove from UI
    onMutate: async ({ taskId, attachmentId }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] })

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData<Task>(['tasks', taskId])

      // Optimistically update the cache - remove the attachment immediately
      if (previousTask) {
        queryClient.setQueryData<Task>(['tasks', taskId], {
          ...previousTask,
          attachments: previousTask.attachments?.filter(a => a._id !== attachmentId) || []
        })
      }

      // Return context with the previous value for rollback
      return { previousTask }
    },
    onError: (error: Error, { taskId }, context) => {
      // Roll back to the previous value on error
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask)
      }
      toast.error(error.message || 'فشل حذف المرفق')
    },
    onSuccess: () => {
      toast.success('تم حذف المرفق')
    },
    onSettled: (_, __, { taskId }) => {
      // Always refetch after error or success to ensure we have correct server state
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
    },
  })
}

export const useGetAttachmentDownloadUrl = () => {
  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      tasksService.getAttachmentDownloadUrl(taskId, attachmentId),
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الحصول على رابط التحميل')
    },
  })
}

// ==================== Attachment Versioning Hooks ====================

export const useAttachmentVersions = (taskId: string, attachmentId: string) => {
  return useQuery({
    queryKey: ['task-attachment-versions', taskId, attachmentId],
    queryFn: () => tasksService.getAttachmentVersions(taskId, attachmentId),
    enabled: !!taskId && !!attachmentId,
  })
}

export const useAttachmentVersionDownload = () => {
  return useMutation({
    mutationFn: async ({
      taskId,
      attachmentId,
      versionId,
      disposition = 'attachment',
      fileName,
    }: {
      taskId: string
      attachmentId: string
      versionId?: string
      disposition?: 'inline' | 'attachment'
      fileName?: string
    }) => {
      const { downloadUrl } = await tasksService.getAttachmentVersionDownloadUrl(
        taskId,
        attachmentId,
        { versionId, disposition }
      )

      if (disposition === 'inline') {
        window.open(downloadUrl, '_blank')
      } else {
        const link = document.createElement('a')
        link.href = downloadUrl
        if (fileName) link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      return { downloadUrl }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحميل النسخة')
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

// ==================== Dependency Hooks ====================

export const useAvailableDependencies = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'available-dependencies'],
    queryFn: () => tasksService.getAvailableDependencies(taskId),
    enabled: !!taskId,
  })
}

export const useAddDependency = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, dependencyTaskId, type }: { taskId: string; dependencyTaskId: string; type: 'blocks' | 'blocked_by' }) =>
      tasksService.addDependency(taskId, dependencyTaskId, type),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('تم إضافة التبعية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة التبعية')
    },
  })
}

export const useRemoveDependency = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, dependencyTaskId }: { taskId: string; dependencyTaskId: string }) =>
      tasksService.removeDependency(taskId, dependencyTaskId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('تم إزالة التبعية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إزالة التبعية')
    },
  })
}

// ==================== Workflow Rule Hooks ====================

export const useAddWorkflowRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, rule }: { taskId: string; rule: Omit<WorkflowRule, '_id' | 'createdAt' | 'createdBy'> }) =>
      tasksService.addWorkflowRule(taskId, rule),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم إضافة قاعدة العمل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة قاعدة العمل')
    },
  })
}

export const useUpdateWorkflowRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, ruleId, rule }: { taskId: string; ruleId: string; rule: Partial<WorkflowRule> }) =>
      tasksService.updateWorkflowRule(taskId, ruleId, rule),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم تحديث قاعدة العمل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث قاعدة العمل')
    },
  })
}

export const useDeleteWorkflowRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, ruleId }: { taskId: string; ruleId: string }) =>
      tasksService.deleteWorkflowRule(taskId, ruleId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم حذف قاعدة العمل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف قاعدة العمل')
    },
  })
}

export const useToggleWorkflowRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, ruleId }: { taskId: string; ruleId: string }) =>
      tasksService.toggleWorkflowRule(taskId, ruleId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم تغيير حالة قاعدة العمل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تغيير حالة قاعدة العمل')
    },
  })
}

// ==================== Outcome Hooks ====================

export const useUpdateOutcome = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, outcome }: { taskId: string; outcome: TaskOutcome }) =>
      tasksService.updateOutcome(taskId, outcome),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('تم تحديث نتيجة المهمة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث النتيجة')
    },
  })
}

// ==================== Estimate & Budget Hooks ====================

export const useUpdateEstimate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, estimate }: { taskId: string; estimate: TimeBudget }) =>
      tasksService.updateEstimate(taskId, estimate),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'time-tracking'] })
      toast.success('تم تحديث التقدير')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التقدير')
    },
  })
}

export const useTimeTrackingDetails = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'time-tracking-details'],
    queryFn: () => tasksService.getTimeTrackingDetails(taskId),
    enabled: !!taskId,
  })
}

// ==================== Document Hooks (TipTap Editor) ====================

export const useDocuments = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'documents'],
    queryFn: () => tasksService.getDocuments(taskId),
    enabled: !!taskId,
  })
}

export const useDocument = (taskId: string, documentId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId, 'documents', documentId],
    queryFn: () => tasksService.getDocument(taskId, documentId),
    enabled: !!taskId && !!documentId,
  })
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, title, content, contentJson }: {
      taskId: string
      title: string
      content: string
      contentJson?: any
    }) => tasksService.createDocument(taskId, title, content, contentJson),
    // Optimistic update - show document immediately
    onMutate: async ({ taskId, title, content, contentJson }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId, 'documents'] })
      const previousDocs = queryClient.getQueryData<{ documents: TaskDocument[] }>(['tasks', taskId, 'documents'])

      if (previousDocs) {
        const tempDoc: TaskDocument = {
          _id: `temp-${Date.now()}`,
          fileName: `${title}.html`,
          title,
          content,
          contentJson,
          contentFormat: 'tiptap-json',
          fileType: 'text/html',
          createdAt: new Date().toISOString()
        }
        queryClient.setQueryData<{ documents: TaskDocument[] }>(['tasks', taskId, 'documents'], {
          documents: [...(previousDocs.documents || []), tempDoc]
        })
      }

      return { previousDocs }
    },
    onSuccess: () => {
      toast.success('تم إنشاء المستند')
    },
    onError: (error: Error, { taskId }, context) => {
      if (context?.previousDocs) {
        queryClient.setQueryData(['tasks', taskId, 'documents'], context.previousDocs)
      }
      toast.error(error.message || 'فشل إنشاء المستند')
    },
    // Use onSettled with await to replace temp doc with real one from server
    onSettled: async (_, __, { taskId }) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      return await queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents'] })
    },
  })
}

export const useUpdateDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, documentId, data }: {
      taskId: string
      documentId: string
      data: { title?: string; content?: string; contentJson?: any }
    }) => tasksService.updateDocument(taskId, documentId, data),
    onSuccess: () => {
      toast.success('تم حفظ المستند')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حفظ المستند')
    },
    // Use onSettled with await to ensure mutation stays pending until refetch completes
    onSettled: async (_, __, { taskId, documentId }) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      await queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents'] })
      return await queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents', documentId] })
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, documentId }: { taskId: string; documentId: string }) =>
      tasksService.deleteDocument(taskId, documentId),
    // Optimistic update - remove document immediately from UI
    onMutate: async ({ taskId, documentId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId, 'documents'] })
      const previousDocs = queryClient.getQueryData<{ documents: TaskDocument[] }>(['tasks', taskId, 'documents'])

      if (previousDocs) {
        queryClient.setQueryData<{ documents: TaskDocument[] }>(['tasks', taskId, 'documents'], {
          documents: previousDocs.documents?.filter(d => d._id !== documentId) || []
        })
      }

      return { previousDocs }
    },
    onSuccess: () => {
      toast.success('تم حذف المستند')
    },
    onError: (error: Error, { taskId }, context) => {
      // Rollback on error
      if (context?.previousDocs) {
        queryClient.setQueryData(['tasks', taskId, 'documents'], context.previousDocs)
      }
      toast.error(error.message || 'فشل حذف المستند')
    },
    // Use onSettled with await to ensure mutation stays pending until refetch completes
    onSettled: async (_, __, { taskId }) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      return await queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents'] })
    },
  })
}

// ==================== Voice Memo Hooks ====================

export const useUploadVoiceMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, file, duration }: { taskId: string; file: Blob; duration: number }) =>
      tasksService.uploadVoiceMemo(taskId, file, duration),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم رفع المذكرة الصوتية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع المذكرة الصوتية')
    },
  })
}

export const useUpdateVoiceMemoTranscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, memoId, transcription }: {
      taskId: string
      memoId: string
      transcription: string
    }) => tasksService.updateVoiceMemoTranscription(taskId, memoId, transcription),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم تحديث النص')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث النص')
    },
  })
}

export const useDeleteVoiceMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, memoId }: { taskId: string; memoId: string }) =>
      tasksService.deleteVoiceMemo(taskId, memoId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('تم حذف المذكرة الصوتية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المذكرة الصوتية')
    },
  })
}
