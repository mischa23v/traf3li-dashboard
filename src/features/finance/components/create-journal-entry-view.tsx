import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import {
  Plus, Trash2, Save, FileText, AlertCircle, CheckCircle2,
  X, Paperclip, Upload
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'sonner'
import journalEntryService, { type CreateJournalEntryData } from '@/services/journalEntryService'
import { useAccounts } from '@/hooks/useAccounting'
import { useMutation, useQuery } from '@tanstack/react-query'
import { invalidateCache } from '@/lib/cache-invalidation'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface JournalLine {
  id: string
  accountId: string
  description: string
  debit: number
  credit: number
}

export default function CreateJournalEntryView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  // Form state
  const [transactionDate, setTransactionDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [description, setDescription] = useState('')
  const [memo, setMemo] = useState('')
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', accountId: '', description: '', debit: 0, credit: 0 },
    { id: '2', accountId: '', description: '', debit: 0, credit: 0 },
  ])
  const [attachments, setAttachments] = useState<File[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  // Fetch accounts
  const { data: accountsData } = useAccounts({ isActive: true })
  const accounts = accountsData?.accounts || []

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['journal-entry-templates'],
    queryFn: () => journalEntryService.getTemplates(),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateJournalEntryData) => journalEntryService.createEntry(data),
    onSuccess: (data) => {
      invalidateCache.finance.journalEntries()
      toast.success(t('journal.created', 'Journal entry created successfully'))
      navigate({ to: `/dashboard/finance/journal-entries/${data._id}` })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.createError', 'Failed to create entry'))
    },
  })

  // Create from template mutation
  const createFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, amount }: { templateId: string; amount: number }) =>
      journalEntryService.createFromTemplate(templateId, {
        transactionDate,
        amount,
        description,
      }),
    onSuccess: (data) => {
      invalidateCache.finance.journalEntries()
      toast.success(t('journal.createdFromTemplate', 'Entry created from template'))
      navigate({ to: `/dashboard/finance/journal-entries/${data._id}` })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.createError', 'Failed to create entry'))
    },
  })

  // Calculate totals
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
  const difference = totalDebit - totalCredit
  const isBalanced = Math.abs(difference) < 0.01 && totalDebit > 0

  // Add line
  const addLine = () => {
    setLines([
      ...lines,
      { id: Date.now().toString(), accountId: '', description: '', debit: 0, credit: 0 },
    ])
  }

  // Remove line
  const removeLine = (id: string) => {
    if (lines.length <= 2) {
      toast.error(t('journal.minLines', 'At least 2 lines are required'))
      return
    }
    setLines(lines.filter((line) => line.id !== id))
  }

  // Update line
  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines(
      lines.map((line) => {
        if (line.id === id) {
          const updated = { ...line, [field]: value }
          // Auto-clear opposite amount when entering a value
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      toast.error(t('journal.descriptionRequired', 'Description is required'))
      return
    }

    if (!isBalanced) {
      toast.error(t('journal.notBalanced', 'Entry must be balanced (debits = credits)'))
      return
    }

    const validLines = lines.filter((line) => line.accountId && (line.debit > 0 || line.credit > 0))

    if (validLines.length < 2) {
      toast.error(t('journal.minLinesRequired', 'At least 2 lines with valid accounts are required'))
      return
    }

    const data: CreateJournalEntryData = {
      transactionDate,
      description,
      memo: memo || undefined,
      lines: validLines.map((line) => ({
        accountId: line.accountId,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description || undefined,
      })),
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    createMutation.mutate(data)
  }

  // Load template
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates?.find((t) => t._id === templateId)
    if (template) {
      setDescription(template.description)
      setLines(
        template.lines.map((line, index) => ({
          id: Date.now().toString() + index,
          accountId: typeof line.accountId === 'string' ? line.accountId : line.accountId._id,
          description: line.description || '',
          debit: line.debit,
          credit: line.credit,
        }))
      )
    }
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
      <FinanceSidebar context="journal-entries" />
      <Main>
        <div className={cn('container mx-auto p-6 space-y-6', isRTL && 'rtl')}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('journal.createTitle', 'Create Journal Entry')}
              </h1>
              <p className="text-muted-foreground">
                {t('journal.createSubtitle', 'Create a manual journal entry for accounting adjustments')}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate({ to: '/dashboard/finance/journal-entries' })}>
              <X className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('common.cancel', 'Cancel')}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selector */}
            {templates && templates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('journal.useTemplate', 'Use Template')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('journal.selectTemplate', 'Select a template...')} />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {isRTL && template.nameAr ? template.nameAr : template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Entry Details */}
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
                      placeholder={t('journal.descriptionPlaceholder', 'Enter entry description...')}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">{t('journal.memo', 'Memo (Optional)')}</Label>
                  <Textarea
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder={t('journal.memoPlaceholder', 'Add additional notes...')}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Journal Lines */}
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
                      {lines.map((line, index) => (
                        <TableRow key={line.id}>
                          <TableCell>
                            <Select
                              value={line.accountId}
                              onValueChange={(value) => updateLine(line.id, 'accountId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('journal.selectAccount', 'Select account...')} />
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
                              placeholder={t('journal.lineDescPlaceholder', 'Line description...')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.debit || ''}
                              onChange={(e) => updateLine(line.id, 'debit', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
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
                              placeholder="0.00"
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
                      {/* Totals Row */}
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

                {/* Balance Status */}
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

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>{t('journal.attachments', 'Attachments')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                    >
                      <Paperclip className="h-4 w-4" />
                      {t('journal.attachFiles', 'Attach Files')}
                    </Label>
                    {attachments.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {attachments.length} {t('journal.filesSelected', 'file(s) selected')}
                      </span>
                    )}
                  </div>
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/dashboard/finance/journal-entries' })}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={!isBalanced || createMutation.isPending}>
                <Save className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {createMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save Entry')}
              </Button>
            </div>
          </form>
        </div>
      </Main>
    </>
  )
}
