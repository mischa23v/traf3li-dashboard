/**
 * Tasks Hooks
 * TanStack Query hooks for task operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import tasksService, {
  TaskFilters,
  CreateTaskData,
} from '@/services/tasksService'

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

export const useUpcomingTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'upcoming'],
    queryFn: () => tasksService.getUpcoming(),
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

export const useCompleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksService.completeTask(id),
    onSuccess: (_, id) => {
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
