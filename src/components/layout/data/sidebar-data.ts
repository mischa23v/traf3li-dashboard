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
      plan: 'Legal Platform',
    },
    {
      name: 'Law Firm',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Solo Practice',
      logo: AudioWaveform,
      plan: 'Professional',
    },
  ],
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Overview',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Calendar',
          url: '/calendar',
          icon: Calendar,
        },
        {
          title: 'Tasks',
          icon: ListTodo,
          items: [
            {
              title: 'Tasks',
              url: '/tasks',
            },
            {
              title: 'Reminders',
              url: '/tasks/reminders',
            },
          ],
        },
        {
          title: 'Messages',
          icon: MessagesSquare,
          items: [
            {
              title: 'Chat',
              url: '/chats',
            },
            {
              title: 'Email',
              url: '/messages/email',
            },
          ],
        },
        {
          title: 'Jobs',
          icon: Briefcase,
          items: [
            {
              title: 'My Gigs',
              url: '/jobs/my-gigs',
            },
            {
              title: 'Browse Jobs',
              url: '/jobs/browse',
            },
          ],
        },
        {
          title: 'Clients',
          icon: Users,
          items: [
            {
              title: 'Current Clients',
              url: '/clients/current',
            },
            {
              title: 'All Clients',
              url: '/clients',
            },
          ],
        },
        {
          title: 'Cases',
          icon: Scale,
          items: [
            {
              title: 'Active Cases',
              url: '/cases/active',
            },
            {
              title: 'All Cases',
              url: '/cases',
            },
          ],
        },
      ],
    },
    {
      title: 'Financial',
      items: [
        {
          title: 'Billing',
          icon: DollarSign,
          items: [
            {
              title: 'Dashboard',
              url: '/billing',
            },
            {
              title: 'Invoices',
              url: '/billing/invoices',
            },
            {
              title: 'Expenses',
              url: '/billing/expenses',
            },
            {
              title: 'Statements',
              url: '/billing/statements',
            },
            {
              title: 'Transactions',
              url: '/billing/transactions',
            },
          ],
        },
      ],
    },
    {
      title: 'Professional',
      items: [
        {
          title: 'Reviews & Reputation',
          icon: Star,
          items: [
            {
              title: 'Overview',
              url: '/reviews',
            },
            {
              title: 'All Reviews',
              url: '/reviews/all',
            },
            {
              title: 'My Badges',
              url: '/reviews/badges',
            },
          ],
        },
        {
          title: 'Reports',
          icon: BarChart3,
          items: [
            {
              title: 'Revenue Report',
              url: '/reports/revenue',
            },
            {
              title: 'Cases Report',
              url: '/reports/cases',
            },
            {
              title: 'Time Tracking',
              url: '/reports/time-tracking',
            },
          ],
        },
        {
          title: 'Knowledge Center',
          icon: BookOpen,
          items: [
            {
              title: 'Laws',
              url: '/knowledge/laws',
            },
            {
              title: 'Judgments',
              url: '/knowledge/judgments',
            },
            {
              title: 'Templates',
              url: '/knowledge/templates',
            },
          ],
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Security',
              url: '/settings/security',
              icon: Shield,
            },
            {
              title: 'Preferences',
              url: '/settings/appearance',
              icon: Palette,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
