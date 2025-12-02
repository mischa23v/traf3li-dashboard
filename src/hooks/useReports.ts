import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  reportsService,
  type ReportConfig,
  type ReportType,
  type SavedReport,
  type DashboardWidget,
} from '@/services/reportsService'

// Query key factory
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters?: { type?: ReportType; search?: string }) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  revenue: (config: Partial<ReportConfig>) => [...reportKeys.all, 'revenue', config] as const,
  cases: (config: Partial<ReportConfig>) => [...reportKeys.all, 'cases', config] as const,
  clients: (config: Partial<ReportConfig>) => [...reportKeys.all, 'clients', config] as const,
  staff: (config: Partial<ReportConfig>) => [...reportKeys.all, 'staff', config] as const,
  timeTracking: (config: Partial<ReportConfig>) => [...reportKeys.all, 'time-tracking', config] as const,
  billing: (config: Partial<ReportConfig>) => [...reportKeys.all, 'billing', config] as const,
  collections: (config: Partial<ReportConfig>) => [...reportKeys.all, 'collections', config] as const,
  summary: () => [...reportKeys.all, 'summary'] as const,
  dashboard: () => [...reportKeys.all, 'dashboard'] as const,
  widgets: () => [...reportKeys.dashboard(), 'widgets'] as const,
}

// Saved Reports
export function useSavedReports(params?: {
  type?: ReportType
  page?: number
  pageSize?: number
  search?: string
}) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => reportsService.getSavedReports(params),
  })
}

export function useSavedReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsService.getSavedReport(id),
    enabled: !!id,
  })
}

export function useCreateSavedReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<SavedReport, '_id' | 'createdAt' | 'updatedAt'>) =>
      reportsService.createSavedReport(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: reportKeys.lists() })
    },
  })
}

export function useUpdateSavedReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavedReport> }) =>
      reportsService.updateSavedReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: reportKeys.lists() })
      queryClient.refetchQueries({ queryKey: reportKeys.detail(variables.id) })
    },
  })
}

export function useDeleteSavedReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportsService.deleteSavedReport(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: reportKeys.lists() })
    },
  })
}

// Report Generation
export function useRevenueReport(config: Partial<ReportConfig>, enabled = true) {
  return useQuery({
    queryKey: reportKeys.revenue(config),
    queryFn: () => reportsService.getRevenueReport(config),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCaseReport(config: Partial<ReportConfig>, enabled = true) {
  return useQuery({
    queryKey: reportKeys.cases(config),
    queryFn: () => reportsService.getCaseReport(config),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useClientReport(config: Partial<ReportConfig>, enabled = true) {
  return useQuery({
    queryKey: reportKeys.clients(config),
    queryFn: () => reportsService.getClientReport(config),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStaffReport(config: Partial<ReportConfig>, enabled = true) {
  return useQuery({
    queryKey: reportKeys.staff(config),
    queryFn: () => reportsService.getStaffReport(config),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTimeTrackingReport(config: Partial<ReportConfig>, enabled = true) {
  return useQuery({
    queryKey: reportKeys.timeTracking(config),
    queryFn: () => reportsService.getTimeTrackingReport(config),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBillingReport(config: Partial<ReportConfig>, enabled = true) {
  return useQuery({
    queryKey: reportKeys.billing(config),
    queryFn: () => reportsService.getBillingReport(config),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCollectionsReport(config: Partial<ReportConfig>, enabled = true) {
  return useQuery({
    queryKey: reportKeys.collections(config),
    queryFn: () => reportsService.getCollectionsReport(config),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

// Export Report
export function useExportReport() {
  return useMutation({
    mutationFn: ({
      reportType,
      config,
      format,
    }: {
      reportType: ReportType
      config: Partial<ReportConfig>
      format: 'pdf' | 'xlsx' | 'csv'
    }) => reportsService.exportReport(reportType, config, format),
    onSuccess: (blob, variables) => {
      // Download the file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${variables.reportType}-report.${variables.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
  })
}

// Schedule Report
export function useScheduleReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      reportId: string
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
      format: 'pdf' | 'xlsx'
    }) => reportsService.scheduleReport(data),
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: reportKeys.detail(variables.reportId) })
    },
  })
}

// Dashboard
export function useDashboardWidgets() {
  return useQuery({
    queryKey: reportKeys.widgets(),
    queryFn: () => reportsService.getDashboardWidgets(),
  })
}

export function useUpdateDashboardWidgets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (widgets: DashboardWidget[]) => reportsService.updateDashboardWidgets(widgets),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: reportKeys.widgets() })
    },
  })
}

export function useReportSummary() {
  return useQuery({
    queryKey: reportKeys.summary(),
    queryFn: () => reportsService.getReportSummary(),
    staleTime: 5 * 60 * 1000,
  })
}

// Generate report mutation (for on-demand generation)
export function useGenerateReport() {
  return useMutation({
    mutationFn: async ({
      type,
      config,
    }: {
      type: ReportType
      config: Partial<ReportConfig>
    }) => {
      switch (type) {
        case 'revenue':
          return reportsService.getRevenueReport(config)
        case 'cases':
          return reportsService.getCaseReport(config)
        case 'clients':
          return reportsService.getClientReport(config)
        case 'staff':
          return reportsService.getStaffReport(config)
        case 'time-tracking':
          return reportsService.getTimeTrackingReport(config)
        case 'billing':
          return reportsService.getBillingReport(config)
        case 'collections':
          return reportsService.getCollectionsReport(config)
        default:
          throw new Error(`Unknown report type: ${type}`)
      }
    },
  })
}
