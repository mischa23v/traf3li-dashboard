/**
 * Inspection Details View
 * Detailed view for a single quality inspection
 */

import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck,
  Edit,
  Trash2,
  ArrowRight,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Package,
  BarChart3,
  PrinterIcon,
  Send,
  FileCheck,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  useInspection,
  useDeleteInspection,
  useSubmitInspection,
  useActions
} from '@/hooks/use-quality'
import type { InspectionStatus, InspectionType, ReadingStatus } from '@/types/quality'
import { QualitySidebar } from './quality-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.quality', href: ROUTES.dashboard.quality.list },
]

export function InspectionDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { inspectionId } = useParams({ from: '/_authenticated/dashboard/quality/$inspectionId' })

  const { data: inspection, isLoading, error } = useInspection(inspectionId)
  const { data: linkedActions } = useActions({ inspectionId } as any)
  const deleteInspectionMutation = useDeleteInspection()
  const submitInspectionMutation = useSubmitInspection()

  const handleDelete = async () => {
    await deleteInspectionMutation.mutateAsync(inspectionId)
    navigate({ to: ROUTES.dashboard.quality.list })
  }

  const handleSubmit = async (status: InspectionStatus) => {
    await submitInspectionMutation.mutateAsync({ id: inspectionId, status })
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('quality.status.accepted', 'مقبول')}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('quality.status.rejected', 'مرفوض')}
          </Badge>
        )
      case 'partially_accepted':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3 h-3 ml-1" />
            {t('quality.status.partiallyAccepted', 'مقبول جزئياً')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <Calendar className="w-3 h-3 ml-1" />
            {t('quality.status.pending', 'قيد الفحص')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: InspectionType) => {
    switch (type) {
      case 'incoming':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            {t('quality.type.incoming', 'وارد')}
          </Badge>
        )
      case 'outgoing':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            {t('quality.type.outgoing', 'صادر')}
          </Badge>
        )
      case 'in_process':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            {t('quality.type.inProcess', 'خلال الإنتاج')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getReadingStatusBadge = (status: ReadingStatus) => {
    if (status === 'accepted') {
      return (
        <Badge variant="default" className="bg-emerald-500">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          {t('quality.accepted', 'مقبول')}
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 ml-1" />
        {t('quality.rejected', 'مرفوض')}
      </Badge>
    )
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  // Calculate pass rate
  const passedReadings = inspection?.readings.filter(r => r.status === 'accepted').length || 0
  const totalReadings = inspection?.readings.length || 0
  const passRate = totalReadings > 0 ? Math.round((passedReadings / totalReadings) * 100) : 0

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

  if (error || !inspection) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('quality.inspectionNotFound', 'الفحص غير موجود')}
              </h3>
              <Button
                onClick={() => navigate({ to: ROUTES.dashboard.quality.list })}
                className="rounded-xl"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                {t('quality.backToList', 'العودة للقائمة')}
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
          badge={t('quality.badge', 'فحص الجودة')}
          title={inspection.inspectionNumber}
          type="quality"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Inspection Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">
                        {inspection.inspectionNumber}
                      </span>
                      {getTypeBadge(inspection.inspectionType)}
                      {getStatusBadge(inspection.status)}
                    </div>

                    <h1 className="text-2xl font-bold">
                      {inspection.itemName || inspection.itemCode || t('quality.inspection', 'فحص جودة')}
                    </h1>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('quality.item', 'الصنف')}: </span>
                          <span className="font-medium">{inspection.itemCode}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('quality.date', 'التاريخ')}: </span>
                          <span className="font-medium">{formatDate(inspection.inspectionDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('quality.inspector', 'المفتش')}: </span>
                          <span className="font-medium">
                            {inspection.inspectedByName || inspection.inspectedBy || t('quality.notAssigned', 'غير محدد')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('quality.reference', 'المرجع')}: </span>
                          <span className="font-medium">
                            {inspection.referenceNumber || inspection.referenceId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {inspection.batchNo && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t('quality.batchNo', 'رقم الدفعة')}: </span>
                        <span className="font-mono font-medium">{inspection.batchNo}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {inspection.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => navigate({ to: `${ROUTES.dashboard.quality.detail(inspectionId)}/edit` })}
                          className="rounded-xl"
                        >
                          <Edit className="w-4 h-4 ml-2" />
                          {t('common.edit', 'تعديل')}
                        </Button>

                        <Select onValueChange={(value) => handleSubmit(value as InspectionStatus)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder={t('quality.submitInspection', 'تقديم النتيجة')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accepted">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                {t('quality.status.accepted', 'مقبول')}
                              </div>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                {t('quality.status.rejected', 'مرفوض')}
                              </div>
                            </SelectItem>
                            <SelectItem value="partially_accepted">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                {t('quality.status.partiallyAccepted', 'مقبول جزئياً')}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <PrinterIcon className="w-4 h-4 ml-2" />
                      {t('quality.printReport', 'طباعة التقرير')}
                    </Button>

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
                            {t('quality.deleteConfirmTitle', 'حذف الفحص')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('quality.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا الفحص؟ لا يمكن التراجع عن هذا الإجراء.')}
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

            {/* Pass Rate Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('quality.passRate', 'نسبة النجاح')}
                    </span>
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">{passRate}%</div>
                  <Progress value={passRate} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('quality.passedReadings', 'القراءات المقبولة')}
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold">{passedReadings}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t('quality.outOf', 'من')} {totalReadings}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('quality.sampleSize', 'حجم العينة')}
                    </span>
                    <FileCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold">{inspection.sampleSize}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {t('quality.units', 'وحدة')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-4 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                      <FileText className="w-4 h-4 ml-2" />
                      {t('quality.overview', 'نظرة عامة')}
                    </TabsTrigger>
                    <TabsTrigger value="readings" className="rounded-lg">
                      <ClipboardCheck className="w-4 h-4 ml-2" />
                      {t('quality.readings', 'القراءات')}
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="rounded-lg">
                      <AlertTriangle className="w-4 h-4 ml-2" />
                      {t('quality.actions', 'الإجراءات')}
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg">
                      <FileText className="w-4 h-4 ml-2" />
                      {t('quality.documents', 'المستندات')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-4">{t('quality.inspectionDetails', 'تفاصيل الفحص')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('quality.referenceType', 'نوع المرجع')}</span>
                              <span className="font-medium">{inspection.referenceType}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('quality.referenceId', 'رقم المرجع')}</span>
                              <span className="font-mono">{inspection.referenceNumber || inspection.referenceId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('quality.inspectionType', 'نوع الفحص')}</span>
                              <span>{getTypeBadge(inspection.inspectionType)}</span>
                            </div>
                            {inspection.templateName && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('quality.template', 'القالب')}</span>
                                <span className="font-medium">{inspection.templateName}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('quality.status', 'الحالة')}</span>
                              <span>{getStatusBadge(inspection.status)}</span>
                            </div>
                            {inspection.acceptedQty !== undefined && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('quality.acceptedQty', 'الكمية المقبولة')}</span>
                                <span className="font-medium text-emerald-600">{inspection.acceptedQty}</span>
                              </div>
                            )}
                            {inspection.rejectedQty !== undefined && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('quality.rejectedQty', 'الكمية المرفوضة')}</span>
                                <span className="font-medium text-red-600">{inspection.rejectedQty}</span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('quality.createdAt', 'تاريخ الإنشاء')}</span>
                              <span className="text-sm">{formatDate(inspection.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {inspection.remarks && (
                        <div>
                          <h3 className="font-medium mb-2">{t('quality.remarks', 'ملاحظات')}</h3>
                          <Card className="rounded-xl bg-muted/50">
                            <CardContent className="p-4">
                              <p className="text-sm">{inspection.remarks}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Readings Tab */}
                  <TabsContent value="readings" className="mt-0">
                    {!inspection.readings || inspection.readings.length === 0 ? (
                      <div className="text-center py-8">
                        <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('quality.noReadings', 'لا توجد قراءات')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('quality.parameter', 'المعيار')}</TableHead>
                            <TableHead className="text-right">{t('quality.specification', 'المواصفة')}</TableHead>
                            <TableHead className="text-right">{t('quality.criteria', 'معيار القبول')}</TableHead>
                            <TableHead className="text-right">{t('quality.value', 'القيمة')}</TableHead>
                            <TableHead className="text-right">{t('quality.status', 'الحالة')}</TableHead>
                            <TableHead className="text-right">{t('quality.remarks', 'ملاحظات')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inspection.readings.map((reading, index) => (
                            <TableRow key={reading._id || index}>
                              <TableCell className="font-medium">
                                <div>
                                  <div>{reading.parameterNameAr || reading.parameterName}</div>
                                  {reading.parameterNameAr && reading.parameterName && (
                                    <div className="text-xs text-muted-foreground">{reading.parameterName}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{reading.specification || '-'}</TableCell>
                              <TableCell>
                                {reading.acceptanceCriteria ||
                                  (reading.minValue !== undefined && reading.maxValue !== undefined
                                    ? `${reading.minValue} - ${reading.maxValue}`
                                    : '-')}
                              </TableCell>
                              <TableCell className="font-mono">{reading.value || '-'}</TableCell>
                              <TableCell>{getReadingStatusBadge(reading.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {reading.remarks || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Actions Tab */}
                  <TabsContent value="actions" className="mt-0">
                    {!linkedActions || linkedActions.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          {t('quality.noActions', 'لا توجد إجراءات تصحيحية أو وقائية')}
                        </p>
                        <Button
                          onClick={() => navigate({
                            to: ROUTES.dashboard.quality.actions.create,
                            search: { inspectionId }
                          })}
                          className="rounded-xl"
                        >
                          <AlertTriangle className="w-4 h-4 ml-2" />
                          {t('quality.createAction', 'إنشاء إجراء')}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {linkedActions.map((action) => (
                          <Card key={action._id} className="rounded-xl hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={action.type === 'corrective' ? 'default' : 'secondary'}>
                                      {action.type === 'corrective'
                                        ? t('quality.corrective', 'تصحيحي')
                                        : t('quality.preventive', 'وقائي')}
                                    </Badge>
                                    <Badge variant="outline">{action.priority}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {action.actionNumber}
                                    </span>
                                  </div>
                                  <p className="font-medium mb-1">{action.description}</p>
                                  {action.assignedToName && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <User className="w-3 h-3" />
                                      {action.assignedToName}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate({ to: `${ROUTES.dashboard.quality.actions.list}/${action._id}` })}
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

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="mt-0">
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        {t('quality.noDocuments', 'لا توجد مستندات مرفقة')}
                      </p>
                      <Button variant="outline" className="rounded-xl">
                        <FileText className="w-4 h-4 ml-2" />
                        {t('quality.attachDocument', 'إرفاق مستند')}
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <QualitySidebar />
        </div>
      </Main>
    </>
  )
}
