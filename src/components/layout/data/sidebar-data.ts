import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  MessageSquare,
  Scale,
  DollarSign,
  Settings,
  UserCog,
  Shield,
  Sliders,
  HelpCircle,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'TRAF3LI',
      logo: Command,
      plan: 'Dashboard',
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
          ],
        },
      ],
    },
    {
      title: 'الأعمال',
      items: [
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
              icon: Shield,
            },
            {
              title: 'التفضيلات',
              url: '/settings/appearance',
              icon: Sliders,
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
