/**
 * Quality Actions List View
 * Corrective and preventive actions management
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Shield,
  AlertCircle,
  TrendingUp,
  Calendar,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

import { useActions } from '@/hooks/use-quality'
import type { QualityAction, ActionStatus, ActionType } from '@/types/quality'
import { QualitySidebar } from './quality-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.quality', href: '/dashboard/quality' },
  { title: 'quality.actions', href: '/dashboard/quality/actions' },
]

export function ActionsListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ActionType | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actionToDelete, setActionToDelete] = useState<QualityAction | null>(null)

  // Build filters
  const filters = useMemo(() => {
    const f: { status?: string; type?: string } = {}
    if (statusFilter !== 'all') f.status = statusFilter
    if (typeFilter !== 'all') f.type = typeFilter
    return f
  }, [statusFilter, typeFilter])

  // Queries
  const { data: actionsData, isLoading, error } = useActions(filters)
  const { data: allActionsData } = useActions({})
  const { data: openActionsData } = useActions({ status: 'open' })
  const { data: resolvedActionsData } = useActions({ status: 'resolved' })

  const actions = actionsData || []
  const allActions = allActionsData || []
  const openActions = openActionsData || []
  const resolvedActions = resolvedActionsData || []

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date()
    const overdueActions = allActions.filter(
      (action) =>
        action.targetDate &&
        new Date(action.targetDate) < now &&
        action.status !== 'resolved' &&
        action.status !== 'closed'
    )

    return {
      total: allActions.length,
      open: openActions.length,
      overdue: overdueActions.length,
      resolved: resolvedActions.length,
    }
  }, [allActions, openActions, resolvedActions])

  // Filter by search
  const filteredActions = useMemo(() => {
    if (!search) return actions

    const searchLower = search.toLowerCase()
    return actions.filter(
      (action) =>
        action.actionNumber.toLowerCase().includes(searchLower) ||
        action.description.toLowerCase().includes(searchLower) ||
        action.assignedToName?.toLowerCase().includes(searchLower)
    )
  }, [actions, search])

  // Handlers
  const handleDelete = async () => {
    if (!actionToDelete) return
    // TODO: Implement delete action mutation
    setDeleteDialogOpen(false)
    setActionToDelete(null)
  }

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
            <Clock className="w-3 h-3 ml-1" />
            {t('quality.actions.status.open', 'مفتوح')}
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
            <PlayCircle className="w-3 h-3 ml-1" />
            {t('quality.actions.status.inProgress', 'قيد التنفيذ')}
          </Badge>
        )
      case 'resolved':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('quality.actions.status.resolved', 'محلول')}
          </Badge>
        )
      case 'closed':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            <XCircle className="w-3 h-3 ml-1" />
            {t('quality.actions.status.closed', 'مغلق')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: ActionType) => {
    switch (type) {
      case 'corrective':
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            <AlertTriangle className="w-3 h-3 ml-1" />
            {t('quality.actions.type.corrective', 'تصحيحي')}
          </Badge>
        )
      case 'preventive':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Shield className="w-3 h-3 ml-1" />
            {t('quality.actions.type.preventive', 'وقائي')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="destructive">
            <TrendingUp className="w-3 h-3 ml-1" />
            {t('quality.actions.priority.high', 'عالي')}
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <AlertCircle className="w-3 h-3 ml-1" />
            {t('quality.actions.priority.medium', 'متوسط')}
          </Badge>
        )
      case 'low':
        return (
          <Badge variant="outline">
            {t('quality.actions.priority.low', 'منخفض')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const isOverdue = (action: QualityAction) => {
    if (!action.targetDate) return false
    if (action.status === 'resolved' || action.status === 'closed') return false
    return new Date(action.targetDate) < new Date()
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('quality.actions.badge', 'الإجراءات التصحيحية والوقائية')}
          title={t('quality.actions.title', 'إدارة الإجراءات')}
          type="quality"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('quality.actions.stats.total', 'إجمالي الإجراءات')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('quality.actions.stats.open', 'مفتوحة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                  <div className="text-sm text-red-700">
                    {t('quality.actions.stats.overdue', 'متأخرة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('quality.actions.stats.resolved', 'محلولة')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4 space-y-4">
                {/* Status Tabs */}
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ActionStatus | 'all')}>
                  <TabsList className="grid w-full grid-cols-5 bg-muted/50 rounded-xl p-1">
                    <TabsTrigger value="all" className="rounded-lg">
                      {t('common.all', 'الكل')}
                    </TabsTrigger>
                    <TabsTrigger value="open" className="rounded-lg">
                      {t('quality.actions.status.open', 'مفتوح')}
                    </TabsTrigger>
                    <TabsTrigger value="in_progress" className="rounded-lg">
                      {t('quality.actions.status.inProgress', 'قيد التنفيذ')}
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="rounded-lg">
                      {t('quality.actions.status.resolved', 'محلول')}
                    </TabsTrigger>
                    <TabsTrigger value="closed" className="rounded-lg">
                      {t('quality.actions.status.closed', 'مغلق')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('quality.actions.searchPlaceholder', 'البحث برقم الإجراء أو الموضوع...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActionType | 'all')}>
                    <SelectTrigger className="w-full md:w-48 rounded-xl">
                      <SelectValue placeholder={t('quality.actions.filterByType', 'نوع الإجراء')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="corrective">
                        {t('quality.actions.type.corrective', 'تصحيحي')}
                      </SelectItem>
                      <SelectItem value="preventive">
                        {t('quality.actions.type.preventive', 'وقائي')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/quality/actions/create">
                      <Plus className="w-4 h-4 ml-2" />
                      {t('quality.actions.create', 'إنشاء إجراء')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions Table */}
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
                ) : filteredActions.length === 0 ? (
                  <div className="p-12 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('quality.actions.noActions', 'لا توجد إجراءات')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('quality.actions.noActionsDesc', 'ابدأ بإنشاء إجراء تصحيحي أو وقائي جديد')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to="/dashboard/quality/actions/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('quality.actions.create', 'إنشاء إجراء')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('quality.actions.actionNumber', 'رقم الإجراء')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.actions.type', 'النوع')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.actions.subject', 'الموضوع')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.actions.assignedTo', 'المسؤول')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.actions.dueDate', 'تاريخ الاستحقاق')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.actions.priority', 'الأولوية')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.actions.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredActions.map((action) => (
                          <TableRow
                            key={action._id}
                            className={`cursor-pointer hover:bg-muted/50 ${
                              isOverdue(action) ? 'bg-red-50/50' : ''
                            }`}
                            onClick={() => navigate({ to: `/dashboard/quality/actions/${action._id}` })}
                          >
                            <TableCell className="font-mono text-sm">
                              <div className="flex items-center gap-2">
                                {action.actionNumber}
                                {isOverdue(action) && (
                                  <Badge variant="destructive" className="text-xs">
                                    {t('quality.actions.overdue', 'متأخر')}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getTypeBadge(action.type)}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium truncate">{action.description}</div>
                                {action.rootCause && (
                                  <div className="text-sm text-muted-foreground truncate">
                                    {action.rootCause}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {action.assignedToName ? (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{action.assignedToName}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {action.targetDate ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className={`text-sm ${isOverdue(action) ? 'text-red-600 font-medium' : ''}`}>
                                    {formatDate(action.targetDate)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                            <TableCell>{getStatusBadge(action.status)}</TableCell>
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
                                      navigate({ to: `/dashboard/quality/actions/${action._id}` })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `/dashboard/quality/actions/${action._id}/edit` })
                                    }}
                                  >
                                    <Edit className="w-4 h-4 ml-2" />
                                    {t('common.edit', 'تعديل')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActionToDelete(action)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    {t('common.delete', 'حذف')}
                                  </DropdownMenuItem>
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
          <QualitySidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('quality.actions.deleteConfirmTitle', 'حذف الإجراء')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'quality.actions.deleteConfirmDesc',
                'هل أنت متأكد من حذف هذا الإجراء؟ لا يمكن التراجع عن هذا الإجراء.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
