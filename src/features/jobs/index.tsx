import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase, Plus, Search, Filter, MoreVertical,
  Clock, DollarSign, MapPin, Star, Eye, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, Bell
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

// Mock data for my services
const mockServices = [
  {
    id: '1',
    title: 'استشارات قانونية عامة',
    titleEn: 'General Legal Consultation',
    description: 'تقديم استشارات قانونية شاملة في مختلف المجالات',
    price: 500,
    priceType: 'fixed',
    category: 'consultation',
    status: 'active',
    views: 245,
    orders: 12,
    rating: 4.8,
    reviewCount: 10,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'صياغة العقود التجارية',
    titleEn: 'Commercial Contract Drafting',
    description: 'إعداد وصياغة العقود التجارية والاتفاقيات',
    price: 1500,
    priceType: 'fixed',
    category: 'contracts',
    status: 'active',
    views: 189,
    orders: 8,
    rating: 4.9,
    reviewCount: 7,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    title: 'الترافع أمام المحاكم',
    titleEn: 'Court Representation',
    description: 'تمثيل العملاء والترافع في القضايا المدنية والتجارية',
    price: 200,
    priceType: 'hourly',
    category: 'litigation',
    status: 'paused',
    views: 312,
    orders: 15,
    rating: 4.7,
    reviewCount: 14,
    createdAt: '2024-01-20',
  },
]

const categories = [
  { value: 'all', label: 'جميع الفئات', labelEn: 'All Categories' },
  { value: 'consultation', label: 'استشارات', labelEn: 'Consultations' },
  { value: 'contracts', label: 'عقود', labelEn: 'Contracts' },
  { value: 'litigation', label: 'ترافع', labelEn: 'Litigation' },
  { value: 'registration', label: 'تسجيل', labelEn: 'Registration' },
]

const statuses = [
  { value: 'all', label: 'جميع الحالات', labelEn: 'All Statuses' },
  { value: 'active', label: 'نشط', labelEn: 'Active' },
  { value: 'paused', label: 'متوقف', labelEn: 'Paused' },
  { value: 'draft', label: 'مسودة', labelEn: 'Draft' },
]

export function MyServices() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const topNav = [
    { title: isRTL ? 'خدماتي' : 'My Services', href: '/dashboard/jobs/my-services', isActive: true },
    { title: isRTL ? 'تصفح الوظائف' : 'Browse Jobs', href: '/dashboard/jobs/browse', isActive: false },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"><CheckCircle className="h-3 w-3 me-1" />{isRTL ? 'نشط' : 'Active'}</Badge>
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"><AlertCircle className="h-3 w-3 me-1" aria-hidden="true" />{isRTL ? 'متوقف' : 'Paused'}</Badge>
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0"><XCircle className="h-3 w-3 me-1" />{isRTL ? 'مسودة' : 'Draft'}</Badge>
      default:
        return null
    }
  }

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.title.includes(searchQuery) || service.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
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
                  <p className="text-2xl font-bold text-navy">{mockServices.length}</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'إجمالي الخدمات' : 'Total Services'}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy">35</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'الطلبات المكتملة' : 'Completed Orders'}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Eye className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy">746</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'المشاهدات' : 'Total Views'}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy">4.8</p>
                  <p className="text-xs text-slate-500">{isRTL ? 'متوسط التقييم' : 'Avg Rating'}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-all duration-300 border-slate-100 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-navy group-hover:text-emerald-600 transition-colors">
                          {isRTL ? service.title : service.titleEn}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 text-sm">
                          {service.description}
                        </CardDescription>
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
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 me-2" />
                            {isRTL ? 'حذف' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(service.status)}
                      <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg text-amber-600 border border-amber-100">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="ms-1 text-sm font-bold">{service.rating}</span>
                        <span className="text-amber-400 text-xs ms-1">({service.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-50">
                      <div className="flex items-center font-bold text-navy">
                        <DollarSign className="h-4 w-4 me-1 text-emerald-500" />
                        <span>{service.price} {isRTL ? 'ر.س' : 'SAR'}</span>
                        <span className="ms-1 text-slate-500 font-normal text-xs">/ {service.priceType === 'hourly' ? (isRTL ? 'ساعة' : 'hour') : (isRTL ? 'ثابت' : 'fixed')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="flex items-center text-xs">
                          <Eye className="h-3.5 w-3.5 me-1" />
                          {service.views}
                        </span>
                        <span className="flex items-center text-xs">
                          <Briefcase className="h-3.5 w-3.5 me-1" />
                          {service.orders}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    {isRTL ? 'لا توجد خدمات' : 'No services found'}
                  </h3>
                  <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                    {isRTL ? 'قم بإضافة خدمة جديدة أو تعديل معايير البحث' : 'Add a new service or adjust your search criteria'}
                  </p>
                  <Button variant="outline" className="mt-4 border-slate-200">
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
