import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  Briefcase,
  Users,
  Scale,
  DollarSign,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronLeft,
  GraduationCap,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  useDashboardStats,
  useDashboardHeroStats,
  useTodayEvents,
  useFinancialSummary,
  useRecentMessages,
} from '@/hooks/useDashboard'

export function Dashboard() {
  const { t } = useTranslation()

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: heroStats, isLoading: heroLoading } = useDashboardHeroStats()
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents()
  const { data: financialSummary, isLoading: financialLoading } = useFinancialSummary()
  const { data: recentMessages, isLoading: messagesLoading } = useRecentMessages(3)

  const topNav = [
    {
      title: t('dashboard.topNav.home'),
      href: 'dashboard/overview',
      isActive: true,
      disabled: false,
    },
    {
      title: t('dashboard.topNav.calendar'),
      href: 'dashboard/calendar',
      isActive: false,
      disabled: true,
    },
    {
      title: t('dashboard.topNav.tasks'),
      href: 'dashboard/tasks',
      isActive: false,
      disabled: true,
    },
  ]

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header className="bg-navy shadow-none relative">
        {/* TopNav - Hidden on mobile */}
        <div className="hidden md:block">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        </div>

        {/* Dynamic Island - Hidden on mobile */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 hidden md:block">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-2 md:gap-4'>
          {/* Search - Visible on all screens */}
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder={t('common.search')} className="h-9 w-32 md:w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          {/* Bell - Hidden on mobile */}
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white hidden md:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          {/* Language Switcher - Always visible */}
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          {/* Theme Switch - Hidden on mobile */}
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden md:flex" />
          {/* Config Drawer - Hidden on mobile */}
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden md:flex" />
          {/* Profile Dropdown - Always visible */}
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      {/* ===== Main ===== */}
      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden">

        {/* HERO BANNER */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-start">
              <h1 className="text-3xl font-bold leading-tight">{t('dashboard.hero.greeting')}</h1>
              {heroLoading ? (
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                <p className="text-slate-300 text-lg">
                  {t('dashboard.hero.summary', {
                    sessions: heroStats?.upcomingSessions || 0,
                    tasks: heroStats?.urgentTasks || 0,
                    messages: heroStats?.newMessages || 0
                  })}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0">
                <Plus className="ms-2 h-5 w-5" aria-hidden="true" />
                {t('dashboard.hero.newCase')}
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-11 px-6 font-bold backdrop-blur-md border border-white/10 transition-all duration-300">
                <FileText className="ms-2 h-5 w-5" />
                {t('dashboard.hero.newInvoice')}
              </Button>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : statsError ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="h-10 w-10 mb-3 text-slate-300" />
              <span className="text-sm font-medium">{t('dashboard.stats.noDataAvailable')}</span>
              <span className="text-xs text-slate-500 mt-1">
                {(statsError as any)?.status === 404
                  ? t('dashboard.stats.statsNotFound')
                  : (statsError as any)?.message || t('dashboard.stats.tryLater')}
              </span>
            </div>
          ) : !stats ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="h-10 w-10 mb-3 text-slate-300" />
              <span className="text-sm font-medium">{t('dashboard.stats.noData')}</span>
            </div>
          ) : (
            <>
              {/* Cases */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">{t('dashboard.stats.cases.title')}</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Scale className="h-5 w-5 text-brand-blue" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats?.cases?.total || 0} {t('dashboard.stats.cases.unit')}</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {stats?.cases?.active || 0} {t('dashboard.stats.active')} · {stats?.cases?.closed || 0} {t('dashboard.stats.closed')}
                  </p>
                </CardContent>
              </Card>

              {/* Tasks */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">{t('dashboard.stats.tasks.title')}</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats?.tasks?.total || 0} {t('dashboard.stats.tasks.unit')}</div>
                  <p className="text-xs text-purple-600 flex items-center mt-1 font-bold">
                    <ArrowUpRight className="h-3 w-3 ms-1" />
                    {stats?.tasks?.active || 0} {t('dashboard.stats.active')}
                  </p>
                </CardContent>
              </Card>

              {/* Invoices */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">{t('dashboard.stats.invoices.title')}</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats?.invoices?.total || 0} {t('dashboard.stats.invoices.unit')}</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {stats?.invoices?.paid || 0} {t('dashboard.stats.paid')} · {stats?.invoices?.pending || 0} {t('dashboard.stats.pending')}
                  </p>
                </CardContent>
              </Card>

              {/* Orders */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">{t('dashboard.stats.orders.title')}</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats?.orders?.total || 0} {t('dashboard.stats.orders.unit')}</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {stats?.orders?.completed || 0} {t('dashboard.stats.completed')} · {stats?.orders?.active || 0} {t('dashboard.stats.active')}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Schedule / Calendar */}
            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-navy">{t('dashboard.schedule.title')}</CardTitle>
                  <CardDescription>{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                  {t('dashboard.schedule.viewFullCalendar')}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : !todayEvents || todayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Scale className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">{t('dashboard.schedule.noAppointments')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {todayEvents.map((event) => {
                      const eventTime = event.startDate ? new Date(event.startDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : t('dashboard.schedule.notSpecified')
                      const colorMap = { meeting: 'blue', session: 'green', deadline: 'amber' }
                      const eventColor = colorMap[event.type] || 'blue'
                      return (
                        <Link
                          key={event._id}
                          to="/tasks/$taskId"
                          params={{ taskId: event._id }}
                          className="flex items-center p-6 hover:bg-slate-50/80 transition-colors group cursor-pointer block"
                        >
                          <div className="w-20 font-bold text-slate-600 text-sm">{eventTime}</div>
                          <div className={`w-1.5 h-12 rounded-full bg-${eventColor}-500 me-4 ms-2`}></div>
                          <div className="flex-1">
                            <h4 className="font-bold text-navy text-lg group-hover:text-brand-blue transition-colors">{event.title}</h4>
                            <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> {typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || t('dashboard.schedule.remote'))}</span>
                              <span className={`bg-${eventColor}-50 text-${eventColor}-700 px-2 py-0.5 rounded-md font-bold`}>
                                {event.type === 'session' ? t('dashboard.schedule.eventTypes.session') : event.type === 'meeting' ? t('dashboard.schedule.eventTypes.meeting') : t('dashboard.schedule.eventTypes.deadline')}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-brand-blue">
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jobs & Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-brand-blue" />
                    {t('dashboard.jobs.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-navy">{t('dashboard.jobs.sampleJob.title')}</h4>
                          <p className="text-xs text-slate-500 mt-1">{t('dashboard.jobs.sampleJob.company')}</p>
                        </div>
                        <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">{t('dashboard.jobs.new')}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">{t('dashboard.jobs.partTime')}</span>
                        <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">{t('dashboard.jobs.remote')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full text-brand-blue hover:bg-blue-50 rounded-xl">{t('dashboard.jobs.browseAll')}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    {t('dashboard.training.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <h4 className="font-bold text-navy">{t('dashboard.training.sampleCourse.title')}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t('dashboard.training.sampleCourse.provider')}</p>
                      <div className="mt-3 w-full bg-white rounded-full h-2 overflow-hidden">
                        <div className="bg-purple-500 h-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-purple-600 font-bold mt-2 text-left">{t('dashboard.training.progress', { percent: 75 })}</p>
                    </div>
                    <Button variant="ghost" className="w-full text-purple-600 hover:bg-purple-50 rounded-xl">{t('dashboard.training.continue')}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* LEFT COLUMN (1/3) */}
          <div className="space-y-8">

            {/* Finance Summary */}
            <Card className="rounded-3xl border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  {t('dashboard.finance.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {financialLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : !financialSummary ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <DollarSign className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">{t('dashboard.finance.noData')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-bold">{t('dashboard.finance.revenue')}</p>
                          <p className="font-bold text-navy">{financialSummary.revenue?.toLocaleString('ar-SA') || 0} {t('common.currency')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-xl">
                        <p className="text-xs text-slate-600 font-bold">{t('dashboard.finance.paid')}</p>
                        <p className="font-bold text-green-600">{financialSummary.paidInvoices?.toLocaleString('ar-SA') || 0} {t('common.currency')}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <p className="text-xs text-slate-600 font-bold">{t('dashboard.finance.pending')}</p>
                        <p className="font-bold text-amber-600">{financialSummary.pendingInvoices?.toLocaleString('ar-SA') || 0} {t('common.currency')}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-600">{t('dashboard.finance.netIncome')}</p>
                        <p className="font-bold text-navy text-lg">{financialSummary.netIncome?.toLocaleString('ar-SA') || 0} {t('common.currency')}</p>
                      </div>
                    </div>

                    <Button className="w-full bg-navy text-white hover:bg-navy/90 rounded-xl">{t('dashboard.finance.goToFinance')}</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="rounded-3xl border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  {t('dashboard.messages.title')}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">{t('dashboard.messages.viewAll')}</Button>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : !recentMessages || recentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">{t('dashboard.messages.noMessages')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentMessages.map((chat) => {
                      const username = chat.userID?.username || t('dashboard.messages.defaultUser')
                      const timestamp = new Date(chat.createdAt).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={chat._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border border-slate-100">
                              <AvatarImage src={chat.userID?.image} />
                              <AvatarFallback>{username[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-sm text-navy truncate">{username}</h5>
                              <span className="text-[10px] text-slate-500">{timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{chat.text}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      </Main>
    </>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}