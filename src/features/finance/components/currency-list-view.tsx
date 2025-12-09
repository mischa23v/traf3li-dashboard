import { FinanceSidebar } from './finance-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useExchangeRates, useCurrencySettings, useRefreshRates, useSetExchangeRate } from '@/hooks/useFinanceAdvanced'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, TrendingUp, TrendingDown, RefreshCw, DollarSign, Euro, Plus, MoreHorizontal, ChevronLeft, ArrowRightLeft, Globe, Wallet, Coins, Calendar, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CurrencyListView() {
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currencyFilter, setCurrencyFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('currency')

    // Mutations
    const { mutate: refreshRates, isPending: isRefreshing } = useRefreshRates()

    // Fetch data
    const { data: ratesData, isLoading, isError, error, refetch } = useExchangeRates()
    const { data: settingsData } = useCurrencySettings()

    // Helper function to format dates
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM yyyy HH:mm', { locale: arSA }),
            english: format(date, 'MMM d, yyyy h:mm a')
        }
    }

    // Transform API data
    const exchangeRates = useMemo(() => {
        if (!ratesData?.data) return []

        return ratesData.data.map((rate: any) => ({
            id: rate._id,
            fromCurrency: rate.fromCurrency || 'USD',
            toCurrency: rate.toCurrency || 'SAR',
            rate: rate.rate || 0,
            inverseRate: rate.rate ? (1 / rate.rate) : 0,
            lastUpdated: rate.lastUpdated,
            lastUpdatedFormatted: formatDualDate(rate.lastUpdated),
            source: rate.source || 'manual',
            isAutoUpdate: rate.isAutoUpdate || false,
            change24h: rate.change24h || 0,
            _id: rate._id,
        }))
    }, [ratesData])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectRate = (rateId: string) => {
        if (selectedIds.includes(rateId)) {
            setSelectedIds(selectedIds.filter(id => id !== rateId))
        } else {
            setSelectedIds([...selectedIds, rateId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} سعر صرف؟`)) {
            // TODO: Implement bulk delete mutation when available
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Filter and sort rates
    const filteredRates = useMemo(() => {
        let filtered = [...exchangeRates]

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(rate =>
                rate.fromCurrency.toLowerCase().includes(query) ||
                rate.toCurrency.toLowerCase().includes(query)
            )
        }

        // Currency filter
        if (currencyFilter !== 'all') {
            filtered = filtered.filter(rate =>
                rate.fromCurrency === currencyFilter || rate.toCurrency === currencyFilter
            )
        }

        // Sort
        if (sortBy === 'currency') {
            filtered.sort((a, b) => a.fromCurrency.localeCompare(b.fromCurrency))
        } else if (sortBy === 'rate') {
            filtered.sort((a, b) => b.rate - a.rate)
        } else if (sortBy === 'change') {
            filtered.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
        }

        return filtered
    }, [exchangeRates, searchQuery, currencyFilter, sortBy])

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!ratesData?.data) return undefined

        const totalRates = ratesData.data.length
        const autoUpdateCount = ratesData.data.filter((r: any) => r.isAutoUpdate).length
        const recentlyUpdated = ratesData.data.filter((r: any) => {
            if (!r.lastUpdated) return false
            const diff = Date.now() - new Date(r.lastUpdated).getTime()
            return diff < 24 * 60 * 60 * 1000 // Last 24 hours
        }).length

        return [
            { label: 'أسعار الصرف', value: totalRates || 0, icon: Globe, status: 'normal' as const },
            { label: 'تحديث تلقائي', value: autoUpdateCount || 0, icon: RefreshCw, status: 'normal' as const },
            { label: 'محدثة مؤخراً', value: recentlyUpdated || 0, icon: TrendingUp, status: recentlyUpdated > 0 ? 'normal' as const : 'zero' as const },
            { label: 'العملة الأساسية', value: settingsData?.data?.baseCurrency || 'SAR', icon: Wallet, status: 'normal' as const },
        ]
    }, [ratesData, settingsData])

    // Get currency icon
    const getCurrencyIcon = (currency: string) => {
        const icons: Record<string, any> = {
            USD: DollarSign,
            EUR: Euro,
            SAR: Coins,
        }
        return icons[currency] || Globe
    }

    // Get change badge
    const getChangeBadge = (change: number) => {
        if (Math.abs(change) < 0.01) {
            return <Badge className="bg-slate-100 text-slate-700 border-0 rounded-md px-2 flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" aria-hidden="true" />
                ثابت
            </Badge>
        }
        if (change > 0) {
            return <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-md px-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                +{change.toFixed(2)}%
            </Badge>
        }
        return <Badge className="bg-red-100 text-red-700 border-0 rounded-md px-2 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" aria-hidden="true" />
            {change.toFixed(2)}%
        </Badge>
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'العملات', href: '/dashboard/finance/currency', isActive: true },
    ]

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
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="المالية" title="العملات المتعددة" type="currency" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث عن عملة..."
                                            aria-label="بحث عن عملة"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Currency Filter */}
                                    <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="العملة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل العملات</SelectItem>
                                            <SelectItem value="SAR">ريال سعودي</SelectItem>
                                            <SelectItem value="USD">دولار أمريكي</SelectItem>
                                            <SelectItem value="EUR">يورو</SelectItem>
                                            <SelectItem value="GBP">جنيه إسترليني</SelectItem>
                                            <SelectItem value="AED">درهم إماراتي</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <ArrowUpDown className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="currency">العملة</SelectItem>
                                            <SelectItem value="rate">سعر الصرف</SelectItem>
                                            <SelectItem value="change">التغير</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Refresh Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => refreshRates()}
                                        disabled={isRefreshing}
                                        className="h-10 px-4 rounded-xl border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
                                    >
                                        <RefreshCw className={`h-4 w-4 ms-2 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                        تحديث الأسعار
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* MAIN EXCHANGE RATES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">أسعار الصرف</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {filteredRates.length} عملة
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل أسعار الصرف</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && filteredRates.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Globe className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد أسعار صرف</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة سعر صرف جديد</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/finance/currency/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إضافة سعر صرف
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Exchange Rates List */}
                                {!isLoading && !isError && filteredRates.map((rate) => {
                                    const FromIcon = getCurrencyIcon(rate.fromCurrency)
                                    const ToIcon = getCurrencyIcon(rate.toCurrency)

                                    return (
                                        <div key={rate.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(rate.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    {isSelectionMode && (
                                                        <Checkbox
                                                            checked={selectedIds.includes(rate.id)}
                                                            onCheckedChange={() => handleSelectRate(rate.id)}
                                                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                            <FromIcon className="h-7 w-7" aria-hidden="true" />
                                                        </div>
                                                        <ArrowRightLeft className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-600">
                                                            <ToIcon className="h-7 w-7" aria-hidden="true" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-navy text-lg">
                                                                {rate.fromCurrency} / {rate.toCurrency}
                                                            </h4>
                                                            {getChangeBadge(rate.change24h)}
                                                        </div>
                                                        <p className="text-slate-500 text-sm">
                                                            {rate.isAutoUpdate ? 'تحديث تلقائي' : 'يدوي'} • {rate.source}
                                                        </p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem>
                                                            <ArrowRightLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                                                            تحويل العملة
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Calendar className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                            عرض السجل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <RefreshCw className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                                                            تحديث السعر
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-6">
                                                    {/* Rate Info */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-600 mb-1">السعر الحالي</div>
                                                            <div className="font-bold text-navy text-2xl">{rate.rate.toFixed(4)}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-600 mb-1">السعر العكسي</div>
                                                            <div className="font-medium text-slate-700 text-lg">{rate.inverseRate.toFixed(4)}</div>
                                                        </div>
                                                    </div>
                                                    {/* Last Updated */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600">آخر تحديث</div>
                                                        <div className="font-medium text-navy text-sm">{rate.lastUpdatedFormatted.arabic}</div>
                                                    </div>
                                                </div>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    تحويل
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع أسعار الصرف
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <FinanceSidebar
                        context="currency"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
