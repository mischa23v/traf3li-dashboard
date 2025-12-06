import { useState } from 'react'
import {
    ArrowLeft, Edit3, Trash2,
    TrendingUp, TrendingDown, DollarSign,
    Calendar, FileText, Building2, PieChart, Landmark,
    BarChart3, RefreshCw, Plus, History, AlertTriangle, Loader2,
    Search, Bell, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
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
import { useInvestment, useInvestmentTransactions, useRefreshInvestmentPrice } from '@/hooks/useFinance'
import type { Investment, InvestmentTransaction } from '@/services/financeService'

// Format currency
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

// Get type icon
function getTypeIcon(type: string) {
    switch (type) {
        case 'stock':
            return <TrendingUp className="h-5 w-5" />
        case 'mutual_fund':
        case 'etf':
            return <PieChart className="h-5 w-5" />
        case 'reit':
            return <Building2 className="h-5 w-5" />
        case 'sukuk':
        case 'bond':
            return <Landmark className="h-5 w-5" />
        default:
            return <TrendingUp className="h-5 w-5" />
    }
}

// Get type label
function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        stock: 'سهم',
        mutual_fund: 'صندوق استثماري',
        etf: 'صندوق مؤشر',
        reit: 'صندوق ريت',
        sukuk: 'صكوك',
        bond: 'سندات'
    }
    return labels[type] || type
}

// Get transaction type info
function getTransactionTypeInfo(type: string) {
    switch (type) {
        case 'dividend':
            return { label: 'توزيعات', color: 'text-emerald-600', bg: 'bg-emerald-100' }
        case 'purchase':
            return { label: 'شراء', color: 'text-blue-600', bg: 'bg-blue-100' }
        case 'sale':
            return { label: 'بيع', color: 'text-orange-600', bg: 'bg-orange-100' }
        default:
            return { label: type, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
}


export default function InvestmentDetailsView() {
    const params = useParams({ strict: false })
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')

    // Get investment ID from URL params
    const investmentId = (params as { investmentId?: string }).investmentId || ''

    // Fetch investment data from API
    const {
        data: investment,
        isLoading: isLoadingInvestment,
        error: investmentError,
        refetch: refetchInvestment
    } = useInvestment(investmentId)

    // Fetch transactions from API
    const {
        data: transactions,
        isLoading: isLoadingTransactions,
        error: transactionsError
    } = useInvestmentTransactions(investmentId)

    // Refresh price mutation
    const refreshPrice = useRefreshInvestmentPrice()

    const handleRefreshPrice = () => {
        refreshPrice.mutate(investmentId, {
            onSuccess: () => {
                refetchInvestment()
            },
        })
    }

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

                {/* Loading State */}
                {isLoadingInvestment && (
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div>
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {investmentError && !isLoadingInvestment && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الاستثمار</h3>
                        <p className="text-slate-500 mb-4">{investmentError?.message || 'تعذر الاتصال بالخادم'}</p>
                        <Button onClick={() => refetchInvestment()} className="bg-emerald-500 hover:bg-emerald-600">
                            إعادة المحاولة
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoadingInvestment && !investmentError && !investment && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">الاستثمار غير موجود</h3>
                        <p className="text-slate-500 mb-4">لم يتم العثور على الاستثمار المطلوب</p>
                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                            <Link to="/dashboard/finance/investments">
                                العودة إلى المحفظة
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Success State */}
                {!isLoadingInvestment && !investmentError && investment && (
                    <>
                        {/* HERO CARD - Same as task details */}
                        <ProductivityHero badge="المحفظة الاستثمارية" title={`${investment.symbol} - ${investment.name}`} type="investments" listMode={true} />

                        {/* MAIN GRID LAYOUT - Same as task details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* RIGHT COLUMN (Main Content) */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Back Link */}
                                <Link
                                    to="/dashboard/finance/investments"
                                    className="inline-flex items-center gap-2 text-slate-500 hover:text-navy transition-colors text-sm"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    العودة إلى المحفظة
                                </Link>

                                {/* Investment Info Card */}
                                <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center",
                                                investment.gainLoss >= 0
                                                    ? "bg-emerald-100 text-emerald-600"
                                                    : "bg-red-100 text-red-600"
                                            )}>
                                                {getTypeIcon(investment.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h2 className="text-2xl font-bold text-navy">{investment.symbol}</h2>
                                                    <Badge variant="outline" className="rounded-lg">{getTypeLabel(investment.type)}</Badge>
                                                    <Badge className={cn(
                                                        "rounded-md",
                                                        investment.status === 'active'
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                                    )}>
                                                        {investment.status === 'active' ? 'نشط' : 'مباع'}
                                                    </Badge>
                                                </div>
                                                <p className="text-lg text-slate-600">{investment.name}</p>
                                                <p className="text-sm text-slate-400">{investment.nameEn} • {investment.sector}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm text-slate-400">السعر الحالي</p>
                                                <p className="text-2xl font-bold text-navy">{formatCurrency(investment.currentPrice)}</p>
                                                <p className="text-xs text-slate-400">
                                                    آخر تحديث: {new Date(investment.lastUpdated).toLocaleTimeString('ar-SA')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Performance Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="text-sm">التكلفة الإجمالية</span>
                                            </div>
                                            <p className="text-xl font-bold text-navy">{formatCurrency(investment.totalCost)}</p>
                                            <p className="text-sm text-slate-400">
                                                {investment.quantity} × {formatCurrency(investment.purchasePrice)}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <BarChart3 className="h-4 w-4" />
                                                <span className="text-sm">القيمة الحالية</span>
                                            </div>
                                            <p className="text-xl font-bold text-navy">{formatCurrency(investment.currentValue)}</p>
                                            <p className="text-sm text-slate-400">
                                                {investment.quantity} وحدة
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className={cn(
                                        "border-0 shadow-sm rounded-2xl",
                                        investment.gainLoss >= 0 ? "bg-emerald-50" : "bg-red-50"
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                {investment.gainLoss >= 0 ? (
                                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className={cn(
                                                    "text-sm",
                                                    investment.gainLoss >= 0 ? "text-emerald-700" : "text-red-700"
                                                )}>الربح/الخسارة</span>
                                            </div>
                                            <p className={cn(
                                                "text-xl font-bold",
                                                investment.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {formatCurrency(investment.gainLoss)}
                                            </p>
                                            <p className={cn(
                                                "text-sm",
                                                investment.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {formatPercent(investment.gainLossPercent)}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-purple-50 border-0 shadow-sm rounded-2xl">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2 text-purple-700">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="text-sm">التوزيعات المستلمة</span>
                                            </div>
                                            <p className="text-xl font-bold text-purple-600">{formatCurrency(investment.dividendsReceived)}</p>
                                            <p className="text-sm text-purple-600">
                                                العائد الإجمالي: {formatPercent(investment.totalReturnPercent)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Tabs Card - Matches Task Details */}
                                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                                            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full sm:w-auto">
                                                {['overview', 'transactions', 'dividends'].map((tab) => (
                                                    <TabsTrigger
                                                        key={tab}
                                                        value={tab}
                                                        className="
                                                            inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-4 py-2 text-sm font-medium ring-offset-white transition-all
                                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                                                            disabled:pointer-events-none disabled:opacity-50
                                                            data-[state=active]:bg-emerald-950 data-[state=active]:text-white data-[state=active]:shadow-sm
                                                            data-[state=inactive]:hover:bg-slate-200
                                                            flex-1 sm:flex-initial
                                                        "
                                                    >
                                                        {tab === 'overview' ? 'نظرة عامة' :
                                                            tab === 'transactions' ? 'العمليات' : 'التوزيعات'}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </div>

                                        <div className="p-4 sm:p-6 bg-slate-50/50">
                                            {/* Overview Tab */}
                                            <TabsContent value="overview" className="mt-0 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Purchase Details */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                                تفاصيل الشراء
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">تاريخ الشراء</span>
                                                                <span className="font-medium text-slate-900">
                                                                    {new Date(investment.purchaseDate).toLocaleDateString('ar-SA')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">سعر الشراء</span>
                                                                <span className="font-medium text-slate-900">{formatCurrency(investment.purchasePrice)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الكمية</span>
                                                                <span className="font-medium text-slate-900">{investment.quantity.toLocaleString('ar-SA')}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">رسوم الشراء</span>
                                                                <span className="font-medium text-slate-900">{formatCurrency(investment.fees)}</span>
                                                            </div>
                                                            <div className="border-t pt-3 flex justify-between font-bold text-sm">
                                                                <span>إجمالي التكلفة</span>
                                                                <span className="text-navy">{formatCurrency(investment.totalCost + investment.fees)}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Return Analysis */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <BarChart3 className="h-4 w-4 text-emerald-600" />
                                                                تحليل العائد
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الربح من السعر</span>
                                                                <span className={cn(
                                                                    "font-medium",
                                                                    investment.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                                                                )}>
                                                                    {formatCurrency(investment.gainLoss)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">التوزيعات</span>
                                                                <span className="font-medium text-emerald-600">
                                                                    {formatCurrency(investment.dividendsReceived)}
                                                                </span>
                                                            </div>
                                                            <div className="border-t pt-3 flex justify-between font-bold text-sm">
                                                                <span>العائد الإجمالي</span>
                                                                <span className={cn(
                                                                    investment.totalReturn >= 0 ? "text-emerald-600" : "text-red-600"
                                                                )}>
                                                                    {formatCurrency(investment.totalReturn)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">نسبة العائد</span>
                                                                <span className={cn(
                                                                    "font-bold",
                                                                    investment.totalReturnPercent >= 0 ? "text-emerald-600" : "text-red-600"
                                                                )}>
                                                                    {formatPercent(investment.totalReturnPercent)}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Notes */}
                                                {investment.notes && (
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-amber-600" />
                                                                ملاحظات
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-slate-600 text-sm">{investment.notes}</p>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Quick Actions */}
                                                <div className="flex flex-wrap gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleRefreshPrice}
                                                        disabled={refreshPrice.isPending}
                                                        className="rounded-xl border-slate-200"
                                                    >
                                                        <RefreshCw className={cn("ml-2 h-4 w-4", refreshPrice.isPending && "animate-spin")} />
                                                        تحديث السعر
                                                    </Button>
                                                    <Button variant="outline" className="rounded-xl border-slate-200">
                                                        <Edit3 className="ml-2 h-4 w-4" />
                                                        تعديل
                                                    </Button>
                                                    <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                                                        <Trash2 className="ml-2 h-4 w-4" />
                                                        بيع كامل
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            {/* Transactions Tab */}
                                            <TabsContent value="transactions" className="mt-0">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl">
                                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <History className="h-4 w-4 text-blue-600" />
                                                            سجل العمليات
                                                        </CardTitle>
                                                        <div className="flex gap-2">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="rounded-lg h-8">
                                                                        <Plus className="ml-1 h-3 w-3" />
                                                                        شراء إضافي
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>شراء إضافي</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4 py-4">
                                                                        <div className="space-y-2">
                                                                            <Label>التاريخ</Label>
                                                                            <Input type="date" className="rounded-xl" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label>سعر الوحدة</Label>
                                                                            <Input type="number" placeholder="0.00" className="rounded-xl" />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label>الكمية</Label>
                                                                            <Input type="number" placeholder="0" className="rounded-xl" />
                                                                        </div>
                                                                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl">حفظ</Button>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                            <Button variant="outline" size="sm" className="rounded-lg h-8 text-orange-600 border-orange-200 hover:bg-orange-50">
                                                                بيع جزئي
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="text-right">التاريخ</TableHead>
                                                                    <TableHead className="text-right">النوع</TableHead>
                                                                    <TableHead className="text-right">الوصف</TableHead>
                                                                    <TableHead className="text-left">المبلغ</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {(transactions ?? []).map(tx => {
                                                                    const typeInfo = getTransactionTypeInfo(tx.type)
                                                                    return (
                                                                        <TableRow key={tx._id}>
                                                                            <TableCell className="text-sm">
                                                                                {new Date(tx.date).toLocaleDateString('ar-SA')}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Badge className={cn(typeInfo.bg, typeInfo.color, "hover:" + typeInfo.bg, "rounded-md")}>
                                                                                    {typeInfo.label}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell className="text-slate-500 text-sm">
                                                                                {tx.description}
                                                                            </TableCell>
                                                                            <TableCell className={cn(
                                                                                "font-medium text-left text-sm",
                                                                                tx.amount >= 0 ? "text-emerald-600" : "text-navy"
                                                                            )}>
                                                                                {formatCurrency(Math.abs(tx.amount))}
                                                                                {tx.amount < 0 && <span className="text-slate-400 text-xs mr-1">(صرف)</span>}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Dividends Tab */}
                                            <TabsContent value="dividends" className="mt-0">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl">
                                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-purple-600" />
                                                            سجل التوزيعات
                                                        </CardTitle>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="rounded-lg h-8">
                                                                    <Plus className="ml-1 h-3 w-3" />
                                                                    تسجيل توزيعات
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>تسجيل توزيعات جديدة</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-4 py-4">
                                                                    <div className="space-y-2">
                                                                        <Label>التاريخ</Label>
                                                                        <Input type="date" className="rounded-xl" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>المبلغ (ر.س)</Label>
                                                                        <Input type="number" placeholder="0.00" className="rounded-xl" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>الوصف</Label>
                                                                        <Input placeholder="مثال: توزيعات الربع الأول" className="rounded-xl" />
                                                                    </div>
                                                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl">حفظ</Button>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            {/* Summary */}
                                                            <div className="bg-purple-50 rounded-xl p-4 flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm text-purple-700">إجمالي التوزيعات المستلمة</p>
                                                                    <p className="text-2xl font-bold text-purple-600">
                                                                        {formatCurrency(investment.dividendsReceived)}
                                                                    </p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-sm text-purple-700">عائد التوزيعات</p>
                                                                    <p className="text-xl font-bold text-purple-600">
                                                                        {((investment.dividendsReceived / investment.totalCost) * 100).toFixed(2)}%
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Dividend history */}
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className="text-right">التاريخ</TableHead>
                                                                        <TableHead className="text-right">الوصف</TableHead>
                                                                        <TableHead className="text-left">المبلغ</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {(transactions ?? [])
                                                                        .filter(tx => tx.type === 'dividend')
                                                                        .map(tx => (
                                                                            <TableRow key={tx._id}>
                                                                                <TableCell className="text-sm">
                                                                                    {new Date(tx.date).toLocaleDateString('ar-SA')}
                                                                                </TableCell>
                                                                                <TableCell className="text-slate-500 text-sm">
                                                                                    {tx.description}
                                                                                </TableCell>
                                                                                <TableCell className="font-medium text-left text-sm text-emerald-600">
                                                                                    {formatCurrency(tx.amount)}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </Card>
                            </div>

                            {/* LEFT COLUMN (Sidebar) */}
                            <FinanceSidebar context="investments" />
                        </div>
                    </>
                )}
            </Main>
        </>
    )
}
