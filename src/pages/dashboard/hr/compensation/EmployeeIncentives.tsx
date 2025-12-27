import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Users,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmployeeIncentiveDialog } from '@/components/hr/compensation/EmployeeIncentiveDialog'
import { BulkIncentiveDialog } from '@/components/hr/compensation/BulkIncentiveDialog'
import {
  useEmployeeIncentives,
  useIncentiveStatistics,
  useDeleteEmployeeIncentive,
  useApproveIncentive,
  useRejectIncentive,
  useExportIncentives,
  useBulkDeleteEmployeeIncentives,
} from '@/hooks/useEmployeeIncentive'
import type {
  EmployeeIncentive,
  IncentiveType,
  IncentiveStatus,
} from '@/services/employeeIncentiveService'
import {
  incentiveTypeLabels,
  incentiveStatusLabels,
} from '@/services/employeeIncentiveService'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function EmployeeIncentivesPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<IncentiveType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<IncentiveStatus | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [selectedIncentive, setSelectedIncentive] = useState<
    EmployeeIncentive | undefined
  >()
  const [selectedIncentives, setSelectedIncentives] = useState<string[]>([])

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [incentiveToDelete, setIncentiveToDelete] = useState<string | null>(null)
  const [incentiveToApprove, setIncentiveToApprove] = useState<string | null>(null)
  const [incentiveToReject, setIncentiveToReject] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Queries
  const { data: incentivesData, isLoading } = useEmployeeIncentives({
    search: searchQuery,
    incentiveType: selectedType === 'all' ? undefined : selectedType,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  })
  const { data: stats } = useIncentiveStatistics()

  // Mutations
  const deleteMutation = useDeleteEmployeeIncentive()
  const approveMutation = useApproveIncentive()
  const rejectMutation = useRejectIncentive()
  const exportMutation = useExportIncentives()
  const bulkDeleteMutation = useBulkDeleteEmployeeIncentives()

  const incentives = incentivesData?.incentives || []

  // Handlers
  const handleCreate = () => {
    setSelectedIncentive(undefined)
    setDialogOpen(true)
  }

  const handleBulkCreate = () => {
    setBulkDialogOpen(true)
  }

  const handleEdit = (incentive: EmployeeIncentive) => {
    setSelectedIncentive(incentive)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setIncentiveToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!incentiveToDelete) return
    try {
      await deleteMutation.mutateAsync(incentiveToDelete)
      toast.success(t('hr.incentives.deleteSuccess', 'Incentive deleted successfully'))
      setDeleteDialogOpen(false)
      setIncentiveToDelete(null)
    } catch (error) {
      toast.error(t('hr.incentives.deleteError', 'Failed to delete incentive'))
    }
  }

  const handleApprove = (id: string) => {
    setIncentiveToApprove(id)
    setApproveDialogOpen(true)
  }

  const confirmApprove = async () => {
    if (!incentiveToApprove) return
    try {
      await approveMutation.mutateAsync({ id: incentiveToApprove })
      toast.success(t('hr.incentives.approveSuccess', 'Incentive approved successfully'))
      setApproveDialogOpen(false)
      setIncentiveToApprove(null)
    } catch (error) {
      toast.error(t('hr.incentives.approveError', 'Failed to approve incentive'))
    }
  }

  const handleReject = (id: string) => {
    setIncentiveToReject(id)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const confirmReject = async () => {
    if (!incentiveToReject || !rejectionReason.trim()) {
      toast.error(t('hr.incentives.reasonRequired', 'Rejection reason is required'))
      return
    }
    try {
      await rejectMutation.mutateAsync({
        id: incentiveToReject,
        data: { reason: rejectionReason, reasonAr: rejectionReason },
      })
      toast.success(t('hr.incentives.rejectSuccess', 'Incentive rejected successfully'))
      setRejectDialogOpen(false)
      setIncentiveToReject(null)
      setRejectionReason('')
    } catch (error) {
      toast.error(t('hr.incentives.rejectError', 'Failed to reject incentive'))
    }
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      incentiveType: selectedType === 'all' ? undefined : selectedType,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search: searchQuery,
    })
  }

  const handleBulkDelete = () => {
    if (selectedIncentives.length === 0) {
      toast.error(t('hr.incentives.selectIncentives', 'Please select incentives'))
      return
    }
    setBulkDeleteDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedIncentives)
      toast.success(
        t('hr.incentives.bulkDeleteSuccess', `${selectedIncentives.length} incentive(s) deleted successfully`)
      )
      setSelectedIncentives([])
      setBulkDeleteDialogOpen(false)
    } catch (error) {
      toast.error(t('hr.incentives.bulkDeleteError', 'Failed to delete incentives'))
    }
  }

  const toggleSelectIncentive = (id: string) => {
    setSelectedIncentives((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIncentives.length === incentives.length) {
      setSelectedIncentives([])
    } else {
      setSelectedIncentives(incentives.map((i) => i._id))
    }
  }

  // Get localized field value
  const getLocalizedValue = (value: string, valueAr?: string) => {
    return isArabic && valueAr ? valueAr : value
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', {
      locale: isArabic ? ar : undefined,
    })
  }

  // Get status badge variant
  const getStatusVariant = (
    status: IncentiveStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved':
      case 'processed':
        return 'default'
      case 'pending_approval':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('hr.incentives.title', 'Employee Incentives')}
          </h1>
          <p className="text-muted-foreground">
            {t('hr.incentives.subtitle', 'Manage employee bonuses and incentives')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {t('hr.incentives.export', 'Export')}
          </Button>
          <Button variant="outline" onClick={handleBulkCreate}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('hr.incentives.bulkCreate', 'Bulk Create')}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('hr.incentives.newIncentive', 'New Incentive')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.incentives.stats.total', 'Total Incentives')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIncentives || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('hr.incentives.stats.totalValue', 'Total Value')}: {formatCurrency(stats?.totalAmount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.incentives.stats.average', 'Average Incentive')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.averageAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('hr.incentives.stats.perEmployee', 'Per employee')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.incentives.stats.pending', 'Pending Approval')}
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('hr.incentives.stats.needsApproval', 'Needs approval')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.incentives.stats.processedMonth', 'Processed This Month')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.processedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('hr.incentives.stats.inPayroll', 'In payroll')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('hr.incentives.search', 'Search...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedType}
                onValueChange={(v) => setSelectedType(v as IncentiveType | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('hr.incentives.incentiveType', 'Incentive Type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hr.incentives.all', 'All')}</SelectItem>
                  {Object.entries(incentiveTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {t(`hr.compensation.incentives.types.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as IncentiveStatus | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('hr.incentives.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hr.incentives.all', 'All')}</SelectItem>
                  {Object.entries(incentiveStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {t(`hr.compensation.incentives.statuses.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedIncentives.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted p-4">
              <span className="text-sm">
                {t('hr.incentives.selected', 'Selected')} {selectedIncentives.length} {t('hr.incentives.incentives', 'incentive(s)')}
              </span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('hr.incentives.deleteSelected', 'Delete Selected')}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedIncentives.length === incentives.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>{t('hr.incentives.table.employee', 'Employee')}</TableHead>
                  <TableHead>{t('hr.incentives.table.type', 'Type')}</TableHead>
                  <TableHead>{t('hr.incentives.table.amount', 'Amount')}</TableHead>
                  <TableHead>{t('hr.incentives.table.reason', 'Reason')}</TableHead>
                  <TableHead>{t('hr.incentives.table.payrollDate', 'Payroll Date')}</TableHead>
                  <TableHead>{t('hr.incentives.table.status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('hr.incentives.table.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incentives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {t('hr.incentives.noIncentives', 'No incentives found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  incentives.map((incentive) => (
                    <TableRow key={incentive._id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIncentives.includes(incentive._id)}
                          onChange={() => toggleSelectIncentive(incentive._id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getLocalizedValue(incentive.employeeName, incentive.employeeNameAr)}
                          </div>
                          {incentive.employeeNumber && (
                            <div className="text-sm text-muted-foreground">
                              {incentive.employeeNumber}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(`hr.compensation.incentives.types.${incentive.incentiveType}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(incentive.incentiveAmount, incentive.currency)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {getLocalizedValue(incentive.incentiveReason, incentive.incentiveReasonAr)}
                      </TableCell>
                      <TableCell>{formatDate(incentive.payrollDate)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(incentive.status)}>
                          {t(`hr.compensation.incentives.statuses.${incentive.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {t('hr.incentives.actions', 'Actions')}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {incentive.status === 'draft' && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(incentive)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t('hr.incentives.edit', 'Edit')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {incentive.status === 'pending_approval' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApprove(incentive._id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {t('hr.incentives.approve', 'Approve')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleReject(incentive._id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {t('hr.incentives.reject', 'Reject')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(incentive._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('hr.incentives.delete', 'Delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EmployeeIncentiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        incentive={selectedIncentive}
      />

      <BulkIncentiveDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('hr.incentives.confirmDelete', 'Delete Incentive')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'hr.incentives.confirmDeleteMessage',
                'Are you sure you want to delete this incentive? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('hr.incentives.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('hr.incentives.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('hr.incentives.confirmApprove', 'Approve Incentive')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'hr.incentives.confirmApproveMessage',
                'Are you sure you want to approve this incentive?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('hr.incentives.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove}>
              {t('hr.incentives.approve', 'Approve')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Reason Input */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('hr.incentives.rejectIncentive', 'Reject Incentive')}</DialogTitle>
            <DialogDescription>
              {t('hr.incentives.rejectIncentiveMessage', 'Please provide a reason for rejection.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                {t('hr.incentives.rejectionReason', 'Rejection Reason')}
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t(
                  'hr.incentives.rejectionReasonPlaceholder',
                  'Enter the reason for rejecting this incentive...'
                )}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectionReason('')
              }}
            >
              {t('hr.incentives.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
            >
              {t('hr.incentives.reject', 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('hr.incentives.confirmBulkDelete', 'Delete Multiple Incentives')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'hr.incentives.confirmBulkDeleteMessage',
                `Are you sure you want to delete ${selectedIncentives.length} incentive(s)? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('hr.incentives.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('hr.incentives.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
