/**
 * Assets List View
 * Main fixed assets list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingDown,
  DollarSign,
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

import { useAssets, useDeleteAsset, useAssetStats } from '@/hooks/use-assets'
import type { Asset, AssetFilters, AssetStatus } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.assets', href: ROUTES.dashboard.assets.list },
]

export function AssetsListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)

  // Build filters
  const filters: AssetFilters = useMemo(() => {
    const f: AssetFilters = {}
    if (search) f.search = search
    if (statusFilter !== 'all') f.status = statusFilter
    return f
  }, [search, statusFilter])

  // Queries
  const { data: assetsData, isLoading, error } = useAssets(filters)
  const { data: statsData } = useAssetStats()
  const deleteAssetMutation = useDeleteAsset()

  const assets = assetsData?.assets || []
  const stats = statsData

  // Handlers
  const handleDelete = async () => {
    if (!assetToDelete) return
    await deleteAssetMutation.mutateAsync(assetToDelete._id)
    setDeleteDialogOpen(false)
    setAssetToDelete(null)
  }

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Clock className="w-3 h-3 ml-1" />{t('assets.status.draft', 'مسودة')}</Badge>
      case 'submitted':
        return <Badge variant="secondary"><CheckCircle2 className="w-3 h-3 ml-1" />{t('assets.status.submitted', 'مقدم')}</Badge>
      case 'partially_depreciated':
        return <Badge variant="default" className="bg-blue-500"><TrendingDown className="w-3 h-3 ml-1" />{t('assets.status.partiallyDepreciated', 'مهلك جزئياً')}</Badge>
      case 'fully_depreciated':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700"><TrendingDown className="w-3 h-3 ml-1" />{t('assets.status.fullyDepreciated', 'مهلك كلياً')}</Badge>
      case 'sold':
        return <Badge variant="default" className="bg-emerald-500"><DollarSign className="w-3 h-3 ml-1" />{t('assets.status.sold', 'مباع')}</Badge>
      case 'scrapped':
        return <Badge variant="destructive">{t('assets.status.scrapped', 'مخردة')}</Badge>
      case 'in_maintenance':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700"><Wrench className="w-3 h-3 ml-1" />{t('assets.status.inMaintenance', 'قيد الصيانة')}</Badge>
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
          badge={t('assets.badge', 'إدارة الأصول')}
          title={t('assets.title', 'الأصول الثابتة')}
          type="assets"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats?.totalAssets || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('assets.stats.totalAssets', 'إجمالي الأصول')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.totalValue || 0)}</div>
                  <div className="text-sm text-muted-foreground">{t('assets.stats.totalValue', 'القيمة الإجمالية')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.netValue || 0)}</div>
                  <div className="text-sm text-muted-foreground">{t('assets.stats.netValue', 'صافي القيمة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{stats?.upcomingMaintenance || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('assets.stats.upcomingMaintenance', 'صيانة قادمة')}</div>
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
                      placeholder={t('assets.searchPlaceholder', 'البحث في الأصول...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AssetStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('assets.filterByStatus', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="submitted">{t('assets.status.submitted', 'مقدم')}</SelectItem>
                      <SelectItem value="partially_depreciated">{t('assets.status.partiallyDepreciated', 'مهلك جزئياً')}</SelectItem>
                      <SelectItem value="fully_depreciated">{t('assets.status.fullyDepreciated', 'مهلك كلياً')}</SelectItem>
                      <SelectItem value="in_maintenance">{t('assets.status.inMaintenance', 'قيد الصيانة')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.assets.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('assets.addAsset', 'إضافة أصل')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assets Table */}
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
                ) : assets.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('assets.noAssets', 'لا توجد أصول')}</h3>
                    <p className="text-muted-foreground mb-4">{t('assets.noAssetsDesc', 'ابدأ بإضافة أصل جديد')}</p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.assets.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('assets.addAsset', 'إضافة أصل')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('assets.assetNumber', 'رقم الأصل')}</TableHead>
                        <TableHead className="text-right">{t('assets.assetName', 'اسم الأصل')}</TableHead>
                        <TableHead className="text-right">{t('assets.currentValue', 'القيمة الحالية')}</TableHead>
                        <TableHead className="text-right">{t('assets.status', 'الحالة')}</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow
                          key={asset._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: ROUTES.dashboard.assets.detail(asset._id) })}
                        >
                          <TableCell className="font-mono text-sm">{asset.assetNumber}</TableCell>
                          <TableCell>
                            <div className="font-medium">{asset.assetNameAr || asset.assetName}</div>
                            <div className="text-sm text-muted-foreground">{asset.assetCategory}</div>
                          </TableCell>
                          <TableCell className="font-mono">{formatCurrency(asset.currentValue || 0, asset.currency)}</TableCell>
                          <TableCell>{getStatusBadge(asset.status)}</TableCell>
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
                                  navigate({ to: ROUTES.dashboard.assets.detail(asset._id) })
                                }}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  {t('common.view', 'عرض')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: ROUTES.dashboard.assets.edit(asset._id) })
                                }}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setAssetToDelete(asset)
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
          <AssetsSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('assets.deleteConfirmTitle', 'حذف الأصل')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('assets.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا الأصل؟ لا يمكن التراجع عن هذا الإجراء.')}
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
