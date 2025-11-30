import { useState, useMemo } from 'react'
import {
    Search, Filter, Download, Plus, MoreHorizontal,
    ArrowUpRight, ArrowDownRight,
    FileText, Calendar, TrendingUp, Car,
    Wallet, Building, PieChart, Bell, Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useTransactions, useAccountBalance, useTransactionSummary } from '@/hooks/useFinance'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Helper function to get icon based on category
const getCategoryIcon = (category: string, type: string) => {
    if (type === 'credit' || type === 'income') return ArrowUpRight
    if (type === 'debit' || type === 'expense') return ArrowDownRight
    const lowerCategory = category?.toLowerCase() || ''
    if (lowerCategory.includes('قانون') || lowerCategory.includes('legal')) return Building
    if (lowerCategory.includes('استشار') || lowerCategory.includes('consult')) return TrendingUp
    if (lowerCategory.includes('مواصلات') || lowerCategory.includes('transport')) return Car
    return FileText
}

export default function TransactionsDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch transactions data
    const { data: transactionsData, isLoading, isError, error, refetch } = useTransactions()
    const { data: balanceData } = useAccountBalance()
    const { data: summaryData } = useTransactionSummary()

    // Transform API data to component format
    const transactions = useMemo(() => {
        if (!transactionsData?.data) return []
        return transactionsData.data.map((txn: any) => ({
            id: txn._id,
            date: new Date(txn.date).toLocaleDateString('ar-SA'),
            type: txn.type === 'credit' ? 'income' : 'expense',
            category: txn.category || 'عام',
            description: txn.description,
            reference: txn.invoiceId?._id || txn.expenseId?._id || txn.reference || '-',
            amount: txn.amount,
            paymentMethod: txn.paymentMethod || 'غير محدد',
            status: txn.status === 'completed' ? 'مكتمل' : txn.status === 'pending' ? 'معلق' : txn.status,
            icon: getCategoryIcon(txn.category, txn.type),
        }))
    }, [transactionsData])

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            if (activeTab === 'all') return true
            if (activeTab === 'income') return txn.type === 'income'
            if (activeTab === 'expense') return txn.type === 'expense'
            if (searchQuery && !txn.description.includes(searchQuery) && !txn.reference.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [transactions, activeTab, searchQuery])

    // Calculate statistics
    const { totalIncome, totalExpenses, netProfit, currentBalance } = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
        const balance = balanceData?.balance || 0
        return {
            totalIncome: income,
            totalExpenses: expenses,
            netProfit: income - expenses,
            currentBalance: balance,
        }
    }, [transactions, balanceData])

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: true },
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
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-96 w-full rounded-3xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Skeleton className="h-64 w-full rounded-2xl" />
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل المعاملات</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
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
                <div className="max-w-7xl mx-auto space-y-6">

                    <ProductivityHero
                        badge="المالية"
                        title="سجل المعاملات المالية"
                        type="finance"
                        hideButtons={true}
                        stats={[
                            {
                                label: "صافي الربح",
                                value: formatCurrency(netProfit),
                                icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
                                status: 'normal'
                            },
                            {
                                label: "إجمالي الدخل",
                                value: formatCurrency(totalIncome),
                                icon: <ArrowUpRight className="w-4 h-4 text-blue-400" />,
                                status: 'normal'
                            },
                            {
                                label: "إجمالي المصروفات",
                                value: formatCurrency(totalExpenses),
                                icon: <ArrowDownRight className="w-4 h-4 text-red-400" />,
                                status: 'normal'
                            }
                        ]}
                    >
                        <div className="flex gap-3">
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                                <Link to="/dashboard/finance/transactions/new">
                                    <Plus className="ml-2 h-4 w-4" />
                                    معاملة جديدة
                                </Link>
                            </Button>
                            <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20 h-10 px-5 rounded-xl font-bold border-0 backdrop-blur-sm">
                                <Download className="ml-2 h-4 w-4" />
                                تصدير الكشف
                            </Button>
                        </div>
                    </ProductivityHero>

                    {/* Stats Grid - Remaining Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Net Profit Card */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                        صافي
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">صافي الربح</h3>
                                    <div className="text-2xl font-bold text-[#022c22]">{formatCurrency(netProfit)}</div>
                                </div>
                                <Progress value={(netProfit / totalIncome) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-emerald-500" />
                            </CardContent>
                        </Card>

                        {/* Total Income Card */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <ArrowUpRight className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                        دخل
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">إجمالي الدخل</h3>
                                    <div className="text-2xl font-bold text-[#022c22]">{formatCurrency(totalIncome)}</div>
                                </div>
                                <Progress value={(totalIncome / (totalIncome + totalExpenses)) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-blue-500" />
                            </CardContent>
                        </Card>

                        {/* Total Expenses Card */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <ArrowDownRight className="w-6 h-6 text-red-600" />
                                    </div>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100">
                                        مصروف
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">إجمالي المصروفات</h3>
                                    <div className="text-2xl font-bold text-[#022c22]">{formatCurrency(totalExpenses)}</div>
                                </div>
                                <Progress value={(totalExpenses / (totalIncome + totalExpenses)) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-red-500" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Transactions List */}
                        <div className="lg:col-span-2 space-y-6">
                            {filteredTransactions.length === 0 && !searchQuery && activeTab === 'all' ? (
                                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Wallet className="h-8 w-8 text-brand-blue" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد معاملات بعد</h3>
                                    <p className="text-slate-500 mb-6">ستظهر جميع المعاملات المالية هنا</p>
                                </div>
                            ) : (
                                <>
                                    {/* Filters Bar */}
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                            <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                                <TabsTrigger
                                                    value="all"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    الكل
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="income"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    دخل
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="expense"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    مصروف
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>

                                        <div className="flex items-center gap-3 flex-1 justify-end">
                                            <div className="relative w-full max-w-xs">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="بحث في المعاملات..."
                                                    className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                                <Filter className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Transactions List - Vertical Stack Cards */}
                                    <div className="space-y-4">
                                        {filteredTransactions.map((txn) => {
                                            const isIncome = txn.type === 'income'
                                            const Icon = txn.icon || (isIncome ? ArrowUpRight : ArrowDownRight)
                                            return (
                                                <div key={txn.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex gap-4 items-center">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                                <Icon className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-bold text-[#022c22] text-lg">{txn.description}</h4>
                                                                    <Badge variant="outline" className={`${isIncome ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-red-600 border-red-200 bg-red-50'} border px-2 rounded-md`}>
                                                                        {isIncome ? 'دخل' : 'مصروف'}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-slate-500 text-sm">{txn.category} • {txn.reference}</p>
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#022c22]">
                                                                    <MoreHorizontal className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link to="/dashboard/finance/transactions/$transactionId" params={{ transactionId: txn.id }}>
                                                                        عرض التفاصيل
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>طباعة الإيصال</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-center">
                                                                <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                                <div className={`font-bold text-lg ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                    {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-xs text-slate-400 mb-1">التاريخ</div>
                                                                <div className="font-bold text-[#022c22]">{txn.date}</div>
                                                            </div>
                                                            <div className="text-center hidden sm:block">
                                                                <div className="text-xs text-slate-400 mb-1">طريقة الدفع</div>
                                                                <div className="font-bold text-[#022c22] text-sm">{txn.paymentMethod}</div>
                                                            </div>
                                                        </div>
                                                        <Button asChild variant="ghost" className="text-slate-500 hover:text-[#022c22] hover:bg-slate-100 rounded-lg">
                                                            <Link to="/dashboard/finance/transactions/$transactionId" params={{ transactionId: txn.id }}>
                                                                عرض
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sidebar - Analytics */}
                        <FinanceSidebar context="transactions" />
                    </div>
                </div>
            </Main >
        </>
    )
}
