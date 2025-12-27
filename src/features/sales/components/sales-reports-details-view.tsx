import { Link, useParams } from '@tanstack/react-router'
import {
import { useTranslation } from 'react-i18next'
  ArrowRight,
  FileBarChart,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useReport, useGenerateReport, useDeleteReport } from '@/hooks/useReports'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import {
  ReportStatus,
  ReportCategory,
  reportCategoryLabels,
  reportStatusLabels,
  dataModuleLabels,
} from '@/services/reportsService'
import { ROUTES } from '@/constants/routes'

const categoryIcons: Partial<Record<ReportCategory, React.ElementType>> = {
  [ReportCategory.SALES_OVERVIEW]: TrendingUp,
  [ReportCategory.REVENUE_ANALYSIS]: DollarSign,
  [ReportCategory.SALES_BY_PRODUCT]: ShoppingCart,
  [ReportCategory.SALES_BY_REGION]: Users,
  [ReportCategory.SALES_BY_SALESPERSON]: Users,
  [ReportCategory.SALES_PIPELINE]: TrendingUp,
  [ReportCategory.SALES_FORECAST]: TrendingUp,
  [ReportCategory.CONVERSION_RATES]: TrendingUp,
  [ReportCategory.DEAL_ANALYSIS]: DollarSign,
  [ReportCategory.SALES_TARGETS]: TrendingUp,
}

export function SalesReportsDetailsView() {
  const { t } = useTranslation()

  const { reportId } = useParams({ strict: false })
  const navigate = useNavigate()
  const { data: report, isLoading } = useReport(reportId!)
  const generateReport = useGenerateReport()
  const deleteReport = useDeleteReport()

  const handleGenerate = async () => {
    if (!reportId) return
    try {
      await generateReport.mutateAsync(reportId)
      toast.success(t('sales.reports.createReport'))
    } catch {
      toast.error(t('sales.reports.createReport'))
    }
  }

  const handleDelete = async () => {
    if (!reportId) return
    if (confirm(t('sales.reports.deleteConfirm'))) {
      try {
        await deleteReport.mutateAsync(reportId)
        toast.success(t('sales.reports.delete'))
        navigate({ to: ROUTES.dashboard.sales.reports.list })
      } catch {
        toast.error(t('sales.reports.delete'))
      }
    }
  }

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, string> = {
      [ReportStatus.DRAFT]: 'bg-slate-100 text-slate-700',
      [ReportStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
      [ReportStatus.GENERATING]: 'bg-blue-100 text-blue-700',
      [ReportStatus.COMPLETED]: 'bg-green-100 text-green-700',
      [ReportStatus.FAILED]: 'bg-red-100 text-red-700',
      [ReportStatus.SCHEDULED]: 'bg-purple-100 text-purple-700',
    }
    return (
      <Badge className={`${variants[status]} border-0`}>
        {reportStatusLabels[status]?.ar || status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileBarChart className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">التقرير غير موجود</h3>
        <p className="text-slate-500 mb-4">لم يتم العثور على التقرير المطلوب</p>
        <Button asChild className="rounded-xl">
          <Link to={ROUTES.dashboard.sales.reports.list}>العودة للتقارير</Link>
        </Button>
      </div>
    )
  }

  const Icon = categoryIcons[report.category as ReportCategory] || FileBarChart

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link to={ROUTES.dashboard.sales.reports.list}>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Icon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">{report.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-500">
                  {reportCategoryLabels[report.category as ReportCategory]?.ar || report.category}
                </span>
                {getStatusBadge(report.status)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerate}
            className="rounded-xl"
            disabled={generateReport.isPending}
          >
            <RefreshCw className={`h-4 w-4 ms-2 ${generateReport.isPending ? 'animate-spin' : ''}`} />
            {generateReport.isPending ? t('sales.reports.regenerating') : t('sales.reports.regenerate')}
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4 ms-2" aria-hidden="true" />
            تحميل
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 ms-2" />
            حذف
          </Button>
        </div>
      </div>

      {/* Report Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-slate-500">تاريخ الإنشاء</p>
              <p className="font-medium text-navy">
                {new Date(report.createdAt).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-slate-500">آخر تحديث</p>
              <p className="font-medium text-navy">
                {new Date(report.updatedAt).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-slate-500">أنشأه</p>
              <p className="font-medium text-navy">{report.createdBy || t('sales.reports.notSpecified')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <FileBarChart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">الصيغة</p>
              <p className="font-medium text-navy">{report.config?.format || 'PDF'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="summary" className="rounded-lg">الملخص</TabsTrigger>
          <TabsTrigger value="charts" className="rounded-lg">الرسوم البيانية</TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg">البيانات التفصيلية</TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-navy mb-4">الملخص التنفيذي</h3>
            {report.description ? (
              <p className="text-slate-600">{report.description}</p>
            ) : (
              <p className="text-slate-500 italic">لا يوجد وصف متاح</p>
            )}

            {report.status === ReportStatus.COMPLETED && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">إجمالي المبيعات</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-800">--</p>
                  <p className="text-sm text-emerald-600">للفترة المحددة</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Users className="h-5 w-5" aria-hidden="true" />
                    <span className="font-medium">عدد الصفقات</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">--</p>
                  <p className="text-sm text-blue-600">صفقة مكتملة</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">متوسط قيمة الصفقة</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-800">--</p>
                  <p className="text-sm text-purple-600">ريال سعودي</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-navy mb-4">الرسوم البيانية</h3>
            {report.status === ReportStatus.COMPLETED ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-medium text-navy">المبيعات حسب الشهر</h4>
                  </div>
                  <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500">الرسم البياني سيظهر هنا</span>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-navy">توزيع المبيعات حسب المنتج</h4>
                  </div>
                  <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500">الرسم البياني سيظهر هنا</span>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <LineChart className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-navy">اتجاه الإيرادات</h4>
                  </div>
                  <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500">الرسم البياني سيظهر هنا</span>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium text-navy">أداء مندوبي المبيعات</h4>
                  </div>
                  <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500">الرسم البياني سيظهر هنا</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">قم بإنشاء التقرير لعرض الرسوم البيانية</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-navy mb-4">البيانات التفصيلية</h3>
            {report.status === ReportStatus.COMPLETED ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-end p-3 font-medium text-slate-600">الفترة</th>
                      <th className="text-end p-3 font-medium text-slate-600">المبيعات</th>
                      <th className="text-end p-3 font-medium text-slate-600">الصفقات</th>
                      <th className="text-end p-3 font-medium text-slate-600">النمو</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 text-slate-600" colSpan={4}>
                        <div className="text-center py-8 text-slate-500">
                          لا توجد بيانات متاحة
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileBarChart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">قم بإنشاء التقرير لعرض البيانات</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-navy mb-4">إعدادات التقرير</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">صيغة التقرير</p>
                  <p className="font-medium text-navy">{report.config?.format || 'PDF'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">تضمين الرسوم البيانية</p>
                  <p className="font-medium text-navy">
                    {report.config?.includeCharts ? t('sales.reports.yes') : t('sales.reports.no')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">تضمين الملخص</p>
                  <p className="font-medium text-navy">
                    {report.config?.includeSummary ? t('sales.reports.yes') : t('sales.reports.no')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">تضمين التفاصيل</p>
                  <p className="font-medium text-navy">
                    {report.config?.includeDetails ? t('sales.reports.yes') : t('sales.reports.no')}
                  </p>
                </div>
              </div>

              {report.config?.dataModules && report.config.dataModules.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">وحدات البيانات المضمنة</p>
                  <div className="flex flex-wrap gap-2">
                    {report.config.dataModules.map((module: string) => (
                      <Badge key={module} variant="secondary">
                        {dataModuleLabels[module as keyof typeof dataModuleLabels]?.ar || module}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.schedule?.enabled && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">الجدولة</p>
                  <p className="font-medium text-navy">
                    {report.schedule.frequency === 'daily' && 'يومي'}
                    {report.schedule.frequency === 'weekly' && 'أسبوعي'}
                    {report.schedule.frequency === 'monthly' && 'شهري'}
                    {report.schedule.frequency === 'quarterly' && 'ربع سنوي'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
