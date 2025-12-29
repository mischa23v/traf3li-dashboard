import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2, CheckCircle2, XCircle, AlertTriangle,
  Play, Link2, Unlink, Plus, Save, FileText, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useInterCompanyReconciliation,
  useInterCompanyCompanies,
  useAutoMatchTransactions,
  useManualMatchTransactions,
  useUnmatchTransactions,
  useCreateAdjustmentEntry,
  useCompleteReconciliation,
  useApproveReconciliation,
  useCreateInterCompanyReconciliation,
} from '@/hooks/useInterCompany'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { AdjustmentEntry } from '@/services/interCompanyService'

interface InterCompanyReconciliationProps {
  reconciliationId?: string
  mode?: 'create' | 'view' | 'edit'
}

export default function InterCompanyReconciliation({
  reconciliationId,
  mode = 'view'
}: InterCompanyReconciliationProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Create mode state
  const [sourceFirmId, setSourceFirmId] = useState('')
  const [targetFirmId, setTargetFirmId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [currency, setCurrency] = useState('SAR')
  const [notes, setNotes] = useState('')

  // Adjustment dialog state
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<'source_adjustment' | 'target_adjustment' | 'exchange_rate_adjustment'>('source_adjustment')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [adjustmentDescription, setAdjustmentDescription] = useState('')

  // Manual match dialog state
  const [showManualMatchDialog, setShowManualMatchDialog] = useState(false)
  const [selectedSourceTxn, setSelectedSourceTxn] = useState('')
  const [selectedTargetTxn, setSelectedTargetTxn] = useState('')

  // API hooks
  const { data: companies } = useInterCompanyCompanies()
  const { data: reconciliation, isLoading } = useInterCompanyReconciliation(reconciliationId || '')
  const createMutation = useCreateInterCompanyReconciliation()
  const autoMatchMutation = useAutoMatchTransactions()
  const manualMatchMutation = useManualMatchTransactions()
  const unmatchMutation = useUnmatchTransactions()
  const createAdjustmentMutation = useCreateAdjustmentEntry()
  const completeMutation = useCompleteReconciliation()
  const approveMutation = useApproveReconciliation()

  const topNav = [
    { title: t('finance.interCompany.nav.finance'), href: '/finance' },
    { title: t('finance.interCompany.nav.interCompany'), href: '/finance/inter-company' },
    {
      title: t('finance.interCompany.nav.reconciliation'),
      isCurrentPage: true
    },
  ]

  // Statistics
  const stats = useMemo(() => {
    if (!reconciliation) return { matched: 0, unmatched: 0, adjustments: 0, totalMatched: 0 }

    return {
      matched: reconciliation.matchedTransactions?.length || 0,
      unmatched:
        (reconciliation.unmatchedSourceTransactions?.length || 0) +
        (reconciliation.unmatchedTargetTransactions?.length || 0),
      adjustments: reconciliation.adjustmentEntries?.length || 0,
      totalMatched: reconciliation.totalMatched || 0,
    }
  }, [reconciliation])

  const handleCreateReconciliation = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await createMutation.mutateAsync({
        sourceFirmId,
        targetFirmId,
        reconciliationPeriodStart: periodStart,
        reconciliationPeriodEnd: periodEnd,
        currency,
        notes: notes || undefined,
      })

      navigate({ to: `/finance/inter-company/reconciliation/${result._id}` })
    } catch (error) {
      console.error('Failed to create reconciliation:', error)
    }
  }

  const handleAutoMatch = async () => {
    if (!reconciliationId) return

    try {
      await autoMatchMutation.mutateAsync(reconciliationId)
    } catch (error) {
      console.error('Auto-match failed:', error)
    }
  }

  const handleManualMatch = async () => {
    if (!reconciliationId || !selectedSourceTxn || !selectedTargetTxn) return

    try {
      await manualMatchMutation.mutateAsync({
        reconciliationId,
        sourceTransactionId: selectedSourceTxn,
        targetTransactionId: selectedTargetTxn,
      })
      setShowManualMatchDialog(false)
      setSelectedSourceTxn('')
      setSelectedTargetTxn('')
    } catch (error) {
      console.error('Manual match failed:', error)
    }
  }

  const handleUnmatch = async (matchId: string) => {
    if (!reconciliationId) return

    try {
      await unmatchMutation.mutateAsync({ reconciliationId, matchId })
    } catch (error) {
      console.error('Unmatch failed:', error)
    }
  }

  const handleCreateAdjustment = async () => {
    if (!reconciliationId) return

    try {
      const adjustment: Omit<AdjustmentEntry, '_id' | 'createdAt'> = {
        type: adjustmentType,
        amount: parseFloat(adjustmentAmount),
        currency,
        reason: adjustmentReason,
        description: adjustmentDescription,
      }

      await createAdjustmentMutation.mutateAsync({ reconciliationId, adjustment })
      setShowAdjustmentDialog(false)
      setAdjustmentAmount('')
      setAdjustmentReason('')
      setAdjustmentDescription('')
    } catch (error) {
      console.error('Failed to create adjustment:', error)
    }
  }

  const handleComplete = async () => {
    if (!reconciliationId) return

    try {
      await completeMutation.mutateAsync(reconciliationId)
    } catch (error) {
      console.error('Failed to complete reconciliation:', error)
    }
  }

  const handleApprove = async () => {
    if (!reconciliationId) return

    try {
      await approveMutation.mutateAsync(reconciliationId)
    } catch (error) {
      console.error('Failed to approve reconciliation:', error)
    }
  }

  // Create mode
  if (mode === 'create') {
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
          <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">
              {t('finance.interCompany.reconciliation.newTitle')}
            </h1>

            <form onSubmit={handleCreateReconciliation}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('finance.interCompany.reconciliation.details')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Companies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sourceCompany">
                        {t('finance.interCompany.reconciliation.sourceCompany')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={sourceFirmId} onValueChange={setSourceFirmId} required>
                        <SelectTrigger id="sourceCompany">
                          <SelectValue placeholder={t('finance.interCompany.reconciliation.selectCompany')} />
                        </SelectTrigger>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company._id} value={company._id}>
                              {isArabic ? company.nameAr : company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetCompany">
                        {t('finance.interCompany.reconciliation.targetCompany')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={targetFirmId} onValueChange={setTargetFirmId} required>
                        <SelectTrigger id="targetCompany">
                          <SelectValue placeholder={t('finance.interCompany.reconciliation.selectCompany')} />
                        </SelectTrigger>
                        <SelectContent>
                          {companies
                            ?.filter(c => c._id !== sourceFirmId)
                            .map((company) => (
                              <SelectItem key={company._id} value={company._id}>
                                {isArabic ? company.nameAr : company.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="periodStart">
                        {t('finance.interCompany.reconciliation.periodStart')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="periodStart"
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periodEnd">
                        {t('finance.interCompany.reconciliation.periodEnd')}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="periodEnd"
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                        min={periodStart}
                        required
                      />
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">
                      {t('finance.interCompany.reconciliation.currency')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select value={currency} onValueChange={setCurrency} required>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['SAR', 'USD', 'EUR', 'GBP', 'AED'].map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('finance.interCompany.reconciliation.notes')}</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('finance.interCompany.reconciliation.additionalNotes')}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/finance/inter-company' })}
                >
                  {t('finance.interCompany.reconciliation.cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('finance.interCompany.reconciliation.createReconciliation')}
                </Button>
              </div>
            </form>
          </div>
        </Main>
      </>
    )
  }

  // View/Edit mode
  if (isLoading || !reconciliation) {
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

  const sourceCompany = reconciliation.sourceFirmId as any
  const targetCompany = reconciliation.targetFirmId as any

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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {t('finance.interCompany.reconciliation.title')}
                </h1>
                <Badge
                  variant={
                    reconciliation.status === 'approved' ? 'success' :
                    reconciliation.status === 'completed' ? 'default' :
                    reconciliation.status === 'in_progress' ? 'secondary' :
                    'outline'
                  }
                >
                  {reconciliation.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                {reconciliation.reconciliationNumber} • {' '}
                {isArabic ? sourceCompany.nameAr : sourceCompany.name} ↔ {' '}
                {isArabic ? targetCompany.nameAr : targetCompany.name}
              </p>
            </div>
            <div className="flex gap-2">
              {reconciliation.status === 'draft' || reconciliation.status === 'in_progress' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleAutoMatch}
                    disabled={autoMatchMutation.isPending}
                  >
                    {autoMatchMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {t('finance.interCompany.reconciliation.autoMatch')}
                  </Button>
                  <Button onClick={handleComplete} disabled={completeMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('finance.interCompany.reconciliation.complete')}
                  </Button>
                </>
              ) : reconciliation.status === 'completed' ? (
                <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('finance.interCompany.reconciliation.approve')}
                </Button>
              ) : null}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {t('finance.interCompany.reconciliation.matched')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.matched}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(stats.totalMatched, reconciliation.currency)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  {t('finance.interCompany.reconciliation.unmatched')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unmatched}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  {t('finance.interCompany.reconciliation.adjustments')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adjustments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {t('finance.interCompany.reconciliation.period')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {formatDate(reconciliation.reconciliationPeriodStart)}
                  <br />
                  {formatDate(reconciliation.reconciliationPeriodEnd)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="matched" className="space-y-4">
            <TabsList>
              <TabsTrigger value="matched">
                {t('finance.interCompany.reconciliation.matched')} ({stats.matched})
              </TabsTrigger>
              <TabsTrigger value="unmatched">
                {t('finance.interCompany.reconciliation.unmatched')} ({stats.unmatched})
              </TabsTrigger>
              <TabsTrigger value="adjustments">
                {t('finance.interCompany.reconciliation.adjustments')} ({stats.adjustments})
              </TabsTrigger>
            </TabsList>

            {/* Matched Transactions */}
            <TabsContent value="matched">
              <Card>
                <CardHeader>
                  <CardTitle>{t('finance.interCompany.reconciliation.matchedTransactions')}</CardTitle>
                  <CardDescription>
                    {t('finance.interCompany.reconciliation.matchedDesc')
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('finance.interCompany.reconciliation.sourceTxn')}</TableHead>
                        <TableHead>{t('finance.interCompany.reconciliation.targetTxn')}</TableHead>
                        <TableHead className="text-right">{t('finance.interCompany.reconciliation.amount')}</TableHead>
                        <TableHead>{t('finance.interCompany.reconciliation.matchType')}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciliation.matchedTransactions?.map((match: any, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {match.sourceTransactionId}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {match.targetTransactionId}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(match.amount, match.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={match.matchType === 'automatic' ? 'default' : 'secondary'}>
                              {match.matchType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnmatch(match._id || index.toString())}
                              disabled={reconciliation.status === 'approved'}
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Unmatched Transactions */}
            <TabsContent value="unmatched">
              <div className="space-y-4">
                {reconciliation.status !== 'approved' && (
                  <div className="flex justify-end">
                    <Button onClick={() => setShowManualMatchDialog(true)}>
                      <Link2 className="h-4 w-4 mr-2" />
                      {t('finance.interCompany.reconciliation.manualMatch')}
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {t('finance.interCompany.reconciliation.sourceTransactions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reconciliation.unmatchedSourceTransactions?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          {t('finance.interCompany.reconciliation.noUnmatchedTransactions')}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {reconciliation.unmatchedSourceTransactions?.map((txnId: string) => (
                            <div
                              key={txnId}
                              className="border rounded p-3 text-sm font-mono hover:bg-accent cursor-pointer"
                            >
                              {txnId}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {t('finance.interCompany.reconciliation.targetTransactions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {reconciliation.unmatchedTargetTransactions?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          {t('finance.interCompany.reconciliation.noUnmatchedTransactions')}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {reconciliation.unmatchedTargetTransactions?.map((txnId: string) => (
                            <div
                              key={txnId}
                              className="border rounded p-3 text-sm font-mono hover:bg-accent cursor-pointer"
                            >
                              {txnId}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Adjustment Entries */}
            <TabsContent value="adjustments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('finance.interCompany.reconciliation.adjustments')}</CardTitle>
                    <CardDescription>
                      {t('finance.interCompany.reconciliation.adjustmentEntriesDesc')
                      }
                    </CardDescription>
                  </div>
                  {reconciliation.status !== 'approved' && (
                    <Button onClick={() => setShowAdjustmentDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.interCompany.reconciliation.newEntry')}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {reconciliation.adjustmentEntries?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {t('finance.interCompany.reconciliation.noAdjustmentEntries')}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('finance.interCompany.reconciliation.type')}</TableHead>
                          <TableHead>{t('finance.interCompany.reconciliation.reason')}</TableHead>
                          <TableHead>{t('finance.interCompany.reconciliation.description')}</TableHead>
                          <TableHead className="text-right">{t('finance.interCompany.reconciliation.amount')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reconciliation.adjustmentEntries?.map((adjustment: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge variant="outline">
                                {adjustment.type.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{adjustment.reason}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {adjustment.description}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(adjustment.amount, adjustment.currency)}
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

      {/* Manual Match Dialog */}
      <Dialog open={showManualMatchDialog} onOpenChange={setShowManualMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('finance.interCompany.reconciliation.manualMatch')}
            </DialogTitle>
            <DialogDescription>
              {t('finance.interCompany.reconciliation.selectTransactionDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('finance.interCompany.reconciliation.sourceTransaction')}</Label>
              <Select value={selectedSourceTxn} onValueChange={setSelectedSourceTxn}>
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.interCompany.reconciliation.selectTransaction')} />
                </SelectTrigger>
                <SelectContent>
                  {reconciliation?.unmatchedSourceTransactions?.map((txnId: string) => (
                    <SelectItem key={txnId} value={txnId}>
                      {txnId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('finance.interCompany.reconciliation.targetTransaction')}</Label>
              <Select value={selectedTargetTxn} onValueChange={setSelectedTargetTxn}>
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.interCompany.reconciliation.selectTransaction')} />
                </SelectTrigger>
                <SelectContent>
                  {reconciliation?.unmatchedTargetTransactions?.map((txnId: string) => (
                    <SelectItem key={txnId} value={txnId}>
                      {txnId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualMatchDialog(false)}>
              {t('finance.interCompany.reconciliation.cancel')}
            </Button>
            <Button
              onClick={handleManualMatch}
              disabled={!selectedSourceTxn || !selectedTargetTxn || manualMatchMutation.isPending}
            >
              <Link2 className="h-4 w-4 mr-2" />
              {t('finance.interCompany.reconciliation.match')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('finance.interCompany.reconciliation.newAdjustmentEntry')}
            </DialogTitle>
            <DialogDescription>
              {t('finance.interCompany.reconciliation.createAdjustmentDesc')
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('finance.interCompany.reconciliation.adjustmentType')}</Label>
              <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="source_adjustment">
                    {t('finance.interCompany.reconciliation.sourceAdjustment')}
                  </SelectItem>
                  <SelectItem value="target_adjustment">
                    {t('finance.interCompany.reconciliation.targetAdjustment')}
                  </SelectItem>
                  <SelectItem value="exchange_rate_adjustment">
                    {t('finance.interCompany.reconciliation.exchangeRateAdjustment')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('finance.interCompany.reconciliation.amount')}</Label>
              <Input
                type="number"
                step="0.01"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('finance.interCompany.reconciliation.reason')}</Label>
              <Input
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder={t('finance.interCompany.reconciliation.adjustmentReason')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('finance.interCompany.reconciliation.description')}</Label>
              <Textarea
                value={adjustmentDescription}
                onChange={(e) => setAdjustmentDescription(e.target.value)}
                placeholder={t('finance.interCompany.reconciliation.detailedDescription')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
              {t('finance.interCompany.reconciliation.cancel')}
            </Button>
            <Button
              onClick={handleCreateAdjustment}
              disabled={!adjustmentAmount || !adjustmentReason || createAdjustmentMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {t('finance.interCompany.reconciliation.createEntry')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
