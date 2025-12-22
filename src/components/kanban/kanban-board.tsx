/**
 * Kanban Board Component - Odoo-style workflow view
 * Features:
 * - Drag and drop between columns using @dnd-kit
 * - Column headers with stage names and counts
 * - Virtualized card lists for performance
 * - Quick create in each column
 * - RTL support
 */

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export interface KanbanStage {
  id: string
  name: string
  nameAr: string
  color: string
  order: number
}

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
  [key: string]: any
}

export interface KanbanBoardProps {
  stages: KanbanStage[]
  cards: KanbanCard[]
  onCardMove: (cardId: string, newStageId: string, newOrder?: number) => void
  onCardClick?: (card: KanbanCard) => void
  onQuickCreate?: (stageId: string, title: string) => void
  className?: string
  isLoading?: boolean
}

export function KanbanBoard({
  stages,
  cards,
  onCardMove,
  onCardClick,
  onQuickCreate,
  className,
  isLoading = false,
}: KanbanBoardProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State for drag and drop
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)

  // Group cards by stage
  const cardsByStage = useMemo(() => {
    const grouped: Record<string, KanbanCard[]> = {}

    stages.forEach(stage => {
      grouped[stage.id] = []
    })

    cards.forEach(card => {
      if (grouped[card.stageId]) {
        grouped[card.stageId].push(card)
      }
    })

    // Sort cards by order within each stage
    Object.keys(grouped).forEach(stageId => {
      grouped[stageId].sort((a, b) => a.order - b.order)
    })

    return grouped
  }, [cards, stages])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = cards.find(c => c._id === active.id)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // If dragging over a stage (column)
    if (typeof overId === 'string' && stages.some(s => s.id === overId)) {
      // Card is being dragged over a column
      return
    }

    // If dragging over another card
    const activeCard = cards.find(c => c._id === activeId)
    const overCard = cards.find(c => c._id === overId)

    if (!activeCard || !overCard) return
    if (activeCard.stageId === overCard.stageId) return

    // Move card to new stage (optimistic update handled by parent)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if dropped on a stage
    const targetStage = stages.find(s => s.id === overId)

    if (targetStage) {
      // Dropped on a column - move to end of that column
      const cardsInStage = cardsByStage[targetStage.id] || []
      const newOrder = cardsInStage.length
      onCardMove(activeId, targetStage.id, newOrder)
      return
    }

    // Check if dropped on another card
    const activeCard = cards.find(c => c._id === activeId)
    const overCard = cards.find(c => c._id === overId)

    if (!activeCard || !overCard) return

    // If in same stage, reorder
    if (activeCard.stageId === overCard.stageId) {
      const stageCards = cardsByStage[activeCard.stageId]
      const oldIndex = stageCards.findIndex(c => c._id === activeId)
      const newIndex = stageCards.findIndex(c => c._id === overId)

      if (oldIndex !== newIndex) {
        onCardMove(activeId, activeCard.stageId, newIndex)
      }
    } else {
      // Move to different stage at the position of the over card
      const overIndex = cardsByStage[overCard.stageId].findIndex(c => c._id === overId)
      onCardMove(activeId, overCard.stageId, overIndex)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          'flex gap-4 overflow-x-auto pb-4',
          className
        )}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        {stages.map(stage => {
          const stageCards = cardsByStage[stage.id] || []
          const stageCount = stageCards.length

          return (
            <SortableContext
              key={stage.id}
              id={stage.id}
              items={stageCards.map(c => c._id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                stage={stage}
                cards={stageCards}
                count={stageCount}
                onCardClick={onCardClick}
                onQuickCreate={onQuickCreate}
                isLoading={isLoading}
                isRTL={isRTL}
              />
            </SortableContext>
          )
        })}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-3 opacity-80">
            <KanbanCard
              card={activeCard}
              isDragging={false}
              isOverlay={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
