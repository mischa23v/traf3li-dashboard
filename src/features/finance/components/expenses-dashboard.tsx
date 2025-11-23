import { useState, useMemo } from 'react'
import {
    Search, Filter, Download, Plus, MoreHorizontal,
    Briefcase, Building, Car, Coffee, FileText, Home,
    Receipt, TrendingUp,
    Clock, PieChart, Bell, Loader2, AlertCircle
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
import { useExpenses, useExpenseStats } from '@/hooks/useFinance'

// Category icon mapping
const getCategoryIcon = (category: string) => {
    const lowerCategory = category?.toLowerCase() || ''
    if (lowerCategory.includes('قانون') || lowerCategory.includes('legal')) return Building
    if (lowerCategory.includes('استشار') || lowerCategory.includes('consult')) return Briefcase
    if (lowerCategory.includes('مواصلات') || lowerCategory.includes('transport')) return Car
    if (lowerCategory.includes('ضيافة') || lowerCategory.includes('hospitality')) return Coffee
    if (lowerCategory.includes('مكتب') || lowerCategory.includes('office')) return Home
    return Receipt
}

export default function ExpensesDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch expenses data
    const { data: expensesData, isLoading, isError, error, refetch } = useExpenses()
    const { data: statsData } = useExpenseStats()

    // Transform API data to component format
    const expenses = useMemo(() => {
        if (!expensesData?.expenses) return []
        return expensesData.expenses.map((exp: any) => ({
            id: exp.expenseId || exp._id,
            _id: exp._id,
            description: exp.description,
            category: exp.category,
            categoryIcon: getCategoryIcon(exp.category),
            amount: exp.amount,
            date: new Date(exp.date).toLocaleDateString('ar-SA'),
            caseNumber: exp.caseId?.caseNumber || null,
            caseName: exp.caseId ? `قضية ${exp.caseId.title || ''}` : 'مصروف عام',
            paymentMethod: exp.paymentMethod,
            status: exp.status === 'approved' ? 'مدفوع' : exp.status === 'pending' ? 'معلق' : exp.status,
            statusColor: exp.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : exp.status === 'pending'
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            hasReceipt: (exp.receipts && exp.receipts.length > 0) || false,
            vendor: exp.vendor || 'غير محدد',
            isBillable: exp.isBillable,
        }))
    }, [expensesData])

    // Filter Logic
    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            if (activeTab === 'all') return true
            if (activeTab === 'case') return exp.caseNumber !== null
            if (activeTab === 'general') return exp.caseNumber === null
            if (activeTab === 'pending') return exp.status === 'معلق'
            if (searchQuery && !exp.description.includes(searchQuery) && !exp.vendor.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [expenses, activeTab, searchQuery])

    // Calculate statistics
    const { totalExpenses, caseExpenses, generalExpenses, pendingExpenses, expensesByCategory } = useMemo(() => {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
        const caseExp = expenses.filter(exp => exp.caseNumber !== null).reduce((sum, exp) => sum + exp.amount, 0)
        const generalExp = expenses.filter(exp => exp.caseNumber === null).reduce((sum, exp) => sum + exp.amount, 0)
        const pendingExp = expenses.filter(exp => exp.status === 'معلق').reduce((sum, exp) => sum + exp.amount, 0)

        const byCategory = expenses.reduce((acc: any, exp) => {
            if (!acc[exp.category]) {
                acc[exp.category] = { total: 0, count: 0 }
            }
            acc[exp.category].total += exp.amount
            acc[exp.category].count += 1
            return acc
        }, {})

        return {
            totalExpenses: total,
            caseExpenses: caseExp,
            generalExpenses: generalExp,
            pendingExpenses: pendingExp,
            expensesByCategory: byCategory,
        }
    }, [expenses])

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
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: true },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
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
                            <Skeleton className="h-32 w-full rounded-3xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل المصروفات</h3>
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

    // EMPTY STATE
    if (filteredExpenses.length === 0 && !searchQuery && activeTab === 'all') {
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
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="h-8 w-8 text-brand-blue" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد مصروفات بعد</h3>
                        <p className="text-slate-500 mb-6">ابدأ بإضافة أول مصروف</p>
                        <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                            <Link to="/dashboard/finance/expenses/new">
                                <Plus className="ml-2 h-4 w-4" />
                                إضافة مصروف جديد
                            </Link>
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

                    {/* Hero Section - Contained Navy Card */}
                    <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#022c22]/20 mb-8">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                            <Receipt className="w-3 h-3 ml-2" />
                                            المصروفات
                                        </Badge>
                                        <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                        إدارة المصروفات
                                    </h1>
                                    <p className="text-blue-200/80">تتبع النفقات، الفواتير، والميزانية العامة</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                        <Download className="w-4 h-4 ml-2" />
                                        تصدير التقرير
                                    </Button>
                                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl">
                                        <Link to="/dashboard/finance/expenses/new">
                                            <Plus className="w-4 h-4 ml-2" />
                                            مصروف جديد
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-200">إجمالي المصروفات</span>
                                        <span className="font-bold text-emerald-400">-2.5%</span>
                                    </div>
                                    <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
                                    <Progress value={45} className="h-1.5 bg-white/10" indicatorClassName="bg-emerald-500" />
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">مصروفات القضايا</div>
                                        <div className="text-2xl font-bold">{formatCurrency(caseExpenses)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-blue-200" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">مصروفات عامة</div>
                                        <div className="text-2xl font-bold text-emerald-400">{formatCurrency(generalExpenses)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Building className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Remaining Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pending Expenses */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">
                                        معلق
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">مصروفات معلقة</h3>
                                    <div className="text-2xl font-bold text-[#022c22]">{formatCurrency(pendingExpenses)}</div>
                                </div>
                                <Progress value={(pendingExpenses / totalExpenses) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-amber-500" />
                            </CardContent>
                        </Card>

                        {/* Budget Status (Mock) */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <PieChart className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                        الميزانية
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">المتبقي من الميزانية</h3>
                                    <div className="text-2xl font-bold text-[#022c22]">45%</div>
                                </div>
                                <Progress value={55} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-blue-500" />
                            </CardContent>
                        </Card>

                        {/* Average Daily (Mock) */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100">
                                        يومي
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">متوسط الصرف اليومي</h3>
                                    <div className="text-2xl font-bold text-[#022c22]">{formatCurrency(totalExpenses / 30)}</div>
                                </div>
                                <Progress value={30} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-purple-500" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Expenses List */}
                        <div className="lg:col-span-8 space-y-6">
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
                                            value="case"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            قضايا
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="general"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            عامة
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="pending"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            معلقة
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-3 flex-1 justify-end">
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="بحث في المصروفات..."
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

                            {/* Expenses List - Vertical Stack Cards */}
                            <div className="space-y-4">
                                {filteredExpenses.map((expense) => {
                                    const Icon = expense.categoryIcon
                                    return (
                                        <div key={expense.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-600">
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-[#022c22] text-lg">{expense.description}</h4>
                                                            <Badge className={`${expense.statusColor} border-0 px-2 rounded-md`}>
                                                                {expense.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-500 text-sm">{expense.vendor} • {expense.category}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#022c22]">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>تعديل</DropdownMenuItem>
                                                        <DropdownMenuItem>عرض الإيصال</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                        <div className="font-bold text-[#022c22] text-lg">{formatCurrency(expense.amount)}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">التاريخ</div>
                                                        <div className="font-bold text-[#022c22]">{expense.date}</div>
                                                    </div>
                                                    {expense.caseName && (
                                                        <div className="text-center hidden sm:block">
                                                            <div className="text-xs text-slate-400 mb-1">القضية</div>
                                                            <div className="font-bold text-[#022c22] text-sm">{expense.caseName}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    <Link to="/dashboard/finance/expenses/$expenseId" params={{ expenseId: expense.id }}>
                                                        عرض التفاصيل
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Sidebar - Analytics */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Category Distribution */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-brand-blue" />
                                        توزيع المصروفات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {Object.entries(expensesByCategory)
                                        .sort((a: any, b: any) => b[1].total - a[1].total)
                                        .slice(0, 5)
                                        .map(([category, data]: any, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-bold text-[#022c22]">{category}</span>
                                                    <span className="text-slate-500">{formatCurrency(data.total)}</span>
                                                </div>
                                                <Progress
                                                    value={(data.total / totalExpenses) * 100}
                                                    className="h-2 bg-slate-100"
                                                    indicatorClassName="bg-brand-blue"
                                                />
                                            </div>
                                        ))}
                                </CardContent>
                            </Card>

                            {/* Recent Activity (Simplified) */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-amber-500" />
                                        آخر النشاطات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {expenses.slice(0, 3).map((exp, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                            <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-emerald-500"></div>
                                            <div>
                                                <div className="font-bold text-[#022c22] text-sm">تم دفع {exp.description}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{exp.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
