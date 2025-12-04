import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus, Search, Bell, AlertCircle, ChevronLeft,
    DollarSign, Calendar, CheckCircle, Clock, ArrowRight, Users,
    FileText, CreditCard, Wallet
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HRSidebar } from '../components/hr-sidebar'
import { useSalaries, useBulkDeleteSalaries } from '@/hooks/useHR'
import { SalaryRecord } from '@/types/hr'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

const routeApi = getRouteApi('/_authenticated/dashboard/hr/salaries')

// Stats cards for the hero section
function SalaryStats({ records }: { records: SalaryRecord[] }) {
    const stats = useMemo(() => {
        const totalGross = records.reduce((acc, r) => acc + r.grossSalary, 0)
        const totalNet = records.reduce((acc, r) => acc + r.netSalary, 0)
        const totalDeductions = records.reduce((acc, r) => acc + r.totalDeductions, 0)
        const paid = records.filter(r => r.status === 'paid').length

        return { totalGross, totalNet, totalDeductions, paid, total: records.length }
    }, [records])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-white">{formatCurrency(stats.totalGross)}</p>
                        <p className="text-xs text-white/60">إجمالي الرواتب</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-white">{formatCurrency(stats.totalNet)}</p>
                        <p className="text-xs text-white/60">صافي الرواتب</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-white">{formatCurrency(stats.totalDeductions)}</p>
                        <p className="text-xs text-white/60">إجمالي الخصومات</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.paid}/{stats.total}</p>
                        <p className="text-xs text-white/60">مدفوع</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Salary card component
function SalaryCard({
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
        approved: { label: 'معتمد', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle },
        paid: { label: 'مدفوع', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle },
        cancelled: { label: 'ملغي', color: 'bg-red-500/10 text-red-600 border-red-200', icon: Clock },
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

                <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={salary.employeeAvatar} alt={salary.employeeName} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                        {salary.employeeName?.charAt(0) || 'م'}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg">
                                {salary.employeeName}
                            </h3>
                            <p className="text-sm text-slate-500">
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
                            <p className="font-semibold text-slate-700">{formatCurrency(salary.baseSalary)}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-red-400 mb-1">الخصومات</p>
                            <p className="font-semibold text-red-600">{formatCurrency(salary.totalDeductions)}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-xs text-emerald-400 mb-1">الصافي</p>
                            <p className="font-semibold text-emerald-600">{formatCurrency(salary.netSalary)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Loading skeleton
function SalaryListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <Skeleton className="h-4 w-24" />
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

export function SalariesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())

    const { data: salaries = [], isLoading, error } = useSalaries()
    const bulkDeleteMutation = useBulkDeleteSalaries()

    const stats = useMemo(() => {
        const totalGross = salaries.reduce((acc, r) => acc + r.grossSalary, 0)
        const totalNet = salaries.reduce((acc, r) => acc + r.netSalary, 0)
        const totalDeductions = salaries.reduce((acc, r) => acc + r.totalDeductions, 0)
        const paid = salaries.filter(r => r.status === 'paid').length

        return { totalGross, totalNet, totalDeductions, paid, total: salaries.length }
    }, [salaries])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

    // Filter salaries
    const filteredSalaries = useMemo(() => {
        return salaries.filter(salary => {
            const matchesSearch = !searchQuery ||
                salary.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || salary.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [salaries, searchQuery, statusFilter])

    const handleToggleSelect = (salaryId: string) => {
        const newSelected = new Set(selectedRecords)
        if (newSelected.has(salaryId)) {
            newSelected.delete(salaryId)
        } else {
            newSelected.add(salaryId)
        }
        setSelectedRecords(newSelected)
    }

    const handleDeleteSelected = async () => {
        if (selectedRecords.size === 0) return

        try {
            await bulkDeleteMutation.mutateAsync(Array.from(selectedRecords))
            toast({
                title: 'تم الحذف',
                description: `تم حذف ${selectedRecords.size} سجل بنجاح`,
            })
            setSelectedRecords(new Set())
            setIsSelectionMode(false)
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في حذف السجلات',
                variant: 'destructive',
            })
        }
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
                        <span className="text-sm text-slate-600">الرواتب</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Bell className="w-4 h-4" />
                        <span>{salaries.length} سجل</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* Hero Card */}
                <ProductivityHero
                    badge="الموارد البشرية"
                    title="الرواتب"
                    type="hr"
                    hideButtons={true}
                    stats={[
                        {
                            label: "إجمالي الرواتب",
                            value: formatCurrency(stats.totalGross),
                            icon: Wallet,
                            status: 'normal'
                        },
                        {
                            label: "صافي الرواتب",
                            value: formatCurrency(stats.totalNet),
                            icon: CreditCard,
                            status: 'normal'
                        },
                        {
                            label: "إجمالي الخصومات",
                            value: formatCurrency(stats.totalDeductions),
                            icon: DollarSign,
                            status: 'normal'
                        },
                        {
                            label: "مدفوع",
                            value: `${stats.paid}/${stats.total}`,
                            icon: CheckCircle,
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
                                        placeholder="البحث عن موظف..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    {['all', 'draft', 'approved', 'paid'].map((status) => (
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
                                            {status === 'draft' && 'مسودة'}
                                            {status === 'approved' && 'معتمد'}
                                            {status === 'paid' && 'مدفوع'}
                                        </Button>
                                    ))}
                                </div>

                                <Link to="/dashboard/hr/salaries/new">
                                    <Button className="bg-white text-emerald-900 hover:bg-white/90 rounded-xl gap-2 font-medium">
                                        <Plus className="w-4 h-4" />
                                        إنشاء راتب
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </ProductivityHero>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Salary list - 2/3 width */}
                    <div className="lg:col-span-2 space-y-4">
                            {isLoading ? (
                                <SalaryListSkeleton />
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                                    <p className="text-red-600 mt-1">حدث خطأ أثناء تحميل سجلات الرواتب</p>
                                </div>
                            ) : filteredSalaries.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                        <DollarSign className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">لا توجد سجلات</h3>
                                    <p className="text-slate-500 mt-1 mb-4">لم يتم العثور على سجلات رواتب</p>
                                    <Link to="/dashboard/hr/salaries/new">
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
                                            <Plus className="w-4 h-4" />
                                            إنشاء سجل راتب
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredSalaries.map((salary) => (
                                        <SalaryCard
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
                    <HRSidebar
                        context="salaries"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={() => {
                            setIsSelectionMode(!isSelectionMode)
                            if (isSelectionMode) setSelectedRecords(new Set())
                        }}
                        selectedCount={selectedRecords.size}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
