/**
 * Case Rich Documents React Query Hooks
 * Provides data fetching and mutation hooks for case rich documents
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caseRichDocumentService } from '@/services/caseRichDocumentService'
import type {
  CreateRichDocumentInput,
  UpdateRichDocumentInput,
  RichDocumentFilters,
  RichDocumentExportFormat
} from '@/types/caseRichDocument'

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════

export const richDocumentKeys = {
  all: ['richDocuments'] as const,
  lists: () => [...richDocumentKeys.all, 'list'] as const,
  list: (caseId: string, filters?: RichDocumentFilters) =>
    [...richDocumentKeys.lists(), caseId, filters] as const,
  details: () => [...richDocumentKeys.all, 'detail'] as const,
  detail: (caseId: string, docId: string) =>
    [...richDocumentKeys.details(), caseId, docId] as const,
  versions: (caseId: string, docId: string) =>
    [...richDocumentKeys.all, 'versions', caseId, docId] as const
}

// ═══════════════════════════════════════════════════════════════
// LIST & DETAIL HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch rich documents for a case
 */
export const useCaseRichDocuments = (
  caseId: string,
  filters?: RichDocumentFilters
) => {
  return useQuery({
    queryKey: richDocumentKeys.list(caseId, filters),
    queryFn: () => caseRichDocumentService.list(caseId, filters),
    enabled: !!caseId
  })
}

/**
 * Fetch a single rich document
 */
export const useCaseRichDocument = (caseId: string, docId: string) => {
  return useQuery({
    queryKey: richDocumentKeys.detail(caseId, docId),
    queryFn: () => caseRichDocumentService.get(caseId, docId),
    enabled: !!caseId && !!docId
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new rich document
 */
export const useCreateCaseRichDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      data
    }: {
      caseId: string
      data: CreateRichDocumentInput
    }) => caseRichDocumentService.create(caseId, data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data, { caseId }) => {
      // Manually update the cache for list
      queryClient.setQueriesData({ queryKey: richDocumentKeys.list(caseId) }, (old: any) => {
        if (!old) return old
        // Handle { documents: [...] } structure
        if (old.documents && Array.isArray(old.documents)) {
          return {
            ...old,
            documents: [data, ...old.documents]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async (_, __, { caseId }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: richDocumentKeys.lists(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: richDocumentKeys.list(caseId), refetchType: 'all' })
    }
  })
}

/**
 * Update a rich document
 */
export const useUpdateCaseRichDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      docId,
      data
    }: {
      caseId: string
      docId: string
      data: UpdateRichDocumentInput
    }) => caseRichDocumentService.update(caseId, docId, data),
    onSettled: async (_, __, { caseId, docId }) => {
      await queryClient.invalidateQueries({ queryKey: richDocumentKeys.list(caseId) })
      await queryClient.invalidateQueries({
        queryKey: richDocumentKeys.detail(caseId, docId)
      })
      await queryClient.invalidateQueries({
        queryKey: richDocumentKeys.versions(caseId, docId)
      })
    }
  })
}

/**
 * Delete a rich document
 */
export const useDeleteCaseRichDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, docId }: { caseId: string; docId: string }) =>
      caseRichDocumentService.delete(caseId, docId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, { caseId, docId }) => {
      // Manually update the cache for list
      queryClient.setQueriesData({ queryKey: richDocumentKeys.list(caseId) }, (old: any) => {
        if (!old) return old
        // Handle { documents: [...] } structure
        if (old.documents && Array.isArray(old.documents)) {
          return {
            ...old,
            documents: old.documents.filter((d: any) => d._id !== docId)
          }
        }
        if (Array.isArray(old)) return old.filter((d: any) => d._id !== docId)
        return old
      })
    },
    onSettled: async (_, __, { caseId }) => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: richDocumentKeys.lists(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: richDocumentKeys.list(caseId), refetchType: 'all' })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// VERSION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch version history for a document
 */
export const useCaseRichDocumentVersions = (
  caseId: string,
  docId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: richDocumentKeys.versions(caseId, docId),
    queryFn: () => caseRichDocumentService.getVersionHistory(caseId, docId),
    enabled: options?.enabled !== false && !!caseId && !!docId
  })
}

/**
 * Restore a previous version
 */
export const useRestoreCaseRichDocumentVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      docId,
      versionNumber
    }: {
      caseId: string
      docId: string
      versionNumber: number
    }) => caseRichDocumentService.restoreVersion(caseId, docId, versionNumber),
    onSettled: async (_, __, { caseId, docId }) => {
      await queryClient.invalidateQueries({ queryKey: richDocumentKeys.list(caseId) })
      await queryClient.invalidateQueries({
        queryKey: richDocumentKeys.detail(caseId, docId)
      })
      await queryClient.invalidateQueries({
        queryKey: richDocumentKeys.versions(caseId, docId)
      })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// EXPORT HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Export a rich document to a specific format
 */
export const useExportCaseRichDocument = () => {
  return useMutation({
    mutationFn: async ({
      caseId,
      docId,
      format
    }: {
      caseId: string
      docId: string
      format: RichDocumentExportFormat
    }) => {
      const response = await caseRichDocumentService.export(caseId, docId, format)

      // Handle the response based on format
      if (format === 'preview' && response.html) {
        // Open HTML preview in new tab
        const newWindow = window.open('', '_blank', 'noopener,noreferrer')
        if (newWindow) {
          newWindow.document.write(response.html)
          newWindow.document.close()
        }
      } else if (response.downloadUrl) {
        // Trigger download for PDF
        window.open(response.downloadUrl, '_blank', 'noopener,noreferrer')
      } else if (response.latex || response.markdown) {
        // Download as file for LaTeX/Markdown
        const content = response.latex || response.markdown || ''
        const ext = format === 'latex' ? 'tex' : 'md'
        const mimeType = format === 'latex' ? 'application/x-latex' : 'text/markdown'

        const blob = new Blob([content], { type: mimeType })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.fileName || `document.${ext}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }

      return response
    }
  })
}
