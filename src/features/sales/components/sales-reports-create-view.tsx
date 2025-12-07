import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  FileBarChart,
  ArrowRight,
  Save,
  Calendar,
  Settings,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCreateReport } from '@/hooks/useReports'
import { toast } from 'sonner'
import {
  ReportSection,
  ReportCategory,
  DataModule,
  ReportFormat,
  reportCategoryLabels,
  dataModuleLabels,
  categoriesBySection,
  dataModulesBySection,
} from '@/services/reportsService'

const salesCategories = categoriesBySection[ReportSection.SALES]
const salesDataModules = dataModulesBySection[ReportSection.SALES]

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

const dateRangeOptions = [
  { value: 'today', label: 'اليوم' },
  { value: 'yesterday', label: 'أمس' },
  { value: 'last7days', label: 'آخر 7 أيام' },
  { value: 'last30days', label: 'آخر 30 يوم' },
  { value: 'thisMonth', label: 'هذا الشهر' },
  { value: 'lastMonth', label: 'الشهر الماضي' },
  { value: 'thisQuarter', label: 'هذا الربع' },
  { value: 'lastQuarter', label: 'الربع الماضي' },
  { value: 'thisYear', label: 'هذا العام' },
  { value: 'lastYear', label: 'العام الماضي' },
  { value: 'custom', label: 'نطاق مخصص' },
]

export function SalesReportsCreateView() {
  const navigate = useNavigate()
  const createReport = useCreateReport()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ReportCategory | '',
    dateRange: 'thisMonth',
    customStartDate: '',
    customEndDate: '',
    format: ReportFormat.PDF,
    includeCharts: true,
    includeSummary: true,
    includeDetails: true,
    dataModules: [] as DataModule[],
    isScheduled: false,
    scheduleFrequency: 'weekly',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      await createReport.mutateAsync({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        reportSection: ReportSection.SALES,
        config: {
          dateRange: formData.dateRange === 'custom' ? {
            start: formData.customStartDate,
            end: formData.customEndDate,
          } : { preset: formData.dateRange },
          format: formData.format,
          includeCharts: formData.includeCharts,
          includeSummary: formData.includeSummary,
          includeDetails: formData.includeDetails,
          dataModules: formData.dataModules,
        },
        schedule: formData.isScheduled ? {
          enabled: true,
          frequency: formData.scheduleFrequency as any,
        } : undefined,
      })
      toast.success('تم إنشاء التقرير بنجاح')
      navigate({ to: '/dashboard/sales/reports' })
    } catch {
      toast.error('فشل في إنشاء التقرير')
    }
  }

  const toggleDataModule = (module: DataModule) => {
    setFormData(prev => ({
      ...prev,
      dataModules: prev.dataModules.includes(module)
        ? prev.dataModules.filter(m => m !== module)
        : [...prev.dataModules, module]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link to="/dashboard/sales/reports">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy">إنشاء تقرير مبيعات جديد</h1>
          <p className="text-slate-500 mt-1">قم بتخصيص تقرير المبيعات حسب احتياجاتك</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-navy mb-4">المعلومات الأساسية</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم التقرير *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: تقرير المبيعات الشهري"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر للتقرير..."
                  className="rounded-xl min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>فئة التقرير *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as ReportCategory })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر فئة التقرير" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesCategories.map((cat) => {
                      const Icon = categoryIcons[cat] || FileBarChart
                      return (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {reportCategoryLabels[cat]?.ar || cat}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-navy">الفترة الزمنية</h2>
            </div>
            <div className="space-y-4">
              <Select
                value={formData.dateRange}
                onValueChange={(value) => setFormData({ ...formData, dateRange: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formData.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ البداية</Label>
                    <Input
                      type="date"
                      value={formData.customStartDate}
                      onChange={(e) => setFormData({ ...formData, customStartDate: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ النهاية</Label>
                    <Input
                      type="date"
                      value={formData.customEndDate}
                      onChange={(e) => setFormData({ ...formData, customEndDate: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Modules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-navy">وحدات البيانات</h2>
            </div>
            <p className="text-slate-500 text-sm mb-4">اختر البيانات التي تريد تضمينها في التقرير</p>
            <div className="grid grid-cols-2 gap-3">
              {salesDataModules.map((module) => (
                <button
                  key={module}
                  type="button"
                  onClick={() => toggleDataModule(module)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    formData.dataModules.includes(module)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-medium">
                    {dataModuleLabels[module]?.ar || module}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Format Options */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-navy mb-4">خيارات التصدير</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>صيغة التقرير</Label>
                <RadioGroup
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value as ReportFormat })}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={ReportFormat.PDF} id="pdf" />
                    <Label htmlFor="pdf" className="font-normal cursor-pointer">PDF</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={ReportFormat.EXCEL} id="excel" />
                    <Label htmlFor="excel" className="font-normal cursor-pointer">Excel</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={ReportFormat.CSV} id="csv" />
                    <Label htmlFor="csv" className="font-normal cursor-pointer">CSV</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between py-2">
                <Label htmlFor="includeCharts" className="font-normal cursor-pointer">
                  تضمين الرسوم البيانية
                </Label>
                <Switch
                  id="includeCharts"
                  checked={formData.includeCharts}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeCharts: checked })}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="includeSummary" className="font-normal cursor-pointer">
                  تضمين الملخص التنفيذي
                </Label>
                <Switch
                  id="includeSummary"
                  checked={formData.includeSummary}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeSummary: checked })}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="includeDetails" className="font-normal cursor-pointer">
                  تضمين التفاصيل الكاملة
                </Label>
                <Switch
                  id="includeDetails"
                  checked={formData.includeDetails}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeDetails: checked })}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy">الجدولة</h2>
              <Switch
                checked={formData.isScheduled}
                onCheckedChange={(checked) => setFormData({ ...formData, isScheduled: checked })}
              />
            </div>
            {formData.isScheduled && (
              <div className="space-y-2">
                <Label>تكرار التقرير</Label>
                <Select
                  value={formData.scheduleFrequency}
                  onValueChange={(value) => setFormData({ ...formData, scheduleFrequency: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl h-12"
              disabled={createReport.isPending}
            >
              <Save className="h-4 w-4 ms-2" aria-hidden="true" />
              {createReport.isPending ? 'جارٍ الإنشاء...' : 'إنشاء التقرير'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl h-12"
              onClick={() => navigate({ to: '/dashboard/sales/reports' })}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
