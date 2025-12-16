import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Building2,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { StaffingPlanDetailDialog } from '@/components/hr/recruitment/StaffingPlanDetailDialog'
import {
  useStaffingPlan,
  usePlanProgress,
  useRemovePlanDetail,
  useActivatePlan,
  useClosePlan,
  useApprovePlan,
  useCreateJobOpeningFromPlan,
  useUnlinkJobOpening,
} from '@/hooks/useStaffingPlan'
import type { StaffingPlanDetail } from '@/services/staffingPlanService'
import { PLAN_STATUS_LABELS, PLAN_PRIORITY_LABELS } from '@/services/staffingPlanService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function StaffingPlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()

  // State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<StaffingPlanDetail | undefined>()

  // Queries
  const { data: plan, isLoading } = useStaffingPlan(id!)
  const { data: progress } = usePlanProgress(id!)

  // Mutations
  const removeDetailMutation = useRemovePlanDetail()
  const activateMutation = useActivatePlan()
  const closeMutation = useClosePlan()
  const approveMutation = useApprovePlan()
  const createJobOpeningMutation = useCreateJobOpeningFromPlan()
  const unlinkJobOpeningMutation = useUnlinkJobOpening()

  // Handlers
  const handleBack = () => {
    navigate({ to: '/dashboard/hr/recruitment/staffing-plans' })
  }

  const handleAddDetail = () => {
    setSelectedDetail(undefined)
    setDetailDialogOpen(true)
  }

  const handleEditDetail = (detail: StaffingPlanDetail) => {
    setSelectedDetail(detail)
    setDetailDialogOpen(true)
  }

  const handleDeleteDetail = async (detailId: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذه التفاصيل؟' : 'Are you sure you want to delete this detail?')) {
      await removeDetailMutation.mutateAsync({ planId: id!, detailId })
    }
  }

  const handleActivate = async () => {
    if (confirm(isArabic ? 'هل تريد تفعيل هذه الخطة؟' : 'Do you want to activate this plan?')) {
      await activateMutation.mutateAsync(id!)
    }
  }

  const handleClose = async () => {
    if (confirm(isArabic ? 'هل تريد إغلاق هذه الخطة؟' : 'Do you want to close this plan?')) {
      await closeMutation.mutateAsync({ planId: id! })
    }
  }

  const handleApprove = async () => {
    if (confirm(isArabic ? 'هل تريد اعتماد هذه الخطة؟' : 'Do you want to approve this plan?')) {
      await approveMutation.mutateAsync({ planId: id! })
    }
  }

  const handleCreateJobOpening = async (detailId: string) => {
    if (confirm(isArabic ? 'إنشاء إعلان وظيفي من هذه التفاصيل؟' : 'Create job opening from this detail?')) {
      await createJobOpeningMutation.mutateAsync({ planId: id!, detailId })
    }
  }

  const handleUnlinkJobOpening = async (detailId: string) => {
    if (confirm(isArabic ? 'إلغاء ربط إعلان الوظيفة؟' : 'Unlink job opening?')) {
      await unlinkJobOpeningMutation.mutateAsync({ planId: id!, detailId })
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: isArabic ? ar : undefined })
  }

  const getStatusBadge = (status: string) => {
    const label = PLAN_STATUS_LABELS[status as keyof typeof PLAN_STATUS_LABELS]
    if (!label) return null
    return (
      <Badge className={`bg-${label.color}-100 text-${label.color}-700`}>
        {isArabic ? label.ar : label.en}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const label = PLAN_PRIORITY_LABELS[priority as keyof typeof PLAN_PRIORITY_LABELS]
    if (!label) return null
    return (
      <Badge className={`bg-${label.color}-100 text-${label.color}-700`}>
        {isArabic ? label.ar : label.en}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            {isArabic ? 'لم يتم العثور على الخطة' : 'Plan not found'}
          </h3>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isArabic ? 'العودة' : 'Go Back'}
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = progress?.progressPercentage || 0

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {isArabic ? plan.nameAr || plan.name : plan.name}
              </h1>
              {getStatusBadge(plan.status)}
            </div>
            <p className="text-muted-foreground">
              {formatDate(plan.fromDate)} - {formatDate(plan.toDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {plan.status === 'draft' && (
            <>
              <Button variant="outline" onClick={handleApprove}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isArabic ? 'اعتماد' : 'Approve'}
              </Button>
              <Button onClick={handleActivate}>
                {isArabic ? 'تفعيل' : 'Activate'}
              </Button>
            </>
          )}
          {plan.status === 'active' && (
            <Button variant="outline" onClick={handleClose}>
              <XCircle className="mr-2 h-4 w-4" />
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الشواغر' : 'Total Vacancies'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.totalVacancies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {plan.totalCurrentCount || 0} {isArabic ? 'موظف حالي' : 'current employees'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الميزانية المقدرة' : 'Estimated Budget'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
                style: 'currency',
                currency: 'SAR',
                maximumFractionDigits: 0,
              }).format(plan.totalEstimatedBudget || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'تقدم الخطة' : 'Plan Progress'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'عدد المناصب' : 'Positions'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plan.staffingPlanDetails?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'تفاصيل المناصب' : 'position details'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'معلومات الخطة' : 'Plan Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'اسم الخطة' : 'Plan Name'}
              </label>
              <p className="mt-1 text-sm">
                {isArabic ? plan.nameAr || plan.name : plan.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الشركة' : 'Company'}
              </label>
              <p className="mt-1 text-sm">{plan.company || '-'}</p>
            </div>
          </div>

          {plan.approvedBy && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'معتمد من قبل' : 'Approved By'}
              </label>
              <p className="mt-1 text-sm">
                {plan.approvedBy} - {formatDate(plan.approvedAt!)}
              </p>
            </div>
          )}

          {plan.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الملاحظات' : 'Notes'}
              </label>
              <p className="mt-1 text-sm">
                {isArabic ? plan.notesAr || plan.notes : plan.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Details Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isArabic ? 'تفاصيل المناصب' : 'Position Details'}</CardTitle>
              <CardDescription>
                {plan.staffingPlanDetails?.length || 0}{' '}
                {isArabic ? 'منصب' : 'positions'}
              </CardDescription>
            </div>
            <Button onClick={handleAddDetail}>
              <Plus className="mr-2 h-4 w-4" />
              {isArabic ? 'إضافة منصب' : 'Add Position'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!plan.staffingPlanDetails || plan.staffingPlanDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                {isArabic ? 'لا توجد تفاصيل مناصب' : 'No position details'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'قم بإضافة تفاصيل المناصب للبدء'
                  : 'Add position details to get started'}
              </p>
              <Button onClick={handleAddDetail} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {isArabic ? 'إضافة منصب' : 'Add Position'}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isArabic ? 'القسم' : 'Department'}</TableHead>
                  <TableHead>{isArabic ? 'المسمى الوظيفي' : 'Designation'}</TableHead>
                  <TableHead className="text-center">{isArabic ? 'مخطط' : 'Planned'}</TableHead>
                  <TableHead className="text-center">{isArabic ? 'حالي' : 'Current'}</TableHead>
                  <TableHead className="text-center">{isArabic ? 'شواغر' : 'Vacancies'}</TableHead>
                  <TableHead>{isArabic ? 'الأولوية' : 'Priority'}</TableHead>
                  <TableHead className="text-right">{isArabic ? 'الميزانية' : 'Budget'}</TableHead>
                  <TableHead>{isArabic ? 'إعلان الوظيفة' : 'Job Opening'}</TableHead>
                  <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.staffingPlanDetails.map((detail) => (
                  <TableRow key={detail.detailId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {isArabic ? detail.departmentNameAr || detail.departmentName : detail.departmentName}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {isArabic ? detail.designationAr || detail.designation : detail.designation}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{detail.numberOfPositions}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{detail.currentCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-700">
                        {detail.vacancies}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(detail.priority)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
                        style: 'currency',
                        currency: 'SAR',
                        maximumFractionDigits: 0,
                      }).format(detail.totalEstimatedBudget || 0)}
                    </TableCell>
                    <TableCell>
                      {detail.jobOpeningId ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {detail.jobOpeningStatus}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleUnlinkJobOpening(detail.detailId)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateJobOpening(detail.detailId)}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          {isArabic ? 'إنشاء' : 'Create'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {isArabic ? 'الإجراءات' : 'Actions'}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditDetail(detail)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {isArabic ? 'تعديل' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteDetail(detail.detailId)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isArabic ? 'حذف' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <StaffingPlanDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        planId={id!}
        detail={selectedDetail}
      />
    </div>
  )
}
