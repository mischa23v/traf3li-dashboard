import { useTranslation } from 'react-i18next'
import {
  Home,
  CheckSquare,
  MessageSquare,
  Briefcase,
  Users,
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
            url: '/',
            icon: CheckSquare,
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
                url: '/tasks',
              },
              {
                title: t('sidebar.events'),
                url: '/tasks',
              },
            ],
          },
          {
            title: t('sidebar.messages'),
            icon: MessageSquare,
            items: [
              {
                title: t('sidebar.chat'),
                url: '/chats',
              },
              {
                title: t('sidebar.email'),
                url: '/chats',
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
                url: '/apps',
              },
              {
                title: t('sidebar.browseJobs'),
                url: '/apps',
              },
            ],
          },
          {
            title: t('sidebar.clients'),
            url: '/users',
            icon: Users,
          },
          {
            title: t('sidebar.cases'),
            url: '/',
            icon: Briefcase,
          },
        ],
      },
      {
        title: t('sidebar.finance'),
        items: [
          {
            title: t('sidebar.accounts'),
            icon: Briefcase,
            items: [
              {
                title: t('sidebar.accountsDashboard'),
                url: '/',
              },
              {
                title: t('sidebar.invoices'),
                url: '/',
              },
              {
                title: t('sidebar.expenses'),
                url: '/',
              },
              {
                title: t('sidebar.statements'),
                url: '/',
              },
              {
                title: t('sidebar.transactions'),
                url: '/',
              },
              {
                title: t('sidebar.timeTracking'),
                url: '/',
              },
              {
                title: t('sidebar.accountActivity'),
                url: '/',
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
            icon: Home,
            items: [
              {
                title: t('sidebar.overview'),
                url: '/',
              },
              {
                title: t('sidebar.myBadges'),
                url: '/',
              },
            ],
          },
          {
            title: t('sidebar.reports'),
            icon: Home,
            items: [
              {
                title: t('sidebar.revenueReport'),
                url: '/',
              },
              {
                title: t('sidebar.casesReport'),
                url: '/',
              },
              {
                title: t('sidebar.timeReport'),
                url: '/',
              },
            ],
          },
          {
            title: t('sidebar.knowledgeCenter'),
            icon: Home,
            items: [
              {
                title: t('sidebar.laws'),
                url: '/',
              },
              {
                title: t('sidebar.judgments'),
                url: '/',
              },
              {
                title: t('sidebar.forms'),
                url: '/',
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
              },
              {
                title: t('sidebar.security'),
                url: '/settings/account',
              },
              {
                title: t('sidebar.preferences'),
                url: '/settings/appearance',
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
