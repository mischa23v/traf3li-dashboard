import { useState, useMemo } from 'react'
import {
    ArrowLeft, Calendar, TrendingUp, TrendingDown, RefreshCw,
    DollarSign, ArrowRightLeft, Globe, AlertCircle, Loader2,
    Download, Share2, Edit, Trash2, MoreHorizontal, Bell, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useExchangeRate, useRateHistory, useConvertCurrency } from '@/hooks/useFinanceAdvanced'
import { ProductivityHero } from '@/components/productivity-hero'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export function CurrencyDetailsView() {
    const { rateId } = useParams({ strict: false }) as { rateId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('details')

    // Parse rateId (format: "USD-SAR")
    const [fromCurrency, toCurrency] = rateId?.split('-') || ['USD', 'SAR']

    // Converter state
    const [convertAmount, setConvertAmount] = useState('100')
    const [convertFrom, setConvertFrom] = useState<'from' | 'to'>('from')

    // Fetch data
    const { data: rateData, isLoading, isError, error, refetch } = useExchangeRate(fromCurrency, toCurrency)
    const { data: historyData, isLoading: historyLoading } = useRateHistory(fromCurrency, toCurrency, {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    })
    const convertMutation = useConvertCurrency()

    // Transform rate data
    const rate = useMemo(() => {
        if (!rateData?.data) return null

        const r = rateData.data
        return {
            fromCurrency: r.fromCurrency || fromCurrency,
            toCurrency: r.toCurrency || toCurrency,
            rate: r.rate || 0,
            inverseRate: r.rate ? (1 / r.rate) : 0,
            lastUpdated: r.lastUpdated,
            source: r.source || 'manual',
            isAutoUpdate: r.isAutoUpdate || false,
            change24h: r.change24h || 0,
        }
    }, [rateData, fromCurrency, toCurrency])

    // Transform history data
    const history = useMemo(() => {
        if (!historyData?.data) return []

        return historyData.data.map((h: any) => ({
            date: h.date,
            rate: h.rate,
            change: h.change || 0,
        }))
    }, [historyData])

    // Calculate conversion
    const convertedAmount = useMemo(() => {
        if (!rate || !convertAmount || parseFloat(convertAmount) <= 0) return '0.00'

        const amount = parseFloat(convertAmount)
        if (convertFrom === 'from') {
            return (amount * rate.rate).toFixed(2)
        } else {
            return (amount * rate.inverseRate).toFixed(2)
        }
    }, [rate, convertAmount, convertFrom])

    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'غير محدد'
        const date = new Date(dateString)
        return format(date, 'd MMMM yyyy HH:mm', { locale: arSA })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'العملات', href: '/dashboard/finance/currency', isActive: true },
    ]

    // LOADING STATE
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8">
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    // ERROR STATE
    if (isError || !rate) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                            <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to="/dashboard/finance/currency" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                            العودة إلى العملات
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل سعر الصرف</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" aria-hidden="true" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // SUCCESS STATE
    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/currency" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                        العودة إلى العملات
                    </Link>
                </div>

                <ProductivityHero
                    badge="سعر الصرف"
                    title={`${rate.fromCurrency} / ${rate.toCurrency}`}
                    type="currency"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* RATE CARD */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold text-slate-800">معلومات سعر الصرف</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" aria-label="خيارات">
                                                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Edit className="h-4 w-4 ms-2" aria-hidden="true" />
                                                تعديل السعر
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <RefreshCw className="h-4 w-4 ms-2" aria-hidden="true" />
                                                تحديث الآن
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                                                تصدير السجل
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Share2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                مشاركة
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                حذف
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                                        <div className="text-sm text-emerald-700 mb-2">السعر الحالي</div>
                                        <div className="text-3xl font-bold text-emerald-600 mb-1">
                                            {rate.rate.toFixed(4)}
                                        </div>
                                        <div className="text-xs text-emerald-600">
                                            1 {rate.fromCurrency} = {rate.rate.toFixed(4)} {rate.toCurrency}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                        <div className="text-sm text-blue-700 mb-2">السعر العكسي</div>
                                        <div className="text-3xl font-bold text-blue-600 mb-1">
                                            {rate.inverseRate.toFixed(4)}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            1 {rate.toCurrency} = {rate.inverseRate.toFixed(4)} {rate.fromCurrency}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">التغير (24 ساعة)</div>
                                        <Badge className={`${rate.change24h > 0 ? 'bg-emerald-100 text-emerald-700' : rate.change24h < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'} border-0 flex items-center gap-1 w-fit`}>
                                            {rate.change24h > 0 ? (
                                                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                                            ) : rate.change24h < 0 ? (
                                                <TrendingDown className="h-3 w-3" aria-hidden="true" />
                                            ) : (
                                                <ArrowRightLeft className="h-3 w-3" aria-hidden="true" />
                                            )}
                                            {rate.change24h > 0 ? '+' : ''}{rate.change24h.toFixed(2)}%
                                        </Badge>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">آخر تحديث</div>
                                        <div className="text-sm font-medium text-slate-700">
                                            {formatDate(rate.lastUpdated)}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">المصدر</div>
                                        <Badge className="bg-slate-100 text-slate-700 border-0">
                                            {rate.isAutoUpdate ? 'تحديث تلقائي' : 'يدوي'} • {rate.source}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CONVERTER CARD */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ArrowRightLeft className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                    محول العملات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">
                                            من {convertFrom === 'from' ? rate.fromCurrency : rate.toCurrency}
                                        </Label>
                                        <Input
                                            type="number"
                                            value={convertAmount}
                                            onChange={(e) => setConvertAmount(e.target.value)}
                                            className="rounded-xl border-slate-200 h-12 text-lg font-mono"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">
                                            إلى {convertFrom === 'from' ? rate.toCurrency : rate.fromCurrency}
                                        </Label>
                                        <div className="h-12 flex items-center px-4 bg-emerald-50 rounded-xl border border-emerald-200 text-lg font-mono text-emerald-700 font-bold">
                                            {convertedAmount}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConvertFrom(convertFrom === 'from' ? 'to' : 'from')}
                                        className="rounded-xl"
                                    >
                                        <RefreshCw className="h-4 w-4 ms-2" aria-hidden="true" />
                                        عكس الاتجاه
                                    </Button>
                                </div>

                                {convertAmount && parseFloat(convertAmount) > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 text-center">
                                        {convertAmount} {convertFrom === 'from' ? rate.fromCurrency : rate.toCurrency} = {convertedAmount} {convertFrom === 'from' ? rate.toCurrency : rate.fromCurrency}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* RATE HISTORY */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                    سجل الأسعار (آخر 30 يوم)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {historyLoading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        لا توجد بيانات تاريخية
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-start">
                                            <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tr-xl">التاريخ</th>
                                                    <th className="px-4 py-3 text-center">السعر</th>
                                                    <th className="px-4 py-3 text-start rounded-tl-xl">التغير</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {history.map((h, index) => (
                                                    <tr key={index} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 text-slate-700">{formatDate(h.date)}</td>
                                                        <td className="px-4 py-3 text-center font-mono text-slate-900">
                                                            {h.rate.toFixed(4)}
                                                        </td>
                                                        <td className="px-4 py-3 text-start">
                                                            <Badge className={`${h.change > 0 ? 'bg-emerald-100 text-emerald-700' : h.change < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'} border-0`}>
                                                                {h.change > 0 ? '+' : ''}{h.change.toFixed(2)}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="currency" />
                </div>
            </Main>
        </>
    )
}
