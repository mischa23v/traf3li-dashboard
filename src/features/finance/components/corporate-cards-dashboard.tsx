import { useState, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
    CreditCard, TrendingUp, AlertCircle, CheckCircle, XCircle, FileText,
    Upload, Download, Plus, Search, Filter, Eye, Ban, Unlock,
    PieChart, BarChart3, Calendar, DollarSign, Users, ShoppingBag, Bell
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    useCorporateCards,
    useCardStatistics,
    useSpendingByCategory,
    useMonthlySpendingTrend,
    useUnreconciledTransactions,
    useBlockCorporateCard,
    useUnblockCorporateCard,
} from '@/hooks/useCorporateCards'
import { CARD_STATUSES, CARD_TYPES } from '@/features/finance/types/corporate-card-types'

export function CorporateCardsDashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    // Fetch data
    const { data: cardsData, isLoading: loadingCards } = useCorporateCards()
    const { data: statistics, isLoading: loadingStats } = useCardStatistics()
    const { data: spendingByCategory } = useSpendingByCategory()
    const { data: monthlyTrend } = useMonthlySpendingTrend(undefined, 6)
    const { data: unreconciledTransactions } = useUnreconciledTransactions()

    const blockCardMutation = useBlockCorporateCard()
    const unblockCardMutation = useUnblockCorporateCard()

    const isLoading = loadingCards || loadingStats

    // Filter cards
    const filteredCards = useMemo(() => {
        if (!cardsData?.cards) return []

        return cardsData.cards.filter(card => {
            const matchesSearch = card.cardholderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.cardNumber.includes(searchQuery)
            const matchesStatus = statusFilter === 'all' || card.status === statusFilter
            const matchesType = typeFilter === 'all' || card.cardType === typeFilter

            return matchesSearch && matchesStatus && matchesType
        })
    }, [cardsData, searchQuery, statusFilter, typeFilter])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' ر.س'
    }

    const getCardIcon = (type: string) => {
        const icons: Record<string, any> = {
            visa: CreditCard,
            mastercard: CreditCard,
            amex: CreditCard,
            mada: CreditCard,
        }
        return icons[type] || CreditCard
    }

    const getStatusColor = (status: string) => {
        const statusConfig = CARD_STATUSES.find(s => s.value === status)
        return statusConfig?.color || 'gray'
    }

    const getStatusBadgeVariant = (color: string) => {
        const variants: Record<string, any> = {
            green: 'default',
            red: 'destructive',
            yellow: 'warning',
            gray: 'secondary',
            orange: 'warning',
        }
        return variants[color] || 'default'
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'البطاقات الائتمانية', href: '/dashboard/finance/corporate-cards', isActive: true },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
    ]

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
                        <input
                            type="text"
                            placeholder="بحث في البطاقات..."
                            defaultValue={searchQuery}
                            onChange={(e) => debouncedSetSearch(e.target.value)}
                            className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        {(unreconciledTransactions && unreconciledTransactions.length > 0) && (
                            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                        )}
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* Loading State */}
                {isLoading ? (
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        <Skeleton className="h-64 w-full rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-32 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        {/* Hero Section */}
                        <ProductivityHero
                            badge="البطاقات الائتمانية"
                            title="إدارة وتطابق البطاقات الائتمانية للشركة"
                            type="corporate-cards"
                        />

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Cards */}
                            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium">إجمالي البطاقات</p>
                                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                                {statistics?.totalCards || 0}
                                            </p>
                                            <p className="text-xs text-emerald-600 mt-1">
                                                {statistics?.activeCards || 0} نشط
                                            </p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-2xl">
                                            <CreditCard className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Monthly Spend */}
                            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium">الإنفاق الشهري</p>
                                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                                {formatCurrency(statistics?.monthlySpend || 0)}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <TrendingUp className="h-3 w-3 text-green-600" />
                                                <p className="text-xs text-green-600">+12.5%</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-2xl">
                                            <DollarSign className="h-6 w-6 text-emerald-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Unreconciled Transactions */}
                            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium">معاملات غير متطابقة</p>
                                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                                {statistics?.unReconciledTransactions || 0}
                                            </p>
                                            <Link to="/dashboard/finance/corporate-cards/reconcile" className="text-xs text-amber-600 hover:underline mt-1 inline-block">
                                                عرض وتطابق
                                            </Link>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-2xl">
                                            <AlertCircle className="h-6 w-6 text-amber-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Disputed Transactions */}
                            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium">معاملات متنازع عليها</p>
                                            <p className="text-3xl font-bold text-slate-800 mt-2">
                                                {statistics?.disputedTransactions || 0}
                                            </p>
                                            <p className="text-xs text-red-600 mt-1">يتطلب انتباه</p>
                                        </div>
                                        <div className="p-3 bg-red-50 rounded-2xl">
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Spending by Category */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <PieChart className="h-5 w-5 text-purple-600" />
                                        الإنفاق حسب الفئة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {spendingByCategory?.slice(0, 5).map((category, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-700">{category.category}</span>
                                                    <span className="font-semibold">{formatCurrency(category.amount)}</span>
                                                </div>
                                                <Progress value={category.percentage} className="h-2" />
                                                <span className="text-xs text-slate-500">{category.percentage.toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Monthly Trend */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        الاتجاه الشهري للإنفاق
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {monthlyTrend?.map((month, index) => {
                                            const maxAmount = Math.max(...(monthlyTrend?.map(m => m.amount) || [1]))
                                            const percentage = (month.amount / maxAmount) * 100
                                            return (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-700">{month.month}</span>
                                                        <span className="font-semibold">{formatCurrency(month.amount)}</span>
                                                    </div>
                                                    <Progress value={percentage} className="h-2" />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Action Buttons & Filters */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <Link to="/dashboard/finance/corporate-cards/new">
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                                        <Plus className="h-4 w-4 ms-2" />
                                        إضافة بطاقة جديدة
                                    </Button>
                                </Link>
                                <Button variant="outline" className="rounded-xl">
                                    <Upload className="h-4 w-4 ms-2" />
                                    استيراد معاملات
                                </Button>
                                <Button variant="outline" className="rounded-xl">
                                    <Download className="h-4 w-4 ms-2" />
                                    تصدير تقرير
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[150px] rounded-xl">
                                        <SelectValue placeholder="الحالة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">كل الحالات</SelectItem>
                                        {CARD_STATUSES.map(status => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[150px] rounded-xl">
                                        <SelectValue placeholder="النوع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">كل الأنواع</SelectItem>
                                        {CARD_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Cards List */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">البطاقات الائتمانية ({filteredCards.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredCards.map(card => {
                                        const CardIcon = getCardIcon(card.cardType)
                                        const statusColor = getStatusColor(card.status)
                                        const statusConfig = CARD_STATUSES.find(s => s.value === card.status)
                                        const typeConfig = CARD_TYPES.find(t => t.value === card.cardType)

                                        return (
                                            <div key={card._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl bg-${statusColor}-50`}>
                                                        <CardIcon className={`h-6 w-6 text-${statusColor}-600`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-slate-800">{card.cardholderName}</h3>
                                                            <Badge variant={getStatusBadgeVariant(statusColor)}>
                                                                {statusConfig?.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                            <span>•••• {card.cardNumber}</span>
                                                            <span>•</span>
                                                            <span>{typeConfig?.label}</span>
                                                            <span>•</span>
                                                            <span>ينتهي: {card.expiryDate}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-left">
                                                        <p className="text-sm text-slate-500">الحد الائتماني</p>
                                                        <p className="font-semibold text-slate-800">{formatCurrency(card.creditLimit)}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm text-slate-500">الرصيد الحالي</p>
                                                        <p className="font-semibold text-slate-800">{formatCurrency(card.currentBalance)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/dashboard/finance/corporate-cards/${card._id}`}>
                                                            <Button variant="ghost" size="sm" className="rounded-lg">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link to={`/dashboard/finance/corporate-cards/${card._id}/reconcile`}>
                                                            <Button variant="ghost" size="sm" className="rounded-lg">
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {card.status === 'active' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => blockCardMutation.mutate({ id: card._id })}
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </Button>
                                                        ) : card.status === 'blocked' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => unblockCardMutation.mutate(card._id)}
                                                            >
                                                                <Unlock className="h-4 w-4" />
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {filteredCards.length === 0 && (
                                        <div className="text-center py-12">
                                            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500">لا توجد بطاقات</p>
                                            <Link to="/dashboard/finance/corporate-cards/new">
                                                <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                                                    <Plus className="h-4 w-4 ms-2" />
                                                    إضافة بطاقة جديدة
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Main>
        </>
    )
}
