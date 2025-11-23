import { useState } from 'react'
import {
    TrendingUp, TrendingDown, DollarSign, FileText, Receipt, AlertCircle,
    Clock, CheckCircle, Calendar, Users, ArrowUpRight, ArrowDownRight,
    PieChart, Download, Plus, Search, Filter, MoreHorizontal,
    Briefcase, Building, Car, Coffee, Home, ChevronLeft, Wallet,
    CreditCard, ArrowLeftRight, Landmark
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function AccountsDashboard() {
    const [activeTab, setActiveTab] = useState('overview')

    // Financial Summary Data
    const financialSummary = {
        totalBalance: 1245000,
        monthlyRevenue: 125400,
        monthlyExpenses: 48320,
        netProfit: 77080,
        growth: 15.3,
        outstanding: 105807.50
    }

    // Cash Flow Data
    const cashFlow = [
        { month: 'يونيو', income: 75000, expenses: 42000 },
        { month: 'يوليو', income: 82000, expenses: 45000 },
        { month: 'أغسطس', income: 68000, expenses: 38000 },
        { month: 'سبتمبر', income: 95000, expenses: 52000 },
        { month: 'أكتوبر', income: 118000, expenses: 48000 },
        { month: 'نوفمبر', income: 125400, expenses: 48320 }
    ]
    const maxCashFlow = Math.max(...cashFlow.map(m => Math.max(m.income, m.expenses)))

    // Recent Transactions (Mixed)
    const transactions = [
        { id: 'TRX-001', type: 'income', title: 'دفعة - قضية المصنع السعودي', date: 'اليوم, 10:30 ص', amount: 15000, status: 'completed' },
        { id: 'TRX-002', type: 'expense', title: 'إيجار المكتب - نوفمبر', date: 'أمس, 09:15 ص', amount: 15000, status: 'completed' },
        { id: 'TRX-003', type: 'income', title: 'استشارة قانونية - محمد', date: '15 نوفمبر', amount: 2500, status: 'completed' },
        { id: 'TRX-004', type: 'expense', title: 'رسوم محكمة', date: '14 نوفمبر', amount: 500, status: 'pending' },
    ]

    // Invoices Data
    const invoices = [
        { id: 'INV-2025-001', client: 'مشاري الرابح', amount: 52900, date: '15/11/2025', status: 'pending', dueDate: '15/12/2025' },
        { id: 'INV-2025-002', client: 'شركة البناء الحديثة', amount: 28000, date: '10/11/2025', status: 'paid', dueDate: '10/12/2025' },
        { id: 'INV-2025-003', client: 'محمد الدوسري', amount: 42000, date: '05/11/2025', status: 'overdue', dueDate: '05/11/2025' },
    ]

    // Expenses Data
    const expenses = [
        { id: 'EXP-001', title: 'استئجار قاعة', category: 'رسوم', amount: 5000, date: '15/11/2025', status: 'paid' },
        { id: 'EXP-002', title: 'اشتراك مكتبة', category: 'اشتراكات', amount: 2500, date: '14/11/2025', status: 'paid' },
        { id: 'EXP-003', title: 'ضيافة عملاء', category: 'ضيافة', amount: 320, date: '12/11/2025', status: 'paid' },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* HERO SECTION */}
                <div className="bg-navy rounded-[32px] p-8 relative overflow-hidden text-white shadow-2xl shadow-navy/20">
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/20 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/5 rounded-full blur-[100px] opacity-20"></div>
                    </div>

                    <div className="relative z-10">
                        {/* Header Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md px-3 py-1 text-sm font-normal">
                                        <Wallet className="w-4 h-4 ml-2 text-emerald-400" />
                                        السنة المالية 2025
                                    </Badge>
                                    <span className="text-slate-300 text-sm">آخر تحديث: منذ 5 دقائق</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2 tracking-tight">
                                    لوحة الحسابات
                                </h1>
                                <p className="text-blue-100/80 text-lg font-light">نظرة شاملة على الأداء المالي والتدفقات النقدية</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl h-12 px-6 backdrop-blur-sm">
                                    <Download className="w-5 h-5 ml-2" />
                                    تصدير التقرير
                                </Button>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-2xl h-12 px-6 font-bold">
                                    <Plus className="w-5 h-5 ml-2" />
                                    معاملة جديدة
                                </Button>
                            </div>
                        </div>

                        {/* Financial Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Balance */}
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Landmark className="w-6 h-6 text-brand-blue" />
                                    </div>
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0">
                                        <ArrowUpRight className="w-3 h-3 ml-1" />
                                        {financialSummary.growth}%
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-slate-300 text-sm">إجمالي الرصيد</span>
                                    <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(financialSummary.totalBalance)}</div>
                                </div>
                            </div>

                            {/* Monthly Revenue */}
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-400 text-xs">هذا الشهر</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-slate-300 text-sm">الإيرادات</span>
                                    <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(financialSummary.monthlyRevenue)}</div>
                                </div>
                            </div>

                            {/* Monthly Expenses */}
                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <TrendingDown className="w-6 h-6 text-rose-400" />
                                    </div>
                                    <span className="text-slate-400 text-xs">هذا الشهر</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-slate-300 text-sm">المصروفات</span>
                                    <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(financialSummary.monthlyExpenses)}</div>
                                </div>
                            </div>

                            {/* Net Profit */}
                            <div className="bg-gradient-to-br from-brand-blue/20 to-emerald-500/20 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-colors group relative overflow-hidden">
                                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="w-6 h-6 text-white" />
                                    </div>
                                    <Badge className="bg-white/20 text-white border-0">هامش 38%</Badge>
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <span className="text-blue-100 text-sm">صافي الربح</span>
                                    <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(financialSummary.netProfit)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (Main Content) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Tabs Navigation */}
                        <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm inline-flex w-full md:w-auto">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-slate-50 p-1 rounded-xl h-auto w-full justify-start gap-2">
                                    {['overview', 'invoices', 'expenses', 'statements'].map((tab) => (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            className="
                                                rounded-lg px-6 py-2.5 text-sm font-bold transition-all
                                                data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-sm
                                                text-slate-500 hover:text-navy
                                            "
                                        >
                                            {tab === 'overview' ? 'نظرة عامة' :
                                                tab === 'invoices' ? 'الفواتير' :
                                                    tab === 'expenses' ? 'المصروفات' : 'كشف الحساب'}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-6">
                            {activeTab === 'overview' && (
                                <>
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
                                </>
                            )}

                            {activeTab === 'invoices' && (
                                <div className="space-y-4">
                                    {invoices.map((inv, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
                                                    <FileText className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{inv.id}</h4>
                                                        <Badge className={`
                                                            ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                                inv.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'} 
                                                            border-0 px-2 py-0.5
                                                        `}>
                                                            {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'overdue' ? 'متأخرة' : 'معلقة'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-500 font-medium">{inv.client}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                <div className="text-center md:text-right">
                                                    <div className="text-xs text-slate-400 mb-1">تاريخ الاستحقاق</div>
                                                    <div className="font-bold text-navy">{inv.dueDate}</div>
                                                </div>
                                                <div className="text-center md:text-right">
                                                    <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                    <div className="font-bold text-xl text-navy">{formatCurrency(inv.amount)}</div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                                                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'expenses' && (
                                <div className="space-y-4">
                                    {expenses.map((exp, i) => (
                                        <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <Receipt className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-navy text-lg mb-1">{exp.title}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Badge variant="outline" className="bg-slate-50 border-slate-200 font-normal">{exp.category}</Badge>
                                                        <span>•</span>
                                                        <span>{exp.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="font-bold text-xl text-navy">{formatCurrency(exp.amount)}</div>
                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                                                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Quick Actions */}
                        <Card className="border-0 shadow-sm rounded-[32px] bg-gradient-to-br from-navy to-slate-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl"></div>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">إجراءات سريعة</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3 relative z-10">
                                <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-0 text-white rounded-2xl">
                                    <FileText className="w-6 h-6 text-brand-blue" />
                                    <span>إنشاء فاتورة</span>
                                </Button>
                                <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-0 text-white rounded-2xl">
                                    <Receipt className="w-6 h-6 text-emerald-400" />
                                    <span>تسجيل مصروف</span>
                                </Button>
                                <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-0 text-white rounded-2xl">
                                    <CreditCard className="w-6 h-6 text-purple-400" />
                                    <span>سداد مستحقات</span>
                                </Button>
                                <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-0 text-white rounded-2xl">
                                    <ArrowLeftRight className="w-6 h-6 text-amber-400" />
                                    <span>تحويل رصيد</span>
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
        </div>
    )
}
