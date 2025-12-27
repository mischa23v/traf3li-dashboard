/**
 * Asset Maintenance List View
 * Complete maintenance schedule management with tabs, filters, and actions
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Wrench,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Play,
  XCircle,
  Filter,
  User,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  useMaintenanceSchedules,
  useCreateMaintenanceSchedule,
  useCompleteMaintenanceSchedule,
} from '@/hooks/use-assets'
import type { MaintenanceSchedule, MaintenanceStatus } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.assets', href: ROUTES.dashboard.assets.list },
  { title: 'assets.maintenance', href: ROUTES.dashboard.assets.maintenance.list },
]

// Extended interface for maintenance with asset details
interface MaintenanceScheduleExtended extends MaintenanceSchedule {
  maintenanceNumber?: string
  assetName?: string
  assetNumber?: string
  assetId?: string
}

export function MaintenanceListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all' | 'in_progress'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [scheduleToComplete, setScheduleToComplete] = useState<MaintenanceScheduleExtended | null>(null)

  // Build filters
  const filters = useMemo(() => {
    const f: { status?: string } = {}

    // Map tab statuses to API filters
    if (statusFilter === 'in_progress') {
      // In progress is not a database status, we'll filter client-side
      f.status = 'planned'
    } else if (statusFilter !== 'all') {
      f.status = statusFilter
    }

    return f
  }, [statusFilter])

  // Queries
  const { data: schedulesData, isLoading, error } = useMaintenanceSchedules(filters)
  const completeScheduleMutation = useCompleteMaintenanceSchedule()

  // Transform data and apply client-side filters
  const maintenanceSchedules = useMemo(() => {
    if (!schedulesData) return []

    let schedules = schedulesData.map((schedule, index) => ({
      ...schedule,
      maintenanceNumber: schedule._id || `MAINT-${String(index + 1).padStart(5, '0')}`,
      assetName: 'أصل افتراضي', // Would come from API in real scenario
      assetNumber: `AST-${String(index + 1).padStart(5, '0')}`,
    })) as MaintenanceScheduleExtended[]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      schedules = schedules.filter(
        (s) =>
          s.maintenanceNumber?.toLowerCase().includes(searchLower) ||
          s.assetName?.toLowerCase().includes(searchLower) ||
          s.assetNumber?.toLowerCase().includes(searchLower) ||
          s.assignedToName?.toLowerCase().includes(searchLower)
      )
    }

    // Apply date range filter
    if (dateFrom || dateTo) {
      schedules = schedules.filter((s) => {
        const dueDate = new Date(s.dueDate || s.maintenanceDate)
        const from = dateFrom ? new Date(dateFrom) : null
        const to = dateTo ? new Date(dateTo) : null

        if (from && dueDate < from) return false
        if (to && dueDate > to) return false
        return true
      })
    }

    // Filter for in_progress (client-side check for started but not completed)
    if (statusFilter === 'in_progress') {
      const now = new Date()
      schedules = schedules.filter((s) => {
        if (s.status !== 'planned') return false
        const dueDate = new Date(s.dueDate || s.maintenanceDate)
        const startDate = new Date(s.maintenanceDate)
        return startDate <= now && dueDate >= now
      })
    }

    return schedules
  }, [schedulesData, search, dateFrom, dateTo, statusFilter])

  // Stats calculations
  const totalMaintenance = maintenanceSchedules.length
  const plannedMaintenance = maintenanceSchedules.filter((s) => s.status === 'planned').length

  // Overdue: planned but past due date
  const overdueMaintenance = maintenanceSchedules.filter((s) => {
    if (s.status !== 'planned') return false
    const dueDate = new Date(s.dueDate || s.maintenanceDate)
    return dueDate < new Date()
  }).length

  // Completed this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const completedThisMonth = maintenanceSchedules.filter((s) => {
    if (s.status !== 'completed' || !s.completedDate) return false
    const completedDate = new Date(s.completedDate)
    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
  }).length

  // Handlers
  const handleComplete = async () => {
    if (!scheduleToComplete || !scheduleToComplete.assetId || !scheduleToComplete._id) return

    await completeScheduleMutation.mutateAsync({
      assetId: scheduleToComplete.assetId,
      scheduleId: scheduleToComplete._id,
      data: {
        completedDate: new Date().toISOString(),
      },
    })

    setCompleteDialogOpen(false)
    setScheduleToComplete(null)
  }

  const handleStartMaintenance = (schedule: MaintenanceScheduleExtended) => {
    // Navigate to maintenance start/edit page
    if (schedule._id) {
      navigate({ to: ROUTES.dashboard.assets.maintenance.start(schedule._id) })
    }
  }

  const getStatusBadge = (status: MaintenanceStatus, dueDate?: string) => {
    // Check if overdue
    const isOverdue = status === 'planned' && dueDate && new Date(dueDate) < new Date()

    if (isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 ml-1" />
          {t('assets.maintenance.status.overdue', 'متأخر')}
        </Badge>
      )
    }

    switch (status) {
      case 'planned':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 ml-1" />
            {t('assets.maintenance.status.planned', 'مخطط')}
          </Badge>
        )
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 ml-1" />
            {t('assets.maintenance.status.overdue', 'متأخر')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('assets.maintenance.status.completed', 'مكتمل')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline">
            <XCircle className="w-3 h-3 ml-1" />
            {t('assets.maintenance.status.cancelled', 'ملغي')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMaintenanceTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; color: string }> = {
      scheduled: { label: t('assets.maintenance.type.scheduled', 'صيانة دورية'), color: 'bg-purple-100 text-purple-700' },
      preventive: { label: t('assets.maintenance.type.preventive', 'صيانة وقائية'), color: 'bg-green-100 text-green-700' },
      breakdown: { label: t('assets.maintenance.type.breakdown', 'صيانة عطل'), color: 'bg-red-100 text-red-700' },
      corrective: { label: t('assets.maintenance.type.corrective', 'صيانة تصحيحية'), color: 'bg-orange-100 text-orange-700' },
      inspection: { label: t('assets.maintenance.type.inspection', 'فحص'), color: 'bg-blue-100 text-blue-700' },
    }

    const config = typeConfig[type.toLowerCase()] || {
      label: type,
      color: 'bg-gray-100 text-gray-700'
    }

    return (
      <Badge className={`${config.color} border-0 rounded-md`}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('assets.badge', 'إدارة الأصول')}
          title={t('assets.maintenance.title', 'جدولة الصيانة')}
          type="assets"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{totalMaintenance}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.maintenance.stats.total', 'إجمالي الصيانة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{plannedMaintenance}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.maintenance.stats.planned', 'مخطط')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{overdueMaintenance}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.maintenance.stats.overdue', 'متأخر')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{completedThisMonth}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.maintenance.stats.completedThisMonth', 'مكتمل هذا الشهر')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as MaintenanceStatus | 'all' | 'in_progress')}
                >
                  <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all">{t('common.all', 'الكل')}</TabsTrigger>
                    <TabsTrigger value="planned">
                      {t('assets.maintenance.status.planned', 'مخطط')}
                    </TabsTrigger>
                    <TabsTrigger value="overdue">
                      {t('assets.maintenance.status.overdue', 'متأخر')}
                    </TabsTrigger>
                    <TabsTrigger value="in_progress">
                      {t('assets.maintenance.status.inProgress', 'قيد التنفيذ')}
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      {t('assets.maintenance.status.completed', 'مكتمل')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Search and Create Button Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          'assets.maintenance.searchPlaceholder',
                          'البحث برقم الصيانة أو الأصل...'
                        )}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 rounded-xl"
                      />
                    </div>
                    <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      <Link to={ROUTES.dashboard.assets.maintenance.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('assets.maintenance.scheduleMaintenance', 'جدولة صيانة')}
                      </Link>
                    </Button>
                  </div>

                  {/* Date Range Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          placeholder={t('assets.maintenance.dateFrom', 'من تاريخ')}
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="pr-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          placeholder={t('assets.maintenance.dateTo', 'إلى تاريخ')}
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="pr-10 rounded-xl"
                        />
                      </div>
                    </div>
                    {(dateFrom || dateTo || search) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDateFrom('')
                          setDateTo('')
                          setSearch('')
                        }}
                        className="rounded-xl"
                      >
                        {t('common.clearFilters', 'مسح الفلاتر')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Schedules Table */}
            <Card className="rounded-3xl">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-500">
                    {t('common.error', 'حدث خطأ في تحميل البيانات')}
                  </div>
                ) : maintenanceSchedules.length === 0 ? (
                  <div className="p-12 text-center">
                    <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('assets.maintenance.noSchedules', 'لا توجد جداول صيانة')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('assets.maintenance.noSchedulesDesc', 'ابدأ بجدولة صيانة جديدة')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.assets.maintenance.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('assets.maintenance.scheduleMaintenance', 'جدولة صيانة')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('assets.maintenance.maintenanceNumber', 'رقم الصيانة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('assets.maintenance.assetName', 'اسم الأصل')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('assets.maintenance.type', 'النوع')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('assets.maintenance.dueDate', 'تاريخ الاستحقاق')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('assets.maintenance.assignedTo', 'مسند إلى')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('assets.maintenance.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maintenanceSchedules.map((schedule) => (
                          <TableRow
                            key={schedule._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                              if (schedule._id) {
                                navigate({ to: ROUTES.dashboard.assets.maintenance.detail(schedule._id) })
                              }
                            }}
                          >
                            <TableCell className="font-mono text-sm">
                              {schedule.maintenanceNumber}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{schedule.assetName}</div>
                              <div className="text-sm text-muted-foreground">
                                {schedule.assetNumber}
                              </div>
                            </TableCell>
                            <TableCell>{getMaintenanceTypeBadge(schedule.maintenanceType)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {formatDate(schedule.dueDate || schedule.maintenanceDate)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {schedule.assignedToName || t('common.unassigned', 'غير مسند')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(schedule.status, schedule.dueDate)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (schedule._id) {
                                        navigate({ to: ROUTES.dashboard.assets.maintenance.detail(schedule._id) })
                                      }
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  {schedule.status === 'planned' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStartMaintenance(schedule)
                                        }}
                                      >
                                        <Play className="w-4 h-4 ml-2 text-blue-500" />
                                        {t('assets.maintenance.start', 'بدء الصيانة')}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (schedule._id) {
                                            navigate({
                                              to: ROUTES.dashboard.assets.maintenance.edit(schedule._id),
                                            })
                                          }
                                        }}
                                      >
                                        <Edit className="w-4 h-4 ml-2" />
                                        {t('common.edit', 'تعديل')}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {schedule.status === 'planned' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setScheduleToComplete(schedule)
                                          setCompleteDialogOpen(true)
                                        }}
                                        className="text-emerald-600"
                                      >
                                        <CheckCircle2 className="w-4 h-4 ml-2" />
                                        {t('assets.maintenance.complete', 'إكمال')}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {schedule.status === 'completed' && schedule.cost && (
                                    <DropdownMenuItem disabled>
                                      <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">
                                          {t('assets.maintenance.cost', 'التكلفة')}
                                        </span>
                                        <span className="font-medium">
                                          {formatCurrency(schedule.cost)}
                                        </span>
                                      </div>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <AssetsSidebar />
        </div>
      </Main>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('assets.maintenance.completeConfirmTitle', 'إكمال الصيانة')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'assets.maintenance.completeConfirmDesc',
                'هل أنت متأكد من إكمال هذه الصيانة؟ سيتم تحديث حالة الأصل.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {t('assets.maintenance.complete', 'إكمال')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
