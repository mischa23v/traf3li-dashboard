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
  useGrievance,
  useDeleteGrievance,
  useStartInvestigation,
  useResolveGrievance,
  useEscalateGrievance,
  useWithdrawGrievance,
  useCloseGrievance,
} from '@/hooks/useGrievances'
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
  CheckCircle, XCircle, AlertCircle, Loader2,
  Shield, FileWarning, Scale, Building2, Users,
  Trash2, Edit, MoreHorizontal, Play, ArrowUpRight,
  FileText, Clock, Eye, UserX, Gavel, MessageSquare
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GRIEVANCE_TYPE_LABELS,
  GRIEVANCE_STATUS_LABELS,
  GRIEVANCE_PRIORITY_LABELS,
  GRIEVANCE_SEVERITY_LABELS,
  GRIEVANCE_CATEGORY_LABELS,
  RESOLUTION_METHOD_LABELS,
  OUTCOME_TYPE_LABELS,
  type GrievanceStatus,
  type ResolutionMethod,
  type OutcomeType,
} from '@/services/grievancesService'

export function GrievancesDetailsView() {
  const navigate = useNavigate()
  const { grievanceId } = useParams({ strict: false })

  const { data: grievance, isLoading, error } = useGrievance(grievanceId || '')
  const deleteMutation = useDeleteGrievance()
  const startInvestigationMutation = useStartInvestigation()
  const resolveMutation = useResolveGrievance()
  const escalateMutation = useEscalateGrievance()
  const withdrawMutation = useWithdrawGrievance()
  const closeMutation = useCloseGrievance()

  // Dialog states
  const [showInvestigationDialog, setShowInvestigationDialog] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [showEscalateDialog, setShowEscalateDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)

  // Form states
  const [investigatorName, setInvestigatorName] = useState('')
  const [investigatorType, setInvestigatorType] = useState('internal_hr')
  const [resolutionMethod, setResolutionMethod] = useState<ResolutionMethod>('management_decision')
  const [outcome, setOutcome] = useState<OutcomeType>('grievance_upheld')
  const [decisionSummary, setDecisionSummary] = useState('')
  const [escalateReason, setEscalateReason] = useState('')
  const [escalateTo, setEscalateTo] = useState('')
  const [withdrawReason, setWithdrawReason] = useState('')

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الشكاوى', href: '/dashboard/hr/grievances', isActive: true },
  ]

  const getStatusColor = (status: GrievanceStatus) => {
    const colors: Record<GrievanceStatus, string> = {
      submitted: 'bg-slate-100 text-slate-700 border-slate-200',
      under_review: 'bg-blue-100 text-blue-700 border-blue-200',
      investigating: 'bg-amber-100 text-amber-700 border-amber-200',
      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      escalated: 'bg-red-100 text-red-700 border-red-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
      withdrawn: 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return colors[status]
  }

  const handleStartInvestigation = async () => {
    if (!grievanceId || !investigatorName) return
    await startInvestigationMutation.mutateAsync({
      grievanceId,
      data: { investigatorName, investigatorType },
    })
    setShowInvestigationDialog(false)
    setInvestigatorName('')
    setInvestigatorType('internal_hr')
  }

  const handleResolve = async () => {
    if (!grievanceId || !decisionSummary) return
    await resolveMutation.mutateAsync({
      grievanceId,
      data: { resolutionMethod, outcome, decisionSummary },
    })
    setShowResolveDialog(false)
    setDecisionSummary('')
  }

  const handleEscalate = async () => {
    if (!grievanceId || !escalateReason) return
    await escalateMutation.mutateAsync({
      grievanceId,
      data: { reason: escalateReason, escalateTo: escalateTo || undefined },
    })
    setShowEscalateDialog(false)
    setEscalateReason('')
    setEscalateTo('')
  }

  const handleWithdraw = async () => {
    if (!grievanceId || !withdrawReason) return
    await withdrawMutation.mutateAsync({
      grievanceId,
      data: { reason: withdrawReason },
    })
    setShowWithdrawDialog(false)
    setWithdrawReason('')
  }

  const handleClose = async () => {
    if (!grievanceId) return
    await closeMutation.mutateAsync({ grievanceId })
  }

  const handleDelete = async () => {
    if (!grievanceId) return
    if (confirm('هل أنت متأكد من حذف هذه الشكوى؟')) {
      await deleteMutation.mutateAsync(grievanceId)
      navigate({ to: '/dashboard/hr/grievances' })
    }
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
          title="تفاصيل الشكوى"
          type="employees"
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
            ) : error || !grievance ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                  <p className="text-red-600">حدث خطأ في تحميل بيانات الشكوى</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/grievances' })}
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
                      onClick={() => navigate({ to: '/dashboard/hr/grievances' })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-navy">
                          {grievance.grievanceSubjectAr || grievance.grievanceSubject}
                        </h1>
                        <Badge className={getStatusColor(grievance.status)}>
                          {GRIEVANCE_STATUS_LABELS[grievance.status]?.ar}
                        </Badge>
                      </div>
                      <p className="text-slate-500">
                        {grievance.grievanceNumber} - {grievance.employeeNameAr || grievance.employeeName}
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
                        <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/grievances/new?editId=${grievance._id}` })}>
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

                {/* Action Buttons based on Status */}
                <Card className="rounded-2xl border-slate-100">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {(grievance.status === 'submitted' || grievance.status === 'under_review') && (
                        <Dialog open={showInvestigationDialog} onOpenChange={setShowInvestigationDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                              <Play className="w-4 h-4 ml-2" />
                              بدء التحقيق
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>بدء التحقيق في الشكوى</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>اسم المحقق <span className="text-red-500">*</span></Label>
                                <Input
                                  value={investigatorName}
                                  onChange={(e) => setInvestigatorName(e.target.value)}
                                  placeholder="اسم المحقق"
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>نوع المحقق</Label>
                                <Select value={investigatorType} onValueChange={setInvestigatorType}>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="internal_hr">موارد بشرية داخلية</SelectItem>
                                    <SelectItem value="internal_legal">قانوني داخلي</SelectItem>
                                    <SelectItem value="external_investigator">محقق خارجي</SelectItem>
                                    <SelectItem value="committee">لجنة تحقيق</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowInvestigationDialog(false)} className="rounded-xl">
                                  إلغاء
                                </Button>
                                <Button
                                  onClick={handleStartInvestigation}
                                  disabled={!investigatorName || startInvestigationMutation.isPending}
                                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                                >
                                  {startInvestigationMutation.isPending ? 'جاري البدء...' : 'بدء التحقيق'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {grievance.status === 'investigating' && (
                        <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                              <CheckCircle className="w-4 h-4 ml-2" />
                              حل الشكوى
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>حل الشكوى</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>طريقة الحل</Label>
                                  <Select value={resolutionMethod} onValueChange={(v) => setResolutionMethod(v as ResolutionMethod)}>
                                    <SelectTrigger className="rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(RESOLUTION_METHOD_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>النتيجة</Label>
                                  <Select value={outcome} onValueChange={(v) => setOutcome(v as OutcomeType)}>
                                    <SelectTrigger className="rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(OUTCOME_TYPE_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>ملخص القرار <span className="text-red-500">*</span></Label>
                                <Textarea
                                  value={decisionSummary}
                                  onChange={(e) => setDecisionSummary(e.target.value)}
                                  placeholder="ملخص القرار والإجراءات المتخذة..."
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowResolveDialog(false)} className="rounded-xl">
                                  إلغاء
                                </Button>
                                <Button
                                  onClick={handleResolve}
                                  disabled={!decisionSummary || resolveMutation.isPending}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                >
                                  {resolveMutation.isPending ? 'جاري الحفظ...' : 'حل الشكوى'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {(grievance.status === 'submitted' || grievance.status === 'under_review' || grievance.status === 'investigating') && (
                        <>
                          <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                                <ArrowUpRight className="w-4 h-4 ml-2" />
                                تصعيد
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تصعيد الشكوى</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>سبب التصعيد <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    value={escalateReason}
                                    onChange={(e) => setEscalateReason(e.target.value)}
                                    placeholder="يرجى توضيح سبب التصعيد..."
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>تصعيد إلى</Label>
                                  <Input
                                    value={escalateTo}
                                    onChange={(e) => setEscalateTo(e.target.value)}
                                    placeholder="الجهة أو الشخص"
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowEscalateDialog(false)} className="rounded-xl">
                                    إلغاء
                                  </Button>
                                  <Button
                                    onClick={handleEscalate}
                                    disabled={!escalateReason || escalateMutation.isPending}
                                    variant="destructive"
                                    className="rounded-xl"
                                  >
                                    {escalateMutation.isPending ? 'جاري التصعيد...' : 'تصعيد'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="rounded-xl">
                                <XCircle className="w-4 h-4 ml-2" />
                                سحب الشكوى
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>سحب الشكوى</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>سبب السحب <span className="text-red-500">*</span></Label>
                                  <Textarea
                                    value={withdrawReason}
                                    onChange={(e) => setWithdrawReason(e.target.value)}
                                    placeholder="يرجى توضيح سبب سحب الشكوى..."
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowWithdrawDialog(false)} className="rounded-xl">
                                    إلغاء
                                  </Button>
                                  <Button
                                    onClick={handleWithdraw}
                                    disabled={!withdrawReason || withdrawMutation.isPending}
                                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                                  >
                                    {withdrawMutation.isPending ? 'جاري السحب...' : 'سحب الشكوى'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {grievance.status === 'resolved' && (
                        <Button
                          onClick={handleClose}
                          disabled={closeMutation.isPending}
                          className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl"
                        >
                          {closeMutation.isPending ? 'جاري الإغلاق...' : 'إغلاق الشكوى'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                    <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="details" className="rounded-lg">التفاصيل</TabsTrigger>
                    <TabsTrigger value="investigation" className="rounded-lg">التحقيق</TabsTrigger>
                    <TabsTrigger value="resolution" className="rounded-lg">الحل</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* Grievance Info */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <FileWarning className="w-5 h-5 text-emerald-500" />
                          معلومات الشكوى
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">نوع الشكوى</p>
                            <Badge className="bg-blue-100 text-blue-700">
                              {GRIEVANCE_TYPE_LABELS[grievance.grievanceType]?.ar}
                            </Badge>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">التصنيف</p>
                            <Badge className={`bg-${GRIEVANCE_CATEGORY_LABELS[grievance.grievanceCategory || 'individual']?.color}-100 text-${GRIEVANCE_CATEGORY_LABELS[grievance.grievanceCategory || 'individual']?.color}-700`}>
                              {GRIEVANCE_CATEGORY_LABELS[grievance.grievanceCategory || 'individual']?.ar}
                            </Badge>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الأولوية</p>
                            <Badge className={`bg-${GRIEVANCE_PRIORITY_LABELS[grievance.priority]?.color}-100 text-${GRIEVANCE_PRIORITY_LABELS[grievance.priority]?.color}-700`}>
                              {GRIEVANCE_PRIORITY_LABELS[grievance.priority]?.ar}
                            </Badge>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الخطورة</p>
                            <Badge className={`bg-${GRIEVANCE_SEVERITY_LABELS[grievance.severity || 'moderate']?.color}-100 text-${GRIEVANCE_SEVERITY_LABELS[grievance.severity || 'moderate']?.color}-700`}>
                              {GRIEVANCE_SEVERITY_LABELS[grievance.severity || 'moderate']?.ar}
                            </Badge>
                          </div>
                        </div>

                        {grievance.grievanceDescription && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">الوصف</p>
                            <p className="text-slate-700">{grievance.grievanceDescriptionAr || grievance.grievanceDescription}</p>
                          </div>
                        )}

                        {/* Confidentiality badges */}
                        <div className="flex flex-wrap gap-2">
                          {grievance.confidential && (
                            <Badge className="bg-amber-100 text-amber-700">
                              <Shield className="w-3 h-3 ml-1" />
                              سرية
                            </Badge>
                          )}
                          {grievance.anonymousComplaint && (
                            <Badge className="bg-purple-100 text-purple-700">
                              <Eye className="w-3 h-3 ml-1" />
                              مجهولة الهوية
                            </Badge>
                          )}
                          {grievance.protectedDisclosure && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Shield className="w-3 h-3 ml-1" />
                              حماية المبلغين
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Employee Info */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <User className="w-5 h-5 text-emerald-500" />
                          مقدم الشكوى
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">اسم الموظف</p>
                            <p className="font-medium text-navy">{grievance.employeeNameAr || grievance.employeeName}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">رقم الموظف</p>
                            <p className="font-medium text-navy">{grievance.employeeNumber}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">القسم</p>
                            <p className="font-medium text-navy">{grievance.department || '-'}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">المسمى الوظيفي</p>
                            <p className="font-medium text-navy">{grievance.jobTitle || '-'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" />
                          التواريخ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">تاريخ التقديم</p>
                            <p className="font-medium text-navy">{new Date(grievance.filedDate).toLocaleDateString('ar-SA')}</p>
                          </div>
                          {grievance.incidentDate && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تاريخ الحادثة</p>
                              <p className="font-medium text-navy">{new Date(grievance.incidentDate).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</p>
                            <p className="font-medium text-navy">{new Date(grievance.createdOn).toLocaleDateString('ar-SA')}</p>
                          </div>
                          {grievance.updatedOn && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">آخر تحديث</p>
                              <p className="font-medium text-navy">{new Date(grievance.updatedOn).toLocaleDateString('ar-SA')}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-6">
                    {/* Respondent */}
                    {grievance.respondent && (
                      <Card className="rounded-2xl border-red-200 bg-red-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-red-800 flex items-center gap-2">
                            <UserX className="w-5 h-5 text-red-600" />
                            الشكوى ضد (شخص)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-red-600 mb-1">الاسم</p>
                              <p className="font-medium text-red-700">{grievance.respondent.employeeNameAr || grievance.respondent.employeeName}</p>
                            </div>
                            {grievance.respondent.jobTitle && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-red-600 mb-1">المسمى الوظيفي</p>
                                <p className="font-medium text-red-700">{grievance.respondent.jobTitle}</p>
                              </div>
                            )}
                            {grievance.respondent.department && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-red-600 mb-1">القسم</p>
                                <p className="font-medium text-red-700">{grievance.respondent.department}</p>
                              </div>
                            )}
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-red-600 mb-1">العلاقة</p>
                              <p className="font-medium text-red-700">
                                {grievance.respondent.relationshipToComplainant === 'manager' ? 'مدير' :
                                  grievance.respondent.relationshipToComplainant === 'supervisor' ? 'مشرف' :
                                    grievance.respondent.relationshipToComplainant === 'colleague' ? 'زميل' :
                                      grievance.respondent.relationshipToComplainant === 'subordinate' ? 'مرؤوس' :
                                        grievance.respondent.relationshipToComplainant === 'hr' ? 'الموارد البشرية' :
                                          grievance.respondent.relationshipToComplainant === 'senior_management' ? 'الإدارة العليا' : 'آخر'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Against Department/Policy */}
                    {(grievance.againstDepartment || grievance.againstPolicy) && (
                      <Card className="rounded-2xl border-amber-200 bg-amber-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-amber-600" />
                            الشكوى ضد (قسم/سياسة)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {grievance.againstDepartment && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-amber-600 mb-1">القسم/الإدارة</p>
                                <p className="font-medium text-amber-700">{grievance.againstDepartment}</p>
                              </div>
                            )}
                            {grievance.againstPolicy && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-amber-600 mb-1">السياسة/الإجراء</p>
                                <p className="font-medium text-amber-700">{grievance.againstPolicy}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Desired Outcome */}
                    {grievance.desiredOutcome && (
                      <Card className="rounded-2xl border-blue-200 bg-blue-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-600" />
                            النتيجة المرجوة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 bg-white rounded-xl">
                            <p className="text-blue-700">{grievance.desiredOutcomeAr || grievance.desiredOutcome}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Notes */}
                    {grievance.notes && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-emerald-500" />
                            الملاحظات
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {grievance.notes.complainantNotes && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-2">ملاحظات مقدم الشكوى</p>
                              <p className="text-slate-700">{grievance.notes.complainantNotes}</p>
                            </div>
                          )}
                          {grievance.notes.hrNotes && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-2">ملاحظات الموارد البشرية</p>
                              <p className="text-slate-700">{grievance.notes.hrNotes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Investigation Tab */}
                  <TabsContent value="investigation" className="space-y-6">
                    {grievance.investigation ? (
                      <Card className="rounded-2xl border-amber-200 bg-amber-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-amber-600" />
                            تفاصيل التحقيق
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-amber-600 mb-1">المحقق</p>
                              <p className="font-medium text-amber-700">{grievance.investigation.investigatorName || '-'}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-amber-600 mb-1">نوع المحقق</p>
                              <p className="font-medium text-amber-700">
                                {grievance.investigation.investigatorType === 'internal_hr' ? 'موارد بشرية داخلية' :
                                  grievance.investigation.investigatorType === 'internal_legal' ? 'قانوني داخلي' :
                                    grievance.investigation.investigatorType === 'external_investigator' ? 'محقق خارجي' :
                                      grievance.investigation.investigatorType === 'committee' ? 'لجنة تحقيق' : '-'}
                              </p>
                            </div>
                            {grievance.investigation.investigationStartDate && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-amber-600 mb-1">تاريخ البدء</p>
                                <p className="font-medium text-amber-700">{new Date(grievance.investigation.investigationStartDate).toLocaleDateString('ar-SA')}</p>
                              </div>
                            )}
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-amber-600 mb-1">الحالة</p>
                              <Badge className={grievance.investigation.investigationCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {grievance.investigation.investigationCompleted ? 'مكتمل' : 'جاري'}
                              </Badge>
                            </div>
                          </div>

                          {grievance.investigation.findingsNarrative && (
                            <div className="mt-4 p-4 bg-white rounded-xl">
                              <p className="text-xs text-amber-600 mb-2">نتائج التحقيق</p>
                              <p className="text-amber-700">{grievance.investigation.findingsNarrativeAr || grievance.investigation.findingsNarrative}</p>
                              {grievance.investigation.substantiated !== undefined && (
                                <Badge className={`mt-2 ${grievance.investigation.substantiated ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {grievance.investigation.substantiated ? 'مثبتة' : 'غير مثبتة'}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="rounded-2xl border-slate-100">
                        <CardContent className="p-8 text-center">
                          <Gavel className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-500">لم يتم بدء التحقيق بعد</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Resolution Tab */}
                  <TabsContent value="resolution" className="space-y-6">
                    {grievance.resolution?.resolved ? (
                      <Card className="rounded-2xl border-emerald-200 bg-emerald-50/50">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            تفاصيل الحل
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {grievance.resolution.resolutionDate && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">تاريخ الحل</p>
                                <p className="font-medium text-emerald-700">{new Date(grievance.resolution.resolutionDate).toLocaleDateString('ar-SA')}</p>
                              </div>
                            )}
                            {grievance.resolution.resolutionMethod && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">طريقة الحل</p>
                                <p className="font-medium text-emerald-700">{RESOLUTION_METHOD_LABELS[grievance.resolution.resolutionMethod]?.ar}</p>
                              </div>
                            )}
                            {grievance.resolution.outcome && (
                              <div className="p-4 bg-white rounded-xl">
                                <p className="text-xs text-emerald-600 mb-1">النتيجة</p>
                                <Badge className={`bg-${OUTCOME_TYPE_LABELS[grievance.resolution.outcome]?.color}-100 text-${OUTCOME_TYPE_LABELS[grievance.resolution.outcome]?.color}-700`}>
                                  {OUTCOME_TYPE_LABELS[grievance.resolution.outcome]?.ar}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {grievance.resolution.decisionSummary && (
                            <div className="mt-4 p-4 bg-white rounded-xl">
                              <p className="text-xs text-emerald-600 mb-2">ملخص القرار</p>
                              <p className="text-emerald-700">{grievance.resolution.decisionSummaryAr || grievance.resolution.decisionSummary}</p>
                            </div>
                          )}

                          {grievance.resolution.actionsTaken && grievance.resolution.actionsTaken.length > 0 && (
                            <div className="mt-4 p-4 bg-white rounded-xl">
                              <p className="text-xs text-emerald-600 mb-2">الإجراءات المتخذة</p>
                              <ul className="list-disc list-inside text-emerald-700">
                                {grievance.resolution.actionsTaken.map((action, index) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="rounded-2xl border-slate-100">
                        <CardContent className="p-8 text-center">
                          <Scale className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-500">لم يتم حل الشكوى بعد</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
