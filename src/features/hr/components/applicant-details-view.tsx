import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useApplicant, useUpdateApplicantStatus, useRejectApplicant, useHireApplicant } from '@/hooks/useRecruitment'
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
  Briefcase, MapPin, Clock, CheckCircle, FileText, Mail,
  Phone, Calendar, MoreVertical, Star, GraduationCap,
  Globe, Award, Edit, MessageCircle, DollarSign, User,
  Building2, UserCheck, UserX, Flag, Download, Send
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  APPLICANT_STATUS_LABELS,
  SOURCE_LABELS,
  EDUCATION_LABELS,
  type ApplicantStatus,
} from '@/services/recruitmentService'

export function ApplicantDetailsView() {
  const navigate = useNavigate()
  const { applicantId } = useParams({ strict: false })
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch applicant
  const { data: applicant, isLoading, isError } = useApplicant(applicantId || '')

  // Mutations
  const updateStatusMutation = useUpdateApplicantStatus()
  const rejectMutation = useRejectApplicant()
  const hireMutation = useHireApplicant()

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Handle status change
  const handleStatusChange = async (status: ApplicantStatus) => {
    if (!applicantId) return
    await updateStatusMutation.mutateAsync({ applicantId, status })
  }

  // Handle reject
  const handleReject = async () => {
    if (!applicantId) return
    await rejectMutation.mutateAsync({
      applicantId,
      data: {
        rejectionStage: 'screening',
        rejectionReason: 'غير مناسب',
        rejectionCategory: 'not_qualified',
        keepInTalentPool: false,
      },
    })
  }

  // Handle hire
  const handleHire = async () => {
    if (!applicantId) return
    await hireMutation.mutateAsync({
      applicantId,
      data: {
        hireDate: new Date().toISOString(),
        actualStartDate: new Date().toISOString(),
      },
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التوظيف', href: '/dashboard/hr/recruitment/applicants', isActive: true },
  ]

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className='ms-auto flex items-center space-x-4'>
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

  if (isError || !applicant) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className='ms-auto flex items-center space-x-4'>
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">حدث خطأ</h3>
            <p className="text-slate-500">فشل في تحميل بيانات المتقدم</p>
            <Button
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants' })}
              className="mt-4"
            >
              العودة للمتقدمين
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const statusConfig = APPLICANT_STATUS_LABELS[applicant.status]

  return (
    <>
      {/* Header */}
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
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants' })}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-2xl">
                {(applicant.personalInfo?.fullNameAr || applicant.personalInfo?.fullName || '?').charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-navy">
                  {applicant.personalInfo?.fullNameAr || applicant.personalInfo?.fullName}
                </h1>
                <Badge className={`${
                  statusConfig?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  statusConfig?.color === 'red' ? 'bg-red-100 text-red-700' :
                  statusConfig?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  statusConfig?.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  statusConfig?.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  'bg-slate-100 text-slate-600'
                } border-0 rounded-lg`}>
                  {statusConfig?.ar || applicant.status}
                </Badge>
                {applicant.personalInfo?.isSaudi && (
                  <Badge className="bg-green-100 text-green-700 border-0 rounded-lg">سعودي</Badge>
                )}
                {applicant.notes?.flagged && (
                  <Badge className="bg-red-100 text-red-700 border-0 rounded-lg flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    مُعلَّم
                  </Badge>
                )}
              </div>
              <p className="text-slate-500">
                {applicant.application?.jobTitle} • {applicant.applicantNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {applicant.status !== 'hired' && applicant.status !== 'rejected' && (
              <>
                <Button
                  onClick={() => handleStatusChange('interviewing')}
                  disabled={updateStatusMutation.isPending}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                >
                  <UserCheck className="w-4 h-4 ml-2" />
                  جدولة مقابلة
                </Button>
                <Button
                  onClick={handleHire}
                  disabled={hireMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تعيين
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Send className="w-4 h-4 ml-2" />
                  إرسال بريد
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 ml-2" />
                  تحميل السيرة الذاتية
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleReject} className="text-red-600">
                  <UserX className="w-4 h-4 ml-2" />
                  رفض الطلب
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
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">الخبرة</p>
                  <p className="text-xl font-bold text-navy">{applicant.workExperience?.totalExperience || 0} سنة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">المؤهل</p>
                  <p className="text-sm font-bold text-navy">
                    {applicant.qualifications?.education?.[0]?.level
                      ? EDUCATION_LABELS[applicant.qualifications.education[0].level]?.ar
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">الراتب المتوقع</p>
                  <p className="text-sm font-bold text-navy">
                    {applicant.expectedCompensation?.expectedSalary?.toLocaleString() || '-'} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">تاريخ التقديم</p>
                  <p className="text-sm font-bold text-navy">{formatDate(applicant.application?.applicationDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">أيام في العملية</p>
                  <p className="text-xl font-bold text-navy">{applicant.daysInProcess || 0}</p>
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
            <TabsTrigger value="qualifications" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              المؤهلات
            </TabsTrigger>
            <TabsTrigger value="experience" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              الخبرة
            </TabsTrigger>
            <TabsTrigger value="interviews" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              المقابلات
              {applicant.interviews?.length ? (
                <span className="ms-1 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-xs">
                  {applicant.interviews.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              السجل
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Contact Information */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    معلومات التواصل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                      <p className="font-medium text-navy">{applicant.personalInfo?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">رقم الهاتف</p>
                      <p className="font-medium text-navy">{applicant.personalInfo?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">الموقع</p>
                      <p className="font-medium text-navy">{applicant.personalInfo?.currentLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">الجنسية</p>
                      <p className="font-medium text-navy">
                        {applicant.personalInfo?.nationality === 'SA' || applicant.personalInfo?.isSaudi
                          ? 'سعودي'
                          : applicant.personalInfo?.nationality}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Application Details */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    تفاصيل التقديم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">الوظيفة</span>
                    <span className="font-medium text-navy">{applicant.application?.jobTitle}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">مصدر التقديم</span>
                    <span className="font-medium text-navy">
                      {SOURCE_LABELS[applicant.application?.applicationSource]?.ar || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">تاريخ التقديم</span>
                    <span className="font-medium text-navy">{formatDate(applicant.application?.applicationDate)}</span>
                  </div>
                  {applicant.application?.referredBy && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">مُوصى بواسطة</span>
                      <span className="font-medium text-navy">{applicant.application.referredBy.employeeName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500">السيرة الذاتية</span>
                    {applicant.application?.applicationMaterials?.resumeUrl ? (
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Download className="w-4 h-4 ml-1" />
                        تحميل
                      </Button>
                    ) : (
                      <span className="text-slate-400">غير متوفرة</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expected Compensation */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    التعويضات والتوفر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <p className="text-sm text-emerald-600 mb-1">الراتب المتوقع</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {applicant.expectedCompensation?.expectedSalary?.toLocaleString() || '-'} ر.س
                    </p>
                    {applicant.expectedCompensation?.salaryNegotiable && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 mt-2">قابل للتفاوض</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">فترة الإشعار</span>
                    <span className="font-medium text-navy">
                      {applicant.expectedCompensation?.noticePeriod
                        ? `${applicant.expectedCompensation.noticePeriod} يوم`
                        : 'متاح فوراً'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500">تاريخ البدء المتوقع</span>
                    <span className="font-medium text-navy">{formatDate(applicant.availability?.availableToStart)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Qualifications Tab */}
          <TabsContent value="qualifications" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Education */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    التعليم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {applicant.qualifications?.education && applicant.qualifications.education.length > 0 ? (
                    <div className="space-y-4">
                      {applicant.qualifications.education.map((edu, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-navy">{edu.degree || EDUCATION_LABELS[edu.level]?.ar}</h4>
                              <p className="text-sm text-slate-600">{edu.major}</p>
                              <p className="text-sm text-slate-500">{edu.institution}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 border-0">{edu.graduationYear}</Badge>
                          </div>
                          {edu.verified && (
                            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              موثق
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">لا توجد معلومات تعليمية</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-600" />
                    المهارات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {applicant.qualifications?.skills && applicant.qualifications.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {applicant.qualifications.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          className={`border-0 rounded-lg ${
                            skill.proficiencyLevel === 'expert' ? 'bg-emerald-100 text-emerald-700' :
                            skill.proficiencyLevel === 'advanced' ? 'bg-blue-100 text-blue-700' :
                            skill.proficiencyLevel === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {skill.skillName}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">لا توجد مهارات محددة</p>
                  )}
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    اللغات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {applicant.qualifications?.languages && applicant.qualifications.languages.length > 0 ? (
                    <div className="space-y-3">
                      {applicant.qualifications.languages.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-navy">{lang.language}</span>
                            {lang.nativeLanguage && (
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">لغة أم</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span className="text-xs text-slate-500">قراءة: {lang.reading}</span>
                            <span className="text-xs text-slate-500">كتابة: {lang.writing}</span>
                            <span className="text-xs text-slate-500">محادثة: {lang.speaking}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">لا توجد لغات محددة</p>
                  )}
                </CardContent>
              </Card>

              {/* Certifications */}
              {applicant.qualifications?.certifications && applicant.qualifications.certifications.length > 0 && (
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      الشهادات المهنية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {applicant.qualifications.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div>
                            <p className="font-medium text-navy">{cert.certificationName}</p>
                            <p className="text-sm text-slate-500">{cert.issuingOrganization}</p>
                          </div>
                          {cert.verified && (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  الخبرة العملية
                  <Badge className="bg-blue-100 text-blue-700 border-0">
                    {applicant.workExperience?.totalExperience || 0} سنة
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.workExperience?.workHistory && applicant.workExperience.workHistory.length > 0 ? (
                  <div className="relative">
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-emerald-200"></div>
                    <div className="space-y-6">
                      {applicant.workExperience.workHistory.map((work, index) => (
                        <div key={index} className="relative flex items-start gap-4 pr-4">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 z-10 mt-1.5"></div>
                          <div className="flex-1 bg-slate-50 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-navy">{work.jobTitle}</h4>
                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {work.company}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-navy">
                                  {formatDate(work.startDate)} - {work.currentlyWorking ? 'حتى الآن' : formatDate(work.endDate)}
                                </p>
                                {work.currentlyWorking && (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">الوظيفة الحالية</Badge>
                                )}
                              </div>
                            </div>
                            {work.responsibilities && (
                              <p className="text-sm text-slate-500 mt-2">{work.responsibilities}</p>
                            )}
                            {work.achievements && (
                              <p className="text-sm text-emerald-600 mt-2">{work.achievements}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">لا توجد خبرة عملية سابقة</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-4">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    المقابلات
                  </CardTitle>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                    <Calendar className="w-4 h-4 ml-2" />
                    جدولة مقابلة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {applicant.interviews && applicant.interviews.length > 0 ? (
                  <div className="space-y-4">
                    {applicant.interviews.map((interview, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-navy">
                              المقابلة {interview.interviewNumber} - {
                                interview.interviewType === 'phone' ? 'هاتفية' :
                                interview.interviewType === 'video' ? 'فيديو' :
                                interview.interviewType === 'in_person' ? 'شخصية' :
                                interview.interviewType === 'panel' ? 'لجنة' :
                                interview.interviewType
                              }
                            </h4>
                            <p className="text-sm text-slate-500">
                              {formatDate(interview.scheduledDate)} {interview.scheduledTime && `- ${interview.scheduledTime}`}
                            </p>
                          </div>
                          <Badge className={`border-0 ${
                            interview.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            interview.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            interview.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {interview.status === 'completed' ? 'مكتملة' :
                             interview.status === 'scheduled' ? 'مجدولة' :
                             interview.status === 'cancelled' ? 'ملغاة' :
                             interview.status}
                          </Badge>
                        </div>
                        {interview.overallRating && (
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500" />
                              <span className="font-bold text-navy">{interview.overallRating}/5</span>
                            </div>
                            <Badge className={`border-0 ${
                              interview.overallRecommendation === 'strong_yes' ? 'bg-emerald-100 text-emerald-700' :
                              interview.overallRecommendation === 'yes' ? 'bg-blue-100 text-blue-700' :
                              interview.overallRecommendation === 'maybe' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {interview.overallRecommendation === 'strong_yes' ? 'موصى به بشدة' :
                               interview.overallRecommendation === 'yes' ? 'موصى به' :
                               interview.overallRecommendation === 'maybe' ? 'ربما' :
                               'غير موصى به'}
                            </Badge>
                          </div>
                        )}
                        {interview.interviewNotes && (
                          <p className="text-sm text-slate-600 mt-3">{interview.interviewNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد مقابلات</h3>
                    <p className="text-slate-500 mb-4">لم تتم جدولة أي مقابلات بعد</p>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      <Calendar className="w-4 h-4 ml-2" />
                      جدولة مقابلة
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  سجل الحالات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.statusHistory && applicant.statusHistory.length > 0 ? (
                  <div className="relative">
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-emerald-200"></div>
                    <div className="space-y-4">
                      {applicant.statusHistory.map((history, index) => {
                        const statusConfig = APPLICANT_STATUS_LABELS[history.status as ApplicantStatus]
                        return (
                          <div key={index} className="relative flex items-start gap-4 pr-4">
                            <div className={`w-3 h-3 rounded-full z-10 mt-1.5 ${
                              statusConfig?.color === 'emerald' ? 'bg-emerald-500' :
                              statusConfig?.color === 'red' ? 'bg-red-500' :
                              statusConfig?.color === 'blue' ? 'bg-blue-500' :
                              'bg-slate-400'
                            }`}></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Badge className={`border-0 ${
                                  statusConfig?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                  statusConfig?.color === 'red' ? 'bg-red-100 text-red-700' :
                                  statusConfig?.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {statusConfig?.ar || history.status}
                                </Badge>
                                <span className="text-sm text-slate-500">{formatDate(history.startDate)}</span>
                              </div>
                              {history.notes && (
                                <p className="text-sm text-slate-600 mt-1">{history.notes}</p>
                              )}
                              {history.duration && (
                                <p className="text-xs text-slate-400 mt-1">{history.duration} يوم</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">لا يوجد سجل حالات</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
