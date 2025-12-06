import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { useJobPostings, useJobPostingStats } from '@/hooks/useRecruitment'
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
  Briefcase, MapPin, Clock, CheckCircle, FileText, Building2,
  UserPlus, Globe, PauseCircle, XCircle, TrendingUp, Calendar,
  DollarSign, Zap
} from 'lucide-react'
import {
  type JobPostingStatus,
  type EmploymentType,
  type SeniorityLevel,
  type Urgency,
  JOB_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  SENIORITY_LABELS,
} from '@/services/recruitmentService'

// Urgency labels
const URGENCY_LABELS: Record<Urgency, { ar: string; en: string; color: string }> = {
  low: { ar: 'منخفضة', en: 'Low', color: 'slate' },
  medium: { ar: 'متوسطة', en: 'Medium', color: 'blue' },
  high: { ar: 'عالية', en: 'High', color: 'amber' },
  critical: { ar: 'حرجة', en: 'Critical', color: 'red' },
}

export function JobPostingsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobPostingStatus | 'all'>('all')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | 'all'>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Fetch job postings
  const { data: jobsData, isLoading, isError } = useJobPostings({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    employmentType: employmentTypeFilter !== 'all' ? employmentTypeFilter : undefined,
    urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
  })

  // Fetch stats
  const { data: statsData } = useJobPostingStats()

  // Filter records based on search
  const filteredJobs = useMemo(() => {
    if (!jobsData?.data) return []
    return jobsData.data.filter((job) => {
      const matchesSearch =
        job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobTitleAr?.includes(searchQuery) ||
        job.jobPostingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.departmentNameAr?.includes(searchQuery)
      return matchesSearch
    })
  }, [jobsData?.data, searchQuery])

  // Status badge
  const getStatusBadge = (status: JobPostingStatus) => {
    const config = JOB_STATUS_LABELS[status]
    const colorClasses: Record<string, string> = {
      emerald: 'bg-emerald-100 text-emerald-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      blue: 'bg-blue-100 text-blue-700',
      slate: 'bg-slate-100 text-slate-600',
    }
    const icons: Record<JobPostingStatus, React.ReactNode> = {
      draft: <FileText className="w-3 h-3" />,
      published: <Globe className="w-3 h-3" />,
      closed: <XCircle className="w-3 h-3" />,
      on_hold: <PauseCircle className="w-3 h-3" />,
      filled: <CheckCircle className="w-3 h-3" />,
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-2 py-0.5 flex items-center gap-1`}>
        {icons[status]}
        {config.ar}
      </Badge>
    )
  }

  // Urgency badge
  const getUrgencyBadge = (urgency: Urgency) => {
    const config = URGENCY_LABELS[urgency]
    const colorClasses: Record<string, string> = {
      slate: 'bg-slate-100 text-slate-600',
      blue: 'bg-blue-100 text-blue-700',
      amber: 'bg-amber-100 text-amber-700',
      red: 'bg-red-100 text-red-700',
    }
    return (
      <Badge className={`${colorClasses[config.color]} border-0 rounded-lg px-2 py-0.5 flex items-center gap-1`}>
        <Zap className="w-3 h-3" />
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
            <h1 className="text-2xl font-bold text-navy">الوظائف الشاغرة</h1>
            <p className="text-slate-500">إدارة إعلانات الوظائف ومتابعة المتقدمين</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants' })}
              className="rounded-xl"
            >
              <Users className="w-4 h-4 ml-2" />
              المتقدمين
            </Button>
            <Button
              onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs/new' })}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 ml-2" />
              وظيفة جديدة
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">إجمالي الوظائف</p>
                  <p className="text-2xl font-bold text-navy">{statsData?.totalJobs || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">منشورة</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {statsData?.byStatus?.find(s => s.status === 'published')?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-purple-600">{statsData?.totalApplications || 0}</p>
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
                    {statsData?.avgTimeToFill ? `${statsData.avgTimeToFill} يوم` : '-'}
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
                  <p className="text-sm text-slate-500">تكلفة التعيين</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statsData?.avgCostPerHire ? `${statsData.avgCostPerHire.toLocaleString()} ر.س` : '-'}
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
                  placeholder="بحث بالمسمى الوظيفي أو القسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 rounded-xl"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobPostingStatus | 'all')}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="on_hold">معلق</SelectItem>
                    <SelectItem value="closed">مغلق</SelectItem>
                    <SelectItem value="filled">تم التعيين</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={employmentTypeFilter} onValueChange={(v) => setEmploymentTypeFilter(v as EmploymentType | 'all')}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <Briefcase className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="نوع العمل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="full_time">دوام كامل</SelectItem>
                    <SelectItem value="part_time">دوام جزئي</SelectItem>
                    <SelectItem value="contract">عقد</SelectItem>
                    <SelectItem value="temporary">مؤقت</SelectItem>
                    <SelectItem value="internship">تدريب</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as Urgency | 'all')}>
                  <SelectTrigger className="w-36 rounded-xl">
                    <Zap className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="critical">حرجة</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <Building2 className="w-4 h-4 ml-2" />
                    <SelectValue placeholder="القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    <SelectItem value="legal">القانونية</SelectItem>
                    <SelectItem value="hr">الموارد البشرية</SelectItem>
                    <SelectItem value="finance">المالية</SelectItem>
                    <SelectItem value="admin">الإدارة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Postings List */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                الوظائف الشاغرة
              </CardTitle>
              <Badge className="bg-slate-100 text-slate-600 border-0">
                {filteredJobs.length} وظيفة
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">حدث خطأ</h3>
                <p className="text-slate-500">فشل في تحميل الوظائف</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد وظائف</h3>
                <p className="text-slate-500 mb-4">لا توجد وظائف مطابقة للبحث</p>
                <Button
                  onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs/new' })}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة وظيفة جديدة
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs/$jobId', params: { jobId: job._id } })}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Briefcase className="w-7 h-7 text-emerald-700" />
                      </div>

                      {/* Job Info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-navy text-lg">
                            {job.jobTitleAr || job.jobTitle}
                          </span>
                          {getStatusBadge(job.status)}
                          {getUrgencyBadge(job.urgency)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.departmentNameAr || job.departmentName || job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {EMPLOYMENT_TYPE_LABELS[job.employmentType]?.ar}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Job Stats */}
                    <div className="flex items-center gap-6">
                      {/* Positions */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">الشواغر</p>
                        <p className="text-xl font-bold text-navy">{job.positions}</p>
                      </div>

                      {/* Applications */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">المتقدمين</p>
                        <p className="text-xl font-bold text-purple-600">{job.applicationsCount || 0}</p>
                      </div>

                      {/* Salary */}
                      <div className="text-center min-w-[120px]">
                        <p className="text-xs text-slate-500 mb-1">الراتب</p>
                        <p className="text-sm font-medium text-navy flex items-center justify-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(job.salary)}
                        </p>
                      </div>

                      {/* Posted Date */}
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">تاريخ النشر</p>
                        <p className="text-sm font-medium text-navy flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(job.postedDate)}
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
                توزيع حالات الوظائف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(JOB_STATUS_LABELS).map(([status, config]) => {
                  const statusData = statsData.byStatus?.find(s => s.status === status)
                  const count = statusData?.count || 0
                  return (
                    <div key={status} className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                        config.color === 'emerald' ? 'bg-emerald-100' :
                        config.color === 'blue' ? 'bg-blue-100' :
                        config.color === 'amber' ? 'bg-amber-100' :
                        config.color === 'red' ? 'bg-red-100' :
                        'bg-slate-100'
                      }`}>
                        <span className={`${
                          config.color === 'emerald' ? 'text-emerald-600' :
                          config.color === 'blue' ? 'text-blue-600' :
                          config.color === 'amber' ? 'text-amber-600' :
                          config.color === 'red' ? 'text-red-600' :
                          'text-slate-600'
                        }`}>
                          {status === 'draft' && <FileText className="w-5 h-5" />}
                          {status === 'published' && <Globe className="w-5 h-5" />}
                          {status === 'on_hold' && <PauseCircle className="w-5 h-5" />}
                          {status === 'closed' && <XCircle className="w-5 h-5" />}
                          {status === 'filled' && <CheckCircle className="w-5 h-5" />}
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
      </Main>
    </>
  )
}
