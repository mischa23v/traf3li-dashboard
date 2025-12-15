import { useState, useMemo, useCallback } from 'react'
import {
    Search, Check, X, MessageSquare, Download, Filter,
    Clock, User, FileText, AlertCircle, CheckCircle2, XCircle,
    Loader2, ChevronDown, Calendar
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from 'sonner'

// Mock hook - will be replaced with real implementation
const usePendingTimeEntries = () => {
    return {
        data: { data: [], pagination: { total: 0 } },
        isLoading: false,
        isError: false,
        error: null,
        refetch: () => {}
    }
}

const useApproveTimeEntry = () => ({
    mutate: (id: string) => toast.success('تمت الموافقة على السجل'),
    isPending: false
})

const useRejectTimeEntry = () => ({
    mutate: (data: { id: string; reason: string }) => toast.success('تم رفض السجل'),
    isPending: false
})

const useBulkApproveTimeEntries = () => ({
    mutate: (ids: string[]) => toast.success(`تمت الموافقة على ${ids.length} سجل`),
    isPending: false
})

const useBulkRejectTimeEntries = () => ({
    mutate: (data: { ids: string[]; reason: string }) => toast.success(`تم رفض ${data.ids.length} سجل`),
    isPending: false
})

const useRequestTimeEntryChanges = () => ({
    mutate: (data: { id: string; comments: string }) => toast.success('تم طلب التعديلات'),
    isPending: false
})

export default function TimeEntryApprovalsView() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
    const [dateRange, setDateRange] = useState<string>('week')
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [changesDialogOpen, setChangesDialogOpen] = useState(false)
    const [selectedEntryForAction, setSelectedEntryForAction] = useState<string | null>(null)
    const [actionReason, setActionReason] = useState('')

    // Fetch pending entries
    const { data: entriesData, isLoading, isError, error, refetch } = usePendingTimeEntries()

    // Mutations
    const approveEntryMutation = useApproveTimeEntry()
    const rejectEntryMutation = useRejectTimeEntry()
    const bulkApproveMutation = useBulkApproveTimeEntries()
    const bulkRejectMutation = useBulkRejectTimeEntries()
    const requestChangesMutation = useRequestTimeEntryChanges()

    // Transform API data
    const pendingEntries = useMemo(() => {
        if (!entriesData?.data) return []
        return entriesData.data.map((entry: any) => ({
            id: entry._id,
            date: new Date(entry.date).toLocaleDateString('ar-SA'),
            employee: entry.userId?.firstName + ' ' + entry.userId?.lastName || 'غير محدد',
            employeeId: entry.userId?._id || entry.userId,
            client: entry.clientId?.name || entry.clientId?.firstName + ' ' + entry.clientId?.lastName || 'عميل غير محدد',
            caseNumber: entry.caseId?.caseNumber || 'غير محدد',
            description: entry.description || 'مهمة غير محددة',
            hours: entry.hours || 0,
            rate: entry.hourlyRate || 0,
            amount: entry.totalAmount || (entry.hours * entry.hourlyRate) || 0,
            status: entry.status || 'submitted',
            submittedAt: entry.submittedAt ? new Date(entry.submittedAt).toLocaleString('ar-SA') : null,
            _id: entry._id,
        }))
    }, [entriesData])

    // Filter entries
    const filteredEntries = useMemo(() => {
        let filtered = pendingEntries

        // Filter by employee
        if (selectedEmployee !== 'all') {
            filtered = filtered.filter(entry => entry.employeeId === selectedEmployee)
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(entry =>
                entry.employee.toLowerCase().includes(query) ||
                entry.description.toLowerCase().includes(query) ||
                entry.client.toLowerCase().includes(query) ||
                entry.caseNumber.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [pendingEntries, selectedEmployee, searchQuery])

    // Calculate stats
    const stats = useMemo(() => {
        return {
            pendingCount: filteredEntries.length,
            totalHours: filteredEntries.reduce((sum, e) => sum + e.hours, 0),
            totalAmount: filteredEntries.reduce((sum, e) => sum + e.amount, 0),
        }
    }, [filteredEntries])

    // Unique employees for filter
    const employees = useMemo(() => {
        const unique = new Map()
        pendingEntries.forEach(entry => {
            if (!unique.has(entry.employeeId)) {
                unique.set(entry.employeeId, entry.employee)
            }
        })
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
    }, [pendingEntries])

    // Selection handlers
    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            setSelectedEntries(new Set(filteredEntries.map(e => e.id)))
        } else {
            setSelectedEntries(new Set())
        }
    }, [filteredEntries])

    const handleSelectEntry = useCallback((id: string, checked: boolean) => {
        setSelectedEntries(prev => {
            const next = new Set(prev)
            if (checked) {
                next.add(id)
            } else {
                next.delete(id)
            }
            return next
        })
    }, [])

    // Action handlers
    const handleApprove = useCallback((id: string) => {
        approveEntryMutation.mutate(id)
    }, [approveEntryMutation])

    const handleReject = useCallback(() => {
        if (selectedEntryForAction && actionReason.trim()) {
            rejectEntryMutation.mutate({
                id: selectedEntryForAction,
                reason: actionReason
            })
            setRejectDialogOpen(false)
            setActionReason('')
            setSelectedEntryForAction(null)
        }
    }, [selectedEntryForAction, actionReason, rejectEntryMutation])

    const handleRequestChanges = useCallback(() => {
        if (selectedEntryForAction && actionReason.trim()) {
            requestChangesMutation.mutate({
                id: selectedEntryForAction,
                comments: actionReason
            })
            setChangesDialogOpen(false)
            setActionReason('')
            setSelectedEntryForAction(null)
        }
    }, [selectedEntryForAction, actionReason, requestChangesMutation])

    const handleBulkApprove = useCallback(() => {
        if (selectedEntries.size > 0) {
            bulkApproveMutation.mutate(Array.from(selectedEntries))
            setSelectedEntries(new Set())
        }
    }, [selectedEntries, bulkApproveMutation])

    const handleBulkReject = useCallback(() => {
        if (selectedEntries.size > 0 && actionReason.trim()) {
            bulkRejectMutation.mutate({
                ids: Array.from(selectedEntries),
                reason: actionReason
            })
            setRejectDialogOpen(false)
            setActionReason('')
            setSelectedEntries(new Set())
        }
    }, [selectedEntries, actionReason, bulkRejectMutation])

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
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: true },
    ]

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
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD */}
                <ProductivityHero badge="الموافقات" title="موافقات سجلات الوقت" type="time-tracking" />

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600">السجلات المعلقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#022c22]">{stats.pendingCount}</div>
                            <p className="text-xs text-slate-500 mt-1">في انتظار الموافقة</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600">إجمالي الساعات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{stats.totalHours.toFixed(1)} س</div>
                            <p className="text-xs text-slate-500 mt-1">الوقت المسجل</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600">القيمة الإجمالية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</div>
                            <p className="text-xs text-slate-500 mt-1">قيمة السجلات المعلقة</p>
                        </CardContent>
                    </Card>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Filters & Actions Bar */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                        <SelectTrigger className="w-[180px] rounded-xl">
                                            <SelectValue placeholder="جميع الموظفين" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">جميع الموظفين</SelectItem>
                                            {employees.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger className="w-[140px] rounded-xl">
                                            <SelectValue placeholder="الفترة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">اليوم</SelectItem>
                                            <SelectItem value="week">هذا الأسبوع</SelectItem>
                                            <SelectItem value="month">هذا الشهر</SelectItem>
                                            <SelectItem value="all">الكل</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="relative flex-1 max-w-xs">
                                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                    <Input
                                        placeholder="بحث في السجلات..."
                                        className="pe-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Bulk Actions */}
                            {selectedEntries.size > 0 && (
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                                    <span className="text-sm text-slate-600">
                                        {selectedEntries.size} سجل محدد
                                    </span>
                                    <div className="flex gap-2 ms-auto">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                            onClick={handleBulkApprove}
                                            disabled={bulkApproveMutation.isPending}
                                        >
                                            {bulkApproveMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 ms-2" />
                                            )}
                                            الموافقة على الكل
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="rounded-xl"
                                            onClick={() => {
                                                setRejectDialogOpen(true)
                                                setSelectedEntryForAction('bulk')
                                            }}
                                            disabled={bulkRejectMutation.isPending}
                                        >
                                            <XCircle className="h-4 w-4 ms-2" />
                                            رفض الكل
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Entries List */}
                        <div className="space-y-4">
                            {/* Loading State */}
                            {isLoading && (
                                <>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
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
                                            <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل السجلات</h3>
                                    <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                    <Button onClick={() => refetch()} className="bg-[#022c22] hover:bg-[#022c22]/90">
                                        إعادة المحاولة
                                    </Button>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !isError && filteredEntries.length === 0 && (
                                <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-600" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سجلات معلقة</h3>
                                    <p className="text-slate-500">جميع السجلات تمت الموافقة عليها أو معالجتها</p>
                                </div>
                            )}

                            {/* Success State - Entries List */}
                            {!isLoading && !isError && filteredEntries.map((entry) => (
                                <div key={entry.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                                    <div className="flex gap-4">
                                        {/* Selection Checkbox */}
                                        <div className="flex items-start pt-2">
                                            <Checkbox
                                                checked={selectedEntries.has(entry.id)}
                                                onCheckedChange={(checked) => handleSelectEntry(entry.id, !!checked)}
                                            />
                                        </div>

                                        {/* Entry Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-sm">
                                                        <Clock className="h-6 w-6" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-[#022c22] text-lg">{entry.description}</h4>
                                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 border px-2 rounded-md">
                                                                معلق
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                            <User className="w-3 h-3" aria-hidden="true" />
                                                            {entry.employee}
                                                            <span className="text-slate-300">•</span>
                                                            <FileText className="w-3 h-3" aria-hidden="true" />
                                                            {entry.client} - {entry.caseNumber}
                                                        </div>
                                                        {entry.submittedAt && (
                                                            <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                                                                <Calendar className="w-3 h-3" />
                                                                تم الإرسال: {entry.submittedAt}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Entry Details & Actions */}
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600 mb-1">المدة</div>
                                                        <div className="font-bold text-[#022c22] text-lg">{entry.hours} س</div>
                                                    </div>
                                                    <div className="h-8 w-px bg-slate-200"></div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600 mb-1">القيمة</div>
                                                        <div className="font-bold text-emerald-600 text-lg">{formatCurrency(entry.amount)}</div>
                                                    </div>
                                                    <div className="h-8 w-px bg-slate-200"></div>
                                                    <div className="text-sm text-slate-500">{entry.date}</div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                                        onClick={() => handleApprove(entry.id)}
                                                        disabled={approveEntryMutation.isPending}
                                                    >
                                                        <Check className="h-4 w-4 ms-2" />
                                                        موافقة
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="outline" className="rounded-xl">
                                                                <ChevronDown className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedEntryForAction(entry.id)
                                                                    setChangesDialogOpen(true)
                                                                }}
                                                            >
                                                                <MessageSquare className="h-4 w-4 me-2" />
                                                                طلب تعديلات
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => {
                                                                    setSelectedEntryForAction(entry.id)
                                                                    setRejectDialogOpen(true)
                                                                }}
                                                            >
                                                                <X className="h-4 w-4 me-2" />
                                                                رفض
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Select All Checkbox */}
                            {!isLoading && !isError && filteredEntries.length > 0 && (
                                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={selectedEntries.size === filteredEntries.length && filteredEntries.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <span className="text-sm text-slate-600">تحديد الكل ({filteredEntries.length})</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="time-tracking" />
                </div>
            </Main>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>رفض السجلات</DialogTitle>
                        <DialogDescription>
                            يرجى تقديم سبب الرفض. سيتم إرسال إشعار للموظف.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="اكتب سبب الرفض..."
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setRejectDialogOpen(false)
                            setActionReason('')
                            setSelectedEntryForAction(null)
                        }}>
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={selectedEntryForAction === 'bulk' ? handleBulkReject : handleReject}
                            disabled={!actionReason.trim() || rejectEntryMutation.isPending || bulkRejectMutation.isPending}
                        >
                            {(rejectEntryMutation.isPending || bulkRejectMutation.isPending) && (
                                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                            )}
                            رفض
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Changes Dialog */}
            <Dialog open={changesDialogOpen} onOpenChange={setChangesDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>طلب تعديلات</DialogTitle>
                        <DialogDescription>
                            اكتب التعديلات المطلوبة. سيتم إرسال إشعار للموظف لإجراء التعديلات.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="اكتب التعديلات المطلوبة..."
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setChangesDialogOpen(false)
                            setActionReason('')
                            setSelectedEntryForAction(null)
                        }}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleRequestChanges}
                            disabled={!actionReason.trim() || requestChangesMutation.isPending}
                        >
                            {requestChangesMutation.isPending && (
                                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                            )}
                            إرسال
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
