/**
 * Asset Details View
 * Detailed view for a single asset with depreciation, maintenance, and movement tracking
 */

import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Edit,
  Trash2,
  ArrowRight,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  User,
  FileText,
  TrendingDown,
  Wrench,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  QrCode,
  Download,
  Send,
  BarChart3,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import {
  useAsset,
  useDepreciationSchedule,
  useMaintenanceSchedules,
  useAssetMovements,
  useDeleteAsset,
  useScrapAsset,
} from '@/hooks/use-assets'
import type { AssetStatus, DepreciationMethod, MaintenanceStatus } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.assets', href: '/dashboard/assets' },
]

export function AssetDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { assetId } = useParams({ from: '/_authenticated/dashboard/assets/$assetId' })

  const [activeTab, setActiveTab] = useState('overview')

  const { data: asset, isLoading, error } = useAsset(assetId)
  const { data: depreciationData } = useDepreciationSchedule(assetId)
  const { data: maintenanceData } = useMaintenanceSchedules({ assetId })
  const { data: movementData } = useAssetMovements({ assetId })
  const deleteAssetMutation = useDeleteAsset()
  const scrapAssetMutation = useScrapAsset()

  const handleDelete = async () => {
    await deleteAssetMutation.mutateAsync(assetId)
    navigate({ to: '/dashboard/assets' })
  }

  const handleScrap = async () => {
    await scrapAssetMutation.mutateAsync(assetId)
  }

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <Badge variant="default" className="bg-blue-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('assets.status.submitted', 'مقدم')}
          </Badge>
        )
      case 'partially_depreciated':
        return (
          <Badge variant="default" className="bg-amber-500">
            <TrendingDown className="w-3 h-3 ml-1" />
            {t('assets.status.partiallyDepreciated', 'مهلك جزئياً')}
          </Badge>
        )
      case 'fully_depreciated':
        return (
          <Badge variant="secondary">
            <TrendingDown className="w-3 h-3 ml-1" />
            {t('assets.status.fullyDepreciated', 'مهلك بالكامل')}
          </Badge>
        )
      case 'sold':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <DollarSign className="w-3 h-3 ml-1" />
            {t('assets.status.sold', 'مباع')}
          </Badge>
        )
      case 'scrapped':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('assets.status.scrapped', 'متلف')}
          </Badge>
        )
      case 'in_maintenance':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            <Wrench className="w-3 h-3 ml-1" />
            {t('assets.status.inMaintenance', 'قيد الصيانة')}
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="outline">
            <FileText className="w-3 h-3 ml-1" />
            {t('assets.status.draft', 'مسودة')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDepreciationMethodLabel = (method: DepreciationMethod) => {
    switch (method) {
      case 'straight_line':
        return t('assets.depreciation.straightLine', 'قسط ثابت')
      case 'double_declining_balance':
        return t('assets.depreciation.doubleDeclining', 'رصيد متناقص مضاعف')
      case 'written_down_value':
        return t('assets.depreciation.writtenDown', 'القيمة المكتوبة')
      default:
        return method
    }
  }

  const getMaintenanceStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'planned':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <Clock className="w-3 h-3 ml-1" />
            {t('assets.maintenance.planned', 'مجدولة')}
          </Badge>
        )
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 ml-1" />
            {t('assets.maintenance.overdue', 'متأخرة')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('assets.maintenance.completed', 'مكتملة')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 ml-1" />
            {t('assets.maintenance.cancelled', 'ملغاة')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return t('common.notSet', 'غير محدد')
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(date))
  }

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(date)
    )
  }

  // Calculate depreciation progress
  const depreciationProgress =
    asset && asset.grossPurchaseAmount > 0
      ? ((asset.accumulatedDepreciation || 0) / asset.grossPurchaseAmount) * 100
      : 0

  if (isLoading) {
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
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  if (error || !asset) {
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
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('assets.assetNotFound', 'الأصل غير موجود')}
              </h3>
              <Button
                onClick={() => navigate({ to: '/dashboard/assets' })}
                className="rounded-xl"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                {t('assets.backToList', 'العودة للقائمة')}
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
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
          badge={t('assets.badge', 'إدارة الأصول')}
          title={asset.assetNameAr || asset.assetName}
          type="assets"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Asset Image */}
                  <div className="flex-shrink-0">
                    {asset.image ? (
                      <img
                        src={asset.image}
                        alt={asset.assetName}
                        className="w-32 h-32 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-muted flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">
                        {asset.assetNumber}
                      </span>
                      {getStatusBadge(asset.status)}
                    </div>
                    <h1 className="text-2xl font-bold">{asset.assetNameAr || asset.assetName}</h1>
                    {asset.assetNameAr && asset.assetName && (
                      <p className="text-muted-foreground">{asset.assetName}</p>
                    )}
                    {asset.description && (
                      <p className="text-sm text-muted-foreground">{asset.description}</p>
                    )}
                    <div className="flex items-center gap-4 pt-2 flex-wrap">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {t('assets.purchaseValue', 'قيمة الشراء')}
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(asset.grossPurchaseAmount, asset.currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {t('assets.currentValue', 'القيمة الحالية')}
                        </div>
                        <div className="text-xl font-bold text-emerald-600">
                          {formatCurrency(
                            asset.valueAfterDepreciation || asset.grossPurchaseAmount,
                            asset.currency
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate({ to: `/dashboard/assets/${assetId}/edit` })}
                      className="rounded-xl"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      {t('common.edit', 'تعديل')}
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      <ArrowRightLeft className="w-4 h-4 ml-2" />
                      {t('assets.transfer', 'نقل')}
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      <Wrench className="w-4 h-4 ml-2" />
                      {t('assets.sendMaintenance', 'إرسال للصيانة')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl text-orange-600">
                          <AlertTriangle className="w-4 h-4 ml-2" />
                          {t('assets.scrap', 'إتلاف')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('assets.scrapConfirmTitle', 'إتلاف الأصل')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              'assets.scrapConfirmDesc',
                              'هل أنت متأكد من إتلاف هذا الأصل؟ لا يمكن التراجع عن هذا الإجراء.'
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleScrap}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            {t('assets.scrap', 'إتلاف')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="rounded-xl">
                          <Trash2 className="w-4 h-4 ml-2" />
                          {t('common.delete', 'حذف')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('assets.deleteConfirmTitle', 'حذف الأصل')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              'assets.deleteConfirmDesc',
                              'هل أنت متأكد من حذف هذا الأصل؟ لا يمكن التراجع عن هذا الإجراء.'
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg font-bold">{formatDate(asset.purchaseDate)}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.purchaseDate', 'تاريخ الشراء')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-lg font-bold truncate" title={asset.location}>
                    {asset.location || t('common.notSet', 'غير محدد')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.location', 'الموقع')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <User className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <div className="text-lg font-bold truncate" title={asset.custodianName}>
                    {asset.custodianName || t('common.notSet', 'غير محدد')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.custodian', 'الحارس')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Package className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                  <div className="text-lg font-bold">{asset.assetQuantity || 1}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('assets.quantity', 'الكمية')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-5 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                      <FileText className="w-4 h-4 ml-2" />
                      {t('assets.overview', 'نظرة عامة')}
                    </TabsTrigger>
                    <TabsTrigger value="depreciation" className="rounded-lg">
                      <TrendingDown className="w-4 h-4 ml-2" />
                      {t('assets.depreciation', 'الإهلاك')}
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="rounded-lg">
                      <Wrench className="w-4 h-4 ml-2" />
                      {t('assets.maintenance.title', 'الصيانة')}
                    </TabsTrigger>
                    <TabsTrigger value="movements" className="rounded-lg">
                      <ArrowRightLeft className="w-4 h-4 ml-2" />
                      {t('assets.movements', 'الحركات')}
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg">
                      <Download className="w-4 h-4 ml-2" />
                      {t('assets.documents', 'المستندات')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Asset Details */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">
                          {t('assets.assetDetails', 'تفاصيل الأصل')}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.assetNumber', 'رقم الأصل')}
                            </span>
                            <span className="font-mono">{asset.assetNumber}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.category', 'الفئة')}
                            </span>
                            <span>{asset.assetCategory || t('common.notSet', 'غير محدد')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.department', 'القسم')}
                            </span>
                            <span>{asset.department || t('common.notSet', 'غير محدد')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.serialNo', 'الرقم التسلسلي')}
                            </span>
                            <span className="font-mono">
                              {asset.serialNo || t('common.notSet', 'غير محدد')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Purchase Details */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">
                          {t('assets.purchaseDetails', 'تفاصيل الشراء')}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.supplier', 'المورد')}
                            </span>
                            <span>{asset.supplierName || t('common.notSet', 'غير محدد')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.purchaseDate', 'تاريخ الشراء')}
                            </span>
                            <span>{formatDate(asset.purchaseDate)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.grossAmount', 'المبلغ الإجمالي')}
                            </span>
                            <span className="font-mono">
                              {formatCurrency(asset.grossPurchaseAmount, asset.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.warrantyExpiry', 'انتهاء الضمان')}
                            </span>
                            <span>{formatDate(asset.warrantyExpiryDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Depreciation Info */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">
                          {t('assets.depreciationInfo', 'معلومات الإهلاك')}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.depreciationMethod', 'طريقة الإهلاك')}
                            </span>
                            <span>{getDepreciationMethodLabel(asset.depreciationMethod)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.depreciationStart', 'بداية الإهلاك')}
                            </span>
                            <span>{formatDate(asset.depreciationStartDate)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.totalDepreciations', 'عدد الإهلاكات')}
                            </span>
                            <span>{asset.totalNumberOfDepreciations || 0}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('assets.frequency', 'التكرار (شهور)')}
                            </span>
                            <span>{asset.frequencyOfDepreciation || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Insurance Details */}
                      {asset.insuranceDetails && (
                        <div className="space-y-4">
                          <h3 className="font-medium text-lg">
                            {t('assets.insuranceDetails', 'تفاصيل التأمين')}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                {t('assets.insurer', 'شركة التأمين')}
                              </span>
                              <span>
                                {asset.insuranceDetails.insurer || t('common.notSet', 'غير محدد')}
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                {t('assets.policyNo', 'رقم البوليصة')}
                              </span>
                              <span className="font-mono">
                                {asset.insuranceDetails.policyNo || t('common.notSet', 'غير محدد')}
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                {t('assets.insuredValue', 'القيمة المؤمنة')}
                              </span>
                              <span className="font-mono">
                                {asset.insuranceDetails.insuredValue
                                  ? formatCurrency(asset.insuranceDetails.insuredValue, asset.currency)
                                  : t('common.notSet', 'غير محدد')}
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                {t('assets.insurancePeriod', 'فترة التأمين')}
                              </span>
                              <span className="text-sm">
                                {formatDate(asset.insuranceDetails.startDate)} -{' '}
                                {formatDate(asset.insuranceDetails.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Depreciation Tab */}
                  <TabsContent value="depreciation" className="mt-0">
                    <div className="space-y-6">
                      {/* Depreciation Progress */}
                      <Card className="rounded-2xl border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-blue-900">
                                {t('assets.depreciationProgress', 'تقدم الإهلاك')}
                              </h3>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                {depreciationProgress.toFixed(1)}%
                              </Badge>
                            </div>
                            <Progress value={depreciationProgress} className="h-3" />
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {formatCurrency(asset.grossPurchaseAmount, asset.currency)}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {t('assets.originalValue', 'القيمة الأصلية')}
                                </div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-red-600">
                                  {formatCurrency(asset.accumulatedDepreciation || 0, asset.currency)}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {t('assets.accumulatedDepreciation', 'الإهلاك المتراكم')}
                                </div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-emerald-600">
                                  {formatCurrency(
                                    asset.valueAfterDepreciation || asset.grossPurchaseAmount,
                                    asset.currency
                                  )}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {t('assets.bookValue', 'القيمة الدفترية')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Depreciation Schedule */}
                      {!depreciationData || depreciationData.length === 0 ? (
                        <div className="text-center py-8">
                          <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            {t('assets.noDepreciationSchedule', 'لا يوجد جدول إهلاك')}
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-right">
                                  {t('assets.depreciationDate', 'تاريخ الإهلاك')}
                                </TableHead>
                                <TableHead className="text-right">
                                  {t('assets.depreciationAmount', 'قيمة الإهلاك')}
                                </TableHead>
                                <TableHead className="text-right">
                                  {t('assets.accumulatedDepreciation', 'الإهلاك المتراكم')}
                                </TableHead>
                                <TableHead className="text-right">
                                  {t('assets.bookValue', 'القيمة الدفترية')}
                                </TableHead>
                                <TableHead className="text-right">
                                  {t('assets.status', 'الحالة')}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {depreciationData.map((entry, index) => (
                                <TableRow key={entry._id || index}>
                                  <TableCell>{formatDate(entry.depreciationDate)}</TableCell>
                                  <TableCell className="font-mono text-red-600">
                                    {formatCurrency(entry.depreciationAmount, asset.currency)}
                                  </TableCell>
                                  <TableCell className="font-mono">
                                    {formatCurrency(entry.accumulatedDepreciation, asset.currency)}
                                  </TableCell>
                                  <TableCell className="font-mono font-bold">
                                    {formatCurrency(entry.valueAfterDepreciation, asset.currency)}
                                  </TableCell>
                                  <TableCell>
                                    {entry.isBooked ? (
                                      <Badge variant="default" className="bg-emerald-500">
                                        <CheckCircle2 className="w-3 h-3 ml-1" />
                                        {t('assets.booked', 'محسوب')}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">
                                        <Clock className="w-3 h-3 ml-1" />
                                        {t('assets.pending', 'معلق')}
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Maintenance Tab */}
                  <TabsContent value="maintenance" className="mt-0">
                    {!maintenanceData || maintenanceData.length === 0 ? (
                      <div className="text-center py-8">
                        <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('assets.noMaintenanceRecords', 'لا توجد سجلات صيانة')}
                        </p>
                        <Button className="mt-4 rounded-xl">
                          <Send className="w-4 h-4 ml-2" />
                          {t('assets.scheduleMaintenance', 'جدولة صيانة')}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Group by status */}
                        <div className="space-y-6">
                          {/* Upcoming Maintenance */}
                          {maintenanceData.filter((m) => m.status === 'planned').length > 0 && (
                            <div>
                              <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                {t('assets.upcomingMaintenance', 'صيانة قادمة')}
                              </h3>
                              <div className="space-y-2">
                                {maintenanceData
                                  .filter((m) => m.status === 'planned')
                                  .map((schedule, index) => (
                                    <Card key={schedule._id || index} className="rounded-2xl">
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <h4 className="font-medium">
                                                {schedule.maintenanceType}
                                              </h4>
                                              {getMaintenanceStatusBadge(schedule.status)}
                                            </div>
                                            {schedule.description && (
                                              <p className="text-sm text-muted-foreground mb-2">
                                                {schedule.description}
                                              </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                              <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(schedule.maintenanceDate)}
                                              </span>
                                              {schedule.assignedToName && (
                                                <span className="flex items-center gap-1">
                                                  <User className="w-4 h-4" />
                                                  {schedule.assignedToName}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <Button size="sm" variant="outline" className="rounded-lg">
                                            {t('assets.complete', 'إكمال')}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Overdue Maintenance */}
                          {maintenanceData.filter((m) => m.status === 'overdue').length > 0 && (
                            <div>
                              <h3 className="font-medium mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                {t('assets.overdueMaintenance', 'صيانة متأخرة')}
                              </h3>
                              <div className="space-y-2">
                                {maintenanceData
                                  .filter((m) => m.status === 'overdue')
                                  .map((schedule, index) => (
                                    <Card
                                      key={schedule._id || index}
                                      className="rounded-2xl border-red-200 bg-red-50"
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              <h4 className="font-medium text-red-900">
                                                {schedule.maintenanceType}
                                              </h4>
                                              {getMaintenanceStatusBadge(schedule.status)}
                                            </div>
                                            {schedule.description && (
                                              <p className="text-sm text-red-700 mb-2">
                                                {schedule.description}
                                              </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-red-700">
                                              <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(schedule.maintenanceDate)}
                                              </span>
                                              {schedule.assignedToName && (
                                                <span className="flex items-center gap-1">
                                                  <User className="w-4 h-4" />
                                                  {schedule.assignedToName}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            className="rounded-lg bg-red-600 hover:bg-red-700"
                                          >
                                            {t('assets.completeNow', 'إكمال الآن')}
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Completed Maintenance */}
                          {maintenanceData.filter((m) => m.status === 'completed').length > 0 && (
                            <div>
                              <h3 className="font-medium mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                {t('assets.completedMaintenance', 'صيانة مكتملة')}
                              </h3>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-right">
                                        {t('assets.maintenanceType', 'نوع الصيانة')}
                                      </TableHead>
                                      <TableHead className="text-right">
                                        {t('assets.scheduledDate', 'التاريخ المجدول')}
                                      </TableHead>
                                      <TableHead className="text-right">
                                        {t('assets.completedDate', 'تاريخ الإكمال')}
                                      </TableHead>
                                      <TableHead className="text-right">
                                        {t('assets.cost', 'التكلفة')}
                                      </TableHead>
                                      <TableHead className="text-right">
                                        {t('assets.remarks', 'ملاحظات')}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {maintenanceData
                                      .filter((m) => m.status === 'completed')
                                      .map((schedule, index) => (
                                        <TableRow key={schedule._id || index}>
                                          <TableCell className="font-medium">
                                            {schedule.maintenanceType}
                                          </TableCell>
                                          <TableCell>
                                            {formatDate(schedule.maintenanceDate)}
                                          </TableCell>
                                          <TableCell>
                                            {formatDate(schedule.completedDate)}
                                          </TableCell>
                                          <TableCell className="font-mono">
                                            {schedule.cost
                                              ? formatCurrency(schedule.cost, asset.currency)
                                              : '-'}
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                            {schedule.remarks || '-'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Movements Tab */}
                  <TabsContent value="movements" className="mt-0">
                    {!movementData || movementData.length === 0 ? (
                      <div className="text-center py-8">
                        <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('assets.noMovementHistory', 'لا توجد حركات')}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">
                                {t('assets.date', 'التاريخ')}
                              </TableHead>
                              <TableHead className="text-right">
                                {t('assets.movementType', 'نوع الحركة')}
                              </TableHead>
                              <TableHead className="text-right">
                                {t('assets.from', 'من')}
                              </TableHead>
                              <TableHead className="text-right">
                                {t('assets.to', 'إلى')}
                              </TableHead>
                              <TableHead className="text-right">
                                {t('assets.quantity', 'الكمية')}
                              </TableHead>
                              <TableHead className="text-right">
                                {t('assets.remarks', 'ملاحظات')}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {movementData.map((movement) => (
                              <TableRow key={movement._id}>
                                <TableCell className="text-sm">
                                  {formatDateTime(movement.transactionDate)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      movement.movementType === 'issue'
                                        ? 'border-red-500 text-red-500'
                                        : movement.movementType === 'receipt'
                                          ? 'border-green-500 text-green-500'
                                          : 'border-blue-500 text-blue-500'
                                    }
                                  >
                                    {movement.movementType === 'issue'
                                      ? t('assets.issue', 'إصدار')
                                      : movement.movementType === 'receipt'
                                        ? t('assets.receipt', 'استلام')
                                        : t('assets.transfer', 'نقل')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {movement.sourceLocation || movement.fromEmployee || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {movement.targetLocation || movement.toEmployee || '-'}
                                </TableCell>
                                <TableCell>{movement.quantity}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {movement.remarks || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="mt-0">
                    <div className="text-center py-8">
                      <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        {t('assets.noDocuments', 'لا توجد مستندات')}
                      </p>
                      <Button className="rounded-xl">
                        <Download className="w-4 h-4 ml-2" />
                        {t('assets.uploadDocument', 'رفع مستند')}
                      </Button>
                    </div>
                    {/* Future: Add document upload and list */}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            {/* QR Code Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">
                    {t('assets.assetQrCode', 'رمز QR للأصل')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('assets.qrCodeDesc', 'امسح الرمز لعرض تفاصيل الأصل')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    <Download className="w-4 h-4 ml-2" />
                    {t('assets.downloadQr', 'تحميل')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <AssetsSidebar />
        </div>
      </Main>
    </>
  )
}
