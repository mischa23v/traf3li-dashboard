/**
 * Products/Services List View Component
 *
 * Features:
 * - Filter bar with search, type, category, practice area, status
 * - Data table with sortable columns
 * - Actions: Edit, Duplicate, Toggle Active/Inactive, Delete
 * - Create Product button
 * - RTL and Arabic support
 */

import { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import {
  MoreHorizontal,
  Plus,
  Package,
  Search,
  Bell,
  AlertCircle,
  Filter,
  X,
  Edit3,
  Copy,
  Power,
  Trash2,
  ArrowUpDown,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useProducts,
  useDeleteProduct,
  useDuplicateProduct,
  useToggleProductActive,
  useProductCategories,
} from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GosiCard,
  GosiInput,
  GosiSelect,
  GosiSelectContent,
  GosiSelectItem,
  GosiSelectTrigger,
  GosiSelectValue,
  GosiButton,
} from '@/components/ui/gosi-ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Product, ProductType } from '@/types/crm-extended'
import { ProductivityHero } from '@/components/productivity-hero'

// Product type labels
const productTypeColors: Record<ProductType, string> = {
  service: 'bg-blue-100 text-blue-700 border-blue-200',
  product: 'bg-purple-100 text-purple-700 border-purple-200',
  subscription: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  retainer: 'bg-orange-100 text-orange-700 border-orange-200',
  hourly: 'bg-amber-100 text-amber-700 border-amber-200',
}

// Memoized components for performance
const ProductTypeCell = memo(
  ({ type, label }: { type: ProductType; label: string }) => (
    <Badge variant="outline" className={productTypeColors[type]}>
      {label}
    </Badge>
  )
)

const StatusCell = memo(
  ({ isActive, activeLabel, inactiveLabel }: { isActive: boolean; activeLabel: string; inactiveLabel: string }) => (
    <Badge
      variant="outline"
      className={
        isActive
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-500 border-slate-200'
      }
    >
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  )
)

export function ProductsListView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isArabic = i18n.language === 'ar'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)

  // Build API filters
  const filters = useMemo(() => {
    const f: any = {}

    if (searchQuery.trim()) {
      f.search = searchQuery.trim()
    }

    if (typeFilter.length > 0) {
      f.type = typeFilter.join(',')
    }

    if (categoryFilter !== 'all') {
      f.category = categoryFilter
    }

    if (practiceAreaFilter !== 'all') {
      f.practiceArea = practiceAreaFilter
    }

    if (statusFilter === 'active') {
      f.isActive = true
    } else if (statusFilter === 'inactive') {
      f.isActive = false
    }
    // 'all' = no filter

    f.sortBy = sortBy
    f.sortOrder = sortOrder

    return f
  }, [searchQuery, typeFilter, categoryFilter, practiceAreaFilter, statusFilter, sortBy, sortOrder])

  // Check if any filter is active
  const hasActiveFilters = useMemo(
    () =>
      searchQuery ||
      typeFilter.length > 0 ||
      categoryFilter !== 'all' ||
      practiceAreaFilter !== 'all' ||
      statusFilter !== 'all',
    [searchQuery, typeFilter, categoryFilter, practiceAreaFilter, statusFilter]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setTypeFilter([])
    setCategoryFilter('all')
    setPracticeAreaFilter('all')
    setStatusFilter('active')
  }, [])

  // Fetch data
  const { data: productsData, isLoading, isError, error, refetch } = useProducts(filters)
  const { data: categoriesData } = useProductCategories()
  const { mutate: deleteProduct } = useDeleteProduct()
  const { mutate: duplicateProduct } = useDuplicateProduct()
  const { mutate: toggleActive } = useToggleProductActive()

  // Transform API data
  const products = useMemo(() => {
    if (!productsData?.data) return []
    return productsData.data
  }, [productsData])

  // Get unique practice areas from products
  const practiceAreas = useMemo(() => {
    const areas = new Set<string>()
    products.forEach((p) => {
      if (p.practiceArea) areas.add(p.practiceArea)
    })
    return Array.from(areas)
  }, [products])

  const categories = categoriesData || []

  // Action handlers
  const handleEdit = useCallback(
    (productId: string) => {
      // Navigate to edit page (you'll need to define this route)
      navigate({ to: `/dashboard/crm/products/${productId}/edit` as any })
    },
    [navigate]
  )

  const handleDuplicate = useCallback(
    (productId: string, productName: string) => {
      const confirmMessage = isArabic
        ? `هل تريد نسخ المنتج "${productName}"؟ | Duplicate product "${productName}"?`
        : `Duplicate product "${productName}"? | هل تريد نسخ المنتج "${productName}"؟`

      if (confirm(confirmMessage)) {
        duplicateProduct({ productId })
      }
    },
    [isArabic, duplicateProduct]
  )

  const handleToggleActive = useCallback(
    (productId: string, productName: string, currentStatus: boolean) => {
      const action = currentStatus ? 'تعطيل | Deactivate' : 'تفعيل | Activate'
      const confirmMessage = isArabic
        ? `هل تريد ${action} المنتج "${productName}"؟`
        : `${action} product "${productName}"?`

      if (confirm(confirmMessage)) {
        toggleActive(productId)
      }
    },
    [isArabic, toggleActive]
  )

  const handleDelete = useCallback(
    (productId: string, productName: string, timesSold: number) => {
      if (timesSold > 0) {
        const message = isArabic
          ? `لا يمكن حذف المنتج "${productName}" لأنه تم بيعه ${timesSold} مرة | Cannot delete product "${productName}" as it has been sold ${timesSold} times`
          : `Cannot delete product "${productName}" as it has been sold ${timesSold} times | لا يمكن حذف المنتج "${productName}" لأنه تم بيعه ${timesSold} مرة`
        alert(message)
        return
      }

      const confirmMessage = isArabic
        ? `هل أنت متأكد من حذف المنتج "${productName}"؟ | Are you sure you want to delete product "${productName}"?`
        : `Are you sure you want to delete product "${productName}"? | هل أنت متأكد من حذف المنتج "${productName}"؟`

      if (confirm(confirmMessage)) {
        deleteProduct(productId)
      }
    },
    [isArabic, deleteProduct]
  )

  // Toggle sort
  const toggleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        setSortBy(column)
        setSortOrder('asc')
      }
    },
    [sortBy, sortOrder]
  )

  // Top navigation
  const topNav = [
    { title: t('sidebar.nav.products'), href: ROUTES.dashboard.crm.products.list, isActive: true },
    { title: t('sidebar.nav.quotes'), href: ROUTES.dashboard.crm.quotes.list, isActive: false },
    { title: t('sidebar.nav.leads'), href: ROUTES.dashboard.crm.leads.list, isActive: false },
  ]

  // Product types for multi-select
  const productTypes: ProductType[] = ['service', 'product', 'subscription', 'retainer', 'hourly']

  // Handle type filter toggle
  const handleTypeToggle = useCallback(
    (type: string) => {
      setTypeFilter((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      )
    },
    []
  )

  // Format currency
  const formatCurrency = useCallback(
    (amount: number, currency: string = 'SAR') => {
      return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
      }).format(amount)
    },
    [isArabic]
  )

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={t('common.search')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD */}
        <div className="flex items-center justify-between">
          <ProductivityHero
            badge={t('products.management', 'إدارة المنتجات والخدمات')}
            title={t('products.title', 'المنتجات والخدمات')}
            type="products"
          />
          <GosiButton
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-6 h-12 shadow-lg shadow-emerald-500/20"
          >
            <Link to={ROUTES.dashboard.crm.products.new}>
              <Plus className="w-5 h-5 ms-2" aria-hidden="true" />
              {t('products.newProduct', 'منتج جديد')}
            </Link>
          </GosiButton>
        </div>

        {/* FILTERS BAR */}
        <GosiCard className="p-4 md:p-6 rounded-[2rem]">
          <div className="space-y-4">
            {/* Top Row: Search + Filter Toggle */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative w-full">
                <Search
                  className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                  aria-hidden="true"
                />
                <GosiInput
                  type="text"
                  placeholder={t('products.searchPlaceholder', 'البحث بالاسم أو الكود...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pe-12 h-14 w-full text-base"
                />
              </div>

              <GosiButton
                variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className={`h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all ${
                  showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''
                }`}
              >
                <Filter className="h-5 w-5 ms-2" />
                {t('common.filters', 'تصفية')}
                {hasActiveFilters && (
                  <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </GosiButton>
            </div>

            {/* Filters Container */}
            <div
              className={`flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden ${
                showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'
              }`}
            >
              {/* Type Multi-Select */}
              <div className="flex-1 min-w-[220px]">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {t('products.type', 'النوع')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {productTypes.map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={typeFilter.includes(type) ? 'default' : 'outline'}
                        onClick={() => handleTypeToggle(type)}
                        className={`rounded-full px-3 h-8 text-xs ${
                          typeFilter.includes(type)
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : ''
                        }`}
                      >
                        {t(`products.types.${type}`, type)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="flex-1 min-w-[220px]">
                <GosiSelect value={categoryFilter} onValueChange={setCategoryFilter}>
                  <GosiSelectTrigger className="w-full h-14 bg-white">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        {t('products.category', 'الفئة')}:
                      </span>
                      <GosiSelectValue />
                    </div>
                  </GosiSelectTrigger>
                  <GosiSelectContent>
                    <GosiSelectItem value="all" className="font-bold">
                      {t('common.all', 'الكل')}
                    </GosiSelectItem>
                    {categories.map((cat) => (
                      <GosiSelectItem key={cat} value={cat} className="font-bold">
                        {cat}
                      </GosiSelectItem>
                    ))}
                  </GosiSelectContent>
                </GosiSelect>
              </div>

              {/* Practice Area */}
              <div className="flex-1 min-w-[220px]">
                <GosiSelect value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
                  <GosiSelectTrigger className="w-full h-14 bg-white">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        {t('products.practiceArea', 'مجال الممارسة')}:
                      </span>
                      <GosiSelectValue />
                    </div>
                  </GosiSelectTrigger>
                  <GosiSelectContent>
                    <GosiSelectItem value="all" className="font-bold">
                      {t('common.all', 'الكل')}
                    </GosiSelectItem>
                    {practiceAreas.map((area) => (
                      <GosiSelectItem key={area} value={area} className="font-bold">
                        {area}
                      </GosiSelectItem>
                    ))}
                  </GosiSelectContent>
                </GosiSelect>
              </div>

              {/* Status */}
              <div className="flex-1 min-w-[220px]">
                <GosiSelect value={statusFilter} onValueChange={setStatusFilter}>
                  <GosiSelectTrigger className="w-full h-14 bg-white">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        {t('common.status', 'الحالة')}:
                      </span>
                      <GosiSelectValue />
                    </div>
                  </GosiSelectTrigger>
                  <GosiSelectContent>
                    <GosiSelectItem value="all" className="font-bold">
                      {t('common.all', 'الكل')}
                    </GosiSelectItem>
                    <GosiSelectItem value="active" className="font-bold">
                      {t('products.active', 'نشط')}
                    </GosiSelectItem>
                    <GosiSelectItem value="inactive" className="font-bold">
                      {t('products.inactive', 'غير نشط')}
                    </GosiSelectItem>
                  </GosiSelectContent>
                </GosiSelect>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-center">
                  <GosiButton
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-14 w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6"
                  >
                    <X className="h-5 w-5 ms-2" aria-hidden="true" />
                    {t('common.clearFilters', 'مسح الفلاتر')}
                  </GosiButton>
                </div>
              )}
            </div>
          </div>
        </GosiCard>

        {/* DATA TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t('products.loadError', 'خطأ في تحميل المنتجات')}
              </h3>
              <p className="text-slate-500 mb-4">{error?.message || t('common.serverError')}</p>
              <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                {t('common.retry', 'إعادة المحاولة')}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Package className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t('products.noProducts', 'لا توجد منتجات')}
              </h3>
              <p className="text-slate-500 mb-4">
                {t('products.startAddingProduct', 'ابدأ بإضافة منتجات وخدمات')}
              </p>
              <GosiButton asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link to={ROUTES.dashboard.crm.products.new}>
                  <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                  {t('products.newProduct', 'منتج جديد')}
                </Link>
              </GosiButton>
            </div>
          )}

          {/* Success State - Products Table */}
          {!isLoading && !isError && products.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('code')}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {t('products.code', 'الكود')}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {t('products.name', 'الاسم')}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('type')}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {t('products.type', 'النوع')}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('category')}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {t('products.category', 'الفئة')}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('pricing.basePrice')}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {t('products.unitPrice', 'سعر الوحدة')}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold">{t('products.unit', 'الوحدة')}</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('isActive')}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {t('common.status', 'الحالة')}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleSort('statistics.timesSold')}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {t('products.timesSold', 'مرات البيع')}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-center">
                      {t('common.actions', 'الإجراءات')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-navy">{product.code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-bold text-slate-900">
                            {isArabic ? product.nameAr || product.name : product.name}
                          </div>
                          {product.description && (
                            <div className="text-xs text-slate-500 truncate max-w-xs">
                              {isArabic
                                ? product.descriptionAr || product.description
                                : product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProductTypeCell
                          type={product.type}
                          label={t(`products.types.${product.type}`, product.type)}
                        />
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {product.category || '-'}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        {formatCurrency(product.pricing.basePrice, product.pricing.currency)}
                      </TableCell>
                      <TableCell className="text-slate-600">{product.unit}</TableCell>
                      <TableCell>
                        <StatusCell
                          isActive={product.isActive}
                          activeLabel={t('products.active', 'نشط')}
                          inactiveLabel={t('products.inactive', 'غير نشط')}
                        />
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700">
                        {product.statistics.timesSold}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-500 hover:text-navy hover:bg-slate-100 rounded-xl"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleEdit(product.id)}
                                className="cursor-pointer"
                              >
                                <Edit3 className="h-4 w-4 ms-2 text-blue-500" />
                                {t('common.edit', 'تعديل')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDuplicate(
                                    product.id,
                                    isArabic ? product.nameAr || product.name : product.name
                                  )
                                }
                                className="cursor-pointer"
                              >
                                <Copy className="h-4 w-4 ms-2 text-purple-500" />
                                {t('common.duplicate', 'نسخ')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleActive(
                                    product.id,
                                    isArabic ? product.nameAr || product.name : product.name,
                                    product.isActive
                                  )
                                }
                                className="cursor-pointer"
                              >
                                <Power
                                  className={`h-4 w-4 ms-2 ${
                                    product.isActive ? 'text-amber-500' : 'text-emerald-500'
                                  }`}
                                />
                                {product.isActive
                                  ? t('products.deactivate', 'تعطيل')
                                  : t('products.activate', 'تفعيل')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(
                                    product.id,
                                    isArabic ? product.nameAr || product.name : product.name,
                                    product.statistics.timesSold
                                  )
                                }
                                disabled={product.statistics.timesSold > 0}
                                className={`cursor-pointer ${
                                  product.statistics.timesSold > 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'text-red-600 focus:text-red-600 bg-red-50/50 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="h-4 w-4 ms-2" />
                                {t('common.delete', 'حذف')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="text-center text-sm text-slate-500">
            {t('common.showing', 'عرض')} {products.length} {t('common.results', 'نتيجة')}
          </div>
        )}
      </Main>
    </>
  )
}
