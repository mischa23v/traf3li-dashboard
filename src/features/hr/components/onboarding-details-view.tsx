import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams, Link } from '@tanstack/react-router'
import { useOnboarding, useUpdateOnboardingStatus, useCompleteFirstDay, useCompleteFirstWeek, useCompleteFirstMonth, useCompleteOnboarding, useDeleteOnboarding } from '@/hooks/useOnboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Bell, ArrowRight, User, AlertCircle, Calendar, Clock,
  CheckCircle, Target, ClipboardList, Edit, Trash2, MoreVertical,
  PlayCircle, PauseCircle, Award, FileText, Users, Briefcase,
  Building2, Mail, Phone, Check, X, Flag
} from 'lucide-react'
import {
  ONBOARDING_STATUS_LABELS,
  PROBATION_STATUS_LABELS,
  TASK_STATUS_LABELS,
  type OnboardingStatus,
  type ProbationStatus,
  type TaskStatus,
} from '@/services/onboardingService'

export function OnboardingDetailsView() {
  const navigate = useNavigate()
  const { onboardingId } = useParams({ strict: false })
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch onboarding
  const { data: onboarding, isLoading, isError, refetch } = useOnboarding(onboardingId || '')

  // Mutations
  const updateStatusMutation = useUpdateOnboardingStatus()
  const completeFirstDayMutation = useCompleteFirstDay()
  const completeFirstWeekMutation = useCompleteFirstWeek()
  const completeFirstMonthMutation = useCompleteFirstMonth()
  const completeOnboardingMutation = useCompleteOnboarding()
  const deleteOnboardingMutation = useDeleteOnboarding()

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Status badge
  const getStatusBadge = (status: OnboardingStatus) => {
    const config = ONBOARDING_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
      slate: 'bg-slate-100 text-slate-600',
    }
    return <Badge className={`${colorClasses[config.color]} border-0 rounded-lg`}>{config.ar}</Badge>
  }

  // Probation badge
  const getProbationBadge = (status: ProbationStatus) => {
    const config = PROBATION_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
    }
    return <Badge className={`${colorClasses[config.color]} border-0 rounded-lg`}>{config.ar}</Badge>
  }

  // Handle status change
  const handleStatusChange = async (status: OnboardingStatus) => {
    if (!onboardingId) return
    await updateStatusMutation.mutateAsync({ onboardingId, status })
  }

  // Handle delete
  const handleDelete = async () => {
    if (!onboardingId) return
    if (confirm('هل أنت متأكد من حذف برنامج التأهيل هذا؟')) {
      await deleteOnboardingMutation.mutateAsync(onboardingId)
      navigate({ to: '/dashboard/hr/onboarding' })
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التأهيل', href: '/dashboard/hr/onboarding', isActive: true },
  ]

  return (
    <>
      {/* Header */}
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل البيانات</h3>
            <p className="text-slate-500 mb-4">تعذر الاتصال بالخادم</p>
            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !onboarding && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">برنامج التأهيل غير موجود</h3>
            <p className="text-slate-500 mb-4">لم يتم العثور على البرنامج المطلوب</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to="/dashboard/hr/onboarding">
                العودة إلى القائمة
              </Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && onboarding && (
          <>
            {/* HERO CARD */}
            <ProductivityHero
              badge="الموارد البشرية"
              title={onboarding.employeeNameAr || onboarding.employeeName}
              type="employees"
              listMode={true}
            />

            {/* MAIN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* RIGHT COLUMN (Main Content) */}
              <div className="lg:col-span-2 space-y-6">

                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-white"
                      onClick={() => navigate({ to: '/dashboard/hr/onboarding' })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-2xl">
                        {(onboarding.employeeNameAr || onboarding.employeeName).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-navy">
                          {onboarding.employeeNameAr || onboarding.employeeName}
                        </h1>
                        {getStatusBadge(onboarding.status)}
                      </div>
                      <p className="text-slate-500">
                        {onboarding.jobTitleAr || onboarding.jobTitle} • {onboarding.onboardingNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {onboarding.status === 'in_progress' && (
                      <Button
                        onClick={() => completeOnboardingMutation.mutate(onboarding._id)}
                        disabled={completeOnboardingMutation.isPending}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4 ms-2" />
                        إكمال التأهيل
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: '/dashboard/hr/onboarding/new', search: { editId: onboarding._id } })}>
                          <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                          تعديل
                        </DropdownMenuItem>
                        {onboarding.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                            <PlayCircle className="w-4 h-4 ms-2" />
                            بدء التأهيل
                          </DropdownMenuItem>
                        )}
                        {onboarding.status === 'in_progress' && (
                          <DropdownMenuItem onClick={() => handleStatusChange('on_hold')}>
                            <PauseCircle className="w-4 h-4 ms-2" />
                            تعليق
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Progress Overview */}
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-navy text-lg">تقدم التأهيل</h3>
                        <p className="text-slate-500 text-sm">
                          {onboarding.completion.tasksCompleted} من {onboarding.completion.tasksTotal} مهمة مكتملة
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-navy">{onboarding.completion.completionPercentage}%</span>
                      </div>
                    </div>
                    <Progress value={onboarding.completion.completionPercentage} className="h-3" />
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">تاريخ البدء</p>
                          <p className="text-sm font-bold text-navy">{formatDate(onboarding.startDate)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                          <Target className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">تاريخ الإكمال المستهدف</p>
                          <p className="text-sm font-bold text-navy">{formatDate(onboarding.completionTargetDate)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">فترة التجربة</p>
                          <p className="text-sm font-bold text-navy">{onboarding.probation.probationPeriod} يوم</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                          <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">حالة التجربة</p>
                          {getProbationBadge(onboarding.probation.probationStatus)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="bg-white rounded-xl p-1 h-auto flex-wrap">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      نظرة عامة
                    </TabsTrigger>
                    <TabsTrigger value="milestones" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      المراحل
                    </TabsTrigger>
                    <TabsTrigger value="probation" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      فترة التجربة
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      المستندات
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Employee Info */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                            معلومات الموظف
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">الاسم</span>
                            <span className="font-medium text-navy">{onboarding.employeeNameAr || onboarding.employeeName}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">المسمى الوظيفي</span>
                            <span className="font-medium text-navy">{onboarding.jobTitleAr || onboarding.jobTitle}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">القسم</span>
                            <span className="font-medium text-navy">{onboarding.department || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500">المدير المباشر</span>
                            <span className="font-medium text-navy">{onboarding.managerName}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Probation Info */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                            فترة التجربة
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">المدة</span>
                            <span className="font-medium text-navy">{onboarding.probation.probationPeriod} يوم</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">تاريخ البدء</span>
                            <span className="font-medium text-navy">{formatDate(onboarding.probation.probationStartDate)}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-slate-500">تاريخ الانتهاء</span>
                            <span className="font-medium text-navy">{formatDate(onboarding.probation.probationEndDate)}</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500">الحالة</span>
                            {getProbationBadge(onboarding.probation.probationStatus)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Milestones Tab */}
                  <TabsContent value="milestones" className="space-y-4">
                    <div className="space-y-4">
                      {/* First Day */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                              <Flag className="w-4 h-4 text-blue-600" />
                              اليوم الأول
                            </CardTitle>
                            {onboarding.firstDay?.firstDayComplete ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">مكتمل</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => completeFirstDayMutation.mutate(onboarding._id)}
                                disabled={completeFirstDayMutation.isPending}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                              >
                                <Check className="w-4 h-4 ms-1" aria-hidden="true" />
                                إكمال
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {onboarding.firstDay?.arrival?.welcomed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>الترحيب</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onboarding.firstDay?.idBadge?.issued ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>البطاقة التعريفية</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onboarding.firstDay?.orientation?.completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>التوجيه</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onboarding.firstDay?.teamIntroduction?.completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>تعريف الفريق</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* First Week */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-600" aria-hidden="true" />
                              الأسبوع الأول
                            </CardTitle>
                            {onboarding.firstWeek?.firstWeekComplete ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">مكتمل</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => completeFirstWeekMutation.mutate(onboarding._id)}
                                disabled={completeFirstWeekMutation.isPending || !onboarding.firstDay?.firstDayComplete}
                                className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                              >
                                <Check className="w-4 h-4 ms-1" aria-hidden="true" />
                                إكمال
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {onboarding.firstWeek?.laborLawTraining?.completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>تدريب نظام العمل</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onboarding.firstWeek?.systemsTraining?.allTrainingsCompleted ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>تدريب الأنظمة</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onboarding.firstWeek?.roleClarification?.completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>توضيح الدور</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* First Month */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                              <Target className="w-4 h-4 text-emerald-600" />
                              الشهر الأول
                            </CardTitle>
                            {onboarding.firstMonth?.firstMonthComplete ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">مكتمل</Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => completeFirstMonthMutation.mutate(onboarding._id)}
                                disabled={completeFirstMonthMutation.isPending || !onboarding.firstWeek?.firstWeekComplete}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                              >
                                <Check className="w-4 h-4 ms-1" aria-hidden="true" />
                                إكمال
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {onboarding.firstMonth?.roleSpecificTraining?.allTrainingCompleted ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>التدريب التخصصي</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onboarding.firstMonth?.initialFeedback?.conducted ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
                              )}
                              <span>التقييم الأولي</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Probation Tab */}
                  <TabsContent value="probation" className="space-y-4">
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          تقييمات فترة التجربة
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {onboarding.probationTracking?.probationReviews && onboarding.probationTracking.probationReviews.length > 0 ? (
                          <div className="space-y-4">
                            {onboarding.probationTracking.probationReviews.map((review, index) => (
                              <div key={index} className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-navy">
                                    تقييم {review.reviewType === '30_day' ? '30 يوم' :
                                           review.reviewType === '60_day' ? '60 يوم' :
                                           review.reviewType === '90_day' ? '90 يوم' :
                                           review.reviewType === 'final' ? 'نهائي' : review.reviewType}
                                  </span>
                                  <Badge className={review.conducted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                    {review.conducted ? 'مكتمل' : 'مجدول'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500">
                                  {formatDate(review.conductedDate || review.scheduledDate)}
                                </p>
                                {review.conducted && (
                                  <div className="mt-2 text-sm">
                                    <span className="text-slate-500">التقييم العام: </span>
                                    <span className="font-medium text-navy">{review.performanceAssessment?.overallRating}/5</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد تقييمات</h3>
                            <p className="text-slate-500">لم يتم إجراء أي تقييمات بعد</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-4">
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                          المستندات المطلوبة
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {onboarding.preBoarding?.documentsCollection?.documentsRequired &&
                         onboarding.preBoarding.documentsCollection.documentsRequired.length > 0 ? (
                          <div className="space-y-3">
                            {onboarding.preBoarding.documentsCollection.documentsRequired.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                  <div>
                                    <p className="font-medium text-navy">{doc.documentNameAr || doc.documentName}</p>
                                    {doc.required && <span className="text-xs text-red-500">مطلوب</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {doc.submitted ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0">مُقدم</Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700 border-0">غير مُقدم</Badge>
                                  )}
                                  {doc.verified && (
                                    <Badge className="bg-blue-100 text-blue-700 border-0">موثق</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" aria-hidden="true" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد مستندات</h3>
                            <p className="text-slate-500">لم يتم تحديد أي مستندات مطلوبة</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* LEFT COLUMN (Widgets) */}
              <HRSidebar context="employees" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
