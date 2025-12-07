import { useState } from 'react'
import {
    Search, Filter, Download, Plus, MoreHorizontal,
    ArrowUpRight, ArrowDownRight,
    FileText, Calendar, TrendingUp, Car,
    Wallet, Building, PieChart, Bell
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function AccountStatementDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Mock Data
    const transactions = [
        {
            id: 'TXN-2025-001',
            date: '15 نوفمبر 2025',
            type: 'income',
            category: 'فاتورة',
            description: 'دفعة من مشاري الرابح',
            reference: 'INV-2025-001',
            amount: 52900,
            paymentMethod: 'تحويل بنكي',
            status: 'مكتمل',
            icon: ArrowUpRight
        },
        {
            id: 'TXN-2025-002',
            date: '15 نوفمبر 2025',
            type: 'expense',
            category: 'رسوم قانونية',
            description: 'استئجار قاعة المحكمة',
            reference: 'EXP-2025-001',
            amount: 5652.17,
            paymentMethod: 'بطاقة ائتمان',
            status: 'مكتمل',
            icon: Building
        },
        {
            id: 'TXN-2025-003',
            date: '14 نوفمبر 2025',
            type: 'income',
            category: 'فاتورة',
            description: 'دفعة من عبدالله الغامدي',
            reference: 'INV-2025-002',
            amount: 38000,
            paymentMethod: 'تحويل بنكي',
            status: 'مكتمل',
            icon: ArrowUpRight
        },
        {
            id: 'TXN-2025-004',
            date: '14 نوفمبر 2025',
            type: 'expense',
            category: 'اشتراكات',
            description: 'اشتراك المكتبة القانونية',
            reference: 'EXP-2025-002',
            amount: 2500,
            paymentMethod: 'تحويل بنكي',
            status: 'مكتمل',
            icon: FileText
        },
        {
            id: 'TXN-2025-005',
            date: '12 نوفمبر 2025',
            type: 'income',
            category: 'فاتورة',
            description: 'دفعة من فاطمة العتيبي',
            reference: 'INV-2025-003',
            amount: 52000,
            paymentMethod: 'شيك',
            status: 'مكتمل',
            icon: ArrowUpRight
        },
        {
            id: 'TXN-2025-006',
            date: '12 نوفمبر 2025',
            type: 'expense',
            category: 'استشارات',
            description: 'استشارة خبير مالي',
            reference: 'EXP-2025-003',
            amount: 8000,
            paymentMethod: 'نقدي',
            status: 'مكتمل',
            icon: TrendingUp
        },
        {
            id: 'TXN-2025-007',
            date: '10 نوفمبر 2025',
            type: 'expense',
            category: 'مواصلات',
            description: 'وقود السيارة',
            reference: 'EXP-2025-004',
            amount: 450,
            paymentMethod: 'نقدي',
            status: 'مكتمل',
            icon: Car
        },
        {
            id: 'TXN-2025-009',
            date: '8 نوفمبر 2025',
            type: 'expense',
            category: 'خدمات',
            description: 'ترجمة مستندات قانونية',
            reference: 'EXP-2025-006',
            amount: 1500,
            paymentMethod: 'تحويل بنكي',
            status: 'معلق',
            icon: FileText
        }
    ]

    // Filter Logic
    const filteredTransactions = transactions.filter(txn => {
        if (activeTab === 'all') return true
        if (activeTab === 'income') return txn.type === 'income'
        if (activeTab === 'expense') return txn.type === 'expense'
        if (searchQuery && !txn.description.includes(searchQuery) && !txn.reference.includes(searchQuery)) return false
        return true
    })

    // Calculate statistics
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const netProfit = totalIncome - totalExpenses
    const currentBalance = 125400 // Mock balance

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
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
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
                    <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 mb-8">
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
                                            <Wallet className="w-3 h-3 ms-2" />
                                            المالية
                                        </Badge>
                                        <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                        كشوف الحساب
                                    </h1>
                                    <p className="text-blue-200/80">متابعة التدفقات النقدية، الإيرادات، والمصروفات</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                        <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                        تصدير الكشف
                                    </Button>
                                    <Button className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                        معاملة جديدة
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-200">الرصيد الحالي</span>
                                        <span className="font-bold text-emerald-400">+12%</span>
                                    </div>
                                    <div className="text-3xl font-bold">{formatCurrency(currentBalance)}</div>
                                    <Progress value={75} className="h-1.5 bg-white/10" indicatorClassName="bg-brand-blue" />
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pe-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">إجمالي الدخل</div>
                                        <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pe-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">إجمالي المصروفات</div>
                                        <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Transactions List */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Filters Bar */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                    <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                        <TabsTrigger
                                            value="all"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-navy data-[state=active]:text-white transition-all duration-300"
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
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                        <Input
                                            placeholder="بحث في المعاملات..."
                                            className="pe-10 rounded-xl border-slate-200 focus:ring-navy focus:border-navy"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                        <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
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
                                                            <h4 className="font-bold text-navy text-lg">{txn.description}</h4>
                                                            <Badge variant="outline" className={`${isIncome ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-red-600 border-red-200 bg-red-50'} border px-2 rounded-md`}>
                                                                {isIncome ? 'دخل' : 'مصروف'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-500 text-sm">{txn.category} • {txn.reference}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-navy" aria-label="تعديل">
                                                            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                                                        <DropdownMenuItem>طباعة الإيصال</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600 mb-1">المبلغ</div>
                                                        <div className={`font-bold text-lg ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600 mb-1">التاريخ</div>
                                                        <div className="font-bold text-navy">{txn.date}</div>
                                                    </div>
                                                    <div className="text-center hidden sm:block">
                                                        <div className="text-xs text-slate-600 mb-1">طريقة الدفع</div>
                                                        <div className="font-bold text-navy text-sm">{txn.paymentMethod}</div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="text-slate-500 hover:text-navy hover:bg-slate-100 rounded-lg">
                                                    عرض
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Sidebar - Analytics */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Net Profit Card */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-brand-blue" />
                                        صافي الربح
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 text-center">
                                    <div className="w-32 h-32 mx-auto rounded-full border-8 border-slate-50 flex items-center justify-center mb-4 relative">
                                        <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent transform -rotate-45"></div>
                                        <div className="text-center">
                                            <div className="text-xs text-slate-600">الصافي</div>
                                            <div className="font-bold text-navy text-lg">{formatCurrency(netProfit)}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="text-center p-3 bg-emerald-50 rounded-xl">
                                            <div className="text-xs text-emerald-600 mb-1">دخل</div>
                                            <div className="font-bold text-emerald-700">{formatCurrency(totalIncome)}</div>
                                        </div>
                                        <div className="text-center p-3 bg-red-50 rounded-xl">
                                            <div className="text-xs text-red-600 mb-1">مصروف</div>
                                            <div className="font-bold text-red-700">{formatCurrency(totalExpenses)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-amber-500" aria-hidden="true" />
                                        ملخص النشاط
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">عدد المعاملات</span>
                                        <span className="font-bold text-navy">{transactions.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">أعلى دخل</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount)))}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">أعلى مصروف</span>
                                        <span className="font-bold text-red-600">{formatCurrency(Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount)))}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
