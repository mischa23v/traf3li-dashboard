import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    FileText, AlertCircle, CheckCircle, Bell, Loader2,
    Calendar, ChevronLeft, ChevronRight, Download, X, Clock,
    Send, XCircle, ArrowRightLeft
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
import { useQuotes, useQuotesSummary } from '@/hooks/useQuotes'
import { useClients } from '@/hooks/useCasesAndClients'
import type { QuoteStatus } from '@/services/quoteService'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { ROUTES } from '@/constants/routes'

const statusConfig: Record<QuoteStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    draft: { label: 'مسودة', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: FileText },
    pending: { label: 'قيد المراجعة', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
    sent: { label: 'مرسل', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Send },
    accepted: { label: 'مقبول', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
    declined: { label: 'مرفوض', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
    cancelled: { label: 'ملغي', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: XCircle },
    on_hold: { label: 'معلق', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertCircle },
    expired: { label: 'منتهي', color: 'text-rose-700', bgColor: 'bg-rose-100', icon: AlertCircle },
}

export default function QuotesDashboard() {
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

    // Fetch data
    const { data: quotesData, isLoading, isError, error, refetch } = useQuotes(filters)
    const { data: summaryData } = useQuotesSummary()

    // Transform API data to component format
    const quotes = useMemo(() => {
        if (!quotesData?.quotes) return []
        return quotesData.quotes.map((quote: any) => ({
            id: quote.quoteNumber || quote._id,
            client: typeof quote.clientId === 'object'
                ? `${quote.clientId.firstName || ''} ${quote.clientId.lastName || ''}`.trim() || quote.clientId.name
                : 'عميل غير محدد',
            amount: quote.totalAmount || 0,
            currency: quote.currency || 'SAR',
            date: new Date(quote.issueDate).toLocaleDateString('ar-SA'),
            expiryDate: quote.expiredDate ? new Date(quote.expiredDate).toLocaleDateString('ar-SA') : null,
            status: quote.status as QuoteStatus,
            convertedToInvoice: quote.convertedToInvoice || false,
            _id: quote._id,
        }))
    }, [quotesData])

    // Filter Logic (client-side search)
    const filteredQuotes = useMemo(() => {
        return quotes.filter(quote => {
            if (searchQuery && !quote.client.includes(searchQuery) && !quote.id.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [quotes, searchQuery])

    // Calculate statistics
    const stats = useMemo(() => {
        if (summaryData) {
            return {
                totalPending: summaryData.totalPending || 0,
                totalAccepted: summaryData.totalAccepted || 0,
                totalDeclined: summaryData.totalDeclined || 0,
                totalThisMonth: summaryData.totalThisMonth || 0,
            }
        }

        if (!quotesData?.quotes) return { totalPending: 0, totalAccepted: 0, totalDeclined: 0, totalThisMonth: 0 }

        const allQuotes = quotesData.quotes
        const totalPending = allQuotes
            .filter((q: any) => q.status === 'pending' || q.status === 'sent')
            .reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0)

        const totalAccepted = allQuotes
            .filter((q: any) => q.status === 'accepted')
            .reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0)

        const totalDeclined = allQuotes
            .filter((q: any) => q.status === 'declined')
            .reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0)

        const thisMonth = new Date()
        const totalThisMonth = allQuotes
            .filter((q: any) => {
                const issueDate = new Date(q.issueDate)
                return issueDate.getMonth() === thisMonth.getMonth() && issueDate.getFullYear() === thisMonth.getFullYear()
            })
            .reduce((sum: number, q: any) => sum + (q.totalAmount || 0), 0)

        return { totalPending, totalAccepted, totalDeclined, totalThisMonth }
    }, [quotesData, summaryData])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.finance.overview, isActive: false },
        { title: 'الفواتير', href: ROUTES.dashboard.finance.invoices.list, isActive: false },
        { title: 'عروض الأسعار', href: ROUTES.dashboard.finance.quotes.list, isActive: true },
        { title: 'المدفوعات', href: ROUTES.dashboard.finance.payments.list, isActive: false },
        { title: 'المصروفات', href: ROUTES.dashboard.finance.expenses.list, isActive: false },
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
                            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Section - New Design */}
                    <ProductivityHero
                        badge="عروض الأسعار"
                        title="إدارة عروض الأسعار"
                        type="quotes"
                    >
                        <div className="flex gap-3">
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                                <Link to={ROUTES.dashboard.finance.quotes.new}>
                                    <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                                    عرض سعر جديد
                                </Link>
                            </Button>
                            <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20 h-10 px-5 rounded-xl font-bold border-0 backdrop-blur-sm">
                                <Download className="ms-2 h-4 w-4" aria-hidden="true" />
                                تصدير التقرير
                            </Button>
                        </div>
                    </ProductivityHero>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Quotes List */}
                        <div className="lg:col-span-2 space-y-6">
                            {isError ? (
                                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل عروض الأسعار</h3>
                                    <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                                        <Loader2 className="ms-2 h-4 w-4" aria-hidden="true" />
                                        إعادة المحاولة
                                    </Button>
                                </div>
                            ) : filteredQuotes.length === 0 && !searchQuery && activeTab === 'all' ? (
                                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-brand-blue" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد عروض أسعار بعد</h3>
                                    <p className="text-slate-500 mb-6">ابدأ بإنشاء أول عرض سعر لعملائك</p>
                                    <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                                        <Link to={ROUTES.dashboard.finance.quotes.new}>
                                            <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                                            إنشاء عرض سعر جديد
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
                                                        قيد المراجعة
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="accepted"
                                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                                    >
                                                        مقبولة
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="declined"
                                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all duration-300"
                                                    >
                                                        مرفوضة
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>

                                            <div className="flex items-center gap-3">
                                                <div className="relative w-full max-w-xs">
                                                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                                    <Input
                                                        placeholder="بحث في عروض الأسعار..."
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
                                        {filteredQuotes.length === 0 ? (
                                            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Search className="h-8 w-8 text-slate-600" aria-hidden="true" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                                <p className="text-slate-500 mb-4">لم نجد عروض أسعار تطابق البحث أو الفلاتر المحددة</p>
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
                                        ) : filteredQuotes.map((quote) => {
                                            const status = statusConfig[quote.status] || statusConfig.draft
                                            const StatusIcon = status.icon
                                            return (
                                                <div key={quote.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
                                                            <FileText className="w-7 h-7" aria-hidden="true" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-navy text-lg">{quote.id}</h4>
                                                                <Badge className={`${status.bgColor} ${status.color} border-0 px-2 py-0.5`}>
                                                                    <StatusIcon className="w-3 h-3 ms-1" aria-hidden="true" />
                                                                    {status.label}
                                                                </Badge>
                                                                {quote.convertedToInvoice && (
                                                                    <Badge className="bg-emerald-50 text-emerald-600 border-0 px-2 py-0.5">
                                                                        <ArrowRightLeft className="w-3 h-3 ms-1" />
                                                                        تم التحويل
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-slate-500 font-medium">{quote.client}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                        <div className="text-center md:text-end">
                                                            <div className="text-xs text-slate-600 mb-1">تاريخ الإصدار</div>
                                                            <div className="font-bold text-navy">{quote.date}</div>
                                                        </div>
                                                        {quote.expiryDate && (
                                                            <div className="text-center md:text-end">
                                                                <div className="text-xs text-slate-600 mb-1">تاريخ الانتهاء</div>
                                                                <div className="font-medium text-slate-700">{quote.expiryDate}</div>
                                                            </div>
                                                        )}
                                                        <div className="text-center md:text-end">
                                                            <div className="text-xs text-slate-600 mb-1">المبلغ</div>
                                                            <div className="font-bold text-xl text-navy">{formatCurrency(quote.amount)}</div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50" aria-label="خيارات">
                                                                <MoreHorizontal className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link to={ROUTES.dashboard.finance.quotes.detail(quote._id )}>
                                                                        عرض التفاصيل
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>تحميل PDF</DropdownMenuItem>
                                                                <DropdownMenuItem>إرسال للعميل</DropdownMenuItem>
                                                                {!quote.convertedToInvoice && quote.status === 'accepted' && (
                                                                    <DropdownMenuItem>تحويل إلى فاتورة</DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    {filteredQuotes.length > 0 && (
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
                                                <span className="text-sm text-slate-500">من {quotesData?.total || filteredQuotes.length} عرض سعر</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="rounded-lg h-9 w-9"
                                                >
                                                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                                </Button>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, Math.ceil((quotesData?.total || filteredQuotes.length) / itemsPerPage)) }, (_, i) => i + 1).map((page) => (
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
                                                    disabled={currentPage >= Math.ceil((quotesData?.total || filteredQuotes.length) / itemsPerPage)}
                                                    className="rounded-lg h-9 w-9"
                                                >
                                                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Sidebar */}
                        <FinanceSidebar context="quotes" />

                    </div>
                </div>
            </Main>
        </>
    )
}
