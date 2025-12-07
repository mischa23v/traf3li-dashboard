import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  useAsset,
  useInitiateReturn,
  useCompleteReturn,
  useRecordMaintenance,
  useReportRepair,
  useReportIncident,
  useDeleteAsset,
} from '@/hooks/useAssets'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search, Bell, ArrowRight, User, Calendar,
  AlertCircle, Loader2, Package, MapPin,
  Shield, Wrench, AlertTriangle, Trash2, Edit, MoreHorizontal,
  Laptop, Smartphone, Car, Monitor, Key, RotateCcw,
  DollarSign, Clock, CheckCircle, XCircle, FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ASSET_TYPE_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_CATEGORY_LABELS,
  CONDITION_LABELS,
  OWNERSHIP_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  INCIDENT_TYPE_LABELS,
  type AssetStatus,
  type AssetCondition,
  type ReturnReason,
  type IncidentType,
} from '@/services/assetsService'

export function AssetsDetailsView() {
  const navigate = useNavigate()
  const { assetId } = useParams({ strict: false })

  const { data: asset, isLoading, error } = useAsset(assetId || '')
  const initiateReturnMutation = useInitiateReturn()
  const completeReturnMutation = useCompleteReturn()
  const maintenanceMutation = useRecordMaintenance()
  const repairMutation = useReportRepair()
  const incidentMutation = useReportIncident()
  const deleteMutation = useDeleteAsset()

  // Dialog states
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false)
  const [showRepairDialog, setShowRepairDialog] = useState(false)
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)

  // Return form
  const [returnReason, setReturnReason] = useState<ReturnReason>('no_longer_needed')
  const [returnReasonDetails, setReturnReasonDetails] = useState('')
  const [returnDueDate, setReturnDueDate] = useState('')
  const [returnMethod, setReturnMethod] = useState<'hand_delivery' | 'courier' | 'mail' | 'pickup'>('hand_delivery')

  // Maintenance form
  const [maintenanceType, setMaintenanceType] = useState<'preventive' | 'corrective' | 'inspection' | 'upgrade'>('preventive')
  const [maintenanceDate, setMaintenanceDate] = useState('')
  const [maintenanceDescription, setMaintenanceDescription] = useState('')
  const [maintenanceCost, setMaintenanceCost] = useState<number>(0)

  // Repair form
  const [repairIssue, setRepairIssue] = useState('')
  const [repairSeverity, setRepairSeverity] = useState<'minor' | 'moderate' | 'major' | 'critical'>('minor')
  const [repairCause, setRepairCause] = useState<'normal_wear' | 'accident' | 'misuse' | 'manufacturing_defect' | 'external_factors' | 'unknown'>('unknown')

  // Incident form
  const [incidentType, setIncidentType] = useState<IncidentType>('damage')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الأصول', href: '/dashboard/hr/assets', isActive: true },
  ]

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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      laptop: <Laptop className="w-5 h-5" />,
      desktop: <Monitor className="w-5 h-5" />,
      mobile_phone: <Smartphone className="w-5 h-5" />,
      vehicle: <Car className="w-5 h-5" />,
      keys: <Key className="w-5 h-5" />,
    }
    return icons[type] || <Package className="w-5 h-5" />
  }

  const handleInitiateReturn = async () => {
    if (!assetId || !returnDueDate) return
    await initiateReturnMutation.mutateAsync({
      assignmentId: assetId,
      data: {
        returnReason,
        returnReasonDetails,
        returnDueDate,
        returnMethod,
      },
    })
    setShowReturnDialog(false)
  }

  const handleRecordMaintenance = async () => {
    if (!assetId || !maintenanceDate || !maintenanceDescription) return
    await maintenanceMutation.mutateAsync({
      assignmentId: assetId,
      data: {
        maintenanceType,
        maintenanceDate,
        performedBy: 'internal',
        description: maintenanceDescription,
        totalCost: maintenanceCost,
      },
    })
    setShowMaintenanceDialog(false)
    setMaintenanceDescription('')
    setMaintenanceCost(0)
  }

  const handleReportRepair = async () => {
    if (!assetId || !repairIssue) return
    await repairMutation.mutateAsync({
      assignmentId: assetId,
      data: {
        issueDescription: repairIssue,
        severity: repairSeverity,
        causeOfDamage: repairCause,
      },
    })
    setShowRepairDialog(false)
    setRepairIssue('')
  }

  const handleReportIncident = async () => {
    if (!assetId || !incidentDate || !incidentDescription) return
    await incidentMutation.mutateAsync({
      assignmentId: assetId,
      data: {
        incidentType,
        incidentDate,
        incidentDescription,
        location: incidentLocation,
        circumstances: {
          witnessPresent: false,
        },
      },
    })
    setShowIncidentDialog(false)
    setIncidentDescription('')
  }

  const handleDelete = async () => {
    if (!assetId) return
    if (confirm('هل أنت متأكد من حذف هذا الأصل؟')) {
      await deleteMutation.mutateAsync(assetId)
      navigate({ to: '/dashboard/hr/assets' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600">حدث خطأ في تحميل بيانات الأصل</p>
        <Button
          onClick={() => navigate({ to: '/dashboard/hr/assets' })}
          className="mt-4"
        >
          العودة للقائمة
        </Button>
      </div>
    )
  }

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
          title="تفاصيل الأصل"
          type="employees"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-white"
                  onClick={() => navigate({ to: '/dashboard/hr/assets' })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div className="p-3 bg-slate-100 rounded-xl">
                  {getTypeIcon(asset.assetType)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-navy">
                      {asset.assetNameAr || asset.assetName}
                    </h1>
                    <Badge className={getStatusColor(asset.status)}>
                      {ASSET_STATUS_LABELS[asset.status]?.ar}
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    {asset.assetTag} - {asset.serialNumber || 'بدون رقم تسلسلي'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/assets/new?editId=${asset._id}` })}>
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Action Buttons */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {asset.status === 'in_use' && !asset.returnProcess?.returnInitiated && (
                    <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl">
                          <RotateCcw className="w-4 h-4 ml-2" />
                          بدء الإرجاع
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>بدء عملية إرجاع الأصل</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>سبب الإرجاع</Label>
                            <Select value={returnReason} onValueChange={(v) => setReturnReason(v as ReturnReason)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="resignation">استقالة</SelectItem>
                                <SelectItem value="termination">إنهاء خدمة</SelectItem>
                                <SelectItem value="upgrade">ترقية</SelectItem>
                                <SelectItem value="project_end">انتهاء مشروع</SelectItem>
                                <SelectItem value="replacement">استبدال</SelectItem>
                                <SelectItem value="no_longer_needed">لم يعد مطلوباً</SelectItem>
                                <SelectItem value="defective">عطل</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>تاريخ الإرجاع المطلوب</Label>
                            <Input
                              type="date"
                              value={returnDueDate}
                              onChange={(e) => setReturnDueDate(e.target.value)}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>طريقة الإرجاع</Label>
                            <Select value={returnMethod} onValueChange={(v) => setReturnMethod(v as typeof returnMethod)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hand_delivery">تسليم يدوي</SelectItem>
                                <SelectItem value="courier">شركة شحن</SelectItem>
                                <SelectItem value="mail">بريد</SelectItem>
                                <SelectItem value="pickup">استلام من الموقع</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>تفاصيل إضافية</Label>
                            <Textarea
                              value={returnReasonDetails}
                              onChange={(e) => setReturnReasonDetails(e.target.value)}
                              placeholder="أي تفاصيل إضافية..."
                              className="rounded-xl"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowReturnDialog(false)} className="rounded-xl">
                              إلغاء
                            </Button>
                            <Button
                              onClick={handleInitiateReturn}
                              disabled={!returnDueDate || initiateReturnMutation.isPending}
                              className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                            >
                              {initiateReturnMutation.isPending ? 'جاري الإرسال...' : 'بدء الإرجاع'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl">
                        <Wrench className="w-4 h-4 ml-2" />
                        تسجيل صيانة
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تسجيل صيانة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>نوع الصيانة</Label>
                          <Select value={maintenanceType} onValueChange={(v) => setMaintenanceType(v as typeof maintenanceType)}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="preventive">وقائية</SelectItem>
                              <SelectItem value="corrective">تصحيحية</SelectItem>
                              <SelectItem value="inspection">فحص</SelectItem>
                              <SelectItem value="upgrade">ترقية</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>تاريخ الصيانة</Label>
                          <Input
                            type="date"
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الوصف</Label>
                          <Textarea
                            value={maintenanceDescription}
                            onChange={(e) => setMaintenanceDescription(e.target.value)}
                            placeholder="وصف أعمال الصيانة..."
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>التكلفة</Label>
                          <Input
                            type="number"
                            value={maintenanceCost || ''}
                            onChange={(e) => setMaintenanceCost(Number(e.target.value))}
                            placeholder="0.00"
                            className="rounded-xl"
                            min={0}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)} className="rounded-xl">
                            إلغاء
                          </Button>
                          <Button
                            onClick={handleRecordMaintenance}
                            disabled={!maintenanceDate || !maintenanceDescription || maintenanceMutation.isPending}
                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                          >
                            {maintenanceMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showRepairDialog} onOpenChange={setShowRepairDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl text-orange-600 border-orange-200 hover:bg-orange-50">
                        <AlertTriangle className="w-4 h-4 ml-2" />
                        الإبلاغ عن عطل
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>الإبلاغ عن عطل</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>وصف المشكلة</Label>
                          <Textarea
                            value={repairIssue}
                            onChange={(e) => setRepairIssue(e.target.value)}
                            placeholder="وصف تفصيلي للمشكلة..."
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الخطورة</Label>
                          <Select value={repairSeverity} onValueChange={(v) => setRepairSeverity(v as typeof repairSeverity)}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minor">بسيط</SelectItem>
                              <SelectItem value="moderate">متوسط</SelectItem>
                              <SelectItem value="major">كبير</SelectItem>
                              <SelectItem value="critical">حرج</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>سبب العطل</Label>
                          <Select value={repairCause} onValueChange={(v) => setRepairCause(v as typeof repairCause)}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal_wear">اهتراء طبيعي</SelectItem>
                              <SelectItem value="accident">حادث</SelectItem>
                              <SelectItem value="misuse">سوء استخدام</SelectItem>
                              <SelectItem value="manufacturing_defect">عيب تصنيع</SelectItem>
                              <SelectItem value="external_factors">عوامل خارجية</SelectItem>
                              <SelectItem value="unknown">غير معروف</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowRepairDialog(false)} className="rounded-xl">
                            إلغاء
                          </Button>
                          <Button
                            onClick={handleReportRepair}
                            disabled={!repairIssue || repairMutation.isPending}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                          >
                            {repairMutation.isPending ? 'جاري الإرسال...' : 'إبلاغ'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                        <AlertCircle className="w-4 h-4 ml-2" />
                        تسجيل حادث
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تسجيل حادث</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>نوع الحادث</Label>
                          <Select value={incidentType} onValueChange={(v) => setIncidentType(v as IncidentType)}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>تاريخ الحادث</Label>
                          <Input
                            type="date"
                            value={incidentDate}
                            onChange={(e) => setIncidentDate(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الموقع</Label>
                          <Input
                            value={incidentLocation}
                            onChange={(e) => setIncidentLocation(e.target.value)}
                            placeholder="مكان وقوع الحادث"
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>وصف الحادث</Label>
                          <Textarea
                            value={incidentDescription}
                            onChange={(e) => setIncidentDescription(e.target.value)}
                            placeholder="وصف تفصيلي للحادث..."
                            className="rounded-xl"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowIncidentDialog(false)} className="rounded-xl">
                            إلغاء
                          </Button>
                          <Button
                            onClick={handleReportIncident}
                            disabled={!incidentDate || !incidentDescription || incidentMutation.isPending}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                          >
                            {incidentMutation.isPending ? 'جاري الحفظ...' : 'تسجيل'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                <TabsTrigger value="maintenance" className="rounded-lg">الصيانة</TabsTrigger>
                <TabsTrigger value="incidents" className="rounded-lg">الحوادث</TabsTrigger>
                <TabsTrigger value="return" className="rounded-lg">الإرجاع</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Asset Info */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-500" />
                      معلومات الأصل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">نوع الأصل</p>
                        <Badge className={`bg-${ASSET_TYPE_LABELS[asset.assetType]?.color}-100 text-${ASSET_TYPE_LABELS[asset.assetType]?.color}-700`}>
                          {ASSET_TYPE_LABELS[asset.assetType]?.ar}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">الفئة</p>
                        <p className="font-medium text-navy">{ASSET_CATEGORY_LABELS[asset.assetCategory]?.ar}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">الحالة</p>
                        <Badge className={`bg-${CONDITION_LABELS[asset.conditionAtAssignment]?.color}-100 text-${CONDITION_LABELS[asset.conditionAtAssignment]?.color}-700`}>
                          {CONDITION_LABELS[asset.conditionAtAssignment]?.ar}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">الملكية</p>
                        <p className="font-medium text-navy">{OWNERSHIP_LABELS[asset.ownership]?.ar}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">العلامة التجارية</p>
                        <p className="font-medium text-navy">{asset.brand || '-'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">الموديل</p>
                        <p className="font-medium text-navy">{asset.model || '-'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">الرقم التسلسلي</p>
                        <p className="font-medium text-navy" dir="ltr">{asset.serialNumber || '-'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">رقم الموديل</p>
                        <p className="font-medium text-navy" dir="ltr">{asset.modelNumber || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employee Info */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" />
                      الموظف المستلم
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">اسم الموظف</p>
                        <p className="font-medium text-navy">{asset.employeeNameAr || asset.employeeName}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">رقم الموظف</p>
                        <p className="font-medium text-navy">{asset.employeeNumber}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">القسم</p>
                        <p className="font-medium text-navy">{asset.department || '-'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">المسمى الوظيفي</p>
                        <p className="font-medium text-navy">{asset.jobTitle || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignment Details */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-500" />
                      تفاصيل التخصيص
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">نوع التخصيص</p>
                        <p className="font-medium text-navy">{ASSIGNMENT_TYPE_LABELS[asset.assignmentType]?.ar}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">تاريخ التخصيص</p>
                        <p className="font-medium text-navy">{new Date(asset.assignedDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">تاريخ الإرجاع المتوقع</p>
                        <p className="font-medium text-navy">
                          {asset.indefiniteAssignment ? 'دائم' :
                            asset.expectedReturnDate ? new Date(asset.expectedReturnDate).toLocaleDateString('ar-SA') : '-'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">الموقع</p>
                        <p className="font-medium text-navy">{asset.assignmentLocation?.primaryLocation || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Value & Warranty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        القيمة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">سعر الشراء</p>
                          <p className="text-xl font-bold text-navy">
                            {asset.purchasePrice?.toLocaleString('ar-SA') || '0'} {asset.currency || 'ر.س'}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">القيمة الحالية</p>
                          <p className="text-xl font-bold text-navy">
                            {asset.currentValue?.toLocaleString('ar-SA') || '0'} {asset.currency || 'ر.س'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`rounded-2xl ${asset.warranty?.hasWarranty ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100'}`}>
                    <CardHeader className="pb-4">
                      <CardTitle className={`text-lg font-bold flex items-center gap-2 ${asset.warranty?.hasWarranty ? 'text-emerald-800' : 'text-slate-800'}`}>
                        <Shield className={`w-5 h-5 ${asset.warranty?.hasWarranty ? 'text-emerald-600' : 'text-slate-400'}`} />
                        الضمان
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {asset.warranty?.hasWarranty ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-emerald-600">حالة الضمان</span>
                            <Badge className={asset.warranty.expired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
                              {asset.warranty.expired ? 'منتهي' : 'ساري'}
                            </Badge>
                          </div>
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-xs text-emerald-600 mb-1">مقدم الضمان</p>
                            <p className="font-medium text-emerald-800">{asset.warranty.warrantyProvider || '-'}</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl">
                            <p className="text-xs text-emerald-600 mb-1">ينتهي في</p>
                            <p className="font-medium text-emerald-800">
                              {asset.warranty.warrantyEndDate ? new Date(asset.warranty.warrantyEndDate).toLocaleDateString('ar-SA') : '-'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Shield className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-500">لا يوجد ضمان</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="space-y-6">
                {asset.maintenanceHistory && asset.maintenanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {asset.maintenanceHistory.map((record) => (
                      <Card key={record.maintenanceId} className="rounded-2xl border-slate-100">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-100 rounded-xl">
                                <Wrench className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-navy">{record.description}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(record.maintenanceDate).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                            </div>
                            <div className="text-left">
                              <Badge className="bg-amber-100 text-amber-700 capitalize">
                                {record.maintenanceType === 'preventive' ? 'وقائية' :
                                  record.maintenanceType === 'corrective' ? 'تصحيحية' :
                                    record.maintenanceType === 'inspection' ? 'فحص' : 'ترقية'}
                              </Badge>
                              {record.totalCost && (
                                <p className="text-sm font-medium text-navy mt-1">
                                  {record.totalCost.toLocaleString('ar-SA')} ر.س
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-8 text-center">
                      <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">لا توجد سجلات صيانة</p>
                    </CardContent>
                  </Card>
                )}

                {/* Repairs */}
                {asset.repairs && asset.repairs.length > 0 && (
                  <Card className="rounded-2xl border-orange-200 bg-orange-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        طلبات الإصلاح
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {asset.repairs.map((repair) => (
                          <div key={repair.repairId} className="p-4 bg-white rounded-xl">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-navy">{repair.issueDescription}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(repair.reportedDate).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                              <Badge className={
                                repair.repairStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                  repair.repairStatus === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                              }>
                                {repair.repairStatus === 'reported' ? 'تم الإبلاغ' :
                                  repair.repairStatus === 'assessed' ? 'تم التقييم' :
                                    repair.repairStatus === 'approved' ? 'معتمد' :
                                      repair.repairStatus === 'in_progress' ? 'قيد الإصلاح' :
                                        repair.repairStatus === 'completed' ? 'مكتمل' : 'غير قابل للإصلاح'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <Badge className={`bg-${repair.severity === 'critical' ? 'red' : repair.severity === 'major' ? 'orange' : repair.severity === 'moderate' ? 'amber' : 'slate'}-100 text-${repair.severity === 'critical' ? 'red' : repair.severity === 'major' ? 'orange' : repair.severity === 'moderate' ? 'amber' : 'slate'}-700`}>
                                {repair.severity === 'critical' ? 'حرج' :
                                  repair.severity === 'major' ? 'كبير' :
                                    repair.severity === 'moderate' ? 'متوسط' : 'بسيط'}
                              </Badge>
                              {repair.totalRepairCost && (
                                <span className="text-navy">{repair.totalRepairCost.toLocaleString('ar-SA')} ر.س</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Incidents Tab */}
              <TabsContent value="incidents" className="space-y-6">
                {asset.incidents && asset.incidents.length > 0 ? (
                  <div className="space-y-4">
                    {asset.incidents.map((incident) => (
                      <Card key={incident.incidentId} className="rounded-2xl border-red-200 bg-red-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-navy">{incident.incidentDescription}</p>
                                  <Badge className={`bg-${INCIDENT_TYPE_LABELS[incident.incidentType]?.color}-100 text-${INCIDENT_TYPE_LABELS[incident.incidentType]?.color}-700`}>
                                    {INCIDENT_TYPE_LABELS[incident.incidentType]?.ar}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500">
                                  {new Date(incident.incidentDate).toLocaleDateString('ar-SA')}
                                  {incident.location && ` - ${incident.location}`}
                                </p>
                              </div>
                            </div>
                            <Badge className={incident.resolution.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                              {incident.resolution.resolved ? 'محلول' : 'قيد المعالجة'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="p-3 bg-white rounded-xl">
                              <p className="text-xs text-red-600 mb-1">الخطورة</p>
                              <Badge className={`bg-${incident.impact.severity === 'critical' ? 'red' : incident.impact.severity === 'major' ? 'orange' : incident.impact.severity === 'moderate' ? 'amber' : 'slate'}-100 text-${incident.impact.severity === 'critical' ? 'red' : incident.impact.severity === 'major' ? 'orange' : incident.impact.severity === 'moderate' ? 'amber' : 'slate'}-700`}>
                                {incident.impact.severity === 'critical' ? 'حرج' :
                                  incident.impact.severity === 'major' ? 'كبير' :
                                    incident.impact.severity === 'moderate' ? 'متوسط' : 'بسيط'}
                              </Badge>
                            </div>
                            <div className="p-3 bg-white rounded-xl">
                              <p className="text-xs text-red-600 mb-1">قابل للاسترداد</p>
                              <p className="font-medium">{incident.impact.assetRecoverable ? 'نعم' : 'لا'}</p>
                            </div>
                            {incident.impact.financialLoss && (
                              <div className="p-3 bg-white rounded-xl">
                                <p className="text-xs text-red-600 mb-1">الخسارة المالية</p>
                                <p className="font-medium">{incident.impact.financialLoss.toLocaleString('ar-SA')} ر.س</p>
                              </div>
                            )}
                            {incident.liability.employeeLiable && (
                              <div className="p-3 bg-white rounded-xl">
                                <p className="text-xs text-red-600 mb-1">مسؤولية الموظف</p>
                                <p className="font-medium">{incident.liability.liabilityAmount?.toLocaleString('ar-SA')} ر.س</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 mx-auto text-emerald-300 mb-4" />
                      <p className="text-slate-500">لا توجد حوادث مسجلة</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Return Tab */}
              <TabsContent value="return" className="space-y-6">
                {asset.returnProcess ? (
                  <Card className="rounded-2xl border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-purple-600" />
                        حالة الإرجاع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-purple-600 mb-1">الحالة</p>
                          <Badge className={asset.returnProcess.returnCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {asset.returnProcess.returnCompleted ? 'مكتمل' : 'قيد الإرجاع'}
                          </Badge>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-purple-600 mb-1">سبب الإرجاع</p>
                          <p className="font-medium text-purple-700">
                            {asset.returnProcess.returnReason === 'resignation' ? 'استقالة' :
                              asset.returnProcess.returnReason === 'termination' ? 'إنهاء خدمة' :
                                asset.returnProcess.returnReason === 'upgrade' ? 'ترقية' :
                                  asset.returnProcess.returnReason === 'project_end' ? 'انتهاء مشروع' :
                                    asset.returnProcess.returnReason === 'replacement' ? 'استبدال' :
                                      asset.returnProcess.returnReason === 'no_longer_needed' ? 'لم يعد مطلوباً' :
                                        asset.returnProcess.returnReason === 'defective' ? 'عطل' : 'انتهاء الإيجار'}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-purple-600 mb-1">تاريخ الإرجاع المطلوب</p>
                          <p className="font-medium text-purple-700">
                            {new Date(asset.returnProcess.returnDueDate).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        {asset.returnProcess.actualReturnDate && (
                          <div className="p-4 bg-white rounded-xl">
                            <p className="text-xs text-purple-600 mb-1">تاريخ الإرجاع الفعلي</p>
                            <p className="font-medium text-purple-700">
                              {new Date(asset.returnProcess.actualReturnDate).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        )}
                      </div>

                      {asset.returnProcess.inspection.inspected && (
                        <div className="mt-4 p-4 bg-white rounded-xl">
                          <p className="text-sm font-medium text-purple-700 mb-3">نتائج الفحص</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500">حالة الأصل عند الإرجاع</p>
                              <Badge className={`bg-${CONDITION_LABELS[asset.returnProcess.inspection.conditionAtReturn]?.color}-100 text-${CONDITION_LABELS[asset.returnProcess.inspection.conditionAtReturn]?.color}-700`}>
                                {CONDITION_LABELS[asset.returnProcess.inspection.conditionAtReturn]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">اكتمال المرفقات</p>
                              <Badge className={asset.returnProcess.inspection.completenessCheck.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                {asset.returnProcess.inspection.completenessCheck.complete ? 'مكتمل' : 'ناقص'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {asset.returnProcess.returnCharges?.hasCharges && (
                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                          <p className="text-sm font-medium text-red-700 mb-2">رسوم الإرجاع</p>
                          <p className="text-2xl font-bold text-red-700">
                            {asset.returnProcess.returnCharges.totalCharges.toLocaleString('ar-SA')} ر.س
                          </p>
                        </div>
                      )}

                      {asset.returnProcess.clearance.cleared && (
                        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <p className="font-medium text-emerald-700">تم إخلاء الطرف</p>
                          </div>
                          <p className="text-sm text-emerald-600 mt-1">
                            {new Date(asset.returnProcess.clearance.clearanceDate!).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-8 text-center">
                      <RotateCcw className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">لم يتم بدء عملية الإرجاع</p>
                      {asset.status === 'in_use' && (
                        <Button
                          onClick={() => setShowReturnDialog(true)}
                          className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                        >
                          <RotateCcw className="w-4 h-4 ml-2" />
                          بدء الإرجاع
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
