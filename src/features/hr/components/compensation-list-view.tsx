import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useCompensationRecords, useCompensationStats, useBulkDeleteCompensation } from '@/hooks/useCompensation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  Search, Bell, Plus, MoreHorizontal, Eye, Edit, Trash2,
  AlertCircle, Loader2, ChevronLeft, DollarSign, Users,
  TrendingUp, TrendingDown, BarChart3, Wallet, Award,
  Clock, Percent, Building2, Briefcase, Receipt
} from 'lucide-react'
import {
  compensationStatusLabels,
  compaRatioCategoryLabels,
  CompensationStatus,
  CompaRatioCategory,
} from '@/services/compensationService'

export function CompensationListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CompensationStatus | 'all'>('all')
  const [compaRatioFilter, setCompaRatioFilter] = useState<CompaRatioCategory | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: compensationData, isLoading, error } = useCompensationRecords({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    compaRatioCategory: compaRatioFilter !== 'all' ? compaRatioFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useCompensationStats()
  const bulkDeleteMutation = useBulkDeleteCompensation()

  const records = Array.isArray(compensationData) ? compensationData : []

  const handleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(records.map(r => r.compensationId))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} سجل تعويضات؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: CompensationStatus) => {
    const colors: Record<CompensationStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      historical: 'bg-slate-100 text-slate-700 border-slate-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status]
  }

  const getCompaRatioColor = (category?: CompaRatioCategory) => {
    if (!category) return 'bg-slate-100 text-slate-700 border-slate-200'
    const colors: Record<CompaRatioCategory, string> = {
      below_range: 'bg-red-100 text-red-700 border-red-200',
      in_range_low: 'bg-amber-100 text-amber-700 border-amber-200',
      in_range_mid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      in_range_high: 'bg-blue-100 text-blue-700 border-blue-200',
      above_range: 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return colors[category]
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التعويضات والمكافآت', href: '/dashboard/hr/compensation', isActive: true },
  ]

  return (
    <>
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title="التعويضات والمكافآت"
          type="compensation"
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
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي السجلات</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalRecords || 0}</p>
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
                      <p className="text-xs text-slate-500">متوسط الراتب</p>
                      <p className="text-xl font-bold text-navy">
                        {stats?.averageBasicSalary ? formatCurrency(stats.averageBasicSalary) : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Percent className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">متوسط Compa-Ratio</p>
                      <p className="text-xl font-bold text-navy">
                        {stats?.averageCompaRatio ? `${(stats.averageCompaRatio * 100).toFixed(0)}%` : '-'}
                      </p>
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
                      <p className="text-xs text-slate-500">مراجعات معلقة</p>
                      <p className="text-xl font-bold text-navy">{stats?.pendingReviews || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pay Positioning Overview Card */}
            <Card className="rounded-2xl border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">توزيع الرواتب</p>
                      <p className="text-xs text-blue-600">موقع الموظفين في نطاق الرواتب</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{stats?.belowRangeCount || 0}</p>
                      <p className="text-xs text-slate-500">أقل من النطاق</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600">{stats?.activeRecords || 0}</p>
                      <p className="text-xs text-slate-500">نشط</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{stats?.aboveRangeCount || 0}</p>
                      <p className="text-xs text-slate-500">أعلى من النطاق</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن موظف..."
                        className="pr-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CompensationStatus | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(compensationStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={compaRatioFilter} onValueChange={(v) => setCompaRatioFilter(v as CompaRatioCategory | 'all')}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="موقع الراتب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل المواقع</SelectItem>
                        {Object.entries(compaRatioCategoryLabels).map(([key, label]) => (
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
                        <Trash2 className="w-4 h-4 ml-1" />
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
                      onClick={() => navigate({ to: '/dashboard/hr/compensation/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      سجل جديد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === records.length && records.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({records.length})
                </span>
              </div>
            )}

            {/* Compensation Records List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل سجلات التعويضات...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : records.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Wallet className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد سجلات تعويضات</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/compensation/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    إنشاء سجل جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <Card key={record.compensationId} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(record.compensationId)}
                            onCheckedChange={() => handleSelectOne(record.compensationId)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-100 rounded-xl">
                                <Wallet className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-navy">
                                    {record.employeeName}
                                  </h3>
                                  <Badge className={getStatusColor(record.status)}>
                                    {compensationStatusLabels[record.status]?.ar}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500">
                                  {record.recordNumber} - {record.jobTitle || 'غير محدد'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {record.compaRatioCategory && (
                                <Badge className={getCompaRatioColor(record.compaRatioCategory)}>
                                  {compaRatioCategoryLabels[record.compaRatioCategory]?.ar}
                                </Badge>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/compensation/${record.compensationId}` })}>
                                    <Eye className="w-4 h-4 ml-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/compensation/new?editId=${record.compensationId}` })}>
                                    <Edit className="w-4 h-4 ml-2" />
                                    تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500">الراتب الأساسي</p>
                              <p className="font-medium text-sm flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-slate-400" />
                                {formatCurrency(record.basicSalary, record.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">إجمالي البدلات</p>
                              <p className="font-medium text-sm flex items-center gap-1">
                                <Receipt className="w-3 h-3 text-slate-400" />
                                {formatCurrency(record.totalAllowances, record.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الراتب الإجمالي</p>
                              <p className="font-medium text-sm flex items-center gap-1 text-emerald-600">
                                <Wallet className="w-3 h-3" />
                                {formatCurrency(record.grossSalary, record.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الدرجة الوظيفية</p>
                              <p className="font-medium text-sm flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-slate-400" />
                                {record.payGrade}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Compa-Ratio</p>
                              <p className={`font-medium text-sm flex items-center gap-1 ${
                                record.compaRatio < 0.8 ? 'text-red-600' :
                                record.compaRatio > 1.2 ? 'text-purple-600' : 'text-emerald-600'
                              }`}>
                                {record.compaRatio < 1 ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : (
                                  <TrendingUp className="w-3 h-3" />
                                )}
                                {(record.compaRatio * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>

                          {/* Salary Range Visualization */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                              <span>{formatCurrency(record.salaryRangeMin, record.currency)}</span>
                              <span>نطاق الراتب</span>
                              <span>{formatCurrency(record.salaryRangeMax, record.currency)}</span>
                            </div>
                            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="absolute h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                style={{
                                  width: `${Math.min((record.rangePenetration || 0) * 100, 100)}%`
                                }}
                              />
                              <div
                                className="absolute w-3 h-3 bg-white border-2 border-emerald-500 rounded-full -top-0.5"
                                style={{
                                  left: `calc(${Math.min(Math.max((record.rangePenetration || 0) * 100, 0), 100)}% - 6px)`
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {record.department && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {record.department}
                                </span>
                              )}
                              {record.variableCompensation?.eligibleForVariablePay && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Award className="w-3 h-3" />
                                  مؤهل للمكافآت المتغيرة
                                </span>
                              )}
                              {record.nextReviewDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  المراجعة: {new Date(record.nextReviewDate).toLocaleDateString('ar-SA')}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: `/dashboard/hr/compensation/${record.compensationId}` })}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                            >
                              عرض التفاصيل
                              <ChevronLeft className="w-4 h-4 mr-1" />
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
          <HRSidebar context="compensation" />
        </div>
      </Main>
    </>
  )
}
