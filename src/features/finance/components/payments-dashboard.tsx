import { useState, useMemo } from 'react'
import {
    Search, Plus, MoreHorizontal,
    CreditCard, AlertCircle, CheckCircle, Bell, Loader2,
    Clock, Receipt, ChevronLeft, ChevronRight, X, Eye, Edit3, Trash2, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { usePayments, useDeletePayment } from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function PaymentsDashboard() {
    const navigate = useNavigate()
    const [activeStatusTab, setActiveStatusTab] = useState('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [clientFilter, setClientFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('paymentDate')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Fetch clients for filter dropdowns
    const { data: clientsData } = useClients()

    // Mutations
    const deletePaymentMutation = useDeletePayment()

    // API Filters
    const filters = useMemo(() => {
        const f: any = { page: currentPage, limit: itemsPerPage }

        // Status filter
        if (activeStatusTab !== 'all') {
            f.status = activeStatusTab
        }

        // Client
        if (clientFilter !== 'all') {
            f.clientId = clientFilter
        }

        // Sort
        f.sortBy = sortBy
        f.sortOrder = 'desc'

        return f
    }, [activeStatusTab, clientFilter, sortBy, currentPage, itemsPerPage])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || clientFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setClientFilter('all')
        setCurrentPage(1)
    }

    // Fetch data
    const { data: paymentsData, isLoading, isError, error, refetch } = usePayments(filters)

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy')
        }
    }

    // Transform API data
    const payments = useMemo(() => {
        if (!paymentsData?.data) return []

        return paymentsData.data.map((payment: any) => ({
            id: payment._id,
            invoiceNumber: payment.invoiceId?.invoiceNumber || '-',
            client: payment.invoiceId?.clientId?.name || 'عميل غير محدد',
            amount: payment.amount || 0,
            paymentDate: payment.paymentDate,
            paymentDateFormatted: formatDualDate(payment.paymentDate),
            method: payment.paymentMethod || 'غير محدد',
            status: payment.status || 'pending',
            reference: payment.reference || '-',
            _id: payment._id,
        }))
    }, [paymentsData])

    // Filter Logic (client-side search)
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            if (searchQuery && !payment.client.includes(searchQuery) && !payment.invoiceNumber.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [payments, searchQuery])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectItem = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return
        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} دفعة؟`)) {
            selectedIds.forEach(id => deletePaymentMutation.mutate(id))
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single payment actions
    const handleViewPayment = (id: string) => {
        navigate({ to: '/dashboard/finance/payments/$paymentId', params: { paymentId: id } })
    }

    const handleDeletePayment = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
            deletePaymentMutation.mutate(id)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return { label: 'مكتمل', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle }
            case 'failed':
                return { label: 'فشل', bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle }
            case 'refunded':
                return { label: 'مسترد', bg: 'bg-purple-100', text: 'text-purple-700', icon: Receipt }
            default:
                return { label: 'معلق', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock }
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
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

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="إدارة المالية" title="المدفوعات" type="payments" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="بحث في المدفوعات..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={activeStatusTab} onValueChange={setActiveStatusTab}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="completed">مكتملة</SelectItem>
                                            <SelectItem value="pending">معلقة</SelectItem>
                                            <SelectItem value="refunded">مستردة</SelectItem>
                                            <SelectItem value="failed">فاشلة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Client Filter */}
                                    <Select value={clientFilter} onValueChange={setClientFilter}>
                                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="العميل" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل العملاء</SelectItem>
                                            {clientsData?.data?.map((client: any) => (
                                                <SelectItem key={client._id} value={client._id}>
                                                    {client.fullName || client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paymentDate">تاريخ الدفع</SelectItem>
                                            <SelectItem value="amount">المبلغ</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Filters Button */}
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="h-4 w-4 ml-2" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN PAYMENTS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {activeStatusTab === 'all' ? 'جميع المدفوعات' :
                                        activeStatusTab === 'completed' ? 'المدفوعات المكتملة' :
                                            activeStatusTab === 'pending' ? 'المدفوعات المعلقة' :
                                                activeStatusTab === 'refunded' ? 'المدفوعات المستردة' : 'المدفوعات'}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {filteredPayments.length} دفعة
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المدفوعات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && filteredPayments.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <CreditCard className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد مدفوعات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بتسجيل دفعة جديدة</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/finance/payments/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                دفعة جديدة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Payments List */}
                                {!isLoading && !isError && filteredPayments.map((payment) => {
                                    const statusConfig = getStatusConfig(payment.status)
                                    const StatusIcon = statusConfig.icon
                                    return (
                                        <div key={payment.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(payment.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    {isSelectionMode && (
                                                        <Checkbox
                                                            checked={selectedIds.includes(payment.id)}
                                                            onCheckedChange={() => handleSelectItem(payment.id)}
                                                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                    )}
                                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                        <CreditCard className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-navy text-lg">{payment.client}</h4>
                                                            <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 rounded-md px-2`}>
                                                                <StatusIcon className="w-3 h-3 ml-1" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-500 text-sm">فاتورة: {payment.invoiceNumber}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleViewPayment(payment.id)}>
                                                            <Eye className="h-4 w-4 ml-2" />
                                                            عرض التفاصيل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 ml-2" />
                                                            تحميل الإيصال
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeletePayment(payment.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 ml-2" />
                                                            حذف الدفعة
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-4">
                                                    {/* Amount */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                        <div className="font-bold text-emerald-600 text-lg">{formatCurrency(payment.amount)}</div>
                                                    </div>
                                                    {/* Payment Date - Dual Language */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">تاريخ الدفع</div>
                                                        <div className="font-bold text-navy text-sm">{payment.paymentDateFormatted.arabic}</div>
                                                        <div className="text-xs text-slate-400">{payment.paymentDateFormatted.english}</div>
                                                    </div>
                                                    {/* Payment Method */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">طريقة الدفع</div>
                                                        <div className="font-bold text-slate-600 text-sm">{payment.method}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleViewPayment(payment.id)}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20"
                                                >
                                                    عرض التفاصيل
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Pagination */}
                            {filteredPayments.length > 0 && (
                                <div className="p-4 pt-0 flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        عرض {filteredPayments.length} من {paymentsData?.pagination?.total || filteredPayments.length} دفعة
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="rounded-lg h-9 w-9"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm text-slate-600 px-2">{currentPage}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            disabled={currentPage >= Math.ceil((paymentsData?.pagination?.total || filteredPayments.length) / itemsPerPage)}
                                            className="rounded-lg h-9 w-9"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <FinanceSidebar
                        context="payments"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
