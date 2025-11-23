import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  MessageSquare,
  Briefcase,
  Users,
  Scale,
  DollarSign,
  Star,
  BarChart,
  BookOpen,
  Settings,
  HelpCircle,
} from 'lucide-react'

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
  return {
    user: {
      name: 'مشاري بن ناهد',
      email: 'meshari@lawyer.com',
      avatar: '',
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
            title: 'القضايا',
            url: '/dashboard/cases',
            icon: Scale,
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
            title: 'مركز المساعدة',
            url: '/dashboard/help',
            icon: HelpCircle,
          },
        ],
      },
    ],
  }
}
