import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Gavel, Search, Download, ExternalLink,
  Calendar, FileText, Bookmark, Eye, Building2, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
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
import { KnowledgeSidebar } from './knowledge-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Mock judgments data
const mockJudgments = [
  {
    id: '1',
    title: 'حكم في قضية فصل تعسفي',
    titleEn: 'Judgment on Unfair Dismissal Case',
    caseNumber: '1445/12345',
    court: 'المحكمة العمالية - الرياض',
    courtEn: 'Labor Court - Riyadh',
    category: 'labor',
    date: '1445/06/15',
    summary: 'حكمت المحكمة بإلزام صاحب العمل بدفع تعويض للعامل المفصول تعسفياً',
    summaryEn: 'The court ruled that the employer must compensate the unfairly dismissed employee',
    views: 1250,
    downloads: 320,
    isBookmarked: true,
  },
  {
    id: '2',
    title: 'حكم في نزاع تجاري',
    titleEn: 'Commercial Dispute Judgment',
    caseNumber: '1445/23456',
    court: 'المحكمة التجارية - جدة',
    courtEn: 'Commercial Court - Jeddah',
    category: 'commercial',
    date: '1445/05/20',
    summary: 'حكمت المحكمة بفسخ العقد وإلزام المدعى عليه بالتعويض',
    summaryEn: 'The court ruled to terminate the contract and obligate the defendant to compensate',
    views: 980,
    downloads: 210,
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'حكم في قضية أحوال شخصية',
    titleEn: 'Personal Status Case Judgment',
    caseNumber: '1445/34567',
    court: 'محكمة الأحوال الشخصية - الدمام',
    courtEn: 'Personal Status Court - Dammam',
    category: 'family',
    date: '1445/04/10',
    summary: 'حكمت المحكمة بالنفقة للزوجة والأطفال',
    summaryEn: 'The court ruled alimony for the wife and children',
    views: 2100,
    downloads: 450,
    isBookmarked: true,
  },
  {
    id: '4',
    title: 'حكم في قضية جنائية',
    titleEn: 'Criminal Case Judgment',
    caseNumber: '1445/45678',
    court: 'المحكمة الجزائية - الرياض',
    courtEn: 'Criminal Court - Riyadh',
    category: 'criminal',
    date: '1445/03/25',
    summary: 'حكمت المحكمة ببراءة المتهم لعدم كفاية الأدلة',
    summaryEn: 'The court ruled the defendant not guilty due to insufficient evidence',
    views: 3500,
    downloads: 890,
    isBookmarked: false,
  },
]

const categories = [
  { value: 'all', label: 'جميع الأحكام', labelEn: 'All Judgments' },
  { value: 'labor', label: 'عمالي', labelEn: 'Labor' },
  { value: 'commercial', label: 'تجاري', labelEn: 'Commercial' },
  { value: 'family', label: 'أحوال شخصية', labelEn: 'Family' },
  { value: 'criminal', label: 'جنائي', labelEn: 'Criminal' },
  { value: 'administrative', label: 'إداري', labelEn: 'Administrative' },
]

const courts = [
  { value: 'all', label: 'جميع المحاكم', labelEn: 'All Courts' },
  { value: 'labor', label: 'المحكمة العمالية', labelEn: 'Labor Court' },
  { value: 'commercial', label: 'المحكمة التجارية', labelEn: 'Commercial Court' },
  { value: 'family', label: 'محكمة الأحوال الشخصية', labelEn: 'Personal Status Court' },
  { value: 'criminal', label: 'المحكمة الجزائية', labelEn: 'Criminal Court' },
]

export function JudgmentsView() {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [courtFilter, setCourtFilter] = useState('all')
  const [bookmarkedJudgments, setBookmarkedJudgments] = useState<string[]>(['1', '3'])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const topNav = [
    { title: isRTL ? 'القوانين' : 'Laws', href: '/dashboard/knowledge/laws', isActive: false },
    { title: isRTL ? 'الأحكام' : 'Judgments', href: '/dashboard/knowledge/judgments', isActive: true },
    { title: isRTL ? 'النماذج' : 'Forms', href: '/dashboard/knowledge/forms', isActive: false },
  ]

  const toggleBookmark = (id: string) => {
    setBookmarkedJudgments(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const getCategoryBadge = (category: string) => {
    const config: Record<string, { color: string; label: string; labelEn: string }> = {
      labor: { color: 'bg-blue-100 text-blue-700', label: 'عمالي', labelEn: 'Labor' },
      commercial: { color: 'bg-emerald-100 text-emerald-700', label: 'تجاري', labelEn: 'Commercial' },
      family: { color: 'bg-pink-100 text-pink-700', label: 'أحوال شخصية', labelEn: 'Family' },
      criminal: { color: 'bg-red-100 text-red-700', label: 'جنائي', labelEn: 'Criminal' },
      administrative: { color: 'bg-amber-100 text-amber-700', label: 'إداري', labelEn: 'Administrative' },
    }
    const cat = config[category] || { color: 'bg-slate-100 text-slate-700', label: category, labelEn: category }
    return <Badge className={`${cat.color} hover:${cat.color} border-0`}>{isRTL ? cat.label : cat.labelEn}</Badge>
  }

  const filteredJudgments = mockJudgments.filter(judgment => {
    const matchesSearch = judgment.title.includes(searchQuery) ||
      judgment.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judgment.caseNumber.includes(searchQuery)
    const matchesCategory = categoryFilter === 'all' || judgment.category === categoryFilter
    return matchesSearch && matchesCategory
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
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge={isRTL ? 'قاعدة المعرفة' : 'Knowledge Base'}
          title={isRTL ? 'الأحكام' : 'Judgments'}
          type="judgments"
        />

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
                      placeholder={isRTL ? 'بحث بالعنوان أو رقم القضية...' : 'Search by title or case number...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-10 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Select value={courtFilter} onValueChange={setCourtFilter}>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map((court) => (
                          <SelectItem key={court.value} value={court.value}>
                            {isRTL ? court.label : court.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Judgments List */}
            <div className="space-y-4">
              {/* Loading State */}
              {isLoading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-slate-100">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          {/* Icon Skeleton */}
                          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />

                          {/* Content Skeleton */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Skeleton className="h-6 w-64" />
                                  <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                              </div>
                              <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>

                            {/* Meta Info Skeleton */}
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                              <Skeleton className="h-6 w-32 rounded-lg" />
                              <Skeleton className="h-6 w-40 rounded-lg" />
                              <Skeleton className="h-6 w-24 rounded-lg" />
                            </div>

                            {/* Actions Skeleton */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                              <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-9 w-24 rounded-lg" />
                                <Skeleton className="h-9 w-20 rounded-lg" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* Judgments Data */}
              {!isLoading && filteredJudgments.map((judgment) => (
                <Card key={judgment.id} className="hover:shadow-lg transition-all duration-300 group border-slate-100">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Icon */}
                      <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                        <Gavel className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-navy group-hover:text-emerald-600 transition-colors">
                                {isRTL ? judgment.title : judgment.titleEn}
                              </h3>
                              {getCategoryBadge(judgment.category)}
                            </div>
                            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                              {isRTL ? judgment.summary : judgment.summaryEn}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBookmark(judgment.id)}
                            className={bookmarkedJudgments.includes(judgment.id) ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-navy'}
                          >
                            <Bookmark className={`h-5 w-5 ${bookmarkedJudgments.includes(judgment.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <FileText className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {isRTL ? 'رقم القضية:' : 'Case #:'} {judgment.caseNumber}
                          </span>
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <Building2 className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {isRTL ? judgment.court : judgment.courtEn}
                          </span>
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <Calendar className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {judgment.date}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center text-xs">
                              <Eye className="h-3.5 w-3.5 me-1" />
                              {judgment.views.toLocaleString()}
                            </span>
                            <span className="flex items-center text-xs">
                              <Download className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                              {judgment.downloads.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 rounded-lg border-slate-200">
                              <Download className="h-4 w-4 me-1" aria-hidden="true" />
                              {isRTL ? 'تحميل' : 'Download'}
                            </Button>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-9 rounded-lg shadow-lg shadow-emerald-500/20">
                              <ExternalLink className="h-4 w-4 me-1" aria-hidden="true" />
                              {isRTL ? 'عرض' : 'View'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!isLoading && filteredJudgments.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    {isRTL ? 'لا توجد أحكام مطابقة' : 'No matching judgments found'}
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
          </div>

          {/* Sidebar */}
          <KnowledgeSidebar context="judgments" />
        </div>
      </Main>
    </>
  )
}

export default JudgmentsView
