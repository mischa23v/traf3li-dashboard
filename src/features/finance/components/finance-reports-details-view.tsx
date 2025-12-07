import { FinanceSidebar } from './finance-sidebar'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  useReport,
  useDeleteReport,
  useRunReport,
  useExportReport,
  useAddToFavorites,
  useRemoveFromFavorites,
  useDuplicateReport,
  usePauseSchedule,
  useResumeSchedule,
  useExecutionHistory,
} from '@/hooks/useReports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Search, Bell, ArrowRight, Calendar,
  AlertCircle, Loader2, FileText,
  Trash2, Edit, MoreHorizontal, Play,
  Download, Copy, Share2, Star, StarOff,
  Clock, Shield, BarChart3, PieChart,
  Database, Users, Eye, Pause, Activity,
  CheckCircle, XCircle, LineChart, DollarSign,
  Receipt, CreditCard, Wallet, TrendingUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  reportStatusLabels,
  reportCategoryLabels,
  reportTypeLabels,
  reportFormatLabels,
  outputFormatLabels,
  usageFrequencyLabels,
  criticalityLevelLabels,
  accessLevelLabels,
  scheduleStatusLabels,
  scheduleFrequencyLabels,
  executionStatusLabels,
  dataModuleLabels,
  chartTypeLabels,
  ReportStatus,
  ExecutionStatus,
  ScheduleStatus,
  OutputFormat,
  ReportCategory,
} from '@/services/reportsService'

export function FinanceReportsDetailsView() {
  const navigate = useNavigate()
  const { reportId } = useParams({ strict: false })

  const { data: report, isLoading, error } = useReport(reportId || '')
  const { data: executionHistory } = useExecutionHistory(reportId || '')
  const deleteMutation = useDeleteReport()
  const runMutation = useRunReport()
  const exportMutation = useExportReport()
  const addFavoriteMutation = useAddToFavorites()
  const removeFavoriteMutation = useRemoveFromFavorites()
  const duplicateMutation = useDuplicateReport()
  const pauseMutation = usePauseSchedule()
  const resumeMutation = useResumeSchedule()

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'التقارير المالية', href: '/dashboard/finance/reports', isActive: true },
  ]

  const getStatusColor = (status: ReportStatus) => {
    const colors: Record<ReportStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      inactive: 'bg-slate-100 text-slate-700 border-slate-200',
      draft: 'bg-amber-100 text-amber-700 border-amber-200',
      archived: 'bg-blue-100 text-blue-700 border-blue-200',
      deprecated: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status]
  }

  const getScheduleStatusColor = (status: ScheduleStatus) => {
    const colors: Record<ScheduleStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      paused: 'bg-amber-100 text-amber-700',
      expired: 'bg-slate-100 text-slate-700',
      completed: 'bg-blue-100 text-blue-700',
    }
    return colors[status]
  }

  const getExecutionStatusColor = (status: ExecutionStatus) => {
    const colors: Record<ExecutionStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      running: 'bg-amber-100 text-amber-700',
      completed: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-100 text-slate-700',
    }
    return colors[status]
  }

  const getCategoryIcon = (category: ReportCategory) => {
    const icons: Record<string, any> = {
      invoices: Receipt,
      expenses: CreditCard,
      payments: Wallet,
      revenue: TrendingUp,
      cash_flow: Activity,
      budgets: PieChart,
      financial_statements: FileText,
      tax: DollarSign,
    }
    return icons[category] || FileText
  }

  const handleRunReport = async () => {
    if (!reportId) return
    await runMutation.mutateAsync({ id: reportId })
  }

  const handleExport = async (format: OutputFormat) => {
    if (!reportId) return
    await exportMutation.mutateAsync({ id: reportId, format })
  }

  const handleToggleFavorite = async () => {
    if (!reportId) return
    if (report?.isFavorite) {
      await removeFavoriteMutation.mutateAsync(reportId)
    } else {
      await addFavoriteMutation.mutateAsync(reportId)
    }
  }

  const handleDuplicate = async () => {
    if (!reportId || !report) return
    await duplicateMutation.mutateAsync({
      id: reportId,
      newName: `${report.reportName} - نسخة`,
    })
  }

  const handleToggleSchedule = async () => {
    if (!reportId || !report?.scheduling) return
    if (report.scheduling.scheduleStatus === ScheduleStatus.ACTIVE) {
      await pauseMutation.mutateAsync(reportId)
    } else {
      await resumeMutation.mutateAsync(reportId)
    }
  }

  const handleDelete = async () => {
    if (!reportId) return
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      await deleteMutation.mutateAsync(reportId)
      navigate({ to: '/dashboard/finance/reports' })
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="المالية"
          title="تفاصيل التقرير"
          type="finance-reports"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Loading/Error States */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">جاري تحميل البيانات...</p>
                </CardContent>
              </Card>
            ) : error || !report ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" aria-hidden="true" />
                  <p className="text-red-600">حدث خطأ في تحميل بيانات التقرير</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/finance/reports' })}
                    className="mt-4"
                  >
                    العودة للقائمة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Page Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-white"
                      onClick={() => navigate({ to: '/dashboard/finance/reports' })}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-navy">
                          {report.reportNameAr || report.reportName}
                        </h1>
                        <Badge className={getStatusColor(report.status)}>
                          {reportStatusLabels[report.status]?.ar}
                        </Badge>
                        {report.isFavorite && (
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-slate-500">
                        {report.reportCode} - {reportCategoryLabels[report.reportCategory]?.ar}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleRunReport}
                      disabled={runMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    >
                      <Play className="w-4 h-4 ms-1" />
                      تشغيل
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Download className="w-4 h-4 ms-1" aria-hidden="true" />
                          تصدير
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {report.outputFormats.map((format) => (
                          <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
                            {outputFormatLabels[format]?.ar || format}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl"
                      onClick={handleToggleFavorite}
                    >
                      {report.isFavorite ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-xl">
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/finance/reports/new?editId=${reportId}` })}>
                          <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDuplicate}>
                          <Copy className="w-4 h-4 ms-2" aria-hidden="true" />
                          نسخ
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 ms-2" />
                          مشاركة
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                          <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <Play className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">مرات التشغيل</p>
                          <p className="text-lg font-bold text-navy">{report.runCount || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">نجاح</p>
                          <p className="text-lg font-bold text-navy">
                            {report.scheduling?.successfulRuns || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">فشل</p>
                          <p className="text-lg font-bold text-navy">
                            {report.scheduling?.failedRuns || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">متوسط الوقت</p>
                          <p className="text-lg font-bold text-navy">
                            {report.performance?.performanceMetrics?.averageExecutionTime
                              ? `${(report.performance.performanceMetrics.averageExecutionTime / 1000).toFixed(1)}ث`
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 rounded-xl bg-slate-100 p-1">
                    <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="structure" className="rounded-lg">الهيكل</TabsTrigger>
                    <TabsTrigger value="schedule" className="rounded-lg">الجدولة</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg">السجل</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Report Info */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                          معلومات التقرير
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">الاسم (English)</p>
                            <p className="font-medium">{report.reportName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">الاسم (عربي)</p>
                            <p className="font-medium">{report.reportNameAr || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">الكود</p>
                            <p className="font-medium">{report.reportCode}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">الإصدار</p>
                            <p className="font-medium">{report.version || '1.0'}</p>
                          </div>
                        </div>
                        {report.reportDescription && (
                          <div>
                            <p className="text-xs text-slate-500">الوصف</p>
                            <p className="text-sm text-slate-700">{report.reportDescription}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Classification */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          التصنيف
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">الفئة</p>
                            <Badge className="mt-1 bg-blue-100 text-blue-700">
                              {reportCategoryLabels[report.reportCategory]?.ar}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">النوع</p>
                            <Badge className="mt-1 bg-purple-100 text-purple-700">
                              {reportTypeLabels[report.reportType]?.ar}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">التنسيق</p>
                            <Badge className="mt-1 bg-emerald-100 text-emerald-700">
                              {reportFormatLabels[report.reportFormat]?.ar}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">الأهمية</p>
                            <Badge className="mt-1 bg-amber-100 text-amber-700">
                              {criticalityLevelLabels[report.criticalityLevel]?.ar}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Data Source */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Database className="w-5 h-5 text-purple-500" />
                          مصدر البيانات
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">معدل التحديث</p>
                            <p className="font-medium">
                              {report.dataSource?.dataRefreshRate ?
                                (report.dataSource.dataRefreshRate === 'real_time' ? 'فوري' :
                                 report.dataSource.dataRefreshRate === 'hourly' ? 'كل ساعة' :
                                 report.dataSource.dataRefreshRate === 'daily' ? 'يومي' :
                                 report.dataSource.dataRefreshRate === 'weekly' ? 'أسبوعي' : 'حسب الطلب')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">آخر تحديث</p>
                            <p className="font-medium">
                              {report.dataSource?.lastDataRefresh
                                ? new Date(report.dataSource.lastDataRefresh).toLocaleDateString('ar-SA')
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-2">الوحدات المستخدمة</p>
                          <div className="flex flex-wrap gap-2">
                            {report.dataSource?.dataModules?.map((module, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {dataModuleLabels[module.moduleName]?.ar || module.moduleName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Access Control */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-500" />
                          التحكم في الوصول
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">مستوى الوصول</p>
                            <Badge className="mt-1 bg-red-100 text-red-700">
                              {accessLevelLabels[report.accessControl.accessLevel]?.ar}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500">بيانات حساسة</p>
                            {report.accessControl.dataSecurity?.containsSensitiveData ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500">تشفير</p>
                            {report.accessControl.dataSecurity?.encryptionRequired ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-500">تسجيل الوصول</p>
                            {report.accessControl.auditLogging?.logAccess ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Owner Info */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Users className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                          المالك
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">الاسم</p>
                            <p className="font-medium">{report.reportOwner.ownerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">الدور</p>
                            <p className="font-medium">{report.reportOwner.ownerRole || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">القسم</p>
                            <p className="font-medium">{report.reportOwner.department || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">التكرار</p>
                            <p className="font-medium">{usageFrequencyLabels[report.usageFrequency]?.ar}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Structure Tab */}
                  <TabsContent value="structure" className="space-y-6 mt-6">
                    {/* Columns */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <LineChart className="w-5 h-5 text-blue-500" />
                          الأعمدة ({report.reportStructure?.columns?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {report.reportStructure?.columns && report.reportStructure.columns.length > 0 ? (
                          <div className="space-y-2">
                            {report.reportStructure.columns.map((column, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div>
                                  <p className="font-medium">{column.columnNameAr || column.columnName}</p>
                                  <p className="text-xs text-slate-500">{column.dataField}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{column.dataType}</Badge>
                                  {column.sortable && <Badge className="text-xs bg-blue-100 text-blue-700">قابل للفرز</Badge>}
                                  {column.filterable && <Badge className="text-xs bg-purple-100 text-purple-700">قابل للتصفية</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-slate-500 py-4">لم يتم تحديد أعمدة</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Charts */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <PieChart className="w-5 h-5 text-purple-500" />
                          الرسوم البيانية ({report.visualization?.charts?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {report.visualization?.charts && report.visualization.charts.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.visualization.charts.map((chart, i) => (
                              <div key={i} className="p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-purple-100 text-purple-700">
                                    {chartTypeLabels[chart.chartType]?.ar}
                                  </Badge>
                                </div>
                                <p className="font-medium">{chart.chartTitleAr || chart.chartTitle}</p>
                                <p className="text-xs text-slate-500">
                                  X: {chart.dataSource.xAxis} | Y: {Array.isArray(chart.dataSource.yAxis) ? chart.dataSource.yAxis.join(', ') : chart.dataSource.yAxis}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-slate-500 py-4">لم يتم تحديد رسوم بيانية</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Output Formats */}
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Download className="w-5 h-5 text-amber-500" aria-hidden="true" />
                          صيغ الإخراج
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {report.outputFormats.map((format) => (
                            <Badge
                              key={format}
                              className={format === report.defaultOutputFormat
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                              }
                            >
                              {outputFormatLabels[format]?.ar}
                              {format === report.defaultOutputFormat && ' (افتراضي)'}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Schedule Tab */}
                  <TabsContent value="schedule" className="space-y-6 mt-6">
                    {report.scheduling?.scheduled ? (
                      <>
                        <Card className="rounded-2xl border-slate-100">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                إعدادات الجدولة
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge className={getScheduleStatusColor(report.scheduling.scheduleStatus)}>
                                  {scheduleStatusLabels[report.scheduling.scheduleStatus]?.ar}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleToggleSchedule}
                                  className="rounded-xl"
                                >
                                  {report.scheduling.scheduleStatus === ScheduleStatus.ACTIVE ? (
                                    <>
                                      <Pause className="w-4 h-4 ms-1" />
                                      إيقاف
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 ms-1" />
                                      استئناف
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-xs text-slate-500">التكرار</p>
                                <p className="font-medium">
                                  {report.scheduling.recurrence?.frequency
                                    ? scheduleFrequencyLabels[report.scheduling.recurrence.frequency]?.ar
                                    : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">تاريخ البدء</p>
                                <p className="font-medium">
                                  {report.scheduling.recurrence?.startDate
                                    ? new Date(report.scheduling.recurrence.startDate).toLocaleDateString('ar-SA')
                                    : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">الوقت</p>
                                <p className="font-medium">{report.scheduling.recurrence?.time || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">التشغيل التالي</p>
                                <p className="font-medium">
                                  {report.scheduling.nextRunDate
                                    ? new Date(report.scheduling.nextRunDate).toLocaleDateString('ar-SA')
                                    : '-'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card className="rounded-2xl border-slate-100">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-emerald-500" />
                              إحصائيات التشغيل
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <p className="text-3xl font-bold text-navy">{report.scheduling.totalRuns}</p>
                                <p className="text-sm text-slate-500">إجمالي التشغيل</p>
                              </div>
                              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                                <p className="text-3xl font-bold text-emerald-600">{report.scheduling.successfulRuns}</p>
                                <p className="text-sm text-slate-500">ناجح</p>
                              </div>
                              <div className="text-center p-4 bg-red-50 rounded-xl">
                                <p className="text-3xl font-bold text-red-600">{report.scheduling.failedRuns}</p>
                                <p className="text-sm text-slate-500">فشل</p>
                              </div>
                            </div>
                            {report.scheduling.totalRuns > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span>نسبة النجاح</span>
                                  <span className="font-medium">
                                    {((report.scheduling.successfulRuns / report.scheduling.totalRuns) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={(report.scheduling.successfulRuns / report.scheduling.totalRuns) * 100}
                                  className="h-2"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card className="rounded-2xl border-slate-100">
                        <CardContent className="p-8 text-center">
                          <Clock className="w-12 h-12 mx-auto text-slate-300 mb-4" aria-hidden="true" />
                          <p className="text-slate-500">لم يتم تفعيل الجدولة لهذا التقرير</p>
                          <Button
                            variant="outline"
                            className="mt-4 rounded-xl"
                            onClick={() => navigate({ to: `/dashboard/finance/reports/new?editId=${reportId}` })}
                          >
                            تفعيل الجدولة
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history" className="space-y-6 mt-6">
                    <Card className="rounded-2xl border-slate-100">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                          سجل التشغيل
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {executionHistory && executionHistory.length > 0 ? (
                          <div className="space-y-3">
                            {executionHistory.map((execution) => (
                              <div
                                key={execution.executionId}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                              >
                                <div className="flex items-center gap-3">
                                  {execution.status === ExecutionStatus.COMPLETED ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                  ) : execution.status === ExecutionStatus.FAILED ? (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  ) : execution.status === ExecutionStatus.RUNNING ? (
                                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                  )}
                                  <div>
                                    <p className="font-medium">
                                      {execution.actualRunTime
                                        ? new Date(execution.actualRunTime).toLocaleString('ar-SA')
                                        : new Date(execution.scheduledTime).toLocaleString('ar-SA')}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {execution.recordsProcessed
                                        ? `${execution.recordsProcessed} سجل`
                                        : execution.errorMessage || '-'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getExecutionStatusColor(execution.status)}>
                                    {executionStatusLabels[execution.status]?.ar}
                                  </Badge>
                                  {execution.duration && (
                                    <span className="text-xs text-slate-500">
                                      {(execution.duration / 1000).toFixed(1)}ث
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : report.scheduling?.executionHistory && report.scheduling.executionHistory.length > 0 ? (
                          <div className="space-y-3">
                            {report.scheduling.executionHistory.slice(0, 10).map((execution) => (
                              <div
                                key={execution.executionId}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                              >
                                <div className="flex items-center gap-3">
                                  {execution.status === ExecutionStatus.COMPLETED ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                  ) : execution.status === ExecutionStatus.FAILED ? (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                  )}
                                  <div>
                                    <p className="font-medium">
                                      {execution.actualRunTime
                                        ? new Date(execution.actualRunTime).toLocaleString('ar-SA')
                                        : new Date(execution.scheduledTime).toLocaleString('ar-SA')}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {execution.recordsProcessed
                                        ? `${execution.recordsProcessed} سجل`
                                        : '-'}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={getExecutionStatusColor(execution.status)}>
                                  {executionStatusLabels[execution.status]?.ar}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-slate-500 py-8">لا يوجد سجل تشغيل</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Audit Trail */}
                    {report.complianceAudit?.auditTrail && report.complianceAudit.auditTrail.length > 0 && (
                      <Card className="rounded-2xl border-slate-100">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-500" />
                            سجل التدقيق
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {report.complianceAudit.auditTrail.slice(0, 10).map((entry) => (
                              <div
                                key={entry.auditId}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                              >
                                <div>
                                  <p className="font-medium text-sm">{entry.performedByName || entry.performedBy}</p>
                                  <p className="text-xs text-slate-500">{entry.details}</p>
                                </div>
                                <div className="text-left">
                                  <Badge variant="outline" className="text-xs">
                                    {entry.actionType === 'created' ? 'إنشاء' :
                                     entry.actionType === 'modified' ? 'تعديل' :
                                     entry.actionType === 'executed' ? 'تشغيل' :
                                     entry.actionType === 'exported' ? 'تصدير' :
                                     entry.actionType === 'scheduled' ? 'جدولة' :
                                     entry.actionType === 'shared' ? 'مشاركة' :
                                     entry.actionType === 'deleted' ? 'حذف' : 'وصول'}
                                  </Badge>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {new Date(entry.actionDate).toLocaleString('ar-SA')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Sidebar */}
          <FinanceSidebar context="reports" />
        </div>
      </Main>
    </>
  )
}
