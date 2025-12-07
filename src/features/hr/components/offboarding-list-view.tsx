import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useOffboardings, useOffboardingStats, useDeleteOffboarding, useBulkDeleteOffboardings } from '@/hooks/useOffboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
  Search, Bell, Plus, MoreHorizontal, Eye, Edit, Trash2,
  UserMinus, Calendar, Building2, DollarSign, FileCheck,
  Clock, CheckCircle, AlertCircle, XCircle, Loader2
} from 'lucide-react'
import {
  EXIT_TYPE_LABELS,
  OFFBOARDING_STATUS_LABELS,
  type OffboardingStatus,
  type ExitType,
} from '@/services/offboardingService'

export function OffboardingListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OffboardingStatus | 'all'>('all')
  const [exitTypeFilter, setExitTypeFilter] = useState<ExitType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: offboardingsData, isLoading, error } = useOffboardings({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    exitType: exitTypeFilter !== 'all' ? exitTypeFilter : undefined,
  })
  const { data: stats } = useOffboardingStats()
  const deleteMutation = useDeleteOffboarding()
  const bulkDeleteMutation = useBulkDeleteOffboardings()

  const offboardings = offboardingsData?.data || []

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(offboardings.map(o => o._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id))
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusIcon = (status: OffboardingStatus) => {
    switch (status) {
      case 'initiated': return <Clock className="w-4 h-4" />
      case 'in_progress': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'clearance_pending': return <AlertCircle className="w-4 h-4" aria-hidden="true" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const getStatusColor = (status: OffboardingStatus) => {
    const colors: Record<OffboardingStatus, string> = {
      initiated: 'bg-slate-100 text-slate-700 border-slate-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      clearance_pending: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status]
  }

  const getExitTypeColor = (exitType: ExitType) => {
    const colors: Record<ExitType, string> = {
      resignation: 'bg-blue-50 text-blue-700',
      termination: 'bg-red-50 text-red-700',
      contract_end: 'bg-amber-50 text-amber-700',
      retirement: 'bg-emerald-50 text-emerald-700',
      death: 'bg-slate-50 text-slate-700',
      mutual_agreement: 'bg-purple-50 text-purple-700',
      medical: 'bg-orange-50 text-orange-700',
      other: 'bg-gray-50 text-gray-700',
    }
    return colors[exitType]
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'إنهاء الخدمة', href: '/dashboard/hr/offboarding', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title="إنهاء الخدمة والمغادرة"
          type="employees"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <UserMinus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">{stats?.totalOffboardings || 0}</p>
                      <p className="text-xs text-slate-500">إجمالي السجلات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">{stats?.pendingClearances || 0}</p>
                      <p className="text-xs text-slate-500">إخلاء معلق</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">{stats?.pendingSettlements || 0}</p>
                      <p className="text-xs text-slate-500">تسوية معلقة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <FileCheck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">{stats?.thisMonth?.completed || 0}</p>
                      <p className="text-xs text-slate-500">مكتمل هذا الشهر</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl shadow-sm border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      placeholder="البحث باسم الموظف أو الرقم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 rounded-xl h-11"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OffboardingStatus | 'all')}>
                    <SelectTrigger className="w-[180px] rounded-xl h-11">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      {Object.entries(OFFBOARDING_STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={exitTypeFilter} onValueChange={(v) => setExitTypeFilter(v as ExitType | 'all')}>
                    <SelectTrigger className="w-[180px] rounded-xl h-11">
                      <SelectValue placeholder="نوع الخروج" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {Object.entries(EXIT_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/offboarding/new' })}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    إضافة جديد
                  </Button>
                </div>

                {/* Selection Mode Controls */}
                {selectionMode && selectedIds.length > 0 && (
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <Checkbox
                      checked={selectedIds.length === offboardings.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-slate-600">
                      {selectedIds.length} محدد
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      className="rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                      حذف المحدد
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectionMode(false)
                        setSelectedIds([])
                      }}
                      className="rounded-xl"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Offboardings List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : offboardings.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <UserMinus className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد سجلات إنهاء خدمة</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/offboarding/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    إضافة سجل جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {offboardings.map((offboarding) => (
                  <Card
                    key={offboarding._id}
                    className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(offboarding._id)}
                            onCheckedChange={(checked) => handleSelectOne(offboarding._id, checked as boolean)}
                            className="mt-1"
                          />
                        )}

                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate({ to: `/dashboard/hr/offboarding/${offboarding._id}` })}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-navy">
                                  {offboarding.employeeNameAr || offboarding.employeeName}
                                </h3>
                                <Badge className={getExitTypeColor(offboarding.exitType)}>
                                  {EXIT_TYPE_LABELS[offboarding.exitType]?.ar}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" aria-hidden="true" />
                                  {offboarding.department || 'غير محدد'}
                                </span>
                                <span>{offboarding.jobTitle}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`flex items-center gap-1 ${getStatusColor(offboarding.status)}`}>
                                {getStatusIcon(offboarding.status)}
                                {OFFBOARDING_STATUS_LABELS[offboarding.status]?.ar}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="w-4 h-4" aria-hidden="true" />
                              <span>آخر يوم عمل: {new Date(offboarding.dates.lastWorkingDay).toLocaleDateString('ar-SA')}</span>
                            </div>
                            {offboarding.noticePeriod && (
                              <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span>فترة الإشعار: {offboarding.noticePeriod.noticeDaysServed}/{offboarding.noticePeriod.requiredDays} يوم</span>
                              </div>
                            )}
                          </div>

                          {/* Progress indicators */}
                          <div className="flex items-center gap-4 mt-4">
                            <div className={`flex items-center gap-1 text-xs ${offboarding.completion?.exitInterviewCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                              <CheckCircle className="w-3 h-3" />
                              مقابلة الخروج
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${offboarding.completion?.clearanceCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                              <CheckCircle className="w-3 h-3" />
                              الإخلاء
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${offboarding.completion?.finalSettlementCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                              <CheckCircle className="w-3 h-3" />
                              التسوية
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${offboarding.completion?.documentsIssued ? 'text-emerald-600' : 'text-slate-500'}`}>
                              <CheckCircle className="w-3 h-3" />
                              الشهادات
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => navigate({ to: `/dashboard/hr/offboarding/${offboarding._id}` })}
                            >
                              <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate({ to: `/dashboard/hr/offboarding/new?editId=${offboarding._id}` })}
                            >
                              <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectionMode(true)
                                setSelectedIds([offboarding._id])
                              }}
                            >
                              <Checkbox className="w-4 h-4 ms-2" />
                              تحديد
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate(offboarding._id)}
                            >
                              <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
