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
import { useSupplier, useDeleteSupplier } from '@/hooks/use-buying'

// Other
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ROUTES } from '@/constants/routes'

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

  const topNav = [
    {
      title: t('buying.suppliers'),
      href: ROUTES.dashboard.buying.suppliers.list,
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
    deleteSupplierMutation.mutate(supplierId, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.buying.list })
      },
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: t('buying.statusActive'),
        className: 'bg-emerald-100 text-emerald-700'
      },
      inactive: {
        label: t('buying.statusInactive'),
        className: 'bg-gray-100 text-gray-700'
      },
      blocked: {
        label: t('buying.statusBlocked'),
        className: 'bg-red-100 text-red-700'
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getSupplierTypeLabel = (type: string) => {
    const types = {
      company: t('buying.company'),
      individual: t('buying.individual'),
    }
    return types[type as keyof typeof types] || type
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
              <Link to={ROUTES.dashboard.buying.suppliers.list}>
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('buying.navigation.backToSuppliers')}
              </Link>
            </Button>
            <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
              <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-navy mb-2">
                {t('buying.supplier.failedToLoad')}
              </h3>
              <p className="text-slate-500">
                {error?.message || t('buying.supplier.notFound')}
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
              <Link to={ROUTES.dashboard.buying.suppliers.list}>
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('buying.navigation.backToSuppliers')}
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to={ROUTES.dashboard.buying.suppliers.edit(supplierId)}>
                  <Edit className="h-4 w-4 me-2" aria-hidden="true" />
                  {t('buying.common.edit')}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 me-2" aria-hidden="true" />
                {t('buying.common.delete')}
              </Button>
            </div>
          </div>

          {/* Supplier Header */}
          <ProductivityHero
            badge={t('buying.supplier.supplier')}
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
                      {['overview', 'payments', 'documents'].map((tab) => (
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
                            ? t('buying.common.overview')
                            : tab === 'payments'
                              ? t('buying.common.payments')
                              : t('buying.common.documents')}
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
                            {t('buying.supplier.supplierInformation')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.supplier.name')}
                              </p>
                              <p className="font-medium text-navy">{supplier.name}</p>
                            </div>
                            {supplier.nameAr && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.supplier.arabicName')}
                                </p>
                                <p className="font-medium text-navy">{supplier.nameAr}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.supplier.type')}
                              </p>
                              <Badge variant="outline">
                                {getSupplierTypeLabel(supplier.supplierType)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.common.status')}
                              </p>
                              {getStatusBadge(supplier.status)}
                            </div>
                            {supplier.supplierGroup && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.supplier.group')}
                                </p>
                                <p className="font-medium text-navy">{supplier.supplierGroup}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.currency')}
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
                            {t('buying.contactInfo')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {supplier.email && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                  <Mail className="h-4 w-4" aria-hidden="true" />
                                  {t('buying.email')}
                                  <Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                                </p>
                                <p className="font-medium text-navy">{supplier.email}</p>
                              </div>
                            )}
                            {supplier.phone && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                  <Phone className="h-4 w-4" aria-hidden="true" />
                                  {t('buying.phone')}
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
                                  {t('buying.mobile')}
                                </p>
                                <p className="font-medium text-navy" dir="ltr">
                                  {supplier.mobile}
                                </p>
                              </div>
                            )}
                            {supplier.fax && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.supplier.fax')}
                                </p>
                                <p className="font-medium text-navy">{supplier.fax}</p>
                              </div>
                            )}
                            {supplier.website && (
                              <div className="col-span-2">
                                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                                  <Globe className="h-4 w-4" aria-hidden="true" />
                                  {t('buying.website')}
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
                              {t('buying.addressInfo')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {supplier.address && (
                                <div className="col-span-2">
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.address')}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.address}</p>
                                </div>
                              )}
                              {supplier.city && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.city')}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.city}</p>
                                </div>
                              )}
                              {supplier.region && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.region')}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.region}</p>
                                </div>
                              )}
                              {supplier.country && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.country')}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.country}</p>
                                </div>
                              )}
                              {supplier.postalCode && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.postalCode')}
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
                              {t('buying.supplier.taxAndRegistration')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {supplier.taxId && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.taxId')}
                                  </p>
                                  <p className="font-medium text-navy font-mono">
                                    {supplier.taxId}
                                  </p>
                                </div>
                              )}
                              {supplier.crNumber && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.supplier.crNumber')}
                                  </p>
                                  <p className="font-medium text-navy font-mono">
                                    {supplier.crNumber}
                                  </p>
                                </div>
                              )}
                              {supplier.vatNumber && (
                                <div className="col-span-2">
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.supplier.vatNumber')}
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
                              {t('buying.supplier.bankingDetails')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {supplier.bankName && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.bankName')}
                                  </p>
                                  <p className="font-medium text-navy">{supplier.bankName}</p>
                                </div>
                              )}
                              {supplier.bankAccountNo && (
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">
                                    {t('buying.supplier.accountNumber')}
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
                                    {t('buying.iban')}
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
                              {t('buying.paymentTerms')}
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
                              {t('buying.notes')}
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

                    {/* Payments Tab */}
                    <TabsContent value="payments" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {t('buying.common.payments')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-center py-12 text-slate-500">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                            <p>
                              {t('buying.common.noPayments')}
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
                            {t('buying.common.documents')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-center py-12 text-slate-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                            <p>
                              {t('buying.common.noDocuments')}
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
              {t('buying.dialogs.confirmDeletion')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this supplier? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('buying.common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSupplierMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSupplierMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" aria-hidden="true" />
                  {t('buying.common.deleting')}
                </>
              ) : (
                t('buying.common.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SupplierDetailsView
