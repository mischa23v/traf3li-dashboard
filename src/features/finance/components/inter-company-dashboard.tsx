import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2, ArrowRightLeft, TrendingUp, TrendingDown,
  FileText, Plus, Search, Download, RefreshCw, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useInterCompanyTransactions,
  useInterCompanyBalances,
  useInterCompanyReconciliations,
  useExportInterCompanyReport,
} from '@/hooks/useInterCompany'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'

export default function InterCompanyDashboard() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('SAR')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // API hooks
  const { data: transactionsData, isLoading: transactionsLoading } = useInterCompanyTransactions({
    limit: 10,
    status: selectedStatus !== 'all' ? selectedStatus : undefined
  })
  const { data: balanceMatrix, isLoading: balancesLoading } = useInterCompanyBalances(selectedCurrency)
  const { data: reconciliationsData, isLoading: reconciliationsLoading } = useInterCompanyReconciliations({
    limit: 5
  })
  const exportMutation = useExportInterCompanyReport()

  const topNav = [
    { title: t('finance.interCompany.nav.finance'), href: ROUTES.dashboard.finance.overview },
    {
      title: t('finance.interCompany.nav.interCompany'),
      isCurrentPage: true
    },
  ]

  // Calculate statistics
  const stats = useMemo(() => {
    if (!balanceMatrix) return {
      totalReceivable: 0,
      totalPayable: 0,
      netBalance: 0,
      transactionCount: transactionsData?.total || 0
    }

    const totalReceivable = balanceMatrix.balances?.reduce((sum, b) => sum + (b.receivable || 0), 0) || 0
    const totalPayable = balanceMatrix.balances?.reduce((sum, b) => sum + (b.payable || 0), 0) || 0

    return {
      totalReceivable,
      totalPayable,
      netBalance: totalReceivable - totalPayable,
      transactionCount: transactionsData?.total || 0
    }
  }, [balanceMatrix, transactionsData])

  const isLoading = transactionsLoading || balancesLoading

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    exportMutation.mutate({
      reportType: 'transactions',
      format,
      filters: { status: selectedStatus !== 'all' ? selectedStatus : undefined }
    })
  }

  return (
    <>
      <Header>
        <TopNav items={topNav} />
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <FinanceSidebar context="inter-company" />

      <Main>
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                {t('finance.interCompany.dashboard.title')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('finance.interCompany.dashboard.subtitle')
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('finance.interCompany.dashboard.export')}
              </Button>
              <Button onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.new })}>
                <Plus className="h-4 w-4 mr-2" />
                {t('finance.interCompany.dashboard.newTransaction')}
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {t('finance.interCompany.dashboard.totalTransactions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.transactionCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('finance.interCompany.dashboard.activeTransactions')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {t('finance.interCompany.dashboard.totalReceivables')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(stats.totalReceivable, selectedCurrency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('finance.interCompany.dashboard.dueToCompanies')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    {t('finance.interCompany.dashboard.totalPayables')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(stats.totalPayable, selectedCurrency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('finance.interCompany.dashboard.dueFromCompanies')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                    {t('finance.interCompany.dashboard.netBalance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(stats.netBalance), selectedCurrency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.netBalance >= 0
                      ? (t('finance.interCompany.dashboard.netReceivable'))
                      : (t('finance.interCompany.dashboard.netPayable'))
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.balances })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t('finance.interCompany.dashboard.balanceMatrix')}
                </CardTitle>
                <CardDescription>
                  {t('finance.interCompany.dashboard.balanceMatrixDesc')
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.reconciliation })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {t('finance.interCompany.dashboard.reconciliations')}
                </CardTitle>
                <CardDescription>
                  {t('finance.interCompany.dashboard.reconciliationsDesc')
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.new })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-primary" />
                  {t('finance.interCompany.dashboard.newTransaction')}
                </CardTitle>
                <CardDescription>
                  {t('finance.interCompany.dashboard.newTransactionDesc')
                  }
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Transactions and Reconciliations */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions">
                {t('finance.interCompany.dashboard.recentTransactions')}
              </TabsTrigger>
              <TabsTrigger value="reconciliations">
                {t('finance.interCompany.dashboard.reconciliations')}
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('finance.interCompany.dashboard.recentTransactions')}</CardTitle>
                    <div className="flex gap-2">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('finance.interCompany.common.all')}</SelectItem>
                          <SelectItem value="draft">{t('finance.interCompany.common.draft')}</SelectItem>
                          <SelectItem value="posted">{t('finance.interCompany.common.posted')}</SelectItem>
                          <SelectItem value="reconciled">{t('finance.interCompany.common.reconciled')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.list })}
                      >
                        {t('finance.interCompany.dashboard.viewAll')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('finance.interCompany.balances.date')}</TableHead>
                          <TableHead>{t('finance.interCompany.common.from')}</TableHead>
                          <TableHead>{t('finance.interCompany.common.to')}</TableHead>
                          <TableHead>{t('finance.interCompany.balances.type')}</TableHead>
                          <TableHead>{t('finance.interCompany.balances.description')}</TableHead>
                          <TableHead className="text-right">{t('finance.interCompany.balances.amount')}</TableHead>
                          <TableHead>{t('finance.interCompany.balances.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionsData?.transactions?.slice(0, 10).map((transaction: any) => (
                          <TableRow
                            key={transaction._id}
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.detail(transaction._id) })}
                          >
                            <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                            <TableCell>
                              {typeof transaction.sourceFirmId === 'object'
                                ? (isArabic ? transaction.sourceFirmId.nameAr : transaction.sourceFirmId.name)
                                : transaction.sourceFirmId
                              }
                            </TableCell>
                            <TableCell>
                              {typeof transaction.targetFirmId === 'object'
                                ? (isArabic ? transaction.targetFirmId.nameAr : transaction.targetFirmId.name)
                                : transaction.targetFirmId
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {isArabic
                                  ? transaction.transactionType === 'invoice' ? 'فاتورة'
                                  : transaction.transactionType === 'payment' ? 'دفعة'
                                  : transaction.transactionType === 'expense' ? 'مصروف'
                                  : 'تحويل'
                                  : transaction.transactionType
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.status === 'posted' ? 'default' :
                                  transaction.status === 'reconciled' ? 'success' :
                                  'secondary'
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reconciliations Tab */}
            <TabsContent value="reconciliations">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('finance.interCompany.dashboard.recentReconciliations')}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.reconciliation })}
                    >
                      {t('finance.interCompany.dashboard.viewAll')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {reconciliationsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('finance.interCompany.common.number')}</TableHead>
                          <TableHead>{t('finance.interCompany.common.companies')}</TableHead>
                          <TableHead>{t('finance.interCompany.common.period')}</TableHead>
                          <TableHead>{t('finance.interCompany.reconciliation.matched')}</TableHead>
                          <TableHead>{t('finance.interCompany.reconciliation.unmatched')}</TableHead>
                          <TableHead>{t('finance.interCompany.balances.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconciliationsData?.reconciliations?.slice(0, 5).map((reconciliation: any) => (
                          <TableRow
                            key={reconciliation._id}
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => navigate({ to: ROUTES.dashboard.finance.interCompany.reconciliationDetail(reconciliation._id) })}
                          >
                            <TableCell className="font-mono text-sm">
                              {reconciliation.reconciliationNumber}
                            </TableCell>
                            <TableCell>
                              {typeof reconciliation.sourceFirmId === 'object'
                                ? (isArabic ? reconciliation.sourceFirmId.nameAr : reconciliation.sourceFirmId.name)
                                : ''
                              }
                              {' ↔ '}
                              {typeof reconciliation.targetFirmId === 'object'
                                ? (isArabic ? reconciliation.targetFirmId.nameAr : reconciliation.targetFirmId.name)
                                : ''
                              }
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(reconciliation.reconciliationPeriodStart)} - {formatDate(reconciliation.reconciliationPeriodEnd)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {reconciliation.matchedTransactions?.length || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                {(reconciliation.unmatchedSourceTransactions?.length || 0) +
                                 (reconciliation.unmatchedTargetTransactions?.length || 0)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  reconciliation.status === 'approved' ? 'success' :
                                  reconciliation.status === 'completed' ? 'default' :
                                  'secondary'
                                }
                              >
                                {reconciliation.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
