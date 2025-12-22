/**
 * Kanban Column Component
 * Features:
 * - Column header with stage name and count
 * - Virtualized card list for performance
 * - Add card button with quick create
 * - Column actions (collapse, settings)
 * - Droppable area for drag and drop
 */

import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard, type KanbanCard as KanbanCardType } from './kanban-card'
import { KanbanQuickCreate } from './kanban-quick-create'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Plus, MoreHorizontal, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { KanbanStage } from './kanban-board'

export interface KanbanColumnProps {
  stage: KanbanStage
  cards: KanbanCardType[]
  count: number
  onCardClick?: (card: KanbanCardType) => void
  onQuickCreate?: (stageId: string, title: string) => void
  isLoading?: boolean
  isRTL?: boolean
}

export function KanbanColumn({
  stage,
  cards,
  count,
  onCardClick,
  onQuickCreate,
  isLoading = false,
  isRTL = false,
}: KanbanColumnProps) {
  const { t } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showQuickCreate, setShowQuickCreate] = useState(false)

  // Droppable area for the column
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  // Calculate column statistics
  const stats = useMemo(() => {
    const totalValue = cards.reduce((sum, card) => {
      return sum + (card.claimAmount || 0)
    }, 0)

    const urgentCount = cards.filter(
      card => card.priority === 'high' || card.priority === 'critical'
    ).length

    return { totalValue, urgentCount }
  }, [cards])

  const handleQuickCreate = (title: string) => {
    if (onQuickCreate) {
      onQuickCreate(stage.id, title)
    }
    setShowQuickCreate(false)
  }

  const stageName = isRTL ? stage.nameAr : stage.name

  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(open) => setIsCollapsed(!open)}
      className="flex-shrink-0 w-80"
    >
      <div className="flex flex-col h-full">
        {/* Column Header */}
        <div
          className="p-4 rounded-t-xl text-white font-semibold"
          style={{ backgroundColor: stage.color }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 flex-1">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <span className="truncate">{stageName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0">
                {count}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white hover:bg-white/20"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 ms-2" />
                    {t('kanban.column.settings', 'إعدادات العمود')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? (
                      <>
                        <ChevronDown className="h-4 w-4 ms-2" />
                        {t('kanban.column.expand', 'توسيع')}
                      </>
                    ) : (
                      <>
                        <ChevronUp className="h-4 w-4 ms-2" />
                        {t('kanban.column.collapse', 'طي')}
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress indicator */}
          {!isCollapsed && (
            <div className="space-y-1">
              <Progress
                value={count > 0 ? 100 : 0}
                className="h-1.5 bg-white/20"
              />
              {stats.totalValue > 0 && (
                <div className="text-xs text-white/80">
                  {stats.totalValue.toLocaleString('ar-SA')} {t('kanban.sar', 'ر.س')}
                </div>
              )}
            </div>
          )}
        </div>

        <CollapsibleContent className="flex-1 flex flex-col">
          {/* Column Body */}
          <div
            ref={setNodeRef}
            className={cn(
              'flex-1 min-h-[400px] p-3 rounded-b-xl border border-t-0 transition-colors',
              isOver
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            )}
          >
            {/* Quick Create Form */}
            {showQuickCreate && (
              <div className="mb-3">
                <KanbanQuickCreate
                  onSubmit={handleQuickCreate}
                  onCancel={() => setShowQuickCreate(false)}
                  isRTL={isRTL}
                />
              </div>
            )}

            {/* Add Card Button */}
            {!showQuickCreate && (
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-white mb-3"
                onClick={() => setShowQuickCreate(true)}
              >
                <Plus className="h-4 w-4 ms-2" />
                {t('kanban.column.addCard', 'إضافة بطاقة')}
              </Button>
            )}

            {/* Cards List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="flex items-center justify-center text-slate-400 text-sm py-12">
                {t('kanban.column.empty', 'اسحب البطاقات هنا')}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <SortableContext
                  items={cards.map(c => c._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 pe-3">
                    {cards.map((card) => (
                      <KanbanCard
                        key={card._id}
                        card={card}
                        onClick={onCardClick}
                        isDragging={false}
                      />
                    ))}
                  </div>
                </SortableContext>
              </ScrollArea>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
