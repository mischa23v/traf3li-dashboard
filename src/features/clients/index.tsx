import { getRouteApi, Link } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientsDialogs } from './components/clients-dialogs'
import { ClientsPrimaryButtons } from './components/clients-primary-buttons'
import { ClientsProvider, useClientsContext } from './components/clients-provider'
import { ClientsTable } from './components/clients-table'
import { useClients } from '@/hooks/useClients'
import { useTranslation } from 'react-i18next'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { Button } from '@/components/ui/button'
import { Plus, Users, Search as SearchIcon, Bell } from 'lucide-react'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProductivityHero } from '@/components/productivity-hero'

const route = getRouteApi('/_authenticated/dashboard/clients/')

export function Clients() {
  return (
    <ClientsProvider>
      <ClientsContent />
      <ClientsDialogs />
    </ClientsProvider>
  )
}

function ClientsContent() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useClientsContext()

  // Fetch clients data from API
  const { data, isLoading } = useClients({
    page: search.page,
    limit: search.pageSize,
    status: search.status?.[0],
    search: search.fullName,
  })

  const topNav = [
    { title: t('sidebar.nav.clients'), href: '/dashboard/clients', isActive: true },
    { title: t('sidebar.nav.organizations'), href: '/dashboard/organizations', isActive: false },
    { title: t('sidebar.nav.cases'), href: '/dashboard/cases', isActive: false },
  ]

  const isEmpty = !isLoading && data?.data?.length === 0 && !search.fullName && !search.status

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" placeholder={t('common.search')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Hero Card */}
        <ProductivityHero badge={t('clients.management')} title={t('clients.title')} type="clients" hideButtons={true}>
          <ClientsPrimaryButtons />
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {isLoading ? (
                <div className='space-y-4'>
                  <Skeleton className='h-12 w-full' />
                  <Skeleton className='h-96 w-full' />
                </div>
              ) : isEmpty ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t('clients.noClients')}</h3>
                  <p className="text-slate-500 mb-6">{t('clients.startAddingClient')}</p>
                  <Button onClick={() => setOpen('add')} className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                    <Plus className="ms-2 h-4 w-4" />
                    {t('clients.addNewClient')}
                  </Button>
                </div>
              ) : (
                <ClientsTable
                  data={(data?.data || []) as any}
                  search={search}
                  navigate={navigate}
                />
              )}
            </div>
          <ClientsSidebar context="clients" />
        </div>
      </Main>
    </>
  )
}
