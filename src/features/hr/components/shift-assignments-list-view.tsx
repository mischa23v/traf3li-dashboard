import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import {
  useShiftAssignments,
  useShiftAssignmentStats,
  useBulkAssignShift,
  useDeleteAssignment,
} from '@/hooks/useShiftAssignment'
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
  Search, Bell, Plus, Clock, Users, UserPlus, Building2,
  ChevronLeft, ChevronRight, Eye, MoreHorizontal, Edit3, Trash2,
  X, Calendar, CheckCircle, XCircle, CalendarClock, RefreshCw,
  Download, Upload, UserMinus
} from 'lucide-react'
import type { ShiftAssignmentStatus } from '@/services/shiftAssignmentService'
import { SHIFT_ASSIGNMENT_STATUS_LABELS } from '@/services/shiftAssignmentService'
import { ShiftAssignmentDialog } from '@/components/hr/attendance/ShiftAssignmentDialog'
import { useToast } from '@/hooks/use-toast'

export function ShiftAssignmentsListView() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false)
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | undefined>()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShiftAssignmentStatus | 'all'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [shiftTypeFilter, setShiftTypeFilter] = useState<string>('all')
  const [isRotationalFilter, setIsRotationalFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'all' ||
    departmentFilter !== 'all' ||
    shiftTypeFilter !== 'all' ||
    isRotationalFilter !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDepartmentFilter('all')
    setShiftTypeFilter('all')
    setIsRotationalFilter('all')
  }

  // Fetch shift assignments
  const {
    data: assignmentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useShiftAssignments({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
    shiftTypeId: shiftTypeFilter !== 'all' ? shiftTypeFilter : undefined,
    isRotational: isRotationalFilter !== 'all' ? isRotationalFilter === 'yes' : undefined,
  })

  // Fetch statistics
  const { data: statsData } = useShiftAssignmentStats()

  // Mutations
  const bulkAssignMutation = useBulkAssignShift()
  const deleteAssignmentMutation = useDeleteAssignment()

  // Filter records based on search
  const filteredRecords = useMemo(() => {
    if (!assignmentsData?.data) return []
    let records = assignmentsData.data.filter((record) => {
      const matchesSearch =
        record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeNameAr?.includes(searchQuery) ||
        record.employeeNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.shiftTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.shiftTypeNameAr?.includes(searchQuery)
      return matchesSearch
    })

    // Sort records
    if (sortBy === 'date') {
      records.sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
    } else if (sortBy === 'name') {
      records.sort((a, b) =>
        (a.employeeNameAr || a.employeeName || '').localeCompare(
          b.employeeNameAr || b.employeeName || ''
        )
      )
    } else if (sortBy === 'status') {
      records.sort((a, b) => a.status.localeCompare(b.status))
    }

    return records
  }, [assignmentsData?.data, searchQuery, sortBy])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds([])
  }

  const handleSelectRecord = (recordId: string) => {
    if (selectedIds.includes(recordId)) {
      setSelectedIds(selectedIds.filter((id) => id !== recordId))
    } else {
      setSelectedIds([...selectedIds, recordId])
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRecords.map((r) => r._id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (
      confirm(`هل أنت متأكد من حذف ${selectedIds.length} مهمة نوبة؟`)
    ) {
      try {
        await Promise.all(
          selectedIds.map((id) => deleteAssignmentMutation.mutateAsync(id))
        )
        toast({
          title: 'تم الحذف',
          description: `تم حذف ${selectedIds.length} مهمة نوبة بنجاح`,
        })
        setIsSelectionMode(false)
        setSelectedIds([])
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل حذف بعض المهام',
          variant: 'destructive',
        })
      }
    }
  }

  // Single record actions
  const handleViewRecord = (assignmentId: string) => {
    navigate({
      to: ROUTES.dashboard.hr.shiftAssignments.detail(assignmentId),
      params: { assignmentId },
    })
  }

  const handleEditRecord = (assignmentId: string) => {
    setEditingAssignmentId(assignmentId)
    setShowAssignDialog(true)
  }

  const handleDeleteRecord = async (assignmentId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      try {
        await deleteAssignmentMutation.mutateAsync(assignmentId)
        toast({
          title: 'تم الحذف',
          description: 'تم حذف مهمة النوبة بنجاح',
        })
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'فشل حذف المهمة',
          variant: 'destructive',
        })
      }
    }
  }

  const handleNewAssignment = () => {
    setEditingAssignmentId(undefined)
    setShowAssignDialog(true)
  }

  const handleBulkAssign = () => {
    setShowBulkAssignDialog(true)
  }

  // Status badge
  const getStatusBadge = (status: ShiftAssignmentStatus) => {
    const config = SHIFT_ASSIGNMENT_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
    const icons: Record<ShiftAssignmentStatus, React.ReactNode> = {
      active: <CheckCircle className="w-3 h-3" />,
      inactive: <XCircle className="w-3 h-3" />,
      scheduled: <CalendarClock className="w-3 h-3" />,
    }
    return (
      <Badge
        className={`${colorClasses[config.color]} border-0 rounded-md px-2 flex items-center gap-1`}
      >
        {icons[status]}
        {config.ar}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!statsData) return undefined
    return [
      {
        label: 'إجمالي المهام',
        value: statsData.totalAssignments || 0,
        icon: Users,
        status: 'normal' as const,
      },
      {
        label: 'نوبات نشطة',
        value: statsData.activeAssignments || 0,
        icon: UserPlus,
        status: 'normal' as const,
      },
      {
        label: 'نوبات دورية',
        value: statsData.rotationalAssignments || 0,
        icon: RefreshCw,
        status: 'normal' as const,
      },
    ]
  }, [statsData])

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الحضور', href: ROUTES.dashboard.hr.attendance.list, isActive: false },
    {
      title: 'مهام النوبات',
      href: ROUTES.dashboard.hr.shiftAssignments.list,
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

        {/* Dynamic Island - Centered */}
        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
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
        className="bg-[#f8f9fa] dark:bg-slate-950 flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge="الموارد البشرية"
          title="مهام النوبات"
          type="shift-assignments"
          stats={heroStats}
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* FILTERS & ACTIONS BAR */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-4">
                {/* Row 1: Search and Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search
                      className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    />
                    <Input
                      type="text"
                      placeholder="بحث عن موظف أو نوبة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 rounded-xl h-10"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ms-auto">
                    <Button
                      onClick={handleNewAssignment}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10"
                    >
                      <Plus className="w-4 h-4 me-2" />
                      مهمة جديدة
                    </Button>
                    <Button
                      onClick={handleBulkAssign}
                      variant="outline"
                      className="rounded-xl h-10"
                    >
                      <UserPlus className="w-4 h-4 me-2" />
                      مهام جماعية
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl h-10 w-10"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={handleToggleSelectionMode}
                        >
                          {isSelectionMode ? 'إلغاء التحديد' : 'تحديد متعدد'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 me-2" />
                          تصدير
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="w-4 h-4 me-2" />
                          استيراد
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Row 2: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as ShiftAssignmentStatus | 'all')
                    }
                  >
                    <SelectTrigger className="w-[140px] rounded-xl h-10">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الحالات</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Department Filter */}
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="w-[140px] rounded-xl h-10">
                      <SelectValue placeholder="القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الأقسام</SelectItem>
                      {/* TODO: Load departments dynamically */}
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                      <SelectItem value="it">تقنية المعلومات</SelectItem>
                      <SelectItem value="sales">المبيعات</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Rotational Filter */}
                  <Select
                    value={isRotationalFilter}
                    onValueChange={setIsRotationalFilter}
                  >
                    <SelectTrigger className="w-[140px] rounded-xl h-10">
                      <SelectValue placeholder="النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل الأنواع</SelectItem>
                      <SelectItem value="yes">نوبات دورية</SelectItem>
                      <SelectItem value="no">نوبات ثابتة</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Filter */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] rounded-xl h-10">
                      <SelectValue placeholder="ترتيب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">التاريخ</SelectItem>
                      <SelectItem value="name">الاسم</SelectItem>
                      <SelectItem value="status">الحالة</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-slate-600 dark:text-slate-400 rounded-xl h-10"
                    >
                      <X className="w-4 h-4 me-2" />
                      مسح الفلاتر
                    </Button>
                  )}
                </div>

                {/* Selection Mode Actions */}
                {isSelectionMode && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredRecords.length &&
                        filteredRecords.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      {selectedIds.length > 0
                        ? `تم تحديد ${selectedIds.length} من ${filteredRecords.length}`
                        : 'تحديد الكل'}
                    </span>
                    {selectedIds.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelected}
                        className="ms-auto rounded-xl"
                      >
                        <Trash2 className="w-4 h-4 me-2" />
                        حذف المحدد
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ASSIGNMENTS LIST */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="p-12 text-center">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    خطأ في تحميل البيانات
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {error?.message || 'حدث خطأ غير متوقع'}
                  </p>
                  <Button onClick={() => refetch()} className="rounded-xl">
                    إعادة المحاولة
                  </Button>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <UserMinus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    لا توجد مهام نوبات
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {hasActiveFilters
                      ? 'لم يتم العثور على نتائج للفلاتر المحددة'
                      : 'ابدأ بإضافة مهام نوبات جديدة للموظفين'}
                  </p>
                  {!hasActiveFilters && (
                    <Button
                      onClick={handleNewAssignment}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 me-2" />
                      إضافة مهمة نوبة
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(assignment._id)}
                            onCheckedChange={() =>
                              handleSelectRecord(assignment._id)
                            }
                            className="mt-1"
                          />
                        )}

                        {/* Assignment Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                {assignment.employeeNameAr ||
                                  assignment.employeeName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span>{assignment.employeeNumber}</span>
                                {assignment.departmentName && (
                                  <>
                                    <span>•</span>
                                    <Building2 className="w-3 h-3" />
                                    <span>
                                      {assignment.departmentNameAr ||
                                        assignment.departmentName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(assignment.status)}
                              {assignment.isRotational && (
                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 rounded-md px-2 flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3" />
                                  دوري
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Shift Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {assignment.shiftTypeNameAr ||
                                  assignment.shiftTypeName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>من {formatDate(assignment.startDate)}</span>
                              {assignment.endDate && (
                                <span>
                                  {' '}
                                  - {formatDate(assignment.endDate)}
                                </span>
                              )}
                              {!assignment.endDate && (
                                <span className="text-xs text-slate-500">
                                  (دائم)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {assignment.notes?.assignmentNotes && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                              {assignment.notes.assignmentNotes}
                            </p>
                          )}
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg shrink-0"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewRecord(assignment._id)}
                            >
                              <Eye className="w-4 h-4 me-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditRecord(assignment._id)}
                            >
                              <Edit3 className="w-4 h-4 me-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteRecord(assignment._id)
                              }
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 me-2" />
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

            {/* Pagination */}
            {assignmentsData && assignmentsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  عرض {filteredRecords.length} من{' '}
                  {assignmentsData.pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium">
                    {assignmentsData.pagination.page} من{' '}
                    {assignmentsData.pagination.totalPages}
                  </div>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <div className="space-y-6">
            <HRSidebar activeSection="shift-assignments" />

            {/* Quick Stats Card */}
            {statsData && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  إحصائيات سريعة
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      إجمالي المهام
                    </span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {statsData.totalAssignments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      نوبات نشطة
                    </span>
                    <span className="text-lg font-semibold text-emerald-600">
                      {statsData.activeAssignments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      نوبات دورية
                    </span>
                    <span className="text-lg font-semibold text-purple-600">
                      {statsData.rotationalAssignments}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Main>

      {/* Dialogs */}
      {showAssignDialog && (
        <ShiftAssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          assignmentId={editingAssignmentId}
          onSuccess={() => {
            setShowAssignDialog(false)
            setEditingAssignmentId(undefined)
            refetch()
          }}
        />
      )}
    </>
  )
}
