import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateReport, useUpdateReport, useReport, useDataSources } from '@/hooks/useReports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  Search, Bell, ArrowRight, User, Building2, CheckCircle,
  ChevronDown, Calendar, FileText, BarChart3, PieChart,
  Clock, Shield, MessageSquare, Users, Plus, Trash2,
  Database, Filter, Columns, Eye, Share2, Lock, Activity,
  LineChart, Settings
} from 'lucide-react'
import {
  reportStatusLabels,
  reportCategoryLabels,
  reportTypeLabels,
  reportFormatLabels,
  outputFormatLabels,
  usageFrequencyLabels,
  criticalityLevelLabels,
  dataSourceTypeLabels,
  dataRefreshRateLabels,
  accessLevelLabels,
  scheduleFrequencyLabels,
  chartTypeLabels,
  dataModuleLabels,
  ReportStatus,
  ReportCategory,
  ReportType,
  ReportFormat,
  OutputFormat,
  UsageFrequency,
  CriticalityLevel,
  DataSourceType,
  DataRefreshRate,
  AccessLevel,
  ScheduleFrequency,
  ChartType,
  DataModule,
  type CreateReportInput,
  type ReportColumn,
  type ReportChart,
} from '@/services/reportsService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '2-5 موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '6-20 موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '20+ موظف', icon: Building2 },
]

export function ReportsCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingReport, isLoading: isLoadingReport } = useReport(editId || '')
  const { data: dataSources } = useDataSources()
  const createMutation = useCreateReport()
  const updateMutation = useUpdateReport()

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Basic Fields
  const [reportCode, setReportCode] = useState('')
  const [reportName, setReportName] = useState('')
  const [reportNameAr, setReportNameAr] = useState('')
  const [reportTitle, setReportTitle] = useState('')
  const [reportTitleAr, setReportTitleAr] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reportDescriptionAr, setReportDescriptionAr] = useState('')

  // Classification
  const [reportCategory, setReportCategory] = useState<ReportCategory>(ReportCategory.EMPLOYEE_DATA)
  const [reportSubCategory, setReportSubCategory] = useState('')
  const [reportType, setReportType] = useState<ReportType>(ReportType.STANDARD)
  const [reportFormat, setReportFormat] = useState<ReportFormat>(ReportFormat.TABULAR)

  // Output
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([OutputFormat.PDF, OutputFormat.EXCEL])
  const [defaultOutputFormat, setDefaultOutputFormat] = useState<OutputFormat>(OutputFormat.PDF)

  // Tags
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Owner
  const [ownerId, setOwnerId] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerRole, setOwnerRole] = useState('')
  const [ownerDepartment, setOwnerDepartment] = useState('')

  // Usage
  const [usageFrequency, setUsageFrequency] = useState<UsageFrequency>(UsageFrequency.WEEKLY)
  const [criticalityLevel, setCriticalityLevel] = useState<CriticalityLevel>(CriticalityLevel.STANDARD)

  // Status
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.ACTIVE)

  // Data Source
  const [primarySourceType, setPrimarySourceType] = useState<DataSourceType>(DataSourceType.DATABASE)
  const [primarySourceName, setPrimarySourceName] = useState('')
  const [selectedDataModules, setSelectedDataModules] = useState<DataModule[]>([DataModule.EMPLOYEES])
  const [dataRefreshRate, setDataRefreshRate] = useState<DataRefreshRate>(DataRefreshRate.DAILY)

  // Access Control
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.INTERNAL)
  const [containsSensitiveData, setContainsSensitiveData] = useState(false)
  const [rowLevelSecurity, setRowLevelSecurity] = useState(false)
  const [columnLevelSecurity, setColumnLevelSecurity] = useState(false)
  const [encryptionRequired, setEncryptionRequired] = useState(false)
  const [logAccess, setLogAccess] = useState(true)
  const [logChanges, setLogChanges] = useState(true)
  const [logExports, setLogExports] = useState(true)

  // Scheduling
  const [scheduled, setScheduled] = useState(false)
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduleFrequency>(ScheduleFrequency.WEEKLY)
  const [scheduleStartDate, setScheduleStartDate] = useState('')
  const [scheduleEndDate, setScheduleEndDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('08:00')
  const [neverEnds, setNeverEnds] = useState(true)

  // Columns
  const [columns, setColumns] = useState<Partial<ReportColumn>[]>([])

  // Charts
  const [charts, setCharts] = useState<Partial<ReportChart>[]>([])

  // Export Options
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [pdfPageSize, setPdfPageSize] = useState<'A4' | 'A3' | 'letter' | 'legal'>('A4')
  const [pdfHeaderFooter, setPdfHeaderFooter] = useState(true)
  const [excelIncludeFormulas, setExcelIncludeFormulas] = useState(true)
  const [excelAutoFitColumns, setExcelAutoFitColumns] = useState(true)

  // Notes
  const [documentation, setDocumentation] = useState('')
  const [documentationAr, setDocumentationAr] = useState('')

  // Toggle section
  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter(s => s !== section))
    } else {
      setOpenSections([...openSections, section])
    }
  }

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  // Toggle output format
  const toggleOutputFormat = (format: OutputFormat) => {
    if (outputFormats.includes(format)) {
      setOutputFormats(outputFormats.filter(f => f !== format))
    } else {
      setOutputFormats([...outputFormats, format])
    }
  }

  // Toggle data module
  const toggleDataModule = (module: DataModule) => {
    if (selectedDataModules.includes(module)) {
      setSelectedDataModules(selectedDataModules.filter(m => m !== module))
    } else {
      setSelectedDataModules([...selectedDataModules, module])
    }
  }

  // Add column
  const addColumn = () => {
    setColumns([...columns, {
      columnName: '',
      columnNameAr: '',
      dataField: '',
      dataType: 'text',
      alignment: 'right',
      sortable: true,
      filterable: true,
      groupable: false,
      aggregatable: false,
      calculated: false,
      visible: true,
      frozen: false,
      displayOrder: columns.length + 1,
    }])
  }

  // Remove column
  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  // Update column
  const updateColumn = (index: number, field: keyof ReportColumn, value: any) => {
    const updated = [...columns]
    updated[index] = { ...updated[index], [field]: value }
    setColumns(updated)
  }

  // Add chart
  const addChart = () => {
    setCharts([...charts, {
      chartType: ChartType.BAR,
      chartTitle: '',
      chartTitleAr: '',
      dataSource: {
        xAxis: '',
        yAxis: '',
      },
      chartOptions: {
        showLegend: true,
        legendPosition: 'bottom',
        showDataLabels: true,
        showGrid: true,
      },
      displayOrder: charts.length + 1,
    }])
  }

  // Remove chart
  const removeChart = (index: number) => {
    setCharts(charts.filter((_, i) => i !== index))
  }

  // Update chart
  const updateChart = (index: number, field: string, value: any) => {
    const updated = [...charts]
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      updated[index] = {
        ...updated[index],
        [parent]: {
          ...(updated[index] as any)[parent],
          [child]: value
        }
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setCharts(updated)
  }

  // Populate form when editing
  useEffect(() => {
    if (existingReport && isEditMode) {
      setReportCode(existingReport.reportCode || '')
      setReportName(existingReport.reportName || '')
      setReportNameAr(existingReport.reportNameAr || '')
      setReportTitle(existingReport.reportTitle || '')
      setReportTitleAr(existingReport.reportTitleAr || '')
      setReportDescription(existingReport.reportDescription || '')
      setReportDescriptionAr(existingReport.reportDescriptionAr || '')
      setReportCategory(existingReport.reportCategory)
      setReportSubCategory(existingReport.reportSubCategory || '')
      setReportType(existingReport.reportType)
      setReportFormat(existingReport.reportFormat)
      setOutputFormats(existingReport.outputFormats || [OutputFormat.PDF])
      setDefaultOutputFormat(existingReport.defaultOutputFormat || OutputFormat.PDF)
      setTags(existingReport.tags || [])
      setOwnerId(existingReport.reportOwner?.ownerId || '')
      setOwnerName(existingReport.reportOwner?.ownerName || '')
      setOwnerRole(existingReport.reportOwner?.ownerRole || '')
      setOwnerDepartment(existingReport.reportOwner?.department || '')
      setUsageFrequency(existingReport.usageFrequency)
      setCriticalityLevel(existingReport.criticalityLevel)
      setStatus(existingReport.status)

      if (existingReport.dataSource) {
        if (existingReport.dataSource.primarySources?.[0]) {
          setPrimarySourceType(existingReport.dataSource.primarySources[0].sourceType)
          setPrimarySourceName(existingReport.dataSource.primarySources[0].sourceName)
        }
        if (existingReport.dataSource.dataModules) {
          setSelectedDataModules(existingReport.dataSource.dataModules.map(m => m.moduleName))
        }
        setDataRefreshRate(existingReport.dataSource.dataRefreshRate)
      }

      if (existingReport.accessControl) {
        setAccessLevel(existingReport.accessControl.accessLevel)
        setContainsSensitiveData(existingReport.accessControl.dataSecurity?.containsSensitiveData || false)
        setRowLevelSecurity(existingReport.accessControl.dataSecurity?.rowLevelSecurity || false)
        setColumnLevelSecurity(existingReport.accessControl.dataSecurity?.columnLevelSecurity || false)
        setEncryptionRequired(existingReport.accessControl.dataSecurity?.encryptionRequired || false)
        setLogAccess(existingReport.accessControl.auditLogging?.logAccess ?? true)
        setLogChanges(existingReport.accessControl.auditLogging?.logChanges ?? true)
        setLogExports(existingReport.accessControl.auditLogging?.logExports ?? true)
      }

      if (existingReport.scheduling) {
        setScheduled(existingReport.scheduling.scheduled)
        if (existingReport.scheduling.recurrence) {
          setScheduleFrequency(existingReport.scheduling.recurrence.frequency)
          setScheduleStartDate(existingReport.scheduling.recurrence.startDate?.split('T')[0] || '')
          setScheduleEndDate(existingReport.scheduling.recurrence.endDate?.split('T')[0] || '')
          setScheduleTime(existingReport.scheduling.recurrence.time || '08:00')
          setNeverEnds(existingReport.scheduling.recurrence.neverEnds)
        }
      }

      if (existingReport.reportStructure?.columns) {
        setColumns(existingReport.reportStructure.columns)
      }

      if (existingReport.visualization?.charts) {
        setCharts(existingReport.visualization.charts)
      }

      if (existingReport.exportFormat) {
        if (existingReport.exportFormat.pdfOptions) {
          setPdfOrientation(existingReport.exportFormat.pdfOptions.orientation)
          setPdfPageSize(existingReport.exportFormat.pdfOptions.pageSize)
          setPdfHeaderFooter(existingReport.exportFormat.pdfOptions.headerFooter)
        }
        if (existingReport.exportFormat.excelOptions) {
          setExcelIncludeFormulas(existingReport.exportFormat.excelOptions.includeFormulas)
          setExcelAutoFitColumns(existingReport.exportFormat.excelOptions.autoFitColumns)
        }
      }

      if (existingReport.documentation) {
        setDocumentation(existingReport.documentation.reportDocumentation || '')
        setDocumentationAr(existingReport.documentation.reportDocumentationAr || '')
      }
    }
  }, [existingReport, isEditMode])

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateReportInput = {
      reportCode,
      reportName,
      reportNameAr: reportNameAr || undefined,
      reportTitle: reportTitle || undefined,
      reportTitleAr: reportTitleAr || undefined,
      reportDescription: reportDescription || undefined,
      reportDescriptionAr: reportDescriptionAr || undefined,
      reportCategory,
      reportSubCategory: reportSubCategory || undefined,
      reportType,
      reportFormat,
      outputFormats,
      defaultOutputFormat,
      tags: tags.length > 0 ? tags : undefined,
      reportOwner: {
        ownerId: ownerId || 'current-user',
        ownerName: ownerName || 'المستخدم الحالي',
        ownerRole: ownerRole || undefined,
        department: ownerDepartment || undefined,
      },
      usageFrequency,
      criticalityLevel,
      status,
      dataSource: {
        primarySources: [{
          sourceType: primarySourceType,
          sourceName: primarySourceName || 'قاعدة البيانات الرئيسية',
        }],
        dataModules: selectedDataModules.map(m => ({
          moduleName: m,
          moduleFields: [],
        })),
        dataRefreshRate,
      },
      parametersFilters: {
        parameters: [],
        filters: [],
      },
      reportStructure: {
        columns: columns.filter(c => c.columnName).map((c, i) => ({
          columnName: c.columnName || '',
          columnNameAr: c.columnNameAr || '',
          dataField: c.dataField || '',
          dataType: c.dataType || 'text',
          alignment: c.alignment || 'right',
          sortable: c.sortable ?? true,
          filterable: c.filterable ?? true,
          groupable: c.groupable ?? false,
          aggregatable: c.aggregatable ?? false,
          calculated: c.calculated ?? false,
          visible: c.visible ?? true,
          frozen: c.frozen ?? false,
          displayOrder: i + 1,
        })) as ReportColumn[],
      },
      visualization: charts.length > 0 ? {
        charts: charts.filter(c => c.chartTitle).map((c, i) => ({
          chartType: c.chartType || ChartType.BAR,
          chartTitle: c.chartTitle || '',
          chartTitleAr: c.chartTitleAr || '',
          dataSource: {
            xAxis: c.dataSource?.xAxis || '',
            yAxis: c.dataSource?.yAxis || '',
          },
          chartOptions: {
            showLegend: c.chartOptions?.showLegend ?? true,
            legendPosition: c.chartOptions?.legendPosition || 'bottom',
            showDataLabels: c.chartOptions?.showDataLabels ?? true,
            showGrid: c.chartOptions?.showGrid ?? true,
          },
          displayOrder: i + 1,
        })) as ReportChart[],
      } : undefined,
      scheduling: scheduled ? {
        scheduled: true,
        scheduleType: 'recurring',
        recurrence: {
          frequency: scheduleFrequency,
          startDate: scheduleStartDate,
          endDate: neverEnds ? undefined : scheduleEndDate,
          neverEnds,
          time: scheduleTime,
        },
        scheduleStatus: 'active',
        executionHistory: [],
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      } : undefined,
      accessControl: {
        accessLevel,
        allowedRoles: [],
        dataSecurity: {
          rowLevelSecurity,
          columnLevelSecurity,
          containsSensitiveData,
          encryptionRequired,
        },
        auditLogging: {
          logAccess,
          logChanges,
          logExports,
        },
      },
      exportFormat: {
        availableFormats: outputFormats,
        defaultFormat: defaultOutputFormat,
        pdfOptions: {
          orientation: pdfOrientation,
          pageSize: pdfPageSize,
          headerFooter: pdfHeaderFooter,
        },
        excelOptions: {
          includeFormulas: excelIncludeFormulas,
          includeFormatting: true,
          autoFitColumns: excelAutoFitColumns,
          freezePanes: true,
        },
      },
      documentation: (documentation || documentationAr) ? {
        reportDocumentation: documentation,
        reportDocumentationAr: documentationAr || undefined,
      } : undefined,
      createdBy: 'current-user',
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        id: editId,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/reports' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التقارير', href: '/dashboard/hr/reports', isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title={isEditMode ? 'تعديل التقرير' : 'إنشاء تقرير'}
          type="reports"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-white"
                onClick={() => navigate({ to: '/dashboard/hr/reports' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل التقرير' : 'إنشاء تقرير جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات التقرير' : 'إضافة تقرير جديد للموارد البشرية'}
                </p>
              </div>
            </div>

            {/* OFFICE TYPE SELECTOR */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  نوع المكتب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {OFFICE_TYPES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOfficeType(option.value as OfficeType)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        officeType === option.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <option.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium block">{option.labelAr}</span>
                      <span className="text-xs opacity-75">{option.descriptionAr}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* BASIC INFORMATION */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      كود التقرير <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={reportCode}
                      onChange={(e) => setReportCode(e.target.value)}
                      placeholder="مثال: RPT-HR-001"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الحالة <span className="text-red-500">*</span>
                    </Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(reportStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      اسم التقرير (English) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Employee Summary Report"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      اسم التقرير (عربي)
                    </Label>
                    <Input
                      value={reportNameAr}
                      onChange={(e) => setReportNameAr(e.target.value)}
                      placeholder="تقرير ملخص الموظفين"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">وصف التقرير</Label>
                  <Textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="وصف مختصر للتقرير..."
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* CLASSIFICATION */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  التصنيف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الفئة <span className="text-red-500">*</span>
                    </Label>
                    <Select value={reportCategory} onValueChange={(v) => setReportCategory(v as ReportCategory)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(reportCategoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الفئة الفرعية</Label>
                    <Input
                      value={reportSubCategory}
                      onChange={(e) => setReportSubCategory(e.target.value)}
                      placeholder="فئة فرعية (اختياري)"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      النوع <span className="text-red-500">*</span>
                    </Label>
                    <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(reportTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      التنسيق <span className="text-red-500">*</span>
                    </Label>
                    <Select value={reportFormat} onValueChange={(v) => setReportFormat(v as ReportFormat)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(reportFormatLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">التكرار</Label>
                    <Select value={usageFrequency} onValueChange={(v) => setUsageFrequency(v as UsageFrequency)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(usageFrequencyLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الأهمية</Label>
                    <Select value={criticalityLevel} onValueChange={(v) => setCriticalityLevel(v as CriticalityLevel)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(criticalityLevelLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DATA SOURCE */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  مصدر البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نوع المصدر</Label>
                    <Select value={primarySourceType} onValueChange={(v) => setPrimarySourceType(v as DataSourceType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(dataSourceTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">معدل التحديث</Label>
                    <Select value={dataRefreshRate} onValueChange={(v) => setDataRefreshRate(v as DataRefreshRate)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(dataRefreshRateLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">الوحدات المختارة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(dataModuleLabels).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleDataModule(key as DataModule)}
                        className={cn(
                          "p-2 rounded-xl border text-sm transition-all",
                          selectedDataModules.includes(key as DataModule)
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        {label.ar}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OUTPUT FORMATS */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-500" />
                  صيغ الإخراج
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">الصيغ المتاحة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(outputFormatLabels).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleOutputFormat(key as OutputFormat)}
                        className={cn(
                          "p-2 rounded-xl border text-sm transition-all",
                          outputFormats.includes(key as OutputFormat)
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        {label.ar}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">الصيغة الافتراضية</Label>
                  <Select value={defaultOutputFormat} onValueChange={(v) => setDefaultOutputFormat(v as OutputFormat)}>
                    <SelectTrigger className="h-11 rounded-xl max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outputFormats.map((format) => (
                        <SelectItem key={format} value={format}>
                          {outputFormatLabels[format]?.ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* ACCESS CONTROL */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-500" />
                  التحكم في الوصول
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">مستوى الوصول</Label>
                  <Select value={accessLevel} onValueChange={(v) => setAccessLevel(v as AccessLevel)}>
                    <SelectTrigger className="h-11 rounded-xl max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accessLevelLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">بيانات حساسة</span>
                    <Switch checked={containsSensitiveData} onCheckedChange={setContainsSensitiveData} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">تشفير مطلوب</span>
                    <Switch checked={encryptionRequired} onCheckedChange={setEncryptionRequired} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">أمان الصفوف</span>
                    <Switch checked={rowLevelSecurity} onCheckedChange={setRowLevelSecurity} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">أمان الأعمدة</span>
                    <Switch checked={columnLevelSecurity} onCheckedChange={setColumnLevelSecurity} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* COLUMNS - Advanced */}
            <Collapsible open={openSections.includes('columns')} onOpenChange={() => toggleSection('columns')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Columns className="w-5 h-5 text-blue-500" />
                        أعمدة التقرير
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('columns') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {columns.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Columns className="w-12 h-12 mx-auto mb-2 opacity-70" />
                        <p>لم تتم إضافة أعمدة</p>
                      </div>
                    ) : (
                      columns.map((column, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">عمود {index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeColumn(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">اسم العمود</Label>
                              <Input
                                value={column.columnName || ''}
                                onChange={(e) => updateColumn(index, 'columnName', e.target.value)}
                                placeholder="Column Name"
                                className="h-11 rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">اسم العمود (عربي)</Label>
                              <Input
                                value={column.columnNameAr || ''}
                                onChange={(e) => updateColumn(index, 'columnNameAr', e.target.value)}
                                placeholder="اسم العمود"
                                className="h-11 rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">حقل البيانات</Label>
                              <Input
                                value={column.dataField || ''}
                                onChange={(e) => updateColumn(index, 'dataField', e.target.value)}
                                placeholder="employee.name"
                                className="h-11 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addColumn}
                      className="w-full rounded-xl"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      إضافة عمود
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* CHARTS - Advanced */}
            <Collapsible open={openSections.includes('charts')} onOpenChange={() => toggleSection('charts')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" />
                        الرسوم البيانية
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('charts') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {charts.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <PieChart className="w-12 h-12 mx-auto mb-2 opacity-70" />
                        <p>لم تتم إضافة رسوم بيانية</p>
                      </div>
                    ) : (
                      charts.map((chart, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">رسم بياني {index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChart(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">النوع</Label>
                              <Select
                                value={chart.chartType}
                                onValueChange={(v) => updateChart(index, 'chartType', v)}
                              >
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(chartTypeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">العنوان</Label>
                              <Input
                                value={chart.chartTitle || ''}
                                onChange={(e) => updateChart(index, 'chartTitle', e.target.value)}
                                placeholder="عنوان الرسم البياني"
                                className="h-11 rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">محور X</Label>
                              <Input
                                value={chart.dataSource?.xAxis || ''}
                                onChange={(e) => updateChart(index, 'dataSource.xAxis', e.target.value)}
                                placeholder="department"
                                className="h-11 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addChart}
                      className="w-full rounded-xl"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      إضافة رسم بياني
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* SCHEDULING - Advanced */}
            <Collapsible open={openSections.includes('scheduling')} onOpenChange={() => toggleSection('scheduling')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                        الجدولة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('scheduling') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">تفعيل الجدولة</span>
                      <Switch checked={scheduled} onCheckedChange={setScheduled} />
                    </div>

                    {scheduled && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">التكرار</Label>
                            <Select value={scheduleFrequency} onValueChange={(v) => setScheduleFrequency(v as ScheduleFrequency)}>
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(scheduleFrequencyLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">تاريخ البدء</Label>
                            <Input
                              type="date"
                              value={scheduleStartDate}
                              onChange={(e) => setScheduleStartDate(e.target.value)}
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">الوقت</Label>
                            <Input
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="h-11 rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">بدون تاريخ انتهاء</span>
                          <Switch checked={neverEnds} onCheckedChange={setNeverEnds} />
                        </div>
                        {!neverEnds && (
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">تاريخ الانتهاء</Label>
                            <Input
                              type="date"
                              value={scheduleEndDate}
                              onChange={(e) => setScheduleEndDate(e.target.value)}
                              className="h-11 rounded-xl max-w-xs"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* EXPORT OPTIONS - Advanced */}
            <Collapsible open={openSections.includes('export')} onOpenChange={() => toggleSection('export')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500" aria-hidden="true" />
                        خيارات التصدير
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('export') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-xl space-y-4">
                      <h4 className="font-medium text-red-800">خيارات PDF</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">الاتجاه</Label>
                          <Select value={pdfOrientation} onValueChange={(v) => setPdfOrientation(v as 'portrait' | 'landscape')}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">عمودي</SelectItem>
                              <SelectItem value="landscape">أفقي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">حجم الصفحة</Label>
                          <Select value={pdfPageSize} onValueChange={(v) => setPdfPageSize(v as any)}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A3">A3</SelectItem>
                              <SelectItem value="letter">Letter</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                          <span className="text-sm text-slate-700">رأس وتذييل</span>
                          <Switch checked={pdfHeaderFooter} onCheckedChange={setPdfHeaderFooter} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl space-y-4">
                      <h4 className="font-medium text-green-800">خيارات Excel</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                          <span className="text-sm text-slate-700">تضمين الصيغ</span>
                          <Switch checked={excelIncludeFormulas} onCheckedChange={setExcelIncludeFormulas} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                          <span className="text-sm text-slate-700">ضبط عرض الأعمدة</span>
                          <Switch checked={excelAutoFitColumns} onCheckedChange={setExcelAutoFitColumns} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* AUDIT LOGGING - Advanced */}
            <Collapsible open={openSections.includes('audit')} onOpenChange={() => toggleSection('audit')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                        سجل التدقيق
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('audit') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">تسجيل الوصول</span>
                        <Switch checked={logAccess} onCheckedChange={setLogAccess} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">تسجيل التغييرات</span>
                        <Switch checked={logChanges} onCheckedChange={setLogChanges} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">تسجيل التصدير</span>
                        <Switch checked={logExports} onCheckedChange={setLogExports} />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* DOCUMENTATION - Advanced */}
            <Collapsible open={openSections.includes('documentation')} onOpenChange={() => toggleSection('documentation')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                        التوثيق
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('documentation') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">توثيق التقرير (English)</Label>
                      <Textarea
                        value={documentation}
                        onChange={(e) => setDocumentation(e.target.value)}
                        placeholder="Report documentation and usage instructions..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">توثيق التقرير (عربي)</Label>
                      <Textarea
                        value={documentationAr}
                        onChange={(e) => setDocumentationAr(e.target.value)}
                        placeholder="توثيق التقرير وإرشادات الاستخدام..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/dashboard/hr/reports' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'إنشاء التقرير'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="reports" />
        </div>
      </Main>
    </>
  )
}
