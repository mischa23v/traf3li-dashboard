import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StaffingPlanDialog } from '@/components/hr/recruitment/StaffingPlanDialog'
import {
  useStaffingPlans,
  useStaffingPlanStats,
  useDeleteStaffingPlan,
  useDuplicateStaffingPlan,
  useActivatePlan,
  useClosePlan,
  useExportStaffingPlans,
} from '@/hooks/useStaffingPlan'
import type { StaffingPlan, PlanStatus } from '@/services/staffingPlanService'
import { PLAN_STATUS_LABELS } from '@/services/staffingPlanService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function StaffingPlansPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PlanStatus | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<StaffingPlan | undefined>()

  // Queries
  const { data: plansData, isLoading } = useStaffingPlans({
    search: searchQuery,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  })
  const { data: stats } = useStaffingPlanStats()

  // Mutations
  const deleteMutation = useDeleteStaffingPlan()
  const duplicateMutation = useDuplicateStaffingPlan()
  const activateMutation = useActivatePlan()
  const closeMutation = useClosePlan()
  const exportMutation = useExportStaffingPlans()

  const plans = plansData?.data || []

  // Handlers
  const handleCreate = () => {
    setSelectedPlan(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (plan: StaffingPlan) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  const handleView = (plan: StaffingPlan) => {
    navigate(`/dashboard/hr/recruitment/staffing-plans/${plan._id}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذه الخطة؟' : 'Are you sure you want to delete this plan?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync({ planId: id })
  }

  const handleActivate = async (id: string) => {
    await activateMutation.mutateAsync(id)
  }

  const handleClose = async (id: string) => {
    await closeMutation.mutateAsync({ planId: id })
  }

  const handleExport = async (format: 'pdf' | 'excel' = 'excel') => {
    const blob = await exportMutation.mutateAsync({ format })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `staffing-plans.${format === 'pdf' ? 'pdf' : 'xlsx'}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: isArabic ? ar : undefined })
  }

  const getStatusBadge = (status: PlanStatus) => {
    const label = PLAN_STATUS_LABELS[status]
    return (
      <Badge className={`bg-${label.color}-100 text-${label.color}-700`}>
        {isArabic ? label.ar : label.en}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'خطط التوظيف' : 'Staffing Plans'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة خطط التوظيف وتخطيط القوى العاملة حسب الأقسام'
              : 'Manage staffing plans and workforce planning by department'}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {isArabic ? 'تصدير' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                {isArabic ? 'تصدير Excel' : 'Export Excel'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                {isArabic ? 'تصدير PDF' : 'Export PDF'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {isArabic ? 'خطة جديدة' : 'New Plan'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الخطط' : 'Total Plans'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPlans || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activePlans || 0} {isArabic ? 'نشط' : 'active'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الشواغر' : 'Total Vacancies'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVacancies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'وظائف شاغرة' : 'vacant positions'}
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
              }).format(stats?.totalBudget || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'ميزانية التوظيف' : 'hiring budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'حسب القسم' : 'By Department'}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byDepartment?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'أقسام مختلفة' : 'different departments'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'البحث والتصفية' : 'Search & Filter'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'البحث عن خطة...' : 'Search plans...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as PlanStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="draft">{isArabic ? 'مسودة' : 'Draft'}</SelectItem>
                <SelectItem value="active">{isArabic ? 'نشط' : 'Active'}</SelectItem>
                <SelectItem value="closed">{isArabic ? 'مغلق' : 'Closed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'خطط التوظيف' : 'Staffing Plans'}</CardTitle>
          <CardDescription>
            {isArabic
              ? `${plans.length} خطة توظيف`
              : `${plans.length} staffing plans`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">
                {isArabic ? 'لا توجد خطط توظيف' : 'No staffing plans'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'قم بإنشاء خطة توظيف جديدة للبدء'
                  : 'Create a new staffing plan to get started'}
              </p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {isArabic ? 'خطة جديدة' : 'New Plan'}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isArabic ? 'اسم الخطة' : 'Plan Name'}</TableHead>
                  <TableHead>{isArabic ? 'الفترة' : 'Period'}</TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-center">{isArabic ? 'الشواغر' : 'Vacancies'}</TableHead>
                  <TableHead className="text-right">{isArabic ? 'الميزانية' : 'Budget'}</TableHead>
                  <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {isArabic ? plan.nameAr || plan.name : plan.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {plan.staffingPlanDetails?.length || 0}{' '}
                          {isArabic ? 'تفاصيل' : 'details'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(plan.fromDate)} - {formatDate(plan.toDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {plan.totalVacancies || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
                        style: 'currency',
                        currency: 'SAR',
                        maximumFractionDigits: 0,
                      }).format(plan.totalEstimatedBudget || 0)}
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
                          <DropdownMenuItem onClick={() => handleView(plan)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {isArabic ? 'عرض' : 'View'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {isArabic ? 'تعديل' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(plan._id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            {isArabic ? 'نسخ' : 'Duplicate'}
                          </DropdownMenuItem>
                          {plan.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleActivate(plan._id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {isArabic ? 'تفعيل' : 'Activate'}
                            </DropdownMenuItem>
                          )}
                          {plan.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleClose(plan._id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              {isArabic ? 'إغلاق' : 'Close'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan._id)}
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
      <StaffingPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
      />
    </div>
  )
}
