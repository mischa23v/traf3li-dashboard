import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import {
  Search, Filter, Download, Calendar, FileText, TrendingUp,
  TrendingDown, ArrowUpDown, Eye, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { formatCurrency } from '@/lib/currency'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import generalLedgerService, { type GLEntry, type GLEntryFilters, type GLReferenceModel } from '@/services/generalLedgerService'
import { useAccounts } from '@/hooks/useAccounting'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export default function GeneralLedgerView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [referenceModelFilter, setReferenceModelFilter] = useState<GLReferenceModel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'posted' | 'voided'>('posted')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch accounts for filter
  const { data: accountsData } = useAccounts({ isActive: true })
  const accounts = accountsData?.accounts || []

  // Fetch GL entries
  const filters: GLEntryFilters = {
    page: currentPage,
    limit: 50,
    ...(accountFilter !== 'all' && { accountId: accountFilter }),
    ...(referenceModelFilter !== 'all' && { referenceModel: referenceModelFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['general-ledger-entries', filters],
    queryFn: () => generalLedgerService.getEntries(filters),
  })

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['general-ledger-stats', { startDate, endDate }],
    queryFn: () => generalLedgerService.getStats({ startDate, endDate }),
  })

  // Fetch summary
  const { data: summary } = useQuery({
    queryKey: ['general-ledger-summary', { startDate, endDate }],
    queryFn: () => generalLedgerService.getSummary({ startDate, endDate }),
  })

  // Filter entries by search
  const filteredEntries = data?.entries.filter((entry) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      entry.entryNumber.toLowerCase().includes(search) ||
      entry.description.toLowerCase().includes(search)
    )
  })

  // Calculate running balance
  let runningBalance = 0
  const entriesWithBalance = filteredEntries?.map((entry) => {
    entry.lines.forEach((line) => {
      runningBalance += line.debit - line.credit
    })
    return { ...entry, runningBalance }
  })

  // Get reference badge
  const getReferenceBadge = (model: GLReferenceModel) => {
    const variants = {
      Invoice: { color: 'bg-blue-500', label: t('gl.invoice', 'Invoice') },
      Payment: { color: 'bg-green-500', label: t('gl.payment', 'Payment') },
      Expense: { color: 'bg-orange-500', label: t('gl.expense', 'Expense') },
      Bill: { color: 'bg-purple-500', label: t('gl.bill', 'Bill') },
      JournalEntry: { color: 'bg-gray-500', label: t('gl.journal', 'Journal') },
    }
    const variant = variants[model]
    return <Badge className={cn('text-xs', variant.color)}>{variant.label}</Badge>
  }

  // Get account name
  const getAccountName = (accountId: string | any) => {
    if (typeof accountId === 'object') {
      return `${accountId.code} - ${isRTL && accountId.nameAr ? accountId.nameAr : accountId.name}`
    }
    const account = accounts.find((a) => a._id === accountId)
    if (account) {
      return `${account.code} - ${isRTL ? account.nameAr : account.name}`
    }
    return accountId
  }

  // Handle drill-down to source
  const handleDrillDown = (entry: GLEntry) => {
    switch (entry.referenceModel) {
      case 'Invoice':
        navigate({ to: `/dashboard/finance/invoices/${entry.referenceId}` })
        break
      case 'Payment':
        navigate({ to: `/dashboard/finance/payments/${entry.referenceId}` })
        break
      case 'Expense':
        navigate({ to: `/dashboard/finance/expenses/${entry.referenceId}` })
        break
      case 'Bill':
        navigate({ to: `/dashboard/finance/bills/${entry.referenceId}` })
        break
      case 'JournalEntry':
        navigate({ to: `/dashboard/finance/journal-entries/${entry.referenceId}` })
        break
    }
  }

  // Export to Excel/PDF (placeholder)
  const handleExport = (format: 'excel' | 'pdf') => {
    toast.info(t('gl.exportComingSoon', `Export to ${format.toUpperCase()} coming soon`))
  }

  return (
    <>
      <Header>
        <TopNav>
          <DynamicIsland />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </TopNav>
      </Header>
      <FinanceSidebar context="general-ledger" />
      <Main>
        <div className={cn('container mx-auto p-6 space-y-6', isRTL && 'rtl')}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('gl.title', 'General Ledger')}
              </h1>
              <p className="text-muted-foreground">
                {t('gl.subtitle', 'View all accounting transactions and entries')}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('gl.export', 'Export')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  {t('gl.exportExcel', 'Export to Excel')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  {t('gl.exportPDF', 'Export to PDF')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('gl.totalEntries', 'Total Entries')}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEntries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalPosted || 0} {t('gl.posted', 'posted')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('gl.totalDebit', 'Total Debits')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalDebit || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('gl.totalCredit', 'Total Credits')}
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalCredit || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('gl.balanced', 'Balanced')}
                </CardTitle>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.isBalanced ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-red-600">✗</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('gl.difference', 'Difference')}: {formatCurrency(Math.abs((stats?.totalDebit || 0) - (stats?.totalCredit || 0)))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary by Account Type */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle>{t('gl.summaryByType', 'Summary by Account Type')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(summary.byAccountType).map(([type, data]: [string, any]) => (
                    <div key={type} className="space-y-1">
                      <Label className="text-sm font-medium capitalize">{t(`accountType.${type}`, type)}</Label>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('gl.debit', 'Debit')}:</span>
                          <span className="font-mono">{formatCurrency(data.debit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('gl.credit', 'Credit')}:</span>
                          <span className="font-mono">{formatCurrency(data.credit)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>{t('gl.balance', 'Balance')}:</span>
                          <span className="font-mono">{formatCurrency(data.balance)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Label htmlFor="search">{t('gl.search', 'Search')}</Label>
                    <div className="relative">
                      <Search className={cn('absolute top-2.5 h-4 w-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                      <Input
                        id="search"
                        placeholder={t('gl.searchPlaceholder', 'Search entries...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(isRTL ? 'pr-9' : 'pl-9')}
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-[200px]">
                    <Label htmlFor="account">{t('gl.account', 'Account')}</Label>
                    <Select value={accountFilter} onValueChange={setAccountFilter}>
                      <SelectTrigger id="account">
                        <SelectValue placeholder={t('gl.allAccounts', 'All Accounts')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('gl.allAccounts', 'All Accounts')}</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account._id} value={account._id}>
                            {account.code} - {isRTL ? account.nameAr : account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <Label htmlFor="type">{t('gl.entryType', 'Entry Type')}</Label>
                    <Select value={referenceModelFilter} onValueChange={(value) => setReferenceModelFilter(value as any)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder={t('gl.allTypes', 'All Types')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('gl.allTypes', 'All Types')}</SelectItem>
                        <SelectItem value="Invoice">{t('gl.invoice', 'Invoice')}</SelectItem>
                        <SelectItem value="Payment">{t('gl.payment', 'Payment')}</SelectItem>
                        <SelectItem value="Expense">{t('gl.expense', 'Expense')}</SelectItem>
                        <SelectItem value="Bill">{t('gl.bill', 'Bill')}</SelectItem>
                        <SelectItem value="JournalEntry">{t('gl.journal', 'Journal Entry')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[150px]">
                    <Label htmlFor="status">{t('gl.status', 'Status')}</Label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('gl.allStatus', 'All')}</SelectItem>
                        <SelectItem value="posted">{t('gl.posted', 'Posted')}</SelectItem>
                        <SelectItem value="voided">{t('gl.voided', 'Voided')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Label htmlFor="startDate">{t('gl.startDate', 'Start Date')}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="endDate">{t('gl.endDate', 'End Date')}</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStartDate('')
                        setEndDate('')
                        setAccountFilter('all')
                        setReferenceModelFilter('all')
                        setStatusFilter('posted')
                        setSearchQuery('')
                      }}
                    >
                      {t('gl.clearFilters', 'Clear Filters')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entries Table */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">{t('common.error', 'Error loading data')}</p>
                </div>
              ) : entriesWithBalance && entriesWithBalance.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('gl.date', 'Date')}</TableHead>
                        <TableHead>{t('gl.entryNumber', 'Entry #')}</TableHead>
                        <TableHead>{t('gl.type', 'Type')}</TableHead>
                        <TableHead>{t('gl.description', 'Description')}</TableHead>
                        <TableHead>{t('gl.account', 'Account')}</TableHead>
                        <TableHead className="text-right">{t('gl.debit', 'Debit')}</TableHead>
                        <TableHead className="text-right">{t('gl.credit', 'Credit')}</TableHead>
                        <TableHead className="text-right">{t('gl.balance', 'Balance')}</TableHead>
                        <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entriesWithBalance.map((entry) => (
                        <>
                          {entry.lines.map((line, lineIndex) => (
                            <TableRow key={`${entry._id}-${lineIndex}`}>
                              {lineIndex === 0 && (
                                <>
                                  <TableCell rowSpan={entry.lines.length}>
                                    {format(new Date(entry.transactionDate), 'PP', {
                                      locale: isRTL ? ar : undefined,
                                    })}
                                  </TableCell>
                                  <TableCell rowSpan={entry.lines.length} className="font-medium">
                                    {entry.entryNumber}
                                  </TableCell>
                                  <TableCell rowSpan={entry.lines.length}>
                                    {getReferenceBadge(entry.referenceModel)}
                                  </TableCell>
                                  <TableCell rowSpan={entry.lines.length}>
                                    <div className="max-w-xs">
                                      <div className="font-medium truncate">{entry.description}</div>
                                      {entry.status === 'voided' && (
                                        <Badge variant="destructive" className="mt-1">
                                          {t('gl.voided', 'Voided')}
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                </>
                              )}
                              <TableCell className="text-sm">
                                {getAccountName(line.accountId)}
                                {line.description && (
                                  <div className="text-xs text-muted-foreground truncate">{line.description}</div>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                              </TableCell>
                              {lineIndex === 0 && (
                                <>
                                  <TableCell rowSpan={entry.lines.length} className="text-right font-mono font-bold">
                                    {formatCurrency(entry.runningBalance)}
                                  </TableCell>
                                  <TableCell rowSpan={entry.lines.length} className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDrillDown(entry)}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">{t('gl.noEntries', 'No entries found')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('gl.noEntriesDesc', 'Try adjusting your filters')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
