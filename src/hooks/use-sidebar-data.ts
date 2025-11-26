import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  MessageSquare,
  Briefcase,
  Users,
  UsersRound,
  Contact,
  Building2,
  Scale,
  DollarSign,
  Star,
  BarChart,
  BookOpen,
  Settings,
  HelpCircle,
  Tags,
  FileText,
  Bell,
  GitBranch,
  Receipt,
  FileStack,
  FileInput,
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
            title: 'نظرة عامة',
            url: '/',
            icon: LayoutDashboard,
          },
          {
            title: 'التقويم',
            url: '/dashboard/calendar',
            icon: Calendar,
          },
          {
            title: 'المهام',
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
            ],
          },
          {
            title: 'الرسائل',
            icon: MessageSquare,
            items: [
              {
                title: 'الدردشة',
                url: '/dashboard/messages/chat',
              },
              {
                title: 'البريد الإلكتروني',
                url: '/dashboard/messages/email',
              },
            ],
          },
        ],
      },
      {
        title: 'الأعمال',
        items: [
          {
            title: 'فرص وظيفية',
            icon: Briefcase,
            items: [
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
          {
            title: 'العملاء',
            url: '/dashboard/clients',
            icon: Users,
          },
          {
            title: 'فريق العمل',
            url: '/dashboard/staff',
            icon: UsersRound,
          },
          {
            title: 'جهات الاتصال',
            url: '/dashboard/contacts',
            icon: Contact,
          },
          {
            title: 'المنظمات',
            url: '/dashboard/organizations',
            icon: Building2,
          },
          {
            title: 'القضايا',
            url: '/dashboard/cases',
            icon: Scale,
          },
          {
            title: 'سير العمل',
            url: '/dashboard/case-workflows',
            icon: GitBranch,
          },
          {
            title: 'الوسوم',
            url: '/dashboard/tags',
            icon: Tags,
          },
          {
            title: 'المستندات',
            url: '/dashboard/documents',
            icon: FileText,
          },
          {
            title: 'المتابعات',
            url: '/dashboard/followups',
            icon: Bell,
          },
        ],
      },
      {
        title: 'المالية',
        items: [
          {
            title: 'الحسابات',
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
                title: 'المصروفات',
                url: '/dashboard/finance/expenses',
              },
              {
                title: 'كشوف الحساب',
                url: '/dashboard/finance/statements',
              },
              {
                title: 'المعاملات',
                url: '/dashboard/finance/transactions',
              },
              {
                title: 'تتبع الوقت',
                url: '/dashboard/finance/time-tracking',
              },
              {
                title: 'نشاط الحساب',
                url: '/dashboard/finance/activity',
              },
            ],
          },
          {
            title: 'أسعار الفوترة',
            url: '/dashboard/billing-rates',
            icon: Receipt,
          },
          {
            title: 'قوالب الفواتير',
            url: '/dashboard/invoice-templates',
            icon: FileStack,
          },
        ],
      },
      {
        title: 'التميز المهني',
        items: [
          {
            title: 'التقييمات والسمعة',
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
          {
            title: 'التقارير',
            icon: BarChart,
            items: [
              {
                title: 'تقرير الإيرادات',
                url: '/dashboard/reports/revenue',
              },
              {
                title: 'تقرير القضايا',
                url: '/dashboard/reports/cases',
              },
              {
                title: 'تقرير الوقت',
                url: '/dashboard/reports/time',
              },
            ],
          },
          {
            title: 'مركز المعرفة',
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
        title: 'النظام',
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
            ],
          },
          {
            title: 'استيراد/تصدير',
            url: '/dashboard/data-export',
            icon: FileInput,
          },
          {
            title: 'مركز المساعدة',
            url: '/dashboard/help',
            icon: HelpCircle,
          },
        ],
      },
    ],
  }
}
