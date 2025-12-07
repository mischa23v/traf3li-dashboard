import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useOnboardings, useOnboardingStats, useBulkDeleteOnboardings, useDeleteOnboarding } from '@/hooks/useOnboarding'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
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
import {
  Search, Bell, AlertCircle, Users, Plus, MoreHorizontal, ChevronLeft, Eye,
  Trash2, Edit3, Filter, X, Calendar, CheckCircle, Clock, UserCheck, ClipboardList,
  Target, Building2, UserCog, PlayCircle, PauseCircle, Award
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  type OnboardingStatus,
  type ProbationStatus,
  ONBOARDING_STATUS_LABELS,
  PROBATION_STATUS_LABELS,
} from '@/services/onboardingService'

export function OnboardingListView() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [probationFilter, setProbationFilter] = useState<string>('all')

  // Mutations
  const deleteOnboardingMutation = useDeleteOnboarding()
  const { mutate: bulkDeleteOnboardings } = useBulkDeleteOnboardings()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}
    if (statusFilter !== 'all') f.status = statusFilter
    if (probationFilter !== 'all') f.probationStatus = probationFilter
    if (searchQuery.trim()) f.search = searchQuery.trim()
    return f
  }, [statusFilter, probationFilter, searchQuery])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || probationFilter !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setProbationFilter('all')
  }

  // Fetch onboardings
  const { data: onboardingsData, isLoading, isError, error, refetch } = useOnboardings(filters)
  const { data: stats } = useOnboardingStats()

  // Transform API data
  const onboardings = useMemo(() => {
    if (!onboardingsData?.data) return []
    return onboardingsData.data
  }, [onboardingsData])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds([])
  }

  const handleSelectOnboarding = (onboardingId: string) => {
    if (selectedIds.includes(onboardingId)) {
      setSelectedIds(selectedIds.filter(id => id !== onboardingId))
    } else {
      setSelectedIds([...selectedIds, onboardingId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} برنامج تأهيل؟`)) {
      bulkDeleteOnboardings(selectedIds, {
        onSuccess: () => {
          setIsSelectionMode(false)
          setSelectedIds([])
        }
      })
    }
  }

  // Single onboarding actions
  const handleViewOnboarding = (onboardingId: string) => {
    navigate({ to: '/dashboard/hr/onboarding/$onboardingId', params: { onboardingId } })
  }

  const handleEditOnboarding = (onboardingId: string) => {
    navigate({ to: '/dashboard/hr/onboarding/new', search: { editId: onboardingId } })
  }

  const handleDeleteOnboarding = (onboardingId: string) => {
    if (confirm('هل أنت متأكد من حذف برنامج التأهيل هذا؟')) {
      deleteOnboardingMutation.mutate(onboardingId)
    }
  }

  // Status badge styling
  const getStatusBadge = (status: OnboardingStatus) => {
    const config = ONBOARDING_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
      slate: 'bg-slate-100 text-slate-600',
    }
    return <Badge className={`${colorClasses[config.color]} border-0 rounded-md px-2`}>{config.ar}</Badge>
  }

  // Probation status badge
  const getProbationBadge = (status: ProbationStatus) => {
    const config = PROBATION_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
    }
    return <Badge className={`${colorClasses[config.color]} border-0 rounded-md px-2`}>{config.ar}</Badge>
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!stats) return undefined
    return [
      { label: 'إجمالي برامج التأهيل', value: stats.totalOnboardings || 0, icon: ClipboardList, status: 'normal' as const },
      { label: 'قيد التنفيذ', value: stats.byStatus?.find(s => s.status === 'in_progress')?.count || 0, icon: PlayCircle, status: 'normal' as const },
      { label: 'مكتملة', value: stats.byStatus?.find(s => s.status === 'completed')?.count || 0, icon: CheckCircle, status: 'normal' as const },
      { label: 'نسبة الإكمال', value: `${stats.averageCompletionRate || 0}%`, icon: Target, status: 'normal' as const },
    ]
  }, [stats])

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التأهيل', href: '/dashboard/hr/onboarding', isActive: true },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD & STATS */}
        <ProductivityHero badge="الموارد البشرية" title="التأهيل والإعداد الوظيفي" type="employees" stats={heroStats} />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                {/* Row 1: Search and primary filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder="بحث بالاسم أو رقم الموظف..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الحالات</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="on_hold">معلق</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Probation Filter */}
                  <Select value={probationFilter} onValueChange={setProbationFilter}>
                    <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="فترة التجربة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="passed">اجتاز</SelectItem>
                      <SelectItem value="failed">لم يجتز</SelectItem>
                      <SelectItem value="extended">ممدد</SelectItem>
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
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN ONBOARDINGS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">برامج التأهيل</h3>
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                    {onboardings.length} برنامج
                  </Badge>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/onboarding/new' })}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    برنامج جديد
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="w-14 h-14 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-16 w-full" />
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل البيانات</h3>
                    <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && onboardings.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <ClipboardList className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد برامج تأهيل</h3>
                    <p className="text-slate-500 mb-4">ابدأ بإضافة برنامج تأهيل جديد</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to="/dashboard/hr/onboarding/new">
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        إضافة برنامج تأهيل
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Onboardings List */}
                {!isLoading && !isError && onboardings.map((onboarding) => (
                  <div key={onboarding._id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(onboarding._id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(onboarding._id)}
                            onCheckedChange={() => handleSelectOnboarding(onboarding._id)}
                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        )}
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                          {(onboarding.employeeNameAr || onboarding.employeeName).charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-navy text-lg">{onboarding.employeeNameAr || onboarding.employeeName}</h4>
                            {getStatusBadge(onboarding.status)}
                          </div>
                          <p className="text-slate-500 text-sm">{onboarding.jobTitleAr || onboarding.jobTitle} • {onboarding.onboardingNumber}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewOnboarding(onboarding._id)}>
                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOnboarding(onboarding._id)}>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                            تعديل البيانات
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteOnboarding(onboarding._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                            حذف البرنامج
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Progress and Details */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500">نسبة الإكمال</span>
                        <span className="text-sm font-bold text-navy">{onboarding.completion.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${onboarding.completion.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        {/* Info */}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                            بدأ: {formatDate(onboarding.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            الهدف: {formatDate(onboarding.completionTargetDate)}
                          </span>
                        </div>
                        {/* Probation Status */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">فترة التجربة:</span>
                          {getProbationBadge(onboarding.probation.probationStatus)}
                        </div>
                      </div>
                      <Link to={`/dashboard/hr/onboarding/${onboarding._id}` as any}>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 pt-0 text-center">
                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                  عرض جميع البرامج
                  <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar
            context="employees"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedIds.length}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>
      </Main>
    </>
  )
}
