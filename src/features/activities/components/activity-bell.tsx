/**
 * Activity Bell Component
 * Header notification bell for activities
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useActivityStats, useMyActivities } from '@/hooks/useOdooActivities'
import type { OdooActivity } from '@/types/activity'
import { ROUTES } from '@/constants/routes'

interface ActivityBellProps {
  className?: string
}

export function ActivityBell({ className }: ActivityBellProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [open, setOpen] = React.useState(false)

  const { data: stats, isLoading: statsLoading } = useActivityStats()
  const { data: myActivities, isLoading: activitiesLoading } = useMyActivities(
    { state: 'scheduled', limit: 5 },
    open // Only fetch when popover is open
  )

  const totalPending = (stats?.overdue_count || 0) + (stats?.today_count || 0)

  const getActivityStatus = (activity: OdooActivity) => {
    if (activity.is_overdue) return 'overdue'
    const deadline = new Date(activity.date_deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deadline.setHours(0, 0, 0, 0)
    if (deadline.getTime() === today.getTime()) return 'today'
    return 'planned'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
        >
          <Bell className="h-5 w-5" />
          {totalPending > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {totalPending > 99 ? '99+' : totalPending}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">
            {isArabic ? 'الأنشطة' : 'Activities'}
          </h4>
          {!statsLoading && (
            <div className="flex items-center gap-2 text-xs">
              {(stats?.overdue_count || 0) > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  {stats?.overdue_count}
                </span>
              )}
              {(stats?.today_count || 0) > 0 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-3 w-3" />
                  {stats?.today_count}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {!statsLoading && (
          <div className="grid grid-cols-3 gap-2 border-b px-4 py-2 text-center text-xs">
            <div className="text-red-600">
              <p className="font-bold text-lg">{stats?.overdue_count || 0}</p>
              <p className="text-muted-foreground">
                {isArabic ? 'متأخرة' : 'Overdue'}
              </p>
            </div>
            <div className="text-orange-600">
              <p className="font-bold text-lg">{stats?.today_count || 0}</p>
              <p className="text-muted-foreground">
                {isArabic ? 'اليوم' : 'Today'}
              </p>
            </div>
            <div className="text-blue-600">
              <p className="font-bold text-lg">{stats?.planned_count || 0}</p>
              <p className="text-muted-foreground">
                {isArabic ? 'مخططة' : 'Planned'}
              </p>
            </div>
          </div>
        )}

        {/* Activity List */}
        <ScrollArea className="h-64">
          {activitiesLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : myActivities?.activities?.length ? (
            <div className="divide-y">
              {myActivities.activities.map((activity) => {
                const status = getActivityStatus(activity)
                const activityType =
                  typeof activity.activity_type_id === 'object'
                    ? activity.activity_type_id
                    : null

                return (
                  <div
                    key={activity._id}
                    className={cn(
                      'px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer',
                      status === 'overdue' && 'bg-red-50/50 dark:bg-red-950/20',
                      status === 'today' && 'bg-orange-50/50 dark:bg-orange-950/20'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.summary}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activityType && (isArabic ? activityType.nameAr : activityType.name)}
                          {activity.res_name && (
                            <span className="ms-1">• {activity.res_name}</span>
                          )}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'text-xs whitespace-nowrap',
                          status === 'overdue' && 'text-red-600',
                          status === 'today' && 'text-orange-600',
                          status === 'planned' && 'text-muted-foreground'
                        )}
                      >
                        {format(new Date(activity.date_deadline), 'PP', {
                          locale: isArabic ? ar : enUS,
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2" />
              <p className="text-sm">
                {isArabic ? 'لا توجد أنشطة قادمة' : 'No upcoming activities'}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Link to={ROUTES.dashboard.activities}>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm"
              onClick={() => setOpen(false)}
            >
              {isArabic ? 'عرض جميع الأنشطة' : 'View All Activities'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ActivityBell
