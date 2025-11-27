import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase, Search, Filter, MapPin, Clock, DollarSign,
  Building2, Star, ChevronLeft, ChevronRight, Bookmark,
  Eye, Calendar, Users, ArrowUpRight
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
  const { i18n } = useTranslation()
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
    return <Badge className={`${label.color} hover:${label.color}`}>{isRTL ? label.ar : label.en}</Badge>
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
      <Header className="bg-emerald-950 shadow-none relative">
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

      <Main className="bg-slate-50">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isRTL ? 'تصفح الوظائف' : 'Browse Jobs'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRTL ? 'اكتشف فرص العمل القانونية المتاحة' : 'Discover available legal job opportunities'}
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={isRTL ? 'بحث بالعنوان، الشركة...' : 'Search by title, company...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-10"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
          <div className="flex items-center justify-between">
            <p className="text-slate-500">
              {isRTL ? `${filteredJobs.length} وظيفة متاحة` : `${filteredJobs.length} jobs available`}
            </p>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px]">
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
              <Card key={job.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Company Logo Placeholder */}
                    <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">
                              {isRTL ? job.title : job.titleEn}
                            </h3>
                            {job.urgent && (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                {isRTL ? 'عاجل' : 'Urgent'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1">
                            {isRTL ? job.company : job.companyEn}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(job.id)}
                          className={bookmarkedJobs.includes(job.id) ? 'text-amber-500' : 'text-slate-400'}
                        >
                          <Bookmark className={`h-5 w-5 ${bookmarkedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 me-1" />
                          {isRTL ? job.location : job.locationEn}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 me-1" />
                          {isRTL ? job.experience : job.experienceEn}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 me-1" />
                          {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                        </span>
                      </div>

                      <p className="text-slate-600 mt-3 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {getJobTypeBadge(job.type)}
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 me-1" />
                            {formatDate(job.postedAt)}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 me-1" />
                            {job.applicants} {isRTL ? 'متقدم' : 'applicants'}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 me-1" />
                            {job.views}
                          </span>
                        </div>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 mt-3 sm:mt-0">
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
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">
                  {isRTL ? 'لا توجد وظائف مطابقة' : 'No matching jobs found'}
                </h3>
                <p className="text-slate-500 mt-1">
                  {isRTL ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {filteredJobs.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" disabled>
                {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button variant="outline" className="bg-emerald-950 text-white hover:bg-emerald-950/90">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline" size="icon">
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}

export default BrowseJobs
