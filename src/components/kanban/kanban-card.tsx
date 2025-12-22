/**
 * Kanban Card Component
 * Features:
 * - Title and description preview
 * - Assignee avatar
 * - Priority indicator
 * - Due date badge
 * - Tags display
 * - Quick actions on hover
 * - Drag and drop support
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Calendar,
  GripVertical,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

export interface KanbanCard {
  _id: string
  title: string
  description?: string
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: string
  tags?: string[]
  stageId: string
  order: number
  claimAmount?: number
  [key: string]: any
}

export interface KanbanCardProps {
  card: KanbanCard
  onClick?: (card: KanbanCard) => void
  isDragging: boolean
  isOverlay?: boolean
}

export function KanbanCard({
  card,
  onClick,
  isDragging,
  isOverlay = false,
}: KanbanCardProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const locale = isRTL ? ar : enUS

  // Sortable hook for drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Priority colors
  const priorityConfig = {
    critical: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      label: t('kanban.priority.critical', 'حرجة'),
    },
    high: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      label: t('kanban.priority.high', 'عالية'),
    },
    medium: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
      label: t('kanban.priority.medium', 'متوسطة'),
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      label: t('kanban.priority.low', 'منخفضة'),
    },
  }

  const priority = priorityConfig[card.priority] || priorityConfig.medium

  // Due date status
  const getDueDateStatus = () => {
    if (!card.dueDate) return null

    const dueDate = new Date(card.dueDate)
    const isOverdue = isPast(dueDate) && !isToday(dueDate)
    const isDueToday = isToday(dueDate)
    const isDueTomorrow = isTomorrow(dueDate)

    return {
      isOverdue,
      isDueToday,
      isDueTomorrow,
      formatted: format(dueDate, 'dd MMM', { locale }),
    }
  }

  const dueDateStatus = getDueDateStatus()

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleCardClick = () => {
    if (onClick && !isDragging && !isSortableDragging) {
      onClick(card)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white p-4 rounded-xl shadow-sm border transition-all group',
        isDragging || isSortableDragging
          ? 'opacity-50 ring-2 ring-emerald-400 border-emerald-300'
          : 'border-slate-200 hover:border-emerald-300 hover:shadow-md',
        isOverlay && 'shadow-lg ring-2 ring-emerald-400',
        'cursor-pointer'
      )}
      {...attributes}
    >
      {/* Header with drag handle and menu */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-slate-300 hover:text-slate-500" />
          </div>
          <h4
            className="font-semibold text-navy truncate flex-1"
            onClick={handleCardClick}
          >
            {card.title}
          </h4>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCardClick}>
              <Eye className="h-4 w-4 ms-2" />
              {t('kanban.card.view', 'عرض')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 ms-2" />
              {t('kanban.card.edit', 'تعديل')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 ms-2" />
              {t('kanban.card.delete', 'حذف')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs bg-slate-50 text-slate-700 border-slate-300"
            >
              {tag}
            </Badge>
          ))}
          {card.tags.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs bg-slate-50 text-slate-500 border-slate-300"
            >
              +{card.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        {/* Assignee and Priority */}
        <div className="flex items-center gap-2">
          {card.assignee ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={card.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(card.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{card.assignee.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-xs text-slate-400">?</span>
            </div>
          )}

          <Badge
            className={cn(
              'text-xs border-0',
              priority.bg,
              priority.text
            )}
          >
            {priority.label}
          </Badge>
        </div>

        {/* Due Date */}
        {dueDateStatus && (
          <Badge
            variant="outline"
            className={cn(
              'text-xs gap-1',
              dueDateStatus.isOverdue &&
                'bg-red-50 text-red-700 border-red-300',
              dueDateStatus.isDueToday &&
                'bg-orange-50 text-orange-700 border-orange-300',
              dueDateStatus.isDueTomorrow &&
                'bg-amber-50 text-amber-700 border-amber-300'
            )}
          >
            {dueDateStatus.isOverdue && (
              <AlertCircle className="h-3 w-3" />
            )}
            {(dueDateStatus.isDueToday || dueDateStatus.isDueTomorrow) && (
              <Clock className="h-3 w-3" />
            )}
            {!dueDateStatus.isOverdue &&
              !dueDateStatus.isDueToday &&
              !dueDateStatus.isDueTomorrow && (
                <Calendar className="h-3 w-3" />
              )}
            {dueDateStatus.formatted}
          </Badge>
        )}
      </div>

      {/* Claim Amount */}
      {card.claimAmount && card.claimAmount > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span className="text-emerald-600 font-semibold text-sm">
            {card.claimAmount.toLocaleString('ar-SA')} {t('kanban.sar', 'ر.س')}
          </span>
        </div>
      )}
    </div>
  )
}
