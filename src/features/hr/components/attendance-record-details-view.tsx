import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  useAttendanceRecord,
  useApproveTimesheet,
  useRejectTimesheet,
  useExcuseLateArrival,
  useApproveEarlyDeparture,
  useApproveOvertime,
  useRequestCorrection,
  useConfirmViolation,
  useDismissViolation,
} from '@/hooks/useAttendance'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Search, Bell, ArrowRight, AlertCircle, Calendar, User, Clock,
  FileText, CheckCircle, XCircle, MoreHorizontal, Download, Send,
  LogIn, LogOut, Timer, MapPin, Fingerprint, Smartphone, Monitor,
  CreditCard, AlertTriangle, Coffee, Shield, Edit, Eye, Ban,
  Building2, TrendingUp, DollarSign, Users
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { AttendanceStatus, CheckMethod } from '@/services/attendanceService'
import { ATTENDANCE_STATUS_LABELS, CHECK_METHOD_LABELS, DAY_OF_WEEK_LABELS } from '@/services/attendanceService'

export function AttendanceRecordDetailsView() {
  const navigate = useNavigate()
  const { recordId } = useParams({ from: '/_authenticated/dashboard/hr/attendance/$recordId' })

  // Fetch record
  const { data: record, isLoading, isError, error } = useAttendanceRecord(recordId)

  // Mutations
  const approveTimesheetMutation = useApproveTimesheet()
  const rejectTimesheetMutation = useRejectTimesheet()
  const excuseLateMutation = useExcuseLateArrival()
  const approveEarlyMutation = useApproveEarlyDeparture()
  const approveOvertimeMutation = useApproveOvertime()
  const requestCorrectionMutation = useRequestCorrection()
  const confirmViolationMutation = useConfirmViolation()
  const dismissViolationMutation = useDismissViolation()

  // Dialog states
  const [showExcuseDialog, setShowExcuseDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false)
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false)
  const [excuseReason, setExcuseReason] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [correctionField, setCorrectionField] = useState('')
  const [correctionValue, setCorrectionValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [approvedOvertimeHours, setApprovedOvertimeHours] = useState('')

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
      on_leave: <Calendar className="w-3 h-3" aria-hidden="true" />,
      weekend: <Coffee className="w-3 h-3" />,
      holiday: <Calendar className="w-3 h-3" aria-hidden="true" />,
      half_day: <Timer className="w-3 h-3" />,
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-3 py-1 flex items-center gap-1 text-sm`}>
        {icons[status]}
        {config.ar}
      </Badge>
    )
  }

  // Check method icon and label
  const getCheckMethodDisplay = (method?: CheckMethod) => {
    if (!method) return { icon: null, label: '-' }
    const icons: Record<CheckMethod, React.ReactNode> = {
      biometric: <Fingerprint className="w-4 h-4 text-purple-600" />,
      mobile: <Smartphone className="w-4 h-4 text-blue-600" />,
      manual: <Users className="w-4 h-4 text-slate-600" />,
      web: <Monitor className="w-4 h-4 text-emerald-600" />,
      card_swipe: <CreditCard className="w-4 h-4 text-amber-600" />,
    }
    return {
      icon: icons[method],
      label: CHECK_METHOD_LABELS[method].ar,
    }
  }

  // Format time
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--:--'
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ar-SA')
  }

  // Action handlers
  const handleApproveTimesheet = () => {
    approveTimesheetMutation.mutate({ recordId })
  }

  const handleRejectTimesheet = () => {
    rejectTimesheetMutation.mutate({ recordId, reason: rejectReason }, {
      onSuccess: () => {
        setShowRejectDialog(false)
        setRejectReason('')
      }
    })
  }

  const handleExcuseLate = () => {
    excuseLateMutation.mutate({ recordId, reason: excuseReason }, {
      onSuccess: () => {
        setShowExcuseDialog(false)
        setExcuseReason('')
      }
    })
  }

  const handleApproveEarly = () => {
    approveEarlyMutation.mutate({ recordId })
  }

  const handleApproveOvertime = () => {
    approveOvertimeMutation.mutate(
      { recordId, approvedHours: parseFloat(approvedOvertimeHours) },
      {
        onSuccess: () => {
          setShowOvertimeDialog(false)
          setApprovedOvertimeHours('')
        }
      }
    )
  }

  const handleRequestCorrection = () => {
    requestCorrectionMutation.mutate({
      recordId,
      data: {
        correctionType: 'wrong_time',
        field: correctionField,
        requestedValue: correctionValue,
        reason: correctionReason,
      }
    }, {
      onSuccess: () => {
        setShowCorrectionDialog(false)
        setCorrectionField('')
        setCorrectionValue('')
        setCorrectionReason('')
      }
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: true },
    { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
  ]

  const checkInDisplay = getCheckMethodDisplay(record?.checkIn?.method)
  const checkOutDisplay = getCheckMethodDisplay(record?.checkOut?.method)

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD - Always visible */}
        <ProductivityHero badge="الموارد البشرية" title="تفاصيل سجل الحضور" type="attendance" />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
              </div>
            )}

            {/* Error State */}
            {!isLoading && (isError || !record) && (
              <div className="bg-white rounded-2xl p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" aria-hidden="true" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">لم يتم العثور على السجل</h2>
                <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل بيانات السجل'}</p>
                <Button onClick={() => navigate({ to: '/dashboard/hr/attendance' })} className="bg-emerald-500 hover:bg-emerald-600">
                  العودة للقائمة
                </Button>
              </div>
            )}

            {/* Success State */}
            {!isLoading && !isError && record && (
              <>
                {/* Page Header */}
                <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-white"
              onClick={() => navigate({ to: '/dashboard/hr/attendance' })}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-navy">سجل الحضور</h1>
                {getStatusBadge(record.status)}
                {record.lateArrival?.isLate && !record.lateArrival.excused && (
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    متأخر {record.lateArrival.lateMinutes} دقيقة
                  </Badge>
                )}
              </div>
              <p className="text-slate-500">
                {record.recordNumber} • {record.employeeNameAr || record.employeeName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Action buttons */}
            {record.lateArrival?.isLate && !record.lateArrival.excused && (
              <Button
                onClick={() => setShowExcuseDialog(true)}
                variant="outline"
                className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50"
              >
                <CheckCircle className="w-4 h-4 ms-2" />
                قبول التأخير
              </Button>
            )}
            {record.approvals?.timesheetApproval?.status === 'pending' && (
              <>
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  variant="outline"
                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 ms-2" />
                  رفض
                </Button>
                <Button
                  onClick={handleApproveTimesheet}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  disabled={approveTimesheetMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 ms-2" />
                  اعتماد
                </Button>
              </>
            )}

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowCorrectionDialog(true)}>
                  <Edit className="h-4 w-4 ms-2" aria-hidden="true" />
                  طلب تصحيح
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                  تصدير PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {record.overtimeHours > 0 && !record.approvals?.overtimeApproval?.status && (
                  <DropdownMenuItem onClick={() => setShowOvertimeDialog(true)}>
                    <Timer className="h-4 w-4 ms-2" />
                    اعتماد الوقت الإضافي
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">وقت الحضور</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatTime(record.checkIn?.time)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">وقت الانصراف</p>
                  <p className="text-2xl font-bold text-red-600">{formatTime(record.checkOut?.time)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">ساعات العمل</p>
                  <p className="text-2xl font-bold text-navy">{record.hoursWorked?.toFixed(1) || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">ساعات إضافية</p>
                  <p className="text-2xl font-bold text-purple-600">{record.overtimeHours?.toFixed(1) || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white rounded-xl p-1 shadow-sm">
            <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
            <TabsTrigger value="time" className="rounded-lg">التوقيت</TabsTrigger>
            {record.breaks && <TabsTrigger value="breaks" className="rounded-lg">الاستراحات</TabsTrigger>}
            {record.violations?.hasViolations && <TabsTrigger value="violations" className="rounded-lg">المخالفات</TabsTrigger>}
            {record.complianceChecks && <TabsTrigger value="compliance" className="rounded-lg">الامتثال</TabsTrigger>}
            <TabsTrigger value="payroll" className="rounded-lg">الرواتب</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Info */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    معلومات الموظف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">الاسم</span>
                    <span className="font-medium text-navy">{record.employeeNameAr || record.employeeName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">رقم الموظف</span>
                    <span className="font-medium text-navy">{record.employeeNumber}</span>
                  </div>
                  {record.department && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-500">القسم</span>
                      <span className="font-medium text-navy">{record.department}</span>
                    </div>
                  )}
                  {record.jobTitle && (
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">المسمى الوظيفي</span>
                      <span className="font-medium text-navy">{record.jobTitle}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Date Info */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    معلومات التاريخ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">التاريخ</span>
                    <span className="font-medium text-navy">{formatDate(record.dateInfo?.workDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">اليوم</span>
                    <span className="font-medium text-navy">{record.dateInfo?.dayOfWeekAr || DAY_OF_WEEK_LABELS[record.dateInfo?.dayOfWeek?.toLowerCase() || '']?.ar}</span>
                  </div>
                  {record.dateInfo?.isPublicHoliday && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-500">عطلة رسمية</span>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        {record.dateInfo.holidayNameAr || record.dateInfo.holidayName}
                      </Badge>
                    </div>
                  )}
                  {record.dateInfo?.isRamadan && (
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">رمضان</span>
                      <Badge className="bg-purple-100 text-purple-700 border-0">
                        اليوم {record.dateInfo.ramadanDay}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Info */}
              {record.workLocation && (
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      موقع العمل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-500">نوع الموقع</span>
                      <Badge className="bg-slate-100 text-slate-700 border-0">
                        {record.workLocation === 'office' ? 'المكتب' :
                         record.workLocation === 'remote' ? 'عن بعد' :
                         record.workLocation === 'client_site' ? 'موقع العميل' :
                         record.workLocation === 'court' ? 'المحكمة' : 'ميداني'}
                      </Badge>
                    </div>
                    {record.locationDetails?.officeName && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">اسم الموقع</span>
                        <span className="font-medium text-navy">{record.locationDetails.officeName}</span>
                      </div>
                    )}
                    {record.locationDetails?.officeAddress && (
                      <div className="flex justify-between py-2">
                        <span className="text-slate-500">العنوان</span>
                        <span className="font-medium text-navy">{record.locationDetails.officeAddress}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Late Arrival Info */}
              {record.lateArrival?.isLate && (
                <Card className={`border-none shadow-sm rounded-2xl ${record.lateArrival.excused ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-base font-bold flex items-center gap-2 ${record.lateArrival.excused ? 'text-emerald-800' : 'text-amber-800'}`}>
                      <AlertTriangle className="w-4 h-4" />
                      تفاصيل التأخير
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-amber-200">
                      <span className={record.lateArrival.excused ? 'text-emerald-600' : 'text-amber-600'}>مدة التأخير</span>
                      <span className="font-bold">{record.lateArrival.lateMinutes} دقيقة</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-amber-200">
                      <span className={record.lateArrival.excused ? 'text-emerald-600' : 'text-amber-600'}>التصنيف</span>
                      <Badge className={`border-0 ${
                        record.lateArrival.lateCategory === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                        record.lateArrival.lateCategory === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.lateArrival.lateCategory === 'minor' ? 'بسيط' :
                         record.lateArrival.lateCategory === 'moderate' ? 'متوسط' : 'شديد'}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b border-amber-200">
                      <span className={record.lateArrival.excused ? 'text-emerald-600' : 'text-amber-600'}>الحالة</span>
                      <Badge className={`border-0 ${record.lateArrival.excused ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {record.lateArrival.excused ? 'مقبول' : 'غير مقبول'}
                      </Badge>
                    </div>
                    {record.lateArrival.reason && (
                      <div className="pt-2">
                        <span className={`text-sm ${record.lateArrival.excused ? 'text-emerald-600' : 'text-amber-600'}`}>السبب:</span>
                        <p className="text-navy mt-1">{record.lateArrival.reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Time Tab */}
          <TabsContent value="time" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-in Details */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-emerald-600" />
                    تفاصيل الحضور
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">الوقت</span>
                    <span className="font-bold text-emerald-600 text-lg">{formatTime(record.checkIn?.time)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">طريقة التسجيل</span>
                    <div className="flex items-center gap-2">
                      {checkInDisplay.icon}
                      <span className="font-medium text-navy">{checkInDisplay.label}</span>
                    </div>
                  </div>
                  {record.checkIn?.location?.type && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-500">الموقع</span>
                      <span className="font-medium text-navy">
                        {record.checkIn.location.type === 'office' ? 'المكتب' :
                         record.checkIn.location.type === 'remote' ? 'عن بعد' : record.checkIn.location.locationName}
                      </span>
                    </div>
                  )}
                  {record.scheduledTime?.scheduledCheckIn && (
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">الوقت المجدول</span>
                      <span className="font-medium text-slate-600">{formatTime(record.scheduledTime.scheduledCheckIn)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Check-out Details */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-600" />
                    تفاصيل الانصراف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">الوقت</span>
                    <span className="font-bold text-red-600 text-lg">{formatTime(record.checkOut?.time)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">طريقة التسجيل</span>
                    <div className="flex items-center gap-2">
                      {checkOutDisplay.icon}
                      <span className="font-medium text-navy">{checkOutDisplay.label}</span>
                    </div>
                  </div>
                  {record.checkOut?.location?.type && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-500">الموقع</span>
                      <span className="font-medium text-navy">
                        {record.checkOut.location.type === 'office' ? 'المكتب' :
                         record.checkOut.location.type === 'remote' ? 'عن بعد' : record.checkOut.location.locationName}
                      </span>
                    </div>
                  )}
                  {record.scheduledTime?.scheduledCheckOut && (
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">الوقت المجدول</span>
                      <span className="font-medium text-slate-600">{formatTime(record.scheduledTime.scheduledCheckOut)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hours Summary */}
              <Card className="border-none shadow-sm bg-white rounded-2xl md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-600" />
                    ملخص الساعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <div className="text-sm text-blue-600 mb-1">ساعات عادية</div>
                      <div className="text-2xl font-bold text-blue-800">{record.regularHours?.toFixed(1) || 0}</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                      <div className="text-sm text-purple-600 mb-1">ساعات إضافية</div>
                      <div className="text-2xl font-bold text-purple-800">{record.overtimeHours?.toFixed(1) || 0}</div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl text-center">
                      <div className="text-sm text-amber-600 mb-1">وقت الاستراحة</div>
                      <div className="text-2xl font-bold text-amber-800">{record.breaks?.totalBreakTime || 0} د</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl text-center">
                      <div className="text-sm text-emerald-600 mb-1">إجمالي الساعات</div>
                      <div className="text-2xl font-bold text-emerald-800">{record.hoursWorked?.toFixed(1) || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Breaks Tab */}
          {record.breaks && (
            <TabsContent value="breaks" className="space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-emerald-600" />
                    الاستراحات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {record.breaks.lunchBreak && (
                    <div className="p-4 bg-amber-50 rounded-xl mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-amber-800">استراحة الغداء</span>
                        <Badge className={`border-0 ${record.breaks.lunchBreak.meetsMinimum ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {record.breaks.lunchBreak.meetsMinimum ? 'متوافق' : 'غير متوافق'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-amber-600">البدء:</span>
                          <span className="font-medium me-2">{formatTime(record.breaks.lunchBreak.startTime)}</span>
                        </div>
                        <div>
                          <span className="text-amber-600">الانتهاء:</span>
                          <span className="font-medium me-2">{formatTime(record.breaks.lunchBreak.endTime)}</span>
                        </div>
                        <div>
                          <span className="text-amber-600">المدة:</span>
                          <span className="font-medium me-2">{record.breaks.lunchBreak.duration} دقيقة</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {record.breaks.prayerBreaks && record.breaks.prayerBreaks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-700">استراحات الصلاة</h4>
                      {record.breaks.prayerBreaks.map((prayer, idx) => (
                        <div key={idx} className="p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                          <span className="font-medium text-purple-800">{prayer.breakNameAr || prayer.breakName}</span>
                          <span className="text-purple-600">{prayer.duration} دقيقة</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-slate-500">إجمالي الاستراحات</div>
                        <div className="font-bold text-navy">{record.breaks.totalBreakTime} دقيقة</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">استراحات مدفوعة</div>
                        <div className="font-bold text-emerald-600">{record.breaks.totalPaidBreaks} دقيقة</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">استراحات غير مدفوعة</div>
                        <div className="font-bold text-red-600">{record.breaks.totalUnpaidBreaks} دقيقة</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Violations Tab */}
          {record.violations?.hasViolations && (
            <TabsContent value="violations" className="space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      المخالفات المكتشفة
                    </CardTitle>
                    <Badge className="bg-red-100 text-red-700 border-0">
                      {record.violations.violationCount} مخالفة
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {record.violations.detectedViolations.map((violation, idx) => (
                      <div key={idx} className="p-4 bg-red-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`border-0 ${
                              violation.severity === 'minor' ? 'bg-yellow-100 text-yellow-700' :
                              violation.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {violation.severity === 'minor' ? 'بسيط' :
                               violation.severity === 'moderate' ? 'متوسط' : 'شديد'}
                            </Badge>
                            <span className="font-bold text-red-800">{violation.violationType}</span>
                          </div>
                          <Badge className={`border-0 ${
                            violation.status === 'confirmed' ? 'bg-red-100 text-red-700' :
                            violation.status === 'dismissed' ? 'bg-slate-100 text-slate-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {violation.status === 'confirmed' ? 'مؤكد' :
                             violation.status === 'dismissed' ? 'مرفوض' :
                             violation.status === 'detected' ? 'مكتشف' : 'قيد المراجعة'}
                          </Badge>
                        </div>
                        <p className="text-red-700 text-sm mb-2">{violation.violationDescriptionAr || violation.violationDescription}</p>
                        {violation.penalty && (
                          <div className="text-sm text-red-600">
                            العقوبة: {violation.penalty.penaltyType === 'warning' ? 'إنذار' :
                                      violation.penalty.penaltyType === 'percentage' ? `خصم ${violation.penalty.penaltyPercentage}%` :
                                      `إيقاف ${violation.penalty.penaltyDays} يوم`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Compliance Tab */}
          {record.complianceChecks && (
            <TabsContent value="compliance" className="space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      فحوصات الامتثال
                    </CardTitle>
                    <Badge className={`border-0 ${
                      record.complianceChecks.overallCompliance === 'compliant' ? 'bg-emerald-100 text-emerald-700' :
                      record.complianceChecks.overallCompliance === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.complianceChecks.overallCompliance === 'compliant' ? 'متوافق' :
                       record.complianceChecks.overallCompliance === 'warning' ? 'تحذير' : 'مخالفة'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Daily Hours Check */}
                    <div className={`p-4 rounded-xl ${record.complianceChecks.dailyHoursCheck.compliant ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">ساعات العمل اليومية (المادة 98)</span>
                        <Badge className={`border-0 ${record.complianceChecks.dailyHoursCheck.compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {record.complianceChecks.dailyHoursCheck.compliant ? 'متوافق' : 'مخالف'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        الحد الأقصى: {record.complianceChecks.dailyHoursCheck.limit} ساعة |
                        الفعلي: {record.complianceChecks.dailyHoursCheck.actual} ساعة
                      </p>
                    </div>

                    {/* Break Requirement Check */}
                    <div className={`p-4 rounded-xl ${record.complianceChecks.breakRequirementCheck.compliant ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">فترة الراحة (المادة 101)</span>
                        <Badge className={`border-0 ${record.complianceChecks.breakRequirementCheck.compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {record.complianceChecks.breakRequirementCheck.compliant ? 'متوافق' : 'مخالف'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        الحد الأدنى: 30 دقيقة بعد 5 ساعات عمل
                      </p>
                    </div>

                    {/* Overtime Limits Check */}
                    <div className={`p-4 rounded-xl ${record.complianceChecks.overtimeLimitsCheck.compliant ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">حدود العمل الإضافي (المادة 106)</span>
                        <Badge className={`border-0 ${record.complianceChecks.overtimeLimitsCheck.compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {record.complianceChecks.overtimeLimitsCheck.compliant ? 'متوافق' : 'مخالف'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        الحد الأسبوعي: 12 ساعة | الفعلي: {record.complianceChecks.overtimeLimitsCheck.actual} ساعة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    تكامل الرواتب
                  </CardTitle>
                  <Badge className={`border-0 ${record.payrollIntegration.locked ? 'bg-red-100 text-red-700' : record.payrollIntegration.processedInPayroll ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {record.payrollIntegration.locked ? 'مقفل' : record.payrollIntegration.processedInPayroll ? 'تمت المعالجة' : 'قيد الانتظار'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payable Hours */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">الساعات المستحقة</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">ساعات عادية</span>
                        <span className="font-medium text-navy">{record.payrollIntegration.payrollHours.regularHours}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">ساعات إضافية</span>
                        <span className="font-medium text-purple-600">{record.payrollIntegration.payrollHours.overtimeHours}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">استراحات مدفوعة</span>
                        <span className="font-medium text-navy">{record.payrollIntegration.payrollHours.paidBreakHours}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-navy">إجمالي الساعات</span>
                        <span className="text-emerald-600">{record.payrollIntegration.payrollHours.totalPayableHours}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">الخصومات</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">خصم التأخير</span>
                        <span className="font-medium text-red-600">{record.payrollIntegration.payrollDeductions.lateDeduction} ر.س</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">خصم الغياب</span>
                        <span className="font-medium text-red-600">{record.payrollIntegration.payrollDeductions.absenceDeduction} ر.س</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">خصم الانصراف المبكر</span>
                        <span className="font-medium text-red-600">{record.payrollIntegration.payrollDeductions.earlyDepartureDeduction} ر.س</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-500">خصم المخالفات</span>
                        <span className="font-medium text-red-600">{record.payrollIntegration.payrollDeductions.violationDeductions} ر.س</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-navy">إجمالي الخصومات</span>
                        <span className="text-red-600">{record.payrollIntegration.payrollDeductions.totalDeductions} ر.س</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overtime Pay */}
                {record.payrollIntegration.overtimePay && record.payrollIntegration.overtimePay.overtimeHours > 0 && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-medium text-purple-800 mb-3">أجر العمل الإضافي (المادة 107)</h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm text-purple-600">الساعات</div>
                        <div className="font-bold text-purple-800">{record.payrollIntegration.overtimePay.overtimeHours}</div>
                      </div>
                      <div>
                        <div className="text-sm text-purple-600">سعر الساعة</div>
                        <div className="font-bold text-purple-800">{record.payrollIntegration.overtimePay.hourlyRate} ر.س</div>
                      </div>
                      <div>
                        <div className="text-sm text-purple-600">المعامل</div>
                        <div className="font-bold text-purple-800">{record.payrollIntegration.overtimePay.overtimeRate}x</div>
                      </div>
                      <div>
                        <div className="text-sm text-purple-600">المبلغ</div>
                        <div className="font-bold text-purple-800">{record.payrollIntegration.overtimePay.overtimeAmount} ر.س</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
              </>
            )}
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar context="attendance" />
        </div>
      </Main>

      {/* Excuse Late Dialog */}
      <Dialog open={showExcuseDialog} onOpenChange={setShowExcuseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>قبول التأخير</DialogTitle>
            <DialogDescription>
              أدخل سبب قبول التأخير للموظف.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="excuseReason">السبب *</Label>
              <Textarea
                id="excuseReason"
                value={excuseReason}
                onChange={(e) => setExcuseReason(e.target.value)}
                placeholder="أدخل سبب قبول التأخير..."
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExcuseDialog(false)} className="rounded-xl">
              تراجع
            </Button>
            <Button
              onClick={handleExcuseLate}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              disabled={!excuseReason.trim() || excuseLateMutation.isPending}
            >
              {excuseLateMutation.isPending ? 'جاري الحفظ...' : 'قبول التأخير'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Timesheet Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض سجل الحضور</DialogTitle>
            <DialogDescription>
              يرجى تحديد سبب الرفض.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">سبب الرفض *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="أدخل سبب الرفض..."
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="rounded-xl">
              تراجع
            </Button>
            <Button
              onClick={handleRejectTimesheet}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
              disabled={!rejectReason.trim() || rejectTimesheetMutation.isPending}
            >
              {rejectTimesheetMutation.isPending ? 'جاري الرفض...' : 'رفض'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Correction Request Dialog */}
      <Dialog open={showCorrectionDialog} onOpenChange={setShowCorrectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>طلب تصحيح</DialogTitle>
            <DialogDescription>
              طلب تصحيح بيانات سجل الحضور.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="correctionField">الحقل المراد تصحيحه *</Label>
              <Input
                id="correctionField"
                value={correctionField}
                onChange={(e) => setCorrectionField(e.target.value)}
                placeholder="مثال: وقت الحضور"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctionValue">القيمة الصحيحة *</Label>
              <Input
                id="correctionValue"
                value={correctionValue}
                onChange={(e) => setCorrectionValue(e.target.value)}
                placeholder="مثال: 08:30"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctionReason">سبب التصحيح *</Label>
              <Textarea
                id="correctionReason"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="أدخل سبب طلب التصحيح..."
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorrectionDialog(false)} className="rounded-xl">
              تراجع
            </Button>
            <Button
              onClick={handleRequestCorrection}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              disabled={!correctionField.trim() || !correctionValue.trim() || !correctionReason.trim() || requestCorrectionMutation.isPending}
            >
              {requestCorrectionMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overtime Approval Dialog */}
      <Dialog open={showOvertimeDialog} onOpenChange={setShowOvertimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اعتماد الوقت الإضافي</DialogTitle>
            <DialogDescription>
              حدد عدد ساعات العمل الإضافي المعتمدة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-sm text-purple-600">الساعات الإضافية المسجلة:</div>
              <div className="text-2xl font-bold text-purple-800">{record.overtimeHours?.toFixed(1) || 0} ساعة</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvedOvertimeHours">الساعات المعتمدة *</Label>
              <Input
                id="approvedOvertimeHours"
                type="number"
                step="0.5"
                value={approvedOvertimeHours}
                onChange={(e) => setApprovedOvertimeHours(e.target.value)}
                placeholder="0.0"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOvertimeDialog(false)} className="rounded-xl">
              تراجع
            </Button>
            <Button
              onClick={handleApproveOvertime}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
              disabled={!approvedOvertimeHours || approveOvertimeMutation.isPending}
            >
              {approveOvertimeMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
