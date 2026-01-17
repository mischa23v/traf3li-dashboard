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
    label: 'sidebar.nav.items.overview',
    labelAr: 'sidebar.nav.items.overview',
    icon: 'LayoutDashboard',
    path: ROUTES.dashboard.home,
    order: 1,
  },
  {
    id: 'calendar',
    label: 'sidebar.nav.items.calendar',
    labelAr: 'sidebar.nav.items.calendar',
    icon: 'Calendar',
    path: ROUTES.dashboard.calendar,
    order: 2,
  },
  {
    id: 'appointments',
    label: 'sidebar.nav.items.appointments',
    labelAr: 'sidebar.nav.items.appointments',
    icon: 'CalendarClock',
    path: ROUTES.dashboard.appointments,
    order: 3,
  },
  {
    id: 'tasks',
    label: 'sidebar.nav.items.tasks',
    labelAr: 'sidebar.nav.items.tasks',
    icon: 'CheckSquare',
    path: ROUTES.dashboard.tasks.list,
    order: 4,
  },
  {
    id: 'cases',
    label: 'sidebar.nav.items.cases',
    labelAr: 'sidebar.nav.items.cases',
    icon: 'Briefcase',
    path: ROUTES.dashboard.cases.list,
    order: 5,
  },
  {
    id: 'contacts',
    label: 'sidebar.nav.items.contacts',
    labelAr: 'sidebar.nav.items.contacts',
    icon: 'Users',
    path: ROUTES.dashboard.contacts.list,
    order: 6,
  },
  {
    id: 'reports',
    label: 'sidebar.nav.items.reports',
    labelAr: 'sidebar.nav.items.reports',
    icon: 'BarChart2',
    path: ROUTES.dashboard.reports.list,
    order: 7,
  },
]

//
// OTHER SECTION ITEMS (Settings, Help)
//

export const OTHER_ITEMS: SidebarItem[] = [
  {
    id: 'settings',
    label: 'sidebar.nav.items.settings',
    labelAr: 'sidebar.nav.items.settings',
    icon: 'Settings',
    path: ROUTES.settings.index,
    order: 1,
  },
  {
    id: 'help',
    label: 'sidebar.nav.items.help',
    labelAr: 'sidebar.nav.items.help',
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
  label: 'sidebar.nav.modules.productivity',
  labelAr: 'sidebar.nav.modules.productivity',
  icon: 'Zap',
  order: 1,
  items: [
    {
      id: 'reminders',
      label: 'sidebar.nav.items.reminders',
      labelAr: 'sidebar.nav.items.reminders',
      icon: 'Bell',
      path: ROUTES.dashboard.tasks.reminders.list,
      order: 1,
    },
    {
      id: 'events',
      label: 'sidebar.nav.items.events',
      labelAr: 'sidebar.nav.items.events',
      icon: 'CalendarDays',
      path: ROUTES.dashboard.tasks.events.list,
      order: 2,
    },
    {
      id: 'gantt',
      label: 'sidebar.nav.items.gantt',
      labelAr: 'sidebar.nav.items.gantt',
      icon: 'GanttChart',
      path: ROUTES.dashboard.tasks.gantt,
      order: 3,
    },
  ],
}

const LEGAL_WORK_MODULE: SidebarModule = {
  id: 'legalWork',
  label: 'sidebar.nav.modules.legalWork',
  labelAr: 'sidebar.nav.modules.legalWork',
  icon: 'Scale',
  order: 2,
  items: [
    {
      id: 'casePipeline',
      label: 'sidebar.nav.items.casePipeline',
      labelAr: 'sidebar.nav.items.casePipeline',
      icon: 'GitBranch',
      path: ROUTES.dashboard.cases.pipeline,
      order: 1,
    },
    {
      id: 'caseBrainstorm',
      label: 'sidebar.nav.items.caseBrainstorm',
      labelAr: 'sidebar.nav.items.caseBrainstorm',
      icon: 'Lightbulb',
      path: ROUTES.dashboard.notion,
      order: 2,
    },
    {
      id: 'caseInsights',
      label: 'sidebar.nav.items.caseInsights',
      labelAr: 'sidebar.nav.items.caseInsights',
      icon: 'Brain',
      path: ROUTES.dashboard.ml.analytics,
      order: 3,
    },
    {
      id: 'deadlines',
      label: 'sidebar.nav.items.deadlines',
      labelAr: 'sidebar.nav.items.deadlines',
      icon: 'Clock',
      path: ROUTES.dashboard.tasks.list,
      order: 4,
    },
    {
      id: 'conflictOfInterest',
      label: 'sidebar.nav.items.conflictOfInterest',
      labelAr: 'sidebar.nav.items.conflictOfInterest',
      icon: 'AlertTriangle',
      path: ROUTES.dashboard.cases.list,
      order: 5,
    },
  ],
}

const CLIENTS_MODULE: SidebarModule = {
  id: 'clients',
  label: 'sidebar.nav.modules.clients',
  labelAr: 'sidebar.nav.modules.clients',
  icon: 'Users',
  order: 3,
  items: [
    {
      id: 'clientPipeline',
      label: 'sidebar.nav.items.clientPipeline',
      labelAr: 'sidebar.nav.items.clientPipeline',
      icon: 'GitBranch',
      path: ROUTES.dashboard.crm.pipeline,
      order: 1,
    },
    {
      id: 'leads',
      label: 'sidebar.nav.items.leads',
      labelAr: 'sidebar.nav.items.leads',
      icon: 'UserPlus',
      path: ROUTES.dashboard.crm.leads.list,
      order: 2,
    },
    {
      id: 'activities',
      label: 'sidebar.nav.items.activities',
      labelAr: 'sidebar.nav.items.activities',
      icon: 'Activity',
      path: ROUTES.dashboard.crm.activities.list,
      order: 3,
    },
  ],
}

// Growth module (for small/large firms - extends Clients)
const GROWTH_MODULE: SidebarModule = {
  id: 'growth',
  label: 'sidebar.nav.modules.growth',
  labelAr: 'sidebar.nav.modules.growth',
  icon: 'TrendingUp',
  order: 3,
  items: [
    {
      id: 'crmDashboard',
      label: 'sidebar.nav.items.crmDashboard',
      labelAr: 'sidebar.nav.items.crmDashboard',
      icon: 'LayoutDashboard',
      path: ROUTES.dashboard.crm.index,
      order: 1,
    },
    {
      id: 'clientPipeline',
      label: 'sidebar.nav.items.clientPipeline',
      labelAr: 'sidebar.nav.items.clientPipeline',
      icon: 'GitBranch',
      path: ROUTES.dashboard.crm.pipeline,
      order: 2,
    },
    {
      id: 'leads',
      label: 'sidebar.nav.items.leads',
      labelAr: 'sidebar.nav.items.leads',
      icon: 'UserPlus',
      path: ROUTES.dashboard.crm.leads.list,
      order: 3,
    },
    {
      id: 'activities',
      label: 'sidebar.nav.items.activities',
      labelAr: 'sidebar.nav.items.activities',
      icon: 'Activity',
      path: ROUTES.dashboard.crm.activities.list,
      order: 4,
    },
    {
      id: 'campaigns',
      label: 'sidebar.nav.items.campaigns',
      labelAr: 'sidebar.nav.items.campaigns',
      icon: 'Megaphone',
      path: ROUTES.dashboard.crm.campaigns.list,
      order: 5,
    },
  ],
}

const BILLING_MODULE: SidebarModule = {
  id: 'billing',
  label: 'sidebar.nav.modules.billing',
  labelAr: 'sidebar.nav.modules.billing',
  icon: 'Receipt',
  order: 4,
  items: [
    {
      id: 'invoices',
      label: 'sidebar.nav.items.invoices',
      labelAr: 'sidebar.nav.items.invoices',
      icon: 'FileText',
      path: ROUTES.dashboard.finance.invoices.list,
      order: 1,
    },
    {
      id: 'payments',
      label: 'sidebar.nav.items.payments',
      labelAr: 'sidebar.nav.items.payments',
      icon: 'CreditCard',
      path: ROUTES.dashboard.finance.payments.list,
      order: 2,
    },
    {
      id: 'expenses',
      label: 'sidebar.nav.items.expenses',
      labelAr: 'sidebar.nav.items.expenses',
      icon: 'Wallet',
      path: ROUTES.dashboard.finance.expenses.list,
      order: 3,
    },
    {
      id: 'trustAccounts',
      label: 'sidebar.nav.items.trustAccounts',
      labelAr: 'sidebar.nav.items.trustAccounts',
      icon: 'Shield',
      path: ROUTES.dashboard.finance.retainers.list,
      order: 4,
    },
    {
      id: 'timeTracking',
      label: 'sidebar.nav.items.timeTracking',
      labelAr: 'sidebar.nav.items.timeTracking',
      icon: 'Clock',
      path: ROUTES.dashboard.finance.timeTracking.list,
      order: 5,
    },
  ],
}

const DOCUMENTS_MODULE: SidebarModule = {
  id: 'documents',
  label: 'sidebar.nav.modules.documents',
  labelAr: 'sidebar.nav.modules.documents',
  icon: 'FolderOpen',
  order: 5,
  items: [
    {
      id: 'allDocuments',
      label: 'sidebar.nav.items.allDocuments',
      labelAr: 'sidebar.nav.items.allDocuments',
      icon: 'Files',
      path: ROUTES.dashboard.documents.list,
      order: 1,
    },
    {
      id: 'templates',
      label: 'sidebar.nav.items.templates',
      labelAr: 'sidebar.nav.items.templates',
      icon: 'FileText',
      path: ROUTES.dashboard.invoiceTemplates.list,
      order: 2,
    },
    {
      id: 'eSignatures',
      label: 'sidebar.nav.items.eSignatures',
      labelAr: 'sidebar.nav.items.eSignatures',
      icon: 'PenTool',
      path: ROUTES.dashboard.documents.list,
      order: 3,
    },
  ],
}

const KNOWLEDGE_CENTER_MODULE: SidebarModule = {
  id: 'knowledgeCenter',
  label: 'sidebar.nav.modules.knowledgeCenter',
  labelAr: 'sidebar.nav.modules.knowledgeCenter',
  icon: 'BookOpen',
  order: 6,
  items: [
    {
      id: 'laws',
      label: 'sidebar.nav.items.laws',
      labelAr: 'sidebar.nav.items.laws',
      icon: 'Scale',
      path: ROUTES.dashboard.knowledge.laws.list,
      order: 1,
    },
    {
      id: 'judgments',
      label: 'sidebar.nav.items.judgments',
      labelAr: 'sidebar.nav.items.judgments',
      icon: 'Gavel',
      path: ROUTES.dashboard.knowledge.judgments.list,
      order: 2,
    },
    {
      id: 'forms',
      label: 'sidebar.nav.items.forms',
      labelAr: 'sidebar.nav.items.forms',
      icon: 'FileInput',
      path: ROUTES.dashboard.knowledge.forms.list,
      order: 3,
    },
  ],
}

const MARKET_MODULE: SidebarModule = {
  id: 'market',
  label: 'sidebar.nav.modules.market',
  labelAr: 'sidebar.nav.modules.market',
  icon: 'Store',
  order: 7,
  isOptional: true,
  items: [
    {
      id: 'browseJobs',
      label: 'sidebar.nav.items.browseJobs',
      labelAr: 'sidebar.nav.items.browseJobs',
      icon: 'Search',
      path: ROUTES.dashboard.jobs.browse,
      order: 1,
    },
    {
      id: 'myServices',
      label: 'sidebar.nav.items.myServices',
      labelAr: 'sidebar.nav.items.myServices',
      icon: 'Briefcase',
      path: ROUTES.dashboard.jobs.myServices,
      order: 2,
    },
    {
      id: 'reputation',
      label: 'sidebar.nav.items.reputation',
      labelAr: 'sidebar.nav.items.reputation',
      icon: 'Award',
      path: ROUTES.dashboard.reputation.overview,
      order: 3,
    },
  ],
}

const HR_MODULE: SidebarModule = {
  id: 'hr',
  label: 'sidebar.nav.modules.hr',
  labelAr: 'sidebar.nav.modules.hr',
  icon: 'Users',
  order: 8,
  items: [
    {
      id: 'people',
      label: 'sidebar.nav.items.people',
      labelAr: 'sidebar.nav.items.people',
      icon: 'Users',
      path: ROUTES.dashboard.hr.employees.list,
      order: 1,
    },
    {
      id: 'attendance',
      label: 'sidebar.nav.items.attendance',
      labelAr: 'sidebar.nav.items.attendance',
      icon: 'Clock',
      path: ROUTES.dashboard.hr.attendance.list,
      order: 2,
    },
    {
      id: 'leave',
      label: 'sidebar.nav.items.leave',
      labelAr: 'sidebar.nav.items.leave',
      icon: 'Calendar',
      path: ROUTES.dashboard.hr.leave.list,
      order: 3,
    },
    {
      id: 'payroll',
      label: 'sidebar.nav.items.payroll',
      labelAr: 'sidebar.nav.items.payroll',
      icon: 'Banknote',
      path: ROUTES.dashboard.hr.payroll.list,
      order: 4,
    },
    {
      id: 'workloads',
      label: 'sidebar.nav.items.workloads',
      labelAr: 'sidebar.nav.items.workloads',
      icon: 'BarChart',
      path: ROUTES.dashboard.hr.analytics.list,
      order: 5,
    },
  ],
}

const FINANCE_MODULE: SidebarModule = {
  id: 'finance',
  label: 'sidebar.nav.modules.finance',
  labelAr: 'sidebar.nav.modules.finance',
  icon: 'Landmark',
  order: 9,
  items: [
    {
      id: 'financeDashboard',
      label: 'sidebar.nav.items.financeDashboard',
      labelAr: 'sidebar.nav.items.financeDashboard',
      icon: 'LayoutDashboard',
      path: ROUTES.dashboard.finance.overview,
      order: 1,
    },
    {
      id: 'transactions',
      label: 'sidebar.nav.items.transactions',
      labelAr: 'sidebar.nav.items.transactions',
      icon: 'ArrowLeftRight',
      path: ROUTES.dashboard.finance.transactions.list,
      order: 2,
    },
    {
      id: 'bankReconciliation',
      label: 'sidebar.nav.items.bankReconciliation',
      labelAr: 'sidebar.nav.items.bankReconciliation',
      icon: 'FileCheck',
      path: ROUTES.dashboard.finance.reconciliation.list,
      order: 3,
    },
    {
      id: 'chartOfAccounts',
      label: 'sidebar.nav.items.chartOfAccounts',
      labelAr: 'sidebar.nav.items.chartOfAccounts',
      icon: 'List',
      path: ROUTES.dashboard.finance.chartOfAccounts,
      order: 4,
    },
    {
      id: 'financeReports',
      label: 'sidebar.nav.items.financeReports',
      labelAr: 'sidebar.nav.items.financeReports',
      icon: 'PieChart',
      path: ROUTES.dashboard.finance.reports.list,
      order: 5,
    },
    {
      id: 'budgets',
      label: 'sidebar.nav.items.budgets',
      labelAr: 'sidebar.nav.items.budgets',
      icon: 'PiggyBank',
      path: ROUTES.dashboard.finance.budgets.list,
      order: 6,
    },
  ],
}

const SAUDI_COMPLIANCE_MODULE: SidebarModule = {
  id: 'saudiCompliance',
  label: 'sidebar.nav.modules.saudiCompliance',
  labelAr: 'sidebar.nav.modules.saudiCompliance',
  icon: 'ShieldCheck',
  order: 10,
  items: [
    {
      id: 'complianceDashboard',
      label: 'sidebar.nav.items.complianceDashboard',
      labelAr: 'sidebar.nav.items.complianceDashboard',
      icon: 'LayoutDashboard',
      path: ROUTES.dashboard.finance.saudiBanking.compliance.index,
      order: 1,
    },
    {
      id: 'zatca',
      label: 'sidebar.nav.items.zatca',
      labelAr: 'sidebar.nav.items.zatca',
      icon: 'FileText',
      path: ROUTES.dashboard.finance.saudiBanking.index,
      order: 2,
    },
    {
      id: 'gosi',
      label: 'sidebar.nav.items.gosi',
      labelAr: 'sidebar.nav.items.gosi',
      icon: 'Building',
      path: ROUTES.dashboard.finance.saudiBanking.gosi.index,
      order: 3,
    },
    {
      id: 'wps',
      label: 'sidebar.nav.items.wps',
      labelAr: 'sidebar.nav.items.wps',
      icon: 'Wallet',
      path: ROUTES.dashboard.finance.saudiBanking.wps.index,
      order: 4,
    },
    {
      id: 'iqamaTracker',
      label: 'sidebar.nav.items.iqamaTracker',
      labelAr: 'sidebar.nav.items.iqamaTracker',
      icon: 'IdCard',
      path: ROUTES.dashboard.finance.saudiBanking.compliance.iqamaAlerts,
      order: 5,
    },
  ],
}

const OPERATIONS_MODULE: SidebarModule = {
  id: 'operations',
  label: 'sidebar.nav.modules.operations',
  labelAr: 'sidebar.nav.modules.operations',
  icon: 'Cog',
  order: 11,
  items: [
    {
      id: 'assets',
      label: 'sidebar.nav.items.assets',
      labelAr: 'sidebar.nav.items.assets',
      icon: 'Box',
      path: ROUTES.dashboard.assets.list,
      order: 1,
    },
    {
      id: 'procurement',
      label: 'sidebar.nav.items.procurement',
      labelAr: 'sidebar.nav.items.procurement',
      icon: 'ShoppingCart',
      path: ROUTES.dashboard.buying.purchaseOrders.list,
      order: 2,
    },
    {
      id: 'vendors',
      label: 'sidebar.nav.items.vendors',
      labelAr: 'sidebar.nav.items.vendors',
      icon: 'Building2',
      path: ROUTES.dashboard.finance.vendors.list,
      order: 3,
    },
    {
      id: 'inventory',
      label: 'sidebar.nav.items.inventory',
      labelAr: 'sidebar.nav.items.inventory',
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
      label: 'sidebar.nav.sections.basic',
      labelAr: 'sidebar.nav.sections.basic',
      items: BASIC_ITEMS,
    },
    modules: {
      label: 'sidebar.nav.sections.modules',
      labelAr: 'sidebar.nav.sections.modules',
      items: getModulesForFirmType('solo'),
    },
    other: {
      label: 'sidebar.nav.sections.other',
      labelAr: 'sidebar.nav.sections.other',
      items: OTHER_ITEMS,
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
      OTHER_ITEMS.length +
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
        label: 'sidebar.nav.sections.basic',
        labelAr: 'sidebar.nav.sections.basic',
        items: BASIC_ITEMS,
      },
      modules: {
        label: 'sidebar.nav.sections.modules',
        labelAr: 'sidebar.nav.sections.modules',
        items: modules,
      },
      other: {
        label: 'sidebar.nav.sections.other',
        labelAr: 'sidebar.nav.sections.other',
        items: OTHER_ITEMS,
      },
    },
    meta: {
      totalBaseItems: BASIC_ITEMS.length,
      totalModules: modules.length,
      totalModuleItems: modules.reduce((acc, m) => acc + m.items.length, 0),
      totalItems:
        BASIC_ITEMS.length +
        OTHER_ITEMS.length +
        modules.reduce((acc, m) => acc + m.items.length, 0),
    },
  }
}
