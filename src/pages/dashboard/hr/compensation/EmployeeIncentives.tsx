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

  const handleDelete = async (id: string) => {
    if (
      confirm(
        isArabic
          ? 'هل أنت متأكد من حذف هذا الحافز؟'
          : 'Are you sure you want to delete this incentive?'
      )
    ) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleApprove = async (id: string) => {
    if (
      confirm(
        isArabic
          ? 'هل تريد الموافقة على هذا الحافز؟'
          : 'Do you want to approve this incentive?'
      )
    ) {
      await approveMutation.mutateAsync({ id })
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt(
      isArabic ? 'الرجاء إدخال سبب الرفض:' : 'Please enter rejection reason:'
    )
    if (reason) {
      await rejectMutation.mutateAsync({
        id,
        data: { reason, reasonAr: reason },
      })
    }
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      incentiveType: selectedType === 'all' ? undefined : selectedType,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search: searchQuery,
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIncentives.length === 0) {
      toast.error(isArabic ? 'الرجاء اختيار حوافز' : 'Please select incentives')
      return
    }
    if (
      confirm(
        isArabic
          ? `هل تريد حذف ${selectedIncentives.length} حافز؟`
          : `Do you want to delete ${selectedIncentives.length} incentives?`
      )
    ) {
      await bulkDeleteMutation.mutateAsync(selectedIncentives)
      setSelectedIncentives([])
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
            {isArabic ? 'حوافز الموظفين' : 'Employee Incentives'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة المكافآت والحوافز للموظفين'
              : 'Manage employee bonuses and incentives'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button variant="outline" onClick={handleBulkCreate}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {isArabic ? 'إنشاء جماعي' : 'Bulk Create'}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {isArabic ? 'حافز جديد' : 'New Incentive'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الحوافز' : 'Total Incentives'}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIncentives || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'إجمالي القيمة: ' : 'Total Value: '}
              {formatCurrency(stats?.totalAmount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'متوسط الحافز' : 'Average Incentive'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.averageAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'لكل موظف' : 'Per employee'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'بانتظار الموافقة' : 'Pending Approval'}
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'يحتاج موافقة' : 'Needs approval'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'تمت المعالجة هذا الشهر' : 'Processed This Month'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.processedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'في الرواتب' : 'In payroll'}
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
                  placeholder={isArabic ? 'بحث...' : 'Search...'}
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
                  <SelectValue placeholder={isArabic ? 'نوع الحافز' : 'Incentive Type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                  {Object.entries(incentiveTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {isArabic ? label.ar : label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as IncentiveStatus | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                  {Object.entries(incentiveStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {isArabic ? label.ar : label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedIncentives.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted p-4">
              <span className="text-sm">
                {isArabic ? 'تم اختيار' : 'Selected'} {selectedIncentives.length}{' '}
                {isArabic ? 'حافز' : 'incentive(s)'}
              </span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isArabic ? 'حذف المحدد' : 'Delete Selected'}
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
                  <TableHead>{isArabic ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                  <TableHead>{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{isArabic ? 'السبب' : 'Reason'}</TableHead>
                  <TableHead>{isArabic ? 'تاريخ الرواتب' : 'Payroll Date'}</TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-right">
                    {isArabic ? 'الإجراءات' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incentives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {isArabic ? 'لا توجد حوافز' : 'No incentives found'}
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
                            {isArabic ? incentive.employeeNameAr : incentive.employeeName}
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
                          {isArabic
                            ? incentiveTypeLabels[incentive.incentiveType].ar
                            : incentiveTypeLabels[incentive.incentiveType].en}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(incentive.incentiveAmount, incentive.currency)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {isArabic ? incentive.incentiveReasonAr : incentive.incentiveReason}
                      </TableCell>
                      <TableCell>{formatDate(incentive.payrollDate)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(incentive.status)}>
                          {isArabic
                            ? incentiveStatusLabels[incentive.status].ar
                            : incentiveStatusLabels[incentive.status].en}
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
                              {isArabic ? 'الإجراءات' : 'Actions'}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {incentive.status === 'draft' && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(incentive)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {isArabic ? 'تعديل' : 'Edit'}
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
                                  {isArabic ? 'موافقة' : 'Approve'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleReject(incentive._id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {isArabic ? 'رفض' : 'Reject'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(incentive._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isArabic ? 'حذف' : 'Delete'}
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
    </div>
  )
}
