import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase, Search, MapPin, Clock, DollarSign,
  Building2, ChevronLeft, Bookmark, Eye, Calendar,
  Users, ArrowUpRight, Bell, AlertCircle, X, MoreHorizontal,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'
import { JobsSidebar } from './jobs-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useJobs } from '@/hooks/useJobs'
import type { Job } from '@/services/jobsService'

const categories = [
  { value: 'all', label: 'جميع التخصصات', labelEn: 'All Specialties' },
  { value: 'labor', label: 'عمالي', labelEn: 'Labor' },
  { value: 'commercial', label: 'تجاري', labelEn: 'Commercial' },
  { value: 'personal-status', label: 'أحوال شخصية', labelEn: 'Personal Status' },
  { value: 'criminal', label: 'جنائي', labelEn: 'Criminal' },
  { value: 'real-estate', label: 'عقاري', labelEn: 'Real Estate' },
  { value: 'traffic', label: 'مروري', labelEn: 'Traffic' },
  { value: 'administrative', label: 'إداري', labelEn: 'Administrative' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

const statuses = [
  { value: 'all', label: 'جميع الحالات', labelEn: 'All Statuses' },
  { value: 'open', label: 'مفتوح', labelEn: 'Open' },
  { value: 'in-progress', label: 'قيد التنفيذ', labelEn: 'In Progress' },
  { value: 'completed', label: 'مكتمل', labelEn: 'Completed' },
  { value: 'cancelled', label: 'ملغي', labelEn: 'Cancelled' },
]

// Status colors
const statusColors: Record<string, string> = {
  'open': 'bg-emerald-100 text-emerald-700 border-0',
  'in-progress': 'bg-blue-100 text-blue-700 border-0',
  'completed': 'bg-slate-100 text-slate-700 border-0',
  'cancelled': 'bg-red-100 text-red-700 border-0',
}

export function BrowseJobs() {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([])

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}
    if (categoryFilter !== 'all') f.category = categoryFilter
    if (statusFilter !== 'all') f.status = statusFilter
    return f
  }, [categoryFilter, statusFilter])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  // Fetch jobs from API
  const { data: jobsData, isLoading, isError, error, refetch } = useJobs(filters)

  // Transform and filter jobs
  const jobs = useMemo(() => {
    if (!jobsData || !Array.isArray(jobsData)) return []

    return jobsData.filter((job: Job) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        job.title?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query)
      )
    })
  }, [jobsData, searchQuery])

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return isRTL ? cat?.label : cat?.labelEn
  }

  const getStatusLabel = (status: string) => {
    const s = statuses.find(st => st.value === status)
    return isRTL ? s?.label : s?.labelEn
  }

  const topNav = [
    { title: isRTL ? 'خدماتي' : 'My Services', href: '/dashboard/jobs/my-services', isActive: false },
    { title: isRTL ? 'تصفح الوظائف' : 'Browse Jobs', href: '/dashboard/jobs/browse', isActive: true },
  ]

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return isRTL ? 'اليوم' : 'Today'
    if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday'
    if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`
    return isRTL ? `منذ ${Math.floor(diffDays / 7)} أسابيع` : `${Math.floor(diffDays / 7)} weeks ago`
  }

  const formatBudget = (budget: { min?: number; max?: number } | undefined) => {
    if (!budget) return isRTL ? 'غير محدد' : 'Not specified'
    const min = budget.min?.toLocaleString() || '0'
    const max = budget.max?.toLocaleString() || '0'
    return `${min} - ${max} ${isRTL ? 'ر.س' : 'SAR'}`
  }

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD */}
        <ProductivityHero
          badge={isRTL ? 'الوظائف والخدمات' : 'Jobs & Services'}
          title={isRTL ? 'تصفح الوظائف' : 'Browse Jobs'}
          type="jobs"
          hideButtons={true}
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder={isRTL ? 'بحث بالعنوان أو الوصف...' : 'Search by title or description...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {isRTL ? cat.label : cat.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {isRTL ? status.label : status.labelEn}
                        </SelectItem>
                      ))}
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
                      {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN JOBS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">
                  {isRTL ? 'قائمة الوظائف' : 'Jobs List'}
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {isRTL ? `${jobs.length} وظيفة` : `${jobs.length} jobs`}
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {isRTL ? 'حدث خطأ في تحميل الوظائف' : 'Error loading jobs'}
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {(error as Error)?.message || (isRTL ? 'الرجاء المحاولة مرة أخرى' : 'Please try again')}
                    </p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      {isRTL ? 'إعادة المحاولة' : 'Retry'}
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && jobs.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {isRTL ? 'لا توجد وظائف مطابقة' : 'No matching jobs found'}
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {isRTL ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
                    </p>
                    {hasActiveFilters && (
                      <Button onClick={clearFilters} variant="outline" className="border-slate-200">
                        {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                      </Button>
                    )}
                  </div>
                )}

                {/* Success State - Jobs Cards */}
                {!isLoading && !isError && jobs.map((job: Job) => (
                  <div
                    key={job._id}
                    className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-bold text-navy text-lg group-hover:text-emerald-600 transition-colors">
                              {job.title}
                            </h4>
                            <Badge className={statusColors[job.status] || 'bg-slate-100 text-slate-700'}>
                              {getStatusLabel(job.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{job.userID?.username || (isRTL ? 'مستخدم' : 'User')}</span>
                            <span className="mx-1">•</span>
                            <span>{getCategoryLabel(job.category)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(job._id)}
                          className={bookmarkedJobs.includes(job._id) ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-navy'}
                        >
                          <Bookmark className={`h-5 w-5 ${bookmarkedJobs.includes(job._id) ? 'fill-current' : ''}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {job.location && (
                        <span className="flex items-center bg-white px-3 py-1.5 rounded-lg text-sm text-slate-600">
                          <MapPin className="h-3.5 w-3.5 me-1.5 text-slate-400" aria-hidden="true" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center bg-white px-3 py-1.5 rounded-lg text-sm text-slate-600">
                        <DollarSign className="h-3.5 w-3.5 me-1.5 text-slate-400" />
                        {formatBudget(job.budget)}
                      </span>
                      {job.deadline && (
                        <span className="flex items-center bg-white px-3 py-1.5 rounded-lg text-sm text-slate-600">
                          <Clock className="h-3.5 w-3.5 me-1.5 text-slate-400" aria-hidden="true" />
                          {new Date(job.deadline).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                          {formatDate(job.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                          {job.proposalsCount || 0} {isRTL ? 'عرض' : 'proposals'}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3.5 w-3.5 me-1" />
                          {job.views || 0}
                        </span>
                      </div>
                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                        {isRTL ? 'تقدم الآن' : 'Apply Now'}
                        <ArrowUpRight className="h-4 w-4 ms-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {jobs.length > 0 && (
                <div className="p-4 pt-0 text-center">
                  <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                    {isRTL ? 'عرض المزيد' : 'View More'}
                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <JobsSidebar context="browse-jobs" />
        </div>
      </Main>
    </>
  )
}

export default BrowseJobs
