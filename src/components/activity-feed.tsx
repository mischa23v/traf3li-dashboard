/**
 * ActivityFeed Component
 * Displays a list of activities for tasks, events, reminders, etc.
 */

import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  Play,
  Pause,
  Bell,
  Calendar,
  UserPlus,
  RefreshCw,
  Flag,
  Trash2,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useTaskActivities,
  useEventActivities,
  useReminderActivities,
  type Activity,
  type ActivityType,
  type ActivityEntityType,
} from '@/hooks/useActivities'
import { formatActivityMessage } from '@/services/activityService'

// ==================== TYPES ====================

interface ActivityFeedProps {
  entityType: ActivityEntityType
  entityId: string
  limit?: number
  className?: string
  showTitle?: boolean
  maxHeight?: string | number
}

// ==================== ICON MAPPING ====================

const activityIcons: Record<ActivityType, React.ElementType> = {
  task_created: Plus,
  task_updated: RefreshCw,
  task_completed: CheckCircle,
  task_reopened: RefreshCw,
  task_deleted: Trash2,
  task_assigned: UserPlus,
  task_status_changed: Circle,
  task_priority_changed: Flag,
  subtask_added: Plus,
  subtask_completed: CheckCircle,
  comment_added: MessageSquare,
  attachment_added: Paperclip,
  attachment_deleted: Trash2,
  event_created: Calendar,
  event_updated: RefreshCw,
  event_cancelled: X,
  event_rescheduled: Calendar,
  reminder_created: Bell,
  reminder_triggered: Bell,
  reminder_snoozed: Clock,
  reminder_completed: CheckCircle,
  reminder_dismissed: X,
  time_tracking_started: Play,
  time_tracking_stopped: Pause,
}

const activityColors: Record<ActivityType, string> = {
  task_created: 'text-emerald-500 bg-emerald-50',
  task_updated: 'text-blue-500 bg-blue-50',
  task_completed: 'text-green-500 bg-green-50',
  task_reopened: 'text-amber-500 bg-amber-50',
  task_deleted: 'text-red-500 bg-red-50',
  task_assigned: 'text-purple-500 bg-purple-50',
  task_status_changed: 'text-blue-500 bg-blue-50',
  task_priority_changed: 'text-orange-500 bg-orange-50',
  subtask_added: 'text-indigo-500 bg-indigo-50',
  subtask_completed: 'text-green-500 bg-green-50',
  comment_added: 'text-cyan-500 bg-cyan-50',
  attachment_added: 'text-violet-500 bg-violet-50',
  attachment_deleted: 'text-red-500 bg-red-50',
  event_created: 'text-emerald-500 bg-emerald-50',
  event_updated: 'text-blue-500 bg-blue-50',
  event_cancelled: 'text-red-500 bg-red-50',
  event_rescheduled: 'text-amber-500 bg-amber-50',
  reminder_created: 'text-yellow-500 bg-yellow-50',
  reminder_triggered: 'text-yellow-500 bg-yellow-50',
  reminder_snoozed: 'text-gray-500 bg-gray-50',
  reminder_completed: 'text-green-500 bg-green-50',
  reminder_dismissed: 'text-gray-500 bg-gray-50',
  time_tracking_started: 'text-blue-500 bg-blue-50',
  time_tracking_stopped: 'text-slate-500 bg-slate-50',
}

// ==================== ACTIVITY ITEM ====================

interface ActivityItemProps {
  activity: Activity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const { i18n } = useTranslation()
  const Icon = activityIcons[activity.type] || Circle
  const colorClass = activityColors[activity.type] || 'text-gray-500 bg-gray-50'
  const dateLocale = i18n.language === 'ar' ? ar : enUS

  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center', colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm text-slate-700">{formatActivityMessage(activity, i18n.language)}</p>
            {activity.entityTitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{activity.entityTitle}</p>
            )}
          </div>
          {activity.userName && (
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={activity.userAvatar} alt={activity.userName} />
              <AvatarFallback className="text-xs">
                {activity.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
            locale: dateLocale,
          })}
        </p>
      </div>
    </div>
  )
}

// ==================== LOADING SKELETON ====================

function ActivitySkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function ActivityFeed({
  entityType,
  entityId,
  limit = 50,
  className,
  showTitle = true,
  maxHeight = 400,
}: ActivityFeedProps) {
  const { t } = useTranslation()

  // Use the appropriate hook based on entity type
  const taskQuery = useTaskActivities(entityType === 'task' ? entityId : '', limit)
  const eventQuery = useEventActivities(entityType === 'event' ? entityId : '', limit)
  const reminderQuery = useReminderActivities(entityType === 'reminder' ? entityId : '', limit)

  const query = entityType === 'task' ? taskQuery : entityType === 'event' ? eventQuery : reminderQuery
  const { data: activities = [], isLoading, isError } = query

  const getTitle = () => {
    switch (entityType) {
      case 'task':
        return t('activityFeed.taskLog')
      case 'event':
        return t('activityFeed.eventLog')
      case 'reminder':
        return t('activityFeed.reminderLog')
      default:
        return t('activityFeed.activities')
    }
  }

  return (
    <div className={cn('', className)}>
      {showTitle && (
        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          {getTitle()}
        </h3>
      )}

      <ScrollArea
        className="rounded-lg border border-slate-100 bg-slate-50/50"
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        <div className="p-3">
          {isLoading ? (
            <>
              <ActivitySkeleton />
              <ActivitySkeleton />
              <ActivitySkeleton />
            </>
          ) : isError ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              {t('activityFeed.loadError')}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              {t('activityFeed.noActivities')}
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ==================== STANDALONE EXPORTS ====================

export { ActivityItem, ActivitySkeleton }
export type { ActivityFeedProps, ActivityItemProps }
