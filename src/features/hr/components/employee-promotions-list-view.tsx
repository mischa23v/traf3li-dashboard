import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import {
  usePromotions,
  usePromotionStats,
  useBulkDeletePromotions,
  useDeletePromotion,
  useApplyPromotion,
} from '@/hooks/useEmployeePromotion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Search,
  Bell,
  AlertCircle,
  TrendingUp,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  Eye,
  Trash2,
  Edit3,
  SortAsc,
  Filter,
  X,
  Calendar,
  DollarSign,
  Award,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
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
import type { EmployeePromotion, PromotionStatus } from '@/services/employeePromotionService'
import { promotionStatusLabels } from '@/services/employeePromotionService'

export function EmployeePromotionsListView() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [appliedFilter, setAppliedFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('promotionDate')

  // Mutations
  const deletePromotionMutation = useDeletePromotion()
  const { mutate: bulkDeletePromotions } = useBulkDeletePromotions()
  const { mutate: applyPromotion } = useApplyPromotion()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}

    // Status filter
    if (statusFilter !== 'all') {
      f.status = statusFilter
    }

    // Applied filter
    if (appliedFilter === 'applied') {
      f.applied = true
    } else if (appliedFilter === 'not_applied') {
      f.applied = false
    }

    // Search
    if (searchQuery.trim()) {
      f.search = searchQuery.trim()
    }

    // Sort
    if (sortBy === 'promotionDate') {
      f.sortBy = 'promotionDate'
      f.sortOrder = 'desc'
    } else if (sortBy === 'effectiveDate') {
      f.sortBy = 'effectiveDate'
      f.sortOrder = 'desc'
    } else if (sortBy === 'employeeName') {
      f.sortBy = 'employeeName'
      f.sortOrder = 'asc'
    } else if (sortBy === 'salary') {
      f.sortBy = 'newSalary'
      f.sortOrder = 'desc'
    }

    return f
  }, [statusFilter, appliedFilter, searchQuery, sortBy])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || appliedFilter !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setAppliedFilter('all')
  }

  // Fetch promotions
  const { data: promotionsData, isLoading, isError, error, refetch } = usePromotions(filters)
  const { data: stats } = usePromotionStats()

  // Helper function to format dates in both languages
  const formatDualDate = (dateString: string | null | undefined) => {
    if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
    const date = new Date(dateString)
    return {
      arabic: format(date, 'd MMMM yyyy', { locale: arSA }),
      english: format(date, 'MMM d, yyyy'),
    }
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate salary increase
  const calculateIncrease = (previous: number, current: number) => {
    const increase = current - previous
    const percentage = ((increase / previous) * 100).toFixed(1)
    return { increase, percentage }
  }

  // Transform API data
  const promotions = useMemo(() => {
    if (!promotionsData?.promotions) return []

    return promotionsData.promotions.map((promotion: EmployeePromotion) => {
      const salaryInfo = calculateIncrease(promotion.previousSalary, promotion.newSalary)
      return {
        id: promotion._id,
        promotionId: promotion.promotionId,
        employeeId: promotion.employeeId,
        employeeName: promotion.employeeNameAr || promotion.employeeName,
        employeeNameEnglish: promotion.employeeName,
        promotionDate: promotion.promotionDate,
        promotionDateFormatted: formatDualDate(promotion.promotionDate),
        effectiveDate: promotion.effectiveDate,
        effectiveDateFormatted: formatDualDate(promotion.effectiveDate),
        previousDesignation: promotion.previousDesignationAr || promotion.previousDesignation,
        newDesignation: promotion.newDesignationAr || promotion.newDesignation,
        previousDepartment: promotion.previousDepartmentNameAr || promotion.previousDepartmentName || 'غير محدد',
        newDepartment: promotion.newDepartmentNameAr || promotion.newDepartmentName || 'غير محدد',
        previousSalary: promotion.previousSalary,
        newSalary: promotion.newSalary,
        salaryIncrease: salaryInfo.increase,
        salaryIncreasePercentage: salaryInfo.percentage,
        status: promotion.status,
        applied: promotion.applied,
        reason: promotion.reasonAr || promotion.reason,
        _id: promotion._id,
      }
    })
  }, [promotionsData])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds([])
  }

  const handleSelectPromotion = (promotionId: string) => {
    if (selectedIds.includes(promotionId)) {
      setSelectedIds(selectedIds.filter((id) => id !== promotionId))
    } else {
      setSelectedIds([...selectedIds, promotionId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return

    if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} ترقية؟`)) {
      bulkDeletePromotions(selectedIds, {
        onSuccess: () => {
          setIsSelectionMode(false)
          setSelectedIds([])
        },
      })
    }
  }

  // Single promotion actions
  const handleViewPromotion = (promotionId: string) => {
    navigate({ to: ROUTES.dashboard.hr.promotions.detail(promotionId), params: { promotionId } })
  }

  const handleEditPromotion = (promotionId: string) => {
    navigate({ to: ROUTES.dashboard.hr.promotions.edit(promotionId), params: { promotionId } })
  }

  const handleDeletePromotion = (promotionId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الترقية؟')) {
      deletePromotionMutation.mutate(promotionId)
    }
  }

  const handleApplyPromotion = (promotionId: string) => {
    if (confirm('هل أنت متأكد من تطبيق هذه الترقية؟ سيتم تحديث بيانات الموظف.')) {
      applyPromotion(promotionId)
    }
  }

  // Status badge styling
  const getStatusBadge = (status: PromotionStatus) => {
    const styles: Record<PromotionStatus, { bg: string; text: string; icon: any }> = {
      draft: {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        text: promotionStatusLabels.draft.ar,
        icon: Edit3,
      },
      pending_approval: {
        bg: 'bg-amber-100 text-amber-700 border-amber-200',
        text: promotionStatusLabels.pending_approval.ar,
        icon: Clock,
      },
      approved: {
        bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        text: promotionStatusLabels.approved.ar,
        icon: CheckCircle,
      },
      rejected: {
        bg: 'bg-red-100 text-red-700 border-red-200',
        text: promotionStatusLabels.rejected.ar,
        icon: XCircle,
      },
      cancelled: {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        text: promotionStatusLabels.cancelled.ar,
        icon: X,
      },
    }

    const config = styles[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.bg} border-0 rounded-md px-2 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!stats) return undefined
    return [
      {
        label: 'إجمالي الترقيات',
        value: stats.total || 0,
        icon: TrendingUp,
        status: 'normal' as const,
      },
      {
        label: 'بانتظار الموافقة',
        value: stats.pending || 0,
        icon: Clock,
        status: stats.pending > 0 ? ('attention' as const) : ('zero' as const),
      },
      {
        label: 'معتمدة',
        value: stats.approved || 0,
        icon: CheckCircle,
        status: 'normal' as const,
      },
      {
        label: 'متوسط الزيادة',
        value: `${stats.averageSalaryIncreasePercentage?.toFixed(1) || 0}%`,
        icon: DollarSign,
        status: 'normal' as const,
      },
    ]
  }, [stats])

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الترقيات', href: ROUTES.dashboard.hr.promotions.list, isActive: true },
    { title: 'الإجازات', href: ROUTES.dashboard.hr.leave.list, isActive: false },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
            aria-label="الإشعارات"
          >
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

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge="الموارد البشرية"
          title="ترقيات الموظفين"
          type="promotions"
          stats={heroStats}
        />

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
                    <Search
                      className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    />
                    <Input
                      type="text"
                      placeholder="بحث بالموظف أو رقم الترقية..."
                      aria-label="بحث بالموظف أو رقم الترقية"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الحالات</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="pending_approval">بانتظار الموافقة</SelectItem>
                      <SelectItem value="approved">معتمد</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                      <SelectItem value="cancelled">ملغى</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Applied Filter */}
                  <Select value={appliedFilter} onValueChange={setAppliedFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="حالة التطبيق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="applied">مطبقة</SelectItem>
                      <SelectItem value="not_applied">غير مطبقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2: Sort and clear */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                      <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotionDate">تاريخ الترقية</SelectItem>
                      <SelectItem value="effectiveDate">تاريخ السريان</SelectItem>
                      <SelectItem value="employeeName">اسم الموظف</SelectItem>
                      <SelectItem value="salary">الراتب الجديد</SelectItem>
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

            {/* MAIN PROMOTIONS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">قائمة الترقيات</h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {promotions.length} ترقية
                </Badge>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100"
                      >
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      حدث خطأ أثناء تحميل الترقيات
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {error?.message || 'تعذر الاتصال بالخادم'}
                    </p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && promotions.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد ترقيات</h3>
                    <p className="text-slate-500 mb-4">ابدأ بإضافة ترقية جديدة</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to="/dashboard/hr/promotions/new">
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        إضافة ترقية
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Promotions List */}
                {!isLoading &&
                  !isError &&
                  promotions.map((promotion) => (
                    <div
                      key={promotion.id}
                      className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${
                        selectedIds.includes(promotion.id)
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : 'border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                          {isSelectionMode && (
                            <Checkbox
                              checked={selectedIds.includes(promotion.id)}
                              onCheckedChange={() => handleSelectPromotion(promotion.id)}
                              className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                          )}
                          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                            <Award className="h-7 w-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-navy text-lg">
                                {promotion.employeeName}
                              </h4>
                              {getStatusBadge(promotion.status)}
                              {promotion.applied && (
                                <Badge className="bg-blue-100 text-blue-700 border-0 rounded-md px-2 flex items-center gap-1">
                                  <FileCheck className="h-3 w-3" />
                                  مطبقة
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-500 text-sm">
                              {promotion.promotionId} • {promotion.promotionDateFormatted.arabic}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-500 hover:text-navy"
                              aria-label="خيارات"
                            >
                              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewPromotion(promotion.id)}>
                              <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            {promotion.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleEditPromotion(promotion.id)}>
                                <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                تعديل
                              </DropdownMenuItem>
                            )}
                            {promotion.status === 'approved' && !promotion.applied && (
                              <DropdownMenuItem onClick={() => handleApplyPromotion(promotion.id)}>
                                <CheckCircle className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                                تطبيق الترقية
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePromotion(promotion.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                              حذف الترقية
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Promotion Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                        <div className="space-y-2">
                          <div className="text-xs text-slate-500">من</div>
                          <div className="text-sm">
                            <div className="font-medium text-navy">
                              {promotion.previousDesignation}
                            </div>
                            <div className="text-slate-600">{promotion.previousDepartment}</div>
                            <div className="text-emerald-600 font-bold">
                              {formatCurrency(promotion.previousSalary)}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-slate-500">إلى</div>
                          <div className="text-sm">
                            <div className="font-medium text-navy">{promotion.newDesignation}</div>
                            <div className="text-slate-600">{promotion.newDepartment}</div>
                            <div className="text-emerald-600 font-bold">
                              {formatCurrency(promotion.newSalary)}
                              <span className="text-xs text-emerald-500 ms-1">
                                (+{promotion.salaryIncreasePercentage}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200/50">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                            سريان: {promotion.effectiveDateFormatted.arabic}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" aria-hidden="true" />
                            زيادة: {formatCurrency(promotion.salaryIncrease)}
                          </span>
                        </div>
                        <Link to={ROUTES.dashboard.hr.promotions.detail(promotion.id)}>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-4 pt-0 text-center">
                <Button
                  variant="ghost"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6"
                >
                  عرض جميع الترقيات
                  <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar
            context="promotions"
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
