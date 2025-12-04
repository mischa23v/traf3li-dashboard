import { useState, useMemo } from 'react'
import {
    Search, Plus, MoreHorizontal,
    Receipt, AlertCircle, Bell,
    ChevronLeft, ChevronRight, X, Eye, Edit3, Trash2,
    Briefcase, Building, Car, Coffee, FileText, Gavel
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
import { useExpenses, useDeleteExpense } from '@/hooks/useFinance'
import { useCases } from '@/hooks/useCasesAndClients'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
    const lowerCategory = category?.toLowerCase() || ''
    if (lowerCategory.includes('قانون') || lowerCategory.includes('legal') || lowerCategory.includes('محكمة')) return Gavel
    if (lowerCategory.includes('مكتب') || lowerCategory.includes('office')) return Building
    if (lowerCategory.includes('مواصلات') || lowerCategory.includes('transport') || lowerCategory.includes('سفر')) return Car
    if (lowerCategory.includes('طعام') || lowerCategory.includes('food')) return Coffee
    if (lowerCategory.includes('مستندات') || lowerCategory.includes('document')) return FileText
    return Receipt
}

export default function ExpensesDashboard() {
    const navigate = useNavigate()
    const [activeTypeTab, setActiveTypeTab] = useState('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [caseFilter, setCaseFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('date')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Fetch cases for filter dropdowns
    const { data: casesData } = useCases({})

    // Mutations
    const deleteExpenseMutation = useDeleteExpense()

    // API Filters
    const filters = useMemo(() => {
        const f: any = { page: currentPage, limit: itemsPerPage }

        // Type filter
        if (activeTypeTab === 'case') {
            f.isCaseRelated = true
        } else if (activeTypeTab === 'general') {
            f.isCaseRelated = false
        } else if (activeTypeTab === 'pending') {
            f.status = 'pending'
        }

        // Case
        if (caseFilter !== 'all') {
            f.caseId = caseFilter
        }

        // Sort
        f.sortBy = sortBy
        f.sortOrder = 'desc'

        return f
    }, [activeTypeTab, caseFilter, sortBy, currentPage, itemsPerPage])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || caseFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setCaseFilter('all')
        setCurrentPage(1)
    }

    // Fetch data
    const { data: expensesData, isLoading, isError, error, refetch } = useExpenses(filters)

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
    const expenses = useMemo(() => {
        if (!expensesData?.expenses) return []

        return expensesData.expenses.map((expense: any) => ({
            id: expense._id,
            description: expense.description || 'مصروف غير محدد',
            vendor: expense.vendor || '-',
            category: expense.category || 'عام',
            amount: expense.amount || 0,
            date: expense.date,
            dateFormatted: formatDualDate(expense.date),
            caseNumber: expense.caseId?.caseNumber || null,
            isCaseRelated: !!expense.caseId,
            status: expense.status || 'approved',
            icon: getCategoryIcon(expense.category),
            _id: expense._id,
        }))
    }, [expensesData])

    // Filter Logic (client-side search)
    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            if (searchQuery && !expense.description.includes(searchQuery) && !expense.vendor.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [expenses, searchQuery])

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
        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} مصروف؟`)) {
            selectedIds.forEach(id => deleteExpenseMutation.mutate(id))
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single expense actions
    const handleViewExpense = (id: string) => {
        navigate({ to: '/dashboard/finance/expenses/$expenseId', params: { expenseId: id } })
    }

    const handleEditExpense = (id: string) => {
        navigate({ to: '/dashboard/finance/expenses/$expenseId/edit', params: { expenseId: id } })
    }

    const handleDeleteExpense = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
            deleteExpenseMutation.mutate(id)
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
            case 'approved':
                return { label: 'معتمد', bg: 'bg-emerald-100', text: 'text-emerald-700' }
            case 'pending':
                return { label: 'معلق', bg: 'bg-amber-100', text: 'text-amber-700' }
            case 'rejected':
                return { label: 'مرفوض', bg: 'bg-red-100', text: 'text-red-700' }
            default:
                return { label: 'معتمد', bg: 'bg-emerald-100', text: 'text-emerald-700' }
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: true },
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
                <ProductivityHero badge="إدارة المالية" title="المصروفات" type="expenses" />

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
                                            placeholder="بحث في المصروفات..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Type Filter */}
                                    <Select value={activeTypeTab} onValueChange={setActiveTypeTab}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="case">قضايا</SelectItem>
                                            <SelectItem value="general">عامة</SelectItem>
                                            <SelectItem value="pending">معلقة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Case Filter */}
                                    <Select value={caseFilter} onValueChange={setCaseFilter}>
                                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="القضية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل القضايا</SelectItem>
                                            {casesData?.data?.map((caseItem: any) => (
                                                <SelectItem key={caseItem._id} value={caseItem._id}>
                                                    {caseItem.caseNumber || caseItem.title}
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

                        {/* MAIN EXPENSES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {activeTypeTab === 'all' ? 'جميع المصروفات' :
                                        activeTypeTab === 'case' ? 'مصروفات القضايا' :
                                            activeTypeTab === 'general' ? 'المصروفات العامة' :
                                                activeTypeTab === 'pending' ? 'المصروفات المعلقة' : 'المصروفات'}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {filteredExpenses.length} مصروف
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المصروفات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && filteredExpenses.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Receipt className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد مصروفات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بتسجيل مصروف جديد</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/finance/expenses/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                مصروف جديد
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Expenses List */}
                                {!isLoading && !isError && filteredExpenses.map((expense) => {
                                    const statusConfig = getStatusConfig(expense.status)
                                    const ExpenseIcon = expense.icon
                                    return (
                                        <div key={expense.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(expense.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    {isSelectionMode && (
                                                        <Checkbox
                                                            checked={selectedIds.includes(expense.id)}
                                                            onCheckedChange={() => handleSelectItem(expense.id)}
                                                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                    )}
                                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-red-500">
                                                        <ExpenseIcon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-navy text-lg">{expense.description}</h4>
                                                            {expense.isCaseRelated && (
                                                                <Badge className="bg-blue-100 text-blue-700 border-0 rounded-md px-2">
                                                                    <Briefcase className="w-3 h-3 ml-1" />
                                                                    قضية
                                                                </Badge>
                                                            )}
                                                            <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 rounded-md px-2`}>
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-500 text-sm">
                                                            {expense.vendor !== '-' ? `المورد: ${expense.vendor}` : expense.category}
                                                            {expense.caseNumber && ` • قضية: ${expense.caseNumber}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleEditExpense(expense.id)}>
                                                            <Edit3 className="h-4 w-4 ml-2 text-blue-500" />
                                                            تعديل المصروف
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleViewExpense(expense.id)}>
                                                            <Eye className="h-4 w-4 ml-2" />
                                                            عرض التفاصيل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteExpense(expense.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 ml-2" />
                                                            حذف المصروف
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-4">
                                                    {/* Amount */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                        <div className="font-bold text-red-600 text-lg">{formatCurrency(expense.amount)}</div>
                                                    </div>
                                                    {/* Date - Dual Language */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">التاريخ</div>
                                                        <div className="font-bold text-navy text-sm">{expense.dateFormatted.arabic}</div>
                                                        <div className="text-xs text-slate-400">{expense.dateFormatted.english}</div>
                                                    </div>
                                                    {/* Category */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">الفئة</div>
                                                        <div className="font-bold text-slate-600 text-sm">{expense.category}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleViewExpense(expense.id)}
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
                            {filteredExpenses.length > 0 && (
                                <div className="p-4 pt-0 flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        عرض {filteredExpenses.length} من {expensesData?.pagination?.total || filteredExpenses.length} مصروف
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
                                            disabled={currentPage >= Math.ceil((expensesData?.pagination?.total || filteredExpenses.length) / itemsPerPage)}
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
                        context="expenses"
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
