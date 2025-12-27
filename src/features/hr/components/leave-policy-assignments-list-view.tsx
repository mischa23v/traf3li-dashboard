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
  useLeavePolicyAssignments,
  useLeavePolicyStats,
  useCancelPolicyAssignment,
} from '@/hooks/useLeavePolicy'
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
  Eye,
  X,
  FileText,
  CheckCircle,
  Users,
  Calendar,
  XCircle,
  Clock,
  UserCheck,
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
import type { AssignmentStatus } from '@/services/leavePolicyService'

export function LeavePolicyAssignmentsListView() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dialog states
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Mutations
  const cancelAssignment = useCancelPolicyAssignment()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}

    if (statusFilter !== 'all') f.status = statusFilter
    if (departmentFilter !== 'all') f.department = departmentFilter

    return f
  }, [statusFilter, departmentFilter])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || departmentFilter !== 'all'

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDepartmentFilter('all')
  }

  // Fetch assignments
  const { data: assignmentsData, isLoading, isError, error, refetch } = useLeavePolicyAssignments(filters)
  const { data: stats } = useLeavePolicyStats()

  // Transform API data with search filter
  const assignments = useMemo(() => {
    if (!assignmentsData?.data) return []
    let assignmentList = assignmentsData.data

    // Apply client-side search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      assignmentList = assignmentList.filter(
        (assignment) =>
          assignment.employeeName.toLowerCase().includes(query) ||
          assignment.employeeNameAr.toLowerCase().includes(query) ||
          assignment.employeeNumber?.toLowerCase().includes(query) ||
          assignment.leavePolicyName.toLowerCase().includes(query)
      )
    }

    return assignmentList
  }, [assignmentsData, searchQuery])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds([])
  }

  const handleSelectAssignment = (assignmentId: string) => {
    if (selectedIds.includes(assignmentId)) {
      setSelectedIds(selectedIds.filter((id) => id !== assignmentId))
    } else {
      setSelectedIds([...selectedIds, assignmentId])
    }
  }

  // Single assignment actions
  const handleViewAssignment = (assignmentId: string) => {
    navigate({ to: `/dashboard/hr/leave-policy-assignments/${assignmentId}` as any })
  }

  const handleCancelAssignment = (assignmentId: string, employeeName: string) => {
    const reason = prompt(`سبب إلغاء تعيين السياسة للموظف "${employeeName}"؟`)
    if (reason) {
      cancelAssignment.mutate({ assignmentId, reason })
    }
  }

  // Status badge styling
  const getStatusBadge = (status: AssignmentStatus) => {
    const styles: Record<AssignmentStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      expired: 'bg-slate-100 text-slate-500',
      cancelled: 'bg-red-100 text-red-700',
    }
    const labels: Record<AssignmentStatus, string> = {
      active: 'نشط',
      expired: 'منتهي',
      cancelled: 'ملغي',
    }
    const icons: Record<AssignmentStatus, React.ReactNode> = {
      active: <CheckCircle className="w-3 h-3" />,
      expired: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    }
    return (
      <Badge
        className={`${styles[status]} border-0 rounded-md px-2 flex items-center gap-1`}
      >
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!stats) return undefined
    return [
      {
        label: 'إجمالي التعيينات',
        value: stats.totalAssignments || 0,
        icon: FileText,
        status: 'normal' as const,
      },
      {
        label: 'التعيينات النشطة',
        value: stats.activeAssignments || 0,
        icon: CheckCircle,
        status: 'normal' as const,
      },
      {
        label: 'السياسات النشطة',
        value: stats.activePolicies || 0,
        icon: UserCheck,
        status: 'normal' as const,
      },
      {
        label: 'موظفون بدون سياسة',
        value: stats.employeesWithoutPolicy || 0,
        icon: AlertCircle,
        status: stats.employeesWithoutPolicy > 0 ? ('attention' as const) : ('zero' as const),
      },
    ]
  }, [stats])

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الإجازات', href: ROUTES.dashboard.hr.leave.list, isActive: false },
    { title: 'سياسات الإجازات', href: ROUTES.dashboard.hr.leave.policies, isActive: false },
    {
      title: 'تعيينات السياسات',
      href: '/dashboard/hr/leave-policy-assignments',
      isActive: true,
    },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge="الموارد البشرية"
          title="تعيينات سياسات الإجازات"
          type="leave"
          stats={heroStats}
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                {/* Row 1: Search */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search
                      className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    />
                    <Input
                      type="text"
                      placeholder="بحث بالاسم أو الرقم..."
                      aria-label="بحث بالاسم أو الرقم"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Row 2: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الحالات</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="expired">منتهي</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Department Filter */}
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200">
                      <Users className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                      <SelectValue placeholder="القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الأقسام</SelectItem>
                      {/* TODO: Load departments dynamically */}
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                      <SelectItem value="it">تقنية المعلومات</SelectItem>
                      <SelectItem value="finance">المالية</SelectItem>
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

            {/* MAIN ASSIGNMENTS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">تعيينات السياسات</h3>
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                    {assignments.length} تعيين
                  </Badge>
                  <Button
                    onClick={() => setIsAssignDialogOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    تعيين سياسة
                  </Button>
                </div>
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
                      حدث خطأ أثناء تحميل التعيينات
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {error?.message || 'تعذر الاتصال بالخادم'}
                    </p>
                    <Button
                      onClick={() => refetch()}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && assignments.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <UserCheck className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      لا توجد تعيينات سياسة
                    </h3>
                    <p className="text-slate-500 mb-4">قم بتعيين سياسة إجازة للموظفين للبدء</p>
                    <Button
                      onClick={() => setIsAssignDialogOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                      تعيين سياسة
                    </Button>
                  </div>
                )}

                {/* Success State - Assignments List */}
                {!isLoading &&
                  !isError &&
                  assignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${
                        selectedIds.includes(assignment._id)
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : 'border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                          {isSelectionMode && (
                            <Checkbox
                              checked={selectedIds.includes(assignment._id)}
                              onCheckedChange={() => handleSelectAssignment(assignment._id)}
                              className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                          )}
                          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <UserCheck className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-navy text-lg">
                                {assignment.employeeNameAr || assignment.employeeName}
                              </h4>
                              {getStatusBadge(assignment.status)}
                            </div>
                            <p className="text-slate-500 text-sm">
                              {assignment.employeeNumber} • {assignment.department}
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
                            <DropdownMenuItem onClick={() => handleViewAssignment(assignment._id)}>
                              <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {assignment.status === 'active' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCancelAssignment(
                                    assignment._id,
                                    assignment.employeeNameAr
                                  )
                                }
                                className="text-red-600 focus:text-red-600"
                              >
                                <XCircle className="h-4 w-4 ms-2" aria-hidden="true" />
                                إلغاء التعيين
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-4 p-4 bg-white rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="font-medium text-slate-700">
                            {assignment.leavePolicyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {assignment.leavePeriodName} (
                            {new Date(assignment.leavePeriodStartDate).toLocaleDateString('ar-SA')}{' '}
                            - {new Date(assignment.leavePeriodEndDate).toLocaleDateString('ar-SA')})
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200/50">
                        {assignment.allocations.slice(0, 4).map((allocation) => (
                          <div key={allocation.leaveType} className="text-center">
                            <div className="text-xs text-slate-600 mb-1">
                              {allocation.leaveType}
                            </div>
                            <div className="font-bold text-emerald-600 text-lg">
                              {allocation.total} يوم
                            </div>
                            {allocation.carryForward > 0 && (
                              <div className="text-xs text-blue-600">
                                +{allocation.carryForward} محول
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {assignment.allocations.length > 4 && (
                        <div className="mt-2 text-center">
                          <Badge className="bg-slate-100 text-slate-600 border-0 rounded-md px-3 py-1">
                            +{assignment.allocations.length - 4} أنواع أخرى
                          </Badge>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200/50">
                        <div className="text-xs text-slate-500">
                          تاريخ التعيين:{' '}
                          {new Date(assignment.assignmentDate).toLocaleDateString('ar-SA')}
                          <br />
                          فعال من: {new Date(assignment.effectiveFrom).toLocaleDateString('ar-SA')}
                        </div>
                        <Button
                          onClick={() => handleViewAssignment(assignment._id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20"
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar
            context="leave-policy-assignments"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedIds.length}
          />
        </div>
      </Main>

      {/* TODO: Add LeavePolicyAssignDialog component when created */}
      {/* <LeavePolicyAssignDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
      /> */}
    </>
  )
}
