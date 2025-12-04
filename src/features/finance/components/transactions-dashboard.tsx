import { useState, useMemo } from 'react'
import {
    Search, Plus, MoreHorizontal,
    ArrowUpRight, ArrowDownRight, AlertCircle, Bell,
    ChevronLeft, ChevronRight, X, Eye, Trash2,
    FileText, Building, Car, TrendingUp, Wallet
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
import { useTransactions, useDeleteTransaction } from '@/hooks/useFinance'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

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
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<string>('date')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Mutations
    const deleteTransactionMutation = useDeleteTransaction()

    // API Filters
    const filters = useMemo(() => {
        const f: any = { page: currentPage, limit: itemsPerPage }

        // Type filter
        if (activeTab === 'income') {
            f.type = 'credit'
        } else if (activeTab === 'expense') {
            f.type = 'debit'
        }

        // Sort
        f.sortBy = sortBy
        f.sortOrder = 'desc'

        return f
    }, [activeTab, sortBy, currentPage, itemsPerPage])

    // Check if any filter is active
    const hasActiveFilters = searchQuery.length > 0

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setCurrentPage(1)
    }

    // Fetch data
    const { data: transactionsData, isLoading, isError, error, refetch } = useTransactions(filters)

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
    const transactions = useMemo(() => {
        if (!transactionsData?.data) return []

        return transactionsData.data.map((txn: any) => ({
            id: txn._id,
            description: txn.description || 'معاملة غير محددة',
            category: txn.category || 'عام',
            type: txn.type === 'credit' ? 'income' : 'expense',
            amount: txn.amount || 0,
            date: txn.date,
            dateFormatted: formatDualDate(txn.date),
            reference: txn.invoiceId?._id || txn.expenseId?._id || txn.reference || '-',
            paymentMethod: txn.paymentMethod || 'غير محدد',
            status: txn.status === 'completed' ? 'مكتمل' : txn.status === 'pending' ? 'معلق' : txn.status,
            icon: getCategoryIcon(txn.category, txn.type),
            _id: txn._id,
        }))
    }, [transactionsData])

    // Filter Logic (client-side search)
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            if (searchQuery && !txn.description.includes(searchQuery) && !txn.reference.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [transactions, searchQuery])

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
        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} معاملة؟`)) {
            selectedIds.forEach(id => deleteTransactionMutation.mutate(id))
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single transaction actions
    const handleViewTransaction = (id: string) => {
        navigate({ to: '/dashboard/finance/transactions/$transactionId', params: { transactionId: id } })
    }

    const handleDeleteTransaction = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
            deleteTransactionMutation.mutate(id)
        }
    }

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
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: true },
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
                <ProductivityHero badge="إدارة المالية" title="المعاملات" type="transactions" />

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
                                            placeholder="بحث في المعاملات..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Type Filter */}
                                    <Select value={activeTab} onValueChange={setActiveTab}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="income">دخل</SelectItem>
                                            <SelectItem value="expense">مصروف</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date">التاريخ</SelectItem>
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

                        {/* MAIN TRANSACTIONS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {activeTab === 'all' ? 'جميع المعاملات' :
                                        activeTab === 'income' ? 'معاملات الدخل' :
                                            activeTab === 'expense' ? 'معاملات المصروفات' : 'المعاملات'}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {filteredTransactions.length} معاملة
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المعاملات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && filteredTransactions.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Wallet className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد معاملات</h3>
                                        <p className="text-slate-500 mb-4">ستظهر جميع المعاملات المالية هنا</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/finance/transactions/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                معاملة جديدة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Transactions List */}
                                {!isLoading && !isError && filteredTransactions.map((txn) => {
                                    const isIncome = txn.type === 'income'
                                    const Icon = txn.icon || (isIncome ? ArrowUpRight : ArrowDownRight)
                                    return (
                                        <div key={txn.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(txn.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    {isSelectionMode && (
                                                        <Checkbox
                                                            checked={selectedIds.includes(txn.id)}
                                                            onCheckedChange={() => handleSelectItem(txn.id)}
                                                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                    )}
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-navy text-lg">{txn.description}</h4>
                                                            <Badge className={`${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} border-0 rounded-md px-2`}>
                                                                {isIncome ? 'دخل' : 'مصروف'}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-500 text-sm">{txn.category} • {txn.reference}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleViewTransaction(txn.id)}>
                                                            <Eye className="h-4 w-4 ml-2" />
                                                            عرض التفاصيل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteTransaction(txn.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 ml-2" />
                                                            حذف المعاملة
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-4">
                                                    {/* Amount */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                        <div className={`font-bold text-lg ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                                                        </div>
                                                    </div>
                                                    {/* Date - Dual Language */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">التاريخ</div>
                                                        <div className="font-bold text-navy text-sm">{txn.dateFormatted.arabic}</div>
                                                        <div className="text-xs text-slate-400">{txn.dateFormatted.english}</div>
                                                    </div>
                                                    {/* Payment Method */}
                                                    <div className="text-center hidden sm:block">
                                                        <div className="text-xs text-slate-400 mb-1">طريقة الدفع</div>
                                                        <div className="font-bold text-slate-600 text-sm">{txn.paymentMethod}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleViewTransaction(txn.id)}
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
                            {filteredTransactions.length > 0 && (
                                <div className="p-4 pt-0 flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        عرض {filteredTransactions.length} من {transactionsData?.pagination?.total || filteredTransactions.length} معاملة
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
                                            disabled={currentPage >= Math.ceil((transactionsData?.pagination?.total || filteredTransactions.length) / itemsPerPage)}
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
                        context="transactions"
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
