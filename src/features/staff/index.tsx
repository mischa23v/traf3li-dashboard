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
import { ProductivityHero } from '@/components/productivity-hero'
import { CrmSidebar } from '@/components/crm-sidebar'

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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero badge="فريق العمل" title={t('staff.title')} type="staff" hideButtons={true}>
          <StaffPrimaryButtons />
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
          </div>

          <CrmSidebar context="staff" />
        </div>
      </Main>

      <StaffDialogs />
    </StaffProvider>
  )
}
