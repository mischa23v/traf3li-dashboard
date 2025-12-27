import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { useAdvances, useAdvanceStats, useBulkDeleteAdvances } from '@/hooks/useAdvances'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Progress } from '@/components/ui/progress'
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
  AlertCircle, Loader2, Wallet, Clock, CheckCircle, TrendingUp,
  AlertTriangle, ArrowDownCircle, Zap
} from 'lucide-react'
import {
  ADVANCE_TYPE_LABELS,
  ADVANCE_STATUS_LABELS,
  URGENCY_LABELS,
  type AdvanceStatus,
  type AdvanceType,
  type UrgencyLevel,
} from '@/services/advancesService'

export function AdvancesListView() {
  const getColorClasses = (color: string) => {
    const colorMap = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        amber: 'bg-amber-100 text-amber-700 border-amber-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        pink: 'bg-pink-100 text-pink-700 border-pink-200',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        violet: 'bg-violet-100 text-violet-700 border-violet-200',
        slate: 'bg-slate-100 text-slate-700 border-slate-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        stone: 'bg-stone-100 text-stone-700 border-stone-200',
        teal: 'bg-teal-100 text-teal-700 border-teal-200',
        cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        sky: 'bg-sky-100 text-sky-700 border-sky-200',
        lime: 'bg-lime-100 text-lime-700 border-lime-200',
        rose: 'bg-rose-100 text-rose-700 border-rose-200',
        fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
}

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdvanceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AdvanceType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: advancesData, isLoading, error } = useAdvances({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    advanceType: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useAdvanceStats()
  const bulkDeleteMutation = useBulkDeleteAdvances()

  const advances = advancesData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === advances.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(advances.map(a => a._id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} سلفة؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: AdvanceStatus) => {
    const colors: Record<AdvanceStatus, string> = {
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      disbursed: 'bg-purple-100 text-purple-700 border-purple-200',
      recovering: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    const colors: Record<UrgencyLevel, string> = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-amber-100 text-amber-600',
      critical: 'bg-red-100 text-red-600',
    }
    return colors[urgency]
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'السلف', href: ROUTES.dashboard.hr.advances.list, isActive: true },
  ]

  return (
    <>
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
        <ProductivityHero
          badge="الموارد البشرية"
          title="إدارة السلف"
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
                      <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي السلف</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalAdvances || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">قيد الانتظار</p>
                      <p className="text-xl font-bold text-navy">{stats?.pendingApproval || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">المبلغ المسترد</p>
                      <p className="text-xl font-bold text-navy">
                        {((stats?.totalRecovered || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">المستحق</p>
                      <p className="text-xl font-bold text-navy">
                        {((stats?.totalOutstanding || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن سلفة..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AdvanceStatus | 'all')}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(ADVANCE_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AdvanceType | 'all')}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        {Object.entries(ADVANCE_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectionMode && selectedIds.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="rounded-xl"
                      >
                        <Trash2 className="w-4 h-4 ms-1" aria-hidden="true" />
                        حذف ({selectedIds.length})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectionMode(!selectionMode)
                        setSelectedIds([])
                      }}
                      className="rounded-xl"
                    >
                      {selectionMode ? 'إلغاء' : 'تحديد'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: ROUTES.dashboard.hr.advances.new })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      سلفة جديدة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === advances.length && advances.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({advances.length})
                </span>
              </div>
            )}

            {/* Advances List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل السلف...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : advances.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Wallet className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد سلف</p>
                  <Button
                    onClick={() => navigate({ to: ROUTES.dashboard.hr.advances.new })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إضافة سلفة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {advances.map((advance) => (
                  <Card key={advance._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(advance._id)}
                            onCheckedChange={() => handleSelectOne(advance._id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-navy">
                                  {advance.employeeNameAr || advance.employeeName}
                                </h3>
                                {advance.isEmergency && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">
                                    <Zap className="w-3 h-3 ms-1" />
                                    طوارئ
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">
                                {advance.advanceNumber} - {advance.department || 'غير محدد'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(advance.status)}>
                                {ADVANCE_STATUS_LABELS[advance.status]?.ar}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: ROUTES.dashboard.hr.advances.detail(advance._id) })}>
                                    <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/advances/new?editId=${advance._id}` })}>
                                    <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                                    تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500">نوع السلفة</p>
                              <Badge className={getColorClasses(ADVANCE_TYPE_LABELS[advance.advanceType]?.color)}>
                                {ADVANCE_TYPE_LABELS[advance.advanceType]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">المبلغ</p>
                              <p className="font-bold text-navy">{advance.advanceAmount.toLocaleString('ar-SA')} ر.س</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الأقساط</p>
                              <p className="font-medium">{advance.repayment.installments} شهر</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الأولوية</p>
                              <Badge className={getUrgencyColor(advance.urgency)}>
                                {URGENCY_LABELS[advance.urgency]?.ar}
                              </Badge>
                            </div>
                          </div>

                          {/* Progress for recovering advances */}
                          {advance.status === 'recovering' && advance.balance && (
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">تقدم السداد</span>
                                <span className="font-medium text-emerald-600">
                                  {advance.balance.completionPercentage}%
                                </span>
                              </div>
                              <Progress value={advance.balance.completionPercentage} className="h-2" />
                              <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>المسترد: {advance.balance.recoveredAmount.toLocaleString('ar-SA')} ر.س</span>
                                <span>المتبقي: {advance.balance.remainingBalance.toLocaleString('ar-SA')} ر.س</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>تاريخ الطلب: {new Date(advance.requestDate).toLocaleDateString('ar-SA')}</span>
                              {advance.approvalDate && (
                                <span>الاعتماد: {new Date(advance.approvalDate).toLocaleDateString('ar-SA')}</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: ROUTES.dashboard.hr.advances.detail(advance._id) })}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
