import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useJobPosting, useJobApplicants, usePublishJobPosting, useCloseJobPosting, useHoldJobPosting } from '@/hooks/useRecruitment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search, Bell, ArrowRight, Users, AlertCircle, Eye,
  Briefcase, MapPin, Clock, CheckCircle, FileText, Building2,
  UserPlus, Globe, PauseCircle, XCircle, TrendingUp, Calendar,
  DollarSign, Zap, GraduationCap, Award, Target, Edit,
  Copy, MoreVertical, Mail, Star, Languages
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  JOB_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  SENIORITY_LABELS,
  EDUCATION_LABELS,
  APPLICANT_STATUS_LABELS,
  type Urgency,
} from '@/services/recruitmentService'

// Urgency labels
const URGENCY_LABELS: Record<Urgency, { ar: string; en: string; color: string }> = {
  low: { ar: 'منخفضة', en: 'Low', color: 'slate' },
  medium: { ar: 'متوسطة', en: 'Medium', color: 'blue' },
  high: { ar: 'عالية', en: 'High', color: 'amber' },
  critical: { ar: 'حرجة', en: 'Critical', color: 'red' },
}

// Work location labels
const WORK_LOCATION_LABELS: Record<string, string> = {
  office: 'من المكتب',
  remote: 'عن بُعد',
  hybrid: 'هجين',
}

export function JobPostingDetailsView() {
  const navigate = useNavigate()
  const { jobId } = useParams({ strict: false })
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch job posting
  const { data: job, isLoading, isError } = useJobPosting(jobId || '')

  // Fetch applicants
  const { data: applicantsData } = useJobApplicants(jobId || '')

  // Mutations
  const publishMutation = usePublishJobPosting()
  const closeMutation = useCloseJobPosting()
  const holdMutation = useHoldJobPosting()

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Format salary
  const formatSalary = (salary?: { salaryMin?: number; salaryMax?: number; showSalary: boolean }) => {
    if (!salary || !salary.showSalary) return 'غير محدد'
    if (salary.salaryMin && salary.salaryMax) {
      return `${salary.salaryMin.toLocaleString()} - ${salary.salaryMax.toLocaleString()} ر.س`
    }
    if (salary.salaryMin) return `من ${salary.salaryMin.toLocaleString()} ر.س`
    if (salary.salaryMax) return `حتى ${salary.salaryMax.toLocaleString()} ر.س`
    return 'غير محدد'
  }

  // Handle publish
  const handlePublish = async () => {
    if (!jobId) return
    await publishMutation.mutateAsync(jobId)
  }

  // Handle close
  const handleClose = async () => {
    if (!jobId) return
    await closeMutation.mutateAsync({ jobId })
  }

  // Handle hold
  const handleHold = async () => {
    if (!jobId) return
    await holdMutation.mutateAsync({ jobId })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التوظيف', href: '/dashboard/hr/recruitment/jobs', isActive: true },
  ]

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
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </Main>
      </>
    )
  }

  if (isError || !job) {
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
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">حدث خطأ</h3>
            <p className="text-slate-500">فشل في تحميل تفاصيل الوظيفة</p>
            <Button
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs' })}
              className="mt-4"
            >
              العودة للوظائف
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const statusConfig = JOB_STATUS_LABELS[job.status]
  const urgencyConfig = URGENCY_LABELS[job.urgency]

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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-white"
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs' })}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-navy">{job.jobTitleAr || job.jobTitle}</h1>
                <Badge className={`${
                  statusConfig.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  statusConfig.color === 'red' ? 'bg-red-100 text-red-700' :
                  statusConfig.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                } border-0 rounded-lg`}>
                  {statusConfig.ar}
                </Badge>
              </div>
              <p className="text-slate-500">
                {job.departmentNameAr || job.departmentName} • {job.location} • {job.jobPostingNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {job.status === 'draft' && (
              <Button
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                <Globe className="w-4 h-4 ms-2" />
                نشر الوظيفة
              </Button>
            )}
            {job.status === 'published' && (
              <Button
                onClick={handleHold}
                disabled={holdMutation.isPending}
                variant="outline"
                className="rounded-xl"
              >
                <PauseCircle className="w-4 h-4 ms-2" />
                تعليق
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 ms-2" />
                  نسخ
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClose} className="text-red-600">
                  <XCircle className="w-4 h-4 ms-2" />
                  إغلاق الوظيفة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">المتقدمين</p>
                  <p className="text-xl font-bold text-navy">{job.applicationsCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">الشواغر</p>
                  <p className="text-xl font-bold text-navy">{job.positions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  urgencyConfig.color === 'red' ? 'bg-red-50' :
                  urgencyConfig.color === 'amber' ? 'bg-amber-50' :
                  urgencyConfig.color === 'blue' ? 'bg-blue-50' :
                  'bg-slate-50'
                }`}>
                  <Zap className={`w-5 h-5 ${
                    urgencyConfig.color === 'red' ? 'text-red-600' :
                    urgencyConfig.color === 'amber' ? 'text-amber-600' :
                    urgencyConfig.color === 'blue' ? 'text-blue-600' :
                    'text-slate-600'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">الأولوية</p>
                  <p className="text-xl font-bold text-navy">{urgencyConfig.ar}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">تاريخ النشر</p>
                  <p className="text-sm font-bold text-navy">{formatDate(job.postedDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">تاريخ الإغلاق</p>
                  <p className="text-sm font-bold text-navy">{formatDate(job.closingDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white rounded-xl p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="requirements" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              المتطلبات
            </TabsTrigger>
            <TabsTrigger value="compensation" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              الراتب والمزايا
            </TabsTrigger>
            <TabsTrigger value="process" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              مراحل التوظيف
            </TabsTrigger>
            <TabsTrigger value="applicants" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              المتقدمين
              {applicantsData?.total ? (
                <span className="ms-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-xs">
                  {applicantsData.total}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Job Description */}
              <Card className="border-none shadow-sm bg-white rounded-2xl lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    وصف الوظيفة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-bold text-navy mb-2">ملخص الوظيفة</h4>
                    <p className="text-slate-600 leading-relaxed">
                      {job.jobDescription?.summaryAr || job.jobDescription?.summary || 'لا يوجد وصف'}
                    </p>
                  </div>
                  {job.jobDescription?.responsibilities && job.jobDescription.responsibilities.length > 0 && (
                    <div>
                      <h4 className="font-bold text-navy mb-2">المسؤوليات</h4>
                      <ul className="space-y-2">
                        {job.jobDescription.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                            <span className="text-slate-600">{resp.responsibilityAr || resp.responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    تفاصيل الوظيفة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Building2 className="w-4 h-4" aria-hidden="true" />
                      القسم
                    </span>
                    <span className="font-medium text-navy">{job.departmentNameAr || job.departmentName}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      الموقع
                    </span>
                    <span className="font-medium text-navy">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" aria-hidden="true" />
                      نوع التوظيف
                    </span>
                    <span className="font-medium text-navy">{EMPLOYMENT_TYPE_LABELS[job.employmentType]?.ar}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      المستوى
                    </span>
                    <span className="font-medium text-navy">{SENIORITY_LABELS[job.seniorityLevel]?.ar}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      مكان العمل
                    </span>
                    <span className="font-medium text-navy">{WORK_LOCATION_LABELS[job.workLocation]}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      الراتب
                    </span>
                    <span className="font-medium text-navy">{formatSalary(job.salary)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Education & Experience */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    التعليم والخبرة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 bg-slate-50 rounded-xl px-4">
                    <span className="text-slate-600">الحد الأدنى للتعليم</span>
                    <Badge className="bg-blue-100 text-blue-700 border-0">
                      {EDUCATION_LABELS[job.requirements?.minimumEducation]?.ar || job.requirements?.minimumEducation}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 bg-slate-50 rounded-xl px-4">
                    <span className="text-slate-600">سنوات الخبرة</span>
                    <span className="font-bold text-navy">
                      {job.requirements?.minimumExperience} - {job.requirements?.maximumExperience || '+'} سنوات
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    المهارات المطلوبة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements?.skills?.map((skill, index) => (
                      <Badge
                        key={index}
                        className={`border-0 rounded-lg ${
                          skill.required
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {skill.nameAr || skill.name}
                        {skill.required && <span className="ms-1">*</span>}
                      </Badge>
                    )) || <p className="text-slate-500">لا توجد مهارات محددة</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              {job.requirements?.languages && job.requirements.languages.length > 0 && (
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Languages className="w-4 h-4 text-emerald-600" />
                      اللغات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {job.requirements.languages.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="font-medium text-navy">{lang.language}</span>
                          <div className="flex gap-2">
                            <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                              قراءة: {lang.reading}
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                              كتابة: {lang.writing}
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                              محادثة: {lang.speaking}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attorney Requirements */}
              {job.requirements?.attorneyRequirements?.barAdmissionRequired && (
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      متطلبات المحامين
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-700">يتطلب ترخيص مزاولة المهنة</span>
                    </div>
                    {job.requirements.attorneyRequirements.jurisdiction && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-slate-600">جهة الترخيص</span>
                        <span className="font-medium text-navy">{job.requirements.attorneyRequirements.jurisdiction}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Compensation Tab */}
          <TabsContent value="compensation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Salary */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    الراتب والبدلات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <p className="text-sm text-emerald-600 mb-1">نطاق الراتب الشهري</p>
                    <p className="text-2xl font-bold text-emerald-700">{formatSalary(job.salary)}</p>
                    {job.salary?.salaryNegotiable && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 mt-2">قابل للتفاوض</Badge>
                    )}
                  </div>
                  {job.salary?.allowances && (
                    <div className="space-y-2">
                      {job.salary.allowances.housing && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">بدل السكن</span>
                          <span className="font-medium text-navy">{job.salary.allowances.housing.toLocaleString()} ر.س</span>
                        </div>
                      )}
                      {job.salary.allowances.transportation && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">بدل النقل</span>
                          <span className="font-medium text-navy">{job.salary.allowances.transportation.toLocaleString()} ر.س</span>
                        </div>
                      )}
                      {job.salary.allowances.food && (
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-slate-600">بدل الطعام</span>
                          <span className="font-medium text-navy">{job.salary.allowances.food.toLocaleString()} ر.س</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    المزايا
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {job.benefits && job.benefits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-700 border-0 rounded-lg">
                          {benefit.benefitAr || benefit.benefit}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">لا توجد مزايا محددة</p>
                  )}
                </CardContent>
              </Card>

              {/* Leave Entitlements */}
              {job.leaveEntitlements && (
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      الإجازات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2 bg-slate-50 rounded-xl px-4">
                      <span className="text-slate-600">الإجازة السنوية</span>
                      <span className="font-bold text-navy">{job.leaveEntitlements.annualLeave} يوم</span>
                    </div>
                    <div className="flex items-center justify-between py-2 bg-slate-50 rounded-xl px-4">
                      <span className="text-slate-600">الإجازة المرضية</span>
                      <span className="font-medium text-navy">{job.leaveEntitlements.sickLeave}</span>
                    </div>
                    {job.leaveEntitlements.hajjLeave && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-700">إجازة الحج (15 يوم)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Hiring Process Tab */}
          <TabsContent value="process" className="space-y-4">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  مراحل التوظيف
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.hiringStages && job.hiringStages.length > 0 ? (
                  <div className="relative">
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-emerald-200"></div>
                    <div className="space-y-6">
                      {job.hiringStages.map((stage, index) => (
                        <div key={index} className="relative flex items-start gap-4 pr-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm z-10">
                            {stage.stageNumber || index + 1}
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-xl p-4">
                            <h4 className="font-bold text-navy">{stage.stageNameAr || stage.stageName}</h4>
                            <p className="text-sm text-slate-500">
                              {stage.stageType === 'screening' && 'فرز الطلبات'}
                              {stage.stageType === 'phone_screening' && 'مكالمة هاتفية'}
                              {stage.stageType === 'interview' && 'مقابلة شخصية'}
                              {stage.stageType === 'assessment' && 'اختبار تقييمي'}
                              {stage.stageType === 'background_check' && 'فحص الخلفية'}
                              {stage.stageType === 'offer' && 'العرض الوظيفي'}
                              {stage.stageType === 'onboarding' && 'التهيئة'}
                            </p>
                            {stage.duration && (
                              <p className="text-xs text-slate-600 mt-1">المدة المتوقعة: {stage.duration} أيام</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">لم يتم تحديد مراحل التوظيف</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="space-y-4">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    المتقدمين للوظيفة
                  </CardTitle>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/new', search: { jobId } })}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    إضافة متقدم
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {applicantsData?.data && applicantsData.data.length > 0 ? (
                  <div className="space-y-3">
                    {applicantsData.data.map((applicant) => {
                      const statusConfig = APPLICANT_STATUS_LABELS[applicant.status]
                      return (
                        <div
                          key={applicant._id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/$applicantId', params: { applicantId: applicant._id } })}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-700 font-bold">
                                {applicant.personalInfo?.fullNameAr?.charAt(0) || applicant.personalInfo?.fullName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-navy">
                                {applicant.personalInfo?.fullNameAr || applicant.personalInfo?.fullName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {applicant.personalInfo?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-slate-500">الخبرة</p>
                              <p className="font-medium text-navy">{applicant.workExperience?.totalExperience || 0} سنة</p>
                            </div>
                            <Badge className={`${
                              statusConfig?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                              statusConfig?.color === 'red' ? 'bg-red-100 text-red-700' :
                              statusConfig?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                              statusConfig?.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                              statusConfig?.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                              statusConfig?.color === 'cyan' ? 'bg-cyan-100 text-cyan-700' :
                              statusConfig?.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                              'bg-slate-100 text-slate-600'
                            } border-0 rounded-lg`}>
                              {statusConfig?.ar || applicant.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <Eye className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">لا يوجد متقدمين</h3>
                    <p className="text-slate-500 mb-4">لم يتقدم أحد لهذه الوظيفة بعد</p>
                    <Button
                      onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/new', search: { jobId } })}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <UserPlus className="w-4 h-4 ms-2" />
                      إضافة متقدم
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Stats */}
            {job.applicationsByStage && (
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    توزيع المتقدمين حسب المرحلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-slate-600">{job.applicationsByStage.applied || 0}</p>
                      <p className="text-xs text-slate-500">مقدم</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{job.applicationsByStage.screening || 0}</p>
                      <p className="text-xs text-slate-500">فرز</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <p className="text-2xl font-bold text-purple-600">{job.applicationsByStage.interviewing || 0}</p>
                      <p className="text-xs text-slate-500">مقابلة</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-xl">
                      <p className="text-2xl font-bold text-amber-600">{job.applicationsByStage.offer || 0}</p>
                      <p className="text-xs text-slate-500">عرض</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600">{job.applicationsByStage.hired || 0}</p>
                      <p className="text-xs text-slate-500">معين</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-2xl font-bold text-red-600">{job.applicationsByStage.rejected || 0}</p>
                      <p className="text-xs text-slate-500">مرفوض</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
