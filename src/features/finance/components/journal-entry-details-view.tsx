import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Save, FileText, AlertCircle, CheckCircle2, X, ArrowLeft,
  Plus, Trash2, FileCheck, XCircle, Copy, Paperclip, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'sonner'
import journalEntryService, { type JournalEntry, type JournalEntryLine, type UpdateJournalEntryData } from '@/services/journalEntryService'
import { useAccounts } from '@/hooks/useAccounting'
import { useMutation, useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { invalidateCache } from '@/lib/cache-invalidation'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface EditableLine {
  id: string
  accountId: string
  description: string
  debit: number
  credit: number
}

export default function JournalEntryDetailsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const entryId = params.id as string

  // State
  const [isEditing, setIsEditing] = useState(false)
  const [transactionDate, setTransactionDate] = useState('')
  const [description, setDescription] = useState('')
  const [memo, setMemo] = useState('')
  const [lines, setLines] = useState<EditableLine[]>([])
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [voidReason, setVoidReason] = useState('')

  // Fetch entry
  const { data: entry, isLoading, isError } = useQuery({
    queryKey: ['journal-entry', entryId],
    queryFn: () => journalEntryService.getEntry(entryId),
    enabled: !!entryId,
  })

  // Fetch accounts
  const { data: accountsData } = useAccounts({ isActive: true })
  const accounts = accountsData?.accounts || []

  // Initialize form when entry loads
  useEffect(() => {
    if (entry) {
      setTransactionDate(entry.transactionDate.split('T')[0])
      setDescription(entry.description)
      setMemo(entry.memo || '')
      setLines(
        entry.lines.map((line, index) => ({
          id: line._id || index.toString(),
          accountId: typeof line.accountId === 'string' ? line.accountId : line.accountId._id,
          description: line.description || '',
          debit: line.debit,
          credit: line.credit,
        }))
      )
    }
  }, [entry])

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: UpdateJournalEntryData) => journalEntryService.updateEntry(entryId, data),
    onSuccess: () => {
      invalidateCache.journalEntries.detail(entryId)
      invalidateCache.journalEntries.all()
      setIsEditing(false)
      toast.success(t('journal.updated', 'Entry updated successfully'))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.updateError', 'Failed to update entry'))
    },
  })

  const postMutation = useMutation({
    mutationFn: () => journalEntryService.postEntry(entryId),
    onSuccess: () => {
      invalidateCache.journalEntries.detail(entryId)
      invalidateCache.journalEntries.all()
      invalidateCache.finance.generalLedger()
      toast.success(t('journal.posted', 'Entry posted to general ledger'))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.postError', 'Failed to post entry'))
    },
  })

  const voidMutation = useMutation({
    mutationFn: (reason?: string) => journalEntryService.voidEntry(entryId, reason),
    onSuccess: () => {
      invalidateCache.journalEntries.detail(entryId)
      invalidateCache.journalEntries.all()
      invalidateCache.finance.generalLedger()
      setIsVoidDialogOpen(false)
      setVoidReason('')
      toast.success(t('journal.voided', 'Entry voided successfully'))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.voidError', 'Failed to void entry'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => journalEntryService.deleteEntry(entryId),
    onSuccess: () => {
      invalidateCache.journalEntries.all()
      toast.success(t('journal.deleted', 'Entry deleted successfully'))
      navigate({ to: '/dashboard/finance/journal-entries' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.deleteError', 'Failed to delete entry'))
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: () => journalEntryService.duplicateEntry(entryId),
    onSuccess: (data) => {
      invalidateCache.journalEntries.all()
      toast.success(t('journal.duplicated', 'Entry duplicated successfully'))
      navigate({ to: `/dashboard/finance/journal-entries/${data._id}` })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.duplicateError', 'Failed to duplicate entry'))
    },
  })

  // Calculate totals
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  const difference = totalDebit - totalCredit
  const isBalanced = Math.abs(difference) < 0.01 && totalDebit > 0

  // Handle line operations
  const addLine = () => {
    setLines([
      ...lines,
      { id: Date.now().toString(), accountId: '', description: '', debit: 0, credit: 0 },
    ])
  }

  const removeLine = (id: string) => {
    if (lines.length <= 2) {
      toast.error(t('journal.minLines', 'At least 2 lines are required'))
      return
    }
    setLines(lines.filter((line) => line.id !== id))
  }

  const updateLine = (id: string, field: keyof EditableLine, value: any) => {
    setLines(
      lines.map((line) => {
        if (line.id === id) {
          const updated = { ...line, [field]: value }
          if (field === 'debit' && value > 0) {
            updated.credit = 0
          } else if (field === 'credit' && value > 0) {
            updated.debit = 0
          }
          return updated
        }
        return line
      })
    )
  }

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isBalanced) {
      toast.error(t('journal.notBalanced', 'Entry must be balanced'))
      return
    }

    const validLines = lines.filter((line) => line.accountId && (line.debit > 0 || line.credit > 0))

    const data: UpdateJournalEntryData = {
      transactionDate,
      description,
      memo: memo || undefined,
      lines: validLines.map((line) => ({
        accountId: line.accountId,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description || undefined,
      })),
    }

    updateMutation.mutate(data)
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

  // Get status badge
  const getStatusBadge = () => {
    if (!entry) return null
    const variants = {
      draft: { color: 'bg-gray-500', label: t('status.draft', 'Draft') },
      pending: { color: 'bg-yellow-500', label: t('status.pending', 'Pending') },
      posted: { color: 'bg-green-500', label: t('status.posted', 'Posted') },
      voided: { color: 'bg-red-500', label: t('status.voided', 'Voided') },
    }
    const variant = variants[entry.status]
    return <Badge className={variant.color}>{variant.label}</Badge>
  }

  if (isLoading) {
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
        <FinanceSidebar context="journal-entries" />
        <Main>
          <div className="container mx-auto p-6 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </Main>
      </>
    )
  }

  if (isError || !entry) {
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
        <FinanceSidebar context="journal-entries" />
        <Main>
          <div className="container mx-auto p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">{t('journal.notFound', 'Entry not found')}</p>
              <Button
                className="mt-4"
                onClick={() => navigate({ to: '/dashboard/finance/journal-entries' })}
              >
                {t('journal.backToList', 'Back to List')}
              </Button>
            </div>
          </div>
        </Main>
      </>
    )
  }

  const canEdit = entry.status === 'draft'
  const canPost = entry.status === 'draft' && entry.isBalanced
  const canVoid = entry.status === 'posted'
  const canDelete = entry.status === 'draft'

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
      <FinanceSidebar context="journal-entries" />
      <Main>
        <div className={cn('container mx-auto p-6 space-y-6', isRTL && 'rtl')}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/dashboard/finance/journal-entries' })}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{entry.entryNumber}</h1>
                  {getStatusBadge()}
                </div>
                <p className="text-muted-foreground">{entry.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  {t('common.edit', 'Edit')}
                </Button>
              )}
              {canPost && (
                <Button onClick={() => postMutation.mutate()} disabled={postMutation.isPending}>
                  <FileCheck className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('journal.post', 'Post to GL')}
                </Button>
              )}
              {canVoid && (
                <Button onClick={() => setIsVoidDialogOpen(true)} variant="destructive">
                  <XCircle className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('journal.void', 'Void')}
                </Button>
              )}
              <Button onClick={() => duplicateMutation.mutate()} variant="outline">
                <Copy className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {t('common.duplicate', 'Duplicate')}
              </Button>
              {canDelete && (
                <Button onClick={() => setIsDeleteDialogOpen(true)} variant="outline">
                  <Trash2 className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('common.delete', 'Delete')}
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('journal.details', 'Entry Details')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">{t('journal.date', 'Transaction Date')}</Label>
                      <Input
                        id="date"
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{t('journal.description', 'Description')}</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memo">{t('journal.memo', 'Memo')}</Label>
                    <Textarea
                      id="memo"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('journal.lines', 'Journal Lines')}</CardTitle>
                    <Button type="button" onClick={addLine} size="sm" variant="outline">
                      <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                      {t('journal.addLine', 'Add Line')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">{t('journal.account', 'Account')}</TableHead>
                          <TableHead className="w-[30%]">{t('journal.lineDescription', 'Description')}</TableHead>
                          <TableHead className="w-[15%] text-right">{t('journal.debit', 'Debit')}</TableHead>
                          <TableHead className="w-[15%] text-right">{t('journal.credit', 'Credit')}</TableHead>
                          <TableHead className="w-[10%] text-right">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              <Select
                                value={line.accountId}
                                onValueChange={(value) => updateLine(line.id, 'accountId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts.map((account) => (
                                    <SelectItem key={account._id} value={account._id}>
                                      {account.code} - {isRTL ? account.nameAr : account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={line.description}
                                onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.debit || ''}
                                onChange={(e) => updateLine(line.id, 'debit', parseFloat(e.target.value) || 0)}
                                className="text-right font-mono"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.credit || ''}
                                onChange={(e) => updateLine(line.id, 'credit', parseFloat(e.target.value) || 0)}
                                className="text-right font-mono"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLine(line.id)}
                                disabled={lines.length <= 2}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/50">
                          <TableCell colSpan={2} className="text-right">
                            {t('journal.totals', 'Totals')}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(totalDebit)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(totalCredit)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isBalanced ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium text-green-700">
                              {t('journal.balanced', 'Entry is balanced')}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium text-yellow-700">
                              {t('journal.unbalanced', 'Entry is not balanced')}
                            </span>
                          </>
                        )}
                      </div>
                      {!isBalanced && totalDebit > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">{t('journal.difference', 'Difference')}: </span>
                          <span className="font-mono font-bold text-red-600">
                            {formatCurrency(Math.abs(difference))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    // Reset form
                    if (entry) {
                      setTransactionDate(entry.transactionDate.split('T')[0])
                      setDescription(entry.description)
                      setMemo(entry.memo || '')
                      setLines(
                        entry.lines.map((line, index) => ({
                          id: line._id || index.toString(),
                          accountId: typeof line.accountId === 'string' ? line.accountId : line.accountId._id,
                          description: line.description || '',
                          debit: line.debit,
                          credit: line.credit,
                        }))
                      )
                    }
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={!isBalanced || updateMutation.isPending}>
                  <Save className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('common.save', 'Save Changes')}
                </Button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('journal.details', 'Entry Details')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">{t('journal.entryNumber', 'Entry Number')}</Label>
                      <div className="font-medium">{entry.entryNumber}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('journal.date', 'Date')}</Label>
                      <div className="font-medium">
                        {format(new Date(entry.transactionDate), 'PPP', { locale: isRTL ? ar : undefined })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('journal.description', 'Description')}</Label>
                      <div className="font-medium">{entry.description}</div>
                    </div>
                    {entry.memo && (
                      <div>
                        <Label className="text-muted-foreground">{t('journal.memo', 'Memo')}</Label>
                        <div className="font-medium">{entry.memo}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('journal.auditInfo', 'Audit Information')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">{t('journal.createdBy', 'Created By')}</Label>
                      <div className="font-medium">
                        {typeof entry.createdBy === 'object'
                          ? `${entry.createdBy.firstName} ${entry.createdBy.lastName}`
                          : entry.createdBy}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('journal.createdAt', 'Created At')}</Label>
                      <div className="font-medium">
                        {format(new Date(entry.createdAt), 'PPP p', { locale: isRTL ? ar : undefined })}
                      </div>
                    </div>
                    {entry.postedBy && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">{t('journal.postedBy', 'Posted By')}</Label>
                          <div className="font-medium">
                            {typeof entry.postedBy === 'object'
                              ? `${entry.postedBy.firstName} ${entry.postedBy.lastName}`
                              : entry.postedBy}
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">{t('journal.postedAt', 'Posted At')}</Label>
                          <div className="font-medium">
                            {entry.postedAt && format(new Date(entry.postedAt), 'PPP p', { locale: isRTL ? ar : undefined })}
                          </div>
                        </div>
                      </>
                    )}
                    {entry.status === 'voided' && entry.voidReason && (
                      <div>
                        <Label className="text-muted-foreground">{t('journal.voidReason', 'Void Reason')}</Label>
                        <div className="font-medium">{entry.voidReason}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('journal.lines', 'Journal Lines')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('journal.account', 'Account')}</TableHead>
                        <TableHead>{t('journal.lineDescription', 'Description')}</TableHead>
                        <TableHead className="text-right">{t('journal.debit', 'Debit')}</TableHead>
                        <TableHead className="text-right">{t('journal.credit', 'Credit')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{getAccountName(line.accountId)}</TableCell>
                          <TableCell>{line.description || '-'}</TableCell>
                          <TableCell className="text-right font-mono">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2} className="text-right">
                          {t('journal.totals', 'Totals')}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(entry.totalDebit)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(entry.totalCredit)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {entry.attachments && entry.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('journal.attachments', 'Attachments')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {entry.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{attachment.fileName}</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Void Dialog */}
        <Dialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('journal.voidTitle', 'Void Entry')}</DialogTitle>
              <DialogDescription>
                {t('journal.voidDesc', 'Voiding an entry will create a reversing entry in the general ledger.')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">{t('journal.voidReason', 'Reason (optional)')}</Label>
                <Textarea
                  id="reason"
                  placeholder={t('journal.voidReasonPlaceholder', 'Enter reason for voiding...')}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVoidDialogOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={() => voidMutation.mutate(voidReason)} disabled={voidMutation.isPending}>
                {t('journal.void', 'Void Entry')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('journal.deleteTitle', 'Delete Entry')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('journal.deleteConfirm', 'Are you sure you want to delete this journal entry? This action cannot be undone.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-red-600 hover:bg-red-700">
                {t('common.delete', 'Delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </>
  )
}
