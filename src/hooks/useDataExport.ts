import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import dataExportService, {
  type ExportOptions,
  type ImportOptions,
  type EntityType,
  type ExportFormat,
} from '@/services/dataExportService'
import { useTranslation } from 'react-i18next'

// Query key factory
export const exportKeys = {
  all: ['data-export'] as const,
  exports: () => [...exportKeys.all, 'exports'] as const,
  exportsList: (entityType?: EntityType) => [...exportKeys.exports(), 'list', entityType] as const,
  exportDetail: (id: string) => [...exportKeys.exports(), id] as const,
  imports: () => [...exportKeys.all, 'imports'] as const,
  importsList: (entityType?: EntityType) => [...exportKeys.imports(), 'list', entityType] as const,
  importDetail: (id: string) => [...exportKeys.imports(), id] as const,
  templates: () => [...exportKeys.all, 'templates'] as const,
  templatesList: (entityType?: EntityType) => [...exportKeys.templates(), 'list', entityType] as const,
  columns: (entityType: EntityType) => [...exportKeys.all, 'columns', entityType] as const,
}

// ===== EXPORT HOOKS =====

// Start export
export function useStartExport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (options: ExportOptions) => dataExportService.startExport(options),
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('dataExport.exportStarted'),
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: exportKeys.exports() })
    },
  })
}

// Get export status (with polling support)
export function useExportStatus(jobId: string, enabled = true) {
  return useQuery({
    queryKey: exportKeys.exportDetail(jobId),
    queryFn: () => dataExportService.getExportStatus(jobId),
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      return 2000 // Poll every 2 seconds while processing
    },
    retry: false,
  })
}

// Get export history
export function useExportHistory(entityType?: EntityType) {
  return useQuery({
    queryKey: exportKeys.exportsList(entityType),
    queryFn: () => dataExportService.getExportHistory(entityType),
  })
}

// Download export
export function useDownloadExport() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ jobId, fileName }: { jobId: string; fileName: string }) => {
      const blob = await dataExportService.downloadExport(jobId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// Cancel export
export function useCancelExport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (jobId: string) => dataExportService.cancelExport(jobId),
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('dataExport.exportCancelled'),
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: exportKeys.exports() })
    },
  })
}

// ===== IMPORT HOOKS =====

// Preview import
export function usePreviewImport() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ file, entityType }: { file: File; entityType: EntityType }) =>
      dataExportService.previewImport(file, entityType),
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// Start import
export function useStartImport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (options: ImportOptions) => dataExportService.startImport(options),
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('dataExport.importStarted'),
      })
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: exportKeys.imports() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: exportKeys.imports(), refetchType: 'all' })
    },
  })
}

// Get import status (with polling support)
export function useImportStatus(jobId: string, enabled = true) {
  return useQuery({
    queryKey: exportKeys.importDetail(jobId),
    queryFn: () => dataExportService.getImportStatus(jobId),
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === 'completed' || data?.status === 'failed' || data?.status === 'partial') {
        return false
      }
      return 2000 // Poll every 2 seconds while processing
    },
    retry: false,
  })
}

// Get import history
export function useImportHistory(entityType?: EntityType) {
  return useQuery({
    queryKey: exportKeys.importsList(entityType),
    queryFn: () => dataExportService.getImportHistory(entityType),
  })
}

// Cancel import
export function useCancelImport() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (jobId: string) => dataExportService.cancelImport(jobId),
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('dataExport.importCancelled'),
      })
      // Update specific import in cache
      queryClient.setQueryData(exportKeys.importDetail(data.id), data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: exportKeys.imports() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item.id === data.id ? data : item))
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: exportKeys.imports(), refetchType: 'all' })
    },
  })
}

// Download sample template
export function useDownloadSampleTemplate() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ entityType, format }: { entityType: EntityType; format: 'xlsx' | 'csv' }) => {
      const blob = await dataExportService.downloadSampleTemplate(entityType, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${entityType}_template.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// ===== TEMPLATE HOOKS =====

// Get export templates
export function useExportTemplates(entityType?: EntityType) {
  return useQuery({
    queryKey: exportKeys.templatesList(entityType),
    queryFn: () => dataExportService.getTemplates(entityType),
  })
}

// Create export template
export function useCreateExportTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: dataExportService.createTemplate,
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('dataExport.templateCreated'),
      })
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: exportKeys.templates() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: exportKeys.templates(), refetchType: 'all' })
    },
  })
}

// Delete export template
export function useDeleteExportTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => dataExportService.deleteTemplate(id),
    onSuccess: (_, id) => {
      toast({
        title: t('common.success'),
        description: t('dataExport.templateDeleted'),
      })
      // Remove from cache
      queryClient.setQueriesData({ queryKey: exportKeys.templates() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.filter((item: any) => item.id !== id)
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: exportKeys.templates(), refetchType: 'all' })
    },
  })
}

// Get entity columns
export function useEntityColumns(entityType: EntityType) {
  return useQuery({
    queryKey: exportKeys.columns(entityType),
    queryFn: () => dataExportService.getEntityColumns(entityType),
    enabled: !!entityType,
  })
}
