import { Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { Monitor, Bell, Palette, Wrench, UserCog, Key, Plug, Webhook, Mail, CreditCard } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'
import { ROUTES } from '@/constants/routes'

export function Settings() {
  const { t } = useTranslation()

  // Memoize sidebar navigation items to prevent recreation on every render
  const sidebarNavItems = useMemo(() => [
    {
      title: t('settings.tabs.profile'),
      href: ROUTES.settings.index,
      icon: <UserCog size={18} />,
    },
    {
      title: t('settings.tabs.account'),
      href: ROUTES.settings.account,
      icon: <Wrench size={18} />,
    },
    {
      title: t('settings.tabs.appearance'),
      href: ROUTES.settings.appearance,
      icon: <Palette size={18} />,
    },
    {
      title: t('settings.tabs.notifications'),
      href: ROUTES.settings.notifications,
      icon: <Bell size={18} />,
    },
    {
      title: t('settings.tabs.display'),
      href: ROUTES.settings.display,
      icon: <Monitor size={18} />,
    },
    {
      title: t('settings.tabs.billing', 'Billing'),
      href: ROUTES.settings.billing,
      icon: <CreditCard size={18} />,
    },
    {
      title: t('settings.tabs.email', 'Email'),
      href: ROUTES.settings.email,
      icon: <Mail size={18} />,
    },
    {
      title: t('settings.tabs.apiKeys'),
      href: ROUTES.settings.apiKeys,
      icon: <Key size={18} />,
    },
    {
      title: t('settings.tabs.webhooks', 'Webhooks'),
      href: ROUTES.settings.webhooks,
      icon: <Webhook size={18} />,
    },
    {
      title: t('settings.tabs.integrations'),
      href: ROUTES.settings.integrations,
      icon: <Plug size={18} />,
    },
  ], [t])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('settings.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('settings.description')}
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:gap-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
