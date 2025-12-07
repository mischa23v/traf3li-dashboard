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
  usePerformanceReview,
  useSubmitSelfAssessment,
  useSubmitManagerAssessment,
  useCompleteReview,
  useAcknowledgeReview,
  useApproveReviewStep,
  useSendReminder,
} from '@/hooks/usePerformanceReviews'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Search, Bell, ArrowRight, AlertCircle, Calendar, User,
  FileText, CheckCircle, XCircle, MoreHorizontal, Download, Send,
  Star, Target, BarChart3, MessageCircle, TrendingUp, TrendingDown,
  AlertTriangle, Award, Scale, BookOpen, Users, Clock, Briefcase,
  ChevronRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ReviewStatus, OverallRating, GoalStatus, RatingScale } from '@/services/performanceReviewService'

// Status labels
const REVIEW_STATUS_LABELS: Record<ReviewStatus, { ar: string; color: string }> = {
  draft: { ar: 'مسودة', color: 'slate' },
  self_assessment: { ar: 'التقييم الذاتي', color: 'blue' },
  manager_review: { ar: 'تقييم المدير', color: 'amber' },
  calibration: { ar: 'المعايرة', color: 'purple' },
  completed: { ar: 'مكتمل', color: 'emerald' },
  acknowledged: { ar: 'معتمد', color: 'emerald' },
}

// Rating labels
const RATING_LABELS: Record<OverallRating, { ar: string; color: string; icon: React.ReactNode }> = {
  exceptional: { ar: 'استثنائي', color: 'emerald', icon: <TrendingUp className="w-4 h-4" /> },
  exceeds_expectations: { ar: 'يتجاوز التوقعات', color: 'blue', icon: <Star className="w-4 h-4" /> },
  meets_expectations: { ar: 'يلبي التوقعات', color: 'amber', icon: <Target className="w-4 h-4" /> },
  needs_improvement: { ar: 'يحتاج تحسين', color: 'orange', icon: <AlertTriangle className="w-4 h-4" /> },
  unsatisfactory: { ar: 'غير مرضي', color: 'red', icon: <TrendingDown className="w-4 h-4" /> },
}

// Goal status labels
const GOAL_STATUS_LABELS: Record<GoalStatus, { ar: string; color: string }> = {
  not_started: { ar: 'لم يبدأ', color: 'slate' },
  in_progress: { ar: 'قيد التنفيذ', color: 'blue' },
  completed: { ar: 'مكتمل', color: 'emerald' },
  exceeded: { ar: 'متجاوز', color: 'purple' },
  not_achieved: { ar: 'لم يتحقق', color: 'red' },
}

// Rating scale labels
const RATING_SCALE_LABELS: Record<RatingScale, { ar: string; color: string }> = {
  1: { ar: 'ضعيف', color: 'red' },
  2: { ar: 'أقل من المتوقع', color: 'orange' },
  3: { ar: 'يلبي التوقعات', color: 'amber' },
  4: { ar: 'يتجاوز التوقعات', color: 'blue' },
  5: { ar: 'استثنائي', color: 'emerald' },
}

export function PerformanceReviewDetailsView() {
  const navigate = useNavigate()
  const { reviewId } = useParams({ from: '/_authenticated/dashboard/hr/performance/$reviewId' })

  // Fetch review
  const { data: review, isLoading, isError, error } = usePerformanceReview(reviewId)

  // Mutations
  const completeMutation = useCompleteReview()
  const acknowledgeMutation = useAcknowledgeReview()
  const approveMutation = useApproveReviewStep()
  const reminderMutation = useSendReminder()

  // Dialog states
  const [showAcknowledgeDialog, setShowAcknowledgeDialog] = useState(false)
  const [acknowledgementComments, setAcknowledgementComments] = useState('')
  const [disputeRaised, setDisputeRaised] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  // Get status badge
  const getStatusBadge = (status: ReviewStatus) => {
    const config = REVIEW_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      amber: 'bg-amber-100 text-amber-700',
      purple: 'bg-purple-100 text-purple-700',
      slate: 'bg-slate-100 text-slate-600',
      blue: 'bg-blue-100 text-blue-700',
    }
    const icons: Record<ReviewStatus, React.ReactNode> = {
      draft: <FileText className="w-3 h-3" />,
      self_assessment: <User className="w-3 h-3" />,
      manager_review: <Users className="w-3 h-3" />,
      calibration: <BarChart3 className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      acknowledged: <Award className="w-3 h-3" />,
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-3 py-1 flex items-center gap-1 text-sm`}>
        {icons[status]}
        {config.ar}
      </Badge>
    )
  }

  // Get rating badge
  const getRatingBadge = (rating?: OverallRating) => {
    if (!rating) return null
    const config = RATING_LABELS[rating]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      blue: 'bg-blue-100 text-blue-700',
      amber: 'bg-amber-100 text-amber-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-3 py-1 flex items-center gap-1 text-sm`}>
        {config.icon}
        {config.ar}
      </Badge>
    )
  }

  // Get rating scale badge
  const getRatingScaleBadge = (rating?: RatingScale) => {
    if (!rating) return <span className="text-slate-400">-</span>
    const config = RATING_SCALE_LABELS[rating]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      blue: 'bg-blue-100 text-blue-700',
      amber: 'bg-amber-100 text-amber-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-2 py-0.5`}>
        {rating}/5 - {config.ar}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Get score color
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 4.5) return 'text-emerald-600'
    if (score >= 3.5) return 'text-blue-600'
    if (score >= 2.5) return 'text-amber-600'
    if (score >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  // Action handlers
  const handleComplete = () => {
    completeMutation.mutate(reviewId)
  }

  const handleAcknowledge = () => {
    acknowledgeMutation.mutate({
      reviewId,
      data: {
        employeeComments: acknowledgementComments,
        disputeRaised,
        disputeReason: disputeRaised ? disputeReason : undefined,
      }
    }, {
      onSuccess: () => {
        setShowAcknowledgeDialog(false)
        setAcknowledgementComments('')
        setDisputeRaised(false)
        setDisputeReason('')
      }
    })
  }

  const handleSendReminder = (reminderType: 'self_assessment' | 'manager_review' | '360_feedback' | 'acknowledgement') => {
    reminderMutation.mutate({ reviewId, reminderType })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'تقييم الأداء', href: '/dashboard/hr/performance', isActive: true },
    { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: false },
  ]

  // Calculate completion percentage
  const completionSteps = review ? [
    { done: !!review.selfAssessment?.completedAt, label: 'التقييم الذاتي' },
    { done: review.competencies?.every(c => c.selfRating && c.managerRating), label: 'الكفاءات' },
    { done: review.goals?.every(g => g.status !== 'not_started'), label: 'الأهداف' },
    { done: !!review.managerAssessment?.completedAt, label: 'تقييم المدير' },
    { done: review.status === 'completed' || review.status === 'acknowledged', label: 'الإكمال' },
  ] : []
  const completionPercentage = completionSteps.length > 0 ? (completionSteps.filter(s => s.done).length / completionSteps.length) * 100 : 0

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD - Always visible */}
        <ProductivityHero badge="الموارد البشرية" title="تفاصيل تقييم الأداء" type="performance" />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
              </div>
            )}

            {/* Error State */}
            {!isLoading && (isError || !review) && (
              <div className="bg-white rounded-2xl p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">لم يتم العثور على التقييم</h2>
                <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل بيانات التقييم'}</p>
                <Button onClick={() => navigate({ to: '/dashboard/hr/performance' })} className="bg-emerald-500 hover:bg-emerald-600">
                  العودة للقائمة
                </Button>
              </div>
            )}

            {/* Success State */}
            {!isLoading && !isError && review && (
              <>
                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-white"
                      onClick={() => navigate({ to: '/dashboard/hr/performance' })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-navy">تقييم الأداء</h1>
                        {getStatusBadge(review.status)}
                        {review.finalRating && getRatingBadge(review.finalRating)}
                      </div>
                      <p className="text-slate-500">
                        {review.reviewId} • {review.employeeNameAr || review.employeeName}
                      </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status-based actions */}
            {review.status === 'manager_review' && (
              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                <CheckCircle className="w-4 h-4 ms-2" />
                إكمال التقييم
              </Button>
            )}
            {review.status === 'completed' && !review.acknowledgement && (
              <Button
                onClick={() => setShowAcknowledgeDialog(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
              >
                <Award className="w-4 h-4 ms-2" />
                اعتماد التقييم
              </Button>
            )}

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleSendReminder('self_assessment')}>
                  <Send className="h-4 w-4 ms-2" />
                  تذكير بالتقييم الذاتي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSendReminder('manager_review')}>
                  <Send className="h-4 w-4 ms-2" />
                  تذكير المدير
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 ms-2" />
                  تصدير PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">الدرجة الكلية</p>
                  <p className={`text-2xl font-bold ${getScoreColor(review.overallScore)}`}>
                    {review.overallScore?.toFixed(1) || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">الأهداف</p>
                  <p className="text-2xl font-bold text-navy">
                    {review.goals?.filter(g => g.status === 'completed' || g.status === 'exceeded').length || 0} / {review.goals?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">الكفاءات</p>
                  <p className="text-2xl font-bold text-navy">{review.competencies?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">نسبة الإنجاز</p>
                  <p className="text-2xl font-bold text-navy">{Math.round(completionPercentage)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Steps */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-navy">تقدم التقييم</span>
              <span className="text-sm text-slate-500">{Math.round(completionPercentage)}% مكتمل</span>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-4" />
            <div className="flex justify-between">
              {completionSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.done ? <CheckCircle className="w-4 h-4" /> : <span>{idx + 1}</span>}
                  </div>
                  <span className={`text-xs mt-1 ${step.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white rounded-xl p-1 shadow-sm flex-wrap h-auto">
            <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
            <TabsTrigger value="self" className="rounded-lg">التقييم الذاتي</TabsTrigger>
            <TabsTrigger value="competencies" className="rounded-lg">الكفاءات</TabsTrigger>
            <TabsTrigger value="goals" className="rounded-lg">الأهداف</TabsTrigger>
            {review.kpis && review.kpis.length > 0 && (
              <TabsTrigger value="kpis" className="rounded-lg">المؤشرات</TabsTrigger>
            )}
            {review.feedback360 && (
              <TabsTrigger value="feedback" className="rounded-lg">تقييم 360</TabsTrigger>
            )}
            <TabsTrigger value="manager" className="rounded-lg">تقييم المدير</TabsTrigger>
            {review.developmentPlan && (
              <TabsTrigger value="development" className="rounded-lg">خطة التطوير</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Info */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    معلومات الموظف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">الاسم</span>
                    <span className="font-medium text-navy">{review.employeeNameAr || review.employeeName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">المسمى الوظيفي</span>
                    <span className="font-medium text-navy">{review.positionTitleAr || review.positionTitle}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">القسم</span>
                    <span className="font-medium text-navy">{review.departmentNameAr || review.departmentName}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">المدير</span>
                    <span className="font-medium text-navy">{review.managerNameAr || review.managerName}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Period Info */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    فترة التقييم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">بداية الفترة</span>
                    <span className="font-medium text-navy">{formatDate(review.reviewPeriod?.startDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">نهاية الفترة</span>
                    <span className="font-medium text-navy">{formatDate(review.reviewPeriod?.endDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">تاريخ الاستحقاق</span>
                    <span className="font-medium text-navy">{formatDate(review.reviewPeriod?.reviewDueDate)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">موعد التقييم الذاتي</span>
                    <span className="font-medium text-navy">{formatDate(review.reviewPeriod?.selfAssessmentDueDate)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Final Rating (if completed) */}
              {review.finalRating && (
                <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      التقييم النهائي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 mb-2">التقييم الكلي</p>
                        {getRatingBadge(review.finalRating)}
                      </div>
                      <div className="text-center">
                        <p className="text-slate-600 mb-2">الدرجة</p>
                        <span className={`text-4xl font-bold ${getScoreColor(review.overallScore)}`}>
                          {review.overallScore?.toFixed(1) || '-'}
                        </span>
                        <span className="text-slate-400 text-lg"> / 5</span>
                      </div>
                      {review.calibration && (
                        <div className="text-center">
                          <p className="text-slate-600 mb-2">بعد المعايرة</p>
                          <Badge className="bg-purple-100 text-purple-700 border-0">
                            {review.calibration.comparativeRanking ? `الترتيب ${review.calibration.comparativeRanking}` : 'تمت المعايرة'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {review.managerAssessment?.ratingJustification && (
                      <div className="mt-4 p-4 bg-white/50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-1">مبررات التقييم:</p>
                        <p className="text-navy">{review.managerAssessment.ratingJustification}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Self Assessment Tab */}
          <TabsContent value="self" className="space-y-6">
            {review.selfAssessment?.completedAt ? (
              <>
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        التقييم الذاتي
                      </CardTitle>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        مكتمل في {formatDate(review.selfAssessment.completedAt)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Self Rating */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-2">التقييم الذاتي الكلي</p>
                      {getRatingScaleBadge(review.selfAssessment.overallSelfRating)}
                    </div>

                    {/* Achievements */}
                    {review.selfAssessment.achievements?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          الإنجازات
                        </h4>
                        <ul className="space-y-2">
                          {review.selfAssessment.achievements.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg">
                              <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5" />
                              <span className="text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Challenges */}
                    {review.selfAssessment.challenges?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          التحديات
                        </h4>
                        <ul className="space-y-2">
                          {review.selfAssessment.challenges.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                              <ChevronRight className="w-4 h-4 text-amber-600 mt-0.5" />
                              <span className="text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Development Areas */}
                    {review.selfAssessment.developmentAreas?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          مجالات التطوير
                        </h4>
                        <ul className="space-y-2">
                          {review.selfAssessment.developmentAreas.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5" />
                              <span className="text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Career Aspirations */}
                    {review.selfAssessment.careerAspirations && (
                      <div>
                        <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          الطموحات المهنية
                        </h4>
                        <p className="p-4 bg-purple-50 rounded-xl text-slate-700">
                          {review.selfAssessment.careerAspirations}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">لم يكتمل التقييم الذاتي</h3>
                  <p className="text-slate-500 mb-4">
                    موعد التسليم: {formatDate(review.reviewPeriod?.selfAssessmentDueDate)}
                  </p>
                  <Button
                    onClick={() => handleSendReminder('self_assessment')}
                    variant="outline"
                    className="rounded-xl"
                    disabled={reminderMutation.isPending}
                  >
                    <Send className="w-4 h-4 ms-2" />
                    إرسال تذكير
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Competencies Tab */}
          <TabsContent value="competencies" className="space-y-6">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  تقييم الكفاءات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {review.competencies && review.competencies.length > 0 ? (
                  <div className="space-y-4">
                    {review.competencies.map((comp, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-bold text-navy">{comp.competencyNameAr || comp.competencyName}</span>
                            <Badge className="me-2 bg-slate-200 text-slate-600 border-0 text-xs">
                              {comp.category === 'core' ? 'أساسية' :
                               comp.category === 'leadership' ? 'قيادية' :
                               comp.category === 'technical' ? 'تقنية' :
                               comp.category === 'legal' ? 'قانونية' : 'خدمة العملاء'}
                            </Badge>
                            <span className="text-sm text-slate-500 me-2">الوزن: {comp.weight}%</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">تقييم ذاتي</p>
                            {getRatingScaleBadge(comp.selfRating)}
                          </div>
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">تقييم المدير</p>
                            {getRatingScaleBadge(comp.managerRating)}
                          </div>
                        </div>
                        {comp.comments && (
                          <p className="mt-3 text-sm text-slate-600 bg-white p-3 rounded-lg">
                            {comp.comments}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    لا توجد كفاءات محددة لهذا التقييم
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  الأهداف
                </CardTitle>
              </CardHeader>
              <CardContent>
                {review.goals && review.goals.length > 0 ? (
                  <div className="space-y-4">
                    {review.goals.map((goal, idx) => {
                      const statusConfig = GOAL_STATUS_LABELS[goal.status]
                      const colorClasses: Record<string, string> = {
                        emerald: 'bg-emerald-100 text-emerald-700',
                        blue: 'bg-blue-100 text-blue-700',
                        purple: 'bg-purple-100 text-purple-700',
                        slate: 'bg-slate-100 text-slate-600',
                        red: 'bg-red-100 text-red-700',
                      }
                      return (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-navy">{goal.titleAr || goal.title}</span>
                                <Badge className={`${colorClasses[statusConfig.color]} border-0`}>
                                  {statusConfig.ar}
                                </Badge>
                                <span className="text-sm text-slate-500">الوزن: {goal.weight}%</span>
                              </div>
                              {goal.description && (
                                <p className="text-sm text-slate-600">{goal.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-slate-500 mb-1">الهدف</p>
                              <p className="font-medium text-navy">{goal.targetMetric || '-'}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-slate-500 mb-1">النتيجة الفعلية</p>
                              <p className="font-medium text-navy">{goal.actualResult || '-'}</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-slate-500 mb-1">التقييم</p>
                              {goal.managerRating ? getRatingScaleBadge(goal.managerRating) : <span className="text-slate-400">-</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    لا توجد أهداف محددة لهذا التقييم
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPIs Tab */}
          {review.kpis && review.kpis.length > 0 && (
            <TabsContent value="kpis" className="space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    مؤشرات الأداء الرئيسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {review.kpis.map((kpi, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-bold text-navy">{kpi.nameAr || kpi.name}</span>
                            <span className="text-sm text-slate-500 ms-2">الوزن: {kpi.weight}%</span>
                          </div>
                          {getRatingScaleBadge(kpi.rating)}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-white rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">الهدف</p>
                            <p className="font-bold text-navy">{kpi.target} {kpi.unit}</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">الفعلي</p>
                            <p className="font-bold text-blue-600">{kpi.actual} {kpi.unit}</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">نسبة الإنجاز</p>
                            <p className={`font-bold ${kpi.achievement >= 100 ? 'text-emerald-600' : kpi.achievement >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                              {kpi.achievement?.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <Progress value={Math.min(kpi.achievement || 0, 100)} className="h-2 mt-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 360 Feedback Tab */}
          {review.feedback360 && (
            <TabsContent value="feedback" className="space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    تقييم 360 درجة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Providers */}
                  <div className="mb-6">
                    <h4 className="font-medium text-slate-700 mb-3">مقدمو التقييم</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {review.feedback360.providers.map((provider, idx) => (
                        <div key={idx} className={`p-3 rounded-xl ${
                          provider.status === 'completed' ? 'bg-emerald-50' :
                          provider.status === 'declined' ? 'bg-red-50' : 'bg-amber-50'
                        }`}>
                          <p className="font-medium text-navy text-sm">{provider.providerNameAr || provider.providerName}</p>
                          <p className="text-xs text-slate-500">
                            {provider.relationship === 'peer' ? 'زميل' :
                             provider.relationship === 'subordinate' ? 'مرؤوس' :
                             provider.relationship === 'client' ? 'عميل' : 'متعدد الأقسام'}
                          </p>
                          <Badge className={`mt-2 border-0 text-xs ${
                            provider.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            provider.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {provider.status === 'completed' ? 'مكتمل' :
                             provider.status === 'declined' ? 'رفض' : 'قيد الانتظار'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {review.feedback360.summary && (
                    <div className="grid grid-cols-2 gap-4">
                      {review.feedback360.summary.commonStrengths?.length > 0 && (
                        <div className="p-4 bg-emerald-50 rounded-xl">
                          <h5 className="font-medium text-emerald-800 mb-2">نقاط القوة المشتركة</h5>
                          <ul className="space-y-1">
                            {review.feedback360.summary.commonStrengths.map((item, idx) => (
                              <li key={idx} className="text-sm text-emerald-700 flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {review.feedback360.summary.commonDevelopmentAreas?.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <h5 className="font-medium text-blue-800 mb-2">مجالات التطوير المشتركة</h5>
                          <ul className="space-y-1">
                            {review.feedback360.summary.commonDevelopmentAreas.map((item, idx) => (
                              <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                                <BookOpen className="w-3 h-3" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Manager Assessment Tab */}
          <TabsContent value="manager" className="space-y-6">
            {review.managerAssessment?.completedAt ? (
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      تقييم المدير
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      مكتمل في {formatDate(review.managerAssessment.completedAt)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Rating */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 mb-2">التقييم الكلي</p>
                        {getRatingBadge(review.managerAssessment.overallRating)}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-500 mb-1">تقييم الإمكانات</p>
                        <Badge className={`border-0 ${
                          review.managerAssessment.potentialAssessment === 'high_potential' ? 'bg-emerald-100 text-emerald-700' :
                          review.managerAssessment.potentialAssessment === 'promotable' ? 'bg-blue-100 text-blue-700' :
                          review.managerAssessment.potentialAssessment === 'valued_contributor' ? 'bg-amber-100 text-amber-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {review.managerAssessment.potentialAssessment === 'high_potential' ? 'إمكانات عالية' :
                           review.managerAssessment.potentialAssessment === 'promotable' ? 'قابل للترقية' :
                           review.managerAssessment.potentialAssessment === 'valued_contributor' ? 'مساهم قيم' :
                           'يحتاج تطوير'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-2 gap-4">
                    {review.managerAssessment.strengths?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          نقاط القوة
                        </h4>
                        <ul className="space-y-2">
                          {review.managerAssessment.strengths.map((item, idx) => (
                            <li key={idx} className="p-3 bg-emerald-50 rounded-lg text-sm text-slate-700">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.managerAssessment.areasForImprovement?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          مجالات التحسين
                        </h4>
                        <ul className="space-y-2">
                          {review.managerAssessment.areasForImprovement.map((item, idx) => (
                            <li key={idx} className="p-3 bg-amber-50 rounded-lg text-sm text-slate-700">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {review.managerAssessment.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-navy mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-600" />
                        التوصيات
                      </h4>
                      <div className="space-y-2">
                        {review.managerAssessment.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm text-slate-700">
                              {rec.type === 'promotion' ? 'ترقية' :
                               rec.type === 'salary_increase' ? 'زيادة راتب' :
                               rec.type === 'bonus' ? 'مكافأة' :
                               rec.type === 'training' ? 'تدريب' :
                               rec.type === 'pip' ? 'خطة تحسين' :
                               rec.type === 'lateral_move' ? 'نقل جانبي' :
                               rec.type === 'retention_risk' ? 'خطر استقالة' : 'إنهاء'}
                            </span>
                            <Badge className={`border-0 ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {rec.priority === 'high' ? 'أولوية عالية' :
                               rec.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overall Comments */}
                  {review.managerAssessment.overallComments && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium text-navy mb-2">ملاحظات عامة</h4>
                      <p className="text-slate-700">{review.managerAssessment.overallComments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">لم يكتمل تقييم المدير</h3>
                  <p className="text-slate-500 mb-4">
                    في انتظار إكمال التقييم الذاتي
                  </p>
                  <Button
                    onClick={() => handleSendReminder('manager_review')}
                    variant="outline"
                    className="rounded-xl"
                    disabled={reminderMutation.isPending}
                  >
                    <Send className="w-4 h-4 ms-2" />
                    إرسال تذكير للمدير
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Development Plan Tab */}
          {review.developmentPlan && (
            <TabsContent value="development" className="space-y-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    خطة التطوير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {review.developmentPlan.items?.length > 0 ? (
                    <div className="space-y-4">
                      {review.developmentPlan.items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="font-bold text-navy">{item.objectiveAr || item.objective}</span>
                              <Badge className={`ms-2 border-0 ${
                                item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                item.status === 'deferred' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {item.status === 'completed' ? 'مكتمل' :
                                 item.status === 'in_progress' ? 'قيد التنفيذ' :
                                 item.status === 'deferred' ? 'مؤجل' : 'مخطط'}
                              </Badge>
                            </div>
                            <span className="text-sm text-slate-500">
                              الموعد: {formatDate(item.targetDate)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{item.developmentArea}</p>
                          <Progress value={item.progress} className="h-2 mb-2" />
                          <p className="text-xs text-slate-500 text-start">{item.progress}% مكتمل</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      لم يتم تحديد خطة تطوير بعد
                    </div>
                  )}

                  {/* Career Path */}
                  {review.developmentPlan.careerPath && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                      <h4 className="font-medium text-navy mb-3">المسار الوظيفي</h4>
                      <div className="flex items-center gap-4">
                        <div className="text-center p-3 bg-white rounded-lg flex-1">
                          <p className="text-xs text-slate-500">الوظيفة الحالية</p>
                          <p className="font-medium text-navy">{review.developmentPlan.careerPath.currentRole}</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-purple-400" />
                        <div className="text-center p-3 bg-white rounded-lg flex-1">
                          <p className="text-xs text-slate-500">الوظيفة المستهدفة</p>
                          <p className="font-medium text-purple-600">{review.developmentPlan.careerPath.targetRole}</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <p className="text-xs text-slate-500">الإطار الزمني</p>
                          <p className="font-medium text-navy">{review.developmentPlan.careerPath.timeframe}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
              </>
            )}
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar context="evaluations" />
        </div>
      </Main>

      {/* Acknowledge Dialog */}
      <Dialog open={showAcknowledgeDialog} onOpenChange={setShowAcknowledgeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اعتماد التقييم</DialogTitle>
            <DialogDescription>
              قم بمراجعة التقييم والاعتماد عليه. يمكنك إضافة ملاحظات أو رفع اعتراض.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="acknowledgementComments">ملاحظات الموظف</Label>
              <Textarea
                id="acknowledgementComments"
                value={acknowledgementComments}
                onChange={(e) => setAcknowledgementComments(e.target.value)}
                placeholder="أي ملاحظات على التقييم..."
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
              <input
                type="checkbox"
                id="disputeRaised"
                checked={disputeRaised}
                onChange={(e) => setDisputeRaised(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="disputeRaised" className="text-amber-700">
                أرغب في رفع اعتراض على التقييم
              </Label>
            </div>
            {disputeRaised && (
              <div className="space-y-2">
                <Label htmlFor="disputeReason">سبب الاعتراض *</Label>
                <Textarea
                  id="disputeReason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="اذكر سبب اعتراضك على التقييم..."
                  className="rounded-xl"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcknowledgeDialog(false)} className="rounded-xl">
              تراجع
            </Button>
            <Button
              onClick={handleAcknowledge}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              disabled={acknowledgeMutation.isPending || (disputeRaised && !disputeReason.trim())}
            >
              {acknowledgeMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد التقييم'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
