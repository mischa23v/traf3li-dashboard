/**
 * Wiki Service
 * Handles all wiki-related API calls for case documentation
 * Supports pages, collections, revisions, comments, and backlinks
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  WikiPage,
  WikiCollection,
  WikiFolder,
  WikiRevision,
  WikiBacklink,
  WikiComment,
  WikiAttachment,
  WikiVoiceMemo,
  AttachmentVersion,
  AttachmentVersionHistoryResponse,
  WikiPageTreeResponse,
  WikiStandaloneTreeResponse,
  WikiTagsResponse,
  WikiFolderTreeItem,
  WikiLinkGraph,
  WikiRevisionStats,
  WikiLinkableEntityType,
  WikiVoiceMemosResponse,
  VoiceMemoUrlResponse,
  CreateWikiPageInput,
  UpdateWikiPageInput,
  CreateWikiCollectionInput,
  UpdateWikiCollectionInput,
  CreateWikiFolderInput,
  UpdateWikiFolderInput,
  CreateWikiCommentInput,
  UploadAttachmentInput,
  ConfirmAttachmentInput,
  UpdateAttachmentInput,
  UploadVersionInput,
  ConfirmVersionInput,
  UploadVoiceMemoInput,
  ConfirmVoiceMemoInput,
  UpdateVoiceMemoInput,
  WikiExportFormat,
  WikiExportResponse,
  WikiStats
} from '@/types/wiki'

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface ApiMessageResponse {
  success: boolean
  message: string
}

// ═══════════════════════════════════════════════════════════════
// PAGE OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const wikiPageService = {
  /**
   * List pages for a case with optional filters
   */
  list: async (
    caseId: string,
    params?: {
      pageType?: string
      collectionId?: string
      parentPageId?: string | null
      search?: string
      status?: string
    }
  ): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/cases/${caseId}/wiki`,
        { params }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get wiki stats for a case
   */
  getStats: async (caseId: string): Promise<WikiStats> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiStats>>(
        `/cases/${caseId}/wiki/stats`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get page tree for a case (hierarchical structure)
   */
  getTree: async (caseId: string): Promise<WikiPageTreeResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPageTreeResponse>>(
        `/cases/${caseId}/wiki/tree`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create a new wiki page
   */
  create: async (
    caseId: string,
    data: CreateWikiPageInput
  ): Promise<WikiPage> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiPage>>(
        `/cases/${caseId}/wiki`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get a single page by ID with backlinks and revision stats
   */
  get: async (
    pageId: string
  ): Promise<{
    page: WikiPage
    backlinks: WikiBacklink[]
    revisionStats: WikiRevisionStats
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          page: WikiPage
          backlinks: WikiBacklink[]
          revisionStats: WikiRevisionStats
        }>
      >(`/wiki/${pageId}`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update a wiki page
   */
  update: async (
    pageId: string,
    data: UpdateWikiPageInput
  ): Promise<WikiPage> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiPage>>(
        `/wiki/${pageId}`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete a wiki page
   */
  delete: async (
    pageId: string,
    permanent = false
  ): Promise<ApiMessageResponse> => {
    try {
      const response = await apiClient.delete<ApiMessageResponse>(
        `/wiki/${pageId}`,
        { params: { permanent } }
      )
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Move a page to a different parent or collection
   */
  move: async (
    pageId: string,
    data: {
      parentPageId?: string
      collectionId?: string
      order?: number
    }
  ): Promise<WikiPage> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiPage>>(
        `/wiki/${pageId}/move`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Toggle page pin status
   */
  togglePin: async (pageId: string): Promise<{ isPinned: boolean }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ isPinned: boolean }>
      >(`/wiki/${pageId}/pin`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get pinned pages for a case
   */
  getPinned: async (caseId: string): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/cases/${caseId}/wiki/pinned`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Seal a page (make it read-only with audit trail)
   */
  seal: async (pageId: string, reason: string): Promise<WikiPage> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiPage>>(
        `/wiki/${pageId}/seal`,
        { reason }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Unseal a page
   */
  unseal: async (pageId: string): Promise<WikiPage> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiPage>>(
        `/wiki/${pageId}/unseal`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Search pages within a case
   */
  search: async (
    caseId: string,
    query: string,
    params?: {
      pageType?: string
      limit?: number
    }
  ): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/cases/${caseId}/wiki/search`,
        { params: { q: query, ...params } }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Global search across all cases
   */
  globalSearch: async (query: string, limit = 20): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/wiki/search`,
        { params: { q: query, limit } }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get recent pages across all cases
   */
  getRecent: async (limit = 10): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/wiki/recent`,
        { params: { limit } }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get link graph for visualization
   */
  getLinkGraph: async (caseId: string): Promise<WikiLinkGraph> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiLinkGraph>>(
        `/cases/${caseId}/wiki/graph`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE PAGE OPERATIONS (No caseId required)
// ═══════════════════════════════════════════════════════════════

export const wikiStandaloneService = {
  /**
   * List all user's pages with optional filters (no case required)
   */
  listPages: async (params?: {
    pageType?: string
    collectionId?: string
    folderId?: string
    parentPageId?: string | null
    tags?: string // comma-separated
    caseId?: string // optional filter
    clientId?: string // optional filter
    sortBy?: 'title' | 'created' | 'updated'
    limit?: number
    skip?: number
  }): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/wiki/pages`,
        { params }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get user's page tree for sidebar (no case required)
   */
  getTree: async (params?: {
    folderId?: string
    collectionId?: string
  }): Promise<WikiStandaloneTreeResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiStandaloneTreeResponse>>(
        `/wiki/tree`,
        { params }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create a standalone page (no caseId required)
   * Links to cases/clients/etc are OPTIONAL - add later
   */
  createPage: async (data: CreateWikiPageInput): Promise<WikiPage> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiPage>>(
        `/wiki/pages`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Search pages with optional filters
   */
  searchPages: async (
    query: string,
    params?: {
      pageType?: string
      caseId?: string
      clientId?: string
      tags?: string
      limit?: number
    }
  ): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/wiki/pages/search`,
        { params: { q: query, ...params } }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get all pinned pages for user
   */
  getPinnedPages: async (): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/wiki/pages/pinned`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get all user tags across all pages
   */
  getTags: async (): Promise<WikiTagsResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiTagsResponse>>(
        `/wiki/tags`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Link an entity to a page (case, client, task, event, reminder, document, wiki)
   */
  linkEntity: async (
    pageId: string,
    entityType: WikiLinkableEntityType,
    entityId: string
  ): Promise<WikiPage> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiPage>>(
        `/wiki/${pageId}/link`,
        { entityType, entityId }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Unlink an entity from a page
   */
  unlinkEntity: async (
    pageId: string,
    entityType: WikiLinkableEntityType,
    entityId: string
  ): Promise<WikiPage> => {
    try {
      const response = await apiClient.delete<ApiResponse<WikiPage>>(
        `/wiki/${pageId}/link`,
        { data: { entityType, entityId } }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// FOLDER OPERATIONS (Standalone user-centric folders)
// ═══════════════════════════════════════════════════════════════

export const wikiFolderService = {
  /**
   * List folders with optional filters
   */
  list: async (params?: {
    parentFolderId?: string | null
    caseId?: string
    excludeCaseFolders?: boolean
  }): Promise<WikiFolder[]> => {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.parentFolderId === null) queryParams.parentFolderId = 'null'
      else if (params?.parentFolderId) queryParams.parentFolderId = params.parentFolderId
      if (params?.caseId) queryParams.caseId = params.caseId
      if (params?.excludeCaseFolders) queryParams.excludeCaseFolders = 'true'

      const response = await apiClient.get<ApiResponse<WikiFolder[]>>(
        `/wiki/folders`,
        { params: queryParams }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get folder tree for sidebar
   */
  getTree: async (params?: {
    caseId?: string
    excludeCaseFolders?: boolean
  }): Promise<WikiFolderTreeItem[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiFolderTreeItem[]>>(
        `/wiki/folders/tree`,
        { params }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create a new folder (no case required)
   */
  create: async (data: CreateWikiFolderInput): Promise<WikiFolder> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiFolder>>(
        `/wiki/folders`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get a single folder by ID
   */
  get: async (folderId: string): Promise<WikiFolder> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiFolder>>(
        `/wiki/folders/${folderId}`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update a folder
   */
  update: async (
    folderId: string,
    data: UpdateWikiFolderInput
  ): Promise<WikiFolder> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiFolder>>(
        `/wiki/folders/${folderId}`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete a folder
   */
  delete: async (folderId: string): Promise<ApiMessageResponse> => {
    try {
      const response = await apiClient.delete<ApiMessageResponse>(
        `/wiki/folders/${folderId}`
      )
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Initialize default folders for new user
   */
  initDefaults: async (): Promise<WikiFolder[]> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiFolder[]>>(
        `/wiki/folders/init`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Move a folder to a different parent
   */
  move: async (
    folderId: string,
    data: {
      parentFolderId?: string | null
      order?: number
    }
  ): Promise<WikiFolder> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiFolder>>(
        `/wiki/folders/${folderId}/move`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// VERSION CONTROL
// ═══════════════════════════════════════════════════════════════

export const wikiRevisionService = {
  /**
   * Get page revision history
   */
  getHistory: async (
    pageId: string,
    params?: { limit?: number; skip?: number }
  ): Promise<{ history: WikiRevision[]; stats: WikiRevisionStats }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ history: WikiRevision[]; stats: WikiRevisionStats }>
      >(`/wiki/${pageId}/history`, { params })
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get a specific revision
   */
  getRevision: async (
    pageId: string,
    version: number
  ): Promise<WikiRevision> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiRevision>>(
        `/wiki/${pageId}/revisions/${version}`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Compare two versions
   */
  compare: async (
    pageId: string,
    v1: number,
    v2: number
  ): Promise<{
    before: WikiRevision
    after: WikiRevision
    versionDiff: number
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          before: WikiRevision
          after: WikiRevision
          versionDiff: number
        }>
      >(`/wiki/${pageId}/diff`, { params: { v1, v2 } })
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Restore a previous version
   */
  restore: async (pageId: string, version: number): Promise<WikiPage> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiPage>>(
        `/wiki/${pageId}/restore/${version}`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// COLLECTION OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const wikiCollectionService = {
  /**
   * List collections for a case
   */
  list: async (
    caseId: string,
    parentCollectionId?: string | null
  ): Promise<WikiCollection[]> => {
    try {
      const params: Record<string, string> = {}
      if (parentCollectionId === null) params.parentCollectionId = 'null'
      else if (parentCollectionId) params.parentCollectionId = parentCollectionId

      const response = await apiClient.get<ApiResponse<WikiCollection[]>>(
        `/cases/${caseId}/wiki/collections`,
        { params }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create a new collection
   */
  create: async (
    caseId: string,
    data: CreateWikiCollectionInput
  ): Promise<WikiCollection> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiCollection>>(
        `/cases/${caseId}/wiki/collections`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update a collection
   */
  update: async (
    collectionId: string,
    data: UpdateWikiCollectionInput
  ): Promise<WikiCollection> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiCollection>>(
        `/wiki/collections/${collectionId}`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete a collection
   */
  delete: async (collectionId: string): Promise<ApiMessageResponse> => {
    try {
      const response = await apiClient.delete<ApiMessageResponse>(
        `/wiki/collections/${collectionId}`
      )
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Initialize default collections for a case
   */
  initDefaults: async (caseId: string): Promise<WikiCollection[]> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiCollection[]>>(
        `/cases/${caseId}/wiki/init-collections`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// BACKLINKS
// ═══════════════════════════════════════════════════════════════

export const wikiBacklinkService = {
  /**
   * Get backlinks to a page
   */
  getBacklinks: async (pageId: string): Promise<WikiBacklink[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiBacklink[]>>(
        `/wiki/${pageId}/backlinks`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get outgoing links from a page
   */
  getOutgoingLinks: async (pageId: string): Promise<WikiBacklink[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiBacklink[]>>(
        `/wiki/${pageId}/links`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════════════

export const wikiCommentService = {
  /**
   * Get comments for a page
   */
  getComments: async (
    pageId: string,
    params?: { isInline?: boolean; status?: string }
  ): Promise<WikiComment[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiComment[]>>(
        `/wiki/${pageId}/comments`,
        { params }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create a new comment
   */
  create: async (
    pageId: string,
    data: CreateWikiCommentInput
  ): Promise<WikiComment> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiComment>>(
        `/wiki/${pageId}/comments`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update a comment
   */
  update: async (commentId: string, content: string): Promise<WikiComment> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiComment>>(
        `/wiki/comments/${commentId}`,
        { content }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete a comment
   */
  delete: async (commentId: string): Promise<ApiMessageResponse> => {
    try {
      const response = await apiClient.delete<ApiMessageResponse>(
        `/wiki/comments/${commentId}`
      )
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Resolve a comment
   */
  resolve: async (
    commentId: string,
    note?: string
  ): Promise<WikiComment> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiComment>>(
        `/wiki/comments/${commentId}/resolve`,
        { note }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const wikiTemplateService = {
  /**
   * List all templates
   */
  list: async (): Promise<WikiPage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiPage[]>>(
        `/wiki/templates`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Create a page from a template
   */
  createFromTemplate: async (
    templateId: string,
    data: {
      caseId: string
      title: string
      collectionId?: string
    }
  ): Promise<WikiPage> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiPage>>(
        `/wiki/templates/${templateId}/create`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENTS
// ═══════════════════════════════════════════════════════════════

export const wikiAttachmentService = {
  /**
   * List attachments for a page
   */
  list: async (
    pageId: string
  ): Promise<{ attachments: WikiAttachment[]; count: number }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ attachments: WikiAttachment[]; count: number }>
      >(`/wiki/${pageId}/attachments`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get presigned URL for uploading an attachment (Step 1)
   */
  getUploadUrl: async (
    pageId: string,
    data: UploadAttachmentInput
  ): Promise<{ uploadUrl: string; fileKey: string; expiresIn: number }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ uploadUrl: string; fileKey: string; expiresIn: number }>
      >(`/wiki/${pageId}/attachments/upload`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Confirm attachment upload after uploading to S3 (Step 3)
   */
  confirmUpload: async (
    pageId: string,
    data: ConfirmAttachmentInput
  ): Promise<{ attachment: WikiAttachment; attachmentCount: number }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ attachment: WikiAttachment; attachmentCount: number }>
      >(`/wiki/${pageId}/attachments/confirm`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get presigned URL for downloading an attachment
   */
  getDownloadUrl: async (
    pageId: string,
    attachmentId: string
  ): Promise<{
    downloadUrl: string
    fileName: string
    fileType: string
    fileSize: number
    expiresIn: number
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          downloadUrl: string
          fileName: string
          fileType: string
          fileSize: number
          expiresIn: number
        }>
      >(`/wiki/${pageId}/attachments/${attachmentId}/download`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update attachment metadata
   */
  update: async (
    pageId: string,
    attachmentId: string,
    data: UpdateAttachmentInput
  ): Promise<WikiAttachment> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiAttachment>>(
        `/wiki/${pageId}/attachments/${attachmentId}`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete an attachment
   */
  delete: async (
    pageId: string,
    attachmentId: string
  ): Promise<{ attachmentCount: number }> => {
    try {
      const response = await apiClient.delete<
        ApiResponse<{ attachmentCount: number }>
      >(`/wiki/${pageId}/attachments/${attachmentId}`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Seal or unseal an attachment
   */
  seal: async (
    pageId: string,
    attachmentId: string,
    seal: boolean
  ): Promise<WikiAttachment> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiAttachment>>(
        `/wiki/${pageId}/attachments/${attachmentId}/seal`,
        { seal }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT VERSIONING
// ═══════════════════════════════════════════════════════════════

export const wikiAttachmentVersionService = {
  /**
   * Get version history for an attachment
   */
  getHistory: async (
    pageId: string,
    attachmentId: string
  ): Promise<AttachmentVersionHistoryResponse> => {
    try {
      const response = await apiClient.get<
        ApiResponse<AttachmentVersionHistoryResponse>
      >(`/wiki/${pageId}/attachments/${attachmentId}/versions`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get presigned URL for uploading a new version (Step 1)
   */
  getUploadUrl: async (
    pageId: string,
    attachmentId: string,
    data: UploadVersionInput
  ): Promise<{ uploadUrl: string; fileKey: string; expiresIn: number }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ uploadUrl: string; fileKey: string; expiresIn: number }>
      >(
        `/wiki/${pageId}/attachments/${attachmentId}/versions/upload`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Confirm new version upload (Step 3)
   */
  confirmUpload: async (
    pageId: string,
    attachmentId: string,
    data: ConfirmVersionInput
  ): Promise<{
    attachment: WikiAttachment
    version: AttachmentVersion
    versionCount: number
  }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          attachment: WikiAttachment
          version: AttachmentVersion
          versionCount: number
        }>
      >(
        `/wiki/${pageId}/attachments/${attachmentId}/versions/confirm`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Download a specific version
   */
  getDownloadUrl: async (
    pageId: string,
    attachmentId: string,
    versionNumber: number
  ): Promise<{
    downloadUrl: string
    fileName: string
    fileType: string
    fileSize: number
    expiresIn: number
  }> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          downloadUrl: string
          fileName: string
          fileType: string
          fileSize: number
          expiresIn: number
        }>
      >(
        `/wiki/${pageId}/attachments/${attachmentId}/versions/${versionNumber}/download`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Restore a previous version
   */
  restore: async (
    pageId: string,
    attachmentId: string,
    versionNumber: number
  ): Promise<{
    attachment: WikiAttachment
    version: AttachmentVersion
    versionCount: number
  }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          attachment: WikiAttachment
          version: AttachmentVersion
          versionCount: number
        }>
      >(
        `/wiki/${pageId}/attachments/${attachmentId}/versions/${versionNumber}/restore`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const wikiExportService = {
  /**
   * Export a page to a specific format (PDF, LaTeX, Markdown, or HTML preview)
   */
  export: async (
    pageId: string,
    format: WikiExportFormat
  ): Promise<WikiExportResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiExportResponse>>(
        `/wiki/${pageId}/export/${format}`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get PDF export
   */
  exportPdf: async (pageId: string): Promise<WikiExportResponse> => {
    return wikiExportService.export(pageId, 'pdf')
  },

  /**
   * Get LaTeX export
   */
  exportLatex: async (pageId: string): Promise<WikiExportResponse> => {
    return wikiExportService.export(pageId, 'latex')
  },

  /**
   * Get Markdown export
   */
  exportMarkdown: async (pageId: string): Promise<WikiExportResponse> => {
    return wikiExportService.export(pageId, 'markdown')
  },

  /**
   * Get HTML preview
   */
  getPreview: async (pageId: string): Promise<WikiExportResponse> => {
    return wikiExportService.export(pageId, 'preview')
  }
}

// ═══════════════════════════════════════════════════════════════
// VOICE MEMO OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const wikiVoiceMemoService = {
  /**
   * List all voice memos for a page
   */
  list: async (pageId: string): Promise<WikiVoiceMemosResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<WikiVoiceMemosResponse>>(
        `/wiki/${pageId}/voice-memos`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get presigned URL for uploading a voice memo (Step 1)
   */
  getUploadUrl: async (
    pageId: string,
    data: UploadVoiceMemoInput
  ): Promise<{ uploadUrl: string; fileKey: string; expiresIn: number }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ uploadUrl: string; fileKey: string; expiresIn: number }>
      >(`/wiki/${pageId}/voice-memos/upload`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Confirm voice memo upload after uploading to S3 (Step 3)
   */
  confirmUpload: async (
    pageId: string,
    data: ConfirmVoiceMemoInput
  ): Promise<{ voiceMemo: WikiVoiceMemo; voiceMemoCount: number }> => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ voiceMemo: WikiVoiceMemo; voiceMemoCount: number }>
      >(`/wiki/${pageId}/voice-memos/confirm`, data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Get presigned URL for streaming/downloading a voice memo
   */
  getUrl: async (
    pageId: string,
    memoId: string
  ): Promise<VoiceMemoUrlResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<VoiceMemoUrlResponse>>(
        `/wiki/${pageId}/voice-memos/${memoId}/url`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Update voice memo metadata
   */
  update: async (
    pageId: string,
    memoId: string,
    data: UpdateVoiceMemoInput
  ): Promise<WikiVoiceMemo> => {
    try {
      const response = await apiClient.put<ApiResponse<WikiVoiceMemo>>(
        `/wiki/${pageId}/voice-memos/${memoId}`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Delete a voice memo
   */
  delete: async (
    pageId: string,
    memoId: string
  ): Promise<{ voiceMemoCount: number }> => {
    try {
      const response = await apiClient.delete<
        ApiResponse<{ voiceMemoCount: number }>
      >(`/wiki/${pageId}/voice-memos/${memoId}`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  /**
   * Seal or unseal a voice memo
   */
  seal: async (
    pageId: string,
    memoId: string,
    seal: boolean,
    reason?: string
  ): Promise<WikiVoiceMemo> => {
    try {
      const response = await apiClient.post<ApiResponse<WikiVoiceMemo>>(
        `/wiki/${pageId}/voice-memos/${memoId}/seal`,
        { seal, reason }
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
