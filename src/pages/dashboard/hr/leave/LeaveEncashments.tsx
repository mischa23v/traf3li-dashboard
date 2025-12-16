import { useState, useMemo } from 'react'
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
const STATUS_CONFIG: Record<EncashmentStatus, { label: string; labelAr: string; variant: any; icon: any }> = {
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
  paid: {
    label: 'Paid',
    labelAr: 'مدفوع',
    variant: 'default',
    icon: DollarSign,
  },
  rejected: {
    label: 'Rejected',
    labelAr: 'مرفوض',
    variant: 'destructive',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    labelAr: 'ملغي',
    variant: 'outline',
    icon: X,
  },
}

export default function LeaveEncashments() {
  const navigate = useNavigate()
  const { toast } = useToast()

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
        title: 'نجح الحذف',
        description: 'تم حذف طلب الصرف بنجاح',
      })
      setDeleteDialogOpen(false)
      setEncashmentToDelete(null)
    } catch (error: any) {
      toast({
        title: 'فشل الحذف',
        description: error.message || 'فشل حذف طلب الصرف',
        variant: 'destructive',
      })
    }
  }

  // Bulk actions
  const handleBulkApprove = async () => {
    try {
      await bulkApproveMutation.mutateAsync(selectedIds)
      toast({
        title: 'نجحت الموافقة',
        description: `تمت الموافقة على ${selectedIds.length} طلب صرف`,
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: 'فشلت الموافقة',
        description: error.message || 'فشلت الموافقة على الطلبات',
        variant: 'destructive',
      })
    }
  }

  const handleBulkReject = async () => {
    const reason = prompt('أدخل سبب الرفض:')
    if (!reason) return

    try {
      await bulkRejectMutation.mutateAsync({ ids: selectedIds, reason })
      toast({
        title: 'نجح الرفض',
        description: `تم رفض ${selectedIds.length} طلب صرف`,
      })
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error: any) {
      toast({
        title: 'فشل الرفض',
        description: error.message || 'فشل رفض الطلبات',
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
        title: 'نجح التصدير',
        description: 'تم تصدير البيانات بنجاح',
      })
    } catch (error: any) {
      toast({
        title: 'فشل التصدير',
        description: error.message || 'فشل تصدير البيانات',
        variant: 'destructive',
      })
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
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
          <h1 className="text-3xl font-bold">صرف الإجازات</h1>
          <p className="text-muted-foreground mt-1">إدارة طلبات صرف الإجازات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <FileDown className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Button onClick={() => navigate({ to: '/dashboard/hr/leave/encashments/new' })}>
            <Plus className="h-4 w-4 ml-2" />
            طلب صرف جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الموافقة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المبلغ الإجمالي</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط الأيام</CardTitle>
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
            <CardTitle>البحث والتصفية</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالموظف أو الرقم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.labelAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع السنوات</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="الترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requestedAt">تاريخ الطلب</SelectItem>
                <SelectItem value="encashmentAmount">المبلغ</SelectItem>
                <SelectItem value="encashmentDays">عدد الأيام</SelectItem>
                <SelectItem value="employeeName">اسم الموظف</SelectItem>
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
              <span className="font-medium">{selectedIds.length} محدد</span>
              <Button variant="ghost" size="sm" onClick={() => setIsSelectionMode(false)}>
                إلغاء التحديد
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={handleBulkApprove}>
                <CheckCircle className="h-4 w-4 ml-2" />
                موافقة
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkReject}>
                <XCircle className="h-4 w-4 ml-2" />
                رفض
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
              <p>حدث خطأ في تحميل البيانات</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : encashments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد طلبات صرف</p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  مسح الفلاتر
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
                        aria-label="تحديد الكل"
                      />
                    </TableHead>
                  )}
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>الموظف</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>نوع الإجازة</TableHead>
                  <TableHead>الأيام</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الطلب</TableHead>
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
                          <div className="font-medium">{encashment.employeeNameAr}</div>
                          <div className="text-sm text-muted-foreground">{encashment.employeeNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{encashment.departmentNameAr || encashment.departmentName}</TableCell>
                      <TableCell>{encashment.leaveTypeNameAr || encashment.leaveTypeName}</TableCell>
                      <TableCell>{encashment.encashmentDays} يوم</TableCell>
                      <TableCell className="font-medium">{formatCurrency(encashment.encashmentAmount, encashment.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant as any}>
                          <StatusIcon className="h-3 w-3 ml-1" />
                          {statusConfig.labelAr}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(encashment.requestedAt), {
                          addSuffix: true,
                          locale: ar,
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
                              <Eye className="h-4 w-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            {encashment.status === 'draft' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => navigate({ to: `/dashboard/hr/leave/encashments/${encashment._id}/edit` })}
                                >
                                  <Edit3 className="h-4 w-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setEncashmentToDelete(encashment._id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  حذف
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
            عرض {encashments.length} من {encashmentsData.pagination.total} نتيجة
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
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف طلب الصرف هذا؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
