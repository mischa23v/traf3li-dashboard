import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText, Search, Download, ExternalLink, Calendar,
  Bookmark, Eye, FolderOpen, File, FileSpreadsheet,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
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

// Mock forms data
const mockForms = [
  {
    id: '1',
    title: 'نموذج وكالة عامة',
    titleEn: 'General Power of Attorney Template',
    description: 'نموذج وكالة عامة شاملة لجميع التصرفات القانونية',
    descriptionEn: 'Comprehensive general power of attorney for all legal actions',
    category: 'poa',
    format: 'docx',
    size: '45 KB',
    downloads: 3500,
    views: 8900,
    lastUpdate: '2024-10-15',
    isBookmarked: true,
  },
  {
    id: '2',
    title: 'عقد بيع عقار',
    titleEn: 'Real Estate Sale Contract',
    description: 'نموذج عقد بيع عقار متوافق مع الأنظمة السعودية',
    descriptionEn: 'Real estate sale contract template compliant with Saudi regulations',
    category: 'contracts',
    format: 'docx',
    size: '78 KB',
    downloads: 2800,
    views: 6500,
    lastUpdate: '2024-09-20',
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'صحيفة دعوى عمالية',
    titleEn: 'Labor Lawsuit Form',
    description: 'نموذج صحيفة دعوى للمحكمة العمالية',
    descriptionEn: 'Lawsuit form template for labor court',
    category: 'lawsuits',
    format: 'pdf',
    size: '120 KB',
    downloads: 4200,
    views: 9800,
    lastUpdate: '2024-11-01',
    isBookmarked: true,
  },
  {
    id: '4',
    title: 'عقد إيجار موحد',
    titleEn: 'Unified Rental Contract',
    description: 'النموذج الموحد لعقد الإيجار السكني',
    descriptionEn: 'Unified residential rental contract template',
    category: 'contracts',
    format: 'pdf',
    size: '95 KB',
    downloads: 5600,
    views: 12000,
    lastUpdate: '2024-08-15',
    isBookmarked: false,
  },
  {
    id: '5',
    title: 'نموذج تأسيس شركة',
    titleEn: 'Company Formation Template',
    description: 'نموذج عقد تأسيس شركة ذات مسؤولية محدودة',
    descriptionEn: 'LLC company formation agreement template',
    category: 'corporate',
    format: 'docx',
    size: '156 KB',
    downloads: 2100,
    views: 4500,
    lastUpdate: '2024-10-01',
    isBookmarked: false,
  },
  {
    id: '6',
    title: 'إقرار استلام',
    titleEn: 'Receipt Acknowledgment',
    description: 'نموذج إقرار باستلام مبالغ أو مستندات',
    descriptionEn: 'Acknowledgment template for receiving amounts or documents',
    category: 'general',
    format: 'docx',
    size: '25 KB',
    downloads: 1800,
    views: 3200,
    lastUpdate: '2024-07-10',
    isBookmarked: false,
  },
]

const categories = [
  { value: 'all', label: 'جميع النماذج', labelEn: 'All Forms' },
  { value: 'contracts', label: 'عقود', labelEn: 'Contracts' },
  { value: 'poa', label: 'وكالات', labelEn: 'Powers of Attorney' },
  { value: 'lawsuits', label: 'صحائف دعوى', labelEn: 'Lawsuits' },
  { value: 'corporate', label: 'شركات', labelEn: 'Corporate' },
  { value: 'general', label: 'عام', labelEn: 'General' },
]

const formats = [
  { value: 'all', label: 'جميع الصيغ', labelEn: 'All Formats' },
  { value: 'docx', label: 'Word', labelEn: 'Word' },
  { value: 'pdf', label: 'PDF', labelEn: 'PDF' },
  { value: 'xlsx', label: 'Excel', labelEn: 'Excel' },
]

export function FormsView() {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [bookmarkedForms, setBookmarkedForms] = useState<string[]>(['1', '3'])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const topNav = [
    { title: isRTL ? 'القوانين' : 'Laws', href: '/dashboard/knowledge/laws', isActive: false },
    { title: isRTL ? 'الأحكام' : 'Judgments', href: '/dashboard/knowledge/judgments', isActive: false },
    { title: isRTL ? 'النماذج' : 'Forms', href: '/dashboard/knowledge/forms', isActive: true },
  ]

  const toggleBookmark = (id: string) => {
    setBookmarkedForms(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const getCategoryBadge = (category: string) => {
    const config: Record<string, { color: string; label: string; labelEn: string }> = {
      contracts: { color: 'bg-blue-100 text-blue-700', label: 'عقود', labelEn: 'Contracts' },
      poa: { color: 'bg-emerald-100 text-emerald-700', label: 'وكالات', labelEn: 'POA' },
      lawsuits: { color: 'bg-purple-100 text-purple-700', label: 'صحائف دعوى', labelEn: 'Lawsuits' },
      corporate: { color: 'bg-amber-100 text-amber-700', label: 'شركات', labelEn: 'Corporate' },
      general: { color: 'bg-slate-100 text-slate-700', label: 'عام', labelEn: 'General' },
    }
    const cat = config[category] || { color: 'bg-slate-100 text-slate-700', label: category, labelEn: category }
    return <Badge className={`${cat.color} hover:${cat.color} border-0`}>{isRTL ? cat.label : cat.labelEn}</Badge>
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-600" aria-hidden="true" />
      case 'pdf':
        return <File className="h-6 w-6 text-red-600" aria-hidden="true" />
      case 'xlsx':
        return <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
      default:
        return <FileText className="h-6 w-6 text-slate-600" aria-hidden="true" />
    }
  }

  const getFormatBadge = (format: string) => {
    const config: Record<string, string> = {
      docx: 'bg-blue-100 text-blue-700',
      pdf: 'bg-red-100 text-red-700',
      xlsx: 'bg-emerald-100 text-emerald-700',
    }
    return <Badge className={`${config[format] || 'bg-slate-100 text-slate-700'} hover:${config[format]} border-0`}>{format.toUpperCase()}</Badge>
  }

  const filteredForms = mockForms.filter(form => {
    const matchesSearch = form.title.includes(searchQuery) ||
      form.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.includes(searchQuery)
    const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter
    const matchesFormat = formatFilter === 'all' || form.format === formatFilter
    return matchesSearch && matchesCategory && matchesFormat
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
          title={isRTL ? 'النماذج' : 'Forms'}
          type="forms"
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
                      placeholder={isRTL ? 'بحث في النماذج...' : 'Search forms...'}
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
                    <Select value={formatFilter} onValueChange={setFormatFilter}>
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {isRTL ? format.label : format.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Loading State */}
              {isLoading && (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-slate-100">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Skeleton className="h-12 w-12 rounded-xl" />
                          <Skeleton className="h-5 w-5 rounded" />
                        </div>

                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-5/6 mb-4" />

                        <div className="flex items-center gap-2 mb-4">
                          <Skeleton className="h-6 w-20 rounded-md" />
                          <Skeleton className="h-6 w-16 rounded-md" />
                          <Skeleton className="h-6 w-14 rounded-md" />
                        </div>

                        <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-50">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>

                        <div className="flex gap-2">
                          <Skeleton className="h-9 flex-1 rounded-lg" />
                          <Skeleton className="h-9 flex-1 rounded-lg" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* Forms List */}
              {!isLoading && filteredForms.map((form) => (
                <Card key={form.id} className="hover:shadow-lg transition-all duration-300 group border-slate-100">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                        {getFormatIcon(form.format)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleBookmark(form.id)}
                        className={bookmarkedForms.includes(form.id) ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-navy'}
                      >
                        <Bookmark className={`h-5 w-5 ${bookmarkedForms.includes(form.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    <h3 className="font-bold text-lg text-navy group-hover:text-emerald-600 transition-colors mb-2 line-clamp-1">
                      {isRTL ? form.title : form.titleEn}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">
                      {isRTL ? form.description : form.descriptionEn}
                    </p>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {getCategoryBadge(form.category)}
                      {getFormatBadge(form.format)}
                      <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{form.size}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-4 border-t border-slate-50">
                      <span className="flex items-center">
                        <Eye className="h-3.5 w-3.5 me-1" />
                        {form.views.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Download className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                        {form.downloads.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                        {form.lastUpdate}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-slate-200">
                        <ExternalLink className="h-4 w-4 me-1" aria-hidden="true" />
                        {isRTL ? 'معاينة' : 'Preview'}
                      </Button>
                      <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                        <Download className="h-4 w-4 me-1" aria-hidden="true" />
                        {isRTL ? 'تحميل' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {!isLoading && filteredForms.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-300" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    {isRTL ? 'لا توجد نماذج مطابقة' : 'No matching forms found'}
                  </h3>
                  <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                    {isRTL ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-slate-200"
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('all')
                      setFormatFilter('all')
                    }}
                  >
                    {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <KnowledgeSidebar context="forms" />
        </div>
      </Main>
    </>
  )
}

export default FormsView
