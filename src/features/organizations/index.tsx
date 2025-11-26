import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { OrganizationsDialogs } from './components/organizations-dialogs'
import { OrganizationsPrimaryButtons } from './components/organizations-primary-buttons'
import { OrganizationsProvider } from './components/organizations-provider'
import { OrganizationsTable } from './components/organizations-table'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useTranslation } from 'react-i18next'

const route = getRouteApi('/_authenticated/dashboard/organizations/')

export function Organizations() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Fetch organizations data from API
  const { data, isLoading } = useOrganizations({
    status: search.status?.[0],
    type: search.type?.[0],
    search: search.name,
  })

  return (
    <OrganizationsProvider>
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
              {t('organizations.title')}
            </h2>
            <p className='text-muted-foreground'>{t('organizations.description')}</p>
          </div>
          <OrganizationsPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <OrganizationsTable
            data={(data?.data || []) as any}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <OrganizationsDialogs />
    </OrganizationsProvider>
  )
}
