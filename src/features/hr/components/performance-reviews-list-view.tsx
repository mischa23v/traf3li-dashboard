import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { usePerformanceReviews, usePerformanceStats } from '@/hooks/usePerformanceReviews'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Search, Bell, Plus, Filter, Users, AlertCircle, Eye,
  Star, TrendingUp, TrendingDown, Target, Award, Clock,
  CheckCircle, FileText, BarChart3, Calendar, Building2,
  UserCheck, AlertTriangle, Minus
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
  exceptional: { ar: 'استثنائي', en: 'Exceptional', color: 'emerald', icon: <TrendingUp className="w-4 h-4" /> },
  exceeds_expectations: { ar: 'يتجاوز التوقعات', en: 'Exceeds Expectations', color: 'blue', icon: <Star className="w-4 h-4" /> },
  meets_expectations: { ar: 'يلبي التوقعات', en: 'Meets Expectations', color: 'amber', icon: <Target className="w-4 h-4" /> },
  needs_improvement: { ar: 'يحتاج تحسين', en: 'Needs Improvement', color: 'orange', icon: <AlertTriangle className="w-4 h-4" /> },
  unsatisfactory: { ar: 'غير مرضي', en: 'Unsatisfactory', color: 'red', icon: <TrendingDown className="w-4 h-4" /> },
}

export function PerformanceReviewsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ReviewType | 'all'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear())

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
      draft: <FileText className="w-3 h-3" />,
      self_assessment: <UserCheck className="w-3 h-3" />,
      manager_review: <Users className="w-3 h-3" />,
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
    if (!score) return 'text-slate-400'
    if (score >= 4.5) return 'text-emerald-600'
    if (score >= 3.5) return 'text-blue-600'
    if (score >= 2.5) return 'text-amber-600'
    if (score >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'تقييم الأداء', href: '/dashboard/hr/performance', isActive: true },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">تقييم الأداء</h1>
            <p className="text-slate-500">إدارة ومتابعة تقييمات أداء الموظفين</p>
          </div>
          <Button
            onClick={() => navigate({ to: '/dashboard/hr/performance/new' })}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 ml-2" />
            تقييم جديد
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">إجمالي التقييمات</p>
                  <p className="text-2xl font-bold text-navy">{statsData?.totalReviews || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">مكتملة</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {statsData?.byStatus?.find(s => s.status === 'completed')?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">قيد المراجعة</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {statsData?.byStatus?.find(s => s.status === 'manager_review')?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">متأخرة</p>
                  <p className="text-2xl font-bold text-red-600">{statsData?.overdueReviews || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">متوسط التقييم</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statsData?.avgOverallScore?.toFixed(1) || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Year Navigation & Filters */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-500" />
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

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="بحث بالاسم أو رقم التقييم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pr-10 rounded-xl"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReviewStatus | 'all')}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <Filter className="w-4 h-4 ml-2" />
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
                  <SelectTrigger className="w-40 rounded-xl">
                    <Target className="w-4 h-4 ml-2" />
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
                  <SelectTrigger className="w-40 rounded-xl">
                    <Building2 className="w-4 h-4 ml-2" />
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Reviews List */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-600" />
                تقييمات الأداء
              </CardTitle>
              <Badge className="bg-slate-100 text-slate-600 border-0">
                {filteredReviews.length} تقييم
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">حدث خطأ</h3>
                <p className="text-slate-500">فشل في تحميل تقييمات الأداء</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد تقييمات</h3>
                <p className="text-slate-500 mb-4">لا توجد تقييمات أداء مطابقة للبحث</p>
                <Button
                  onClick={() => navigate({ to: '/dashboard/hr/performance/new' })}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  تقييم جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate({ to: '/dashboard/hr/performance/$reviewId', params: { reviewId: review._id } })}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-bold text-lg">
                          {(review.employeeNameAr || review.employeeName || '?').charAt(0)}
                        </span>
                      </div>

                      {/* Employee Info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-navy">
                            {review.employeeNameAr || review.employeeName}
                          </span>
                          {getStatusBadge(review.status)}
                          <Badge className="bg-slate-100 text-slate-600 border-0 rounded-lg text-xs">
                            {REVIEW_TYPE_LABELS[review.reviewType]?.ar || review.reviewType}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {review.positionTitleAr || review.positionTitle} • {review.departmentNameAr || review.departmentName}
                        </p>
                      </div>
                    </div>

                    {/* Review Info */}
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
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </div>

                      {/* Due Date */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">تاريخ الاستحقاق</p>
                        <p className="text-sm font-medium text-navy">
                          {formatDate(review.reviewPeriod?.reviewDueDate)}
                        </p>
                      </div>

                      {/* View Button */}
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        {statsData?.byRating && statsData.byRating.length > 0 && (
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                توزيع التقييمات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(RATING_LABELS).map(([rating, config]) => {
                  const ratingData = statsData.byRating?.find(r => r.rating === rating)
                  const count = ratingData?.count || 0
                  const percentage = ratingData?.percentage || 0
                  return (
                    <div key={rating} className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                        config.color === 'emerald' ? 'bg-emerald-100' :
                        config.color === 'blue' ? 'bg-blue-100' :
                        config.color === 'amber' ? 'bg-amber-100' :
                        config.color === 'orange' ? 'bg-orange-100' :
                        'bg-red-100'
                      }`}>
                        <span className={`${
                          config.color === 'emerald' ? 'text-emerald-600' :
                          config.color === 'blue' ? 'text-blue-600' :
                          config.color === 'amber' ? 'text-amber-600' :
                          config.color === 'orange' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {config.icon}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-navy">{config.ar}</p>
                      <p className="text-2xl font-bold text-navy">{count}</p>
                      <p className="text-xs text-slate-500">{percentage.toFixed(1)}%</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
