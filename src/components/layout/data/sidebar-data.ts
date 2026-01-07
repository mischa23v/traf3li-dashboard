import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
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
  Activity,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FileText,
  Clock,
  FilePlus,
  History,
  CheckSquare,
  BookOpen,
  Scale,
  Wallet,
  CreditCard,
  RefreshCw,
  Receipt,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'
import { ROUTES } from '@/constants/routes'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: ROUTES.dashboard.home,
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: ROUTES.legacy.tasks,
          icon: CheckSquare,
        },
        {
          title: 'Task Details',
          url: ROUTES.legacy.taskDetails,
          icon: FileText,
        },
        {
          title: 'sidebar.cases',
          icon: Scale,
          items: [
            {
              title: 'sidebar.allCases',
              url: ROUTES.dashboard.cases.list,
            },
          ],
        },
        {
          title: 'sidebar.finance',
          icon: Wallet,
          items: [
            {
              title: 'sidebar.invoices',
              url: ROUTES.dashboard.finance.invoices.list,
              icon: Receipt,
            },
            {
              title: 'sidebar.subscriptions',
              url: ROUTES.dashboard.finance.subscriptions.list,
              icon: RefreshCw,
            },
            {
              title: 'sidebar.subscriptionPlans',
              url: ROUTES.dashboard.finance.subscriptionPlans.list,
              icon: CreditCard,
            },
            {
              title: 'sidebar.payments',
              url: ROUTES.dashboard.finance.payments.list,
              icon: Wallet,
            },
          ],
        },
        {
          title: 'Apps',
          url: ROUTES.apps.list,
          icon: Package,
        },
        {
          title: 'Account Statements',
          url: ROUTES.legacy.accountStatements,
          icon: FileText,
        },
        {
          title: 'Account Activity',
          url: ROUTES.legacy.accountActivity,
          icon: Activity,
        },
        {
          title: 'Time Entries',
          url: ROUTES.legacy.timeEntries,
          icon: Clock,
        },
        {
          title: 'Generate Statement',
          url: ROUTES.legacy.generateStatement,
          icon: FilePlus,
        },
        {
          title: 'Statements History',
          url: ROUTES.legacy.statementsHistory,
          icon: History,
        },

        {
          title: 'Chats',
          url: ROUTES.chats.list,
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: ROUTES.users.list,
          icon: Users,
        },
        {
          title: 'Secured by Clerk',
          icon: ClerkLogo,
          items: [
            {
              title: 'Sign In',
              url: ROUTES.clerk.signIn,
            },
            {
              title: 'Sign Up',
              url: ROUTES.clerk.signUp,
            },
            {
              title: 'User Management',
              url: ROUTES.clerk.userManagement,
            },
          ],
        },
      ],
    },
    {
      title: 'Pages',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: ROUTES.auth.signIn,
            },
            {
              title: 'Sign In (2 Col)',
              url: ROUTES.auth.signIn2,
            },
            {
              title: 'Sign Up',
              url: ROUTES.auth.signUp,
            },
            {
              title: 'Forgot Password',
              url: ROUTES.auth.forgotPassword,
            },
            {
              title: 'OTP',
              url: ROUTES.auth.otp,
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: ROUTES.errors.custom('unauthorized'),
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: ROUTES.errors.custom('forbidden'),
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: ROUTES.errors.custom('not-found'),
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: ROUTES.errors.custom('internal-server-error'),
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: ROUTES.errors.custom('maintenance-error'),
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: ROUTES.settings.index,
              icon: UserCog,
            },
            {
              title: 'Account',
              url: ROUTES.settings.account,
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: ROUTES.settings.appearance,
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: ROUTES.settings.notifications,
              icon: Bell,
            },
            {
              title: 'Display',
              url: ROUTES.settings.display,
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: ROUTES.helpCenter.index,
          icon: HelpCircle,
        },
      ],
    },
  ],
}
