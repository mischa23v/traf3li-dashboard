import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Search, Bell, AlertCircle, Building2, CreditCard, FileText, Calculator,
    Landmark, ArrowRight, ChevronLeft, Users, TrendingUp, Shield, CheckCircle,
    Wallet, Receipt, Banknote, Globe
} from 'lucide-react'
import { useLeanCustomers, useWPSFiles, useSADADPayments, useMudadCompliance } from '@/hooks/useSaudiBanking'

// Sidebar Widget Component
function SaudiBankingSidebar() {
    return (
        <div className="space-y-6">
            {/* Quick Actions Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link to="/dashboard/finance/saudi-banking/lean">
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-emerald-50 hover:border-emerald-200">
                            <Landmark className="h-5 w-5 text-emerald-600" />
                            <span>ربط حساب بنكي</span>
                        </Button>
                    </Link>
                    <Link to="/dashboard/finance/saudi-banking/wps/new">
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-blue-50 hover:border-blue-200">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span>إنشاء ملف WPS</span>
                        </Button>
                    </Link>
                    <Link to="/dashboard/finance/saudi-banking/sadad/pay">
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-purple-50 hover:border-purple-200">
                            <Receipt className="h-5 w-5 text-purple-600" />
                            <span>دفع فاتورة سداد</span>
                        </Button>
                    </Link>
                    <Link to="/dashboard/finance/saudi-banking/mudad">
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-orange-50 hover:border-orange-200">
                            <Calculator className="h-5 w-5 text-orange-600" />
                            <span>حاسبة التأمينات</span>
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Compliance Status Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        حالة الامتثال
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">نطاقات</span>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">متوافق</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">الحد الأدنى للأجور</span>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">متوافق</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">التأمينات الاجتماعية</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-0">محدث</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Help Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-gradient-to-br from-navy to-navy/90">
                <CardContent className="p-6 text-white">
                    <Globe className="h-10 w-10 mb-4 text-emerald-400" />
                    <h3 className="font-bold text-lg mb-2">الخدمات المصرفية السعودية</h3>
                    <p className="text-sm text-slate-300 mb-4">
                        تكامل كامل مع البنوك السعودية، نظام حماية الأجور، سداد، ومدد
                    </p>
                    <Button variant="secondary" size="sm" className="w-full">
                        دليل الاستخدام
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export function SaudiBankingListView() {
    // Fetch data for stats
    const { data: customersData, isLoading: loadingCustomers } = useLeanCustomers()
    const { data: wpsData, isLoading: loadingWPS } = useWPSFiles({ limit: 5 })
    const { data: paymentsData, isLoading: loadingSADAD } = useSADADPayments({ limit: 5 })

    const isLoading = loadingCustomers || loadingWPS || loadingSADAD

    // Hero stats
    const heroStats = useMemo(() => {
        const linkedBanks = customersData?.data?.length || 0
        const wpsFiles = wpsData?.data?.length || 0
        const sadadPayments = paymentsData?.data?.length || 0

        return [
            { label: 'حسابات مربوطة', value: linkedBanks, icon: Landmark, status: 'normal' as const },
            { label: 'ملفات WPS', value: wpsFiles, icon: FileText, status: 'normal' as const },
            { label: 'مدفوعات سداد', value: sadadPayments, icon: Receipt, status: 'normal' as const },
            { label: 'نسبة السعودة', value: '45%', icon: Users, status: 'normal' as const },
        ]
    }, [customersData, wpsData, paymentsData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
    ]

    // Service cards data
    const services = [
        {
            id: 'lean',
            title: 'Lean Technologies',
            titleAr: 'ربط الحسابات البنكية',
            description: 'ربط الحسابات البنكية السعودية والاطلاع على الأرصدة والمعاملات',
            icon: Landmark,
            color: 'emerald',
            features: ['ربط 14+ بنك سعودي', 'عرض الأرصدة الفورية', 'تاريخ المعاملات', 'تصنيف المعاملات'],
            link: '/dashboard/finance/saudi-banking/lean',
            stats: { label: 'حسابات مربوطة', value: customersData?.data?.length || 0 },
        },
        {
            id: 'wps',
            title: 'WPS',
            titleAr: 'نظام حماية الأجور',
            description: 'إنشاء ملفات WPS لتحويل رواتب الموظفين عبر نظام حماية الأجور',
            icon: FileText,
            color: 'blue',
            features: ['إنشاء ملفات SARIE', 'التحقق من البيانات', 'دعم جميع البنوك', 'تاريخ الملفات'],
            link: '/dashboard/finance/saudi-banking/wps',
            stats: { label: 'ملفات هذا الشهر', value: wpsData?.data?.length || 0 },
        },
        {
            id: 'sadad',
            title: 'SADAD',
            titleAr: 'سداد',
            description: 'دفع الفواتير الحكومية والخدمات عبر نظام سداد',
            icon: Receipt,
            color: 'purple',
            features: ['دفع فواتير الحكومة', 'فواتير الاتصالات', 'فواتير الخدمات', 'تاريخ المدفوعات'],
            link: '/dashboard/finance/saudi-banking/sadad',
            stats: { label: 'مدفوعات هذا الشهر', value: paymentsData?.data?.length || 0 },
        },
        {
            id: 'mudad',
            title: 'Mudad',
            titleAr: 'مدد',
            description: 'حساب التأمينات الاجتماعية والتحقق من الامتثال لنظام نطاقات',
            icon: Calculator,
            color: 'orange',
            features: ['حساب GOSI', 'التحقق من نطاقات', 'الحد الأدنى للأجور', 'تقارير الامتثال'],
            link: '/dashboard/finance/saudi-banking/mudad',
            stats: { label: 'تقارير هذا الشهر', value: 3 },
        },
    ]

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', iconBg: 'bg-emerald-100' },
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', iconBg: 'bg-blue-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', iconBg: 'bg-purple-100' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', iconBg: 'bg-orange-100' },
        }
        return colors[color] || colors.emerald
    }

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
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
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="المالية" title="الخدمات المصرفية السعودية" type="finance" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isLoading ? (
                                // Loading State
                                <>
                                    {[1, 2, 3, 4].map((i) => (
                                        <Card key={i} className="rounded-3xl shadow-sm border-slate-100">
                                            <CardContent className="p-6">
                                                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                                                <Skeleton className="h-6 w-3/4 mb-2" />
                                                <Skeleton className="h-4 w-full mb-4" />
                                                <Skeleton className="h-20 w-full" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </>
                            ) : (
                                // Services Cards
                                services.map((service) => {
                                    const colors = getColorClasses(service.color)
                                    const IconComponent = service.icon
                                    return (
                                        <Card key={service.id} className="rounded-3xl shadow-sm border-slate-100 hover:shadow-md transition-all group">
                                            <CardContent className="p-6">
                                                {/* Icon & Title */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                                                        <IconComponent className={`h-6 w-6 ${colors.text}`} />
                                                    </div>
                                                    <Badge className={`${colors.bg} ${colors.text} border-0`}>
                                                        {service.stats.value} {service.stats.label}
                                                    </Badge>
                                                </div>

                                                {/* Title */}
                                                <h3 className="font-bold text-navy text-lg mb-1">{service.titleAr}</h3>
                                                <p className="text-sm text-slate-500 mb-4">{service.description}</p>

                                                {/* Features */}
                                                <div className="space-y-2 mb-4">
                                                    {service.features.map((feature, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                            <CheckCircle className={`h-4 w-4 ${colors.text}`} />
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Action Button */}
                                                <Link to={service.link as any}>
                                                    <Button className={`w-full ${colors.text} bg-white border ${colors.border} hover:${colors.bg} rounded-xl group-hover:shadow-sm`}>
                                                        <span>الدخول للخدمة</span>
                                                        <ChevronLeft className="h-4 w-4 me-2" />
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            )}
                        </div>

                        {/* Recent Activity Section */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy">النشاط الأخير</CardTitle>
                                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                                        عرض الكل
                                        <ChevronLeft className="h-4 w-4 me-1" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Sample Activity Items */}
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <Landmark className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-navy">تم ربط حساب بنك الراجحي</p>
                                            <p className="text-sm text-slate-500">منذ ساعتين</p>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 border-0">Lean</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-navy">تم إنشاء ملف WPS - ديسمبر 2025</p>
                                            <p className="text-sm text-slate-500">منذ 5 ساعات</p>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-700 border-0">WPS</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Receipt className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-navy">دفع فاتورة الكهرباء - 450 ريال</p>
                                            <p className="text-sm text-slate-500">منذ يوم</p>
                                        </div>
                                        <Badge className="bg-purple-100 text-purple-700 border-0">SADAD</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Calculator className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-navy">تقرير التأمينات الاجتماعية - نوفمبر</p>
                                            <p className="text-sm text-slate-500">منذ 3 أيام</p>
                                        </div>
                                        <Badge className="bg-orange-100 text-orange-700 border-0">Mudad</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <SaudiBankingSidebar />
                </div>
            </Main>
        </>
    )
}
