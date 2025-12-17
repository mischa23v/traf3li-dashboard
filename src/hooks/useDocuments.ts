import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import documentsService, {
  type DocumentFilters,
  type CreateDocumentData,
  type UpdateDocumentData,
} from '@/services/documentsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { Analytics } from '@/lib/analytics'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// Query keys
export const documentsKeys = {
  all: ['documents'] as const,
  lists: () => [...documentsKeys.all, 'list'] as const,
  list: (filters: DocumentFilters) => [...documentsKeys.lists(), filters] as const,
  details: () => [...documentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
  versions: (id: string) => [...documentsKeys.all, 'versions', id] as const,
  byCase: (caseId: string) => [...documentsKeys.all, 'case', caseId] as const,
  byClient: (clientId: string) => [...documentsKeys.all, 'client', clientId] as const,
  stats: () => [...documentsKeys.all, 'stats'] as const,
  recent: (limit: number) => [...documentsKeys.all, 'recent', limit] as const,
  search: (query: string) => [...documentsKeys.all, 'search', query] as const,
  judgments: (caseId?: string) => [...documentsKeys.all, 'judgments', caseId] as const,
}

// Get all documents
export const useDocuments = (filters?: DocumentFilters) => {
  return useQuery({
    queryKey: documentsKeys.list(filters || {}),
    queryFn: () => documentsService.getDocuments(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single document
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => documentsService.getDocument(id),
    enabled: !!id,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get documents by case
export const useDocumentsByCase = (caseId: string) => {
  return useQuery({
    queryKey: documentsKeys.byCase(caseId),
    queryFn: () => documentsService.getDocumentsByCase(caseId),
    enabled: !!caseId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get documents by client
export const useDocumentsByClient = (clientId: string) => {
  return useQuery({
    queryKey: documentsKeys.byClient(clientId),
    queryFn: () => documentsService.getDocumentsByClient(clientId),
    enabled: !!clientId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get document statistics
export const useDocumentStats = () => {
  return useQuery({
    queryKey: documentsKeys.stats(),
    queryFn: () => documentsService.getDocumentStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get recent documents
export const useRecentDocuments = (limit: number = 10) => {
  return useQuery({
    queryKey: documentsKeys.recent(limit),
    queryFn: () => documentsService.getRecentDocuments(limit),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Search documents
export const useSearchDocuments = (query: string) => {
  return useQuery({
    queryKey: documentsKeys.search(query),
    queryFn: () => documentsService.searchDocuments(query),
    enabled: query.length > 0,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get judgments
export const useJudgments = (caseId?: string) => {
  return useQuery({
    queryKey: documentsKeys.judgments(caseId),
    queryFn: () => documentsService.getJudgments(caseId),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get document versions
export const useDocumentVersions = (documentId: string) => {
  return useQuery({
    queryKey: documentsKeys.versions(documentId),
    queryFn: () => documentsService.getDocumentVersions(documentId),
    enabled: !!documentId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Upload document
export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      file,
      metadata,
      onProgress,
    }: {
      file: File
      metadata: CreateDocumentData
      onProgress?: (progress: number) => void
    }) => documentsService.uploadDocument(file, metadata, onProgress),
    // Update cache on success (Stable & Correct)
    onSuccess: (data, variables) => {
      toast({
        title: t('status.success'),
        description: t('documents.uploadSuccess'),
      })

      // Track analytics - USER ACTIVATION METRIC
      const fileType = variables.file?.name?.split('.').pop() || 'unknown'
      Analytics.documentUploaded(fileType, variables.metadata?.caseId)

      // Manually update the cache with the REAL document from server
      queryClient.setQueriesData({ queryKey: documentsKeys.all }, (old: any) => {
        if (!old) return old

        // Handle { documents: [...] } structure
        if (old.documents && Array.isArray(old.documents)) {
          return {
            ...old,
            documents: [data, ...old.documents],
            total: (old.total || old.documents.length) + 1
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.uploadError'),
      })
    },
    onSettled: async (_, __, variables) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: documentsKeys.all, refetchType: 'all' })
      if (variables.metadata.caseId) {
        await queryClient.invalidateQueries({
          queryKey: documentsKeys.byCase(variables.metadata.caseId),
          refetchType: 'all'
        })
      }
      if (variables.metadata.clientId) {
        return await queryClient.invalidateQueries({
          queryKey: documentsKeys.byClient(variables.metadata.clientId),
          refetchType: 'all'
        })
      }
    },
  })
}

// Update document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentData }) =>
      documentsService.updateDocument(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: documentsKeys.all })

      const previousQueries = queryClient.getQueriesData({ queryKey: documentsKeys.all })
      const previousDoc = queryClient.getQueryData(documentsKeys.detail(id))

      queryClient.setQueriesData({ queryKey: documentsKeys.all }, (old: any) => {
        if (!old) return old

        const list = Array.isArray(old) ? old : (old.documents || old.data || [])
        const updatedList = list.map((item: any) => item._id === id ? { ...item, ...data } : item)

        if (Array.isArray(old)) {
          return updatedList
        }

        return {
          ...old,
          documents: updatedList
        }
      })

      if (previousDoc) {
        queryClient.setQueryData(documentsKeys.detail(id), { ...previousDoc, ...data })
      }

      return { previousQueries, previousDoc }
    },
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any, { id }, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousDoc) {
        queryClient.setQueryData(documentsKeys.detail(id), context.previousDoc)
      }
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) })
    },
  })
}

// Delete document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })

      // Optimistically remove document from all lists
      queryClient.setQueriesData({ queryKey: documentsKeys.all }, (old: any) => {
        if (!old) return old

        // Handle { documents: [...] } structure
        if (old.documents && Array.isArray(old.documents)) {
          return {
            ...old,
            documents: old.documents.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.documents.length) - 1)
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== id)
        }

        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.all, refetchType: 'all' })
    },
  })
}

// Bulk delete documents
export const useBulkDeleteDocuments = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => documentsService.bulkDeleteDocuments(ids),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('documents.bulkDeleteSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.all })
    },
  })
}

// Upload document version
export const useUploadDocumentVersion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      documentId,
      file,
      changeNote,
      onProgress,
    }: {
      documentId: string
      file: File
      changeNote?: string
      onProgress?: (progress: number) => void
    }) => documentsService.uploadDocumentVersion(documentId, file, changeNote, onProgress),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('documents.versionUploadSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.uploadError'),
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      await queryClient.invalidateQueries({ queryKey: documentsKeys.detail(documentId) })
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.versions(documentId) })
    },
  })
}

// Restore document version
export const useRestoreDocumentVersion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      documentId,
      versionId,
    }: {
      documentId: string
      versionId: string
    }) => documentsService.restoreDocumentVersion(documentId, versionId),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('documents.versionRestoreSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { documentId }) => {
      await queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      await queryClient.invalidateQueries({ queryKey: documentsKeys.detail(documentId) })
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.versions(documentId) })
    },
  })
}

// Download document
export const useDownloadDocument = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      id,
      fileName,
    }: {
      id: string
      fileName: string
    }) => {
      const blob = await documentsService.downloadDocument(id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.downloadError'),
      })
    },
  })
}

// Get document preview URL (with inline disposition for browser viewing)
export const useDocumentPreviewUrl = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (id: string) => {
      return documentsService.getPreviewUrl(id)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.previewError', 'Failed to get preview URL'),
      })
    },
  })
}

// Get document download URL (with attachment disposition for download)
export const useDocumentDownloadUrl = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (id: string) => {
      return documentsService.getDownloadUrl(id, 'attachment')
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.downloadError'),
      })
    },
  })
}

// Share document
export const useShareDocument = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, expiresIn }: { id: string; expiresIn?: number }) =>
      documentsService.shareDocument(id, expiresIn),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('documents.shareSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
  })
}

// Revoke share link
export const useRevokeShareLink = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => documentsService.revokeShareLink(id),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('documents.shareRevoked'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, id) => {
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) })
    },
  })
}

// Encrypt document
export const useEncryptDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => documentsService.encryptDocument(id),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('documents.encryptSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) })
    },
  })
}

// Decrypt document
export const useDecryptDocument = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => documentsService.decryptDocument(id),
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.decryptError'),
      })
    },
  })
}

// Move document to case
export const useMoveDocumentToCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      documentId,
      caseId,
    }: {
      documentId: string
      caseId: string
    }) => documentsService.moveDocumentToCase(documentId, caseId),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('documents.moveSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { documentId, caseId }) => {
      await queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      await queryClient.invalidateQueries({ queryKey: documentsKeys.detail(documentId) })
      return await queryClient.invalidateQueries({ queryKey: documentsKeys.byCase(caseId) })
    },
  })
}
