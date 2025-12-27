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
import { useBenefits, useBenefitStats, useBulkDeleteBenefits } from '@/hooks/useBenefits'
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
  AlertCircle, Loader2, Heart, Shield, Wallet, Home,
  Users, Calendar, TrendingUp, CheckCircle, Clock, Car
} from 'lucide-react'
import {
  BENEFIT_TYPE_LABELS,
  BENEFIT_STATUS_LABELS,
  BENEFIT_CATEGORY_LABELS,
  type BenefitStatus,
  type BenefitType,
  type BenefitCategory,
} from '@/services/benefitsService'

export function BenefitsListView() {
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
  const [statusFilter, setStatusFilter] = useState<BenefitStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<BenefitType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<BenefitCategory | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: benefitsData, isLoading, error } = useBenefits({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    benefitType: typeFilter !== 'all' ? typeFilter : undefined,
    benefitCategory: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useBenefitStats()
  const bulkDeleteMutation = useBulkDeleteBenefits()

  const benefits = benefitsData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === benefits.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(benefits.map(b => b._id))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} ميزة؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: BenefitStatus) => {
    const colors: Record<BenefitStatus, string> = {
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      suspended: 'bg-amber-100 text-amber-700 border-amber-200',
      terminated: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const getTypeIcon = (type: BenefitType) => {
    const icons: Record<BenefitType, React.ReactNode> = {
      health_insurance: <Heart className="w-4 h-4" />,
      life_insurance: <Shield className="w-4 h-4" />,
      disability_insurance: <Shield className="w-4 h-4" />,
      dental_insurance: <Heart className="w-4 h-4" />,
      vision_insurance: <Eye className="w-4 h-4" aria-hidden="true" />,
      pension: <Wallet className="w-4 h-4" />,
      savings_plan: <Wallet className="w-4 h-4" />,
      education_allowance: <Users className="w-4 h-4" aria-hidden="true" />,
      transportation: <Car className="w-4 h-4" />,
      housing: <Home className="w-4 h-4" aria-hidden="true" />,
      meal_allowance: <Heart className="w-4 h-4" />,
      mobile_allowance: <Heart className="w-4 h-4" />,
      gym_membership: <Heart className="w-4 h-4" />,
      professional_membership: <Heart className="w-4 h-4" />,
      other: <Heart className="w-4 h-4" />,
    }
    return icons[type]
  }

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.overview, isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'المزايا', href: ROUTES.dashboard.hr.benefits.list, isActive: true },
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
          title="إدارة المزايا"
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
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي المزايا</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalBenefits || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">التسجيلات النشطة</p>
                      <p className="text-xl font-bold text-navy">{stats?.activeEnrollments || 0}</p>
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
                      <p className="text-xl font-bold text-navy">{stats?.pendingEnrollments || 0}</p>
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
                      <p className="text-xs text-slate-500">نسبة التغطية</p>
                      <p className="text-xl font-bold text-navy">{stats?.coverageRate || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Summary Card */}
            {(stats?.totalEmployerCost || stats?.totalEmployeeCost) && (
              <Card className="rounded-2xl border-slate-100 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-800">تكاليف المزايا</p>
                        <p className="text-xs text-emerald-600">صاحب العمل + الموظف</p>
                      </div>
                    </div>
                    <div className="text-start">
                      <p className="text-xs text-emerald-600">تكلفة صاحب العمل</p>
                      <p className="text-lg font-bold text-emerald-700">{(stats?.totalEmployerCost || 0).toLocaleString('ar-SA')} ر.س</p>
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
                    <div className="relative flex-1 md:w-56">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن ميزة..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BenefitStatus | 'all')}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(BENEFIT_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BenefitType | 'all')}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        {Object.entries(BENEFIT_TYPE_LABELS).map(([key, label]) => (
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
                      onClick={() => navigate({ to: ROUTES.dashboard.hr.benefits.new })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      ميزة جديدة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === benefits.length && benefits.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({benefits.length})
                </span>
              </div>
            )}

            {/* Benefits List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل المزايا...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : benefits.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Heart className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد مزايا</p>
                  <Button
                    onClick={() => navigate({ to: ROUTES.dashboard.hr.benefits.new })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إضافة ميزة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <Card key={benefit._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(benefit._id)}
                            onCheckedChange={() => handleSelectOne(benefit._id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-navy">
                                  {benefit.benefitNameAr || benefit.benefitName}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-500">
                                {benefit.enrollmentNumber} - {benefit.employeeNameAr || benefit.employeeName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(benefit.status)}>
                                {BENEFIT_STATUS_LABELS[benefit.status]?.ar}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: ROUTES.dashboard.hr.benefits.detail(benefit._id) })}>
                                    <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate({ to: `${ROUTES.dashboard.hr.benefits.new}?editId=${benefit._id}` })}>
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
                              <p className="text-xs text-slate-500">نوع الميزة</p>
                              <div className="flex items-center gap-1 mt-1">
                                {getTypeIcon(benefit.benefitType)}
                                <Badge className="bg-blue-100 text-blue-700">
                                  {BENEFIT_TYPE_LABELS[benefit.benefitType]?.ar}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">التصنيف</p>
                              <Badge className={`mt-1 ${getColorClasses(BENEFIT_CATEGORY_LABELS[benefit.benefitCategory]?.color)}`}>
                                {BENEFIT_CATEGORY_LABELS[benefit.benefitCategory]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">تكلفة صاحب العمل</p>
                              <p className="font-medium">{benefit.employerCost.toLocaleString('ar-SA')} {benefit.currency}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">تكلفة الموظف</p>
                              <p className="font-medium">{benefit.employeeCost.toLocaleString('ar-SA')} {benefit.currency}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" aria-hidden="true" />
                                تاريخ السريان: {new Date(benefit.effectiveDate).toLocaleDateString('ar-SA')}
                              </span>
                              {benefit.providerName && (
                                <span>مقدم الخدمة: {benefit.providerName}</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: ROUTES.dashboard.hr.benefits.detail(benefit._id) })}
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
