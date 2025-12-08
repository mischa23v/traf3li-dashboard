import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StaffDialogs } from './components/staff-dialogs'
import { StaffPrimaryButtons } from './components/staff-primary-buttons'
import { StaffProvider } from './components/staff-provider'
import { StaffTable } from './components/staff-table'
import { useStaff } from '@/hooks/useStaff'
import { useTranslation } from 'react-i18next'
import { ProductivityHero } from '@/components/productivity-hero'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { PageAccessGuard } from '@/components/auth/PageAccessGuard'
import { AccessMatrixManager } from '@/components/admin/AccessMatrixManager'
import { UserOverrideManager } from '@/components/admin/UserOverrideManager'
import { AdminGate, ViewGate } from '@/components/permission-gate'
import { usePermissions } from '@/hooks/use-permissions'
import { Bell, Search as SearchIcon, Users, Shield, UserCog, UserCheck, UserX } from 'lucide-react'

const route = getRouteApi('/_authenticated/dashboard/staff/')

export function Staff() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [activeTab, setActiveTab] = useState('staff')
  const { isAdminOrOwner, isLoading: permissionsLoading } = usePermissions()

  // Fetch staff data from API
  const { data, isLoading } = useStaff({
    status: search.status?.[0],
    role: search.role?.[0],
    search: search.email,
  })

  // Calculate staff statistics
  const staffStats = {
    total: data?.length || 0,
    active: data?.filter((s: any) => s.status === 'active').length || 0,
    departed: data?.filter((s: any) => s.status === 'departed' || s.role === 'departed').length || 0,
    pending: data?.filter((s: any) => s.status === 'pending').length || 0,
  }

  const topNav = [
    { title: t('sidebar.nav.clients'), href: '/dashboard/clients', isActive: false },
    { title: t('sidebar.nav.contacts'), href: '/dashboard/contacts', isActive: false },
    { title: t('sidebar.nav.organizations'), href: '/dashboard/organizations', isActive: false },
    { title: t('sidebar.nav.staff'), href: '/dashboard/staff', isActive: true },
  ]

  const isAdmin = !permissionsLoading && isAdminOrOwner()

  return (
    <PageAccessGuard>
      <StaffProvider>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className='ms-auto flex items-center gap-4'>
            <div className="relative hidden md:block">
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input type="text" placeholder={t('common.search')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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

        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
          <ProductivityHero badge={t('staff.management')} title={t('staff.title')} type="staff" hideButtons={true}>
            <StaffPrimaryButtons />
          </ProductivityHero>

          {/* Staff Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{staffStats.total}</p>
                    <p className="text-xs text-muted-foreground">{t('staff.stats.total')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{staffStats.active}</p>
                    <p className="text-xs text-muted-foreground">{t('staff.stats.active')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600">
                    <UserX className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{staffStats.departed}</p>
                    <p className="text-xs text-muted-foreground">{t('staff.stats.departed')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{staffStats.pending}</p>
                    <p className="text-xs text-muted-foreground">{t('staff.stats.pending')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content with Tabs for Admin */}
          {isAdmin ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white/80 backdrop-blur">
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('staff.tabs.members')}
                  <Badge variant="secondary" className="ms-1">{staffStats.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('staff.tabs.permissions')}
                </TabsTrigger>
                <TabsTrigger value="overrides" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  {t('staff.tabs.overrides')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="staff" className="mt-0">
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
                  <ClientsSidebar context="staff" />
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <AccessMatrixManager />
              </TabsContent>

              <TabsContent value="overrides" className="mt-0">
                <UserOverrideManager />
              </TabsContent>
            </Tabs>
          ) : (
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
              <ClientsSidebar context="staff" />
            </div>
          )}
        </Main>

        <StaffDialogs />
      </StaffProvider>
    </PageAccessGuard>
  )
}
