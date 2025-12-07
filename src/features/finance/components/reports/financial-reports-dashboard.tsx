import { useState, useMemo } from 'react'
import {
    TrendingUp, TrendingDown, FileText, Search, Bell,
    ChevronDown, Calendar, Wallet, AlertCircle, CheckCircle, Download,
    ArrowUpRight, ArrowDownRight, DollarSign, Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from '../finance-sidebar'
import {
    useProfitLossReport,
    useARAgingReport,
    useCaseProfitabilityReport,
    useBalanceSheetReport
} from '@/hooks/useAccounting'
import { formatSAR } from '@/lib/currency'
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths } from 'date-fns'

type PeriodType = 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom'

export default function FinancialReportsDashboard() {
    const [period, setPeriod] = useState<PeriodType>('this-month')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')
    const [sortBy, setSortBy] = useState<'profit' | 'margin'>('profit')

    // Calculate date ranges based on period
    const dateRange = useMemo(() => {
        const now = new Date()
        switch (period) {
            case 'this-month':
                return {
                    start: format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: format(endOfMonth(now), 'yyyy-MM-dd')
                }
            case 'last-month':
                const lastMonth = subMonths(now, 1)
                return {
                    start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
                    end: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
                }
            case 'this-quarter':
                return {
                    start: format(startOfQuarter(now), 'yyyy-MM-dd'),
                    end: format(endOfQuarter(now), 'yyyy-MM-dd')
                }
            case 'this-year':
                return {
                    start: format(startOfYear(now), 'yyyy-MM-dd'),
                    end: format(endOfYear(now), 'yyyy-MM-dd')
                }
            case 'custom':
                return {
                    start: customStartDate || format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: customEndDate || format(endOfMonth(now), 'yyyy-MM-dd')
                }
            default:
                return {
                    start: format(startOfMonth(now), 'yyyy-MM-dd'),
                    end: format(endOfMonth(now), 'yyyy-MM-dd')
                }
        }
    }, [period, customStartDate, customEndDate])

    // Fetch reports data
    const { data: profitLossData, isLoading: isPLLoading } = useProfitLossReport(dateRange.start, dateRange.end)
    const { data: arAgingData, isLoading: isARLoading } = useARAgingReport()
    const { data: caseProfitData, isLoading: isCaseLoading } = useCaseProfitabilityReport(dateRange.start, dateRange.end)
    const { data: balanceSheetData, isLoading: isBalanceLoading } = useBalanceSheetReport()

    const isLoading = isPLLoading || isARLoading || isCaseLoading || isBalanceLoading

    // Process financial summary
    const financialSummary = useMemo(() => {
        if (!profitLossData) return { income: 0, expenses: 0, netProfit: 0, isPositive: false }

        return {
            income: profitLossData.income.total,
            expenses: profitLossData.expenses.total,
            netProfit: profitLossData.netIncome,
            isPositive: profitLossData.netIncome >= 0
        }
    }, [profitLossData])

    // Process AR Aging data
    const unpaidInvoices = useMemo(() => {
        if (!arAgingData) return {
            current: 0,
            days1to30: 0,
            days31to60: 0,
            over60: 0,
            total: 0
        }

        const summary = arAgingData.summary
        return {
            current: summary.current,
            days1to30: summary.days1to30,
            days31to60: summary.days31to60,
            over60: (summary.days61to90 || 0) + (summary.over90 || 0),
            total: summary.total
        }
    }, [arAgingData])

    // Process case profitability
    const caseProfitability = useMemo(() => {
        if (!caseProfitData) return []

        const sorted = [...caseProfitData.cases].sort((a, b) => {
            if (sortBy === 'profit') {
                return b.profit - a.profit
            } else {
                return b.profitMargin - a.profitMargin
            }
        })

        return sorted.slice(0, 10) // Show top 10
    }, [caseProfitData, sortBy])

    // Process bank summary
    const bankSummary = useMemo(() => {
        if (!balanceSheetData) return { banksTotal: 0, unpaidInvoicesTotal: 0 }

        // Get cash/bank accounts from current assets
        const banksTotal = balanceSheetData.assets.currentAssets
            .filter(asset =>
                asset.account.toLowerCase().includes('bank') ||
                asset.account.toLowerCase().includes('cash') ||
                asset.accountAr?.includes('بنك') ||
                asset.accountAr?.includes('نقد')
            )
            .reduce((sum, asset) => sum + asset.balance, 0)

        // Get accounts receivable (unpaid invoices)
        const unpaidInvoicesTotal = balanceSheetData.assets.currentAssets
            .filter(asset =>
                asset.account.toLowerCase().includes('receivable') ||
                asset.accountAr?.includes('مستحق')
            )
            .reduce((sum, asset) => sum + asset.balance, 0)

        return { banksTotal, unpaidInvoicesTotal }
    }, [balanceSheetData])

    const formatCurrency = (amount: number) => {
        return formatSAR(amount / 100) // Convert from halalas
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'التقارير', href: '/dashboard/finance/reports', isActive: true },
    ]

    // Loading State
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
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-40 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-64 w-full rounded-3xl" />
                            <Skeleton className="h-96 w-full rounded-3xl" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-64 w-full rounded-3xl" />
                            <Skeleton className="h-96 w-full rounded-3xl" />
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    // Success State
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
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO SECTION */}
                <ProductivityHero
                    badge="التقارير المالية"
                    title="التقرير المالي الشامل"
                    type="finance"
                >
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-5 backdrop-blur-sm">
                        <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                        تصدير PDF
                    </Button>
                </ProductivityHero>

                {/* Period Selector */}
                <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                <span className="text-sm font-bold text-navy">الفترة المالية:</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                                    <SelectTrigger className="w-[180px] rounded-xl">
                                        <SelectValue placeholder="اختر الفترة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="this-month">هذا الشهر</SelectItem>
                                        <SelectItem value="last-month">الشهر الماضي</SelectItem>
                                        <SelectItem value="this-quarter">هذا الربع</SelectItem>
                                        <SelectItem value="this-year">هذه السنة</SelectItem>
                                        <SelectItem value="custom">فترة مخصصة</SelectItem>
                                    </SelectContent>
                                </Select>
                                {period === 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="h-10 px-3 rounded-xl border border-slate-200 text-sm"
                                        />
                                        <span className="text-slate-500">إلى</span>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="h-10 px-3 rounded-xl border border-slate-200 text-sm"
                                        />
                                    </div>
                                )}
                                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-3">
                                    {format(new Date(dateRange.start), 'dd/MM/yyyy')} - {format(new Date(dateRange.end), 'dd/MM/yyyy')}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (Main Reports) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. FINANCIAL SUMMARY (التقرير المالي) */}
                        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
                                <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-xl">
                                        <DollarSign className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    التقرير المالي
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Income */}
                                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold text-emerald-700">الدخل</span>
                                            <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="text-3xl font-bold text-emerald-900">
                                            {formatCurrency(financialSummary.income)}
                                        </div>
                                    </div>

                                    {/* Expenses */}
                                    <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold text-rose-700">المصروفات</span>
                                            <ArrowUpRight className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div className="text-3xl font-bold text-rose-900">
                                            {formatCurrency(financialSummary.expenses)}
                                        </div>
                                    </div>

                                    {/* Net Profit */}
                                    <div className={`${financialSummary.isPositive ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'} rounded-2xl p-6 border`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold text-slate-700">الربح الصافي</span>
                                            {financialSummary.isPositive ? (
                                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-slate-600" />
                                            )}
                                        </div>
                                        <div className={`text-3xl font-bold ${financialSummary.isPositive ? 'text-blue-900' : 'text-slate-700'}`}>
                                            {formatCurrency(financialSummary.netProfit)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. UNPAID INVOICES (الفواتير المستحقة) */}
                        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 rounded-xl">
                                            <FileText className="w-6 h-6 text-amber-600" aria-hidden="true" />
                                        </div>
                                        الفواتير المستحقة
                                    </CardTitle>
                                    <div className="text-left">
                                        <div className="text-sm text-slate-500">الإجمالي</div>
                                        <div className="text-2xl font-bold text-navy">
                                            {formatCurrency(unpaidInvoices.total)}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    {/* Current */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-700">حالية (لم تستحق بعد)</span>
                                            <span className="text-lg font-bold text-emerald-600">
                                                {formatCurrency(unpaidInvoices.current)}
                                            </span>
                                        </div>
                                        <Progress
                                            value={unpaidInvoices.total > 0 ? (unpaidInvoices.current / unpaidInvoices.total) * 100 : 0}
                                            className="h-3 bg-slate-100"
                                            indicatorClassName="bg-emerald-500"
                                        />
                                    </div>

                                    {/* 1-30 days */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-700">متأخرة (1-30 يوم)</span>
                                            <span className="text-lg font-bold text-amber-600">
                                                {formatCurrency(unpaidInvoices.days1to30)}
                                            </span>
                                        </div>
                                        <Progress
                                            value={unpaidInvoices.total > 0 ? (unpaidInvoices.days1to30 / unpaidInvoices.total) * 100 : 0}
                                            className="h-3 bg-slate-100"
                                            indicatorClassName="bg-amber-500"
                                        />
                                    </div>

                                    {/* 31-60 days */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-700">متأخرة (31-60 يوم)</span>
                                            <span className="text-lg font-bold text-orange-600">
                                                {formatCurrency(unpaidInvoices.days31to60)}
                                            </span>
                                        </div>
                                        <Progress
                                            value={unpaidInvoices.total > 0 ? (unpaidInvoices.days31to60 / unpaidInvoices.total) * 100 : 0}
                                            className="h-3 bg-slate-100"
                                            indicatorClassName="bg-orange-500"
                                        />
                                    </div>

                                    {/* 60+ days */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-700">متأخرة جداً (أكثر من 60 يوم)</span>
                                            <span className="text-lg font-bold text-rose-600">
                                                {formatCurrency(unpaidInvoices.over60)}
                                            </span>
                                        </div>
                                        <Progress
                                            value={unpaidInvoices.total > 0 ? (unpaidInvoices.over60 / unpaidInvoices.total) * 100 : 0}
                                            className="h-3 bg-slate-100"
                                            indicatorClassName="bg-rose-500"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. CASE PROFITABILITY (ربحية القضايا) */}
                        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-xl">
                                            <Briefcase className="w-6 h-6 text-blue-600" />
                                        </div>
                                        ربحية القضايا
                                    </CardTitle>
                                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'profit' | 'margin')}>
                                        <SelectTrigger className="w-[160px] rounded-xl">
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="profit">الربح الأعلى</SelectItem>
                                            <SelectItem value="margin">هامش الربح</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {caseProfitability.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>لا توجد بيانات ربحية للقضايا في هذه الفترة</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {caseProfitability.map((caseItem, index) => (
                                            <div key={caseItem.caseId} className="p-6 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-navy text-lg">{caseItem.caseNumber}</h4>
                                                                <p className="text-sm text-slate-500">{caseItem.clientName}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-left space-y-1">
                                                        <div className="text-sm text-slate-500">الربح</div>
                                                        <div className={`text-xl font-bold ${caseItem.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {formatCurrency(caseItem.profit)}
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={`${caseItem.profitMargin >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}
                                                        >
                                                            {caseItem.profitMargin.toFixed(1)}% هامش
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN (Sidebar + Bank Summary) */}
                    <div className="space-y-8">

                        {/* 4. BANK SUMMARY (ملخص البنوك) */}
                        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-6">
                                <CardTitle className="text-xl font-bold text-navy flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-xl">
                                        <Wallet className="w-5 h-5 text-purple-600" />
                                    </div>
                                    ملخص البنوك
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {/* Banks Total */}
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-purple-700">رصيد البنوك</span>
                                        <Wallet className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-purple-900 mb-1">
                                        {formatCurrency(bankSummary.banksTotal)}
                                    </div>
                                    <p className="text-xs text-purple-600">الأموال المتاحة في الحسابات</p>
                                </div>

                                {/* Unpaid Invoices Total */}
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-amber-700">المبالغ المستحقة</span>
                                        <FileText className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <div className="text-3xl font-bold text-amber-900 mb-1">
                                        {formatCurrency(bankSummary.unpaidInvoicesTotal)}
                                    </div>
                                    <p className="text-xs text-amber-600">فواتير تنتظر السداد من العملاء</p>
                                </div>

                                {/* Health Indicator */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">الوضع المالي</span>
                                        {bankSummary.banksTotal > bankSummary.unpaidInvoicesTotal / 2 ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                <CheckCircle className="w-3 h-3 ms-1" aria-hidden="true" />
                                                جيد
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-100 text-amber-700 border-0">
                                                <AlertCircle className="w-3 h-3 ms-1" aria-hidden="true" />
                                                يحتاج متابعة
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Finance Sidebar */}
                        <FinanceSidebar context="activity" />
                    </div>
                </div>
            </Main>
        </>
    )
}
