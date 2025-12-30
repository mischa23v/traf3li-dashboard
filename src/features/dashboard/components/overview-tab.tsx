import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Scale,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  ChevronLeft,
  TrendingUp,
  Loader2,
  GraduationCap,
  MapPin,
  Bell,
  FileText,
  Calendar,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import type { OverviewTabProps, DashboardEvent } from '../types'

export const OverviewTab = memo(function OverviewTab({
  t,
  todayEvents,
  eventsLoading,
  financialSummary,
  financialLoading,
}: OverviewTabProps) {
  return (
    <>
      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RIGHT COLUMN (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Schedule / Calendar */}
          <ScheduleCard
            t={t}
            todayEvents={todayEvents}
            eventsLoading={eventsLoading}
          />

          {/* Jobs & Training */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <JobsCard t={t} />
            <TrainingCard t={t} />
          </div>
        </div>

        {/* LEFT COLUMN (1/3) */}
        <div className="flex flex-col gap-8">
          {/* Finance Summary */}
          <FinanceSummaryCard
            t={t}
            financialSummary={financialSummary}
            financialLoading={financialLoading}
          />
          {/* Quick Actions */}
          <QuickActionsCard t={t} />
        </div>
      </div>
    </>
  )
})

// ==================== SUB-COMPONENTS ====================

interface ScheduleCardProps {
  t: OverviewTabProps['t']
  todayEvents: DashboardEvent[] | undefined
  eventsLoading: boolean
}

const ScheduleCard = memo(function ScheduleCard({
  t,
  todayEvents,
  eventsLoading,
}: ScheduleCardProps) {
  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-navy">
            {t('dashboard.schedule.title')}
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('ar-SA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </CardDescription>
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
            {todayEvents.map((event) => (
              <EventRow key={event._id} event={event} t={t} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface EventRowProps {
  event: DashboardEvent
  t: OverviewTabProps['t']
}

const EventRow = memo(function EventRow({ event, t }: EventRowProps) {
  const eventTime = useMemo(() =>
    event.startDate
      ? new Date(event.startDate).toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : t('dashboard.schedule.notSpecified'),
    [event.startDate, t]
  )

  const colors = useMemo(() => {
    const colorClasses = {
      meeting: { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
      session: { bar: 'bg-green-500', badge: 'bg-green-50 text-green-700' },
      deadline: { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
    }
    return colorClasses[event.type] || colorClasses.meeting
  }, [event.type])

  const locationDisplay = useMemo(() =>
    typeof event.location === 'string'
      ? event.location
      : (event.location as { name?: string; address?: string })?.name ||
        (event.location as { name?: string; address?: string })?.address ||
        t('dashboard.schedule.remote'),
    [event.location, t]
  )

  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: event._id }}
      className="flex items-center p-6 hover:bg-slate-50/80 transition-colors group cursor-pointer block"
    >
      <div className="w-20 font-bold text-slate-600 text-sm">{eventTime}</div>
      <div className={`w-1.5 h-12 rounded-full ${colors.bar} me-4 ms-2`} />
      <div className="flex-1">
        <h4 className="font-bold text-navy text-lg group-hover:text-brand-blue transition-colors">
          {event.title}
        </h4>
        <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {locationDisplay}
          </span>
          <span className={`${colors.badge} px-2 py-0.5 rounded-md font-bold`}>
            {event.type === 'session'
              ? t('dashboard.schedule.eventTypes.session')
              : event.type === 'meeting'
                ? t('dashboard.schedule.eventTypes.meeting')
                : t('dashboard.schedule.eventTypes.deadline')}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-brand-blue">
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </Button>
    </Link>
  )
})

interface JobsCardProps {
  t: OverviewTabProps['t']
}

const JobsCard = memo(function JobsCard({ t }: JobsCardProps) {
  return (
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
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                {t('dashboard.jobs.new')}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">
                {t('dashboard.jobs.partTime')}
              </span>
              <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">
                {t('dashboard.jobs.remote')}
              </span>
            </div>
          </div>
          <Button variant="ghost" className="w-full text-brand-blue hover:bg-blue-50 rounded-xl">
            {t('dashboard.jobs.browseAll')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

interface TrainingCardProps {
  t: OverviewTabProps['t']
}

const TrainingCard = memo(function TrainingCard({ t }: TrainingCardProps) {
  return (
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
              <div className="bg-purple-500 h-full w-3/4" />
            </div>
            <p className="text-xs text-purple-600 font-bold mt-2 text-start">
              {t('dashboard.training.progress', { percent: 75 })}
            </p>
          </div>
          <Button variant="ghost" className="w-full text-purple-600 hover:bg-purple-50 rounded-xl">
            {t('dashboard.training.continue')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

interface FinanceSummaryCardProps {
  t: OverviewTabProps['t']
  financialSummary: OverviewTabProps['financialSummary']
  financialLoading: boolean
}

const FinanceSummaryCard = memo(function FinanceSummaryCard({
  t,
  financialSummary,
  financialLoading,
}: FinanceSummaryCardProps) {
  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm">
      <CardHeader className="pb-2">
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
          <div className="space-y-4">
            {/* Revenue/Collections - Main stat */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600 font-medium">{t('dashboard.finance.revenue')}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy">
                  {financialSummary.totalRevenue?.toLocaleString('ar-SA') || 0}
                </span>
                <span className="text-sm text-slate-500">{t('common.currency')}</span>
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                </div>
              </div>
            </div>

            {/* Pending & Overdue - Side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-slate-500 mb-1">{t('dashboard.finance.pending')}</p>
                <p className="font-bold text-amber-600 text-sm">
                  {financialSummary.pendingAmount?.toLocaleString('ar-SA') || 0}
                  <span className="text-xs text-amber-500 ms-1">{t('common.currency')}</span>
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-slate-500 mb-1">{t('dashboard.finance.overdue', 'متأخرة')}</p>
                <p className="font-bold text-red-600 text-sm">
                  {financialSummary.overdueAmount?.toLocaleString('ar-SA') || 0}
                  <span className="text-xs text-red-500 ms-1">{t('common.currency')}</span>
                </p>
              </div>
            </div>

            {/* Expenses */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600 font-medium">{t('dashboard.finance.expenses', 'المصروفات')}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy">
                  {financialSummary.totalExpenses?.toLocaleString('ar-SA') || 0}
                </span>
                <span className="text-sm text-slate-500">{t('common.currency')}</span>
              </div>
            </div>

            <Button className="w-full bg-navy text-white hover:bg-navy/90 rounded-xl h-10">
              {t('dashboard.finance.goToFinance')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface QuickActionsCardProps {
  t: OverviewTabProps['t']
}

const QuickActionsCard = memo(function QuickActionsCard({ t }: QuickActionsCardProps) {
  const quickActions = [
    {
      icon: Plus,
      label: t('dashboard.quickActions.newCase', 'قضية جديدة'),
      href: '/cases/new',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      icon: Calendar,
      label: t('dashboard.quickActions.newAppointment', 'موعد جديد'),
      href: '/tasks/new',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      icon: FileText,
      label: t('dashboard.quickActions.newDocument', 'مستند جديد'),
      href: '/documents/new',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      icon: Bell,
      label: t('dashboard.quickActions.notifications', 'الإشعارات'),
      href: '/notifications',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
    },
  ]

  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <Plus className="h-5 w-5 text-brand-blue" />
          {t('dashboard.quickActions.title', 'إجراءات سريعة')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className={`flex flex-col items-center justify-center p-4 rounded-xl ${action.bgColor} transition-colors`}
            >
              <action.icon className={`h-6 w-6 ${action.color} mb-2`} />
              <span className="text-xs font-medium text-slate-700 text-center">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
