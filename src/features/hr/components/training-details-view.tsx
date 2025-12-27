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
  useTraining,
  useApproveTraining,
  useRejectTraining,
  useStartTraining,
  useCompleteTraining,
  useIssueCertificate,
  useSubmitEvaluation,
  useDeleteTraining,
} from '@/hooks/useTraining'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ApproveTrainingDialog,
  RejectTrainingDialog,
  CompleteTrainingDialog,
  TrainingEvaluationDialog,
} from '@/components/hr/training/TrainingDialogs'
import {
  Search, Bell, ArrowRight, User, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, Loader2, GraduationCap,
  MapPin, Monitor, BookOpen, Award, FileText, DollarSign,
  Scale, Play, Star, Trash2, Edit, MoreHorizontal,
  Users, Building2, TrendingUp, ClipboardCheck
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TRAINING_TYPE_LABELS,
  TRAINING_STATUS_LABELS,
  TRAINING_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DELIVERY_METHOD_LABELS,
  CLE_CATEGORY_LABELS,
  type TrainingStatus,
} from '@/services/trainingService'

export function TrainingDetailsView() {
  const navigate = useNavigate()
  const { trainingId } = useParams({ strict: false })

  const { data: training, isLoading, error } = useTraining(trainingId || '')
  const approveMutation = useApproveTraining()
  const rejectMutation = useRejectTraining()
  const startMutation = useStartTraining()
  const completeMutation = useCompleteTraining()
  const certificateMutation = useIssueCertificate()
  const evaluationMutation = useSubmitEvaluation()
  const deleteMutation = useDeleteTraining()

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false)

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التدريب', href: '/dashboard/hr/training', isActive: true },
  ]

  const getStatusColor = (status: TrainingStatus) => {
    const colors: Record<TrainingStatus, string> = {
      requested: 'bg-slate-100 text-slate-700 border-slate-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      enrolled: 'bg-purple-100 text-purple-700 border-purple-200',
      in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status]
  }

  const handleApprove = async (data: { comments?: string }) => {
    if (!trainingId) return
    await approveMutation.mutateAsync({
      trainingId,
      data: { comments: data.comments },
    })
  }

  const handleReject = async (data: { reason: string }) => {
    if (!trainingId) return
    await rejectMutation.mutateAsync({
      trainingId,
      data: { reason: data.reason },
    })
  }

  const handleStart = async () => {
    if (!trainingId) return
    await startMutation.mutateAsync(trainingId)
  }

  const handleComplete = async (data: { finalScore?: number; finalGrade?: string }) => {
    if (!trainingId) return
    await completeMutation.mutateAsync({
      trainingId,
      data: {
        passed: true,
        finalScore: data.finalScore,
        finalGrade: data.finalGrade,
      },
    })
  }

  const handleIssueCertificate = async () => {
    if (!trainingId) return
    await certificateMutation.mutateAsync({
      trainingId,
      data: {
        certificateType: 'completion',
        cleCredits: training?.cleDetails?.cleCredits,
      },
    })
  }

  const handleSubmitEvaluation = async (data: {
    overallSatisfaction: number
    contentRelevance: number
    contentQuality: number
    instructorKnowledge: number
    instructorEffectiveness: number
    materialsQuality: number
    recommendToOthers: number
    whatWasGood?: string
    whatCouldImprove?: string
    additionalComments?: string
  }) => {
    if (!trainingId) return
    await evaluationMutation.mutateAsync({
      trainingId,
      data: {
        ratings: {
          overallSatisfaction: data.overallSatisfaction,
          contentRelevance: data.contentRelevance,
          contentQuality: data.contentQuality,
          instructorKnowledge: data.instructorKnowledge,
          instructorEffectiveness: data.instructorEffectiveness,
          materialsQuality: data.materialsQuality,
          recommendToOthers: data.recommendToOthers,
        },
        openEndedFeedback: {
          whatWasGood: data.whatWasGood,
          whatCouldImprove: data.whatCouldImprove,
          additionalComments: data.additionalComments,
        },
      },
    })
  }

  const handleDelete = async () => {
    if (!trainingId) return
    if (confirm('هل أنت متأكد من حذف هذا التدريب؟')) {
      await deleteMutation.mutateAsync(trainingId)
      navigate({ to: '/dashboard/hr/training' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error || !training) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" aria-hidden="true" />
        <p className="text-red-600">حدث خطأ في تحميل بيانات التدريب</p>
        <Button
          onClick={() => navigate({ to: '/dashboard/hr/training' })}
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
          title="تفاصيل التدريب"
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
                  onClick={() => navigate({ to: '/dashboard/hr/training' })}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-navy">
                      {training.trainingTitleAr || training.trainingTitle}
                    </h1>
                    <Badge className={getStatusColor(training.status)}>
                      {TRAINING_STATUS_LABELS[training.status]?.ar}
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    {training.trainingNumber} - {training.employeeNameAr || training.employeeName}
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
                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/training/new?editId=${training._id}` })}>
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
                  {training.status === 'requested' && (
                    <>
                      <Button
                        onClick={() => setShowApproveDialog(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4 ms-2" />
                        اعتماد
                      </Button>

                      <Button
                        onClick={() => setShowRejectDialog(true)}
                        variant="destructive"
                        className="rounded-xl"
                      >
                        <XCircle className="w-4 h-4 ms-2" />
                        رفض
                      </Button>
                    </>
                  )}

                  {(training.status === 'approved' || training.status === 'enrolled') && (
                    <Button
                      onClick={handleStart}
                      disabled={startMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                    >
                      <Play className="w-4 h-4 ms-2" />
                      {startMutation.isPending ? 'جاري البدء...' : 'بدء التدريب'}
                    </Button>
                  )}

                  {training.status === 'in_progress' && (
                    <Button
                      onClick={() => setShowCompleteDialog(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    >
                      <CheckCircle className="w-4 h-4 ms-2" />
                      إكمال التدريب
                    </Button>
                  )}

                  {training.status === 'completed' && !training.certificate?.issued && (
                    <Button
                      onClick={handleIssueCertificate}
                      disabled={certificateMutation.isPending}
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                    >
                      <Award className="w-4 h-4 ms-2" />
                      {certificateMutation.isPending ? 'جاري الإصدار...' : 'إصدار شهادة'}
                    </Button>
                  )}

                  {training.status === 'completed' && !training.evaluation?.evaluationCompleted && (
                    <Button
                      onClick={() => setShowEvaluationDialog(true)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <Star className="w-4 h-4 ms-2" />
                      تقييم التدريب
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                <TabsTrigger value="sessions" className="rounded-lg">الجلسات</TabsTrigger>
                <TabsTrigger value="assessments" className="rounded-lg">التقييمات</TabsTrigger>
                <TabsTrigger value="completion" className="rounded-lg">الإكمال</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Training Info */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-500" />
                      معلومات التدريب
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">نوع التدريب</p>
                        <Badge className="bg-blue-100 text-blue-700">
                          {TRAINING_TYPE_LABELS[training.trainingType]?.ar}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">التصنيف</p>
                        <Badge className="bg-purple-100 text-purple-700">
                          {TRAINING_CATEGORY_LABELS[training.trainingCategory]?.ar}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">المستوى</p>
                        <Badge className="bg-amber-100 text-amber-700">
                          {DIFFICULTY_LABELS[training.difficultyLevel]?.ar}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">طريقة التقديم</p>
                        <p className="font-medium text-navy">{DELIVERY_METHOD_LABELS[training.deliveryMethod]?.ar}</p>
                      </div>
                    </div>

                    {training.trainingDescription && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-2">الوصف</p>
                        <p className="text-slate-700">{training.trainingDescriptionAr || training.trainingDescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Employee Info */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      بيانات الموظف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">اسم الموظف</p>
                        <p className="font-medium text-navy">{training.employeeNameAr || training.employeeName}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">رقم الموظف</p>
                        <p className="font-medium text-navy">{training.employeeNumber}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">القسم</p>
                        <p className="font-medium text-navy">{training.department || '-'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">المسمى الوظيفي</p>
                        <p className="font-medium text-navy">{training.jobTitle || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Duration */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      التاريخ والمدة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">تاريخ البداية</p>
                        <p className="font-medium text-navy">{new Date(training.startDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">تاريخ النهاية</p>
                        <p className="font-medium text-navy">{new Date(training.endDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">إجمالي الساعات</p>
                        <p className="font-medium text-navy">{training.duration.totalHours} ساعة</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">عدد الأيام</p>
                        <p className="font-medium text-navy">{training.duration.totalDays || '-'} يوم</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      الموقع
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">نوع الموقع</p>
                        <div className="flex items-center gap-2">
                          {training.locationType === 'virtual' ? (
                            <Monitor className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Building2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                          )}
                          <p className="font-medium text-navy">
                            {training.locationType === 'on_site' ? 'في المقر' :
                              training.locationType === 'off_site' ? 'خارج المقر' :
                                training.locationType === 'virtual' ? 'افتراضي' : 'مدمج'}
                          </p>
                        </div>
                      </div>
                      {training.venue?.venueName && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">اسم المكان</p>
                          <p className="font-medium text-navy">{training.venue.venueName}</p>
                        </div>
                      )}
                      {training.venue?.city && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">المدينة</p>
                          <p className="font-medium text-navy">{training.venue.city}</p>
                        </div>
                      )}
                      {training.virtualDetails?.platform && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">المنصة</p>
                          <p className="font-medium text-navy">{training.virtualDetails.platform}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* CLE Details */}
                {training.cleDetails?.isCLE && (
                  <Card className="rounded-2xl border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-amber-600" />
                        التعليم القانوني المستمر (CLE)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-amber-600 mb-1">ساعات CLE</p>
                          <p className="text-xl font-bold text-amber-700">{training.cleDetails.cleCredits}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-amber-600 mb-1">ساعات الأخلاقيات</p>
                          <p className="text-xl font-bold text-amber-700">{training.cleDetails.ethicsCredits || 0}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-amber-600 mb-1">الفئة</p>
                          <p className="font-medium text-amber-700">{CLE_CATEGORY_LABELS[training.cleDetails.cleCategory]?.ar}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="text-xs text-amber-600 mb-1">معتمد</p>
                          <Badge className={training.cleDetails.approvedByBar ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {training.cleDetails.approvedByBar ? 'نعم' : 'في الانتظار'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Costs */}
                {training.costs && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        التكاليف
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">رسوم التدريب</p>
                          <p className="text-xl font-bold text-navy">
                            {training.costs.trainingFee?.baseFee?.toLocaleString('ar-SA')} {training.costs.trainingFee?.currency}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">إجمالي التكاليف</p>
                          <p className="text-xl font-bold text-navy">
                            {training.costs.totalCost?.toLocaleString('ar-SA')} {training.costs.trainingFee?.currency}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">حالة الدفع</p>
                          <Badge className={
                            training.costs.payment?.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                              training.costs.payment?.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                          }>
                            {training.costs.payment?.paymentStatus === 'paid' ? 'مدفوع' :
                              training.costs.payment?.paymentStatus === 'partial' ? 'جزئي' : 'معلق'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                {training.sessions && training.sessions.length > 0 ? (
                  <>
                    {/* Attendance Summary */}
                    {training.attendanceSummary && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                            ملخص الحضور
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                              <p className="text-xs text-slate-500 mb-1">إجمالي الجلسات</p>
                              <p className="text-2xl font-bold text-navy">{training.attendanceSummary.totalSessions}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl text-center">
                              <p className="text-xs text-emerald-600 mb-1">حضور</p>
                              <p className="text-2xl font-bold text-emerald-700">{training.attendanceSummary.attendedSessions}</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl text-center">
                              <p className="text-xs text-red-600 mb-1">غياب</p>
                              <p className="text-2xl font-bold text-red-700">{training.attendanceSummary.missedSessions}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl text-center">
                              <p className="text-xs text-blue-600 mb-1">نسبة الحضور</p>
                              <p className="text-2xl font-bold text-blue-700">{training.attendanceSummary.attendancePercentage}%</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Progress value={training.attendanceSummary.attendancePercentage} className="h-3" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Sessions List */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          الجلسات
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {training.sessions.map((session) => (
                            <div key={session.sessionNumber} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-navy">
                                  {session.sessionNumber}
                                </div>
                                <div>
                                  <p className="font-medium text-navy">{session.topicAr || session.topic || `جلسة ${session.sessionNumber}`}</p>
                                  <p className="text-sm text-slate-500">
                                    {new Date(session.sessionDate).toLocaleDateString('ar-SA')} - {session.startTime} إلى {session.endTime}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {session.mandatory && (
                                  <Badge className="bg-red-100 text-red-700">إلزامي</Badge>
                                )}
                                {session.attended !== undefined && (
                                  <Badge className={session.attended ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                    {session.attended ? 'حضر' : 'غاب'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" aria-hidden="true" />
                      <p className="text-slate-500">لا توجد جلسات محددة</p>
                    </CardContent>
                  </Card>
                )}

                {/* Progress for Online Courses */}
                {training.progress && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                        تقدم الدورة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">التقدم</span>
                          <span className="font-bold text-emerald-600">{training.progress.progressPercentage}%</span>
                        </div>
                        <Progress value={training.progress.progressPercentage} className="h-3" />
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center">
                            <p className="text-xs text-slate-500">الوحدات المكتملة</p>
                            <p className="font-bold text-navy">
                              {training.progress.completedModules} / {training.progress.totalModules}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">الوقت المستغرق</p>
                            <p className="font-bold text-navy">{training.progress.totalTimeSpent || 0} دقيقة</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">آخر وصول</p>
                            <p className="font-bold text-navy">
                              {training.progress.lastAccessDate
                                ? new Date(training.progress.lastAccessDate).toLocaleDateString('ar-SA')
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Assessments Tab */}
              <TabsContent value="assessments" className="space-y-6">
                {training.assessments && training.assessments.length > 0 ? (
                  <div className="space-y-4">
                    {training.assessments.map((assessment) => (
                      <Card key={assessment.assessmentId} className="rounded-2xl border-slate-100">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-navy">{assessment.assessmentTitle}</h3>
                              <p className="text-sm text-slate-500 capitalize">
                                {assessment.assessmentType.replace('_', ' ')}
                              </p>
                            </div>
                            <Badge className={assessment.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                              {assessment.passed ? 'ناجح' : 'راسب'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="p-3 bg-slate-50 rounded-xl text-center">
                              <p className="text-xs text-slate-500">الدرجة</p>
                              <p className="font-bold text-navy">{assessment.score} / {assessment.maxScore}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl text-center">
                              <p className="text-xs text-slate-500">النسبة</p>
                              <p className="font-bold text-navy">{assessment.percentageScore}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl text-center">
                              <p className="text-xs text-slate-500">درجة النجاح</p>
                              <p className="font-bold text-navy">{assessment.passingScore}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl text-center">
                              <p className="text-xs text-slate-500">المحاولة</p>
                              <p className="font-bold text-navy">{assessment.attemptNumber} / {assessment.maxAttempts || '∞'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" aria-hidden="true" />
                      <p className="text-slate-500">لا توجد تقييمات</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Completion Tab */}
              <TabsContent value="completion" className="space-y-6">
                {/* Completion Status */}
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      حالة الإكمال
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-xs text-slate-500 mb-2">الحالة</p>
                        <Badge className={training.completion?.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                          {training.completion?.completed ? 'مكتمل' : 'غير مكتمل'}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-xs text-slate-500 mb-2">النتيجة</p>
                        <Badge className={training.completion?.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {training.completion?.passed ? 'ناجح' : 'راسب'}
                        </Badge>
                      </div>
                      {training.completion?.finalScore !== undefined && (
                        <div className="p-4 bg-slate-50 rounded-xl text-center">
                          <p className="text-xs text-slate-500 mb-1">الدرجة النهائية</p>
                          <p className="text-2xl font-bold text-navy">{training.completion.finalScore}%</p>
                        </div>
                      )}
                      {training.completion?.completionDate && (
                        <div className="p-4 bg-slate-50 rounded-xl text-center">
                          <p className="text-xs text-slate-500 mb-1">تاريخ الإكمال</p>
                          <p className="font-medium text-navy">
                            {new Date(training.completion.completionDate).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate */}
                {training.certificate && (
                  <Card className="rounded-2xl border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        الشهادة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {training.certificate.issued ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-white rounded-xl text-center">
                            <p className="text-xs text-purple-600 mb-1">رقم الشهادة</p>
                            <p className="font-medium text-purple-700">{training.certificate.certificateNumber}</p>
                          </div>
                          <div className="p-4 bg-white rounded-xl text-center">
                            <p className="text-xs text-purple-600 mb-1">تاريخ الإصدار</p>
                            <p className="font-medium text-purple-700">
                              {training.certificate.issueDate
                                ? new Date(training.certificate.issueDate).toLocaleDateString('ar-SA')
                                : '-'}
                            </p>
                          </div>
                          <div className="p-4 bg-white rounded-xl text-center">
                            <p className="text-xs text-purple-600 mb-1">نوع الشهادة</p>
                            <p className="font-medium text-purple-700 capitalize">
                              {training.certificate.certificateType.replace('_', ' ')}
                            </p>
                          </div>
                          {training.certificate.validUntil && (
                            <div className="p-4 bg-white rounded-xl text-center">
                              <p className="text-xs text-purple-600 mb-1">صالحة حتى</p>
                              <p className="font-medium text-purple-700">
                                {new Date(training.certificate.validUntil).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Award className="w-12 h-12 mx-auto text-purple-300 mb-4" />
                          <p className="text-purple-600">لم يتم إصدار الشهادة بعد</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Evaluation */}
                {training.evaluation?.evaluationCompleted && (
                  <Card className="rounded-2xl border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-600" />
                        تقييم التدريب
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { key: 'overallSatisfaction', label: 'الرضا العام' },
                          { key: 'contentRelevance', label: 'صلة المحتوى' },
                          { key: 'contentQuality', label: 'جودة المحتوى' },
                          { key: 'instructorKnowledge', label: 'معرفة المدرب' },
                        ].map((item) => (
                          <div key={item.key} className="p-4 bg-white rounded-xl text-center">
                            <p className="text-xs text-amber-600 mb-2">{item.label}</p>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (training.evaluation?.ratings?.[item.key as keyof typeof training.evaluation.ratings] || 0)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {training.evaluation.openEndedFeedback && (
                        <div className="mt-4 space-y-3">
                          {training.evaluation.openEndedFeedback.whatWasGood && (
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-amber-600 mb-1">ما الذي أعجبك؟</p>
                              <p className="text-amber-800">{training.evaluation.openEndedFeedback.whatWasGood}</p>
                            </div>
                          )}
                          {training.evaluation.openEndedFeedback.whatCouldImprove && (
                            <div className="p-4 bg-white rounded-xl">
                              <p className="text-xs text-amber-600 mb-1">ما الذي يمكن تحسينه؟</p>
                              <p className="text-amber-800">{training.evaluation.openEndedFeedback.whatCouldImprove}</p>
                            </div>
                          )}
                        </div>
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

      {/* Training Dialogs */}
      <ApproveTrainingDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        onSubmit={handleApprove}
        isLoading={approveMutation.isPending}
      />

      <RejectTrainingDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onSubmit={handleReject}
        isLoading={rejectMutation.isPending}
      />

      <CompleteTrainingDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onSubmit={handleComplete}
        isLoading={completeMutation.isPending}
      />

      <TrainingEvaluationDialog
        open={showEvaluationDialog}
        onOpenChange={setShowEvaluationDialog}
        onSubmit={handleSubmitEvaluation}
        isLoading={evaluationMutation.isPending}
      />
    </>
  )
}
