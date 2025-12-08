import { FinanceSidebar } from './finance-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useBankFeeds, useBankTransactions, useDeleteBankFeed } from '@/hooks/useFinanceAdvanced'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, Building2, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, Edit3, SortAsc, Filter, X, CreditCard, TrendingUp, CheckCircle2, XCircle, Clock, ArrowRightLeft } from 'lucide-react'
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

export function ReconciliationListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('lastReconciled')

    // Mutations
    const deleteBankFeedMutation = useDeleteBankFeed()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        // Status filter
        if (statusFilter !== 'all') {
            f.status = statusFilter
        }

        // Type filter
        if (typeFilter !== 'all') {
            f.accountType = typeFilter
        }

        // Search
        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        // Sort
        if (sortBy === 'lastReconciled') {
            f.sortBy = 'lastReconciled'
            f.sortOrder = 'desc'
        } else if (sortBy === 'name') {
            f.sortBy = 'accountName'
            f.sortOrder = 'asc'
        } else if (sortBy === 'balance') {
            f.sortBy = 'balance'
            f.sortOrder = 'desc'
        }

        return f
    }, [statusFilter, typeFilter, searchQuery, sortBy])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setTypeFilter('all')
    }

    // Fetch bank feeds
    const { data: bankFeedsData, isLoading, isError, error, refetch } = useBankFeeds(filters)

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM yyyy', { locale: arSA }),
            english: format(date, 'MMM d, yyyy')
        }
    }

    // Transform API data
    const bankFeeds = useMemo(() => {
        if (!bankFeedsData?.data) return []

        return bankFeedsData.data.map((feed: any) => ({
            id: feed._id,
            accountName: feed.accountName || 'غير محدد',
            accountNumber: feed.accountNumber || '',
            bankName: feed.bankName || 'غير محدد',
            accountType: feed.accountType || 'checking',
            currency: feed.currency || 'SAR',
            balance: feed.balance || 0,
            lastReconciled: feed.lastReconciled,
            lastReconciledFormatted: formatDualDate(feed.lastReconciled),
            status: feed.status || 'active',
            matchedCount: feed.stats?.matched || 0,
            unmatchedCount: feed.stats?.unmatched || 0,
            pendingCount: feed.stats?.pending || 0,
            isConnected: feed.isConnected || false,
            _id: feed._id,
        }))
    }, [bankFeedsData])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectBankFeed = (feedId: string) => {
        if (selectedIds.includes(feedId)) {
            setSelectedIds(selectedIds.filter(id => id !== feedId))
        } else {
            setSelectedIds([...selectedIds, feedId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} حساب بنكي؟`)) {
            selectedIds.forEach(id => {
                deleteBankFeedMutation.mutate(id)
            })
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single bank feed actions
    const handleViewBankFeed = (feedId: string) => {
        navigate({ to: '/dashboard/finance/reconciliation/$feedId', params: { feedId } })
    }

    const handleEditBankFeed = (feedId: string) => {
        navigate({ to: '/dashboard/finance/reconciliation/new', search: { editId: feedId } })
    }

    const handleDeleteBankFeed = (feedId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الحساب البنكي؟')) {
            deleteBankFeedMutation.mutate(feedId)
        }
    }

    // Status badge styling
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            inactive: 'bg-slate-100 text-slate-700 border-slate-200',
            disconnected: 'bg-red-100 text-red-700 border-red-200',
        }
        const labels: Record<string, string> = {
            active: 'نشط',
            inactive: 'غير نشط',
            disconnected: 'غير متصل',
        }
        return <Badge className={`${styles[status] || styles.active} border-0 rounded-md px-2`}>{labels[status] || status}</Badge>
    }

    // Account type badge
    const getTypeBadge = (type: string) => {
        const labels: Record<string, string> = {
            checking: 'جاري',
            savings: 'توفير',
            credit: 'بطاقة ائتمان',
            loan: 'قرض',
        }
        return <Badge variant="outline" className="text-xs">{labels[type] || type}</Badge>
    }

    // Connection status badge
    const getConnectionBadge = (isConnected: boolean) => {
        return isConnected ? (
            <Badge className="bg-blue-100 text-blue-700 border-0 rounded-md px-2 text-xs">
                <CheckCircle2 className="h-3 w-3 ms-1" aria-hidden="true" />
                متصل
            </Badge>
        ) : (
            <Badge className="bg-amber-100 text-amber-700 border-0 rounded-md px-2 text-xs">
                <Clock className="h-3 w-3 ms-1" aria-hidden="true" />
                يدوي
            </Badge>
        )
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!bankFeedsData?.data) return undefined

        const totalAccounts = bankFeedsData.data.length
        const totalMatched = bankFeedsData.data.reduce((sum: number, feed: any) => sum + (feed.stats?.matched || 0), 0)
        const totalUnmatched = bankFeedsData.data.reduce((sum: number, feed: any) => sum + (feed.stats?.unmatched || 0), 0)
        const totalPending = bankFeedsData.data.reduce((sum: number, feed: any) => sum + (feed.stats?.pending || 0), 0)

        return [
            { label: 'إجمالي الحسابات', value: totalAccounts || 0, icon: Building2, status: 'normal' as const },
            { label: 'معاملات متطابقة', value: totalMatched || 0, icon: CheckCircle2, status: 'normal' as const },
            { label: 'معاملات غير متطابقة', value: totalUnmatched || 0, icon: XCircle, status: totalUnmatched > 0 ? 'attention' as const : 'zero' as const },
            { label: 'معاملات معلقة', value: totalPending || 0, icon: Clock, status: totalPending > 0 ? 'attention' as const : 'zero' as const },
        ]
    }, [bankFeedsData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'التسوية البنكية', href: '/dashboard/finance/reconciliation', isActive: true },
    ]

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
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="المالية" title="التسوية البنكية" type="reconciliation" stats={heroStats} />

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
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم أو رقم الحساب..."
                                            aria-label="بحث بالاسم أو رقم الحساب"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="active">نشط</SelectItem>
                                            <SelectItem value="inactive">غير نشط</SelectItem>
                                            <SelectItem value="disconnected">غير متصل</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Account Type Filter */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="نوع الحساب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الأنواع</SelectItem>
                                            <SelectItem value="checking">جاري</SelectItem>
                                            <SelectItem value="savings">توفير</SelectItem>
                                            <SelectItem value="credit">بطاقة ائتمان</SelectItem>
                                            <SelectItem value="loan">قرض</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Sort and clear */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lastReconciled">آخر تسوية</SelectItem>
                                            <SelectItem value="name">الاسم</SelectItem>
                                            <SelectItem value="balance">الرصيد</SelectItem>
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

                        {/* MAIN BANK FEEDS LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">الحسابات البنكية</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {bankFeeds.length} حساب
                                </Badge>
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الحسابات البنكية</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && bankFeeds.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Building2 className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد حسابات بنكية</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة حساب بنكي جديد</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/finance/reconciliation/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إضافة حساب بنكي
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Bank Feeds List */}
                                {!isLoading && !isError && bankFeeds.map((feed) => (
                                    <div key={feed.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(feed.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(feed.id)}
                                                        onCheckedChange={() => handleSelectBankFeed(feed.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                                                    <Building2 className="h-7 w-7" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{feed.accountName}</h4>
                                                        {getStatusBadge(feed.status)}
                                                        {getConnectionBadge(feed.isConnected)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{feed.bankName} • {feed.accountNumber}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewBankFeed(feed.id)}>
                                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditBankFeed(feed.id)}>
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                        تعديل البيانات
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteBankFeed(feed.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        حذف الحساب
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                {/* Reconciliation Stats */}
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                                        <span className="font-bold">{feed.matchedCount}</span>
                                                        <span className="text-slate-500">متطابقة</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-red-600">
                                                        <XCircle className="h-4 w-4" aria-hidden="true" />
                                                        <span className="font-bold">{feed.unmatchedCount}</span>
                                                        <span className="text-slate-500">غير متطابقة</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-amber-600">
                                                        <Clock className="h-4 w-4" aria-hidden="true" />
                                                        <span className="font-bold">{feed.pendingCount}</span>
                                                        <span className="text-slate-500">معلقة</span>
                                                    </div>
                                                </div>
                                                {/* Account Info */}
                                                <div className="flex items-center gap-3">
                                                    {getTypeBadge(feed.accountType)}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600">آخر تسوية</div>
                                                        <div className="font-medium text-navy text-sm">{feed.lastReconciledFormatted.arabic}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600">الرصيد</div>
                                                        <div className="font-bold text-navy text-sm">{feed.balance.toLocaleString()} {feed.currency}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/finance/reconciliation/${feed.id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    <ArrowRightLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                                                    التسوية
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع الحسابات
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <FinanceSidebar
                        context="reconciliation"
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
