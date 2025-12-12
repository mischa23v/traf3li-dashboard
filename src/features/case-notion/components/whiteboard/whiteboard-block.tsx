/**
 * WhiteboardBlock - Sticky note style block for whiteboard view
 * Features:
 * - Drag handle
 * - Resize handles
 * - Color coding
 * - Priority indicator
 * - Quick actions
 * - Links to case entities
 */

import { useState, useRef, useCallback, MouseEvent as ReactMouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GripVertical,
  MoreHorizontal,
  Link2,
  Calendar,
  CheckSquare,
  Scale,
  FileText,
  User,
  Clock,
  Trash2,
  Copy,
  Palette,
  Flag,
  ExternalLink,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { blockColorLabels, blockPriorityLabels, blockTypeLabels } from '../../data/schema'

interface WhiteboardBlockProps {
  block: Block
  isSelected: boolean
  isDragging: boolean
  onSelect: () => void
  onDragStart: (e: ReactMouseEvent) => void
  onResize: (width: number, height: number) => void
  onDoubleClick?: () => void
  onColorChange?: (color: Block['blockColor']) => void
  onPriorityChange?: (priority: Block['priority']) => void
  onDelete?: () => void
  onDuplicate?: () => void
  readOnly?: boolean
}

const MIN_WIDTH = 150
const MIN_HEIGHT = 100
const DEFAULT_WIDTH = 200
const DEFAULT_HEIGHT = 150

export function WhiteboardBlock({
  block,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onResize,
  onDoubleClick,
  onColorChange,
  onPriorityChange,
  onDelete,
  onDuplicate,
  readOnly,
}: WhiteboardBlockProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const blockRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const width = block.canvasWidth || DEFAULT_WIDTH
  const height = block.canvasHeight || DEFAULT_HEIGHT
  const x = block.canvasX || 0
  const y = block.canvasY || 0

  const colorConfig = blockColorLabels[block.blockColor || 'default']
  const priorityConfig = block.priority ? blockPriorityLabels[block.priority] : null

  // Get block content text
  const contentText = block.content
    .map((item) => item.text?.content || item.plainText || '')
    .join('')
    .trim()

  // Get block type label
  const typeLabel = isArabic ? blockTypeLabels[block.type]?.ar : blockTypeLabels[block.type]?.en

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: ReactMouseEvent, corner: string) => {
      e.stopPropagation()
      e.preventDefault()

      setIsResizing(true)
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width,
        height,
      })

      const handleResizeMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - e.clientX
        const dy = moveEvent.clientY - e.clientY

        let newWidth = width
        let newHeight = height

        if (corner.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, resizeStart.width + dx)
        }
        if (corner.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, resizeStart.height + dy)
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
    [width, height, resizeStart, onResize]
  )

  // Check if block has linked entities
  const hasLinkedEvent = !!block.linkedEventId
  const hasLinkedTask = !!block.linkedTaskId
  const hasLinkedHearing = !!block.linkedHearingId
  const hasLinkedDocument = !!block.linkedDocumentId
  const hasAnyLink = hasLinkedEvent || hasLinkedTask || hasLinkedHearing || hasLinkedDocument

  return (
    <div
      ref={blockRef}
      data-block-id={block._id}
      className={cn(
        'absolute rounded-lg border-2 shadow-md transition-shadow cursor-pointer select-none',
        colorConfig.bg,
        colorConfig.border,
        colorConfig.text,
        isSelected && 'ring-2 ring-emerald-500 ring-offset-2 shadow-lg',
        isDragging && 'opacity-75 shadow-xl',
        isResizing && 'pointer-events-none'
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
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
      {/* Header with drag handle */}
      <div
        className={cn(
          'flex items-center justify-between px-2 py-1.5 border-b cursor-grab active:cursor-grabbing',
          colorConfig.border.replace('border-', 'border-b-')
        )}
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1 min-w-0">
          <GripVertical size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs font-medium truncate opacity-70">{typeLabel}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Priority badge */}
          {priorityConfig && (
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1 py-0 h-4', priorityConfig.bg, priorityConfig.color)}
            >
              {isArabic ? priorityConfig.ar : priorityConfig.en}
            </Badge>
          )}

          {/* Link indicator */}
          {hasAnyLink && (
            <div className="flex items-center">
              {hasLinkedEvent && (
                <Calendar size={12} className="text-blue-500" title={t('whiteboard.linkedEvent')} />
              )}
              {hasLinkedTask && (
                <CheckSquare
                  size={12}
                  className="text-emerald-500"
                  title={t('whiteboard.linkedTask')}
                />
              )}
              {hasLinkedHearing && (
                <Scale size={12} className="text-purple-500" title={t('whiteboard.linkedHearing')} />
              )}
              {hasLinkedDocument && (
                <FileText
                  size={12}
                  className="text-orange-500"
                  title={t('whiteboard.linkedDocument')}
                />
              )}
            </div>
          )}

          {/* Actions menu */}
          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:bg-black/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Color submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette size={14} className="me-2" />
                    {t('whiteboard.color', 'Color')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {Object.entries(blockColorLabels).map(([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => onColorChange?.(key as Block['blockColor'])}
                      >
                        <div
                          className={cn('w-4 h-4 rounded me-2 border', config.bg, config.border)}
                        />
                        {isArabic ? config.ar : config.en}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Priority submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Flag size={14} className="me-2" />
                    {t('whiteboard.priority', 'Priority')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {Object.entries(blockPriorityLabels).map(([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => onPriorityChange?.(key as Block['priority'])}
                      >
                        <div className={cn('w-2 h-2 rounded-full me-2', config.bg)} />
                        {isArabic ? config.ar : config.en}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onPriorityChange?.(undefined)}>
                      {t('common.none', 'None')}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onDuplicate?.()}>
                  <Copy size={14} className="me-2" />
                  {t('common.duplicate', 'Duplicate')}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onDelete?.()}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 size={14} className="me-2" />
                  {t('common.delete', 'Delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="p-3 h-[calc(100%-36px)] overflow-hidden">
        {contentText ? (
          <p className="text-sm leading-relaxed line-clamp-6">{contentText}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">
            {t('whiteboard.emptyBlock', 'Double-click to add content...')}
          </p>
        )}
      </div>

      {/* Party statement indicator */}
      {block.type === 'party_statement' && block.partyType && (
        <div className="absolute bottom-2 start-2">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px]',
              block.partyType === 'plaintiff' && 'bg-blue-100 text-blue-700 border-blue-200',
              block.partyType === 'defendant' && 'bg-red-100 text-red-700 border-red-200',
              block.partyType === 'witness' && 'bg-amber-100 text-amber-700 border-amber-200',
              block.partyType === 'expert' && 'bg-purple-100 text-purple-700 border-purple-200',
              block.partyType === 'judge' && 'bg-slate-100 text-slate-700 border-slate-200'
            )}
          >
            <User size={10} className="me-1" />
            {block.partyType}
          </Badge>
        </div>
      )}

      {/* Timeline entry date */}
      {block.type === 'timeline_entry' && block.eventDate && (
        <div className="absolute bottom-2 start-2">
          <Badge variant="outline" className="text-[10px] bg-white/50">
            <Clock size={10} className="me-1" />
            {new Date(block.eventDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
          </Badge>
        </div>
      )}

      {/* Resize handles - only show when selected and not read-only */}
      {isSelected && !readOnly && (
        <>
          {/* SE corner resize */}
          <div
            className="absolute -bottom-1 -end-1 w-3 h-3 bg-emerald-500 rounded-sm cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          {/* E edge resize */}
          <div
            className="absolute top-1/2 -end-1 w-2 h-8 -translate-y-1/2 bg-emerald-500/50 rounded-sm cursor-e-resize opacity-0 hover:opacity-100"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          {/* S edge resize */}
          <div
            className="absolute -bottom-1 start-1/2 w-8 h-2 -translate-x-1/2 bg-emerald-500/50 rounded-sm cursor-s-resize opacity-0 hover:opacity-100"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
        </>
      )}

      {/* Connection anchor points - show when connecting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -start-2 w-4 h-4 -translate-y-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
        <div className="absolute top-1/2 -end-2 w-4 h-4 -translate-y-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
        <div className="absolute -top-2 start-1/2 w-4 h-4 -translate-x-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
        <div className="absolute -bottom-2 start-1/2 w-4 h-4 -translate-x-1/2 rounded-full border-2 border-slate-400 bg-white opacity-0 group-hover:opacity-100 pointer-events-auto cursor-crosshair" />
      </div>
    </div>
  )
}

export default WhiteboardBlock
