import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  useCompensatoryLeaveRequests,
  useCompensatoryLeaveStats,
  useDeleteCompensatoryLeaveRequest,
  useBulkApproveCompensatoryLeaveRequests,
  useBulkRejectCompensatoryLeaveRequests,
  useExportCompensatoryLeaveRequests,
} from '@/hooks/useCompensatoryLeave'
import type {
  CompensatoryLeaveRequest,
  CompensatoryLeaveStatus,
  WorkReason,
} from '@/services/compensatoryLeaveService'
import {
  COMPENSATORY_STATUS_LABELS,
  WORK_REASON_LABELS,
} from '@/services/compensatoryLeaveService'
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
  Calendar,
  FileDown,
  AlertTriangle,
  TrendingUp,
  Users,
  CalendarClock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'
import { ar } from 'date-fns/locale'

// Status configuration
const STATUS_CONFIG: Record<
  CompensatoryLeaveStatus,
  { label: string; labelAr: string; variant: any; icon: any }
> = {
  draft: {
    label: 'Draft',
    labelAr: 'مسودة',
    variant: 'secondary',
    icon: Edit3,
  },
  pending_approval: {
    label: 'Pending Approval',
    labelAr: 'قيد الموافقة',
    variant: 'warning',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    labelAr: 'موافق عليه',
    variant: 'success',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    labelAr: 'مرفوض',
    variant: 'destructive',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    labelAr: 'منتهي الصلاحية',
    variant: 'outline',
    icon: AlertTriangle,
  },
  used: {
    label: 'Used',
    labelAr: 'مستخدم',
    variant: 'default',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    labelAr: 'ملغي',
    variant: 'outline',
    icon: X,
  },
}

export default function CompensatoryLeave() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
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

    if (statusFilter !== 'all') {
      f.status = statusFilter
    }

    if (reasonFilter !== 'all') {
      f.reason = reasonFilter
    }

    if (yearFilter !== 'all') {
      f.year = parseInt(yearFilter)
    }

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
    error,
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

    // Apply search filter
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
    if (checked) {
      setSelectedIds(requests.map((req) => req._id))
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

  const isAllSelected = requests.length > 0 && selectedIds.length === requests.length
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < requests.length

  // Delete handler
  const handleDelete = async () => {
    if (!requestToDelete) return

    try {
      await deleteRequestMutation.mutateAsync(requestToDelete)
      toast({
        title: isArabic ? 'نجح الحذف' : 'Delete Successful',
        description: isArabic
          ? 'تم حذف طلب الإجازة التعويضية بنجاح'
          : 'Compensatory leave request deleted successfully',
      })
      setDeleteDialogOpen(false)
      setRequestToDelete(null)
    } catch (error: any) {
      toast({
        title: isArabic ? 'فشل الحذف' : 'Delete Failed',
        description:
          error.message ||
          (isArabic
            ? 'فشل حذف طلب الإجازة التعويضية'
            : 'Failed to delete compensatory leave request'),
        variant: 'destructive',
      })
    }
  }

  // Bulk actions
  const handleBulkApprove = async () => {
    try {
      await bulkApproveMutation.mutateAsync({ ids: selectedIds })
      toast({
        title: isArabic ? 'نجحت الموافقة' : 'Approval Successful',
        description: isArabic
          ? `تمت الموافقة على ${selectedIds.length} طلب`
          : `${selectedIds.length} request(s) approved`,
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: isArabic ? 'فشلت الموافقة' : 'Approval Failed',
        description:
          error.message ||
          (isArabic ? 'فشلت الموافقة على الطلبات' : 'Failed to approve requests'),
        variant: 'destructive',
      })
    }
  }

  const handleBulkReject = async () => {
    const reason = prompt(
      isArabic ? 'أدخل سبب الرفض:' : 'Enter rejection reason:'
    )
    if (!reason) return

    try {
      await bulkRejectMutation.mutateAsync({ ids: selectedIds, reason })
      toast({
        title: isArabic ? 'نجح الرفض' : 'Rejection Successful',
        description: isArabic
          ? `تم رفض ${selectedIds.length} طلب`
          : `${selectedIds.length} request(s) rejected`,
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: isArabic ? 'فشل الرفض' : 'Rejection Failed',
        description:
          error.message ||
          (isArabic ? 'فشل رفض الطلبات' : 'Failed to reject requests'),
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
        title: isArabic ? 'نجح التصدير' : 'Export Successful',
        description: isArabic
          ? 'تم تصدير البيانات بنجاح'
          : 'Data exported successfully',
      })
    } catch (error: any) {
      toast({
        title: isArabic ? 'فشل التصدير' : 'Export Failed',
        description:
          error.message || (isArabic ? 'فشل تصدير البيانات' : 'Failed to export data'),
        variant: 'destructive',
      })
    }
  }

  // Get expiry badge variant
  const getExpiryBadgeVariant = (validUntil: string) => {
    const daysUntilExpiry = differenceInDays(new Date(validUntil), new Date())
    if (daysUntilExpiry < 0) return 'destructive'
    if (daysUntilExpiry <= 7) return 'warning'
    if (daysUntilExpiry <= 30) return 'default'
    return 'secondary'
  }

  // Current year and year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'الإجازات التعويضية' : 'Compensatory Leave'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? 'إدارة طلبات الإجازات التعويضية للعمل الإضافي والعطل'
              : 'Manage compensatory leave requests for overtime and holiday work'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <FileDown className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button onClick={() => navigate({ to: '/dashboard/hr/leave/compensatory/new' })}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isArabic ? 'طلب إجازة تعويضية' : 'New Request'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'إجمالي الطلبات' : 'Total Requests'}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingApproval}{' '}
                {isArabic ? 'قيد الموافقة' : 'pending approval'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'الأيام المكتسبة' : 'Days Earned'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDaysEarned}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalDaysUsed} {isArabic ? 'مستخدم' : 'used'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'الرصيد المتبقي' : 'Remaining Balance'}
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDaysRemaining}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.utilizationRate || 0) * 100).toFixed(0)}%{' '}
                {isArabic ? 'نسبة الاستخدام' : 'utilization rate'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'ينتهي قريباً' : 'Expiring Soon'}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expiringInNext30Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? 'خلال 30 يوم' : 'within 30 days'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isArabic ? 'البحث والتصفية' : 'Search & Filter'}</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search
                className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`}
              />
              <Input
                placeholder={
                  isArabic ? 'البحث بالموظف أو الرقم...' : 'Search by employee or number...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-9' : 'pl-9'}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'جميع الحالات' : 'All Statuses'}
                </SelectItem>
                {Object.entries(COMPENSATORY_STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {isArabic ? label.ar : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'السبب' : 'Reason'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'جميع الأسباب' : 'All Reasons'}
                </SelectItem>
                {Object.entries(WORK_REASON_LABELS).map(([reason, label]) => (
                  <SelectItem key={reason} value={reason}>
                    {isArabic ? label.ar : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'السنة' : 'Year'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'جميع السنوات' : 'All Years'}
                </SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'الترتيب حسب' : 'Sort By'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workFromDate">
                  {isArabic ? 'تاريخ العمل' : 'Work Date'}
                </SelectItem>
                <SelectItem value="leaveDaysEarned">
                  {isArabic ? 'الأيام المكتسبة' : 'Days Earned'}
                </SelectItem>
                <SelectItem value="validUntil">
                  {isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}
                </SelectItem>
                <SelectItem value="createdAt">
                  {isArabic ? 'تاريخ الطلب' : 'Request Date'}
                </SelectItem>
                <SelectItem value="employeeName">
                  {isArabic ? 'اسم الموظف' : 'Employee Name'}
                </SelectItem>
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
              <span className="font-medium">
                {selectedIds.length} {isArabic ? 'محدد' : 'selected'}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setIsSelectionMode(false)}>
                {isArabic ? 'إلغاء التحديد' : 'Cancel Selection'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={handleBulkApprove}>
                <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isArabic ? 'موافقة' : 'Approve'}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkReject}>
                <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isArabic ? 'رفض' : 'Reject'}
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
              <p>{isArabic ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                {isArabic ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {isArabic
                  ? 'لا توجد طلبات إجازة تعويضية'
                  : 'No compensatory leave requests'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
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
                        aria-label={isArabic ? 'تحديد الكل' : 'Select All'}
                      />
                    </TableHead>
                  )}
                  <TableHead>{isArabic ? 'رقم الطلب' : 'Request ID'}</TableHead>
                  <TableHead>{isArabic ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead>{isArabic ? 'القسم' : 'Department'}</TableHead>
                  <TableHead>{isArabic ? 'السبب' : 'Reason'}</TableHead>
                  <TableHead>{isArabic ? 'تاريخ العمل' : 'Work Date'}</TableHead>
                  <TableHead>{isArabic ? 'الساعات' : 'Hours'}</TableHead>
                  <TableHead>{isArabic ? 'الأيام المكتسبة' : 'Days Earned'}</TableHead>
                  <TableHead>{isArabic ? 'الرصيد' : 'Balance'}</TableHead>
                  <TableHead>{isArabic ? 'صلاحية حتى' : 'Valid Until'}</TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const statusConfig = STATUS_CONFIG[request.status]
                  const StatusIcon = statusConfig.icon
                  const daysUntilExpiry = differenceInDays(
                    new Date(request.validUntil),
                    new Date()
                  )

                  return (
                    <TableRow key={request._id}>
                      {isSelectionMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(request._id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(request._id, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{request.requestId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {isArabic ? request.employeeNameAr : request.employeeName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.employeeNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isArabic
                          ? request.departmentNameAr || request.departmentName
                          : request.departmentName || request.departmentNameAr}
                      </TableCell>
                      <TableCell>
                        {isArabic
                          ? WORK_REASON_LABELS[request.reason]?.ar || request.reason
                          : WORK_REASON_LABELS[request.reason]?.en || request.reason}
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.workFromDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {request.hoursWorked} {isArabic ? 'ساعة' : 'hours'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.leaveDaysEarned} {isArabic ? 'يوم' : 'days'}
                      </TableCell>
                      <TableCell>
                        {request.daysRemaining} {isArabic ? 'يوم' : 'days'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getExpiryBadgeVariant(request.validUntil)}>
                          {daysUntilExpiry < 0
                            ? isArabic
                              ? 'منتهي'
                              : 'Expired'
                            : `${daysUntilExpiry} ${isArabic ? 'يوم' : 'days'}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant as any}>
                          <StatusIcon className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {isArabic ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
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
                              onClick={() =>
                                navigate({
                                  to: `/dashboard/hr/leave/compensatory/${request._id}`,
                                })
                              }
                            >
                              <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {isArabic ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                            {request.status === 'draft' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate({
                                      to: `/dashboard/hr/leave/compensatory/${request._id}/edit`,
                                    })
                                  }
                                >
                                  <Edit3 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                  {isArabic ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setRequestToDelete(request._id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                  {isArabic ? 'حذف' : 'Delete'}
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
      {requestsData?.pagination && requestsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isArabic
              ? `عرض ${requests.length} من ${requestsData.pagination.total} نتيجة`
              : `Showing ${requests.length} of ${requestsData.pagination.total} results`}
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
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد من حذف طلب الإجازة التعويضية هذا؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this compensatory leave request? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isArabic ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {isArabic ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
