import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ContactsDialogs } from './components/contacts-dialogs'
import { ContactsPrimaryButtons } from './components/contacts-primary-buttons'
import { ContactsProvider } from './components/contacts-provider'
import { ContactsTable } from './components/contacts-table'
import { useContacts } from '@/hooks/useContacts'
import { useTranslation } from 'react-i18next'

const route = getRouteApi('/_authenticated/dashboard/contacts/')

export function Contacts() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Fetch contacts data from API
  const { data, isLoading } = useContacts({
    status: search.status?.[0],
    type: search.type?.[0],
    search: search.name,
  })

  return (
    <ContactsProvider>
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
              {t('contacts.title')}
            </h2>
            <p className='text-muted-foreground'>{t('contacts.description')}</p>
          </div>
          <ContactsPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-12 w-full' />
            <Skeleton className='h-96 w-full' />
          </div>
        ) : (
          <ContactsTable
            data={(data?.data || []) as any}
            search={search}
            navigate={navigate}
          />
        )}
      </Main>

      <ContactsDialogs />
    </ContactsProvider>
  )
}
