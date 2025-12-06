import { useState } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    TrendingUp, TrendingDown, Bell,
    ChevronLeft, ChevronRight, Download,
    DollarSign, BarChart3, PieChart,
    Building2, Landmark, Wallet, RefreshCw
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
import { cn } from '@/lib/utils'

// Types for Investment Portfolio Tracking
interface Investment {
    _id: string
    // Basic Info
    symbol: string              // Stock/Fund symbol
    name: string                // Full name in Arabic
    nameEn: string              // Full name in English
    type: 'stock' | 'mutual_fund' | 'etf' | 'reit' | 'sukuk' | 'bond'
    market: 'tadawul' | 'international'

    // Purchase Details
    purchaseDate: string        // When investment was made
    purchasePrice: number       // Price per unit at purchase (halalas)
    quantity: number            // Number of units/shares
    totalCost: number           // Total investment amount (halalas)
    fees: number                // Purchase fees (halalas)

    // Current Value (fetched from API)
    currentPrice: number        // Current price per unit (halalas)
    currentValue: number        // Current total value (halalas)
    lastUpdated: string         // When price was last updated

    // Performance
    gainLoss: number            // Unrealized gain/loss (halalas)
    gainLossPercent: number     // Percentage change
    dividendsReceived: number   // Total dividends received (halalas)
    totalReturn: number         // Total return including dividends (halalas)

    // Classification
    sector: string              // Sector in Arabic
    sectorEn: string            // Sector in English
    category: string            // Investment category for reporting

    // Status
    status: 'active' | 'sold' | 'partial_sold'
    notes: string
}

// This data will come from backend API - placeholder for UI
const mockInvestments: Investment[] = [
    {
        _id: '1',
        symbol: '1120',
        name: 'مصرف الراجحي',
        nameEn: 'Al Rajhi Bank',
        type: 'stock',
        market: 'tadawul',
        purchaseDate: '2024-06-15',
        purchasePrice: 8500, // 85.00 SAR
        quantity: 500,
        totalCost: 4250000, // 42,500 SAR
        fees: 12750, // 127.50 SAR
        currentPrice: 9200, // 92.00 SAR
        currentValue: 4600000, // 46,000 SAR
        lastUpdated: new Date().toISOString(),
        gainLoss: 350000, // 3,500 SAR gain
        gainLossPercent: 8.24,
        dividendsReceived: 75000, // 750 SAR
        totalReturn: 425000, // 4,250 SAR
        sector: 'البنوك',
        sectorEn: 'Banking',
        category: 'equities',
        status: 'active',
        notes: ''
    },
    {
        _id: '2',
        symbol: '2222',
        name: 'أرامكو السعودية',
        nameEn: 'Saudi Aramco',
        type: 'stock',
        market: 'tadawul',
        purchaseDate: '2024-03-10',
        purchasePrice: 2950, // 29.50 SAR
        quantity: 2000,
        totalCost: 5900000, // 59,000 SAR
        fees: 17700, // 177 SAR
        currentPrice: 2820, // 28.20 SAR
        currentValue: 5640000, // 56,400 SAR
        lastUpdated: new Date().toISOString(),
        gainLoss: -260000, // -2,600 SAR loss
        gainLossPercent: -4.41,
        dividendsReceived: 156000, // 1,560 SAR
        totalReturn: -104000, // -1,040 SAR
        sector: 'الطاقة',
        sectorEn: 'Energy',
        category: 'equities',
        status: 'active',
        notes: ''
    },
    {
        _id: '3',
        symbol: '4330',
        name: 'الرياض ريت',
        nameEn: 'Riyad REIT',
        type: 'reit',
        market: 'tadawul',
        purchaseDate: '2024-01-20',
        purchasePrice: 950, // 9.50 SAR
        quantity: 5000,
        totalCost: 4750000, // 47,500 SAR
        fees: 14250, // 142.50 SAR
        currentPrice: 1020, // 10.20 SAR
        currentValue: 5100000, // 51,000 SAR
        lastUpdated: new Date().toISOString(),
        gainLoss: 350000, // 3,500 SAR gain
        gainLossPercent: 7.37,
        dividendsReceived: 237500, // 2,375 SAR quarterly
        totalReturn: 587500, // 5,875 SAR
        sector: 'صناديق الريت',
        sectorEn: 'REITs',
        category: 'real_estate',
        status: 'active',
        notes: 'توزيعات ربع سنوية'
    },
    {
        _id: '4',
        symbol: 'RJHI-EQTY',
        name: 'صندوق الراجحي للأسهم السعودية',
        nameEn: 'Al Rajhi Saudi Equity Fund',
        type: 'mutual_fund',
        market: 'tadawul',
        purchaseDate: '2024-02-01',
        purchasePrice: 15680, // 156.80 SAR per unit
        quantity: 200,
        totalCost: 3136000, // 31,360 SAR
        fees: 47040, // 470.40 SAR (1.5% subscription)
        currentPrice: 16450, // 164.50 SAR
        currentValue: 3290000, // 32,900 SAR
        lastUpdated: new Date().toISOString(),
        gainLoss: 154000, // 1,540 SAR gain
        gainLossPercent: 4.91,
        dividendsReceived: 0,
        totalReturn: 154000,
        sector: 'صناديق الأسهم',
        sectorEn: 'Equity Funds',
        category: 'mutual_funds',
        status: 'active',
        notes: ''
    },
]

// Format currency in SAR
function formatCurrency(halalas: number): string {
    const sar = halalas / 100
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
    }).format(sar)
}

// Format percentage
function formatPercent(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

// Get investment type label
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

// Get type icon
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

export default function InvestmentsDashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('active')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Filter investments
    const filteredInvestments = mockInvestments.filter(inv => {
        const matchesSearch = inv.name.includes(searchQuery) ||
            inv.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.symbol.includes(searchQuery)
        const matchesType = typeFilter === 'all' || inv.type === typeFilter
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
        return matchesSearch && matchesType && matchesStatus
    })

    // Calculate portfolio summary
    const portfolioSummary = mockInvestments.reduce((acc, inv) => {
        if (inv.status === 'active') {
            acc.totalInvested += inv.totalCost
            acc.currentValue += inv.currentValue
            acc.totalGainLoss += inv.gainLoss
            acc.totalDividends += inv.dividendsReceived
        }
        return acc
    }, {
        totalInvested: 0,
        currentValue: 0,
        totalGainLoss: 0,
        totalDividends: 0
    })

    const overallReturn = portfolioSummary.totalInvested > 0
        ? ((portfolioSummary.currentValue - portfolioSummary.totalInvested) / portfolioSummary.totalInvested) * 100
        : 0

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

                        {/* Portfolio Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-navy to-navy/90 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet className="h-4 w-4 opacity-70" />
                                        <span className="text-sm opacity-70">إجمالي المستثمر</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(portfolioSummary.totalInvested)}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="h-4 w-4 opacity-70" />
                                        <span className="text-sm opacity-70">القيمة الحالية</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(portfolioSummary.currentValue)}</p>
                                </CardContent>
                            </Card>

                            <Card className={cn(
                                "text-white",
                                portfolioSummary.totalGainLoss >= 0
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                    : "bg-gradient-to-br from-red-500 to-red-600"
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        {portfolioSummary.totalGainLoss >= 0
                                            ? <TrendingUp className="h-4 w-4 opacity-70" />
                                            : <TrendingDown className="h-4 w-4 opacity-70" />
                                        }
                                        <span className="text-sm opacity-70">الربح/الخسارة</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(portfolioSummary.totalGainLoss)}</p>
                                    <p className="text-sm opacity-80">{formatPercent(overallReturn)}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 opacity-70" />
                                        <span className="text-sm opacity-70">التوزيعات</span>
                                    </div>
                                    <p className="text-xl font-bold">{formatCurrency(portfolioSummary.totalDividends)}</p>
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
                                    <Button variant="outline" size="icon" className="rounded-xl">
                                        <RefreshCw className="h-4 w-4" />
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

                        {/* Investment List */}
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
                                        {filteredInvestments.map((investment) => (
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
                                    عرض {filteredInvestments.length} من {mockInvestments.length} استثمار
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
                                    <span className="text-sm px-3">{currentPage}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-lg"
                                        disabled={currentPage * itemsPerPage >= filteredInvestments.length}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Sector Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-navy">توزيع المحفظة حسب القطاع</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.from(new Set(mockInvestments.map(i => i.sector))).map(sector => {
                                        const sectorInvestments = mockInvestments.filter(i => i.sector === sector && i.status === 'active')
                                        const sectorValue = sectorInvestments.reduce((sum, i) => sum + i.currentValue, 0)
                                        const percentage = (sectorValue / portfolioSummary.currentValue) * 100

                                        return (
                                            <div key={sector} className="flex items-center gap-4">
                                                <div className="w-24 text-sm font-medium">{sector}</div>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-navy rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="w-20 text-left text-sm font-medium">
                                                    {percentage.toFixed(1)}%
                                                </div>
                                                <div className="w-32 text-left text-sm text-muted-foreground">
                                                    {formatCurrency(sectorValue)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    )
}
