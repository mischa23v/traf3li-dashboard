import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus, Search, Bell, AlertCircle, ChevronLeft,
    DollarSign, Calendar, CheckCircle, Clock, ArrowRight, Users,
    FileText, CreditCard, Wallet, PlayCircle, Download, Printer
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { HRSidebar } from '../components/hr-sidebar'
import { useSalaries } from '@/hooks/useHR'
import { SalaryRecord } from '@/types/hr'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

const routeApi = getRouteApi('/_authenticated/dashboard/hr/payslips')

// Payslip card component
function PayslipCard({
    salary,
    isSelected,
    onToggleSelect,
    isSelectionMode
}: {
    salary: SalaryRecord
    isSelected: boolean
    onToggleSelect: () => void
    isSelectionMode: boolean
}) {
    const statusConfig = {
        draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-600 border-slate-200', icon: FileText },
        pending: { label: 'قيد المراجعة', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
        approved: { label: 'معتمد', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle },
        paid: { label: 'مدفوع', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: Wallet },
        rejected: { label: 'مرفوض', color: 'bg-red-500/10 text-red-600 border-red-200', icon: AlertCircle },
    }

    const config = statusConfig[salary.status] || statusConfig.draft
    const StatusIcon = config.icon

    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

    return (
        <div className={cn(
            "group bg-white rounded-2xl border border-slate-200/60 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/5 hover:border-emerald-200",
            isSelected && "ring-2 ring-emerald-500 border-emerald-300"
        )}>
            <div className="flex items-start gap-4">
                {isSelectionMode && (
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onToggleSelect}
                        className="mt-1"
                    />
                )}

                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-slate-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg">
                                {salary.employeeName}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {months[salary.month - 1]} {salary.year}
                            </p>
                        </div>
                        <Badge variant="outline" className={cn("font-medium", config.color)}>
                            <StatusIcon className="w-3.5 h-3.5 mr-1" />
                            {config.label}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-400 mb-1">الراتب الأساسي</p>
                            <p className="font-semibold text-slate-700">{formatCurrency(salary.basicSalary)}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-xs text-emerald-400 mb-1">صافي الراتب</p>
                            <p className="font-semibold text-emerald-600">{formatCurrency(salary.netSalary)}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-red-400 mb-1">الخصومات</p>
                            <p className="font-semibold text-red-600">{formatCurrency(salary.totalDeductions)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline" className="rounded-lg gap-1.5">
                            <Download className="w-4 h-4" />
                            تحميل PDF
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg gap-1.5">
                            <Printer className="w-4 h-4" />
                            طباعة
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Loading skeleton
function PayslipListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-start gap-4">
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                            <div className="grid grid-cols-3 gap-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function PayslipsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())

    const { data: salaries = [], isLoading, error } = useSalaries()

    const stats = useMemo(() => {
        const totalNet = salaries.reduce((acc, s) => acc + s.netSalary, 0)
        const totalPaid = salaries.filter(s => s.status === 'paid').length
        const totalPending = salaries.filter(s => s.status === 'pending').length

        return { totalNet, totalPaid, totalPending, total: salaries.length }
    }, [salaries])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

    // Filter payslips
    const filteredPayslips = useMemo(() => {
        return salaries.filter(salary => {
            const matchesSearch = !searchQuery ||
                salary.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || salary.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [salaries, searchQuery, statusFilter])

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedRecords)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedRecords(newSelected)
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الموارد البشرية', href: '/dashboard/hr/employees', isActive: true },
    ]

    return (
        <>
            <Header>
                <TopNav links={topLinks} />
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <DynamicIsland>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-slate-600">قسائم الرواتب</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Bell className="w-4 h-4" />
                        <span>{salaries.length} قسيمة</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main className="bg-[#f8f9fa] min-h-screen">
                <div className="bg-[#022c22] rounded-tr-3xl min-h-screen -mt-4 -mr-4 -ml-4 p-6">
                    {/* Hero Card */}
                    <ProductivityHero
                        badge="الموارد البشرية"
                        title="قسائم الرواتب"
                        type="hr"
                        hideButtons={true}
                        stats={[
                            {
                                label: "إجمالي الرواتب",
                                value: formatCurrency(stats.totalNet),
                                icon: <Wallet className="w-4 h-4 text-emerald-400" />,
                                status: 'normal'
                            },
                            {
                                label: "قسائم مدفوعة",
                                value: stats.totalPaid,
                                icon: <CheckCircle className="w-4 h-4 text-blue-400" />,
                                status: 'normal'
                            },
                            {
                                label: "قيد المراجعة",
                                value: stats.totalPending,
                                icon: <Clock className="w-4 h-4 text-amber-400" />,
                                status: 'normal'
                            },
                            {
                                label: "إجمالي القسائم",
                                value: stats.total,
                                icon: <FileText className="w-4 h-4 text-purple-400" />,
                                status: 'normal'
                            }
                        ]}
                    >
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="البحث باسم الموظف..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    {['all', 'pending', 'paid'].map((status) => (
                                        <Button
                                            key={status}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setStatusFilter(status)}
                                            className={cn(
                                                "rounded-xl text-white/70 hover:text-white hover:bg-white/10",
                                                statusFilter === status && "bg-white/20 text-white"
                                            )}
                                        >
                                            {status === 'all' && 'الكل'}
                                            {status === 'pending' && 'قيد المراجعة'}
                                            {status === 'paid' && 'مدفوع'}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ProductivityHero>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        {/* Payslip list - 2/3 width */}
                        <div className="lg:col-span-2 space-y-4">
                            {isLoading ? (
                                <PayslipListSkeleton />
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                                    <p className="text-red-600 mt-1">حدث خطأ أثناء تحميل قسائم الرواتب</p>
                                </div>
                            ) : filteredPayslips.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">لا توجد قسائم</h3>
                                    <p className="text-slate-500 mt-1 mb-4">لم يتم العثور على قسائم رواتب</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredPayslips.map((salary) => (
                                        <PayslipCard
                                            key={salary.id}
                                            salary={salary}
                                            isSelected={selectedRecords.has(salary.id)}
                                            onToggleSelect={() => handleToggleSelect(salary.id)}
                                            isSelectionMode={isSelectionMode}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - 1/3 width */}
                        <div className="lg:col-span-1">
                            <HRSidebar
                                context="payslips"
                                isSelectionMode={isSelectionMode}
                                onToggleSelectionMode={() => {
                                    setIsSelectionMode(!isSelectionMode)
                                    if (isSelectionMode) setSelectedRecords(new Set())
                                }}
                                selectedCount={selectedRecords.size}
                            />
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
