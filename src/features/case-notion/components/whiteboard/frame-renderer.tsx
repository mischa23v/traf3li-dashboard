/**
 * FrameRenderer - Renders a frame container for grouping blocks on the whiteboard
 * Features:
 * - Dashed border with semi-transparent background
 * - Frame name label
 * - Draggable (moves all children)
 * - Resizable
 * - Color customization
 */

import { useState, useCallback, MouseEvent as ReactMouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical, MoreHorizontal, Trash2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Block } from '../../data/schema'

interface FrameRendererProps {
  frame: Block
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onDragStart: (e: ReactMouseEvent) => void
  onResize: (width: number, height: number) => void
  onColorChange?: (color: string) => void
  onDelete?: () => void
  readOnly?: boolean
}

const MIN_WIDTH = 300
const MIN_HEIGHT = 200
const DEFAULT_WIDTH = 600
const DEFAULT_HEIGHT = 400

// Frame background colors
const FRAME_COLORS = {
  blue: { bg: 'rgba(59, 130, 246, 0.05)', border: '#3b82f6', label: 'Blue' },
  green: { bg: 'rgba(34, 197, 94, 0.05)', border: '#22c55e', label: 'Green' },
  purple: { bg: 'rgba(168, 85, 247, 0.05)', border: '#a855f7', label: 'Purple' },
  orange: { bg: 'rgba(249, 115, 22, 0.05)', border: '#f97316', label: 'Orange' },
  red: { bg: 'rgba(239, 68, 68, 0.05)', border: '#ef4444', label: 'Red' },
  yellow: { bg: 'rgba(234, 179, 8, 0.05)', border: '#eab308', label: 'Yellow' },
  pink: { bg: 'rgba(236, 72, 153, 0.05)', border: '#ec4899', label: 'Pink' },
  gray: { bg: 'rgba(148, 163, 184, 0.05)', border: '#94a3b8', label: 'Gray' },
  default: { bg: 'rgba(148, 163, 184, 0.03)', border: '#9ca3af', label: 'Default' },
}

export function FrameRenderer({
  frame,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onResize,
  onColorChange,
  onDelete,
  readOnly,
}: FrameRendererProps) {
  const { t } = useTranslation()

  const [isResizing, setIsResizing] = useState(false)

  const width = frame.canvasWidth || DEFAULT_WIDTH
  const height = frame.canvasHeight || DEFAULT_HEIGHT
  const x = frame.canvasX || 0
  const y = frame.canvasY || 0

  // Get frame color configuration
  const colorKey = (frame.frameBackgroundColor || 'default') as keyof typeof FRAME_COLORS
  const colorConfig = FRAME_COLORS[colorKey] || FRAME_COLORS.default

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: ReactMouseEvent, corner: string) => {
      e.stopPropagation()
      e.preventDefault()

      setIsResizing(true)

      const startX = e.clientX
      const startY = e.clientY
      const startWidth = width
      const startHeight = height

      const handleResizeMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        let newWidth = startWidth
        let newHeight = startHeight

        if (corner.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, startWidth + dx)
        }
        if (corner.includes('w')) {
          newWidth = Math.max(MIN_WIDTH, startWidth - dx)
        }
        if (corner.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, startHeight + dy)
        }
        if (corner.includes('n')) {
          newHeight = Math.max(MIN_HEIGHT, startHeight - dy)
        }

        onResize(newWidth, newHeight)
      }

      const handleResizeEnd = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }

      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    },
    [width, height, onResize]
  )

  return (
    <div
      data-block-id={frame._id}
      data-frame="true"
      className={cn(
        'absolute rounded-lg border-2 border-dashed transition-all select-none',
        isSelected && 'ring-2 ring-emerald-500 ring-offset-2',
        isDragging && 'opacity-75',
        isResizing && 'pointer-events-none'
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        backgroundColor: colorConfig.bg,
        borderColor: isSelected ? '#10b981' : colorConfig.border,
        zIndex: 0, // Frames should be behind blocks
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Frame label and controls */}
      <div
        className={cn(
          'absolute -top-8 left-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white rounded-t border border-b-0 shadow-sm cursor-grab active:cursor-grabbing group',
          isSelected && 'ring-1 ring-emerald-500'
        )}
        style={{ borderColor: colorConfig.border }}
        onMouseDown={(e) => {
          e.stopPropagation()
          onDragStart(e)
        }}
      >
        <GripVertical size={14} className="text-slate-400" />
        <span className="text-slate-700">{frame.frameName || t('whiteboard.frame', 'Frame')}</span>

        {/* Frame actions */}
        {!readOnly && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Color submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette size={14} className="me-2" />
                    {t('whiteboard.frameColor', 'Frame Color')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {Object.entries(FRAME_COLORS).map(([key, config]) => (
                      <DropdownMenuItem key={key} onClick={() => onColorChange?.(key)}>
                        <div
                          className="w-4 h-4 rounded me-2 border"
                          style={{
                            backgroundColor: config.bg,
                            borderColor: config.border,
                          }}
                        />
                        {config.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onDelete?.()}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 size={14} className="me-2" />
                  {t('common.delete', 'Delete Frame')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Child count indicator */}
      {frame.frameChildren && frame.frameChildren.length > 0 && (
        <div
          className="absolute -top-8 right-0 px-2 py-1 text-xs bg-white rounded-t border border-b-0 shadow-sm"
          style={{ borderColor: colorConfig.border }}
        >
          {frame.frameChildren.length} {t('whiteboard.blocks', 'blocks')}
        </div>
      )}

      {/* Resize handles - only show when selected and not read-only */}
      {isSelected && !readOnly && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-1 -start-1 w-3 h-3 bg-emerald-500 rounded-sm cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute -top-1 -end-1 w-3 h-3 bg-emerald-500 rounded-sm cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute -bottom-1 -start-1 w-3 h-3 bg-emerald-500 rounded-sm cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute -bottom-1 -end-1 w-3 h-3 bg-emerald-500 rounded-sm cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* Edge handles */}
          <div
            className="absolute top-1/2 -start-1 w-2 h-8 -translate-y-1/2 bg-emerald-500/50 rounded-sm cursor-w-resize opacity-0 hover:opacity-100"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute top-1/2 -end-1 w-2 h-8 -translate-y-1/2 bg-emerald-500/50 rounded-sm cursor-e-resize opacity-0 hover:opacity-100"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div
            className="absolute -top-1 start-1/2 w-8 h-2 -translate-x-1/2 bg-emerald-500/50 rounded-sm cursor-n-resize opacity-0 hover:opacity-100"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute -bottom-1 start-1/2 w-8 h-2 -translate-x-1/2 bg-emerald-500/50 rounded-sm cursor-s-resize opacity-0 hover:opacity-100"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
        </>
      )}
    </div>
  )
}

export default FrameRenderer
