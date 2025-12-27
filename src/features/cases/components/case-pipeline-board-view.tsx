/**
 * Case Pipeline Board View - Kanban-style board showing cases by stage
 * Similar to CRM Pipeline for consistency
 * Features:
 * - Cases displayed as draggable cards in stage columns
 * - Case information and notes visible on cards
 * - Drag and drop between stages
 * - Quick actions on cards
 * - Stage statistics and totals
 */

import { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCases, useUpdateCase } from '@/hooks/useCasesAndClients'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Progress } from '@/components/ui/progress'
import { ROUTES } from '@/constants/routes'
import {
  Search, Bell, AlertCircle, MoreHorizontal,
  Eye, Scale, MapPin, FileText, User,
  Calendar, Building2, DollarSign, CheckCircle, Clock,
  AlertTriangle, Gavel, StickyNote,
  Plus, Kanban, List, Lightbulb, GripVertical, Star,
  ArrowUpRight
} from 'lucide-react'
import { format, differenceInDays, formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
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
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { caseTypes, getCasePipeline, CasePipelineStage } from '../data/case-pipeline-schema'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Case card data structure
interface CaseCardData {
  _id: string
  title: string
  caseNumber?: string
  category: string
  status: string
  priority: string
  plaintiffName?: string
  defendantName?: string
  court?: string
  claimAmount: number
  currentStage: string
  nextHearing?: string
  updatedAt: string
  createdAt: string
  stageEnteredAt?: string
  daysInStage: number
  notes?: Array<{ text: string; date: string; createdBy?: string }>
  latestNote?: string
  outcome?: string
  isVIP?: boolean
}

// Case card component (similar to LeadCard in CRM)
const CaseCard = memo(function CaseCard({
  caseItem,
  onDragStart,
  onDragEnd,
  isDragging,
  isRTL,
  locale,
  onOpenCase,
  onOpenPipeline,
  t,
}: {
  caseItem: CaseCardData
  onDragStart: (e: React.DragEvent, caseId: string) => void
  onDragEnd: () => void
  isDragging: boolean
  isRTL: boolean
  locale: any
  onOpenCase: (id: string) => void
  onOpenPipeline: (id: string) => void
  t: any
}) {
  const isStale = caseItem.daysInStage > 14
  const isUrgent = caseItem.priority === 'critical' || caseItem.priority === 'high'

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, caseItem._id)}
      onDragEnd={onDragEnd}
      className={cn(
        'bg-white p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing border transition-all',
        isDragging ? 'opacity-50 ring-2 ring-emerald-400 border-emerald-300' : 'border-transparent hover:border-emerald-300',
        isStale && !isDragging && 'border-orange-200 bg-orange-50/50',
      )}
    >
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
          <span className="font-medium text-navy truncate">{caseItem.title}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {caseItem.isVIP && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>{t('casePipeline.board.vipCase', 'قضية مهمة')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isUrgent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>{t('casePipeline.board.urgent', 'عاجل')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isStale && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Clock className="w-4 h-4 text-orange-500" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>{caseItem.daysInStage} {t('casePipeline.board.daysInStage', 'يوم في هذه المرحلة')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpenCase(caseItem._id)}>
                <Eye className="h-4 w-4 ms-2" />
                {t('casePipeline.viewCase', 'عرض القضية')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenPipeline(caseItem._id)}>
                <MapPin className="h-4 w-4 ms-2 text-emerald-500" />
                {t('casePipeline.viewPipeline', 'عرض المسار')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={ROUTES.dashboard.cases.notion(caseItem._id)}>
                  <Lightbulb className="h-4 w-4 ms-2 text-purple-500" />
                  {t('casePipeline.brainstorm', 'العصف الذهني')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Case Number */}
      {caseItem.caseNumber && (
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {caseItem.caseNumber}
        </p>
      )}

      {/* Contact info */}
      <div className="space-y-1 text-sm text-slate-500">
        {caseItem.plaintiffName && (
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-emerald-500" aria-hidden="true" />
            <span className="text-xs text-slate-600">{t('casePipeline.plaintiff', 'المدعي')}:</span>
            <span className="truncate font-medium text-emerald-600">{caseItem.plaintiffName}</span>
          </div>
        )}
        {caseItem.defendantName && (
          <div className="flex items-center gap-2">
            <Building2 className="h-3 w-3 text-red-500" aria-hidden="true" />
            <span className="text-xs text-slate-600">{t('casePipeline.defendant', 'المدعى عليه')}:</span>
            <span className="truncate font-medium text-red-600">{caseItem.defendantName}</span>
          </div>
        )}
        {caseItem.court && (
          <div className="flex items-center gap-2 truncate">
            <Gavel className="h-3 w-3 flex-shrink-0 text-purple-500" aria-hidden="true" />
            <span className="truncate text-purple-600">{caseItem.court}</span>
          </div>
        )}
      </div>

      {/* Priority and value */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Badge className={cn(
          "text-xs border-0",
          caseItem.priority === 'critical' && "bg-red-100 text-red-700",
          caseItem.priority === 'high' && "bg-orange-100 text-orange-700",
          caseItem.priority === 'medium' && "bg-amber-100 text-amber-700",
          caseItem.priority === 'low' && "bg-green-100 text-green-700",
        )}>
          {t(`casePipeline.priority.${caseItem.priority}`, caseItem.priority)}
        </Badge>
        {caseItem.claimAmount > 0 && (
          <span className="text-emerald-600 font-semibold text-sm">
            {caseItem.claimAmount.toLocaleString('ar-SA')} {t('casePipeline.sar', 'ر.س')}
          </span>
        )}
      </div>

      {/* Next Hearing */}
      {caseItem.nextHearing && (
        <div className="mt-2 flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg text-xs">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">
            {t('casePipeline.nextHearing', 'الجلسة القادمة')}: {format(new Date(caseItem.nextHearing), 'dd MMM', { locale })}
          </span>
        </div>
      )}

      {/* Latest Note - PROMINENT */}
      {caseItem.latestNote && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-1 text-amber-700 mb-1">
            <StickyNote className="h-3 w-3" />
            <span className="text-xs font-bold">{t('casePipeline.board.lastNote', 'آخر ملاحظة')}</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            {caseItem.latestNote}
          </p>
        </div>
      )}

      {/* Time ago */}
      <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
        <span>
          {formatDistanceToNow(new Date(caseItem.createdAt), {
            addSuffix: true,
            locale: isRTL ? ar : enUS,
          })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {caseItem.daysInStage} {t('casePipeline.days', 'يوم')}
        </span>
      </div>
    </div>
  )
})

CaseCard.displayName = 'CaseCard'

export function CasePipelineBoardView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const locale = isRTL ? ar : enUS

  // State
  const [selectedCaseType, setSelectedCaseType] = useState<string>('labor')
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null)

  // Fetch cases
  const { data: casesData, isLoading, isError, error, refetch } = useCases({
    category: selectedCaseType !== 'all' ? selectedCaseType : undefined,
  })

  const { mutate: updateCase, isPending: isUpdating } = useUpdateCase()

  // Get pipeline for selected type
  const pipeline = useMemo(() => getCasePipeline(selectedCaseType), [selectedCaseType])

  // Transform and group cases by stage
  const casesByStage = useMemo(() => {
    if (!casesData?.cases) return {}

    const grouped: Record<string, CaseCardData[]> = {}

    // Initialize all stages with empty arrays
    pipeline.stages.forEach(stage => {
      grouped[stage.id] = []
    })

    // Filter active cases only
    const activeCases = casesData.cases.filter((c: any) =>
      c.status !== 'closed' && c.status !== 'completed' && c.status !== 'archived' &&
      c.outcome !== 'won' && c.outcome !== 'lost' && c.outcome !== 'settled'
    )

    // Group by stage
    activeCases.forEach((caseItem: any) => {
      const stageId = caseItem.currentStage || caseItem.pipelineStage || 'filing'
      const daysInStage = differenceInDays(
        new Date(),
        new Date(caseItem.stageEnteredAt || caseItem.updatedAt || caseItem.createdAt)
      )

      const card: CaseCardData = {
        _id: caseItem._id,
        title: caseItem.title || caseItem.caseNumber || t('casePipeline.untitled', 'بدون عنوان'),
        caseNumber: caseItem.caseNumber,
        category: caseItem.category || 'other',
        status: caseItem.status || 'active',
        priority: caseItem.priority || 'medium',
        plaintiffName: caseItem.plaintiffName || caseItem.laborCaseDetails?.plaintiff?.name,
        defendantName: caseItem.defendantName || caseItem.laborCaseDetails?.company?.name,
        court: caseItem.court,
        claimAmount: caseItem.claimAmount || 0,
        currentStage: stageId,
        nextHearing: caseItem.nextHearing,
        updatedAt: caseItem.updatedAt,
        createdAt: caseItem.createdAt,
        stageEnteredAt: caseItem.stageEnteredAt,
        daysInStage,
        notes: caseItem.notes,
        latestNote: caseItem.notes?.[0]?.text || caseItem.notes?.[caseItem.notes?.length - 1]?.text,
        outcome: caseItem.outcome,
        isVIP: caseItem.isVIP || caseItem.priority === 'critical',
      }

      if (grouped[stageId]) {
        grouped[stageId].push(card)
      } else {
        // If stage doesn't exist in pipeline, add to first stage
        grouped[pipeline.stages[0].id]?.push(card)
      }
    })

    return grouped
  }, [casesData, pipeline, t])

  // Calculate analytics
  const analytics = useMemo(() => {
    const allCases: CaseCardData[] = Object.values(casesByStage).flat() as CaseCardData[]

    const totalCases = allCases.length
    const totalValue = allCases.reduce((sum, c) => sum + (c.claimAmount || 0), 0)
    const urgentCases = allCases.filter(c => c.priority === 'critical' || c.priority === 'high').length
    const staleCases = allCases.filter(c => c.daysInStage > 14).length

    return {
      totalCases,
      totalValue,
      urgentCases,
      staleCases,
    }
  }, [casesByStage])

  // Handle drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, caseId: string) => {
    setDraggedCaseId(caseId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (draggedCaseId) {
      updateCase({
        id: draggedCaseId,
        data: {
          currentStage: stageId,
          pipelineStage: stageId,
          stageEnteredAt: new Date().toISOString(),
        } as any,
      }, {
        onSuccess: () => {
          toast.success(t('casePipeline.board.stageMoved', 'تم نقل القضية'))
          refetch()
        },
        onError: () => {
          toast.error(t('casePipeline.board.moveError', 'فشل نقل القضية'))
        }
      })
      setDraggedCaseId(null)
    }
  }, [draggedCaseId, updateCase, t, refetch])

  const handleDragEnd = useCallback(() => {
    setDraggedCaseId(null)
  }, [])

  // Navigation handlers
  const handleOpenCase = useCallback((caseId: string) => {
    navigate({ to: ROUTES.dashboard.cases.detail(caseId) as any })
  }, [navigate])

  const handleOpenPipeline = useCallback((caseId: string) => {
    navigate({ to: ROUTES.dashboard.cases.casePipeline(caseId) as any })
  }, [navigate])

  // Calculate stage totals
  const getStageTotals = useCallback((stageId: string) => {
    const cases = casesByStage[stageId] || []
    return {
      count: cases.length,
      value: cases.reduce((sum, c) => sum + c.claimAmount, 0),
      overdueCases: cases.filter(c => c.daysInStage > 14).length,
    }
  }, [casesByStage])

  const topNav = [
    { title: t('casePipeline.nav.overview', 'نظرة عامة'), href: ROUTES.dashboard.home, isActive: false },
    { title: t('casePipeline.nav.cases', 'القضايا'), href: ROUTES.dashboard.cases.list, isActive: false },
    { title: t('casePipeline.nav.pipeline', 'مسار القضايا'), href: ROUTES.dashboard.cases.pipeline, isActive: true },
    { title: t('casePipeline.nav.brainstorm', 'العصف الذهني'), href: ROUTES.dashboard.notion, isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-2 sm:gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('casePipeline.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* Hero */}
        <ProductivityHero
          badge={t('casePipeline.hero.badge', 'مسار القضايا')}
          title={t('casePipeline.hero.boardTitle', 'لوحة القضايا')}
          type="cases"
        />

        {/* Controls & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Case Type Filter */}
            <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
              <SelectTrigger className="w-[180px] h-10 rounded-xl">
                <SelectValue placeholder={t('casePipeline.selectType', 'نوع القضية')} />
              </SelectTrigger>
              <SelectContent>
                {caseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {isRTL ? type.label : type.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg px-3 bg-white shadow-sm"
              >
                <Kanban className="h-4 w-4 ms-2" />
                {t('casePipeline.board.boardView', 'لوحة')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: ROUTES.dashboard.cases.pipeline as any })}
                className="rounded-lg px-3"
              >
                <List className="h-4 w-4 ms-2" />
                {t('casePipeline.board.listView', 'قائمة')}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <Scale className="w-3 h-3 text-emerald-500" />
              {analytics.totalCases} {t('casePipeline.board.cases', 'قضية')}
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <DollarSign className="w-3 h-3 text-emerald-500" />
              {(analytics.totalValue / 1000).toFixed(0)}K {t('casePipeline.sar', 'ر.س')}
            </Badge>
            {analytics.urgentCases > 0 && (
              <Badge variant="outline" className="px-3 py-1.5 gap-2 border-red-200 text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {analytics.urgentCases} {t('casePipeline.board.urgent', 'عاجل')}
              </Badge>
            )}
            {analytics.staleCases > 0 && (
              <Badge variant="outline" className="px-3 py-1.5 gap-2 border-orange-200 text-orange-600">
                <Clock className="w-3 h-3" />
                {analytics.staleCases} {t('casePipeline.board.needsAttention', 'تحتاج متابعة')}
              </Badge>
            )}

            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
              <Link to={ROUTES.dashboard.cases.new}>
                <Plus className="h-4 w-4 ms-2" />
                {t('casePipeline.board.newCase', 'قضية جديدة')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Board Content */}
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
        ) : isError ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('casePipeline.board.errorLoading', 'خطأ في التحميل')}</h3>
            <p className="text-slate-500 mb-4">{error?.message}</p>
            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
              {t('common.retry', 'إعادة المحاولة')}
            </Button>
          </div>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            {pipeline.stages.map((stage) => {
              const totals = getStageTotals(stage.id)
              const stageCases = casesByStage[stage.id] || []
              const stagePercent = analytics.totalCases > 0
                ? Math.round((totals.count / analytics.totalCases) * 100)
                : 0

              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  {/* Stage Header */}
                  <div
                    className="p-4 rounded-t-xl text-white font-semibold"
                    style={{ backgroundColor: stage.color }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span>{isRTL ? stage.nameAr : stage.name}</span>
                        {stage.isMandatory && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Star className="w-4 h-4 text-yellow-300" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('casePipeline.mandatory', 'إلزامي')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <Badge className="bg-white/20 text-white border-0">
                        {totals.count}
                      </Badge>
                    </div>
                    {/* Stage progress bar */}
                    <Progress
                      value={stagePercent}
                      className="h-1.5 bg-white/20"
                    />
                  </div>

                  {/* Stage Value */}
                  <div className="bg-slate-100 px-4 py-2 text-xs text-slate-600 border-x border-slate-200 flex justify-between items-center">
                    <span>
                      {totals.value > 0 ? `${totals.value.toLocaleString('ar-SA')} ${t('casePipeline.sar', 'ر.س')}` : t('casePipeline.board.noValue', 'لا قيمة')}
                    </span>
                    {totals.overdueCases > 0 && (
                      <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                        {totals.overdueCases} {t('casePipeline.board.overdue', 'متأخر')}
                      </Badge>
                    )}
                  </div>

                  {/* Droppable Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                    className={cn(
                      'min-h-[400px] p-3 rounded-b-xl border border-t-0 transition-colors',
                      draggedCaseId
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    {stageCases.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm py-12">
                        <Scale className="h-8 w-8 opacity-30 mb-2" />
                        <span>{t('casePipeline.board.dragCasesHere', 'اسحب القضايا هنا')}</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stageCases.map((caseItem) => (
                          <CaseCard
                            key={caseItem._id}
                            caseItem={caseItem}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedCaseId === caseItem._id}
                            isRTL={isRTL}
                            locale={locale}
                            onOpenCase={handleOpenCase}
                            onOpenPipeline={handleOpenPipeline}
                            t={t}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Main>
    </>
  )
}
