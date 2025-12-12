import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus,
  Scale,
  TrendingUp,
  Search,
  Bell,
  AlertCircle,
  GripVertical,
  Phone,
  MoreHorizontal,
  ArrowUpRight,
  DollarSign,
  User,
  Clock,
  Target,
  Filter,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  ArrowUp,
  ArrowDown,
  FileText,
  Users,
  Lightbulb,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Building2,
  Flag,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCases, useUpdateCase } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CasePipelineSidebar } from './case-pipeline-sidebar'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  getCasePipeline,
  caseTypes,
  caseOutcomes,
  caseEndReasons,
  type CasePipelineStage,
  type CasePipelineCard,
  type CasePipelineConfig,
} from '../data/case-pipeline-schema'

// Analytics metric card component
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'emerald',
  subtitle,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red'
  subtitle?: string
}) {
  const { t } = useTranslation()
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-navy">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-2 rounded-xl', colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend === 'up' && (
              <>
                <ArrowUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600">{trendValue}</span>
              </>
            )}
            {trend === 'down' && (
              <>
                <ArrowDown className="w-3 h-3 text-red-500" />
                <span className="text-red-600">{trendValue}</span>
              </>
            )}
            {trend === 'neutral' && (
              <span className="text-slate-500">{trendValue}</span>
            )}
            <span className="text-slate-500 me-1">{t('casePipeline.fromLastMonth', 'من الشهر الماضي')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Case card component
function CaseCard({
  caseItem,
  onDragStart,
  onDragEnd,
  isDragging,
  onEndCase,
}: {
  caseItem: any
  onDragStart: (e: React.DragEvent, caseId: string) => void
  onDragEnd: () => void
  isDragging: boolean
  onEndCase: (caseId: string) => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? ar : enUS

  // Calculate days in current stage
  const daysInStage = differenceInDays(new Date(), new Date(caseItem.stageEnteredAt || caseItem.updatedAt || caseItem.createdAt))
  const isStale = daysInStage > 30 // Consider stale after 30 days in same stage
  const isUrgent = caseItem.priority === 'critical' || caseItem.priority === 'high'

  // Get priority badge style
  const getPriorityBadge = () => {
    switch (caseItem.priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 border-0 text-xs px-1.5">{t('casePipeline.priority.critical', 'حرج')}</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 border-0 text-xs px-1.5">{t('casePipeline.priority.high', 'عالي')}</Badge>
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700 border-0 text-xs px-1.5">{t('casePipeline.priority.medium', 'متوسط')}</Badge>
      default:
        return <Badge className="bg-green-100 text-green-700 border-0 text-xs px-1.5">{t('casePipeline.priority.low', 'منخفض')}</Badge>
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, caseItem._id)}
      onDragEnd={onDragEnd}
      className={cn(
        'bg-white p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing border transition-all',
        isDragging ? 'opacity-50 ring-2 ring-emerald-400 border-emerald-300' : 'border-transparent hover:border-emerald-300 hover:shadow-md',
        isStale && !isDragging && 'border-orange-200 bg-orange-50/50',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-navy text-sm">{caseItem.caseNumber || t('casePipeline.noCaseNumber', 'بدون رقم')}</span>
              {getPriorityBadge()}
            </div>
            <p className="text-sm text-slate-700 font-medium line-clamp-1 mt-0.5">{caseItem.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isUrgent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>{t('casePipeline.urgent', 'عاجل')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isStale && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Clock className="w-4 h-4 text-orange-500" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>{daysInStage} {t('casePipeline.daysInStage', 'يوم في هذه المرحلة')}</TooltipContent>
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
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/cases/${caseItem._id}`}>
                  <Scale className="h-4 w-4 ms-2" />
                  {t('casePipeline.viewCase', 'عرض القضية')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/cases/${caseItem._id}/notion`}>
                  <Lightbulb className="h-4 w-4 ms-2 text-emerald-500" />
                  {t('casePipeline.openBrainstorm', 'العصف الذهني')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEndCase(caseItem._id)}>
                <CheckCircle className="h-4 w-4 ms-2 text-purple-500" />
                {t('casePipeline.endCase', 'إنهاء القضية')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Parties */}
      <div className="space-y-1.5 mb-3 text-sm">
        {/* Plaintiff */}
        {(caseItem.plaintiffName || caseItem.laborCaseDetails?.plaintiff?.name) && (
          <div className="flex items-center gap-2 text-emerald-600">
            <User className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">
              <span className="text-slate-500">{t('casePipeline.plaintiff', 'المدعي')}:</span>{' '}
              {caseItem.plaintiffName || caseItem.laborCaseDetails?.plaintiff?.name}
            </span>
          </div>
        )}
        {/* Defendant */}
        {(caseItem.defendantName || caseItem.laborCaseDetails?.company?.name) && (
          <div className="flex items-center gap-2 text-red-600">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">
              <span className="text-slate-500">{t('casePipeline.defendant', 'المدعى عليه')}:</span>{' '}
              {caseItem.defendantName || caseItem.laborCaseDetails?.company?.name}
            </span>
          </div>
        )}
        {/* Client */}
        {caseItem.clientId?.name && (
          <div className="flex items-center gap-2 text-blue-600">
            <Users className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">
              <span className="text-slate-500">{t('casePipeline.client', 'العميل')}:</span>{' '}
              {caseItem.clientId.name}
            </span>
          </div>
        )}
      </div>

      {/* Court & Next Hearing */}
      {(caseItem.court || caseItem.nextHearing) && (
        <div className="space-y-1.5 mb-3 text-xs text-slate-500">
          {caseItem.court && (
            <div className="flex items-center gap-2">
              <Gavel className="h-3 w-3" aria-hidden="true" />
              <span className="truncate">{caseItem.court}</span>
            </div>
          )}
          {caseItem.nextHearing && (
            <div className="flex items-center gap-2 text-orange-600">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>{t('casePipeline.nextHearing', 'الجلسة القادمة')}: {new Date(caseItem.nextHearing).toLocaleDateString('ar-SA')}</span>
            </div>
          )}
        </div>
      )}

      {/* Latest Note Preview */}
      {caseItem.notes && caseItem.notes.length > 0 && (
        <div className="mb-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
          <div className="flex items-center gap-1 mb-1 text-slate-500">
            <FileText className="h-3 w-3" />
            <span>{t('casePipeline.latestNote', 'آخر ملاحظة')}</span>
          </div>
          <p className="line-clamp-2">{caseItem.notes[caseItem.notes.length - 1]?.text}</p>
        </div>
      )}

      {/* Linked Items */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(caseItem.tasksCount || 0) > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0.5">
                  <CheckSquare className="h-3 w-3 text-blue-500" />
                  {caseItem.tasksCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{caseItem.tasksCount} {t('casePipeline.tasks', 'مهام')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {(caseItem.notionPagesCount || 0) > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0.5">
                  <Lightbulb className="h-3 w-3 text-emerald-500" />
                  {caseItem.notionPagesCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{caseItem.notionPagesCount} {t('casePipeline.notionPages', 'صفحات')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {(caseItem.eventsCount || 0) > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0.5">
                  <Calendar className="h-3 w-3 text-purple-500" />
                  {caseItem.eventsCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{caseItem.eventsCount} {t('casePipeline.events', 'أحداث')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {(caseItem.remindersCount || 0) > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0.5">
                  <Bell className="h-3 w-3 text-amber-500" />
                  {caseItem.remindersCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{caseItem.remindersCount} {t('casePipeline.reminders', 'تذكيرات')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Footer: Amount & Time */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {caseItem.claimAmount > 0 && (
          <span className="text-emerald-600 font-semibold text-sm">
            {caseItem.claimAmount.toLocaleString('ar-SA')} {t('casePipeline.sar', 'ر.س')}
          </span>
        )}
        <span className="text-xs text-slate-500">
          {formatDistanceToNow(new Date(caseItem.createdAt), {
            addSuffix: true,
            locale,
          })}
        </span>
      </div>
    </div>
  )
}

// Main Pipeline View Component
export function CasePipelineView() {
  const { t, i18n } = useTranslation()
  const [selectedCaseType, setSelectedCaseType] = useState<string>('labor')
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [endCaseDialogOpen, setEndCaseDialogOpen] = useState(false)
  const [selectedCaseForEnd, setSelectedCaseForEnd] = useState<string | null>(null)
  const [endOutcome, setEndOutcome] = useState<string>('settled')
  const [endReason, setEndReason] = useState<string>('')
  const [endNotes, setEndNotes] = useState<string>('')
  const [finalAmount, setFinalAmount] = useState<string>('')

  // Fetch cases
  const { data: casesData, isLoading, isError, error, refetch } = useCases({
    category: selectedCaseType !== 'all' ? selectedCaseType : undefined,
  })

  const { mutate: updateCase, isPending: isUpdatingCase } = useUpdateCase()

  // Get current pipeline configuration
  const currentPipeline = useMemo(() => getCasePipeline(selectedCaseType), [selectedCaseType])

  // Group cases by stage
  const casesByStage = useMemo(() => {
    if (!casesData?.cases) return {}

    const grouped: Record<string, any[]> = {}

    // Initialize all stages with empty arrays
    currentPipeline.stages.forEach(stage => {
      grouped[stage.id] = []
    })

    // Group cases by their current stage
    casesData.cases.forEach((caseItem: any) => {
      // Determine case stage based on status or custom stage field
      let stageId = caseItem.currentStage || caseItem.pipelineStage

      // If no stage set, use filing as default
      if (!stageId || !grouped[stageId]) {
        stageId = 'filing'
      }

      // Apply priority filter
      if (filterPriority !== 'all' && caseItem.priority !== filterPriority) {
        return
      }

      if (grouped[stageId]) {
        grouped[stageId].push(caseItem)
      }
    })

    return grouped
  }, [casesData, currentPipeline, filterPriority])

  // Calculate analytics
  const analytics = useMemo(() => {
    const allCases = casesData?.cases || []

    const totalCases = allCases.length
    const totalClaimAmount = allCases.reduce((sum: number, c: any) => sum + (c.claimAmount || 0), 0)
    const avgClaimAmount = totalCases > 0 ? totalClaimAmount / totalCases : 0

    // Cases by outcome
    const wonCases = allCases.filter((c: any) => c.outcome === 'won').length
    const lostCases = allCases.filter((c: any) => c.outcome === 'lost').length
    const settledCases = allCases.filter((c: any) => c.outcome === 'settled').length
    const ongoingCases = allCases.filter((c: any) => c.outcome === 'ongoing' || !c.outcome).length

    // Win rate
    const completedCases = wonCases + lostCases + settledCases
    const winRate = completedCases > 0 ? ((wonCases / completedCases) * 100).toFixed(1) : '0'

    // Stale cases (>30 days in same stage)
    const staleCases = allCases.filter((c: any) => {
      const daysInStage = differenceInDays(new Date(), new Date(c.stageEnteredAt || c.updatedAt || c.createdAt))
      return daysInStage > 30
    }).length

    // Urgent cases
    const urgentCases = allCases.filter((c: any) =>
      c.priority === 'critical' || c.priority === 'high'
    ).length

    return {
      totalCases,
      totalClaimAmount,
      avgClaimAmount,
      wonCases,
      lostCases,
      settledCases,
      ongoingCases,
      winRate,
      staleCases,
      urgentCases,
    }
  }, [casesData])

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, caseId: string) => {
    setDraggedCaseId(caseId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (draggedCaseId) {
      // Update case stage
      updateCase({
        id: draggedCaseId,
        data: {
          currentStage: stageId,
          pipelineStage: stageId,
          stageEnteredAt: new Date().toISOString(),
        },
      }, {
        onSuccess: () => {
          refetch()
        }
      })
      setDraggedCaseId(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedCaseId(null)
  }

  // Handle end case
  const handleOpenEndCase = (caseId: string) => {
    setSelectedCaseForEnd(caseId)
    setEndCaseDialogOpen(true)
  }

  const handleEndCase = () => {
    if (!selectedCaseForEnd) return

    updateCase({
      id: selectedCaseForEnd,
      data: {
        status: 'closed',
        outcome: endOutcome as any,
        endReason,
        endNotes,
        finalAmount: finalAmount ? parseFloat(finalAmount) : undefined,
        endDate: new Date().toISOString(),
      },
    }, {
      onSuccess: () => {
        refetch()
        setEndCaseDialogOpen(false)
        setSelectedCaseForEnd(null)
        setEndOutcome('settled')
        setEndReason('')
        setEndNotes('')
        setFinalAmount('')
      }
    })
  }

  // Calculate stage totals
  const getStageTotals = (stageId: string) => {
    const cases = casesByStage[stageId] || []
    return {
      count: cases.length,
      value: cases.reduce((sum: number, c: any) => sum + (c.claimAmount || 0), 0),
    }
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
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('casePipeline.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Header */}
        <ProductivityHero badge={t('casePipeline.badge', 'مسار القضايا')} title={t('casePipeline.title', 'مسار القضايا')} type="cases" />

        {/* Case Type Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium text-slate-700">{t('casePipeline.selectCaseType', 'نوع القضية')}:</label>
          <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
            <SelectTrigger className="w-[200px] rounded-xl h-10">
              <SelectValue placeholder={t('casePipeline.selectCaseType', 'اختر نوع القضية')} />
            </SelectTrigger>
            <SelectContent>
              {caseTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {i18n.language === 'ar' ? type.label : type.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 ms-auto">
            <Filter className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span className="text-sm text-slate-600">{t('casePipeline.filter', 'تصفية')}:</span>
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px] rounded-xl h-9 text-sm">
              <SelectValue placeholder={t('casePipeline.priority', 'الأولوية')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('casePipeline.allPriorities', 'كل الأولويات')}</SelectItem>
              <SelectItem value="critical">{t('casePipeline.priority.critical', 'حرج')}</SelectItem>
              <SelectItem value="high">{t('casePipeline.priority.high', 'عالي')}</SelectItem>
              <SelectItem value="medium">{t('casePipeline.priority.medium', 'متوسط')}</SelectItem>
              <SelectItem value="low">{t('casePipeline.priority.low', 'منخفض')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            title={t('casePipeline.totalCases', 'إجمالي القضايا')}
            value={analytics.totalCases}
            icon={Scale}
            color="blue"
          />
          <MetricCard
            title={t('casePipeline.totalClaims', 'إجمالي المطالبات')}
            value={`${(analytics.totalClaimAmount / 1000).toFixed(0)}K`}
            subtitle={`${analytics.totalClaimAmount.toLocaleString('ar-SA')} ${t('casePipeline.sar', 'ر.س')}`}
            icon={DollarSign}
            color="emerald"
          />
          <MetricCard
            title={t('casePipeline.winRate', 'معدل الفوز')}
            value={`${analytics.winRate}%`}
            icon={TrendingUp}
            color="emerald"
          />
          <MetricCard
            title={t('casePipeline.ongoing', 'قيد النظر')}
            value={analytics.ongoingCases}
            icon={Timer}
            color="blue"
          />
          <MetricCard
            title={t('casePipeline.won', 'كسب')}
            value={analytics.wonCases}
            icon={CheckCircle}
            color="emerald"
          />
          <MetricCard
            title={t('casePipeline.needsAttention', 'تحتاج متابعة')}
            value={analytics.staleCases}
            subtitle={`${analytics.urgentCases} ${t('casePipeline.urgentLabel', 'عاجل')}`}
            icon={AlertTriangle}
            color={analytics.staleCases > 5 ? 'red' : 'orange'}
          />
        </div>

        {/* Quick Stats Row */}
        {analytics.totalCases > 0 && (
          <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              {analytics.wonCases} {t('casePipeline.won', 'كسب')}
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <XCircle className="w-3 h-3 text-red-500" />
              {analytics.lostCases} {t('casePipeline.lost', 'خسارة')}
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <Star className="w-3 h-3 text-purple-500" />
              {analytics.settledCases} {t('casePipeline.settled', 'تسوية')}
            </Badge>
          </div>
        )}

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT - Pipeline Board */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 w-80">
                    <Skeleton className="h-12 w-full rounded-t-xl" />
                    <div className="bg-slate-100 p-3 rounded-b-xl space-y-3 min-h-[400px]">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-40 w-full rounded-xl" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t('casePipeline.errorLoading', 'حدث خطأ أثناء التحميل')}
                </h3>
                <p className="text-slate-500 mb-4">
                  {error?.message || t('casePipeline.connectionError', 'تعذر الاتصال بالخادم')}
                </p>
                <Button
                  onClick={() => refetch()}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {t('casePipeline.retry', 'إعادة المحاولة')}
                </Button>
              </div>
            ) : (
              <div
                className="flex gap-4 overflow-x-auto pb-4"
                style={{ direction: 'rtl' }}
              >
                {currentPipeline.stages.map((stage, index) => {
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
                            <span>{i18n.language === 'ar' ? stage.nameAr : stage.name}</span>
                            {stage.canEnd && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Flag className="w-3 h-3 text-white/70" />
                                  </TooltipTrigger>
                                  <TooltipContent>{t('casePipeline.canEndHere', 'يمكن إنهاء القضية هنا')}</TooltipContent>
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
                          {totals.value > 0 ? `${totals.value.toLocaleString('ar-SA')} ${t('casePipeline.sar', 'ر.س')}` : t('casePipeline.noValue', 'لا قيمة')}
                        </span>
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
                          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                            {t('casePipeline.dragCasesHere', 'اسحب القضايا هنا')}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {stageCases.map((caseItem: any) => (
                              <CaseCard
                                key={caseItem._id}
                                caseItem={caseItem}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                isDragging={draggedCaseId === caseItem._id}
                                onEndCase={handleOpenEndCase}
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
          </div>

          {/* SIDEBAR */}
          <CasePipelineSidebar
            context="pipeline"
            selectedCaseType={selectedCaseType}
            analytics={analytics}
          />
        </div>
      </Main>

      {/* End Case Dialog */}
      <Dialog open={endCaseDialogOpen} onOpenChange={setEndCaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('casePipeline.endCaseDialog.title', 'إنهاء القضية')}</DialogTitle>
            <DialogDescription>
              {t('casePipeline.endCaseDialog.description', 'حدد نتيجة القضية وسبب الإنهاء')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('casePipeline.endCaseDialog.outcome', 'النتيجة')}</Label>
              <Select value={endOutcome} onValueChange={setEndOutcome}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {caseOutcomes.filter(o => o.value !== 'ongoing').map((outcome) => (
                    <SelectItem key={outcome.value} value={outcome.value}>
                      {i18n.language === 'ar' ? outcome.label : outcome.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('casePipeline.endCaseDialog.reason', 'سبب الإنهاء')}</Label>
              <Select value={endReason} onValueChange={setEndReason}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t('casePipeline.endCaseDialog.selectReason', 'اختر السبب')} />
                </SelectTrigger>
                <SelectContent>
                  {caseEndReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {i18n.language === 'ar' ? reason.label : reason.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('casePipeline.endCaseDialog.finalAmount', 'المبلغ النهائي (اختياري)')}</Label>
              <Input
                type="number"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('casePipeline.endCaseDialog.notes', 'ملاحظات')}</Label>
              <Textarea
                value={endNotes}
                onChange={(e) => setEndNotes(e.target.value)}
                placeholder={t('casePipeline.endCaseDialog.notesPlaceholder', 'أضف ملاحظات حول إنهاء القضية...')}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndCaseDialogOpen(false)} className="rounded-xl">
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleEndCase}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
              disabled={!endReason || isUpdatingCase}
            >
              {isUpdatingCase ? t('common.saving', 'جاري الحفظ...') : t('casePipeline.endCaseDialog.confirm', 'إنهاء القضية')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
