import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  reportsApi,
  Report,
  ReportFilters,
  CreateReportInput,
  UpdateReportInput,
  ReportCategory,
  ReportSection,
  OutputFormat,
  ScheduleFrequency,
  DataModule,
  ReportFilter,
  DistributionRecipient
} from '@/services/reportsService'
import { toast } from 'sonner'

// Query Keys
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters?: ReportFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  byCategory: (category: ReportCategory) => [...reportKeys.all, 'by-category', category] as const,
  bySection: (section: ReportSection) => [...reportKeys.all, 'by-section', section] as const,
  stats: (officeId?: string) => [...reportKeys.all, 'stats', officeId] as const,
  favorites: () => [...reportKeys.all, 'favorites'] as const,
  executionHistory: (id: string) => [...reportKeys.all, 'execution-history', id] as const,
  dataSources: () => [...reportKeys.all, 'data-sources'] as const
}

// ==================== QUERY HOOKS ====================

// Get all reports
export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportsApi.getAll(filters)
  })
}

// Get single report
export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsApi.getById(id),
    enabled: !!id
  })
}

// Get reports by category
export function useReportsByCategory(category: ReportCategory) {
  return useQuery({
    queryKey: reportKeys.byCategory(category),
    queryFn: () => reportsApi.getByCategory(category),
    enabled: !!category
  })
}

// Get reports by section
export function useReportsBySection(section: ReportSection) {
  return useQuery({
    queryKey: reportKeys.bySection(section),
    queryFn: () => reportsApi.getBySection(section),
    enabled: !!section
  })
}

// Get report statistics
export function useReportStats(officeId?: string) {
  return useQuery({
    queryKey: reportKeys.stats(officeId),
    queryFn: () => reportsApi.getStats(officeId)
  })
}

// Get favorite reports
export function useFavoriteReports() {
  return useQuery({
    queryKey: reportKeys.favorites(),
    queryFn: () => reportsApi.getFavorites()
  })
}

// Get execution history
export function useExecutionHistory(id: string) {
  return useQuery({
    queryKey: reportKeys.executionHistory(id),
    queryFn: () => reportsApi.getExecutionHistory(id),
    enabled: !!id
  })
}

// Get available data sources
export function useDataSources() {
  return useQuery({
    queryKey: reportKeys.dataSources(),
    queryFn: () => reportsApi.getDataSources()
  })
}

// ==================== MUTATION HOOKS ====================

// Create report
export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReportInput) => reportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم إنشاء التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل إنشاء التقرير: ${error.message}`)
    }
  })
}

// Update report
export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportInput }) =>
      reportsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) })
      toast.success('تم تحديث التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث التقرير: ${error.message}`)
    }
  })
}

// Delete report
export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم حذف التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف التقرير: ${error.message}`)
    }
  })
}

// Bulk delete reports
export function useBulkDeleteReports() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => reportsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم حذف التقارير المحددة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل حذف التقارير: ${error.message}`)
    }
  })
}

// ==================== EXECUTION MUTATION HOOKS ====================

// Run report
export function useRunReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, parameters }: { id: string; parameters?: Record<string, any> }) =>
      reportsApi.runReport(id, parameters),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.stats() })
      toast.success('تم تشغيل التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل تشغيل التقرير: ${error.message}`)
    }
  })
}

// Export report
export function useExportReport() {
  return useMutation({
    mutationFn: ({ id, format, parameters }: {
      id: string
      format: OutputFormat
      parameters?: Record<string, any>
    }) => reportsApi.exportReport(id, format, parameters),
    onSuccess: (data) => {
      toast.success('تم تصدير التقرير بنجاح')
      // Optionally trigger download
      if (data.fileUrl) {
        window.open(data.fileUrl, '_blank')
      }
    },
    onError: (error: Error) => {
      toast.error(`فشل تصدير التقرير: ${error.message}`)
    }
  })
}

// Preview report data
export function usePreviewReportData() {
  return useMutation({
    mutationFn: (config: {
      dataModules: DataModule[]
      columns: string[]
      filters?: ReportFilter[]
      limit?: number
    }) => reportsApi.previewData(config),
    onError: (error: Error) => {
      toast.error(`فشل معاينة البيانات: ${error.message}`)
    }
  })
}

// ==================== SCHEDULING MUTATION HOOKS ====================

// Schedule report
export function useScheduleReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, schedule }: {
      id: string
      schedule: {
        frequency: ScheduleFrequency
        startDate: string
        endDate?: string
        time: string
        distributionList?: DistributionRecipient[]
      }
    }) => reportsApi.scheduleReport(id, schedule),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم جدولة التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل جدولة التقرير: ${error.message}`)
    }
  })
}

// Pause schedule
export function usePauseSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsApi.pauseSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم إيقاف جدولة التقرير مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(`فشل إيقاف الجدولة: ${error.message}`)
    }
  })
}

// Resume schedule
export function useResumeSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsApi.resumeSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم استئناف جدولة التقرير')
    },
    onError: (error: Error) => {
      toast.error(`فشل استئناف الجدولة: ${error.message}`)
    }
  })
}

// ==================== FAVORITES MUTATION HOOKS ====================

// Add to favorites
export function useAddToFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsApi.addToFavorites(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.favorites() })
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم إضافة التقرير إلى المفضلة')
    },
    onError: (error: Error) => {
      toast.error(`فشل إضافة التقرير إلى المفضلة: ${error.message}`)
    }
  })
}

// Remove from favorites
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsApi.removeFromFavorites(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.favorites() })
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم إزالة التقرير من المفضلة')
    },
    onError: (error: Error) => {
      toast.error(`فشل إزالة التقرير من المفضلة: ${error.message}`)
    }
  })
}

// ==================== OTHER MUTATION HOOKS ====================

// Duplicate report
export function useDuplicateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      reportsApi.duplicate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      toast.success('تم نسخ التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل نسخ التقرير: ${error.message}`)
    }
  })
}

// Share report
export function useShareReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, recipients }: {
      id: string
      recipients: Array<{
        userId?: string
        email?: string
        permissions: string[]
      }>
    }) => reportsApi.shareReport(id, recipients),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) })
      toast.success('تم مشاركة التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(`فشل مشاركة التقرير: ${error.message}`)
    }
  })
}
