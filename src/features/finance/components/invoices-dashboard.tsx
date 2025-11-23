import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    FileText, AlertCircle, CheckCircle, Bell, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { useInvoices, useOverdueInvoices } from '@/hooks/useFinance'

export default function InvoicesDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}
        if (activeTab !== 'all') {
            f.status = activeTab
        }
        return f
    }, [activeTab])

    // Fetch data
    const { data: invoicesData, isLoading, isError, error, refetch } = useInvoices(filters)
    const { data: overdueData } = useOverdueInvoices()

    // Transform API data to component format
    const invoices = useMemo(() => {
        if (!invoicesData?.invoices) return []
        return invoicesData.invoices.map((inv: any) => ({
            id: inv.invoiceNumber || inv._id,
            client: inv.clientId?.name || inv.clientId?.firstName + ' ' + inv.clientId?.lastName || 'عميل غير محدد',
            amount: inv.totalAmount || 0,
            date: new Date(inv.issueDate).toLocaleDateString('ar-SA'),
            status: inv.status,
            dueDate: new Date(inv.dueDate).toLocaleDateString('ar-SA'),
            _id: inv._id,
        }))
    }, [invoicesData])

    // Filter Logic (client-side search)
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            if (searchQuery && !inv.client.includes(searchQuery) && !inv.id.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [invoices, searchQuery])

    // Calculate statistics
    const stats = useMemo(() => {
        if (!invoicesData?.invoices) return { totalPending: 0, totalOverdue: 0, totalPaidThisMonth: 0 }

        const allInvoices = invoicesData.invoices
        const totalPending = allInvoices
            .filter((inv: any) => inv.status === 'pending' || inv.status === 'sent')
            .reduce((sum: number, inv: any) => sum + (inv.balanceDue || inv.totalAmount || 0), 0)

        const totalOverdue = overdueData
            ? overdueData.reduce((sum: number, inv: any) => sum + (inv.balanceDue || inv.totalAmount || 0), 0)
            : 0

        const thisMonth = new Date()
        const totalPaidThisMonth = allInvoices
            .filter((inv: any) => {
                if (inv.status !== 'paid' || !inv.paidDate) return false
                const paidDate = new Date(inv.paidDate)
                return paidDate.getMonth() === thisMonth.getMonth() && paidDate.getFullYear() === thisMonth.getFullYear()
            })
            .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0)

        return { totalPending, totalOverdue, totalPaidThisMonth }
    }, [invoicesData, overdueData])

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
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
                            <Skeleton className="h-32 w-full rounded-3xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Skeleton className="h-32 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
                            <Skeleton className="h-32 w-full rounded-2xl" />
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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل الفواتير</h3>
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
    if (filteredInvoices.length === 0 && !searchQuery && activeTab === 'all') {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-brand-blue" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد فواتير بعد</h3>
                        <p className="text-slate-500 mb-6">ابدأ بإنشاء أول فاتورة لعملائك</p>
                        <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                            <Link to="/dashboard/finance/invoices/new">
                                <Plus className="ml-2 h-4 w-4" />
                                إنشاء فاتورة جديدة
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
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                        <FileText className="w-3 h-3 ml-2" />
                                        الفواتير
                                    </Badge>
                                    <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    إدارة الفواتير
                                </h1>
                                <p className="text-blue-200/80">متابعة الفواتير المستحقة، المدفوعة، والمتأخرة</p>
                            </div>
                            <div className="flex gap-3">
                                <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                    <Link to="/dashboard/finance/invoices/new">
                                        <Plus className="w-4 h-4 ml-2" />
                                        فاتورة جديدة
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Invoices List */}
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
                                            value="pending"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            معلقة
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="paid"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            مدفوعة
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
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="بحث في الفواتير..."
                                            className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* List Items */}
                            <div className="space-y-4">
                                {filteredInvoices.length === 0 ? (
                                    <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                        <p className="text-slate-500 mb-4">لم نجد فواتير تطابق البحث أو الفلاتر المحددة</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchQuery('')
                                                setActiveTab('all')
                                            }}
                                            className="border-slate-200 hover:bg-slate-50"
                                        >
                                            مسح الفلاتر
                                        </Button>
                                    </div>
                                ) : filteredInvoices.map((inv) => (
                                    <div key={inv.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
                                                <FileText className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-navy text-lg">{inv.id}</h4>
                                                    <Badge className={`
                                                        ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                            inv.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                                                            inv.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                                                            inv.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                                                            inv.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-amber-100 text-amber-700'}
                                                        border-0 px-2 py-0.5
                                                    `}>
                                                        {inv.status === 'paid' ? 'مدفوعة' :
                                                         inv.status === 'overdue' ? 'متأخرة' :
                                                         inv.status === 'cancelled' ? 'ملغاة' :
                                                         inv.status === 'draft' ? 'مسودة' :
                                                         inv.status === 'partial' ? 'مدفوعة جزئياً' :
                                                         inv.status === 'sent' ? 'مرسلة' : 'معلقة'}
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                                                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/dashboard/finance/invoices/$invoiceId" params={{ invoiceId: inv._id }}>
                                                            عرض الفاتورة
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>تحميل PDF</DropdownMenuItem>
                                                    <DropdownMenuItem>إرسال تذكير</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar - Summary */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <Badge className="bg-blue-100 text-brand-blue hover:bg-blue-200 border-0">نشطة</Badge>
                                        </div>
                                        <div className="text-2xl font-bold text-navy">{formatCurrency(stats.totalPending)}</div>
                                        <div className="text-sm text-slate-500">إجمالي الفواتير المستحقة</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-200 border-0">متأخرة</Badge>
                                        </div>
                                        <div className="text-2xl font-bold text-navy">{formatCurrency(stats.totalOverdue)}</div>
                                        <div className="text-sm text-slate-500">فواتير متأخرة السداد</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-0">هذا الشهر</Badge>
                                        </div>
                                        <div className="text-2xl font-bold text-navy">{formatCurrency(stats.totalPaidThisMonth)}</div>
                                        <div className="text-sm text-slate-500">تم تحصيلها مؤخراً</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </div>
                </div>
            </Main>
        </>
    )
}
