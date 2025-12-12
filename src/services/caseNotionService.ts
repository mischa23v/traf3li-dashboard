/**
 * Case Notion Service
 * Handles all CaseNotion-related API calls for wiki-style case documentation
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  CaseNotionPage,
  Block,
  SyncedBlock,
  PageTemplate,
  BlockComment,
  PageActivity,
  CreatePageInput,
  UpdatePageInput,
  PageFilters,
  CreateBlockInput,
  UpdateBlockInput,
  MoveBlockInput,
} from '@/features/case-notion/data/schema'

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

interface ApiResponse<T> {
  success?: boolean
  error?: boolean
  data?: T
  message?: string
}

interface PagesListResponse {
  success?: boolean
  error?: boolean
  data?: {
    pages: CaseNotionPage[]
    count: number
    totalPages: number
  }
  pages?: CaseNotionPage[]
  count?: number
}

interface PageResponse {
  success?: boolean
  error?: boolean
  data?: CaseNotionPage
  page?: CaseNotionPage
}

interface BlockResponse {
  success?: boolean
  error?: boolean
  data?: Block
  block?: Block
}

interface BlocksResponse {
  success?: boolean
  error?: boolean
  data?: Block[]
  blocks?: Block[]
}

interface TemplatesResponse {
  success?: boolean
  error?: boolean
  data?: {
    templates: PageTemplate[]
    count: number
  }
  templates?: PageTemplate[]
}

interface CommentsResponse {
  success?: boolean
  error?: boolean
  data?: BlockComment[]
  comments?: BlockComment[]
}

interface ActivityResponse {
  success?: boolean
  error?: boolean
  data?: PageActivity[]
  activities?: PageActivity[]
}

interface SearchResult {
  pageId: string
  pageTitle: string
  blockId?: string
  blockContent?: string
  matchType: 'title' | 'content'
  score: number
}

interface SearchResponse {
  success?: boolean
  error?: boolean
  data?: {
    results: SearchResult[]
    count: number
  }
}

// ═══════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════

export const caseNotionService = {
  // ═══════════════════════════════════════════════════════════════
  // PAGE OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * List pages for a case
   * GET /api/cases/:caseId/notion/pages
   */
  listPages: async (
    caseId: string,
    filters?: PageFilters
  ): Promise<{ pages: CaseNotionPage[]; count: number; totalPages: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.pageType) params.append('pageType', filters.pageType)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.isFavorite !== undefined) params.append('isFavorite', String(filters.isFavorite))
      if (filters?.isPinned !== undefined) params.append('isPinned', String(filters.isPinned))
      if (filters?.parentPageId) params.append('parentPageId', filters.parentPageId)
      if (filters?.isArchived !== undefined) params.append('isArchived', String(filters.isArchived))
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))

      const queryString = params.toString()
      const url = queryString
        ? `/cases/${caseId}/notion/pages?${queryString}`
        : `/cases/${caseId}/notion/pages`

      const response = await apiClient.get<PagesListResponse>(url)
      const pages = response.data.data?.pages || response.data.pages || []
      const count = response.data.data?.count || response.data.count || pages.length
      const totalPages = response.data.data?.totalPages || Math.ceil(count / (filters?.limit || 20))

      return { pages, count, totalPages }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get a single page with all blocks
   * GET /api/cases/:caseId/notion/pages/:pageId
   */
  getPage: async (caseId: string, pageId: string): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.get<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}`
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create a new page
   * POST /api/cases/:caseId/notion/pages
   */
  createPage: async (caseId: string, data: CreatePageInput): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages`,
        data
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update a page
   * PATCH /api/cases/:caseId/notion/pages/:pageId
   */
  updatePage: async (
    caseId: string,
    pageId: string,
    data: UpdatePageInput
  ): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.patch<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}`,
        data
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a page (soft delete)
   * DELETE /api/cases/:caseId/notion/pages/:pageId
   */
  deletePage: async (caseId: string, pageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${caseId}/notion/pages/${pageId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Archive a page
   * POST /api/cases/:caseId/notion/pages/:pageId/archive
   */
  archivePage: async (caseId: string, pageId: string): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/archive`
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Restore an archived page
   * POST /api/cases/:caseId/notion/pages/:pageId/restore
   */
  restorePage: async (caseId: string, pageId: string): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/restore`
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate a page
   * POST /api/cases/:caseId/notion/pages/:pageId/duplicate
   */
  duplicatePage: async (caseId: string, pageId: string): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/duplicate`
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle favorite status
   * POST /api/cases/:caseId/notion/pages/:pageId/favorite
   */
  toggleFavorite: async (caseId: string, pageId: string): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/favorite`
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Toggle pin status
   * POST /api/cases/:caseId/notion/pages/:pageId/pin
   */
  togglePin: async (caseId: string, pageId: string): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/pin`
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // BLOCK OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get blocks for a page
   * GET /api/cases/:caseId/notion/pages/:pageId/blocks
   */
  getBlocks: async (caseId: string, pageId: string): Promise<Block[]> => {
    try {
      const response = await apiClient.get<BlocksResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/blocks`
      )
      return response.data.data || response.data.blocks || []
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create a new block
   * POST /api/cases/:caseId/notion/pages/:pageId/blocks
   */
  createBlock: async (
    caseId: string,
    pageId: string,
    data: CreateBlockInput
  ): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/blocks`,
        data
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update a block
   * PATCH /api/cases/:caseId/notion/blocks/:blockId
   */
  updateBlock: async (
    caseId: string,
    blockId: string,
    data: UpdateBlockInput
  ): Promise<Block> => {
    try {
      const response = await apiClient.patch<BlockResponse>(
        `/cases/${caseId}/notion/blocks/${blockId}`,
        data
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a block
   * DELETE /api/cases/:caseId/notion/blocks/:blockId
   */
  deleteBlock: async (caseId: string, blockId: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${caseId}/notion/blocks/${blockId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Move a block
   * POST /api/cases/:caseId/notion/blocks/:blockId/move
   */
  moveBlock: async (caseId: string, data: MoveBlockInput): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/blocks/${data.blockId}/move`,
        data
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Lock a block for editing
   * POST /api/cases/:caseId/notion/blocks/:blockId/lock
   */
  lockBlock: async (caseId: string, blockId: string): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/blocks/${blockId}/lock`
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unlock a block
   * POST /api/cases/:caseId/notion/blocks/:blockId/unlock
   */
  unlockBlock: async (caseId: string, blockId: string): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/blocks/${blockId}/unlock`
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // SYNCED BLOCKS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create a synced block
   * POST /api/cases/:caseId/notion/synced-blocks
   */
  createSyncedBlock: async (
    caseId: string,
    originalBlockId: string,
    targetPageId: string
  ): Promise<SyncedBlock> => {
    try {
      const response = await apiClient.post<ApiResponse<SyncedBlock>>(
        `/cases/${caseId}/notion/synced-blocks`,
        { originalBlockId, targetPageId }
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get synced block info
   * GET /api/cases/:caseId/notion/synced-blocks/:blockId
   */
  getSyncedBlock: async (caseId: string, blockId: string): Promise<SyncedBlock> => {
    try {
      const response = await apiClient.get<ApiResponse<SyncedBlock>>(
        `/cases/${caseId}/notion/synced-blocks/${blockId}`
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unsync a block (convert to regular block)
   * POST /api/cases/:caseId/notion/synced-blocks/:blockId/unsync
   */
  unsyncBlock: async (caseId: string, blockId: string): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/synced-blocks/${blockId}/unsync`
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TEMPLATES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get available templates
   * GET /api/notion/templates
   */
  getTemplates: async (
    category?: string
  ): Promise<{ templates: PageTemplate[]; count: number }> => {
    try {
      const params = category ? `?category=${category}` : ''
      const response = await apiClient.get<TemplatesResponse>(
        `/notion/templates${params}`
      )
      const templates = response.data.data?.templates || response.data.templates || []
      const count = response.data.data?.count || templates.length
      return { templates, count }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Apply a template to a page
   * POST /api/cases/:caseId/notion/pages/:pageId/apply-template
   */
  applyTemplate: async (
    caseId: string,
    pageId: string,
    templateId: string
  ): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/apply-template`,
        { templateId }
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save current page as template
   * POST /api/cases/:caseId/notion/pages/:pageId/save-as-template
   */
  saveAsTemplate: async (
    caseId: string,
    pageId: string,
    templateData: { name: string; nameAr?: string; category: string; description?: string }
  ): Promise<PageTemplate> => {
    try {
      const response = await apiClient.post<ApiResponse<PageTemplate>>(
        `/cases/${caseId}/notion/pages/${pageId}/save-as-template`,
        templateData
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // COMMENTS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get comments for a block
   * GET /api/cases/:caseId/notion/blocks/:blockId/comments
   */
  getComments: async (caseId: string, blockId: string): Promise<BlockComment[]> => {
    try {
      const response = await apiClient.get<CommentsResponse>(
        `/cases/${caseId}/notion/blocks/${blockId}/comments`
      )
      return response.data.data || response.data.comments || []
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add a comment to a block
   * POST /api/cases/:caseId/notion/blocks/:blockId/comments
   */
  addComment: async (
    caseId: string,
    blockId: string,
    content: string,
    parentCommentId?: string
  ): Promise<BlockComment> => {
    try {
      const response = await apiClient.post<ApiResponse<BlockComment>>(
        `/cases/${caseId}/notion/blocks/${blockId}/comments`,
        { content, parentCommentId }
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resolve a comment
   * POST /api/cases/:caseId/notion/comments/:commentId/resolve
   */
  resolveComment: async (caseId: string, commentId: string): Promise<BlockComment> => {
    try {
      const response = await apiClient.post<ApiResponse<BlockComment>>(
        `/cases/${caseId}/notion/comments/${commentId}/resolve`
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a comment
   * DELETE /api/cases/:caseId/notion/comments/:commentId
   */
  deleteComment: async (caseId: string, commentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${caseId}/notion/comments/${commentId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ACTIVITY/HISTORY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get page activity history
   * GET /api/cases/:caseId/notion/pages/:pageId/activity
   */
  getPageActivity: async (
    caseId: string,
    pageId: string,
    limit?: number
  ): Promise<PageActivity[]> => {
    try {
      const params = limit ? `?limit=${limit}` : ''
      const response = await apiClient.get<ActivityResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/activity${params}`
      )
      return response.data.data || response.data.activities || []
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════

  /**
   * Search within a case's notion pages
   * GET /api/cases/:caseId/notion/search
   */
  search: async (
    caseId: string,
    query: string
  ): Promise<{ results: SearchResult[]; count: number }> => {
    try {
      const response = await apiClient.get<SearchResponse>(
        `/cases/${caseId}/notion/search?q=${encodeURIComponent(query)}`
      )
      const results = response.data.data?.results || []
      const count = response.data.data?.count || results.length
      return { results, count }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Export page as PDF
   * GET /api/cases/:caseId/notion/pages/:pageId/export/pdf
   */
  exportPdf: async (caseId: string, pageId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(
        `/cases/${caseId}/notion/pages/${pageId}/export/pdf`,
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export page as Markdown
   * GET /api/cases/:caseId/notion/pages/:pageId/export/markdown
   */
  exportMarkdown: async (caseId: string, pageId: string): Promise<string> => {
    try {
      const response = await apiClient.get<ApiResponse<{ markdown: string }>>(
        `/cases/${caseId}/notion/pages/${pageId}/export/markdown`
      )
      return response.data.data?.markdown || ''
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export page as HTML
   * GET /api/cases/:caseId/notion/pages/:pageId/export/html
   */
  exportHtml: async (caseId: string, pageId: string): Promise<string> => {
    try {
      const response = await apiClient.get<ApiResponse<{ html: string }>>(
        `/cases/${caseId}/notion/pages/${pageId}/export/html`
      )
      return response.data.data?.html || ''
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // MERGE NOTES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Merge multiple pages into one
   * POST /api/cases/:caseId/notion/pages/merge
   */
  mergePages: async (
    caseId: string,
    sourcePageIds: string[],
    targetTitle: string,
    deleteSourcePages?: boolean
  ): Promise<CaseNotionPage> => {
    try {
      const response = await apiClient.post<PageResponse>(
        `/cases/${caseId}/notion/pages/merge`,
        { sourcePageIds, targetTitle, deleteSourcePages }
      )
      return response.data.data || response.data.page!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // LINK TASKS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Link a task to a block
   * POST /api/cases/:caseId/notion/blocks/:blockId/link-task
   */
  linkTask: async (
    caseId: string,
    blockId: string,
    taskId: string
  ): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/blocks/${blockId}/link-task`,
        { taskId }
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unlink a task from a block
   * POST /api/cases/:caseId/notion/blocks/:blockId/unlink-task
   */
  unlinkTask: async (caseId: string, blockId: string, taskId: string): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/blocks/${blockId}/unlink-task`,
        { taskId }
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create a task from a block
   * POST /api/cases/:caseId/notion/blocks/:blockId/create-task
   */
  createTaskFromBlock: async (
    caseId: string,
    blockId: string,
    taskData: { title: string; dueDate?: string; assigneeId?: string; priority?: string }
  ): Promise<{ block: Block; taskId: string }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ block: Block; taskId: string }>>(
        `/cases/${caseId}/notion/blocks/${blockId}/create-task`,
        taskData
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update block z-index
   * PATCH /api/cases/:caseId/notion/blocks/:blockId/z-index
   */
  updateBlockZIndex: async (
    caseId: string,
    blockId: string,
    action: 'front' | 'back' | 'forward' | 'backward'
  ): Promise<Block> => {
    try {
      const response = await apiClient.patch<BlockResponse>(
        `/cases/${caseId}/notion/blocks/${blockId}/z-index`,
        { action }
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // FRAME OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create a frame around selected blocks
   * POST /api/cases/:caseId/notion/pages/:pageId/frames
   */
  createFrame: async (
    caseId: string,
    pageId: string,
    data: {
      frameName?: string
      canvasX: number
      canvasY: number
      canvasWidth: number
      canvasHeight: number
      frameBackgroundColor?: string
      blockIds?: string[]
    }
  ): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/pages/${pageId}/frames`,
        data
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get frame children
   * GET /api/cases/:caseId/notion/frames/:frameId/children
   */
  getFrameChildren: async (caseId: string, frameId: string): Promise<Block[]> => {
    try {
      const response = await apiClient.get<BlocksResponse>(
        `/cases/${caseId}/notion/frames/${frameId}/children`
      )
      return response.data.data || response.data.blocks || []
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add blocks to a frame
   * POST /api/cases/:caseId/notion/frames/:frameId/children
   */
  addBlocksToFrame: async (
    caseId: string,
    frameId: string,
    blockIds: string[]
  ): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/frames/${frameId}/children`,
        { blockIds }
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove a block from a frame
   * DELETE /api/cases/:caseId/notion/frames/:frameId/children/:elementId
   */
  removeBlockFromFrame: async (
    caseId: string,
    frameId: string,
    elementId: string
  ): Promise<Block> => {
    try {
      const response = await apiClient.delete<BlockResponse>(
        `/cases/${caseId}/notion/frames/${frameId}/children/${elementId}`
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Auto-detect and add blocks within frame bounds
   * POST /api/cases/:caseId/notion/frames/:frameId/auto-detect
   */
  autoDetectFrameChildren: async (caseId: string, frameId: string): Promise<Block> => {
    try {
      const response = await apiClient.post<BlockResponse>(
        `/cases/${caseId}/notion/frames/${frameId}/auto-detect`
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Move frame and all its children
   * PATCH /api/cases/:caseId/notion/frames/:frameId/move
   */
  moveFrame: async (
    caseId: string,
    frameId: string,
    deltaX: number,
    deltaY: number
  ): Promise<Block> => {
    try {
      const response = await apiClient.patch<BlockResponse>(
        `/cases/${caseId}/notion/frames/${frameId}/move`,
        { deltaX, deltaY }
      )
      return response.data.data || response.data.block!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}

export default caseNotionService
