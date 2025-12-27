/**
 * Subcontracting List View
 * Main subcontracting orders list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  GitBranch,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
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
import { Progress } from '@/components/ui/progress'
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

import { useSubcontractingOrders, useDeleteSubcontractingOrder, useSubcontractingStats } from '@/hooks/use-subcontracting'
import type { SubcontractingOrder, SubcontractingFilters, SubcontractingOrderStatus } from '@/types/subcontracting'
import { SubcontractingSidebar } from './subcontracting-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.subcontracting', href: ROUTES.dashboard.subcontracting.list },
]

export function SubcontractingListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubcontractingOrderStatus | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<SubcontractingOrder | null>(null)

  // Build filters
  const filters: SubcontractingFilters = useMemo(() => {
    const f: SubcontractingFilters = {}
    if (search) f.search = search
    if (statusFilter !== 'all') f.status = statusFilter
    return f
  }, [search, statusFilter])

  // Queries
  const { data: ordersData, isLoading, error } = useSubcontractingOrders(filters)
  const { data: statsData } = useSubcontractingStats()
  const deleteOrderMutation = useDeleteSubcontractingOrder()

  const orders = ordersData?.orders || []
  const stats = statsData

  // Handlers
  const handleDelete = async () => {
    if (!orderToDelete) return
    await deleteOrderMutation.mutateAsync(orderToDelete._id)
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const getStatusBadge = (status: SubcontractingOrderStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Clock className="w-3 h-3 ml-1" />{t('subcontracting.status.draft', 'مسودة')}</Badge>
      case 'submitted':
        return <Badge variant="secondary">{t('subcontracting.status.submitted', 'مقدم')}</Badge>
      case 'partially_received':
        return <Badge variant="default" className="bg-blue-500"><Package className="w-3 h-3 ml-1" />{t('subcontracting.status.partiallyReceived', 'مستلم جزئياً')}</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('subcontracting.status.completed', 'مكتمل')}</Badge>
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1" />{t('subcontracting.status.cancelled', 'ملغي')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
          badge={t('subcontracting.badge', 'التصنيع الخارجي')}
          title={t('subcontracting.title', 'أوامر التصنيع الخارجي')}
          type="subcontracting"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats?.totalOrders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('subcontracting.stats.totalOrders', 'إجمالي الأوامر')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats?.pendingOrders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('subcontracting.stats.pending', 'قيد الانتظار')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats?.completedOrders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('subcontracting.stats.completed', 'مكتملة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats?.totalValue || 0)}</div>
                  <div className="text-sm text-muted-foreground">{t('subcontracting.stats.totalValue', 'القيمة الإجمالية')}</div>
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
                      placeholder={t('subcontracting.searchPlaceholder', 'البحث في الأوامر...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubcontractingOrderStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('subcontracting.filterByStatus', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="draft">{t('subcontracting.status.draft', 'مسودة')}</SelectItem>
                      <SelectItem value="submitted">{t('subcontracting.status.submitted', 'مقدم')}</SelectItem>
                      <SelectItem value="partially_received">{t('subcontracting.status.partiallyReceived', 'مستلم جزئياً')}</SelectItem>
                      <SelectItem value="completed">{t('subcontracting.status.completed', 'مكتمل')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.subcontracting.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('subcontracting.createOrder', 'إنشاء أمر')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
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
                    <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('subcontracting.noOrders', 'لا توجد أوامر')}</h3>
                    <p className="text-muted-foreground mb-4">{t('subcontracting.noOrdersDesc', 'ابدأ بإنشاء أمر تصنيع خارجي')}</p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.subcontracting.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('subcontracting.createOrder', 'إنشاء أمر')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('subcontracting.orderNumber', 'رقم الأمر')}</TableHead>
                        <TableHead className="text-right">{t('subcontracting.supplier', 'المورد')}</TableHead>
                        <TableHead className="text-right">{t('subcontracting.progress', 'التقدم')}</TableHead>
                        <TableHead className="text-right">{t('subcontracting.status', 'الحالة')}</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: ROUTES.dashboard.subcontracting.detail(order._id) })}
                        >
                          <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div className="font-medium">{order.supplierName}</div>
                            <div className="text-sm text-muted-foreground">{order.orderDate}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress value={order.percentReceived || 0} className="h-2" />
                              <span className="text-xs text-muted-foreground">{order.percentReceived || 0}%</span>
                            </div>
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
                                  navigate({ to: ROUTES.dashboard.subcontracting.detail(order._id) })
                                }}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  {t('common.view', 'عرض')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: ROUTES.dashboard.subcontracting.edit(order._id) })
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
          <SubcontractingSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('subcontracting.deleteConfirmTitle', 'حذف الأمر')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('subcontracting.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا الأمر؟ لا يمكن التراجع عن هذا الإجراء.')}
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
