import { useState } from 'react'
import {
    Search, Plus, MoreHorizontal,
    TrendingUp, TrendingDown, Bell,
    ChevronLeft, ChevronRight, Download,
    DollarSign, BarChart3, PieChart,
    Building2, Landmark, Wallet, RefreshCw, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useInvestments, useRefreshAllPrices } from '@/hooks/useFinance'

// ============================================================================
// TYPES - These match the backend API models
// ============================================================================

export interface Investment {
    _id: string
    symbol: string
    name: string
    nameEn: string
    type: 'stock' | 'mutual_fund' | 'etf' | 'reit' | 'sukuk' | 'bond'
    market: 'tadawul' | 'international'
    purchaseDate: string
    purchasePrice: number       // halalas
    quantity: number
    totalCost: number           // halalas
    fees: number                // halalas
    currentPrice: number        // halalas
    currentValue: number        // halalas
    lastPriceUpdate: string
    gainLoss: number            // halalas
    gainLossPercent: number
    dividendsReceived: number   // halalas
    totalReturn: number         // halalas
    totalReturnPercent: number
    sector: string
    sectorEn: string
    category: string
    status: 'active' | 'sold' | 'partial_sold'
    notes: string
}

export interface PortfolioSummary {
    totalInvested: number       // halalas
    currentValue: number        // halalas
    totalGainLoss: number       // halalas
    totalGainLossPercent: number
    totalDividends: number      // halalas
}

export interface InvestmentsResponse {
    investments: Investment[]
    summary: PortfolioSummary
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

// ============================================================================
// API HOOKS - Imported from useFinance.ts
// ============================================================================
// useInvestments and useRefreshAllPrices are imported from @/hooks/useFinance

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(halalas: number): string {
    const sar = halalas / 100
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
    }).format(sar)
}

function formatPercent(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function getTypeLabel(type: Investment['type']): string {
    const labels: Record<Investment['type'], string> = {
        stock: 'سهم',
        mutual_fund: 'صندوق استثماري',
        etf: 'صندوق مؤشر',
        reit: 'صندوق ريت',
        sukuk: 'صكوك',
        bond: 'سندات'
    }
    return labels[type]
}

function getTypeIcon(type: Investment['type']) {
    switch (type) {
        case 'stock':
            return <TrendingUp className="h-4 w-4" />
        case 'mutual_fund':
        case 'etf':
            return <PieChart className="h-4 w-4" />
        case 'reit':
            return <Building2 className="h-4 w-4" />
        case 'sukuk':
        case 'bond':
            return <Landmark className="h-4 w-4" />
        default:
            return <Wallet className="h-4 w-4" />
    }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvestmentsDashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('active')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Fetch investments from API
    const {
        data,
        isLoading,
        error,
        refetch
    } = useInvestments({
        status: statusFilter,
        type: typeFilter,
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage,
    })

    // Refresh all prices mutation
    const refreshAllPrices = useRefreshAllPrices()

    const handleRefreshPrices = async () => {
        refreshAllPrices.mutate()
    }

    const investments = data?.investments ?? []
    const summary = data?.summary ?? {
        totalInvested: 0,
        currentValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        totalDividends: 0,
    }
    const pagination = data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 0 }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'الاستثمارات', href: '/dashboard/finance/investments', isActive: true },
    ]

    return (
        <>
            {/* Header - Matches Tasks Layout */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
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
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="المحفظة الاستثمارية" title="الاستثمارات" type="investments" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Portfolio Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-navy to-navy/90 text-white border-0 shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet className="h-4 w-4 opacity-70" />
                                        <span className="text-sm opacity-70">إجمالي المستثمر</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(summary.totalInvested)}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="h-4 w-4 opacity-70" />
                                        <span className="text-sm opacity-70">القيمة الحالية</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(summary.currentValue)}</p>
                                </CardContent>
                            </Card>

                            <Card className={cn(
                                "text-white border-0 shadow-lg",
                                summary.totalGainLoss >= 0
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                    : "bg-gradient-to-br from-red-500 to-red-600"
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        {summary.totalGainLoss >= 0
                                            ? <TrendingUp className="h-4 w-4 opacity-70" />
                                            : <TrendingDown className="h-4 w-4 opacity-70" />
                                        }
                                        <span className="text-sm opacity-70">الربح/الخسارة</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(summary.totalGainLoss)}</p>
                                    <p className="text-sm opacity-80">{formatPercent(summary.totalGainLossPercent)}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 opacity-70" />
                                        <span className="text-sm opacity-70">التوزيعات</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(summary.totalDividends)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* FILTERS BAR - Matches Tasks Layout */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="البحث عن استثمار..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">نشط</SelectItem>
                                            <SelectItem value="sold">مباع</SelectItem>
                                            <SelectItem value="all">الكل</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Type Filter */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">جميع الأنواع</SelectItem>
                                            <SelectItem value="stock">أسهم</SelectItem>
                                            <SelectItem value="mutual_fund">صناديق استثمارية</SelectItem>
                                            <SelectItem value="reit">صناديق ريت</SelectItem>
                                            <SelectItem value="etf">صناديق مؤشرات</SelectItem>
                                            <SelectItem value="sukuk">صكوك</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Actions */}
                                <div className="flex flex-wrap items-center gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 rounded-xl border-slate-200"
                                        onClick={handleRefreshPrices}
                                        disabled={refreshAllPrices.isPending}
                                    >
                                        <RefreshCw className={cn("h-4 w-4 ml-2", refreshAllPrices.isPending && "animate-spin")} />
                                        تحديث الأسعار
                                    </Button>
                                    <Button variant="outline" className="h-10 rounded-xl border-slate-200">
                                        <Download className="h-4 w-4 ml-2" />
                                        تصدير
                                    </Button>
                                    <Button asChild className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                                        <Link to="/dashboard/finance/investments/new">
                                            <Plus className="h-4 w-4 ml-2" />
                                            إضافة استثمار
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* MAIN INVESTMENTS LIST - Matches Tasks Layout */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {statusFilter === 'active' ? 'الاستثمارات النشطة' : statusFilter === 'sold' ? 'الاستثمارات المباعة' : 'جميع الاستثمارات'}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {pagination.total} استثمار
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الاستثمارات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !error && investments.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Wallet className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد استثمارات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة أول استثمار لمتابعة محفظتك</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/finance/investments/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                إضافة استثمار
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Investments List */}
                                {!isLoading && !error && investments.map((investment) => (
                                    <div key={investment._id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                                                    investment.gainLoss >= 0
                                                        ? "bg-emerald-100 text-emerald-600"
                                                        : "bg-red-100 text-red-600"
                                                )}>
                                                    {getTypeIcon(investment.type)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{investment.symbol}</h4>
                                                        <Badge className={cn(
                                                            "border-0 rounded-md px-2",
                                                            investment.status === 'active'
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        )}>
                                                            {investment.status === 'active' ? 'نشط' : 'مباع'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{investment.name}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/dashboard/finance/investments/${investment._id}`}>
                                                            عرض التفاصيل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>تعديل</DropdownMenuItem>
                                                    <DropdownMenuItem>تسجيل توزيعات</DropdownMenuItem>
                                                    <DropdownMenuItem>بيع جزئي</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">بيع كامل</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                {/* Type Badge */}
                                                <div>
                                                    <div className="text-xs text-slate-400 mb-1">النوع</div>
                                                    <Badge variant="outline" className="rounded-lg font-bold">
                                                        {getTypeLabel(investment.type)}
                                                    </Badge>
                                                </div>
                                                {/* Quantity */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الكمية</div>
                                                    <div className="font-bold text-navy text-sm">{investment.quantity.toLocaleString('ar-SA')}</div>
                                                </div>
                                                {/* Current Value */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">القيمة الحالية</div>
                                                    <div className="font-bold text-navy text-sm">{formatCurrency(investment.currentValue)}</div>
                                                </div>
                                                {/* Gain/Loss */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الربح/الخسارة</div>
                                                    <div className={cn(
                                                        "font-bold text-sm",
                                                        investment.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                                                    )}>
                                                        {formatCurrency(investment.gainLoss)}
                                                        <span className="text-xs font-normal mr-1">
                                                            ({formatPercent(investment.gainLossPercent)})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/finance/investments/${investment._id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض التفاصيل
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {investments.length > 0 && (
                                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                                    <p className="text-sm text-slate-500">
                                        عرض {investments.length} من {pagination.total} استثمار
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-lg"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm px-3">{currentPage} / {pagination.totalPages || 1}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-lg"
                                            disabled={currentPage >= pagination.totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="investments" />
                </div>
            </Main>
        </>
    )
}
