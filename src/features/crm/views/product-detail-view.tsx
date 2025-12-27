/**
 * Product Detail View - CRM Module
 *
 * Full-featured product detail page with:
 * - Header with TopNav, DynamicIsland
 * - Tabs for Overview, Pricing History, Related Quotes
 * - Action buttons (Edit, Delete, Toggle Active)
 * - RTL support and Arabic labels
 */

import { useState } from 'react'
import {
  FileText,
  Search,
  Bell,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Edit3,
  Loader2,
  Package,
  DollarSign,
  Tag,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Power,
  Receipt,
  ShoppingCart,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useProduct, useDeleteProduct, useToggleProductActive } from '@/hooks/useProducts'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ROUTES } from '@/constants/routes'
import { GosiCard, GosiButton, GosiIconBox } from '@/components/ui/gosi-ui'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ═══════════════════════════════════════════════════════════════
// LABEL MAPPINGS
// ═══════════════════════════════════════════════════════════════

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  service: 'خدمة',
  package: 'باقة',
  consultation: 'استشارة',
  retainer: 'عقد محاماة',
  subscription: 'اشتراك',
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  fixed: 'سعر ثابت',
  hourly: 'بالساعة',
  variable: 'سعر متغير',
}

const RECURRING_INTERVAL_LABELS: Record<string, string> = {
  monthly: 'شهري',
  quarterly: 'ربع سنوي',
  yearly: 'سنوي',
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ProductDetailView() {
  const { productId } = useParams({ strict: false }) as { productId: string }
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch product data
  const { data: productData, isLoading, isError, error, refetch } = useProduct(productId)

  // Mutations
  const deleteProductMutation = useDeleteProduct()
  const toggleActiveMutation = useToggleProductActive()

  // Transform API data
  const product = productData?.data || productData

  const handleDelete = () => {
    deleteProductMutation.mutate(productId, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.crm.products.list })
      },
    })
  }

  const handleToggleActive = () => {
    toggleActiveMutation.mutate(productId)
  }

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
    { title: 'المنتجات', href: ROUTES.dashboard.crm.products.list, isActive: true },
    { title: 'العملاء', href: ROUTES.dashboard.clients.list, isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="التنبيهات"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to={ROUTES.dashboard.crm.products.list}
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة المنتجات
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              حدث خطأ أثناء تحميل المنتج
            </h3>
            <p className="text-slate-500 mb-4">
              {error?.message || 'تعذر الاتصال بالخادم'}
            </p>
            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !product && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Package className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">المنتج غير موجود</h3>
            <p className="text-slate-500 mb-4">لم يتم العثور على المنتج المطلوب</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to={ROUTES.dashboard.crm.products.list}>العودة إلى القائمة</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && product && (
          <>
            {/* HERO CARD */}
            <ProductivityHero
              badge="إدارة المنتجات والخدمات"
              title={product.nameAr || product.name}
              type="crm"
              listMode={true}
            />

            {/* Product Header Card */}
            <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Package className="h-10 w-10 text-white" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-navy">
                        {product.nameAr || product.name}
                      </h1>
                      {product.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          نشط
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                          <Power className="h-3 w-3" />
                          غير نشط
                        </Badge>
                      )}
                      {product.type && (
                        <Badge className="bg-blue-100 text-blue-700">
                          {PRODUCT_TYPE_LABELS[product.type] || product.type}
                        </Badge>
                      )}
                    </div>

                    {/* English Name */}
                    {product.name && product.name !== product.nameAr && (
                      <p className="text-lg text-slate-600 mb-3" dir="ltr">
                        {product.name}
                      </p>
                    )}

                    {/* SKU and Category */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                      {product.code && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-purple-500" />
                          <span>
                            <span className="text-slate-500">الكود:</span> {product.code}
                          </span>
                        </div>
                      )}
                      {product.category && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>
                            <span className="text-slate-500">التصنيف:</span> {product.category}
                          </span>
                        </div>
                      )}
                      {product.unit && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-emerald-500" />
                          <span>
                            <span className="text-slate-500">الوحدة:</span> {product.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <Link to={ROUTES.dashboard.crm.products.edit(productId)}>
                        <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                          <Edit3 className="h-4 w-4 ms-2" aria-hidden="true" />
                          تعديل
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={handleToggleActive}
                        disabled={toggleActiveMutation.isPending}
                        className={
                          product.isActive
                            ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }
                      >
                        {toggleActiveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin ms-2" />
                        ) : (
                          <Power className="h-4 w-4 ms-2" aria-hidden="true" />
                        )}
                        {product.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Receipt className="h-4 w-4 me-2" />
                            إنشاء عرض سعر
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 me-2" />
                            إنشاء فاتورة
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 me-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">السعر الأساسي</p>
                      <p className="text-2xl font-bold text-navy">
                        {product.pricing?.basePrice?.toLocaleString('ar-SA') || '0'}{' '}
                        <span className="text-sm text-slate-500">
                          {product.pricing?.currency || 'SAR'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">عدد المبيعات</p>
                      <p className="text-2xl font-bold text-navy">
                        {product.statistics?.timesSold || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي الإيرادات</p>
                      <p className="text-xl font-bold text-navy">
                        {product.statistics?.totalRevenue?.toLocaleString('ar-SA') || '0'}{' '}
                        <span className="text-sm text-slate-500">SAR</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MAIN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* RIGHT COLUMN (Main Content) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Main Content Card - Gosi Premium Design */}
                <GosiCard className="min-h-[600px] p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Gosi Premium Tabs Header */}
                    <div className="border-b border-slate-100/50 px-4 sm:px-6 py-4">
                      <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100/80 p-1.5 text-slate-500 w-full sm:w-auto gap-1">
                        {['overview', 'pricing', 'quotes'].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="
                              inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 sm:px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all duration-200
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                              disabled:pointer-events-none disabled:opacity-50
                              data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20
                              data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:text-slate-900
                              flex-1 sm:flex-initial
                            "
                          >
                            {tab === 'overview'
                              ? 'نظرة عامة'
                              : tab === 'pricing'
                                ? 'التسعير'
                                : 'عروض الأسعار'}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px] sm:min-h-[500px]">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Description */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              الوصف
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {product.descriptionAr || product.description ? (
                              <div className="space-y-3">
                                {product.descriptionAr && (
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">الوصف بالعربية</p>
                                    <p className="text-slate-600 leading-relaxed">
                                      {product.descriptionAr}
                                    </p>
                                  </div>
                                )}
                                {product.description && product.description !== product.descriptionAr && (
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">الوصف بالإنجليزية</p>
                                    <p className="text-slate-600 leading-relaxed" dir="ltr">
                                      {product.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">لا يوجد وصف</p>
                            )}
                          </CardContent>
                        </Card>

                        {/* Product Details */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Package className="h-5 w-5 text-emerald-500" />
                              تفاصيل المنتج
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الكود / SKU</p>
                              <p className="font-medium text-navy">{product.code || '-'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">النوع</p>
                              <p className="font-medium text-navy">
                                {PRODUCT_TYPE_LABELS[product.type] || product.type}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">التصنيف</p>
                              <p className="font-medium text-navy">{product.category || '-'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">مجال الممارسة</p>
                              <p className="font-medium text-navy">
                                {product.practiceArea || '-'}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الوحدة</p>
                              <p className="font-medium text-navy">{product.unit || '-'}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الحالة</p>
                              <Badge
                                className={
                                  product.isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                                }
                              >
                                {product.isActive ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Tag className="h-5 w-5 text-blue-500" />
                                الوسوم
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Timestamps */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-purple-500" />
                              معلومات النظام
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</p>
                              <p className="font-medium text-navy">
                                {product.createdAt
                                  ? new Date(product.createdAt).toLocaleDateString('ar-SA', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : '-'}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">آخر تحديث</p>
                              <p className="font-medium text-navy">
                                {product.updatedAt
                                  ? new Date(product.updatedAt).toLocaleDateString('ar-SA', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : '-'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Pricing Tab */}
                      <TabsContent value="pricing" className="mt-0 space-y-6">
                        {/* Pricing Details */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-emerald-500" />
                              تفاصيل التسعير
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">نوع السعر</p>
                              <p className="font-medium text-navy">
                                {PRICE_TYPE_LABELS[product.pricing?.priceType] ||
                                  product.pricing?.priceType ||
                                  '-'}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">السعر الأساسي</p>
                              <p className="font-medium text-emerald-600 text-lg">
                                {product.pricing?.basePrice?.toLocaleString('ar-SA') || '0'}{' '}
                                {product.pricing?.currency || 'SAR'}
                              </p>
                            </div>
                            {product.pricing?.minPrice && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحد الأدنى للسعر</p>
                                <p className="font-medium text-navy">
                                  {product.pricing.minPrice.toLocaleString('ar-SA')}{' '}
                                  {product.pricing?.currency || 'SAR'}
                                </p>
                              </div>
                            )}
                            {product.pricing?.maxPrice && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحد الأقصى للسعر</p>
                                <p className="font-medium text-navy">
                                  {product.pricing.maxPrice.toLocaleString('ar-SA')}{' '}
                                  {product.pricing?.currency || 'SAR'}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Tax Information */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-blue-500" />
                              معلومات الضريبة
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">معدل الضريبة</p>
                              <p className="font-medium text-navy">
                                {product.taxRate ? `${product.taxRate}%` : '0%'}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">السعر شامل الضريبة؟</p>
                              <Badge
                                className={
                                  product.taxInclusive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-700'
                                }
                              >
                                {product.taxInclusive ? 'نعم' : 'لا'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Recurring Billing */}
                        {product.recurring && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-500" />
                                الفوترة المتكررة
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الفترة</p>
                                <p className="font-medium text-navy">
                                  {RECURRING_INTERVAL_LABELS[product.recurring.interval] ||
                                    product.recurring.interval}
                                </p>
                              </div>
                              {product.recurring.trialDays && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">أيام التجربة</p>
                                  <p className="font-medium text-navy">
                                    {product.recurring.trialDays} يوم
                                  </p>
                                </div>
                              )}
                              {product.recurring.setupFee && (
                                <div className="p-3 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">رسوم التفعيل</p>
                                  <p className="font-medium text-navy">
                                    {product.recurring.setupFee.toLocaleString('ar-SA')}{' '}
                                    {product.pricing?.currency || 'SAR'}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Quotes Tab */}
                      <TabsContent value="quotes" className="mt-0">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              عروض الأسعار المرتبطة
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center py-12">
                              <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                              <p className="text-slate-500 mb-4">لا توجد عروض أسعار مرتبطة</p>
                              <Button className="bg-emerald-500 hover:bg-emerald-600">
                                <FileText className="h-4 w-4 ms-2" />
                                إنشاء عرض سعر جديد
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </div>
                  </Tabs>
                </GosiCard>
              </div>

              {/* LEFT SIDEBAR - Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions Card */}
                <GosiCard className="p-6">
                  <h3 className="text-lg font-bold text-navy mb-4">إجراءات سريعة</h3>
                  <div className="space-y-3">
                    <Link to={ROUTES.dashboard.crm.products.edit(productId)}>
                      <GosiButton variant="outline" className="w-full justify-start">
                        <Edit3 className="h-4 w-4 ms-2" />
                        تعديل المنتج
                      </GosiButton>
                    </Link>
                    <GosiButton
                      variant="outline"
                      onClick={handleToggleActive}
                      disabled={toggleActiveMutation.isPending}
                      className="w-full justify-start"
                    >
                      {toggleActiveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                      ) : (
                        <Power className="h-4 w-4 ms-2" />
                      )}
                      {product.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                    </GosiButton>
                    <GosiButton variant="outline" className="w-full justify-start">
                      <Receipt className="h-4 w-4 ms-2" />
                      إنشاء عرض سعر
                    </GosiButton>
                    <GosiButton
                      variant="danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full justify-start"
                    >
                      <Trash2 className="h-4 w-4 ms-2" />
                      حذف المنتج
                    </GosiButton>
                  </div>
                </GosiCard>

                {/* Statistics Card */}
                <GosiCard className="p-6">
                  <h3 className="text-lg font-bold text-navy mb-4">إحصائيات المبيعات</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">عدد المبيعات</p>
                      <p className="text-2xl font-bold text-navy">
                        {product.statistics?.timesSold || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">إجمالي الإيرادات</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {product.statistics?.totalRevenue?.toLocaleString('ar-SA') || '0'}{' '}
                        <span className="text-sm text-slate-500">SAR</span>
                      </p>
                    </div>
                  </div>
                </GosiCard>
              </div>
            </div>
          </>
        )}
      </Main>

      {/* Delete Confirmation Dialog - Gosi Premium Design */}
      {showDeleteConfirm && product && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GosiCard className="p-8 max-w-md w-full">
            <div className="flex justify-center mb-6">
              <GosiIconBox variant="soft" size="lg" className="bg-red-50 text-red-500">
                <AlertTriangle className="w-8 h-8" aria-hidden="true" />
              </GosiIconBox>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              هل أنت متأكد من حذف هذا المنتج؟
            </h3>
            <p className="text-slate-500 text-center mb-8">
              سيتم حذف المنتج "{product.nameAr || product.name}" نهائياً ولا يمكن استرجاعه.
            </p>
            <div className="flex gap-3 justify-center">
              <GosiButton variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                إلغاء
              </GosiButton>
              <GosiButton
                variant="danger"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  handleDelete()
                }}
                isLoading={deleteProductMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                حذف المنتج
              </GosiButton>
            </div>
          </GosiCard>
        </div>
      )}
    </>
  )
}

// Default export
export default ProductDetailView
