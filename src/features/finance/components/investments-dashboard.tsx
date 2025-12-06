import { useState } from 'react'
import {
    Search, Plus, MoreHorizontal,
    TrendingUp, TrendingDown, Bell,
    ChevronLeft, ChevronRight, Download,
    DollarSign, BarChart3, PieChart,
    Building2, Landmark, Wallet, RefreshCw, Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
// COMPONENTS
// ============================================================================

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-navy" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">لا توجد استثمارات</h3>
            <p className="text-muted-foreground mb-6">
                ابدأ بإضافة أول استثمار لمتابعة محفظتك الاستثمارية
            </p>
            <Button asChild className="bg-navy hover:bg-navy/90">
                <Link to="/dashboard/finance/investments/new">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة استثمار
                </Link>
            </Button>
        </div>
    )
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
    return (
        <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">حدث خطأ</h3>
            <p className="text-muted-foreground mb-6">
                {error.message || 'فشل في تحميل الاستثمارات. يرجى المحاولة مرة أخرى.'}
            </p>
            <Button onClick={onRetry} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                <RefreshCw className="ml-2 h-4 w-4" />
                إعادة المحاولة
            </Button>
        </div>
    )
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

    const investments = Array.isArray(data?.investments) ? data.investments : []
    const summary = data?.summary ?? {
        totalInvested: 0,
        currentValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        totalDividends: 0,
    }
    const pagination = data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 0 }

    return (
        <>
            <Header>
                <TopNav>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <ThemeSwitch />
                        <ConfigDrawer />
                        <DynamicIsland />
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>
                        <ProfileDropdown />
                    </div>
                </TopNav>
            </Header>

            <Main>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <FinanceSidebar context="investments" />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
                        {/* Hero Card */}
                        <ProductivityHero
                            badge="المحفظة الاستثمارية"
                            title="متابعة الاستثمارات"
                            type="investments"
                        />

                        {/* Loading State */}
                        {isLoading && <LoadingSkeleton />}

                        {/* Error State */}
                        {error && <ErrorState error={error} onRetry={refetch} />}

                        {/* Content */}
                        {!isLoading && !error && (
                            <>
                                {/* Portfolio Summary Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="bg-gradient-to-br from-navy to-navy/90 text-white">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wallet className="h-4 w-4 opacity-70" />
                                                <span className="text-sm opacity-70">إجمالي المستثمر</span>
                                            </div>
                                            <p className="text-xl font-bold">{formatCurrency(summary.totalInvested)}</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BarChart3 className="h-4 w-4 opacity-70" />
                                                <span className="text-sm opacity-70">القيمة الحالية</span>
                                            </div>
                                            <p className="text-xl font-bold">{formatCurrency(summary.currentValue)}</p>
                                        </CardContent>
                                    </Card>

                                    <Card className={cn(
                                        "text-white",
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

                                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <DollarSign className="h-4 w-4 opacity-70" />
                                                <span className="text-sm opacity-70">التوزيعات</span>
                                            </div>
                                            <p className="text-xl font-bold">{formatCurrency(summary.totalDividends)}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Filters & Actions */}
                                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                                        <div className="flex flex-1 gap-3">
                                            {/* Search */}
                                            <div className="relative flex-1 max-w-sm">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="البحث عن استثمار..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pr-10 rounded-xl"
                                                />
                                            </div>

                                            {/* Type Filter */}
                                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                                <SelectTrigger className="w-[160px] rounded-xl">
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

                                            {/* Status Filter */}
                                            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                                                <TabsList className="rounded-xl">
                                                    <TabsTrigger value="active" className="rounded-lg">نشط</TabsTrigger>
                                                    <TabsTrigger value="sold" className="rounded-lg">مباع</TabsTrigger>
                                                    <TabsTrigger value="all" className="rounded-lg">الكل</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-xl"
                                                onClick={handleRefreshPrices}
                                                disabled={refreshAllPrices.isPending}
                                            >
                                                <RefreshCw className={cn("h-4 w-4", refreshAllPrices.isPending && "animate-spin")} />
                                            </Button>
                                            <Button variant="outline" className="rounded-xl gap-2">
                                                <Download className="h-4 w-4" />
                                                تصدير
                                            </Button>
                                            <Button asChild className="rounded-xl bg-navy hover:bg-navy/90 gap-2">
                                                <Link to="/dashboard/finance/investments/new">
                                                    <Plus className="h-4 w-4" />
                                                    إضافة استثمار
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Empty State */}
                                {investments.length === 0 && <EmptyState />}

                                {/* Investment List */}
                                {investments.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-50 border-b">
                                                    <tr>
                                                        <th className="text-right py-4 px-4 font-semibold text-navy">الاستثمار</th>
                                                        <th className="text-right py-4 px-4 font-semibold text-navy">النوع</th>
                                                        <th className="text-right py-4 px-4 font-semibold text-navy">الكمية</th>
                                                        <th className="text-right py-4 px-4 font-semibold text-navy">التكلفة</th>
                                                        <th className="text-right py-4 px-4 font-semibold text-navy">القيمة الحالية</th>
                                                        <th className="text-right py-4 px-4 font-semibold text-navy">الربح/الخسارة</th>
                                                        <th className="text-center py-4 px-4 font-semibold text-navy">إجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {investments.map((investment) => (
                                                        <tr key={investment._id} className="border-b hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-4 px-4">
                                                                <Link
                                                                    to={`/dashboard/finance/investments/${investment._id}`}
                                                                    className="flex items-center gap-3 hover:text-navy"
                                                                >
                                                                    <div className={cn(
                                                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                                                        investment.gainLoss >= 0
                                                                            ? "bg-emerald-100 text-emerald-600"
                                                                            : "bg-red-100 text-red-600"
                                                                    )}>
                                                                        {getTypeIcon(investment.type)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-navy">{investment.symbol}</p>
                                                                        <p className="text-sm text-muted-foreground">{investment.name}</p>
                                                                    </div>
                                                                </Link>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <Badge variant="outline" className="rounded-lg">
                                                                    {getTypeLabel(investment.type)}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-4 px-4 font-medium">
                                                                {investment.quantity.toLocaleString('ar-SA')}
                                                            </td>
                                                            <td className="py-4 px-4 font-medium">
                                                                {formatCurrency(investment.totalCost)}
                                                            </td>
                                                            <td className="py-4 px-4 font-medium">
                                                                {formatCurrency(investment.currentValue)}
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <div className={cn(
                                                                    "font-bold",
                                                                    investment.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                                                                )}>
                                                                    {formatCurrency(investment.gainLoss)}
                                                                    <span className="text-sm font-normal mr-1">
                                                                        ({formatPercent(investment.gainLossPercent)})
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <div className="flex items-center justify-center">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="rounded-lg">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
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
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center justify-between p-4 border-t">
                                            <p className="text-sm text-muted-foreground">
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
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </Main>
        </>
    )
}
