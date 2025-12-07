import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Scale, Search, Download, ExternalLink,
  Calendar, FileText, Bookmark,
  Eye, Clock, Bell
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

// Mock laws data
const mockLaws = [
  {
    id: '1',
    title: 'نظام العمل',
    titleEn: 'Labor Law',
    description: 'نظام العمل الصادر بالمرسوم الملكي رقم م/51 وتاريخ 23/8/1426هـ',
    descriptionEn: 'Labor Law issued by Royal Decree No. M/51 dated 23/8/1426H',
    category: 'labor',
    issueDate: '1426/08/23',
    lastUpdate: '1444/06/15',
    articles: 245,
    views: 12500,
    downloads: 3200,
    isBookmarked: true,
  },
  {
    id: '2',
    title: 'نظام الشركات',
    titleEn: 'Companies Law',
    description: 'نظام الشركات الصادر بالمرسوم الملكي رقم م/3 وتاريخ 28/1/1437هـ',
    descriptionEn: 'Companies Law issued by Royal Decree No. M/3 dated 28/1/1437H',
    category: 'commercial',
    issueDate: '1437/01/28',
    lastUpdate: '1443/12/01',
    articles: 230,
    views: 9800,
    downloads: 2100,
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'نظام المرافعات الشرعية',
    titleEn: 'Sharia Procedure Law',
    description: 'نظام المرافعات الشرعية الصادر بالمرسوم الملكي رقم م/1 وتاريخ 22/1/1435هـ',
    descriptionEn: 'Sharia Procedure Law issued by Royal Decree No. M/1 dated 22/1/1435H',
    category: 'civil',
    issueDate: '1435/01/22',
    lastUpdate: '1442/09/10',
    articles: 300,
    views: 15200,
    downloads: 4500,
    isBookmarked: true,
  },
  {
    id: '4',
    title: 'نظام التنفيذ',
    titleEn: 'Enforcement Law',
    description: 'نظام التنفيذ الصادر بالمرسوم الملكي رقم م/53 وتاريخ 13/8/1433هـ',
    descriptionEn: 'Enforcement Law issued by Royal Decree No. M/53 dated 13/8/1433H',
    category: 'civil',
    issueDate: '1433/08/13',
    lastUpdate: '1444/03/20',
    articles: 98,
    views: 8900,
    downloads: 2800,
    isBookmarked: false,
  },
]

const categories = [
  { value: 'all', label: 'جميع الأنظمة', labelEn: 'All Laws' },
  { value: 'labor', label: 'أنظمة العمل', labelEn: 'Labor Laws' },
  { value: 'commercial', label: 'أنظمة تجارية', labelEn: 'Commercial Laws' },
  { value: 'civil', label: 'أنظمة مدنية', labelEn: 'Civil Laws' },
  { value: 'criminal', label: 'أنظمة جنائية', labelEn: 'Criminal Laws' },
  { value: 'administrative', label: 'أنظمة إدارية', labelEn: 'Administrative Laws' },
]

export function LawsView() {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [bookmarkedLaws, setBookmarkedLaws] = useState<string[]>(['1', '3'])

  const topNav = [
    { title: isRTL ? 'القوانين' : 'Laws', href: '/dashboard/knowledge/laws', isActive: true },
    { title: isRTL ? 'الأحكام' : 'Judgments', href: '/dashboard/knowledge/judgments', isActive: false },
    { title: isRTL ? 'النماذج' : 'Forms', href: '/dashboard/knowledge/forms', isActive: false },
  ]

  const toggleBookmark = (lawId: string) => {
    setBookmarkedLaws(prev =>
      prev.includes(lawId)
        ? prev.filter(id => id !== lawId)
        : [...prev, lawId]
    )
  }

  const getCategoryBadge = (category: string) => {
    const config: Record<string, { color: string; label: string; labelEn: string }> = {
      labor: { color: 'bg-blue-100 text-blue-700', label: 'عمل', labelEn: 'Labor' },
      commercial: { color: 'bg-emerald-100 text-emerald-700', label: 'تجاري', labelEn: 'Commercial' },
      civil: { color: 'bg-purple-100 text-purple-700', label: 'مدني', labelEn: 'Civil' },
      criminal: { color: 'bg-red-100 text-red-700', label: 'جنائي', labelEn: 'Criminal' },
      administrative: { color: 'bg-amber-100 text-amber-700', label: 'إداري', labelEn: 'Administrative' },
    }
    const cat = config[category] || { color: 'bg-slate-100 text-slate-700', label: category, labelEn: category }
    return <Badge className={`${cat.color} hover:${cat.color} border-0`}>{isRTL ? cat.label : cat.labelEn}</Badge>
  }

  const filteredLaws = mockLaws.filter(law => {
    const matchesSearch = law.title.includes(searchQuery) ||
      law.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.description.includes(searchQuery)
    const matchesCategory = categoryFilter === 'all' || law.category === categoryFilter
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
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge={isRTL ? 'قاعدة المعرفة' : 'Knowledge Base'}
          title={isRTL ? 'الأنظمة' : 'Laws'}
          type="laws"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Search and Filters */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      placeholder={isRTL ? 'بحث في الأنظمة...' : 'Search laws...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-10 rounded-xl border-slate-200"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-slate-200">
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
                </div>
              </CardContent>
            </Card>

            {/* Laws List */}
            <div className="space-y-4">
              {filteredLaws.map((law) => (
                <Card key={law.id} className="hover:shadow-lg transition-all duration-300 group border-slate-100">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Icon */}
                      <div className="h-14 w-14 bg-navy/5 rounded-2xl flex items-center justify-center shrink-0 border border-navy/10 group-hover:bg-navy group-hover:text-white transition-colors duration-300">
                        <Scale className="h-7 w-7 text-navy group-hover:text-white transition-colors" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-navy group-hover:text-emerald-600 transition-colors">
                                {isRTL ? law.title : law.titleEn}
                              </h3>
                              {getCategoryBadge(law.category)}
                            </div>
                            <p className="text-slate-600 mt-2 line-clamp-2 text-sm leading-relaxed">
                              {isRTL ? law.description : law.descriptionEn}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBookmark(law.id)}
                            className={bookmarkedLaws.includes(law.id) ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-navy'}
                          >
                            <Bookmark className={`h-5 w-5 ${bookmarkedLaws.includes(law.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <Calendar className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {isRTL ? 'تاريخ الإصدار:' : 'Issued:'} {law.issueDate}
                          </span>
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <Clock className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {isRTL ? 'آخر تحديث:' : 'Updated:'} {law.lastUpdate}
                          </span>
                          <span className="flex items-center bg-slate-50 px-2 py-1 rounded-lg">
                            <FileText className="h-3.5 w-3.5 me-1 text-slate-500" aria-hidden="true" />
                            {law.articles} {isRTL ? 'مادة' : 'articles'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center text-xs">
                              <Eye className="h-3.5 w-3.5 me-1" />
                              {law.views.toLocaleString()}
                            </span>
                            <span className="flex items-center text-xs">
                              <Download className="h-3.5 w-3.5 me-1" aria-hidden="true" />
                              {law.downloads.toLocaleString()}
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

            {filteredLaws.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    {isRTL ? 'لا توجد أنظمة مطابقة' : 'No matching laws found'}
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
          <KnowledgeSidebar context="laws" />
        </div>
      </Main>
    </>
  )
}

export default LawsView
