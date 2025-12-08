/**
 * Gantt Chart Hooks
 * React Query hooks for Gantt data, milestones, baselines, and resources
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ganttService,
  milestoneService,
  baselineService,
  ganttResourceService,
  ganttExportService,
} from '@/services/ganttService'
import type {
  UpdateScheduleData,
  AddDependencyData,
  CreateMilestoneData,
  CreateBaselineData,
  AutoScheduleOptions,
} from '@/types/gantt'

// ═══════════════════════════════════════════════════════════════
// GANTT DATA HOOKS
// ═══════════════════════════════════════════════════════════════

export const useGanttData = (caseId: string) => {
  return useQuery({
    queryKey: ['gantt-data', caseId],
    queryFn: () => ganttService.getGanttData(caseId),
    enabled: !!caseId,
    staleTime: 30 * 1000,
  })
}

export const useDHtmlxGanttData = (caseId: string) => {
  return useQuery({
    queryKey: ['gantt-dhtmlx', caseId],
    queryFn: () => ganttService.getDHtmlxData(caseId),
    enabled: !!caseId,
    staleTime: 30 * 1000,
  })
}

export const useUpdateTaskSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateScheduleData }) =>
      ganttService.updateTaskSchedule(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الجدول')
    },
  })
}

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, progress }: { taskId: string; progress: number }) =>
      ganttService.updateTaskProgress(taskId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث التقدم')
    },
  })
}

export const useAddDependency = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: AddDependencyData }) =>
      ganttService.addDependency(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
      toast.success('تم إضافة الاعتمادية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة الاعتمادية')
    },
  })
}

export const useRemoveDependency = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, dependencyId }: { taskId: string; dependencyId: string }) =>
      ganttService.removeDependency(taskId, dependencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
      toast.success('تم إزالة الاعتمادية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإزالة')
    },
  })
}

export const useCriticalPath = (caseId: string) => {
  return useQuery({
    queryKey: ['gantt-critical-path', caseId],
    queryFn: () => ganttService.getCriticalPath(caseId),
    enabled: !!caseId,
    staleTime: 60 * 1000,
  })
}

export const useAutoSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseId, options }: { caseId: string; options: AutoScheduleOptions }) =>
      ganttService.autoSchedule(caseId, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
      toast.success(`تم تحديث جدول ${data.tasksUpdated} مهمة`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الجدولة التلقائية')
    },
  })
}

export const useValidateDependencies = () => {
  return useMutation({
    mutationFn: (caseId: string) => ganttService.validateDependencies(caseId),
    onSuccess: (data) => {
      if (data.valid) {
        toast.success('جميع الاعتماديات صحيحة')
      } else {
        toast.error(`تم العثور على ${data.errors.length} خطأ في الاعتماديات`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحقق')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// MILESTONE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useMilestones = (caseId: string) => {
  return useQuery({
    queryKey: ['gantt-milestones', caseId],
    queryFn: () => milestoneService.getMilestones(caseId),
    enabled: !!caseId,
    staleTime: 60 * 1000,
  })
}

export const useCreateMilestone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMilestoneData) => milestoneService.createMilestone(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gantt-milestones', variables.caseId] })
      queryClient.invalidateQueries({ queryKey: ['gantt-data', variables.caseId] })
      toast.success('تم إنشاء المعلم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء المعلم')
    },
  })
}

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMilestoneData> }) =>
      milestoneService.updateMilestone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-milestones'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      toast.success('تم تحديث المعلم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => milestoneService.deleteMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-milestones'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      toast.success('تم حذف المعلم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحذف')
    },
  })
}

export const useCompleteMilestone = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => milestoneService.completeMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-milestones'] })
      toast.success('تم إكمال المعلم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإكمال')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// BASELINE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useBaselines = (caseId: string) => {
  return useQuery({
    queryKey: ['gantt-baselines', caseId],
    queryFn: () => baselineService.getBaselines(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSaveBaseline = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBaselineData) => baselineService.saveBaseline(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gantt-baselines', variables.caseId] })
      toast.success('تم حفظ خط الأساس')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحفظ')
    },
  })
}

export const useDeleteBaseline = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => baselineService.deleteBaseline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-baselines'] })
      toast.success('تم حذف خط الأساس')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحذف')
    },
  })
}

export const useCompareWithBaseline = (caseId: string, baselineId: string) => {
  return useQuery({
    queryKey: ['gantt-baseline-compare', caseId, baselineId],
    queryFn: () => baselineService.compareWithBaseline(caseId, baselineId),
    enabled: !!caseId && !!baselineId,
    staleTime: 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// RESOURCE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useResourceLoading = (caseId: string) => {
  return useQuery({
    queryKey: ['gantt-resource-loading', caseId],
    queryFn: () => ganttResourceService.getResourceLoading(caseId),
    enabled: !!caseId,
    staleTime: 60 * 1000,
  })
}

export const useResourceWorkload = (
  resourceId: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: ['gantt-resource-workload', resourceId, params],
    queryFn: () => ganttResourceService.getResourceWorkload(resourceId, params),
    enabled: !!resourceId,
    staleTime: 60 * 1000,
  })
}

export const useLevelResources = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (caseId: string) => ganttResourceService.levelResources(caseId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-resource-loading'] })
      toast.success(`تم تسوية الموارد - ${data.adjustedTasks} مهمة معدلة`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تسوية الموارد')
    },
  })
}

export const useAssignResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      resourceId,
      hoursPerDay,
    }: {
      taskId: string
      resourceId: string
      hoursPerDay?: number
    }) => ganttResourceService.assignResource(taskId, resourceId, hoursPerDay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-resource-loading'] })
      toast.success('تم تعيين المورد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التعيين')
    },
  })
}

export const useUnassignResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => ganttResourceService.unassignResource(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] })
      queryClient.invalidateQueries({ queryKey: ['gantt-resource-loading'] })
      toast.success('تم إلغاء تعيين المورد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإلغاء')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// EXPORT HOOKS
// ═══════════════════════════════════════════════════════════════

export const useExportGanttPDF = () => {
  return useMutation({
    mutationFn: ({
      caseId,
      options,
    }: {
      caseId: string
      options?: {
        showCriticalPath?: boolean
        showBaseline?: boolean
        pageSize?: 'A4' | 'A3' | 'Letter'
        orientation?: 'portrait' | 'landscape'
      }
    }) => ganttExportService.exportToPDF(caseId, options),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gantt-chart-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير مخطط جانت')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التصدير')
    },
  })
}

export const useExportGanttExcel = () => {
  return useMutation({
    mutationFn: (caseId: string) => ganttExportService.exportToExcel(caseId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gantt-chart-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير البيانات')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التصدير')
    },
  })
}

export const useExportMSProject = () => {
  return useMutation({
    mutationFn: (caseId: string) => ganttExportService.exportToMSProject(caseId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-${new Date().toISOString().split('T')[0]}.mpp`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير ملف MS Project')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التصدير')
    },
  })
}

export const useImportMSProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ caseId, file }: { caseId: string; file: File }) =>
      ganttExportService.importFromMSProject(caseId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gantt-data', variables.caseId] })
      queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx', variables.caseId] })
      toast.success(`تم استيراد ${data.imported} مهمة`)
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} أخطاء أثناء الاستيراد`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الاستيراد')
    },
  })
}
