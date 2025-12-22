import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, ListTodo, CheckSquare, Calendar as CalendarIcon, AlertCircle, CalendarRange, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { useDueTodayTasks, useOverdueTasks, useUpcomingTasks } from '@/hooks/useTasks'
import { useReminderStats } from '@/hooks/useRemindersAndEvents'
import type { HeroBannerProps } from '../types'

export const HeroBanner = memo(function HeroBanner({
  t,
  greeting,
  userName,
  heroStats, // Pre-fetched stats from parent - avoids 4 extra API calls when available
}: HeroBannerProps) {
  // OPTIMIZATION: Only fetch data if heroStats not provided from parent
  // This prevents 4 redundant API calls when dashboard summary succeeds
  const shouldFetchOwnData = !heroStats

  const { data: dueTodayTasks } = useDueTodayTasks(shouldFetchOwnData)
  const { data: overdueTasks } = useOverdueTasks(shouldFetchOwnData)
  const { data: upcomingTasks } = useUpcomingTasks(14, shouldFetchOwnData)
  const { data: reminderStats } = useReminderStats({ enabled: shouldFetchOwnData })

  // Calculate counts - use passed heroStats or fallback to fetched data
  const stats = useMemo(() => {
    if (heroStats) {
      return heroStats
    }
    return {
      tasksDueTodayCount: Array.isArray(dueTodayTasks) ? dueTodayTasks.length : 0,
      overdueTasksCount: Array.isArray(overdueTasks) ? overdueTasks.length : 0,
      upcomingEventsCount: Array.isArray(upcomingTasks) ? upcomingTasks.length : 0,
      pendingRemindersCount: reminderStats?.pending || 0,
    }
  }, [heroStats, dueTodayTasks, overdueTasks, upcomingTasks, reminderStats])

  const { tasksDueTodayCount, overdueTasksCount, upcomingEventsCount, pendingRemindersCount } = stats

  return (
    <div className="bg-[#022c22] rounded-3xl p-6 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 min-h-[140px] lg:min-h-[160px] xl:min-h-[180px] max-h-[180px] lg:max-h-[190px] xl:max-h-[220px]">
      {/* Subtle Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(-45deg, #022c22, #064e3b, #022c22, #0f766e)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 20s ease infinite'
          }}
        />
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-wave.png"
          alt=""
          className="w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
      </div>
      {/* Subtle accent glow */}
      <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -me-32 -mt-32 pointer-events-none" />

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
                  {t('dashboard.hero.greeting', { greeting, name: userName })}
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
                <Link to="/dashboard/tasks/events">
                  <CalendarIcon className="ms-2 h-4 w-4" />
                  {t('hero.calendar', 'التقويم')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side: Stats Grid */}
          <div className="xl:col-span-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label={t('hero.stats.todaysTasks', 'مهام اليوم')}
                value={tasksDueTodayCount}
                icon={ListTodo}
                status="normal"
                className="py-3 px-4"
              />
              <StatCard
                label={t('hero.stats.overdue', 'متأخرة')}
                value={overdueTasksCount}
                icon={AlertCircle}
                status={overdueTasksCount > 0 ? "attention" : "zero"}
                className="py-3 px-4"
              />
              <StatCard
                label={t('hero.stats.upcomingEvents', 'أحداث قادمة')}
                value={upcomingEventsCount}
                icon={CalendarRange}
                status="normal"
                className="py-3 px-4"
              />
              <StatCard
                label={t('hero.stats.reminders', 'تذكيرات')}
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
  )
})
