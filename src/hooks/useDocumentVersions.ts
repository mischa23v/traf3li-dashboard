import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import documentVersionService, {
  type UploadVersionData,
  type VersionType,
} from '@/services/documentVersionService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { invalidateCache } from '@/lib/cache-invalidation'

// Cache configuration
const VERSION_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes
const VERSION_GC_TIME = CACHE_TIMES.LONG // 30 minutes

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
        title: t('status.success', 'Success | نجح'),
        description: t('documents.versionUploadSuccess', 'Version uploaded successfully | تم رفع الإصدار بنجاح'),
      })
    },
    onError: (error: any) => {
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.versionUploadError', 'Failed to upload version | فشل رفع الإصدار')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await invalidateCache.documentVersions.all(documentId)
      await invalidateCache.documents.all()
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
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.downloadError', 'Failed to download version | فشل تنزيل الإصدار')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
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
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.downloadUrlError', 'Failed to get download URL | فشل الحصول على رابط التنزيل')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
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
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.previewError', 'Failed to get preview URL | فشل الحصول على رابط المعاينة')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
      })
    },
  })
}

// Restore version
export const useRestoreVersion = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentVersionService.restoreVersion(documentId, versionId),
    onSuccess: (_, { documentId }) => {
      toast({
        title: t('status.success', 'Success | نجح'),
        description: t('documents.versionRestoreSuccess', 'Version restored successfully | تم استعادة الإصدار بنجاح'),
      })
    },
    onError: (error: any) => {
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.versionRestoreError', 'Failed to restore version | فشلت استعادة الإصدار')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await invalidateCache.documentVersions.all(documentId)
      await invalidateCache.documents.all()
    },
  })
}

// Delete version
export const useDeleteVersion = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentVersionService.deleteVersion(documentId, versionId),
    onSuccess: (_, { documentId }) => {
      toast({
        title: t('status.success', 'Success | نجح'),
        description: t('documents.versionDeleteSuccess', 'Version deleted successfully | تم حذف الإصدار بنجاح'),
      })
    },
    onError: (error: any) => {
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.versionDeleteError', 'Failed to delete version | فشل حذف الإصدار')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await invalidateCache.documentVersions.all(documentId)
    },
  })
}

// Delete old versions
export const useDeleteOldVersions = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ documentId, keepCount }: { documentId: string; keepCount: number }) =>
      documentVersionService.deleteOldVersions(documentId, keepCount),
    onSuccess: (data, { documentId }) => {
      toast({
        title: t('status.success', 'Success | نجح'),
        description: t(
          'documents.oldVersionsDeleted',
          `${data.deletedCount} old versions deleted | تم حذف ${data.deletedCount} إصدارات قديمة`
        ),
      })
    },
    onError: (error: any) => {
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.oldVersionsDeleteError', 'Failed to delete old versions | فشل حذف الإصدارات القديمة')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await invalidateCache.documentVersions.all(documentId)
    },
  })
}

// Update version metadata
export const useUpdateVersionMetadata = () => {
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
        title: t('status.success', 'Success | نجح'),
        description: t('status.updatedSuccessfully', 'Updated successfully | تم التحديث بنجاح'),
      })
    },
    onError: (error: any) => {
      // Extract bilingual error message if available
      const errorMessage = error.response?.data?.message ||
        t('documents.versionUpdateError', 'Failed to update version metadata | فشل تحديث بيانات الإصدار')

      toast({
        variant: 'destructive',
        title: t('status.error', 'Error | خطأ'),
        description: errorMessage,
      })
    },
    onSettled: async (_, __, { documentId, versionId }) => {
      await invalidateCache.documentVersions.all(documentId)
      await invalidateCache.documentVersions.detail(documentId, versionId)
    },
  })
}
