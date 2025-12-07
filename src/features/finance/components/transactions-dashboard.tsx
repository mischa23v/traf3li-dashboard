/**
 * Transactions Dashboard - READ-ONLY General Ledger View
 *
 * This is NOT a form for creating transactions. This is a READ-ONLY view
 * of all General Ledger entries that are automatically created by the system
 * when invoices, payments, expenses, etc. are posted.
 *
 * Features:
 * - Date filtering with period selector and custom date range
 * - Transaction type filtering (Invoice, Payment, Expense, Bill, Journal Entry)
 * - Client/Case filtering
 * - Search functionality
 * - Summary statistics (total count, total debit, total credit, balance)
 * - Professional table with clickable rows for details
 * - Detail dialog showing full journal entry lines
 * - Export to Excel/PDF/CSV
 * - Pagination
 * - RTL/LTR support for Arabic/English
 */

import { useState, useMemo } from 'react'
import {
    Search, Filter, Download, RefreshCw, Eye, Printer,
    FileText, Receipt, Wallet, FileSpreadsheet, BookOpen,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle,
    X, MoreVertical, Bell, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'
import { useGLEntries } from '@/hooks/useAccounting'
import { formatSAR, halalasToSAR } from '@/lib/currency'
import { cn } from '@/lib/utils'
import type { GLReferenceModel, GLEntry, GLEntryLine, Account } from '@/services/accountingService'

// ==================== CONSTANTS ====================

const TRANSACTION_TYPES: { value: GLReferenceModel | 'all'; label: string; icon: any; color: string }[] = [
    { value: 'all', label: 'جميع الأنواع', icon: FileText, color: 'bg-slate-50 text-slate-700 border-slate-200' },
    { value: 'Invoice', label: 'فاتورة', icon: FileText, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'Payment', label: 'دفعة', icon: Wallet, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'Expense', label: 'مصروف', icon: Receipt, color: 'bg-red-50 text-red-700 border-red-200' },
    { value: 'Bill', label: 'فاتورة مورد', icon: FileSpreadsheet, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'JournalEntry', label: 'قيد يومية', icon: BookOpen, color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

const QUICK_PERIODS = [
    { value: 'today', label: 'اليوم' },
    { value: 'yesterday', label: 'أمس' },
    { value: 'this-week', label: 'هذا الأسبوع' },
    { value: 'last-week', label: 'الأسبوع الماضي' },
    { value: 'this-month', label: 'هذا الشهر' },
    { value: 'last-month', label: 'الشهر الماضي' },
    { value: 'this-quarter', label: 'هذا الربع' },
    { value: 'this-year', label: 'هذه السنة' },
    { value: 'last-year', label: 'السنة الماضية' },
    { value: 'all', label: 'جميع الفترات' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    'draft': { label: 'مسودة', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    'posted': { label: 'مرحّل', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'voided': { label: 'ملغى', color: 'bg-red-50 text-red-700 border-red-200' },
}

const PAGE_SIZES = [25, 50, 100, 200]

// ==================== HELPER FUNCTIONS ====================

const getTypeInfo = (type: GLReferenceModel) => {
    return TRANSACTION_TYPES.find(t => t.value === type) || TRANSACTION_TYPES[0]
}

const getStatusInfo = (status: string) => {
    return STATUS_LABELS[status] || STATUS_LABELS['draft']
}

const getPeriodDates = (period: string): { startDate?: string; endDate?: string } => {
    const today = new Date()
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    switch (period) {
        case 'today':
            return { startDate: formatDate(today), endDate: formatDate(today) }
        case 'yesterday': {
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) }
        }
        case 'this-week': {
            const startOfWeek = new Date(today)
            startOfWeek.setDate(today.getDate() - today.getDay())
            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6)
            return { startDate: formatDate(startOfWeek), endDate: formatDate(endOfWeek) }
        }
        case 'last-week': {
            const startOfLastWeek = new Date(today)
            startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
            const endOfLastWeek = new Date(startOfLastWeek)
            endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
            return { startDate: formatDate(startOfLastWeek), endDate: formatDate(endOfLastWeek) }
        }
        case 'this-month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            return { startDate: formatDate(startOfMonth), endDate: formatDate(endOfMonth) }
        }
        case 'last-month': {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
            return { startDate: formatDate(startOfLastMonth), endDate: formatDate(endOfLastMonth) }
        }
        case 'this-quarter': {
            const quarter = Math.floor(today.getMonth() / 3)
            const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1)
            const endOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0)
            return { startDate: formatDate(startOfQuarter), endDate: formatDate(endOfQuarter) }
        }
        case 'this-year': {
            const startOfYear = new Date(today.getFullYear(), 0, 1)
            const endOfYear = new Date(today.getFullYear(), 11, 31)
            return { startDate: formatDate(startOfYear), endDate: formatDate(endOfYear) }
        }
        case 'last-year': {
            const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1)
            const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31)
            return { startDate: formatDate(startOfLastYear), endDate: formatDate(endOfLastYear) }
        }
        case 'all':
        default:
            return {}
    }
}

const getReferenceLink = (type: GLReferenceModel, referenceId: string): string => {
    switch (type) {
        case 'Invoice':
            return `/dashboard/finance/invoices/${referenceId}`
        case 'Payment':
            return `/dashboard/finance/payments/${referenceId}`
        case 'Expense':
            return `/dashboard/finance/expenses/${referenceId}`
        case 'Bill':
            return `/dashboard/finance/bills/${referenceId}`
        case 'JournalEntry':
            return `/dashboard/finance/journal-entries/${referenceId}`
        default:
            return '#'
    }
}

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

const getAccountName = (account: string | Account): string => {
    if (typeof account === 'string') return account
    return account?.name || account?.code || 'غير محدد'
}

const getAccountCode = (account: string | Account): string => {
    if (typeof account === 'string') return ''
    return account?.code || ''
}

// ==================== FILTER STATE INTERFACE ====================

interface FilterState {
    period: string
    startDate: string
    endDate: string
    type: GLReferenceModel | 'all'
    status: 'all' | 'draft' | 'posted' | 'voided'
    search: string
    page: number
    pageSize: number
}

// ==================== MAIN COMPONENT ====================

export default function TransactionsDashboard() {
    // Filter state
    const [filters, setFilters] = useState<FilterState>({
        period: 'this-month',
        startDate: '',
        endDate: '',
        type: 'all',
        status: 'all',
        search: '',
        page: 1,
        pageSize: 25,
    })

    // UI state
    const [showFilters, setShowFilters] = useState(true)
    const [selectedEntry, setSelectedEntry] = useState<GLEntry | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    // Build API filters
    const apiFilters = useMemo(() => {
        const periodDates = filters.period !== 'custom' ? getPeriodDates(filters.period) : {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
        }

        return {
            ...periodDates,
            referenceModel: filters.type !== 'all' ? filters.type : undefined,
            page: filters.page,
            limit: filters.pageSize,
        }
    }, [filters])

    // Fetch GL entries
    const { data: entriesData, isLoading, isError, error, refetch } = useGLEntries(apiFilters)

    // Process and filter data
    const { filteredEntries, summary } = useMemo(() => {
        const allEntries = entriesData?.entries || []

        // Apply local filters (search, status)
        let filtered = allEntries

        // Search filter
        if (filters.search) {
            const query = filters.search.toLowerCase()
            filtered = filtered.filter((entry: GLEntry) =>
                entry.description?.toLowerCase().includes(query) ||
                entry.entryNumber?.toLowerCase().includes(query) ||
                entry.referenceId?.toLowerCase().includes(query)
            )
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter((entry: GLEntry) => entry.status === filters.status)
        }

        // Calculate summary
        let totalDebit = 0
        let totalCredit = 0

        filtered.forEach((entry: GLEntry) => {
            entry.lines?.forEach((line: GLEntryLine) => {
                totalDebit += line.debit || 0
                totalCredit += line.credit || 0
            })
        })

        return {
            filteredEntries: filtered,
            summary: {
                totalCount: filtered.length,
                totalDebit,
                totalCredit,
                difference: Math.abs(totalDebit - totalCredit),
                isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
            },
        }
    }, [entriesData, filters.search, filters.status])

    // Pagination
    const totalPages = Math.ceil((entriesData?.total || 0) / filters.pageSize)
    const totalCount = entriesData?.total || 0

    // Handle period change
    const handlePeriodChange = (period: string) => {
        setFilters(prev => ({ ...prev, period, page: 1 }))
    }

    // Handle filter clear
    const handleClearFilters = () => {
        setFilters({
            period: 'this-month',
            startDate: '',
            endDate: '',
            type: 'all',
            status: 'all',
            search: '',
            page: 1,
            pageSize: 25,
        })
    }

    // Open entry detail
    const handleViewDetails = (entry: GLEntry) => {
        setSelectedEntry(entry)
        setDetailDialogOpen(true)
    }

    // Export handlers (placeholder - would need backend implementation)
    const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
        // TODO: Implement export functionality
    }

    // Print handler
    const handlePrint = () => {
        window.print()
    }

    // Top navigation
    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: true },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
    ]

    // ==================== LOADING STATE ====================
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
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
                            <Skeleton className="h-96 w-full rounded-3xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Skeleton className="h-64 w-full rounded-2xl" />
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    // ==================== ERROR STATE ====================
    if (isError) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل المعاملات</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <RefreshCw className="ms-2 h-4 w-4" aria-hidden="true" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // ==================== SUCCESS STATE ====================
    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD - Read-Only Notice */}
                <ProductivityHero
                    badge="سجل المعاملات"
                    title="القيود المحاسبية"
                    type="transactions"
                    hideButtons={true}
                />

                {/* READ-ONLY NOTICE */}
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 font-bold">سجل للقراءة فقط</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        هذا السجل يعرض جميع القيود المحاسبية التي تم إنشاؤها تلقائياً عند ترحيل الفواتير والمدفوعات والمصروفات. لا يمكن إضافة أو تعديل القيود مباشرة من هنا.
                    </AlertDescription>
                </Alert>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS SECTION */}
                        <Card className="border-slate-200">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-slate-600" aria-hidden="true" />
                                        تصفية المعاملات
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="text-slate-500"
                                        >
                                            {showFilters ? 'إخفاء' : 'إظهار'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            className="text-slate-500"
                                        >
                                            <X className="h-4 w-4 ms-1" />
                                            مسح
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {showFilters && (
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Quick Period */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-slate-600">الفترة</Label>
                                            <Select
                                                value={filters.period}
                                                onValueChange={handlePeriodChange}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر الفترة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {QUICK_PERIODS.map(period => (
                                                        <SelectItem key={period.value} value={period.value}>
                                                            {period.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Transaction Type */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-slate-600">نوع المعاملة</Label>
                                            <Select
                                                value={filters.type}
                                                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as GLReferenceModel | 'all', page: 1 }))}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="جميع الأنواع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TRANSACTION_TYPES.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Status */}
                                        <div className="space-y-2">
                                            <Label className="text-sm text-slate-600">الحالة</Label>
                                            <Select
                                                value={filters.status}
                                                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as 'all' | 'draft' | 'posted' | 'voided', page: 1 }))}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="جميع الحالات" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">الكل</SelectItem>
                                                    <SelectItem value="posted">مرحّل</SelectItem>
                                                    <SelectItem value="voided">ملغى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                                        <Input
                                            placeholder="بحث في رقم القيد، الوصف، المرجع..."
                                            className="pe-10 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                                            value={filters.search}
                                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        />
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* SUMMARY CARDS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-slate-200">
                                <CardContent className="pt-4">
                                    <div className="text-sm text-slate-500 mb-1">إجمالي المعاملات</div>
                                    <div className="text-2xl font-bold text-slate-900">{summary.totalCount}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200">
                                <CardContent className="pt-4">
                                    <div className="text-sm text-slate-500 mb-1">إجمالي المدين</div>
                                    <div className="text-2xl font-bold text-blue-600">{formatSAR(halalasToSAR(summary.totalDebit))}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-200">
                                <CardContent className="pt-4">
                                    <div className="text-sm text-slate-500 mb-1">إجمالي الدائن</div>
                                    <div className="text-2xl font-bold text-emerald-600">{formatSAR(halalasToSAR(summary.totalCredit))}</div>
                                </CardContent>
                            </Card>
                            <Card className={cn("border-slate-200", summary.isBalanced ? "bg-emerald-50" : "bg-red-50")}>
                                <CardContent className="pt-4">
                                    <div className="text-sm text-slate-500 mb-1">الفرق</div>
                                    <div className={cn(
                                        "text-2xl font-bold flex items-center gap-2",
                                        summary.isBalanced ? "text-emerald-600" : "text-red-600"
                                    )}>
                                        {summary.isBalanced ? (
                                            <>
                                                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                                                <span>متوازن</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                                                <span>{formatSAR(halalasToSAR(summary.difference))}</span>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* TRANSACTIONS TABLE */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">سجل القيود</CardTitle>
                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="rounded-xl">
                                                    <Download className="ms-2 h-4 w-4" aria-hidden="true" />
                                                    تصدير
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleExport('excel')}>
                                                    <FileSpreadsheet className="ms-2 h-4 w-4" />
                                                    Excel
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                                    <FileText className="ms-2 h-4 w-4" aria-hidden="true" />
                                                    PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExport('csv')}>
                                                    <FileText className="ms-2 h-4 w-4" aria-hidden="true" />
                                                    CSV
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => refetch()}>
                                            <RefreshCw className="ms-2 h-4 w-4" aria-hidden="true" />
                                            تحديث
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredEntries.length === 0 ? (
                                    <div className="bg-slate-50 rounded-xl p-12 text-center border border-slate-200">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="h-8 w-8 text-slate-400" aria-hidden="true" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد معاملات</h3>
                                        <p className="text-slate-500">لم يتم العثور على قيود محاسبية في الفترة المحددة</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                        <TableHead className="font-bold text-slate-900 w-28">التاريخ</TableHead>
                                                        <TableHead className="font-bold text-slate-900 w-28">رقم القيد</TableHead>
                                                        <TableHead className="font-bold text-slate-900 w-24">النوع</TableHead>
                                                        <TableHead className="font-bold text-slate-900">الوصف</TableHead>
                                                        <TableHead className="font-bold text-slate-900 w-24">القضية</TableHead>
                                                        <TableHead className="font-bold text-slate-900 text-left w-28">المبلغ</TableHead>
                                                        <TableHead className="font-bold text-slate-900 w-20">الحالة</TableHead>
                                                        <TableHead className="w-12"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredEntries.map((entry: GLEntry) => {
                                                        const typeInfo = getTypeInfo(entry.referenceModel)
                                                        const statusInfo = getStatusInfo(entry.status)
                                                        const Icon = typeInfo.icon
                                                        const isVoided = entry.status === 'voided'

                                                        return (
                                                            <TableRow
                                                                key={entry._id}
                                                                className={cn(
                                                                    "cursor-pointer hover:bg-slate-50 transition-colors",
                                                                    isVoided && "opacity-50 bg-slate-50/50"
                                                                )}
                                                                onClick={() => handleViewDetails(entry)}
                                                            >
                                                                <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                                                                    <div className="text-sm">{formatDate(entry.transactionDate)}</div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                                                        {entry.entryNumber}
                                                                    </code>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className={cn("text-xs font-medium", typeInfo.color)}>
                                                                        {typeInfo.label}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="max-w-xs">
                                                                    <div className="flex items-start gap-2">
                                                                        <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <span className="text-slate-700 line-clamp-1">{entry.description}</span>
                                                                            {entry.clientId && (
                                                                                <span className="text-xs text-slate-500 block">
                                                                                    {entry.clientId.firstName} {entry.clientId.lastName}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {entry.caseId?.caseNumber ? (
                                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                                                            {entry.caseId.caseNumber}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-slate-400 text-sm">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-left font-bold text-emerald-600 whitespace-nowrap">
                                                                    {formatSAR(halalasToSAR(entry.amount))}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
                                                                        {statusInfo.label}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(entry); }}>
                                                                                <Eye className="ms-2 h-4 w-4" aria-hidden="true" />
                                                                                عرض التفاصيل
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                                                <Printer className="ms-2 h-4 w-4" aria-hidden="true" />
                                                                                طباعة
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                                                                                <Link to={getReferenceLink(entry.referenceModel, entry.referenceId)}>
                                                                                    <FileText className="ms-2 h-4 w-4" aria-hidden="true" />
                                                                                    عرض المستند الأصلي
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* PAGINATION */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-sm text-slate-500">
                                                عرض {((filters.page - 1) * filters.pageSize) + 1} - {Math.min(filters.page * filters.pageSize, totalCount)} من {totalCount}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                                    disabled={filters.page === 1}
                                                    className="rounded-xl"
                                                >
                                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                                </Button>

                                                <span className="text-sm text-slate-600 px-2">
                                                    صفحة {filters.page} من {totalPages || 1}
                                                </span>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                                    disabled={filters.page >= totalPages}
                                                    className="rounded-xl"
                                                >
                                                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                            </div>

                                            <Select
                                                value={filters.pageSize.toString()}
                                                onValueChange={(value) => setFilters(prev => ({ ...prev, pageSize: parseInt(value), page: 1 }))}
                                            >
                                                <SelectTrigger className="w-24 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAGE_SIZES.map(size => (
                                                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="transactions" />
                </div>
            </Main>

            {/* ENTRY DETAIL DIALOG */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedEntry && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-slate-600" aria-hidden="true" />
                                        تفاصيل القيد
                                        <Badge variant="outline" className={cn("text-xs", getStatusInfo(selectedEntry.status).color)}>
                                            {getStatusInfo(selectedEntry.status).label}
                                        </Badge>
                                    </div>
                                    <code className="text-sm font-mono text-slate-500">
                                        {selectedEntry.entryNumber}
                                    </code>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Header Info */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <Label className="text-slate-500">تاريخ المعاملة</Label>
                                                <p className="font-medium mt-1">{formatDate(selectedEntry.transactionDate)}</p>
                                            </div>
                                            <div>
                                                <Label className="text-slate-500">نوع المعاملة</Label>
                                                <p className="font-medium mt-1">
                                                    <Badge variant="outline" className={cn("text-xs", getTypeInfo(selectedEntry.referenceModel).color)}>
                                                        {getTypeInfo(selectedEntry.referenceModel).label}
                                                    </Badge>
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-slate-500">المرجع</Label>
                                                <Link
                                                    to={getReferenceLink(selectedEntry.referenceModel, selectedEntry.referenceId)}
                                                    className="font-medium mt-1 text-blue-600 hover:underline block"
                                                >
                                                    {selectedEntry.referenceId}
                                                </Link>
                                            </div>
                                            <div>
                                                <Label className="text-slate-500">المبلغ الإجمالي</Label>
                                                <p className="font-bold mt-1 text-emerald-600">
                                                    {formatSAR(halalasToSAR(selectedEntry.amount))}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {selectedEntry.clientId && (
                                                <div>
                                                    <Label className="text-slate-500">العميل</Label>
                                                    <p className="font-medium mt-1">
                                                        {selectedEntry.clientId.firstName} {selectedEntry.clientId.lastName}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedEntry.caseId && (
                                                <div>
                                                    <Label className="text-slate-500">القضية</Label>
                                                    <p className="font-medium mt-1">{selectedEntry.caseId.caseNumber}</p>
                                                </div>
                                            )}
                                        </div>

                                        <Separator className="my-4" />

                                        <div>
                                            <Label className="text-slate-500">الوصف</Label>
                                            <p className="mt-1">{selectedEntry.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Journal Entry Lines */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">القيود المحاسبية</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead className="font-bold text-slate-900">الحساب</TableHead>
                                                        <TableHead className="font-bold text-slate-900">الوصف</TableHead>
                                                        <TableHead className="font-bold text-slate-900 text-left w-32">مدين</TableHead>
                                                        <TableHead className="font-bold text-slate-900 text-left w-32">دائن</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedEntry.lines?.map((line: GLEntryLine, index: number) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    {getAccountCode(line.accountId) && (
                                                                        <code className="text-xs bg-slate-100 px-1 rounded">
                                                                            {getAccountCode(line.accountId)}
                                                                        </code>
                                                                    )}
                                                                    <span className="font-medium">{getAccountName(line.accountId)}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-slate-600">
                                                                {line.description || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-left">
                                                                {line.debit > 0 && (
                                                                    <span className="font-bold text-blue-600">
                                                                        {formatSAR(halalasToSAR(line.debit))}
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-left">
                                                                {line.credit > 0 && (
                                                                    <span className="font-bold text-emerald-600">
                                                                        {formatSAR(halalasToSAR(line.credit))}
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                                <TableFooter>
                                                    <TableRow className="font-bold bg-slate-50">
                                                        <TableCell colSpan={2} className="text-left">الإجمالي</TableCell>
                                                        <TableCell className="text-left text-blue-600">
                                                            {formatSAR(halalasToSAR(
                                                                selectedEntry.lines?.reduce((sum: number, line: GLEntryLine) => sum + (line.debit || 0), 0) || 0
                                                            ))}
                                                        </TableCell>
                                                        <TableCell className="text-left text-emerald-600">
                                                            {formatSAR(halalasToSAR(
                                                                selectedEntry.lines?.reduce((sum: number, line: GLEntryLine) => sum + (line.credit || 0), 0) || 0
                                                            ))}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Audit Trail */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">سجل التدقيق</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">تاريخ الإنشاء:</span>
                                                <span className="font-medium">
                                                    {formatDate(selectedEntry.createdAt)} {formatTime(selectedEntry.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">آخر تحديث:</span>
                                                <span className="font-medium">
                                                    {formatDate(selectedEntry.updatedAt)} {formatTime(selectedEntry.updatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={handlePrint} className="rounded-xl">
                                    <Printer className="ms-2 h-4 w-4" aria-hidden="true" />
                                    طباعة
                                </Button>
                                <Button asChild variant="outline" className="rounded-xl">
                                    <Link to={getReferenceLink(selectedEntry.referenceModel, selectedEntry.referenceId)}>
                                        <FileText className="ms-2 h-4 w-4" aria-hidden="true" />
                                        عرض المستند الأصلي
                                    </Link>
                                </Button>
                                <Button onClick={() => setDetailDialogOpen(false)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                                    إغلاق
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
