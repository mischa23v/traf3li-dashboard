import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase, Plus, Search, Filter, MoreVertical,
  Clock, DollarSign, MapPin, Star, Eye, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle
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
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle className="h-3 w-3 me-1" />{isRTL ? 'نشط' : 'Active'}</Badge>
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><AlertCircle className="h-3 w-3 me-1" />{isRTL ? 'متوقف' : 'Paused'}</Badge>
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100"><XCircle className="h-3 w-3 me-1" />{isRTL ? 'مسودة' : 'Draft'}</Badge>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy">
                {isRTL ? 'خدماتي' : 'My Services'}
              </h1>
              <p className="text-slate-500 mt-1">
                {isRTL ? 'إدارة الخدمات القانونية التي تقدمها' : 'Manage your legal services'}
              </p>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? 'إضافة خدمة جديدة' : 'Add New Service'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'إجمالي الخدمات' : 'Total Services'}</p>
                    <p className="text-2xl font-bold text-navy">{mockServices.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'الطلبات المكتملة' : 'Completed Orders'}</p>
                    <p className="text-2xl font-bold text-navy">35</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'المشاهدات' : 'Total Views'}</p>
                    <p className="text-2xl font-bold text-navy">746</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{isRTL ? 'متوسط التقييم' : 'Avg Rating'}</p>
                    <p className="text-2xl font-bold text-navy">4.8</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={isRTL ? 'بحث في الخدمات...' : 'Search services...'}
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {isRTL ? service.title : service.titleEn}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 me-2" />
                          {isRTL ? 'عرض' : 'View'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 me-2" />
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
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ms-1 text-sm font-medium">{service.rating}</span>
                      <span className="text-slate-400 text-xs ms-1">({service.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 me-1" />
                      <span className="font-medium text-navy">{service.price} {isRTL ? 'ر.س' : 'SAR'}</span>
                      <span className="ms-1">/ {service.priceType === 'hourly' ? (isRTL ? 'ساعة' : 'hour') : (isRTL ? 'ثابت' : 'fixed')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 me-1" />
                        {service.views}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 me-1" />
                        {service.orders}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">
                  {isRTL ? 'لا توجد خدمات' : 'No services found'}
                </h3>
                <p className="text-slate-500 mt-1">
                  {isRTL ? 'قم بإضافة خدمة جديدة أو تعديل معايير البحث' : 'Add a new service or adjust your search criteria'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Main>
    </>
  )
}

export default MyServices
