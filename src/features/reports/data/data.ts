import {
  DollarSign,
  Briefcase,
  Users,
  UserCheck,
  Clock,
  FileText,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'
import type { ReportType, ReportPeriod, ReportFormat } from '@/services/reportsService'

export interface ReportTypeOption {
  value: ReportType
  label: string
  labelAr: string
  description: string
  descriptionAr: string
  icon: LucideIcon
  color: string
}

export const reportTypes: ReportTypeOption[] = [
  {
    value: 'revenue',
    label: 'Revenue Report',
    labelAr: 'تقرير الإيرادات',
    description: 'Track income, billing, and collections',
    descriptionAr: 'تتبع الدخل والفواتير والتحصيل',
    icon: DollarSign,
    color: 'text-green-500',
  },
  {
    value: 'cases',
    label: 'Case Report',
    labelAr: 'تقرير القضايا',
    description: 'Analyze case status and outcomes',
    descriptionAr: 'تحليل حالة القضايا والنتائج',
    icon: Briefcase,
    color: 'text-blue-500',
  },
  {
    value: 'clients',
    label: 'Client Report',
    labelAr: 'تقرير العملاء',
    description: 'Client acquisition and retention metrics',
    descriptionAr: 'مقاييس اكتساب العملاء والاحتفاظ بهم',
    icon: Users,
    color: 'text-purple-500',
  },
  {
    value: 'staff',
    label: 'Staff Performance',
    labelAr: 'أداء الموظفين',
    description: 'Track staff productivity and performance',
    descriptionAr: 'تتبع إنتاجية وأداء الموظفين',
    icon: UserCheck,
    color: 'text-orange-500',
  },
  {
    value: 'time-tracking',
    label: 'Time Tracking',
    labelAr: 'تتبع الوقت',
    description: 'Billable hours and utilization rates',
    descriptionAr: 'الساعات القابلة للفوترة ومعدلات الاستخدام',
    icon: Clock,
    color: 'text-cyan-500',
  },
  {
    value: 'billing',
    label: 'Billing Report',
    labelAr: 'تقرير الفواتير',
    description: 'Invoice status and payment tracking',
    descriptionAr: 'حالة الفواتير وتتبع المدفوعات',
    icon: FileText,
    color: 'text-indigo-500',
  },
  {
    value: 'collections',
    label: 'Collections Report',
    labelAr: 'تقرير التحصيل',
    description: 'Outstanding balances and aging reports',
    descriptionAr: 'الأرصدة المستحقة وتقارير التقادم',
    icon: CreditCard,
    color: 'text-red-500',
  },
]

export interface PeriodOption {
  value: ReportPeriod
  label: string
  labelAr: string
}

export const periodOptions: PeriodOption[] = [
  { value: 'daily', label: 'Daily', labelAr: 'يومي' },
  { value: 'weekly', label: 'Weekly', labelAr: 'أسبوعي' },
  { value: 'monthly', label: 'Monthly', labelAr: 'شهري' },
  { value: 'quarterly', label: 'Quarterly', labelAr: 'ربع سنوي' },
  { value: 'yearly', label: 'Yearly', labelAr: 'سنوي' },
  { value: 'custom', label: 'Custom Range', labelAr: 'نطاق مخصص' },
]

export interface FormatOption {
  value: ReportFormat
  label: string
  labelAr: string
}

export const formatOptions: FormatOption[] = [
  { value: 'table', label: 'Table View', labelAr: 'عرض جدول' },
  { value: 'chart', label: 'Chart View', labelAr: 'عرض رسم بياني' },
  { value: 'summary', label: 'Summary', labelAr: 'ملخص' },
  { value: 'detailed', label: 'Detailed', labelAr: 'مفصل' },
]

export interface ChartTypeOption {
  value: 'bar' | 'line' | 'pie' | 'area' | 'donut'
  label: string
  labelAr: string
}

export const chartTypeOptions: ChartTypeOption[] = [
  { value: 'bar', label: 'Bar Chart', labelAr: 'رسم بياني شريطي' },
  { value: 'line', label: 'Line Chart', labelAr: 'رسم بياني خطي' },
  { value: 'pie', label: 'Pie Chart', labelAr: 'رسم بياني دائري' },
  { value: 'area', label: 'Area Chart', labelAr: 'رسم بياني مساحي' },
  { value: 'donut', label: 'Donut Chart', labelAr: 'رسم بياني حلقي' },
]

export interface ExportFormatOption {
  value: 'pdf' | 'xlsx' | 'csv'
  label: string
  labelAr: string
}

export const exportFormatOptions: ExportFormatOption[] = [
  { value: 'pdf', label: 'PDF Document', labelAr: 'مستند PDF' },
  { value: 'xlsx', label: 'Excel Spreadsheet', labelAr: 'جدول بيانات Excel' },
  { value: 'csv', label: 'CSV File', labelAr: 'ملف CSV' },
]

export interface ScheduleFrequencyOption {
  value: 'daily' | 'weekly' | 'monthly'
  label: string
  labelAr: string
}

export const scheduleFrequencyOptions: ScheduleFrequencyOption[] = [
  { value: 'daily', label: 'Daily', labelAr: 'يومي' },
  { value: 'weekly', label: 'Weekly', labelAr: 'أسبوعي' },
  { value: 'monthly', label: 'Monthly', labelAr: 'شهري' },
]

// Columns available for each report type
export const reportColumns: Record<ReportType, { key: string; label: string; labelAr: string }[]> = {
  revenue: [
    { key: 'period', label: 'Period', labelAr: 'الفترة' },
    { key: 'billed', label: 'Billed Amount', labelAr: 'المبلغ المفوتر' },
    { key: 'collected', label: 'Collected Amount', labelAr: 'المبلغ المحصل' },
    { key: 'outstanding', label: 'Outstanding', labelAr: 'المستحق' },
    { key: 'writeOff', label: 'Write-offs', labelAr: 'الشطب' },
    { key: 'client', label: 'Client', labelAr: 'العميل' },
    { key: 'practiceArea', label: 'Practice Area', labelAr: 'مجال الممارسة' },
    { key: 'staff', label: 'Staff', labelAr: 'الموظف' },
  ],
  cases: [
    { key: 'caseNumber', label: 'Case Number', labelAr: 'رقم القضية' },
    { key: 'client', label: 'Client', labelAr: 'العميل' },
    { key: 'type', label: 'Case Type', labelAr: 'نوع القضية' },
    { key: 'status', label: 'Status', labelAr: 'الحالة' },
    { key: 'practiceArea', label: 'Practice Area', labelAr: 'مجال الممارسة' },
    { key: 'openDate', label: 'Open Date', labelAr: 'تاريخ الفتح' },
    { key: 'closeDate', label: 'Close Date', labelAr: 'تاريخ الإغلاق' },
    { key: 'revenue', label: 'Revenue', labelAr: 'الإيرادات' },
    { key: 'assignedStaff', label: 'Assigned Staff', labelAr: 'الموظف المعين' },
  ],
  clients: [
    { key: 'name', label: 'Client Name', labelAr: 'اسم العميل' },
    { key: 'type', label: 'Client Type', labelAr: 'نوع العميل' },
    { key: 'totalCases', label: 'Total Cases', labelAr: 'إجمالي القضايا' },
    { key: 'activeCases', label: 'Active Cases', labelAr: 'القضايا النشطة' },
    { key: 'totalRevenue', label: 'Total Revenue', labelAr: 'إجمالي الإيرادات' },
    { key: 'outstanding', label: 'Outstanding', labelAr: 'المستحق' },
    { key: 'createdDate', label: 'Client Since', labelAr: 'عميل منذ' },
    { key: 'lastActivity', label: 'Last Activity', labelAr: 'آخر نشاط' },
  ],
  staff: [
    { key: 'name', label: 'Staff Name', labelAr: 'اسم الموظف' },
    { key: 'role', label: 'Role', labelAr: 'الدور' },
    { key: 'totalHours', label: 'Total Hours', labelAr: 'إجمالي الساعات' },
    { key: 'billableHours', label: 'Billable Hours', labelAr: 'الساعات القابلة للفوترة' },
    { key: 'utilization', label: 'Utilization Rate', labelAr: 'معدل الاستخدام' },
    { key: 'billed', label: 'Amount Billed', labelAr: 'المبلغ المفوتر' },
    { key: 'collected', label: 'Amount Collected', labelAr: 'المبلغ المحصل' },
    { key: 'casesHandled', label: 'Cases Handled', labelAr: 'القضايا المعالجة' },
  ],
  'time-tracking': [
    { key: 'date', label: 'Date', labelAr: 'التاريخ' },
    { key: 'staff', label: 'Staff', labelAr: 'الموظف' },
    { key: 'client', label: 'Client', labelAr: 'العميل' },
    { key: 'case', label: 'Case', labelAr: 'القضية' },
    { key: 'activity', label: 'Activity', labelAr: 'النشاط' },
    { key: 'hours', label: 'Hours', labelAr: 'الساعات' },
    { key: 'billable', label: 'Billable', labelAr: 'قابل للفوترة' },
    { key: 'rate', label: 'Rate', labelAr: 'المعدل' },
    { key: 'amount', label: 'Amount', labelAr: 'المبلغ' },
  ],
  billing: [
    { key: 'invoiceNumber', label: 'Invoice Number', labelAr: 'رقم الفاتورة' },
    { key: 'client', label: 'Client', labelAr: 'العميل' },
    { key: 'case', label: 'Case', labelAr: 'القضية' },
    { key: 'amount', label: 'Amount', labelAr: 'المبلغ' },
    { key: 'status', label: 'Status', labelAr: 'الحالة' },
    { key: 'issueDate', label: 'Issue Date', labelAr: 'تاريخ الإصدار' },
    { key: 'dueDate', label: 'Due Date', labelAr: 'تاريخ الاستحقاق' },
    { key: 'paidDate', label: 'Paid Date', labelAr: 'تاريخ الدفع' },
    { key: 'paymentMethod', label: 'Payment Method', labelAr: 'طريقة الدفع' },
  ],
  collections: [
    { key: 'client', label: 'Client', labelAr: 'العميل' },
    { key: 'totalDue', label: 'Total Due', labelAr: 'إجمالي المستحق' },
    { key: 'current', label: 'Current', labelAr: 'الحالي' },
    { key: 'overdue30', label: '1-30 Days', labelAr: '1-30 يوم' },
    { key: 'overdue60', label: '31-60 Days', labelAr: '31-60 يوم' },
    { key: 'overdue90', label: '61-90 Days', labelAr: '61-90 يوم' },
    { key: 'overdue90Plus', label: '90+ Days', labelAr: 'أكثر من 90 يوم' },
    { key: 'lastPayment', label: 'Last Payment', labelAr: 'آخر دفعة' },
  ],
  custom: [],
}

// Quick date ranges
export interface QuickDateRange {
  value: string
  label: string
  labelAr: string
  getRange: () => { start: Date; end: Date }
}

export const quickDateRanges: QuickDateRange[] = [
  {
    value: 'today',
    label: 'Today',
    labelAr: 'اليوم',
    getRange: () => {
      const today = new Date()
      return { start: today, end: today }
    },
  },
  {
    value: 'yesterday',
    label: 'Yesterday',
    labelAr: 'أمس',
    getRange: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: yesterday, end: yesterday }
    },
  },
  {
    value: 'last7days',
    label: 'Last 7 Days',
    labelAr: 'آخر 7 أيام',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return { start, end }
    },
  },
  {
    value: 'last30days',
    label: 'Last 30 Days',
    labelAr: 'آخر 30 يوم',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return { start, end }
    },
  },
  {
    value: 'thisMonth',
    label: 'This Month',
    labelAr: 'هذا الشهر',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { start, end }
    },
  },
  {
    value: 'lastMonth',
    label: 'Last Month',
    labelAr: 'الشهر الماضي',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start, end }
    },
  },
  {
    value: 'thisQuarter',
    label: 'This Quarter',
    labelAr: 'هذا الربع',
    getRange: () => {
      const now = new Date()
      const quarter = Math.floor(now.getMonth() / 3)
      const start = new Date(now.getFullYear(), quarter * 3, 1)
      const end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
      return { start, end }
    },
  },
  {
    value: 'lastQuarter',
    label: 'Last Quarter',
    labelAr: 'الربع الماضي',
    getRange: () => {
      const now = new Date()
      const quarter = Math.floor(now.getMonth() / 3) - 1
      const year = quarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const adjustedQuarter = quarter < 0 ? 3 : quarter
      const start = new Date(year, adjustedQuarter * 3, 1)
      const end = new Date(year, adjustedQuarter * 3 + 3, 0)
      return { start, end }
    },
  },
  {
    value: 'thisYear',
    label: 'This Year',
    labelAr: 'هذا العام',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      return { start, end }
    },
  },
  {
    value: 'lastYear',
    label: 'Last Year',
    labelAr: 'العام الماضي',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const end = new Date(now.getFullYear() - 1, 11, 31)
      return { start, end }
    },
  },
]
