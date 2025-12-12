/**
 * Case Pipeline Board View - Kanban-style board showing cases by stage
 * Features:
 * - Cases displayed as cards in stage columns
 * - Case information and notes visible on cards
 * - Drag and drop between stages
 * - Quick actions on cards
 */

import { useState, useMemo } from 'react'
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Search, Bell, AlertCircle, MoreHorizontal,
  Eye, Edit3, Scale, MapPin, FileText, User,
  Calendar, Building2, DollarSign, CheckCircle, Clock,
  AlertTriangle, Play, Gavel, StickyNote, ChevronRight,
  Plus, Kanban, List, Lightbulb
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
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
import { CasePipelineSidebar } from './case-pipeline-sidebar'
import { toast } from 'sonner'

// Case card in the board
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
  notes?: Array<{ text: string; date: string }>
  latestNote?: string
  outcome?: string
}

export function CasePipelineBoardView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const locale = isRTL ? arSA : enUS

  // State
  const [selectedCaseType, setSelectedCaseType] = useState<string>('labor')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')

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
        latestNote: caseItem.notes?.[0]?.text || caseItem.notes?.[caseItem.notes.length - 1]?.text,
        outcome: caseItem.outcome,
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

  // Handle moving case to different stage
  const handleMoveToStage = (caseId: string, newStageId: string) => {
    updateCase({
      id: caseId,
      data: {
        currentStage: newStageId,
        pipelineStage: newStageId,
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
  }

  // Navigation handlers
  const handleOpenCase = (caseId: string) => {
    navigate({ to: `/dashboard/cases/${caseId}` as any })
  }

  const handleOpenPipeline = (caseId: string) => {
    navigate({ to: `/dashboard/cases/${caseId}/pipeline` as any })
  }

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    }
    return colors[priority] || colors.medium
  }

  // Calculate stage stats
  const getStageStats = (stageId: string) => {
    const cases = casesByStage[stageId] || []
    const totalAmount = cases.reduce((sum, c) => sum + c.claimAmount, 0)
    const overdueCases = cases.filter(c => c.daysInStage > 30).length
    return { count: cases.length, totalAmount, overdueCases }
  }

  const topNav = [
    { title: t('casePipeline.nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('casePipeline.nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: false },
    { title: t('casePipeline.nav.pipeline', 'مسار القضايا'), href: '/dashboard/cases/pipeline', isActive: true },
    { title: t('casePipeline.nav.brainstorm', 'العصف الذهني'), href: '/dashboard/notion', isActive: false },
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

        {/* Controls */}
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
                onClick={() => setViewMode('board')}
                className={cn(
                  "rounded-lg px-3",
                  viewMode === 'board' && "bg-white shadow-sm"
                )}
              >
                <Kanban className="h-4 w-4 ms-2" />
                {t('casePipeline.board.boardView', 'لوحة')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/dashboard/cases/pipeline' })}
                className="rounded-lg px-3"
              >
                <List className="h-4 w-4 ms-2" />
                {t('casePipeline.board.listView', 'قائمة')}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pipeline Note */}
            {pipeline.notesAr && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-3 w-3" />
                      {t('casePipeline.board.importantNote', 'ملاحظة هامة')}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{isRTL ? pipeline.notesAr : pipeline.notes}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
              <Link to="/dashboard/cases/create">
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
                <Skeleton className="h-96 w-full rounded-b-xl" />
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
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4" style={{ minWidth: pipeline.stages.length * 320 }}>
              {pipeline.stages.map((stage) => {
                const stats = getStageStats(stage.id)
                const cases = casesByStage[stage.id] || []

                return (
                  <div
                    key={stage.id}
                    className="flex-shrink-0 w-80 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200"
                  >
                    {/* Stage Header */}
                    <div
                      className="p-4 border-b-2"
                      style={{ borderBottomColor: stage.color }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <h3 className="font-bold text-slate-800">
                            {isRTL ? stage.nameAr : stage.name}
                          </h3>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          {stats.count}
                        </Badge>
                      </div>
                      {stage.isMandatory && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                          {t('casePipeline.mandatory', 'إلزامي')}
                        </Badge>
                      )}
                      {stats.overdueCases > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-0 text-xs ms-1">
                          {stats.overdueCases} {t('casePipeline.board.overdue', 'متأخر')}
                        </Badge>
                      )}
                    </div>

                    {/* Stage Cases */}
                    <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                      {cases.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <Scale className="h-8 w-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">{t('casePipeline.board.noCases', 'لا توجد قضايا')}</p>
                        </div>
                      ) : (
                        cases.map((caseItem) => (
                          <div
                            key={caseItem._id}
                            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                            onClick={() => handleOpenCase(caseItem._id)}
                          >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 truncate text-sm group-hover:text-emerald-600 transition-colors">
                                  {caseItem.title}
                                </h4>
                                {caseItem.caseNumber && (
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <FileText className="h-3 w-3" />
                                    {caseItem.caseNumber}
                                  </p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenCase(caseItem._id) }}>
                                    <Eye className="h-4 w-4 ms-2" />
                                    {t('casePipeline.viewCase', 'عرض القضية')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenPipeline(caseItem._id) }}>
                                    <MapPin className="h-4 w-4 ms-2 text-emerald-500" />
                                    {t('casePipeline.viewPipeline', 'عرض المسار')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate({ to: `/dashboard/cases/${caseItem._id}/notion` as any }) }}>
                                    <Lightbulb className="h-4 w-4 ms-2 text-purple-500" />
                                    {t('casePipeline.brainstorm', 'العصف الذهني')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {/* Move to Stage Options */}
                                  <div className="px-2 py-1 text-xs text-slate-500 font-medium">
                                    {t('casePipeline.board.moveTo', 'نقل إلى')}
                                  </div>
                                  {pipeline.stages
                                    .filter(s => s.id !== caseItem.currentStage)
                                    .map((targetStage) => (
                                      <DropdownMenuItem
                                        key={targetStage.id}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleMoveToStage(caseItem._id, targetStage.id)
                                        }}
                                      >
                                        <div
                                          className="w-2 h-2 rounded-full ms-2"
                                          style={{ backgroundColor: targetStage.color }}
                                        />
                                        {isRTL ? targetStage.nameAr : targetStage.name}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Priority Badge */}
                            <Badge className={cn("text-xs mb-2", getPriorityColor(caseItem.priority))}>
                              {t(`casePipeline.priority.${caseItem.priority}`, caseItem.priority)}
                            </Badge>

                            {/* Case Info */}
                            <div className="space-y-1.5 text-xs">
                              {caseItem.plaintiffName && (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <User className="h-3 w-3 text-emerald-500" />
                                  <span className="truncate">{caseItem.plaintiffName}</span>
                                </div>
                              )}
                              {caseItem.defendantName && (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Building2 className="h-3 w-3 text-red-500" />
                                  <span className="truncate">{caseItem.defendantName}</span>
                                </div>
                              )}
                              {caseItem.court && (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Gavel className="h-3 w-3 text-purple-500" />
                                  <span className="truncate">{caseItem.court}</span>
                                </div>
                              )}
                              {caseItem.claimAmount > 0 && (
                                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{caseItem.claimAmount.toLocaleString('ar-SA')} {t('casePipeline.sar', 'ر.س')}</span>
                                </div>
                              )}
                            </div>

                            {/* Next Hearing Alert */}
                            {caseItem.nextHearing && (
                              <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 rounded-lg p-2 mt-3 text-xs">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(caseItem.nextHearing), 'dd MMM', { locale })}</span>
                              </div>
                            )}

                            {/* Latest Note */}
                            {caseItem.latestNote && (
                              <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <div className="flex items-center gap-1 text-amber-700 mb-1">
                                  <StickyNote className="h-3 w-3" />
                                  <span className="text-xs font-medium">{t('casePipeline.board.lastNote', 'آخر ملاحظة')}</span>
                                </div>
                                <p className="text-xs text-amber-800 line-clamp-2">
                                  {caseItem.latestNote}
                                </p>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {caseItem.daysInStage} {t('casePipeline.days', 'يوم')}
                                </span>
                              </div>
                              <ChevronRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity", isRTL && "rotate-180")} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </Main>
    </>
  )
}
