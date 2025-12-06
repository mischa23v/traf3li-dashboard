import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    TrendingUp, TrendingDown, AlertCircle, Bell, Loader2,
    Calendar, ChevronLeft, ChevronRight, Download, X,
    Target, Percent, DollarSign, BarChart3, Activity,
    ArrowUpRight, ArrowDownRight, Briefcase, LineChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Mock data for investments/trades - will be replaced with API hooks
const mockTrades = [
    {
        _id: '1',
        symbol: 'AAPL',
        assetType: 'stock',
        direction: 'long',
        entryPrice: 178.50,
        exitPrice: 185.20,
        entryDate: '2024-01-15T10:30:00Z',
        exitDate: '2024-01-18T14:45:00Z',
        quantity: 100,
        pnl: 670,
        pnlPercent: 3.75,
        rMultiple: 2.1,
        status: 'closed',
        setup: 'breakout',
        emotion: 'confident',
    },
    {
        _id: '2',
        symbol: 'EUR/USD',
        assetType: 'forex',
        direction: 'short',
        entryPrice: 1.0892,
        exitPrice: 1.0845,
        entryDate: '2024-01-20T08:00:00Z',
        exitDate: '2024-01-20T16:30:00Z',
        quantity: 10000,
        pnl: 470,
        pnlPercent: 0.43,
        rMultiple: 1.8,
        status: 'closed',
        setup: 'trend_following',
        emotion: 'calm',
    },
    {
        _id: '3',
        symbol: 'BTC/USDT',
        assetType: 'crypto',
        direction: 'long',
        entryPrice: 42150,
        exitPrice: null,
        entryDate: '2024-01-22T12:00:00Z',
        exitDate: null,
        quantity: 0.5,
        pnl: -320,
        pnlPercent: -1.52,
        rMultiple: -0.8,
        status: 'open',
        setup: 'support_bounce',
        emotion: 'anxious',
    },
    {
        _id: '4',
        symbol: 'TSLA',
        assetType: 'stock',
        direction: 'long',
        entryPrice: 215.40,
        exitPrice: 208.90,
        entryDate: '2024-01-10T09:45:00Z',
        exitDate: '2024-01-12T15:30:00Z',
        quantity: 50,
        pnl: -325,
        pnlPercent: -3.02,
        rMultiple: -1.2,
        status: 'closed',
        setup: 'earnings_play',
        emotion: 'greedy',
    },
    {
        _id: '5',
        symbol: 'ES',
        assetType: 'futures',
        direction: 'short',
        entryPrice: 4825.50,
        exitPrice: 4798.25,
        entryDate: '2024-01-25T14:00:00Z',
        exitDate: '2024-01-25T16:00:00Z',
        quantity: 2,
        pnl: 1362.50,
        pnlPercent: 0.57,
        rMultiple: 3.2,
        status: 'closed',
        setup: 'reversal',
        emotion: 'focused',
    },
]

const assetTypeLabels: Record<string, string> = {
    stock: 'أسهم',
    forex: 'فوركس',
    crypto: 'عملات رقمية',
    futures: 'عقود آجلة',
    options: 'خيارات',
}

const directionLabels: Record<string, string> = {
    long: 'شراء',
    short: 'بيع',
}

const statusLabels: Record<string, string> = {
    open: 'مفتوح',
    closed: 'مغلق',
    pending: 'معلق',
}

const setupLabels: Record<string, string> = {
    breakout: 'اختراق',
    trend_following: 'تتبع الاتجاه',
    support_bounce: 'ارتداد من الدعم',
    earnings_play: 'تداول الأرباح',
    reversal: 'انعكاس',
    scalp: 'سكالبينج',
    swing: 'سوينج',
}

const emotionLabels: Record<string, string> = {
    confident: 'واثق',
    calm: 'هادئ',
    anxious: 'قلق',
    greedy: 'طماع',
    fearful: 'خائف',
    focused: 'مركز',
    neutral: 'محايد',
}

export default function InvestmentsDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedAssetType, setSelectedAssetType] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [isLoading] = useState(false)
    const [isError] = useState(false)

    // API Filters
    const filters = useMemo(() => {
        const f: any = { page: currentPage, limit: itemsPerPage }
        if (activeTab !== 'all') {
            f.status = activeTab
        }
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedAssetType && selectedAssetType !== 'all') f.assetType = selectedAssetType
        return f
    }, [activeTab, currentPage, itemsPerPage, startDate, endDate, selectedAssetType])

    // Active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0
        if (startDate) count++
        if (endDate) count++
        if (selectedAssetType && selectedAssetType !== 'all') count++
        return count
    }, [startDate, endDate, selectedAssetType])

    // Clear all filters
    const clearFilters = () => {
        setStartDate('')
        setEndDate('')
        setSelectedAssetType('')
        setCurrentPage(1)
    }

    // Filter trades
    const trades = useMemo(() => {
        return mockTrades.filter(trade => {
            if (activeTab !== 'all' && trade.status !== activeTab) return false
            if (searchQuery && !trade.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false
            if (selectedAssetType && selectedAssetType !== 'all' && trade.assetType !== selectedAssetType) return false
            return true
        })
    }, [activeTab, searchQuery, selectedAssetType])

    // Calculate statistics
    const stats = useMemo(() => {
        const closedTrades = mockTrades.filter(t => t.status === 'closed')
        const winningTrades = closedTrades.filter(t => t.pnl > 0)
        const losingTrades = closedTrades.filter(t => t.pnl < 0)

        const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0)
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0
        const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0
        const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0
        const avgRMultiple = closedTrades.length > 0 ? closedTrades.reduce((sum, t) => sum + t.rMultiple, 0) / closedTrades.length : 0
        const openTrades = mockTrades.filter(t => t.status === 'open').length

        return { totalPnl, winRate, profitFactor, avgRMultiple, openTrades, totalTrades: closedTrades.length }
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2
        }).format(amount)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'الاستثمارات', href: '/dashboard/finance/investments', isActive: true },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
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
                    <div className='ms-auto flex items-center space-x-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" />
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
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-32 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    // ERROR STATE
    if (isError) {
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
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل الصفقات</h3>
                        <p className="text-slate-500 mb-6">حدث خطأ أثناء تحميل البيانات</p>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ml-2 h-4 w-4" />
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

                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
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

                {/* HERO CARD */}
                <ProductivityHero badge="سجل التداول" title="إدارة الاستثمارات" type="investments" hideButtons={true}>
                    <Button
                        asChild
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0"
                    >
                        <Link to="/dashboard/finance/investments/new">
                            <Plus className="ml-2 h-5 w-5" />
                            صفقة جديدة
                        </Link>
                    </Button>
                </ProductivityHero>

                {/* STATS CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stats.totalPnl >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {stats.totalPnl >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                            </div>
                            <span className="text-xs text-slate-500">إجمالي الأرباح</span>
                        </div>
                        <p className={`text-xl font-bold ${stats.totalPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.totalPnl)}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-xs text-slate-500">معدل الفوز</span>
                        </div>
                        <p className="text-xl font-bold text-navy">{stats.winRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-xs text-slate-500">عامل الربح</span>
                        </div>
                        <p className="text-xl font-bold text-navy">{stats.profitFactor.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Activity className="h-4 w-4 text-orange-600" />
                            </div>
                            <span className="text-xs text-slate-500">متوسط R</span>
                        </div>
                        <p className="text-xl font-bold text-navy">{stats.avgRMultiple.toFixed(2)}R</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Briefcase className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-xs text-slate-500">صفقات مفتوحة</span>
                        </div>
                        <p className="text-xl font-bold text-navy">{stats.openTrades}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <LineChart className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className="text-xs text-slate-500">إجمالي الصفقات</span>
                        </div>
                        <p className="text-xl font-bold text-navy">{stats.totalTrades}</p>
                    </div>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Trades List */}
                    <div className="lg:col-span-2 space-y-6">
                        {trades.length === 0 && !searchQuery && activeTab === 'all' ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="h-8 w-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد صفقات بعد</h3>
                                <p className="text-slate-500 mb-6">ابدأ بتسجيل أول صفقة لتتبع أدائك</p>
                                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                                    <Link to="/dashboard/finance/investments/new">
                                        <Plus className="ml-2 h-4 w-4" />
                                        تسجيل صفقة جديدة
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Filters Bar */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full md:w-auto">
                                            <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                                <TabsTrigger
                                                    value="all"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    الكل
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="open"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    مفتوحة
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="closed"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    مغلقة
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>

                                        <div className="flex items-center gap-3">
                                            <div className="relative w-full max-w-xs">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="بحث بالرمز..."
                                                    className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <Popover open={showFilters} onOpenChange={setShowFilters}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="rounded-xl border-slate-200 relative">
                                                        <Filter className="w-4 h-4 ml-2" />
                                                        تصفية متقدمة
                                                        {activeFilterCount > 0 && (
                                                            <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-emerald-500 text-white text-xs">
                                                                {activeFilterCount}
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80" align="end">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-navy">تصفية متقدمة</h4>
                                                            {activeFilterCount > 0 && (
                                                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-red-500">
                                                                    <X className="w-4 h-4 ml-1" />
                                                                    مسح
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">نوع الأصل</label>
                                                            <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                                                                <SelectTrigger className="rounded-xl">
                                                                    <SelectValue placeholder="جميع الأنواع" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="all">جميع الأنواع</SelectItem>
                                                                    <SelectItem value="stock">أسهم</SelectItem>
                                                                    <SelectItem value="forex">فوركس</SelectItem>
                                                                    <SelectItem value="crypto">عملات رقمية</SelectItem>
                                                                    <SelectItem value="futures">عقود آجلة</SelectItem>
                                                                    <SelectItem value="options">خيارات</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    من تاريخ
                                                                </label>
                                                                <Input
                                                                    type="date"
                                                                    value={startDate}
                                                                    onChange={(e) => setStartDate(e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    إلى تاريخ
                                                                </label>
                                                                <Input
                                                                    type="date"
                                                                    value={endDate}
                                                                    onChange={(e) => setEndDate(e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 border-t border-slate-100 flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 rounded-xl"
                                                            >
                                                                <Download className="w-4 h-4 ml-1" />
                                                                CSV
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 rounded-xl"
                                                            >
                                                                <Download className="w-4 h-4 ml-1" />
                                                                PDF
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Active Filters Display */}
                                    {activeFilterCount > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm text-slate-500">الفلاتر النشطة:</span>
                                            {selectedAssetType && selectedAssetType !== 'all' && (
                                                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 gap-1">
                                                    {assetTypeLabels[selectedAssetType]}
                                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedAssetType('')} />
                                                </Badge>
                                            )}
                                            {startDate && (
                                                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 gap-1">
                                                    من: {new Date(startDate).toLocaleDateString('ar-SA')}
                                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setStartDate('')} />
                                                </Badge>
                                            )}
                                            {endDate && (
                                                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 gap-1">
                                                    إلى: {new Date(endDate).toLocaleDateString('ar-SA')}
                                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setEndDate('')} />
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* List Items */}
                                <div className="space-y-4">
                                    {trades.length === 0 ? (
                                        <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                            <p className="text-slate-500 mb-4">لم نجد صفقات تطابق البحث أو الفلاتر المحددة</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchQuery('')
                                                    setActiveTab('all')
                                                }}
                                                className="border-slate-200 hover:bg-slate-50"
                                            >
                                                مسح الفلاتر
                                            </Button>
                                        </div>
                                    ) : trades.map((trade) => (
                                        <div key={trade._id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${trade.direction === 'long' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {trade.direction === 'long' ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownRight className="w-7 h-7" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{trade.symbol}</h4>
                                                        <Badge className={`
                                                            ${trade.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                                                                trade.status === 'open' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'}
                                                            border-0 px-2 py-0.5
                                                        `}>
                                                            {statusLabels[trade.status]}
                                                        </Badge>
                                                        <Badge variant="outline" className="border-slate-200 text-slate-600">
                                                            {assetTypeLabels[trade.assetType]}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                                        <span>{directionLabels[trade.direction]}</span>
                                                        <span>•</span>
                                                        <span>{setupLabels[trade.setup]}</span>
                                                        <span>•</span>
                                                        <span>{new Date(trade.entryDate).toLocaleDateString('ar-SA')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                <div className="text-center md:text-right">
                                                    <div className="text-xs text-slate-400 mb-1">سعر الدخول</div>
                                                    <div className="font-bold text-navy">{trade.entryPrice.toLocaleString()}</div>
                                                </div>
                                                <div className="text-center md:text-right">
                                                    <div className="text-xs text-slate-400 mb-1">الربح/الخسارة</div>
                                                    <div className={`font-bold text-xl ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                                                    </div>
                                                </div>
                                                <div className="text-center md:text-right">
                                                    <div className="text-xs text-slate-400 mb-1">R-Multiple</div>
                                                    <div className={`font-bold ${trade.rMultiple >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(1)}R
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                                                            <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to="/dashboard/finance/investments/$investmentId" params={{ investmentId: trade._id }}>
                                                                عرض التفاصيل
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>تعديل الصفقة</DropdownMenuItem>
                                                        <DropdownMenuItem>إغلاق الصفقة</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {trades.length > 0 && (
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">عرض</span>
                                            <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
                                                <SelectTrigger className="w-[70px] h-9 rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5</SelectItem>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="20">20</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm text-slate-500">من {trades.length} صفقة</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="rounded-lg h-9 w-9"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, Math.ceil(trades.length / itemsPerPage)) }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`rounded-lg h-9 w-9 ${currentPage === page ? 'bg-emerald-500 text-white' : ''}`}
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                disabled={currentPage >= Math.ceil(trades.length / itemsPerPage)}
                                                className="rounded-lg h-9 w-9"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="investments" />
                </div>
            </Main>
        </>
    )
}
