import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useAssetAssignments, useAssetAssignmentStats, useBulkDeleteAssetAssignments } from '@/hooks/useAssetAssignment'
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
  AlertCircle, Loader2, Package, Clock, CheckCircle, Laptop,
  Smartphone, Monitor, Car, Key, Wrench, RotateCcw, AlertTriangle,
  Calendar, User
} from 'lucide-react'
import {
  ASSET_ASSIGNMENT_STATUS_LABELS,
  ASSET_TYPE_LABELS,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  type AssetAssignmentStatus,
  type AssetType,
  type AssetCategory,
} from '@/services/assetAssignmentService'

export function AssetAssignmentListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AssetAssignmentStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: assignmentsData, isLoading, error } = useAssetAssignments({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    assetType: typeFilter !== 'all' ? typeFilter : undefined,
    assetCategory: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useAssetAssignmentStats()
  const bulkDeleteMutation = useBulkDeleteAssetAssignments()

  const assignments = assignmentsData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === assignments.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(assignments.map(a => a._id))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} تخصيص؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: AssetAssignmentStatus) => {
    const colors: Record<AssetAssignmentStatus, string> = {
      assigned: 'bg-blue-100 text-blue-700 border-blue-200',
      in_use: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      returned: 'bg-slate-100 text-slate-700 border-slate-200',
      lost: 'bg-red-100 text-red-700 border-red-200',
      damaged: 'bg-amber-100 text-amber-700 border-amber-200',
      maintenance: 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return colors[status]
  }

  const getTypeIcon = (type: AssetType) => {
    const icons: Record<string, React.ReactNode> = {
      laptop: <Laptop className="w-4 h-4" />,
      desktop: <Monitor className="w-4 h-4" />,
      mobile_phone: <Smartphone className="w-4 h-4" />,
      tablet: <Smartphone className="w-4 h-4" />,
      monitor: <Monitor className="w-4 h-4" />,
      vehicle: <Car className="w-4 h-4" />,
      access_card: <Key className="w-4 h-4" />,
      keys: <Key className="w-4 h-4" />,
      tools: <Wrench className="w-4 h-4" />,
    }
    return icons[type] || <Package className="w-4 h-4" />
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الأصول والمعدات', href: '/dashboard/hr/asset-assignment', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
          title="الأصول والمعدات"
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
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي التخصيصات</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalAssignments || 0}</p>
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
                      <p className="text-xs text-slate-500">قيد الاستخدام</p>
                      <p className="text-xl font-bold text-navy">{stats?.activeAssignments || 0}</p>
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
                      <p className="text-xs text-slate-500">متأخرة الإرجاع</p>
                      <p className="text-xl font-bold text-navy">{stats?.overdueReturns || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Wrench className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">صيانة مطلوبة</p>
                      <p className="text-xl font-bold text-navy">{stats?.maintenanceDue || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Warning Cards */}
            {(stats?.overdueReturns || 0) > 0 && (
              <Card className="rounded-2xl border-slate-100 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">تخصيصات متأخرة الإرجاع</p>
                        <p className="text-xs text-amber-600">{stats?.overdueReturns} تخصيص تجاوز موعد الإرجاع</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-amber-700 border-amber-300 hover:bg-amber-100"
                      onClick={() => setStatusFilter('assigned')}
                    >
                      عرض
                    </Button>
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
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن أصل أو موظف..."
                        className="pr-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AssetAssignmentStatus | 'all')}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(ASSET_ASSIGNMENT_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AssetType | 'all')}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        {Object.entries(ASSET_TYPE_LABELS).slice(0, 10).map(([key, label]) => (
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
                        <Trash2 className="w-4 h-4 ms-1" />
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
                      onClick={() => navigate({ to: '/dashboard/hr/asset-assignment/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" />
                      تخصيص جديد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === assignments.length && assignments.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({assignments.length})
                </span>
              </div>
            )}

            {/* Assignments List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل التخصيصات...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : assignments.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد تخصيصات</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/asset-assignment/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" />
                    إضافة تخصيص جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(assignment._id)}
                            onCheckedChange={() => handleSelectOne(assignment._id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-slate-100 rounded-lg">
                                  {getTypeIcon(assignment.assetType)}
                                </div>
                                <h3 className="font-bold text-navy">
                                  {assignment.assetNameAr || assignment.assetName}
                                </h3>
                                {assignment.returnProcess?.returnInitiated && !assignment.returnProcess?.returnCompleted && (
                                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                                    <RotateCcw className="w-3 h-3 ms-1" />
                                    قيد الإرجاع
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">
                                {assignment.assignmentNumber} - {assignment.assetTag}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(assignment.status)}>
                                {ASSET_ASSIGNMENT_STATUS_LABELS[assignment.status]?.ar}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/asset-assignment/${assignment._id}` })}>
                                    <Eye className="w-4 h-4 ms-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/asset-assignment/new?editId=${assignment._id}` })}>
                                    <Edit className="w-4 h-4 ms-2" />
                                    تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 ms-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500">الموظف</p>
                              <div className="flex items-center gap-1 mt-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span className="text-sm font-medium">
                                  {assignment.employeeNameAr || assignment.employeeName}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">نوع الأصل</p>
                              <Badge className={`mt-1 bg-${ASSET_CATEGORY_LABELS[assignment.assetCategory]?.color}-100 text-${ASSET_CATEGORY_LABELS[assignment.assetCategory]?.color}-700`}>
                                {ASSET_TYPE_LABELS[assignment.assetType]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الحالة الفنية</p>
                              <Badge className={`mt-1 bg-${ASSET_CONDITION_LABELS[assignment.conditionAtAssignment]?.color}-100 text-${ASSET_CONDITION_LABELS[assignment.conditionAtAssignment]?.color}-700`}>
                                {ASSET_CONDITION_LABELS[assignment.conditionAtAssignment]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">القسم</p>
                              <p className="text-sm font-medium mt-1">{assignment.department || '-'}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                تاريخ التخصيص: {new Date(assignment.assignedDate).toLocaleDateString('ar-SA')}
                              </span>
                              {assignment.expectedReturnDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  الإرجاع: {new Date(assignment.expectedReturnDate).toLocaleDateString('ar-SA')}
                                </span>
                              )}
                              {assignment.purchasePrice && (
                                <span>{assignment.purchasePrice.toLocaleString('ar-SA')} ر.س</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: `/dashboard/hr/asset-assignment/${assignment._id}` })}
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
