/**
 * CaseNotion React Query Hooks
 * Provides data fetching and mutation hooks for CaseNotion features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { caseNotionService } from '@/services/caseNotionService'
import type {
  CaseNotionPage,
  Block,
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
// Cache Configuration
// ═══════════════════════════════════════════════════════════════
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════

export const caseNotionKeys = {
  all: ['case-notion'] as const,
  pages: (caseId: string) => [...caseNotionKeys.all, 'pages', caseId] as const,
  pagesList: (caseId: string, filters?: PageFilters) =>
    [...caseNotionKeys.pages(caseId), 'list', filters] as const,
  page: (caseId: string, pageId: string) =>
    [...caseNotionKeys.pages(caseId), pageId] as const,
  blocks: (caseId: string, pageId: string) =>
    [...caseNotionKeys.page(caseId, pageId), 'blocks'] as const,
  comments: (caseId: string, blockId: string) =>
    [...caseNotionKeys.all, 'comments', caseId, blockId] as const,
  activity: (caseId: string, pageId: string) =>
    [...caseNotionKeys.page(caseId, pageId), 'activity'] as const,
  templates: (category?: string) =>
    [...caseNotionKeys.all, 'templates', category] as const,
  search: (caseId: string, query: string) =>
    [...caseNotionKeys.all, 'search', caseId, query] as const,
}

// ═══════════════════════════════════════════════════════════════
// PAGE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch all pages for a case
 */
export function useCaseNotionPages(caseId: string, filters?: PageFilters) {
  return useQuery({
    queryKey: caseNotionKeys.pagesList(caseId, filters),
    queryFn: () => caseNotionService.listPages(caseId, filters),
    enabled: !!caseId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Fetch a single page with blocks
 */
export function useCaseNotionPage(caseId: string, pageId: string) {
  return useQuery({
    queryKey: caseNotionKeys.page(caseId, pageId),
    queryFn: () => caseNotionService.getPage(caseId, pageId),
    enabled: !!caseId && !!pageId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Create a new page
 */
export function useCreateCaseNotionPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: CreatePageInput }) =>
      caseNotionService.createPage(caseId, data),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Update a page
 */
export function useUpdateCaseNotionPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      data,
    }: {
      caseId: string
      pageId: string
      data: UpdatePageInput
    }) => caseNotionService.updatePage(caseId, pageId, data),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Delete a page
 */
export function useDeleteCaseNotionPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.deletePage(caseId, pageId),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Archive a page
 */
export function useArchiveCaseNotionPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.archivePage(caseId, pageId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Restore a page
 */
export function useRestoreCaseNotionPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.restorePage(caseId, pageId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Duplicate a page
 */
export function useDuplicateCaseNotionPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.duplicatePage(caseId, pageId),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Toggle favorite status
 */
export function useToggleFavoritePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.toggleFavorite(caseId, pageId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Toggle pin status
 */
export function useTogglePinPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.togglePin(caseId, pageId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// BLOCK HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch blocks for a page
 */
export function useCaseNotionBlocks(caseId: string, pageId: string) {
  return useQuery({
    queryKey: caseNotionKeys.blocks(caseId, pageId),
    queryFn: () => caseNotionService.getBlocks(caseId, pageId),
    enabled: !!caseId && !!pageId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Create a block
 */
export function useCreateBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      data,
    }: {
      caseId: string
      pageId: string
      data: CreateBlockInput
    }) => caseNotionService.createBlock(caseId, pageId, data),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
    },
  })
}

/**
 * Update a block
 */
export function useUpdateBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      blockId,
      data,
    }: {
      caseId: string
      pageId: string
      blockId: string
      data: UpdateBlockInput
    }) => caseNotionService.updateBlock(caseId, blockId, data),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
      // FIX: Also invalidate page query since CaseNotionPage includes blocks array
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
    },
  })
}

/**
 * Delete a block
 */
export function useDeleteBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      blockId,
    }: {
      caseId: string
      pageId: string
      blockId: string
    }) => caseNotionService.deleteBlock(caseId, blockId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
    },
  })
}

/**
 * Move a block
 */
export function useMoveBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      data,
    }: {
      caseId: string
      pageId: string
      data: MoveBlockInput
    }) => caseNotionService.moveBlock(caseId, data),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
    },
  })
}

/**
 * Lock a block for editing
 */
export function useLockBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      blockId,
    }: {
      caseId: string
      pageId: string
      blockId: string
    }) => caseNotionService.lockBlock(caseId, blockId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
    },
  })
}

/**
 * Unlock a block
 */
export function useUnlockBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      blockId,
    }: {
      caseId: string
      pageId: string
      blockId: string
    }) => caseNotionService.unlockBlock(caseId, blockId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// COMMENT HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch comments for a block
 */
export function useBlockComments(caseId: string, blockId: string) {
  return useQuery({
    queryKey: caseNotionKeys.comments(caseId, blockId),
    queryFn: () => caseNotionService.getComments(caseId, blockId),
    enabled: !!caseId && !!blockId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Add a comment
 */
export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      blockId,
      content,
      parentCommentId,
    }: {
      caseId: string
      blockId: string
      content: string
      parentCommentId?: string
    }) => caseNotionService.addComment(caseId, blockId, content, parentCommentId),
    onSuccess: (_, { caseId, blockId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.comments(caseId, blockId) })
    },
  })
}

/**
 * Resolve a comment
 */
export function useResolveComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      blockId,
      commentId,
    }: {
      caseId: string
      blockId: string
      commentId: string
    }) => caseNotionService.resolveComment(caseId, commentId),
    onSuccess: (_, { caseId, blockId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.comments(caseId, blockId) })
    },
  })
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      blockId,
      commentId,
    }: {
      caseId: string
      blockId: string
      commentId: string
    }) => caseNotionService.deleteComment(caseId, commentId),
    onSuccess: (_, { caseId, blockId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.comments(caseId, blockId) })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch page activity history
 */
export function usePageActivity(caseId: string, pageId: string, limit?: number) {
  return useQuery({
    queryKey: caseNotionKeys.activity(caseId, pageId),
    queryFn: () => caseNotionService.getPageActivity(caseId, pageId, limit),
    enabled: !!caseId && !!pageId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch available templates
 */
export function useCaseNotionTemplates(category?: string) {
  return useQuery({
    queryKey: caseNotionKeys.templates(category),
    queryFn: () => caseNotionService.getTemplates(category),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Apply a template to a page
 */
export function useApplyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      templateId,
    }: {
      caseId: string
      pageId: string
      templateId: string
    }) => caseNotionService.applyTemplate(caseId, pageId, templateId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
    },
  })
}

/**
 * Save page as template
 */
export function useSaveAsTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      templateData,
    }: {
      caseId: string
      pageId: string
      templateData: { name: string; nameAr?: string; category: string; description?: string }
    }) => caseNotionService.saveAsTemplate(caseId, pageId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.templates() })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// SEARCH HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Search within case notion pages
 */
export function useCaseNotionSearch(caseId: string, query: string) {
  return useQuery({
    queryKey: caseNotionKeys.search(caseId, query),
    queryFn: () => caseNotionService.search(caseId, query),
    enabled: !!caseId && !!query && query.length > 2,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// EXPORT HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Export page as PDF
 */
export function useExportPagePdf() {
  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.exportPdf(caseId, pageId),
  })
}

/**
 * Export page as Markdown
 */
export function useExportPageMarkdown() {
  return useMutation({
    mutationFn: ({ caseId, pageId }: { caseId: string; pageId: string }) =>
      caseNotionService.exportMarkdown(caseId, pageId),
  })
}

// ═══════════════════════════════════════════════════════════════
// MERGE & LINK HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Merge multiple pages
 */
export function useMergePages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      sourcePageIds,
      targetTitle,
      deleteSourcePages,
    }: {
      caseId: string
      sourcePageIds: string[]
      targetTitle: string
      deleteSourcePages?: boolean
    }) => caseNotionService.mergePages(caseId, sourcePageIds, targetTitle, deleteSourcePages),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.pages(caseId) })
    },
  })
}

/**
 * Link a task to a block
 */
export function useLinkTaskToBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      blockId,
      taskId,
    }: {
      caseId: string
      pageId: string
      blockId: string
      taskId: string
    }) => caseNotionService.linkTask(caseId, blockId, taskId),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
    },
  })
}

/**
 * Create a task from a block
 */
export function useCreateTaskFromBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      caseId,
      pageId,
      blockId,
      taskData,
    }: {
      caseId: string
      pageId: string
      blockId: string
      taskData: { title: string; dueDate?: string; assigneeId?: string; priority?: string }
    }) => caseNotionService.createTaskFromBlock(caseId, blockId, taskData),
    onSuccess: (_, { caseId, pageId }) => {
      queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
    },
  })
}
