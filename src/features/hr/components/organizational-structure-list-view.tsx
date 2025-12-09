import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useOrganizationalUnits, useOrganizationalStructureStats, useBulkDeleteOrganizationalUnits } from '@/hooks/useOrganizationalStructure'
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
  AlertCircle, Loader2, Building2, Network, Users, ChevronLeft,
  TreeDeciduous, Layers, TrendingUp, Building, LayoutGrid,
  GitBranch, MapPin
} from 'lucide-react'
import {
  UNIT_TYPE_LABELS,
  UNIT_STATUS_LABELS,
  type UnitType,
  type UnitStatus,
} from '@/services/organizationalStructureService'

export function OrganizationalStructureListView() {
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
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<UnitType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: unitsData, isLoading, error } = useOrganizationalUnits({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    unitType: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useOrganizationalStructureStats()
  const bulkDeleteMutation = useBulkDeleteOrganizationalUnits()

  const units = unitsData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === units.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(units.map(u => u._id))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} وحدة تنظيمية؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: UnitStatus) => {
    const colors: Record<UnitStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
      restructuring: 'bg-amber-100 text-amber-700 border-amber-200',
      merged: 'bg-blue-100 text-blue-700 border-blue-200',
      dissolved: 'bg-red-100 text-red-700 border-red-200',
      planned: 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return colors[status]
  }

  const getTypeIcon = (type: UnitType) => {
    const icons: Record<UnitType, typeof Building2> = {
      company: Building2,
      division: Network,
      department: Building,
      section: LayoutGrid,
      unit: Layers,
      team: Users,
      branch: MapPin,
      region: MapPin,
      subsidiary: GitBranch,
      committee: Users,
      project_team: Users,
      other: Layers,
    }
    return icons[type] || Layers
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الهيكل التنظيمي', href: '/dashboard/hr/organizational-structure', isActive: true },
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
          title="الهيكل التنظيمي"
          type="organizational-structure"
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
                      <TreeDeciduous className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي الوحدات</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalUnits || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Building2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">الوحدات النشطة</p>
                      <p className="text-xl font-bold text-navy">{stats?.activeUnits || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Users className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي الموظفين</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalHeadcount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-amber-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">نسبة السعودة</p>
                      <p className="text-xl font-bold text-navy">{stats?.avgSaudizationRate || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vacancy Summary Card */}
            {stats?.vacancyRate !== undefined && (
              <Card className="rounded-2xl border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">معدل الشواغر</p>
                        <p className="text-xs text-blue-600">نسبة الوظائف الشاغرة</p>
                      </div>
                    </div>
                    <div className="text-start">
                      <p className="text-2xl font-bold text-blue-700">{stats?.vacancyRate || 0}%</p>
                      <p className="text-xs text-blue-600">
                        {stats?.totalHeadcount || 0} / {stats?.totalApprovedHeadcount || 0} موظف
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
                    <div className="relative flex-1 md:w-56">
                      <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن وحدة..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UnitStatus | 'all')}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(UNIT_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as UnitType | 'all')}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        {Object.entries(UNIT_TYPE_LABELS).map(([key, label]) => (
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
                      onClick={() => navigate({ to: '/dashboard/hr/organizational-structure/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      وحدة جديدة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === units.length && units.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({units.length})
                </span>
              </div>
            )}

            {/* Units List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل الهيكل التنظيمي...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : units.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <TreeDeciduous className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد وحدات تنظيمية</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/organizational-structure/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إنشاء وحدة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {units.map((unit) => {
                  const TypeIcon = getTypeIcon(unit.unitType)
                  return (
                    <Card key={unit._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {selectionMode && (
                            <Checkbox
                              checked={selectedIds.includes(unit._id)}
                              onCheckedChange={() => handleSelectOne(unit._id)}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 ${getBgClasses(UNIT_TYPE_LABELS[unit.unitType]?.color || 'slate')} rounded-xl`}>
                                  <TypeIcon className={`w-5 h-5 ${getTextColorClass(UNIT_TYPE_LABELS[unit.unitType]?.color || \'slate\')}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-navy">
                                      {unit.unitNameAr || unit.unitName}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-slate-500">
                                    {unit.unitCode} - {UNIT_TYPE_LABELS[unit.unitType]?.ar}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(unit.status)}>
                                  {UNIT_STATUS_LABELS[unit.status]?.ar}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                                      <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/organizational-structure/${unit._id}` })}>
                                      <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                      عرض التفاصيل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/organizational-structure/new?editId=${unit._id}` })}>
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
                                <p className="text-xs text-slate-500">الوحدة الأب</p>
                                <p className="font-medium text-sm">{unit.parentUnitName || 'الجذر'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">المدير</p>
                                <p className="font-medium text-sm">{unit.managerNameAr || unit.managerName || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">عدد الموظفين</p>
                                <p className="font-medium text-sm">
                                  {unit.headcount?.currentHeadcount || 0} / {unit.headcount?.approvedHeadcount || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">المستوى</p>
                                <p className="font-medium text-sm">المستوى {unit.level}</p>
                              </div>
                            </div>

                            {unit.childUnits && unit.childUnits.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500 mb-2">الوحدات الفرعية ({unit.childUnits.length})</p>
                                <div className="flex flex-wrap gap-2">
                                  {unit.childUnits.slice(0, 4).map((child) => (
                                    <Badge key={child.unitId} variant="outline" className="bg-slate-50">
                                      {child.unitNameAr || child.unitName}
                                    </Badge>
                                  ))}
                                  {unit.childUnits.length > 4 && (
                                    <Badge variant="outline" className="bg-slate-50">
                                      +{unit.childUnits.length - 4} أخرى
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {unit.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" aria-hidden="true" />
                                    {unit.locationAr || unit.location}
                                  </span>
                                )}
                                {unit.headcount?.saudizationRate !== undefined && (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <TrendingUp className="w-3 h-3" aria-hidden="true" />
                                    نسبة السعودة: {unit.headcount.saudizationRate}%
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ to: `/dashboard/hr/organizational-structure/${unit._id}` })}
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
          <HRSidebar context="organizational-structure" />
        </div>
      </Main>
    </>
  )
}
