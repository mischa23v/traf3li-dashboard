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
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

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
  navGroups: {
    title: string
    items: {
      title: string
      url?: string
      icon: React.ElementType
      items?: {
        title: string
        url: string
      }[]
    }[]
  }[]
}

export function useSidebarData(): SidebarData {
  const authUser = useAuthStore((state) => state.user)

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
    navGroups: [
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
            items: [
              {
                title: 'المهام',
                url: '/dashboard/tasks/list',
              },
              {
                title: 'التذكيرات',
                url: '/dashboard/tasks/reminders',
              },
              {
                title: 'الأحداث',
                url: '/dashboard/tasks/events',
              },
              {
                title: 'الملاحظات',
                url: '/dashboard/wiki',
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
              },
              {
                title: 'جهات الاتصال',
                url: '/dashboard/contacts',
              },
              {
                title: 'المنظمات',
                url: '/dashboard/organizations',
              },
              {
                title: 'فريق العمل',
                url: '/dashboard/staff',
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
            items: [
              {
                title: 'العملاء المحتملين',
                url: '/dashboard/crm/leads',
              },
              {
                title: 'مسار المبيعات',
                url: '/dashboard/crm/pipeline',
              },
              {
                title: 'الإحالات',
                url: '/dashboard/crm/referrals',
              },
              {
                title: 'سجل الأنشطة',
                url: '/dashboard/crm/activities',
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
              },
              {
                title: 'المستندات',
                url: '/dashboard/documents',
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
            items: [
              {
                title: 'لوحة الحسابات',
                url: '/dashboard/finance/overview',
              },
              {
                title: 'الفواتير',
                url: '/dashboard/finance/invoices',
              },
              {
                title: 'المدفوعات',
                url: '/dashboard/finance/payments',
              },
              {
                title: 'المصروفات',
                url: '/dashboard/finance/expenses',
              },
              {
                title: 'المعاملات',
                url: '/dashboard/finance/transactions',
              },
              {
                title: 'تتبع الوقت',
                url: '/dashboard/finance/time-tracking',
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
            items: [
              {
                title: 'الموظفين',
                url: '/dashboard/hr/employees',
              },
              {
                title: 'الرواتب',
                url: '/dashboard/hr/salaries',
              },
              {
                title: 'مسيرات الرواتب',
                url: '/dashboard/hr/payroll',
              },
              {
                title: 'الإجازات',
                url: '/dashboard/hr/leaves',
              },
              {
                title: 'الحضور والانصراف',
                url: '/dashboard/hr/attendance',
              },
              {
                title: 'التقييمات',
                url: '/dashboard/hr/evaluations',
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
        title: 'الإعدادات',
        items: [
          {
            title: 'الإعدادات',
            icon: Settings,
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
              },
              {
                title: 'مركز المساعدة',
                url: '/dashboard/help',
              },
            ],
          },
        ],
      },
    ],
  }
}
