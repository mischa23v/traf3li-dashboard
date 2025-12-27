/**
 * Pipeline Kanban View - CRM Leads Board
 *
 * Features:
 * - Horizontal scrollable board with drag-and-drop
 * - Custom lead cards with all lead information
 * - Column headers with stage info, count, and total value
 * - Filters: Pipeline selector, Assigned to, Team, Territory, Search
 * - Board settings: Toggle card details, color coding options
 * - Quick actions on cards: Open detail, Schedule activity, Move to stage
 * - Confirm dialogs for Won/Lost stages
 * - Full RTL and Arabic support
 */

import { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Filter,
  Settings,
  DollarSign,
  Target,
  Percent,
  Clock,
  Star,
  Phone,
  Mail,
  Building2,
  User,
  GripVertical,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Eye,
  MessageSquare,
  MoveRight,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
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
  useDroppable,
} from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { differenceInDays, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { cn } from '@/lib/utils'
import { useLeadsByPipeline, usePipelines, useMoveLeadToStage } from '@/hooks/useCrm'
import type { Lead, Pipeline, PipelineStage } from '@/types/crm'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════

type ColorByOption = 'health' | 'age' | 'probability'

interface BoardSettings {
  showValue: boolean
  showProbability: boolean
  colorBy: ColorByOption
}

interface ConfirmMoveDialog {
  open: boolean
  leadId: string
  leadName: string
  stageId: string
  stageName: string
  isWonStage: boolean
  isLostStage: boolean
}

interface Filters {
  search: string
  assignedTo: string
  team: string
  territory: string
}

// ═══════════════════════════════════════════════════════════════
// LEAD CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

interface LeadCardProps {
  lead: Lead
  settings: BoardSettings
  onOpenDetail: (leadId: string) => void
  onScheduleActivity: (leadId: string) => void
  onMoveToStage: (leadId: string, stageId: string, stageName: string, isWon: boolean, isLost: boolean) => void
  availableStages: PipelineStage[]
  isDragging?: boolean
  isOverlay?: boolean
}

const LeadCard = memo(function LeadCard({
  lead,
  settings,
  onOpenDetail,
  onScheduleActivity,
  onMoveToStage,
  availableStages,
  isDragging = false,
  isOverlay = false,
}: LeadCardProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Sortable hook for drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: lead._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Calculate lead metrics
  const daysInStage = differenceInDays(new Date(), new Date(lead.updatedAt || lead.createdAt))
  const isStale = daysInStage > 14
  const isUrgent = lead.intake?.urgency === 'urgent' || lead.intake?.urgency === 'critical'
  const isVIP = lead.vipStatus || lead.priority === 'vip'

  // Determine card color based on settings
  const getCardColor = () => {
    if (settings.colorBy === 'health') {
      if (isStale && daysInStage > 30) return 'border-red-300 bg-red-50/50'
      if (isStale) return 'border-orange-300 bg-orange-50/50'
      return 'border-slate-200'
    }

    if (settings.colorBy === 'age') {
      if (daysInStage > 30) return 'border-purple-300 bg-purple-50/50'
      if (daysInStage > 14) return 'border-blue-300 bg-blue-50/50'
      return 'border-slate-200'
    }

    if (settings.colorBy === 'probability') {
      if (lead.probability >= 75) return 'border-emerald-300 bg-emerald-50/50'
      if (lead.probability >= 50) return 'border-blue-300 bg-blue-50/50'
      if (lead.probability >= 25) return 'border-orange-300 bg-orange-50/50'
      return 'border-red-300 bg-red-50/50'
    }

    return 'border-slate-200'
  }

  const cardColorClass = getCardColor()

  // Practice area translation
  const getPracticeAreaLabel = (area: string) => {
    const labels: Record<string, string> = {
      corporate: isRTL ? 'شركات' : 'Corporate',
      litigation: isRTL ? 'تقاضي' : 'Litigation',
      labor: isRTL ? 'عمالي' : 'Labor',
      real_estate: isRTL ? 'عقارات' : 'Real Estate',
      family: isRTL ? 'أسري' : 'Family',
      criminal: isRTL ? 'جنائي' : 'Criminal',
    }
    return labels[area] || area
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white p-4 rounded-xl shadow-sm border transition-all group',
        cardColorClass,
        (isDragging || isSortableDragging) && 'opacity-50 ring-2 ring-emerald-400 border-emerald-300',
        isOverlay && 'shadow-lg ring-2 ring-emerald-400 rotate-3',
        'hover:shadow-md'
      )}
      {...attributes}
    >
      {/* Header with drag handle and name */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-slate-300 hover:text-slate-500" />
          </div>
          <span className="font-semibold text-navy truncate flex-1">
            {lead.displayName}
          </span>
        </div>

        {/* Badges and menu */}
        <div className="flex items-center gap-1">
          {isVIP && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>{isRTL ? 'عميل VIP' : 'VIP Client'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isUrgent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>{isRTL ? 'عاجل' : 'Urgent'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isStale && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Clock className="w-4 h-4 text-orange-500" />
                </TooltipTrigger>
                <TooltipContent>
                  {isRTL ? `${daysInStage} يوم في هذه المرحلة` : `${daysInStage} days in stage`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Quick actions menu */}
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
              <DropdownMenuItem onClick={() => onOpenDetail(lead._id)}>
                <Eye className="h-4 w-4 me-2" />
                {isRTL ? 'عرض التفاصيل' : 'Open Detail'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onScheduleActivity(lead._id)}>
                <Calendar className="h-4 w-4 me-2" />
                {isRTL ? 'جدولة نشاط' : 'Schedule Activity'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoveRight className="h-4 w-4 me-2" />
                  {isRTL ? 'نقل إلى مرحلة' : 'Move to Stage'}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {availableStages.map((stage) => (
                    <DropdownMenuItem
                      key={stage.stageId}
                      onClick={() => onMoveToStage(
                        lead._id,
                        stage.stageId,
                        isRTL ? (stage.nameAr || stage.name) : stage.name,
                        stage.isWonStage || false,
                        stage.isLostStage || false
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full me-2"
                        style={{ backgroundColor: stage.color }}
                      />
                      {isRTL ? (stage.nameAr || stage.name) : stage.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Company */}
      {lead.company && (
        <p className="text-xs text-slate-500 mb-2 truncate">{lead.company}</p>
      )}

      {/* Contact info */}
      <div className="space-y-1 text-sm text-slate-500 mb-3">
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate" dir="ltr">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate text-xs" dir="ltr">{lead.email}</span>
          </div>
        )}
        {lead.organizationId && typeof lead.organizationId === 'object' && (
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-3 w-3 flex-shrink-0 text-emerald-600" />
            <span className="truncate text-emerald-600 text-xs">{lead.organizationId.legalName}</span>
          </div>
        )}
        {lead.contactId && typeof lead.contactId === 'object' && (
          <div className="flex items-center gap-2 truncate">
            <User className="h-3 w-3 flex-shrink-0 text-blue-600" />
            <span className="truncate text-blue-600 text-xs">
              {lead.contactId.firstName} {lead.contactId.lastName || ''}
            </span>
          </div>
        )}
      </div>

      {/* Practice area and value row */}
      <div className="flex items-center justify-between mb-2">
        {lead.intake?.practiceArea ? (
          <Badge variant="secondary" className="text-xs">
            {getPracticeAreaLabel(lead.intake.practiceArea)}
          </Badge>
        ) : (
          <span />
        )}

        {settings.showValue && lead.estimatedValue > 0 && (
          <span className="text-emerald-600 font-semibold text-sm">
            {lead.estimatedValue.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {isRTL ? 'ر.س' : 'SAR'}
          </span>
        )}
      </div>

      {/* Bottom section with probability and score */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          {lead.qualification?.score && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{lead.qualification.score}</span>
            </div>
          )}
          {settings.showProbability && lead.probability > 0 && (
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>{lead.probability}%</span>
            </div>
          )}
        </div>

        {/* Assigned user avatar */}
        {lead.assignedTo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-slate-200">
                    {lead.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{isRTL ? 'مسؤول' : 'Assigned'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Time ago */}
      <div className="mt-2 text-xs text-slate-500">
        {formatDistanceToNow(new Date(lead.createdAt), {
          addSuffix: true,
          locale: isRTL ? ar : undefined,
        })}
      </div>
    </div>
  )
})

LeadCard.displayName = 'LeadCard'

// ═══════════════════════════════════════════════════════════════
// KANBAN COLUMN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface KanbanColumnProps {
  stage: PipelineStage
  leads: Lead[]
  settings: BoardSettings
  onOpenDetail: (leadId: string) => void
  onScheduleActivity: (leadId: string) => void
  onMoveToStage: (leadId: string, stageId: string, stageName: string, isWon: boolean, isLost: boolean) => void
  availableStages: PipelineStage[]
  isRTL: boolean
}

const KanbanColumn = memo(function KanbanColumn({
  stage,
  leads,
  settings,
  onOpenDetail,
  onScheduleActivity,
  onMoveToStage,
  availableStages,
  isRTL,
}: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Droppable area for the column
  const { setNodeRef, isOver } = useDroppable({
    id: stage.stageId,
  })

  // Calculate column totals
  const totals = useMemo(() => {
    const count = leads.length
    const value = leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0)
    const weightedValue = leads.reduce((sum, lead) =>
      sum + ((lead.estimatedValue || 0) * (lead.probability || 50) / 100), 0
    )
    return { count, value, weightedValue }
  }, [leads])

  const stageName = isRTL ? (stage.nameAr || stage.name) : stage.name

  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(open) => setIsCollapsed(!open)}
      className="flex-shrink-0 w-80"
    >
      <div className="flex flex-col">
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
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isCollapsed && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              <span className="truncate">{stageName}</span>
            </div>

            <Badge className="bg-white/20 text-white border-0">
              {totals.count}
            </Badge>
          </div>

          {/* Progress bar */}
          {!isCollapsed && (
            <Progress value={totals.count > 0 ? 100 : 0} className="h-1.5 bg-white/20" />
          )}
        </div>

        {/* Column Value */}
        <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 border-x border-slate-200 flex justify-between items-center">
          <span>
            {totals.value > 0
              ? `${totals.value.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} ${isRTL ? 'ر.س' : 'SAR'}`
              : isRTL ? 'لا قيمة' : 'No value'}
          </span>
          {totals.weightedValue > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-emerald-600">
                    ~{totals.weightedValue.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{isRTL ? 'القيمة المرجحة' : 'Weighted Value'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <CollapsibleContent>
          {/* Droppable Area */}
          <div
            ref={setNodeRef}
            className={cn(
              'min-h-[400px] p-3 rounded-b-xl border border-t-0 transition-colors',
              isOver
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            )}
          >
            {leads.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm py-12">
                {isRTL ? 'اسحب العملاء هنا' : 'Drag leads here'}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <SortableContext
                  items={leads.map(l => l._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 pe-3">
                    {leads.map((lead) => (
                      <LeadCard
                        key={lead._id}
                        lead={lead}
                        settings={settings}
                        onOpenDetail={onOpenDetail}
                        onScheduleActivity={onScheduleActivity}
                        onMoveToStage={onMoveToStage}
                        availableStages={availableStages}
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
})

KanbanColumn.displayName = 'KanbanColumn'

// ═══════════════════════════════════════════════════════════════
// MAIN PIPELINE KANBAN VIEW
// ═══════════════════════════════════════════════════════════════

export function PipelineKanbanView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  // State
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('')
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    assignedTo: 'all',
    team: 'all',
    territory: 'all',
  })
  const [settings, setSettings] = useState<BoardSettings>({
    showValue: true,
    showProbability: true,
    colorBy: 'health',
  })
  const [confirmDialog, setConfirmDialog] = useState<ConfirmMoveDialog>({
    open: false,
    leadId: '',
    leadName: '',
    stageId: '',
    stageName: '',
    isWonStage: false,
    isLostStage: false,
  })

  // Fetch data
  const { data: pipelinesData } = usePipelines()
  const pipelines = useMemo(() => pipelinesData?.data || [], [pipelinesData?.data])

  const {
    data: pipelineData,
    isLoading,
    isError,
  } = useLeadsByPipeline(selectedPipelineId || undefined)

  const { mutate: moveToStage } = useMoveLeadToStage()

  const pipeline = pipelineData?.pipeline
  const leadsByStage = useMemo(() => pipelineData?.leadsByStage || {}, [pipelineData?.leadsByStage])

  // Auto-select default pipeline
  useState(() => {
    if (!selectedPipelineId && pipelines.length > 0) {
      const defaultPipeline = pipelines.find((p: Pipeline) => p.isDefault)
      const pipelineId = defaultPipeline?._id || pipelines[0]?._id
      if (pipelineId) {
        setSelectedPipelineId(pipelineId)
      }
    }
  })

  // Get all leads as flat array for filtering
  const allLeads = useMemo(() => {
    return Object.values(leadsByStage).flat() as Lead[]
  }, [leadsByStage])

  // Apply filters
  const filteredLeadsByStage = useMemo(() => {
    const filtered: Record<string, Lead[]> = {}

    Object.entries(leadsByStage).forEach(([stageId, stageLeads]) => {
      filtered[stageId] = (stageLeads as Lead[]).filter((lead) => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          const matchesSearch =
            lead.displayName.toLowerCase().includes(searchLower) ||
            lead.email?.toLowerCase().includes(searchLower) ||
            lead.phone?.includes(filters.search) ||
            lead.company?.toLowerCase().includes(searchLower)

          if (!matchesSearch) return false
        }

        // Assigned to filter
        if (filters.assignedTo !== 'all') {
          if (lead.assignedTo !== filters.assignedTo) return false
        }

        return true
      })
    })

    return filtered
  }, [leadsByStage, filters])

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
    setActiveLeadId(active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLeadId(null)

    if (!over) return

    const leadId = active.id as string
    const targetStageId = over.id as string

    // Find the target stage
    const targetStage = pipeline?.stages.find(s => s.stageId === targetStageId)
    if (!targetStage) return

    // Find the lead
    const lead = allLeads.find(l => l._id === leadId)
    if (!lead) return

    // If moving to Won or Lost, show confirm dialog
    if (targetStage.isWonStage || targetStage.isLostStage) {
      setConfirmDialog({
        open: true,
        leadId,
        leadName: lead.displayName,
        stageId: targetStageId,
        stageName: isRTL ? (targetStage.nameAr || targetStage.name) : targetStage.name,
        isWonStage: targetStage.isWonStage || false,
        isLostStage: targetStage.isLostStage || false,
      })
    } else {
      // Move directly
      moveToStage({ leadId, stageId: targetStageId })
    }
  }

  const handleConfirmMove = () => {
    moveToStage(
      { leadId: confirmDialog.leadId, stageId: confirmDialog.stageId },
      {
        onSuccess: () => {
          toast.success(
            isRTL
              ? `تم نقل ${confirmDialog.leadName} إلى ${confirmDialog.stageName}`
              : `Moved ${confirmDialog.leadName} to ${confirmDialog.stageName}`
          )
        },
      }
    )
    setConfirmDialog({ ...confirmDialog, open: false })
  }

  const handleOpenDetail = useCallback((leadId: string) => {
    navigate({ to: ROUTES.dashboard.crm.leads.detail(leadId) })
  }, [navigate])

  const handleScheduleActivity = useCallback((leadId: string) => {
    navigate({
      to: ROUTES.dashboard.crm.activities.create,
      search: { leadId } as any,
    })
  }, [navigate])

  const handleMoveToStage = useCallback((
    leadId: string,
    stageId: string,
    stageName: string,
    isWon: boolean,
    isLost: boolean
  ) => {
    const lead = allLeads.find(l => l._id === leadId)
    if (!lead) return

    if (isWon || isLost) {
      setConfirmDialog({
        open: true,
        leadId,
        leadName: lead.displayName,
        stageId,
        stageName,
        isWonStage: isWon,
        isLostStage: isLost,
      })
    } else {
      moveToStage({ leadId, stageId })
    }
  }, [allLeads, moveToStage])

  // Get active lead for overlay
  const activeLead = useMemo(() => {
    if (!activeLeadId) return null
    return allLeads.find(l => l._id === activeLeadId)
  }, [activeLeadId, allLeads])

  return (
    <div className="flex flex-col h-full">
      {/* Top bar with filters and settings */}
      <div className="bg-white border-b border-slate-200 p-4 space-y-4">
        {/* Pipeline selector and main actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
              <SelectTrigger className="w-[300px] rounded-xl">
                <SelectValue placeholder={isRTL ? 'اختر مسار المبيعات' : 'Select Pipeline'} />
              </SelectTrigger>
              <SelectContent>
                {pipelines.length === 0 ? (
                  <SelectItem value="__no_pipelines__" disabled>
                    {isRTL ? 'لا توجد مسارات متاحة' : 'No pipelines available'}
                  </SelectItem>
                ) : (
                  pipelines.map((p: Pipeline) => (
                    <SelectItem key={p._id} value={p._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span>{isRTL ? (p.nameAr || p.name) : p.name}</span>
                        {p.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            {isRTL ? 'افتراضي' : 'Default'}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full h-10 ps-10 pe-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Board Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                <Settings className="h-4 w-4" />
                {isRTL ? 'إعدادات اللوحة' : 'Board Settings'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-3 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-value" className="text-sm">
                    {isRTL ? 'إظهار القيمة' : 'Show Value'}
                  </Label>
                  <Switch
                    id="show-value"
                    checked={settings.showValue}
                    onCheckedChange={(checked) => setSettings({ ...settings, showValue: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-probability" className="text-sm">
                    {isRTL ? 'إظهار الاحتمالية' : 'Show Probability'}
                  </Label>
                  <Switch
                    id="show-probability"
                    checked={settings.showProbability}
                    onCheckedChange={(checked) => setSettings({ ...settings, showProbability: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{isRTL ? 'تلوين حسب:' : 'Color by:'}</Label>
                  <Select
                    value={settings.colorBy}
                    onValueChange={(value) => setSettings({ ...settings, colorBy: value as ColorByOption })}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">
                        {isRTL ? 'صحة الصفقة' : 'Deal Health'}
                      </SelectItem>
                      <SelectItem value="age">
                        {isRTL ? 'العمر' : 'Age'}
                      </SelectItem>
                      <SelectItem value="probability">
                        {isRTL ? 'الاحتمالية' : 'Probability'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span>{isRTL ? 'تصفية:' : 'Filter:'}</span>
          </div>

          <Select
            value={filters.assignedTo}
            onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
          >
            <SelectTrigger className="w-[160px] rounded-lg h-9 text-sm">
              <SelectValue placeholder={isRTL ? 'المسؤول' : 'Assigned to'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
              {/* Add more assignees dynamically */}
            </SelectContent>
          </Select>

          <Select
            value={filters.team}
            onValueChange={(value) => setFilters({ ...filters, team: value })}
          >
            <SelectTrigger className="w-[140px] rounded-lg h-9 text-sm">
              <SelectValue placeholder={isRTL ? 'الفريق' : 'Team'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
              {/* Add more teams dynamically */}
            </SelectContent>
          </Select>

          <Select
            value={filters.territory}
            onValueChange={(value) => setFilters({ ...filters, territory: value })}
          >
            <SelectTrigger className="w-[140px] rounded-lg h-9 text-sm">
              <SelectValue placeholder={isRTL ? 'المنطقة' : 'Territory'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
              {/* Add more territories dynamically */}
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {(filters.search || filters.assignedTo !== 'all' || filters.team !== 'all' || filters.territory !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg gap-1"
              onClick={() => setFilters({
                search: '',
                assignedTo: 'all',
                team: 'all',
                territory: 'all',
              })}
            >
              <X className="h-4 w-4" />
              {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <Skeleton className="h-12 w-full rounded-t-xl" />
                <div className="bg-slate-100 p-3 rounded-b-xl space-y-3 min-h-[400px]">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : isError || !pipeline ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {isRTL ? 'اختر مسار المبيعات' : 'Select a Pipeline'}
              </h3>
              <p className="text-slate-500">
                {isRTL
                  ? 'اختر مسار مبيعات من القائمة أعلاه لعرض العملاء المحتملين'
                  : 'Select a pipeline from the list above to view leads'}
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex gap-4 overflow-x-auto pb-4 h-full"
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
              {pipeline.stages.map((stage: PipelineStage) => {
                const stageLeads = filteredLeadsByStage[stage.stageId] || []

                return (
                  <SortableContext
                    key={stage.stageId}
                    id={stage.stageId}
                    items={stageLeads.map(l => l._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <KanbanColumn
                      stage={stage}
                      leads={stageLeads}
                      settings={settings}
                      onOpenDetail={handleOpenDetail}
                      onScheduleActivity={handleScheduleActivity}
                      onMoveToStage={handleMoveToStage}
                      availableStages={pipeline.stages}
                      isRTL={isRTL}
                    />
                  </SortableContext>
                )
              })}
            </div>

            <DragOverlay>
              {activeLead ? (
                <LeadCard
                  lead={activeLead}
                  settings={settings}
                  onOpenDetail={handleOpenDetail}
                  onScheduleActivity={handleScheduleActivity}
                  onMoveToStage={handleMoveToStage}
                  availableStages={pipeline.stages}
                  isOverlay={true}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Confirm Move Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.isWonStage
                ? (isRTL ? 'تأكيد الفوز بالصفقة' : 'Confirm Deal Won')
                : (isRTL ? 'تأكيد خسارة الصفقة' : 'Confirm Deal Lost')}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.isWonStage
                ? (isRTL
                    ? `هل أنت متأكد من نقل "${confirmDialog.leadName}" إلى مرحلة "${confirmDialog.stageName}"؟ سيتم تحويل هذا العميل المحتمل إلى عميل.`
                    : `Are you sure you want to move "${confirmDialog.leadName}" to "${confirmDialog.stageName}"? This will convert the lead to a client.`)
                : (isRTL
                    ? `هل أنت متأكد من نقل "${confirmDialog.leadName}" إلى مرحلة "${confirmDialog.stageName}"؟ سيتم إغلاق هذا العميل المحتمل كخسارة.`
                    : `Are you sure you want to move "${confirmDialog.leadName}" to "${confirmDialog.stageName}"? This will close the lead as lost.`)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              <X className="h-4 w-4 me-2" />
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirmMove}
              className={cn(
                confirmDialog.isWonStage
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
            >
              <Check className="h-4 w-4 me-2" />
              {isRTL ? 'تأكيد' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
