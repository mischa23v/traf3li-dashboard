/**
 * Asset Category List View
 * Main asset category management list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingDown,
  List,
  Network,
  ChevronRight,
  Folder,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useAssetCategories, useDeleteAssetCategory, useAssets } from '@/hooks/use-assets'
import type { AssetCategory, DepreciationMethod } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.assets', href: '/dashboard/assets' },
]

interface CategoryWithAssets extends AssetCategory {
  assetCount?: number
  isActive?: boolean
  children?: CategoryWithAssets[]
  level?: number
}

export function CategoryListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'inactive'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<AssetCategory | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Queries
  const { data: categoriesData, isLoading, error } = useAssetCategories()
  const { data: assetsData } = useAssets()
  const deleteCategoryMutation = useDeleteAssetCategory()

  const categories = categoriesData?.categories || []
  const assets = assetsData?.assets || []

  // Calculate asset counts per category
  const categoryAssetCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    assets.forEach((asset) => {
      if (asset.assetCategory) {
        counts[asset.assetCategory] = (counts[asset.assetCategory] || 0) + 1
      }
    })
    return counts
  }, [assets])

  // Transform categories with asset counts and active status
  const categoriesWithData = useMemo<CategoryWithAssets[]>(() => {
    return categories.map((category) => ({
      ...category,
      assetCount: categoryAssetCounts[category.name] || 0,
      isActive: true, // Can be extended to track active/inactive status
    }))
  }, [categories, categoryAssetCounts])

  // Build hierarchical tree structure
  const buildTree = (items: CategoryWithAssets[]): CategoryWithAssets[] => {
    const map = new Map<string, CategoryWithAssets>()
    const roots: CategoryWithAssets[] = []

    // Create a map of all categories
    items.forEach((item) => {
      map.set(item.name, { ...item, children: [], level: 0 })
    })

    // Build the tree
    items.forEach((item) => {
      const node = map.get(item.name)
      if (!node) return

      if (item.parentCategory) {
        const parent = map.get(item.parentCategory)
        if (parent) {
          node.level = (parent.level || 0) + 1
          parent.children = parent.children || []
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    // Sort roots and children
    const sortByName = (a: CategoryWithAssets, b: CategoryWithAssets) =>
      (a.nameAr || a.name).localeCompare(b.nameAr || b.name, 'ar')

    roots.sort(sortByName)
    roots.forEach((root) => {
      if (root.children) {
        root.children.sort(sortByName)
      }
    })

    return roots
  }

  // Flatten tree for rendering
  const flattenTree = (
    nodes: CategoryWithAssets[],
    result: CategoryWithAssets[] = []
  ): CategoryWithAssets[] => {
    nodes.forEach((node) => {
      result.push(node)
      if (node.children && expandedCategories.has(node.name)) {
        flattenTree(node.children, result)
      }
    })
    return result
  }

  // Filter categories
  const filteredCategories = useMemo(() => {
    let filtered = categoriesWithData

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) ||
          category.nameAr?.toLowerCase().includes(searchLower) ||
          category.depreciationMethod.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusTab === 'active') {
      filtered = filtered.filter((category) => category.isActive)
    } else if (statusTab === 'inactive') {
      filtered = filtered.filter((category) => !category.isActive)
    }

    return filtered
  }, [categoriesWithData, search, statusTab])

  // Prepare display data based on view mode
  const displayCategories = useMemo(() => {
    if (viewMode === 'tree') {
      const tree = buildTree(filteredCategories)
      return flattenTree(tree)
    }
    return filteredCategories
  }, [filteredCategories, viewMode, expandedCategories])

  // Calculate stats
  const stats = useMemo(() => {
    const total = categoriesWithData.length
    const active = categoriesWithData.filter((c) => c.isActive).length
    const inactive = total - active
    const totalAssets = Object.values(categoryAssetCounts).reduce((sum, count) => sum + count, 0)

    return {
      total,
      active,
      inactive,
      totalAssets,
    }
  }, [categoriesWithData, categoryAssetCounts])

  // Handlers
  const handleDelete = async () => {
    if (!categoryToDelete) return
    await deleteCategoryMutation.mutateAsync(categoryToDelete._id)
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const toggleCategoryExpansion = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  const getDepreciationMethodBadge = (method: DepreciationMethod) => {
    switch (method) {
      case 'straight_line':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <TrendingDown className="w-3 h-3 ml-1" />
            {t('assets.depreciation.straightLine', 'قسط ثابت')}
          </Badge>
        )
      case 'double_declining_balance':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            <TrendingDown className="w-3 h-3 ml-1" />
            {t('assets.depreciation.doubleDeclining', 'قسط متناقص مضاعف')}
          </Badge>
        )
      case 'written_down_value':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            <TrendingDown className="w-3 h-3 ml-1" />
            {t('assets.depreciation.writtenDown', 'القيمة المتناقصة')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (!isActive) {
      return (
        <Badge variant="secondary">
          <XCircle className="w-3 h-3 ml-1" />
          {t('common.inactive', 'غير نشط')}
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-emerald-500">
        <CheckCircle2 className="w-3 h-3 ml-1" />
        {t('common.active', 'نشط')}
      </Badge>
    )
  }

  const renderCategoryRow = (category: CategoryWithAssets) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.name)
    const indent = (category.level || 0) * 2

    return (
      <TableRow
        key={category._id}
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => navigate({ to: `/dashboard/assets/categories/${category._id}` })}
      >
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingRight: `${indent}rem` }}>
            {viewMode === 'tree' && hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCategoryExpansion(category.name)
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            )}
            {viewMode === 'tree' && !hasChildren && <div className="w-6" />}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                {hasChildren ? (
                  <Folder className="w-5 h-5 text-emerald-600" />
                ) : (
                  <FolderOpen className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <div className="font-medium">{category.nameAr || category.name}</div>
                {category.nameAr && (
                  <div className="text-sm text-muted-foreground">{category.name}</div>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>{getDepreciationMethodBadge(category.depreciationMethod)}</TableCell>
        <TableCell>
          <div className="text-sm">
            {category.totalNumberOfDepreciations || 0}{' '}
            {t('assets.category.years', 'سنة')}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('assets.category.every', 'كل')}{' '}
            {category.frequencyOfDepreciation || 12}{' '}
            {t('assets.category.months', 'شهر')}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{category.assetCount || 0}</span>
          </div>
        </TableCell>
        <TableCell>{getStatusBadge(category.isActive !== false)}</TableCell>
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
                  navigate({ to: `/dashboard/assets/categories/${category._id}` })
                }}
              >
                <Eye className="w-4 h-4 ml-2" />
                {t('common.view', 'عرض')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  navigate({ to: `/dashboard/assets/categories/${category._id}/edit` })
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
                  setCategoryToDelete(category)
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
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
      >
        <ProductivityHero
          badge={t('assets.category.badge', 'فئات الأصول')}
          title={t('assets.category.title', 'فئات الأصول الثابتة')}
          type="assets"
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
                    {t('assets.category.stats.total', 'إجمالي الفئات')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.category.stats.active', 'فئات نشطة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalAssets}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.category.stats.totalAssets', 'إجمالي الأصول')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{stats.inactive}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.category.stats.inactive', 'غير نشطة')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          'assets.category.searchPlaceholder',
                          'البحث في الفئات...'
                        )}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 rounded-xl"
                      />
                    </div>
                    <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      <Link to="/dashboard/assets/categories/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('assets.category.addCategory', 'إضافة فئة')}
                      </Link>
                    </Button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex justify-end">
                    <div className="inline-flex items-center gap-1 bg-muted rounded-xl p-1">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`rounded-lg ${viewMode === 'list' ? 'bg-background shadow-sm hover:bg-background' : 'hover:bg-transparent'}`}
                      >
                        <List className="w-4 h-4 ml-2" />
                        {t('common.listView', 'قائمة')}
                      </Button>
                      <Button
                        variant={viewMode === 'tree' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('tree')}
                        className={`rounded-lg ${viewMode === 'tree' ? 'bg-background shadow-sm hover:bg-background' : 'hover:bg-transparent'}`}
                      >
                        <Network className="w-4 h-4 ml-2" />
                        {t('common.treeView', 'شجرة')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs & Categories Table */}
            <Card className="rounded-3xl">
              <CardContent className="p-0">
                <Tabs
                  value={statusTab}
                  onValueChange={(v) => setStatusTab(v as typeof statusTab)}
                  className="w-full"
                >
                  <div className="border-b px-6 pt-6">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="all">
                        {t('common.all', 'الكل')} ({stats.total})
                      </TabsTrigger>
                      <TabsTrigger value="active">
                        {t('common.active', 'نشط')} ({stats.active})
                      </TabsTrigger>
                      <TabsTrigger value="inactive">
                        {t('common.inactive', 'غير نشط')} ({stats.inactive})
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
                    ) : displayCategories.length === 0 ? (
                      <div className="p-12 text-center">
                        <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {t('assets.category.noCategories', 'لا توجد فئات')}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {t(
                            'assets.category.noCategoriesDesc',
                            'ابدأ بإضافة فئة جديدة للأصول'
                          )}
                        </p>
                        <Button asChild className="rounded-xl">
                          <Link to="/dashboard/assets/categories/create">
                            <Plus className="w-4 h-4 ml-2" />
                            {t('assets.category.addCategory', 'إضافة فئة')}
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">
                              {t('assets.category.name', 'اسم الفئة')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('assets.category.depreciationMethod', 'طريقة الإهلاك')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('assets.category.usefulLife', 'العمر الإنتاجي')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('assets.category.assetCount', 'عدد الأصول')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('common.status', 'الحالة')}
                            </TableHead>
                            <TableHead className="text-right w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayCategories.map((category) => renderCategoryRow(category))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                </Tabs>
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
            <AlertDialogTitle>
              {t('assets.category.deleteConfirmTitle', 'حذف الفئة')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'assets.category.deleteConfirmDesc',
                'هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء.'
              )}
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
