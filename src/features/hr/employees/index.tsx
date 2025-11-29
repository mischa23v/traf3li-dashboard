import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { EmployeesDialogs } from './components/employees-dialogs'
import { EmployeesPrimaryButtons } from './components/employees-primary-buttons'
import { EmployeesProvider } from './components/employees-provider'
import { EmployeesTable } from './components/employees-table'
import { useEmployees } from '@/hooks/useEmployees'
import { useTranslation } from 'react-i18next'

const route = getRouteApi('/_authenticated/dashboard/hr/employees/')

export function Employees() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Fetch employees data from API
  const { data, isLoading } = useEmployees({
    status: search.status?.[0],
    department: search.department?.[0],
    search: search.search,
  })

  return (
    <EmployeesProvider>
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
              {t('hr.employees.title')}
            </h2>
            <p className='text-muted-foreground'>
              {t('hr.employees.description')}
            </p>
          </div>
          <EmployeesPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <EmployeesTable
            data={(data?.data || []) as any}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <EmployeesDialogs />
    </EmployeesProvider>
  )
}
