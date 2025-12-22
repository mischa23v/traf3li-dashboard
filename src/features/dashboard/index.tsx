import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'

import { PERF_DEBUG, perfLog, perfMark } from '@/lib/perf-debug'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationDropdown } from '@/components/notifications'
import { DynamicIsland } from '@/components/dynamic-island'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  useDashboardSummary,
  useTodayEvents,
  useFinancialSummary,
  useCRMStats,
  useFinanceStats,
  useCasesChart,
  useRevenueChart,
  useTasksChart,
} from '@/hooks/useDashboard'
import { useTaskStats } from '@/hooks/useTasks'
import { useReminderStats } from '@/hooks/useRemindersAndEvents'
import { useCaseStatisticsFromAPI } from '@/hooks/useCasesAndClients'
import { useAuthStore } from '@/stores/auth-store'
import { getLocalizedFirstName } from '@/lib/arabic-names'

import { HeroBanner } from './components/hero-banner'
import { OverviewTab } from './components/overview-tab'
import { AnalyticsTab } from './components/analytics-tab'
import { ReportsTab } from './components/reports-tab'
import { NotificationsTab } from './components/notifications-tab'
import type { TabType, HeroStats } from './types'

export function Dashboard() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Performance profiling - only in dev mode
  const renderCount = useRef(0)
  const mountTime = useRef(performance.now())

  useEffect(() => {
    if (PERF_DEBUG) {
      perfMark('dashboard-mount')
      perfLog('Dashboard MOUNTED', { renderCount: renderCount.current })
      return () => perfLog('Dashboard UNMOUNTED')
    }
  }, [])

  if (PERF_DEBUG) {
    renderCount.current++
    if (renderCount.current <= 5) {
      perfLog(`Dashboard RENDER #${renderCount.current}`, {
        timeSinceMount: (performance.now() - mountTime.current).toFixed(2) + 'ms',
      })
    }
  }

  // User display helpers
  const getUserDisplayName = useCallback(() => {
    const locale = i18n.language
    const localizedName = getLocalizedFirstName(user?.firstName, user?.firstNameAr, locale)
    if (localizedName) return localizedName
    if (user?.username) return user.username
    return t('common.user', 'مستخدم')
  }, [i18n.language, user?.firstName, user?.firstNameAr, user?.username, t])

  const getTimeBasedGreeting = useCallback(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return t('dashboard.hero.greetingMorning', 'صباح الخير')
    if (hour >= 12 && hour < 17) return t('dashboard.hero.greetingAfternoon', 'مساء الخير')
    return t('dashboard.hero.greetingEvening', 'مساء الخير')
  }, [t])

  // Tab states
  const isOverviewTab = activeTab === 'overview'
  const isAnalyticsTab = activeTab === 'analytics'
  const isReportsTab = activeTab === 'reports'

  // Data fetching - Gold Standard single API call
  const { data: dashboardSummary, isLoading: summaryLoading, isError: summaryError } = useDashboardSummary()

  // OPTIMIZATION: Only enable fallback hooks when primary API fails
  // This prevents duplicate API calls when summary succeeds
  const useFallbackHooks = summaryError || (!summaryLoading && !dashboardSummary)

  // Fallback hooks - CONDITIONALLY ENABLED to reduce unnecessary API calls
  const { data: caseStatsFallback } = useCaseStatisticsFromAPI(useFallbackHooks)
  const { data: taskStatsFallback } = useTaskStats(useFallbackHooks)
  const { data: reminderStatsFallback } = useReminderStats({ enabled: useFallbackHooks })

  // Overview tab data - Only fetch when fallback is needed AND on overview tab
  const shouldLoadOverviewFallback = useFallbackHooks && isOverviewTab
  const { data: todayEventsFallback, isLoading: eventsLoadingFallback } = useTodayEvents(shouldLoadOverviewFallback)
  const { data: financialSummaryFallback, isLoading: financialLoadingFallback } = useFinancialSummary(shouldLoadOverviewFallback)

  // Resolve data - prefer summary, fallback only when needed
  const caseStats = dashboardSummary?.caseStats || caseStatsFallback
  const taskStats = dashboardSummary?.taskStats || taskStatsFallback
  const reminderStats = dashboardSummary?.reminderStats || reminderStatsFallback
  const todayEvents = dashboardSummary?.todayEvents || todayEventsFallback
  const financialSummary = dashboardSummary?.financialSummary || financialSummaryFallback

  const eventsLoading = summaryLoading || (useFallbackHooks && eventsLoadingFallback)
  const financialLoading = summaryLoading || (useFallbackHooks && financialLoadingFallback)

  // Memoized hero stats from dashboard summary to avoid extra API calls in HeroBanner
  const heroStats: HeroStats | undefined = useMemo(() => {
    if (!taskStats || !reminderStats) return undefined
    return {
      tasksDueTodayCount: taskStats.byStatus?.todo || 0,
      overdueTasksCount: taskStats.byStatus?.in_progress || 0, // Map to available data
      upcomingEventsCount: todayEvents?.length || 0,
      pendingRemindersCount: reminderStats.byStatus?.pending || 0,
    }
  }, [taskStats, reminderStats, todayEvents])

  // Analytics tab data
  const { data: crmStats, isLoading: crmLoading } = useCRMStats(isAnalyticsTab)
  const { data: financeStats, isLoading: financeStatsLoading } = useFinanceStats(isAnalyticsTab)

  // Reports tab data
  const { data: casesChart, isLoading: casesChartLoading } = useCasesChart(12, isReportsTab)
  const { data: revenueChart, isLoading: revenueChartLoading } = useRevenueChart(12, isReportsTab)
  const { data: tasksChart, isLoading: tasksChartLoading } = useTasksChart(12, isReportsTab)

  const topNav = useMemo(
    () => [
      { title: t('dashboard.topNav.home'), href: 'dashboard/overview', isActive: true, disabled: false },
      { title: t('dashboard.topNav.calendar'), href: 'dashboard/calendar', isActive: false, disabled: true },
      { title: t('dashboard.topNav.tasks'), href: 'dashboard/tasks', isActive: false, disabled: true },
    ],
    [t]
  )

  const tabs = useMemo<{ id: TabType; label: string }[]>(
    () => [
      { id: 'overview', label: t('dashboard.tabs.overview', 'نظرة عامة') },
      { id: 'analytics', label: t('dashboard.tabs.analytics', 'التحليلات') },
      { id: 'reports', label: t('dashboard.tabs.reports', 'التقارير') },
      { id: 'notifications', label: t('dashboard.tabs.notifications', 'الإشعارات') },
    ],
    [t]
  )

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <div className="hidden md:block">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 hidden md:block">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 md:gap-4">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="h-9 w-32 md:w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="hidden md:block">
            <NotificationDropdown className="rounded-full text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden md:flex" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden md:flex" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>

        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      </Header>

      {/* Main Content */}
      <Main fluid className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden">
        {/* Hero Banner - pass pre-fetched stats to avoid extra API calls */}
        <HeroBanner t={t} greeting={getTimeBasedGreeting()} userName={getUserDisplayName()} heroStats={heroStats} />

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

        {activeTab === 'notifications' && <NotificationsTab t={t} />}
      </Main>
    </>
  )
}
