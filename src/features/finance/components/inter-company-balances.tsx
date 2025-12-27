import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/useLanguage'
import {
  Building2, TrendingUp, TrendingDown, ArrowRight,
  FileText, RefreshCw, Download, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useInterCompanyBalances,
  useInterCompanyTransactionsBetween,
  useExportInterCompanyReport,
} from '@/hooks/useInterCompany'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { InterCompanyBalance } from '@/services/interCompanyService'

export default function InterCompanyBalances() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const [selectedCurrency, setSelectedCurrency] = useState<string>('SAR')
  const [selectedBalance, setSelectedBalance] = useState<InterCompanyBalance | null>(null)
  const [showTransactionsDialog, setShowTransactionsDialog] = useState(false)

  // API hooks
  const { data: balanceMatrix, isLoading, refetch } = useInterCompanyBalances(selectedCurrency)
  const { data: transactionsData, isLoading: transactionsLoading } = useInterCompanyTransactionsBetween(
    selectedBalance?.sourceFirmId || '',
    selectedBalance?.targetFirmId || '',
    { status: 'posted' }
  )
  const exportMutation = useExportInterCompanyReport()

  const topNav = [
    { title: t('finance.interCompany.nav.finance'), href: '/finance' },
    { title: t('finance.interCompany.nav.interCompany'), href: '/finance/inter-company' },
    {
      title: t('finance.interCompany.nav.balances'),
      isCurrentPage: true
    },
  ]

  // Build matrix data
  const { companies, matrix } = useMemo(() => {
    if (!balanceMatrix) return { companies: [], matrix: [] }

    const companies = balanceMatrix.companies || []
    const balances = balanceMatrix.balances || []

    // Create matrix: rows = source companies, cols = target companies
    const matrix = companies.map(sourceCompany => {
      const row = companies.map(targetCompany => {
        if (sourceCompany._id === targetCompany._id) {
          return null // Same company
        }

        // Find balance from source to target
        const balance = balances.find(
          b => b.sourceFirmId === sourceCompany._id && b.targetFirmId === targetCompany._id
        )

        return balance || null
      })
      return row
    })

    return { companies, matrix }
  }, [balanceMatrix])

  // Calculate totals for each company
  const companyTotals = useMemo(() => {
    if (!balanceMatrix) return {}

    const totals: Record<string, { receivable: number; payable: number; net: number }> = {}

    balanceMatrix.companies?.forEach(company => {
      const receivable = balanceMatrix.balances
        ?.filter(b => b.sourceFirmId === company._id)
        .reduce((sum, b) => sum + (b.receivable || 0), 0) || 0

      const payable = balanceMatrix.balances
        ?.filter(b => b.sourceFirmId === company._id)
        .reduce((sum, b) => sum + (b.payable || 0), 0) || 0

      totals[company._id] = {
        receivable,
        payable,
        net: receivable - payable
      }
    })

    return totals
  }, [balanceMatrix])

  const handleCellClick = (balance: InterCompanyBalance | null) => {
    if (balance && balance.transactionCount > 0) {
      setSelectedBalance(balance)
      setShowTransactionsDialog(true)
    }
  }

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    exportMutation.mutate({
      reportType: 'balances',
      format,
      filters: { currency: selectedCurrency }
    })
  }

  const renderBalanceCell = (balance: InterCompanyBalance | null) => {
    if (!balance) {
      return <div className="text-center text-muted-foreground">-</div>
    }

    const netBalance = balance.netBalance || 0

    return (
      <button
        onClick={() => handleCellClick(balance)}
        className="w-full text-left hover:bg-accent/50 rounded p-2 transition-colors"
        disabled={balance.transactionCount === 0}
      >
        <div className="space-y-1">
          {/* Net Balance */}
          <div className={`font-semibold ${netBalance > 0 ? 'text-green-600' : netBalance < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
            {formatCurrency(Math.abs(netBalance), balance.currency)}
          </div>

          {/* Receivable/Payable Indicator */}
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {netBalance > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-600" />
                {t('finance.interCompany.balances.receivable')}
              </>
            ) : netBalance < 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-red-600" />
                {t('finance.interCompany.balances.payable')}
              </>
            ) : (
              <span>{t('finance.interCompany.balances.balanced')}</span>
            )}
          </div>

          {/* Transaction Count */}
          {balance.transactionCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {balance.transactionCount} {t('finance.interCompany.balances.trans')}
            </Badge>
          )}
        </div>
      </button>
    )
  }

  if (isLoading) {
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

        <FinanceSidebar />

        <Main>
          <div className="container mx-auto p-6">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </Main>
      </>
    )
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

      <FinanceSidebar />

      <Main>
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                {t('finance.interCompany.balances.title')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('finance.interCompany.balances.subtitle')
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('finance.interCompany.balances.refresh')}
              </Button>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {balanceMatrix?.currencies?.map(curr => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  )) || (
                    <SelectItem value="SAR">SAR</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('finance.interCompany.balances.export')}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {t('finance.interCompany.balances.totalReceivables')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    Object.values(companyTotals).reduce((sum, t) => sum + t.receivable, 0),
                    selectedCurrency
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {t('finance.interCompany.balances.totalPayables')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    Object.values(companyTotals).reduce((sum, t) => sum + t.payable, 0),
                    selectedCurrency
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {t('finance.interCompany.balances.netBalance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  Object.values(companyTotals).reduce((sum, t) => sum + t.net, 0) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatCurrency(
                    Math.abs(Object.values(companyTotals).reduce((sum, t) => sum + t.net, 0)),
                    selectedCurrency
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t('finance.interCompany.balances.balanceMatrix')}
              </CardTitle>
              <CardDescription>
                {t('finance.interCompany.balances.clickToView')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40 font-bold">
                        {t('finance.interCompany.balances.fromTo')}
                      </TableHead>
                      {companies.map(company => (
                        <TableHead key={company._id} className="text-center min-w-32">
                          <div className="font-semibold">
                            {isArabic ? company.nameAr : company.name}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {company.code}
                          </Badge>
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-bold min-w-32">
                        {t('finance.interCompany.balances.total')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((sourceCompany, rowIndex) => (
                      <TableRow key={sourceCompany._id}>
                        <TableCell className="font-semibold">
                          <div>{isArabic ? sourceCompany.nameAr : sourceCompany.name}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {sourceCompany.code}
                          </Badge>
                        </TableCell>
                        {matrix[rowIndex]?.map((balance, colIndex) => (
                          <TableCell
                            key={`${rowIndex}-${colIndex}`}
                            className="text-center p-2"
                          >
                            {balance === null && rowIndex === colIndex ? (
                              <div className="bg-muted/50 rounded p-2 text-muted-foreground">
                                -
                              </div>
                            ) : (
                              renderBalanceCell(balance)
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold bg-muted/50">
                          <div className="space-y-1">
                            <div className={`${
                              companyTotals[sourceCompany._id]?.net >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {formatCurrency(
                                Math.abs(companyTotals[sourceCompany._id]?.net || 0),
                                selectedCurrency
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {companyTotals[sourceCompany._id]?.net >= 0
                                ? (t('finance.interCompany.balances.receivable'))
                                : (t('finance.interCompany.balances.payable'))
                              }
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          {balanceMatrix?.lastUpdated && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {t('finance.interCompany.balances.lastUpdated')}{' '}
              {formatDate(balanceMatrix.lastUpdated)}
            </p>
          )}
        </div>
      </Main>

      {/* Transactions Dialog */}
      <Dialog open={showTransactionsDialog} onOpenChange={setShowTransactionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('finance.interCompany.balances.transactionsBetween')}
            </DialogTitle>
            <DialogDescription>
              {selectedBalance && (
                <div className="flex items-center gap-2 mt-2">
                  <span>
                    {isArabic
                      ? (selectedBalance.sourceCompany as any).nameAr
                      : (selectedBalance.sourceCompany as any).name
                    }
                  </span>
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    {isArabic
                      ? (selectedBalance.targetCompany as any).nameAr
                      : (selectedBalance.targetCompany as any).name
                    }
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {transactionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.interCompany.balances.date')}</TableHead>
                    <TableHead>{t('finance.interCompany.balances.type')}</TableHead>
                    <TableHead>{t('finance.interCompany.balances.description')}</TableHead>
                    <TableHead className="text-right">{t('finance.interCompany.balances.amount')}</TableHead>
                    <TableHead>{t('finance.interCompany.balances.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsData?.transactions?.map((transaction: any) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
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
                      <TableCell>{transaction.description}</TableCell>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
