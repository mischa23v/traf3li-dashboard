import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function Statements() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>كشوف الحساب</h2>
          <p className='text-muted-foreground'>
            عرض وإدارة كشوف الحساب
          </p>
        </div>
        <div className='rounded-lg border bg-card p-8 text-center'>
          <p className='text-muted-foreground'>
            صفحة كشوف الحساب قيد التطوير
          </p>
        </div>
      </Main>
    </>
  )
}
