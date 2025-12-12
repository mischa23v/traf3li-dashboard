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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { WhiteboardBlock } from './whiteboard-block'
import { BlockConnections } from './block-connections'
import type { Block, BlockConnection, WhiteboardConfig } from '../../data/schema'

interface WhiteboardCanvasProps {
  caseId: string
  pageId: string
  blocks: Block[]
  connections: BlockConnection[]
  config?: WhiteboardConfig
  onBlockSelect: (block: Block | null) => void
  onBlockMove: (blockId: string, x: number, y: number) => void
  onBlockResize: (blockId: string, width: number, height: number) => void
  onBlockCreate: (x: number, y: number) => void
  onBlockDelete: (blockId: string) => void
  onConnectionCreate: (sourceId: string, targetId: string) => void
  onConnectionDelete: (connectionId: string) => void
  onConfigChange: (config: Partial<WhiteboardConfig>) => void
  selectedBlockId?: string
  readOnly?: boolean
}

type CanvasTool = 'select' | 'pan' | 'connect'

export function WhiteboardCanvas({
  caseId,
  pageId,
  blocks,
  connections,
  config,
  onBlockSelect,
  onBlockMove,
  onBlockResize,
  onBlockCreate,
  onBlockDelete,
  onConnectionCreate,
  onConnectionDelete,
  onConfigChange,
  selectedBlockId,
  readOnly,
}: WhiteboardCanvasProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Canvas state
  const [zoom, setZoom] = useState(config?.zoom || 1)
  const [panX, setPanX] = useState(config?.panX || 0)
  const [panY, setPanY] = useState(config?.panY || 0)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(config?.gridEnabled ?? true)
  const [activeTool, setActiveTool] = useState<CanvasTool>('select')

  // Connection drawing state
  const [isDrawingConnection, setIsDrawingConnection] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const [connectionEnd, setConnectionEnd] = useState<{ x: number; y: number } | null>(null)

  // Dragging state
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragBlockStart, setDragBlockStart] = useState({ x: 0, y: 0 })

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
      if (centerX !== undefined && centerY !== undefined) {
        const container = containerRef.current
        if (container) {
          const rect = container.getBoundingClientRect()
          const mouseX = centerX - rect.left
          const mouseY = centerY - rect.top

          // Calculate new pan to keep mouse position fixed
          const scale = newZoom / zoom
          const newPanX = mouseX - (mouseX - panX) * scale
          const newPanY = mouseY - (mouseY - panY) * scale

          setPanX(newPanX)
          setPanY(newPanY)
        }
      }

      setZoom(newZoom)
      onConfigChange({ zoom: newZoom, panX, panY })
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

      // Click on empty canvas - deselect and optionally create new block
      if (isCanvas) {
        onBlockSelect(null)

        // Double-click to create new block
        if (e.detail === 2 && !readOnly) {
          const { x, y } = screenToCanvas(e.clientX, e.clientY)
          onBlockCreate(snapToGrid(x), snapToGrid(y))
        }
      }
    },
    [activeTool, panX, panY, screenToCanvas, snapToGrid, onBlockSelect, onBlockCreate, readOnly]
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
        // Start dragging block
        setDraggingBlockId(blockId)
        setDragStart({ x: e.clientX, y: e.clientY })
        setDragBlockStart({ x: block.canvasX || 0, y: block.canvasY || 0 })
        onBlockSelect(block)
      }
    },
    [blocks, activeTool, screenToCanvas, onBlockSelect, readOnly]
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
    if (!draggingBlockId && !isPanning && !isDrawingConnection) return

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
    panX,
    panY,
  ])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected block
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId && !readOnly) {
        onBlockDelete(selectedBlockId)
        onBlockSelect(null)
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        onBlockSelect(null)
        setActiveTool('select')
        setIsDrawingConnection(false)
        setConnectionStart(null)
        setConnectionEnd(null)
      }

      // Tool shortcuts
      if (e.key === 'v' || e.key === '1') setActiveTool('select')
      if (e.key === 'h' || e.key === '2') setActiveTool('pan')
      if (e.key === 'c' || e.key === '3') setActiveTool('connect')

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
  }, [selectedBlockId, readOnly, onBlockDelete, onBlockSelect, handleZoom, resetView])

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
                      const { x, y } = screenToCanvas(rect.width / 2, rect.height / 2)
                      onBlockCreate(snapToGrid(x), snapToGrid(y))
                    }
                  }}
                >
                  <Plus size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('whiteboard.addBlock', 'Add Block')}</TooltipContent>
            </Tooltip>
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
            readOnly={readOnly}
          />

          {/* Blocks */}
          {blocks.map((block) => (
            <WhiteboardBlock
              key={block._id}
              block={block}
              isSelected={selectedBlockId === block._id}
              isDragging={draggingBlockId === block._id}
              onSelect={() => onBlockSelect(block)}
              onDragStart={(e) => handleBlockDragStart(block._id, e)}
              onResize={(width, height) => onBlockResize(block._id, width, height)}
              readOnly={readOnly}
            />
          ))}
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
