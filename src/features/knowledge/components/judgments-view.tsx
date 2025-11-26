import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Gavel, Search, Filter, BookOpen, Download, ExternalLink,
  Calendar, FileText, Bookmark, Eye, Building2, Scale
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
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [courtFilter, setCourtFilter] = useState('all')
  const [bookmarkedJudgments, setBookmarkedJudgments] = useState<string[]>(['1', '3'])

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
    return <Badge className={`${cat.color} hover:${cat.color}`}>{isRTL ? cat.label : cat.labelEn}</Badge>
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
            <h1 className="text-2xl font-bold text-navy">
              {isRTL ? 'الأحكام القضائية' : 'Court Judgments'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRTL ? 'مكتبة شاملة للأحكام والسوابق القضائية' : 'Comprehensive library of court judgments and precedents'}
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={isRTL ? 'بحث بالعنوان أو رقم القضية...' : 'Search by title or case number...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                  <SelectTrigger className="w-full sm:w-[200px]">
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
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Gavel className="h-8 w-8 mx-auto text-navy mb-2" />
                <div className="text-2xl font-bold text-navy">{mockJudgments.length}</div>
                <div className="text-sm text-slate-500">{isRTL ? 'حكم متاح' : 'Available Judgments'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                <div className="text-2xl font-bold text-navy">5</div>
                <div className="text-sm text-slate-500">{isRTL ? 'محكمة' : 'Courts'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-navy">7.8K</div>
                <div className="text-sm text-slate-500">{isRTL ? 'إجمالي المشاهدات' : 'Total Views'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Download className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-navy">1.9K</div>
                <div className="text-sm text-slate-500">{isRTL ? 'إجمالي التحميلات' : 'Total Downloads'}</div>
              </CardContent>
            </Card>
          </div>

          {/* Judgments List */}
          <div className="space-y-4">
            {filteredJudgments.map((judgment) => (
              <Card key={judgment.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon */}
                    <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                      <Gavel className="h-7 w-7 text-purple-600" />
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
                          <p className="text-slate-600 mt-2">
                            {isRTL ? judgment.summary : judgment.summaryEn}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(judgment.id)}
                          className={bookmarkedJudgments.includes(judgment.id) ? 'text-amber-500' : 'text-slate-400'}
                        >
                          <Bookmark className={`h-5 w-5 ${bookmarkedJudgments.includes(judgment.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 me-1" />
                          {isRTL ? 'رقم القضية:' : 'Case #:'} {judgment.caseNumber}
                        </span>
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 me-1" />
                          {isRTL ? judgment.court : judgment.courtEn}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 me-1" />
                          {judgment.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 me-1" />
                            {judgment.views.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Download className="h-4 w-4 me-1" />
                            {judgment.downloads.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 me-1" />
                            {isRTL ? 'تحميل' : 'Download'}
                          </Button>
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                            <ExternalLink className="h-4 w-4 me-1" />
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

          {filteredJudgments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Gavel className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">
                  {isRTL ? 'لا توجد أحكام مطابقة' : 'No matching judgments found'}
                </h3>
                <p className="text-slate-500 mt-1">
                  {isRTL ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Main>
    </>
  )
}

export default JudgmentsView
