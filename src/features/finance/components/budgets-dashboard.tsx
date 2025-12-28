/**
 * Budgets Dashboard
 * Main view for budget management with list, filters, and statistics
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Send,
  Filter,
  Download,
  Copy,
  Trash2,
  MoreVertical,
  Eye,
  Edit,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { DynamicIsland } from '@/components/dynamic-island'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { ROUTES } from '@/constants/routes'
import { useBudgets, useBudgetStats, useDeleteBudget } from '@/hooks/useBudgets'
import type { BudgetStatus, BudgetFilters } from '@/types/budget'
import { cn } from '@/lib/utils'

export function BudgetsDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [filters, setFilters] = useState<BudgetFilters>({
    page: 1,
    limit: 10,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Data fetching
  const { data: budgetsData, isLoading: isLoadingBudgets } = useBudgets(filters)
  const { data: statsData, isLoading: isLoadingStats } = useBudgetStats(filters.fiscalYear)
  const deleteBudgetMutation = useDeleteBudget()

  const budgets = budgetsData?.budgets || []
  const stats = statsData?.stats

  // Budget status configuration
  const statusConfig: Record<
    BudgetStatus,
    { label: string; labelAr: string; color: string; icon: any }
  > = {
    draft: {
      label: 'Draft',
      labelAr: 'مسودة',
      color: 'gray',
      icon: FileText,
    },
    submitted: {
      label: 'Submitted',
      labelAr: 'مقدمة',
      color: 'blue',
      icon: Send,
    },
    approved: {
      label: 'Approved',
      labelAr: 'معتمدة',
      color: 'purple',
      icon: CheckCircle,
    },
    active: {
      label: 'Active',
      labelAr: 'نشطة',
      color: 'emerald',
      icon: Check,
    },
    closed: {
      label: 'Closed',
      labelAr: 'مغلقة',
      color: 'slate',
      icon: X,
    },
    cancelled: {
      label: 'Cancelled',
      labelAr: 'ملغاة',
      color: 'red',
      icon: X,
    },
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format percentage
  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof BudgetFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }

  // Handle selection
  const toggleSelection = (id: string) => {
    setSelectedBudgets((prev) =>
      prev.includes(id) ? prev.filter((budgetId) => budgetId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedBudgets.length === budgets.length) {
      setSelectedBudgets([])
    } else {
      setSelectedBudgets(budgets.map((b) => b._id))
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await deleteBudgetMutation.mutateAsync(id)
    }
  }

  return (
    <>
      <Header />
      <TopNav />
      <DynamicIsland />

      <Main>
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          {/* Hero Section */}
          <ProductivityHero
            title={t('finance.budgets.title', 'Budget Management')}
            titleAr="إدارة الميزانيات"
            description={t(
              'finance.budgets.description',
              'Manage budgets, track spending, and control costs'
            )}
            descriptionAr="إدارة الميزانيات وتتبع الإنفاق والتحكم في التكاليف"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Statistics Cards */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Budgeted */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {isRTL ? 'إجمالي الميزانية' : 'Total Budgeted'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            formatCurrency(stats?.totalBudgeted || 0)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {stats?.totalBudgets || 0} {isRTL ? 'ميزانية' : 'budgets'}
                        </p>
                      </div>
                      <Wallet className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Total Actual */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {isRTL ? 'الإنفاق الفعلي' : 'Total Actual'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-2xl font-bold">
                          {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            formatCurrency(stats?.totalActual || 0)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {stats?.overallVariancePercent
                            ? formatPercent(stats.overallVariancePercent)
                            : '0%'}{' '}
                          {isRTL ? 'مستخدم' : 'used'}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Available */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {isRTL ? 'المتاح' : 'Available'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            formatCurrency(stats?.totalAvailable || 0)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? 'متاح للإنفاق' : 'Available to spend'}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Committed */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {isRTL ? 'المرتبط' : 'Committed'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {isLoadingStats ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            formatCurrency(stats?.totalCommitted || 0)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? 'التزامات معلقة' : 'Pending commitments'}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      {isRTL ? 'التصفية' : 'Filters'}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 me-2" />
                        {isRTL ? 'تصدير' : 'Export'}
                      </Button>
                      <Button asChild>
                        <Link to={ROUTES.dashboard.finance.budgets.new}>
                          {isRTL ? 'ميزانية جديدة' : 'New Budget'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <Input
                      placeholder={isRTL ? 'بحث...' : 'Search...'}
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />

                    {/* Fiscal Year */}
                    <Select
                      value={filters.fiscalYear || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('fiscalYear', value === 'all' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? 'السنة المالية' : 'Fiscal Year'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'جميع السنوات' : 'All Years'}</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Status */}
                    <Select
                      value={filters.status as string || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('status', value === 'all' ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {isRTL ? config.labelAr : config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({ page: 1, limit: 10 })
                        setSearchTerm('')
                      }}
                    >
                      {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Budgets Table */}
              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'الميزانيات' : 'Budgets'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBudgets ? (
                    <div className="flex h-48 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : budgets.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center text-center">
                      <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-lg font-medium">
                        {isRTL ? 'لا توجد ميزانيات' : 'No budgets found'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'ابدأ بإنشاء ميزانية جديدة' : 'Start by creating a new budget'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isSelectionMode && (
                              <TableHead className="w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedBudgets.length === budgets.length}
                                  onChange={toggleSelectAll}
                                  className="cursor-pointer"
                                />
                              </TableHead>
                            )}
                            <TableHead>{isRTL ? 'الرقم' : 'Number'}</TableHead>
                            <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                            <TableHead>{isRTL ? 'السنة المالية' : 'Fiscal Year'}</TableHead>
                            <TableHead>{isRTL ? 'المخصص' : 'Budgeted'}</TableHead>
                            <TableHead>{isRTL ? 'الفعلي' : 'Actual'}</TableHead>
                            <TableHead>{isRTL ? 'التقدم' : 'Progress'}</TableHead>
                            <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                            <TableHead className="text-center">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {budgets.map((budget) => {
                            const config = statusConfig[budget.status]
                            const StatusIcon = config.icon
                            const utilizationPercent =
                              budget.totalBudgeted > 0
                                ? (budget.totalActual / budget.totalBudgeted) * 100
                                : 0

                            return (
                              <TableRow key={budget._id}>
                                {isSelectionMode && (
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      checked={selectedBudgets.includes(budget._id)}
                                      onChange={() => toggleSelection(budget._id)}
                                      className="cursor-pointer"
                                    />
                                  </TableCell>
                                )}
                                <TableCell className="font-medium">
                                  {budget.budgetNumber}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {isRTL ? budget.nameAr : budget.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {budget.period === 'yearly' && (isRTL ? 'سنوي' : 'Yearly')}
                                      {budget.period === 'quarterly' &&
                                        (isRTL ? 'ربع سنوي' : 'Quarterly')}
                                      {budget.period === 'monthly' && (isRTL ? 'شهري' : 'Monthly')}
                                      {budget.period === 'half_yearly' &&
                                        (isRTL ? 'نصف سنوي' : 'Half Yearly')}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{budget.fiscalYear}</TableCell>
                                <TableCell>{formatCurrency(budget.totalBudgeted, budget.currency)}</TableCell>
                                <TableCell>{formatCurrency(budget.totalActual, budget.currency)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={utilizationPercent}
                                      className="h-2 w-24"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {formatPercent(utilizationPercent)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      config.color === 'emerald' && 'border-emerald-500 text-emerald-700',
                                      config.color === 'blue' && 'border-blue-500 text-blue-700',
                                      config.color === 'purple' && 'border-purple-500 text-purple-700',
                                      config.color === 'amber' && 'border-amber-500 text-amber-700',
                                      config.color === 'gray' && 'border-gray-500 text-gray-700',
                                      config.color === 'slate' && 'border-slate-500 text-slate-700',
                                      config.color === 'red' && 'border-red-500 text-red-700'
                                    )}
                                  >
                                    <StatusIcon className="h-3 w-3 me-1" />
                                    {isRTL ? config.labelAr : config.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      asChild
                                    >
                                      <Link to={ROUTES.dashboard.finance.budgets.detail(budget._id)}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    {budget.status === 'draft' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                        >
                                          <Link to={ROUTES.dashboard.finance.budgets.edit(budget._id)}>
                                            <Edit className="h-4 w-4" />
                                          </Link>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDelete(budget._id)}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <FinanceSidebar
                context="budgets"
                isSelectionMode={isSelectionMode}
                onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
                selectedCount={selectedBudgets.length}
              />
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
