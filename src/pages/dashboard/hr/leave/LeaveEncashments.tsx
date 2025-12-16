import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  useLeaveEncashments,
  useEncashmentStats,
  useDeleteLeaveEncashment,
  useBulkApproveEncashments,
  useBulkRejectEncashments,
  useExportEncashments,
} from '@/hooks/useLeaveEncashment'
import type { LeaveEncashment, EncashmentStatus } from '@/services/leaveEncashmentService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenuSeparator,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit3,
  X,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  Download,
  Filter,
  FileDown,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

// Status configuration
const getStatusConfig = (t: any): Record<EncashmentStatus, { label: string; variant: any; icon: any }> => ({
  draft: {
    label: t('hr.leave.encashment.status.draft', 'Draft'),
    variant: 'secondary',
    icon: Edit3,
  },
  pending_approval: {
    label: t('hr.leave.encashment.status.pendingApproval', 'Pending Approval'),
    variant: 'warning',
    icon: Clock,
  },
  approved: {
    label: t('hr.leave.encashment.status.approved', 'Approved'),
    variant: 'success',
    icon: CheckCircle,
  },
  paid: {
    label: t('hr.leave.encashment.status.paid', 'Paid'),
    variant: 'default',
    icon: DollarSign,
  },
  rejected: {
    label: t('hr.leave.encashment.status.rejected', 'Rejected'),
    variant: 'destructive',
    icon: XCircle,
  },
  cancelled: {
    label: t('hr.leave.encashment.status.cancelled', 'Cancelled'),
    variant: 'outline',
    icon: X,
  },
})

export default function LeaveEncashments() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()
  const { toast } = useToast()

  // Status configuration with translations
  const STATUS_CONFIG = getStatusConfig(t)

  // State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [encashmentToDelete, setEncashmentToDelete] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('requestedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}

    if (statusFilter !== 'all') {
      f.status = statusFilter
    }

    if (yearFilter !== 'all') {
      f.year = parseInt(yearFilter)
    }

    f.sortBy = sortBy
    f.sortOrder = sortOrder

    return f
  }, [statusFilter, yearFilter, sortBy, sortOrder])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || yearFilter !== 'all'

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setYearFilter('all')
  }

  // Fetch data
  const { data: encashmentsData, isLoading, isError, error, refetch } = useLeaveEncashments(filters)
  const { data: stats } = useEncashmentStats()

  // Mutations
  const deleteEncashmentMutation = useDeleteLeaveEncashment()
  const bulkApproveMutation = useBulkApproveEncashments()
  const bulkRejectMutation = useBulkRejectEncashments()
  const exportMutation = useExportEncashments()

  // Transform API data with search filter
  const encashments = useMemo(() => {
    if (!encashmentsData?.data) return []
    let requests = encashmentsData.data

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      requests = requests.filter(
        (enc) =>
          enc.employeeName?.toLowerCase().includes(query) ||
          enc.employeeNameAr?.includes(query) ||
          enc.encashmentId?.toLowerCase().includes(query) ||
          enc.employeeNumber?.toLowerCase().includes(query)
      )
    }

    return requests
  }, [encashmentsData, searchQuery])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(encashments.map((enc) => enc._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    }
  }

  const isAllSelected = encashments.length > 0 && selectedIds.length === encashments.length
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < encashments.length

  // Delete handler
  const handleDelete = async () => {
    if (!encashmentToDelete) return

    try {
      await deleteEncashmentMutation.mutateAsync(encashmentToDelete)
      toast({
        title: t('hr.leave.encashment.deleteSuccess', 'Delete Successful'),
        description: t('hr.leave.encashment.deleteSuccessDesc', 'Encashment request deleted successfully'),
      })
      setDeleteDialogOpen(false)
      setEncashmentToDelete(null)
    } catch (error: any) {
      toast({
        title: t('hr.leave.encashment.deleteFailed', 'Delete Failed'),
        description: error.message || t('hr.leave.encashment.deleteFailedDesc', 'Failed to delete encashment request'),
        variant: 'destructive',
      })
    }
  }

  // Bulk actions
  const handleBulkApprove = async () => {
    try {
      await bulkApproveMutation.mutateAsync(selectedIds)
      toast({
        title: t('hr.leave.encashment.approvalSuccess', 'Approval Successful'),
        description: t('hr.leave.encashment.approvalSuccessDesc', `${selectedIds.length} encashment request(s) approved`),
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: t('hr.leave.encashment.approvalFailed', 'Approval Failed'),
        description: error.message || t('hr.leave.encashment.approvalFailedDesc', 'Failed to approve requests'),
        variant: 'destructive',
      })
    }
  }

  const handleBulkReject = async () => {
    // TODO: Replace with proper dialog component instead of browser prompt
    const reason = prompt(t('hr.leave.encashment.enterRejectionReason', 'Enter rejection reason:'))
    if (!reason) return

    try {
      await bulkRejectMutation.mutateAsync({ ids: selectedIds, reason })
      toast({
        title: t('hr.leave.encashment.rejectionSuccess', 'Rejection Successful'),
        description: t('hr.leave.encashment.rejectionSuccessDesc', `${selectedIds.length} encashment request(s) rejected`),
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: t('hr.leave.encashment.rejectionFailed', 'Rejection Failed'),
        description: error.message || t('hr.leave.encashment.rejectionFailedDesc', 'Failed to reject requests'),
        variant: 'destructive',
      })
    }
  }

  // Export handler
  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leave-encashments-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: t('hr.leave.encashment.exportSuccess', 'Export Successful'),
        description: t('hr.leave.encashment.exportSuccessDesc', 'Data exported successfully'),
      })
    } catch (error: any) {
      toast({
        title: t('hr.leave.encashment.exportFailed', 'Export Failed'),
        description: error.message || t('hr.leave.encashment.exportFailedDesc', 'Failed to export data'),
        variant: 'destructive',
      })
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Current year and year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('hr.leave.encashment.title', 'Leave Encashments')}</h1>
          <p className="text-muted-foreground mt-1">{t('hr.leave.encashment.description', 'Manage leave encashment requests')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <FileDown className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.export', 'Export')}
          </Button>
          <Button onClick={() => navigate({ to: '/dashboard/hr/leave/encashments/new' })}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('hr.leave.encashment.newRequest', 'New Encashment Request')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('hr.leave.encashment.stats.totalRequests', 'Total Requests')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('hr.leave.encashment.stats.pendingApproval', 'Pending Approval')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('hr.leave.encashment.stats.totalAmount', 'Total Amount')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('hr.leave.encashment.stats.averageDays', 'Average Days')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageDaysPerRequest.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('common.searchAndFilter', 'Search & Filter')}</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('common.clearFilters', 'Clear Filters')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t('hr.leave.encashment.searchPlaceholder', 'Search by employee or ID...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-9' : 'pl-9'}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.status', 'Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allStatuses', 'All Statuses')}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.year', 'Year')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allYears', 'All Years')}</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.sortBy', 'Sort By')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requestedAt">{t('hr.leave.encashment.requestDate', 'Request Date')}</SelectItem>
                <SelectItem value="encashmentAmount">{t('hr.leave.encashment.amount', 'Amount')}</SelectItem>
                <SelectItem value="encashmentDays">{t('hr.leave.encashment.daysCount', 'Days Count')}</SelectItem>
                <SelectItem value="employeeName">{t('common.employeeName', 'Employee Name')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Mode Actions */}
      {isSelectionMode && selectedIds.length > 0 && (
        <Card className="bg-muted">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedIds.length} {t('common.selected', 'selected')}</span>
              <Button variant="ghost" size="sm" onClick={() => setIsSelectionMode(false)}>
                {t('common.cancelSelection', 'Cancel Selection')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={handleBulkApprove}>
                <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('common.approve', 'Approve')}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkReject}>
                <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('common.reject', 'Reject')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-destructive">
              <p>{t('common.errorLoadingData', 'Error loading data')}</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                {t('common.retry', 'Retry')}
              </Button>
            </div>
          ) : encashments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('hr.leave.encashment.noRequests', 'No encashment requests')}</p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  {t('common.clearFilters', 'Clear Filters')}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isSelectionMode && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label={t('common.selectAll', 'Select All')}
                      />
                    </TableHead>
                  )}
                  <TableHead>{t('hr.leave.encashment.requestId', 'Request ID')}</TableHead>
                  <TableHead>{t('common.employee', 'Employee')}</TableHead>
                  <TableHead>{t('common.department', 'Department')}</TableHead>
                  <TableHead>{t('hr.leave.encashment.leaveType', 'Leave Type')}</TableHead>
                  <TableHead>{t('hr.leave.encashment.days', 'Days')}</TableHead>
                  <TableHead>{t('hr.leave.encashment.amount', 'Amount')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead>{t('hr.leave.encashment.requestDate', 'Request Date')}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encashments.map((encashment) => {
                  const statusConfig = STATUS_CONFIG[encashment.status]
                  const StatusIcon = statusConfig.icon

                  return (
                    <TableRow key={encashment._id}>
                      {isSelectionMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(encashment._id)}
                            onCheckedChange={(checked) => handleSelectOne(encashment._id, checked as boolean)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{encashment.encashmentId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{isRTL ? encashment.employeeNameAr : encashment.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{encashment.employeeNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{isRTL ? (encashment.departmentNameAr || encashment.departmentName) : encashment.departmentName}</TableCell>
                      <TableCell>{isRTL ? (encashment.leaveTypeNameAr || encashment.leaveTypeName) : encashment.leaveTypeName}</TableCell>
                      <TableCell>{encashment.encashmentDays} {t('hr.leave.encashment.daysUnit', 'days')}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(encashment.encashmentAmount, encashment.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant as any}>
                          <StatusIcon className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(encashment.requestedAt), {
                          addSuffix: true,
                          locale: isRTL ? ar : undefined,
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate({ to: `/dashboard/hr/leave/encashments/${encashment._id}` })}
                            >
                              <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('common.viewDetails', 'View Details')}
                            </DropdownMenuItem>
                            {encashment.status === 'draft' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => navigate({ to: `/dashboard/hr/leave/encashments/${encashment._id}/edit` })}
                                >
                                  <Edit3 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                  {t('common.edit', 'Edit')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setEncashmentToDelete(encashment._id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                  {t('common.delete', 'Delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {encashmentsData?.pagination && encashmentsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('common.showingResults', `Showing ${encashments.length} of ${encashmentsData.pagination.total} results`)}
          </div>
          <div className="flex items-center gap-2">
            {/* Pagination buttons would go here */}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDeletion', 'Confirm Deletion')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('hr.leave.encashment.deleteConfirmMessage', 'Are you sure you want to delete this encashment request? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
