import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  MessageSquare,
  Briefcase,
  Users,
  Scale,
  DollarSign,
  BarChart3,
  Award,
  BookOpen,
  Settings,
  UserCog,
  Lock,
  Palette,
  HelpCircle,
  Building2,
} from 'lucide-react'
import { type SidebarData } from '@/components/layout/types'

export function useSidebarData(): SidebarData {

  return {
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: 'TRAF3LI',
        logo: Building2,
        plan: 'Enterprise',
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
            url: '/calendar',
            icon: Calendar,
          },
          {
            title: 'المهام',
            icon: ListTodo,
            items: [
              {
                title: 'المهام',
                url: '/tasks',
              },
              {
                title: 'التذكيرات',
                url: '/tasks/reminders',
              },
              {
                title: 'الأحداث',
                url: '/events',
              },
            ],
          },
          {
            title: 'الرسائل',
            icon: MessageSquare,
            items: [
              {
                title: 'الدردشة',
                url: '/chats',
              },
              {
                title: 'البريد الإلكتروني',
                url: '/messages/email',
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
                url: '/jobs/my-gigs',
              },
              {
                title: 'تصفح الوظائف',
                url: '/jobs/browse',
              },
            ],
          },
          {
            title: 'العملاء',
            url: '/clients',
            icon: Users,
          },
          {
            title: 'القضايا',
            url: '/cases',
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
                url: '/billing',
              },
              {
                title: 'الفواتير',
                url: '/billing/invoices',
              },
              {
                title: 'المصروفات',
                url: '/billing/expenses',
              },
              {
                title: 'كشوف الحساب',
                url: '/billing/statements',
              },
              {
                title: 'المعاملات',
                url: '/billing/transactions',
              },
              {
                title: 'تتبع الوقت',
                url: '/finance/time-tracking',
              },
              {
                title: 'نشاط الحساب',
                url: '/finance/account-activity',
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
            icon: Award,
            items: [
              {
                title: 'نظرة عامة',
                url: '/reviews',
              },
              {
                title: 'شاراتي',
                url: '/achievements',
              },
            ],
          },
          {
            title: 'التقارير',
            icon: BarChart3,
            items: [
              {
                title: 'تقرير الإيرادات',
                url: '/reports/revenue',
              },
              {
                title: 'تقرير القضايا',
                url: '/reports/cases',
              },
              {
                title: 'تقرير الوقت',
                url: '/reports/time-tracking',
              },
            ],
          },
          {
            title: 'مركز المعرفة',
            icon: BookOpen,
            items: [
              {
                title: 'القوانين',
                url: '/knowledge/laws',
              },
              {
                title: 'الأحكام',
                url: '/knowledge/rulings',
              },
              {
                title: 'النماذج',
                url: '/knowledge/forms',
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
                url: '/settings',
                icon: UserCog,
              },
              {
                title: 'الأمان',
                url: '/settings/account',
                icon: Lock,
              },
              {
                title: 'التفضيلات',
                url: '/settings/appearance',
                icon: Palette,
              },
            ],
          },
          {
            title: 'مركز المساعدة',
            url: '/help-center',
            icon: HelpCircle,
          },
        ],
      },
    ],
  }
}
