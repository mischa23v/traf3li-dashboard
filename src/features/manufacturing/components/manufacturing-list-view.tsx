/**
 * Manufacturing List View
 * Main manufacturing/work orders list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Factory,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  PlayCircle,
  StopCircle,
  PauseCircle,
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

import { useWorkOrders, useDeleteWorkOrder, useManufacturingStats } from '@/hooks/use-manufacturing'
import type { WorkOrder, ManufacturingFilters, WorkOrderStatus } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
]

export function ManufacturingListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<WorkOrder | null>(null)

  // Build filters
  const filters: ManufacturingFilters = useMemo(() => {
    const f: ManufacturingFilters = {}
    if (search) f.search = search
    if (statusFilter !== 'all') f.status = statusFilter
    return f
  }, [search, statusFilter])

  // Queries
  const { data: ordersData, isLoading, error } = useWorkOrders(filters)
  const { data: statsData } = useManufacturingStats()
  const deleteOrderMutation = useDeleteWorkOrder()

  const orders = ordersData?.workOrders || []
  const stats = statsData

  // Handlers
  const handleDelete = async () => {
    if (!orderToDelete) return
    await deleteOrderMutation.mutateAsync(orderToDelete._id)
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Clock className="w-3 h-3 ml-1" />{t('manufacturing.status.draft', 'مسودة')}</Badge>
      case 'submitted':
        return <Badge variant="secondary">{t('manufacturing.status.submitted', 'تم التقديم')}</Badge>
      case 'not_started':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">{t('manufacturing.status.notStarted', 'لم يبدأ')}</Badge>
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500"><PlayCircle className="w-3 h-3 ml-1" />{t('manufacturing.status.inProgress', 'قيد التنفيذ')}</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('manufacturing.status.completed', 'مكتمل')}</Badge>
      case 'stopped':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700"><PauseCircle className="w-3 h-3 ml-1" />{t('manufacturing.status.stopped', 'متوقف')}</Badge>
      case 'cancelled':
        return <Badge variant="destructive"><StopCircle className="w-3 h-3 ml-1" />{t('manufacturing.status.cancelled', 'ملغي')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('manufacturing.badge', 'إدارة التصنيع')}
          title={t('manufacturing.title', 'أوامر العمل')}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats?.totalWorkOrders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('manufacturing.stats.totalOrders', 'إجمالي الأوامر')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats?.inProgressOrders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('manufacturing.stats.inProgress', 'قيد التنفيذ')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats?.completedOrders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('manufacturing.stats.completed', 'مكتملة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{stats?.productionEfficiency || 0}%</div>
                  <div className="text-sm text-muted-foreground">{t('manufacturing.stats.efficiency', 'الكفاءة')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('manufacturing.searchPlaceholder', 'البحث في أوامر العمل...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WorkOrderStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('manufacturing.filterByStatus', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="draft">{t('manufacturing.status.draft', 'مسودة')}</SelectItem>
                      <SelectItem value="in_progress">{t('manufacturing.status.inProgress', 'قيد التنفيذ')}</SelectItem>
                      <SelectItem value="completed">{t('manufacturing.status.completed', 'مكتمل')}</SelectItem>
                      <SelectItem value="stopped">{t('manufacturing.status.stopped', 'متوقف')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/manufacturing/work-orders/create">
                      <Plus className="w-4 h-4 ml-2" />
                      {t('manufacturing.createWorkOrder', 'إنشاء أمر عمل')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Work Orders Table */}
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
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Factory className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('manufacturing.noWorkOrders', 'لا توجد أوامر عمل')}</h3>
                    <p className="text-muted-foreground mb-4">{t('manufacturing.noWorkOrdersDesc', 'ابدأ بإنشاء أمر عمل جديد')}</p>
                    <Button asChild className="rounded-xl">
                      <Link to="/dashboard/manufacturing/work-orders/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('manufacturing.createWorkOrder', 'إنشاء أمر عمل')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('manufacturing.orderNumber', 'رقم الأمر')}</TableHead>
                        <TableHead className="text-right">{t('manufacturing.item', 'الصنف')}</TableHead>
                        <TableHead className="text-right">{t('manufacturing.qty', 'الكمية')}</TableHead>
                        <TableHead className="text-right">{t('manufacturing.status', 'الحالة')}</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: `/dashboard/manufacturing/work-orders/${order._id}` })}
                        >
                          <TableCell className="font-mono text-sm">{order.workOrderNumber}</TableCell>
                          <TableCell>
                            <div className="font-medium">{order.itemName || order.itemCode}</div>
                            <div className="text-sm text-muted-foreground">{order.plannedStartDate}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono">{order.producedQty}/{order.qty}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: `/dashboard/manufacturing/work-orders/${order._id}` })
                                }}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  {t('common.view', 'عرض')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: `/dashboard/manufacturing/work-orders/${order._id}/edit` })
                                }}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOrderToDelete(order)
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <ManufacturingSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('manufacturing.deleteConfirmTitle', 'حذف أمر العمل')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('manufacturing.deleteConfirmDesc', 'هل أنت متأكد من حذف أمر العمل هذا؟ لا يمكن التراجع عن هذا الإجراء.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
