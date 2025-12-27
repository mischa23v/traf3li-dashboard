/**
 * Buying List View
 * Main buying/procurement list page for suppliers and purchase orders
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
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

import { useSuppliers, useDeleteSupplier, useBuyingStats } from '@/hooks/use-buying'
import type { Supplier, SupplierFilters, SupplierStatus } from '@/types/buying'
import { BuyingSidebar } from './buying-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.buying', href: ROUTES.dashboard.buying.list },
]

export function BuyingListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)

  // Build filters
  const filters: SupplierFilters = useMemo(() => {
    const f: SupplierFilters = {}
    if (search) f.search = search
    if (statusFilter !== 'all') f.status = statusFilter
    return f
  }, [search, statusFilter])

  // Queries
  const { data: suppliersData, isLoading, error } = useSuppliers(filters)
  const { data: statsData } = useBuyingStats()
  const deleteSupplierMutation = useDeleteSupplier()

  const suppliers = suppliersData?.suppliers || []
  const stats = statsData

  // Handlers
  const handleDelete = async () => {
    if (!supplierToDelete) return
    await deleteSupplierMutation.mutateAsync(supplierToDelete._id)
    setDeleteDialogOpen(false)
    setSupplierToDelete(null)
  }

  const getStatusBadge = (status: SupplierStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('buying.status.active', 'نشط')}</Badge>
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 ml-1" />{t('buying.status.inactive', 'غير نشط')}</Badge>
      case 'blocked':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 ml-1" />{t('buying.status.blocked', 'محظور')}</Badge>
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
          badge={t('buying.badge', 'إدارة المشتريات')}
          title={t('buying.title', 'الموردين وأوامر الشراء')}
          type="buying"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats?.totalSuppliers || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('buying.stats.totalSuppliers', 'إجمالي الموردين')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats?.activeSuppliers || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('buying.stats.activeSuppliers', 'موردين نشطين')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats?.pendingOrders || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('buying.stats.pendingOrders', 'أوامر معلقة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats?.totalPurchaseValue || 0)}</div>
                  <div className="text-sm text-muted-foreground">{t('buying.stats.totalValue', 'إجمالي المشتريات')}</div>
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
                      placeholder={t('buying.searchPlaceholder', 'البحث في الموردين...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SupplierStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('buying.filterByStatus', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="active">{t('buying.status.active', 'نشط')}</SelectItem>
                      <SelectItem value="inactive">{t('buying.status.inactive', 'غير نشط')}</SelectItem>
                      <SelectItem value="blocked">{t('buying.status.blocked', 'محظور')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/buying/suppliers/create">
                      <Plus className="w-4 h-4 ml-2" />
                      {t('buying.addSupplier', 'إضافة مورد')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Suppliers Table */}
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
                ) : suppliers.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('buying.noSuppliers', 'لا يوجد موردين')}</h3>
                    <p className="text-muted-foreground mb-4">{t('buying.noSuppliersDesc', 'ابدأ بإضافة مورد جديد')}</p>
                    <Button asChild className="rounded-xl">
                      <Link to="/dashboard/buying/suppliers/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('buying.addSupplier', 'إضافة مورد')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('buying.supplierName', 'اسم المورد')}</TableHead>
                        <TableHead className="text-right">{t('buying.supplierGroup', 'المجموعة')}</TableHead>
                        <TableHead className="text-right">{t('buying.phone', 'الهاتف')}</TableHead>
                        <TableHead className="text-right">{t('buying.status', 'الحالة')}</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow
                          key={supplier._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: `/dashboard/buying/suppliers/${supplier._id}` })}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Users className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">{supplier.nameAr || supplier.name}</div>
                                {supplier.nameAr && <div className="text-sm text-muted-foreground">{supplier.name}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{supplier.supplierGroup || '-'}</TableCell>
                          <TableCell className="font-mono">{supplier.phone || '-'}</TableCell>
                          <TableCell>{getStatusBadge(supplier.status)}</TableCell>
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
                                  navigate({ to: `/dashboard/buying/suppliers/${supplier._id}` })
                                }}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  {t('common.view', 'عرض')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: `/dashboard/buying/suppliers/${supplier._id}/edit` })
                                }}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSupplierToDelete(supplier)
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
          <BuyingSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('buying.deleteConfirmTitle', 'حذف المورد')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('buying.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.')}
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
