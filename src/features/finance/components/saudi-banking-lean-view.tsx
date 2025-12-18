import { useState, useMemo, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Link } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search, Bell, AlertCircle, Landmark, CreditCard, Plus, MoreHorizontal,
    ChevronLeft, Eye, Trash2, RefreshCw, TrendingUp, TrendingDown, ArrowUpRight,
    ArrowDownRight, Building2, Wallet, Clock, CheckCircle, XCircle, Link2Off,
    ExternalLink, Filter, X, Calendar
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    useLeanBanks,
    useLeanCustomers,
    useLeanEntities,
    useLeanTransactions,
    useCreateLeanCustomer,
    useDisconnectLeanEntity,
    type LeanBank,
    type LeanEntity,
    type LeanAccount,
    type LeanTransaction
} from '@/hooks/useSaudiBanking'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

// Sidebar Component
function LeanSidebar({ onConnectBank }: { onConnectBank: () => void }) {
    const { data: banksData } = useLeanBanks()
    const banks = banksData?.data || []

    return (
        <div className="space-y-6">
            {/* Connect Bank Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">ربط حساب جديد</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-4">
                        اربط حسابك البنكي للاطلاع على الأرصدة والمعاملات
                    </p>
                    <Button onClick={onConnectBank} className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
                        <Plus className="h-4 w-4 ms-2" />
                        ربط حساب بنكي
                    </Button>
                </CardContent>
            </Card>

            {/* Supported Banks Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                        البنوك المدعومة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {banks.slice(0, 8).map((bank: LeanBank) => (
                            <div key={bank.bankId} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                    <Landmark className="h-4 w-4 text-navy" />
                                </div>
                                <span className="text-xs font-medium text-slate-700 truncate">{bank.nameAr || bank.name}</span>
                            </div>
                        ))}
                    </div>
                    {banks.length > 8 && (
                        <p className="text-xs text-slate-500 text-center mt-3">
                            + {banks.length - 8} بنك آخر
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Help Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-gradient-to-br from-emerald-500 to-emerald-600">
                <CardContent className="p-6 text-white">
                    <Landmark className="h-10 w-10 mb-4 text-white/80" />
                    <h3 className="font-bold text-lg mb-2">Open Banking</h3>
                    <p className="text-sm text-white/80 mb-4">
                        تقنية Lean تتيح لك ربط حساباتك البنكية بشكل آمن ومشفر
                    </p>
                    <Button variant="secondary" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 ms-2" />
                        معرفة المزيد
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export function SaudiBankingLeanView() {
    const [activeTab, setActiveTab] = useState('accounts')
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

    const [typeFilter, setTypeFilter] = useState('all')

    // Fetch data
    const { data: customersData, isLoading: loadingCustomers, isError, error, refetch } = useLeanCustomers()
    const { data: banksData } = useLeanBanks()

    // Get transactions for selected account
    const { data: transactionsData, isLoading: loadingTransactions } = useLeanTransactions(selectedAccountId || '')

    // Mutations
    const createCustomerMutation = useCreateLeanCustomer()
    const disconnectMutation = useDisconnectLeanEntity()

    // Mock data for demo (replace with actual API data)
    const accounts: LeanAccount[] = useMemo(() => {
        // In real implementation, flatten accounts from all entities
        return [
            {
                accountId: '1',
                accountNumber: '1234567890',
                iban: 'SA0380000000608010167519',
                type: 'CURRENT',
                currency: 'SAR',
                balance: 125000,
                availableBalance: 120000,
                lastUpdated: new Date().toISOString(),
            },
            {
                accountId: '2',
                accountNumber: '9876543210',
                iban: 'SA0310000000000000000001',
                type: 'SAVINGS',
                currency: 'SAR',
                balance: 50000,
                availableBalance: 50000,
                lastUpdated: new Date().toISOString(),
            },
        ]
    }, [customersData])

    const transactions: LeanTransaction[] = useMemo(() => {
        return transactionsData?.data || [
            {
                transactionId: '1',
                accountId: '1',
                amount: 5000,
                currency: 'SAR',
                type: 'CREDIT',
                category: 'تحويل',
                description: 'تحويل من حساب التوفير',
                transactionDate: new Date().toISOString(),
                status: 'COMPLETED',
            },
            {
                transactionId: '2',
                accountId: '1',
                amount: 1500,
                currency: 'SAR',
                type: 'DEBIT',
                category: 'مشتريات',
                description: 'جرير للتقنية',
                merchantName: 'Jarir Bookstore',
                transactionDate: new Date(Date.now() - 86400000).toISOString(),
                status: 'COMPLETED',
            },
            {
                transactionId: '3',
                accountId: '1',
                amount: 350,
                currency: 'SAR',
                type: 'DEBIT',
                category: 'مطاعم',
                description: 'ماكدونالدز',
                merchantName: 'McDonalds',
                transactionDate: new Date(Date.now() - 172800000).toISOString(),
                status: 'COMPLETED',
            },
        ]
    }, [transactionsData])

    // Hero stats
    const heroStats = useMemo(() => {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
        const linkedAccounts = accounts.length

        return [
            { label: 'إجمالي الرصيد', value: `${totalBalance.toLocaleString()} ر.س`, icon: Wallet, status: 'normal' as const },
            { label: 'حسابات مربوطة', value: linkedAccounts, icon: CreditCard, status: 'normal' as const },
            { label: 'معاملات اليوم', value: 5, icon: TrendingUp, status: 'normal' as const },
            { label: 'آخر تحديث', value: 'الآن', icon: RefreshCw, status: 'normal' as const },
        ]
    }, [accounts])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
    ]

    const handleConnectBank = () => {
        // TODO: Initialize Lean LinkSDK
        // In real implementation:
        // 1. Create customer if not exists
        // 2. Get customer token
        // 3. Initialize LinkSDK with token
    }

    const handleDisconnect = (entityId: string, customerId: string) => {
        if (confirm('هل أنت متأكد من إلغاء ربط هذا الحساب؟')) {
            disconnectMutation.mutate({ customerId, entityId })
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'decimal', minimumFractionDigits: 2 }).format(amount)
    }

    const isLoading = loadingCustomers

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
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/finance/saudi-banking" className="text-slate-500 hover:text-emerald-600">
                        الخدمات المصرفية
                    </Link>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                    <span className="text-navy font-medium">ربط الحسابات البنكية</span>
                </div>

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="Lean Technologies" title="ربط الحسابات البنكية" type="finance" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <CardHeader className="pb-0">
                                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                                        <TabsTrigger value="accounts" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6">
                                            الحسابات
                                        </TabsTrigger>
                                        <TabsTrigger value="transactions" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6">
                                            المعاملات
                                        </TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {/* Accounts Tab */}
                                    <TabsContent value="accounts" className="m-0">
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="bg-slate-50 rounded-2xl p-6">
                                                        <div className="flex gap-4 mb-4">
                                                            <Skeleton className="w-14 h-14 rounded-xl" />
                                                            <div className="flex-1 space-y-2">
                                                                <Skeleton className="h-6 w-3/4" />
                                                                <Skeleton className="h-4 w-1/2" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : isError ? (
                                            <div className="text-center py-12">
                                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold text-navy mb-2">حدث خطأ</h3>
                                                <p className="text-slate-500 mb-4">{error?.message}</p>
                                                <Button onClick={() => refetch()} variant="outline">
                                                    إعادة المحاولة
                                                </Button>
                                            </div>
                                        ) : accounts.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Landmark className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold text-navy mb-2">لا توجد حسابات مربوطة</h3>
                                                <p className="text-slate-500 mb-4">اربط حسابك البنكي للبدء</p>
                                                <Button onClick={handleConnectBank} className="bg-emerald-500 hover:bg-emerald-600">
                                                    <Plus className="h-4 w-4 ms-2" />
                                                    ربط حساب بنكي
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {accounts.map((account) => (
                                                    <div key={account.accountId} className="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition-all">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex gap-4">
                                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                                    <Landmark className="h-7 w-7 text-emerald-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-navy text-lg">
                                                                        حساب {account.type === 'CURRENT' ? 'جاري' : account.type === 'SAVINGS' ? 'توفير' : 'ائتماني'}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-500 font-mono" dir="ltr">
                                                                        {account.iban}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-5 w-5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => setSelectedAccountId(account.accountId)}>
                                                                        <Eye className="h-4 w-4 ms-2" />
                                                                        عرض المعاملات
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <RefreshCw className="h-4 w-4 ms-2" />
                                                                        تحديث الرصيد
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <Link2Off className="h-4 w-4 ms-2" />
                                                                        إلغاء الربط
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-white rounded-xl p-4">
                                                                <p className="text-sm text-slate-500 mb-1">الرصيد الحالي</p>
                                                                <p className="text-2xl font-bold text-navy">
                                                                    {formatCurrency(account.balance)} <span className="text-sm font-normal">ر.س</span>
                                                                </p>
                                                            </div>
                                                            <div className="bg-white rounded-xl p-4">
                                                                <p className="text-sm text-slate-500 mb-1">الرصيد المتاح</p>
                                                                <p className="text-2xl font-bold text-emerald-600">
                                                                    {formatCurrency(account.availableBalance)} <span className="text-sm font-normal">ر.س</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                <Clock className="h-4 w-4" />
                                                                آخر تحديث: {format(new Date(account.lastUpdated), 'dd/MM/yyyy HH:mm')}
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedAccountId(account.accountId)
                                                                    setActiveTab('transactions')
                                                                }}
                                                            >
                                                                عرض المعاملات
                                                                <ChevronLeft className="h-4 w-4 me-1" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Transactions Tab */}
                                    <TabsContent value="transactions" className="m-0">
                                        {/* Filters */}
                                        <div className="flex flex-wrap gap-3 mb-6">
                                            <div className="relative flex-1 min-w-[200px]">
                                                <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    placeholder="بحث في المعاملات..."
                                                    defaultValue={searchQuery}
                                                    onChange={(e) => debouncedSetSearch(e.target.value)}
                                                    className="pe-10 rounded-xl"
                                                />
                                            </div>
                                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                                <SelectTrigger className="w-[150px] rounded-xl">
                                                    <SelectValue placeholder="نوع المعاملة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">الكل</SelectItem>
                                                    <SelectItem value="CREDIT">إيداع</SelectItem>
                                                    <SelectItem value="DEBIT">سحب</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {loadingTransactions ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <Skeleton key={i} className="h-20 rounded-xl" />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {transactions.map((tx) => (
                                                    <div key={tx.transactionId} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                                            {tx.type === 'CREDIT' ? (
                                                                <ArrowDownRight className="h-5 w-5 text-emerald-600" />
                                                            ) : (
                                                                <ArrowUpRight className="h-5 w-5 text-red-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-navy">{tx.description}</p>
                                                            <p className="text-sm text-slate-500">
                                                                {tx.category} • {format(new Date(tx.transactionDate), 'd MMM yyyy', { locale: arSA })}
                                                            </p>
                                                        </div>
                                                        <div className="text-start">
                                                            <p className={`font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)} ر.س
                                                            </p>
                                                            <Badge variant="outline" className={tx.status === 'COMPLETED' ? 'text-emerald-600' : 'text-yellow-600'}>
                                                                {tx.status === 'COMPLETED' ? 'مكتملة' : 'معلقة'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <LeanSidebar onConnectBank={handleConnectBank} />
                </div>
            </Main>
        </>
    )
}
