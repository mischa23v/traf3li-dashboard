/**
 * Sidebar Defaults
 * Fallback configuration when API is unavailable
 * Used by useSidebarConfig hook as placeholderData
 */

import { ROUTES } from '@/constants/routes'
import type {
  FirmType,
  SidebarConfig,
  SidebarItem,
  SidebarModule,
  ModuleTierMap,
} from '@/types/sidebar'

// 
// MODULE TIER MAPPING
// 

/**
 * Defines which firm tiers can see each module
 * Used for client-side filtering when API is unavailable
 */
export const MODULE_TIERS: ModuleTierMap = {
  // Available to all tiers
  productivity: ['solo', 'small', 'large'],
  legalWork: ['solo', 'small', 'large'],
  clients: ['solo', 'small', 'large'],
  billing: ['solo', 'small', 'large'],
  documents: ['solo', 'small', 'large'],
  knowledgeCenter: ['solo', 'small', 'large'],
  market: ['solo', 'small', 'large'], // Conditional on moduleSettings.marketEnabled

  // Small and Large only
  hr: ['small', 'large'],

  // Large only (Enterprise)
  finance: ['large'],
  saudiCompliance: ['large'],
  operations: ['large'],
}

/**
 * Check if a module is visible for a given firm type
 */
export function isModuleVisibleForTier(
  moduleId: string,
  firmType: FirmType
): boolean {
  const tiers = MODULE_TIERS[moduleId]
  return tiers ? tiers.includes(firmType) : false
}

// 
// BASIC SECTION ITEMS (Always visible)
// 

export const BASIC_ITEMS: SidebarItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    labelAr: 'نظرة عامة',
    icon: 'LayoutDashboard',
    path: ROUTES.dashboard.overview,
    order: 1,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    labelAr: 'التقويم',
    icon: 'Calendar',
    path: ROUTES.dashboard.calendar,
    order: 2,
  },
  {
    id: 'appointments',
    label: 'Appointments',
    labelAr: 'المواعيد',
    icon: 'CalendarClock',
    path: ROUTES.dashboard.appointments,
    order: 3,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    labelAr: 'المهام',
    icon: 'CheckSquare',
    path: ROUTES.dashboard.tasks.list,
    order: 4,
  },
  {
    id: 'cases',
    label: 'Cases',
    labelAr: 'القضايا',
    icon: 'Briefcase',
    path: ROUTES.dashboard.cases.list,
    order: 5,
  },
  {
    id: 'contacts',
    label: 'Contacts',
    labelAr: 'جهات الاتصال',
    icon: 'Users',
    path: ROUTES.dashboard.contacts.list,
    order: 6,
  },
  {
    id: 'reports',
    label: 'Reports',
    labelAr: 'التقارير',
    icon: 'BarChart2',
    path: ROUTES.dashboard.reports.list,
    order: 7,
  },
]

// 
// FOOTER ITEMS
// 

export const FOOTER_ITEMS: SidebarItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    labelAr: 'الإعدادات',
    icon: 'Settings',
    path: ROUTES.settings.index,
    order: 1,
  },
  {
    id: 'help',
    label: 'Help',
    labelAr: 'المساعدة',
    icon: 'HelpCircle',
    path: ROUTES.dashboard.help,
    order: 2,
  },
]

// 
// MODULE DEFINITIONS
// 

const PRODUCTIVITY_MODULE: SidebarModule = {
  id: 'productivity',
  label: 'Productivity',
  labelAr: 'الإنتاجية',
  icon: 'Zap',
  order: 1,
  items: [
    {
      id: 'reminders',
      label: 'Reminders',
      labelAr: 'التذكيرات',
      icon: 'Bell',
      path: ROUTES.dashboard.tasks.reminders.list,
      order: 1,
    },
    {
      id: 'events',
      label: 'Events',
      labelAr: 'الفعاليات',
      icon: 'CalendarDays',
      path: ROUTES.dashboard.tasks.events.list,
      order: 2,
    },
    {
      id: 'gantt',
      label: 'Gantt Chart',
      labelAr: 'مخطط غانت',
      icon: 'GanttChart',
      path: ROUTES.dashboard.tasks.gantt,
      order: 3,
    },
  ],
}

const LEGAL_WORK_MODULE: SidebarModule = {
  id: 'legalWork',
  label: 'Legal Work',
  labelAr: 'العمل القانوني',
  icon: 'Scale',
  order: 2,
  items: [
    {
      id: 'casePipeline',
      label: 'Case Pipeline',
      labelAr: 'مسار القضايا',
      icon: 'GitBranch',
      path: ROUTES.dashboard.cases.pipeline,
      order: 1,
    },
    {
      id: 'caseBrainstorm',
      label: 'Case Brainstorm',
      labelAr: 'عصف ذهني للقضايا',
      icon: 'Lightbulb',
      path: ROUTES.dashboard.notion,
      order: 2,
    },
    {
      id: 'caseInsights',
      label: 'Case Insights',
      labelAr: 'رؤى القضايا',
      icon: 'Brain',
      path: ROUTES.dashboard.ml.analytics,
      order: 3,
    },
    {
      id: 'deadlines',
      label: 'Deadlines',
      labelAr: 'المواعيد النهائية',
      icon: 'Clock',
      path: ROUTES.dashboard.tasks.list,
      order: 4,
    },
    {
      id: 'conflictOfInterest',
      label: 'Conflict of Interest',
      labelAr: 'تضارب المصالح',
      icon: 'AlertTriangle',
      path: ROUTES.dashboard.cases.list,
      order: 5,
    },
  ],
}

const CLIENTS_MODULE: SidebarModule = {
  id: 'clients',
  label: 'Clients',
  labelAr: 'العملاء',
  icon: 'Users',
  order: 3,
  items: [
    {
      id: 'clientPipeline',
      label: 'Pipeline',
      labelAr: 'مسار العملاء',
      icon: 'GitBranch',
      path: ROUTES.dashboard.crm.pipeline,
      order: 1,
    },
    {
      id: 'leads',
      label: 'Leads',
      labelAr: 'العملاء المحتملين',
      icon: 'UserPlus',
      path: ROUTES.dashboard.crm.leads.list,
      order: 2,
    },
    {
      id: 'activities',
      label: 'Activities',
      labelAr: 'الأنشطة',
      icon: 'Activity',
      path: ROUTES.dashboard.crm.activities.list,
      order: 3,
    },
  ],
}

// Growth module (for small/large firms - extends Clients)
const GROWTH_MODULE: SidebarModule = {
  id: 'growth',
  label: 'Growth',
  labelAr: 'النمو',
  icon: 'TrendingUp',
  order: 3,
  items: [
    {
      id: 'crmDashboard',
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: 'LayoutDashboard',
      path: ROUTES.dashboard.crm.index,
      order: 1,
    },
    {
      id: 'clientPipeline',
      label: 'Pipeline',
      labelAr: 'مسار العملاء',
      icon: 'GitBranch',
      path: ROUTES.dashboard.crm.pipeline,
      order: 2,
    },
    {
      id: 'leads',
      label: 'Leads',
      labelAr: 'العملاء المحتملين',
      icon: 'UserPlus',
      path: ROUTES.dashboard.crm.leads.list,
      order: 3,
    },
    {
      id: 'activities',
      label: 'Activities',
      labelAr: 'الأنشطة',
      icon: 'Activity',
      path: ROUTES.dashboard.crm.activities.list,
      order: 4,
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      labelAr: 'الحملات',
      icon: 'Megaphone',
      path: ROUTES.dashboard.crm.campaigns.list,
      order: 5,
    },
  ],
}

const BILLING_MODULE: SidebarModule = {
  id: 'billing',
  label: 'Billing',
  labelAr: 'الفواتير',
  icon: 'Receipt',
  order: 4,
  items: [
    {
      id: 'invoices',
      label: 'Invoices',
      labelAr: 'الفواتير',
      icon: 'FileText',
      path: ROUTES.dashboard.finance.invoices.list,
      order: 1,
    },
    {
      id: 'payments',
      label: 'Payments',
      labelAr: 'المدفوعات',
      icon: 'CreditCard',
      path: ROUTES.dashboard.finance.payments.list,
      order: 2,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      labelAr: 'المصروفات',
      icon: 'Wallet',
      path: ROUTES.dashboard.finance.expenses.list,
      order: 3,
    },
    {
      id: 'trustAccounts',
      label: 'Trust Accounts',
      labelAr: 'حسابات الأمانة',
      icon: 'Shield',
      path: ROUTES.dashboard.finance.retainers.list,
      order: 4,
    },
    {
      id: 'timeTracking',
      label: 'Time Tracking',
      labelAr: 'تتبع الوقت',
      icon: 'Clock',
      path: ROUTES.dashboard.finance.timeTracking.list,
      order: 5,
    },
  ],
}

const DOCUMENTS_MODULE: SidebarModule = {
  id: 'documents',
  label: 'Documents',
  labelAr: 'المستندات',
  icon: 'FolderOpen',
  order: 5,
  items: [
    {
      id: 'allDocuments',
      label: 'All Documents',
      labelAr: 'جميع المستندات',
      icon: 'Files',
      path: ROUTES.dashboard.documents.list,
      order: 1,
    },
    {
      id: 'templates',
      label: 'Templates',
      labelAr: 'القوالب',
      icon: 'FileText',
      path: ROUTES.dashboard.invoiceTemplates.list,
      order: 2,
    },
    {
      id: 'eSignatures',
      label: 'E-Signatures',
      labelAr: 'التوقيعات الإلكترونية',
      icon: 'PenTool',
      path: ROUTES.dashboard.documents.list,
      order: 3,
    },
  ],
}

const KNOWLEDGE_CENTER_MODULE: SidebarModule = {
  id: 'knowledgeCenter',
  label: 'Knowledge Center',
  labelAr: 'مركز المعرفة',
  icon: 'BookOpen',
  order: 6,
  items: [
    {
      id: 'laws',
      label: 'Laws',
      labelAr: 'الأنظمة',
      icon: 'Scale',
      path: ROUTES.dashboard.knowledge.laws.list,
      order: 1,
    },
    {
      id: 'judgments',
      label: 'Judgments',
      labelAr: 'الأحكام',
      icon: 'Gavel',
      path: ROUTES.dashboard.knowledge.judgments.list,
      order: 2,
    },
    {
      id: 'forms',
      label: 'Forms',
      labelAr: 'النماذج',
      icon: 'FileInput',
      path: ROUTES.dashboard.knowledge.forms.list,
      order: 3,
    },
  ],
}

const MARKET_MODULE: SidebarModule = {
  id: 'market',
  label: 'Market',
  labelAr: 'السوق',
  icon: 'Store',
  order: 7,
  isOptional: true,
  items: [
    {
      id: 'browseJobs',
      label: 'Browse Jobs',
      labelAr: 'تصفح الوظائف',
      icon: 'Search',
      path: ROUTES.dashboard.jobs.browse,
      order: 1,
    },
    {
      id: 'myServices',
      label: 'My Services',
      labelAr: 'خدماتي',
      icon: 'Briefcase',
      path: ROUTES.dashboard.jobs.myServices,
      order: 2,
    },
    {
      id: 'reputation',
      label: 'Reputation',
      labelAr: 'السمعة',
      icon: 'Award',
      path: ROUTES.dashboard.reputation.overview,
      order: 3,
    },
  ],
}

const HR_MODULE: SidebarModule = {
  id: 'hr',
  label: 'HR',
  labelAr: 'الموارد البشرية',
  icon: 'Users',
  order: 8,
  items: [
    {
      id: 'people',
      label: 'People',
      labelAr: 'الموظفين',
      icon: 'Users',
      path: ROUTES.dashboard.hr.employees.list,
      order: 1,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      labelAr: 'الحضور',
      icon: 'Clock',
      path: ROUTES.dashboard.hr.attendance.list,
      order: 2,
    },
    {
      id: 'leave',
      label: 'Leave',
      labelAr: 'الإجازات',
      icon: 'Calendar',
      path: ROUTES.dashboard.hr.leave.list,
      order: 3,
    },
    {
      id: 'payroll',
      label: 'Payroll',
      labelAr: 'الرواتب',
      icon: 'Banknote',
      path: ROUTES.dashboard.hr.payroll.list,
      order: 4,
    },
    {
      id: 'workloads',
      label: 'Workloads',
      labelAr: 'أعباء العمل',
      icon: 'BarChart',
      path: ROUTES.dashboard.hr.analytics.list,
      order: 5,
    },
  ],
}

const FINANCE_MODULE: SidebarModule = {
  id: 'finance',
  label: 'Finance',
  labelAr: 'المالية',
  icon: 'Landmark',
  order: 9,
  items: [
    {
      id: 'financeDashboard',
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: 'LayoutDashboard',
      path: ROUTES.dashboard.finance.overview,
      order: 1,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      labelAr: 'المعاملات',
      icon: 'ArrowLeftRight',
      path: ROUTES.dashboard.finance.transactions.list,
      order: 2,
    },
    {
      id: 'bankReconciliation',
      label: 'Bank Reconciliation',
      labelAr: 'تسوية البنك',
      icon: 'FileCheck',
      path: ROUTES.dashboard.finance.reconciliation.list,
      order: 3,
    },
    {
      id: 'chartOfAccounts',
      label: 'Chart of Accounts',
      labelAr: 'شجرة الحسابات',
      icon: 'List',
      path: ROUTES.dashboard.finance.chartOfAccounts,
      order: 4,
    },
    {
      id: 'financeReports',
      label: 'Reports',
      labelAr: 'التقارير',
      icon: 'PieChart',
      path: ROUTES.dashboard.finance.reports.list,
      order: 5,
    },
    {
      id: 'budgets',
      label: 'Budgets',
      labelAr: 'الميزانيات',
      icon: 'PiggyBank',
      path: ROUTES.dashboard.finance.budgets.list,
      order: 6,
    },
  ],
}

const SAUDI_COMPLIANCE_MODULE: SidebarModule = {
  id: 'saudiCompliance',
  label: 'Saudi Compliance',
  labelAr: 'الامتثال السعودي',
  icon: 'ShieldCheck',
  order: 10,
  items: [
    {
      id: 'complianceDashboard',
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: 'LayoutDashboard',
      path: ROUTES.dashboard.finance.saudiBanking.compliance.index,
      order: 1,
    },
    {
      id: 'zatca',
      label: 'ZATCA',
      labelAr: 'الزكاة والضريبة',
      icon: 'FileText',
      path: ROUTES.dashboard.finance.saudiBanking.index,
      order: 2,
    },
    {
      id: 'gosi',
      label: 'GOSI',
      labelAr: 'التأمينات الاجتماعية',
      icon: 'Building',
      path: ROUTES.dashboard.finance.saudiBanking.gosi.index,
      order: 3,
    },
    {
      id: 'wps',
      label: 'WPS',
      labelAr: 'حماية الأجور',
      icon: 'Wallet',
      path: ROUTES.dashboard.finance.saudiBanking.wps.index,
      order: 4,
    },
    {
      id: 'iqamaTracker',
      label: 'Iqama Tracker',
      labelAr: 'متابعة الإقامة',
      icon: 'IdCard',
      path: ROUTES.dashboard.finance.saudiBanking.compliance.iqamaAlerts,
      order: 5,
    },
  ],
}

const OPERATIONS_MODULE: SidebarModule = {
  id: 'operations',
  label: 'Operations',
  labelAr: 'العمليات',
  icon: 'Cog',
  order: 11,
  items: [
    {
      id: 'assets',
      label: 'Assets',
      labelAr: 'الأصول',
      icon: 'Box',
      path: ROUTES.dashboard.assets.list,
      order: 1,
    },
    {
      id: 'procurement',
      label: 'Procurement',
      labelAr: 'المشتريات',
      icon: 'ShoppingCart',
      path: ROUTES.dashboard.buying.purchaseOrders.list,
      order: 2,
    },
    {
      id: 'vendors',
      label: 'Vendors',
      labelAr: 'الموردين',
      icon: 'Building2',
      path: ROUTES.dashboard.finance.vendors.list,
      order: 3,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      labelAr: 'المخزون',
      icon: 'Package',
      path: ROUTES.dashboard.inventory.list,
      order: 4,
    },
  ],
}

// 
// MODULE SETS BY FIRM TYPE
// 

/**
 * Get modules for a specific firm type
 */
export function getModulesForFirmType(firmType: FirmType): SidebarModule[] {
  const modules: SidebarModule[] = []

  // Common modules (all tiers)
  modules.push(PRODUCTIVITY_MODULE)
  modules.push(LEGAL_WORK_MODULE)

  // Clients vs Growth
  if (firmType === 'solo') {
    modules.push(CLIENTS_MODULE)
  } else {
    modules.push(GROWTH_MODULE)
  }

  modules.push(BILLING_MODULE)
  modules.push(DOCUMENTS_MODULE)
  modules.push(KNOWLEDGE_CENTER_MODULE)
  modules.push(MARKET_MODULE)

  // Small and Large only
  if (firmType === 'small' || firmType === 'large') {
    modules.push(HR_MODULE)
  }

  // Large only (Enterprise)
  if (firmType === 'large') {
    modules.push(FINANCE_MODULE)
    modules.push(SAUDI_COMPLIANCE_MODULE)
    modules.push(OPERATIONS_MODULE)
  }

  return modules.sort((a, b) => a.order - b.order)
}

// 
// DEFAULT CONFIG
// 

/**
 * Default sidebar configuration (fallback when API unavailable)
 * Defaults to 'solo' tier for maximum compatibility
 */
export const SIDEBAR_DEFAULTS: SidebarConfig = {
  firmType: 'solo',
  language: 'en',
  sections: {
    basic: {
      label: 'Basic',
      labelAr: 'الأساسية',
      items: BASIC_ITEMS,
    },
    recents: {
      id: 'recents',
      label: 'Recents',
      labelAr: 'الأخيرة',
      icon: 'Clock',
      maxItems: 5,
      items: [],
    },
    modules: {
      label: 'Modules',
      labelAr: 'الوحدات',
      items: getModulesForFirmType('solo'),
    },
    footer: {
      items: FOOTER_ITEMS,
    },
  },
  meta: {
    totalBaseItems: BASIC_ITEMS.length,
    totalModules: getModulesForFirmType('solo').length,
    totalModuleItems: getModulesForFirmType('solo').reduce(
      (acc, m) => acc + m.items.length,
      0
    ),
    totalItems:
      BASIC_ITEMS.length +
      FOOTER_ITEMS.length +
      getModulesForFirmType('solo').reduce((acc, m) => acc + m.items.length, 0),
  },
}

/**
 * Create a sidebar config for a specific firm type
 */
export function createSidebarConfig(firmType: FirmType): SidebarConfig {
  const modules = getModulesForFirmType(firmType)

  return {
    firmType,
    language: 'en',
    sections: {
      basic: {
        label: 'Basic',
        labelAr: 'الأساسية',
        items: BASIC_ITEMS,
      },
      recents: {
        id: 'recents',
        label: 'Recents',
        labelAr: 'الأخيرة',
        icon: 'Clock',
        maxItems: 5,
        items: [],
      },
      modules: {
        label: 'Modules',
        labelAr: 'الوحدات',
        items: modules,
      },
      footer: {
        items: FOOTER_ITEMS,
      },
    },
    meta: {
      totalBaseItems: BASIC_ITEMS.length,
      totalModules: modules.length,
      totalModuleItems: modules.reduce((acc, m) => acc + m.items.length, 0),
      totalItems:
        BASIC_ITEMS.length +
        FOOTER_ITEMS.length +
        modules.reduce((acc, m) => acc + m.items.length, 0),
    },
  }
}
