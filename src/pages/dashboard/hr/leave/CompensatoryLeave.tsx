import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'
import {
  useCompensatoryLeaveRequests,
  useCompensatoryLeaveStats,
  useDeleteCompensatoryLeaveRequest,
  useBulkApproveCompensatoryLeaveRequests,
  useBulkRejectCompensatoryLeaveRequests,
  useExportCompensatoryLeaveRequests,
} from '@/hooks/useCompensatoryLeave'
import { Button } from '@/components/ui/button'
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
import { FileDown, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CompensatoryLeaveStats } from '@/components/hr/leave/CompensatoryLeaveStats'
import { CompensatoryLeaveFilters } from '@/components/hr/leave/CompensatoryLeaveFilters'
import { CompensatoryLeaveTable } from '@/components/hr/leave/CompensatoryLeaveTable'
import { BulkActionBar } from '@/components/hr/common/BulkActionBar'

export default function CompensatoryLeave() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()
  const { toast } = useToast()

  // State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reasonFilter, setReasonFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('workFromDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}
    if (statusFilter !== 'all') f.status = statusFilter
    if (reasonFilter !== 'all') f.reason = reasonFilter
    if (yearFilter !== 'all') f.year = parseInt(yearFilter)
    f.sortBy = sortBy
    f.sortOrder = sortOrder
    return f
  }, [statusFilter, reasonFilter, yearFilter, sortBy, sortOrder])

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || reasonFilter !== 'all' || yearFilter !== 'all'

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setReasonFilter('all')
    setYearFilter('all')
  }

  // Fetch data
  const {
    data: requestsData,
    isLoading,
    isError,
    refetch,
  } = useCompensatoryLeaveRequests(filters)
  const { data: stats } = useCompensatoryLeaveStats()

  // Mutations
  const deleteRequestMutation = useDeleteCompensatoryLeaveRequest()
  const bulkApproveMutation = useBulkApproveCompensatoryLeaveRequests()
  const bulkRejectMutation = useBulkRejectCompensatoryLeaveRequests()
  const exportMutation = useExportCompensatoryLeaveRequests()

  // Transform API data with search filter
  const requests = useMemo(() => {
    if (!requestsData?.data) return []
    let reqs = requestsData.data

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      reqs = reqs.filter(
        (req) =>
          req.employeeName?.toLowerCase().includes(query) ||
          req.employeeNameAr?.includes(query) ||
          req.requestId?.toLowerCase().includes(query) ||
          req.employeeNumber?.toLowerCase().includes(query)
      )
    }

    return reqs
  }, [requestsData, searchQuery])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? requests.map((req) => req._id) : [])
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(
      checked
        ? [...selectedIds, id]
        : selectedIds.filter((selectedId) => selectedId !== id)
    )
  }

  // Delete handler
  const handleDelete = async () => {
    if (!requestToDelete) return

    try {
      await deleteRequestMutation.mutateAsync(requestToDelete)
      toast({
        title: t('hr.leave.compensatory.deleteSuccess', 'Delete Successful'),
        description: t(
          'hr.leave.compensatory.deleteSuccessDesc',
          'Compensatory leave request deleted successfully'
        ),
      })
      setDeleteDialogOpen(false)
      setRequestToDelete(null)
    } catch (error: any) {
      toast({
        title: t('hr.leave.compensatory.deleteFailed', 'Delete Failed'),
        description:
          error.message ||
          t('hr.leave.compensatory.deleteFailedDesc', 'Failed to delete compensatory leave request'),
        variant: 'destructive',
      })
    }
  }

  // Bulk actions
  const handleBulkApprove = async () => {
    try {
      await bulkApproveMutation.mutateAsync({ ids: selectedIds })
      toast({
        title: t('hr.leave.compensatory.approvalSuccess', 'Approval Successful'),
        description: t(
          'hr.leave.compensatory.approvalSuccessDesc',
          `${selectedIds.length} request(s) approved`
        ),
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: t('hr.leave.compensatory.approvalFailed', 'Approval Failed'),
        description:
          error.message ||
          t('hr.leave.compensatory.approvalFailedDesc', 'Failed to approve requests'),
        variant: 'destructive',
      })
    }
  }

  const handleBulkReject = async () => {
    const reason = prompt(
      t('hr.leave.compensatory.enterRejectionReason', 'Enter rejection reason:')
    )
    if (!reason) return

    try {
      await bulkRejectMutation.mutateAsync({ ids: selectedIds, reason })
      toast({
        title: t('hr.leave.compensatory.rejectionSuccess', 'Rejection Successful'),
        description: t(
          'hr.leave.compensatory.rejectionSuccessDesc',
          `${selectedIds.length} request(s) rejected`
        ),
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: t('hr.leave.compensatory.rejectionFailed', 'Rejection Failed'),
        description:
          error.message ||
          t('hr.leave.compensatory.rejectionFailedDesc', 'Failed to reject requests'),
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
      a.download = `compensatory-leave-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: t('hr.leave.compensatory.exportSuccess', 'Export Successful'),
        description: t('hr.leave.compensatory.exportSuccessDesc', 'Data exported successfully'),
      })
    } catch (error: any) {
      toast({
        title: t('hr.leave.compensatory.exportFailed', 'Export Failed'),
        description:
          error.message || t('hr.leave.compensatory.exportFailedDesc', 'Failed to export data'),
        variant: 'destructive',
      })
    }
  }

  // Year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('hr.leave.compensatory.title', 'Compensatory Leave')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t(
              'hr.leave.compensatory.description',
              'Manage compensatory leave requests for overtime and holiday work'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <FileDown className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.export', 'Export')}
          </Button>
          <Button onClick={() => navigate({ to: ROUTES.dashboard.hr.leave.compensatory.new })}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('hr.leave.compensatory.newRequest', 'New Request')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && <CompensatoryLeaveStats stats={stats} />}

      {/* Filters */}
      <CompensatoryLeaveFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        reasonFilter={reasonFilter}
        onReasonChange={setReasonFilter}
        yearFilter={yearFilter}
        onYearChange={setYearFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        yearOptions={yearOptions}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {/* Selection Mode Actions */}
      {isSelectionMode && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onCancel={() => setIsSelectionMode(false)}
          onApprove={handleBulkApprove}
          onReject={handleBulkReject}
        />
      )}

      {/* Table */}
      <CompensatoryLeaveTable
        requests={requests}
        isLoading={isLoading}
        isError={isError}
        hasActiveFilters={hasActiveFilters}
        isSelectionMode={isSelectionMode}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onClearFilters={clearFilters}
        onRefetch={refetch}
        onDelete={(id) => {
          setRequestToDelete(id)
          setDeleteDialogOpen(true)
        }}
      />

      {/* Pagination */}
      {requestsData?.pagination && requestsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t(
              'common.showingResults',
              `Showing ${requests.length} of ${requestsData.pagination.total} results`
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDeletion', 'Confirm Deletion')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'hr.leave.compensatory.deleteConfirmMessage',
                'Are you sure you want to delete this compensatory leave request? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
