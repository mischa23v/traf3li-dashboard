import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import {
  useOrganizationalUnit,
  useDeleteOrganizationalUnit,
  useActivateOrganizationalUnit,
  useDeactivateOrganizationalUnit,
  useDissolveOrganizationalUnit,
} from '@/hooks/useOrganizationalStructure'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search, Bell, ArrowRight, User, Calendar,
  CheckCircle, XCircle, AlertCircle, Loader2,
  TreeDeciduous, Building2, Users, Network,
  Trash2, Edit, MoreHorizontal, Play, Power,
  PowerOff, MapPin, Wallet, Shield, Target,
  Phone, Mail, Layers, TrendingUp, Clock, GitBranch
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  UNIT_TYPE_LABELS,
  UNIT_STATUS_LABELS,
  COST_CENTER_TYPE_LABELS,
  APPROVAL_AUTHORITY_LABELS,
  type UnitStatus,
} from '@/services/organizationalStructureService'

export function OrganizationalStructureDetailsView() {
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
  const { unitId } = useParams({ strict: false })

  const { data: unit, isLoading, error } = useOrganizationalUnit(unitId || '')
  const deleteMutation = useDeleteOrganizationalUnit()
  const activateMutation = useActivateOrganizationalUnit()
  const deactivateMutation = useDeactivateOrganizationalUnit()
  const dissolveMutation = useDissolveOrganizationalUnit()

  // Dialog states
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showDissolveDialog, setShowDissolveDialog] = useState(false)

  // Form states
  const [deactivateReason, setDeactivateReason] = useState('')
  const [dissolveReason, setDissolveReason] = useState('')
  const [dissolveDate, setDissolveDate] = useState('')

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الهيكل التنظيمي', href: ROUTES.dashboard.hr.organizationalStructure.list, isActive: true },
  ]

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

  const handleActivate = async () => {
    if (!unitId) return
    await activateMutation.mutateAsync(unitId)
  }

  const handleDeactivate = async () => {
    if (!unitId) return
    await deactivateMutation.mutateAsync({
      unitId,
      data: { reason: deactivateReason || undefined },
    })
    setShowDeactivateDialog(false)
    setDeactivateReason('')
  }

  const handleDissolve = async () => {
    if (!unitId || !dissolveReason) return
    await dissolveMutation.mutateAsync({
      unitId,
      data: { reason: dissolveReason, effectiveDate: dissolveDate || undefined },
    })
    setShowDissolveDialog(false)
    setDissolveReason('')
    setDissolveDate('')
  }

  const handleDelete = async () => {
    if (!unitId) return
    if (confirm('هل أنت متأكد من حذف هذه الوحدة التنظيمية؟')) {
      await deleteMutation.mutateAsync(unitId)
      navigate({ to: ROUTES.dashboard.hr.organizationalStructure.list })
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title="تفاصيل الوحدة التنظيمية"
          type="organizational-structure"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Loading/Error States */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل البيانات...</p>
                </CardContent>
              </Card>
            ) : error || !unit ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
                  <p className="text-red-600">حدث خطأ في تحميل بيانات الوحدة</p>
                  <Button
                    onClick={() => navigate({ to: ROUTES.dashboard.hr.organizationalStructure.list })}
                    className="mt-4"
                  >
                    العودة للقائمة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-white"
                      onClick={() => navigate({ to: ROUTES.dashboard.hr.organizationalStructure.list })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-navy">
                          {unit.unitNameAr || unit.unitName}
                        </h1>
                        <Badge className={getStatusColor(unit.status)}>
                          {UNIT_STATUS_LABELS[unit.status]?.ar}
                        </Badge>
                      </div>
                      <p className="text-slate-500">
                        {unit.unitCode} - {UNIT_TYPE_LABELS[unit.unitType]?.ar}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/organizational-structure/new?editId=${unit._id}` })}>
                          <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                          <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Action Buttons based on Status */}
                <Card className="rounded-2xl border-slate-100">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {unit.status === 'inactive' && (
                        <Button
                          onClick={handleActivate}
                          disabled={activateMutation.isPending}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                        >
                          <Power className="w-4 h-4 ms-2" />
                          {activateMutation.isPending ? 'جاري التفعيل...' : 'تفعيل'}
                        </Button>
                      )}

                      {unit.status === 'active' && (
                        <>
                          <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50">
                                <PowerOff className="w-4 h-4 ms-2" />
                                تعطيل
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تعطيل الوحدة التنظيمية</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>سبب التعطيل (اختياري)</Label>
                                  <Textarea
                                    value={deactivateReason}
                                    onChange={(e) => setDeactivateReason(e.target.value)}
                                    placeholder="يرجى توضيح سبب التعطيل..."
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowDeactivateDialog(false)} className="rounded-xl">
                                    إلغاء
                                  </Button>
                                  <Button
                                    onClick={handleDeactivate}
                                    disabled={deactivateMutation.isPending}
                                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                                  >
                                    {deactivateMutation.isPending ? 'جاري التعطيل...' : 'تعطيل'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showDissolveDialog} onOpenChange={setShowDissolveDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                                <XCircle className="w-4 h-4 ms-2" />
                                حل الوحدة
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>حل الوحدة التنظيمية</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>سبب الحل <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    value={dissolveReason}
                                    onChange={(e) => setDissolveReason(e.target.value)}
                                    placeholder="يرجى توضيح سبب حل الوحدة..."
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>تاريخ السريان</Label>
                                  <Input
                                    type="date"
                                    value={dissolveDate}
                                    onChange={(e) => setDissolveDate(e.target.value)}
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowDissolveDialog(false)} className="rounded-xl">
                                    إلغاء
                                  </Button>
                                  <Button
                                    onClick={handleDissolve}
                                    disabled={!dissolveReason || dissolveMutation.isPending}
                                    variant="destructive"
                                    className="rounded-xl"
                                  >
                                    {dissolveMutation.isPending ? 'جاري الحل...' : 'حل الوحدة'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                    <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="hierarchy" className="rounded-lg">الهيكل</TabsTrigger>
                    <TabsTrigger value="headcount" className="rounded-lg">الموظفين</TabsTrigger>
                    <TabsTrigger value="budget" className="rounded-lg">الميزانية</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Basic Info */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <TreeDeciduous className="w-5 h-5 text-emerald-500" />
                          المعلومات الأساسية
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">رمز الوحدة</p>
                            <p className="font-medium text-navy">{unit.unitCode}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">نوع الوحدة</p>
                            <Badge className={getColorClasses(UNIT_TYPE_LABELS[unit.unitType]?.color)}>
                              {UNIT_TYPE_LABELS[unit.unitType]?.ar}
                            </Badge>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">المستوى</p>
                            <p className="font-medium text-navy">المستوى {unit.level}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الحالة</p>
                            <Badge className={getStatusColor(unit.status)}>
                              {UNIT_STATUS_LABELS[unit.status]?.ar}
                            </Badge>
                          </div>
                        </div>

                        {(unit.description || unit.descriptionAr) && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">الوصف</p>
                            <p className="text-slate-700">{unit.descriptionAr || unit.description}</p>
                          </div>
                        )}

                        {(unit.mission || unit.missionAr) && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">الرسالة</p>
                            <p className="text-slate-700">{unit.missionAr || unit.mission}</p>
                          </div>
                        )}

                        {(unit.vision || unit.visionAr) && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">الرؤية</p>
                            <p className="text-slate-700">{unit.visionAr || unit.vision}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Leadership */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          القيادة
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">المدير</p>
                            <p className="font-medium text-navy">{unit.managerNameAr || unit.managerName || '-'}</p>
                          </div>
                          {unit.leadership && unit.leadership.length > 0 && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">المناصب القيادية</p>
                              <p className="font-medium text-navy">{unit.leadership.length} منصب</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact & Location */}
                    {(unit.location || unit.email || unit.phone) && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                            الموقع والاتصال
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(unit.location || unit.locationAr) && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الموقع</p>
                                <p className="font-medium text-navy">{unit.locationAr || unit.location}</p>
                              </div>
                            )}
                            {unit.city && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">المدينة</p>
                                <p className="font-medium text-navy">{unit.city}</p>
                              </div>
                            )}
                            {unit.email && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">البريد الإلكتروني</p>
                                <p className="font-medium text-navy text-sm" dir="ltr">{unit.email}</p>
                              </div>
                            )}
                            {unit.phone && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الهاتف</p>
                                <p className="font-medium text-navy" dir="ltr">{unit.phone}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Dates */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          التواريخ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {unit.establishedDate && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تاريخ التأسيس</p>
                              <p className="font-medium text-navy">{new Date(unit.establishedDate).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                          {unit.effectiveDate && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تاريخ السريان</p>
                              <p className="font-medium text-navy">{new Date(unit.effectiveDate).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</p>
                            <p className="font-medium text-navy">{new Date(unit.createdOn).toLocaleDateString('ar-SA')}</p>
                          </div>
                          {unit.updatedOn && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">آخر تحديث</p>
                              <p className="font-medium text-navy">{new Date(unit.updatedOn).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Hierarchy Tab */}
                  <TabsContent value="hierarchy" className="space-y-6">
                    {/* Parent Unit */}
                    {unit.parentUnitId && (
                      <Card className="rounded-2xl border-blue-200 bg-blue-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            <Network className="w-5 h-5 text-blue-600" />
                            الوحدة الأب
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 bg-white rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-blue-700">{unit.parentUnitName}</p>
                                <p className="text-sm text-blue-500">{unit.parentUnitCode}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate({ to: ROUTES.dashboard.hr.organizationalStructure.detail(unit.parentUnitId) })}
                                className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                عرض
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Child Units */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <GitBranch className="w-5 h-5 text-emerald-500" />
                          الوحدات الفرعية ({unit.childUnits?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {unit.childUnits && unit.childUnits.length > 0 ? (
                          <div className="space-y-3">
                            {unit.childUnits.map((child) => (
                              <div key={child.unitId} className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-navy">{child.unitNameAr || child.unitName}</p>
                                    <p className="text-sm text-slate-500">{child.unitCode} - {UNIT_TYPE_LABELS[child.unitType]?.ar}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge className={getStatusColor(child.status)}>
                                      {UNIT_STATUS_LABELS[child.status]?.ar}
                                    </Badge>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate({ to: ROUTES.dashboard.hr.organizationalStructure.detail(child.unitId) })}
                                      className="rounded-xl"
                                    >
                                      عرض
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <GitBranch className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500">لا توجد وحدات فرعية</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Headcount Tab */}
                  <TabsContent value="headcount" className="space-y-6">
                    {unit.headcount ? (
                      <>
                        <Card className="rounded-2xl border-slate-100">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <Users className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                              العدد الوظيفي
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">العدد المعتمد</p>
                                <p className="text-2xl font-bold text-emerald-700">{unit.headcount.approvedHeadcount}</p>
                              </div>
                              <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-xs text-blue-600 mb-1">العدد الحالي</p>
                                <p className="text-2xl font-bold text-blue-700">{unit.headcount.currentHeadcount}</p>
                              </div>
                              <div className="p-4 bg-amber-50 rounded-xl">
                                <p className="text-xs text-amber-600 mb-1">الشواغر</p>
                                <p className="text-2xl font-bold text-amber-700">{unit.headcount.vacancies}</p>
                              </div>
                              {unit.headcount.vacancyRate !== undefined && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-600 mb-1">نسبة الشواغر</p>
                                  <p className="text-2xl font-bold text-slate-700">{unit.headcount.vacancyRate}%</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-100">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <Layers className="w-5 h-5 text-emerald-500" />
                              توزيع الموظفين
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">دوام كامل</p>
                                <p className="font-bold text-navy">{unit.headcount.fullTimeEmployees}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">دوام جزئي</p>
                                <p className="font-bold text-navy">{unit.headcount.partTimeEmployees}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">متعاقدين</p>
                                <p className="font-bold text-navy">{unit.headcount.contractors}</p>
                              </div>
                              {unit.headcount.temporaryWorkers !== undefined && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">مؤقتين</p>
                                  <p className="font-bold text-navy">{unit.headcount.temporaryWorkers}</p>
                                </div>
                              )}
                              {unit.headcount.interns !== undefined && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">متدربين</p>
                                  <p className="font-bold text-navy">{unit.headcount.interns}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {(unit.headcount.saudizationRate !== undefined || unit.headcount.saudiCount !== undefined) && (
                          <Card className="rounded-2xl border-emerald-200 bg-emerald-50/50">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                السعودة
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {unit.headcount.saudizationRate !== undefined && (
                                  <div className="p-4 bg-white rounded-xl">
                                    <p className="text-xs text-emerald-600 mb-1">نسبة السعودة</p>
                                    <p className="text-2xl font-bold text-emerald-700">{unit.headcount.saudizationRate}%</p>
                                  </div>
                                )}
                                {unit.headcount.saudiCount !== undefined && (
                                  <div className="p-4 bg-white rounded-xl">
                                    <p className="text-xs text-emerald-600 mb-1">السعوديين</p>
                                    <p className="font-bold text-emerald-700">{unit.headcount.saudiCount}</p>
                                  </div>
                                )}
                                {unit.headcount.nonSaudiCount !== undefined && (
                                  <div className="p-4 bg-white rounded-xl">
                                    <p className="text-xs text-emerald-600 mb-1">غير السعوديين</p>
                                    <p className="font-bold text-emerald-700">{unit.headcount.nonSaudiCount}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card className="rounded-2xl border-slate-100">
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" aria-hidden="true" />
                          <p className="text-slate-500">لا توجد بيانات للعدد الوظيفي</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Budget Tab */}
                  <TabsContent value="budget" className="space-y-6">
                    {unit.budget && unit.budget.annualBudget ? (
                      <>
                        <Card className="rounded-2xl border-slate-100">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <Wallet className="w-5 h-5 text-emerald-500" />
                              الميزانية
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-4 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">الميزانية السنوية</p>
                                <p className="text-xl font-bold text-emerald-700">
                                  {unit.budget.annualBudget?.toLocaleString()} {unit.budget.currency}
                                </p>
                              </div>
                              {unit.budget.salaryBudget !== undefined && (
                                <div className="p-4 bg-blue-50 rounded-xl">
                                  <p className="text-xs text-blue-600 mb-1">ميزانية الرواتب</p>
                                  <p className="text-xl font-bold text-blue-700">
                                    {unit.budget.salaryBudget?.toLocaleString()} {unit.budget.currency}
                                  </p>
                                </div>
                              )}
                              {unit.budget.operationalBudget !== undefined && (
                                <div className="p-4 bg-amber-50 rounded-xl">
                                  <p className="text-xs text-amber-600 mb-1">الميزانية التشغيلية</p>
                                  <p className="text-xl font-bold text-amber-700">
                                    {unit.budget.operationalBudget?.toLocaleString()} {unit.budget.currency}
                                  </p>
                                </div>
                              )}
                              {unit.budget.budgetUtilization !== undefined && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-600 mb-1">نسبة الاستخدام</p>
                                  <p className="text-xl font-bold text-slate-700">{unit.budget.budgetUtilization}%</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card className="rounded-2xl border-slate-100">
                        <CardContent className="p-8 text-center">
                          <Wallet className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-500">لا توجد بيانات للميزانية</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Cost Center */}
                    {unit.costCenter && unit.costCenter.costCenterCode && (
                      <Card className="rounded-2xl border-purple-200 bg-purple-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            مركز التكلفة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-purple-600 mb-1">رمز المركز</p>
                              <p className="font-bold text-purple-700">{unit.costCenter.costCenterCode}</p>
                            </div>
                            {(unit.costCenter.costCenterName || unit.costCenter.costCenterNameAr) && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-purple-600 mb-1">اسم المركز</p>
                                <p className="font-bold text-purple-700">
                                  {unit.costCenter.costCenterNameAr || unit.costCenter.costCenterName}
                                </p>
                              </div>
                            )}
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-purple-600 mb-1">نوع المركز</p>
                              <Badge className={getColorClasses(COST_CENTER_TYPE_LABELS[unit.costCenter.costCenterType]?.color)}>
                                {COST_CENTER_TYPE_LABELS[unit.costCenter.costCenterType]?.ar}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Compliance */}
                    {unit.compliance && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            الامتثال
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                              <span className="text-sm text-slate-700">نظام العمل</span>
                              {unit.compliance.laborLawCompliant ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                              <span className="text-sm text-slate-700">السعودة</span>
                              {unit.compliance.saudizationCompliant ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                              <span className="text-sm text-slate-700">الصحة والسلامة</span>
                              {unit.compliance.healthSafetyCompliant ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="organizational-structure" />
        </div>
      </Main>
    </>
  )
}
