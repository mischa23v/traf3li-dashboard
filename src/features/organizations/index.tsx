import { getRouteApi, Link } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { OrganizationsDialogs } from './components/organizations-dialogs'
import { OrganizationsPrimaryButtons } from './components/organizations-primary-buttons'
import { OrganizationsProvider, useOrganizationsContext } from './components/organizations-provider'
import { OrganizationsTable } from './components/organizations-table'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useTranslation } from 'react-i18next'
import { PracticeSidebar } from '@/features/cases/components/practice-sidebar'
import { Button } from '@/components/ui/button'
import { Plus, Building2, Search as SearchIcon, Bell } from 'lucide-react'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'

const route = getRouteApi('/_authenticated/dashboard/organizations/')

export function Organizations() {
  return (
    <OrganizationsProvider>
      <OrganizationsContent />
      <OrganizationsDialogs />
    </OrganizationsProvider>
  )
}

function OrganizationsContent() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { setOpen } = useOrganizationsContext()

  // Fetch organizations data from API
  const { data, isLoading } = useOrganizations({
    status: search.status?.[0],
    type: search.type?.[0],
    search: search.name,
  })

  const topNav = [
    { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    { title: 'المنظمات', href: '/dashboard/organizations', isActive: true },
    { title: 'القضايا', href: '/dashboard/cases', isActive: false },
  ]

  const isEmpty = !isLoading && data?.data?.length === 0 && !search.name && !search.status && !search.type

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-navy p-8 lg:p-12 shadow-2xl shadow-emerald-900/20 ring-1 ring-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium">
                  <Building2 className="w-4 h-4" />
                  <span>إدارة المنظمات</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  {t('organizations.title')}
                </h1>
                <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                  {t('organizations.description')}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <OrganizationsPrimaryButtons />
              </div>
            </div>
          </div>

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
                    <Building2 className="h-8 w-8 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t('organizations.noOrganizations')}</h3>
                  <p className="text-slate-500 mb-6">ابدأ بإضافة منظمة جديدة للنظام</p>
                  <Button onClick={() => setOpen('add')} className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة منظمة جديدة
                  </Button>
                </div>
              ) : (
                <OrganizationsTable
                  data={(data?.data || []) as any}
                  search={search}
                  navigate={navigate}
                />
              )}
            </div>
            <PracticeSidebar context="organizations" />
          </div>
        </div>
      </Main>
    </>
  )
}
