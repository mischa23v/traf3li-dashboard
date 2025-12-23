import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Search, Bell } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { PriorityQueue, SLADashboard } from '@/features/ml-scoring/components'

function MLQueuePage() {
  const { t } = useTranslation()

  const topNav = [
    { title: t('sidebar.nav.leads', 'Leads'), href: '/dashboard/crm/leads', isActive: false },
    { title: t('mlScoring.nav.analytics', 'ML Analytics'), href: '/dashboard/ml/analytics', isActive: false },
    { title: t('mlScoring.nav.queue', 'Priority Queue'), href: '/dashboard/ml/queue', isActive: true },
    { title: t('mlScoring.nav.sla', 'SLA Dashboard'), href: '/dashboard/ml/sla', isActive: false },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('common.search', 'Search...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      {/* Main Content */}
      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        <ProductivityHero
          badge={t('mlScoring.badge', 'AI-Powered')}
          title={t('mlScoring.priorityQueue', 'Priority Queue')}
          type="leads"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PriorityQueue showFilters={true} limit={50} />
          </div>
          <div>
            <SLADashboard period="7d" />
          </div>
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/ml/queue')({
  component: MLQueuePage,
})
