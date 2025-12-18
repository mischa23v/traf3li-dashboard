import { HRSidebar } from './hr-sidebar'
import { useState, useMemo, useCallback } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Link, useNavigate } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Bell, Plus, Filter, Users, AlertCircle, Eye,
  Briefcase, Clock, CheckCircle, TrendingUp, Calendar,
  Mail, Phone, Flag, MoreHorizontal, Edit3, Trash2, ChevronLeft
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
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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
    // Handle unknown status gracefully
    if (!config) {
      return (
        <Badge className="bg-slate-100 text-slate-600 border-0 rounded-lg px-2 py-0.5">
          {status || 'غير محدد'}
        </Badge>
      )
    }
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
      <Badge className={`${colorClasses[config.color] || 'bg-slate-100 text-slate-600'} border-0 rounded-lg px-2 py-0.5`}>
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

  // Selection handlers
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev)
    setSelectedIds([])
  }, [])

  const handleSelectApplicant = useCallback((applicantId: string) => {
    setSelectedIds(prev =>
      prev.includes(applicantId)
        ? prev.filter(id => id !== applicantId)
        : [...prev, applicantId]
    )
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} متقدم؟`)) {
      // Bulk delete logic here
      setIsSelectionMode(false)
      setSelectedIds([])
    }
  }, [selectedIds])

  // Stats for hero
  const heroStats = useMemo(() => {
    if (!statsData) return undefined
    return [
      { label: 'إجمالي المتقدمين', value: statsData.totalApplicants || 0, icon: Users, status: 'normal' as const },
      { label: 'قيد المقابلة', value: statsData.byStatus?.find(s => s.status === 'interviewing')?.count || 0, icon: Clock, status: 'normal' as const },
      { label: 'تم تعيينهم', value: statsData.byStatus?.find(s => s.status === 'hired')?.count || 0, icon: CheckCircle, status: 'normal' as const },
    ]
  }, [statsData])

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
        <ProductivityHero badge="التوظيف" title="المتقدمين للوظائف" type="recruitment" stats={heroStats} />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

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
                  <Briefcase className="w-4 h-4 ms-2" aria-hidden="true" />
                  الوظائف
                </Button>
                <Button
                  onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/new' })}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                  متقدم جديد
                </Button>
              </div>
            </div>

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    type="text"
                    placeholder="بحث بالاسم أو البريد الإلكتروني..." aria-label="بحث بالاسم أو البريد الإلكتروني"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pe-10 rounded-xl"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicantStatus | 'all')}>
                    <SelectTrigger className="w-40 rounded-xl">
                      <Filter className="w-4 h-4 ms-2" aria-hidden="true" />
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="applied">مقدم</SelectItem>
                      <SelectItem value="screening">فرز</SelectItem>
                      <SelectItem value="interviewing">مقابلة</SelectItem>
                      <SelectItem value="hired">تم التعيين</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as ApplicationSource | 'all')}>
                    <SelectTrigger className="w-40 rounded-xl">
                      <TrendingUp className="w-4 h-4 ms-2" aria-hidden="true" />
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
                      <Briefcase className="w-4 h-4 ms-2" aria-hidden="true" />
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
            </div>

            {/* MAIN APPLICANTS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">قائمة المتقدمين</h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {filteredApplicants.length} متقدم
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المتقدمين</h3>
                    <p className="text-slate-500 mb-4">تعذر الاتصال بالخادم</p>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && filteredApplicants.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Users className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد متقدمين</h3>
                    <p className="text-slate-500 mb-4">ابدأ بإضافة متقدم جديد</p>
                    <Button
                      onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                      إضافة متقدم جديد
                    </Button>
                  </div>
                )}

                {/* Success State - Applicants List */}
                {!isLoading && !isError && filteredApplicants.map((applicant) => (
                  <div
                    key={applicant._id}
                    className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(applicant._id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(applicant._id)}
                            onCheckedChange={() => handleSelectApplicant(applicant._id)}
                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        )}
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
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-bold text-navy text-lg">
                              {applicant.personalInfo?.fullNameAr || applicant.personalInfo?.fullName}
                            </h4>
                            {getStatusBadge(applicant.status)}
                            {applicant.personalInfo?.isSaudi && (
                              <Badge className="bg-green-100 text-green-700 border-0 rounded-lg text-xs">
                                سعودي
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-500 text-sm">{applicant.application?.jobTitle} • {applicant.applicantNumber}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/$applicantId', params: { applicantId: applicant._id } })}>
                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                            تعديل البيانات
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                            حذف المتقدم
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        {/* Contact Info */}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" aria-hidden="true" />
                            {applicant.personalInfo?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" aria-hidden="true" />
                            {applicant.personalInfo?.phone}
                          </span>
                        </div>
                        {/* Additional Info */}
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs text-slate-600">الخبرة</div>
                            <div className="font-medium text-navy text-sm">{applicant.workExperience?.totalExperience || 0} سنة</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-600">المؤهل</div>
                            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                              {applicant.qualifications?.education?.[0]?.level
                                ? EDUCATION_LABELS[applicant.qualifications.education[0].level]?.ar
                                : '-'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants/$applicantId', params: { applicantId: applicant._id } })}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20"
                      >
                        عرض الملف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 pt-0 text-center">
                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                  عرض جميع المتقدمين
                  <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                </Button>
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
