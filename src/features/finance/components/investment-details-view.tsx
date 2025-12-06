import { useState } from 'react'
import {
    ArrowLeft, Edit3, Trash2, Bell, Search,
    TrendingUp, TrendingDown, DollarSign,
    Calendar, FileText, Building2, PieChart, Landmark,
    BarChart3, RefreshCw, Plus, History, AlertTriangle, Loader2
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
import { Alert, AlertDescription } from '@/components/ui/alert'
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

// Loading skeleton component
function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    )
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">حدث خطأ</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
                {error.message || 'تعذر تحميل بيانات الاستثمار. يرجى المحاولة مرة أخرى.'}
            </p>
            {onRetry && (
                <Button onClick={onRetry} className="bg-navy hover:bg-navy/90">
                    <RefreshCw className="ml-2 h-4 w-4" />
                    إعادة المحاولة
                </Button>
            )}
            <Link
                to="/dashboard/finance/investments"
                className="mt-4 text-sm text-muted-foreground hover:text-navy"
            >
                العودة إلى المحفظة
            </Link>
        </div>
    )
}

// Not found state
function NotFoundState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">الاستثمار غير موجود</h3>
            <p className="text-muted-foreground mb-6">
                لم يتم العثور على الاستثمار المطلوب. قد يكون تم حذفه أو نقله.
            </p>
            <Link to="/dashboard/finance/investments">
                <Button className="bg-navy hover:bg-navy/90">
                    <ArrowLeft className="ml-2 h-4 w-4" />
                    العودة إلى المحفظة
                </Button>
            </Link>
        </div>
    )
}

// Consistent page header
const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
    { title: 'القضايا', href: '/dashboard/cases', isActive: false },
    { title: 'العملاء', href: '/dashboard/clients', isActive: false },
]

function PageHeader() {
    return (
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
    )
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
        data: transactionsData,
        isLoading: isLoadingTransactions,
        error: transactionsError
    } = useInvestmentTransactions(investmentId)

    // Ensure transactions is always an array
    const transactions = Array.isArray(transactionsData) ? transactionsData : []

    // Refresh price mutation
    const refreshPrice = useRefreshInvestmentPrice()

    const handleRefreshPrice = () => {
        refreshPrice.mutate(investmentId, {
            onSuccess: () => {
                refetchInvestment()
            },
        })
    }

    // Show loading state
    if (isLoadingInvestment) {
        return (
            <>
                <PageHeader />
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                    <ProductivityHero badge="المحفظة الاستثمارية" title="تفاصيل الاستثمار" type="investments" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <LoadingSkeleton />
                        </div>
                        <FinanceSidebar context="investments" />
                    </div>
                </Main>
            </>
        )
    }

    // Show error state
    if (investmentError) {
        return (
            <>
                <PageHeader />
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                    <ProductivityHero badge="المحفظة الاستثمارية" title="تفاصيل الاستثمار" type="investments" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <ErrorState error={investmentError} onRetry={() => refetchInvestment()} />
                        </div>
                        <FinanceSidebar context="investments" />
                    </div>
                </Main>
            </>
        )
    }

    // Show not found state
    if (!investment) {
        return (
            <>
                <PageHeader />
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                    <ProductivityHero badge="المحفظة الاستثمارية" title="تفاصيل الاستثمار" type="investments" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <NotFoundState />
                        </div>
                        <FinanceSidebar context="investments" />
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            <PageHeader />

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD */}
                <ProductivityHero badge="المحفظة الاستثمارية" title={`${investment.symbol} - ${investment.name}`} type="investments" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleRefreshPrice}
                                disabled={refreshPrice.isPending}
                                className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                            >
                                <RefreshCw className={cn("ml-2 h-4 w-4", refreshPrice.isPending && "animate-spin")} />
                                تحديث السعر
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl"
                            >
                                <Edit3 className="ml-2 h-4 w-4" />
                                تعديل
                            </Button>
                            <Link
                                to="/dashboard/finance/investments"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy transition-colors mr-auto"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                العودة إلى المحفظة
                            </Link>
                        </div>

                        {/* Investment Info Card */}
                        <Card>
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
                                            <Badge variant="outline">{getTypeLabel(investment.type)}</Badge>
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                {investment.status === 'active' ? 'نشط' : 'مباع'}
                                            </Badge>
                                        </div>
                                        <p className="text-lg text-muted-foreground">{investment.name}</p>
                                        <p className="text-sm text-muted-foreground">{investment.nameEn} • {investment.sector}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm text-muted-foreground">السعر الحالي</p>
                                        <p className="text-2xl font-bold text-navy">{formatCurrency(investment.currentPrice)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            آخر تحديث: {new Date(investment.lastUpdated).toLocaleTimeString('ar-SA')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm">التكلفة الإجمالية</span>
                                    </div>
                                    <p className="text-xl font-bold text-navy">{formatCurrency(investment.totalCost)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {investment.quantity} × {formatCurrency(investment.purchasePrice)}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                        <BarChart3 className="h-4 w-4" />
                                        <span className="text-sm">القيمة الحالية</span>
                                    </div>
                                    <p className="text-xl font-bold text-navy">{formatCurrency(investment.currentValue)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {investment.quantity} وحدة
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className={investment.gainLoss >= 0 ? "bg-emerald-50" : "bg-red-50"}>
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

                            <Card className="bg-purple-50">
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

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="w-full justify-start rounded-xl bg-slate-100 p-1">
                                <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                                <TabsTrigger value="transactions" className="rounded-lg">العمليات</TabsTrigger>
                                <TabsTrigger value="dividends" className="rounded-lg">التوزيعات</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Purchase Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-navy flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                تفاصيل الشراء
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">تاريخ الشراء</span>
                                                <span className="font-medium">
                                                    {new Date(investment.purchaseDate).toLocaleDateString('ar-SA')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">سعر الشراء</span>
                                                <span className="font-medium">{formatCurrency(investment.purchasePrice)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">الكمية</span>
                                                <span className="font-medium">{investment.quantity.toLocaleString('ar-SA')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">رسوم الشراء</span>
                                                <span className="font-medium">{formatCurrency(investment.fees)}</span>
                                            </div>
                                            <div className="border-t pt-3 flex justify-between font-bold">
                                                <span>إجمالي التكلفة</span>
                                                <span className="text-navy">{formatCurrency(investment.totalCost + investment.fees)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Return Analysis */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-navy flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5" />
                                                تحليل العائد
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">الربح من السعر</span>
                                                <span className={cn(
                                                    "font-medium",
                                                    investment.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"
                                                )}>
                                                    {formatCurrency(investment.gainLoss)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">التوزيعات</span>
                                                <span className="font-medium text-emerald-600">
                                                    {formatCurrency(investment.dividendsReceived)}
                                                </span>
                                            </div>
                                            <div className="border-t pt-3 flex justify-between font-bold">
                                                <span>العائد الإجمالي</span>
                                                <span className={cn(
                                                    investment.totalReturn >= 0 ? "text-emerald-600" : "text-red-600"
                                                )}>
                                                    {formatCurrency(investment.totalReturn)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">نسبة العائد</span>
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
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-navy flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                ملاحظات
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{investment.notes}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Transactions Tab */}
                            <TabsContent value="transactions" className="mt-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-navy flex items-center gap-2">
                                            <History className="h-5 w-5" />
                                            سجل العمليات
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="rounded-lg">
                                                        <Plus className="ml-1 h-4 w-4" />
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
                                                            <Input type="date" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>سعر الوحدة</Label>
                                                            <Input type="number" placeholder="0.00" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>الكمية</Label>
                                                            <Input type="number" placeholder="0" />
                                                        </div>
                                                        <Button className="w-full bg-navy">حفظ</Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button variant="outline" size="sm" className="rounded-lg text-orange-600 border-orange-200 hover:bg-orange-50">
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
                                                {transactions.map(tx => {
                                                    const typeInfo = getTransactionTypeInfo(tx.type)
                                                    return (
                                                        <TableRow key={tx._id}>
                                                            <TableCell>
                                                                {new Date(tx.date).toLocaleDateString('ar-SA')}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={cn(typeInfo.bg, typeInfo.color, "hover:" + typeInfo.bg)}>
                                                                    {typeInfo.label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {tx.description}
                                                            </TableCell>
                                                            <TableCell className={cn(
                                                                "font-medium text-left",
                                                                tx.amount >= 0 ? "text-emerald-600" : "text-navy"
                                                            )}>
                                                                {formatCurrency(Math.abs(tx.amount))}
                                                                {tx.amount < 0 && <span className="text-muted-foreground text-xs mr-1">(صرف)</span>}
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
                            <TabsContent value="dividends" className="mt-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-navy flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            سجل التوزيعات
                                        </CardTitle>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="rounded-lg">
                                                    <Plus className="ml-1 h-4 w-4" />
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
                                                        <Input type="date" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>المبلغ (ر.س)</Label>
                                                        <Input type="number" placeholder="0.00" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>الوصف</Label>
                                                        <Input placeholder="مثال: توزيعات الربع الأول" />
                                                    </div>
                                                    <Button className="w-full bg-navy">حفظ</Button>
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
                                                    {transactions
                                                        .filter(tx => tx.type === 'dividend')
                                                        .map(tx => (
                                                            <TableRow key={tx._id}>
                                                                <TableCell>
                                                                    {new Date(tx.date).toLocaleDateString('ar-SA')}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {tx.description}
                                                                </TableCell>
                                                                <TableCell className="font-medium text-left text-emerald-600">
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
                        </Tabs>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="destructive"
                                className="rounded-xl"
                            >
                                <Trash2 className="ml-2 h-4 w-4" />
                                بيع كامل الاستثمار
                            </Button>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="investments" />
                </div>
            </Main>
        </>
    )
}
