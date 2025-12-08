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
    // Update cache with real server data on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء المهمة بنجاح')

      // Manually update the cache with the REAL task from server
      // This avoids "flickering" and "missing fields" issues
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!old) return old

        // Handle { tasks: [...] } structure
        if (old.tasks && Array.isArray(old.tasks)) {
          return {
            ...old,
            tasks: [data, ...old.tasks],
            total: (old.total || old.tasks.length) + 1
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
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
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousQueries = queryClient.getQueriesData<{ tasks: Task[]; total: number }>({ queryKey: ['tasks'] })
      const previousTask = queryClient.getQueryData<Task>(['tasks', id])

      // Helper to check if task matches filters
      const matchesFilters = (task: Task, filters?: TaskFilters) => {
        if (!filters) return true

        // Status filter
        if (filters.status) {
          const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
          if (!statuses.includes(task.status)) return false
        }

        // Priority filter
        if (filters.priority) {
          const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority]
          if (!priorities.includes(task.priority)) return false
        }

        // Task Type filter
        if (filters.taskType) {
          const types = Array.isArray(filters.taskType) ? filters.taskType : [filters.taskType]
          if (!types.includes(task.taskType)) return false
        }

        // Search filter
        if (filters.search && typeof filters.search === 'string') {
          const searchLower = filters.search.toLowerCase()
          if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description?.toLowerCase().includes(searchLower)) {
            return false
          }
        }

        return true
      }

      // Update all matching queries manually
      previousQueries.forEach(([queryKey, oldData]) => {
        const filters = queryKey[1] as TaskFilters | undefined

        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old

          // Handle array vs object structure
          const list = Array.isArray(old) ? old : (old.tasks || old.data || [])

          // Find the task in this list
          const taskIndex = list.findIndex((t: Task) => t._id === id)

          // If task is not in this list, check if it SHOULD be after update
          if (taskIndex === -1) {
            // We need the full task object to check filters. 
            // If we have previousTask, we can merge with data.
            if (previousTask) {
              const updatedTask = { ...previousTask, ...data } as Task
              if (matchesFilters(updatedTask, filters)) {
                // Add to list
                if (Array.isArray(old)) {
                  return [updatedTask, ...old]
                }
                return {
                  ...old,
                  tasks: [updatedTask, ...list],
                  total: (old.total || list.length) + 1
                }
              }
            }
            return old
          }

          // Task IS in the list. Update it.
          const currentTask = list[taskIndex]
          const updatedTask = { ...currentTask, ...data } as Task

          // Check if it still matches filters
          if (!matchesFilters(updatedTask, filters)) {
            // Remove from list if it no longer matches
            const newList = list.filter((t: Task) => t._id !== id)
            if (Array.isArray(old)) {
              return newList
            }
            return {
              ...old,
              tasks: newList,
              total: Math.max(0, (old.total || list.length) - 1)
            }
          }

          // Update in place
          const newList = [...list]
          newList[taskIndex] = updatedTask

          if (Array.isArray(old)) {
            return newList
          }
          return {
            ...old,
            tasks: newList
          }
        })
      })

      // Update single task
      if (previousTask) {
        const updatedTask = { ...previousTask, ...data }
        if (data.billing) {
          updatedTask.billing = {
            ...previousTask.billing,
            ...data.billing,
            isBillable: data.billing.isBillable ?? previousTask.billing?.isBillable ?? true,
            billingType: data.billing.billingType || previousTask.billing?.billingType || 'hourly',
            currency: data.billing.currency || previousTask.billing?.currency || 'SAR',
            invoiceStatus: data.billing.invoiceStatus || previousTask.billing?.invoiceStatus || 'not_invoiced',
          }
        }
        queryClient.setQueryData<Task>(['tasks', id], updatedTask as Task)
      }

      return { previousQueries, previousTask }
    },
    onSuccess: () => {
      toast.success('تم تحديث المهمة بنجاح')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', id], context.previousTask)
      }
      toast.error(error.message || 'فشل تحديث المهمة')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    // Optimistic update - remove task from list immediately
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف المهمة بنجاح')

      // Optimistically remove task from all lists
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!old) return old

        // Handle { tasks: [...] } structure (Paginated response)
        if (old.tasks && Array.isArray(old.tasks)) {
          return {
            ...old,
            tasks: old.tasks.filter((t: Task) => t._id !== id),
            total: Math.max(0, (old.total || old.tasks.length) - 1)
          }
        }

        // Handle Array structure (Simple list)
        if (Array.isArray(old)) {
          return old.filter((t: Task) => t._id !== id)
        }

        return old
      })
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data, { id: taskId }) => {
      toast.success('تم رفع المرفق بنجاح')

      // Manually update the cache
      queryClient.setQueryData(['tasks', taskId], (old: any) => {
        if (!old) return old

        const newAttachment = data
        const currentAttachments = old.attachments || []

        return {
          ...old,
          attachments: [...currentAttachments, newAttachment]
        }
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع المرفق')
    },
    onSettled: async (_, __, { id }) => {
      // Removed invalidation to prevent flickering (race condition)
      // The manual cache update in onSuccess is sufficient
    },
  })
}

export const useDeleteTaskAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) => {
      try {
        return await tasksService.deleteAttachment(taskId, attachmentId)
      } catch (error: any) {
        // If 404, treat as success (already deleted)
        if (error?.response?.status === 404 || error?.status === 404) {
          return { success: true }
        }
        throw error
      }
    },
    // Update cache on success (Stable & Correct)
    onSuccess: (_, { taskId, attachmentId }) => {
      toast.success('تم حذف المرفق')

      // Manually update the cache
      queryClient.setQueryData(['tasks', taskId], (old: any) => {
        if (!old) return old

        if (old.attachments && Array.isArray(old.attachments)) {
          return {
            ...old,
            attachments: old.attachments.filter((a: any) => a._id !== attachmentId)
          }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المرفق')
    },
    onSettled: async (_, __, { taskId }) => {
      // Removed invalidation to prevent flickering (race condition)
      // The manual cache update in onSuccess is sufficient
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
        window.open(downloadUrl, '_blank', 'noopener,noreferrer')
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
    queryFn: async () => {
      const res = await tasksService.getDocuments(taskId)
      return res
    },
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data, { taskId }) => {
      toast.success('تم إنشاء المستند')

      // Manually update the cache
      queryClient.setQueryData(['tasks', taskId, 'documents'], (old: any) => {
        let newState
        if (!old) {
          newState = { documents: [data.document] }
        } else if (old.documents && Array.isArray(old.documents)) {
          // Check for duplicates
          const exists = old.documents.some((d: any) => d._id === data.document._id)
          if (exists) {
            newState = old
          } else {
            // Ensure dates exist
            const newDoc = {
              ...data.document,
              createdAt: data.document.createdAt || new Date().toISOString(),
              updatedAt: data.document.updatedAt || new Date().toISOString()
            }
            newState = {
              ...old,
              documents: [...old.documents, newDoc]
            }
          }
        } else {
          newState = old
        }
        return newState
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المستند')
    },
    onSettled: (_, __, { taskId }) => {
      // Removed invalidation to prevent flickering (race condition)
      // The manual cache update in onSuccess is sufficient
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
    onSuccess: (data, { taskId, documentId }) => {
      toast.success('تم حفظ المستند')

      // Manually update the list cache
      queryClient.setQueryData(['tasks', taskId, 'documents'], (old: any) => {
        if (!old) return old

        if (old.documents && Array.isArray(old.documents)) {
          const newState = {
            ...old,
            documents: old.documents.map((d: any) => d._id === documentId ? data.document : d)
          }
          return newState
        }
        return old
      })

      // Manually update the detail cache
      queryClient.setQueryData(['tasks', taskId, 'documents', documentId], (old: any) => {
        const newState = { ...old, document: data.document }
        return newState
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حفظ المستند')
    },
    // Use onSettled with await to ensure mutation stays pending until refetch completes
    onSettled: async (_, __, { taskId, documentId }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      await queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents'] })
      return await queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents', documentId] })
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, documentId }: { taskId: string; documentId: string }) => {
      try {
        return await tasksService.deleteDocument(taskId, documentId)
      } catch (error: any) {
        // If 404, treat as success (already deleted)
        if (error?.response?.status === 404 || error?.status === 404) {
          return { success: true }
        }
        throw error
      }
    },
    // Update cache on success (Stable & Correct)
    onSuccess: (_, { taskId, documentId }) => {
      toast.success('تم حذف المستند')

      // Manually update the cache
      queryClient.setQueryData(['tasks', taskId, 'documents'], (old: any) => {
        if (!old) {
          return old
        }

        if (old.documents && Array.isArray(old.documents)) {
          const newState = {
            ...old,
            documents: old.documents.filter((d: any) => d._id !== documentId)
          }
          return newState
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المستند')
    },
    onSettled: (_, __, { taskId }) => {
      // Removed invalidation to prevent flickering (race condition)
      // The manual cache update in onSuccess is sufficient
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
      toast.success('تم رفع المذكرة الصوتية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع المذكرة الصوتية')
    },
    onSettled: async (_, __, { taskId }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['tasks', taskId], refetchType: 'all' })
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
      toast.success('تم حذف المذكرة الصوتية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المذكرة الصوتية')
    },
    onSettled: async (_, __, { taskId }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['tasks', taskId], refetchType: 'all' })
    },
  })
}
