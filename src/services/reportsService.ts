import api from '@/lib/api'

// ==================== ENUMS ====================

// Report Section - which module the report belongs to
export enum ReportSection {
  HR = 'hr',
  FINANCE = 'finance',
  TASKS = 'tasks',
  CRM = 'crm',
  SALES = 'sales',
  GENERAL = 'general'
}

export enum ReportCategory {
  // HR Categories
  EMPLOYEE_DATA = 'employee_data',
  PAYROLL = 'payroll',
  ATTENDANCE = 'attendance',
  TIME_TRACKING = 'time_tracking',
  PERFORMANCE = 'performance',
  RECRUITMENT = 'recruitment',
  TRAINING = 'training',
  BENEFITS = 'benefits',
  COMPENSATION = 'compensation',
  SUCCESSION = 'succession',

  // Finance Categories
  INVOICES = 'invoices',
  EXPENSES = 'expenses',
  PAYMENTS = 'payments',
  REVENUE = 'revenue',
  CASH_FLOW = 'cash_flow',
  BUDGETS = 'budgets',
  FINANCIAL_STATEMENTS = 'financial_statements',
  TAX = 'tax',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  ACCOUNTS_PAYABLE = 'accounts_payable',
  PROFITABILITY = 'profitability',

  // Tasks/Productivity Categories
  TASKS = 'tasks',
  PROJECTS = 'projects',
  WORKLOAD = 'workload',
  DEADLINES = 'deadlines',
  PRODUCTIVITY = 'productivity',
  REMINDERS = 'reminders',
  EVENTS = 'events',

  // CRM Categories
  CLIENTS = 'clients',
  CONTACTS = 'contacts',
  LEADS = 'leads',
  OPPORTUNITIES = 'opportunities',
  ACTIVITIES = 'activities',
  CAMPAIGNS = 'campaigns',
  CUSTOMER_SATISFACTION = 'customer_satisfaction',
  REFERRALS = 'referrals',

  // Sales Categories
  SALES = 'sales',
  PIPELINE = 'pipeline',
  FORECASTS = 'forecasts',
  QUOTAS = 'quotas',
  COMMISSIONS = 'commissions',
  DEALS = 'deals',
  WIN_LOSS = 'win_loss',
  SALES_PERFORMANCE = 'sales_performance',

  // General Categories
  COMPLIANCE = 'compliance',
  LEGAL = 'legal',
  ANALYTICS = 'analytics',
  EXECUTIVE = 'executive',
  OPERATIONAL = 'operational',
  STRATEGIC = 'strategic',
  CUSTOM = 'custom'
}

export enum ReportType {
  STANDARD = 'standard',
  CUSTOM = 'custom',
  DASHBOARD = 'dashboard',
  KPI = 'kpi',
  ANALYTICS = 'analytics',
  COMPLIANCE = 'compliance',
  AUDIT = 'audit',
  EXCEPTION = 'exception',
  TREND = 'trend',
  COMPARISON = 'comparison'
}

export enum ReportFormat {
  TABULAR = 'tabular',
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  GRAPH = 'graph',
  CHART = 'chart',
  PIVOT = 'pivot',
  MATRIX = 'matrix',
  DASHBOARD = 'dashboard',
  SCORECARD = 'scorecard'
}

export enum OutputFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  WORD = 'word',
  POWERPOINT = 'powerpoint',
  HTML = 'html',
  JSON = 'json',
  XML = 'xml'
}

export enum UsageFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  AD_HOC = 'ad_hoc'
}

export enum CriticalityLevel {
  CRITICAL = 'critical',
  IMPORTANT = 'important',
  STANDARD = 'standard',
  NICE_TO_HAVE = 'nice_to_have'
}

export enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  EXTERNAL_SYSTEM = 'external_system',
  DATA_WAREHOUSE = 'data_warehouse'
}

export enum DataRefreshRate {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ON_DEMAND = 'on_demand'
}

export enum ParameterType {
  DATE = 'date',
  DATE_RANGE = 'date_range',
  EMPLOYEE = 'employee',
  DEPARTMENT = 'department',
  LOCATION = 'location',
  JOB_LEVEL = 'job_level',
  SALARY_GRADE = 'salary_grade',
  STATUS = 'status',
  DROPDOWN = 'dropdown',
  MULTI_SELECT = 'multi_select',
  TEXT = 'text',
  NUMBER = 'number'
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in'
}

export enum ChartType {
  BAR = 'bar',
  COLUMN = 'column',
  LINE = 'line',
  PIE = 'pie',
  DONUT = 'donut',
  AREA = 'area',
  SCATTER = 'scatter',
  BUBBLE = 'bubble',
  GAUGE = 'gauge',
  FUNNEL = 'funnel',
  WATERFALL = 'waterfall',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap'
}

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual'
}

export enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

export enum ExecutionStatus {
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum AccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  MANAGEMENT = 'management',
  HR = 'hr',
  FINANCE = 'finance',
  EXECUTIVE = 'executive',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential'
}

export enum ReportStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated'
}

export enum DataModule {
  // HR Modules
  EMPLOYEES = 'employees',
  PAYROLL = 'payroll',
  ATTENDANCE = 'attendance',
  PERFORMANCE = 'performance',
  RECRUITMENT = 'recruitment',
  TRAINING = 'training',
  BENEFITS = 'benefits',
  COMPENSATION = 'compensation',
  SUCCESSION = 'succession',
  GRIEVANCES = 'grievances',
  ORGANIZATIONAL_STRUCTURE = 'organizational_structure',
  JOB_POSITIONS = 'job_positions',

  // Finance Modules
  INVOICES = 'invoices',
  EXPENSES = 'expenses',
  PAYMENTS = 'payments',
  TRANSACTIONS = 'transactions',
  ACCOUNTS = 'accounts',
  BUDGETS = 'budgets',
  TAX = 'tax',
  TIME_ENTRIES = 'time_entries',

  // Tasks Modules
  TASKS = 'tasks',
  PROJECTS = 'projects',
  REMINDERS = 'reminders',
  EVENTS = 'events',
  CALENDARS = 'calendars',

  // CRM Modules
  CLIENTS = 'clients',
  CONTACTS = 'contacts',
  LEADS = 'leads',
  OPPORTUNITIES = 'opportunities',
  ACTIVITIES = 'activities',
  CAMPAIGNS = 'campaigns',
  REFERRALS = 'referrals',

  // Sales Modules
  DEALS = 'deals',
  PIPELINE = 'pipeline',
  QUOTES = 'quotes',
  ORDERS = 'orders',

  // Legal/Other Modules
  CASES = 'cases',
  DOCUMENTS = 'documents',
  ASSETS = 'assets',
  VIOLATIONS = 'violations',
  OTHER = 'other'
}

// ==================== LABELS ====================

export const reportSectionLabels: Record<ReportSection, { en: string; ar: string }> = {
  [ReportSection.HR]: { en: 'Human Resources', ar: 'الموارد البشرية' },
  [ReportSection.FINANCE]: { en: 'Finance', ar: 'المالية' },
  [ReportSection.TASKS]: { en: 'Tasks & Productivity', ar: 'المهام والإنتاجية' },
  [ReportSection.CRM]: { en: 'CRM', ar: 'إدارة العملاء' },
  [ReportSection.SALES]: { en: 'Sales', ar: 'المبيعات' },
  [ReportSection.GENERAL]: { en: 'General', ar: 'عام' }
}

export const reportCategoryLabels: Record<ReportCategory, { en: string; ar: string }> = {
  // HR Categories
  [ReportCategory.EMPLOYEE_DATA]: { en: 'Employee Data', ar: 'بيانات الموظفين' },
  [ReportCategory.PAYROLL]: { en: 'Payroll', ar: 'الرواتب' },
  [ReportCategory.ATTENDANCE]: { en: 'Attendance', ar: 'الحضور' },
  [ReportCategory.TIME_TRACKING]: { en: 'Time Tracking', ar: 'تتبع الوقت' },
  [ReportCategory.PERFORMANCE]: { en: 'Performance', ar: 'الأداء' },
  [ReportCategory.RECRUITMENT]: { en: 'Recruitment', ar: 'التوظيف' },
  [ReportCategory.TRAINING]: { en: 'Training', ar: 'التدريب' },
  [ReportCategory.BENEFITS]: { en: 'Benefits', ar: 'المزايا' },
  [ReportCategory.COMPENSATION]: { en: 'Compensation', ar: 'التعويضات' },
  [ReportCategory.SUCCESSION]: { en: 'Succession', ar: 'التعاقب' },

  // Finance Categories
  [ReportCategory.INVOICES]: { en: 'Invoices', ar: 'الفواتير' },
  [ReportCategory.EXPENSES]: { en: 'Expenses', ar: 'المصروفات' },
  [ReportCategory.PAYMENTS]: { en: 'Payments', ar: 'المدفوعات' },
  [ReportCategory.REVENUE]: { en: 'Revenue', ar: 'الإيرادات' },
  [ReportCategory.CASH_FLOW]: { en: 'Cash Flow', ar: 'التدفق النقدي' },
  [ReportCategory.BUDGETS]: { en: 'Budgets', ar: 'الميزانيات' },
  [ReportCategory.FINANCIAL_STATEMENTS]: { en: 'Financial Statements', ar: 'القوائم المالية' },
  [ReportCategory.TAX]: { en: 'Tax', ar: 'الضرائب' },
  [ReportCategory.ACCOUNTS_RECEIVABLE]: { en: 'Accounts Receivable', ar: 'حسابات القبض' },
  [ReportCategory.ACCOUNTS_PAYABLE]: { en: 'Accounts Payable', ar: 'حسابات الدفع' },
  [ReportCategory.PROFITABILITY]: { en: 'Profitability', ar: 'الربحية' },

  // Tasks Categories
  [ReportCategory.TASKS]: { en: 'Tasks', ar: 'المهام' },
  [ReportCategory.PROJECTS]: { en: 'Projects', ar: 'المشاريع' },
  [ReportCategory.WORKLOAD]: { en: 'Workload', ar: 'حجم العمل' },
  [ReportCategory.DEADLINES]: { en: 'Deadlines', ar: 'المواعيد النهائية' },
  [ReportCategory.PRODUCTIVITY]: { en: 'Productivity', ar: 'الإنتاجية' },
  [ReportCategory.REMINDERS]: { en: 'Reminders', ar: 'التذكيرات' },
  [ReportCategory.EVENTS]: { en: 'Events', ar: 'الأحداث' },

  // CRM Categories
  [ReportCategory.CLIENTS]: { en: 'Clients', ar: 'العملاء' },
  [ReportCategory.CONTACTS]: { en: 'Contacts', ar: 'جهات الاتصال' },
  [ReportCategory.LEADS]: { en: 'Leads', ar: 'العملاء المحتملين' },
  [ReportCategory.OPPORTUNITIES]: { en: 'Opportunities', ar: 'الفرص' },
  [ReportCategory.ACTIVITIES]: { en: 'Activities', ar: 'الأنشطة' },
  [ReportCategory.CAMPAIGNS]: { en: 'Campaigns', ar: 'الحملات' },
  [ReportCategory.CUSTOMER_SATISFACTION]: { en: 'Customer Satisfaction', ar: 'رضا العملاء' },
  [ReportCategory.REFERRALS]: { en: 'Referrals', ar: 'الإحالات' },

  // Sales Categories
  [ReportCategory.SALES]: { en: 'Sales', ar: 'المبيعات' },
  [ReportCategory.PIPELINE]: { en: 'Pipeline', ar: 'خط الأنابيب' },
  [ReportCategory.FORECASTS]: { en: 'Forecasts', ar: 'التوقعات' },
  [ReportCategory.QUOTAS]: { en: 'Quotas', ar: 'الحصص' },
  [ReportCategory.COMMISSIONS]: { en: 'Commissions', ar: 'العمولات' },
  [ReportCategory.DEALS]: { en: 'Deals', ar: 'الصفقات' },
  [ReportCategory.WIN_LOSS]: { en: 'Win/Loss', ar: 'الربح/الخسارة' },
  [ReportCategory.SALES_PERFORMANCE]: { en: 'Sales Performance', ar: 'أداء المبيعات' },

  // General Categories
  [ReportCategory.COMPLIANCE]: { en: 'Compliance', ar: 'الامتثال' },
  [ReportCategory.LEGAL]: { en: 'Legal', ar: 'قانوني' },
  [ReportCategory.ANALYTICS]: { en: 'Analytics', ar: 'التحليلات' },
  [ReportCategory.EXECUTIVE]: { en: 'Executive', ar: 'تنفيذي' },
  [ReportCategory.OPERATIONAL]: { en: 'Operational', ar: 'تشغيلي' },
  [ReportCategory.STRATEGIC]: { en: 'Strategic', ar: 'استراتيجي' },
  [ReportCategory.CUSTOM]: { en: 'Custom', ar: 'مخصص' }
}

export const reportTypeLabels: Record<ReportType, { en: string; ar: string }> = {
  [ReportType.STANDARD]: { en: 'Standard', ar: 'قياسي' },
  [ReportType.CUSTOM]: { en: 'Custom', ar: 'مخصص' },
  [ReportType.DASHBOARD]: { en: 'Dashboard', ar: 'لوحة معلومات' },
  [ReportType.KPI]: { en: 'KPI', ar: 'مؤشرات الأداء' },
  [ReportType.ANALYTICS]: { en: 'Analytics', ar: 'تحليلات' },
  [ReportType.COMPLIANCE]: { en: 'Compliance', ar: 'امتثال' },
  [ReportType.AUDIT]: { en: 'Audit', ar: 'تدقيق' },
  [ReportType.EXCEPTION]: { en: 'Exception', ar: 'استثناءات' },
  [ReportType.TREND]: { en: 'Trend', ar: 'اتجاهات' },
  [ReportType.COMPARISON]: { en: 'Comparison', ar: 'مقارنة' }
}

export const reportFormatLabels: Record<ReportFormat, { en: string; ar: string }> = {
  [ReportFormat.TABULAR]: { en: 'Tabular', ar: 'جدولي' },
  [ReportFormat.SUMMARY]: { en: 'Summary', ar: 'ملخص' },
  [ReportFormat.DETAILED]: { en: 'Detailed', ar: 'تفصيلي' },
  [ReportFormat.GRAPH]: { en: 'Graph', ar: 'رسم بياني' },
  [ReportFormat.CHART]: { en: 'Chart', ar: 'مخطط' },
  [ReportFormat.PIVOT]: { en: 'Pivot', ar: 'محوري' },
  [ReportFormat.MATRIX]: { en: 'Matrix', ar: 'مصفوفة' },
  [ReportFormat.DASHBOARD]: { en: 'Dashboard', ar: 'لوحة معلومات' },
  [ReportFormat.SCORECARD]: { en: 'Scorecard', ar: 'بطاقة أداء' }
}

export const outputFormatLabels: Record<OutputFormat, { en: string; ar: string }> = {
  [OutputFormat.PDF]: { en: 'PDF', ar: 'PDF' },
  [OutputFormat.EXCEL]: { en: 'Excel', ar: 'إكسل' },
  [OutputFormat.CSV]: { en: 'CSV', ar: 'CSV' },
  [OutputFormat.WORD]: { en: 'Word', ar: 'وورد' },
  [OutputFormat.POWERPOINT]: { en: 'PowerPoint', ar: 'باوربوينت' },
  [OutputFormat.HTML]: { en: 'HTML', ar: 'HTML' },
  [OutputFormat.JSON]: { en: 'JSON', ar: 'JSON' },
  [OutputFormat.XML]: { en: 'XML', ar: 'XML' }
}

export const usageFrequencyLabels: Record<UsageFrequency, { en: string; ar: string }> = {
  [UsageFrequency.DAILY]: { en: 'Daily', ar: 'يومي' },
  [UsageFrequency.WEEKLY]: { en: 'Weekly', ar: 'أسبوعي' },
  [UsageFrequency.MONTHLY]: { en: 'Monthly', ar: 'شهري' },
  [UsageFrequency.QUARTERLY]: { en: 'Quarterly', ar: 'ربع سنوي' },
  [UsageFrequency.ANNUAL]: { en: 'Annual', ar: 'سنوي' },
  [UsageFrequency.AD_HOC]: { en: 'Ad Hoc', ar: 'حسب الطلب' }
}

export const criticalityLevelLabels: Record<CriticalityLevel, { en: string; ar: string }> = {
  [CriticalityLevel.CRITICAL]: { en: 'Critical', ar: 'حرج' },
  [CriticalityLevel.IMPORTANT]: { en: 'Important', ar: 'مهم' },
  [CriticalityLevel.STANDARD]: { en: 'Standard', ar: 'قياسي' },
  [CriticalityLevel.NICE_TO_HAVE]: { en: 'Nice to Have', ar: 'مستحسن' }
}

export const dataSourceTypeLabels: Record<DataSourceType, { en: string; ar: string }> = {
  [DataSourceType.DATABASE]: { en: 'Database', ar: 'قاعدة بيانات' },
  [DataSourceType.API]: { en: 'API', ar: 'واجهة برمجة' },
  [DataSourceType.FILE]: { en: 'File', ar: 'ملف' },
  [DataSourceType.EXTERNAL_SYSTEM]: { en: 'External System', ar: 'نظام خارجي' },
  [DataSourceType.DATA_WAREHOUSE]: { en: 'Data Warehouse', ar: 'مستودع بيانات' }
}

export const dataRefreshRateLabels: Record<DataRefreshRate, { en: string; ar: string }> = {
  [DataRefreshRate.REAL_TIME]: { en: 'Real-time', ar: 'فوري' },
  [DataRefreshRate.HOURLY]: { en: 'Hourly', ar: 'كل ساعة' },
  [DataRefreshRate.DAILY]: { en: 'Daily', ar: 'يومي' },
  [DataRefreshRate.WEEKLY]: { en: 'Weekly', ar: 'أسبوعي' },
  [DataRefreshRate.ON_DEMAND]: { en: 'On Demand', ar: 'حسب الطلب' }
}

export const chartTypeLabels: Record<ChartType, { en: string; ar: string }> = {
  [ChartType.BAR]: { en: 'Bar Chart', ar: 'مخطط شريطي' },
  [ChartType.COLUMN]: { en: 'Column Chart', ar: 'مخطط عمودي' },
  [ChartType.LINE]: { en: 'Line Chart', ar: 'مخطط خطي' },
  [ChartType.PIE]: { en: 'Pie Chart', ar: 'مخطط دائري' },
  [ChartType.DONUT]: { en: 'Donut Chart', ar: 'مخطط حلقي' },
  [ChartType.AREA]: { en: 'Area Chart', ar: 'مخطط مساحي' },
  [ChartType.SCATTER]: { en: 'Scatter Chart', ar: 'مخطط نقطي' },
  [ChartType.BUBBLE]: { en: 'Bubble Chart', ar: 'مخطط فقاعي' },
  [ChartType.GAUGE]: { en: 'Gauge', ar: 'مقياس' },
  [ChartType.FUNNEL]: { en: 'Funnel', ar: 'قمع' },
  [ChartType.WATERFALL]: { en: 'Waterfall', ar: 'شلال' },
  [ChartType.HEATMAP]: { en: 'Heatmap', ar: 'خريطة حرارية' },
  [ChartType.TREEMAP]: { en: 'Treemap', ar: 'خريطة شجرية' }
}

export const scheduleFrequencyLabels: Record<ScheduleFrequency, { en: string; ar: string }> = {
  [ScheduleFrequency.DAILY]: { en: 'Daily', ar: 'يومي' },
  [ScheduleFrequency.WEEKLY]: { en: 'Weekly', ar: 'أسبوعي' },
  [ScheduleFrequency.MONTHLY]: { en: 'Monthly', ar: 'شهري' },
  [ScheduleFrequency.QUARTERLY]: { en: 'Quarterly', ar: 'ربع سنوي' },
  [ScheduleFrequency.ANNUAL]: { en: 'Annual', ar: 'سنوي' }
}

export const scheduleStatusLabels: Record<ScheduleStatus, { en: string; ar: string }> = {
  [ScheduleStatus.ACTIVE]: { en: 'Active', ar: 'نشط' },
  [ScheduleStatus.PAUSED]: { en: 'Paused', ar: 'متوقف' },
  [ScheduleStatus.EXPIRED]: { en: 'Expired', ar: 'منتهي' },
  [ScheduleStatus.COMPLETED]: { en: 'Completed', ar: 'مكتمل' }
}

export const executionStatusLabels: Record<ExecutionStatus, { en: string; ar: string }> = {
  [ExecutionStatus.SCHEDULED]: { en: 'Scheduled', ar: 'مجدول' },
  [ExecutionStatus.RUNNING]: { en: 'Running', ar: 'قيد التنفيذ' },
  [ExecutionStatus.COMPLETED]: { en: 'Completed', ar: 'مكتمل' },
  [ExecutionStatus.FAILED]: { en: 'Failed', ar: 'فشل' },
  [ExecutionStatus.CANCELLED]: { en: 'Cancelled', ar: 'ملغي' }
}

export const accessLevelLabels: Record<AccessLevel, { en: string; ar: string }> = {
  [AccessLevel.PUBLIC]: { en: 'Public', ar: 'عام' },
  [AccessLevel.INTERNAL]: { en: 'Internal', ar: 'داخلي' },
  [AccessLevel.MANAGEMENT]: { en: 'Management', ar: 'إدارة' },
  [AccessLevel.HR]: { en: 'HR', ar: 'موارد بشرية' },
  [AccessLevel.FINANCE]: { en: 'Finance', ar: 'مالية' },
  [AccessLevel.EXECUTIVE]: { en: 'Executive', ar: 'تنفيذي' },
  [AccessLevel.RESTRICTED]: { en: 'Restricted', ar: 'مقيد' },
  [AccessLevel.CONFIDENTIAL]: { en: 'Confidential', ar: 'سري' }
}

export const reportStatusLabels: Record<ReportStatus, { en: string; ar: string }> = {
  [ReportStatus.ACTIVE]: { en: 'Active', ar: 'نشط' },
  [ReportStatus.INACTIVE]: { en: 'Inactive', ar: 'غير نشط' },
  [ReportStatus.DRAFT]: { en: 'Draft', ar: 'مسودة' },
  [ReportStatus.ARCHIVED]: { en: 'Archived', ar: 'مؤرشف' },
  [ReportStatus.DEPRECATED]: { en: 'Deprecated', ar: 'متوقف' }
}

export const dataModuleLabels: Record<DataModule, { en: string; ar: string }> = {
  // HR Modules
  [DataModule.EMPLOYEES]: { en: 'Employees', ar: 'الموظفين' },
  [DataModule.PAYROLL]: { en: 'Payroll', ar: 'الرواتب' },
  [DataModule.ATTENDANCE]: { en: 'Attendance', ar: 'الحضور' },
  [DataModule.PERFORMANCE]: { en: 'Performance', ar: 'الأداء' },
  [DataModule.RECRUITMENT]: { en: 'Recruitment', ar: 'التوظيف' },
  [DataModule.TRAINING]: { en: 'Training', ar: 'التدريب' },
  [DataModule.BENEFITS]: { en: 'Benefits', ar: 'المزايا' },
  [DataModule.COMPENSATION]: { en: 'Compensation', ar: 'التعويضات' },
  [DataModule.SUCCESSION]: { en: 'Succession', ar: 'التعاقب' },
  [DataModule.GRIEVANCES]: { en: 'Grievances', ar: 'الشكاوى' },
  [DataModule.ORGANIZATIONAL_STRUCTURE]: { en: 'Org Structure', ar: 'الهيكل التنظيمي' },
  [DataModule.JOB_POSITIONS]: { en: 'Job Positions', ar: 'المناصب' },

  // Finance Modules
  [DataModule.INVOICES]: { en: 'Invoices', ar: 'الفواتير' },
  [DataModule.EXPENSES]: { en: 'Expenses', ar: 'المصروفات' },
  [DataModule.PAYMENTS]: { en: 'Payments', ar: 'المدفوعات' },
  [DataModule.TRANSACTIONS]: { en: 'Transactions', ar: 'المعاملات' },
  [DataModule.ACCOUNTS]: { en: 'Accounts', ar: 'الحسابات' },
  [DataModule.BUDGETS]: { en: 'Budgets', ar: 'الميزانيات' },
  [DataModule.TAX]: { en: 'Tax', ar: 'الضرائب' },
  [DataModule.TIME_ENTRIES]: { en: 'Time Entries', ar: 'سجلات الوقت' },

  // Tasks Modules
  [DataModule.TASKS]: { en: 'Tasks', ar: 'المهام' },
  [DataModule.PROJECTS]: { en: 'Projects', ar: 'المشاريع' },
  [DataModule.REMINDERS]: { en: 'Reminders', ar: 'التذكيرات' },
  [DataModule.EVENTS]: { en: 'Events', ar: 'الأحداث' },
  [DataModule.CALENDARS]: { en: 'Calendars', ar: 'التقويمات' },

  // CRM Modules
  [DataModule.CLIENTS]: { en: 'Clients', ar: 'العملاء' },
  [DataModule.CONTACTS]: { en: 'Contacts', ar: 'جهات الاتصال' },
  [DataModule.LEADS]: { en: 'Leads', ar: 'العملاء المحتملين' },
  [DataModule.OPPORTUNITIES]: { en: 'Opportunities', ar: 'الفرص' },
  [DataModule.ACTIVITIES]: { en: 'Activities', ar: 'الأنشطة' },
  [DataModule.CAMPAIGNS]: { en: 'Campaigns', ar: 'الحملات' },
  [DataModule.REFERRALS]: { en: 'Referrals', ar: 'الإحالات' },

  // Sales Modules
  [DataModule.DEALS]: { en: 'Deals', ar: 'الصفقات' },
  [DataModule.PIPELINE]: { en: 'Pipeline', ar: 'خط الأنابيب' },
  [DataModule.QUOTES]: { en: 'Quotes', ar: 'عروض الأسعار' },
  [DataModule.ORDERS]: { en: 'Orders', ar: 'الطلبات' },

  // Legal/Other Modules
  [DataModule.CASES]: { en: 'Cases', ar: 'القضايا' },
  [DataModule.DOCUMENTS]: { en: 'Documents', ar: 'المستندات' },
  [DataModule.ASSETS]: { en: 'Assets', ar: 'الأصول' },
  [DataModule.VIOLATIONS]: { en: 'Violations', ar: 'المخالفات' },
  [DataModule.OTHER]: { en: 'Other', ar: 'أخرى' }
}

// ==================== CATEGORY BY SECTION MAPPING ====================

export const categoriesBySection: Record<ReportSection, ReportCategory[]> = {
  [ReportSection.HR]: [
    ReportCategory.EMPLOYEE_DATA,
    ReportCategory.PAYROLL,
    ReportCategory.ATTENDANCE,
    ReportCategory.TIME_TRACKING,
    ReportCategory.PERFORMANCE,
    ReportCategory.RECRUITMENT,
    ReportCategory.TRAINING,
    ReportCategory.BENEFITS,
    ReportCategory.COMPENSATION,
    ReportCategory.SUCCESSION
  ],
  [ReportSection.FINANCE]: [
    ReportCategory.INVOICES,
    ReportCategory.EXPENSES,
    ReportCategory.PAYMENTS,
    ReportCategory.REVENUE,
    ReportCategory.CASH_FLOW,
    ReportCategory.BUDGETS,
    ReportCategory.FINANCIAL_STATEMENTS,
    ReportCategory.TAX,
    ReportCategory.ACCOUNTS_RECEIVABLE,
    ReportCategory.ACCOUNTS_PAYABLE,
    ReportCategory.PROFITABILITY
  ],
  [ReportSection.TASKS]: [
    ReportCategory.TASKS,
    ReportCategory.PROJECTS,
    ReportCategory.WORKLOAD,
    ReportCategory.DEADLINES,
    ReportCategory.PRODUCTIVITY,
    ReportCategory.REMINDERS,
    ReportCategory.EVENTS
  ],
  [ReportSection.CRM]: [
    ReportCategory.CLIENTS,
    ReportCategory.CONTACTS,
    ReportCategory.LEADS,
    ReportCategory.OPPORTUNITIES,
    ReportCategory.ACTIVITIES,
    ReportCategory.CAMPAIGNS,
    ReportCategory.CUSTOMER_SATISFACTION,
    ReportCategory.REFERRALS
  ],
  [ReportSection.SALES]: [
    ReportCategory.SALES,
    ReportCategory.PIPELINE,
    ReportCategory.FORECASTS,
    ReportCategory.QUOTAS,
    ReportCategory.COMMISSIONS,
    ReportCategory.DEALS,
    ReportCategory.WIN_LOSS,
    ReportCategory.SALES_PERFORMANCE
  ],
  [ReportSection.GENERAL]: [
    ReportCategory.COMPLIANCE,
    ReportCategory.LEGAL,
    ReportCategory.ANALYTICS,
    ReportCategory.EXECUTIVE,
    ReportCategory.OPERATIONAL,
    ReportCategory.STRATEGIC,
    ReportCategory.CUSTOM
  ]
}

export const dataModulesBySection: Record<ReportSection, DataModule[]> = {
  [ReportSection.HR]: [
    DataModule.EMPLOYEES,
    DataModule.PAYROLL,
    DataModule.ATTENDANCE,
    DataModule.PERFORMANCE,
    DataModule.RECRUITMENT,
    DataModule.TRAINING,
    DataModule.BENEFITS,
    DataModule.COMPENSATION,
    DataModule.SUCCESSION,
    DataModule.GRIEVANCES,
    DataModule.ORGANIZATIONAL_STRUCTURE,
    DataModule.JOB_POSITIONS
  ],
  [ReportSection.FINANCE]: [
    DataModule.INVOICES,
    DataModule.EXPENSES,
    DataModule.PAYMENTS,
    DataModule.TRANSACTIONS,
    DataModule.ACCOUNTS,
    DataModule.BUDGETS,
    DataModule.TAX,
    DataModule.TIME_ENTRIES
  ],
  [ReportSection.TASKS]: [
    DataModule.TASKS,
    DataModule.PROJECTS,
    DataModule.REMINDERS,
    DataModule.EVENTS,
    DataModule.CALENDARS
  ],
  [ReportSection.CRM]: [
    DataModule.CLIENTS,
    DataModule.CONTACTS,
    DataModule.LEADS,
    DataModule.OPPORTUNITIES,
    DataModule.ACTIVITIES,
    DataModule.CAMPAIGNS,
    DataModule.REFERRALS
  ],
  [ReportSection.SALES]: [
    DataModule.DEALS,
    DataModule.PIPELINE,
    DataModule.QUOTES,
    DataModule.ORDERS,
    DataModule.CLIENTS
  ],
  [ReportSection.GENERAL]: [
    DataModule.CASES,
    DataModule.DOCUMENTS,
    DataModule.ASSETS,
    DataModule.VIOLATIONS,
    DataModule.OTHER
  ]
}

// ==================== HELPER INTERFACES ====================

export interface ReportParameter {
  parameterId?: string
  parameterName: string
  parameterNameAr?: string
  parameterType: ParameterType
  required: boolean
  defaultValue?: any
  allowedValues?: Array<{
    value: any
    label: string
    labelAr?: string
  }>
  cascading: boolean
  dependsOn?: string
  displayOrder: number
}

export interface ReportFilter {
  filterId?: string
  filterName: string
  filterNameAr?: string
  filterField: string
  filterOperator: FilterOperator
  filterValue?: any
  filterType: 'fixed' | 'dynamic' | 'user_input'
  required: boolean
  displayInUI: boolean
}

export interface ReportColumn {
  columnId?: string
  columnName: string
  columnNameAr?: string
  dataField: string
  dataType: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'currency' | 'percentage'
  format?: string
  width?: number
  alignment: 'left' | 'center' | 'right'
  sortable: boolean
  sortOrder?: 'asc' | 'desc'
  defaultSort?: boolean
  filterable: boolean
  groupable: boolean
  aggregatable: boolean
  aggregationType?: 'sum' | 'average' | 'count' | 'min' | 'max' | 'distinct_count'
  calculated: boolean
  calculationFormula?: string
  visible: boolean
  frozen: boolean
  displayOrder: number
}

export interface ReportChart {
  chartId?: string
  chartType: ChartType
  chartTitle: string
  chartTitleAr?: string
  dataSource: {
    xAxis: string
    yAxis: string | string[]
    series?: Array<{
      seriesName: string
      dataField: string
      color?: string
      chartType?: string
    }>
  }
  chartOptions: {
    showLegend: boolean
    legendPosition?: 'top' | 'bottom' | 'left' | 'right'
    showDataLabels: boolean
    showGrid: boolean
    colorPalette?: string[]
    height?: number
    width?: number
  }
  displayOrder: number
}

export interface KPICard {
  kpiId?: string
  kpiName: string
  kpiNameAr?: string
  kpiValue: {
    dataField: string
    aggregationType: 'sum' | 'average' | 'count' | 'percentage'
    format?: string
  }
  kpiTrend?: {
    comparisonPeriod: 'previous_period' | 'same_period_last_year' | 'target'
    trendDataField?: string
    showTrendArrow: boolean
    showTrendPercentage: boolean
  }
  kpiTarget?: {
    targetValue: number
    showProgressBar: boolean
    thresholds?: Array<{
      from: number
      to: number
      color: string
      label?: string
    }>
  }
  icon?: string
  color?: string
  displayOrder: number
}

export interface ScheduleExecution {
  executionId: string
  scheduledTime: string
  actualRunTime?: string
  status: ExecutionStatus
  duration?: number
  recordsProcessed?: number
  errorMessage?: string
  outputFileUrl?: string
}

export interface DistributionRecipient {
  recipientType: 'user' | 'role' | 'department' | 'email' | 'group'
  recipientId?: string
  recipientName?: string
  recipientEmail?: string
  deliveryMethod: 'email' | 'portal' | 'shared_folder' | 'ftp' | 'api'
  emailDelivery?: {
    subject: string
    subjectAr?: string
    body?: string
    bodyAr?: string
    attachReport: boolean
    format: OutputFormat
    embedInEmail: boolean
  }
}

export interface AuditEntry {
  auditId: string
  actionType: 'created' | 'modified' | 'executed' | 'exported' | 'scheduled' | 'shared' | 'deleted' | 'accessed'
  actionDate: string
  performedBy: string
  performedByName?: string
  details?: string
  ipAddress?: string
}

// ==================== MAIN INTERFACE ====================

export interface Report {
  reportId: string
  reportCode: string
  recordNumber?: string

  // Report Details
  reportName: string
  reportNameAr?: string
  reportTitle?: string
  reportTitleAr?: string
  reportDescription?: string
  reportDescriptionAr?: string

  // Classification
  reportSection: ReportSection
  reportCategory: ReportCategory
  reportSubCategory?: string
  reportType: ReportType
  reportFormat: ReportFormat

  // Output
  outputFormats: OutputFormat[]
  defaultOutputFormat: OutputFormat

  // Tags
  tags?: string[]
  keywords?: string[]

  // Version
  version?: string
  versionDate?: string

  // Owner
  reportOwner: {
    ownerId: string
    ownerName: string
    ownerRole?: string
    department?: string
  }

  // Purpose
  businessPurpose?: string
  businessValue?: string

  // Usage
  usageFrequency: UsageFrequency
  criticalityLevel: CriticalityLevel

  // Data Source
  dataSource: {
    primarySources: Array<{
      sourceType: DataSourceType
      sourceName: string
      sourceDescription?: string
    }>
    dataModules: Array<{
      moduleName: DataModule
      moduleFields: string[]
    }>
    dataRefreshRate: DataRefreshRate
    lastDataRefresh?: string
    nextDataRefresh?: string
  }

  // Parameters & Filters
  parametersFilters: {
    parameters: ReportParameter[]
    filters: ReportFilter[]
    dateParameters?: {
      hasDateRange: boolean
      dateRangeType: 'fixed' | 'relative' | 'fiscal'
      relativeDateRange?: {
        rangeType: string
        customDays?: number
      }
    }
  }

  // Report Structure
  reportStructure: {
    columns: ReportColumn[]
    grouping?: {
      enabled: boolean
      groupByFields: Array<{
        field: string
        order: number
        showGroupHeader: boolean
        showGroupFooter: boolean
      }>
      expandedByDefault: boolean
    }
    sorting?: {
      defaultSort: Array<{
        field: string
        direction: 'asc' | 'desc'
        priority: number
      }>
      allowUserSort: boolean
      multiColumnSort: boolean
    }
    pagination?: {
      enabled: boolean
      pageSize: number
      pageSizeOptions?: number[]
      showPageSizeSelector: boolean
    }
    summary?: {
      showGrandTotal: boolean
      summaryRows: Array<{
        rowType: 'grand_total' | 'sub_total' | 'average' | 'count'
        calculations: Array<{
          field: string
          aggregationType: string
          label?: string
        }>
      }>
    }
  }

  // Visualization
  visualization?: {
    charts: ReportChart[]
    kpiCards?: KPICard[]
  }

  // Scheduling
  scheduling?: {
    scheduled: boolean
    scheduleType: 'recurring' | 'one_time'
    recurrence?: {
      frequency: ScheduleFrequency
      startDate: string
      endDate?: string
      neverEnds: boolean
      time?: string
      daysOfWeek?: string[]
      dayOfMonth?: number
    }
    scheduleStatus: ScheduleStatus
    executionHistory: ScheduleExecution[]
    lastRunDate?: string
    nextRunDate?: string
    totalRuns: number
    successfulRuns: number
    failedRuns: number
  }

  // Distribution
  distribution?: {
    autoDistribute: boolean
    distributionList: DistributionRecipient[]
  }

  // Access Control
  accessControl: {
    accessLevel: AccessLevel
    allowedRoles: Array<{
      role: string
      permissions: string[]
    }>
    allowedUsers?: Array<{
      userId: string
      userName: string
      permissions: string[]
    }>
    dataSecurity: {
      rowLevelSecurity: boolean
      columnLevelSecurity: boolean
      containsSensitiveData: boolean
      dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
      encryptionRequired: boolean
    }
    auditLogging: {
      logAccess: boolean
      logChanges: boolean
      logExports: boolean
    }
  }

  // Performance
  performance?: {
    queryOptimization: {
      indexed: boolean
      cacheEnabled: boolean
      cacheDuration?: number
    }
    performanceMetrics: {
      averageExecutionTime?: number
      maxExecutionTime?: number
      performanceRating?: 'excellent' | 'good' | 'fair' | 'poor'
      optimizationNeeded: boolean
    }
  }

  // Export Format Options
  exportFormat: {
    availableFormats: OutputFormat[]
    defaultFormat: OutputFormat
    pdfOptions?: {
      orientation: 'portrait' | 'landscape'
      pageSize: 'A4' | 'A3' | 'letter' | 'legal'
      headerFooter: boolean
      watermark?: {
        enabled: boolean
        text?: string
        opacity?: number
      }
    }
    excelOptions?: {
      includeFormulas: boolean
      includeFormatting: boolean
      autoFitColumns: boolean
      freezePanes: boolean
      sheetName?: string
    }
  }

  // Status
  status: ReportStatus

  // Usage stats
  runCount: number
  lastRunDate?: string

  // Favorite
  isFavorite?: boolean

  // Compliance & Audit
  complianceAudit?: {
    regulatoryCompliance: {
      gdprCompliant?: boolean
      dataPrivacyCompliant: boolean
      accessLogged: boolean
    }
    auditTrail: AuditEntry[]
  }

  // Documentation
  documentation?: {
    reportDocumentation: string
    reportDocumentationAr?: string
    userGuide?: {
      guideUrl?: string
      instructions: string
      instructionsAr?: string
    }
  }

  // Office
  officeId?: string

  // Audit
  createdBy: string
  createdByName?: string
  updatedBy?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

// ==================== INPUT TYPES ====================

export interface ReportFilters {
  status?: ReportStatus
  reportSection?: ReportSection
  reportCategory?: ReportCategory
  reportType?: ReportType
  accessLevel?: AccessLevel
  search?: string
  officeId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isFavorite?: boolean
}

export type CreateReportInput = Omit<Report, 'reportId' | 'recordNumber' | 'createdAt' | 'updatedAt' | 'runCount'>

export type UpdateReportInput = Partial<CreateReportInput>

// ==================== API FUNCTIONS ====================

export const reportsApi = {
  // Get all reports
  getAll: async (filters?: ReportFilters): Promise<Report[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
    }
    const response = await api.get(`/reports?${params.toString()}`)
    return response.data
  },

  // Get single report
  getById: async (id: string): Promise<Report> => {
    const response = await api.get(`/reports/${id}`)
    return response.data
  },

  // Get reports by category
  getByCategory: async (category: ReportCategory): Promise<Report[]> => {
    const response = await api.get(`/reports/category/${category}`)
    return response.data
  },

  // Get reports by section
  getBySection: async (section: ReportSection): Promise<Report[]> => {
    const response = await api.get(`/reports/section/${section}`)
    return response.data
  },

  // Create report
  create: async (data: CreateReportInput): Promise<Report> => {
    const response = await api.post('/reports', data)
    return response.data
  },

  // Update report
  update: async (id: string, data: UpdateReportInput): Promise<Report> => {
    const response = await api.put(`/reports/${id}`, data)
    return response.data
  },

  // Delete report
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`)
  },

  // Bulk delete
  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/reports/bulk-delete', { ids })
  },

  // Run report
  runReport: async (id: string, parameters?: Record<string, any>): Promise<{
    data: any[]
    metadata: {
      executionTime: number
      recordCount: number
      generatedAt: string
    }
  }> => {
    const response = await api.post(`/reports/${id}/run`, { parameters })
    return response.data
  },

  // Export report
  exportReport: async (id: string, format: OutputFormat, parameters?: Record<string, any>): Promise<{
    fileUrl: string
    fileName: string
    format: OutputFormat
  }> => {
    const response = await api.post(`/reports/${id}/export`, { format, parameters })
    return response.data
  },

  // Schedule report
  scheduleReport: async (id: string, schedule: {
    frequency: ScheduleFrequency
    startDate: string
    endDate?: string
    time: string
    distributionList?: DistributionRecipient[]
  }): Promise<Report> => {
    const response = await api.post(`/reports/${id}/schedule`, schedule)
    return response.data
  },

  // Pause schedule
  pauseSchedule: async (id: string): Promise<Report> => {
    const response = await api.post(`/reports/${id}/schedule/pause`)
    return response.data
  },

  // Resume schedule
  resumeSchedule: async (id: string): Promise<Report> => {
    const response = await api.post(`/reports/${id}/schedule/resume`)
    return response.data
  },

  // Get execution history
  getExecutionHistory: async (id: string): Promise<ScheduleExecution[]> => {
    const response = await api.get(`/reports/${id}/executions`)
    return response.data
  },

  // Duplicate report
  duplicate: async (id: string, newName: string): Promise<Report> => {
    const response = await api.post(`/reports/${id}/duplicate`, { newName })
    return response.data
  },

  // Get report stats
  getStats: async (officeId?: string): Promise<{
    totalReports: number
    activeReports: number
    scheduledReports: number
    byCategory: Record<string, number>
    byType: Record<string, number>
    mostUsedReports: Array<{ reportId: string; reportName: string; runCount: number }>
    recentExecutions: Array<{ reportId: string; reportName: string; executedAt: string }>
  }> => {
    const params = officeId ? `?officeId=${officeId}` : ''
    const response = await api.get(`/reports/stats${params}`)
    return response.data
  },

  // Get available data sources
  getDataSources: async (): Promise<Array<{
    moduleId: string
    moduleName: string
    moduleNameAr: string
    fields: Array<{
      fieldId: string
      fieldName: string
      fieldNameAr: string
      dataType: string
    }>
  }>> => {
    const response = await api.get('/reports/data-sources')
    return response.data
  },

  // Preview report data
  previewData: async (config: {
    dataModules: DataModule[]
    columns: string[]
    filters?: ReportFilter[]
    limit?: number
  }): Promise<{
    data: any[]
    columns: string[]
    recordCount: number
  }> => {
    const response = await api.post('/reports/preview', config)
    return response.data
  },

  // Add to favorites
  addToFavorites: async (id: string): Promise<void> => {
    await api.post(`/reports/${id}/favorite`)
  },

  // Remove from favorites
  removeFromFavorites: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}/favorite`)
  },

  // Get favorites
  getFavorites: async (): Promise<Report[]> => {
    const response = await api.get('/reports/favorites')
    return response.data
  },

  // Share report
  shareReport: async (id: string, recipients: Array<{
    userId?: string
    email?: string
    permissions: string[]
  }>): Promise<void> => {
    await api.post(`/reports/${id}/share`, { recipients })
  }
}
