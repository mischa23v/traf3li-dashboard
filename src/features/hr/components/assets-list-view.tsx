import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useAssets, useAssetStats, useBulkDeleteAssets } from '@/hooks/useAssets'
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
  AlertCircle, Loader2, Package, Laptop, Smartphone, Car,
  Monitor, Key, CreditCard, Wrench, Shield, AlertTriangle,
  CheckCircle, XCircle, Clock
} from 'lucide-react'
import {
  ASSET_TYPE_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_CATEGORY_LABELS,
  CONDITION_LABELS,
  type AssetStatus,
  type AssetType,
  type AssetCategory,
} from '@/services/assetsService'

export function AssetsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: assetsData, isLoading, error } = useAssets({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    assetType: typeFilter !== 'all' ? typeFilter : undefined,
    assetCategory: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useAssetStats()
  const bulkDeleteMutation = useBulkDeleteAssets()

  const assets = assetsData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(assets.map(a => a._id))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} أصل؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: AssetStatus) => {
    const colors: Record<AssetStatus, string> = {
      assigned: 'bg-blue-100 text-blue-700 border-blue-200',
      in_use: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      returned: 'bg-slate-100 text-slate-700 border-slate-200',
      lost: 'bg-red-100 text-red-700 border-red-200',
      damaged: 'bg-orange-100 text-orange-700 border-orange-200',
      maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
      repair: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      retired: 'bg-gray-100 text-gray-700 border-gray-200',
      available: 'bg-teal-100 text-teal-700 border-teal-200',
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
      access_card: <CreditCard className="w-4 h-4" />,
      keys: <Key className="w-4 h-4" />,
      tools: <Wrench className="w-4 h-4" />,
    }
    return icons[type] || <Package className="w-4 h-4" />
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الأصول', href: '/dashboard/hr/assets', isActive: true },
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
                      <p className="text-xs text-slate-500">إجمالي الأصول</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalAssets || 0}</p>
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
                      <p className="text-xs text-slate-500">مُخصصة</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalAssigned || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-xl">
                      <Package className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">متاحة</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalAvailable || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Wrench className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">في الصيانة</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalInMaintenance || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats?.warrantyExpiringSoon && stats.warrantyExpiringSoon > 0 && (
                <Card className="rounded-2xl border-amber-200 bg-amber-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <Shield className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">ضمانات تنتهي قريباً</p>
                        <p className="text-xs text-amber-600">{stats.warrantyExpiringSoon} أصل</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats?.maintenanceOverdue && stats.maintenanceOverdue > 0 && (
                <Card className="rounded-2xl border-red-200 bg-red-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">صيانة متأخرة</p>
                        <p className="text-xs text-red-600">{stats.maintenanceOverdue} أصل</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats?.pendingReturns && stats.pendingReturns > 0 && (
                <Card className="rounded-2xl border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">في انتظار الإرجاع</p>
                        <p className="text-xs text-purple-600">{stats.pendingReturns} أصل</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

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
                        placeholder="بحث عن أصل..."
                        className="pr-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AssetStatus | 'all')}>
                      <SelectTrigger className="w-[130px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(ASSET_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AssetCategory | 'all')}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الفئات</SelectItem>
                        {Object.entries(ASSET_CATEGORY_LABELS).map(([key, label]) => (
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
                      onClick={() => navigate({ to: '/dashboard/hr/assets/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      تخصيص أصل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === assets.length && assets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({assets.length})
                </span>
              </div>
            )}

            {/* Assets List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل الأصول...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : assets.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد أصول</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/assets/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    تخصيص أصل جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <Card key={asset._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(asset._id)}
                            onCheckedChange={() => handleSelectOne(asset._id)}
                            className="mt-1"
                          />
                        )}
                        <div className="p-3 bg-slate-100 rounded-xl">
                          {getTypeIcon(asset.assetType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-navy">
                                  {asset.assetNameAr || asset.assetName}
                                </h3>
                                {asset.warranty?.expired === false && (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                    <Shield className="w-3 h-3 ml-1" />
                                    ضمان ساري
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">
                                {asset.assetTag} - {asset.serialNumber || 'بدون رقم تسلسلي'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(asset.status)}>
                                {ASSET_STATUS_LABELS[asset.status]?.ar}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/assets/${asset._id}` })}>
                                    <Eye className="w-4 h-4 ml-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/assets/new?editId=${asset._id}` })}>
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

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500">النوع</p>
                              <Badge className={`mt-1 bg-${ASSET_TYPE_LABELS[asset.assetType]?.color}-100 text-${ASSET_TYPE_LABELS[asset.assetType]?.color}-700`}>
                                {ASSET_TYPE_LABELS[asset.assetType]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الفئة</p>
                              <p className="font-medium text-sm">{ASSET_CATEGORY_LABELS[asset.assetCategory]?.ar}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الحالة</p>
                              <Badge className={`mt-1 bg-${CONDITION_LABELS[asset.conditionAtAssignment]?.color}-100 text-${CONDITION_LABELS[asset.conditionAtAssignment]?.color}-700`}>
                                {CONDITION_LABELS[asset.conditionAtAssignment]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">القيمة</p>
                              <p className="font-medium text-sm">
                                {asset.currentValue?.toLocaleString('ar-SA') || asset.purchasePrice?.toLocaleString('ar-SA') || '-'} {asset.currency || 'ر.س'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {asset.employeeNameAr || asset.employeeName}
                              </span>
                              {asset.department && (
                                <span>• {asset.department}</span>
                              )}
                              <span>• {new Date(asset.assignedDate).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: `/dashboard/hr/assets/${asset._id}` })}
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
