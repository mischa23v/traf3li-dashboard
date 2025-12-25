/**
 * BOM Details View
 * Comprehensive view for a single Bill of Materials with materials, operations, and costing
 */

import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Layers,
  Edit,
  Trash2,
  ArrowRight,
  Copy,
  CheckCircle2,
  XCircle,
  Package,
  Cog,
  FileText,
  DollarSign,
  Star,
  AlertTriangle,
  Box,
  Clock,
  Factory,
  TrendingUp,
  Activity,
  Wrench,
  BarChart3,
  List,
  ChevronRight,
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
  useBOM,
  useBOMs,
  useDeleteBOM,
  useUpdateBOM,
} from '@/hooks/use-manufacturing'
import type { BomType } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
]

export function BOMDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bomId } = useParams({ from: '/_authenticated/dashboard/manufacturing/boms/$bomId' })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showSetDefaultDialog, setShowSetDefaultDialog] = useState(false)

  const { data: bom, isLoading, error } = useBOM(bomId)
  const { data: allBOMs } = useBOMs({ isActive: true })
  const deleteBOMMutation = useDeleteBOM()
  const updateBOMMutation = useUpdateBOM()

  const handleDelete = async () => {
    await deleteBOMMutation.mutateAsync(bomId)
    navigate({ to: '/dashboard/manufacturing/boms' })
  }

  const handleToggleActive = async () => {
    if (!bom) return
    await updateBOMMutation.mutateAsync({
      id: bomId,
      data: { isActive: !bom.isActive }
    })
    setShowDeactivateDialog(false)
  }

  const handleSetDefault = async () => {
    if (!bom) return
    await updateBOMMutation.mutateAsync({
      id: bomId,
      data: { isDefault: true }
    })
    setShowSetDefaultDialog(false)
  }

  const handleDuplicate = () => {
    navigate({
      to: '/dashboard/manufacturing/boms/create',
      search: { duplicateFrom: bomId }
    })
  }

  const getBomTypeBadge = (type: BomType) => {
    switch (type) {
      case 'standard':
        return (
          <Badge variant="default" className="bg-blue-500">
            <Package className="w-3 h-3 ml-1" />
            {t('manufacturing.bomType.standard', 'قياسي')}
          </Badge>
        )
      case 'template':
        return (
          <Badge variant="default" className="bg-purple-500">
            <FileText className="w-3 h-3 ml-1" />
            {t('manufacturing.bomType.template', 'قالب')}
          </Badge>
        )
      case 'subcontract':
        return (
          <Badge variant="default" className="bg-amber-500">
            <Factory className="w-3 h-3 ml-1" />
            {t('manufacturing.bomType.subcontract', 'مقاول من الباطن')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  // Calculate costs
  const materialsCost = bom?.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  const operationsCost = bom?.operations?.reduce((sum, op) => sum + (op.operatingCost || 0), 0) || 0
  const totalCost = materialsCost + operationsCost
  const costPerUnit = bom?.quantity ? totalCost / bom.quantity : 0

  // Find parent BOMs (BOMs that use this BOM as a sub-assembly)
  const parentBOMs = allBOMs?.boms?.filter(parentBOM =>
    parentBOM._id !== bomId &&
    parentBOM.items?.some(item => item.itemId === bom?.itemId)
  ) || []

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  if (error || !bom) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('manufacturing.bomNotFound', 'قائمة المواد غير موجودة')}
              </h3>
              <Button onClick={() => navigate({ to: '/dashboard/manufacturing/boms' })} className="rounded-xl">
                <ArrowRight className="w-4 h-4 ml-2" />
                {t('manufacturing.backToList', 'العودة للقائمة')}
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('manufacturing.bom', 'قائمة المواد')}
          title={bom.bomNumber}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* BOM Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">
                        {bom.bomNumber}
                      </span>
                      {getBomTypeBadge(bom.bomType)}
                      {bom.isDefault && (
                        <Badge variant="default" className="bg-emerald-500">
                          <Star className="w-3 h-3 ml-1 fill-white" />
                          {t('manufacturing.default', 'افتراضي')}
                        </Badge>
                      )}
                      {bom.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          {t('manufacturing.active', 'نشط')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                          <XCircle className="w-3 h-3 ml-1" />
                          {t('manufacturing.inactive', 'غير نشط')}
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-2xl font-bold">
                      {bom.itemName || bom.itemCode}
                    </h1>
                    {bom.itemName && bom.itemCode && (
                      <p className="text-muted-foreground">{bom.itemCode}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.quantity', 'الكمية')}: </span>
                          <span className="font-medium">{bom.quantity} {bom.uom}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.totalCost', 'التكلفة الإجمالية')}: </span>
                          <span className="font-medium text-emerald-600">{formatCurrency(totalCost)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.materials', 'المواد')}: </span>
                          <span className="font-medium">{bom.items?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Cog className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.operations', 'العمليات')}: </span>
                          <span className="font-medium">{bom.operations?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate({ to: `/dashboard/manufacturing/boms/${bomId}/edit` })}
                      variant="default"
                      className="rounded-xl"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      {t('common.edit', 'تعديل')}
                    </Button>

                    <Button
                      onClick={handleDuplicate}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <Copy className="w-4 h-4 ml-2" />
                      {t('common.duplicate', 'نسخ')}
                    </Button>

                    {!bom.isDefault && bom.isActive && (
                      <AlertDialog open={showSetDefaultDialog} onOpenChange={setShowSetDefaultDialog}>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="rounded-xl">
                            <Star className="w-4 h-4 ml-2" />
                            {t('manufacturing.setAsDefault', 'تعيين كافتراضي')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('manufacturing.setAsDefaultTitle', 'تعيين كافتراضي')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('manufacturing.setAsDefaultDesc', 'هل تريد تعيين هذه القائمة كافتراضية لهذا الصنف؟')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSetDefault}>
                              {t('common.confirm', 'تأكيد')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl">
                          {bom.isActive ? (
                            <>
                              <XCircle className="w-4 h-4 ml-2" />
                              {t('manufacturing.deactivate', 'إلغاء التنشيط')}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 ml-2" />
                              {t('manufacturing.activate', 'تنشيط')}
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {bom.isActive
                              ? t('manufacturing.deactivateBOM', 'إلغاء تنشيط قائمة المواد')
                              : t('manufacturing.activateBOM', 'تنشيط قائمة المواد')
                            }
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {bom.isActive
                              ? t('manufacturing.deactivateBOMDesc', 'هل تريد إلغاء تنشيط قائمة المواد؟ لن يمكن استخدامها في أوامر العمل الجديدة.')
                              : t('manufacturing.activateBOMDesc', 'هل تريد تنشيط قائمة المواد؟')
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleToggleActive}>
                            {t('common.confirm', 'تأكيد')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="rounded-xl">
                          <Trash2 className="w-4 h-4 ml-2" />
                          {t('common.delete', 'حذف')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('manufacturing.deleteBOMTitle', 'حذف قائمة المواد')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('manufacturing.deleteBOMDesc', 'هل أنت متأكد من حذف قائمة المواد؟ لا يمكن التراجع عن هذا الإجراء.')}
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-700">
                      {t('manufacturing.totalCost', 'التكلفة الإجمالية')}
                    </span>
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-emerald-200 bg-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-700">
                      {t('manufacturing.materialsCost', 'تكلفة المواد')}
                    </span>
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{formatCurrency(materialsCost)}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-700">
                      {t('manufacturing.operationsCost', 'تكلفة العمليات')}
                    </span>
                    <Cog className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(operationsCost)}</div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-700">
                      {t('manufacturing.costPerUnit', 'التكلفة للوحدة')}
                    </span>
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{formatCurrency(costPerUnit)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-5 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                      <FileText className="w-4 h-4 ml-2" />
                      {t('manufacturing.overview', 'نظرة عامة')}
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="rounded-lg">
                      <Package className="w-4 h-4 ml-2" />
                      {t('manufacturing.materials', 'المواد')}
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="rounded-lg">
                      <Cog className="w-4 h-4 ml-2" />
                      {t('manufacturing.operations', 'العمليات')}
                    </TabsTrigger>
                    <TabsTrigger value="whereused" className="rounded-lg">
                      <List className="w-4 h-4 ml-2" />
                      {t('manufacturing.whereUsed', 'أين استخدمت')}
                    </TabsTrigger>
                    <TabsTrigger value="costing" className="rounded-lg">
                      <BarChart3 className="w-4 h-4 ml-2" />
                      {t('manufacturing.costing', 'التكاليف')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-4">{t('manufacturing.bomDetails', 'تفاصيل قائمة المواد')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.bomNumber', 'رقم القائمة')}</span>
                              <span className="font-mono">{bom.bomNumber}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.item', 'الصنف')}</span>
                              <span className="font-medium">{bom.itemName || bom.itemCode}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.bomType', 'النوع')}</span>
                              <span>{getBomTypeBadge(bom.bomType)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.quantity', 'الكمية')}</span>
                              <span className="font-medium">{bom.quantity} {bom.uom}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.status', 'الحالة')}</span>
                              <span>
                                {bom.isActive ? (
                                  <Badge variant="default" className="bg-green-500">
                                    {t('manufacturing.active', 'نشط')}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    {t('manufacturing.inactive', 'غير نشط')}
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.isDefault', 'افتراضي')}</span>
                              <span>
                                {bom.isDefault ? (
                                  <Badge variant="default" className="bg-emerald-500">
                                    <Star className="w-3 h-3 ml-1 fill-white" />
                                    {t('common.yes', 'نعم')}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    {t('common.no', 'لا')}
                                  </Badge>
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.materialsCount', 'عدد المواد')}</span>
                              <span className="font-medium">{bom.items?.length || 0}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.operationsCount', 'عدد العمليات')}</span>
                              <span className="font-medium">{bom.operations?.length || 0}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.createdAt', 'تاريخ الإنشاء')}</span>
                              <span className="text-sm">{formatDate(bom.createdAt)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.updatedAt', 'آخر تحديث')}</span>
                              <span className="text-sm">{formatDate(bom.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {bom.remarks && (
                        <div>
                          <h3 className="font-medium mb-2">{t('manufacturing.remarks', 'ملاحظات')}</h3>
                          <Card className="rounded-xl bg-muted/50">
                            <CardContent className="p-4">
                              <p className="text-sm">{bom.remarks}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Quick Summary */}
                      <div>
                        <h3 className="font-medium mb-4">{t('manufacturing.summary', 'ملخص')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="rounded-xl">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-blue-100">
                                  <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('manufacturing.totalMaterials', 'إجمالي المواد')}</p>
                                  <p className="text-xl font-bold">{bom.items?.length || 0}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-xl">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-purple-100">
                                  <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('manufacturing.totalTime', 'إجمالي الوقت')}</p>
                                  <p className="text-xl font-bold">
                                    {bom.operations?.reduce((sum, op) => sum + op.timeInMins, 0) || 0} {t('manufacturing.minutes', 'دقيقة')}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="rounded-xl">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-emerald-100">
                                  <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('manufacturing.totalValue', 'القيمة الإجمالية')}</p>
                                  <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Materials Tab */}
                  <TabsContent value="materials" className="mt-0">
                    {!bom.items || bom.items.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('manufacturing.noMaterials', 'لا توجد مواد')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="font-medium">
                            {t('manufacturing.rawMaterials', 'المواد الخام')} ({bom.items.length})
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {t('manufacturing.totalMaterialsCost', 'إجمالي تكلفة المواد')}: <span className="font-bold text-emerald-600">{formatCurrency(materialsCost)}</span>
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right w-12">#</TableHead>
                              <TableHead className="text-right">{t('manufacturing.item', 'الصنف')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.quantity', 'الكمية')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.rate', 'السعر')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.amount', 'المبلغ')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.warehouse', 'المستودع')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bom.items.map((item, index) => (
                              <TableRow key={item._id || index}>
                                <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div>{item.itemName || item.itemCode}</div>
                                    {item.itemName && item.itemCode && (
                                      <div className="text-xs text-muted-foreground">{item.itemCode}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{item.qty} {item.uom}</TableCell>
                                <TableCell>{item.rate ? formatCurrency(item.rate) : '-'}</TableCell>
                                <TableCell className="font-medium text-emerald-600">
                                  {item.amount ? formatCurrency(item.amount) : '-'}
                                </TableCell>
                                <TableCell className="text-sm">{item.sourceWarehouse || '-'}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-medium">
                              <TableCell colSpan={4} className="text-right">
                                {t('manufacturing.total', 'الإجمالي')}
                              </TableCell>
                              <TableCell className="text-emerald-600 font-bold">
                                {formatCurrency(materialsCost)}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </TabsContent>

                  {/* Operations Tab */}
                  <TabsContent value="operations" className="mt-0">
                    {!bom.operations || bom.operations.length === 0 ? (
                      <div className="text-center py-8">
                        <Cog className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('manufacturing.noOperations', 'لا توجد عمليات')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="font-medium">
                            {t('manufacturing.productionOperations', 'عمليات الإنتاج')} ({bom.operations.length})
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            {t('manufacturing.totalOperationsCost', 'إجمالي تكلفة العمليات')}: <span className="font-bold text-purple-600">{formatCurrency(operationsCost)}</span>
                          </div>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right w-12">{t('manufacturing.sequence', 'الترتيب')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.operation', 'العملية')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.workstation', 'محطة العمل')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.time', 'الوقت')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.cost', 'التكلفة')}</TableHead>
                              <TableHead className="text-right">{t('manufacturing.description', 'الوصف')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bom.operations
                              .sort((a, b) => a.sequence - b.sequence)
                              .map((operation, index) => (
                                <TableRow key={operation._id || index}>
                                  <TableCell className="font-mono font-medium">{operation.sequence}</TableCell>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <Wrench className="w-4 h-4 text-purple-600" />
                                      <div>
                                        <div>{operation.operation}</div>
                                        {operation.operationAr && (
                                          <div className="text-xs text-muted-foreground">{operation.operationAr}</div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {operation.workstation ? (
                                      <div className="flex items-center gap-2">
                                        <Factory className="w-4 h-4 text-muted-foreground" />
                                        {operation.workstation}
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                      {operation.timeInMins} {t('manufacturing.minutes', 'دقيقة')}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium text-purple-600">
                                    {operation.operatingCost ? formatCurrency(operation.operatingCost) : '-'}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                    {operation.description || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            <TableRow className="bg-muted/50 font-medium">
                              <TableCell colSpan={3} className="text-right">
                                {t('manufacturing.total', 'الإجمالي')}
                              </TableCell>
                              <TableCell>
                                <Clock className="w-4 h-4 inline ml-1" />
                                {bom.operations.reduce((sum, op) => sum + op.timeInMins, 0)} {t('manufacturing.minutes', 'دقيقة')}
                              </TableCell>
                              <TableCell className="text-purple-600 font-bold">
                                {formatCurrency(operationsCost)}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </TabsContent>

                  {/* Where Used Tab */}
                  <TabsContent value="whereused" className="mt-0">
                    {parentBOMs.length === 0 ? (
                      <div className="text-center py-8">
                        <List className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('manufacturing.notUsedInOtherBOMs', 'لا يستخدم في قوائم مواد أخرى')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <h3 className="font-medium">
                            {t('manufacturing.parentBOMs', 'قوائم المواد الأم')} ({parentBOMs.length})
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('manufacturing.parentBOMsDesc', 'قوائم المواد التي تستخدم هذا الصنف كمكون')}
                          </p>
                        </div>
                        <div className="space-y-3">
                          {parentBOMs.map((parentBOM) => (
                            <Card key={parentBOM._id} className="rounded-xl hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Layers className="w-4 h-4 text-blue-600" />
                                      <span className="font-mono text-sm font-medium">{parentBOM.bomNumber}</span>
                                      {getBomTypeBadge(parentBOM.bomType)}
                                      {parentBOM.isDefault && (
                                        <Badge variant="default" className="bg-emerald-500">
                                          <Star className="w-3 h-3 ml-1 fill-white" />
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="font-medium mb-1">{parentBOM.itemName || parentBOM.itemCode}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {parentBOM.quantity} {parentBOM.uom}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Box className="w-3 h-3" />
                                        {parentBOM.items?.length || 0} {t('manufacturing.materials', 'مواد')}
                                      </div>
                                      {parentBOM.totalCost && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="w-3 h-3" />
                                          {formatCurrency(parentBOM.totalCost)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate({ to: `/dashboard/manufacturing/boms/${parentBOM._id}` })}
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Costing Tab */}
                  <TabsContent value="costing" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-4">{t('manufacturing.costBreakdown', 'تفاصيل التكلفة')}</h3>

                        {/* Cost Breakdown Chart */}
                        <Card className="rounded-xl mb-6">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Materials Cost */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-emerald-600" />
                                    <span className="font-medium">{t('manufacturing.materialsCost', 'تكلفة المواد')}</span>
                                  </div>
                                  <span className="font-bold text-emerald-600">{formatCurrency(materialsCost)}</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${totalCost > 0 ? (materialsCost / totalCost) * 100 : 0}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {totalCost > 0 ? Math.round((materialsCost / totalCost) * 100) : 0}% {t('manufacturing.ofTotal', 'من الإجمالي')}
                                </p>
                              </div>

                              {/* Operations Cost */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Cog className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium">{t('manufacturing.operationsCost', 'تكلفة العمليات')}</span>
                                  </div>
                                  <span className="font-bold text-purple-600">{formatCurrency(operationsCost)}</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500"
                                    style={{ width: `${totalCost > 0 ? (operationsCost / totalCost) * 100 : 0}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {totalCost > 0 ? Math.round((operationsCost / totalCost) * 100) : 0}% {t('manufacturing.ofTotal', 'من الإجمالي')}
                                </p>
                              </div>

                              {/* Total */}
                              <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-lg">{t('manufacturing.totalCost', 'التكلفة الإجمالية')}</span>
                                  </div>
                                  <span className="font-bold text-2xl text-blue-600">{formatCurrency(totalCost)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Cost Per Unit */}
                        <Card className="rounded-xl">
                          <CardContent className="p-6">
                            <h4 className="font-medium mb-4">{t('manufacturing.costAnalysis', 'تحليل التكلفة')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <p className="text-sm text-blue-700 mb-1">{t('manufacturing.productionQty', 'كمية الإنتاج')}</p>
                                <p className="text-2xl font-bold text-blue-600">{bom.quantity} {bom.uom}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                                <p className="text-sm text-emerald-700 mb-1">{t('manufacturing.costPerUnit', 'التكلفة للوحدة')}</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(costPerUnit)}</p>
                              </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="mt-6 space-y-2">
                              <h5 className="font-medium text-sm mb-3">{t('manufacturing.detailedBreakdown', 'التفصيل الدقيق')}</h5>
                              <div className="flex justify-between py-2 border-b text-sm">
                                <span className="text-muted-foreground">{t('manufacturing.rawMaterialsPerUnit', 'المواد الخام للوحدة')}</span>
                                <span className="font-medium">{formatCurrency(bom.quantity > 0 ? materialsCost / bom.quantity : 0)}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b text-sm">
                                <span className="text-muted-foreground">{t('manufacturing.operationsPerUnit', 'العمليات للوحدة')}</span>
                                <span className="font-medium">{formatCurrency(bom.quantity > 0 ? operationsCost / bom.quantity : 0)}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b text-sm">
                                <span className="text-muted-foreground">{t('manufacturing.totalMaterials', 'إجمالي المواد')}</span>
                                <span className="font-medium">{bom.items?.length || 0}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b text-sm">
                                <span className="text-muted-foreground">{t('manufacturing.totalOperations', 'إجمالي العمليات')}</span>
                                <span className="font-medium">{bom.operations?.length || 0}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b text-sm">
                                <span className="text-muted-foreground">{t('manufacturing.totalProductionTime', 'إجمالي وقت الإنتاج')}</span>
                                <span className="font-medium">
                                  {bom.operations?.reduce((sum, op) => sum + op.timeInMins, 0) || 0} {t('manufacturing.minutes', 'دقيقة')}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <ManufacturingSidebar />
        </div>
      </Main>
    </>
  )
}
