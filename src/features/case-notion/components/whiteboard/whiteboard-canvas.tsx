/**
 * WhiteboardCanvas - Main canvas component for brainstorm/whiteboard view
 * Features:
 * - Infinite canvas with pan/zoom
 * - Grid background
 * - Block positioning and drag-drop
 * - Connection lines between blocks
 */

import { useState, useRef, useCallback, useEffect, MouseEvent as ReactMouseEvent, WheelEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Plus,
  Undo,
  Redo,
  MousePointer,
  Hand,
  Trash2,
  Square,
  Circle,
  Diamond,
  Triangle,
  Hexagon,
  Star,
  StickyNote,
  Type,
  ArrowRight,
  Frame,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { WhiteboardBlock } from './whiteboard-block'
import { ShapeRenderer } from './shape-renderer'
import { FrameRenderer } from './frame-renderer'
import { ShapeSelector } from './shape-selector'
import { BlockConnections } from './block-connections'
import type { Block, BlockConnection, WhiteboardConfig } from '../../data/schema'

interface WhiteboardCanvasProps {
  caseId: string
  pageId: string
  blocks: Block[]
  connections: BlockConnection[]
  config?: WhiteboardConfig
  onBlocksSelect: (blockIds: Set<string>) => void
  onBlockMove: (blockId: string, x: number, y: number) => void
  onBlockResize: (blockId: string, width: number, height: number) => void
  onBlockCreate: (x: number, y: number, shapeType?: Block['shapeType']) => void
  onBlockDelete: (blockId: string) => void
  onBatchDelete: () => void
  onConnectionCreate: (sourceId: string, targetId: string) => void
  onConnectionDelete: (connectionId: string) => void
  onConnectionUpdate?: (connectionId: string, updates: Partial<BlockConnection>) => void
  onConfigChange: (config: Partial<WhiteboardConfig>) => void
  onZIndexChange?: (blockId: string, action: 'front' | 'back' | 'forward' | 'backward') => void
  onDuplicate?: (blockIds: string[]) => void
  onCreateFrame?: (selectedBlockIds: string[]) => void
  onFrameMove?: (frameId: string, x: number, y: number) => void
  selectedBlockIds: Set<string>
  readOnly?: boolean
}

type CanvasTool = 'select' | 'pan' | 'connect'

export function WhiteboardCanvas({
  caseId,
  pageId,
  blocks,
  connections,
  config,
  onBlocksSelect,
  onBlockMove,
  onBlockResize,
  onBlockCreate,
  onBlockDelete,
  onBatchDelete,
  onConnectionCreate,
  onConnectionDelete,
  onConnectionUpdate,
  onConfigChange,
  onZIndexChange,
  onDuplicate,
  onCreateFrame,
  onFrameMove,
  selectedBlockIds,
  readOnly,
}: WhiteboardCanvasProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<{ blocks: Block[]; connections: BlockConnection[] } | null>(null)

  // Canvas state
  const [zoom, setZoom] = useState(config?.zoom || 1)
  const [panX, setPanX] = useState(config?.panX || 0)
  const [panY, setPanY] = useState(config?.panY || 0)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(config?.gridEnabled ?? true)
  const [activeTool, setActiveTool] = useState<CanvasTool>('select')
  const [selectedShapeType, setSelectedShapeType] = useState<Block['shapeType']>(undefined)

  // Connection drawing state
  const [isDrawingConnection, setIsDrawingConnection] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const [connectionEnd, setConnectionEnd] = useState<{ x: number; y: number } | null>(null)

  // Dragging state
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragBlockStart, setDragBlockStart] = useState({ x: 0, y: 0 })

  // Selection rectangle state
  const [selectionRect, setSelectionRect] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)

  const gridSize = config?.gridSize || 20

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const container = containerRef.current
      if (!container) return { x: 0, y: 0 }

      const rect = container.getBoundingClientRect()
      const x = (screenX - rect.left - panX) / zoom
      const y = (screenY - rect.top - panY) / zoom

      return { x, y }
    },
    [panX, panY, zoom]
  )

  // Snap to grid
  const snapToGrid = useCallback(
    (value: number) => {
      if (!config?.snapToGrid) return value
      return Math.round(value / gridSize) * gridSize
    },
    [config?.snapToGrid, gridSize]
  )

  // Handle zoom
  const handleZoom = useCallback(
    (delta: number, centerX?: number, centerY?: number) => {
      const newZoom = Math.min(Math.max(zoom + delta, 0.1), 3)

      // Zoom towards center point if provided
      let finalPanX = panX
      let finalPanY = panY

      if (centerX !== undefined && centerY !== undefined) {
        const container = containerRef.current
        if (container) {
          const rect = container.getBoundingClientRect()
          const mouseX = centerX - rect.left
          const mouseY = centerY - rect.top

          // Calculate new pan to keep mouse position fixed
          const scale = newZoom / zoom
          finalPanX = mouseX - (mouseX - panX) * scale
          finalPanY = mouseY - (mouseY - panY) * scale

          setPanX(finalPanX)
          setPanY(finalPanY)
        }
      }

      setZoom(newZoom)
      // FIX: Use the calculated pan values, not stale closure values
      onConfigChange({ zoom: newZoom, panX: finalPanX, panY: finalPanY })
    },
    [zoom, panX, panY, onConfigChange]
  )

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        handleZoom(delta, e.clientX, e.clientY)
      } else if (activeTool === 'pan' || e.shiftKey) {
        // Pan with shift+scroll or in pan mode
        setPanX((prev) => prev - e.deltaX)
        setPanY((prev) => prev - e.deltaY)
      }
    },
    [handleZoom, activeTool]
  )

  // Handle canvas mouse down
  const handleCanvasMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      // Only handle left click
      if (e.button !== 0) return

      const target = e.target as HTMLElement
      const isCanvas = target === canvasRef.current || target.classList.contains('canvas-background')

      if (activeTool === 'pan' || (e.shiftKey && isCanvas)) {
        setIsPanning(true)
        setPanStart({ x: e.clientX - panX, y: e.clientY - panY })
        return
      }

      // Click on empty canvas
      if (isCanvas) {
        // Double-click to create new block
        if (e.detail === 2 && !readOnly) {
          const { x, y } = screenToCanvas(e.clientX, e.clientY)
          onBlockCreate(snapToGrid(x), snapToGrid(y), selectedShapeType)
          return
        }

        // Single click - start selection rectangle
        if (!readOnly) {
          const { x, y } = screenToCanvas(e.clientX, e.clientY)
          setSelectionRect({
            startX: x,
            startY: y,
            currentX: x,
            currentY: y,
          })
          // Clear selection when starting to draw rectangle
          onBlocksSelect(new Set())
        }
      }
    },
    [activeTool, panX, panY, screenToCanvas, snapToGrid, onBlocksSelect, onBlockCreate, readOnly]
  )

  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (isPanning) {
        setPanX(e.clientX - panStart.x)
        setPanY(e.clientY - panStart.y)
        return
      }

      if (draggingBlockId) {
        const dx = (e.clientX - dragStart.x) / zoom
        const dy = (e.clientY - dragStart.y) / zoom
        const newX = snapToGrid(dragBlockStart.x + dx)
        const newY = snapToGrid(dragBlockStart.y + dy)
        onBlockMove(draggingBlockId, newX, newY)
        return
      }

      if (isDrawingConnection) {
        const { x, y } = screenToCanvas(e.clientX, e.clientY)
        setConnectionEnd({ x, y })
        return
      }

      if (selectionRect) {
        const { x, y } = screenToCanvas(e.clientX, e.clientY)
        setSelectionRect((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null))
      }
    },
    [
      isPanning,
      panStart,
      draggingBlockId,
      dragStart,
      dragBlockStart,
      zoom,
      snapToGrid,
      onBlockMove,
      isDrawingConnection,
      selectionRect,
      screenToCanvas,
    ]
  )

  // Handle canvas mouse up - works with both React events and native events
  const handleCanvasMouseUp = useCallback(
    (e: ReactMouseEvent | MouseEvent) => {
      const wasPanning = isPanning
      const wasDragging = draggingBlockId !== null

      setIsPanning(false)
      setDraggingBlockId(null)

      if (isDrawingConnection && connectionStart) {
        // Check if we're over a block to complete the connection
        const target = e.target as HTMLElement
        const blockElement = target.closest('[data-block-id]')
        if (blockElement) {
          const targetBlockId = blockElement.getAttribute('data-block-id')
          if (targetBlockId && targetBlockId !== connectionStart) {
            onConnectionCreate(connectionStart, targetBlockId)
          }
        }

        setIsDrawingConnection(false)
        setConnectionStart(null)
        setConnectionEnd(null)
      }

      // Handle selection rectangle completion
      if (selectionRect) {
        const { startX, startY, currentX, currentY } = selectionRect
        const minX = Math.min(startX, currentX)
        const maxX = Math.max(startX, currentX)
        const minY = Math.min(startY, currentY)
        const maxY = Math.max(startY, currentY)

        // Find all blocks that intersect with the selection rectangle
        const selectedIds = new Set<string>()
        blocks.forEach((block) => {
          const blockX = block.canvasX || 0
          const blockY = block.canvasY || 0
          const blockWidth = block.canvasWidth || 200
          const blockHeight = block.canvasHeight || 150

          // Check if block intersects with selection rectangle
          const intersects =
            blockX < maxX &&
            blockX + blockWidth > minX &&
            blockY < maxY &&
            blockY + blockHeight > minY

          if (intersects) {
            selectedIds.add(block._id)
          }
        })

        onBlocksSelect(selectedIds)
        setSelectionRect(null)
      }

      // Save pan position
      if (wasPanning) {
        onConfigChange({ panX, panY })
      }
    },
    [
      isDrawingConnection,
      connectionStart,
      onConnectionCreate,
      isPanning,
      draggingBlockId,
      selectionRect,
      blocks,
      onBlocksSelect,
      panX,
      panY,
      onConfigChange,
    ]
  )

  // Handle block drag start - CRITICAL: Uses document-level events like tldraw/excalidraw
  const handleBlockDragStart = useCallback(
    (blockId: string, e: ReactMouseEvent) => {
      if (readOnly) return

      // Prevent default and stop propagation to avoid conflicts
      e.preventDefault()
      e.stopPropagation()

      const block = blocks.find((b) => b._id === blockId)
      if (!block) return

      if (activeTool === 'connect') {
        // Start drawing connection
        setIsDrawingConnection(true)
        setConnectionStart(blockId)
        const { x, y } = screenToCanvas(e.clientX, e.clientY)
        setConnectionEnd({ x, y })
      } else {
        // Handle shift+click for toggle selection
        if (e.shiftKey) {
          const newSelection = new Set(selectedBlockIds)
          if (newSelection.has(blockId)) {
            newSelection.delete(blockId)
          } else {
            newSelection.add(blockId)
          }
          onBlocksSelect(newSelection)
        } else {
          // Start dragging block
          // If clicking an already selected block, keep multi-selection
          if (!selectedBlockIds.has(blockId)) {
            onBlocksSelect(new Set([blockId]))
          }
          setDraggingBlockId(blockId)
          setDragStart({ x: e.clientX, y: e.clientY })
          setDragBlockStart({ x: block.canvasX || 0, y: block.canvasY || 0 })
        }
      }
    },
    [blocks, activeTool, screenToCanvas, selectedBlockIds, onBlocksSelect, readOnly]
  )

  // Fit to view
  const fitToView = useCallback(() => {
    if (blocks.length === 0) {
      setZoom(1)
      setPanX(0)
      setPanY(0)
      return
    }

    const container = containerRef.current
    if (!container) return

    // Calculate bounding box of all blocks
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    blocks.forEach((block) => {
      const x = block.canvasX || 0
      const y = block.canvasY || 0
      const width = block.canvasWidth || 200
      const height = block.canvasHeight || 150

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)
    })

    const padding = 50
    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2

    const rect = container.getBoundingClientRect()
    const scaleX = rect.width / contentWidth
    const scaleY = rect.height / contentHeight
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 1)

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    const newPanX = rect.width / 2 - centerX * newZoom
    const newPanY = rect.height / 2 - centerY * newZoom

    setZoom(newZoom)
    setPanX(newPanX)
    setPanY(newPanY)
    onConfigChange({ zoom: newZoom, panX: newPanX, panY: newPanY })
  }, [blocks, onConfigChange])

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
    onConfigChange({ zoom: 1, panX: 0, panY: 0 })
  }, [onConfigChange])

  // CRITICAL: Document-level event listeners for drag operations
  // This pattern is used by tldraw, excalidraw, ReactFlow, dnd-kit
  // Ensures drag continues even when cursor leaves the canvas
  useEffect(() => {
    if (!draggingBlockId && !isPanning && !isDrawingConnection && !selectionRect) return

    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPanX(e.clientX - panStart.x)
        setPanY(e.clientY - panStart.y)
        return
      }

      if (draggingBlockId) {
        const dx = (e.clientX - dragStart.x) / zoom
        const dy = (e.clientY - dragStart.y) / zoom
        const newX = snapToGrid(dragBlockStart.x + dx)
        const newY = snapToGrid(dragBlockStart.y + dy)
        onBlockMove(draggingBlockId, newX, newY)
        return
      }

      if (isDrawingConnection) {
        const { x, y } = screenToCanvas(e.clientX, e.clientY)
        setConnectionEnd({ x, y })
        return
      }

      if (selectionRect) {
        const { x, y } = screenToCanvas(e.clientX, e.clientY)
        setSelectionRect((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null))
      }
    }

    const handleDocumentMouseUp = (e: MouseEvent) => {
      if (isDrawingConnection && connectionStart) {
        // Check if we're over a block to complete the connection
        const target = e.target as HTMLElement
        const blockElement = target.closest('[data-block-id]')
        if (blockElement) {
          const targetBlockId = blockElement.getAttribute('data-block-id')
          if (targetBlockId && targetBlockId !== connectionStart) {
            onConnectionCreate(connectionStart, targetBlockId)
          }
        }
      }

      // Handle selection rectangle completion
      if (selectionRect) {
        const { startX, startY, currentX, currentY } = selectionRect
        const minX = Math.min(startX, currentX)
        const maxX = Math.max(startX, currentX)
        const minY = Math.min(startY, currentY)
        const maxY = Math.max(startY, currentY)

        // Find all blocks that intersect with the selection rectangle
        const selectedIds = new Set<string>()
        blocks.forEach((block) => {
          const blockX = block.canvasX || 0
          const blockY = block.canvasY || 0
          const blockWidth = block.canvasWidth || 200
          const blockHeight = block.canvasHeight || 150

          // Check if block intersects with selection rectangle
          const intersects =
            blockX < maxX &&
            blockX + blockWidth > minX &&
            blockY < maxY &&
            blockY + blockHeight > minY

          if (intersects) {
            selectedIds.add(block._id)
          }
        })

        onBlocksSelect(selectedIds)
        setSelectionRect(null)
      }

      // Save config if we were panning
      if (isPanning) {
        onConfigChange({ panX, panY })
      }

      setIsPanning(false)
      setDraggingBlockId(null)
      setIsDrawingConnection(false)
      setConnectionStart(null)
      setConnectionEnd(null)
    }

    // Attach to document for reliable drag tracking
    document.addEventListener('mousemove', handleDocumentMouseMove)
    document.addEventListener('mouseup', handleDocumentMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  }, [
    draggingBlockId,
    isPanning,
    isDrawingConnection,
    selectionRect,
    connectionStart,
    panStart,
    dragStart,
    dragBlockStart,
    zoom,
    snapToGrid,
    onBlockMove,
    screenToCanvas,
    onConnectionCreate,
    onConfigChange,
    blocks,
    onBlocksSelect,
    panX,
    panY,
  ])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Delete selected blocks
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockIds.size > 0 && !readOnly) {
        e.preventDefault()
        onBatchDelete()
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        onBlocksSelect(new Set())
        setActiveTool('select')
        setIsDrawingConnection(false)
        setConnectionStart(null)
        setConnectionEnd(null)
        setSelectionRect(null)
      }

      // Select all blocks with Ctrl+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        const allBlockIds = new Set(blocks.map((block) => block._id))
        onBlocksSelect(allBlockIds)
      }

      // Copy selected blocks - Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedBlockIds.size > 0) {
        e.preventDefault()
        const selectedBlocks = blocks.filter((b) => selectedBlockIds.has(b._id))
        const selectedConnections = connections.filter((c) =>
          selectedBlockIds.has(c.sourceBlockId) && selectedBlockIds.has(c.targetBlockId)
        )
        setClipboard({ blocks: selectedBlocks, connections: selectedConnections })
        toast.success(t('whiteboard.copied', `Copied ${selectedBlocks.length} item(s)`))
      }

      // Paste from clipboard - Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard && !readOnly) {
        e.preventDefault()
        // TODO: Implement paste functionality - requires creating new blocks with offset positions
        toast.info(t('whiteboard.pasteNotImplemented', 'Paste functionality coming soon'))
      }

      // Duplicate selected blocks - Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedBlockIds.size > 0 && !readOnly) {
        e.preventDefault()
        if (onDuplicate) {
          onDuplicate(Array.from(selectedBlockIds))
        } else {
          toast.info(t('whiteboard.duplicateNotImplemented', 'Duplicate functionality coming soon'))
        }
      }

      // Group selected blocks - Ctrl+G
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'g' && selectedBlockIds.size > 0 && !readOnly) {
        e.preventDefault()
        toast.info(t('whiteboard.groupNotImplemented', 'Group functionality coming soon'))
      }

      // Ungroup - Ctrl+Shift+G
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G' && selectedBlockIds.size > 0 && !readOnly) {
        e.preventDefault()
        toast.info(t('whiteboard.ungroupNotImplemented', 'Ungroup functionality coming soon'))
      }

      // Z-index shortcuts
      if (selectedBlockIds.size === 1 && onZIndexChange && !readOnly) {
        const blockId = Array.from(selectedBlockIds)[0]

        // [ - Send backward
        if (e.key === '[' && !e.shiftKey) {
          e.preventDefault()
          onZIndexChange(blockId, 'backward')
        }

        // ] - Bring forward
        if (e.key === ']' && !e.shiftKey) {
          e.preventDefault()
          onZIndexChange(blockId, 'forward')
        }

        // Shift+[ - Send to back
        if (e.key === '{' || (e.shiftKey && e.key === '[')) {
          e.preventDefault()
          onZIndexChange(blockId, 'back')
        }

        // Shift+] - Bring to front
        if (e.key === '}' || (e.shiftKey && e.key === ']')) {
          e.preventDefault()
          onZIndexChange(blockId, 'front')
        }
      }

      // Tool shortcuts
      if (e.key === 'v' || e.key === '1') setActiveTool('select')
      if (e.key === 'h' || e.key === '2') setActiveTool('pan')
      if (!e.ctrlKey && !e.metaKey && e.key === 'c' && e.key === '3') setActiveTool('connect')

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        handleZoom(0.1)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        handleZoom(-0.1)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        resetView()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedBlockIds, blocks, connections, clipboard, readOnly, onBatchDelete, onBlocksSelect, onZIndexChange, onDuplicate, handleZoom, resetView, t])

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
      {/* Toolbar */}
      <div className="absolute top-4 start-4 z-10 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1 border border-slate-200 dark:border-slate-700">
        <TooltipProvider>
          {/* Tool buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'select' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setActiveTool('select')}
              >
                <MousePointer size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('whiteboard.tools.select', 'Select (V)')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'pan' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setActiveTool('pan')}
              >
                <Hand size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('whiteboard.tools.pan', 'Pan (H)')}</TooltipContent>
          </Tooltip>

          {!readOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === 'connect' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setActiveTool('connect')}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="5" cy="12" r="3" />
                    <circle cx="19" cy="12" r="3" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <polyline points="14 8 16 12 14 16" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('whiteboard.tools.connect', 'Connect (C)')}</TooltipContent>
            </Tooltip>
          )}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          {!readOnly && (
            <>
              <ShapeSelector
                selectedShape={selectedShapeType}
                onShapeSelect={setSelectedShapeType}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      const container = containerRef.current
                      if (container) {
                        const rect = container.getBoundingClientRect()
                        // FIX: Convert container center to screen coordinates first
                        // screenToCanvas expects clientX/clientY (screen coords), not dimensions
                        const screenX = rect.left + rect.width / 2
                        const screenY = rect.top + rect.height / 2
                        const { x, y } = screenToCanvas(screenX, screenY)
                        onBlockCreate(snapToGrid(x), snapToGrid(y), selectedShapeType)
                      }
                    }}
                  >

          {!readOnly && onCreateFrame && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8',
                    selectedBlockIds.size > 0 && 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  )}
                  onClick={() => {
                    if (selectedBlockIds.size > 0) {
                      onCreateFrame(Array.from(selectedBlockIds))
                    } else {
                      toast.info(t('whiteboard.selectBlocksFirst', 'Select blocks first to create a frame'))
                    }
                  }}
                  disabled={selectedBlockIds.size === 0}
                >
                  <Square size={16} className="stroke-2 stroke-dashed" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectedBlockIds.size > 0
                  ? t('whiteboard.createFrame', 'Create Frame ({count} blocks)', {
                      count: selectedBlockIds.size,
                    })
                  : t('whiteboard.createFrameTooltip', 'Create Frame (select blocks first)')}
              </TooltipContent>
            </Tooltip>
          )}
                    <Plus size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('whiteboard.addBlock', 'Add Block')}</TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setShowGrid(!showGrid)
                  onConfigChange({ gridEnabled: !showGrid })
                }}
              >
                <Grid3X3 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('whiteboard.toggleGrid', 'Toggle Grid')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 end-4 z-10 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1 border border-slate-200 dark:border-slate-700">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleZoom(-0.1)}
              >
                <ZoomOut size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('whiteboard.zoomOut', 'Zoom Out')}</TooltipContent>
          </Tooltip>

          <span className="text-xs font-medium min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleZoom(0.1)}
              >
                <ZoomIn size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('whiteboard.zoomIn', 'Zoom In')}</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fitToView}>
                <Maximize2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('whiteboard.fitToView', 'Fit to View')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-hidden',
          activeTool === 'pan' && 'cursor-grab',
          isPanning && 'cursor-grabbing'
        )}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        {/* Canvas with transform */}
        <div
          ref={canvasRef}
          className="canvas-background relative"
          style={{
            width: config?.canvasWidth || 5000,
            height: config?.canvasHeight || 5000,
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
            backgroundImage: showGrid
              ? `
                linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
              `
              : 'none',
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        >
          {/* Connection lines */}
          <BlockConnections
            connections={connections}
            blocks={blocks}
            isDrawing={isDrawingConnection}
            drawingStart={connectionStart}
            drawingEnd={connectionEnd}
            onConnectionDelete={onConnectionDelete}
            onConnectionUpdate={onConnectionUpdate}
            readOnly={readOnly}
          />

          {/* Frames - rendered behind blocks */}
          {blocks
            .filter((block) => block.isFrame)
            .map((frame) => (
              <FrameRenderer
                key={frame._id}
                frame={frame}
                isSelected={selectedBlockIds.has(frame._id)}
                isDragging={draggingBlockId === frame._id}
                onSelect={() => {}}
                onDragStart={(e) => {
                  // For frames, use frame-specific move handler if available
                  if (onFrameMove) {
                    handleBlockDragStart(frame._id, e)
                  }
                }}
                onResize={(width, height) => onBlockResize(frame._id, width, height)}
                readOnly={readOnly}
              />
            ))}

          {/* Blocks */}
          {blocks
            .filter((block) => !block.isFrame)
            .map((block) =>
            block.shapeType ? (
              <ShapeRenderer
                key={block._id}
                block={block}
                isSelected={selectedBlockIds.has(block._id)}
                isDragging={draggingBlockId === block._id}
                onSelect={() => {}}
                onDragStart={(e) => handleBlockDragStart(block._id, e)}
                onResize={(width, height) => onBlockResize(block._id, width, height)}
                readOnly={readOnly}
              />
            ) : (
              <WhiteboardBlock
                key={block._id}
                block={block}
                isSelected={selectedBlockIds.has(block._id)}
                isDragging={draggingBlockId === block._id}
                onSelect={() => {}}
                onDragStart={(e) => handleBlockDragStart(block._id, e)}
                onResize={(width, height) => onBlockResize(block._id, width, height)}
                onZIndexChange={onZIndexChange ? (action) => onZIndexChange(block._id, action) : undefined}
                readOnly={readOnly}
              />
            )
          )}

          {/* Selection rectangle */}
          {selectionRect && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
              style={{
                left: Math.min(selectionRect.startX, selectionRect.currentX),
                top: Math.min(selectionRect.startY, selectionRect.currentY),
                width: Math.abs(selectionRect.currentX - selectionRect.startX),
                height: Math.abs(selectionRect.currentY - selectionRect.startY),
              }}
            />
          )}
        </div>
      </div>

      {/* Empty state */}
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Plus className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('whiteboard.emptyTitle', 'Start Brainstorming')}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {t(
                'whiteboard.emptyDescription',
                'Double-click anywhere on the canvas to add a new block, or use the + button in the toolbar.'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhiteboardCanvas
