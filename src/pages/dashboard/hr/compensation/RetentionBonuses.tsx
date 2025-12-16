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
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Send,
  Ban,
  FileText,
  BarChart3
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RetentionBonusDialog } from '@/components/hr/compensation/RetentionBonusDialog'
import {
  useRetentionBonuses,
  useRetentionBonusStats,
  useDeleteRetentionBonus,
  useSubmitForApproval,
  useApproveBonus,
  useRejectBonus,
  useCancelBonus,
  useMarkBonusAsPaid,
  useExportBonuses,
} from '@/hooks/useRetentionBonus'
import type { RetentionBonus } from '@/services/retentionBonusService'
import {
  BonusStatus,
  BonusType,
  PaymentMethod,
  bonusStatusLabels,
  bonusTypeLabels,
} from '@/services/retentionBonusService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function RetentionBonusesPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BonusStatus | 'all'>('all')
  const [selectedType, setSelectedType] = useState<BonusType | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedBonus, setSelectedBonus] = useState<RetentionBonus | undefined>()
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'cancel' | 'pay' | null>(null)
  const [actionComments, setActionComments] = useState('')
  const [paymentReference, setPaymentReference] = useState('')

  // Queries
  const { data: bonusesData, isLoading } = useRetentionBonuses({
    search: searchQuery,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    bonusType: selectedType === 'all' ? undefined : selectedType,
  })
  const { data: stats } = useRetentionBonusStats()

  // Mutations
  const deleteMutation = useDeleteRetentionBonus()
  const submitMutation = useSubmitForApproval()
  const approveMutation = useApproveBonus()
  const rejectMutation = useRejectBonus()
  const cancelMutation = useCancelBonus()
  const markPaidMutation = useMarkBonusAsPaid()
  const exportMutation = useExportBonuses()

  const bonuses = bonusesData?.bonuses || []

  // Handlers
  const handleCreate = () => {
    setSelectedBonus(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (bonus: RetentionBonus) => {
    setSelectedBonus(bonus)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذه المكافأة؟' : 'Are you sure you want to delete this bonus?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleSubmitForApproval = async (id: string) => {
    if (confirm(isArabic ? 'هل تريد إرسال هذه المكافأة للموافقة؟' : 'Do you want to submit this bonus for approval?')) {
      await submitMutation.mutateAsync(id)
    }
  }

  const openActionDialog = (bonus: RetentionBonus, action: 'approve' | 'reject' | 'cancel' | 'pay') => {
    setSelectedBonus(bonus)
    setActionType(action)
    setActionComments('')
    setPaymentReference('')
    setActionDialogOpen(true)
  }

  const handleAction = async () => {
    if (!selectedBonus || !actionType) return

    try {
      if (actionType === 'approve') {
        await approveMutation.mutateAsync({
          id: selectedBonus._id,
          data: {
            approverId: 'current-user-id', // This should come from auth context
            comments: actionComments
          }
        })
      } else if (actionType === 'reject') {
        await rejectMutation.mutateAsync({
          id: selectedBonus._id,
          data: {
            approverId: 'current-user-id',
            comments: actionComments
          }
        })
      } else if (actionType === 'cancel') {
        await cancelMutation.mutateAsync({
          id: selectedBonus._id,
          reason: actionComments
        })
      } else if (actionType === 'pay') {
        await markPaidMutation.mutateAsync({
          id: selectedBonus._id,
          data: {
            paymentReference: paymentReference,
            paidAt: new Date().toISOString()
          }
        })
      }
      setActionDialogOpen(false)
    } catch (error) {
      // Error is handled by mutation hooks
    }
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      bonusType: selectedType === 'all' ? undefined : selectedType,
    })
  }

  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: isArabic ? ar : undefined
    })
  }

  const getStatusBadgeVariant = (status: BonusStatus) => {
    switch (status) {
      case BonusStatus.DRAFT:
        return 'secondary'
      case BonusStatus.PENDING_APPROVAL:
        return 'default'
      case BonusStatus.APPROVED:
        return 'outline'
      case BonusStatus.PAID:
        return 'default'
      case BonusStatus.CLAWED_BACK:
        return 'destructive'
      case BonusStatus.CANCELLED:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'مكافآت الاستبقاء' : 'Retention Bonuses'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة مكافآت الاستبقاء والمكافآت الأخرى للموظفين'
              : 'Manage employee retention and other bonuses'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {isArabic ? 'مكافأة جديدة' : 'New Bonus'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المكافآت' : 'Total Bonuses'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBonuses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.totalAmount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'بانتظار الموافقة' : 'Pending Approval'}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'طلبات معلقة' : 'Pending requests'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'مستحقة الدفع' : 'Due for Payment'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dueForPayment || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'مكافآت معتمدة' : 'Approved bonuses'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'متوسط المكافأة' : 'Average Bonus'}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.averageBonusAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'للمكافأة الواحدة' : 'Per bonus'}
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
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as BonusType | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={isArabic ? 'نوع المكافأة' : 'Bonus Type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                  {Object.values(BonusType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {isArabic ? bonusTypeLabels[type].ar : bonusTypeLabels[type].en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as BonusStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                  {Object.values(BonusStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {isArabic ? bonusStatusLabels[status].ar : bonusStatusLabels[status].en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  <TableHead>{isArabic ? 'رقم المكافأة' : 'Bonus ID'}</TableHead>
                  <TableHead>{isArabic ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                  <TableHead>{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{isArabic ? 'تاريخ الدفع' : 'Payment Date'}</TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {isArabic ? 'لا توجد مكافآت' : 'No bonuses found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  bonuses.map((bonus) => (
                    <TableRow key={bonus._id}>
                      <TableCell className="font-mono font-semibold">
                        {bonus.bonusId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {isArabic ? bonus.employeeNameAr : bonus.employeeName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {bonus.designation}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {isArabic ? bonusTypeLabels[bonus.bonusType].ar : bonusTypeLabels[bonus.bonusType].en}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(bonus.bonusAmount, bonus.currency)}
                        </div>
                        {bonus.vestingPeriod && (
                          <div className="text-xs text-muted-foreground">
                            {isArabic ? 'فترة الاستحقاق' : 'Vesting'}: {bonus.vestingPeriod} {isArabic ? 'شهر' : 'months'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(bonus.paymentDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(bonus.status)}>
                          {isArabic ? bonusStatusLabels[bonus.status].ar : bonusStatusLabels[bonus.status].en}
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

                            {bonus.status === BonusStatus.DRAFT && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(bonus)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {isArabic ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSubmitForApproval(bonus._id)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  {isArabic ? 'إرسال للموافقة' : 'Submit for Approval'}
                                </DropdownMenuItem>
                              </>
                            )}

                            {bonus.status === BonusStatus.PENDING_APPROVAL && (
                              <>
                                <DropdownMenuItem onClick={() => openActionDialog(bonus, 'approve')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {isArabic ? 'موافقة' : 'Approve'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openActionDialog(bonus, 'reject')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {isArabic ? 'رفض' : 'Reject'}
                                </DropdownMenuItem>
                              </>
                            )}

                            {bonus.status === BonusStatus.APPROVED && (
                              <DropdownMenuItem onClick={() => openActionDialog(bonus, 'pay')}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                {isArabic ? 'تسجيل الدفع' : 'Mark as Paid'}
                              </DropdownMenuItem>
                            )}

                            {(bonus.status === BonusStatus.DRAFT || bonus.status === BonusStatus.PENDING_APPROVAL) && (
                              <DropdownMenuItem
                                onClick={() => openActionDialog(bonus, 'cancel')}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {isArabic ? 'إلغاء' : 'Cancel'}
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {bonus.status === BonusStatus.DRAFT && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(bonus._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isArabic ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            )}
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

      {/* Create/Edit Dialog */}
      <RetentionBonusDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bonus={selectedBonus}
      />

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && (isArabic ? 'الموافقة على المكافأة' : 'Approve Bonus')}
              {actionType === 'reject' && (isArabic ? 'رفض المكافأة' : 'Reject Bonus')}
              {actionType === 'cancel' && (isArabic ? 'إلغاء المكافأة' : 'Cancel Bonus')}
              {actionType === 'pay' && (isArabic ? 'تسجيل الدفع' : 'Mark as Paid')}
            </DialogTitle>
            <DialogDescription>
              {selectedBonus && (
                <span>
                  {isArabic ? 'الموظف: ' : 'Employee: '}
                  {isArabic ? selectedBonus.employeeNameAr : selectedBonus.employeeName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === 'pay' ? (
              <div className="space-y-2">
                <Label htmlFor="paymentReference">
                  {isArabic ? 'مرجع الدفع' : 'Payment Reference'}
                </Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={isArabic ? 'أدخل مرجع الدفع' : 'Enter payment reference'}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {isArabic ? 'الملاحظات' : 'Comments'}
                </Label>
                <Textarea
                  id="comments"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder={isArabic ? 'أدخل الملاحظات...' : 'Enter comments...'}
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAction}>
              {isArabic ? 'تأكيد' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
