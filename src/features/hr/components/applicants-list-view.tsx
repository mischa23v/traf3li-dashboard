import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { useApplicants, useApplicantStats, useJobPostings } from '@/hooks/useRecruitment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search, Bell, Plus, Filter, Users, AlertCircle, Eye,
  Briefcase, MapPin, Clock, CheckCircle, TrendingUp, Calendar,
  Mail, Phone, Star, UserCheck, UserX, Flag, FileText
} from 'lucide-react'
import {
  type ApplicantStatus,
  type ApplicationSource,
  APPLICANT_STATUS_LABELS,
  SOURCE_LABELS,
  EDUCATION_LABELS,
} from '@/services/recruitmentService'

export function ApplicantsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<ApplicationSource | 'all'>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')

  // Fetch applicants
  const { data: applicantsData, isLoading, isError } = useApplicants({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    source: sourceFilter !== 'all' ? sourceFilter : undefined,
    jobPostingId: jobFilter !== 'all' ? jobFilter : undefined,
  })

  // Fetch jobs for filter
  const { data: jobsData } = useJobPostings({ status: 'published' })

  // Fetch stats
  const { data: statsData } = useApplicantStats()

  // Filter records based on search
  const filteredApplicants = useMemo(() => {
    if (!applicantsData?.data) return []
    return applicantsData.data.filter((applicant) => {
      const matchesSearch =
        applicant.personalInfo?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.personalInfo?.fullNameAr?.includes(searchQuery) ||
        applicant.personalInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.applicantNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [applicantsData?.data, searchQuery])

  // Status badge
  const getStatusBadge = (status: ApplicantStatus) => {
    const config = APPLICANT_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      cyan: 'bg-cyan-100 text-cyan-700',
      orange: 'bg-orange-100 text-orange-700',
      slate: 'bg-slate-100 text-slate-600',
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-2 py-0.5`}>
        {config.ar}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التوظيف', href: '/dashboard/hr/recruitment/jobs', isActive: true },
  ]

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
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
          <div>
            <h1 className="text-2xl font-bold text-navy">المتقدمين</h1>
            <p className="text-slate-500">إدارة ومتابعة المتقدمين للوظائف</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs' })}
              className="rounded-xl"
            >
              <Briefcase className="w-4 h-4 ml-2" />
              الوظائف
            </Button>
            <Button
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/new' })}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 ml-2" />
              متقدم جديد
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">إجمالي المتقدمين</p>
                  <p className="text-2xl font-bold text-navy">{statsData?.totalApplicants || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">قيد المقابلة</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statsData?.byStatus?.find(s => s.status === 'interviewing')?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">تم تعيينهم</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {statsData?.byStatus?.find(s => s.status === 'hired')?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">متوسط وقت التعيين</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {statsData?.avgTimeToHire ? `${statsData.avgTimeToHire} يوم` : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">نسبة القبول</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statsData?.offerAcceptanceRate ? `${statsData.offerAcceptanceRate}%` : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="بحث بالاسم أو البريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 rounded-xl"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicantStatus | 'all')}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="applied">مقدم</SelectItem>
                    <SelectItem value="screening">فرز</SelectItem>
                    <SelectItem value="phone_screen">مكالمة هاتفية</SelectItem>
                    <SelectItem value="interviewing">مقابلة</SelectItem>
                    <SelectItem value="assessment">اختبار</SelectItem>
                    <SelectItem value="background_check">فحص الخلفية</SelectItem>
                    <SelectItem value="offer">عرض وظيفي</SelectItem>
                    <SelectItem value="hired">تم التعيين</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                    <SelectItem value="withdrawn">انسحب</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as ApplicationSource | 'all')}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <TrendingUp className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="المصدر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المصادر</SelectItem>
                    {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label.ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-48 rounded-xl">
                    <Briefcase className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الوظيفة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الوظائف</SelectItem>
                    {jobsData?.data?.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.jobTitleAr || job.jobTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicants List */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                قائمة المتقدمين
              </CardTitle>
              <Badge className="bg-slate-100 text-slate-600 border-0">
                {filteredApplicants.length} متقدم
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">حدث خطأ</h3>
                <p className="text-slate-500">فشل في تحميل المتقدمين</p>
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">لا يوجد متقدمين</h3>
                <p className="text-slate-500 mb-4">لا يوجد متقدمين مطابقين للبحث</p>
                <Button
                  onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/new' })}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة متقدم جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplicants.map((applicant) => (
                  <div
                    key={applicant._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/$applicantId', params: { applicantId: applicant._id } })}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center relative">
                        <span className="text-emerald-700 font-bold text-lg">
                          {(applicant.personalInfo?.fullNameAr || applicant.personalInfo?.fullName || '?').charAt(0)}
                        </span>
                        {applicant.notes?.flagged && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <Flag className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Applicant Info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-navy text-lg">
                            {applicant.personalInfo?.fullNameAr || applicant.personalInfo?.fullName}
                          </span>
                          {getStatusBadge(applicant.status)}
                          {applicant.personalInfo?.isSaudi && (
                            <Badge className="bg-green-100 text-green-700 border-0 rounded-lg text-xs">
                              سعودي
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {applicant.personalInfo?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {applicant.personalInfo?.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Applicant Stats */}
                    <div className="flex items-center gap-6">
                      {/* Job */}
                      <div className="text-center max-w-[150px]">
                        <p className="text-xs text-slate-500 mb-1">الوظيفة</p>
                        <p className="text-sm font-medium text-navy truncate">{applicant.application?.jobTitle}</p>
                      </div>

                      {/* Experience */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">الخبرة</p>
                        <p className="text-lg font-bold text-navy">{applicant.workExperience?.totalExperience || 0} سنة</p>
                      </div>

                      {/* Education */}
                      <div className="text-center min-w-[100px]">
                        <p className="text-xs text-slate-500 mb-1">المؤهل</p>
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                          {applicant.qualifications?.education?.[0]?.level
                            ? EDUCATION_LABELS[applicant.qualifications.education[0].level]?.ar
                            : '-'}
                        </Badge>
                      </div>

                      {/* Source */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">المصدر</p>
                        <p className="text-sm font-medium text-navy">
                          {SOURCE_LABELS[applicant.application?.applicationSource]?.ar || '-'}
                        </p>
                      </div>

                      {/* Application Date */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">تاريخ التقديم</p>
                        <p className="text-sm font-medium text-navy flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(applicant.application?.applicationDate)}
                        </p>
                      </div>

                      {/* View Button */}
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        {statsData?.byStatus && statsData.byStatus.length > 0 && (
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                توزيع المتقدمين حسب الحالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {statsData.byStatus.slice(0, 5).map(({ status, count }) => {
                  const config = APPLICANT_STATUS_LABELS[status as ApplicantStatus]
                  if (!config) return null
                  return (
                    <div key={status} className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                        config.color === 'emerald' ? 'bg-emerald-100' :
                        config.color === 'blue' ? 'bg-blue-100' :
                        config.color === 'amber' ? 'bg-amber-100' :
                        config.color === 'purple' ? 'bg-purple-100' :
                        config.color === 'red' ? 'bg-red-100' :
                        'bg-slate-100'
                      }`}>
                        <span className={`${
                          config.color === 'emerald' ? 'text-emerald-600' :
                          config.color === 'blue' ? 'text-blue-600' :
                          config.color === 'amber' ? 'text-amber-600' :
                          config.color === 'purple' ? 'text-purple-600' :
                          config.color === 'red' ? 'text-red-600' :
                          'text-slate-600'
                        }`}>
                          {status === 'applied' && <FileText className="w-5 h-5" />}
                          {status === 'screening' && <Search className="w-5 h-5" />}
                          {status === 'interviewing' && <Users className="w-5 h-5" />}
                          {status === 'hired' && <CheckCircle className="w-5 h-5" />}
                          {status === 'rejected' && <UserX className="w-5 h-5" />}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-navy">{config.ar}</p>
                      <p className="text-2xl font-bold text-navy">{count}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Source Distribution */}
        {statsData?.bySource && statsData.bySource.length > 0 && (
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                مصادر التوظيف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {statsData.bySource.slice(0, 4).map(({ source, count }) => {
                  const config = SOURCE_LABELS[source as ApplicationSource]
                  if (!config) return null
                  return (
                    <div key={source} className="text-center p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm font-medium text-navy mb-1">{config.ar}</p>
                      <p className="text-2xl font-bold text-navy">{count}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
