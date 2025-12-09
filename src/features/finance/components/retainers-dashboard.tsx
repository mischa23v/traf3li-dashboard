import { useState, useMemo } from 'react'
import {
    Search, Filter, Plus, MoreHorizontal,
    Wallet, AlertCircle, CheckCircle, Bell, Loader2,
    Calendar, ChevronLeft, ChevronRight, Download, X, Clock,
    TrendingUp, TrendingDown, DollarSign, Receipt, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import {
    useRetainers,
    useRetainerTransactions,
    useDepositToRetainer,
    useConsumeFromRetainer,
} from '@/hooks/useAccounting'
import { useClients } from '@/hooks/useCasesAndClients'
import { useCases } from '@/hooks/useCasesAndClients'
import { formatSAR } from '@/lib/currency'
import type { RetainerStatus } from '@/services/accountingService'

const statusConfig: Record<RetainerStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    active: { label: 'نشط', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
    exhausted: { label: 'مستنفد', color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle },
    refunded: { label: 'مسترد', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: TrendingDown },
    closed: { label: 'مغلق', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: X },
}

const paymentMethods = [
    { value: 'cash', label: 'نقدي' },
    { value: 'bank_transfer', label: 'تحويل بنكي' },
    { value: 'credit_card', label: 'بطاقة ائتمان' },
    { value: 'check', label: 'شيك' },
]

interface RetainerWithDetails {
    id: string
    retainerNumber: string
    clientName: string
    clientId: string
    caseName?: string
    caseId?: string
    initialAmount: number
    currentBalance: number
    totalDeposits: number
    totalConsumptions: number
    status: RetainerStatus
    createdAt: string
}

export default function RetainersDashboard() {
    const [activeTab, setActiveTab] = useState<'all' | RetainerStatus>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedClient, setSelectedClient] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Deposit Dialog State
    const [depositDialogOpen, setDepositDialogOpen] = useState(false)
    const [selectedRetainerForDeposit, setSelectedRetainerForDeposit] = useState<string | null>(null)
    const [depositAmount, setDepositAmount] = useState('')
    const [depositPaymentMethod, setDepositPaymentMethod] = useState<'cash' | 'bank_transfer' | 'credit_card' | 'check'>('cash')
    const [depositNotes, setDepositNotes] = useState('')

    // Consume Dialog State
    const [consumeDialogOpen, setConsumeDialogOpen] = useState(false)
    const [selectedRetainerForConsume, setSelectedRetainerForConsume] = useState<string | null>(null)
    const [consumeAmount, setConsumeAmount] = useState('')
    const [consumeDescription, setConsumeDescription] = useState('')
    const [consumeCaseId, setConsumeCaseId] = useState('')

    // Transaction History Dialog State
    const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
    const [selectedRetainerForTransactions, setSelectedRetainerForTransactions] = useState<string | null>(null)

    // Fetch clients and cases for filters
    const { data: clientsData } = useClients()
    const { data: casesData } = useCases()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}
        if (activeTab !== 'all') {
            f.status = activeTab
        }
        if (selectedClient && selectedClient !== 'all') {
            f.clientId = selectedClient
        }
        return f
    }, [activeTab, selectedClient])

    // Active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0
        if (selectedClient && selectedClient !== 'all') count++
        return count
    }, [selectedClient])

    // Clear all filters
    const clearFilters = () => {
        setSelectedClient('')
        setCurrentPage(1)
    }

    // Fetch data
    const { data: retainersData, isLoading, isError, error, refetch } = useRetainers(filters)
    const { data: transactionsData } = useRetainerTransactions(selectedRetainerForTransactions || '')

    // Mutations
    const depositMutation = useDepositToRetainer()
    const consumeMutation = useConsumeFromRetainer()

    // Transform API data to component format
    const retainers: RetainerWithDetails[] = useMemo(() => {
        if (!retainersData?.data) return []
        return retainersData.data.map((retainer: any) => ({
            id: retainer._id,
            retainerNumber: retainer.retainerNumber,
            clientName: typeof retainer.clientId === 'object'
                ? `${retainer.clientId.firstName} ${retainer.clientId.lastName}`
                : 'عميل غير معروف',
            clientId: typeof retainer.clientId === 'object' ? retainer.clientId._id : retainer.clientId,
            caseName: retainer.caseId && typeof retainer.caseId === 'object'
                ? retainer.caseId.caseNumber
                : undefined,
            caseId: retainer.caseId && typeof retainer.caseId === 'object'
                ? retainer.caseId._id
                : retainer.caseId,
            initialAmount: retainer.initialAmount,
            currentBalance: retainer.currentBalance,
            totalDeposits: retainer.totalDeposits,
            totalConsumptions: retainer.totalConsumptions,
            status: retainer.status,
            createdAt: new Date(retainer.createdAt).toLocaleDateString('ar-SA'),
        }))
    }, [retainersData])

    // Filter Logic
    const filteredRetainers = useMemo(() => {
        return retainers.filter(retainer => {
            if (searchQuery && !retainer.clientName.includes(searchQuery) && !retainer.retainerNumber.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [retainers, searchQuery])

    // Calculate statistics
    const stats = useMemo(() => {
        if (!retainersData?.data) return {
            totalActive: 0,
            totalBalance: 0,
            totalDeposits: 0,
            totalConsumptions: 0,
        }

        const allRetainers = retainersData.data
        const activeRetainers = allRetainers.filter((r: any) => r.status === 'active')
        const totalBalance = activeRetainers.reduce((sum: number, r: any) => sum + (r.currentBalance || 0), 0)
        const totalDeposits = allRetainers.reduce((sum: number, r: any) => sum + (r.totalDeposits || 0), 0)
        const totalConsumptions = allRetainers.reduce((sum: number, r: any) => sum + (r.totalConsumptions || 0), 0)

        return {
            totalActive: activeRetainers.length,
            totalBalance,
            totalDeposits,
            totalConsumptions,
        }
    }, [retainersData])

    // Handle Deposit
    const handleDeposit = async () => {
        if (!selectedRetainerForDeposit || !depositAmount) return

        try {
            await depositMutation.mutateAsync({
                id: selectedRetainerForDeposit,
                data: {
                    amount: parseFloat(depositAmount),
                    paymentMethod: depositPaymentMethod,
                    notes: depositNotes || undefined,
                }
            })
            setDepositDialogOpen(false)
            setDepositAmount('')
            setDepositNotes('')
            setSelectedRetainerForDeposit(null)
        } catch (err) {
        }
    }

    // Handle Consume
    const handleConsume = async () => {
        if (!selectedRetainerForConsume || !consumeAmount || !consumeDescription) return

        try {
            await consumeMutation.mutateAsync({
                id: selectedRetainerForConsume,
                data: {
                    amount: parseFloat(consumeAmount),
                    description: consumeDescription,
                    caseId: consumeCaseId || undefined,
                }
            })
            setConsumeDialogOpen(false)
            setConsumeAmount('')
            setConsumeDescription('')
            setConsumeCaseId('')
            setSelectedRetainerForConsume(null)
        } catch (err) {
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'عروض الأسعار', href: '/dashboard/finance/quotes', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
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
                        </div>
                        <div className="lg:col-span-4 space-y-6">
                            <Skeleton className="h-32 w-full rounded-2xl" />
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
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل حسابات الأمانات</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" aria-hidden="true" />
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

                {/* HERO CARD */}
                <ProductivityHero badge="الأمانات" title="حسابات الأمانات" type="retainers" />

                {/* STATISTICS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" aria-hidden="true" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-navy mb-1">{stats.totalActive}</div>
                            <div className="text-sm text-slate-500">حسابات نشطة</div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-navy mb-1">{formatSAR(stats.totalBalance)}</div>
                            <div className="text-sm text-slate-500">الرصيد الحالي</div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-navy mb-1">{formatSAR(stats.totalDeposits)}</div>
                            <div className="text-sm text-slate-500">إجمالي الإيداعات</div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                                    <TrendingDown className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-navy mb-1">{formatSAR(stats.totalConsumptions)}</div>
                            <div className="text-sm text-slate-500">إجمالي المسحوبات</div>
                        </CardContent>
                    </Card>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Retainers List */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredRetainers.length === 0 && !searchQuery && activeTab === 'all' ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Wallet className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد حسابات أمانة بعد</h3>
                                <p className="text-slate-500 mb-6">ستظهر حسابات الأمانة هنا عند إنشائها</p>
                            </div>
                        ) : (
                            <>
                                {/* Filters Bar */}
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setCurrentPage(1); }} className="w-full md:w-auto">
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
                                                    value="exhausted"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    مستنفد
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="closed"
                                                    className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-500 data-[state=active]:text-white transition-all duration-300"
                                                >
                                                    مغلق
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>

                                        <div className="flex items-center gap-3">
                                            <div className="relative w-full max-w-xs">
                                                <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                                <Input
                                                    placeholder="بحث في حسابات الأمانة..."
                                                    className="pe-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <Popover open={showFilters} onOpenChange={setShowFilters}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="rounded-xl border-slate-200 relative">
                                                        <Filter className="w-4 h-4 ms-2" aria-hidden="true" />
                                                        تصفية
                                                        {activeFilterCount > 0 && (
                                                            <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-emerald-600 text-white text-xs">
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
                                        </div>
                                    )}
                                </div>

                                {/* List Items */}
                                <div className="space-y-4">
                                    {filteredRetainers.length === 0 ? (
                                        <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="h-8 w-8 text-slate-600" aria-hidden="true" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد نتائج</h3>
                                            <p className="text-slate-500 mb-4">لم نجد حسابات أمانة تطابق البحث أو الفلاتر المحددة</p>
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
                                    ) : filteredRetainers.map((retainer) => {
                                        const status = statusConfig[retainer.status]
                                        const StatusIcon = status.icon
                                        const balancePercentage = retainer.initialAmount > 0
                                            ? (retainer.currentBalance / retainer.initialAmount) * 100
                                            : 0

                                        return (
                                            <Card key={retainer.id} className="rounded-[24px] border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                                <Wallet className="w-7 h-7" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-bold text-navy text-lg">{retainer.retainerNumber}</h4>
                                                                    <Badge className={`${status.bgColor} ${status.color} border-0 px-2 py-0.5`}>
                                                                        <StatusIcon className="w-3 h-3 ms-1" aria-hidden="true" />
                                                                        {status.label}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-slate-700 font-medium">{retainer.clientName}</p>
                                                                {retainer.caseName && (
                                                                    <p className="text-xs text-slate-600">القضية: {retainer.caseName}</p>
                                                                )}
                                                                <p className="text-xs text-slate-600 mt-1">تاريخ الإنشاء: {retainer.createdAt}</p>
                                                            </div>
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50" aria-label="خيارات">
                                                                <MoreHorizontal className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedRetainerForTransactions(retainer.id)
                                                                        setTransactionDialogOpen(true)
                                                                    }}
                                                                >
                                                                    <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                                                    عرض المعاملات
                                                                </DropdownMenuItem>
                                                                {retainer.status === 'active' && (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedRetainerForDeposit(retainer.id)
                                                                                setDepositDialogOpen(true)
                                                                            }}
                                                                        >
                                                                            <TrendingUp className="w-4 h-4 ms-2" />
                                                                            إيداع
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedRetainerForConsume(retainer.id)
                                                                                setConsumeDialogOpen(true)
                                                                            }}
                                                                        >
                                                                            <TrendingDown className="w-4 h-4 ms-2" />
                                                                            سحب
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Balance Progress */}
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between text-sm mb-2">
                                                            <span className="text-slate-500">الرصيد الحالي</span>
                                                            <span className="font-bold text-navy">
                                                                {formatSAR(retainer.currentBalance)} / {formatSAR(retainer.initialAmount)}
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={balancePercentage}
                                                            className="h-3"
                                                            indicatorClassName={
                                                                balancePercentage > 50 ? 'bg-emerald-500' :
                                                                balancePercentage > 25 ? 'bg-amber-500' :
                                                                'bg-red-500'
                                                            }
                                                        />
                                                    </div>

                                                    {/* Summary Stats */}
                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                                        <div>
                                                            <div className="text-xs text-slate-600 mb-1">المبلغ الأولي</div>
                                                            <div className="font-bold text-navy">{formatSAR(retainer.initialAmount)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-600 mb-1">الرصيد الحالي</div>
                                                            <div className="font-bold text-emerald-600">{formatSAR(retainer.currentBalance)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-600 mb-1">الإيداعات</div>
                                                            <div className="font-medium text-purple-600">{formatSAR(retainer.totalDeposits)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-slate-600 mb-1">المسحوبات</div>
                                                            <div className="font-medium text-amber-600">{formatSAR(retainer.totalConsumptions)}</div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <FinanceSidebar context="retainers" />
                </div>
            </Main>

            {/* DEPOSIT DIALOG */}
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>إيداع في حساب الأمانة</DialogTitle>
                        <DialogDescription>
                            إضافة مبلغ إلى حساب الأمانة
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="depositAmount">المبلغ (ريال سعودي)</Label>
                            <Input
                                id="depositAmount"
                                type="number"
                                placeholder="0.00"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depositPaymentMethod">طريقة الدفع</Label>
                            <Select value={depositPaymentMethod} onValueChange={(v: any) => setDepositPaymentMethod(v)}>
                                <SelectTrigger id="depositPaymentMethod">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depositNotes">ملاحظات (اختياري)</Label>
                            <Textarea
                                id="depositNotes"
                                placeholder="أدخل أي ملاحظات إضافية..."
                                value={depositNotes}
                                onChange={(e) => setDepositNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleDeposit}
                            disabled={!depositAmount || depositMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {depositMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 ms-2 animate-spin" aria-hidden="true" />
                                    جاري الإيداع...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-4 h-4 ms-2" />
                                    إيداع
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CONSUME DIALOG */}
            <Dialog open={consumeDialogOpen} onOpenChange={setConsumeDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>سحب من حساب الأمانة</DialogTitle>
                        <DialogDescription>
                            سحب مبلغ من حساب الأمانة لاستخدامه في القضية
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="consumeAmount">المبلغ (ريال سعودي)</Label>
                            <Input
                                id="consumeAmount"
                                type="number"
                                placeholder="0.00"
                                value={consumeAmount}
                                onChange={(e) => setConsumeAmount(e.target.value)}
                                className="text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="consumeDescription">الوصف</Label>
                            <Textarea
                                id="consumeDescription"
                                placeholder="وصف الغرض من السحب..."
                                value={consumeDescription}
                                onChange={(e) => setConsumeDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="consumeCaseId">القضية (اختياري)</Label>
                            <Select value={consumeCaseId || '__none__'} onValueChange={(value) => setConsumeCaseId(value === '__none__' ? '' : value)}>
                                <SelectTrigger id="consumeCaseId">
                                    <SelectValue placeholder="اختر قضية" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">بدون قضية</SelectItem>
                                    {casesData?.data?.map((caseItem: any) => (
                                        <SelectItem key={caseItem._id} value={caseItem._id}>
                                            {caseItem.caseNumber} - {caseItem.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConsumeDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleConsume}
                            disabled={!consumeAmount || !consumeDescription || consumeMutation.isPending}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {consumeMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 ms-2 animate-spin" aria-hidden="true" />
                                    جاري السحب...
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="w-4 h-4 ms-2" />
                                    سحب
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* TRANSACTION HISTORY DIALOG */}
            <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>سجل المعاملات</DialogTitle>
                        <DialogDescription>
                            جميع المعاملات لحساب الأمانة
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {transactionsData?.data && transactionsData.data.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {transactionsData.data.map((transaction: any) => {
                                    const isDeposit = transaction.type === 'deposit'
                                    const isConsumption = transaction.type === 'consumption'
                                    const isRefund = transaction.type === 'refund'

                                    return (
                                        <div
                                            key={transaction._id}
                                            className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                isDeposit ? 'bg-emerald-50' :
                                                isConsumption ? 'bg-amber-50' :
                                                'bg-purple-50'
                                            }`}>
                                                {isDeposit && <TrendingUp className="w-5 h-5 text-emerald-600" />}
                                                {isConsumption && <TrendingDown className="w-5 h-5 text-amber-600" />}
                                                {isRefund && <Receipt className="w-5 h-5 text-purple-600" aria-hidden="true" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div>
                                                        <p className="font-medium text-navy">
                                                            {isDeposit && 'إيداع'}
                                                            {isConsumption && 'سحب'}
                                                            {isRefund && 'استرداد'}
                                                        </p>
                                                        <p className="text-sm text-slate-500">{transaction.description}</p>
                                                        {transaction.paymentMethod && (
                                                            <p className="text-xs text-slate-600">
                                                                طريقة الدفع: {paymentMethods.find(m => m.value === transaction.paymentMethod)?.label}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-end">
                                                        <p className={`font-bold text-lg ${
                                                            isDeposit ? 'text-emerald-600' :
                                                            isConsumption ? 'text-amber-600' :
                                                            'text-purple-600'
                                                        }`}>
                                                            {isDeposit ? '+' : '-'}{formatSAR(transaction.amount)}
                                                        </p>
                                                        <p className="text-xs text-slate-600">
                                                            الرصيد: {formatSAR(transaction.balanceAfter)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-600">
                                                    {new Date(transaction.createdAt).toLocaleDateString('ar-SA', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="h-8 w-8 text-slate-600" aria-hidden="true" />
                                </div>
                                <p className="text-slate-500">لا توجد معاملات حتى الآن</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                            إغلاق
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
