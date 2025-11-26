import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import documentsService, {
  type DocumentFilters,
  type CreateDocumentData,
  type UpdateDocumentData,
} from '@/services/documentsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

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
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get single document
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => documentsService.getDocument(id),
    enabled: !!id,
  })
}

// Get documents by case
export const useDocumentsByCase = (caseId: string) => {
  return useQuery({
    queryKey: documentsKeys.byCase(caseId),
    queryFn: () => documentsService.getDocumentsByCase(caseId),
    enabled: !!caseId,
  })
}

// Get documents by client
export const useDocumentsByClient = (clientId: string) => {
  return useQuery({
    queryKey: documentsKeys.byClient(clientId),
    queryFn: () => documentsService.getDocumentsByClient(clientId),
    enabled: !!clientId,
  })
}

// Get document statistics
export const useDocumentStats = () => {
  return useQuery({
    queryKey: documentsKeys.stats(),
    queryFn: () => documentsService.getDocumentStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get recent documents
export const useRecentDocuments = (limit: number = 10) => {
  return useQuery({
    queryKey: documentsKeys.recent(limit),
    queryFn: () => documentsService.getRecentDocuments(limit),
  })
}

// Search documents
export const useSearchDocuments = (query: string) => {
  return useQuery({
    queryKey: documentsKeys.search(query),
    queryFn: () => documentsService.searchDocuments(query),
    enabled: query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Get judgments
export const useJudgments = (caseId?: string) => {
  return useQuery({
    queryKey: documentsKeys.judgments(caseId),
    queryFn: () => documentsService.getJudgments(caseId),
  })
}

// Get document versions
export const useDocumentVersions = (documentId: string) => {
  return useQuery({
    queryKey: documentsKeys.versions(documentId),
    queryFn: () => documentsService.getDocumentVersions(documentId),
    enabled: !!documentId,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      if (variables.metadata.caseId) {
        queryClient.invalidateQueries({
          queryKey: documentsKeys.byCase(variables.metadata.caseId),
        })
      }
      if (variables.metadata.clientId) {
        queryClient.invalidateQueries({
          queryKey: documentsKeys.byClient(variables.metadata.clientId),
        })
      }
      toast({
        title: t('status.success'),
        description: t('documents.uploadSuccess'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('documents.uploadError'),
      })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(variables.id) })
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
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

// Delete document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
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

// Bulk delete documents
export const useBulkDeleteDocuments = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => documentsService.bulkDeleteDocuments(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentsKeys.versions(variables.documentId) })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentsKeys.versions(variables.documentId) })
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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) })
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
  })
}

// Encrypt document
export const useEncryptDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => documentsService.encryptDocument(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.all })
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentsKeys.byCase(variables.caseId) })
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
  })
}
