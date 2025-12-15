import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Search, Filter, Plus, MoreHorizontal, AlertCircle, Loader2, Bell,
    Edit, Trash2, ChevronRight, ChevronDown, Download, Upload, Printer,
    Eye, EyeOff, List as ListIcon, Network, FolderTree
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts, useDeleteAccount, useAccountTypes } from '@/hooks/useAccounting'
import { FinanceSidebar } from './finance-sidebar'
import { formatCurrency } from '@/lib/currency'
import { AccountFormDialog } from './account-form-dialog'
import { type Account, type AccountType, type AccountSubType } from '@/services/accountingService'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AccountNode extends Account {
    children?: AccountNode[]
}

type ViewMode = 'tree' | 'list'

export default function ChartOfAccountsView() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const [viewMode, setViewMode] = useState<ViewMode>('tree')
    const [activeTab, setActiveTab] = useState<'all' | AccountType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentAccount, setCurrentAccount] = useState<Account | undefined>(undefined)
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
    const [showInactive, setShowInactive] = useState(false)

    // Fetch accounts and account types
    const { data: accountsData, isLoading, isError, error, refetch } = useAccounts()
    const { data: accountTypes } = useAccountTypes()
    const deleteAccountMutation = useDeleteAccount()

    // Build account tree structure
    const accountTree = useMemo(() => {
        if (!accountsData?.accounts) return []

        const accounts = accountsData.accounts
        const accountMap = new Map<string, AccountNode>()
        const rootAccounts: AccountNode[] = []

        // Create a map of all accounts
        accounts.forEach((account: Account) => {
            accountMap.set(account._id, { ...account, children: [] })
        })

        // Build tree structure
        accounts.forEach((account: Account) => {
            const node = accountMap.get(account._id)!
            if (account.parentAccountId && accountMap.has(account.parentAccountId)) {
                const parent = accountMap.get(account.parentAccountId)!
                if (!parent.children) parent.children = []
                parent.children.push(node)
            } else {
                rootAccounts.push(node)
            }
        })

        return rootAccounts
    }, [accountsData])

    // Filter accounts based on tab and search
    const filteredAccounts = useMemo(() => {
        if (!accountsData?.accounts) return []

        let filtered = accountsData.accounts

        // Filter by active status
        if (!showInactive) {
            filtered = filtered.filter((account: Account) => account.isActive)
        }

        // Filter by account type
        if (activeTab !== 'all') {
            filtered = filtered.filter((account: Account) => account.type === activeTab)
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter((account: Account) =>
                account.code?.toLowerCase().includes(query) ||
                account.name?.toLowerCase().includes(query) ||
                account.nameAr?.toLowerCase().includes(query) ||
                account.description?.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [accountsData, activeTab, searchQuery, showInactive])

    // Filter tree based on search and filters
    const filteredTree = useMemo(() => {
        if (!searchQuery && activeTab === 'all' && !showInactive) return accountTree

        const filterNode = (node: AccountNode): AccountNode | null => {
            const matchesType = activeTab === 'all' || node.type === activeTab
            const matchesSearch = !searchQuery ||
                node.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                node.nameAr?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesActive = showInactive || node.isActive

            const filteredChildren = (node.children || [])
                .map(child => filterNode(child))
                .filter(Boolean) as AccountNode[]

            if (matchesType && matchesSearch && matchesActive) {
                return { ...node, children: filteredChildren }
            }

            if (filteredChildren.length > 0) {
                return { ...node, children: filteredChildren }
            }

            return null
        }

        return accountTree.map(node => filterNode(node)).filter(Boolean) as AccountNode[]
    }, [accountTree, activeTab, searchQuery, showInactive])

    // Calculate statistics
    const stats = useMemo(() => {
        const allAccounts = accountsData?.accounts || []
        const totalAccounts = allAccounts.length
        const activeAccounts = allAccounts.filter((a: Account) => a.isActive).length
        const inactiveAccounts = allAccounts.filter((a: Account) => !a.isActive).length

        const assetAccounts = allAccounts.filter((a: Account) => a.type === 'asset').length
        const liabilityAccounts = allAccounts.filter((a: Account) => a.type === 'liability').length
        const equityAccounts = allAccounts.filter((a: Account) => a.type === 'equity').length
        const incomeAccounts = allAccounts.filter((a: Account) => a.type === 'income').length
        const expenseAccounts = allAccounts.filter((a: Account) => a.type === 'expense').length

        const totalAssets = allAccounts
            .filter((a: Account) => a.type === 'asset')
            .reduce((sum: number, a: Account) => sum + (a.balance || 0), 0)
        const totalLiabilities = allAccounts
            .filter((a: Account) => a.type === 'liability')
            .reduce((sum: number, a: Account) => sum + (a.balance || 0), 0)
        const totalEquity = allAccounts
            .filter((a: Account) => a.type === 'equity')
            .reduce((sum: number, a: Account) => sum + (a.balance || 0), 0)

        return {
            totalAccounts,
            activeAccounts,
            inactiveAccounts,
            assetAccounts,
            liabilityAccounts,
            equityAccounts,
            incomeAccounts,
            expenseAccounts,
            totalAssets,
            totalLiabilities,
            totalEquity,
        }
    }, [accountsData])

    // Get account type color
    const getAccountTypeColor = (type: AccountType) => {
        const colors = {
            asset: 'bg-blue-100 text-blue-700',
            liability: 'bg-red-100 text-red-700',
            equity: 'bg-purple-100 text-purple-700',
            income: 'bg-green-100 text-green-700',
            expense: 'bg-orange-100 text-orange-700',
        }
        return colors[type] || 'bg-gray-100 text-gray-700'
    }

    // Get account type label
    const getAccountTypeLabel = (type: AccountType) => {
        const labels = {
            asset: isRTL ? 'أصول' : 'Asset',
            liability: isRTL ? 'التزامات' : 'Liability',
            equity: isRTL ? 'حقوق ملكية' : 'Equity',
            income: isRTL ? 'إيرادات' : 'Income',
            expense: isRTL ? 'مصروفات' : 'Expense',
        }
        return labels[type] || type
    }

    // Toggle node expansion
    const toggleNode = (nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId)
            } else {
                newSet.add(nodeId)
            }
            return newSet
        })
    }

    // Expand all nodes
    const expandAll = () => {
        const getAllIds = (nodes: AccountNode[]): string[] => {
            return nodes.flatMap(node => [
                node._id,
                ...(node.children ? getAllIds(node.children) : [])
            ])
        }
        setExpandedNodes(new Set(getAllIds(accountTree)))
    }

    // Collapse all nodes
    const collapseAll = () => {
        setExpandedNodes(new Set())
    }

    const handleEdit = (account: Account) => {
        setCurrentAccount(account)
        setIsAccountDialogOpen(true)
    }

    const handleDelete = (account: Account) => {
        setCurrentAccount(account)
        setIsDeleteDialogOpen(true)
    }

    const handleCreate = () => {
        setCurrentAccount(undefined)
        setIsAccountDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!currentAccount) return

        try {
            await deleteAccountMutation.mutateAsync(currentAccount._id)
            setIsDeleteDialogOpen(false)
            setCurrentAccount(undefined)
        } catch (error) {
            console.error('Failed to delete account:', error)
        }
    }

    // Export to CSV
    const handleExport = () => {
        if (!accountsData?.accounts) return

        const headers = ['Code', 'Name (EN)', 'Name (AR)', 'Type', 'SubType', 'Balance', 'Active']
        const rows = accountsData.accounts.map((account: Account) => [
            account.code,
            account.name,
            account.nameAr,
            account.type,
            account.subType,
            account.balance,
            account.isActive ? 'Yes' : 'No'
        ])

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `chart-of-accounts-${new Date().toISOString()}.csv`
        a.click()
        window.URL.revokeObjectURL(url)

        toast.success(isRTL ? 'تم التصدير بنجاح' : 'Exported successfully')
    }

    // Print chart of accounts
    const handlePrint = () => {
        window.print()
        toast.success(isRTL ? 'جاهز للطباعة' : 'Ready to print')
    }

    // Render account node in tree view
    const renderAccountNode = (node: AccountNode, level: number = 0) => {
        const isExpanded = expandedNodes.has(node._id)
        const hasChildren = node.children && node.children.length > 0
        const IndentComponent = level > 0 ? <div className="w-6" style={{ marginInlineStart: `${level * 24}px` }} /> : null

        return (
            <div key={node._id}>
                <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 group transition-colors",
                    !node.isActive && "opacity-50"
                )}>
                    {IndentComponent}

                    {hasChildren ? (
                        <button
                            onClick={() => toggleNode(node._id)}
                            className="p-1 hover:bg-slate-200 rounded"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-slate-600" />
                            ) : (
                                <ChevronRight className={cn("h-4 w-4 text-slate-600", isRTL && "rotate-180")} />
                            )}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-slate-600">{node.code}</span>
                                <span className="font-semibold text-slate-900">
                                    {isRTL ? node.nameAr : node.name}
                                </span>
                                {node.isSystemAccount && (
                                    <Badge variant="outline" className="text-xs">
                                        {isRTL ? 'نظام' : 'System'}
                                    </Badge>
                                )}
                            </div>
                            {node.description && (
                                <p className="text-xs text-slate-500 mt-1">{node.description}</p>
                            )}
                        </div>

                        <Badge className={getAccountTypeColor(node.type)}>
                            {getAccountTypeLabel(node.type)}
                        </Badge>

                        <div className="text-sm font-semibold text-slate-900 min-w-[100px] text-end">
                            {formatCurrency(node.balance || 0)}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => handleEdit(node)}>
                                    <Edit className="h-4 w-4 me-2" />
                                    {isRTL ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                {!node.isSystemAccount && (
                                    <DropdownMenuItem
                                        onClick={() => handleDelete(node)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 me-2" />
                                        {isRTL ? 'حذف' : 'Delete'}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children!.map(child => renderAccountNode(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    const topNav = [
        { title: isRTL ? 'نظرة عامة' : 'Overview', href: '/dashboard/finance/overview', isActive: false },
        { title: isRTL ? 'الفواتير' : 'Invoices', href: '/dashboard/finance/invoices', isActive: false },
        { title: isRTL ? 'دليل الحسابات' : 'Chart of Accounts', href: '/dashboard/finance/chart-of-accounts', isActive: true },
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
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-96 w-full rounded-3xl" />
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
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {isRTL ? 'فشل تحميل دليل الحسابات' : 'Failed to load Chart of Accounts'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {(error as Error)?.message || (isRTL ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading data')}
                        </p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" aria-hidden="true" />
                            {isRTL ? 'إعادة المحاولة' : 'Retry'}
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
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {isRTL ? 'إجمالي الحسابات' : 'Total Accounts'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{stats.totalAccounts}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.activeAccounts} {isRTL ? 'نشط' : 'active'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-blue-700">
                                {isRTL ? 'الأصول' : 'Assets'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-900">{stats.assetAccounts}</div>
                            <p className="text-xs text-blue-600 mt-1">{formatCurrency(stats.totalAssets)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-red-700">
                                {isRTL ? 'الالتزامات' : 'Liabilities'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-900">{stats.liabilityAccounts}</div>
                            <p className="text-xs text-red-600 mt-1">{formatCurrency(stats.totalLiabilities)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-purple-700">
                                {isRTL ? 'حقوق الملكية' : 'Equity'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-900">{stats.equityAccounts}</div>
                            <p className="text-xs text-purple-600 mt-1">{formatCurrency(stats.totalEquity)}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-green-700">
                                {isRTL ? 'الإيرادات والمصروفات' : 'Income & Expenses'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-green-900">{stats.incomeAccounts}</span>
                                <span className="text-slate-400">/</span>
                                <span className="text-2xl font-bold text-orange-900">{stats.expenseAccounts}</span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                                {isRTL ? 'إيرادات / مصروفات' : 'Income / Expenses'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Toolbar */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder={isRTL ? 'بحث عن حساب...' : 'Search accounts...'}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="ps-9"
                                    />
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'tree' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setViewMode('tree')}
                                        title={isRTL ? 'عرض شجري' : 'Tree View'}
                                    >
                                        <FolderTree className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setViewMode('list')}
                                        title={isRTL ? 'عرض قائمة' : 'List View'}
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Show Inactive Toggle */}
                                <Button
                                    variant="outline"
                                    onClick={() => setShowInactive(!showInactive)}
                                    className={cn(showInactive && "bg-slate-100")}
                                >
                                    {showInactive ? (
                                        <Eye className="h-4 w-4 me-2" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 me-2" />
                                    )}
                                    {isRTL ? 'غير نشط' : 'Inactive'}
                                </Button>

                                {/* Bulk Actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <MoreHorizontal className="h-4 w-4 me-2" />
                                            {isRTL ? 'المزيد' : 'More'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                        <DropdownMenuItem onClick={handleExport}>
                                            <Download className="h-4 w-4 me-2" />
                                            {isRTL ? 'تصدير CSV' : 'Export CSV'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handlePrint}>
                                            <Printer className="h-4 w-4 me-2" />
                                            {isRTL ? 'طباعة' : 'Print'}
                                        </DropdownMenuItem>
                                        {viewMode === 'tree' && (
                                            <>
                                                <DropdownMenuItem onClick={expandAll}>
                                                    <ChevronDown className="h-4 w-4 me-2" />
                                                    {isRTL ? 'توسيع الكل' : 'Expand All'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={collapseAll}>
                                                    <ChevronRight className="h-4 w-4 me-2" />
                                                    {isRTL ? 'طي الكل' : 'Collapse All'}
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Add Button */}
                                <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600">
                                    <Plus className="h-4 w-4 me-2" />
                                    {isRTL ? 'حساب جديد' : 'New Account'}
                                </Button>
                            </div>

                            {/* Type Filter Tabs */}
                            <div className="mt-4">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                    <TabsList className="w-full justify-start">
                                        <TabsTrigger value="all">
                                            {isRTL ? 'الكل' : 'All'}
                                        </TabsTrigger>
                                        <TabsTrigger value="asset">
                                            {isRTL ? 'أصول' : 'Assets'}
                                        </TabsTrigger>
                                        <TabsTrigger value="liability">
                                            {isRTL ? 'التزامات' : 'Liabilities'}
                                        </TabsTrigger>
                                        <TabsTrigger value="equity">
                                            {isRTL ? 'حقوق ملكية' : 'Equity'}
                                        </TabsTrigger>
                                        <TabsTrigger value="income">
                                            {isRTL ? 'إيرادات' : 'Income'}
                                        </TabsTrigger>
                                        <TabsTrigger value="expense">
                                            {isRTL ? 'مصروفات' : 'Expenses'}
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>

                        {/* Accounts List/Tree */}
                        <Card className="bg-white border-0 shadow-sm">
                            <CardContent className="p-6">
                                {viewMode === 'tree' ? (
                                    <div className="space-y-2">
                                        {filteredTree.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                <p>{isRTL ? 'لا توجد حسابات' : 'No accounts found'}</p>
                                            </div>
                                        ) : (
                                            filteredTree.map(node => renderAccountNode(node))
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAccounts.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                <ListIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                <p>{isRTL ? 'لا توجد حسابات' : 'No accounts found'}</p>
                                            </div>
                                        ) : (
                                            filteredAccounts.map((account: Account) => (
                                                <div key={account._id} className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 group transition-colors",
                                                    !account.isActive && "opacity-50"
                                                )}>
                                                    <div className="flex-1 flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-sm text-slate-600">{account.code}</span>
                                                                <span className="font-semibold text-slate-900">
                                                                    {isRTL ? account.nameAr : account.name}
                                                                </span>
                                                                {account.isSystemAccount && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {isRTL ? 'نظام' : 'System'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {account.description && (
                                                                <p className="text-xs text-slate-500 mt-1">{account.description}</p>
                                                            )}
                                                        </div>

                                                        <Badge className={getAccountTypeColor(account.type)}>
                                                            {getAccountTypeLabel(account.type)}
                                                        </Badge>

                                                        <div className="text-sm font-semibold text-slate-900 min-w-[100px] text-end">
                                                            {formatCurrency(account.balance || 0)}
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                                                <DropdownMenuItem onClick={() => handleEdit(account)}>
                                                                    <Edit className="h-4 w-4 me-2" />
                                                                    {isRTL ? 'تعديل' : 'Edit'}
                                                                </DropdownMenuItem>
                                                                {!account.isSystemAccount && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(account)}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 me-2" />
                                                                        {isRTL ? 'حذف' : 'Delete'}
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <FinanceSidebar context="chart-of-accounts" />
                    </div>
                </div>
            </Main>

            {/* Account Dialog */}
            <AccountFormDialog
                open={isAccountDialogOpen}
                onOpenChange={setIsAccountDialogOpen}
                account={currentAccount}
                accounts={accountsData?.accounts || []}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isRTL
                                ? `هل أنت متأكد من حذف الحساب "${currentAccount?.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
                                : `Are you sure you want to delete account "${currentAccount?.name}"? This action cannot be undone.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isRTL ? 'حذف' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
