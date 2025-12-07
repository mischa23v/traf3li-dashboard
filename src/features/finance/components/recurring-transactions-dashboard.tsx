import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    Calendar, Clock, Play, Pause, X, Bell,
    FileText, Receipt, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import {
    useRecurringTransactions,
    useUpcomingRecurring,
    useCreateRecurringTransaction,
    usePauseRecurringTransaction,
    useResumeRecurringTransaction,
    useCancelRecurringTransaction,
    useGenerateRecurringTransaction,
} from '@/hooks/useAccounting'
import { useClients } from '@/hooks/useClients'
import { useVendors } from '@/hooks/useAccounting'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import type { RecurringStatus, RecurringTransactionType, RecurringFrequency } from '@/services/accountingService'

// Frequency labels in Arabic
const frequencyLabels: Record<RecurringFrequency, string> = {
    daily: 'يومي',
    weekly: 'أسبوعي',
    bi_weekly: 'كل أسبوعين',
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    semi_annual: 'نصف سنوي',
    annual: 'سنوي'
}

// Status labels and colors
const statusConfig: Record<RecurringStatus, { label: string; color: string; icon: any }> = {
    active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    paused: { label: 'متوقف', color: 'bg-amber-100 text-amber-700', icon: Pause },
    cancelled: { label: 'ملغى', color: 'bg-slate-400 text-slate-700', icon: X },
    completed: { label: 'مكتمل', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 }
}

// Transaction type labels
const typeLabels: Record<RecurringTransactionType, string> = {
    invoice: 'فاتورة متكررة',
    bill: 'فاتورة متكررة',
    expense: 'مصروف متكرر'
}

export default function RecurringTransactionsDashboard() {
    const [activeTab, setActiveTab] = useState<RecurringStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    // Form state for new recurring transaction
    const [formData, setFormData] = useState({
        name: '',
        transactionType: 'invoice' as RecurringTransactionType,
        frequency: 'monthly' as RecurringFrequency,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        clientId: '',
        vendorId: '',
        amount: '',
        autoSend: false,
        notes: ''
    })

    // Fetch data
    const { data: recurringData, isLoading, isError, error, refetch } = useRecurringTransactions(
        activeTab !== 'all' ? { status: activeTab as RecurringStatus } : undefined
    )
    const { data: upcomingData } = useUpcomingRecurring()
    const { data: clientsData } = useClients()
    const { data: vendorsData } = useVendors()

    // Mutations
    const createMutation = useCreateRecurringTransaction()
    const pauseMutation = usePauseRecurringTransaction()
    const resumeMutation = useResumeRecurringTransaction()
    const cancelMutation = useCancelRecurringTransaction()
    const generateMutation = useGenerateRecurringTransaction()

    // Transform data
    const transactions = useMemo(() => {
        if (!recurringData?.data) return []
        return recurringData.data
    }, [recurringData])

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return txn.name.toLowerCase().includes(query)
            }
            return true
        })
    }, [transactions, searchQuery])

    // Calculate stats
    const stats = useMemo(() => {
        const active = transactions.filter(t => t.status === 'active').length
        const paused = transactions.filter(t => t.status === 'paused').length
        const upcoming = upcomingData?.data?.length || 0
        const total = transactions.length

        return [
            { label: 'المعاملات النشطة', value: active, icon: CheckCircle2, status: 'normal' as const },
            { label: 'متوقفة مؤقتاً', value: paused, icon: Pause, status: paused > 0 ? 'attention' as const : 'zero' as const },
            { label: 'قادمة قريباً', value: upcoming, icon: Bell, status: 'normal' as const },
            { label: 'الإجمالي', value: total, icon: Calendar, status: 'normal' as const }
        ]
    }, [transactions, upcomingData])

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy', { locale: arSA })
        } catch {
            return 'غير محدد'
        }
    }

    // Handle form submission
    const handleCreateTransaction = async () => {
        try {
            await createMutation.mutateAsync({
                name: formData.name,
                transactionType: formData.transactionType,
                frequency: formData.frequency,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                clientId: formData.clientId || undefined,
                vendorId: formData.vendorId || undefined,
                amount: formData.amount ? parseFloat(formData.amount) : undefined,
                autoSend: formData.autoSend,
                notes: formData.notes || undefined
            })
            setIsCreateDialogOpen(false)
            // Reset form
            setFormData({
                name: '',
                transactionType: 'invoice',
                frequency: 'monthly',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                clientId: '',
                vendorId: '',
                amount: '',
                autoSend: false,
                notes: ''
            })
        } catch (error) {
            console.error('Failed to create recurring transaction:', error)
        }
    }

    // Action handlers
    const handlePause = async (id: string) => {
        await pauseMutation.mutateAsync(id)
    }

    const handleResume = async (id: string) => {
        await resumeMutation.mutateAsync(id)
    }

    const handleCancel = async (id: string) => {
        await cancelMutation.mutateAsync(id)
    }

    const handleGenerate = async (id: string) => {
        await generateMutation.mutateAsync(id)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المعاملات المتكررة', href: '/dashboard/finance/recurring', isActive: true },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
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
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Skeleton className="h-64 w-full rounded-2xl" />
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
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل المعاملات المتكررة</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" />
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

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero
                    badge="المعاملات المتكررة"
                    title="المعاملات المتكررة"
                    stats={stats}
                    hideButtons={true}
                >
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm"
                    >
                        <Plus className="ms-2 h-4 w-4" />
                        إنشاء معاملة متكررة
                    </Button>
                </ProductivityHero>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredTransactions.length === 0 && !searchQuery && activeTab === 'all' ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="h-8 w-8 text-brand-blue" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد معاملات متكررة</h3>
                                <p className="text-slate-500 mb-6">ابدأ بإنشاء أول معاملة متكررة لتوفير الوقت</p>
                                <Button
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="bg-brand-blue hover:bg-blue-600 text-white px-8"
                                >
                                    <Plus className="ms-2 h-4 w-4" />
                                    إنشاء معاملة متكررة
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Filters Bar */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RecurringStatus | 'all')} className="w-full md:w-auto">
                                        <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                            <TabsTrigger
                                                value="all"
                                                className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
                                            >
                                                الكل
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="active"
                                                className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                            >
                                                نشط
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="paused"
                                                className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                            >
                                                متوقف
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="cancelled"
                                                className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-500 data-[state=active]:text-white transition-all duration-300"
                                            >
                                                ملغى
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                        <div className="relative w-full max-w-xs">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="بحث في المعاملات..."
                                                className="pe-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                            <Filter className="h-4 w-4 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Transactions List */}
                                <div className="space-y-4">
                                    {filteredTransactions.map((transaction) => {
                                        const statusInfo = statusConfig[transaction.status]
                                        const Icon = transaction.transactionType === 'invoice' ? FileText : Receipt
                                        const StatusIcon = statusInfo.icon

                                        return (
                                            <div key={transaction._id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-4 items-center flex-1">
                                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-600">
                                                            <Icon className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <h4 className="font-bold text-[#022c22] text-lg">{transaction.name}</h4>
                                                                <Badge className={`${statusInfo.color} border-0 px-2 rounded-md`}>
                                                                    <StatusIcon className="h-3 w-3 ms-1 inline" />
                                                                    {statusInfo.label}
                                                                </Badge>
                                                                <Badge className="bg-blue-100 text-blue-700 border-0 px-2 rounded-md">
                                                                    {frequencyLabels[transaction.frequency]}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-slate-500 text-sm">
                                                                {typeLabels[transaction.transactionType]}
                                                                {transaction.amount && ` • ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(transaction.amount)}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#022c22]">
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {transaction.status === 'active' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleGenerate(transaction._id)}>
                                                                        <Play className="h-4 w-4 ms-2" />
                                                                        إنشاء الآن
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handlePause(transaction._id)}>
                                                                        <Pause className="h-4 w-4 ms-2" />
                                                                        إيقاف مؤقت
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {transaction.status === 'paused' && (
                                                                <DropdownMenuItem onClick={() => handleResume(transaction._id)}>
                                                                    <Play className="h-4 w-4 ms-2" />
                                                                    استئناف
                                                                </DropdownMenuItem>
                                                            )}
                                                            {(transaction.status === 'active' || transaction.status === 'paused') && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleCancel(transaction._id)}
                                                                    className="text-red-600"
                                                                >
                                                                    <X className="h-4 w-4 ms-2" />
                                                                    إلغاء
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-400 mb-1">التشغيل التالي</div>
                                                            <div className="font-bold text-[#022c22]">{formatDate(transaction.nextRunDate)}</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-400 mb-1">تم التشغيل</div>
                                                            <div className="font-bold text-[#022c22]">{transaction.timesRun} مرة</div>
                                                        </div>
                                                        {transaction.lastRunDate && (
                                                            <div className="text-center hidden sm:block">
                                                                <div className="text-xs text-slate-400 mb-1">آخر تشغيل</div>
                                                                <div className="font-bold text-[#022c22] text-sm">{formatDate(transaction.lastRunDate)}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="transactions" />
                </div>
            </Main>

            {/* CREATE DIALOG */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>إنشاء معاملة متكررة</DialogTitle>
                        <DialogDescription>
                            قم بإنشاء فاتورة أو مصروف يتكرر تلقائياً حسب الجدول الزمني المحدد
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم المعاملة</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="مثال: فاتورة إيجار شهرية"
                            />
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <Label htmlFor="type">نوع المعاملة</Label>
                            <Select
                                value={formData.transactionType}
                                onValueChange={(value: RecurringTransactionType) => setFormData({ ...formData, transactionType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invoice">فاتورة متكررة</SelectItem>
                                    <SelectItem value="expense">مصروف متكرر</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Frequency */}
                        <div className="space-y-2">
                            <Label htmlFor="frequency">التكرار</Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value: RecurringFrequency) => setFormData({ ...formData, frequency: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">يومي</SelectItem>
                                    <SelectItem value="weekly">أسبوعي</SelectItem>
                                    <SelectItem value="bi_weekly">كل أسبوعين</SelectItem>
                                    <SelectItem value="monthly">شهري</SelectItem>
                                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                                    <SelectItem value="semi_annual">نصف سنوي</SelectItem>
                                    <SelectItem value="annual">سنوي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">تاريخ البدء</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">تاريخ الانتهاء (اختياري)</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Client/Vendor Selector */}
                        {formData.transactionType === 'invoice' ? (
                            <div className="space-y-2">
                                <Label htmlFor="client">العميل</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر العميل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientsData?.data?.map((client: any) => (
                                            <SelectItem key={client._id} value={client._id}>
                                                {client.firstName} {client.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="vendor">المورد (اختياري)</Label>
                                <Select
                                    value={formData.vendorId}
                                    onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر المورد" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendorsData?.data?.map((vendor: any) => (
                                            <SelectItem key={vendor._id} value={vendor._id}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">المبلغ</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>

                        {/* Auto Send */}
                        <div className="flex items-center justify-between gap-2 p-4 rounded-lg bg-slate-50">
                            <div className="space-y-0.5">
                                <Label htmlFor="autoSend" className="text-base">إرسال تلقائي</Label>
                                <p className="text-sm text-slate-500">
                                    إرسال {formData.transactionType === 'invoice' ? 'الفاتورة' : 'المصروف'} للعميل تلقائياً
                                </p>
                            </div>
                            <Switch
                                id="autoSend"
                                checked={formData.autoSend}
                                onCheckedChange={(checked) => setFormData({ ...formData, autoSend: checked })}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                            <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="أي ملاحظات إضافية..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleCreateTransaction}
                            disabled={!formData.name || !formData.startDate || createMutation.isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                    جاري الإنشاء...
                                </>
                            ) : (
                                <>
                                    <Plus className="ms-2 h-4 w-4" />
                                    إنشاء
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
