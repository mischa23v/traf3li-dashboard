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
  const allNavGroups: NavGroup[] = [
    {
      title: 'الرئيسية',
      items: [
        {
          title: 'الرئيسية',
          icon: LayoutDashboard,
          items: [
            {
              title: 'نظرة عامة',
              url: '/',
            },
            {
              title: 'التقويم',
              url: '/dashboard/calendar',
              module: 'events',
            },
          ],
        },
      ],
    },
    {
      title: 'الإنتاجية',
      items: [
        {
          title: 'الإنتاجية',
          icon: CheckSquare,
          module: 'tasks',
          items: [
            {
              title: 'المهام',
              url: '/dashboard/tasks/list',
              module: 'tasks',
            },
            {
              title: 'التذكيرات',
              url: '/dashboard/tasks/reminders',
              module: 'tasks',
            },
            {
              title: 'الأحداث',
              url: '/dashboard/tasks/events',
              module: 'events',
            },
          ],
        },
      ],
    },
    {
      title: 'الرسائل',
      items: [
        {
          title: 'الرسائل',
          url: '/dashboard/messages/chat',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'العملاء والتواصل',
      items: [
        {
          title: 'العملاء والتواصل',
          icon: Users,
          items: [
            {
              title: 'العملاء',
              url: '/dashboard/clients',
              module: 'clients',
            },
            {
              title: 'جهات الاتصال',
              url: '/dashboard/contacts',
              module: 'clients',
            },
            {
              title: 'المنظمات',
              url: '/dashboard/organizations',
              module: 'clients',
            },
            {
              title: 'فريق العمل',
              url: '/dashboard/staff',
              module: 'team',
            },
          ],
        },
      ],
    },
    {
      title: 'المبيعات',
      items: [
        {
          title: 'المبيعات',
          icon: TrendingUp,
          module: 'leads',
          items: [
            {
              title: 'العملاء المحتملين',
              url: '/dashboard/crm/leads',
              module: 'leads',
            },
            {
              title: 'مسار المبيعات',
              url: '/dashboard/crm/pipeline',
              module: 'leads',
            },
            {
              title: 'الإحالات',
              url: '/dashboard/crm/referrals',
              module: 'leads',
            },
            {
              title: 'سجل الأنشطة',
              url: '/dashboard/crm/activities',
              module: 'leads',
            },
          ],
        },
      ],
    },
    {
      title: 'الأعمال',
      items: [
        {
          title: 'الأعمال',
          icon: Scale,
          items: [
            {
              title: 'القضايا',
              url: '/dashboard/cases',
              module: 'cases',
            },
            {
              title: 'المستندات',
              url: '/dashboard/documents',
              module: 'documents',
            },
            {
              title: 'خدماتي',
              url: '/dashboard/jobs/my-services',
            },
            {
              title: 'تصفح الوظائف',
              url: '/dashboard/jobs/browse',
            },
          ],
        },
      ],
    },
    {
      title: 'المالية',
      items: [
        {
          title: 'المالية',
          icon: DollarSign,
          module: 'invoices',
          items: [
            {
              title: 'لوحة الحسابات',
              url: '/dashboard/finance/overview',
              module: 'invoices',
            },
            {
              title: 'الفواتير',
              url: '/dashboard/finance/invoices',
              module: 'invoices',
            },
            {
              title: 'المدفوعات',
              url: '/dashboard/finance/payments',
              module: 'payments',
            },
            {
              title: 'المصروفات',
              url: '/dashboard/finance/expenses',
              module: 'expenses',
            },
            {
              title: 'المعاملات',
              url: '/dashboard/finance/transactions',
              module: 'payments',
            },
            {
              title: 'تتبع الوقت',
              url: '/dashboard/finance/time-tracking',
              module: 'timeTracking',
            },
          ],
        },
      ],
    },
    {
      title: 'الموارد البشرية',
      items: [
        {
          title: 'الموارد البشرية',
          icon: UserCog,
          module: 'hr',
          items: [
            {
              title: 'الموظفين',
              url: '/dashboard/hr/employees',
              module: 'hr',
            },
            {
              title: 'قسائم الرواتب',
              url: '/dashboard/hr/payroll',
              module: 'hr',
            },
            {
              title: 'دورات الرواتب',
              url: '/dashboard/hr/payroll-runs',
              module: 'hr',
            },
            {
              title: 'الإجازات',
              url: '/dashboard/hr/leave',
              module: 'hr',
            },
            {
              title: 'الحضور',
              url: '/dashboard/hr/attendance',
              module: 'hr',
            },
            {
              title: 'تقييم الأداء',
              url: '/dashboard/hr/performance',
              module: 'hr',
            },
            {
              title: 'التوظيف',
              url: '/dashboard/hr/recruitment/jobs',
              module: 'hr',
            },
            {
              title: 'المتقدمين',
              url: '/dashboard/hr/recruitment/applicants',
              module: 'hr',
            },
          ],
        },
      ],
    },
    {
      title: 'المكتبة',
      items: [
        {
          title: 'المكتبة',
          icon: BookOpen,
          items: [
            {
              title: 'القوانين',
              url: '/dashboard/knowledge/laws',
            },
            {
              title: 'الأحكام',
              url: '/dashboard/knowledge/judgments',
            },
            {
              title: 'النماذج',
              url: '/dashboard/knowledge/forms',
            },
          ],
        },
      ],
    },
    {
      title: 'التميز المهني',
      items: [
        {
          title: 'التميز المهني',
          icon: Star,
          items: [
            {
              title: 'نظرة عامة',
              url: '/dashboard/reputation/overview',
            },
            {
              title: 'شاراتي',
              url: '/dashboard/reputation/badges',
            },
          ],
        },
      ],
    },
    {
      title: 'الإعدادات',
      items: [
        {
          title: 'الإعدادات',
          icon: Settings,
          module: 'settings',
          items: [
            {
              title: 'الملف الشخصي',
              url: '/dashboard/settings/profile',
            },
            {
              title: 'الأمان',
              url: '/dashboard/settings/security',
            },
            {
              title: 'التفضيلات',
              url: '/dashboard/settings/preferences',
            },
            {
              title: 'التطبيقات',
              url: '/dashboard/apps',
            },
            {
              title: 'استيراد/تصدير',
              url: '/dashboard/data-export',
              module: 'reports',
            },
            {
              title: 'مركز المساعدة',
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
        name: 'مكتب مشاري للمحاماة',
        logo: Scale,
        plan: 'محامي مرخص',
      },
    ],
    navGroups: filterNavGroups(allNavGroups),
  }
}
