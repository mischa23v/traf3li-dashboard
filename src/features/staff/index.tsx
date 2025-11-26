import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { StaffDialogs } from './components/staff-dialogs'
import { StaffPrimaryButtons } from './components/staff-primary-buttons'
import { StaffProvider } from './components/staff-provider'
import { StaffTable } from './components/staff-table'
import { useStaff } from '@/hooks/useStaff'
import { useTranslation } from 'react-i18next'

const route = getRouteApi('/_authenticated/dashboard/staff/')

export function Staff() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Fetch staff data from API
  const { data, isLoading } = useStaff({
    status: search.status?.[0],
    role: search.role?.[0],
    search: search.email,
  })

  return (
    <StaffProvider>
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
              {t('staff.title')}
            </h2>
            <p className='text-muted-foreground'>{t('staff.description')}</p>
          </div>
          <StaffPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <StaffTable
            data={(data || []) as any}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <StaffDialogs />
    </StaffProvider>
  )
}
