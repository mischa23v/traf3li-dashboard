/**
 * Kanban Hook
 * Custom hook for Kanban board data management
 * Features:
 * - Fetch board data with stages and cards
 * - Handle drag and drop updates with optimistic updates
 * - Real-time sync via socket (future enhancement)
 * - Quick card creation
 */

import { useState, useEffect, useMemo } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useCases, useUpdateCase, useCreateCase } from './useCasesAndClients'
import type { KanbanCard, KanbanStage } from '@/components/kanban/kanban-board'
import type { Case } from '@/services/casesService'

// Default workflow stages for cases
export const DEFAULT_CASE_STAGES: KanbanStage[] = [
  {
    id: 'new',
    name: 'New',
    nameAr: 'جديد',
    color: '#6366f1',
    order: 0,
  },
  {
    id: 'consultation',
    name: 'Consultation',
    nameAr: 'استشارة',
    color: '#8b5cf6',
    order: 1,
  },
  {
    id: 'filing',
    name: 'Filing',
    nameAr: 'تقديم',
    color: '#3b82f6',
    order: 2,
  },
  {
    id: 'hearing',
    name: 'In Progress',
    nameAr: 'قيد التنفيذ',
    color: '#10b981',
    order: 3,
  },
  {
    id: 'verdict',
    name: 'Verdict',
    nameAr: 'الحكم',
    color: '#f59e0b',
    order: 4,
  },
  {
    id: 'closed',
    name: 'Closed',
    nameAr: 'مغلق',
    color: '#6b7280',
    order: 5,
  },
]

export interface UseKanbanOptions {
  category?: string
  stages?: KanbanStage[]
}

export function useKanban(options: UseKanbanOptions = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { category, stages = DEFAULT_CASE_STAGES } = options

  // Fetch cases
  const {
    data: casesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCases({
    category: category !== 'all' ? category : undefined,
  })

  // Mutations
  const { mutate: updateCase } = useUpdateCase()
  const { mutate: createCase } = useCreateCase()

  // Transform cases to kanban cards
  const cards = useMemo(() => {
    if (!casesData?.cases) return []

    return casesData.cases
      .filter((c: Case) =>
        c.status !== 'closed' &&
        c.status !== 'completed' &&
        c.status !== 'archived'
      )
      .map((c: Case, index: number) => {
        const card: KanbanCard = {
          _id: c._id,
          title: c.title || c.caseNumber || t('kanban.untitled', 'بدون عنوان'),
          description: c.description,
          assignee: c.lawyer
            ? {
                id: c.lawyer._id || c.lawyer.id,
                name: c.lawyer.name,
                avatar: c.lawyer.avatar,
              }
            : undefined,
          priority: c.priority || 'medium',
          dueDate: c.nextHearing,
          tags: c.tags || [],
          stageId: c.currentStage || c.pipelineStage || 'new',
          order: index,
          claimAmount: c.claimAmount,
          // Keep all other case data
          ...c,
        }
        return card
      })
  }, [casesData, t])

  // Handle card move (drag and drop)
  const handleCardMove = (cardId: string, newStageId: string, newOrder?: number) => {
    // Find the card
    const card = cards.find(c => c._id === cardId)
    if (!card) return

    // Optimistic update - update UI immediately
    queryClient.setQueryData(['cases'], (old: any) => {
      if (!old?.cases) return old

      return {
        ...old,
        cases: old.cases.map((c: Case) => {
          if (c._id === cardId) {
            return {
              ...c,
              currentStage: newStageId,
              pipelineStage: newStageId,
              stageEnteredAt: new Date().toISOString(),
              order: newOrder ?? c.order ?? 0,
            }
          }
          return c
        }),
      }
    })

    // Update on server
    updateCase(
      {
        id: cardId,
        data: {
          currentStage: newStageId,
          pipelineStage: newStageId,
          stageEnteredAt: new Date().toISOString(),
          order: newOrder,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success(t('kanban.moveSuccess', 'تم نقل البطاقة'))
        },
        onError: (error) => {
          toast.error(t('kanban.moveError', 'فشل نقل البطاقة'))
          // Revert optimistic update
          refetch()
        },
      }
    )
  }

  // Handle quick create
  const handleQuickCreate = (stageId: string, title: string) => {
    createCase(
      {
        title,
        currentStage: stageId,
        pipelineStage: stageId,
        category: category !== 'all' ? category : 'other',
        status: 'active',
        priority: 'medium',
      } as any,
      {
        onSuccess: () => {
          toast.success(t('kanban.createSuccess', 'تم إنشاء البطاقة'))
          refetch()
        },
        onError: () => {
          toast.error(t('kanban.createError', 'فشل إنشاء البطاقة'))
        },
      }
    )
  }

  // Real-time updates via WebSocket (future enhancement)
  useEffect(() => {
    // TODO: Implement WebSocket connection for real-time updates
    // const socket = io('your-socket-server')
    // socket.on('case-updated', (data) => {
    //   queryClient.invalidateQueries(['cases'])
    // })
    // return () => socket.disconnect()
  }, [queryClient])

  return {
    stages,
    cards,
    isLoading,
    isError,
    error,
    refetch,
    handleCardMove,
    handleQuickCreate,
  }
}
