/**
 * Work Order Details View
 * Comprehensive view for a single work order with operations, materials, and job cards
 */

import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Factory,
  Edit,
  Trash2,
  ArrowRight,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ClipboardList,
  Layers,
  History,
  BarChart3,
  AlertTriangle,
  PlayCircle,
  StopCircle,
  Calendar,
  Warehouse,
  FileText,
  TrendingUp,
  Box,
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
  useWorkOrder,
  useJobCards,
  useDeleteWorkOrder,
  useStartWorkOrder,
  useStopWorkOrder,
  useCompleteWorkOrder,
} from '@/hooks/use-manufacturing'
import { useStockEntries } from '@/hooks/use-inventory'
import type { WorkOrderStatus } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: ROUTES.dashboard.manufacturing.list },
]

export function WorkOrderDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { workOrderId } = useParams({ from: '/_authenticated/dashboard/manufacturing/work-orders/$workOrderId' })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState<'start' | 'stop' | 'complete' | null>(null)

  const { data: workOrder, isLoading, error } = useWorkOrder(workOrderId)
  const { data: jobCardsData } = useJobCards({ workOrderId })
  const { data: stockEntriesData } = useStockEntries({ workOrderId } as any)

  const deleteWorkOrderMutation = useDeleteWorkOrder()
  const startWorkOrderMutation = useStartWorkOrder()
  const stopWorkOrderMutation = useStopWorkOrder()
  const completeWorkOrderMutation = useCompleteWorkOrder()

  const handleDelete = async () => {
    await deleteWorkOrderMutation.mutateAsync(workOrderId)
    navigate({ to: ROUTES.dashboard.manufacturing.list })
  }

  const handleStatusChange = async (action: 'start' | 'stop' | 'complete') => {
    try {
      switch (action) {
        case 'start':
          await startWorkOrderMutation.mutateAsync(workOrderId)
          break
        case 'stop':
          await stopWorkOrderMutation.mutateAsync(workOrderId)
          break
        case 'complete':
          await completeWorkOrderMutation.mutateAsync(workOrderId)
          break
      }
      setShowStatusDialog(null)
    } catch (error) {
      console.error('Failed to update work order status:', error)
    }
  }

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('manufacturing.status.completed', 'مكتمل')}
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge variant="default" className="bg-blue-500">
            <PlayCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.status.inProgress', 'قيد التنفيذ')}
          </Badge>
        )
      case 'stopped':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <StopCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.status.stopped', 'متوقف')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.status.cancelled', 'ملغى')}
          </Badge>
        )
      case 'not_started':
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-600">
            <Clock className="w-3 h-3 ml-1" />
            {t('manufacturing.status.notStarted', 'لم يبدأ')}
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <FileText className="w-3 h-3 ml-1" />
            {t('manufacturing.status.submitted', 'مقدم')}
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-600">
            {t('manufacturing.status.draft', 'مسودة')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getOperationStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('manufacturing.completed', 'مكتمل')}
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge variant="default" className="bg-blue-500">
            <PlayCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.inProgress', 'قيد التنفيذ')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 ml-1" />
            {t('manufacturing.pending', 'معلق')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  const formatDateOnly = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium'
    }).format(new Date(date))
  }

  // Calculate progress
  const completionPercentage = workOrder
    ? Math.round((workOrder.producedQty / workOrder.qty) * 100)
    : 0

  // Calculate materials consumed percentage
  const materialsConsumed = workOrder?.requiredItems?.reduce(
    (sum, item) => sum + item.consumedQty,
    0
  ) || 0
  const materialsRequired = workOrder?.requiredItems?.reduce(
    (sum, item) => sum + item.requiredQty,
    0
  ) || 0
  const materialsPercentage = materialsRequired > 0
    ? Math.round((materialsConsumed / materialsRequired) * 100)
    : 0

  // Calculate operations progress
  const completedOperations = workOrder?.operations?.filter(op => op.status === 'completed').length || 0
  const totalOperations = workOrder?.operations?.length || 0
  const operationsPercentage = totalOperations > 0
    ? Math.round((completedOperations / totalOperations) * 100)
    : 0

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

  if (error || !workOrder) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <Factory className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('manufacturing.workOrderNotFound', 'أمر العمل غير موجود')}
              </h3>
              <Button onClick={() => navigate({ to: ROUTES.dashboard.manufacturing.list })} className="rounded-xl">
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
          badge={t('manufacturing.badge', 'التصنيع')}
          title={workOrder.workOrderNumber}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Work Order Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">
                        {workOrder.workOrderNumber}
                      </span>
                      {getStatusBadge(workOrder.status)}
                    </div>

                    <h1 className="text-2xl font-bold">
                      {workOrder.itemName || workOrder.itemCode}
                    </h1>
                    {workOrder.itemName && workOrder.itemCode && (
                      <p className="text-muted-foreground">{workOrder.itemCode}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.bom', 'قائمة المواد')}: </span>
                          <span className="font-medium">{workOrder.bomNumber || workOrder.bomId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.quantity', 'الكمية')}: </span>
                          <span className="font-medium">{workOrder.qty} {workOrder.uom}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.produced', 'المنتج')}: </span>
                          <span className="font-medium text-emerald-600">
                            {workOrder.producedQty} {workOrder.uom}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.warehouse', 'المستودع')}: </span>
                          <span className="font-medium">{workOrder.targetWarehouse}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {workOrder.status === 'not_started' || workOrder.status === 'submitted' ? (
                      <>
                        <AlertDialog open={showStatusDialog === 'start'} onOpenChange={(open) => !open && setShowStatusDialog(null)}>
                          <AlertDialogTrigger asChild>
                            <Button className="rounded-xl" onClick={() => setShowStatusDialog('start')}>
                              <Play className="w-4 h-4 ml-2" />
                              {t('manufacturing.start', 'بدء')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('manufacturing.startWorkOrder', 'بدء أمر العمل')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('manufacturing.startWorkOrderConfirm', 'هل تريد بدء تنفيذ أمر العمل؟')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStatusChange('start')}>
                                {t('manufacturing.start', 'بدء')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : null}

                    {workOrder.status === 'in_progress' ? (
                      <>
                        <AlertDialog open={showStatusDialog === 'stop'} onOpenChange={(open) => !open && setShowStatusDialog(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl" onClick={() => setShowStatusDialog('stop')}>
                              <Square className="w-4 h-4 ml-2" />
                              {t('manufacturing.stop', 'إيقاف')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('manufacturing.stopWorkOrder', 'إيقاف أمر العمل')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('manufacturing.stopWorkOrderConfirm', 'هل تريد إيقاف تنفيذ أمر العمل مؤقتاً؟')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStatusChange('stop')}>
                                {t('manufacturing.stop', 'إيقاف')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={showStatusDialog === 'complete'} onOpenChange={(open) => !open && setShowStatusDialog(null)}>
                          <AlertDialogTrigger asChild>
                            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowStatusDialog('complete')}>
                              <CheckCircle2 className="w-4 h-4 ml-2" />
                              {t('manufacturing.complete', 'إكمال')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('manufacturing.completeWorkOrder', 'إكمال أمر العمل')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('manufacturing.completeWorkOrderConfirm', 'هل تريد إكمال أمر العمل؟ هذا الإجراء سيغلق أمر العمل.')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleStatusChange('complete')} className="bg-emerald-600 hover:bg-emerald-700">
                                {t('manufacturing.complete', 'إكمال')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : null}

                    {(workOrder.status === 'draft' || workOrder.status === 'not_started') && (
                      <Button
                        onClick={() => navigate({ to: ROUTES.dashboard.manufacturing.workOrders.edit(workOrderId) })}
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Edit className="w-4 h-4 ml-2" />
                        {t('common.edit', 'تعديل')}
                      </Button>
                    )}

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
                            {t('manufacturing.deleteWorkOrderTitle', 'حذف أمر العمل')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('manufacturing.deleteWorkOrderDesc', 'هل أنت متأكد من حذف أمر العمل؟ لا يمكن التراجع عن هذا الإجراء.')}
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

            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('manufacturing.overallProgress', 'التقدم الإجمالي')}
                    </span>
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{completionPercentage}%</div>
                  <Progress value={completionPercentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {workOrder.producedQty} / {workOrder.qty} {workOrder.uom}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('manufacturing.materialsConsumed', 'المواد المستهلكة')}
                    </span>
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{materialsPercentage}%</div>
                  <Progress value={materialsPercentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {materialsConsumed.toFixed(2)} / {materialsRequired.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('manufacturing.operations', 'العمليات')}
                    </span>
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{operationsPercentage}%</div>
                  <Progress value={operationsPercentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {completedOperations} / {totalOperations}
                  </div>
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
                    <TabsTrigger value="items" className="rounded-lg">
                      <Package className="w-4 h-4 ml-2" />
                      {t('manufacturing.requiredItems', 'المواد المطلوبة')}
                    </TabsTrigger>
                    <TabsTrigger value="operations" className="rounded-lg">
                      <ClipboardList className="w-4 h-4 ml-2" />
                      {t('manufacturing.operations', 'العمليات')}
                    </TabsTrigger>
                    <TabsTrigger value="jobcards" className="rounded-lg">
                      <ClipboardList className="w-4 h-4 ml-2" />
                      {t('manufacturing.jobCards', 'بطاقات العمل')}
                    </TabsTrigger>
                    <TabsTrigger value="stock" className="rounded-lg">
                      <History className="w-4 h-4 ml-2" />
                      {t('manufacturing.stockEntries', 'حركات المخزون')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-4">{t('manufacturing.workOrderDetails', 'تفاصيل أمر العمل')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.status', 'الحالة')}</span>
                              <span>{getStatusBadge(workOrder.status)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.item', 'الصنف')}</span>
                              <span className="font-medium">{workOrder.itemName || workOrder.itemCode}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.bom', 'قائمة المواد')}</span>
                              <span className="font-mono">{workOrder.bomNumber || workOrder.bomId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.quantity', 'الكمية المطلوبة')}</span>
                              <span className="font-medium">{workOrder.qty} {workOrder.uom}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.producedQty', 'الكمية المنتجة')}</span>
                              <span className="font-medium text-emerald-600">{workOrder.producedQty} {workOrder.uom}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.targetWarehouse', 'مستودع الهدف')}</span>
                              <span className="font-medium">{workOrder.targetWarehouse}</span>
                            </div>
                            {workOrder.wipWarehouse && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.wipWarehouse', 'مستودع الإنتاج')}</span>
                                <span className="font-medium">{workOrder.workInProgressWarehouse}</span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.plannedStartDate', 'تاريخ البدء المخطط')}</span>
                              <span className="text-sm">{formatDateOnly(workOrder.plannedStartDate)}</span>
                            </div>
                            {workOrder.plannedEndDate && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.plannedEndDate', 'تاريخ الانتهاء المخطط')}</span>
                                <span className="text-sm">{formatDateOnly(workOrder.plannedEndDate)}</span>
                              </div>
                            )}
                            {workOrder.actualStartDate && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.actualStartDate', 'تاريخ البدء الفعلي')}</span>
                                <span className="text-sm">{formatDate(workOrder.actualStartDate)}</span>
                              </div>
                            )}
                            {workOrder.actualEndDate && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.actualEndDate', 'تاريخ الانتهاء الفعلي')}</span>
                                <span className="text-sm">{formatDate(workOrder.actualEndDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {workOrder.remarks && (
                        <div>
                          <h3 className="font-medium mb-2">{t('manufacturing.remarks', 'ملاحظات')}</h3>
                          <Card className="rounded-xl bg-muted/50">
                            <CardContent className="p-4">
                              <p className="text-sm">{workOrder.remarks}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Required Items Tab */}
                  <TabsContent value="items" className="mt-0">
                    {!workOrder.requiredItems || workOrder.requiredItems.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('manufacturing.noRequiredItems', 'لا توجد مواد مطلوبة')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('manufacturing.item', 'الصنف')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.required', 'المطلوب')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.transferred', 'المحول')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.consumed', 'المستهلك')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.availability', 'التوفر')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workOrder.requiredItems.map((item, index) => {
                            const availability = ((item.transferredQty / item.requiredQty) * 100) || 0
                            return (
                              <TableRow key={item._id || index}>
                                <TableCell className="font-medium">
                                  <div>
                                    <div>{item.itemName || item.itemCode}</div>
                                    {item.itemName && item.itemCode && (
                                      <div className="text-xs text-muted-foreground">{item.itemCode}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{item.requiredQty} {item.uom}</TableCell>
                                <TableCell>{item.transferredQty} {item.uom}</TableCell>
                                <TableCell className="text-emerald-600">{item.consumedQty} {item.uom}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={availability} className="h-2 w-20" />
                                    <span className="text-sm">{Math.round(availability)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Operations Tab */}
                  <TabsContent value="operations" className="mt-0">
                    {!workOrder.operations || workOrder.operations.length === 0 ? (
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('manufacturing.noOperations', 'لا توجد عمليات')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('manufacturing.sequence', 'الترتيب')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.operation', 'العملية')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.workstation', 'محطة العمل')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.plannedTime', 'الوقت المخطط')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.actualTime', 'الوقت الفعلي')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.completedQty', 'الكمية المكتملة')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.status', 'الحالة')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workOrder.operations
                            .sort((a, b) => a.sequence - b.sequence)
                            .map((operation, index) => (
                              <TableRow key={operation._id || index}>
                                <TableCell className="font-mono">{operation.sequence}</TableCell>
                                <TableCell className="font-medium">{operation.operation}</TableCell>
                                <TableCell>{operation.workstation || '-'}</TableCell>
                                <TableCell>{operation.plannedTime} {t('manufacturing.minutes', 'دقيقة')}</TableCell>
                                <TableCell>
                                  {operation.actualTime ? `${operation.actualTime} ${t('manufacturing.minutes', 'دقيقة')}` : '-'}
                                </TableCell>
                                <TableCell>{operation.completedQty} {workOrder.uom}</TableCell>
                                <TableCell>{getOperationStatusBadge(operation.status)}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Job Cards Tab */}
                  <TabsContent value="jobcards" className="mt-0">
                    {!jobCardsData || jobCardsData.length === 0 ? (
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          {t('manufacturing.noJobCards', 'لا توجد بطاقات عمل')}
                        </p>
                        <Button
                          onClick={() => navigate({
                            to: ROUTES.dashboard.manufacturing.jobCards.create,
                            search: { workOrderId }
                          })}
                          className="rounded-xl"
                        >
                          <ClipboardList className="w-4 h-4 ml-2" />
                          {t('manufacturing.createJobCard', 'إنشاء بطاقة عمل')}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobCardsData.map((jobCard: any) => (
                          <Card key={jobCard._id} className="rounded-xl hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-sm font-medium">{jobCard.jobCardNumber}</span>
                                    {getOperationStatusBadge(jobCard.status)}
                                  </div>
                                  <p className="font-medium mb-1">{jobCard.operation}</p>
                                  {jobCard.workstation && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Factory className="w-3 h-3" />
                                      {jobCard.workstation}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {t('manufacturing.timeSpent', 'الوقت')}:
                                      </span>
                                      <span className="font-medium">{jobCard.totalTimeSpent || 0} {t('manufacturing.minutes', 'دقيقة')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Box className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {t('manufacturing.completed', 'المكتمل')}:
                                      </span>
                                      <span className="font-medium">{jobCard.completedQty || 0} {workOrder.uom}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate({ to: ROUTES.dashboard.manufacturing.jobCards.detail(jobCard._id) })}
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Stock Entries Tab */}
                  <TabsContent value="stock" className="mt-0">
                    {!stockEntriesData?.entries || stockEntriesData.entries.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('manufacturing.noStockEntries', 'لا توجد حركات مخزون')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('manufacturing.date', 'التاريخ')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.entryNumber', 'رقم الحركة')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.type', 'النوع')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.item', 'الصنف')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.quantity', 'الكمية')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.warehouse', 'المستودع')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockEntriesData.entries.map((entry: any) => (
                            <TableRow key={entry._id}>
                              <TableCell className="text-sm">{formatDate(entry.postingDate)}</TableCell>
                              <TableCell className="font-mono">{entry.entryNumber || entry._id.slice(-6)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{entry.entryType}</Badge>
                              </TableCell>
                              <TableCell>{entry.itemName || entry.itemCode}</TableCell>
                              <TableCell>
                                <span className={entry.qty > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                  {entry.qty > 0 ? '+' : ''}{entry.qty}
                                </span>
                              </TableCell>
                              <TableCell>{entry.warehouseName || entry.warehouseId}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
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
