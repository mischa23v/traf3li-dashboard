import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  Briefcase,
  Scale,
  DollarSign,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  ChevronLeft,
  TrendingUp,
  Loader2,
  ListTodo,
  CheckSquare,
  Users,
  UserCheck,
  Target,
  Percent,
  Clock,
  Wallet,
  Receipt,
  PiggyBank,
  BarChart3,
  Activity,
  FileText,
  GraduationCap,
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
import { StatCard } from '@/components/stat-card'
import {
  useTodayEvents,
  useFinancialSummary,
  useRecentMessages,
  useMessageStats,
  useCRMStats,
  useFinanceStats,
  useCasesChart,
  useRevenueChart,
  useTasksChart,
  usePendingDocuments,
} from '@/hooks/useDashboard'
import { useTaskStats } from '@/hooks/useTasks'
import { useReminderStats } from '@/hooks/useRemindersAndEvents'
import { useCaseStatisticsFromAPI } from '@/hooks/useCasesAndClients'
import { useAuthStore } from '@/stores/auth-store'

type TabType = 'overview' | 'analytics' | 'reports' | 'notifications'

export function Dashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName
    }
    if (user?.username) {
      return user.username
    }
    return t('common.user', 'مستخدم')
  }

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return t('dashboard.hero.greetingMorning', 'صباح الخير')
    } else if (hour >= 12 && hour < 17) {
      return t('dashboard.hero.greetingAfternoon', 'مساء الخير')
    } else {
      return t('dashboard.hero.greetingEvening', 'مساء الخير')
    }
  }

  // Fetch dashboard data
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents()
  const { data: financialSummary, isLoading: financialLoading } = useFinancialSummary()
  const { data: recentMessages, isLoading: messagesLoading } = useRecentMessages(3)

  // Fetch stats for hero card
  const { data: caseStats } = useCaseStatisticsFromAPI()
  const { data: taskStats } = useTaskStats()
  const { data: messageStats } = useMessageStats()
  const { data: reminderStats } = useReminderStats()

  // Fetch analytics data
  const { data: crmStats, isLoading: crmLoading } = useCRMStats()
  const { data: financeStats, isLoading: financeStatsLoading } = useFinanceStats()

  // Fetch chart data
  const { data: casesChart, isLoading: casesChartLoading } = useCasesChart(12)
  const { data: revenueChart, isLoading: revenueChartLoading } = useRevenueChart(12)
  const { data: tasksChart, isLoading: tasksChartLoading } = useTasksChart(12)

  // Fetch lawyer-focused data
  const { data: pendingDocuments, isLoading: documentsLoading } = usePendingDocuments()

  // Calculate counts for hero stat cards
  const activeCasesCount = caseStats?.active || 0
  const activeTasksCount = (taskStats?.byStatus?.todo || 0) + (taskStats?.byStatus?.in_progress || 0)
  const unreadMessagesCount = messageStats?.unreadMessages || 0
  const pendingRemindersCount = reminderStats?.byStatus?.pending || 0

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

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: t('dashboard.tabs.overview', 'نظرة عامة') },
    { id: 'analytics', label: t('dashboard.tabs.analytics', 'التحليلات') },
    { id: 'reports', label: t('dashboard.tabs.reports', 'التقارير') },
    { id: 'notifications', label: t('dashboard.tabs.notifications', 'الإشعارات') },
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
            <input type="text" placeholder={t('common.search')} className="h-9 w-32 md:w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden">

        {/* HERO BANNER - Visible on all tabs */}
        <div className="bg-[#022c22] rounded-3xl p-6 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20">
          {/* Background Effects */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-wave.png"
              alt=""
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
          </div>
          <div className="absolute top-0 end-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -me-48 -mt-48 pointer-events-none"></div>
          <div className="absolute bottom-0 start-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ms-48 -mb-48 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
              {/* Left Side: Title & Actions */}
              <div className="xl:col-span-4 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-medium">
                    <ListTodo className="w-3 h-3" />
                    <span className="text-white">{t('dashboard.hero.badge', 'لوحة التحكم')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <CheckSquare className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {t('dashboard.hero.greeting', { greeting: getTimeBasedGreeting(), name: getUserDisplayName() })}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
                    <Link to="/dashboard/cases/new">
                      <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                      {t('dashboard.hero.newCase', 'قضية جديدة')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm">
                    <Link to="/dashboard/tasks/new">
                      <ListTodo className="ms-2 h-4 w-4" />
                      {t('dashboard.hero.newTask', 'مهمة جديدة')}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Side: Stats Grid */}
              <div className="xl:col-span-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    label={t('dashboard.hero.stats.cases', 'القضايا')}
                    value={activeCasesCount}
                    icon={Scale}
                    status="normal"
                    className="py-3 px-4"
                  />
                  <StatCard
                    label={t('dashboard.hero.stats.tasks', 'المهام')}
                    value={activeTasksCount}
                    icon={ListTodo}
                    status="normal"
                    className="py-3 px-4"
                  />
                  <StatCard
                    label={t('dashboard.hero.stats.messages', 'الرسائل')}
                    value={unreadMessagesCount}
                    icon={MessageSquare}
                    status={unreadMessagesCount > 0 ? "attention" : "zero"}
                    className="py-3 px-4"
                  />
                  <StatCard
                    label={t('dashboard.hero.stats.reminders', 'التذكيرات')}
                    value={pendingRemindersCount}
                    icon={Bell}
                    status="normal"
                    className="py-3 px-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors relative ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            t={t}
            todayEvents={todayEvents}
            eventsLoading={eventsLoading}
            financialSummary={financialSummary}
            financialLoading={financialLoading}
            recentMessages={recentMessages}
            messagesLoading={messagesLoading}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            t={t}
            crmStats={crmStats}
            crmLoading={crmLoading}
            financeStats={financeStats}
            financeStatsLoading={financeStatsLoading}
            caseStats={caseStats}
            pendingDocuments={pendingDocuments}
            documentsLoading={documentsLoading}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            t={t}
            casesChart={casesChart}
            casesChartLoading={casesChartLoading}
            revenueChart={revenueChart}
            revenueChartLoading={revenueChartLoading}
            tasksChart={tasksChart}
            tasksChartLoading={tasksChartLoading}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab t={t} />
        )}

      </Main>
    </>
  )
}

// ==================== OVERVIEW TAB ====================
interface OverviewTabProps {
  t: (key: string, options?: any) => string
  todayEvents: any
  eventsLoading: boolean
  financialSummary: any
  financialLoading: boolean
  recentMessages: any
  messagesLoading: boolean
}

function OverviewTab({
  t,
  todayEvents,
  eventsLoading,
  financialSummary,
  financialLoading,
  recentMessages,
  messagesLoading,
}: OverviewTabProps) {
  return (
    <>
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
                  {todayEvents.map((event: any) => {
                    const eventTime = event.startDate ? new Date(event.startDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : t('dashboard.schedule.notSpecified')
                    const colorClasses = {
                      meeting: { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
                      session: { bar: 'bg-green-500', badge: 'bg-green-50 text-green-700' },
                      deadline: { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' }
                    }
                    const colors = colorClasses[event.type as keyof typeof colorClasses] || colorClasses.meeting
                    return (
                      <Link
                        key={event._id}
                        to="/tasks/$taskId"
                        params={{ taskId: event._id }}
                        className="flex items-center p-6 hover:bg-slate-50/80 transition-colors group cursor-pointer block"
                      >
                        <div className="w-20 font-bold text-slate-600 text-sm">{eventTime}</div>
                        <div className={`w-1.5 h-12 rounded-full ${colors.bar} me-4 ms-2`}></div>
                        <div className="flex-1">
                          <h4 className="font-bold text-navy text-lg group-hover:text-brand-blue transition-colors">{event.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> {typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || t('dashboard.schedule.remote'))}</span>
                            <span className={`${colors.badge} px-2 py-0.5 rounded-md font-bold`}>
                              {event.type === 'session' ? t('dashboard.schedule.eventTypes.session') : event.type === 'meeting' ? t('dashboard.schedule.eventTypes.meeting') : t('dashboard.schedule.eventTypes.deadline')}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-brand-blue">
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jobs & Training */}
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
                    <p className="text-xs text-purple-600 font-bold mt-2 text-start">{t('dashboard.training.progress', { percent: 75 })}</p>
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
                  {recentMessages.map((chat: any) => {
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
    </>
  )
}

// ==================== ANALYTICS TAB ====================
interface AnalyticsTabProps {
  t: (key: string, options?: any) => string
  crmStats: any
  crmLoading: boolean
  financeStats: any
  financeStatsLoading: boolean
  caseStats: any
  pendingDocuments: any
  documentsLoading: boolean
}

function AnalyticsTab({
  t,
  crmStats,
  crmLoading,
  financeStats,
  financeStatsLoading,
  caseStats,
  pendingDocuments,
  documentsLoading,
}: AnalyticsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* CRM Card */}
      <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            {t('dashboard.analytics.crm', 'إدارة العملاء')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {crmLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-navy" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.totalClients', 'إجمالي العملاء')}</span>
                </div>
                <span className="font-bold text-navy">{crmStats?.totalClients || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.newClients', 'عملاء جدد')}</span>
                </div>
                <span className="font-bold text-green-600">+{crmStats?.newClientsThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.activeLeads', 'العملاء المحتملين')}</span>
                </div>
                <span className="font-bold text-amber-600">{crmStats?.activeLeads || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.conversionRate', 'معدل التحويل')}</span>
                </div>
                <span className="font-bold text-purple-600">{crmStats?.conversionRate || 0}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Documents Card */}
      <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            {t('dashboard.analytics.pendingDocs', 'المستندات المعلقة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-navy" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.awaitingSignature', 'بانتظار التوقيع')}</span>
                </div>
                <span className="font-bold text-amber-600">{pendingDocuments?.counts?.awaitingSignature || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.awaitingReview', 'بانتظار المراجعة')}</span>
                </div>
                <span className="font-bold text-blue-600">{pendingDocuments?.counts?.awaitingReview || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.awaitingClient', 'بانتظار العميل')}</span>
                </div>
                <span className="font-bold text-purple-600">{pendingDocuments?.counts?.awaitingClient || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.totalPending', 'إجمالي المعلق')}</span>
                </div>
                <span className="font-bold text-navy">{pendingDocuments?.total || 0}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finance Card */}
      <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-500" />
            {t('dashboard.analytics.finance', 'المالية')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {financeStatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-navy" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.totalRevenue', 'إجمالي الإيرادات')}</span>
                </div>
                <span className="font-bold text-green-600">{(financeStats?.totalRevenue || 0).toLocaleString('ar-SA')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.expenses', 'المصروفات')}</span>
                </div>
                <span className="font-bold text-red-600">{(financeStats?.expenses || 0).toLocaleString('ar-SA')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.profitMargin', 'هامش الربح')}</span>
                </div>
                <span className="font-bold text-blue-600">{financeStats?.profitMargin || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.pendingInvoices', 'فواتير معلقة')}</span>
                </div>
                <span className="font-bold text-amber-600">{financeStats?.pendingInvoicesCount || 0}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cases Card */}
      <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-500" />
            {t('dashboard.analytics.cases', 'القضايا')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.totalCases', 'إجمالي القضايا')}</span>
              </div>
              <span className="font-bold text-navy">{caseStats?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.activeCases', 'قضايا نشطة')}</span>
              </div>
              <span className="font-bold text-green-600">{caseStats?.active || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.closedCases', 'قضايا مغلقة')}</span>
              </div>
              <span className="font-bold text-blue-600">{caseStats?.closed || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-slate-600">{t('dashboard.analytics.pendingCases', 'قضايا معلقة')}</span>
              </div>
              <span className="font-bold text-purple-600">{caseStats?.pending || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== REPORTS TAB ====================
interface ReportsTabProps {
  t: (key: string, options?: any) => string
  casesChart: any
  casesChartLoading: boolean
  revenueChart: any
  revenueChartLoading: boolean
  tasksChart: any
  tasksChartLoading: boolean
}

function ReportsTab({
  t,
  casesChart,
  casesChartLoading,
  revenueChart,
  revenueChartLoading,
  tasksChart,
  tasksChartLoading,
}: ReportsTabProps) {
  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Chart */}
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              {t('dashboard.reports.casesChart', 'تقرير القضايا')}
            </CardTitle>
            <CardDescription>{t('dashboard.reports.last12Months', 'آخر 12 شهر')}</CardDescription>
          </CardHeader>
          <CardContent>
            {casesChartLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-navy" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Simple Bar Chart Visualization */}
                <div className="flex items-end gap-1 h-40">
                  {casesChart?.data?.slice(-12).map((item: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-amber-500 rounded-t-sm transition-all hover:bg-amber-600"
                        style={{ height: `${Math.max((item.total / Math.max(...(casesChart?.data?.map((d: any) => d.total) || [1]))) * 100, 5)}%` }}
                        title={`${item.label}: ${item.total}`}
                      ></div>
                      <span className="text-[8px] text-slate-500 truncate w-full text-center">{item.label?.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t('dashboard.reports.opened', 'مفتوحة')}</p>
                    <p className="font-bold text-green-600">{casesChart?.data?.reduce((sum: number, item: any) => sum + (item.opened || 0), 0) || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t('dashboard.reports.closed', 'مغلقة')}</p>
                    <p className="font-bold text-blue-600">{casesChart?.data?.reduce((sum: number, item: any) => sum + (item.closed || 0), 0) || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t('dashboard.reports.pending', 'معلقة')}</p>
                    <p className="font-bold text-amber-600">{casesChart?.data?.reduce((sum: number, item: any) => sum + (item.pending || 0), 0) || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t('dashboard.reports.revenueChart', 'تقرير الإيرادات')}
            </CardTitle>
            <CardDescription>{t('dashboard.reports.last12Months', 'آخر 12 شهر')}</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueChartLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-navy" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Simple Bar Chart Visualization */}
                <div className="flex items-end gap-1 h-40">
                  {revenueChart?.data?.slice(-12).map((item: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-green-500 rounded-t-sm transition-all hover:bg-green-600"
                        style={{ height: `${Math.max((item.revenue / Math.max(...(revenueChart?.data?.map((d: any) => d.revenue) || [1]))) * 100, 5)}%` }}
                        title={`${item.label}: ${item.revenue?.toLocaleString('ar-SA')}`}
                      ></div>
                      <span className="text-[8px] text-slate-500 truncate w-full text-center">{item.label?.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t('dashboard.reports.totalRevenue', 'إجمالي الإيرادات')}</p>
                    <p className="font-bold text-green-600">{revenueChart?.summary?.totalRevenue?.toLocaleString('ar-SA') || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t('dashboard.reports.totalExpenses', 'إجمالي المصروفات')}</p>
                    <p className="font-bold text-red-600">{revenueChart?.summary?.totalExpenses?.toLocaleString('ar-SA') || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t('dashboard.reports.profit', 'الربح')}</p>
                    <p className="font-bold text-blue-600">{revenueChart?.summary?.totalProfit?.toLocaleString('ar-SA') || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks Chart - Full Width */}
      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-blue-500" />
            {t('dashboard.reports.tasksChart', 'تقرير المهام')}
          </CardTitle>
          <CardDescription>{t('dashboard.reports.last12Months', 'آخر 12 شهر')}</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksChartLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-navy" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple Bar Chart Visualization */}
              <div className="flex items-end gap-2 h-48">
                {tasksChart?.data?.slice(-12).map((item: any, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '160px' }}>
                      <div
                        className="w-full bg-green-500 rounded-t-sm"
                        style={{ height: `${(item.completed / Math.max(item.total, 1)) * 100}%` }}
                        title={`${t('dashboard.reports.completed', 'مكتملة')}: ${item.completed}`}
                      ></div>
                      <div
                        className="w-full bg-blue-500"
                        style={{ height: `${(item.inProgress / Math.max(item.total, 1)) * 100}%` }}
                        title={`${t('dashboard.reports.inProgress', 'قيد التنفيذ')}: ${item.inProgress}`}
                      ></div>
                      <div
                        className="w-full bg-amber-500"
                        style={{ height: `${(item.pending / Math.max(item.total, 1)) * 100}%` }}
                        title={`${t('dashboard.reports.pending', 'معلقة')}: ${item.pending}`}
                      ></div>
                      <div
                        className="w-full bg-red-500 rounded-b-sm"
                        style={{ height: `${(item.overdue / Math.max(item.total, 1)) * 100}%` }}
                        title={`${t('dashboard.reports.overdue', 'متأخرة')}: ${item.overdue}`}
                      ></div>
                    </div>
                    <span className="text-[9px] text-slate-500 truncate w-full text-center">{item.label?.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              {/* Legend & Summary */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-xs text-slate-600">{t('dashboard.reports.completed', 'مكتملة')} ({tasksChart?.summary?.completed || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="text-xs text-slate-600">{t('dashboard.reports.inProgress', 'قيد التنفيذ')} ({tasksChart?.summary?.inProgress || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                  <span className="text-xs text-slate-600">{t('dashboard.reports.pending', 'معلقة')} ({tasksChart?.summary?.pending || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <span className="text-xs text-slate-600">{t('dashboard.reports.overdue', 'متأخرة')} ({tasksChart?.summary?.overdue || 0})</span>
                </div>
              </div>
              <div className="text-center pt-2">
                <p className="text-sm text-slate-600">
                  {t('dashboard.reports.overallCompletion', 'معدل الإنجاز الإجمالي')}: <span className="font-bold text-green-600">{tasksChart?.summary?.overallCompletionRate || 0}%</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== NOTIFICATIONS TAB ====================
interface NotificationsTabProps {
  t: (key: string, options?: any) => string
}

function NotificationsTab({ t }: NotificationsTabProps) {
  // TODO: Add notifications and activity hooks when backend is ready
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Notifications */}
      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            {t('dashboard.notifications.title', 'الإشعارات')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Bell className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">{t('dashboard.notifications.noNotifications', 'لا توجد إشعارات جديدة')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            {t('dashboard.notifications.activityFeed', 'سجل النشاطات')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Activity className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">{t('dashboard.notifications.noActivity', 'لا توجد نشاطات حديثة')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
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
