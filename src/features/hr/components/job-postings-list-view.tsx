import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Checkbox } from '@/components/ui/checkbox'
import { useJobPostings, useJobPostingStats } from '@/hooks/useRecruitment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Bell, Plus, Users, AlertCircle, Eye,
  Briefcase, MapPin, Clock, CheckCircle, FileText, Building2,
  UserPlus, Globe, PauseCircle, XCircle, TrendingUp, Calendar,
  DollarSign, Zap, MoreHorizontal, Edit3, Trash2, X
} from 'lucide-react'
import {
  type JobPostingStatus,
  type EmploymentType,
  type Urgency,
  JOB_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
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
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobPostingStatus | 'all'>('all')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<EmploymentType | 'all'>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Check if any filter is active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || employmentTypeFilter !== 'all' || urgencyFilter !== 'all' || departmentFilter !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setEmploymentTypeFilter('all')
    setUrgencyFilter('all')
    setDepartmentFilter('all')
  }

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

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds([])
  }

  const handleSelectJob = (jobId: string) => {
    if (selectedIds.includes(jobId)) {
      setSelectedIds(selectedIds.filter(id => id !== jobId))
    } else {
      setSelectedIds([...selectedIds, jobId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} وظيفة؟`)) {
      // TODO: Implement bulk delete
      setIsSelectionMode(false)
      setSelectedIds([])
    }
  }

  // Single job actions
  const handleViewJob = (jobId: string) => {
    navigate({ to: ROUTES.dashboard.hr.recruitment.jobs.detail(jobId), params: { jobId } })
  }

  const handleEditJob = (jobId: string) => {
    navigate({ to: ROUTES.dashboard.hr.recruitment.jobs.new, search: { editId: jobId } })
  }

  const handleDeleteJob = (jobId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
      // TODO: Implement delete
    }
  }

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
      draft: <FileText className="w-3 h-3" aria-hidden="true" />,
      published: <Globe className="w-3 h-3" aria-hidden="true" />,
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

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!statsData) return undefined
    return [
      { label: 'إجمالي الوظائف', value: statsData.totalJobs || 0, icon: Briefcase, status: 'normal' as const },
      { label: 'منشورة', value: statsData.byStatus?.find(s => s.status === 'published')?.count || 0, icon: Globe, status: 'normal' as const },
      { label: 'إجمالي الطلبات', value: statsData.totalApplications || 0, icon: UserPlus, status: 'normal' as const },
      { label: 'متوسط وقت التعيين', value: statsData.avgTimeToFill || 0, icon: Clock, status: 'normal' as const },
    ]
  }, [statsData])

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.overview, isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'التوظيف', href: ROUTES.dashboard.hr.recruitment.jobs.list, isActive: true },
    { title: 'المتقدمين', href: ROUTES.dashboard.hr.recruitment.applicants.list, isActive: false },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD & STATS */}
        <ProductivityHero badge="الموارد البشرية" title="الوظائف الشاغرة" type="recruitment" stats={heroStats} />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                {/* Row 1: Search */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder="بحث بالمسمى الوظيفي أو القسم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Row 2: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobPostingStatus | 'all')}>
                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
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
                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                      <Briefcase className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                      <SelectValue placeholder="النوع" />
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
                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                      <Zap className="h-4 w-4 ms-2 text-slate-500" />
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
                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                      <Building2 className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
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

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-4 w-4 ms-2" aria-hidden="true" />
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN JOBS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  الوظائف الشاغرة
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {filteredJobs.length} وظيفة
                </Badge>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="w-14 h-14 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))}
                  </>
                )}

                {/* Error State */}
                {isError && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ</h3>
                    <p className="text-slate-500 mb-4">فشل في تحميل الوظائف</p>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredJobs.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد وظائف</h3>
                    <p className="text-slate-500 mb-4">لا توجد وظائف مطابقة للبحث</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to={ROUTES.dashboard.hr.recruitment.jobs.new}>
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        إضافة وظيفة جديدة
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Jobs List */}
                {!isLoading && !isError && filteredJobs.map((job) => (
                  <div key={job._id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(job._id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(job._id)}
                            onCheckedChange={() => handleSelectJob(job._id)}
                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        )}
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                          <Briefcase className="w-7 h-7" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-navy text-lg">{job.jobTitleAr || job.jobTitle}</h4>
                            {getStatusBadge(job.status)}
                            {getUrgencyBadge(job.urgency)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" aria-hidden="true" />
                              {job.departmentNameAr || job.departmentName || job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" aria-hidden="true" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" aria-hidden="true" />
                              {EMPLOYMENT_TYPE_LABELS[job.employmentType]?.ar}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewJob(job._id)}>
                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditJob(job._id)}>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                            تعديل الوظيفة
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteJob(job._id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                            حذف الوظيفة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
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
                        <div className="text-center min-w-[100px]">
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
                            <Calendar className="w-4 h-4" aria-hidden="true" />
                            {formatDate(job.postedDate)}
                          </p>
                        </div>
                      </div>
                      <Link to={ROUTES.dashboard.hr.recruitment.jobs.detail(job._id) as any}>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                          عرض الوظيفة
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar
            context="employees"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedIds.length}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>
      </Main>
    </>
  )
}
