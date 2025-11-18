import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  MessagesSquare,
  Briefcase,
  Users,
  Scale,
  DollarSign,
  Star,
  BarChart3,
  BookOpen,
  Settings,
  UserCog,
  Shield,
  Palette,
  HelpCircle,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
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
        logo: Command,
        plan: 'منصة قانونية',
      },
      {
        name: 'مكتب محاماة',
        logo: GalleryVerticalEnd,
        plan: 'مؤسسي',
      },
      {
        name: 'ممارسة فردية',
        logo: AudioWaveform,
        plan: 'احترافي',
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
            ],
          },
          {
            title: 'الرسائل',
            icon: MessagesSquare,
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
            icon: Users,
            items: [
              {
                title: 'العملاء الحاليون',
                url: '/clients/current',
              },
              {
                title: 'جميع العملاء',
                url: '/clients',
              },
            ],
          },
          {
            title: 'القضايا',
            icon: Scale,
            items: [
              {
                title: 'القضايا الحالية',
                url: '/cases/active',
              },
              {
                title: 'جميع القضايا',
                url: '/cases',
              },
            ],
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
            ],
          },
        ],
      },
      {
        title: 'احترافي',
        items: [
          {
            title: 'التقييمات والسمعة',
            icon: Star,
            items: [
              {
                title: 'نظرة عامة',
                url: '/reviews',
              },
              {
                title: 'جميع التقييمات',
                url: '/reviews/all',
              },
              {
                title: 'شاراتي',
                url: '/reviews/badges',
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
                title: 'تتبع الوقت',
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
                url: '/knowledge/judgments',
              },
              {
                title: 'النماذج',
                url: '/knowledge/templates',
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
                url: '/settings/security',
                icon: Shield,
              },
              {
                title: 'التفضيلات',
                url: '/settings/appearance',
                icon: Palette,
              },
              {
                title: 'مركز المساعدة',
                url: '/help-center',
                icon: HelpCircle,
              },
            ],
          },
        ],
      },
    ],
  }
}
