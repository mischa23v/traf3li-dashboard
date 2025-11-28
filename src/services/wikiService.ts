/**
 * Wiki Service
 * Handles all wiki-related API calls for case documentation
 * Supports pages, collections, revisions, comments, and backlinks
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  WikiPage,
  WikiCollection,
  WikiRevision,
  WikiBacklink,
  WikiComment,
  WikiPageTreeResponse,
  WikiLinkGraph,
  WikiRevisionStats,
  CreateWikiPageInput,
  UpdateWikiPageInput,
  CreateWikiCollectionInput,
  UpdateWikiCollectionInput,
  CreateWikiCommentInput
} from '@/types/wiki'

const BASE_URL = '/api'

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
        `${BASE_URL}/cases/${caseId}/wiki`,
        { params }
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
        `${BASE_URL}/cases/${caseId}/wiki/tree`
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
        `${BASE_URL}/cases/${caseId}/wiki`,
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
      >(`${BASE_URL}/wiki/${pageId}`)
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
        `${BASE_URL}/wiki/${pageId}`,
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
        `${BASE_URL}/wiki/${pageId}`,
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
        `${BASE_URL}/wiki/${pageId}/move`,
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
      >(`${BASE_URL}/wiki/${pageId}/pin`)
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
        `${BASE_URL}/cases/${caseId}/wiki/pinned`
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
        `${BASE_URL}/wiki/${pageId}/seal`,
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
        `${BASE_URL}/wiki/${pageId}/unseal`
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
        `${BASE_URL}/cases/${caseId}/wiki/search`,
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
        `${BASE_URL}/wiki/search`,
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
        `${BASE_URL}/wiki/recent`,
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
        `${BASE_URL}/cases/${caseId}/wiki/graph`
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
      >(`${BASE_URL}/wiki/${pageId}/history`, { params })
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
        `${BASE_URL}/wiki/${pageId}/revisions/${version}`
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
      >(`${BASE_URL}/wiki/${pageId}/diff`, { params: { v1, v2 } })
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
        `${BASE_URL}/wiki/${pageId}/restore/${version}`
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
        `${BASE_URL}/cases/${caseId}/wiki/collections`,
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
        `${BASE_URL}/cases/${caseId}/wiki/collections`,
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
        `${BASE_URL}/wiki/collections/${collectionId}`,
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
        `${BASE_URL}/wiki/collections/${collectionId}`
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
        `${BASE_URL}/cases/${caseId}/wiki/init-collections`
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
        `${BASE_URL}/wiki/${pageId}/backlinks`
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
        `${BASE_URL}/wiki/${pageId}/links`
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
        `${BASE_URL}/wiki/${pageId}/comments`,
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
        `${BASE_URL}/wiki/${pageId}/comments`,
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
        `${BASE_URL}/wiki/comments/${commentId}`,
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
        `${BASE_URL}/wiki/comments/${commentId}`
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
        `${BASE_URL}/wiki/comments/${commentId}/resolve`,
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
        `${BASE_URL}/wiki/templates`
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
        `${BASE_URL}/wiki/templates/${templateId}/create`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
