import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Download,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
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
import { IncentiveStats } from '@/components/hr/compensation/IncentiveStats'
import { IncentiveFilters } from '@/components/hr/compensation/IncentiveFilters'
import { IncentivesTable } from '@/components/hr/compensation/IncentivesTable'
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
import { toast } from 'sonner'

export default function EmployeeIncentivesPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<IncentiveType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<IncentiveStatus | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [selectedIncentive, setSelectedIncentive] = useState<EmployeeIncentive | undefined>()
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

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Handlers
  const handleCreate = () => {
    setSelectedIncentive(undefined)
    setDialogOpen(true)
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
          <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
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
      {stats && (
        <IncentiveStats
          stats={{
            totalIncentives: stats.totalIncentives || 0,
            totalAmount: stats.totalAmount || 0,
            averageAmount: stats.averageAmount || 0,
            pendingApprovals: stats.pendingApprovals || 0,
            processedThisMonth: stats.processedThisMonth || 0,
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <IncentiveFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
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
          <IncentivesTable
            incentives={incentives}
            isLoading={isLoading}
            selectedIncentives={selectedIncentives}
            onToggleSelect={toggleSelectIncentive}
            onToggleSelectAll={toggleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            formatCurrency={formatCurrency}
          />
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
