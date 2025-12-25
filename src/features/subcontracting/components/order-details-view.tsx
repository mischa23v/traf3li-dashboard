/**
 * Subcontracting Order Details View
 * Comprehensive view for subcontracting orders, materials, receipts, and quality inspection
 */

import { useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  GitBranch,
  Package,
  FileText,
  CheckCircle,
  Send,
  XCircle,
  Clock,
  Layers,
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  ClipboardCheck,
  ArrowRightLeft,
} from 'lucide-react'

// Layout Components
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

// Feature Components
import { SubcontractingSidebar } from './subcontracting-sidebar'

// Hooks
import {
  useSubcontractingOrder,
  useSubcontractingReceipts,
  useDeleteSubcontractingOrder,
  useSubmitSubcontractingOrder,
  useCancelSubcontractingOrder,
} from '@/hooks/use-subcontracting'

// Other
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function SubcontractingOrderDetailsView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { orderId } = useParams({ strict: false }) as { orderId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Fetch order data
  const { data: order, isLoading, isError, error } = useSubcontractingOrder(orderId)
  const deleteOrderMutation = useDeleteSubcontractingOrder()
  const submitOrderMutation = useSubmitSubcontractingOrder()
  const cancelOrderMutation = useCancelSubcontractingOrder()

  // Fetch receipts for this order
  const { data: receiptsData } = useSubcontractingReceipts({ orderId })
  const receipts = receiptsData?.data || []

  const topNav = [
    {
      title: isArabic ? 'نظرة عامة' : 'Overview',
      href: '/dashboard/subcontracting/overview',
      isActive: false
    },
    {
      title: isArabic ? 'أوامر التصنيع' : 'Subcontracting Orders',
      href: '/dashboard/subcontracting',
      isActive: true
    },
    {
      title: isArabic ? 'إيصالات الاستلام' : 'Receipts',
      href: '/dashboard/subcontracting/receipts',
      isActive: false
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDelete = () => {
    deleteOrderMutation.mutate(orderId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/subcontracting' })
      },
    })
  }

  const handleSubmit = () => {
    submitOrderMutation.mutate(orderId)
  }

  const handleCancel = () => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => {
        setShowCancelDialog(false)
      },
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: isArabic ? 'مسودة' : 'Draft',
        className: 'bg-gray-100 text-gray-700',
        icon: Clock
      },
      submitted: {
        label: isArabic ? 'مقدم' : 'Submitted',
        className: 'bg-blue-100 text-blue-700',
        icon: Send
      },
      partially_received: {
        label: isArabic ? 'مستلم جزئياً' : 'Partially Received',
        className: 'bg-amber-100 text-amber-700',
        icon: Package
      },
      completed: {
        label: isArabic ? 'مكتمل' : 'Completed',
        className: 'bg-emerald-100 text-emerald-700',
        icon: CheckCircle
      },
      cancelled: {
        label: isArabic ? 'ملغى' : 'Cancelled',
        className: 'bg-red-100 text-red-700',
        icon: XCircle
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 me-1" aria-hidden="true" />
        {config.label}
      </Badge>
    )
  }

  const calculateMaterialTransferProgress = () => {
    if (!order?.rawMaterials || order.rawMaterials.length === 0) return 100
    const totalRequired = order.rawMaterials.reduce((sum, m) => sum + m.requiredQty, 0)
    const totalTransferred = order.rawMaterials.reduce((sum, m) => sum + m.transferredQty, 0)
    return totalRequired > 0 ? Math.round((totalTransferred / totalRequired) * 100) : 0
  }

  const getReceiptStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: isArabic ? 'مسودة' : 'Draft', className: 'bg-gray-100 text-gray-700' },
      submitted: { label: isArabic ? 'مقدم' : 'Submitted', className: 'bg-emerald-100 text-emerald-700' },
      cancelled: { label: isArabic ? 'ملغى' : 'Cancelled', className: 'bg-red-100 text-red-700' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.className}>{config.label}</Badge>
  }

  // Loading State
  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className="ms-auto flex items-center gap-4">
            <LanguageSwitcher className="text-slate-300" />
            <ThemeSwitch className="text-slate-300" />
            <ProfileDropdown className="text-slate-300" />
          </div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-[400px] w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  // Error State
  if (isError || !order) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className="ms-auto flex items-center gap-4">
            <LanguageSwitcher className="text-slate-300" />
            <ThemeSwitch className="text-slate-300" />
            <ProfileDropdown className="text-slate-300" />
          </div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Button asChild variant="ghost" className="mb-6">
              <Link to="/dashboard/subcontracting">
                <ArrowLeft className="h-4 w-4 me-2" />
                {isArabic ? 'العودة لأوامر التصنيع' : 'Back to Orders'}
              </Link>
            </Button>
            <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
              <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-navy mb-2">
                {isArabic ? 'فشل تحميل الأمر' : 'Failed to Load Order'}
              </h3>
              <p className="text-slate-500">
                {error?.message || (isArabic ? 'الأمر غير موجود' : 'Order not found')}
              </p>
            </Card>
          </div>
        </Main>
      </>
    )
  }

  const isDraft = order.status === 'draft'
  const isSubmitted = order.status === 'submitted' || order.status === 'partially_received'
  const isCancelled = order.status === 'cancelled'
  const isCompleted = order.status === 'completed'

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
        <div className="ms-auto flex items-center gap-4">
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Button asChild variant="ghost" className="text-slate-600 hover:text-navy">
              <Link to="/dashboard/subcontracting">
                <ArrowLeft className="h-4 w-4 me-2" />
                {isArabic ? 'العودة لأوامر التصنيع' : 'Back to Orders'}
              </Link>
            </Button>
            <div className="flex gap-2 flex-wrap">
              {isDraft && (
                <>
                  <Button asChild variant="outline">
                    <Link to={`/dashboard/subcontracting/orders/${orderId}/edit`}>
                      <Edit className="h-4 w-4 me-2" aria-hidden="true" />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={submitOrderMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitOrderMutation.isPending ? (
                      <Loader2 className="h-4 w-4 me-2 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4 me-2" aria-hidden="true" />
                    )}
                    {isArabic ? 'تقديم' : 'Submit'}
                  </Button>
                </>
              )}
              {isSubmitted && (
                <Button asChild variant="default" className="bg-brand-blue hover:bg-blue-600">
                  <Link to={`/dashboard/subcontracting/receipts/create?orderId=${orderId}`}>
                    <Package className="h-4 w-4 me-2" aria-hidden="true" />
                    {isArabic ? 'إنشاء إيصال استلام' : 'Create Receipt'}
                  </Link>
                </Button>
              )}
              {!isCancelled && !isCompleted && (
                <Button
                  variant="outline"
                  className="text-amber-600 hover:text-amber-700 border-amber-300"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4 me-2" aria-hidden="true" />
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
              )}
              {isDraft && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 me-2" aria-hidden="true" />
                  {isArabic ? 'حذف' : 'Delete'}
                </Button>
              )}
            </div>
          </div>

          {/* Order Header */}
          <ProductivityHero
            badge={isArabic ? 'أمر تصنيع خارجي' : 'Subcontracting Order'}
            title={order.orderNumber}
            type="subcontracting"
            listMode={true}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm rounded-3xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-slate-100 px-6 pt-4">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                      {['overview', 'service-items', 'raw-materials', 'receipts', 'quality'].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="
                            data-[state=active]:bg-transparent data-[state=active]:shadow-none
                            data-[state=active]:border-b-2 data-[state=active]:border-brand-blue
                            data-[state=active]:text-brand-blue
                            text-slate-500 font-medium text-base pb-4 rounded-none px-2
                          "
                        >
                          {tab === 'overview'
                            ? isArabic ? 'نظرة عامة' : 'Overview'
                            : tab === 'service-items'
                              ? isArabic ? 'الخدمات' : 'Service Items'
                              : tab === 'raw-materials'
                                ? isArabic ? 'المواد الخام' : 'Raw Materials'
                                : tab === 'receipts'
                                  ? isArabic ? 'الإيصالات' : 'Receipts'
                                  : isArabic ? 'الجودة' : 'Quality'}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6 bg-slate-50/50">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      {/* Order Information */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'معلومات الأمر' : 'Order Information'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'رقم الأمر' : 'Order Number'}
                              </p>
                              <p className="font-medium text-navy font-mono">{order.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'الحالة' : 'Status'}
                              </p>
                              {getStatusBadge(order.status)}
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'تاريخ الأمر' : 'Order Date'}
                              </p>
                              <p className="font-medium text-navy">{formatDate(order.orderDate)}</p>
                            </div>
                            {order.requiredDate && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'التاريخ المطلوب' : 'Required Date'}
                                </p>
                                <p className="font-medium text-navy">{formatDate(order.requiredDate)}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'نسبة الاستلام' : 'Completion'}
                              </p>
                              <div className="flex items-center gap-3">
                                <Progress value={order.percentReceived || 0} className="flex-1" />
                                <span className="font-bold text-navy text-sm">
                                  {order.percentReceived || 0}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'العملة' : 'Currency'}
                              </p>
                              <p className="font-medium text-navy">{order.currency}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Supplier Information */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'معلومات المورد' : 'Supplier Information'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'اسم المورد' : 'Supplier Name'}
                              </p>
                              <p className="font-medium text-navy">
                                {order.supplierName || order.supplierId}
                              </p>
                            </div>
                            {order.supplierWarehouse && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'مستودع المورد' : 'Supplier Warehouse'}
                                </p>
                                <p className="font-medium text-navy">{order.supplierWarehouse}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Material Transfer Progress */}
                      {order.rawMaterials && order.rawMaterials.length > 0 && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <ArrowRightLeft className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                              {isArabic ? 'تقدم نقل المواد' : 'Material Transfer Progress'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                              <Progress value={calculateMaterialTransferProgress()} className="flex-1" />
                              <span className="font-bold text-navy text-lg">
                                {calculateMaterialTransferProgress()}%
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                              {isArabic
                                ? 'نسبة المواد المنقولة إلى المورد'
                                : 'Percentage of materials transferred to supplier'}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Cost Breakdown */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'تفاصيل التكلفة' : 'Cost Breakdown'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">
                                {isArabic ? 'تكلفة الخدمات' : 'Service Cost'}
                              </span>
                              <span className="font-medium text-navy">
                                {formatCurrency(order.totalServiceCost)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">
                                {isArabic ? 'تكلفة المواد الخام' : 'Raw Material Cost'}
                              </span>
                              <span className="font-medium text-navy">
                                {formatCurrency(order.totalRawMaterialCost)}
                              </span>
                            </div>
                            <div className="border-t border-slate-200 pt-4">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-navy text-lg">
                                  {isArabic ? 'الإجمالي' : 'Grand Total'}
                                </span>
                                <span className="font-bold text-emerald-600 text-xl">
                                  {formatCurrency(order.grandTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Warehouses */}
                      {(order.rawMaterialWarehouse || order.finishedGoodsWarehouse) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Package className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                              {isArabic ? 'المستودعات' : 'Warehouses'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {order.rawMaterialWarehouse && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'مستودع المواد الخام' : 'Raw Material Warehouse'}
                                  </p>
                                  <p className="font-medium text-navy">{order.rawMaterialWarehouse}</p>
                                </div>
                              )}
                              {order.finishedGoodsWarehouse && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'مستودع المنتجات النهائية' : 'Finished Goods Warehouse'}
                                  </p>
                                  <p className="font-medium text-navy">{order.finishedGoodsWarehouse}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Remarks */}
                      {order.remarks && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'ملاحظات' : 'Remarks'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-slate-600 whitespace-pre-wrap">
                              {order.remarks}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Service Items Tab */}
                    <TabsContent value="service-items" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Layers className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'الخدمات' : 'Service Items'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {order.serviceItems.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                              <p>
                                {isArabic
                                  ? 'لا توجد خدمات مضافة'
                                  : 'No service items added'}
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {isArabic ? 'رمز الصنف' : 'Item Code'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'اسم الصنف' : 'Item Name'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'الكمية' : 'Quantity'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'الوحدة' : 'UOM'}
                                    </TableHead>
                                    <TableHead className="text-end">
                                      {isArabic ? 'السعر' : 'Rate'}
                                    </TableHead>
                                    <TableHead className="text-end">
                                      {isArabic ? 'المبلغ' : 'Amount'}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.serviceItems.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="font-mono">
                                        {item.itemCode || '-'}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {item.itemName || item.description || '-'}
                                      </TableCell>
                                      <TableCell className="text-center">{item.qty}</TableCell>
                                      <TableCell>{item.uom}</TableCell>
                                      <TableCell className="text-end">
                                        {formatCurrency(item.rate)}
                                      </TableCell>
                                      <TableCell className="text-end font-bold text-navy">
                                        {formatCurrency(item.amount)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow className="bg-slate-50 font-bold">
                                    <TableCell colSpan={5} className="text-end">
                                      {isArabic ? 'الإجمالي' : 'Total'}
                                    </TableCell>
                                    <TableCell className="text-end text-emerald-600">
                                      {formatCurrency(order.totalServiceCost)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Raw Materials Tab */}
                    <TabsContent value="raw-materials" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Package className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'المواد الخام' : 'Raw Materials'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {order.rawMaterials.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                              <p>
                                {isArabic
                                  ? 'لا توجد مواد خام'
                                  : 'No raw materials'}
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {isArabic ? 'رمز الصنف' : 'Item Code'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'اسم الصنف' : 'Item Name'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'المطلوب' : 'Required'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'المنقول' : 'Transferred'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'المستهلك' : 'Consumed'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'المرتجع' : 'Returned'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'الوحدة' : 'UOM'}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.rawMaterials.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="font-mono">
                                        {item.itemCode || '-'}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {item.itemName || '-'}
                                      </TableCell>
                                      <TableCell className="text-center">{item.requiredQty}</TableCell>
                                      <TableCell className="text-center">
                                        <span className={item.transferredQty >= item.requiredQty ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                                          {item.transferredQty}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-center">{item.consumedQty}</TableCell>
                                      <TableCell className="text-center">{item.returnedQty}</TableCell>
                                      <TableCell>{item.uom}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Receipts Tab */}
                    <TabsContent value="receipts" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'إيصالات الاستلام' : 'Subcontracting Receipts'}
                          </CardTitle>
                          {isSubmitted && (
                            <Button asChild size="sm" className="bg-brand-blue hover:bg-blue-600">
                              <Link to={`/dashboard/subcontracting/receipts/create?orderId=${orderId}`}>
                                <Plus className="h-4 w-4 me-2" aria-hidden="true" />
                                {isArabic ? 'إيصال جديد' : 'New Receipt'}
                              </Link>
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent className="p-6">
                          {receipts.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                              <p>
                                {isArabic
                                  ? 'لا توجد إيصالات استلام'
                                  : 'No receipts created'}
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {isArabic ? 'رقم الإيصال' : 'Receipt Number'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'تاريخ الإضافة' : 'Posting Date'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'الكمية' : 'Total Qty'}
                                    </TableHead>
                                    <TableHead className="text-end">
                                      {isArabic ? 'المبلغ' : 'Total Amount'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'الحالة' : 'Status'}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {receipts.map((receipt: any) => (
                                    <TableRow key={receipt._id}>
                                      <TableCell className="font-medium font-mono">
                                        <Link
                                          to={`/dashboard/subcontracting/receipts/${receipt._id}`}
                                          className="text-brand-blue hover:underline"
                                        >
                                          {receipt.receiptNumber}
                                        </Link>
                                      </TableCell>
                                      <TableCell>{formatDate(receipt.postingDate)}</TableCell>
                                      <TableCell className="text-center">{receipt.totalQty}</TableCell>
                                      <TableCell className="text-end">
                                        {formatCurrency(receipt.totalAmount)}
                                      </TableCell>
                                      <TableCell>{getReceiptStatusBadge(receipt.status)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Quality Tab */}
                    <TabsContent value="quality" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'فحص الجودة' : 'Quality Inspection'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-center py-12 text-slate-500">
                            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                            <p>
                              {isArabic
                                ? 'لا توجد نتائج فحص جودة'
                                : 'No quality inspection results'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <SubcontractingSidebar />
          </div>
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد من حذف هذا الأمر؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this order? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteOrderMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" aria-hidden="true" />
                  {isArabic ? 'جاري الحذف...' : 'Deleting...'}
                </>
              ) : (
                isArabic ? 'حذف' : 'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد من إلغاء هذا الأمر؟ يمكنك إعادة تقديمه لاحقاً.'
                : 'Are you sure you want to cancel this order? You can resubmit it later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'رجوع' : 'Back'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelOrderMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {cancelOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" aria-hidden="true" />
                  {isArabic ? 'جاري الإلغاء...' : 'Cancelling...'}
                </>
              ) : (
                isArabic ? 'إلغاء الأمر' : 'Cancel Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SubcontractingOrderDetailsView
