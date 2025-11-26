import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientsDialogs } from './components/clients-dialogs'
import { ClientsPrimaryButtons } from './components/clients-primary-buttons'
import { ClientsProvider } from './components/clients-provider'
import { ClientsTable } from './components/clients-table'
import { useClients } from '@/hooks/useClients'
import { useTranslation } from 'react-i18next'

const route = getRouteApi('/_authenticated/dashboard/clients/')

export function Clients() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Fetch clients data from API
  const { data, isLoading } = useClients({
    page: search.page,
    limit: search.pageSize,
    status: search.status?.[0],
    search: search.fullName,
  })

  return (
    <ClientsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('clients.title')}
            </h2>
            <p className='text-muted-foreground'>{t('clients.description')}</p>
          </div>
          <ClientsPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <ClientsTable
            data={(data?.data || []) as any}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <ClientsDialogs />
    </ClientsProvider>
  )
}
