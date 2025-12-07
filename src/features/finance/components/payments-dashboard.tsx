import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    CreditCard, AlertCircle, CheckCircle, Bell, Loader2,
    Calendar, ChevronLeft, ChevronRight, Download, X, Clock, Receipt
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
import { usePayments, usePaymentsSummary, useExportReport } from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    pending: { label: 'معلق', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
    completed: { label: 'مكتمل', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
    failed: { label: 'فشل', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle },
    refunded: { label: 'مسترد', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Receipt },
}

export default function PaymentsDashboard() {
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
        exportReport({ reportType: 'payments', format, filters })
    }

    // Fetch data
    const { data: paymentsData, isLoading, isError, error, refetch } = usePayments(filters)
    const { data: summaryData } = usePaymentsSummary()

    // Transform API data to component format
    const payments = useMemo(() => {
        if (!paymentsData?.data) return []
        return paymentsData.data.map((payment: any) => ({
            id: payment._id,
            invoiceNumber: payment.invoiceId?.invoiceNumber || '-',
            clientName: payment.invoiceId?.clientId?.name || 'عميل غير معروف',
            amount: payment.amount,
            date: new Date(payment.paymentDate).toLocaleDateString('ar-SA'),
            method: payment.paymentMethod,
            status: payment.status,
            reference: payment.reference || '-',
            notes: payment.notes
        }))
    }, [paymentsData])

    // Filter Logic
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            if (activeTab === 'all') return true
            if (activeTab === 'completed') return payment.status === 'completed'
            if (activeTab === 'pending') return payment.status === 'pending'
            if (activeTab === 'failed') return payment.status === 'failed'
            if (searchQuery && !payment.clientName.includes(searchQuery) && !payment.invoiceNumber.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [payments, activeTab, searchQuery])

    // Calculate statistics
    const stats = useMemo(() => {
        if (summaryData) {
            return {
                totalCompleted: summaryData.totalCompleted || 0,
                totalPending: summaryData.totalPending || 0,
                totalRefunded: summaryData.totalRefunded || 0,
                totalThisMonth: summaryData.totalThisMonth || 0,
            }
        }

        if (!paymentsData?.data) return { totalCompleted: 0, totalPending: 0, totalRefunded: 0, totalThisMonth: 0 }

        const allPayments = paymentsData.data
        const totalCompleted = allPayments
            .filter((p: any) => p.status === 'completed')
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

        const totalPending = allPayments
            .filter((p: any) => p.status === 'pending')
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

        const totalRefunded = allPayments
            .filter((p: any) => p.status === 'refunded')
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

        const thisMonth = new Date()
        const totalThisMonth = allPayments
            .filter((p: any) => {
                if (p.status !== 'completed' || !p.paymentDate) return false
                const paymentDate = new Date(p.paymentDate)
                return paymentDate.getMonth() === thisMonth.getMonth() && paymentDate.getFullYear() === thisMonth.getFullYear()
            })
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

        return { totalCompleted, totalPending, totalRefunded, totalThisMonth }
    }, [paymentsData, summaryData])

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
        { title: 'عروض الأسعار', href: '/dashboard/finance/quotes', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل المدفوعات</h3>
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
                <ProductivityHero badge="المدفوعات" title="المدفوعات" type="payments" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Payments List */}
                        <div className="lg:col-span-2 space-y-6">
                            {filteredPayments.length === 0 && !searchQuery && activeTab === 'all' ? (
                                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد مدفوعات بعد</h3>
                                    <p className="text-slate-500 mb-6">ستظهر المدفوعات هنا عند تسجيل دفعات للفواتير</p>
                                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                                        <Link to="/dashboard/finance/invoices">
                                            <CreditCard className="ms-2 h-4 w-4" aria-hidden="true" />
                                            عرض الفواتير
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
                                                        value="completed"
                                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                                    >
                                                        مكتملة
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="pending"
                                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                                    >
                                                        معلقة
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="refunded"
                                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300"
                                                    >
                                                        مستردة
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>

                                            <div className="flex items-center gap-3">
                                                <div className="relative w-full max-w-xs">
                                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                                    <Input
                                                        placeholder="بحث في المدفوعات..."
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
                                                                <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-emerald-600 text-white text-xs">
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
                                        {filteredPayments.length === 0 ? (
                                            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="h-8 w-8 text-slate-600" aria-hidden="true" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                                <p className="text-slate-500 mb-4">لم نجد مدفوعات تطابق البحث أو الفلاتر المحددة</p>
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
                                        ) : filteredPayments.map((payment) => {
                                            const status = statusConfig[payment.status] || statusConfig.pending
                                            const StatusIcon = status.icon
                                            return (
                                                <div key={payment.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                            <CreditCard className="w-7 h-7" aria-hidden="true" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-navy text-lg">{payment.id}</h4>
                                                                <Badge className={`${status.bgColor} ${status.color} border-0 px-2 py-0.5`}>
                                                                    <StatusIcon className="w-3 h-3 ms-1" aria-hidden="true" />
                                                                    {status.label}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-slate-500 font-medium">{payment.clientName}</p>
                                                            {payment.invoiceNumber && (
                                                                <p className="text-xs text-slate-600">فاتورة: {payment.invoiceNumber}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                        <div className="text-center md:text-right">
                                                            <div className="text-xs text-slate-600 mb-1">تاريخ الدفع</div>
                                                            <div className="font-bold text-navy">{payment.date}</div>
                                                        </div>
                                                        <div className="text-center md:text-right">
                                                            <div className="text-xs text-slate-600 mb-1">طريقة الدفع</div>
                                                            <div className="font-medium text-slate-700">{payment.method}</div>
                                                        </div>
                                                        <div className="text-center md:text-right">
                                                            <div className="text-xs text-slate-600 mb-1">المبلغ</div>
                                                            <div className="font-bold text-xl text-emerald-600">{formatCurrency(payment.amount)}</div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50" aria-label="خيارات">
                                                                    <MoreHorizontal className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link to="/dashboard/finance/payments/$paymentId" params={{ paymentId: payment.id }}>
                                                                        عرض التفاصيل
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>تحميل الإيصال</DropdownMenuItem>
                                                                <DropdownMenuItem>إرسال بالبريد</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    {filteredPayments.length > 0 && (
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
                                                <span className="text-sm text-slate-500">من {paymentsData?.pagination?.total || filteredPayments.length} دفعة</span>
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
                                                    {Array.from({ length: Math.min(5, Math.ceil((paymentsData?.pagination?.total || filteredPayments.length) / itemsPerPage)) }, (_, i) => i + 1).map((page) => (
                                                        <Button
                                                            key={page}
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="icon"
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`rounded-lg h-9 w-9 ${currentPage === page ? 'bg-emerald-600 text-white' : ''}`}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ))}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setCurrentPage(p => p + 1)}
                                                    disabled={currentPage >= Math.ceil((paymentsData?.pagination?.total || filteredPayments.length) / itemsPerPage)}
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
                    <FinanceSidebar context="payments" />
                </div>
            </Main>
        </>
    )
}
