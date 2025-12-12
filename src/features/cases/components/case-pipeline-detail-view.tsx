import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  Scale,
  Search,
  Bell,
  AlertCircle,
  MoreHorizontal,
  DollarSign,
  User,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Lightbulb,
  CheckSquare,
  Gavel,
  Building2,
  Flag,
  ArrowRight,
  ArrowLeft,
  Play,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCase, useUpdateCase } from '@/hooks/useCasesAndClients'
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
  CardHeader,
  CardTitle,
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
import { CasePipelineSidebar } from './case-pipeline-sidebar'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { differenceInDays, format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  getCasePipeline,
  caseTypes,
  caseOutcomes,
  caseEndReasons,
} from '../data/case-pipeline-schema'

// Main Pipeline Detail View Component
export function CasePipelineDetailView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const locale = isRTL ? ar : enUS
  const params = useParams({ strict: false })
  const navigate = useNavigate()

  // Get caseId from URL params
  const caseId = (params as { caseId?: string }).caseId || ''

  // State
  const [endCaseDialogOpen, setEndCaseDialogOpen] = useState(false)
  const [endOutcome, setEndOutcome] = useState<string>('settled')
  const [endReason, setEndReason] = useState<string>('')
  const [endNotes, setEndNotes] = useState<string>('')
  const [finalAmount, setFinalAmount] = useState<string>('')

  // Fetch case data
  const { data: selectedCase, isLoading, isError, error, refetch, isFetching } = useCase(caseId)
  const { mutate: updateCase, isPending: isUpdatingCase } = useUpdateCase()

  // Get current pipeline configuration
  const currentPipeline = useMemo(() => {
    if (selectedCase) {
      return getCasePipeline(selectedCase.category || 'other')
    }
    return getCasePipeline('labor')
  }, [selectedCase])

  // Get current stage index
  const currentStageIndex = useMemo(() => {
    if (!selectedCase) return 0
    const stageId = selectedCase.currentStage || selectedCase.pipelineStage || 'filing'
    const index = currentPipeline.stages.findIndex(s => s.id === stageId)
    return index >= 0 ? index : 0
  }, [selectedCase, currentPipeline])

  // Handle moving case to a stage
  const handleMoveToStage = (stageId: string) => {
    if (!caseId) return

    updateCase({
      id: caseId,
      data: {
        currentStage: stageId,
        pipelineStage: stageId,
        stageEnteredAt: new Date().toISOString(),
      } as any,
    }, {
      onSuccess: () => {
        refetch()
      }
    })
  }

  // Handle moving to next/previous stage
  const handleMoveNext = () => {
    if (currentStageIndex < currentPipeline.stages.length - 1) {
      const nextStage = currentPipeline.stages[currentStageIndex + 1]
      handleMoveToStage(nextStage.id)
    }
  }

  const handleMovePrevious = () => {
    if (currentStageIndex > 0) {
      const prevStage = currentPipeline.stages[currentStageIndex - 1]
      handleMoveToStage(prevStage.id)
    }
  }

  // Handle end case
  const handleOpenEndCase = () => {
    if (caseId) {
      setEndCaseDialogOpen(true)
    }
  }

  const handleEndCase = () => {
    if (!caseId) return

    updateCase({
      id: caseId,
      data: {
        status: 'closed',
        outcome: endOutcome as any,
        endReason,
        endNotes,
        finalAmount: finalAmount ? parseFloat(finalAmount) : undefined,
        endDate: new Date().toISOString(),
      } as any,
    }, {
      onSuccess: () => {
        refetch()
        setEndCaseDialogOpen(false)
        setEndOutcome('settled')
        setEndReason('')
        setEndNotes('')
        setFinalAmount('')
      }
    })
  }

  // Handle back to list
  const handleBackToList = () => {
    navigate({ to: '/dashboard/cases/pipeline' })
  }

  // Calculate days in current stage
  const daysInCurrentStage = useMemo(() => {
    if (!selectedCase) return 0
    return differenceInDays(
      new Date(),
      new Date(selectedCase.stageEnteredAt || selectedCase.updatedAt || selectedCase.createdAt)
    )
  }, [selectedCase])

  // Get category label
  const getCategoryLabel = (category: string) => {
    const type = caseTypes.find(t => t.value === category)
    return type ? (isRTL ? type.label : type.labelEn) : category
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
        {/* Back Button & Header */}
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="text-slate-600 hover:text-slate-800"
          >
            {isRTL ? <ChevronRight className="h-4 w-4 ms-1" /> : <ChevronLeft className="h-4 w-4 me-1" />}
            {t('casePipeline.backToList', 'العودة للقائمة')}
          </Button>
        </div>

        {/* Header */}
        <ProductivityHero badge={t('casePipeline.badge', 'مسار القضية')} title={selectedCase?.title || t('casePipeline.title', 'مسار القضية')} type="cases" />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading State */}
            {isLoading ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex gap-4 overflow-x-auto">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-24 w-48 flex-shrink-0 rounded-xl" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : isError ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
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
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button
                      onClick={() => refetch()}
                      className="bg-emerald-500 hover:bg-emerald-600"
                      disabled={isFetching}
                    >
                      {isFetching ? (
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 me-2" />
                      )}
                      {t('casePipeline.retry', 'إعادة المحاولة')}
                    </Button>
                    <Button variant="outline" onClick={handleBackToList}>
                      {t('casePipeline.backToList', 'العودة للقائمة')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : selectedCase ? (
              <>
                {/* Case Info Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Scale className="h-5 w-5 text-emerald-500" />
                          {selectedCase.title}
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{selectedCase.caseNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-100 text-slate-700 border-0">
                          {getCategoryLabel(selectedCase.category)}
                        </Badge>
                        <Badge className={cn(
                          "border-0",
                          selectedCase.priority === 'critical' && "bg-red-100 text-red-700",
                          selectedCase.priority === 'high' && "bg-orange-100 text-orange-700",
                          selectedCase.priority === 'medium' && "bg-amber-100 text-amber-700",
                          selectedCase.priority === 'low' && "bg-green-100 text-green-700",
                        )}>
                          {t(`casePipeline.priority.${selectedCase.priority}`, selectedCase.priority)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/cases/${selectedCase._id}`}>
                                <Scale className="h-4 w-4 ms-2" />
                                {t('casePipeline.viewCase', 'عرض القضية')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/cases/${selectedCase._id}/notion`}>
                                <Lightbulb className="h-4 w-4 ms-2 text-emerald-500" />
                                {t('casePipeline.openBrainstorm', 'العصف الذهني')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleOpenEndCase}>
                              <CheckCircle className="h-4 w-4 ms-2 text-purple-500" />
                              {t('casePipeline.endCase', 'إنهاء القضية')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Case Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {/* Plaintiff */}
                      {(selectedCase.plaintiffName || selectedCase.laborCaseDetails?.plaintiff?.name) && (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <User className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.plaintiff', 'المدعي')}</p>
                            <p className="font-medium text-slate-700 truncate">
                              {selectedCase.plaintiffName || selectedCase.laborCaseDetails?.plaintiff?.name}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Defendant */}
                      {(selectedCase.defendantName || selectedCase.laborCaseDetails?.company?.name) && (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <Building2 className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.defendant', 'المدعى عليه')}</p>
                            <p className="font-medium text-slate-700 truncate">
                              {selectedCase.defendantName || selectedCase.laborCaseDetails?.company?.name}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Court */}
                      {selectedCase.court && (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <Gavel className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.court', 'المحكمة')}</p>
                            <p className="font-medium text-slate-700 truncate">{selectedCase.court}</p>
                          </div>
                        </div>
                      )}
                      {/* Claim Amount */}
                      {selectedCase.claimAmount > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.claimAmount', 'مبلغ المطالبة')}</p>
                            <p className="font-medium text-emerald-600">
                              {selectedCase.claimAmount.toLocaleString('ar-SA')} {t('casePipeline.sar', 'ر.س')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next Hearing */}
                    {selectedCase.nextHearing && (
                      <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-xl">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {t('casePipeline.nextHearing', 'الجلسة القادمة')}: {format(new Date(selectedCase.nextHearing), 'dd MMMM yyyy', { locale })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pipeline Stages Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-500" />
                        {t('casePipeline.caseJourney', 'مسار القضية')}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {daysInCurrentStage} {t('casePipeline.daysInStage', 'يوم في هذه المرحلة')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Pipeline Visualization */}
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200 rounded-full" />
                      <div
                        className="absolute top-8 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${((currentStageIndex) / (currentPipeline.stages.length - 1)) * 100}%`,
                          direction: 'ltr'
                        }}
                      />

                      {/* Stages */}
                      <div className="relative flex justify-between">
                        {currentPipeline.stages.map((stage, index) => {
                          const isCompleted = index < currentStageIndex
                          const isCurrent = index === currentStageIndex
                          const isFuture = index > currentStageIndex

                          return (
                            <div key={stage.id} className="flex flex-col items-center" style={{ width: `${100 / currentPipeline.stages.length}%` }}>
                              {/* Stage Circle */}
                              <button
                                onClick={() => handleMoveToStage(stage.id)}
                                disabled={isUpdatingCase}
                                className={cn(
                                  "w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all relative z-10",
                                  isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                                  isCurrent && "bg-white border-emerald-500 text-emerald-600 ring-4 ring-emerald-100",
                                  isFuture && "bg-white border-slate-300 text-slate-400 hover:border-emerald-300 hover:text-emerald-500"
                                )}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-8 h-8" />
                                ) : isCurrent ? (
                                  <Play className="w-6 h-6" />
                                ) : (
                                  <span className="text-lg font-bold">{index + 1}</span>
                                )}
                              </button>

                              {/* Stage Name */}
                              <div className="mt-3 text-center">
                                <p className={cn(
                                  "font-semibold text-sm",
                                  isCurrent ? "text-emerald-600" : isCompleted ? "text-slate-700" : "text-slate-400"
                                )}>
                                  {isRTL ? stage.nameAr : stage.name}
                                </p>
                                {stage.isMandatory && (
                                  <Badge className="mt-1 bg-amber-100 text-amber-700 border-0 text-xs">
                                    {t('casePipeline.mandatory', 'إلزامي')}
                                  </Badge>
                                )}
                                {stage.canEnd && isCurrent && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge className="mt-1 bg-purple-100 text-purple-700 border-0 text-xs gap-1">
                                          <Flag className="h-3 w-3" />
                                          {t('casePipeline.canEnd', 'يمكن الإنهاء')}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t('casePipeline.canEndHere', 'يمكن إنهاء القضية في هذه المرحلة')}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={handleMovePrevious}
                        disabled={currentStageIndex === 0 || isUpdatingCase}
                        className="rounded-xl gap-2"
                      >
                        {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                        {t('casePipeline.previousStage', 'المرحلة السابقة')}
                      </Button>

                      <Button
                        onClick={handleOpenEndCase}
                        variant="outline"
                        className="rounded-xl gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {t('casePipeline.endCase', 'إنهاء القضية')}
                      </Button>

                      <Button
                        onClick={handleMoveNext}
                        disabled={currentStageIndex === currentPipeline.stages.length - 1 || isUpdatingCase}
                        className="rounded-xl gap-2 bg-emerald-500 hover:bg-emerald-600"
                      >
                        {t('casePipeline.nextStage', 'المرحلة التالية')}
                        {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Current Stage Description */}
                    {currentPipeline.stages[currentStageIndex] && (
                      <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 mb-1">
                          {t('casePipeline.currentStage', 'المرحلة الحالية')}: {isRTL ? currentPipeline.stages[currentStageIndex].nameAr : currentPipeline.stages[currentStageIndex].name}
                        </h4>
                        {currentPipeline.stages[currentStageIndex].descriptionAr && (
                          <p className="text-sm text-emerald-700">
                            {isRTL
                              ? currentPipeline.stages[currentStageIndex].descriptionAr
                              : currentPipeline.stages[currentStageIndex].description}
                          </p>
                        )}
                        {currentPipeline.stages[currentStageIndex].maxDurationDays && (
                          <p className="text-xs text-emerald-600 mt-2">
                            {t('casePipeline.expectedDuration', 'المدة المتوقعة')}: {currentPipeline.stages[currentStageIndex].maxDurationDays} {t('casePipeline.days', 'يوم')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pipeline Notes */}
                    {currentPipeline.notesAr && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-700">
                          <AlertTriangle className="h-4 w-4 inline ms-1" />
                          {isRTL ? currentPipeline.notesAr : currentPipeline.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Linked Items */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50">
                        <CheckSquare className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-navy">{selectedCase.tasksCount || 0}</p>
                        <p className="text-xs text-slate-500">{t('casePipeline.tasks', 'مهام')}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50">
                        <Lightbulb className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-navy">{selectedCase.notionPagesCount || 0}</p>
                        <p className="text-xs text-slate-500">{t('casePipeline.notionPages', 'صفحات')}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-50">
                        <Calendar className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-navy">{selectedCase.eventsCount || 0}</p>
                        <p className="text-xs text-slate-500">{t('casePipeline.events', 'أحداث')}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50">
                        <FileText className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-navy">{selectedCase.notes?.length || 0}</p>
                        <p className="text-xs text-slate-500">{t('casePipeline.notes', 'ملاحظات')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link to={`/dashboard/cases/${selectedCase._id}`}>
                      <Scale className="h-4 w-4 ms-2" />
                      {t('casePipeline.viewCase', 'عرض تفاصيل القضية')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link to={`/dashboard/cases/${selectedCase._id}/notion`}>
                      <Lightbulb className="h-4 w-4 ms-2 text-emerald-500" />
                      {t('casePipeline.openBrainstorm', 'العصف الذهني')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link to="/dashboard/cases/pipeline">
                      <ListChecks className="h-4 w-4 ms-2 text-blue-500" />
                      {t('casePipeline.viewAllPipelines', 'جميع القضايا')}
                    </Link>
                  </Button>
                </div>
              </>
            ) : null}
          </div>

          {/* SIDEBAR */}
          <CasePipelineSidebar
            context="pipeline"
            selectedCaseType={selectedCase?.category || 'labor'}
            selectedCase={selectedCase}
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
                      {isRTL ? outcome.label : outcome.labelEn}
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
                      {isRTL ? reason.label : reason.labelEn}
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
