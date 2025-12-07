import { useState } from 'react'
import {
    FileText, Search, Filter, Download, Plus, MoreHorizontal,
    Calendar, Eye, CheckCircle, Clock, AlertCircle, Briefcase,
    TrendingUp, ArrowUpRight, ArrowDownRight, Bell
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

export default function InvoiceDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Mock Data
    const invoices = [
        {
            id: 'INV-2025-001',
            clientName: 'مشاري بن ناهد الرابح',
            clientCompany: 'المصنع السعودي للمنتجات المعدنية',
            amount: 45000,
            status: 'معلقة',
            issueDate: '15 نوفمبر 2025',
            dueDate: '15 ديسمبر 2025',
            daysUntilDue: 28,
            services: ['استشارة قانونية', 'صياغة عقود'],
            statusColor: 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        },
        {
            id: 'INV-2025-002',
            clientName: 'عبدالله بن سعد الغامدي',
            clientCompany: 'شركة البناء الحديثة',
            amount: 38000,
            status: 'مدفوعة',
            issueDate: '10 نوفمبر 2025',
            dueDate: '10 ديسمبر 2025',
            services: ['تمثيل قانوني', 'مرافعة'],
            statusColor: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        },
        {
            id: 'INV-2025-003',
            clientName: 'فاطمة بنت محمد العتيبي',
            clientCompany: 'مستشفى النور الطبي',
            amount: 52000,
            status: 'مدفوعة',
            issueDate: '08 نوفمبر 2025',
            dueDate: '08 ديسمبر 2025',
            services: ['استشارة', 'تسوية ودية'],
            statusColor: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        },
        {
            id: 'INV-2025-004',
            clientName: 'خالد بن عبدالرحمن القحطاني',
            clientCompany: 'شركة التقنية المتقدمة',
            amount: 65000,
            status: 'معلقة',
            issueDate: '05 نوفمبر 2025',
            dueDate: '05 ديسمبر 2025',
            daysUntilDue: 3,
            services: ['تمثيل قانوني', 'استئناف'],
            statusColor: 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        },
        {
            id: 'INV-2025-005',
            clientName: 'سارة بنت أحمد المطيري',
            clientCompany: 'المجموعة التجارية الكبرى',
            amount: 28000,
            status: 'متأخرة',
            issueDate: '01 نوفمبر 2025',
            dueDate: '01 ديسمبر 2025',
            daysOverdue: 7,
            services: ['استشارة قانونية'],
            statusColor: 'bg-red-100 text-red-700 hover:bg-red-200'
        }
    ]

    // Filter Logic
    const filteredInvoices = invoices.filter(inv => {
        if (activeTab !== 'all' && activeTab !== 'overdue' && inv.status !== (activeTab === 'paid' ? 'مدفوعة' : 'معلقة')) return false
        if (activeTab === 'overdue' && inv.status !== 'متأخرة') return false
        if (searchQuery && !inv.clientName.includes(searchQuery) && !inv.id.includes(searchQuery)) return false
        return true
    })

    // Calculate statistics
    const totalInvoices = invoices.length
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const paidRevenue = invoices.filter(inv => inv.status === 'مدفوعة').reduce((sum, inv) => sum + inv.amount, 0)
    const pendingRevenue = invoices.filter(inv => inv.status === 'معلقة').reduce((sum, inv) => sum + inv.amount, 0)
    const overdueRevenue = invoices.filter(inv => inv.status === 'متأخرة').reduce((sum, inv) => sum + inv.amount, 0)

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
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
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
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
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
                                            <FileText className="w-3 h-3 ms-2" aria-hidden="true" />
                                            المالية
                                        </Badge>
                                        <span className="text-blue-200 text-sm">السنة المالية 2025</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                        الفواتير
                                    </h1>
                                    <p className="text-blue-200/80">إدارة الفواتير ومتابعة التحصيل المالي</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                        <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                        تصدير التقرير
                                    </Button>
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl">
                                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                        فاتورة جديدة
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-200">إجمالي الإيرادات</span>
                                        <span className="font-bold text-emerald-400">+12.5%</span>
                                    </div>
                                    <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                                    <Progress value={65} className="h-1.5 bg-white/10" indicatorClassName="bg-emerald-500" />
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pe-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">عدد الفواتير</div>
                                        <div className="text-2xl font-bold">{totalInvoices} فاتورة</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-200" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pe-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">نسبة التحصيل</div>
                                        <div className="text-2xl font-bold text-emerald-400">{Math.round((paidRevenue / totalRevenue) * 100)}%</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Remaining Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Paid Revenue */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                        مدفوع
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">المبالغ المحصلة</h3>
                                    <div className="text-2xl font-bold text-navy">{formatCurrency(paidRevenue)}</div>
                                </div>
                                <Progress value={(paidRevenue / totalRevenue) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-emerald-500" />
                            </CardContent>
                        </Card>

                        {/* Pending Revenue */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Clock className="w-6 h-6 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">
                                        معلق
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">قيد الانتظار</h3>
                                    <div className="text-2xl font-bold text-navy">{formatCurrency(pendingRevenue)}</div>
                                </div>
                                <Progress value={(pendingRevenue / totalRevenue) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-amber-500" />
                            </CardContent>
                        </Card>

                        {/* Overdue Revenue */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <AlertCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
                                    </div>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100">
                                        متأخر
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-sm">المبالغ المتأخرة</h3>
                                    <div className="text-2xl font-bold text-navy">{formatCurrency(overdueRevenue)}</div>
                                </div>
                                <Progress value={(overdueRevenue / totalRevenue) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-red-500" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Invoice List */}
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
                                            value="paid"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            مدفوعة
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="pending"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            معلقة
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="overdue"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            متأخرة
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-3 flex-1 justify-end">
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                                        <Input
                                            placeholder="بحث برقم الفاتورة أو العميل..."
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

                            {/* Invoices List - NEW CARD DESIGN */}
                            <div className="space-y-4">
                                {filteredInvoices.map((invoice) => (
                                    <div key={invoice.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${invoice.status === 'مدفوعة' ? 'bg-emerald-50 text-emerald-600' :
                                                    invoice.status === 'معلقة' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-red-50 text-red-600'
                                                    }`}>
                                                    <FileText className="h-6 w-6" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{invoice.id}</h4>
                                                        <Badge className={`${invoice.statusColor} border-0 px-2 rounded-md`}>
                                                            {invoice.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{invoice.clientName}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>تعديل الفاتورة</DropdownMenuItem>
                                                    <DropdownMenuItem>إرسال تذكير</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                    <div className="font-bold text-navy text-lg">{formatCurrency(invoice.amount)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">التاريخ</div>
                                                    <div className="font-bold text-navy">{invoice.issueDate}</div>
                                                </div>
                                            </div>
                                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                عرض التفاصيل
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar - Analytics & Top Clients */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Top Clients Card */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-brand-blue" />
                                        أكبر العملاء
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {Object.entries(
                                        invoices.reduce((acc: any, inv) => {
                                            if (!acc[inv.clientName]) {
                                                acc[inv.clientName] = { total: 0, count: 0 };
                                            }
                                            acc[inv.clientName].total += inv.amount;
                                            acc[inv.clientName].count += 1;
                                            return acc;
                                        }, {})
                                    )
                                        .sort((a: any, b: any) => b[1].total - a[1].total)
                                        .slice(0, 4)
                                        .map(([name, data]: any, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-navy text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-navy text-sm truncate">{name}</div>
                                                    <div className="text-xs text-slate-500">{data.count} فواتير</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-navy text-sm">{formatCurrency(data.total)}</div>
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 ms-auto">
                                                        <div
                                                            className="h-full bg-brand-blue rounded-full"
                                                            style={{ width: `${(data.total / totalRevenue) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </CardContent>
                            </Card>

                            {/* Recent Activity / Timeline */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-amber-500" aria-hidden="true" />
                                        استحقاقات قريبة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {invoices
                                        .filter(inv => inv.status !== 'مدفوعة')
                                        .sort((a, b) => (a.daysUntilDue || 999) - (b.daysUntilDue || 999))
                                        .slice(0, 3)
                                        .map((inv, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${inv.status === 'متأخرة' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`}></div>
                                                <div>
                                                    <div className="font-bold text-navy text-sm">{inv.clientName}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {inv.status === 'متأخرة' ? `متأخر ${inv.daysOverdue} يوم` : `يستحق خلال ${inv.daysUntilDue} يوم`}
                                                    </div>
                                                    <div className="text-xs font-bold text-navy mt-1">{formatCurrency(inv.amount)}</div>
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
