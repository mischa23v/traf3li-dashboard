/**
 * Wiki React Query Hooks
 * Provides data fetching and mutation hooks for wiki functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  wikiPageService,
  wikiStandaloneService,
  wikiFolderService,
  wikiRevisionService,
  wikiCollectionService,
  wikiBacklinkService,
  wikiCommentService,
  wikiTemplateService,
  wikiAttachmentService,
  wikiAttachmentVersionService,
  wikiExportService,
  wikiVoiceMemoService
} from '@/services/wikiService'
import type {
  CreateWikiPageInput,
  UpdateWikiPageInput,
  CreateWikiCollectionInput,
  UpdateWikiCollectionInput,
  CreateWikiFolderInput,
  UpdateWikiFolderInput,
  CreateWikiCommentInput,
  WikiAttachmentCategory,
  UpdateAttachmentInput,
  UpdateVoiceMemoInput,
  WikiExportFormat,
  WikiLinkableEntityType
} from '@/types/wiki'

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════

export const wikiKeys = {
  all: ['wiki'] as const,
  // Case-specific keys
  pages: (caseId: string) => [...wikiKeys.all, 'pages', caseId] as const,
  pageTree: (caseId: string) => [...wikiKeys.all, 'tree', caseId] as const,
  page: (pageId: string) => [...wikiKeys.all, 'page', pageId] as const,
  pageHistory: (pageId: string) =>
    [...wikiKeys.all, 'history', pageId] as const,
  collections: (caseId: string) =>
    [...wikiKeys.all, 'collections', caseId] as const,
  pinned: (caseId: string) => [...wikiKeys.all, 'pinned', caseId] as const,
  recent: () => [...wikiKeys.all, 'recent'] as const,
  linkGraph: (caseId: string) => [...wikiKeys.all, 'graph', caseId] as const,
  backlinks: (pageId: string) => [...wikiKeys.all, 'backlinks', pageId] as const,
  comments: (pageId: string) => [...wikiKeys.all, 'comments', pageId] as const,
  templates: () => [...wikiKeys.all, 'templates'] as const,
  search: (caseId: string, query: string) =>
    [...wikiKeys.all, 'search', caseId, query] as const,
  globalSearch: (query: string) =>
    [...wikiKeys.all, 'globalSearch', query] as const,
  attachments: (pageId: string) =>
    [...wikiKeys.all, 'attachments', pageId] as const,
  attachmentVersions: (pageId: string, attachmentId: string) =>
    [...wikiKeys.all, 'attachment-versions', pageId, attachmentId] as const,

  // Standalone wiki keys (no case required)
  standalonePages: () => [...wikiKeys.all, 'standalone', 'pages'] as const,
  standaloneTree: () => [...wikiKeys.all, 'standalone', 'tree'] as const,
  standalonePinned: () => [...wikiKeys.all, 'standalone', 'pinned'] as const,
  standaloneTags: () => [...wikiKeys.all, 'standalone', 'tags'] as const,
  standaloneSearch: (query: string) =>
    [...wikiKeys.all, 'standalone', 'search', query] as const,

  // Folder keys
  folders: () => [...wikiKeys.all, 'folders'] as const,
  folderTree: () => [...wikiKeys.all, 'folders', 'tree'] as const,
  folder: (folderId: string) => [...wikiKeys.all, 'folder', folderId] as const,

  // Voice memo keys
  voiceMemos: (pageId: string) =>
    [...wikiKeys.all, 'voice-memos', pageId] as const
}

// ═══════════════════════════════════════════════════════════════
// PAGE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch wiki pages for a case with optional filters
 */
export const useWikiPages = (
  caseId: string,
  params?: Parameters<typeof wikiPageService.list>[1]
) => {
  return useQuery({
    queryKey: [...wikiKeys.pages(caseId), params],
    queryFn: () => wikiPageService.list(caseId, params),
    enabled: !!caseId
  })
}

/**
 * Fetch wiki page tree for a case (hierarchical structure)
 */
export const useWikiPageTree = (caseId: string) => {
  return useQuery({
    queryKey: wikiKeys.pageTree(caseId),
    queryFn: () => wikiPageService.getTree(caseId),
    enabled: !!caseId
  })
}

/**
 * Fetch a single wiki page with backlinks and revision stats
 */
export const useWikiPage = (pageId: string) => {
  return useQuery({
    queryKey: wikiKeys.page(pageId),
    queryFn: () => wikiPageService.get(pageId),
    enabled: !!pageId
  })
}

/**
 * Create a new wiki page
 */
export const useCreateWikiPage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      data
    }: {
      caseId: string
      data: CreateWikiPageInput
    }) => wikiPageService.create(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.pages(caseId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.pageTree(caseId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.collections(caseId) })
    }
  })
}

/**
 * Update a wiki page
 */
export const useUpdateWikiPage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      data
    }: {
      pageId: string
      data: UpdateWikiPageInput
    }) => wikiPageService.update(pageId, data),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(page._id) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.pages(page.caseId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.pageTree(page.caseId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.pageHistory(page._id) })
    }
  })
}

/**
 * Delete a wiki page
 */
export const useDeleteWikiPage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      permanent
    }: {
      pageId: string
      permanent?: boolean
    }) => wikiPageService.delete(pageId, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

/**
 * Move a wiki page to a different parent or collection
 */
export const useMoveWikiPage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      data
    }: {
      pageId: string
      data: Parameters<typeof wikiPageService.move>[1]
    }) => wikiPageService.move(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

/**
 * Toggle wiki page pin status
 */
export const useToggleWikiPagePin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pageId: string) => wikiPageService.togglePin(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

/**
 * Seal a wiki page
 */
export const useSealWikiPage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pageId, reason }: { pageId: string; reason: string }) =>
      wikiPageService.seal(pageId, reason),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(page._id) })
    }
  })
}

/**
 * Unseal a wiki page
 */
export const useUnsealWikiPage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pageId: string) => wikiPageService.unseal(pageId),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(page._id) })
    }
  })
}

/**
 * Fetch pinned wiki pages for a case
 */
export const usePinnedWikiPages = (caseId: string) => {
  return useQuery({
    queryKey: wikiKeys.pinned(caseId),
    queryFn: () => wikiPageService.getPinned(caseId),
    enabled: !!caseId
  })
}

/**
 * Fetch recent wiki pages across all cases
 */
export const useRecentWikiPages = (limit = 10) => {
  return useQuery({
    queryKey: wikiKeys.recent(),
    queryFn: () => wikiPageService.getRecent(limit)
  })
}

/**
 * Search wiki pages within a case
 */
export const useWikiSearch = (
  caseId: string,
  query: string,
  params?: { pageType?: string; limit?: number }
) => {
  return useQuery({
    queryKey: wikiKeys.search(caseId, query),
    queryFn: () => wikiPageService.search(caseId, query, params),
    enabled: !!caseId && query.length >= 2
  })
}

/**
 * Global search across all wiki pages
 */
export const useWikiGlobalSearch = (query: string, limit = 20) => {
  return useQuery({
    queryKey: wikiKeys.globalSearch(query),
    queryFn: () => wikiPageService.globalSearch(query, limit),
    enabled: query.length >= 2
  })
}

/**
 * Fetch link graph for visualization
 */
export const useWikiLinkGraph = (caseId: string) => {
  return useQuery({
    queryKey: wikiKeys.linkGraph(caseId),
    queryFn: () => wikiPageService.getLinkGraph(caseId),
    enabled: !!caseId
  })
}

// ═══════════════════════════════════════════════════════════════
// REVISION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch page revision history
 */
export const useWikiPageHistory = (
  pageId: string,
  params?: { limit?: number; skip?: number }
) => {
  return useQuery({
    queryKey: [...wikiKeys.pageHistory(pageId), params],
    queryFn: () => wikiRevisionService.getHistory(pageId, params),
    enabled: !!pageId
  })
}

/**
 * Fetch a specific revision
 */
export const useWikiRevision = (pageId: string, version: number) => {
  return useQuery({
    queryKey: [...wikiKeys.pageHistory(pageId), 'version', version],
    queryFn: () => wikiRevisionService.getRevision(pageId, version),
    enabled: !!pageId && version > 0
  })
}

/**
 * Compare two versions
 */
export const useWikiRevisionCompare = (
  pageId: string,
  v1: number,
  v2: number
) => {
  return useQuery({
    queryKey: [...wikiKeys.pageHistory(pageId), 'compare', v1, v2],
    queryFn: () => wikiRevisionService.compare(pageId, v1, v2),
    enabled: !!pageId && v1 > 0 && v2 > 0
  })
}

/**
 * Restore a previous version
 */
export const useRestoreWikiRevision = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pageId, version }: { pageId: string; version: number }) =>
      wikiRevisionService.restore(pageId, version),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(page._id) })
      queryClient.invalidateQueries({
        queryKey: wikiKeys.pageHistory(page._id)
      })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// COLLECTION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch wiki collections for a case
 */
export const useWikiCollections = (
  caseId: string,
  parentCollectionId?: string | null
) => {
  return useQuery({
    queryKey: [...wikiKeys.collections(caseId), parentCollectionId],
    queryFn: () => wikiCollectionService.list(caseId, parentCollectionId),
    enabled: !!caseId
  })
}

/**
 * Create a new wiki collection
 */
export const useCreateWikiCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      data
    }: {
      caseId: string
      data: CreateWikiCollectionInput
    }) => wikiCollectionService.create(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.collections(caseId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.pageTree(caseId) })
    }
  })
}

/**
 * Update a wiki collection
 */
export const useUpdateWikiCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      collectionId,
      data
    }: {
      collectionId: string
      data: UpdateWikiCollectionInput
    }) => wikiCollectionService.update(collectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

/**
 * Delete a wiki collection
 */
export const useDeleteWikiCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (collectionId: string) =>
      wikiCollectionService.delete(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

/**
 * Initialize default collections for a case
 */
export const useInitWikiCollections = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (caseId: string) => wikiCollectionService.initDefaults(caseId),
    onSuccess: (_, caseId) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.collections(caseId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.pageTree(caseId) })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// BACKLINK HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch backlinks to a page
 */
export const useWikiBacklinks = (pageId: string) => {
  return useQuery({
    queryKey: wikiKeys.backlinks(pageId),
    queryFn: () => wikiBacklinkService.getBacklinks(pageId),
    enabled: !!pageId
  })
}

/**
 * Fetch outgoing links from a page
 */
export const useWikiOutgoingLinks = (pageId: string) => {
  return useQuery({
    queryKey: [...wikiKeys.backlinks(pageId), 'outgoing'],
    queryFn: () => wikiBacklinkService.getOutgoingLinks(pageId),
    enabled: !!pageId
  })
}

// ═══════════════════════════════════════════════════════════════
// COMMENT HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch comments for a wiki page
 */
export const useWikiComments = (
  pageId: string,
  params?: { isInline?: boolean; status?: string }
) => {
  return useQuery({
    queryKey: [...wikiKeys.comments(pageId), params],
    queryFn: () => wikiCommentService.getComments(pageId, params),
    enabled: !!pageId
  })
}

/**
 * Create a new comment on a wiki page
 */
export const useCreateWikiComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      data
    }: {
      pageId: string
      data: CreateWikiCommentInput
    }) => wikiCommentService.create(pageId, data),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.comments(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

/**
 * Update a wiki comment
 */
export const useUpdateWikiComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      commentId,
      content
    }: {
      commentId: string
      content: string
    }) => wikiCommentService.update(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

/**
 * Delete a wiki comment
 */
export const useDeleteWikiComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => wikiCommentService.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

/**
 * Resolve a wiki comment
 */
export const useResolveWikiComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, note }: { commentId: string; note?: string }) =>
      wikiCommentService.resolve(commentId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.all })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch all wiki templates
 */
export const useWikiTemplates = () => {
  return useQuery({
    queryKey: wikiKeys.templates(),
    queryFn: () => wikiTemplateService.list()
  })
}

/**
 * Create a wiki page from a template
 */
export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      data
    }: {
      templateId: string
      data: { caseId: string; title: string; collectionId?: string }
    }) => wikiTemplateService.createFromTemplate(templateId, data),
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.pages(data.caseId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.pageTree(data.caseId) })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch attachments for a wiki page
 */
export const useWikiAttachments = (pageId: string) => {
  return useQuery({
    queryKey: wikiKeys.attachments(pageId),
    queryFn: () => wikiAttachmentService.list(pageId),
    enabled: !!pageId
  })
}

/**
 * Upload a wiki attachment (handles the 3-step process)
 */
export const useUploadWikiAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pageId,
      file,
      category,
      isConfidential
    }: {
      pageId: string
      file: File
      category?: WikiAttachmentCategory
      isConfidential?: boolean
    }) => {
      // Step 1: Get presigned URL
      const { uploadUrl, fileKey } = await wikiAttachmentService.getUploadUrl(
        pageId,
        {
          fileName: file.name,
          fileType: file.type,
          documentCategory: category,
          isConfidential
        }
      )

      // Step 2: Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      // Step 3: Confirm upload
      return wikiAttachmentService.confirmUpload(pageId, {
        fileName: file.name,
        fileKey,
        fileType: file.type,
        fileSize: file.size,
        documentCategory: category,
        isConfidential
      })
    },
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.attachments(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

/**
 * Update wiki attachment metadata
 */
export const useUpdateWikiAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      attachmentId,
      data
    }: {
      pageId: string
      attachmentId: string
      data: UpdateAttachmentInput
    }) => wikiAttachmentService.update(pageId, attachmentId, data),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.attachments(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

/**
 * Delete a wiki attachment
 */
export const useDeleteWikiAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      attachmentId
    }: {
      pageId: string
      attachmentId: string
    }) => wikiAttachmentService.delete(pageId, attachmentId),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.attachments(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

/**
 * Download a wiki attachment
 */
export const useDownloadWikiAttachment = () => {
  return useMutation({
    mutationFn: async ({
      pageId,
      attachmentId
    }: {
      pageId: string
      attachmentId: string
    }) => {
      const { downloadUrl, fileName } =
        await wikiAttachmentService.getDownloadUrl(pageId, attachmentId)

      // Trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return { downloadUrl, fileName }
    }
  })
}

/**
 * Seal or unseal a wiki attachment
 */
export const useSealWikiAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      attachmentId,
      seal
    }: {
      pageId: string
      attachmentId: string
      seal: boolean
    }) => wikiAttachmentService.seal(pageId, attachmentId, seal),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.attachments(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT VERSION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get version history for an attachment
 */
export const useAttachmentVersionHistory = (
  pageId: string,
  attachmentId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: wikiKeys.attachmentVersions(pageId, attachmentId),
    queryFn: () => wikiAttachmentVersionService.getHistory(pageId, attachmentId),
    enabled: options?.enabled !== false && !!pageId && !!attachmentId
  })
}

/**
 * Upload a new version of an attachment
 */
export const useUploadAttachmentVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pageId,
      attachmentId,
      file,
      changeNote
    }: {
      pageId: string
      attachmentId: string
      file: File
      changeNote?: string
    }) => {
      // Step 1: Get presigned URL
      const { uploadUrl, fileKey } =
        await wikiAttachmentVersionService.getUploadUrl(pageId, attachmentId, {
          fileName: file.name,
          fileType: file.type
        })

      // Step 2: Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      // Step 3: Confirm upload
      return wikiAttachmentVersionService.confirmUpload(pageId, attachmentId, {
        fileName: file.name,
        fileKey,
        fileType: file.type,
        fileSize: file.size,
        changeNote
      })
    },
    onSuccess: (_, { pageId, attachmentId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
      queryClient.invalidateQueries({
        queryKey: wikiKeys.attachmentVersions(pageId, attachmentId)
      })
      queryClient.invalidateQueries({ queryKey: wikiKeys.attachments(pageId) })
    }
  })
}

/**
 * Download a specific version of an attachment
 */
export const useDownloadAttachmentVersion = () => {
  return useMutation({
    mutationFn: async ({
      pageId,
      attachmentId,
      versionNumber
    }: {
      pageId: string
      attachmentId: string
      versionNumber: number
    }) => {
      const { downloadUrl, fileName } =
        await wikiAttachmentVersionService.getDownloadUrl(
          pageId,
          attachmentId,
          versionNumber
        )

      // Open in new tab
      window.open(downloadUrl, '_blank')

      return { downloadUrl, fileName }
    }
  })
}

/**
 * Restore a previous version of an attachment
 */
export const useRestoreAttachmentVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      attachmentId,
      versionNumber
    }: {
      pageId: string
      attachmentId: string
      versionNumber: number
    }) =>
      wikiAttachmentVersionService.restore(pageId, attachmentId, versionNumber),
    onSuccess: (_, { pageId, attachmentId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
      queryClient.invalidateQueries({
        queryKey: wikiKeys.attachmentVersions(pageId, attachmentId)
      })
      queryClient.invalidateQueries({ queryKey: wikiKeys.attachments(pageId) })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// EXPORT HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Export a wiki page to a specific format
 */
export const useExportWikiPage = () => {
  return useMutation({
    mutationFn: async ({
      pageId,
      format
    }: {
      pageId: string
      format: WikiExportFormat
    }) => {
      const response = await wikiExportService.export(pageId, format)

      // Handle the response based on format
      if (format === 'preview' && response.html) {
        // Open HTML preview in new tab
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(response.html)
          newWindow.document.close()
        }
      } else if (response.downloadUrl) {
        // Trigger download for other formats
        window.open(response.downloadUrl, '_blank')
      }

      return response
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE WIKI HOOKS (No caseId required)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch all user's wiki pages with optional filters (no case required)
 */
export const useStandaloneWikiPages = (
  params?: Parameters<typeof wikiStandaloneService.listPages>[0]
) => {
  return useQuery({
    queryKey: [...wikiKeys.standalonePages(), params],
    queryFn: () => wikiStandaloneService.listPages(params)
  })
}

/**
 * Fetch user's page tree for sidebar (no case required)
 */
export const useStandaloneWikiTree = (params?: {
  folderId?: string
  collectionId?: string
}) => {
  return useQuery({
    queryKey: [...wikiKeys.standaloneTree(), params],
    queryFn: () => wikiStandaloneService.getTree(params)
  })
}

/**
 * Create a standalone wiki page (no caseId required)
 * All links to cases/clients/etc are OPTIONAL - add later
 */
export const useCreateStandaloneWikiPage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWikiPageInput) =>
      wikiStandaloneService.createPage(data),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.standalonePages() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standaloneTree() })
      // Also invalidate case-specific queries if the page is linked to a case
      if (page.caseId) {
        queryClient.invalidateQueries({ queryKey: wikiKeys.pages(page.caseId) })
        queryClient.invalidateQueries({
          queryKey: wikiKeys.pageTree(page.caseId)
        })
      }
    }
  })
}

/**
 * Search wiki pages with optional filters
 */
export const useStandaloneWikiSearch = (
  query: string,
  params?: {
    pageType?: string
    caseId?: string
    clientId?: string
    tags?: string
    limit?: number
  }
) => {
  return useQuery({
    queryKey: [...wikiKeys.standaloneSearch(query), params],
    queryFn: () => wikiStandaloneService.searchPages(query, params),
    enabled: query.length >= 2
  })
}

/**
 * Get all pinned wiki pages for user
 */
export const useStandalonePinnedPages = () => {
  return useQuery({
    queryKey: wikiKeys.standalonePinned(),
    queryFn: () => wikiStandaloneService.getPinnedPages()
  })
}

/**
 * Get all user tags across all wiki pages
 */
export const useWikiTags = () => {
  return useQuery({
    queryKey: wikiKeys.standaloneTags(),
    queryFn: () => wikiStandaloneService.getTags()
  })
}

/**
 * Link an entity to a wiki page (case, client, task, event, reminder, document, wiki)
 */
export const useLinkWikiEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      entityType,
      entityId
    }: {
      pageId: string
      entityType: WikiLinkableEntityType
      entityId: string
    }) => wikiStandaloneService.linkEntity(pageId, entityType, entityId),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(page._id) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standalonePages() })
      if (page.caseId) {
        queryClient.invalidateQueries({ queryKey: wikiKeys.pages(page.caseId) })
      }
    }
  })
}

/**
 * Unlink an entity from a wiki page
 */
export const useUnlinkWikiEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      entityType,
      entityId
    }: {
      pageId: string
      entityType: WikiLinkableEntityType
      entityId: string
    }) => wikiStandaloneService.unlinkEntity(pageId, entityType, entityId),
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(page._id) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standalonePages() })
      if (page.caseId) {
        queryClient.invalidateQueries({ queryKey: wikiKeys.pages(page.caseId) })
      }
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// FOLDER HOOKS (Standalone user-centric folders)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch folders with optional filters
 */
export const useWikiFolders = (params?: {
  parentFolderId?: string | null
  caseId?: string
  excludeCaseFolders?: boolean
}) => {
  return useQuery({
    queryKey: [...wikiKeys.folders(), params],
    queryFn: () => wikiFolderService.list(params)
  })
}

/**
 * Fetch folder tree for sidebar
 */
export const useWikiFolderTree = (params?: {
  caseId?: string
  excludeCaseFolders?: boolean
}) => {
  return useQuery({
    queryKey: [...wikiKeys.folderTree(), params],
    queryFn: () => wikiFolderService.getTree(params)
  })
}

/**
 * Fetch a single folder by ID
 */
export const useWikiFolder = (folderId: string) => {
  return useQuery({
    queryKey: wikiKeys.folder(folderId),
    queryFn: () => wikiFolderService.get(folderId),
    enabled: !!folderId
  })
}

/**
 * Create a new folder (no case required)
 */
export const useCreateWikiFolder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWikiFolderInput) => wikiFolderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.folders() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.folderTree() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standaloneTree() })
    }
  })
}

/**
 * Update a folder
 */
export const useUpdateWikiFolder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      folderId,
      data
    }: {
      folderId: string
      data: UpdateWikiFolderInput
    }) => wikiFolderService.update(folderId, data),
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.folder(folderId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.folders() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.folderTree() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standaloneTree() })
    }
  })
}

/**
 * Delete a folder
 */
export const useDeleteWikiFolder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => wikiFolderService.delete(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.folders() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.folderTree() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standaloneTree() })
    }
  })
}

/**
 * Initialize default folders for new user
 */
export const useInitWikiFolders = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => wikiFolderService.initDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.folders() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.folderTree() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standaloneTree() })
    }
  })
}

/**
 * Move a folder to a different parent
 */
export const useMoveWikiFolder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      folderId,
      data
    }: {
      folderId: string
      data: { parentFolderId?: string | null; order?: number }
    }) => wikiFolderService.move(folderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.folders() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.folderTree() })
      queryClient.invalidateQueries({ queryKey: wikiKeys.standaloneTree() })
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// VOICE MEMO HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch voice memos for a wiki page
 */
export const useWikiVoiceMemos = (pageId: string) => {
  return useQuery({
    queryKey: wikiKeys.voiceMemos(pageId),
    queryFn: () => wikiVoiceMemoService.list(pageId),
    enabled: !!pageId
  })
}

/**
 * Upload a voice memo (handles the 3-step process)
 */
export const useUploadWikiVoiceMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pageId,
      file,
      duration,
      title,
      isConfidential
    }: {
      pageId: string
      file: Blob
      duration: number
      title?: string
      isConfidential?: boolean
    }) => {
      // Step 1: Get presigned URL
      const { uploadUrl, fileKey } = await wikiVoiceMemoService.getUploadUrl(
        pageId,
        {
          fileName: `voice-memo-${Date.now()}.mp3`,
          fileType: 'audio/mpeg',
          duration,
          isConfidential
        }
      )

      // Step 2: Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'audio/mpeg' }
      })

      // Step 3: Confirm upload
      return wikiVoiceMemoService.confirmUpload(pageId, {
        fileKey,
        fileType: 'audio/mpeg',
        fileSize: file.size,
        duration,
        title: title || `Voice Memo - ${new Date().toLocaleString()}`,
        isConfidential
      })
    },
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.voiceMemos(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

/**
 * Get voice memo streaming/download URL
 */
export const useWikiVoiceMemoUrl = () => {
  return useMutation({
    mutationFn: ({ pageId, memoId }: { pageId: string; memoId: string }) =>
      wikiVoiceMemoService.getUrl(pageId, memoId)
  })
}

/**
 * Update voice memo metadata
 */
export const useUpdateWikiVoiceMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      memoId,
      data
    }: {
      pageId: string
      memoId: string
      data: UpdateVoiceMemoInput
    }) => wikiVoiceMemoService.update(pageId, memoId, data),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.voiceMemos(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

/**
 * Delete a voice memo
 */
export const useDeleteWikiVoiceMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pageId, memoId }: { pageId: string; memoId: string }) =>
      wikiVoiceMemoService.delete(pageId, memoId),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.voiceMemos(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}

/**
 * Seal or unseal a voice memo
 */
export const useSealWikiVoiceMemo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pageId,
      memoId,
      seal,
      reason
    }: {
      pageId: string
      memoId: string
      seal: boolean
      reason?: string
    }) => wikiVoiceMemoService.seal(pageId, memoId, seal, reason),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: wikiKeys.voiceMemos(pageId) })
      queryClient.invalidateQueries({ queryKey: wikiKeys.page(pageId) })
    }
  })
}
