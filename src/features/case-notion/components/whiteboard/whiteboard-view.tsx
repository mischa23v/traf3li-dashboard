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
import { CANVAS } from '@/config'
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
import { caseNotionService } from '@/services/caseNotionService'
import { WhiteboardCanvas } from './whiteboard-canvas'
import { BlockDetailPanel } from './block-detail-panel'
import { CaseInfoSidebar } from './case-info-sidebar'
import { useWhiteboardHistory } from '../../stores/whiteboard-history'
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

  // History store for undo/redo
  const {
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    clear: clearHistory,
  } = useWhiteboardHistory()

  // State
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set())
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [localBlocks, setLocalBlocks] = useState<Block[]>([])
  const [localConnections, setLocalConnections] = useState<BlockConnection[]>([])

  // Refs for debouncing and tracking pending updates
  const pendingMoveUpdates = useRef<Map<string, { x: number; y: number; timeout: NodeJS.Timeout }>>(new Map())
  const pendingResizeUpdates = useRef<Map<string, { width: number; height: number; timeout: NodeJS.Timeout }>>(new Map())
  const connectionsRef = useRef<BlockConnection[]>([])
  const isUndoRedoAction = useRef(false)

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

    // Initialize history with first snapshot (only when data first loads)
    if (blocks.length > 0 && !isUndoRedoAction.current) {
      pushSnapshot(blocks, page?.connections || [])
    }
  }, [page?.blocks, blocksData, page?.connections, pushSnapshot])

  // Handle blocks selection
  const handleBlocksSelect = useCallback((blockIds: Set<string>) => {
    setSelectedBlockIds(blockIds)
    if (blockIds.size > 0) {
      setShowDetailPanel(true)
    } else {
      setShowDetailPanel(false)
    }
  }, [])

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!canUndo()) return

    isUndoRedoAction.current = true
    const snapshot = undo()
    if (snapshot) {
      setLocalBlocks(snapshot.blocks)
      setLocalConnections(snapshot.connections)
      toast.success(t('whiteboard.undone', 'Undone'))
    }
    // Reset flag after a short delay to allow state to settle
    setTimeout(() => {
      isUndoRedoAction.current = false
    }, 100)
  }, [canUndo, undo, t])

  // Handle redo
  const handleRedo = useCallback(() => {
    if (!canRedo()) return

    isUndoRedoAction.current = true
    const snapshot = redo()
    if (snapshot) {
      setLocalBlocks(snapshot.blocks)
      setLocalConnections(snapshot.connections)
      toast.success(t('whiteboard.redone', 'Redone'))
    }
    // Reset flag after a short delay to allow state to settle
    setTimeout(() => {
      isUndoRedoAction.current = false
    }, 100)
  }, [canRedo, redo, t])

  // Handle block move - DEBOUNCED to prevent continuous API calls during drag
  const handleBlockMove = useCallback(
    (blockId: string, x: number, y: number) => {
      // Save snapshot before first move (only once per drag operation)
      const pending = pendingMoveUpdates.current.get(blockId)
      if (!pending && !isUndoRedoAction.current) {
        pushSnapshot(localBlocks, localConnections)
      }

      // Optimistic update (immediate)
      setLocalBlocks((prev) =>
        prev.map((block) =>
          block._id === blockId ? { ...block, canvasX: x, canvasY: y } : block
        )
      )

      // Clear any pending update for this block
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
          // FIX: Revert optimistic update by refetching data
          queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
        }
      }, 300)

      pendingMoveUpdates.current.set(blockId, { x, y, timeout })
    },
    [caseId, pageId, updateBlock, queryClient, t, pushSnapshot, localBlocks, localConnections]
  )

  // Handle block resize - DEBOUNCED to prevent continuous API calls during drag
  const handleBlockResize = useCallback(
    (blockId: string, width: number, height: number) => {
      // Save snapshot before first resize (only once per resize operation)
      const pending = pendingResizeUpdates.current.get(blockId)
      if (!pending && !isUndoRedoAction.current) {
        pushSnapshot(localBlocks, localConnections)
      }

      // Optimistic update (immediate)
      setLocalBlocks((prev) =>
        prev.map((block) =>
          block._id === blockId ? { ...block, canvasWidth: width, canvasHeight: height } : block
        )
      )

      // Clear any pending update for this block
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
          // FIX: Revert optimistic update by refetching data
          queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
        }
      }, 300)

      pendingResizeUpdates.current.set(blockId, { width, height, timeout })
    },
    [caseId, pageId, updateBlock, queryClient, t, pushSnapshot, localBlocks, localConnections]
  )

  // Handle block creation - FIX: Send canvas positions at TOP LEVEL, not in properties
  const handleBlockCreate = useCallback(
    async (x: number, y: number, shapeType?: Block['shapeType']) => {
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
            canvasWidth: CANVAS.BLOCK.DEFAULT_WIDTH,
            canvasHeight: CANVAS.BLOCK.DEFAULT_HEIGHT,
            // Shape properties if provided
            ...(shapeType && { shapeType }),
          },
        })

        setLocalBlocks((prev) => [
          ...prev,
          {
            ...newBlock,
            canvasX: x,
            canvasY: y,
            canvasWidth: CANVAS.BLOCK.DEFAULT_WIDTH,
            canvasHeight: CANVAS.BLOCK.DEFAULT_HEIGHT,
            ...(shapeType && { shapeType }),
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
      // FIX: Clear any pending move/resize updates for this block
      const pendingMove = pendingMoveUpdates.current.get(blockId)
      const pendingResize = pendingResizeUpdates.current.get(blockId)
      if (pendingMove) {
        clearTimeout(pendingMove.timeout)
        pendingMoveUpdates.current.delete(blockId)
      }
      if (pendingResize) {
        clearTimeout(pendingResize.timeout)
        pendingResizeUpdates.current.delete(blockId)
      }

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

        if (selectedBlockIds.has(blockId)) {
          const newSelection = new Set(selectedBlockIds)
          newSelection.delete(blockId)
          setSelectedBlockIds(newSelection)
          if (newSelection.size === 0) {
            setShowDetailPanel(false)
          }
        }

        toast.success(t('whiteboard.blockDeleted', 'Block deleted'))
      } catch (error) {
        console.error('Failed to delete block:', error)
        toast.error(t('whiteboard.deleteError', 'Failed to delete block'))
      }
    },
    [caseId, pageId, deleteBlock, selectedBlockIds, t]
  )

  // Handle batch deletion of selected blocks
  const handleBatchDelete = useCallback(async () => {
    if (selectedBlockIds.size === 0) return

    const blockIdsToDelete = Array.from(selectedBlockIds)

    // Clear any pending updates for these blocks
    blockIdsToDelete.forEach((blockId) => {
      const pendingMove = pendingMoveUpdates.current.get(blockId)
      const pendingResize = pendingResizeUpdates.current.get(blockId)
      if (pendingMove) {
        clearTimeout(pendingMove.timeout)
        pendingMoveUpdates.current.delete(blockId)
      }
      if (pendingResize) {
        clearTimeout(pendingResize.timeout)
        pendingResizeUpdates.current.delete(blockId)
      }
    })

    try {
      // Delete all selected blocks
      await Promise.all(
        blockIdsToDelete.map((blockId) =>
          deleteBlock.mutateAsync({
            caseId,
            pageId,
            blockId,
          })
        )
      )

      setLocalBlocks((prev) => prev.filter((block) => !selectedBlockIds.has(block._id)))
      setLocalConnections((prev) =>
        prev.filter(
          (conn) =>
            !selectedBlockIds.has(conn.sourceBlockId) &&
            !selectedBlockIds.has(conn.targetBlockId)
        )
      )

      setSelectedBlockIds(new Set())
      setShowDetailPanel(false)

      toast.success(
        t(
          'whiteboard.blocksDeleted',
          `${selectedBlockIds.size} block${selectedBlockIds.size > 1 ? 's' : ''} deleted`
        )
      )
    } catch (error) {
      console.error('Failed to delete blocks:', error)
      toast.error(t('whiteboard.deleteError', 'Failed to delete blocks'))
    }
  }, [caseId, pageId, deleteBlock, selectedBlockIds, t])

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

  // Handle connection update (label editing)
  const handleConnectionUpdate = useCallback(
    async (connectionId: string, updates: Partial<BlockConnection>) => {
      // Use ref for current connections to avoid stale closure
      const currentConnections = connectionsRef.current

      // Find the connection to update
      const updatedConnections = currentConnections.map((conn) =>
        conn._id === connectionId ? { ...conn, ...updates } : conn
      )

      // Optimistic update
      setLocalConnections(updatedConnections)

      // Update page
      try {
        await updatePage.mutateAsync({
          caseId,
          pageId,
          data: {
            connections: updatedConnections,
          },
        })
        toast.success(t('whiteboard.connectionUpdated', 'Connection updated'))
      } catch (error) {
        console.error('Failed to update connection:', error)
        toast.error(t('whiteboard.updateConnectionError', 'Failed to update connection'))
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
    [caseId, pageId, updateBlock, queryClient, t]
  )

  // Handle creating block from case entity
  const handleCreateBlockFromEntity = useCallback(
    async (
      type: 'event' | 'task' | 'hearing' | 'document',
      data: { _id: string; title?: string; titleAr?: string }
    ) => {
      // Find a good position for the new block
      const existingBlocks = localBlocks.length
      const x = CANVAS.GRID.X_OFFSET + (existingBlocks % CANVAS.GRID.COLUMNS) * CANVAS.GRID.X_SPACING
      const y = CANVAS.GRID.Y_OFFSET + Math.floor(existingBlocks / CANVAS.GRID.COLUMNS) * CANVAS.GRID.Y_SPACING

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
            canvasWidth: CANVAS.BLOCK.DEFAULT_WIDTH,
            canvasHeight: CANVAS.BLOCK.DEFAULT_HEIGHT,
            [linkField]: data._id,
          },
        })

        setLocalBlocks((prev) => [
          ...prev,
          {
            ...newBlock,
            canvasX: x,
            canvasY: y,
            canvasWidth: CANVAS.BLOCK.DEFAULT_WIDTH,
            canvasHeight: CANVAS.BLOCK.DEFAULT_HEIGHT,
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

  // Handle z-index change
  const handleZIndex = useCallback(
    async (blockId: string, action: 'front' | 'back' | 'forward' | 'backward') => {
      try {
        // Call the backend API
        await caseNotionService.updateBlockZIndex(caseId, blockId, action)

        // Optimistically update local state by refetching
        queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })

        toast.success(t('whiteboard.zIndexUpdated', 'Layer order updated'))
      } catch (error) {
        console.error('Failed to update z-index:', error)
        toast.error(t('whiteboard.zIndexError', 'Failed to update layer order'))
      }
    },
    [caseId, pageId, queryClient, t]
  )

  // Handle frame creation
  const handleCreateFrame = useCallback(
    async (selectedBlockIds: string[]) => {
      if (selectedBlockIds.length === 0) {
        toast.error(t('whiteboard.selectBlocksForFrame', 'Please select blocks to frame'))
        return
      }

      try {
        // Calculate bounding box of selected blocks with padding
        const selectedBlocksData = localBlocks.filter((b) => selectedBlockIds.includes(b._id))
        if (selectedBlocksData.length === 0) return

        const padding = CANVAS.GRID.PADDING
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity

        selectedBlocksData.forEach((block) => {
          const x = block.canvasX || 0
          const y = block.canvasY || 0
          const width = block.canvasWidth || CANVAS.BLOCK.DEFAULT_WIDTH
          const height = block.canvasHeight || CANVAS.BLOCK.DEFAULT_HEIGHT

          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x + width)
          maxY = Math.max(maxY, y + height)
        })

        const frameX = minX - padding
        const frameY = minY - padding
        const frameWidth = maxX - minX + padding * 2
        const frameHeight = maxY - minY + padding * 2

        // Save snapshot for undo
        pushSnapshot(localBlocks, localConnections)

        // Create frame via API
        const frame = await caseNotionService.createFrame(caseId, pageId, {
          frameName: t('whiteboard.newFrame', 'New Frame'),
          canvasX: frameX,
          canvasY: frameY,
          canvasWidth: frameWidth,
          canvasHeight: frameHeight,
          frameBackgroundColor: 'default',
          blockIds: selectedBlockIds,
        })

        // Update local state
        setLocalBlocks((prev) => [...prev, frame])

        toast.success(t('whiteboard.frameCreated', 'Frame created'))
      } catch (error) {
        console.error('Failed to create frame:', error)
        toast.error(t('whiteboard.createFrameError', 'Failed to create frame'))
      }
    },
    [caseId, pageId, localBlocks, localConnections, pushSnapshot, t]
  )

  // Handle frame move (moves frame and all children)
  const handleFrameMove = useCallback(
    async (frameId: string, newX: number, newY: number) => {
      // Find the frame
      const frame = localBlocks.find((b) => b._id === frameId && b.isFrame)
      if (!frame) return

      const oldX = frame.canvasX || 0
      const oldY = frame.canvasY || 0
      const deltaX = newX - oldX
      const deltaY = newY - oldY

      // Optimistic update
      setLocalBlocks((prev) =>
        prev.map((block) => {
          if (block._id === frameId) {
            return { ...block, canvasX: newX, canvasY: newY }
          }
          // Move children with frame
          if (frame.frameChildren?.includes(block._id)) {
            return {
              ...block,
              canvasX: (block.canvasX || 0) + deltaX,
              canvasY: (block.canvasY || 0) + deltaY,
            }
          }
          return block
        })
      )

      // Debounce server update
      const pending = pendingMoveUpdates.current.get(frameId)
      if (pending) {
        clearTimeout(pending.timeout)
      }

      const timeout = setTimeout(async () => {
        pendingMoveUpdates.current.delete(frameId)
        try {
          await caseNotionService.moveFrame(caseId, frameId, deltaX, deltaY)
        } catch (error) {
          console.error('Failed to move frame:', error)
          toast.error(t('whiteboard.moveFrameError', 'Failed to move frame'))
          queryClient.invalidateQueries({ queryKey: caseNotionKeys.blocks(caseId, pageId) })
        }
      }, 300)

      pendingMoveUpdates.current.set(frameId, { x: newX, y: newY, timeout })
    },
    [caseId, pageId, localBlocks, queryClient, t]
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
        selectedBlockIds={selectedBlockIds}
        onBlocksSelect={handleBlocksSelect}
        onBlockMove={handleBlockMove}
        onBlockResize={handleBlockResize}
        onBlockCreate={handleBlockCreate}
        onBlockDelete={handleBlockDelete}
        onBatchDelete={handleBatchDelete}
        onConnectionCreate={handleConnectionCreate}
        onConnectionDelete={handleConnectionDelete}
        onConnectionUpdate={handleConnectionUpdate}
        onConfigChange={handleConfigChange}
        onZIndexChange={handleZIndex}
        onCreateFrame={handleCreateFrame}
        onFrameMove={handleFrameMove}
        readOnly={readOnly}
      />

      {/* Block Detail Panel (right) */}
      <BlockDetailPanel
        block={
          selectedBlockIds.size === 1
            ? localBlocks.find((b) => b._id === Array.from(selectedBlockIds)[0]) || null
            : null
        }
        selectedBlockIds={selectedBlockIds}
        blocks={localBlocks}
        isOpen={showDetailPanel}
        onClose={() => {
          setShowDetailPanel(false)
          setSelectedBlockIds(new Set())
        }}
        onSave={handleBlockSave}
        onDelete={selectedBlockIds.size === 1 ? handleBlockDelete : handleBatchDelete}
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
