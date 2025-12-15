import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import {
  Plus, FileText, Search, Filter, MoreHorizontal, Eye, Edit2,
  Trash2, CheckCircle, XCircle, Clock, AlertCircle, Copy, RotateCcw,
  Download, Calendar, ArrowUpDown, FileCheck
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import journalEntryService, { type JournalEntry, type JournalEntryStatus, type JournalEntryFilters } from '@/services/journalEntryService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export default function JournalEntriesDashboard() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JournalEntryStatus | 'all'>('all')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({})

  // Fetch journal entries
  const filters: JournalEntryFilters = {
    page: currentPage,
    limit: 20,
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...dateRange,
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['journal-entries', filters, searchQuery],
    queryFn: () => journalEntryService.getEntries(filters),
  })

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['journal-entries-stats', dateRange],
    queryFn: () => journalEntryService.getStats(dateRange),
  })

  // Mutations
  const postMutation = useMutation({
    mutationFn: (id: string) => journalEntryService.postEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.invalidateQueries({ queryKey: ['journal-entries-stats'] })
      queryClient.invalidateQueries({ queryKey: ['general-ledger'] })
      toast.success(t('journal.posted'))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.postError'))
    },
  })

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      journalEntryService.voidEntry(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.invalidateQueries({ queryKey: ['journal-entries-stats'] })
      queryClient.invalidateQueries({ queryKey: ['general-ledger'] })
      setIsVoidDialogOpen(false)
      setVoidReason('')
      toast.success(t('journal.voided'))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.voidError'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalEntryService.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.invalidateQueries({ queryKey: ['journal-entries-stats'] })
      setIsDeleteDialogOpen(false)
      toast.success(t('journal.deleted'))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.deleteError'))
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => journalEntryService.duplicateEntry(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success(t('journal.duplicated'))
      navigate({ to: `/dashboard/finance/journal-entries/${data._id}` })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('journal.duplicateError'))
    },
  })

  // Filter entries by search
  const filteredEntries = data?.entries.filter((entry) => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      entry.entryNumber.toLowerCase().includes(search) ||
      entry.description.toLowerCase().includes(search) ||
      (entry.memo && entry.memo.toLowerCase().includes(search))
    )
  })

  // Status badge
  const getStatusBadge = (status: JournalEntryStatus) => {
    const variants = {
      draft: { color: 'bg-gray-500', icon: Clock, label: t('status.draft') },
      pending: { color: 'bg-yellow-500', icon: AlertCircle, label: t('status.pending') },
      posted: { color: 'bg-green-500', icon: CheckCircle, label: t('status.posted') },
      voided: { color: 'bg-red-500', icon: XCircle, label: t('status.voided') },
    }
    const variant = variants[status]
    const Icon = variant.icon

    return (
      <Badge className={cn('flex items-center gap-1', variant.color)}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    )
  }

  // Handle actions
  const handlePost = (entry: JournalEntry) => {
    if (!entry.isBalanced) {
      toast.error(t('journal.notBalanced'))
      return
    }
    postMutation.mutate(entry._id)
  }

  const handleVoid = () => {
    if (!selectedEntry) return
    voidMutation.mutate({ id: selectedEntry._id, reason: voidReason })
  }

  const handleDelete = () => {
    if (!selectedEntry) return
    deleteMutation.mutate(selectedEntry._id)
  }

  const handleDuplicate = (entry: JournalEntry) => {
    duplicateMutation.mutate(entry._id)
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
      <FinanceSidebar />
      <Main>
        <div className={cn('container mx-auto p-6 space-y-6', isRTL && 'rtl')}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('journal.title', 'Journal Entries')}
              </h1>
              <p className="text-muted-foreground">
                {t('journal.subtitle', 'Manage manual accounting adjustments and journal entries')}
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/dashboard/finance/journal-entries/new' })}>
              <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('journal.create', 'Create Entry')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('journal.totalEntries', 'Total Entries')}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('journal.draft', 'Draft')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.byStatus.draft || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('journal.posted', 'Posted')}
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.byStatus.posted || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('journal.totalAmount', 'Total Amount')}
                </CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className={cn('absolute top-2.5 h-4 w-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                  <Input
                    placeholder={t('journal.search', 'Search entries...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(isRTL ? 'pr-9' : 'pl-9')}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('journal.filterStatus', 'Filter by status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('status.all', 'All')}</SelectItem>
                    <SelectItem value="draft">{t('status.draft', 'Draft')}</SelectItem>
                    <SelectItem value="pending">{t('status.pending', 'Pending')}</SelectItem>
                    <SelectItem value="posted">{t('status.posted', 'Posted')}</SelectItem>
                    <SelectItem value="voided">{t('status.voided', 'Voided')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Entries Table */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">{t('common.error', 'Error loading data')}</p>
                  <p className="text-sm text-muted-foreground">{error?.message}</p>
                </div>
              ) : filteredEntries && filteredEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('journal.entryNumber', 'Entry #')}</TableHead>
                      <TableHead>{t('journal.date', 'Date')}</TableHead>
                      <TableHead>{t('journal.description', 'Description')}</TableHead>
                      <TableHead className="text-right">{t('journal.debit', 'Debit')}</TableHead>
                      <TableHead className="text-right">{t('journal.credit', 'Credit')}</TableHead>
                      <TableHead>{t('journal.status', 'Status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                        <TableCell>
                          {format(new Date(entry.transactionDate), 'PP', {
                            locale: isRTL ? ar : undefined,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium">{entry.description}</div>
                            {entry.memo && (
                              <div className="text-sm text-muted-foreground truncate">{entry.memo}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(entry.totalDebit)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(entry.totalCredit)}
                        </TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate({ to: `/dashboard/finance/journal-entries/${entry._id}` })}
                              >
                                <Eye className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                {t('common.view', 'View')}
                              </DropdownMenuItem>
                              {entry.status === 'draft' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => navigate({ to: `/dashboard/finance/journal-entries/${entry._id}` })}
                                  >
                                    <Edit2 className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('common.edit', 'Edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handlePost(entry)}
                                    disabled={!entry.isBalanced || postMutation.isPending}
                                  >
                                    <FileCheck className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('journal.post', 'Post to GL')}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {entry.status === 'posted' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEntry(entry)
                                    setIsVoidDialogOpen(true)
                                  }}
                                >
                                  <XCircle className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('journal.void', 'Void')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDuplicate(entry)}>
                                <Copy className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                {t('common.duplicate', 'Duplicate')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {entry.status === 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEntry(entry)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('common.delete', 'Delete')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">{t('journal.noEntries', 'No journal entries')}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('journal.noEntriesDesc', 'Create your first journal entry to get started')}
                  </p>
                  <Button onClick={() => navigate({ to: '/dashboard/finance/journal-entries/new' })}>
                    <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {t('journal.create', 'Create Entry')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                {t('common.delete', 'Delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                  placeholder={t('journal.voidReasonPlaceholder', 'Enter reason for voiding this entry...')}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  rows={4}
                />
              </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVoidDialogOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleVoid} disabled={voidMutation.isPending}>
                {t('journal.void', 'Void Entry')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
