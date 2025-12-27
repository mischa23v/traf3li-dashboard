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
  useAssetAssignment,
  useInitiateReturn,
  useCompleteReturn,
  useRecordMaintenance,
  useReportIncident,
  useUpdateAssetStatus,
  useAcknowledgeAssignment,
} from '@/hooks/useAssetAssignment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search, Bell, ArrowRight, AlertCircle, Loader2, Package,
  Calendar, User, Building2, Phone, Mail, MapPin, Laptop,
  Smartphone, Monitor, Car, Key, Wrench, RotateCcw, CheckCircle,
  AlertTriangle, Shield, FileText, Clock, Tag, Barcode, Hash,
  DollarSign, Settings, Camera, ClipboardCheck, History, Edit,
  Download, Printer, UserCheck
} from 'lucide-react'
import {
  ASSET_ASSIGNMENT_STATUS_LABELS,
  ASSET_TYPE_LABELS,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  WORK_TYPE_LABELS,
  OWNERSHIP_TYPE_LABELS,
  RETURN_REASON_LABELS,
  INCIDENT_TYPE_LABELS,
  type AssetAssignmentStatus,
  type AssetCondition,
  type ReturnReason,
  type IncidentType,
  type AssetType,
} from '@/services/assetAssignmentService'

export function AssetAssignmentDetailsView() {
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
  const { assignmentId } = useParams({ strict: false })
  const [activeTab, setActiveTab] = useState('overview')
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false)
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)
  const [showCompleteReturnDialog, setShowCompleteReturnDialog] = useState(false)

  // Return form state
  const [returnReason, setReturnReason] = useState<ReturnReason>('resignation')
  const [returnReasonDetails, setReturnReasonDetails] = useState('')
  const [returnDueDate, setReturnDueDate] = useState('')

  // Complete return form state
  const [actualReturnDate, setActualReturnDate] = useState('')
  const [returnedBy, setReturnedBy] = useState('')
  const [returnMethod, setReturnMethod] = useState<'hand_delivery' | 'courier' | 'mail' | 'pickup'>('hand_delivery')
  const [conditionAtReturn, setConditionAtReturn] = useState<AssetCondition>('good')
  const [hasDamage, setHasDamage] = useState(false)
  const [dataWiped, setDataWiped] = useState(false)
  const [returnNotes, setReturnNotes] = useState('')

  // Maintenance form state
  const [maintenanceType, setMaintenanceType] = useState<'preventive' | 'corrective' | 'inspection' | 'upgrade'>('preventive')
  const [maintenanceDate, setMaintenanceDate] = useState('')
  const [maintenanceDescription, setMaintenanceDescription] = useState('')
  const [maintenanceCost, setMaintenanceCost] = useState<number>(0)
  const [nextServiceDue, setNextServiceDue] = useState('')

  // Incident form state
  const [incidentType, setIncidentType] = useState<IncidentType>('damage')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [incidentSeverity, setIncidentSeverity] = useState<'minor' | 'moderate' | 'major' | 'critical'>('minor')

  const { data: assignment, isLoading, error } = useAssetAssignment(assignmentId || '')
  const initiateReturnMutation = useInitiateReturn()
  const completeReturnMutation = useCompleteReturn()
  const recordMaintenanceMutation = useRecordMaintenance()
  const reportIncidentMutation = useReportIncident()
  const updateStatusMutation = useUpdateAssetStatus()
  const acknowledgeMutation = useAcknowledgeAssignment()

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
      laptop: <Laptop className="w-5 h-5" />,
      desktop: <Monitor className="w-5 h-5" />,
      mobile_phone: <Smartphone className="w-5 h-5" />,
      tablet: <Smartphone className="w-5 h-5" />,
      monitor: <Monitor className="w-5 h-5" />,
      vehicle: <Car className="w-5 h-5" />,
      access_card: <Key className="w-5 h-5" />,
      keys: <Key className="w-5 h-5" />,
      tools: <Wrench className="w-5 h-5" />,
    }
    return icons[type] || <Package className="w-5 h-5" />
  }

  const handleInitiateReturn = async () => {
    if (!assignmentId) return
    await initiateReturnMutation.mutateAsync({
      assignmentId,
      data: {
        returnReason,
        returnReasonDetails,
        returnDueDate,
      },
    })
    setShowReturnDialog(false)
  }

  const handleCompleteReturn = async () => {
    if (!assignmentId) return
    await completeReturnMutation.mutateAsync({
      assignmentId,
      data: {
        actualReturnDate,
        returnedBy,
        returnMethod,
        receivedBy: 'current_user',
        conditionAtReturn,
        hasDamage,
        dataWiped,
        notes: returnNotes,
      },
    })
    setShowCompleteReturnDialog(false)
  }

  const handleRecordMaintenance = async () => {
    if (!assignmentId) return
    await recordMaintenanceMutation.mutateAsync({
      assignmentId,
      data: {
        maintenanceType,
        maintenanceDate,
        performedBy: 'internal',
        description: maintenanceDescription,
        totalCost: maintenanceCost,
        nextServiceDue: nextServiceDue || undefined,
      },
    })
    setShowMaintenanceDialog(false)
  }

  const handleReportIncident = async () => {
    if (!assignmentId) return
    await reportIncidentMutation.mutateAsync({
      assignmentId,
      data: {
        incidentType,
        incidentDate,
        incidentDescription,
        severity: incidentSeverity,
      },
    })
    setShowIncidentDialog(false)
  }

  const handleAcknowledge = async () => {
    if (!assignmentId) return
    await acknowledgeMutation.mutateAsync({
      assignmentId,
      data: {
        acknowledgmentMethod: 'system_acceptance',
      },
    })
  }

  const handleMarkInUse = async () => {
    if (!assignmentId) return
    await updateStatusMutation.mutateAsync({
      assignmentId,
      data: { status: 'in_use' },
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الأصول والمعدات', href: ROUTES.dashboard.hr.assetAssignment.list, isActive: false },
    { title: 'تفاصيل التخصيص', href: '#', isActive: true },
  ]

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className='ms-auto flex items-center gap-4'>
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
          <ProductivityHero badge="الموارد البشرية" title="تفاصيل التخصيص" type="employees" listMode={true} />
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
              <p className="mt-4 text-slate-500">جاري تحميل البيانات...</p>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  // Error state
  if (error || !assignment) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className='ms-auto flex items-center gap-4'>
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
          <ProductivityHero badge="الموارد البشرية" title="تفاصيل التخصيص" type="employees" listMode={true} />
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
              <p className="mt-4 text-red-600">لم يتم العثور على التخصيص</p>
              <Button onClick={() => navigate({ to: ROUTES.dashboard.hr.assetAssignment.list })} className="mt-4 rounded-xl">
                العودة للقائمة
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
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
          title="تفاصيل تخصيص الأصل"
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
                  onClick={() => navigate({ to: ROUTES.dashboard.hr.assetAssignment.list })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    {getTypeIcon(assignment.assetType)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-navy">
                      {assignment.assetNameAr || assignment.assetName}
                    </h1>
                    <p className="text-slate-500">{assignment.assignmentNumber}</p>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(assignment.status)}>
                {ASSET_ASSIGNMENT_STATUS_LABELS[assignment.status]?.ar}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {assignment.status === 'assigned' && !assignment.acknowledgment?.acknowledged && (
                <Button
                  onClick={handleAcknowledge}
                  disabled={acknowledgeMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  <UserCheck className="w-4 h-4 ms-2" />
                  تأكيد الاستلام
                </Button>
              )}
              {assignment.status === 'assigned' && assignment.acknowledgment?.acknowledged && (
                <Button
                  onClick={handleMarkInUse}
                  disabled={updateStatusMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 ms-2" />
                  قيد الاستخدام
                </Button>
              )}
              {(assignment.status === 'in_use' || assignment.status === 'assigned') && !assignment.returnProcess?.returnInitiated && (
                <Button
                  variant="outline"
                  onClick={() => setShowReturnDialog(true)}
                  className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <RotateCcw className="w-4 h-4 ms-2" />
                  بدء إجراء الإرجاع
                </Button>
              )}
              {assignment.returnProcess?.returnInitiated && !assignment.returnProcess?.returnCompleted && (
                <Button
                  onClick={() => setShowCompleteReturnDialog(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 ms-2" />
                  إتمام الإرجاع
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowMaintenanceDialog(true)}
                className="rounded-xl"
              >
                <Wrench className="w-4 h-4 ms-2" />
                تسجيل صيانة
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowIncidentDialog(true)}
                className="rounded-xl border-red-300 text-red-700 hover:bg-red-50"
              >
                <AlertTriangle className="w-4 h-4 ms-2" aria-hidden="true" />
                الإبلاغ عن حادث
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: `/dashboard/hr/asset-assignment/new?editId=${assignment._id}` })}
                className="rounded-xl"
              >
                <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                تعديل
              </Button>
            </div>

            {/* Return Warning */}
            {assignment.returnProcess?.returnInitiated && !assignment.returnProcess?.returnCompleted && (
              <Card className="rounded-2xl border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <RotateCcw className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">إجراء الإرجاع قيد التنفيذ</p>
                      <p className="text-sm text-amber-600">
                        السبب: {RETURN_REASON_LABELS[assignment.returnProcess.returnReason as ReturnReason]?.ar} -
                        موعد الإرجاع: {assignment.returnProcess.returnDueDate ? new Date(assignment.returnProcess.returnDueDate).toLocaleDateString('ar-SA') : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="overview"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 px-6 py-3"
                    >
                      نظرة عامة
                    </TabsTrigger>
                    <TabsTrigger
                      value="asset"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 px-6 py-3"
                    >
                      تفاصيل الأصل
                    </TabsTrigger>
                    <TabsTrigger
                      value="maintenance"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 px-6 py-3"
                    >
                      الصيانة
                    </TabsTrigger>
                    <TabsTrigger
                      value="incidents"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 px-6 py-3"
                    >
                      الحوادث
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 px-6 py-3"
                    >
                      المستندات
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="p-6 space-y-6">
                    {/* Employee Info */}
                    <div>
                      <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                        معلومات الموظف
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">اسم الموظف</p>
                          <p className="font-medium">{assignment.employeeNameAr || assignment.employeeName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">رقم الموظف</p>
                          <p className="font-medium">{assignment.employeeNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">القسم</p>
                          <p className="font-medium">{assignment.department || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">المسمى الوظيفي</p>
                          <p className="font-medium">{assignment.jobTitle || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                          <p className="font-medium">{assignment.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الهاتف</p>
                          <p className="font-medium">{assignment.phone || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Assignment Info */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                        تفاصيل التخصيص
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">نوع التخصيص</p>
                          <Badge className="mt-1">
                            {ASSIGNMENT_TYPE_LABELS[assignment.assignmentType]?.ar}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">تاريخ التخصيص</p>
                          <p className="font-medium">{new Date(assignment.assignedDate).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">تاريخ الإرجاع المتوقع</p>
                          <p className="font-medium">
                            {assignment.indefiniteAssignment ? 'غير محدد' : assignment.expectedReturnDate ? new Date(assignment.expectedReturnDate).toLocaleDateString('ar-SA') : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الغرض</p>
                          <p className="font-medium">{assignment.assignmentPurpose || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">نوع العمل</p>
                          <Badge className="mt-1">
                            {assignment.workType ? WORK_TYPE_LABELS[assignment.workType]?.ar : '-'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الاستلام</p>
                          <Badge className={assignment.acknowledgment?.acknowledged ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {assignment.acknowledgment?.acknowledged ? 'تم التأكيد' : 'لم يتم التأكيد'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Asset Summary */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-emerald-500" />
                        ملخص الأصل
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">اسم الأصل</p>
                          <p className="font-medium">{assignment.assetNameAr || assignment.assetName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">رقم الأصل</p>
                          <p className="font-medium">{assignment.assetTag}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">النوع</p>
                          <Badge className="mt-1">{ASSET_TYPE_LABELS[assignment.assetType]?.ar}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الفئة</p>
                          <Badge className="mt-1">{ASSET_CATEGORY_LABELS[assignment.assetCategory]?.ar}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الحالة عند التخصيص</p>
                          <Badge className={`mt-1 ${getColorClasses(ASSET_CONDITION_LABELS[assignment.conditionAtAssignment]?.color)}`}>
                            {ASSET_CONDITION_LABELS[assignment.conditionAtAssignment]?.ar}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الملكية</p>
                          <Badge className="mt-1">{OWNERSHIP_TYPE_LABELS[assignment.ownership]?.ar}</Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Asset Tab */}
                  <TabsContent value="asset" className="p-6 space-y-6">
                    {/* Asset Identification */}
                    <div>
                      <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-emerald-500" />
                        تعريف الأصل
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">رقم الأصل (Tag)</p>
                          <p className="font-medium">{assignment.assetTag}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الرقم التسلسلي</p>
                          <p className="font-medium">{assignment.serialNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">رقم الموديل</p>
                          <p className="font-medium">{assignment.modelNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">العلامة التجارية</p>
                          <p className="font-medium">{assignment.brand || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الموديل</p>
                          <p className="font-medium">{assignment.model || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Specifications */}
                    {assignment.specifications && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          المواصفات
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {assignment.specifications.processor && (
                            <div>
                              <p className="text-xs text-slate-500">المعالج</p>
                              <p className="font-medium">{assignment.specifications.processor}</p>
                            </div>
                          )}
                          {assignment.specifications.ram && (
                            <div>
                              <p className="text-xs text-slate-500">الذاكرة</p>
                              <p className="font-medium">{assignment.specifications.ram}</p>
                            </div>
                          )}
                          {assignment.specifications.storage && (
                            <div>
                              <p className="text-xs text-slate-500">التخزين</p>
                              <p className="font-medium">{assignment.specifications.storage}</p>
                            </div>
                          )}
                          {assignment.specifications.screenSize && (
                            <div>
                              <p className="text-xs text-slate-500">حجم الشاشة</p>
                              <p className="font-medium">{assignment.specifications.screenSize}</p>
                            </div>
                          )}
                          {assignment.specifications.operatingSystem && (
                            <div>
                              <p className="text-xs text-slate-500">نظام التشغيل</p>
                              <p className="font-medium">{assignment.specifications.operatingSystem}</p>
                            </div>
                          )}
                          {assignment.specifications.imei && (
                            <div>
                              <p className="text-xs text-slate-500">IMEI</p>
                              <p className="font-medium">{assignment.specifications.imei}</p>
                            </div>
                          )}
                          {assignment.specifications.phoneNumber && (
                            <div>
                              <p className="text-xs text-slate-500">رقم الهاتف</p>
                              <p className="font-medium">{assignment.specifications.phoneNumber}</p>
                            </div>
                          )}
                          {assignment.specifications.color && (
                            <div>
                              <p className="text-xs text-slate-500">اللون</p>
                              <p className="font-medium">{assignment.specifications.color}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Value & Warranty */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        القيمة والضمان
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {assignment.purchasePrice && (
                          <div>
                            <p className="text-xs text-slate-500">سعر الشراء</p>
                            <p className="font-medium">{assignment.purchasePrice.toLocaleString('ar-SA')} {assignment.currency || 'ر.س'}</p>
                          </div>
                        )}
                        {assignment.currentValue && (
                          <div>
                            <p className="text-xs text-slate-500">القيمة الحالية</p>
                            <p className="font-medium">{assignment.currentValue.toLocaleString('ar-SA')} {assignment.currency || 'ر.س'}</p>
                          </div>
                        )}
                        {assignment.warranty && (
                          <>
                            <div>
                              <p className="text-xs text-slate-500">حالة الضمان</p>
                              <Badge className={assignment.warranty.expired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
                                {assignment.warranty.expired ? 'منتهي' : 'ساري'}
                              </Badge>
                            </div>
                            {assignment.warranty.warrantyEndDate && (
                              <div>
                                <p className="text-xs text-slate-500">انتهاء الضمان</p>
                                <p className="font-medium">{new Date(assignment.warranty.warrantyEndDate).toLocaleDateString('ar-SA')}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Maintenance Tab */}
                  <TabsContent value="maintenance" className="p-6 space-y-6">
                    {assignment.maintenanceHistory && assignment.maintenanceHistory.length > 0 ? (
                      <div className="space-y-4">
                        {assignment.maintenanceHistory.map((record, index) => (
                          <Card key={index} className="rounded-xl border-slate-100">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <Wrench className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-navy">{record.description}</p>
                                    <p className="text-sm text-slate-500">{record.maintenanceType}</p>
                                  </div>
                                </div>
                                <div className="text-start">
                                  <p className="text-sm font-medium">{new Date(record.maintenanceDate).toLocaleDateString('ar-SA')}</p>
                                  {record.totalCost && (
                                    <p className="text-xs text-slate-500">{record.totalCost.toLocaleString('ar-SA')} ر.س</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Wrench className="w-12 h-12 mx-auto text-slate-300" />
                        <p className="mt-4 text-slate-500">لا توجد سجلات صيانة</p>
                        <Button
                          variant="outline"
                          className="mt-4 rounded-xl"
                          onClick={() => setShowMaintenanceDialog(true)}
                        >
                          تسجيل صيانة
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Incidents Tab */}
                  <TabsContent value="incidents" className="p-6 space-y-6">
                    {assignment.incidents && assignment.incidents.length > 0 ? (
                      <div className="space-y-4">
                        {assignment.incidents.map((incident, index) => (
                          <Card key={index} className="rounded-xl border-slate-100">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${getColorClasses(INCIDENT_TYPE_LABELS[incident.incidentType]?.color)}`}>
                                    <AlertTriangle className={`w-4 h-4 ${getTextColorClass(INCIDENT_TYPE_LABELS[incident.incidentType]?.color)}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-navy">{incident.incidentDescription}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={getColorClasses(INCIDENT_TYPE_LABELS[incident.incidentType]?.color)}>
                                        {INCIDENT_TYPE_LABELS[incident.incidentType]?.ar}
                                      </Badge>
                                      <Badge className={incident.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                        {incident.resolved ? 'تم الحل' : 'قيد المعالجة'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500">{new Date(incident.incidentDate).toLocaleDateString('ar-SA')}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                        <p className="mt-4 text-slate-500">لا توجد حوادث مسجلة</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="p-6 space-y-6">
                    {assignment.documents && assignment.documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assignment.documents.map((doc, index) => (
                          <Card key={index} className="rounded-xl border-slate-100">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-navy">{doc.documentNameAr || doc.documentName}</p>
                                    <p className="text-xs text-slate-500">{doc.documentType}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                  <Download className="w-4 h-4" aria-hidden="true" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                        <p className="mt-4 text-slate-500">لا توجد مستندات</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <HRSidebar context="employees" />
        </div>
      </Main>

      {/* Initiate Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              بدء إجراء الإرجاع
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل إرجاع الأصل
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>سبب الإرجاع</Label>
              <Select value={returnReason} onValueChange={(v) => setReturnReason(v as ReturnReason)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RETURN_REASON_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تفاصيل إضافية</Label>
              <Textarea
                value={returnReasonDetails}
                onChange={(e) => setReturnReasonDetails(e.target.value)}
                placeholder="تفاصيل إضافية عن سبب الإرجاع..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>موعد الإرجاع المطلوب</Label>
              <Input
                type="date"
                value={returnDueDate}
                onChange={(e) => setReturnDueDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleInitiateReturn}
              disabled={!returnDueDate || initiateReturnMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
            >
              {initiateReturnMutation.isPending ? 'جاري الحفظ...' : 'بدء الإرجاع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Return Dialog */}
      <Dialog open={showCompleteReturnDialog} onOpenChange={setShowCompleteReturnDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              إتمام الإرجاع
            </DialogTitle>
            <DialogDescription>
              أكمل بيانات استلام الأصل المُرجع
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الإرجاع الفعلي</Label>
                <Input
                  type="date"
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
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
                    <SelectItem value="courier">شحن</SelectItem>
                    <SelectItem value="mail">بريد</SelectItem>
                    <SelectItem value="pickup">استلام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>اسم المُسلّم</Label>
              <Input
                value={returnedBy}
                onChange={(e) => setReturnedBy(e.target.value)}
                placeholder="اسم الشخص الذي سلّم الأصل"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>حالة الأصل عند الإرجاع</Label>
              <Select value={conditionAtReturn} onValueChange={(v) => setConditionAtReturn(v as AssetCondition)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_CONDITION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasDamage}
                  onChange={(e) => setHasDamage(e.target.checked)}
                  className="rounded"
                />
                <Label>يوجد تلف</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dataWiped}
                  onChange={(e) => setDataWiped(e.target.checked)}
                  className="rounded"
                />
                <Label>تم مسح البيانات</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="ملاحظات إضافية..."
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteReturnDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleCompleteReturn}
              disabled={!actualReturnDate || !returnedBy || completeReturnMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              {completeReturnMutation.isPending ? 'جاري الحفظ...' : 'إتمام الإرجاع'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-500" />
              تسجيل صيانة
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل عملية الصيانة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Label>وصف الصيانة</Label>
              <Textarea
                value={maintenanceDescription}
                onChange={(e) => setMaintenanceDescription(e.target.value)}
                placeholder="وصف العمل المنجز..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>التكلفة الإجمالية (ر.س)</Label>
              <Input
                type="number"
                value={maintenanceCost || ''}
                onChange={(e) => setMaintenanceCost(Number(e.target.value))}
                placeholder="0"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>موعد الصيانة القادمة (اختياري)</Label>
              <Input
                type="date"
                value={nextServiceDue}
                onChange={(e) => setNextServiceDue(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleRecordMaintenance}
              disabled={!maintenanceDate || !maintenanceDescription || recordMaintenanceMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
            >
              {recordMaintenanceMutation.isPending ? 'جاري الحفظ...' : 'تسجيل'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Incident Dialog */}
      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
              الإبلاغ عن حادث
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الحادث أو المشكلة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Label>الخطورة</Label>
              <Select value={incidentSeverity} onValueChange={(v) => setIncidentSeverity(v as typeof incidentSeverity)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">بسيطة</SelectItem>
                  <SelectItem value="moderate">متوسطة</SelectItem>
                  <SelectItem value="major">كبيرة</SelectItem>
                  <SelectItem value="critical">حرجة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>وصف الحادث</Label>
              <Textarea
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="وصف تفصيلي للحادث..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIncidentDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button
              onClick={handleReportIncident}
              disabled={!incidentDate || !incidentDescription || reportIncidentMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {reportIncidentMutation.isPending ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
