import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  useOffboarding,
  useDeleteOffboarding,
  useUpdateOffboardingStatus,
  useCompleteClearanceSection,
  useCalculateFinalSettlement,
  useApproveFinalSettlement,
  useIssueExperienceCertificate,
  useCompleteOffboarding,
} from '@/hooks/useOffboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Bell, ArrowRight, MoreHorizontal, Edit, Trash2,
  Calendar, Building2, User, Clock, CheckCircle, AlertCircle,
  FileText, DollarSign, ClipboardCheck, Briefcase, Monitor,
  Wallet, Users, UserCheck, Loader2, XCircle, PlayCircle,
  PauseCircle, Award, FileCheck
} from 'lucide-react'
import {
  EXIT_TYPE_LABELS,
  OFFBOARDING_STATUS_LABELS,
  CLEARANCE_STATUS_LABELS,
  REHIRE_ELIGIBILITY_LABELS,
  type OffboardingStatus,
} from '@/services/offboardingService'

export function OffboardingDetailsView() {
  const params = useParams({ strict: false }) as { offboardingId?: string }
  const offboardingId = params.offboardingId || ''
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: offboarding, isLoading, error } = useOffboarding(offboardingId)
  const deleteMutation = useDeleteOffboarding()
  const updateStatusMutation = useUpdateOffboardingStatus()
  const completeClearanceMutation = useCompleteClearanceSection()
  const calculateSettlementMutation = useCalculateFinalSettlement()
  const approveSettlementMutation = useApproveFinalSettlement()
  const issueCertificateMutation = useIssueExperienceCertificate()
  const completeOffboardingMutation = useCompleteOffboarding()

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteMutation.mutate(offboardingId, {
        onSuccess: () => navigate({ to: '/dashboard/hr/offboarding' }),
      })
    }
  }

  const handleStatusUpdate = (status: OffboardingStatus) => {
    updateStatusMutation.mutate({ offboardingId, status })
  }

  const getStatusColor = (status: OffboardingStatus) => {
    const colors: Record<OffboardingStatus, string> = {
      initiated: 'bg-slate-100 text-slate-700 border-slate-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      clearance_pending: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status]
  }

  const getExitTypeColor = (exitType: string) => {
    const colors: Record<string, string> = {
      resignation: 'bg-blue-50 text-blue-700',
      termination: 'bg-red-50 text-red-700',
      contract_end: 'bg-amber-50 text-amber-700',
      retirement: 'bg-emerald-50 text-emerald-700',
      death: 'bg-slate-50 text-slate-700',
      mutual_agreement: 'bg-purple-50 text-purple-700',
      medical: 'bg-orange-50 text-orange-700',
      other: 'bg-gray-50 text-gray-700',
    }
    return colors[exitType] || 'bg-gray-50 text-gray-700'
  }

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!offboarding?.completion) return 0
    const tasks = [
      offboarding.completion.exitInterviewCompleted,
      offboarding.completion.clearanceCompleted,
      offboarding.completion.knowledgeTransferCompleted,
      offboarding.completion.finalSettlementCompleted,
      offboarding.completion.documentsIssued,
    ]
    const completed = tasks.filter(Boolean).length
    return Math.round((completed / tasks.length) * 100)
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'إنهاء الخدمة', href: '/dashboard/hr/offboarding', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
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
          badge="إنهاء الخدمة"
          title={offboarding?.employeeNameAr || offboarding?.employeeName || 'تفاصيل إنهاء الخدمة'}
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
                  onClick={() => navigate({ to: '/dashboard/hr/offboarding' })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-navy">تفاصيل إنهاء الخدمة</h1>
                  <p className="text-slate-500">عرض وإدارة بيانات إنهاء الخدمة</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <MoreHorizontal className="w-4 h-4 ms-2" aria-hidden="true" />
                    إجراءات
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => navigate({ to: `/dashboard/hr/offboarding/new?editId=${offboardingId}` })}
                  >
                    <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                    تعديل
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {offboarding?.status === 'initiated' && (
                    <DropdownMenuItem onClick={() => handleStatusUpdate('in_progress')}>
                      <PlayCircle className="w-4 h-4 ms-2" />
                      بدء العملية
                    </DropdownMenuItem>
                  )}
                  {offboarding?.status === 'in_progress' && (
                    <>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('clearance_pending')}>
                        <ClipboardCheck className="w-4 h-4 ms-2" />
                        الانتقال للإخلاء
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('cancelled')}>
                        <XCircle className="w-4 h-4 ms-2" />
                        إلغاء
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                    حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : !offboarding ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">لم يتم العثور على السجل</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Progress Card */}
                <Card className="rounded-2xl border-slate-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-navy">تقدم إنهاء الخدمة</h3>
                        <p className="text-sm text-slate-500">نسبة إكمال المهام</p>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {calculateCompletionPercentage()}%
                      </div>
                    </div>
                    <Progress value={calculateCompletionPercentage()} className="h-3" />
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <div className={`flex items-center gap-1 ${offboarding.completion?.exitInterviewCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                        مقابلة الخروج
                      </div>
                      <div className={`flex items-center gap-1 ${offboarding.completion?.clearanceCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                        الإخلاء
                      </div>
                      <div className={`flex items-center gap-1 ${offboarding.completion?.finalSettlementCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                        التسوية
                      </div>
                      <div className={`flex items-center gap-1 ${offboarding.completion?.documentsIssued ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                        الشهادات
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">آخر يوم عمل</p>
                          <p className="font-bold text-navy">
                            {new Date(offboarding.dates.lastWorkingDay).toLocaleDateString('ar-SA')}
                          </p>
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
                          <p className="text-xs text-slate-500">فترة الإشعار</p>
                          <p className="font-bold text-navy">
                            {offboarding.noticePeriod?.noticeDaysServed || 0}/{offboarding.noticePeriod?.requiredDays || 30} يوم
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Briefcase className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">مدة الخدمة</p>
                          <p className="font-bold text-navy">
                            {offboarding.serviceDuration?.years || 0} سنة {offboarding.serviceDuration?.months || 0} شهر
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getExitTypeColor(offboarding.exitType)} px-3 py-2`}>
                          {EXIT_TYPE_LABELS[offboarding.exitType]?.ar}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Card className="rounded-2xl border-slate-100">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full border-b border-slate-100 bg-transparent p-0 h-auto">
                      <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        نظرة عامة
                      </TabsTrigger>
                      <TabsTrigger
                        value="clearance"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        الإخلاء
                      </TabsTrigger>
                      <TabsTrigger
                        value="settlement"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        التسوية
                      </TabsTrigger>
                      <TabsTrigger
                        value="documents"
                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 px-6 py-3"
                      >
                        الشهادات
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee Info */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-navy flex items-center gap-2">
                            <User className="w-4 h-4" aria-hidden="true" />
                            بيانات الموظف
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">الاسم</span>
                              <span className="font-medium">{offboarding.employeeNameAr || offboarding.employeeName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم الموظف</span>
                              <span className="font-medium">{offboarding.employeeNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">رقم الهوية</span>
                              <span className="font-medium">{offboarding.nationalId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">المسمى الوظيفي</span>
                              <span className="font-medium">{offboarding.jobTitleAr || offboarding.jobTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">القسم</span>
                              <span className="font-medium">{offboarding.department || 'غير محدد'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Exit Info */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-navy flex items-center gap-2">
                            <FileText className="w-4 h-4" aria-hidden="true" />
                            تفاصيل الخروج
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">نوع الخروج</span>
                              <Badge className={getExitTypeColor(offboarding.exitType)}>
                                {EXIT_TYPE_LABELS[offboarding.exitType]?.ar}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">الحالة</span>
                              <Badge className={getStatusColor(offboarding.status)}>
                                {OFFBOARDING_STATUS_LABELS[offboarding.status]?.ar}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">تاريخ الإشعار</span>
                              <span className="font-medium">
                                {offboarding.dates.noticeDate
                                  ? new Date(offboarding.dates.noticeDate).toLocaleDateString('ar-SA')
                                  : 'غير محدد'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">آخر يوم عمل</span>
                              <span className="font-medium">
                                {new Date(offboarding.dates.lastWorkingDay).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">تاريخ السريان</span>
                              <span className="font-medium">
                                {offboarding.dates.exitEffectiveDate
                                  ? new Date(offboarding.dates.exitEffectiveDate).toLocaleDateString('ar-SA')
                                  : 'غير محدد'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rehire Eligibility */}
                      {offboarding.rehireEligibility && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="font-bold text-navy flex items-center gap-2 mb-4">
                            <UserCheck className="w-4 h-4" />
                            أهلية إعادة التوظيف
                          </h4>
                          <div className="flex items-center gap-4">
                            <Badge className={
                              offboarding.rehireEligibility.eligibilityCategory === 'eligible'
                                ? 'bg-emerald-100 text-emerald-700'
                                : offboarding.rehireEligibility.eligibilityCategory === 'conditional'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }>
                              {REHIRE_ELIGIBILITY_LABELS[offboarding.rehireEligibility.eligibilityCategory]?.ar}
                            </Badge>
                            {offboarding.rehireEligibility.eligibilityReason && (
                              <span className="text-sm text-slate-500">
                                {offboarding.rehireEligibility.eligibilityReason}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Clearance Tab */}
                    <TabsContent value="clearance" className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* IT Clearance */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-blue-500" />
                                تقنية المعلومات
                              </span>
                              <Badge className={offboarding.clearance?.itClearance?.cleared ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {offboarding.clearance?.itClearance?.cleared ? 'مكتمل' : 'قيد الانتظار'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {!offboarding.clearance?.itClearance?.cleared && (
                              <Button
                                size="sm"
                                onClick={() => completeClearanceMutation.mutate({ offboardingId, section: 'it' })}
                                disabled={completeClearanceMutation.isPending}
                                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                              >
                                <CheckCircle className="w-4 h-4 ms-2" />
                                إكمال الإخلاء
                              </Button>
                            )}
                          </CardContent>
                        </Card>

                        {/* Finance Clearance */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-emerald-500" />
                                المالية
                              </span>
                              <Badge className={offboarding.clearance?.financeClearance?.cleared ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {offboarding.clearance?.financeClearance?.cleared ? 'مكتمل' : 'قيد الانتظار'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {!offboarding.clearance?.financeClearance?.cleared && (
                              <Button
                                size="sm"
                                onClick={() => completeClearanceMutation.mutate({ offboardingId, section: 'finance' })}
                                disabled={completeClearanceMutation.isPending}
                                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                              >
                                <CheckCircle className="w-4 h-4 ms-2" />
                                إكمال الإخلاء
                              </Button>
                            )}
                          </CardContent>
                        </Card>

                        {/* HR Clearance */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-500" aria-hidden="true" />
                                الموارد البشرية
                              </span>
                              <Badge className={offboarding.clearance?.hrClearance?.cleared ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {offboarding.clearance?.hrClearance?.cleared ? 'مكتمل' : 'قيد الانتظار'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {!offboarding.clearance?.hrClearance?.cleared && (
                              <Button
                                size="sm"
                                onClick={() => completeClearanceMutation.mutate({ offboardingId, section: 'hr' })}
                                disabled={completeClearanceMutation.isPending}
                                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                              >
                                <CheckCircle className="w-4 h-4 ms-2" />
                                إكمال الإخلاء
                              </Button>
                            )}
                          </CardContent>
                        </Card>

                        {/* Manager Clearance */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <User className="w-4 h-4 text-amber-500" aria-hidden="true" />
                                المدير المباشر
                              </span>
                              <Badge className={offboarding.clearance?.managerClearance?.cleared ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {offboarding.clearance?.managerClearance?.cleared ? 'مكتمل' : 'قيد الانتظار'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {!offboarding.clearance?.managerClearance?.cleared && (
                              <Button
                                size="sm"
                                onClick={() => completeClearanceMutation.mutate({ offboardingId, section: 'manager' })}
                                disabled={completeClearanceMutation.isPending}
                                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                              >
                                <CheckCircle className="w-4 h-4 ms-2" />
                                إكمال الإخلاء
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Settlement Tab */}
                    <TabsContent value="settlement" className="p-6 space-y-6">
                      {offboarding.finalSettlement?.calculated ? (
                        <div className="space-y-6">
                          {/* Settlement Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="rounded-xl border-slate-100 bg-emerald-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-emerald-600">إجمالي المستحقات</p>
                                <p className="text-2xl font-bold text-emerald-700">
                                  {offboarding.finalSettlement.earnings.totalEarnings?.toLocaleString()} ر.س
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-red-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-red-600">إجمالي الخصومات</p>
                                <p className="text-2xl font-bold text-red-700">
                                  {offboarding.finalSettlement.deductions.totalDeductions?.toLocaleString()} ر.س
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="rounded-xl border-slate-100 bg-blue-50">
                              <CardContent className="p-4 text-center">
                                <p className="text-sm text-blue-600">صافي المستحق</p>
                                <p className="text-2xl font-bold text-blue-700">
                                  {offboarding.finalSettlement.netSettlement?.netPayable?.toLocaleString()} ر.س
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* EOSB Details */}
                          {offboarding.finalSettlement.earnings.eosb && (
                            <Card className="rounded-xl border-slate-100">
                              <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                  <Award className="w-4 h-4 text-emerald-500" />
                                  مكافأة نهاية الخدمة
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">السنوات 1-5 (نصف راتب/سنة)</span>
                                    <span>{offboarding.finalSettlement.earnings.eosb.calculation.years1to5.amount?.toLocaleString()} ر.س</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">السنوات بعد 5 (راتب كامل/سنة)</span>
                                    <span>{offboarding.finalSettlement.earnings.eosb.calculation.yearsOver5.amount?.toLocaleString()} ر.س</span>
                                  </div>
                                  <div className="flex justify-between font-bold pt-2 border-t">
                                    <span>إجمالي المكافأة</span>
                                    <span>{offboarding.finalSettlement.earnings.eosb.finalEOSB?.toLocaleString()} ر.س</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Approve Button */}
                          {!offboarding.finalSettlement.finalApproved && (
                            <Button
                              onClick={() => approveSettlementMutation.mutate(offboardingId)}
                              disabled={approveSettlementMutation.isPending}
                              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                            >
                              <CheckCircle className="w-4 h-4 ms-2" />
                              اعتماد التسوية النهائية
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <DollarSign className="w-12 h-12 mx-auto text-slate-300" />
                          <p className="mt-4 text-slate-500">لم يتم حساب التسوية النهائية بعد</p>
                          <Button
                            onClick={() => calculateSettlementMutation.mutate(offboardingId)}
                            disabled={calculateSettlementMutation.isPending}
                            className="mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                          >
                            <DollarSign className="w-4 h-4 ms-2" />
                            حساب التسوية النهائية
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Experience Certificate */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-emerald-500" />
                                شهادة الخبرة
                              </span>
                              <Badge className={offboarding.finalDocuments?.experienceCertificate?.issued ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {offboarding.finalDocuments?.experienceCertificate?.issued ? 'صادرة' : 'قيد الإعداد'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {!offboarding.finalDocuments?.experienceCertificate?.issued && (
                              <Button
                                size="sm"
                                onClick={() => issueCertificateMutation.mutate(offboardingId)}
                                disabled={issueCertificateMutation.isPending}
                                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                              >
                                <FileCheck className="w-4 h-4 ms-2" />
                                إصدار الشهادة
                              </Button>
                            )}
                          </CardContent>
                        </Card>

                        {/* Reference Letter */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                خطاب التوصية
                              </span>
                              <Badge className={offboarding.finalDocuments?.referenceLetter?.issued ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                {offboarding.finalDocuments?.referenceLetter?.issued ? 'صادر' : 'لم يُطلب'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-slate-500">يُصدر عند الطلب</p>
                          </CardContent>
                        </Card>

                        {/* Salary Certificate */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-purple-500" />
                                شهادة الراتب
                              </span>
                              <Badge className={offboarding.finalDocuments?.salaryCertificate?.issued ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                {offboarding.finalDocuments?.salaryCertificate?.issued ? 'صادرة' : 'لم تُطلب'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-slate-500">يُصدر عند الطلب</p>
                          </CardContent>
                        </Card>

                        {/* GOSI Clearance */}
                        <Card className="rounded-xl border-slate-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-amber-500" aria-hidden="true" />
                                إخلاء التأمينات
                              </span>
                              <Badge className={offboarding.finalDocuments?.gosiClearance?.clearanceCertificateIssued ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {offboarding.finalDocuments?.gosiClearance?.clearanceCertificateIssued ? 'مكتمل' : 'قيد الإجراء'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-slate-500">إجراء تلقائي مع التأمينات الاجتماعية</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Complete Offboarding */}
                      {offboarding.status !== 'completed' && offboarding.completion?.allTasksCompleted && (
                        <Button
                          onClick={() => completeOffboardingMutation.mutate(offboardingId)}
                          disabled={completeOffboardingMutation.isPending}
                          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CheckCircle className="w-4 h-4 ms-2" />
                          إكمال إنهاء الخدمة
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                </Card>
              </>
            )}
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
