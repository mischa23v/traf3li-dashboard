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
  useSuccessionPlan,
  useDeleteSuccessionPlan,
  useSubmitForApproval,
  useApproveSuccessionPlan,
} from '@/hooks/useSuccessionPlanning'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Search, Bell, ArrowRight, User, Calendar,
  AlertCircle, Loader2, Users, Target,
  Trash2, Edit, MoreHorizontal, AlertTriangle,
  TrendingUp, CheckCircle, Clock, Shield,
  Briefcase, BookOpen, Award, UserCheck,
  BarChart3, Send, ThumbsUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  positionCriticalityLabels,
  riskLevelLabels,
  planStatusLabels,
  planTypeLabels,
  planScopeLabels,
  reviewCycleLabels,
  readinessLevelLabels,
  performanceRatingLabels,
  potentialRatingLabels,
  retentionRiskLabels,
  transferStatusLabels,
  benchStrengthScoreLabels,
  partnerTrackLabels,
  PositionCriticality,
  RiskLevel,
  PlanStatus,
  ReadinessLevel,
  BenchStrengthScore,
} from '@/services/successionPlanningService'

export function SuccessionPlanningDetailsView() {
  const navigate = useNavigate()
  const { planId } = useParams({ strict: false })

  const { data: plan, isLoading, error } = useSuccessionPlan(planId || '')
  const deleteMutation = useDeleteSuccessionPlan()
  const submitMutation = useSubmitForApproval()
  const approveMutation = useApproveSuccessionPlan()

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'تخطيط التعاقب', href: '/dashboard/hr/succession-planning', isActive: true },
  ]

  const getCriticalityColor = (criticality: PositionCriticality) => {
    const colors: Record<PositionCriticality, string> = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    }
    return colors[criticality]
  }

  const getRiskColor = (risk: RiskLevel) => {
    const colors: Record<RiskLevel, string> = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return colors[risk]
  }

  const getStatusColor = (status: PlanStatus) => {
    const colors: Record<PlanStatus, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      under_review: 'bg-blue-100 text-blue-700 border-blue-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-purple-100 text-purple-700 border-purple-200',
      archived: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const getReadinessColor = (readiness: ReadinessLevel) => {
    const colors: Record<ReadinessLevel, string> = {
      ready_now: 'bg-emerald-100 text-emerald-700',
      ready_1_year: 'bg-blue-100 text-blue-700',
      ready_2_years: 'bg-indigo-100 text-indigo-700',
      ready_3_plus_years: 'bg-purple-100 text-purple-700',
      not_ready: 'bg-slate-100 text-slate-700',
    }
    return colors[readiness]
  }

  const getBenchStrengthColor = (score: BenchStrengthScore) => {
    const colors: Record<BenchStrengthScore, string> = {
      strong: 'text-emerald-600',
      adequate: 'text-blue-600',
      weak: 'text-amber-600',
      critical: 'text-red-600',
    }
    return colors[score]
  }

  const handleSubmitForApproval = async () => {
    if (!planId) return
    await submitMutation.mutateAsync(planId)
  }

  const handleApprove = async () => {
    if (!planId) return
    await approveMutation.mutateAsync({ id: planId })
  }

  const handleDelete = async () => {
    if (!planId) return
    if (confirm('هل أنت متأكد من حذف خطة التعاقب هذه؟')) {
      await deleteMutation.mutateAsync(planId)
      navigate({ to: '/dashboard/hr/succession-planning' })
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
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
          title="تفاصيل خطة التعاقب"
          type="succession-planning"
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
            ) : error || !plan ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
                  <p className="text-red-600">حدث خطأ في تحميل بيانات الخطة</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/succession-planning' })}
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
                      onClick={() => navigate({ to: '/dashboard/hr/succession-planning' })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-navy">
                          {plan.positionTitle}
                        </h1>
                        <Badge className={getStatusColor(plan.planStatus)}>
                          {planStatusLabels[plan.planStatus]?.ar}
                        </Badge>
                      </div>
                      <p className="text-slate-500">
                        {plan.planNumber} - {plan.incumbentName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.planStatus === PlanStatus.DRAFT && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSubmitForApproval}
                        disabled={submitMutation.isPending}
                        className="rounded-xl"
                      >
                        <Send className="w-4 h-4 ms-1" />
                        تقديم للموافقة
                      </Button>
                    )}
                    {plan.planStatus === PlanStatus.UNDER_REVIEW && (
                      <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <ThumbsUp className="w-4 h-4 ms-1" />
                        اعتماد
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/succession-planning/new?editId=${planId}` })}>
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

                {/* Risk & Criticality Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">أهمية المنصب</p>
                          <Badge className={getCriticalityColor(plan.positionCriticality)}>
                            {positionCriticalityLabels[plan.positionCriticality]?.ar}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                          <Shield className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">مستوى المخاطر</p>
                          <Badge className={getRiskColor(plan.riskLevel)}>
                            {riskLevelLabels[plan.riskLevel]?.ar}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">الخلفاء</p>
                          <p className="text-lg font-bold text-navy">{plan.successorsCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <UserCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">جاهزون الآن</p>
                          <p className="text-lg font-bold text-navy">{plan.readyNowCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="bg-white rounded-xl p-1 border border-slate-200">
                    <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="successors" className="rounded-lg">الخلفاء</TabsTrigger>
                    <TabsTrigger value="incumbent" className="rounded-lg">الشاغل الحالي</TabsTrigger>
                    <TabsTrigger value="analysis" className="rounded-lg">التحليل</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Target className="w-5 h-5 text-emerald-500" />
                          معلومات الخطة
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">رقم الخطة</p>
                            <p className="font-medium">{plan.planNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">نوع الخطة</p>
                            <p className="font-medium">{planTypeLabels[plan.planDetails?.planType || 'individual']?.ar}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">نطاق الخطة</p>
                            <p className="font-medium">{planScopeLabels[plan.planDetails?.planScope || 'single_position']?.ar}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">دورة المراجعة</p>
                            <p className="font-medium">{reviewCycleLabels[plan.planDetails?.reviewCycle || 'annual']?.ar}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">تاريخ السريان</p>
                            <p className="font-medium">{new Date(plan.effectiveDate).toLocaleDateString('ar-SA')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">المراجعة القادمة</p>
                            <p className="font-medium">
                              {plan.nextReviewDate ? new Date(plan.nextReviewDate).toLocaleDateString('ar-SA') : '-'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bench Strength */}
                    {plan.benchStrength && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" aria-hidden="true" />
                            قوة البدلاء
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-8 mb-6">
                            <div className="flex-1">
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-600">تقييم القوة</span>
                                <span className={`font-bold ${getBenchStrengthColor(plan.benchStrength.benchStrengthScore)}`}>
                                  {benchStrengthScoreLabels[plan.benchStrength.benchStrengthScore]?.ar}
                                </span>
                              </div>
                              <Progress
                                value={
                                  plan.benchStrength.benchStrengthScore === 'strong' ? 100 :
                                  plan.benchStrength.benchStrengthScore === 'adequate' ? 66 :
                                  plan.benchStrength.benchStrengthScore === 'weak' ? 33 : 10
                                }
                                className="h-3"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-emerald-50 rounded-xl">
                              <p className="text-2xl font-bold text-emerald-700">{plan.benchStrength.readyNowCount}</p>
                              <p className="text-xs text-emerald-600">جاهزون الآن</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl">
                              <p className="text-2xl font-bold text-blue-700">{plan.benchStrength.readyIn1To2Years}</p>
                              <p className="text-xs text-blue-600">خلال 1-2 سنة</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl">
                              <p className="text-2xl font-bold text-purple-700">{plan.benchStrength.readyIn3To5Years}</p>
                              <p className="text-xs text-purple-600">خلال 3-5 سنوات</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Knowledge Transfer */}
                    {plan.knowledgeTransfer && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-cyan-500" />
                            نقل المعرفة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-600">حالة النقل</span>
                            <Badge className="bg-blue-100 text-blue-700">
                              {transferStatusLabels[plan.knowledgeTransfer.transferStatus]?.ar}
                            </Badge>
                          </div>
                          {plan.knowledgeTransfer.knowledgeDocumentation && (
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-slate-500">توثيق العمليات</span>
                                  <span className="text-xs font-medium">{plan.knowledgeTransfer.knowledgeDocumentation.processDocumented}%</span>
                                </div>
                                <Progress value={plan.knowledgeTransfer.knowledgeDocumentation.processDocumented} className="h-2" />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Successors Tab */}
                  <TabsContent value="successors" className="space-y-4">
                    {plan.successors && plan.successors.length > 0 ? (
                      plan.successors.map((successor, index) => (
                        <Card key={successor.successorId} className="rounded-2xl border-slate-100">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                {successor.successorRanking}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h3 className="font-bold text-navy flex items-center gap-2">
                                      {successor.name}
                                      {successor.isPrimarySuccessor && (
                                        <Badge className="bg-amber-100 text-amber-700">أساسي</Badge>
                                      )}
                                    </h3>
                                    <p className="text-sm text-slate-500">{successor.currentPosition}</p>
                                  </div>
                                  <Badge className={getReadinessColor(successor.readinessLevel)}>
                                    {readinessLevelLabels[successor.readinessLevel]?.ar}
                                  </Badge>
                                </div>

                                {successor.qualificationsMatch && (
                                  <div className="grid grid-cols-4 gap-2 mt-4">
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                      <p className="text-lg font-bold text-navy">{successor.qualificationsMatch.overallMatch}%</p>
                                      <p className="text-xs text-slate-500">مطابقة إجمالية</p>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                      <p className="text-lg font-bold text-navy">{successor.qualificationsMatch.skillsMatch}%</p>
                                      <p className="text-xs text-slate-500">المهارات</p>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                      <p className="text-lg font-bold text-navy">{successor.qualificationsMatch.experienceMatch}%</p>
                                      <p className="text-xs text-slate-500">الخبرة</p>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                      <p className="text-lg font-bold text-navy">{successor.qualificationsMatch.educationMatch}%</p>
                                      <p className="text-xs text-slate-500">التعليم</p>
                                    </div>
                                  </div>
                                )}

                                {successor.developmentPlan && (
                                  <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-blue-700">خطة التطوير</span>
                                      <span className="text-sm text-blue-600">{successor.developmentPlan.progressPercentage}%</span>
                                    </div>
                                    <Progress value={successor.developmentPlan.progressPercentage} className="h-2" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="rounded-2xl border-slate-100">
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-500">لم تتم إضافة خلفاء بعد</p>
                          <Button
                            onClick={() => navigate({ to: `/dashboard/hr/succession-planning/new?editId=${planId}` })}
                            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                          >
                            إضافة خلفاء
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Incumbent Tab */}
                  <TabsContent value="incumbent" className="space-y-6">
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <User className="w-5 h-5 text-orange-500" />
                          معلومات الشاغل الحالي
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                            <User className="w-8 h-8 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-navy">{plan.incumbentName}</h3>
                            <p className="text-slate-500">{plan.positionTitle}</p>
                          </div>
                        </div>

                        {plan.incumbent && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">سنوات في المنصب</p>
                              <p className="text-lg font-bold text-navy">{plan.incumbent.yearsInRole || 0}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">مستوى الأداء</p>
                              <Badge className="bg-blue-100 text-blue-700">
                                {performanceRatingLabels[plan.incumbent.currentPerformance || 'meets']?.ar}
                              </Badge>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الإمكانات</p>
                              <Badge className="bg-purple-100 text-purple-700">
                                {potentialRatingLabels[plan.incumbent.currentPotential || 'medium']?.ar}
                              </Badge>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">مخاطر الاستبقاء</p>
                              <Badge className={getRiskColor(plan.incumbent.retentionRisk || 'low')}>
                                {retentionRiskLabels[plan.incumbent.retentionRisk || 'low']?.ar}
                              </Badge>
                            </div>
                            {plan.incumbent.retirementEligibility && (
                              <>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">أهلية التقاعد</p>
                                  <p className="font-medium">
                                    {plan.incumbent.retirementEligibility.isEligible ? 'مؤهل' : 'غير مؤهل'}
                                  </p>
                                </div>
                                {plan.incumbent.retirementEligibility.eligibilityDate && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">تاريخ أهلية التقاعد</p>
                                    <p className="font-medium">
                                      {new Date(plan.incumbent.retirementEligibility.eligibilityDate).toLocaleDateString('ar-SA')}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Law Firm Succession */}
                    {plan.lawFirmSuccession && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            تفاصيل مكتب المحاماة
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {plan.lawFirmSuccession.partnerSuccession && (
                              <div className="p-4 bg-amber-50 rounded-xl">
                                <p className="text-xs text-amber-600 mb-1">مسار الشراكة</p>
                                <p className="font-bold text-amber-700">
                                  {partnerTrackLabels[plan.lawFirmSuccession.partnerSuccession.partnerTrack]?.ar}
                                </p>
                              </div>
                            )}
                            {plan.lawFirmSuccession.bookOfBusinessTransition && (
                              <>
                                <div className="p-4 bg-green-50 rounded-xl">
                                  <p className="text-xs text-green-600 mb-1">قيمة محفظة العملاء</p>
                                  <p className="font-bold text-green-700">
                                    {plan.lawFirmSuccession.bookOfBusinessTransition.totalBookValue?.toLocaleString()} ر.س
                                  </p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl">
                                  <p className="text-xs text-blue-600 mb-1">عملاء للنقل</p>
                                  <p className="font-bold text-blue-700">
                                    {plan.lawFirmSuccession.bookOfBusinessTransition.clientsToTransition}
                                  </p>
                                </div>
                              </>
                            )}
                            {plan.lawFirmSuccession.practiceAreaContinuity && (
                              <div className="p-4 bg-purple-50 rounded-xl col-span-2 md:col-span-3">
                                <p className="text-xs text-purple-600 mb-1">مجال الممارسة الرئيسي</p>
                                <p className="font-bold text-purple-700">
                                  {plan.lawFirmSuccession.practiceAreaContinuity.primaryPracticeArea}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Analysis Tab */}
                  <TabsContent value="analysis" className="space-y-6">
                    {/* Criticality Assessment */}
                    {plan.criticalPosition?.criticalityAssessment && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-red-500" />
                            تقييم الأهمية
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-600">الأهمية الاستراتيجية</span>
                                <span className="text-sm font-medium">{plan.criticalPosition.criticalityAssessment.strategicImportance}/10</span>
                              </div>
                              <Progress value={plan.criticalPosition.criticalityAssessment.strategicImportance * 10} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-600">الخبرة الفريدة</span>
                                <span className="text-sm font-medium">{plan.criticalPosition.criticalityAssessment.uniqueExpertise}/10</span>
                              </div>
                              <Progress value={plan.criticalPosition.criticalityAssessment.uniqueExpertise * 10} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-600">علاقات العملاء</span>
                                <span className="text-sm font-medium">{plan.criticalPosition.criticalityAssessment.clientRelationships}/10</span>
                              </div>
                              <Progress value={plan.criticalPosition.criticalityAssessment.clientRelationships * 10} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-600">تأثير الإيرادات</span>
                                <span className="text-sm font-medium">{plan.criticalPosition.criticalityAssessment.revenueImpact}/10</span>
                              </div>
                              <Progress value={plan.criticalPosition.criticalityAssessment.revenueImpact * 10} className="h-2" />
                            </div>
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                              <p className="text-sm font-medium text-slate-700 mb-1">النتيجة الإجمالية</p>
                              <p className="text-3xl font-bold text-navy">
                                {plan.criticalPosition.criticalityAssessment.overallCriticalityScore}/10
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Emergency Succession */}
                    {plan.emergencySuccession && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-500" />
                            خطة الطوارئ
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الخليفة المؤقت</p>
                              <p className="font-medium">{plan.emergencySuccession.interimSuccessorName || 'غير محدد'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">جاهزية الخليفة المؤقت</p>
                              <Badge className={getReadinessColor(plan.emergencySuccession.interimReadiness)}>
                                {readinessLevelLabels[plan.emergencySuccession.interimReadiness]?.ar}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            {plan.emergencySuccession.emergencyPlan?.planDocumented ? (
                              <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle className="w-5 h-5" />
                                <span>خطة الطوارئ موثقة</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-600">
                                <AlertCircle className="w-5 h-5" aria-hidden="true" />
                                <span>خطة الطوارئ غير موثقة</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Metrics */}
                    {plan.metrics && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" aria-hidden="true" />
                            المؤشرات والمقاييس
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {plan.metrics.successorRetentionRate !== undefined && (
                              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                                <p className="text-2xl font-bold text-emerald-700">{plan.metrics.successorRetentionRate}%</p>
                                <p className="text-xs text-emerald-600">نسبة استبقاء الخلفاء</p>
                              </div>
                            )}
                            {plan.metrics.averageTimeToReadiness !== undefined && (
                              <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <p className="text-2xl font-bold text-blue-700">{plan.metrics.averageTimeToReadiness}</p>
                                <p className="text-xs text-blue-600">متوسط وقت الجاهزية (شهر)</p>
                              </div>
                            )}
                            {plan.metrics.planEffectivenessScore !== undefined && (
                              <div className="text-center p-4 bg-purple-50 rounded-xl">
                                <p className="text-2xl font-bold text-purple-700">{plan.metrics.planEffectivenessScore}</p>
                                <p className="text-xs text-purple-600">فعالية الخطة</p>
                              </div>
                            )}
                            {plan.metrics.developmentGoalsAchieved !== undefined && (
                              <div className="text-center p-4 bg-amber-50 rounded-xl">
                                <p className="text-2xl font-bold text-amber-700">{plan.metrics.developmentGoalsAchieved}%</p>
                                <p className="text-xs text-amber-600">أهداف التطوير المحققة</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Notes */}
                {plan.notes && plan.notes.length > 0 && (
                  <Card className="rounded-2xl border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-500" aria-hidden="true" />
                        ملاحظات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {plan.notes.map((note) => (
                          <div key={note.noteId} className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-slate-700">{note.content}</p>
                            <p className="text-xs text-slate-600 mt-2">
                              {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="succession-planning" />
        </div>
      </Main>
    </>
  )
}
