/**
 * Supplier Details View
 * Comprehensive view for supplier information, purchase orders, payments, and documents
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
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Hash,
  Globe,
  FileText,
  DollarSign,
  Package,
  Receipt,
  Calendar,
  Lock,
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
import { useSupplier, useDeleteSupplier, usePurchaseOrders } from '@/hooks/use-buying'

// Other
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function SupplierDetailsView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { supplierId } = useParams({ strict: false }) as { supplierId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch supplier data
  const { data: supplier, isLoading, isError, error } = useSupplier(supplierId)
  const deleteSupplierMutation = useDeleteSupplier()

  // Fetch purchase orders for this supplier
  const { data: purchaseOrdersData } = usePurchaseOrders({ supplierId, limit: 10 })
  const purchaseOrders = purchaseOrdersData?.data || []

  const topNav = [
    {
      title: isArabic ? 'نظرة عامة' : 'Overview',
      href: '/dashboard/buying/overview',
      isActive: false
    },
    {
      title: isArabic ? 'الموردين' : 'Suppliers',
      href: '/dashboard/buying/suppliers',
      isActive: true
    },
    {
      title: isArabic ? 'أوامر الشراء' : 'Purchase Orders',
      href: '/dashboard/buying/purchase-orders',
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
    deleteSupplierMutation.mutate(supplierId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/buying' })
      },
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: isArabic ? 'نشط' : 'Active',
        className: 'bg-emerald-100 text-emerald-700'
      },
      inactive: {
        label: isArabic ? 'غير نشط' : 'Inactive',
        className: 'bg-gray-100 text-gray-700'
      },
      blocked: {
        label: isArabic ? 'محظور' : 'Blocked',
        className: 'bg-red-100 text-red-700'
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getSupplierTypeLabel = (type: string) => {
    const types = {
      company: isArabic ? 'شركة' : 'Company',
      individual: isArabic ? 'فرد' : 'Individual',
    }
    return types[type as keyof typeof types] || type
  }

  const getPOStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: isArabic ? 'مسودة' : 'Draft', className: 'bg-gray-100 text-gray-700' },
      submitted: { label: isArabic ? 'مقدم' : 'Submitted', className: 'bg-blue-100 text-blue-700' },
      approved: { label: isArabic ? 'معتمد' : 'Approved', className: 'bg-purple-100 text-purple-700' },
      received: { label: isArabic ? 'مستلم' : 'Received', className: 'bg-teal-100 text-teal-700' },
      billed: { label: isArabic ? 'مفوتر' : 'Billed', className: 'bg-emerald-100 text-emerald-700' },
      cancelled: { label: isArabic ? 'ملغى' : 'Cancelled', className: 'bg-red-100 text-red-700' },
      closed: { label: isArabic ? 'مغلق' : 'Closed', className: 'bg-slate-100 text-slate-700' },
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
  if (isError || !supplier) {
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
              <Link to="/dashboard/buying/suppliers">
                <ArrowLeft className="h-4 w-4 me-2" />
                {isArabic ? 'العودة للموردين' : 'Back to Suppliers'}
              </Link>
            </Button>
            <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
              <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-navy mb-2">
                {isArabic ? 'فشل تحميل المورد' : 'Failed to Load Supplier'}
              </h3>
              <p className="text-slate-500">
                {error?.message || (isArabic ? 'المورد غير موجود' : 'Supplier not found')}
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
              <Link to="/dashboard/buying/suppliers">
                <ArrowLeft className="h-4 w-4 me-2" />
                {isArabic ? 'العودة للموردين' : 'Back to Suppliers'}
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to={`/dashboard/buying/suppliers/${supplierId}/edit`}>
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
            </div>
          </div>

          {/* Supplier Header */}
          <ProductivityHero
            badge={isArabic ? 'المورد' : 'Supplier'}
            title={isArabic && supplier.nameAr ? supplier.nameAr : supplier.name}
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
                      {['overview', 'purchase-orders', 'payments', 'documents'].map((tab) => (
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
                            : tab === 'purchase-orders'
                              ? isArabic ? 'أوامر الشراء' : 'Purchase Orders'
                              : tab === 'payments'
                                ? isArabic ? 'المدفوعات' : 'Payments'
                                : isArabic ? 'المستندات' : 'Documents'}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6 bg-slate-50/50">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      {/* Supplier Information */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'معلومات المورد' : 'Supplier Information'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'الاسم' : 'Name'}
                              </p>
                              <p className="font-medium text-navy">{supplier.name}</p>
                            </div>
                            {supplier.nameAr && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'الاسم بالعربية' : 'Arabic Name'}
                                </p>
                                <p className="font-medium text-navy">{supplier.nameAr}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'النوع' : 'Type'}
                              </p>
                              <Badge variant="outline">
                                {getSupplierTypeLabel(supplier.supplierType)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'الحالة' : 'Status'}
                              </p>
                              {getStatusBadge(supplier.status)}
                            </div>
                            {supplier.supplierGroup && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'المجموعة' : 'Group'}
                                </p>
                                <p className="font-medium text-navy">{supplier.supplierGroup}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {isArabic ? 'العملة' : 'Currency'}
                              </p>
                              <p className="font-medium text-navy">{supplier.currency}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contact Information */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Phone className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {supplier.email && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                  <Mail className="h-4 w-4" aria-hidden="true" />
                                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                                  <Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                </p>
                                <p className="font-medium text-navy">{supplier.email}</p>
                              </div>
                            )}
                            {supplier.phone && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                  <Phone className="h-4 w-4" aria-hidden="true" />
                                  {isArabic ? 'الهاتف' : 'Phone'}
                                  <Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                </p>
                                <p className="font-medium text-navy" dir="ltr">
                                  {supplier.phone}
                                </p>
                              </div>
                            )}
                            {supplier.mobile && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'الجوال' : 'Mobile'}
                                </p>
                                <p className="font-medium text-navy" dir="ltr">
                                  {supplier.mobile}
                                </p>
                              </div>
                            )}
                            {supplier.fax && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {isArabic ? 'الفاكس' : 'Fax'}
                                </p>
                                <p className="font-medium text-navy">{supplier.fax}</p>
                              </div>
                            )}
                            {supplier.website && (
                              <div className="col-span-2">
                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                  <Globe className="h-4 w-4" aria-hidden="true" />
                                  {isArabic ? 'الموقع الإلكتروني' : 'Website'}
                                </p>
                                <a
                                  href={supplier.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-brand-blue hover:underline"
                                >
                                  {supplier.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Address Information */}
                      {(supplier.address || supplier.city || supplier.country) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                              {isArabic ? 'معلومات العنوان' : 'Address Information'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {supplier.address && (
                                <div className="col-span-2">
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'العنوان' : 'Address'}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.address}</p>
                                </div>
                              )}
                              {supplier.city && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'المدينة' : 'City'}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.city}</p>
                                </div>
                              )}
                              {supplier.region && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'المنطقة' : 'Region'}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.region}</p>
                                </div>
                              )}
                              {supplier.country && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'الدولة' : 'Country'}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.country}</p>
                                </div>
                              )}
                              {supplier.postalCode && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'الرمز البريدي' : 'Postal Code'}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.postalCode}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Tax & Registration */}
                      {(supplier.taxId || supplier.crNumber || supplier.vatNumber) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Hash className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                              {isArabic ? 'الضرائب والتسجيل' : 'Tax & Registration'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {supplier.taxId && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'الرقم الضريبي' : 'Tax ID'}
                                  </p>
                                  <p className="font-medium text-navy font-mono">
                                    {supplier.taxId}
                                  </p>
                                </div>
                              )}
                              {supplier.crNumber && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'السجل التجاري' : 'CR Number'}
                                  </p>
                                  <p className="font-medium text-navy font-mono">
                                    {supplier.crNumber}
                                  </p>
                                </div>
                              )}
                              {supplier.vatNumber && (
                                <div className="col-span-2">
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'الرقم الضريبي (VAT)' : 'VAT Number'}
                                  </p>
                                  <p className="font-medium text-navy font-mono">
                                    {supplier.vatNumber}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Banking Details */}
                      {(supplier.bankName || supplier.bankAccountNo || supplier.iban) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                              {isArabic ? 'المعلومات البنكية' : 'Banking Details'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {supplier.bankName && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'اسم البنك' : 'Bank Name'}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.bankName}</p>
                                </div>
                              )}
                              {supplier.bankAccountNo && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'رقم الحساب' : 'Account Number'}
                                    <Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                  </p>
                                  <p className="font-medium text-navy font-mono">
                                    {supplier.bankAccountNo}
                                  </p>
                                </div>
                              )}
                              {supplier.iban && (
                                <div className="col-span-2">
                                  <p className="text-sm text-slate-500 mb-1">
                                    {isArabic ? 'رقم الآيبان (IBAN)' : 'IBAN'}
                                    <Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                  </p>
                                  <p className="font-medium text-navy font-mono">
                                    {supplier.iban}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Payment Terms */}
                      {supplier.paymentTerms && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-brand-blue" />
                              {isArabic ? 'شروط الدفع' : 'Payment Terms'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-slate-600">{supplier.paymentTerms}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Notes */}
                      {supplier.notes && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'ملاحظات' : 'Notes'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-slate-600 whitespace-pre-wrap">
                              {supplier.notes}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    {/* Purchase Orders Tab */}
                    <TabsContent value="purchase-orders" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Package className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'أوامر الشراء' : 'Purchase Orders'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {purchaseOrders.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                              <p>
                                {isArabic
                                  ? 'لا توجد أوامر شراء لهذا المورد'
                                  : 'No purchase orders for this supplier'}
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {isArabic ? 'رقم الطلب' : 'PO Number'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'التاريخ' : 'Date'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'الإجمالي' : 'Total'}
                                    </TableHead>
                                    <TableHead>
                                      {isArabic ? 'الحالة' : 'Status'}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {purchaseOrders.map((po: any) => (
                                    <TableRow key={po._id}>
                                      <TableCell className="font-medium">
                                        <Link
                                          to={`/dashboard/buying/purchase-orders/${po._id}`}
                                          className="text-brand-blue hover:underline"
                                        >
                                          {po.poNumber}
                                        </Link>
                                      </TableCell>
                                      <TableCell>{formatDate(po.orderDate)}</TableCell>
                                      <TableCell>{formatCurrency(po.grandTotal)}</TableCell>
                                      <TableCell>{getPOStatusBadge(po.status)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'المدفوعات' : 'Payments'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-center py-12 text-slate-500">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                            <p>
                              {isArabic
                                ? 'لا توجد مدفوعات مسجلة'
                                : 'No payments recorded'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {isArabic ? 'المستندات' : 'Documents'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-center py-12 text-slate-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                            <p>
                              {isArabic
                                ? 'لا توجد مستندات مرفقة'
                                : 'No documents attached'}
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
            <BuyingSidebar context="suppliers" />
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
                ? 'هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this supplier? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSupplierMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSupplierMutation.isPending ? (
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
    </>
  )
}

export default SupplierDetailsView
