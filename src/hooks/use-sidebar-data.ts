import {
  LayoutDashboard,
  Calendar,
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
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import type { ModuleKey } from '@/types/rbac'
import { canView } from '@/lib/permissions'

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
  const authUser = useAuthStore((state) => state.user)
  const permissions = usePermissionsStore((state) => state.permissions)

  // Build full name from firstName and lastName, fallback to username
  const getFullName = () => {
    if (authUser?.firstName && authUser?.lastName) {
      return `${authUser.firstName} ${authUser.lastName}`
    }
    if (authUser?.firstName) {
      return authUser.firstName
    }
    return authUser?.username || 'Guest'
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
              url: '/',
            },
            {
              title: 'sidebar.nav.calendar',
              url: '/dashboard/calendar',
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
              url: '/dashboard/tasks/list',
              module: 'tasks',
            },
            {
              title: 'sidebar.nav.reminders',
              url: '/dashboard/tasks/reminders',
              module: 'tasks',
            },
            {
              title: 'sidebar.nav.events',
              url: '/dashboard/tasks/events',
              module: 'events',
            },
            // Gantt View
            {
              title: 'sidebar.nav.gantt',
              url: '/dashboard/tasks/gantt',
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
          url: '/dashboard/messages/chat',
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
            {
              title: 'sidebar.nav.clients',
              url: '/dashboard/clients',
              module: 'clients',
            },
            {
              title: 'sidebar.nav.contacts',
              url: '/dashboard/contacts',
              module: 'clients',
            },
            {
              title: 'sidebar.nav.organizations',
              url: '/dashboard/organizations',
              module: 'clients',
            },
            {
              title: 'sidebar.nav.staff',
              url: '/dashboard/staff',
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
              title: 'sidebar.nav.leads',
              url: '/dashboard/crm/leads',
              module: 'leads',
            },
            {
              title: 'sidebar.nav.pipeline',
              url: '/dashboard/crm/pipeline',
              module: 'leads',
            },
            {
              title: 'sidebar.nav.referrals',
              url: '/dashboard/crm/referrals',
              module: 'leads',
            },
            {
              title: 'sidebar.nav.activities',
              url: '/dashboard/crm/activities',
              module: 'leads',
            },
            // Email Marketing
            {
              title: 'sidebar.nav.emailMarketing',
              url: '/dashboard/crm/email-marketing',
              module: 'leads',
            },
            // Lead Scoring
            {
              title: 'sidebar.nav.leadScoring',
              url: '/dashboard/crm/lead-scoring',
              module: 'leads',
            },
            // WhatsApp Integration
            {
              title: 'sidebar.nav.whatsapp',
              url: '/dashboard/crm/whatsapp',
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
              url: '/dashboard/cases',
              module: 'cases',
            },
            {
              title: 'sidebar.nav.caseNotion',
              url: '/dashboard/notion',
              module: 'cases',
            },
            {
              title: 'sidebar.nav.casePipeline',
              url: '/dashboard/cases/pipeline',
              module: 'cases',
            },
            {
              title: 'sidebar.nav.documents',
              url: '/dashboard/documents',
              module: 'documents',
            },
            {
              title: 'sidebar.nav.myServices',
              url: '/dashboard/jobs/my-services',
            },
            {
              title: 'sidebar.nav.browseJobs',
              url: '/dashboard/jobs/browse',
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
              url: '/dashboard/finance/overview',
              module: 'invoices',
            },
            {
              title: 'sidebar.nav.invoices',
              url: '/dashboard/finance/invoices',
              module: 'invoices',
            },
            {
              title: 'sidebar.nav.pdfTemplates',
              url: '/dashboard/pdf-templates',
              module: 'documents',
            },
            {
              title: 'sidebar.nav.payments',
              url: '/dashboard/finance/payments',
              module: 'payments',
            },
            {
              title: 'sidebar.nav.expenses',
              url: '/dashboard/finance/expenses',
              module: 'expenses',
            },
            {
              title: 'sidebar.nav.transactions',
              url: '/dashboard/finance/transactions',
              module: 'payments',
            },
            {
              title: 'sidebar.nav.timeTracking',
              url: '/dashboard/finance/time-tracking',
              module: 'timeTracking',
            },
            // Bank Reconciliation
            {
              title: 'sidebar.nav.bankReconciliation',
              url: '/dashboard/finance/reconciliation',
              module: 'payments',
            },
            // Multi-Currency
            {
              title: 'sidebar.nav.multiCurrency',
              url: '/dashboard/finance/currency',
              module: 'payments',
            },
            // Saudi Banking
            {
              title: 'sidebar.nav.saudiBanking',
              url: '/dashboard/finance/saudi-banking',
              module: 'payments',
            },
            // Fiscal Periods
            {
              title: 'sidebar.nav.fiscalPeriods',
              url: '/dashboard/finance/fiscal-periods',
              module: 'payments',
            },
            // Full Reports
            {
              title: 'sidebar.nav.fullReports',
              url: '/dashboard/finance/full-reports',
              module: 'reports',
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
              url: '/dashboard/hr/employees',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.orgStructure',
              url: '/dashboard/hr/organizational-structure',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.jobPositions',
              url: '/dashboard/hr/job-positions',
              module: 'hr',
            },
            // Time & Attendance
            {
              title: 'sidebar.nav.attendance',
              url: '/dashboard/hr/attendance',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.leave',
              url: '/dashboard/hr/leave',
              module: 'hr',
            },
            // Payroll & Compensation
            {
              title: 'sidebar.nav.payroll',
              url: '/dashboard/hr/payroll',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.payrollRuns',
              url: '/dashboard/hr/payroll-runs',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.compensation',
              url: '/dashboard/hr/compensation',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.benefits',
              url: '/dashboard/hr/benefits',
              module: 'hr',
            },
            // Financial
            {
              title: 'sidebar.nav.advances',
              url: '/dashboard/hr/advances',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.loans',
              url: '/dashboard/hr/loans',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.expenseClaims',
              url: '/dashboard/hr/expense-claims',
              module: 'hr',
            },
            // Performance & Development
            {
              title: 'sidebar.nav.performance',
              url: '/dashboard/hr/performance',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.training',
              url: '/dashboard/hr/training',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.successionPlanning',
              url: '/dashboard/hr/succession-planning',
              module: 'hr',
            },
            // Recruitment & Lifecycle
            {
              title: 'sidebar.nav.recruitment',
              url: '/dashboard/hr/recruitment/jobs',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.applicants',
              url: '/dashboard/hr/recruitment/applicants',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.onboarding',
              url: '/dashboard/hr/onboarding',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.offboarding',
              url: '/dashboard/hr/offboarding',
              module: 'hr',
            },
            // Assets
            {
              title: 'sidebar.nav.assetAssignment',
              url: '/dashboard/hr/asset-assignment',
              module: 'hr',
            },
            // Grievances
            {
              title: 'sidebar.nav.grievances',
              url: '/dashboard/hr/grievances',
              module: 'hr',
            },
            // Reports
            {
              title: 'sidebar.nav.hrReports',
              url: '/dashboard/hr/reports',
              module: 'hr',
            },
            // Biometric & Geofencing
            {
              title: 'sidebar.nav.biometric',
              url: '/dashboard/hr/biometric',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.geofencing',
              url: '/dashboard/hr/geofencing',
              module: 'hr',
            },
            // Analytics & Predictions
            {
              title: 'sidebar.nav.hrAnalytics',
              url: '/dashboard/hr/analytics',
              module: 'hr',
            },
            {
              title: 'sidebar.nav.aiPredictions',
              url: '/dashboard/hr/predictions',
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
              url: '/dashboard/knowledge/laws',
            },
            {
              title: 'sidebar.nav.judgments',
              url: '/dashboard/knowledge/judgments',
            },
            {
              title: 'sidebar.nav.forms',
              url: '/dashboard/knowledge/forms',
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
              url: '/dashboard/reputation/overview',
            },
            {
              title: 'sidebar.nav.badges',
              url: '/dashboard/reputation/badges',
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
              url: '/dashboard/settings/profile',
            },
            {
              title: 'sidebar.nav.security',
              url: '/dashboard/settings/security',
            },
            {
              title: 'sidebar.nav.preferences',
              url: '/dashboard/settings/preferences',
            },
            {
              title: 'sidebar.nav.apps',
              url: '/dashboard/apps',
            },
            {
              title: 'sidebar.nav.importExport',
              url: '/dashboard/data-export',
              module: 'reports',
            },
            {
              title: 'sidebar.nav.helpCenter',
              url: '/dashboard/help',
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
