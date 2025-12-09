import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase, Plus, Search, Filter, MoreVertical,
  Clock, DollarSign, MapPin, Star, Eye, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, Bell, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'
import { JobsSidebar } from './components/jobs-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useMyJobs, useDeleteJob, useJobStatistics } from '@/hooks/useJobs'

const categories = [
  { value: 'all', label: 'جميع الفئات', labelEn: 'All Categories' },
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

export function MyServices() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch my jobs from API
  const { data: myJobs, isLoading, isError } = useMyJobs()
  const deleteJobMutation = useDeleteJob()

  // Calculate statistics
  const stats = useJobStatistics(myJobs)

  const topNav = [
    { title: isRTL ? 'خدماتي' : 'My Services', href: '/dashboard/jobs/my-services', isActive: true },
    { title: isRTL ? 'تصفح الوظائف' : 'Browse Jobs', href: '/dashboard/jobs/browse', isActive: false },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"><CheckCircle className="h-3 w-3 me-1" />{isRTL ? 'مفتوح' : 'Open'}</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"><Clock className="h-3 w-3 me-1" aria-hidden="true" />{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"><CheckCircle className="h-3 w-3 me-1" />{isRTL ? 'مكتمل' : 'Completed'}</Badge>
      case 'cancelled':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0"><XCircle className="h-3 w-3 me-1" />{isRTL ? 'ملغي' : 'Cancelled'}</Badge>
      default:
        return null
    }
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return isRTL ? cat?.label : cat?.labelEn
  }

  const handleDelete = async (id: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه الوظيفة؟' : 'Are you sure you want to delete this job?')) {
      await deleteJobMutation.mutateAsync(id)
    }
  }

  const filteredServices = useMemo(() => {
    if (!myJobs) return []

    return myJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [myJobs, searchQuery, categoryFilter, statusFilter])

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <ProductivityHero badge={isRTL ? 'الوظائف والخدمات' : 'Jobs & Services'} title={isRTL ? 'خدماتي' : 'My Services'} type="jobs" hideButtons={true}>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl shadow-lg shadow-emerald-500/20 border-0">
            <Plus className="h-5 w-5 me-2" aria-hidden="true" />
            {isRTL ? 'إضافة خدمة جديدة' : 'Add New Service'}
          </Button>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy">{isLoading ? '...' : stats.total}</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'إجمالي الوظائف' : 'Total Jobs'}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy">{isLoading ? '...' : stats.completed}</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'مكتملة' : 'Completed'}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Eye className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy">{isLoading ? '...' : stats.totalViews}</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'المشاهدات' : 'Total Views'}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy">{isLoading ? '...' : stats.totalProposals}</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'العروض' : 'Proposals'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      placeholder={isRTL ? 'بحث في الخدمات...' : 'Search services...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-10 rounded-xl border-slate-200"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200">
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200">
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
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : isError ? (
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-700">
                    {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
                  </h3>
                  <p className="text-red-600 mt-1">
                    {isRTL ? 'يرجى المحاولة مرة أخرى لاحقاً' : 'Please try again later'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((job) => (
                  <Card key={job._id} className="hover:shadow-lg transition-all duration-300 border-slate-100 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-navy group-hover:text-emerald-600 transition-colors">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2 text-sm">
                            {job.description}
                          </CardDescription>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {getCategoryLabel(job.category)}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-navy">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 me-2" />
                              {isRTL ? 'عرض' : 'View'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 me-2" aria-hidden="true" />
                              {isRTL ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(job._id)}
                              disabled={deleteJobMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              {isRTL ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        {getStatusBadge(job.status)}
                        {job.location && (
                          <div className="flex items-center text-slate-500 text-xs">
                            <MapPin className="h-3 w-3 me-1" />
                            {job.location}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-50">
                        <div className="flex items-center font-bold text-navy">
                          <DollarSign className="h-4 w-4 me-1 text-emerald-500" />
                          <span>{job.budget.min.toLocaleString()} - {job.budget.max.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span className="flex items-center text-xs">
                            <Eye className="h-3.5 w-3.5 me-1" />
                            {job.views}
                          </span>
                          <span className="flex items-center text-xs">
                            <Briefcase className="h-3.5 w-3.5 me-1" />
                            {job.proposalsCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && !isError && filteredServices.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    {isRTL ? 'لا توجد وظائف' : 'No jobs found'}
                  </h3>
                  <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                    {isRTL ? 'قم بإضافة وظيفة جديدة أو تعديل معايير البحث' : 'Add a new job or adjust your search criteria'}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-slate-200"
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('all')
                      setStatusFilter('all')
                    }}
                  >
                    {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <JobsSidebar context="my-services" />
        </div>
      </Main>
    </>
  )
}

export default MyServices
