/**
 * BOM List View
 * Bill of Materials list page with tabs, filters, and actions
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Layers,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  FileText,
  Package,
  Star,
  Circle,
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

import { useBOMs, useDeleteBOM, useManufacturingStats } from '@/hooks/use-manufacturing'
import type { BillOfMaterials, BomType } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.manufacturing', href: ROUTES.dashboard.manufacturing.list },
  { title: 'manufacturing.boms', href: ROUTES.dashboard.manufacturing.bom.list },
]

type TabValue = 'all' | 'active' | 'inactive'

export function BOMListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bomToDelete, setBomToDelete] = useState<BillOfMaterials | null>(null)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [bomToDuplicate, setBomToDuplicate] = useState<BillOfMaterials | null>(null)

  // Build filters based on active tab
  const filters = useMemo(() => {
    const f: { isActive?: boolean } = {}
    if (activeTab === 'active') f.isActive = true
    if (activeTab === 'inactive') f.isActive = false
    return f
  }, [activeTab])

  // Queries
  const { data: bomsData, isLoading, error } = useBOMs(filters)
  const { data: statsData } = useManufacturingStats()
  const deleteBOMMutation = useDeleteBOM()

  const allBOMs = bomsData?.boms || []

  // Filter BOMs by search
  const filteredBOMs = useMemo(() => {
    if (!search) return allBOMs
    const searchLower = search.toLowerCase()
    return allBOMs.filter(
      (bom) =>
        bom.bomNumber?.toLowerCase().includes(searchLower) ||
        bom.itemName?.toLowerCase().includes(searchLower) ||
        bom.itemCode?.toLowerCase().includes(searchLower)
    )
  }, [allBOMs, search])

  // Stats calculations
  const totalBOMs = allBOMs.length
  const activeBOMs = allBOMs.filter((bom) => bom.isActive).length
  const defaultBOMs = allBOMs.filter((bom) => bom.isDefault).length
  const inactiveBOMs = totalBOMs - activeBOMs

  // Handlers
  const handleDelete = async () => {
    if (!bomToDelete) return
    await deleteBOMMutation.mutateAsync(bomToDelete._id)
    setDeleteDialogOpen(false)
    setBomToDelete(null)
  }

  const handleDuplicate = () => {
    if (!bomToDuplicate) return
    // Navigate to create page with duplicate data
    navigate({
      to: ROUTES.dashboard.manufacturing.bom.create,
      search: { duplicate: bomToDuplicate._id },
    })
    setDuplicateDialogOpen(false)
    setBomToDuplicate(null)
  }

  const getBomTypeBadge = (type: BomType) => {
    switch (type) {
      case 'standard':
        return (
          <Badge variant="default" className="bg-blue-500">
            <FileText className="w-3 h-3 ml-1" />
            {t('manufacturing.bom.type.standard', 'قياسي')}
          </Badge>
        )
      case 'template':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Copy className="w-3 h-3 ml-1" />
            {t('manufacturing.bom.type.template', 'قالب')}
          </Badge>
        )
      case 'subcontract':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            <Package className="w-3 h-3 ml-1" />
            {t('manufacturing.bom.type.subcontract', 'تعاقد من الباطن')}
          </Badge>
        )
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
          badge={t('manufacturing.badge', 'إدارة التصنيع')}
          title={t('manufacturing.bom.title', 'قوائم المواد (BOM)')}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{totalBOMs}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.bom.stats.totalBOMs', 'إجمالي قوائم المواد')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{activeBOMs}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.bom.stats.active', 'نشطة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{defaultBOMs}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.bom.stats.default', 'افتراضية')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-600">{inactiveBOMs}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('manufacturing.bom.stats.inactive', 'غير نشطة')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                  <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all">
                      <Circle className="w-3 h-3 ml-1" />
                      {t('common.all', 'الكل')}
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {t('manufacturing.bom.tabs.active', 'نشطة')}
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                      <XCircle className="w-3 h-3 ml-1" />
                      {t('manufacturing.bom.tabs.inactive', 'غير نشطة')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t(
                        'manufacturing.bom.searchPlaceholder',
                        'البحث برقم القائمة أو اسم الصنف...'
                      )}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.manufacturing.bom.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('manufacturing.bom.createBOM', 'إنشاء قائمة مواد')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* BOMs Table */}
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
                ) : filteredBOMs.length === 0 ? (
                  <div className="p-12 text-center">
                    <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {search
                        ? t('manufacturing.bom.noSearchResults', 'لا توجد نتائج بحث')
                        : t('manufacturing.bom.noBOMs', 'لا توجد قوائم مواد')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {search
                        ? t('manufacturing.bom.tryDifferentSearch', 'جرب مصطلح بحث آخر')
                        : t('manufacturing.bom.noBOMsDesc', 'ابدأ بإنشاء قائمة مواد جديدة')}
                    </p>
                    {!search && (
                      <Button asChild className="rounded-xl">
                        <Link to={ROUTES.dashboard.manufacturing.bom.create}>
                          <Plus className="w-4 h-4 ml-2" />
                          {t('manufacturing.bom.createBOM', 'إنشاء قائمة مواد')}
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('manufacturing.bom.bomNumber', 'رقم القائمة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.bom.item', 'الصنف')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.bom.bomType', 'نوع القائمة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.bom.quantity', 'الكمية')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.bom.isDefault', 'افتراضي')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('manufacturing.bom.isActive', 'نشط')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBOMs.map((bom) => (
                          <TableRow
                            key={bom._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate({ to: ROUTES.dashboard.manufacturing.bom.detail(bom._id) })}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Layers className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium font-mono">{bom.bomNumber}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {t('manufacturing.bom.components', 'المكونات')}: {bom.items?.length || 0}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{bom.itemName || bom.itemCode}</div>
                              {bom.itemCode && bom.itemName && (
                                <div className="text-xs text-muted-foreground font-mono">{bom.itemCode}</div>
                              )}
                            </TableCell>
                            <TableCell>{getBomTypeBadge(bom.bomType)}</TableCell>
                            <TableCell>
                              <span className="font-mono">
                                {bom.quantity} {bom.uom}
                              </span>
                              {bom.totalCost && bom.totalCost > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(bom.totalCost)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {bom.isDefault ? (
                                <Badge variant="default" className="bg-amber-500">
                                  <Star className="w-3 h-3 ml-1 fill-white" />
                                  {t('common.yes', 'نعم')}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  {t('common.no', 'لا')}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {bom.isActive ? (
                                <Badge variant="default" className="bg-emerald-500">
                                  <CheckCircle2 className="w-3 h-3 ml-1" />
                                  {t('common.active', 'نشط')}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                  <XCircle className="w-3 h-3 ml-1" />
                                  {t('common.inactive', 'غير نشط')}
                                </Badge>
                              )}
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
                                      navigate({ to: ROUTES.dashboard.manufacturing.bom.detail(bom._id) })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `${ROUTES.dashboard.manufacturing.bom.detail(bom._id)}/edit` })
                                    }}
                                  >
                                    <Edit className="w-4 h-4 ml-2" />
                                    {t('common.edit', 'تعديل')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setBomToDuplicate(bom)
                                      setDuplicateDialogOpen(true)
                                    }}
                                  >
                                    <Copy className="w-4 h-4 ml-2" />
                                    {t('common.duplicate', 'نسخ')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setBomToDelete(bom)
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
          <ManufacturingSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('manufacturing.bom.deleteConfirmTitle', 'حذف قائمة المواد')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'manufacturing.bom.deleteConfirmDesc',
                'هل أنت متأكد من حذف قائمة المواد هذه؟ لا يمكن التراجع عن هذا الإجراء. قد يؤثر هذا على أوامر العمل المرتبطة.'
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

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('manufacturing.bom.duplicateConfirmTitle', 'نسخ قائمة المواد')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'manufacturing.bom.duplicateConfirmDesc',
                'سيتم إنشاء نسخة جديدة من قائمة المواد هذه مع جميع المكونات والعمليات. يمكنك تعديلها قبل الحفظ.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate} className="bg-emerald-600 hover:bg-emerald-700">
              {t('common.duplicate', 'نسخ')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
