import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useJobPositions, useJobPositionStats, useBulkDeleteJobPositions } from '@/hooks/useJobPositions'
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
  AlertCircle, Loader2, Briefcase, Users, ChevronLeft,
  TrendingUp, Building2, Target, UserCheck, UserX,
  Scale, Wallet, Monitor, Settings, Megaphone, LifeBuoy
} from 'lucide-react'
import {
  JOB_LEVEL_LABELS,
  JOB_FAMILY_LABELS,
  POSITION_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  type JobLevel,
  type JobFamily,
  type PositionStatus,
  type EmploymentType,
} from '@/services/jobPositionsService'

export function JobPositionsListView() {
  const getTextColorClass = (color: string) => {
    const colorMap = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        emerald: 'text-emerald-600',
        red: 'text-red-600',
        amber: 'text-amber-600',
        yellow: 'text-yellow-600',
        orange: 'text-orange-600',
        purple: 'text-purple-600',
        slate: 'text-slate-600',
    }
    return colorMap[color] || 'text-gray-600'
}

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
        teal: 'bg-teal-100 text-teal-700 border-teal-200',
        cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
}

const getBorderBgTextClasses = (color: string) => {
    const colorMap = {
        blue: 'border-blue-500 bg-blue-50 text-blue-700',
        green: 'border-green-500 bg-green-50 text-green-700',
        emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
        red: 'border-red-500 bg-red-50 text-red-700',
        amber: 'border-amber-500 bg-amber-50 text-amber-700',
        yellow: 'border-yellow-500 bg-yellow-50 text-yellow-700',
        orange: 'border-orange-500 bg-orange-50 text-orange-700',
        purple: 'border-purple-500 bg-purple-50 text-purple-700',
        pink: 'border-pink-500 bg-pink-50 text-pink-700',
        indigo: 'border-indigo-500 bg-indigo-50 text-indigo-700',
        slate: 'border-slate-500 bg-slate-50 text-slate-700',
        gray: 'border-gray-500 bg-gray-50 text-gray-700',
    }
    return colorMap[color] || 'border-gray-500 bg-gray-50 text-gray-700'
}

const getBgClasses = (color: string) => {
    const colorMap = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        emerald: 'bg-emerald-100',
        red: 'bg-red-100',
        amber: 'bg-amber-100',
        yellow: 'bg-yellow-100',
        orange: 'bg-orange-100',
        purple: 'bg-purple-100',
        pink: 'bg-pink-100',
        indigo: 'bg-indigo-100',
        slate: 'bg-slate-100',
        gray: 'bg-gray-100',
        teal: 'bg-teal-100',
    }
    return colorMap[color] || 'bg-gray-100'
}

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PositionStatus | 'all'>('all')
  const [jobFamilyFilter, setJobFamilyFilter] = useState<JobFamily | 'all'>('all')
  const [jobLevelFilter, setJobLevelFilter] = useState<JobLevel | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: positionsData, isLoading, error } = useJobPositions({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    jobFamily: jobFamilyFilter !== 'all' ? jobFamilyFilter : undefined,
    jobLevel: jobLevelFilter !== 'all' ? jobLevelFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useJobPositionStats()
  const bulkDeleteMutation = useBulkDeleteJobPositions()

  const positions = positionsData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === positions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(positions.map(p => p._id))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} منصب وظيفي؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: PositionStatus) => {
    const colors: Record<PositionStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      vacant: 'bg-amber-100 text-amber-700 border-amber-200',
      frozen: 'bg-blue-100 text-blue-700 border-blue-200',
      eliminated: 'bg-red-100 text-red-700 border-red-200',
      pending_approval: 'bg-purple-100 text-purple-700 border-purple-200',
      proposed: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return colors[status]
  }

  const getJobFamilyIcon = (family: JobFamily) => {
    const icons: Record<JobFamily, typeof Briefcase> = {
      legal: Scale,
      finance: Wallet,
      hr: Users,
      it: Monitor,
      operations: Settings,
      marketing: Megaphone,
      sales: TrendingUp,
      administration: Building2,
      management: Briefcase,
      support: LifeBuoy,
      other: Briefcase,
    }
    return icons[family] || Briefcase
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'المناصب الوظيفية', href: '/dashboard/hr/job-positions', isActive: true },
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
          title="المناصب الوظيفية"
          type="job-positions"
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
                      <Briefcase className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي المناصب</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalPositions || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <UserCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">مناصب مشغولة</p>
                      <p className="text-xl font-bold text-navy">{stats?.filledPositions || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <UserX className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">مناصب شاغرة</p>
                      <p className="text-xl font-bold text-navy">{stats?.vacantPositions || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">نسبة الشواغر</p>
                      <p className="text-xl font-bold text-navy">{stats?.vacancyRate || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Headcount Summary Card */}
            {stats?.totalHeadcount !== undefined && (
              <Card className="rounded-2xl border-slate-100 bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-xl">
                        <Users className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-indigo-800">العدد الوظيفي</p>
                        <p className="text-xs text-indigo-600">المعتمد مقابل الفعلي</p>
                      </div>
                    </div>
                    <div className="text-start">
                      <p className="text-2xl font-bold text-indigo-700">{stats?.totalHeadcount || 0}</p>
                      <p className="text-xs text-indigo-600">
                        من {stats?.approvedHeadcount || 0} معتمد
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن منصب..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PositionStatus | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(POSITION_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={jobFamilyFilter} onValueChange={(v) => setJobFamilyFilter(v as JobFamily | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="العائلة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل العوائل</SelectItem>
                        {Object.entries(JOB_FAMILY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={jobLevelFilter} onValueChange={(v) => setJobLevelFilter(v as JobLevel | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل المستويات</SelectItem>
                        {Object.entries(JOB_LEVEL_LABELS).map(([key, label]) => (
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
                      onClick={() => navigate({ to: '/dashboard/hr/job-positions/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      منصب جديد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === positions.length && positions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({positions.length})
                </span>
              </div>
            )}

            {/* Positions List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل المناصب الوظيفية...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : positions.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">لا توجد مناصب وظيفية</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/job-positions/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إنشاء منصب جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => {
                  const FamilyIcon = getJobFamilyIcon(position.jobFamily)
                  return (
                    <Card key={position._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {selectionMode && (
                            <Checkbox
                              checked={selectedIds.includes(position._id)}
                              onCheckedChange={() => handleSelectOne(position._id)}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 ${getBgClasses(JOB_FAMILY_LABELS[position.jobFamily]?.color || 'slate')} rounded-xl`}>
                                  <FamilyIcon className={`w-5 h-5 ${getTextColorClass(JOB_FAMILY_LABELS[position.jobFamily]?.color || \'slate\')}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-navy">
                                      {position.jobTitleAr || position.jobTitle}
                                    </h3>
                                    {position.filled ? (
                                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                        مشغول
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                        شاغر
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-500">
                                    {position.positionNumber} - {JOB_FAMILY_LABELS[position.jobFamily]?.ar}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(position.status)}>
                                  {POSITION_STATUS_LABELS[position.status]?.ar}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                                      <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/job-positions/${position._id}` })}>
                                      <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                      عرض التفاصيل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/job-positions/new?editId=${position._id}` })}>
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
                                <p className="text-xs text-slate-500">المستوى الوظيفي</p>
                                <p className="font-medium text-sm">{JOB_LEVEL_LABELS[position.jobLevel]?.ar}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">نوع التوظيف</p>
                                <p className="font-medium text-sm">{EMPLOYMENT_TYPE_LABELS[position.employmentType]?.ar}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">القسم</p>
                                <p className="font-medium text-sm">{position.departmentNameAr || position.departmentName || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">يرفع تقاريره إلى</p>
                                <p className="font-medium text-sm">{position.reportsToJobTitleAr || position.reportsToJobTitle || '-'}</p>
                              </div>
                            </div>

                            {position.incumbent && (
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500 mb-2">شاغل المنصب الحالي</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{position.incumbent.employeeNameAr || position.incumbent.employeeName}</p>
                                    <p className="text-xs text-slate-500">{position.incumbent.employeeNumber}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {position.location && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" aria-hidden="true" />
                                    {position.locationAr || position.location}
                                  </span>
                                )}
                                {position.directReportsCount > 0 && (
                                  <span className="flex items-center gap-1 text-purple-600">
                                    <Users className="w-3 h-3" aria-hidden="true" />
                                    {position.directReportsCount} تقارير مباشرة
                                  </span>
                                )}
                                {position.salaryGrade && (
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <TrendingUp className="w-3 h-3" aria-hidden="true" />
                                    درجة {position.salaryGrade}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ to: `/dashboard/hr/job-positions/${position._id}` })}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                              >
                                عرض التفاصيل
                                <ChevronLeft className="w-4 h-4 me-1" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="job-positions" />
        </div>
      </Main>
    </>
  )
}
