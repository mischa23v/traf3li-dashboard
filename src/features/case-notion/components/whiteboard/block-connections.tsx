/**
 * BlockConnections - SVG layer for rendering connection lines between blocks
 * Features:
 * - Bezier curves for smooth connections
 * - Arrow heads
 * - Connection labels
 * - Hover/selection states
 * - Drawing preview
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Block, BlockConnection } from '../../data/schema'

interface BlockConnectionsProps {
  connections: BlockConnection[]
  blocks: Block[]
  isDrawing: boolean
  drawingStart: string | null
  drawingEnd: { x: number; y: number } | null
  onConnectionDelete: (connectionId: string) => void
  selectedConnectionId?: string
  onConnectionSelect?: (connection: BlockConnection | null) => void
  readOnly?: boolean
}

interface ConnectionPath {
  connection: BlockConnection
  path: string
  midX: number
  midY: number
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}

// Calculate the edge point of a block closest to a target point
function getBlockEdgePoint(
  block: Block,
  targetX: number,
  targetY: number
): { x: number; y: number; side: 'top' | 'right' | 'bottom' | 'left' } {
  const x = block.canvasX || 0
  const y = block.canvasY || 0
  const width = block.canvasWidth || 200
  const height = block.canvasHeight || 150

  const centerX = x + width / 2
  const centerY = y + height / 2

  // Calculate angle from center to target
  const angle = Math.atan2(targetY - centerY, targetX - centerX)
  const degrees = (angle * 180) / Math.PI

  // Determine which side of the block to connect from
  if (degrees >= -45 && degrees < 45) {
    // Right side
    return { x: x + width, y: centerY, side: 'right' }
  } else if (degrees >= 45 && degrees < 135) {
    // Bottom side
    return { x: centerX, y: y + height, side: 'bottom' }
  } else if (degrees >= -135 && degrees < -45) {
    // Top side
    return { x: centerX, y: y, side: 'top' }
  } else {
    // Left side
    return { x: x, y: centerY, side: 'left' }
  }
}

// Generate a bezier curve path between two points
function generateBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  side1: 'top' | 'right' | 'bottom' | 'left',
  side2: 'top' | 'right' | 'bottom' | 'left'
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  const curvature = Math.min(distance * 0.4, 100)

  let cp1x = x1,
    cp1y = y1,
    cp2x = x2,
    cp2y = y2

  // Adjust control points based on exit/entry sides
  switch (side1) {
    case 'top':
      cp1y -= curvature
      break
    case 'bottom':
      cp1y += curvature
      break
    case 'left':
      cp1x -= curvature
      break
    case 'right':
      cp1x += curvature
      break
  }

  switch (side2) {
    case 'top':
      cp2y -= curvature
      break
    case 'bottom':
      cp2y += curvature
      break
    case 'left':
      cp2x -= curvature
      break
    case 'right':
      cp2x += curvature
      break
  }

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`
}

export function BlockConnections({
  connections,
  blocks,
  isDrawing,
  drawingStart,
  drawingEnd,
  onConnectionDelete,
  selectedConnectionId,
  onConnectionSelect,
  readOnly,
}: BlockConnectionsProps) {
  const { t } = useTranslation()
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null)

  // Create a map of blocks by ID for quick lookup
  const blocksMap = useMemo(() => {
    const map = new Map<string, Block>()
    blocks.forEach((block) => map.set(block._id, block))
    return map
  }, [blocks])

  // Calculate connection paths
  const connectionPaths = useMemo<ConnectionPath[]>(() => {
    return connections
      .map((connection) => {
        const sourceBlock = blocksMap.get(connection.sourceBlockId)
        const targetBlock = blocksMap.get(connection.targetBlockId)

        if (!sourceBlock || !targetBlock) return null

        // Get target center for angle calculation
        const targetCenterX = (targetBlock.canvasX || 0) + (targetBlock.canvasWidth || 200) / 2
        const targetCenterY = (targetBlock.canvasY || 0) + (targetBlock.canvasHeight || 150) / 2

        const sourceCenterX = (sourceBlock.canvasX || 0) + (sourceBlock.canvasWidth || 200) / 2
        const sourceCenterY = (sourceBlock.canvasY || 0) + (sourceBlock.canvasHeight || 150) / 2

        // Get edge points
        const sourcePoint = getBlockEdgePoint(sourceBlock, targetCenterX, targetCenterY)
        const targetPoint = getBlockEdgePoint(targetBlock, sourceCenterX, sourceCenterY)

        // Generate bezier path
        const path = generateBezierPath(
          sourcePoint.x,
          sourcePoint.y,
          targetPoint.x,
          targetPoint.y,
          sourcePoint.side,
          targetPoint.side
        )

        // Calculate midpoint for label
        const midX = (sourcePoint.x + targetPoint.x) / 2
        const midY = (sourcePoint.y + targetPoint.y) / 2

        return {
          connection,
          path,
          midX,
          midY,
          sourceX: sourcePoint.x,
          sourceY: sourcePoint.y,
          targetX: targetPoint.x,
          targetY: targetPoint.y,
        }
      })
      .filter(Boolean) as ConnectionPath[]
  }, [connections, blocksMap])

  // Calculate drawing preview path
  const drawingPath = useMemo(() => {
    if (!isDrawing || !drawingStart || !drawingEnd) return null

    const sourceBlock = blocksMap.get(drawingStart)
    if (!sourceBlock) return null

    const sourcePoint = getBlockEdgePoint(sourceBlock, drawingEnd.x, drawingEnd.y)

    // Simple line for preview
    return `M ${sourcePoint.x} ${sourcePoint.y} L ${drawingEnd.x} ${drawingEnd.y}`
  }, [isDrawing, drawingStart, drawingEnd, blocksMap])

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* Arrow marker */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-slate-400" />
        </marker>

        <marker
          id="arrowhead-hover"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-emerald-500" />
        </marker>

        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-emerald-600" />
        </marker>

        {/* Bidirectional arrow */}
        <marker
          id="arrowhead-start"
          markerWidth="10"
          markerHeight="7"
          refX="1"
          refY="3.5"
          orient="auto-start-reverse"
        >
          <polygon points="10 0, 0 3.5, 10 7" fill="currentColor" className="text-slate-400" />
        </marker>
      </defs>

      {/* Connection lines */}
      {connectionPaths.map(({ connection, path, midX, midY, targetX, targetY }) => {
        const isHovered = hoveredConnectionId === connection._id
        const isSelected = selectedConnectionId === connection._id

        const strokeColor = isSelected
          ? 'stroke-emerald-600'
          : isHovered
          ? 'stroke-emerald-500'
          : 'stroke-slate-400'

        const strokeDash =
          connection.connectionType === 'dashed' ? '8,4' : connection.connectionType === 'line' ? '' : ''

        const markerEnd =
          connection.connectionType === 'line'
            ? ''
            : isSelected
            ? 'url(#arrowhead-selected)'
            : isHovered
            ? 'url(#arrowhead-hover)'
            : 'url(#arrowhead)'

        const markerStart =
          connection.connectionType === 'bidirectional' ? 'url(#arrowhead-start)' : ''

        return (
          <g key={connection._id}>
            {/* Invisible wider path for easier hover/click */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth="20"
              className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredConnectionId(connection._id)}
              onMouseLeave={() => setHoveredConnectionId(null)}
              onClick={() => onConnectionSelect?.(connection)}
            />

            {/* Visible path */}
            <path
              d={path}
              fill="none"
              className={cn(strokeColor, 'transition-colors')}
              strokeWidth={isSelected || isHovered ? 3 : 2}
              strokeDasharray={strokeDash}
              markerEnd={markerEnd}
              markerStart={markerStart}
            />

            {/* Connection label */}
            {connection.label && (
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-30"
                  y="-10"
                  width="60"
                  height="20"
                  rx="4"
                  fill="white"
                  stroke="currentColor"
                  className="text-slate-200"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-slate-600 pointer-events-none"
                >
                  {connection.label}
                </text>
              </g>
            )}

            {/* Delete button on hover */}
            {(isHovered || isSelected) && !readOnly && (
              <g
                transform={`translate(${midX}, ${midY})`}
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onConnectionDelete(connection._id)
                }}
              >
                <circle r="12" fill="white" stroke="currentColor" className="text-red-200" />
                <X
                  size={12}
                  className="text-red-500"
                  style={{ transform: 'translate(-6px, -6px)' }}
                />
              </g>
            )}
          </g>
        )
      })}

      {/* Drawing preview */}
      {drawingPath && (
        <path
          d={drawingPath}
          fill="none"
          stroke="currentColor"
          className="text-emerald-500"
          strokeWidth="2"
          strokeDasharray="8,4"
          markerEnd="url(#arrowhead-hover)"
        />
      )}
    </svg>
  )
}

export default BlockConnections
