import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase, Search, Filter, MapPin, Clock, DollarSign,
  Building2, Star, ChevronLeft, ChevronRight, Bookmark,
  Eye, Calendar, Users, ArrowUpRight, Bell
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
  CardFooter,
} from '@/components/ui/card'
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
import { JobsSidebar } from './jobs-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Mock data for job listings
const mockJobs = [
  {
    id: '1',
    title: 'محامي قضايا تجارية',
    titleEn: 'Commercial Litigation Lawyer',
    company: 'شركة المستقبل للمحاماة',
    companyEn: 'Future Law Firm',
    location: 'الرياض',
    locationEn: 'Riyadh',
    type: 'full-time',
    salary: { min: 15000, max: 25000 },
    experience: '3-5 سنوات',
    experienceEn: '3-5 years',
    category: 'litigation',
    description: 'نبحث عن محامٍ متخصص في القضايا التجارية مع خبرة في الترافع أمام المحاكم التجارية',
    postedAt: '2024-11-20',
    applicants: 23,
    views: 156,
    isBookmarked: false,
    urgent: true,
  },
  {
    id: '2',
    title: 'مستشار قانوني - عقود',
    titleEn: 'Legal Consultant - Contracts',
    company: 'مجموعة الراجحي القابضة',
    companyEn: 'Al Rajhi Holding Group',
    location: 'جدة',
    locationEn: 'Jeddah',
    type: 'contract',
    salary: { min: 20000, max: 30000 },
    experience: '5-7 سنوات',
    experienceEn: '5-7 years',
    category: 'contracts',
    description: 'مطلوب مستشار قانوني متخصص في صياغة ومراجعة العقود التجارية والاتفاقيات',
    postedAt: '2024-11-18',
    applicants: 15,
    views: 98,
    isBookmarked: true,
    urgent: false,
  },
  {
    id: '3',
    title: 'محامي ملكية فكرية',
    titleEn: 'Intellectual Property Lawyer',
    company: 'شركة التقنية الحديثة',
    companyEn: 'Modern Tech Company',
    location: 'الدمام',
    locationEn: 'Dammam',
    type: 'full-time',
    salary: { min: 18000, max: 28000 },
    experience: '4-6 سنوات',
    experienceEn: '4-6 years',
    category: 'ip',
    description: 'فرصة للعمل مع شركة تقنية رائدة في مجال حماية الملكية الفكرية وبراءات الاختراع',
    postedAt: '2024-11-22',
    applicants: 8,
    views: 67,
    isBookmarked: false,
    urgent: false,
  },
  {
    id: '4',
    title: 'محامي قضايا عمالية',
    titleEn: 'Labor Law Attorney',
    company: 'مكتب العدالة للمحاماة',
    companyEn: 'Justice Law Office',
    location: 'الرياض',
    locationEn: 'Riyadh',
    type: 'part-time',
    salary: { min: 8000, max: 12000 },
    experience: '2-4 سنوات',
    experienceEn: '2-4 years',
    category: 'labor',
    description: 'نبحث عن محامٍ متخصص في قضايا العمل والعمال للانضمام لفريقنا بدوام جزئي',
    postedAt: '2024-11-21',
    applicants: 31,
    views: 189,
    isBookmarked: false,
    urgent: true,
  },
]

const categories = [
  { value: 'all', label: 'جميع التخصصات', labelEn: 'All Specialties' },
  { value: 'litigation', label: 'ترافع', labelEn: 'Litigation' },
  { value: 'contracts', label: 'عقود', labelEn: 'Contracts' },
  { value: 'ip', label: 'ملكية فكرية', labelEn: 'Intellectual Property' },
  { value: 'labor', label: 'عمالي', labelEn: 'Labor Law' },
  { value: 'corporate', label: 'شركات', labelEn: 'Corporate' },
]

const jobTypes = [
  { value: 'all', label: 'جميع الأنواع', labelEn: 'All Types' },
  { value: 'full-time', label: 'دوام كامل', labelEn: 'Full Time' },
  { value: 'part-time', label: 'دوام جزئي', labelEn: 'Part Time' },
  { value: 'contract', label: 'عقد', labelEn: 'Contract' },
  { value: 'remote', label: 'عن بعد', labelEn: 'Remote' },
]

const locations = [
  { value: 'all', label: 'جميع المدن', labelEn: 'All Cities' },
  { value: 'riyadh', label: 'الرياض', labelEn: 'Riyadh' },
  { value: 'jeddah', label: 'جدة', labelEn: 'Jeddah' },
  { value: 'dammam', label: 'الدمام', labelEn: 'Dammam' },
  { value: 'makkah', label: 'مكة', labelEn: 'Makkah' },
]

export function BrowseJobs() {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>(['2'])

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

  const getJobTypeBadge = (type: string) => {
    const labels: Record<string, { ar: string; en: string; color: string }> = {
      'full-time': { ar: 'دوام كامل', en: 'Full Time', color: 'bg-blue-100 text-blue-700' },
      'part-time': { ar: 'دوام جزئي', en: 'Part Time', color: 'bg-purple-100 text-purple-700' },
      'contract': { ar: 'عقد', en: 'Contract', color: 'bg-amber-100 text-amber-700' },
      'remote': { ar: 'عن بعد', en: 'Remote', color: 'bg-emerald-100 text-emerald-700' },
    }
    const label = labels[type] || { ar: type, en: type, color: 'bg-slate-100 text-slate-700' }
    return <Badge className={`${label.color} hover:${label.color} border-0`}>{isRTL ? label.ar : label.en}</Badge>
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return isRTL ? 'اليوم' : 'Today'
    if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday'
    if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`
    return isRTL ? `منذ ${Math.floor(diffDays / 7)} أسابيع` : `${Math.floor(diffDays / 7)} weeks ago`
  }

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.includes(searchQuery) ||
      job.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.includes(searchQuery) ||
      job.companyEn.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter
    const matchesType = typeFilter === 'all' || job.type === typeFilter
    const matchesLocation = locationFilter === 'all' ||
      job.location.includes(locations.find(l => l.value === locationFilter)?.label || '') ||
      job.locationEn.toLowerCase() === locationFilter
    return matchesSearch && matchesCategory && matchesType && matchesLocation
  })

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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
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
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <ProductivityHero badge={isRTL ? 'الوظائف والخدمات' : 'Jobs & Services'} title={isRTL ? 'تصفح الوظائف' : 'Browse Jobs'} type="jobs" hideButtons={true} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Search and Filters */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      placeholder={isRTL ? 'بحث بالعنوان، الشركة...' : 'Search by title, company...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-10 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="rounded-xl border-slate-200">
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
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {isRTL ? type.label : type.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {isRTL ? loc.label : loc.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between px-2">
              <p className="text-slate-500 font-medium">
                {isRTL ? `${filteredJobs.length} وظيفة متاحة` : `${filteredJobs.length} jobs available`}
              </p>
              <Select defaultValue="recent">
                <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{isRTL ? 'الأحدث' : 'Most Recent'}</SelectItem>
                  <SelectItem value="salary">{isRTL ? 'الراتب الأعلى' : 'Highest Salary'}</SelectItem>
                  <SelectItem value="applicants">{isRTL ? 'الأكثر تقدماً' : 'Most Applied'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-all duration-300 group border-slate-100">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Company Logo Placeholder */}
                      <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                        <Building2 className="h-8 w-8 text-slate-500" aria-hidden="true" />
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-navy group-hover:text-emerald-600 transition-colors">
                                {isRTL ? job.title : job.titleEn}
                              </h3>
                              {job.urgent && (
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">
                                  {isRTL ? 'عاجل' : 'Urgent'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-600 mt-1 font-medium">
                              {isRTL ? job.company : job.companyEn}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBookmark(job.id)}
                            className={bookmarkedJobs.includes(job.id) ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-navy'}
                          >
                            <Bookmark className={`h-5 w-5 ${bookmarkedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <MapPin className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {isRTL ? job.location : job.locationEn}
                          </span>
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <Clock className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {isRTL ? job.experience : job.experienceEn}
                          </span>
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <DollarSign className="h-3.5 w-3.5 me-1 text-slate-500" />
                            {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                          </span>
                        </div>

                        <p className="text-slate-600 mt-3 line-clamp-2 text-sm leading-relaxed">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            {getJobTypeBadge(job.type)}
                            <span className="flex items-center text-xs">
                              <Calendar className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                              {formatDate(job.postedAt)}
                            </span>
                            <span className="flex items-center text-xs">
                              <Users className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                              {job.applicants} {isRTL ? 'متقدم' : 'applicants'}
                            </span>
                            <span className="flex items-center text-xs">
                              <Eye className="h-3.5 w-3.5 me-1" />
                              {job.views}
                            </span>
                          </div>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 mt-3 sm:mt-0 shadow-lg shadow-emerald-500/20 rounded-lg">
                            {isRTL ? 'تقدم الآن' : 'Apply Now'}
                            <ArrowUpRight className="h-4 w-4 ms-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    {isRTL ? 'لا توجد وظائف مطابقة' : 'No matching jobs found'}
                  </h3>
                  <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                    {isRTL ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
                  </p>
                  <Button variant="outline" className="mt-4 border-slate-200">
                    {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button variant="outline" size="icon" disabled className="rounded-lg border-slate-200">
                  {isRTL ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
                </Button>
                <Button variant="outline" className="bg-navy text-white hover:bg-navy/90 border-navy rounded-lg">1</Button>
                <Button variant="outline" className="rounded-lg border-slate-200">2</Button>
                <Button variant="outline" className="rounded-lg border-slate-200">3</Button>
                <Button variant="outline" size="icon" className="rounded-lg border-slate-200">
                  {isRTL ? <ChevronLeft className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <JobsSidebar context="browse-jobs" />
        </div>
      </Main>
    </>
  )
}

export default BrowseJobs
