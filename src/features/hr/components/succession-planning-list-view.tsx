import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useSuccessionPlans, useSuccessionPlanningStats, useBulkDeleteSuccessionPlans } from '@/hooks/useSuccessionPlanning'
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
  AlertCircle, Loader2, Users, ChevronLeft, UserCheck,
  AlertTriangle, Target, TrendingUp, Clock, Shield,
  BarChart3, UserPlus, Calendar
} from 'lucide-react'
import {
  positionCriticalityLabels,
  riskLevelLabels,
  planStatusLabels,
  readinessLevelLabels,
  PositionCriticality,
  RiskLevel,
  PlanStatus,
} from '@/services/successionPlanningService'

export function SuccessionPlanningListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [criticalityFilter, setCriticalityFilter] = useState<PositionCriticality | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: plansData, isLoading, error } = useSuccessionPlans({
    positionCriticality: criticalityFilter !== 'all' ? criticalityFilter : undefined,
    riskLevel: riskFilter !== 'all' ? riskFilter : undefined,
    planStatus: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useSuccessionPlanningStats()
  const bulkDeleteMutation = useBulkDeleteSuccessionPlans()

  const plans = Array.isArray(plansData) ? plansData : []

  const handleSelectAll = () => {
    if (selectedIds.length === plans.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(plans.map(p => p.successionPlanId))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} خطة تعاقب؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getCriticalityColor = (criticality: PositionCriticality) => {
    const colors: Record<PositionCriticality, string> = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    }
    return colors[criticality]
  }

  const getRiskColor = (risk: RiskLevel) => {
    const colors: Record<RiskLevel, string> = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return colors[risk]
  }

  const getStatusColor = (status: PlanStatus) => {
    const colors: Record<PlanStatus, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      under_review: 'bg-blue-100 text-blue-700 border-blue-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-purple-100 text-purple-700 border-purple-200',
      archived: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'تخطيط التعاقب', href: '/dashboard/hr/succession-planning', isActive: true },
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
          title="تخطيط التعاقب الوظيفي"
          type="succession-planning"
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
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي الخطط</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalPlans || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">مناصب حرجة</p>
                      <p className="text-xl font-bold text-navy">{stats?.criticalPositions || 0}</p>
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
                      <p className="text-xs text-slate-500">مع خلفاء جاهزين</p>
                      <p className="text-xl font-bold text-navy">{stats?.withReadySuccessors || 0}</p>
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
                      <p className="text-xs text-slate-500">تحتاج مراجعة</p>
                      <p className="text-xl font-bold text-navy">{stats?.reviewDue || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Overview Card */}
            <Card className="rounded-2xl border-slate-100 bg-gradient-to-br from-red-50 to-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">خطط عالية المخاطر</p>
                      <p className="text-xs text-red-600">تحتاج اهتمام فوري</p>
                    </div>
                  </div>
                  <div className="text-start">
                    <p className="text-2xl font-bold text-red-700">{stats?.highRiskPlans || 0}</p>
                    <p className="text-xs text-red-600">
                      {stats?.withoutSuccessors || 0} بدون خلفاء
                    </p>
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
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن خطة..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={criticalityFilter} onValueChange={(v) => setCriticalityFilter(v as PositionCriticality | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="الأهمية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل المستويات</SelectItem>
                        {Object.entries(positionCriticalityLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="المخاطر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل المخاطر</SelectItem>
                        {Object.entries(riskLevelLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PlanStatus | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(planStatusLabels).map(([key, label]) => (
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
                      onClick={() => navigate({ to: '/dashboard/hr/succession-planning/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      خطة جديدة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === plans.length && plans.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({plans.length})
                </span>
              </div>
            )}

            {/* Plans List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل خطط التعاقب...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : plans.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">لا توجد خطط تعاقب</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/succession-planning/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إنشاء خطة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <Card key={plan.successionPlanId} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(plan.successionPlanId)}
                            onCheckedChange={() => handleSelectOne(plan.successionPlanId)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-100 rounded-xl">
                                <Target className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-navy">
                                    {plan.positionTitle}
                                  </h3>
                                  <Badge className={getCriticalityColor(plan.positionCriticality)}>
                                    {positionCriticalityLabels[plan.positionCriticality]?.ar}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500">
                                  {plan.planNumber} - {plan.incumbentName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getRiskColor(plan.riskLevel)}>
                                خطر {riskLevelLabels[plan.riskLevel]?.ar}
                              </Badge>
                              <Badge className={getStatusColor(plan.planStatus)}>
                                {planStatusLabels[plan.planStatus]?.ar}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/succession-planning/${plan.successionPlanId}` })}>
                                    <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/succession-planning/new?editId=${plan.successionPlanId}` })}>
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
                              <p className="text-xs text-slate-500">عدد الخلفاء</p>
                              <p className="font-medium text-sm flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-500" aria-hidden="true" />
                                {plan.successorsCount}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">جاهزون الآن</p>
                              <p className="font-medium text-sm flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-500" />
                                {plan.readyNowCount}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">تاريخ السريان</p>
                              <p className="font-medium text-sm flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" aria-hidden="true" />
                                {new Date(plan.effectiveDate).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">تاريخ المراجعة</p>
                              <p className="font-medium text-sm flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                                {plan.reviewDate ? new Date(plan.reviewDate).toLocaleDateString('ar-SA') : '-'}
                              </p>
                            </div>
                          </div>

                          {/* Successors Preview */}
                          {plan.successors && plan.successors.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <p className="text-xs text-slate-500 mb-2">الخلفاء المحتملون</p>
                              <div className="flex flex-wrap gap-2">
                                {plan.successors.slice(0, 3).map((successor, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                      {successor.successorRanking}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{successor.name}</p>
                                      <p className="text-xs text-slate-500">
                                        {readinessLevelLabels[successor.readinessLevel]?.ar}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {plan.successors.length > 3 && (
                                  <div className="flex items-center text-xs text-slate-500">
                                    +{plan.successors.length - 3} آخرين
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {plan.departmentName && (
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  {plan.departmentName}
                                </span>
                              )}
                              {plan.benchStrength && (
                                <span className={`flex items-center gap-1 ${
                                  plan.benchStrength.benchStrengthScore === 'strong' ? 'text-emerald-600' :
                                  plan.benchStrength.benchStrengthScore === 'adequate' ? 'text-blue-600' :
                                  plan.benchStrength.benchStrengthScore === 'weak' ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                                  قوة البدلاء: {plan.benchStrength.benchStrengthScore}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: `/dashboard/hr/succession-planning/${plan.successionPlanId}` })}
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
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="succession-planning" />
        </div>
      </Main>
    </>
  )
}
