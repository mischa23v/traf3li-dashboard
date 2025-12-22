import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
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

export default function InterCompanyDashboard() {
  const navigate = useNavigate()
  const [isArabic, setIsArabic] = useState(true)
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
    { title: isArabic ? 'المالية' : 'Finance', href: '/finance' },
    {
      title: isArabic ? 'المعاملات بين الشركات' : 'Inter-Company',
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
                {isArabic ? 'المعاملات بين الشركات' : 'Inter-Company Transactions'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isArabic
                  ? 'إدارة المعاملات والأرصدة والتسويات بين شركات المجموعة'
                  : 'Manage transactions, balances, and reconciliations between group companies'
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
                {isArabic ? 'تصدير' : 'Export'}
              </Button>
              <Button onClick={() => navigate({ to: '/finance/inter-company/new' })}>
                <Plus className="h-4 w-4 mr-2" />
                {isArabic ? 'معاملة جديدة' : 'New Transaction'}
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
                    {isArabic ? 'إجمالي المعاملات' : 'Total Transactions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.transactionCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isArabic ? 'معاملة نشطة' : 'Active transactions'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {isArabic ? 'إجمالي المستحقات' : 'Total Receivables'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(stats.totalReceivable, selectedCurrency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isArabic ? 'مستحق للشركات' : 'Due to companies'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    {isArabic ? 'إجمالي المستحق الدفع' : 'Total Payables'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(stats.totalPayable, selectedCurrency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isArabic ? 'مستحق على الشركات' : 'Due from companies'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                    {isArabic ? 'صافي الرصيد' : 'Net Balance'}
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
                      ? (isArabic ? 'صافي مستحق' : 'Net receivable')
                      : (isArabic ? 'صافي مستحق الدفع' : 'Net payable')
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
              onClick={() => navigate({ to: '/finance/inter-company/balances' })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {isArabic ? 'مصفوفة الأرصدة' : 'Balance Matrix'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'عرض الأرصدة بين جميع الشركات في جدول تفاعلي'
                    : 'View balances between all companies in an interactive grid'
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => navigate({ to: '/finance/inter-company/reconciliation' })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {isArabic ? 'التسويات' : 'Reconciliations'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'مطابقة وتسوية المعاملات بين الشركات'
                    : 'Match and reconcile transactions between companies'
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => navigate({ to: '/finance/inter-company/new' })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-primary" />
                  {isArabic ? 'معاملة جديدة' : 'New Transaction'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'إنشاء معاملة جديدة بين شركتين'
                    : 'Create a new transaction between two companies'
                  }
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Transactions and Reconciliations */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions">
                {isArabic ? 'المعاملات الأخيرة' : 'Recent Transactions'}
              </TabsTrigger>
              <TabsTrigger value="reconciliations">
                {isArabic ? 'التسويات' : 'Reconciliations'}
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{isArabic ? 'المعاملات الأخيرة' : 'Recent Transactions'}</CardTitle>
                    <div className="flex gap-2">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                          <SelectItem value="draft">{isArabic ? 'مسودة' : 'Draft'}</SelectItem>
                          <SelectItem value="posted">{isArabic ? 'مرحلة' : 'Posted'}</SelectItem>
                          <SelectItem value="reconciled">{isArabic ? 'مسوّاة' : 'Reconciled'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: '/finance/inter-company' })}
                      >
                        {isArabic ? 'عرض الكل' : 'View All'}
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
                          <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                          <TableHead>{isArabic ? 'من' : 'From'}</TableHead>
                          <TableHead>{isArabic ? 'إلى' : 'To'}</TableHead>
                          <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                          <TableHead>{isArabic ? 'الوصف' : 'Description'}</TableHead>
                          <TableHead className="text-right">{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                          <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactionsData?.transactions?.slice(0, 10).map((transaction: any) => (
                          <TableRow
                            key={transaction._id}
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => navigate({ to: `/finance/inter-company/${transaction._id}` })}
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
                    <CardTitle>{isArabic ? 'التسويات الأخيرة' : 'Recent Reconciliations'}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: '/finance/inter-company/reconciliation' })}
                    >
                      {isArabic ? 'عرض الكل' : 'View All'}
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
                          <TableHead>{isArabic ? 'الرقم' : 'Number'}</TableHead>
                          <TableHead>{isArabic ? 'الشركات' : 'Companies'}</TableHead>
                          <TableHead>{isArabic ? 'الفترة' : 'Period'}</TableHead>
                          <TableHead>{isArabic ? 'المتطابقة' : 'Matched'}</TableHead>
                          <TableHead>{isArabic ? 'غير المتطابقة' : 'Unmatched'}</TableHead>
                          <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconciliationsData?.reconciliations?.slice(0, 5).map((reconciliation: any) => (
                          <TableRow
                            key={reconciliation._id}
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => navigate({ to: `/finance/inter-company/reconciliation/${reconciliation._id}` })}
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
