import { HRSidebar } from './hr-sidebar'
import { useState, useMemo, useCallback } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Checkbox } from '@/components/ui/checkbox'
import { usePerformanceReviews, usePerformanceStats } from '@/hooks/usePerformanceReviews'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
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
  Search, Bell, Plus, Users, AlertCircle, Eye,
  Star, TrendingUp, TrendingDown, Target, Award, Clock,
  CheckCircle, FileText, BarChart3, Calendar, Building2,
  UserCheck, AlertTriangle, Minus, MoreHorizontal, Edit3, Trash2, X
} from 'lucide-react'
import type { ReviewStatus, ReviewType, OverallRating } from '@/services/performanceReviewService'

// Status labels
const REVIEW_STATUS_LABELS: Record<ReviewStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'slate' },
  self_assessment: { ar: 'التقييم الذاتي', en: 'Self Assessment', color: 'blue' },
  manager_review: { ar: 'تقييم المدير', en: 'Manager Review', color: 'amber' },
  calibration: { ar: 'المعايرة', en: 'Calibration', color: 'purple' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'emerald' },
  acknowledged: { ar: 'معتمد', en: 'Acknowledged', color: 'emerald' },
}

// Review type labels
const REVIEW_TYPE_LABELS: Record<ReviewType, { ar: string; en: string }> = {
  annual: { ar: 'سنوي', en: 'Annual' },
  mid_year: { ar: 'نصف سنوي', en: 'Mid-Year' },
  quarterly: { ar: 'ربع سنوي', en: 'Quarterly' },
  probation: { ar: 'فترة التجربة', en: 'Probation' },
  project: { ar: 'مشروع', en: 'Project' },
  ad_hoc: { ar: 'استثنائي', en: 'Ad-hoc' },
}

// Rating labels
const RATING_LABELS: Record<OverallRating, { ar: string; en: string; color: string; icon: React.ReactNode }> = {
  exceptional: { ar: 'استثنائي', en: 'Exceptional', color: 'emerald', icon: <TrendingUp className="w-4 h-4" aria-hidden="true" /> },
  exceeds_expectations: { ar: 'يتجاوز التوقعات', en: 'Exceeds Expectations', color: 'blue', icon: <Star className="w-4 h-4" /> },
  meets_expectations: { ar: 'يلبي التوقعات', en: 'Meets Expectations', color: 'amber', icon: <Target className="w-4 h-4" /> },
  needs_improvement: { ar: 'يحتاج تحسين', en: 'Needs Improvement', color: 'orange', icon: <AlertTriangle className="w-4 h-4" aria-hidden="true" /> },
  unsatisfactory: { ar: 'غير مرضي', en: 'Unsatisfactory', color: 'red', icon: <TrendingDown className="w-4 h-4" /> },
}

export function PerformanceReviewsListView() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ReviewType | 'all'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear())

  // Check if any filter is active
  const hasActiveFilters = useMemo(() =>
    searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all',
    [searchQuery, statusFilter, typeFilter, departmentFilter]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
    setDepartmentFilter('all')
  }, [])

  // Fetch performance reviews
  const { data: reviewsData, isLoading, isError } = usePerformanceReviews({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    reviewType: typeFilter !== 'all' ? typeFilter : undefined,
    departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
    periodYear: yearFilter,
  })

  // Fetch stats
  const { data: statsData } = usePerformanceStats({ periodYear: yearFilter })

  // Filter records based on search
  const filteredReviews = useMemo(() => {
    if (!reviewsData?.data) return []
    return reviewsData.data.filter((review) => {
      const matchesSearch =
        review.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.employeeNameAr?.includes(searchQuery) ||
        review.reviewId?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [reviewsData?.data, searchQuery])

  // Selection Handlers
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev)
    setSelectedIds([])
  }, [])

  const handleSelectReview = useCallback((reviewId: string) => {
    setSelectedIds(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} تقييم؟`)) {
      // TODO: Implement bulk delete
      setIsSelectionMode(false)
      setSelectedIds([])
    }
  }, [selectedIds])

  // Single review actions
  const handleViewReview = useCallback((reviewId: string) => {
    navigate({ to: ROUTES.dashboard.hr.performance.detail(reviewId), params: { reviewId } })
  }, [navigate])

  const handleEditReview = useCallback((reviewId: string) => {
    navigate({ to: ROUTES.dashboard.hr.performance.new, search: { editId: reviewId } })
  }, [navigate])

  const handleDeleteReview = useCallback((reviewId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      // TODO: Implement delete
    }
  }, [])

  // Status badge
  const getStatusBadge = (status: ReviewStatus) => {
    const config = REVIEW_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      orange: 'bg-orange-100 text-orange-700',
      purple: 'bg-purple-100 text-purple-700',
      slate: 'bg-slate-100 text-slate-600',
      blue: 'bg-blue-100 text-blue-700',
    }
    const icons: Record<ReviewStatus, React.ReactNode> = {
      draft: <FileText className="w-3 h-3" aria-hidden="true" />,
      self_assessment: <UserCheck className="w-3 h-3" />,
      manager_review: <Users className="w-3 h-3" aria-hidden="true" />,
      calibration: <BarChart3 className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      acknowledged: <Award className="w-3 h-3" />,
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-2 py-0.5 flex items-center gap-1`}>
        {icons[status]}
        {config.ar}
      </Badge>
    )
  }

  // Rating badge
  const getRatingBadge = (rating?: OverallRating) => {
    if (!rating) return null
    const config = RATING_LABELS[rating]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      orange: 'bg-orange-100 text-orange-700',
      blue: 'bg-blue-100 text-blue-700',
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-2 py-0.5 flex items-center gap-1`}>
        {config.icon}
        {config.ar}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Get score color
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-500'
    if (score >= 4.5) return 'text-emerald-600'
    if (score >= 3.5) return 'text-blue-600'
    if (score >= 2.5) return 'text-amber-600'
    if (score >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!statsData) return undefined
    return [
      { label: 'إجمالي التقييمات', value: statsData.totalReviews || 0, icon: FileText, status: 'normal' as const },
      { label: 'مكتملة', value: statsData.byStatus?.find(s => s.status === 'completed')?.count || 0, icon: CheckCircle, status: 'normal' as const },
      { label: 'قيد المراجعة', value: statsData.byStatus?.find(s => s.status === 'manager_review')?.count || 0, icon: Clock, status: 'normal' as const },
      { label: 'متأخرة', value: statsData.overdueReviews || 0, icon: AlertTriangle, status: statsData.overdueReviews > 0 ? 'attention' as const : 'zero' as const },
    ]
  }, [statsData])

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.overview, isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'تقييم الأداء', href: ROUTES.dashboard.hr.performance.list, isActive: true },
    { title: 'الحضور', href: ROUTES.dashboard.hr.attendance.list, isActive: false },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD & STATS */}
        <ProductivityHero badge="الموارد البشرية" title="تقييم الأداء" type="performance" stats={heroStats} />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                {/* Row 1: Year and Search */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Year Filter */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-500" aria-hidden="true" />
                    <Select value={yearFilter.toString()} onValueChange={(v) => setYearFilter(parseInt(v))}>
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="السنة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder="بحث بالاسم أو رقم التقييم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Row 2: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReviewStatus | 'all')}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="self_assessment">التقييم الذاتي</SelectItem>
                      <SelectItem value="manager_review">تقييم المدير</SelectItem>
                      <SelectItem value="calibration">المعايرة</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="acknowledged">معتمد</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ReviewType | 'all')}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <Target className="h-4 w-4 ms-2 text-slate-500" />
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="annual">سنوي</SelectItem>
                      <SelectItem value="mid_year">نصف سنوي</SelectItem>
                      <SelectItem value="quarterly">ربع سنوي</SelectItem>
                      <SelectItem value="probation">فترة التجربة</SelectItem>
                      <SelectItem value="project">مشروع</SelectItem>
                      <SelectItem value="ad_hoc">استثنائي</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <Building2 className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                      <SelectValue placeholder="القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأقسام</SelectItem>
                      <SelectItem value="legal">القانونية</SelectItem>
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                      <SelectItem value="finance">المالية</SelectItem>
                      <SelectItem value="admin">الإدارة</SelectItem>
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

            {/* MAIN REVIEWS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-600" />
                  تقييمات الأداء
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {filteredReviews.length} تقييم
                </Badge>
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ</h3>
                    <p className="text-slate-500 mb-4">فشل في تحميل تقييمات الأداء</p>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredReviews.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Star className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد تقييمات</h3>
                    <p className="text-slate-500 mb-4">لا توجد تقييمات أداء مطابقة للبحث</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to={ROUTES.dashboard.hr.performance.new}>
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        تقييم جديد
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Reviews List */}
                {!isLoading && !isError && filteredReviews.map((review) => (
                  <div key={review._id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(review._id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(review._id)}
                            onCheckedChange={() => handleSelectReview(review._id)}
                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        )}
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                          {(review.employeeNameAr || review.employeeName || '?').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-navy text-lg">{review.employeeNameAr || review.employeeName}</h4>
                            {getStatusBadge(review.status)}
                            <Badge className="bg-slate-100 text-slate-600 border-0 rounded-lg text-xs">
                              {REVIEW_TYPE_LABELS[review.reviewType]?.ar || review.reviewType}
                            </Badge>
                          </div>
                          <p className="text-slate-500 text-sm">{review.positionTitleAr || review.positionTitle} • {review.departmentNameAr || review.departmentName}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewReview(review._id)}>
                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditReview(review._id)}>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                            تعديل التقييم
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                            حذف التقييم
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        {/* Period */}
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-1">فترة التقييم</p>
                          <p className="text-sm font-medium text-navy">
                            {formatDate(review.reviewPeriod?.startDate)} - {formatDate(review.reviewPeriod?.endDate)}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="text-center min-w-[60px]">
                          <p className="text-xs text-slate-500 mb-1">الدرجة</p>
                          <p className={`text-xl font-bold ${getScoreColor(review.overallScore)}`}>
                            {review.overallScore?.toFixed(1) || <Minus className="w-4 h-4 mx-auto text-slate-300" />}
                          </p>
                        </div>

                        {/* Final Rating */}
                        <div className="text-center min-w-[120px]">
                          <p className="text-xs text-slate-500 mb-1">التقييم النهائي</p>
                          {review.finalRating ? (
                            getRatingBadge(review.finalRating)
                          ) : (
                            <span className="text-slate-500 text-sm">-</span>
                          )}
                        </div>
                      </div>
                      <Link to={ROUTES.dashboard.hr.performance.detail(review._id) as any}>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                          عرض التقييم
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar
            context="evaluations"
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
