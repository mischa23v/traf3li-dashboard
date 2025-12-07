import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    FileText, AlertCircle, CheckCircle, Bell, Loader2,
    Calendar, ChevronLeft, ChevronRight, Download, X
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
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
import { useInvoices, useOverdueInvoices, useExportReport } from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

export default function InvoicesDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedClient, setSelectedClient] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Fetch clients for filter
    const { data: clientsData } = useClients()
    const { mutate: exportReport, isPending: isExporting } = useExportReport()

    // API Filters
    const filters = useMemo(() => {
        const f: any = { page: currentPage, limit: itemsPerPage }
        if (activeTab !== 'all') {
            f.status = activeTab
        }
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedClient && selectedClient !== 'all') f.clientId = selectedClient
        return f
    }, [activeTab, currentPage, itemsPerPage, startDate, endDate, selectedClient])

    // Active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0
        if (startDate) count++
        if (endDate) count++
        if (selectedClient && selectedClient !== 'all') count++
        return count
    }, [startDate, endDate, selectedClient])

    // Clear all filters
    const clearFilters = () => {
        setStartDate('')
        setEndDate('')
        setSelectedClient('')
        setCurrentPage(1)
    }

    // Handle export
    const handleExport = (format: 'csv' | 'pdf') => {
        exportReport({ reportType: 'invoices', format, filters })
    }

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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل الفواتير</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" aria-hidden="true" />
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

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
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

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="الفواتير" title="الفواتير" type="invoices" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Invoices List */}
                        <div className="lg:col-span-2 space-y-6">
                            {filteredInvoices.length === 0 && !searchQuery && activeTab === 'all' ? (
                                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-brand-blue" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد فواتير بعد</h3>
                                    <p className="text-slate-500 mb-6">ابدأ بإنشاء أول فاتورة لعملائك</p>
                                    <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                                        <Link to="/dashboard/finance/invoices/new">
                                            <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                                            إنشاء فاتورة جديدة
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Filters Bar */}
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full md:w-auto">
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

                                            <div className="flex items-center gap-3">
                                                <div className="relative w-full max-w-xs">
                                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                                    <Input
                                                        placeholder="بحث في الفواتير..."
                                                        className="pe-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                                <Popover open={showFilters} onOpenChange={setShowFilters}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="rounded-xl border-slate-200 relative">
                                                            <Filter className="w-4 h-4 ms-2" aria-hidden="true" />
                                                            تصفية متقدمة
                                                            {activeFilterCount > 0 && (
                                                                <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-brand-blue text-white text-xs">
                                                                    {activeFilterCount}
                                                                </Badge>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80" align="end">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-bold text-navy">تصفية متقدمة</h4>
                                                                {activeFilterCount > 0 && (
                                                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-red-500">
                                                                        <X className="w-4 h-4 ms-1" aria-hidden="true" />
                                                                        مسح
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">العميل</label>
                                                                <Select value={selectedClient} onValueChange={setSelectedClient}>
                                                                    <SelectTrigger className="rounded-xl">
                                                                        <SelectValue placeholder="جميع العملاء" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">جميع العملاء</SelectItem>
                                                                        {clientsData?.data?.map((client: any) => (
                                                                            <SelectItem key={client._id} value={client._id}>
                                                                                {client.fullName || client.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" aria-hidden="true" />
                                                                        من تاريخ
                                                                    </label>
                                                                    <Input
                                                                        type="date"
                                                                        value={startDate}
                                                                        onChange={(e) => setStartDate(e.target.value)}
                                                                        className="rounded-xl"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" aria-hidden="true" />
                                                                        إلى تاريخ
                                                                    </label>
                                                                    <Input
                                                                        type="date"
                                                                        value={endDate}
                                                                        onChange={(e) => setEndDate(e.target.value)}
                                                                        className="rounded-xl"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="pt-2 border-t border-slate-100 flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleExport('csv')}
                                                                    disabled={isExporting}
                                                                    className="flex-1 rounded-xl"
                                                                >
                                                                    <Download className="w-4 h-4 ms-1" aria-hidden="true" />
                                                                    CSV
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleExport('pdf')}
                                                                    disabled={isExporting}
                                                                    className="flex-1 rounded-xl"
                                                                >
                                                                    <Download className="w-4 h-4 ms-1" aria-hidden="true" />
                                                                    PDF
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        {/* Active Filters Display */}
                                        {activeFilterCount > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm text-slate-500">الفلاتر النشطة:</span>
                                                {selectedClient && selectedClient !== 'all' && (
                                                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 gap-1">
                                                        العميل
                                                        <X className="w-3 h-3 cursor-pointer" aria-label="إزالة" onClick={() => setSelectedClient('')} />
                                                    </Badge>
                                                )}
                                                {startDate && (
                                                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 gap-1">
                                                        من: {new Date(startDate).toLocaleDateString('ar-SA')}
                                                        <X className="w-3 h-3 cursor-pointer" aria-label="إزالة" onClick={() => setStartDate('')} />
                                                    </Badge>
                                                )}
                                                {endDate && (
                                                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 gap-1">
                                                        إلى: {new Date(endDate).toLocaleDateString('ar-SA')}
                                                        <X className="w-3 h-3 cursor-pointer" aria-label="إزالة" onClick={() => setEndDate('')} />
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* List Items */}
                                    <div className="space-y-4">
                                        {filteredInvoices.length === 0 ? (
                                            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="h-8 w-8 text-slate-600" aria-hidden="true" />
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
                                                        <FileText className="w-7 h-7" aria-hidden="true" />
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
                                                        <div className="text-xs text-slate-600 mb-1">تاريخ الاستحقاق</div>
                                                        <div className="font-bold text-navy">{inv.dueDate}</div>
                                                    </div>
                                                    <div className="text-center md:text-right">
                                                        <div className="text-xs text-slate-600 mb-1">المبلغ</div>
                                                        <div className="font-bold text-xl text-navy">{formatCurrency(inv.amount)}</div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50" aria-label="خيارات">
                                                                <MoreHorizontal className="w-5 h-5 text-slate-600" aria-hidden="true" />
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

                                    {/* Pagination */}
                                    {filteredInvoices.length > 0 && (
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-500">عرض</span>
                                                <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
                                                    <SelectTrigger className="w-[70px] h-9 rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="5">5</SelectItem>
                                                        <SelectItem value="10">10</SelectItem>
                                                        <SelectItem value="20">20</SelectItem>
                                                        <SelectItem value="50">50</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-sm text-slate-500">من {invoicesData?.total || filteredInvoices.length} فاتورة</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="rounded-lg h-9 w-9"
                                                    aria-label="الصفحة السابقة"
                                                >
                                                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                                </Button>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, Math.ceil((invoicesData?.total || filteredInvoices.length) / itemsPerPage)) }, (_, i) => i + 1).map((page) => (
                                                        <Button
                                                            key={page}
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="icon"
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`rounded-lg h-9 w-9 ${currentPage === page ? 'bg-brand-blue text-white' : ''}`}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setCurrentPage(p => p + 1)}
                                                    disabled={currentPage >= Math.ceil((invoicesData?.total || filteredInvoices.length) / itemsPerPage)}
                                                    className="rounded-lg h-9 w-9"
                                                    aria-label="الصفحة التالية"
                                                >
                                                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <FinanceSidebar context="invoices" />
                </div>
            </Main>
        </>
    )
}
