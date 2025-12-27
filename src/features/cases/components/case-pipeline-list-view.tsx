import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCases } from '@/hooks/useCasesAndClients'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { ROUTES } from '@/constants/routes'
import {
  Search, Bell, AlertCircle, MoreHorizontal, ChevronLeft,
  Eye, Edit3, SortAsc, X, Scale, MapPin,
  FileText, User, Calendar, Building2, DollarSign,
  CheckCircle, Clock, AlertTriangle, Play, Gavel,
  Kanban, List, StickyNote, Lightbulb
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
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
import { caseTypes, getCasePipeline } from '../data/case-pipeline-schema'
import { cn } from '@/lib/utils'
import { CasePipelineSidebar } from './case-pipeline-sidebar'

export function CasePipelineListView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updatedAt')

  // Fetch all cases
  const { data: casesData, isLoading, isError, error, refetch } = useCases()

  // Helper function to format dates based on current locale
  const formatDualDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return { arabic: t('casePipeline.list.notSet', 'غير محدد'), english: t('casePipeline.list.notSet', 'Not set') }
    const date = new Date(dateString)
    return {
      arabic: format(date, 'd MMMM', { locale: arSA }),
      english: format(date, 'MMM d, yyyy', { locale: enUS })
    }
  }, [t])

  // Transform and filter API data
  const cases = useMemo(() => {
    if (!casesData?.cases) return []

    let filteredCases = casesData.cases

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredCases = filteredCases.filter((c: any) =>
        c.title?.toLowerCase().includes(query) ||
        c.caseNumber?.toLowerCase().includes(query) ||
        c.clientId?.name?.toLowerCase().includes(query) ||
        c.plaintiffName?.toLowerCase().includes(query) ||
        c.defendantName?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filteredCases = filteredCases.filter((c: any) => c.category === categoryFilter)
    }

    // Status filter
    if (statusFilter === 'active') {
      filteredCases = filteredCases.filter((c: any) =>
        c.status !== 'closed' && c.status !== 'completed' && c.status !== 'archived' &&
        c.outcome !== 'won' && c.outcome !== 'lost' && c.outcome !== 'settled'
      )
    } else if (statusFilter === 'closed') {
      filteredCases = filteredCases.filter((c: any) =>
        c.status === 'closed' || c.status === 'completed' ||
        c.outcome === 'won' || c.outcome === 'lost' || c.outcome === 'settled'
      )
    }

    // Sort
    filteredCases = [...filteredCases].sort((a: any, b: any) => {
      if (sortBy === 'updatedAt') {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      } else if (sortBy === 'createdAt') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      } else if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      } else if (sortBy === 'claimAmount') {
        return (b.claimAmount || 0) - (a.claimAmount || 0)
      }
      return 0
    })

    return filteredCases.map((caseItem: any) => {
      const pipeline = getCasePipeline(caseItem.category)
      const currentStageId = caseItem.currentStage || caseItem.pipelineStage || 'filing'
      const currentStageIndex = pipeline.stages.findIndex(s => s.id === currentStageId)
      const currentStage = pipeline.stages[currentStageIndex >= 0 ? currentStageIndex : 0]
      const progressPercent = ((currentStageIndex >= 0 ? currentStageIndex : 0) / (pipeline.stages.length - 1)) * 100

      return {
        id: caseItem._id,
        _id: caseItem._id,
        title: caseItem.title || caseItem.caseNumber || t('casePipeline.list.untitled', 'بدون عنوان'),
        caseNumber: caseItem.caseNumber,
        category: caseItem.category || 'other',
        client: caseItem.clientId?.name || t('casePipeline.list.noClient', 'بدون عميل'),
        plaintiffName: caseItem.plaintiffName || caseItem.laborCaseDetails?.plaintiff?.name,
        defendantName: caseItem.defendantName || caseItem.laborCaseDetails?.company?.name,
        court: caseItem.court,
        status: caseItem.status || 'active',
        outcome: caseItem.outcome,
        priority: caseItem.priority || 'medium',
        claimAmount: caseItem.claimAmount || 0,
        currentStage,
        currentStageIndex,
        progressPercent,
        totalStages: pipeline.stages.length,
        nextHearing: caseItem.nextHearing,
        updatedAt: caseItem.updatedAt,
        createdAt: caseItem.createdAt,
        updatedAtFormatted: formatDualDate(caseItem.updatedAt),
        createdAtFormatted: formatDualDate(caseItem.createdAt),
        notes: caseItem.notes,
        latestNote: caseItem.notes?.[0]?.text || caseItem.notes?.[caseItem.notes?.length - 1]?.text,
      }
    })
  }, [casesData, searchQuery, categoryFilter, statusFilter, sortBy, t, formatDualDate])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }, [])

  // Navigation handlers
  const handleOpenPipeline = useCallback((caseId: string) => {
    console.log('[CasePipelineListView] 🚀 Opening pipeline for case:', {
      caseId,
      navigateTo: ROUTES.dashboard.cases.casePipeline(caseId),
      timestamp: new Date().toISOString(),
    })
    navigate({ to: ROUTES.dashboard.cases.casePipeline(caseId) as any })
  }, [navigate])

  const handleViewCase = useCallback((caseId: string) => {
    console.log('[CasePipelineListView] 🚀 Opening case details:', {
      caseId,
      navigateTo: ROUTES.dashboard.cases.detail(caseId),
    })
    navigate({ to: ROUTES.dashboard.cases.detail(caseId) as any })
  }, [navigate])

  // Get status badge
  const getStatusBadge = useCallback((caseItem: any) => {
    if (caseItem.outcome === 'won') {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-md px-2 gap-1"><CheckCircle className="h-3 w-3" />{t('casePipeline.outcome.won', 'كسب')}</Badge>
    }
    if (caseItem.outcome === 'lost') {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-2 gap-1"><AlertCircle className="h-3 w-3" />{t('casePipeline.outcome.lost', 'خسارة')}</Badge>
    }
    if (caseItem.outcome === 'settled') {
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-md px-2 gap-1"><CheckCircle className="h-3 w-3" />{t('casePipeline.outcome.settled', 'تسوية')}</Badge>
    }
    if (caseItem.status === 'closed' || caseItem.status === 'completed') {
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 rounded-md px-2">{t('casePipeline.status.closed', 'مغلق')}</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2 gap-1"><Play className="h-3 w-3" />{t('casePipeline.status.active', 'نشط')}</Badge>
  }, [t])

  // Get priority badge
  const getPriorityBadge = useCallback((priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge className={cn("border-0 rounded-md px-2", styles[priority] || styles.medium)}>
      {t(`casePipeline.priority.${priority}`, priority)}
    </Badge>
  }, [t])

  // Get category label
  const getCategoryLabel = useCallback((category: string) => {
    const type = caseTypes.find(t => t.value === category)
    return type ? (isRTL ? type.label : type.labelEn) : category
  }, [isRTL])

  const topNav = [
    { title: t('casePipeline.nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('casePipeline.nav.tasks', 'المهام'), href: ROUTES.dashboard.tasks.list, isActive: false },
    { title: t('casePipeline.nav.cases', 'القضايا'), href: ROUTES.dashboard.cases.list, isActive: false },
    { title: t('casePipeline.nav.pipeline', 'مسار القضايا'), href: ROUTES.dashboard.cases.pipeline, isActive: true },
  ]

  // Calculate analytics for sidebar
  const analytics = useMemo(() => {
    if (!casesData?.cases) return undefined

    const allCases = casesData.cases
    const activeCases = allCases.filter((c: any) =>
      c.status !== 'closed' && c.status !== 'completed' && c.status !== 'archived' &&
      c.outcome !== 'won' && c.outcome !== 'lost' && c.outcome !== 'settled'
    )
    const wonCases = allCases.filter((c: any) => c.outcome === 'won')
    const lostCases = allCases.filter((c: any) => c.outcome === 'lost')
    const settledCases = allCases.filter((c: any) => c.outcome === 'settled')

    const totalCompleted = wonCases.length + lostCases.length + settledCases.length
    const winRate = totalCompleted > 0 ? ((wonCases.length + settledCases.length) / totalCompleted * 100).toFixed(0) : '0'

    const totalClaimAmount = allCases.reduce((sum: number, c: any) => sum + (c.claimAmount || 0), 0)

    return {
      totalCases: allCases.length,
      wonCases: wonCases.length,
      lostCases: lostCases.length,
      settledCases: settledCases.length,
      ongoingCases: activeCases.length,
      staleCases: 0, // Would need stageEnteredAt to calculate
      urgentCases: allCases.filter((c: any) => c.priority === 'critical' || c.priority === 'high').length,
      winRate: `${winRate}%`,
      totalClaimAmount,
    }
  }, [casesData])

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder={t('casePipeline.list.search', 'البحث...')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD */}
        <ProductivityHero
          badge={t('casePipeline.hero.badge', 'مسار القضايا')}
          title={t('casePipeline.hero.title', 'تتبع تقدم القضايا')}
          type="cases"
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    type="text"
                    placeholder={t('casePipeline.list.searchPlaceholder', 'ابحث عن قضية...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                    <SelectValue placeholder={t('casePipeline.list.caseType', 'نوع القضية')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('casePipeline.list.allTypes', 'جميع الأنواع')}</SelectItem>
                    {caseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {isRTL ? type.label : type.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                    <SelectValue placeholder={t('casePipeline.list.status', 'الحالة')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('casePipeline.list.allStatuses', 'جميع الحالات')}</SelectItem>
                    <SelectItem value="active">{t('casePipeline.status.active', 'نشط')}</SelectItem>
                    <SelectItem value="closed">{t('casePipeline.status.closed', 'منتهي')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                    <SortAsc className="h-4 w-4 ms-2 text-slate-500" />
                    <SelectValue placeholder={t('casePipeline.list.sortBy', 'الترتيب')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">{t('casePipeline.list.lastUpdated', 'آخر تحديث')}</SelectItem>
                    <SelectItem value="createdAt">{t('casePipeline.list.createdAt', 'تاريخ الإنشاء')}</SelectItem>
                    <SelectItem value="title">{t('casePipeline.list.name', 'الاسم')}</SelectItem>
                    <SelectItem value="claimAmount">{t('casePipeline.list.claimAmount', 'مبلغ المطالبة')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <X className="h-4 w-4 ms-2" aria-hidden="true" />
                    {t('casePipeline.list.clearFilters', 'مسح الفلاتر')}
                  </Button>
                )}

                {/* View Mode Toggle */}
                <div className="flex bg-slate-100 rounded-xl p-1 ms-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg px-3 bg-white shadow-sm"
                  >
                    <List className="h-4 w-4 ms-2" />
                    {t('casePipeline.list.listView', 'قائمة')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: ROUTES.dashboard.cases.pipelineBoard })}
                    className="rounded-lg px-3"
                  >
                    <Kanban className="h-4 w-4 ms-2" />
                    {t('casePipeline.list.boardView', 'لوحة')}
                  </Button>
                </div>
              </div>
            </div>

            {/* MAIN CASES LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  {t('casePipeline.list.casesTitle', 'القضايا ومسارها')}
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {t('casePipeline.list.caseCount', { count: cases.length }, `${cases.length} قضية`)}
                </Badge>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-3 w-full rounded-full mb-4" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </>
                )}

                {/* Error State */}
                {isError && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('casePipeline.list.errorLoading', 'حدث خطأ في التحميل')}</h3>
                    <p className="text-slate-500 mb-4">{error?.message || t('casePipeline.list.connectionError', 'تعذر الاتصال بالخادم')}</p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      {t('casePipeline.list.retry', 'إعادة المحاولة')}
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && cases.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Scale className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('casePipeline.list.noCases', 'لا توجد قضايا')}</h3>
                    <p className="text-slate-500 mb-4">{t('casePipeline.list.noCasesDescription', 'أنشئ قضية جديدة لتتبع مسارها')}</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to={ROUTES.dashboard.cases.new}>
                        {t('casePipeline.list.newCase', 'قضية جديدة')}
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Cases List */}
                {!isLoading && !isError && cases.map((caseItem, index) => (
                  <div
                    key={caseItem.id}
                    className="bg-[#F8F9FA] rounded-2xl p-6 border transition-all group animate-in fade-in slide-in-from-bottom-4 border-slate-100 hover:border-emerald-200 hover:shadow-md hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center shadow-sm border border-emerald-100">
                          <Scale className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-navy text-lg">{caseItem.title}</h4>
                            {getStatusBadge(caseItem)}
                            {getPriorityBadge(caseItem.priority)}
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 text-sm flex-wrap">
                            {caseItem.caseNumber && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {caseItem.caseNumber}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Scale className="h-3.5 w-3.5" />
                              {getCategoryLabel(caseItem.category)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {caseItem.client}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleOpenPipeline(caseItem.id)}>
                            <MapPin className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                            {t('casePipeline.list.viewPipeline', 'عرض المسار')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewCase(caseItem.id)}>
                            <Eye className="h-4 w-4 ms-2" />
                            {t('casePipeline.list.viewCase', 'عرض القضية')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate({ to: ROUTES.dashboard.cases.notion(caseItem.id) as any })}>
                            <Lightbulb className="h-4 w-4 ms-2 text-emerald-500" />
                            {t('casePipeline.list.brainstorm', 'العصف الذهني')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate({ to: ROUTES.dashboard.cases.detail(caseItem.id) as any })}>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" />
                            {t('casePipeline.list.editCase', 'تعديل القضية')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">{t('casePipeline.list.progress', 'التقدم')}</span>
                        <span className="text-xs font-medium text-emerald-600">
                          {caseItem.currentStageIndex + 1}/{caseItem.totalStages} - {isRTL ? caseItem.currentStage?.nameAr : caseItem.currentStage?.name}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${caseItem.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Case Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                      {caseItem.plaintiffName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.plaintiff', 'المدعي')}</p>
                            <p className="font-medium text-slate-700 truncate">{caseItem.plaintiffName}</p>
                          </div>
                        </div>
                      )}
                      {caseItem.defendantName && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.defendant', 'المدعى عليه')}</p>
                            <p className="font-medium text-slate-700 truncate">{caseItem.defendantName}</p>
                          </div>
                        </div>
                      )}
                      {caseItem.court && (
                        <div className="flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.court', 'المحكمة')}</p>
                            <p className="font-medium text-slate-700 truncate">{caseItem.court}</p>
                          </div>
                        </div>
                      )}
                      {caseItem.claimAmount > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-xs text-slate-500">{t('casePipeline.claimAmount', 'المطالبة')}</p>
                            <p className="font-medium text-emerald-600">{caseItem.claimAmount.toLocaleString('ar-SA')} {t('casePipeline.sar', 'ر.س')}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next Hearing Alert */}
                    {caseItem.nextHearing && (
                      <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg mb-4">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {t('casePipeline.nextHearing', 'الجلسة القادمة')}: {format(new Date(caseItem.nextHearing), 'dd MMMM yyyy', { locale: isRTL ? arSA : enUS })}
                        </span>
                      </div>
                    )}

                    {/* Latest Note */}
                    {caseItem.latestNote && (
                      <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700 mb-1">
                          <StickyNote className="h-4 w-4" />
                          <span className="text-xs font-bold">{t('casePipeline.list.lastNote', 'آخر ملاحظة')}</span>
                        </div>
                        <p className="text-sm text-amber-800 line-clamp-2">
                          {caseItem.latestNote}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        {/* Last Updated */}
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">{t('casePipeline.list.lastUpdated', 'آخر تحديث')}</div>
                          <div className="font-bold text-navy text-sm">{caseItem.updatedAtFormatted.arabic}</div>
                          <div className="text-xs text-slate-500">{caseItem.updatedAtFormatted.english}</div>
                        </div>
                        {/* Created Date */}
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">{t('casePipeline.list.createdAt', 'تاريخ الإنشاء')}</div>
                          <div className="font-bold text-slate-600 text-sm">{caseItem.createdAtFormatted.arabic}</div>
                          <div className="text-xs text-slate-500">{caseItem.createdAtFormatted.english}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleOpenPipeline(caseItem.id)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl px-6 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        <MapPin className="h-4 w-4 ms-2" />
                        {t('casePipeline.list.viewPipeline', 'عرض المسار')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 pt-0 text-center">
                <Button asChild variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                  <Link to={ROUTES.dashboard.cases.list}>
                    {t('casePipeline.list.viewAllCases', 'عرض جميع القضايا')}
                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <CasePipelineSidebar
            context="list"
            analytics={analytics}
          />
        </div>
      </Main>
    </>
  )
}
