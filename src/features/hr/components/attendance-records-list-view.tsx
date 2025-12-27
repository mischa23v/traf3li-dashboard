import { HRSidebar } from './hr-sidebar'
import { useState, useMemo, useCallback } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useAttendanceRecords, useTodayAttendance } from '@/hooks/useAttendance'
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
  Search, Bell, Plus, Clock, Users, UserCheck, UserX, AlertTriangle,
  Calendar, ChevronLeft, ChevronRight, Eye, LogIn, LogOut, Timer, MapPin,
  Fingerprint, Smartphone, Monitor, CreditCard, AlertCircle, CheckCircle,
  XCircle, Coffee, Building2, MoreHorizontal, Edit3, Trash2, SortAsc, X
} from 'lucide-react'
import type { AttendanceStatus, CheckMethod } from '@/services/attendanceService'
import { ATTENDANCE_STATUS_LABELS, CHECK_METHOD_LABELS } from '@/services/attendanceService'

export function AttendanceRecordsListView() {
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('time')

  // Check if any filter is active
  const hasActiveFilters = useMemo(() =>
    searchQuery || statusFilter !== 'all' || departmentFilter !== 'all',
    [searchQuery, statusFilter, departmentFilter]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setDepartmentFilter('all')
  }, [])

  // Fetch attendance records
  const { data: attendanceData, isLoading, isError, error, refetch } = useAttendanceRecords({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    startDate: dateFilter,
    endDate: dateFilter,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
  })

  // Fetch today's summary
  const { data: todayData } = useTodayAttendance()

  // Filter records based on search
  const filteredRecords = useMemo(() => {
    if (!attendanceData?.data) return []
    let records = attendanceData.data.filter((record) => {
      const matchesSearch =
        record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeNameAr?.includes(searchQuery) ||
        record.employeeNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })

    // Sort records
    if (sortBy === 'time') {
      records.sort((a, b) => new Date(b.checkIn?.time || 0).getTime() - new Date(a.checkIn?.time || 0).getTime())
    } else if (sortBy === 'name') {
      records.sort((a, b) => (a.employeeNameAr || a.employeeName || '').localeCompare(b.employeeNameAr || b.employeeName || ''))
    } else if (sortBy === 'status') {
      records.sort((a, b) => a.status.localeCompare(b.status))
    }

    return records
  }, [attendanceData?.data, searchQuery, sortBy])

  // Selection Handlers
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev)
    setSelectedIds([])
  }, [])

  const handleSelectRecord = useCallback((recordId: string) => {
    setSelectedIds(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} سجل؟`)) {
      // TODO: Implement bulk delete
      setIsSelectionMode(false)
      setSelectedIds([])
    }
  }, [selectedIds])

  // Single record actions
  const handleViewRecord = useCallback((recordId: string) => {
    navigate({ to: ROUTES.dashboard.hr.attendance.detail(recordId), params: { recordId } })
  }, [navigate])

  const handleEditRecord = useCallback((recordId: string) => {
    navigate({ to: ROUTES.dashboard.hr.attendance.new, search: { editId: recordId } })
  }, [navigate])

  const handleDeleteRecord = useCallback((recordId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      // TODO: Implement delete
    }
  }, [])

  // Status badge
  const getStatusBadge = (status: AttendanceStatus) => {
    const config = ATTENDANCE_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      orange: 'bg-orange-100 text-orange-700',
      purple: 'bg-purple-100 text-purple-700',
      slate: 'bg-slate-100 text-slate-600',
      blue: 'bg-blue-100 text-blue-700',
      cyan: 'bg-cyan-100 text-cyan-700',
    }
    const icons: Record<AttendanceStatus, React.ReactNode> = {
      present: <CheckCircle className="w-3 h-3" />,
      absent: <XCircle className="w-3 h-3" />,
      late: <AlertTriangle className="w-3 h-3" aria-hidden="true" />,
      early_departure: <LogOut className="w-3 h-3" />,
      on_leave: <Calendar className="w-3 h-3" aria-hidden="true" />,
      weekend: <Coffee className="w-3 h-3" />,
      holiday: <Calendar className="w-3 h-3" aria-hidden="true" />,
      half_day: <Timer className="w-3 h-3" />,
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-md px-2 flex items-center gap-1`}>
        {icons[status]}
        {config.ar}
      </Badge>
    )
  }

  // Check method icon
  const getCheckMethodIcon = (method?: CheckMethod) => {
    if (!method) return null
    const icons: Record<CheckMethod, React.ReactNode> = {
      biometric: <Fingerprint className="w-4 h-4 text-purple-600" />,
      mobile: <Smartphone className="w-4 h-4 text-blue-600" />,
      manual: <Users className="w-4 h-4 text-slate-600" aria-hidden="true" />,
      web: <Monitor className="w-4 h-4 text-emerald-600" />,
      card_swipe: <CreditCard className="w-4 h-4 text-amber-600" />,
    }
    return icons[method]
  }

  // Format time
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--:--'
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  }

  // Navigate date
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setDateFilter(current => {
      const date = new Date(current)
      if (direction === 'prev') {
        date.setDate(date.getDate() - 1)
      } else {
        date.setDate(date.getDate() + 1)
      }
      return date.toISOString().split('T')[0]
    })
  }, [])

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!todayData?.summary) return undefined
    return [
      { label: 'إجمالي الموظفين', value: todayData.summary.totalEmployees || 0, icon: Users, status: 'normal' as const },
      { label: 'حاضر', value: todayData.summary.present || 0, icon: UserCheck, status: 'normal' as const },
      { label: 'غائب', value: todayData.summary.absent || 0, icon: UserX, status: todayData.summary.absent > 0 ? 'attention' as const : 'zero' as const },
      { label: 'متأخر', value: todayData.summary.late || 0, icon: AlertTriangle, status: todayData.summary.late > 0 ? 'attention' as const : 'zero' as const },
    ]
  }, [todayData])

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الحضور', href: ROUTES.dashboard.hr.attendance.list, isActive: true },
    { title: 'الإجازات', href: ROUTES.dashboard.hr.leave.list, isActive: false },
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD & STATS */}
        <ProductivityHero badge="الموارد البشرية" title="الحضور والانصراف" type="attendance" stats={heroStats} />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                {/* Row 1: Date Navigation and Search */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Date Navigation */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-10 w-10"
                      onClick={() => navigateDate('prev')}
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl h-10">
                      <Calendar className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border-0 bg-transparent p-0 h-auto text-center font-medium w-32"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-10 w-10"
                      onClick={() => navigateDate('next')}
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-10"
                      onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
                    >
                      اليوم
                    </Button>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder="بحث بالاسم أو الرقم الوظيفي..." aria-label="بحث بالاسم أو الرقم الوظيفي"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Row 2: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AttendanceStatus | 'all')}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="present">حاضر</SelectItem>
                      <SelectItem value="absent">غائب</SelectItem>
                      <SelectItem value="late">متأخر</SelectItem>
                      <SelectItem value="early_departure">انصراف مبكر</SelectItem>
                      <SelectItem value="on_leave">في إجازة</SelectItem>
                      <SelectItem value="half_day">نصف يوم</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Department Filter */}
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

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                      <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">وقت الحضور</SelectItem>
                      <SelectItem value="name">الاسم</SelectItem>
                      <SelectItem value="status">الحالة</SelectItem>
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

            {/* MAIN ATTENDANCE LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  سجل الحضور
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {filteredRecords.length} سجل
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل السجلات</h3>
                    <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredRecords.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سجلات</h3>
                    <p className="text-slate-500 mb-4">لا توجد سجلات حضور لهذا اليوم</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to="/dashboard/hr/attendance/new">
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        تسجيل حضور
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Attendance Records List */}
                {!isLoading && !isError && filteredRecords.map((record) => (
                  <div key={record._id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(record._id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(record._id)}
                            onCheckedChange={() => handleSelectRecord(record._id)}
                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        )}
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                          {(record.employeeNameAr || record.employeeName || '?').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-navy text-lg">{record.employeeNameAr || record.employeeName}</h4>
                            {getStatusBadge(record.status)}
                            {record.lateArrival?.isLate && !record.lateArrival.excused && (
                              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                متأخر {record.lateArrival.lateMinutes} دقيقة
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm">{record.employeeNumber} • {record.department || '-'}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewRecord(record._id)}>
                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditRecord(record._id)}>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                            تعديل السجل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRecord(record._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                            حذف السجل
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        {/* Check-in */}
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <LogIn className="w-4 h-4" />
                            <span className="font-bold">{formatTime(record.checkIn?.time)}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                            {getCheckMethodIcon(record.checkIn?.method)}
                            <span>{record.checkIn?.method ? CHECK_METHOD_LABELS[record.checkIn.method].ar : '-'}</span>
                          </div>
                        </div>

                        {/* Check-out */}
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-red-600">
                            <LogOut className="w-4 h-4" />
                            <span className="font-bold">{formatTime(record.checkOut?.time)}</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                            {getCheckMethodIcon(record.checkOut?.method)}
                            <span>{record.checkOut?.method ? CHECK_METHOD_LABELS[record.checkOut.method].ar : '-'}</span>
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="text-center min-w-[60px]">
                          <div className="flex items-center gap-1 text-blue-600">
                            <Timer className="w-4 h-4" />
                            <span className="font-bold">{record.hoursWorked?.toFixed(1) || 0}</span>
                          </div>
                          <p className="text-xs text-slate-500">ساعة</p>
                        </div>

                        {/* Location */}
                        {record.workLocation && (
                          <div className="text-center">
                            <MapPin className="w-4 h-4 text-slate-500 mx-auto" aria-hidden="true" />
                            <p className="text-xs text-slate-500">
                              {record.workLocation === 'office' ? 'المكتب' :
                               record.workLocation === 'remote' ? 'عن بعد' :
                               record.workLocation === 'client_site' ? 'موقع العميل' :
                               record.workLocation === 'court' ? 'المحكمة' : 'ميداني'}
                            </p>
                          </div>
                        )}
                      </div>
                      <Link to={ROUTES.dashboard.hr.attendance.detail(record._id)}>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                          عرض السجل
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 pt-0 text-center">
                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                  عرض جميع السجلات
                  <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar
            context="attendance"
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
