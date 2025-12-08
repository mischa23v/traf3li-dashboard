import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search, Bell, AlertCircle, Receipt, Plus, MoreHorizontal, ChevronLeft,
    Eye, CheckCircle, XCircle, Clock, CreditCard, Building2, Zap, Phone,
    Droplets, Car, GraduationCap, Heart, Home, Wifi, Filter, X, ArrowUpRight
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    useSADADBillers,
    useSADADPayments,
    useInquireSADADBill,
    usePaySADADBill,
    type SADADBiller,
    type SADADPayment
} from '@/hooks/useSaudiBanking'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

// Biller category icons
const categoryIcons: Record<string, any> = {
    'electricity': Zap,
    'water': Droplets,
    'telecom': Phone,
    'internet': Wifi,
    'traffic': Car,
    'education': GraduationCap,
    'health': Heart,
    'housing': Home,
    'government': Building2,
    'default': Receipt,
}

// Sidebar Component
function SADADSidebar() {
    return (
        <div className="space-y-6">
            {/* Quick Pay Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">دفع فاتورة</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-4">
                        ادفع فواتيرك بسهولة عبر نظام سداد
                    </p>
                    <Link to="/dashboard/finance/saudi-banking/sadad/pay">
                        <Button className="w-full bg-purple-500 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
                            <Plus className="h-4 w-4 ms-2" />
                            دفع فاتورة جديدة
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Popular Billers Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        الجهات الأكثر استخداماً
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-navy text-sm">الشركة السعودية للكهرباء</p>
                            <p className="text-xs text-slate-500">فواتير الكهرباء</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Droplets className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-navy text-sm">شركة المياه الوطنية</p>
                            <p className="text-xs text-slate-500">فواتير المياه</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-navy text-sm">STC</p>
                            <p className="text-xs text-slate-500">فواتير الاتصالات</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">إحصائيات الشهر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-600">عدد الفواتير المدفوعة</span>
                        <span className="font-bold text-navy">12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-600">إجمالي المبالغ</span>
                        <span className="font-bold text-navy">3,450 ر.س</span>
                    </div>
                </CardContent>
            </Card>

            {/* Help Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-gradient-to-br from-purple-500 to-purple-600">
                <CardContent className="p-6 text-white">
                    <Receipt className="h-10 w-10 mb-4 text-white/80" />
                    <h3 className="font-bold text-lg mb-2">نظام سداد</h3>
                    <p className="text-sm text-white/80 mb-4">
                        نظام المدفوعات الإلكترونية الموحد في المملكة العربية السعودية
                    </p>
                    <Button variant="secondary" size="sm" className="w-full">
                        معرفة المزيد
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export function SaudiBankingSADADView() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('payments')
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    // Fetch data
    const { data: billersData, isLoading: loadingBillers } = useSADADBillers()
    const { data: paymentsData, isLoading: loadingPayments, isError, error, refetch } = useSADADPayments()

    // Mock data for demo
    const payments: SADADPayment[] = useMemo(() => {
        return paymentsData?.data || [
            {
                _id: '1',
                billerCode: 'SEC',
                billerName: 'الشركة السعودية للكهرباء',
                billNumber: '1234567890',
                amount: 450,
                debitAccount: 'SA0380000000608010167519',
                reference: 'PAY-2025-001',
                status: 'COMPLETED',
                transactionDate: new Date().toISOString(),
                remarks: 'فاتورة ديسمبر',
            },
            {
                _id: '2',
                billerCode: 'NWC',
                billerName: 'شركة المياه الوطنية',
                billNumber: '9876543210',
                amount: 180,
                debitAccount: 'SA0380000000608010167519',
                reference: 'PAY-2025-002',
                status: 'COMPLETED',
                transactionDate: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                _id: '3',
                billerCode: 'STC',
                billerName: 'STC',
                billNumber: '5555555555',
                amount: 299,
                debitAccount: 'SA0380000000608010167519',
                reference: 'PAY-2025-003',
                status: 'COMPLETED',
                transactionDate: new Date(Date.now() - 172800000).toISOString(),
            },
            {
                _id: '4',
                billerCode: 'MOI',
                billerName: 'المرور',
                billNumber: '7777777777',
                amount: 150,
                debitAccount: 'SA0380000000608010167519',
                reference: 'PAY-2025-004',
                status: 'PENDING',
                transactionDate: new Date(Date.now() - 259200000).toISOString(),
                remarks: 'مخالفة مرورية',
            },
        ]
    }, [paymentsData])

    const billers: SADADBiller[] = useMemo(() => {
        return billersData?.data || [
            { billerCode: 'SEC', name: 'Saudi Electricity Company', nameAr: 'الشركة السعودية للكهرباء', category: 'electricity', categoryAr: 'كهرباء', isActive: true },
            { billerCode: 'NWC', name: 'National Water Company', nameAr: 'شركة المياه الوطنية', category: 'water', categoryAr: 'مياه', isActive: true },
            { billerCode: 'STC', name: 'Saudi Telecom Company', nameAr: 'STC', category: 'telecom', categoryAr: 'اتصالات', isActive: true },
            { billerCode: 'MOBILY', name: 'Mobily', nameAr: 'موبايلي', category: 'telecom', categoryAr: 'اتصالات', isActive: true },
            { billerCode: 'ZAIN', name: 'Zain', nameAr: 'زين', category: 'telecom', categoryAr: 'اتصالات', isActive: true },
            { billerCode: 'MOI', name: 'Traffic Violations', nameAr: 'المرور', category: 'traffic', categoryAr: 'مرور', isActive: true },
        ]
    }, [billersData])

    // Hero stats
    const heroStats = useMemo(() => {
        const totalPayments = payments.length
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
        const completedPayments = payments.filter(p => p.status === 'COMPLETED').length

        return [
            { label: 'إجمالي المدفوعات', value: totalPayments, icon: Receipt, status: 'normal' as const },
            { label: 'إجمالي المبالغ', value: `${totalAmount.toLocaleString()} ر.س`, icon: CreditCard, status: 'normal' as const },
            { label: 'مدفوعات ناجحة', value: completedPayments, icon: CheckCircle, status: 'normal' as const },
            { label: 'جهات مسجلة', value: billers.length, icon: Building2, status: 'normal' as const },
        ]
    }, [payments, billers])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0">مكتملة</Badge>
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-700 border-0">معلقة</Badge>
            case 'FAILED':
                return <Badge className="bg-red-100 text-red-700 border-0">فشلت</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getCategoryIcon = (category: string) => {
        const Icon = categoryIcons[category] || categoryIcons.default
        return Icon
    }

    const isLoading = loadingPayments || loadingBillers

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/finance/saudi-banking" className="text-slate-500 hover:text-emerald-600">
                        الخدمات المصرفية
                    </Link>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                    <span className="text-navy font-medium">سداد</span>
                </div>

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="SADAD" title="نظام سداد للمدفوعات" type="finance" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <CardHeader className="pb-0">
                                    <div className="flex items-center justify-between">
                                        <TabsList className="bg-slate-100 p-1 rounded-xl">
                                            <TabsTrigger value="payments" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6">
                                                سجل المدفوعات
                                            </TabsTrigger>
                                            <TabsTrigger value="billers" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6">
                                                الجهات المفوترة
                                            </TabsTrigger>
                                        </TabsList>
                                        <Link to="/dashboard/finance/saudi-banking/sadad/pay">
                                            <Button className="bg-purple-500 hover:bg-purple-600 rounded-xl">
                                                <Plus className="h-4 w-4 ms-2" />
                                                دفع فاتورة
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {/* Payments Tab */}
                                    <TabsContent value="payments" className="m-0">
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map((i) => (
                                                    <Skeleton key={i} className="h-24 rounded-xl" />
                                                ))}
                                            </div>
                                        ) : isError ? (
                                            <div className="text-center py-12">
                                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold text-navy mb-2">حدث خطأ</h3>
                                                <p className="text-slate-500 mb-4">{error?.message}</p>
                                                <Button onClick={() => refetch()} variant="outline">
                                                    إعادة المحاولة
                                                </Button>
                                            </div>
                                        ) : payments.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold text-navy mb-2">لا توجد مدفوعات</h3>
                                                <p className="text-slate-500 mb-4">ابدأ بدفع أول فاتورة</p>
                                                <Link to="/dashboard/finance/saudi-banking/sadad/pay">
                                                    <Button className="bg-purple-500 hover:bg-purple-600">
                                                        <Plus className="h-4 w-4 ms-2" />
                                                        دفع فاتورة
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {payments.map((payment) => (
                                                    <div key={payment._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:shadow-md transition-all">
                                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <Receipt className="h-6 w-6 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-navy">{payment.billerName}</h4>
                                                                {getStatusBadge(payment.status)}
                                                            </div>
                                                            <p className="text-sm text-slate-500">
                                                                رقم الفاتورة: {payment.billNumber} • {format(new Date(payment.transactionDate), 'd MMM yyyy', { locale: arSA })}
                                                            </p>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-bold text-navy text-lg">{payment.amount.toLocaleString()} ر.س</p>
                                                            <p className="text-xs text-slate-500">{payment.reference}</p>
                                                        </div>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Billers Tab */}
                                    <TabsContent value="billers" className="m-0">
                                        {/* Search */}
                                        <div className="flex gap-3 mb-6">
                                            <div className="relative flex-1">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    placeholder="بحث عن جهة..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pe-10 rounded-xl"
                                                />
                                            </div>
                                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                                <SelectTrigger className="w-[150px] rounded-xl">
                                                    <SelectValue placeholder="التصنيف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">الكل</SelectItem>
                                                    <SelectItem value="electricity">كهرباء</SelectItem>
                                                    <SelectItem value="water">مياه</SelectItem>
                                                    <SelectItem value="telecom">اتصالات</SelectItem>
                                                    <SelectItem value="traffic">مرور</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {billers.filter(b => {
                                                const matchesSearch = b.nameAr.includes(searchQuery) || b.name.toLowerCase().includes(searchQuery.toLowerCase())
                                                const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter
                                                return matchesSearch && matchesCategory
                                            }).map((biller) => {
                                                const Icon = getCategoryIcon(biller.category)
                                                return (
                                                    <div key={biller.billerCode} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:shadow-md transition-all cursor-pointer">
                                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                            <Icon className="h-6 w-6 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-navy">{biller.nameAr}</h4>
                                                            <p className="text-sm text-slate-500">{biller.categoryAr}</p>
                                                        </div>
                                                        <ArrowUpRight className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <SADADSidebar />
                </div>
            </Main>
        </>
    )
}
