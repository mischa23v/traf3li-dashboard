import { useMemo } from 'react'
import {
    TrendingUp, TrendingDown, FileText, Receipt, AlertCircle,
    ArrowUpRight, ArrowDownRight,
    PieChart, Download, Plus, Search,
    Wallet,
    CreditCard, ArrowLeftRight, Landmark, Bell
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccountBalance, useTransactionSummary, useTransactions, useInvoices } from '@/hooks/useFinance'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'

interface AccountsDashboardProps {
    defaultTab?: string
}

export default function AccountsDashboard({ }: AccountsDashboardProps) {
    // Fetch financial data
    const { data: balanceData, isLoading: isLoadingBalance } = useAccountBalance()
    const { data: summaryData, isLoading: isLoadingSummary } = useTransactionSummary()
    const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions({ limit: 10 })
    const { data: invoicesData } = useInvoices({ status: 'pending' })

    const isLoading = isLoadingBalance || isLoadingSummary || isLoadingTransactions

    // Calculate financial summary
    const financialSummary = useMemo(() => {
        const balance = balanceData?.balance || 0
        const revenue = summaryData?.data?.totalIncome || summaryData?.data?.income || 0
        const expenses = summaryData?.data?.totalExpenses || summaryData?.data?.expenses || 0
        const netProfit = revenue - expenses
        const growth = summaryData?.data?.growth || 0

        // Calculate outstanding from pending invoices
        const outstanding = invoicesData?.invoices
            ? invoicesData.invoices.reduce((sum: number, inv: any) => sum + (inv.balanceDue || inv.totalAmount || 0), 0)
            : 0

        return {
            totalBalance: balance,
            monthlyRevenue: revenue,
            monthlyExpenses: expenses,
            netProfit,
            growth,
            outstanding
        }
    }, [balanceData, summaryData, invoicesData])

    // Cash Flow Data (last 6 months from API or mock)
    const cashFlow = useMemo(() => {
        // If API provides monthly breakdown, use it
        if (summaryData?.data?.monthlyBreakdown) {
            return summaryData.data.monthlyBreakdown
        }

        // Otherwise use mock data for now
        return [
            { month: 'يونيو', income: 75000, expenses: 42000 },
            { month: 'يوليو', income: 82000, expenses: 45000 },
            { month: 'أغسطس', income: 68000, expenses: 38000 },
            { month: 'سبتمبر', income: 95000, expenses: 52000 },
            { month: 'أكتوبر', income: 118000, expenses: 48000 },
            { month: 'نوفمبر', income: financialSummary.monthlyRevenue, expenses: financialSummary.monthlyExpenses }
        ]
    }, [summaryData, financialSummary])

    const maxCashFlow = Math.max(...cashFlow.map(m => Math.max(m.income, m.expenses)))

    // Transform recent transactions
    const transactions = useMemo(() => {
        if (!transactionsData?.data) return []

        return transactionsData.data.slice(0, 4).map((txn: any) => ({
            id: txn._id,
            type: txn.type === 'credit' ? 'income' : 'expense',
            title: txn.description || 'معاملة',
            date: new Date(txn.date).toLocaleDateString('ar-SA', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            amount: txn.amount || 0,
            status: txn.status || 'completed'
        }))
    }, [transactionsData])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: true },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
    ]

    return (
        <>
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
                {isLoading ? (
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        <Skeleton className="h-[400px] w-full rounded-[32px]" />
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Skeleton className="h-[400px] w-full rounded-[32px]" />
                                <Skeleton className="h-[300px] w-full rounded-[32px]" />
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <Skeleton className="h-[300px] w-full rounded-[32px]" />
                                <Skeleton className="h-[400px] w-full rounded-[32px]" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto space-y-8">

                        {/* HERO SECTION */}
                        <ProductivityHero
                            badge="السنة المالية 2025"
                            title="لوحة الحسابات"
                            type="finance"
                            hideButtons={true}
                            stats={[
                                {
                                    label: "إجمالي الرصيد",
                                    value: formatCurrency(financialSummary.totalBalance),
                                    icon: <Landmark className="w-4 h-4 text-brand-blue" />,
                                    trend: `${financialSummary.growth}%`,
                                },
                                {
                                    label: "الإيرادات (هذا الشهر)",
                                    value: formatCurrency(financialSummary.monthlyRevenue),
                                    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />
                                },
                                {
                                    label: "المصروفات (هذا الشهر)",
                                    value: formatCurrency(financialSummary.monthlyExpenses),
                                    icon: <TrendingDown className="w-4 h-4 text-rose-400" />
                                },
                                {
                                    label: "صافي الربح",
                                    value: formatCurrency(financialSummary.netProfit),
                                    icon: <PieChart className="w-4 h-4 text-white" />
                                }
                            ]}
                        >
                            <div className="flex gap-3">
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-5 backdrop-blur-sm">
                                    <Download className="w-4 h-4 ml-2" />
                                    تصدير التقرير
                                </Button>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl h-10 px-5 font-bold">
                                    <Plus className="w-4 h-4 ml-2" />
                                    معاملة جديدة
                                </Button>
                            </div>
                        </ProductivityHero>

                        {/* MAIN CONTENT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* LEFT COLUMN (Main Content) */}
                            <div className="lg:col-span-8 space-y-8">

                                {/* Cash Flow Chart Card */}
                                <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden">
                                    <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-navy">التحليل المالي</CardTitle>
                                                <p className="text-slate-500 text-sm mt-1">مقارنة الإيرادات والمصروفات (آخر 6 أشهر)</p>
                                            </div>
                                            <div className="flex gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-navy"></div>
                                                    <span className="text-slate-600">إيرادات</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                                    <span className="text-slate-600">مصروفات</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="h-[280px] flex items-end justify-between gap-4 md:gap-8">
                                            {cashFlow.map((item, idx) => (
                                                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                                    <div className="w-full flex items-end justify-center gap-1.5 h-[240px] relative">
                                                        {/* Income Bar */}
                                                        <div
                                                            className="w-full bg-navy rounded-t-xl transition-all duration-500 group-hover:bg-brand-blue relative"
                                                            style={{ height: `${(item.income / maxCashFlow) * 100}%` }}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                {formatCurrency(item.income)}
                                                            </div>
                                                        </div>
                                                        {/* Expense Bar */}
                                                        <div
                                                            className="w-full bg-slate-200 rounded-t-xl transition-all duration-500 group-hover:bg-slate-300 relative"
                                                            style={{ height: `${(item.expenses / maxCashFlow) * 100}%` }}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                {formatCurrency(item.expenses)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500 group-hover:text-navy transition-colors">{item.month}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Transactions */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-xl font-bold text-navy">أحدث المعاملات</h3>
                                        <Button variant="ghost" className="text-brand-blue hover:bg-blue-50">عرض الكل</Button>
                                    </div>

                                    {transactions.map((trx, i) => (
                                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {trx.type === 'income' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-navy text-base group-hover:text-brand-blue transition-colors">{trx.title}</h4>
                                                    <div className="text-sm text-slate-500 mt-0.5">{trx.date}</div>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold text-lg ${trx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {trx.type === 'income' ? '+' : '-'}{formatCurrency(trx.amount)}
                                                </div>
                                                <Badge variant="outline" className="mt-1 border-slate-200 text-slate-500 font-normal">
                                                    {trx.status === 'completed' ? 'مكتمل' : 'معلق'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT COLUMN (Sidebar) */}
                            <div className="lg:col-span-4 space-y-6">

                                {/* Quick Actions */}
                                <Card className="border-0 shadow-sm rounded-[32px] bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-navy">إجراءات سريعة</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="h-28 flex flex-col gap-3 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-blue/20 hover:shadow-md text-navy rounded-2xl transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileText className="w-5 h-5 text-brand-blue" />
                                            </div>
                                            <span className="font-bold text-sm">إنشاء فاتورة</span>
                                        </Button>
                                        <Button variant="outline" className="h-28 flex flex-col gap-3 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-500/20 hover:shadow-md text-navy rounded-2xl transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Receipt className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <span className="font-bold text-sm">تسجيل مصروف</span>
                                        </Button>
                                        <Button variant="outline" className="h-28 flex flex-col gap-3 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-purple-500/20 hover:shadow-md text-navy rounded-2xl transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <CreditCard className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <span className="font-bold text-sm">سداد مستحقات</span>
                                        </Button>
                                        <Button variant="outline" className="h-28 flex flex-col gap-3 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-amber-500/20 hover:shadow-md text-navy rounded-2xl transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ArrowLeftRight className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <span className="font-bold text-sm">تحويل رصيد</span>
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Financial Health */}
                                <Card className="border-0 shadow-sm rounded-[32px] bg-white">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <PieChart className="w-5 h-5 text-brand-blue" />
                                            الصحة المالية
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-navy">معدل التحصيل</span>
                                                <span className="text-emerald-600 font-bold">72.5%</span>
                                            </div>
                                            <Progress value={72.5} className="h-2.5 bg-slate-100" indicatorClassName="bg-emerald-500" />
                                            <p className="text-xs text-slate-400">أعلى بنسبة 5% من الشهر الماضي</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-navy">هامش الربح</span>
                                                <span className="text-brand-blue font-bold">38.5%</span>
                                            </div>
                                            <Progress value={38.5} className="h-2.5 bg-slate-100" indicatorClassName="bg-brand-blue" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-navy">الميزانية المستهلكة</span>
                                                <span className="text-amber-500 font-bold">65%</span>
                                            </div>
                                            <Progress value={65} className="h-2.5 bg-slate-100" indicatorClassName="bg-amber-500" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Outstanding Alerts */}
                                <Card className="border-0 shadow-sm rounded-[32px] bg-rose-50/50 border-rose-100">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold text-rose-700 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            تنبيهات هامة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-2 space-y-3">
                                        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                            <div>
                                                <h4 className="font-bold text-navy text-sm">فاتورة متأخرة - محمد الدوسري</h4>
                                                <p className="text-xs text-slate-500 mt-1">مستحقة منذ 5 أيام • 42,000 ر.س</p>
                                                <Button variant="link" className="text-rose-600 p-0 h-auto text-xs mt-2">إرسال تذكير</Button>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                                            <div>
                                                <h4 className="font-bold text-navy text-sm">تجديد اشتراك المكتبة</h4>
                                                <p className="text-xs text-slate-500 mt-1">يستحق خلال 3 أيام • 2,500 ر.س</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>
                        </div>
                    </div>
                )}
            </Main>
        </>
    )
}
