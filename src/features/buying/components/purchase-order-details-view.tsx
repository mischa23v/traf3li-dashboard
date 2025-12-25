/**
 * Purchase Order Details View
 * Comprehensive view for purchase order information, items, receipts, invoices, and timeline
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
  Building2,
  Calendar,
  DollarSign,
  Package,
  Receipt,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Mail,
  TrendingUp,
  Hash,
  Truck,
  ShoppingCart,
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
import { BuyingSidebar } from './buying-sidebar'

// Hooks
import {
  usePurchaseOrder,
  useDeletePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  usePurchaseReceipts,
  usePurchaseInvoices,
} from '@/hooks/use-buying'

// Other
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function PurchaseOrderDetailsView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { purchaseOrderId } = useParams({ strict: false }) as { purchaseOrderId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState<{
    open: boolean
    action: 'submit' | 'approve' | 'reject' | 'cancel' | null
  }>({ open: false, action: null })

  // Fetch purchase order data
  const { data: purchaseOrder, isLoading, isError, error } = usePurchaseOrder(purchaseOrderId)
  const deleteMutation = useDeletePurchaseOrder()
  const submitMutation = useSubmitPurchaseOrder()
  const approveMutation = useApprovePurchaseOrder()
  const cancelMutation = useCancelPurchaseOrder()

  // Fetch related data
  const { data: receiptsData } = usePurchaseReceipts({ purchaseOrderId, limit: 10 })
  const purchaseReceipts = receiptsData?.receipts || []

  const { data: invoicesData } = usePurchaseInvoices({ purchaseOrderId, limit: 10 })
  const purchaseInvoices = invoicesData?.invoices || []

  const topNav = [
    {
      title: isArabic ? 'نظرة عامة' : 'Overview',
      href: '/dashboard/buying/overview',
      isActive: false
    },
    {
      title: isArabic ? 'الموردين' : 'Suppliers',
      href: '/dashboard/buying/suppliers',
      isActive: false
    },
    {
      title: isArabic ? 'أوامر الشراء' : 'Purchase Orders',
      href: '/dashboard/buying/purchase-orders',
      isActive: true
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
    deleteMutation.mutate(purchaseOrderId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/buying/purchase-orders' })
      },
    })
  }

  const handleAction = () => {
    const { action } = showActionDialog
    if (!action) return

    const mutations = {
      submit: submitMutation,
      approve: approveMutation,
      reject: cancelMutation,
      cancel: cancelMutation,
    }

    mutations[action].mutate(purchaseOrderId, {
      onSuccess: () => {
        setShowActionDialog({ open: false, action: null })
      },
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: isArabic ? 'مسودة' : 'Draft',
        className: 'bg-gray-100 text-gray-700'
      },
      submitted: {
        label: isArabic ? 'مقدم' : 'Submitted',
        className: 'bg-blue-100 text-blue-700'
      },
      approved: {
        label: isArabic ? 'معتمد' : 'Approved',
        className: 'bg-purple-100 text-purple-700'
      },
      received: {
        label: isArabic ? 'مستلم' : 'Received',
        className: 'bg-teal-100 text-teal-700'
      },
      billed: {
        label: isArabic ? 'مفوتر' : 'Billed',
        className: 'bg-emerald-100 text-emerald-700'
      },
      cancelled: {
        label: isArabic ? 'ملغى' : 'Cancelled',
        className: 'bg-red-100 text-red-700'
      },
      closed: {
        label: isArabic ? 'مغلق' : 'Closed',
        className: 'bg-slate-100 text-slate-700'
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.className}>{config.label}</Badge>
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

  const getInvoiceStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: isArabic ? 'مسودة' : 'Draft', className: 'bg-gray-100 text-gray-700' },
      submitted: { label: isArabic ? 'مقدم' : 'Submitted', className: 'bg-blue-100 text-blue-700' },
      paid: { label: isArabic ? 'مدفوع' : 'Paid', className: 'bg-emerald-100 text-emerald-700' },
      partially_paid: { label: isArabic ? 'مدفوع جزئياً' : 'Partially Paid', className: 'bg-amber-100 text-amber-700' },
      overdue: { label: isArabic ? 'متأخر' : 'Overdue', className: 'bg-red-100 text-red-700' },
      cancelled: { label: isArabic ? 'ملغى' : 'Cancelled', className: 'bg-slate-100 text-slate-700' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const renderActionButtons = () => {
    if (!purchaseOrder) return null

    const { status } = purchaseOrder

    return (
      <div className="flex flex-wrap gap-2">
        {/* Draft Status Actions */}
        {status === 'draft' && (
          <>
            <Button
              variant="default"
              onClick={() => setShowActionDialog({ open: true, action: 'submit' })}
              disabled={submitMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'ترحيل' : 'Submit'}
            </Button>
            <Button asChild variant="outline">
              <Link to={`/dashboard/buying/purchase-orders/${purchaseOrderId}/edit`}>
                <Edit className="h-4 w-4 me-2" aria-hidden="true" />
                {isArabic ? 'تعديل' : 'Edit'}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'حذف' : 'Delete'}
            </Button>
          </>
        )}

        {/* Submitted Status Actions */}
        {status === 'submitted' && (
          <>
            <Button
              variant="default"
              onClick={() => setShowActionDialog({ open: true, action: 'approve' })}
              disabled={approveMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'اعتماد' : 'Approve'}
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowActionDialog({ open: true, action: 'reject' })}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'رفض' : 'Reject'}
            </Button>
          </>
        )}

        {/* Approved Status Actions */}
        {status === 'approved' && (
          <>
            <Button asChild variant="default">
              <Link to={`/dashboard/buying/purchase-receipts/new?poId=${purchaseOrderId}`}>
                <Truck className="h-4 w-4 me-2" aria-hidden="true" />
                {isArabic ? 'إنشاء إيصال استلام' : 'Create Receipt'}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowActionDialog({ open: true, action: 'cancel' })}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
          </>
        )}

        {/* Received Status Actions */}
        {status === 'received' && (
          <Button asChild variant="default">
            <Link to={`/dashboard/buying/purchase-invoices/new?poId=${purchaseOrderId}`}>
              <FileText className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'إنشاء فاتورة' : 'Create Invoice'}
            </Link>
          </Button>
        )}

        {/* Common Actions for All States */}
        {status !== 'cancelled' && (
          <>
            <Button variant="outline">
              <Printer className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'طباعة' : 'Print'}
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 me-2" aria-hidden="true" />
              {isArabic ? 'إرسال للمورد' : 'Email to Supplier'}
            </Button>
          </>
        )}
      </div>
    )
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
  if (isError || !purchaseOrder) {
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
              <Link to="/dashboard/buying/purchase-orders">
                <ArrowLeft className="h-4 w-4 me-2" />
                {isArabic ? 'العودة لأوامر الشراء' : 'Back to Purchase Orders'}
              </Link>
            </Button>
            <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
              <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-navy mb-2">
                {isArabic ? 'فشل تحميل أمر الشراء' : 'Failed to Load Purchase Order'}
              </h3>
              <p className="text-slate-500">
                {error?.message || (isArabic ? 'أمر الشراء غير موجود' : 'Purchase order not found')}
              </p>
            </Card>
          </div>
        </Main>
      </>
    )
  }

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
              <Link to="/dashboard/buying/purchase-orders">
                <ArrowLeft className="h-4 w-4 me-2" />
                {isArabic ? 'العودة لأوامر الشراء' : 'Back to Purchase Orders'}
              </Link>
            </Button>
            {renderActionButtons()}
          </div>

          {/* Purchase Order Header */}
          <ProductivityHero
            badge={isArabic ? 'أمر الشراء' : 'Purchase Order'}
            title={purchaseOrder.poNumber}
            type="buying"
            listMode={true}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm rounded-3xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-slate-100 px-6 pt-4">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                      {['overview', 'items', 'receipts', 'invoices', 'timeline'].map((tab) => (
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
                            : tab === 'items'
                              ? isArabic ? 'الأصناف' : 'Items'
                              : tab === 'receipts'
                                ? isArabic ? 'إيصالات الاستلام' : 'Receipts'
                                : tab === 'invoices'
                                  ? isArabic ? 'الفواتير' : 'Invoices'
                                  : isArabic ? 'الجدول الزمني' : 'Timeline'}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6 bg-slate-50/50">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      {/* Purchase Order Information */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'معلومات أمر الشراء' : 'Purchase Order Information'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'رقم الطلب' : 'PO Number'}
                              </p>
                              <p className="font-medium text-navy font-mono">{purchaseOrder.poNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'الحالة' : 'Status'}
                              </p>
                              {getStatusBadge(purchaseOrder.status)}
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'المورد' : 'Supplier'}
                              </p>
                              <Link
                                to={`/dashboard/buying/suppliers/${purchaseOrder.supplierId}`}
                                className="font-medium text-brand-blue hover:underline"
                              >
                                {purchaseOrder.supplierName || purchaseOrder.supplierId}
                              </Link>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'العملة' : 'Currency'}
                              </p>
                              <p className="font-medium text-navy">{purchaseOrder.currency}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Dates */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'التواريخ' : 'Dates'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'تاريخ الطلب' : 'Order Date'}
                              </p>
                              <p className="font-medium text-navy">{formatDate(purchaseOrder.orderDate)}</p>
                            </div>
                            {purchaseOrder.requiredDate && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'التاريخ المطلوب' : 'Required Date'}
                                </p>
                                <p className="font-medium text-navy">{formatDate(purchaseOrder.requiredDate)}</p>
                              </div>
                            )}
                            {purchaseOrder.expectedDeliveryDate && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'تاريخ التسليم المتوقع' : 'Expected Delivery Date'}
                                </p>
                                <p className="font-medium text-navy">{formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Totals */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'الإجماليات' : 'Totals'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">
                                {isArabic ? 'إجمالي الكمية' : 'Total Quantity'}
                              </span>
                              <span className="font-medium text-navy">{purchaseOrder.totalQty}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">
                                {isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}
                              </span>
                              <span className="font-medium text-navy">{formatCurrency(purchaseOrder.totalAmount)}</span>
                            </div>
                            {purchaseOrder.discountAmount && purchaseOrder.discountAmount > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">
                                  {isArabic ? 'الخصم' : 'Discount'}
                                </span>
                                <span className="font-medium text-red-600">
                                  -{formatCurrency(purchaseOrder.discountAmount)}
                                </span>
                              </div>
                            )}
                            {purchaseOrder.taxAmount && purchaseOrder.taxAmount > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">
                                  {isArabic ? 'الضريبة' : 'Tax'}
                                </span>
                                <span className="font-medium text-navy">
                                  {formatCurrency(purchaseOrder.taxAmount)}
                                </span>
                              </div>
                            )}
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-navy">
                                  {isArabic ? 'الإجمالي الكلي' : 'Grand Total'}
                                </span>
                                <span className="text-xl font-bold text-brand-blue">
                                  {formatCurrency(purchaseOrder.grandTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Progress */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'التقدم' : 'Progress'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-600">
                                  {isArabic ? 'نسبة الاستلام' : 'Received'}
                                </span>
                                <span className="text-sm font-medium text-navy">
                                  {purchaseOrder.percentReceived}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 transition-all"
                                  style={{ width: `${purchaseOrder.percentReceived}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-600">
                                  {isArabic ? 'نسبة الفوترة' : 'Billed'}
                                </span>
                                <span className="text-sm font-medium text-navy">
                                  {purchaseOrder.percentBilled}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all"
                                  style={{ width: `${purchaseOrder.percentBilled}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Terms and Conditions */}
                      {purchaseOrder.termsAndConditions && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                              {isArabic ? 'الشروط والأحكام' : 'Terms and Conditions'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-slate-600 whitespace-pre-wrap">
                              {purchaseOrder.termsAndConditions}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Remarks */}
                      {purchaseOrder.remarks && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'ملاحظات' : 'Remarks'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-slate-600 whitespace-pre-wrap">
                              {purchaseOrder.remarks}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Items Tab */}
                    <TabsContent value="items" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Package className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'الأصناف' : 'Items'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {purchaseOrder.items.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                              <p>
                                {isArabic
                                  ? 'لا توجد أصناف في هذا الطلب'
                                  : 'No items in this order'}
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {isArabic ? 'كود الصنف' : 'Item Code'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'اسم الصنف' : 'Item Name'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'الكمية' : 'Qty'}
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
                                    <TableHead className="text-center">
                                      {isArabic ? 'المستلم' : 'Received'}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {isArabic ? 'المفوتر' : 'Billed'}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {purchaseOrder.items.map((item, index) => (
                                    <TableRow key={item._id || index}>
                                      <TableCell className="font-medium font-mono">
                                        {item.itemCode || item.itemId}
                                      </TableCell>
                                      <TableCell>
                                        {item.itemName || item.description || '-'}
                                      </TableCell>
                                      <TableCell className="text-center">{item.qty}</TableCell>
                                      <TableCell>{item.uom}</TableCell>
                                      <TableCell className="text-end">
                                        {formatCurrency(item.rate)}
                                      </TableCell>
                                      <TableCell className="text-end font-medium">
                                        {formatCurrency(item.amount)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono">
                                          {item.receivedQty || 0}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono">
                                          {item.billedQty || 0}
                                        </Badge>
                                      </TableCell>
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
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Truck className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'إيصالات الاستلام' : 'Purchase Receipts'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {purchaseReceipts.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                              <p>
                                {isArabic
                                  ? 'لا توجد إيصالات استلام لهذا الطلب'
                                  : 'No purchase receipts for this order'}
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
                                      {isArabic ? 'التاريخ' : 'Date'}
                                    </TableHead>
                                    <TableHead className="text-end">
                                      {isArabic ? 'الإجمالي' : 'Total'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'الحالة' : 'Status'}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {purchaseReceipts.map((receipt: any) => (
                                    <TableRow key={receipt._id}>
                                      <TableCell className="font-medium">
                                        <Link
                                          to={`/dashboard/buying/purchase-receipts/${receipt._id}`}
                                          className="text-brand-blue hover:underline"
                                        >
                                          {receipt.receiptNumber}
                                        </Link>
                                      </TableCell>
                                      <TableCell>{formatDate(receipt.postingDate)}</TableCell>
                                      <TableCell className="text-end">
                                        {formatCurrency(receipt.grandTotal)}
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

                    {/* Invoices Tab */}
                    <TabsContent value="invoices" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'فواتير الشراء' : 'Purchase Invoices'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {purchaseInvoices.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                              <p>
                                {isArabic
                                  ? 'لا توجد فواتير شراء لهذا الطلب'
                                  : 'No purchase invoices for this order'}
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {isArabic ? 'رقم الفاتورة' : 'Invoice Number'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'التاريخ' : 'Date'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}
                                    </TableHead>
                                    <TableHead className="text-end">
                                      {isArabic ? 'الإجمالي' : 'Total'}
                                    </TableHead>
                                    <TableHead className="text-end">
                                      {isArabic ? 'المتبقي' : 'Outstanding'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'الحالة' : 'Status'}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {purchaseInvoices.map((invoice: any) => (
                                    <TableRow key={invoice._id}>
                                      <TableCell className="font-medium">
                                        <Link
                                          to={`/dashboard/buying/purchase-invoices/${invoice._id}`}
                                          className="text-brand-blue hover:underline"
                                        >
                                          {invoice.invoiceNumber}
                                        </Link>
                                      </TableCell>
                                      <TableCell>{formatDate(invoice.postingDate)}</TableCell>
                                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                      <TableCell className="text-end">
                                        {formatCurrency(invoice.grandTotal)}
                                      </TableCell>
                                      <TableCell className="text-end font-medium text-amber-600">
                                        {formatCurrency(invoice.outstandingAmount)}
                                      </TableCell>
                                      <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Clock className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'الجدول الزمني' : 'Timeline'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Created */}
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Hash className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                </div>
                                <div className="flex-1 w-px bg-slate-200 my-2" />
                              </div>
                              <div className="flex-1 pb-8">
                                <p className="font-medium text-navy mb-1">
                                  {isArabic ? 'تم الإنشاء' : 'Created'}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {formatDate(purchaseOrder.createdAt)}
                                </p>
                                {purchaseOrder.createdBy && (
                                  <p className="text-sm text-slate-500">
                                    {isArabic ? 'بواسطة:' : 'By:'} {purchaseOrder.createdBy}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Submitted */}
                            {(purchaseOrder.status === 'submitted' ||
                              purchaseOrder.status === 'approved' ||
                              purchaseOrder.status === 'received' ||
                              purchaseOrder.status === 'billed') && (
                              <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-blue-600" aria-hidden="true" />
                                  </div>
                                  <div className="flex-1 w-px bg-slate-200 my-2" />
                                </div>
                                <div className="flex-1 pb-8">
                                  <p className="font-medium text-navy mb-1">
                                    {isArabic ? 'تم الترحيل' : 'Submitted'}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {formatDate(purchaseOrder.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Approved */}
                            {(purchaseOrder.status === 'approved' ||
                              purchaseOrder.status === 'received' ||
                              purchaseOrder.status === 'billed') && (
                              <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-purple-600" aria-hidden="true" />
                                  </div>
                                  <div className="flex-1 w-px bg-slate-200 my-2" />
                                </div>
                                <div className="flex-1 pb-8">
                                  <p className="font-medium text-navy mb-1">
                                    {isArabic ? 'تم الاعتماد' : 'Approved'}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {formatDate(purchaseOrder.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Received */}
                            {(purchaseOrder.status === 'received' || purchaseOrder.status === 'billed') && (
                              <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                    <Truck className="h-5 w-5 text-teal-600" aria-hidden="true" />
                                  </div>
                                  <div className="flex-1 w-px bg-slate-200 my-2" />
                                </div>
                                <div className="flex-1 pb-8">
                                  <p className="font-medium text-navy mb-1">
                                    {isArabic ? 'تم الاستلام' : 'Received'}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {formatDate(purchaseOrder.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Billed */}
                            {purchaseOrder.status === 'billed' && (
                              <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Receipt className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-navy mb-1">
                                    {isArabic ? 'تم الفوترة' : 'Billed'}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {formatDate(purchaseOrder.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Cancelled */}
                            {purchaseOrder.status === 'cancelled' && (
                              <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-navy mb-1">
                                    {isArabic ? 'تم الإلغاء' : 'Cancelled'}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {formatDate(purchaseOrder.updatedAt)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <BuyingSidebar context="purchase-orders" />
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
                ? 'هل أنت متأكد من حذف أمر الشراء هذا؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this purchase order? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
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

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showActionDialog.open} onOpenChange={(open) => setShowActionDialog({ open, action: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {showActionDialog.action === 'submit' && (isArabic ? 'تأكيد الترحيل' : 'Confirm Submission')}
              {showActionDialog.action === 'approve' && (isArabic ? 'تأكيد الاعتماد' : 'Confirm Approval')}
              {showActionDialog.action === 'reject' && (isArabic ? 'تأكيد الرفض' : 'Confirm Rejection')}
              {showActionDialog.action === 'cancel' && (isArabic ? 'تأكيد الإلغاء' : 'Confirm Cancellation')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showActionDialog.action === 'submit' && (isArabic
                ? 'هل أنت متأكد من ترحيل أمر الشراء هذا؟'
                : 'Are you sure you want to submit this purchase order?')}
              {showActionDialog.action === 'approve' && (isArabic
                ? 'هل أنت متأكد من اعتماد أمر الشراء هذا؟'
                : 'Are you sure you want to approve this purchase order?')}
              {showActionDialog.action === 'reject' && (isArabic
                ? 'هل أنت متأكد من رفض أمر الشراء هذا؟'
                : 'Are you sure you want to reject this purchase order?')}
              {showActionDialog.action === 'cancel' && (isArabic
                ? 'هل أنت متأكد من إلغاء أمر الشراء هذا؟'
                : 'Are you sure you want to cancel this purchase order?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={
                submitMutation.isPending ||
                approveMutation.isPending ||
                cancelMutation.isPending
              }
              className={
                showActionDialog.action === 'reject' || showActionDialog.action === 'cancel'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {(submitMutation.isPending || approveMutation.isPending || cancelMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" aria-hidden="true" />
                  {isArabic ? 'جاري المعالجة...' : 'Processing...'}
                </>
              ) : (
                <>
                  {showActionDialog.action === 'submit' && (isArabic ? 'ترحيل' : 'Submit')}
                  {showActionDialog.action === 'approve' && (isArabic ? 'اعتماد' : 'Approve')}
                  {showActionDialog.action === 'reject' && (isArabic ? 'رفض' : 'Reject')}
                  {showActionDialog.action === 'cancel' && (isArabic ? 'إلغاء' : 'Cancel')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PurchaseOrderDetailsView
