/**
 * Warehouse List View
 * Main warehouse management list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  ArrowUpDown,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Package,
  TrendingUp,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useWarehouses, useDeleteWarehouse } from '@/hooks/use-inventory'
import type { Warehouse } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: '/dashboard/inventory' },
]

export function WarehouseListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'warehouse' | 'store' | 'transit' | 'virtual'>('all')
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'inactive'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null)

  // Queries
  const { data: warehousesData, isLoading, error } = useWarehouses()
  const deleteWarehouseMutation = useDeleteWarehouse()

  const warehouses = warehousesData?.warehouses || []

  // Filter warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      // Search filter
      const searchLower = search.toLowerCase()
      const matchesSearch = !search ||
        warehouse.name.toLowerCase().includes(searchLower) ||
        warehouse.nameAr?.toLowerCase().includes(searchLower) ||
        warehouse.city?.toLowerCase().includes(searchLower) ||
        warehouse.region?.toLowerCase().includes(searchLower)

      // Type filter
      const matchesType = typeFilter === 'all' || warehouse.warehouseType === typeFilter

      // Status filter
      const matchesStatus =
        statusTab === 'all' ||
        (statusTab === 'active' && !warehouse.disabled) ||
        (statusTab === 'inactive' && warehouse.disabled)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [warehouses, search, typeFilter, statusTab])

  // Calculate stats
  const stats = useMemo(() => {
    const total = warehouses.length
    const active = warehouses.filter(w => !w.disabled).length
    const inactive = warehouses.filter(w => w.disabled).length
    const groups = warehouses.filter(w => w.isGroup).length

    return {
      total,
      active,
      inactive,
      groups,
    }
  }, [warehouses])

  // Handlers
  const handleDelete = async () => {
    if (!warehouseToDelete) return
    await deleteWarehouseMutation.mutateAsync(warehouseToDelete._id)
    setDeleteDialogOpen(false)
    setWarehouseToDelete(null)
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warehouse':
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><Building2 className="w-3 h-3 ml-1" />{t('warehouse.type.warehouse', 'مستودع')}</Badge>
      case 'store':
        return <Badge variant="outline" className="border-purple-500 text-purple-500"><Package className="w-3 h-3 ml-1" />{t('warehouse.type.store', 'متجر')}</Badge>
      case 'transit':
        return <Badge variant="outline" className="border-orange-500 text-orange-500"><TrendingUp className="w-3 h-3 ml-1" />{t('warehouse.type.transit', 'عبور')}</Badge>
      case 'virtual':
        return <Badge variant="outline" className="border-gray-500 text-gray-500">{t('warehouse.type.virtual', 'افتراضي')}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (disabled: boolean) => {
    if (disabled) {
      return <Badge variant="secondary"><XCircle className="w-3 h-3 ml-1" />{t('warehouse.status.inactive', 'غير نشط')}</Badge>
    }
    return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('warehouse.status.active', 'نشط')}</Badge>
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('warehouse.badge', 'إدارة المستودعات')}
          title={t('warehouse.title', 'المستودعات')}
          type="inventory"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">{t('warehouse.stats.total', 'إجمالي المستودعات')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                  <div className="text-sm text-muted-foreground">{t('warehouse.stats.active', 'مستودعات نشطة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{stats.inactive}</div>
                  <div className="text-sm text-muted-foreground">{t('warehouse.stats.inactive', 'غير نشطة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.groups}</div>
                  <div className="text-sm text-muted-foreground">{t('warehouse.stats.groups', 'مجموعات')}</div>
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
                      placeholder={t('warehouse.searchPlaceholder', 'البحث في المستودعات...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('warehouse.filterByType', 'النوع')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="warehouse">{t('warehouse.type.warehouse', 'مستودع')}</SelectItem>
                      <SelectItem value="store">{t('warehouse.type.store', 'متجر')}</SelectItem>
                      <SelectItem value="transit">{t('warehouse.type.transit', 'عبور')}</SelectItem>
                      <SelectItem value="virtual">{t('warehouse.type.virtual', 'افتراضي')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/inventory/warehouses/create">
                      <Plus className="w-4 h-4 ml-2" />
                      {t('warehouse.addWarehouse', 'إضافة مستودع')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs & Warehouses Table */}
            <Card className="rounded-3xl">
              <CardContent className="p-0">
                <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as typeof statusTab)} className="w-full">
                  <div className="border-b px-6 pt-6">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="all">
                        {t('common.all', 'الكل')} ({stats.total})
                      </TabsTrigger>
                      <TabsTrigger value="active">
                        {t('warehouse.status.active', 'نشط')} ({stats.active})
                      </TabsTrigger>
                      <TabsTrigger value="inactive">
                        {t('warehouse.status.inactive', 'غير نشط')} ({stats.inactive})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value={statusTab} className="mt-0">
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
                    ) : filteredWarehouses.length === 0 ? (
                      <div className="p-12 text-center">
                        <WarehouseIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t('warehouse.noWarehouses', 'لا توجد مستودعات')}</h3>
                        <p className="text-muted-foreground mb-4">{t('warehouse.noWarehousesDesc', 'ابدأ بإضافة مستودع جديد')}</p>
                        <Button asChild className="rounded-xl">
                          <Link to="/dashboard/inventory/warehouses/create">
                            <Plus className="w-4 h-4 ml-2" />
                            {t('warehouse.addWarehouse', 'إضافة مستودع')}
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('warehouse.name', 'الاسم')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.type', 'النوع')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.location', 'الموقع')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.parentWarehouse', 'المستودع الأب')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.isGroup', 'مجموعة')}</TableHead>
                            <TableHead className="text-right">{t('warehouse.status', 'الحالة')}</TableHead>
                            <TableHead className="text-right w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredWarehouses.map((warehouse) => (
                            <TableRow
                              key={warehouse._id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate({ to: `/dashboard/inventory/warehouses/${warehouse._id}` })}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <WarehouseIcon className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{warehouse.nameAr || warehouse.name}</div>
                                    {warehouse.nameAr && <div className="text-sm text-muted-foreground">{warehouse.name}</div>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getTypeBadge(warehouse.warehouseType)}</TableCell>
                              <TableCell>
                                {warehouse.city || warehouse.region ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    <span>{[warehouse.city, warehouse.region].filter(Boolean).join(', ')}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {warehouse.parentWarehouse ? (
                                  <span className="text-sm">{warehouse.parentWarehouse}</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {warehouse.isGroup ? (
                                  <Badge variant="outline" className="border-indigo-500 text-indigo-500">
                                    {t('warehouse.group', 'مجموعة')}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(warehouse.disabled)}</TableCell>
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
                                      navigate({ to: `/dashboard/inventory/warehouses/${warehouse._id}` })
                                    }}>
                                      <Eye className="w-4 h-4 ml-2" />
                                      {t('common.view', 'عرض')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `/dashboard/inventory/warehouses/${warehouse._id}/edit` })
                                    }}>
                                      <Edit className="w-4 h-4 ml-2" />
                                      {t('common.edit', 'تعديل')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setWarehouseToDelete(warehouse)
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <InventorySidebar context="warehouses" />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('warehouse.deleteConfirmTitle', 'حذف المستودع')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('warehouse.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا المستودع؟ لا يمكن التراجع عن هذا الإجراء.')}
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
