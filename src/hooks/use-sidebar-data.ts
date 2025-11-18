import { useTranslation } from 'react-i18next'
import {
  Home,
  Calendar,
  CheckSquare,
  MessageSquare,
  Briefcase,
  Users,
  Scale,
  DollarSign,
  Star,
  BarChart3,
  BookOpen,
  Settings,
  HelpCircle,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
} from 'lucide-react'
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
        name: t('sidebar.teamSwitcher.shadcnAdmin'),
        logo: Command,
        plan: t('sidebar.teamSwitcher.viteShadcnUI'),
      },
      {
        name: t('sidebar.teamSwitcher.acmeInc'),
        logo: GalleryVerticalEnd,
        plan: t('sidebar.teamSwitcher.enterprise'),
      },
      {
        name: t('sidebar.teamSwitcher.acmeCorp'),
        logo: AudioWaveform,
        plan: t('sidebar.teamSwitcher.startup'),
      },
    ],
    navGroups: [
      {
        title: t('sidebar.main'),
        items: [
          {
            title: t('sidebar.overview'),
            url: '/',
            icon: Home,
          },
          {
            title: t('sidebar.calendar'),
            url: '/calendar',
            icon: Calendar,
          },
          {
            title: t('sidebar.tasks'),
            icon: CheckSquare,
            items: [
              {
                title: t('sidebar.tasks'),
                url: '/tasks',
              },
              {
                title: t('sidebar.reminders'),
                url: '/tasks/reminders',
              },
              {
                title: t('sidebar.events'),
                url: '/tasks/events',
              },
            ],
          },
          {
            title: t('sidebar.messages'),
            icon: MessageSquare,
            items: [
              {
                title: t('sidebar.chat'),
                url: '/messages/chat',
              },
              {
                title: t('sidebar.email'),
                url: '/messages/email',
              },
            ],
          },
        ],
      },
      {
        title: t('sidebar.business'),
        items: [
          {
            title: t('sidebar.jobOpportunities'),
            icon: Briefcase,
            items: [
              {
                title: t('sidebar.myServices'),
                url: '/jobs/my-services',
              },
              {
                title: t('sidebar.browseJobs'),
                url: '/jobs/browse',
              },
            ],
          },
          {
            title: t('sidebar.clients'),
            url: '/clients',
            icon: Users,
          },
          {
            title: t('sidebar.cases'),
            url: '/cases',
            icon: Scale,
          },
        ],
      },
      {
        title: t('sidebar.finance'),
        items: [
          {
            title: t('sidebar.accounts'),
            icon: DollarSign,
            items: [
              {
                title: t('sidebar.accountsDashboard'),
                url: '/accounts/dashboard',
              },
              {
                title: t('sidebar.invoices'),
                url: '/accounts/invoices',
              },
              {
                title: t('sidebar.expenses'),
                url: '/accounts/expenses',
              },
              {
                title: t('sidebar.statements'),
                url: '/accounts/statements',
              },
              {
                title: t('sidebar.transactions'),
                url: '/accounts/transactions',
              },
              {
                title: t('sidebar.timeTracking'),
                url: '/accounts/time-tracking',
              },
              {
                title: t('sidebar.accountActivity'),
                url: '/accounts/activity',
              },
            ],
          },
        ],
      },
      {
        title: t('sidebar.professionalExcellence'),
        items: [
          {
            title: t('sidebar.ratingsReputation'),
            icon: Star,
            items: [
              {
                title: t('sidebar.overview'),
                url: '/ratings/overview',
              },
              {
                title: t('sidebar.myBadges'),
                url: '/ratings/badges',
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
                title: t('sidebar.timeReport'),
                url: '/reports/time',
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
                title: t('sidebar.forms'),
                url: '/knowledge/forms',
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
                url: '/settings/profile',
              },
              {
                title: t('sidebar.security'),
                url: '/settings/security',
              },
              {
                title: t('sidebar.preferences'),
                url: '/settings/preferences',
              },
            ],
          },
          {
            title: t('sidebar.helpCenter'),
            url: '/help-center',
            icon: HelpCircle,
          },
        ],
      },
    ],
  }
}
