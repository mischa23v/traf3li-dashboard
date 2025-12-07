import { CrmSidebar } from './crm-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateReport, useUpdateReport, useReport } from '@/hooks/useReports'
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
import { cn } from '@/lib/utils'
import {
  Search, Bell, ArrowRight, User, Building2, CheckCircle,
  FileText, BarChart3, Clock, Shield, Users, UserPlus
} from 'lucide-react'
import {
  reportStatusLabels,
  reportCategoryLabels,
  reportTypeLabels,
  reportFormatLabels,
  outputFormatLabels,
  usageFrequencyLabels,
  accessLevelLabels,
  dataModuleLabels,
  ReportStatus,
  ReportCategory,
  ReportType,
  ReportFormat,
  OutputFormat,
  UsageFrequency,
  CriticalityLevel,
  AccessLevel,
  DataModule,
  ReportSection,
  categoriesBySection,
  dataModulesBySection,
  type CreateReportInput,
} from '@/services/reportsService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '2-5 موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '6-20 موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '20+ موظف', icon: Building2 },
]

export function CrmReportsCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingReport } = useReport(editId || '')
  const createMutation = useCreateReport()
  const updateMutation = useUpdateReport()

  const crmCategories = categoriesBySection[ReportSection.CRM]
  const crmDataModules = dataModulesBySection[ReportSection.CRM]

  const [officeType, setOfficeType] = useState<OfficeType>('solo')
  const [reportCode, setReportCode] = useState('')
  const [reportName, setReportName] = useState('')
  const [reportNameAr, setReportNameAr] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reportCategory, setReportCategory] = useState<ReportCategory>(ReportCategory.CLIENTS)
  const [reportType, setReportType] = useState<ReportType>(ReportType.STANDARD)
  const [reportFormat, setReportFormat] = useState<ReportFormat>(ReportFormat.TABULAR)
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([OutputFormat.PDF, OutputFormat.EXCEL])
  const [defaultOutputFormat, setDefaultOutputFormat] = useState<OutputFormat>(OutputFormat.PDF)
  const [usageFrequency, setUsageFrequency] = useState<UsageFrequency>(UsageFrequency.WEEKLY)
  const [criticalityLevel, setCriticalityLevel] = useState<CriticalityLevel>(CriticalityLevel.STANDARD)
  const [status, setStatus] = useState<ReportStatus>(ReportStatus.ACTIVE)
  const [selectedDataModules, setSelectedDataModules] = useState<DataModule[]>([DataModule.CLIENTS])
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.SALES)
  const [scheduled, setScheduled] = useState(false)
  const [ownerName, setOwnerName] = useState('')

  const toggleOutputFormat = (format: OutputFormat) => {
    if (outputFormats.includes(format)) {
      setOutputFormats(outputFormats.filter(f => f !== format))
    } else {
      setOutputFormats([...outputFormats, format])
    }
  }

  const toggleDataModule = (module: DataModule) => {
    if (selectedDataModules.includes(module)) {
      setSelectedDataModules(selectedDataModules.filter(m => m !== module))
    } else {
      setSelectedDataModules([...selectedDataModules, module])
    }
  }

  useEffect(() => {
    if (existingReport && isEditMode) {
      setReportCode(existingReport.reportCode || '')
      setReportName(existingReport.reportName || '')
      setReportNameAr(existingReport.reportNameAr || '')
      setReportDescription(existingReport.reportDescription || '')
      setReportCategory(existingReport.reportCategory)
      setReportType(existingReport.reportType)
      setReportFormat(existingReport.reportFormat)
      setOutputFormats(existingReport.outputFormats || [OutputFormat.PDF])
      setDefaultOutputFormat(existingReport.defaultOutputFormat || OutputFormat.PDF)
      setUsageFrequency(existingReport.usageFrequency)
      setCriticalityLevel(existingReport.criticalityLevel)
      setStatus(existingReport.status)
      setOwnerName(existingReport.reportOwner?.ownerName || '')
      setAccessLevel(existingReport.accessControl?.accessLevel || AccessLevel.SALES)
      setScheduled(existingReport.scheduling?.scheduled || false)
      if (existingReport.dataSource?.dataModules) {
        setSelectedDataModules(existingReport.dataSource.dataModules.map(m => m.moduleName))
      }
    }
  }, [existingReport, isEditMode])

  const handleSubmit = async () => {
    const data: CreateReportInput = {
      reportCode,
      reportName,
      reportNameAr: reportNameAr || undefined,
      reportDescription: reportDescription || undefined,
      reportSection: ReportSection.CRM,
      reportCategory,
      reportType,
      reportFormat,
      outputFormats,
      defaultOutputFormat,
      reportOwner: {
        ownerId: 'current-user',
        ownerName: ownerName || 'المستخدم الحالي',
      },
      usageFrequency,
      criticalityLevel,
      status,
      dataSource: {
        primarySources: [{ sourceType: 'database', sourceName: 'قاعدة البيانات الرئيسية' }],
        dataModules: selectedDataModules.map(m => ({ moduleName: m, moduleFields: [] })),
        dataRefreshRate: 'daily',
      },
      parametersFilters: { parameters: [], filters: [] },
      reportStructure: { columns: [] },
      scheduling: scheduled ? {
        scheduled: true,
        scheduleType: 'recurring',
        scheduleStatus: 'active',
        executionHistory: [],
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      } : undefined,
      accessControl: {
        accessLevel,
        allowedRoles: [],
        dataSecurity: { rowLevelSecurity: false, columnLevelSecurity: false, containsSensitiveData: false, encryptionRequired: false },
        auditLogging: { logAccess: true, logChanges: true, logExports: true },
      },
      exportFormat: {
        availableFormats: outputFormats,
        defaultFormat: defaultOutputFormat,
        pdfOptions: { orientation: 'portrait', pageSize: 'A4', headerFooter: true },
        excelOptions: { includeFormulas: true, includeFormatting: true, autoFitColumns: true, freezePanes: true },
      },
      createdBy: 'current-user',
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({ id: editId, data })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/crm/reports' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'التقارير', href: '/dashboard/crm/reports', isActive: true },
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero badge="العملاء والتواصل" title={isEditMode ? 'تعديل التقرير' : 'إنشاء تقرير جديد'} type="crm-reports" listMode={true} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white" onClick={() => navigate({ to: '/dashboard/crm/reports' })}>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">{isEditMode ? 'تعديل التقرير' : 'إنشاء تقرير CRM جديد'}</h1>
                <p className="text-slate-500">{isEditMode ? 'تعديل بيانات التقرير' : 'إضافة تقرير جديد للعملاء والتواصل'}</p>
              </div>
            </div>

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
                    <button key={option.value} type="button" onClick={() => setOfficeType(option.value as OfficeType)}
                      className={cn("p-4 rounded-xl border-2 transition-all text-center",
                        officeType === option.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}>
                      <option.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium block">{option.labelAr}</span>
                      <span className="text-xs opacity-75">{option.descriptionAr}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                    <Label className="text-navy font-medium">كود التقرير <span className="text-red-500">*</span></Label>
                    <Input value={reportCode} onChange={(e) => setReportCode(e.target.value)} placeholder="مثال: CRM-RPT-001" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الحالة <span className="text-red-500">*</span></Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
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
                    <Label className="text-navy font-medium">اسم التقرير (English) <span className="text-red-500">*</span></Label>
                    <Input value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Client Summary Report" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">اسم التقرير (عربي)</Label>
                    <Input value={reportNameAr} onChange={(e) => setReportNameAr(e.target.value)} placeholder="تقرير ملخص العملاء" className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">وصف التقرير</Label>
                  <Textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="وصف مختصر للتقرير..." className="rounded-xl min-h-[80px]" />
                </div>
              </CardContent>
            </Card>

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
                    <Label className="text-navy font-medium">الفئة <span className="text-red-500">*</span></Label>
                    <Select value={reportCategory} onValueChange={(v) => setReportCategory(v as ReportCategory)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {crmCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{reportCategoryLabels[cat]?.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">النوع <span className="text-red-500">*</span></Label>
                    <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(reportTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">التنسيق <span className="text-red-500">*</span></Label>
                    <Select value={reportFormat} onValueChange={(v) => setReportFormat(v as ReportFormat)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(reportFormatLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">التكرار</Label>
                    <Select value={usageFrequency} onValueChange={(v) => setUsageFrequency(v as UsageFrequency)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(usageFrequencyLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-500" />
                  مصادر البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">الوحدات المختارة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {crmDataModules.map((module) => (
                      <button key={module} type="button" onClick={() => toggleDataModule(module)}
                        className={cn("p-2 rounded-xl border text-sm transition-all",
                          selectedDataModules.includes(module) ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}>
                        {dataModuleLabels[module]?.ar}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  صيغ الإخراج والتحكم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">الصيغ المتاحة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(outputFormatLabels).map(([key, label]) => (
                      <button key={key} type="button" onClick={() => toggleOutputFormat(key as OutputFormat)}
                        className={cn("p-2 rounded-xl border text-sm transition-all",
                          outputFormats.includes(key as OutputFormat) ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}>
                        {label.ar}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الصيغة الافتراضية</Label>
                    <Select value={defaultOutputFormat} onValueChange={(v) => setDefaultOutputFormat(v as OutputFormat)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {outputFormats.map((format) => (
                          <SelectItem key={format} value={format}>{outputFormatLabels[format]?.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">مستوى الوصول</Label>
                    <Select value={accessLevel} onValueChange={(v) => setAccessLevel(v as AccessLevel)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(accessLevelLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-700">تفعيل الجدولة</span>
                  <Switch checked={scheduled} onCheckedChange={setScheduled} />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" onClick={() => navigate({ to: '/dashboard/crm/reports' })} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSubmit} disabled={!reportCode || !reportName || isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8">
                {isPending ? <>جاري الحفظ...</> : (
                  <><CheckCircle className="w-4 h-4 ms-2" />{isEditMode ? 'حفظ التعديلات' : 'إنشاء التقرير'}</>
                )}
              </Button>
            </div>
          </div>
          <CrmSidebar context="reports" />
        </div>
      </Main>
    </>
  )
}
