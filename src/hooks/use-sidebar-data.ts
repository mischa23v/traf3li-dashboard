import { useTranslation } from 'react-i18next'
import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
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
        title: t('sidebar.general'),
        items: [
          {
            title: t('sidebar.dashboard'),
            url: '/',
            icon: LayoutDashboard,
          },
          {
            title: t('sidebar.tasks'),
            url: '/tasks',
            icon: ListTodo,
          },
          {
            title: t('sidebar.apps'),
            url: '/apps',
            icon: Package,
          },
          {
            title: t('sidebar.chats'),
            url: '/chats',
            badge: '3',
            icon: MessagesSquare,
          },
          {
            title: t('sidebar.users'),
            url: '/users',
            icon: Users,
          },
          {
            title: t('sidebar.securedByClerk'),
            icon: ClerkLogo,
            items: [
              {
                title: t('sidebar.signIn'),
                url: '/clerk/sign-in',
              },
              {
                title: t('sidebar.signUp'),
                url: '/clerk/sign-up',
              },
              {
                title: 'User Management',
                url: '/clerk/user-management',
              },
            ],
          },
        ],
      },
      {
        title: t('sidebar.pages'),
        items: [
          {
            title: t('sidebar.auth'),
            icon: ShieldCheck,
            items: [
              {
                title: t('sidebar.signIn'),
                url: '/sign-in',
              },
              {
                title: t('sidebar.signIn2Col'),
                url: '/sign-in-2',
              },
              {
                title: t('sidebar.signUp'),
                url: '/sign-up',
              },
              {
                title: t('sidebar.forgotPassword'),
                url: '/forgot-password',
              },
              {
                title: t('sidebar.otp'),
                url: '/otp',
              },
            ],
          },
          {
            title: t('sidebar.errors'),
            icon: Bug,
            items: [
              {
                title: t('sidebar.unauthorized'),
                url: '/errors/unauthorized',
                icon: Lock,
              },
              {
                title: t('sidebar.forbidden'),
                url: '/errors/forbidden',
                icon: UserX,
              },
              {
                title: t('sidebar.notFound'),
                url: '/errors/not-found',
                icon: FileX,
              },
              {
                title: t('sidebar.internalServerError'),
                url: '/errors/internal-server-error',
                icon: ServerOff,
              },
              {
                title: t('sidebar.maintenanceError'),
                url: '/errors/maintenance-error',
                icon: Construction,
              },
            ],
          },
        ],
      },
      {
        title: t('sidebar.other'),
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
                title: t('sidebar.account'),
                url: '/settings/account',
                icon: Wrench,
              },
              {
                title: t('sidebar.appearance'),
                url: '/settings/appearance',
                icon: Palette,
              },
              {
                title: t('sidebar.notifications'),
                url: '/settings/notifications',
                icon: Bell,
              },
              {
                title: t('sidebar.display'),
                url: '/settings/display',
                icon: Monitor,
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
