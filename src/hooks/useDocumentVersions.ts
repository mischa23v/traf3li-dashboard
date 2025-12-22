import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import documentVersionService, {
  type UploadVersionData,
  type VersionType,
} from '@/services/documentVersionService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

// Cache configuration
const VERSION_STALE_TIME = 5 * 60 * 1000 // 5 minutes
const VERSION_GC_TIME = 30 * 60 * 1000 // 30 minutes

// Query keys
export const versionKeys = {
  all: (documentId: string) => ['document-versions', documentId] as const,
  list: (documentId: string) => [...versionKeys.all(documentId), 'list'] as const,
  detail: (documentId: string, versionId: string) =>
    [...versionKeys.all(documentId), 'detail', versionId] as const,
  statistics: (documentId: string) =>
    [...versionKeys.all(documentId), 'statistics'] as const,
  comparison: (documentId: string, v1: string, v2: string) =>
    [...versionKeys.all(documentId), 'compare', v1, v2] as const,
  diff: (documentId: string, v1: string, v2: string) =>
    [...versionKeys.all(documentId), 'diff', v1, v2] as const,
  content: (documentId: string, versionId: string) =>
    [...versionKeys.all(documentId), 'content', versionId] as const,
}

// List all versions for a document
export const useVersionList = (documentId: string) => {
  return useQuery({
    queryKey: versionKeys.list(documentId),
    queryFn: () => documentVersionService.listVersions(documentId),
    enabled: !!documentId,
    staleTime: VERSION_STALE_TIME,
    gcTime: VERSION_GC_TIME,
  })
}

// Get a specific version
export const useVersion = (documentId: string, versionId: string) => {
  return useQuery({
    queryKey: versionKeys.detail(documentId, versionId),
    queryFn: () => documentVersionService.getVersion(documentId, versionId),
    enabled: !!documentId && !!versionId,
    staleTime: VERSION_STALE_TIME,
    gcTime: VERSION_GC_TIME,
  })
}

// Get version statistics
export const useVersionStatistics = (documentId: string) => {
  return useQuery({
    queryKey: versionKeys.statistics(documentId),
    queryFn: () => documentVersionService.getVersionStatistics(documentId),
    enabled: !!documentId,
    staleTime: VERSION_STALE_TIME,
    gcTime: VERSION_GC_TIME,
  })
}

// Compare two versions
export const useVersionComparison = (
  documentId: string,
  versionId1: string,
  versionId2: string
) => {
  return useQuery({
    queryKey: versionKeys.comparison(documentId, versionId1, versionId2),
    queryFn: () =>
      documentVersionService.compareVersions(documentId, versionId1, versionId2),
    enabled: !!documentId && !!versionId1 && !!versionId2,
    staleTime: VERSION_STALE_TIME,
    gcTime: VERSION_GC_TIME,
  })
}

// Get diff between versions
export const useVersionDiff = (
  documentId: string,
  versionId1: string,
  versionId2: string
) => {
  return useQuery({
    queryKey: versionKeys.diff(documentId, versionId1, versionId2),
    queryFn: () => documentVersionService.getVersionDiff(documentId, versionId1, versionId2),
    enabled: !!documentId && !!versionId1 && !!versionId2,
    staleTime: VERSION_STALE_TIME,
    gcTime: VERSION_GC_TIME,
  })
}

// Get version content (for text files)
export const useVersionContent = (documentId: string, versionId: string) => {
  return useQuery({
    queryKey: versionKeys.content(documentId, versionId),
    queryFn: () => documentVersionService.getVersionContent(documentId, versionId),
    enabled: !!documentId && !!versionId,
    staleTime: VERSION_STALE_TIME,
    gcTime: VERSION_GC_TIME,
  })
}

// Upload new version
export const useUploadVersion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      documentId,
      data,
      onProgress,
    }: {
      documentId: string
      data: UploadVersionData
      onProgress?: (progress: number) => void
    }) => documentVersionService.uploadVersion(documentId, data, onProgress),
    onSuccess: (_, { documentId }) => {
      toast({
        title: t('status.success'),
        description: t('documents.versionUploadSuccess', 'Version uploaded successfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('documents.versionUploadError', 'Failed to upload version'),
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await queryClient.invalidateQueries({ queryKey: versionKeys.all(documentId) })
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

// Download version
export const useDownloadVersion = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      documentId,
      versionId,
      fileName,
    }: {
      documentId: string
      versionId: string
      fileName: string
    }) => documentVersionService.downloadVersion(documentId, versionId, fileName),
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('documents.downloadError', 'Failed to download version'),
      })
    },
  })
}

// Get version download URL
export const useVersionDownloadUrl = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentVersionService.getVersionDownloadUrl(documentId, versionId),
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('documents.downloadError', 'Failed to get download URL'),
      })
    },
  })
}

// Get version preview URL
export const useVersionPreviewUrl = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentVersionService.getVersionPreviewUrl(documentId, versionId),
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('documents.previewError', 'Failed to get preview URL'),
      })
    },
  })
}

// Restore version
export const useRestoreVersion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentVersionService.restoreVersion(documentId, versionId),
    onSuccess: (_, { documentId }) => {
      toast({
        title: t('status.success'),
        description: t('documents.versionRestoreSuccess', 'Version restored successfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('documents.versionRestoreError', 'Failed to restore version'),
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await queryClient.invalidateQueries({ queryKey: versionKeys.all(documentId) })
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

// Delete version
export const useDeleteVersion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentVersionService.deleteVersion(documentId, versionId),
    onSuccess: (_, { documentId }) => {
      toast({
        title: t('status.success'),
        description: t('documents.versionDeleteSuccess', 'Version deleted successfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('documents.versionDeleteError', 'Failed to delete version'),
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await queryClient.invalidateQueries({ queryKey: versionKeys.all(documentId) })
    },
  })
}

// Delete old versions
export const useDeleteOldVersions = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, keepCount }: { documentId: string; keepCount: number }) =>
      documentVersionService.deleteOldVersions(documentId, keepCount),
    onSuccess: (data, { documentId }) => {
      toast({
        title: t('status.success'),
        description: t(
          'documents.oldVersionsDeleted',
          `${data.deletedCount} old versions deleted`
        ),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('documents.versionDeleteError', 'Failed to delete old versions'),
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await queryClient.invalidateQueries({ queryKey: versionKeys.all(documentId) })
    },
  })
}

// Update version metadata
export const useUpdateVersionMetadata = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      documentId,
      versionId,
      data,
    }: {
      documentId: string
      versionId: string
      data: { changeNote?: string; tags?: string[] }
    }) => documentVersionService.updateVersionMetadata(documentId, versionId, data),
    onSuccess: (_, { documentId }) => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully', 'Updated successfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { documentId, versionId }) => {
      await queryClient.invalidateQueries({ queryKey: versionKeys.all(documentId) })
      await queryClient.invalidateQueries({
        queryKey: versionKeys.detail(documentId, versionId),
      })
    },
  })
}
