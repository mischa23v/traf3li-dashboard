/**
 * ShapeRenderer - Renders different shape types for whiteboard blocks
 * Supports: rectangle, ellipse, diamond, triangle, hexagon, star, sticky, text_shape, arrow, frame
 */

import { MouseEvent as ReactMouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { CANVAS } from '@/config'
import type { Block } from '../../data/schema'

interface ShapeRendererProps {
  block: Block
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onDragStart: (e: ReactMouseEvent) => void
  onResize: (width: number, height: number) => void
  onDoubleClick?: () => void
  readOnly?: boolean
}

const MIN_WIDTH = CANVAS.SHAPE.MIN_WIDTH
const MIN_HEIGHT = CANVAS.SHAPE.MIN_HEIGHT
const DEFAULT_WIDTH = CANVAS.SHAPE.DEFAULT_WIDTH
const DEFAULT_HEIGHT = CANVAS.SHAPE.DEFAULT_HEIGHT

// Helper to get color hex from block color
function getBlockColorHex(color?: string): string {
  const colors: Record<string, string> = {
    default: '#ffffff',
    red: '#fee2e2',
    orange: '#ffedd5',
    yellow: '#fef3c7',
    green: '#dcfce7',
    blue: '#dbeafe',
    purple: '#f3e8ff',
    pink: '#fce7f3',
    gray: '#f3f4f6',
  }
  return colors[color || 'default'] || colors.default
}

// Helper to get stroke color (defaults to darker version of fill)
function getStrokeColor(strokeColor?: string, fillColor?: string): string {
  if (strokeColor) return strokeColor

  // Default stroke colors based on fill
  const strokes: Record<string, string> = {
    default: '#94a3b8',
    red: '#f87171',
    orange: '#fb923c',
    yellow: '#fbbf24',
    green: '#34d399',
    blue: '#60a5fa',
    purple: '#c084fc',
    pink: '#f472b6',
    gray: '#94a3b8',
  }
  return strokes[fillColor || 'default'] || strokes.default
}

export function ShapeRenderer({
  block,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onResize,
  onDoubleClick,
  readOnly,
}: ShapeRendererProps) {
  const width = block.canvasWidth || DEFAULT_WIDTH
  const height = block.canvasHeight || DEFAULT_HEIGHT
  const x = block.canvasX || 0
  const y = block.canvasY || 0
  const shapeType = block.shapeType || 'rectangle'
  const angle = block.angle || 0
  const opacity = block.opacity !== undefined ? block.opacity / 100 : 1

  const fillColor = getBlockColorHex(block.blockColor)
  const strokeColor = getStrokeColor(block.strokeColor, block.blockColor)
  const strokeWidth = block.strokeWidth || 2

  // Get content text
  const contentText = block.content
    .map((item) => item.text?.content || item.plainText || '')
    .join('')
    .trim()

  // Handle resize
  const handleResizeStart = (e: ReactMouseEvent, corner: string) => {
    e.stopPropagation()
    e.preventDefault()

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
      if (corner.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, startHeight + dy)
      }

      onResize(newWidth, newHeight)
    }

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  // Render different shapes
  const renderShape = () => {
    switch (shapeType) {
      case 'rectangle':
        return (
          <div
            className="w-full h-full rounded-lg"
            style={{
              backgroundColor: fillColor,
              border: `${strokeWidth}px solid ${strokeColor}`,
            }}
          />
        )

      case 'ellipse':
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: fillColor,
              border: `${strokeWidth}px solid ${strokeColor}`,
            }}
          />
        )

      case 'sticky':
        return (
          <div className="w-full h-full relative">
            {/* Main sticky note */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                backgroundColor: fillColor,
                border: `${strokeWidth}px solid ${strokeColor}`,
              }}
            />
            {/* Folded corner effect */}
            <div
              className="absolute top-0 end-0 w-8 h-8"
              style={{
                background: `linear-gradient(135deg, transparent 0%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 100%)`,
                borderRadius: '0 0 0 4px',
              }}
            />
          </div>
        )

      case 'text_shape':
        return (
          <div
            className="w-full h-full rounded-lg bg-transparent"
            style={{
              border: isSelected ? `${strokeWidth}px dashed ${strokeColor}` : 'none',
            }}
          />
        )

      case 'diamond':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,0 100,50 50,100 0,50"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (100 / width)}
            />
          </svg>
        )

      case 'triangle':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,0 100,100 0,100"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (100 / width)}
            />
          </svg>
        )

      case 'hexagon':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="25,0 75,0 100,50 75,100 25,100 0,50"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (100 / width)}
            />
          </svg>
        )

      case 'star':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (100 / width)}
            />
          </svg>
        )

      case 'arrow':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="0,35 60,35 60,0 100,50 60,100 60,65 0,65"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (100 / width)}
            />
          </svg>
        )

      case 'frame':
        return (
          <div
            className="w-full h-full rounded-lg"
            style={{
              backgroundColor: 'transparent',
              border: `${strokeWidth}px solid ${strokeColor}`,
            }}
          />
        )

      default:
        return (
          <div
            className="w-full h-full rounded-lg"
            style={{
              backgroundColor: fillColor,
              border: `${strokeWidth}px solid ${strokeColor}`,
            }}
          />
        )
    }
  }

  return (
    <div
      data-block-id={block._id}
      className={cn(
        'absolute cursor-pointer select-none group',
        isSelected && 'ring-2 ring-emerald-500 ring-offset-2',
        isDragging && 'opacity-75 z-50'
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        transform: `rotate(${angle}rad)`,
        opacity,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick?.()
      }}
    >
      {/* Drag handle - only visible on hover */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => {
          e.stopPropagation()
          onDragStart(e)
        }}
        style={{ zIndex: 10 }}
      />

      {/* Shape */}
      <div className="w-full h-full relative">
        {renderShape()}
      </div>

      {/* Content text */}
      {contentText && shapeType !== 'text_shape' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <p className="text-sm text-center line-clamp-6 break-words">{contentText}</p>
        </div>
      )}

      {/* Text shape - text fills the entire area */}
      {shapeType === 'text_shape' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <p className="text-lg text-center break-words">{contentText || 'Double-click to add text...'}</p>
        </div>
      )}

      {/* Resize handles - only show when selected and not read-only */}
      {isSelected && !readOnly && (
        <>
          {/* SE corner resize */}
          <div
            className="absolute -bottom-1 -end-1 w-3 h-3 bg-emerald-500 rounded-sm cursor-se-resize z-20"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          {/* E edge resize */}
          <div
            className="absolute top-1/2 -end-1 w-2 h-8 -translate-y-1/2 bg-emerald-500/50 rounded-sm cursor-e-resize opacity-0 hover:opacity-100 z-20"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          {/* S edge resize */}
          <div
            className="absolute -bottom-1 start-1/2 w-8 h-2 -translate-x-1/2 bg-emerald-500/50 rounded-sm cursor-s-resize opacity-0 hover:opacity-100 z-20"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
        </>
      )}

      {/* Connection anchor points */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -start-2 w-4 h-4 -translate-y-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
        <div className="absolute top-1/2 -end-2 w-4 h-4 -translate-y-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
        <div className="absolute -top-2 start-1/2 w-4 h-4 -translate-x-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
        <div className="absolute -bottom-2 start-1/2 w-4 h-4 -translate-x-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
      </div>
    </div>
  )
}

export default ShapeRenderer
