import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { useAttendanceRecords, useTodayAttendance } from '@/hooks/useAttendance'
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
  Search, Bell, Plus, Filter, Clock, Users, UserCheck, UserX, AlertTriangle,
  Calendar, ChevronLeft, ChevronRight, Eye, LogIn, LogOut, Timer, MapPin,
  Fingerprint, Smartphone, Monitor, CreditCard, AlertCircle, CheckCircle,
  XCircle, Coffee, Building2
} from 'lucide-react'
import type { AttendanceStatus, CheckMethod } from '@/services/attendanceService'
import { ATTENDANCE_STATUS_LABELS, CHECK_METHOD_LABELS } from '@/services/attendanceService'

export function AttendanceRecordsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Fetch attendance records
  const { data: attendanceData, isLoading, isError } = useAttendanceRecords({
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
    return attendanceData.data.filter((record) => {
      const matchesSearch =
        record.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeNameAr?.includes(searchQuery) ||
        record.employeeNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [attendanceData?.data, searchQuery])

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
      late: <AlertTriangle className="w-3 h-3" />,
      early_departure: <LogOut className="w-3 h-3" />,
      on_leave: <Calendar className="w-3 h-3" />,
      weekend: <Coffee className="w-3 h-3" />,
      holiday: <Calendar className="w-3 h-3" />,
      half_day: <Timer className="w-3 h-3" />,
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-2 py-0.5 flex items-center gap-1`}>
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
      manual: <Users className="w-4 h-4 text-slate-600" />,
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
  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(dateFilter)
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1)
    } else {
      current.setDate(current.getDate() + 1)
    }
    setDateFilter(current.toISOString().split('T')[0])
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: true },
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
            <h1 className="text-2xl font-bold text-navy">الحضور والانصراف</h1>
            <p className="text-slate-500">متابعة حضور وانصراف الموظفين</p>
          </div>
          <Button
            onClick={() => navigate({ to: '/dashboard/hr/attendance/new' })}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 ml-2" />
            تسجيل حضور
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold text-navy">{todayData?.summary?.totalEmployees || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">حاضر</p>
                  <p className="text-2xl font-bold text-emerald-600">{todayData?.summary?.present || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">غائب</p>
                  <p className="text-2xl font-bold text-red-600">{todayData?.summary?.absent || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">متأخر</p>
                  <p className="text-2xl font-bold text-amber-600">{todayData?.summary?.late || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">في إجازة</p>
                  <p className="text-2xl font-bold text-purple-600">{todayData?.summary?.onLeave || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date Navigation & Filters */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto text-center font-medium"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl mr-2"
                  onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
                >
                  اليوم
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="بحث بالاسم أو الرقم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pr-10 rounded-xl"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AttendanceStatus | 'all')}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <Filter className="w-4 h-4 ml-2" />
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

        {/* Attendance Records */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                سجل الحضور
              </CardTitle>
              <Badge className="bg-slate-100 text-slate-600 border-0">
                {filteredRecords.length} سجل
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">حدث خطأ</h3>
                <p className="text-slate-500">فشل في تحميل سجلات الحضور</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد سجلات</h3>
                <p className="text-slate-500 mb-4">لا توجد سجلات حضور لهذا اليوم</p>
                <Button
                  onClick={() => navigate({ to: '/dashboard/hr/attendance/new' })}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  تسجيل حضور
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate({ to: '/dashboard/hr/attendance/$recordId', params: { recordId: record._id } })}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-bold text-lg">
                          {(record.employeeNameAr || record.employeeName || '?').charAt(0)}
                        </span>
                      </div>

                      {/* Employee Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy">
                            {record.employeeNameAr || record.employeeName}
                          </span>
                          {getStatusBadge(record.status)}
                          {record.lateArrival?.isLate && !record.lateArrival.excused && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                              متأخر {record.lateArrival.lateMinutes} دقيقة
                            </Badge>
                          )}
                          {record.violations?.hasViolations && (
                            <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                              <AlertTriangle className="w-3 h-3 ml-1" />
                              {record.violations.violationCount} مخالفة
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {record.employeeNumber} • {record.department || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Time Info */}
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
                          <MapPin className="w-4 h-4 text-slate-400 mx-auto" />
                          <p className="text-xs text-slate-500">
                            {record.workLocation === 'office' ? 'المكتب' :
                             record.workLocation === 'remote' ? 'عن بعد' :
                             record.workLocation === 'client_site' ? 'موقع العميل' :
                             record.workLocation === 'court' ? 'المحكمة' : 'ميداني'}
                          </p>
                        </div>
                      )}

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
      </Main>
    </>
  )
}
