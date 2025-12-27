/**
 * Gantt Chart Hooks
 * React Query hooks for Gantt data, milestones, baselines, and resources
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
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
  ProductivityFilters,
} from '@/types/gantt'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// GANTT DATA HOOKS
// ═══════════════════════════════════════════════════════════════

export const useGanttData = (caseId: string) => {
  return useQuery({
    queryKey: QueryKeys.gantt.data(caseId),
    queryFn: () => ganttService.getGanttData(caseId),
    enabled: !!caseId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useDHtmlxGanttData = (caseId: string) => {
  return useQuery({
    queryKey: QueryKeys.gantt.dhtmlx(caseId),
    queryFn: () => ganttService.getDHtmlxData(caseId),
    enabled: !!caseId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Hook to fetch productivity Gantt data (tasks + reminders + events)
 * This aggregates all productivity items into a single Gantt view
 */
export const useProductivityGanttData = (filters?: ProductivityFilters) => {
  return useQuery({
    queryKey: QueryKeys.gantt.productivity(filters),
    queryFn: () => ganttService.getProductivityData(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useUpdateTaskSchedule = () => {
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateScheduleData }) =>
      ganttService.updateTaskSchedule(taskId, data),
    onSuccess: () => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث الجدول')
    },
  })
}

export const useUpdateTaskProgress = () => {
  return useMutation({
    mutationFn: ({ taskId, progress }: { taskId: string; progress: number }) =>
      ganttService.updateTaskProgress(taskId, progress),
    onSuccess: () => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تحديث التقدم')
    },
  })
}

export const useAddDependency = () => {
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: AddDependencyData }) =>
      ganttService.addDependency(taskId, data),
    onSuccess: () => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
      toast.success('تم إضافة الاعتمادية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إضافة الاعتمادية')
    },
  })
}

export const useRemoveDependency = () => {
  return useMutation({
    mutationFn: ({ taskId, dependencyId }: { taskId: string; dependencyId: string }) =>
      ganttService.removeDependency(taskId, dependencyId),
    onSuccess: () => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
      toast.success('تم إزالة الاعتمادية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإزالة')
    },
  })
}

export const useCriticalPath = (caseId: string) => {
  return useQuery({
    queryKey: QueryKeys.gantt.criticalPath(caseId),
    queryFn: () => ganttService.getCriticalPath(caseId),
    enabled: !!caseId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useAutoSchedule = () => {
  return useMutation({
    mutationFn: ({ caseId, options }: { caseId: string; options: AutoScheduleOptions }) =>
      ganttService.autoSchedule(caseId, options),
    onSuccess: (data) => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
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
    queryKey: QueryKeys.gantt.milestones(caseId),
    queryFn: () => milestoneService.getMilestones(caseId),
    enabled: !!caseId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateMilestone = () => {
  return useMutation({
    mutationFn: (data: CreateMilestoneData) => milestoneService.createMilestone(data),
    onSuccess: () => {
      invalidateCache.gantt.milestones()
      invalidateCache.gantt.data()
      toast.success('تم إنشاء المعلم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء المعلم')
    },
  })
}

export const useUpdateMilestone = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMilestoneData> }) =>
      milestoneService.updateMilestone(id, data),
    onSuccess: () => {
      invalidateCache.gantt.milestones()
      invalidateCache.gantt.data()
      toast.success('تم تحديث المعلم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

export const useDeleteMilestone = () => {
  return useMutation({
    mutationFn: (id: string) => milestoneService.deleteMilestone(id),
    onSuccess: () => {
      invalidateCache.gantt.milestones()
      invalidateCache.gantt.data()
      toast.success('تم حذف المعلم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحذف')
    },
  })
}

export const useCompleteMilestone = () => {
  return useMutation({
    mutationFn: (id: string) => milestoneService.completeMilestone(id),
    onSuccess: () => {
      invalidateCache.gantt.milestones()
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
    queryKey: QueryKeys.gantt.baselines(caseId),
    queryFn: () => baselineService.getBaselines(caseId),
    enabled: !!caseId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useSaveBaseline = () => {
  return useMutation({
    mutationFn: (data: CreateBaselineData) => baselineService.saveBaseline(data),
    onSuccess: () => {
      invalidateCache.gantt.baselines()
      toast.success('تم حفظ خط الأساس')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحفظ')
    },
  })
}

export const useDeleteBaseline = () => {
  return useMutation({
    mutationFn: (id: string) => baselineService.deleteBaseline(id),
    onSuccess: () => {
      invalidateCache.gantt.baselines()
      toast.success('تم حذف خط الأساس')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحذف')
    },
  })
}

export const useCompareWithBaseline = (caseId: string, baselineId: string) => {
  return useQuery({
    queryKey: QueryKeys.gantt.baselineCompare(caseId, baselineId),
    queryFn: () => baselineService.compareWithBaseline(caseId, baselineId),
    enabled: !!caseId && !!baselineId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// RESOURCE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useResourceLoading = (caseId: string) => {
  return useQuery({
    queryKey: QueryKeys.gantt.resourceLoading(caseId),
    queryFn: () => ganttResourceService.getResourceLoading(caseId),
    enabled: !!caseId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useResourceWorkload = (
  resourceId: string,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery({
    queryKey: QueryKeys.gantt.resourceWorkload(resourceId, params),
    queryFn: () => ganttResourceService.getResourceWorkload(resourceId, params),
    enabled: !!resourceId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useLevelResources = () => {
  return useMutation({
    mutationFn: (caseId: string) => ganttResourceService.levelResources(caseId),
    onSuccess: (data) => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
      invalidateCache.gantt.resourceLoading()
      toast.success(`تم تسوية الموارد - ${data.adjustedTasks} مهمة معدلة`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تسوية الموارد')
    },
  })
}

export const useAssignResource = () => {
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
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
      invalidateCache.gantt.resourceLoading()
      toast.success('تم تعيين المورد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التعيين')
    },
  })
}

export const useUnassignResource = () => {
  return useMutation({
    mutationFn: (taskId: string) => ganttResourceService.unassignResource(taskId),
    onSuccess: () => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
      invalidateCache.gantt.resourceLoading()
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
  return useMutation({
    mutationFn: ({ caseId, file }: { caseId: string; file: File }) =>
      ganttExportService.importFromMSProject(caseId, file),
    onSuccess: (data) => {
      invalidateCache.gantt.data()
      invalidateCache.gantt.dhtmlx()
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
