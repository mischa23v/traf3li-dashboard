/**
 * WhiteboardView - Main whiteboard/brainstorm view component
 * Integrates all whiteboard components:
 * - CaseInfoSidebar (left)
 * - WhiteboardCanvas (center)
 * - BlockDetailPanel (right, conditional)
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useCaseNotionPage,
  useCaseNotionBlocks,
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useUpdateCaseNotionPage,
  caseNotionKeys,
} from '@/hooks/useCaseNotion'
import { useCase } from '@/hooks/useCasesAndClients'
import { WhiteboardCanvas } from './whiteboard-canvas'
import { BlockDetailPanel } from './block-detail-panel'
import { CaseInfoSidebar } from './case-info-sidebar'
import type { Block, BlockConnection, WhiteboardConfig, RichTextItem } from '../../data/schema'

interface WhiteboardViewProps {
  caseId: string
  pageId: string
  readOnly?: boolean
}

export function WhiteboardView({ caseId, pageId, readOnly }: WhiteboardViewProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const queryClient = useQueryClient()

  // State
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [localBlocks, setLocalBlocks] = useState<Block[]>([])
  const [localConnections, setLocalConnections] = useState<BlockConnection[]>([])

  // Refs for debouncing and tracking pending updates
  const pendingMoveUpdates = useRef<Map<string, { x: number; y: number; timeout: NodeJS.Timeout }>>(new Map())
  const pendingResizeUpdates = useRef<Map<string, { width: number; height: number; timeout: NodeJS.Timeout }>>(new Map())
  const connectionsRef = useRef<BlockConnection[]>([])

  // Keep connectionsRef in sync
  useEffect(() => {
    connectionsRef.current = localConnections
  }, [localConnections])

  // Fetch page data
  const { data: page, isLoading: pageLoading } = useCaseNotionPage(caseId, pageId)
  const { data: blocksData, isLoading: blocksLoading } = useCaseNotionBlocks(caseId, pageId)

  // Fetch case data for sidebar
  const { data: caseData } = useCase(caseId)

  // Extract events, tasks, hearings from case data
  const caseEvents = caseData?.timeline || []
  const caseTasks = caseData?.tasks || []
  const caseHearings = caseData?.hearings || []
  const caseDocuments = caseData?.documents || []

  // Mutations
  const createBlock = useCreateBlock()
  const updateBlock = useUpdateBlock()
  const deleteBlock = useDeleteBlock()
  const updatePage = useUpdateCaseNotionPage()

  // Sync blocks from server - FIX: Check array length, not just existence (empty array is truthy)
  useEffect(() => {
    const blocks = (page?.blocks && page.blocks.length > 0)
      ? page.blocks
      : (blocksData || [])
    setLocalBlocks(blocks)
    setLocalConnections(page?.connections || [])
  }, [page?.blocks, blocksData, page?.connections])

  // Handle block selection
  const handleBlockSelect = useCallback((block: Block | null) => {
    setSelectedBlock(block)
    if (block) {
      setShowDetailPanel(true)
    }
  }, [])

  // Handle block move - DEBOUNCED to prevent continuous API calls during drag
  const handleBlockMove = useCallback(
    (blockId: string, x: number, y: number) => {
      // Optimistic update (immediate)
      setLocalBlocks((prev) =>
        prev.map((block) =>
          block._id === blockId ? { ...block, canvasX: x, canvasY: y } : block
        )
      )

      // Clear any pending update for this block
      const pending = pendingMoveUpdates.current.get(blockId)
      if (pending) {
        clearTimeout(pending.timeout)
      }

      // Debounce server update - only update after 300ms of no movement
      const timeout = setTimeout(async () => {
        pendingMoveUpdates.current.delete(blockId)
        try {
          await updateBlock.mutateAsync({
            caseId,
            pageId,
            blockId,
            data: {
              canvasX: x,
              canvasY: y,
            },
          })
        } catch (error) {
          console.error('Failed to update block position:', error)
          toast.error(t('whiteboard.moveError', 'Failed to move block'))
        }
      }, 300)

      pendingMoveUpdates.current.set(blockId, { x, y, timeout })
    },
    [caseId, pageId, updateBlock, t]
  )

  // Handle block resize - DEBOUNCED to prevent continuous API calls during drag
  const handleBlockResize = useCallback(
    (blockId: string, width: number, height: number) => {
      // Optimistic update (immediate)
      setLocalBlocks((prev) =>
        prev.map((block) =>
          block._id === blockId ? { ...block, canvasWidth: width, canvasHeight: height } : block
        )
      )

      // Clear any pending update for this block
      const pending = pendingResizeUpdates.current.get(blockId)
      if (pending) {
        clearTimeout(pending.timeout)
      }

      // Debounce server update - only update after 300ms of no resizing
      const timeout = setTimeout(async () => {
        pendingResizeUpdates.current.delete(blockId)
        try {
          await updateBlock.mutateAsync({
            caseId,
            pageId,
            blockId,
            data: {
              canvasWidth: width,
              canvasHeight: height,
            },
          })
        } catch (error) {
          console.error('Failed to update block size:', error)
          toast.error(t('whiteboard.resizeError', 'Failed to resize block'))
        }
      }, 300)

      pendingResizeUpdates.current.set(blockId, { width, height, timeout })
    },
    [caseId, pageId, updateBlock, t]
  )

  // Handle block creation - FIX: Send canvas positions at TOP LEVEL, not in properties
  const handleBlockCreate = useCallback(
    async (x: number, y: number) => {
      try {
        const newBlock = await createBlock.mutateAsync({
          caseId,
          pageId,
          data: {
            pageId,
            type: 'text',
            content: [],
            // Canvas positions at TOP LEVEL (matching Block schema)
            canvasX: x,
            canvasY: y,
            canvasWidth: 200,
            canvasHeight: 150,
          },
        })

        setLocalBlocks((prev) => [
          ...prev,
          {
            ...newBlock,
            canvasX: x,
            canvasY: y,
            canvasWidth: 200,
            canvasHeight: 150,
          },
        ])

        setSelectedBlock(newBlock)
        setShowDetailPanel(true)
        toast.success(t('whiteboard.blockCreated', 'Block created'))
      } catch (error) {
        console.error('Failed to create block:', error)
        toast.error(t('whiteboard.createError', 'Failed to create block'))
      }
    },
    [caseId, pageId, createBlock, t]
  )

  // Handle block deletion
  const handleBlockDelete = useCallback(
    async (blockId: string) => {
      try {
        await deleteBlock.mutateAsync({
          caseId,
          pageId,
          blockId,
        })

        setLocalBlocks((prev) => prev.filter((block) => block._id !== blockId))
        setLocalConnections((prev) =>
          prev.filter(
            (conn) => conn.sourceBlockId !== blockId && conn.targetBlockId !== blockId
          )
        )

        if (selectedBlock?._id === blockId) {
          setSelectedBlock(null)
          setShowDetailPanel(false)
        }

        toast.success(t('whiteboard.blockDeleted', 'Block deleted'))
      } catch (error) {
        console.error('Failed to delete block:', error)
        toast.error(t('whiteboard.deleteError', 'Failed to delete block'))
      }
    },
    [caseId, pageId, deleteBlock, selectedBlock, t]
  )

  // Handle connection creation - FIXED: Uses ref to avoid stale closure
  const handleConnectionCreate = useCallback(
    async (sourceId: string, targetId: string) => {
      // Use ref for current connections to avoid stale closure
      const currentConnections = connectionsRef.current

      // Check if connection already exists
      const exists = currentConnections.some(
        (conn) =>
          (conn.sourceBlockId === sourceId && conn.targetBlockId === targetId) ||
          (conn.sourceBlockId === targetId && conn.targetBlockId === sourceId)
      )

      if (exists) {
        toast.info(t('whiteboard.connectionExists', 'Connection already exists'))
        return
      }

      const newConnection: BlockConnection = {
        _id: `temp-${Date.now()}`,
        pageId,
        sourceBlockId: sourceId,
        targetBlockId: targetId,
        connectionType: 'arrow',
      }

      // Optimistic update
      setLocalConnections((prev) => [...prev, newConnection])

      // Update page with new connections - use functional update pattern
      try {
        await updatePage.mutateAsync({
          caseId,
          pageId,
          data: {
            // @ts-ignore - connections field exists but may not be typed
            connections: [...currentConnections, newConnection],
          },
        })
        toast.success(t('whiteboard.connectionCreated', 'Connection created'))
      } catch (error) {
        console.error('Failed to create connection:', error)
        setLocalConnections((prev) => prev.filter((c) => c._id !== newConnection._id))
        toast.error(t('whiteboard.connectionError', 'Failed to create connection'))
      }
    },
    [caseId, pageId, updatePage, t]
  )

  // Handle connection deletion - FIXED: Uses ref to avoid stale closure
  const handleConnectionDelete = useCallback(
    async (connectionId: string) => {
      // Use ref for current connections to avoid stale closure
      const currentConnections = connectionsRef.current

      // Optimistic update
      setLocalConnections((prev) => prev.filter((conn) => conn._id !== connectionId))

      // Update page
      try {
        await updatePage.mutateAsync({
          caseId,
          pageId,
          data: {
            // @ts-ignore
            connections: currentConnections.filter((c) => c._id !== connectionId),
          },
        })
        toast.success(t('whiteboard.connectionDeleted', 'Connection deleted'))
      } catch (error) {
        console.error('Failed to delete connection:', error)
        toast.error(t('whiteboard.deleteConnectionError', 'Failed to delete connection'))
        // Revert optimistic update
        queryClient.invalidateQueries({ queryKey: caseNotionKeys.page(caseId, pageId) })
      }
    },
    [caseId, pageId, updatePage, queryClient, t]
  )

  // Handle whiteboard config change
  const handleConfigChange = useCallback(
    async (config: Partial<WhiteboardConfig>) => {
      try {
        await updatePage.mutateAsync({
          caseId,
          pageId,
          data: {
            // @ts-ignore
            whiteboardConfig: {
              ...page?.whiteboardConfig,
              ...config,
            },
          },
        })
      } catch (error) {
        console.error('Failed to update config:', error)
      }
    },
    [caseId, pageId, page?.whiteboardConfig, updatePage]
  )

  // Handle block save from detail panel
  const handleBlockSave = useCallback(
    async (blockId: string, updates: Partial<Block>) => {
      // Optimistic update
      setLocalBlocks((prev) =>
        prev.map((block) => (block._id === blockId ? { ...block, ...updates } : block))
      )

      if (selectedBlock?._id === blockId) {
        setSelectedBlock((prev) => (prev ? { ...prev, ...updates } : prev))
      }

      try {
        await updateBlock.mutateAsync({
          caseId,
          pageId,
          blockId,
          data: {
            content: updates.content,
            type: updates.type,
            properties: {
              blockColor: updates.blockColor,
              priority: updates.priority,
              partyType: updates.partyType,
              evidenceType: updates.evidenceType,
              eventDate: updates.eventDate,
              linkedEventId: updates.linkedEventId,
              linkedTaskId: updates.linkedTaskId,
              linkedHearingId: updates.linkedHearingId,
              linkedDocumentId: updates.linkedDocumentId,
            },
          },
        })
        toast.success(t('common.saved', 'Saved'))
      } catch (error) {
        console.error('Failed to save block:', error)
        toast.error(t('common.saveError', 'Failed to save'))
        queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
      }
    },
    [caseId, pageId, selectedBlock, updateBlock, queryClient, t]
  )

  // Handle creating block from case entity
  const handleCreateBlockFromEntity = useCallback(
    async (
      type: 'event' | 'task' | 'hearing' | 'document',
      data: { _id: string; title?: string; titleAr?: string }
    ) => {
      // Find a good position for the new block
      const existingBlocks = localBlocks.length
      const x = 100 + (existingBlocks % 5) * 220
      const y = 100 + Math.floor(existingBlocks / 5) * 180

      const content: RichTextItem[] = [
        {
          type: 'text',
          text: { content: isArabic ? data.titleAr || data.title || '' : data.title || '' },
          plainText: isArabic ? data.titleAr || data.title || '' : data.title || '',
        },
      ]

      const linkField =
        type === 'event'
          ? 'linkedEventId'
          : type === 'task'
          ? 'linkedTaskId'
          : type === 'hearing'
          ? 'linkedHearingId'
          : 'linkedDocumentId'

      try {
        // FIX: Send canvas positions at TOP LEVEL, not in properties
        const newBlock = await createBlock.mutateAsync({
          caseId,
          pageId,
          data: {
            pageId,
            type: 'text',
            content,
            // Canvas positions at TOP LEVEL (matching Block schema)
            canvasX: x,
            canvasY: y,
            canvasWidth: 200,
            canvasHeight: 150,
            [linkField]: data._id,
          },
        })

        setLocalBlocks((prev) => [
          ...prev,
          {
            ...newBlock,
            canvasX: x,
            canvasY: y,
            canvasWidth: 200,
            canvasHeight: 150,
            [linkField]: data._id,
          },
        ])

        toast.success(t('whiteboard.blockCreated', 'Block created'))
      } catch (error) {
        console.error('Failed to create block from entity:', error)
        toast.error(t('whiteboard.createError', 'Failed to create block'))
      }
    },
    [caseId, pageId, localBlocks, createBlock, isArabic, t]
  )

  const isLoading = pageLoading || blocksLoading

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      {/* Case Info Sidebar (left) */}
      <CaseInfoSidebar
        caseInfo={caseData}
        events={caseEvents}
        tasks={caseTasks}
        hearings={caseHearings}
        documents={caseDocuments}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCreateBlockFromEvent={(event) => handleCreateBlockFromEntity('event', event)}
        onCreateBlockFromTask={(task) => handleCreateBlockFromEntity('task', task)}
        onCreateBlockFromHearing={(hearing) => handleCreateBlockFromEntity('hearing', hearing)}
        onCreateBlockFromDocument={(doc) => handleCreateBlockFromEntity('document', doc)}
      />

      {/* Whiteboard Canvas (center) */}
      <WhiteboardCanvas
        caseId={caseId}
        pageId={pageId}
        blocks={localBlocks}
        connections={localConnections}
        config={page?.whiteboardConfig}
        selectedBlockId={selectedBlock?._id}
        onBlockSelect={handleBlockSelect}
        onBlockMove={handleBlockMove}
        onBlockResize={handleBlockResize}
        onBlockCreate={handleBlockCreate}
        onBlockDelete={handleBlockDelete}
        onConnectionCreate={handleConnectionCreate}
        onConnectionDelete={handleConnectionDelete}
        onConfigChange={handleConfigChange}
        readOnly={readOnly}
      />

      {/* Block Detail Panel (right) */}
      <BlockDetailPanel
        block={selectedBlock}
        isOpen={showDetailPanel}
        onClose={() => {
          setShowDetailPanel(false)
          setSelectedBlock(null)
        }}
        onSave={handleBlockSave}
        onDelete={handleBlockDelete}
        availableEvents={caseEvents}
        availableTasks={caseTasks}
        availableHearings={caseHearings}
        availableDocuments={caseDocuments}
        readOnly={readOnly}
      />
    </div>
  )
}

export default WhiteboardView
