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
import {
  useLeaveAllocations,
  useAllocationStatistics,
  useDeleteLeaveAllocation,
} from '@/hooks/useLeaveAllocation'
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
  Plus,
  MoreHorizontal,
  ChevronLeft,
  Eye,
  Trash2,
  Edit3,
  SortAsc,
  X,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Palmtree,
  Stethoscope,
  Heart,
  GraduationCap,
  Baby,
  Plane,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Download,
  Upload,
  RefreshCcw,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
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
import type { LeaveType } from '@/services/leaveService'
import type { LeaveAllocationStatus } from '@/services/leaveAllocationService'

const LEAVE_TYPES: { value: LeaveType; label: string; icon: typeof Palmtree }[] = [
  { value: 'annual', label: 'إجازة سنوية', icon: Palmtree },
  { value: 'sick', label: 'إجازة مرضية', icon: Stethoscope },
  { value: 'hajj', label: 'إجازة حج', icon: Plane },
  { value: 'marriage', label: 'إجازة زواج', icon: Heart },
  { value: 'birth', label: 'إجازة ولادة', icon: Baby },
  { value: 'death', label: 'إجازة وفاة', icon: Heart },
  { value: 'maternity', label: 'إجازة وضع', icon: Baby },
  { value: 'paternity', label: 'إجازة أبوة', icon: Baby },
  { value: 'exam', label: 'إجازة امتحان', icon: GraduationCap },
  { value: 'unpaid', label: 'إجازة بدون راتب', icon: Calendar },
]

export function LeaveAllocationsListView() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [hasBalanceFilter, setHasBalanceFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'employeeName' | 'leaveType' | 'fromDate' | 'leaveBalance' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Mutations
  const deleteAllocationMutation = useDeleteLeaveAllocation()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {
      sortBy,
      sortOrder,
    }

    if (statusFilter !== 'all') {
      f.status = statusFilter as LeaveAllocationStatus
    }

    if (typeFilter !== 'all') {
      f.leaveType = typeFilter as LeaveType
    }

    if (hasBalanceFilter === 'yes') {
      f.hasBalance = true
    } else if (hasBalanceFilter === 'no') {
      f.hasBalance = false
    }

    return f
  }, [statusFilter, typeFilter, hasBalanceFilter, sortBy, sortOrder])

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || hasBalanceFilter !== 'all'

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
    setHasBalanceFilter('all')
  }

  // Fetch leave allocations
  const { data: allocationsData, isLoading, isError, error, refetch } = useLeaveAllocations(filters)
  const { data: stats } = useAllocationStatistics()

  // Transform API data with search filter
  const leaveAllocations = useMemo(() => {
    if (!allocationsData?.data) return []
    let allocations = allocationsData.data

    // Apply client-side search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      allocations = allocations.filter(
        (alloc) =>
          alloc.employeeName.toLowerCase().includes(query) ||
          alloc.employeeNameAr?.toLowerCase().includes(query) ||
          alloc.allocationId.toLowerCase().includes(query) ||
          alloc.employeeId.toLowerCase().includes(query)
      )
    }

    return allocations
  }, [allocationsData, searchQuery])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds([])
  }

  const handleSelectAllocation = (allocationId: string) => {
    if (selectedIds.includes(allocationId)) {
      setSelectedIds(selectedIds.filter((id) => id !== allocationId))
    } else {
      setSelectedIds([...selectedIds, allocationId])
    }
  }

  // Single allocation actions
  const handleViewAllocation = (allocationId: string) => {
    // Navigate to detail view
    console.log('View allocation:', allocationId)
  }

  const handleEditAllocation = (allocationId: string) => {
    // Open edit dialog
    console.log('Edit allocation:', allocationId)
  }

  const handleDeleteAllocation = (allocationId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التخصيص؟')) {
      deleteAllocationMutation.mutate(allocationId)
    }
  }

  // Status badge styling
  const getStatusBadge = (status: LeaveAllocationStatus) => {
    const styles: Record<LeaveAllocationStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      expired: 'bg-slate-100 text-slate-500',
    }
    const labels: Record<LeaveAllocationStatus, string> = {
      active: 'نشط',
      expired: 'منتهي',
    }
    const icons: Record<LeaveAllocationStatus, React.ReactNode> = {
      active: <CheckCircle className="w-3 h-3" aria-hidden="true" />,
      expired: <Clock className="w-3 h-3" aria-hidden="true" />,
    }
    return (
      <Badge className={`${styles[status]} border-0 rounded-md px-2 flex items-center gap-1`}>
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  // Leave type badge styling
  const getLeaveTypeBadge = (leaveType: LeaveType) => {
    const styles: Record<LeaveType, string> = {
      annual: 'bg-emerald-100 text-emerald-700',
      sick: 'bg-red-100 text-red-700',
      hajj: 'bg-purple-100 text-purple-700',
      marriage: 'bg-pink-100 text-pink-700',
      birth: 'bg-blue-100 text-blue-700',
      death: 'bg-slate-100 text-slate-700',
      eid: 'bg-amber-100 text-amber-700',
      maternity: 'bg-rose-100 text-rose-700',
      paternity: 'bg-sky-100 text-sky-700',
      exam: 'bg-indigo-100 text-indigo-700',
      unpaid: 'bg-orange-100 text-orange-700',
    }
    const labels: Record<LeaveType, string> = {
      annual: 'سنوية',
      sick: 'مرضية',
      hajj: 'حج',
      marriage: 'زواج',
      birth: 'ولادة',
      death: 'وفاة',
      eid: 'عيد',
      maternity: 'وضع',
      paternity: 'أبوة',
      exam: 'امتحان',
      unpaid: 'بدون راتب',
    }
    return (
      <Badge className={`${styles[leaveType]} border-0 rounded-md px-2`}>{labels[leaveType]}</Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Top navigation
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الإجازات', href: '/dashboard/hr/leave', isActive: true },
  ]

  return (
    <>
      <HRSidebar />

      {/* Header */}
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
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Page Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-2 flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              تخصيص الإجازات
            </h1>
            <p className="text-slate-500">إدارة تخصيصات الإجازات والأرصدة للموظفين</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => console.log('Bulk allocate')}
              variant="outline"
              className="rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              <Users className="w-4 h-4 ms-2" aria-hidden="true" />
              تخصيص جماعي
            </Button>
            <Button
              onClick={() => console.log('Create allocation')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
              تخصيص جديد
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-0">
                  <TrendingUp className="w-3 h-3 ms-1" />
                  نشط
                </Badge>
              </div>
              <h3 className="text-slate-500 text-sm mb-2">إجمالي التخصيصات</h3>
              <p className="text-3xl font-bold text-navy">{stats.totalAllocations || 0}</p>
              <p className="text-xs text-slate-400 mt-1">للموظفين النشطين</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">أيام</Badge>
              </div>
              <h3 className="text-slate-500 text-sm mb-2">الأيام المخصصة</h3>
              <p className="text-3xl font-bold text-navy">{stats.totalDaysAllocated || 0}</p>
              <p className="text-xs text-slate-400 mt-1">إجمالي الأيام المخصصة</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" aria-hidden="true" />
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0">مستخدم</Badge>
              </div>
              <h3 className="text-slate-500 text-sm mb-2">الأيام المستخدمة</h3>
              <p className="text-3xl font-bold text-navy">{stats.totalDaysUsed || 0}</p>
              <p className="text-xs text-slate-400 mt-1">من إجمالي المخصص</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">متاح</Badge>
              </div>
              <h3 className="text-slate-500 text-sm mb-2">الرصيد المتبقي</h3>
              <p className="text-3xl font-bold text-navy">{stats.totalDaysBalance || 0}</p>
              <p className="text-xs text-slate-400 mt-1">أيام متبقية</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search
                  className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  placeholder="بحث بالموظف، الرقم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10 rounded-xl border-slate-200 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leave Type Filter */}
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="نوع الإجازة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Has Balance Filter */}
            <div>
              <Select value={hasBalanceFilter} onValueChange={setHasBalanceFilter}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="الرصيد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأرصدة</SelectItem>
                  <SelectItem value="yes">له رصيد</SelectItem>
                  <SelectItem value="no">لا رصيد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-slate-500">الفلاتر النشطة:</span>
              {searchQuery && (
                <Badge variant="outline" className="rounded-md">
                  بحث: {searchQuery}
                  <X
                    className="w-3 h-3 ms-1 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="rounded-md">
                  الحالة: {statusFilter === 'active' ? 'نشط' : 'منتهي'}
                  <X
                    className="w-3 h-3 ms-1 cursor-pointer"
                    onClick={() => setStatusFilter('all')}
                  />
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="outline" className="rounded-md">
                  النوع: {LEAVE_TYPES.find((t) => t.value === typeFilter)?.label}
                  <X
                    className="w-3 h-3 ms-1 cursor-pointer"
                    onClick={() => setTypeFilter('all')}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="me-auto">
                <X className="w-4 h-4 ms-1" />
                مسح الكل
              </Button>
            </div>
          )}
        </div>

        {/* Allocations Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-navy">التخصيصات</h2>
              {allocationsData?.pagination && (
                <Badge variant="outline" className="rounded-md">
                  {allocationsData.pagination.total} تخصيص
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onValueChange={(v) =>
                  setSortBy(
                    v as 'employeeName' | 'leaveType' | 'fromDate' | 'leaveBalance' | 'createdAt'
                  )
                }
              >
                <SelectTrigger className="w-40 rounded-xl border-slate-200">
                  <SortAsc className="w-4 h-4 ms-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employeeName">الموظف</SelectItem>
                  <SelectItem value="leaveType">نوع الإجازة</SelectItem>
                  <SelectItem value="fromDate">تاريخ البداية</SelectItem>
                  <SelectItem value="leaveBalance">الرصيد</SelectItem>
                  <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => refetch()}
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">حدث خطأ</h3>
              <p className="text-slate-500 mb-4">
                {error instanceof Error ? error.message : 'فشل في تحميل التخصيصات'}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
                <RefreshCcw className="w-4 h-4 ms-2" />
                إعادة المحاولة
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && leaveAllocations.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Calendar className="h-8 w-8 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">لا توجد تخصيصات</h3>
              <p className="text-slate-500 mb-4">
                {hasActiveFilters
                  ? 'لم يتم العثور على تخصيصات تطابق معايير البحث'
                  : 'ابدأ بإنشاء تخصيص إجازة جديد'}
              </p>
              {!hasActiveFilters && (
                <Button
                  onClick={() => console.log('Create allocation')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 ms-2" />
                  تخصيص جديد
                </Button>
              )}
            </div>
          )}

          {/* Allocations List */}
          {!isLoading && !isError && leaveAllocations.length > 0 && (
            <div className="divide-y divide-slate-100">
              {leaveAllocations.map((allocation) => (
                <div
                  key={allocation._id}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleViewAllocation(allocation._id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Employee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-bold text-navy truncate">
                          {allocation.employeeNameAr || allocation.employeeName}
                        </h3>
                        {getLeaveTypeBadge(allocation.leaveType)}
                        {getStatusBadge(allocation.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {allocation.departmentName || 'غير محدد'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(allocation.fromDate)} - {formatDate(allocation.toDate)}
                        </span>
                      </div>
                    </div>

                    {/* Allocation Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">مخصص</div>
                        <div className="text-lg font-bold text-blue-600">
                          {allocation.totalLeavesAllocated}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">مستخدم</div>
                        <div className="text-lg font-bold text-amber-600">
                          {allocation.leavesUsed}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 mb-1">الرصيد</div>
                        <div className="text-lg font-bold text-emerald-600">
                          {allocation.leaveBalance}
                        </div>
                      </div>
                      {allocation.carryForwardedLeaves > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">منقول</div>
                          <div className="text-lg font-bold text-purple-600">
                            {allocation.carryForwardedLeaves}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleViewAllocation(allocation._id)
                        }}>
                          <Eye className="w-4 h-4 ms-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleEditAllocation(allocation._id)
                        }}>
                          <Edit3 className="w-4 h-4 ms-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAllocation(allocation._id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 ms-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productivity Hero */}
        <ProductivityHero />
      </Main>
    </>
  )
}
