import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
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
import { useTranslation } from 'react-i18next'
import { type SidebarData } from '@/components/layout/types'

export function useSidebarData(): SidebarData {
  const { t } = useTranslation()
  return {
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: t('sidebar.teamSwitcher.traf3li'),
        logo: Command,
        plan: t('sidebar.teamSwitcher.legalPlatform'),
      },
      {
        name: t('sidebar.teamSwitcher.lawFirm'),
        logo: GalleryVerticalEnd,
        plan: t('sidebar.teamSwitcher.enterprise'),
      },
      {
        name: t('sidebar.teamSwitcher.soloPractice'),
        logo: AudioWaveform,
        plan: t('sidebar.teamSwitcher.professional'),
      },
    ],
    navGroups: [
      {
        title: t('sidebar.main'),
        items: [
          {
            title: t('sidebar.overview'),
            url: '/',
            icon: LayoutDashboard,
          },
          {
            title: t('sidebar.calendar'),
            url: '/calendar',
            icon: Calendar,
          },
          {
            title: t('sidebar.tasks'),
            icon: ListTodo,
            items: [
              {
                title: t('sidebar.tasks'),
                url: '/tasks',
              },
              {
                title: t('sidebar.reminders'),
                url: '/tasks/reminders',
              },
            ],
          },
          {
            title: t('sidebar.messages'),
            icon: MessagesSquare,
            items: [
              {
                title: t('sidebar.chat'),
                url: '/chats',
              },
              {
                title: t('sidebar.email'),
                url: '/messages/email',
              },
              {
                title: t('sidebar.events'),
                url: '/events',
              },
            ],
          },
          {
            title: t('sidebar.jobs'),
            icon: Briefcase,
            items: [
              {
                title: t('sidebar.myGigs'),
                url: '/jobs/my-gigs',
              },
              {
                title: t('sidebar.browseJobs'),
                url: '/jobs/browse',
              },
            ],
          },
          {
            title: t('sidebar.clients'),
            icon: Users,
            items: [
              {
                title: t('sidebar.allClients'),
                url: '/clients',
              },
            ],
          },
          {
            title: t('sidebar.cases'),
            icon: Scale,
            items: [
              {
                title: t('sidebar.allCases'),
                url: '/cases',
              },
            ],
          },
        ],
      },
      {
        title: t('sidebar.financial'),
        items: [
          {
            title: t('sidebar.billing'),
            icon: DollarSign,
            items: [
              {
                title: t('sidebar.billingDashboard'),
                url: '/billing',
              },
              {
                title: t('sidebar.invoices'),
                url: '/billing/invoices',
              },
              {
                title: t('sidebar.expenses'),
                url: '/billing/expenses',
              },
              {
                title: t('sidebar.statements'),
                url: '/billing/statements',
              },
              {
                title: t('sidebar.transactions'),
                url: '/billing/transactions',
              },
            ],
          },
          {
            title: t('sidebar.finance'),
            icon: DollarSign,
            items: [
              {
                title: t('sidebar.accountActivity'),
                url: '/finance/account-activity',
              },
              {
                title: t('sidebar.timeTracking'),
                url: '/finance/time-tracking',
              },
            ],
          },
        ],
      },
      {
        title: t('sidebar.professional'),
        items: [
          {
            title: t('sidebar.reviewsAndReputation'),
            icon: Star,
            items: [
              {
                title: t('sidebar.reviewsOverview'),
                url: '/reviews',
              },
              {
                title: t('sidebar.myBadges'),
                url: '/reviews/badges',
              },
            ],
          },
          {
            title: t('sidebar.reports'),
            icon: BarChart3,
            items: [
              {
                title: t('sidebar.revenueReport'),
                url: '/reports/revenue',
              },
              {
                title: t('sidebar.casesReport'),
                url: '/reports/cases',
              },
              {
                title: t('sidebar.timeTracking'),
                url: '/reports/time-tracking',
              },
            ],
          },
          {
            title: t('sidebar.knowledgeCenter'),
            icon: BookOpen,
            items: [
              {
                title: t('sidebar.laws'),
                url: '/knowledge/laws',
              },
              {
                title: t('sidebar.judgments'),
                url: '/knowledge/judgments',
              },
              {
                title: t('sidebar.templates'),
                url: '/knowledge/templates',
              },
            ],
          },
        ],
      },
      {
        title: t('sidebar.system'),
        items: [
          {
            title: t('sidebar.settings'),
            icon: Settings,
            items: [
              {
                title: t('sidebar.profile'),
                url: '/settings',
                icon: UserCog,
              },
              {
                title: t('sidebar.security'),
                url: '/settings/security',
                icon: Shield,
              },
              {
                title: t('sidebar.preferences'),
                url: '/settings/appearance',
                icon: Palette,
              },
              {
                title: t('sidebar.helpCenter'),
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
