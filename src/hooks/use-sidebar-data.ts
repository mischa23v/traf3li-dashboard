import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  CheckSquare,
  MessageSquare,
  Users,
  Scale,
  DollarSign,
  Star,
  Settings,
  BookOpen,
  TrendingUp,
  UserCog,
  UserPlus,
  Lightbulb,
  Package,
  ShoppingCart,
  Headphones,
  ClipboardCheck,
  Factory,
  Building2,
  GitBranch,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import type { ModuleKey } from '@/types/rbac'
import { canView } from '@/lib/permissions'
import { ROUTES } from '@/constants/routes'
import { getLocalizedFullName } from '@/lib/arabic-names'

type NavItem = {
  title: string
  url?: string
  icon?: React.ElementType
  module?: ModuleKey // Module for permission checking
  items?: {
    title: string
    url: string
    module?: ModuleKey // Module for permission checking
  }[]
}

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  user: {
    name: string
    email: string
    avatar: string
  }
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
  navGroups: NavGroup[]
}

export function useSidebarData(): SidebarData {
  const { t, i18n } = useTranslation()
  const authUser = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const permissions = usePermissionsStore((state) => state.permissions)

  // Build full name with locale-aware name detection
  const getFullName = () => {
    // Don't show "Guest" while auth is loading - show loading indicator or empty
    if (isLoading && !authUser) {
      return '...'
    }

    const locale = i18n.language
    const localizedName = getLocalizedFullName(
      authUser?.firstName,
      authUser?.lastName,
      authUser?.firstNameAr,
      authUser?.lastNameAr,
      locale
    )
    if (localizedName) return localizedName
    if (authUser?.username) return authUser.username
    return t('common.guest', 'ضيف')
  }

  // Check if user can view a module
  const canViewModule = (module?: ModuleKey) => {
    // If no module specified, always show (e.g., dashboard)
    if (!module) return true
    // If no permissions loaded yet, show everything (will be filtered on load)
    if (!permissions) return true
    return canView(permissions, module)
  }

  // Filter navigation items based on permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => canViewModule(item.module))
      .map((item) => {
        if (item.items) {
          const filteredSubItems = item.items.filter((subItem) =>
            canViewModule(subItem.module)
          )
          // If all sub-items are filtered out, exclude the parent too
          if (filteredSubItems.length === 0) {
            return null
          }
          return { ...item, items: filteredSubItems }
        }
        return item
      })
      .filter((item): item is NavItem => item !== null)
  }

  // Filter navigation groups
  const filterNavGroups = (groups: NavGroup[]): NavGroup[] => {
    return groups
      .map((group) => ({
        ...group,
        items: filterNavItems(group.items),
      }))
      .filter((group) => group.items.length > 0)
  }

  // Define all navigation groups with module permissions
  // All titles use translation keys (format: sidebar.nav.key)
  const allNavGroups: NavGroup[] = [
    {
      title: 'sidebar.nav.homeGroup',
      items: [
        {
          title: 'sidebar.nav.home',
          icon: LayoutDashboard,
          items: [
            {
              title: 'sidebar.nav.overview',
              url: ROUTES.dashboard.home,
            },
            {
              title: 'sidebar.nav.calendar',
              url: ROUTES.dashboard.calendar,
              module: 'events',
            },
            {
              title: 'sidebar.nav.appointments',
              url: ROUTES.dashboard.appointments,
              module: 'events',
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.productivityGroup',
      items: [
        {
          title: 'sidebar.nav.productivity',
          icon: CheckSquare,
          module: 'tasks',
          items: [
            {
              title: 'sidebar.nav.tasks',
              url: ROUTES.dashboard.tasks.list,
              module: 'tasks',
            },
            {
              title: 'sidebar.nav.reminders',
              url: ROUTES.dashboard.tasks.reminders.list,
              module: 'tasks',
            },
            {
              title: 'sidebar.nav.events',
              url: ROUTES.dashboard.tasks.events.list,
              module: 'events',
            },
            // Gantt View
            {
              title: 'sidebar.nav.gantt',
              url: ROUTES.dashboard.tasks.gantt,
              module: 'tasks',
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.messagesGroup',
      items: [
        {
          title: 'sidebar.nav.messages',
          url: ROUTES.dashboard.messages.chat,
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'sidebar.nav.clientsGroup',
      items: [
        {
          title: 'sidebar.nav.clientsCommunication',
          icon: Users,
          items: [
            // CRM Dashboard
            {
              title: 'sidebar.nav.crmDashboard',
              url: ROUTES.dashboard.crm.index,
              module: 'leads',
            },
            {
              title: 'sidebar.nav.clients',
              url: ROUTES.dashboard.clients.list,
              module: 'clients',
            },
            {
              title: 'sidebar.nav.contacts',
              url: ROUTES.dashboard.contacts.list,
              module: 'clients',
            },
            {
              title: 'sidebar.nav.organizations',
              url: ROUTES.dashboard.organizations.list,
              module: 'clients',
            },
            // Leads - moved from Sales
            {
              title: 'sidebar.nav.leads',
              url: ROUTES.dashboard.crm.leads.list,
              module: 'leads',
            },
            // CRM Reports/Transactions - NEW
            {
              title: 'sidebar.nav.crmTransactions',
              url: ROUTES.dashboard.crm.transactions,
              module: 'leads',
            },
            {
              title: 'sidebar.nav.staff',
              url: ROUTES.dashboard.staff.list,
              module: 'team',
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.salesGroup',
      items: [
        {
          title: 'sidebar.nav.sales',
          icon: TrendingUp,
          module: 'leads',
          items: [
            {
              title: 'sidebar.nav.pipeline',
              url: ROUTES.dashboard.crm.pipeline,
              module: 'leads',
            },
            // CRM Products
            {
              title: 'sidebar.nav.products',
              url: ROUTES.dashboard.crm.products.list,
              module: 'leads',
            },
            // CRM Quotes
            {
              title: 'sidebar.nav.quotes',
              url: ROUTES.dashboard.crm.quotes.list,
              module: 'leads',
            },
            // CRM Campaigns
            {
              title: 'sidebar.nav.campaigns',
              url: ROUTES.dashboard.crm.campaigns.list,
              module: 'leads',
            },
            {
              title: 'sidebar.nav.referrals',
              url: ROUTES.dashboard.crm.referrals.list,
              module: 'leads',
            },
            {
              title: 'sidebar.nav.activities',
              url: ROUTES.dashboard.crm.activities.list,
              module: 'leads',
            },
            // Email Marketing
            {
              title: 'sidebar.nav.emailMarketing',
              url: ROUTES.dashboard.crm.emailMarketing.list,
              module: 'leads',
            },
            // WhatsApp Integration
            {
              title: 'sidebar.nav.whatsapp',
              url: ROUTES.dashboard.crm.whatsapp.list,
              module: 'leads',
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.businessGroup',
      items: [
        {
          title: 'sidebar.nav.business',
          icon: Scale,
          items: [
            {
              title: 'sidebar.nav.cases',
              url: ROUTES.dashboard.cases.list,
              module: 'cases',
            },
            {
              title: 'sidebar.nav.caseNotion',
              url: ROUTES.dashboard.notion,
              module: 'cases',
            },
            {
              title: 'sidebar.nav.casePipeline',
              url: ROUTES.dashboard.cases.pipeline,
              module: 'cases',
            },
            {
              title: 'sidebar.nav.documents',
              url: ROUTES.dashboard.documents.list,
              module: 'documents',
            },
            {
              title: 'sidebar.nav.myServices',
              url: ROUTES.dashboard.jobs.myServices,
            },
            {
              title: 'sidebar.nav.browseJobs',
              url: ROUTES.dashboard.jobs.browse,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.financeGroup',
      items: [
        {
          title: 'sidebar.nav.finance',
          icon: DollarSign,
          module: 'invoices',
          items: [
            {
              title: 'sidebar.nav.financeOverview',
              url: ROUTES.dashboard.finance.overview,
              module: 'invoices',
            },
            {
              title: 'sidebar.nav.invoices',
              url: ROUTES.dashboard.finance.invoices.list,
              module: 'invoices',
            },
            {
              title: 'sidebar.nav.pdfTemplates',
              url: ROUTES.dashboard.pdfTemplates.list,
              module: 'documents',
            },
            {
              title: 'sidebar.nav.payments',
              url: ROUTES.dashboard.finance.payments.list,
              module: 'payments',
            },
            {
              title: 'sidebar.nav.expenses',
              url: ROUTES.dashboard.finance.expenses.list,
              module: 'expenses',
            },
            {
              title: 'sidebar.nav.transactions',
              url: ROUTES.dashboard.finance.transactions.list,
              module: 'payments',
            },
            {
              title: 'sidebar.nav.timeTracking',
              url: ROUTES.dashboard.finance.timeTracking.list,
              module: 'timeTracking',
            },
            // Bank Reconciliation
            {
              title: 'sidebar.nav.bankReconciliation',
              url: ROUTES.dashboard.finance.reconciliation.list,
              module: 'payments',
            },
            // Multi-Currency
            {
              title: 'sidebar.nav.multiCurrency',
              url: ROUTES.dashboard.finance.currency.list,
              module: 'payments',
            },
            // Saudi Banking
            {
              title: 'sidebar.nav.saudiBanking',
              url: ROUTES.dashboard.finance.saudiBanking.index,
              module: 'payments',
            },
            // Fiscal Periods
            {
              title: 'sidebar.nav.fiscalPeriods',
              url: ROUTES.dashboard.finance.fiscalPeriods.list,
              module: 'payments',
            },
            // Full Reports
            {
              title: 'sidebar.nav.fullReports',
              url: ROUTES.dashboard.finance.fullReports.list,
              module: 'reports',
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.inventoryGroup',
      items: [
        {
          title: 'sidebar.nav.inventory',
          icon: Package,
          items: [
            {
              title: 'sidebar.nav.items',
              url: ROUTES.dashboard.inventory.list,
            },
            {
              title: 'sidebar.nav.warehouses',
              url: ROUTES.dashboard.inventory.warehouses.list,
            },
            {
              title: 'sidebar.nav.stockEntries',
              url: ROUTES.dashboard.inventory.stockEntries.list,
            },
            {
              title: 'sidebar.nav.stockLedger',
              url: ROUTES.dashboard.inventory.stockLedger,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.buyingGroup',
      items: [
        {
          title: 'sidebar.nav.buying',
          icon: ShoppingCart,
          items: [
            {
              title: 'sidebar.nav.suppliers',
              url: ROUTES.dashboard.buying.list,
            },
            {
              title: 'sidebar.nav.purchaseOrders',
              url: ROUTES.dashboard.buying.purchaseOrders.list,
            },
            {
              title: 'sidebar.nav.materialRequests',
              url: ROUTES.dashboard.buying.materialRequests.list,
            },
            {
              title: 'sidebar.nav.purchaseReceipts',
              url: ROUTES.dashboard.buying.purchaseReceipts.list,
            },
            {
              title: 'sidebar.nav.rfqs',
              url: ROUTES.dashboard.buying.rfq.list,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.manufacturingGroup',
      items: [
        {
          title: 'sidebar.nav.manufacturing',
          icon: Factory,
          items: [
            {
              title: 'sidebar.nav.workOrders',
              url: ROUTES.dashboard.manufacturing.list,
            },
            {
              title: 'sidebar.nav.boms',
              url: ROUTES.dashboard.manufacturing.bom.list,
            },
            {
              title: 'sidebar.nav.workstations',
              url: ROUTES.dashboard.manufacturing.workstations.list,
            },
            {
              title: 'sidebar.nav.jobCards',
              url: ROUTES.dashboard.manufacturing.jobCards.list,
            },
            {
              title: 'sidebar.nav.productionPlans',
              url: ROUTES.dashboard.manufacturing.productionPlans.list,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.qualityGroup',
      items: [
        {
          title: 'sidebar.nav.quality',
          icon: ClipboardCheck,
          items: [
            {
              title: 'sidebar.nav.qualityInspections',
              url: ROUTES.dashboard.quality.list,
            },
            {
              title: 'sidebar.nav.qualityTemplates',
              url: ROUTES.dashboard.quality.templates.list,
            },
            {
              title: 'sidebar.nav.qualityActions',
              url: ROUTES.dashboard.quality.actions.list,
            },
            {
              title: 'sidebar.nav.ncrs',
              url: ROUTES.dashboard.quality.ncrs.list,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.assetsGroup',
      items: [
        {
          title: 'sidebar.nav.assets',
          icon: Building2,
          items: [
            {
              title: 'sidebar.nav.assetsList',
              url: ROUTES.dashboard.assets.list,
            },
            {
              title: 'sidebar.nav.assetCategories',
              url: ROUTES.dashboard.assets.categories.list,
            },
            {
              title: 'sidebar.nav.depreciation',
              url: ROUTES.dashboard.assets.depreciation.list,
            },
            {
              title: 'sidebar.nav.assetMaintenance',
              url: ROUTES.dashboard.assets.maintenance.list,
            },
            {
              title: 'sidebar.nav.assetMovements',
              url: ROUTES.dashboard.assets.movements.list,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.subcontractingGroup',
      items: [
        {
          title: 'sidebar.nav.subcontracting',
          icon: GitBranch,
          items: [
            {
              title: 'sidebar.nav.subcontractingOrders',
              url: ROUTES.dashboard.subcontracting.list,
            },
            {
              title: 'sidebar.nav.subcontractingReceipts',
              url: ROUTES.dashboard.subcontracting.receipts.list,
            },
            {
              title: 'sidebar.nav.subcontractingBoms',
              url: ROUTES.dashboard.subcontracting.boms.list,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.supportGroup',
      items: [
        {
          title: 'sidebar.nav.support',
          icon: Headphones,
          items: [
            {
              title: 'sidebar.nav.tickets',
              url: ROUTES.dashboard.support.list,
            },
            {
              title: 'sidebar.nav.slas',
              url: ROUTES.dashboard.support.sla.list,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.hrGroup',
      items: [
        {
          title: 'sidebar.nav.hr',
          icon: UserCog,
          module: 'hr',
          items: [
            // Core HR
            {
              title: 'sidebar.nav.employees',
              url: ROUTES.dashboard.hr.employees.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.orgStructure',
              url: ROUTES.dashboard.hr.organizationalStructure.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.jobPositions',
              url: ROUTES.dashboard.hr.jobPositions.list,
              module: 'hr',
            },
            // Time & Attendance
            {
              title: 'sidebar.nav.attendance',
              url: ROUTES.dashboard.hr.attendance.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.shiftTypes',
              url: ROUTES.dashboard.hr.settings.shiftTypes.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.shiftAssignments',
              url: ROUTES.dashboard.hr.shiftAssignments.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.leave',
              url: ROUTES.dashboard.hr.leave.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.leavePeriods',
              url: ROUTES.dashboard.hr.leave.periods,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.leavePolicies',
              url: ROUTES.dashboard.hr.leave.policies,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.leaveAllocations',
              url: ROUTES.dashboard.hr.leave.allocations,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.leaveEncashments',
              url: ROUTES.dashboard.hr.leave.encashments.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.compensatoryLeave',
              url: ROUTES.dashboard.hr.leave.compensatory.list,
              module: 'hr',
            },
            // Payroll & Compensation
            {
              title: 'sidebar.nav.payroll',
              url: ROUTES.dashboard.hr.payroll.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.payrollRuns',
              url: ROUTES.dashboard.hr.payrollRuns.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.salaryComponents',
              url: ROUTES.dashboard.hr.payroll.salaryComponents,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.compensation',
              url: ROUTES.dashboard.hr.compensation.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.retentionBonuses',
              url: ROUTES.dashboard.hr.compensation.retentionBonuses,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.employeeIncentives',
              url: ROUTES.dashboard.hr.compensation.incentives,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.benefits',
              url: ROUTES.dashboard.hr.benefits.list,
              module: 'hr',
            },
            // Financial
            {
              title: 'sidebar.nav.advances',
              url: ROUTES.dashboard.hr.advances.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.loans',
              url: ROUTES.dashboard.hr.loans.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.expenseClaims',
              url: ROUTES.dashboard.hr.expenseClaims.list,
              module: 'hr',
            },
            // Performance & Development
            {
              title: 'sidebar.nav.performance',
              url: ROUTES.dashboard.hr.performance.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.training',
              url: ROUTES.dashboard.hr.training.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.successionPlanning',
              url: ROUTES.dashboard.hr.successionPlanning.list,
              module: 'hr',
            },
            // Recruitment & Lifecycle
            {
              title: 'sidebar.nav.recruitment',
              url: ROUTES.dashboard.hr.recruitment.jobs.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.applicants',
              url: ROUTES.dashboard.hr.recruitment.applicants.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.staffingPlans',
              url: ROUTES.dashboard.hr.recruitment.staffingPlans.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.onboarding',
              url: ROUTES.dashboard.hr.onboarding.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.offboarding',
              url: ROUTES.dashboard.hr.offboarding.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.promotions',
              url: ROUTES.dashboard.hr.promotions.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.transfers',
              url: ROUTES.dashboard.hr.employeeTransfers.list,
              module: 'hr',
            },
            // Assets & Vehicles
            {
              title: 'sidebar.nav.assetAssignment',
              url: ROUTES.dashboard.hr.assetAssignment.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.vehicles',
              url: ROUTES.dashboard.hr.vehicles.list,
              module: 'hr',
            },
            // Skills
            {
              title: 'sidebar.nav.skills',
              url: ROUTES.dashboard.hr.skills.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.skillMatrix',
              url: ROUTES.dashboard.hr.skills.matrix,
              module: 'hr',
            },
            // Grievances
            {
              title: 'sidebar.nav.grievances',
              url: ROUTES.dashboard.hr.grievances.list,
              module: 'hr',
            },
            // Reports
            {
              title: 'sidebar.nav.hrReports',
              url: ROUTES.dashboard.hr.reports.list,
              module: 'hr',
            },
            // Biometric & Geofencing
            {
              title: 'sidebar.nav.biometric',
              url: ROUTES.dashboard.hr.biometric.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.geofencing',
              url: ROUTES.dashboard.hr.geofencing.list,
              module: 'hr',
            },
            // Analytics & Predictions
            {
              title: 'sidebar.nav.hrAnalytics',
              url: ROUTES.dashboard.hr.analytics.list,
              module: 'hr',
            },
            {
              title: 'sidebar.nav.aiPredictions',
              url: ROUTES.dashboard.hr.predictions.list,
              module: 'hr',
            },
            // HR Setup
            {
              title: 'sidebar.nav.hrSetupWizard',
              url: ROUTES.dashboard.hr.setupWizard,
              module: 'hr',
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.libraryGroup',
      items: [
        {
          title: 'sidebar.nav.library',
          icon: BookOpen,
          items: [
            {
              title: 'sidebar.nav.laws',
              url: ROUTES.dashboard.knowledge.laws.list,
            },
            {
              title: 'sidebar.nav.judgments',
              url: ROUTES.dashboard.knowledge.judgments.list,
            },
            {
              title: 'sidebar.nav.forms',
              url: ROUTES.dashboard.knowledge.forms.list,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.excellenceGroup',
      items: [
        {
          title: 'sidebar.nav.excellence',
          icon: Star,
          items: [
            {
              title: 'sidebar.nav.excellenceOverview',
              url: ROUTES.dashboard.reputation.overview,
            },
            {
              title: 'sidebar.nav.badges',
              url: ROUTES.dashboard.reputation.badges,
            },
          ],
        },
      ],
    },
    {
      title: 'sidebar.nav.settingsGroup',
      items: [
        {
          title: 'sidebar.nav.settings',
          icon: Settings,
          module: 'settings',
          items: [
            {
              title: 'sidebar.nav.profile',
              url: ROUTES.dashboard.settings.profile,
            },
            {
              title: 'sidebar.nav.security',
              url: ROUTES.dashboard.settings.security,
            },
            {
              title: 'sidebar.nav.preferences',
              url: ROUTES.dashboard.settings.preferences,
            },
            {
              title: 'sidebar.nav.apps',
              url: ROUTES.dashboard.apps.list,
            },
            {
              title: 'sidebar.nav.importExport',
              url: ROUTES.dashboard.dataExport.list,
              module: 'reports',
            },
            {
              title: 'sidebar.nav.helpCenter',
              url: ROUTES.dashboard.help,
            },
            // CRM Settings
            {
              title: 'sidebar.nav.crmSettings',
              url: ROUTES.dashboard.settings.crm,
              module: 'leads',
            },
          ],
        },
      ],
    },
  ]

  return {
    user: {
      name: getFullName(),
      email: authUser?.email || '',
      avatar: authUser?.image || '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: 'sidebar.team.firmName',
        logo: Scale,
        plan: 'sidebar.team.firmPlan',
      },
    ],
    navGroups: filterNavGroups(allNavGroups),
  }
}
