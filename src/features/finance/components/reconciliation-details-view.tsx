import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import {
    ArrowLeft, Search, Bell, Building2, CheckCircle2, XCircle, Clock, AlertCircle,
    Upload, Download, Filter, Eye, Edit3, Trash2, MoreHorizontal, Plus, RefreshCw,
    TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Loader2, CheckSquare,
    ArrowRightLeft, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
    useBankFeed,
    useBankTransactions,
    useFetchTransactions,
    useImportCSV,
    useCreateMatch,
    useAutoMatchAll,
} from '@/hooks/useFinanceAdvanced'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export function ReconciliationDetailsView() {
    const { feedId } = useParams({ strict: false }) as { feedId: string }
    const navigate = useNavigate()

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('date')

    // Mutations
    const fetchTransactionsMutation = useFetchTransactions()
    const autoMatchAllMutation = useAutoMatchAll()
    const createMatchMutation = useCreateMatch()

    // API Filters
    const transactionFilters = useMemo(() => {
        const f: any = {}

        if (statusFilter !== 'all') {
            f.matchStatus = statusFilter
        }

        if (typeFilter !== 'all') {
            f.type = typeFilter
        }

        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        f.sortBy = sortBy
        f.sortOrder = sortBy === 'date' ? 'desc' : 'asc'

        return f
    }, [statusFilter, typeFilter, searchQuery, sortBy])

    // Fetch data
    const { data: bankFeedData, isLoading: loadingFeed, isError: errorFeed, error: feedError, refetch: refetchFeed } = useBankFeed(feedId)
    const { data: transactionsData, isLoading: loadingTransactions, isError: errorTransactions, refetch: refetchTransactions } = useBankTransactions(feedId, transactionFilters)

    // Clear filters
    const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setTypeFilter('all')
    }

    // Transform data
    const bankFeed = useMemo(() => {
        if (!bankFeedData) return null
        const feed = bankFeedData
        return {
            id: feed._id,
            accountName: feed.accountName || 'غير محدد',
            accountNumber: feed.accountNumber || '',
            bankName: feed.bankName || 'غير محدد',
            accountType: feed.accountType || 'checking',
            currency: feed.currency || 'SAR',
            balance: feed.balance || 0,
            lastReconciled: feed.lastReconciled,
            lastReconciledFormatted: feed.lastReconciled
                ? format(new Date(feed.lastReconciled), 'd MMMM yyyy', { locale: arSA })
                : 'لم تتم التسوية بعد',
            status: feed.status || 'active',
            matchedCount: feed.stats?.matched || 0,
            unmatchedCount: feed.stats?.unmatched || 0,
            pendingCount: feed.stats?.pending || 0,
            isConnected: feed.isConnected || false,
        }
    }, [bankFeedData])

    const transactions = useMemo(() => {
        if (!transactionsData?.data) return []
        return transactionsData.data.map((txn: any) => ({
            id: txn._id,
            date: format(new Date(txn.date), 'd MMMM yyyy', { locale: arSA }),
            description: txn.description || 'غير محدد',
            type: txn.type || 'debit',
            amount: txn.amount || 0,
            balance: txn.balance || 0,
            matchStatus: txn.matchStatus || 'unmatched',
            matchedWith: txn.matchedWith,
            confidence: txn.confidence || 0,
        }))
    }, [transactionsData])

    // Stats
    const stats = useMemo(() => {
        if (!bankFeed) return []
        return [
            { label: 'معاملات متطابقة', value: bankFeed.matchedCount, icon: CheckCircle2, status: 'normal' as const },
            { label: 'معاملات غير متطابقة', value: bankFeed.unmatchedCount, icon: XCircle, status: bankFeed.unmatchedCount > 0 ? 'attention' as const : 'zero' as const },
            { label: 'معاملات معلقة', value: bankFeed.pendingCount, icon: Clock, status: bankFeed.pendingCount > 0 ? 'attention' as const : 'zero' as const },
            { label: 'الرصيد الحالي', value: `${bankFeed.balance.toLocaleString()} ${bankFeed.currency}`, icon: DollarSign, status: 'normal' as const },
        ]
    }, [bankFeed])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'التسوية البنكية', href: '/dashboard/finance/reconciliation', isActive: true },
    ]

    // Handle actions
    const handleFetchTransactions = () => {
        fetchTransactionsMutation.mutate(feedId, {
            onSuccess: () => {
                refetchFeed()
                refetchTransactions()
            }
        })
    }

    const handleAutoMatch = () => {
        autoMatchAllMutation.mutate(feedId, {
            onSuccess: () => {
                refetchFeed()
                refetchTransactions()
            }
        })
    }

    const getMatchStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            matched: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            unmatched: 'bg-red-100 text-red-700 border-red-200',
            excluded: 'bg-slate-100 text-slate-700 border-slate-200',
        }
        const labels: Record<string, string> = {
            matched: 'متطابقة',
            pending: 'معلقة',
            unmatched: 'غير متطابقة',
            excluded: 'مستثناة',
        }
        return <Badge className={`${styles[status] || styles.unmatched} border-0 rounded-md px-2 text-xs`}>{labels[status] || status}</Badge>
    }

    // LOADING STATE
    if (loadingFeed || loadingTransactions) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-2 sm:gap-4'>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <Skeleton className="h-12 w-48 mb-6" />
                    <Skeleton className="h-48 w-full rounded-3xl mb-8" />
                    <Skeleton className="h-96 w-full rounded-3xl" />
                </Main>
            </>
        )
    }

    // ERROR STATE
    if (errorFeed || errorTransactions) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-2 sm:gap-4'>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to={ROUTES.dashboard.finance.reconciliation.list} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                            العودة إلى التسوية البنكية
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل البيانات</h3>
                        <p className="text-slate-500 mb-6">{feedError?.message || 'تعذر الاتصال بالخادم'}</p>
                        <Button onClick={() => { refetchFeed(); refetchTransactions() }} className="bg-emerald-500 hover:bg-emerald-600">
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // EMPTY STATE
    if (!bankFeed) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-2 sm:gap-4'>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to={ROUTES.dashboard.finance.reconciliation.list} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                            العودة إلى التسوية البنكية
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="h-8 w-8 text-slate-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">الحساب البنكي غير موجود</h3>
                        <p className="text-slate-500 mb-6">لم نتمكن من العثور على الحساب المطلوب</p>
                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                            <Link to={ROUTES.dashboard.finance.reconciliation.list}>
                                العودة إلى قائمة الحسابات
                            </Link>
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // SUCCESS STATE
    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to={ROUTES.dashboard.finance.reconciliation.list} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                        العودة إلى التسوية البنكية
                    </Link>
                </div>

                {/* HERO CARD & STATS */}
                <ProductivityHero
                    badge="التسوية البنكية"
                    title={`${bankFeed.accountName} - ${bankFeed.bankName}`}
                    type="reconciliation"
                    stats={stats}
                />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ACCOUNT INFO CARD */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        معلومات الحساب
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleFetchTransactions}
                                            disabled={fetchTransactionsMutation.isPending || !bankFeed.isConnected}
                                            className="rounded-xl"
                                        >
                                            <RefreshCw className={`h-4 w-4 ms-2 ${fetchTransactionsMutation.isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
                                            جلب المعاملات
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAutoMatch}
                                            disabled={autoMatchAllMutation.isPending}
                                            className="rounded-xl"
                                        >
                                            <CheckSquare className="h-4 w-4 ms-2" aria-hidden="true" />
                                            مطابقة تلقائية
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">رقم الحساب</div>
                                        <div className="font-mono text-sm font-medium">{bankFeed.accountNumber}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">نوع الحساب</div>
                                        <Badge variant="outline" className="text-xs">
                                            {bankFeed.accountType === 'checking' ? 'جاري' :
                                             bankFeed.accountType === 'savings' ? 'توفير' :
                                             bankFeed.accountType === 'credit' ? 'بطاقة ائتمان' : 'قرض'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">آخر تسوية</div>
                                        <div className="text-sm font-medium">{bankFeed.lastReconciledFormatted}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">الرصيد</div>
                                        <div className="text-sm font-bold text-emerald-600">{bankFeed.balance.toLocaleString()} {bankFeed.currency}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث في المعاملات..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="matched">متطابقة</SelectItem>
                                            <SelectItem value="pending">معلقة</SelectItem>
                                            <SelectItem value="unmatched">غير متطابقة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Type Filter */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الأنواع</SelectItem>
                                            <SelectItem value="credit">إيداع</SelectItem>
                                            <SelectItem value="debit">سحب</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Filters */}
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

                        {/* TRANSACTIONS LIST */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg font-bold text-navy">المعاملات البنكية</CardTitle>
                                    <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                        {transactions.length} معاملة
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {transactions.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="h-8 w-8 text-slate-600" aria-hidden="true" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد معاملات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ باستيراد المعاملات من البنك</p>
                                        <Button className="bg-emerald-500 hover:bg-emerald-600">
                                            <Upload className="h-4 w-4 ms-2" aria-hidden="true" />
                                            استيراد المعاملات
                                        </Button>
                                    </div>
                                ) : (
                                    transactions.map((txn) => (
                                        <div key={txn.id} className="bg-[#F8F9FA] rounded-2xl p-4 border border-slate-100 hover:border-emerald-200 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            {txn.type === 'credit' ? <TrendingUp className="h-5 w-5" aria-hidden="true" /> : <TrendingDown className="h-5 w-5" aria-hidden="true" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-navy">{txn.description}</div>
                                                            <div className="text-xs text-slate-500">{txn.date}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-start space-y-2">
                                                    <div className={`text-lg font-bold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {txn.type === 'credit' ? '+' : '-'}{txn.amount.toLocaleString()} {bankFeed.currency}
                                                    </div>
                                                    {getMatchStatusBadge(txn.matchStatus)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="reconciliation" />
                </div>
            </Main>
        </>
    )
}
