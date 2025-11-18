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
            title: t('sidebar.tasks'),
            url: '/tasks',
            icon: CheckSquare,
          },
          {
            title: t('sidebar.messages'),
            url: '/chats',
            icon: MessageSquare,
          },
          {
            title: t('sidebar.clients'),
            url: '/users',
            icon: Users,
          },
          {
            title: t('sidebar.apps'),
            url: '/apps',
            icon: Briefcase,
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
                title: t('sidebar.account'),
                url: '/settings/account',
              },
              {
                title: t('sidebar.appearance'),
                url: '/settings/appearance',
              },
              {
                title: t('sidebar.notifications'),
                url: '/settings/notifications',
              },
              {
                title: t('sidebar.display'),
                url: '/settings/display',
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
