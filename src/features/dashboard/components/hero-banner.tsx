import { memo } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, ListTodo, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { Scale, Bell } from 'lucide-react'
import type { HeroBannerProps } from '../types'

export const HeroBanner = memo(function HeroBanner({
  t,
  heroStats,
  greeting,
  userName,
}: HeroBannerProps) {
  return (
    <div className="bg-[#022c22] rounded-3xl p-6 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-wave.png"
          alt=""
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
      </div>
      <div className="absolute top-0 end-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -me-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ms-48 -mb-48 pointer-events-none" />

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
                value={heroStats.activeCasesCount}
                icon={Scale}
                status="normal"
                className="py-3 px-4"
              />
              <StatCard
                label={t('dashboard.hero.stats.tasks', 'المهام')}
                value={heroStats.activeTasksCount}
                icon={ListTodo}
                status="normal"
                className="py-3 px-4"
              />
              <StatCard
                label={t('dashboard.hero.stats.reminders', 'التذكيرات')}
                value={heroStats.pendingRemindersCount}
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
