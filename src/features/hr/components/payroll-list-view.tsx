import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useSalarySlips, usePayrollStats, useDeleteSalarySlip } from '@/hooks/usePayroll'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Search, Bell, AlertCircle, Wallet, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2,
    Edit3, SortAsc, X, Calendar, DollarSign, FileText, CheckCircle, Clock, XCircle,
    Download, Send
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SalarySlip, PaymentStatus } from '@/services/payrollService'

const MONTHS = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
]

export function PayrollListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Current date for defaults
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [monthFilter, setMonthFilter] = useState<number>(currentMonth)
    const [yearFilter, setYearFilter] = useState<number>(currentYear)
    const [sortBy, setSortBy] = useState<string>('paymentDate')

    // Mutations
    const deleteSlipMutation = useDeleteSalarySlip()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {
            month: monthFilter,
            year: yearFilter,
        }

        if (statusFilter !== 'all') {
            f.status = statusFilter
        }

        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        if (sortBy === 'paymentDate') {
            f.sortBy = 'payPeriod.paymentDate'
            f.sortOrder = 'desc'
        } else if (sortBy === 'employee') {
            f.sortBy = 'employeeName'
            f.sortOrder = 'asc'
        } else if (sortBy === 'amount') {
            f.sortBy = 'netPay'
            f.sortOrder = 'desc'
        }

        return f
    }, [statusFilter, monthFilter, yearFilter, searchQuery, sortBy])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all'

    // Clear filters (except month/year)
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
    }

    // Fetch salary slips
    const { data: slipsData, isLoading, isError, error, refetch } = useSalarySlips(filters)
    const { data: stats } = usePayrollStats(monthFilter, yearFilter)

    // Transform API data
    const salarySlips = useMemo(() => {
        if (!slipsData?.salarySlips) return []
        return slipsData.salarySlips
    }, [slipsData])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectSlip = (slipId: string) => {
        if (selectedIds.includes(slipId)) {
            setSelectedIds(selectedIds.filter(id => id !== slipId))
        } else {
            setSelectedIds([...selectedIds, slipId])
        }
    }

    // Single slip actions
    const handleViewSlip = (slipId: string) => {
        navigate({ to: '/dashboard/hr/payroll/$slipId', params: { slipId } })
    }

    const handleEditSlip = (slipId: string) => {
        navigate({ to: '/dashboard/hr/payroll/new', search: { editId: slipId } })
    }

    const handleDeleteSlip = (slipId: string) => {
        if (confirm('هل أنت متأكد من حذف هذه القسيمة؟')) {
            deleteSlipMutation.mutate(slipId)
        }
    }

    // Status badge styling
    const getStatusBadge = (status: PaymentStatus) => {
        const styles: Record<PaymentStatus, string> = {
            draft: 'bg-slate-100 text-slate-700 border-slate-200',
            approved: 'bg-blue-100 text-blue-700 border-blue-200',
            processing: 'bg-amber-100 text-amber-700 border-amber-200',
            paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            failed: 'bg-red-100 text-red-700 border-red-200',
            cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
        }
        const labels: Record<PaymentStatus, string> = {
            draft: 'مسودة',
            approved: 'معتمد',
            processing: 'قيد المعالجة',
            paid: 'مدفوع',
            failed: 'فشل',
            cancelled: 'ملغي',
        }
        const icons: Record<PaymentStatus, React.ReactNode> = {
            draft: <FileText className="w-3 h-3" aria-hidden="true" />,
            approved: <CheckCircle className="w-3 h-3" />,
            processing: <Clock className="w-3 h-3" aria-hidden="true" />,
            paid: <CheckCircle className="w-3 h-3" />,
            failed: <XCircle className="w-3 h-3" />,
            cancelled: <XCircle className="w-3 h-3" />,
        }
        return (
            <Badge className={`${styles[status]} border-0 rounded-md px-2 flex items-center gap-1`}>
                {icons[status]}
                {labels[status]}
            </Badge>
        )
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('ar-SA') + ' ر.س'
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!stats) return undefined
        return [
            { label: 'إجمالي القسائم', value: stats.total || 0, icon: FileText, status: 'normal' as const },
            { label: 'مدفوعة', value: stats.paid || 0, icon: CheckCircle, status: 'normal' as const },
            { label: 'قيد المعالجة', value: stats.processing || 0, icon: Clock, status: stats.processing > 0 ? 'attention' as const : 'zero' as const },
            { label: 'إجمالي المبالغ', value: formatCurrency(stats.totalNetPay || 0), icon: DollarSign, status: 'normal' as const },
        ]
    }, [stats])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'قسائم الرواتب', href: '/dashboard/hr/payroll', isActive: true },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="الموارد البشرية" title="قسائم الرواتب" type="payroll" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Period selection */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Month Filter */}
                                    <Select value={String(monthFilter)} onValueChange={(v) => setMonthFilter(Number(v))}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <Calendar className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                            <SelectValue placeholder="الشهر" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((month) => (
                                                <SelectItem key={month.value} value={String(month.value)}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Year Filter */}
                                    <Select value={String(yearFilter)} onValueChange={(v) => setYearFilter(Number(v))}>
                                        <SelectTrigger className="w-[100px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="السنة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم أو الرقم..." aria-label="بحث بالاسم أو الرقم"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Status and sort */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="draft">مسودة</SelectItem>
                                            <SelectItem value="approved">معتمد</SelectItem>
                                            <SelectItem value="processing">قيد المعالجة</SelectItem>
                                            <SelectItem value="paid">مدفوع</SelectItem>
                                            <SelectItem value="failed">فشل</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paymentDate">تاريخ الدفع</SelectItem>
                                            <SelectItem value="employee">الموظف</SelectItem>
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
                                            <X className="h-4 w-4 ms-2" aria-hidden="true" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN SALARY SLIPS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قسائم الرواتب</h3>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                        {salarySlips.length} قسيمة
                                    </Badge>
                                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                                        <Link to="/dashboard/hr/payroll/new">
                                            <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                            إنشاء قسيمة
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل القسائم</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && salarySlips.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Wallet className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد قسائم رواتب</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإنشاء قسيمة راتب جديدة</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/hr/payroll/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إنشاء قسيمة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Salary Slips List */}
                                {!isLoading && !isError && salarySlips.map((slip) => (
                                    <div key={slip._id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(slip._id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(slip._id)}
                                                        onCheckedChange={() => handleSelectSlip(slip._id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                    <Wallet className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{slip.employeeNameAr || slip.employeeName}</h4>
                                                        {getStatusBadge(slip.payment.status)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">
                                                        {slip.slipNumber} • {slip.jobTitle}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewSlip(slip._id)}>
                                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditSlip(slip._id)}>
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                        تعديل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="h-4 w-4 ms-2 text-purple-500" aria-hidden="true" />
                                                        تحميل PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteSlip(slip._id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        حذف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200/50">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">الفترة</div>
                                                <div className="font-medium text-navy text-sm">
                                                    {MONTHS.find(m => m.value === slip.payPeriod.month)?.label} {slip.payPeriod.year}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">الراتب الإجمالي</div>
                                                <div className="font-medium text-navy text-sm">
                                                    {formatCurrency(slip.earnings.totalEarnings)}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">الخصومات</div>
                                                <div className="font-medium text-red-600 text-sm">
                                                    {formatCurrency(slip.deductions.totalDeductions)}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">صافي الراتب</div>
                                                <div className="font-bold text-emerald-600 text-lg">
                                                    {formatCurrency(slip.netPay)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <Link to={`/dashboard/hr/payroll/${slip._id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض القسيمة
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع القسائم
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <HRSidebar
                        context="payroll"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                    />
                </div>
            </Main>
        </>
    )
}
