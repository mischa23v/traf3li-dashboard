import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
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
    navigate(ROUTES.dashboard.hr.recruitment.staffingPlans.detail(plan._id))
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('hr.recruitment.staffingPlans.confirmDelete'))) {
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
            {t('hr.recruitment.staffingPlans.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('hr.recruitment.staffingPlans.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t('hr.recruitment.staffingPlans.export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                {t('hr.recruitment.staffingPlans.exportExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                {t('hr.recruitment.staffingPlans.exportPDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('hr.recruitment.staffingPlans.newPlan')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.recruitment.staffingPlans.stats.totalPlans')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPlans || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activePlans || 0} {t('hr.recruitment.staffingPlans.stats.active')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.recruitment.staffingPlans.stats.totalVacancies')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVacancies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('hr.recruitment.staffingPlans.stats.vacantPositions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.recruitment.staffingPlans.stats.estimatedBudget')}
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
              {t('hr.recruitment.staffingPlans.stats.hiringBudget')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.recruitment.staffingPlans.stats.byDepartment')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byDepartment?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('hr.recruitment.staffingPlans.stats.differentDepartments')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hr.recruitment.staffingPlans.filter.searchAndFilter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('hr.recruitment.staffingPlans.filter.searchPlans')}
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
                <SelectValue placeholder={t('hr.recruitment.staffingPlans.filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.recruitment.staffingPlans.filter.all')}</SelectItem>
                <SelectItem value="draft">{t('hr.recruitment.staffingPlans.filter.draft')}</SelectItem>
                <SelectItem value="active">{t('hr.recruitment.staffingPlans.filter.active')}</SelectItem>
                <SelectItem value="closed">{t('hr.recruitment.staffingPlans.filter.closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hr.recruitment.staffingPlans.title')}</CardTitle>
          <CardDescription>
            {plans.length} {t('hr.recruitment.staffingPlans.title').toLowerCase()}
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
                {t('hr.recruitment.staffingPlans.empty.noPlans')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('hr.recruitment.staffingPlans.empty.createToGetStarted')}
              </p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('hr.recruitment.staffingPlans.newPlan')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hr.recruitment.staffingPlans.table.planName')}</TableHead>
                  <TableHead>{t('hr.recruitment.staffingPlans.table.period')}</TableHead>
                  <TableHead>{t('hr.recruitment.staffingPlans.table.status')}</TableHead>
                  <TableHead className="text-center">{t('hr.recruitment.staffingPlans.table.vacancies')}</TableHead>
                  <TableHead className="text-right">{t('hr.recruitment.staffingPlans.table.budget')}</TableHead>
                  <TableHead className="text-right">{t('hr.recruitment.staffingPlans.table.actions')}</TableHead>
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
                          {t('hr.recruitment.staffingPlans.table.details')}
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
                            {t('hr.recruitment.staffingPlans.table.actions')}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleView(plan)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('hr.recruitment.staffingPlans.actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('hr.recruitment.staffingPlans.actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(plan._id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            {t('hr.recruitment.staffingPlans.actions.duplicate')}
                          </DropdownMenuItem>
                          {plan.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleActivate(plan._id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('hr.recruitment.staffingPlans.actions.activate')}
                            </DropdownMenuItem>
                          )}
                          {plan.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleClose(plan._id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              {t('hr.recruitment.staffingPlans.actions.close')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('hr.recruitment.staffingPlans.actions.delete')}
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
