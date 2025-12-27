/**
 * Material Request Details View
 * Comprehensive view for material request information, items, and linked documents
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
  Package,
  Calendar,
  FileText,
  Send,
  X,
  ShoppingCart,
  TruckIcon,
  CheckCircle,
  Clock,
  XCircle,
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
import { useMaterialRequest } from '@/hooks/use-buying'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'

// Other
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ROUTES } from '@/constants/routes'

export function MaterialRequestDetailsView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { materialRequestId } = useParams({ strict: false }) as { materialRequestId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Fetch material request data
  const { data: materialRequest, isLoading, isError, error } = useMaterialRequest(materialRequestId)

  const topNav = [
    {
      title: t('buying.common.overview'),
      href: ROUTES.dashboard.buying.overview,
      isActive: false,
    },
    {
      title: t('buying.suppliers'),
      href: ROUTES.dashboard.buying.suppliers.list,
      isActive: false,
    },
    {
      title: t('buying.purchaseOrder.purchaseOrders'),
      href: ROUTES.dashboard.buying.purchaseOrders.list,
      isActive: false,
    },
    {
      title: t('buying.materialRequest.materialRequests'),
      href: ROUTES.dashboard.buying.materialRequests.list,
      isActive: true,
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: t('buying.mrStatus.draft'),
        className: 'bg-gray-100 text-gray-700',
        icon: FileText,
      },
      submitted: {
        label: t('buying.mrStatus.submitted'),
        className: 'bg-blue-100 text-blue-700',
        icon: Send,
      },
      ordered: {
        label: t('buying.mrStatus.ordered'),
        className: 'bg-purple-100 text-purple-700',
        icon: ShoppingCart,
      },
      transferred: {
        label: t('buying.mrStatus.transferred'),
        className: 'bg-teal-100 text-teal-700',
        icon: TruckIcon,
      },
      issued: {
        label: t('buying.mrStatus.issued'),
        className: 'bg-emerald-100 text-emerald-700',
        icon: CheckCircle,
      },
      cancelled: {
        label: t('buying.mrStatus.cancelled'),
        className: 'bg-red-100 text-red-700',
        icon: XCircle,
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 me-1" />
        {config.label}
      </Badge>
    )
  }

  const getRequestTypeLabel = (type: string) => {
    const types = {
      purchase: t('buying.requestTypes.purchase'),
      transfer: t('buying.requestTypes.transfer'),
      material_issue: t('buying.requestTypes.materialIssue'),
      manufacture: t('buying.requestTypes.manufacture'),
    }
    return types[type as keyof typeof types] || type
  }

  const getItemStatusBadge = (item: any) => {
    const orderedQty = item.orderedQty || 0
    const receivedQty = item.receivedQty || 0
    const qty = item.qty || 0

    if (receivedQty >= qty) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700">
          <CheckCircle className="h-3 w-3 me-1" />
          {t('buying.purchaseOrder.received')}
        </Badge>
      )
    } else if (orderedQty >= qty) {
      return (
        <Badge className="bg-purple-100 text-purple-700">
          <ShoppingCart className="h-3 w-3 me-1" />
          {t('buying.mrStatus.ordered')}
        </Badge>
      )
    } else if (orderedQty > 0) {
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <Clock className="h-3 w-3 me-1" />
          {t('buying.itemStatus.partial')}
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-700">
          <Clock className="h-3 w-3 me-1" />
          {t('buying.itemStatus.pending')}
        </Badge>
      )
    }
  }

  const handleDelete = () => {
    // This will call the delete mutation when implemented
    toast.success(t('buying.toast.materialRequestDeleted'))
    navigate({ to: ROUTES.dashboard.buying.materialRequests.list })
  }

  const handleSubmit = () => {
    // This will call the submit mutation when implemented
    toast.success(t('buying.toast.materialRequestSubmitted'))
    invalidateCache.buying.materialRequests()
  }

  const handleCancel = () => {
    // This will call the cancel mutation when implemented
    toast.success(t('buying.toast.materialRequestCancelled'))
    invalidateCache.buying.materialRequests()
    setShowCancelDialog(false)
  }

  const handleCreatePO = () => {
    // Navigate to create purchase order with material request context
    navigate({
      to: ROUTES.dashboard.buying.purchaseOrders.create,
      search: { materialRequestId },
    })
  }

  const handleCreateTransfer = () => {
    // Navigate to create stock entry for transfer
    toast.info(t('buying.toast.stockEntryRedirect'))
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
  if (isError || !materialRequest) {
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
              <Link to={ROUTES.dashboard.buying.materialRequests.list}>
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('buying.navigation.backToMaterialRequests')}
              </Link>
            </Button>
            <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
              <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-navy mb-2">
                {t('buying.materialRequest.failedToLoad')}
              </h3>
              <p className="text-slate-500">
                {error?.message || t('buying.materialRequest.notFound')}
              </p>
            </Card>
          </div>
        </Main>
      </>
    )
  }

  const isDraft = materialRequest.status === 'draft'
  const isSubmitted = materialRequest.status === 'submitted'
  const isCancelled = materialRequest.status === 'cancelled'
  const isPurchaseType = materialRequest.requestType === 'purchase'
  const isTransferType = materialRequest.requestType === 'transfer'

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
              <Link to={ROUTES.dashboard.buying.materialRequests.list}>
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('buying.navigation.backToMaterialRequests')}
              </Link>
            </Button>
            <div className="flex gap-2 flex-wrap">
              {isDraft && (
                <>
                  <Button onClick={handleSubmit} className="bg-brand-blue hover:bg-brand-blue/90">
                    <Send className="h-4 w-4 me-2" aria-hidden="true" />
                    {t('buying.common.submit')}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/dashboard/buying/material-requests/${materialRequestId}/edit`}>
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
                </>
              )}
              {isSubmitted && (
                <>
                  {isPurchaseType && (
                    <Button onClick={handleCreatePO} className="bg-brand-blue hover:bg-brand-blue/90">
                      <ShoppingCart className="h-4 w-4 me-2" aria-hidden="true" />
                      {t('buying.materialRequest.createPurchaseOrder')}
                    </Button>
                  )}
                  {isTransferType && (
                    <Button onClick={handleCreateTransfer} className="bg-teal-600 hover:bg-teal-700">
                      <TruckIcon className="h-4 w-4 me-2" aria-hidden="true" />
                      {t('buying.materialRequest.createTransfer')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <X className="h-4 w-4 me-2" aria-hidden="true" />
                    {t('buying.common.cancel')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Material Request Header */}
          <ProductivityHero
            badge={t('buying.materialRequest.materialRequest')}
            title={materialRequest.mrNumber}
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
                      {['overview', 'items', 'linked-documents'].map((tab) => (
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
                            ? isArabic
                              ? 'نظرة عامة'
                              : 'Overview'
                            : tab === 'items'
                              ? isArabic
                                ? 'الأصناف'
                                : 'Items'
                              : isArabic
                                ? 'المستندات المرتبطة'
                                : 'Linked Documents'}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6 bg-slate-50/50">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      {/* Request Information */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Package className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {t('buying.materialRequest.requestInformation')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.materialRequest.requestNumber')}
                              </p>
                              <p className="font-medium text-navy font-mono">
                                {materialRequest.mrNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.common.status')}
                              </p>
                              {getStatusBadge(materialRequest.status)}
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.materialRequest.requestType')}
                              </p>
                              <Badge variant="outline" className="font-medium">
                                {getRequestTypeLabel(materialRequest.requestType)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.materialRequest.transactionDate')}
                              </p>
                              <p className="font-medium text-navy flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {formatDate(materialRequest.transactionDate)}
                              </p>
                            </div>
                            {materialRequest.requiredDate && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.purchaseOrder.requiredDate')}
                                </p>
                                <p className="font-medium text-navy flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-slate-400" />
                                  {formatDate(materialRequest.requiredDate)}
                                </p>
                              </div>
                            )}
                            {materialRequest.requestedBy && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.materialRequest.requestedBy')}
                                </p>
                                <p className="font-medium text-navy">{materialRequest.requestedBy}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.purchaseOrder.totalQuantity')}
                              </p>
                              <p className="font-medium text-navy text-lg">
                                {materialRequest.totalQty || 0}
                              </p>
                            </div>
                            {materialRequest.purpose && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.materialRequest.purpose')}
                                </p>
                                <p className="font-medium text-navy">{materialRequest.purpose}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Remarks */}
                      {materialRequest.remarks && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-navy">
                              {t('buying.purchaseOrder.remarks')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <p className="text-slate-600 whitespace-pre-wrap">
                              {materialRequest.remarks}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Metadata */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy">
                            {t('buying.materialRequest.additionalInformation')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {materialRequest.company && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.company')}
                                </p>
                                <p className="font-medium text-navy">{materialRequest.company}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.materialRequest.createdAt')}
                              </p>
                              <p className="font-medium text-navy">
                                {formatDate(materialRequest.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500 mb-1">
                                {t('buying.materialRequest.lastUpdated')}
                              </p>
                              <p className="font-medium text-navy">
                                {formatDate(materialRequest.updatedAt)}
                              </p>
                            </div>
                            {materialRequest.createdBy && (
                              <div>
                                <p className="text-sm text-slate-500 mb-1">
                                  {t('buying.materialRequest.createdBy')}
                                </p>
                                <p className="font-medium text-navy">{materialRequest.createdBy}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Items Tab */}
                    <TabsContent value="items" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Package className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {t('buying.materialRequest.requestedItems')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {materialRequest.items.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                              <Package
                                className="h-12 w-12 mx-auto mb-4 opacity-20"
                                aria-hidden="true"
                              />
                              <p>{t('buying.materialRequest.noItems')}</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>{t('buying.materialRequest.item')}</TableHead>
                                    <TableHead className="text-center">
                                      {t('buying.materialRequest.requiredQty')}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {t('buying.materialRequest.orderedQty')}
                                    </TableHead>
                                    <TableHead className="text-center">
                                      {t('buying.materialRequest.receivedQty')}
                                    </TableHead>
                                    <TableHead>{t('buying.purchaseOrder.uom')}</TableHead>
                                    <TableHead>{t('buying.materialRequest.warehouse')}</TableHead>
                                    <TableHead>{t('buying.purchaseOrder.requiredDate')}</TableHead>
                                    <TableHead>{t('buying.common.status')}</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {materialRequest.items.map((item: any, index: number) => (
                                    <TableRow key={item._id || index}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium text-navy">
                                            {item.itemName || item.itemCode || item.itemId}
                                          </p>
                                          {item.itemCode && item.itemName && (
                                            <p className="text-xs text-slate-500">{item.itemCode}</p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center font-medium">
                                        {item.qty}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {item.orderedQty || 0}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {item.receivedQty || 0}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{item.uom}</Badge>
                                      </TableCell>
                                      <TableCell>
                                        {item.warehouse || (
                                          <span className="text-slate-400">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {item.requiredDate ? (
                                          formatDate(item.requiredDate)
                                        ) : (
                                          <span className="text-slate-400">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell>{getItemStatusBadge(item)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Linked Documents Tab */}
                    <TabsContent value="linked-documents" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100">
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                            {t('buying.materialRequest.linkedDocuments')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Purchase Orders Section */}
                            <div>
                              <h4 className="font-semibold text-navy mb-3 flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-brand-blue" />
                                {t('buying.purchaseOrder.purchaseOrders')}
                              </h4>
                              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                <ShoppingCart
                                  className="h-10 w-10 mx-auto mb-3 opacity-20"
                                  aria-hidden="true"
                                />
                                <p className="text-sm">
                                  {t('buying.materialRequest.noPurchaseOrders')}
                                </p>
                              </div>
                            </div>

                            {/* Stock Entries Section */}
                            <div>
                              <h4 className="font-semibold text-navy mb-3 flex items-center gap-2">
                                <TruckIcon className="h-4 w-4 text-teal-600" />
                                {t('buying.materialRequest.stockEntries')}
                              </h4>
                              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                <TruckIcon
                                  className="h-10 w-10 mx-auto mb-3 opacity-20"
                                  aria-hidden="true"
                                />
                                <p className="text-sm">
                                  {t('buying.materialRequest.noStockEntries')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <BuyingSidebar />
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
                ? 'هل أنت متأكد من حذف طلب المواد هذا؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this material request? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('buying.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('buying.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('buying.dialogs.confirmCancellation')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد من إلغاء طلب المواد هذا؟'
                : 'Are you sure you want to cancel this material request?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('buying.dialogs.goBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              {t('buying.dialogs.cancelRequest')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MaterialRequestDetailsView
