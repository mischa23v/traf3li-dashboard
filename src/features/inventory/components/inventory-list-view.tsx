/**
 * Inventory List View
 * Main inventory/stock items list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Warehouse,
  ArrowUpDown,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
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

import { useItems, useDeleteItem, useInventoryStats, useItemGroups } from '@/hooks/use-inventory'
import type { Item, ItemFilters, ItemType, ItemStatus } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: ROUTES.dashboard.inventory.list },
]

export function InventoryListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null)

  // Build filters
  const filters: ItemFilters = useMemo(() => {
    const f: ItemFilters = {}
    if (search) f.search = search
    if (typeFilter !== 'all') f.itemType = typeFilter
    if (statusFilter !== 'all') f.status = statusFilter
    if (groupFilter !== 'all') f.itemGroup = groupFilter
    return f
  }, [search, typeFilter, statusFilter, groupFilter])

  // Queries
  const { data: itemsData, isLoading, error } = useItems(filters)
  const { data: statsData } = useInventoryStats()
  const { data: groups } = useItemGroups()
  const deleteItemMutation = useDeleteItem()

  const items = itemsData?.items || []
  const stats = statsData

  // Handlers
  const handleDelete = async () => {
    if (!itemToDelete) return
    await deleteItemMutation.mutateAsync(itemToDelete._id)
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('inventory.status.active', 'نشط')}</Badge>
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 ml-1" />{t('inventory.status.inactive', 'غير نشط')}</Badge>
      case 'discontinued':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 ml-1" />{t('inventory.status.discontinued', 'متوقف')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: ItemType) => {
    switch (type) {
      case 'product':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{t('inventory.type.product', 'منتج')}</Badge>
      case 'service':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{t('inventory.type.service', 'خدمة')}</Badge>
      case 'consumable':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">{t('inventory.type.consumable', 'مستهلك')}</Badge>
      case 'fixed_asset':
        return <Badge variant="outline" className="border-green-500 text-green-500">{t('inventory.type.fixedAsset', 'أصل ثابت')}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
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
          badge={t('inventory.badge', 'إدارة المخزون')}
          title={t('inventory.title', 'المخزون والأصناف')}
          type="inventory"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats?.totalItems || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.stats.totalItems', 'إجمالي الأصناف')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats?.activeItems || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.stats.activeItems', 'أصناف نشطة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{stats?.lowStockItems || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.stats.lowStock', 'مخزون منخفض')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{stats?.outOfStockItems || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.stats.outOfStock', 'نفاد المخزون')}</div>
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
                      placeholder={t('inventory.searchPlaceholder', 'البحث في الأصناف...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ItemType | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('inventory.filterByType', 'النوع')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="product">{t('inventory.type.product', 'منتج')}</SelectItem>
                      <SelectItem value="service">{t('inventory.type.service', 'خدمة')}</SelectItem>
                      <SelectItem value="consumable">{t('inventory.type.consumable', 'مستهلك')}</SelectItem>
                      <SelectItem value="fixed_asset">{t('inventory.type.fixedAsset', 'أصل ثابت')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ItemStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('inventory.filterByStatus', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="active">{t('inventory.status.active', 'نشط')}</SelectItem>
                      <SelectItem value="inactive">{t('inventory.status.inactive', 'غير نشط')}</SelectItem>
                      <SelectItem value="discontinued">{t('inventory.status.discontinued', 'متوقف')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.inventory.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('inventory.addItem', 'إضافة صنف')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
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
                ) : items.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('inventory.noItems', 'لا توجد أصناف')}</h3>
                    <p className="text-muted-foreground mb-4">{t('inventory.noItemsDesc', 'ابدأ بإضافة صنف جديد')}</p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.inventory.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('inventory.addItem', 'إضافة صنف')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('inventory.itemCode', 'رمز الصنف')}</TableHead>
                        <TableHead className="text-right">{t('inventory.itemName', 'اسم الصنف')}</TableHead>
                        <TableHead className="text-right">{t('inventory.itemType', 'النوع')}</TableHead>
                        <TableHead className="text-right">{t('inventory.price', 'السعر')}</TableHead>
                        <TableHead className="text-right">{t('inventory.status', 'الحالة')}</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow
                          key={item._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: ROUTES.dashboard.inventory.detail(item._id) })}
                        >
                          <TableCell className="font-mono text-sm">{item.itemCode}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Package className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{item.nameAr || item.name}</div>
                                {item.nameAr && <div className="text-sm text-muted-foreground">{item.name}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(item.itemType)}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(item.standardRate, item.currency)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                                  navigate({ to: ROUTES.dashboard.inventory.detail(item._id) })
                                }}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  {t('common.view', 'عرض')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: `${ROUTES.dashboard.inventory.detail(item._id)}/edit` })
                                }}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setItemToDelete(item)
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
          <InventorySidebar context="items" />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('inventory.deleteConfirmTitle', 'حذف الصنف')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('inventory.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء.')}
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
