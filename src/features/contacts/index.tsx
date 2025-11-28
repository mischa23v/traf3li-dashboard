import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ContactsDialogs } from './components/contacts-dialogs'
import { ContactsPrimaryButtons } from './components/contacts-primary-buttons'
import { ContactsProvider } from './components/contacts-provider'
import { ContactsTable } from './components/contacts-table'
import { useContacts } from '@/hooks/useContacts'
import { useTranslation } from 'react-i18next'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import { Search, Bell, Users, Plus } from 'lucide-react'
import { PracticeSidebar } from '@/features/cases/components/practice-sidebar'
import { Badge } from '@/components/ui/badge'

const route = getRouteApi('/_authenticated/dashboard/contacts/')

export function Contacts() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Fetch contacts data from API
  const { data, isLoading } = useContacts({
    status: search.status?.[0],
    type: search.type?.[0],
    search: search.name,
  })

  const topNav = [
    { title: isRTL ? 'جهات الاتصال' : 'Contacts', href: '/dashboard/contacts', isActive: true },
    { title: isRTL ? 'العملاء' : 'Clients', href: '/dashboard/clients', isActive: false },
  ]

  return (
    <ContactsProvider>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <Users className="w-3 h-3 ml-2" />
                  {isRTL ? 'إدارة العلاقات' : 'Relationship Management'}
                </Badge>
                <span className="text-slate-400 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('contacts.title')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('contacts.description')}
              </p>
            </div>
            <ContactsPrimaryButtons />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              {isLoading ? (
                <div className='space-y-4 p-6'>
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
            </div>
          </div>

          {/* Sidebar */}
          <PracticeSidebar context="contacts" />
        </div>
      </Main>

      <ContactsDialogs />
    </ContactsProvider>
  )
}
