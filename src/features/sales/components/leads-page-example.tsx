/**
 * Example: Complete Lead Management Page with Layout
 *
 * This shows how to integrate the LeadsDashboard component
 * with the app's standard layout (Header, Sidebar, etc.)
 */

import { LeadsDashboard } from './leads-dashboard'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Search, Bell } from 'lucide-react'

export function LeadsPage() {
  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/sales/leads', isActive: true },
    { title: 'مسار المبيعات', href: '/dashboard/sales/pipeline', isActive: false },
    { title: 'الفرص', href: '/dashboard/sales/opportunities', isActive: false },
    { title: 'التقارير', href: '/dashboard/sales/reports', isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Hero Section */}
        <ProductivityHero
          badge="إدارة المبيعات"
          title="العملاء المحتملين"
          type="leads"
          hideButtons={true}
        >
          <p className="text-white/80 text-sm">
            إدارة وتتبع العملاء المحتملين من الاستفسار حتى التحويل لعملاء فعليين
          </p>
        </ProductivityHero>

        {/* Dashboard Component */}
        <LeadsDashboard />
      </Main>
    </>
  )
}

/**
 * ALTERNATIVE: Simpler Integration Without Layout
 *
 * If you already have the layout in your route:
 */

export function SimpleLeadsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">العملاء المحتملين</h1>
        <p className="text-slate-600 mt-2">
          إدارة وتتبع العملاء المحتملين من الاستفسار حتى التحويل
        </p>
      </div>

      <LeadsDashboard />
    </div>
  )
}

/**
 * ROUTE EXAMPLE
 *
 * Create a route file at:
 * src/routes/_authenticated/dashboard.sales.leads.tsx
 */

// import { createFileRoute } from '@tanstack/react-router'
// import { LeadsPage } from '@/features/sales/components/leads-page-example'
//
// export const Route = createFileRoute('/_authenticated/dashboard/sales/leads')({
//   component: LeadsPage,
// })
