import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Scale,
  ChevronLeft,
  Loader2,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { OverviewStats } from './overview-stats'
import { OverviewChart } from './overview-chart'
import type { OverviewTabProps, DashboardEvent } from '../types'

export const OverviewTab = memo(function OverviewTab({
  t,
  todayEvents,
  eventsLoading,
  financialSummary,
  financialLoading,
  caseStats,
  upcomingEventsCount = 0,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Stats Row - Shadcn Style */}
      <OverviewStats
        t={t}
        financialSummary={financialSummary}
        caseStats={caseStats}
        upcomingEventsCount={upcomingEventsCount}
        isLoading={financialLoading}
      />

      {/* Main Content Grid - Chart and Schedule */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Chart - Takes 4 columns */}
        <div className="col-span-full lg:col-span-4">
          <OverviewChart t={t} />
        </div>

        {/* Today's Schedule - Takes 3 columns */}
        <div className="col-span-full lg:col-span-3">
          <ScheduleCard
            t={t}
            todayEvents={todayEvents}
            eventsLoading={eventsLoading}
          />
        </div>
      </div>
    </div>
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
    <Card className="rounded-xl border-slate-200 shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900">
            {t('dashboard.schedule.title', "Today's Schedule")}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {new Date().toLocaleDateString('ar-SA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50">
          {t('dashboard.schedule.viewFullCalendar', 'View Calendar')}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !todayEvents || todayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Scale className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">{t('dashboard.schedule.noAppointments', 'No appointments today')}</p>
            <p className="text-xs mt-1 text-slate-400">{t('dashboard.schedule.noAppointmentsHint', 'Your schedule is clear')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
            {todayEvents.slice(0, 5).map((event) => (
              <EventRow key={event._id} event={event} t={t} />
            ))}
            {todayEvents.length > 5 && (
              <div className="p-4 text-center">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                  {t('dashboard.schedule.viewMore', 'View {{count}} more', { count: todayEvents.length - 5 })}
                </Button>
              </div>
            )}
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
      : t('dashboard.schedule.notSpecified', 'Not specified'),
    [event.startDate, t]
  )

  const colors = useMemo(() => {
    const colorClasses = {
      meeting: { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
      session: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
      deadline: { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
    }
    return colorClasses[event.type] || colorClasses.meeting
  }, [event.type])

  const locationDisplay = useMemo(() =>
    typeof event.location === 'string'
      ? event.location
      : (event.location as { name?: string; address?: string })?.name ||
        (event.location as { name?: string; address?: string })?.address ||
        t('dashboard.schedule.remote', 'Remote'),
    [event.location, t]
  )

  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: event._id }}
      className="flex items-center p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
    >
      <div className="w-16 font-semibold text-slate-600 text-sm">{eventTime}</div>
      <div className={`w-1 h-10 rounded-full ${colors.bar} me-3 ms-2`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">
          {event.title}
        </h4>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{locationDisplay}</span>
          </span>
          <span className={`${colors.badge} px-2 py-0.5 rounded-md font-medium flex-shrink-0`}>
            {event.type === 'session'
              ? t('dashboard.schedule.eventTypes.session', 'Session')
              : event.type === 'meeting'
                ? t('dashboard.schedule.eventTypes.meeting', 'Meeting')
                : t('dashboard.schedule.eventTypes.deadline', 'Deadline')}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-emerald-600 flex-shrink-0">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>
    </Link>
  )
})
