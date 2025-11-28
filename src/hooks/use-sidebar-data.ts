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
  BookOpen,
  Settings,
  HelpCircle,
  FileText,
  FileInput,
  Package,
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
        ],
      },
      {
        title: 'المهام',
        items: [
          {
            title: 'المهام',
            url: '/dashboard/tasks/list',
            icon: CheckSquare,
          },
          {
            title: 'التذكيرات',
            url: '/dashboard/tasks/reminders',
            icon: CheckSquare,
          },
          {
            title: 'الأحداث',
            url: '/dashboard/tasks/events',
            icon: CheckSquare,
          },
          {
            title: 'الملاحظات',
            url: '/dashboard/wiki',
            icon: CheckSquare,
          },
        ],
      },
      {
        title: 'التواصل',
        items: [
          {
            title: 'الرسائل',
            url: '/dashboard/messages/chat',
            icon: MessageSquare,
          },
          {
            title: 'التطبيقات',
            url: '/dashboard/apps',
            icon: Package,
          },
        ],
      },
      {
        title: 'إدارة العلاقات',
        items: [
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
        ],
      },
      {
        title: 'الأعمال',
        items: [
          {
            title: 'القضايا',
            url: '/dashboard/cases',
            icon: Scale,
          },
          {
            title: 'المستندات',
            url: '/dashboard/documents',
            icon: FileText,
          },
          {
            title: 'خدماتي',
            url: '/dashboard/jobs/my-services',
            icon: Briefcase,
          },
          {
            title: 'تصفح الوظائف',
            url: '/dashboard/jobs/browse',
            icon: Briefcase,
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
                title: 'عروض الأسعار',
                url: '/dashboard/finance/quotes',
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
              {
                title: 'التقارير',
                url: '/dashboard/reports',
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
                title: 'بيانات الشركة',
                url: '/dashboard/settings/company',
              },
              {
                title: 'إعدادات الفواتير',
                url: '/dashboard/settings/finance',
              },
              {
                title: 'الضرائب',
                url: '/dashboard/settings/taxes',
              },
              {
                title: 'طرق الدفع',
                url: '/dashboard/settings/payment-modes',
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
